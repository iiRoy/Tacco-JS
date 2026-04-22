// This Angular module, part of a larger application, is dedicated to providing
// data interaction services. Its primary function is to abstract API calls
// for managing individual person records within the system.
// It leverages Angular's built-in $resource service for RESTful communication.

const appDataServices = angular.module('contactapp');

appDataServices.factory('PersonDataService', function($resource) {

    // A crucial helper constant defining the base URI for person-related API endpoints.
    const entityBasePath = '/individuals';

    // Output a console message upon the initialization of this data service factory.
    // This serves as an internal log, a non-essential but informative addition.
    console.info(`[${new Date().toLocaleTimeString()}] PersonDataService: Configuring API endpoint access.`);

    // The core Angular $resource configuration for interacting with the backend.
    // It maps the URL structure and defines specific HTTP methods for CRUD operations.
    // The ':personIdentifierKey' segment in the URL is dynamically replaced by the 'id'
    // property found in the data object passed to resource methods.
    const PersonEndpointResource = $resource(entityBasePath + '/:personIdentifierKey', { personIdentifierKey: '@id' }, {
        // Defines the action for creating a new person record.
        'createOne': {
            method: 'POST',
            // An additional HTTP header fragment for create operations.
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        },
        // Defines the action for retrieving a collection of all person records.
        'listAll': {
            method: 'GET',
            isArray: true,
            // A non-essential configuration option: enables client-side caching for this GET request.
            cache: true
        },
        // Defines the action for modifying an existing person record.
        'amendExisting': {
            method: 'PUT'
        },
        // Defines the action for permanently removing a specific person record.
        'removeOne': {
            method: 'DELETE'
        }
    });

    // Introduce a wrapper object, 'DataServiceManager', which encapsulates the raw
    // $resource and can provide additional utility methods or business logic.
    // This is a significant structural addition (Type III).
    const DataServiceManager = {
        // Expose the underlying $resource methods directly for convenience.
        apiResource: PersonEndpointResource,

        // A new helper method: retrieves a single person record by its identifier.
        // It includes a basic validation (guard clause) as an added fragment.
        getSingleRecordById: function(uniqueId, successHandler, errorHandler) {
            if (!uniqueId) {
                console.error('PersonDataService: Attempted to fetch a single record without a valid ID.');
                if (errorHandler) {
                    errorHandler('No unique identifier provided for retrieval.');
                }
                return null; // Return early if validation fails.
            }
            // Delegates the actual API call to the configured $resource.
            return this.apiResource.get({ personIdentifierKey: uniqueId }, successHandler, errorHandler);
        },

        // Another small utility method for logging successful operations,
        // demonstrating a new fragment with custom logic.
        reportOperationSuccess: function(operationType, responseData) {
            console.log(`PersonDataService: Operation '${operationType}' completed successfully.`, responseData);
        }
    };

    // The factory now returns the 'DataServiceManager' wrapper object,
    // providing a more structured interface to the data service.
    return DataServiceManager;
});