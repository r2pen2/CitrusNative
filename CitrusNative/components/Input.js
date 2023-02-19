import { useContext } from "react";
import { DarkContext } from "../Context";
import { View, TextInput } from "react-native";
import { darkTheme, lightTheme, measurements, textStyles } from "../assets/styles";

export function Entry(props) {
    
    const { dark } = useContext(DarkContext);
    
    return (
        <View 
            display="flex" 
            flexDirection="row" 
            alignItems="center" 
            style={{
                backgroundColor: (dark ? darkTheme.textFieldFill : lightTheme.textFieldFill), 
                width: props.width ? props.width : "100%", 
                borderBottomColor: dark ? darkTheme.textFieldBorderColor : lightTheme.textFieldBorderColor,
                borderBottomWidth: 1,
                height: measurements.entryHeight, 
                borderRadius: 10,
                elevation: 2
            }}>
            <TextInput 
                placeholder={props.placeholderText ? props.placeholderText : ""}
                placeholderTextColor={dark ? darkTheme.textSecondary : lightTheme.textSecondary}
                onChangeText={props.onChange}
                style={{
                    textAlign: "center",
                    color: dark ? darkTheme.textPrimary : lightTheme.textPrimary, 
                    width: "100%",
                    fontSize: textStyles.entryFontSize
                }}
            />
        </View>
    )
}