import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function Verify({ navigation }){
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify</Text>
      <Text style={{marginTop:8}}>A security code is being texted to your phone. Enter the code below</Text>
      <TextInput style={styles.input} placeholder="Entry field for 6 digit number" keyboardType="number-pad" />
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Main')}>
        <Text style={{color:'#fff',fontWeight:'700'}}>Submit</Text>
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
