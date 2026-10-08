import {campaigns, initialState, makeProject, advance, type AppState, type Campaign, type Project, type Stage} from './data';

export const ADMIN_KEY='airacle-admin-v1';
export const CREATOR_KEY='airacle-demo-v2';
export type Listing='draft'|'published'|'paused';
export type ManagedCampaign=Campaign&{listing:Listing};
export type AdminStore={schema:1;catalog:ManagedCampaign[];samples:AppState;names:Record<string,string>;resolved:Record<string,number>;log:{at:string;text:string}[]};
export const reviewStages:Stage[]=['applied','review','acceptance','negotiating'];
export const reviewLabel:Partial<Record<Stage,string>>={applied:'报名审核',review:'内容审核',acceptance:'发布验收',negotiating:'约定协商'};
const defaults=campaigns.map(c=>({...c,listing:'published' as Listing}));
export function createAdminStore():AdminStore{
 const sample=initialState(true);
 sample.projects=[makeProject('dji-air'),makeProject('dji-pocket','review'),makeProject('insta-outdoor','acceptance'),makeProject('anker-travel','settlement'),makeProject('notion-work','paid')];
 sample.projects.forEach((p,i)=>{p.id='admin-sample-'+p.campaignId;p.history=['示例合作记录'];p.note=['我计划用迪拜日出与沙漠日落讲述一次中东航拍旅程，结合中文旁白分享设备体验。','用 60 秒记录上海清晨街道、咖啡店与夜景，以跟拍展示防抖效果。','周末海岸骑行和露营，以第一视角记录户外体验。'][i]||'以日常使用场景展示产品体验。';if(['review','acceptance','settlement','paid'].includes(p.stage)){p.version=1;p.draft=p.note;p.items=Object.fromEntries(campaigns.find(c=>c.id===p.campaignId)!.deliverable.split(' + ').map(d=>[d,p.note]));p.versions=[{number:1,draft:p.draft,fileName:'',items:p.items}];p.confirmedTerms=1;}if(['acceptance','settlement','paid'].includes(p.stage))p.link='https://www.instagram.com/p/demo/';});
 sample.projects[1].messages.push({who:'我',text:'街拍中的背景音乐是否需要使用品牌曲库？希望在终稿前确认授权范围。'});
 sample.projects[2].messages.push({who:'我',text:'发布链接已回填，Story 会保存在精选中，请帮忙确认是否符合验收要求。'});
 sample.accounts=[{method:'PayPal',name:'Lin Studio',address:'lin@example.com',region:'中国'}];
 sample.withdrawals=[{id:'SAMPLE-WD-001',amount:200,account:sample.accounts[0],createdAt:new Date().toISOString(),status:'processing'}];
 return {schema:1,catalog:defaults.map(c=>({...c})),samples:sample,names:Object.fromEntries(sample.projects.map((p,i)=>[p.id,['陈舟 · 航拍旅行','林可 · 城市影像','Evan · 户外记录','许夏 · 数码装备','Lin Studio · 创作效率'][i]])),resolved:{},log:[]};
}
export function loadAdmin():AdminStore{try{const data=JSON.parse(localStorage.getItem(ADMIN_KEY)||'null');if(data?.schema===1&&Array.isArray(data.catalog)&&data.samples)return {...data,catalog:data.catalog.map((c:ManagedCampaign)=>({...c,image:c.image===undefined?defaults.find(d=>d.id===c.id)?.image:c.image}))}}catch{}return createAdminStore()}
export function loadCreator():AppState{try{const data=JSON.parse(localStorage.getItem(CREATOR_KEY)||'null');if(data?.schema===2&&data.state)return data.state}catch{}return initialState()}
export function syncCatalog(catalog=loadAdmin().catalog){campaigns.splice(0,campaigns.length,...catalog)}
export function isPublished(c:Campaign&{listing?:Listing}){return (c as ManagedCampaign).listing===undefined||(c as ManagedCampaign).listing==='published'}
export function validateCampaign(c:ManagedCampaign,publish=false){if(publish&&!c.image?.trim())return '请先添加活动封面';if(c.image&&!/^(https?:\/\/|\/[^/]|data:image\/(jpeg|png|webp);base64,)/.test(c.image))return '请使用有效的图片链接或上传图片';if(!c.brand.trim()||!c.title.trim())return '请填写品牌与活动名称';if(!Number.isFinite(c.budget)||c.budget<=0)return '合作报酬必须大于 0';if(!c.deadline)return '请选择报名截止日期';if(publish&&new Date(c.deadline+'T23:59:59').getTime()<Date.now())return '上架活动需要一个未来的报名截止日期';if(!c.deliverable.trim()||!c.brief.trim()||!c.requirements.some(x=>x.trim()))return '请补全交付要求、活动说明与内容要求';return ''}
export function decide(s:AppState,id:string,next:Stage,note:string){const p=s.projects.find(p=>p.id===id);if(!p)throw Error('合作不存在');if(['rejected','revision'].includes(next)||p.stage==='acceptance'&&next==='publish'||p.stage==='negotiating'){if(!note.trim())throw Error('请填写具体意见，让创作者知道下一步如何处理')}
 let result=advance(s,id,next);
 result={...result,projects:result.projects.map(row=>row.id!==id?row:{...row,...(note.trim()?{feedback:note.trim(),...(p.stage==='acceptance'&&next==='publish'?{returnReason:note.trim()}:{}),...(p.stage==='negotiating'?{termsNote:note.trim(),termsVersion:p.termsVersion+1}:{}),messages:[...row.messages,{who:'项目负责人 · Mia',text:note.trim()}]}:{})})};return result;
}
export function unresolved(p:Project,resolved:Record<string,number>,key:string){return p.messages.some((m,i)=>m.who==='我'&&i>=(resolved[key]||0))}
