import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import { Image } from 'react-native';
import Preview from './src/screens/Preview';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let source;
          if (route.name === 'Dashboard') source = require('./assets/Saved.png');
          else if (route.name === 'Contacts') source = require('./assets/Checklist.png');
          else if (route.name === 'Settings') source = require('./assets/Setting.png');
          else if (route.name === 'Profile') source = require('./assets/User.png');

          return (
            <Image
              source={source}
              style={{ width: 28, height: 28, tintColor: focused ? '#e84b4b' : '#666' }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
  <Tab.Screen name="Task" component={Task} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Contacts" component={Contacts} />
      <Tab.Screen name="Settings" component={Dashboard} />
      <Tab.Screen name="Profile" component={Profile} />
      {/* Hidden tab screens so bottom nav persists when viewing them */}
      <Tab.Screen name="Help" component={Help} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Feedback" component={Feedback} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
  <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Preview" component={Preview} />
          <Stack.Screen name="Main" component={MainTabs} />
          
          <Stack.Screen name="Forgot" component={Forgot} />
          <Stack.Screen name="Verify" component={Verify} />
          <Stack.Screen name="Loading" component={Loading} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
