import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from '../../../locales/LanguageContext';
import { supabase } from '../../../lib/supabase/client';
import '../../../styles/admin/admin.css';
import AdminIcon from '../common/AdminIcon';

type Employee={id:string;id_karyawan?:string;nama:string;departemen?:string;jabatan?:string;gaji_pokok?:number;email?:string;status_aktif?:boolean};
type Row=Record<string, any>;
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>new Date().toISOString().slice(0,10);
const month=()=>new Date().toISOString().slice(0,7);
function Heading({title,desc,action,onAction}:{title:string;desc:string;action?:string;onAction?:()=>void}){return <div className="page-heading"><div><span className="group-title">ENTERPRISE</span><h1>{title}</h1><p>{desc}</p></div>{action&&<button className="primary" onClick={onAction}>{action}</button>}</div>}
function Status({v}:{v:string}){const x=String(v||'').toLowerCase();return <span className={`status ${/tolak|batal|nonaktif|ditolak/i.test(x)?'red':/menunggu|draft|screening|pending/i.test(x)?'orange':/open|aktif|diterima|disetujui|dibayar|terjadwal/i.test(x)?'green':'blue'}`}>{v||'—'}</span>}
function Empty({cols}:{cols:number}){const {t}=useTranslation();return <tr><td colSpan={cols} className="empty-cell">{t('no_data')}</td></tr>}
function Modal({title,onClose,onSubmit,children,submit='Simpan'}:{title:string;onClose:()=>void;onSubmit:(e:FormEvent)=>void;children:ReactNode;submit?:string}){return <div className="drawer-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><aside className="edit-drawer"><div className="drawer-head"><div><span>PROJECT BY TIRTA</span><h2>{title}</h2></div><button type="button" className="icon-btn" onClick={onClose}>×</button></div><form className="drawer-body" onSubmit={onSubmit}>{children}<div className="drawer-foot"><button type="button" className="secondary" onClick={onClose}>Batal</button><button className="primary">{submit}</button></div></form></aside></div>}
function Branch({items,tab,setTab}:{items:{key:string;label:string;icon?:string}[];tab:string;setTab:(v:string)=>void}){return <div className="branch-nav">{items.map(i=><button key={i.key} className={tab===i.key?'active':''} onClick={()=>setTab(i.key)}><AdminIcon name={i.icon||i.key} size={15}/><span>{i.label}</span></button>)}</div>}

export function PayrollEnterprise({employees,view='payroll'}:{employees:Employee[];view?:'payroll'|'components'|'overtime'|'payslip'}){
  const { t } = useTranslation();
 const [period,setPeriod]=useState(month()),[rows,setRows]=useState<Row[]>([]),[components,setComponents]=useState<Row[]>([]),[open,setOpen]=useState(false),[processing,setProcessing]=useState(false),[msg,setMsg]=useState('');
 const load=async()=>{const [p,c]=await Promise.all([supabase.from('hris_payroll').select('*').eq('periode',period).order('id_karyawan'),supabase.from('hris_payroll_komponen').select('*').eq('status','Aktif').order('nama')]);setRows(p.data||[]);setComponents(c.data||[]);if(p.error)setMsg(p.error.message)};
 useEffect(()=>{load()},[period]);
 const total=rows.reduce((s,r)=>s+Number(r.gaji_bersih||0),0),paid=rows.filter(r=>r.status==='Dibayar').length,pending=rows.filter(r=>r.status==='Menunggu Approval').length;
 async function generate(){setProcessing(true);setMsg('');const {data:settings}=await supabase.from('hris_company_settings').select('overtime_multiplier').eq('id',1).maybeSingle();const multiplier=Number(settings?.overtime_multiplier||2);const startDate=`${period}-01`;const [y,m]=period.split('-').map(Number);const next=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10);let failed=false;for(const e of employees.filter(x=>x.status_aktif!==false)){const base=Number(e.gaji_pokok||0);const {data:atts,error:ae}=await supabase.from('absensi').select('lembur_menit').eq('id_karyawan',e.id_karyawan||'').gte('tanggal',startDate).lt('tanggal',next);if(ae){setMsg(ae.message);failed=true;break}const minutes=(atts||[]).reduce((sum,a)=>sum+Math.max(0,Number(a.lembur_menit||0)),0);const overtime=Math.round((base/173)*(minutes/60)*multiplier);const {error}=await supabase.from('hris_payroll').upsert({id_karyawan:e.id_karyawan,periode:period,gaji_pokok:base,lembur:overtime,status:'Draft',catatan:`Generated ${new Date().toISOString()}`},{onConflict:'id_karyawan,periode'});if(error){setMsg(error.message);failed=true;break}}setProcessing(false);await load();if(!failed)setMsg(t('payroll_created_review'));}
 async function submit(r:Row){const {error}=await supabase.rpc('hris_submit_approval',{p_modul:'payroll',p_record_id:String(r.id)});if(error)setMsg(error.message);else{await supabase.from('hris_payroll').update({status:'Menunggu Approval'}).eq('id',r.id);setMsg(t('payroll_submitted'));await load()}}
  async function approve(r:Row){const {data:req,error:findError}=await supabase.from('hris_approval_requests').select('id').eq('modul','payroll').eq('record_id',String(r.id)).eq('status','Menunggu').maybeSingle();if(findError){setMsg(findError.message);return}if(!req){setMsg(t('payroll_approval_not_found'));return}const {error}=await supabase.rpc('hris_decide_approval',{p_id:req.id,p_status:'Disetujui',p_catatan:null});if(error){setMsg(error.message);return}setMsg(t('payroll_approved'));await load()}
 async function lock(r:Row){const ref=window.prompt(t("payment_reference_optional"),'');if(ref===null)return;const {error}=await supabase.rpc('hris_lock_payroll',{p_payroll_id:r.id,p_reference:ref||null});if(error)setMsg(error.message);else{setMsg(t('payroll_locked_paid'));load()}}
  if(view==='components'){
    return <>
      <Heading title={t('payroll_components')} desc={t('manage_payroll_components')} action={t('add_component')} onAction={()=>setOpen(true)}/>
      {msg&&<div className="alert">{msg}</div>}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('component_name')}</th>
                <th>Tipe</th>
                <th>{t('default_amount')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {components.length?components.map(c=>
                <tr key={c.id}>
                  <td><b>{c.nama}</b></td>
                  <td>{c.tipe||'—'}</td>
                  <td>{money(c.nominal_default)}</td>
                  <td><Status v={c.status||'Aktif'}/></td>
                </tr>
              ):<Empty cols={4}/>}
            </tbody>
          </table>
        </div>
      </div>
      {open&&<PayrollComponentsModal rows={components} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false);load()}}/>}
    </>
  }

  if(view==='overtime'){
    return <PayrollOvertimeView period={period} setPeriod={setPeriod}/>
  }

  if(view==='payslip'){
    return <>
      <Heading title={t('payroll_payslip')} desc={t('payroll_ready_payslip')}/>
      <div className="toolbar-panel">
        <label>{t('period')}<input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></label>
        <div className="stat-inline"><b>{rows.length}</b><span>{t('payroll_payslip')}</span></div>
      </div>
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('employee')}</th>
                <th>{t('basic_salary')}</th>
                <th>{t('income')}</th>
                <th>{t('deductions')}</th>
                <th>{t('net_salary')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length?rows.map(r=>
                <tr key={r.id}>
                  <td><b>{r.id_karyawan}</b></td>
                  <td>{money(r.gaji_pokok)}</td>
                  <td>{money(r.total_pendapatan)}</td>
                  <td>{money(r.total_potongan)}</td>
                  <td><b>{money(r.gaji_bersih)}</b></td>
                  <td><Status v={r.status}/></td>
                </tr>
              ):<Empty cols={6}/>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  }

  return <><Heading title={t('payroll_enterprise')}  desc={t('payroll_enterprise_desc')} action={processing?t("processing"):t("generate_payroll")} onAction={generate}/><div className="toolbar-panel"><label>{t('period')}<input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></label><div className="stat-inline"><b>{rows.length}</b><span>{t("payroll")}</span></div><div className="stat-inline"><b>{pending}</b><span>{t('pending_approval')}</span></div><div className="stat-inline"><b>{paid}</b><span>{t('paid')}</span></div><div className="stat-inline"><b>{money(total)}</b><span>{t('total_net_pay')}</span></div><button className="secondary" onClick={()=>setOpen(true)}>{t('components')}</button></div>{msg&&<div className="alert">{msg}</div>}<div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>{t('employee')}</th><th>{t('basic_salary')}</th><th>{t("overtime")}</th><th>{t('income')}</th><th>{t('deductions')}</th><th>{t('net_salary')}</th><th>{t('status')}</th><th>{t("action")}</th></tr></thead><tbody>{rows.length?rows.map(r=><tr key={r.id}><td><b>{r.id_karyawan}</b></td><td>{money(r.gaji_pokok)}</td><td>{money(r.lembur)}</td><td>{money(r.total_pendapatan)}</td><td>{money(r.total_potongan)}</td><td><b>{money(r.gaji_bersih)}</b></td><td><Status v={r.status}/>{r.locked_at&&<small> {t("locked")}</small>}</td><td><div className="row-actions">{r.status==="Draft"&&<button className="link-btn" onClick={()=>submit(r)}>{t('submit')}</button>}{r.status==="Menunggu Approval"&&<button className="primary" onClick={()=>approve(r)}>{t('approve')}</button>}{r.status==="Disetujui"&&<button className="primary" onClick={()=>lock(r)}>{t('pay_and_lock')}</button>}</div></td></tr>):<Empty cols={8}/>}</tbody></table></div></div>{open&&<PayrollComponentsModal rows={components} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false);load()}}/>}</>
}
function PayrollOvertimeView({period,setPeriod}:{period:string;setPeriod:(v:string)=>void}){const {t}=useTranslation();
  const [rows,setRows]=useState<Row[]>([]);
  const [loading,setLoading]=useState(true);
  const [msg,setMsg]=useState('');

  useEffect(()=>{
    let cancelled=false;

    async function load(){
      setLoading(true);
      setMsg('');

      const start=`${period}-01`;
      const [y,m]=period.split('-').map(Number);
      const next=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10);

      const {data,error}=await supabase
        .from('hris_lembur')
        .select('*')
        .gte('tanggal',start)
        .lt('tanggal',next)
        .order('tanggal',{ascending:false});

      if(cancelled)return;

      if(error){
        setRows([]);
        setMsg(error.message);
      }else{
        setRows(data||[]);
      }

      setLoading(false);
    }

    load();

    return ()=>{cancelled=true};
  },[period]);

  const approved=rows.filter(r=>r.status==='Disetujui');
  const pending=rows.filter(r=>r.status==='Menunggu');
  const rejected=rows.filter(r=>r.status==='Ditolak');
  const totalMinutes=approved.reduce((sum,r)=>sum+Math.max(0,Number(r.menit||0)),0);
  const totalNominal=approved.reduce((sum,r)=>sum+Math.max(0,Number(r.nominal||0)),0);

  return <>
    <Heading
      title={t("payroll_overtime")}
      desc={t("overtime_period_desc")}
    />

    <div className="toolbar-panel">
      <label>
        Periode
        <input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/>
      </label>

      <div className="stat-inline">
        <b>{approved.length}</b>
        <span>{t('approved')}</span>
      </div>

      <div className="stat-inline">
        <b>{pending.length}</b>
        <span>{t('pending')}</span>
      </div>

      <div className="stat-inline">
        <b>{rejected.length}</b>
        <span>{t('rejected')}</span>
      </div>

      <div className="stat-inline">
        <b>{totalMinutes}</b>
        <span>{t('total_minutes')}</span>
      </div>

      <div className="stat-inline">
        <b>{money(totalNominal)}</b>
        <span>{t('total_amount')}</span>
      </div>
    </div>

    {msg&&<div className="alert">{msg}</div>}

    <div className="panel table-panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('date')}</th>
              <th>{t('employee_id')}</th>
              <th>{t('minutes')}</th>
              <th>{t('amount')}</th>
              <th>{t('status')}</th>
              <th>{t('reason')}</th>
              <th>{t('approved_by')}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <Empty cols={7}/>
              : rows.length
                ? rows.map(r=>
                  <tr key={r.id}>
                    <td>{r.tanggal||'—'}</td>
                    <td><b>{r.id_karyawan||'—'}</b></td>
                    <td>{Number(r.menit||0)} menit</td>
                    <td>{money(r.nominal)}</td>
                    <td><Status v={r.status||'—'}/></td>
                    <td>{r.alasan||'—'}</td>
                    <td>{r.disetujui_oleh||'—'}</td>
                  </tr>
                )
                : <Empty cols={7}/>
            }
          </tbody>
        </table>
      </div>
    </div>
  </>
}

function PayrollComponentsModal({rows,onClose,onSaved}:{rows:Row[];onClose:()=>void;onSaved:()=>void}){const {t}=useTranslation();const [f,setF]=useState({nama:'',tipe:'Tunjangan',nominal_default:'0'});async function save(e:FormEvent){e.preventDefault();const {error}=await supabase.from('hris_payroll_komponen').insert({nama:f.nama.trim(),tipe:f.tipe,nominal_default:Number(f.nominal_default||0),status:'Aktif'});if(error)alert(error.message);else onSaved()}return <Modal title={t("payroll_components")} onClose={onClose} onSubmit={save}><label>{t('component_name')}<input required value={f.nama} onChange={e=>setF({...f,nama:e.target.value})}/></label><label>{t("type")}<select value={f.tipe} onChange={e=>setF({...f,tipe:e.target.value})}><option value="Tunjangan">{t("allowance")}</option><option>{t('deductions')}</option></select></label><label>{t('default_amount')}<input type="number" min="0" value={f.nominal_default} onChange={e=>setF({...f,nominal_default:e.target.value})}/></label><div className="panel"><b>{rows.length}</b> {t("active_components")}</div></Modal>}

export function RecruitmentEnterprise(){const {t}=useTranslation();
 const [tab,setTab]=useState('dashboard'),[vac,setVac]=useState<Row[]>([]),[cand,setCand]=useState<Row[]>([]),[inter,setInter]=useState<Row[]>([]),[history,setHistory]=useState<Row[]>([]),[score,setScore]=useState<Row[]>([]),[modal,setModal]=useState<'vacancy'|'candidate'|'interview'|'score'|null>(null),[selected,setSelected]=useState<Row|null>(null);
 const load=async()=>{const [v,c,i]=await Promise.all([supabase.from('hris_lowongan').select('*').order('created_at',{ascending:false}),supabase.from('hris_kandidat').select('*').order('created_at',{ascending:false}),supabase.from('hris_interview').select('*').order('tanggal',{ascending:false})]);setVac(v.data||[]);setCand(c.data||[]);setInter(i.data||[])};useEffect(()=>{load()},[]);
 const stages=['Screening','Interview','Assessment','Offering','Hired','Rejected'];
 async function move(c:Row,stage:string){const {error}=await supabase.from('hris_kandidat').update({tahap:stage,status:stage==='Rejected'?'Ditolak':stage==='Hired'?'Diterima':'Aktif'}).eq('id',c.id);if(error)alert(error.message);else load()}
 async function showHistory(c:Row){setSelected(c);const {data}=await supabase.from('hris_kandidat_history').select('*').eq('kandidat_id',c.id).order('created_at',{ascending:false});setHistory(data||[]);setTab('history')}
 async function showScore(c:Row){setSelected(c);const {data}=await supabase.from('hris_interview_scorecard').select('*').eq('interview_id',c.id).order('created_at');setScore(data||[]);setModal('score')}
 const active=vac.filter(v=>v.status==='Open').length, hiring=cand.filter(c=>c.tahap==='Hired').length;
 return <><Heading title={t("recruitment_ats")} desc={t("recruitment_desc")} action={t("add_vacancy")} onAction={()=>setModal('vacancy')}/><div className="mini-kpi-row"><div className="stat-card"><span>{t("active_vacancies")}</span><strong>{active}</strong></div><div className="stat-card"><span>{t("total_candidates")}</span><strong>{cand.length}</strong></div><div className="stat-card"><span>{t("interviews")}</span><strong>{inter.filter(i=>i.status==='Terjadwal').length}</strong></div><div className="stat-card"><span>{t("hired")}</span><strong>{hiring}</strong></div></div><Branch items={[{key:'dashboard',label:t('pipeline')},{key:'vacancies',label:t('vacancies')},{key:'candidates',label:t('candidates')},{key:'interviews',label:t('interviews')}]} tab={tab} setTab={setTab}/>{tab==='dashboard'&&<div className="kanban-grid">{stages.map(s=><div className="kanban-col" key={s}><div className="kanban-head"><b>{s}</b><span>{cand.filter(c=>c.tahap===s).length}</span></div>{cand.filter(c=>c.tahap===s).map(c=><div className="kanban-card" key={c.id}><b>{c.nama}</b><small>{c.posisi||'—'}</small><select value={c.tahap||'Screening'} onChange={e=>move(c,e.target.value)}>{stages.map(x=><option key={x}>{x}</option>)}</select><button className="link-btn" onClick={()=>showHistory(c)}>{t("history")}</button></div>)}</div>)}</div>}{tab==='vacancies'&&<Table title={t("vacancies")} action={t("add")} onAction={()=>setModal('vacancy')} headers={['Posisi','Departemen','Kebutuhan','Status','Buka','Tutup']} rows={vac.map(v=>[<b>{v.posisi}</b>,v.departemen||'—',v.jumlah_kebutuhan,<Status v={v.status}/>,v.tanggal_buka||'—',v.tanggal_tutup||'—'])}/>} {tab==='candidates'&&<Table title={t("candidates")} action={t("add")} onAction={()=>setModal('candidate')} headers={['Nama','Kontak','Posisi','Sumber','Tahap','Status','Aksi']} rows={cand.map(c=>[<b>{c.nama}</b>,c.email||c.no_telp||'—',c.posisi||'—',c.sumber||'—',<Status v={c.tahap}/>,<Status v={c.status}/>,<button className="link-btn" onClick={()=>showHistory(c)}>{t("detail")}</button>])}/>} {tab==='interviews'&&<Table title={t("interviews")} action={t("add")} onAction={()=>setModal('interview')} headers={['Kandidat','Tanggal','Jam','Interviewer','Hasil','Status','Scorecard']} rows={inter.map(i=>[i.kandidat,i.tanggal,i.jam||'—',i.interviewer||'—',i.hasil||'—',<Status v={i.status}/>,<button className="link-btn" onClick={()=>showScore(i)}>{t("scorecard")}</button>])}/>} {tab==='history'&&<Table title={`Riwayat ${selected?.nama||''}`} headers={['Waktu','Dari','Ke','Actor','Catatan']} rows={history.map(h=>[h.created_at?.replace('T',' ').slice(0,19),h.dari_tahap||'—',h.ke_tahap,h.actor_email||'—',h.catatan||'—'])}/>} {modal==='vacancy'&&<VacancyModal onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load()}}/>}{modal==='candidate'&&<CandidateModal onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load()}}/>}{modal==='interview'&&<InterviewModal candidates={cand} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load()}}/>}{modal==='score'&&selected&&<ScorecardModal interview={selected} rows={score} onClose={()=>setModal(null)} onSaved={()=>{setModal(null)}}/>}</>
}
function Table({title,action,onAction,headers,rows}:{title:string;action?:string;onAction?:()=>void;headers:string[];rows:ReactNode[][]}){return <div className="panel table-panel"><div className="panel-head"><div><h2>{title}</h2><p>{rows.length} record</p></div>{action&&<button className="primary" onClick={onAction}>{action}</button>}</div><div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>):<Empty cols={headers.length}/>}</tbody></table></div></div>}
function VacancyModal({onClose,onSaved}:{onClose:()=>void;onSaved:()=>void}){const [f,setF]=useState({posisi:'',departemen:'',jumlah_kebutuhan:'1',status:'Open',tanggal_buka:today(),tanggal_tutup:'',deskripsi:''});async function save(e:FormEvent){e.preventDefault();const {error}=await supabase.from('hris_lowongan').insert({...f,posisi:f.posisi.trim(),jumlah_kebutuhan:Number(f.jumlah_kebutuhan)});if(error)alert(error.message);else onSaved()}return <Modal title="Buat Lowongan" onClose={onClose} onSubmit={save}><label>Posisi<input required value={f.posisi} onChange={e=>setF({...f,posisi:e.target.value})}/></label><label>Departemen<input value={f.departemen} onChange={e=>setF({...f,departemen:e.target.value})}/></label><label>Jumlah<input type="number" min="1" value={f.jumlah_kebutuhan} onChange={e=>setF({...f,jumlah_kebutuhan:e.target.value})}/></label><label>Tanggal Buka<input type="date" value={f.tanggal_buka} onChange={e=>setF({...f,tanggal_buka:e.target.value})}/></label><label>Tanggal Tutup<input type="date" value={f.tanggal_tutup} onChange={e=>setF({...f,tanggal_tutup:e.target.value})}/></label><label>Deskripsi<textarea value={f.deskripsi} onChange={e=>setF({...f,deskripsi:e.target.value})}/></label></Modal>}
function CandidateModal({onClose,onSaved}:{onClose:()=>void;onSaved:()=>void}){const [f,setF]=useState({nama:'',email:'',no_telp:'',posisi:'',sumber:'Website',tahap:'Screening',status:'Aktif',catatan:''});async function save(e:FormEvent){e.preventDefault();const {error}=await supabase.from('hris_kandidat').insert(f);if(error)alert(error.message);else onSaved()}return <Modal title="Tambah Kandidat" onClose={onClose} onSubmit={save}><label>Nama<input required value={f.nama} onChange={e=>setF({...f,nama:e.target.value})}/></label><label>Email<input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label><label>No. Telepon<input value={f.no_telp} onChange={e=>setF({...f,no_telp:e.target.value})}/></label><label>Posisi<input value={f.posisi} onChange={e=>setF({...f,posisi:e.target.value})}/></label><label>Sumber<input value={f.sumber} onChange={e=>setF({...f,sumber:e.target.value})}/></label><label>Catatan<textarea value={f.catatan} onChange={e=>setF({...f,catatan:e.target.value})}/></label></Modal>}
function InterviewModal({candidates,onClose,onSaved}:{candidates:Row[];onClose:()=>void;onSaved:()=>void}){const {t}=useTranslation();const [f,setF]=useState({kandidat:'',kandidat_id:'',tanggal:today(),jam:'09:00',interviewer:'',jenis:'Interview',hasil:'',status:'Terjadwal',catatan:''});async function save(e:FormEvent){e.preventDefault();const c=candidates.find(x=>x.id===f.kandidat_id);const {error}=await supabase.from('hris_interview').insert({...f,kandidat:c?.nama||f.kandidat});if(error)alert(error.message);else onSaved()}return <Modal title="Jadwalkan Interview" onClose={onClose} onSubmit={save}><label>Kandidat<select required value={f.kandidat_id} onChange={e=>setF({...f,kandidat_id:e.target.value})}><option value="">Pilih kandidat</option>{candidates.map(c=><option key={c.id} value={c.id}>{c.nama} — {c.posisi||'—'}</option>)}</select></label><label>{t('date')}<input type="date" required value={f.tanggal} onChange={e=>setF({...f,tanggal:e.target.value})}/></label><label>Jam<input type="time" value={f.jam} onChange={e=>setF({...f,jam:e.target.value})}/></label><label>Interviewer<input value={f.interviewer} onChange={e=>setF({...f,interviewer:e.target.value})}/></label><label>Jenis<input value={f.jenis} onChange={e=>setF({...f,jenis:e.target.value})}/></label></Modal>}
function ScorecardModal({interview,rows,onClose,onSaved}:{interview:Row;rows:Row[];onClose:()=>void;onSaved:()=>void}){const [f,setF]=useState({kompetensi:'',skor:'0',catatan:''});async function save(e:FormEvent){e.preventDefault();const {error}=await supabase.from('hris_interview_scorecard').insert({interview_id:interview.id,kompetensi:f.kompetensi,skor:Number(f.skor),catatan:f.catatan});if(error)alert(error.message);else{setF({kompetensi:'',skor:'0',catatan:''});onSaved()}}return <Modal title={`Scorecard — ${interview.kandidat||''}`} onClose={onClose} onSubmit={save} submit="Tambah Nilai"><label>Kompetensi<input required value={f.kompetensi} onChange={e=>setF({...f,kompetensi:e.target.value})}/></label><label>Skor (0–100)<input type="number" min="0" max="100" value={f.skor} onChange={e=>setF({...f,skor:e.target.value})}/></label><label>Catatan<textarea value={f.catatan} onChange={e=>setF({...f,catatan:e.target.value})}/></label><div className="panel"><b>{rows.length}</b> penilaian tersimpan.</div></Modal>}

export function RoleEditorEnterprise({userRole}:{userRole:string}){const {t}=useTranslation();
 const [roles,setRoles]=useState<Row[]>([]),[selected,setSelected]=useState(''),[perms,setPerms]=useState<Set<string>>(new Set()),[newRole,setNewRole]=useState(''),[filter,setFilter]=useState('');
 const all=['people.read','people.write','people.delete','attendance.read','attendance.write','schedule.read','schedule.write','leave.read','leave.write','leave.approve','overtime.read','overtime.write','overtime.approve','payroll.read','payroll.write','payroll.approve','payroll.pay','payroll.lock','talent.read','talent.write','recruitment.read','recruitment.write','recruitment.approve','reports.read','reports.export','settings.write','roles.read','roles.write','audit.read','approval.read'];
 const load=async()=>{const {data}=await supabase.from('hris_roles').select('*').order('nama');setRoles(data||[]);if(!selected&&data?.length)setSelected(data[0].nama)};useEffect(()=>{load()},[]);useEffect(()=>{if(!selected)return;supabase.from('hris_role_permissions').select('permission_code').eq('role_name',selected).then(({data})=>setPerms(new Set((data||[]).map(x=>x.permission_code))))},[selected]);
 async function save(){if(userRole!=='Super Admin'||!selected)return;for(const code of all){const has=perms.has(code);const {data:existing}=await supabase.from('hris_role_permissions').select('id').eq('role_name',selected).eq('permission_code',code).maybeSingle();if(has&&!existing)await supabase.from('hris_role_permissions').insert({role_name:selected,permission_code:code});if(!has&&existing)await supabase.from('hris_role_permissions').delete().eq('id',existing.id)}alert(t('permission_saved'));}
 async function create(){const name=newRole.trim();if(!name)return;const {error}=await supabase.from('hris_roles').insert({nama:name,deskripsi:'Custom role',is_system:false,status:'Aktif'});if(error)alert(error.message);else{setNewRole('');load()}}
 async function deactivate(){const r=roles.find(x=>x.nama===selected);if(!r||r.is_system)return;const {error}=await supabase.from('hris_roles').update({status:r.status==='Aktif'?'Nonaktif':'Aktif'}).eq('id',r.id);if(error)alert(error.message);else load()}
 const shown=all.filter(x=>x.includes(filter.toLowerCase()));const grouped=shown.reduce<Record<string,string[]>>((a,c)=>{const g=c.split('.')[0];(a[g]??=[]).push(c);return a},{});
 return <><Heading title="Role Builder" desc="Role dinamis dengan permission granular. Otorisasi juga diperiksa server-side oleh Supabase RLS/RPC."/><div className="role-builder"><div className="panel"><h3>Roles</h3><div className="inline-form"><input placeholder="Nama role baru" value={newRole} onChange={e=>setNewRole(e.target.value)}/><button className="primary" disabled={userRole!=='Super Admin'} onClick={create}>Buat</button></div>{roles.map(r=><button className={`role-list-item ${selected===r.nama?'active':''}`} key={r.id} onClick={()=>setSelected(r.nama)}>{r.nama}<small>{r.status||'Aktif'} · {r.is_system?'System':'Custom'}</small></button>)}{selected&&<button className="secondary full" disabled={userRole!=='Super Admin'||roles.find(r=>r.nama===selected)?.is_system} onClick={deactivate}>{roles.find(r=>r.nama===selected)?.status==='Aktif'?'Nonaktifkan':'Aktifkan'} Role</button>}</div><div className="panel"><div className="panel-head"><div><h3>{selected||'Pilih role'}</h3><p>Hak akses per modul.</p></div><input className="compact-input" placeholder="Cari permission..." value={filter} onChange={e=>setFilter(e.target.value)}/></div>{Object.entries(grouped).map(([g,codes])=><div className="permission-section" key={g}><h4>{g.toUpperCase()}</h4><div className="permission-grid">{codes.map(code=><label className="permission-item" key={code}><input type="checkbox" checked={perms.has(code)} onChange={e=>{const n=new Set(perms);e.target.checked?n.add(code):n.delete(code);setPerms(n)}}/>{code}</label>)}</div></div>)}<button className="primary" disabled={!selected||userRole!=='Super Admin'} onClick={save}>Simpan Permission</button></div></div></>
}

export function ApprovalCenter(){const {t}=useTranslation();
 const [tab,setTab]=useState<'all'|'leave'|'overtime'|'payroll'|'ess_leave'|'ess_overtime'|'ess_attendance'|'ess_profile'>('all');
 const [rows,setRows]=useState<Row[]>([]),[loading,setLoading]=useState(false),[msg,setMsg]=useState(''),[search,setSearch]=useState('');
 const load=async()=>{setLoading(true);setMsg('');let q=supabase.from('hris_approval_requests').select('*').eq('status','Menunggu').order('created_at',{ascending:false}).limit(200);if(tab!=='all')q=q.eq('modul',tab);const {data,error}=await q;setRows(data||[]);if(error)setMsg(error.message);setLoading(false)};
 useEffect(()=>{load()},[tab]);
 const decide=async(r:Row,status:'Disetujui'|'Ditolak')=>{const note=status==='Ditolak'?window.prompt(t('rejection_reason'),'')??'':'';const {error}=await supabase.rpc('hris_decide_approval',{p_id:r.id,p_status:status,p_catatan:note||null});if(error)setMsg(error.message);else{setMsg(status==='Disetujui'?t('approval_processed'):t('request_rejected'));load()}};
 const visible=rows.filter(r=>`${r.modul} ${r.record_id} ${r.requester_email||''} ${r.approver_role||''}`.toLowerCase().includes(search.toLowerCase()));
 const label=(m:string)=>({leave:'Cuti',overtime:'Lembur',payroll:'Payroll',ess_leave:'Cuti ESS',ess_overtime:'Lembur ESS',ess_attendance:'Koreksi Absensi ESS',ess_profile:'Perubahan Profil ESS'} as Record<string,string>)[m]||m;
 return <><Heading title="Pusat Kendali Persetujuan" desc="Satu inbox untuk approval HR, payroll dan seluruh pengajuan Layanan Karyawan. Keputusan diproses server-side dan dicatat ke audit trail."/><div className="branch-nav">{[['all','Semua'],['leave','Cuti'],['overtime','Lembur'],['payroll','Payroll'],['ess_leave','Cuti ESS'],['ess_overtime','Lembur ESS'],['ess_attendance','Absensi ESS'],['ess_profile','Profil ESS']].map(([k,v])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k as any)}><AdminIcon name={k} size={15}/><span>{v}</span></button>)}</div>{msg&&<div className="alert">{msg}</div>}<div className="toolbar-panel"><label>Cari persetujuan<input className="filter" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Modul, pengaju, ID..."/></label><div className="stat-inline"><b>{visible.length}</b><span>{t('pending')}</span></div><button className="secondary" onClick={load}>{t('refresh')}</button></div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Modul</th><th>Record</th><th>Requester</th><th>Approver Role</th><th>Dibuat</th><th>{t("action")}</th></tr></thead><tbody>{loading?<Empty cols={6}/>:visible.length?visible.map(r=><tr key={r.id}><td><b>{label(r.modul)}</b></td><td>{String(r.record_id).slice(0,12)}</td><td>{r.requester_email||'—'}</td><td><Status v={r.approver_role||'Super Admin'}/></td><td>{r.created_at?new Date(r.created_at).toLocaleString('id-ID'):'—'}</td><td><div className="row-actions"><button className="primary" onClick={()=>decide(r,'Disetujui')}>{t('approve')}</button><button className="secondary" onClick={()=>decide(r,'Ditolak')}>{t('reject')}</button></div></td></tr>):<Empty cols={6}/>}</tbody></table></div></div></>}
