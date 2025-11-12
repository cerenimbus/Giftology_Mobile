/* RHCM 10/22/25
 * src/screens/Help.js
 * Help Screen - displays formatted help content with a clean, readable layout.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BackIcon } from '../components/Icons';

export default function Help({ navigation }) {
  return (
    <View style={styles.container}>
      {/*EF 11/12/25
      Display Texts just like in the figma
      */}
      {/* Header (no gradient) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <BackIcon size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Screen</Text>
        </View>
      </View>

      {/* Scrollable content inside a rounded card */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contentCard}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lorem ipsum dolor</Text>
            <Text style={styles.sectionText}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
              pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
              aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
              Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lorem ipsum</Text>
            <Text style={styles.sectionText}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
              pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
              aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
              Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
              aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  // Top header (solid color, no gradient)
  header: {
    backgroundColor: '#ffecec',          // light red tint
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 24, color: '#e84b4b', fontWeight: '700' },

  // Scrollable area
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 12,
  },

  // Big rounded white card that holds the text blocks
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  section: { marginBottom: 18 },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 8,
    color: '#222',
  },
  sectionText: {
    fontSize: 18,
    lineHeight: 22,
    color: '#444',
    textAlign: 'justify',
  },
});
