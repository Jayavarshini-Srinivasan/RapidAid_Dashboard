import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';

export default function RequestEmergencyScreen({ navigation }) {
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!severity || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await api.post('/patient/emergency', {
        severity,
        description,
        location: { latitude, longitude },
      });

      Alert.alert('Success', 'Emergency request sent!', [
        { text: 'OK', onPress: () => navigation.navigate('TrackAmbulance') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request Emergency</Text>
      
      <Text style={styles.label}>Severity</Text>
      <View style={styles.severityContainer}>
        {['critical', 'moderate', 'minor'].map((sev) => (
          <TouchableOpacity
            key={sev}
            style={[styles.severityButton, severity === sev && styles.severityButtonActive]}
            onPress={() => setSeverity(sev)}
          >
            <Text style={[styles.severityText, severity === sev && styles.severityTextActive]}>
              {sev.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe the emergency..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Request</Text>}
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
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  severityButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#457B9D',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  severityText: {
    color: '#457B9D',
    fontWeight: 'bold',
  },
  severityTextActive: {
    color: '#F1FAEE',
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F1FAEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

