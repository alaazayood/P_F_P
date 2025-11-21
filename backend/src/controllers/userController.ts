import { Request, Response } from 'express';
import { ApiError } from '../utils/error';
import knex from '../utils/db';
import { z } from 'zod';
import { hashPassword } from '../utils/password';

const createUserSchema = z.object({
  company_id: z.number(),
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user']).default('user')
});

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const passwordHash = await hashPassword(userData.password);
    
    const [userId] = await knex('users').insert({
      ...userData,
      password_hash: passwordHash
    });
    
    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      user_id: userId
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to create user');
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await knex('users')
      .join('companies', 'users.company_id', 'companies.company_id')
      .select('users.*', 'companies.name as company_name');
    res.json({ users });
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch users');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const deleted = await knex('users').where({ user_id: userId }).delete();
    
    if (!deleted) {
      throw new ApiError(404, 'User not found');
    }
    
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    throw new ApiError(500, 'Failed to delete user');
  }
};