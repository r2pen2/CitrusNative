import React, { useContext } from 'react';
import { View, Image, Pressable, Text } from "react-native";
import CheckBox from "expo-checkbox";
import { DarkContext } from '../Context';
import { darkTheme, lightTheme } from '../assets/styles';

const styles = {
  buttonElevation: 5,
  buttonBorderWidth: 1,
  buttonWidth: 200,
  buttonHeight: 50,
}

export function AddButton() {

  const { dark } = useContext(DarkContext);

  return (
    <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={dark ? require("../assets/images/AddButton.png") : require("../assets/images/AddButtonLight.png")} style={{width: 40, height: 40, backgroundColor: (dark ? "#282C3D" : "#E4E4E4"), borderRadius: 20}}/>
    </View>
  )
}

export function StyledButton(props) {

  const { dark } = useContext(DarkContext);

  return (
    <View 
    style={{
      display: 'flex', 
      flexDirection: "row", 
      width: props.width ? props.width : styles.buttonWidth, 
      height: props.height ? props.height : styles.buttonHeight,
      marginTop: 10,
      marginBottom: 0,
      borderRadius: 10,
      backgroundColor: dark ? darkTheme.buttonFill : lightTheme.buttonFill,
      elevation: styles.buttonElevation
    }}>
      <Pressable
        onPress={props.onClick}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 10,
          borderWidth: styles.buttonBorderWidth,
          borderColor: dark ? darkTheme.buttonBorder : lightTheme.buttonBorder,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text style={{color: (dark ? darkTheme.textPrimary : lightTheme.textPrimary), fontSize: 20}}>
          {props.text}
        </Text>
      </Pressable>
    </View>
  )
}

export function StyledCheckbox(props) {
  return (
    <CheckBox 
    value={props.checked} 
    color={props.checked ? "#fcfcfc" : "#767676"}
    onValueChange={props.setFriendsChecked}/>
  )
}