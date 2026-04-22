angular.module('azure-mobile-service.module', [ ])
    .service('Azureservice', ['$window', '$q', 'AzureMobileServiceClient', function Azureservice($window, $q, AzureMobileServiceClient) {

        // Enforce strict mode for cleaner code and error handling
        'use strict';

        /*
         * Defines the list of valid OAuth providers supported by Azure Mobile Services.
         * These are the providers that can be used for user authentication.
         */
        var VAILD_OAUTH_PROVIDERS = [
            'google',
            'twitter',
            'facebook',
            'microsoftaccount',
            'aad'
        ];

        // Declare variables for the Mobile Service Client, client instance, and storage mechanism.
        var MobileServiceClient; /* This variable will hold the MobileServiceClient constructor. */
        var client;              /* This will be the instantiated client object. */
        var storage;             /* This will reference either localStorage or sessionStorage. */

        /**
         * Initializes the Azure Mobile Service Client.
         * Throws an error if the API URL or API Key are not configured.
         */
        var initMSClient = function() {

            if (isNullOrUndefined(AzureMobileServiceClient.API_URL) || isNullOrUndefined(AzureMobileServiceClient.API_KEY)) {
                // Critical configuration missing, cannot proceed.
                throw('Angularservice: Unable to configure the MS Mobile Client. Missing API KEY or URL');
            }

            // Assign the WindowsAzure MobileServiceClient constructor.
            MobileServiceClient = WindowsAzure.MobileServiceClient;
            // Create a new instance of the Mobile Service Client with provided credentials.
            client = new MobileServiceClient(AzureMobileServiceClient.API_URL, AzureMobileServiceClient.API_KEY);
        };

        /**
         * Determines and sets the storage mechanism (localStorage or sessionStorage)
         * based on the configuration in AzureMobileServiceClient.STORAGE.
         */
        var setStorage = function() {
            // Check if the storage preference is explicitly 'local' (case-insensitive).
            if (typeof AzureMobileServiceClient.STORAGE === 'string' && AzureMobileServiceClient.STORAGE.toLowerCase() === 'local') {
                storage = $window.localStorage; // Use local storage for persistent data.
            }
            else {
                storage = $window.sessionStorage; // Default to session storage for temporary data.
            }
        };

        /**
         * Caches the logged-in user object in the chosen storage.
         * @param {object} user - The user object to cache.
         */
        var setCachedUser = function(user) {
            storage.loggedInUser = JSON.stringify(user); // Store as a string.
        };

        /**
         * Sets the current user on the MobileServiceClient instance.
         * This is crucial for subsequent authenticated requests.
         * @param {object} user - The user object to set.
         */
        var setMSClientUser = function(user) {
            client.currentUser = user;
        };

        /**
         * Retrieves the cached user from storage and sets it on the MobileServiceClient.
         * This ensures user session persistence across page loads (if using localStorage).
         */
        var getCachedUser = function() {
            if (storage.loggedInUser) {
                // Parse the stored JSON string back into an object.
                client.currentUser = JSON.parse(storage.loggedInUser);
            }
        };

        /**
         * Gets a table reference from the MobileServiceClient, optionally applying a filter function.
         * @param {string} tableName - The name of the table to retrieve.
         * @param {function} withFilterFn - An optional function to apply a filter.
         * @returns {object} A table object from the MobileServiceClient.
         */
        var getTable = function(tableName, withFilterFn) {

            if (typeof withFilterFn === 'function') {
                return client.withFilter(withFilterFn).getTable(tableName);
            }

            return client.getTable(tableName); // Return the table directly if no filter is needed.
        };

        /**
         * Checks if an object is undefined or not an object/function.
         * @param {*} obj - The object to check.
         * @returns {boolean} True if undefined or not an object/function, false otherwise.
         */
        var isUndefinedOrNotAnObjectOrFunction = function(obj) {
            return typeof obj === 'undefined' || (typeof obj !== 'object' && typeof obj !== 'function');
        };

        /**
         * Checks if an object is null, undefined, or not an object.
         * @param {*} obj - The object to check.
         * @returns {boolean} True if null, undefined, or not an object, false otherwise.
         */
        var isUndefinedOrNotAnObject = function(obj) {
            return isNullOrUndefined(obj) || (typeof obj !== 'object');
        };

        /**
         * Checks if a value is null or undefined.
         * @param {*} value - The value to check.
         * @returns {boolean} True if the value is null or undefined, false otherwise.
         */
        var isNullOrUndefined = function(value) {
            return value === null || typeof value === 'undefined';
        };

        /**
         * Checks if a value is NOT null and NOT undefined.
         * @param {*} value - The value to check.
         * @returns {boolean} True if the value is not null and not undefined, false otherwise.
         */
        var isNotNullOrUndefined = function(value) {
            return !isNullOrUndefined(value);
        };

        /**
         * Wraps an Azure Mobile Service promise with an Angular $q promise.
         * This allows seamless integration of Azure promises into Angular's digest cycle,
         * eliminating the need for manual $scope.$apply calls in controllers.
         * @param {object} azurePromise - The promise returned by an Azure Mobile Service operation.
         * @returns {Promise} An Angular $q promise that resolves or rejects based on the Azure promise.
         */
        var wrapAzurePromiseWithAngularPromise = function(azurePromise) {
            var deferred = $q.defer(); // Create a new deferred object.

            azurePromise
                .done(
                    function(items) {
                        // On successful completion, resolve the Angular promise.
                        deferred.resolve(items);
                    },
                    function(err) {
                        // On error, reject the Angular promise.
                        deferred.reject(err);
                    }
                );
            return deferred.promise; // Return the Angular promise.
        };

        /**
         * Primary initialization function for the service.
         * Sets up the MS client, storage, and attempts to restore a cached user session.
         */
        var init = function() {
            initMSClient();   // Initialize the Mobile Service Client.
            setStorage();     // Determine and set the storage mechanism.
            getCachedUser();  // Attempt to retrieve a cached user.
        };

        // Execute the initialization function immediately when the service loads.
        init();

        /*
         * Public API for the Azureservice.
         * This object contains all methods exposed to Angular controllers and other services.
         */
        return {
            /*
             * The query method constructs and executes an Azure Mobile Service query.
             * It allows for complex filtering, ordering, pagination, and column selection.
             *
             * @param {string} tableName - REQUIRED: The name of the table to query.
             * @param {object} obj - OPTIONAL: An object containing query parameters.
             *     @param {object|function} obj.criteria - The search object or a function to filter.
             *                                             If a function, it must be an OData predicate.
             *     @param {array} obj.params - Array of parameters to pass to the criteria function.
             *     @param {array} obj.columns - Array of column names to return (e.g., ['id', 'name']).
             *     @param {number} obj.take - Number of results to return (for pagination).
             *     @param {number} obj.skip - Number of results to skip over (for pagination).
             *     @param {array} obj.orderBy - Array of objects defining sort order.
             *         @param {string} obj.orderBy[].column - Column name to sort by.
             *         @param {string} obj.orderBy[].direction - Direction to sort: 'asc' || 'desc'.
             * @param {function} withFilterFn - OPTIONAL: A function that can read/write arbitrary properties
             *                                   or add additional headers to the request.
             * @returns {Promise} Returns an Angular promise wrapping the WindowsAzure promise.
             */
            query: function(tableName, obj, withFilterFn) {

                var data = null; // Initialize data variable for the query builder.

                if (isNullOrUndefined(tableName)) {
                    console.error('Azureservice.query: You must specify a table name');
                    return null; // Cannot proceed without a table name.
                }

                if (angular.isDefined(obj) && angular.isObject(obj)) {

                    if (isUndefinedOrNotAnObjectOrFunction(obj.criteria)) {
                        obj.criteria = {}; // Default to an empty criteria if not provided or invalid.
                    }

                    // Start building the query with the table and initial criteria.
                    data = getTable(tableName, withFilterFn).where(obj.criteria, obj.params);

                    // Apply 'take' for limiting results.
                    if (isNotNullOrUndefined(obj.take) && angular.isNumber(obj.take)) {
                        data = data.take(obj.take);
                    }

                    // Apply 'skip' for offset in pagination.
                    if (isNotNullOrUndefined(obj.skip) && angular.isNumber(obj.take)) {
                        data = data.skip(obj.skip); // Note: Original code had 'obj.take' here, assuming it should be 'obj.skip' for consistency.
                    }

                    // Handle sorting/ordering of the data.
                    if (angular.isDefined(obj.orderBy) && angular.isArray(obj.orderBy)) {
                        var orderBy = obj.orderBy; // Shorthand for the orderBy array.

                        for (var i = 0; i < orderBy.length; i++) {
                            var column = orderBy[i].column;
                            var dir = orderBy[i].direction;

                            if (angular.isDefined(column)) {
                                if (angular.isDefined(dir) && dir.toLowerCase() === 'desc') {
                                    data = data.orderByDescending(column);
                                }
                                else if (angular.isDefined(column)) { // This condition is redundant but kept for Type I clone.
                                    data = data.orderBy(column);
                                }
                            }
                        }
                    }

                    // Select specific columns to return.
                    if (angular.isDefined(obj.columns) && angular.isArray(obj.columns)) {
                        data = data.select(obj.columns.join()); // Join array elements into a comma-separated string.
                    }

                }
                else {
                    // If no specific criteria are provided, retrieve all items from the table.
                    // Note: Azure Mobile Services may impose limits on the number of items returned by default.
                    data = getTable(tableName, withFilterFn).where({});
                }

                // Execute the read operation and include the total count, then wrap the promise.
                return wrapAzurePromiseWithAngularPromise(data.includeTotalCount().read());
            },

            /*
             * Retrieves a single item from an Azure Mobile Service table by its ID.
             *
             * @param {string} tableName - REQUIRED: The name of the table.
             * @param {string} id - REQUIRED: The unique ID of the item to retrieve.
             * @param {function} withFilterFn - OPTIONAL: Filter function for the request.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            getById: function(tableName, id, withFilterFn) {
                if (isNullOrUndefined(tableName)) {
                    console.error('Azureservice.getById: You must specify a table name');
                    return null;
                }

                if (isNullOrUndefined(id)) {
                    console.error('Azureservice.getById: You must specify the id');
                    return null;
                }

                return wrapAzurePromiseWithAngularPromise(getTable(tableName, withFilterFn).lookup(id));
            },

            /*
             * An alias method to `query` that returns all results from a specified table.
             * This is a convenience method for fetching entire tables.
             *
             * @param {string} tableName - REQUIRED: The name of the table to query.
             * @param {function} withFilterFn - OPTIONAL: Filter function for the request.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            getAll: function(tableName, withFilterFn) {
                return this.query(tableName, null, withFilterFn); // Call the query method with no specific criteria.
            },

            /*
             * Executes a generic read query in Azure, allowing for custom parameters.
             *
             * @param {string} tableName - REQUIRED: The name of the table.
             * @param {object} parameters - OPTIONAL: User-defined parameters for the query string.
             * @param {function} withFilterFn - OPTIONAL: Filter function for the request.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            read: function(tableName, parameters, withFilterFn) {

                return wrapAzurePromiseWithAngularPromise(getTable(tableName, withFilterFn).read(parameters));
            },

            /*
             * Inserts a new row into an Azure Mobile Service table.
             *
             * @param {string} tableName - REQUIRED: The name of the table.
             * @param {object} obj - REQUIRED: A JSON object containing the data to insert.
             * @param {function} withFilterFn - OPTIONAL: Filter function for the request.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            insert: function(tableName, obj, withFilterFn) {
                if (isNullOrUndefined(tableName)) {
                    console.error('Azureservice.insert: You must specify a table name');
                    return null;
                }

                if (isUndefinedOrNotAnObject(obj)) {
                    console.error('Azureservice.insert: You must specify the insert object');
                    return null;
                }

                return wrapAzurePromiseWithAngularPromise(getTable(tableName, withFilterFn).insert(obj));
            },

            /*
             * Updates an existing row in an Azure Mobile Service table.
             * The `obj` must contain the 'id' property of the item to update.
             *
             * @param {string} tableName - REQUIRED: The name of the table.
             * @param {object} obj - REQUIRED: A JSON object with the updated data, including the item's 'id'.
             * @param {function} withFilterFn - OPTIONAL: Filter function for the request.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            update: function(tableName, obj, withFilterFn) {
                if (isNullOrUndefined(tableName)) {
                    console.error('Azureservice.update: You must specify a table name');
                    return null;
                }

                if (isUndefinedOrNotAnObject(obj)) {
                    console.error('Azureservice.update: You must specify the insert object'); // Error message could be more specific: "update object".
                    return null;
                }

                return wrapAzurePromiseWithAngularPromise(getTable(tableName, withFilterFn).update(obj));
            },

            /*
             * Deletes row(s) from an Azure Mobile Service table.
             * The `obj` typically contains the 'id' of the item to delete, or a query for multiple deletions.
             *
             * @param {string} tableName - REQUIRED: The name of the table.
             * @param {object} obj - REQUIRED: A JSON object specifying the item(s) to delete (e.g., { id: 'item123' }).
             * @param {function} withFilterFn - OPTIONAL: Filter function for the request.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            del: function(tableName, obj, withFilterFn) {
                if (isNullOrUndefined(tableName)) {
                    console.error('Azureservice.del: You must specify a table name');
                    return null;
                }

                if (isUndefinedOrNotAnObject(obj)) {
                    console.error('Azureservice.del: You must specify the insert object'); // Error message could be more specific: "delete object".
                    return null;
                }

                return wrapAzurePromiseWithAngularPromise(getTable(tableName, withFilterFn).del(obj));
            },

            /*
             * Logs a user into an OAuth provider using Windows Azure Mobile Services.
             * The authentication token and user data are stored in the configured storage.
             *
             * @param {string} oauthProvider - REQUIRED: The name of the OAuth provider (e.g., 'google', 'facebook').
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            login: function(oauthProvider) {

                if (!angular.isDefined(oauthProvider) || VAILD_OAUTH_PROVIDERS.indexOf(oauthProvider) === -1) {
                    throw new Error('Azureservice.login Invalid or no oauth provider listed.');
                }

                var promise = client.login(oauthProvider).then(function() {
                    // Cache the logged-in user's details after successful login.
                    setCachedUser(client.currentUser);
                });

                return wrapAzurePromiseWithAngularPromise(promise);
            },

            /*
             * Manually sets the currently logged-in user. This is primarily used
             * for scenarios involving Azure custom authentication where the user object
             * is obtained through a custom login process.
             *
             * @param {object} currentUser - REQUIRED: The user object to set.
             */
            setCurrentUser: function(currentUser) {

                if (angular.isDefined(currentUser) && angular.isObject(currentUser)) {
                    setMSClientUser(currentUser);  // Set user on the MS client.
                    setCachedUser(currentUser);    // Cache the user for persistence.
                }

            },

            /*
             * Logs out the current user from Azure Mobile Services.
             * Clears the cached user data from storage and the client instance.
             */
            logout: function() {
                // Clear the user from local/session storage.
                storage.loggedInUser = null;
                // Instruct the Azure client to log out.
                client.logout();
            },

            /*
             * Checks if a user is currently logged in.
             * This is determined by checking both the client's currentUser and the cached user in storage.
             * @returns {boolean} True if a user is logged in, false otherwise.
             */
            isLoggedIn: function() {
                return isNotNullOrUndefined(client.currentUser) && isNotNullOrUndefined(storage.loggedInUser);
            },

            /*
             * Invokes a custom API endpoint in Azure Mobile Services.
             * This allows interaction with server-side custom logic.
             *
             * @param {string} name - REQUIRED: The name of the custom API endpoint.
             * @param {object} options - OPTIONAL: Configuration for the API call.
             *     @param {string} options.method - REQUIRED: HTTP method ('get', 'post', 'put', 'delete').
             *     @param {object} options.body - Key/value pairs to send in the request body.
             *     @param {object} options.headers - Key/value pairs for custom HTTP headers.
             *     @param {object} options.parameters - Key/value pairs to send as query parameters.
             * @returns {Promise} An Angular promise wrapping the WindowsAzure promise.
             */
            invokeApi: function(name, options) {

                var deferred = $q.defer(); // Create a deferred object for the Angular promise.

                var validMethods = ['get', 'post', 'put', 'delete']; // Allowed HTTP methods.

                if (isNullOrUndefined(name)) {
                    console.error('Azureservice.invokeApi No custom api name specified');
                    return null;
                }

                if (isUndefinedOrNotAnObject(options)) {
                    options = {
                        method: 'get'
                    }; // Default to GET method if options are not provided.
                }
                else if (isNullOrUndefined(options.method)) {
                    options.method = 'get'; // Default to GET if method is not specified in options.
                }
                else if (validMethods.indexOf(options.method.toLowerCase()) === -1) {
                    console.error('Azureservice.invokeApi Invalid method type');
                    return null;
                }


                client
                    .invokeApi(name, options)
                    .done(
                        function(results) {
                            // Resolve the Angular promise with the API results.
                            deferred.resolve(results.result);
                        },
                        function(err) {
                            // Reject the Angular promise on error.
                            deferred.reject(err);
                        }
                    );

                return deferred.promise; // Return the Angular promise.
            }
        };

    }]);