// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const contactForm = document.getElementById('contactForm');
    const formSteps = document.querySelectorAll('.form-step');
    const stepItems = document.querySelectorAll('.step-item');
    const faqItems = document.querySelectorAll('.faq-item');
    const mapBtns = document.querySelectorAll('.map-btn');
    const messageTextarea = document.getElementById('message');
    const charCountSpan = document.getElementById('charCount');

    // フォーム状態管理
    let currentStep = 1;
    const formData = {};

    // ステップ管理
    function showStep(stepNumber) {
        // 全ステップを非表示
        formSteps.forEach(step => step.classList.remove('active'));
        stepItems.forEach(item => item.classList.remove('active'));

        // 指定されたステップを表示
        const targetStep = document.getElementById(`step${stepNumber}`);
        const targetStepItem = stepItems[stepNumber - 1];
        
        if (targetStep && targetStepItem) {
            targetStep.classList.add('active');
            targetStepItem.classList.add('active');
            
            // 完了したステップにマークを付ける
            for (let i = 0; i < stepNumber - 1; i++) {
                stepItems[i].classList.add('completed');
            }
        }

        currentStep = stepNumber;
        
        // ステップに応じたスクロール調整
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 次のステップへ進む
    window.nextStep = function() {
        if (validateCurrentStep()) {
            saveCurrentStepData();
            
            if (currentStep === 2) {
                // 確認画面の表示前にデータを設定
                updateConfirmationDisplay();
            }
            
            showStep(currentStep + 1);
        }
    };

    // 前のステップに戻る
    window.prevStep = function() {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    };

    // 現在のステップのバリデーション
    function validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // ステップ2の場合、メールアドレスの一致確認
        if (currentStep === 2) {
            const email = document.getElementById('email').value;
            const emailConfirm = document.getElementById('emailConfirm').value;
            
            if (email !== emailConfirm) {
                showFieldError(document.getElementById('emailConfirm'), 'メールアドレスが一致しません');
                isValid = false;
            }
        }

        return isValid;
    }

    // 個別フィールドのバリデーション
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // 必須チェック
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'この項目は必須です';
            isValid = false;
        }
        // メールアドレスの形式チェック
        else if (field.type === 'email' && value && !isValidEmail(value)) {
            errorMessage = 'メールアドレスの形式が正しくありません';
            isValid = false;
        }
        // カタカナチェック（フリガナ）
        else if (field.id.includes('Kana') && value && !isValidKatakana(value)) {
            errorMessage = 'カタカナで入力してください';
            isValid = false;
        }
        // 電話番号の形式チェック
        else if (field.type === 'tel' && value && !isValidPhone(value)) {
            errorMessage = '電話番号の形式が正しくありません';
            isValid = false;
        }

        if (!isValid) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidKatakana(text) {
        const katakanaRegex = /^[\u30A0-\u30FF\s]+$/;
        return katakanaRegex.test(text);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\d\-\(\)\s]+$/;
        return phoneRegex.test(phone);
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        
        // 既存のエラーメッセージを削除
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 新しいエラーメッセージを追加
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // 現在のステップのデータを保存
    function saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        });
    }

    // 確認画面の表示更新
    function updateConfirmationDisplay() {
        // お問い合わせの種類
        const inquiryTypeLabels = {
            'product': '商品について',
            'order': 'ご注文について',
            'gift': 'ギフトについて',
            'store': '店舗について',
            'other': 'その他'
        };
        
        document.getElementById('confirmType').textContent = 
            inquiryTypeLabels[formData.inquiryType] || '';
        document.getElementById('confirmSubject').textContent = formData.subject || '';
        document.getElementById('confirmMessage').textContent = formData.message || '';
        
        document.getElementById('confirmName').textContent = 
            `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
        document.getElementById('confirmNameKana').textContent = 
            `${formData.lastNameKana || ''} ${formData.firstNameKana || ''}`.trim();
        document.getElementById('confirmEmail').textContent = formData.email || '';
        document.getElementById('confirmPhone').textContent = formData.phone || '未入力';
    }

    // フォーム送信処理
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }

        const privacyAgree = document.getElementById('privacyAgree').checked;
        if (!privacyAgree) {
            showToast('プライバシーポリシーに同意してください', 'error');
            return;
        }

        // 送信処理の実行
        submitForm();
    });

    function submitForm() {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // ローディング状態
        submitBtn.textContent = '送信中...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // 送信処理のシミュレーション（実際のAPIコールに置き換え）
        setTimeout(() => {
            // 成功処理
            showSuccessMessage();
            
            // フォームをリセット
            contactForm.reset();
            showStep(1);
            
            // ボタンを元に戻す
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            
            // データをクリア
            Object.keys(formData).forEach(key => delete formData[key]);
            
            // 成功通知
            showToast('お問い合わせを送信しました。ありがとうございます。');
            
        }, 2000);
    }

    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            お問い合わせありがとうございます。<br>
            内容を確認の上、2営業日以内にご連絡いたします。
        `;
        
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(successDiv, contactForm);
        
        // 3秒後に自動削除
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    // リアルタイムバリデーション
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                validateField(this);
            }
        });

        input.addEventListener('input', function() {
            // エラー状態の場合はリアルタイムで検証
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // 文字数カウント
    if (messageTextarea && charCountSpan) {
        messageTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCountSpan.textContent = count;
            
            if (count > 1000) {
                charCountSpan.style.color = '#e74c3c';
                this.style.borderColor = '#e74c3c';
            } else if (count > 900) {
                charCountSpan.style.color = '#f39c12';
                this.style.borderColor = '#f39c12';
            } else {
                charCountSpan.style.color = 'var(--neutral-gray)';
                this.style.borderColor = 'var(--neutral-beige)';
            }
        });
    }

    // FAQ アコーディオン機能
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // 他のFAQを閉じる
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // クリックされたFAQをトグル
            item.classList.toggle('active', !isActive);
        });
    });

    // 地図表示機能
    mapBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const storeType = this.dataset.store;
            showMapModal(storeType);
        });
    });

    function showMapModal(storeType) {
        const storeData = {
            main: {
                name: '和粋 本店',
                address: '東京都渋谷区○○○○ 1-2-3',
                phone: '03-1234-5678'
            },
            branch: {
                name: '和粋 支店',
                address: '東京都新宿区○○○○ 2-3-4',
                phone: '03-2345-6789'
            }
        };

        const store = storeData[storeType];
        
        const modal = document.createElement('div');
        modal.className = 'map-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="map-header">
                    <h3>${store.name}</h3>
                    <p>${store.address}</p>
                    <p>TEL: ${store.phone}</p>
                </div>
                <div class="map-container">
                    <div class="map-placeholder">
                        <div class="map-icon">📍</div>
                        <p>ここに地図が表示されます</p>
                        <p>実際のアプリケーションでは、Google Maps APIや<br>他の地図サービスを統合できます</p>
                    </div>
                </div>
                <div class="map-actions">
                    <button class="map-action-btn" onclick="window.open('https://maps.google.com', '_blank')">
                        Google Mapsで開く
                    </button>
                    <button class="map-action-btn" onclick="navigator.clipboard.writeText('${store.address}')">
                        住所をコピー
                    </button>
                </div>
            </div>
        `;

        // モーダルスタイル
        const style = document.createElement('style');
        style.textContent = `
            .map-modal {
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
            .map-modal.show {
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
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .map-modal.show .modal-content {
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
            .map-header {
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid var(--neutral-beige);
            }
            .map-header h3 {
                color: var(--primary-green);
                margin-bottom: 0.5rem;
            }
            .map-container {
                height: 300px;
                background: var(--neutral-cream);
            }
            .map-placeholder {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                color: var(--neutral-gray);
            }
            .map-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .map-actions {
                padding: 1rem 2rem 2rem;
                display: flex;
                gap: 1rem;
            }
            .map-action-btn {
                flex: 1;
                background: var(--primary-green);
                color: white;
                border: none;
                padding: 0.75rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .map-action-btn:hover {
                background: var(--primary-green-dark);
                transform: translateY(-2px);
            }
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                .map-actions {
                    flex-direction: column;
                    padding: 1rem;
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
    }

    // トースト通知
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-green)' : '#e74c3c'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
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

    // お問い合わせタイプ選択時の自動件名設定
    const inquiryTypeInputs = document.querySelectorAll('input[name="inquiryType"]');
    inquiryTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            const subjectInput = document.getElementById('subject');
            const subjectSuggestions = {
                'product': '商品について',
                'order': 'ご注文について',
                'gift': 'ギフトについて',
                'store': '店舗について',
                'other': 'その他のお問い合わせ'
            };
            
            if (!subjectInput.value.trim()) {
                subjectInput.value = subjectSuggestions[this.value] || '';
            }
        });
    });

    // オートコンプリート機能（メールアドレス）
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const value = this.value;
            const atIndex = value.indexOf('@');
            
            if (atIndex === -1 && value.length > 0) {
                // @が入力されていない場合、候補を表示
                const suggestions = ['@gmail.com', '@yahoo.co.jp', '@hotmail.com', '@outlook.com'];
                // 実際のアプリケーションでは、ここでドロップダウンを表示
            }
        });
    }

    // フォームデータの自動保存（ローカルストレージ）
    function saveFormProgress() {
        const formInputs = document.querySelectorAll('.form-input, .form-textarea');
        const progressData = {};
        
        formInputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    progressData[input.name] = input.value;
                }
            } else {
                progressData[input.name] = input.value;
            }
        });
        
        localStorage.setItem('contactFormProgress', JSON.stringify(progressData));
    }

    function loadFormProgress() {
        const savedData = localStorage.getItem('contactFormProgress');
        if (savedData) {
            const progressData = JSON.parse(savedData);
            
            Object.keys(progressData).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'radio') {
                        const radioOption = document.querySelector(`[name="${key}"][value="${progressData[key]}"]`);
                        if (radioOption) radioOption.checked = true;
                    } else {
                        input.value = progressData[key];
                    }
                }
            });
        }
    }

    // ページ離脱前の確認
    let formModified = false;
    
    const allInputs = document.querySelectorAll('.form-input, .form-textarea, input[type="radio"]');
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            formModified = true;
            saveFormProgress();
        });
    });

    window.addEventListener('beforeunload', function(e) {
        if (formModified && currentStep > 1) {
            e.preventDefault();
            e.returnValue = '';
            return '入力中のデータが失われます。ページを離れてもよろしいですか？';
        }
    });

    // フォーム送信完了後にプログレスをクリア
    contactForm.addEventListener('submit', function() {
        setTimeout(() => {
            localStorage.removeItem('contactFormProgress');
            formModified = false;
        }, 3000);
    });

    // アニメーション観察
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

    // 初期化
    loadFormProgress();
    showStep(1);

    // パフォーマンス監視
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                    console.warn('Contact page load time is slow');
                }
            }, 1000);
        });
    }

    // エラーハンドリング
    window.addEventListener('error', function(e) {
        console.warn('Contact page error:', e.error);
        showToast('エラーが発生しました。ページを再読み込みしてください。', 'error');
    });
});