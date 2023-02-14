import { Text, View } from "react-native";

export function CenteredTitle(props) {

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : "#fcfcfc", 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
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

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : "#fcfcfc", 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
    };

    return (
        <Text style={titleStyle}>
            {props.text}
        </Text>
    )
}

export function AlignedText(props) {

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : "#fcfcfc", 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
    };

    return (
        <View style={{display: 'flex', direction: "row", alignItems: props.alignment ? props.alignItems : 'center'}} >
            <Text style={titleStyle}>
                {props.text}
            </Text>
        </View>
    )
}