angularTesting.moduleSuite('Integration: libraryDataProcessor', function () {

    // Initialize the Angular application module for testing purposes.
    // This loads the 'htmlNow' module into the test environment.
    beforeEach(angular.mock.module('htmlNow'));

    /**
     * @private
     * @type {object} libraryDataProcessorInstance - Reference to the service under test.
     * @type {object} httpBackendStub - Reference to the mocked HTTP backend service.
     */
    var libraryDataProcessorInstance, httpBackendStub;

    // Before each individual test specification runs, inject the necessary services.
    // This ensures a fresh instance of the service and mock backend for every test.
    beforeEach(angular.mock.inject(function (_libraryDataProcessor_, _$httpBackend_) {
        libraryDataProcessorInstance = _libraryDataProcessor_;
        httpBackendStub = _$httpBackend_;
    }));

    // After each test completes, verify that all expected HTTP requests have been handled
    // and that there are no pending requests or expectations. This helps catch unfulfilled mocks.
    afterEach(function() {
        httpBackendStub.verifyNoOutstandingRequest();
        httpBackendStub.verifyNoOutstandingExpectation();
    });

    /**
     * A utility function within the test suite to extract specific data (versions)
     * from an array of library objects. This demonstrates a structural addition.
     * @param {Array<Object>} libraryRecordSet - An array of library objects, each expected to have a 'versionValue' property.
     * @returns {Array<string>} An array containing the 'versionValue' from each object, or an empty array if input is invalid.
     */
    function extractLibraryVersions(libraryRecordSet) {
        // Basic input validation as a guard clause
        if (!Array.isArray(libraryRecordSet) || libraryRecordSet.length === 0) {
            console.warn("Attempted to extract versions from an invalid or empty library record set.");
            return [];
        }
        return libraryRecordSet.map(function(libEntry) {
            return libEntry.versionValue;
        });
    }

    // Test Case 1: Validate the existence and type of the primary data retrieval method.
    // This confirms the service's public interface is as expected.
    testCase('verifies retrieveLibraryInfo method availability', function () {
        // Assert that 'retrieveLibraryInfo' property exists and is a function.
        expect(typeof libraryDataProcessorInstance.retrieveLibraryInfo).toEqual('function');
    });

    // Test Case 2: Confirm the service accurately processes API responses
    // to extract and match specific library version information.
    testCase('confirms correct library version extraction from API response', function () {

        // Define a detailed mock payload that simulates the API response structure.
        // Note the change in field names and addition of new fields like 'identifier' and 'category'.
        var simulatedApiPayload = [
            {
                "identifier": "jquery_core_v1",
                "label": "jQuery v1",
                "sourceUrl": "//cdn.jsdelivr.net/jquery/###/jquery.js",
                "versionValue": "1.11.2",
                "category": "javascript-framework"
            },
            {
                "identifier": "jquery_migrate_plugin",
                "label": "jQuery-migrate",
                "sourceUrl": "//cdn.jsdelivr.net/jquery.migrate/###/jquery-migrate.js",
                "versionValue": "1.2.1",
                "category": "javascript-plugin"
            },
            {
                "identifier": "jquery_core_v2",
                "label": "jQuery v2",
                "sourceUrl": "//cdn.jsdelivr.net/jquery/###/jquery.js",
                "versionValue": "2.1.3",
                "category": "javascript-framework"
            }
        ];

        // Pre-define the expected version values for clarity and reusability in assertions.
        var expectedVersionSequence = [
            '1.11.2',
            '1.2.1',
            '2.1.3'
        ];

        // Configure the mock HTTP backend to intercept a specific GET request
        // and respond with our simulated payload and a 200 OK status.
        httpBackendStub.expectGET('/api/v2/libs').respond(200, simulatedApiPayload);

        // Call the service method, passing a callback function to handle the asynchronous result.
        libraryDataProcessorInstance.retrieveLibraryInfo(function (apiResultContainer) {
            // Introduce a guard clause to handle unexpected or malformed API responses gracefully.
            if (!apiResultContainer || !Array.isArray(apiResultContainer.data)) {
                fail("API result container or its data property was not in the expected array format.");
                return;
            }

            // Utilize the locally defined helper function to extract versions from the response data.
            var actualVersionsObtained = extractLibraryVersions(apiResultContainer.data);

            // Assert that the extracted versions precisely match our predefined expectations.
            expect(actualVersionsObtained).toEqual(expectedVersionSequence);

            // A non-essential log statement for test flow visibility.
            console.log("Library version matching test completed successfully.");
        });

        // Crucially, flush the HTTP backend to trigger the mocked response and execute the callback.
        httpBackendStub.flush();

    });

});