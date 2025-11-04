import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person,
  Category,
  AttachMoney,
  Language,
  AccessTime,
  Receipt,
  LocationOn,
  Settings,
  AdminPanelSettings,
  Security,
  Work,
  Public,
  LocationCity,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'User Management',
      icon: <Person />,
      items: [
        { text: 'User Accounts', path: '/admin/users', icon: <Person /> },
        { text: 'Roles & Permissions', path: '/admin/roles', icon: <Security /> },
        { text: 'Current Users', path: '/admin/current-users', icon: <AdminPanelSettings /> },
      ],
    },
    {
      title: 'System Settings',
      icon: <Settings />,
      items: [
        { text: 'System Configuration', path: '/admin/config', icon: <Settings /> },
        { text: 'Languages', path: '/admin/languages', icon: <Language /> },
      ],
    },
    {
      title: 'Regional Settings',
      icon: <LocationOn />,
      items: [
        { text: 'Countries', path: '/admin/countries', icon: <Public /> },
        { text: 'Cities', path: '/admin/cities', icon: <LocationCity /> },
      ],
    },
    {
      title: 'Business Settings',
      icon: <Work />,
      items: [
        { text: 'Categories', path: '/admin/categories', icon: <Category /> },
        { text: 'Currencies', path: '/admin/currencies', icon: <AttachMoney /> },
        { text: 'Taxes', path: '/admin/taxes', icon: <Receipt /> },
        { text: 'Opening Hours', path: '/admin/opening-hours', icon: <AccessTime /> },
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Administration</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage system settings, users, and business configurations
      </Typography>

      <Grid container spacing={3}>
        {adminSections.map((section, sectionIndex) => (
          <Grid item xs={12} md={4} key={sectionIndex}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      mr: 2,
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="h6">{section.title}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} disablePadding>
                      <Button
                        fullWidth
                        startIcon={item.icon}
                        onClick={() => navigate(item.path)}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          color: 'text.primary',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText primary={item.text} />
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Category />}
                  onClick={() => navigate('/admin/categories')}
                >
                  Manage Categories
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  onClick={() => navigate('/admin/currencies')}
                >
                  Manage Currencies
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate('/admin/config')}
                >
                  System Config
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => navigate('/admin/roles')}
                >
                  Roles & Permissions
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Public />}
                  onClick={() => navigate('/admin/countries')}
                >
                  Countries
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LocationCity />}
                  onClick={() => navigate('/admin/cities')}
                >
                  Cities
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Language />}
                  onClick={() => navigate('/admin/languages')}
                >
                  Languages
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => navigate('/admin/taxes')}
                >
                  Taxes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccessTime />}
                  onClick={() => navigate('/admin/opening-hours')}
                >
                  Opening Hours
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

