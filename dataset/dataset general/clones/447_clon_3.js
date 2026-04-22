/**
 * @fileoverview EntitySyncAgent: Manages synchronization of data entities between a local cache
 *               (Lawnchair) and a remote backend API.
 *               This module provides methods for CRUD operations locally, state management,
 *               and remote data fetching/persisting.
 * @version 1.1.0
 */

// Define the main data synchronization agent constructor.
// It initializes the local data store and sets up the remote API endpoint.
var EntitySyncAgent = function(apiBaseUrl) {
    // Basic validation for the remote API endpoint.
    if (typeof apiBaseUrl !== 'string' || apiBaseUrl.trim() === '') {
        console.error("EntitySyncAgent: Invalid or missing API base URL provided.");
        // We could throw an error here, but for robustness, we'll proceed with a potentially empty URL.
    }

    /**
     * @private
     * @type {Lawnchair} The local data cache instance.
     *                   Using 'entityStore' as the name for the local cache.
     */
    this.localCache = new Lawnchair({ name: 'entityStore', adapter: 'dom' }); // Explicitly define adapter.

    /**
     * @private
     * @type {string} The base URL for the remote API service.
     */
    this.apiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl; // Ensure no trailing slash.

    // A small initialization message for debugging purposes.
    console.debug(`EntitySyncAgent initialized with API base: ${this.apiBaseUrl}`);
};

// Define the prototype methods for the EntitySyncAgent.
EntitySyncAgent.prototype = {

    /**
     * Retrieves a single entity from the local cache using its identifier.
     * @param {string} entityIdentifier - The unique key for the entity.
     * @param {function(Object|null)} onCompletion - Callback function invoked with the retrieved entity or null.
     */
    retrieveOne: function(entityIdentifier, onCompletion) {
        if (typeof onCompletion !== 'function') {
            console.warn("retrieveOne: No completion handler provided.");
            return;
        }
        this.localCache.get(entityIdentifier, onCompletion);
    },

    /**
     * Removes an entity from the local cache entirely.
     * This is a complete deletion, not just marking for remote deletion.
     * @param {string} entityIdentifier - The unique key of the entity to clear.
     * @param {function()} [onCompletion] - Optional callback function.
     */
    clearEntry: function(entityIdentifier, onCompletion) {
        this.localCache.remove(entityIdentifier, onCompletion);
    },

    /**
     * Completely wipes all data from the local cache. Use with extreme caution.
     * @param {function()} [onCompletion] - Optional callback function.
     */
    resetStore: function(onCompletion) {
        console.warn("resetStore: All local data is being permanently deleted!");
        this.localCache.nuke(onCompletion);
    },

    /**
     * Marks an existing entity in the local cache as 'deleted' for future synchronization.
     * It first retrieves the entity to ensure it exists before updating its state.
     * @param {string} entityIdentifier - The unique key of the entity to mark.
     * @param {function()} [onCompletion] - Optional callback function.
     */
    markForDeletion: function(entityIdentifier, onCompletion) {
        const selfRef = this;
        selfRef.localCache.get(entityIdentifier, function(cachedItem) {
            if (cachedItem && cachedItem.key === entityIdentifier) {
                // Update the state of the existing item to 'deleted'.
                // Preserve original data but add a deletion timestamp for auditing.
                cachedItem.state = "deleted";
                cachedItem.deletedAt = new Date().toISOString();
                selfRef.localCache.save(cachedItem, onCompletion);
            } else {
                console.info(`markForDeletion: Entity with key '${entityIdentifier}' not found in cache.`);
                if (typeof onCompletion === 'function') {
                    onCompletion(null); // Indicate that no item was found/modified.
                }
            }
        });
    },

    /**
     * Generates a unique key for an entity based on its primary key and model type.
     * @param {Object} entityPayload - The entity object, expected to have `pk` and `model` properties.
     * @returns {string} The generated unique key.
     */
    generateEntityKey: function(entityPayload) {
        if (!entityPayload || typeof entityPayload.pk === 'undefined' || typeof entityPayload.model !== 'string') {
            console.error("generateEntityKey: Invalid entity payload for key generation.", entityPayload);
            return 'invalid_key_' + Date.now(); // Return a fallback key to prevent errors.
        }
        return `${entityPayload.model}#${entityPayload.pk}`; // Using '#' as a separator.
    },

    /**
     * Private helper to save an entity to the local cache with a specific state.
     * @param {Object} entityPayload - The entity data to save.
     * @param {string} state - The synchronization state (e.g., 'created', 'updated', 'synced').
     * @param {function()} [onCompletion] - Optional callback function.
     */
    _saveEntityWithState: function(entityPayload, state, onCompletion) {
        if (!entityPayload || typeof entityPayload !== 'object') {
            console.error("_saveEntityWithState: Invalid entity payload provided.", entityPayload);
            if (typeof onCompletion === 'function') onCompletion(null);
            return;
        }
        const entityKey = this.generateEntityKey(entityPayload);
        const dataToCache = {
            key: entityKey,
            data: entityPayload,
            state: state,
            lastModified: new Date().toISOString() // Add a modification timestamp.
        };
        this.localCache.save(dataToCache, onCompletion);
    },

    /**
     * Inserts a new entity into the local cache with a 'created' state.
     * @param {Object} entityPayload - The entity data to be created.
     * @param {function()} [onCompletion] - Optional callback function.
     */
    insertLocal: function(entityPayload, onCompletion) {
        this._saveEntityWithState(entityPayload, 'created', onCompletion);
    },

    /**
     * Updates an existing entity in the local cache with an 'updated' state.
     * @param {Object} entityPayload - The entity data with updated fields.
     * @param {function()} [onCompletion] - Optional callback function.
     */
    updateLocal: function(entityPayload, onCompletion) {
        // Ensure the entityPayload has a key or can generate one.
        if (!entityPayload.key) {
            entityPayload.key = this.generateEntityKey(entityPayload);
        }
        this._saveEntityWithState(entityPayload, 'updated', onCompletion);
    },

    /**
     * Queries the local cache for entities matching a given condition.
     * @param {string|function(Object): boolean} searchCondition - A string representing a condition (e.g., 'item.state == "created"')
     *                                                              or a function to filter items.
     * @param {function(Array<Object>)} onCompletion - Callback function invoked with an array of matching entities.
     */
    queryLocal: function(searchCondition, onCompletion) {
        if (typeof onCompletion !== 'function') {
            console.warn("queryLocal: No completion handler provided.");
            return;
        }
        this.localCache.find(searchCondition, onCompletion);
    },

    /**
     * Retrieves all entities in the local cache that are marked as 'created'.
     * @param {function(Array<Object>)} onCompletion - Callback with created entities.
     */
    getPendingCreations: function(onCompletion) {
        this.queryLocal('item.state == "created"', onCompletion);
    },

    /**
     * Retrieves all entities in the local cache that are marked as 'updated'.
     * @param {function(Array<Object>)} onCompletion - Callback with updated entities.
     */
    getPendingUpdates: function(onCompletion) {
        this.queryLocal('item.state == "updated"', onCompletion);
    },

    /**
     * Retrieves all entities in the local cache that are marked as 'deleted'.
     * @param {function(Array<Object>)} onCompletion - Callback with deleted entities.
     */
    getPendingDeletions: function(onCompletion) {
        this.queryLocal('item.state == "deleted"', onCompletion);
    },

    /**
     * Retrieves all entities in the local cache that are marked as 'synced'.
     * @param {function(Array<Object>)} onCompletion - Callback with synced entities.
     */
    getSyncedEntities: function(onCompletion) {
        this.queryLocal('item.state == "synced"', onCompletion);
    },

    /**
     * Iterates over every entity in the local cache.
     * @param {function(Object)} iteratorFunction - Function to call for each entity.
     */
    iterateAll: function(iteratorFunction) {
        this.localCache.each(iteratorFunction);
    },

    /**
     * Private helper to construct a full remote API URL.
     * @param {string} path - The specific API endpoint path (e.g., '/get/', '/save/').
     * @returns {string} The complete URL.
     */
    _generateRemoteUrl: function(path) {
        return `${this.apiBaseUrl}${path}`;
    },

    /**
     * Private helper to handle common AJAX error scenarios.
     * @param {JQueryXHR} jqXHR - The jQuery XMLHttpRequest object.
     * @param {string} textStatus - A string describing the type of error that occurred.
     * @param {string} errorThrown - Optional exception object, if one occurred.
     * @param {function()} [onCompletion] - Optional completion handler to call on error.
     */
    _handleAjaxError: function(jqXHR, textStatus, errorThrown, onCompletion) {
        console.error(`AJAX Error: ${textStatus}, ${errorThrown}`, jqXHR);
        if (typeof onCompletion === 'function') {
            // Pass an error indicator or the error object to the completion handler.
            onCompletion(new Error(`Remote operation failed: ${textStatus}`));
        }
    },

    /**
     * Fetches entities from the remote API and synchronizes them with the local cache.
     * New entities are created, existing ones are updated and marked as 'synced'.
     * @param {function()} [onCompletion] - Optional callback function to execute after all records are processed.
     */
    fetchRemoteEntities: function(onCompletion) {
        const selfRef = this;
        const remoteFetchUrl = selfRef._generateRemoteUrl('/get/');

        $.getJSON(remoteFetchUrl)
            .done(function(records) {
                if (!Array.isArray(records)) {
                    console.warn("fetchRemoteEntities: Remote service returned non-array data.", records);
                    if (typeof onCompletion === 'function') onCompletion();
                    return;
                }

                if (records.length === 0) {
                    console.info("fetchRemoteEntities: No records received from remote.");
                    if (typeof onCompletion === 'function') onCompletion();
                    return;
                }

                let processedCount = 0;
                const totalRecords = records.length;

                records.forEach(function(remoteRecord) {
                    const recordKey = selfRef.generateEntityKey(remoteRecord);
                    selfRef.localCache.get(recordKey, function(existingLocalItem) {
                        if (existingLocalItem && existingLocalItem.key === recordKey) {
                            // Entity exists locally, update it and mark as synced.
                            existingLocalItem.data = remoteRecord;
                            existingLocalItem.state = 'synced';
                            existingLocalItem.lastSynced = new Date().toISOString();
                            selfRef.localCache.save(existingLocalItem, () => {
                                processedCount++;
                                if (processedCount === totalRecords && typeof onCompletion === 'function') {
                                    onCompletion();
                                }
                            });
                        } else {
                            // Entity is new, create it locally and mark as synced.
                            selfRef._saveEntityWithState(remoteRecord, 'synced', () => {
                                processedCount++;
                                if (processedCount === totalRecords && typeof onCompletion === 'function') {
                                    onCompletion();
                                }
                            });
                        }
                    });
                });
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                selfRef._handleAjaxError(jqXHR, textStatus, errorThrown, onCompletion);
            });
    },

    /**
     * Dispatches a request to the remote API to delete a specific entity.
     * @param {Object} entityPayload - The entity object containing the data to be deleted (e.g., `data.pk`).
     * @param {function()} [onCompletion] - Optional callback function.
     */
    dispatchRemoteDeletion: function(entityPayload, onCompletion) {
        const selfRef = this;
        const deleteUrl = selfRef._generateRemoteUrl('/delete/');

        if (!entityPayload || !entityPayload.data || typeof entityPayload.data.pk === 'undefined') {
            console.error("dispatchRemoteDeletion: Invalid entity payload for remote deletion.", entityPayload);
            if (typeof onCompletion === 'function') onCompletion(new Error("Invalid entity payload"));
            return;
        }

        $.ajax({
            type: 'POST',
            url: deleteUrl,
            data: {
                "primary_key": entityPayload.data.pk // Renamed from "key" to be more explicit.
            },
            success: function(response) {
                console.log("Remote deletion successful:", response);
                // Optionally, completely remove from local cache after successful remote deletion.
                selfRef.clearEntry(selfRef.generateEntityKey(entityPayload.data), onCompletion);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                selfRef._handleAjaxError(jqXHR, textStatus, errorThrown, onCompletion);
            }
        });
    },

    /**
     * Dispatches a request to the remote API to save (create or update) an entity.
     * Upon successful remote save, the local entity's state is updated to 'synced'.
     * @param {Object} entityPayload - The entity object to be saved.
     * @param {function()} [onCompletion] - Optional callback function.
     */
    dispatchRemoteSave: function(entityPayload, onCompletion) {
        const selfRef = this;
        const saveUrl = selfRef._generateRemoteUrl('/save/');

        if (!entityPayload || !entityPayload.data || typeof entityPayload.data.pk === 'undefined') {
            console.error("dispatchRemoteSave: Invalid entity payload for remote save.", entityPayload);
            if (typeof onCompletion === 'function') onCompletion(new Error("Invalid entity payload"));
            return;
        }

        let serializedFields;
        try {
            // Assuming Lawnchair.adaptor.serialize is available and handles complex objects.
            // If not, a custom serializer should be implemented.
            serializedFields = selfRef.localCache.adaptor.serialize(entityPayload.data.fields || entityPayload.data);
        } catch (e) {
            console.error("dispatchRemoteSave: Failed to serialize entity fields for remote save.", e, entityPayload.data.fields);
            if (typeof onCompletion === 'function') onCompletion(new Error("Serialization failed"));
            return;
        }

        $.ajax({
            type: 'POST',
            url: saveUrl,
            data: {
                "primary_key": entityPayload.data.pk, // Renamed for clarity.
                "entity_data": serializedFields // Renamed from "data" to be more descriptive.
            },
            success: function(response) {
                console.log("Remote save successful:", response);
                // IMPORTANT: Mark as synced *after* successful remote operation.
                selfRef._saveEntityWithState(entityPayload.data, 'synced', onCompletion);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                selfRef._handleAjaxError(jqXHR, textStatus, errorThrown, onCompletion);
            }
        });
    }
};