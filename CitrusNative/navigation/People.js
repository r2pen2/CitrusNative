import { useState, useEffect, useContext } from "react";
import { Keyboard, View } from "react-native";
import { SearchBarFull, SearchBarHalf, SearchBarShort } from "../components/Search";
import { AddButton, StyledButton } from "../components/Button";
import { ScrollView } from "react-native-gesture-handler";
import { CenteredTitle, LegalLabel, StyledText } from "../components/Text";
import { CardWrapper, PageWrapper, ScrollPage } from "../components/Wrapper";
import { UsersContext, CurrentUserContext, DarkContext, FocusContext } from "../Context";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { RelationLabel, RelationHistoryLabel, EmojiBar } from "../components/Text";
import { createStackNavigator } from "@react-navigation/stack";
import firestore from "@react-native-firebase/firestore";
import { DBManager } from "../api/dbManager";
import { darkTheme, globalColors, lightTheme } from "../assets/styles"
import { getDateString } from "../api/strings";

export default function People({navigation}) {
  
  const { usersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);
  
  const PeopleStack = createStackNavigator();
  
  const [search, setSearch] = useState("");

  return (
    <PeopleStack.Navigator
    initialRouteName="relations"
    screenOptions={{
      headerShown: false
    }}>
      <PeopleStack.Screen name="relations" component={RelationsPage} />
      <PeopleStack.Screen name="add" component={AddPage} />
      <PeopleStack.Screen name="detail" component={DetailPage} />
    </PeopleStack.Navigator>     
  )
}

function RelationsPage({navigation}) {
  const { usersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { focus, setFocus } = useContext(FocusContext);

  const [search, setSearch] = useState("");
  
  function renderRelations() {

    let sortedRelations = [];
    for (var relation in currentUserManager.data.relations) {
        sortedRelations.push([relation, currentUserManager.data.relations[relation]]);
    }
    sortedRelations.sort(function(a, b) {
        return (b[1].balances["USD"] ? b[1].balances["USD"] : 0) - (a[1].balances["USD"] ? a[1].balances["USD"] : 0);
    });

    return currentUserManager && sortedRelations.map((key, index) => {
      const userId = key[0];
      function getGradient() {
        if (currentUserManager.data.relations[userId].balances["USD"] > 0) {
          return "green";
        }
        if (currentUserManager.data.relations[userId].balances["USD"] < 0) {
          return "red";
        }
        return "white";
      }

      function focusUser() {
        const newFocus = {...focus};
        newFocus.user = userId;
        setFocus(newFocus);
        navigation.navigate("detail");
      }
      
      return (
        usersData[userId] && (usersData[userId].personalData.displayNameSearchable.includes(search.toLocaleLowerCase().replace(" ", ""))) && 
        <GradientCard key={index} gradient={getGradient()} onClick={focusUser}>
          <View display="flex" flexDirection="row" alignItems="center">
            <AvatarIcon src={usersData[userId].personalData.pfpUrl} />
            <View display="flex" flexDirection="column" alignItems="center" justifyContent="space-between" onClick={focusUser}>
              <StyledText marginLeft={10} marginTop={-4} marginBottom={0} text={usersData[userId].personalData.displayName} onClick={focusUser}/>
              <EmojiBar transform={[{translateY: 2}]} relation={currentUserManager.data.relations[userId]} onClick={focusUser} />
            </View>
          </View>
          <RelationLabel relation={currentUserManager.data.relations[userId]} onClick={focusUser}/>
        </GradientCard>
      )
    })
  }

  return (
    <PageWrapper>
      <CenteredTitle text="People" />
      <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
        <SearchBarShort setSearch={(text) => setSearch(text)} />
        <AddButton onClick={() => navigation.navigate("add")}/>
      </View>
      <ScrollView style={{marginTop: 20, width: "100%"}}>
        { currentUserManager && renderRelations() }
      </ScrollView>
    </PageWrapper>      
  )

}

function AddPage({navigation}) {

  const { dark } = useContext(DarkContext);
  const { usersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);

  const [search, setSearch] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  function renderSearchResults() {
    return searchResults.map((result, index) => {
      
      function getGradient() {
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          return "green";
        }
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return "green";
        }
        return "white";
      }

      function getRightText() {
        if (currentUserManager.data.outgoingFriendRequests.includes(result.documentId)) {
          return "Pending..."
        }
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          return "Incoming Request";
        }
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return "Friends ✓";
        }
        let mutuals = 0;
        for (const friendId of currentUserManager.data.friends) {
          for (const otherPersonFriend of result.data.friends) {
            if (friendId === otherPersonFriend) {
              mutuals++;
            }
          }
        }
        return `${mutuals} mutual friend${mutuals != 1 ? "s" : ""}`;
      }

      function getRightColor() {
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return globalColors.green;
        }
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          return globalColors.green;
        }
        return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
      }

      function handleUserClick() {
        Keyboard.dismiss();
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return;
        }
        if (currentUserManager.data.outgoingFriendRequests.includes(result.documentId)) {
          return;
        }
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          // This person already wants to be out friend!
          // Accept the request
          currentUserManager.removeIncomingFriendRequest(result.documentId);
          currentUserManager.addFriend(result.documentId);
          result.removeOutgoingFriendRequest(currentUserManager.documentId);
          result.addFriend(currentUserManager.documentId);
          currentUserManager.push();
          result.push();
          return;
        }
        // Otherwise, we sent a friend request
        currentUserManager.addOutgoingFriendRequest(result.documentId);
        result.addIncomingFriendRequest(currentUserManager.documentId);
        currentUserManager.push();
        result.push();
      }

      return (
      <GradientCard key={index} gradient={getGradient()} onClick={handleUserClick}>
        <View display="flex" flexDirection="row" alignItems="center">
          <AvatarIcon src={result.data.personalData.pfpUrl} />
          <StyledText marginLeft={10} text={result.data.personalData.displayName} onClick={handleUserClick}/>
        </View>
        <StyledText text={getRightText()} color={getRightColor()} fontSize={14} onClick={handleUserClick}/>
      </GradientCard>
      )
    })
  }

  async function handleSearchChange(text) {
    if (text.length < 1) {
      setSearchResults([])
      return;
    }

    let newSearch = text;
    newSearch = newSearch.replace(" ", "");
    newSearch = newSearch.toLowerCase();
    setSearch(newSearch);
  }

  async function executeSearch() {
    const displayNameQuery = firestore().collection("users")
      .where('personalData.displayNameSearchable', '>=', search)
      .where('personalData.displayNameSearchable', '<=', search + '\uf8ff');
    
    const emailQuery = firestore().collection("users")
      .where("personalData.email", "==", search);
    const phoneQuery = firestore().collection("users")
      .where("personalData.phoneNumber", "==", search);
    
    let specificSearch = false;
    let newResults = [];

    const emailData = await emailQuery.get();
    if (emailData.docs.length > 0) {
      // We found a user by email!
      specificSearch = true;
      const userManager = DBManager.getUserManager(emailData.docs[0].id, emailData.docs[0].data());
      newResults.push(userManager);
    }

    if (!specificSearch) {
      const phoneData = await phoneQuery.get();
      if (phoneData.docs.length > 0) {
        // We found a user by email!
        specificSearch = true;
        const userManager = DBManager.getUserManager(phoneData.docs[0].id, phoneData.docs[0].data());
        newResults.push(userManager);
      }
    }

    if (!specificSearch) {
      const displayNameData = await displayNameQuery.get();
      for (const doc of displayNameData.docs) {
        if (doc.id !== currentUserManager.documentId) {
          const userManager = DBManager.getUserManager(doc.id, doc.data());
          newResults.push(userManager);
        }
      }
    }
    
    setSearchResults(newResults);
  }

  return (
    <PageWrapper>
      <CenteredTitle text="Add Friends" />
      <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{width: "100%"}}>
        <SearchBarFull setSearch={handleSearchChange} onEnter={executeSearch} placeholder="Name, Phone Number, or Email" />
      </View>
      <ScrollView style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
        { searchResults.length == 0 && <StyledText text="Search and hit enter for results." color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} /> }
        { currentUserManager && renderSearchResults() }
      </ScrollView>
    </PageWrapper>      
  )

}

function DetailPage({navigation}) {

  const { dark } = useContext(DarkContext);
  const { usersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { focus } = useContext(FocusContext);

  const [search, setSearch] = useState("");

  function renderHistory() {
    return currentUserManager.data.relations[focus.user].history.map((history, index) => {
      
      function getGradient() {
        if (history.amount > 0) {
          return "green";
        }
        if (history.amount < 0) {
          return "red";
        }
        return "white";
      } 

      return history.transactionTitle.includes(search.toLowerCase().replace(" ", "")) && 
      <GradientCard key={index} gradient={getGradient()}>
        <View display="flex" flexDirection="column" alignItems="flex-start" justifyContent="space-between">
          <StyledText text={history.transactionTitle}/>
          <StyledText marginTop={0.001} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} text={getDateString(history.date)}/>
        </View>
        <RelationHistoryLabel history={history} />
      </GradientCard>
    })
  }

  return (
    <ScrollPage>

      <CardWrapper display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" height={150} paddingBottom={0.001} marginBottom={10}>
        <AvatarIcon src={usersData[focus.user].personalData.pfpUrl} size={120}/>
        <View display="flex" flexDirection="column" justifyContent="space-around" alignItems="center">
          <CenteredTitle text={usersData[focus.user].personalData.displayName} fontSize={24}/>
          <RelationLabel relation={currentUserManager.data.relations[focus.user]} fontSize={30}/>
          <EmojiBar relation={currentUserManager.data.relations[focus.user]} justifyContent="center" size="large" marginTop={20} marginBottom={20}/>
        </View>
      </CardWrapper>

      <View display="flex" flexDirection="row" justifyContent="space-around" alignItems="center" style={{width: "100%", marginBottom: 20}}>
        <StyledButton text="Settle" width="40%"/>
        <StyledButton text="Venmo" width="40%" color={"venmo"}/>
      </View>

      <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{width: "100%"}} size="large">
        <SearchBarFull setSearch={(text) => setSearch(text)} />
      </View>
      
      <View style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
        { renderHistory() }
      </View>
    </ScrollPage>      
  )

}