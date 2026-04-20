/* OBP 03/01/26
 * src/screens/Revenue_List.js
 * Revenue list screen displaying all revenue records retrieved from GetRevenueList API.
 * Purpose: Display contact revenue in a scrollable table format with contact name, amount, and date.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GetRevenueList } from '../api';
import { log, getMaskAC } from '../utils/debug';

// OBP 03/01/26 Improved responsive scaling with tablet support
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375; // iPhone base width

// OBP 03/01/26 Moderate scale - less aggressive scaling for tablets
const moderateScale = (size, factor = 0.5) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return size + (scale - 1) * size * factor;
};

// OBP 03/01/26 Font scale with maximum cap for tablets
const fontScale = (size) => {
  const scaled = moderateScale(size, 0.3); // Even less aggressive for fonts
  const maxSize = size * 1.5; // Cap at 150% of original size
  return Math.min(scaled, maxSize);
};

// OBP 03/01/26 Spacing scale with maximum cap
const spacingScale = (size) => {
  const scaled = moderateScale(size, 0.4);
  const maxSize = size * 1.8; // Cap at 180% of original
  return Math.min(scaled, maxSize);
};

export default function Revenue_List({ navigation }) {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadRevenues() {
        setLoading(true);
        try {
          // OBP 03/01/26 Call GetRevenueList API to retrieve revenue records for user's contacts
          const res = await GetRevenueList();
          if (!mounted) return;

          log('Revenue_List: GetRevenueList response', res);
          if (res?.requestUrl) {
            try {
              const maskAC = getMaskAC && getMaskAC();
              if (maskAC) {
                log('Revenue_List: GetRevenueList URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***'));
                log('Revenue_List: GetRevenueList URL (full):', res.requestUrl);
              } else {
                log('Revenue_List: GetRevenueList URL (AC visible):', res.requestUrl);
              }
            } catch (e) {}
          }

          if (res?.success) {
            setRevenues(res.revenues || []);
          } else {
            log('Revenue_List: GetRevenueList failed', res);
          }
        } catch (e) {
          log('Revenue_List: GetRevenueList exception', e && e.stack ? e.stack : e);
        } finally {
          setLoading(false);
        }
      }

      loadRevenues();
      return () => {
        mounted = false;
      };
    }, [])
  );

  // OBP 03/01/26 Navigate to Revenue_Entry screen for adding new revenue
  const onAddRevenue = () => {
    navigation.navigate('RevenueEntry', { mode: 'add' });
  };

  // OBP 03/01/26 Navigate to Revenue_Entry screen for editing existing revenue
  const onTapRevenue = (revenue) => {
    navigation.navigate('RevenueEntry', { mode: 'update', revenue });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Revenue History</Text>
      
      <TouchableOpacity style={styles.addButton} onPress={onAddRevenue}>
        <Text style={styles.addButtonText}>Add Revenue Record</Text>
      </TouchableOpacity>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e84b4b" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRowTable]}>
              <Text style={[styles.name, styles.headerText]}>Name</Text>
              <Text style={[styles.amount, styles.headerText]}>Amount</Text>
              <Text style={[styles.date, styles.headerText]}>Date</Text>
            </View>
            {revenues.length > 0 ? (
              revenues.map((item, i) => (
                <TouchableOpacity 
                  key={`revenue-${item.serial || 'unknown'}-${i}`} 
                  style={styles.row}
                  onPress={() => onTapRevenue(item)}
                >
                  <Text style={styles.name}>{item.contact || ''}</Text>
                  <Text style={styles.amount}>{item.amount || ''}</Text>
                  <Text style={styles.date}>{item.date || ''}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No revenue records found</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    marginTop: spacingScale(20),
    marginLeft: spacingScale(12),
    padding: spacingScale(8),
    alignSelf: 'flex-start'
  },
  backText: {
    color: '#666',
    fontSize: fontScale(14)
  },
  title: {
    fontSize: fontScale(28),
    color: '#e84b4b',
    fontWeight: '700',
    marginHorizontal: spacingScale(20),
    marginBottom: spacingScale(16)
  },
  addButton: {
    backgroundColor: '#e84b4b',
    marginHorizontal: spacingScale(20),
    paddingVertical: spacingScale(14),
    borderRadius: moderateScale(8, 0.3),
    alignItems: 'center',
    marginBottom: spacingScale(20)
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: spacingScale(20)
  },
  table: {
    backgroundColor: '#fff',
    marginHorizontal: spacingScale(20)
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: spacingScale(16),
    paddingHorizontal: spacingScale(4)
  },
  headerRowTable: {
    borderBottomWidth: 2,
    borderColor: '#e0e0e0',
    paddingVertical: spacingScale(10),
    backgroundColor: '#fafafa'
  },
  headerText: {
    fontWeight: '600',
    fontSize: fontScale(13),
    color: '#888'
  },
  name: {
    fontSize: fontScale(15),
    flex: 2,
    color: '#333'
  },
  amount: {
    fontSize: fontScale(15),
    flex: 1,
    textAlign: 'center',
    color: '#333'
  },
  date: {
    fontSize: fontScale(15),
    flex: 1,
    textAlign: 'right',
    color: '#333'
  },
  emptyText: {
    fontSize: fontScale(16),
    color: '#999',
    textAlign: 'center',
    marginTop: spacingScale(40)
  }
});
