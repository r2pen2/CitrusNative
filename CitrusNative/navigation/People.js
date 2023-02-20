import { useState, useEffect, useContext } from "react";
import { View } from "react-native";
import { SearchBarShort } from "../components/Search";
import { AddButton } from "../components/Button";
import { ScrollView } from "react-native-gesture-handler";
import { CenteredTitle, LegalLabel, StyledText } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { UsersContext, CurrentUserContext } from "../Context";
import { GradientCard } from "../components/Card";
import AvatarIcon from "../components/Avatar";
import { RelationLabel, EmojiBar } from "../components/Text";

export default function People({navigation}) {
  
  const { usersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);

  function renderRelations() {

    
    return currentUserManager && Object.keys(currentUserManager.data.relations).map((userId, index) => {
      
      function getGradient() {
        if (currentUserManager.data.relations[userId].balances["USD"] > 0) {
          return "green";
        }
        if (currentUserManager.data.relations[userId].balances["USD"] < 0) {
          return "red";
        }
        return "white";
      }
      
      return (
        usersData[userId] && <GradientCard key={index} gradient={getGradient()}>
          <View display="flex" flexDirection="row" alignItems="center">
            <AvatarIcon src={usersData[userId].personalData.pfpUrl} />
            <View display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
              <StyledText marginLeft={10} text={currentUserManager.data.relations[userId].displayName}/>
              <EmojiBar relation={currentUserManager.data.relations[userId]} />
            </View>
          </View>
          <RelationLabel relation={currentUserManager.data.relations[userId]} />
        </GradientCard>
      )
    })
  }

  const [search, setSearch] = useState("");
  return (
    <PageWrapper>
      <CenteredTitle text="People" />
      <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
        <SearchBarShort setSearch={setSearch} />
        <AddButton />
      </View>
      <ScrollView style={{marginTop: 20, width: "100%"}}>
        { renderRelations() }
      </ScrollView>
    </PageWrapper>      
  )
}
