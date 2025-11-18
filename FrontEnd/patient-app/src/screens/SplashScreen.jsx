import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/SplashScreen';

export default function SplashScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RapidAid</Text>
      <Text style={styles.subtitle}>Your emergency rescue companion</Text>
    </View>
  );
}
