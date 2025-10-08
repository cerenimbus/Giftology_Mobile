import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function Loading({ navigation }){
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 1300);
    return () => clearTimeout(t);
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
