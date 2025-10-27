/* RHCM 10/22/25
 * src/screens/Profile.js
 * Minimal profile screen used as a placeholder in the demo app.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Profile(){
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/User.png')} style={styles.avatar} />
      <Text style={styles.name}>Demo User</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center'},
  avatar:{width:96,height:96,borderRadius:48,backgroundColor:'#eee'},
  name:{marginTop:12,fontSize:18}
});
