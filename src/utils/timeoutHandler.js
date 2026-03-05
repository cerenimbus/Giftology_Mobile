import { Alert } from 'react-native';
import { navigate, goBack } from '../navigation/NavigationService';

// RHCM 11/21/25
// Single shared timeout handler to avoid showing multiple alerts
let _isShowing = false;
let _retryCallback = null;

export function handleApiTimeout(retryCallback = null) {
  if (_isShowing) return;
  _isShowing = true;
  _retryCallback = retryCallback;

  Alert.alert(
    'Connection Timeout',
    'The request timed out. Please try again.\n\nIf retry does not work please email support@giftologygroup.com and include a screenshot of this message if possible.\n\nError # 100',
    [
      {
        text: 'Retry',
        onPress: () => {
          _isShowing = false;
          if (_retryCallback) {
            try {
              _retryCallback();
            } catch (e) {
              // If retry fails, navigate to main screen
              try {
                navigate('Main');
              } catch (navError) {
                // ignore navigation errors
              }
            }
          } else {
            // Fallback: try to go back or navigate to main
            try {
              goBack();
            } catch (e) {
              try {
                navigate('Main');
              } catch (navError) {
                // ignore navigation errors
              }
            }
          }
          _retryCallback = null;
        },
      },
      {
        text: 'OK',
        onPress: () => {
          _isShowing = false;
          _retryCallback = null;
          // Navigate to Login screen
          try {
            navigate('Login');
          } catch (e) {
            // ignore navigation errors
            _isShowing = false;
          }
        },
        style: 'default',
      },
    ],
    { cancelable: false }
  );
}

export default { handleApiTimeout };
