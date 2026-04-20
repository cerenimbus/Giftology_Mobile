/* OBP 03/01/26
 * src/screens/Revenue_Entry.js
 * Revenue entry/update screen for adding or editing revenue records.
 * Purpose: Allow users to add new revenue or update existing revenue with contact selection, date, and amount.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UpdateRevenue, GetContactList } from '../api';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { log, getMaskAC } from '../utils/debug';

export default function Revenue_Entry({ route, navigation }) {
  // OBP 03/01/26 Get mode (add/update) and revenue data from route params
  const { mode = 'add', revenue = null } = route?.params || {};
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [revenueDate, setRevenueDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function loadContacts() {
      try {
        // OBP 03/01/26 Load contact list for dropdown selection
        const res = await GetContactList();
        if (!mounted) return;
        
        log('Revenue_Entry: GetContactList response', res);
        
        if (res?.success && res?.contacts) {
          setContacts(res.contacts);
          
          // OBP 03/01/26 If updating existing revenue, pre-fill the form
          if (mode === 'update' && revenue) {
            // Find matching contact by name
            const matchingContact = res.contacts.find(c => c.name === revenue.contact);
            if (matchingContact) {
              setSelectedContact(matchingContact.id);
            }
            setAmount(revenue.amount ? revenue.amount.replace('$', '').trim() : '');
            
            // Parse date from MM/DD/YYYY format
            if (revenue.date) {
              const dateParts = revenue.date.split('/');
              if (dateParts.length === 3) {
                const month = parseInt(dateParts[0], 10) - 1;
                const day = parseInt(dateParts[1], 10);
                const year = parseInt(dateParts[2], 10);
                setRevenueDate(new Date(year, month, day));
              }
            }
          }
        } else {
          log('Revenue_Entry: GetContactList failed', res);
        }
      } catch (e) {
        log('Revenue_Entry: GetContactList exception', e && e.stack ? e.stack : e);
      } finally {
        setLoadingContacts(false);
      }
    }
    
    loadContacts();
    return () => {
      mounted = false;
    };
  }, [mode, revenue]);

  // OBP 03/01/26 Handle date picker change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setRevenueDate(selectedDate);
    }
  };

  // OBP 03/01/26 Format date as MM/DD/YYYY for display
  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // OBP 03/01/26 Validate and save revenue record
  const onSave = async () => {
    if (!selectedContact) {
      Alert.alert('Error', 'Please select a contact');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // OBP 03/01/26 Call UpdateRevenue API with action parameter
      const params = {
        Action: mode,
        Contact: selectedContact,
        RevenueDate: formatDate(revenueDate),
        Amount: parseFloat(amount)
      };
      
      // OBP 03/01/26 Include Revenue serial for update mode
      if (mode === 'update' && revenue?.serial) {
        params.Revenue = revenue.serial;
      } else if (mode === 'add') {
        params.Revenue = 0;
      }
      
      log('Revenue_Entry: UpdateRevenue called with params', params);
      const res = await UpdateRevenue(params);
      log('Revenue_Entry: UpdateRevenue response', res);
      
      if (res?.requestUrl) {
        try {
          const maskAC = getMaskAC && getMaskAC();
          if (maskAC) {
            log('Revenue_Entry: UpdateRevenue URL (masked):', res.requestUrl.replace(/([&?]AC=)[^&]*/,'$1***'));
            log('Revenue_Entry: UpdateRevenue URL (full):', res.requestUrl);
          } else {
            log('Revenue_Entry: UpdateRevenue URL (AC visible):', res.requestUrl);
          }
        } catch (e) {}
      }
      
      if (res?.success) {
        Alert.alert('Success', res?.message || 'Revenue saved successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', res?.message || 'Failed to save revenue');
      }
    } catch (e) {
      log('Revenue_Entry: UpdateRevenue exception', e && e.stack ? e.stack : e);
      Alert.alert('Error', 'Failed to save revenue');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigation.goBack();
  };

  if (loadingContacts) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e84b4b" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onCancel}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Revenue</Text>
        
        {/* OBP 03/01/26 Contact selection dropdown */}
        <Text style={styles.label}>Select Contact</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedContact}
            onValueChange={(itemValue) => setSelectedContact(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="NAME" value="" />
            {contacts.map((contact) => (
              <Picker.Item 
                key={contact.id} 
                label={contact.name} 
                value={contact.id} 
              />
            ))}
          </Picker>
        </View>
        
        {/* OBP 03/01/26 Date selection */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(revenueDate)}</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={revenueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}
        
        {/* OBP 03/01/26 Amount input */}
        <Text style={styles.label}>Enter a revenue amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        
        {/* OBP 03/01/26 Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]} 
            onPress={onSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    marginTop: verticalScale(20),
    marginLeft: scale(12),
    padding: moderateScale(8)
  },
  backText: {
    color: '#666',
    fontSize: fontSize(14)
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(40)
  },
  title: {
    fontSize: fontSize(36),
    color: '#e84b4b',
    fontWeight: '700',
    marginBottom: verticalScale(24)
  },
  label: {
    fontSize: fontSize(16),
    color: '#333',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8)
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: moderateScale(12),
    overflow: 'hidden'
  },
  picker: {
    height: verticalScale(50)
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    backgroundColor: '#fff'
  },
  dateText: {
    fontSize: fontSize(16),
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    fontSize: fontSize(16)
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(32),
    gap: moderateScale(12)
  },
  button: {
    flex: 1,
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#e84b4b'
  },
  saveButton: {
    backgroundColor: '#4CAF50'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: fontSize(16),
    fontWeight: '700'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontSize(16),
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: fontSize(16),
    color: '#666'
  }
});
