import * as React from "react";
import { View, Text, Image } from "react-native";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-gradient-icon";

import People from "./navigation/People";
import NewTransaction from "./navigation/NewTranscation";
import Groups from "./navigation/Groups";
import { tabBarStyle } from "./assets/styles";
import Topbar from "./components/Topbar";

const peopleName = "People";
const newTransactionName = "New Transcation";
const groupsName = "Groups";

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function App() {
  return (
    <LinearGradient 
    start={[0.5, 0]}
    end={[0.5, .2]}
    colors={['rgba(34,197,94,0.05)', '#1E2028']}
    style={{backgroundColor:"#1E2028"}}>
      <View style={{height: '100%'}}>
        <Topbar />
            <NavigationContainer theme={navTheme}>
              <Tab.Navigator
                initialRouteName={peopleName}
                screenOptions={({route}) => ({
                tabBarIcon: ({focused, size}) => {
                    let imgSrc;
                    let routeName = route.name;
                    if (routeName === peopleName) {
                        imgSrc = focused ? require('./assets/images/PersonSelected.png') : require('./assets/images/PersonUnselected.png');
                    } else if (routeName === newTransactionName) {
                        imgSrc = focused ? require('./assets/images/NewTransactionSelected.png') : require('./assets/images/NewTransactionUnselected.png');
                    } else if (routeName === groupsName) {
                        imgSrc = focused ? require('./assets/images/GroupsSelected.png') : require('./assets/images/GroupsUnselected.png');
                    }
                    return  <Image style={{ width: size, height: size }} source={imgSrc} />
                },
                tabBarActiveTintColor: "#00DD66",
                tabBarInactiveTintColor: "#FCFCFC",
                headerShown: false,
                tabBarStyle: tabBarStyle,
                tabBarHideOnKeyboard: true,
            })}>
            <Tab.Screen name={peopleName} component={People} />
            <Tab.Screen name={newTransactionName} component={NewTransaction} />
            <Tab.Screen name={groupsName} component={Groups} />
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </LinearGradient>
  )
}

export default App;