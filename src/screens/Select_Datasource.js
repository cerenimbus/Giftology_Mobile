/* OBP 03/01/26
 * src/screens/Select_Datasource.js
 * Data source selection screen for mobile app only (not web).
 * Purpose: Allow developers to switch between Production, Stage, Test, and Dev API endpoints.
 * Accessed by entering "SELECTDATASOURCE" in the email field on the Forgot Password screen.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { getApiBaseUrl, setApiBaseUrl } from '../utils/storage';
import { log } from '../utils/debug';

// OBP 03/01/26 API URL mappings as specified in requirements
const DATA_SOURCES = [
  { label: 'Production', value: 'https://ror.giftologygroup.com/RRService' },
  { label: 'Stage', value: 'https://stage.ror.giftologygroup.com/RRService' },
  { label: 'Test', value: 'https://test.ror.giftologygroup.com/RRService' },
  { label: 'Dev', value: 'https://dev.ror.giftologygroup.com/RRService' }
];

export default function Select_Datasource({ navigation }) {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCurrentUrl() {
      try {
        // OBP 03/01/26 Load the currently configured API base URL
        const currentUrl = await getApiBaseUrl();
        log('Select_Datasource: Current API URL', currentUrl);
        
        // OBP 03/01/26 Default to Production if no URL is set
        setSelectedUrl(currentUrl || DATA_SOURCES[0].value);
      } catch (e) {
        log('Select_Datasource: Error loading URL', e);
        setSelectedUrl(DATA_SOURCES[0].value);
      } finally {
        setLoading(false);
      }
    }
    
    loadCurrentUrl();
  }, []);

  // OBP 03/01/26 Save selected data source and persist it
  const onSubmit = async () => {
    if (!selectedUrl) {
      Alert.alert('Error', 'Please select a data source');
      return;
    }

    setSaving(true);
    try {
      // OBP 03/01/26 Save the selected URL to AsyncStorage so it persists across app restarts
      await setApiBaseUrl(selectedUrl);
      log('Select_Datasource: API URL saved', selectedUrl);
      
      const sourceName = DATA_SOURCES.find(s => s.value === selectedUrl)?.label || 'Unknown';
      Alert.alert(
        'Data Source Updated',
        `API base URL changed to ${sourceName}. Please restart the app for changes to take full effect.`,
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } catch (e) {
      log('Select_Datasource: Error saving URL', e);
      Alert.alert('Error', 'Failed to save data source');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e84b4b" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Select Data Source</Text>
      
      <View style={styles.radioGroup}>
        {DATA_SOURCES.map((source) => (
          <TouchableOpacity
            key={source.value}
            style={styles.radioOption}
            onPress={() => setSelectedUrl(source.value)}
          >
            <View style={styles.radioCircle}>
              {selectedUrl === source.value && (
                <View style={styles.radioCircleFilled} />
              )}
            </View>
            <Text style={styles.radioLabel}>{source.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, saving && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={saving}
      >
        <Text style={styles.submitButtonText}>
          {saving ? 'Saving...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: moderateScale(20)
  },
  backButton: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(12),
    padding: moderateScale(8),
    alignSelf: 'flex-start'
  },
  backText: {
    color: '#666',
    fontSize: fontSize(14)
  },
  title: {
    fontSize: fontSize(36),
    color: '#e84b4b',
    fontWeight: '700',
    marginBottom: verticalScale(40)
  },
  radioGroup: {
    marginBottom: verticalScale(40)
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20)
  },
  radioCircle: {
    height: moderateScale(24),
    width: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12)
  },
  radioCircleFilled: {
    height: moderateScale(12),
    width: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#4A90E2'
  },
  radioLabel: {
    fontSize: fontSize(18),
    color: '#333'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: verticalScale(20)
  },
  buttonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize(16),
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
