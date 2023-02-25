import { useState, useContext, useEffect } from "react";
import { View, Pressable } from "react-native";
import { getDateString } from "../api/strings";
import { lightTheme, darkTheme } from "../assets/styles";
import AvatarIcon from "../components/Avatar";
import { StyledButton } from "../components/Button";
import { GradientCard } from "../components/Card";
import { CenteredTitle, TransactionLabel, StyledText } from "../components/Text";
import { CardWrapper, ScrollPage } from "../components/Wrapper";
import { FocusContext, DarkContext, TransactionsContext, CurrentUserContext, UsersContext } from "../Context";

export default function TransactionDetail(props) {

  const { focus, setFocus } = useContext(FocusContext);
  const { transactionsData } = useContext(TransactionsContext);
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
      if (props.navigateToUser) {
        props.navigateToUser();
      } else {
        props.navigation.navigate("detail");
      }
    }

    return (
      <GradientCard gradient={getGradient()} onClick={goToUser}>
        <Pressable display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" onPress={goToUser}>        
          <AvatarIcon id={id} onClick={goToUser}/>
          <StyledText text={getDisplayName()} marginLeft={10} onClick={goToUser}/>
        </Pressable>
        <TransactionLabel transaction={transactionsData[focus.transaction]} perspective={id} onClick={goToUser} />
      </GradientCard>
    )
  }

  return ( currentTranscationData && currentUserManager && 
    <ScrollPage>
      <CardWrapper paddingBottom={20}>
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
      <View display="flex" flexDirection="row" alignItems="center" width="100%" justifyContent="space-around" marginBottom={20}>
        <StyledButton text="Edit" width="40%"/>
        <StyledButton text="Delete" width="40%" color="red"/>
      </View>

      <View width="100%">
        { renderSelfBalance() }
        { renderBalances() }
      </View>

    </ScrollPage>
  )
}
