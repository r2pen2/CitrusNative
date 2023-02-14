import { DBManager, Add, Remove, Set, Update } from "../dbManager";
import { capitalizeFirstLetter } from "../../strings";
import { ObjectManager } from "./objectManager";

/**
 * Object Manager for groups
 */
export class GroupManager extends ObjectManager {

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