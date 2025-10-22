import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, Linking } from 'react-native';
import { AuthorizeEmployee } from '../api';
import { setAuthCode, getAuthCode } from '../utils/storage';
import { log, setDebugFlag, getDebugFlag } from '../utils/debug';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('helloworld@gmail.com');
  const [password, setPassword] = useState('password');
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const code = await getAuthCode();
      if (code) navigation.replace('Main');
    })();
  }, []);

  const onSignIn = async () => {
    if (!termsChecked) return;
    setLoading(true);
    try {
      log('Login: sign-in pressed', { email: email.replace(/(.{2}).+(@.+)/,'$1***$2'), termsChecked });
      const res = await AuthorizeEmployee({ UserName: email, Password: password, GiftologyVersion: 1, Language: 'EN' });
      // log the response and the request URL used
      log('Login: AuthorizeEmployee response', res);
      if (res?.requestUrl) {
        // masked AC in URL
        try {
          const masked = res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***');
          log('Login: AuthorizeEmployee URL (masked):', masked);
          log('Login: AuthorizeEmployee URL (full):', res.requestUrl);
        } catch (e) {
          log('Login: error masking URL', e && e.stack ? e.stack : e);
        }
      }
      if (res?.success) {
        // server will send SMS code to phone; server may return Auth in parsed payload
        const ac = res?.parsed?.Auth || res?.parsed?.auth || '';
        if (ac) await setAuthCode(ac);
        navigation.navigate('Verify');
      } else {
        Alert.alert('Sign in failed', res?.message || 'Unable to authorize employee');
        log('Login failed', res);
      }
    } catch (e) {
      Alert.alert('Error', String(e));
      log('Login exception', e && e.stack ? e.stack : e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.relationTitle}>Relationship Radar</Text>
      <Text style={styles.powered}>Powered by:</Text>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Log in</Text>

      <Text style={styles.label}>Email address</Text>
      <TextInput style={styles.input} placeholder="helloworld@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <View style={styles.row}>
        <TouchableOpacity onPress={() => setTermsChecked(s => !s)} style={{marginRight:8}}>
          <Text style={styles.checkbox}>{termsChecked ? '☑' : '☐'}</Text>
        </TouchableOpacity>
        <Text style={styles.small}>Accept <Text style={{color:'#e84b4b'}} onPress={() => Linking.openURL('https://radar.giftologygroup.com/terms.html')}>Terms</Text> and <Text style={{color:'#e84b4b'}} onPress={() => Linking.openURL('https://radar.giftologygroup.com/privacypolicy.html')}>Privacy Policy</Text></Text>
      </View>

      <TouchableOpacity disabled={!termsChecked || loading} style={[styles.button, (!termsChecked || loading) && {opacity:0.6}]} onPress={onSignIn}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Log in'}</Text>
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
