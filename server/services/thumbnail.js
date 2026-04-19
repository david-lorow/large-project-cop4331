let mupdfModule = null;

async function getMupdf() {
  if (!mupdfModule) mupdfModule = await import('mupdf');
  return mupdfModule;
}

/**
 * Renders the first page of a PDF buffer to a low-resolution JPEG.
 * @param {Buffer} pdfBuffer - raw PDF bytes
 * @param {number} targetWidth - desired thumbnail width in pixels
 * @returns {Promise<Buffer>} JPEG image buffer
 */
async function generateThumbnail(pdfBuffer, targetWidth = 400) {
  const mupdf = await getMupdf();

  const doc = mupdf.Document.openDocument(pdfBuffer, 'application/pdf');
  const page = doc.loadPage(0);

  const [x0, y0, x1, y1] = page.getBounds();
  const pageWidth = x1 - x0;
  const scale = targetWidth / pageWidth;

  const pixmap = page.toPixmap([scale, 0, 0, scale, 0, 0], mupdf.ColorSpace.DeviceRGB, false, true);
  return Buffer.from(pixmap.asJPEG(75, false));
}

module.exports = { generateThumbnail };
