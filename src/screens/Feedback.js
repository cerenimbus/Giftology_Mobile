/* RHCM 10/22/25
 * src/screens/Feedback.js
 * Simple feedback form which posts free-text comments to UpdateFeedback.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UpdateFeedback } from '../api';
import { log } from '../utils/debug';

export default function Feedback({ navigation }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e) => {
    if (!e) return false;
    return /^.+@.+\..+$/.test(e);
  };

  const onSubmit = async () => {
    if (!comment) return;
    if (email && !isValidEmail(email)) {
      Alert.alert('Invalid email', 'Must enter a validly formatted email');
      return;
    }
    setLoading(true);
    try {
      log('Feedback: submitting', { name, email: email ? email.replace(/(.{2}).+(@.+)/,'$1***$2') : '', phone });
      const res = await UpdateFeedback({ Name: name, Email: email, Phone: phone, Comment: comment, Response: 0, Update: 0 });
  log('Feedback: response', res);
  if (res?.requestUrl) { try { log('Feedback: UpdateFeedback URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); log('Feedback: UpdateFeedback URL (full):', res.requestUrl); } catch(e){} }
      if (res?.success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', res?.message || 'Failed to submit feedback');
      }
    } catch (e) {
      log('Feedback exception', e && e.stack ? e.stack : e);
      Alert.alert('Error', String(e));
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{marginTop:6,color:'#666'}} onPress={() => navigation.navigate('Dashboard')}>← Back</Text>
      <Text style={styles.title}>Feedback</Text>
      <View style={styles.card}>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />
        <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="Phone" />

        <View style={{flexDirection:'row',alignItems:'center',marginTop:12}}>
          <Text style={{fontSize:20,marginRight:8}}>☐</Text>
          <Text>I would like a response.</Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
          <Text style={{fontSize:20,marginRight:8}}>☐</Text>
          <Text>Email me about updates.</Text>
        </View>

        <TextInput value={comment} onChangeText={setComment} style={[styles.input,{height:220,marginTop:16,textAlignVertical:'top'}]} placeholder="" multiline />

        <TouchableOpacity disabled={!comment || loading} style={[styles.button, (!comment || loading) && {opacity:0.6}]} onPress={onSubmit}><Text style={{color:'#fff',fontWeight:'700'}}>{loading ? 'Submitting...' : 'Submit'}</Text></TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:{padding:20,paddingBottom:120,backgroundColor:'#fff'},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700'},
  card:{backgroundColor:'#fff',padding:12,marginTop:12,borderRadius:12},
  input:{borderWidth:1,borderColor:'#e6e6e6',borderRadius:12,padding:14,marginTop:8},
  button:{backgroundColor:'#e84b4b',padding:16,borderRadius:12,alignItems:'center',marginTop:16},
  tabBar:{position:'absolute',left:0,right:0,bottom:0,height:70,backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderColor:'#f0f0f0'}
});
