// let productsData = [];
// let cart = {};
// let currentUser = localStorage.getItem("currentUser");
// let users = JSON.parse(localStorage.getItem("users")) || [];
// let isLogin = true;

// // Initialize
// window.onload = () => {
//     loadProducts();
//     updateAuthUI();
// };

// async function loadProducts() {
//     try {
//         const response = await fetch('pro.json');
//         productsData = await response.json();
//         render(productsData);
//     } catch (error) {
//         console.error("Fetch error:", error);
//     }
// }

let productsData = [];
let cart = {};
let currentUser = localStorage.getItem("currentUser");
let users = JSON.parse(localStorage.getItem("users")) || [];
let isLogin = true;

// Initialize
window.onload = () => {
    loadProducts();
    updateAuthUI();
};

async function loadProducts() {
    try {
        const response = await fetch('pro.json');
        productsData = await response.json();
        render(productsData);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// Render function ko update karein (onclick add kiya hai)
function render(data) {
    const grid = document.getElementById("products");
    grid.innerHTML = data.map(p => `
        <div class="card" onclick="openProductDetail(${p.id})">
            <img src="${p.img}" alt="${p.name}">
            <h5 style="color:var(--primary)">${p.brand}</h5>
            <h3>${p.name}</h3>
            <p>₹${p.price.toLocaleString()}</p>
            <button onclick="event.stopPropagation(); addToCart('${p.name}', ${p.price})">Add to Cart</button>
        </div>
    `).join('');
}

// Naya function single product detail dikhane ke liye
function openProductDetail(id) {
    const p = productsData.find(item => item.id === id);
    if (!p) return;

    const content = document.getElementById("productDetailContent");
    content.innerHTML = `
        <img src="${p.img}" alt="${p.name}" style="width:100%; border-radius:15px; max-height:300px; object-fit:contain;">
        <h2 style="margin-top:15px;">${p.name}</h2>
        <h4 style="color:var(--text-muted)">${p.brand}</h4>
        <p class="price-cyan" style="font-size:1.5rem; margin:10px 0;">₹${p.price.toLocaleString()}</p>
        <p style="color:#555; line-height:1.6;">This is a premium ${p.name} with latest features and high performance. Perfect for your daily needs.</p>
        <button class="yellow-btn" onclick="addToCart('${p.name}', ${p.price}); closeProductModal()">Add to Cart</button>
    `;
    document.getElementById("productModal").classList.add("show");
}

function closeProductModal() {
    document.getElementById("productModal").classList.remove("show");
}

// Search & Filter
document.getElementById('search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = productsData.filter(p => 
        p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
    );
    render(filtered);
});

function filterCat(cat) {
    if (cat === 'all') render(productsData);
    else render(productsData.filter(p => p.category === cat));
}

// Cart Logic
function addToCart(name, price) {
    if (!cart[name]) cart[name] = { qty: 0, price: price };
    cart[name].qty++;
    updateCartUI();
}

function updateCartUI() {
    let count = 0, total = 0, html = "";
    for (let key in cart) {
        let item = cart[key];
        count += item.qty;
        total += (item.qty * item.price);
        html += `<p>${key} x ${item.qty} = ₹${(item.qty * item.price).toLocaleString()}</p>`;
    }
    document.getElementById("count").innerText = count;
    document.getElementById("total").innerText = total.toLocaleString();
    document.getElementById("cartItems").innerHTML = html || "Your cart is empty";
}

function openCart() { document.getElementById("cartModal").classList.add("show"); }
function closeCart() { document.getElementById("cartModal").classList.remove("show"); }

// Auth Logic
function updateAuthUI() {
    document.getElementById("loginBtn").classList.toggle("hidden", !!currentUser);
    document.getElementById("logoutBtn").classList.toggle("hidden", !currentUser);
}

function openLogin() { document.getElementById("loginModal").classList.add("show"); }
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById("authTitle").innerText = isLogin ? "Login" : "Create Account";
}

function handleAuth() {
    let u = document.getElementById("username").value.trim();
    let p = document.getElementById("password").value.trim();
    if (!u || !p) return alert("Fill all fields");

    if (isLogin) {
        let user = users.find(x => x.username === u && x.password === p);
        if (user) {
            currentUser = u;
            localStorage.setItem("currentUser", u);
            location.reload();
        } else alert("Invalid Credentials");
    } else {
        users.push({ username: u, password: p });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Account created! Now Login.");
        toggleAuth();
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

// --- NEW ENHANCED PAYMENT LOGIC ---

function pay() {
    if (!currentUser) return alert("Please login to checkout");
    if (Object.keys(cart).length === 0) return alert("Cart is empty");
    closeCart();
    document.getElementById("paymentModal").classList.add("show");
}

function startPaymentAnimation() {
    // Validate fields
    const name = document.getElementById("fullName").value;
    const ph = document.getElementById("phone").value;
    const addr = document.getElementById("address").value;
    if (!name || !ph || !addr) return alert("Please fill shipping details");

    document.getElementById("paymentStep1").classList.add("hidden");
    document.getElementById("paymentAnimScreen").classList.remove("hidden");

    // After 2.5 seconds, show summary
    setTimeout(() => {
        document.getElementById("paymentAnimScreen").classList.add("hidden");
        showSummary();
    }, 2500);
}

function showSummary() {
    const summaryDetails = document.getElementById("summaryDetails");
    const summaryPricing = document.getElementById("summaryPricing");
    
    // Customer Info
    let custHtml = `
        <p><strong>To:</strong> ${document.getElementById("fullName").value}</p>
        <p><strong>Ph:</strong> ${document.getElementById("phone").value}</p>
        <p><strong>Address:</strong> ${document.getElementById("address").value}, ${document.getElementById("city").value} - ${document.getElementById("pincode").value}</p>
        <h4 style="margin-top:15px;">Products:</h4>
    `;

    // Order Info
    let subtotal = 0;
    for (let key in cart) {
        let item = cart[key];
        let itemTotal = item.qty * item.price;
        subtotal += itemTotal;
        custHtml += `<div class="summary-item"><span>${key} (x${item.qty})</span><span>₹${itemTotal.toLocaleString()}</span></div>`;
    }

    const delivery = subtotal > 10000 ? 0 : 500;
    const total = subtotal + delivery;

    let pricingHtml = `
        <div class="summary-item"><span>Subtotal</span><span>₹${subtotal.toLocaleString()}</span></div>
        <div class="summary-item"><span>Delivery</span><span>${delivery === 0 ? "FREE" : "₹" + delivery}</span></div>
        <div class="summary-total"><span>Amount Payable</span><span>₹${total.toLocaleString()}</span></div>
    `;

    summaryDetails.innerHTML = custHtml;
    summaryPricing.innerHTML = pricingHtml;
    document.getElementById("orderSummaryScreen").classList.remove("hidden");
}

function showQRCode() {
    document.getElementById("orderSummaryScreen").classList.add("hidden");
    document.getElementById("paymentStep2").classList.remove("hidden");
    
    // Dynamic QR generation
    const qrContainer = document.getElementById("qrContainer");
    const totalRaw = document.getElementById("total").innerText.replace(/,/g, '');
    qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=maahi@bank&am=${totalRaw}" alt="QR">`;
}

function closePaymentModal() {
    document.getElementById("paymentModal").classList.remove("show");
    // Reset view for next time
    setTimeout(() => {
        document.getElementById("paymentStep1").classList.remove("hidden");
        document.getElementById("orderSummaryScreen").classList.add("hidden");
        document.getElementById("paymentStep2").classList.add("hidden");
        document.getElementById("paymentStep3").classList.add("hidden");
    }, 500);
}

function simulateScan() {
    document.getElementById("paymentStep2").classList.add("hidden");
    document.getElementById("paymentStep3").classList.remove("hidden");
    document.getElementById("txnId").innerText = "MAAHI-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function closePaymentAndClearCart() {
    cart = {};
    updateCartUI();
    closePaymentModal();
}

// Search & Filter
document.getElementById('search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = productsData.filter(p => 
        p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
    );
    render(filtered);
});

function filterCat(cat) {
    if (cat === 'all') render(productsData);
    else render(productsData.filter(p => p.category === cat));
}

// // Cart Logic
// function addToCart(name, price) {
//     if (!cart[name]) cart[name] = { qty: 0, price: price };
//     cart[name].qty++;
//     updateCartUI();
// }

// function updateCartUI() {
//     let count = 0, total = 0, html = "";
//     for (let key in cart) {
//         let item = cart[key];
//         count += item.qty;
//         total += (item.qty * item.price);
//         html += `<p>${key} x ${item.qty} = ₹${(item.qty * item.price).toLocaleString()}</p>`;
//     }
//     document.getElementById("count").innerText = count;
//     document.getElementById("total").innerText = total.toLocaleString();
//     document.getElementById("cartItems").innerHTML = html || "Your cart is empty";
// }

// function openCart() { document.getElementById("cartModal").classList.add("show"); }
// function closeCart() { document.getElementById("cartModal").classList.remove("show"); }

// // Auth Logic
// function updateAuthUI() {
//     document.getElementById("loginBtn").classList.toggle("hidden", !!currentUser);
//     document.getElementById("logoutBtn").classList.toggle("hidden", !currentUser);
// }

// function openLogin() { document.getElementById("loginModal").classList.add("show"); }
// function toggleAuth() {
//     isLogin = !isLogin;
//     document.getElementById("authTitle").innerText = isLogin ? "Login" : "Create Account";
// }

// function handleAuth() {
//     let u = document.getElementById("username").value.trim();
//     let p = document.getElementById("password").value.trim();
//     if (!u || !p) return alert("Fill all fields");

//     if (isLogin) {
//         let user = users.find(x => x.username === u && x.password === p);
//         if (user) {
//             currentUser = u;
//             localStorage.setItem("currentUser", u);
//             location.reload();
//         } else alert("Invalid Credentials");
//     } else {
//         users.push({ username: u, password: p });
//         localStorage.setItem("users", JSON.stringify(users));
//         alert("Account created! Now Login.");
//         toggleAuth();
//     }
// }

// function logout() {
//     localStorage.removeItem("currentUser");
//     location.reload();
// }

// // Payment Logic
// function pay() {
//     if (!currentUser) return alert("Please login to checkout");
//     if (Object.keys(cart).length === 0) return alert("Cart is empty");

//     closeCart();
//     document.getElementById("checkoutTotal").innerText = document.getElementById("total").innerText;
//     document.getElementById("paymentModal").classList.add("show");
// }

// function generateQR() {
//     document.getElementById("paymentStep1").classList.add("hidden");
//     document.getElementById("paymentStep2").classList.remove("hidden");
// }

// function simulateScan() {
//     document.getElementById("paymentStep2").classList.add("hidden");
//     document.getElementById("paymentStep3").classList.remove("hidden");
//     document.getElementById("txnId").innerText = "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();
// }

// function closePaymentAndClearCart() {
//     cart = {};
//     updateCartUI();
//     document.getElementById("paymentModal").classList.remove("show");
//     document.getElementById("paymentStep1").classList.remove("hidden");
//     document.getElementById("paymentStep3").classList.add("hidden");
// }