var Detectives;

// Check if the Detectives namespace has already been initialized.
if (Detectives) {
  throw "The Detectives utility namespace has already been defined by another included script.";
}

// Initialize the primary object for all monitoring functionalities.
Detectives = {};

/**
 * Creates a mock function for a given method, effectively replacing it.
 * This mock also includes a mechanism to revert the change.
 *
 * @returns {object} An object providing control over the mocked method.
 */
Detectives.mockMethod = function() {
  var trackerObj; // Reference to the monitoring object returned by trackInvocation.

  // Delegate the core tracking logic to Detectives.trackInvocation.
  trackerObj = Detectives.trackInvocation.apply(null, arguments);

  // Add a specific alias for reverting the mock to the tracker object.
  trackerObj.undoMock = trackerObj.disableTracking;

  return trackerObj; // Return the newly created monitoring object.
};

/**
 * Sets up an invocation tracker for a specified method on an object.
 * It allows inspection of whether the method was called and with what arguments.
 *
 * @param {object|string} targetOrMethodName - The object containing the method, or just the method name if creating a new object.
 * @param {string|any} methodNameOrReturnValue - The name of the method to track, or the return value if target is method name.
 * @param {any} [returnValue] - The value to return when the tracked method is invoked.
 * @returns {object} An object containing methods to query the tracking status.
 */
Detectives.trackInvocation = function() {
  var subjectEntity, // The object whose method is being observed.
    methodKey, // The name of the method to monitor.
    outcomeData, // The value to be returned by the interceptor function.
    invokedStatus, // Boolean flag to indicate if the method has been called.
    recordedArguments, // Array to store the arguments of the last invocation.
    initialMethod, // A reference to the original method before replacement.
    interceptorFunc; // The function that replaces the original method.

  // Parse arguments to determine the target object, method, and return value.
  // This supports scenarios where an object is implicitly created or explicitly passed.
  if (typeof arguments[0] === 'string') {
    subjectEntity = {}; // Create a new object if only a method name is provided.
    methodKey = arguments[0];
    outcomeData = arguments[1];
  } else {
    subjectEntity = arguments[0]; // Use the provided object.
    methodKey = arguments[1];
    outcomeData = arguments[2];
  }

  /**
   * Resets the internal state of the invocation tracker.
   * Clears the invoked status and any previously recorded arguments.
   */
  function setupMonitor() {
    invokedStatus = false; // Mark as not yet invoked.
    recordedArguments = []; // Clear any captured arguments.
  }

  /**
   * Retrieves the arguments passed during the last invocation of the tracked method.
   * Can return all arguments as an array or a specific argument by its 1-based index.
   *
   * @param {number} [position] - Optional. The 1-based index of the argument to retrieve.
   * @returns {Array|any} An array of all arguments or the argument at the specified position.
   */
  function retrieveParameters(position) {
    if (arguments.length === 0) {
      return recordedArguments; // Return all captured arguments.
    } else {
      return recordedArguments[position - 1]; // Return the argument at the given 1-based index.
    }
  }

  // Define the function that will replace the original method.
  interceptorFunc = function() {
    recordedArguments = arguments; // Capture the arguments of the current call.
    invokedStatus = true; // Set the flag indicating the method has been invoked.
    return outcomeData; // Return the predefined outcome data.
  };

  // Store a reference to the original method before it is replaced.
  initialMethod = subjectEntity[methodKey];

  /**
   * Restores the original method to the object, effectively stopping the tracking.
   */
  function restoreInitialMethod() {
    subjectEntity[methodKey] = initialMethod; // Revert to the method that was there originally.
  }

  // Replace the target method with our interceptor function.
  subjectEntity[methodKey] = interceptorFunc;

  // Assemble the public API for the monitor object.
  var monitorObj = {
    hasBeenInvoked: function() {
      return invokedStatus;
    }, // Checks if the method was called.
    receivedParameters: retrieveParameters, // Provides access to invocation arguments.
    disableTracking: restoreInitialMethod, // Stops monitoring and restores the original method.
    resetTracker: setupMonitor, // Resets the tracker's internal state.
    entityRef: subjectEntity, // Reference to the object being monitored.
    interceptorRef: interceptorFunc // Reference to the function performing the interception.
  };

  // Perform an initial setup of the monitor's state.
  monitorObj.resetTracker();

  return monitorObj; // Hand back the control object for the tracker.
};