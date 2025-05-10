// yyyy-MM-dd形式の日付を取得
export const convertDateToDayString = (date: Date):string => {
  return date.toISOString().slice(0,10);
}

export const convertDateToMonthString = (date: Date):string => {
  return date.toISOString().slice(0,7);
}
