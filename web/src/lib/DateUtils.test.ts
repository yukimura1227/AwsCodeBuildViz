import { convertDateToDayString, convertDateToMonthString } from './DateUtils.ts';
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