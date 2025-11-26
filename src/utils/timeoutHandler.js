import { Alert } from 'react-native';
import NavigationService from '../navigation/NavigationService';

// RHCM 11/21/25
// Single shared timeout handler to avoid showing multiple alerts
let _isShowing = false;

export function handleApiTimeout() {
  if (_isShowing) return;
  _isShowing = true;

  Alert.alert(
    'Connection Error',
    'System cannot be contacted. Try again later or contact support.',
    [
      {
        text: 'OK',
        onPress: () => {
          _isShowing = false;
          // Navigate to Login screen
          try {
            NavigationService.navigate('Login');
          } catch (e) {
            // ignore navigation errors
            _isShowing = false;
          }
        },
      },
    ],
    { cancelable: false }
  );
}

export default { handleApiTimeout };
