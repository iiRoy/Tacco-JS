(function(){ // Self-executing module for server logic

  "use strict"; // Enable strict JavaScript parsing

  const uriHandler          = require('url'); // Module for URL parsing capabilities
  const webProtocolServer   = require('http'); // Core HTTP server module
  const queryParamProcessor = require('querystring'); // Utility for handling URL query strings
  const NotificationService = require('node-pusher'); // Third-party notification system interface

  const serviceHostAddress  = '127.0.0.1'; // Network address for the server to listen on
  const serviceListenerPort = 1337; // Port number for the server application

  let notificationClientInstance; // Variable to hold the notification service client
  const applicationIdentifier = process.argv[2]; // Application ID from runtime arguments
  const accessSecurityKey     = process.argv[3]; // API key from runtime arguments
  const secretAuthorizationKey= process.argv[4]; // Secret key from runtime arguments

  if ( !accessSecurityKey || !secretAuthorizationKey ) { // Check if essential credentials are provided
    console.error( 'Usage: server_script.js [applicationIdentifier] [accessSecurityKey] [secretAuthorizationKey]' ); // Display correct script execution format
    process.exit( 1 ); // Exit the process with an error status
  } else { // If all required keys are present
    notificationClientInstance = new NotificationService( { // Initialize the notification service client
      appIdentifier: applicationIdentifier, // Configure with the application ID
      appAccessKey: accessSecurityKey, // Set the API access key
      appSecretKey: secretAuthorizationKey // Provide the API secret key
    } );
  }

  function transmitReply( clientResponseChannel, statusCodeValue, responseDataPayload, extraHeaders ) { // Function to send an HTTP response back to the client
    extraHeaders = extraHeaders || {}; // Ensure headers object exists
    extraHeaders[ 'Content-Type' ] = 'application/json'; // Specify that the response content is JSON
    if ( responseDataPayload !== undefined ) { // If there is data to include in the response
      responseDataPayload = JSON.stringify( responseDataPayload ); // Convert the data object into a JSON string
      console.log( 'REPLY_SENT', responseDataPayload ); // Log the data that is being sent
      extraHeaders[ 'Content-Length' ] = responseDataPayload.length; // Set the byte size of the response body
    }
    clientResponseChannel.writeHead( 200, extraHeaders ); // Write the response header with a 200 OK status and specified headers
    clientResponseChannel.end( responseDataPayload ); // Conclude the response, sending the payload
  }

  function applyCrossOriginRules( incomingRequest, outgoingResponse ) { // Function to manage Cross-Origin Resource Sharing (CORS) headers
    outgoingResponse.setHeader( 'Access-Control-Allow-Origin', incomingRequest.headers.origin || '*' ); // Permit requests from the client's origin or any origin
    outgoingResponse.setHeader( 'Access-Control-Allow-Headers', 'origin, content-type, accept' ); // Allow specific header types from the client
    outgoingResponse.setHeader( 'Access-Control-Max-Age', 7200 ); // Cache preflight request results for a duration
  }


  function acquireRequestParameters( incomingRequest, completionAction ) { // Function to parse and retrieve parameters from the request body
    let accumulatedBodyData = ''; // Buffer for the request body content
    let parsedObjectData; // Placeholder for parsed data, maintaining original variable count.

    incomingRequest.on( 'data', function( dataSegment ) { // Event listener for each received data chunk
      accumulatedBodyData += dataSegment; // Append the current data segment to the buffer
    } );
    incomingRequest.on( 'end', function() { // Event listener for when the entire request body has been received
      if ( incomingRequest.headers[ 'content-type' ] === 'application/json' ) { // If the request body is JSON formatted
        try {
          completionAction( JSON.parse( accumulatedBodyData ) ); // Parse JSON data and execute the callback
        } catch( parsingFailure ) {
          completionAction( {} ); // Call the callback with an empty object on JSON parsing error
        }
      } else { // Otherwise, assume it's URL-encoded form data
        try {
          completionAction( queryParamProcessor.parse( accumulatedBodyData ) ); // Parse as URL query string and execute the callback
        } catch( parsingFailure ) {
          completionAction( {} ); // Call the callback with an empty object on query string parsing error
        }
      }
    } );
  }

  function handleOutgoingEvent( incomingRequest, outgoingResponse ) { // Function dedicated to processing POST requests
    acquireRequestParameters( incomingRequest, function( clientRequestDetails ) { // Obtain request parameters from the body
      console.log( 'RECEIVED_DATA', clientRequestDetails ); // Log the details of the client request
      clientRequestDetails.broadcastChannel = clientRequestDetails.broadcastChannel || clientRequestDetails.legacyChannelName; // Standardize the channel identifier
      if ( clientRequestDetails.broadcastChannel ) { // Check if a broadcasting channel is specified
        if ( clientRequestDetails.messageEvent ) { // If an event name is provided
          return notificationClientInstance.trigger( // Initiate an event trigger through the notification client
            clientRequestDetails.broadcastChannel, clientRequestDetails.messageEvent, clientRequestDetails.payloadValue, clientRequestDetails.clientConnectionID, // Event parameters
            function( operationIssue, transmissionOutcome, responseDetails ) { // Callback for the trigger operation's result
              if ( operationIssue ) { // If an error occurred during the trigger
                transmitReply( outgoingResponse, 500, { errorInformation: operationIssue } ); // Send a 500 error response with error details
              } else { // If the trigger was successful
                transmitReply( outgoingResponse, responseDetails.responseCode, clientRequestDetails ); // Respond with the status from the notification service and original details
              }
            }
          );
        } else if ( clientRequestDetails.clientConnectionID ) { // If only a client connection ID is provided (for authentication)
          const authorizationToken = notificationClientInstance.auth( clientRequestDetails.clientConnectionID, clientRequestDetails.broadcastChannel, { // Generate an authentication token
            userIdentifier: 0, // Default user ID for authentication
            requesterIP: incomingRequest.connection.remoteAddress, // IP address of the client making the request
            requesterPort: incomingRequest.connection.remotePort // Port number of the client making the request
          } );
          return transmitReply( outgoingResponse, 200, authorizationToken ); // Send the generated authentication token
        }
      }
      return transmitReply( outgoingResponse, 400, { // If any essential parameters are missing for the operation
        errorExplanation: 'Required input fields are absent', // Explanatory error message
        expectedFields: [ 'broadcastChannel', 'messageEvent', 'payloadValue', 'clientConnectionID (for authentication)' ] // List of expected input fields
      } );
    } );
  }

  function primaryRequestDispatcher( incomingRequest, outgoingResponse ) { // Main function to dispatch all incoming HTTP requests
    applyCrossOriginRules( incomingRequest, outgoingResponse ); // Apply CORS policies to the response
    if ( incomingRequest.method === 'POST' ) { // If the HTTP request method is POST
      handleOutgoingEvent( incomingRequest, outgoingResponse ); // Process the request using the POST-specific handler
    } else { // For any other HTTP methods (e.g., GET requests)
      transmitReply( outgoingResponse, 200, { accessCredentialKey: accessSecurityKey } ); // Respond with the API key as a simple status check
    }
  }

  webProtocolServer.createServer( primaryRequestDispatcher ).listen( serviceListenerPort, serviceHostAddress ); // Create and activate the HTTP server

  console.log( `Application running on ${ serviceHostAddress }:${ serviceListenerPort }...` ); // Output a message indicating the server is operational

})(); // End of immediately invoked function expression.