// ---------- utilidades ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const alertBox = $('#alert');
const setText = (el, txt) => el && (el.textContent = txt);
const showAlert = (msg) => { alertBox.hidden = !msg; setText(alertBox, msg || ''); };
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

function debounce(fn, wait = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

// ---------- elementos ----------
const el = {
  form: $('#qrForm'),
  qrcode: $('#qrcode'),
  defaultImg: $('#qrcode img'),
  previewLabel: $('#previewLabel'),

  text: $('#text'),
  dotColor: $('#dotColor'),
  bgColor: $('#bgColor'),
  size: $('#size'),
  sizeVal: $('#sizeVal'),
  margin: $('#margin'),
  marginVal: $('#marginVal'),
  ecc: $('#ecc'),
  dotType: $('#dotType'),
  cornerSquare: $('#cornerSquare'),
  cornerDot: $('#cornerDot'),

  logo: $('#logo'),
  logoSize: $('#logoSize'),
  logoSizeVal: $('#logoSizeVal'),
  logoMargin: $('#logoMargin'),
  logoMarginVal: $('#logoMarginVal'),
  hideBgDots: $('#hideBgDots'),

  btnGenerate: $('#btnGenerate'),
  btnPng: $('#btnPng'),
  btnSvg: $('#btnSvg'),
  btnReset: $('#btnReset')
};

// ---------- helpers preview ----------
function hideDefaultImage(){ if (el.defaultImg) el.defaultImg.style.display = 'none'; }
function showDefaultImage(){ if (el.defaultImg) el.defaultImg.style.display = ''; }
function clearQrCanvas(){
  [...el.qrcode.children].forEach(n=>{
    if(['canvas','svg'].includes((n.tagName||'').toLowerCase())) el.qrcode.removeChild(n);
  });
}
function showPreviewLabel(show){
  if(!el.previewLabel) return;
  el.previewLabel.style.display = show ? '' : 'none';
}

// ---------- estado + instancia ----------
let imageDataUrl = ''; // logo del usuario

const state = {
  width: 320,
  height: 320,
  margin: 12,
  data: '',
  type: 'canvas',
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: 'Q'
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.6,
    crossOrigin: 'anonymous',
    margin: 0
  },
  dotsOptions: {
    type: 'extra-rounded',
    color: '#000000'
  },
  backgroundOptions: {
    color: '#ffffff'
  },
  cornersSquareOptions: {},
  cornersDotOptions: {}
};

const qr = new QRCodeStyling(state);

// ---------- ajustes automáticos ----------
let userForcedECC = null; // si el usuario cambia manualmente, lo respetamos

function autoTune(){
  if(userForcedECC){ state.qrOptions.errorCorrectionLevel = userForcedECC; return; }

  const hasLogo = !!imageDataUrl && state.imageOptions.imageSize > 0.05;
  const sizePct = clamp(parseInt(el.logoSize.value || '60',10),0,100);
  const len = (state.data || '').length;

  if(hasLogo){
    // con logo: asegura margen y ECC alto
    if(sizePct >= 70)      state.qrOptions.errorCorrectionLevel = 'H';
    else                   state.qrOptions.errorCorrectionLevel = 'Q';
    if(state.margin < 12)  state.margin = 12;
  }else{
    // sin logo: suaviza ECC según longitud
    if(len > 120)          state.qrOptions.errorCorrectionLevel = 'M';
    else if(len > 60)      state.qrOptions.errorCorrectionLevel = 'M';
    else                   state.qrOptions.errorCorrectionLevel = 'L';
  }

  // reflejar en el select si no fue forzado
  el.ecc.value = state.qrOptions.errorCorrectionLevel;
  el.margin.value = String(state.margin);
  setText(el.marginVal, `${state.margin} px`);
}

function applyUIToState(){
  state.width = parseInt(el.size.value,10);
  state.height = state.width;
  state.margin = parseInt(el.margin.value,10);

  state.dotsOptions.type  = el.dotType.value;
  state.dotsOptions.color = el.dotColor.value;
  state.backgroundOptions.color = el.bgColor.value;

  state.cornersSquareOptions = el.cornerSquare.value ? { type: el.cornerSquare.value } : {};
  state.cornersDotOptions    = el.cornerDot.value ? { type: el.cornerDot.value } : {};

  state.image = imageDataUrl || '';
  state.imageOptions.imageSize = parseInt(el.logoSize.value,10) / 100;
  state.imageOptions.margin = parseInt(el.logoMargin.value,10);
  state.imageOptions.hideBackgroundDots = el.hideBgDots.checked;

  autoTune();
}

const updateQR = debounce(() => {
  try{
    if(!state.data){
      clearQrCanvas();
      showDefaultImage();
      showPreviewLabel(true);
      return;
    }
    applyUIToState();
    hideDefaultImage();
    showPreviewLabel(false);
    clearQrCanvas();
    qr.update(state);
    qr.append(el.qrcode);
    showAlert('');
  }catch(err){
    console.error(err);
    showAlert('No fue posible actualizar el QR. Revise los parámetros.');
  }
}, 120);

// ---------- eventos ----------
el.text.addEventListener('input', () => { state.data = el.text.value.trim(); updateQR(); });

['dotColor','bgColor','dotType','cornerSquare','cornerDot','hideBgDots']
  .forEach(id => el[id].addEventListener('change', updateQR));

el.size.addEventListener('input', () => { setText(el.sizeVal, `${el.size.value} px`); updateQR(); });
el.margin.addEventListener('input', () => { setText(el.marginVal, `${el.margin.value} px`); updateQR(); });
el.logoSize.addEventListener('input', () => { setText(el.logoSizeVal, `${el.logoSize.value}%`); updateQR(); });
el.logoMargin.addEventListener('input', () => { setText(el.logoMarginVal, `${el.logoMargin.value} px`); updateQR(); });

// ECC manual -> respetar preferencia hasta que el usuario limpie
el.ecc.addEventListener('change', () => {
  userForcedECC = el.ecc.value; // respeta manual
  state.qrOptions.errorCorrectionLevel = userForcedECC;
  updateQR();
});

// Logo
el.logo.addEventListener('change', () => {
  const file = el.logo.files && el.logo.files[0];
  if(!file){ imageDataUrl=''; updateQR(); return; }
  if(!file.type.startsWith('image/')){ showAlert('El archivo debe ser imagen.'); el.logo.value=''; return; }
  const fr = new FileReader();
  fr.onload = () => { imageDataUrl = fr.result; updateQR(); };
  fr.readAsDataURL(file);
});

// Botones
el.btnGenerate.addEventListener('click', () => {
  if(!el.text.value.trim()){ showAlert('Ingrese texto o un enlace para generar el QR.'); return; }
  state.data = el.text.value.trim(); updateQR();
});
el.btnPng.addEventListener('click', async () => {
  if(!state.data){ showAlert('No hay contenido para descargar.'); return; }
  try{ await qr.download({ name: 'codigo_qr', extension: 'png' }); }catch(e){ console.error(e); showAlert('No se pudo descargar PNG.'); }
});
el.btnSvg.addEventListener('click', async () => {
  if(!state.data){ showAlert('No hay contenido para descargar.'); return; }
  try{ await qr.download({ name: 'codigo_qr', extension: 'svg' }); }catch(e){ console.error(e); showAlert('No se pudo descargar SVG.'); }
});
el.btnReset.addEventListener('click', () => {
  imageDataUrl='';
  userForcedECC=null;

  el.text.value='';
  el.dotColor.value='#000000';
  el.bgColor.value='#ffffff';
  el.size.value='320'; setText(el.sizeVal,'320 px');
  el.margin.value='12'; setText(el.marginVal,'12 px');
  el.ecc.value='Q';
  el.dotType.value='extra-rounded';
  el.cornerSquare.value='';
  el.cornerDot.value='';
  el.logo.value='';
  el.logoSize.value='60'; setText(el.logoSizeVal,'60%');
  el.logoMargin.value='0'; setText(el.logoMarginVal,'0 px');
  el.hideBgDots.checked=true;

  state.data='';
  applyUIToState();

  clearQrCanvas();
  showDefaultImage();
  showPreviewLabel(true);
  showAlert('');
});

// Estado inicial UI
setText(el.sizeVal, `${el.size.value} px`);
setText(el.marginVal, `${el.margin.value} px`);
setText(el.logoSizeVal, `${el.logoSize.value}%`);
setText(el.logoMarginVal, `${el.logoMargin.value} px`);
showDefaultImage();
showPreviewLabel(true);

// Regla de ECC
function calculateRecommendedECC({ hasLogo, sizePct, len }) {
  if (hasLogo) {
    return sizePct >= 70 ? 'H' : 'Q';
  }
  // sin logo:
  if (len > 120) return 'M';
  if (len > 60)  return 'M';
  return 'L';
}

// Exportar en entorno de Node (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clamp, debounce, calculateRecommendedECC };
}
