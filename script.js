/**
 * ============================================
 * CALCULADORA DE META FINANCIERA
 * Script principal de la aplicación
 * Conecta con backend API para persistencia en MySQL
 * Sistema de autenticación con JWT
 * ============================================
 */

/**
 * Espera a que el DOM esté completamente cargado antes de ejecutar el código
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // CONSTANTES Y CONFIGURACIÓN
    // ============================================
    
    /** URL base de la API */
    const API_URL = '/api';
    
    /** Clave para almacenar el token JWT en localStorage */
    const TOKEN_KEY = 'metaFinancieraToken';
    
    /** Clave para almacenar datos del usuario en localStorage */
    const USER_KEY = 'metaFinancieraUser';
    
    /** ID de la meta actualmente seleccionada para editar */
    let metaActualId = null;
    
    /** Usuario actualmente logueado */
    let usuarioActual = null;
    
    /** Token JWT actual */
    let authToken = null;

    // ============================================
    // REFERENCIAS A ELEMENTOS DEL DOM - AUTENTICACIÓN
    // ============================================
    
    const pantallaAuth = document.getElementById('pantallaAuth');
    const formLogin = document.getElementById('formLogin');
    const formRegistro = document.getElementById('formRegistro');
    const formRecuperar = document.getElementById('formRecuperar');
    
    // Inputs de Login
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const btnLogin = document.getElementById('btnLogin');
    
    // Inputs de Registro
    const registroNombre = document.getElementById('registroNombre');
    const registroEmail = document.getElementById('registroEmail');
    const registroPassword = document.getElementById('registroPassword');
    const registroPasswordConfirm = document.getElementById('registroPasswordConfirm');
    const registroError = document.getElementById('registroError');
    const btnRegistro = document.getElementById('btnRegistro');
    
    // Inputs de Recuperar
    const recuperarEmail = document.getElementById('recuperarEmail');
    const recuperarError = document.getElementById('recuperarError');
    const recuperarSuccess = document.getElementById('recuperarSuccess');
    const btnRecuperar = document.getElementById('btnRecuperar');
    
    // Links de navegación entre formularios
    const linkRegistro = document.getElementById('linkRegistro');
    const linkLogin = document.getElementById('linkLogin');
    const linkRecuperar = document.getElementById('linkRecuperar');
    const linkVolverLogin = document.getElementById('linkVolverLogin');
    
    // Elementos de usuario logueado
    const nombreUsuario = document.getElementById('nombreUsuario');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');

    // ============================================
    // REFERENCIAS A ELEMENTOS DEL DOM - PANTALLAS
    // ============================================
    
    const pantallaLista = document.getElementById('pantallaLista');
    const pantallaEditar = document.getElementById('pantallaEditar');
    const metasLista = document.getElementById('metasLista');
    const estadoVacio = document.getElementById('estadoVacio');
    
    // ============================================
    // REFERENCIAS A ELEMENTOS DEL DOM - BOTONES
    // ============================================
    
    const btnNuevaMeta = document.getElementById('btnNuevaMeta');
    const btnVolver = document.getElementById('btnVolver');
    const btnEliminar = document.getElementById('btnEliminar');
    const tituloEditar = document.getElementById('tituloEditar');
    
    // ============================================
    // REFERENCIAS A ELEMENTOS DEL DOM - MODAL
    // ============================================
    
    const modalEliminar = document.getElementById('modalEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    
    // ============================================
    // REFERENCIAS A ELEMENTOS DEL DOM - FORMULARIO META
    // ============================================
    
    const inputMeta = document.getElementById('meta');
    const inputFecha = document.getElementById('fecha');
    const inputMontoAcumulado = document.getElementById('montoAcumulado');
    const inputMontoMeta = document.getElementById('montoMeta');
    
    // ============================================
    // REFERENCIAS A ELEMENTOS DEL DOM - VISUALIZACIÓN
    // ============================================
    
    const progresoTexto = document.getElementById('progresoTexto');
    const barraProgreso = document.getElementById('barraProgreso');
    const barraProgresoTexto = document.getElementById('barraProgresoTexto');
    const estadisticaAcumulado = document.getElementById('estadisticaAcumulado');
    const estadisticaRestante = document.getElementById('estadisticaRestante');
    const estadisticaDias = document.getElementById('estadisticaDias');
    const mensajeExito = document.getElementById('mensajeExito');
    const mensajeProgreso = document.getElementById('mensajeProgreso');

    // ============================================
    // FUNCIONES DE API - UTILIDADES HTTP
    // ============================================

    /**
     * Realiza una petición HTTP a la API
     * @param {string} endpoint - Endpoint de la API (sin /api)
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} Respuesta de la API
     */
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
        
        // Agregar token de autorización si existe
        if (authToken) {
            defaultHeaders['Authorization'] = `Bearer ${authToken}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        // Convertir body a JSON si es objeto
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en API:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    // ============================================
    // FUNCIONES DE GESTIÓN DE USUARIOS (API)
    // ============================================

    /**
     * Registra un nuevo usuario en el sistema via API
     * @param {string} nombre - Nombre del usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Resultado con success y message
     */
    async function registrarUsuario(nombre, email, password) {
        // Validaciones locales
        if (!nombre || nombre.trim().length < 2) {
            return { success: false, message: 'El nombre debe tener al menos 2 caracteres' };
        }
        if (!email || !validarEmail(email)) {
            return { success: false, message: 'Ingresa un correo electrónico válido' };
        }
        if (!password || password.length < 6) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        const resultado = await apiRequest('/auth/register', {
            method: 'POST',
            body: { nombre, email, password }
        });
        
        if (resultado.success) {
            // Guardar token y usuario
            authToken = resultado.data.token;
            usuarioActual = resultado.data.user;
            localStorage.setItem(TOKEN_KEY, authToken);
            localStorage.setItem(USER_KEY, JSON.stringify(usuarioActual));
            return { success: true, message: 'Usuario registrado exitosamente', usuario: usuarioActual };
        } else {
            return { success: false, message: resultado.error || 'Error al registrar usuario' };
        }
    }

    /**
     * Intenta iniciar sesión con las credenciales proporcionadas via API
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Resultado con success, message y usuario
     */
    async function iniciarSesion(email, password) {
        if (!email || !password) {
            return { success: false, message: 'Ingresa tu correo y contraseña' };
        }
        
        const resultado = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        
        if (resultado.success) {
            // Guardar token y usuario
            authToken = resultado.data.token;
            usuarioActual = resultado.data.user;
            localStorage.setItem(TOKEN_KEY, authToken);
            localStorage.setItem(USER_KEY, JSON.stringify(usuarioActual));
            return { success: true, message: 'Inicio de sesión exitoso', usuario: usuarioActual };
        } else {
            return { success: false, message: resultado.error || 'Credenciales inválidas' };
        }
    }

    /**
     * Obtiene la sesión actual si existe
     * @returns {Promise<Object|null>} Datos de sesión o null
     */
    async function obtenerSesion() {
        // Intentar recuperar token de localStorage
        const tokenGuardado = localStorage.getItem(TOKEN_KEY);
        const userGuardado = localStorage.getItem(USER_KEY);
        
        if (!tokenGuardado) return null;
        
        authToken = tokenGuardado;
        
        // Verificar que el token sigue siendo válido
        const resultado = await apiRequest('/auth/me', {
            method: 'GET'
        });
        
        if (resultado.success) {
            usuarioActual = resultado.data;
            localStorage.setItem(USER_KEY, JSON.stringify(usuarioActual));
            return usuarioActual;
        } else {
            // Token inválido, limpiar sesión
            cerrarSesion();
            return null;
        }
    }

    /**
     * Cierra la sesión actual
     */
    function cerrarSesion() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        authToken = null;
        usuarioActual = null;
    }

    /**
     * Valida el formato de un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si el email es válido
     */
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Recupera la contraseña (pendiente de implementar en backend)
     * @param {string} email - Email del usuario
     * @returns {Promise<Object>} Promesa con resultado
     */
    async function recuperarPassword(email) {
        if (!email || !validarEmail(email)) {
            return { success: false, message: 'Ingresa un correo electrónico válido' };
        }
        
        // TODO: Implementar endpoint de recuperación en backend
        return { success: false, message: 'Función de recuperación no disponible aún. Contacta al administrador.' };
    }

    // ============================================
    // FUNCIONES DE METAS FINANCIERAS (API)
    // ============================================

    /** Cache local de metas para evitar peticiones repetidas */
    let metasCache = [];

    /**
     * Obtiene todas las metas del usuario actual desde la API
     * @returns {Promise<Array>} Array de objetos meta del usuario actual
     */
    async function obtenerMetas() {
        if (!usuarioActual) return [];
        
        const resultado = await apiRequest(`/user-goals?user_id=${usuarioActual.id}`, {
            method: 'GET'
        });
        
        if (resultado.success) {
            // Transformar datos de la API al formato del frontend
            metasCache = resultado.data.map(function(item) {
                return {
                    id: item.id,
                    metaId: item.meta_id,
                    nombre: item.meta_nombre,
                    descripcion: item.meta_descripcion,
                    fecha: item.fecha_objetivo ? item.fecha_objetivo.split('T')[0] : '',
                    montoAcumulado: parseFloat(item.monto_acumulado) || 0,
                    montoMeta: parseFloat(item.monto_meta) || 0
                };
            });
            return metasCache;
        }
        
        return [];
    }

    /**
     * Obtiene una meta específica por su ID
     * @param {string} id - ID único de la asignación usuario-meta
     * @returns {Object|undefined} Objeto meta o undefined si no existe
     */
    function obtenerMetaPorId(id) {
        return metasCache.find(function(meta) {
            return meta.id == id;
        });
    }

    /**
     * Crea una nueva meta y la asigna al usuario actual
     * @returns {Promise<Object>} Objeto meta creado
     */
    async function crearNuevaMeta() {
        if (!usuarioActual) return null;
        
        // Primero crear la meta en la tabla metas
        const resultadoMeta = await apiRequest('/goals', {
            method: 'POST',
            body: {
                nombre: 'Nueva Meta',
                descripcion: '',
                monto_meta: 0,
                fecha_objetivo: null
            }
        });
        
        if (!resultadoMeta.success) {
            console.error('Error al crear meta:', resultadoMeta.error);
            return null;
        }
        
        // Luego asignar la meta al usuario
        const resultadoAsignacion = await apiRequest('/user-goals', {
            method: 'POST',
            body: {
                usuario_id: usuarioActual.id,
                meta_id: resultadoMeta.data.id,
                monto_acumulado: 0
            }
        });
        
        if (!resultadoAsignacion.success) {
            console.error('Error al asignar meta:', resultadoAsignacion.error);
            return null;
        }
        
        return {
            id: resultadoAsignacion.data.id,
            metaId: resultadoMeta.data.id,
            nombre: 'Nueva Meta',
            descripcion: '',
            fecha: '',
            montoAcumulado: 0,
            montoMeta: 0
        };
    }

    /**
     * Guarda o actualiza una meta
     * @param {Object} meta - Objeto meta a guardar
     */
    async function guardarMeta(meta) {
        if (!meta || !meta.id) return;
        
        // Actualizar la meta en la tabla metas
        if (meta.metaId) {
            await apiRequest(`/goals/${meta.metaId}`, {
                method: 'PUT',
                body: {
                    nombre: meta.nombre || 'Sin nombre',
                    monto_meta: meta.montoMeta || 0,
                    fecha_objetivo: meta.fecha || null
                }
            });
        }
        
        // Actualizar el monto acumulado en usuario_metas
        await apiRequest(`/user-goals/${meta.id}`, {
            method: 'PUT',
            body: {
                monto_acumulado: meta.montoAcumulado || 0
            }
        });
        
        // Actualizar cache local
        const indice = metasCache.findIndex(m => m.id == meta.id);
        if (indice !== -1) {
            metasCache[indice] = meta;
        }
    }

    /**
     * Elimina una meta del usuario
     * @param {string} id - ID de la asignación a eliminar
     */
    async function eliminarMeta(id) {
        const meta = obtenerMetaPorId(id);
        
        // Eliminar la asignación usuario-meta
        await apiRequest(`/user-goals/${id}`, {
            method: 'DELETE'
        });
        
        // También eliminar la meta si existe
        if (meta && meta.metaId) {
            await apiRequest(`/goals/${meta.metaId}`, {
                method: 'DELETE'
            });
        }
        
        // Actualizar cache local
        metasCache = metasCache.filter(m => m.id != id);
    }

    // ============================================
    // FUNCIONES DE CÁLCULO
    // ============================================

    /**
     * Calcula el porcentaje de progreso hacia la meta financiera
     * @param {number} acumulado - Monto acumulado actual
     * @param {number} objetivo - Monto objetivo de la meta
     * @returns {number} Porcentaje de progreso (0-100)
     */
    function calcularProgreso(acumulado, objetivo) {
        // Usa 1 como mínimo para evitar división por cero
        const obj = objetivo || 1;
        // Calcula el porcentaje y lo limita a un máximo de 100
        return Math.min((acumulado / obj) * 100, 100);
    }

    /**
     * Calcula el monto restante para alcanzar la meta
     * @param {number} acumulado - Monto acumulado actual
     * @param {number} objetivo - Monto objetivo de la meta
     * @returns {number} Monto restante (nunca negativo)
     */
    function calcularRestante(acumulado, objetivo) {
        // Retorna 0 si ya se alcanzó o superó la meta
        return Math.max(objetivo - acumulado, 0);
    }

    /**
     * Calcula los días restantes hasta la fecha objetivo
     * @param {string} fecha - Fecha objetivo en formato ISO
     * @returns {number|null} Número de días restantes o null si no hay fecha
     */
    function calcularDiasRestantes(fecha) {
        // Si no hay fecha, retorna null
        if (!fecha) return null;
        
        // Obtiene la fecha actual y la fecha objetivo
        const hoy = new Date();
        const fechaObjetivo = new Date(fecha);
        
        // Calcula la diferencia en milisegundos
        const diferencia = fechaObjetivo - hoy;
        
        // Convierte milisegundos a días (redondeando hacia arriba)
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }

    /**
     * Formatea un número como moneda en formato colombiano
     * @param {number} numero - El número a formatear
     * @returns {string} Número formateado con separadores de miles
     */
    function formatearMoneda(numero) {
        return numero.toLocaleString('es-CO');
    }

    // ============================================
    // FUNCIONES DE NAVEGACIÓN - AUTENTICACIÓN
    // ============================================

    /**
     * Muestra la pantalla de autenticación (login)
     */
    function mostrarPantallaAuth() {
        pantallaAuth.classList.remove('hidden');
        pantallaLista.classList.add('hidden');
        pantallaEditar.classList.add('hidden');
        mostrarFormularioLogin();
    }

    /**
     * Muestra el formulario de login
     */
    function mostrarFormularioLogin() {
        formLogin.classList.remove('hidden');
        formRegistro.classList.add('hidden');
        formRecuperar.classList.add('hidden');
        ocultarMensajesAuth();
        limpiarFormulariosAuth();
    }

    /**
     * Muestra el formulario de registro
     */
    function mostrarFormularioRegistro() {
        formLogin.classList.add('hidden');
        formRegistro.classList.remove('hidden');
        formRecuperar.classList.add('hidden');
        ocultarMensajesAuth();
        limpiarFormulariosAuth();
    }

    /**
     * Muestra el formulario de recuperar contraseña
     */
    function mostrarFormularioRecuperar() {
        formLogin.classList.add('hidden');
        formRegistro.classList.add('hidden');
        formRecuperar.classList.remove('hidden');
        ocultarMensajesAuth();
        limpiarFormulariosAuth();
    }

    /**
     * Oculta todos los mensajes de error/éxito en autenticación
     */
    function ocultarMensajesAuth() {
        loginError.classList.add('hidden');
        registroError.classList.add('hidden');
        recuperarError.classList.add('hidden');
        recuperarSuccess.classList.add('hidden');
    }

    /**
     * Limpia todos los formularios de autenticación
     */
    function limpiarFormulariosAuth() {
        loginEmail.value = '';
        loginPassword.value = '';
        registroNombre.value = '';
        registroEmail.value = '';
        registroPassword.value = '';
        registroPasswordConfirm.value = '';
        recuperarEmail.value = '';
    }

    /**
     * Muestra un mensaje de error en el formulario especificado
     * @param {HTMLElement} elemento - Elemento donde mostrar el error
     * @param {string} mensaje - Mensaje de error
     */
    function mostrarError(elemento, mensaje) {
        elemento.textContent = mensaje;
        elemento.classList.remove('hidden');
    }

    /**
     * Muestra un mensaje de éxito
     * @param {HTMLElement} elemento - Elemento donde mostrar el mensaje
     * @param {string} mensaje - Mensaje de éxito
     */
    function mostrarExito(elemento, mensaje) {
        elemento.textContent = mensaje;
        elemento.classList.remove('hidden');
    }

    // ============================================
    // FUNCIONES DE NAVEGACIÓN ENTRE PANTALLAS
    // ============================================

    /**
     * Muestra la pantalla de lista de metas
     * Oculta la pantalla de edición y actualiza la lista
     * Valida que la meta tenga monto mayor a 0 antes de cerrar
     */
    async function mostrarPantallaLista() {
        // Si hay una meta en edición, validar antes de cerrar
        if (metaActualId) {
            const meta = obtenerMetaPorId(metaActualId);
            
            if (meta) {
                const montoMeta = parseFloat(inputMontoMeta.value) || meta.montoMeta || 0;
                
                // Validar que el monto sea mayor a 0
                if (montoMeta <= 0) {
                    const confirmar = confirm('El monto de la meta debe ser mayor a 0. ¿Deseas eliminar esta meta?');
                    
                    if (confirmar) {
                        // Eliminar la meta
                        await eliminarMeta(metaActualId);
                    } else {
                        // No cerrar, mantener en edición
                        return;
                    }
                } else {
                    // Guardar cambios finales antes de cerrar
                    if (guardarTimeout) {
                        clearTimeout(guardarTimeout);
                    }
                    await guardarMeta({
                        id: metaActualId,
                        metaId: meta.metaId,
                        nombre: inputMeta.value || 'Sin nombre',
                        fecha: inputFecha.value,
                        montoAcumulado: parseFloat(inputMontoAcumulado.value) || 0,
                        montoMeta: montoMeta
                    });
                }
            }
        }
        
        pantallaAuth.classList.add('hidden');
        pantallaLista.classList.remove('hidden');
        pantallaEditar.classList.add('hidden');
        metaActualId = null;
        
        // Mostrar nombre del usuario
        if (usuarioActual) {
            nombreUsuario.textContent = usuarioActual.nombre;
        }
        
        await renderizarListaMetas();
    }

    /**
     * Muestra la pantalla de edición de una meta
     * @param {string} id - ID de la meta a editar (null para nueva meta)
     */
    async function mostrarPantallaEditar(id) {
        pantallaAuth.classList.add('hidden');
        pantallaLista.classList.add('hidden');
        pantallaEditar.classList.remove('hidden');
        
        if (id) {
            // Editar meta existente
            metaActualId = id;
            const meta = obtenerMetaPorId(id);
            if (meta) {
                cargarMetaEnFormulario(meta);
                tituloEditar.textContent = meta.nombre || 'Mi Meta Financiera';
            }
        } else {
            // Crear nueva meta
            const nuevaMeta = await crearNuevaMeta();
            if (nuevaMeta) {
                metaActualId = nuevaMeta.id;
                metasCache.push(nuevaMeta);
                limpiarFormulario();
                tituloEditar.textContent = 'Nueva Meta';
            } else {
                // Error al crear, volver a lista
                await mostrarPantallaLista();
                return;
            }
        }
        
        actualizarInterfaz();
    }

    // ============================================
    // FUNCIONES DE RENDERIZADO
    // ============================================

    /**
     * Renderiza la lista de metas en la pantalla principal
     * Muestra el estado vacío si no hay metas
     */
    async function renderizarListaMetas() {
        const metas = await obtenerMetas();
        
        // Limpia la lista actual
        metasLista.innerHTML = '';
        
        if (metas.length === 0) {
            // Muestra el estado vacío
            estadoVacio.classList.remove('hidden');
            metasLista.classList.add('hidden');
        } else {
            // Oculta el estado vacío y muestra la lista
            estadoVacio.classList.add('hidden');
            metasLista.classList.remove('hidden');
            
            // Renderiza cada meta
            metas.forEach(function(meta) {
                const elemento = crearElementoMeta(meta);
                metasLista.appendChild(elemento);
            });
        }
    }

    /**
     * Crea el elemento HTML para mostrar una meta en la lista
     * @param {Object} meta - Objeto meta a renderizar
     * @returns {HTMLElement} Elemento div con la información de la meta
     */
    function crearElementoMeta(meta) {
        const progreso = calcularProgreso(meta.montoAcumulado || 0, meta.montoMeta || 0);
        
        const div = document.createElement('div');
        div.className = 'meta-item';
        div.setAttribute('data-id', meta.id);
        
        div.innerHTML = `
            <div class="meta-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>
            </div>
            <div class="meta-item-info">
                <div class="meta-item-nombre">${meta.nombre || 'Sin nombre'}</div>
                <div class="meta-item-detalle">$${formatearMoneda(meta.montoAcumulado || 0)} / $${formatearMoneda(meta.montoMeta || 0)}</div>
                <div class="meta-item-barra">
                    <div class="meta-item-barra-fill" style="width: ${progreso}%"></div>
                </div>
            </div>
            <div class="meta-item-progreso">
                <div class="meta-item-porcentaje">${progreso.toFixed(0)}%</div>
            </div>
            <div class="meta-item-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        `;
        
        // Agrega el evento click para abrir la meta
        div.addEventListener('click', function() {
            mostrarPantallaEditar(meta.id);
        });
        
        return div;
    }

    // ============================================
    // FUNCIONES DEL FORMULARIO
    // ============================================

    /**
     * Carga los datos de una meta en el formulario de edición
     * @param {Object} meta - Objeto meta con los datos a cargar
     */
    function cargarMetaEnFormulario(meta) {
        inputMeta.value = meta.nombre || '';
        inputFecha.value = meta.fecha || '';
        inputMontoAcumulado.value = meta.montoAcumulado || '';
        inputMontoMeta.value = meta.montoMeta || '';
    }

    /**
     * Limpia todos los campos del formulario
     */
    function limpiarFormulario() {
        inputMeta.value = '';
        inputFecha.value = '';
        inputMontoAcumulado.value = '';
        inputMontoMeta.value = '';
    }

    /** Timer para debounce del guardado */
    let guardarTimeout = null;

    /**
     * Guarda los datos actuales del formulario en la meta seleccionada
     * Usa debounce para evitar demasiadas peticiones a la API
     */
    function guardarDatosFormulario() {
        if (!metaActualId) return;
        
        // Obtener la meta actual del cache para conservar metaId
        const metaExistente = obtenerMetaPorId(metaActualId);
        
        const meta = {
            id: metaActualId,
            metaId: metaExistente ? metaExistente.metaId : null,
            nombre: inputMeta.value,
            fecha: inputFecha.value,
            montoAcumulado: parseFloat(inputMontoAcumulado.value) || 0,
            montoMeta: parseFloat(inputMontoMeta.value) || 0
        };
        
        // Actualizar cache local inmediatamente
        const indice = metasCache.findIndex(m => m.id == metaActualId);
        if (indice !== -1) {
            metasCache[indice] = meta;
        }
        
        // Debounce: esperar 500ms antes de guardar en la API
        if (guardarTimeout) {
            clearTimeout(guardarTimeout);
        }
        guardarTimeout = setTimeout(function() {
            guardarMeta(meta);
        }, 500);
        
        // Actualiza el título si cambió el nombre
        tituloEditar.textContent = meta.nombre || 'Mi Meta Financiera';
    }

    // ============================================
    // FUNCIONES DE ACTUALIZACIÓN DE INTERFAZ
    // ============================================

    /**
     * Actualiza todos los elementos visuales de la interfaz de edición
     * Esta función se ejecuta cada vez que cambia un valor en los inputs
     */
    function actualizarInterfaz() {
        // Obtiene los valores actuales de los inputs
        const acumulado = parseFloat(inputMontoAcumulado.value) || 0;
        const objetivo = parseFloat(inputMontoMeta.value) || 0;
        const fecha = inputFecha.value;
        
        // Calcula los valores
        const progreso = calcularProgreso(acumulado, objetivo);
        const restante = calcularRestante(acumulado, objetivo);
        const diasRestantes = calcularDiasRestantes(fecha);

        // Actualiza el texto del porcentaje de progreso
        progresoTexto.textContent = progreso.toFixed(1) + '%';

        // Actualiza el ancho de la barra de progreso
        barraProgreso.style.width = progreso + '%';

        // Muestra el porcentaje dentro de la barra solo si es mayor al 10%
        if (progreso > 10) {
            barraProgresoTexto.textContent = progreso.toFixed(0) + '%';
        } else {
            barraProgresoTexto.textContent = '';
        }

        // Actualiza las estadísticas
        estadisticaAcumulado.textContent = '$' + formatearMoneda(acumulado);
        estadisticaRestante.textContent = '$' + formatearMoneda(restante);

        // Actualiza los días restantes
        if (diasRestantes !== null) {
            // Muestra 0 si la fecha ya pasó
            estadisticaDias.textContent = diasRestantes >= 0 ? diasRestantes : 0;
        } else {
            estadisticaDias.textContent = '-';
        }

        // Gestiona la visibilidad de los mensajes motivacionales
        actualizarMensajes(progreso);
        
        // Guarda los cambios automáticamente
        guardarDatosFormulario();
    }

    /**
     * Muestra u oculta los mensajes motivacionales según el progreso
     * @param {number} progreso - Porcentaje de progreso actual
     */
    function actualizarMensajes(progreso) {
        // Oculta ambos mensajes inicialmente
        mensajeExito.classList.add('hidden');
        mensajeProgreso.classList.add('hidden');

        // Muestra el mensaje de éxito si se alcanzó la meta
        if (progreso >= 100) {
            mensajeExito.classList.remove('hidden');
        } 
        // Muestra el mensaje de progreso si hay avance pero no se ha completado
        else if (progreso > 0 && progreso < 100) {
            mensajeProgreso.classList.remove('hidden');
        }
    }

    // ============================================
    // FUNCIONES DEL MODAL
    // ============================================

    /**
     * Muestra el modal de confirmación para eliminar
     */
    function mostrarModalEliminar() {
        modalEliminar.classList.add('visible');
    }

    /**
     * Oculta el modal de confirmación
     */
    function ocultarModalEliminar() {
        modalEliminar.classList.remove('visible');
    }

    /**
     * Confirma la eliminación de la meta actual
     */
    async function confirmarEliminacion() {
        if (metaActualId) {
            await eliminarMeta(metaActualId);
            ocultarModalEliminar();
            await mostrarPantallaLista();
        }
    }

    // ============================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // ============================================

    /**
     * Inicializa todos los event listeners de la aplicación
     */
    function inicializarEventListeners() {
        // ============================================
        // EVENT LISTENERS - AUTENTICACIÓN
        // ============================================
        
        // Botón Login
        btnLogin.addEventListener('click', async function() {
            ocultarMensajesAuth();
            btnLogin.disabled = true;
            btnLogin.textContent = 'Iniciando...';
            
            const resultado = await iniciarSesion(loginEmail.value, loginPassword.value);
            
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
            
            if (resultado.success) {
                await mostrarPantallaLista();
            } else {
                mostrarError(loginError, resultado.message);
            }
        });
        
        // Botón Registro
        btnRegistro.addEventListener('click', async function() {
            ocultarMensajesAuth();
            
            // Validar que las contraseñas coincidan
            if (registroPassword.value !== registroPasswordConfirm.value) {
                mostrarError(registroError, 'Las contraseñas no coinciden');
                return;
            }
            
            btnRegistro.disabled = true;
            btnRegistro.textContent = 'Creando...';
            
            const resultado = await registrarUsuario(
                registroNombre.value,
                registroEmail.value,
                registroPassword.value
            );
            
            btnRegistro.disabled = false;
            btnRegistro.textContent = 'Crear Cuenta';
            
            if (resultado.success) {
                await mostrarPantallaLista();
            } else {
                mostrarError(registroError, resultado.message);
            }
        });
        
        // Botón Recuperar Contraseña
        btnRecuperar.addEventListener('click', async function() {
            ocultarMensajesAuth();
            btnRecuperar.disabled = true;
            btnRecuperar.textContent = 'Enviando...';
            
            const resultado = await recuperarPassword(recuperarEmail.value);
            
            btnRecuperar.disabled = false;
            btnRecuperar.textContent = 'Enviar Nueva Contraseña';
            
            if (resultado.success) {
                mostrarExito(recuperarSuccess, resultado.message);
            } else {
                mostrarError(recuperarError, resultado.message);
            }
        });
        
        // Links de navegación entre formularios
        linkRegistro.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarFormularioRegistro();
        });
        
        linkLogin.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarFormularioLogin();
        });
        
        linkRecuperar.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarFormularioRecuperar();
        });
        
        linkVolverLogin.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarFormularioLogin();
        });
        
        // Botón Cerrar Sesión
        btnCerrarSesion.addEventListener('click', function() {
            cerrarSesion();
            mostrarPantallaAuth();
        });
        
        // Enter en campos de login
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnLogin.click();
            }
        });
        
        loginEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginPassword.focus();
            }
        });
        
        // Enter en campos de registro
        registroPasswordConfirm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnRegistro.click();
            }
        });
        
        // Enter en campo de recuperar
        recuperarEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnRecuperar.click();
            }
        });

        // ============================================
        // EVENT LISTENERS - METAS
        // ============================================
        
        // Botón nueva meta
        btnNuevaMeta.addEventListener('click', function() {
            mostrarPantallaEditar(null);
        });
        
        // Botón volver
        btnVolver.addEventListener('click', mostrarPantallaLista);
        
        // Botón eliminar
        btnEliminar.addEventListener('click', mostrarModalEliminar);
        
        // Modal - Cancelar
        btnCancelarEliminar.addEventListener('click', ocultarModalEliminar);
        
        // Modal - Confirmar eliminación
        btnConfirmarEliminar.addEventListener('click', confirmarEliminacion);
        
        // Cerrar modal al hacer click fuera
        modalEliminar.addEventListener('click', function(e) {
            if (e.target === modalEliminar) {
                ocultarModalEliminar();
            }
        });
        
        // Inputs del formulario - actualizar interfaz al cambiar
        const inputs = [inputMeta, inputFecha, inputMontoAcumulado, inputMontoMeta];
        inputs.forEach(function(input) {
            input.addEventListener('input', actualizarInterfaz);
        });
    }

    // ============================================
    // INICIALIZACIÓN DE LA APLICACIÓN
    // ============================================
    
    /**
     * Inicializa la aplicación
     */
    async function inicializarApp() {
        // Configura los event listeners
        inicializarEventListeners();
        
        // Verificar si hay una sesión activa
        const sesionActiva = await obtenerSesion();
        
        if (sesionActiva) {
            // Si hay sesión, mostrar lista de metas
            await mostrarPantallaLista();
        } else {
            // Si no hay sesión, mostrar pantalla de login
            mostrarPantallaAuth();
        }
    }
    
    // Ejecutar inicialización
    inicializarApp();
});
