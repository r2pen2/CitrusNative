import { useContext } from "react";
import { CurrentUserContext, UsersContext, DarkContext, GroupsContext } from "../Context";
import { Modal, ScrollView, View, Image, Pressable, Alert } from "react-native"
import { CenteredTitle, NotificationAmountLabel, StyledText } from "./Text";
import { StyledModalContent } from "./Wrapper";
import { GradientCard } from "./Card";
import { darkTheme, lightTheme } from "../assets/styles";
import { globalColors } from "../assets/styles";
import { notificationTypes } from "../api/enum";
import { DBManager, UserRelation } from "../api/dbManager";
import { NotificationFactory } from "../api/notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function NotificationModal({open, setOpen}) {

  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData, setUsersData } = useContext(UsersContext);
  const { groupsData, setGroupsData } = useContext(GroupsContext);
  const { dark } = useContext(DarkContext);
  
  function UnreadDot() {
    return <View
            style={{
              backgroundColor: globalColors.red,
              borderRadius: 100,
              width: 10,
              height: 10,
              elevation: 5,
              marginRight: 20,
            }}>
          </View>
  }

  function renderNotifications(showSeen) {
    if (currentUserManager) {

      if (currentUserManager.data.notifications.length > 0) {
        return currentUserManager.data.notifications.map((notification, index) => {

          const imgSize = 30;

          function getRightContent() {
            switch (notification.type) {
              case notificationTypes.INCOMINGFRIENDREQUEST:
                return <Image source={require("../assets/images/notifications/FriendRequest.png")} style={{height: imgSize, width: imgSize}} />;
              case notificationTypes.FRIENDREQUESTACCEPTED:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: imgSize, width: imgSize}} />;
              case notificationTypes.INCOMINGGROUPINVITE:
                return <Image source={require("../assets/images/notifications/GroupInvite.png")} style={{height: imgSize, width: imgSize}} />;
              case notificationTypes.USERJOINEDGROUP:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: imgSize, width: imgSize}} />;
              case notificationTypes.USERLEFTGROUP:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: imgSize, width: imgSize}} />;
              case notificationTypes.NEWTRANSACTION:
              case notificationTypes.TRANSACTIONDELETED:
              case notificationTypes.USERSETTLED:
                return <NotificationAmountLabel notification={notification} />;
              default:
                return;
            }
          }

          async function handleClick() {
            switch (notification.type) {
              case notificationTypes.INCOMINGFRIENDREQUEST:
                const incomingFriendRequestSenderManager = DBManager.getUserManager(notification.target);
                const incomingFriendRequestSenderNotif = NotificationFactory.createFriendRequestAccepted(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
                currentUserManager.addFriend(notification.target);
                currentUserManager.removeIncomingFriendRequest(notification.target);
                currentUserManager.updateRelation(notification.target, new UserRelation());
                currentUserManager.removeNotification(notification);
                incomingFriendRequestSenderManager.addNotification(incomingFriendRequestSenderNotif);
                incomingFriendRequestSenderManager.addFriend(currentUserManager.documentId);
                incomingFriendRequestSenderManager.removeOutgoingFriendRequest(currentUserManager.documentId);
                incomingFriendRequestSenderManager.updateRelation(currentUserManager.documentId, new UserRelation());
                incomingFriendRequestSenderManager.push();
                currentUserManager.push();
                break;
              case notificationTypes.FRIENDREQUESTACCEPTED:
              case notificationTypes.INCOMINGGROUPINVITE:
                const incomingGroupInviteSenderManager = DBManager.getUserManager(notification.value);
                const invitedGroupManager = DBManager.getGroupManager(notification.target);
                const groupName = await invitedGroupManager.getName();
                const incomingGroupInviteSenderNotif = NotificationFactory.createUserJoinedGroup(currentUserManager.data.personalData.displayName, groupName, notification.target);
                incomingGroupInviteSenderManager.addNotification(incomingGroupInviteSenderNotif);
                incomingGroupInviteSenderManager.push();
                invitedGroupManager.removeInvitedUser(currentUserManager.documentId);
                invitedGroupManager.addUser(currentUserManager.documentId);
                await invitedGroupManager.push();
                currentUserManager.removeGroupInvitation(notification.target);
                currentUserManager.addGroup(notification.target);
                currentUserManager.removeNotification(notification);
                currentUserManager.push();
                const incomingGroupInviteUpdate = {...groupsData};
                incomingGroupInviteUpdate[notification.target] = invitedGroupManager.data;
                setGroupsData(incomingGroupInviteUpdate);
              case notificationTypes.USERJOINEDGROUP:
              case notificationTypes.USERLEFTGROUP:
              case notificationTypes.NEWTRANSACTION:
              case notificationTypes.TRANSACTIONDELETED:
              case notificationTypes.USERSETTLED:
              default:
                break;
            }
          }

          function deleteNotification() {
            currentUserManager.removeNotification(notification);
            currentUserManager.push();
          }
          
          const deleteSwipeIndicator = <View display="flex" flexDirection="row" alignItems="center" justifyContent="flex-start" style={{width: "100%", paddingLeft: 20 }}>
            <Image source={dark ? require("../assets/images/TrashDark.png") : require("../assets/images/TrashLight.png")} style={{width: 20, height: 20}}/>
            <StyledText text="Delete Notification" marginLeft={10} />
          </View>

          return ( (showSeen || !notification.seen) &&
            <GestureHandlerRootView key={index} display="flex" flexDirection="row" alignItems="center" style={{flex: 1}}>
              { !notification.seen && <UnreadDot/> }
              <GradientCard key={index} gradient={notification.color} onClick={handleClick} leftSwipeComponent={deleteSwipeIndicator} onLeftSwipe={deleteNotification}>
                <View style={{flex: 6}} >
                  <StyledText text={notification.message} onClick={handleClick} fontSize={14}/>
                </View>
                <View style={{flex: 4}} display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center">
                  { getRightContent() }
                </View>
              </GradientCard>
            </GestureHandlerRootView>
          )
        })
      }
      
      return <CenteredTitle text="Nothing to see here!" />
    }
  }

  function setNotificationsRead() {
    let newNotifs = [];
    for (const notif of currentUserManager.data.notifications) {
      const newNotif = {...notif};
      newNotif.seen = true;
      newNotifs.push(newNotif);
    }
    currentUserManager.setNotifications(newNotifs);
    currentUserManager.push();
  }

  function clearNotifications() {

    function confirmClear() {
      if (currentUserManager.data.notifications.length > 0) {
        currentUserManager.setNotifications([]);
        currentUserManager.push();
      }
    }

    Alert.alert("Clear Notifications?", "Are you sure you want to clear all of your notifications?", 
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear Notifications',
        onPress: () => confirmClear(),
        style: 'destructive',
      },
    ],)
  }

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={open}
        onRequestClose={() => {
          setOpen(!open);
          setNotificationsRead();
        }}>
          <StyledModalContent>
            <CenteredTitle text="Notifications" fontSize={20} />
            <ScrollView style={{width: '100%', paddingHorizontal: 20, marginTop: 10}}>
              { renderNotifications(true) }
            </ScrollView>
            <Pressable style={{position: 'absolute', top: 30, left: 30, padding: 5}} onPress={clearNotifications}>
              <Image source={dark ? require("../assets/images/TrashDark.png") : require("../assets/images/TrashLight.png")} style={{width: 20, height: 20}}/>
            </Pressable>
          </StyledModalContent>

        </Modal>
    )
}