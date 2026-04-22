// Initialize the routing system using rapid-rest library
var routes = require("../lib/rapid-rest") ( ) ;


// Define the port number for the server to listen on
var port = 8004 ;



/*
 * Route Definition for '/here' endpoint
 * This accepts a POST request.
 * Path parameters are:
 *   - here_name (mapped from ?A?)
 *   - user (mapped from ?B?)
 */
routes ( '/here/:here_name/:user' )
  ( 'post' , function ( req , res , params , jsonData ) {
      // Delegate handling to the 'here' function
      here ( req , res , params , jsonData ) ;
    }
  ) ;


// --- Another route definition follows ---

/*
 * Route Definition for '/there' endpoint
 * Expects a POST request.
 * Path parameter:
 *   - over_name (mapped from ?A?)
 */
routes ( '/there/:over_name' )
  ( 'post' , function ( req , res , params , jsonData ) {
      // Process the request using the 'there' function
      there ( req , res , params , jsonData ) ;
    }
  ) ;


// Start listening for incoming requests on the specified port.
routes . listen ( port ) ;


/*
 * Route Definition for '/callback' endpoint
 * This route demonstrates complex URL parameters.
 * It accepts a GET request.
 * Query parameters are:
 *   - level_name (value from {level_name})
 *   - callback (value from {callback})
 * Note: The original comment about miss-match seems to be a note
 *       about parameter naming, not a functional mismatch.
 */
routes ( '/callback/:table_name?level_name={level_name}&callback={callback}' )
  ( 'get' , function ( req , res , params , jsonData ) {
      // Call the dedicated function for callback processing
      callbackWords ( req , res , params , jsonData ) ;
    }
  ) ;


// A global variable, currently unused in this snippet.
var interval ;


/**
 * Handles requests for the '/here' endpoint.
 * This function processes the incoming request, logs details,
 * and sends a response.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {object} params - Extracted route parameters.
 * @param {object} bodyContents - The JSON data from the request body.
 */
function here ( req , res , params , bodyContents )
{
  // Prepare the response message
  var msg = "got 'here'" ;

  // Log the message and request details to the console
  console . log ( msg ) ;
  console . dir ( bodyContents ) ;
  console . dir ( params ) ;

  // Set HTTP status code and content type for the response
  res . writeHead ( 201 , '' , { 'Content-Type' : 'text/html' } ) ;
  // End the response with the message
  res . end ( msg ) ;
} ;


/**
 * Handles requests for the '/there' endpoint.
 * This function is similar to 'here', but for a different path.
 * It logs request details and sends a specific response.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {object} params - Extracted route parameters.
 * @param {object} bodyContents - The JSON data from the request body.
 */
function there ( req , res , params , bodyContents )
{
  var msg = "went 'there'" ; // Response message for 'there'
  console . log ( msg ) ;
  console . dir ( bodyContents ) ;
  console . dir ( params ) ;

  // Send a 201 Created status with HTML content type
  res . writeHead ( 201 , '' , { 'Content-Type' : 'text/html' } ) ;
  res . end ( msg ) ; // Complete the response
} ;


/**
 * Handles requests for the '/callback' endpoint.
 * Processes callback-related requests, logs data, and responds.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {object} params - Extracted route parameters (including query params).
 * @param {object} bodyContents - The JSON data from the request body.
 */
function callbackWords ( req , res , params , bodyContents )
{
  var msg = "went 'callbackwords'" ; // Specific message for this function
  console . log ( msg ) ;
  console . dir ( bodyContents ) ;
  console . dir ( params ) ;

  // Write response headers
  res . writeHead ( 201 , '' , { 'Content-Type' : 'text/html' } ) ;
  // Send the response body
  res . end ( msg ) ;
} ;


// Log a final message to indicate the server is running.
console . log ( " listening on port:" + port ) ;