# نظام إدارة المدرسة

نظام متكامل لإدارة المدرسة يتضمن إدارة الطلاب، المعلمين، الدرجات، الحضور، والواجبات المدرسية.

## المميزات

- واجهة مستخدم سهلة الاستخدام باللغة العربية
- نظام تسجيل دخول متعدد الأدوار (مدير، معلم، طالب، ولي أمر)
- إدارة الطلاب والمعلمين
- تسجيل الدرجات والتقييمات
- متابعة الحضور والانصراف
- نظام الواجبات المدرسية
- تقارير ورسوم بيانية
- تصدير البيانات بصيغة PDF و Excel

## المتطلبات

- Node.js 14.x أو أحدث
- MongoDB 4.4 أو أحدث
- npm 6.x أو أحدث

## التثبيت

1. استنساخ المستودع:
   ```bash
   git clone [رابط المستودع]
   cd school-management-system
   ```

2. تثبيت حزم npm:
   ```bash
   npm install
   ```

3. إنشاء ملف `.env` في المجلد الرئيسي وإضافة المتغيرات التالية:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/school_management
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   DEFAULT_ADMIN_EMAIL=admin@school.edu
   DEFAULT_ADMIN_PASSWORD=admin123
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=School Management System <noreply@school.edu>
   ```

4. تشغيل الخادم في وضع التطوير:
   ```bash
   npm run dev
   ```

5. لملء قاعدة البيانات ببيانات تجريبية:
   ```bash
   node seed
   ```

## الأوامر المتاحة

- `npm start` - تشغيل الخادم في وضع الإنتاج
- `npm run dev` - تشغيل الخادم في وضع التطوير مع إعادة تحميل تلقائي
- `node seed` - ملء قاعدة البيانات ببيانات تجريبية
- `node seed -d` - حذف جميع البيانات من قاعدة البيانات

## هيكل المشروع

```
school-management-system/
├── config/               # إعدادات التكوين
├── controllers/          # معالجات الطلبات (MVC)
├── middleware/           # وسائط Express
├── models/               # نماذج Mongoose
├── public/               # الملفات الثابتة (الصور، CSS، JS)
│   ├── uploads/         # الملفات المرفوعة
│   └── img/             # الصور
├── routes/               # مسارات التطبيق
├── utils/                # أدوات مساعدة
├── views/                # قوالب العرض (Pug)
├── .env                  # متغيرات البيئة
├── .gitignore            # الملفات المستثناة من git
├── package.json          # تبعيات المشروع
├── README.md             # وثيقة المشروع
└── server.js             # نقطة الدخول للتطبيق
```

## الأدوار والصلاحيات

### المدير (Admin)
- إدارة جميع المستخدمين (إضافة، تعديل، حذف)
- إدارة الفصول والمواد الدراسية
- عرض جميع التقارير والإحصائيات
- إعدادات النظام

### المعلم (Teacher)
- إضافة وتعديل الدرجات للطلاب
- رفع الواجبات والمهام
- تسجيل الحضور والانصراف
- عرض تقارير الطلاب

### الطالب (Student)
- عرض جدول الحصص
- عرض الدرجات والتقييمات
- تحميل وتقديم الواجبات
- متابعة الحضور

### ولي الأمر (Parent)
- متابعة درجات الأبناء
- متابعة الحضور والانصراف
- التواصل مع المعلمين

## API التوثيق

يتم توثيق واجهة برمجة التطبيقات (API) باستخدام Swagger. يمكن الوصول إلى التوثيق على:

```
http://localhost:3000/api-docs
```

## الترخيص

هذا المشروع مرخص تحت [رخصة MIT](LICENSE).

## المساهمة

1. قم بعمل Fork للمشروع
2. قم بإنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. قبح بإضافة التغييرات (`git add .`)
4. قم بحفظ التغييرات (`git commit -m 'Add some AmazingFeature'`)
5. قم بدفع التغييرات إلى الفرع (`git push origin feature/AmazingFeature`)
6. افتح طلب سحب (Pull Request)

## الدعم

لأي استفسارات أو مساعدة، يرجى التواصل عبر البريد الإلكتروني: support@school.edu
