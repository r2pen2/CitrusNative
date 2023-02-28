Placeholder readme lol

Files still in need of review / comments:
- api:
    - currency.js
    - dbManager.js
    - notification.js
    - swipe.js
- components
    - Avatar.js
    - Button.js
    - Card.js
    - Input.js
    - Notifications.js
    - Text.js
    - Topbar.js
    - TransactionDetail.js
    - Wrapper.js
- navigation
    - Dashboard.js
    - Groups.js
    - Login.js
    - NewTranscation.js (just ammount entry)
    - People.js
    - Settings.js
- misc
    - App.js
    - Context.js
    - react-native-config.js

# CitrusNative

## Development Tools

## Development Team

## Design and Architecture

### Strategy

### Scope

### Structure

### Skeleton

### Surface

## Developer Manual

### Best Pactices

#### Imports
Imports are separated into sections based on their utility, organized alphabetically, and on multiple lines if excessively long.
No unused modules are included in the imports section.
Example from navigation/NewTransaction.js:
```js
// Library Imports
import { useContext, useEffect, useState, } from "react";
import { Keyboard, Modal, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";

// Context Imports
import { 
  CurrentUserContext, 
  DarkContext, 
  FocusContext, 
  GroupsContext, 
  NewTransactionContext, 
  TransactionsContext, 
  UsersContext, 
} from "../Context";

// Component Imports
import { AvatarIcon, AvatarList, } from "../components/Avatar";
import { CurrencyLegalButton, CurrencyTypeButton, StyledButton, StyledCheckbox, DropDownButton, } from "../components/Button";
import { GradientCard, } from "../components/Card";
import { Entry, SearchBarFull, } from "../components/Input";
import { CenteredTitle, StyledText, } from "../components/Text";
import TransactionDetail from "../components/TransactionDetail";
import { CardWrapper, ListScroll, PageWrapper, StyledModalContent, } from "../components/Wrapper";

// Api Imports
import { CurrencyManager, } from "../api/currency";
import { DBManager, UserRelationHistory, } from "../api/dbManager";
import { emojiCurrencies, legalCurrencies, } from "../api/enum";

// Style Imports
import { globalColors } from "../assets/styles";
```