import React from 'react';
import { View, Image } from "react-native";

export function AddButton() {
  return (
    <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={require("../assets/images/AddButton.png")} style={{width: 40, height: 40, backgroundColor: "#282C3D", borderRadius: 20}}/>
    </View>
  )
}
