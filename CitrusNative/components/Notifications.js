import { useContext } from "react";
import { CurrentUserContext } from "../Context";
import { Modal, ScrollView } from "react-native"
import { CenteredTitle } from "./Text";
import { StyledModalContent } from "./Wrapper";

export function NotificationModal({open, setOpen}) {

    const { currentUserManager } = useContext(CurrentUserContext);
    
  function renderNotifications() {
    if (currentUserManager) {
      if (currentUserManager.data.notifications.length > 0) {
        return currentUserManager.data.notifications.map((notification, index) => {
          return <CenteredTitle text="notif" />
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