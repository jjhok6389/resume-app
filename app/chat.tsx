import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ChatScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>(); // resume 화면에서 전달받은 이름
  const [message, setMessage] = useState(''); // 입력된 메시지 상태

  const handleSend = () => {
    if (message.trim().length > 0) {
      console.log('Sending message:', message);
      // 나중에 여기에 AI API 호출 로직을 추가합니다.
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {/* 대화 내용이 표시될 공간 */}
        <ScrollView style={styles.chatContainer}>
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              안녕하세요, {name}님!
            </Text>
            <Text style={styles.placeholderSubText}>
              AI에게 무엇이든 물어보세요.
            </Text>
          </View>
          {/* 나중에 여기에 대화 기록이 표시됩니다. */}
        </ScrollView>

        {/* 메시지 입력 공간 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지 입력..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5ff',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '50%',
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#555',
  },
  placeholderSubText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9'
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});