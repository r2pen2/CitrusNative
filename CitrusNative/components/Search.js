import { TextInput, View, Image } from "react-native";
import { useContext } from "react";
import { DarkContext } from "../Context";

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
                backgroundColor: (dark ? "#282C3D" : "#E4E4E4"), 
                width: props.fullWidth ? "100%" : "80%", 
                height: styles.searchHeight, 
                borderRadius: 100,
                elevation: styles.searchElevation
            }}>
            <Image source={dark ? require("../assets/images/SearchIcon.png") : require("../assets/images/SearchIconLight.png")} style={{height: 32, width: 32, marginLeft: 10}} />
            <TextInput 
                placeholder="Search"
                placeholderTextColor={dark ? "#FCFCFC" : "#0A1930"}
                style={{
                    marginLeft: 10, 
                    color: dark ? "#FCFCFC" : "#0A1930", 
                    width: "100%"
                }}
            />
        </View>
    )
}

export function SearchBarFull({setSearch}) {
    return <SearchBar fullWidth={true} />
}

export function SearchBarShort({setSearch}) {
    return <SearchBar />
}