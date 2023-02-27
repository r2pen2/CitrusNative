import { useState, useEffect, useContext } from "react";
import { View, Modal, Pressable, Image, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AddButton, StyledButton, NewTransactionPill, SettingsPill, PersonAddPill, LeaveGroupPill, StyledCheckbox } from "../components/Button";
import { CenteredTitle, GroupLabel, StyledText } from "../components/Text";
import { PageWrapper, CardWrapper, StyledModalContent, ScrollPage, TrayWrapper, ListScroll } from "../components/Wrapper";
import { GradientCard } from "../components/Card";
import { AvatarIcon, GroupRelationAvatars, AvatarList } from "../components/Avatar";
import { createStackNavigator } from "@react-navigation/stack";
import { DBManager } from "../api/dbManager";
import { Entry, SearchBarFull, SearchBarShort } from "../components/Input";
import { TransactionLabel, EmojiBar } from "../components/Text";
import { CurrentUserContext, DarkContext, GroupsContext, FocusContext, TransactionsContext, NewTransactionContext, UsersContext } from "../Context";
import { getDateString } from "../api/strings";
import { lightTheme, darkTheme, globalColors } from "../assets/styles";
import TransactionDetail from "../components/TransactionDetail";
import { legalCurrencies, emojiCurrencies, notificationTypes } from "../api/enum";
import { NotificationFactory } from "../api/notification";

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
      <GroupStack.Screen name="invite" component={InviteMembers} />
      <GroupStack.Screen name="detail" component={DetailPage} />
      <GroupStack.Screen name="settings" component={Settings} />
      <GroupStack.Screen name="transaction" component={TransactionDetail} initialParams={{navigateToUser: navigateToUserDetail}} />
    </GroupStack.Navigator> 
  )
}

function GroupsList({navigation}) {

  const [ search, setSearch ] = useState("");
  const { currentUserManager } = useContext(CurrentUserContext);
  const { groupsData, setGroupsData } = useContext(GroupsContext);
  const { focus, setFocus } = useContext(FocusContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  const { dark } = useContext(DarkContext);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [inviteGroups, setInviteGroups] = useState([]);

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

  const [groups, setGroups] = useState([]);


  const newTransactionSwipeIndicator = <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{width: "100%", paddingLeft: 20 }}>
    <Image source={dark ? require("../assets/images/AddButton.png") : require("../assets/images/AddButtonLight.png")} style={{width: 20, height: 20, borderWidth: 1, borderRadius: 15, borderColor: dark ? darkTheme.buttonBorder : lightTheme.buttonBorder}}/>
    <StyledText text="New Transaction" marginLeft={10} />
  </View>

  useEffect(() => {
    async function fetchGroupData() {
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
      let newInviteGroups = [];
      for (const groupId of currentUserManager.data.groupInvitations) {
        if (groupsData[groupId]) {
          const groupData = groupsData[groupId];
          groupData["id"] = groupId;
          newInviteGroups.push(groupData);
        } else {
          const inviteGroupManager = DBManager.getGroupManager(groupId);
          await inviteGroupManager.fetchData();
          const groupData = inviteGroupManager.data;
          groupData["id"] = groupId;
          newInviteGroups.push(groupData);
          // Might as well store this group's data too
          const newData = {...groupsData};
          newData[groupId] = groupData;
          setGroupsData(newData);
        }
      }
      setInviteGroups(newInviteGroups);
    }
    fetchGroupData();
  }, [groupsData, currentUserManager]);

  function renderGroups() {
    return currentUserManager && groups.map((group, index) => {

      let bal = 0;
  
      if (currentUserManager) {
          for (const userId of Object.keys(currentUserManager.data.relations)) {
              if (currentUserManager.data.relations[userId].groupBalances[group.id]) {
                  // User has a bal with this person in this group
                  if (currentUserManager.data.relations[userId].groupBalances[group.id]["USD"]) {
                      bal += currentUserManager.data.relations[userId].groupBalances[group.id]["USD"];
                  }
              }
          }
      }

      function getGradient() {
        if (bal.toFixed(2) > 0) {
          return "green";
        }
        if (bal.toFixed(2) < 0) {
          return "red";
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
            <StyledText text={group.name} marginTop={0.01} onClick={focusGroup} marginBottom={10}/>
            <AvatarList users={group.users} size={40} marginRight={-10}/>
          </View>
          <View display="flex" flexDirection="column" alignItems="flex-end" justifyContent="space-between">
            <GroupLabel group={group} marginBottom={20} onClick={focusGroup}/>
            <EmojiBar group={group} />
          </View>
        </GradientCard>
      )
    })
  }

  function renderInvitations() {
    const declineSwipeIndicator = <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{width: "100%", paddingLeft: 20 }}>
      <Image source={dark ? require("../assets/images/TrashDark.png") : require("../assets/images/TrashLight.png")} style={{width: 20, height: 20}}/>
      <StyledText text="Decline Invitation" marginLeft={10} />
    </View>

    return inviteGroups.map((group, index) => {

      function ignoreInvite() {
        currentUserManager.removeGroupInvitation(group.id);
        const groupManager = DBManager.getGroupManager(group.id);
        groupManager.removeInvitedUser(currentUserManager.documentId);
        currentUserManager.push();
        groupManager.push();
      }
      
      async function acceptInvite() {
        const incomingGroupInviteSenderManager = DBManager.getUserManager(group.createdBy);
        const invitedGroupManager = DBManager.getGroupManager(group.id);
        const groupName = group.name;
        const incomingGroupInviteSenderNotif = NotificationFactory.createUserJoinedGroup(currentUserManager.data.personalData.displayName, groupName, group.id);
        incomingGroupInviteSenderManager.addNotification(incomingGroupInviteSenderNotif);
        incomingGroupInviteSenderManager.push();
        invitedGroupManager.removeInvitedUser(currentUserManager.documentId);
        invitedGroupManager.addUser(currentUserManager.documentId);
        await invitedGroupManager.push();
        currentUserManager.removeGroupInvitation(group.id);
        currentUserManager.addGroup(group.id);
        currentUserManager.push();
        const incomingGroupInviteUpdate = {...groupsData};
        incomingGroupInviteUpdate[group.id] = invitedGroupManager.data;
        setGroupsData(incomingGroupInviteUpdate);
      }

      return (
        <GradientCard key={index} gradient="white" leftSwipeComponent={declineSwipeIndicator} onLeftSwipe={ignoreInvite} onClick={acceptInvite}>
        <View style={{flex: 6}}>
          <StyledText text={group.name} fontSize={14} onClick={acceptInvite}/>
        </View>
        <View style={{flex: 4}}>
          <AvatarList users={group.users} size={40} marginRight={-10} />
        </View>
        </GradientCard>
      )
    });
  }

  return (
    <PageWrapper>

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

      <CenteredTitle text="Groups" />
      <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%", marginBottom: 20}}>
        <SearchBarShort setSearch={(text) => setSearch(text)} />
        <AddButton onClick={() => setCreateModalOpen(true)}/>
      </View>
      <ScrollView style={{width: "100%"}} keyboardShouldPersistTaps="handled">
        { currentUserManager && renderGroups() }
        { currentUserManager && currentUserManager.data.groupInvitations.length > 0 && <CenteredTitle text="Invitations" /> }
        { currentUserManager && renderInvitations() }
      </ScrollView>
    </PageWrapper>
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

  const [ relationHistories, setRelationHistories ] = useState([]);

  useEffect(() => {
    if (!currentUserManager) {
      return;
    }
    let newRelationHistories = [];
    let transactionsFound = [];
    for (const userId of Object.keys(currentUserManager.data.relations)) {
      for (const history of currentUserManager.data.relations[userId].history) {
        if (history.group === focus.group || Object.keys(history.settleGroups).includes(focus.group)) {
          if (!transactionsFound.includes(history.transaction)) {
            newRelationHistories.push(history);
            transactionsFound.push(history.transaction);
          }
        }
      }
    }
    newRelationHistories.sort((a, b) => {
      return b.date - a.date;
    })
    setRelationHistories(newRelationHistories);
  }, [currentUserManager])

  useEffect(() => {
    if (groupsData[focus.group]) {
      setCurrentGroupData(groupsData[focus.group]);
    }
  }, [groupsData])

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

  function renderInviteHint() {
    return (
      <Pressable display="flex" android_ripple={{color: globalColors.greenAlpha}} flexDirection="column" alignItems="center" justifyContent="center" onPress={() => navigation.navigate("invite")}>
        <CenteredTitle text="Press" color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
        <Image source={dark ? require("../assets/images/PersonAddHintDark.png") : require("../assets/images/PersonAddHintLight.png")} style={{width: 40, height: 40}} />
        <CenteredTitle text="to invite your friends" color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
      </Pressable>
    )
  }

  function renderTransactionHint() {
    return (
      <Pressable display="flex" android_ripple={{color: globalColors.greenAlpha}} flexDirection="column" alignItems="center" justifyContent="center" onPress={handleNewTransactionClick}>
        <CenteredTitle text="Press" color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
        <Image source={dark ? require("../assets/images/NewTransactionHintDark.png") : require("../assets/images/PersonAddHintLight.png")} style={{width: 40, height: 40}} />
        <CenteredTitle text="to add a transaction" color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
      </Pressable>
    )
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

  function renderHistory() {
    return relationHistories.map((history, index) => {

      function goToTransaction() {
        const newFocus = {...focus};
        newFocus.transaction = history.transaction;
        setFocus(newFocus);
        navigation.navigate("transaction");
      }

      const bal = history.amount.toFixed(2);

      function getGradient() {
        if (bal > 0) {
          return "green";
        }
        if (bal < 0) {
          return "red";
        }
        return "white";
      }

      function historyInSearch() {
        return history.transactionTitle.toLocaleLowerCase().includes(search.toLocaleLowerCase().replace(" ", ""));
      }

      return ( historyInSearch() &&
        <View key={index} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          { !history.group && <Image source={dark ? require("../assets/images/HandshakeDark.png") : require("../assets/images/HandshakeLight.png")} style={{height: 20, width: 20, marginHorizontal: 10}} /> }
          <GradientCard gradient={getGradient()} onClick={goToTransaction} selected={!history.group}>
            <View pointerEvents="none" display="flex" flexDirection="column" alignItems="flex-start">
              <View pointerEvents="none" display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start">
                { history.group && <Image source={dark ? require("../assets/images/GroupsUnselected.png") : require("../assets/images/GroupsUnselectedLight.png")} style={{height: 20, width: 20}} /> }
                <StyledText text={history.transactionTitle} marginLeft={history.group ? 10 : 0} onClick={goToTransaction} />
              </View>
              <StyledText text={getDateString(history.date)} fontSize={14} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} onClick={goToTransaction} />
            </View>
            <View pointerEvents="none" display="flex" flexDirection="column" alignItems="flex-end" justifyContent="space-between" >
              <TransactionLabel current={true} transaction={transactionsData[history.transaction]} />
              <GroupRelationAvatars transaction={history.transaction} />
            </View>
          </GradientCard>
        </View>
      )
    })
  }

  const avatarSize = 100 - (currentGroupData ? currentGroupData.users.length * 5 : 0);
  const avatarMargin =  (avatarSize/6);

  return ( groupsData[focus.group] && currentGroupData && currentUserManager && 
    <ScrollPage>
      <CardWrapper display="flex" flexDirection="column" justifyContent="center" alignItems="center" marginBottom={10}>  
        <CenteredTitle text={currentGroupData.name} fontSize={24}/>
        <AvatarList users={currentGroupData ? currentGroupData.users : []} size={avatarSize} marginLeft={-1 * avatarMargin}/>
        <GroupLabel group={{id: focus.group}} fontSize={30}/>
        <EmojiBar group={{id: focus.group}} justifyContent="center" size="large" marginTop={20} marginBottom={20} />
      </CardWrapper>

      <TrayWrapper>
        <NewTransactionPill onClick={handleNewTransactionClick}/>
        <PersonAddPill onClick={() => navigation.navigate("invite")}/>
        <SettingsPill onClick={() => navigation.navigate("settings")}/>
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
        { renderHistory() }
        { (currentGroupData.users.length > 1) && (currentGroupData.transactions.length === 0) && renderTransactionHint() }
        { (currentGroupData.users.length === 1) && (currentGroupData.transactions.length === 0) && renderInviteHint() }
      </View>
    </ScrollPage>      
  )
}

function Settings({navigation}) {

  const { focus, setFocus } = useContext(FocusContext);
  const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);
  const { groupsData } = useContext(GroupsContext);
  const { usersData } = useContext(UsersContext);
  const [currentGroupData, setCurrentGroupData] = useState(null);
  const { dark } = useContext(DarkContext);

  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (groupsData[focus.group]) {
      setCurrentGroupData(groupsData[focus.group]);
      setFamilyMultipliers(groupsData[focus.group].familyMultipliers);
    }
  }, [groupsData]);

  function changeName() {
    function confirmChange() {
      const groupManager = DBManager.getGroupManager(focus.group);
      groupManager.setName(newName);
      groupManager.push();
    }

    if (newName.length < 1) {
      return;
    }
    Alert.alert("Rename Group?", `Are you sure you want to rename this group to "${newName}"?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => confirmChange(),
        style: 'destructive',
      },
    ],)
  }

  function toggleMute() {
    if (currentUserManager.data.mutedGroups.includes(focus.group)) {
      currentUserManager.removeMutedGroup(focus.group);
    } else {
      currentUserManager.addMutedGroup(focus.group);
    }
    currentUserManager.push();
  }

  function toggleFamilyMode() {
    const groupManager = DBManager.getGroupManager(focus.group);
    if (currentGroupData.familyMode) {
      groupManager.setFamilyMode(false);
    } else {
      groupManager.setFamilyMode(true);
    }
    groupManager.push();
  }

  const [familyMultipliers, setFamilyMultipliers] = useState({});

  function handleMultiplierChange(amt, uid) {
    const newMult = {...familyMultipliers};
    newMult[uid] = parseInt(amt);
    if (amt.length < 1) {
      delete newMult[uid];
    }
    setFamilyMultipliers(newMult);
  }

  function renderFamilyMultipliers() {
    return currentGroupData.users.map((userId, index) => {
      return (
        <GradientCard gradient="white" key={index} onClick={() => {}}>
          <View 
            display="flex"
            flexDirection="row"
            style={{
              alignItems: "center",
            }}
          >
            <AvatarIcon src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={40}/>
            <StyledText text={userId === currentUserManager.documentId ? currentUserManager.data.personalData.displayName : usersData[userId].personalData.displayName} marginLeft={10}/>
          </View>
          <Entry numeric={true} width={100} placeholderText={`x ${currentGroupData.familyMultipliers[userId] ? currentGroupData.familyMultipliers[userId] : "1"}`} height={40} onChange={(text) => handleMultiplierChange(text, userId)} value={familyMultipliers[userId]}/>
        </GradientCard>
        )
    })
  }

  function applyMultipilers() {
    const groupManager = DBManager.getGroupManager(focus.group);
    groupManager.setFamilyMultipliers(familyMultipliers);
    groupManager.push();
  }

  return ( groupsData[focus.group] && currentGroupData && currentUserManager && 
    <ScrollPage>
      <CenteredTitle text={currentGroupData.name} fontSize={24}/>
      <CardWrapper display="flex" flexDirection="column" justifyContent="center" alignItems="center" marginBottom={10} paddingTop={20} paddingBottom={20}>  
        {currentGroupData.createdBy === currentUserManager.documentId && <Entry value={newName} placeholderText={currentGroupData.name} onChange={(text) => setNewName(text)}/>}
        {currentGroupData.createdBy === currentUserManager.documentId && <StyledButton text="Change Name" marginTop={20} onClick={changeName}/>}
        <Pressable display="flex" flexDirection="row" alignItems="center" justifyContent="center" marginTop={30} onPress={toggleMute} style={{padding: 5}}>
          <StyledCheckbox checked={currentUserManager.data.mutedGroups.includes(focus.group)} onChange={toggleMute}/>
          <StyledText text="Mute Group" marginLeft={10}/>
        </Pressable>
        <Pressable display="flex" flexDirection="row" alignItems="center" justifyContent="center" marginTop={10} onPress={toggleFamilyMode} style={{padding: 5}}>
          <StyledCheckbox checked={currentGroupData.familyMode} onChange={toggleFamilyMode}/>
          <StyledText text="Family Mode" marginLeft={10}/>
        </Pressable>
        { currentGroupData.familyMode && renderFamilyMultipliers() }
        { currentGroupData.familyMode && <StyledButton text="Apply Multipliers" onClick={applyMultipilers}/>}
      </CardWrapper>
      <StyledButton text="Done" onClick={() => navigation.navigate("detail")} />
    </ScrollPage>      
  )
}

function InviteMembers({navigation}) {
  
  const [ search, setSearch ] = useState("");
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);
  const { dark } = useContext(DarkContext);

  const [friends, setFriends] = useState([]);

  const { focus, setFocus } = useContext(FocusContext);
  const [currentGroupData, setCurrentGroupData] = useState(null);

  useEffect(() => {
    if (groupsData[focus.group]) {
      setCurrentGroupData(groupsData[focus.group]);
    }
  }, [groupsData])

  useEffect(() => {
    if (!currentUserManager) {
      return;
    }
    let newFriends = [];
    for (const userId of Object.keys(usersData)) {
      if (currentUserManager.data.friends.includes(userId)) {
        newFriends.push(userId);
      }
    }
    setFriends(newFriends);
  }, [usersData]);

  function renderFriends() {
    if (!currentUserManager) {
      return;
    }
    return friends.map((friendId, index) => {

      function getGradient() {
        if (currentGroupData.users.includes(friendId)) {
          return "green";
        }
        return "white";
      }

      async function inviteUser() {
        if (currentGroupData.users.includes(friendId)) {
          return;
        }
        const friendManager = DBManager.getUserManager(friendId);
        const groupManager = DBManager.getGroupManager(focus.group);
        if (currentGroupData.invitedUsers.includes(friendId)) {
          await friendManager.fetchData();
          const newNotifs = friendManager.data.notifications.filter(n => (n.type !== notificationTypes.INCOMINGGROUPINVITE) || (n.target !== focus.group));
          friendManager.setNotifications(newNotifs);
          friendManager.removeGroupInvitation(focus.group);
          groupManager.removeInvitedUser(friendId);
          friendManager.push();
          groupManager.push();
          return;
        }
        friendManager.addGroupInvitation(focus.group);
        const notif = NotificationFactory.createIncomingGroupInvite(currentGroupData.name, focus.group, currentUserManager.documentId);
        friendManager.addNotification(notif);
        groupManager.addInvitedUser(friendId);
        friendManager.push();
        groupManager.push();
        return;
      }

      function getInviteText() {
        if (currentGroupData.users.includes(friendId)) {
          return "Joined";
        }
        if (currentGroupData.invitedUsers.includes(friendId)) {
          return "Pending...";
        }
        return "Invite";
      }

      function getColor() {
        if (currentGroupData.users.includes(friendId)) {
          return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
        }
        return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
      }

      return currentUserManager.data.friends.includes(friendId) && usersData[friendId] && (
        <GradientCard key={index} gradient={getGradient()} selected={currentGroupData.users.includes(friendId)} onClick={inviteUser}>
            <View 
            display="flex"
            pointerEvents="none"
            flexDirection="row"
            JustifyContent="start">
              <AvatarIcon id={friendId} size={40} marginRight={10}/>
              <StyledText text={usersData[friendId].personalData.displayName} onClick={inviteUser}/>
            </View>
            <StyledText color={getColor()} text={getInviteText()} onClick={inviteUser}/>
        </GradientCard>
      )
    })
  }

  return ( currentUserManager && currentGroupData && 
    <PageWrapper justifyContent="space-between">
      <CenteredTitle text={`Invite Friends: ${currentGroupData.name}`} />
      <SearchBarFull setSearch={setSearch} />
      <ListScroll>
        <CenteredTitle text="Friends" />
        { currentUserManager.data.friends.length === 0 && <CenteredTitle text="You don't have any friends." fontSize={14} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} /> }
        { renderFriends() }
      </ListScroll>
    </PageWrapper>
  )
}