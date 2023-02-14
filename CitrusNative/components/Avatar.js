import { View, Image} from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';

export default function AvatarIcon(props) {
  return (
    <LinearGradient 
        start={[0, 0]}
        end={[1, 1]}
        colors={['#00DD66', '#6442AC']}
        style={{
            borderRadius: props.size ? props.size / 2 : 25,
            width: props.size ? props.size : 50,
            height: props.size ? props.size : 50,
            marginRight: props.marginRight ? props.marginRight : 0,
            marginLeft: props.marginLeft ? props.marginLeft : 0,
            }}>
        <View 
            style={{
              width: props.size ? props.size : 50, 
              height: props.size ? props.size : 50,
            }} 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center"
        >
            <Image 
                source={{
                    uri: props.src
                }} 
                style={{
                    width: props.size ? (props.size - (props.borderWidth ? props.borderWidth / 2 : (props.size / 20))) : 45, 
                    height: props.size ? (props.size - (props.borderWidth ? props.borderWidth / 2 : (props.size / 20))) : 45,
                    borderRadius: props.size ? (props.size / 2) : 25
                }} />
        </View>
  </LinearGradient>
  )
}