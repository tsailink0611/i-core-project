// News Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsItems = document.querySelectorAll('.news-item');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    const shareBtns = document.querySelectorAll('.share-btn');
    const noticeClose = document.querySelector('.notice-close');
    const newsletterForm = document.querySelector('.newsletter-signup');
    const paginationBtns = document.querySelectorAll('.pagination-number');
    const paginationPrev = document.querySelector('.pagination-btn.prev');
    const paginationNext = document.querySelector('.pagination-btn.next');

    // 現在のフィルターと検索状態
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let currentPage = 1;
    let itemsPerPage = 6;

    // カテゴリフィルター機能
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            currentFilter = category;
            currentPage = 1;
            
            // アクティブボタンの切り替え
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // フィルター適用
            applyFilters();
            updatePagination();
        });
    });

    // 検索機能
    searchInput.addEventListener('input', debounce(function() {
        currentSearchTerm = this.value.toLowerCase();
        currentPage = 1;
        applyFilters();
        updatePagination();
    }, 300));

    searchBtn.addEventListener('click', function() {
        currentSearchTerm = searchInput.value.toLowerCase();
        currentPage = 1;
        applyFilters();
        updatePagination();
    });

    // Enterキーでの検索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    function applyFilters() {
        let visibleItems = [];
        
        newsItems.forEach((item, index) => {
            const category = item.dataset.category;
            const title = item.querySelector('.news-title').textContent.toLowerCase();
            const excerpt = item.querySelector('.news-excerpt').textContent.toLowerCase();
            const tags = Array.from(item.querySelectorAll('.news-tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            const matchesCategory = currentFilter === 'all' || category === currentFilter;
            const matchesSearch = currentSearchTerm === '' || 
                                title.includes(currentSearchTerm) || 
                                excerpt.includes(currentSearchTerm) ||
                                tags.some(tag => tag.includes(currentSearchTerm));
            
            if (matchesCategory && matchesSearch) {
                visibleItems.push(item);
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // 検索結果のハイライト
        if (currentSearchTerm) {
            highlightSearchResults(visibleItems, currentSearchTerm);
        } else {
            removeHighlights();
        }

        // ページネーション用のアイテム管理
        updatePaginationDisplay(visibleItems);
        
        // 結果が0件の場合の表示
        showNoResultsMessage(visibleItems.length === 0);
    }

    function highlightSearchResults(items, searchTerm) {
        items.forEach(item => {
            const title = item.querySelector('.news-title');
            const excerpt = item.querySelector('.news-excerpt');
            
            highlightText(title, searchTerm);
            highlightText(excerpt, searchTerm);
        });
    }

    function highlightText(element, searchTerm) {
        const originalText = element.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = originalText.replace(regex, '<span class="search-highlight">$1</span>');
        element.innerHTML = highlightedText;
    }

    function removeHighlights() {
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    function showNoResultsMessage(show) {
        let noResultsMsg = document.querySelector('.no-results-message');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message fade-in';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--neutral-gray);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📰</div>
                    <h3 style="margin-bottom: 0.5rem;">該当するお知らせが見つかりません</h3>
                    <p>検索条件を変更してお試しください</p>
                </div>
            `;
            document.querySelector('.news-grid').appendChild(noResultsMsg);
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // ページネーション機能
    function updatePaginationDisplay(visibleItems) {
        const totalItems = visibleItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // アイテムの表示・非表示
        visibleItems.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.style.display = 'block';
                // フェードインアニメーション
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                item.style.display = 'none';
            }
        });
    }

    function updatePagination() {
        const visibleItemsCount = Array.from(newsItems).filter(item => 
            item.style.display !== 'none'
        ).length;
        const totalPages = Math.ceil(visibleItemsCount / itemsPerPage);

        // ページ番号ボタンの更新
        paginationBtns.forEach((btn, index) => {
            const pageNum = index + 1;
            btn.classList.toggle('active', pageNum === currentPage);
        });

        // 前へ・次へボタンの状態更新
        paginationPrev.disabled = currentPage === 1;
        paginationNext.disabled = currentPage === totalPages || totalPages === 0;
    }

    // ページネーションボタンのイベント
    paginationBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            currentPage = index + 1;
            applyFilters();
            updatePagination();
            
            // トップへスクロール
            document.querySelector('.news-list').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    paginationPrev.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
            updatePagination();
        }
    });

    paginationNext.addEventListener('click', function() {
        const visibleItemsCount = Array.from(newsItems).filter(item => 
            item.style.display !== 'none'
        ).length;
        const totalPages = Math.ceil(visibleItemsCount / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            applyFilters();
            updatePagination();
        }
    });

    // 詳細記事表示機能
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const newsItem = this.closest('.news-item');
            const newsData = extractNewsData(newsItem);
            showNewsDetail(newsData);
        });
    });

    function extractNewsData(newsItem) {
        return {
            title: newsItem.querySelector('.news-title').textContent,
            date: newsItem.querySelector('.news-date').textContent,
            category: newsItem.querySelector('.news-category').textContent,
            excerpt: newsItem.querySelector('.news-excerpt').textContent,
            tags: Array.from(newsItem.querySelectorAll('.news-tag')).map(tag => tag.textContent),
            image: newsItem.querySelector('.news-image-placeholder').className
        };
    }

    function showNewsDetail(newsData) {
        const modal = document.createElement('div');
        modal.className = 'news-detail-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <article class="news-detail">
                    <header class="news-detail-header">
                        <div class="news-detail-meta">
                            <span class="news-detail-date">${newsData.date}</span>
                            <span class="news-detail-category">${newsData.category}</span>
                        </div>
                        <h1 class="news-detail-title">${newsData.title}</h1>
                        <div class="news-detail-tags">
                            ${newsData.tags.map(tag => `<span class="news-detail-tag">${tag}</span>`).join('')}
                        </div>
                    </header>
                    <div class="news-detail-image">
                        <div class="news-detail-placeholder ${newsData.image}"></div>
                    </div>
                    <div class="news-detail-content">
                        <p>${newsData.excerpt}</p>
                        <p>こちらは詳細記事の内容です。実際のウェブサイトでは、ここに完全な記事内容が表示されます。</p>
                        <p>和粋では、お客様により良いサービスをご提供するため、常に改善に努めております。ご不明な点がございましたら、お気軽にお問い合わせください。</p>
                        
                        <div class="news-detail-actions">
                            <button class="news-action-btn" onclick="window.print()">印刷</button>
                            <button class="news-action-btn share-detail-btn">シェア</button>
                        </div>
                    </div>
                </article>
            </div>
        `;

        // モーダルスタイル
        const style = document.createElement('style');
        style.textContent = `
            .news-detail-modal {
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
            .news-detail-modal.show {
                opacity: 1;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
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
            .news-detail-modal.show .modal-content {
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
                padding: 10px;
            }
            .news-detail {
                padding: 2rem;
            }
            .news-detail-header {
                margin-bottom: 2rem;
            }
            .news-detail-meta {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            .news-detail-date {
                color: var(--neutral-gray);
            }
            .news-detail-category {
                background: var(--primary-green);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.9rem;
            }
            .news-detail-title {
                font-family: var(--font-serif);
                font-size: 2rem;
                color: var(--primary-green);
                margin-bottom: 1rem;
                line-height: 1.4;
            }
            .news-detail-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .news-detail-tag {
                background: var(--neutral-cream);
                color: var(--neutral-gray);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
            }
            .news-detail-image {
                height: 300px;
                margin-bottom: 2rem;
                border-radius: 8px;
                overflow: hidden;
            }
            .news-detail-placeholder {
                width: 100%;
                height: 100%;
            }
            .news-detail-content {
                line-height: 1.8;
                color: var(--text-dark);
            }
            .news-detail-content p {
                margin-bottom: 1.5rem;
            }
            .news-detail-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px solid var(--neutral-beige);
            }
            .news-action-btn {
                background: var(--primary-green);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .news-action-btn:hover {
                background: var(--primary-green-dark);
                transform: translateY(-2px);
            }
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                .news-detail {
                    padding: 1rem;
                }
                .news-detail-title {
                    font-size: 1.5rem;
                }
                .news-detail-image {
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

        // ESCキーで閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // シェア機能
        const shareDetailBtn = modal.querySelector('.share-detail-btn');
        shareDetailBtn.addEventListener('click', () => shareNews(newsData));
    }

    // シェア機能
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const newsItem = this.closest('.news-item');
            const newsData = extractNewsData(newsItem);
            shareNews(newsData);
        });
    });

    function shareNews(newsData) {
        if (navigator.share) {
            navigator.share({
                title: newsData.title,
                text: newsData.excerpt,
                url: window.location.href
            }).catch(console.error);
        } else {
            // フォールバック: クリップボードにコピー
            const shareText = `${newsData.title}\n${newsData.excerpt}\n${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('リンクをクリップボードにコピーしました');
            }).catch(() => {
                // さらなるフォールバック: シェアモーダル
                showShareModal(newsData);
            });
        }
    }

    function showShareModal(newsData) {
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal';
        shareModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h3>記事をシェア</h3>
                <div class="share-options">
                    <button class="share-option twitter" data-platform="twitter">Twitter</button>
                    <button class="share-option facebook" data-platform="facebook">Facebook</button>
                    <button class="share-option line" data-platform="line">LINE</button>
                    <button class="share-option copy" data-platform="copy">リンクをコピー</button>
                </div>
            </div>
        `;

        document.body.appendChild(shareModal);
        
        // シェアボタンのイベント
        shareModal.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const platform = this.dataset.platform;
                shareToPlatform(platform, newsData);
                document.body.removeChild(shareModal);
            });
        });

        // 閉じる機能
        shareModal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(shareModal);
        });
    }

    function shareToplatform(platform, newsData) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`${newsData.title} - ${newsData.excerpt}`);
        
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            line: `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('リンクをコピーしました');
            });
        } else if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    }

    // 重要なお知らせを閉じる
    if (noticeClose) {
        noticeClose.addEventListener('click', function() {
            const notice = this.closest('.important-notice');
            notice.style.transform = 'translateY(-100%)';
            notice.style.opacity = '0';
            
            setTimeout(() => {
                notice.style.display = 'none';
                localStorage.setItem('importantNoticeHidden', 'true');
            }, 300);
        });

        // ローカルストレージをチェックして表示状態を復元
        if (localStorage.getItem('importantNoticeHidden') === 'true') {
            document.querySelector('.important-notice').style.display = 'none';
        }
    }

    // ニュースレター登録
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.newsletter-input');
            const submitBtn = this.querySelector('.newsletter-submit');
            const email = emailInput.value;
            
            if (!isValidEmail(email)) {
                showToast('有効なメールアドレスを入力してください', 'error');
                return;
            }
            
            // 送信処理のシミュレーション
            submitBtn.textContent = '登録中...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // 成功処理
                showToast('ニュースレターの登録が完了しました');
                emailInput.value = '';
                submitBtn.textContent = '登録する';
                submitBtn.disabled = false;
                
                // 登録状況をローカルストレージに保存
                localStorage.setItem('newsletterSubscribed', 'true');
                
            }, 2000);
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-green)' : '#f44336'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // デバウンス関数
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

    // ニュースアイテムのクリックで詳細表示
    newsItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.news-actions')) {
                const readMoreBtn = this.querySelector('.read-more-btn');
                readMoreBtn.click();
            }
        });
    });

    // スクロール時のアニメーション
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

    // アーカイブリンクの動的読み込み（シミュレーション）
    const archiveLinks = document.querySelectorAll('.archive-link');
    archiveLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const linkText = this.textContent;
            showToast(`「${linkText}」の記事を読み込み中...`);
            
            // 実際のアプリケーションでは、ここでAPIからデータを取得
            setTimeout(() => {
                showToast('記事の読み込みが完了しました');
            }, 1500);
        });
    });

    // URLパラメータからカテゴリを設定
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        const targetBtn = document.querySelector(`[data-category="${categoryParam}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }

    // 初期化
    applyFilters();
    updatePagination();

    // パフォーマンス監視
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                    console.warn('News page load time is slow');
                }
            }, 1000);
        });
    }

    // エラーハンドリング
    window.addEventListener('error', function(e) {
        console.warn('News page error:', e.error);
    });
});