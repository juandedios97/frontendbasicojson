// Carga los datos de data/personas.json en "lista" y los pinta como tabla o como cards
const contenido = document.getElementById('contenido');
const preloader = document.getElementById('preloader');
const mensaje = document.getElementById('mensaje');
const switchVista = document.getElementById('switch-vista');
const txtTabla = document.getElementById('txt-tabla');
const txtCards = document.getElementById('txt-cards');

// Array con los datos: se carga una vez y lo usan los dos renderizados
let lista = [];

// Promesa que se resuelve tras "ms" milisegundos (para que se vea el preloader)
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Cookie para recordar la vista ----------
const COOKIE_VISTA = 'vista';

// Guarda la cookie durante 1 año para toda la carpeta del proyecto
function guardarCookie(nombre, valor, dias = 365) {
    const expira = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
    const carpeta = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${expira}; path=${carpeta}; SameSite=Lax`;
}

function leerCookie(nombre) {
    const par = document.cookie
        .split('; ')
        .find((item) => item.startsWith(nombre + '='));
    return par ? decodeURIComponent(par.split('=')[1]) : null;
}

// Devuelve la vista guardada, o "tabla" si no hay cookie o tiene un valor raro
function vistaGuardada() {
    return leerCookie(COOKIE_VISTA) === 'cards' ? 'cards' : 'tabla';
}

function mostrarPreloader(visible) {
    preloader.hidden = !visible;
}

async function obtenerPersonas() {
    const respuesta = await fetch('data/personas.json');
    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
    }
    return await respuesta.json();
}

// Evita que el contenido del JSON se interprete como HTML
function escapar(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ---------- Renderizado en tabla ----------
function renderTabla(datos) {
    const filas = datos.map((persona, indice) => `
        <tr>
            <td>${indice + 1}</td>
            <td>${escapar(persona.nombre)}</td>
            <td>${escapar(persona.apellido)}</td>
            <td><a href="mailto:${escapar(persona.email)}">${escapar(persona.email)}</a></td>
            <td>${escapar(persona.telefono)}</td>
            <td>${escapar(persona.direccion)}</td>
        </tr>
    `).join('');

    contenido.innerHTML = `
        <div class="tabla-contenedor">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
    `;
}

// ---------- Renderizado en cards ----------
function renderCards(datos) {
    const cards = datos.map((persona, indice) => `
        <article class="tarjeta">
            <span class="etiqueta">Cliente ${indice + 1}</span>
            <h2>${escapar(persona.nombre)} ${escapar(persona.apellido)}</h2>
            <p><strong>Email:</strong> <a href="mailto:${escapar(persona.email)}">${escapar(persona.email)}</a></p>
            <p><strong>Teléfono:</strong> ${escapar(persona.telefono)}</p>
            <p><strong>Dirección:</strong> ${escapar(persona.direccion)}</p>
        </article>
    `).join('');

    contenido.innerHTML = `<section class="lista-cards">${cards}</section>`;
}

// Cambia de vista usando siempre el mismo array "lista"
function cambiarVista(vista) {
    if (vista === 'cards') {
        renderCards(lista);
    } else {
        renderTabla(lista);
    }
    switchVista.checked = vista === 'cards';
    txtTabla.classList.toggle('activo', vista === 'tabla');
    txtCards.classList.toggle('activo', vista === 'cards');
    guardarCookie(COOKIE_VISTA, vista);
}

async function cargarPersonas() {
    if (location.protocol === 'file:') {
        mensaje.textContent = 'Abre la página desde el servidor: http://localhost/javascript/';
        return;
    }

    mostrarPreloader(true);

    try {
        // Simula una carga lenta de 1,5 s; quita esta línea en producción
        await esperar(1500);

        lista = await obtenerPersonas();

        if (lista.length === 0) {
            mensaje.textContent = 'No hay personas registradas.';
            return;
        }

        // Abre en la última vista que usó el usuario (según la cookie)
        cambiarVista(vistaGuardada());
    } catch (error) {
        mensaje.textContent = 'No se pudieron cargar los datos: ' + error.message;
        console.error(error);
    } finally {
        mostrarPreloader(false);
    }
}

// Switch apagado = tabla, encendido = cards
switchVista.addEventListener('change', () => {
    cambiarVista(switchVista.checked ? 'cards' : 'tabla');
});

cargarPersonas();
