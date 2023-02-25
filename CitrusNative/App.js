import React, { useState, useCallback, useEffect } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack"; 
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Montserrat_100Thin, Montserrat_200ExtraLight, Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold, Montserrat_900Black, Montserrat_100Thin_Italic, Montserrat_200ExtraLight_Italic, Montserrat_300Light_Italic, Montserrat_400Regular_Italic, Montserrat_500Medium_Italic, Montserrat_600SemiBold_Italic, Montserrat_700Bold_Italic, Montserrat_800ExtraBold_Italic, Montserrat_900Black_Italic, } from '@expo-google-fonts/montserrat';

import Login from "./navigation/Login";
import * as SplashScreen from 'expo-splash-screen';

import { UsersContext, TransactionsContext, GroupsContext, CurrentUserContext, DarkContext, NewTransactionContext, FocusContext, UnsubscribeCurrentUserContext, ListenedUsersContext, ListenedGroupsContext, ListenedTransactionsContext } from "./Context";
import Dashboard from "./navigation/Dashboard";

import { legalCurrencies, emojiCurrencies } from "./api/enum";

import { darkTheme, lightTheme } from "./assets/styles";

// Setup navigation
export const AppStack = createStackNavigator();
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
  const [dark, setDark] = useState(true);
  const [currentUserManager, setCurrentUserManager] = useState(null);
  const [unsubscribeCurrentUser, setUnsubscribeCurrentUser] = useState(null);
  const [newTransactionData, setNewTransactionData] = useState({
    users: {},
    group: null,
    total: null,
    legalType: legalCurrencies.USD,
    emojiType: emojiCurrencies.BEER,
    currencyMenuOpen: false,
    currencyLegal: true,
    split: "even",
    splitPercent: false,
    paidBy: "even",
    paidByPercent: false,
    title: null,
    isIOU: false,
    firstPage: true,
    paidByModalState: {
      evenPayers: [],
      manualValues: {},
      percent: false,
    },
    splitModalState: {
      evenSplitters: [],
      manualValues: {},
      percent: false,
    }
  });
  const [focus, setFocus] = useState({
    user: null,
    group: null,
    transaction: null,
  })
  const [listenedUsers, setListenedUsers] = useState([]);
  const [listenedGroups, setListenedGroups] = useState([]);
  const [listenedTransactions, setListenedTransactions] = useState([]);

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
    <ListenedTransactionsContext.Provider value={{listenedTransactions, setListenedTransactions}} >
    <ListenedGroupsContext.Provider value={{listenedGroups, setListenedGroups}} >
    <ListenedUsersContext.Provider value={{listenedUsers, setListenedUsers}} >
    <UnsubscribeCurrentUserContext.Provider value={{unsubscribeCurrentUser, setUnsubscribeCurrentUser}} >
    <FocusContext.Provider value={{focus, setFocus}} >
    <CurrentUserContext.Provider value={{currentUserManager, setCurrentUserManager}} >
    <DarkContext.Provider value={{dark, setDark}} >
    <UsersContext.Provider value={{usersData, setUsersData}} >
    <TransactionsContext.Provider value={{transactionsData, setTransactionsData}} >
    <GroupsContext.Provider value={{groupsData, setGroupsData}} >
    <NewTransactionContext.Provider value={{newTransactionData, setNewTransactionData}} >
      <StatusBar backgroundColor={dark ? darkTheme.statusBarColor : lightTheme.statusBarColor} />
      <LinearGradient 
        start={[0.5, 0]}
        end={[0.5, .2]}
        colors={dark ? darkTheme.backgroundGradient : lightTheme.backgroundGradient }
        style={{backgroundColor: dark ? darkTheme.backgroundGradientBackground : lightTheme.backgroundGradientBackground }}
        onLayout={onLayoutRootView}>

        <View style={{height: '100%'}}>
            <NavigationContainer theme={navTheme}>
              <AppStack.Navigator
              initialRouteName="loading"
              screenOptions={{
                headerShown: false,
              }}
              >
                <AppStack.Screen name="login" component={Login} />
                <AppStack.Screen name="dashboard" component={Dashboard} />
              </AppStack.Navigator>
          </NavigationContainer>
        </View> 

      </LinearGradient>
      
    </NewTransactionContext.Provider>
    </GroupsContext.Provider>
    </TransactionsContext.Provider>
    </UsersContext.Provider>
    </DarkContext.Provider>
    </CurrentUserContext.Provider>
    </FocusContext.Provider>
    </UnsubscribeCurrentUserContext.Provider>
    </ListenedUsersContext.Provider>
    </ListenedGroupsContext.Provider>
    </ListenedTransactionsContext.Provider>
  )
}

export default App;