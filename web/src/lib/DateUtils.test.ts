import { convertDateToDayString, convertDateToMonthString, secondsSinceStartOfDay } from './DateUtils.ts';
import { expect } from "jsr:@std/expect";

Deno.test('convertDateToDayString - returns correct date string format', () => {
  const date = new Date('2024-03-15T10:30:00.000Z');
  const result = convertDateToDayString(date);
  expect(result).toBe('2024-03-15');
});

Deno.test('convertDateToDayString - handles January date', () => {
  const date = new Date('2024-01-01T00:00:00.000Z');
  const result = convertDateToDayString(date);
  expect(result).toBe('2024-01-01');
});

Deno.test('convertDateToDayString - handles December date', () => {
  const date = new Date('2024-12-31T23:59:59.999Z');
  const result = convertDateToDayString(date);
  expect(result).toBe('2024-12-31');
});

Deno.test('convertDateToDayString - handles leap year', () => {
  const date = new Date('2024-02-29T12:00:00.000Z');
  const result = convertDateToDayString(date);
  expect(result).toBe('2024-02-29');
});

Deno.test('convertDateToMonthString - returns correct month string format', () => {
  const date = new Date('2024-03-15T10:30:00.000Z');
  const result = convertDateToMonthString(date);
  expect(result).toBe('2024-03');
});

Deno.test('convertDateToMonthString - handles January', () => {
  const date = new Date('2024-01-15T12:00:00.000Z');
  const result = convertDateToMonthString(date);
  expect(result).toBe('2024-01');
});

Deno.test('convertDateToMonthString - handles December', () => {
  const date = new Date('2024-12-25T18:30:00.000Z');
  const result = convertDateToMonthString(date);
  expect(result).toBe('2024-12');
});

Deno.test('convertDateToMonthString - ignores day and time', () => {
  const date1 = new Date('2024-05-01T00:00:00.000Z');
  const date2 = new Date('2024-05-31T23:59:59.999Z');
  const result1 = convertDateToMonthString(date1);
  const result2 = convertDateToMonthString(date2);
  expect(result1).toBe('2024-05');
  expect(result2).toBe('2024-05');
});

Deno.test('secondsSinceStartOfDay - returns 0 for midnight', () => {
  const date = new Date('2024-03-15T00:00:00');
  const result = secondsSinceStartOfDay(date);
  expect(result).toBe(0);
});

Deno.test('secondsSinceStartOfDay - returns correct seconds for noon', () => {
  const date = new Date('2024-03-15T12:00:00');
  const result = secondsSinceStartOfDay(date);
  expect(result).toBe(12 * 60 * 60); // 43200 seconds
});

Deno.test('secondsSinceStartOfDay - returns correct seconds for 23:59:59', () => {
  const date = new Date('2024-03-15T23:59:59');
  const result = secondsSinceStartOfDay(date);
  expect(result).toBe(23 * 60 * 60 + 59 * 60 + 59); // 86399 seconds
});

Deno.test('secondsSinceStartOfDay - handles specific time correctly', () => {
  const date = new Date('2024-03-15T14:30:45');
  const result = secondsSinceStartOfDay(date);
  const expected = 14 * 60 * 60 + 30 * 60 + 45; // 52245 seconds
  expect(result).toBe(expected);
});

Deno.test('secondsSinceStartOfDay - handles single digit hours/minutes/seconds', () => {
  const date = new Date('2024-03-15T01:05:09');
  const result = secondsSinceStartOfDay(date);
  const expected = 1 * 60 * 60 + 5 * 60 + 9; // 3909 seconds
  expect(result).toBe(expected);
});

Deno.test('secondsSinceStartOfDay - different dates same time return same result', () => {
  const date1 = new Date('2024-01-01T15:30:00');
  const date2 = new Date('2024-12-31T15:30:00');
  const result1 = secondsSinceStartOfDay(date1);
  const result2 = secondsSinceStartOfDay(date2);
  expect(result1).toBe(result2);
  expect(result1).toBe(15 * 60 * 60 + 30 * 60); // 55800 seconds
});