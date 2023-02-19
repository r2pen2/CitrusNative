import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, Text } from "react-native";
import { SearchBarFull } from "../components/Search";
import { AlignedText, CenteredTitle } from "../components/Text";
import { PageWrapper, ListScroll } from "../components/Wrapper";
import { StyledButton, StyledCheckbox } from "../components/Button";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { CurrentUserContext, UsersContext } from "../Context";

export default function NewTransaction({navigation}) {
  
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [firstPage, setFirstPage] = useState(true);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);


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
        <StyledButton disabled={selectedUsers.length == 0} text="Continue"/>
      </PageWrapper>
    )
  }

  function RenderAmountEntry() {
    return (
      <PageWrapper>
        <CenteredTitle text="Amounts" />
      </PageWrapper>
    )
  }

  return firstPage ? RenderAddPeople() : RenderAmountEntry();
}
