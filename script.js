const WHATSAPP_NUMBER = "967773771761";

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function parsePrice(priceText) {
  return parseInt(String(priceText).replace(/[^0-9]/g, ""), 10) || 0;
}

function formatPrice(value) {
  return `${value} ريال`;
}

function addToCart(name, priceText, image) {
  const cart = getCart();
  const found = cart.find(item => item.name === name);

  if (found) {
    found.qty += 1;
  } else {
    cart.push({
      name,
      priceText,
      price: parsePrice(priceText),
      image,
      qty: 1
    });
  }

  saveCart(cart);
  alert("تمت إضافة المنتج إلى السلة");
}

function changeQty(index, amount) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].qty += amount;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCartPage();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function getTotals(cart) {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return { count, total };
}

function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems) return;

  const cart = getCart();
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="single-box">السلة فارغة حالياً</div>`;
    if (cartCount) cartCount.textContent = "0";
    if (cartTotal) cartTotal.textContent = "0 ريال";
    return;
  }

  cart.forEach((item, index) => {
    cartItems.innerHTML += `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${item.priceText}</p>
          <div class="cart-controls">
            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
      </div>
    `;
  });

  const totals = getTotals(cart);
  if (cartCount) cartCount.textContent = totals.count;
  if (cartTotal) cartTotal.textContent = formatPrice(totals.total);
}

function renderCheckoutSummary() {
  const box = document.getElementById("checkoutSummary");
  if (!box) return;

  const cart = getCart();

  if (cart.length === 0) {
    box.innerHTML = `<p>السلة فارغة حالياً.</p>`;
    return;
  }

  let html = "";
  cart.forEach(item => {
    html += `
      <div class="summary-line">
        <span>${item.name} × ${item.qty}</span>
        <strong>${formatPrice(item.price * item.qty)}</strong>
      </div>
    `;
  });

  const totals = getTotals(cart);
  html += `<hr style="border-color: rgba(255,255,255,.08); margin: 14px 0;">`;
  html += `
    <div class="summary-line">
      <span>الإجمالي</span>
      <strong>${formatPrice(totals.total)}</strong>
    </div>
  `;

  box.innerHTML = html;
}

function sendOrderWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("السلة فارغة");
    return;
  }

  const name = document.getElementById("customerName")?.value.trim();
  const phone = document.getElementById("customerPhone")?.value.trim();
  const address = document.getElementById("customerAddress")?.value.trim();
  const payment = document.getElementById("paymentMethod")?.value;
  const notes = document.getElementById("customerNotes")?.value.trim();

  if (!name || !phone || !address) {
    alert("يرجى تعبئة الاسم ورقم الهاتف والعنوان");
    return;
  }

  let message = `مرحباً، لدي طلب جديد من متجر الساعات.%0A%0A`;
  message += `الاسم: ${name}%0A`;
  message += `رقم الهاتف: ${phone}%0A`;
  message += `العنوان: ${address}%0A`;
  message += `طريقة الدفع: ${payment}%0A%0A`;
  message += `المنتجات:%0A`;

  cart.forEach(item => {
    message += `- ${item.name} × ${item.qty} = ${formatPrice(item.price * item.qty)}%0A`;
  });

  const totals = getTotals(cart);
  message += `%0Aالإجمالي: ${formatPrice(totals.total)}%0A`;

  if (payment === "تحويل عبر الكريمي") {
    message += `رقم التحويل عبر الكريمي: 773771761%0A`;
  }

  if (notes) {
    message += `ملاحظات: ${notes}%0A`;
  }

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}