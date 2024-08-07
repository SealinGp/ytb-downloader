import { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

export function getFilenameFromHeader(
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders,
): string {
  const headerVal = headers["content-disposition"];
  const filename = headerVal
    .split(";")[1]
    .split("=")[1]
    .replace('"', "")
    .replace('"', "");
  return decodeURI(filename);
}

export function randomToN(n: number) {
  return Math.floor(Math.random() * (n + 1));
}
