// Gifts Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const giftCartBtns = document.querySelectorAll('.gift-cart-btn');
    const customizeBtns = document.querySelectorAll('.customize-btn');
    const customStartBtn = document.querySelector('.custom-start-btn');
    const sceneLinkBtns = document.querySelectorAll('.scene-link');
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guidePanels = document.querySelectorAll('.guide-panel');

    // ギフトガイドタブ機能
    guideTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetGuide = this.dataset.guide;
            
            // アクティブタブの切り替え
            guideTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // パネルの切り替え
            guidePanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${targetGuide}-guide`) {
                    panel.classList.add('active');
                    
                    // パネル内の要素をアニメーション
                    const items = panel.querySelectorAll('.fade-in');
                    items.forEach((item, index) => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.transition = 'all 0.5s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        });
    });

    // ギフトカートに追加機能
    giftCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const giftCard = this.closest('.gift-card');
            const giftName = giftCard.querySelector('.gift-name').textContent;
            const giftPrice = giftCard.querySelector('.gift-price').textContent;
            const giftContents = Array.from(giftCard.querySelectorAll('.gift-item'))
                .map(item => item.textContent);
            
            // ボタンアニメーション
            const originalText = this.textContent;
            this.textContent = '追加中...';
            this.disabled = true;
            this.style.background = 'var(--accent-gold)';
            
            // カートに追加の処理
            setTimeout(() => {
                addGiftToCart({
                    name: giftName,
                    price: giftPrice,
                    contents: giftContents,
                    type: 'gift'
                });
                
                this.textContent = '追加完了!';
                
                // フライング効果
                createFlyingGiftEffect(giftCard);
                
                // 元に戻す
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                    this.style.background = '';
                }, 2000);
                
            }, 1000);
        });
    });

    function addGiftToCart(gift) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingGift = cart.find(item => item.name === gift.name && item.type === 'gift');
        
        if (existingGift) {
            existingGift.quantity += 1;
        } else {
            cart.push({
                ...gift,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // カート追加通知
        showCartNotification(gift.name);
    }

    function createFlyingGiftEffect(giftCard) {
        const rect = giftCard.getBoundingClientRect();
        const flyingGift = document.createElement('div');
        
        flyingGift.innerHTML = '🎁';
        flyingGift.style.cssText = `
            position: fixed;
            top: ${rect.top + rect.height / 2}px;
            left: ${rect.left + rect.width / 2}px;
            font-size: 2rem;
            z-index: 10000;
            pointer-events: none;
            transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform-origin: center;
        `;
        
        document.body.appendChild(flyingGift);
        
        // カートボタンの位置へ移動
        const cartBtn = document.querySelector('.cart-btn');
        const cartRect = cartBtn.getBoundingClientRect();
        
        setTimeout(() => {
            flyingGift.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingGift.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingGift.style.transform = 'scale(0.2) rotate(720deg)';
            flyingGift.style.opacity = '0';
        }, 100);
        
        setTimeout(() => {
            document.body.removeChild(flyingGift);
        }, 1300);
    }

    function showCartNotification(giftName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `「${giftName}」をカートに追加しました`;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-green);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartBtn = document.querySelector('.cart-btn');
        let countElement = cartBtn.querySelector('.cart-count');
        
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.className = 'cart-count';
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
                animation: pulse 0.3s ease;
            `;
            cartBtn.style.position = 'relative';
            cartBtn.appendChild(countElement);
        }
        
        countElement.textContent = totalItems;
        
        // カウント更新アニメーション
        countElement.style.animation = 'none';
        setTimeout(() => {
            countElement.style.animation = 'pulse 0.3s ease';
        }, 10);
    }

    // カスタマイズ機能
    customizeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const giftCard = this.closest('.gift-card');
            const giftName = giftCard.querySelector('.gift-name').textContent;
            
            showCustomizeModal(giftName);
        });
    });

    function showCustomizeModal(giftName) {
        const modal = document.createElement('div');
        modal.className = 'customize-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-header">
                    <h2>ギフトカスタマイズ</h2>
                    <p>「${giftName}」をお好みに合わせてカスタマイズできます</p>
                </div>
                <div class="modal-body">
                    <div class="customize-section">
                        <h3>商品の組み合わせ</h3>
                        <div class="product-options">
                            <label class="product-option">
                                <input type="checkbox" value="栗饅頭" checked>
                                <span class="checkmark"></span>
                                栗饅頭 (¥320)
                            </label>
                            <label class="product-option">
                                <input type="checkbox" value="羊羹">
                                <span class="checkmark"></span>
                                羊羹 (¥850)
                            </label>
                            <label class="product-option">
                                <input type="checkbox" value="最中" checked>
                                <span class="checkmark"></span>
                                最中 (¥290)
                            </label>
                            <label class="product-option">
                                <input type="checkbox" value="豆大福">
                                <span class="checkmark"></span>
                                豆大福 (¥280)
                            </label>
                        </div>
                    </div>
                    
                    <div class="customize-section">
                        <h3>包装スタイル</h3>
                        <div class="wrapping-options">
                            <label class="wrapping-option">
                                <input type="radio" name="wrapping" value="和紙" checked>
                                <span class="radio-mark"></span>
                                和紙包装 (無料)
                            </label>
                            <label class="wrapping-option">
                                <input type="radio" name="wrapping" value="桐箱">
                                <span class="radio-mark"></span>
                                桐箱入り (+¥500)
                            </label>
                            <label class="wrapping-option">
                                <input type="radio" name="wrapping" value="風呂敷">
                                <span class="radio-mark"></span>
                                風呂敷包み (+¥300)
                            </label>
                        </div>
                    </div>
                    
                    <div class="customize-section">
                        <h3>メッセージカード</h3>
                        <textarea class="message-input" placeholder="お気持ちを込めたメッセージをご記入ください（50文字以内）" maxlength="50"></textarea>
                        <div class="char-count">0 / 50</div>
                    </div>
                    
                    <div class="customize-total">
                        <div class="total-price">合計: ¥<span id="total-amount">0</span></div>
                        <button class="add-custom-gift-btn">カスタマイズギフトを追加</button>
                    </div>
                </div>
            </div>
        `;

        // モーダルスタイル
        const style = document.createElement('style');
        style.textContent = `
            .customize-modal {
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
            .customize-modal.show {
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
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .customize-modal.show .modal-content {
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
                color: var(--neutral-gray);
            }
            .modal-header {
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid var(--neutral-beige);
            }
            .modal-header h2 {
                color: var(--primary-green);
                margin-bottom: 0.5rem;
            }
            .modal-body {
                padding: 1.5rem 2rem 2rem;
            }
            .customize-section {
                margin-bottom: 2rem;
            }
            .customize-section h3 {
                color: var(--primary-green);
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }
            .product-options, .wrapping-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.5rem;
            }
            .product-option, .wrapping-option {
                display: flex;
                align-items: center;
                padding: 0.75rem;
                border: 2px solid var(--neutral-beige);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .product-option:hover, .wrapping-option:hover {
                border-color: var(--primary-green);
                background-color: var(--neutral-cream);
            }
            .product-option input, .wrapping-option input {
                display: none;
            }
            .checkmark, .radio-mark {
                width: 18px;
                height: 18px;
                border: 2px solid var(--neutral-gray);
                margin-right: 0.75rem;
                position: relative;
                transition: all 0.3s ease;
            }
            .checkmark {
                border-radius: 3px;
            }
            .radio-mark {
                border-radius: 50%;
            }
            .product-option input:checked + .checkmark,
            .wrapping-option input:checked + .radio-mark {
                border-color: var(--primary-green);
                background-color: var(--primary-green);
            }
            .product-option input:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                top: -2px;
                left: 2px;
                color: white;
                font-size: 12px;
                font-weight: bold;
            }
            .wrapping-option input:checked + .radio-mark::after {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: white;
            }
            .message-input {
                width: 100%;
                padding: 1rem;
                border: 2px solid var(--neutral-beige);
                border-radius: 8px;
                resize: vertical;
                min-height: 80px;
                font-family: inherit;
                transition: border-color 0.3s ease;
            }
            .message-input:focus {
                outline: none;
                border-color: var(--primary-green);
            }
            .char-count {
                text-align: right;
                font-size: 0.9rem;
                color: var(--neutral-gray);
                margin-top: 0.5rem;
            }
            .customize-total {
                border-top: 2px solid var(--neutral-beige);
                padding-top: 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .total-price {
                font-size: 1.3rem;
                font-weight: bold;
                color: var(--primary-green);
            }
            .add-custom-gift-btn {
                background: var(--accent-gold);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .add-custom-gift-btn:hover {
                background: var(--accent-gold-light);
                transform: translateY(-2px);
            }
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                .modal-header, .modal-body {
                    padding: 1rem;
                }
                .customize-total {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // アニメーション表示
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 価格計算機能
        const productOptions = modal.querySelectorAll('.product-option input[type="checkbox"]');
        const wrappingOptions = modal.querySelectorAll('.wrapping-option input[type="radio"]');
        const totalAmountElement = modal.querySelector('#total-amount');
        const messageInput = modal.querySelector('.message-input');
        const charCount = modal.querySelector('.char-count');

        function calculateTotal() {
            let total = 0;
            
            // 商品価格の計算
            productOptions.forEach(option => {
                if (option.checked) {
                    const priceMatch = option.parentElement.textContent.match(/¥(\d+)/);
                    if (priceMatch) {
                        total += parseInt(priceMatch[1]);
                    }
                }
            });
            
            // 包装価格の計算
            const selectedWrapping = modal.querySelector('.wrapping-option input[type="radio"]:checked');
            if (selectedWrapping) {
                const wrappingText = selectedWrapping.parentElement.textContent;
                const priceMatch = wrappingText.match(/\+¥(\d+)/);
                if (priceMatch) {
                    total += parseInt(priceMatch[1]);
                }
            }
            
            totalAmountElement.textContent = total.toLocaleString();
        }

        // イベントリスナーの設定
        productOptions.forEach(option => {
            option.addEventListener('change', calculateTotal);
        });

        wrappingOptions.forEach(option => {
            option.addEventListener('change', calculateTotal);
        });

        messageInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count} / 50`;
            if (count > 40) {
                charCount.style.color = 'var(--accent-gold)';
            } else {
                charCount.style.color = 'var(--neutral-gray)';
            }
        });

        // 初期計算
        calculateTotal();

        // カスタマイズギフト追加
        const addCustomBtn = modal.querySelector('.add-custom-gift-btn');
        addCustomBtn.addEventListener('click', function() {
            const selectedProducts = Array.from(productOptions)
                .filter(option => option.checked)
                .map(option => option.value);
            
            const selectedWrapping = modal.querySelector('.wrapping-option input[type="radio"]:checked').value;
            const message = messageInput.value;
            const total = totalAmountElement.textContent;

            addGiftToCart({
                name: `カスタマイズ${giftName}`,
                price: `¥${total}`,
                contents: selectedProducts,
                wrapping: selectedWrapping,
                message: message,
                type: 'custom-gift'
            });

            closeModal();
            showCartNotification(`カスタマイズ${giftName}`);
        });

        // 閉じる機能
        function closeModal() {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        }

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    // カスタマイズ開始ボタン
    if (customStartBtn) {
        customStartBtn.addEventListener('click', function() {
            showCustomizeModal('オリジナルギフトセット');
        });
    }

    // シーンリンク機能
    sceneLinkBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // ターゲットセクションのハイライト
                targetElement.style.backgroundColor = 'var(--neutral-cream)';
                setTimeout(() => {
                    targetElement.style.transition = 'background-color 1s ease';
                    targetElement.style.backgroundColor = '';
                }, 2000);
            }
        });
    });

    // パララックス効果（ヒーロー背景）
    const giftHeroBg = document.querySelector('.gift-hero-bg');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const rate = scrollTop * -0.5;
        
        if (giftHeroBg) {
            giftHeroBg.style.transform = `translate3d(0, ${rate}px, 0)`;
        }
    }, { passive: true });

    // ギフトカードのホバー効果強化
    const giftCards = document.querySelectorAll('.gift-card');
    giftCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 初期化
    updateCartCount();

    // パフォーマンス最適化
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // フェードイン要素の監視
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        fadeInObserver.observe(element);
    });

    // ギフト推奨システム（簡易版）
    function recommendGifts() {
        const currentHour = new Date().getHours();
        const currentMonth = new Date().getMonth() + 1;
        
        let recommendedSection = '';
        
        if (currentMonth >= 3 && currentMonth <= 5) {
            recommendedSection = 'spring-gifts';
        } else if (currentMonth >= 6 && currentMonth <= 8) {
            recommendedSection = 'summer-gifts';
        } else if (currentMonth >= 9 && currentMonth <= 11) {
            recommendedSection = 'autumn-gifts';
        } else {
            recommendedSection = 'winter-gifts';
        }
        
        // 推奨バッジの表示（該当セクションがあれば）
        const recommendedElement = document.querySelector(`[data-season="${recommendedSection}"]`);
        if (recommendedElement) {
            const badge = document.createElement('div');
            badge.className = 'recommended-badge';
            badge.textContent = '今の季節におすすめ';
            badge.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: bold;
                z-index: 3;
                animation: pulse 2s infinite;
            `;
            recommendedElement.style.position = 'relative';
            recommendedElement.appendChild(badge);
        }
    }

    // 初期化時に推奨システム実行
    recommendGifts();

    // エラーハンドリング
    window.addEventListener('error', function(e) {
        console.warn('Gifts page error:', e.error);
    });
});