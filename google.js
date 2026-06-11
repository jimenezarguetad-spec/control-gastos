const { google } = require('googleapis');
require('dotenv').config();

const SHEET_ID = process.env.SHEET_ID;

// Configuración de autenticación
function getAuth() {
    const credentialsStr = process.env.GOOGLE_CREDENTIALS;
    if (!credentialsStr) throw new Error("Faltan las credenciales de Google");
    
    const credentials = JSON.parse(credentialsStr);
    return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
}

async function leerDatos() {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Hoja 1!A:E' // Asume que tu hoja se llama "Hoja 1"
    });
    return response.data.values || [];
}

async function escribirDato(filaArray) {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Hoja 1!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [filaArray] }
    });
}

async function eliminarDato(numeroFila) {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    // En la API de Sheets es más seguro "limpiar" la fila para no romper referencias
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `Hoja 1!A${numeroFila}:E${numeroFila}`
    });
}

module.exports = { leerDatos, escribirDato, eliminarDato };
