// frontend/src/services/licenseService.ts
import api from './api';

export const licenseService = {
  getAllLicenses: async (): Promise<any[]> => {
    const response = await api.get('/admin/licenses');
    return response.data.licenses;
  },

  createLicense: async (licenseData: {
    customer_id: number;
    license_type: string;
    seat_count: number;
    duration_years?: number;
    username?: string;
    pc_uuid?: string;
  }): Promise<any> => {
    const response = await api.post('/admin/licenses', licenseData);
    return response.data;
  }
};