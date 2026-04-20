/* RHCM 10/22/25
 * src/screens/Contacts.js
 * Lists contacts retrieved from GetContactList API.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { GetContactList } from '../api';
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
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await GetContactList();
        if (!mounted) return;
        log('Contacts: GetContactList response', res);
        
        if (res?.contacts && Array.isArray(res.contacts)) {
          setContacts(res.contacts);
          log('Contacts: Loaded', res.contacts.length, 'contacts');
        } else {
          log('Contacts: No contacts found');
        }
      } catch (e) {
        log('Contacts: Error loading contacts', e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);
 
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Contacts</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {contacts.length > 0 ? (
          contacts.map((item, i) => (
            <View key={`contact-${item.id || 'unknown'}-${i}`}>
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <Text style={styles.fieldValue}>{item.name || ''}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Status</Text>
                  <Text style={styles.fieldValue}>{item.status || ''}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <Text style={styles.fieldValue}>{item.phone || ''}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Intro</Text>
                  <Text style={styles.fieldValue}>{item.introduction || ''}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Referral</Text>
                  <Text style={styles.fieldValue}>{item.referral || ''}</Text>
                </View>
              </View>
              {i < contacts.length - 1 && <View style={styles.separator} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No contacts found</Text>
        )}
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
  card: {
    paddingVertical: spacingScale(12),
    paddingHorizontal: spacingScale(16)
  },
  fieldRow: {
    flexDirection: 'row',
    paddingVertical: spacingScale(4)
  },
  fieldLabel: {
    fontSize: fontScale(14),
    fontWeight: '700',
    width: spacingScale(80),
    color: '#333'
  },
  fieldValue: {
    fontSize: fontScale(14),
    color: '#555',
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: spacingScale(16)
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