import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

export function GradientCard(props) {

    function getGradientColors() {
        if (props.selected) {
            return ['#00DD66', '#6442AC']
        }
        if (props.gradient === "white") {
            return ['#6543ac', '#888888'];
        }
    }

    function renderView() {
        if (!props.selected) {
            return (
                <View style={{
                    borderRadius: 14, 
                    width: '100%', 
                    padding: 16, 
                    height: "100%", 
                    display: 'flex', 
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    alignItems: "center", 
                    backgroundColor: '#22242E',
                }}>
                    { props.children }
                </View>
            )
        } else {
            return (
            <LinearGradient 
            start={[0, 0.5]}
            end={[1, 0.5]}
            colors={['#1a533d', '#41356b']}
            style={{
                borderRadius: 14, 
                width: '100%', 
                padding: 16, 
                height: "100%", 
                display: 'flex', 
                flexDirection: "row", 
                justifyContent: "space-between",
                alignItems: "center", 
            }}
            >
                { props.children }
            </LinearGradient>
                
            )
        }
    }

    return (
        <Pressable onPress={props.onClick}>
                    <LinearGradient 
            start={props.selected ? [0, 0] : [0, 0.5]}
            end={props.selected ? [1, 1] : [0.3, 0.5]}
            colors={getGradientColors()}
            style={{
                width: "100%", 
                borderRadius: 15, 
                height: 80, 
                padding: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                elevation: 5,
                marginBottom: 10,
            }}
            >
            { renderView() }
        </LinearGradient>
        </Pressable>
    )
}