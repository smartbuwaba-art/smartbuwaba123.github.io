import OpenAI, { toFile } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cors(res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
}

export default async function handler(req,res){
  cors(res);
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method==="GET") return res.status(200).json({ok:true,service:"Smart Buwaba Image AI"});
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY is not configured on the server."});

  try{
    const body=req.body||{};
    const prompt=String(body.prompt||"").trim().slice(0,4000);
    if(!prompt) return res.status(400).json({error:"Prompt is required."});

    const model=process.env.OPENAI_IMAGE_MODEL||"gpt-image-2";
    let result;

    if(body.imageData){
      const raw=String(body.imageData);
      const match=raw.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
      if(!match) return res.status(400).json({error:"Unsupported image format. Use PNG, JPG or WebP."});
      const mime=match[1].toLowerCase()==="image/jpg"?"image/jpeg":match[1].toLowerCase();
      const ext=mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
      const buffer=Buffer.from(match[2],"base64");
      if(buffer.length>10*1024*1024) return res.status(413).json({error:"Image is too large. Please use a smaller image."});
      result=await client.images.edit({
        model,
        image:await toFile(buffer,`smart-buwaba-edit.${ext}`,{type:mime}),
        prompt
      });
    }else{
      result=await client.images.generate({
        model,
        prompt,
        size:"1024x1024"
      });
    }

    const b64=result.data?.[0]?.b64_json;
    if(!b64) return res.status(502).json({error:"Image service returned no image."});
    return res.status(200).json({image:`data:image/png;base64,${b64}`});
  }catch(e){
    console.error("Smart Buwaba image error",e);
    return res.status(500).json({error:e?.message||"Image generation failed."});
  }
}
