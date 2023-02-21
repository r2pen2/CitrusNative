import { useContext, useEffect, useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { StyledButton, GoogleButton } from "../components/Button";
import { CurrentUserContext } from "../Context";
import { googleAuth } from "../api/auth";
import { DBManager } from "../api/dbManager";
import auth from "@react-native-firebase/auth";



export default function Login({navigation}) {

    const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
    const [showSpinner, setShowSpinner] = useState(true);

    function handlePhoneClick() {
      alert("Phone Login");
    }

    useEffect(() => {
      setShowSpinner(!currentUserManager);
    }, [currentUserManager]);

    useEffect(() => {
      async function checkSignIn() {
        const signedIn = await googleAuth.isSignedIn();
        setShowSpinner(false);
        if (signedIn) {
          console.log("Signing in automatically...");
          handleGoogleClick();
        } else {
          console.log("Showing sign in options...");
        }
      }
      checkSignIn();
    }, [])

    async function handleGoogleClick() {
        // Check if your device supports Google Play
        let hasPlay = await googleAuth.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken } = await googleAuth.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        auth().signInWithCredential(googleCredential).then(async (userCredentail) => {
          setShowSpinner(true);
          const userManager = DBManager.getUserManager(userCredentail.user.uid);
          const userAlreadyExists = await userManager.documentExists();
          if (userAlreadyExists) {
            await userManager.fetchData();
            setCurrentUserManager(userManager);
            navigation.navigate("dashboard");
          } else {
            userManager.setCreatedAt(new Date());
            userManager.setDisplayName(userCredentail.user.displayName);
            userManager.setEmail(userCredentail.user.email);
            userManager.setPfpUrl(userCredentail.user.photoURL);
            await userManager.push();
            setCurrentUserManager(userManager);
            navigation.navigate("dashboard");
          }
        });
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
        { !showSpinner && <StyledButton text="Sign In With Phone" onClick={handlePhoneClick} marginBottom={10}/>}
        { !showSpinner && <GoogleButton onClick={handleGoogleClick} />}
        { showSpinner && <ActivityIndicator size={"large"}/> }
    </View>
    </PageWrapper>
  )
}
