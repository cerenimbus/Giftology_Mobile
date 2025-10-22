import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { GetHelp } from '../api';
import { log } from '../utils/debug';

export default function Help({ navigation }){

  const showHelp = async (topic) => {
    try {
      const res = await GetHelp({ topic });
      if (res?.requestUrl) { try { log('Help: GetHelp URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); log('Help: GetHelp URL (full):', res.requestUrl); } catch(e){} }
      Alert.alert(topic, res?.help || 'No help content', [{ text: 'OK', onPress: () => {} }]);
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View style={{flex:1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={{marginTop:6,color:'#666'}} onPress={() => navigation.navigate('Dashboard')}>← Back</Text>
        <Text style={styles.title}>Help</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.helpRow} onPress={() => showHelp('Procedure')}>
            <Text style={styles.h2}>Procedures</Text>
            <Text style={{color:'#e84b4b'}}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpRow} onPress={() => showHelp('Team')}>
            <Text style={styles.h2}>Teams</Text>
            <Text style={{color:'#e84b4b'}}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpRow} onPress={() => showHelp('Picture')}>
            <Text style={styles.h2}>Picture</Text>
            <Text style={{color:'#e84b4b'}}>View</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
