// COMPONENTE Cabecera: logo, menú y iconos. La prop "activo" marca la opción actual del menú.
const Cabecera = {
    props: ['activo'],
    data() {
        return {
            // Las opciones sin href se muestran como deshabilitadas.
            opciones: [
                { id: 'inicio', texto: 'Inicio', href: 'index.html' },
                { id: 'tareas', texto: 'Tareas' },
                { id: 'notas', texto: 'Notas' },
                { id: 'inspiracion', texto: 'Inspiración', href: 'inspiracion.html' },
                { id: 'configuracion', texto: 'Configuración' },
            ],
            iconos: ['search-outline', 'notifications-outline', 'settings-outline', 'person-circle-outline'],
        };
    },
    // :class con objeto: añade cada clase solo si su condición es verdadera.
    template: `
    <h1><a href="index.html">MindBox</a></h1>
    <nav>
        <ul class="navegacion" type="none">
            <li v-for="o in opciones" :key="o.id" :class="{ activo: o.id === activo, deshabilitado: !o.href }">
                <a v-if="o.href" :href="o.href">{{ o.texto }}</a>
                <template v-else>{{ o.texto }}</template>
            </li>
        </ul>
    </nav>
    <div class="header__iconos">
        <ion-icon v-for="icono in iconos" :key="icono" :name="icono"></ion-icon>
    </div>`,
};

// COMPONENTE PiePagina: texto de copyright.
const PiePagina = {
    template: `<p>&copy; 2025 MindBox. Todos los derechos reservados.</p>`,
};

// Monta cabecera y pie en los contenedores de la página; data-activo del header indica la opción del menú.
const cabecera = document.querySelector('#cabecera');
if (cabecera) {
    Vue.createApp(Cabecera, { activo: cabecera.dataset.activo }).mount(cabecera);
}
const pie = document.querySelector('#pie');
if (pie) {
    Vue.createApp(PiePagina).mount(pie);
}
