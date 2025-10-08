import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

export default function Forgot({ navigation }){
  return (
    <View style={styles.container}>
  <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={{marginTop:8}}>Enter Email</Text>
      <TextInput style={styles.input} placeholder="enter_email@email.com" />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Verify')}>
        <Text style={{color:'#fff',fontWeight:'700'}}>Submit</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20,backgroundColor:'#fff'},
  logo:{width:'85%',height:110,alignSelf:'center',marginTop:8},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700',marginTop:8},
  input:{marginTop:12,borderWidth:1,borderColor:'#e6e6e6',borderRadius:12,padding:14},
  button:{backgroundColor:'#e84b4b',padding:16,borderRadius:18,alignItems:'center',marginTop:20}
});
