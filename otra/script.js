// Simulación de roles y autenticación
const users = {
    admin: { password: 'admin', role: 'admin' },
    jurado: { password: 'jurado', role: 'jurado' },
    encargado: { password: 'encargado', role: 'encargado' }
};

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username].password === password) {
        localStorage.setItem('userRole', users[username].role);
        redirectUser (users[username].role);
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});

function redirectUser (role) {
    if (role === 'admin') {
        window.location.href = 'admin.html';
    } else if (role === 'jurado') {
        window.location.href = 'jurado.html';
    } else if (role === 'encargado') {
        window.location.href = 'encargado.html';
    }
}

// Función para cerrar sesión
document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('userRole');
    window.location.href = 'index.html'; // Redirigir a la página de inicio
});

// Cambiar tema
document.getElementById('theme').addEventListener('change', function() {
    const theme = this.value;
    document.body.className = theme; // Cambiar clase del body según el tema
});
