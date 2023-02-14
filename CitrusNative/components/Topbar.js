import { View, Text, Image, Pressable } from 'react-native'
import { useContext } from 'react'
import { PageContext } from "../Context";
import AvatarIcon from './Avatar';

export default function Topbar() {
  
  const { page, setPage } = useContext(PageContext);
  
  return (
    <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{paddingTop: 40, paddingLeft: 20, paddingRight: 20}}>
        <View display="flex" flexDirection="row" alignItems="center" >
          <Pressable
          onPress={() => setPage("settings")}
          >
            <AvatarIcon src="https://i.pinimg.com/736x/b7/9b/08/b79b0879ca5df87757e0fd4d0e8796fd.jpg" size={50} borderWidth={10} />
          </Pressable>
            <Text style={{fontSize: 16, color: "#fefefe", marginLeft: 10}}>Joe Dobbelaar</Text>
        </View>
        <Image source={require('../assets/images/NotificationIcon.png')} style={{width: 32, height: 32}} />
    </View>
  )
}

