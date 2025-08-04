// إعدادات المشروع
const CONFIG = {
    // رابط Backend API
    API_BASE_URL: 'https://staff-backend-y2f4.onrender.com/api',
    
    // رابط الـ Discord OAuth
    DISCORD_OAUTH_URL: 'https://staff-backend-y2f4.onrender.com/api/auth/oauth',
    
    // معرف التطبيق Discord
    DISCORD_CLIENT_ID: '389756771780001792',
    
    // إعدادات المشروع
    PROJECT: {
        name: 'Al-Badiya System',
        description: 'نظام إدارة طلبات الموظفين',
        version: '1.0.0'
    },
    
    // روابط السوشيال ميديا
    SOCIAL_LINKS: {
        discord: 'https://discord.gg/YOUR_SERVER',
        github: 'https://github.com/Mohamedyousre'
    },
    
    // إعدادات التحديث التلقائي
    AUTO_REFRESH: {
        enabled: true,
        interval: 30000 // 30 ثانية
    },
    
    // رسائل النظام
    MESSAGES: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ غير متوقع',
        success: 'تم بنجاح!',
        unauthorized: 'يجب تسجيل الدخول أولاً'
    }
};

// تحديث الروابط في حالة التطوير المحلي
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    CONFIG.API_BASE_URL = 'http://localhost:3000';
    CONFIG.DISCORD_OAUTH_URL = 'http://localhost:3000/auth/discord';
}

// تصدير الإعدادات
window.CONFIG = CONFIG;
