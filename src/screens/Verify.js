/* RHCM 10/22/25
 * src/screens/Verify.js
 * Verification screen where user enters a 6-digit code received via SMS.
 * Calls AuthorizeDeviceID and routes to Main on success.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthorizeDeviceID } from '../api';
import { log } from '../utils/debug';
import { getAuthCode, removeAuthCode } from '../utils/storage';

export default function Verify({ navigation }){
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      log('Verify: submitting code', code);
  const res = await AuthorizeDeviceID({ SecurityCode: code });
  log('Verify: AuthorizeDeviceID response', res);
  if (res?.requestUrl) { try { log('Verify: AuthorizeDeviceID URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); log('Verify: AuthorizeDeviceID URL (full):', res.requestUrl); } catch(e){} }
      if (res?.success) {
        navigation.replace('Main');
      } else {
        Alert.alert('Verification failed', res?.message || 'Unknown error', [{ text: 'OK', onPress: () => navigation.replace('Login') }]);
        await removeAuthCode();
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify</Text>
      <Text style={{marginTop:8}}>A security code is being texted to your phone. Enter the code below</Text>
      <TextInput value={code} onChangeText={t => setCode(t.replace(/\D/g,'').slice(0,6))} style={styles.input} placeholder="Entry field for 6 digit number" keyboardType="number-pad" />
      <TouchableOpacity disabled={code.length !== 6 || loading} style={[styles.button, (code.length !== 6 || loading) && {opacity:0.6}]} onPress={onSubmit}>
        <Text style={{color:'#fff',fontWeight:'700'}}>{loading ? 'Submitting...' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,        
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.08,       
    color: '#e84b4b',
    fontWeight: '700',
    marginTop: height * 0.010,    
  },
  input: {
    marginTop: height * 0.03,     
    borderWidth: width * 0.003,   
    borderColor: '#e6e6e6',
    borderRadius: width * 0.03,   
    paddingVertical: height * 0.025,  
    paddingHorizontal: width * 0.025, 
  },
  button: {
    backgroundColor: '#e84b4b',
    paddingVertical: height * 0.02,    
    paddingHorizontal: width * 0.04,   
    borderRadius: width * 0.045,       
    alignItems: 'center',
    marginTop: height * 0.02          
  },
});