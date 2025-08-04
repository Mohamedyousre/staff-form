# دليل النشر - نظام طلبات الإدارة

## هيكل المشروع النهائي

```
staff-application-system/
├── frontend/ (Mohamedyousre/staff-form)
│   ├── index.html
│   ├── success.html
│   ├── status.html
│   ├── style.css
│   ├── app.js
│   ├── config.js
│   ├── success.js
│   └── status.js
└── backend/ (Mohamedyousre/staff-backend)
    ├── config/
    ├── middleware/
    ├── routes/
    ├── scripts/
    ├── server-new.js
    ├── package-new.json
    └── .env.example
```

## خطوات النشر

### 1. إعداد Frontend Repository

#### إنشاء المستودع
```bash
# إنشاء مستودع جديد على GitHub
# اسم المستودع: staff-form
# Owner: Mohamedyousre
```

#### رفع ملفات Frontend
```bash
cd frontend/
git init
git add .
git commit -m "Initial frontend setup"
git branch -M main
git remote add origin https://github.com/Mohamedyousre/staff-form.git
git push -u origin main
```

#### تفعيل GitHub Pages
1. اذهب إلى Settings > Pages
2. اختر Source: Deploy from a branch
3. اختر Branch: main
4. اختر Folder: / (root)
5. احفظ الإعدادات

URL النهائي: `https://mohamedyousre.github.io/staff-form`

### 2. إعداد Backend Repository

#### إنشاء المستودع
```bash
# إنشاء مستودع جديد على GitHub
# اسم المستودع: staff-backend  
# Owner: Mohamedyousre
```

#### رفع ملفات Backend
```bash
cd backend/
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/Mohamedyousre/staff-backend.git
git push -u origin main
```

### 3. نشر Backend على Railway

#### إعداد الحساب
1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول باستخدام GitHub
3. اربط حسابك مع GitHub

#### إنشاء مشروع جديد
1. اضغط على "New Project"
2. اختر "Deploy from GitHub repo"
3. اختر `Mohamedyousre/staff-backend`
4. اضغط "Deploy Now"

#### إعداد متغيرات البيئة
في لوحة تحكم Railway، اذهب إلى Variables وأضف:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://mohamedyousre.github.io/staff-form

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://your-railway-app.railway.app/api/auth/callback
DISCORD_BOT_TOKEN=your_discord_bot_token

# Server Configuration
DISCORD_GUILD_ID=1320175648974569574
ADMIN_CHANNEL_ID=1393760285305562
LOGS_CHANNEL_ID=1320175660723077140
ADMIN_ROLES=role1,role2,role3

# Security
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
SESSION_SECRET=your-session-secret-key-here-min-32-chars

# Optional
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

#### الحصول على URL الخادم
بعد النشر، ستحصل على URL مثل:
`https://staff-backend-production.railway.app`

### 4. إعداد Discord Application

#### إنشاء Discord App
1. اذهب إلى [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط "New Application"
3. أدخل اسم التطبيق: "AS System Staff Application"
4. احفظ التطبيق

#### إعداد OAuth2
1. اذهب إلى OAuth2 > General
2. أضف Redirect URL:
   ```
   https://your-railway-app.railway.app/api/auth/callback
   ```
3. انسخ Client ID و Client Secret

#### إعداد Bot
1. اذهب إلى Bot
2. اضغط "Add Bot"
3. فعل "Message Content Intent"
4. انسخ Bot Token

#### إضافة البوت للخادم
1. اذهب إلى OAuth2 > URL Generator
2. اختر Scopes: `bot`, `applications.commands`
3. اختر Bot Permissions: `Administrator` (أو الصلاحيات المطلوبة)
4. انسخ الرابط وافتحه لإضافة البوت

### 5. تحديث Frontend Configuration

بعد الحصول على URL الخادم، حدث `config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-railway-app.railway.app/api',
    FRONTEND_URL: 'https://mohamedyousre.github.io/staff-form',
    // ... باقي الإعدادات
};
```

ثم ارفع التحديث:
```bash
git add config.js
git commit -m "Update API URL"
git push
```

### 6. اختبار النظام

#### اختبارات Frontend
1. افتح `https://mohamedyousre.github.io/staff-form`
2. تأكد من تحميل الصفحة بشكل صحيح
3. جرب تسجيل الدخول بـ Discord

#### اختبارات Backend
1. افتح `https://your-railway-app.railway.app/health`
2. تأكد من استجابة الخادم
3. تحقق من السجلات في Railway

#### اختبار تكامل كامل
1. سجل دخول عبر Discord
2. املأ نموذج التطبيق
3. تأكد من وصول الإشعار للإدارة
4. جرب تحديث حالة الطلب

### 7. مراقبة ومتابعة

#### مراقبة Railway
- راقب استخدام الموارد
- تحقق من السجلات بانتظام
- اعرف حدود الخطة المجانية

#### نسخ احتياطية
```bash
# نسخة احتياطية يدوية من قاعدة البيانات
curl https://your-railway-app.railway.app/api/admin/backup
```

#### تحديثات النظام
```bash
# تحديث Backend
git add .
git commit -m "Update: description"
git push

# تحديث Frontend  
git add .
git commit -m "Update: description"
git push
```

## إعدادات أمان إضافية

### 1. متغيرات البيئة الآمنة
- استخدم كلمات مرور قوية لـ JWT_SECRET
- لا تشارك الـ tokens أبداً
- فعل 2FA على حساب Discord

### 2. حماية الخادم
- فعل HTTPS فقط
- راقب معدل الطلبات
- اعرف عناوين IP المشبوهة

### 3. صلاحيات Discord
- أعط أقل صلاحيات ممكنة للبوت
- راجع أدوار الإدارة بانتظام
- راقب النشاطات المشبوهة

## استكشاف الأخطاء الشائعة

### خطأ CORS
```javascript
// تأكد من إضافة domain الصحيح في Backend
origin: ['https://mohamedyousre.github.io']
```

### خطأ OAuth
```javascript
// تأكد من صحة Redirect URI في Discord App
DISCORD_REDIRECT_URI=https://your-exact-railway-url.railway.app/api/auth/callback
```

### مشاكل قاعدة البيانات
```bash
# إعادة تهيئة قاعدة البيانات في Railway
npm run db:init
```

### مشاكل الذاكرة
```javascript
// تحسين استعلامات قاعدة البيانات
// استخدام pagination للبيانات الكبيرة
```

## خطة الصيانة

### يومياً
- [ ] فحص السجلات
- [ ] مراقبة الأداء
- [ ] تحقق من الطلبات الجديدة

### أسبوعياً  
- [ ] نسخة احتياطية من قاعدة البيانات
- [ ] مراجعة الإحصائيات
- [ ] تحديث التوثيق

### شهرياً
- [ ] مراجعة أمان النظام
- [ ] تحديث الحزم والمكتبات
- [ ] تحليل الأداء والتحسينات

## جهات الاتصال للدعم

- **GitHub Issues**: للمشاكل التقنية
- **Discord Server**: للدعم المباشر
- **Email**: للمسائل الحساسة

## روابط مهمة

- Frontend: `https://mohamedyousre.github.io/staff-form`
- Backend: `https://your-railway-app.railway.app`
- Discord App: Discord Developer Portal
- Railway Dashboard: railway.app
- Documentation: GitHub Wiki
