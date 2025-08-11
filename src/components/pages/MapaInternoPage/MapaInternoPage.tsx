"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  getFirestore, collection, getDocs, query, where, orderBy, limit
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import { InternalPageLayout } from "@/components/layouts/InternalPageLayout";

const db = getFirestore(app);

type Nodo = { node: string; x: number; y: number; nivel: number; };
type PuntoInteres = { node: string; name: string; x: number; y: number; nivel: number; };
type Vector = {
  origen: string; destino: string; distancia: number;
  nivel?: number; nivel_origen?: number; nivel_destino?: number; tipo?: string;
  grillaId?: string; edificio?: string;
};

// === util: normalizar links de Google Drive (mismo criterio que el editor) ===
function extractDriveId(url: string): string | null {
  if (!url) return null;
  let m = url.match(/\/file\/d\/([^/]+)/); if (m) return m[1];
  m = url.match(/[?&]id=([^&]+)/);        if (m) return m[1];
  return null;
}
function driveDirect(url: string, size?: number) {
  const id = extractDriveId(url);
  if (!id) return url;
  return size
    ? `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`
    : `https://drive.google.com/uc?export=view&id=${id}`;
}

export default function MapaInternoPage() {
  // Refs simples (dos niveles típicos; si tenés más, podés ampliar con un map por nivel)
  const img0Ref = useRef<HTMLImageElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);
  const canvas0Ref = useRef<HTMLCanvasElement>(null);
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const arrow0Ref = useRef<HTMLDivElement>(null);
  const arrow1Ref = useRef<HTMLDivElement>(null);

  const animArrowLoopRef = useRef<{ [nivel: number]: { stop: boolean } }>({ 0: { stop: false }, 1: { stop: false } });

  // Estado
  const [edificios, setEdificios] = useState<Array<{id:string; nombre:string; planos:Record<string,string>}>>([]);
  const [edificioSel, setEdificioSel] = useState<string>("");
  const [planos, setPlanos] = useState<Record<number,string>>({});
  const [puntosInteres, setPuntosInteres] = useState<PuntoInteres[]>([]);
  const [todosLosNodos, setTodosLosNodos] = useState<Nodo[]>([]);
  const [vectores, setVectores] = useState<Vector[]>([]);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [result, setResult] = useState<React.ReactNode>(null);
  const [nivelesVisibles, setNivelesVisibles] = useState<number[]>([]); // ⛔️ arranca vacío

  // Paths para redibujar
  const ultimoPathNivel0 = useRef<string[]>([]);
  const ultimoPathNivel1 = useRef<string[]>([]);

  // === Cargar edificios (lee planos como objeto)
  useEffect(() => {
    async function cargarEdificios() {
      const snap = await getDocs(collection(db, "edificios"));
      const arr: any[] = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      const norm = arr.map(e => ({
        id: e.id,
        nombre: e.nombre || e.id,
        planos: (e.planos ?? {}) as Record<string,string>
      }));
      // ordenar por nombre para UX
      norm.sort((a,b)=>a.nombre.localeCompare(b.nombre));
      setEdificios(norm);
      if (norm.length > 0) setEdificioSel(norm[0].nombre);
    }
    cargarEdificios();
  }, []);

  // === Cuando cambia edificio: normalizar URLs, obtener última capa por nivel y cargar datos
  useEffect(() => {
    if (!edificioSel) return;
    (async () => {
      const edificio = edificios.find(e => e.nombre === edificioSel);
      if (!edificio) return;

      // 1) Planos (objeto -> record<number,string>) normalizado de Drive
      const niveles = Object.keys(edificio.planos)
        .map(n => parseInt(n)).filter(Number.isFinite).sort((a,b)=>a-b);

      const planosNorm: Record<number,string> = {};
      for (const n of niveles) {
        planosNorm[n] = driveDirect(edificio.planos[String(n)], 1000);
      }
      setPlanos(planosNorm);

      // 2) Para cada nivel: buscar última grillaId y traer nodos/poi/vectores de esa grilla
      const allNodos: Nodo[] = [];
      const allPois: PuntoInteres[] = [];
      const allVecs: Vector[] = [];

      for (const nivel of niveles) {
        const qLast = query(
          collection(db, "grillas_nodos"),
          where("edificio", "==", edificioSel),
          where("nivel", "==", nivel),
          orderBy("grillaId", "desc"),
          limit(1)
        );
        const lastSnap = await getDocs(qLast);
        const grillaId = lastSnap.docs.length ? lastSnap.docs[0].data().grillaId : null;
        if (!grillaId) continue;

        // Nodos
        const qN = query(
          collection(db, "grillas_nodos"),
          where("edificio", "==", edificioSel),
          where("grillaId", "==", grillaId)
        );
        const nSnap = await getDocs(qN);
        nSnap.forEach(d => {
          const data = d.data() as any;
          allNodos.push({ node: data.node, x: data.x, y: data.y, nivel });
        });

        // POIs
        const qP = query(
          collection(db, "grillas_interes"),
          where("edificio", "==", edificioSel),
          where("grillaId", "==", grillaId)
        );
        const pSnap = await getDocs(qP);
        pSnap.forEach(d => {
          const data = d.data() as any;
          allPois.push({ node: data.node, name: data.name, x: data.x, y: data.y, nivel });
        });

        // Vectores (caminos + escaleras guardadas en esa grilla)
        const qV = query(
          collection(db, "vectores"),
          where("edificio", "==", edificioSel),
          where("grillaId", "==", grillaId)
        );
        const vSnap = await getDocs(qV);
        vSnap.forEach(d => allVecs.push(d.data() as Vector));
      }

      setTodosLosNodos(allNodos);
      setPuntosInteres(allPois);
      setVectores(allVecs);

      // 3) Reset UI: ⛔️ no mostrar planos todavía
      setStart(""); setEnd(""); setResult(null);
      ultimoPathNivel0.current = [];
      ultimoPathNivel1.current = [];
      setNivelesVisibles([]); // ← clave para no renderizar planos
      // No redibujo nada porque no hay planos visibles hasta calcular ruta
    })();
    // eslint-disable-next-line
  }, [edificioSel, edificios]);

  // === util dibujo/posicionado ===
  function resizeCanvasToImg(img: HTMLImageElement | null, canvas: HTMLCanvasElement | null) {
    if (!img || !canvas) return;
    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;
    canvas.style.width = img.offsetWidth + "px";
    canvas.style.height = img.offsetHeight + "px";
  }

  function drawBaseNivel(nivel: number, pathNodes: string[]) {
    const canvas = nivel === 0 ? canvas0Ref.current : canvas1Ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pathNodes.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 6;
      ctx.beginPath();
      let first = true;
      for (const nodeId of pathNodes) {
        const p = todosLosNodos.find(u => u.node === nodeId && u.nivel === nivel);
        if (!p) continue;
        const px = p.x * canvas.width;
        const py = p.y * canvas.height;
        if (first) { ctx.moveTo(px, py); first = false; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Dijkstra multi‑nivel
  function dijkstra(graph: any, start: string, end: string): string[] {
    const dist: any = {}, prev: any = {}, visited = new Set<string>();
    const nodes = Object.keys(graph);
    nodes.forEach(n => dist[n] = Infinity);
    dist[start] = 0;
    const queue = new Set(nodes);
    while (queue.size) {
      let u: string | null = null, min = Infinity;
      queue.forEach(n => { if (dist[n] < min) { min = dist[n]; u = n; } });
      if (!u || u === end || min === Infinity) break;
      queue.delete(u);
      visited.add(u);
      (graph[u] || []).forEach((neigh: any) => {
        if (visited.has(neigh.node)) return;
        const alt = dist[u] + neigh.distancia;
        if (alt < dist[neigh.node]) { dist[neigh.node] = alt; prev[neigh.node] = u; }
      });
    }
    const path: string[] = [];
    for (let at = end; at !== undefined; at = prev[at]) path.unshift(at);
    return path;
  }

  function animarFlechaEnLoop(nivel: number, pathNodes: string[]) {
    animArrowLoopRef.current[nivel].stop = true;
    setTimeout(() => {
      animArrowLoopRef.current[nivel].stop = false;
      const flechaRef = nivel === 0 ? arrow0Ref.current : arrow1Ref.current;
      const canvas = nivel === 0 ? canvas0Ref.current : canvas1Ref.current;
      if (!flechaRef || !canvas || !pathNodes.length) return;
      const puntos = pathNodes.map(nodo => {
        const u = todosLosNodos.find(u => u.node === nodo && u.nivel === nivel);
        return u ? [u.x, u.y] : null;
      }).filter(Boolean) as [number, number][];
      if (puntos.length < 2) { flechaRef.style.display = "none"; return; }
      flechaRef.style.display = "block";
      let segment = 0, t = 0, duration = 1100;
      function step() {
        if (animArrowLoopRef.current[nivel].stop) { flechaRef.style.display = "none"; return; }
        const [x1, y1] = puntos[segment];
        const [x2, y2] = puntos[(segment + 1) % puntos.length];
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        const angleRad = Math.atan2(y2 - y1, x2 - x1);
        ubicarFlecha(flechaRef, cx, cy, angleRad);
        if (t < 1) { t += 1 / (duration / 16); requestAnimationFrame(step); }
        else { segment = (segment + 1) % (puntos.length - 1); t = 0; requestAnimationFrame(step); }
      }
      step();
    }, 20);
  }

  // Posicionamiento proporcional + microajuste
  function ubicarFlecha(flecha: HTMLDivElement | null, x: number, y: number, angleRad: number) {
    if (!flecha) return;
    const offset = 8;
    const ox = Math.cos(angleRad) * offset;
    const oy = Math.sin(angleRad) * offset;
    flecha.style.position = "absolute";
    flecha.style.left = `calc(${x * 100}% + ${ox}px)`;
    flecha.style.top  = `calc(${y * 100}% + ${oy}px)`;
    flecha.style.transform = `translate(-50%, -50%) rotate(${angleRad + Math.PI / 2}rad)`;
    flecha.style.display = "block";
  }

  function redibujarRutasSiHay() {
    resizeCanvasToImg(img0Ref.current, canvas0Ref.current);
    resizeCanvasToImg(img1Ref.current, canvas1Ref.current);
    drawBaseNivel(0, ultimoPathNivel0.current || []);
    drawBaseNivel(1, ultimoPathNivel1.current || []);
  }

  function resetearVistaDeRuta() {
    setResult(null);
    animArrowLoopRef.current[0].stop = true;
    animArrowLoopRef.current[1].stop = true;
    if (arrow0Ref.current) arrow0Ref.current.style.display = "none";
    if (arrow1Ref.current) arrow1Ref.current.style.display = "none";
    ultimoPathNivel0.current = [];
    ultimoPathNivel1.current = [];
    drawBaseNivel(0, []); drawBaseNivel(1, []);
    setNivelesVisibles([]); // ⛔️ mantener vacía hasta calcular
  }

  // === Calcular ruta (recién acá mostramos planos) ===
  async function calcularRuta() {
    resetearVistaDeRuta();
    if (!start || !end || start === end) {
      alert("Seleccioná un origen y destino distintos");
      return;
    }
    const [startNode, nivelStart] = start.split("|");
    const [endNode,   nivelEnd]   = end.split("|");

    // Grafo usando última capa por nivel (ya cargada) y escaleras con nivel_origen/destino
    const graph: any = {};
    todosLosNodos.forEach(n => graph[`${n.node}|${n.nivel}`] = []);
    vectores.forEach(v => {
      const n0 = todosLosNodos.find(n => n.node === v.origen && (n.nivel === (v.nivel_origen ?? v.nivel)));
      const n1 = todosLosNodos.find(n => n.node === v.destino && (n.nivel === (v.nivel_destino ?? v.nivel)));
      if (n0 && n1) {
        graph[`${n0.node}|${n0.nivel}`].push({ node: `${n1.node}|${n1.nivel}`, distancia: v.distancia });
        graph[`${n1.node}|${n1.nivel}`].push({ node: `${n0.node}|${n0.nivel}`, distancia: v.distancia });
      }
    });

    const path = dijkstra(graph, `${startNode}|${nivelStart}`, `${endNode}|${nivelEnd}`);
    if (path.length < 2) {
      setResult(<span className="text-red-600">No hay ruta posible.</span>);
      setNivelesVisibles([]); // sigue sin mostrar planos
      return;
    }

    // Niveles únicos en orden de aparición, con el nivel de origen primero
    const nivelStartNum = +nivelStart;
    const nivelesEnRuta: number[] = [];
    for (const step of path) {
      const n = +step.split("|")[1];
      if (!Number.isFinite(n)) continue;
      if (!nivelesEnRuta.includes(n)) nivelesEnRuta.push(n);
    }
    const orderedNiveles = [nivelStartNum, ...nivelesEnRuta.filter(n => n !== nivelStartNum)];
    setNivelesVisibles(orderedNiveles); // ✅ ahora sí mostramos SOLO los niveles implicados

    // Separar tramos por nivel y dibujar
    const pathNivel0: string[] = [];
    const pathNivel1: string[] = [];
    for (const step of path) {
      const [node, n] = step.split("|");
      if (+n === 0) pathNivel0.push(node);
      if (+n === 1) pathNivel1.push(node);
    }
    ultimoPathNivel0.current = pathNivel0;
    ultimoPathNivel1.current = pathNivel1;

    drawBaseNivel(0, pathNivel0);
    drawBaseNivel(1, pathNivel1);
    if (pathNivel0.length > 1) animarFlechaEnLoop(0, pathNivel0);
    if (pathNivel1.length > 1) animarFlechaEnLoop(1, pathNivel1);
  }

  function onImgLoad(nivel: number) {
    resizeCanvasToImg(
      nivel === 0 ? img0Ref.current : img1Ref.current,
      nivel === 0 ? canvas0Ref.current : canvas1Ref.current
    );
    drawBaseNivel(nivel, nivel === 0 ? ultimoPathNivel0.current : ultimoPathNivel1.current);
  }

  return (
    <InternalPageLayout>
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">¿A dónde querés ir?</h2>

      <label className="font-semibold">Edificio:</label>
      <select
        value={edificioSel}
        onChange={e => setEdificioSel(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        {edificios.map(e => (
          <option key={e.id} value={e.nombre}>{e.nombre}</option>
        ))}
      </select>

      <label className="font-semibold">Desde:</label>
      <select
        value={start}
        onChange={e => { setStart(e.target.value); /* no mostramos planos aún */ }}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Seleccioná origen</option>
        {puntosInteres.map(u => (
          <option key={u.node + "|" + u.nivel} value={u.node + "|" + u.nivel}>
            {u.name} [Nivel {u.nivel}]
          </option>
        ))}
      </select>

      <label className="font-semibold">Hasta:</label>
      <select
        value={end}
        onChange={e => { setEnd(e.target.value); /* no mostramos planos aún */ }}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Seleccioná destino</option>
        {puntosInteres.map(u => (
          <option key={u.node + "|" + u.nivel} value={u.node + "|" + u.nivel}>
            {u.name} [Nivel {u.nivel}]
          </option>
        ))}
      </select>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={calcularRuta}
      >
        Calcular ruta
      </button>

      {/* Planos: NO se muestran hasta que haya nivelesVisibles */}
      {nivelesVisibles.length > 0 && (
        <div className="mt-8 flex flex-col gap-5 items-center justify-center w-full" id="planos">
          {nivelesVisibles.map(nivel => (
            <div key={nivel} className="plano-container relative w-full max-w-lg bg-gray-50 border-2 border-blue-600/10 rounded-xl shadow p-2 min-h-[180px]">
              <span className="plano-title absolute left-4 top-3 z-30 bg-blue-700 text-white px-4 py-1 rounded-2xl font-bold shadow pointer-events-none">
                Nivel {nivel}
              </span>
              <div className="relative">
                <img
                  ref={nivel === 0 ? img0Ref : img1Ref}
                  className="plano-img w-full max-w-lg rounded-xl shadow relative z-10"
                  src={planos[nivel]}
                  alt={`Plano Nivel ${nivel}`}
                  onLoad={() => onImgLoad(nivel)}
                  onError={(e) => {
                    const src = (e.target as HTMLImageElement).src;
                    const id = extractDriveId(src);
                    if (id && src.includes("/uc?export=view")) {
                      (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                    }
                  }}
                />
                <canvas
                  ref={nivel === 0 ? canvas0Ref : canvas1Ref}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl z-20"
                />
                <div
                  ref={nivel === 0 ? arrow0Ref : arrow1Ref}
                  style={{
                    position: "absolute",
                    width: "24px",
                    height: "24px",
                    pointerEvents: "none",
                    zIndex: 30,
                    display: "none",
                    transition: "transform 0.15s"
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg viewBox="0 0 32 32" width="24" height="24" fill="#22c55e" stroke="#fff" stroke-width="2"><polygon points="16,3 29,29 16,24 3,29 16,3"/></svg>`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8" id="result">{result}</div>

      <style>{`
        .plano-title { font-size: 1rem; }
        @media (max-width: 900px) { .plano-container { max-width: 100vw; } .plano-img, canvas { max-width: 99vw; } }
        @media (max-width: 600px) {
          .plano-title { font-size: 0.97rem; padding: 2px 11px;}
          .plano-img, canvas { max-width: 98vw; border-radius: 8px; }
          .plano-container { min-height: 140px; border-radius: 13px;}
        }
        @media (max-width: 440px) {
          .plano-title { font-size: .88rem; left: 2px;}
          .plano-container { min-height: 90px; border-radius: 9px;}
          .plano-img, canvas { border-radius: 7px; }
        }
      `}</style>
    </div>
    </InternalPageLayout>
  );
}
