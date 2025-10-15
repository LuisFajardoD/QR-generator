// test/setupDom.js

// DOM mínimo que tu app consulta al cargarse:
document.body.innerHTML = `
  <div id="alert" hidden></div>

  <div id="qrcode"><img /></div>
  <div id="previewLabel"></div>

  <input id="text" />
  <input id="dotColor" value="#000000" />
  <input id="bgColor" value="#ffffff" />
  <input id="size" type="range" value="320" />
  <span id="sizeVal"></span>
  <input id="margin" type="range" value="12" />
  <span id="marginVal"></span>

  <select id="ecc">
    <option value="L">L</option>
    <option value="M">M</option>
    <option value="Q" selected>Q</option>
    <option value="H">H</option>
  </select>

  <select id="dotType"><option value="extra-rounded">extra-rounded</option></select>
  <select id="cornerSquare"><option value=""></option></select>
  <select id="cornerDot"><option value=""></option></select>

  <input id="logo" type="file" />
  <input id="logoSize" type="range" value="60" />
  <span id="logoSizeVal"></span>
  <input id="logoMargin" type="range" value="0" />
  <span id="logoMarginVal"></span>
  <input id="hideBgDots" type="checkbox" checked />

  <button id="btnGenerate">Generar</button>
  <button id="btnPng">PNG</button>
  <button id="btnSvg">SVG</button>
  <button id="btnReset">Limpiar</button>
`;

// Mock de la librería QR (para que no truene en test y podamos afirmar efectos):
global.QRCodeStyling = function QRCodeStylingMock() {
  this.update = jest.fn();
  this.append = (parent) => {
    const cnv = document.createElement('canvas');
    cnv.setAttribute('data-mock', '1');
    parent.appendChild(cnv);
  };
  this.download = jest.fn().mockResolvedValue();
};
