export type Attr = {
  [Key: string]: () => boolean;
};

export function cn(...args: Array<string | Attr>) {
  return args
    .reduce((prev: Array<string>, arg: string | Attr) => {
      if (typeof arg === "string") {
        prev.push(arg);
      } else {
        prev = prev.concat(Object.keys(arg).filter((key) => arg[key]()));
      }

      return prev;
    }, [])
    .join(" ");
}
