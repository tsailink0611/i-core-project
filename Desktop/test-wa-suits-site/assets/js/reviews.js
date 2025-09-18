// Reviews Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeReviews();
});

function initializeReviews() {
    initializeFilters();
    initializePagination();
    initializeReviewModal();
    initializeHelpfulButtons();
    initializeAnimations();
}

// Filter System
function initializeFilters() {
    const productFilter = document.getElementById('product-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (productFilter) {
        productFilter.addEventListener('change', filterReviews);
    }
    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterReviews);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', filterReviews);
    }
}

function filterReviews() {
    const productFilter = document.getElementById('product-filter').value;
    const ratingFilter = document.getElementById('rating-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const reviewCards = document.querySelectorAll('.review-card');

    // Show loading state
    showLoadingState();

    setTimeout(() => {
        let visibleCards = [];

        reviewCards.forEach(card => {
            const cardProduct = card.dataset.product;
            const cardRating = parseInt(card.dataset.rating);
            let show = true;

            // Filter by product
            if (productFilter && cardProduct !== productFilter) {
                show = false;
            }

            // Filter by rating
            if (ratingFilter) {
                const minRating = parseInt(ratingFilter);
                if (cardRating < minRating) {
                    show = false;
                }
            }

            if (show) {
                visibleCards.push(card);
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Sort visible cards
        if (sortFilter && visibleCards.length > 0) {
            sortReviews(visibleCards, sortFilter);
        }

        hideLoadingState();

        // Show empty state if no results
        if (visibleCards.length === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
        }

        // Reset pagination
        updatePagination(visibleCards.length);
    }, 500);
}

function sortReviews(cards, sortType) {
    const container = document.querySelector('.reviews-list');

    cards.sort((a, b) => {
        switch (sortType) {
            case 'newest':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            case 'oldest':
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            case 'rating-high':
                return parseInt(b.dataset.rating) - parseInt(a.dataset.rating);
            case 'rating-low':
                return parseInt(a.dataset.rating) - parseInt(b.dataset.rating);
            default:
                return 0;
        }
    });

    // Reorder DOM elements
    cards.forEach(card => {
        container.appendChild(card);
    });
}

// Pagination System
function initializePagination() {
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const pageNumbers = document.querySelectorAll('.pagination-number');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage('prev'));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage('next'));
    }

    pageNumbers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pageNumber = parseInt(e.target.textContent);
            goToPage(pageNumber);
        });
    });
}

let currentPage = 1;
const reviewsPerPage = 6;

function changePage(direction) {
    const totalReviews = document.querySelectorAll('.review-card:not([style*="display: none"])').length;
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);

    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }

    updatePaginationDisplay();
    scrollToReviews();
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    updatePaginationDisplay();
    scrollToReviews();
}

function updatePagination(totalReviews) {
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);
    currentPage = 1;
    updatePaginationDisplay();
}

function updatePaginationDisplay() {
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const pageNumbers = document.querySelectorAll('.pagination-number');
    const totalReviews = document.querySelectorAll('.review-card:not([style*="display: none"])').length;
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);

    // Update button states
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }

    // Update page number highlighting
    pageNumbers.forEach(btn => {
        const pageNum = parseInt(btn.textContent);
        btn.classList.toggle('active', pageNum === currentPage);
    });

    // Show/hide reviews based on current page
    showReviewsForPage();
}

function showReviewsForPage() {
    const allReviews = document.querySelectorAll('.review-card');
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    let visibleIndex = 0;

    allReviews.forEach(review => {
        if (review.style.display !== 'none') {
            if (visibleIndex >= startIndex && visibleIndex < endIndex) {
                review.style.display = 'block';
                review.classList.add('fade-in-up');
            } else {
                review.style.display = 'none';
            }
            visibleIndex++;
        }
    });
}

function scrollToReviews() {
    const reviewsSection = document.querySelector('.reviews-grid');
    if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Review Modal System
function initializeReviewModal() {
    const submitBtn = document.getElementById('review-submit-btn');
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('review-modal-close');
    const cancelBtn = document.getElementById('review-cancel');
    const form = document.getElementById('review-form');

    if (submitBtn) {
        submitBtn.addEventListener('click', openReviewModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeReviewModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeReviewModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeReviewModal();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', handleReviewSubmission);
    }

    initializeRatingInput();
}

function openReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetReviewForm();
    }
}

function initializeRatingInput() {
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingValue = document.getElementById('rating-value');

    ratingStars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingValue.value = rating;
            updateRatingDisplay(rating);
        });

        star.addEventListener('mouseenter', () => {
            const rating = index + 1;
            highlightStars(rating);
        });
    });

    const ratingContainer = document.getElementById('review-rating-input');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', () => {
            const currentRating = parseInt(ratingValue.value) || 0;
            updateRatingDisplay(currentRating);
        });
    }
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function updateRatingDisplay(rating) {
    highlightStars(rating);
}

function resetReviewForm() {
    const form = document.getElementById('review-form');
    if (form) {
        form.reset();
        updateRatingDisplay(0);
    }
}

function handleReviewSubmission(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const reviewData = {
        product: document.getElementById('review-product').value,
        rating: document.getElementById('rating-value').value,
        name: document.getElementById('reviewer-name').value,
        content: document.getElementById('review-text').value,
        date: new Date().toISOString().split('T')[0]
    };

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '投稿中...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        addNewReview(reviewData);
        closeReviewModal();
        showSuccessMessage();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

function addNewReview(reviewData) {
    const reviewsList = document.querySelector('.reviews-list');
    const newReviewCard = createReviewCard(reviewData);

    // Add to the top of the list
    reviewsList.insertBefore(newReviewCard, reviewsList.firstChild);

    // Animate in
    newReviewCard.classList.add('fade-in-up');

    // Update review count
    updateReviewCount();
}

function createReviewCard(data) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.product = data.product;
    card.dataset.rating = data.rating;
    card.dataset.date = data.date;

    const initials = data.name.charAt(0);
    const stars = '★'.repeat(parseInt(data.rating)) + '☆'.repeat(5 - parseInt(data.rating));
    const formattedDate = new Date(data.date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">
                    <span>${initials}</span>
                </div>
                <div class="reviewer-details">
                    <div class="reviewer-name">${data.name}</div>
                    <div class="review-date">${formattedDate}</div>
                </div>
            </div>
            <div class="review-rating">
                ${stars.split('').map(star => `<span class="star${star === '★' ? ' filled' : ''}">${star}</span>`).join('')}
            </div>
        </div>
        <div class="review-product">${data.product}</div>
        <div class="review-content">
            <p>${data.content}</p>
        </div>
        <div class="review-actions">
            <button class="helpful-btn">
                <span class="helpful-icon">👍</span>
                参考になった (0)
            </button>
        </div>
    `;

    // Add helpful button functionality
    const helpfulBtn = card.querySelector('.helpful-btn');
    helpfulBtn.addEventListener('click', function() {
        toggleHelpful(this);
    });

    return card;
}

function updateReviewCount() {
    const countElement = document.querySelector('.summary-item:nth-child(2) .summary-number');
    if (countElement) {
        const currentCount = parseInt(countElement.textContent.replace(',', ''));
        countElement.textContent = (currentCount + 1).toLocaleString();
    }
}

// Helpful Buttons
function initializeHelpfulButtons() {
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    helpfulBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleHelpful(this);
        });
    });
}

function toggleHelpful(button) {
    const isActive = button.classList.contains('active');
    const countText = button.textContent.match(/\((\d+)\)/);
    let count = countText ? parseInt(countText[1]) : 0;

    if (isActive) {
        count = Math.max(0, count - 1);
        button.classList.remove('active');
    } else {
        count++;
        button.classList.add('active');
    }

    button.innerHTML = `
        <span class="helpful-icon">👍</span>
        参考になった (${count})
    `;
}

// Loading and Empty States
function showLoadingState() {
    const reviewsList = document.querySelector('.reviews-list');
    if (reviewsList) {
        reviewsList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>レビューを読み込み中...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
        loadingState.remove();
    }
}

function showEmptyState() {
    const reviewsList = document.querySelector('.reviews-list');
    if (reviewsList && !document.querySelector('.empty-state')) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <h3>該当するレビューが見つかりません</h3>
            <p>検索条件を変更してお試しください</p>
        `;
        reviewsList.appendChild(emptyState);
    }
}

function hideEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

// Animations
function initializeAnimations() {
    // Animate review cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe review cards
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach(card => {
        observer.observe(card);
    });

    // Observe summary items
    const summaryItems = document.querySelectorAll('.summary-item');
    summaryItems.forEach(item => {
        observer.observe(item);
    });
}

// Success Messages
function showSuccessMessage() {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✓</span>
            <span class="notification-text">レビューを投稿しました</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('review-modal');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeReviewModal();
        }
    }
});

// Utility Functions
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

// Initialize page-specific features
function initializePageFeatures() {
    // Auto-scroll to reviews if coming from a direct link
    if (window.location.hash === '#reviews') {
        setTimeout(() => {
            scrollToReviews();
        }, 500);
    }

    // Update page count display
    updatePaginationDisplay();
}

// Call initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializePageFeatures();
});