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

  // Helper function to extract metrics from nested task structure (Restored Original Logic)
  function extractMetrics(tasksSummary) {
    if (!tasksSummary || !Array.isArray(tasksSummary) || tasksSummary.length === 0) {
      return null;
    }
    
    // Navigate through the nested structure to find metrics
    try {
      const nested = tasksSummary[0]?.name?.Task?.TaskName;
      if (nested) {
        return {
          harmlessStarter: parseInt(nested.HarmlessStarter) || 0,
          greenlight: parseInt(nested.Greenlight) || 0,
          clarityConvos: parseInt(nested.ClarityConvos) || 0,
          totalDOV: parseInt(nested.TotalDOV) || 0,
          introduction: parseInt(nested.Introduction) || 0,
          referral: parseInt(nested.Referral) || 0,
          partner: parseInt(nested.Partner) || 0
        };
      }
    } catch (e) {
      log('Dashboard: Error extracting metrics', e);
    }
    return null;
  }

  // Helper function to extract tasks from the malformed structure (Restored Original Logic)
  function extractTasks(tasksSummary) {
    const tasks = [];
    
    if (!tasksSummary || !Array.isArray(tasksSummary) || tasksSummary.length === 0) {
      return tasks;
    }
    
    try {
      const firstTask = tasksSummary[0]?.name;
      if (firstTask) {
        // First task
        tasks.push({
          name: firstTask['#text'] || 'Untitled Task',
          date: firstTask.TaskName?.Date || ''
        });
        
        // Second task (nested inside)
        const secondTask = firstTask.Task;
        if (secondTask) {
          const taskName = secondTask.TaskName?.['#text'] || secondTask.Name || 'Untitled Task';
          const taskDate = secondTask.TaskName?.TaskName?.Date || '';
          tasks.push({
            name: taskName,
            date: taskDate
          });
        }
      }
    } catch (e) {
      log('Dashboard: Error extracting tasks', e);
    }
    
    return tasks;
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await GetDashboard();
        if (!mounted) return;
        
        if (res?.requestUrl) {
          try { 
            log('Dashboard: GetDashboard URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); 
            log('Dashboard: GetDashboard URL (full):', res.requestUrl); 
          } catch (e) {}
        }
        
        log('Dashboard: Full API response:', JSON.stringify(res, null, 2));
        
        if (res?.success && res?.data) {
          const apiData = res.data;
          
          // Ensure arrays - API already returns lowercase keys
          const ensureArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          };
          
          const parsedData = {
            // FIX: Pass tasksSummary to the task extractors (Original behavior)
            tasks: extractTasks(apiData.tasksSummary),
            // FIX: Ensure bestPartner is correctly mapped
            bestPartners: ensureArray(apiData.bestPartner),
            // FIX: Ensure current is correctly mapped to currentPartners (The previous fix that worked)
            currentPartners: ensureArray(apiData.current),
            recent: ensureArray(apiData.recent),
            dov: ensureArray(apiData.dov),
            // FIX: Pass tasksSummary to the metrics extractors (Original behavior)
            metrics: extractMetrics(apiData.tasksSummary) || {
              harmlessStarter: 0,
              greenlight: 0,
              clarityConvos: 0,
              totalDOV: 0,
              introduction: 0,
              referral: 0,
              partner: 0
            }
          };
          
          log('Dashboard: Parsed data:', JSON.stringify(parsedData, null, 2));
          setData(parsedData);
        } else {
          log('Dashboard: API response not successful', res);
        }
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

        {/* Tasks Card */}
        <TouchableOpacity style={[styles.card, { marginTop: 16 }]} onPress={() => navigation.navigate('Task')}>
<<<<<<< HEAD
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
=======
          <Text style={styles.cardTitle}>Tasks</Text>
          {data?.tasks && data.tasks.length > 0 ? (
            data.tasks.slice(0, 3).map((task, i) => (
              <View key={i} style={styles.rowSpace}>
                <Text numberOfLines={1} style={{ flex: 1 }}>
                  {task.name}
                </Text>
                <Text style={{ color: '#999', marginLeft: 8 }}>{task.date}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>No tasks available</Text>
          )}
>>>>>>> 4ce48f6dbdeb000111651bdb233782b2b33f21c9
        </TouchableOpacity>

        {/* Best Partners Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Partners</Text>
          {data?.bestPartners && data.bestPartners.length > 0 ? (
            data.bestPartners.slice(0, 3).map((partner, i) => (
              <View key={i} style={styles.rowSpace}>
                <Text numberOfLines={1} style={{ flex: 1 }}>{partner.Name}</Text>
                <Text style={{ color: '#e84b4b', fontWeight: '600' }}>
                  ${partner.Amount || 0}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>No partner data available</Text>
          )}
        </View>

        {/* Best Current Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Partners</Text>
          {data?.currentPartners && data.currentPartners.length > 0 ? (
            data.currentPartners.slice(0, 3).map((partner, i) => (
              <View key={i} style={styles.rowSpace}>
                <Text numberOfLines={1} style={{ flex: 1 }}>{partner.Name}</Text>
                {/* Display the Phone number for Current Partners, as Amount is likely missing */}
                <Text style={{ color: '#e84b4b', fontWeight: '600' }}>
                  {partner.Phone ? partner.Phone.replace(/[\(\)]/g, '').replace(' ', '') : partner.Amount ? `$${partner.Amount}` : 'N/A'} 
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>No partner data available</Text>
          )}
        </View>

        {/* Recent Contacts Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Contacts</Text>
          {data?.recent && data.recent.length > 0 ? (
            data.recent.slice(0, 3).map((contact, i) => (
              <View key={i} style={styles.rowSpace}>
                <Text numberOfLines={1} style={{ flex: 1 }}>{contact.Name}</Text>
                <Text style={{ color: '#999', fontSize: 12 }}>{contact.Phone || ''}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>No recent contacts</Text>
          )}
        </View>

        {/* Metrics Summary Card */}
        {data?.metrics && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{data.metrics.totalDOV}</Text>
                <Text style={styles.metricLabel}>Total DOV</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{data.metrics.partner}</Text>
                <Text style={styles.metricLabel}>Partners</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{data.metrics.greenlight}</Text>
                <Text style={styles.metricLabel}>Greenlight</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{data.metrics.clarityConvos}</Text>
                <Text style={styles.metricLabel}>Clarity Convos</Text>
              </View>
            </View>
          </View>
        )}

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
  cardTitle: { fontWeight: '700', marginBottom: 12, fontSize: 16 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, alignItems: 'center' },
  pill: { backgroundColor: '#fdeaea', borderRadius: 8, padding: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  big: { fontSize: 20, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  metricItem: { width: '50%', paddingVertical: 12, alignItems: 'center' },
  metricValue: { fontSize: 24, fontWeight: '700', color: '#e84b4b' },
  metricLabel: { fontSize: 12, color: '#666', marginTop: 4 },
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