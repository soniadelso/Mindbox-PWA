const formulario = document.querySelector('.formulario form');
const mensajeError = formulario.querySelector('.mensaje-error');
const campoTitulo = formulario.elements['TítuloInspo'];
const campoDescripcion = formulario.elements['desc'];
const campoBusqueda = formulario.elements['busquedaImagen'];
const botonBuscar = document.querySelector('#buscar-imagen');
const estadoBusqueda = document.querySelector('#estado-busqueda');
const resultadosImagenes = document.querySelector('#resultados-imagenes');
const paginacionImagenes = document.querySelector('#paginacion-imagenes');
const botonPaginaAnterior = document.querySelector('#pagina-anterior');
const botonPaginaSiguiente = document.querySelector('#pagina-siguiente');
const numeroPagina = document.querySelector('#numero-pagina');
const claveInspiraciones = 'mindbox-inspiraciones';
const UNSPLASH_ACCESS_KEY = 'OeGwlBoONd-FyBIxP9nmEzg9W80swx_5tUySMzoCylw';
const inspiracionesGuardadas = JSON.parse(localStorage.getItem(claveInspiraciones) || '[]');
const resultadosPorPagina = 6;
let fotoSeleccionada = null;
let paginaActual = 1;
let totalPaginas = 0;

function actualizarPaginacion() {
    paginacionImagenes.hidden = totalPaginas <= 1;
    numeroPagina.textContent = totalPaginas > 0 ? `Página ${paginaActual} de ${totalPaginas}` : '';
    botonPaginaAnterior.disabled = paginaActual <= 1;
    botonPaginaSiguiente.disabled = paginaActual >= totalPaginas;
}

function enlaceUnsplash(url) {
    const enlace = new URL(url);
    enlace.searchParams.set('utm_source', 'mindbox');
    enlace.searchParams.set('utm_medium', 'referral');
    return enlace.toString();
}

function agregarAtribucion(contenedor, fotografo, perfilFotografo) {
    const atribucion = document.createElement('p');
    atribucion.className = 'atribucion-foto';

    const enlaceFotografo = document.createElement('a');
    enlaceFotografo.href = enlaceUnsplash(perfilFotografo);
    enlaceFotografo.target = '_blank';
    enlaceFotografo.rel = 'noreferrer';
    enlaceFotografo.textContent = fotografo;

    const enlaceUnsplashSitio = document.createElement('a');
    enlaceUnsplashSitio.href = enlaceUnsplash('https://unsplash.com');
    enlaceUnsplashSitio.target = '_blank';
    enlaceUnsplashSitio.rel = 'noreferrer';
    enlaceUnsplashSitio.textContent = 'Unsplash';

    atribucion.append('Foto de ', enlaceFotografo, ' en ', enlaceUnsplashSitio);
    contenedor.append(atribucion);
}

function seleccionarFoto(foto) {
    fotoSeleccionada = foto;
    campoBusqueda.setAttribute('aria-invalid', 'false');
    resultadosImagenes.querySelectorAll('.selector-imagen').forEach((boton) => {
        const estaSeleccionada = boton.dataset.photoId === foto.id;
        boton.closest('.resultado-imagen').classList.toggle('is-selected', estaSeleccionada);
        boton.setAttribute('aria-pressed', String(estaSeleccionada));
    });

    fetch(foto.links.download_location, {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    }).catch((error) => console.error('No se pudo registrar la selección de la foto.', error));
}

function crearResultado(foto) {
    const resultado = document.createElement('article');
    resultado.className = 'resultado-imagen';

    const boton = document.createElement('button');
    boton.className = 'selector-imagen';
    boton.type = 'button';
    boton.dataset.photoId = foto.id;
    boton.setAttribute('aria-pressed', 'false');
    boton.addEventListener('click', () => seleccionarFoto(foto));

    const imagen = document.createElement('img');
    imagen.src = foto.urls.small;
    imagen.alt = foto.alt_description || foto.description || 'Resultado de Unsplash';
    imagen.loading = 'lazy';
    boton.setAttribute('aria-label', `Seleccionar imagen: ${imagen.alt}`);
    boton.append(imagen);

    resultado.append(boton);
    agregarAtribucion(resultado, foto.user.name, foto.user.links.html);
    return resultado;
}

async function buscarImagenes(pagina = 1) {
    if (botonBuscar.disabled) {
        return;
    }

    const consulta = campoBusqueda.value.trim();
    if (!consulta) {
        estadoBusqueda.textContent = 'Escribe qué imagen quieres buscar.';
        return;
    }

    botonBuscar.disabled = true;
    paginacionImagenes.hidden = true;
    estadoBusqueda.textContent = 'Buscando imágenes...';
    resultadosImagenes.replaceChildren();

    try {
        const url = new URL('https://api.unsplash.com/search/photos');
        url.searchParams.set('query', consulta);
        url.searchParams.set('per_page', String(resultadosPorPagina));
        url.searchParams.set('page', String(pagina));
        url.searchParams.set('orientation', 'landscape');

        const respuesta = await fetch(url, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });
        if (!respuesta.ok) {
            throw new Error(`Unsplash respondió con el estado ${respuesta.status}.`);
        }

        const datos = await respuesta.json();
        if (datos.results.length === 0) {
            paginaActual = 1;
            totalPaginas = 0;
            estadoBusqueda.textContent = 'No se encontraron imágenes. Prueba otra búsqueda.';
            return;
        }

        paginaActual = pagina;
        totalPaginas = datos.total_pages;
        datos.results.forEach((foto) => resultadosImagenes.append(crearResultado(foto)));
        estadoBusqueda.textContent = `${datos.results.length} imágenes en esta página.`;
    } catch (error) {
        console.error('Error al buscar imágenes en Unsplash.', error);
        paginaActual = 1;
        totalPaginas = 0;
        estadoBusqueda.textContent = 'No se pudieron cargar las imágenes. Comprueba la conexión y la Access Key.';
    } finally {
        botonBuscar.disabled = false;
        actualizarPaginacion();
    }
}

botonBuscar.addEventListener('click', () => buscarImagenes(1));
botonPaginaAnterior.addEventListener('click', () => buscarImagenes(paginaActual - 1));
botonPaginaSiguiente.addEventListener('click', () => buscarImagenes(paginaActual + 1));
campoBusqueda.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
        evento.preventDefault();
        buscarImagenes();
    }
});

campoTitulo.addEventListener('input', () => campoTitulo.setAttribute('aria-invalid', 'false'));
campoDescripcion.addEventListener('input', () => campoDescripcion.setAttribute('aria-invalid', 'false'));

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const descripcion = campoDescripcion.value.trim();
    const faltaTitulo = titulo === '';
    const faltaDescripcion = descripcion === '';
    const faltaImagen = fotoSeleccionada === null;

    campoTitulo.setAttribute('aria-invalid', String(faltaTitulo));
    campoDescripcion.setAttribute('aria-invalid', String(faltaDescripcion));
    campoBusqueda.setAttribute('aria-invalid', String(faltaImagen));

    if (faltaTitulo || faltaDescripcion || faltaImagen) {
        mensajeError.style.display = 'block';
        return;
    }

    mensajeError.style.display = 'none';
    const inspiracion = {
        id: `local-${Date.now()}`,
        titulo,
        descripcion,
        archivo: fotoSeleccionada.urls.regular,
        nombre: fotoSeleccionada.alt_description || fotoSeleccionada.description || 'Imagen de Unsplash',
        fotografo: fotoSeleccionada.user.name,
        perfilFotografo: fotoSeleccionada.user.links.html,
        fecha: new Date().toLocaleDateString('es-ES'),
    };

    inspiracionesGuardadas.push(inspiracion);
    localStorage.setItem(claveInspiraciones, JSON.stringify(inspiracionesGuardadas));
    window.listaApp.recargar();

    formulario.reset();
    fotoSeleccionada = null;
    resultadosImagenes.replaceChildren();
    estadoBusqueda.textContent = '';
});