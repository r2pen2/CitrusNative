import * as React from "react";
import { View, Text } from "react-native";
import { darkPage } from "../assets/styles";

export default function Groups({nagivation}) {
  return (
    <View style={darkPage}>
        <Text
            onPress={() => alert('This is the "People" screen.')}
            style={{ fontSize: 26, fontWeight: 'bold'}}>
                Groups
            </Text>
    </View>
  )
}
