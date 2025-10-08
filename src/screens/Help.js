import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Help({ navigation }){
  return (
    <View style={{flex:1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={{marginTop:6,color:'#666'}} onPress={() => navigation.navigate('Dashboard')}>← Back</Text>
        <Text style={styles.title}>Help Screen</Text>
        <View style={styles.card}>
          <Text style={styles.h2}>Lorem ipsum dolor</Text>
          <Text style={styles.p}>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.</Text>

          <Text style={[styles.h2,{marginTop:18}]}>Lorem ipsum</Text>
          <Text style={styles.p}>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat.</Text>
        </View>
      </ScrollView>

      {/* bottom tab is provided by navigator */}
    </View>
  )
}

const styles = StyleSheet.create({
  container:{padding:20,paddingBottom:120},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700'},
  card:{backgroundColor:'#fff',padding:18,marginTop:12,borderRadius:12},
  h2:{fontWeight:'700',fontSize:20},
  p:{fontSize:16,lineHeight:26,marginTop:8},
  tabBar:{position:'absolute',left:0,right:0,bottom:0,height:70,backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderColor:'#f0f0f0'}
});
