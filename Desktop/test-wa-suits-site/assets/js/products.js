// Products Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const filterTabs = document.querySelectorAll('.filter-tab');
    const productCards = document.querySelectorAll('.product-card');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const productDetailBtns = document.querySelectorAll('.product-detail-btn');
    const loadMoreBtn = document.querySelector('.load-more-btn');

    // カテゴリフィルター機能
    let currentCategory = 'all';

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // アクティブタブの切り替え
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 商品のフィルタリング
            filterProducts(category);
            currentCategory = category;
        });
    });

    function filterProducts(category) {
        productCards.forEach((card, index) => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;
            
            if (shouldShow) {
                card.classList.remove('hidden');
                // フェードインアニメーション
                setTimeout(() => {
                    card.classList.add('fade-in-filter');
                }, index * 100);
            } else {
                card.classList.add('hidden');
                card.classList.remove('fade-in-filter');
            }
        });

        // 結果表示の更新
        updateResultsCount(category);
    }

    function updateResultsCount(category) {
        const visibleCards = Array.from(productCards).filter(card => 
            !card.classList.contains('hidden')
        );
        
        // 結果カウントの表示（必要に応じて追加）
        console.log(`${category} カテゴリ: ${visibleCards.length}件の商品`);
    }

    // カートに追加機能
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 親要素へのイベント伝播を停止
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            // アニメーション
            this.classList.add('adding');
            this.textContent = '追加中...';
            
            // カートに追加の処理（モック）
            setTimeout(() => {
                this.classList.remove('adding');
                this.textContent = '追加完了!';
                this.style.backgroundColor = 'var(--accent-gold)';
                
                // カート追加効果
                showCartAddedEffect(productCard);
                
                // 2秒後に元に戻す
                setTimeout(() => {
                    this.textContent = 'カートに追加';
                    this.style.backgroundColor = '';
                }, 2000);
                
            }, 1000);
            
            // カート追加の記録
            addToCart({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        });
    });

    function showCartAddedEffect(productCard) {
        // フライングアニメーション効果
        const rect = productCard.getBoundingClientRect();
        const flyingElement = document.createElement('div');
        
        flyingElement.style.cssText = `
            position: fixed;
            top: ${rect.top + rect.height / 2}px;
            left: ${rect.left + rect.width / 2}px;
            width: 20px;
            height: 20px;
            background-color: var(--accent-gold);
            border-radius: 50%;
            z-index: 1000;
            pointer-events: none;
            transition: all 1s ease-out;
        `;
        
        document.body.appendChild(flyingElement);
        
        // カートボタンの位置へ移動
        const cartBtn = document.querySelector('.cart-btn');
        const cartRect = cartBtn.getBoundingClientRect();
        
        setTimeout(() => {
            flyingElement.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingElement.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingElement.style.transform = 'scale(0)';
            flyingElement.style.opacity = '0';
        }, 100);
        
        setTimeout(() => {
            document.body.removeChild(flyingElement);
        }, 1100);
    }

    function addToCart(product) {
        // LocalStorageからカートデータを取得
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // 既存の商品をチェック
        const existingProduct = cart.find(item => item.name === product.name);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }
        
        // LocalStorageに保存
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // カートカウントの更新
        updateCartCount();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // カートボタンにカウントを表示
        const cartBtn = document.querySelector('.cart-btn');
        const existingCount = cartBtn.querySelector('.cart-count');
        
        if (existingCount) {
            existingCount.textContent = totalItems;
        } else {
            const countElement = document.createElement('span');
            countElement.className = 'cart-count';
            countElement.textContent = totalItems;
            countElement.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: var(--accent-gold);
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            cartBtn.style.position = 'relative';
            cartBtn.appendChild(countElement);
        }
    }

    // 商品詳細表示機能
    productDetailBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const productDescription = productCard.querySelector('.product-description').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            showProductDetail({
                name: productName,
                description: productDescription,
                price: productPrice
            });
        });
    });

    function showProductDetail(product) {
        // 詳細モーダルの作成
        const modal = document.createElement('div');
        modal.className = 'product-detail-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="product-detail-image">
                        <div class="product-detail-placeholder"></div>
                    </div>
                    <div class="product-detail-info">
                        <h2 class="product-detail-name">${product.name}</h2>
                        <p class="product-detail-description">${product.description}</p>
                        <div class="product-detail-price">${product.price}</div>
                        <div class="product-detail-actions">
                            <button class="quantity-btn minus">-</button>
                            <span class="quantity">1</span>
                            <button class="quantity-btn plus">+</button>
                            <button class="add-to-cart-modal-btn">カートに追加</button>
                        </div>
                        <div class="product-detail-specs">
                            <h4>商品情報</h4>
                            <ul>
                                <li>原材料：小豆、砂糖、小麦粉等</li>
                                <li>賞味期限：製造日より3日</li>
                                <li>保存方法：直射日光を避け常温保存</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // モーダルスタイルの追加
        const style = document.createElement('style');
        style.textContent = `
            .product-detail-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .product-detail-modal.show {
                opacity: 1;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .product-detail-modal.show .modal-content {
                transform: scale(1);
            }
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                z-index: 10001;
                color: var(--neutral-gray);
            }
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                padding: 2rem;
            }
            .product-detail-image {
                height: 300px;
            }
            .product-detail-placeholder {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, var(--neutral-beige) 0%, var(--neutral-cream) 100%);
                border-radius: 8px;
            }
            .product-detail-name {
                font-family: var(--font-serif);
                font-size: 1.8rem;
                color: var(--primary-green);
                margin-bottom: 1rem;
            }
            .product-detail-description {
                color: var(--neutral-gray);
                line-height: 1.6;
                margin-bottom: 1rem;
            }
            .product-detail-price {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-green);
                margin-bottom: 1.5rem;
            }
            .product-detail-actions {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .quantity-btn {
                width: 30px;
                height: 30px;
                border: 1px solid var(--neutral-gray);
                background: white;
                cursor: pointer;
                border-radius: 4px;
            }
            .quantity {
                padding: 0 1rem;
                font-weight: bold;
            }
            .add-to-cart-modal-btn {
                background: var(--primary-green);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            }
            .product-detail-specs h4 {
                color: var(--primary-green);
                margin-bottom: 0.5rem;
            }
            .product-detail-specs ul {
                list-style: none;
                padding: 0;
            }
            .product-detail-specs li {
                color: var(--neutral-gray);
                margin-bottom: 0.25rem;
                padding-left: 1rem;
                position: relative;
            }
            .product-detail-specs li::before {
                content: '•';
                color: var(--primary-green);
                position: absolute;
                left: 0;
            }
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1rem;
                }
                .product-detail-image {
                    height: 200px;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // アニメーション表示
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 数量調整機能
        const minusBtn = modal.querySelector('.minus');
        const plusBtn = modal.querySelector('.plus');
        const quantitySpan = modal.querySelector('.quantity');
        let quantity = 1;

        minusBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantitySpan.textContent = quantity;
            }
        });

        plusBtn.addEventListener('click', () => {
            quantity++;
            quantitySpan.textContent = quantity;
        });

        // カートに追加
        const addToCartModalBtn = modal.querySelector('.add-to-cart-modal-btn');
        addToCartModalBtn.addEventListener('click', () => {
            for (let i = 0; i < quantity; i++) {
                addToCart({
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
            closeModal();
        });

        // 閉じる機能
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        function closeModal() {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        }

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // ESCキーで閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    // さらに読み込み機能
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.textContent = '読み込み中...';
            this.disabled = true;
            
            // 模擬的な追加商品読み込み
            setTimeout(() => {
                loadMoreProducts();
                this.textContent = 'さらに表示';
                this.disabled = false;
            }, 1500);
        });
    }

    function loadMoreProducts() {
        // 追加商品のモックデータ
        const additionalProducts = [
            {
                name: '季節の上生菓子',
                description: '職人が丁寧に作る美しい上生菓子',
                price: '¥450',
                category: 'seasonal',
                imageClass: 'namagashi'
            },
            {
                name: '抹茶ロール',
                description: '濃厚な抹茶クリームを巻いた洋風和菓子',
                price: '¥520',
                category: 'seasonal',
                imageClass: 'matcha-roll'
            }
        ];

        const productsGrid = document.querySelector('.products-grid');
        
        additionalProducts.forEach((product, index) => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
            
            // フェードインアニメーション
            setTimeout(() => {
                productCard.classList.add('fade-in-filter');
            }, index * 200);
        });

        // 新しいボタンにイベントリスナーを追加
        attachEventListeners();
    }

    function createProductCard(product) {
        const card = document.createElement('article');
        card.className = 'product-card fade-in';
        card.dataset.category = product.category;
        
        card.innerHTML = `
            <div class="product-image">
                <div class="product-image-placeholder ${product.imageClass}"></div>
                <div class="product-label ${product.category}">
                    ${product.category === 'seasonal' ? '季節限定' : 
                      product.category === 'traditional' ? '伝統' : 'ギフト'}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price}</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn">カートに追加</button>
                    <button class="product-detail-btn">詳細を見る</button>
                </div>
            </div>
        `;
        
        return card;
    }

    function attachEventListeners() {
        // 新しく追加された要素にイベントリスナーを再アタッチ
        const newAddToCartBtns = document.querySelectorAll('.add-to-cart-btn:not([data-listener])');
        const newDetailBtns = document.querySelectorAll('.product-detail-btn:not([data-listener])');
        
        newAddToCartBtns.forEach(btn => {
            btn.dataset.listener = 'true';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                // カートに追加の処理（既存の関数を再利用）
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('.product-name').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                
                addToCart({
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
                
                showCartAddedEffect(productCard);
            });
        });

        newDetailBtns.forEach(btn => {
            btn.dataset.listener = 'true';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                // 詳細表示の処理（既存の関数を再利用）
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('.product-name').textContent;
                const productDescription = productCard.querySelector('.product-description').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                
                showProductDetail({
                    name: productName,
                    description: productDescription,
                    price: productPrice
                });
            });
        });
    }

    // 商品カードクリックで詳細表示
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const detailBtn = this.querySelector('.product-detail-btn');
            detailBtn.click();
        });
    });

    // 初期化時のカートカウント表示
    updateCartCount();

    // URLパラメータからカテゴリフィルターを設定
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        const targetTab = document.querySelector(`[data-category="${categoryParam}"]`);
        if (targetTab) {
            targetTab.click();
        }
    }

    // パフォーマンス最適化: デバウンス機能
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ウィンドウリサイズ時の最適化
    const handleResize = debounce(() => {
        // リサイズ時の処理（必要に応じて）
        console.log('Window resized');
    }, 250);

    window.addEventListener('resize', handleResize);
});