// app.test.js
require('./js/app.js');

describe('Generador de QR (UI)', () => {
  test('al generar, se inserta un canvas dentro de #qrcode', () => {
    const input = document.getElementById('text');
    const btn = document.getElementById('btnGenerate');
    const cont = document.getElementById('qrcode');

    input.value = 'Hola CI con Jest';
    input.dispatchEvent(new Event('input', { bubbles: true })); // actualiza state
    btn.click(); // llama a updateQR() (debounced)

    // avanza timers (debounce=120ms)
    jest.advanceTimersByTime(200);

    const canvas = cont.querySelector('canvas, svg');
    expect(canvas).toBeTruthy();
  });

  test('al reset, se limpia el contenedor #qrcode', () => {
    const btnReset = document.getElementById('btnReset');
    const cont = document.getElementById('qrcode');

    // Asegurarnos de que hay algo previo
    cont.appendChild(document.createElement('canvas'));

    btnReset.click();
    // update debounced
    jest.advanceTimersByTime(200);

    // No debe quedar canvas/svg
    expect(cont.querySelector('canvas, svg')).toBeNull();
  });
});
