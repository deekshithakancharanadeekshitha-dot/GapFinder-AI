import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/ai";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const model = getModel();
    if (!model) return NextResponse.json({questions:body.demoQuestions||[],mode:"demo",message:"Set GEMINI_API_KEY to generate new AI questions."});
    // In production, retrieve actual chunks for each topic and pass only those chunks here.
    return NextResponse.json({questions:body.demoQuestions||[],mode:"demo",message:"No indexed source chunks supplied; using sample questions rather than fabricating grounded questions."});
  } catch { return NextResponse.json({error:"Could not generate quiz."},{status:500}); }
}