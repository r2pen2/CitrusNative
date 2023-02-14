import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import { View, Text } from "react-native";
import { newTranscationGradientStyle, newTransactionCardStyle, pageHeaderStyle } from "../assets/styles";
import { SearchBarFull } from "../components/Search";
import { CenteredTitle } from "../components/Text";
import { PageWrapper, ListScroll } from "../components/Wrapper";
import { StyledButton } from "../components/Button";
import { PageContext } from "../App";

export default function NewTransaction({navigation}) {

  const { page, setPage } = useContext(PageContext);

  useEffect(() => {
    const setPageContext = navigation.addListener('focus', () => {
      setPage("newtransaction");
    });
  }, [navigation])
  
  const [search, setSearch] = useState("");
  
  function renderGroups() {
    return (
      <LinearGradient 
        start={[0, 0.5]}
        end={[0.3, 0.5]}
        colors={['#6543ac', '#888888']}
        style={newTranscationGradientStyle}
        >
        <View style={newTransactionCardStyle}>
          <Text style={pageHeaderStyle}>
            Group Name
          </Text>
        </View>
      </LinearGradient>
    )
  }

  function renderFriends() {
    return (
      <LinearGradient 
        start={[0, 0.5]}
        end={[0.3, 0.5]}
        colors={['#6543ac', '#888888']}
        style={newTranscationGradientStyle}
        >
        <View style={newTransactionCardStyle}>
          <Text style={pageHeaderStyle}>
            Friend Name
          </Text>
        </View>
      </LinearGradient>
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
