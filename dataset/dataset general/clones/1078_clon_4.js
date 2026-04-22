(function (envRoot, factoryFunction) {
    if (typeof define === 'function' && define.amd) {
        define(['someJSLib', 'utilityLib', 'coreFramework', 'xmppConnector', 'dataStore'], function (jQ, _, BB, XM, PS) {
            return (envRoot.XMPPDataHubComponents = factoryFunction(jQ, _, BB, XM, PS));
        });
    } else {
        envRoot.XMPPDataHubComponents = factoryFunction(
            envRoot.jQuery,
            envRoot._,
            envRoot.Backbone,
            envRoot.Strophe,
            envRoot.PubSubStorage
        );
    }
}(this, function (someJSLib, utilityLib, coreFramework, xmppConnector, dataStore) {
    var componentExports = {};

    class SignalBroadcaster {
        constructor() {
            this.eventHandlers = {};
        }

        addListener(eventKey, callbackFunction, contextScope) {
            if (!this.eventHandlers[eventKey]) {
                this.eventHandlers[eventKey] = [];
            }
            this.eventHandlers[eventKey].push({ func: callbackFunction, scope: contextScope });
        }

        removeListener(eventKey, callbackFunction, contextScope) {
            if (!this.eventHandlers[eventKey]) return;
            this.eventHandlers[eventKey] = this.eventHandlers[eventKey].filter(
                entry => !(entry.func === callbackFunction && entry.scope === contextScope)
            );
        }

        emitEvent(eventKey, ...args) {
            if (!this.eventHandlers[eventKey]) return;
            [...this.eventHandlers[eventKey]].forEach(entry => {
                try {
                    entry.func.apply(entry.scope, args);
                } catch (e) {
                    console.error(`Error in event handler for ${eventKey}:`, e);
                }
            });
        }
    }

    componentExports.XMPPEntity = class XMPPEntity extends SignalBroadcaster {
        constructor(initialState = {}) {
            super();
            this.dataAttributes = { ...initialState };
            this.uniqueIdentity = initialState.id || null;
        }

        fetchAttribute(attributeName) {
            return this.dataAttributes[attributeName];
        }

        updateAttributes(newValues) {
            const oldValues = { ...this.dataAttributes };
            let dataChanged = false;
            for (const key in newValues) {
                if (Object.prototype.hasOwnProperty.call(newValues, key) && this.dataAttributes[key] !== newValues[key]) {
                    this.dataAttributes[key] = newValues[key];
                    dataChanged = true;
                }
            }
            if (dataChanged) {
                this.emitEvent('dataModified', this, newValues, oldValues);
            }
            return this;
        }

        performDataSync(operationMethod, options) {
            // This would call the actual XMPP synchronization logic (e.g., Backbone.xmppSync equivalent)
            console.log(`XMPPEntity performDataSync: ${operationMethod} for ${this.uniqueIdentity}`);
            return Promise.resolve(this.dataAttributes);
        }
    };

    componentExports.XMPPNodeManager = class XMPPNodeManager extends SignalBroadcaster {
        constructor(initialEntities = [], configurationOptions = {}) {
            super();
            this.entityRepository = [];
            this.entityMap = new Map();
            this.entityConstructor = configurationOptions.entityType || componentExports.XMPPEntity;
            this.pubsubChannel = null;
            this.channelIdentifier = null;
            this.xmppConnectionLink = null;
            this.payloadContentProcessor = null;

            this.addEntitiesToList(initialEntities, { suppressNotifications: true });

            if (configurationOptions.channelId && configurationOptions.connectionInstance) {
                this.initializeChannelSubscription(
                    configurationOptions.channelId,
                    configurationOptions.connectionInstance,
                    configurationOptions.dataFormatProcessor
                );
            }
        }

        addEntitiesToList(newEntityDataItems, options = {}) {
            const addedEntities = [];
            newEntityDataItems.forEach(data => {
                const newEntity = new this.entityConstructor(data);
                this.entityRepository.unshift(newEntity);
                this.entityMap.set(newEntity.uniqueIdentity, newEntity);
                addedEntities.push(newEntity);
            });
            if (!options.suppressNotifications && addedEntities.length > 0) {
                this.emitEvent('entitiesAddedToCollection', this, addedEntities);
            }
            return addedEntities;
        }

        removeEntitiesFromList(entitiesToRemove, options = {}) {
            const removed = [];
            const entitiesAsArray = Array.isArray(entitiesToRemove) ? entitiesToRemove : [entitiesToRemove];

            entitiesAsArray.forEach(entity => {
                if (entity instanceof this.entityConstructor && this.entityMap.has(entity.uniqueIdentity)) {
                    this.entityRepository = this.entityRepository.filter(e => e.uniqueIdentity !== entity.uniqueIdentity);
                    this.entityMap.delete(entity.uniqueIdentity);
                    removed.push(entity);
                }
            });

            if (!options.suppressNotifications && removed.length > 0) {
                this.emitEvent('entitiesRemovedFromCollection', this, removed);
            }
            return removed;
        }

        retrieveEntityById(idValue) {
            return this.entityMap.get(idValue);
        }

        initializeChannelSubscription(idForChannel, connectionObject, formatForProcessor) {
            if (this.pubsubChannel) {
                connectionObject.PubSub.removeListener(`xmpp:pubsub:item-published:${this.channelIdentifier}`, this.processIncomingPublication, this);
                connectionObject.PubSub.removeListener(`xmpp:pubsub:item-deleted:${this.channelIdentifier}`, this.processIncomingDeletion, this);
            }

            this.channelIdentifier = idForChannel;
            this.xmppConnectionLink = connectionObject;
            this.payloadContentProcessor = formatForProcessor;

            this.pubsubChannel = {
                id: idForChannel,
                connection: connectionObject,
                parseItemContent: (rawPayload) => {
                    if (typeof this.payloadContentProcessor === 'function') {
                        return this.payloadContentProcessor(rawPayload);
                    }
                    if (typeof rawPayload === 'string' && rawPayload.trim().startsWith('<')) {
                        try {
                            const xmlDocument = new DOMParser().parseFromString(rawPayload, 'application/xml');
                            const dataElement = xmlDocument.querySelector('data, item, entry');
                            if (dataElement) {
                                const result = {};
                                for (const attr of dataElement.attributes) {
                                    result[attr.name] = attr.value;
                                }
                                if (Object.keys(result).length === 0 && dataElement.textContent.trim()) {
                                    result.value = dataElement.textContent.trim();
                                }
                                Array.from(dataElement.children).forEach(child => {
                                    result[child.tagName] = child.textContent;
                                });
                                return result;
                            }
                            return {};
                        } catch (e) {
                            console.warn("XML parsing failed in default content processor:", e);
                            return {};
                        }
                    } else if (typeof rawPayload === 'object' && rawPayload !== null) {
                        return rawPayload;
                    }
                    return {};
                }
            };

            connectionObject.PubSub.addListener(`xmpp:pubsub:item-published:${idForChannel}`, this.processIncomingPublication, this);
            connectionObject.PubSub.addListener(`xmpp:pubsub:item-deleted:${idForChannel}`, this.processIncomingDeletion, this);
        }

        processIncomingPublication(eventDataPacket) {
            const itemUniqueId = eventDataPacket.id;
            let itemEntryContent = eventDataPacket.entry;
            const currentCollectionContext = this;

            const contentPromise = new Promise((resolve, reject) => {
                if (itemEntryContent) {
                    resolve(itemEntryContent);
                } else {
                    if (this.xmppConnectionLink && this.xmppConnectionLink.PubSub && typeof this.xmppConnectionLink.PubSub.retrieveNodeItems === 'function') {
                        this.xmppConnectionLink.PubSub.retrieveNodeItems(this.channelIdentifier, { item_ids: [itemUniqueId] })
                            .then(responseFromFetch => {
                                resolve(responseFromFetch && responseFromFetch.entry ? responseFromFetch.entry : responseFromFetch);
                            })
                            .catch(reject);
                    } else {
                        reject(new Error("XMPP connection link not ready to retrieve item content."));
                    }
                }
            });

            contentPromise.then(resolvedPayload => {
                if (!resolvedPayload) {
                    console.warn("No content resolved for published item:", itemUniqueId);
                    return;
                }

                const parsedItemData = currentCollectionContext.pubsubChannel.parseItemContent(resolvedPayload);
                let existingEntity = currentCollectionContext.retrieveEntityById(itemUniqueId);

                if (existingEntity) {
                    currentCollectionContext.removeEntitiesFromList(existingEntity, { suppressNotifications: true });
                    const reAddedEntity = new currentCollectionContext.entityConstructor({ ...parsedItemData, id: itemUniqueId });
                    currentCollectionContext.entityRepository.unshift(reAddedEntity);
                    currentCollectionContext.entityMap.set(reAddedEntity.uniqueIdentity, reAddedEntity);
                    reAddedEntity.updateAttributes(parsedItemData);
                    currentCollectionContext.emitEvent('entityUpdatedInCollection', reAddedEntity, parsedItemData);
                } else {
                    const newEntityRecord = { ...parsedItemData, id: itemUniqueId };
                    const newlyCreatedEntity = new currentCollectionContext.entityConstructor(newEntityRecord);
                    currentCollectionContext.entityRepository.unshift(newlyCreatedEntity);
                    currentCollectionContext.entityMap.set(newlyCreatedEntity.uniqueIdentity, newlyCreatedEntity);
                    currentCollectionContext.emitEvent('entityAddedToCollection', newlyCreatedEntity);
                }
            }).catch(errorDetail => {
                console.error("Failure during incoming publication processing:", errorDetail);
                currentCollectionContext.emitEvent('publicationProcessingError', errorDetail, eventDataPacket);
            });
        }

        processIncomingDeletion(eventDataPacket) {
            const itemUniqueId = eventDataPacket.id;
            const entityForRemoval = this.retrieveEntityById(itemUniqueId);
            if (entityForRemoval) {
                this.removeEntitiesFromList(entityForRemoval);
            }
        }

        performDataSync(operationMethod, options) {
            console.log(`XMPPNodeManager performDataSync: ${operationMethod} for channel ${this.channelIdentifier}`);
            return Promise.resolve(this.entityRepository.map(e => e.dataAttributes));
        }

        retrieveAllEntities() {
            return [...this.entityRepository];
        }

        getEntityCount() {
            return this.entityRepository.length;
        }
    };

    return componentExports;
}));