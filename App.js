import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// bottom tabs removed; stack navigation only
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Contacts from './src/screens/Contacts';
import Feedback from './src/screens/Feedback';
import Help from './src/screens/Help';
import Profile from './src/screens/Profile';
import Forgot from './src/screens/Forgot';
import Verify from './src/screens/Verify';
import Loading from './src/screens/Loading';
import Task from './src/screens/Task';
import Preview from './src/screens/Preview';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
  <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Preview" component={Preview} />
          <Stack.Screen name="Main" component={Dashboard} />
          <Stack.Screen name="Task" component={Task} />
          <Stack.Screen name="Contacts" component={Contacts} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Help" component={Help} />
          <Stack.Screen name="Feedback" component={Feedback} />
          <Stack.Screen name="Forgot" component={Forgot} />
          <Stack.Screen name="Verify" component={Verify} />
          <Stack.Screen name="Loading" component={Loading} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
