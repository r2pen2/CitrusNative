import { useState, useEffect, useContext } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AddButton, StyledButton } from "../components/Button";
import { SearchBarFull, SearchBarShort } from "../components/Search";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { createStackNavigator } from "@react-navigation/stack";
import firestore from "@react-native-firebase/firestore";
import { DBManager } from "../api/dbManager";

export default function Groups({navigation}) {

  const GroupStack = createStackNavigator();

  return (
    <GroupStack.Navigator
    initialRouteName="list"
    screenOptions={{
      headerShown: false
    }}>
      <GroupStack.Screen name="list" component={GroupsList} />
      <GroupStack.Screen name="add" component={AddGroup} />
      <GroupStack.Screen name="invite" component={InviteMembers} />
      <GroupStack.Screen name="detail" component={DetailPage} />
    </GroupStack.Navigator> 
  )
}

function GroupsList({navigation}) {

  const [search, setSearch] = useState("");

  return (
    <ScrollView>
      <PageWrapper>
        <CenteredTitle text="Groups" />
        <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
          <SearchBarShort setSearch={(text) => setSearch(text)} />
          <AddButton onClick={() => navigation.navigate("add")}/>
        </View>
      </PageWrapper>
    </ScrollView>
  )
}

function AddGroup() {

  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSearch() {
    if (fetched) {
      return;
    }
    const groupQuery = firestore().collection("groups").where("inviteCode", "==", search);
    const groupQuerySnap = await groupQuery.get();
    if (groupQuerySnap.docs.length == 0) {
      setResult(null);
      setFetched(true);
      return;
    }
    const groupManager = DBManager.getGroupManager(groupQuerySnao.docs[0].id, groupQuerySnap.docs[0].data());
    setResult(groupManager);
    setFetched(true);
  }

  return (
    <PageWrapper justifyContent="center">
      <SearchBarFull setSearch={(text) => {setSearch(text); setFetched(false)}} placeholder="Enter Group Code" onEnter={handleSearch}/>
      { search.length == 0 && <CenteredTitle text="Or" /> }
      { search.length == 0 && <StyledButton text="Create a Group" /> }
      { search.length > 0 && !fetched && <CenteredTitle text="Hit enter to search" /> }
      { fetched && !result && <CenteredTitle text="No groups found with this code :(" /> }
      { fetched && result && <CenteredTitle text="Found group!" />}
    </PageWrapper>
  )
}

function InviteMembers() {
  return (
    <CenteredTitle text="Invite Members" />
  )
}


function DetailPage() {
  return (
    <CenteredTitle text="Group Detail" />
  )
}

