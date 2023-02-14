import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { darkPage, pageHeaderStyle} from "../assets/styles";
import { SearchBar } from "../components/SearchBar";

export default function NewTransaction({nagivation}) {
  
  const [search, setSearch] = useState("");
  
  function renderGroups() {
    return (
      <LinearGradient 
        start={[0, 0.5]}
        end={[1, 0.5]}
        colors={['#6442AC', '#888888']}
        style={{marginBottom: 10, width: "100%", borderRadius: 25, height: 80, padding: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        >
        <View style={{borderRadius: 24, width: '100%', padding: 16, height: "100%", display: 'flex', direction: "row", justifyContent: "center", backgroundColor: '#1E2028'}}>
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
        end={[1, 0.5]}
        colors={['#6442AC', '#888888']}
        style={{marginBottom: 10, width: "100%", borderRadius: 25, height: 80, padding: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        >
        <View style={{borderRadius: 24, width: '100%', padding: 16, height: "100%", display: 'flex', direction: "row", justifyContent: "center", backgroundColor: '#1E2028'}}>
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
