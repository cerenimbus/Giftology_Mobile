/* RHCM 10/22/25
 * src/screens/Dashboard.js
 * The main dashboard view showing summary metrics and navigation to Tasks,
 * Contacts, Help, and Feedback. Fetches dashboard data via GetDashboard.
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { HamburgerIcon, BackIcon } from '../components/Icons';
import { GetDashboard } from '../api';
import { log } from '../utils/debug';

export default function Dashboard({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState(null);

  const anim = useRef(new Animated.Value(0)).current;

  function openMenu() {
    setMenuOpen(true);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
  }
  function closeMenu() {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.in(Easing.cubic) }).start(() => setMenuOpen(false));
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await GetDashboard();
        if (!mounted) return;
        if (res?.requestUrl) {
          try { log('Dashboard: GetDashboard URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); log('Dashboard: GetDashboard URL (full):', res.requestUrl); } catch (e) {}
        }
        if (res?.success) setData(res.data);
      } catch (e) {
        log('Dashboard: GetDashboard exception', e && e.stack ? e.stack : e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroller}>
        <Text style={styles.title}></Text>

        <TouchableOpacity onPress={openMenu} style={styles.menuButton} accessibilityLabel="Open menu">
          <HamburgerIcon size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { marginTop: 16 }]} onPress={() => navigation.navigate('Task')}>
          <Text style={styles.cardTitle}>Task</Text>
          {(data?.tasksSummary || []).slice(0, 4).map((t, i) => {
            // Some servers return nested structure like t.name = { '#text': 'James' }
              const name = typeof t.name === 'object' ? (t.name['#text'] || JSON.stringify(t.name)) : t.name;
              const task = t.TaskName || t.task || '';
                return (
                  <View key={i} style={styles.rowSpace}>
                    <Text style={styles.checkbox}>{t.done ? '☑' : '☐'}</Text>
                    <Text>{`${name || '—'}   ${task}`}</Text>
                    <Text style={{ color: '#999' }}>{t.date || ''}</Text>
                    </View>
                            );
                            })}             
        </TouchableOpacity>

        {/* DOV summary removed from dashboard per specification */}
      </ScrollView>

      {menuOpen && (
        <View style={styles.menuOverlay} pointerEvents="box-none">
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.menuCard,
              { transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }], opacity: anim },
            ]}
          >
            <TouchableOpacity onPress={closeMenu} style={styles.menuClose}>
              <BackIcon size={18} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Main'); }}>
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Task'); }}>
              <Text style={styles.menuText}>Tasks</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Preview'); }}>
              <Text style={styles.menuText}>DOV & Dates</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Contacts'); }}>
              <Text style={styles.menuText}>Potential Partners</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Preview'); }}>
              <Text style={styles.menuText}>Reports</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Help'); }}>
              <Text style={styles.menuText}>Help</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('Feedback'); }}>
              <Text style={styles.menuText}>Feedback</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroller: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 36, color: '#e84b4b', fontWeight: '700', marginTop: 10 },
  menuButton: { position: 'absolute', right: 20, top: 28, padding: 8, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  cardTitle: { fontWeight: '700', marginBottom: 12 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  pill: { backgroundColor: '#fdeaea', borderRadius: 8, padding: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  big: { fontSize: 20, fontWeight: '700' },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: '#f0f0f0' },
  tab: { alignItems: 'center' },
  menuOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'flex-end' },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'transparent' },
  menuCard: { width: 300, marginTop: 80, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 8, shadowColor: '#000', shadowOpacity: 0.08 },
  menuClose: { alignSelf: 'flex-end', padding: 6 },
  menuItem: { paddingVertical: 12 },
  menuText: { fontSize: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 6 }
});


