import { useContext } from "react";
import { View, Image } from "react-native";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { StyledButton, GoogleButton } from "../components/Button";
import { CurrentUserContext, DarkContext } from "../Context";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure();

export default function Login({}) {

    const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
    const { dark, setDark } = useContext(DarkContext); 

    function handlePhoneClick() {
      alert("Phone Login");
    }

    async function handleGoogleClick() {
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log(userInfo);
      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // user cancelled the login flow
        } else if (error.code === statusCodes.IN_PROGRESS) {
          // operation (e.g. sign in) is in progress already
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          // play services not available or outdated
        } else {
          // some other error happened
        }
      }
    }

    return (
    <PageWrapper>
    <View 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center"
      style={{
        width: "100%", 
        height: "100%",
      }}>
        <Image 
          source={require("../assets/images/LogoShadow.png")}
          style={{
            width: 250,
            height: 250,
            marginLeft: 20,
          }}
        />
        <CenteredTitle text="Citrus" fontSize={30} />
        <StyledButton text="Sign In With Phone" onClick={handlePhoneClick} marginBottom={10}/>
        <GoogleButton onClick={handleGoogleClick} />
    </View>
    </PageWrapper>
  )
}
