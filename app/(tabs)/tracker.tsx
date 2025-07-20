import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { blink } from '../../lib/blink';

interface TrackingEntry {
  id: string;
  type: 'sleep' | 'feed' | 'diaper' | 'shopping';
  timestamp: Date;
  details: any;
  userId: string;
}

interface ModalData {
  visible: boolean;
  type: 'sleep' | 'feed' | 'diaper' | 'shopping' | null;
}

export default function TrackerScreen() {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [modal, setModal] = useState<ModalData>({ visible: false, type: null });
  const [user, setUser] = useState(null);

  // Form states
  const [sleepDuration, setSleepDuration] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedType, setFeedType] = useState('breast');
  const [diaperType, setDiaperType] = useState('wet');
  const [shoppingItem, setShoppingItem] = useState('');

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        loadEntries();
      }
    });

    return unsubscribe;
  }, []);

  const loadEntries = async () => {
    try {
      const data = await blink.db.trackingEntries.list({
        where: { userId: user?.id },
        orderBy: { timestamp: 'desc' },
        limit: 50,
      });
      
      setEntries(data.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })));
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const saveEntry = async (type: string, details: any) => {
    if (!user) return;

    try {
      const entry = {
        type,
        timestamp: new Date().toISOString(),
        details,
        userId: user.id,
      };

      await blink.db.trackingEntries.create(entry);
      await loadEntries();
      closeModal();
      Alert.alert('Success', 'Entry saved successfully!');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const openModal = (type: 'sleep' | 'feed' | 'diaper' | 'shopping') => {
    setModal({ visible: true, type });
    // Reset form states
    setSleepDuration('');
    setFeedAmount('');
    setFeedType('breast');
    setDiaperType('wet');
    setShoppingItem('');
  };

  const closeModal = () => {
    setModal({ visible: false, type: null });
  };

  const handleSave = () => {
    switch (modal.type) {
      case 'sleep':
        if (!sleepDuration) {
          Alert.alert('Error', 'Please enter sleep duration');
          return;
        }
        saveEntry('sleep', { duration: sleepDuration });
        break;
      case 'feed':
        if (!feedAmount) {
          Alert.alert('Error', 'Please enter feed amount');
          return;
        }
        saveEntry('feed', { amount: feedAmount, type: feedType });
        break;
      case 'diaper':
        saveEntry('diaper', { type: diaperType });
        break;
      case 'shopping':
        if (!shoppingItem) {
          Alert.alert('Error', 'Please enter shopping item');
          return;
        }
        saveEntry('shopping', { item: shoppingItem });
        break;
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'sleep': return 'moon';
      case 'feed': return 'nutrition';
      case 'diaper': return 'happy';
      case 'shopping': return 'bag';
      default: return 'ellipse';
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'sleep': return '#8B7FD6';
      case 'feed': return '#FFB4B4';
      case 'diaper': return '#87CEEB';
      case 'shopping': return '#98D8C8';
      default: return '#999';
    }
  };

  const formatEntryDetails = (entry: TrackingEntry) => {
    switch (entry.type) {
      case 'sleep':
        return `Slept for ${entry.details.duration}`;
      case 'feed':
        return `${entry.details.amount} (${entry.details.type})`;
      case 'diaper':
        return `${entry.details.type} diaper`;
      case 'shopping':
        return entry.details.item;
      default:
        return 'Unknown entry';
    }
  };

  const trackingOptions = [
    { type: 'sleep', title: 'Sleep Log', icon: 'moon', color: '#8B7FD6' },
    { type: 'feed', title: 'Feeding', icon: 'nutrition', color: '#FFB4B4' },
    { type: 'diaper', title: 'Diaper Change', icon: 'happy', color: '#87CEEB' },
    { type: 'shopping', title: 'Shopping List', icon: 'bag', color: '#98D8C8' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Baby Tracker</Text>
          <Text style={styles.subtitle}>Keep track of your baby's daily activities</Text>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddContainer}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {trackingOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[styles.quickAddButton, { backgroundColor: option.color + '15' }]}
                onPress={() => openModal(option.type as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickAddIcon, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.quickAddTitle}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.entriesContainer}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color="#999" />
              <Text style={styles.emptyStateText}>No entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your baby's activities using the buttons above
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryIconContainer}>
                    <View style={[styles.entryIcon, { backgroundColor: getEntryColor(entry.type) }]}>
                      <Ionicons name={getEntryIcon(entry.type) as any} size={20} color="white" />
                    </View>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryTitle}>
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </Text>
                      <Text style={styles.entryDetails}>{formatEntryDetails(entry)}</Text>
                    </View>
                  </View>
                  <Text style={styles.entryTime}>
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modal.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {modal.type?.charAt(0).toUpperCase()}{modal.type?.slice(1)} Entry
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {modal.type === 'sleep' && (
              <View>
                <Text style={styles.inputLabel}>Sleep Duration</Text>
                <TextInput
                  style={styles.textInput}
                  value={sleepDuration}
                  onChangeText={setSleepDuration}
                  placeholder="e.g., 2 hours 30 minutes"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {modal.type === 'feed' && (
              <View>
                <Text style={styles.inputLabel}>Feed Amount</Text>
                <TextInput
                  style={styles.textInput}
                  value={feedAmount}
                  onChangeText={setFeedAmount}
                  placeholder="e.g., 120ml or 15 minutes"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputLabel}>Feed Type</Text>
                <View style={styles.optionsContainer}>
                  {['breast', 'bottle', 'solid'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        feedType === type && styles.optionButtonSelected,
                      ]}
                      onPress={() => setFeedType(type)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          feedType === type && styles.optionTextSelected,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {modal.type === 'diaper' && (
              <View>
                <Text style={styles.inputLabel}>Diaper Type</Text>
                <View style={styles.optionsContainer}>
                  {['wet', 'dirty', 'both'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        diaperType === type && styles.optionButtonSelected,
                      ]}
                      onPress={() => setDiaperType(type)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          diaperType === type && styles.optionTextSelected,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {modal.type === 'shopping' && (
              <View>
                <Text style={styles.inputLabel}>Shopping Item</Text>
                <TextInput
                  style={styles.textInput}
                  value={shoppingItem}
                  onChangeText={setShoppingItem}
                  placeholder="e.g., Diapers, Baby formula, Wipes"
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#666',
  },
  quickAddContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 20,
    color: '#2A2D3A',
    marginBottom: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAddIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAddTitle: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
  },
  entriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'System',
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
  },
  entryDetails: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  entryTime: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontFamily: 'System',
    fontSize: 18,
    color: '#2A2D3A',
  },
  saveButton: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#8B7FD6',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'System',
    fontSize: 16,
    color: '#2A2D3A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#8B7FD6',
    borderColor: '#8B7FD6',
  },
  optionText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: 'white',
  },
});