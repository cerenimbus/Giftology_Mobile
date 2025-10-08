import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const DATA = new Array(12).fill(0).map((_,i)=>({id:String(i), name: ['Charly Oman','Jhon de rosa','Martin Mayers','kent Mayers','kerk Mayers','Allen Mayers','willma Mayers','Alexander Ace','kent Mayers','kent Mayers'][i%10], phone: '(225) 555-0118'}))

export default function Contacts(){
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      <View style={styles.table}>
        <FlatList data={DATA} keyExtractor={i=>i.id} renderItem={({item})=> (
          <View style={styles.row}><Text style={styles.name}>{item.name}</Text><Text style={styles.phone}>{item.phone}</Text></View>
        )} />
      </View>

      {/* tab bar moved to navigator */}
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
