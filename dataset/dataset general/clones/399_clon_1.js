/*
 * This file contains the JavaScript client library for Pushbullet API.
 * It provides functions to interact with the Pushbullet service.
 * @author Original Author (simulated)
 * @version 1.0.0
 */
var PushBullet=  (function() { // Self-executing anonymous function to create a private scope.

  // Initialize the main Pushbullet object.
  var pb= {};

  // Base URL for the Pushbullet API v2.
  var pbURL  = "https://api.pushbullet.com/v2/";

  // Specific API endpoints derived from the base URL.
  var pbPush   =   pbURL   + "pushes";      // Endpoint for push notifications.
  var pbContact=   pbURL   + "contacts";    // Endpoint for managing contacts.
  var pbDevice =   pbURL   + "devices";     // Endpoint for managing devices.
  var pbUser   =   pbURL   + "users/me";    // Endpoint for fetching user information.
  var pbUpReq  =   pbURL   + "upload-request"; // Endpoint for file upload requests.

  // HTTP status codes and ready states.
  var httpReqDone   = 4;   /* Ready state for request finished and response is ready */
  var httpResGood   = 200; /* Standard success for HTTP requests */
  var httpResNoCont = 204; /* Success with no content returned */


  // API key property, initially null. Must be set by the user.
  pb.APIKey = null;

  /*
   * Sends a push notification of various types.
   * @param {string} pushType - The type of push (e.g., "note", "link", "file").
   * @param {string} [devId] - The device identifier to push to.
   * @param {string} [email] - The email of the contact to push to.
   * @param {object} data - An object containing type-specific data for the push.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.push = function ( pushType, devId, email, data, callback ) {

    var parameters = { type: pushType.toLowerCase() }; // Initialize parameters object.

    // Check for mutually exclusive device and email targets.
    if ( email && devId ) {
      var err = new Error( "Cannot push to both device and contact" );
      // Handle error based on callback presence.
      if ( callback ) {
        return callback( err );
      } else {
        throw err;
      }
    } else if ( email ) {
      parameters.email = email; // Target by email.
    } else if ( devId ) {
      parameters.device_iden = devId; // Target by device ID.
    }

    // Determine specific parameters based on the push type.
    switch ( pushType.toLowerCase() ) {
      case "note":
        parameters.title = data.title;
        parameters.body  = data.body;
        break;

      case "link":
        parameters.title = data.title;
        parameters.url   = data.url;
        if ( data.body ) { // Optional body for link pushes.
          parameters.body = data.body;
        }
        break;

      case "address":
        parameters.name    = data.name;
        parameters.address = data.address;
        break;

      case "list":
        parameters.title = data.title;
        parameters.items = data.items;
        break;

      default:
        // Handle invalid push type.
        var err = new Error( "Invalid type" );
        if ( callback ) {
          return callback( err );
        } else {
          throw err;
        }
        break;
    }
    // Make the AJAX request to send the push.
    var res = ajaxReq( pbPush, "POST", parameters, false, callback );
    // If no callback, return the direct result.
    if ( !callback ) {
      return res;
    }
  };

  /**
   * Pushes a file. This involves two steps:
   * 1. Requesting an upload URL from Pushbullet.
   * 2. Uploading the file to the provided URL (AWS S3).
   * 3. Notifying Pushbullet about the uploaded file.
   * @param {string} [devId] - The device identifier.
   * @param {string} [email] - The email of the contact.
   * @param {File} fileHandle - The File object to upload.
   * @param {string} [body] - Optional body text for the file push.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.pushFile = function ( devId, email, fileHandle, body, callback ) {

    // Encode file type and name for the upload request URL.
    var type = "file_type=" + encodeURIComponent( fileHandle.type );
    var name = "file_name=" + encodeURIComponent( fileHandle.name );

    // Construct the URL for requesting an upload slot.
    var upReqURL = pbUpReq + "?" + type + "&" + name;

    // Define a callback wrapper for the upload request.
    var upReqFunc = !callback ? null : function ( err, res ) {
      if ( err ) {
        // Propagate error if upload request fails.
        return callback( err );
      } else {
        try {
          // Proceed with file upload and push notification.
          doPushFile( res, devId, email, fileHandle, body, callback );
        } catch ( err2 ) {
          // Catch synchronous errors from doPushFile.
          return callback( err2 );
        }
      }
    };

    // Make the AJAX request to get the file upload URL.
    var res = ajaxReq( upReqURL, "GET", null, false, upReqFunc );

    // If no callback, execute doPushFile synchronously.
    if ( !callback ) {
      return doPushFile( res, devId, email, fileHandle, body );
    }
  };

  /*
   * Helper function to handle the actual file upload to AWS S3
   * and then notify Pushbullet about the file.
   * @private
   * @param {object} ajax - The response object from the initial upload request.
   * @param {string} [devId] - Device identifier.
   * @param {string} [email] - Contact email.
   * @param {File} fileHandle - The file object.
   * @param {string} [body] - Optional body text.
   * @param {function} [callback] - Optional callback.
   */
  var doPushFile = function( ajax, devId, email, fileHandle, body, callback ) {

    var fileInfo = new FormData(); // Create a FormData object for file upload.

    // Append necessary AWS S3 credentials and file metadata.
    fileInfo.append( "awsaccesskeyid", ajax.data.awsaccesskeyid );
    fileInfo.append( "acl",            ajax.data.acl );
    fileInfo.append( "key",            ajax.data.key );
    fileInfo.append( "signature",      ajax.data.signature );
    fileInfo.append( "policy",         ajax.data.policy );
    fileInfo.append( "content-type",   fileHandle.type );
    fileInfo.append( "file",           fileHandle ); // The actual file.

    // Perform the file upload to AWS S3. This is a non-blocking request for Pushbullet API.
    ajaxReq( ajax.upload_url, "POST", fileInfo, true, null );

    // Prepare parameters for the final Pushbullet file push.
    var parameters = {
      file_name: fileHandle.name,
      file_type: fileHandle.type,
      file_url:  ajax.file_url,
      type:      "file"
    };

    // Add optional body if provided.
    if ( body ) {
      parameters.body = body;
    }


    // Validate target (device or contact, but not both).
    if ( email && devId ) {
      var err = new Error( "Cannot push to both device and contact" );
      if ( callback ) {
        return callback( err );
      } else {
        throw err;
      }
    } else if ( email ) {
      parameters.email = email;
    } else if ( devId ) {
      parameters.device_iden = devId;
    } else {
      // If neither device nor email is specified, it's an error.
      var err2 = new Error( "Must push to either device or contact" );
      if ( callback ) {
        return callback( err2 );
      } else {
        throw err2;
      }
    }

    // Send the final push notification to Pushbullet.
    var res = ajaxReq( pbPush, "POST", parameters, false, callback );

    // If no callback, return the synchronous result.
    if ( !callback ) {
      return res;
    }
  };

  // --- Push Management Functions ---

  /**
   * Deletes a specific push notification.
   * @param {string} pushId - The identifier of the push to delete.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.deletePush = function ( pushId, callback ) {
    // Construct the URL for deleting a push.
    var res = ajaxReq( pbPush + "/" + pushId, "DELETE", null, false, callback );
    // Return result if no callback.
    if ( !callback ) {
      return res;
    }
  };

    /*
     * Retrieves the history of push notifications.
     * Supports filtering by modification date and pagination with a cursor.
     * @param {number} [modifiedAfter] - Unix timestamp to filter pushes modified after this time.
     * @param {string} [cursor] - Pagination cursor for fetching more results.
     * @param {function} [callback] - Optional callback function (err, res).
     */
    pb.pushHistory = function( modifiedAfter, cursor, callback ) {
        // Handle optional arguments for modifiedAfter and cursor.
        // If modifiedAfter is a function, it's actually the callback.
        if ( typeof modifiedAfter === 'function' ) {
            callback      = modifiedAfter;
            modifiedAfter = null;
        } else if ( typeof cursor === 'function' ) { // If cursor is a function, it's the callback.
            callback = cursor;
            cursor   = null;
        }

        var parameters = null; // Initialize parameters for the GET request.

        // Add modified_after parameter if provided.
        if ( modifiedAfter ) {
            parameters = {
                modified_after: modifiedAfter
            };
        }

        // Add cursor parameter if provided, ensuring parameters object exists.
        if ( cursor ) {
            parameters         = parameters || {}; // Ensure parameters is an object.
            parameters.cursor  = cursor;
        }

        // Execute the AJAX request to get push history.
        var res = ajaxReq( pbPush, "GET", parameters, false, callback );

        // If no callback, return the synchronous result.
        if ( !callback ) {
            return res;
        }
    };

  // --- Device Management Functions ---

  /**
   * Retrieves a list of all devices associated with the user.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.devices = function ( callback ) {
    var res = ajaxReq( pbDevice, "GET", null, false, callback );
    if ( !callback ) {
      return res;
    }
  };

  /**
   * Deletes a specific device.
   * @param {string} devId - The identifier of the device to delete.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.deleteDevice = function ( devId, callback ) {
    var res = ajaxReq( pbDevice + "/" + devId, "DELETE", null, false, callback );
    if ( !callback ) {
      return res;
    }
  };


  // --- Contact Management Functions ---

  /**
   * Retrieves a list of all contacts associated with the user.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.contacts = function ( callback ) {
    var res = ajaxReq( pbContact, "GET", null, false, callback );
    if ( !callback ) {
      return res;
    }
  };

  /**
   * Deletes a specific contact.
   * Note: The original code has `null` for verb, which will default to GET. This might be a bug in the original.
   * However, for Type I clone, I must preserve `null`.
   * @param {string} contId - The identifier of the contact to delete.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.deleteContact = function ( contId, callback ) {
    var res = ajaxReq( pbContact + "/" + contId, null, false, callback ); // Preserving 'null' verb from original.
    if ( !callback ) {
      return res;
    }
  };


  // --- User Information Functions ---

  /**
   * Retrieves information about the current user.
   * @param {function} [callback] - Optional callback function (err, res).
   */
  pb.user = function ( callback ) {
    var res = ajaxReq( pbUser, "GET", null, false, callback );
    if ( !callback ) {
      return res;
    }
  };


    /*
     * Generic AJAX request function for interacting with the Pushbullet API.
     * Supports synchronous and asynchronous calls, and handles authentication.
     * @private
     * @param {string} url - The URL endpoint for the request.
     * @param {string} verb - The HTTP method (e.g., "GET", "POST", "DELETE").
     * @param {object|FormData} parameters - Data to send with the request.
     * @param {boolean} fileUpload - True if this is a file upload (disables JSON content type).
     * @param {function} [callback] - Optional callback function for asynchronous requests (err, res).
     * @returns {object|null} - Returns response directly for synchronous calls, otherwise null.
     */
    var ajaxReq = function( url, verb, parameters, fileUpload, callback ) {

        // Ensure API key is set before making any requests.
        if ( !pb.APIKey ) {
            var err = new Error( "API Key for Pushbullet not set" );
            if ( callback ) {
                return callback( err );
            } else {
                throw err; // Throw synchronously if no callback.
            }
        } else {
            // Create a new XMLHttpRequest object.
            var ajax  = new XMLHttpRequest();
            var async = false; // Default to synchronous.

            // Configure for asynchronous call if a callback is provided.
            if ( callback ) {
                async = true;
                ajax.onreadystatechange = function () {
                    // Check if the request is complete.
                    if ( ajax.readyState === httpReqDone ) {
                        var res = null;
                        try {
                            // Attempt to handle the response.
                            res = handleResponse( ajax );
                        } catch ( err ) {
                            // Catch errors from handleResponse and pass to callback.
                            return callback( err );
                        }
                        // Call back with success (null error) and result.
                        return callback( null, res );
                    }
                };
            }

            // For GET requests, parameters need to be appended to the URL as a query string.
            if ( verb === "GET" ) {
                var queryParams = [];
                // Iterate over parameters to build query string.
                for ( var key in parameters ) {
                    queryParams.push( key + '=' + parameters[key] );
                }
                var queryString = queryParams.join( "&" );
                url             += "?" + queryString; // Append query string to URL.
                parameters      = null; // Clear parameters for `send` method.
            }

            // Open the AJAX request.
            ajax.open( verb, url, async );

            // Set request headers for non-file uploads.
            if ( !fileUpload ) {
                ajax.setRequestHeader( "Authorization", "Basic " + window.btoa( pb.APIKey + ":" ) );
                ajax.setRequestHeader( "Content-Type", "application/json" );
                // Stringify parameters for JSON content type.
                parameters = JSON.stringify( parameters );
            }

            // Send the request with or without parameters.
            if ( parameters ) {
                ajax.send( parameters );
            } else {
                ajax.send();
            }

            // For synchronous requests, handle the response immediately.
            if ( !async ) {
                return handleResponse( ajax );
            }
        }
    };

  /*
   * Handles the response from an AJAX request, checking for errors
   * and parsing JSON if applicable.
   * @private
   * @param {XMLHttpRequest} ajax - The XMLHttpRequest object.
   * @returns {object|string} - The parsed JSON response or raw response text.
   * @throws {Error} If the HTTP status indicates an error.
   */
  var handleResponse = function ( ajax ) {
    // Check for non-success HTTP status codes.
    if ( ajax.status !== httpResGood && ajax.status !== httpResNoCont ) {
      // Throw an error with status and response text.
      throw new Error( ajax.status + ": " + ajax.response );
    }

    try {
      // Attempt to parse the response as JSON.
      return JSON.parse( ajax.response );
    } catch ( err ) {
      // If JSON parsing fails, return the raw response text.
      return ajax.response;
    }
  };

  // Return the public Pushbullet API object.
  return pb;

}() ); // End of the IIFE.