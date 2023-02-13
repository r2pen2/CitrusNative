import { TextInput, View, Image } from "react-native"

export function SearchBar({setSearch}) {
    return (
        <View display="flex" flexDirection="row" alignItems="center" style={{backgroundColor: "#282C3D", width: "80%", height: 40, borderRadius: 100}}>
            <Image source={require("../assets/images/SearchIcon.png")} style={{height: 32, width: 32, marginLeft: 10}} />
            <TextInput 
                placeholder="Search"
                placeholderTextColor={"#FCFCFC"}
                style={{marginLeft: 10, color: "#fcfcfc", width: "100%"}}
            />
        </View>
    )
}