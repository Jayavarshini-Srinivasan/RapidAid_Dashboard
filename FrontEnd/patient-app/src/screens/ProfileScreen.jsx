import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfileScreen() {
  const { userData } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/patient/profile');
      if (response.data.data) {
        setName(response.data.data.name || '');
        setPhone(response.data.data.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/patient/profile', { name, phone });
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E63946" />
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
      
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
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
    marginTop: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3557',
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
  button: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#F1FAEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

