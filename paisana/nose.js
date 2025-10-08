// script.js - Versión simplificada: Sin login obligatorio. Votos anónimos directos. Registro de jurado opcional para trackeo.
// Temática folclórica en mensajes. Persistencia con localStorage.

let categorias = ['Belleza Gaucha', 'Conocimiento Folclórico', 'Representación Regional (Comida)'];
let candidatas = [];
let juradoActual = null; // Opcional
let votosEnviados = new Set(); // Solo si hay jurado registrado
let chart = null;

// Persistencia
function guardarDatos() {
    localStorage.setItem('categorias', JSON.stringify(categorias));
    localStorage.setItem('candidatas', JSON.stringify(candidatas));
    if (juradoActual) localStorage.setItem('juradoActual', JSON.stringify(juradoActual));
    if (votosEnviados.size > 0) localStorage.setItem('votosEnviados', JSON.stringify(Array.from(votosEnviados)));
}

function cargarDatos() {
    const storedCategorias = localStorage.getItem('categorias');
    if (storedCategorias) categorias = JSON.parse(storedCategorias);
    
    const storedCandidatas = localStorage.getItem('candidatas');
    if (storedCandidatas) {
        candidatas = JSON.parse(storedCandidatas);
        candidatas.forEach(c => {
            categorias.forEach(cat => {
                if (!c.puntajes[cat]) c.puntajes[cat] = [];
            });
            calcularTotal(c);
        });
    }
    
    const storedVotos = localStorage.getItem('votosEnviados');
    if (storedVotos) votosEnviados = new Set(JSON.parse(storedVotos));
    
    const storedJurado = localStorage.getItem('juradoActual');
    if (storedJurado) juradoActual = JSON.parse(storedJurado);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    actualizarSelectCandidatas();
    actualizarCategoriasList();
    actualizarCandidatasList();
    actualizarRanking();
    showSection('admin'); // Inicia en admin para carga directa
});

// Navegación
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Registro Opcional de Jurado (en votación)
function registrarJuradoOpcional() {
    const nombre = prompt('Nombre del jurado (opcional):');
    const email = prompt('Email (para trackear votos, opcional):');
    if (nombre && email) {
        juradoActual = { id: Date.now(), nombre, email };
        guardarDatos();
        alert(`¡Registrado opcionalmente, ${nombre}! Ahora tus votos se trackean como un gaucho fiel.`);
    } else {
        alert('Registro opcional cancelado. Vota anónimamente, ¡igual cuenta!');
    }
}

// Admin: Categorías y Carga de Candidatas
function agregarCategoria() {
    const nuevaCat = document.getElementById('nuevaCategoria').value.trim();
    if (!nuevaCat || categorias.includes(nuevaCat)) {
        alert('¡Nombre válido y único requerido, como "Danza Zamba"!');
        return;
    }
    categorias.push(nuevaCat);
    candidatas.forEach(c => { if (!c.puntajes[nuevaCat]) c.puntajes[nuevaCat] = []; });
    actualizarCategoriasList();
    guardarDatos();
    document.getElementById('nuevaCategoria').value = '';
    alert(`¡Categoría "${nuevaCat}" agregada! Como un nuevo verso en la milonga.`);
}

function actualizarCategoriasList() {
    const list = document.getElementById('categoriasList');
    list.innerHTML = categorias.map(cat => `
        <li>
            <span><i class="fas fa-star"></i> ${cat}</span>
            <button onclick="eliminarCategoria('${cat.replace(/'/g, "\\'")}')" class="btn-secundario small"><i class="fas fa-trash"></i> Eliminar</button>
        </li>
    `).join('');
}

function eliminarCategoria(cat) {
    if (!confirm(`¿Eliminar "${cat}"? ¡Como borrar un facón!`)) return;
    const index = categorias.indexOf(cat);
    if (index > -1) {
        categorias.splice(index, 1);
        candidatas.forEach(c => {
            if (c.puntajes[cat]) {
                delete c.puntajes[cat];
                calcularTotal(c);
            }
        });
        actualizarCategoriasList();
        guardarDatos();
        actualizarRanking();
    }
}

document.getElementById('candidataForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreCandidata').value.trim();
    const info = document.getElementById('infoCandidata').value.trim();
    const fotoFile = document.getElementById('fotoCandidata').files[0];
    
    if (!nombre || !info || !fotoFile) {
        alert('¡Nombre, info y foto obligatorios!');
        return;
    }
    
    const fotoUrl = URL.createObjectURL(fotoFile);
    const candidata = {
        id: Date.now(),
        nombre, info, foto: fotoUrl,
        puntajes: {},
        total: 0
    };
    categorias.forEach(cat => candidata.puntajes[cat] = []);
    candidatas.push(candidata);
    actualizarCandidatasList();
    actualizarSelectCandidatas();
    guardarDatos();
    this.reset();
    alert(`¡Paisana "${nombre}" en el escenario!`);
});

function actualizarCandidatasList() {
    const list = document.getElementById('candidatasList');
    list.innerHTML = candidatas.map(c => `
        <div>
            <img src="${c.foto}" alt="${c.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+UGFpc2FuYTwvdGV4dD48L3N2Zz4='">
            <h4>${c.nombre}</h4>
            <p>${c.info.substring(0, 80)}${c.info.length > 80 ? '...' : ''}</p>
            <p><i class="fas fa-star"></i> Total: ${c.total.toFixed(2)}</p>
        </div>
    `).join('');
}

function actualizarSelectCandidatas() {
    const select = document.getElementById('seleccionarCandidata');
    select.innerHTML = '<option value="">Elige una candidata</option>' + 
        candidatas.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

// Votación (anónima directa)
document.getElementById('seleccionarCandidata').addEventListener('change', function() {
    const id = parseInt(this.value);
    if (id) {
        const candidata = candidatas.find(c => c.id === id);
        if (candidata) {
            actualizarFormVotacion(candidata);
            document.getElementById('enviarVotos').style.display = 'block';
        }
    } else {
        document.getElementById('formVotacion').innerHTML = '';
        document.getElementById('enviarVotos').style.display = 'none';
    }
});

function actualizarFormVotacion(candidata) {
    const form = document.getElementById('formVotacion');
    let html = `
        <h3><i class="fas fa-crown"></i> Evaluando a: ${candidata.nombre}</h3>
        <img src="${candidata.foto}" alt="${candidata.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI3NSIgY3k9Ijc1IiByPSI3MCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9Ijc1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+UGFpc2FuYTwvdGV4dD48L3N2Zz4='">
        <p>${candidata.info}</p>
    `;
    categorias.forEach(cat => {
        const inputId = cat.replace(/\s+/g, '-');
        html += `
            <div class="input-group">
                <label for="${inputId}"><i class="fas fa-star"></i> ${cat} (1-10):</label>
                <input type="number" id="${inputId}" min="1" max="10" step="1" required>
            </div>
        `;
    });
    form.innerHTML = html;
}

function enviarVotos() {
    const select = document.getElementById('seleccionarCandidata');
    const id = parseInt(select.value);
    const candidata = candidatas.find(c => c.id === id);
    if (!candidata) return;
    
    // Si hay jurado registrado, verificar duplicado
    if (juradoActual) {
        const votoKey = `${juradoActual.id}-${id}`;
        if (votosEnviados.has(votoKey)) {
            alert('¡Ya votaste por esta paisana! Un gaucho no repite su grito.');
            return;
        }
    }
    
    let valid = true;
    categorias.forEach(cat => {
        const inputId = cat.replace(/\s+/g, '-');
        const input = document.getElementById(inputId);
        const puntaje = parseInt(input.value);
        if (isNaN(puntaje) || puntaje < 1 || puntaje > 10) {
            valid = false;
            alert(`¡Puntaje inválido en "${cat}"! Debe ser 1-10.`);
            input.focus();
        } else {
            candidata.puntajes[cat].push(puntaje);
        }
    });
    
    if (valid) {
        calcularTotal(candidata);
        if (juradoActual) {
            const votoKey = `${juradoActual.id}-${id}`;
            votosEnviados.add(votoKey);
        }
        guardarDatos();
        actualizarRanking();
        alert(`¡Votos enviados al cielo de la pampa! Gracias por evaluar a ${candidata.nombre}.`);
        document.getElementById('enviarVotos').style.display = 'none';
        document.getElementById('formVotacion').innerHTML = '';
        select.value = '';
    }
}

function calcularTotal(candidata) {
    let total = 0;
    let numCats = 0;
    categorias.forEach(cat => {
        if (candidata.puntajes[cat] && candidata.puntajes[cat].length > 0) {
            const avg = candidata.puntajes[cat].reduce((a, b) => a + b, 0) / candidata.puntajes[cat].length;
            total += avg;
            numCats++;
        }
    });
    candidata.total = numCats > 0 ? Math.round(total * 100) / 100 : 0;
}

// Ranking (Vista de Ganadoras)
function actualizarRanking() {
    const tbody = document.querySelector('#rankingTable tbody');
    const sorted = [...candidatas]
        .filter(c => c.total > 0)
        .sort((a, b) => b.total - a.total);
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#666;"><i class="fas fa-horse-head"></i> Aún no hay votos. ¡Que comience el rodeo!</td></tr>';
        return;
    }
    
    tbody.innerHTML = sorted.map((c, index) => `
        <tr>
            <td><i class="fas fa-medal"></i> ${index + 1}</td>
            <td><img src="${c.foto}" alt="${c.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjUiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSIzMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlA8L3RleHQ+PC9zdmc+';"></td>
            <td><strong>${c.nombre}</strong><br><small>${c.info.substring(0, 50)}${c.info.length > 50 ? '...' : ''}</small></td>
            <td><i class="fas fa-star" style="color:#DAA520;"></i> ${c.total.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Reportes
function generarReporte() {
    if (candidatas.length === 0) {
        alert('¡No hay candidatas aún! Carga algunas paisanas primero.');
        return;
    }
    
    const content = document.getElementById('reporteContent');
    const totalVotos = juradoActual ? Array.from(votosEnviados).length : 'Anónimos (no trackeados)';
    const stats = `
        <h3><i class="fas fa-chart-line"></i> Reporte General de la Elección</h3>
        <p><strong>Total Candidatas:</strong> ${candidatas.length} (¡Como caballos en un rodeo!)</p>
        <p><strong>Total Votos Emitidos:</strong> ${totalVotos}</p>
        <p><strong>Categorías Activas:</strong> ${categorias.join(', ')}</p>
        <h4>Detalles por Paisana:</h4>
        <ul>
            ${candidatas.map(c => {
                const totalVotosCandidata = Object.values(c.puntajes).reduce((sum, arr) => sum + arr.length, 0);
                return `<li><strong>${c.nombre}</strong>: Puntaje ${c.total.toFixed(2)} (Votos: ${totalVotosCandidata}) - ${c.info.substring(0, 30)}...</li>`;
            }).join('')}
        </ul>
        <p><em>¡La elección fluye como el mate en una tertulia!</em></p>
    `;
    content.innerHTML = stats;
    
    // Gráfico con Chart.js
    const canvas = document.getElementById('graficoPuntajes');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (chart) chart.destroy();
        
        const labels = candidatas.map(c => c.nombre);
        const data = candidatas.map(c => c.total);
        const backgroundColors = ['#CD5C5C', '#DAA520', '#8B4513', '#228B22', '#DEB887', '#F4E4BC'];
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Puntaje Total',
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: '#8B4513',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: { display: true, text: 'Puntaje (1-10)' },
                        grid: { color: 'rgba(139, 69, 19, 0.1)' }
                    },
                    x: {
                        title: { display: true, text: 'Paisanas' },
                        grid: { color: 'rgba(139, 69, 19, 0.1)' }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: {
                        display: true,
                        text: 'Ranking de Paisanas en el Folclore Argentino',
                        font: { family: 'Cinzel', size: 18 }
                    }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });
    }
}
