/* RHCM 10/22/25
 * src/screens/Feedback.js
 * Simple feedback form which posts free-text comments to UpdateFeedback.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { BackIcon } from '../components/Icons';
import { UpdateFeedback } from '../api';
import { log } from '../utils/debug';

import { SCREEN, scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';

const { WIDTH: width } = SCREEN;
const isTablet = width >= 768;
const localScale = isTablet ? Math.min(width / 375, 1.5) : width / 375; // preserve the previous cap behavior for any legacy usage
const maxCardWidth = isTablet ? width * 0.6 : width * 0.95; // Limit card width on tablets

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon size={moderateScale(28)} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Feedback</Text>
      </View>
      <View style={styles.card}>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />
        <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="Phone" />

        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxIcon}>☐</Text>
          <Text style={styles.checkboxText}>I would like a response.</Text>
        </View>
        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxIcon}>☐</Text>
          <Text style={styles.checkboxText}>Email me about updates.</Text>
        </View>

        <TextInput value={comment} onChangeText={setComment} style={styles.commentInput} placeholder="" multiline />

        <TouchableOpacity disabled={!comment || loading} style={[styles.button, (!comment || loading) && styles.buttonDisabled]} onPress={onSubmit}>
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    paddingBottom: verticalScale(width * 0.15),
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: isTablet ? 'center' : 'stretch'
  },
  header: {
    width: '100%',
    maxWidth: maxCardWidth,
    alignSelf: isTablet ? 'center' : 'stretch'
  },
  backButton: {
    padding: moderateScale(6),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(4),
    alignSelf: 'flex-start'
  },
  title: {
    fontSize: fontSize(28),
    color: '#e84b4b',
    fontWeight: '700',
    marginTop: verticalScale(4)
  },
  card: {
    backgroundColor: '#fff',
    padding: moderateScale(width * 0.03),
    marginTop: verticalScale(width * 0.03),
    borderRadius: moderateScale(12),
    width: '100%',
    maxWidth: maxCardWidth,
    alignSelf: isTablet ? 'center' : 'stretch'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginTop: verticalScale(8),
    fontSize: fontSize(16)
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12)
  },
  checkboxIcon: {
    fontSize: fontSize(16),
    marginRight: moderateScale(8)
  },
  checkboxText: {
    fontSize: fontSize(14)
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginTop: verticalScale(16),
    textAlignVertical: 'top',
    minHeight: verticalScale(width * 0.6),
    fontSize: fontSize(14)
  },
  button: {
    backgroundColor: '#e84b4b',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: verticalScale(16)
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize(14)
  }
});
