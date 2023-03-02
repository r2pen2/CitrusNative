import { useContext } from "react";
import { DarkContext } from "../Context";
import { View, TextInput, Image } from "react-native";
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
                height: props.height ? props.height : measurements.entryHeight, 
                borderRadius: 10,
                elevation: 2,
                marginBottom: props.marginBottom ? props.marginBottom : 0,
                marginLeft: props.marginLeft ? props.marginLeft : 0,
                marginRight: props.marginRight ? props.marginRight : 0,
            }}>
            <TextInput 
                placeholder={props.placeholderText ? props.placeholderText : ""}
                placeholderTextColor={dark ? darkTheme.textSecondary : lightTheme.textSecondary}
                onChangeText={props.onChange}
                onBlur={props.onBlur}
                inputMode={props.numeric ? "decimal" : "text"}
                keyboardType={props.numeric ? "numeric" : "default"}
                value={props.value ? props.value : ""}
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


const styles = {
    searchHeight: 40,
    searchElevation: 5,
}

function SearchBar(props) {
    
    const { dark } = useContext(DarkContext);
    
    return (
        <View 
            display="flex" 
            flexDirection="row" 
            alignItems="center" 
            style={{
                backgroundColor: (dark ? darkTheme.searchFill : lightTheme.searchFill), 
                width: props.fullWidth ? "100%" : (props.halfWidth ? "50%" : "80%"), 
                height: styles.searchHeight, 
                borderRadius: 100,
                elevation: styles.searchElevation
            }}>
            <Image source={dark ? require("../assets/images/SearchIcon.png") : require("../assets/images/SearchIconLight.png")} style={{height: 32, width: 32, marginLeft: 10}} />
            <TextInput 
                placeholder={props.placeholder ? props.placeholder : "Search"}
                placeholderTextColor={dark ? "#FCFCFC" : "#0A1930"}
                onChangeText={props.setSearch}
                onSubmitEditing={props.onEnter}
                style={{
                    marginLeft: 10, 
                    color: dark ? "#FCFCFC" : "#0A1930", 
                    width: "100%"
                }}
            />
        </View>
    )
}

export function SearchBarFull(props) {
    return <SearchBar setSearch={props.setSearch} onEnter={props.onEnter} placeholder={props.placeholder} fullWidth={true} />
}

export function SearchBarHalf(props) {
    return <SearchBar setSearch={props.setSearch} onEnter={props.onEnter} placeholder={props.placeholder} halfWidth={true} />
}

export function SearchBarShort(props) {
    return <SearchBar setSearch={props.setSearch} onEnter={props.onEnter} placeholder={props.placeholder}/>
}