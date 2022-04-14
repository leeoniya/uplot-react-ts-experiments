export type TimeRange = { from: number; to: number };

export const enum FieldType {
  time = "time",
  number = "number",
}

export interface Field {
  name: string;
  type: FieldType;
  values: number[];
}

export interface DataFrame {
  length: number;
  fields: Field[];
}

export interface PrepDataResult<T> {
  data: T;
  error?: string | null;
}
