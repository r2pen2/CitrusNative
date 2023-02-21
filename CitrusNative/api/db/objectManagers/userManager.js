import { DBManager, Add, Remove, Set, Update } from "../dbManager";
import { ObjectManager } from "./objectManager";

/**
 * Object Manager for users
 */
export class UserManager extends ObjectManager {
    
    // Optional data param for loading currentUserManager from localstorage
    constructor(_id, _data) {
        super(DBManager.objectTypes.USER, _id);
        if (_data) {
            this.data = _data;
            this.fetched = true;
        }
    }
    
    fields = {
        FRIENDS: "friends",
        GROUPS: "groups",
        RELATIONS: "relations",
        CREATEDAT: "createdAt",
        DISPLAYNAME: "displayName",
        PHONENUMBER: "phoneNumber",
        EMAIL: "email",
        PFPURL: "pfpUrl",
        NOTIFICATIONS: "notifications",
        MUTEDGROUPS: "mutedGroups",
        MUTEDUSERS: "mutedUsers",
        GROUPINVITATIONS: "groupInvitations",
        INCOMINGFRIENDREQUESTS: "incomingFriendRequests",
        OUTGOINGFRIENDREQUESTS: "outgoingFriendRequests",
    }

    getEmptyData() {
        const empty = {
            friends: [],                    // {array} IDs of friends the user has added
            groups: [],                     // {array} IDs of groups the user is in
            relations: {},                  // {map} Map of userIds and their respective relations
            metadata: {                     // {map} Metadata associated with user
                createdAt: null,            // --- {date} When the user was created
            },  
            personalData: {                 // {map} Personal data associated with user
                displayName: null,          // --- {string} User's display name
                displayNameSearchable: null,// --- {string} User's display name all lowercase
                phoneNumber: null,          // --- {string} User's phone number
                email: null,          // --- {string} User's email
                pfpUrl: null,               // --- {string} URL of user's profile photo
            },
            notifications: [],              // {array} User's notifications 
            mutedGroups: [],                // {array} IDs of groups the user wants to ignore notifications from
            mutedUsers: [],                 // {array} IDs of users the user wants to ignore notifications from
            groupInvitations: [],           // {array} IDs of groups the user has been invited to
            incomingFriendRequests: [],     // {array} IDs of people that have requested to be friends
            outgoingFriendRequests: [],     // {array} IDs of people this user wants to be friends with
        }
        return empty;
    }

    handleUpdate(change, data) {
        switch(change.field) {
            case this.fields.RELATIONS:
                data.relations[change.key] = change.value;
                return data;
            case this.fields.FRIENDS:
            case this.fields.GROUPS:
            case this.fields.CREATEDAT:
            case this.fields.NOTIFICATIONS:
            case this.fields.MUTEDGROUPS:
            case this.fields.MUTEDUSERS:
            case this.fields.DISPLAYNAME:
            case this.fields.PHONENUMBER:
            case this.fields.EMAIL:
            case this.fields.PFPURL:
            case this.fields.GROUPINVITATIONS:
            case this.fields.INCOMINGFRIENDREQUESTS:
            case this.fields.OUTGOINGFRIENDREQUESTS:
            default:
                return data;
        }
    }

    handleAdd(change, data) {
        switch(change.field) {
            case this.fields.FRIENDS:
                if (!data.friends.includes(change.value)) {    
                    data.friends.push(change.value);
                }
                return data;
            case this.fields.GROUPS:
                if (!data.groups.includes(change.value)) {    
                    data.groups.push(change.value);
                }
                return data;
            case this.fields.NOTIFICATIONS:
                data.notifications.push(change.value);
                return data;
            case this.fields.MUTEDGROUPS:
                if (!data.mutedGroups.includes(change.value)) {    
                    data.mutedGroups.push(change.value);
                }
                return data;
            case this.fields.MUTEDUSERS:
                if (!data.mutedUsers.includes(change.value)) {    
                    data.mutedUsers.push(change.value);
                }
                return data;
            case this.fields.GROUPINVITATIONS:
                if (!data.groupInvitations.includes(change.value)) {    
                    data.groupInvitations.push(change.value);
                }
                return data;
            case this.fields.INCOMINGFRIENDREQUESTS:
                if (!data.incomingFriendRequests.includes(change.value)) {    
                    data.incomingFriendRequests.push(change.value);
                }
                return data;
            case this.fields.OUTGOINGFRIENDREQUESTS:
                if (!data.outgoingFriendRequests.includes(change.value)) {    
                    data.outgoingFriendRequests.push(change.value);
                }
                return data;
            case this.fields.RELATIONS:
            case this.fields.CREATEDAT:
            case this.fields.DISPLAYNAME:
            case this.fields.PHONENUMBER:
            case this.fields.EMAIL:
            case this.fields.PFPURL:
            default:
                return data;
        }
    }

    handleRemove(change, data) {
        switch(change.field) {
            case this.fields.FRIENDS:
                data.friends = data.friends.filter(friend => friend !== change.value);
                return data;
            case this.fields.GROUPS:
                data.groups = data.groups.filter(group => group !== change.value);
                return data;
            case this.fields.RELATIONS:
                delete data.relations[change.value];
                return data;
            case this.fields.NOTIFICATIONS:
                delete data.notifications[change.value];
                return data;
            case this.fields.MUTEDGROUPS:
                data.mutedGroups = data.mutedGroups.filter(mg => mg !== change.value);
                return data;
            case this.fields.MUTEDUSERS:
                data.mutedUsers = data.mutedUsers.filter(mu => mu !== change.value);
                return data;
            case this.fields.GROUPINVITATIONS:
                data.groupInvitations = data.groupInvitations.filter(mu => mu !== change.value);
                return data;
            case this.fields.INCOMINGFRIENDREQUESTS:
                data.incomingFriendRequests = data.incomingFriendRequests.filter(mu => mu !== change.value);
                return data;
            case this.fields.OUTGOINGFRIENDREQUESTS:
                data.outgoingFriendRequests = data.outgoingFriendRequests.filter(mu => mu !== change.value);
                return data;
            case this.fields.CREATEDAT:
            case this.fields.DISPLAYNAME:
            case this.fields.PHONENUMBER:
            case this.fields.EMAIL:
            case this.fields.PFPURL:
            default:
                return data;
        }
    }

    handleSet(change, data) {
        switch(change.field) {
            case this.fields.CREATEDAT:
                data.metadata.createdAt = change.value;
                return data;
            case this.fields.DISPLAYNAME:
                data.personalData.displayName = change.value;
                data.personalData.displayNameSearchable = change.value.toLowerCase().replace(" ", "");
                return data;
            case this.fields.PHONENUMBER:
                data.personalData.phoneNumber = change.value;
                return data;
            case this.fields.EMAIL:
                data.personalData.email = change.value;
                return data;
            case this.fields.PFPURL:
                data.personalData.pfpUrl = change.value;
                return data;
            case this.fields.FRIENDS:
            case this.fields.GROUPS:
            case this.fields.RELATIONS:
            case this.fields.NOTIFICATIONS:
            case this.fields.MUTEDGROUPS:
            case this.fields.MUTEDUSERS:
            case this.fields.GROUPINVITATIONS:
            case this.fields.INCOMINGFRIENDREQUESTS:
            case this.fields.OUTGOINGFRIENDREQUESTS:
            default:
                return data;
        }
    }

    async handleGet(field) {
        return new Promise(async (resolve, reject) => {
            if (!this.fetched || !this.data) {
                await super.fetchData();
            }
            switch(field) {
                case this.fields.CREATEDAT:
                    resolve(this.data.metadata.createdAt);
                    break;
                case this.fields.NOTIFICATIONS:
                    resolve(this.data.notifications);
                    break;
                case this.fields.MUTEDGROUPS:
                    resolve(this.data.mutedGroups);
                    break;
                case this.fields.DISPLAYNAME:
                    resolve(this.data.personalData.displayName);
                    break;
                case this.fields.MUTEDUSERS:
                    resolve(this.data.mutedUsers);
                    break;
                case this.fields.PHONENUMBER:
                    resolve(this.data.personalData.phoneNumber);
                    break;
                case this.fields.EMAIL:
                    resolve(this.data.personalData.email);
                    break;
                case this.fields.PFPURL:
                    if (this.data.personalData.pfpUrl) {
                        resolve(this.data.personalData.pfpUrl);
                        break;
                    } else {
                        resolve("https://robohash.org/" + this.documentId);
                        break;
                    }
                case this.fields.FRIENDS:
                    resolve(this.data.friends);
                    break;
                case this.fields.GROUPS:
                    resolve(this.data.groups);
                    break;
                case this.fields.RELATIONS:
                    resolve(this.data.relations);
                    break;
                case this.fields.GROUPINVITATIONS:
                    resolve(this.data.groupInvocations);
                    break;
                case this.fields.INCOMINGFRIENDREQUESTS:
                    resolve(this.data.incomingFriendRequests);
                    break;
                case this.fields.OUTGOINGFRIENDREQUESTS:
                    resolve(this.data.relations);
                    break;
                default:
                    resolve(null);
                    break;
            }
        })
    }

    // ================= Get Operations ================= //

    async getFriends() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.FRIENDS).then((val) => {
                resolve(val);
            })
        })
    }

    async getGroups() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.GROUPS).then((val) => {
                resolve(val);
            })
        })
    }

    async getCreatedAt() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDAT).then((val) => {
                resolve(val);
            })
        })
    }

    async getNotifications() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.NOTIFICATIONS).then((val) => {
                resolve(val);
            })
        })
    }

    async getMutedGroups() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.MUTEDGROUPS).then((val) => {
                resolve(val);
            })
        })
    }

    async getDisplayName() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.DISPLAYNAME).then((val) => {
                resolve(val);
            })
        })
    }

    async getMutedUsers() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.MUTEDUSERS).then((val) => {
                resolve(val);
            })
        })
    }

    async getPhoneNumber() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.PHONENUMBER).then((val) => {
                resolve(val);
            })
        })
    }

    async getEmail() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.EMAIL).then((val) => {
                resolve(val);
            })
        })
    }

    async getPfpUrl() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.PFPURL).then((val) => {
                resolve(val);
            })
        })
    }

    async getRelations() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.RELATIONS).then((val) => {
                resolve(val);
            })
        })
    }

    async getGroupInvitations() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.GROUPINVITATIONS).then((val) => {
                resolve(val);
            })
        })
    }

    async getIncomingFriendRequests() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.INCOMINGFRIENDREQUESTS).then((val) => {
                resolve(val);
            })
        })
    }

    async getOutgoingFriendRequests() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.OUTGOINGFRIENDREQUESTS).then((val) => {
                resolve(val);
            })
        })
    }

    async getRelationWithUser(userId) {
        await this.fetchData();
        return new Promise(async (resolve, reject) => {
            const allRelations = await this.getRelations();
            let found = false;
            for (const key of Object.entries(allRelations)) {
                if (key[0] === userId) {
                    found = true;
                    resolve(new UserRelation(key[1]));
                }
            }
            if (!found) {
                resolve( new UserRelation());
            }
        })
    }

    // ================= Set Operations ================= //
    setCreatedAt(newCreatedAt) {
        const createdAtChange = new Set(this.fields.CREATEDAT, newCreatedAt);
        super.addChange(createdAtChange);
    }

    setDisplayName(newDisplayName) {
        const displayNameChange = new Set(this.fields.DISPLAYNAME, newDisplayName);
        super.addChange(displayNameChange);
    }
    
    setPhoneNumber(newPhoneNumber) {
        const phoneNumberChange = new Set(this.fields.PHONENUMBER, newPhoneNumber);
        super.addChange(phoneNumberChange);
    }
    
    setEmail(newEmail) {
        const emailChange = new Set(this.fields.EMAIL, newEmail);
        super.addChange(emailChange);
    }
    
    setPfpUrl(newProfilePictureUrl) {
        const photoUrlChange = new Set(this.fields.PFPURL, newProfilePictureUrl);
        super.addChange(photoUrlChange);
    }

    // ================= Update Operation ================= // 
    updateRelation(key, relation) {
        const relationUpdate = new Update(this.fields.RELATIONS, key, relation.toJson());
        super.addChange(relationUpdate);
    }

    // ================= Add Operations ================= //

    addFriend(friendId) {
        const friendAddition = new Add(this.fields.FRIENDS, friendId);
        super.addChange(friendAddition);
    }
    
    addGroup(groupId) {
        const groupAddition = new Add(this.fields.GROUPS, groupId);
        super.addChange(groupAddition);
    }

    addNotification(notification) {
        const notificationAddition = new Add(this.fields.NOTIFICATIONS, notification);
        super.addChange(notificationAddition);
    }

    addMutedGroup(groupId) {
        const mutedGroupAddition = new Add(this.fields.MUTEDGROUPS, groupId);
        super.addChange(mutedGroupAddition);
    }

    addMutedUser(userId) {
        const mutedUserAddition = new Add(this.fields.MUTEDUSERS, userId);
        super.addChange(mutedUserAddition);
    }

    addGroupInvitation(groupId) {
        const groupInvitationAddition = new Add(this.fields.GROUPINVITATIONS, groupId);
        super.addChange(groupInvitationAddition);
    }
    
    addIncomingFriendRequest(userId) {
        const incomingFriendRequestAddition = new Add(this.fields.INCOMINGFRIENDREQUESTS, userId);
        super.addChange(incomingFriendRequestAddition);
    }
    
    addOutgoingFriendRequest(userId) {
        const outgoingFriendRequestAddition = new Add(this.fields.OUTGOINGFRIENDREQUESTS, userId);
        super.addChange(outgoingFriendRequestAddition);
    }

    // ================= Remove Operations ================= //
    removeFriend(friendId) {
        const friendRemoval = new Remove(this.fields.FRIENDS, friendId);
        super.addChange(friendRemoval);
    }
    
    removeGroup(groupId) {
        const groupRemoval = new Remove(this.fields.GROUPS, groupId);
        super.addChange(groupRemoval);
    }

    removeRelation(relationUserId) {
        const relationRemoval = new Remove(this.fields.RELATIONS, relationUserId);
        super.addChange(relationRemoval);
    }

    removeNotification(notificaiton) {
        const notificationRemoval = new Remove(this.fields.NOTIFICATIONS, notification);
        super.addChange(notificationRemoval);
    }

    removeMutedGroup(groupId) {
        const mutedGroupRemoval = new Remove(this.fields.MUTEDGROUPS, groupId);
        super.addChange(mutedGroupRemoval);
    }

    removeMutedUser(userId) {
        const mutedUserRemoval = new Remove(this.fields.MUTEDUSERS, userId);
        super.addChange(mutedUserRemoval);
    }

    removeGroupInvitation(groupId) {
        const groupInvitationRemoval = new Remove(this.fields.GROUPINVITATIONS, groupId);
        super.addChange(groupInvitationRemoval);
    }

    removeIncomingFriendRequest(userId) {
        const incomingFriendRequestRemoval = new Remove(this.fields.INCOMINGFRIENDREQUESTS, userId);
        super.addChange(incomingFriendRequestRemoval);
    }

    removeOutgoingFriendRequest(userId) {
        const outgoingFriendRequestRemoval = new Remove(this.fields.OUTGOINGFRIENDREQUESTS, userId);
        super.addChange(outgoingFriendRequestRemoval);
    }


    // ================= Misc. Methods ================= //
    /**
     * Get a user's initials by displayName
     * @returns a promise resolved with the user's initials
     */
    async getInitials() {
        return new Promise(async (resolve, reject) => {
            const fullName = await this.getDisplayName()
            if (fullName) {
                resolve(fullName.charAt(0))
            } else {
                resolve("?");
            }
        })
    }
}

export class UserRelation {
    constructor(_userRelation) {
        this.balances = _userRelation ? _userRelation.balances : {USD: 0};
        this.numTransactions = _userRelation ? _userRelation.numTransactions : 0;
        this.history = _userRelation ? _userRelation.history : [];
        this.lastInteracted = _userRelation ? _userRelation.lastInteracted : new Date();
    }

    addHistory(history) {
        const json = history.toJson();
        const balanceType = json.currency.legal ? "USD" : json.currency.type;
        this.balances[balanceType] = (this.balances[balanceType] ? this.balances[balanceType] : 0) + json.amount;
        this.numTransactions++;
        this.lastInteracted = new Date();
        this.history.unshift(json);
    }

    getHistory() {
        let historyArray = [];
        for (const jsonHistory of this.history) {
            historyArray.push(new UserRelationHistory(jsonHistory));
        }
        return historyArray;
    }

    /**
     * Remove entry for a transactionId from history array
     * @param {string} transactionId id of transaction to erase from history
     */
    removeHistory(transactionId) {
        for (const jsonHistory of this.history) {
            if (jsonHistory.transaction === transactionId) {
                this.history = this.history.filter(entry => entry.transaction !== transactionId);
                // This is the entry to remove
                const balanceType = jsonHistory.currency.legal ? "USD" : jsonHistory.currency.type;
                this.balances[balanceType] = this.balances[balanceType] - jsonHistory.amount;
                break;
            }
        }
        this.numTransactions--;
    }

    toJson() {
        return {
            balances: this.balances,
            numTransactions: this.numTransactions,
            history: this.history,
            lastInteracted: this.lastInteracted,
        }
    }
}

export class UserRelationHistory {
    constructor(_userRelationHistory) {
        this.currency = _userRelationHistory ? _userRelationHistory.currency : {legal: null, type: null};      // "Currency" used in this exchange (USD? BEER? PIZZA?)
        this.amount = _userRelationHistory ? _userRelationHistory.amount : null;                // How many of that currency was used in this exchange
        this.transaction = _userRelationHistory ? _userRelationHistory.transaction : null;      // ID of this exchange's transaction
        this.transactionTitle = _userRelationHistory ? _userRelationHistory.transactionTitle : null;      // Title of this exchange's transaction
        this.group = _userRelationHistory ? _userRelationHistory.group : null;                 // ID of this exchange's group (if applicabale)
        this.date = _userRelationHistory ? _userRelationHistory.date : new Date();              // When this exchange occured
    }

    setTransaction(transactionId) {
        this.transaction = transactionId;
    }

    setTransactionTitle(newTitle) {
        this.transactionTitle = newTitle;
    }

    setCurrencyLegal(newLegal) {
        this.currency.legal = newLegal;
    }

    setCurrencyType(newType) {
        this.currency.type = newType;
    }

    setAmount(amt) {
        this.amount = amt;
    }

    setGroup(groupId) {
        this.group = groupId;
    }

    setDate(date) {
        this.date = date;
    }

    getDate() {
        return this.date;
    }

    getAmount() {
        return this.amount;
    }

    getTransaction() {
        return this.transaction;
    }
    
    toJson() {
        return {
            currency: this.currency,
            amount: this.amount,
            transaction: this.transaction,
            transactionTitle: this.transactionTitle,
            group: this.group,
            date: this.date,
        }
    }
}