import OpenAI from "openai";
import { toFile } from "openai/uploads";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
function cors(res){res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");}
function decodeDataUrl(v){const m=String(v||'').match(/^data:([^;]+);base64,(.+)$/);if(!m)throw new Error('Invalid audio data.');return {type:m[1],buffer:Buffer.from(m[2],'base64')};}
export default async function handler(req,res){cors(res);if(req.method==='OPTIONS')return res.status(204).end();if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});try{const a=decodeDataUrl(req.body?.audio);const out=await client.audio.transcriptions.create({model:'gpt-transcribe',file:await toFile(a.buffer,'voice.webm',{type:a.type}),response_format:'text'});return res.status(200).json({text:typeof out==='string'?out:(out.text||'')});}catch(e){console.error(e);return res.status(500).json({error:'Transcription failed.',detail:e?.message||'Unknown error'});}}
