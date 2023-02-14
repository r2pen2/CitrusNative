import React from 'react';
import { View, Image, Pressable, Text } from "react-native";

export function AddButton() {
  return (
    <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={require("../assets/images/AddButton.png")} style={{width: 40, height: 40, backgroundColor: "#282C3D", borderRadius: 20}}/>
    </View>
  )
}
export function StyledButton(props) {
  return (
    <View 
    style={{
      display: 'flex', 
      direction: "row", 
      width: props.width ? props.width : 200, 
      height: props.height ? props.height : 50,
      marginTop: 10,
      marginBottom: 0,
      }}>
      <Pressable
        onPress={props.onClick}
        style={{
        height: "100%",
        width: "100%",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FCFCFC",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        }}>
        <Text style={{color: "#FCFCFC", fontSize: 20}}>
          {props.text}
        </Text>
      </Pressable>
    </View>
  )
}