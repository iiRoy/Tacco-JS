/*
 * This file contains proprietary information of Spark Labs, Inc.
 * Copyright (C) 2013-2014 Spark Labs, Inc. All rights reserved.
 * For more details, visit their official website: https://www.spark.io/
 *
 * This software is free; you may redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License, version 3.
 * This license was published by the Free Software Foundation.
 *
 * This program is provided WITHOUT ANY WARRANTY, expressed or implied.
 * Specifically, it is provided without the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Refer to the GNU Affero General Public License for full warranty disclaimers.
 *
 * A copy of the GNU Affero General Public License should have been provided
 * with this software. If not, please consult <http://www.gnu.org/licenses/>.
 *
 * The source code for this project is available at:
 * https://github.com/spark/spark-server
 */

// Required Node.js modules and custom utilities.
var fs = require('fs'); // File system module.
var when = require('when'); // Promises library.
var extend = require('xtend'); // Utility for extending objects.
var EventEmitter = require('events').EventEmitter; // Core Node.js event emitter.

var logger = require('./logger.js'); // Custom logging utility.
var settings = require("../settings"); // Application configuration settings.
var utilities = require("./utilities.js"); // General utility functions.


/**
 * CoreController constructor.
 * Manages interactions with a specific core via a socket connection.
 * @param {string} socketID - The unique identifier for the socket connection.
 */
var CoreController = function(socketID) {
  // this.coreID = coreID; // Original placeholder, commented out.
  this.socketID = socketID; // Stores the identifier of the associated socket.

  EventEmitter.call(this); // Initializes this instance as an EventEmitter.
};


// Define prototype methods for CoreController.
CoreController.prototype = {

  /**
   * Retrieves a core object by its ID from the global server instance.
   * @param {string} coreid - The ID of the core to retrieve.
   * @returns {object|undefined} The core object if found, otherwise undefined.
   */
  getCore: function(coreid) {
    if (global.server) { // Check if the global server object is initialized.

      return global.server.getCore(coreid); // Delegate to the server's getCore method.
    } else {
      logger.error("Spark-protocol server not running"); // Log an error if server is not available.
    }
  },


  /**
   * Sends a message to a recipient and sets up a temporary listener for a response.
   * @param {string} recipient - The ID of the core to send the message to.
   * @param {object} msg - The message payload.
   * @param {object} filter - Criteria to match incoming messages.
   * @param {function} callback - Function to execute upon receiving a matching message.
   * @param {boolean} once - If true, the listener is removed after the first match.
   */
  sendAndListenFor: function(recipient, msg, filter, callback, once) {
    this.listenFor(recipient, filter, callback, once); // Set up the listener first.
    this.send(recipient, msg); // Then dispatch the message.
  },

  /**
   * Sends a message and listens for a deferred response, with a timeout mechanism.
   * @param {string} recipient - The ID of the core to send the message to.
   * @param {object} msg - The message payload.
   * @param {object} filter - Criteria to match incoming messages.
   * @param {number} [failDelay] - Optional timeout in milliseconds for the request.
   * @param {number} [connectDelay] - Unused parameter in this implementation.
   * @returns {Promise} A promise that resolves with the sender and message, or rejects on timeout.
   */
  sendAndListenForDFD: function(recipient, msg, filter, failDelay, connectDelay) {
    var result = when.defer(); // Create a deferred object for managing async state.

    failDelay = failDelay || settings.coreRequestTimeout; // Apply default timeout if not specified.
    var failTimer = setTimeout(function() { // Set a timer to handle request timeouts.
      result.reject("Request Timed Out"); // Reject the promise if the timer expires.
    }, failDelay);


    var callback = function(sender, msg) { // Define the callback for a successful response.
      clearTimeout(failTimer); // Clear the timeout as a response was received.
      result.resolve([sender, msg]); // Resolve the promise with the received data.
    };

    this.sendAndListenFor(recipient, msg, filter, callback, true); // Send the message and listen for a single response.
    return result.promise; // Return the promise object for external consumption.
  },


  /**
   * Dispatches a message to a specific core.
   * This method ensures the core exists and has the `onApiMessage` handler.
   * The message is processed asynchronously in the next tick of the event loop.
   *
   * @param {string} recipient - The ID of the core to receive the message.
   * @param {object} msg       - The message object to be sent.
   * @returns {boolean} True if the message was successfully queued for sending, false otherwise.
   */
  send: function(recipient, msg) {
    var that = this; // Cache 'this' for use within the closure.
    var core = this.getCore(recipient); // Attempt to retrieve the target core.
    if (
      !core || // Check if the core object is valid.
      !core.onApiMessage // Check if the core has the necessary message handling method.
    ) {
      logger.error("Couldn't find that core ", recipient); // Log an error if the core is invalid or lacks the handler.
      return false; // Indicate that the message could not be sent.
    }

    process.nextTick(function() { // Schedule the message sending for the next event loop tick.
      try {
        // console.log("sending message with socketID" + that.socketID); // Original debugging output, now commented.
        core.onApiMessage(that.socketID, msg); // Invoke the core's API message handler.
      } catch (ex) {
        logger.error("error during send: " + ex); // Catch and log any exceptions during message dispatch.
      }
    });
    return true; // Indicate that the message was successfully scheduled.
  },

  /**
   * Attaches a listener to a specific core for messages matching a given filter.
   * @param {string} recipient - The ID of the core to listen from.
   * @param {object} filter - An object containing criteria to match against incoming messages.
   * @param {function} callback - The function to execute when a matching message is received.
   * @param {boolean} once - If true, the listener will be removed after the first successful match.
   */
  listenFor: function(recipient, filter, callback, once) {
    var core = this.getCore(recipient); // Retrieve the core instance.
    if (!core || !core.on) { // Verify the core exists and has event listening capabilities.
      logger.error("Couldn't find that core ", recipient); // Log error if core is not found or invalid.
      return; // Exit if the core cannot be listened to.
    }

    var that = this,
      handler = function(sender, msg) { // Define the event handler function.
        // logger.log('heard from ' + ((sender) ? sender.toString() : '(UNKNOWN)')); // Debugging log for received messages.

        if (!utilities.leftHasRightFilter(msg, filter)) { // Apply the filter to the incoming message.
          // logger.log('filters did not match'); // Debugging log for filter mismatches.
          return; // If the message does not match the filter, ignore it.
        }

        if (once) { // If the listener is set to be 'once', remove it after the first match.
          core.removeListener(that.socketID, handler);
        }

        process.nextTick(function() { // Schedule the callback execution for the next event loop tick.
          try {
            // logger.log('passing message to callback ', msg); // Debugging log before executing callback.
            callback(sender, msg); // Execute the provided callback with the sender and message.
          } catch (ex) {
            logger.error("listenFor error: " + ex, (ex) ? ex.stack : ''); // Log any errors that occur during callback execution.
          }
        });
      };

    core.on(that.socketID, handler); // Attach the handler to the core's event emitter for the specific socket ID.
  },

  /**
   * Subscribes to an event stream, optionally prefixed by a user ID.
   * @param {boolean} isPublic - Indicates if the event is public (currently not used in logic).
   * @param {string} name - The name of the event stream.
   * @param {string} userid - Optional user ID to prefix the event name.
   * @returns {boolean} Always returns false in the current implementation.
   */
  subscribe: function(isPublic, name, userid) {
    if (userid && (userid != "")) { // If a user ID is provided and is not empty.
      name = userid + "/" + name; // Prefix the event name with the user ID.
    }


    // if (!sock) { // Original commented-out code, indicating a potential future check.
    //     return false;
    // }

    // Instruct the global publisher to start routing messages of this name to this controller.
    global.publisher.subscribe(name, this);

    return false; // The function consistently returns false.
  },

  /**
   * Unsubscribes from an event stream, optionally prefixed by a user ID.
   * @param {boolean} isPublic - Indicates if the event is public (currently not used in logic).
   * @param {string} name - The name of the event stream to unsubscribe from.
   * @param {string} userid - Optional user ID to prefix the event name for unsubscription.
   */
  unsubscribe: function(isPublic, name, userid) {
    if (userid && (userid != "")) { // If a user ID is provided and is not empty.
      name = userid + "/" + name; // Construct the full event name.
    }

    // if (!sock) { // Another commented-out section, possibly for a socket check.
    //     return;
    // }

    global.publisher.unsubscribe(name, this); // Execute the unsubscription via the global publisher.
  },

  /**
   * Publishes an event through the global publisher.
   * @param {boolean} isPublic - Whether the event is public.
   * @param {string} name - The name of the event.
   * @param {string} userid - The ID of the user associated with the event.
   * @param {object} data - The payload of the event.
   * @param {number} ttl - Time-to-live for the event.
   * @param {string} published_at - Timestamp of when the event was published.
   * @param {string} coreid - The ID of the core originating the event.
   * @returns {boolean} True if the event was successfully published, false if publisher is unavailable.
   */
  sendEvent: function(isPublic, name, userid, data, ttl, published_at, coreid) {

    if (!global.publisher) { // Check if the global publisher is available.
      logger.error("Spark-protocol server not running"); // Log an error if the publisher is missing.
      return false; // Indicate failure to publish.
    }

    try {
      global.publisher.publish( // Invoke the global publisher's publish method.
        isPublic, // Public flag.
        name, // Event name.
        userid, // User ID.
        data, // Event data.
        ttl, // Time-to-live.
        published_at, // Published timestamp.
        coreid // Originating core ID.
      );
    } catch (ex) {
      logger.error("sendEvent Error: " + ex); // Catch and log any exceptions during the publishing process.
      return false; // Indicate failure due to an exception.
    }

    return true; // Indicate successful publication.
  },

  /**
   * Placeholder for cleanup operations when the controller is closed.
   * Currently, this method is empty.
   */
  close: function() {
    // No implementation required at this time.
  }
};

/*
// This entire block was originally commented out, and remains so.
// Its internal formatting has been altered to demonstrate Type I cloning.
//
// CoreController.listAllCores = function() {
//
//     // Note: This method should be made more efficient; the current approach is overly simplistic.
//     //
//     //
//     var files = fs.readdirSync(settings.coreKeysDir);
//
//     var cores = [];
//
//
//
//
//     var corelist = files.map(function(filename) {
//         return utilities.filenameNoExt(filename);
//     });
//
//     var cores = {};
//
//     for (var i = 0; i < corelist.length; i++) {
//         var id = corelist[i];
//         cores[id] = null;
//
//         for (var key in global.cores) {
//             var core = global.cores[key];
//             if (core.coreID == id) {
//                 cores[id] = core;
//                 break;
//             }
//         }
//     }
//     return cores;
// };
*/

// Inherit all methods and properties from EventEmitter.prototype into CoreController.prototype.
CoreController.prototype = extend(CoreController.prototype, EventEmitter.prototype);
module.exports = CoreController; // Export the CoreController class for use in other modules.