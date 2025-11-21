console.log('🔑 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './utils/error';
import authRouter from './routes/auth';  // ✅ استيراد authRouter
import adminRouter from './routes/admin'; // ✅ استيراد adminRouter
import verificationRouter from './routes/verification';
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 استخدام الـ routers
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter); 
app.use('/api/auth', verificationRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(4000, () => {
  console.log('Server running on port 4000');
});