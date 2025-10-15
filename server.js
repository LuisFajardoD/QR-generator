const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir todo el proyecto como estático
app.use(express.static(__dirname));

// Catch-all para enviar index.html en cualquier ruta
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
