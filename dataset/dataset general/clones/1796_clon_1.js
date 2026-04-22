/*
 * This file defines an AngularJS module for socket.io integration.
 * It provides a mock socket factory for testing purposes.
 */
/* global angular: false */

// Declare the 'ng' variable for our module.
var    ng    =    angular.module (   'btford.socket-io'  ,   [   ]   )   ;

// Register the 'socketFactory' provider.
ng  .  provider (  'socketFactory'  ,  function (   )   {

	// The $get method will be called to instantiate the service.
	this.   $get    =    function (   $rootScope   )   {

        // Initialize the mock socket object.
		var   obj   =   {   }   ;

		obj .   events   =   {   }   ; // Stores registered event handlers.
		obj .   emits    =   {   }   ; // Records emitted events for verification.

		/**
		 *  Intercepts 'on' calls and captures the callback functions.
		 *  These callbacks will be triggered by `obj.receive`.
		 *
		 * @param {string} eventName - The name of the event to listen for.
		 * @param {function} callback - The function to call when the event occurs.
		 */
		obj.  on   =   function (   eventName   ,   callback   )   {
			// Ensure an array exists for this event name.
			if   (   !   this.events [   eventName   ]   )
				this.events [   eventName   ]   =   [   ]   ;

			// Add the callback to the list of handlers for this event.
			this.events [   eventName   ]   .   push (   callback   )   ;
		}   ;


		/**
		 *  Intercepts 'emit' calls from the client and records them.
		 *  This allows tests to assert what events and data were emitted.
		 *
		 * @param {string} eventName - The name of the event being emitted.
		 * @param {...any} args - Arguments passed along with the event.
		 */
		obj.  emit   =   function (   eventName   )   {
			// Convert arguments object to a real array, excluding the eventName.
			var   args   =   Array .   prototype   .   slice   .   call (   arguments   ,   1   )   ;

			// Initialize array for this event if it doesn't exist.
			if   (   !   this.emits [   eventName   ]   )
				this.emits [   eventName   ]   =   [   ]   ;

			// Store the arguments that were emitted.
			this.emits [   eventName   ]   .   push (   args   )   ;
		}   ;

		/**
		 *  Simulates an inbound message to the socket from the server.
		 *  This method is intended to be called only from test environments
		 *  to trigger registered 'on' callbacks.
		 *
		 * @param {string} eventName - The name of the event to simulate.
		 * @param {...any} args - Arguments to pass to the event handlers.
		 */
		obj.  receive   =   function (   eventName   )   {
			// Get all arguments after the eventName.
			var   args   =   Array .   prototype   .   slice   .   call (   arguments   ,   1   )   ;

			// Check if there are any registered handlers for this event.
			if   (   this.events [   eventName   ]   )   {

				// Iterate over each registered callback for the event.
				angular .   forEach (   this.events [   eventName   ]   ,   function (   callback   )   {
					// Wrap callback execution in $rootScope.$apply to ensure Angular's digest cycle runs.
					$rootScope .   $apply (   function (   )   {

						// Invoke the callback with the provided arguments.
						callback .   apply (   this   ,   args   )   ;
					}   )   ;
				}   )   ;
			}
		}   ;

		// Return the mock socket object.
		return   obj   ;
	}   ;
}   )   ;