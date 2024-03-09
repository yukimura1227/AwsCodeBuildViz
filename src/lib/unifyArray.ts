export const unifyArray = (array:unknown[]) => {
  const knownElements = new Set();
  for (const value of array) {
    knownElements.add(value);
  }
  return Array.from(knownElements);
}