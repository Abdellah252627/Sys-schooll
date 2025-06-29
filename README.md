# نظام إدارة المدارس

![School Management System](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

نظام متكامل لإدارة المدارس يوفر حلاً شاملاً لإدارة الطلاب، المعلمين، الفصول الدراسية، الواجبات، والدرجات.

## 🌟 المميزات الرئيسية

- 👥 إدارة متكاملة للمستخدمين (طلاب، معلمين، أولياء أمور)
- 📊 نظام متقدم للحضور والانصراف
- 📝 إدارة الواجبات وتقييم الطلاب
- 📅 جدول حصص تفاعلي
- 📊 لوحة تحكم إحصائية متكاملة
- 🎨 واجهة مستخدم عربية كاملة
- 📱 متجاوب مع جميع الأجهزة
- 🔒 نظام صلاحيات متعدد المستويات

## ⚡ البدء السريع

### المتطلبات الأساسية
- Node.js 14.x أو أحدث
- npm 6.x أو أحدث
- SQLite (مضمن مع النظام)

### التثبيت
```bash
# استنساخ المستودع
git clone https://github.com/Abdellah252627/Sys-school.git
cd Sys-school

# تثبيت التبعيات
npm install

# تهيئة قاعدة البيانات
node db/init.js

# تشغيل التطبيق
npm start
```

🔍 **للحصول على دليل التثبيت التفصيلي**، يرجى مراجعة ملف [INSTALLATION.md](INSTALLATION.md)

## 📚 الوثائق

- [دليل التثبيت](INSTALLATION.md) - تعليمات التثبيت والتهيئة
- [دليل المستخدم](docs/USER_GUIDE.md) - كيفية استخدام النظام
- [دليل المطور](docs/DEVELOPER_GUIDE.md) - إرشادات التطوير والمساهمة

## 🛠️ هيكل المشروع

```
school-management-system/
├── config/          # إعدادات التطبيق
├── controllers/     # معالجات الطلبات
├── db/              # ملفات قاعدة البيانات
├── middleware/      # وسائط Express
├── models/          # نماذج البيانات
├── public/          # ملفات ثابتة
│   ├── css/        # أنماط CSS
│   ├── js/         # سكريبتات الجافاسكريبت
│   ├── uploads/    # الملفات المرفوعة
│   └── img/        # الصور
├── routes/          # مسارات التطبيق
├── utils/           # أدوات مساعدة
└── views/           # قوالب العرض (Pug)
```

## 👨‍💻 الأدوار والصلاحيات

### 🎓 المدير (Admin)
- إدارة كاملة للنظام والمستخدمين
- إعدادات النظام العامة
- التقارير والإحصائيات الشاملة

### 👨‍🏫 المعلم (Teacher)
- إدارة الفصول والمواد الدراسية
- تقييم الطلاب وإدخال الدرجات
- متابعة الحضور والانصراف
- إدارة الواجبات والاختبارات

### 👨‍🎓 الطالب (Student)
- عرض الجدول الدراسي
- متابعة الدرجات والتقييمات
- تحميل وتقديم الواجبات
- متابعة الحضور

## 🤝 المساهمة

نرحب بمساهماتكم! لبدء المساهمة:

1. قم بعمل Fork للمشروع
2. أنشئ فرعاً جديداً (`git checkout -b feature/feature-name`)
3. قم بحفظ التغييرات (`git commit -m 'Add some feature'`)
4. ادفع التغييرات إلى الفرع (`git push origin feature/feature-name`)
5. افتح طلب سحب (Pull Request)

## 📄 الترخيص

هذا المشروع مرخص تحت [رخصة MIT](LICENSE).

## 📞 الدعم

لأي استفسارات أو مساعدة:
- افتح [issue جديد](https://github.com/Abdellah252627/Sys-school/issues)
- أو تواصل معنا عبر البريد الإلكتروني: support@schoolsys.com

---

تم التطوير بواسطة [Abdellah](https://github.com/Abdellah252627) - 2025
