import { useContext } from "react";
import { View, Image } from "react-native";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { StyledButton, GoogleButton } from "../components/Button";
import { CurrentUserContext, DarkContext } from "../Context";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { DBManager } from "../api/db/dbManager";
import auth from "@react-native-firebase/auth";



export default function Login({}) {

    const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
    const { dark, setDark } = useContext(DarkContext); 

    function handlePhoneClick() {
      alert("Phone Login");
    }

    async function handleGoogleClick() {
        GoogleSignin.configure({
          webClientId: '153123374119-83abbudbfvqubbn46im8dvimmgvhip51.apps.googleusercontent.com',
        });
        // Check if your device supports Google Play
        let hasPlay = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const userCredentail = await auth().signInWithCredential(googleCredential);
        const userManager = DBManager.getUserManager(userCredentail.user.uid);
        const userAlreadyExists = await userManager.documentExists();
        if (userAlreadyExists) {
          await userManager.fetchData();
          setCurrentUserManager(userManager);
        } else {
          userManager.setCreatedAt(new Date());
          userManager.setDisplayName(userCredentail.user.displayName);
          userManager.setEmail(userCredentail.user.email);
          userManager.setPfpUrl(userCredentail.user.photoURL);
          await userManager.push();
          setCurrentUserManager(userManager);
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
