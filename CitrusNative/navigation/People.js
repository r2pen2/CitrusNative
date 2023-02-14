import { useState } from "react";
import { View, Text } from "react-native";
import { darkPage, pageHeaderStyle } from "../assets/styles";
import { SearchBar } from "../components/SearchBar";
import { AddButton } from "../components/AddButton";
import { ScrollView } from "react-native-gesture-handler";

export default function People({nagivation}) {

  const [search, setSearch] = useState("");

  return (
    <ScrollView>
      <View style={darkPage}>
          <Text style={pageHeaderStyle}>
            People
          </Text>
          <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
            <SearchBar setSearch={setSearch} />
            <AddButton />
          </View>
      </View>      
    </ScrollView>
  )
}
