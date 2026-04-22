/*
 * This file contains core middleware logic for payment processing.
 * It handles raw body parsing, request validation, and response generation.
 */

var Payment = require('./payment').Payment;  // Import Payment class for payment operations
var util = require('util');                  // Import Node.js utility module for inheritance


// Helper function to extract raw body from an incoming HTTP request.
// It sets the encoding and concatenates data chunks received until the stream ends.
var getRawBody = function ( req , callback ) {

    var data = ''; // Initialize an empty string to accumulate request data.

    req.setEncoding('utf8'); // Ensure data is treated as UTF-8 for proper handling.

    req.on( 'data' , function( chunk ) {
        // Append each received data chunk to the 'data' string.
        data += chunk;
    } );

    req.on( 'end' , function( ) {
        // Once the request stream ends, attach the complete raw body to the request object.
        req.rawBody = data;
        // Call the provided callback with no error (null) and the collected data.
        callback( null , data );
    } );
};


// Main Basic class for handling payment middleware logic.
// This class provides common functionality for payment-related middleware.
function Basic ( config ) {

  // Initialize the payment processing instance with the provided configuration.
  this.payment = new Payment(config);

  return this; // Allow chaining or direct assignment of the instance.
}


// Define the 'done' method on the Basic prototype.
// This method returns the actual Express-style middleware function.
Basic.prototype.done = function ( handler ) {

  var self = this; // Capture 'this' (the Basic instance) for use in nested functions.

  var payment = self.payment; // Get the payment instance from the current context.

  // Return the actual middleware function that Express/Koa/etc. will use.
  return function ( req , res , next ) {

    // First, check if the HTTP method is a POST request.
    if ( req.method !== 'POST' ) {
      // If it's not a POST request, create an error object.
      var error = new Error();
      error.name = 'NotImplemented'; // Set a specific error name for clarity.
      // Call the fail method to handle the error response and terminate.
      return self.fail( error , res );
    }

    // Process the raw body of the request, as payment notifications are often raw XML.
    getRawBody( req , function ( err , rawBody ) {

      // If there was an error during raw body retrieval.
      if ( err ) {
        err.name = 'BadMessage' + err.name; // Augment the error name for more context.
        return self.fail( err , res ); // Handle the error and send a failure response.
      }

      // Validate the raw body using the payment instance's validation logic.
      payment.validate( rawBody , function( err , message ) {

        // Attach a 'reply' function to the response object for convenience in handlers.
        res.reply = function ( data ) {
          // If the data to reply with is an Error object.
          if ( data instanceof Error ) {
            self.fail( data , res ); // Fail with the error provided.
          } else {
            self.success( data , res ); // Otherwise, send a success response.
          }
        } // end of res.reply function definition

        // If validation itself resulted in an error.
        if ( err ) {
          return self.fail( err , res ); // Handle the validation error and exit.
        }

        // If everything is successful so far, call the provided handler.
        // The handler receives the validated message, request, response, and next middleware function.
        handler( message , req , res , next );
      } ); // end of payment.validate callback
    } ); // end of getRawBody callback
  }; // end of the middleware function returned by done()
}; // end of Basic.prototype.done method


// Method to send a success response back to the client.
Basic.prototype.success = function ( result , res ) {
  // Build and send an XML response indicating successful processing.
  return res.end( this.payment.buildXml( {
    return_code: 'SUCCESS' // Standard success code for payment systems.
  } ) );
}


// Method to send a failure response back to the client.
Basic.prototype.fail = function ( err , res ) {
  // Build and send an XML response indicating a failure with the error's name.
  return res.end( this.payment.buildXml( {
    return_code: 'FAIL', // Standard failure code.
    return_msg: err.name // Include the error's name as the return message.
  } ) );
}


/**
 * @class Notify
 * @augments Basic
 * @param {Object} config - Configuration object passed to the parent Basic class.
 * @description This class represents a specific type of payment notification middleware.
 */
function Notify ( config ) {

  // Ensure 'new' keyword is used for instantiation. If not, create and return a new instance.
  if ( ! ( this instanceof Notify ) ) {
    return new Notify( config );
  }

  // Call the parent constructor (Basic) with the current context and configuration.
  Basic.call( this , config );

  return this; // Return the newly constructed instance.
}

// Establish inheritance: Notify inherits all methods and properties from Basic.
util.inherits( Notify , Basic );


// Factory function to create middleware instances based on configuration.
var middleware = function ( config ) {
  return {
    // Method to get a new Notify instance configured for the specific environment.
    getNotify: function ( ) {
      return new Notify( config );
    }
  }
};

// Attach the Notify constructor directly to the middleware factory for direct access if needed.
middleware.Notify = Notify;

// Export the middleware factory function as the module's main export.
module.exports = middleware;