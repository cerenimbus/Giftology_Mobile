/* RHCM 10/22/25
 * src/screens/Dashboard.js
 * The main dashboard view showing summary metrics and navigation to Tasks,
 * Contacts, Help, and Feedback. Fetches dashboard data via GetDashboard.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GetDashboard } from '../api';
import { fontSize, scale, verticalScale, moderateScale } from '../utils/responsive';
import { log } from '../utils/debug';

export default function Task({ navigation }) {
  const [data, setData] = useState(null);

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

      }
    } catch (e) {
      log('Dashboard: Error extracting tasks', e);
    }
    
    return tasks;
  }
  {/*EF 11/12/2025
    getdashboard datas
    */}
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

        {/* <TouchableOpacity onPress={openMenu} style={styles.menuButton} accessibilityLabel="Open menu">
          <HamburgerIcon size={22} color="#333" />
        </TouchableOpacity> */}
      <TouchableOpacity style={{ position: 'absolute', left: moderateScale(12), top: verticalScale(12), padding: moderateScale(6) }} onPress={() => navigation.goBack()}>
      <Text style={{ color: '#e84b4b' }}>← Back</Text>
      </TouchableOpacity>
        <Text style={styles.title}>Task</Text>

        {/* EF 11/12/2025
            Display task datas from api in the task card
        */}

        {/* Tasks Card */}
        <TouchableOpacity style={[styles.card, { marginTop: verticalScale(16) }]} onPress={() => navigation.navigate('Task')}>

          {(data?.tasksSummary || []).slice(0, 4).map((t, i) => {
            // Some servers return nested structure like t.name = { '#text': 'James' }
              const name = typeof t.name === 'object' ? (t.name['#text'] || JSON.stringify(t.name)) : t.name;
              const task = t.TaskName || t.task || '';
                return (
                  <View key={`ts-${t?.id ?? i}`} style={styles.rowSpace}>
                    <Text style={styles.checkbox}>{t.done ? '☑' : '☐'}</Text>
                    <Text>{`${name || '—'}   ${task}`}</Text>
                    <Text style={{ color: '#999' }}>{t.date || ''}</Text>
                    </View>
                            );
                            })}             

          <Text style={styles.cardTitle}>Tasks</Text>
          {data?.tasks && data.tasks.length > 0 ? (
            data.tasks.slice(0, 3).map((task, i) => (
              <View key={`task-${task?.id ?? i}`} style={styles.rowSpace}>
                <Text numberOfLines={1} style={{ flex: 1 }}>
                  {task.name}
                </Text>
                <Text style={{ color: '#999', marginLeft: moderateScale(8) }}>{task.date}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>No tasks available</Text>
          )}

        </TouchableOpacity>


        {/* DOV summary removed from dashboard per specification */}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroller: { padding: moderateScale(18), paddingBottom: moderateScale(120) },
  title: { fontSize: fontSize(28), color: '#e84b4b', fontWeight: '700', marginTop: verticalScale(6) },
  card: { backgroundColor: '#fff', padding: moderateScale(12), borderRadius: moderateScale(12), marginTop: verticalScale(12), shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  cardTitle: { fontWeight: '700', marginBottom: verticalScale(10), fontSize: fontSize(14) },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: verticalScale(8), alignItems: 'center' },
  pill: { backgroundColor: '#fdeaea', borderRadius: moderateScale(8), padding: moderateScale(8), flexDirection: 'row', justifyContent: 'space-between', marginTop: verticalScale(8) },
  big: { fontSize: fontSize(18), fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: verticalScale(8) },
  metricItem: { width: '50%', paddingVertical: verticalScale(8), alignItems: 'center' },
  metricValue: { fontSize: fontSize(20), fontWeight: '700', color: '#e84b4b' },
  metricLabel: { fontSize: fontSize(12), color: '#666', marginTop: verticalScale(4) },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: verticalScale(70), backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: '#f0f0f0' },
  tab: { alignItems: 'center' }
});