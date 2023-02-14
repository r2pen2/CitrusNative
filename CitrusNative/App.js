import React, { useState, useCallback } from "react";
import { View, Image } from "react-native";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Montserrat_100Thin, Montserrat_200ExtraLight, Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold, Montserrat_900Black, Montserrat_100Thin_Italic, Montserrat_200ExtraLight_Italic, Montserrat_300Light_Italic, Montserrat_400Regular_Italic, Montserrat_500Medium_Italic, Montserrat_600SemiBold_Italic, Montserrat_700Bold_Italic, Montserrat_800ExtraBold_Italic, Montserrat_900Black_Italic, } from '@expo-google-fonts/montserrat';

import People from "./navigation/People";
import NewTransaction from "./navigation/NewTranscation";
import Groups from "./navigation/Groups";
import Settings from "./navigation/Settings";
import Transaction from "./navigation/Transaction";
import { tabBarStyle } from "./assets/styles";
import Topbar from "./components/Topbar";
import * as SplashScreen from 'expo-splash-screen';

import { UsersContext, TransactionsContext, GroupsContext, PageContext } from "./Context";

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

  let [fontsLoaded] = useFonts({
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat_100Thin_Italic,
    Montserrat_200ExtraLight_Italic,
    Montserrat_300Light_Italic,
    Montserrat_400Regular_Italic,
    Montserrat_500Medium_Italic,
    Montserrat_600SemiBold_Italic,
    Montserrat_700Bold_Italic,
    Montserrat_800ExtraBold_Italic,
    Montserrat_900Black_Italic,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
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
        style={{backgroundColor:"#1E2028"}}
        onLayout={onLayoutRootView}>
        
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