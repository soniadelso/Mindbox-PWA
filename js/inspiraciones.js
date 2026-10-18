// Clave de localStorage donde el formulario guarda las inspiraciones nuevas.
const CLAVE_INSPIRACIONES = 'mindbox-inspiraciones';

// Convierte una inspiración guardada por el formulario al mismo formato que el JSON, para tratarlas igual.
function normalizarGuardada(item, indice) {
    return {
        id: item.id || `local-${indice}`,
        titulo: item.titulo,
        fecha: item.fecha,
        descripcion: item.descripcion,
        detalle: item.descripcion,
        imagen: item.archivo,
        imagenMovil: null,
        alt: item.nombre,
        fotografo: item.fotografo,
        perfilFotografo: item.perfilFotografo,
    };
}

// Lee de localStorage las inspiraciones añadidas por el usuario.
function leerGuardadas() {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE_INSPIRACIONES) || '[]');
    return guardadas.map(normalizarGuardada);
}

// Lee el JSON con fetch y lo une a las guardadas (las nuevas primero). Devuelve una promesa.
async function cargarInspiraciones() {
    const respuesta = await fetch('data/inspiraciones.json');
    if (!respuesta.ok) {
        throw new Error(`No se pudo leer el JSON (${respuesta.status}).`);
    }
    const base = await respuesta.json();
    return [...leerGuardadas().reverse(), ...base];
}

// COMPONENTE VUE: una tarjeta reutilizable. Es un objeto con su configuración y su plantilla HTML.
const TarjetaInspiracion = {
    // props: datos que el componente padre le pasa (aquí, la inspiración a mostrar).
    props: ['inspiracion'],
    // computed: valores calculados a partir de los datos; se recalculan solos si cambian.
    computed: {
        // URL de la página de detalle con el id de esta inspiración.
        enlace() {
            return `detalle.html?id=${encodeURIComponent(this.inspiracion.id)}`;
        },
    },
    // template: HTML del componente. {{ }} muestra datos, :atributo enlaza un atributo a un dato, v-if muestra/oculta según condición.
    template: `
    <div class="card-foto">
        <a :href="enlace">
            <picture>
                <source v-if="inspiracion.imagenMovil" media="(max-width: 767px)" :srcset="inspiracion.imagenMovil">
                <img :src="inspiracion.imagen" :alt="inspiracion.alt" loading="lazy">
            </picture>
        </a>
        <div class="card-foto__content">
            <h2><a :href="enlace">{{ inspiracion.titulo }}</a></h2>
            <p>Fecha: {{ inspiracion.fecha }}</p>
            <p>{{ inspiracion.descripcion }}</p>
            <p v-if="inspiracion.fotografo" class="atribucion-foto">
                Foto de <a :href="inspiracion.perfilFotografo + '?utm_source=mindbox&utm_medium=referral'" target="_blank" rel="noreferrer">{{ inspiracion.fotografo }}</a>
                en <a href="https://unsplash.com?utm_source=mindbox&utm_medium=referral" target="_blank" rel="noreferrer">Unsplash</a>
            </p>
        </div>
    </div>`,
};

// COMPONENTE VUE: página de detalle de una inspiración; busca por el id de la URL (?id=...).
const DetalleInspiracion = {
    data() {
        return { inspiracion: null, cargando: true };
    },
    async mounted() {
        const id = new URLSearchParams(location.search).get('id');
        try {
            const todas = await cargarInspiraciones();
            this.inspiracion = todas.find((i) => i.id === id) || null;
        } catch (e) {
            console.error(e);
        } finally {
            this.cargando = false;
        }
    },
    template: `
    <p v-if="cargando">Cargando...</p>
    <p v-else-if="!inspiracion">No se encontró la inspiración. <a href="index.html">Volver al inicio</a></p>
    <article v-else>
        <a class="btn btn--link" href="inspiracion.html">&larr; Volver a Inspiración</a>
        <h1>{{ inspiracion.titulo }}</h1>
        <picture>
            <source v-if="inspiracion.imagenMovil" media="(max-width: 767px)" :srcset="inspiracion.imagenMovil">
            <img :src="inspiracion.imagen" :alt="inspiracion.alt">
        </picture>
        <p>Fecha: {{ inspiracion.fecha }}</p>
        <p>{{ inspiracion.descripcion }}</p>
        <p v-if="inspiracion.detalle !== inspiracion.descripcion">{{ inspiracion.detalle }}</p>
        <p v-if="inspiracion.fotografo" class="atribucion-foto">
            Foto de <a :href="inspiracion.perfilFotografo + '?utm_source=mindbox&utm_medium=referral'" target="_blank" rel="noreferrer">{{ inspiracion.fotografo }}</a>
            en <a href="https://unsplash.com?utm_source=mindbox&utm_medium=referral" target="_blank" rel="noreferrer">Unsplash</a>
        </p>
    </article>`,
};

// COMPONENTE VUE RAÍZ: la lista completa. Pinta una TarjetaInspiracion por cada elemento.
const ListaInspiraciones = {
    // components: registra los componentes hijos que se usan en la plantilla.
    components: { TarjetaInspiracion },
    // data: estado reactivo; cuando cambia, Vue actualiza el HTML automáticamente.
    data() {
        return { inspiraciones: [], error: '' };
    },
    // mounted: se ejecuta cuando el componente ya está en la página; aquí se cargan los datos.
    async mounted() {
        try {
            this.inspiraciones = await cargarInspiraciones();
        } catch (e) {
            console.error(e);
            this.error = 'No se pudieron cargar las inspiraciones.';
        }
    },
    // methods: funciones del componente; formulario.js llama a recargar() tras guardar una inspiración.
    methods: {
        recargar() {
            cargarInspiraciones().then((datos) => { this.inspiraciones = datos; });
        },
    },
    // v-for repite la tarjeta por cada inspiración; :key ayuda a Vue a identificar cada una; :inspiracion pasa el dato como prop.
    template: `
    <p v-if="error">{{ error }}</p>
    <tarjeta-inspiracion v-for="i in inspiraciones" :key="i.id" :inspiracion="i"></tarjeta-inspiracion>`,
};
