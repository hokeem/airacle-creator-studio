'use client';
import {useState} from 'react';
import {ImagePlus,Upload} from 'lucide-react';
import {toast} from 'sonner';
export function CampaignCover({image,brand,color='#edf1f7'}:{image?:string;brand:string;color?:string}){
 const [failed,setFailed]=useState('');
 return <div className="adm-cover" style={{background:color}}>{image&&failed!==image?<img src={image} alt={brand+' 活动封面'} loading="lazy" onError={()=>setFailed(image)}/>:<div className="adm-cover-empty"><ImagePlus size={28}/><span>{image?'封面加载失败':'添加活动封面'}</span></div>}</div>
}
export function CoverEditor({value,onChange,onBusy}:{value:string;onChange:(value:string)=>void;onBusy:(busy:boolean)=>void}){
 const [busy,setBusy]=useState(false);
 async function choose(file?:File){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast.error('请选择 JPG、PNG 或 WebP 图片');return}if(file.size>8*1024*1024){toast.error('图片不能超过 8 MB');return}setBusy(true);onBusy(true);try{const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);const ctx=canvas.getContext('2d');if(!ctx)throw Error();ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();onChange(canvas.toDataURL('image/jpeg',.78));toast.success('封面已载入，保存活动后生效')}catch{toast.error('图片无法读取，请换一张图片')}finally{setBusy(false);onBusy(false)}}
 return <div className="adm-cover-editor wide"><span className="adm-cover-label">活动封面</span><CampaignCover image={value} brand="预览"/><div className="adm-cover-controls"><label className="adm-btn"><Upload size={16}/>{busy?'正在处理…':'选择封面图片'}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择封面图片" disabled={busy} onChange={e=>{void choose(e.target.files?.[0]);e.target.value=''}}/></label>{value&&<button type="button" className="adm-link" onClick={()=>onChange('')}>移除</button>}</div><label className="adm-field"><span>或使用图片链接</span><input type="text" inputMode="url" placeholder="https://…" value={value.startsWith('data:')||value.startsWith('/')?'':value} onChange={e=>onChange(e.target.value.trim())}/></label><small>建议横向 16:9 · JPG / PNG / WebP，最大 8 MB</small></div>
}
