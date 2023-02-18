import { useState } from "react";
import { Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AddButton } from "../components/Button";
import { SearchBarShort } from "../components/Search";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";

export default function Transaction({}) {

  const [search, setSearch] = useState("");

  return (
    <Text text="Test" />
  )
}
