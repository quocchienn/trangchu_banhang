let currentProduct = '';
let currentPrice = '';
let orderStep = 1; // 1: nhập thông tin, 2: xác nhận chuyển khoản
let currentPromoProduct = '';

function openModal(productName, price) {
    currentProduct = productName;
    currentPrice = price;
    document.getElementById('modalProduct').innerHTML = `
        <h3>${productName}</h3>
        <p><strong>Giá: ${price}</strong></p>
    `;
    document.getElementById('orderModal').style.display = 'block';
    document.getElementById('order-info-fields').style.display = 'block';
    document.getElementById('bank-transfer-qr').style.display = 'none';
    document.getElementById('waiting-confirm').style.display = 'none';
    document.getElementById('order-submit-btn').innerText = 'Đặt hàng ngay';
    orderStep = 1;
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('bank-transfer-qr').style.display = 'none';
}

function openPromoModal(productName) {
    currentPromoProduct = productName;
    document.getElementById('promoModal').style.display = 'block';
}

function closePromoModal() {
    document.getElementById('promoModal').style.display = 'none';
    document.getElementById('promoCode').value = '';
}

async function submitPromo(event) {
    event.preventDefault();
    const promoCode = document.getElementById('promoCode').value;

    if (!promoCode) {
        alert('Vui lòng nhập mã khuyến mãi!');
        return;
    }

    try {
        const response = await fetch('https://server-banhang12.onrender.com/api/promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promoCode, product: currentPromoProduct })
        });
        const result = await response.json();
        if (result.success) {
            alert(`Mã khuyến mãi hợp lệ! ${result.message}`);
            closePromoModal();
        } else {
            alert(result.message || 'Mã khuyến mãi không hợp lệ!');
        }
    } catch (err) {
        alert('Không thể xác thực mã khuyến mãi. Vui lòng thử lại sau!');
    }
}

async function submitOrder(event) {
    event.preventDefault();

    if (orderStep === 1) {
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerEmail = document.getElementById('customerEmail').value;

        if (!customerName || !customerPhone || !customerEmail) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        document.getElementById('order-info-fields').style.display = 'none';
        showBankQR(customerName);
        document.getElementById('order-submit-btn').innerText = 'Xác nhận đã chuyển khoản';
        orderStep = 2;
        alert('Vui lòng chuyển khoản theo thông tin bên dưới và upload ảnh chuyển khoản để hoàn tất đơn hàng!');
    } else if (orderStep === 2) {
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            alert('Vui lòng upload ảnh chuyển khoản!');
            return;
        }

        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerEmail = document.getElementById('customerEmail').value;

        const formData = new FormData();
        formData.append('customerName', customerName);
        formData.append('customerPhone', customerPhone);
        formData.append('customerEmail', customerEmail);
        formData.append('product', currentProduct);
        formData.append('paymentProof', paymentProof);

        try {
            const response = await fetch('https://server-banhang12.onrender.com/api/order', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                document.getElementById('bank-transfer-qr').style.display = 'none';
                document.getElementById('waiting-confirm').style.display = 'block';
                document.getElementById('order-submit-btn').style.display = 'none';
                orderStep = 3;
            } else {
                alert(result.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (err) {
            alert('Không thể gửi đơn hàng. Vui lòng thử lại sau!');
        }
    }
}

function showBankQR(name) {
    const content = `MUA ${currentProduct} - ${name}`;
    document.getElementById('bank-transfer-content').innerText = content;
    const bank = 'MB';
    const account = '123456789';
    const template = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=&addInfo=${encodeURIComponent(content)}&accountName=NGUYEN%20VAN%20A`;
    document.getElementById('bank-qr-img').src = template;
    document.getElementById('bank-transfer-qr').style.display = 'block';
}

// Smooth scrolling cho navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
    const orderModal = document.getElementById('orderModal');
    const promoModal = document.getElementById('promoModal');
    if (event.target === orderModal) {
        closeModal();
    } else if (event.target === promoModal) {
        closePromoModal();
    }
}

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
