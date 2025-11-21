// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  VpnKey as LicenseIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store'; 
import { licenseService } from '../services/licenseService';

interface DashboardStats {
  totalLicenses: number;
  activeLicenses: number;
  totalCustomers: number;
  recentActivity: number;
}

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalLicenses: 0,
    activeLicenses: 0,
    totalCustomers: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔧 إصلاح: جلب البيانات الحقيقية من الـ API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // جلب التراخيص الحقيقية
      const licenses = await licenseService.getAllLicenses();
      
      // حساب الإحصائيات الحقيقية
      const totalLicenses = licenses.length;
      const activeLicenses = licenses.filter(license => 
        new Date(license.expiration_date) > new Date()
      ).length;
      
      // حساب العملاء الفريدين
      const uniqueCustomers = new Set(licenses.map(license => license.customer_id)).size;
      
      // النشاط الحديث (آخر 7 أيام)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentActivity = licenses.filter(license => 
        new Date(license.issue_date) > weekAgo
      ).length;

      setStats({
        totalLicenses,
        activeLicenses,
        totalCustomers: uniqueCustomers,
        recentActivity
      });

    } catch (err: any) {
      console.error('Dashboard data error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        border: `1px solid ${color}20`,
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.first_name} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your licenses today.
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          variant="outlined"
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Grid Layout */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: user?.role === 'admin' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        <Box>
          <StatCard 
            title="Total Licenses" 
            value={stats.totalLicenses} 
            icon={<LicenseIcon sx={{ fontSize: 40 }} />}
            color="#667eea"
          />
        </Box>
        
        <Box>
          <StatCard 
            title="Active Licenses" 
            value={stats.activeLicenses} 
            icon={<TrendingIcon sx={{ fontSize: 40 }} />}
            color="#48bb78"
          />
        </Box>

        {user?.role === 'admin' && (
          <Box>
            <StatCard 
              title="Total Customers" 
              value={stats.totalCustomers} 
              icon={<PeopleIcon sx={{ fontSize: 40 }} />}
              color="#ed8936"
            />
          </Box>
        )}

        <Box>
          <StatCard 
            title="Recent Activity" 
            value={stats.recentActivity} 
            icon={<DashboardIcon sx={{ fontSize: 40 }} />}
            color="#9f7aea"
          />
        </Box>
      </Box>

      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Manage your license portfolio<br/>
          • View customer information<br/>
          • Generate usage reports<br/>
          • Update account settings
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;