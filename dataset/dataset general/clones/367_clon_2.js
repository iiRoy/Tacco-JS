/* This module provides functionality for interacting with a secure messaging service. */
function SecureMessenger(serviceEndpoint, countryCode, phoneNum, deviceSerial) {
  // Initialize instance properties with provided configuration details.
  this.serviceEndpoint = serviceEndpoint;
  this.countryCode = countryCode;
  this.phoneNum = phoneNum;
  this.deviceSerial = deviceSerial;

  /**
   * Executes a synchronous request to the messaging service.
   *
   * @param {string} operationType - The specific operation to be performed.
   * @param {object} requestArguments - Parameters for the operation.
   * @returns {string|null} The raw response text from the server, or null if no response.
   */
  this.performSynchronousRequest = function(operationType, requestArguments) {
    // Prepare identification details for the request.
    var userIdentification = {};
    userIdentification.countryCode = this.countryCode;
    userIdentification.phoneNum = this.phoneNum;
    userIdentification.deviceSerial = this.deviceSerial;

    // Prepare the details of the requested operation.
    var requestOperation = {};
    requestOperation.operationType = operationType;
    requestOperation.requestArguments = requestArguments;

    // Send the AJAX request synchronously.
    var serverResponse = $.ajax({
      type: "POST", // HTTP method for data submission
      url: this.serviceEndpoint,
      data: {
        userIdentification: userIdentification,
        requestOperation: requestOperation
      }, // Encapsulate data in a single object
      dataType: "json", // Expect JSON response
      async: false, // Ensure synchronous execution
      success: function(receivedData) {
        // This success handler runs, but its return value is not directly used by the outer scope in async:false.
        // The responseText is captured directly.
        return receivedData;
      }
    }).responseText; // Retrieve the raw text response from the server.

    // Return the server's response if available.
    if (serverResponse) return serverResponse;
  };


  /**
   * Executes an asynchronous request to the messaging service.
   * The result is handled by a provided callback function.
   *
   * @param {string} operationType - The specific operation to be performed.
   * @param {object} requestArguments - Parameters for the operation.
   * @param {function} completionCallback - Function to call upon request completion (success or failure).
   */
  this.performAsynchronousRequest = function(operationType, requestArguments, completionCallback) {
    // Construct user identification object.
    var userIdentification = {};
    userIdentification.countryCode = this.countryCode;
    userIdentification.phoneNum = this.phoneNum;
    userIdentification.deviceSerial = this.deviceSerial;

    // Construct request operation object.
    var requestOperation = {};
    requestOperation.operationType = operationType;
    requestOperation.requestArguments = requestArguments;

    // Initiate the asynchronous AJAX call.
    $.ajax({
      type: "POST", // Standard POST request
      url: this.serviceEndpoint,
      data: {
        userIdentification: userIdentification,
        requestOperation: requestOperation
      }, // Data payload for the request
      dataType: "json", // Expected data format from server
      async: true // Asynchronous execution
    }).done(completionCallback); // Attach the callback to handle successful completion.
  };

}