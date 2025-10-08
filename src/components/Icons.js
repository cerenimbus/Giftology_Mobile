import React from 'react';
import { Text } from 'react-native';

export function HamburgerIcon({ size = 20, color = '#000' }){
  return <Text style={{fontSize:size,color}}>☰</Text>
}

export function BackIcon({ size = 20, color = '#000' }){
  return <Text style={{fontSize:size,color}}>←</Text>
}
