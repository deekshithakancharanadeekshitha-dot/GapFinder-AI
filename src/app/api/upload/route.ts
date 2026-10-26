import { NextRequest, NextResponse } from "next/server";
import { chunkText, getModel } from "@/lib/ai";
import pdf from "pdf-parse";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({error:"No file supplied"}, {status:400});
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({error:"Maximum upload size is 15 MB"}, {status:413});
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    if (file.name.toLowerCase().endsWith(".pdf")) {
      const parsed = await pdf(buffer);
      text = parsed.text;
    } else if (/\.(txt|md)$/i.test(file.name)) text = buffer.toString("utf8");
    else return NextResponse.json({error:"Please upload a PDF, TXT or Markdown file."},{status:415});
    if (!text.trim()) return NextResponse.json({error:"No readable text found. Scanned PDFs need OCR first."},{status:422});
    const chunks = chunkText(text);
    let topics: {name:string;score:number;reason:string;priority:string}[] = [];
    const model = getModel();
    if (model) {
      try {
        const result = await model.generateContent(`Extract 4-12 distinct learning topics from this student's material. Do not assume any subject. Return ONLY valid JSON array with objects {"name":string,"score":50,"reason":"Not assessed yet; generated from uploaded material","priority":"Medium"}. Use score 50 because mastery is unknown before a quiz. Material:\\n${chunks.slice(0,8).join("\\n").slice(0,12000)}`);
        const raw = result.response.text().replace(/```json|```/g,"").trim();
        const parsed = JSON.parse(raw);
        topics = Array.isArray(parsed) ? parsed : [];
      } catch { topics = []; }
    }
    // Fallback topic extraction from headings and meaningful lines so uploads still shape the map without an API key.
    if (!topics.length) {
      const lines = text.split(/\\r?\\n/).map(line => line.replace(/^\\s*(#{1,6}|[-*•]|\\d+(?:\\.\\d+)*[.)]?)\\s*/,"").trim())
        .filter(line => line.length >= 4 && line.length <= 100 && /[a-zA-Z]/.test(line));
      const unique = Array.from(new Set(lines)).filter(line => !/^(page \\d+|contents|table of contents)$/i.test(line));
      const picked = unique.filter(line => line.split(/\\s+/).length <= 12).slice(0, 12);
      topics = picked.map(name => ({name,score:50,reason:"Extracted from uploaded material; complete a diagnostic to measure mastery.",priority:"Medium"}));
      if (!topics.length) topics = chunks.slice(0,8).map((chunk,i)=>({name:`Material section ${i+1}`,score:50,reason:"Extracted text section; complete a diagnostic to measure mastery.",priority:"Medium"}));
    }
    return NextResponse.json({filename:file.name,characters:text.length,chunkCount:chunks.length,topics,preview:text.slice(0,300),message:"Text extracted and chunked. For persistent semantic RAG, configure Supabase pgvector."});
  } catch (e) {
    return NextResponse.json({error:e instanceof Error?e.message:"Could not process this file."},{status:500});
  }
}