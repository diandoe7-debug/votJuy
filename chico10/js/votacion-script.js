// JS específico para votacion-candidatos.html - Lógica de votación y modal
// Compatible con localStorage del sistema original

// Variables globales
let currentCandidate = null;
let currentJurorId = 1; // Default para votación general
let categories = [];

// Inicialización (ejecutar después de main.js)
document.addEventListener('DOMContentLoaded', function() {
    loadJurors();
    loadCategories();
    generateAndLoadCandidates();
});

// Datos localStorage (compatible con sistema original)
function getData(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Cargar Jurados (del original, con defaults)
function loadJurors() {
    const jurors = getData('jurors', [
        { id: 1, nombre: 'Jurado General', apellido: '' }
    ]);
    setData('jurors', jurors);
    const select = document.getElementById('juradoSelect');
    select.innerHTML = '<option value="1">Voto General (Jurado 1)</option>';
    jurors.forEach(juror => {
        if (juror.id > 1) {
            const option = document.createElement('option');
            option.value = juror.id;
            option.textContent = `${juror.nombre} ${juror.apellido}`;
            select.appendChild(option);
        }
    });
    select.addEventListener('change', (e) => {
        currentJurorId = parseInt(e.target.value) || 1;
        loadCandidates(); // Recargar para actualizar votos por jurado
    });
}

// Cargar Categorías (defaults si no hay)
function loadCategories() {
    categories = getData('categories', [
        { id: 1, name: 'Presencia Escénica' },
        { id: 2, name: 'Talento Artístico' },
        { id: 3, name: 'Creatividad' },
        { id: 4, name: 'Carisma' }
    ]);
    setData('categories', categories);
    // Actualizar max en modal (se hace dinámicamente al abrir)
}

// Generar 20 Candidatos Ficticios (si no hay en localStorage)
function generateAndLoadCandidates() {
    let candidates = getData('candidates', []);
    if (candidates.length === 0) {
        // Generar 20 candidatos ficticios con descripciones y fotos reales de Unsplash (retratos de hombres jóvenes/artísticos)
        const firstNames = ['Diego', 'Juan', 'Carlos', 'Miguel', 'Andrés', 'Luis', 'José', 'Francisco', 'Antonio', 'Manuel', 'Pedro', 'Fernando', 'Ricardo', 'Santiago', 'Gabriel', 'Rafael', 'Javier', 'Alejandro', 'Roberto', 'Eduardo'];
        const lastNames = ['Ramos', 'Pérez', 'López', 'García', 'Martínez', 'Hernández', 'González', 'Rodríguez', 'Torres', 'Sánchez', 'Ramírez', 'Morales', 'Cruz', 'Vega', 'Ortega', 'Castillo', 'Flores', 'Mendoza', 'Silva', 'Navarro'];
        const descriptions = [
            'Artista urbano con pasión por el graffiti y estilo callejero único.',
            'Músico talentoso en guitarra clásica, inspirado en compositores latinos.',
            'Escultor innovador que usa materiales reciclados para obras ecológicas.',
            'Pintor abstracto con influencias modernas y colores vibrantes.',
            'Fotógrafo de arte callejero, capturando la esencia de Jujuy.',
            'Diseñador gráfico creativo, experto en ilustraciones digitales.',
            'Bailarín contemporáneo con movimientos fluidos y expresivos.',
            'Poeta y escritor emergente, con versos que tocan el alma.',
            'Ceramista tradicional, fusionando arte ancestral con toques modernos.',
            'Ilustrador digital, creando mundos fantásticos en tablet.',
            'Actor de teatro experimental, maestro en improvisación emocional.',
            'Compositor de música electrónica, ritmos que hipnotizan.',
            'Joyería artesanal hecha a mano con piedras de la región.',
            'Videógrafo artístico, contando historias a través de la cámara.',
            'Tatuador con estilo único, diseños inspirados en la cultura andina.',
            'Cantante de ópera con voz poderosa y presencia escénica.',
            'Arquitecto de instalaciones interactivas y efímeras.',
            'Chef artístico en presentaciones visuales y sabores innovadores.',
            'Modisto de moda sostenible, usando tejidos locales.',
            'Programador de arte generativo, creando piezas digitales únicas.'
        ];
        // Fotos reales de Unsplash: retratos variados de hombres jóvenes (ajustados para crop=face, w=200)
        const photoIds = [1509581, 1519677, 1520341, 1521123, 1525508, 1527685, 1532053, 1534765, 1537109, 1542059, 1546964, 1552058, 1557591, 1563356, 1567182, 1570760, 1573515, 1577604, 1582265, 1588047]; // IDs específicos para variedad
        candidates = [];
        for (let i = 0; i < 20; i++) {
            const candidate = {
                id: i + 1,
                nombre: firstNames[i],
                apellido: lastNames[i],
                edad: 18 + Math.floor(Math.random() * 13), // 18-30 años aleatorios
                foto: `https://images.unsplash.com/photo-${photoIds[i]}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80&crop=face`, // Fotos reales y variadas de Unsplash
                descripcion: descriptions[i]
            };
            candidates.push(candidate);
        }
        setData('candidates', candidates);
    }
    loadCandidates();
}

// Cargar Galería de Candidatos
function loadCandidates() {
    const candidates = getData('candidates');
    const gallery = document.getElementById('candidatesGallery');
    gallery.innerHTML = '';
    const evaluations = getData('evaluations', []);
    candidates.forEach(candidate => {
        // Verificar si ya se votó por este jurado/candidato
        const hasVoted = evaluations.some(e => e.jurorId === currentJurorId && e.candidateId === candidate.id);
        const card = document.createElement('div');
        card.className = `candidate-card ${hasVoted ? 'voted' : ''}`;
        card.innerHTML = `
            <div class="candidate-photo-container">
                <div class="epa-logo">EPA</div>
                <img src="${candidate.foto}" alt="${candidate.nombre} ${candidate.apellido}" class="candidate-photo" onclick="openVoteModal(${candidate.id})" onerror="this.src='https://via.placeholder.com/200x200/333/fff?text=Photo'"> <!-- Fallback si no carga -->
            </div>
            <h3 class="candidate-name">${candidate.nombre} ${candidate.apellido}</h3>
            <p class="candidate-age">${candidate.edad} años</p>
            <p class="candidate-description">${candidate.descripcion}</p>
        `;
        gallery.appendChild(card);
    });
}

// Abrir Modal de Votación/Edición (Ventana Flotante Semitransparente)
function openVoteModal(candidateId) {
    currentCandidate = getData('candidates').find(c => c.id === candidateId);
    if (!currentCandidate) return;
    const evaluations = getData('evaluations', []);
    const existingVote = evaluations.find(e => e.jurorId === currentJurorId && e.candidateId === candidateId);
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const scoresContainer = document.getElementById('scoresContainer');
    modalTitle.innerHTML = `${existingVote ? 'Modificar Voto' : 'Votar por'} ${currentCandidate.nombre} ${currentCandidate.apellido}`;
    if (existingVote) {
        const prevTotal = Object.values(existingVote.scores).reduce((a, b) => a + b, 0);
        modalMessage.innerHTML = `¿Desea modificar su puntuación actual? (Puntaje anterior: ${prevTotal} puntos totales asignados previamente)`;
    } else {
        modalMessage.textContent = 'Asigne puntos del 1 al 10 por cada categoría. El total se calculará automáticamente.';
    }
    // Generar inputs para categorías
    scoresContainer.innerHTML = '';
    let maxTotal = 0;
    categories.forEach(cat => {
        const div = document.createElement('div');
        const inputId = `score-${cat.id}`;
        const currentScore = existingVote ? (existingVote.scores[cat.id] || '') : '';
        div.innerHTML = `
            <label for="${inputId}">${cat.name}: 
                <input type="number" class="score-input" id="${inputId}" min="1" max="10" value="${currentScore}" placeholder="1-10">
            </label>
        `;
        scoresContainer.appendChild(div);
        maxTotal += 10;
    });
    document.getElementById('maxScoreModal').textContent = maxTotal;
    // Agregar event listener para cálculo en tiempo real y validación
    const inputs = scoresContainer.querySelectorAll('.score-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (isNaN(value) || value < 1 || value > 10) {
                this.classList.add('invalid');
            } else {
                this.classList.remove('invalid');
            }
            calculateModalTotal();
        });
    });
    calculateModalTotal(); // Calcular inicial
    document.getElementById('voteModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo
}

// Cerrar Modal
function closeModal() {
    document.getElementById('voteModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll
    currentCandidate = null;
    // Limpiar listeners si es necesario (se recrean al abrir)
}

// Guardar Voto (con corrección para detectar si es edición)
function saveVote() {
    if (!currentCandidate) return;
    const scores = {};
    let valid = true;
    categories.forEach(cat => {
        const input = document.getElementById(`score-${cat.id}`);
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1 || value > 10) {
            input.classList.add('invalid');
            alert(`¡Error! Puntaje inválido para "${cat.name}". Debe ser un número entre 1 y 10.`);
            valid = false;
            return;
        } else {
            input.classList.remove('invalid');
        }
        scores[cat.id] = value;
    });
    if (!valid) return;
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const avg = total / categories.length;
    const evaluation = {
        jurorId: currentJurorId,
        candidateId: currentCandidate.id,
        scores,
        total: avg,
        timestamp: new Date().toISOString() // Para tracking
    };
    let evaluations = getData('evaluations');
    const existingVote = evaluations.find(e => e.jurorId === currentJurorId && e.candidateId === currentCandidate.id);
    const index = evaluations.findIndex(e => e.jurorId === currentJurorId && e.candidateId === currentCandidate.id);
    if (index > -1) {
        evaluations[index] = evaluation;
        alert(`¡Puntuación modificada exitosamente! Nuevo total: ${total} puntos para ${currentCandidate.nombre} ${currentCandidate.apellido}.`);
    } else {
        evaluations.push(evaluation);
        alert(`¡Voto guardado exitosamente! Total: ${total} puntos para ${currentCandidate.nombre} ${currentCandidate.apellido}.`);
    }
    setData('evaluations', evaluations);
    closeModal();
    loadCandidates(); // Recargar galería: aplica filtro gris inmediatamente si es nuevo voto
}

// Resetear Puntajes en Modal
function resetScores() {
    categories.forEach(cat => {
        const input = document.getElementById(`score-${cat.id}`);
        if (input) {
            input.value = '';
            input.classList.remove('invalid');
        }
    });
    calculateModalTotal();
    alert('Puntajes reseteados. Asigna nuevos valores.');
}

// Función para calcular total en tiempo real en el modal
function calculateModalTotal() {
    let total = 0;
    let validCount = 0;
    categories.forEach(cat => {
        const input = document.getElementById(`score-${cat.id}`);
        if (input && input.value) {
            const value = parseInt(input.value);
            if (!isNaN(value) && value >= 1 && value <= 10) {
                total += value;
                validCount++;
            }
        }
    });
    document.getElementById('totalScoreModal').textContent = total;
    // Opcional: colorear total si es máximo
    const totalSpan = document.getElementById('totalScoreModal');
    if (validCount === categories.length && total === categories.length * 10) {
        totalSpan.style.color = 'var(--accent-gold)';
        totalSpan.style.textShadow = '0 0 10px var(--accent-gold)';
    } else {
        totalSpan.style.color = 'inherit';
        totalSpan.style.textShadow = 'none';
    }
}

// Cerrar modal al clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('voteModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Tecla ESC para cerrar modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
