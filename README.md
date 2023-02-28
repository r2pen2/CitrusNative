Placeholder readme lol

Files still in need of review / comments:
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
    - NewTranscation.js
        - Make sure AddPeople methods are marked as async if necessary
        - AmountEntry
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
Sections are in no particular order.
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
#### JSDOC
A list of all JSDOC tags can be found [here](https://jsdoc.app/)

Classes, enums, methods, functions, etc. should be well documented using JSDOC. Here are some examples:
```js
/**
 * Enum for emoji currency types
 * @example
 * emojiCurrencies.BEER = "beer";
 * emojiCurrencies.COFFEE = "coffee";
 * emojiCurrencies.PIZZA = "pizza";
 * @readonly
 * @enum {string}
 */
export const emojiCurrencies = { }

/**
 * A Change object for setting the value of a field
 * @private
 * @extends Change
 * @see {@link Change}
 */
class Set extends Change { }

/**
 * @class ObjectManager is an abstract class used to standardize higher-level oprations of database objects.
 * It is extended by {@link UserManager}, {@link TransactionManager}, and {@link GroupManager}.
 * @classdesc Abstract class that has methods that must be implemented by subclasses ({@link ObjectManager.handleAdd}, {@link ObjectManager.handleRemove}, 
 * {@link ObjectManager.handleSet}, {@link ObjectManager.handleUpdate}, {@link ObjectManager.handleGet}, and {@link ObjectManager.getEmptyData})
 */
class ObjectManager {
    /**
     * @constructor
     * @param {objectTypes} _objectType type of object to manager
     * @param {string} _documentId id of document on database
     * @default
     * _documentId = null; // This is ok! We'll just create a new document if there's no ID
     */
    constructor(_objectType, _documentId) {
        this.objectType = _objectType;      // Set objectType
        this.documentId = _documentId;      // Set documentId (or null)
        this.docRef = this.documentId ? firestore().collection(this.getCollection()).doc(_documentId) : null;   // Get reference if there's an ID
        this.collectionRef = firestore().collection(this.getCollection()); // Get collection reference based on the objectType
        this.error = false;                 // Whether or not there's an error in this ObjectManager (hopefully not)
        this.fetched = false;               // Whether or not this ObjectManager has fetched any data    
        this.changes = [];                  // A list of all Changes that this ObjectManager has yet to apply
        this.data = this.getEmptyData();    // Data stored in this ObjectManger (specific to subclass)
    } 
}
```