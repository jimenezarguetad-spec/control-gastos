const express = require('express');
const path = require('path');
const googleSheets = require('./google');
require('./telegram'); // Inicia el bot

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Obtener todos los datos
app.get('/api/datos', async (req, res) => {
    try {
        const datos = await googleSheets.leerDatos();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: 'Error leyendo Google Sheets' });
    }
});

// Guardar un nuevo registro
app.post('/api/datos', async (req, res) => {
    const { fecha, tipo, categoria, descripcion, monto } = req.body;
    try {
        await googleSheets.escribirDato([fecha, tipo, categoria, descripcion, monto]);
        res.status(200).send('Guardado');
    } catch (error) {
        res.status(500).json({ error: 'Error escribiendo en Google Sheets' });
    }
});

// Eliminar un registro (borra el contenido de la fila)
app.delete('/api/datos/:fila', async (req, res) => {
    const numeroFila = req.params.fila;
    try {
        await googleSheets.eliminarDato(numeroFila);
        res.status(200).send('Eliminado');
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando en Google Sheets' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
