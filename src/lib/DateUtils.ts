// yyyy-MM-dd形式の日付を取得
export const convertDateToDayString = (date: Date):string => {
  return dateToyyyyMMddWithHyphen(date).slice(0,10);
}

const dateToyyyyMMddWithHyphen = (date: Date):string => {
  return new Date(date).toLocaleDateString("ja-JP", {year: "numeric", month: "2-digit", day: "2-digit"});
}