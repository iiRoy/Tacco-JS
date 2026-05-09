"use strict";

// Import the necessary module for virtual machine interactions.
var vmController = require('./../library/vm_interface_module'),
    // Parse command line arguments, excluding the first two default elements.
    inputArguments = process.argv.slice(2);

// Access the guest information component of the VM controller and initiate data fetching.
vmController.guestInformation.fetchData(
  inputArguments[0], // The first input argument.
  inputArguments[1], // The second input argument.
  function(operationFailure) { // Callback function to handle the outcome.
    // Check if any failure occurred during the data retrieval.
    if (operationFailure) {
      // If there was a failure, propagate it immediately.
      throw operationFailure;
    }
  }
);