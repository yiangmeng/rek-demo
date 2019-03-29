import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import ScanScreen from '../screens/ScanScreen';
import IndexScreen from '../screens/IndexScreen';
import ListScreen from '../screens/ListScreen';

const ScanStack = createStackNavigator({
  Home: ScanScreen,
});

ScanStack.navigationOptions = {
  tabBarLabel: 'Scan',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const IndexStack = createStackNavigator({
  Links: IndexScreen,
});

IndexStack.navigationOptions = {
  tabBarLabel: 'Index Face',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

const ListStack = createStackNavigator({
  Settings: ListScreen,
});

ListStack.navigationOptions = {
  tabBarLabel: 'List Faces',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

export default createBottomTabNavigator({
  ScanStack,
  IndexStack,
  ListStack,

});
