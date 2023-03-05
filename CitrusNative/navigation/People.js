// Library Imports
import { useContext, useEffect, useState, } from "react";
import { Alert, Image, Keyboard, Pressable, View, } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { ScrollView, } from "react-native-gesture-handler";
import { createStackNavigator, } from "@react-navigation/stack";

// Component Imports
import { AvatarIcon, AvatarList, } from "../components/Avatar";
import { AddButton, GroupAddPill, HandoffPill, NewTransactionPill, SettingsPill, StyledButton, StyledCheckbox, } from "../components/Button";
import { GradientCard, } from "../components/Card";
import { SearchBarFull, SearchBarShort, } from "../components/Input";
import { CenteredTitle, EmojiBar, RelationLabel, RelationHistoryLabel, StyledText, } from "../components/Text";
import TransactionDetail from "../components/TransactionDetail";
import { CardWrapper, ListScroll, PageWrapper, ScrollPage, TrayWrapper, } from "../components/Wrapper";

// Context Imports
import { CurrentUserContext, DarkContext, FocusContext, GroupsContext, NewTransactionContext, UsersContext, } from "../Context";

// API Imports
import { DBManager, UserRelation, } from "../api/dbManager";
import { emojiCurrencies, legalCurrencies, notificationTypes, } from "../api/enum";
import { NotificationFactory, } from "../api/notification";
import { getDateString, } from "../api/strings";

// Style Imports
import { darkTheme, globalColors, lightTheme } from "../assets/styles"

/**
 * Component to render for people page
 * @param {ReactNavigation} navigation navigation object from main tabs 
 */
export default function People({navigation}) {
  
  /**
   * Stack navigator for all screens in the People tab
   */
  const PeopleStack = createStackNavigator();

  return (
    <PeopleStack.Navigator
      initialRouteName="relations"
      screenOptions={{
        headerShown: false
      }}
    >
      <PeopleStack.Screen name="default"      component={RelationsPage} />
      <PeopleStack.Screen name="relations"    component={RelationsPage} />
      <PeopleStack.Screen name="add"          component={AddPage} />
      <PeopleStack.Screen name="detail"       component={DetailPage} />
      <PeopleStack.Screen name="settings"     component={SettingsPage} />
      <PeopleStack.Screen name="transaction"  component={TransactionDetail} />
      <PeopleStack.Screen name="invite"       component={InvitePage} />
    </PeopleStack.Navigator>     
  )
}

/**
 * Component for displaying a list of all currentUser's relations
 * @param {ReactNavigation} navigation Navigation object from People page Stack Navigator 
 */
function RelationsPage({navigation}) {
  
  // Get context 
  const { usersData, setUsersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { focus, setFocus } = useContext(FocusContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  const { dark } = useContext(DarkContext);
  
  // Create states
  const [ requestUsers, setRequestUsers ] = useState([]);   // List of all users that have sent friend requests
  const [ search, setSearch ] = useState("");               // Current value of the search box
  const [ relations, setRelations ] = useState([]);         // List of all relations on the currentUser
  
  // Get user data when usersData or currentUserManager change
  useEffect(() => { getUserData(); }, [usersData, currentUserManager]);

  /**
   * Get data on all relation users and set the {@link relations} and {@link requestUsers} states
   * @async
   */
  async function getUserData() {
    // Guard clauses:
    if (!currentUserManager) { return; } // No current user

    // Get user's realations
    let sortedRelations = [];
    for (const userId of Object.keys(usersData)) {
      if (Object.keys(currentUserManager.data.relations).includes(userId)) {
        sortedRelations.push([userId, currentUserManager.data.relations[userId]]);
      }
    }
    // Sort relations by USD balance
    sortedRelations.sort(function(a, b) {
        return (b[1].balances["USD"] ? b[1].balances["USD"] : 0) - (a[1].balances["USD"] ? a[1].balances["USD"] : 0);
    });
    // Set state
    setRelations(sortedRelations);

    // Find all users who sent a friend request
    let newRequestUsers = [];
    for (const userId of currentUserManager.data.incomingFriendRequests) {
      if (usersData[userId]) {
        // Harvest data from usersData if we have them saved
        const userData = usersData[userId];
        userData["id"] = userId;
        newRequestUsers.push(userData);
      } else {
        // Fetch data from DB if we don't have them saved
        const userManager = DBManager.getUserManager(userId);
        const userData = await userManager.fetchData();
        userData["id"] = userId;
        newRequestUsers.push(userData);
      }
      // Set state
      setRequestUsers(newRequestUsers);
    }
  }

  /** Indicator to render under relation on left swipe */
  const newTransactionSwipeIndicator = (
    <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{width: "100%", paddingLeft: 20 }}>
      <Image source={dark ? require("../assets/images/AddButton.png") : require("../assets/images/AddButtonLight.png")} style={{width: 20, height: 20, borderWidth: 1, borderRadius: 15, borderColor: dark ? darkTheme.buttonBorder : lightTheme.buttonBorder}}/>
      <StyledText text="New Transaction" marginLeft={10} />
    </View>
  )

    /** Indicator to render under relation on right swipe */
  const handoffSwipeIndicator = (
    <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end" style={{width: "100%", paddingLeft: 20 }}>
      <StyledText text="New Handoff" marginRight={10} />
      <Image source={dark ? require("../assets/images/HandoffDark.png") : require("../assets/images/HandoffLight.png")} style={{width: 20, height: 20}}/>
    </View>
  )

  /** 
   * Render all relations for current user from {@link relations} state 
   * */
  function renderRelations() {
    // Guard clauses
    if (!currentUserManager) { return; } // There is no current user manager

    // Map relations to GradientCards
    return relations.map((key, index) => {
      // Guard caluses:
      if (!usersData[userId]) { return; } // We don't have data on this user
      if (!userInSearch()) { return; }    // User has been filtered out by search box

      const userId = key[0];
      
      /**
       * Get the right gradient for this relation (green if positive, red if negative, otherwise white)
       * @returns gradient key string
       */
      function getGradient() {
        if (currentUserManager.data.relations[userId].balances["USD"].toFixed(2) > 0) {
          return "green";
        }
        if (currentUserManager.data.relations[userId].balances["USD"].toFixed(2) < 0) {
          return "red";
        }
        return "white";
      }

      /**
       * Go to the user's detail page on click
       */
      function focusUser() {
        const newFocus = {...focus};
        newFocus.user = userId;
        setFocus(newFocus);
        navigation.navigate("detail");
      }

      /**
       * Get boolean whether or not current user is in the search
       * @returns user in search or not boolean
       */
      function userInSearch() {
        return usersData[userId].personalData.displayNameSearchable.includes(search.toLocaleLowerCase().replace(" ", ""));
      }

      /**
       * When new transaction button is clicked, create new transcation context and redirect to new transcation amount entry screen
       */
      function handleNewTransactionClick() {
        const newUsers = {};
        newUsers[userId] =  {
          id: userId,
          paid: false,
          split: true,
          paidManual: null,
          splitManual: null,
        };
        newUsers[currentUserManager.documentId] = {
          id: currentUserManager.documentId,
          paid: true,
          split: true,
          paidManual: null,
          splitManual: null,
        };
        setNewTransactionData({
          users: newUsers,
          group: null,
          total: null,
          legalType: legalCurrencies.USD,
          emojiType: emojiCurrencies.BEER,
          currencyMenuOpen: false,
          currencyLegal: true,
          split: "even",
          splitPercent: false,
          paidBy: "even",
          paidByPercent: false,
          title: null,
          isIOU: false,
          firstPage: false,
          paidByModalState: {
            evenPayers: [currentUserManager.documentId],
            manualValues: {},
            percent: false,
          },
          splitModalState: {
            evenSplitters: [currentUserManager.documentId, userId],
            manualValues: {},
            percent: false,
          }
        });
        navigation.navigate("New Transaction", {screen: "amount-entry"});
      }

      /**
       * Create a new handoff and navigate to new transaction amount entry screen
       */
      function handleHandoffClick() {
        const newUsers = {};
        newUsers[focus.user] =  {
          id: focus.user,
          paid: false,
          split: true,
          paidManual: null,
          splitManual: null,
        };
        newUsers[currentUserManager.documentId] = {
          id: currentUserManager.documentId,
          paid: true,
          split: true,
          paidManual: null,
          splitManual: null,
        };
        setNewTransactionData({
          users: newUsers,
          group: null,
          total: null,
          legalType: legalCurrencies.USD,
          emojiType: emojiCurrencies.BEER,
          currencyMenuOpen: false,
          currencyLegal: true,
          split: "even",
          splitPercent: false,
          paidBy: "even",
          paidByPercent: false,
          title: null,
          isIOU: true,
          firstPage: false,
          paidByModalState: {
            evenPayers: [currentUserManager.documentId],
            manualValues: {},
            percent: false,
          },
          splitModalState: {
            evenSplitters: [currentUserManager.documentId, focus.user],
            manualValues: {},
            percent: false,
          }
        });
        navigation.navigate("New Transaction", {screen: "amount-entry"});
      }

      /**
       * If the user is muted, return an indicator
       */
      function NotificationsOffIndicator() {
        // Guard clauses
        if (!currentUserManager.data.mutedUsers.includes(userId)) { return; } // This user is not muted

        return (
          <View style={{marginTop: -10, opacity: .2, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Image 
              source={dark ? require("../assets/images/NotificationOffIconDark.png") : require("../assets/images/NotificationOffIconLight.png")} 
              style={{
                width: 16, 
                height: 16,
              }}
            />
          </View>
        )
      }
      
      // Render the relation card
      return (
        <GradientCard key={index} gradient={getGradient()} onClick={focusUser} leftSwipeComponent={newTransactionSwipeIndicator} onLeftSwipe={handleNewTransactionClick} rightSwipeComponent={handoffSwipeIndicator} onRightSwipe={handleHandoffClick}>
          <View display="flex" flexDirection="row" alignItems="center">
            <AvatarIcon src={usersData[userId].personalData.pfpUrl} />
            <View display="flex" flexDirection="column" alignItems="flex-start" justifyContent="space-between" onClick={focusUser}>
              <View display="flex" flexDirection="row" alignItems="center">
                <StyledText marginLeft={10} marginRight={5} marginBottom={10} text={usersData[userId].personalData.displayName} onClick={focusUser}/>
                <NotificationsOffIndicator />
              </View>
              <EmojiBar transform={[{translateY: 2}]} relation={currentUserManager.data.relations[userId]} onClick={focusUser}/>
            </View>
          </View>
          <RelationLabel relation={currentUserManager.data.relations[userId]} onClick={focusUser}/>
        </GradientCard>
      )
    })
  }

  /**
   * Render gradient cards for each of the current user's incoming friend requests
   */
  function renderInvites() {
    // Guard clauses:
    if (!currentUserManager) { return; } // There's no current user

    /** A component to display under the invitation on a left swipe */
    const declineSwipeIndicator = (
      <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{width: "100%", paddingLeft: 20 }}>
        <Image source={dark ? require("../assets/images/TrashDark.png") : require("../assets/images/TrashLight.png")} style={{width: 20, height: 20}}/>
        <StyledText text="Decline Invitation" marginLeft={10} />
      </View>
    )
    
    // Map incoming invitations
    return requestUsers.map((user, index) => {
      
      /**
       * Declien a friend invite
       */
      function ignoreInvite() {
        currentUserManager.removeIncomingFriendRequest(user.id);  // Remove incoming
        const userManager = DBManager.getUserManager(user.id);
        userManager.removeOutgoingFriendRequest(currentUserManager.documentId); // Remove outgoing
        currentUserManager.push();  // Push
        userManager.push();         // Push
      }
      
      /**
       * Accept a friend invite
       * @async
       */
      async function acceptInvite() {
        // Get UserManagers
        const incomingFriendRequestSenderManager = DBManager.getUserManager(user.id);
        const incomingFriendRequestSenderNotif = NotificationFactory.createFriendRequestAccepted(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
        // Handle friend add
        currentUserManager.addFriend(user.id);
        currentUserManager.removeIncomingFriendRequest(user.id);
        if (!currentUserManager.data.relations[user.id]) {
          // Add a relation if needed
          currentUserManager.updateRelation(user.id, new UserRelation());
        }
        currentUserManager.push();  // Push
        // Update sender's manger to add friend and send them a notification
        await incomingFriendRequestSenderManager.fetchData();
        incomingFriendRequestSenderManager.addNotification(incomingFriendRequestSenderNotif);
        incomingFriendRequestSenderManager.addFriend(currentUserManager.documentId);
        incomingFriendRequestSenderManager.removeOutgoingFriendRequest(currentUserManager.documentId);
        if (!incomingFriendRequestSenderManager.data.relations[currentUserManager.documentId]) {
          // Add a relation if needed
          incomingFriendRequestSenderManager.updateRelation(currentUserManager.documentId, new UserRelation());
        }
        // Get new friend data and save it to userSData
        incomingFriendRequestSenderManager.push();
        const newUsersData = {...usersData};
        newUsersData[user.id] = incomingFriendRequestSenderManager.data;
        setUsersData(newUsersData);
      }

      // Render card
      return (
        <GradientCard key={index} gradient="white" leftSwipeComponent={declineSwipeIndicator} onLeftSwipe={ignoreInvite} onClick={acceptInvite}>
          <View style={{flex: 2}} display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
            <AvatarIcon src={user.personalData.pfpUrl} />
          </View>
          <View style={{flex: 8}} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
            <StyledText text={`${user.personalData.displayName} wants to be your friend`} fontSize={14} onClick={acceptInvite}/>
          </View>
        </GradientCard>
      )
    })
  }

  /**
   * Component to introduce incoming friend requests if there are any
   */
  function FriendRequestsTitle() {
    // Guard clauses:
    if (!currentUserManager) { return; }                                          // No current user
    if (currentUserManager.data.incomingFriendRequests.length === 0) { return; }  // No friend requests!
    
    // Render title
    return <CenteredTitle text="Friend Requests" />;
  }

  return (
    <PageWrapper>
      <CenteredTitle text="People" />
      <View display="flex" flexDirection="row" justifyContent="space-between" style={{width: "100%"}}>
        <SearchBarShort setSearch={(text) => setSearch(text)} />
        <AddButton onClick={() => navigation.navigate("add")}/>
      </View>
      <ScrollView style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
        { renderRelations() }
        <FriendRequestsTitle />
        { renderInvites() }
      </ScrollView>
    </PageWrapper>      
  );
}

function AddPage({navigation}) {

  const { dark } = useContext(DarkContext);
  const { currentUserManager } = useContext(CurrentUserContext);

  const [search, setSearch] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  function renderSearchResults() {
    return searchResults.map((result, index) => {
      
      function getGradient() {
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          return "green";
        }
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return "green";
        }
        return "white";
      }

      function getRightText() {
        if (currentUserManager.data.outgoingFriendRequests.includes(result.documentId)) {
          return "Pending..."
        }
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          return "Incoming Request";
        }
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return "Friends ✓";
        }
        let mutuals = 0;
        for (const friendId of currentUserManager.data.friends) {
          for (const otherPersonFriend of result.data.friends) {
            if (friendId === otherPersonFriend) {
              mutuals++;
            }
          }
        }
        return `${mutuals} mutual friend${mutuals != 1 ? "s" : ""}`;
      }

      function getRightColor() {
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return globalColors.green;
        }
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          return globalColors.green;
        }
        return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
      }

      async function handleUserClick() {
        Keyboard.dismiss();
        if (currentUserManager.data.friends.includes(result.documentId)) {
          return;
        }
        if (currentUserManager.data.outgoingFriendRequests.includes(result.documentId)) {
          return;
        }
        if (currentUserManager.data.incomingFriendRequests.includes(result.documentId)) {
          // This person already wants to be out friend!
          // Accept the request
          currentUserManager.removeIncomingFriendRequest(result.documentId);
          currentUserManager.addFriend(result.documentId);
          currentUserManager.updateRelation(result.documentId, new UserRelation());
          result.removeOutgoingFriendRequest(currentUserManager.documentId);
          result.addFriend(currentUserManager.documentId);
          const notif = NotificationFactory.createFriendRequestAccepted(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
          result.addNotification(notif);
          result.updateRelation(currentUserManager.documentId, new UserRelation());
          result.push();
          currentUserManager.push();
          return;
        }
        // Otherwise, we sent a friend request
        currentUserManager.addOutgoingFriendRequest(result.documentId);
        const notif = NotificationFactory.createFriendInvitation(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
        result.addNotification(notif);
        result.addIncomingFriendRequest(currentUserManager.documentId);
        currentUserManager.push();
        result.push();
      }

      return (
      <GradientCard key={index} gradient={getGradient()} onClick={handleUserClick}>
        <View display="flex" flexDirection="row" alignItems="center">
          <AvatarIcon src={result.data.personalData.pfpUrl} />
          <StyledText marginLeft={10} text={result.data.personalData.displayName} onClick={handleUserClick}/>
        </View>
        <StyledText text={getRightText()} color={getRightColor()} fontSize={14} onClick={handleUserClick}/>
      </GradientCard>
      )
    })
  }

  async function handleSearchChange(text) {
    if (text.length < 1) {
      setSearchResults([])
      return;
    }

    let newSearch = text;
    newSearch = newSearch.replace(" ", "");
    newSearch = newSearch.toLowerCase();
    setSearch(newSearch);
  }

  async function executeSearch() {
    const displayNameQuery = firestore().collection("users")
      .where('personalData.displayNameSearchable', '>=', search)
      .where('personalData.displayNameSearchable', '<=', search + '\uf8ff');
    
    const emailQuery = firestore().collection("users")
      .where("personalData.email", "==", search);
    const phoneQuery = firestore().collection("users")
      .where("personalData.phoneNumber", "==", search);
    
    let specificSearch = false;
    let newResults = [];

    const emailData = await emailQuery.get();
    if (emailData.docs.length > 0) {
      // We found a user by email!
      specificSearch = true;
      const userManager = DBManager.getUserManager(emailData.docs[0].id, emailData.docs[0].data());
      newResults.push(userManager);
    }

    if (!specificSearch) {
      const phoneData = await phoneQuery.get();
      if (phoneData.docs.length > 0) {
        // We found a user by email!
        specificSearch = true;
        const userManager = DBManager.getUserManager(phoneData.docs[0].id, phoneData.docs[0].data());
        newResults.push(userManager);
      }
    }

    if (!specificSearch) {
      const displayNameData = await displayNameQuery.get();
      for (const doc of displayNameData.docs) {
        if (doc.id !== currentUserManager.documentId) {
          const userManager = DBManager.getUserManager(doc.id, doc.data());
          newResults.push(userManager);
        }
      }
    }
    
    setSearchResults(newResults);
  }

  return (
    <PageWrapper>
      <CenteredTitle text="Add Friends" />
      <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{width: "100%"}}>
        <SearchBarFull setSearch={handleSearchChange} onEnter={executeSearch} placeholder="Name, Phone Number, or Email" />
      </View>
      <ScrollView style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
        { searchResults.length == 0 && <StyledText text="Search and hit enter for results." color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} /> }
        { currentUserManager && renderSearchResults() }
      </ScrollView>
    </PageWrapper>      
  )

}

function DetailPage({navigation}) {

  const { dark } = useContext(DarkContext);
  const { usersData, setUsersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { focus, setFocus } = useContext(FocusContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext)

  const [search, setSearch] = useState("");

  function renderHistory() {
    return currentUserManager.data.relations[focus.user].history.map((history, index) => {
      
      function getGradient() {
        if (history.amount.toFixed(2) > 0) {
          return "green";
        }
        if (history.amount.toFixed(2) < 0) {
          return "red";
        }
        return "white";
      } 

      function goToTranscation() {
        const newFocus = {...focus};
        newFocus.transaction = history.transaction;
        setFocus(newFocus);
        navigation.navigate("transaction");
      }

      return history.transactionTitle.includes(search.toLowerCase().replace(" ", "")) && 
      <GradientCard key={index} gradient={getGradient()} onClick={goToTranscation}>
          <View display="flex" flexDirection="column" alignItems="flex-start" justifyContent="space-between">
            <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start">
              <Image source={history.group ? (dark ? require("../assets/images/GroupsUnselected.png") : require("../assets/images/GroupsUnselectedLight.png")) : (dark ? require("../assets/images/PersonUnselected.png") : require("../assets/images/PersonUnselectedLight.png"))} style={{height: 20, width: 20}} />
              <StyledText text={history.transactionTitle} fontSize={14} onClick={goToTranscation} marginLeft={10}/>
            </View>
            <StyledText marginTop={0.001} fontSize={12} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} text={getDateString(history.date)} onClick={goToTranscation}/>
          </View>
        <RelationHistoryLabel history={history} onClick={goToTranscation}/>
      </GradientCard>
    })
  }

  function getFriendIcon() {
    if (currentUserManager.data.friends.includes(focus.user)) {
      return dark ? require("../assets/images/HeartDark.png") : require("../assets/images/HeartLight.png"); 
    }
    if (currentUserManager.data.incomingFriendRequests.includes(focus.user)) {
      return dark ? require("../assets/images/HeartPlusDark.png") : require("../assets/images/HeartPlusLight.png"); 
    }
    if (currentUserManager.data.outgoingFriendRequests.includes(focus.user)) {
      return dark ? require("../assets/images/PendingDark.png") : require("../assets/images/PendingLight.png"); 
    }
    return dark ? require("../assets/images/AddFriendDark.png") : require("../assets/images/AddFriendLight.png"); 
  }
  
  async function handleAddFriendClick() {
    if (currentUserManager.data.friends.includes(focus.user)) {
      return;
    }
    if (currentUserManager.data.outgoingFriendRequests.includes(focus.user)) {
      return;
    }
    if (currentUserManager.data.incomingFriendRequests.includes(focus.user)) {
      // This person already wants to be out friend!
      // Accept the request
      currentUserManager.removeIncomingFriendRequest(focus.user);
      currentUserManager.addFriend(focus.user);
      currentUserManager.updateRelation(focus.user, new UserRelation());
      const otherPersonManager = DBManager.getUserManager(focus.user, usersData[focus.user]);
      otherPersonManager.removeOutgoingFriendRequest(currentUserManager.documentId);
      otherPersonManager.addFriend(currentUserManager.documentId);
      otherPersonManager.updateRelation(currentUserManager.documentId, new UserRelation());
      const notif = NotificationFactory.createFriendRequestAccepted(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
      otherPersonManager.addNotification(notif);
      otherPersonManager.push();
      currentUserManager.push();
      return;
    }
    // Otherwise, we send a friend request
    const otherPersonManager = DBManager.getUserManager(focus.user, usersData[focus.user]);
    currentUserManager.addOutgoingFriendRequest(focus.user);
    otherPersonManager.addIncomingFriendRequest(currentUserManager.documentId);
    const notif = NotificationFactory.createFriendInvitation(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
    otherPersonManager.addNotification(notif);
    currentUserManager.push();
    otherPersonManager.push();
  }

  function getFriendButtonBorder() {
    if (currentUserManager.data.friends.includes(focus.user)) {
      return globalColors.green;
    }
    return dark ? darkTheme.buttonBorder : lightTheme.buttonBorder;
  }

  function handleNewTransactionClick() {
    const newUsers = {};
    newUsers[focus.user] =  {
      id: focus.user,
      paid: false,
      split: true,
      paidManual: null,
      splitManual: null,
    };
    newUsers[currentUserManager.documentId] = {
      id: currentUserManager.documentId,
      paid: true,
      split: true,
      paidManual: null,
      splitManual: null,
    };
    setNewTransactionData({
      users: newUsers,
      group: null,
      total: null,
      legalType: legalCurrencies.USD,
      emojiType: emojiCurrencies.BEER,
      currencyMenuOpen: false,
      currencyLegal: true,
      split: "even",
      splitPercent: false,
      paidBy: "even",
      paidByPercent: false,
      title: null,
      isIOU: false,
      firstPage: false,
      paidByModalState: {
        evenPayers: [currentUserManager.documentId],
        manualValues: {},
        percent: false,
      },
      splitModalState: {
        evenSplitters: [currentUserManager.documentId, focus.user],
        manualValues: {},
        percent: false,
      }
    });
    navigation.navigate("New Transaction", {screen: "amount-entry"});
  }

  function handleHandoffClick() {
    const newUsers = {};
    newUsers[focus.user] =  {
      id: focus.user,
      paid: false,
      split: true,
      paidManual: null,
      splitManual: null,
    };
    newUsers[currentUserManager.documentId] = {
      id: currentUserManager.documentId,
      paid: true,
      split: true,
      paidManual: null,
      splitManual: null,
    };
    setNewTransactionData({
      users: newUsers,
      group: null,
      total: null,
      legalType: legalCurrencies.USD,
      emojiType: emojiCurrencies.BEER,
      currencyMenuOpen: false,
      currencyLegal: true,
      split: "even",
      splitPercent: false,
      paidBy: "even",
      paidByPercent: false,
      title: null,
      isIOU: true,
      firstPage: false,
      paidByModalState: {
        evenPayers: [currentUserManager.documentId],
        manualValues: {},
        percent: false,
      },
      splitModalState: {
        evenSplitters: [currentUserManager.documentId, focus.user],
        manualValues: {},
        percent: false,
      }
    });
    navigation.navigate("New Transaction", {screen: "amount-entry"});
  }
  
  function renderTransactionHint() {
    return (
      <Pressable display="flex" android_ripple={{color: globalColors.greenAlpha}} flexDirection="column" alignItems="center" justifyContent="center" onPress={handleNewTransactionClick}>
        <CenteredTitle text="Press" color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
        <Image source={dark ? require("../assets/images/NewTransactionHintDark.png") : require("../assets/images/NewTransactionHintLight.png")} style={{width: 40, height: 40}} />
        <CenteredTitle text="to add a transaction" color={dark ? darkTheme.textSecondary : lightTheme.textSecondary}/>
      </Pressable>
    )
  }

  return ( usersData[focus.user] && currentUserManager && 
    <ScrollPage>
      <CardWrapper display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" height={150} marginBottom={10}>
        <View>
          <AvatarIcon id={focus.user} size={120}/>
          <Pressable style={{width: 30, height: 30, position: 'absolute', bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: (dark ? darkTheme.buttonFill : lightTheme.buttonFill), borderRadius: 20, borderColor: getFriendButtonBorder(), borderWidth: 1}} onPress={handleAddFriendClick}>
            <Image source={getFriendIcon()} style={{width: 20, height: 20}}/>
          </Pressable>
        </View>
        <View display="flex" flexDirection="column" justifyContent="space-around" alignItems="center">
          <CenteredTitle text={usersData[focus.user].personalData.displayName} fontSize={24}/>
          <RelationLabel relation={currentUserManager.data.relations[focus.user]} fontSize={30}/>
          <EmojiBar relation={currentUserManager.data.relations[focus.user]} justifyContent="center" size="large" marginTop={20} marginBottom={20}/>
        </View>
      </CardWrapper>

      <TrayWrapper>
        <NewTransactionPill onClick={handleNewTransactionClick}/>
        <HandoffPill onClick={handleHandoffClick}/>
        <SettingsPill onClick={() => navigation.navigate("settings")}/>
        <GroupAddPill onClick={() => navigation.navigate("invite")}/>
      </TrayWrapper>

      <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{width: "100%"}} size="large">
        <SearchBarFull setSearch={(text) => setSearch(text)} />
      </View>
      
      <View style={{marginTop: 20, width: "100%"}} keyboardShouldPersistTaps="handled">
        { currentUserManager.data.relations[focus.user].history.length === 0 && renderTransactionHint() }
        { renderHistory() }
      </View>
    </ScrollPage>      
  )

}

function SettingsPage({navigation}) {

  const { usersData, setUsersData } = useContext(UsersContext);
  const { currentUserManager } = useContext(CurrentUserContext);
  const { focus } = useContext(FocusContext);

  function toggleNotification() {
    if (currentUserManager.data.mutedUsers.includes(focus.user)) {
      currentUserManager.removeMutedUser(focus.user);
    } else {
      currentUserManager.addMutedUser(focus.user);
    }
    currentUserManager.push();
  }

  function removeFriend() {
    currentUserManager.removeFriend(focus.user);
    const friendManager = DBManager.getUserManager(focus.user);
    friendManager.removeFriend(currentUserManager.documentId);
    currentUserManager.push();
    friendManager.push();
  }

  return ( usersData[focus.user] && 
    <PageWrapper justifyContent="space-between">
      
      <View display="flex" flexDirection="column" alignItems="center" marginTop={20}>
        <AvatarIcon src={usersData[focus.user].personalData.pfpUrl} size={120}/>
        <CenteredTitle text={usersData[focus.user].personalData.displayName} fontSize={24}/>
        <CenteredTitle text="Settings:" fontSize={24} />
      </View>

      <View display="flex" flexDirection="column" alignItems="center">
      
        <Pressable display="flex" flexDirection="row" alignItems="center" onPress={toggleNotification} style={{padding: 5}}>
          <StyledCheckbox checked={currentUserManager.data.mutedUsers.includes(focus.user)} onChange={toggleNotification}/>
          <StyledText text="Mute notifications" marginLeft={10} onClick={toggleNotification}/>
        </Pressable>

        { currentUserManager.data.friends.includes(focus.user) && <StyledButton 
        marginTop={40} 
        color={"red"} 
        text="Remove Friend" 
        onClick={() => 
          Alert.alert(
            "Remove Friend?", 
            `Remove ${usersData[focus.user].personalData.displayName} as a Friend?`, 
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Remove Friend',
                onPress: () => removeFriend(),
                style: 'destructive',
              },
            ],)}
            /> }
      
      </View>
      
      <StyledButton text="Done" onClick={() => navigation.navigate("detail")} />
    </PageWrapper>      
  )

}

function InvitePage({navigation}) {
  
  const [ search, setSearch ] = useState("");
  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData } = useContext(UsersContext);
  const { groupsData } = useContext(GroupsContext);
  const { dark } = useContext(DarkContext);

  const [groups, setGroups] = useState([]);

  const { focus, setFocus } = useContext(FocusContext);
  const [currentGroupData, setCurrentGroupData] = useState(null);

  useEffect(() => {
    if (!currentUserManager) {
      return;
    }
    let newGroups = [];
    for (const groupId of Object.keys(groupsData)) {
      if (currentUserManager.data.groups.includes(groupId)) {
        newGroups.push(groupId);
      }
    }
    setGroups(newGroups);
  }, [groupsData]);

  function renderGroups() {
    if (!currentUserManager) {
      return;
    }
    return groups.map((groupId, index) => {

      function getGradient() {
        if (groupsData[groupId].users.includes(focus.user)) {
          return "green";
        }
        return "white";
      }

      async function inviteUser() {
        if (groupsData[groupId].users.includes(focus.user)) {
          return;
        }
        const friendManager = DBManager.getUserManager(focus.user);
        const groupManager = DBManager.getGroupManager(groupId);
        if (groupsData[groupId].invitedUsers.includes(focus.user)) {
          await friendManager.fetchData();
          const newNotifs = friendManager.data.notifications.filter(n => (n.type !== notificationTypes.INCOMINGGROUPINVITE) || (n.target !== groupId));
          friendManager.setNotifications(newNotifs);
          friendManager.removeGroupInvitation(groupId);
          groupManager.removeInvitedUser(focus.user);
          friendManager.push();
          groupManager.push();
          return;
        }
        friendManager.addGroupInvitation(groupId);
        const notif = NotificationFactory.createIncomingGroupInvite(groupsData[groupId].name, groupId, currentUserManager.documentId);
        friendManager.addNotification(notif);
        groupManager.addInvitedUser(focus.user);
        friendManager.push();
        groupManager.push();
        return;
      }

      function getInviteText() {
        if (groupsData[groupId].users.includes(focus.user)) {
          return "Joined";
        }
        if (groupsData[groupId].invitedUsers.includes(focus.user)) {
          return "Pending...";
        }
        return "Invite";
      }

      function getColor() {
        if (groupsData[groupId].users.includes(focus.user)) {
          return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
        }
        return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
      }

      return currentUserManager.data.groups.includes(groupId) && groupsData[groupId] && (
        <GradientCard key={index} gradient={getGradient()} selected={groupsData[groupId].users.includes(focus.user)} onClick={inviteUser}>
            <View 
            display="flex"
            pointerEvents="none"
            flexDirection="column"
            JustifyContent="center"
            alignItems="flex-start">
              <StyledText text={groupsData[groupId].name} onClick={inviteUser} marginBottom={10}/>
              <AvatarList users={groupsData[groupId].users} size={40} marginRight={-10} />
            </View>
            <StyledText color={getColor()} text={getInviteText()} onClick={inviteUser}/>
        </GradientCard>
      )
    })
  }

  return ( currentUserManager &&  
    <PageWrapper justifyContent="space-between">
      <CenteredTitle text={`Invite To Groups:`} />
      <SearchBarFull setSearch={setSearch} />
      <ListScroll>
        <CenteredTitle text="Groups" />
        { currentUserManager.data.groups.length === 0 && <CenteredTitle text="You aren't in any groups." fontSize={14} color={dark ? darkTheme.textSecondary : lightTheme.textSecondary} /> }
        { renderGroups() }
      </ListScroll>
    </PageWrapper>
  )
}