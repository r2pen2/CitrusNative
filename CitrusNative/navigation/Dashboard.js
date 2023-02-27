import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Pressable } from "react-native";
import Topbar from "../components/Topbar"
import { CurrentUserContext, DarkContext, UsersContext, UnsubscribeCurrentUserContext, ListenedUsersContext, GroupsContext, ListenedGroupsContext, TransactionsContext, ListenedTransactionsContext } from '../Context';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; 
import { createStackNavigator } from "@react-navigation/stack"; 
import People from "./People";
import NewTransaction from "./NewTranscation";
import Groups from "./Groups";
import { DBManager } from '../api/dbManager';
import { NotificationModal } from '../components/Notifications';

import Settings from "./Settings";
import { darkTheme, globalColors, lightTheme } from '../assets/styles';


const tabNames = {
    people: "People",
    newTranscation: "New Transaction",
    groups: "Groups",
  }
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function Dashboard({navigation}) {

  const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
  const { usersData, setUsersData } = useContext(UsersContext);
  const { groupsData, setGroupsData } = useContext(GroupsContext);
  const { transactionsData, setTransactionsData } = useContext(TransactionsContext);
  const { listenedUsers, setListenedUsers } = useContext(ListenedUsersContext);
  const { listenedGroups, setListenedGroups } = useContext(ListenedGroupsContext);
  const { listenedTransactions, setListenedTransactions } = useContext(ListenedTransactionsContext);

  const { unsubscribeCurrentUser, setUnsubscribeCurrentUser } = useContext(UnsubscribeCurrentUserContext);

  // When currentUserManager changes, take user to login if new value is null
  useEffect(() => {

    async function subscribeToUsers() {
      if (!currentUserManager) {
        return;
      } else {
        const newData = {...usersData};
        for (const userId of Object.keys(currentUserManager.data.relations)) {
          if (!listenedUsers.includes(userId)) {
            let newListenedUsers = [];
            for (const listenedUser of listenedUsers) {
              newListenedUsers.push(listenedUser);
            }
            const relationUserManager = DBManager.getUserManager(userId);
            relationUserManager.docRef.onSnapshot((snap) => {
              if (snap.data()) {                
                relationUserManager.data = snap.data();
                newData[userId] = relationUserManager.data;
                setUsersData(newData);
              }
            });
            newListenedUsers.push(userId);
            setListenedUsers(newListenedUsers);
          }
        }
        setUsersData(newData);
      }
    }

    async function subscribeToGroups() {
      if (!currentUserManager) {
        return;
      } else {
        const newData = {...groupsData};
        for (const groupId of currentUserManager.data.groups) {
          if (!listenedGroups.includes(groupId)) {
            let newListenedGroups = [];
            for (const listenedGroup of listenedGroups) {
              newListenedGroups.push(listenedGroup);
            }
            const groupManager = DBManager.getGroupManager(groupId);
            groupManager.docRef.onSnapshot((snap) => {
              if (snap.data()) {                
                groupManager.data = snap.data();
                newData[groupId] = groupManager.data;
                setGroupsData(newData);
              }
            });
            newListenedGroups.push(groupId);
            setListenedGroups(newListenedGroups);
          }
        }
        setGroupsData(newData);
      }
    }

    async function subscribeToTransactions() {
      if (!currentUserManager) {
        return;
      } else {
        const newData = {...transactionsData};
        for (const transactionId of currentUserManager.data.transactions) {
          if (!listenedTransactions.includes(transactionId)) {
            let newListenedTransactions = [];
            for (const listenedTransaction of listenedTransactions) {
              newListenedTransactions.push(listenedTransaction);
            }
            const transactionManager = DBManager.getTransactionManager(transactionId);
            transactionManager.docRef.onSnapshot((snap) => {
              if (snap.data()) {
                transactionManager.data = snap.data();
                newData[transactionId] = transactionManager.data;
                setTransactionsData(newData);
              }
            });
            newListenedTransactions.push(transactionId);
            setListenedTransactions(newListenedTransactions);
          }
        }
        setTransactionsData(newData);
      }
    }

    if (!currentUserManager) {
      navigation.navigate("login");
    } else {
      subscribeToUsers();
      subscribeToGroups();
      subscribeToTransactions();
    }
  }, [currentUserManager]);

  // Subscribe to realtime updates for all self and all friends / relations
  useEffect(() => {
    async function subscribeToSelf() {
      if (unsubscribeCurrentUser) {
        await unsubscribeCurrentUser();
      }
      const unsubscribe = currentUserManager.docRef.onSnapshot((snap) => {
        const newUserManager = DBManager.getUserManager(currentUserManager.documentId, snap.data());
        // Filter out muted notifications
        let newNotifs = newUserManager.data.notifications.filter(n => (!newUserManager.data.mutedUsers.includes(n.target) && !newUserManager.data.mutedGroups.includes(n.target)));
        newUserManager.data.notifications = newNotifs;
        setCurrentUserManager(newUserManager);
      });
      setUnsubscribeCurrentUser(() => unsubscribe);
    }
    subscribeToSelf();
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
      </Stack.Navigator>
    </View>
  )
}

function MainTabs({navigation}) {

  const { dark } = useContext(DarkContext);

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  return (
    <View style={{height: "100%"}}>
      
      <NotificationModal open={notificationModalOpen} setOpen={setNotificationModalOpen} />

      <Topbar nav={navigation} onNotificationClick={() => setNotificationModalOpen(true)}/>
      <Tab.Navigator
        initialRouteName={tabNames.people}
        backBehavior="none"
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
        <Tab.Screen 
          name={tabNames.people} 
          component={People}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate(tabNames.people, {screen: "relations"});
            },
          })}/>
        <Tab.Screen 
          name={tabNames.newTranscation} 
          component={NewTransaction}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate(tabNames.newTranscation, {screen: "add-people"});
            },
          })}/>
        <Tab.Screen 
          name={tabNames.groups} 
          component={Groups} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate(tabNames.groups, {screen: "list"});
            },
          })}/>
      </Tab.Navigator>
    </View>
  )
}