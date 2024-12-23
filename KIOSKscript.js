document.addEventListener('DOMContentLoaded', function () {
    const adminPassword = 'dit';  // 관리자 비밀번호
    let totalSales = 0;
    let cartItems = [];

    // 관리자 관련 요소
    const adminAccess = document.querySelector('.admin-access');
    const managementDiv = document.querySelector('.management');
    const adminLoginButton = document.getElementById('admin-login');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminLogoutButton = document.getElementById('admin-logout'); // 로그아웃 버튼
    const loginError = document.getElementById('login-error');

    // 메뉴, 장바구니, 결제 관련 요소
    const menuItems = document.querySelectorAll('.menu-item');
    const cart = document.querySelector('.cart');
    const checkoutButton = document.querySelector('.checkout');
    const receiptDiv = document.querySelector('.receipt');
    const receiptList = document.getElementById('receipt-list');
    const totalPriceSpan = document.getElementById('total-price');
    const salesList = document.getElementById('sales-list');
    const totalSalesSpan = document.getElementById('total-sales');
    const menuNameInput = document.getElementById('menu-name');
    const menuPriceInput = document.getElementById('menu-price');
    const addMenuButton = document.getElementById('add-menu');
    const deleteMenuButton = document.getElementById('delete-menu');
    const clearSalesLogButton = document.getElementById('clear-sales-log');

    // 드래그된 메뉴를 장바구니에 추가하는 함수
    menuItems.forEach(item => {
        item.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('menu', JSON.stringify({
                name: item.dataset.name,
                price: item.dataset.price
            }));
        });
    });

    // 장바구니로 메뉴 드롭
    cart.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    cart.addEventListener('drop', function (event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('menu');
        const menu = JSON.parse(data);

        // 이미 장바구니에 있는 메뉴인지 확인
        if (cartItems.find(item => item.name === menu.name)) {
            alert('이미 장바구니에 있는 메뉴입니다.');
            return;
        }

        // 장바구니에 메뉴 추가
        cartItems.push({...menu, quantity: 1});
        updateCart();
    });

    // 메뉴에서 장바구니로 항목을 다시 끌어 놓을 수 있도록 설정
    cart.addEventListener('dragstart', function (event) {
        // 장바구니 항목에 대한 dragstart 처리
        const cartItem = event.target;
        if (cartItem.classList.contains('cart-item')) {
            event.dataTransfer.setData('cartItem', JSON.stringify(cartItem.dataset));
        }
    });

    // 장바구니에서 메뉴를 다시 메뉴 영역으로 드롭하여 선택 취소
    const menuArea = document.querySelector('.menu');
    menuArea.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    menuArea.addEventListener('drop', function (event) {
        event.preventDefault();

        const data = event.dataTransfer.getData('cartItem');
        if (data) {
            const cartItemData = JSON.parse(data);
            // 장바구니에서 항목 삭제
            cartItems = cartItems.filter(item => item.name !== cartItemData.name);
            updateCart();
        }
    });

    // 장바구니 업데이트 함수
    function updateCart() {
        cart.innerHTML = '<h2>장바구니</h2>';
        let totalAmount = 0;

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.draggable = true;
            cartItem.dataset.name = item.name;
            cartItem.innerHTML = `
                ${item.name} - ${item.price}원 x ${item.quantity} = ${item.price * item.quantity}원
                <button data-name="${item.name}" data-action="increase">+</button>
                <button data-name="${item.name}" data-action="decrease">-</button>
                <button data-name="${item.name}" data-action="remove">삭제</button>
            `;
            cart.appendChild(cartItem);

            totalAmount += item.price * item.quantity;
        });

        totalPriceSpan.textContent = totalAmount;
        checkoutButton.disabled = cartItems.length === 0;
    }

    // 수량 증감 버튼 처리
    cart.addEventListener('click', function (event) {
        const action = event.target.dataset.action;
        const name = event.target.dataset.name;

        if (action && name) {
            const item = cartItems.find(item => item.name === name);

            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity--;
            } else if (action === 'remove') {
                cartItems = cartItems.filter(item => item.name !== name);
            }

            updateCart();
        }
    });

    // 결제 버튼 클릭 시 영수증 표시
    checkoutButton.addEventListener('click', function () {
        if (cartItems.length === 0) {
            alert("장바구니가 비어있습니다. 주문을 진행할 수 없습니다.");
            return;
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // 영수증 표시
        receiptList.innerHTML = '';
        cartItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - ${item.price}원 x ${item.quantity} = ${item.price * item.quantity}원`;
            receiptList.appendChild(li);
        });
        
        const totalPriceElement = document.createElement('li');
        totalPriceElement.textContent = `총 합계: ${totalAmount}원`;
        receiptList.appendChild(totalPriceElement);

        receiptDiv.classList.remove('hidden');
        
        // 판매 내역 기록
        saveSalesLog(cartItems, totalAmount);
        
        // 장바구니 초기화
        cartItems = [];
        updateCart();
    });

    // 관리자 로그인
    adminLoginButton.addEventListener('click', function () {
        if (adminPasswordInput.value === adminPassword) {
            adminAccess.classList.add('hidden');
            managementDiv.classList.remove('hidden');
            loginError.classList.add('hidden');
            // 관리자 로그인 상태를 LocalStorage에 저장
            localStorage.setItem('adminLoggedIn', true);
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    });

    // 관리자 로그아웃
    adminLogoutButton.addEventListener('click', function () {
        localStorage.removeItem('adminLoggedIn');
        adminAccess.classList.remove('hidden');
        managementDiv.classList.add('hidden');
    });

    // 메뉴 추가
    addMenuButton.addEventListener('click', function () {
        const menuName = menuNameInput.value.trim();
        const menuPrice = menuPriceInput.value.trim();

        if (menuName && menuPrice) {
            const newMenuItem = document.createElement('div');
            newMenuItem.className = 'menu-item';
            newMenuItem.draggable = true;
            newMenuItem.dataset.name = menuName;
            newMenuItem.dataset.price = menuPrice;
            newMenuItem.innerHTML = `
                ${menuName} - ${menuPrice}원
            `;
            document.querySelector('.menu').appendChild(newMenuItem);
            menuNameInput.value = '';
            menuPriceInput.value = '';

            saveMenu(menuName, menuPrice); // 메뉴 저장
        }
    });

    // 메뉴 삭제
    deleteMenuButton.addEventListener('click', function () {
        const menuName = menuNameInput.value.trim();
        if (menuName) {
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                if (item.dataset.name === menuName) {
                    item.remove();
                }
            });
            removeMenu(menuName); // 메뉴 삭제
        }
    });

    // 판매 내역 초기화
    clearSalesLogButton.addEventListener('click', function () {
        salesList.innerHTML = '';
        totalSales = 0;
        totalSalesSpan.textContent = totalSales;

        localStorage.removeItem('salesLog'); // 판매 내역 초기화
    });

    // 판매 내역 저장
    function saveSalesLog(items, totalAmount) {
        const salesLog = JSON.parse(localStorage.getItem('salesLog')) || [];
        salesLog.push({ items, totalAmount });
        localStorage.setItem('salesLog', JSON.stringify(salesLog));
    }

    // 메뉴 저장
    function saveMenu(name, price) {
        const menuList = JSON.parse(localStorage.getItem('menuList')) || [];
        menuList.push({ name, price });
        localStorage.setItem('menuList', JSON.stringify(menuList));
    }

    // 메뉴 삭제
    function removeMenu(name) {
        const menuList = JSON.parse(localStorage.getItem('menuList')) || [];
        const updatedMenuList = menuList.filter(menu => menu.name !== name);
        localStorage.setItem('menuList', JSON.stringify(updatedMenuList));
    }

    // 페이지 로딩 시 LocalStorage에서 데이터 불러오기
    function loadData() {
        const isAdminLoggedIn = JSON.parse(localStorage.getItem('adminLoggedIn'));
        if (isAdminLoggedIn) {
            adminAccess.classList.add('hidden');
            managementDiv.classList.remove('hidden');
        }

        // 메뉴 항목 불러오기
        const menuList = JSON.parse(localStorage.getItem('menuList')) || [];
        menuList.forEach(menu => {
            const newMenuItem = document.createElement('div');
            newMenuItem.className = 'menu-item';
            newMenuItem.draggable = true;
            newMenuItem.dataset.name = menu.name;
            newMenuItem.dataset.price = menu.price;
            newMenuItem.innerHTML = `${menu.name} - ${menu.price}원`;
            document.querySelector('.menu').appendChild(newMenuItem);
        });

        // 판매 내역 불러오기
        const salesLog = JSON.parse(localStorage.getItem('salesLog')) || [];
        salesLog.forEach(sale => {
            const listItem = document.createElement('li');
            listItem.textContent = `${sale.items.map(item => item.name).join(', ')} - 총합: ${sale.totalAmount}원`;
            salesList.appendChild(listItem);
        });

        // 총 판매 금액 업데이트
        totalSales = salesLog.reduce((acc, sale) => acc + sale.totalAmount, 0);
        totalSalesSpan.textContent = totalSales;
    }

    // 데이터 로드
    loadData();
});
