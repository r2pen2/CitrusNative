import { useContext } from "react";
import { DarkContext } from "../Context";
import { View, TextInput } from "react-native";
import { darkTheme, lightTheme } from "../assets/styles";


const styles = {
    searchHeight: 40,
    searchElevation: 5,
}

export function Entry(props) {
    
    const { dark } = useContext(DarkContext);
    
    return (
        <View 
            display="flex" 
            flexDirection="row" 
            alignItems="center" 
            style={{
                backgroundColor: (dark ? "#282C3D" : "#E4E4E4"), 
                width: props.fullWidth ? "100%" : "80%", 
                height: styles.searchHeight, 
                borderRadius: 100,
                elevation: styles.searchElevation
            }}>
            <TextInput 
                placeholder={props.placeholderText ? props.placeholderText : ""}
                placeholderTextColor={dark ? darkTheme.textSecondary : lightTheme.textSecondary}
                style={{
                    textAlign: "center",
                    color: dark ? darkTheme.textPrimary : lightTheme.textPrimary, 
                    width: "100%"
                }}
            />
        </View>
    )
}