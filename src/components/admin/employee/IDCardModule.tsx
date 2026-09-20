import { useMemo, useRef, useState } from 'react';
import type { Karyawan } from './types';

type Employee = Karyawan & {
  foto_url?: string | null;
  foto?: string | null;
  photo_url?: string | null;
};

type Props = {
  employees: Employee[];
  companyName: string;
  logoUrl: string;
};

function safeId(employee: Employee) {
  return employee.id_karyawan || employee.id || 'EMPLOYEE';
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'ID';
}

function barcodePattern(value: string) {
  let seed = 2166136261;
  for (const ch of value) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: 36 }, () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return Math.abs(seed) % 5 + 1;
  });
}

function CardArtwork({ employee, side, companyName, logoUrl }: { employee: Employee; side: 'front' | 'back'; companyName: string; logoUrl: string }) {
  const photo = employee.foto_url || employee.foto || employee.photo_url || '';
  const id = safeId(employee);
  const pattern = barcodePattern(id);
  const width = 856, height = 540;
  const photoSvg = photo
    ? `<image href="${photo.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" x="68" y="152" width="190" height="236" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="68" y="152" width="190" height="236" rx="18" fill="#eef2f7"/><text x="163" y="286" text-anchor="middle" font-size="62" font-weight="700" fill="#101a33">${initials(employee.nama)}</text>`;

  if (side === 'back') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="856" height="540" rx="34" fill="#f8fafc"/>
      <rect width="856" height="110" rx="34" fill="#101a33"/><rect y="76" width="856" height="34" fill="#101a33"/>
      <image href="${logoUrl}" x="54" y="27" width="58" height="58" preserveAspectRatio="xMidYMid meet"/>
      <text x="132" y="65" font-family="Arial" font-size="27" font-weight="700" fill="#fff">${companyName}</text>
      <text x="54" y="165" font-family="Arial" font-size="18" font-weight="700" fill="#101a33">KARTU IDENTITAS KARYAWAN</text>
      <text x="54" y="203" font-family="Arial" font-size="16" fill="#475467">Kartu ini adalah identitas resmi pemegangnya selama tercatat sebagai karyawan.</text>
      <text x="54" y="238" font-family="Arial" font-size="16" fill="#475467">Jika ditemukan, mohon dikembalikan kepada perusahaan.</text>
      <rect x="54" y="276" width="748" height="2" fill="#d0d5dd"/>
      <text x="54" y="320" font-family="Arial" font-size="14" fill="#667085">ID VERIFIKASI</text>
      <text x="54" y="350" font-family="Arial" font-size="25" font-weight="700" fill="#101a33">${id}</text>
      <g transform="translate(54 386)">${pattern.map((n,i)=>`<rect x="${i*20}" y="0" width="${n*2}" height="58" fill="#101a33"/>`).join('')}</g>
      <text x="54" y="486" font-family="Arial" font-size="13" fill="#667085">Jangan dipinjamkan. Validasi identitas dilakukan melalui sistem HRIS.</text>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 856 540">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#101a33"/><stop offset="1" stop-color="#1e2d52"/></linearGradient></defs>
    <rect width="856" height="540" rx="34" fill="#fff"/>
    <rect width="856" height="126" rx="34" fill="url(#g)"/><rect y="92" width="856" height="34" fill="url(#g)"/>
    <image href="${logoUrl}" x="54" y="30" width="66" height="66" preserveAspectRatio="xMidYMid meet"/>
    <text x="140" y="64" font-family="Arial" font-size="28" font-weight="700" fill="#fff">${companyName}</text>
    <text x="140" y="91" font-family="Arial" font-size="14" fill="#d6ae58">EMPLOYEE IDENTIFICATION CARD</text>
    ${photoSvg}
    <text x="292" y="171" font-family="Arial" font-size="15" font-weight="700" fill="#667085">NAMA LENGKAP</text>
    <text x="292" y="205" font-family="Arial" font-size="27" font-weight="700" fill="#101a33">${employee.nama || '-'}</text>
    <text x="292" y="248" font-family="Arial" font-size="15" font-weight="700" fill="#667085">JABATAN</text>
    <text x="292" y="280" font-family="Arial" font-size="20" fill="#344054">${employee.jabatan || '-'}</text>
    <text x="292" y="324" font-family="Arial" font-size="15" font-weight="700" fill="#667085">EMPLOYEE ID</text>
    <text x="292" y="356" font-family="Arial" font-size="22" font-weight="700" fill="#101a33">${id}</text>
    <text x="292" y="400" font-family="Arial" font-size="15" font-weight="700" fill="#667085">DEPARTEMEN</text>
    <text x="292" y="430" font-family="Arial" font-size="18" fill="#344054">${employee.departemen || '-'}</text>
    <rect x="54" y="444" width="748" height="1" fill="#d0d5dd"/>
    <text x="54" y="482" font-family="Arial" font-size="13" fill="#667085">ID VERIFIKASI</text>
    <text x="54" y="507" font-family="Arial" font-size="17" font-weight="700" fill="#101a33">${id}</text>
    <text x="802" y="507" text-anchor="end" font-family="Arial" font-size="13" fill="#667085">${employee.status_aktif === false ? 'NONAKTIF' : 'AKTIF'}</text>
  </svg>`;
}

export default function IDCardModule({ employees, companyName, logoUrl }: Props) {
  const [selectedId, setSelectedId] = useState(employees[0]?.id || '');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => employees.filter(e => `${e.nama} ${e.id_karyawan || ''} ${e.jabatan || ''}`.toLowerCase().includes(query.toLowerCase())), [employees, query]);
  const employee = employees.find(e => e.id === selectedId) || filtered[0] || employees[0];

  const svg = employee ? CardArtwork({ employee, side, companyName, logoUrl }) : '';

  const downloadSvg = () => {
    if (!employee) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `ID-CARD-${safeId(employee)}-${side}.svg`; a.click(); URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    if (!employee) return;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = 1712; canvas.height = 1080;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => { if (!blob) return; const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `ID-CARD-${safeId(employee)}-${side}.png`; a.click(); URL.revokeObjectURL(u); }, 'image/png');
    };
    img.src = url;
  };

  const printCards = (ids: string[]) => {
    const list = employees.filter(e => ids.includes(e.id));
    if (!list.length) return;
    const win = window.open('', '_blank', 'width=1000,height=800'); if (!win) return;
    const cards = list.map(e => `<div class="print-card"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(CardArtwork({employee:e,side,companyName,logoUrl}))}"/></div>`).join('');
    win.document.write(`<html><head><title>ID Card ${companyName}</title><style>@page{size:A4 portrait;margin:10mm}body{font-family:Arial;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:10mm}.print-card{break-inside:avoid}.print-card img{width:100%;height:auto;display:block}</style></head><body>${cards}</body></html>`);
    win.document.close(); win.focus(); setTimeout(() => win.print(), 350);
  };

  const printCurrent = () => employee && printCards([employee.id]);
  const toggleBatch = (id: string) => setSelectedBatch(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);

  if (!employee) return <div className="panel"><p>Belum ada data karyawan untuk dibuatkan ID Card.</p></div>;

  return <div className="id-card-module">
    <div className="page-heading"><div><h1>ID Card Karyawan</h1><p>Buat, preview, download, dan print kartu identitas langsung dari database karyawan.</p></div><button className="primary" onClick={() => printCards(selectedBatch.length ? selectedBatch : [employee.id])}>🖨️ Print {selectedBatch.length ? `${selectedBatch.length} Kartu` : 'Kartu'}</button></div>
    <div className="id-card-toolbar">
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama / ID karyawan..." />
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>{filtered.map(e => <option key={e.id} value={e.id}>{e.nama} — {safeId(e)}</option>)}</select>
      <div className="side-switch"><button className={side === 'front' ? 'active' : ''} onClick={() => setSide('front')}>Depan</button><button className={side === 'back' ? 'active' : ''} onClick={() => setSide('back')}>Belakang</button></div>
    </div>
    <div className="id-card-layout">
      <div className="id-card-preview-panel panel" ref={cardRef}>
        <div className="id-card-preview" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="id-card-actions"><button className="secondary" onClick={downloadPng}>⬇️ Download PNG</button><button className="secondary" onClick={downloadSvg}>⬇️ Download SVG</button><button className="primary" onClick={printCurrent}>🖨️ Print / PDF</button></div>
        <small className="id-card-note">Untuk PDF, pilih printer <b>Save as PDF</b> pada dialog print browser. Tidak perlu mengubah data database.</small>
      </div>
      <div className="panel id-card-list"><div className="id-list-head"><div><b>Pilih untuk Batch Print</b><small>{selectedBatch.length} karyawan dipilih</small></div><button className="link-btn" onClick={() => setSelectedBatch(filtered.map(e => e.id))}>Pilih Semua</button></div>{filtered.map(e => <label className="id-employee-row" key={e.id}><input type="checkbox" checked={selectedBatch.includes(e.id)} onChange={() => toggleBatch(e.id)} /><span className="id-avatar">{initials(e.nama)}</span><span><b>{e.nama}</b><small>{safeId(e)} · {e.jabatan || '-'}</small></span></label>)}</div>
    </div>
  </div>;
}
