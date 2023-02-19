import { View } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'

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