import { NextRequest, NextResponse } from "next/server";
import { getModel, retrieve } from "@/lib/ai";
export async function POST(req: NextRequest) {
  try {
    const {question} = await req.json();
    const model = getModel();
    if (!model) return NextResponse.json({answer:"AI is not configured. Add GEMINI_API_KEY to .env.local and restart the server. The demo assistant intentionally does not invent a course-grounded answer without retrieved source text."});
    // Deliberately fail closed until persistent uploaded chunks are indexed for this user.
    const chunks: {content:string;source:string;page?:number}[] = [];
    const hits = retrieve(String(question||""), chunks);
    if (!hits.length) return NextResponse.json({answer:"I couldn't find supporting text in the indexed material for this question. Upload readable course notes and configure persistent chunk retrieval first. I won't guess an answer without a source."});
    const context = hits.map((h,i)=>`[${i+1}] ${h.content}\nSource: ${h.source}${h.page?`, page ${h.page}`:""}`).join("\n\n");
    const result = await model.generateContent(`Answer only using the sources below. If they do not support the answer, say so. Cite source labels inline.\nSOURCES:\n${context}\nQUESTION: ${question}`);
    return NextResponse.json({answer:result.response.text()});
  } catch { return NextResponse.json({error:"Explanation failed."},{status:500}); }
}