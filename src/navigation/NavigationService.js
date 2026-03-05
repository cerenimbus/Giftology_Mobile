import { createNavigationContainerRef } from '@react-navigation/native';

// RHCM 11/21/25
export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export default {
  navigationRef,
  navigate,
  goBack,
};
