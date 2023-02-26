import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, BackHandler, Modal, Pressable } from "react-native";
import { SearchBarFull } from "../components/Search";
import { AlignedText, CenteredTitle, StyledText } from "../components/Text";
import { PageWrapper, ListScroll, CardWrapper, StyledModalContent } from "../components/Wrapper";
import { CurrencyLegalButton, CurrencyTypeButton, StyledButton, StyledCheckbox, DropDownButton } from "../components/Button";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { CurrentUserContext, GroupsContext, UsersContext, NewTransactionContext, DarkContext, FocusContext, TransactionsContext } from "../Context";
import { Entry } from "../components/Input";
import { legalCurrencies, emojiCurrencies } from "../api/enum";
import { ScrollView } from "react-native-gesture-handler";
import { DBManager, UserRelationHistory } from "../api/dbManager";
import { CurrencyManager } from "../api/currency";
import { darkTheme, globalColors, lightTheme } from "../assets/styles";
import { createStackNavigator } from "@react-navigation/stack";
import TransactionDetail from "./TransactionDetail";

export default function NewTransaction({navigation}) {
  
  const { newTransactionData } = useContext(NewTransactionContext);

  const NewTransactionStack = createStackNavigator();

  return <NewTransactionStack.Navigator initialRouteName={"add-people"} screenOptions={{headerShown: false}}>
    <NewTransactionStack.Screen name="add-people" component={AddPeople} />
    <NewTransactionStack.Screen name="amount-entry" component={AmountEntry} />
    <NewTransactionStack.Screen name="transaction" component={TransactionDetail} />
  </NewTransactionStack.Navigator>
}

function AddPeople({navigation}) {

  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  
  const [ search, setSearch ] = useState("");
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);
  const { dark } = useContext(DarkContext);
  
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);

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

  useEffect(() => {
    if (!currentUserManager) {
      return;
    }
    let newGroups = [];
    for (const groupId of Object.keys(groupsData)) {
      if (currentUserManager.data.groups.includes(groupId)) {
        newGroups.push(groupId);
      }
    }
    setGroups(newGroups);
  }, [groupsData, currentUserManager]);
    
  function renderGroups() {
    if (!currentUserManager) {
      return;
    }
    return groups.map((groupId, index) => {
      if (!groupsData[groupId]) {
        return;
      }

      function renderAvatars() {
        return groupsData[groupId].users.map((user, ix) => {
          return <AvatarIcon id={user} key={ix} size={40} marginRight={-10} />
        })
      }

      function handleClick() {
        if (selectedGroup) {
          if (selectedGroup === groupId) {
            setSelectedGroup(null);
            setSelectedUsers([]);
          }
        } else {
          setSelectedGroup(groupId);
          const newUsers = groupsData[groupId].users.filter(user => user !== currentUserManager.documentId);
          setSelectedUsers(newUsers);
        }
      }

      return currentUserManager && currentUserManager.data.groups.includes(groupId) && (
        <GradientCard key={index} gradient="white" disabled={selectedGroup && (selectedGroup !== groupId)} selected={selectedGroup === groupId} onClick={handleClick}>
          <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" >
            { renderAvatars() }
          </View>
          <AlignedText alignment="start" text={groupsData[groupId].name} />
        </GradientCard>
      )
    })
  }

  function toggleSelectedUser(userId) {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== userId));
    } else {
      const newSelectedUsers = [];
      for (const user of selectedUsers) {
        newSelectedUsers.push(user);
      }
      newSelectedUsers.push(userId);
      setSelectedUsers(newSelectedUsers);
    }

    // User changed— let's clear new transaction data
    setNewTransactionData({
      users: {},
      group: null,
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
      firstPage: true,
      paidByModalState: {
        evenPayers: [],
        manualValues: {},
        percent: false,
      },
      splitModalState: {
        evenSplitters: [],
        manualValues: {},
        percent: false,
      },  
    });
  }

  function renderFriends() {
    if (!currentUserManager) {
      return;
    }
    return friends.map((friendId, index) => {
      return currentUserManager.data.friends.includes(friendId) && usersData[friendId] && (
        <GradientCard key={index} gradient="white" disabled={selectedGroup} selected={selectedUsers.includes(friendId) && !selectedGroup} onClick={() => { if (!selectedGroup) { toggleSelectedUser(friendId)}}}>
            <View 
            display="flex"
            flexDirection="row"
            JustifyContent="start">
              <AvatarIcon id={friendId} size={40} marginRight={10}/>
              <AlignedText alignment="start" text={usersData[friendId].personalData.displayName} />
            </View>
            <StyledCheckbox checked={selectedUsers.includes(friendId)}/>
        </GradientCard>
      )
    })
  }

  function moveToAmountPage() {
    const newData = {...newTransactionData};
    newData.users = {};
    let splitterList = [];
    for (const uid of selectedUsers) {
      const newUser = {
        id: uid,
        paid: false,
        split: true,
        paidManual: null,
        splitManual: null,
      };
      newData.users[uid] = newUser;
      splitterList.push(uid);
    }
    const self = {
      id: currentUserManager.documentId,
      paid: true,
      split: true,
      paidManual: null,
      splitManual: null,
    };
    newData.users[currentUserManager.documentId] = self;
    newData.group = selectedGroup;
    newData.firstPage = false;
    let payerList = [];
    payerList.push(currentUserManager.documentId);
    splitterList.push(currentUserManager.documentId);
    newData.paidByModalState = {
      evenPayers: payerList,
      manualValues: {},
      percent: false,
    };
    newData.splitModalState = {
      evenSplitters: splitterList,
      manualValues: {},
      percent: false,
    };
    setNewTransactionData(newData);
    navigation.navigate("amount-entry");
  }

  return ( currentUserManager &&
    <PageWrapper justifyContent="space-between">
      <CenteredTitle text="New Transaction" />
      <SearchBarFull setSearch={setSearch} />
      <ListScroll>
        <CenteredTitle text="Groups" />
        { groups.length === 0 && <CenteredTitle text="You aren't in any groups." fontSize={14} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} /> }
        { renderGroups() }
        <CenteredTitle text="Friends" />
        { currentUserManager.data.friends.length === 0 && <CenteredTitle text="You don't have any friends." fontSize={14} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} /> }
        { renderFriends() }
      </ListScroll>
      <StyledButton disabled={selectedUsers.length === 0 && !selectedGroup} text="Continue" onClick={moveToAmountPage}/>
    </PageWrapper>
  )
}

function AmountEntry({navigation}) {

  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);
  const { focus, setFocus } = useContext(FocusContext);
  const { transactionsData, setTransactionsData } = useContext(TransactionsContext);

  const [paidByModalOpen, setPaidByModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);

  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  
  function getTitle() {
    if (newTransactionData.group) {
      return `Group: ${groupsData[newTransactionData.group].name}`;
    }
    if (Object.keys(newTransactionData.users).length > 2) {
      return "With Friends";
    }
    const otherUsers = Object.keys(newTransactionData.users).filter(uid => uid !== currentUserManager.documentId);
    if (otherUsers.length >= 1) {
      return `With ${usersData[otherUsers[0]].personalData.displayName}`;
    }
  }

  function renderAvatars() {
    return Object.keys(newTransactionData.users).map((userId, index) => {
      return <AvatarIcon key={index} src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={100} marginLeft={-20} marginRight={-20}/>
    });
  }
  
  function handleTitleChange(text) {
    const newData = {...newTransactionData};
    if (newTransactionData.isIOU) {
      newData.title = "Handoff: " + text;
    } else {
      newData.title = text;
    }
    setNewTransactionData(newData);
  }

  function handleTotalChange(text) {
    const newData = {...newTransactionData};
    const shortenedText = text.indexOf('.') > -1 ? text.substring(0, text.indexOf('.') + 3) : text;
    const newTotal = parseInt(shortenedText); 
    newData.total = newTotal;

    if (!newTransactionData.currencyLegal) {
      const canBeEven = newTotal % Object.keys(newTransactionData.users).length === 0;
      if (text.length > 0) {        
        newData.split = canBeEven ? "even" : "manual";
      }
    }
    setNewTransactionData(newData);
  }

  function getPaidByText() {

    let paidUsers = 0;
    for (const u of Object.values(newTransactionData.users)) {
      if (u.paid) {
        paidUsers++;
      }
    }

    if (paidUsers === 1) {
      return newTransactionData.users[currentUserManager.documentId].paid ? "You" : "Someone Else";
    }
    return `${paidUsers} People`;
  }

  function getSplitText() {

    if (newTransactionData.isIOU) {
      return "IOU";
    }

    let splitters = 0;
    for (const user of Object.values(newTransactionData.users)) {
      if (user.split) {
        splitters++;
      }
    }

    if (newTransactionData.split === "even") {
      return `Even${splitters !== Object.keys(newTransactionData.users).length ? ` (${splitters}/${Object.keys(newTransactionData.users).length})` : ""}`;
    }
    return `Manual${splitters !== Object.keys(newTransactionData.users).length ? ` (${splitters}/${Object.keys(newTransactionData.users).length})` : ""}`;
  }

  function setPaidBy(newValue) {
    const newData = {...newTransactionData};
    newData.paidBy = newValue;
    setNewTransactionData(newData);
  }
  function setSplitWith(newValue) {
    const newData = {...newTransactionData};
    newData.split = newValue;
    setNewTransactionData(newData);
  }

  function renderPaidByUsers() {

    function togglePaidEven(uid) {
      const newState = {...newTransactionData};
      let newList = [];
      if (newTransactionData.paidByModalState.evenPayers.includes(uid)) {
        newList = newTransactionData.paidByModalState.evenPayers.filter(u => u != uid);
      } else {
        for (const u of newTransactionData.paidByModalState.evenPayers) {
          newList.push(u);
        }
        newList.push(uid);
      }
      newState.paidByModalState.evenPayers = newList;
      setNewTransactionData(newState);
    }

    function handleManualAmountChange(text, uid) {
      const newState = {...newTransactionData};
      if (text.length > 0) {
        newState.paidByModalState.manualValues[uid] = parseInt(text);
      } else {
        delete newState.paidByModalState.manualValues[uid];
      }
      setNewTransactionData(newState);
    }

    function getPaidByManualPlaceholder() {
      if (newTransactionData.paidByModalState.percent) {
        return "0%";
      }
      return newTransactionData.currencyLegal ? "$0.00" : "x 0";
    }

    if (newTransactionData.paidBy === "even") {
      return Object.keys(newTransactionData.users).map((userId, index) => {
        return <GradientCard gradient="white" key={index} onClick={() => togglePaidEven(userId)} selected={newTransactionData.paidByModalState.evenPayers.includes(userId)}>
          <View 
            display="flex"
            flexDirection="row"
            style={{
              alignItems: "center"
            }}
          >
            <AvatarIcon src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={40}/>
            <StyledText text={userId === currentUserManager.documentId ? currentUserManager.data.personalData.displayName : usersData[userId].personalData.displayName} marginLeft={10} onClick={() => togglePaidEven(userId)}/>
          </View>
          <StyledCheckbox checked={newTransactionData.paidByModalState.evenPayers.includes(userId)} onChange={() => togglePaidEven(userId)} />
        </GradientCard>
      })
    } else {
      return Object.keys(newTransactionData.users).map((userId, index) => {
        return <GradientCard gradient="white" key={index} onClick={() => togglePaidEven(userId)}>
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
          <Entry numeric={true} width={100} placeholderText={getPaidByManualPlaceholder()} height={40} onChange={(text) => handleManualAmountChange(text, userId)} value={newTransactionData.paidByModalState.manualValues[userId] ? ("" + newTransactionData.paidByModalState.manualValues[userId]) : ""}/>
        </GradientCard>
      })
    }
  }
  function renderSplitUsers() {

    function toggleSplitEven(uid) {
      const newState = {...newTransactionData};
      let newList = [];
      if (newTransactionData.splitModalState.evenSplitters.includes(uid)) {
        newList = newTransactionData.splitModalState.evenSplitters.filter(u => u != uid);
      } else {
        for (const u of newTransactionData.splitModalState.evenSplitters) {
          newList.push(u);
        }
        newList.push(uid);
      }
      newState.splitModalState.evenSplitters = newList;
      setNewTransactionData(newState);
    }

    function handleManualAmountChange(text, uid) {
      const newState = {...newTransactionData};
      if (text.length > 0) {
        newState.splitModalState.manualValues[uid] = parseInt(text);
      } else {
        delete newState.splitModalState.manualValues[uid];
      }
      setNewTransactionData(newState);
    }

    function getSplitManualPlaceholder() {
      if (newTransactionData.splitModalState.percent) {
        return "0%";
      }
      return newTransactionData.currencyLegal ? "$0.00" : "x 0";
    }

    if (newTransactionData.split === "even") {
      return Object.keys(newTransactionData.users).map((userId, index) => {
        return <GradientCard gradient="white" key={index} onClick={() => toggleSplitEven(userId)} selected={newTransactionData.splitModalState.evenSplitters.includes(userId)}>
          <View 
            display="flex"
            flexDirection="row"
            style={{
              alignItems: "center"
            }}
          >
            <AvatarIcon src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={40}/>
            <StyledText text={userId === currentUserManager.documentId ? currentUserManager.data.personalData.displayName : usersData[userId].personalData.displayName} marginLeft={10} onClick={() => toggleSplitEven(userId)}/>
          </View>
          <StyledCheckbox checked={newTransactionData.splitModalState.evenSplitters.includes(userId)} onChange={() => toggleSplitEven(userId)} />
        </GradientCard>
      })
    } else {
      return Object.keys(newTransactionData.users).map((userId, index) => {
        return <GradientCard gradient="white" key={index} onClick={() => toggleSplitEven(userId)}>
          <View 
            display="flex"
            flexDirection="row"
            style={{
              alignItems: "center",
            }}
          >
            <AvatarIcon src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={40}/>
            <StyledText text={userId === currentUserManager.documentId ? currentUserManager.data.personalData.displayName : usersData[userId].personalData.displayName} marginLeft={10} onClick={() => toggleSplitEven(userId)}/>
          </View>
          <Entry numeric={true} width={100} placeholderText={getSplitManualPlaceholder()} height={40} onChange={(text) => handleManualAmountChange(text, userId)} value={newTransactionData.splitModalState.manualValues[userId] ? ("" + newTransactionData.splitModalState.manualValues[userId]) : ""}/>
        </GradientCard>
      })
    }
  }

  function checkIOU() {
    let numPayers = 0;
    let numSplitters = 0;
    let payerId = "";
    let splitterId = "";
    for (const u of  Object.values(newTransactionData.users)) {
      if (u.paid) {
        numPayers++;
        payerId = u.id;
      }
      if (u.split) {
        numSplitters++;
        splitterId = u.id;
      }
    }

    const onlyTwoUsers = Object.keys(newTransactionData.users).length == 2;
    const onlyOnePayer = numPayers === 1;
    const onlyOneSplitter = numSplitters === 1;
    return onlyTwoUsers && onlyOnePayer && onlyOneSplitter && (payerId !== splitterId);
  }
  function confirmPaidByModal() {
    const newData = {...newTransactionData};
    if (newTransactionData.paidBy === "even") {
      for (const userId of Object.keys(newTransactionData.users)) {
        newData.users[userId].paid = newTransactionData.paidByModalState.evenPayers.includes(userId);
      }
    } else {
      for (const userId of Object.keys(newTransactionData.users)) {
        newData.users[userId].paidManual = Object.keys(newTransactionData.paidByModalState.manualValues).includes(userId) ? newTransactionData.paidByModalState.manualValues[userId] : 0;
        newData.users[userId].paid = Object.keys(newTransactionData.paidByModalState.manualValues).includes(userId);
      }
    }
    newData.paidByPercent = newTransactionData.paidByModalState.percent;
    newData.isIOU = checkIOU();
    // Set new data
    setNewTransactionData(newData);
    // Close the modal
    setPaidByModalOpen(false);
  }
  function confirmSplitModal() {
    const newData = {...newTransactionData};

    if (newTransactionData.split === "even") {
      for (const userId of Object.keys(newTransactionData.users)) {
        newData.users[userId].split = newTransactionData.splitModalState.evenSplitters.includes(userId);
      }
    } else {
      for (const userId of Object.keys(newTransactionData.users)) {
        newData.users[userId].splitManual = Object.keys(newTransactionData.splitModalState.manualValues).includes(userId) ? newTransactionData.splitModalState.manualValues[userId] : 0;
        newData.users[userId].split = Object.keys(newTransactionData.splitModalState.manualValues).includes(userId);
      }
    }
    newData.splitPercent = newTransactionData.splitModalState.percent;
    newData.isIOU = checkIOU();
    // Set new data
    setNewTransactionData(newData);
    // Close the modal
    setSplitModalOpen(false);
  }

  function getPaidByModalConfirmEnable() {
    if (newTransactionData.paidBy === "even") {
      if (!newTransactionData.currencyLegal) {
        console.log(newTransactionData.paidByModalState.evenPayers.length)
        return newTransactionData.paidByModalState.evenPayers.length === 0 || (newTransactionData.total % newTransactionData.paidByModalState.evenPayers.length) !== 0;
      }
      return newTransactionData.paidByModalState.evenPayers.length === 0;
    }

    if (newTransactionData.paidByModalState.percent) {
      let manualTotal = 0;
      for (const manualValue of Object.values(newTransactionData.paidByModalState.manualValues)) {
        manualTotal += manualValue;
      }
      return manualTotal !== 100;
    }

    let manualTotal = 0;
    for (const manualValue of Object.values(newTransactionData.paidByModalState.manualValues)) {
      manualTotal += manualValue;
    }

    return manualTotal != newTransactionData.total;
  }
  function getSplitModalConfirmEnable() {
    if (newTransactionData.split === "even") {
      return newTransactionData.splitModalState.evenSplitters.length === 0;
    }

    if (newTransactionData.splitModalState.percent) {
      let manualTotal = 0;
      for (const manualValue of Object.values(newTransactionData.splitModalState.manualValues)) {
        manualTotal += manualValue;
      }
      return manualTotal !== 100;
    }

    let manualTotal = 0;
    for (const manualValue of Object.values(newTransactionData.splitModalState.manualValues)) {
      manualTotal += manualValue;
    }

    return manualTotal != newTransactionData.total;
  }

  function openPaidByModal() {
    const newState = {...newTransactionData};
    newState.paidByModalState.manualValues = {};
    for (const uid of Object.keys(newTransactionData.users)) {
      if (newTransactionData.users[uid].paidManual) {
        newState.paidByModalState.manualValues[uid] = newTransactionData.users[uid].paidManual;
      }
    }
    setNewTransactionData(newState);
    setPaidByModalOpen(true);
  }
  function openSplitModal() {
    const newState = {...newTransactionData};
    newState.splitModalState.manualValues = {};
    for (const uid of Object.keys(newTransactionData.users)) {
      if (newTransactionData.users[uid].splitManual) {
        newState.splitModalState.manualValues[uid] = newTransactionData.users[uid].splitManual;
      }
    }
    setNewTransactionData(newState);
    setSplitModalOpen(true);
  }

  function getPaidByConfirmText() {
    if (newTransactionData.paidBy === "even") {
      return "Confirm";
    }

    if (newTransactionData.paidByModalState.percent) {
      let manualTotal = 0;
      for (const manualValue of Object.values(newTransactionData.paidByModalState.manualValues)) {
        manualTotal += manualValue;
      }
      return `${manualTotal}%`;
    }

    let manualTotal = 0;
    for (const manualValue of Object.values(newTransactionData.paidByModalState.manualValues)) {
      manualTotal += manualValue;
    }
    return `${manualTotal} / ${newTransactionData.total}`;
  }
  function getSplitConfirmText() {
    if (newTransactionData.split === "even") {
      return "Confirm";
    }

    if (newTransactionData.splitModalState.percent) {
      let manualTotal = 0;
      for (const manualValue of Object.values(newTransactionData.splitModalState.manualValues)) {
        manualTotal += manualValue;
      }
      return `${manualTotal}%`;
    }

    let manualTotal = 0;
    for (const manualValue of Object.values(newTransactionData.splitModalState.manualValues)) {
      manualTotal += manualValue;
    }
    return `${manualTotal} / ${newTransactionData.total}`;
  }

  function handlePaidByPercentChange() {
    const newState = {...newTransactionData};
    newState.paidByModalState.percent = !newTransactionData.paidByModalState.percent;
    setNewTransactionData(newState);
  }
  function handleSplitPercentChange() {
    const newState = {...newTransactionData};
    newState.splitModalState.percent = !newTransactionData.splitModalState.percent;
    setNewTransactionData(newState);
  }

  function setIOU(val) {
    const newData = {...newTransactionData};
    newData.isIOU = val;
    setNewTransactionData(newData);
  }

  function checkTransactionValid() {
    const hasAmount = newTransactionData.total ? (newTransactionData.total > 0) : false;
    
    let hasPayer = false;
    let hasSplitter = false;
    for (const u of Object.values(newTransactionData.users)) {
      if (u.paid) {
        hasPayer = true;
      }
      if (u.split) {
        hasSplitter = true;
      }
    }
    let splitters = 0;
    for (const user of Object.keys(newTransactionData.users)) {
      if (newTransactionData.users[user].split) {
        splitters++;
      }
    }
    const amountValid = (newTransactionData.total % splitters === 0) || (newTransactionData.currencyLegal);
    
    return hasAmount && hasPayer && hasSplitter && amountValid;
  }

  async function makeTransaction(tData) {
    
    const transactionTitle = tData.title ? tData.title : getPlaceholderName();
    const transactionManager = DBManager.getTransactionManager();
    transactionManager.setAmount(tData.total);
    transactionManager.setCurrencyLegal(tData.currencyLegal);
    transactionManager.setCurrencyType(tData.currencyLegal ? tData.legalType : tData.emojiType);
    transactionManager.setCreatedBy(currentUserManager.documentId);
    transactionManager.setDate(new Date());
    transactionManager.setGroup(tData.group);
    transactionManager.setIsIOU(tData.isIOU);
    transactionManager.setTitle(transactionTitle);

    // Get everyone's debts
    let finalUsers = [];
    let volume = 0;
    let fronterId = null;
    let payerId = null;
    let splitters = 0;
    let payers = 0;
    for (const u of Object.values(tData.users)) {
      if (u.paid) {
        payers++;
        if (tData.isIOU && Object.keys(tData.users).length === 2) {          
          fronterId = u.id;
        }
      }
      if (u.split) {
        splitters++;
        if (tData.isIOU && Object.keys(tData.users).length === 2) { 
          payerId = u.id;
        }
      }
    }

    let multiplierTotal = 0;
    if (tData.group) {
      if (groupsData[tData.group]) {
        for (const mult of Object.values(groupsData[tData.group].familyMultipliers)) {
          multiplierTotal += mult;
        }
      }
    }
    
    for (const u of Object.values(tData.users)) {
        if (fronterId && payerId) { // This should only happen if this is an IOU
            if (u.id === fronterId) {
                u.splitManual = 0;
                u.paidManual = tData.total;
            } else {
                u.splitManual = tData.total;
                u.paidManual = 0;
            }
        } else {
            if (tData.paidBy === "even") {
                // Paid by was even: If this user is one of the payers, their paidByManualAmount will be 1/n the total price
                u.paidManual = u.paid ? (tData.total / payers) : 0;
            } else {
                // Might be percentage split
                if (tData.paidByPercent) {
                    u.paidManual = tData.total * (u.paidManual / 100);
                }
            }
            if (tData.split === "even") {
                // Do the same thing for split
                let splitAmt = 0;
                if (tData.group) {
                  if (groupsData[tData.group]) {
                    if (groupsData[tData.group].familyMode) {
                      splitAmt = (tData.total * (groupsData[tData.group].familyMultipliers[u.id] / multiplierTotal));
                    } else {
                      splitAmt = (tData.total / splitters);
                    }
                  } else {
                    splitAmt = (tData.total / splitters);
                  }
                } else {
                  splitAmt = (tData.total / splitters)
                }
                u.splitManual = u.split ? splitAmt : 0;
            } else {
                if (tData.splitPercent) {
                    u.splitManual = tData.total * (u.splitManual / 100);
                }
            }
        }
        u["delta"] = u.paidManual - u.splitManual; // Add delta field 
        finalUsers.push(u); // Push user to final array
        volume += Math.abs(u.delta);
    }
    volume = volume / 2;

    let settleGroups = {};
  
    if (tData.isIOU) {
        // Find out how much goes to each group
        const curr = tData.currencyLegal ? tData.legalType : tData.emojiType;
        const fromManager = DBManager.getUserManager(fronterId);
        const userRelation = await fromManager.getRelationWithUser(payerId);
        const totalDebt = userRelation.balances[curr] ? (userRelation.balances[curr] < 0 ? userRelation.balances[curr] : 0) : 0; 
        let amtLeft = tData.total < Math.abs(totalDebt) ? tData.total : Math.abs(totalDebt);
        for (const history of userRelation.getHistory()) {
          if (amtLeft > 0 && history.amount < 0) {
            const group = history.group;
            if (Math.abs(history.amount) > amtLeft) {
                // This will be the last history we look at
                if (group) {
                    const groupManager = DBManager.getGroupManager(group);
                    const bal = await groupManager.getUserBalance(fronterId);
                    const settleGroupAmt = Math.abs(bal[curr]) > amtLeft ? amtLeft : Math.abs(bal[curr]);
                    if (bal[curr] < 0) {
                      settleGroups[group] = settleGroups[group] ? settleGroups[group] + settleGroupAmt : settleGroupAmt; 
                      amtLeft = 0;
                    }
                }
            } else {
                if (group) {
                    const groupManager = DBManager.getGroupManager(group);
                    const bal = await groupManager.getUserBalance(fronterId);
                    const settleGroupAmt = Math.abs(bal[curr]) > Math.abs(history.amount) ? Math.abs(history.amount) : Math.abs(bal[curr]);
                    settleGroups[group] = settleGroups[group] ? settleGroups[group] + settleGroupAmt : settleGroupAmt;
                    amtLeft += history.amount < 0 ? history.amount : 0;
                }
            }
          }
        }   
      }

      if (tData.isIOU) {
          // Add settle Groups
          for (const k of Object.keys(settleGroups)) {
              transactionManager.updateSettleGroup(k, settleGroups[k]);
          }
      }

      for (const u of finalUsers) {
          transactionManager.updateBalance(u.id, u.delta);
      }
      
      await transactionManager.push();

      // Save transaction locally
      const newD = {...transactionsData};
      newD[transactionManager.documentId] = transactionManager.data;
      setTransactionsData(newD);

      let userManagers = {};

      // Now we create all of the relations
      for (const user1 of finalUsers) {
          if (user1.delta < 0) {
              // Delta_i is less than zero, so we owe all users who have a delta > 0 their share
              for (const user2 of finalUsers) {
                  if (user2.delta > 0) {
                      // Found a user who paid more than their share
                      // Create a relationHistory for user 1
                      const h1 = new UserRelationHistory();
                      h1.setAmount(user1.delta * (user2.delta / volume));
                      h1.setCurrencyLegal(tData.currencyLegal);
                      h1.setCurrencyType(tData.currencyLegal ? tData.legalType : tData.emojiType);
                      h1.setGroup(tData.group);
                      h1.setTransaction(transactionManager.documentId);
                      h1.setTransactionTitle(transactionTitle);
                      
                      // Create a relationHistory for user2
                      const h2 = new UserRelationHistory();
                      h2.setAmount((user1.delta * (user2.delta / volume)) * -1);
                      h2.setCurrencyLegal(tData.currencyLegal);
                      h2.setCurrencyType(tData.currencyLegal ? tData.legalType : tData.emojiType);
                      h2.setGroup(tData.group);
                      h2.setTransaction(transactionManager.documentId);
                      h2.setTransactionTitle(transactionTitle);

                      // Add this relation to both users
                      const user1Manager = userManagers[user1.id] ? userManagers[user1.id] : DBManager.getUserManager(user1.id, usersData[user1.id]);
                      const user2Manager = userManagers[user2.id] ? userManagers[user2.id] : DBManager.getUserManager(user2.id, usersData[user2.id]);
                      let user1Relation = await user1Manager.getRelationWithUser(user2.id);
                      let user2Relation = await user2Manager.getRelationWithUser(user1.id);
                      user1Relation.addHistory(h1);
                      user2Relation.addHistory(h2);
                      user1Manager.updateRelation(user2.id, user1Relation);
                      user2Manager.updateRelation(user1.id, user2Relation);
                      userManagers[user1.id] = user1Manager;
                      userManagers[user2.id] = user2Manager;
                  }
              } 
          }
      }

      
      // Push all userManagers
      for (const manager of Object.values(userManagers)) {
        // Add transaction first!
        manager.addTransaction(transactionManager.documentId);
        manager.push();
      }

      const currencyKey = tData.currencyLegal ? tData.legalType : tData.emojiType;

    if (tData.group) {
        // If there's a group, add data to group
        const groupManager = DBManager.getGroupManager(tData.group);
        groupManager.addTransaction(transactionManager.documentId);
        for (const user of Object.values(tData.users)) {
            const userBal = await groupManager.getUserBalance(user.id);
            userBal[currencyKey] = userBal[currencyKey] ? userBal[currencyKey] + user.delta : user.delta;
            groupManager.updateBalance(user.id, userBal);
        }
      groupManager.push();
    }

    if (tData.isIOU) {
        for (const k of Object.keys(settleGroups)) {
            const groupManager = DBManager.getGroupManager(k);
            const fromBal = await groupManager.getUserBalance(fronterId);
            fromBal[currencyKey] = fromBal[currencyKey] ? fromBal[currencyKey] + settleGroups[k] : settleGroups[k];
            const toBal = await groupManager.getUserBalance(payerId);
            toBal[currencyKey] = toBal[currencyKey] ? toBal[currencyKey] - settleGroups[k] : -1 * settleGroups[k];
            groupManager.updateBalance(payerId, fromBal);
            groupManager.updateBalance(fronterId, toBal);
            groupManager.addTransaction(transactionManager.documentId);
            groupManager.push();
        }
    }
    
    // Clear data
    setNewTransactionData({
      users: {},
      group: null,
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
      firstPage: true,
      paidByModalState: {
        evenPayers: [],
        manualValues: {},
        percent: false,
      },
      splitModalState: {
        evenSplitters: [],
        manualValues: {},
        percent: false,
      },  
    });
    const newFocus = {...focus};
    newFocus.transaction = transactionManager.documentId;
    setFocus(newFocus);
    navigation.navigate("add-people");
    navigation.navigate("transaction");
  }

  function getPlaceholderName() {
    if (!newTransactionData.total) {
      return newTransactionData.isIOU ? "New Handoff" : "New Transaction";
    }
    const currency = newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType;
    const currencyName = CurrencyManager.getCurrencyName(currency, true);
    const capitalizedCurrency = currencyName.substring(0, 1).toUpperCase() + currencyName.substring(1);
    return `${newTransactionData.isIOU ? "Handoff: " : ""}${newTransactionData.total} ${capitalizedCurrency}`;
  }

  function getSplitButtonRed() {
    let splitters = 0;
    for (const user of Object.keys(newTransactionData.users)) {
      if (newTransactionData.users[user].split) {
        splitters++;
      }
    }
    return (newTransactionData.total % splitters !== 0) && !newTransactionData.currencyLegal
  }

  return (
    <PageWrapper justifyContent="space-between">

      <Modal
      animationType="slide"
      transparent={true}
      visible={paidByModalOpen}
      onRequestClose={() => {
        setPaidByModalOpen(!paidByModalOpen);
      }}>
        <StyledModalContent>
          <CenteredTitle text="Paid By" fontSize={20} />
          <View 
          display="flex" 
          flexDirection="row"
          style={{
            width: '100%',
            justifyContent: "space-evenly",
          }}>
            <StyledButton text="Even" width={150} selected={newTransactionData.paidBy === "even"} onClick={() => setPaidBy("even")}/>
            <StyledButton text="Manual" width={150} selected={newTransactionData.paidBy === "manual"} onClick={() => setPaidBy("manual")}/>
          </View>
          { newTransactionData.paidBy === "manual" && <Pressable display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}} onPress={handlePaidByPercentChange} android_ripple={{color: globalColors.greenAlpha, radius: 20}}>
            <StyledCheckbox onChange={handlePaidByPercentChange} checked={newTransactionData.paidByModalState.percent}/>
            <StyledText text="Percent" marginLeft={10} onClick={handlePaidByPercentChange} />
          </Pressable> }
          <ScrollView style={{width: '100%', paddingHorizontal: 20, marginTop: 10}}>
            { renderPaidByUsers() }
          </ScrollView>
          <StyledButton text={getPaidByConfirmText()} marginBottom={10} disabled={getPaidByModalConfirmEnable()} onClick={confirmPaidByModal}/>
        </StyledModalContent>
      </Modal>

      <Modal
      animationType="slide"
      transparent={true}
      visible={splitModalOpen}
      onRequestClose={() => {
        setSplitModalOpen(!splitModalOpen);
      }}>
        <StyledModalContent>
          <CenteredTitle text="Split" fontSize={20} />
          <View 
          display="flex" 
          flexDirection="row"
          style={{
            width: '100%',
            justifyContent: "space-evenly",
          }}>
            <StyledButton text="Even" width={150} selected={newTransactionData.split === "even"} onClick={() => setSplitWith("even")}/>
            <StyledButton text="Manual" width={150} selected={newTransactionData.split === "manual"} onClick={() => setSplitWith("manual")}/>
          </View>
          { newTransactionData.split === "manual" && <Pressable display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10, padding: 5}} onPress={handleSplitPercentChange} android_ripple={{color: globalColors.greenAlpha, radius: 20}}>
            <StyledCheckbox onChange={handleSplitPercentChange} checked={newTransactionData.splitModalState.percent}/>
            <StyledText text="Percent" marginLeft={10} onClick={handleSplitPercentChange}/>
          </Pressable> }
          <ScrollView style={{width: '100%', paddingHorizontal: 20, marginTop: 10}}>
            { renderSplitUsers() }
          </ScrollView>
          <StyledButton text={getSplitConfirmText()} marginBottom={10} disabled={getSplitModalConfirmEnable()} onClick={confirmSplitModal}/>
        </StyledModalContent>
      </Modal>
      
      <CenteredTitle text={newTransactionData.title ? `"${newTransactionData.title}"` : "New Transaction"} marginBottom={0}/>
      <CenteredTitle text={getTitle()} marginTop={-10}/>
      <View display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{width: "100%"}} >
        { renderAvatars() }
      </View>
      <CardWrapper paddingTop={20} paddingBottom={20}>
        <Entry placeholderText={getPlaceholderName()} marginBottom={20} value={newTransactionData.title ? newTransactionData.title : ""} onChange={handleTitleChange} />
        <View display="flex" flexDirection="row">
          <CurrencyLegalButton />
          <Entry width="50%" marginLeft={20} marginBottom={20} marginRight={20} numeric={true} placeholderText={"Total"} value={newTransactionData.total ? "" + newTransactionData.total : ""} onChange={handleTotalChange} />
          <CurrencyTypeButton />
        </View>
        <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10, opacity: newTransactionData.isIOU ? .5 : 1}}>
          <StyledText text="Paid By:" />
          <DropDownButton text={getPaidByText()} onClick={openPaidByModal} disabled={!newTransactionData.total}/>
        </View>
        <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10, opacity: newTransactionData.isIOU ? .5 : 1}}>
          <StyledText text="Split:" />
          <DropDownButton text={getSplitText()} onClick={openSplitModal} disabled={!newTransactionData.total} red={getSplitButtonRed()}/>
        </View>
      </CardWrapper>
        { Object.keys(newTransactionData.users).length == 2 && <Pressable display="flex" flexDirection="row" alignItems="center" onPress={() => setIOU(!newTransactionData.isIOU)} style={{padding: 5, marginTop: -10}}>
          <StyledCheckbox checked={newTransactionData.isIOU} onChange={() => setIOU(!newTransactionData.isIOU)}/>
          <StyledText text="This Is A Handoff" marginLeft={10} onClick={() => setIOU(!newTransactionData.isIOU)}/>
        </Pressable> }
      <StyledButton text="Submit" disabled={!checkTransactionValid()} onClick={() => makeTransaction(newTransactionData)}/>
    </PageWrapper>
  )
}