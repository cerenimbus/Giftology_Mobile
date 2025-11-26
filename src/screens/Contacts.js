/* RHCM 10/22/25
 * src/screens/Contacts.js
 * Lists potential partners retrieved from GetDashboard (combines BestPartner, Current, Recent).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { GetDashboard } from '../api';
import { log } from '../utils/debug';

// Improved responsive scaling with tablet support
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375; // iPhone base width

// Moderate scale - less aggressive scaling for tablets
const moderateScale = (size, factor = 0.5) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return size + (scale - 1) * size * factor;
};

// Font scale with maximum cap for tablets
const fontScale = (size) => {
  const scaled = moderateScale(size, 0.3); // Even less aggressive for fonts
  const maxSize = size * 1.5; // Cap at 150% of original size
  return Math.min(scaled, maxSize);
};

// Spacing scale with maximum cap
const spacingScale = (size) => {
  const scaled = moderateScale(size, 0.4);
  const maxSize = size * 1.8; // Cap at 180% of original
  return Math.min(scaled, maxSize);
};

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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
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
                <View key={`contact-${item.id ?? i}`} style={styles.row}>
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
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    marginTop: spacingScale(20),
    marginLeft: spacingScale(12),
    padding: spacingScale(8)
  },
  backText: {
    color: '#666',
    fontSize: fontScale(14)
  },
  title: {
    fontSize: fontScale(36),
    color: '#e84b4b',
    fontWeight: '700',
    margin: spacingScale(20)
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: spacingScale(20)
  },
  table: {
    backgroundColor: '#fff',
    margin: spacingScale(12),
    borderRadius: moderateScale(12, 0.3),
    padding: spacingScale(8),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: spacingScale(18),
    paddingHorizontal: spacingScale(6)
  },
  headerRow: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: spacingScale(12)
  },
  headerText: {
    fontWeight: '700',
    fontSize: fontScale(16)
  },
  name: {
    fontSize: fontScale(16),
    flex: 1
  },
  status: {
    fontSize: fontScale(16),
    flex: 1,
    textAlign: 'center'
  },
  phone: {
    fontSize: fontScale(16),
    color: '#555',
    flex: 1,
    textAlign: 'right'
  },
  emptyText: {
    padding: spacingScale(20),
    textAlign: 'center',
    color: '#999',
    fontSize: fontScale(14)
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: spacingScale(70),
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#f0f0f0'
  }
});