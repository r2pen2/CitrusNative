import React, { useContext, useEffect } from 'react';
import { View, Image } from "react-native";
import Topbar from "../components/Topbar"
import { CurrentUserContext, DarkContext, UsersContext } from '../Context';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; 
import { createStackNavigator } from "@react-navigation/stack"; 
import People from "./People";
import NewTransaction from "./NewTranscation";
import Groups from "./Groups";
import { DBManager } from '../api/db/dbManager';

import Settings from "./Settings";
import Transaction from "./Transaction";
import { darkTheme, globalColors, lightTheme } from '../assets/styles';


const tabNames = {
    people: "People",
    newTranscation: "New Transcation",
    groups: "Groups",
  }
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function Dashboard({navigation}) {

  const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
  const { usersData, setUsersData } = useContext(UsersContext);

  // When currentUserManager changes, take user to login if new value is null
  useEffect(() => {
    if (!currentUserManager) {
      navigation.navigate("login");
    }
  }, [currentUserManager]);

  // Subscribe to realtime updates for all self and all friends 
  useEffect(() => {
    async function subscribeToUserData() {
      if (!currentUserManager) {
        return;
      }
      console.log("Fetching friend data...");
      const newData = {...usersData};
      for (const friendId of currentUserManager.data.friends) {
        if (!usersData[friendId]) {
          // Friend has not yet been fetched
          const friendManager = DBManager.getUserManager(friendId);
          // Set up doc listener and fetch data
          friendManager.docRef.onSnapshot((snap) => {
            console.log("Friend[" + friendManager.documentId + "] document update detected!");
            friendManager.data = snap.data();
            newData[friendId] = friendManager.data;
            setUsersData(newData);
          });
        }
      }
      setUsersData(newData);
      console.log("Fetching friend data... Done!");
      console.log("Suscribing to self updates...");
      currentUserManager.docRef.onSnapshot((snap) => {
        console.log("Self[" + currentUserManager.documentId + "] document update detected!");
        currentUserManager.data = snap.data();
        setCurrentUserManager(currentUserManager);
      });
    }
    subscribeToUserData();
  }, []);

  // Stop user from going back to login unless they are already signed out
  navigation.addListener('beforeRemove', (e) => {
    if (currentUserManager) {
      e.preventDefault();        
    } else {
      navigation.dispatch(e.data.action);
    }
  });

  return (
    <View style={{height: '100%'}}>
      <Stack.Navigator
        initialRouteName='main'
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="main" component={MainTabs} />
        <Stack.Screen name="settings" component={Settings} />
        <Stack.Screen name="transaction" component={Transaction} />
      </Stack.Navigator>
    </View>
  )
}


function MainTabs({navigation}) {

  const { dark } = useContext(DarkContext);

  return (
    <View style={{height: "100%"}}>
      <Topbar nav={navigation} />
      <Tab.Navigator
        initialRouteName={tabNames.people}
        screenOptions={({route}) => ({
        tabBarIcon: ({focused, size}) => {
          let imgSrc;
          let routeName = route.name;
          if (routeName === tabNames.people) {
            imgSrc = focused ? require('../assets/images/PersonSelected.png') : dark ? require('../assets/images/PersonUnselected.png') : require('../assets/images/PersonUnselectedLight.png');
          } else if (routeName === tabNames.newTranscation) {
              imgSrc = focused ? require('../assets/images/NewTransactionSelected.png') : dark ? require('../assets/images/NewTransactionUnselected.png') : require('../assets/images/NewTransactionUnselectedLight.png');
            } else if (routeName === tabNames.groups) {
              imgSrc = focused ? require('../assets/images/GroupsSelected.png') : dark ? require('../assets/images/GroupsUnselected.png') : require('../assets/images/GroupsUnselectedLight.png');
            }
            return  <Image style={{ width: size, height: size }} source={imgSrc} />
          },
          tabBarActiveTintColor: globalColors.green,
          tabBarInactiveTintColor: dark ? darkTheme.textPrimary : lightTheme.textPrimary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: dark ? darkTheme.tabBarColor : lightTheme.tabBarColor,
            paddingBottom: 5,
            height: 60, 
            paddingTop: 5,
          },
      })}>
        <Tab.Screen name={tabNames.people} component={People} />
        <Tab.Screen name={tabNames.newTranscation} component={NewTransaction} />
        <Tab.Screen name={tabNames.groups} component={Groups} />
      </Tab.Navigator>
    </View>
  )
}