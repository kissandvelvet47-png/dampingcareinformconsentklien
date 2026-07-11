import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  convertInchesToTwip,
  Footer,
} from 'docx';
import { saveAs } from 'file-saver';
import { FormData } from '../types';

async function fetchImageBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

async function dataUrlToBuffer(dataUrl: string): Promise<ArrayBuffer> {
  const res = await fetch(dataUrl);
  return res.arrayBuffer();
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '_______________';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const CONSENT_TEXT =
  'Saya menyatakan bahwa saya telah membaca, memahami, dan menyetujui informasi mengenai layanan Dampingcare. Saya memberikan persetujuan agar layanan dilaksanakan sesuai dengan kesepakatan yang telah dibuat.';

export async function exportToDocx(data: FormData): Promise<void> {
  const logoBuffer = await fetchImageBuffer('/cropped_circle_image.png');

  const margin = convertInchesToTwip(0.8);
  const pageWidth = convertInchesToTwip(8.27);
  const contentWidth = pageWidth - margin * 2;

  const logoImage = new ImageRun({
    data: logoBuffer,
    transformation: { width: 72, height: 72 },
    type: 'png',
  });

  const identityRows = [
    ['Nama Pasien', data.namaPasien || '—'],
    ['Nama Pengisi', data.namaPengisi || '—'],
    ['Hubungan dengan Pasien', data.hubungan || '—'],
    ['Nama Pelaksana', data.namaPelaksana || '—'],
  ];

  let signatureImage: ImageRun | null = null;
  if (data.signatureDataUrl) {
    try {
      const sigBuffer = await dataUrlToBuffer(data.signatureDataUrl);
      signatureImage = new ImageRun({
        data: sigBuffer,
        transformation: { width: 180, height: 65 },
        type: 'png',
      });
    } catch {
      signatureImage = null;
    }
  }

  const makeIdentityTable = () =>
    new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      rows: identityRows.map(([label, val]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 42 * 50, type: WidthType.DXA },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true, size: 21, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `: ${val}`, size: 21, font: 'Times New Roman' })],
                }),
              ],
            }),
          ],
        })
      ),
    });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
            margin: { top: margin, right: margin, bottom: margin, left: margin },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA' } },
                children: [],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: 'Dokumen ini dibuat secara digital melalui Sistem Dampingcare.', size: 17, color: '777777', font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // Top bar: doc number + date
          new Paragraph({
            children: [
              new TextRun({ text: `No. Dokumen: ${data.nomorDokumen || '—'}`, size: 18, color: '555555', font: 'Times New Roman' }),
            ],
            spacing: { after: 80 },
          }),

          // Centered logo
          new Paragraph({
            children: [logoImage],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
          }),

          // Title
          new Paragraph({
            children: [new TextRun({ text: 'INFORM CONSENT', bold: true, size: 32, font: 'Times New Roman' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Persetujuan Pelaksanaan Layanan Dampingcare', size: 20, color: '444444', font: 'Times New Roman' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Divider
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '111111' } },
            children: [],
            spacing: { after: 280 },
          }),

          // Identity table
          makeIdentityTable(),

          // Consent body
          new Paragraph({
            children: [new TextRun({ text: CONSENT_TEXT, size: 22, font: 'Times New Roman' })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 300, after: 300 },
          }),

          // Signature area
          new Paragraph({
            children: [new TextRun({ text: 'Pengisi,', size: 21, font: 'Times New Roman' })],
            spacing: { before: 300, after: 80 },
          }),

          ...(signatureImage
            ? [new Paragraph({ children: [signatureImage], spacing: { after: 80 } })]
            : [new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { after: 300 } })]
          ),

          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '333333' } },
            children: [new TextRun({ text: data.namaPengisi || '___________________', size: 20, font: 'Times New Roman' })],
            spacing: { before: 80, after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: formatDate(data.tanggal) || '', size: 18, color: '555555', font: 'Times New Roman' })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `InformConsent_${data.nomorDokumen || 'dokumen'}.docx`);
}
