import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import api from '../services/api';

export default function AssignedRequestsScreen() {
  const [assigned, setAssigned] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const [assignedRes, pendingRes] = await Promise.all([
        api.get('/driver/requests/assigned'),
        api.get('/driver/requests/pending'),
      ]);
      setAssigned(assignedRes.data.data || []);
      setPending(pendingRes.data.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (emergencyId) => {
    try {
      await api.post(`/driver/requests/${emergencyId}/accept`);
      Alert.alert('Success', 'Request accepted');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleReject = async (emergencyId) => {
    try {
      await api.post(`/driver/requests/${emergencyId}/reject`);
      Alert.alert('Success', 'Request rejected');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const handleComplete = async (emergencyId) => {
    try {
      await api.post(`/driver/requests/${emergencyId}/complete`);
      Alert.alert('Success', 'Request completed');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete request');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0A6CF1" />
      </View>
    );
  }

  const requests = activeTab === 'pending' ? pending : assigned;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pending.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.tabActive]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.tabTextActive]}>
            Assigned ({assigned.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {requests.map((request) => (
          <View key={request.id} style={styles.card}>
            <Text style={styles.cardTitle}>{request.patientName || 'Patient'}</Text>
            <Text style={styles.cardText}>Severity: {request.severity}</Text>
            <Text style={styles.cardText}>Status: {request.status}</Text>
            {request.description && (
              <Text style={styles.cardText}>{request.description}</Text>
            )}
            
            {activeTab === 'pending' && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAccept(request.id)}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(request.id)}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {activeTab === 'assigned' && request.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleComplete(request.id)}
              >
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {requests.length === 0 && (
          <Text style={styles.emptyText}>No requests available</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  tabActive: {
    backgroundColor: '#0A6CF1',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A6CF1',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#FF3B3B',
  },
  completeButton: {
    backgroundColor: '#0A6CF1',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
});

