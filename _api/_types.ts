// Local type shim replacing the Vercel node types — keeps handler signatures unchanged
export interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: any;
  query: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  url?: string;
}

export interface VercelResponse {
  status(code: number): VercelResponse;
  json(data: any): VercelResponse;
  send(data: any): VercelResponse;
  setHeader(key: string, value: string): VercelResponse;
}

