import './style.css';
import { env } from 'cloudflare:workers';
import { desc, eq, inArray } from 'drizzle-orm';
import { getDb } from '../../../db';
import { studioApplications, studioUsers } from '../../../db/schema';
import { campaigns } from '../../data';
import { chatGPTSignInPath, getChatGPTUser } from '../../chatgpt-auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
const realCampaigns = campaigns.filter(c => c.realApplications);
const realIds = realCampaigns.map(c => c.id);

export default async function RealApplicationsPage() {
  const user = await getChatGPTUser();
  if (!user) return <main className="application-admin"><h1>真实报名记录</h1><p>请使用管理员账号登录查看。</p><a href={chatGPTSignInPath('/admin/real-applications')} target="_top">安全登录</a></main>;
  const allowed = (env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(user.email.toLowerCase())) return <main className="application-admin"><h1>无权查看报名记录</h1><p>此页面仅供指定管理员访问。</p><Link href="/">返回创作者端</Link></main>;
  const rows = await getDb().select({id:studioApplications.id,campaignId:studioApplications.campaignId,note:studioApplications.note,status:studioApplications.status,submittedAt:studioApplications.submittedAt,email:studioUsers.email,displayName:studioUsers.displayName}).from(studioApplications).innerJoin(studioUsers,eq(studioApplications.ownerSiteUserId,studioUsers.siteUserId)).where(inArray(studioApplications.campaignId,realIds)).orderBy(desc(studioApplications.submittedAt));
  return <main className="application-admin"><div className="application-admin-head"><div><p>AIRACLE / ADMIN</p><h1>真实报名记录</h1><span>三项案例的达人报名统一保存在平台数据库中。</span></div><Link href="/admin">返回后台管理</Link></div><div className="application-admin-counts">{realCampaigns.map(c=><div key={c.id}><span>{c.brand} · {c.title}</span><strong>{rows.filter(r=>r.campaignId===c.id&&r.status==='submitted').length}</strong><small>有效报名</small></div>)}</div><div className="application-admin-list">{rows.length?rows.map(r=><article key={r.id}><div className="application-admin-row"><div><span>{realCampaigns.find(c=>c.id===r.campaignId)?.title}</span><h2>{r.displayName}</h2><a href={'mailto:'+r.email}>{r.email}</a></div><strong className={r.status==='withdrawn'?'withdrawn':''}>{r.status==='withdrawn'?'已撤回':'待评估'}</strong></div><p>{r.note}</p><footer>提交于 {new Date(r.submittedAt).toLocaleString('zh-CN')} · {r.id}</footer></article>):<div className="application-admin-empty">还没有真实报名。创作者提交后会显示在这里。</div>}</div></main>;
}
