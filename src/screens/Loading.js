import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { getAuthCode } from '../utils/storage';

export default function Loading({ navigation }){
  useEffect(() => {
    let mounted = true;
    (async () => {
      // small delay to show the spinner
      await new Promise(r => setTimeout(r, 800));
      const code = await getAuthCode();
      if (!mounted) return;
      if (code) navigation.replace('Main');
      else navigation.replace('Login');
    })();
    return () => (mounted = false);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relationship Radar</Text>
      <Text style={{marginTop:8}}>Powered by:</Text>
      <Image source={require('../../assets/logo.png')} style={{width:300,height:110,marginTop:12}} resizeMode="contain" />
      <ActivityIndicator size="large" color="#e84b4b" style={{marginTop:40}} />
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff'},
  title:{fontSize:20}
});
