
## 📄 **5. ملف: documentation/SETUP_GUIDE.md**

```markdown
# دليل الإعداد والتشغيل

## ⚙️ متطلبات النظام
- Node.js 16+
- MySQL 5.7+
- npm أو yarn

## 🚀 خطوات التشغيل

### 1. إعداد الـ Backend
```bash
cd backend
npm install
cp .env.example .env
# تعديل متغيرات البيئة في .env
npm run dev
2. إعداد الـ Frontend
bash
cd frontend
npm install
cp .env.example .env
# تعديل متغيرات البيئة في .env
npm start
3. إعداد قاعدة البيانات
sql
CREATE DATABASE powerflow;
USE powerflow;
# تشغيل جداول التهيئة من ملف database_schema.md
🔧 متغيرات البيئة
Backend (.env)
env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=powerflow
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=re_your_api_key
Frontend (.env)
env
REACT_APP_API_URL=http://localhost:4000/api
text

## 📄 **6. ملف: documentation/DEPLOYMENT.md**

```markdown
# دليل النشر

## 🌐 النشر على Production

### Backend (Node.js)
```bash
npm run build
npm start
Frontend (React)
bash
npm run build
# رفع مجلد build إلى خادم ويب
🔒 إعدادات الأمان للإنتاج
تغيير JWT_SECRET

استخدام HTTPS

إعداد CORS للدومين الصحيح

مراقبة السجلات