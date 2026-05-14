/** Sufixo de cache (ex.: ?v=abc1234 na Vercel, por commit) para ficheiros em Public. */
export function publicAsset(path: string): string {
  return `${path}${__ASSET_Q__}`;
}
