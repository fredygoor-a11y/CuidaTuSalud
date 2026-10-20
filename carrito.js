
// ========================================================
// CUIDA TU SALUD NATURALMENTE
// Carrito de compras, WhatsApp, formulario y galería
// ========================================================

// CAMBIA ESTE NÚMERO SI ES NECESARIO.
// Código de Colombia (57) + número celular de 10 dígitos.
// Aquí se utiliza 311 618 6558, el número mostrado en la página.
const WHATSAPP_TIENDA = "573116186558";

const CLAVE_CARRITO = "cuidaTuSaludCarrito";

// Elementos principales
const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
const btnVerCarrito = document.getElementById("btn-ver-carrito");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const ventanaCarrito = document.getElementById("carrito-ventana");
const fondoCarrito = document.getElementById("carrito-fondo");
const listaCarrito = document.getElementById("lista-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const precioTotal = document.getElementById("precio-total");
const btnEnviarWhatsApp = document.getElementById("btn-enviar-whatsapp");
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

const menuToggle = document.getElementById("menu-toggle");
const menuPrincipal = document.getElementById("menu-principal");

const formularioContacto = document.getElementById("formulario-contacto");
const estadoFormulario = document.getElementById("estado-formulario");

const visorGaleria = document.getElementById("visor-galeria");
const visorImagen = document.getElementById("visor-imagen");
const visorContador = document.getElementById("visor-contador");
const btnVisorCerrar = document.getElementById("visor-cerrar");
const btnVisorAnterior = document.getElementById("visor-anterior");
const btnVisorSiguiente = document.getElementById("visor-siguiente");

// Formatear cantidades en pesos colombianos
const formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
});

function formatearPrecio(valor) {
    return formatoCOP.format(valor);
}

// ========================================================
// 1. CARRITO DE COMPRAS
// ========================================================

let carrito = cargarCarrito();

function cargarCarrito() {
    try {
        const guardado = localStorage.getItem(CLAVE_CARRITO);

        if (!guardado) {
            return [];
        }

        const datos = JSON.parse(guardado);

        if (!Array.isArray(datos)) {
            return [];
        }

        // Comprobar los datos guardados antes de utilizarlos.
        return datos.filter(producto =>
            producto &&
            typeof producto.nombre === "string" &&
            Number.isSafeInteger(producto.precio) &&
            producto.precio >= 0 &&
            Number.isSafeInteger(producto.cantidad) &&
            producto.cantidad > 0 &&
            producto.cantidad <= 99
        );
    } catch (error) {
        console.warn("No fue posible recuperar el carrito guardado.", error);
        return [];
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch (error) {
        console.warn("No fue posible guardar el carrito en este navegador.", error);
    }
}

function calcularCantidadTotal() {
    return carrito.reduce((total, producto) => total + producto.cantidad, 0);
}

function calcularPrecioTotal() {
    return carrito.reduce(
        (total, producto) => total + producto.precio * producto.cantidad,
        0
    );
}

function actualizarContador() {
    const cantidad = calcularCantidadTotal();

    contadorCarrito.textContent = cantidad;
    contadorCarrito.setAttribute(
        "aria-label",
        `${cantidad} productos en el carrito`
    );

    precioTotal.textContent = formatearPrecio(calcularPrecioTotal());
    btnEnviarWhatsApp.disabled = carrito.length === 0;
    btnVaciarCarrito.disabled = carrito.length === 0;
}

function crearElemento(tag, clase, texto) {
    const elemento = document.createElement(tag);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

function dibujarCarrito() {
    listaCarrito.replaceChildren();

    if (carrito.length === 0) {
        const mensaje = crearElemento(
            "p",
            "carrito-vacio",
            "Tu carrito está vacío. Agrega un producto para comenzar."
        );

        listaCarrito.appendChild(mensaje);
        actualizarContador();
        return;
    }

    carrito.forEach(producto => {
        const item = crearElemento("article", "carrito-item");
        const informacion = crearElemento("div", "carrito-item-info");

        informacion.appendChild(
            crearElemento("h4", "", producto.nombre)
        );

        informacion.appendChild(
            crearElemento(
                "span",
                "carrito-precio-unitario",
                `${formatearPrecio(producto.precio)} por unidad`
            )
        );

        informacion.appendChild(
            crearElemento(
                "p",
                "carrito-subtotal",
                `Subtotal: ${formatearPrecio(producto.precio * producto.cantidad)}`
            )
        );

        const controles = crearElemento("div", "carrito-item-controles");

        const btnMenos = crearElemento("button", "", "−");
        btnMenos.type = "button";
        btnMenos.setAttribute(
            "aria-label",
            `Disminuir cantidad de ${producto.nombre}`
        );
        btnMenos.dataset.accion = "disminuir";
        btnMenos.dataset.nombre = producto.nombre;

        const cantidad = crearElemento("span", "", producto.cantidad);
        cantidad.setAttribute("aria-label", "Cantidad");

        const btnMas = crearElemento("button", "", "+");
        btnMas.type = "button";
        btnMas.setAttribute(
            "aria-label",
            `Aumentar cantidad de ${producto.nombre}`
        );
        btnMas.dataset.accion = "aumentar";
        btnMas.dataset.nombre = producto.nombre;

        controles.append(btnMenos, cantidad, btnMas);
        informacion.appendChild(controles);

        const btnEliminar = crearElemento("button", "carrito-eliminar", "Eliminar");
        btnEliminar.type = "button";
        btnEliminar.dataset.accion = "eliminar";
        btnEliminar.dataset.nombre = producto.nombre;
        btnEliminar.setAttribute(
            "aria-label",
            `Eliminar ${producto.nombre} del carrito`
        );

        item.append(informacion, btnEliminar);
        listaCarrito.appendChild(item);
    });

    actualizarContador();
}

function agregarProducto(nombre, precio) {
    const productoExistente = carrito.find(
        producto => producto.nombre === nombre && producto.precio === precio
    );

    if (productoExistente) {
        if (productoExistente.cantidad >= 99) {
            alert("Has alcanzado el máximo de 99 unidades para este producto.");
            return;
        }

        productoExistente.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    guardarCarrito();
    dibujarCarrito();
}

function modificarCantidad(nombre, accion) {
    const producto = carrito.find(item => item.nombre === nombre);

    if (!producto) {
        return;
    }

    if (accion === "aumentar" && producto.cantidad < 99) {
        producto.cantidad++;
    } else if (accion === "aumentar") {
        alert("Has alcanzado el máximo de 99 unidades.");
        return;
    }

    if (accion === "disminuir") {
        producto.cantidad--;

        if (producto.cantidad <= 0) {
            carrito = carrito.filter(item => item.nombre !== nombre);
        }
    }

    if (accion === "eliminar") {
        carrito = carrito.filter(item => item.nombre !== nombre);
    }

    guardarCarrito();
    dibujarCarrito();
}

// Escuchar todos los botones para agregar productos
document.querySelectorAll(".boton-agregar").forEach(boton => {
    boton.addEventListener("click", () => {
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        if (!nombre || !Number.isSafeInteger(precio) || precio < 0) {
            alert("No se pudo agregar este producto. Revisa su nombre y precio.");
            return;
        }

        agregarProducto(nombre, precio);

        const textoOriginal = boton.textContent;
        boton.textContent = "✓ Agregado";

        window.setTimeout(() => {
            boton.textContent = textoOriginal;
        }, 900);
    });
});

// Controles de cantidad y eliminación del carrito
listaCarrito.addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) {
        return;
    }

    modificarCantidad(boton.dataset.nombre, boton.dataset.accion);
});

// Abrir y cerrar el carrito

function abrirCarrito() {
    ventanaCarrito.classList.add("activo");
    fondoCarrito.classList.add("activo");
    ventanaCarrito.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");

    btnCerrarCarrito.focus();
}

function cerrarCarrito() {
    ventanaCarrito.classList.remove("activo");
    fondoCarrito.classList.remove("activo");
    ventanaCarrito.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
}

// Botón flotante
if (btnAbrirCarrito) {
    btnAbrirCarrito.addEventListener("click", abrirCarrito);
}

// Botón "Mi pedido" de la navegación
if (btnVerCarrito) {
    btnVerCarrito.addEventListener("click", abrirCarrito);
}

// Botón de cerrar y fondo oscuro
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);

// Vaciar todos los productos
btnVaciarCarrito.addEventListener("click", () => {
    if (carrito.length === 0) {
        return;
    }

    const confirmar = window.confirm(
        "¿Estás seguro de que deseas vaciar todo el carrito?"
    );

    if (!confirmar) {
        return;
    }

    carrito = [];
    guardarCarrito();
    dibujarCarrito();
});

// Crear el mensaje del pedido y abrir WhatsApp
btnEnviarWhatsApp.addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("Agrega al menos un producto antes de confirmar el pedido.");
        return;
    }

    const lineas = carrito.map(producto => {
        const subtotal = producto.precio * producto.cantidad;

        return `• ${producto.nombre}\n  Cantidad: ${producto.cantidad}\n  Subtotal: ${formatearPrecio(subtotal)}`;
    });

    const mensaje = [
        "¡Hola! Quiero consultar y confirmar este pedido:",
        "",
        ...lineas,
        "",
        `TOTAL ESTIMADO: ${formatearPrecio(calcularPrecioTotal())}`,
        "",
        "Por favor, confirmen disponibilidad, precio final y forma de entrega."
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_TIENDA}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank", "noopener,noreferrer");
});

// ========================================================
// 2. MENÚ ADAPTABLE PARA CELULARES
// ========================================================

function cerrarMenuMovil() {
    menuPrincipal.classList.remove("abierto");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
}

menuToggle.addEventListener("click", () => {
    const abierto = menuPrincipal.classList.toggle("abierto");

    menuToggle.setAttribute("aria-expanded", String(abierto));
    menuToggle.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
    );
});

menuPrincipal.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", cerrarMenuMovil);
});

// ========================================================
// 3. FORMULARIO DE CONTACTO POR WHATSAPP
// ========================================================

formularioContacto.addEventListener("submit", evento => {
    evento.preventDefault();

    if (!formularioContacto.checkValidity()) {
        formularioContacto.reportValidity();
        return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensajeUsuario = document.getElementById("mensaje").value.trim();

    if (!nombre || !correo || !mensajeUsuario) {
        estadoFormulario.textContent = "Completa todos los campos antes de continuar.";
        return;
    }

    const mensajeWhatsApp = [
        "Hola, me comunico desde la página de Cuida Tu Salud Naturalmente.",
        "",
        `Nombre: ${nombre}`,
        `Correo: ${correo}`,
        "",
        "Mi consulta:",
        mensajeUsuario
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_TIENDA}?text=${encodeURIComponent(mensajeWhatsApp)}`;

    estadoFormulario.textContent =
        "Se abrirá WhatsApp con tu mensaje preparado. Pulsa Enviar en WhatsApp para enviarlo.";

    window.open(url, "_blank", "noopener,noreferrer");
});

// ========================================================
// 4. GALERÍA CON IMÁGENES AMPLIADAS
// ========================================================

const botonesGaleria = Array.from(
    document.querySelectorAll(".galeria-foto")
);

const imagenesGaleria = botonesGaleria.map(boton => {
    const imagen = boton.querySelector("img");

    return {
        src: imagen.getAttribute("src"),
        alt: imagen.getAttribute("alt")
    };
});

let indiceGaleria = 0;

function mostrarImagenGaleria(indice) {
    if (imagenesGaleria.length === 0) {
        return;
    }

    indiceGaleria =
        (indice + imagenesGaleria.length) % imagenesGaleria.length;

    const imagen = imagenesGaleria[indiceGaleria];

    visorImagen.src = imagen.src;
    visorImagen.alt = imagen.alt;
    visorContador.textContent =
        `${indiceGaleria + 1} / ${imagenesGaleria.length}`;
}

function abrirGaleria(indice) {
    mostrarImagenGaleria(indice);
    visorGaleria.classList.add("activo");
    visorGaleria.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
    btnVisorCerrar.focus();
}

function cerrarGaleria() {
    visorGaleria.classList.remove("activo");
    visorGaleria.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
}

botonesGaleria.forEach((boton, indice) => {
    boton.addEventListener("click", () => abrirGaleria(indice));
});

btnVisorCerrar.addEventListener("click", cerrarGaleria);

btnVisorAnterior.addEventListener("click", () => {
    mostrarImagenGaleria(indiceGaleria - 1);
});

btnVisorSiguiente.addEventListener("click", () => {
    mostrarImagenGaleria(indiceGaleria + 1);
});

// Cerrar ventanas con Escape y navegar por la galería con las flechas
document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        if (visorGaleria.classList.contains("activo")) {
            cerrarGaleria();
        } else if (ventanaCarrito.classList.contains("activo")) {
            cerrarCarrito();
        }

        cerrarMenuMovil();
    }

    if (visorGaleria.classList.contains("activo")) {
        if (evento.key === "ArrowLeft") {
            mostrarImagenGaleria(indiceGaleria - 1);
        }

        if (evento.key === "ArrowRight") {
            mostrarImagenGaleria(indiceGaleria + 1);
        }
    }
});

// Cerrar el menú si la ventana vuelve al tamaño de escritorio
window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
        cerrarMenuMovil();
    }
});

// ========================================================
// 5. AÑO AUTOMÁTICO Y CARGA INICIAL
// ========================================================

document.getElementById("anio-actual").textContent =
    new Date().getFullYear();

dibujarCarrito();
