export type SomeOf<T, K extends keyof T> = Pick<T, K> & Partial<T>;

export type uuid = string;
