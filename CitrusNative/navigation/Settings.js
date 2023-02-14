import { useState } from "react";
import { View } from "react-native";
import AvatarIcon from "../components/Avatar";
import { CenteredTitle } from "../components/Text";
import { SettingsWrapper } from "../components/Wrapper";

export default function Settings({}) {

  const [search, setSearch] = useState("");

  return (
    <SettingsWrapper>
      <View 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center"
        style={{
          width: "100%", 
          height: "80%", 
          backgroundColor: "#22242E",
          borderRadius: 20,
          elevation: 5,
        }}>
          <AvatarIcon src="https://i.pinimg.com/736x/b7/9b/08/b79b0879ca5df87757e0fd4d0e8796fd.jpg" size={200} />
          <CenteredTitle text="Joe Dobbelaar" />
      </View>
    </SettingsWrapper>
  )
}
