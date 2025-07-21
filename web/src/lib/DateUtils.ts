// yyyy-MM-dd形式の日付を取得
export const convertDateToDayString = (date: Date):string => {
  return date.toISOString().slice(0,10);
}

export const convertDateToMonthString = (date: Date):string => {
  return date.toISOString().slice(0,7);
}

/**
 * Pure function that returns the number of seconds elapsed since 00:00 of the given date.
 *
 * @param dateInput A Date object or a string parseable by the Date constructor
 * @returns The number of seconds elapsed since 00:00 of that day (0–86399)
 */
export function secondsSinceStartOfDay(referenceTime: Date): number {
  const hours   = referenceTime.getHours();    // 0～23
  const minutes = referenceTime.getMinutes();  // 0～59
  const seconds = referenceTime.getSeconds();  // 0～59

  return hours * 60*60 + minutes * 60 + seconds;
}