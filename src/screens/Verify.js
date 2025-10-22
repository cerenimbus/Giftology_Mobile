import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
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

const styles = StyleSheet.create({
  container:{flex:1,padding:20,backgroundColor:'#fff'},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700',marginTop:10},
  input:{marginTop:12,borderWidth:1,borderColor:'#e6e6e6',borderRadius:12,padding:14},
  button:{backgroundColor:'#e84b4b',padding:16,borderRadius:18,alignItems:'center',marginTop:20}
});
