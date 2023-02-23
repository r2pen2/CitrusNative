import { useState, useEffect, useContext } from "react";
import { View, Modal, Keyboard, FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AddButton, StyledButton } from "../components/Button";
import { SearchBarFull, SearchBarShort } from "../components/Search";
import { CenteredTitle, GroupLabel, StyledText } from "../components/Text";
import { PageWrapper, CardWrapper, StyledModalContent, ScrollPage } from "../components/Wrapper";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { createStackNavigator } from "@react-navigation/stack";
import firestore from "@react-native-firebase/firestore";
import { DBManager } from "../api/dbManager";
import { Entry } from "../components/Input";
import { RelationLabel, EmojiBar } from "../components/Text";
import { CurrentUserContext, GroupsContext, FocusContext } from "../Context";

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

  const [ search, setSearch ] = useState("");
  const { currentUserManager } = useContext(CurrentUserContext);
  const { groupsData } = useContext(GroupsContext);
  const { focus, setFocus } = useContext(FocusContext);

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!currentUserManager) {
      return;
    }
    let newGroups = [];
    for (const groupId of Object.keys(groupsData)) {
      if (currentUserManager.data.groups.includes(groupId)) {
        const g = {...groupsData[groupId]};
        g['id'] = groupId;
        newGroups.push(g);
      }
    }
    setGroups(newGroups);
  }, [groupsData])

  function renderGroups() {
    return currentUserManager && groups.map((group, index) => {

      function renderAvatars() {
        return group.users.map((user, ix) => {
          return <AvatarIcon id={user} key={ix} size={40} marginRight={-10} />
        })
      }

      function getGradient() {
        if (group.balances[currentUserManager.documentId]) {
          if (group.balances[currentUserManager.documentId]["USD"]) {
            if (group.balances[currentUserManager.documentId]["USD"] > 0) {
              return "green";
            }
            if (group.balances[currentUserManager.documentId]["USD"] < 0) {
              return "red";
            }
          }
        }
        return "white";
      }

      function focusGroup() {
        const newFocus = {...focus};
        newFocus.group = group.id;
        setFocus(newFocus);
        navigation.navigate("detail");
      }

      function groupInSearch() {
        return group.name.toLocaleLowerCase().includes(search.toLocaleLowerCase().replace(" ", ""));
      }

      return ( groupsData[group.id] && groupInSearch() &&
        <GradientCard key={index} gradient={getGradient()} onClick={focusGroup}>
          <View display="flex" flexDirection="column" alignItems="flex-start" justifyContent="space-between">
            <StyledText text={group.name} marginTop={0.01} onClick={focusGroup}/>
            <View display="flex" flexDirection="row" alignItems="flex-start" justifyContent="flex-start">
              { renderAvatars() }
            </View>
          </View>
          <View display="flex" flexDirection="column" alignItems="flex-end" justifyContent="space-between">
            <GroupLabel group={group} marginBottom={20} onClick={focusGroup}/>
            <EmojiBar group={group} justifyContent="flex-end" />
          </View>
        </GradientCard>
      )
    })
  }

  return (
    <PageWrapper>
      <CenteredTitle text="Groups" />
      <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%", marginBottom: 20}}>
        <SearchBarShort setSearch={(text) => setSearch(text)} />
        <AddButton onClick={() => navigation.navigate("add")}/>
      </View>
      <ScrollView style={{marginTop: 20, width: "100%"}}>
        { currentUserManager && renderGroups() }
      </ScrollView>
    </PageWrapper>
  )
}

function AddGroup({navigation}) {

  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [result, setResult] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { currentUserManager } = useContext(CurrentUserContext);
  const { groupsData, setGroupsData } = useContext(GroupsContext);
  const { focus, setFocus } = useContext(FocusContext);

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

  async function handleCreate() {
    // Create group
    const groupManager = DBManager.getGroupManager();
    groupManager.setName(newName);
    groupManager.setCreatedAt(new Date());
    groupManager.setCreatedBy(currentUserManager.documentId);
    groupManager.addUser(currentUserManager.documentId);
    await groupManager.push();

    // Save group data locally
    const newData = {...groupsData};
    newData[groupManager.documentId] = groupManager.data;
    setGroupsData(newData);

    // Add group to current user
    currentUserManager.addGroup(groupManager.documentId);
    currentUserManager.push();

    // Set focus
    const newFocus = {...focus};
    newFocus.group = groupManager.documentId;
    setFocus(newFocus);

    // Go to group detail
    navigation.navigate("detail");
  }

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
     const keyboardDidShowListener = Keyboard.addListener(
       'keyboardDidShow',
       () => {
         setKeyboardVisible(true); // or some other action
       }
     );
     const keyboardDidHideListener = Keyboard.addListener(
       'keyboardDidHide',
       () => {
         setKeyboardVisible(false); // or some other action
       }
     );
 
     return () => {
       keyboardDidHideListener.remove();
       keyboardDidShowListener.remove();
     };
   }, []);

   function showForm() {
    return !(createModalOpen && isKeyboardVisible);
   }

  return (
    <PageWrapper justifyContent="center">

        <Modal
          animationType="slide"
          transparent={true}
          visible={createModalOpen}
          onRequestClose={() => {
            setCreateModalOpen(!createModalOpen);
          }}>
          <StyledModalContent>
            <CenteredTitle text="New Group" marginBottom={20} fontSize={20}/>
             <Entry placeholderText="Group Name" width="75%" value={newName} marginBottom={20} onChange={(text) => setNewName(text)}/>
             <StyledButton text="Create" onClick={handleCreate} />
          </StyledModalContent>
        </Modal>

      { showForm() && <SearchBarFull setSearch={(text) => {setSearch(text); setFetched(false)}} placeholder="Enter Group Code" onEnter={handleSearch}/> }
      { showForm() && search.length == 0 && <CenteredTitle text="Or" /> }
      { showForm() && search.length == 0 && <StyledButton text="Create a Group" onClick={() => setCreateModalOpen(true)}/> }
      { showForm() && search.length > 0 && !fetched && <CenteredTitle text="Hit enter to search" /> }
      { showForm() && fetched && !result && <CenteredTitle text="No groups found with this code :(" /> }
      { showForm() && fetched && result && <CenteredTitle text="Found group!" />}
    </PageWrapper>
  )
}

function InviteMembers() {
  return (
    <CenteredTitle text="Invite Members" />
  )
}


function DetailPage() {

  const { focus } = useContext(FocusContext);
  const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
  const { groupsData } = useContext(GroupsContext);
  const [ search, setSearch ] = useState("");
  const [currentGroupData, setCurrentGroupData] = useState(null);

  useEffect(() => {
    if (groupsData[focus.group]) {
      setCurrentGroupData(groupsData[focus.group]);
    }
  }, [groupsData])

  function renderAvatars() {

    function getAvatarSize() {
      return 100 - currentGroupData.users.length * 5;
    }

    return currentGroupData.users.map((user, ix) => {
      return (
          <AvatarIcon key={ix} id={user} size={getAvatarSize()} marginRight={-1 * (getAvatarSize() / 6)} marginLeft={-1 * (getAvatarSize() / 6)} />
      )
    })
  }

  return ( groupsData[focus.group] && currentGroupData &&
    <ScrollPage>
      <CardWrapper display="flex" flexDirection="column" justifyContent="center" alignItems="center" marginBottom={10}>  
        <CenteredTitle text={currentGroupData.name} fontSize={24}/>
        <View display="flex" flexDirection="row" alignItems="center" justifyContent="center" marginBottom={10} marginTop={10}>
          { renderAvatars() }
        </View>
        <GroupLabel group={currentGroupData} fontSize={30}/>
        <EmojiBar group={currentGroupData} justifyContent="center" size="large" marginBottom={20} marginTop={20}/>
      </CardWrapper>

      <View display="flex" flexDirection="row" justifyContent="space-around" alignItems="center" style={{width: "100%", marginBottom: 20}}>
        <StyledButton text="Settings" width="40%"/>
        <StyledButton text="Leave" width="40%" color="red"/>
      </View>


      <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{width: "100%"}} size="large">
        <SearchBarFull setSearch={(text) => setSearch(text)} />
      </View>
      
      <View style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
      </View>
    </ScrollPage>      
  )
}

