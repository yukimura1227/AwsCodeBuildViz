export const calculateAverage = (array: number[]): number => {
  return array.reduce((prev, current) => prev + current, 0) / array.length;
};
