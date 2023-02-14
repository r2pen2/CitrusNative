import { useState, useEffect, useContext } from "react";
import { View } from "react-native";
import { SearchBarShort } from "../components/Search";
import { AddButton } from "../components/Button";
import { ScrollView } from "react-native-gesture-handler";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { PageContext } from "../App";

export default function People({navigation}) {

  const { page, setPage } = useContext(PageContext);

  useEffect(() => {
    const setPageContext = navigation.addListener('focus', () => {
      setPage("people");
    });
  }, [navigation])

  const [search, setSearch] = useState("");

  return (
    <ScrollView>
      <PageWrapper>
          <CenteredTitle text="People" />
          <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
            <SearchBarShort setSearch={setSearch} />
            <AddButton />
          </View>
      </PageWrapper>      
    </ScrollView>
  )
}
