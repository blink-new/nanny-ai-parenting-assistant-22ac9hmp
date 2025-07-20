import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../../lib/blink';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => blink.auth.logout()
        },
      ]
    );
  };

  const profileOptions = [
    {
      id: '1',
      title: 'Baby Information',
      subtitle: 'Manage your baby\'s profile',
      icon: 'person-outline',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      id: '2',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      id: '3',
      title: 'Data Export',
      subtitle: 'Export your tracking data',
      icon: 'download-outline',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      id: '4',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield-outline',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      id: '5',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      id: '6',
      title: 'About Mom',
      subtitle: 'Learn more about the app',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert(
        'About Mom',
        'Mom is your caring AI personal nurse assistant, designed to help parents with evidence-based parenting advice and baby care tracking.\n\nVersion 1.0.0'
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="white" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              Mom
            </Text>
            <Text style={styles.userEmail}>mom@gmail.com</Text>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon as any} size={24} color="#8B7FD6" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            Mom - AI Personal Nurse Assistant
          </Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'System',
    fontSize: 28,
    color: '#2A2D3A',
  },
  userCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B7FD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'System',
    fontSize: 20,
    color: '#2A2D3A',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  signOutText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  appVersion: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});