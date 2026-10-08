'use client';
import {useEffect,useState} from 'react';
import {Bot,ClipboardCheck,MessageSquare,Wallet} from 'lucide-react';
import {Popover,PopoverTrigger,PopoverContent} from '@/components/ui/popover';
import {toast} from 'sonner';
export default function TaskBrief({counts,onNavigate}:{counts:{review:number;feedback:number;payments:number;campaigns:number};onNavigate:(tab:'review'|'feedback'|'payments')=>void}){
 const [open,setOpen]=useState(false);
 const total=counts.review+counts.feedback+counts.payments;
 const day=new Date().toLocaleDateString('zh-CN');
 const summary=total?`今天有 ${counts.review} 项合作待审核、${counts.feedback} 条反馈待回复、${counts.payments} 笔结算待处理。`:'当前待办已全部处理完毕。';
 useEffect(()=>{try{if(localStorage.getItem('airacle-admin-brief-day')!==day){localStorage.setItem('airacle-admin-brief-day',day);toast('今日待办简报',{description:summary,position:'top-right',icon:<Bot size={20}/>,action:{label:'查看',onClick:()=>setOpen(true)},duration:5500})}}catch{}},[day,summary]);
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button className="adm-assistant" aria-label={`待办助手，${total} 项待处理`} title="今日待办简报"><Bot size={23}/>{total>0&&<span>{total>99?'99+':total}</span>}</button></PopoverTrigger><PopoverContent align="end" sideOffset={12} className="adm-brief-popover"><div className="adm-brief-title"><span><Bot size={22}/></span><div><strong>今日待办简报</strong><small>{day} · 待办助手</small></div></div><p>{summary}{counts.review>0?' 建议先处理合作审核。':counts.feedback>0?' 先回复创作者的问题吧。':counts.payments>0?' 核对金额后即可处理结算。':''}</p><div className="adm-brief-tasks">{[{key:'review' as const,label:'合作审核',count:counts.review,icon:ClipboardCheck},{key:'feedback' as const,label:'创作者反馈',count:counts.feedback,icon:MessageSquare},{key:'payments' as const,label:'结算与提现',count:counts.payments,icon:Wallet}].map(({key,label,count,icon:Icon})=><button key={key} onClick={()=>{setOpen(false);onNavigate(key)}}><Icon size={17}/><span>{label}</span><strong>{count}</strong></button>)}</div><small className="adm-brief-foot">{counts.campaigns} 个活动已上架 · 按当前待办实时更新</small></PopoverContent></Popover>
}
