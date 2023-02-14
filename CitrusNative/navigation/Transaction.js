import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AddButton } from "../components/Button";
import { SearchBarShort } from "../components/Search";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";

export default function Transaction({}) {

  const [search, setSearch] = useState("");

  return (
    <ScrollView>
      <PageWrapper>
        <CenteredTitle text="Groups" />
        <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
          <SearchBarShort setSearch={setSearch} />
          <AddButton />
        </View>
      </PageWrapper>
    </ScrollView>
  )
}
