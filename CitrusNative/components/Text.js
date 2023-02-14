import { Text, View } from "react-native";

const titleStyle = { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: "#fcfcfc", 
    marginTop: 10,
    marginBottom: 10,
};

export function CenteredTitle({text}) {
    return (
        <View style={{display: 'flex', direction: "row", alignItems: "center"}} >
            <Text style={titleStyle}>
                {text}
            </Text>
        </View>
    )
}