import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function Login({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
  <Text style={styles.relationTitle}>Relationship Radar</Text>
  <Text style={styles.powered}>Powered by:</Text>
  <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
  <Text style={styles.title}>Log in</Text>

      <Text style={styles.label}>Email address</Text>
      <TextInput style={styles.input} placeholder="helloworld@gmail.com" defaultValue="helloworld@gmail.com" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry defaultValue="password" />

      <View style={styles.row}>
        <Text style={styles.checkbox}>☑</Text>
        <Text style={styles.small}>Accept terms and Privacy Policy</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Verify')}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  logo: {
    width: '85%',
    height: 110,
    alignSelf: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 40,
    color: '#e84b4b',
    fontWeight: '700',
    marginTop: 20,
  },
  relationTitle: {
    fontSize: 14,
    color: '#222',
    marginTop: 6,
    marginLeft: 2,
  },
  powered: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    marginLeft: 2,
  },
  label: {
    marginTop: 18,
    color: '#333',
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 12,
    padding: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkbox: { fontSize: 18, marginRight: 8 },
  small: { color: '#333' },
  button: {
    backgroundColor: '#e84b4b',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  forgot: { textAlign: 'center', marginTop: 12, color: '#666' },
});
