window.onload = function () {
    const adminPassword = 'dit';
    let totalSales = 0;
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    const adminAccess = document.querySelector('.admin-access');
    const managementDiv = document.querySelector('.management');
    const adminLoginButton = document.getElementById('admin-login');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminLogoutButton = document.getElementById('admin-logout');
    const menuItemsContainer = document.querySelector('.menu');
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

    function handleAdminLogin() {
        if (adminPasswordInput.value === adminPassword) {
            adminAccess.classList.add('hidden');
            managementDiv.classList.remove('hidden');
            localStorage.setItem('adminLoggedIn', 'true');
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    }

    function handleAdminLogout() {
        localStorage.removeItem('adminLoggedIn');
        adminAccess.classList.remove('hidden');
        managementDiv.classList.add('hidden');
    }

    function updateCart() {
        cart.innerHTML = '<h2>장바구니</h2>';
        let totalAmount = 0;

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.name = item.name;
            cartItem.innerHTML = `
                ${item.name} - ${item.price}원 x ${item.quantity} = ${item.price * item.quantity}원
                <button data-name="${item.name}" data-action="increase">+</button>
                <button data-name="${item.name}" data-action="decrease">-</button>
                <button data-name="${item.name}" data-action="remove">삭제</button>`;
            cart.appendChild(cartItem);

            totalAmount += item.price * item.quantity;
        });

        totalPriceSpan.textContent = totalAmount;
        checkoutButton.disabled = cartItems.length === 0;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    function handleCheckout() {
        if (cartItems.length === 0) {
            alert("장바구니가 비어있습니다.");
            return;
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
        saveSalesLog(cartItems, totalAmount);

        cartItems = [];
        updateCart();
    }

    function saveSalesLog(items, totalAmount) {
        const salesLog = JSON.parse(localStorage.getItem('salesLog')) || [];
        salesLog.push({ items, totalAmount });
        localStorage.setItem('salesLog', JSON.stringify(salesLog));
    }

    function handleAddMenu() {
        const menuName = menuNameInput.value.trim();
        const menuPrice = parseFloat(menuPriceInput.value.trim());

        const existingMenu = JSON.parse(localStorage.getItem('menuList')) || [];
        if (existingMenu.some(item => item.name === menuName)) {
            alert('이미 존재하는 메뉴입니다.');
            return;
        }

        if (menuName && !isNaN(menuPrice)) {
            const newMenuItem = document.createElement('div');
            newMenuItem.className = 'menu-item';
            newMenuItem.draggable = true;
            newMenuItem.dataset.name = menuName;
            newMenuItem.dataset.price = menuPrice;
            newMenuItem.innerHTML = `${menuName} - ${menuPrice}원`;
            menuItemsContainer.appendChild(newMenuItem);

            saveMenu(menuName, menuPrice);
            menuNameInput.value = '';
            menuPriceInput.value = '';
        } else {
            alert('메뉴 이름과 가격을 올바르게 입력해주세요.');
        }
    }

    function saveMenu(name, price) {
        const menuList = JSON.parse(localStorage.getItem('menuList')) || [];
        menuList.push({ name, price });
        localStorage.setItem('menuList', JSON.stringify(menuList));
    }

    function loadMenu() {
        const menuList = JSON.parse(localStorage.getItem('menuList')) || [];
        menuList.forEach(menu => {
            const newMenuItem = document.createElement('div');
            newMenuItem.className = 'menu-item';
            newMenuItem.draggable = true;
            newMenuItem.dataset.name = menu.name;
            newMenuItem.dataset.price = menu.price;
            newMenuItem.innerHTML = `${menu.name} - ${menu.price}원`;
            menuItemsContainer.appendChild(newMenuItem);
        });
    }

    function loadData() {
        loadMenu();
        const salesLog = JSON.parse(localStorage.getItem('salesLog')) || [];
        salesLog.forEach(sale => {
            const saleItem = document.createElement('li');
            saleItem.textContent = `${sale.items.map(item => `${item.name} x${item.quantity}`).join(', ')} - ${sale.totalAmount}원`;
            salesList.appendChild(saleItem);
            totalSales += sale.totalAmount;
        });

        totalSalesSpan.textContent = totalSales;
    }

    menuItemsContainer.addEventListener('dragstart', function(event) {
        if (event.target.classList.contains('menu-item')) {
            event.dataTransfer.setData('menu', JSON.stringify({
                name: event.target.dataset.name,
                price: event.target.dataset.price
            }));
        }
    });

    cart.addEventListener('dragover', event => event.preventDefault());
    cart.addEventListener('drop', function(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('menu');
        const menu = JSON.parse(data);

        if (cartItems.some(item => item.name === menu.name)) {
            alert('이미 장바구니에 있는 메뉴입니다.');
            return;
        }

        cartItems.push({ ...menu, quantity: 1 });
        updateCart();
    });

    cart.addEventListener('click', function(event) {
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

    checkoutButton.addEventListener('click', handleCheckout);
    adminLoginButton.addEventListener('click', handleAdminLogin);
    adminLogoutButton.addEventListener('click', handleAdminLogout);
    addMenuButton.addEventListener('click', handleAddMenu);
    clearSalesLogButton.addEventListener('click', () => {
        salesList.innerHTML = '';
        totalSales = 0;
        totalSalesSpan.textContent = totalSales;
        localStorage.removeItem('salesLog');
    });

    loadData();
};
