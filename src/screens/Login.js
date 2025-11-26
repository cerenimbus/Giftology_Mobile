/*
 * RHCM 10/22/25
 * src/screens/Login.js
 * Login screen: accepts username/password and calls AuthorizeUser.
 * Intent comments explain the auth flow: server may return an AC (authorization
 * code) used for device verification; if present we persist it for subsequent calls.
 */
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  Linking, 
  useWindowDimensions, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView 
} from 'react-native';
import { AuthorizeUser } from '../api';
import { setAuthCode, getAuthCode } from '../utils/storage';
import { log, setDebugFlag, getDebugFlag } from '../utils/debug';
import { fontSize, scale, verticalScale, moderateScale } from '../utils/responsive';

export default function Login({ navigation }) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hook for responsive layout calculations
  const { width, height } = useWindowDimensions();

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
      log('Login: sign-in pressed', { email: email?.replace(/(.{2}).+(@.+)/,'$1***$2'), termsChecked });
      const res = await AuthorizeUser({ UserName: email, Password: password, GiftologyVersion: 1, Language: 'EN' });
      // log the response and the request URL used
      log('Login: AuthorizeUser response', res);
      if (res?.requestUrl) {
        // masked AC in URL
        try {
          const masked = res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***');
          log('Login: AuthorizeUser URL (masked):', masked);
          log('Login: AuthorizeUser URL (full):', res.requestUrl);
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

  // Responsive Styles Calculation
  // We limit the max width to 500px for tablets/desktop so inputs don't stretch too wide
  const contentWidth = width > 600 ? Math.min(500, width * 0.8) : '100%';
  const isLandscape = width > height;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: isLandscape ? 40 : 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.innerContainer, { width: contentWidth }]}>
            <Text style={styles.relationTitle}>Relationship Radar</Text>
            <Text style={styles.powered}>Powered by:</Text>
            
            <Image 
              source={require('../../assets/logo.png')} 
              style={[styles.logo, { height: Math.min(verticalScale(110), height * 0.18) }]} 
              resizeMode="contain" 
            />
            
            <Text style={styles.title}>Log in</Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />

            <View style={styles.row}>
              <TouchableOpacity onPress={() => setTermsChecked(s => !s)} style={{marginRight:moderateScale(8)}}>
                <Text style={styles.checkbox}>{termsChecked ? '☑' : '☐'}</Text>
              </TouchableOpacity>
              <Text style={styles.small}>
                Accept <Text style={{color:'#e84b4b'}} onPress={() => Linking.openURL('https://radar.giftologygroup.com/terms.html')}>Terms</Text> and <Text style={{color:'#e84b4b'}} onPress={() => Linking.openURL('https://radar.giftologygroup.com/privacypolicy.html')}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity 
              disabled={!termsChecked || loading} 
              style={[styles.button, (!termsChecked || loading) && {opacity:0.6}]} 
              onPress={onSignIn}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Log in'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', // Centers content horizontally for large screens
    padding: moderateScale(18),
  },
  innerContainer: {
    // Width is handled dynamically in render
    alignSelf: 'center',
  },
  logo: {
    width: '85%',
    alignSelf: 'center',
    marginTop: verticalScale(18),
  },
  title: {
    fontSize: fontSize(32),
    color: '#e84b4b',
    fontWeight: '700',
    marginTop: verticalScale(12),
  },
  relationTitle: {
    fontSize: fontSize(12),
    color: '#222',
    marginTop: verticalScale(4),
    marginLeft: moderateScale(2),
  },
  powered: {
    fontSize: fontSize(10),
    color: '#444',
    marginTop: verticalScale(3),
    marginLeft: moderateScale(2),
  },
  label: {
    marginTop: verticalScale(12),
    color: '#333',
  },
  input: {
    marginTop: verticalScale(8),
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    width: '100%',
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: verticalScale(12),
    flexWrap: 'wrap', // Allows text to wrap on very small screens
  },
  checkbox: { 
    fontSize: fontSize(18), 
    marginRight: moderateScale(8) 
  },
  small: { 
    color: '#333',
    flex: 1, // Ensures text takes up remaining space
  },
  button: {
    backgroundColor: '#e84b4b',
    padding: moderateScale(14),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    marginTop: verticalScale(20),
    width: '100%',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  forgot: { 
    textAlign: 'center', 
    marginTop: verticalScale(10), 
    color: '#666' 
  },
});