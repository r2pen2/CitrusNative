import { View, Text, Image } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';

export default function Topbar() {
  return (
    <View display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{paddingTop: 40, paddingLeft: 20, paddingRight: 20}}>
        <View display="flex" flexDirection="row" alignItems="center" >
            <LinearGradient start={[0, 0]}
                end={[1, 1]}
                colors={['#00DD66', '#6442AC']}
                style={{borderRadius: 25}}>
                    <View style={{width: 50, height: 50}} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                        <Image source={{uri: "https://i.pinimg.com/736x/b7/9b/08/b79b0879ca5df87757e0fd4d0e8796fd.jpg"}} style={{width: 45, height: 45, borderRadius: 25}} />
                    </View>
            </LinearGradient>
            <Text style={{fontSize: 16, color: "#fefefe", marginLeft: 10}}>Joe Dobbelaar</Text>
        </View>
        <Image source={require('../assets/images/NotificationIcon.png')} style={{width: 32, height: 32}} />
    </View>
  )
}

