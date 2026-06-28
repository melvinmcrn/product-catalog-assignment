// A price bound is meaningful only when it parses to a number greater than zero;
// "0.0" and "" both mean "no price set", so a range is shown only when a bound is > 0.
function isMeaningful(bound: string): boolean {
  const n = Number(bound)
  return bound.trim() !== '' && Number.isFinite(n) && n > 0
}

// Normalize a meaningful bound to a consistent 2-decimal shape, so "12.0" and "15"
// render uniformly as "12.00" / "15.00"; a non-meaningful bound becomes null.
function normalize(bound: string): string | null {
  return isMeaningful(bound) ? Number(bound).toFixed(2) : null
}

export function hasPriceRange(min: string, max: string): boolean {
  return isMeaningful(min) || isMeaningful(max)
}

export function formatPriceRange(min: string, max: string): string {
  const normalizedMin = normalize(min)
  const normalizedMax = normalize(max)

  if (normalizedMin && normalizedMax) {
    return normalizedMin === normalizedMax ? normalizedMin : `${normalizedMin} - ${normalizedMax}`
  }
  return normalizedMin ?? normalizedMax ?? ''
}
