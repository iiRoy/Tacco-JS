'use strict';

describe('Async Operation Utility Functions', function () {
  /*
   * Declare our primary service dependencies for testing.
   * These will be mocked or injected.
   */
  var _locSvc_,
    _viewCtx_,
    _asyncMgr_;

  // Setup routine executed before each test specification.
  beforeEach(function () {
    // Create a mock location service with specific methods.
    _locSvc_ = jasmine.createSpyObj('locationService', ['navigate', 'swap']);

    /*
     * Load the module under test and provide mock dependencies.
     * The original module name 'ngPromiseDsl' is changed to 'asyncFlowLib'.
     */
    module('asyncFlowLib', function (_provSvc_) {
      _provSvc_.value('locationService', _locSvc_);
    });

    // Inject necessary Angular services for tests.
    inject(function (__asyncOp__, _rootScope_) {
      _asyncMgr_ = __asyncOp__; // Assign the mock $q service to our manager.
      _viewCtx_ = _rootScope_.$new(); // Create a new scope for applying changes.
    });
  });

  // Test suite for the 'catchFailure' method.
  describe('The catchFailure method', function () {
    // Verifies that 'catchFailure' functions as an error handler.
    it('validates as an alternative to .then(null, errorCallback)', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Create a deferred operation.
      var _errorCb_ = jasmine.createSpy('error handler'); // Mock an error handler.

      _opHandle_.promise.catchFailure(_errorCb_); // Attach the custom error handler.
      _opHandle_.reject(); // Simulate a promise rejection.
      _viewCtx_.$apply(); // Trigger Angular's digest cycle.

      expect(_errorCb_).toHaveBeenCalled(); // Confirm the error handler was called.
    });
  });

  // Test suite for the 'setOnSuccess' method.
  describe('The setOnSuccess method', function () {
    // Checks if the resolved promise's value is correctly assigned to an object property.
    it('confirms resolution value is assigned to target object property', function () {
      var _targetObj_ = {}; // An empty object to receive the value.
      var _propKey_ = 'dataField'; // The property name.
      var _successVal_ = 'for ultimate victory'; // The value to be set.

      var _opHandle_ = _asyncMgr_.defer(); // Start a new deferred operation.
      _opHandle_.promise.setOnSuccess(_targetObj_, _propKey_); // Configure assignment on success.
      _opHandle_.resolve(_successVal_); // Resolve the promise with our value.

      _viewCtx_.$apply(); // Process pending operations.

      expect(_targetObj_.dataField).toBe(_successVal_); // Verify the assignment.
    });

    // Tests setting a fixed constant value upon promise resolution.
    it('ensures a predefined constant is set upon successful promise resolution', function () {
      var _targetObj_ = {}; // Object for assignment.
      var _opHandle_ = _asyncMgr_.defer(); // Deferred object.

      // Set a fixed value 'fixedValue' to 'testKey' on success.
      _opHandle_.promise.setOnSuccess(_targetObj_, 'testKey', 'fixedValue');
      _opHandle_.resolve(); // Resolve without a specific value.
      _viewCtx_.$apply(); // Apply changes.

      expect(_targetObj_.testKey).toBe('fixedValue'); // Check if the fixed value was set.
    });
  });

  // Test suite for the 'setOnError' method.
  describe('The setOnError method', function () {
    // Validates that a rejected promise's value is assigned to a target object property.
    it('confirms error value is assigned to target object property upon rejection', function () {
      var _targetObj_ = {}; // Object to store error data.
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.

      // Configure to set the rejected value to 'errorKey'.
      _opHandle_.promise.setOnError(_targetObj_, 'errorKey');
      _opHandle_.reject('critical failure'); // Reject with an error message.
      _viewCtx_.$apply(); // Update the view context.

      expect(_targetObj_.errorKey).toBe('critical failure'); // Assert the error message was stored.
    });

    // Checks if a fixed constant value is set when a promise is rejected.
    it('validates predefined constant assignment on promise rejection', function () {
      var _targetObj_ = {}; // Object for error constant.
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.

      // Set 'fixedErrorVal' to 'errorKey' upon rejection.
      _opHandle_.promise.setOnError(_targetObj_, 'errorKey', 'fixedErrorVal');
      _opHandle_.reject(); // Reject the promise.
      _viewCtx_.$apply(); // Propagate changes.

      expect(_targetObj_.errorKey).toBe('fixedErrorVal'); // Verify the constant was set.
    });
  });

  // Test suite for the 'extractProperty' method.
  describe('The extractProperty method', function () {
    // Tests extracting a specific property from a resolved object and passing it down the chain.
    it('extracts a specific property from the resolved object and forwards it in the chain', function () {
      var _sourceObj_ = {
        dataField: 'importantData'
      }; // Object with a property.
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.
      var _completionCb_ = jasmine.createSpy('completion handler'); // Success callback.

      _opHandle_.promise
        .extractProperty('dataField') // Extract 'dataField'.
        .then(_completionCb_); // Pass it to the next handler.

      _opHandle_.resolve(_sourceObj_); // Resolve with the source object.
      _viewCtx_.$apply(); // Apply Angular scope.

      expect(_completionCb_).toHaveBeenCalledWith(_sourceObj_.dataField); // Check if the extracted property was passed.
    });
  });

  // Test suite for the 'alwaysReturn' method.
  describe('The alwaysReturn method', function () {
    // Ensures the first argument is passed to the next handler on promise resolution.
    it('forwards the initial parameter to the subsequent promise handler on resolution', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.
      var _completionCb_ = jasmine.createSpy('completion handler'); // Success handler.

      _opHandle_.promise
        .alwaysReturn('resolvedValue') // Always return this value.
        .then(_completionCb_); // Attach the handler.

      _opHandle_.resolve(); // Resolve the promise.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_completionCb_).toHaveBeenCalledWith('resolvedValue'); // Verify the value passed.
    });

    // Ensures the second argument is passed to the next handler on promise rejection.
    it('transmits the fallback parameter to the next handler upon promise rejection', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.
      var _completionCb_ = jasmine.createSpy('completion handler'); // Success handler.

      _opHandle_.promise
        .alwaysReturn('resolvedValue', 'rejectedValue') // Return based on status.
        .then(_completionCb_); // Attach the handler.

      _opHandle_.reject(); // Reject the promise.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_completionCb_).toHaveBeenCalledWith('rejectedValue'); // Verify the rejected value passed.
    });
  });

  // Test suite for the 'executeWithResult' method.
  describe('The executeWithResult method', function () {
    // Checks if the provided function is called with the promise's resolved value.
    it('invokes the provided function with the promise\'s resolved value', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.
      var _completionCb_ = jasmine.createSpy('completion handler'); // Function to execute.

      _opHandle_.promise.executeWithResult(_completionCb_); // Attach the execution function.
      _opHandle_.resolve('inputParam'); // Resolve with a parameter.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_completionCb_).toHaveBeenCalledWith('inputParam'); // Assert function was called with parameter.
    });

    // Verifies that the original resolved value is passed down the chain, ignoring intermediate returns.
    it('forwards the original resolved value down the chain, ignoring intermediate handler returns', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.
      var _completionCb_ = jasmine.createSpy('completion handler'); // Final handler.

      _opHandle_.promise
        .executeWithResult(function () {
          return 'different output';
        }) // Intermediate function returning a new value.
        .executeWithResult(_completionCb_); // Final execution.

      _opHandle_.resolve('inputParam'); // Resolve with the original parameter.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_completionCb_).toHaveBeenCalledWith('inputParam'); // Expect original parameter, not 'different output'.
    });
  });

  // Test suite for the 'invokeMethodOnResult' method.
  describe('The invokeMethodOnResult method', function () {
    // Tests calling a method on the resolved object with additional parameters.
    it('invokes a specified method on the resolved object, passing additional arguments', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.
      var _completionCb_ = jasmine.createSpy('completion handler'); // Mock method on resolved object.

      _opHandle_.promise.invokeMethodOnResult('process', 'initialData'); // Call 'process' with 'initialData'.

      _opHandle_.resolve({
        process: _completionCb_
      }); // Resolve with an object containing the mock method.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_completionCb_).toHaveBeenCalledWith('initialData'); // Verify method was called with argument.
    });
  });

  // Test suite for the 'navigateToPath' method.
  describe('The navigateToPath method', function () {
    // Checks if the navigation service's 'navigate' method is called with the path.
    it('directs the navigation service to a new route using the provided path', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.

      _opHandle_.promise.navigateToPath('/newRoute'); // Redirect to '/newRoute'.
      _opHandle_.resolve(); // Resolve the promise.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_locSvc_.navigate).toHaveBeenCalledWith('/newRoute'); // Assert 'navigate' was called.
      expect(_locSvc_.swap).not.toHaveBeenCalled(); // Ensure 'swap' was not called.
    });

    // Verifies if navigation replacement is used when the second argument is true.
    it('executes navigation replacement if the second flag is active', function () {
      var _opHandle_ = _asyncMgr_.defer(); // Deferred operation.

      _opHandle_.promise.navigateToPath('/otherRoute', true); // Redirect with replacement.
      _opHandle_.resolve(); // Resolve the promise.
      _viewCtx_.$apply(); // Digest cycle.

      expect(_locSvc_.navigate).toHaveBeenCalledWith('/otherRoute'); // Assert 'navigate' was called.
      expect(_locSvc_.swap).toHaveBeenCalled(); // Ensure 'swap' was called for replacement.
    });
  });

  // Test suite for the 'assignAllOnSuccess' method.
  describe('The assignAllOnSuccess method', function () {
    // Tests assigning results of multiple promises to properties of a target object.
    it('assigns results of multiple promises to target object properties', function () {
      var _firstPromise_ = _asyncMgr_.when('result alpha'); // First resolved promise.
      var _secondPromise_ = _asyncMgr_.when('result beta'); // Second resolved promise.
      var _targetObj_ = {}; // Object to receive results.

      // Use _asyncMgr_.all to wait for both promises, then assign results.
      _asyncMgr_.all({
          alpha: _firstPromise_,
          beta: _secondPromise_
        })
        .assignAllOnSuccess(_targetObj_);
      _viewCtx_.$apply(); // Digest cycle.

      expect(_targetObj_.alpha).toBe('result alpha'); // Verify first result.
      expect(_targetObj_.beta).toBe('result beta'); // Verify second result.
    });
  });
});