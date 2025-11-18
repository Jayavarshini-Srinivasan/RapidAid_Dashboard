import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapWeb = ({ location }) => {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>Map View</Text>
      <Text style={styles.fallbackSubtext}>
        {location?.address || 'Location: Loading...'}
      </Text>
      {location && (
        <Text style={styles.coordinatesText}>
          GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontFamily: 'monospace',
  }
});

export default MapWeb;