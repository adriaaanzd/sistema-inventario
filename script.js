const STOCK_BAJO = 3;
const formatoSoles = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN"
});

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editandoId = null;

const form = document.getElementById("formProducto");
const tituloForm = document.getElementById("tituloForm");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const mensaje = document.getElementById("mensaje");

// Guardar datos en el navegador
function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

// Mostrar los productos
function mostrarProductos() {
    const tabla = document.getElementById("tablaProductos");
    const busqueda = document.getElementById("buscar").value.toLowerCase();

    tabla.innerHTML = "";

    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda)
    );

    if (filtrados.length === 0) {
        const vacio = tabla.insertRow().insertCell();
        vacio.colSpan = 6;
        vacio.className = "vacio";
        vacio.textContent = productos.length === 0
            ? "Aún no hay productos. Registre el primero con el formulario."
            : "Ningún producto coincide con la búsqueda.";
    }

    filtrados.forEach(p => {
        const fila = document.createElement("tr");
        const bajo = p.cantidad <= STOCK_BAJO;

        if (p.id === editandoId) fila.className = "editando";

        function celda(valor, clase) {
            const td = document.createElement("td");
            td.textContent = valor;
            if (clase) td.className = clase;
            fila.appendChild(td);
            return td;
        }

        celda(p.nombre);
        celda(p.categoria);
        celda(formatoSoles.format(p.precio), "num");
        celda(p.cantidad, bajo ? "num bajo" : "num");
        celda(bajo ? "Stock bajo" : "Normal",
              bajo ? "estado-bajo" : "estado-normal");

        const acciones = document.createElement("td");
        acciones.className = "num";

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.className = "btn-editar";
        editar.addEventListener("click", () => editarProducto(p.id));

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.className = "btn-eliminar";
        eliminar.addEventListener("click", () => eliminarProducto(p.id));

        acciones.append(editar, eliminar);
        fila.appendChild(acciones);
        tabla.appendChild(fila);
    });

    actualizarResumen();
}

// Volver el formulario al modo "nuevo producto"
function salirDeEdicion() {
    editandoId = null;
    form.reset();
    tituloForm.textContent = "Nuevo producto";
    btnGuardar.textContent = "Guardar producto";
    btnCancelar.hidden = true;
    mensaje.textContent = "";
    mostrarProductos();
}

// Registrar o actualizar
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value;
    const precio = Number(document.getElementById("precio").value);
    const cantidad = Number(document.getElementById("cantidad").value);

    if (!nombre || !categoria || !Number.isFinite(precio) ||
        precio < 0 || !Number.isInteger(cantidad) || cantidad < 0) {
        mensaje.textContent = "Revise los datos ingresados.";
        return;
    }

    if (editandoId !== null) {
        const producto = productos.find(p => p.id === editandoId);
        if (producto) {
            producto.nombre = nombre;
            producto.categoria = categoria;
            producto.precio = precio;
            producto.cantidad = cantidad;
        }
    } else {
        productos.push({
            id: Date.now() + Math.random(),
            nombre,
            categoria,
            precio,
            cantidad
        });
    }

    guardarDatos();
    salirDeEdicion();
});

btnCancelar.addEventListener("click", salirDeEdicion);

// Editar producto
function editarProducto(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("categoria").value = p.categoria;
    document.getElementById("precio").value = p.precio;
    document.getElementById("cantidad").value = p.cantidad;

    editandoId = id;
    tituloForm.textContent = "Editar producto";
    btnGuardar.textContent = "Actualizar producto";
    btnCancelar.hidden = false;
    mensaje.textContent = "";
    mostrarProductos();

    const suave = matchMedia("(prefers-reduced-motion: no-preference)").matches;
    form.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "nearest" });
    document.getElementById("nombre").focus({ preventScroll: true });
}

// Eliminar producto
function eliminarProducto(id) {
    if (!confirm("¿Desea eliminar este producto?")) return;

    productos = productos.filter(p => p.id !== id);
    guardarDatos();

    if (editandoId === id) salirDeEdicion();
    else mostrarProductos();
}

// Actualizar indicadores
function actualizarResumen() {
    document.getElementById("totalProductos").textContent = productos.length;

    const bajos = productos.filter(p => p.cantidad <= STOCK_BAJO).length;
    const indicadorBajo = document.getElementById("stockBajo");
    indicadorBajo.textContent = bajos;
    indicadorBajo.classList.toggle("alerta", bajos > 0);

    const valor = productos.reduce(
        (total, p) => total + p.precio * p.cantidad, 0
    );

    document.getElementById("valorInventario").textContent =
        formatoSoles.format(valor);
}

// Buscar en tiempo real
document.getElementById("buscar").addEventListener("input", mostrarProductos);

// Cargar productos al abrir la página
mostrarProductos();
