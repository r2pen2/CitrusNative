import { useState, useEffect, useContext } from "react";
import { View, Modal, Keyboard, Pressable, Image, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AddButton, StyledButton, NewTransactionPill, SettingsPill, PersonAddPill, LeaveGroupPill } from "../components/Button";
import { SearchBarFull, SearchBarShort } from "../components/Search";
import { CenteredTitle, GroupLabel, StyledText } from "../components/Text";
import { PageWrapper, CardWrapper, StyledModalContent, ScrollPage, TrayWrapper } from "../components/Wrapper";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { createStackNavigator } from "@react-navigation/stack";
import firestore from "@react-native-firebase/firestore";
import { DBManager } from "../api/dbManager";
import { Entry } from "../components/Input";
import { TransactionLabel, EmojiBar } from "../components/Text";
import { CurrentUserContext, DarkContext, GroupsContext, FocusContext, TransactionsContext, NewTransactionContext } from "../Context";
import { getDateString } from "../api/strings";
import { lightTheme, darkTheme } from "../assets/styles";
import TransactionDetail from "./TransactionDetail";
import { legalCurrencies, emojiCurrencies } from "../api/enum";

export default function Groups({navigation}) {

  const GroupStack = createStackNavigator();

  function navigateToUserDetail() {
    navigation.navigate("People", {screen: "detail"});
  }

  return (
    <GroupStack.Navigator
    initialRouteName="list"
    screenOptions={{
      headerShown: false
    }}>
      <GroupStack.Screen name="default" component={GroupsList} />
      <GroupStack.Screen name="list" component={GroupsList} />
      <GroupStack.Screen name="add" component={AddGroup} />
      <GroupStack.Screen name="invite" component={InviteMembers} />
      <GroupStack.Screen name="detail" component={DetailPage} />
      <GroupStack.Screen name="transaction" component={TransactionDetail} initialParams={{navigateToUser: navigateToUserDetail}} />
    </GroupStack.Navigator> 
  )
}

function GroupsList({navigation}) {

  const [ search, setSearch ] = useState("");
  const { currentUserManager } = useContext(CurrentUserContext);
  const { groupsData } = useContext(GroupsContext);
  const { focus, setFocus } = useContext(FocusContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  const { dark } = useContext(DarkContext);

  const [groups, setGroups] = useState([]);


  const newTransactionSwipeIndicator = <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{width: "100%", paddingLeft: 20 }}>
    <Image source={dark ? require("../assets/images/AddButton.png") : require("../assets/images/AddButtonLight.png")} style={{width: 20, height: 20, borderWidth: 1, borderRadius: 15, borderColor: dark ? darkTheme.buttonBorder : lightTheme.buttonBorder}}/>
    <StyledText text="New Transaction" marginLeft={10} />
  </View>

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
  }, [groupsData, currentUserManager]);

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
            if (group.balances[currentUserManager.documentId]["USD"].toFixed(2) > 0) {
              return "green";
            }
            if (group.balances[currentUserManager.documentId]["USD"].toFixed(2) < 0) {
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


      function handleNewTransactionClick() {
        const newUsers = {};
        for (const u of group.users) {
          newUsers[u] =  {
            id: u,
            paid: false,
            split: true,
            paidManual: null,
            splitManual: null,
          };
        }
        newUsers[currentUserManager.documentId] = {
          id: currentUserManager.documentId,
          paid: true,
          split: true,
          paidManual: null,
          splitManual: null,
        };
        setNewTransactionData({
          users: newUsers,
          group: group.id,
          total: null,
          legalType: legalCurrencies.USD,
          emojiType: emojiCurrencies.BEER,
          currencyMenuOpen: false,
          currencyLegal: true,
          split: "even",
          splitPercent: false,
          paidBy: "even",
          paidByPercent: false,
          title: null,
          isIOU: false,
          firstPage: false,
          paidByModalState: {
            evenPayers: [currentUserManager.documentId],
            manualValues: {},
            percent: false,
          },
          splitModalState: {
            evenSplitters: group.users,
            manualValues: {},
            percent: false,
          }
        });
        navigation.navigate("New Transaction", {screen: "amount-entry"});
      }

      return (groupsData[group.id] && groupInSearch() &&
        <GradientCard key={index} gradient={getGradient()} onClick={focusGroup} leftSwipeComponent={newTransactionSwipeIndicator} onLeftSwipe={handleNewTransactionClick}>
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
      <ScrollView style={{width: "100%"}}>
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

function DetailPage({navigation}) {

  const { focus, setFocus } = useContext(FocusContext);
  const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
  const { groupsData } = useContext(GroupsContext);
  const { transactionsData } = useContext(TransactionsContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  const [ search, setSearch ] = useState("");
  const [currentGroupData, setCurrentGroupData] = useState(null);
  const { dark } = useContext(DarkContext);

  const [ transactions, setTransactions ] = useState([]);

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

  useEffect(() => {
    if (!currentGroupData) {
      return;
    }
    let newTransactions = [];
    for (const transactionId of Object.keys(transactionsData)) {
      if (currentGroupData.transactions.includes(transactionId)) {
        const transaction = transactionsData[transactionId];
        transaction["id"] = transactionId;
        newTransactions.push(transaction);
      }
    }
    setTransactions(newTransactions);
  }, [transactionsData, currentGroupData])

  function renderTransactions() {
    return transactions.map((transaction, index) => {
      
      const bal = transaction.balances[currentUserManager.documentId].toFixed(2);

      function getGradient() {
        if (bal > 0) {
          return "green";
        }
        if (bal < 0) {
          return "red";
        }
        return "white";
      }

      function renderTransactionAvatars(onClick) {
        return Object.keys(transaction.balances).map((userId, index) => {
          return <AvatarIcon id={userId} key={index} size={30} marginRight={-5} onClick={onClick}/>
        })
      }

      function transactionInSearch() {
        return transaction.title.toLocaleLowerCase().includes(search.toLocaleLowerCase().replace(" ", ""));
      }

      function goToTransaction() {
        const newFocus = {...focus};
        newFocus.transaction = transaction.id;
        setFocus(newFocus);
        navigation.navigate("transaction");
      }

      return transactionInSearch() && <GradientCard key={index} gradient={getGradient()} onClick={goToTransaction} >
        <Pressable display="flex" flexDirection="column" alignItems="flex-start">
          <StyledText text={transaction.title} onClick={goToTransaction} />
          <StyledText text={getDateString(transaction.date)} fontSize={14} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} onClick={goToTransaction} />
        </Pressable>
        <Pressable display="flex" flexDirection="column" alignItems="flex-end" justifyContent="space-between" onClick={goToTransaction} >
          <TransactionLabel current={true} transaction={transaction} />
          <Pressable display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end" style={{marginTop: 10}} onClick={goToTransaction} >
          { renderTransactionAvatars() }
          </Pressable>
        </Pressable>
        </GradientCard>
    });
  }

  function handleNewTransactionClick() {
    const newUsers = {};
    for (const u of currentGroupData.users) {
      newUsers[u] =  {
        id: u,
        paid: false,
        split: true,
        paidManual: null,
        splitManual: null,
      };
    }
    newUsers[currentUserManager.documentId] = {
      id: currentUserManager.documentId,
      paid: true,
      split: true,
      paidManual: null,
      splitManual: null,
    };
    setNewTransactionData({
      users: newUsers,
      group: focus.group,
      total: null,
      legalType: legalCurrencies.USD,
      emojiType: emojiCurrencies.BEER,
      currencyMenuOpen: false,
      currencyLegal: true,
      split: "even",
      splitPercent: false,
      paidBy: "even",
      paidByPercent: false,
      title: null,
      isIOU: false,
      firstPage: false,
      paidByModalState: {
        evenPayers: [currentUserManager.documentId],
        manualValues: {},
        percent: false,
      },
      splitModalState: {
        evenSplitters: currentGroupData.users,
        manualValues: {},
        percent: false,
      }
    });
    navigation.navigate("New Transaction", {screen: "amount-entry"});
  }

  function leaveGroup() {
    const groupManager = DBManager.getGroupManager(focus.group);
    groupManager.removeUser(currentUserManager.documentId);
    currentUserManager.removeGroup(focus.group);
    if (currentGroupData.users.length === 1) {
      groupManager.deleteDocument();
    } else {
      groupManager.push();
    }
    currentUserManager.push();
    navigation.navigate("list");
  }

  return ( groupsData[focus.group] && currentGroupData && currentUserManager && 
    <ScrollPage>
      <CardWrapper display="flex" flexDirection="column" justifyContent="center" alignItems="center" marginBottom={10}>  
        <CenteredTitle text={currentGroupData.name} fontSize={24}/>
        <View display="flex" flexDirection="row" alignItems="center" justifyContent="center" marginBottom={10} marginTop={10}>
          { renderAvatars() }
        </View>
        <GroupLabel group={currentGroupData} fontSize={30}/>
        <EmojiBar group={currentGroupData} justifyContent="center" size="large" marginBottom={20} marginTop={20}/>
      </CardWrapper>

      <TrayWrapper>
        <NewTransactionPill onClick={handleNewTransactionClick}/>
        <PersonAddPill />
        <SettingsPill />
        <LeaveGroupPill onClick={() => 
          Alert.alert(
            "Leave Group?", 
            `Leave ${currentGroupData.name}?`, 
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Leave Group',
                onPress: () => leaveGroup(),
                style: 'destructive',
              },
            ],)}/>
      </TrayWrapper>

      <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{width: "100%"}} size="large">
        <SearchBarFull setSearch={(text) => setSearch(text)} />
      </View>
      
      <View style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
        { renderTransactions() }
      </View>
    </ScrollPage>      
  )
}

