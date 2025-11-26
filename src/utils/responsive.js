/*
 * RHCM 11/26/25
 * c:/src/utils/responsive.js
 * Responsive helpers for scaling sizes across screen widths and heights
 * Purpose: provide scale(), verticalScale(), moderateScale(), and fontSize() helpers
 * so styles throughout the app can be expressed relative to device size.
 */
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on a typical iPhone 11/12/13 dimensions
const guidelineBaseWidth = 375; // base width
const guidelineBaseHeight = 812; // base height

export const SCREEN = {
  WIDTH: SCREEN_WIDTH,
  HEIGHT: SCREEN_HEIGHT,
};

// scales horizontally based on device width
export function scale(size) {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / guidelineBaseWidth) * size);
}

// scales vertically based on device height
export function verticalScale(size) {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / guidelineBaseHeight) * size);
}

// moderateScale mixes horizontal scaling with a factor to reduce the amount
export function moderateScale(size, factor = 0.5) {
  const scaled = scale(size);
  return PixelRatio.roundToNearestPixel(size + (scaled - size) * factor);
}

// friendly font size scaler that ensures consistent readability across devices
export function fontSize(size) {
  // Use moderateScale for fonts to avoid extremely large sizes
  return moderateScale(size, 0.4);
}

export default { SCREEN, scale, verticalScale, moderateScale, fontSize };
