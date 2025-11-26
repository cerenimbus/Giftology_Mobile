/* RHCM 10/22/25
 * src/screens/Forgot.js
 * Password reset screen - validates email and calls ResetPassword.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { ResetPassword } from '../api';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { log } from '../utils/debug';

export default function Forgot({ navigation }){
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e) => {
    if (!e) return false;
    return /^.+@.+\..+$/.test(e);
  };

  const onSend = async () => {
    if (!email) return;
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Must enter a validly formatted email');
      return;
    }
    setLoading(true);
    try {
  log('Forgot: ResetPassword called for', email);
  const res = await ResetPassword({ Password: '', Email: email });
  log('Forgot: ResetPassword response', res);
  if (res?.requestUrl) { try { log('Forgot: ResetPassword URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); log('Forgot: ResetPassword URL (full):', res.requestUrl); } catch(e){} }
      Alert.alert('Reset Password', res?.message || 'Password reset requested', [{ text: 'OK', onPress: () => navigation.replace('Login') }]);
    } catch (e) {
      log('Forgot: exception', e && e.stack ? e.stack : e);
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Reset Password</Text>
      <Text style={{marginTop:8}}>Enter Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="enter_email@email.com" keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity disabled={!email || loading} style={[styles.button, (!email || loading) && {opacity:0.6}]} onPress={onSend}>
        <Text style={{color:'#fff',fontWeight:'700'}}>{loading ? 'Sending...' : 'Send Password'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginTop:12}} onPress={() => navigation.replace('Login')}>
        <Text style={{color:'#666', textAlign:'center'}}>Back to Sign in</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,padding:moderateScale(20),backgroundColor:'#fff'},
  logo:{width:'85%',height:verticalScale(110),alignSelf:'center',marginTop:verticalScale(8)},
  title:{fontSize:fontSize(28),color:'#e84b4b',fontWeight:'700',marginTop:verticalScale(8)},
  input:{marginTop:verticalScale(12),borderWidth:1,borderColor:'#e6e6e6',borderRadius:moderateScale(12),padding:moderateScale(12)},
  button:{backgroundColor:'#e84b4b',padding:moderateScale(14),borderRadius:moderateScale(18),alignItems:'center',marginTop:verticalScale(20)}
});
