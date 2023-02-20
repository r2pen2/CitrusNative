import firestore from "@react-native-firebase/firestore";
import { Change, DBManager } from "../dbManager";

/**
 * ObjectManager is an abstract class used to standardize higher-level oprations of database objects
 * @todo This should probably be turned into a typescript file in the future, but that would be a lot of work.
 * @param {string} _objectType type of object to manager
 * @param {string} _documentId id of document on database <- can be ignored if the document doesn't already exist
 */
export class ObjectManager {
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