// صفحة النجاح
document.addEventListener('DOMContentLoaded', function() {
    initializeSuccessPage();
});

function initializeSuccessPage() {
    // تحديث معلومات الطلب
    updateApplicationInfo();
    
    // تحديث روابط السوشيال ميديا
    updateSocialLinks();
    
    // بدء العد التنازلي للتوجه التلقائي (اختياري)
    // startAutoRedirect();
}

function updateApplicationInfo() {
    // الحصول على معرف الطلب من التخزين المحلي
    const applicationId = localStorage.getItem('lastApplicationId');
    const applicationDate = localStorage.getItem('lastApplicationDate');
    
    // تحديث معرف الطلب
    const applicationIdElement = document.getElementById('applicationId');
    if (applicationIdElement) {
        applicationIdElement.textContent = applicationId || '#' + generateRandomId();
    }
    
    // تحديث تاريخ التقديم
    const submissionDateElement = document.getElementById('submissionDate');
    if (submissionDateElement) {
        const date = applicationDate ? new Date(applicationDate) : new Date();
        submissionDateElement.textContent = date.toLocaleDateString('en-GB');
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

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function startAutoRedirect() {
    let countdown = 30; // 30 ثانية
    
    const countdownElement = document.createElement('div');
    countdownElement.className = 'countdown-notice';
    countdownElement.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 10px;
        margin-top: 2rem;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const container = document.querySelector('.success-container');
    if (container) {
        container.appendChild(countdownElement);
    }
    
    const interval = setInterval(() => {
        countdownElement.innerHTML = `
            <p><i class="fas fa-clock"></i> سيتم التوجه لصفحة تتبع الحالة خلال ${countdown} ثانية</p>
            <button onclick="clearInterval(${interval}); this.parentNode.remove();" class="btn btn-secondary">
                <i class="fas fa-times"></i> إلغاء
            </button>
        `;
        
        countdown--;
        
        if (countdown < 0) {
            clearInterval(interval);
            window.location.href = 'status.html';
        }
    }, 1000);
}
