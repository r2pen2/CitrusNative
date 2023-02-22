import { useContext } from "react";
import { CurrentUserContext, UsersContext } from "../Context";
import { Modal, ScrollView, View, Image } from "react-native"
import { CenteredTitle, NotificationAmountLabel, StyledText } from "./Text";
import { StyledModalContent } from "./Wrapper";
import { GradientCard } from "./Card";
import { globalColors } from "../assets/styles";
import { notificationTypes } from "../api/enum";
import { DBManager, UserRelation } from "../api/dbManager";
import { NotificationFactory } from "../api/notification";

export function NotificationModal({open, setOpen}) {

  const { currentUserManager } = useContext(CurrentUserContext);
  const { usersData, setUsersData } = useContext(UsersContext);
  
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
    
  function renderNotifications() {
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
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: imgSize, width: imgSize}} />;
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
                const senderManager = DBManager.getUserManager(notification.target);
                const senderNotif = NotificationFactory.createFriendRequestAccepted(currentUserManager.data.personalData.displayName, currentUserManager.documentId);
                currentUserManager.addFriend(notification.target);
                currentUserManager.removeIncomingFriendRequest(notification.target);
                currentUserManager.updateRelation(notification.target, new UserRelation());
                currentUserManager.removeNotification(notification);
                senderManager.addNotification(senderNotif);
                senderManager.addFriend(currentUserManager.documentId);
                senderManager.removeOutgoingFriendRequest(currentUserManager.documentId);
                senderManager.updateRelation(currentUserManager.documentId, new UserRelation());
                senderManager.push();
                currentUserManager.push();
                break;
              case notificationTypes.FRIENDREQUESTACCEPTED:
              case notificationTypes.INCOMINGGROUPINVITE:
              case notificationTypes.USERJOINEDGROUP:
              case notificationTypes.USERLEFTGROUP:
              case notificationTypes.NEWTRANSACTION:
              case notificationTypes.TRANSACTIONDELETED:
              case notificationTypes.USERSETTLED:
              default:
                break;
            }
          }

          return (
            <View key={index} display="flex" flexDirection="row" alignItems="center" style={{flex: 1}}>
              { !notification.seen && <UnreadDot /> }
              <GradientCard key={index} gradient={notification.color} onClick={handleClick}>
                <View style={{flex: 6}} >
                  <StyledText text={notification.message} onClick={handleClick} fontSize={14}/>
                </View>
                <View style={{flex: 4}} display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center">
                  { getRightContent() }
                </View>
              </GradientCard>
            </View>
          )
        })
      }
      
      return <CenteredTitle text="Nothing to see here!" />
    }
  }

    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={open}
        onRequestClose={() => {
          setOpen(!open);
        }}>
          <StyledModalContent>
            <CenteredTitle text="Notifications" fontSize={20} />
            <ScrollView style={{width: '100%', paddingHorizontal: 20, marginTop: 10}}>
              { renderNotifications() }
            </ScrollView>
          </StyledModalContent>
        </Modal>
    )
}