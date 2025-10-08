import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function Feedback({ navigation }){
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{marginTop:6,color:'#666'}} onPress={() => navigation.navigate('Dashboard')}>← Back</Text>
      <Text style={styles.title}>Feedback</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Name" />
        <TextInput style={styles.input} placeholder="Email" />
        <TextInput style={styles.input} placeholder="Phone" />

        <View style={{flexDirection:'row',alignItems:'center',marginTop:12}}>
          <Text style={{fontSize:20,marginRight:8}}>☐</Text>
          <Text>I would like a response.</Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
          <Text style={{fontSize:20,marginRight:8}}>☐</Text>
          <Text>Email me about updates.</Text>
        </View>

        <TextInput style={[styles.input,{height:220,marginTop:16,textAlignVertical:'top'}]} placeholder="" multiline />

        <TouchableOpacity style={styles.button}><Text style={{color:'#fff',fontWeight:'700'}}>Submit</Text></TouchableOpacity>
      </View>

      {/* tab bar moved to navigator */}
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
