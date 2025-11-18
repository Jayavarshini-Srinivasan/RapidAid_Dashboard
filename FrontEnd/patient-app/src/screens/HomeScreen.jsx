import { Ionicons } from '@expo/vector-icons';
import { useState, useContext, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import styles from '../../styles/HomeScreen';
import { AuthContext } from '../context/AuthContext';
import { locationService } from '../services/locationService';

export default function HomeScreen({ navigation }) {
  const { user, userData } = useContext(AuthContext);
  const [isFaded, setFaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleEmergencyPress = async (severity) => {
    setFaded(true);
    
    // Get fresh location for emergency
    try {
      const location = await locationService.getCurrentLocation();
      
      // Here you would typically send emergency data to your backend
      // For now, we'll just navigate to the tracking screen
      navigation.navigate('AmbulanceTracking', { 
        location,
        severity,
        userData 
      });
    } catch (error) {
      console.error('Emergency location error:', error);
      // Still navigate even if location fails
      navigation.navigate('AmbulanceTracking', { 
        location: currentLocation,
        severity,
        userData 
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Banner */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>RapidAid</Text>
          <Text style={styles.bannerSubtitle}>Emergency Response System</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('MedicalProfile')}>
          <Ionicons name="person-circle" size={40} color="#fff" style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      {/* User Greeting */}
      {userData && (
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>
            {getGreeting()}, {userData.name || 'User'}
          </Text>
          <Text style={styles.greetingSubText}>
            Stay safe and be prepared
          </Text>
        </View>
      )}

      {/* Quick Location Status with View Button */}
      <View style={styles.infoBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Your Current Location</Text>
            {loadingLocation ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#3066fe" />
                <Text style={[styles.infoAddress, { marginLeft: 8 }]}>Getting location...</Text>
              </View>
            ) : locationError ? (
              <Text style={[styles.infoAddress, { color: '#e74c3c' }]}>Location unavailable</Text>
            ) : (
              <>
                <Text style={styles.infoAddress}>
                  {currentLocation?.address || 'Location not available'}
                </Text>
                <Text style={styles.infoGps}>
                  GPS Active • Accurate to ~8m
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={[styles.viewButton, loadingLocation && { opacity: 0.6 }]}
            onPress={() => navigation.navigate('AmbulanceTracking')}
            disabled={loadingLocation}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoAutoShare}>
          Your location is automatically shared when you request emergency help
        </Text>
        {locationError && (
          <TouchableOpacity onPress={loadCurrentLocation} style={{ marginTop: 8 }}>
            <Text style={{ color: '#3066fe', fontSize: 12 }}>Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 
        All contents that fade when SOS button is active.
        **Moved Logout button & Hotline below this faded container to ensure visibility**.
      */}
      <View style={isFaded ? { opacity: 0.25 } : {}}>
        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => handleEmergencyPress('critical')}
        >
          <Text style={styles.sosText}>EMERGENCY SOS</Text>
          <Text style={styles.sosSubText}>One-tap emergency dispatch</Text>
        </TouchableOpacity>

        {/* Emergency Severity Selection */}
        <View style ={styles.severityContainer}>
        <Text style={styles.sectionTitle}>Select Emergency Severity</Text>
        <TouchableOpacity
          style={styles.severityBoxRed}
          onPress={() => handleEmergencyPress('critical')}
        >
          <Text style={styles.severityTitle}>Severe Emergency</Text>
          <Text style={styles.severityBadge}>Critical</Text>
          <Text style={styles.severityText}>Life-threatening • Immediate response</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.severityBoxOrange}
          onPress={() => handleEmergencyPress('urgent')}
        >
          <Text style={styles.severityTitle}>High Emergency</Text>
          <Text style={styles.severityBadgeOrange}>Urgent</Text>
          <Text style={styles.severityText}>Serious injury • Fast response needed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.severityBoxYellow}
          onPress={() => handleEmergencyPress('moderate')}
        >
          <Text style={styles.severityTitle}>Moderate Emergency</Text>
          <Text style={styles.severityBadgeBlue}>Standard</Text>
          <Text style={styles.severityText}>Non-critical • Response needed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.severityBoxGreen}
          onPress={() => handleEmergencyPress('minor')}
        >
          <Text style={styles.severityTitle}>Minor Emergency</Text>
          <Text style={styles.severityBadgeBlue}>Standard</Text>
          <Text style={styles.severityText}>Non-critical • Medical assistance</Text>
        </TouchableOpacity>
        </View>
        
        
      </View>

      {/* Hotline text moved outside faded area for visibility */}
      <Text style={styles.hotline}>
        Emergency Hotline: 911 • Available 24/7
      </Text>
        {/* Emergency CPR */}
                <View style={styles.tipRedOutline}>
                  <Text style={styles.tipTitleRed}>Emergency Self-Help: CPR Basics</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>1. Check Responsiveness:</Text> Tap shoulder and shout</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>2. Call 911:</Text> Or use emergency SOS</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>3. Hand Position:</Text> Center of chest, between nipples</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>4. Compressions:</Text> Push hard, push fast (100-120/min)</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>5. Depth:</Text> At least 2 inches for adults</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>6. Rescue Breaths:</Text> 2 breaths after 30 compressions</Text>
                  <TouchableOpacity style={styles.cprBtnRed}>
                    <Text style={styles.cprBtnRedText}>Watch CPR Video Tutorial</Text>
                  </TouchableOpacity>
                </View>
                {/* Emergency Bleeding */}
                <View style={styles.tipOrangeOutline}>
                  <Text style={styles.tipTitleOrange}>Emergency Self-Help: Bleeding Control</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>1. Direct Pressure:</Text> Apply firm pressure with clean cloth</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>2. Don't Remove:</Text> Add more cloth if soaked through</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>3. Elevate:</Text> Raise wound above heart if possible</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>4. Pressure Points:</Text> Apply to artery if needed</Text>
                  <Text style={styles.tipStep}><Text style={styles.tipStrong}>5. Tourniquet:</Text> Last resort for life-threatening bleeding</Text>
                </View>
        
      {/* Logout button moved outside faded container to be always visible */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
