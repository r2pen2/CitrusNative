import firestore from "@react-native-firebase/firestore";


/**
 * Superclass for all changes— objects that store fields and values to update on ObjectManagers
 */
class Change {

    /**
     * All possible types for Changes
     */
    static changeTypes = {
        SET: "set",
        REMOVE: "remove",
        ADD: "add",
        UPDATE: "update",
    };

    constructor(_type, _field, _value) {
        this.type = _type;
        this.field = _field;
        this.value = _value;
    }

    /**
     * Detailed toString function
     * @deprecated This is old and pretty much useless
     * @returns Terribly long representation of this change
     */
    toStringVerbose() {
        return 'Change of type "' + this.type + '" on field "' + this.field + '" with value "' + this.value + '"';
    }

    /**
     * Get a string representation of this change
     * @returns String representation of this change
     */
    toString() {
        return this.type + " field: " + this.field + " val: " + this.value;
    }
}

/**
 * A Change object for setting the value of a field
 */
class Set extends Change {
    constructor(_field, _newValue) {
        super(Change.changeTypes.SET, _field, _newValue);
    }
}

/**
 * A Change object for adding an object to an array
 */
class Remove extends Change {
    constructor(_field, _value) {
        super(Change.changeTypes.REMOVE, _field, _value);
    }
}

/**
 * A Change object for removing an object from an array
 */
class Add extends Change {
    constructor(_field, _newValue) {
        super(Change.changeTypes.ADD, _field, _newValue);
    }
}

/**
 * A Change object for updating a key in a map 
 */
class Update extends Change {
    constructor(_field, _newKey, _newValue) {
        super(Change.changeTypes.UPDATE, _field, _newValue);
        this.key = _newKey;
    }
}

/**
 * ObjectManager is an abstract class used to standardize higher-level oprations of database objects
 * @todo This should probably be turned into a typescript file in the future, but that would be a lot of work.
 * @param {string} _objectType type of object to manager
 * @param {string} _documentId id of document on database <- can be ignored if the document doesn't already exist
 */
class ObjectManager {
    constructor(_objectType, _documentId) {
        this.objectType = _objectType;
        this.documentId = _documentId;
        this.docRef = this.documentId ? firestore().collection(this.getCollection()).doc(_documentId) : null;
        this.collectionRef = firestore().collection(this.getCollection());
        this.error = false;
        this.fetched = false;
        this.changes = [];
        this.data = this.getEmptyData();
    }

    /**
     * Add a change to this object
     * @param {Change} change change to add
     */
    addChange(change) {
        this.changed = true;
        this.changes.push(change);
    }

    /**
     * Apply all changes to this object
     * @returns a promise resolved when the changes are applied
     */
    async applyChanges() {
        return new Promise(async (resolve, reject) => {
            if (!this.fetched) {
                await this.fetchData();
            }
            if (this.data) {
                for (const change of this.changes) {
                    switch(change.type) {
                        case Change.changeTypes.ADD:
                            this.data = this.handleAdd(change, this.data);
                            break;
                        case Change.changeTypes.REMOVE:
                            this.data = this.handleRemove(change, this.data);
                            break;
                        case Change.changeTypes.SET:
                            this.data = this.handleSet(change, this.data);
                            break;
                        case Change.changeTypes.UPDATE:
                            this.data = this.handleUpdate(change, this.data);
                            break;
                        default:
                            break;
                    }
                }
                this.changes = [];
                this.changed = false;
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

    /**
     * Get firestore collection for current object type
     * @returns {String} firestore collection for object type
     */
    getCollection() {
        switch(this.objectType) {
            case DBManager.objectTypes.GROUP:
                return "groups";
            case DBManager.objectTypes.TRANSACTION:
                return "transactions";
            case DBManager.objectTypes.USER:
                return "users";
            default:
                return null;
        }
    }

    /**
     * Get this ObjectManager's document id
     * @returns {String} id of this ObjectManager's firestore document
     */
    getDocumentId() {
        return this.documentId;
    }

    /**
     * Get this ObjectManager's type
     * @returns {String} object type
     */
    getObjectType() {
        return this.objectType;
    }

    /**
     * Get a string representation of this ObjectManager
     * @returns {String} string representation of the object
     */
    toString() {
        return 'Object manager of type "' + this.objectType + '" with id "' + this.documentId + '"';
    }

    /**
     * Check if document exists already in the database
     * @returns Whether or not doc exists on DB
     */
    async documentExists() {
        return new Promise(async (resolve, reject) => {
            if (!this.docRef) {
                resolve(false);
            }
            if (!this.documentId) {
                resolve(false);
            }
            const docSnap = await this.docRef.get();
            if (docSnap.exists) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    /**
    * Fetch data from database by document reference
    * @returns {Object} data from document snapshot
    */
    async fetchData() {
        return new Promise(async (resolve) => {
            this.fetched = true;
            if (!this.documentId) {
                this.data = this.getEmptyData();
                resolve(this.getEmptyData());
            } else {
                const docSnap = await this.docRef.get();
                if (docSnap.exists) {
                    this.data = docSnap.data();
                    resolve(this.data);
                } else {
                    this.data = this.getEmptyData();
                    resolve(this.getEmptyData());
                }
            }
        })
    }

    /**
     * Fetch data several times until either timeout or document exists
     * @param {Number} maxAttempts number of times to try fetching data
     * @param {Number} delay delay in milliseconds between attempts
     */
    async fetchDataAndRetry(maxAttempts, delay) {
        async function fetchRecursive(fetchAttempts) {
            return new Promise(async (resolve) => {
                if (!this.docRef) {
                    this.data = this.getEmptyData();
                    resolve(false);
                } else {
                    const docSnap = await this.docRef.get();
                    if (docSnap.exists()) {
                        this.data = docSnap.data();
                        this.fetched = true;
                        resolve(docSnap.data());
                    } else {
                        if (fetchAttempts > maxAttempts) {
                            resolve(null);
                        } else {
                            setTimeout(() => {
                                resolve(fetchRecursive(fetchAttempts + 1));
                            }, delay);
                        }
                    }
                }
            })
        }
        fetchRecursive(0).then((result) => {
            return result;
        });
    }

    /**
     * Get data from ObjectManager.
     * @returns {Object} data
     */
    getData() {
        if (this.data) {
            return this.data;
        } else {
            if (!this.fetched) {
                return this.fetchData();
            }
        }
    }

    /**
     * Push changes on this object to the DB
     * @returns a promise resolved with a DocumentReference pointing to the object in the database
     */
    async push() {
        if (!this.error) {
            // Assuming everything was OK, we push
            return new Promise(async (resolve) => {
                if (this.changed) {   
                    await this.applyChanges();
                    if (this.documentId) {
                        // Document has an ID. Set data and return true                 
                        await this.docRef.set(this.data)
                    } else {
                        const newDoc = await this.collectionRef.add(this.data);
                        this.documentId = newDoc.id;
                        this.docRef = newDoc;
                    }
                    resolve(this.docRef);
                } else {
                    resolve(null);
                }
            })
        } else {
            // Don't push if there was an error
            return null;
        }
    }

    /**
     * Compare method for ObjectManagers
     * @param {ObjectManager} objectManager ObjectManager to compare
     * @returns whether or not the ObjectManagers are equivilant
     */
    equals(objectManager) {
        const matchingTypes = objectManager.getObjectType() === this.getObjectType();
        const matchingIds = objectManager.getObjectId() === this.getObjectId();
        return matchingTypes && matchingIds;
    }

    /**
     * Delete object's document on the database
     * @returns A promise resolved when the document is deleted
     */
    async deleteDocument() {
        return new Promise(async (resolve, reject) => {
            const docExists = await this.documentExists();
            if (!docExists) {
                resolve(false);
            } else {
                await this.docRef.delete();
                resolve(true);
            }
        })
    }

    /**
     * Return whether or not this ObjectManager has fetched from DB yet
     * @returns boolean whether or not this ObjectManager has fetched from DB
     */
    hasFetched() {
        return this.fetched;
    }
}

/**
 * Object Manager for groups
 */
class GroupManager extends ObjectManager {

    constructor(_id, _data) {
        super(DBManager.objectTypes.GROUP, _id);
        if (_data) {
            this.data = _data;
            this.fetched = true;
        }
    }

    fields = {
        CREATEDAT: "createdAt",
        CREATEDBY: "createdBy",
        NAME: "name",
        FAMILYMODE: "familyMode",
        TRANSACTIONS: "transactions",
        USERS: "users",
        BALANCES: "balances",
        INVITECODE: "inviteCode",
        FAMILYMULTIPLIERS: "familyMultipliers",
    }

    getEmptyData() {
        const empty = {
            createdAt: null,        // {date} When the group was created
            createdBy: null,        // {string} ID of user that created the group
            name: null,             // {string} Name of the group
            familyMode: false,      // {bool} Whether or not family mode ison
            transactions: [],       // {array <- string} IDs of every transaction associated with this group
            users: [],              // {array <- string} IDs of every user in this group
            balances: {},           // {map <string, map>} Balances of every user in group
            inviteCode: null,       // -- {string} invitation code for this group
            familyMultipliers: {},  // {map <string, number>} Multiplier for each user when familyMode is true
        }
        return empty;
    }

    async generateInvite() {
        //TODO: Implement this method
    }

    handleAdd(change, data) {
        switch(change.field) {
            case this.fields.TRANSACTIONS:
                if (!data.transactions.includes(change.value)) {    
                    data.transactions.unshift(change.value);
                }
                return data;
            case this.fields.USERS:
                if (!data.users.includes(change.value)) {    
                    data.users.push(change.value);
                }
                return data;
            case this.fields.CREATEDAT:
            case this.fields.CREATEDBY:
            case this.fields.NAME:
            case this.fields.FAMILYMODE:
            case this.fields.INVITECODE:
            case this.fields.FAMILYMULTIPLIERS:
            default:
                return data;
        }
    }

    handleRemove(change, data) {
        switch(change.field) {
            case this.fields.TRANSACTIONS:
                data.transactions = data.transactions.filter(transaction => transaction !== change.value);
                return data;
            case this.fields.USERS:
                data.users = data.users.filter(user => user !== change.value);
                return data;
            case this.fields.CREATEDAT:
            case this.fields.CREATEDBY:
            case this.fields.NAME:
            case this.fields.FAMILYMODE:
            case this.fields.INVITECODE:
            case this.fields.FAMILYMULTIPLIERS:
            default:
                return data;
        }
    }

    handleSet(change, data) {
        switch(change.field) {
            case this.fields.CREATEDAT:
                data.createdAt = change.value;
                return data;
            case this.fields.CREATEDBY:
                data.createdBy = change.value;
                return data;
            case this.fields.NAME:
                data.name = change.value;
                return data;
            case this.fields.FAMILYMODE:
                data.familyMode = change.value;
                return data;
            case this.fields.INVITECODE:
                data.inviteCode = change.value;
                return data;
            case this.fields.TRANSACTIONS:
            case this.fields.USERS:
            case this.fields.BALANCES:
            case this.fields.FAMILYMULTIPLIERS:
            default:
                return data;
        }
    }

    handleUpdate(change, data) {
        switch(change.field) {
            case this.fields.BALANCES:
                data.balances[change.key] = change.value;
                return data;
            case this.fields.FAMILYMULTIPLIERS:
                data.familyMultipliers = [change.key] = change.value;
                return data;
            case this.fields.CREATEDAT:
            case this.fields.CREATEDBY:
            case this.fields.NAME:
            case this.fields.FAMILYMODE:
            case this.fields.INVITECODE:
            case this.fields.TRANSACTIONS:
            case this.fields.USERS:
                return data;
            default:
                return data;
        }
    }

    async handleGet(field) {
        return new Promise(async (resolve, reject) => {
            if (!this.fetched) {
                await super.fetchData();
            }
            switch(field) {
                case this.fields.CREATEDAT:
                    resolve(this.data.createdAt);
                    break;
                case this.fields.CREATEDBY:
                    resolve(this.data.createdBy);
                    break;
                case this.fields.NAME:
                    resolve(this.data.name);
                    break;
                case this.fields.FAMILYMODE:
                    resolve(this.data.familyMode);
                    break;
                case this.fields.TRANSACTIONS:
                    resolve(this.data.transactions);
                    break;
                case this.fields.USERS:
                    resolve(this.data.users);
                    break;
                case this.fields.BALANCES:
                    resolve(this.data.balances);
                    break;
                case this.fields.INVITECODE:
                    resolve(this.data.inviteCode);
                    break;
                case this.fields.FAMILYMULTIPLIERS:
                    resolve(this.data.familyMultiplyers);
                    break;
                default:
                    resolve(null);
                    break;
            }
        })
    }

    // ================= Get Operations ================= //
    async getCreatedAt() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDAT).then((val) => {
                resolve(val);
            })
        })
    }

    async getCreatedBy() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDBY).then((val) => {
                resolve(val);
            })
        })
    }

    async getName() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.NAME).then((val) => {
                resolve(val);
            })
        })
    }

    async getFamilyMode() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.FAMILYMODE).then((val) => {
                resolve(val);
            })
        })
    }

    async getTransactions() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.TRANSACTIONS).then((val) => {
                resolve(val);
            })
        })
    }

    async getUsers() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.USERS).then((val) => {
                resolve(val);
            })
        })
    }

    async getInviteCode() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.INVITECODE).then((val) => {
                resolve(val);
            })
        })
    }
    
    async getBalances() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.BALANCES).then((val) => {
                resolve(val);
            })
        })
    }
    
    async getFamilyMultipliers() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.FAMILYMULTIPLIERS).then((val) => {
                resolve(val);
            })
        })
    }
    
    async getUserBalance(userId) {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.BALANCES).then((val) => {
                resolve(val[userId] ? val[userId] : {});
            })
        })
    }

    async getUserFamilyMultiplier(userId) {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.FAMILYMULTIPLIERS).then((val) => {
                resolve(val[userId] ? val[userId] : {});
            })
        })
    }

    /**
     * Get the number of users in a group
     * @returns {number} number of users in the group
     */
    async getMemberCount() {
        return new Promise(async (resolve, reject) => {
            const groupMembers = await this.getUsers();
            resolve(groupMembers.length);
        })
    }

    // ================= Set Operations ================= //
    setCreatedAt(newCreatedAt) {
        const createdAtChange = new Set(this.fields.CREATEDAT, newCreatedAt);
        super.addChange(createdAtChange);
    }
    
    setCreatedBy(newCreatedBy) {
        const createdByChange = new Set(this.fields.CREATEDBY, newCreatedBy);
        super.addChange(createdByChange);
    }
    
    setName(newName) {
        const nameChange = new Set(this.fields.NAME, newName);
        super.addChange(nameChange);
    }

    setFamilyMode(newFamilyMode) {
        const familyModeChange = new Set(this.fields.FAMILYMODE, newFamilyMode);
        super.addChange(familyModeChange);
    }

    setInviteCode(newInviteCode) {
        const inviteCodeChange = new Set(this.fields.INVITECODE, newInviteCode);
        super.addChange(inviteCodeChange );
    }

    // ================= Add Operations ================= //
    addTransaction(transactionId) {
        const transactionAddition = new Add(this.fields.TRANSACTIONS, transactionId);
        super.addChange(transactionAddition);
    }

    addUser(userId) {
        const userAddition = new Add(this.fields.USERS, userId);
        super.addChange(userAddition);
    }

    addInvitation(invitationId) {
        const invitationAddition = new Add(this.fields.INVITATIONS, invitationId);
        super.addChange(invitationAddition);
    }

    // ================= Remove Operations ================= //
    removeTransaction(transactionId) {
        const transactionRemoval = new Remove(this.fields.TRANSACTIONS, transactionId);
        super.addChange(transactionRemoval);
    }

    removeUser(userId) {
        const userRemoval = new Remove(this.fields.USERS, userId);
        super.addChange(userRemoval);
    }

    // ================= Update Operation ================= // 
    updateBalance(key, balance) {
        const balanceUpdate = new Update(this.fields.BALANCES, key, balance);
        super.addChange(balanceUpdate);
    }

    updateFamilyMultiplier(key, multiplier) {
        const familyMultiplierUpdate = new Update(this.fields.FAMILYMULTIPLIERS, key, multiplier);
        super.addChange(familyMultiplierUpdate);
    }


    // ================= Misc Operation ================= //
    async cleanDelete() {
        return new Promise(async (resolve, reject) => {
            await this.deleteDocument();
            resolve(true);
        })
    }
}

/**
 * Object Manager for users
 */
class UserManager extends ObjectManager {
    
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
        TRANSACTIONS: "transactions",
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
            transactions: [],               // {array} IDs of all transactions user was in
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
            case this.fields.TRANSACTIONS:
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
            case this.fields.TRANSACTIONS:
                if (!data.transactions.includes(change.value)) {    
                    data.transactions.push(change.value);
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
            case this.fields.TRANSACTIONS:
                data.transactions = data.transactions.filter(transaction => transaction !== change.value);
                return data;
            case this.fields.RELATIONS:
                delete data.relations[change.value];
                return data;
            case this.fields.NOTIFICATIONS:
                data.notifications = data.notifications.filter(n => (n.type !== change.value.type || n.target !== change.value.target || n.message !== change.value.message))
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
            case this.fields.NOTIFICATIONS:
                data.notifications = change.value;
                return data;
            case this.fields.FRIENDS:
            case this.fields.GROUPS:
            case this.fields.RELATIONS:
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
                case this.fields.TRANSACTIONS:
                    resolve(this.data.transactions);
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

    async getTransactions() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.TRANSACTIONS).then((val) => {
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
    
    setNotifications(newNotifications) {
        const notificationsChange = new Set(this.fields.NOTIFICATIONS, newNotifications);
        super.addChange(notificationsChange);
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
    
    addTransaction(transactionId) {
        const transactionAddition = new Add(this.fields.TRANSACTIONS, transactionId);
        super.addChange(transactionAddition);
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
    
    removeTransactions(transactionId) {
        const transactionRemoval = new Remove(this.fields.TRANSACTIONS, transactionId);
        super.addChange(transactionRemoval);
    }

    removeRelation(relationUserId) {
        const relationRemoval = new Remove(this.fields.RELATIONS, relationUserId);
        super.addChange(relationRemoval);
    }

    removeNotification(notification) {
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

/**
 * Object Manager for transactions
 */
class TransactionManager extends ObjectManager {
    constructor(_id, _data) {
        super(DBManager.objectTypes.TRANSACTION, _id);
        if (_data) {
            this.data = _data;
            this.fetched = true;
        }
    }

    fields = {
        CREATEDBY: "createdBy",
        CURRENCYLEGAL: "currencyLegal",
        CURRENCYTYPE: "currencyType",
        AMOUNT: "amount",
        DATE: "date",
        TITLE: "title",
        BALANCES: "balances",
        GROUP: "group",
        SETTLEGROUPS: "settleGroups",
        ISIOU: "isIOU",
    }

    getEmptyData() {
        const empty = {
            currency: {legal: null, type: null},           // {PaymentType} What type of currency was used (BEER, PIZZA, USD)
            amount: null,           // {number} How many of that currency was used 
            date: new Date(),       // {date} Timestamp of transaction
            title: null,            // {string} Title of transaction
            balances: {},           // {map<string, number>} Map relating usedIds to how much they are owed/owe for this transaction
            createdBy: null,        // {string} ID of user that created this transaction
            group: null,            // {number} ID of this transaction's group (if applicable)
            settleGroups: {},     // {map<string, number} Map relating groupIds to how much they relate to this settlement (if applicable)
            isIOU: null,     // {boolean} Whether or not this transaction was an IOU
        }
        return empty;
    }

    handleAdd(change, data) {
        switch(change.field) {
            case this.fields.CURRENCYLEGAL:
            case this.fields.CURRENCYTYPE:
            case this.fields.CREATEDBY:
            case this.fields.AMOUNT:
            case this.fields.DATE:
            case this.fields.TITLE:
            case this.fields.BALANCES:
            case this.fields.GROUP:
            case this.fields.SETTLEGROUPS:
            case this.fields.ISIOU:
            default:
                return data;
        }
    }

    handleRemove(change, data) {
        switch(change.field) {
            case this.fields.CURRENCYLEGAL:
            case this.fields.CURRENCYTYPE:
            case this.fields.CREATEDBY:
            case this.fields.AMOUNT:
            case this.fields.DATE:
            case this.fields.TITLE:
            case this.fields.BALANCES:
            case this.fields.GROUP:
            case this.fields.ISIOU:
            case this.fields.SETTLEGROUPS:
            default:
                return data;
        }
    }

    handleSet(change, data) {
        switch(change.field) {
            case this.fields.CURRENCYLEGAL:
                data.currency.legal = change.value;
                return data;
            case this.fields.CURRENCYTYPE:
                data.currency.type = change.value;
                return data;
            case this.fields.CREATEDBY:
                data.createdBy = change.value;
                return data;
            case this.fields.AMOUNT:
                data.amount = change.value;
                return data;
            case this.fields.DATE:
                data.date = change.value;
                return data;
            case this.fields.TITLE:
                data.title = change.value;
                return data;
            case this.fields.GROUP:
                data.group = change.value;
                return data;
            case this.fields.ISIOU:
                data.isIOU = change.value;
                return data;
            case this.fields.BALANCES:
            case this.fields.SETTLEGROUPS:
            default:
                return data;
        }
    }

    async handleGet(field) {
        return new Promise(async (resolve, reject) => {
            if (!this.fetched) {
                await super.fetchData();
            }
            switch(field) {
                case this.fields.CURRENCYLEGAL:
                    resolve(this.data.currency.legal);
                    break;
                case this.fields.CURRENCYTYPE:
                    resolve(this.data.currency.type);
                    break;
                case this.fields.CREATEDBY:
                    resolve(this.data.createdBy);
                    break;
                case this.fields.AMOUNT:
                    resolve(this.data.amount);
                    break;
                case this.fields.DATE:
                    resolve(this.data.date);
                    break;
                case this.fields.TITLE:
                    resolve(this.data.title);
                    break;
                case this.fields.GROUP:
                    resolve(this.data.group);
                    break;
                case this.fields.BALANCES:
                    resolve(this.data.balances);
                    break;
                case this.fields.SETTLEGROUPS:
                    resolve(this.data.settleGroups);
                    break;
                case this.fields.ISIOU:
                    resolve(this.data.isIOU);
                    break;
                default:
                    resolve(null);
                    break;
            }
        })
    }
    

    handleUpdate(change, data) {
        switch(change.field) {
            case this.fields.BALANCES:
                data.balances[change.key] = change.value;
                return data;
            case this.fields.SETTLEGROUPS:
                data.settleGroups[change.key] = change.value;
                return data;
            case this.fields.CURRENCYLEGAL:
            case this.fields.CURRENCYTYPE:
            case this.fields.CREATEDBY:
            case this.fields.AMOUNT:
            case this.fields.DATE:
            case this.fields.TITLE:
            case this.fields.GROUP:
            case this.fields.ISIOU:
            default:
                return data;
        }
    }

    // ================= Get Operations ================= //

    async getCurrencyLegal() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).currency.legal;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CURRENCYLEGAL).then((val) => {
                resolve(val);
            })
        })
    }

    async getCurrencyType() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).currency.type;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CURRENCYTYPE).then((val) => {
                resolve(val);
            })
        })
    }

    async getCreatedBy() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).createdBy;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDBY).then((val) => {
                resolve(val);
            })
        })
    }

    async getAmount() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).amount;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.AMOUNT).then((val) => {
                resolve(val);
            })
        })
    }

    async getDate() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).date;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.DATE).then((val) => {
                resolve(val);
            })
        })
    }

    async getTitle() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).title;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.TITLE).then((val) => {
                resolve(val);
            })
        })
    }

    async getGroup() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).group;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.GROUP).then((val) => {
                resolve(val);
            })
        })
    }

    async getBalances() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).balances;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.BALANCES).then((val) => {
                resolve(val);
            })
        })
    }

    async getSettleGroups() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).settleGroups;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.SETTLEGROUPS).then((val) => {
                resolve(val);
            })
        })
    }

    async getIsIOU() {
        if (SessionManager.getSavedTransaction(this.documentId)) {
            return SessionManager.getSavedTransaction(this.documentId).isIOU;
        }
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.ISIOU).then((val) => {
                resolve(val);
            })
        })
    }
    
    // ================= Set Operations ================= //

    setCurrencyLegal(newCurrencyLegal) {
        const currencyLegalChange = new Set(this.fields.CURRENCYLEGAL, newCurrencyLegal);
        super.addChange(currencyLegalChange);
    }

    setCurrencyType(newCurrencyType) {
        const currencyTypeChange = new Set(this.fields.CURRENCYTYPE, newCurrencyType);
        super.addChange(currencyTypeChange);
    }

    setCreatedBy(newCreatedBy) {
        const createdByChange = new Set(this.fields.CREATEDBY, newCreatedBy);
        super.addChange(createdByChange);
    }

    setAmount(newAmount) {
        const amountChange = new Set(this.fields.AMOUNT, newAmount);
        super.addChange(amountChange);
    }
    
    setDate(newDate) {
        const dateChange = new Set(this.fields.DATE, newDate);
        super.addChange(dateChange);
    }
    
    setTitle(newTitle) {
        const titleChange = new Set(this.fields.TITLE, newTitle);
        super.addChange(titleChange);
    }
    
    setGroup(newGroup) {
        const groupChange = new Set(this.fields.GROUP, newGroup);
        super.addChange(groupChange);
    }

    setIsIOU(newIsIOU) {
        const isIOUChange = new Set(this.fields.ISIOU, newIsIOU);
        super.addChange(isIOUChange);
    }

    // ================= Add Operations ================= //
    // ================= Remove Operations ================= //
    // ================= Update Operations ================= //
    
    updateBalance(key, relation) {
        const balanceUpdate = new Update(this.fields.BALANCES, key, relation);
        super.addChange(balanceUpdate);
    }

    updateSettleGroup(key, amount) {
        const settleGroupUpdate = new Update(this.fields.SETTLEGROUPS, key, amount);
        super.addChange(settleGroupUpdate);
    }
    
    // ================= Sub-Object Functions ================= //

    /**
     * Get group manager for this transaction
     * @returns a promise resolved with the GroupManager or null if there's no group attached to this transaction
     */
    async getGroupManager() {
        return new Promise(async (resolve, reject) => {
            const group = await this.getGroup();
            if (group) {
                resolve(DBManager.getGroupManager(group));
            } else {
                resolve(null);
            }
        })
    }

    /**
     * Delete transaction from database and remove it from all user histories
     * @returns a promise resolved with a boolean if delete went through
     */
    async cleanDelete() {
        return new Promise(async (resolve, reject) => {
            for (const balanceKey of Object.entries(await this.getBalances())) {
                // Get a user manager
                const transactionUserManager = DBManager.getUserManager(balanceKey[0]);
                // Loop through all user relations for histories that have this transaction
                const relations = await transactionUserManager.getRelations();
                for (const relationKey of Object.entries(relations)) {
                    const relation = new UserRelation(relationKey[1]);
                    relation.removeHistory(this.documentId); // Transaction matches id! Remove history.
                    transactionUserManager.updateRelation(relationKey[0], relation); // Update relation
                }
                const settleGroups = await this.getSettleGroups();
                const curr = await this.getCurrencyType();
                const transactionAmount = await this.getAmount();
                for (const k of Object.keys(settleGroups)) {
                    const groupManager = DBManager.getGroupManager(k);
                    groupManager.removeTransaction(this.documentId);
                    // Update balances in group as well
                    const groupBalances = await groupManager.getBalances();
                    for (const k of Object.keys(groupBalances)) {
                        const userBalance = groupBalances[k];
                        userBalance[curr] = userBalance[curr] - transactionAmount;
                        groupManager.updateBalance(k, userBalance);
                    }
                    await groupManager.push();
                }
                const pushed = await transactionUserManager.push();
                if (!pushed) {
                    resolve(false);
                }
            }
            // If we made it this far, we succeeded
            await this.deleteDocument();
            resolve(true);
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

/**
 * DBManager is a database management factory object. It generates ObjectManagers for whichever object type it may need.
 */
export class DBManager {


    /**
     * All possible types for ObjectManagers
     */
    static objectTypes = {
        GROUP: "group",
        TRANSACTION: "transaction",
        USER: "user",
    }

    /**
    * Generates a random id string of a given length
    * @param {Number} length length of id to be created 
    * @returns {String} generated id
    */
    static generateId(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    }

    /**
     * Generates a random word in English for building group inviteCodes
     * @returns random English word
     */
    static async getRandomWord() {
        const length = Math.floor(Math.random() * 4) + 4;
        return new Promise((resolve, reject) => {
            fetch(`https://random-word-api.herokuapp.com/word?length=${length}`).then(res => {
            res.json().then(jsonRes => {
                resolve(jsonRes[0]);
            })
        })
        })
    }

    /**
     * Get object managers of correct type
     */
    static getGroupManager(id, data) {
        return new GroupManager(id, data);
    }
    static getTransactionManager(id) {
        return new TransactionManager(id);
    }
    static getUserManager(id, data) {
        return new UserManager(id, data);
    }
}
