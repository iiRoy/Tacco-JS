/*
 * LiveMessageDispatcher - Manages event listeners and dispatches live messages.
 * This file contains the core logic for handling real-time message registrations
 * and dispatches within the application's client-side environment.
 *
 * Version: 1.0.1
 * Last Modified: 2023-10-27
 * Author: AI Code Generator
 */


function LiveMessageDispatcher() {
  // Initialize listener collections for different event types.
  // 'listeners' for regular message events.
  this.listeners = null;

  // 'shutdownListeners' for handling application shutdown events.
  this.shutdownListeners = null;

  // 'restartListeners' for handling application restart events.
  this.restartListeners = null;


  // Check for any pending live message callback registrations
  // that might have occurred before the dispatcher was fully initialized.
  if ( window.pendingLiveMessageCallbackRegistrations ) {
    // Iterate through each pending registration.
    for ( var i = 0; i < window.pendingLiveMessageCallbackRegistrations.length; i++ ) {
      var info = window.pendingLiveMessageCallbackRegistrations[ i ];
      // Register the handler using the stored information.
      this.registerHandler( info.app_id, info.event_name, info.callback_fn );
    }
  }

  // Handle pending shutdown registrations similarly.
  if ( window.pendingLiveMessageShutdownRegistrations ) {
    for ( var i = 0; i < window.pendingLiveMessageShutdownRegistrations.length; i++ ) {
      var info = window.pendingLiveMessageShutdownRegistrations[ i ];
      this.registerShutdownHandler( info.app_id, info.callback_fn );
    }
  }

  // Process any pending restart registrations.
  if ( window.pendingLiveMessageRestartRegistrations ) {
    for ( var i = 0; i < window.pendingLiveMessageRestartRegistrations.length; i++ ) {
      var info = window.pendingLiveMessageRestartRegistrations[ i ];
      this.registerRestartHandler( info.app_id, info.callback_fn );
    }
  }
} // End of LiveMessageDispatcher constructor.


// Define the prototype methods for LiveMessageDispatcher.

/**
 * Registers a callback function for a specific application and event.
 * @param {string} app_id - The ID of the application.
 * @param {string} event_name - The name of the event.
 * @param {Function} callback_fn - The function to call when the event occurs.
 */
LiveMessageDispatcher.prototype.registerHandler = function ( app_id, event_name, callback_fn ) {
  // If listeners object is not yet initialized, create it.
  // Also, register the main dispatcher with the presence system.
  if ( !this.listeners ) {
    this.listeners = {};
    window.presence.registerMsgHandler( this.dispatcher.bind( this ) );
  }

  // If there are no listeners for this specific app_id, initialize an empty object for it.
  if ( !this.listeners[ app_id ] ) {
    this.listeners[ app_id ] = {};
  }

  // Assign the callback function to the specified app_id and event_name.
  this.listeners[ app_id ][ event_name ] = callback_fn;
};


/**
 * The main dispatcher function that receives incoming messages.
 * It checks the message type and dispatches to the appropriate registered handler.
 * @param {string} channel - The communication channel (not directly used here but part of signature).
 * @param {Object} obj - The message object containing type, app_id, event_name, and message payload.
 * @returns {boolean} - True if a handler was found and called, false otherwise.
 */
LiveMessageDispatcher.prototype.dispatcher = function ( channel, obj ) {
  // Only process messages that match the expected LiveMessageDispatcher message type.
  if ( obj.type == LiveMessageDispatcher.MSG_TYPE ) {
    // Retrieve listeners for the specific application ID.
    var app_listeners = this.listeners[ obj.app_id ];

    // If listeners exist for this application.
    if ( app_listeners ) {
      // Get the callback function registered for this event name.
      var callback_fn = app_listeners[ obj.event_name ];

      // If a callback function is found.
      if ( callback_fn ) {
        // Execute the callback with the message payload.
        callback_fn( obj.message );
        // Indicate that the message was successfully handled.
        return true;
      }
    }
  }
  // If no handler was found or message type didn't match.
  return false;
};


/**
 * Dispatches shutdown events to all registered shutdown handlers.
 * @param {string} channel - The communication channel (not directly used here).
 */
LiveMessageDispatcher.prototype.shutdownDispatcher = function ( channel ) {
  // Check if there are any registered shutdown listeners.
  if ( this.shutdownListeners ) {
    // Iterate over each registered app_id in shutdownListeners.
    for ( var app_id in this.shutdownListeners ) {
      // Execute the shutdown callback for the current app_id.
      this.shutdownListeners[ app_id ]();
    }
  }
};


/**
 * Registers a callback function to be executed when a shutdown event occurs.
 * @param {string} app_id - The ID of the application.
 * @param {Function} callback_fn - The function to call on shutdown.
 */
LiveMessageDispatcher.prototype.registerShutdownHandler = function ( app_id, callback_fn ) {
  // Initialize shutdownListeners if it's null.
  // Also, register the shutdown dispatcher with the presence system.
  if ( !this.shutdownListeners ) {
    this.shutdownListeners = {};
    window.presence.registerShutdownHandler( this.shutdownDispatcher.bind( this ) );
  }
  // Store the callback function for the given app_id.
  this.shutdownListeners[ app_id ] = callback_fn;
};


/**
 * Dispatches restart events to all registered restart handlers.
 * @param {string} channel - The communication channel (not directly used here).
 */
LiveMessageDispatcher.prototype.restartDispatcher = function ( channel ) {
  // Check if there are any registered restart listeners.
  if ( this.restartListeners ) {
    // Iterate over all app_ids with registered restart callbacks.
    for ( var app_id in this.restartListeners ) {
      // Execute the restart callback.
      this.restartListeners[ app_id ]();
    }
  }
};


/**
 * Registers a callback function to be executed when a restart event occurs.
 * @param {string} app_id - The ID of the application.
 * @param {Function} callback_fn - The function to call on restart.
 */
LiveMessageDispatcher.prototype.registerRestartHandler = function ( app_id, callback_fn ) {
  // Initialize restartListeners if it's null.
  // And register the restart dispatcher with the presence system.
  if ( !this.restartListeners ) {
    this.restartListeners = {};
    window.presence.registerRestartHandler( this.restartDispatcher.bind( this ) );
  }
  // Store the callback function for the specified app_id.
  this.restartListeners[ app_id ] = callback_fn;
};


// If the Bootloader is available, signal that this component has finished loading.
if ( window.Bootloader ) {
  Bootloader.done( 1 );
}

// End of LiveMessageDispatcher functionality.