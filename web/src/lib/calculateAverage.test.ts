import { calculateAverage } from './calculateAverage.ts';
import { expect } from "jsr:@std/expect";

Deno.test('calculateAverage - returns correct average for normal array', () => {
  const result = calculateAverage([1, 2, 3, 4, 5]);
  expect(result).toBe(3);
});

Deno.test('calculateAverage - handles empty array', () => {
  const result = calculateAverage([]);
  expect(result).toBeNaN(); // Average of an empty array is NaN
});

Deno.test('calculateAverage - handles single element', () => {
  const result = calculateAverage([42]);
  expect(result).toBe(42);
});

Deno.test('calculateAverage - handles negative numbers', () => {
  const result = calculateAverage([-1, -2, -3]);
  expect(result).toBe(-2);
});