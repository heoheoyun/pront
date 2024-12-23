const menu = document.querySelector('.menu');
const cart = document.querySelector('.cart');
const checkoutButton = document.querySelector('.checkout');
const emptyMessage = cart.querySelector('.empty-message');
const adminPasswordInput = document.querySelector('#admin-password');
const adminLoginButton = document.querySelector('#admin-login');
const managementSection = document.querySelector('.management');
const adminLogoutButton = document.querySelector('#admin-logout');  // 로그아웃 버튼 추가

let salesData = [];
let totalSalesAmount = 0;

const ADMIN_PASSWORD = "admin1234";  // 관리자 비밀번호 

// 관리자 로그인
adminLoginButton.addEventListener('click', () => {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        managementSection.classList.remove('hidden');
        adminPasswordInput.value = '';
        alert('관리자 모드에 진입했습니다.');
    } else {
        alert('비밀번호가 틀렸습니다.');
    }
});

// 관리자 로그아웃
adminLogoutButton.addEventListener('click', () => {
    managementSection.classList.add('hidden');  // 관리자 기능 영역 숨기기
    alert('관리자 모드에서 로그아웃되었습니다.');  // 알림 메시지
});

// 드래그 앤 드롭 처리
menu.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('menu-item')) {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            name: e.target.dataset.name,
            price: e.target.dataset.price
        }));
    }
});

cart.addEventListener('dragover', (e) => e.preventDefault());

cart.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    emptyMessage.style.display = 'none';
    const cartItem = createCartItem(data.name, parseInt(data.price));
    cart.appendChild(cartItem);
    updateCheckoutButton();
});

function createCartItem(name, price) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
        <span>${name} - <span class="item-price">${price}</span>원</span>
        <div class="quantity-controls">
            <button class="decrease">-</button>
            <span class="quantity">1</span>
            <button class="increase">+</button>
        </div>
        <span class="subtotal">${price}원</span>
    `;
    addCartItemEvents(cartItem);
    return cartItem;
}

function addCartItemEvents(cartItem) {
    const decreaseBtn = cartItem.querySelector('.decrease');
    const increaseBtn = cartItem.querySelector('.increase');
    const quantityElem = cartItem.querySelector('.quantity');
    const subtotalElem = cartItem.querySelector('.subtotal');
    const price = parseInt(cartItem.querySelector('.item-price').textContent);

    increaseBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityElem.textContent) + 1;
        quantityElem.textContent = quantity;
        subtotalElem.textContent = `${price * quantity}원`;
    });

    decreaseBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityElem.textContent) - 1;
        if (quantity > 0) {
            quantityElem.textContent = quantity;
            subtotalElem.textContent = `${price * quantity}원`;
        }
    });
}

function updateCheckoutButton() {
    const itemsInCart = cart.querySelectorAll('.cart-item');
    checkoutButton.disabled = itemsInCart.length === 0;
}
