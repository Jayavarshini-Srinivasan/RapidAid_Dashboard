import React from 'react';
import { Platform } from 'react-native';

// Use different components based on platform
let MapComponent;
if (Platform.OS === 'web') {
  MapComponent = require('./Map.web').default;
} else {
  try {
    MapComponent = require('./Map.native').default;
  } catch (error) {
    MapComponent = require('./Map.web').default;
  }
}

const Map = ({ location }) => {
  return <MapComponent location={location} />;
};

export default Map;
