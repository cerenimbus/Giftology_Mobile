/* RHCM 10/22/25
 * src/screens/Task.js
 * Task list screen displaying all tasks retrieved from GetTaskList API.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GetTaskList, UpdateTask } from '../api';
import { fontSize, verticalScale, moderateScale } from '../utils/responsive';
import { log, getMaskAC } from '../utils/debug';

export default function Task({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadTasks() {
      setLoading(true);
      try {
        const res = await GetTaskList();
        if (!mounted) return;
        
        log('Task: GetTaskList response', res);
        if (res?.requestUrl) {
          try {
            const maskAC = getMaskAC && getMaskAC();
            if (maskAC) {
              log('Task: GetTaskList URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***')); 
              log('Task: GetTaskList URL (full):', res.requestUrl);
            } else {
              log('Task: GetTaskList URL (AC visible):', res.requestUrl);
            }
          } catch (e) {}
        }
        
        if (res?.success) {
          setTasks(res.tasks || []);
        } else {
          log('Task: GetTaskList failed', res);
        }
      } catch (e) {
        log('Task: GetTaskList exception', e && e.stack ? e.stack : e);
      } finally {
        setLoading(false);
      }
    }
    
    loadTasks();
    return () => {
      mounted = false;
    };
  }, []);

  const onTapTask = (task) => {
    Alert.alert('Mark complete?', 'Are you sure you want to mark this task completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            setUpdatingTaskId(task.id);
            log('Task: Marking task complete', task.id);
            // Use UpdateTask API to mark the task as done (Status = 1)
            const res = await UpdateTask({ Task: task.id, Status: 1 });
            log('Task: UpdateTask response', res);
            if (res?.requestUrl) {
              try {
                const maskAC = getMaskAC && getMaskAC();
                if (maskAC) {
                  log('Task: UpdateTask URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***'));
                  log('Task: UpdateTask URL (full):', res.requestUrl);
                } else {
                  log('Task: UpdateTask URL (AC visible):', res.requestUrl);
                }
              } catch (e) {}
            }
            if (res?.success) {
              log('Task: Task marked complete, refreshing list');
              const refreshRes = await GetTaskList();
              if (refreshRes?.success) {
                setTasks(refreshRes.tasks || []);
              }
            } else {
              Alert.alert('Error', res?.message || 'Failed to mark task complete');
            }
          } catch (e) {
            log('Task: UpdateTask exception', e && e.stack ? e.stack : e);
            Alert.alert('Error', 'Failed to mark task complete');
          } finally {
            setUpdatingTaskId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroller}>
        <TouchableOpacity 
          style={{ position: 'absolute', left: moderateScale(12), top: verticalScale(12), padding: moderateScale(6), zIndex: 10 }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#e84b4b' }}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Tasks</Text>

        <View style={styles.card}>
          {loading && <ActivityIndicator style={{ marginVertical: verticalScale(12) }} />}

          {tasks.length > 0 ? (
            tasks.map((task, i) => (
              <TouchableOpacity 
                key={`task-${task?.id ?? i}`} 
                style={styles.taskRow}
                onPress={() => onTapTask(task)}
                disabled={updatingTaskId === task.id}
                activeOpacity={0.7}
              >
                <View style={styles.taskMain}>
                  <Text style={styles.taskName}>{task.name || '—'}</Text>
                  {task.note && <Text style={styles.taskNote}>{task.note}</Text>}
                </View>
                <Text style={styles.taskDate}>{task.date || ''}</Text>
              </TouchableOpacity>
            ))
          ) : !loading ? (
            <Text style={{ color: '#999', textAlign: 'center', paddingVertical: verticalScale(16) }}>
              No tasks available
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroller: { padding: moderateScale(18), paddingBottom: moderateScale(120), paddingTop: verticalScale(50) },
  title: { fontSize: fontSize(28), color: '#e84b4b', fontWeight: '700', marginBottom: verticalScale(16) },
  card: { backgroundColor: '#fff', padding: moderateScale(12), borderRadius: moderateScale(12), shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  taskRow: { flexDirection: 'row', paddingVertical: verticalScale(12), borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  taskMain: { flex: 1 },
  taskName: { fontSize: fontSize(14), fontWeight: '600', color: '#333', marginBottom: verticalScale(4) },
  taskNote: { fontSize: fontSize(12), color: '#999' },
  taskDate: { fontSize: fontSize(12), color: '#999', marginLeft: moderateScale(8) }
});