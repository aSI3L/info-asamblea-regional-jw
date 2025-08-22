"use client"
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { loadMapLayers } from "@/services/map-graph.service";
import { Button } from "@/components/ui/button";
import type { Node, Vector, PointOfInterest } from "@/types/mapas.type";

// Dijkstra implementation

// Componente principal de la página
import { edificiosService } from "@/services/index.generic.service";
import { useInfoPrincipal } from "@/hooks/useInfoPrincipal";
import { getCapaActivaDeNivel } from "@/services/capa-activa.service";

export function MapaInternoPage() {
  const [edificioId, setEdificioId] = useState("");
  const [loadingEdificio, setLoadingEdificio] = useState(true);
  const [pois, setPois] = useState<{ node: string; name: string; nivel: string }[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showVisor, setShowVisor] = useState(false);

  // Usar el hook compartido que además establece las variables CSS de color
  const { infoPrincipal, loadingInfoPrincipal } = useInfoPrincipal();

  // Al cambiar infoPrincipal, obtener el buildingId
  useEffect(() => {
    setLoadingEdificio(true);
    if (infoPrincipal && (infoPrincipal as any).buildingId) {
      setEdificioId((infoPrincipal as any).buildingId);
    }
    setLoadingEdificio(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoPrincipal, loadingInfoPrincipal]);

  // Cargar todos los POIs de la capa activa REAL de cada nivel al seleccionar edificio
  useEffect(() => {
    setPois([]); setFrom(""); setTo("");
    if (!edificioId) return;
    setLoadingPois(true);
    edificiosService.getById(edificioId).then(async (ed: any) => {
      const niveles = Object.keys(ed.planos || {});
      let allPois: { node: string; name: string; nivel: string }[] = [];
      for (const nivel of niveles) {
        // Leer la capa activa REAL del nivel desde Firestore
        const capaActiva = await getCapaActivaDeNivel(edificioId, nivel);
        const capasObj = await loadMapLayers({ edificioId, nivel });
        const data = capasObj[capaActiva];
        if (data?.pois) {
          allPois = allPois.concat(data.pois.map((p: any) => ({ node: p.node, name: p.name, nivel })));
        }
      }
      setPois(allPois);
      setLoadingPois(false);
    });
  }, [edificioId]);

  const handleCalcular = (e: any) => {
    e.preventDefault();
    setShowVisor(true);
  };

    return (
    <div
      className="max-w-xl mx-auto rounded-lg shadow-lg p-6 mt-6"
    >
    <div className="w-full max-w-4xl mb-6">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">Mapa Interno</h3>
          <p className="text-gray-600 text-lg max-w-3xl mt-3">Este mapa le ayudara a encontrar lugares dentro del recinto.</p>
    </div>
  <div className="w-full rounded-lg p-6 bg-white"
       style={{ border: '1px solid var(--secondary-color)' }}>
    <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">¿A dónde quieres ir?</h2>
      {(loadingEdificio || loadingPois) ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-600">Cargando ubicaciones...</span>
        </div>
      ) : (
        <form onSubmit={handleCalcular} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-normal text-gray-700">Desde</label>
            <select
              className="w-full rounded-lg p-2.5 text-sm border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
              value={from}
              onChange={e => setFrom(e.target.value)}
              required
            >
              <option value="">Seleccione origen</option>
              {pois.map(p => <option key={p.node} value={p.node}>{p.name} [Nivel {p.nivel}]</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-normal text-gray-700">Hasta</label>
            <select
              className="w-full rounded-lg p-2.5 text-sm border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
            >
              <option value="">Seleccione destino</option>
              {pois.map(p => <option key={p.node} value={p.node}>{p.name} [Nivel {p.nivel}]</option>)}
            </select>
          </div>
          <Button
            className="w-full text-sm font-medium rounded-lg px-5 py-2.5 shadow-md transition-transform disabled:opacity-60 bg-[var(--accent-color)] text-white hover:brightness-105"
            type="submit"
            disabled={!from || !to || !edificioId}
          >
            Calcular ruta
          </Button>
        </form>
      )}
      {showVisor && from && to && (
        <div className="mt-8">
          <MapVisor edificioId={edificioId} nivel="" capa="Capa 1" from={from} to={to} />
        </div>
      )}
    </div>
  </div>
  );
}
function dijkstra(
  nodes: Node[],
  connections: Vector[],
  start: string,
  end: string
): string[] {
  const distances: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const queue = new Set<string>();
  nodes.forEach((n) => {
    distances[n.node] = Infinity;
    prev[n.node] = null;
    queue.add(n.node);
  });
  distances[start] = 0;
  while (queue.size > 0) {
    const u = Array.from(queue).reduce((min, n) =>
      distances[n] < distances[min] ? n : min, Array.from(queue)[0]);
    queue.delete(u);
    if (u === end) break;
    connections.filter((c) => c.origen === u || c.destino === u).forEach((c) => {
      const v = c.origen === u ? c.destino : c.origen;
      if (!queue.has(v)) return;
      const alt = distances[u] + (c.distancia || 1);
      if (alt < distances[v]) {
        distances[v] = alt;
        prev[v] = u;
      }
    });
  }
  // Build path
  const path: string[] = [];
  let u: string | null = end;
  while (u && prev[u]) {
    path.unshift(u);
    u = prev[u];
  }
  if (u === start) path.unshift(start);
  return path;
}



interface MapVisorProps {
  edificioId: string;
  nivel: string;
  capa: string;
  from: string;
  to: string;
}


export function MapVisor({ edificioId, nivel, capa, from, to }: MapVisorProps) {
  // ...existing code...
  // Nueva animación de flecha: recorre el camino, desaparece al llegar, vuelve a empezar
  function getArrowSvg(path: string[], levelData: any, nivel: string, animPos: number) {
    if (!path || path.length < 2) return null;
    const allNodes = Object.values(levelData).flatMap((l: any) => l.nodes);
    const points = path.map(id => allNodes.find((n: any) => n.node === id)).filter(Boolean);
    if (points.length < 2) return null;
    // Calcular longitudes de cada segmento
    let total = 0;
    const segLengths: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
      segLengths.push(len);
      total += len;
    }
    if (total === 0) return null;
    // Si animPos >= 1, no mostrar flecha (bucle limpio)
  if (animPos <= 0 || animPos >= 0.98) return null;
    // Calcular en qué segmento está la flecha
    let dist = animPos * total;
    let segIdx = 0;
    while (segIdx < segLengths.length && dist > segLengths[segIdx]) {
      dist -= segLengths[segIdx];
      segIdx++;
    }
    if (segIdx >= segLengths.length) return null;
    const a = points[segIdx];
    const b = points[segIdx + 1];
    if (!a || !b) return null;
    // Solo mostrar la flecha si ambos nodos están en este nivel
    let nivelA = null, nivelB = null;
    for (const [nivelK, dataK] of Object.entries(levelData)) {
      if (dataK && Array.isArray((dataK as any).nodes)) {
        if ((dataK as any).nodes.some((n: any) => n.node === a.node)) nivelA = nivelK;
        if ((dataK as any).nodes.some((n: any) => n.node === b.node)) nivelB = nivelK;
      }
    }
    if (nivelA !== nivel || nivelB !== nivel) return null;
    let t = segLengths[segIdx] === 0 ? 0 : dist / segLengths[segIdx];
    t = Math.max(0, Math.min(1, t));
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    return (
      <g filter="url(#gmaps-arrow-shadow)">
        <polygon
          points="0,-18 32,0 0,18"
          fill="#22c55e"
          stroke="#fff"
          strokeWidth={3}
          opacity={0.98}
          transform={`translate(${x},${y}) rotate(${angle})`}
          style={{ transition: 'all 0.2s' }}
        />
      </g>
    );
  }
  const [allLevels, setAllLevels] = useState<string[]>([]);
  const [levelData, setLevelData] = useState<Record<string, { nodes: Node[]; connections: Vector[]; pois: PointOfInterest[] }>>({});
  const [planos, setPlanos] = useState<Record<string, string>>({});
  const [path, setPath] = useState<string[]>([]);
  // Valor animado para la flecha
  const t = useMotionValue(0);
  const [arrowT, setArrowT] = useState(0);
  // Duración de la animación en segundos
  const [arrowDuration, setArrowDuration] = useState(2);

  // Calcular duración según la longitud del camino
  useEffect(() => {
    if (!path.length) return;
    const allNodes = Object.values(levelData).flatMap(l => l.nodes);
    const points = path.map(id => allNodes.find(n => n.node === id)).filter(Boolean) as Node[];
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    }
    if (total === 0) return;
    setArrowDuration(total / 180); // px/seg
  }, [path, levelData]);

  // Animación de la flecha con Framer Motion
  useEffect(() => {
    let start = performance.now();
    let stopped = false;
    function animate(now: number) {
      if (stopped) return;
      const elapsed = (now - start) / 1000;
      let localT = (elapsed % arrowDuration) / arrowDuration;
      if (localT >= 1) localT = 0;
      t.set(localT);
      setArrowT(localT);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    return () => { stopped = true; };
  }, [arrowDuration, t]);
  const [animPos, setAnimPos] = useState(0); // 0 a 1, posición a lo largo del path
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar todos los niveles y sus datos de la capa 1
  useEffect(() => {
    async function fetchAllLevels() {
      const ed = await import("@/services/index.generic.service").then(m => m.edificiosService.getById(edificioId));
      if (!ed) return;
      const niveles = Object.keys(ed.planos || {});
      setAllLevels(niveles);
      setPlanos(ed.planos || {});
      const dataByLevel: Record<string, { nodes: Node[]; connections: Vector[]; pois: PointOfInterest[] }> = {};
      for (const nivel of niveles) {
        // Obtener la capa activa directamente desde Firestore
        const capaActiva = await getCapaActivaDeNivel(edificioId, nivel);
        const capasObj = await loadMapLayers({ edificioId, nivel });
        console.log(`Nivel: ${nivel}, capaActiva: '${capaActiva}'`, capasObj);
        const data = capasObj[capaActiva];
        if (data) {
          dataByLevel[nivel] = {
            nodes: data.nodes || [],
            connections: data.connections || [],
            pois: data.pois || [],
          };
        }
      }
      setLevelData(dataByLevel);
    }
    fetchAllLevels();
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [edificioId, capa]);

  // Calcular el camino entre from y to usando todos los nodos/conexiones de todos los niveles
  useEffect(() => {
    // Unir todos los nodos y conexiones
    const allNodes = Object.values(levelData).flatMap(l => l.nodes);
    const allConns = Object.values(levelData).flatMap(l => l.connections);
    if (from && to && allNodes.length && allConns.length) {
      setPath(dijkstra(allNodes, allConns, from, to));
    } else {
      setPath([]);
    }
  }, [from, to, levelData]);

  // Animación de la flecha: recorre toda la ruta suavemente
  useEffect(() => {
    if (!path.length) return;
    setAnimPos(0);
    let running = true;
    const speed = 180; // px por segundo
    let total = 0;
    const allNodes = Object.values(levelData).flatMap(l => l.nodes);
    const points = path.map(id => allNodes.find(n => n.node === id)).filter(Boolean) as Node[];
    for (let i = 0; i < points.length - 1; i++) {
      total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    }
    if (total === 0) return;
    let start = performance.now();
    function step(ts: number) {
      if (!running) return;
      const elapsed = (ts - start) / 1000;
      const cycleTime = total / speed;
      const t = (elapsed % cycleTime) / cycleTime;
      setAnimPos(t);
      requestAnimationFrame(step);
    }
    const raf = requestAnimationFrame(step);
    return () => {
      running = false;
      if (animRef.current) clearInterval(animRef.current);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line
  }, [path, levelData]);

  // Calcular los niveles que forman parte de la ruta
  const nivelesEnRuta = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    for (const [nivelK, dataK] of Object.entries(levelData)) {
      if (dataK.nodes.some(n => n.node === path[i])) {
        nivelesEnRuta.add(nivelK);
      }
    }
  }
  // Si no hay ruta, no mostrar nada
  if (nivelesEnRuta.size === 0) return null;
  // Determinar el nivel del punto de partida (primer nodo de la ruta)
  let nivelInicio: string | null = null;
  if (path.length > 0) {
    for (const [nivelK, dataK] of Object.entries(levelData)) {
      if (dataK.nodes.some(n => n.node === path[0])) {
        nivelInicio = nivelK;
        break;
      }
    }
  }
  // Ordenar: primero el nivel de inicio, luego los demás en el orden original
  const nivelesRutaOrdenados = Array.from(nivelesEnRuta);
  if (nivelInicio) {
    nivelesRutaOrdenados.sort((a, b) => (a === nivelInicio ? -1 : b === nivelInicio ? 1 : 0));
  }
  return (
    <div className="flex flex-col gap-8">
      {nivelesRutaOrdenados.map(nivel => {
        const data = levelData[nivel];
        if (!data) return null;
        // Solo mostrar el plano si hay segmentos de ruta en este nivel
        const pathSegments = [] as { from: Node; to: Node }[];
        for (let i = 0; i < path.length - 1; i++) {
          const n1 = data.nodes.find(n => n.node === path[i]);
          const n2 = data.nodes.find(n => n.node === path[i + 1]);
          if (n1 && n2) pathSegments.push({ from: n1, to: n2 });
        }
        if (pathSegments.length === 0) return null;
  const planoUrl = planos[String(nivel)] || null;
  console.log('DEBUG planoUrl', { planos, nivel, planoUrl });
        return (
          <div key={nivel} className="mb-6">
            <h3 className="font-bold mb-2 text-zinc-800">Plano nivel {nivel}</h3>
            <div className="rounded-lg border border-zinc-700 p-2 w-full max-w-2xl mx-auto">
              <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
                <svg viewBox="0 0 800 800" width="100%" height="100%" style={{ borderRadius: 8, display: 'block', width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="gmaps-blue" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4285F4" />
                      <stop offset="100%" stopColor="#0a58ca" />
                    </linearGradient>
                    <filter id="gmaps-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="7" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="gmaps-arrow-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4"/>
                    </filter>
                    <style>{`
                      .gmaps-dash {
                        stroke-dasharray: 16 12;
                        stroke-dashoffset: 0;
                        animation: dashmove 1.2s linear infinite;
                      }
                      @keyframes dashmove {
                        to { stroke-dashoffset: -28; }
                      }
                    `}</style>
                  </defs>
                  {planoUrl && (
                    <image href={planoUrl} x={0} y={0} width={800} height={800} style={{ pointerEvents: 'none' }} />
                  )}
                  {/* Camino: líneas verdes y puntos */}
                  {pathSegments.map((seg, idx) => (
                    <g key={idx}>
                      {/* Línea principal verde */}
                      <line x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y} stroke="#22c55e" strokeWidth={10} opacity={0.5} filter="url(#gmaps-glow)" />
                      <line x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y} stroke="#22c55e" strokeWidth={5} />
                      {/* Puntos en cada nodo del segmento */}
                      <circle cx={seg.from.x} cy={seg.from.y} r={10} fill="#fff" stroke="#22c55e" strokeWidth={4} />
                      <circle cx={seg.from.x} cy={seg.from.y} r={4} fill="#22c55e" />
                      {/* Si es el último segmento, dibuja punto en el destino también (antes del icono GPS) */}
                      {idx === pathSegments.length - 1 && (
                        <>
                          <circle cx={seg.to.x} cy={seg.to.y} r={10} fill="#fff" stroke="#22c55e" strokeWidth={4} />
                          <circle cx={seg.to.x} cy={seg.to.y} r={4} fill="#22c55e" />
                        </>
                      )}
                    </g>
                  ))}
                  {/* Icono de ubicación: pin rojo solo en el nivel destino */}
                  {(() => {
                    if (!path || path.length === 0) return null;
                    const allNodes = Object.values(levelData).flatMap(l => l.nodes);
                    const points = path.map(id => allNodes.find(n => n.node === id)).filter(Boolean) as Node[];
                    if (points.length < 2) return null;
                    const dest = points[points.length - 1];
                    // Buscar el nivel del nodo destino
                    let nivelDestino = null;
                    for (const [nivelK, dataK] of Object.entries(levelData)) {
                      if (dataK.nodes.some(n => n.node === dest.node)) nivelDestino = nivelK;
                    }
                    if (nivelDestino !== nivel) return null;
                    // SVG pin rojo estilo Google Maps, con la punta inferior apuntando al centro del nodo
                    // El pin tiene altura 40, la punta está en (0,40), así que ajustamos el translate
                    return (
                      <g transform={`translate(${dest.x},${dest.y - 40})`}>
                        <g>
                          <ellipse cx={0} cy={68} rx={18} ry={10} fill="#cbd5e1" opacity={0.7} />
                          <path d="M 0 0 C 18 0 18 24 0 40 C -18 24 -18 0 0 0 Z" fill="#ef4444" stroke="#333" strokeWidth={4} />
                          <circle cx={0} cy={12} r={10} fill="#cbd5e1" stroke="#333" strokeWidth={4} />
                          <circle cx={0} cy={12} r={6} fill="#cbd5e1" />
                        </g>
                      </g>
                    );
                  })()}
                  {/* Flecha animada con Framer Motion: recorre el camino, desaparece al llegar, vuelve a empezar */}
                  <motion.g>
                    {getArrowSvg(path, levelData, nivel, arrowT)}
                  </motion.g>
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
// fin MapVisor


// Utilidad para dibujar la flecha sin transformación
function getArrowPoints(from: Node, to: Node, length: number, width: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const tipX = to.x;
  const tipY = to.y;
  const baseX = tipX - length * Math.cos(angle);
  const baseY = tipY - length * Math.sin(angle);
  const leftX = baseX + (width / 2) * Math.sin(angle);
  const leftY = baseY - (width / 2) * Math.cos(angle);
  const rightX = baseX - (width / 2) * Math.sin(angle);
  const rightY = baseY + (width / 2) * Math.cos(angle);
  return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
}
}
