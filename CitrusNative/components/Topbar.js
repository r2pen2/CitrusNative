import { View, Text, Image, Pressable } from 'react-native'
import { useContext } from 'react'
import { PageContext, DarkContext } from "../Context";
import AvatarIcon from './Avatar';
import { AlignedText } from './Text';

const styles = {
  avatarSize: 50,
  avatarBorderWidth: 10
}

export default function Topbar() {
  
  const { page, setPage } = useContext(PageContext);
  const { dark, setDark } = useContext(DarkContext);
  
  return (
    <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{paddingTop: 40, paddingLeft: 20, paddingRight: 20}}>
        <View display="flex" flexDirection="row" alignItems="center" >
          <Pressable
          onPress={() => setPage("settings")}
          style={{elevation: 5 ,backgroundColor: "#000000", borderRadius: styles.avatarSize / 2}}
          >
            <AvatarIcon src="https://i.pinimg.com/736x/b7/9b/08/b79b0879ca5df87757e0fd4d0e8796fd.jpg" size={styles.avatarSize} borderWidth={styles.avatarBorderWidth} />
          </Pressable>
            <AlignedText text="Joe Dobbelaar" alignment="left" marginLeft={10}/>
        </View>
        <Pressable
          onPress={() => setDark(!dark)}>
          <Image source={dark ? require('../assets/images/NotificationIcon.png') : require('../assets/images/NotificationIconLight.png')} style={{width: 32, height: 32}} />
        </Pressable>
    </View>
  )
}

