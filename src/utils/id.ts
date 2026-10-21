let counter = 0;

/** Generates a short, collision resistant id. */
export function createId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
