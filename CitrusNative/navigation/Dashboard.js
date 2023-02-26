import React, { useContext, useEffect, useState } from 'react';
import { View, Image, } from "react-native";
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
        //console.log("Checking for new users to listen...");
        for (const userId of Object.keys(currentUserManager.data.relations)) {
          if (!listenedUsers.includes(userId)) {
            //console.log("Listening to a new user...");
            let newListenedUsers = [];
            for (const listenedUser of listenedUsers) {
              newListenedUsers.push(listenedUser);
            }
            const friendManager = DBManager.getUserManager(userId);
            friendManager.docRef.onSnapshot((snap) => {
              if (snap.data()) {                
                friendManager.data = snap.data();
                newData[userId] = friendManager.data;
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
        //console.log("Checking for new groups to listen...");
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
                console.log(groupManager.documentId)
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
        //console.log("Checking for new transactions to listen...");
        for (const transactionId of currentUserManager.data.transactions) {
          if (!listenedTransactions.includes(transactionId)) {
            //console.log("Listening to a new transaction...");
            let newListenedTransactions = [];
            for (const listenedTransaction of listenedTransactions) {
              newListenedTransactions.push(listenedTransaction);
            }
            const transactionManager = DBManager.getTransactionManager(transactionId);
            transactionManager.docRef.onSnapshot((snap) => {
              if (snap.data()) {
                console.log("transaction received");
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
      console.log("Subscribing to self updates...");
      if (unsubscribeCurrentUser) {
        console.log("Unsubscribing from old listener...");
        await unsubscribeCurrentUser();
      }
      const unsubscribe = currentUserManager.docRef.onSnapshot((snap) => {
        console.log("Self[" + currentUserManager.documentId + "] document update detected!");
        const newUserManager = DBManager.getUserManager(currentUserManager.documentId, snap.data());
        // Filter out muted notifications
        let newNotifs = newUserManager.data.notifications.filter(n => (!newUserManager.data.mutedUsers.includes(n.target) && !newUserManager.data.mutedGroups.includes(n.target)));
        newUserManager.data.notifications = newNotifs;
        setCurrentUserManager(newUserManager);
      });
      console.log("Subscribed to self!");
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
        <Tab.Screen name={tabNames.people} component={People} />
        <Tab.Screen name={tabNames.newTranscation} component={NewTransaction}/>
        <Tab.Screen name={tabNames.groups} component={Groups} />
      </Tab.Navigator>
    </View>
  )
}