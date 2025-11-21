// backend/src/controllers/authController.ts - الإصدار النهائي
import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/error';
import db from '../utils/db';
import { generateVerificationCode, sendVerificationCode } from '../utils/verification';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  customer_type: z.enum(['company', 'individual']),
  role: z.enum(['admin', 'user', 'owner']).default('user'),
  company_name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const register = async (req: Request, res: Response) => {
  const trx = await db.transaction();
  
  try {
    const { email, password, first_name, last_name, phone, customer_type, role, company_name } = registerSchema.parse(req.body);

    const normalizedEmail = email.toLowerCase();

    // التحقق من وجود المستخدم مسبقاً
    const existingUser = await trx('users').where({ email: normalizedEmail }).first();
    if (existingUser) {
      throw new ApiError(409, 'User already exists');
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 12);

    // إنشاء العميل أولاً
    const customerData: any = {
      email: normalizedEmail,
      first_name,
      last_name,
      phone,
      customer_type,
      registration_date: new Date()
    };

    // إضافة company_name إذا كانت company
    if (customer_type === 'company' && company_name) {
      customerData.company_name = company_name;
    }

    const [customerId] = await trx('customers').insert(customerData);

    // توليد كود التحقق
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة

    // إنشاء المستخدم
    const [userId] = await trx('users').insert({
      customer_id: customerId,
      email: normalizedEmail,
      password_hash: passwordHash,
      first_name,
      last_name,
      role,
      is_verified: false,
      verification_code: verificationCode,
      verification_code_expires: expiresAt,
      is_active: true
    });


    // إرسال كود التحقق
    await sendVerificationCode(normalizedEmail, verificationCode);
    await trx.commit();

    res.json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      email: normalizedEmail,
      next_step: 'verification'
    });

  } catch (error) {
    await trx.rollback();
    
    // 🔥 إضافة log لرؤية الخطأ الحقيقي
    console.error('🔴 Register Error:', error);
    
    if (error instanceof z.ZodError) {
      throw new ApiError(400, 'Invalid input data');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Registration failed');
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const normalizedEmail = email.toLowerCase();

    // البحث عن المستخدم
    const user = await db('users')
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // التحقق من تفعيل الحساب
    if (!user.is_verified) {
      throw new ApiError(403, 'Please verify your email first');
    }

    // التحقق من حالة الحساب
    if (!user.is_active) {
      throw new ApiError(403, 'Account is deactivated');
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // إنشاء التوكن
    const token = signToken({
      sub: user.user_id,
      role: user.role,
      email: user.email,
      customer_id: user.customer_id
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        customer_id: user.customer_id
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, 'Invalid email or password format');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Login failed');
  }
};

// 🔥 التصدير النهائي
export { register, login };