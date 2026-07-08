export function normalizeHexColor(value: string) {
  const uppercase = value.trim().toUpperCase();
  const withHash = uppercase.startsWith('#') ? uppercase : `#${uppercase}`;
  const shortHexMatch = /^#([0-9A-F]{3})$/.exec(withHash);

  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return withHash;
}

export function isValidHexColor(value: string) {
  return /^#[0-9A-F]{6}$/.test(normalizeHexColor(value));
}

export function toSoftColor(value: string) {
  const normalized = normalizeHexColor(value);
  const hex = normalized.slice(1);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, 0.18)`;
}
