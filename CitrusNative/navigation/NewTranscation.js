import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, BackHandler } from "react-native";
import { SearchBarFull } from "../components/Search";
import { AlignedText, CenteredTitle, StyledText } from "../components/Text";
import { PageWrapper, ListScroll, CardWrapper } from "../components/Wrapper";
import { CurrencyLegalButton, CurrencyTypeButton, StyledButton, StyledCheckbox, DropDownButton } from "../components/Button";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { CurrentUserContext, GroupsContext, UsersContext, NewTransactionContext } from "../Context";
import { Entry } from "../components/Input";

export default function NewTransaction({navigation}) {
  
  const [search, setSearch] = useState("");
  const [firstPage, setFirstPage] = useState(true);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);
  
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
      if (Object.keys(newTransactionData.users).includes(userId)) {
        const newData = {...newTransactionData};
        delete newData.users[userId];
        setNewTransactionData(newData);
      } else {
        const newData = {...newTransactionData};
        const newUser = {
          id: userId,
          paid: (userId === currentUserManager.documentId),
        };
        newData.users[userId] = newUser;
        setNewTransactionData(newData);
      }
    }

    function renderFriends() {
      if (!currentUserManager) {
        return;
      }
      return currentUserManager.data.friends.map((friendId, index) => {
        return usersData[friendId] && (
          <GradientCard key={index} gradient="white" selected={Object.keys(newTransactionData.users).includes(friendId)} onClick={() => toggleSelectedUser(friendId)}>
              <View 
              display="flex"
              flexDirection="row"
              JustifyContent="start">
                <AvatarIcon src={usersData[friendId].personalData.pfpUrl} size={40} marginRight={10}/>
                <AlignedText alignment="start" text={usersData[friendId].personalData.displayName} />
              </View>
              <StyledCheckbox checked={Object.keys(newTransactionData.users).includes(friendId)}/>
          </GradientCard>
        )
      })
    }

    function moveToAmountPage() {
      toggleSelectedUser(currentUserManager.documentId);
      setFirstPage(false);
    }

    return (
      <PageWrapper>
        <CenteredTitle text="New Transaction" />
        <SearchBarFull setSearch={setSearch} />
        <ListScroll>
          <CenteredTitle text="Groups" />
          { renderGroups() }
          <CenteredTitle text="Friends" />
          { renderFriends() }
        </ListScroll>
        <StyledButton disabled={Object.keys(newTransactionData.users).length === 0} text="Continue" onClick={moveToAmountPage}/>
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
      return `With ${usersData[otherUsers[0]].personalData.displayName}`;
    }

    function renderAvatars() {
      return Object.keys(newTransactionData.users).map((userId, index) => {
        return <AvatarIcon key={index} src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={100} marginLeft={-20} marginRight={-20}/>
      });
    }
    
    function handleTitleChange() {

    }

    function handleTotalChange() {

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
      if (newTransactionData.paidBy === "even") {
        return "Even";
      }
    }

    return (
      <PageWrapper>
        <CenteredTitle text={"New Transaction"} marginBottom={0}/>
        <CenteredTitle text={getTitle()} marginTop={0}/>
        <View display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{width: "100%"}} >
          { renderAvatars() }
        </View>
        <CardWrapper>
          <Entry placeholderText={"Transaction Title"} value={newTransactionData.title ? newTransactionData.title : ""} onChange={handleTitleChange} />
          <View display="flex" flexDirection="row">
            <CurrencyLegalButton />
            <Entry width="50%" placeholderText={newTransactionData.currencyLegal ? "0.00" : "0"} value={newTransactionData.total ? newTransactionData.total : ""} onChange={handleTotalChange} />
            <CurrencyTypeButton />
          </View>
          <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}}>
            <StyledText text="Paid By:" />
            <DropDownButton text={getPaidByText()} />
          </View>
          <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}}>
            <StyledText text="Split:" />
            <DropDownButton text={getSplitText()} />
          </View>
        </CardWrapper>
      </PageWrapper>
    )
  }

  return firstPage ? RenderAddPeople() : RenderAmountEntry();
}
