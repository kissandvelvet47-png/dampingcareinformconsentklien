import { FormData } from '../types';
import SignatureCanvas from './SignatureCanvas';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

export default function FormPanel({ data, onChange }: Props) {
  return (
    <div className="form-panel">
      {/* Identity Fields */}
      <div className="form-section">
        <label className="form-section-title">Data Identitas</label>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Nama Pasien <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama lengkap pasien"
              value={data.namaPasien}
              onChange={(e) => onChange({ namaPasien: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Nama Pengisi <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama pengisi formulir"
              value={data.namaPengisi}
              onChange={(e) => onChange({ namaPengisi: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Hubungan dengan Pasien <span className="optional">(Opsional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Mis. Anak kandung, Istri, dll."
              value={data.hubungan}
              onChange={(e) => onChange({ hubungan: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Nama Pelaksana <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama pelaksana layanan"
              value={data.namaPelaksana}
              onChange={(e) => onChange({ namaPelaksana: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Tanggal <span className="required">*</span></label>
            <input
              type="date"
              className="form-input"
              value={data.tanggal}
              onChange={(e) => onChange({ tanggal: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Nomor Dokumen <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="IC-2026-0001"
              value={data.nomorDokumen}
              onChange={(e) => onChange({ nomorDokumen: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="form-section">
        <label className="form-section-title">Tanda Tangan Digital</label>
        <SignatureCanvas
          value={data.signatureDataUrl}
          onChange={(sig) => onChange({ signatureDataUrl: sig })}
        />
      </div>
    </div>
  );
}
