import { Pressable, Text, View } from "react-native";
import { useContext } from "react";
import { DarkContext } from "../Context";

export function CenteredTitle(props) {

    const { dark } = useContext(DarkContext);

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : (dark ? "#fcfcfc" : "#0A1930"), 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
    };

    return (
        <View style={{display: 'flex', direction: "row", alignItems: "center"}} >
            <Text style={titleStyle}>
                {props.text}
            </Text>
        </View>
    )
}

export function StyledText(props) {

    const { dark } = useContext(DarkContext);

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : (dark ? "#fcfcfc" : "#0A1930"), 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
    };

    return (
        <Pressable onPress={props.onClick}>
            <Text style={titleStyle}>
                {props.text}
            </Text>
        </Pressable>
    )
}

export function AlignedText(props) {

    
    const { dark } = useContext(DarkContext);

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : (dark ? "#fcfcfc" : "#0A1930"), 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
    };

    return (
        <View style={{display: 'flex', direction: "row", alignItems: props.alignment ? props.alignItems : 'center'}} >
            <Text style={titleStyle}>
                {props.text}
            </Text>
        </View>
    )
}