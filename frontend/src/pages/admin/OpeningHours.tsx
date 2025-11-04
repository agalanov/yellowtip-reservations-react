import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { WorkTimeDay } from '../../types';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const OpeningHours: React.FC = () => {
  const [workDays, setWorkDays] = useState<Array<{
    weekday: number;
    startTime: number;
    endTime: number;
    enabled: boolean;
  }>>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: openingHoursData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-opening-hours'],
    queryFn: () => apiService.getOpeningHours(),
  });

  useEffect(() => {
    if (openingHoursData) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const day = openingHoursData.find((d: WorkTimeDay) => d.weekday === i);
        return {
          weekday: i,
          startTime: day?.startTime || 28800, // 8:00 AM default
          endTime: day?.endTime || 64800, // 6:00 PM default
          enabled: !!day,
        };
      });
      setWorkDays(days);
      setHasChanges(false);
    }
  }, [openingHoursData]);

  const updateMutation = useMutation({
    mutationFn: (days: Array<{
      weekday: number;
      startTime: number;
      endTime: number;
      enabled: boolean;
    }>) => apiService.updateOpeningHours(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opening-hours'] });
      setHasChanges(false);
    },
  });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  };

  const handleDayToggle = (weekday: number, enabled: boolean): void => {
    setWorkDays(prev => {
      const updated = prev.map(day =>
        day.weekday === weekday ? { ...day, enabled } : day
      );
      setHasChanges(true);
      return updated;
    });
  };

  const handleTimeChange = (weekday: number, field: 'startTime' | 'endTime', value: string): void => {
    const seconds = parseTime(value);
    setWorkDays(prev => {
      const updated = prev.map(day =>
        day.weekday === weekday ? { ...day, [field]: seconds } : day
      );
      setHasChanges(true);
      return updated;
    });
  };

  const handleSubmit = (): void => {
    updateMutation.mutate(workDays);
  };

  const handleReset = (): void => {
    if (openingHoursData) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const day = openingHoursData.find((d: WorkTimeDay) => d.weekday === i);
        return {
          weekday: i,
          startTime: day?.startTime || 28800,
          endTime: day?.endTime || 64800,
          enabled: !!day,
        };
      });
      setWorkDays(days);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load opening hours
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Opening Hours</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {hasChanges && (
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={updateMutation.isPending}
            >
              Reset
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={!hasChanges || updateMutation.isPending}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {workDays.map((day) => (
              <Grid size={{ xs: 12 }} key={day.weekday}>
                <Card
                  variant="outlined"
                  sx={{
                    backgroundColor: day.enabled ? 'action.selected' : 'background.paper',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={day.enabled}
                            onChange={(e) => handleDayToggle(day.weekday, e.target.checked)}
                          />
                        }
                        label={
                          <Typography variant="h6" sx={{ minWidth: 120 }}>
                            {WEEKDAYS[day.weekday]}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <AccessTime sx={{ color: 'text.secondary' }} />
                        <TextField
                          label="Start Time"
                          type="time"
                          value={formatTime(day.startTime)}
                          onChange={(e) => handleTimeChange(day.weekday, 'startTime', e.target.value)}
                          disabled={!day.enabled}
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 minutes
                          }}
                        />
                        <Typography variant="body1" sx={{ mx: 1 }}>
                          to
                        </Typography>
                        <TextField
                          label="End Time"
                          type="time"
                          value={formatTime(day.endTime)}
                          onChange={(e) => handleTimeChange(day.weekday, 'endTime', e.target.value)}
                          disabled={!day.enabled}
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 minutes
                          }}
                        />
                        {day.enabled && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(day.endTime - day.startTime)} hours
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {hasChanges && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You have unsaved changes. Click "Save Changes" to apply them.
        </Alert>
      )}
    </Box>
  );
};

export default OpeningHours;


