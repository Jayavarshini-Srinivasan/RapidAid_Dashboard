import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalCompleted: 0, completedToday: 0 });

  useEffect(() => {
    loadStats();
    if (isOnDuty) {
      startLocationTracking();
    }
  }, [isOnDuty]);

  const loadStats = async () => {
    try {
      const response = await api.get('/driver/stats');
      if (response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleDuty = async () => {
    setLoading(true);
    try {
      const newStatus = !isOnDuty;
      await api.post('/driver/duty/toggle', { isOnDuty: newStatus });
      setIsOnDuty(newStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update duty status');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Location permission required');
      return;
    }

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        await setDoc(doc(db, 'liveLocations', user.uid), {
          driverId: user.uid,
          latitude,
          longitude,
          timestamp: new Date(),
        });
        await api.post('/driver/location', { latitude, longitude });
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCompleted}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.dutyButton, isOnDuty && styles.dutyButtonActive]}
        onPress={toggleDuty}
        disabled={loading}
      >
        <Text style={styles.dutyButtonText}>
          {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AssignedRequests')}
      >
        <Text style={styles.buttonText}>View Requests</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A6CF1',
    marginTop: 20,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A6CF1',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  dutyButton: {
    backgroundColor: '#6B7280',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  dutyButtonActive: {
    backgroundColor: '#10B981',
  },
  dutyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0A6CF1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

