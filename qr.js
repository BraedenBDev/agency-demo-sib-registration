const qrEl = document.getElementById("qr");
const msgEl = document.getElementById("msg");
const downloadBtn = document.getElementById("downloadBtn");
const backBtn = document.getElementById("backBtn");

function setMsg(text) {
  msgEl.textContent = text || "";
}

function ensureQrLib() {
  if (!window.QRCode) {
    setMsg("QR library not loaded.");
    return false;
  }
  return true;
}

function renderQr(text) {
  if (!ensureQrLib()) return;
  qrEl.innerHTML = "";
  qrEl.style.background = "#ffffff";
  new QRCode(qrEl, {
    text,
    width: 300,
    height: 300,
    correctLevel: QRCode.CorrectLevel.M,
    colorDark: "#000000",
    colorLight: "#ffffff"
  });
}

function downloadQrPng() {
  const out = buildFramedCanvas(16);
  if (!out) return;
  const a = document.createElement("a");
  a.href = out.toDataURL("image/png");
  a.download = "registration-qr.png";
  a.click();
}

function buildFramedCanvas(border) {
  const img = qrEl.querySelector("img");
  const canvas = qrEl.querySelector("canvas");
  const srcEl = img || canvas;
  if (!srcEl) return null;

  const srcW = img ? img.naturalWidth : canvas.width;
  const srcH = img ? img.naturalHeight : canvas.height;
  const out = document.createElement("canvas");
  out.width = srcW + border * 2;
  out.height = srcH + border * 2;
  const ctx = out.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(srcEl, border, border, srcW, srcH);
  return out;
}

const payload = sessionStorage.getItem("qr_payload");
if (!payload) {
  setMsg("QR data not found. Please go back and generate again.");
} else {
  renderQr(payload);
}

downloadBtn.onclick = downloadQrPng;
backBtn.onclick = () => { window.location.href = "index.html"; };
