class DataStructureManager {
    #globalCounter = 0;
    #rootNode;
    #nodeRegistry = new Map();
    #problemLog = new Map();
    #eventListeners = new Map();

    static #EVENT_IDENTIFIERS = {
        PRE_INSERT: 'preInsertionEvent',
        POST_INSERT: 'postInsertionEvent',
        PRE_DELETE: 'preDeletionEvent',
        POST_DELETE: 'postDeletionEvent',
        KEY_ALTERED: 'keyAlterationEvent',
        VALUE_ALTERED: 'valueAlterationEvent',
        PRE_TYPE_CHANGE_REVERT: 'preTypeReversionEvent',
        POST_TYPE_CHANGE_REVERT: 'postTypeReversionEvent',
        STRUCT_MODIFIED: 'overallStructureModifiedEvent',
        DATA_CORRUPTED: 'dataCorruptionEvent',
        DATA_HEALTHY: 'dataHealthEvent'
    };

    constructor() {
        this.#setupInitialState();
    }

    #setupInitialState() {
        const initialNode = {
            uniqueId: this.#generateUniqueId(),
            content: [],
            ancestor: null,
            childIndexCounter: 0,
            kind: 'object'
        };
        this.#rootNode = initialNode;
        this.#nodeRegistry.set(initialNode.uniqueId, initialNode);
        this.#problemLog.clear();
    }

    #generateUniqueId() {
        return this.#globalCounter++;
    }

    #emitInternalNotification(notificationKind, notificationDetails, isAsynchronous = false) {
        const subscribers = this.#eventListeners.get(notificationKind) || [];
        const notificationObject = {
            detail: notificationDetails,
            haltPropagation: false,
            prevent: function() { this.haltPropagation = true; }
        };

        if (isAsynchronous) {
            setTimeout(() => {
                subscribers.forEach(subscriber => subscriber(notificationObject));
            }, 0);
        } else {
            subscribers.forEach(subscriber => subscriber(notificationObject));
        }

        if (notificationKind !== DataStructureManager.#EVENT_IDENTIFIERS.DATA_CORRUPTED &&
            notificationKind !== DataStructureManager.#EVENT_IDENTIFIERS.DATA_HEALTHY &&
            notificationKind !== DataStructureManager.#EVENT_IDENTIFIERS.STRUCT_MODIFIED
        ) {
            this.#emitInternalNotification(DataStructureManager.#EVENT_IDENTIFIERS.STRUCT_MODIFIED, {
                modifierType: notificationKind,
                ...notificationDetails
            }, isAsynchronous);
        }

        return notificationObject;
    }

    registerNotificationHandler(notificationKind, handlerCallback) {
        if (!Object.values(DataStructureManager.#EVENT_IDENTIFIERS).includes(notificationKind)) {
            console.warn(`Unrecognized notification kind: ${notificationKind}`);
            return;
        }
        if (!this.#eventListeners.has(notificationKind)) {
            this.#eventListeners.set(notificationKind, []);
        }
        this.#eventListeners.get(notificationKind).push(handlerCallback);
    }

    deregisterNotificationHandler(notificationKind, handlerCallback) {
        const handlers = this.#eventListeners.get(notificationKind);
        if (handlers) {
            this.#eventListeners.set(notificationKind, handlers.filter(h => h !== handlerCallback));
        }
    }

    #transcribePrimitive(inputDatum) {
        const datumType = typeof inputDatum;
        if (datumType === "string" || datumType === "boolean" || datumType === "number") {
            return String(inputDatum);
        }
        if (inputDatum === null) {
            return "null";
        }
        if (inputDatum === undefined) {
            return "undefined";
        }
        return inputDatum;
    }

    #reconstructPrimitive(inputString) {
        if (inputString === 'null') return null;
        if (inputString === 'undefined') return undefined;
        if (inputString === 'false') return false;
        if (inputString === 'true') return true;

        const trimmedString = (typeof inputString === 'string' && inputString.trim()) || inputString;
        if (trimmedString === '' || isNaN(Number(trimmedString))) {
            return inputString;
        }

        return parseFloat(trimmedString);
    }

    #locateNode(identifier) {
        return this.#nodeRegistry.get(Number(identifier));
    }

    #isRootItem(node) {
        return node && node.uniqueId === this.#rootNode.uniqueId;
    }

    #canNodeContainChildren(identifier) {
        const node = this.#locateNode(identifier);
        return node && (node.kind === "array" || node.kind === "object");
    }

    #determineNodeContentKind(contentValue) {
        if (contentValue === undefined) {
            return undefined;
        }
        if (contentValue === null || typeof contentValue !== "object") {
            return "string";
        }
        if (Array.isArray(contentValue)) {
            return "array";
        }
        return "object";
    }

    #clearAssociatedIssues(nodeIdentifier) {
        const targetNode = this.#locateNode(nodeIdentifier);
        if (!targetNode) return;

        this.#problemLog.delete(nodeIdentifier);

        if (this.#canNodeContainChildren(nodeIdentifier)) {
            this.#iterateChildren(targetNode.content, (childItem, childKey) => {
                if (typeof childItem === 'object' && childItem !== null && 'uniqueId' in childItem) {
                    this.#clearAssociatedIssues(childItem.uniqueId);
                }
            });
        }
    }

    #iterateChildren(collection, processingCallback) {
        if (Array.isArray(collection)) {
            for (let i = 0; i < collection.length; i++) {
                processingCallback(collection[i], i);
            }
        } else if (typeof collection === "object" && collection !== null) {
            for (const key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    processingCallback(collection[key], key);
                }
            }
        }
    }

    #reassignArrayIndices(arrayContent) {
        if (!Array.isArray(arrayContent)) return;
        arrayContent.forEach((childItem, index) => {
            if (typeof childItem === 'object' && childItem !== null && 'keyName' in childItem) {
                childItem.keyName = String(index);
            }
        });
    }

    #addressDuplicateKeyConflicts(parentContent, removedKey) {
        const currentKeyCounts = new Map();
        const detectedDuplicates = new Set();

        this.#iterateChildren(parentContent, (childItem, key) => {
            if (typeof childItem === 'object' && childItem !== null && 'keyName' in childItem) {
                const currentKey = childItem.keyName;
                currentKeyCounts.set(currentKey, (currentKeyCounts.get(currentKey) || 0) + 1);
                if (currentKeyCounts.get(currentKey) > 1) {
                    detectedDuplicates.add(currentKey);
                }
            }
        });

        this.#iterateChildren(parentContent, (childItem, key) => {
            if (typeof childItem === 'object' && childItem !== null && 'keyName' in childItem) {
                const currentKey = childItem.keyName;
                if (!detectedDuplicates.has(currentKey) && this.#problemLog.has(childItem.uniqueId)) {
                    const existingProblems = this.#problemLog.get(childItem.uniqueId);
                    const filteredProblems = existingProblems.filter(p => !(p.type === 'duplicate-key' && p.key === currentKey));
                    if (filteredProblems.length === 0) {
                        this.#problemLog.delete(childItem.uniqueId);
                    } else {
                        this.#problemLog.set(childItem.uniqueId, filteredProblems);
                    }
                }
            }
        });
    }

    #removeNodeAndDescendantsFromRegistry(nodeIdentifier) {
        const node = this.#nodeRegistry.get(nodeIdentifier);
        if (node) {
            if (this.#canNodeContainChildren(nodeIdentifier)) {
                this.#iterateChildren(node.content, (childItem, childKey) => {
                    if (typeof childItem === 'object' && childItem !== null && 'uniqueId' in childItem) {
                        this.#removeNodeAndDescendantsFromRegistry(childItem.uniqueId);
                    }
                });
            }
            this.#nodeRegistry.delete(nodeIdentifier);
        }
    }

    #constructNewNode(parentIdentifier, proposedKey, initialContent) {
        const parentNode = this.#locateNode(parentIdentifier) || this.#rootNode;

        let resolvedKey = proposedKey;
        if (parentNode.kind === 'array') {
            resolvedKey = String(parentNode.content.length);
        } else if (!resolvedKey && resolvedKey !== 0) {
            resolvedKey = `new_field_${parentNode.childIndexCounter++}`;
            while (parentNode.content.some(child => child.keyName === resolvedKey)) {
                resolvedKey = `new_field_${parentNode.childIndexCounter++}`;
            }
        }

        const newNode = {
            uniqueId: this.#generateUniqueId(),
            keyName: resolvedKey,
            content: initialContent,
            ancestor: parentNode,
            childIndexCounter: 0,
            kind: this.#determineNodeContentKind(initialContent)
        };

        parentNode.content.push(newNode);

        this.#nodeRegistry.set(newNode.uniqueId, newNode);
        return newNode;
    }

    insertEntry(parentIdentifier, proposedKey, proposedValue) {
        const targetAncestor = this.#locateNode(parentIdentifier) || this.#rootNode;

        const preNotification = this.#emitInternalNotification(DataStructureManager.#EVENT_IDENTIFIERS.PRE_INSERT, {
            "parent": targetAncestor,
            "proposedKey": proposedKey,
            "proposedValue": proposedValue
        });

        if (preNotification.haltPropagation) {
            return null;
        }

        const newEntry = this.#constructNewNode(parentIdentifier, proposedKey, proposedValue);

        const postNotificationDetail = {
            "entry": newEntry
        };
        this.#emitInternalNotification(DataStructureManager.#EVENT_IDENTIFIERS.POST_INSERT, postNotificationDetail, true);

        return newEntry;
    }

    deleteEntry(entryIdentifier) {
        const targetEntry = this.#locateNode(entryIdentifier);

        if (targetEntry && !this.#isRootItem(targetEntry)) {
            const ancestorNode = targetEntry.ancestor;
            const ancestorContent = ancestorNode ? ancestorNode.content : this.#rootNode.content;

            const preNotification = this.#emitInternalNotification(DataStructureManager.#EVENT_IDENTIFIERS.PRE_DELETE, {
                "entry": targetEntry,
            });

            if (preNotification.haltPropagation) {
                return null;
            }

            const initialLength = ancestorContent.length;
            const removedKeyName = targetEntry.keyName;
            ancestorNode.content = ancestorContent.filter(item => item.uniqueId !== targetEntry.uniqueId);

            if (ancestorNode.content.length === initialLength) {
                return false;
            }

            this.#clearAssociatedIssues(entryIdentifier);
            this.#removeNodeAndDescendantsFromRegistry(entryIdentifier);

            if (ancestorNode.kind === "array") {
                this.#reassignArrayIndices(ancestorNode.content);
            } else {
                this.#addressDuplicateKeyConflicts(ancestorNode.content, removedKeyName);
            }

            const postNotificationDetail = {
                "identifier": entryIdentifier,
                "ancestor": ancestorNode
            };
            this.#emitInternalNotification(DataStructureManager.#EVENT_IDENTIFIERS.POST_DELETE, postNotificationDetail, true);

            return true;
        }
        return false;
    }

    getRepresentedStructure() {
        return this.#reconstructPlainRepresentation(this.#rootNode);
    }

    #reconstructPlainRepresentation(node) {
        if (!node) return undefined;

        if (node.kind === 'string') {
            return this.#reconstructPrimitive(node.content);
        }

        if (node.kind === 'array') {
            return node.content.map(childNode => this.#reconstructPlainRepresentation(childNode));
        }

        if (node.kind === 'object') {
            const plainObject = {};
            node.content.forEach(childNode => {
                if (childNode.keyName !== undefined) {
                    plainObject[childNode.keyName] = this.#reconstructPlainRepresentation(childNode);
                }
            });
            return plainObject;
        }

        return node.content;
    }
}