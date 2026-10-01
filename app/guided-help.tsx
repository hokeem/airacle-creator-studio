'use client';
import {useEffect,useRef,useState} from 'react';
import {Compass} from 'lucide-react';

export type TutorialStep={title:string;body:string;target:string};
type Box={x:number;y:number;width:number;height:number};
function targetFor(selector?:string){if(!selector)return null;if(selector.startsWith('button='))return Array.from(document.querySelectorAll<HTMLElement>('button')).find(el=>!el.closest('.spotlight-layer')&&el.textContent?.trim()===selector.slice(7))||null;return document.querySelector<HTMLElement>(selector)}
export default function GuidedHelp({current,index,total,onSkip}:{current:TutorialStep;index:number;total:number;onSkip:()=>void}){
 const [box,setBox]=useState<Box|null>(null);const [viewport,setViewport]=useState({width:0,height:0});const [height,setHeight]=useState(210);
 const layer=useRef<HTMLDivElement>(null);const card=useRef<HTMLElement>(null);const skip=useRef(onSkip);skip.current=onSkip;
 useEffect(()=>{
  if(!current)return;
  const root=layer.current;if(!root)return;
  root.showPopover();
  let target:HTMLElement|null=null;
  const focusable='button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
  let focused=false;
  const observer=new ResizeObserver(()=>measure());
  const measure=(reveal=false)=>{
   const found=targetFor(current.target);
   if(found!==target){if(target)observer.unobserve(target);target=found;if(target)observer.observe(target);focused=false}
   const width=window.innerWidth,vh=window.visualViewport?.height||window.innerHeight;
   setViewport({width,height:vh});
   let r=target?.getBoundingClientRect();
   // A hash route update or late layout can undo the initial scroll. Resolve the
   // live element again and reveal it after navigation has settled.
   if(target&&r&&reveal&&(r.top<90||r.bottom>vh-24||r.left<0||r.right>width)){
    target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    r=target.getBoundingClientRect();
   }
   if(target&&!focused&&r&&r.top>=0&&r.bottom<=vh){
    (target.matches(focusable)?target:Array.from(target.querySelectorAll<HTMLElement>(focusable)).find(el=>!el.closest('.spotlight-layer')))?.focus({preventScroll:true});focused=true;
   }
   const menu=document.querySelector('[role=listbox]')?.getBoundingClientRect();
   if(r&&menu)r=new DOMRect(Math.min(r.left,menu.left),Math.min(r.top,menu.top),Math.max(r.right,menu.right)-Math.min(r.left,menu.left),Math.max(r.bottom,menu.bottom)-Math.min(r.top,menu.top));
   if(!r||!r.width||!r.height){setBox(null);return}
   const x=Math.max(6,r.left-7),y=Math.max(6,r.top-7),right=Math.min(width-6,r.right+7),bottom=Math.min(vh-6,r.bottom+7);
   setBox(right>x&&bottom>y?{x,y,width:right-x,height:bottom-y}:null);
  };
  const remeasure=()=>measure();
  const reveal=()=>measure(true);
  let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(reveal)});
  const mutations=new MutationObserver(reveal);mutations.observe(document.body,{childList:true,subtree:true});
  measure(true);
  const esc=(e:KeyboardEvent)=>{if(document.querySelector('[role=listbox]'))return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();skip.current()}if(e.key==='Tab'){const selector='button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]';const candidates=[...(target?.matches(selector)?[target]:Array.from(target?.querySelectorAll<HTMLElement>(selector)||[])),...Array.from(root.querySelectorAll<HTMLElement>(selector))].filter(el=>el.getClientRects().length);if(candidates.length){e.preventDefault();const at=candidates.indexOf(document.activeElement as HTMLElement);const next=e.shiftKey?(at<=0?candidates.length-1:at-1):(at+1)%candidates.length;candidates[next].focus({preventScroll:true})}}};
  document.addEventListener('keydown',esc,true);window.addEventListener('scroll',remeasure,true);window.addEventListener('resize',reveal);window.addEventListener('hashchange',reveal);window.visualViewport?.addEventListener('resize',reveal);
  // Dialog and drawer entry animations can move the target without resizing it.
  const timers=[80,180,350,700,1200].map(ms=>setTimeout(reveal,ms));
  return()=>{cancelAnimationFrame(frame);timers.forEach(clearTimeout);observer.disconnect();mutations.disconnect();document.removeEventListener('keydown',esc,true);window.removeEventListener('scroll',remeasure,true);window.removeEventListener('resize',reveal);window.removeEventListener('hashchange',reveal);window.visualViewport?.removeEventListener('resize',reveal);if(root.matches(':popover-open'))root.hidePopover()};
 },[current,index]);
 useEffect(()=>{if(!card.current)return;const el=card.current;const observer=new ResizeObserver(()=>setHeight(el.getBoundingClientRect().height));observer.observe(el);return()=>observer.disconnect()},[current]);
 const w=Math.min(320,viewport.width-24),gap=18;let x=Math.max(12,(viewport.width-w)/2),y=Math.max(12,(viewport.height-height)/2),side='center';
 if(box){if(box.x+box.width+gap+w<=viewport.width-12){x=box.x+box.width+gap;y=box.y;side='right'}else if(box.x-gap-w>=12){x=box.x-gap-w;y=box.y;side='left'}else if(box.y+box.height+gap+height<=viewport.height-12){x=box.x;y=box.y+box.height+gap;side='below'}else{ x=box.x;y=box.y-gap-height;side='above'}x=Math.max(12,Math.min(x,viewport.width-w-12));y=Math.max(12,Math.min(y,viewport.height-height-12))}
 const panes=box?[{left:0,top:0,width:'100%',height:box.y},{left:0,top:box.y,width:box.x,height:box.height},{left:box.x+box.width,top:box.y,right:0,height:box.height},{left:0,top:box.y+box.height,width:'100%',bottom:0}]:[{inset:0}];
 return <div ref={layer} popover="manual" className="spotlight-layer">
  {panes.map((style,i)=><div key={i} className="spotlight-dim" style={style} aria-hidden="true"/>)}
  {box&&<div className="spotlight-frame" aria-hidden="true" style={{left:box.x,top:box.y,width:box.width,height:box.height}}/>}
  <aside ref={card} className={'spotlight-card side-'+side} aria-label="新手指导" style={{left:x,top:y,width:Math.max(0,w),visibility:viewport.width?'visible':'hidden',maxHeight:Math.max(150,viewport.height-24)}}>
   <div className="spotlight-caption"><span><Compass size={16}/>虚拟合作体验 · {index+1}/{total}</span></div>
   <h2>{current.title}</h2><p aria-live="polite">{current.body}</p>
   <div className="spotlight-controls"><button onClick={onSkip}>跳过引导</button></div>
  </aside>
 </div>;
}
