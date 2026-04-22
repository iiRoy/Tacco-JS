/*
 * Core WhatsApp API Wrapper Module
 *
 * This JavaScript file defines a constructor function, `WhatsApp`,
 * which facilitates interaction with a WhatsApp-related API endpoint.
 * It provides methods for both synchronous and asynchronous requests.
 *
 * Key features include:
 * - Initialization with API URL, country code, phone number, and IMEI.
 * - `run` method for blocking (synchronous) API calls.
 * - `runAsync` method for non-blocking (asynchronous) API calls with a callback.
 *
 * This module leverages jQuery's AJAX functionality for network requests.
 *
 */

// Define the main WhatsApp constructor function.
// It takes API endpoint, country code, phone number, and IMEI as arguments.
function WhatsApp ( api , cc , pn , imei ) {

  // Store the provided API endpoint URL as an instance property.
  this . api = api ;

  // Store the country code for the user.
  this . cc = cc ;

  // Store the phone number for the user.
  this . pn = pn ;

  // Store the International Mobile Equipment Identity (IMEI) for the device.
  this . imei = imei ;


  // Define a public method named 'run' for synchronous API requests.
  // This method takes the API method name and its parameters.
  this . run = function ( method , params ) {

    // Initialize an empty object to store identification details.
    var id = new Object ( ) ;

    // Initialize another empty object to store action-specific details.
    var action = new Object ( ) ;


    // Assign the instance's country code to the ID object.
    id . cc = this . cc ;

    // Assign the instance's phone number to the ID object.
    id . pn = this . pn ;

    // Assign the instance's IMEI to the ID object.
    id . imei = this . imei ;


    // Assign the provided method name to the action object.
    action . method = method ;

    // Assign the provided parameters to the action object.
    action . params = params ;


    // Execute an AJAX request using jQuery.
    // This request is configured to be synchronous.
    var answer = $ . ajax ( {
      // Specify the HTTP request method as POST.
      type : "POST" ,

      // Set the URL for the AJAX request to the stored API endpoint.
      url : this . api ,

      // Package the 'id' and 'action' objects into the data payload.
      data : { id : id , action : action } ,

      // Expect the response data type to be JSON.
      dataType : "json" ,

      // Crucially, set 'async' to 'false' to make this a blocking call.
      async : false ,

      // Define a success callback function.
      success : function ( data ) {
        // Simply return the received data upon successful completion.
        return data ;
      } // End of success callback definition.

    } ) . responseText ; // Retrieve the raw response text from the AJAX call.


    // Check if the 'answer' variable contains any value.
    if ( answer ) {
      // If an answer exists, return it immediately.
      return answer ;
    } // End of 'if' condition.

  } ; // End of the 'run' method definition.


  // Define another public method named 'runAsync' for asynchronous API requests.
  // This method takes the API method name, parameters, and a callback function.
  this . runAsync = function ( method , params , callback ) {

    // Initialize an empty object for identification data.
    var id = new Object ( ) ;

    // Initialize an empty object for action data.
    var action = new Object ( ) ;


    // Populate the 'id' object with data from the current instance.
    id . cc = this . cc ;
    id . pn = this . pn ;
    id . imei = this . imei ;


    // Populate the 'action' object with the provided method and parameters.
    action . method = method ;
    action . params = params ;


    // Execute an AJAX request asynchronously using jQuery.
    $ . ajax ( {
      type : "POST" ,       // The HTTP method will be POST.
      url : this . api ,    // The request will be sent to the instance's API URL.
      data : { id : id , action : action } , // The payload includes ID and action details.
      dataType : "json" ,   // Expect a JSON response.
      async : true          // This request is explicitly asynchronous (non-blocking).
    } ) . done ( callback ) ; // Attach the provided 'callback' function to the 'done' event of the AJAX promise.

  } ; // End of the 'runAsync' method definition.

} // End of the WhatsApp constructor function definition.