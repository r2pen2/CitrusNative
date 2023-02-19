import React, { useContext } from 'react';
import { View, Image, Pressable, Text } from "react-native";
import CheckBox from "expo-checkbox";
import { DarkContext } from '../Context';
import { darkTheme, lightTheme, globalColors } from '../assets/styles';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

const styles = {
  buttonElevation: 2,
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

export function DarkModeButton() {

  const { dark, setDark } = useContext(DarkContext);

  return (
    <Pressable onPress={() => setDark(!dark)}>
      <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={dark ? require("../assets/images/LightMode.png") : require("../assets/images/DarkMode.png")} style={{width: 40, height: 40, backgroundColor: "transparent"}}/>
      </View>
    </Pressable>
  )
}

export function EditButton() {

  const { dark, setDark } = useContext(DarkContext);

  return (
    <Pressable onPress={() => setDark(!dark)}>
      <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={dark ? require("../assets/images/EditDark.png") : require("../assets/images/EditLight.png")} style={{width: 40, height: 40, backgroundColor: "transparent"}}/>
      </View>
    </Pressable>
  )
}

export function StyledButton(props) {

  const { dark } = useContext(DarkContext);

  function getBorderColor() {
    if (props.color) {
      if (props.color === "red") {
        return globalColors.red;
      }
      if (props.color === "green") {
        return globalColors.green;
      }
    }
    if (props.disabled) {
      return dark ? darkTheme.buttonBorderDisabled : lightTheme.buttonBorderDisabled;
    }
    return dark ? darkTheme.buttonBorder : lightTheme.buttonBorder;
  }

  function getTextColor() {
    if (props.color) {
      if (props.color === "red") {
        return globalColors.red;
      }
      if (props.color === "green") {
        return globalColors.green;
      }
    }
    if (props.disabled) {
      return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
    }
    return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
  }

  return (
    <View 
    style={{
      display: 'flex', 
      flexDirection: "row", 
      width: props.width ? props.width : styles.buttonWidth, 
      height: props.height ? props.height : styles.buttonHeight,
      marginTop: 10,
      marginBottom: props.marginBottom ? props.marginBottom : 0,
      borderRadius: 10,
      backgroundColor: dark ? darkTheme.buttonFill : lightTheme.buttonFill,
      elevation: styles.buttonElevation
    }}>
      <Pressable
        onPress={props.onClick}
        disabled={props.disabled}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 10,
          borderWidth: styles.buttonBorderWidth,
          borderColor: getBorderColor(),
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text style={{color: (getTextColor()), fontSize: 20}}>
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
    onValueChange={props.onChange}/>
  )
}


export function GoogleButton({onClick}) {

  return (
    <View 
    style={{
      display: 'flex', 
      flexDirection: "row", 
      width: styles.buttonWidth, 
      height: styles.buttonHeight,
      marginTop: 10,
      marginBottom:  0,
      borderRadius: 10,
      elevation: styles.buttonElevation
    }}>
      <Pressable
        onPress={onClick}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <GoogleSigninButton />
      </Pressable>
    </View>
  )
}
