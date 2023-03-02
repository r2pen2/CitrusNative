import { useState, useContext, useEffect } from "react";
import { View, Pressable, Alert, Image } from "react-native";
import { DBManager, UserRelation } from "../api/dbManager";
import { getDateString } from "../api/strings";
import { lightTheme, darkTheme } from "../assets/styles";
import {AvatarIcon} from "../components/Avatar";
import { DeletePill, EditPill, GroupPill, StyledButton } from "../components/Button";
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
      if (currentTranscationData.balances[userId] < 0) {
        return;
      }

      function goToUser() {
        if (userId === currentUserManager.documentId) {
          return;
        }
        const newFocus = {...focus};
        focus.user = userId;
        setFocus(newFocus);
        navigation.navigate("People", {screen: "detail"});
      }

      return <AvatarIcon key={index} id={userId} size={avatarSize} marginLeft={avatarMargin} marginRight={avatarMargin} onClick={goToUser}/>
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
      if (currentTranscationData.balances[userId] > 0) {
        return;
      }

      function goToUser() {
        if (userId === currentUserManager.documentId) {
          return;
        }
        const newFocus = {...focus};
        focus.user = userId;
        setFocus(newFocus);
        navigation.navigate("People", {screen: "detail"});
      }

      return <AvatarIcon key={index} id={userId} size={avatarSize} marginLeft={avatarMargin} marginRight={avatarMargin} onClick={goToUser}/>
    })
  }

  function renderRelations() {
    let relations = [];
    let totalPaid = 0;
    for (const amt of Object.values(currentTranscationData.balances)) {
      if (amt > 0) {
        totalPaid += amt;
      }
    }
    for (const fromId of Object.keys(currentTranscationData.balances)) {
      const fromBal = currentTranscationData.balances[fromId];
      if (fromBal < 0) {
        // This user owes money
        for (const toId of Object.keys(currentTranscationData.balances)) {
          const toBal = currentTranscationData.balances[toId];
          if (toBal > 0) {
            // This user is owed money
            const multiplier = toBal / totalPaid;
            relations.push({
              to: toId,
              from: fromId,
              amount: fromBal * multiplier,
            });
          }
        }
      }
    }
    return relations.map((relation, index) => {
      return (relation.to !== currentUserManager.documentId && relation.from !== currentUserManager.documentId) && <RelationCard to={relation.to} from={relation.from} amt={relation.amount} key={index} />;
    })
  }

  function renderSelfRelations() {
    let relations = [];
    let totalPaid = 0;
    for (const amt of Object.values(currentTranscationData.balances)) {
      if (amt > 0) {
        totalPaid += amt;
      }
    }
    for (const fromId of Object.keys(currentTranscationData.balances)) {
      const fromBal = currentTranscationData.balances[fromId];
      if (fromBal < 0) {
        // This user owes money
        for (const toId of Object.keys(currentTranscationData.balances)) {
          const toBal = currentTranscationData.balances[toId];
          if (toBal > 0) {
            // This user is owed money
            const multiplier = toBal / totalPaid;
            relations.push({
              to: toId,
              from: fromId,
              amount: fromBal * multiplier,
            });
          }
        }
      }
    }
    return relations.map((relation, index) => {
      return (relation.to === currentUserManager.documentId || relation.from === currentUserManager.documentId) && <RelationCard to={relation.to} from={relation.from} amt={relation.amount} key={index + 2} />;
    })
  }

  function RelationCard({to, from, amt}) {
    
    function getGradient() {
      if (to === currentUserManager.documentId) {
        if(amt < 0) {
          return "green";
        }
        if (amt > 0) {
          return "red";
        }
      }
      if (from === currentUserManager.documentId) {
        if(amt < 0) {
          return "red";
        }
        if (amt > 0) {
          return "green";
        }
      }
      return "white";
    }

    return (
      <GradientCard gradient={getGradient()}>
        <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start">        
          <AvatarIcon id={from} marginRight={10}/>
          <Image source={dark ? require("../assets/images/ArrowDark.png") : require("../assets/images/ArrowLight.png")} style={{width: 40, height: 40}}/>
          <AvatarIcon id={to} marginLeft={10}/>
        </View>
        <TransactionLabel transaction={transactionsData[focus.transaction]} amtOverride={amt} invert={to === currentUserManager.documentId} current={to === currentUserManager.documentId || from === currentUserManager.documentId}/>
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
        groupManager.push();
    }
    
    navigation.goBack();
  }

  function navigateToGroup() {
    const newFocus = {...focus};
    newFocus.group = currentTranscationData.group;
    setFocus(newFocus);
    navigation.navigate("Groups", {screen: "detail"});
  }

  function thereAreOthers() {
    let relations = [];
    let totalPaid = 0;
    for (const amt of Object.values(currentTranscationData.balances)) {
      if (amt > 0) {
        totalPaid += amt;
      }
    }
    for (const fromId of Object.keys(currentTranscationData.balances)) {
      const fromBal = currentTranscationData.balances[fromId];
      if (fromBal < 0) {
        // This user owes money
        for (const toId of Object.keys(currentTranscationData.balances)) {
          const toBal = currentTranscationData.balances[toId];
          if (toBal > 0) {
            // This user is owed money
            const multiplier = toBal / totalPaid;
            relations.push({
              to: toId,
              from: fromId,
              amount: fromBal * multiplier,
            });
          }
        }
      }
    }
    for (const r of relations) {
      if (r.to !== currentUserManager.documentId && r.from !== currentUserManager.documentId) {
        return true;
      }
    }
    return false;
  }

  return ( currentTranscationData && currentUserManager && 
    <ScrollPage>
      <CardWrapper paddingBottom={20} marginBottom={10}>
        <CenteredTitle text={currentTranscationData ? `"${currentTranscationData.title}"` : ""} fontSize={24} />
        <View display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
          <TransactionLabel current={false} amtOverride={currentTranscationData ? currentTranscationData.amount : null} transaction={currentTranscationData ? currentTranscationData : null} marginTop={-5} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
          <CenteredTitle text={currentTranscationData ? ` on ${getDateString(currentTranscationData.date)}` : ""} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} marginTop={5}/>
        </View>
        <TransactionLabel current={true} transaction={currentTranscationData ? currentTranscationData : null} marginTop={10} fontSize={32}/>
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

      <TrayWrapper width="50%" center={!currentTranscationData.group}>
        { currentTranscationData.group && <GroupPill onClick={() => navigateToGroup()} /> }
        <DeletePill onClick={() => 
          Alert.alert(
            "Delete Transaction?", 
            `Delete "${currentTranscationData.title}"?`, 
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
        { renderSelfRelations() }
        { thereAreOthers() && <CenteredTitle text="Other Participants" color="secondary" /> }
        { renderRelations() }
      </View>

    </ScrollPage>
  )
}
