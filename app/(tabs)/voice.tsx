import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { blink } from '../../lib/blink';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isPlaying?: boolean;
}

export default function VoiceChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Mom, your caring AI personal nurse assistant. I'm here to help you with all your parenting questions and baby care needs. How can I support you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate Nanny's avatar with a gentle pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (isTyping) {
      const typing = Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      typing.start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission to use voice chat.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsLoading(true);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Convert audio to base64 for transcription
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          try {
            const transcription = await blink.ai.transcribeAudio({
              audio: base64,
              language: 'en'
            });
            
            if (transcription.text.trim()) {
              await sendMessage(transcription.text);
            } else {
              Alert.alert('No speech detected', 'Please try speaking again.');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
          }
        };
        
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await blink.ai.generateText({
        prompt: `You are Mom, a caring and warm AI personal nurse assistant for parents. You provide evidence-based, supportive advice about baby care, parenting, and child development. Always respond with empathy, understanding, and practical guidance. Keep responses conversational and caring, as if you're a trusted friend who happens to be a pediatric nurse.

User's question: ${text}

Respond with caring, practical advice that shows you understand the challenges of parenting. Be supportive and reassuring while providing helpful information.`,
        maxTokens: 300,
      });

      const nannyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, nannyMessage]);
      
      // Speak the response
      Speech.speak(response.text, {
        voice: 'com.apple.ttsbundle.Samantha-compact', // Warm female voice
        rate: 0.9,
        pitch: 1.0,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const speakMessage = (text: string, messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPlaying: true } : { ...msg, isPlaying: false }
    ));

    Speech.speak(text, {
      voice: 'com.apple.ttsbundle.Samantha-compact',
      rate: 0.9,
      pitch: 1.0,
      onDone: () => {
        setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
      },
    });
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.nannyMessage
    ]}>
      {!message.isUser && (
        <View style={styles.nannyHeader}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Image 
              source={require('../../assets/images/mom-avatar.jpg')}
              style={styles.avatar}
            />
          </Animated.View>
          <View style={styles.nannyInfo}>
            <Text style={styles.nannyName}>Mom</Text>
            <Text style={styles.nannyTitle}>Personal Nurse Assistant</Text>
          </View>
          <TouchableOpacity 
            style={styles.speakButton}
            onPress={() => speakMessage(message.text, message.id)}
          >
            <Ionicons 
              name={message.isPlaying ? "volume-high" : "volume-medium"} 
              size={20} 
              color="#8B7FD6" 
            />
          </TouchableOpacity>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.nannyBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.nannyText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.headerAvatar, { transform: [{ scale: pulseAnim }] }]}>
            <Image 
              source={require('../../assets/images/mom-avatar.jpg')}
              style={styles.headerAvatarImage}
            />
          </Animated.View>
          <View>
            <Text style={styles.headerTitle}>Chat with Mom</Text>
            <Text style={styles.headerSubtitle}>Your caring AI nurse assistant</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.nannyMessage]}>
            <View style={styles.nannyHeader}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={require('../../assets/images/mom-avatar.jpg')}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.nannyInfo}>
                <Text style={styles.nannyName}>Mom</Text>
                <Text style={styles.nannyTitle}>Personal Nurse Assistant</Text>
              </View>
            </View>
            <View style={[styles.messageBubble, styles.nannyBubble]}>
              <View style={styles.typingIndicator}>
                <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
                <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
                <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Mom anything about parenting..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.voiceContainer}>
          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <Text style={styles.voiceText}>
            {isRecording ? "Tap to stop recording" : "Hold to speak with Mom"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#8B7FD6',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 20,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  nannyMessage: {
    alignItems: 'flex-start',
  },
  nannyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nannyInfo: {
    flex: 1,
  },
  nannyName: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#1F2937',
  },
  nannyTitle: {
    fontSize: 12,
    fontFamily: 'System',
    color: '#8B7FD6',
  },
  speakButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#8B7FD6',
    borderBottomRightRadius: 4,
  },
  nannyBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'System',
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  nannyText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'System',
    color: '#9CA3AF',
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B7FD6',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    fontFamily: 'System',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B7FD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContainer: {
    alignItems: 'center',
  },
  voiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFB4B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#FFB4B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FF6B6B',
    transform: [{ scale: 1.1 }],
  },
  voiceText: {
    fontSize: 12,
    fontFamily: 'System',
    color: '#6B7280',
    textAlign: 'center',
  },
});