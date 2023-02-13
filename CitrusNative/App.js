import * as React from "react";
import { View, Text, Image } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-gradient-icon";

import People from "./navigation/People";
import NewTransaction from "./navigation/NewTranscation";
import Groups from "./navigation/Groups";
import { tabBarStyle } from "./assets/styles";

const peopleName = "People";
const newTransactionName = "New Transcation";
const groupsName = "Groups";

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
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
                tabBarStyle: tabBarStyle
            })}>
            <Tab.Screen name={peopleName} component={People} />
            <Tab.Screen name={newTransactionName} component={NewTransaction} />
            <Tab.Screen name={groupsName} component={Groups} />
        </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App;