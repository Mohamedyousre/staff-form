// صفحة تتبع الحالة
let discordUser = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeStatusPage();
});

function initializeStatusPage() {
    // إعداد أحداث الأزرار
    setupEventListeners();
    
    // تحديث روابط السوشيال ميديا
    updateSocialLinks();
    
    // فحص حالة تسجيل الدخول
    checkAuthStatus();
}

function setupEventListeners() {
    // زر تسجيل الدخول
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            startDiscordAuth();
        });
    }
    
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // زر التحديث
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshApplicationStatus();
        });
    }
}

function updateSocialLinks() {
    const discordLinks = document.querySelectorAll('.footer-btn[href="#"]');
    discordLinks.forEach(link => {
        if (link.querySelector('.fa-discord')) {
            link.href = CONFIG.SOCIAL_LINKS.discord;
        }
        if (link.querySelector('.fa-github')) {
            link.href = CONFIG.SOCIAL_LINKS.github;
        }
    });
}

function checkAuthStatus() {
    // فحص معاملات URL أولاً
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('user');
    
    if (userData) {
        try {
            discordUser = JSON.parse(decodeURIComponent(userData));
            showUserSection(discordUser);
            localStorage.setItem('discordUser', JSON.stringify(discordUser));
            
            // إزالة المعاملات من URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        } catch (error) {
            console.error('خطأ في تحليل بيانات المستخدم:', error);
        }
    }
    
    // فحص التخزين المحلي
    const savedUser = localStorage.getItem('discordUser');
    if (savedUser) {
        try {
            discordUser = JSON.parse(savedUser);
            showUserSection(discordUser);
        } catch (error) {
            localStorage.removeItem('discordUser');
        }
    }
}

function startDiscordAuth() {
    const authUrl = `${CONFIG.DISCORD_OAUTH_URL}?redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
    window.location.href = authUrl;
}

function showUserSection(user) {
    // تحديث معلومات المستخدم
    const userName = document.getElementById('userName');
    const userTag = document.getElementById('userTag');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = user.global_name || user.display_name || user.username || 'غير معروف';
    if (userTag) userTag.textContent = `@${user.username}`;
    
    if (userAvatar) {
        const avatar = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
        userAvatar.src = avatar;
    }
    
    // إخفاء قسم تسجيل الدخول وإظهار قسم الحالة
    const loginSection = document.getElementById('loginSection');
    const statusSection = document.getElementById('statusSection');
    
    if (loginSection) loginSection.style.display = 'none';
    if (statusSection) statusSection.style.display = 'block';
    
    // تحميل حالة الطلبات
    loadApplicationStatus(user.id);
    
    // بدء التحديث التلقائي
    startAutoRefresh(user.id);
}

async function loadApplicationStatus(userId) {
    const statusContainer = document.getElementById('applicationStatus');
    if (!statusContainer) return;
    
    try {
        // عرض مؤشر التحميل
        statusContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>جاري تحميل حالة الطلب...</p>
            </div>
        `;
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/user-applications/${userId}`);
        
        if (!response.ok) {
            throw new Error('فشل في الحصول على حالة الطلبات');
        }
        
        const data = await response.json();
        
        if (data.applications && data.applications.length > 0) {
            displayApplications(data.applications);
        } else {
            displayNoApplications();
        }
        
    } catch (error) {
        console.error('خطأ في تحميل حالة الطلبات:', error);
        displayError(error.message);
    }
}

function displayApplications(applications) {
    const statusContainer = document.getElementById('applicationStatus');
    if (!statusContainer) return;
    
    let html = '<h3><i class="fas fa-list"></i> طلباتك الإدارية</h3>';
    
    applications.forEach(app => {
        const statusInfo = getStatusInfo(app.status);
        const submittedDate = new Date(app.submittedAt).toLocaleDateString('en-GB');
        const reviewedDate = app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString('en-GB') : null;
        
        html += `
            <div class="application-card">
                <div class="application-header">
                    <div class="application-id">
                        <i class="fas fa-hashtag"></i> ${app.id}
                    </div>
                    <div class="application-status ${statusInfo.class}">
                        ${statusInfo.icon} ${statusInfo.text}
                    </div>
                </div>
                
                <div class="application-details">
                    <div class="detail-item">
                        <span class="detail-label">تاريخ التقديم</span>
                        <span class="detail-value">${submittedDate}</span>
                    </div>
                    
                    ${reviewedDate ? `
                        <div class="detail-item">
                            <span class="detail-label">تاريخ المراجعة</span>
                            <span class="detail-value">${reviewedDate}</span>
                        </div>
                    ` : ''}
                    
                    <div class="detail-item">
                        <span class="detail-label">العمر المحسوب</span>
                        <span class="detail-value">${app.calculatedAge} سنة</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">البلد</span>
                        <span class="detail-value">${getCountryName(app.country)}</span>
                    </div>
                </div>
                
                ${app.reviewNotes ? `
                    <div class="review-notes">
                        <h4><i class="fas fa-comment"></i> ملاحظات المراجعة</h4>
                        <p>${app.reviewNotes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    statusContainer.innerHTML = html;
}

function displayNoApplications() {
    const statusContainer = document.getElementById('applicationStatus');
    if (!statusContainer) return;
    
    statusContainer.innerHTML = `
        <div class="no-applications">
            <div class="no-apps-icon">
                <i class="fas fa-inbox"></i>
            </div>
            <h3>لا توجد طلبات</h3>
            <p>لم تقم بتقديم أي طلبات إدارية بعد</p>
            <a href="index.html" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                تقديم طلب جديد
            </a>
        </div>
    `;
}

function displayError(message) {
    const statusContainer = document.getElementById('applicationStatus');
    if (!statusContainer) return;
    
    statusContainer.innerHTML = `
        <div class="error-message">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>خطأ في التحميل</h3>
            <p>${message}</p>
            <button onclick="refreshApplicationStatus()" class="btn btn-primary">
                <i class="fas fa-redo"></i>
                المحاولة مجدداً
            </button>
        </div>
    `;
}

function getStatusInfo(status) {
    switch (status) {
        case 'pending':
            return {
                class: 'status-pending',
                icon: '⏳',
                text: 'قيد المراجعة'
            };
        case 'accepted':
            return {
                class: 'status-accepted',
                icon: '✅',
                text: 'مقبول'
            };
        case 'rejected':
            return {
                class: 'status-rejected',
                icon: '❌',
                text: 'مرفوض'
            };
        case 'blacklisted':
            return {
                class: 'status-blacklisted',
                icon: '🚫',
                text: 'محظور'
            };
        default:
            return {
                class: 'status-unknown',
                icon: '❓',
                text: 'غير معروف'
            };
    }
}

function getCountryName(code) {
    const countries = {
        'SA': 'السعودية',
        'AE': 'الإمارات',
        'EG': 'مصر',
        'JO': 'الأردن',
        'LB': 'لبنان',
        'SY': 'سوريا',
        'IQ': 'العراق',
        'KW': 'الكويت',
        'QA': 'قطر',
        'BH': 'البحرين',
        'OM': 'عمان',
        'YE': 'اليمن',
        'MA': 'المغرب',
        'TN': 'تونس',
        'DZ': 'الجزائر',
        'LY': 'ليبيا',
        'SD': 'السودان',
        'PS': 'فلسطين',
        'other': 'أخرى'
    };
    
    return countries[code] || code;
}

function refreshApplicationStatus() {
    if (!discordUser) {
        showAlert('❌ يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    
    loadApplicationStatus(discordUser.id);
}

function startAutoRefresh(userId) {
    // إيقاف التحديث السابق إن وجد
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // بدء التحديث التلقائي كل 30 ثانية
    refreshInterval = setInterval(() => {
        loadApplicationStatus(userId);
    }, CONFIG.AUTO_REFRESH.interval);
}

function logout() {
    discordUser = null;
    localStorage.removeItem('discordUser');
    
    const loginSection = document.getElementById('loginSection');
    const statusSection = document.getElementById('statusSection');
    
    if (loginSection) loginSection.style.display = 'block';
    if (statusSection) statusSection.style.display = 'none';
    
    // إيقاف التحديث التلقائي
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#5865f2'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-weight: bold;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
    `;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

// إضافة أنماط إضافية للصفحة
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .no-applications,
    .error-message {
        text-align: center;
        padding: 3rem 2rem;
    }
    
    .no-apps-icon,
    .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.6;
    }
    
    .no-apps-icon {
        color: #5865f2;
    }
    
    .error-icon {
        color: #ff6b6b;
    }
    
    .review-notes {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        border-left: 3px solid #5865f2;
    }
    
    .review-notes h4 {
        margin-bottom: 0.5rem;
        color: #5865f2;
    }
    
    .status-pending {
        background: rgba(255, 255, 0, 0.2);
        color: #ffd43b;
    }
    
    .status-accepted {
        background: rgba(0, 255, 0, 0.2);
        color: #51cf66;
    }
    
    .status-rejected {
        background: rgba(255, 0, 0, 0.2);
        color: #ff6b6b;
    }
    
    .status-blacklisted {
        background: rgba(0, 0, 0, 0.3);
        color: #868e96;
    }
    
    .status-unknown {
        background: rgba(128, 128, 128, 0.2);
        color: #adb5bd;
    }
`;
document.head.appendChild(additionalStyles);
