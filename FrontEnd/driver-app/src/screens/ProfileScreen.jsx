import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfileScreen() {
  const { userData, logout } = useAuth();
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.data) {
        setName(response.data.data.name || '');
        setLicense(response.data.data.license || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setFetching(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0A6CF1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.disabled]}
        value={userData?.email || ''}
        editable={false}
      />
      
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Full Name"
      />
      
      <Text style={styles.label}>License</Text>
      <TextInput
        style={styles.input}
        value={license}
        onChangeText={setLicense}
        placeholder="License Number"
      />
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A6CF1',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#f0f0f0',
  },
  logoutButton: {
    backgroundColor: '#FF3B3B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

