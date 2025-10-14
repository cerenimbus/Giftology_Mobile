import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import BarChart from '../components/BarChart';
import { GetTaskList, UpdateTaskDone } from '../api';

const TASKS = [
  { id: '1', name: 'James', note: 'Introduction', date: 'Sep 9' },
  { id: '2', name: 'kharl', note: 'Clarity Conversation', date: 'Sep 14' },
  { id: '3', name: 'Jimmy', note: 'Gift', date: 'Sep 24' },
  { id: '4', name: 'Loren', note: 'DOV', date: 'Sep 26' }
];

export default function Task({ navigation }){
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await GetTaskList();
      if (res?.success) setTasks(res.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onTapTask = (task) => {
    Alert.alert('Mark complete?', 'Are you sure you want to mark this task completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: async () => {
        setLoading(true);
        try {
          await UpdateTaskDone(task.id);
          await load();
        } finally { setLoading(false); }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Task</Text>
      <TouchableOpacity style={{position:'absolute',left:18,top:24,padding:8}} onPress={() => navigation.goBack()}>
        <Text style={{color:'#e84b4b'}}>Back</Text>
      </TouchableOpacity>

      {/* Best Referral Partner */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Referral Partner</Text>
        <View style={styles.smallRow}><Text style={styles.partner}>Jack Miller</Text><Text style={styles.partnerAmount}>$36,000</Text></View>
        <View style={styles.smallRow}><Text style={styles.partner}>Jhon de rosa</Text><Text style={styles.partnerAmount}>$22,425</Text></View>
        <View style={styles.smallRow}><Text style={styles.partner}>Martin Mayers</Text><Text style={styles.partnerAmount}>$17,089</Text></View>
        <View style={styles.smallRow}><Text style={styles.partner}>kent Mayers</Text><Text style={styles.partnerAmount}>$11,298</Text></View>
      </View>

      {/* Current Runaway Relationships */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Runaway Relationships</Text>
        <View style={styles.smallRow}><Text>Lucas Mendoza</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
        <View style={styles.smallRow}><Text>Ava Torres</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
        <View style={styles.smallRow}><Text>Ethan Brooks</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
        <View style={styles.smallRow}><Text>Sophia Ramirez</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
      </View>

      {/* Dates & DOV */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dates & DOV</Text>
        <View style={styles.pillsRow}>
          <View style={styles.pill}><Text>Harmless Starters</Text><Text style={styles.pillNumber}>2,001</Text></View>
          <View style={styles.pill}><Text>Greenlight Questions</Text><Text style={styles.pillNumber}>1,873</Text></View>
          <View style={styles.pill}><Text>Clarity Convos</Text><Text style={styles.pillNumber}>1,212</Text></View>
        </View>

        <View style={styles.breakdown}>
          <View style={styles.breakRow}><Text>Handwritten Notes</Text><Text>1,847</Text></View>
          <View style={styles.breakRow}><Text>Gifting</Text><Text>2,873</Text></View>
          <View style={styles.breakRow}><Text>Videos</Text><Text>847</Text></View>
          <View style={styles.breakRow}><Text>Other</Text><Text>900</Text></View>
        </View>

        <View style={styles.dovBox}>
          <View style={styles.dovChartPlaceholder}>
            <BarChart data={[120, 180, 75, 90, 200, 160, 80]} height={60} color={'#e84b4b'} />
          </View>
          <Text style={styles.dovTotal}>89,087</Text>
        </View>
      </View>

      {/* Task list card (compact like screenshot) */}
      <View style={styles.card}>
        <Text style={styles.cardTitleSmall}>Task</Text>
        {loading && <ActivityIndicator style={{marginVertical:12}} />}
        {tasks.map(t => (
          <TouchableOpacity key={t.id} style={styles.taskRow} activeOpacity={0.8} onPress={() => onTapTask(t)}>
            <Text style={styles.checkbox}>{t.done ? '☑' : '☐'}</Text>
            <View style={styles.taskMain}><Text style={styles.taskName}>{t.name}</Text><Text style={styles.taskNote}>{t.note}</Text></View>
            <Text style={styles.taskDate}>{t.date}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recently Identified Potential Partners */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recently Identified Potential Partners</Text>
        <View style={styles.smallRow}><Text>Charly Oman</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
        <View style={styles.smallRow}><Text>Jhon de rosa</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
        <View style={styles.smallRow}><Text>Martin Mayers</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
        <View style={styles.smallRow}><Text>kent Mayers</Text><Text style={styles.phone}>(225) 555-0118</Text></View>
      </View>

      {/* Outcomes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Outcomes</Text>
        <View style={styles.outcomesRow}><Text>Introductions</Text><Text style={styles.outcomeNumber}>3,671</Text></View>
        <View style={styles.outcomesRow}><Text>Referrals</Text><Text style={styles.outcomeNumber}>4,471</Text></View>
        <View style={styles.outcomesRow}><Text>Amount of Referral Partners</Text><Text style={styles.outcomeNumber}>3,671</Text></View>

        <View style={styles.revenueBox}>
          <View style={{flex:1}}>
            <Text style={{fontSize:12,color:'#666'}}>Referral Revenue Generated</Text>
            <View style={styles.smallChart}><BarChart data={[40,80,120,40,160,80]} height={44} color={'#e84b4b'} /></View>
          </View>
          <Text style={styles.revenueAmount}>$105,000</Text>
        </View>
      </View>

      <View style={{height:40}} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page:{padding:20,paddingBottom:120,backgroundColor:'#fff'},
  title:{fontSize:36,color:'#e84b4b',fontWeight:'700',marginTop:6},
  card:{backgroundColor:'#fff',borderRadius:16,padding:14,marginTop:18,shadowColor:'#000',shadowOpacity:0.04,elevation:3},
  cardTitle:{fontWeight:'700',marginBottom:12,fontSize:16},
  cardTitleSmall:{fontWeight:'700',marginBottom:12,fontSize:14,color:'#333'},
  smallRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderColor:'#f6f6f6'},
  partner:{color:'#333'},
  partnerAmount:{color:'#111',fontWeight:'700'},
  phone:{color:'#666'},
  pillsRow:{marginTop:6},
  pill:{backgroundColor:'#fdeaea',borderRadius:12,padding:10,marginVertical:6,flexDirection:'row',justifyContent:'space-between'},
  pillNumber:{fontWeight:'700'},
  breakdown:{marginTop:8,backgroundColor:'#fff'},
  breakRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:6,color:'#666'},
  dovBox:{flexDirection:'row',alignItems:'center',marginTop:12,justifyContent:'space-between'},
  dovChartPlaceholder:{backgroundColor:'#fff',borderWidth:1,borderColor:'#f0eaea',height:60,width:180,justifyContent:'center',alignItems:'center',borderRadius:8},
  dovTotal:{fontSize:18,color:'#999',marginLeft:12},
  taskRow:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderColor:'#f6f6f6'},
  checkbox:{width:28,color:'#999'},
  taskMain:{flex:1},
  taskName:{fontSize:16},
  taskNote:{color:'#888',marginTop:4},
  taskDate:{color:'#999'},
  outcomesRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderColor:'#f6f6f6'},
  outcomeNumber:{fontWeight:'700',fontSize:18},
  revenueBox:{flexDirection:'row',alignItems:'center',marginTop:12,justifyContent:'space-between'},
  smallChart:{height:44,width:140,backgroundColor:'#fff',borderWidth:1,borderColor:'#f0eaea',borderRadius:8,justifyContent:'center',alignItems:'center'},
  revenueAmount:{fontSize:22,fontWeight:'700',color:'#999',marginLeft:12}
});
