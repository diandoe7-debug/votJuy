// main.js - Lógica central para todo el sistema
// Detecta la página actual por window.location.pathname y ejecuta funciones específicas
// Datos se almacenan en localStorage: candidates, jurors, categories, evaluations

// Inicialización común
document.addEventListener('DOMContentLoaded', function() {
    // Configurar header y navegación en todas las páginas
    setupNavigation();
    
    // Detectar página y ejecutar lógica específica
    const path = window.location.pathname.split('/').pop(); // Obtiene nombre del archivo HTML
    switch (path) {
        case 'index.html':
            initIndex();
            break;
        case 'registrar-candidato.html':
            initRegistrarCandidato();
            break;
        case 'registrar-jurado.html':
            initRegistrarJurado();
            break;
        case 'configurar-categorias.html':
            initConfigurarCategorias();
            break;
        case 'evaluacion.html':
            initEvaluacion();
            break;
        case 'ranking.html':
            initRanking();
            break;
        case 'estadisticas.html':
            initEstadisticas();
            break;
        default:
            console.log('Página no reconocida');
    }
});

// Funciones comunes
function setupNavigation() {
    // Hamburger menu para móvil
    const hamburger = document.querySelector('.hamburger');
    const navUl = document.querySelector('nav ul');
    if (hamburger && navUl) {
        hamburger.addEventListener('click', () => {
            navUl.classList.toggle('active');
        });
    }

    // Scroll effect en header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Objetos de datos (inicializar si no existen)
function getData(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// PÁGINA: index.html
function initIndex() {
    console.log('Página principal cargada');
    // Solo setup, no lógica adicional
}

// PÁGINA: registrar-candidato.html
function initRegistrarCandidato() {
    const form = document.getElementById('candidatoForm');
    const preview = document.getElementById('candidatoPreview');
    const categories = getData('categories', []); // Cargar categorías dinámicas

    // Generar selects para categorías si existen
    const catSelect = document.getElementById('categorias');
    if (categories.length > 0) {
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            catSelect.appendChild(option);
        });
    } else {
        catSelect.innerHTML = '<option>No hay categorías configuradas</option>';
    }

    // Preview de foto
    const fotoInput = document.getElementById('foto');
    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const candidate = {
            id: Date.now(), // ID único
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            edad: parseInt(formData.get('edad')),
            foto: preview.querySelector('img') ? preview.querySelector('img').src : null, // Base64
            categorias: formData.get('categorias') ? [formData.get('categorias')] : [] // Array simple
        };

        const candidates = getData('candidates');
        candidates.push(candidate);
        setData('candidates', candidates);

        alert('Candidato registrado exitosamente!');
        form.reset();
        preview.innerHTML = 'Vista previa de foto (selecciona una imagen)';
    });
}

// PÁGINA: registrar-jurado.html
function initRegistrarJurado() {
    const form = document.getElementById('juradoForm');
    const preview = document.getElementById('juradoPreview');
    const categories = getData('categories', []);

    // Generar selects para categorías si existen
    const catSelect = document.getElementById('categorias');
    if (categories.length > 0) {
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            catSelect.appendChild(option);
        });
    } else {
        catSelect.innerHTML = '<option>No hay categorías configuradas</option>';
    }

    // Preview de foto
    const fotoInput = document.getElementById('foto');
    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const juror = {
            id: Date.now(),
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            foto: preview.querySelector('img') ? preview.querySelector('img').src : null,
            categorias: formData.get('categorias') ? [formData.get('categorias')] : []
        };

        const jurors = getData('jurors');
        jurors.push(juror);
        setData('jurors', jurors);

        alert('Jurado registrado exitosamente!');
        form.reset();
        preview.innerHTML = 'Vista previa de foto (selecciona una imagen)';
    });
}

// PÁGINA: configurar-categorias.html
function initConfigurarCategorias() {
    const form = document.getElementById('categoriaForm');
    const listContainer = document.getElementById('categoryList');
    loadCategoriesList();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('nombreCategoria').value.trim();
        if (name) {
            const categories = getData('categories');
            const newCat = {
                id: Date.now(),
                name: name
            };
            categories.push(newCat);
            setData('categories', categories);
            alert('Categoría añadida exitosamente!');
            form.reset();
            loadCategoriesList();
        }
    });

    function loadCategoriesList() {
        const categories = getData('categories');
        listContainer.innerHTML = '';
        categories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <h3>${cat.name}</h3>
                <button class="btn btn-secondary" onclick="editCategory(${cat.id}, '${cat.name}')">Editar</button>
                <button class="btn" style="background-color: #ff4444; margin-left: 0.5rem;" onclick="deleteCategory(${cat.id})">Eliminar</button>
            `;
            listContainer.appendChild(div);
        });
    }

    // Funciones globales para editar/eliminar (expuestas para onclick)
    window.editCategory = function(id, name) {
        const newName = prompt('Nuevo nombre de la categoría:', name);
        if (newName && newName.trim() !== name) {
            const categories = getData('categories');
            const cat = categories.find(c => c.id === id);
            if (cat) {
                cat.name = newName.trim();
                setData('categories', categories);
                loadCategoriesList();
                alert('Categoría actualizada!');
            }
        }
    };

    window.deleteCategory = function(id) {
        if (confirm('¿Eliminar esta categoría?')) {
            let categories = getData('categories');
            categories = categories.filter(c => c.id !== id);
            setData('categories', categories);
            loadCategoriesList();
            alert('Categoría eliminada!');
        }
    };
}

// PÁGINA: evaluacion.html
function initEvaluacion() {
    const juradoSelect = document.getElementById('juradoSelect');
    const candidateContainer = document.getElementById('candidateContainer');
    const categories = getData('categories', []);
    const jurors = getData('jurors', []);
    const evaluations = getData('evaluations', []);

    // Poblar select de jurados
    jurors.forEach(juror => {
        const option = document.createElement('option');
        option.value = juror.id;
        option.textContent = `${juror.nombre} ${juror.apellido}`;
        juradoSelect.appendChild(option);
    });

    // Evento para seleccionar jurado y cargar candidatos
    juradoSelect.addEventListener('change', loadCandidatesForEvaluation);

    function loadCandidatesForEvaluation() {
        const selectedJurorId = parseInt(juradoSelect.value);
        if (!selectedJurorId) return;

        const candidates = getData('candidates', []);
        candidateContainer.innerHTML = '';

        candidates.forEach(candidate => {
            // Verificar si ya evaluó a este candidato
            const existingEval = evaluations.find(e => e.jurorId === selectedJurorId && e.candidateId === candidate.id);
            const isEvaluated = existingEval ? ' (Evaluado)' : '';

            const card = document.createElement('div');
            card.className = 'item-card evaluation-grid';
            card.innerHTML = `
                <div>
                    <h3>${candidate.nombre} ${candidate.apellido} (${candidate.edad} años)${isEvaluated}</h3>
                    ${candidate.foto ? `<img src="${candidate.foto}" alt="Foto" class="image-preview">` : '<div class="image-preview">Sin foto</div>'}
                </div>
                <div>
                    <h4>Puntajes por Categoría:</h4>
                    ${categories.map(cat => `
                        <label>${cat.name}: <input type="number" class="score-input" min="1" max="10" value="${existingEval ? existingEval.scores[cat.id] || '' : ''}" id="score-${candidate.id}-${cat.id}" ${existingEval ? 'readonly' : ''}></label>
                    `).join('')}
                    <div class="total-score">Total: <span id="total-${candidate.id}">0</span></div>
                    ${!existingEval ? `<button class="btn" onclick="saveEvaluation(${selectedJurorId}, ${candidate.id})">Guardar Evaluación</button>` : ''}
                </div>
            `;
            candidateContainer.appendChild(card);

            // Calcular total si hay puntajes
            calculateTotal(candidate.id, categories);
        });
    }

    // Función para calcular total
    function calculateTotal(candidateId, categories) {
        let total = 0;
        let count = 0;
        categories.forEach(cat => {
            const input = document.getElementById(`score-${candidateId}-${cat.id}`);
            if (input && input.value) {
                total += parseInt(input.value);
                count++;
            }
        });
        const avg = count > 0 ? (total / count).toFixed(2) : 0;
        document.getElementById(`total-${candidateId}`).textContent = avg;
    }

    // Evento para recalcular total en inputs
    candidateContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('score-input')) {
            const candidateId = parseInt(e.target.id.split('-')[1]);
            calculateTotal(candidateId, categories);
        }
    });

    // Función global para guardar evaluación
    window.saveEvaluation = function(jurorId, candidateId) {
        const scores = {};
        let total = 0;
        let count = 0;
        categories.forEach(cat => {
            const input = document.getElementById(`score-${candidateId}-${cat.id}`);
            if (input && input.value) {
                scores[cat.id] = parseInt(input.value);
                total += parseInt(input.value);
                count++;
            }
        });
        if (count === 0) {
            alert('Debe asignar al menos un puntaje.');
            return;
        }
        const avg = total / count;

        const evaluation = {
            jurorId,
            candidateId,
            scores,
            total: avg
        };

        let evaluations = getData('evaluations');
        // Reemplazar si existe
        const index = evaluations.findIndex(e => e.jurorId === jurorId && e.candidateId === candidateId);
        if (index > -1) {
            evaluations[index] = evaluation;
        } else {
            evaluations.push(evaluation);
        }
        setData('evaluations', evaluations);

        alert('Evaluación guardada!');
        loadCandidatesForEvaluation(); // Recargar para marcar como evaluado
    };

    // Cargar inicial si hay jurado seleccionado
    if (juradoSelect.value) loadCandidatesForEvaluation();
}

// PÁGINA: ranking.html
function initRanking() {
    const rankingContainer = document.getElementById('rankingContainer');
    const evaluations = getData('evaluations', []);
    const candidates = getData('candidates', []);

    if (evaluations.length === 0) {
        rankingContainer.innerHTML = '<p>No hay evaluaciones para mostrar ranking.</p>';
        return;
    }

    // Calcular promedios por candidato
    const candidateScores = {};
    candidates.forEach(candidate => {
        const evalsForCandidate = evaluations.filter(e => e.candidateId === candidate.id);
        if (evalsForCandidate.length > 0) {
            const avg = evalsForCandidate.reduce((sum, e) => sum + e.total, 0) / evalsForCandidate.length;
            candidateScores[candidate.id] = {
                ...candidate,
                average: avg,
                numEvals: evalsForCandidate.length
            };
        }
    });

    // Ordenar por promedio descendente
    const ranked = Object.values(candidateScores).sort((a, b) => b.average - a.average);

    ranked.forEach((candidate, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        div.innerHTML = `
            <span class="rank-position">${index + 1}º</span>
            <div>
                <h3>${candidate.nombre} ${candidate.apellido}</h3>
                ${candidate.foto ? `<img src="${candidate.foto}" alt="Foto" style="width: 50px; height: 50px; border-radius: 50%;">` : ''}
                <p>Promedio: ${candidate.average.toFixed(2)} (basado en ${candidate.numEvals} evaluaciones)</p>
            </div>
        `;
        rankingContainer.appendChild(div);
    });
}

// PÁGINA: estadisticas.html
function initEstadisticas() {
    const statsContainer = document.getElementById('statsContainer');
    const evaluations = getData('evaluations', []);
    const candidates = getData('candidates', []);
    const jurors = getData('jurors', []);

    if (evaluations.length === 0) {
        statsContainer.innerHTML = '<p>No hay datos para estadísticas.</p>';
        return;
    }

    // Estadística 1: Promedio general de puntajes
    const allScores = evaluations.flatMap(e => Object.values(e.scores));
    const globalAvg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    // Estadística 2: Jurado más estricto (menor promedio de totals)
    const jurorAvgs = {};
    evaluations.forEach(e => {
        if (!jurorAvgs[e.jurorId]) jurorAvgs[e.jurorId] = { sum: 0, count: 0 };
        jurorAvgs[e.jurorId].sum += e.total;
        jurorAvgs[e.jurorId].count++;
    });
    const strictestJuror = Object.keys(jurorAvgs).reduce((minId, id) => {
        const avg = jurorAvgs[id].sum / jurorAvgs[id].count;
        const minAvg = jurorAvgs[minId].sum / jurorAvgs[minId].count;
        return avg < minAvg ? id : minId;
    }, Object.keys(jurorAvgs)[0]);
    const strictestName = jurors.find(j => j.id == strictestJuror)?.nombre + ' ' + jurors.find(j => j.id == strictestJuror)?.apellido || 'Desconocido';
    const strictestAvg = jurorAvgs[strictestJuror].sum / jurorAvgs[strictestJuror].count;

    // Estadística 3: Candidato con mejor rendimiento (mayor promedio)
    const candidateAvgs = {};
    evaluations.forEach(e => {
        if (!candidateAvgs[e.candidateId]) candidateAvgs[e.candidateId] = { sum: 0, count: 0 };
        candidateAvgs[e.candidateId].sum += e.total;
        candidateAvgs[e.candidateId].count++;
    });
    const bestCandidate = Object.keys(candidateAvgs).reduce((maxId, id) => {
        const avg = candidateAvgs[id].sum / candidateAvgs[id].count;
        const maxAvg = candidateAvgs[maxId].sum / candidateAvgs[maxId].count;
        return avg > maxAvg ? id : maxId;
    }, Object.keys(candidateAvgs)[0]);
    const bestName = candidates.find(c => c.id == bestCandidate)?.nombre + ' ' + candidates.find(c => c.id == bestCandidate)?.apellido || 'Desconocido';
    const bestAvg = candidateAvgs[bestCandidate].sum / candidateAvgs[bestCandidate].count;

    // Estadística 4: Número total de evaluaciones
    const totalEvals = evaluations.length;

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Promedio General</h3>
                <div class="stat-value">${globalAvg.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Jurado Más Estricto</h3>
                <div class="stat-value">${strictestName}</div>
                <p>Promedio: ${strictestAvg.toFixed(2)}</p>
            </div>
            <div class="stat-card">
                <h3>Candidato Mejor Rendimiento</h3>
                <div class="stat-value">${bestName}</div>
                <p>Promedio: ${bestAvg.toFixed(2)}</p>
            </div>
            <div class="stat-card">
                <h3>Total Evaluaciones</h3>
                <div class="stat-value">${totalEvals}</div>
            </div>
        </div>
    `;
}
