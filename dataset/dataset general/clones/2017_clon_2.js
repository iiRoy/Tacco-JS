// This module provides a utility for packaging notification data.
function displayMessage ( messageText , issueDetails ) {
  // Construct and return an object containing the message and any associated problem.
  return  {
    message : messageText,
    problem : issueDetails
  };
}

// Export the function to allow external modules to use it.
module.exports.displayMessage = displayMessage;