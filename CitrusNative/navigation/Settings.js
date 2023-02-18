import { useState, useContext } from "react";
import { View } from "react-native";
import { darkTheme, lightTheme } from "../assets/styles";
import AvatarIcon from "../components/Avatar";
import { AlignedText, CenteredTitle } from "../components/Text";
import { SettingsWrapper } from "../components/Wrapper";
import { DarkModeButton, StyledButton, EditButton } from "../components/Button";
import Topbar from "../components/Topbar";
import { DarkContext, CurrentUserContext } from "../Context";
import { googleAuth } from "../api/auth";
import { AppStack } from "../App";

export default function Settings({navigation}) {

  const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);

  async function handleLogout() {
    await googleAuth.signOut();
    setCurrentUserManager(null);
  }

  return currentUserManager && (
    <SettingsWrapper>
      <View 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center"
        style={{
          width: "100%", 
          height: "80%", 
          elevation: 2,
          paddingBottom: 50,
          paddingTop: 10,
        }}>

          <AvatarIcon src={currentUserManager.data.personalData.pfpUrl} size={200} />
          
          <View 
            display="flex" 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center" 
            style={{
              width: "50%",
              margin: 20
            }}>
              <EditButton />
              <DarkModeButton />
          </View>
          
          <CenteredTitle text={currentUserManager.data.personalData.displayName} />
          <CenteredTitle text={"Email: " + (currentUserManager.data.personalData.email ? currentUserManager.data.personalData.email : "?")} alignment="left" />
          <CenteredTitle text={"Phone: " + (currentUserManager.data.personalData.phoneNumber ? currentUserManager.data.personalData.phoneNumber : "?")} alignment="left" />

          <StyledButton text="Logout" color="red" onClick={handleLogout}/>
      </View>
    </SettingsWrapper>
  )
}
