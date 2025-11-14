import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {adminSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
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
          </Box>
        ))}
      </Box>

      {/* Quick Stats */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Category />}
                  onClick={() => navigate('/admin/categories')}
                >
                  Manage Categories
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  onClick={() => navigate('/admin/currencies')}
                >
                  Manage Currencies
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate('/admin/config')}
                >
                  System Config
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => navigate('/admin/roles')}
                >
                  Roles & Permissions
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Public />}
                  onClick={() => navigate('/admin/countries')}
                >
                  Countries
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LocationCity />}
                  onClick={() => navigate('/admin/cities')}
                >
                  Cities
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Language />}
                  onClick={() => navigate('/admin/languages')}
                >
                  Languages
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => navigate('/admin/taxes')}
                >
                  Taxes
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccessTime />}
                  onClick={() => navigate('/admin/opening-hours')}
                >
                  Opening Hours
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

