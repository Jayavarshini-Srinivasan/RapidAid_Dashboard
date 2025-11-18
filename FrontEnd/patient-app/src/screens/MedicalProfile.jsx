import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import styles from '../../styles/MedicalProfile';

export default function MedicalProfile() {
  const { user, userData, loading, forceRealFirebaseMode } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bloodType: '',
    emergencyContact: '',
    phone: '',
    allergies: [],
    conditions: [],
    medications: [],
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [saving, setSaving] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Force real Firebase mode on component mount
  useEffect(() => {
    console.log('MedicalProfile - Forcing real Firebase mode...');
    const firebaseInfo = forceRealFirebaseMode();
    console.log('MedicalProfile - Firebase mode info:', firebaseInfo);
  }, []);

  // Debug user data
  useEffect(() => {
    console.log('MedicalProfile - Current user:', user);
    console.log('MedicalProfile - Current userData:', userData);
    console.log('MedicalProfile - Loading state:', loading);
  }, [user, userData, loading]);

  useEffect(() => {
    if (userData) {
      console.log('Loading user data into profile:', userData);
      setProfile({
        name: userData.name || '',
        age: userData.age ? String(userData.age) : '',
        bloodType: userData.bloodType || '',
        emergencyContact: userData.emergencyContact || '',
        phone: userData.phone || '',
        allergies: userData.allergies || [],
        conditions: userData.conditions || [],
        medications: userData.medications || [],
      });
      // Load existing documents from userData
      if (userData.documents) {
        console.log('Loading existing documents:', userData.documents);
        setDocuments(userData.documents);
      } else {
        console.log('No existing documents found');
        setDocuments([]);
      }
      setLocalLoading(false);
    } else if (!loading) {
      console.log('No user data available, setting loading to false');
      setLocalLoading(false);
    }
  }, [userData, loading]);

  function addAllergy() {
    if (newAllergy && !profile.allergies.includes(newAllergy)) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, newAllergy],
      });
      setNewAllergy('');
    }
  }

  function removeAllergy(allergy) {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter((a) => a !== allergy),
    });
  }

  function addCondition() {
    if (newCondition && !profile.conditions.includes(newCondition)) {
      setProfile({
        ...profile,
        conditions: [...profile.conditions, newCondition],
      });
      setNewCondition('');
    }
  }

  function removeCondition(cond) {
    setProfile({
      ...profile,
      conditions: profile.conditions.filter((c) => c !== cond),
    });
  }

  function addMedication() {
    if (newMedication && !profile.medications.includes(newMedication)) {
      setProfile({
        ...profile,
        medications: [...profile.medications, newMedication],
      });
      setNewMedication('');
    }
  }

  function removeMedication(med) {
    setProfile({
      ...profile,
      medications: profile.medications.filter((m) => m !== med),
    });
  }

  async function saveProfile() {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save your profile');
      return;
    }

    setSaving(true);
    try {
      // Prepare the profile data for saving
      const profileData = {
        name: profile.name,
        age: profile.age ? parseInt(profile.age) : null,
        bloodType: profile.bloodType,
        emergencyContact: profile.emergencyContact,
        phone: profile.phone,
        allergies: profile.allergies,
        conditions: profile.conditions,
        medications: profile.medications,
        documents: documents,
        updatedAt: new Date(),
      };

      // Remove any undefined or null values that might cause issues
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined || profileData[key] === null) {
          delete profileData[key];
        }
      });

      console.log('Saving profile data:', profileData);
      console.log('Documents being saved:', profileData.documents);
      console.log('Current user:', user);
      console.log('User UID:', user.uid);
      console.log('Is sample user?', user.uid === 'samplePatient1');
      
      // Force real Firebase save - bypass sample mode check
      console.log('Force attempting real Firebase save...');
      try {
        const result = await userService.updateUserProfile(user.uid, profileData);
        console.log('Profile saved successfully to Firebase:', result);
        
        // Update local state with saved data
        if (result) {
          setUserData(result);
        }
        
        Alert.alert('Success', 'Medical profile updated successfully in Firebase!');
      } catch (firebaseError) {
        console.error('Firebase save failed:', firebaseError);
        console.error('Error code:', firebaseError.code);
        console.error('Error message:', firebaseError.message);
        console.error('Full error object:', firebaseError);
        
        // Show specific error to user
        if (firebaseError.code === 'permission-denied') {
          Alert.alert('Error', 'Permission denied. Please check Firestore security rules.');
        } else if (firebaseError.code === 'not-found') {
          Alert.alert('Error', 'Document not found. Creating new profile...');
          // Try to create the document
          try {
            await userService.createUserProfile(user.uid, profileData);
            Alert.alert('Success', 'New profile created successfully!');
          } catch (createError) {
            Alert.alert('Error', `Failed to create profile: ${createError.message}`);
          }
        } else {
          Alert.alert('Error', `Firebase error: ${firebaseError.message} (Code: ${firebaseError.code})`);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      Alert.alert('Error', `Failed to update medical profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Document upload functions
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        await uploadDocument(result);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  }

  async function uploadDocument(document) {
    console.log('Starting document upload process...');
    console.log('Document details:', document);
    console.log('Current user:', user);
    console.log('Current documents count:', documents.length);
    
    setUploading(true);
    try {
      // In a real app, you would upload to your backend/Firebase Storage
      // For now, we'll simulate the upload and store document metadata
      const newDocument = {
        id: Date.now().toString(),
        name: document.name,
        size: document.size,
        type: document.mimeType || 'application/octet-stream',
        uri: document.uri,
        uploadDate: new Date().toISOString(),
        status: 'uploaded'
      };

      console.log('Creating new document metadata:', newDocument);
      const updatedDocuments = [...documents, newDocument];
      console.log('Updated documents array:', updatedDocuments);
      setDocuments(updatedDocuments);
      
      console.log('Attempting to auto-save profile with new document...');
      console.log('User UID for save:', user?.uid);
      
      if (!user?.uid) {
        console.error('No user UID available for auto-save');
        Alert.alert('Error', 'Cannot save: No user logged in');
        return;
      }
      
      try {
        // Automatically save the profile with the new document
        const profileData = {
          name: profile.name,
          age: profile.age ? parseInt(profile.age) : null,
          bloodType: profile.bloodType,
          emergencyContact: profile.emergencyContact,
          phone: profile.phone,
          allergies: profile.allergies,
          conditions: profile.conditions,
          medications: profile.medications,
          documents: updatedDocuments,
          updatedAt: new Date(),
        };

        // Remove any undefined or null values that might cause issues
        Object.keys(profileData).forEach(key => {
          if (profileData[key] === undefined || profileData[key] === null) {
            delete profileData[key];
          }
        });

        console.log('Auto-saving profile with new document:', profileData);
        console.log('Documents being saved:', profileData.documents);
        
        const result = await userService.updateUserProfile(user.uid, profileData);
        console.log('Auto-save result:', result);
        
        Alert.alert('Success', 'Document uploaded and profile updated successfully!');
      } catch (firebaseError) {
        console.error('Auto-save failed:', firebaseError);
        console.error('Error code:', firebaseError.code);
        console.error('Error message:', firebaseError.message);
        console.error('Full error stack:', firebaseError.stack);
        Alert.alert('Notice', `Document added locally. Auto-save failed: ${firebaseError.message}. Please save profile manually.`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Failed to upload document: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  function removeDocument(docId) {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (localLoading || loading) {
    return (
      <View style={[styles.rootContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3066fe" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading profile...</Text>
      </View>
    );
  }

  return ( 
    <ScrollView style={styles.rootContainer}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Medical Profile</Text>
        <Text style={styles.headerSubtitle}>Your health information</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="person" size={15} /> Basic Information</Text>
          <TextInput 
            style={styles.input} 
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            placeholder="Full Name"
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              value={profile.age}
              onChangeText={(text) => setProfile({ ...profile, age: text })}
              placeholder="Age"
              keyboardType="numeric"
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              value={profile.bloodType}
              onChangeText={(text) => setProfile({ ...profile, bloodType: text })}
              placeholder="Blood Type"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              value={profile.emergencyContact}
              onChangeText={(text) => setProfile({ ...profile, emergencyContact: text })}
              placeholder="Emergency Contact"
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="alert-circle-outline" size={16} /> Allergies
          </Text>
          <View style={styles.chipRow}>
            {profile.allergies.map((allergy) => (
              <View style={styles.chip} key={allergy}>
                <Text style={styles.chipText}>{allergy}</Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                  <Ionicons name="close-circle" size={18} color="#d35" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.chipInputRow}>
            <TextInput
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="Add allergy..."
              style={styles.chipInput}
              placeholderTextColor="#B0A489"
            />
            <TouchableOpacity style={styles.chipAddBtn} onPress={addAllergy}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pre-existing Medical Conditions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="heart-half-outline" size={16} color="#C33838" /> Pre-existing Medical Conditions
          </Text>
          <View style={styles.chipRow}>
            {profile.conditions.map((cond) => (
              <View style={styles.chipDanger} key={cond}>
                <Text style={styles.chipText}>{cond}</Text>
                <TouchableOpacity onPress={() => removeCondition(cond)}>
                  <Ionicons name="close-circle" size={18} color="#a04041" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.chipInputRow}>
            <TextInput
              value={newCondition}
              onChangeText={setNewCondition}
              placeholder="Add condition..."
              style={styles.chipInput}
              placeholderTextColor="#C36F7B"
            />
            <TouchableOpacity style={styles.chipAddBtnDanger} onPress={addCondition}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Medications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="medical-outline" size={16} /> Current Medications
          </Text>
          {profile.medications.map((med, i) => (
            <View key={i} style={styles.medItemContainer}>
              <Text style={styles.medItem}>{med}</Text>
              <TouchableOpacity onPress={() => removeMedication(med)}>
                <Ionicons name="close-circle" size={18} color="#d35" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.chipInputRow}>
            <TextInput
              value={newMedication}
              onChangeText={setNewMedication}
              placeholder="Add medication..."
              style={styles.chipInput}
              placeholderTextColor="#B0A489"
            />
            <TouchableOpacity style={styles.chipAddBtn} onPress={addMedication}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical Documents */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medical Documents</Text>
          <TouchableOpacity 
            style={styles.uploadBox}
            onPress={pickDocument}
            disabled={uploading}
          >
            <Ionicons name="cloud-upload-outline" size={30} color="#93b6d6" />
            <Text style={styles.uploadText}>
              {uploading ? 'Uploading...' : 'Upload Medical Records'}
            </Text>
            <Text style={styles.uploadSubText}>Recent lab results, prescriptions, medical history</Text>
          </TouchableOpacity>
          
          {/* Display uploaded documents */}
          {documents.map((doc) => (
            <View key={doc.id} style={styles.fileRow}>
              <Ionicons name="document-outline" size={20} color="#3066fe" style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fileTitle}>{doc.name}</Text>
                <Text style={styles.fileDate}>
                  {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeDocument(doc.id)}>
                <Ionicons name="close-circle" size={20} color="#d35" />
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Sample document for demo */}
          {documents.length === 0 && (
            <View style={styles.fileRow}>
              <Ionicons name="document-outline" size={20} color="#3066fe" style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fileTitle}>Blood Test Results.pdf</Text>
                <Text style={styles.fileDate}>Sample document - Upload your own documents</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.viewBtn}>View</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={{ height: 22 }} />
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.saveBtnBottom, saving && { opacity: 0.7 }]} 
        onPress={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Medical Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}