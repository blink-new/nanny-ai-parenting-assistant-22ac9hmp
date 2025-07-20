import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <Ionicons 
      name={name} 
      size={24} 
      color={color}
      style={{ opacity: focused ? 1 : 0.6 }}
    />
  );
}

function MicButton() {
  return (
    <TouchableOpacity 
      style={styles.micButton}
      onPress={() => router.push('/(tabs)/voice')}
      activeOpacity={0.8}
    >
      <Ionicons name="mic" size={28} color="white" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B7FD6',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="analytics" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: '',
          tabBarIcon: () => <MicButton />,
          tabBarButton: (props) => (
            <View style={styles.micContainer}>
              <TouchableOpacity 
                {...props}
                style={styles.micButton}
                onPress={() => router.push('/(tabs)/voice')}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.micLabel}>Talk to Nanny</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chatbubbles" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  micContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B7FD6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B7FD6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micLabel: {
    fontSize: 10,
    color: '#8B7FD6',
    fontFamily: 'System',
    marginTop: 4,
    textAlign: 'center',
  },
});