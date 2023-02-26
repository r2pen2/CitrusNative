import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import { useContext, useRef } from "react";
import { DarkContext } from "../Context";
import { darkTheme, globalColors, lightTheme } from "../assets/styles";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { StyledText } from "./Text";

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
                <Pressable
                    display="flex"
                    onPress={props.onClick}
                    android_ripple={props.onClick ? {color: globalColors.greenAlpha} : {}}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between" 
                    style={{
                    borderRadius: styles.cardBorderRadius, 
                    width: '100%', 
                    padding: 16, 
                    height: "100%", 
                    backgroundColor: dark ? darkTheme.cardFill : lightTheme.cardFill,
                }}>
                    { props.children }
                </Pressable>
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
            }}
            >
                <Pressable onPress={props.onClick} style={{
                display: 'flex', 
                flexDirection: "row", 
                justifyContent: "space-between",
                alignItems: "center", 
                overflow: "hidden",}}>
                    { props.children }
                </Pressable>
            </LinearGradient>
                
            )
        }
    }
    
    const swipeableRef = useRef(null);
   
    function renderLeftActions(progress, dragX) {
        if (!props.leftSwipeComponent) {
            return;
        }
        const trans = dragX.interpolate({
          inputRange: [0, 50, 100, 101],
          outputRange: [-20, 0, 0, 1],
        });
        return props.leftSwipeComponent;
    }   

    function renderRightActions(progress, dragX) {
        if (!props.rightSwipeComponent) {
            return;
        }
        const trans = dragX.interpolate({
          inputRange: [0, 50, 100, 101],
          outputRange: [-20, 0, 0, 1],
        });
        return props.rightSwipeComponent;
    }   

    function handleSwipeOpen(direction) {
        if (direction === "left") {
            if (props.onLeftSwipe) {
                swipeableRef.current.close();
                props.onLeftSwipe();
            }
        }
        if (direction === "right") {
            if (props.onRightSwipe) {
                swipeableRef.current.close();
                props.onRightSwipe();
            }
        }
    }

    return (
        <Swipeable 
        ref={swipeableRef}
        containerStyle={{flex: 1}}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={handleSwipeOpen}>
                        <LinearGradient 
                start={props.selected ? [0, 0] : [0, 0.5]}
                end={props.selected ? [1, 1] : [0.3, 0.5]}
                colors={getGradientColors()}
                style={{
                    maxWidth: props.width ? props.width: '100%',
                    borderRadius:  styles.cardBorderRadius, 
                    height: "100%", 
                    marginBottom: styles.cardMarginBottom, 
                    elevation: styles.cardElevation,
                    flex: 1,
                    padding: 1,
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                }}
                >
                { renderView() }
                </LinearGradient>
            </Swipeable>
    )
}