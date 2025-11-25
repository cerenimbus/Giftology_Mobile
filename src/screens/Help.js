/* RHCM 10/22/25
 * src/screens/Help.js
 * Help Screen - displays formatted help content with a clean, readable layout.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BackIcon } from '../components/Icons';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375; // Base width for scaling (standard iPhone width)
const BASE_HEIGHT = 812; // Base height for scaling

// Scale factor for horizontal dimensions
const scale = SCREEN_WIDTH / BASE_WIDTH;

// Helper function to scale font sizes moderately (prevents extreme sizes on tablets)
const moderateScale = (size, factor = 0.5) => size + (scale - 1) * size * factor;

// Helper function to scale vertical dimensions
const verticalScale = (size) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export default function Help({ navigation }) {
  return (
    <View style={styles.container}>
      {/*EF 11/25/25
      Display Texts just like in the figma
      */}
      {/* Header (no gradient) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <BackIcon size={moderateScale(20)} color="#333" />
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
//EF responsive to tablet and web
//11/25/2025
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  // Top header (solid color, no gradient)
  header: {
    backgroundColor: '#ffecec',          // light red tint
    paddingTop: verticalScale(56),
    paddingHorizontal: SCREEN_WIDTH * 0.053, // ~5.3% of screen width (equivalent to 20/375)
    paddingBottom: verticalScale(16),
    borderBottomLeftRadius: scale * 28,
    borderBottomRightRadius: scale * 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { 
    padding: scale * 6, 
    marginRight: SCREEN_WIDTH * 0.027, // ~2.7% of screen width
  },
  headerTitle: { 
    fontSize: moderateScale(24), 
    color: '#e84b4b', 
    fontWeight: '700' 
  },

  // Scrollable area
  scroll: {
    paddingHorizontal: SCREEN_WIDTH * 0.043, // ~4.3% of screen width
    paddingBottom: verticalScale(120),
    paddingTop: verticalScale(12),
  },

  // Big rounded white card that holds the text blocks
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale * 16,
    padding: SCREEN_WIDTH * 0.043, // ~4.3% of screen width
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: scale * 8,
    elevation: 2,
  },

  section: { marginBottom: verticalScale(18) },
  sectionTitle: {
    fontWeight: '700',
    fontSize: moderateScale(22),
    marginBottom: verticalScale(8),
    color: '#222',
  },
  sectionText: {
    fontSize: moderateScale(18),
    lineHeight: moderateScale(22),
    color: '#444',
    textAlign: 'justify',
  },
});
