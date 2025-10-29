import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Tooltip,
  Paper,
  Grid,
} from '@mui/material';
import {
  Spa,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';

interface QuickBooking {
  id: number;
  name: string;
  service: {
    id: number;
    name: string;
    duration: number;
    price: number;
  };
  category: {
    id: number;
    name: string;
    hexcode: string;
    textcolor: string;
  };
}

interface QuickBookingButtonsProps {
  quickBookings: QuickBooking[];
  onQuickBooking: (serviceId: number) => void;
}

const QuickBookingButtons: React.FC<QuickBookingButtonsProps> = ({
  quickBookings,
  onQuickBooking,
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (quickBookings.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Spa sx={{ mr: 1, color: 'primary.main' }} />
        Quick Booking
      </Typography>
      
      <Grid container spacing={2}>
        {quickBookings.map((quickBooking) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={quickBooking.id}>
            <Tooltip title={`Click to book ${quickBooking.name}`}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  p: 2,
                  height: 'auto',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderColor: quickBooking.category.hexcode,
                  '&:hover': {
                    borderColor: quickBooking.category.hexcode,
                    backgroundColor: `${quickBooking.category.hexcode}20`,
                  },
                }}
                onClick={() => onQuickBooking(quickBooking.service.id)}
              >
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Chip
                    label={quickBooking.category.name}
                    size="small"
                    sx={{
                      backgroundColor: quickBooking.category.hexcode,
                      color: quickBooking.category.textcolor,
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: 'text.primary',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  {quickBooking.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, width: '100%' }}>
                  <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(quickBooking.service.duration)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(quickBooking.service.price)}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickBookingButtons;
