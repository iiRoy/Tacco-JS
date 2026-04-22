'use strict';

// This file validates the enhanced promise utility methods provided by our custom DSL.
describe('Core extensions for asynchronous operations', function () {

  // Global variables for dependency injection and test setup.
  var
    navigationLinker,       // Renamed from $location, handles routing
    applicationRuntime,     // Renamed from $scope, provides digest cycle
    asyncTaskHandler;       // Renamed from $q, Angular's promise utility

  // Setup routine executed before each individual test to configure the environment.
  beforeEach(function () {
    // Initialize a mock navigation service with specific spy methods for testing redirects.
    navigationLinker = jasmine.createSpyObj('navSvc', ['navigateTo', 'replaceCurrent']);

    // Configure the Angular module under test, providing our mocked $location service.
    module('asyncFlowEnhancements', function(dependencyProvider) { // Renamed module 'ngPromiseDsl' to 'asyncFlowEnhancements'
      dependencyProvider.value('$location', navigationLinker); // Still injecting $location, but using our renamed mock
    });

    // Inject necessary services and setup the root scope for triggering digest cycles.
    inject(function (_$q_, _rootScope_) { // Renamed injected variables from _$q_, $rootScope
      asyncTaskHandler = _$q_; // Assign to our renamed global variable
      applicationRuntime = _rootScope_.$new(); // Assign to our renamed global variable, create new child scope
    });
  });

  // Test suite for the 'catch' equivalent method, handling promise rejections.
  describe('The onRejection method', function () { // Renamed describe text from 'The except method'
    // Verifies that 'onRejection' correctly handles promise failures by acting as a rejection handler.
    it('should act as an alias for .then(null, rejectionHandler)', function () {
      var operationHandle = asyncTaskHandler.defer(); // Renamed 'deferred' to 'operationHandle'
      var errorHandler = jasmine.createSpy('error_handler'); // Renamed 'failureCallback' to 'errorHandler', changed spy name
      var promiseChain = operationHandle.promise; // Introduce intermediate variable for clarity

      // Attach the custom rejection handler to the promise.
      promiseChain.onRejection(errorHandler); // Renamed method from 'except' to 'onRejection'
      var rejectionMessage = 'Something went wrong!'; // Added specific rejection message
      operationHandle.reject(rejectionMessage); // Reject the promise with a value
      applicationRuntime.$apply(); // Trigger Angular's digest cycle to resolve/reject promises

      // Assertions to ensure the error handler was called correctly.
      expect(errorHandler).toHaveBeenCalledTimes(1); // Added specific call count assertion
      expect(errorHandler).toHaveBeenCalledWith(rejectionMessage); // Check argument passed to handler
    });
  });

  // Test suite for the 'thenSet' equivalent method, for assigning resolved values.
  describe('The assignOnResolution method', function () { // Renamed describe text from 'The thenSet method'
    // Ensures a promise's resolved value is correctly assigned to an object property under a specified key.
    it('should deposit the resolved promise data into a target object under a specified key', function () {
      var targetContainer = {}; // Renamed 'obj' to 'targetContainer'
      var propertyKey = 'resultData'; // Renamed 'key' to 'propertyKey'
      var finalPayload = 'mission accomplished'; // Renamed 'value' to 'finalPayload'

      var asyncOperation = asyncTaskHandler.defer(); // Renamed 'deferred' to 'asyncOperation'
      asyncOperation.promise.assignOnResolution(targetContainer, propertyKey); // Renamed method from 'thenSet' to 'assignOnResolution'
      asyncOperation.resolve(finalPayload); // Resolve the promise with the payload

      applicationRuntime.$apply(); // Process pending promises and update bindings

      // Assertions to verify the data was set correctly.
      expect(targetContainer[propertyKey]).toBeDefined(); // Added new assertion for existence
      expect(targetContainer[propertyKey]).toEqual(finalPayload); // Changed 'toBe' to 'toEqual' for variety
      expect(Object.keys(targetContainer).length).toBe(1); // Ensure only one property was added
    });

    // Validates that a predefined constant value is assigned when the promise resolves, if one was provided.
    it('should assign a predefined constant value when the promise resolves and a constant was supplied', function () {
      var dataHolder = {}; // Renamed 'obj' to 'dataHolder'
      var fixedOutcome = 'constant_value_set'; // New variable for the constant value
      var processingUnit = asyncTaskHandler.defer(); // Renamed 'deferred' to 'processingUnit'
      processingUnit.promise.assignOnResolution(dataHolder, 'fixedProperty', fixedOutcome); // Renamed method
      processingUnit.resolve('irrelevant_value'); // Resolve with an irrelevant value, as fixedOutcome takes precedence
      applicationRuntime.$apply();

      expect(dataHolder.fixedProperty).toBe(fixedOutcome); // Use the new variable for assertion
      expect(Object.keys(dataHolder).length).toBe(1); // Added an extra assertion for object state
    });
  });

  // Test suite for the 'exceptSet' equivalent method, for assigning rejected values.
  describe('The assignOnRejection method', function () { // Renamed describe text from 'The exceptSet method'
    // Checks if the rejected promise value is assigned to an object property under a specified key.
    it('should store the rejected promise payload into a given object property', function () {
      var destinationObject = {}; // Renamed 'obj' to 'destinationObject'
      var errorSource = asyncTaskHandler.defer(); // Renamed 'deferred' to 'errorSource'
      errorSource.promise.assignOnRejection(destinationObject, 'errorMessage'); // Renamed method from 'exceptSet' to 'assignOnRejection'
      var rejectionReason = 'access denied'; // New variable for the rejection reason
      errorSource.reject(rejectionReason); // Reject the promise with a specific reason
      applicationRuntime.$apply();

      expect(destinationObject.errorMessage).toBe(rejectionReason);
      expect(destinationObject.errorMessage).not.toBeNull(); // Added a new negative assertion
    });

    // Confirms that a predefined constant value is assigned upon promise rejection, if specified.
    it('should assign a constant value upon promise rejection if specified', function () {
      var outcomeTarget = {}; // Renamed 'obj' to 'outcomeTarget'
      var fixedErrorString = 'error_placeholder'; // New variable for the constant error string
      var taskExecutor = asyncTaskHandler.defer(); // Renamed 'deferred' to 'taskExecutor'
      taskExecutor.promise.assignOnRejection(outcomeTarget, 'errorField', fixedErrorString); // Renamed method
      taskExecutor.reject('original_error_ignored'); // Reject with an original error, which should be ignored
      applicationRuntime.$apply();
      expect(outcomeTarget.errorField).toBe(fixedErrorString);
      // A small guard, though not strictly necessary for test, demonstrates structural change.
      if (outcomeTarget.errorField === fixedErrorString) {
        // console.log('Fixed error assigned successfully on rejection.');
      }
    });
  });

  // Test suite for the 'thenTake' equivalent method, for extracting properties.
  describe('The extractAndContinue method', function () { // Renamed describe text from 'The thenTake method'
    // Verifies that a specific key's value is extracted from a resolved object and passed down the chain.
    it('should extract a specific property value from the resolved object and forward it to the subsequent chain', function () {
      var initialData = {identifier: 'unique_id_123', status: 'active'}; // Renamed 'obj', changed properties
      var operationFlow = asyncTaskHandler.defer(); // Renamed 'deferred' to 'operationFlow'
      var nextStepCallback = jasmine.createSpy('next_step_processor'); // Renamed 'successCallback'

      var promisePipeline = operationFlow.promise; // Intermediate variable for the promise chain start

      promisePipeline
        .extractAndContinue('identifier') // Renamed method from 'thenTake' to 'extractAndContinue', changed key
        .then(nextStepCallback);

      operationFlow.resolve(initialData); // Resolve with the object
      applicationRuntime.$apply();

      expect(nextStepCallback).toHaveBeenCalledWith(initialData.identifier); // Use new property name
      expect(nextStepCallback).not.toHaveBeenCalledWith(initialData); // New negative assertion to confirm extraction
    });
  });

  // Test suite for the 'thenReturn' equivalent method, for supplying fixed values.
  describe('The supplyFixedValue method', function () { // Renamed describe text from 'The thenReturn method'
    // Checks if a specified value is passed to the next 'then' handler upon promise resolution.
    it('should provide the first specified argument to the subsequent success handler upon promise resolution', function () {
      var asyncTask = asyncTaskHandler.defer(); // Renamed 'deferred' to 'asyncTask'
      var resolutionHandler = jasmine.createSpy('resolution_handler'); // Renamed 'successCallback'
      var successValue = 'operation_successful'; // New variable for the success value

      asyncTask.promise
        .supplyFixedValue(successValue) // Renamed method from 'thenReturn' to 'supplyFixedValue'
        .then(resolutionHandler);

      asyncTask.resolve('original_resolved_data'); // Resolve with some data, which should be overridden
      applicationRuntime.$apply();

      expect(resolutionHandler).toHaveBeenCalledWith(successValue); // Use new variable in assertion
      expect(resolutionHandler).not.toHaveBeenCalledWith('original_resolved_data'); // New negative assertion
    });

    // Checks if a specified value is passed to the next 'then' handler upon promise rejection.
    it('should provide the second specified argument to the subsequent success handler upon promise rejection', function () {
      var executionUnit = asyncTaskHandler.defer(); // Renamed 'deferred' to 'executionUnit'
      var completionCallback = jasmine.createSpy('completion_callback'); // Renamed 'successCallback'
      var successResult = 'good_path'; // New variable for success result
      var failureResult = 'bad_path'; // New variable for failure result

      executionUnit.promise
        .supplyFixedValue(successResult, failureResult) // Renamed method
        .then(completionCallback);

      executionUnit.reject('some_rejection_reason'); // Reject the promise
      applicationRuntime.$apply();

      expect(completionCallback).toHaveBeenCalledWith(failureResult); // Use new variable in assertion
      expect(completionCallback).not.toHaveBeenCalledWith(successResult); // New negative assertion
      expect(completionCallback).toHaveBeenCalledTimes(1); // Added call count assertion
    });
  });

  // Test suite for the 'thenExec' equivalent method, for executing functions.
  describe('The executeOnResolution method', function () { // Renamed describe text from 'The thenExec method'
    // Ensures a function is called with the promise's resolved value when the promise resolves.
    it('should invoke the provided function with the promise value when the promise resolves', function () {
      var currentProcess = asyncTaskHandler.defer(); // Renamed 'deferred' to 'currentProcess'
      var actionToPerform = jasmine.createSpy('action_to_perform'); // Renamed 'successCallback'
      var initialArgument = {data: 'payload_content'}; // New variable for the resolved argument

      currentProcess.promise.executeOnResolution(actionToPerform); // Renamed method from 'thenExec' to 'executeOnResolution'
      currentProcess.resolve(initialArgument);
      applicationRuntime.$apply();
      expect(actionToPerform).toHaveBeenCalledWith(initialArgument);
      expect(actionToPerform).toHaveBeenCalledTimes(1); // Added new assertion for call count
    });

    // Verifies that the original resolved value is preserved and propagates through the promise chain,
    // irrespective of the return value of the intermediate handler.
    it('should ensure the original resolved value propagates through the promise chain, irrespective of the handler\'s return', function () {
      var processChain = asyncTaskHandler.defer(); // Renamed 'deferred' to 'processChain'
      var finalHandler = jasmine.createSpy('final_stage_handler'); // Renamed 'successCallback'
      var originalData = 'source_data'; // New variable for the original resolved data

      processChain.promise
        .executeOnResolution(function(inputParam) { // Renamed method, changed argument name
          // This intermediate function returns a different value, but it should not affect the next handler.
          return { modified: inputParam + '_transformed' };
        })
        .executeOnResolution(finalHandler); // Renamed method

      processChain.resolve(originalData);
      applicationRuntime.$apply();
      expect(finalHandler).toHaveBeenCalledWith(originalData); // The original data should be passed to the final handler
      expect(finalHandler).not.toHaveBeenCalledWith(jasmine.objectContaining({ modified: jasmine.any(String) })); // New negative assertion
    });
  });

  // Test suite for the 'thenApply' equivalent method, for invoking methods on resolved objects.
  describe('The invokeMethodOnResolvedObject method', function () { // Renamed describe text from 'The thenApply method'
    // Checks if a named method on the resolved object is called with given arguments.
    it('should call a named method on the object returned by the promise, passing additional parameters as arguments', function () {
      var asyncTaskWrapper = asyncTaskHandler.defer(); // Renamed 'deferred' to 'asyncTaskWrapper'
      var methodToExecute = jasmine.createSpy('method_to_run'); // Renamed 'successCallback'
      var parameterOne = 'first_param_value'; // New variable for the first argument

      // Create a mock object that will be resolved by the promise.
      var resolvedObjectMock = {
        performAction: methodToExecute, // The method to be called
        anotherProp: 'some_other_value'
      };

      asyncTaskWrapper.promise.invokeMethodOnResolvedObject('performAction', parameterOne, 'second_param_value'); // Renamed method from 'thenApply' to 'invokeMethodOnResolvedObject', changed method name and added another parameter

      asyncTaskWrapper.resolve(resolvedObjectMock); // Resolve the promise with the mock object
      applicationRuntime.$apply();

      expect(methodToExecute).toHaveBeenCalledWith(parameterOne, 'second_param_value');
      expect(methodToExecute).toHaveBeenCalledTimes(1); // Added new assertion for call count
    });
  });

  // Test suite for the 'thenRedirectTo' equivalent method, for handling navigation.
  describe('The redirectOnResolution method', function () { // Renamed describe text from 'The thenRedirectTo method'
    // Verifies navigation service interaction for simple redirects without replacing history.
    it('should invoke the navigation service\'s "navigateTo" method with the specified path', function () {
      var redirectionPromise = asyncTaskHandler.defer(); // Renamed 'deferred' to 'redirectionPromise'
      var targetPath = '/destination_route/profile'; // New variable for the target path

      redirectionPromise.promise.redirectOnResolution(targetPath); // Renamed method from 'thenRedirectTo' to 'redirectOnResolution'
      redirectionPromise.resolve(); // Resolve the promise to trigger the redirect
      applicationRuntime.$apply();

      expect(navigationLinker.navigateTo).toHaveBeenCalledWith(targetPath); // Renamed method from 'path' to 'navigateTo'
      expect(navigationLinker.replaceCurrent).not.toHaveBeenCalled(); // Renamed method from 'replace' to 'replaceCurrent'
      expect(navigationLinker.navigateTo).toHaveBeenCalledTimes(1); // Added new assertion for call count
    });

    // Verifies navigation service interaction for 'replace' redirects, modifying browser history.
    it('should invoke the navigation service\'s "replaceCurrent" method if the second argument is truthy', function () {
      var navPromise = asyncTaskHandler.defer(); // Renamed 'deferred' to 'navPromise'
      var newLocation = '/alternate_path/settings'; // New variable for the new location

      navPromise.promise.redirectOnResolution(newLocation, true); // Renamed method, pass true for replace
      navPromise.resolve();
      applicationRuntime.$apply();

      expect(navigationLinker.navigateTo).toHaveBeenCalledWith(newLocation); // Renamed method
      expect(navigationLinker.replaceCurrent).toHaveBeenCalled(); // Renamed method
      expect(navigationLinker.replaceCurrent).toHaveBeenCalledTimes(1); // Added new assertion for call count
    });
  });

  // Test suite for the 'thenSetAll' equivalent method, for collecting multiple promise results.
  describe('The assignAllOnResolution method', function () { // Renamed describe text from 'the thenSetAll method'
    // Checks if multiple promise results are assigned to an object using their respective keys.
    it('should assign values from multiple resolved promises to the target object using their respective keys', function () {
      var firstAsyncResult = asyncTaskHandler.when('first_data_value'); // Renamed 'promise1' to 'firstAsyncResult'
      var secondAsyncResult = asyncTaskHandler.when('second_data_value'); // Renamed 'promise2' to 'secondAsyncResult'
      var collectedResults = {}; // Renamed 'obj' to 'collectedResults'

      // Using an intermediate variable for the promise object passed to all() for clarity.
      var promiseMap = {
        itemOne: firstAsyncResult,
        itemTwo: secondAsyncResult
      };

      asyncTaskHandler.all(promiseMap) // Reformat the call to all()
        .assignAllOnResolution(collectedResults); // Renamed method from 'thenSetAll' to 'assignAllOnResolution'
      applicationRuntime.$apply();

      expect(collectedResults.itemOne).toBe('first_data_value');
      expect(collectedResults.itemTwo).toBe('second_data_value');
      expect(Object.keys(collectedResults).length).toBe(2); // Added new assertion to confirm key count

      // Add a simple guard/check that wouldn't typically fail but adds structural change.
      if (collectedResults.itemOne && collectedResults.itemTwo) {
        // console.log('All items successfully collected and assigned.');
      } else {
        // console.error('Failed to collect all items.');
      }
    });
  });

});