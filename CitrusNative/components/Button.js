import React, { useContext, useState } from 'react';
import { View, Image, Pressable, Text, ScrollView, Animated } from "react-native";
import CheckBox from "expo-checkbox";
import { DarkContext, NewTransactionContext } from '../Context';
import { darkTheme, lightTheme, globalColors, measurements } from '../assets/styles';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { emojiCurrencies, legalCurrencies } from '../api/enum';
import DropDownPicker from "react-native-dropdown-picker"
import { LinearGradient } from 'expo-linear-gradient';

const styles = {
  buttonElevation: 2,
  buttonBorderWidth: 1,
  buttonWidth: 200,
  buttonHeight: 50,
  dropDownButtonHeight: 40,
}

export function AddButton() {

  const { dark } = useContext(DarkContext);

  return (
    <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={dark ? require("../assets/images/AddButton.png") : require("../assets/images/AddButtonLight.png")} style={{width: 40, height: 40, backgroundColor: (dark ? "#282C3D" : "#E4E4E4"), borderRadius: 20}}/>
    </View>
  )
}

export function DarkModeButton() {

  const { dark, setDark } = useContext(DarkContext);

  return (
    <Pressable onPress={() => setDark(!dark)}>
      <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={dark ? require("../assets/images/LightMode.png") : require("../assets/images/DarkMode.png")} style={{width: 40, height: 40, backgroundColor: "transparent"}}/>
      </View>
    </Pressable>
  )
}

export function EditButton() {

  const { dark, setDark } = useContext(DarkContext);

  return (
    <Pressable onPress={() => setDark(!dark)}>
      <View display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Image source={dark ? require("../assets/images/EditDark.png") : require("../assets/images/EditLight.png")} style={{width: 40, height: 40, backgroundColor: "transparent"}}/>
      </View>
    </Pressable>
  )
}

export function StyledButton(props) {

  const { dark } = useContext(DarkContext);

  function getBorderColor() {
    if (props.color) {
      if (props.color === "red") {
        return globalColors.red;
      }
      if (props.color === "green") {
        return globalColors.green;
      }
    }
    if (props.disabled) {
      return dark ? darkTheme.buttonBorderDisabled : lightTheme.buttonBorderDisabled;
    }
    return dark ? darkTheme.buttonBorder : lightTheme.buttonBorder;
  }

  function getTextColor() {
    if (props.color) {
      if (props.color === "red") {
        return globalColors.red;
      }
      if (props.color === "green") {
        return globalColors.green;
      }
    }
    if (props.disabled) {
      return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
    }
    return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
  }

  if (props.selected) {
    return (
      <LinearGradient 
      start={[0, 0.5]}
      end={[1, 0.5]}
      colors={dark ? darkTheme.selectedFill : lightTheme.selectedFill}
      style={{
        display: 'flex', 
        flexDirection: "row", 
        width: props.width ? props.width : styles.buttonWidth, 
        height: props.height ? props.height : styles.buttonHeight,
        marginTop: 10,
        marginBottom: props.marginBottom ? props.marginBottom : 0,
        borderRadius: 10,
        backgroundColor: dark ? darkTheme.buttonFill : lightTheme.buttonFill,
        elevation: styles.buttonElevation
      }}
      >
      <Pressable
        onPress={props.onClick}
        disabled={props.disabled}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 10,
          borderWidth: styles.buttonBorderWidth,
          borderColor: getBorderColor(),
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text style={{color: (getTextColor()), fontSize: 20}}>
          {props.text}
        </Text>
      </Pressable>
      </LinearGradient>
    )
  }

  return (
    <View 
    style={{
      display: 'flex', 
      flexDirection: "row", 
      width: props.width ? props.width : styles.buttonWidth, 
      height: props.height ? props.height : styles.buttonHeight,
      marginTop: 10,
      marginBottom: props.marginBottom ? props.marginBottom : 0,
      borderRadius: 10,
      backgroundColor: dark ? darkTheme.buttonFill : lightTheme.buttonFill,
      elevation: styles.buttonElevation
    }}>
      <Pressable
        onPress={props.onClick}
        disabled={props.disabled}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 10,
          borderWidth: styles.buttonBorderWidth,
          borderColor: getBorderColor(),
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text style={{color: (getTextColor()), fontSize: 20}}>
          {props.text}
        </Text>
      </Pressable>
    </View>
  )
}

export function StyledCheckbox(props) {
  return (
    <CheckBox 
    value={props.checked} 
    color={props.checked ? "#fcfcfc" : "#767676"}
    onValueChange={props.onChange}/>
  )
}


export function GoogleButton({onClick}) {

  return (
    <View 
    style={{
      display: 'flex', 
      flexDirection: "row", 
      width: styles.buttonWidth, 
      height: styles.buttonHeight,
      marginTop: 10,
      marginBottom:  0,
      borderRadius: 10,
      elevation: styles.buttonElevation
    }}>
      <Pressable
        onPress={onClick}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <GoogleSigninButton />
      </Pressable>
    </View>
  )
}

export function CurrencyLegalButton({onClick, currencyLegal}) {

  const { dark, setDark } = useContext(DarkContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);

  function handleCurrencyLegalChange() {
    const update = {...newTransactionData};
    update.currencyLegal = !newTransactionData.currencyLegal;
    update.currencyMenuOpen = false;
    setNewTransactionData(update); 
  }  

  function getSource() {
    if (newTransactionData.currencyLegal) {
      return dark ? require("../assets/images/PaymentDark.png") : require("../assets/images/PaymentLight.png");
    }
    return dark ? require("../assets/images/SmileDark.png") : require("../assets/images/SmileLight.png")
  }
  
  return (
    <Pressable onPress={handleCurrencyLegalChange}>
      <View 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        style={{
          height: measurements.entryHeight, 
          width: measurements.entryHeight, 
          backgroundColor: dark ? darkTheme.textFieldFill : lightTheme.textFieldFill, 
          borderColor: dark ? darkTheme.textFieldBorderColor : lightTheme.textFieldBorderColor, 
          borderWidth: 1, 
          borderRadius: 5}
        }>
        <Image source={getSource()} style={{width: measurements.entryHeight - 20, height: measurements.entryHeight - 20}}/>
      </View>
    </Pressable>
  )
}

export function CurrencyTypeButton() {

  
  const { dark } = useContext(DarkContext);
  const { newTransactionData, setNewTransactionData } = useContext(NewTransactionContext);
  
  function toggleCurrencyTypeMenu() {
    const update = {...newTransactionData};
    update.currencyMenuOpen = !newTransactionData.currencyMenuOpen;
    setNewTransactionData(update); 
  }
  
  function getSource(itemName) {
    if (newTransactionData.currencyLegal) {
      switch (newTransactionData.legalType) {
        case legalCurrencies.USD:
          return dark ? require("../assets/images/currencies/USDDark.png") : require("../assets/images/currencies/USDLight.png");
        default:
          return "";
      }
    } else {
      switch (itemName) {
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
  }

  const [open, setOpen] = useState(false);

  function updateCurrencyType(item) {
    const newData = {...newTransactionData};
    if (newTransactionData.currencyLegal) {
      newData.legalType = item.value;
    } else {
      newData.emojiType = item.value;
    }
    newData.currencyMenuOpen = false;
    setNewTransactionData(newData);
  }

  function toggleOpen() {
    const newData = {...newTransactionData};
    newData.currencyMenuOpen = !newTransactionData.currencyMenuOpen;
    setNewTransactionData(newData);
  }

  function DropDownItem(props) {
    return <View style={{
      height: measurements.entryHeight,
      width: measurements.entryHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -10,
    }}>
      {props.children}
    </View>
  }
  
  const items = newTransactionData.currencyLegal ? [
    {value: legalCurrencies.USD, icon: () => (<DropDownItem><Image source={getSource(emojiCurrencies.BEER)} style={{width: measurements.entryHeight - 20, height: measurements.entryHeight - 20}}/></DropDownItem>)},
  ] : [
    {value: emojiCurrencies.BEER, icon: () => (<DropDownItem><Image source={getSource(emojiCurrencies.BEER)} style={{width: measurements.entryHeight - 20, height: measurements.entryHeight - 20}}/></DropDownItem>)},
    {value: emojiCurrencies.COFFEE, icon: () => (<DropDownItem><Image source={getSource(emojiCurrencies.COFFEE)} style={{width: measurements.entryHeight - 20, height: measurements.entryHeight - 20}}/></DropDownItem>)},
    {value: emojiCurrencies.PIZZA, icon: () => (<DropDownItem><Image source={getSource(emojiCurrencies.PIZZA)} style={{width: measurements.entryHeight - 20, height: measurements.entryHeight - 20}}/></DropDownItem>)},
  ]

  return (
    <DropDownPicker
    open={newTransactionData.currencyMenuOpen}
    value={newTransactionData.currencyLegal ? newTransactionData.legalType : newTransactionData.emojiType}
    items={items}
    onPress={toggleOpen}
    onSelectItem={(item) => updateCurrencyType(item)}
    showArrowIcon={false}
    searchable={false}
    containerStyle={{
      width: measurements.entryHeight,
      height: measurements.entryHeight,
    }}
    dropDownContainerStyle={{
      backgroundColor: dark ? darkTheme.textFieldFill : lightTheme.textFieldFill,
      borderColor: dark ? darkTheme.textFieldBorderColor : lightTheme.textFieldBorderColor,
      width: measurements.entryHeight,
    }}
    style={{
      width: measurements.entryHeight,
      height: measurements.entryHeight,
      backgroundColor: dark ? darkTheme.textFieldFill : lightTheme.textFieldFill,
      borderColor: dark ? darkTheme.textFieldBorderColor : lightTheme.textFieldBorderColor,
      borderRadius: 5,
    }}
  />
  )
}

export function DropDownButton(props) {

  const { dark } = useContext(DarkContext);

  function getBorderColor() {
    if (props.color) {
      if (props.color === "red") {
        return globalColors.red;
      }
      if (props.color === "green") {
        return globalColors.green;
      }
    }
    if (props.disabled) {
      return dark ? darkTheme.buttonBorderDisabled : lightTheme.buttonBorderDisabled;
    }
    return dark ? darkTheme.buttonBorder : lightTheme.buttonBorder;
  }

  function getTextColor() {
    if (props.color) {
      if (props.color === "red") {
        return globalColors.red;
      }
      if (props.color === "green") {
        return globalColors.green;
      }
    }
    if (props.disabled) {
      return dark ? darkTheme.textSecondary : lightTheme.textSecondary;
    }
    return dark ? darkTheme.textPrimary : lightTheme.textPrimary;
  }

  function getArrow() {
    if (props.disabled) {
      return dark ? require("../assets/images/ArrowDownDarkDisabled.png") : require("../assets/images/ArrowDownLightDisabled.png")
    }
    return dark ? require("../assets/images/ArrowDownDark.png") : require("../assets/images/ArrowDownLight.png")
  }

  return (
    <View 
    style={{ 
      alignSelf: "center",
      height: styles.dropDownButtonHeight,
      marginLeft: 10,
      marginBottom: props.marginBottom ? props.marginBottom : 0,
      borderRadius: 10,
      backgroundColor: dark ? darkTheme.buttonFill : lightTheme.buttonFill,
      elevation: styles.buttonElevation
    }}>
      <Pressable
        onPress={props.onClick}
        disabled={props.disabled}
        style={{
          height: "100%",
          paddingLeft: 10,
          paddingRight: 10,
          borderRadius: 10,
          borderWidth: styles.buttonBorderWidth,
          borderColor: getBorderColor(),
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text style={{color: (getTextColor()), fontSize: 20}}>
          {props.text}
        </Text>
        <Image source={getArrow()} style={{marginLeft: 5, height: 20, width: 20}}/>
      </Pressable>
    </View>
  )
}