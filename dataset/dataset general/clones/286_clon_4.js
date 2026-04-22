function createCloudDataAccessor(globalWindow, platformConfig) {
    'use strict';

    const supportedAuthProviders = Object.freeze(['google', 'twitter', 'facebook', 'microsoftaccount', 'aad']);

    let sdkInstance;
    let dataCache;

    const isAbsent = (item) => item === null || typeof item === 'undefined';
    const isPresent = (item) => !isAbsent(item);
    const isNotObject = (item) => isAbsent(item) || (typeof item !== 'object');
    const isInvalidType = (item) => typeof item === 'undefined' || (typeof item !== 'object' && typeof item !== 'function');

    const setupCloudClient = () => {
        if (isAbsent(platformConfig.API_URL) || isAbsent(platformConfig.API_KEY)) {
            throw new Error('CloudDataAccessor: Cannot configure cloud client. Missing API KEY or URL.');
        }

        sdkInstance = new globalWindow.WindowsAzure.MobileServiceClient(platformConfig.API_URL, platformConfig.API_KEY);
    };

    const configurePersistence = () => {
        if (typeof platformConfig.STORAGE === 'string' && platformConfig.STORAGE.toLowerCase() === 'local') {
            dataCache = globalWindow.localStorage;
        } else {
            dataCache = globalWindow.sessionStorage;
        }
    };

    const saveUserData = (userData) => {
        dataCache.currentSessionUser = JSON.stringify(userData);
    };

    const applyUserData = (userData) => {
        sdkInstance.currentUser = userData;
    };

    const retrieveUserData = () => {
        if (dataCache.currentSessionUser) {
            sdkInstance.currentUser = JSON.parse(dataCache.currentSessionUser);
        }
    };

    const obtainDataCollection = (collectionName, filterCallback) => {
        if (typeof filterCallback === 'function') {
            return sdkInstance.withFilter(filterCallback).getTable(collectionName);
        }
        return sdkInstance.getTable(collectionName);
    };

    const adaptCloudPromise = (cloudPromise) => {
        return new Promise((resolve, reject) => {
            cloudPromise
                .done(
                    (results) => resolve(results),
                    (error) => reject(error)
                );
        });
    };

    const initializeGateway = () => {
        setupCloudClient();
        configurePersistence();
        retrieveUserData();
    };

    initializeGateway();

    return {
        fetchRecords: function(collectionName, queryOptions, filterCallback) {
            if (isAbsent(collectionName)) {
                console.error('CloudDataAccessor.fetchRecords: A collection name must be provided.');
                return null;
            }

            let dataQuery = obtainDataCollection(collectionName, filterCallback);

            if (isPresent(queryOptions) && typeof queryOptions === 'object') {
                let criteria = queryOptions.criteria;
                let parameters = queryOptions.params;
                let recordTake = queryOptions.take;
                let recordSkip = queryOptions.skip;
                let recordOrder = queryOptions.orderBy;
                let recordColumns = queryOptions.columns;

                if (isInvalidType(criteria)) {
                    criteria = {};
                }

                dataQuery = dataQuery.where(criteria, parameters);

                if (isPresent(recordTake) && typeof recordTake === 'number') {
                    dataQuery = dataQuery.take(recordTake);
                }

                if (isPresent(recordSkip) && typeof recordSkip === 'number') {
                    dataQuery = dataQuery.skip(recordSkip);
                }

                if (isPresent(recordOrder) && Array.isArray(recordOrder)) {
                    recordOrder.forEach(orderItem => {
                        const columnId = orderItem.column;
                        const sortDirection = orderItem.direction;

                        if (isPresent(columnId)) {
                            if (isPresent(sortDirection) && sortDirection.toLowerCase() === 'desc') {
                                dataQuery = dataQuery.orderByDescending(columnId);
                            } else {
                                dataQuery = dataQuery.orderBy(columnId);
                            }
                        }
                    });
                }

                if (isPresent(recordColumns) && Array.isArray(recordColumns)) {
                    dataQuery = dataQuery.select(recordColumns.join());
                }
            } else {
                dataQuery = dataQuery.where({});
            }

            return adaptCloudPromise(dataQuery.includeTotalCount().read());
        },

        fetchRecordById: function(collectionName, recordId, filterCallback) {
            if (isAbsent(collectionName)) {
                console.error('CloudDataAccessor.fetchRecordById: A collection name must be provided.');
                return null;
            }
            if (isAbsent(recordId)) {
                console.error('CloudDataAccessor.fetchRecordById: The record ID must be provided.');
                return null;
            }
            return adaptCloudPromise(obtainDataCollection(collectionName, filterCallback).lookup(recordId));
        },

        fetchAllRecords: function(collectionName, filterCallback) {
            return this.fetchRecords(collectionName, null, filterCallback);
        },

        executeReadOperation: function(collectionName, queryParameters, filterCallback) {
            return adaptCloudPromise(obtainDataCollection(collectionName, filterCallback).read(queryParameters));
        },

        createRecord: function(collectionName, newRecord, filterCallback) {
            if (isAbsent(collectionName)) {
                console.error('CloudDataAccessor.createRecord: A collection name must be provided.');
                return null;
            }
            if (isNotObject(newRecord)) {
                console.error('CloudDataAccessor.createRecord: The record object for creation must be provided.');
                return null;
            }
            return adaptCloudPromise(obtainDataCollection(collectionName, filterCallback).insert(newRecord));
        },

        modifyRecord: function(collectionName, updatedRecord, filterCallback) {
            if (isAbsent(collectionName)) {
                console.error('CloudDataAccessor.modifyRecord: A collection name must be provided.');
                return null;
            }
            if (isNotObject(updatedRecord)) {
                console.error('CloudDataAccessor.modifyRecord: The record object for modification must be provided.');
                return null;
            }
            return adaptCloudPromise(obtainDataCollection(collectionName, filterCallback).update(updatedRecord));
        },

        removeRecord: function(collectionName, recordToDelete, filterCallback) {
            if (isAbsent(collectionName)) {
                console.error('CloudDataAccessor.removeRecord: A collection name must be provided.');
                return null;
            }
            if (isNotObject(recordToDelete)) {
                console.error('CloudDataAccessor.removeRecord: The record object for deletion must be provided.');
                return null;
            }
            return adaptCloudPromise(obtainDataCollection(collectionName, filterCallback).del(recordToDelete));
        },

        authenticateUser: function(authProvider) {
            if (!isPresent(authProvider) || !supportedAuthProviders.includes(authProvider)) {
                throw new Error('CloudDataAccessor.authenticateUser: Invalid or missing authentication provider.');
            }

            const authPromise = sdkInstance.login(authProvider).then(() => {
                saveUserData(sdkInstance.currentUser);
            });

            return adaptCloudPromise(authPromise);
        },

        setAuthContext: function(currentAuthUser) {
            if (isPresent(currentAuthUser) && typeof currentAuthUser === 'object') {
                applyUserData(currentAuthUser);
                saveUserData(currentAuthUser);
            }
        },

        deauthenticateUser: function() {
            dataCache.currentSessionUser = null;
            sdkInstance.logout();
        },

        isAuthenticated: function() {
            return isPresent(sdkInstance.currentUser) && isPresent(dataCache.currentSessionUser);
        },

        callCustomEndpoint: function(endpointName, operationOptions) {
            const validOperations = Object.freeze(['get', 'post', 'put', 'delete']);

            if (isAbsent(endpointName)) {
                console.error('CloudDataAccessor.callCustomEndpoint: No custom API endpoint name specified.');
                return null;
            }

            let currentOptions = operationOptions || { method: 'get' };

            if (isAbsent(currentOptions.method)) {
                currentOptions.method = 'get';
            } else if (!validOperations.includes(currentOptions.method.toLowerCase())) {
                console.error('CloudDataAccessor.callCustomEndpoint: Invalid method type.');
                return null;
            }

            return new Promise((resolve, reject) => {
                sdkInstance
                    .invokeApi(endpointName, currentOptions)
                    .done(
                        (results) => resolve(results.result),
                        (error) => reject(error)
                    );
            });
        }
    };
}