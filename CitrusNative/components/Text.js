import { Pressable, Text, View, Image } from "react-native";
import { useContext } from "react";
import { DarkContext } from "../Context";
import { darkTheme, globalColors, lightTheme } from "../assets/styles";
import { emojiCurrencies, legalCurrencies } from "../api/enum";

export function CenteredTitle(props) {

    const { dark } = useContext(DarkContext);

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : (dark ? "#fcfcfc" : "#0A1930"), 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
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

    const { dark } = useContext(DarkContext);

    const titleStyle = { 
        zIndex: props.zIndex ? props.zIndex : 1,
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : (dark ? "#fcfcfc" : "#0A1930"), 
    };

    return (
        <Pressable onPress={props.onClick} display="flex" flexDirection="row" alignItems="center" textAlign="center" style={{height: props.height, 
            marginTop: props.marginTop ? props.marginTop : 10,
            marginBottom: props.marginBottom ? props.marginBottom : 10,
            marginLeft: props.marginLeft ? props.marginLeft : 0,
            marginRight: props.marginRight ? props.marginRight : 0,}}>
            <Text style={titleStyle}>
                {props.text}
            </Text>
        </Pressable>
    )
}

export function AlignedText(props) {

    
    const { dark } = useContext(DarkContext);

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 16, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: props.color ? props.color : (dark ? "#fcfcfc" : "#0A1930"), 
        marginTop: props.marginTop ? props.marginTop : 10,
        marginBottom: props.marginBottom ? props.marginBottom : 10,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
    };

    return (
        <View style={{display: 'flex', direction: "row", alignItems: props.alignment ? props.alignItems : 'center'}} >
            <Text style={titleStyle}>
                {props.text}
            </Text>
        </View>
    )
}

export function RelationLabel(props) {

    const { dark } = useContext(DarkContext);

    function getColor() {
        if (props.relation.balances["USD"] > 0) {
            return globalColors.green;
        }
        if (props.relation.balances["USD"] < 0) {
            return globalColors.red;
        }
        return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
    }

    function getOperator() {
        if (props.relation.balances["USD"] > 0) {
            return "+ $";
        }
        if (props.relation.balances["USD"] < 0) {
            return "- $";
        }
        return "$";
    }

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 24, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: getColor(), 
        marginTop: props.marginTop ? props.marginTop : 0,
        marginBottom: props.marginBottom ? props.marginBottom : 0,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
    };

    return (
        <Pressable onPress={props.onClick}>
            <Text style={titleStyle}>
                { getOperator() + Math.abs(props.relation.balances["USD"]).toFixed(2) }
            </Text>
        </Pressable>
    )
}


export function EmojiBar(props) {

    const { dark } = useContext(DarkContext);

    function getImgSize() {
        if (props.size) {
            if (props.size === "large") {
                return 24;
            }
        }
        return 20;
    }

    function getBadgeLeft() {
        if (props.size) {
            if (props.size === "large") {
                return 12;
            }
        }
        return 10;
    }

    function getBadgeSize() {
        if (props.size) {
            if (props.size === "large") {
                return 18;
            }
        }
        return 16;
    }

    function getBadgeFontSize() {
        if (props.size) {
            if (props.size === "large") {
                return 12;
            }
        }
        return 12;
    }

    function renderEmojis() {
        return Object.keys(props.relation.balances).map((bal, index) => {
            
            function getColor() {
                if (props.relation.balances[bal] > 0) {
                    return globalColors.green;
                }
                if (props.relation.balances[bal] < 0) {
                    return globalColors.red;
                }
            }        

            function getEmojiSource() {
                switch (bal) {
                    case emojiCurrencies.BEER:
                      return require("../assets/images/emojis/beer.png");
                    case emojiCurrencies.COFFEE:
                      return require("../assets/images/emojis/coffee.png");
                    case emojiCurrencies.PIZZA:
                      return require("../assets/images/emojis/pizza.png");
                    default:
                      return "";
                }
              }

            return (
                (bal !== "USD") && (props.relation.balances[bal] !== 0) && 
                <View key={index}>
                    <Image source={getEmojiSource()} style={{width: getImgSize(), height: getImgSize()}}/>
                    <Text
                        style={{
                            color: dark ? darkTheme.badgeText : lightTheme.badgeText,
                            backgroundColor: getColor(),
                            textAlign: 'center',
                            borderRadius: 100,
                            borderColor: dark ? darkTheme.badgeBorder : lightTheme.badgeBorder,
                            borderWidth: 1,
                            width: getBadgeSize(),
                            height: getBadgeSize(),
                            fontSize: getBadgeFontSize(),
                            left: getBadgeLeft(),
                            top: -8,
                            position: 'absolute',
                        }}>
                        { Math.abs(props.relation.balances[bal]) }
                    </Text>
                </View> 
            )
        })
    }

    return (
        <Pressable 
            onPress={props.onClick} 
            style={{
                marginTop: props.marginTop ? props.marginTop : 0, 
                marginBottom: props.marginBottom ? props.marginBottom : 0, 
                display: "flex", 
                flexDirection: "row", 
                alignItems: "center", 
                width: "100%", 
                paddingHorizontal: 10, 
                justifyContent: props.justifyContent ? props.justifyContent : "flex-start",
                transform: props.transform ? props.transform : []
            }}>
            { renderEmojis() }
        </Pressable>
    )
}

export function RelationHistoryLabel(props) {

    const { dark } = useContext(DarkContext);

    function getColor() {
        if (props.history.amount > 0) {
            return globalColors.green;
        }
        if (props.history.amount < 0) {
            return globalColors.red;
        }
        return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
    }

    function getOperator() {
        if (props.history.amount > 0) {
            return "+ ";
        }
        if (props.history.amount < 0) {
            return "- ";
        }
        return "";
    }

    const titleStyle = { 
        fontSize: props.fontSize ? props.fontSize : 24, 
        fontWeight: props.fontWeight ? props.fontWeight : 'bold', 
        color: getColor(), 
        marginTop: props.marginTop ? props.marginTop : 0,
        marginBottom: props.marginBottom ? props.marginBottom : 0,
        marginLeft: props.marginLeft ? props.marginLeft : 0,
        marginRight: props.marginRight ? props.marginRight : 0,
    };

    function getEmojiSource() {
        switch (props.history.currency.type) {
            case emojiCurrencies.BEER:
              return require("../assets/images/emojis/beer.png");
            case emojiCurrencies.COFFEE:
              return require("../assets/images/emojis/coffee.png");
            case emojiCurrencies.PIZZA:
              return require("../assets/images/emojis/pizza.png");
            default:
              return "";
        }
      }

    return ( 
        (props.history.currency.legal) ?
        <Pressable onPress={props.onClick} display="flex" flexDirection="row">
            <Text style={titleStyle}>
                { getOperator() + "$" +  Math.abs(props.history.amount).toFixed(2) }
            </Text>
        </Pressable> 
        : 
        <Pressable onPress={props.onClick} display="flex" flexDirection="row" alignItems="center">
            <Text style={titleStyle}>
                { getOperator() }
            </Text>
            <Image source={getEmojiSource()} style={{width: 20, height: 20}}/>
            <Text style={titleStyle}>
                { " x " +  Math.abs(props.history.amount) }
            </Text>
        </Pressable>
    )
}