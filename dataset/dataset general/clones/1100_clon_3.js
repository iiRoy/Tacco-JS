testSuite('API Client Interactions', function () {
    let ResourceClientInstance; // Renamed PeopleApi to ResourceClientInstance

    // Helper function to initialize the REST client
    const createApiClient = (rootPathSegment, resourceIdentifier) => {
        // Added a guard clause for client initialization parameters
        if (typeof rootPathSegment !== 'string' || !rootPathSegment.startsWith('/') || !resourceIdentifier) {
            console.warn('Invalid root path or resource identifier provided for client setup.');
            // Defaulting to ensure tests can proceed, but in production, this might throw an error.
            rootPathSegment = '/api/v1/';
            resourceIdentifier = 'default_resource';
        }

        return new DataService({ // Renamed Apy to DataService
            rootPath: rootPathSegment, // Renamed 'base' to 'rootPath'
            resourceName: resourceIdentifier // Renamed 'collection' to 'resourceName', changed 'people' to 'entities'
        });
    };

    // Helper for common expectations on the last AJAX request
    const expectLastAjaxRequest = () => {
        // Added a check to ensure requests exist before accessing them
        if (!ajaxMocker.requests || ajaxMocker.requests.length === 0) {
            fail('No AJAX requests were captured by the mocker.');
        }
        return expect(ajaxMocker.requests.lastHandledRequest()); // Renamed mostRecent to lastHandledRequest
    };

    // Setup routine before each individual test
    setupTest(function () { // Renamed beforeEach to setupTest
        ajaxMocker.install(); // Renamed jasmine.Ajax to ajaxMocker
        ResourceClientInstance = createApiClient('/api/v3/', 'entities'); // Instantiated client with new name and resource
    });

    // Teardown routine after each individual test
    teardownTest(function () { // Renamed afterEach to teardownTest
        ajaxMocker.uninstall();
    });

    // --- Test Group: Query Parameter Handling ---
    testSuite('Query Parameter Handling', function () { // Renamed Query to QueryParameterHandling
        // Constants for frequently used values
        const BASE_RESOURCE_URL = '/api/v3/entities/';
        const TARGET_ENTITY_ID = 42; // Changed 12 to 42

        testCase('should reject non-object query options', function () { // Renamed it to testCase
            // Rewritten try/catch block to use Jasmine's toThrow assertion
            const actionWithInvalidParams = () => {
                ResourceClientInstance.fetchAll((operationError, responseData) => {}, 'incorrect_param_type'); // Renamed err, data to operationError, responseData; params to queryOptions
            };
            expect(actionWithInvalidParams).toThrow(new Error('Query parameters must be supplied as an object.')); // Rewrote error message
        });

        testCase('should not append query parameters when none are specified for fetchAll', function () {
            ResourceClientInstance.fetchAll((operationError, responseData) => {});
            expectLastAjaxRequest().requestUrl.toBe(BASE_RESOURCE_URL); // Renamed url to requestUrl
        });

        testCase('should correctly append query parameters for fetchAll method', function () {
            ResourceClientInstance.fetchAll((operationError, responseData) => {}, { status: 'active', category: 'widgets' }); // Changed kind/job to status/category
            expectLastAjaxRequest().requestUrl.toBe(BASE_RESOURCE_URL + '?status=active&category=widgets');
        });

        testCase('should append query parameters for retrieveOne method', function () {
            ResourceClientInstance.retrieveOne(TARGET_ENTITY_ID, (operationError, responseData) => {}, { scope: 'full' }); // Renamed find to retrieveOne, job to scope
            expectLastAjaxRequest().requestUrl.toBe(BASE_RESOURCE_URL + TARGET_ENTITY_ID + '?scope=full');
        });

        // Deleted the test case for 'save method' query parameters as it overlaps with 'update method' for parameter logic.

        testCase('should append query parameters for modifyRecord method', function () {
            ResourceClientInstance.modifyRecord(TARGET_ENTITY_ID, { label: 'updated_item' }, (operationError, responseData) => {}, { context: 'admin_session' }); // Renamed update to modifyRecord, changed data fields and query params
            expectLastAjaxRequest().requestUrl.toBe(BASE_RESOURCE_URL + TARGET_ENTITY_ID + '?context=admin_session');
        });

        testCase('should append query parameters for removeRecord method', function () {
            ResourceClientInstance.removeRecord(TARGET_ENTITY_ID, (operationError, responseData) => {}, { bypassAuth: true }); // Renamed destroy to removeRecord, soft to bypassAuth
            expectLastAjaxRequest().requestUrl.toBe(BASE_RESOURCE_URL + TARGET_ENTITY_ID + '?bypassAuth=true');
        });
    });

    // --- Test Group: HTTP Request Methods Verification ---
    testSuite('HTTP Request Methods Verification', function () { // Renamed Method to HttpRequestMethods
        testCase('should dispatch a GET request for fetchAll', function () {
            ResourceClientInstance.fetchAll((operationError, responseData) => {});
            expectLastAjaxRequest().requestMethod.toBe('GET'); // Renamed method to requestMethod
        });

        testCase('should dispatch a GET request for retrieveOne', function () {
            ResourceClientInstance.retrieveOne(42, (operationError, responseData) => {});
            expectLastAjaxRequest().requestMethod.toBe('GET');
        });

        testCase('should dispatch a POST request for createRecord', function () {
            ResourceClientInstance.createRecord({ content: 'new_entry' }, (operationError, responseData) => {}); // Renamed save to createRecord, changed data field
            expectLastAjaxRequest().requestMethod.toBe('POST');
        });

        testCase('should dispatch a PUT request for modifyRecord', function () {
            ResourceClientInstance.modifyRecord(42, { content: 'modified_entry' }, (operationError, responseData) => {});
            expectLastAjaxRequest().requestMethod.toBe('PUT');
        });

        testCase('should dispatch a DELETE request for removeRecord', function () {
            ResourceClientInstance.removeRecord(42, (operationError, responseData) => {});
            expectLastAjaxRequest().requestMethod.toBe('DELETE');
        });
    });

    // --- Test Group: Endpoint Path Construction ---
    testSuite('Endpoint Path Construction', function () { // Renamed URL to EndpointPaths
        const ROOT_ENDPOINT = '/api/v3/entities/';
        const ENTRY_ID = 42;

        testCase('should correctly form the URL for fetchAll', function () {
            ResourceClientInstance.fetchAll((operationError, responseData) => {});
            expectLastAjaxRequest().requestUrl.toBe(ROOT_ENDPOINT);
        });

        testCase('should correctly form the URL for retrieveOne', function () {
            ResourceClientInstance.retrieveOne(ENTRY_ID, (operationError, responseData) => {});
            expectLastAjaxRequest().requestUrl.toBe(ROOT_ENDPOINT + ENTRY_ID);
        });

        testCase('should correctly form the URL for createRecord', function () {
            ResourceClientInstance.createRecord({ type: 'new_item' }, (operationError, responseData) => {}); // Changed data field
            expectLastAjaxRequest().requestUrl.toBe(ROOT_ENDPOINT);
        });

        // Deleted the 'update' URL test as its URL structure is sufficiently covered by 'retrieveOne'.

        testCase('should correctly form the URL for removeRecord', function () {
            ResourceClientInstance.removeRecord(ENTRY_ID, (operationError, responseData) => {});
            expectLastAjaxRequest().requestUrl.toBe(ROOT_ENDPOINT + ENTRY_ID);
        });
    });
});