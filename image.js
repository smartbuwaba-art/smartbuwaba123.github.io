import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY is not configured on the server."});
  try{
    const prompt=String(req.body?.prompt||"").trim().slice(0,4000);
    if(!prompt)return res.status(400).json({error:"Prompt is required."});
    const result=await client.images.generate({model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-2",prompt,size:"1024x1024"});
    const b64=result.data?.[0]?.b64_json;
    if(!b64) return res.status(502).json({error:"Image service returned no image."});
    return res.status(200).json({image:`data:image/png;base64,${b64}`});
  }catch(e){console.error("Smart Buwaba image error",e);return res.status(500).json({error:e?.message||"Image generation failed."});}
}
