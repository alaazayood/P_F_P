// frontend/src/pages/LicensesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { licenseService } from '../services/licenseService';

const LicensesPage: React.FC = () => {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      setError('');
      const licensesData = await licenseService.getAllLicenses();
      setLicenses(licensesData);
    } catch (err) {
      setError('Failed to load licenses');
      console.error('Error fetching licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLicense = async () => {
    try {
      setError('');
      
      // 🔧 الحصول على customer_id من المستخدم المسجل
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please login first');
        return;
      }
      
      const user = JSON.parse(userData);
      const customer_id = user.customer_id;

      if (!customer_id) {
        setError('Customer information not found');
        return;
      }

      await licenseService.createLicense({
        customer_id: customer_id, // استخدام الـ ID الحقيقي
        license_type: 'yearly',
        seat_count: 1
      });
      
      fetchLicenses();
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create license');
      console.error('Error creating license:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        License Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={createLicense} sx={{ mb: 3 }}>
        Create New License
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>License ID</TableCell>
              <TableCell>License Hash</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Expiration</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.license_id}>
                <TableCell>{license.license_id}</TableCell>
                <TableCell>{license.license_hash}</TableCell>
<TableCell>{license.customer_first_name} {license.customer_last_name}</TableCell>                <TableCell>{license.license_type}</TableCell>
                <TableCell>{license.expiration_date}</TableCell>
                <TableCell>{license.is_free ? 'Free' : 'In Use'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LicensesPage;