$(document).ready(function() {
    const ADMIN_PASSWORD = "admin1234"; // 관리자 비밀번호
    let salesData = [];
    let totalSalesAmount = 0;

    // 메뉴 항목을 드래그할 때
    $('.menu .menu-item').on('dragstart', function(e) {
        const data = {
            name: $(this).data('name'),
            price: $(this).data('price'),
            isMenu: true  // 메뉴에서 드래그한 항목임을 표시
        };
        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(data));
    });

    // 장바구니 영역에 항목을 드롭할 때
    $('.cart').on('dragover', function(e) {
        e.preventDefault();
    });

    $('.cart').on('drop', function(e) {
        e.preventDefault();
        const data = JSON.parse(e.originalEvent.dataTransfer.getData('text/plain'));
        if (data.isMenu) {
            const existingCartItem = $('.cart .cart-item[data-name="' + data.name + '"]');
            if (existingCartItem.length > 0) {
                // 이미 장바구니에 존재하면 수량 증가
                const quantityElem = existingCartItem.find('.quantity');
                const subtotalElem = existingCartItem.find('.subtotal');
                const price = parseInt(existingCartItem.find('.item-price').text());
                const newQuantity = parseInt(quantityElem.text()) + 1;
                quantityElem.text(newQuantity);
                subtotalElem.text(`${price * newQuantity}원`);
            } else {
                // 존재하지 않으면 새로운 항목 추가
                const cartItem = createCartItem(data.name, parseInt(data.price));
                $('.cart').append(cartItem);
            }
            updateCheckoutButton();
        } else {
            // 장바구니에서 메뉴로 항목을 다시 이동
            const cartItem = $(e.target).closest('.cart-item');
            if (cartItem.length) {
                cartItem.remove();
                updateCheckoutButton();
            }
        }
    });

    // 메뉴 영역에 항목을 드롭할 때
    $('.menu').on('dragover', function(e) {
        e.preventDefault();
    });

    $('.menu').on('drop', function(e) {
        e.preventDefault();
        const data = JSON.parse(e.originalEvent.dataTransfer.getData('text/plain'));
        if (!data.isMenu) {
            const cartItem = $(e.target).closest('.cart-item');
            if (cartItem.length) {
                cartItem.remove();
                updateCheckoutButton();
            }
        }
    });

    // 장바구니 항목 생성
    function createCartItem(name, price) {
        const cartItem = $('<div class="cart-item" draggable="true"></div>');
        cartItem.data('name', name);
        cartItem.html(`
            <span>${name} - <span class="item-price">${price}</span>원</span>
            <div class="quantity-controls">
                <button class="decrease">-</button>
                <span class="quantity">1</span>
                <button class="increase">+</button>
            </div>
            <span class="subtotal">${price}원</span>
            <button class="remove">취소</button>
        `);
        addCartItemEvents(cartItem);
        return cartItem;
    }

    // 수량 조정 및 장바구니 항목 이벤트
    function addCartItemEvents(cartItem) {
        cartItem.find('.increase').on('click', function() {
            const quantityElem = cartItem.find('.quantity');
            const subtotalElem = cartItem.find('.subtotal');
            const price = parseInt(cartItem.find('.item-price').text());
            const newQuantity = parseInt(quantityElem.text()) + 1;
            quantityElem.text(newQuantity);
            subtotalElem.text(`${price * newQuantity}원`);
        });

        cartItem.find('.decrease').on('click', function() {
            const quantityElem = cartItem.find('.quantity');
            const subtotalElem = cartItem.find('.subtotal');
            const price = parseInt(cartItem.find('.item-price').text());
            const newQuantity = Math.max(1, parseInt(quantityElem.text()) - 1);
            quantityElem.text(newQuantity);
            subtotalElem.text(`${price * newQuantity}원`);
        });

        cartItem.find('.remove').on('click', function() {
            cartItem.remove();
            updateCheckoutButton();
        });

        // 장바구니에서 항목을 드래그할 수 있게 설정
        cartItem.on('dragstart', function(e) {
            const data = {
                name: cartItem.data('name'),
                price: cartItem.find('.item-price').text(),
                isMenu: false  // 장바구니에서 드래그한 항목임을 표시
            };
            e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(data));
        });
    }

    // 결제 버튼 상태 업데이트
    function updateCheckoutButton() {
        const itemsInCart = $('.cart .cart-item');
        $('.checkout').prop('disabled', itemsInCart.length === 0);
    }

    // 관리자 로그인 처리
    $('#admin-login').on('click', function() {
        if ($('#admin-password').val() === ADMIN_PASSWORD) {
            $('.management').removeClass('hidden');
            $('#admin-password').val('');
            alert('관리자 모드에 진입했습니다.');
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    });

    // 관리자 로그아웃 처리
    $('#admin-logout').on('click', function() {
        $('.management').addClass('hidden');
        alert('관리자 모드에서 로그아웃되었습니다.');
    });
});
