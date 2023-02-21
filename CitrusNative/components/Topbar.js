import { View, Text, Image, Pressable } from 'react-native'
import { useContext, useEffect } from 'react'
import { DarkContext, CurrentUserContext } from "../Context";
import AvatarIcon from './Avatar';
import { AlignedText } from './Text';

const styles = {
  avatarSize: 50,
  avatarBorderWidth: 10
}

export default function Topbar({nav, onNotificationClick}) {
  const { dark, setDark } = useContext(DarkContext);
  const { currentUserManager } = useContext(CurrentUserContext);

  return currentUserManager && (
    <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{paddingTop: 10, paddingLeft: 20, paddingRight: 20}}>
        <View display="flex" flexDirection="row" alignItems="center" >
          <Pressable
          onPress={() => nav.navigate("settings")}
          style={{elevation: 5, backgroundColor: "#000000", borderRadius: styles.avatarSize / 2}}
          >
            <AvatarIcon src={currentUserManager.data.personalData.pfpUrl} size={styles.avatarSize} borderWidth={styles.avatarBorderWidth} />
          </Pressable>
            <AlignedText text={currentUserManager.data.personalData.displayName} alignment="left" marginLeft={10}/>
        </View>
        <Pressable
          onPress={onNotificationClick}>
          <Image source={dark ? require('../assets/images/NotificationIcon.png') : require('../assets/images/NotificationIconLight.png')} style={{width: 32, height: 32}} />
        </Pressable>
    </View>
  )
}

