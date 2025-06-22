export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T
): [T[keyof T], ...Array<T[keyof T]>] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
}