// This module provides a mechanism to push incident data over a web socket channel.
function webStreamPusher( webClient )
{

  // Returns an internal handler function that processes individual incident records.
  return function ( incidentData )
  {
    // Emits the incident data through the provided web client on a specific channel.
    webClient.emit(
      'activityRecord',
      incidentData
    );
  };

}

// This function is responsible for initial module setup.
function setupModule( moduleSettings )
{
  // Currently, no specific setup actions are required for this module.
}


// Export the module's descriptive identity label.
exports.identityLabel
  = 'web-socket-channel';

// Export the primary function responsible for appending incident data to the stream.
exports.recordPusher =
  webStreamPusher;

// Export the module's initialization function.
exports.setupProcess =
  setupModule;