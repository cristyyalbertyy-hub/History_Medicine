/** Sufixo de cache (ex.: ?v=abc1234 na Vercel, por commit) para ficheiros em Public. */
export function publicAsset(path: string): string {
  const base = import.meta.env.VITE_MEDIA_ORIGIN || import.meta.env.BASE_URL;
  const assetPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${assetPath}${__ASSET_Q__}`;
}
