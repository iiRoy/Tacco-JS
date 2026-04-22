testSuite('Resource API Interaction Tests', function () {
  let EntityService;

  // This setup routine runs before each individual test case.
  setupTest(function () {
    mockXHR.activate(); // Initialize the mock XHR environment.
    // Configure the resource client with a base URL and resource path.
    EntityService = new ResourceClient({
      baseURL: '/api/v4/',       // Updated API version for differentiation.
      resourceName: 'entities'   // Generalised resource identifier.
    });
  });

  // This teardown routine runs after each individual test case.
  teardownTest(function () {
    mockXHR.deactivate(); // Clean up the mock XHR environment.
  });

  testSuite('Parameter Handling', function () {

    // Verifies that a non-object parameter for queries results in an error.
    shouldVerify('should_reject_non_object_params_for_query', function () {
      attemptBlock: try {
        EntityService.retrieveAll(function (issue, payload) { /* Callback for success/failure */ }, 'invalid_string_param');
      }
      handleException: catch (issue) {
        // Assert the error message matches the expected string.
        assert(issue.text).toBeEquivalentTo('Request_parameters_must_be_an_object.');
      }
    });

    // Confirms that no query string is appended if parameters are not provided.
    shouldVerify('should_not_append_query_if_empty', function () {
      EntityService.retrieveAll(function (issue, payload) { /* Empty callback */ });
      // Check the URL of the most recent request.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/');
    });

    // Ensures query parameters are correctly appended for the 'retrieveAll' operation.
    shouldVerify('should_add_query_for_all_entities', function () {
      EntityService.retrieveAll(function (issue, payload) { }, { category: 'excellent', occupation: 'programmers' });
      // Validate the full URL including the appended query string.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/?category=excellent&occupation=programmers');
    });

    // Verifies query parameters are correctly appended for the 'fetchOne' operation.
    shouldVerify('should_add_query_for_single_entity_retrieval', function () {
      EntityService.fetchOne(23, function (issue, payload) { }, { role: 'engineers' });
      // Confirm the URL includes the entity identifier and query string.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/23?role=engineers');
    });

    // Checks query parameters are correctly appended for the 'createRecord' operation.
    shouldVerify('should_add_query_for_record_creation', function () {
      EntityService.createRecord({ label: 'serviceName' }, function (issue, payload) { }, { position: 'coders' });
      // Assert the creation URL includes the query string.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/?position=coders');
    });

    // Ensures query parameters are correctly appended for the 'modifyRecord' operation.
    shouldVerify('should_add_query_for_record_modification', function () {
      EntityService.modifyRecord(23, { label: 'serviceName' }, function (issue, payload) { }, { modificationStatus: 'field' });
      // Validate the update URL contains the identifier and query string.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/23?modificationStatus=field');
    });

    // Confirms query parameters are correctly appended for the 'removeRecord' operation.
    shouldVerify('should_add_query_for_record_removal', function () {
      EntityService.removeRecord(23, function (issue, payload) { }, { softDelete: true });
      // Check the deletion URL includes the identifier and query string.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/23?softDelete=true');
    });
  });

  testSuite('HTTPMethods', function () {

    // Tests that 'retrieveAll' sends a GET request.
    shouldVerify('should_use_GET_for_all_records', function () {
      EntityService.retrieveAll(function (issue, payload) { });
      // Assert the HTTP method of the last request.
      assert(mockXHR.latestRequest.httpMethod).match('GET');
    });

    // Tests that 'fetchOne' sends a GET request.
    shouldVerify('should_use_GET_for_single_record_fetch', function () {
      EntityService.fetchOne(23, function (issue, payload) { });
      // Confirm the HTTP method.
      assert(mockXHR.latestRequest.httpMethod).match('GET');
    });

    // Tests that 'createRecord' sends a POST request.
    shouldVerify('should_use_POST_for_record_creation', function () {
      EntityService.createRecord({ identifier: 23 }, function (issue, payload) { });
      // Verify the HTTP method.
      assert(mockXHR.latestRequest.httpMethod).match('POST');
    });

    // Tests that 'modifyRecord' sends a PUT request.
    shouldVerify('should_use_PUT_for_record_modification', function () {
      EntityService.modifyRecord(23, { label: 'serviceName' }, function (issue, payload) { });
      // Assert the HTTP method.
      assert(mockXHR.latestRequest.httpMethod).match('PUT');
    });

    // Tests that 'removeRecord' sends a DELETE request.
    shouldVerify('should_use_DELETE_for_record_removal', function () {
      EntityService.removeRecord(23, function (issue, payload) { });
      // Confirm the HTTP method.
      assert(mockXHR.latestRequest.httpMethod).match('DELETE');
    });
  });

  testSuite('EndpointValidation', function () {

    // Verifies the correct URL for retrieving all records.
    shouldVerify('should_resolve_correct_endpoint_for_all_records', function () {
      EntityService.retrieveAll(function (issue, payload) { });
      // Assert the URL is exactly as expected.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/');
    });

    // Verifies the correct URL for fetching a single record.
    shouldVerify('should_resolve_correct_endpoint_for_single_record_fetch', function () {
      EntityService.fetchOne(23, function (issue, payload) { });
      // Assert the URL includes the specific entity identifier.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/23');
    });

    // Verifies the correct URL for creating a new record.
    shouldVerify('should_resolve_correct_endpoint_for_record_creation', function () {
      EntityService.createRecord({ identifier: 23 }, function (issue, payload) { });
      // Assert the URL is for the collection, not an individual record.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/');
    });

    // Verifies the correct URL for updating an existing record.
    shouldVerify('should_resolve_correct_endpoint_for_record_modification', function () {
      EntityService.modifyRecord(23, { label: 'serviceName' }, function (issue, payload) { });
      // Assert the URL includes the specific entity identifier for update.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/23');
    });

    // Verifies the correct URL for deleting a record.
    shouldVerify('should_resolve_correct_endpoint_for_record_removal', function () {
      EntityService.removeRecord(23, function (issue, payload) { });
      // Assert the URL includes the specific entity identifier for deletion.
      assert(mockXHR.latestRequest.uri).match('/api/v4/entities/23');
    });
  });
});