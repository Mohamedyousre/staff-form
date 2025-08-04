# Staff Application System - Frontend

نظام طلبات الإدارة للسيرفرات العربية - واجهة المستخدم

## 🌟 المميزات

- ✅ تصميم حديث باستخدام Glassmorphism
- ✅ دعم كامل للغة العربية (RTL)
- ✅ تسجيل دخول بـ Discord OAuth
- ✅ نماذج تفاعلية مع التحقق المباشر
- ✅ تتبع حالة الطلبات في الوقت الفعلي
- ✅ تصميم متجاوب (Responsive)
- ✅ تحديث تلقائي للحالة
- ✅ نظام إشعارات متقدم

## 🚀 التشغيل المباشر

### GitHub Pages
الموقع متاح مباشرة على: `https://yourusername.github.io/staff-form`

### التشغيل المحلي
```bash
# تحميل الملفات
git clone https://github.com/yourusername/staff-form.git
cd staff-form

# تشغيل خادم محلي
python -m http.server 8000
# أو
npx serve .
```

## ⚙️ الإعدادات

### 1. تحديث ملف `js/config.js`

```javascript
const CONFIG = {
    // رابط Backend API
    API_BASE_URL: 'https://your-backend-url.com',
    
    // رابط Discord OAuth
    DISCORD_OAUTH_URL: 'https://your-backend-url.com/auth/discord',
    
    // روابط السوشيال ميديا
    SOCIAL_LINKS: {
        discord: 'https://discord.gg/your-server',
        github: 'https://github.com/yourusername'
    }
};
```

### 2. تخصيص التصميم
يمكنك تعديل الألوان والتصميم في `css/style.css`:

```css
/* الألوان الأساسية */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* لون الأزرار */
.btn-primary {
    background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
}
```

## 📁 هيكل المشروع

```
staff-form/
├── index.html          # الصفحة الرئيسية
├── success.html        # صفحة نجاح التقديم
├── status.html         # صفحة تتبع الحالة
├── css/
│   └── style.css       # أنماط CSS
├── js/
│   ├── config.js       # إعدادات المشروع
│   ├── app.js          # الصفحة الرئيسية
│   ├── success.js      # صفحة النجاح
│   └── status.js       # صفحة التتبع
├── assets/             # الصور والأيقونات
└── README.md          # هذا الملف
```

## 🔧 المميزات التقنية

### Discord OAuth Integration
- تسجيل دخول سلس بـ Discord
- حفظ بيانات المستخدم محلياً
- إدارة الجلسات بشكل آمن

### Form Validation
- التحقق من العمر (13+ سنة)
- التحقق من صحة البيانات
- رسائل خطأ واضحة باللغة العربية

### Real-time Status Tracking
- تحديث تلقائي كل 30 ثانية
- فحص حالة الطلبات فورياً
- إشعارات بتغيير الحالة

### Responsive Design
- يعمل على جميع الأجهزة
- تصميم متجاوب للموبايل
- تجربة مستخدم محسنة

## 🎨 واجهات المستخدم

### 1. صفحة التقديم (index.html)
- نموذج شامل للتقديم
- تسجيل دخول بـ Discord
- فحص حالة المستخدم

### 2. صفحة النجاح (success.html)
- تأكيد إرسال الطلب
- معلومات الطلب المرسل
- نصائح للمتقدم

### 3. صفحة التتبع (status.html)
- عرض جميع الطلبات
- تفاصيل كل طلب
- تحديث تلقائي للحالة

## 🔄 التحديث والصيانة

### تحديث الإعدادات
1. عدل `js/config.js` حسب احتياجاتك
2. ارفع التغييرات على GitHub
3. ستتحدث GitHub Pages تلقائياً

### إضافة مميزات جديدة
1. عدل الملفات المطلوبة
2. اختبر محلياً أولاً
3. ارفع التحديثات

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

**1. لا يعمل تسجيل الدخول:**
- تحقق من رابط Backend في `config.js`
- تأكد من عمل خادم Backend

**2. لا تظهر الطلبات:**
- تحقق من إعدادات API
- فحص وحدة التحكم للأخطاء

**3. مشاكل التصميم:**
- تأكد من تحميل ملف CSS
- فحص أخطاء الشبكة

## 📱 دعم المتصفحات

- Chrome (المفضل)
- Firefox
- Safari
- Edge
- Opera

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد
3. إجراء التغييرات
4. إرسال Pull Request

## 📞 الدعم

- Discord: [رابط السيرفر]
- GitHub Issues: [رابط المشاكل]
- Email: support@yourdomain.com

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

**تم تطويره بـ ❤️ لخدمة المجتمع العربي**
