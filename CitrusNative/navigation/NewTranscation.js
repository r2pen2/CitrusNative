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
import { ScrollView } from "react-native-gesture-handler";

export default function NewTransaction({navigation}) {
  
  const [search, setSearch] = useState("");
  const [firstPage, setFirstPage] = useState(true);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);

  const [paidByModalOpen, setPaidByModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);

  const [paidByModalState, setPaidByModalState] = useState({});


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
      for (const uid of selectedUsers) {
        const newUser = {
          id: uid,
          paid: false,
          paidManual: null,
          splitManual: null,
        };
        newData.users[uid] = newUser;
      }
      const self = {
        id: currentUserManager.documentId,
        paid: true,
      };
      newData.users[currentUserManager.documentId] = self;
      setNewTransactionData(newData);
      let payerList = [];
      payerList.push(currentUserManager.documentId);
      setPaidByModalState({
          evenPayers: payerList,
          manualValues: {},
        })

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
      return `With ${usersData[otherUsers[0]].personalData.displayName}`;
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

    function handleTotalChange() {
      const newData = {...newTransactionData};
      newData.total = parseInt(text);
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
      if (newTransactionData.split === "even") {
        return "Even";
      }
      return "Manual";
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

      return Object.keys(newTransactionData.users).map((userId, index) => {
        return <GradientCard gradient="white" key={index} onClick={() => togglePaidEven(userId)} >
          <View 
            display="flex"
            flexDirection="row"
            style={{
              alignItems: "center"
            }}
          >
            <AvatarIcon src={userId === currentUserManager.documentId ? currentUserManager.data.personalData.pfpUrl : usersData[userId].personalData.pfpUrl} size={40}/>
            <StyledText text={userId === currentUserManager.documentId ? currentUserManager.data.personalData.displayName : usersData[userId].personalData.displayName} marginLeft={10}/>
          </View>
          <StyledCheckbox checked={paidByModalState.evenPayers.includes(userId)}/>
        </GradientCard>
      })
    }

    function confirmPaidByModal() {
      if (newTransactionData.paidBy === "even") {
        const newData = {...newTransactionData};
        for (const userId of Object.keys(newTransactionData.users)) {
          newData.users[userId].paid = paidByModalState.evenPayers.includes(userId);
        }
        setPaidByModalOpen(false);
        setNewTransactionData(newData);
      }
    }

    return (
      <PageWrapper>

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
              <StyledCheckbox />
              <StyledText text="Percent" marginLeft={10} />
            </View> }
            <ScrollView style={{width: '100%', paddingHorizontal: 20, marginTop: 10}}>
              { renderPaidByUsers() }
            </ScrollView>
            <StyledButton text="Confirm" marginBottom={10} disabled={newTransactionData.paidBy === "even" ? paidByModalState.evenPayers.length === 0 : false} onClick={confirmPaidByModal}/>
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
              <StyledCheckbox />
              <StyledText text="Percent" marginLeft={10} />
            </View> }
          </StyledModalContent>
        </Modal>
        
        <CenteredTitle text={newTransactionData.title ? `"${newTransactionData.title}"` : "New Transaction"} marginBottom={0}/>
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
            <DropDownButton text={getPaidByText()} onClick={() => setPaidByModalOpen(true)} disabled={!newTransactionData.total}/>
          </View>
          <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}}>
            <StyledText text="Split:" />
            <DropDownButton text={getSplitText()} onClick={() => setSplitModalOpen(true)} disabled={!newTransactionData.total}/>
          </View>
          { Object.keys(newTransactionData.users).length == 2 && <View display="flex" flexDirection="row" alignItems="center" style={{marginTop: 10}}>
            <StyledCheckbox />
            <StyledText text="This Is An IOU" marginLeft={10} />
          </View> }
        </CardWrapper>
      </PageWrapper>
    )
  }

  return firstPage ? RenderAddPeople() : RenderAmountEntry();
}
