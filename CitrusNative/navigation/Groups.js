import { useState, useEffect, useContext } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PageContext } from "../Context";
import { AddButton } from "../components/Button";
import { SearchBarShort } from "../components/Search";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";

export default function Groups({navigation}) {

  const { page, setPage } = useContext(PageContext);

  useEffect(() => {
    const setPageContext = navigation.addListener('focus', () => {
      setPage("groups");
    });
  }, [navigation])

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
