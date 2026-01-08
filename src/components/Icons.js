/*
 * RHCM 10/22/25
 * src/components/Icons.js
 * Tiny icon components implemented with text glyphs to avoid additional
 * dependencies (keeps the app in the Expo managed workflow).
 */
import React from 'react';
import { Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// RHCM 10/22/25 - simple hamburger menu icon (text glyph)
export function HamburgerIcon({ size = 20, color = '#000' }){
  return <Text style={{fontSize:size,color}}>☰</Text>
}

// RHCM 10/22/25 - simple back arrow icon (text glyph)
export function BackIcon({ size = 20, color = '#000' }){
  return <Text style={{fontSize:size,color}}>←</Text>
}

// Eye icon for showing password
export function EyeIcon({ size = 20, color = '#000' }){
  return <MaterialCommunityIcons name="eye" size={size} color={color} />
}

// Eye-off icon for hiding password
export function EyeOffIcon({ size = 20, color = '#000' }){
  return <MaterialCommunityIcons name="eye-off" size={size} color={color} />
}
