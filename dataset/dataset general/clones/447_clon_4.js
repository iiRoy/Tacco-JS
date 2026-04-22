const dataSynchronizer = (resourceEndpoint) => {

    const localVault = new Lawnchair('data_abstraction_layer');
    const remoteLocation = resourceEndpoint;

    const generateUniqueId = (itemPayload) => {
        if (!itemPayload || itemPayload.primary_id === undefined || itemPayload.schema_type === undefined) {
             console.warn("Payload missing required fields for ID generation:", itemPayload);
             // Fallback or error, depending on expected behavior. For now, mimic original by using what's available.
             return `${itemPayload.schema_type || 'unknown_schema'}_${itemPayload.primary_id || 'unknown_id'}`;
        }
        return `${itemPayload.schema_type}_${itemPayload.primary_id}`;
    };

    const itemStates = {
        ADDED: 'newly_added',
        MODIFIED: 'changed_locally',
        REMOVED_SOFT: 'marked_for_removal',
        SYNCHRONIZED: 'in_sync_with_remote',
    };

    const makeRemoteRequest = async (pathSegment, requestMethod = 'GET', requestBody = null) => {
        const networkOptions = {
            method: requestMethod,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };
        if (requestBody && (requestMethod === 'POST' || requestMethod === 'PUT')) {
            networkOptions.body = JSON.stringify(requestBody);
        }

        const networkResponse = await fetch(`${remoteLocation}${pathSegment}`, networkOptions);
        if (!networkResponse.ok) {
            throw new Error(`Remote communication failed: ${networkResponse.statusText}`);
        }
        return networkResponse.json();
    };

    const facadeOperations = {

        retrieveItem: (identifierKey, resultHandler) => {
            localVault.get(identifierKey, resultHandler);
        },

        discardItem: (identifierKey, completionCallback) => {
            localVault.remove(identifierKey, completionCallback);
        },

        emptyAllData: (completionCallback) => {
            localVault.nuke(completionCallback);
            return facadeOperations;
        },

        markForRemoval: (identifierKey, completionCallback) => {
            localVault.get(identifierKey, (retrievedRecord) => {
                if (retrievedRecord) {
                    retrievedRecord.status = itemStates.REMOVED_SOFT;
                    localVault.save(retrievedRecord, completionCallback);
                } else {
                    completionCallback(null);
                }
            });
        },

        addNewItem: (itemData, completionCallback) => {
            const uniqueIdentifier = generateUniqueId(itemData);
            const storedEntry = {
                identifier: uniqueIdentifier,
                payload: itemData,
                status: itemStates.ADDED
            };
            localVault.save(storedEntry, completionCallback);
        },

        modifyExistingItem: (itemRecord, completionCallback) => {
            itemRecord.status = itemStates.MODIFIED;
            localVault.save(itemRecord, completionCallback);
        },

        queryRecords: (searchCondition, resultHandler) => {
            localVault.find(searchCondition, resultHandler);
        },

        // Grouped queries by status
        queryBySpecificStatus: (statusValue, resultHandler) => {
            const conditionString = `entry.status == "${statusValue}"`;
            facadeOperations.queryRecords(conditionString, resultHandler);
        },

        getNewlyAddedRecords: (resultHandler) => facadeOperations.queryBySpecificStatus(itemStates.ADDED, resultHandler),
        getModifiedRecords: (resultHandler) => facadeOperations.queryBySpecificStatus(itemStates.MODIFIED, resultHandler),
        getSoftRemovedRecords: (resultHandler) => facadeOperations.queryBySpecificStatus(itemStates.REMOVED_SOFT, resultHandler),
        getSynchronizedRecords: (resultHandler) => facadeOperations.queryBySpecificStatus(itemStates.SYNCHRONIZED, resultHandler),

        iterateAllRecords: (recordProcessor) => {
            localVault.each(recordProcessor);
        },

        synchronizeRemoteData: async (completionCallback) => {
            try {
                const incomingRecords = await makeRemoteRequest('/fetch_all_resources/');
                incomingRecords.forEach((remoteEntity) => {
                    const currentId = generateUniqueId(remoteEntity);
                    localVault.get(currentId, (existingEntity) => {
                        if (existingEntity) {
                            existingEntity.payload = remoteEntity;
                            existingEntity.status = itemStates.SYNCHRONIZED;
                            localVault.save(existingEntity, completionCallback);
                        } else {
                            const newEntity = {
                                identifier: currentId,
                                payload: remoteEntity,
                                status: itemStates.ADDED // Or SYNCHRONIZED if directly from remote
                            };
                            localVault.save(newEntity, completionCallback);
                        }
                    });
                });
            } catch (error) {
                console.error("Issue during remote data synchronization:", error);
                if (completionCallback) completionCallback(error);
            }
        },

        transmitDeletion: async (entityToDelete, completionCallback) => {
            try {
                await makeRemoteRequest('/remove_resource/', 'POST', {
                    primary_key_field: entityToDelete.payload.primary_id,
                });
                if (completionCallback) completionCallback(null, true);
            } catch (error) {
                console.error("Failed to transmit deletion:", error);
                if (completionCallback) completionCallback(error, false);
            }
        },

        transmitUpdate: async (entityToUpdate, completionCallback) => {
            try {
                await makeRemoteRequest('/store_resource/', 'POST', {
                    primary_key_field: entityToUpdate.payload.primary_id,
                    content_data: localVault.adaptor.serialize(entityToUpdate.payload.fields),
                });
                entityToUpdate.status = itemStates.SYNCHRONIZED;
                localVault.save(entityToUpdate);
                if (completionCallback) completionCallback(null, true);
            } catch (error) {
                console.error("Failed to transmit update:", error);
                if (completionCallback) completionCallback(error, false);
            }
        }
    };

    return facadeOperations;
};