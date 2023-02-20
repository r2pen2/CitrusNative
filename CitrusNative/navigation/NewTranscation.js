import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, BackHandler, Modal } from "react-native";
import { SearchBarFull } from "../components/Search";
import { AlignedText, CenteredTitle, StyledText } from "../components/Text";
import { PageWrapper, ListScroll, CardWrapper, StyledModalContent } from "../components/Wrapper";
import { CurrencyLegalButton, CurrencyTypeButton, StyledButton, StyledCheckbox, DropDownButton } from "../components/Button";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { CurrentUserContext, GroupsContext, UsersContext, NewTransactionContext } from "../Context";
import { Entry } from "../components/Input";
import { legalCurrencies, emojiCurrencies } from "../api/enum";
import { ScrollView } from "react-native-gesture-handler";
import { DBManager } from "../api/db/dbManager";
import { CurrencyManager } from "../api/currency";
import { UserRelationHistory } from "../api/db/objectManagers/userManager";

export default function NewTransaction({navigation, onTransactionCreated}) {
  
  const [search, setSearch] = useState("");
  const [firstPage, setFirstPage] = useState(true);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);

  const [paidByModalOpen, setPaidByModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);

  const [paidByModalState, setPaidByModalState] = useState({});
  const [splitModalState, setSplitModalState] = useState({});


  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  
  function RenderAddPeople() {
    
    function renderGroups() {
      return (
        <GradientCard gradient="white">
          <AlignedText alignment="start" text="Group Name" />
        </GradientCard>
      )
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
      });
    }

    function renderFriends() {
      if (!currentUserManager) {
        return;
      }
      return currentUserManager.data.friends.map((friendId, index) => {
        return usersData[friendId] && (
          <GradientCard key={index} gradient="white" selected={selectedUsers.includes(friendId)} onClick={() => toggleSelectedUser(friendId)}>
              <View 
              display="flex"
              flexDirection="row"
              JustifyContent="start">
                <AvatarIcon src={usersData[friendId].personalData.pfpUrl} size={40} marginRight={10}/>
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
      setNewTransactionData(newData);
      let payerList = [];
      payerList.push(currentUserManager.documentId);
      setPaidByModalState({
          evenPayers: payerList,
          manualValues: {},
          percent: false,
      });
      splitterList.push(currentUserManager.documentId);
      setSplitModalState({
          evenSplitters: splitterList,
          manualValues: {},
          percent: false,
      });

      setFirstPage(false);
    }

    return (
      <PageWrapper justifyContent="space-between">
        <CenteredTitle text="New Transaction" />
        <SearchBarFull setSearch={setSearch} />
        <ListScroll>
          <CenteredTitle text="Groups" />
          { renderGroups() }
          <CenteredTitle text="Friends" />
          { renderFriends() }
        </ListScroll>
        <StyledButton disabled={selectedUsers.length === 0} text="Continue" onClick={moveToAmountPage}/>
      </PageWrapper>
    )
  }

  function RenderAmountEntry() {

    BackHandler.addEventListener('hardwareBackPress', () => {
      if (!firstPage) {
        setFirstPage(true);
        BackHandler.removeEventListener("hardwareBackPress");
      }
    });
    
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
      newData.title = text;
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
        const newState = {...paidByModalState};
        let newList = [];
        if (paidByModalState.evenPayers.includes(uid)) {
          newList = paidByModalState.evenPayers.filter(u => u != uid);
        } else {
          for (const u of paidByModalState.evenPayers) {
            newList.push(u);
          }
          newList.push(uid);
        }
        newState.evenPayers = newList;
        setPaidByModalState(newState);
      }

      function handleManualAmountChange(text, uid) {
        const newState = {...paidByModalState};
        if (text.length > 0) {
          newState.manualValues[uid] = parseInt(text);
        } else {
          delete newState.manualValues[uid];
        }
        setPaidByModalState(newState);
      }

      function getPaidByManualPlaceholder() {
        if (paidByModalState.percent) {
          return "0%";
        }
        return newTransactionData.currencyLegal ? "$0.00" : "x 0";
      }

      if (newTransactionData.paidBy === "even") {
        return Object.keys(newTransactionData.users).map((userId, index) => {
          return <GradientCard gradient="white" key={index} onClick={() => togglePaidEven(userId)} selected={paidByModalState.evenPayers.includes(userId)}>
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
            <StyledCheckbox checked={paidByModalState.evenPayers.includes(userId)} onChange={() => togglePaidEven(userId)} />
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
            <Entry numeric={true} width={100} placeholderText={getPaidByManualPlaceholder()} height={40} onChange={(text) => handleManualAmountChange(text, userId)} value={paidByModalState.manualValues[userId] ? ("" + paidByModalState.manualValues[userId]) : ""}/>
          </GradientCard>
        })
      }
    }
    function renderSplitUsers() {

      function toggleSplitEven(uid) {
        const newState = {...splitModalState};
        let newList = [];
        if (splitModalState.evenSplitters.includes(uid)) {
          newList = splitModalState.evenSplitters.filter(u => u != uid);
        } else {
          for (const u of splitModalState.evenSplitters) {
            newList.push(u);
          }
          newList.push(uid);
        }
        newState.evenSplitters = newList;
        setSplitModalState(newState);
      }

      function handleManualAmountChange(text, uid) {
        const newState = {...splitModalState};
        if (text.length > 0) {
          newState.manualValues[uid] = parseInt(text);
        } else {
          delete newState.manualValues[uid];
        }
        setSplitModalState(newState);
      }

      function getSplitManualPlaceholder() {
        if (splitModalState.percent) {
          return "0%";
        }
        return newTransactionData.currencyLegal ? "$0.00" : "x 0";
      }

      if (newTransactionData.split === "even") {
        return Object.keys(newTransactionData.users).map((userId, index) => {
          return <GradientCard gradient="white" key={index} onClick={() => toggleSplitEven(userId)} selected={splitModalState.evenSplitters.includes(userId)}>
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
            <StyledCheckbox checked={splitModalState.evenSplitters.includes(userId)} onChange={() => toggleSplitEven(userId)} />
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
            <Entry numeric={true} width={100} placeholderText={getSplitManualPlaceholder()} height={40} onChange={(text) => handleManualAmountChange(text, userId)} value={splitModalState.manualValues[userId] ? ("" + splitModalState.manualValues[userId]) : ""}/>
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
          newData.users[userId].paid = paidByModalState.evenPayers.includes(userId);
        }
      } else {
        for (const userId of Object.keys(newTransactionData.users)) {
          newData.users[userId].paidManual = Object.keys(paidByModalState.manualValues).includes(userId) ? paidByModalState.manualValues[userId] : 0;
          newData.users[userId].paid = Object.keys(paidByModalState.manualValues).includes(userId);
        }
      }
      newData.paidByPercent = paidByModalState.percent;
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
          newData.users[userId].split = splitModalState.evenSplitters.includes(userId);
        }
      } else {
        for (const userId of Object.keys(newTransactionData.users)) {
          newData.users[userId].splitManual = Object.keys(splitModalState.manualValues).includes(userId) ? splitModalState.manualValues[userId] : 0;
          newData.users[userId].split = Object.keys(splitModalState.manualValues).includes(userId);
        }
      }
      newData.splitPercent = splitModalState.percent;
      newData.isIOU = checkIOU();
      // Set new data
      setNewTransactionData(newData);
      // Close the modal
      setSplitModalOpen(false);
    }

    function getPaidByModalConfirmEnable() {
      if (newTransactionData.paidBy === "even") {
        return paidByModalState.evenPayers.length === 0;
      }

      if (paidByModalState.percent) {
        let manualTotal = 0;
        for (const manualValue of Object.values(paidByModalState.manualValues)) {
          manualTotal += manualValue;
        }
        return manualTotal !== 100;
      }

      let manualTotal = 0;
      for (const manualValue of Object.values(paidByModalState.manualValues)) {
        manualTotal += manualValue;
      }

      return manualTotal != newTransactionData.total;
    }
    function getSplitModalConfirmEnable() {
      if (newTransactionData.split === "even") {
        return splitModalState.evenSplitters.length === 0;
      }

      if (splitModalState.percent) {
        let manualTotal = 0;
        for (const manualValue of Object.values(splitModalState.manualValues)) {
          manualTotal += manualValue;
        }
        return manualTotal !== 100;
      }

      let manualTotal = 0;
      for (const manualValue of Object.values(splitModalState.manualValues)) {
        manualTotal += manualValue;
      }

      return manualTotal != newTransactionData.total;
    }

    function openPaidByModal() {
      const newState = {...paidByModalState};
      newState.manualValues = {};
      for (const uid of Object.keys(newTransactionData.users)) {
        if (newTransactionData.users[uid].paidManual) {
          newState.manualValues[uid] = newTransactionData.users[uid].paidManual;
        }
      }
      setPaidByModalState(newState);
      setPaidByModalOpen(true);
    }
    function openSplitModal() {
      const newState = {...splitModalState};
      newState.manualValues = {};
      for (const uid of Object.keys(newTransactionData.users)) {
        if (newTransactionData.users[uid].splitManual) {
          newState.manualValues[uid] = newTransactionData.users[uid].splitManual;
        }
      }
      setSplitModalState(newState);
      setSplitModalOpen(true);
    }

    function getPaidByConfirmText() {
      if (newTransactionData.paidBy === "even") {
        return "Confirm";
      }

      if (paidByModalState.percent) {
        let manualTotal = 0;
        for (const manualValue of Object.values(paidByModalState.manualValues)) {
          manualTotal += manualValue;
        }
        return `${manualTotal}%`;
      }

      let manualTotal = 0;
      for (const manualValue of Object.values(paidByModalState.manualValues)) {
        manualTotal += manualValue;
      }
      return `${manualTotal} / ${newTransactionData.total}`;
    }
    function getSplitConfirmText() {
      if (newTransactionData.split === "even") {
        return "Confirm";
      }

      if (splitModalState.percent) {
        let manualTotal = 0;
        for (const manualValue of Object.values(splitModalState.manualValues)) {
          manualTotal += manualValue;
        }
        return `${manualTotal}%`;
      }

      let manualTotal = 0;
      for (const manualValue of Object.values(splitModalState.manualValues)) {
        manualTotal += manualValue;
      }
      return `${manualTotal} / ${newTransactionData.total}`;
    }

    function handlePaidByPercentChange() {
      const newState = {...paidByModalState};
      newState.percent = !paidByModalState.percent;
      setPaidByModalState(newState);
    }
    function handleSplitPercentChange() {
      const newState = {...splitModalState};
      newState.percent = !splitModalState.percent;
      setSplitModalState(newState);
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
      const amountValid = (newTransactionData.total % Object.keys(newTransactionData.users).length === 0) || (newTransactionData.currencyLegal);
      return hasAmount && hasPayer && hasSplitter && amountValid;
    }

    async function makeTransaction() {
      const transactionManager = DBManager.getTransactionManager();
      transactionManager.setAmount(newTransactionData.total);
      transactionManager.setCurrencyLegal(newTransactionData.currencyLegal);
      transactionManager.setCurrencyType(newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType);
      transactionManager.setCreatedBy(currentUserManager.documentId);
      transactionManager.setDate(new Date());
      transactionManager.setGroup(newTransactionData.group);
      transactionManager.setIsIOU(newTransactionData.isIOU);
      transactionManager.setTitle(newTransactionData.title ? newTransactionData.title : getPlaceholderName());

      // Get everyone's debts
      let finalUsers = [];
      let volume = 0;
      let fronterId = null;
      let payerId = null;
      let splitters = 0;
      let payers = 0;
      for (const u of Object.values(newTransactionData.users)) {
        if (u.paid) {
          payers++;
          if (newTransactionData.isIOU && Object.keys(newTransactionData.users).length === 2) {          
            fronterId = u.id;
          }
        }
        if (u.split) {
          splitters++;
          if (newTransactionData.isIOU && Object.keys(newTransactionData.users).length === 2) { 
            payerId = u.id;
          }
        }
      }

      for (const u of Object.values(newTransactionData.users)) {
          if (fronterId && payerId) { // This should only happen if this is an IOU
              if (u.id === fronterId) {
                  u.splitManual = 0;
                  u.paidManual = newTransactionData.total;
              } else {
                  u.splitManual = newTransactionData.total;
                  u.paidManual = 0;
              }
          } else {
              if (newTransactionData.paidBy === "even") {
                  // Paid by was even: If this user is one of the payers, their paidByManualAmount will be 1/n the total price
                  u.paidManual = u.paid ? (newTransactionData.total / payers) : 0;
              } else {
                  // Might be percentage split
                  if (newTransactionData.paidByPercent) {
                      u.paidManual = newTransactionData.total * (u.paidManual / 100);
                  }
              }
              if (newTransactionData.split === "even") {
                  // Do the same thing for split
                  u.splitManual = u.split ? (newTransactionData.total / splitters) : 0;
              } else {
                  if (newTransactionData.splitPercent) {
                      u.splitManual = newTransactionData.total * (u.splitManual / 100);
                  }
              }
          }
          u["delta"] = u.paidManual - u.splitManual; // Add delta field 
          finalUsers.push(u); // Push user to final array
          volume += Math.abs(u.delta);
      }
      volume = volume / 2;

      let settleGroups = {};
    
      if (newTransactionData.isIOU) {
          // Find out how much goes to each group
          const curr = newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType;
          const fromManager = DBManager.getUserManager(fronterId);
          const userRelation = await fromManager.getRelationWithUser(payerId);
          const totalDebt = userRelation.balances[curr] ? (userRelation.balances[curr] < 0 ? userRelation.balances[curr] : 0) : 0; 
          let amtLeft = newTransactionData.total < Math.abs(totalDebt) ? newTransactionData.total : Math.abs(totalDebt);
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

        if (newTransactionData.isIOU) {
            // Add settle Groups
            for (const k of Object.keys(settleGroups)) {
                transactionManager.updateSettleGroup(k, settleGroups[k]);
            }
        }

        for (const u of finalUsers) {
            transactionManager.updateBalance(u.id, u.delta);
        }
        
        await transactionManager.push();

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
                        h1.setCurrencyLegal(newTransactionData.currencyLegal);
                        h1.setCurrencyType(newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType);
                        h1.setGroup(newTransactionData.group);
                        h1.setTransaction(transactionManager.documentId);
                        h1.setTransactionTitle(newTransactionData.title);
                        
                        // Create a relationHistory for user2
                        const h2 = new UserRelationHistory();
                        h2.setAmount((user1.delta * (user2.delta / volume)) * -1);
                        h2.setCurrencyLegal(newTransactionData.currencyLegal);
                        h2.setCurrencyType(newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType);
                        h2.setGroup(newTransactionData.group);
                        h2.setTransaction(transactionManager.documentId);
                        h2.setTransactionTitle(newTransactionData.title);

                        // Add this relation to both users
                        const user1Manager = usersData[user1.id] ? DBManager.getUserManager(user1.id, usersData[user1.id]) : DBManager.getUserManager(user1.id);
                        const user2Manager = usersData[user2.id] ? DBManager.getUserManager(user2.id, usersData[user2.id]) : DBManager.getUserManager(user2.id);
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
          manager.push();
        }

        const currencyKey = newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType;

      if (newTransactionData.group) {
          // If there's a group, add data to group
          const groupManager = DBManager.getGroupManager(newTransactionData.group);
          groupManager.addTransaction(transactionManager.documentId);
          for (const user of Object.values(newTransactionData.users)) {
              const userBal = await groupManager.getUserBalance(user.id);
              userBal[currencyKey] = userBal[currencyKey] ? userBal[currencyKey] + user.delta : user.delta;
              groupManager.updateBalance(user.id, userBal);
          }
        groupManager.push();
      }

      if (newTransactionData.isIOU) {
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
      });
      setSelectedUsers([]);
      onTransactionCreated();

    }


    function getPlaceholderName() {
      if (!newTransactionData.total) {
        return "Transaction Title";
      }
      const currency = newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType;
      const currencyName = CurrencyManager.getCurrencyName(currency, true);
      const capitalizedCurrency = currencyName.substring(0, 1).toUpperCase() + currencyName.substring(1);
      return `${newTransactionData.total} ${capitalizedCurrency}`;
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
            { newTransactionData.paidBy === "manual" && <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}}>
              <StyledCheckbox onChange={handlePaidByPercentChange} checked={paidByModalState.percent}/>
              <StyledText text="Percent" marginLeft={10} onClick={handlePaidByPercentChange} />
            </View> }
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
            { newTransactionData.split === "manual" && <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}}>
              <StyledCheckbox onChange={handleSplitPercentChange} checked={splitModalState.percent}/>
              <StyledText text="Percent" marginLeft={10} onClick={handleSplitPercentChange}/>
            </View> }
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
        <CardWrapper>
          <Entry placeholderText={getPlaceholderName()} value={newTransactionData.title ? newTransactionData.title : ""} onChange={handleTitleChange} />
          <View display="flex" flexDirection="row">
            <CurrencyLegalButton />
            <Entry width="50%" numeric={true} placeholderText={"Total"} value={newTransactionData.total ? "" + newTransactionData.total : ""} onChange={handleTotalChange} />
            <CurrencyTypeButton />
          </View>
          <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10, opacity: newTransactionData.isIOU ? .5 : 1}}>
            <StyledText text="Paid By:" />
            <DropDownButton text={getPaidByText()} onClick={openPaidByModal} disabled={!newTransactionData.total}/>
          </View>
          <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10, opacity: newTransactionData.isIOU ? .5 : 1}}>
            <StyledText text="Split:" />
            <DropDownButton text={getSplitText()} onClick={openSplitModal} disabled={!newTransactionData.total} red={(newTransactionData.total % Object.keys(newTransactionData.users).length !== 0) && !newTransactionData.currencyLegal}/>
          </View>
        </CardWrapper>
          { Object.keys(newTransactionData.users).length == 2 && <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: -10}}>
            <StyledCheckbox checked={newTransactionData.isIOU} onChange={() => setIOU(!newTransactionData.isIOU)}/>
            <StyledText text="This Is An IOU" marginLeft={10} onClick={() => setIOU(!newTransactionData.isIOU)}/>
          </View> }
        <StyledButton text="Submit" disabled={!checkTransactionValid()} onClick={makeTransaction}/>
      </PageWrapper>
    )
  }

  return firstPage ? RenderAddPeople() : RenderAmountEntry();
}
