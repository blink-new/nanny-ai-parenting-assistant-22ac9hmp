import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blink } from '../../lib/blink';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

const quickActions: QuickAction[] = [
  { id: '1', title: 'Sleep Log', icon: 'moon', color: '#8B7FD6', route: '/(tabs)/tracker' },
  { id: '2', title: 'Feeding', icon: 'nutrition', color: '#FFB4B4', route: '/(tabs)/tracker' },
  { id: '3', title: 'Diaper', icon: 'happy', color: '#87CEEB', route: '/(tabs)/tracker' },
  { id: '4', title: 'Shopping', icon: 'bag', color: '#98D8C8', route: '/(tabs)/tracker' },
];

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    return unsubscribe;
  }, []);

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>
              {user?.displayName || user?.email?.split('@')[0] || 'Parent'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#8B7FD6" />
          </TouchableOpacity>
        </View>

        {/* AI Assistant Card */}
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => router.push('/(tabs)/chat')}
          activeOpacity={0.8}
        >
          <View style={styles.aiCardContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="heart" size={24} color="white" />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>Ask Nanny Anything</Text>
              <Text style={styles.aiSubtitle}>
                Get caring, evidence-based parenting advice
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B7FD6" />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color + '15' }]}
                onPress={() => handleQuickAction(action.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="moon" size={20} color="#8B7FD6" />
                <Text style={styles.summaryLabel}>Sleep</Text>
                <Text style={styles.summaryValue}>8h 30m</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="nutrition" size={20} color="#FFB4B4" />
                <Text style={styles.summaryLabel}>Feeds</Text>
                <Text style={styles.summaryValue}>6 times</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="happy" size={20} color="#87CEEB" />
                <Text style={styles.summaryLabel}>Diapers</Text>
                <Text style={styles.summaryValue}>4 changes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="heart" size={20} color="#98D8C8" />
                <Text style={styles.summaryLabel}>Mood</Text>
                <Text style={styles.summaryValue}>Happy</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Quick Help */}
        <TouchableOpacity 
          style={styles.emergencyCard}
          onPress={() => router.push('/(tabs)/chat')}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyContent}>
            <Ionicons name="medical" size={24} color="#FF6B6B" />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Need Help Now?</Text>
              <Text style={styles.emergencySubtitle}>
                "My baby is crying at 2am, what should I do?"
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontFamily: 'System',
    fontSize: 24,
    color: '#2A2D3A',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8B7FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B7FD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  aiTitle: {
    fontFamily: 'System',
    fontSize: 18,
    color: '#2A2D3A',
  },
  aiSubtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 20,
    color: '#2A2D3A',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  summaryValue: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
    marginTop: 4,
  },
  emergencyCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyText: {
    flex: 1,
    marginLeft: 16,
  },
  emergencyTitle: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#FF6B6B',
  },
  emergencySubtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});