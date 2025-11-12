/* RHCM 10/22/25
 * src/screens/Task.js
 * Task list and simple task completion. Loads tasks with GetTaskList and
 * calls UpdateTask to mark completion.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import BarChart from '../components/BarChart';
import { GetTaskList, UpdateTask, GetDashboard } from '../api';
import { log } from '../utils/debug';

export default function Task({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null); // holds summary data

  // 🔹 Load dashboard data from API
  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        const res = await GetDashboard();
        if (!mounted) return;
        if (res?.success) {
          setDashboardData(res.data);
          log('Task: GetDashboard data', res.data);
        } else {
          log('Task: GetDashboard failed', res);
        }
      } catch (e) {
        log('Task: GetDashboard error', e);
      }
    }
    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  // 🔹 Load task list from API
  const load = async () => {
    setLoading(true);
    try {
      const res = await GetTaskList();
      log('Task: GetTaskList response', res);
      if (res?.requestUrl) {
        try {
          log('Task: GetTaskList URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/, '$1***'));
          log('Task: GetTaskList URL (full):', res.requestUrl);
        } catch (e) {}
      }
      if (res?.success) setTasks(res.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onTapTask = (task) => {
    Alert.alert('Mark complete?', 'Are you sure you want to mark this task completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setLoading(true);
          try {
            log('Task: update requested', task.id);
            const res = await UpdateTask({ Task: task.id, Status: 1 });
            log('Task: UpdateTask response', res);
            if (res?.requestUrl) {
              try {
                log('Task: UpdateTask URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/, '$1***'));
                log('Task: UpdateTask URL (full):', res.requestUrl);
              } catch (e) {}
            }
            await load();
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Helper for safe values
  const safe = (v) => (v !== undefined && v !== null ? v : '—');

  // Extract dashboard fields (handle null gracefully)
  const bestPartners = dashboardData?.bestPartner || [];
  const currentRunners = dashboardData?.current || [];
  const recentPartners = dashboardData?.recent || [];
  const outcomes = dashboardData?.outcomes || {};

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Dashboard</Text>
      <TouchableOpacity style={{ position: 'absolute', left: 18, top: 24, padding: 8 }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#e84b4b' }}>Back</Text>
      </TouchableOpacity>

      {/* ✅ Best Referral Partner (from GetDashboard) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Referral Partner</Text>
        {bestPartners?.length ? (
          bestPartners.slice(0, 4).map((p, i) => (
            <View key={i} style={styles.smallRow}>
              <Text style={styles.partner}>{safe(p.Name || p.name)}</Text>
              <Text style={styles.partnerAmount}>{safe(p.Amount || p.amount)}</Text>
            </View>
          ))
        ) : (
          <>
            <View style={styles.smallRow}><Text>Jack Miller</Text><Text>$36,000</Text></View>
            <View style={styles.smallRow}><Text>Jhon de rosa</Text><Text>$22,425</Text></View>
            <View style={styles.smallRow}><Text>Martin Mayers</Text><Text>$17,089</Text></View>
            <View style={styles.smallRow}><Text>Kent Mayers</Text><Text>$11,298</Text></View>
          </>
        )}
      </View>

      {/* ✅ Current Runaway Relationships (from GetDashboard) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Runaway Relationships</Text>
        {currentRunners?.length ? (
          currentRunners.slice(0, 4).map((c, i) => (
            <View key={i} style={styles.smallRow}>
              <Text>{safe(c.Name || c.name)}</Text>
              <Text style={styles.phone}>{safe(c.Phone || c.phone)}</Text>
            </View>
          ))
        ) : (
          <>
            <View style={styles.smallRow}><Text>Lucas Mendoza</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
            <View style={styles.smallRow}><Text>Ava Torres</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
            <View style={styles.smallRow}><Text>Ethan Brooks</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
            <View style={styles.smallRow}><Text>Sophia Ramirez</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
          </>
        )}
      </View>

      {/* ✅ Dates & DOV (using total + chart placeholder until expanded) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dates & DOV</Text>
        <View style={styles.pillsRow}>
          <View style={styles.pill}><Text>Total DOV</Text><Text style={styles.pillNumber}>{safe(dashboardData?.dovTotal)}</Text></View>
          <View style={styles.pill}><Text>Introductions</Text><Text style={styles.pillNumber}>{safe(outcomes?.introductions)}</Text></View>
          <View style={styles.pill}><Text>Referrals</Text><Text style={styles.pillNumber}>{safe(outcomes?.referrals)}</Text></View>
        </View>

        <View style={styles.dovBox}>
          <View style={styles.dovChartPlaceholder}>
            <BarChart data={[40, 80, 160, 120, 200]} height={60} color={'#e84b4b'} />
          </View>
          <Text style={styles.dovTotal}>{safe(dashboardData?.dovTotal)}</Text>
        </View>
      </View>

      {/* ⚠️ Leave this section UNCHANGED as per instruction */}
      {/* Task list card (shows dashboard summary first, then full task list fallback) */}
      <View style={styles.card}>
        <Text style={styles.cardTitleSmall}>Task</Text>
        {loading && <ActivityIndicator style={{ marginVertical: 12 }} />}

        {(() => {
          // 🔹 Prefer Dashboard summary tasks → fallback to GetTaskList
          const rows =
            dashboardData?.tasksSummary?.length
              ? dashboardData.tasksSummary
              : tasks.length
              ? tasks
              : [];

          if (!rows.length && !loading) {
            return (
              <Text style={{ color: '#999', textAlign: 'center', paddingVertical: 8 }}>
                No Task
              </Text>
            );
          }

          return rows.slice(0, 10).map((t, i) => {
            const name =
              typeof t.name === 'object'
                ? t.name['#text'] || JSON.stringify(t.name)
                : t.name || '—';

            const task = t.TaskName || t.task || t.note || '';
            const date = t.date || t.Date || '';

            return (
              <TouchableOpacity
                key={t.id || i}
                style={styles.taskRow}
                activeOpacity={0.8}
                onPress={() => onTapTask(t)}
              >
                <Text style={styles.checkbox}>{t.done ? '☑' : '☐'}</Text>
                <View style={styles.taskMain}>
                  <Text style={styles.taskName}>{`${name}   ${task}`}</Text>
                </View>
                <Text style={styles.taskDate}>{date}</Text>
              </TouchableOpacity>
            );
          });
        })()}
      </View>

      {/* ✅ Recently Identified Partners */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recently Identified Potential Partners</Text>
        {recentPartners?.length ? (
          recentPartners.slice(0, 4).map((r, i) => (
            <View key={i} style={styles.smallRow}>
              <Text>{safe(r.Name || r.name)}</Text>
              <Text style={styles.phone}>{safe(r.Phone || r.phone)}</Text>
            </View>
          ))
        ) : (
          <>
            <View style={styles.smallRow}><Text>Charly Oman</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
            <View style={styles.smallRow}><Text>Jhon de rosa</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
            <View style={styles.smallRow}><Text>Martin Mayers</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
            <View style={styles.smallRow}><Text>Kent Mayers</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
          </>
        )}
      </View>

      {/* ✅ Outcomes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Outcomes</Text>
        <View style={styles.outcomesRow}><Text>Introductions</Text><Text style={styles.outcomeNumber}>{safe(outcomes?.introductions)}</Text></View>
        <View style={styles.outcomesRow}><Text>Referrals</Text><Text style={styles.outcomeNumber}>{safe(outcomes?.referrals)}</Text></View>
        <View style={styles.outcomesRow}><Text>Referral Partners</Text><Text style={styles.outcomeNumber}>{safe(outcomes?.partners)}</Text></View>

        <View style={styles.revenueBox}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Referral Revenue Generated</Text>
            <View style={styles.smallChart}>
              <BarChart data={[40, 80, 120, 60, 160, 100]} height={44} color={'#e84b4b'} />
            </View>
          </View>
          <Text style={styles.revenueAmount}>$105,000</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 120, backgroundColor: '#fff' },
  title: { fontSize: 36, color: '#e84b4b', fontWeight: '700', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginTop: 18, shadowColor: '#000', shadowOpacity: 0.04, elevation: 3 },
  cardTitle: { fontWeight: '700', marginBottom: 12, fontSize: 16 },
  cardTitleSmall: { fontWeight: '700', marginBottom: 12, fontSize: 14, color: '#333' },
  smallRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f6f6f6' },
  partner: { color: '#333' },
  partnerAmount: { color: '#111', fontWeight: '700' },
  phone: { color: '#666' },
  pillsRow: { marginTop: 6 },
  pill: { backgroundColor: '#fdeaea', borderRadius: 12, padding: 10, marginVertical: 6, flexDirection: 'row', justifyContent: 'space-between' },
  pillNumber: { fontWeight: '700' },
  dovBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
  dovChartPlaceholder: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0eaea', height: 60, width: 180, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  dovTotal: { fontSize: 18, color: '#999', marginLeft: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f6f6f6' },
  checkbox: { width: 28, color: '#999' },
  taskMain: { flex: 1 },
  taskName: { fontSize: 16 },
  taskDate: { color: '#999' },
  outcomesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f6f6f6' },
  outcomeNumber: { fontWeight: '700', fontSize: 18 },
  revenueBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
  smallChart: { height: 44, width: 140, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0eaea', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  revenueAmount: { fontSize: 22, fontWeight: '700', color: '#999', marginLeft: 12 },
});
