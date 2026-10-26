declare module "pdf-parse" {
  function pdf(dataBuffer: Buffer): Promise<{
    text: string;
    numpages: number;
    info: Record<string, unknown>;
  }>;

  export default pdf;
}