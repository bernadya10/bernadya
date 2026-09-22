import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useTranslation } from '../../../locales/LanguageContext';

type Row = Record<string, any>;
const tabs=[
 ['command','Command Center','KPI, workload, approvals'],['workflow','Workflow','SLA & multi-level approval'],['analytics','People Analytics','Headcount & attendance'],['documents','Documents','Dokumen & expiry'],['performance','Performance','KPI & review'],['workforce','Workforce','Roster & capacity'],['compliance','Compliance','Checklist & audit'],['settings','Enterprise Settings','Kontrol sistem']
] as const;
export default function EnterpriseV20({employees}:{employees:Row[]}){
 const [tab,setTab]=useState<string>('command'); const [msg,setMsg]=useState(''); const [loading,setLoading]=useState(false);
 const [approvals,setApprovals]=useState<Row[]>([]),[docs,setDocs]=useState<Row[]>([]),[tasks,setTasks]=useState<Row[]>([]),[roster,setRoster]=useState<Row[]>([]),[reviews,setReviews]=useState<Row[]>([]);
 const load=async()=>{setLoading(true); const [a,d,t,r,p]=await Promise.all([
  supabase.from('hris_approval_requests').select('*').order('created_at',{ascending:false}).limit(100),
  supabase.from('hris_employee_documents').select('*').order('created_at',{ascending:false}).limit(100),
  supabase.from('hris_compliance_tasks').select('*').order('due_date',{ascending:true}).limit(100),
  supabase.from('hris_workforce_roster').select('*').order('work_date',{ascending:false}).limit(100),
  supabase.from('hris_performance_reviews').select('*').order('period',{ascending:false}).limit(100)
 ]); setApprovals(a.data||[]);setDocs(d.data||[]);setTasks(t.data||[]);setRoster(r.data||[]);setReviews(p.data||[]);setLoading(false)};
 useEffect(()=>{load()},[]);
 const pending=approvals.filter(x=>/menunggu|pending/i.test(String(x.status||''))).length;
 const active=employees.filter(x=>x.status_aktif!==false).length;
 const expiring=docs.filter(x=>{const d=x.tanggal_kadaluarsa||x.expiry_date;return d&&new Date(d).getTime()-Date.now()<1000*60*60*24*30}).length;
 const openCompliance=tasks.filter(x=>!['Selesai','Done','Closed'].includes(String(x.status||''))).length;
 const cap=roster.length; const reviewed=reviews.length;
 const approve=async(row:Row,decision:'Disetujui'|'Ditolak')=>{setMsg(''); const {error}=await supabase.rpc('hris_v20_decide_approval',{p_request_id:row.id,p_decision:decision,p_note:decision==='Ditolak'?'Ditolak dari Pusat Kendali Enterprise':'Disetujui dari Pusat Kendali Enterprise'}); if(error){setMsg(error.message);return} setMsg(`Approval ${decision.toLowerCase()}.`);load()};
 return <div className="module-page">
  <div className="page-heading"><div><h1>Pusat Kendali Enterprise</h1><p>Workflow, analitik, dokumen, kinerja, workforce, dan kepatuhan dalam satu pusat kendali.</p></div><button className="primary" onClick={load}>{loading?'Memuat…':'Muat Ulang'}</button></div>
  <div className="branch-tabs">{tabs.map(([k,l,s])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}><b>{l}</b><small>{s}</small></button>)}</div>
  {msg&&<div className="alert">{msg}</div>}
  {tab==='command'&&<><div className="stat-grid"><Kpi title="Karyawan Aktif" value={active}/><Kpi title="Approval Pending" value={pending}/><Kpi title="Dokumen Expiring" value={expiring}/><Kpi title="Compliance Open" value={openCompliance}/></div><div className="content-grid"><Panel title="Kesehatan Operasional"><p>Data roster karyawan: <b>{cap}</b></p><p>Peninjauan kinerja: <b>{reviewed}</b></p><p>Antrean persetujuan: <b>{pending} menunggu</b></p><p>Dokumen mendekati expiry: <b>{expiring}</b></p></Panel><Panel title="Kontrol Eksekutif"><button className="secondary" onClick={()=>setTab('workflow')}>Tinjau Antrean Persetujuan</button><button className="secondary" onClick={()=>setTab('compliance')}>Buka Kepatuhan</button><button className="secondary" onClick={()=>setTab('documents')}>Kelola Dokumen</button></Panel></div></>}
  {tab==='workflow'&&<Panel title="Antrean Persetujuan"><Table rows={approvals.slice(0,50)} cols={['modul','record_id','status','created_at']} action={(r)=>/menunggu|pending/i.test(String(r.status||''))?<><button className="link-btn" onClick={()=>approve(r,'Disetujui')}>Setujui</button><button className="link-btn danger" onClick={()=>approve(r,'Ditolak')}>Tolak</button></>:null}/></Panel>}
  {tab==='analytics'&&<Analytics employees={employees} roster={roster}/>} 
  {tab==='documents'&&<Panel title="Employee Documents"><Table rows={docs} cols={['id_karyawan','nama_dokumen','tanggal_kadaluarsa','status']}/></Panel>}
  {tab==='performance'&&<Panel title="Performance Reviews"><Table rows={reviews} cols={['id_karyawan','period','score','status','catatan']}/></Panel>}
  {tab==='workforce'&&<Panel title="Workforce Roster"><Table rows={roster} cols={['work_date','id_karyawan','shift_code','location','status']}/></Panel>}
  {tab==='compliance'&&<Panel title="Compliance Tasks"><Table rows={tasks} cols={['task_code','title','owner','due_date','status']}/></Panel>}
  {tab==='settings'&&<SettingsV20/>}
 </div>
}
function Kpi({title,value}:{title:string;value:number}){return <div className="stat-card"><span>{title}</span><strong>{value.toLocaleString('id-ID')}</strong></div>}
function Panel({title,children}:{title:string;children:ReactNode}){return <div className="panel"><div className="panel-head"><div><h2>{title}</h2></div></div>{children}</div>}
function Table({rows,cols,action}:{rows:Row[];cols:string[];action?:(r:Row)=>React.ReactNode}){return <div className="table-wrap"><table><thead><tr>{cols.map(c=><th key={c}>{c.replaceAll('_',' ').toUpperCase()}</th>)}{action&&<th>AKSI</th>}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={r.id||i}>{cols.map(c=><td key={c}>{c==='score'?String(r[c]??'-'):String(r[c]??'-')}</td>)}{action&&<td>{action(r)}</td>}</tr>):<tr><td colSpan={cols.length+(action?1:0)}>Belum ada data.</td></tr>}</tbody></table></div>}
function Analytics({employees,roster}:{employees:Row[];roster:Row[]}){const dept=useMemo(()=>{const m:Record<string,number>={};employees.filter(e=>e.status_aktif!==false).forEach(e=>{const d=e.departemen||'Tanpa Departemen';m[d]=(m[d]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])},[employees]); return <Panel title="Analitik Karyawan"><div className="mini-kpi-row"><div className="stat-card"><span>Total Aktif</span><strong>{employees.filter(e=>e.status_aktif!==false).length}</strong></div><div className="stat-card"><span>Data Roster</span><strong>{roster.length}</strong></div></div><div className="panel"><h3>Jumlah Karyawan per Departemen</h3>{dept.map(([d,n])=><div className="metric-row" key={d}><span>{d}</span><b>{n}</b></div>)}</div></Panel>}
function SettingsV20(){const {t}=useTranslation();const [f,setF]=useState({approval_sla_hours:'24',document_expiry_days:'30',attendance_radius_meters:'150',require_selfie:'true',require_gps:'true'}); const save=async()=>{const rows=Object.entries(f).map(([key,value])=>({key,value,updated_at:new Date().toISOString()}));const {error}=await supabase.from('hris_enterprise_settings').upsert(rows,{onConflict:'key'});if(error)alert(error.message);else alert(t('enterprise_settings_saved'))};return <Panel title="Pengaturan Enterprise"><div className="form-two">{Object.entries(f).map(([k,v])=><label key={k}>{k.replaceAll('_',' ')}<input value={v} onChange={e=>setF({...f,[k]:e.target.value})}/></label>)}</div><button className="primary" onClick={save}>Simpan Pengaturan</button></Panel>}
