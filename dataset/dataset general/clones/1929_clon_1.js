// This module defines the Battery class.
// It acts as a small wrapper for the HTML5 Battery Status API.

// Original author: Patrick Stadler <patrick.stadler@gmail.com>
// Copyright (c) 2014 Patrick Stadler. All rights reserved.

var Battery = (
	function()
	{
		// Internal variable to hold the list of events to listen for.
		var _events = 'chargingchange chargingtimechange dischargingtimechange levelchange';

		// Retrieve the native battery object from navigator, checking different prefixes.
		var _battery = navigator.battery || navigator.mozBattery || navigator.getBattery;

		// Stores the current battery status.
		var _status = null;

		// Default empty callback for status retrieval.
		var _statusCallback = function() { };

		// Default empty callback for update notifications.
		var _updateCallback = function() { };


		/*
		 * Method: getStatus
		 * Registers a callback function to asynchronously retrieve the current battery status.
		 *
		 * Parameters:
		 *   (Function) fn - The callback function, which will receive `(status, error)` arguments.
		 */
		self.getStatus = function( fn )
		{
			// Check if battery status is explicitly marked as 'not supported'.
			if ( _status === 'not supported' )
			{
				fn( null, _status ); // Invoke callback with error.
			}

			// If status is already available.
			else if ( _status )
			{
				fn( _status ); // Invoke callback with current status.
			}

			// Otherwise, store the callback for later execution.
			else
			{
				_statusCallback = fn;
			}
		};


		/*
		 * Method: onUpdate
		 * Registers a callback function that will be triggered whenever the battery status changes.
		 *
		 * Parameters:
		 *   (Function) fn - The callback function, which will receive `(status)` as an argument.
		 */
		self.onUpdate = function( fn )
		{
			_updateCallback = fn; // Assign the provided function as the update callback.
		};


		// Internal helper function to handle battery events.
		function eventHandler( status )
		{
			_status = status; // Update the internal status.
			_updateCallback( _status ); // Notify registered update listeners.
		}


		// Internal helper function to attach event listeners to the battery object.
		function registerEventHandler( battery )
		{
			// Iterate over each event type in the _events string.
			for ( var evt in _events.split( ' ' ) )
			{
				// Add an event listener for the current event type.
				battery.addEventListener( evt, eventHandler );
			}
		}


		// Determine how to initialize the battery status based on the _battery object.
		if ( _battery instanceof Function )
		{
			// If _battery is a function (e.g., navigator.getBattery()), call it to get a promise.
			_battery.call( navigator )
				.then(
					function( status )
					{
						_status = status; // Store the resolved status.
						_statusCallback( _status ); // Execute the stored status callback.
						registerEventHandler( _status ); // Register event listeners on the battery status object.
					},
					function()
					{
						// If the promise is rejected, mark battery as not supported.
						_status = 'not supported';
					}
				);
		}

		else if ( _battery )
		{
			// If _battery is an object directly (e.g., navigator.battery), use it immediately.
			_status = _battery;
			registerEventHandler( _battery ); // Register event listeners on this object.
		}

		else
		{
			// If no battery object is found, mark as not supported.
			_status = 'not supported';
		}


		return self; // Return the public interface of the Battery module.
	}
)( Battery || { } ); // Execute the IIFE, passing an existing Battery object or an empty one.