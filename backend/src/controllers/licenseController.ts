// backend/src/controllers/licenseController.ts
import { Request, Response } from 'express';
import db from '../utils/db';

export const createLicense = async (req: Request, res: Response) => {
  try {
    console.log('🎯 Create License Request:', req.body);

    const { customer_id, license_type, seat_count, duration_years, username, pc_uuid } = req.body;

    if (!customer_id || !license_type || !seat_count) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_id, license_type, seat_count'
      });
    }

    // 🔧 التصحيح: استخدام customers
    const customer = await db('customers').where({ customer_id }).first();
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${customer_id} not found`
      });
    }

    const licenses = [];
    for (let i = 1; i <= seat_count; i++) {
      const licenseHash = 'LIC-' + Date.now() + '-' + i;
      
      const issueDate = new Date();
      const expirationDate = new Date();
      
      let yearsToAdd = 1;
      if (license_type === 'yearly') yearsToAdd = duration_years || 1;
      if (license_type === '3years') yearsToAdd = 3;
      if (license_type === 'floating') yearsToAdd = 100;
      
      expirationDate.setFullYear(expirationDate.getFullYear() + yearsToAdd);

      const licenseData = {
        customer_id,
        license_hash: licenseHash,
        seat_number: i,
        issue_date: issueDate.toISOString().split('T')[0],
        expiration_date: expirationDate.toISOString().split('T')[0],
        license_type,
        username: username || `user_${i}`,
        pc_uuid: pc_uuid || `pc_${Date.now()}_${i}`,
        is_free: 1,
        last_activity: new Date()
      };
      
      licenses.push(licenseData);
    }

    console.log('🚀 Inserting licenses...');
    // 🔧 التصحيح: استخدام licenses
    await db('licenses').insert(licenses);
    console.log('✅ Licenses inserted successfully');

    res.status(201).json({ 
      success: true,
      message: `Created ${seat_count} license(s) successfully`,
      data: licenses
    });

  } catch (error: any) {
    console.error('❌ Create license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create licenses: ' + error.message
    });
  }
};

export const getAllLicenses = async (req: Request, res: Response) => {
  try {
    // 🔧 التصحيح: استخدام licenses و customers
    const licenses = await db('licenses')
      .leftJoin('customers', 'licenses.customer_id', 'customers.customer_id')
      .select(
        'licenses.*',
        'customers.first_name as customer_first_name',
        'customers.last_name as customer_last_name',        'customers.email as customer_email',
        'customers.customer_type'
      );

    res.json({ 
      success: true,
      licenses 
    });
  } catch (error: any) {
    console.error('Get licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch licenses: ' + error.message
    });
  }
};