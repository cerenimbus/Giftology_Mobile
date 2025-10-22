/* RHCM 10/22/25
 * src/screens/Contacts.js
 * Lists potential partners retrieved from GetContactList.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { GetContactList } from '../api';
import { log } from '../utils/debug';

export default function Contacts({ navigation }){
  const [contacts, setContacts] = useState([]);

  const load = async () => {
    try {
      const res = await GetContactList();
      if (res?.requestUrl) { try { log('Contacts: GetContactList URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); log('Contacts: GetContactList URL (full):', res.requestUrl); } catch(e){} }
      if (res?.success) setContacts(res.contacts || []);
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{marginTop:20,marginLeft:12}} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={{color:'#666'}}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Contacts</Text>
      <View style={styles.table}>
        <View style={[styles.row, {borderBottomWidth:1,borderColor:'#eee',paddingVertical:12}]}>
          <Text style={[styles.name,{fontWeight:'700'}]}>Name</Text>
          <Text style={[styles.name,{fontWeight:'700'}]}>Status</Text>
          <Text style={[styles.name,{fontWeight:'700'}]}>Phone</Text>
        </View>
        <FlatList data={contacts} keyExtractor={i=>i.id} renderItem={({item})=> (
          <View style={styles.row}><Text style={styles.name}>{item.name}</Text><Text style={styles.status}>{item.status}</Text><Text style={styles.phone}>{item.phone}</Text></View>
        )} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fff'},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700',margin:20},
  table:{backgroundColor:'#fff',margin:12,borderRadius:12,padding:8,elevation:1,shadowColor:'#000',shadowOpacity:0.03},
  row:{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderColor:'#f0f0f0',paddingVertical:18,paddingHorizontal:6},
  name:{fontSize:16},
  phone:{color:'#555'},
  tabBar:{position:'absolute',left:0,right:0,bottom:0,height:70,backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderColor:'#f0f0f0'}
});
