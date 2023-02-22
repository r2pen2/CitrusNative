import { useContext } from "react";
import { CurrentUserContext } from "../Context";
import { Modal, ScrollView, View, Image } from "react-native"
import { CenteredTitle, NotificationAmountLabel, StyledText } from "./Text";
import { StyledModalContent } from "./Wrapper";
import { GradientCard } from "./Card";
import { globalColors } from "../assets/styles";
import { notificationTypes } from "../api/enum";

export function NotificationModal({open, setOpen}) {

  const { currentUserManager } = useContext(CurrentUserContext);
  
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

          function getRightContent() {
            switch (notification.type) {
              case notificationTypes.INCOMINGFRIENDREQUEST:
                return <Image source={require("../assets/images/notifications/FriendRequest.png")} style={{height: 40, width: 40}} />;
              case notificationTypes.FRIENDREQUESTACCEPTED:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: 40, width: 40}} />;
              case notificationTypes.INCOMINGGROUPINVITE:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: 40, width: 40}} />;
              case notificationTypes.USERJOINEDGROUP:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: 40, width: 40}} />;
              case notificationTypes.USERLEFTGROUP:
                return <Image source={require("../assets/images/notifications/FriendAccepted.png")} style={{height: 40, width: 40}} />;
              case notificationTypes.NEWTRANSACTION:
              case notificationTypes.TRANSACTIONDELETED:
              case notificationTypes.USERSETTLED:
                return <NotificationAmountLabel notification={notification} />;
              default:
                return;
            }
          }

          return (
            <View display="flex" flexDirection="row" alignItems="center">
              { !notification.seen && <UnreadDot /> }
              <GradientCard key={index} gradient={notification.color}>
                <View style={{flex: 6}} >
                  <StyledText text={notification.message} />
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

  function setNotificationsRead() {
    let newNotifications = [];
    for (const notif of currentUserManager.data.notifications) {
      notif.seen = true;
      newNotifications.push(notif);
    }
    currentUserManager.setNotifications(newNotifications);
    currentUserManager.push();
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
              { renderNotifications() }
            </ScrollView>
          </StyledModalContent>
        </Modal>
    )
}