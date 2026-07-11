import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_W_MM = 210;
const DOC_W_PX = 794;
const DOC_H_PX = 1123;
const PIXEL_RATIO = 4;

/**
 * Renders a doc-page element into a high-resolution canvas.
 * Clones the element into an off-screen fixed container so:
 *  - Overflow/height-0 of the preview panel does not clip the content.
 *  - Layout is forced to 794px (A4 at 96 dpi) before capture.
 *  - 4× pixel ratio gives ~300 DPI quality on A4.
 */
async function captureDocPage(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Off-screen container — fixed to viewport left edge, pushed far left
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;overflow:visible;z-index:-1;pointer-events:none;';
  document.body.appendChild(container);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    clone.getAttribute('style') || '',
    `width:${DOC_W_PX}px`,
    `min-height:${DOC_H_PX}px`,
    'box-shadow:none',
    'transform:none',
    'animation:none',
    'transition:none',
    'opacity:1',
    'visibility:visible',
    'position:relative',
    'top:auto',
    'left:auto',
    'overflow:visible',
  ].join(';');

  container.appendChild(clone);

  // Settle layout + external fonts + logo image
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  await new Promise<void>((r) => setTimeout(r, 400));

  const heightPx = Math.max(clone.scrollHeight, DOC_H_PX);

  try {
    return await html2canvas(clone, {
      scale: PIXEL_RATIO,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: DOC_W_PX,
      height: heightPx,
      windowWidth: DOC_W_PX,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    });
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportToPng(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await captureDocPage(element);
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

export async function exportToPdf(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await captureDocPage(element);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Keep A4 width; scale height proportionally from pixel dimensions
  const aspectRatio = canvas.height / canvas.width;
  const contentH = A4_W_MM * aspectRatio;

  pdf.addImage(imgData, 'PNG', 0, 0, A4_W_MM, contentH, undefined, 'FAST');
  pdf.save(`${filename}.pdf`);
}
