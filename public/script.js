let chartPastel = null;
let chartBarras = null;

// Cambiar entre pestañas
function mostrarSeccion(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'dashboard' || id === 'historial') cargarDatos();
}

// Modo oscuro
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
});

// Guardar nuevo registro
document.getElementById('registro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        fecha: document.getElementById('fecha').value,
        tipo: document.getElementById('tipo').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        monto: parseFloat(document.getElementById('monto').value)
    };

    try {
        const res = await fetch('/api/datos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            alert('Registro guardado exitosamente');
            document.getElementById('registro-form').reset();
            cargarDatos();
        }
    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
});

// Cargar datos desde el servidor
async function cargarDatos() {
    try {
        const res = await fetch('/api/datos');
        const filas = await res.json();
        actualizarDashboard(filas);
        actualizarTabla(filas);
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Actualizar tarjetas y gráficas
function actualizarDashboard(filas) {
    let ingresos = 0, gastos = 0;
    const gastosPorCategoria = {};

    // Ignorar la primera fila (encabezados)
    const datosValidos = filas.slice(1);

    datosValidos.forEach(fila => {
        const tipo = fila[1];
        const categoria = fila[2];
        const monto = parseFloat(fila[4]) || 0;

        if (tipo === 'Ingreso') {
            ingresos += monto;
        } else if (tipo === 'Gasto') {
            gastos += monto;
            gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;
        }
    });

    document.getElementById('total-ingresos').innerText = `$${ingresos.toFixed(2)}`;
    document.getElementById('total-gastos').innerText = `$${gastos.toFixed(2)}`;
    document.getElementById('saldo-actual').innerText = `$${(ingresos - gastos).toFixed(2)}`;

    actualizarGraficas(gastosPorCategoria);
}

function actualizarGraficas(gastosCat) {
    const ctxPastel = document.getElementById('pastelChart').getContext('2d');
    const ctxBarras = document.getElementById('barrasChart').getContext('2d');

    if (chartPastel) chartPastel.destroy();
    if (chartBarras) chartBarras.destroy();

    const etiquetas = Object.keys(gastosCat);
    const valores = Object.values(gastosCat);

    chartPastel = new Chart(ctxPastel, {
        type: 'pie',
        data: {
            labels: etiquetas,
            datasets: [{ data: valores, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] }]
        },
        options: { plugins: { title: { display: true, text: 'Gastos por Categoría' } } }
    });

    chartBarras = new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [{ label: 'Monto ($)', data: valores, backgroundColor: '#3498db' }]
        },
        options: { plugins: { title: { display: true, text: 'Comparativa de Gastos' } } }
    });
}

function actualizarTabla(filas) {
    const tbody = document.querySelector('#tabla-movimientos tbody');
    tbody.innerHTML = '';
    
    // Invertir para ver lo más reciente primero, omitiendo el encabezado
    const datosValidos = filas.slice(1).map((fila, index) => ({ fila, index: index + 2 })).reverse();

    datosValidos.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.fila[0] || ''}</td>
            <td>${item.fila[1] || ''}</td>
            <td>${item.fila[2] || ''}</td>
            <td>${item.fila[3] || ''}</td>
            <td>$${parseFloat(item.fila[4] || 0).toFixed(2)}</td>
            <td><button class="delete-btn" onclick="eliminarFila(${item.index})">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function eliminarFila(numeroFila) {
    if(!confirm('¿Seguro que deseas eliminar este registro?')) return;
    try {
        const res = await fetch(`/api/datos/${numeroFila}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Registro eliminado');
            cargarDatos();
        }
    } catch (error) {
        alert('Error al eliminar');
    }
}

// Inicializar
window.onload = cargarDatos;
