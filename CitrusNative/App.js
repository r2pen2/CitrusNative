import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-gradient-icon";

import People from "./navigation/People";
import NewTransaction from "./navigation/NewTranscation";
import Groups from "./navigation/Groups";
import Settings from "./navigation/Settings";
import Transaction from "./navigation/Transaction";
import { tabBarStyle } from "./assets/styles";
import Topbar from "./components/Topbar";


// Setup navigation
const tabNames = {
  people: "People",
  newTranscation: "New Transcation",
  groups: "Groups",
}
const Tab = createBottomTabNavigator();
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

// Create data context
export const UsersContext = React.createContext();
export const GroupsContext = React.createContext();
export const TransactionsContext = React.createContext();
export const PageContext = React.createContext();

function App() {
  
  // Initialize context
  const [usersData, setUsersData] = useState({});
  const [transactionsData, setTransactionsData] = useState({});
  const [groupsData, setGroupsData] = useState({});
  const [page, setPage] = useState("people");

  function offMainPage() {
    return page === "settings" || page === "transaction";
  }

  function getTab(t) {
    if (page === "settings") {
      return Settings;
    } 
    if (page === "transaction") {
      return Transaction;
    }
    return t;
  }

  return (
    <UsersContext.Provider value={{usersData, setUsersData}} >
    <TransactionsContext.Provider value={{transactionsData, setTransactionsData}} >
    <GroupsContext.Provider value={{groupsData, setGroupsData}} >
    <PageContext.Provider value={{page, setPage}} >
      <LinearGradient 
        start={[0.5, 0]}
        end={[0.5, .2]}
        colors={['rgba(34,197,94,0.05)', '#1E2028']}
        style={{backgroundColor:"#1E2028"}}>
        
        <View style={{height: '100%'}}>
          <Topbar />
              <NavigationContainer theme={navTheme}>
                <Tab.Navigator
                  initialRouteName={tabNames.newTranscation}
                  screenOptions={({route}) => ({
                  tabBarIcon: ({focused, size}) => {
                      let imgSrc;
                      let routeName = route.name;
                      if (routeName === tabNames.people) {
                          imgSrc = (focused && ! offMainPage()) ? require('./assets/images/PersonSelected.png') : require('./assets/images/PersonUnselected.png');
                      } else if (routeName === tabNames.newTranscation) {
                          imgSrc = (focused && ! offMainPage()) ? require('./assets/images/NewTransactionSelected.png') : require('./assets/images/NewTransactionUnselected.png');
                      } else if (routeName === tabNames.groups) {
                          imgSrc = (focused && ! offMainPage()) ? require('./assets/images/GroupsSelected.png') : require('./assets/images/GroupsUnselected.png');
                      }
                      return  <Image style={{ width: size, height: size }} source={imgSrc} />
                  },
                  tabBarActiveTintColor: offMainPage() ? "#FCFCFC" : "#00DD66",
                  tabBarInactiveTintColor: "#FCFCFC",
                  headerShown: false,
                  tabBarStyle: tabBarStyle,
                  tabBarHideOnKeyboard: true,
              })}>
              <Tab.Screen name={tabNames.people} component={getTab(People)} />
              <Tab.Screen name={tabNames.newTranscation} component={getTab(NewTransaction)} />
              <Tab.Screen name={tabNames.groups} component={getTab(Groups)} />
            </Tab.Navigator>
          </NavigationContainer>
        </View>

      </LinearGradient>
    </PageContext.Provider>
    </GroupsContext.Provider>
    </TransactionsContext.Provider>
    </UsersContext.Provider>
  )
}

export default App;