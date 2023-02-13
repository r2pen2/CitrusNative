import { useState } from "react";
import { View, Text } from "react-native";
import { darkPage, pageHeaderStyle } from "../assets/styles";
import { AddButton } from "../components/AddButton";
import { SearchBar } from "../components/SearchBar";

export default function Groups({nagivation}) {

  const [search, setSearch] = useState("");

  return (
    <View style={darkPage}>
      <Text style={pageHeaderStyle}>
        Groups
      </Text>
      <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
        <SearchBar setSearch={setSearch} />
        <AddButton />
      </View>
    </View>
  )
}
