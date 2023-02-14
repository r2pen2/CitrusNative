import { useContext } from "react";
import { View, Image } from "react-native";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { StyledButton } from "../components/Button";
import { CurrentUserContext, DarkContext } from "../Context";

export default function Login({}) {

    const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
    const { dark, setDark } = useContext(DarkContext); 

    function handlePhoneClick() {
      alert("Phone Login");
    }

    async function handleGoogleClick() {
      alert("Google Login");
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
        <StyledButton text="Sign In With Google" onClick={handleGoogleClick} marginBottom={10}/>
    </View>
    </PageWrapper>
  )
}
