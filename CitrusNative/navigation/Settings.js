import { useState, useContext } from "react";
import { View } from "react-native";
import { darkTheme, lightTheme } from "../assets/styles";
import AvatarIcon from "../components/Avatar";
import { AlignedText, CenteredTitle } from "../components/Text";
import { SettingsWrapper } from "../components/Wrapper";
import { StyledButton } from "../components/Button";
import Topbar from "../components/Topbar";
import { DarkContext, CurrentUserContext } from "../Context";
import { googleAuth } from "../api/auth";
import { AppStack } from "../App";

export default function Settings({navigation}) {

  const { dark, setDark } = useContext(DarkContext);
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
          backgroundColor: dark ? darkTheme.settingsCardFill : lightTheme.settingsCardFill,
          borderRadius: 20,
          elevation: 5,
        }}>
          <AvatarIcon src={currentUserManager.data.personalData.pfpUrl} size={200} />
          <CenteredTitle text={currentUserManager.data.personalData.displayName} />
          <CenteredTitle text={"Email: " + (currentUserManager.data.personalData.email ? currentUserManager.data.personalData.email : "?")} alignment="left" />
          <CenteredTitle text={"Phone: " + (currentUserManager.data.personalData.phoneNumber ? currentUserManager.data.personalData.phoneNumber : "?")} alignment="left" />
          <StyledButton text="Edit" />
          <StyledButton text="Logout" color="red" onClick={handleLogout}/>
      </View>
    </SettingsWrapper>
  )
}
