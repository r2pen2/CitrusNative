import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import { useContext } from "react";
import { DarkContext } from "../Context";
import { darkTheme, globalColors, lightTheme } from "../assets/styles";

const styles = {
    cardBorderRadius: 15,
    cardInnerBorderRadius: 14,
    cardElevation: 5,
    cardMarginBottom: 10,
}

export function GradientCard(props) {

    const { dark } = useContext(DarkContext);

    function getGradientColors() {
        if (props.selected) {
            return globalColors.selectedGradient;
        }
        if (props.disabled) {
            return globalColors.disabledGradient;
        }
        if (props.gradient === "white" || !props.gradient) {
            return globalColors.whiteGradient;
        }
        if (props.gradient === "red" || props.gradient === globalColors.red) {
            return globalColors.redGradient;
        }
        if (props.gradient === "green" || props.gradient === globalColors.green) {
            return globalColors.greenGradient;
        }
    }

    function renderView() {
        if (!props.selected) {
            return (
                <View
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between" 
                    style={{
                    borderRadius: styles.cardInnerBorderRadius, 
                    width: '100%', 
                    padding: 16, 
                    height: "100%", 
                    backgroundColor: dark ? darkTheme.cardFill : lightTheme.cardFill,
                }}>
                    { props.children }
                </View>
            )
        } else {
            return (
            <LinearGradient 
            start={[0, 0.5]}
            end={[1, 0.5]}
            colors={dark ? darkTheme.selectedFill : lightTheme.selectedFill}
            style={{
                borderRadius:  styles.cardInnerBorderRadius, 
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
        <Pressable 
        onPress={props.onClick}
        style={{
            backgroundColor: "#000000",
            marginBottom: styles.cardMarginBottom,
            elevation: styles.cardElevation,
            borderRadius: styles.cardBorderRadius, 
            flex: 1,
            minHeight: props.height ? props.height : 0,
            opacity: props.disabled ? 0.5 : 1,
        }}>
                    <LinearGradient 
            start={props.selected ? [0, 0] : [0, 0.5]}
            end={props.selected ? [1, 1] : [0.3, 0.5]}
            colors={getGradientColors()}
            style={{
                width: "100%", 
                borderRadius:  styles.cardBorderRadius, 
                height: "100%", 
                padding: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
            }}
            >
            { renderView() }
        </LinearGradient>
        </Pressable>
    )
}