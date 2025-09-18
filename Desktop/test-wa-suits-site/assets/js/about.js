// About Page 専用JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // パララックス効果の実装
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    let ticking = false;

    function updateParallax() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;

        parallaxBgs.forEach((bg, index) => {
            const rect = bg.getBoundingClientRect();
            const speed = 0.5; // パララックスの速度
            
            if (rect.bottom >= 0 && rect.top <= windowHeight) {
                const yPos = -(scrollTop * speed);
                bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // スクロールイベントの最適化
    window.addEventListener('scroll', requestTick, { passive: true });

    // 動画再生ボタンの実装
    const videoPlayBtn = document.querySelector('.video-play-btn');
    const videoPlaceholder = document.querySelector('.video-placeholder');

    if (videoPlayBtn) {
        videoPlayBtn.addEventListener('click', function() {
            // 実際の動画がある場合の処理
            // ここでは動画再生のモック実装
            showVideoModal();
        });
    }

    function showVideoModal() {
        // 動画モーダルの作成
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <button class="video-modal-close">&times;</button>
                <div class="video-container-modal">
                    <div class="video-placeholder-modal">
                        <p>ここに動画が再生されます</p>
                        <p>職人の技と和菓子作りの様子をご覧いただけます</p>
                    </div>
                </div>
            </div>
        `;

        // モーダルスタイルの追加
        const style = document.createElement('style');
        style.textContent = `
            .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .video-modal.show {
                opacity: 1;
            }
            .video-modal-content {
                position: relative;
                width: 90%;
                max-width: 800px;
                aspect-ratio: 16/9;
                background: #000;
                border-radius: 8px;
                overflow: hidden;
            }
            .video-modal-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                z-index: 10001;
            }
            .video-container-modal {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .video-placeholder-modal {
                text-align: center;
                color: white;
                padding: 2rem;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // アニメーション表示
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 閉じるボタンの処理
        const closeBtn = modal.querySelector('.video-modal-close');
        closeBtn.addEventListener('click', closeVideoModal);

        // 背景クリックで閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeVideoModal();
            }
        });

        function closeVideoModal() {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        }

        // ESCキーで閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeVideoModal();
            }
        });
    }

    // ウォーターウェーブボタンの効果
    const waterWaveBtns = document.querySelectorAll('.water-wave-btn');
    
    waterWaveBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // リップル効果の作成
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                background-color: rgba(255, 255, 255, 0.6);
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // リップルアニメーションのCSS
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // 統計数値のカウントアニメーション
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const countUpObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetNumber = parseInt(target.textContent);
                animateCountUp(target, targetNumber);
                countUpObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => {
        countUpObserver.observe(num);
    });

    function animateCountUp(element, target) {
        let current = 0;
        const increment = target / 60; // 60フレームで完了
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // 品質アイテムのスタッガーアニメーション
    const qualityItems = document.querySelectorAll('.quality-item');
    
    const staggerObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.parentElement.querySelectorAll('.quality-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 200);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (qualityItems.length > 0) {
        staggerObserver.observe(qualityItems[0]);
    }

    // 無限スクロール風のアニメーション（背景要素）
    function createFloatingElements() {
        const container = document.querySelector('.parallax-container');
        if (!container) return;

        for (let i = 0; i < 5; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: rgba(74, 92, 58, 0.3);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${5 + Math.random() * 10}s infinite linear;
            `;
            document.body.appendChild(element);
        }
    }

    // フローティング要素のアニメーション
    const floatingStyle = document.createElement('style');
    floatingStyle.textContent = `
        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(floatingStyle);

    // ページ読み込み時のフローティング要素作成
    createFloatingElements();

    // セクション間の視差効果の微調整
    const sections = document.querySelectorAll('.story-section, .craftsmanship-section, .quality-section, .store-section');
    
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateZ(0)'; // 3D加速を有効化
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // モバイルデバイスでのパララックス最適化
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // モバイルではパララックスを軽量化
        parallaxBgs.forEach(bg => {
            bg.style.backgroundAttachment = 'scroll';
        });
    }

    // パフォーマンス監視
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                    console.warn('Page load time is slow, consider optimizing assets');
                }
            }, 1000);
        });
    }

    // デバッグ用：スクロール位置の表示（開発時のみ）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            font-family: monospace;
        `;
        document.body.appendChild(debugInfo);

        window.addEventListener('scroll', function() {
            debugInfo.textContent = `Scroll: ${Math.round(window.pageYOffset)}px`;
        });
    }
});