import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { darkPage, newTranscationGradientStyle, newTransactionCardStyle, pageHeaderStyle} from "../assets/styles";
import { SearchBar } from "../components/SearchBar";

export default function NewTransaction({nagivation}) {
  
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
    <ScrollView>
      <View  style={darkPage}>
        <Text style={pageHeaderStyle}>
          New Transaction
        </Text>
        <SearchBar setSearch={setSearch} fullWidth={true} />
        <Text style={pageHeaderStyle}>
          Groups
        </Text>
        { renderGroups() }
        { renderGroups() }
        <Text style={pageHeaderStyle}>
          People
        </Text>
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
        { renderFriends() }
      </View>
    </ScrollView>
  )
}
