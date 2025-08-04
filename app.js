// متغيرات عامة
let discordUser = null;
let statusCheckInterval = null;

// بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// تهيئة التطبيق
function initializeApp() {
    // تحديث روابط السوشيال ميديا
    updateSocialLinks();
    
    // إعداد أحداث الأزرار
    setupEventListeners();
    
    // ملء خيارات الأيام (1-31)
    populateDayOptions();
    
    // فحص حالة تسجيل الدخول
    checkAuthStatus();
    
    // إعداد التحقق من العمر
    setupAgeValidation();
    
    // إعداد منطق المايك
    setupMicrophoneLogic();
    
    // إعداد التحقق من النموذج
    setupFormValidation();
}

// تحديث روابط السوشيال ميديا
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

// إعداد أحداث الأزرار
function setupEventListeners() {
    // زر تسجيل الدخول بـ Discord
    const discordLoginBtn = document.getElementById('discordLoginBtn');
    if (discordLoginBtn) {
        discordLoginBtn.addEventListener('click', function() {
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
    
    // نموذج التقديم
    const applicationForm = document.getElementById('staffApplicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            handleFormSubmission(e);
        });
    }
}

// ملء خيارات الأيام
function populateDayOptions() {
    const daySelect = document.getElementById('birthDay');
    if (daySelect) {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
}

// فحص حالة تسجيل الدخول
function checkAuthStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // فحص رسائل الخطأ أولاً
    const errorType = urlParams.get('error');
    if (errorType) {
        handleAuthError(errorType, urlParams);
        return;
    }
    
    // فحص بيانات المستخدم من URL
    const userData = urlParams.get('user');
    if (userData) {
        try {
            discordUser = JSON.parse(decodeURIComponent(userData));
            showUserInfo(discordUser);
            localStorage.setItem('discordUser', JSON.stringify(discordUser));
            
            // إزالة المعاملات من URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('خطأ في تحليل بيانات المستخدم:', error);
        }
        return;
    }
    
    // فحص التخزين المحلي
    const savedUser = localStorage.getItem('discordUser');
    if (savedUser) {
        try {
            discordUser = JSON.parse(savedUser);
            showUserInfo(discordUser);
        } catch (error) {
            localStorage.removeItem('discordUser');
        }
    }
}

// بدء عملية تسجيل الدخول بـ Discord (محدث لمعالجة JSON response) - v2
async function startDiscordAuth() {
    try {
        console.log('🔄 بدء عملية OAuth...');
        
        // الحصول على رابط التوثيق من الـ backend
        const response = await fetch(`${CONFIG.DISCORD_OAUTH_URL}?redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`);
        
        if (!response.ok) {
            throw new Error('فشل في الحصول على رابط التوثيق');
        }
        
        const result = await response.json();
        console.log('📥 استلام رد من الخادم:', result);
        
        if (result.success && result.authUrl) {
            console.log('✅ إعادة التوجيه إلى Discord');
            // إعادة التوجيه إلى Discord
            window.location.href = result.authUrl;
        } else {
            throw new Error(result.message || 'خطأ في التوثيق');
        }
    } catch (error) {
        console.error('❌ خطأ في بدء التوثيق:', error);
        showAlert('❌ حدث خطأ في بدء عملية تسجيل الدخول: ' + error.message, 'error');
    }
}

// عرض معلومات المستخدم
function showUserInfo(user) {
    // تحديث واجهة المستخدم
    const userName = document.getElementById('userName');
    const userTag = document.getElementById('userTag');
    const userId = document.getElementById('userId');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = user.global_name || user.display_name || user.username || 'غير معروف';
    if (userTag) userTag.textContent = `@${user.username}`;
    if (userId) userId.textContent = `ID: ${user.id}`;
    
    if (userAvatar) {
        const avatar = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
        userAvatar.src = avatar;
    }
    
    // إخفاء قسم تسجيل الدخول وإظهار النموذج
    const discordLogin = document.getElementById('discordLogin');
    const applicationForm = document.getElementById('applicationForm');
    
    if (discordLogin) discordLogin.style.display = 'none';
    if (applicationForm) applicationForm.style.display = 'block';
    
    // فحص حالة المستخدم
    checkUserApplicationStatus(user.id);
}

// فحص حالة طلب المستخدم
async function checkUserApplicationStatus(userId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/application-status/${userId}`);
        
        if (!response.ok) {
            throw new Error('فشل في الحصول على حالة الطلب');
        }
        
        const result = await response.json();
        
        if (!result.canApply) {
            // إخفاء النموذج وعرض رسالة الحالة
            const applicationForm = document.getElementById('applicationForm');
            if (applicationForm) applicationForm.style.display = 'none';
            
            showStatusMessage(result);
            
            // إذا كان الطلب معلق، ابدأ الفحص التلقائي
            if (result.reason === 'pending_application' && CONFIG.AUTO_REFRESH.enabled) {
                startStatusCheck();
            }
        } else if (result.lastApplication) {
            // عرض معلومات الطلب السابق
            showLastApplicationInfo(result.lastApplication);
        }
        
    } catch (error) {
        console.error('خطأ في فحص حالة الطلب:', error);
        // لا نظهر رسالة خطأ للمستخدم هنا لأنه قد يكون طلب جديد
    }
}

// عرض رسالة الحالة
function showStatusMessage(result) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    let statusHTML = '';
    let statusClass = '';

    // فحص حالة الطلب الأخير أولاً إذا كان موجوداً
    if (result.lastApplication && result.lastApplication.status) {
        switch (result.lastApplication.status) {
            case 'rejected':
                statusClass = 'status-rejected';
                const endDate = new Date(result.endDate).toLocaleDateString('en-GB');
                statusHTML = createStatusHTML(
                    statusClass,
                    '❌',
                    'طلب مرفوض',
                    [`تم رفض طلبك للانضمام لفريق الإدارة.`, `لا يمكنك التقديم مجدداً حتى: <strong>${endDate}</strong>`],
                    [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
                );
                break;
                
            case 'blacklisted':
                statusClass = 'status-blacklisted';
                statusHTML = createStatusHTML(
                    statusClass,
                    '🚫',
                    'محظور نهائياً',
                    ['تم إضافتك للبلاك ليست', 'لا يمكنك التقديم على الإدارة نهائياً.'],
                    [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
                );
                break;
                
            case 'accepted':
                statusClass = 'status-accepted';
                statusHTML = createStatusHTML(
                    statusClass,
                    '✅',
                    'تم قبول طلبك!',
                    ['تهانينا! تم قبولك في فريق الإدارة', 'ستتلقى تعليمات إضافية قريباً على Discord'],
                    [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
                );
                break;
                
            case 'pending':
                statusClass = 'status-pending';
                statusHTML = createStatusHTML(
                    statusClass,
                    '📋',
                    'طلب معلق',
                    [result.message || 'لديك طلب معلق بالفعل.', 'يرجى انتظار مراجعة طلبك الحالي قبل تقديم طلب جديد.', '<small>🔄 الصفحة تتحدث تلقائياً كل 30 ثانية للتحقق من حالة الطلب</small>'],
                    [
                        {icon: 'fa-sync-alt', text: 'تحديث الحالة الآن', href: '#', onclick: 'checkApplicationStatusManually()'},
                        {icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}
                    ]
                );
                break;
        }
    } else {
        // في حالة عدم وجود طلب، اعتمد على سبب المنع
        switch (result.reason) {
            case 'already_admin':
                statusClass = 'status-admin';
                statusHTML = createStatusHTML(
                    statusClass,
                    '👨‍💼',
                    'أنت إداري بالفعل!',
                    ['أنت إداري بالفعل ولا يمكنك التقديم', 'لا يمكن للإداريين الحاليين تقديم طلبات إدارية جديدة.'],
                    [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
                );
                break;
                
            case 'blacklisted':
                statusClass = 'status-blacklisted';
                statusHTML = createStatusHTML(
                    statusClass,
                    '🚫',
                    'محظور نهائياً',
                    ['تم إضافتك للبلاك ليست', 'لا يمكنك التقديم على الإدارة نهائياً.'],
                    [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
                );
                break;
                
            case 'temp_banned':
                statusClass = 'status-temp-banned';
                const endDate = new Date(result.endDate).toLocaleDateString('en-GB');
                statusHTML = createStatusHTML(
                    statusClass,
                    '⏰',
                    'منع مؤقت',
                    [result.message, `يمكنك التقديم مجدداً بعد انتهاء فترة المنع في: <strong>${endDate}</strong>`],
                    [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
                );
                break;
                
            case 'pending_application':
                statusClass = 'status-pending';
                statusHTML = createStatusHTML(
                    statusClass,
                    '📋',
                    'طلب معلق',
                    [result.message, 'يرجى انتظار مراجعة طلبك الحالي قبل تقديم طلب جديد.', '<small>🔄 الصفحة تتحدث تلقائياً كل 30 ثانية للتحقق من حالة الطلب</small>'],
                    [
                        {icon: 'fa-sync-alt', text: 'تحديث الحالة الآن', href: '#', onclick: 'checkApplicationStatusManually()'},
                        {icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}
                    ]
                );
                break;
        }
    }
    
    container.innerHTML = statusHTML;
}

// إنشاء HTML لرسالة الحالة
function createStatusHTML(statusClass, icon, title, messages, buttons) {
    const messagesHTML = messages.map(msg => `<p>${msg}</p>`).join('');
    const buttonsHTML = buttons.map(btn => 
        `<a href="${btn.href}" class="btn btn-primary" ${btn.onclick ? `onclick="${btn.onclick}"` : ''}>
            <i class="fas ${btn.icon}"></i> ${btn.text}
        </a>`
    ).join('');
    
    return `
        <div class="status-message ${statusClass}">
            <div class="status-icon">${icon}</div>
            <h2>${title}</h2>
            ${messagesHTML}
            <div style="margin-top: 2rem;">
                ${buttonsHTML}
            </div>
        </div>
    `;
}

// عرض معلومات الطلب السابق
function showLastApplicationInfo(application) {
    let statusText = '';
    let statusColor = '';
    let dateText = '';
    
    switch (application.status) {
        case 'accepted':
            statusText = 'مقبول ✅';
            statusColor = '#00ff00';
            dateText = application.reviewedAt ? `تاريخ القبول: ${new Date(application.reviewedAt).toLocaleDateString('en-GB')}` : '';
            break;
        case 'rejected':
            statusText = 'مرفوض ❌';
            statusColor = '#ff0000';
            dateText = application.reviewedAt ? `تاريخ الرفض: ${new Date(application.reviewedAt).toLocaleDateString('en-GB')}` : '';
            break;
        case 'blacklisted':
            statusText = 'بلاك ليست 🚫';
            statusColor = '#000000';
            dateText = application.reviewedAt ? `تاريخ البلاك ليست: ${new Date(application.reviewedAt).toLocaleDateString('en-GB')}` : '';
            break;
        case 'pending':
            statusText = 'معلق ⏳';
            statusColor = '#ffff00';
            dateText = `تاريخ التقديم: ${new Date(application.submittedAt).toLocaleDateString('en-GB')}`;
            break;
    }
    
    const infoHTML = `
        <div class="last-application-info" style="
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            border-left: 4px solid ${statusColor};
        ">
            <h3>📋 معلومات الطلب السابق</h3>
            <p><strong>رقم الطلب:</strong> ${application.id}</p>
            <p><strong>الحالة:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
            <p><strong>تاريخ التقديم:</strong> ${new Date(application.submittedAt).toLocaleDateString('en-GB')}</p>
            ${dateText ? `<p><strong>${dateText}</strong></p>` : ''}
        </div>
    `;
    
    const form = document.getElementById('applicationForm');
    if (form) {
        form.insertAdjacentHTML('afterbegin', infoHTML);
    }
}

// معالجة أخطاء التوثيق
function handleAuthError(errorType, urlParams) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    let errorHTML = '';
    
    switch (errorType) {
        case 'already_admin':
            errorHTML = createStatusHTML(
                'status-admin',
                '👨‍💼',
                'أنت إداري بالفعل!',
                ['أنت إداري بالفعل ولا يمكنك التقديم', 'لا يمكن للإداريين الحاليين تقديم طلبات إدارية جديدة.'],
                [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
            );
            break;
            
        case 'blacklisted':
            errorHTML = createStatusHTML(
                'status-blacklisted',
                '🚫',
                'محظور نهائياً',
                ['تم إضافتك للبلاك ليست', 'لا يمكنك التقديم على الإدارة نهائياً.'],
                [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
            );
            break;
            
        case 'temp_banned':
            const endDate = urlParams.get('endDate');
            const formattedDate = endDate ? new Date(endDate).toLocaleDateString('en-GB') : 'غير محدد';
            errorHTML = createStatusHTML(
                'status-temp-banned',
                '⏰',
                'منع مؤقت',
                [`أنت ممنوع من التقديم حتى: <strong>${formattedDate}</strong>`, 'يمكنك التقديم مجدداً بعد انتهاء فترة المنع.'],
                [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
            );
            break;
            
        case 'pending_application':
            const applicationId = urlParams.get('applicationId');
            errorHTML = createStatusHTML(
                'status-pending',
                '📋',
                'طلب معلق',
                [`لديك طلب معلق بالفعل برقم: <strong>${applicationId || 'غير محدد'}</strong>`, 'يرجى انتظار مراجعة طلبك الحالي قبل تقديم طلب جديد.'],
                [{icon: 'fa-home', text: 'العودة للصفحة الرئيسية', href: '#', onclick: 'goHome()'}]
            );
            break;
            
        case 'access_denied':
            errorHTML = createStatusHTML(
                'status-rejected',
                '❌',
                'تم رفض الوصول',
                ['تم إلغاء عملية تسجيل الدخول أو حدث خطأ في التوثيق.'],
                [{icon: 'fa-redo', text: 'المحاولة مجدداً', href: '#', onclick: 'location.reload()'}]
            );
            break;
            
        case 'oauth_error':
            errorHTML = createStatusHTML(
                'status-rejected',
                '⚠️',
                'خطأ في التوثيق',
                ['حدث خطأ أثناء تسجيل الدخول بـ Discord. يرجى المحاولة مجدداً.'],
                [{icon: 'fa-redo', text: 'المحاولة مجدداً', href: '#', onclick: 'location.reload()'}]
            );
            break;
            
        default:
            errorHTML = createStatusHTML(
                'status-rejected',
                '❓',
                'خطأ غير معروف',
                ['حدث خطأ غير متوقع. يرجى المحاولة مجدداً.'],
                [{icon: 'fa-redo', text: 'المحاولة مجدداً', href: '#', onclick: 'location.reload()'}]
            );
    }
    
    container.innerHTML = errorHTML;
    
    // إزالة المعاملات من URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// إعداد التحقق من العمر
function setupAgeValidation() {
    const birthYear = document.getElementById('birthYear');
    const birthMonth = document.getElementById('birthMonth');
    const birthDay = document.getElementById('birthDay');
    const ageWarning = document.getElementById('ageWarning');
    
    if (!birthYear || !birthMonth || !birthDay || !ageWarning) return;
    
    function checkAge() {
        const year = parseInt(birthYear.value);
        const month = parseInt(birthMonth.value);
        const day = parseInt(birthDay.value);
        
        if (year && month && day) {
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 13) {
                ageWarning.style.display = 'block';
                return false;
            } else {
                ageWarning.style.display = 'none';
                return true;
            }
        }
        
        ageWarning.style.display = 'none';
        return true;
    }
    
    birthYear.addEventListener('change', checkAge);
    birthMonth.addEventListener('change', checkAge);
    birthDay.addEventListener('change', checkAge);
    
    // إرفاق الدالة للنموذج
    window.checkAge = checkAge;
}

// إعداد منطق المايك
function setupMicrophoneLogic() {
    const hasMicCheckbox = document.getElementById('hasMic');
    const canTalkQuestion = document.getElementById('canTalkQuestion');
    
    if (!hasMicCheckbox || !canTalkQuestion) return;
    
    hasMicCheckbox.addEventListener('change', function() {
        if (this.checked) {
            canTalkQuestion.style.display = 'block';
        } else {
            canTalkQuestion.style.display = 'none';
            const canTalkCheckbox = document.getElementById('canTalk');
            if (canTalkCheckbox) canTalkCheckbox.checked = false;
        }
    });
}

// إعداد التحقق من النموذج
function setupFormValidation() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!submitBtn || checkboxes.length === 0) return;
    
    function updateSubmitButton() {
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        submitBtn.disabled = !allChecked;
    }
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSubmitButton);
    });
    
    // تحديث أولي
    updateSubmitButton();
}

// معالجة إرسال النموذج
async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!discordUser) {
        showAlert('❌ يجب تسجيل الدخول بـ Discord أولاً', 'error');
        return;
    }
    
    // فحص العمر قبل الإرسال
    if (window.checkAge && !window.checkAge()) {
        showAlert('❌ يجب أن تكون 13 سنة أو أكثر للتقديم', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
        // تحديث زر الإرسال
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitBtn.disabled = true;
        
        // جمع البيانات
        const formData = new FormData(e.target);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // إضافة بيانات المستخدم والمايك
        data.discordUser = discordUser;
        data.hasMic = document.getElementById('hasMic').checked;
        data.canTalk = document.getElementById('canTalk').checked;
        
        // حساب العمر
        const birthDate = new Date(data.birthYear, data.birthMonth - 1, data.birthDay);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        data.calculatedAge = age;
        
        // إرسال الطلب
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/submit-application`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'فشل في إرسال الطلب');
        }
        
        const result = await response.json();
        
        // حفظ معرف الطلب
        localStorage.setItem('lastApplicationId', result.applicationId);
        localStorage.setItem('lastApplicationDate', new Date().toISOString());
        
        // التوجه لصفحة النجاح
        window.location.href = 'success.html';
        
    } catch (error) {
        console.error('خطأ في إرسال الطلب:', error);
        showAlert('❌ ' + error.message, 'error');
        
        // استعادة زر الإرسال
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// تسجيل الخروج
function logout() {
    discordUser = null;
    localStorage.removeItem('discordUser');
    
    const discordLogin = document.getElementById('discordLogin');
    const applicationForm = document.getElementById('applicationForm');
    
    if (discordLogin) discordLogin.style.display = 'block';
    if (applicationForm) applicationForm.style.display = 'none';
    
    // إيقاف فحص الحالة التلقائي
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

// بدء فحص الحالة التلقائي
function startStatusCheck() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
    }
    
    statusCheckInterval = setInterval(async () => {
        if (discordUser) {
            await checkUserApplicationStatus(discordUser.id);
        }
    }, CONFIG.AUTO_REFRESH.interval);
}

// فحص حالة الطلب يدوياً
async function checkApplicationStatusManually() {
    if (!discordUser) {
        showAlert('❌ يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    
    try {
        await checkUserApplicationStatus(discordUser.id);
        showAlert('✅ تم تحديث الحالة', 'success');
    } catch (error) {
        showAlert('❌ فشل في تحديث الحالة', 'error');
    }
}

// العودة للصفحة الرئيسية
function goHome() {
    window.location.href = CONFIG.SOCIAL_LINKS.discord;
}

// عرض رسالة تنبيه
function showAlert(message, type = 'info') {
    // إنشاء عنصر التنبيه
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
    
    // إضافة التنبيه للصفحة
    document.body.appendChild(alert);
    
    // إزالة التنبيه بعد 5 ثوانٍ
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

// إضافة أنماط الرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// تصدير الوظائف للاستخدام العام
window.checkApplicationStatusManually = checkApplicationStatusManually;
window.goHome = goHome;
