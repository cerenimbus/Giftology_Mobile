/* RHCM 10/22/25
 * src/screens/Contacts.js
 * Lists potential partners retrieved from GetDashboard (combines BestPartner, Current, Recent).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GetDashboard } from '../api';
import { log } from '../utils/debug';

export default function Contacts({ navigation }){
  const [contacts, setContacts] = useState([]);
/* LP 11/12/25
 * src/screens/Contacts.js
 * getdashboard
 */
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await GetDashboard();
        if (!mounted) return;
        log('Contacts: GetDashboard response', res);
        if (res?.success && res?.data) {
          // Combine all contacts from BestPartner, Current, and Recent
          const allContacts = [];
          
          // Add BestPartner contacts
          if (res.data.bestPartner) {
            const bestPartners = Array.isArray(res.data.bestPartner) ? res.data.bestPartner : [res.data.bestPartner];
            bestPartners.forEach(c => {
              if (c) {
                allContacts.push({
                  id: String(c.ContactSerial || c.contactSerial || ''),
                  name: c.Name || c.name || '',
                  status: 'Best Partner',
                  phone: c.Phone || c.phone || ''
                });
              }
            });
          }
          
          // Add Current contacts
          if (res.data.current) {
            const current = Array.isArray(res.data.current) ? res.data.current : [res.data.current];
            current.forEach(c => {
              if (c) {
                allContacts.push({
                  id: String(c.ContactSerial || c.contactSerial || ''),
                  name: c.Name || c.name || '',
                  status: 'Current',
                  phone: c.Phone || c.phone || ''
                });
              }
            });
          }
          
          // Add Recent contacts
          if (res.data.recent) {
            const recent = Array.isArray(res.data.recent) ? res.data.recent : [res.data.recent];
            recent.forEach(c => {
              if (c) {
                allContacts.push({
                  id: String(c.ContactSerial || c.contactSerial || ''),
                  name: c.Name || c.name || '',
                  status: 'Recent',
                  phone: c.Phone || c.phone || ''
                });
              }
            });
          }
          
          setContacts(allContacts);
          log('Contacts: Loaded', allContacts.length, 'contacts from GetDashboard');
        } else {
          log('Contacts: GetDashboard failed', res);
        }
      } catch (e) {
        log('Contacts: GetDashboard error', e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);
 
  return (
    <View style={styles.container}>
      <TouchableOpacity style={{marginTop:20,marginLeft:12}} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={{color:'#666'}}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Contacts</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.name, styles.headerText]}>Name</Text>
            <Text style={[styles.status, styles.headerText]}>Status</Text>
            <Text style={[styles.phone, styles.headerText]}>Phone</Text>
          </View>
          {contacts.length > 0 ? (
            contacts.map((item, i) => (
              <View key={item.id || i} style={styles.row}>
                <Text style={styles.name}>{item.name || ''}</Text>
                <Text style={styles.status}>{item.status || ''}</Text>
                <Text style={styles.phone}>{item.phone || ''}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No contacts found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fff'},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700',margin:20},
  scrollView:{flex:1},
  scrollContent:{paddingBottom:20},
  table:{backgroundColor:'#fff',margin:12,borderRadius:12,padding:8,elevation:1,shadowColor:'#000',shadowOpacity:0.03},
  row:{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderColor:'#f0f0f0',paddingVertical:18,paddingHorizontal:6},
  headerRow:{borderBottomWidth:1,borderColor:'#eee',paddingVertical:12},
  headerText:{fontWeight:'700'},
  name:{fontSize:16,flex:1},
  status:{fontSize:16,flex:1,textAlign:'center'},
  phone:{fontSize:16,color:'#555',flex:1,textAlign:'right'},
  emptyText:{padding:20,textAlign:'center',color:'#999'},
  tabBar:{position:'absolute',left:0,right:0,bottom:0,height:70,backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderColor:'#f0f0f0'}
});
