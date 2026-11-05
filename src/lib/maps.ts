export type MapPlace = {
  displayName: string;
  lat: number;
  lon: number;
};

export function addressQuery(
  addressLine: string | null | undefined,
  city?: string | null,
  postalCode?: string | null,
): string {
  return [addressLine, city, postalCode]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

export function osmEmbedUrl(lat: number, lon: number, zoom = 16): string {
  const delta = 0.008;
  const left = lon - delta;
  const right = lon + delta;
  const bottom = lat - delta;
  const top = lat + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}#map=${zoom}/${lat}/${lon}`;
}

export function osmLinkUrl(lat: number, lon: number, zoom = 16): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
}

export function generatedMapUrl(
  addressLine: string | null | undefined,
  city?: string | null,
  postalCode?: string | null,
): string | null {
  const query = addressQuery(addressLine, city, postalCode);
  return query
    ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`
    : null;
}
