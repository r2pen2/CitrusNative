import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, Text } from "react-native";
import { SearchBarFull } from "../components/Search";
import { AlignedText, CenteredTitle } from "../components/Text";
import { PageWrapper, ListScroll } from "../components/Wrapper";
import { StyledButton, StyledCheckbox } from "../components/Button";
import { PageContext } from "../Context";
import { GradientCard } from "./Card";
import AvatarIcon from "../components/Avatar";

export default function NewTransaction({navigation}) {

  const { page, setPage } = useContext(PageContext);

  useEffect(() => {
    const setPageContext = navigation.addListener('focus', () => {
      setPage("newtransaction");
    });
  }, [navigation])
  
  const [search, setSearch] = useState("");
  const [friendsChecked, setFriendsChecked] = useState(false);
  
  function renderGroups() {
    return (
      <GradientCard gradient="white">
        <AlignedText alignment="start" text="Group Name" />
      </GradientCard>
    )
  }

  function renderFriends() {
    return (
      <GradientCard gradient="white" selected={friendsChecked} onClick={() => setFriendsChecked(!friendsChecked)}>
          <View 
          display="flex"
          flexDirection="row"
          JustifyContent="start">
            <AvatarIcon src="https://i.pinimg.com/736x/b7/9b/08/b79b0879ca5df87757e0fd4d0e8796fd.jpg" size={40} marginRight={10}/>
            <AlignedText alignment="start" text="Friend Name" />
          </View>
          <StyledCheckbox checked={friendsChecked} setFriendsChecked={setFriendsChecked}/>
      </GradientCard>
    )
  }

  return (
    <PageWrapper>
      <CenteredTitle text="New Transaction" />
      <SearchBarFull setSearch={setSearch} />
      <ListScroll>
        <CenteredTitle text="Groups" />
        { renderGroups() }
        { renderGroups() }
        <CenteredTitle text="People" />
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
      </ListScroll>
      <StyledButton onClick={() => alert("Pressed!")} text="Continue"/>
    </PageWrapper>
  )
}
