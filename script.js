
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editandoId = null;

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

    filtrados.forEach(p => {
        const fila = document.createElement("tr");

        function celda(valor) {
            const td = document.createElement("td");
            td.textContent = valor;
            fila.appendChild(td);
            return td;
        }

        celda(p.nombre);
        celda(p.categoria);
        celda("S/ " + p.precio.toFixed(2));
        celda(p.cantidad);

        const estado = celda(p.cantidad <= 3 ? "Stock bajo" : "Normal");
        estado.className = p.cantidad <= 3
            ? "estado-bajo" : "estado-normal";

        const acciones = document.createElement("td");

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

// Registrar o actualizar
document.getElementById("formProducto").addEventListener("submit", function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value;
    const precio = Number(document.getElementById("precio").value);
    const cantidad = Number(document.getElementById("cantidad").value);

    if (!nombre || !categoria || !Number.isFinite(precio) ||
        precio < 0 || !Number.isInteger(cantidad) || cantidad < 0) {
        alert("Verifique los datos ingresados");
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
        editandoId = null;
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
    mostrarProductos();
    this.reset();
    document.getElementById("btnGuardar").textContent = "Guardar producto";
});

// Editar producto
function editarProducto(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("categoria").value = p.categoria;
    document.getElementById("precio").value = p.precio;
    document.getElementById("cantidad").value = p.cantidad;

    editandoId = id;
    document.getElementById("btnGuardar").textContent = "Actualizar producto";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Eliminar producto
function eliminarProducto(id) {
    if (!confirm("¿Desea eliminar este producto?")) return;

    productos = productos.filter(p => p.id !== id);

    if (editandoId === id) {
        editandoId = null;
        document.getElementById("formProducto").reset();
        document.getElementById("btnGuardar").textContent = "Guardar producto";
    }

    guardarDatos();
    mostrarProductos();
}

// Actualizar indicadores
function actualizarResumen() {
    document.getElementById("totalProductos").textContent = productos.length;

    const bajos = productos.filter(p => p.cantidad <= 3).length;
    document.getElementById("stockBajo").textContent = bajos;

    const valor = productos.reduce(
        (total, p) => total + p.precio * p.cantidad, 0
    );

    document.getElementById("valorInventario").textContent =
        "S/ " + valor.toFixed(2);
}

// Buscar en tiempo real
document.getElementById("buscar").addEventListener("input", mostrarProductos);

// Cargar productos al abrir la página
mostrarProductos();
