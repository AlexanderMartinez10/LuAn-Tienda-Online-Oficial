let products = JSON.parse(localStorage.getItem('luan_products')) || [
    {cat: 'Relojes', name: 'Reloj Cronos Gold', desc: 'Acabado en oro de 18k con correa de cuero italiano.', price: 85000, stock: 5, img: 'https://images.unsplash.com/photo-1524592091214-8c97af7c6a9c?q=80&w=600'},
    {cat: 'Carteras', name: 'Bolso Elegance Rose', desc: 'Cuero genuino color rosa pastel con detalles dorados.', price: 42000, stock: 3, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600'},
    {cat: 'Mochilas', name: 'Mochila Urban Style', desc: 'Diseño minimalista impermeable para laptop y accesorios.', price: 28500, stock: 10, img: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?q=80&w=600'}
];
let categories = JSON.parse(localStorage.getItem('luan_categories')) || ['Relojes', 'Carteras', 'Mochilas', 'Anteojos'];

let cart = [];
let currentCategory = 'Todos';
let clickCount = 0;
let clickTimer;
let uploadedImgBase64 = "";
let editingIndex = -1;

// --- Persistencia ---
function save() {
    localStorage.setItem('luan_products', JSON.stringify(products));
    localStorage.setItem('luan_categories', JSON.stringify(categories));
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').innerText = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('luan_theme', newTheme);
}

// --- Manejo de Imágenes ---
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'img-input') {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => { uploadedImgBase64 = reader.result; };
        if (file) reader.readAsDataURL(file);
    }
});

// --- Renderizado ---
function renderCategories() {
    const nav = document.getElementById('categories');
    nav.innerHTML = '';
    const allCats = ['Todos', ...categories];
    allCats.forEach(c => {
        const btn = document.createElement('button');
        btn.innerText = c;
        if(currentCategory === c) btn.classList.add('active');
        btn.onclick = () => { 
            currentCategory = c; 
            renderCategories();
            renderProducts(); 
        };
        nav.appendChild(btn);
    });
}

function renderProducts(filterList = products) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    const filtered = filterList.filter(p => currentCategory === 'Todos' || p.cat === currentCategory);
    
    filtered.forEach((p, index) => {
        const isOutOfStock = p.stock <= 0;
        const div = document.createElement('div');
        div.className = `card ${isOutOfStock ? 'out-of-stock' : ''}`;
        div.innerHTML = `
            ${isOutOfStock ? '<div class="badge-out">Sin Stock</div>' : ''}
            <img src="${p.img || 'https://via.placeholder.com/400x300?text=LuAn+Store'}" class="card-img" alt="${p.name}">
            <div class="card-info">
                <span class="stock-tag">${isOutOfStock ? 'Agotado' : `Stock: ${p.stock} unidades`}</span>
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: auto;">
                    <span class="price">$${Number(p.price).toLocaleString()}</span>
                    <button class="btn-add-cart" onclick="addToCart('${p.name}', ${p.price})" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Agotado' : 'Añadir 🛒'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    observeCards();
}

function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.cat.toLowerCase().includes(query)
    );
    renderProducts(filtered);
}

// --- Carrito ---
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
}

function addToCart(name, price) {
    const product = products.find(p => p.name === name);
    const cartCount = cart.filter(item => item.name === name).length;
    if (product.stock <= cartCount) return alert('No hay más stock disponible.');
    cart.push({ name, price });
    updateCart();
    const icon = document.querySelector('.cart-icon');
    icon.style.transform = 'scale(1.2)';
    setTimeout(() => icon.style.transform = 'scale(1)', 200);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:600;">${item.name}</span>
                <span style="font-size:0.8rem; color:var(--primary);">$${item.price.toLocaleString()}</span>
            </div>
            <button onclick="removeFromCart(${index})" style="background:none; border:none; cursor:pointer;">🗑️</button>
        `;
        cartItems.appendChild(div);
    });
    cartCount.innerText = cart.length;
    totalPrice.innerText = `$${total.toLocaleString()}`;
}

function removeFromCart(index) { cart.splice(index, 1); updateCart(); }

function sendWhatsApp() {
    if (cart.length === 0) return alert('El carrito está vacío.');
    cart.forEach(item => {
        const prod = products.find(p => p.name === item.name);
        if (prod && prod.stock > 0) prod.stock--;
    });
    save();
    const shipping = document.getElementById('shipping-method').value;
    const payment = document.getElementById('payment-method').value;

    let message = "Hola LuAn! 👋 Quisiera realizar el siguiente pedido:\n\n";
    let total = 0;
    cart.forEach(item => {
        message += `✅ ${item.name}: $${item.price.toLocaleString()}\n`;
        total += item.price;
    });
    message += `\n📍 *Envío:* ${shipping}`;
    message += `\n💳 *Pago:* ${payment}`;
    message += `\n\n*Total a pagar: $${total.toLocaleString()}*`;
    const encoded = encodeURIComponent(message);
    
    // Limpiar carrito tras "compra"
    cart = [];
    updateCart();
    toggleCart();
    renderProducts();

    window.open(`https://wa.me/5493795572548?text=${encoded}`); 
}

// --- Animaciones Scroll ---
function observeCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card').forEach(card => observer.observe(card));
}

// --- Admin ---
function logoClick() {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount === 3) {
        document.getElementById('login-modal').style.display = 'block';
        clickCount = 0;
    } else { clickTimer = setTimeout(() => { clickCount = 0; }, 1000); }
}

function checkLogin() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    if (user === 'admin' && pass === 'luan2024') {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        renderAdminLists();
    } else alert('Acceso denegado');
}

function renderAdminLists() {
    renderAdminProductList();
    renderAdminCatList();
    updateCatSelect();
}

function renderAdminProductList() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;
    list.innerHTML = '';
    products.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'admin-item';
        div.innerHTML = `
            <div class="admin-item-info"><strong>${p.name}</strong><small>${p.cat} - Stock: ${p.stock}</small></div>
            <div class="admin-item-actions">
                <button class="btn-edit" onclick="startEdit(${i})">✏️</button>
                <button class="btn-delete" onclick="deleteProduct(${i})">🗑️</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderAdminCatList() {
    const list = document.getElementById('admin-cat-list');
    if (!list) return;
    list.innerHTML = '';
    categories.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'admin-item';
        div.innerHTML = `
            <span>${c}</span>
            <button class="btn-delete" onclick="deleteCategory(${i})">🗑️</button>
        `;
        list.appendChild(div);
    });
}

function updateCatSelect() {
    const select = document.getElementById('cat-select');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar Categoría</option>';
    categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.innerText = c;
        select.appendChild(opt);
    });
}

function addCategory() {
    const name = document.getElementById('new-cat').value.trim();
    if (!name) return alert('Ingresa un nombre de categoría.');
    if (categories.includes(name)) return alert('La categoría ya existe.');
    categories.push(name);
    save();
    document.getElementById('new-cat').value = '';
    renderAdminLists();
    renderCategories();
}

function deleteCategory(index) {
    if (confirm(`¿Borrar categoría "${categories[index]}"? Los productos en ella no se borrarán.`)) {
        categories.splice(index, 1);
        save();
        renderAdminLists();
        renderCategories();
    }
}

function startEdit(index) {
    const p = products[index];
    document.getElementById('cat-select').value = p.cat;
    document.getElementById('name').value = p.name;
    document.getElementById('desc').value = p.desc;
    document.getElementById('price').value = p.price;
    document.getElementById('stock').value = p.stock;
    uploadedImgBase64 = p.img;
    editingIndex = index;
    document.getElementById('admin-btn').innerText = "Guardar Cambios";
    document.getElementById('admin-btn').onclick = saveEdit;
    document.querySelector('.modal-content').scrollTop = 0;
}

function saveEdit() {
    const cat = document.getElementById('cat-select').value;
    const name = document.getElementById('name').value;
    const desc = document.getElementById('desc').value;
    const price = Number(document.getElementById('price').value);
    const stock = Number(document.getElementById('stock').value);
    if(!cat || !name) return alert('Completa Categoría y Nombre.');
    products[editingIndex] = { cat, name, desc, price, stock, img: uploadedImgBase64 || products[editingIndex].img };
    save();
    location.reload();
}

function deleteProduct(index) {
    if (confirm(`¿Eliminar "${products[index].name}"?`)) {
        products.splice(index, 1);
        save();
        location.reload();
    }
}

function addProduct() {
    const cat = document.getElementById('cat-select').value;
    const name = document.getElementById('name').value;
    const desc = document.getElementById('desc').value;
    const price = Number(document.getElementById('price').value);
    const stock = Number(document.getElementById('stock').value) || 0;
    if(!cat || !name || !price) return alert('Completa Categoría, Nombre y Precio.');
    const product = { cat, name, desc, price, stock, img: uploadedImgBase64 || 'https://via.placeholder.com/400x300?text=LuAn+Store' };
    
    fetch('/api/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    })
    .then(r => {
        if (!r.ok) throw new Error('Error guardando en el servidor');
        return r.json();
    })
    .then(data => {
        products.push(product);
        save();
        renderProducts();
        alert('Producto guardado correctamente. Se reflejará en la tienda en unos minutos.');
    })
    .catch(err => {
        console.error(err);
        alert('No se pudo guardar el producto en el servidor');
    });
}

function closeModal() { document.getElementById('login-modal').style.display = 'none'; }
function closeAdmin() { 
    document.getElementById('admin-panel').style.display = 'none'; 
    editingIndex = -1;
    document.getElementById('admin-btn').innerText = "Guardar en Catálogo";
    document.getElementById('admin-btn').onclick = addProduct;
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('luan_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').innerText = savedTheme === 'dark' ? '☀️' : '🌙';
    
    fetch('/api/get-products')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && Array.isArray(data)) {
                products = data;
                save();
            }
            renderCategories();
            renderProducts();
        })
        .catch(() => {
            renderCategories();
            renderProducts();
        });
});

window.onclick = function(event) {
    if (event.target.className === 'modal') { closeModal(); closeAdmin(); }
}

