const FONT_URLS = {
  regular: 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKnZrc3Hgbbcjq75U4uslyuy4kn0pNeYRI4CN2V.ttf',
  bold: 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKiZrc3Hgbbcjq75U4uslyuy4kn0qviTjYwI8Gcw6Oi.ttf',
} as const;

let cached: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

export async function loadDisplayFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (cached) return cached;

  const [regular, bold] = await Promise.all([
    fetch(FONT_URLS.regular).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.bold).then((r) => r.arrayBuffer()),
  ]);

  cached = { regular, bold };
  return cached;
}
