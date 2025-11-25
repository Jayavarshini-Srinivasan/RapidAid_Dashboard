import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { userData, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userData?.name || 'Patient'}</Text>
      
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => navigation.navigate('RequestEmergency')}
      >
        <Text style={styles.emergencyButtonText}>🚨 REQUEST EMERGENCY</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TrackAmbulance')}
      >
        <Text style={styles.buttonText}>Track Ambulance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F1FAEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
    marginTop: 40,
    marginBottom: 40,
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: '#E63946',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  emergencyButtonText: {
    color: '#F1FAEE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#457B9D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#F1FAEE',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#1D3557',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#F1FAEE',
    fontSize: 16,
  },
});

