ng.module('cloud-data-provider.module', [])
  .factory('CloudClientService', ['$win', '$asyncTask', 'ConfigProvider', function CloudClientService($win, $asyncTask, ConfigProvider) {

    'use strict';

    // Defines the permissible authentication mechanisms for external providers.
    const SUPPORTED_AUTH_TYPES = ['google', 'twitter', 'facebook', 'microsoftaccount', 'aad'];

    // Variables to hold references for the Azure SDK and persistent storage.
    let AzureSDKClient;     // The class constructor for the Azure MobileServiceClient.
    let sdkInstance;        // The instantiated Azure Mobile Service client.
    let persistedState;     // The chosen storage mechanism (localStorage or sessionStorage).

    /**
     * Checks if a value is strictly null or undefined.
     * @param {*} val - The value to evaluate.
     * @returns {boolean} True if the value is null or undefined, false otherwise.
     */
    const isNil = (val) => val === null || typeof val === 'undefined';

    /**
     * Determines if a value is defined and not null.
     * @param {*} val - The value to evaluate.
     * @returns {boolean} True if the value is defined and not null, false otherwise.
     */
    const isPresent = (val) => !isNil(val);

    /**
     * Verifies if a value is not an object type or is null/undefined.
     * @param {*} val - The value to check.
     * @returns {boolean} True if the value is not an object or is nil, false otherwise.
     */
    const isNotObjectLike = (val) => isNil(val) || (typeof val !== 'object');

    /**
     * Initializes the Azure Mobile Service SDK with provided configuration.
     * Throws an error if critical configuration parameters are missing.
     */
    const initializeSDK = function() {
        // Critical configuration check: ensure API_URL and ACCESS_KEY are present.
        if (isNil(ConfigProvider.ENDPOINT_URL) || isNil(ConfigProvider.ACCESS_KEY)) {
            throw new Error('CloudClientService: SDK initialization failed. Missing ENDPOINT_URL or ACCESS_KEY in ConfigProvider.');
        }

        // Assign the global Azure MobileServiceClient constructor and create an instance.
        AzureSDKClient = Azure.MobileServiceClient; // Assumes 'Azure' is a globally available namespace for the SDK.
        sdkInstance = new AzureSDKClient(ConfigProvider.ENDPOINT_URL, ConfigProvider.ACCESS_KEY);
    };

    /**
     * Configures the persistence layer (local or session storage) based on the ConfigProvider.
     * Defaults to sessionStorage if STORAGE_MODE is not explicitly set to 'local'.
     */
    const configurePersistence = function() {
        // Determine storage preference, defaulting to 'session'.
        const storagePreference = ConfigProvider.STORAGE_MODE || 'session';

        if (typeof storagePreference === 'string' && storagePreference.toLowerCase() === 'local') {
            persistedState = $win.localStorage;
        } else {
            persistedState = $win.sessionStorage;
        }
    };

    /**
     * Caches the provided user data in the selected persistence layer.
     * Handles JSON serialization and error logging.
     * @param {object} userData - The user object to cache.
     */
    const cacheCurrentUser = function(userData) {
        if (isPresent(userData)) {
            try {
                persistedState.activeSessionUser = JSON.stringify(userData);
            } catch (e) {
                console.error('CloudClientService: Failed to serialize and cache user data:', e);
            }
        } else {
            // If userData is null/undefined, clear any existing cached user data.
            delete persistedState.activeSessionUser;
        }
    };

    /**
     * Updates the current user object directly on the Azure SDK instance.
     * @param {object} userSession - The user session object to set.
     */
    const updateSDKUser = function(userSession) {
        if (isPresent(userSession)) {
            sdkInstance.currentUser = userSession;
        } else {
            // Clear the current user from the SDK instance if no user session is provided.
            sdkInstance.currentUser = null;
        }
    };

    /**
     * Retrieves a previously cached user session from persistence and restores it to the SDK.
     * Includes error handling for JSON parsing failures.
     */
    const retrieveCachedUser = function() {
        const cachedUserData = persistedState.activeSessionUser;
        if (isPresent(cachedUserData)) {
            try {
                const parsedUser = JSON.parse(cachedUserData);
                if (isPresent(parsedUser)) {
                    updateSDKUser(parsedUser); // Restore the user to the SDK instance.
                }
            } catch (e) {
                console.warn('CloudClientService: Error parsing cached user data. Clearing corrupted session.', e);
                // Invalidate the corrupted cached data.
                delete persistedState.activeSessionUser;
            }
        }
    };

    /**
     * Obtains a reference to a specific collection (table) from the Azure Mobile Service.
     * Optionally applies a custom filter function to the collection.
     * @param {string} collectionName - The name of the collection.
     * @param {function} [customFilterFunc] - An optional function to apply custom filtering.
     * @returns {object} The Azure SDK collection reference.
     * @throws {Error} If the collectionName is invalid.
     */
    const getCollection = function(collectionName, customFilterFunc) {
        if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
            throw new Error('CloudClientService: A valid non-empty collection name (string) is required.');
        }

        let collectionRef = sdkInstance.getTable(collectionName);

        // Apply custom SDK-level filter if provided and is a function.
        if (typeof customFilterFunc === 'function') {
            collectionRef = collectionRef.withFilter(customFilterFunc);
        }
        return collectionRef;
    };

    /**
     * Adapts an Azure SDK promise to an Angular-compatible promise using $asyncTask (formerly $q).
     * This eliminates the need for manual $scope.$apply calls in controllers.
     * @param {Promise} sdkPromise - The promise returned by the Azure SDK.
     * @returns {Promise} An Angular promise.
     */
    const adaptAzurePromise = function(sdkPromise) {
        const asyncHandle = $asyncTask.defer();

        sdkPromise
            .done(function(operationResults) {
                asyncHandle.resolve(operationResults);
            },
            function(rejectionReason) {
                asyncHandle.reject(rejectionReason);
            });
        return asyncHandle.promise;
    };

    /**
     * Bootstraps the CloudClientService by initializing the SDK, configuring storage,
     * and attempting to restore a cached user session.
     */
    const bootstrapService = function() {
        initializeSDK();
        configurePersistence();
        retrieveCachedUser();
    };

    // Execute the bootstrap process immediately when the service is instantiated.
    bootstrapService();

    // Public API for the CloudClientService.
    return {
        /**
         * Executes a comprehensive query against an Azure Mobile Service collection.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection (table) to query.
         * @param {object} [queryOptions] - OPTIONAL: An object defining various query parameters.
         *   @param {object|function} [queryOptions.filterCondition] - Criteria for filtering records (object or OData predicate function).
         *   @param {array} [queryOptions.filterParams] - Parameters to pass to the filter function.
         *   @param {array} [queryOptions.selectFields] - Array of field names to include in the results.
         *   @param {number} [queryOptions.limit] - Maximum number of records to return. Must be a positive integer.
         *   @param {number} [queryOptions.offset] - Number of records to skip. Must be a non-negative integer.
         *   @param {array<object>} [queryOptions.sortOrder] - Array of objects specifying sorting rules:
         *     @param {string} field - The name of the field to sort by.
         *     @param {string} direction - The sort direction ('asc' or 'desc').
         * @param {function} [customFilterFunc] - OPTIONAL: A function for SDK-level request modification (e.g., adding headers).
         * @returns {Promise} An Angular promise resolving with the query results. Rejects on error.
         */
        fetchRecords: function(collectionName, queryOptions, customFilterFunc) {
            // Guard clause for invalid collection name.
            if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
                console.error('CloudClientService.fetchRecords: A valid collection name is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid collection name.'));
            }

            let queryBuilder;
            // Ensure queryOptions is an object, defaulting to an empty one if not provided or invalid.
            const currentQueryOptions = ng.isObject(queryOptions) ? queryOptions : {};

            try {
                queryBuilder = getCollection(collectionName, customFilterFunc);

                // Apply filter condition if specified.
                if (isPresent(currentQueryOptions.filterCondition)) {
                    queryBuilder = queryBuilder.where(currentQueryOptions.filterCondition, currentQueryOptions.filterParams);
                } else {
                    // Default to an empty filter to retrieve all records if no specific criteria are given.
                    queryBuilder = queryBuilder.where({});
                }

                // Apply 'limit' (take) if specified and valid.
                if (isPresent(currentQueryOptions.limit) && ng.isNumber(currentQueryOptions.limit) && currentQueryOptions.limit > 0) {
                    queryBuilder = queryBuilder.take(currentQueryOptions.limit);
                }

                // Apply 'offset' (skip) if specified and valid.
                if (isPresent(currentQueryOptions.offset) && ng.isNumber(currentQueryOptions.offset) && currentQueryOptions.offset >= 0) {
                    queryBuilder = queryBuilder.skip(currentQueryOptions.offset);
                }

                // Apply sorting/ordering rules.
                if (ng.isDefined(currentQueryOptions.sortOrder) && ng.isArray(currentQueryOptions.sortOrder)) {
                    currentQueryOptions.sortOrder.forEach(rule => {
                        const field = rule.field;
                        const sortDirection = (rule.direction || '').toLowerCase(); // Default to empty string for safer comparison.

                        if (isPresent(field) && typeof field === 'string') {
                            if (sortDirection === 'desc') {
                                queryBuilder = queryBuilder.orderByDescending(field);
                            } else {
                                queryBuilder = queryBuilder.orderBy(field); // Default to ascending.
                            }
                        }
                    });
                }

                // Select specific fields to return.
                if (ng.isDefined(currentQueryOptions.selectFields) && ng.isArray(currentQueryOptions.selectFields) && currentQueryOptions.selectFields.length > 0) {
                    queryBuilder = queryBuilder.select(currentQueryOptions.selectFields.join(','));
                }

                // Include total count for pagination support and execute the read operation.
                return adaptAzurePromise(queryBuilder.includeTotalCount().read());

            } catch (e) {
                console.error('CloudClientService.fetchRecords: An unexpected error occurred during query construction or execution:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * Retrieves a single record from an Azure Mobile Service collection by its unique identifier.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection.
         * @param {string} recordId - REQUIRED: The unique ID of the record to retrieve.
         * @param {function} [customFilterFunc] - OPTIONAL: Custom filter for the SDK request.
         * @returns {Promise} An Angular promise resolving with the single record, or rejecting if not found/error.
         */
        getRecordById: function(collectionName, recordId, customFilterFunc) {
            // Guard clauses for mandatory parameters.
            if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
                console.error('CloudClientService.getRecordById: A valid collection name is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid collection name.'));
            }
            if (isNil(recordId) || typeof recordId !== 'string' || recordId.trim() === '') {
                console.error('CloudClientService.getRecordById: A valid record ID is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid record ID.'));
            }

            try {
                return adaptAzurePromise(getCollection(collectionName, customFilterFunc).lookup(recordId));
            } catch (e) {
                console.error('CloudClientService.getRecordById: Error fetching record by ID:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * An alias for `fetchRecords(collectionName, null, customFilterFunc)`.
         * Retrieves all records from a specified collection. Note: Azure Mobile Services may limit the number of returned items.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection.
         * @param {function} [customFilterFunc] - OPTIONAL: Custom filter for the SDK request.
         * @returns {Promise} An Angular promise resolving with all records.
         */
        fetchAllRecords: function(collectionName, customFilterFunc) {
            // Directly calls `fetchRecords` without any specific query options.
            return this.fetchRecords(collectionName, null, customFilterFunc);
        },

        /**
         * Executes a raw read operation against an Azure Mobile Service collection.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection.
         * @param {object} [queryParams] - OPTIONAL: An object of user-defined query parameters for the request URI.
         * @param {function} [customFilterFunc] - OPTIONAL: Custom filter for the SDK request.
         * @returns {Promise} An Angular promise resolving with the read results.
         */
        executeReadOperation: function(collectionName, queryParams, customFilterFunc) {
            if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
                console.error('CloudClientService.executeReadOperation: A valid collection name is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid collection name.'));
            }
            try {
                return adaptAzurePromise(getCollection(collectionName, customFilterFunc).read(queryParams));
            } catch (e) {
                console.error('CloudClientService.executeReadOperation: Error executing raw read operation:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * Inserts a new record into an Azure Mobile Service collection.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection.
         * @param {object} recordData - REQUIRED: The JSON object containing data for the new record.
         * @param {function} [customFilterFunc] - OPTIONAL: Custom filter for the SDK request.
         * @returns {Promise} An Angular promise resolving with the inserted record (including its generated ID).
         */
        createRecord: function(collectionName, recordData, customFilterFunc) {
            if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
                console.error('CloudClientService.createRecord: A valid collection name is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid collection name.'));
            }
            if (isNotObjectLike(recordData)) {
                console.error('CloudClientService.createRecord: Record data must be a valid object.');
                return $asyncTask.reject(new Error('Invalid record data provided for creation.'));
            }

            try {
                return adaptAzurePromise(getCollection(collectionName, customFilterFunc).insert(recordData));
            } catch (e) {
                console.error('CloudClientService.createRecord: Error creating record:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * Updates an existing record in an Azure Mobile Service collection.
         * The `recordData` object must include the `id` of the record to be updated.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection.
         * @param {object} recordData - REQUIRED: The JSON object containing updated data (must include 'id').
         * @param {function} [customFilterFunc] - OPTIONAL: Custom filter for the SDK request.
         * @returns {Promise} An Angular promise resolving with the updated record.
         */
        updateRecord: function(collectionName, recordData, customFilterFunc) {
            if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
                console.error('CloudClientService.updateRecord: A valid collection name is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid collection name.'));
            }
            // Ensure recordData is an object and contains an 'id' for update operations.
            if (isNotObjectLike(recordData) || isNil(recordData.id) || typeof recordData.id !== 'string') {
                console.error('CloudClientService.updateRecord: Record data must be a valid object and include a string "id" property for updating.');
                return $asyncTask.reject(new Error('Invalid record data or missing ID for update.'));
            }

            try {
                return adaptAzurePromise(getCollection(collectionName, customFilterFunc).update(recordData));
            } catch (e) {
                console.error('CloudClientService.updateRecord: Error updating record:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * Deletes one or more records from an Azure Mobile Service collection based on criteria.
         *
         * @param {string} collectionName - REQUIRED: The name of the collection.
         * @param {object} deleteCriteria - REQUIRED: A JSON object specifying the record(s) to delete (e.g., { id: 'someId' }).
         * @param {function} [customFilterFunc] - OPTIONAL: Custom filter for the SDK request.
         * @returns {Promise} An Angular promise resolving upon successful deletion.
         */
        removeRecord: function(collectionName, deleteCriteria, customFilterFunc) {
            if (isNil(collectionName) || typeof collectionName !== 'string' || collectionName.trim() === '') {
                console.error('CloudClientService.removeRecord: A valid collection name is mandatory.');
                return $asyncTask.reject(new Error('Missing or invalid collection name.'));
            }
            if (isNotObjectLike(deleteCriteria)) {
                console.error('CloudClientService.removeRecord: Delete criteria must be a valid object.');
                return $asyncTask.reject(new Error('Invalid delete criteria provided.'));
            }

            try {
                return adaptAzurePromise(getCollection(collectionName, customFilterFunc).del(deleteCriteria));
            } catch (e) {
                console.error('CloudClientService.removeRecord: Error removing record:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * Initiates user authentication using a specified OAuth provider with Azure Mobile Services.
         * Upon successful authentication, the user session is cached.
         *
         * @param {string} authProviderType - REQUIRED: The name of the OAuth provider (e.g., 'google', 'facebook', 'aad').
         * @returns {Promise} An Angular promise resolving with the authenticated user data. Rejects on authentication failure.
         */
        authenticateUser: function(authProviderType) {
            // Validate the authentication provider type.
            if (isNil(authProviderType) || typeof authProviderType !== 'string' || !SUPPORTED_AUTH_TYPES.includes(authProviderType.toLowerCase())) {
                const errorMsg = `CloudClientService.authenticateUser: Invalid or unsupported authentication provider "${authProviderType}". Supported types: ${SUPPORTED_AUTH_TYPES.join(', ')}.`;
                console.error(errorMsg);
                return $asyncTask.reject(new Error(errorMsg));
            }

            try {
                const authPromise = sdkInstance.login(authProviderType).then(function(user) {
                    // Cache the user session after successful login.
                    cacheCurrentUser(sdkInstance.currentUser);
                    return user; // Resolve the promise with the user object.
                });
                return adaptAzurePromise(authPromise);
            } catch (e) {
                console.error('CloudClientService.authenticateUser: Authentication failed:', e);
                return $asyncTask.reject(e);
            }
        },

        /**
         * Explicitly sets the current authenticated user. This is particularly useful for
         * scenarios involving custom authentication or when restoring a session manually.
         *
         * @param {object} userSessionData - REQUIRED: The user object to set as the current authenticated user.
         */
        setAuthUser: function(userSessionData) {
            if (ng.isDefined(userSessionData) && ng.isObject(userSessionData)) {
                updateSDKUser(userSessionData);
                cacheCurrentUser(userSessionData);
            } else {
                console.warn('CloudClientService.setAuthUser: Attempted to set an invalid user session data. Clearing existing user if any.');
                // Clear any existing user if invalid data is provided.
                updateSDKUser(null);
                cacheCurrentUser(null);
            }
        },

        /**
         * Logs out the current user, clearing both the SDK instance's user data and any cached session.
         *
         * @returns {Promise} An Angular promise resolving after the logout operation.
         */
        deauthenticateUser: function() {
            // Check if there's an active user before attempting a logout.
            if (this.isAuthenticated()) {
                try {
                    const logoutPromise = sdkInstance.logout().then(() => {
                        // Clear SDK and cached user data regardless of the SDK's internal logout success.
                        updateSDKUser(null);
                        cacheCurrentUser(null);
                        return true; // Resolve with true to indicate completion.
                    });
                    return adaptAzurePromise(logoutPromise);
                } catch (e) {
                    console.error('CloudClientService.deauthenticateUser: Error during SDK logout process:', e);
                    // Ensure local state is cleared even if SDK logout encounters an error.
                    updateSDKUser(null);
                    cacheCurrentUser(null);
                    return $asyncTask.reject(e);
                }
            } else {
                console.info('CloudClientService.deauthenticateUser: No active user detected; skipping logout process.');
                // Ensure local state is clear and resolve immediately if no user is logged in.
                updateSDKUser(null);
                cacheCurrentUser(null);
                return $asyncTask.resolve(true);
            }
        },

        /**
         * Checks the current authentication status of the user.
         *
         * @returns {boolean} True if a user session is active (both in SDK and cached), false otherwise.
         */
        isAuthenticated: function() {
            // Verify that both the SDK instance and the persistent storage have user data.
            return isPresent(sdkInstance.currentUser) && isPresent(persistedState.activeSessionUser);
        },

        /**
         * Invokes a custom API endpoint defined in Azure Mobile Services.
         *
         * @param {string} apiEndpointName - REQUIRED: The name of the custom API endpoint to call.
         * @param {object} [requestConfig] - OPTIONAL: Configuration for the API call.
         *   @param {string} [requestConfig.method='get'] - The HTTP method to use (e.g., 'get', 'post', 'put', 'delete').
         *   @param {object} [requestConfig.body] - JSON object to send as the request body.
         *   @param {object} [requestConfig.headers] - Key/value pairs for custom HTTP headers.
         *   @param {object} [requestConfig.parameters] - Key/value pairs to send as URL query parameters.
         * @returns {Promise} An Angular promise resolving with the API response data.
         */
        callCustomApi: function(apiEndpointName, requestConfig) {
            const asyncHandle = $asyncTask.defer();
            const ALLOWED_HTTP_METHODS = ['get', 'post', 'put', 'delete'];

            // Guard clause for missing API endpoint name.
            if (isNil(apiEndpointName) || typeof apiEndpointName !== 'string' || apiEndpointName.trim() === '') {
                console.error('CloudClientService.callCustomApi: A custom API endpoint name is required.');
                return $asyncTask.reject(new Error('Missing API endpoint name.'));
            }

            // Normalize request configuration, defaulting method to 'get'.
            const currentRequestConfig = ng.isObject(requestConfig) ? requestConfig : {};
            currentRequestConfig.method = (currentRequestConfig.method || 'get').toLowerCase();

            // Validate the HTTP method.
            if (!ALLOWED_HTTP_METHODS.includes(currentRequestConfig.method)) {
                const errorMsg = `CloudClientService.callCustomApi: Invalid HTTP method "${currentRequestConfig.method}". Allowed methods: ${ALLOWED_HTTP_METHODS.join(', ')}.`;
                console.error(errorMsg);
                return $asyncTask.reject(new Error(errorMsg));
            }

            try {
                sdkInstance
                    .invokeApi(apiEndpointName, currentRequestConfig)
                    .done(function(apiResponse) {
                        // Azure SDK often wraps the actual result payload in a 'result' property.
                        asyncHandle.resolve(apiResponse.result);
                    },
                    function(apiError) {
                        console.error(`CloudClientService.callCustomApi: API call to "${apiEndpointName}" failed:`, apiError);
                        asyncHandle.reject(apiError);
                    });
            } catch (e) {
                console.error('CloudClientService.callCustomApi: An error occurred while attempting to invoke the API:', e);
                return $asyncTask.reject(e);
            }

            return asyncHandle.promise;
        }
    };

}]);