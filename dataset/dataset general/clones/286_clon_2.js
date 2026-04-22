angular.module('cloud-data-provider.module', [])
  .service('CloudDataProvider', ['$domWindow', '$promiseService', 'CloudDataConfigClient', function CloudDataProvider(domWindow, promiseService, cloudConfigClient) {

    'use strict';

    // List of recognized authentication providers for the cloud service.
    var SUPPORTED_AUTH_PROVIDERS = ['google', 'twitter', 'facebook', 'microsoftaccount', 'aad'];

    // Reference to the main cloud service handler.
    var CloudDataServiceHandler;
    // Instance of the cloud service client.
    var cloudHandler;
    // Storage mechanism for user data (local or session).
    var dataStore;
  
    /**
     * Initializes the core cloud service client using provided configuration.
     * Throws an error if essential configuration (URL or key) is missing.
     */
    var initializeCloudHandler = function(){

        if (isValMissing(cloudConfigClient.BASE_URL) || isValMissing(cloudConfigClient.ACCESS_KEY)){
            throw('CloudDataProvider: Configuration error. Missing API key or base URL.');
        }

        CloudDataServiceHandler = ExternalCloudSDK.MobileService;
        cloudHandler = new CloudDataServiceHandler(cloudConfigClient.BASE_URL, cloudConfigClient.ACCESS_KEY);
    };

    /**
     * Configures the data storage based on the client's persistence type.
     * Uses localStorage for 'local' type, otherwise sessionStorage.
     */
    var configureDataStore = function(){
        if (typeof cloudConfigClient.PERSISTENCE_TYPE === 'string' && cloudConfigClient.PERSISTENCE_TYPE.toLowerCase() === 'local'){
            dataStore = domWindow.localStorage;
        }else{
            dataStore = domWindow.sessionStorage;
        }
    };
    
    /**
     * Stores the authenticated user data in the configured data store.
     * @param {object} userData - The user object to be cached.
     */
    var cacheCurrentUser = function(userData){
        dataStore.activeUserRecord = JSON.stringify(userData);
    };

    /**
     * Sets the current user object on the cloud service handler instance.
     * @param {object} currentUserData - The user object to set.
     */
    var setCloudHandlerUser = function(currentUserData){
        cloudHandler.currentUser = currentUserData;
    };

    /**
     * Retrieves the cached user from the data store and sets it on the cloud handler.
     */
    var retrieveCachedUser = function(){
        if (dataStore.activeUserRecord){
            cloudHandler.currentUser = JSON.parse(dataStore.activeUserRecord);
        }
    };

    /**
     * Obtains a reference to a specific cloud collection (table).
     * Optionally applies a filter function if provided.
     * @param {string} collectionName - The name of the collection.
     * @param {function} [optionalFilterFunction] - A function to apply as a filter.
     * @returns {object} A cloud collection object.
     */
    var getCloudCollection = function(collectionName, optionalFilterFunction){
        
        if (typeof optionalFilterFunction === 'function')
            return cloudHandler.withFilter(optionalFilterFunction).getCollection(collectionName);

        return cloudHandler.getCollection(collectionName);
    };

    /**
     * Checks if a value is undefined, or not an object, or not a function.
     * @param {*} inputVal - The value to check.
     * @returns {boolean} True if invalid, false otherwise.
     */
    var isInvalidObjectOrFunction = function(inputVal){
        return typeof inputVal === 'undefined' || (typeof inputVal !== 'object' && typeof inputVal !== 'function');
    };

    /**
     * Checks if a value is null, undefined, or not an object.
     * @param {*} inputItem - The item to check.
     * @returns {boolean} True if invalid, false otherwise.
     */
    var isInvalidObject = function(inputItem){
        return isValMissing(inputItem) || (typeof inputItem !== 'object');
    };

    /**
     * Determines if a value is null or undefined.
     * @param {*} testValue - The value to examine.
     * @returns {boolean} True if the value is null or undefined.
     */
    var isValMissing = function(testValue){
        return testValue === null || typeof testValue === 'undefined';
    };
    
    /**
     * Determines if a value is neither null nor undefined.
     * @param {*} checkValue - The value to examine.
     * @returns {boolean} True if the value is present (not null/undefined).
     */
    var isValPresent = function(checkValue){
        return !isValMissing(checkValue);
    };

    /**
     * Adapts an external cloud service promise into an Angular-compatible promise.
     * This avoids the need for manual $scope.$apply calls in controllers.
     * @param {Promise} externalPromise - The promise returned by the cloud service SDK.
     * @returns {Promise} An Angular-compatible promise.
     */
    var adaptCloudPromiseToAngular = function(externalPromise){
        var promiseDeferred = promiseService.defer();

        externalPromise
            .done(function(retrievedItems){
                promiseDeferred.resolve(retrievedItems);
            },
            function(errorObject){
                promiseDeferred.reject(errorObject);
            });
        return promiseDeferred.promise;
    };

     /**
      * Orchestrates the initial setup of the cloud data provider.
      * This includes initializing the client, configuring storage, and retrieving cached user.
      */
    var initializeProvider = function(){
        initializeCloudHandler();
        configureDataStore();
        retrieveCachedUser();
    };

    // Commence the initialization process for the service.
    initializeProvider();

    return{
        /*
            The fetchRecords method constructs and executes a cloud service query.

            @param {string} collectionKey                 REQUIRED The name of the collection (table) to query.
            @param {object} queryOptions 
                @param {object|function} criteria         The search object or a function for filtering.
                                                          If a function, it must be an OData predicate.
                @param {Array} parameters                 An array of parameters to pass to the criteria function.
                @param {Array} returnFields               An array of column names to include in the results.
                @param {number} takeLimit                 The maximum number of results to retrieve.
                @param {number} skipCount                 The number of results to bypass from the beginning.
                @param {Array} sortOrder                  An array of objects specifying sorting.
                    @param {string} field                 The column name to sort by.
                    @param {string} order                 The sorting direction: 'asc' or 'desc'.         
            @param {function} [optionalFilteringLogic]    OPTIONAL A function that can read/write arbitrary properties or add headers to the request.
            @returns {Promise}                            Returns an Angular promise wrapping the cloud service promise.
        */
        fetchRecords: function(collectionKey, queryOptions, optionalFilteringLogic){
            
            var dataQuery = null;

            if (isValMissing(collectionKey)){
                console.error('CloudDataProvider.fetchRecords: A collection name is mandatory.');
                return null;
            }

            if (angular.isDefined(queryOptions) && angular.isObject(queryOptions)){
                
                if (isInvalidObjectOrFunction(queryOptions.criteria)){
                    queryOptions.criteria = {};
                }
                
                dataQuery = getCloudCollection(collectionKey, optionalFilteringLogic).where(queryOptions.criteria, queryOptions.parameters);

                // Determine the maximum number of results to fetch.
                if (isValPresent(queryOptions.takeLimit) && angular.isNumber(queryOptions.takeLimit)){
                    dataQuery = dataQuery.take(queryOptions.takeLimit);
                }
                
                // Determine the number of results to bypass.
                if (isValPresent(queryOptions.skipCount) && angular.isNumber(queryOptions.skipCount)){
                    dataQuery = dataQuery.skip(queryOptions.skipCount);
                }

                // Apply sorting or ordering to the data.
                if (angular.isDefined(queryOptions.sortOrder) && angular.isArray(queryOptions.sortOrder)){
                    var sortingSpecs = queryOptions.sortOrder;

                    for (var idx=0; idx < sortingSpecs.length; idx++){
                        var sortField = sortingSpecs[idx].field;
                        var sortDirection = sortingSpecs[idx].order;

                        if (angular.isDefined(sortField)){
                            if (angular.isDefined(sortDirection) && sortDirection.toLowerCase() === 'desc'){
                                dataQuery = dataQuery.orderByDescending(sortField);
                            }else if (angular.isDefined(sortField)){ // Redundant check, but keeping structure.
                                dataQuery = dataQuery.orderBy(sortField);
                            }
                        }
                    }
                }

                // Specify which columns to return.
                if (angular.isDefined(queryOptions.returnFields) && angular.isArray(queryOptions.returnFields)){
                    dataQuery = dataQuery.select(queryOptions.returnFields.join());
                }
            
            }else {
                // No specific criteria provided; retrieve all available records.
                // Note: Cloud services typically impose limits on returned item counts; refer to documentation.
                dataQuery = getCloudCollection(collectionKey, optionalFilteringLogic).where({});
            }

            return adaptCloudPromiseToAngular(dataQuery.includeTotalCount().read());
        },

        /*
         Retrieves a single item from the cloud service by its identifier.

         @param {string} collectionKey         REQUIRED The name of the collection to query.
         @param {string} recordId              REQUIRED The string identifier of the item to retrieve.
         @param {function} [optionalFilteringFn]  OPTIONAL A function that can read/write arbitrary properties or add headers to the request.
         @returns {Promise}                    Returns an Angular promise wrapping the cloud service promise.
         */
        retrieveById: function (collectionKey, recordId, optionalFilteringFn) {
            if (isValMissing(collectionKey)) {
                console.error('CloudDataProvider.retrieveById: A collection name is mandatory.');
                return null;
            }

            if (isValMissing(recordId)) {
                console.error('CloudDataProvider.retrieveById: The record ID is mandatory.');
                return null;
            }

            return adaptCloudPromiseToAngular(getCloudCollection(collectionKey, optionalFilteringFn).lookup(recordId));
        }, 

        /*
          A convenience alias for .fetchRecords(collectionKey, null, optionalFilterFn). 
          Retrieves all records from a specified collection.
        */
        fetchAllRecords: function(collectionKey, optionalFilterFn){
            return this.fetchRecords(collectionKey, null, optionalFilterFn);
        },
        
        /*
         Executes a direct read operation against a cloud collection.

         @param {string} collectionKey         REQUIRED The name of the collection to query.
         @param {object} [queryParameters]     OPTIONAL An object containing user-defined parameters for the request URI query string.
         @param {function} [optionalFilterFn]  OPTIONAL A function that can read/write arbitrary properties or add headers to the request.
         @returns {Promise}                    Returns an Angular promise wrapping the cloud service promise.
         */
        executeReadOperation: function (collectionKey, queryParameters, optionalFilterFn) {

            return adaptCloudPromiseToAngular(getCloudCollection(collectionKey, optionalFilterFn).read(queryParameters));
        },

        /*
          Inserts a new record into a specified cloud collection.

          @param {string} collectionKey         REQUIRED The name of the collection (table).
          @param {object} recordData            REQUIRED A JSON object containing the data to insert.
          @param {function} [optionalFilterFn]  OPTIONAL A function for request filtering.
          @returns {Promise}                    Returns an Angular promise wrapping the cloud service promise.
        */

        createRecord: function(collectionKey, recordData, optionalFilterFn){
            if (isValMissing(collectionKey)){
                console.error('CloudDataProvider.createRecord: A collection name is mandatory.');
                return null;
            }

            if (isInvalidObject(recordData)){
                console.error('CloudDataProvider.createRecord: The record data object is mandatory.');
                return null;
            }

            return adaptCloudPromiseToAngular(getCloudCollection(collectionKey, optionalFilterFn).insert(recordData));
        },

        /*
          Updates an existing record in a specified cloud collection.

          @param {string} collectionKey         REQUIRED The name of the collection (table).
          @param {object} recordData            REQUIRED A JSON object containing data for the update (must include ID).
          @param {function} [optionalFilterFn]  OPTIONAL A function for request filtering.
          @returns {Promise}                    Returns an Angular promise wrapping the cloud service promise.
        */

        modifyRecord: function(collectionKey, recordData, optionalFilterFn){
            if (isValMissing(collectionKey)){
                console.error('CloudDataProvider.modifyRecord: A collection name is mandatory.');
                return null;
            }

            if (isInvalidObject(recordData)){
                console.error('CloudDataProvider.modifyRecord: The record data object for update is mandatory.');
                return null;
            }

            return adaptCloudPromiseToAngular(getCloudCollection(collectionKey, optionalFilterFn).update(recordData));
        },

        /*
          Deletes record(s) from a specified cloud collection. 

          @param {string} collectionKey         REQUIRED The name of the collection (table).
          @param {object} recordIdentifier      REQUIRED A JSON object identifying the record(s) for deletion (e.g., { id: '...' }).
          @param {function} [optionalFilterFn]  OPTIONAL A function for request filtering.
          @returns {Promise}                    Returns an Angular promise wrapping the cloud service promise.
        */

        removeRecord: function(collectionKey, recordIdentifier, optionalFilterFn){
            if (isValMissing(collectionKey)){
                console.error('CloudDataProvider.removeRecord: A collection name is mandatory.');
                return null;
            }

            if (isInvalidObject(recordIdentifier)){
                console.error('CloudDataProvider.removeRecord: The record identifier object for deletion is mandatory.');
                return null;
            }

            return adaptCloudPromiseToAngular(getCloudCollection(collectionKey, optionalFilterFn).del(recordIdentifier));
        },

        /*
          Authenticates a user via the specified OAuth provider using the external cloud service.
          The authentication token is stored in the configured data store for subsequent calls.
        
          @param {string} authServiceId  REQUIRED The identifier of the OAuth provider (e.g., 'google', 'facebook').
          @returns {Promise}             Returns an Angular promise wrapping the cloud service promise.
        */

        authenticateUser: function(authServiceId){

            if (!angular.isDefined(authServiceId) || SUPPORTED_AUTH_PROVIDERS.indexOf(authServiceId) === -1){
                throw new Error('CloudDataProvider.authenticateUser: Invalid or unspecified authentication provider.');
            }

            var authPromise = cloudHandler.login(authServiceId).then(function(){
                // Cache the authenticated user's details.
                cacheCurrentUser(cloudHandler.currentUser);
            });
            
            return adaptCloudPromiseToAngular(authPromise);
        },

        /*
          Manually sets the currently authenticated user. This is typically used for custom authentication flows.
          The user object will also be cached.
          @param {object} activeUser REQUIRED The user object to set as active.
        */

        setAuthenticatedUser: function(activeUser){

            if(angular.isDefined(activeUser) && angular.isObject(activeUser)){
                setCloudHandlerUser(activeUser);
                cacheCurrentUser(activeUser);
            }

        },

        /*
          Logs out the current user from the cloud service and clears local cache.
        */

        deauthenticateUser: function(){
            // Clear cached user data.
            dataStore.activeUserRecord = null;
            cloudHandler.logout();
        },
        
        /*
          Checks if a user is currently authenticated with the cloud service and has cached data.
          @returns {boolean} True if the user is authenticated, false otherwise.
        */
        isUserAuthenticated: function(){
            return isValPresent(cloudHandler.currentUser)  && isValPresent(dataStore.activeUserRecord);
        }, 

        /*
            Invokes a custom API endpoint defined in the cloud service.

            @param {string} apiEndpointName     The name of the custom API endpoint.
            @param {object} apiCallOptions    
                @param {string} httpMethod      REQUIRED The HTTP method ('get', 'post', 'put', 'delete').
                @param {object} requestBody     Key/value pairs to send in the request body.
                @param {object} headers         Key/value pairs to send as HTTP headers.
                @param {object} parameters      Key/value pairs to send as URL query parameters.          
            @returns {Promise}                  Returns an Angular promise wrapping the cloud service promise.
        */

        callCustomApi: function(apiEndpointName, apiCallOptions){

            var apiPromiseDeferred = promiseService.defer();

            var allowedMethods = ['get', 'post', 'put', 'delete'];

            if (isValMissing(apiEndpointName)){
                console.error('CloudDataProvider.callCustomApi: No custom API endpoint name specified.');
                return null;
            }

            if (isInvalidObject(apiCallOptions)){
                apiCallOptions = {
                    httpMethod: 'get'
                };
            }else if (isValMissing(apiCallOptions.httpMethod)){
                apiCallOptions.httpMethod = 'get';
            }else if (allowedMethods.indexOf(apiCallOptions.httpMethod.toLowerCase()) === -1 ){
                console.error('CloudDataProvider.callCustomApi: Invalid HTTP method type specified.');
                return null;
            }
            

            cloudHandler
                .invokeApi(apiEndpointName, apiCallOptions)
                .done(function(apiResults){   
                    apiPromiseDeferred.resolve(apiResults.responsePayload);
                },
                function(apiError){
                    apiPromiseDeferred.reject(apiError);
                });

            return apiPromiseDeferred.promise;
        }
    };

}]);