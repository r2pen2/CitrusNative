import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, BackHandler } from "react-native";
import { SearchBarFull } from "../components/Search";
import { AlignedText, CenteredTitle } from "../components/Text";
import { PageWrapper, ListScroll } from "../components/Wrapper";
import { StyledButton, StyledCheckbox } from "../components/Button";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { CurrentUserContext, GroupsContext, UsersContext } from "../Context";

export default function NewTransaction({navigation}) {
  
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [firstPage, setFirstPage] = useState(true);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);


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
        setSelectedUsers(selectedUsers.filter(u => u !== userId));
      } else {
        let newSelectedUsers = [];
        for (const u of selectedUsers) {
          newSelectedUsers.push(u);
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
        <StyledButton disabled={selectedUsers.length == 0} text="Continue" onClick={() => setFirstPage(false)}/>
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
      if (selectedGroup) {
        return `Group: ${groupsData[selectedGroup].name}`;
      }
      if (selectedUsers.length > 1) {
        return "With Friends";
      }
      return `With ${usersData[selectedUsers[0]].personalData.displayName}`;
    }

    function renderAvatars() {
      return selectedUsers.map((userId, index) => {
        return <AvatarIcon key={index} src={usersData[userId].personalData.pfpUrl} size={100} marginLeft={-20} marginRight={-20}/>
      });
    }
    
    return (
      <PageWrapper>
        <CenteredTitle text={"New Transaction"} marginBottom={0}/>
        <CenteredTitle text={getTitle()} marginTop={0}/>
        <View display="flex" flexDirection="row" alignItems="center" justifyContent="center" style={{width: "100%"}} >
          { renderAvatars() }
        </View>
      </PageWrapper>
    )
  }

  return firstPage ? RenderAddPeople() : RenderAmountEntry();
}
