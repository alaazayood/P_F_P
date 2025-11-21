// backend/src/controllers/verificationController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/error';
import db from '../utils/db';
import { 
  generateVerificationCode, 
  sendVerificationCode,
  validateVerificationCode 
} from '../utils/verification';

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4, "Verification code must be 4 digits")
});

const resendCodeSchema = z.object({
  email: z.string().email()
});

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = verifyCodeSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    // البحث عن المستخدم
    const user = await db('users')
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // التحقق إذا كان المستخدم مفعل أصلاً
    if (user.is_verified) {
      throw new ApiError(400, 'Account is already verified');
    }

    // التحقق من وجود كود تحقق
    if (!user.verification_code || !user.verification_code_expires) {
      throw new ApiError(400, 'No verification code found. Please request a new one.');
    }

    // التحقق من صحة الكود
    const isValid = validateVerificationCode(
      code,
      user.verification_code,
      new Date(user.verification_code_expires)
    );

    if (!isValid) {
      // زيادة عدد محاولات التحقق الفاشلة
      await db('users')
        .where({ email: normalizedEmail })
        .increment('verification_attempts', 1);

      throw new ApiError(400, 'Invalid or expired verification code');
    }

    // تفعيل الحساب
    await db('users')
      .where({ email: normalizedEmail })
      .update({
        is_verified: true,
        verification_code: null,
        verification_code_expires: null,
        verification_attempts: 0
      });

    res.json({
      success: true,
      message: 'Account verified successfully! You can now login.'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new ApiError(400, `Invalid input: ${errorMessage}`);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Verification failed');
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = resendCodeSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    // البحث عن المستخدم
    const user = await db('users')
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // التحقق إذا كان المستخدم مفعل أصلاً
    if (user.is_verified) {
      throw new ApiError(400, 'Account is already verified');
    }

    // التحقق من الوقت بين إعادة الإرسال (منع spam)
    const lastSent = user.last_verification_sent;
    const now = new Date();
    if (lastSent && (now.getTime() - new Date(lastSent).getTime()) < 60000) {
      throw new ApiError(429, 'Please wait 1 minute before requesting a new code');
    }

    // توليد كود جديد
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة

    // تحديث المستخدم بالكود الجديد
    await db('users')
      .where({ email: normalizedEmail })
      .update({
        verification_code: verificationCode,
        verification_code_expires: expiresAt,
        last_verification_sent: new Date(),
        verification_attempts: 0
      });

    // إرسال الكود
    await sendVerificationCode(normalizedEmail, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent successfully!'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new ApiError(400, `Invalid input: ${errorMessage}`);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to resend verification code');
  }
};