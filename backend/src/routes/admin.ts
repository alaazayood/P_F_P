// backend/src/routes/admin.ts
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth'; // ✅ التصحيح هنا
import { 
  createLicense, 
  getAllLicenses 
} from '../controllers/licenseController';

const adminRouter = Router();

// 🔹 مسارات إدارة التراخيص
adminRouter.post('/licenses', requireAuth(['admin']), createLicense);
adminRouter.get('/licenses', requireAuth(['admin']), getAllLicenses);

// 🔹 مسار التحقق من الصلاحيات
adminRouter.get('/ping', requireAuth(['admin']), (req, res) => {
  res.json({ ok: true, scope: 'admin' });
});

export default adminRouter;