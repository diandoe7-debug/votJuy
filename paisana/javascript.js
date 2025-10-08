// script.js - Lógica completa para el Sistema Miss Paisana. Frontend puro con localStorage para persistencia local (simula red interna). Integración con Chart.js para gráficos. Temática folclórica en mensajes y flujos intuitivos.

// Datos en memoria (simulando almacenamiento local para frontend puro)
// En un sistema real, usar backend para multi-usuario y seguridad en red local/internet.
let jurados = []; // [{id, nombre, apellido, foto, email}]
let categorias = ['Belleza Gaucha', 'Conocimiento Folclórico', 'Representación Regional (Comida)']; // Personalizables, con temas folclóricos
let candidatas = []; // [{id, nombre, info, foto, puntajes: {cat1: [puntajes]}, total: 0}]
let juradoActual = null;
let votosEnviados = new Set(); // Para evitar votos duplicados por jurado-candidata
let chart = null; // Para el gráfico de Chart.js

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    actualizarSelectCandidatas();
    actualizarCategoriasList();
    actualizarCandidatasList();
    actualizarRanking();
    showSection('login'); // Inicia en login como un gaucho llegando al rancho
});

// Funciones de Secciones (navegación intuitiva)
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'voting' && juradoActual) {
        actualizarFormVotacion();
    } else if (id === 'admin') {
        // Solo admin visible, pero en prod agregar auth
        if (!juradoActual || !confirm('¿Eres organizador? Confirma para acceder.')) {
            showSection('login');
            return;
        }
    }
}

// Registro de Jurado (mínimo: nombre, apellido, foto opcional, email)
document.getElementById('juradoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const fotoFile = document.getElementById('fotoJurado').files[0];
    
    if (!nombre || !apellido || !email) {
        alert('¡Ey, gaucho! Completa nombre, apellido y email como en una chacarera.');
        return;
    }
    
    const jurado = {
        id: Date.now(),
        nombre,
        apellido,
        email,
        foto: fotoFile ? URL.createObjectURL(fotoFile) : null
    };
    
    // Verificar si ya existe (login simple por email)
    const existente = jurados.find(j => j.email === email);
    if (existente) {
        juradoActual = existente;
        document.getElementById('juradoInfo').innerHTML = `<p class="mensaje-folclorico">¡Bienvenido de nuevo al ruedo, ${nombre} ${apellido}! Tu voto cuenta como el grito de un gaucho.</p>`;
        showSection('voting');
    } else {
        jurados.push(jurado);
        juradoActual = jurado;
        document.getElementById('juradoInfo').innerHTML = `<p class="mensaje-folclorico">¡Registrado como jurado estrella! ${nombre} ${apellido}, prepárate para evaluar a las paisanas.</p>`;
        guardarDatos();
        showSection('voting'); // Redirigir a votación
    }
    
    // Reset form
    document.getElementById('juradoForm').reset();
});

// Admin: Agregar Categoría (personalizable, temática folclórica)
function agregarCategoria() {
    const nuevaCat = document.getElementById('nuevaCategoria').value.trim();
    if (!nuevaCat) {
        alert('¡Agrega un nombre a la categoría, como "Danza Zamba"!');
        return;
    }
    if (categorias.includes(nuevaCat)) {
        alert('¡Esa categoría ya existe en el folclore!');
        return;
    }
    categorias.push(nuevaCat);
    actualizarCategoriasList();
    // Inicializar en candidatas existentes
    candidatas.forEach(c => {
        if (!c.puntajes[nuevaCat]) {
            c.puntajes[nuevaCat] = [];
        }
    });
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
    if (!confirm(`¿Eliminar "${cat}"? ¡Como borrar un facón del facón!`)) return;
    const index = categorias.indexOf(cat);
    if (index > -1) {
        categorias.splice(index, 1);
        // Limpiar puntajes de candidatas
        candidatas.forEach(c => {
            if (c.puntajes[cat]) {
                delete c.puntajes[cat];
                // Recalcular total
                calcularTotal(c);
            }
        });
        actualizarCategoriasList();
        guardarDatos();
        actualizarRanking();
    }
}

// Carga de Candidatas (con info y foto, temática regional)
document.getElementById('candidataForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreCandidata').value.trim();
    const info = document.getElementById('infoCandidata').value.trim();
    const fotoFile = document.getElementById('fotoCandidata').files[0];
    
    if (!nombre || !info || !fotoFile) {
        alert('¡Falta algo! Nombre, info (como "Amante del asado y la chacarera") y foto obligatorios.');
        return;
    }
    
    const fotoUrl = URL.createObjectURL(fotoFile);
    const candidata = {
        id: Date.now(),
        nombre,
        info,
        foto: fotoUrl,
        puntajes: {}, // {categoria: [puntajes de jurados]}
        total: 0
    };
    
    // Inicializar puntajes por categoría actual
    categorias.forEach(cat => {
        candidata.puntajes[cat] = [];
    });
    
    candidatas.push(candidata);
    actualizarCandidatasList();
    actualizarSelectCandidatas();
    guardarDatos();
    document.getElementById('candidataForm').reset();
    alert(`¡Paisana "${nombre}" lanzada al escenario! Que brille como una estrella en la peña.`);
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
    select.innerHTML = '<option value="">Elige una candidata del corazón pampeano</option>' + 
        candidatas.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

// Votación (transparente, por categorías, 1-10)
document.getElementById('seleccionarCandidata').addEventListener('change', function() {
    const id = parseInt(this.value);
    if (id && juradoActual) {
        const candidata = candidatas.find(c => c.id === id);
        const votoKey = `${juradoActual.id}-${id}`;
        if (candidata && !votosEnviados.has(votoKey)) {
            actualizarFormVotacion(candidata);
            document.getElementById('enviarVotos').style.display = 'block';
        } else if (votosEnviados.has(votoKey)) {
            alert('¡Ya votaste por esta paisana! Un gaucho no repite su grito.');
        } else {
            alert('¡Logueate primero, compadre!');
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
        html += `
            <div class="input-group">
                <label for="${cat.replace(/\s+/g, '-')}"><i class="fas fa-star"></i> ${cat} (1-10):</label>
                <input type="number" id="${cat.replace(/\s+/g, '-')}" min="1" max="10" step="1" required>
            </div>
        `;
    });
    form.innerHTML = html;
}

function enviarVotos() {
    if (!juradoActual) {
        alert('¡Debes ser un jurado registrado para votar!');
        showSection('login');
        return;
    }
    
    const select = document.getElementById('seleccionarCandidata');
    const id = parseInt(select.value);
    const candidata = candidatas.find(c => c.id === id);
    if (!candidata) return;
    
    const votoKey = `${juradoActual.id}-${id}`;
    if (votosEnviados.has(votoKey)) {
        alert('¡Voto ya enviado! No repitas como un eco en la pampa.');
        return;
    }
    
    let valid = true;
    const puntajesCat = {};
    categorias.forEach(cat => {
        const inputId = cat.replace(/\s+/g, '-');
        const input = document.getElementById(inputId);
        const puntaje = parseInt(input.value);
        if (isNaN(puntaje) || puntaje < 1 || puntaje > 10) {
            valid = false;
            alert(`¡Puntaje inválido en "${cat}"! Debe ser 1-10, como las notas en una peña.`);
            input.focus();
        } else {
            puntajesCat[cat] = puntaje;
            candidata.puntajes[cat].push(puntaje);
        }
    });
    
    if (valid) {
        // Calcular total: promedio por categoría, luego suma de promedios
        calcularTotal(candidata);
        
        votosEnviados.add(votoKey);
        guardarDatos();
        actualizarRanking();
        alert(`¡Votos enviados al cielo de la pampa! Gracias, ${juradoActual.nombre}.`);
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
    candidata.total = numCats > 0 ? Math.round(total / numCats * 100) / 100 : 0; // Promedio general si hay categorías
}

// Ranking en Tiempo Real (transparente, sort por total)
function actualizarRanking() {
    const tbody = document.querySelector('#rankingTable tbody');
    const sorted = [...candidatas]
        .filter(c => c.total > 0) // Solo con votos
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

// Reportes y Estadísticas (generación automática, con gráfico)
function generarReporte() {
    if (candidatas.length === 0) {
        alert('¡No hay candidatas aún! Carga algunas paisanas primero.');
        return;
    }
    
    const content = document.getElementById('reporteContent');
    const totalVotos = Array.from(votosEnviados).length;
    const stats = `
        <h3><i class="fas fa-chart-line"></i> Reporte General de la Elección</h3>
        <p><strong>Total Candidatas:</strong> ${candidatas.length} (¡Como caballos en un rodeo!)</p>
        <p><strong>Total Jurados Registrados:</strong> ${jurados.length}</p>
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
    
    // Gráfico con Chart.js: Barras de puntajes totales (colores folclóricos)
    const canvas = document.getElementById('graficoPuntajes');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (chart) {
            chart.destroy();
        }
        
        const labels = candidatas.map(c => c.nombre);
        const data = candidatas.map(c => c.total);
        const backgroundColors = ['#CD5C5C', '#DAA520', '#8B4513', '#228B22', '#DEB887', '#F4E4BC']; // Colores temáticos: poncho, oro, tierra, verde pampa
        
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
                    borderRadius: 5 // Bordes redondeados para toque rústico
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Puntaje (1-10)'
                        },
                        grid: {
                            color: 'rgba(139, 69, 19, 0.1)' // Líneas grid en marrón sutil
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Paisanas'
                        },
                        grid: {
                            color: 'rgba(139, 69, 19, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Ranking de Paisanas en el Folclore Argentino',
                        font: {
                            family: 'Cinzel',
                            size: 18
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart' // Animación suave como un baile folclórico
                }
            }
        });
    }
}
