import { useState, useRef } from 'react';
import { RotateCcw, Eye, EyeOff, FileText, FileImage, Download, Loader2 } from 'lucide-react';
import { FormData } from './types';
import { exportToDocx } from './lib/exportDocx';
import { exportToPdf, exportToPng } from './lib/exportPdfPng';
import FormPanel from './components/FormPanel';
import DocumentPreview from './components/DocumentPreview';

const defaultForm = (): FormData => ({
  namaPasien: '',
  namaPengisi: '',
  hubungan: '',
  namaPelaksana: '',
  tanggal: new Date().toISOString().slice(0, 10),
  nomorDokumen: '',
  signatureDataUrl: '',
});

type ExportState = 'idle' | 'loading';

export default function App() {
  const [form, setForm] = useState<FormData>(defaultForm());
  const [previewVisible, setPreviewVisible] = useState(true);
  const [exportState, setExportState] = useState<Record<string, ExportState>>({});
  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (updates: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setForm(defaultForm());
  };

  const withExport = async (key: string, fn: () => Promise<void>) => {
    setExportState((s) => ({ ...s, [key]: 'loading' }));
    try {
      await fn();
    } finally {
      setExportState((s) => ({ ...s, [key]: 'idle' }));
    }
  };

  const getDocPage = (): HTMLElement | null => {
    if (!previewRef.current) return null;
    return previewRef.current.querySelector('.doc-page') as HTMLElement | null;
  };

  const handleExportDocx = () => withExport('docx', () => exportToDocx(form));

  const handleExportPdf = () =>
    withExport('pdf', async () => {
      const el = getDocPage();
      if (!el) return;
      await exportToPdf(el, `InformConsent_${form.nomorDokumen || 'dokumen'}`);
    });

  const handleExportPng = () =>
    withExport('png', async () => {
      const el = getDocPage();
      if (!el) return;
      await exportToPng(el, `InformConsent_${form.nomorDokumen || 'dokumen'}`);
    });

  const isLoading = (key: string) => exportState[key] === 'loading';
  const anyLoading = Object.values(exportState).some((s) => s === 'loading');

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__inner">
          <img src="/cropped_circle_image.png" alt="Dampingcare" className="app-header__logo" />
          <div>
            <div className="app-header__title">Inform Consent</div>
            <div className="app-header__sub">Sistem Dokumen Dampingcare</div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-layout">
          {/* Form Column */}
          <div className="app-form-col">
            <FormPanel data={form} onChange={handleChange} />

            {/* Action Buttons */}
            <div className="action-bar">
              <button
                type="button"
                className="btn btn--secondary preview-toggle-btn"
                onClick={() => setPreviewVisible((v) => !v)}
              >
                {previewVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                {previewVisible ? 'Sembunyikan' : 'Preview'}
              </button>

              <button
                type="button"
                className={`btn btn--primary${isLoading('docx') ? ' btn--loading' : ''}`}
                onClick={handleExportDocx}
                disabled={anyLoading}
              >
                {isLoading('docx') ? <Loader2 size={14} className="spin" /> : <FileText size={14} />}
                DOCX
              </button>

              <button
                type="button"
                className={`btn btn--primary${isLoading('pdf') ? ' btn--loading' : ''}`}
                onClick={handleExportPdf}
                disabled={anyLoading}
              >
                {isLoading('pdf') ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                PDF
              </button>

              <button
                type="button"
                className={`btn btn--primary${isLoading('png') ? ' btn--loading' : ''}`}
                onClick={handleExportPng}
                disabled={anyLoading}
              >
                {isLoading('png') ? <Loader2 size={14} className="spin" /> : <FileImage size={14} />}
                PNG
              </button>

              <button
                type="button"
                className="btn btn--danger"
                onClick={handleReset}
                disabled={anyLoading}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>

          {/* Preview Column — always in DOM for html2canvas */}
          <div className={`app-preview-col${previewVisible ? '' : ' app-preview-col--hidden'}`}>
            <div className="preview-sticky">
              <div className="preview-header">
                <span className="preview-header__label">Preview Dokumen</span>
                <span className="preview-header__variant">Official Legal Document</span>
              </div>
              <div className="preview-scroll">
                <DocumentPreview ref={previewRef} data={form} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
