import { View } from 'react-native'
import { useContext } from "react"
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { DarkContext } from '../Context'
import { darkTheme, lightTheme } from '../assets/styles'
import { LinearGradient } from 'expo-linear-gradient'

export function PageWrapper(props) {
  return (
    <View style={{
        display: 'flex', 
        height: "100%", 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        paddingLeft: 20, 
        paddingRight: 20,
        paddingBottom: 20
    }}>
      { props.children }
    </View>
  )
}

export function SettingsWrapper(props) {
    return (
      <View style={{
          display: 'flex', 
          height: "100%", 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          paddingLeft: 20, 
          paddingRight: 20,
          paddingBottom: 20,
          borderRadius: 20
      }}>
        { props.children }
      </View>
    )
  }

export function ListScroll(props) {
    return (
        <ScrollView style={{
            width: '100%',
            marginTop: props.marginBottom ? props.marginBottom : 10,
            marginBottom: props.marginBottom ? props.marginBottom : 0,
            }}>
            { props.children }
        </ScrollView>
    )
}

export function CardWrapper(props) {

  const { dark } = useContext(DarkContext);

  return (
    <View style={{
        display: 'flex', 
        height: "50%", 
        width: "100%", 
        flexDirection: props.flexDirection ? props.flexDirection : 'column', 
        alignItems: props.alignItems ? props.alignItems : 'center', 
        justifyContent: props.justifyContent ? props.justifyContent : 'center', 
        paddingLeft: 20, 
        paddingRight: 20,
        paddingBottom: 20,
        borderRadius: 20,
        margin: 20,
        elevation: 2,
        backgroundColor: dark ? darkTheme.cardFill : lightTheme.cardFill
    }}>
      { props.children }
    </View>
  )
}


export function StyledModalContent(props) {

  const { dark } = useContext(DarkContext);

  return(
    <LinearGradient 
    start={[0.5, 0]}
    end={[0.5, 1]}
    colors={dark ? darkTheme.popupGradient : lightTheme.popupGradient }
    style={{
      flex: 1,
      maxHeight: '60%',
      marginTop: '85%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: dark ? darkTheme.cardFill : lightTheme.cardFill,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      }}
    >
      {props.children}
    </LinearGradient>
  )
}