import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import api from '../services/api';

export default function TrackAmbulanceScreen() {
  const [emergency, setEmergency] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergency();
  }, []);

  const loadEmergency = async () => {
    try {
      const response = await api.get('/patient/emergency');
      if (response.data.data) {
        setEmergency(response.data.data);
        if (response.data.data.driverId) {
          setupDriverLocationListener(response.data.data.driverId);
        }
      }
    } catch (error) {
      console.error('Error loading emergency:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupDriverLocationListener = (driverId) => {
    const locationRef = doc(db, 'liveLocations', driverId);
    const unsubscribe = onSnapshot(locationRef, (doc) => {
      if (doc.exists()) {
        setDriverLocation(doc.data());
      }
    });
    return unsubscribe;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (!emergency) {
    return (
      <View style={styles.container}>
        <Text style={styles.noEmergency}>No active emergency</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracking Ambulance</Text>
      <Text style={styles.status}>Status: {emergency.status}</Text>
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: emergency.location?.latitude || 0,
          longitude: emergency.location?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {emergency.location && (
          <Marker
            coordinate={{
              latitude: emergency.location.latitude,
              longitude: emergency.location.longitude,
            }}
            title="Your Location"
            pinColor="red"
          />
        )}
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Ambulance"
            pinColor="blue"
          />
        )}
      </MapView>
      
      {driverLocation && (
        <View style={styles.info}>
          <Text>Driver is on the way</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FAEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
    padding: 20,
  },
  status: {
    fontSize: 16,
    color: '#457B9D',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  info: {
    padding: 20,
    backgroundColor: '#fff',
  },
  noEmergency: {
    fontSize: 18,
    color: '#1D3557',
    textAlign: 'center',
    marginTop: 50,
  },
});

