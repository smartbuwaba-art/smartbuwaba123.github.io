import OpenAI, { toFile } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cors(res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function json(res, status, data){
  cors(res);
  return res.status(status).json(data);
}

export default async function handler(req, res){
  cors(res);
  if(req.method === "OPTIONS") return res.status(204).end();
  if(req.method === "GET") return json(res, 200, {ok:true, service:"Smart Buwaba Image AI", configured:!!process.env.OPENAI_API_KEY});
  if(req.method !== "POST") return json(res, 405, {error:"Method not allowed"});
  if(!process.env.OPENAI_API_KEY) return json(res, 500, {error:"Image AI backend is not configured. Add OPENAI_API_KEY to the Vercel project."});

  try{
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const prompt = String(body.prompt || "").trim().slice(0, 4000);
    if(!prompt) return json(res, 400, {error:"Prompt is required."});

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
    let result;

    if(body.imageData){
      const raw = String(body.imageData);
      const match = raw.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
      if(!match) return json(res, 400, {error:"Unsupported image format. Use PNG, JPG or WebP."});
      const mime0 = match[1].toLowerCase();
      const mime = mime0 === "image/jpg" ? "image/jpeg" : mime0;
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const buffer = Buffer.from(match[2], "base64");
      if(buffer.length > 10 * 1024 * 1024) return json(res, 413, {error:"Image is too large. Please use a smaller image."});
      result = await client.images.edit({
        model,
        image: await toFile(buffer, `smart-buwaba-edit.${ext}`, {type:mime}),
        prompt
      });
    }else{
      result = await client.images.generate({
        model,
        prompt,
        size: "1024x1024"
      });
    }

    const item = result?.data?.[0] || {};
    if(item.b64_json){
      return json(res, 200, {image:`data:image/png;base64,${item.b64_json}`});
    }
    if(item.url){
      return json(res, 200, {image:item.url});
    }
    return json(res, 502, {error:"Image service returned no image data."});
  }catch(e){
    console.error("Smart Buwaba image error", e);
    return json(res, 500, {error:e?.message || "Image generation failed."});
  }
}
