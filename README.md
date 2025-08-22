# info-asamblea-regional-jw

Breve guía de desarrollo local y variables de entorno.

## Requisitos
- Node.js (LTS)
- pnpm (recomendado) o npm

## Instalar dependencias
```powershell
pnpm install
# o
npm install
```

## Ejecutar en desarrollo
```powershell
pnpm dev
# o
npm run dev
```

## Variables de entorno
Copia `.env.example` a `.env.local` y completa los valores. Importante:
- Para Firebase se usan variables `NEXT_PUBLIC_FIREBASE_*` (config cliente).
- Para Google Maps, preferimos usar una clave server-side llamada `GOOGLE_MAPS_API_KEY` (sin `NEXT_PUBLIC_`) para que nunca se exponga al navegador. La ruta API `app/api/places/search` utilizará `GOOGLE_MAPS_API_KEY` si está presente; solo usará `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` como respaldo.

No subas claves reales al repositorio.

## Seguridad y buenas prácticas
- No expongas claves en código fuente.