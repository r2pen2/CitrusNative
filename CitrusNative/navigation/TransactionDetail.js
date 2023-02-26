import { useState, useContext, useEffect } from "react";
import { View, Pressable, Alert } from "react-native";
import { DBManager, UserRelation } from "../api/dbManager";
import { getDateString } from "../api/strings";
import { lightTheme, darkTheme } from "../assets/styles";
import AvatarIcon from "../components/Avatar";
import { DeletePill, EditPill, StyledButton } from "../components/Button";
import { GradientCard } from "../components/Card";
import { CenteredTitle, TransactionLabel, StyledText } from "../components/Text";
import { CardWrapper, ScrollPage, TrayWrapper } from "../components/Wrapper";
import { FocusContext, DarkContext, TransactionsContext, CurrentUserContext, UsersContext } from "../Context";

export default function TransactionDetail({navigation, route}) {

  const { focus, setFocus } = useContext(FocusContext);
  const { transactionsData, setTransacionsData } = useContext(TransactionsContext);
  const { usersData } = useContext(UsersContext);
  const [currentTranscationData, setCurrentTransactionData] = useState(null);
  const { dark } = useContext(DarkContext);
  const { currentUserManager } = useContext(CurrentUserContext);

  useEffect(() => {
    if (transactionsData[focus.transaction]) {
      setCurrentTransactionData(transactionsData[focus.transaction]);
    }
  }, [transactionsData]);

  const avatarSize = 40;
  const avatarMargin = -5;

  function renderPaidBy() {
    if (!currentUserManager) {
      return;
    }
    if (!currentTranscationData) {
      return;
    }
    return Object.keys(currentTranscationData.balances).map((userId, index) => {
      if (currentTranscationData.balances[userId] > 0) {
        return;
      }
      return <AvatarIcon key={index} id={userId} size={avatarSize} marginLeft={avatarMargin} marginRight={avatarMargin}/>
    })
  }

  function renderInDebt() {
    if (!currentUserManager) {
      return;
    }
    if (!currentTranscationData) {
      return;
    }
    return Object.keys(currentTranscationData.balances).map((userId, index) => {
      if (currentTranscationData.balances[userId] < 0) {
        return;
      }
      return <AvatarIcon key={index} id={userId} size={avatarSize} marginLeft={avatarMargin} marginRight={avatarMargin}/>
    })
  }

  function renderBalances() {
    if (!currentUserManager) {
      return;
    }
    if (!currentTranscationData) {
      return;
    }
    return Object.keys(currentTranscationData.balances).map((userId, index) => {
      return userId !== currentUserManager.documentId && <BalanceCard key={index} id={userId} bal={currentTranscationData.balances[userId]} />;
    })
  }

  function renderSelfBalance() {
    if (!currentUserManager) {
      return;
    }
    if (!currentTranscationData) {
      return;
    }
    return Object.keys(currentTranscationData.balances).map((userId, index) => {
      
      return userId === currentUserManager.documentId && <BalanceCard key={index} id={userId} bal={currentTranscationData.balances[userId]} />;
    })
  }

  function BalanceCard({id, bal}) {
    if (!currentUserManager) {
      return;
    }
  
    function getGradient() {
      if (id === currentUserManager.documentId) {
        if(bal > 0) {
          return "green";
        }
        if (bal < 0) {
          return "red";
        }
      }
      return "white";
    }
    
    function getDisplayName() {
      if (id === currentUserManager.documentId) {
        return currentUserManager.data.personalData.displayName;
      }
      return usersData[id] ? usersData[id].personalData.displayName : "";
    }

    function goToUser() {
      if (id === currentUserManager.documentId) {
        return;
      }
      const newFocus = {...focus};
      newFocus.user = id;
      setFocus(newFocus);
      if (route.params.navigateToUser) {
        route.params.navigateToUser();
      } else {
        props.navigation.navigate("detail");
      }
    }

    return (
      <GradientCard gradient={getGradient()} onClick={id !== currentUserManager.documentId ? goToUser : null}>
        <Pressable display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" onPress={goToUser}>        
          <AvatarIcon id={id} onClick={goToUser}/>
          <StyledText text={getDisplayName()} marginLeft={10} onClick={goToUser}/>
        </Pressable>
        <TransactionLabel transaction={transactionsData[focus.transaction]} perspective={id} onClick={goToUser} />
      </GradientCard>
    )
  }

  async function deleteTransaction() {

    // For all balances, get the user manager
    for (const user of Object.keys(currentTranscationData.balances)) {
      // Loop through the user's relations for histories that have this transaction
      const transactionUserManager = DBManager.getUserManager(user);
      const relations = await transactionUserManager.getRelations();
      for (const relationKey of Object.entries(relations)) {
        const relation = new UserRelation(relationKey[1]);
        relation.removeHistory(focus.transaction);
        transactionUserManager.updateRelation(relationKey[0], relation);
      }
      const settleGroups = currentTranscationData.settleGroups;
      const curr = currentTranscationData.currency.type;
      for (const k of Object.keys(settleGroups)) {
        const groupManager = DBManager.getGroupManager(k);
        groupManager.removeTransaction(focus.transaction);
        // Update balances in group as well
        const groupBalances = await groupManager.getBalances();
        for (const k of Object.keys(groupBalances)) {
          const userBalance = groupBalaces[k];
          userBalance[curr] = userBalance[curr] - currentTranscationData.amount;
          groupManager.updateBalance(k, userBalance);
        }
        groupManager.push();
      }
      transactionUserManager.removeTransaction(focus.transaction);
      transactionUserManager.push();
    }

    const transactionManager = DBManager.getTransactionManager(focus.transaction);
    transactionManager.deleteDocument();

    // Handle transaction's group, too
    if (currentTranscationData.group) {
        const groupManager = DBManager.getGroupManager(currentTranscationData.group);
        groupManager.removeTransaction(focus.transaction);
        // Update balances in group as well
        const groupBalances = await groupManager.getBalances();
        const curr = currentTranscationData.currency.type;
        for (const k of Object.keys(groupBalances)) {
          const userBalance = groupBalances[k];
          userBalance[curr] = userBalance[curr] - currentTranscationData.balances[k];
          groupManager.updateBalance(k, userBalance);
        }
        groupManager.removeTransaction(focus.transaction);
        groupManager.push();
    }
    
    navigation.navigate("default");
  }

  return ( currentTranscationData && currentUserManager && 
    <ScrollPage>
      <CardWrapper paddingBottom={20} marginBottom={10}>
        <CenteredTitle text={currentTranscationData ? currentTranscationData.title : ""} fontSize={24} />
        <CenteredTitle text={currentTranscationData ? getDateString(currentTranscationData.date) : ""} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} marginTop={-5}/>
        <TransactionLabel transaction={currentTranscationData ? currentTranscationData : null} />
        <View display="flex" flexDirection="row" justifyContent="space-around">
          <View display="flex" flexDirection="column" justifyContent="space-between" style={{flex: 1}}>
            <CenteredTitle text="Paid By" />
            <View display="flex" flexDirection="row" alignItems="center" justifyContent="center">
              { renderPaidBy() }
            </View>
          </View>
          <View display="flex" flexDirection="column" justifyContent="space-between" style={{flex: 1}}>
            <CenteredTitle text="In Debt" />
            <View display="flex" flexDirection="row" alignItems="center" justifyContent="center">
              { renderInDebt() }
            </View>
          </View>
        </View>
      </CardWrapper>

      <TrayWrapper width="50%">
        <EditPill />
        <DeletePill onClick={() => 
          Alert.alert(
            "Delete Transaction?", 
            `Delete ${currentTranscationData.title}?`, 
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete Transaction',
                onPress: () => deleteTransaction(),
                style: 'destructive',
              },
            ],)}/>
      </TrayWrapper>

      <View width="100%">
        { renderSelfBalance() }
        { renderBalances() }
      </View>

    </ScrollPage>
  )
}
