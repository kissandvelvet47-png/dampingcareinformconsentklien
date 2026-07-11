import { forwardRef } from 'react';
import { FormData } from '../types';

const LOGO_SRC = '/cropped_circle_image.png';

const CONSENT_TEXT =
  'Saya menyatakan bahwa saya telah membaca, memahami, dan menyetujui informasi mengenai layanan Dampingcare. Saya memberikan persetujuan agar layanan dilaksanakan sesuai dengan kesepakatan yang telah dibuat.';

interface Props {
  data: FormData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '_______________';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

function OfficialLegalDocument({ data }: Props) {
  return (
    <div
      className="doc-page doc-legal"
      style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '11pt', lineHeight: '1.7', border: '1.5px solid #111' }}
    >
      {/* Top bar: doc number left, date right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ fontSize: '9pt', color: '#555' }}>
          No. Dokumen: <strong>{data.nomorDokumen || '—'}</strong>
        </div>
        <div style={{ fontSize: '9pt', color: '#555' }}>
          Tanggal: {formatDate(data.tanggal)}
        </div>
      </div>

      {/* Centered logo + title */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <img src={LOGO_SRC} alt="Dampingcare" style={{ width: '72px', height: '72px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 700, fontSize: '16pt', letterSpacing: '3px', textTransform: 'uppercase' }}>
          Inform Consent
        </div>
        <div style={{ fontSize: '10pt', color: '#444', marginTop: '2px' }}>
          Persetujuan Pelaksanaan Layanan Dampingcare
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #111', margin: '0 0 16px 0' }} />

      {/* Identity section */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', fontSize: '10.5pt' }}>
        <tbody>
          {[
            ['Nama Pasien', data.namaPasien || '—'],
            ['Nama Pengisi', data.namaPengisi || '—'],
            ['Hubungan dengan Pasien', data.hubungan || '—'],
            ['Nama Pelaksana', data.namaPelaksana || '—'],
          ].map(([label, val]) => (
            <tr key={label}>
              <td style={{ width: '42%', padding: '5px 8px', fontWeight: 600, verticalAlign: 'top', borderBottom: '1px solid #ddd' }}>{label}</td>
              <td style={{ padding: '5px 8px', verticalAlign: 'top', borderBottom: '1px solid #ddd' }}>: {val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Body */}
      <p style={{ textAlign: 'justify', marginBottom: '22px', fontSize: '11pt', lineHeight: 1.8 }}>
        {CONSENT_TEXT}
      </p>

      {/* Signature block */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          <div style={{ fontSize: '10.5pt', marginBottom: '4px' }}>Pengisi,</div>
          <div style={{ border: '1px solid #111', width: '200px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
            {data.signatureDataUrl
              ? <img src={data.signatureDataUrl} alt="ttd" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              : <span style={{ color: '#ccc', fontSize: '9pt' }}>—</span>
            }
          </div>
          <div style={{ fontSize: '10pt', borderTop: '1px solid #333', paddingTop: '4px', minWidth: '180px' }}>
            {data.namaPengisi || '___________________'}
          </div>
          <div style={{ fontSize: '9pt', color: '#555' }}>{formatDate(data.tanggal)}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #aaa', fontSize: '8.5pt', color: '#777', textAlign: 'center' }}>
        Dokumen ini dibuat secara digital melalui Sistem Dampingcare.
      </div>
    </div>
  );
}

const DocumentPreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  return (
    <div ref={ref} className="doc-preview-outer">
      <OfficialLegalDocument data={data} />
    </div>
  );
});

DocumentPreview.displayName = 'DocumentPreview';

export default DocumentPreview;
