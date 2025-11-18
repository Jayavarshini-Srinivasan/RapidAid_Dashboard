import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import styles from "../../styles/AmbulanceTracking";
import LiveMapView from "./component/Map";
import { AuthContext } from "../context/AuthContext";
import { locationService } from "../services/locationService";

export default function AmbulanceTracking({ navigation, route }) {
  const { userData } = useContext(AuthContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyData, setEmergencyData] = useState(null);
  
  // Get data from navigation params (when coming from HomeScreen)
  const { location, severity, userData: routeUserData } = route?.params || {};

  useEffect(() => {
    initializeTracking();
  }, []);

  const initializeTracking = async () => {
    try {
      setLoading(true);
      
      // Use location from route params if available, otherwise get fresh location
      let userLocation = location;
      if (!userLocation) {
        userLocation = await locationService.getCurrentLocation();
      }
      
      setCurrentLocation(userLocation);
      
      // Create emergency session data
      const emergencyInfo = {
        id: `EMG-${Date.now()}`,
        timestamp: new Date(),
        location: userLocation,
        severity: severity || 'standard',
        patientProfile: routeUserData || userData,
        status: 'ambulance_assigned',
        eta: Math.floor(Math.random() * 10) + 3, // Random ETA 3-12 minutes
      };
      
      setEmergencyData(emergencyInfo);
      
      // Start location tracking
      startLocationTracking();
      
    } catch (error) {
      console.error('Error initializing tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    // Update location every 30 seconds
    const locationInterval = setInterval(async () => {
      try {
        const newLocation = await locationService.getCurrentLocation();
        setCurrentLocation(newLocation);
      } catch (error) {
        console.error('Location update error:', error);
      }
    }, 30000);

    // Clean up interval on unmount
    return () => clearInterval(locationInterval);
  };

  const handleCallDriver = () => {
    // In a real app, this would initiate a phone call
    alert('Call functionality would be implemented here');
  };

  const handleShareLocation = () => {
    // In a real app, this would share location via SMS/email
    if (currentLocation) {
      const locationText = `Emergency Location: ${currentLocation.address}\nGPS: ${currentLocation.latitude}, ${currentLocation.longitude}`;
      alert(`Location to share:\n${locationText}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.rootContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3066fe" />
        <Text style={{ marginTop: 16, color: '#666' }}>Initializing emergency tracking...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.rootContainer}>
      <View style={styles.headerBar}> 
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.assignedTag}>Ambulance Assigned</Text>
        </View>
        <Text style={styles.emergencyId}>Emergency ID: {emergencyData?.id}</Text>
      </View>
      
      <View style={{ height: 400, width: "100%" }}>
        <LiveMapView location={currentLocation} />
      </View>
      
      <View style={styles.etaContainer}>
        <Text style={styles.eta}>
          Estimated arrival ⏱ {emergencyData?.eta} min
        </Text>
      </View>
      
      <View style={styles.progressBar} />
      
      <ScrollView>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar} />
            <View style={styles.infoArea}>
              <Text style={styles.name}>Dr. Sarah Johnson</Text>
              <Text style={styles.subTitle}>Lead Paramedic · 8 years exp.</Text>
              <View style={styles.rating}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.star}>★</Text>
                <Text style={styles.star}>★</Text>
                <Text style={styles.star}>★</Text>
                <Text style={styles.star}>★</Text>
              </View>
            </View>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
              <Text style={styles.actionText}>Call Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.familyShare} onPress={handleShareLocation}>
          <Text style={styles.familyShareText}>Share Location with Family</Text>
        </TouchableOpacity>
        
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <Text style={styles.locText}>Your Location</Text>
          <Text style={styles.locText}>
            {currentLocation?.address || 'Location not available'}
          </Text>
          {currentLocation && (
            <Text style={styles.locSubText}>
              GPS: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          )}
        </View>
        
        {/* Patient Medical Info */}
        {userData && (
          <View style={styles.locationCard}>
            <Text style={styles.sectionTitle}>Patient Information</Text>
            <Text style={styles.locText}>Name: {userData.name || 'Unknown'}</Text>
            {userData.bloodType && (
              <Text style={styles.locText}>Blood Type: {userData.bloodType}</Text>
            )}
            {userData.allergies && userData.allergies.length > 0 && (
              <Text style={styles.locText}>Allergies: {userData.allergies.join(', ')}</Text>
            )}
            {userData.conditions && userData.conditions.length > 0 && (
              <Text style={styles.locText}>Conditions: {userData.conditions.join(', ')}</Text>
            )}
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
}
