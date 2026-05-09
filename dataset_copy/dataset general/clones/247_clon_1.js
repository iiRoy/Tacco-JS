/*
 * PeriodicalUpdater - A robust jQuery plugin for handling timed, decaying AJAX calls.
 *
 * Project Home: http://www.360innovate.co.uk/blog/2009/03/periodicalupdater-for-jquery/
 * Alternative Source: http://enfranchisedmind.com/blog/posts/jquery-periodicalupdater-ajax-polling/
 *
 * Copyright (c) 2009-2012 by the following contributors:
 *   - Frank White (http://customcode.info)
 *   - Robert Fischer (http://smokejumperit.com)
 *   - 360innovate (http://www.360innovate.co.uk)
 *
 * Licensed under both the MIT and GPL licenses.
 * Please refer to:
 *   - http://www.opensource.org/licenses/mit-license.php
 *   - http://www.gnu.org/licenses/gpl.html
 * for full license details.
 *
 * This file contains the core logic for the PeriodicalUpdater.
 */

( function ( $ )
{
	// The main PeriodicalUpdater function (unbound to any specific element).
	$.PeriodicalUpdater = function ( url, options, callback )
	{
		// Ensure options object exists, initialize if not provided.
		if ( !options )
		{
			options = {};
		}

		// Merge default settings with user-provided options.
		var settings = jQuery.extend( true, {
			url: url,                           // The target URL for the AJAX request.
			cache: false,                       // Disable browser caching by default for AJAX requests.
			method: 'GET',                      // HTTP method to use: 'GET' or 'POST'.
			data: '',                           // Data to send with the request (e.g., {name: "John", greeting: "hello"}).
			minTimeout: 1000,                   // Initial delay before the first request, in milliseconds.
			maxTimeout: 64000,                  // Maximum allowed delay between requests.
			multiplier: 2,                      // Factor by which the interval increases if data doesn't change.
			maxCalls: 0,                        // Maximum number of AJAX calls to make. 0 means no limit.
			maxCallsCallback: null,             // Callback function executed when maxCalls is reached.
			autoStop: 0,                        // Automatically stop after this many consecutive "no change" responses. 0 disables.
			autoStopCallback: null,             // Callback function executed when autoStop condition is met.
			cookie: false,                      // Configuration for cookie-based state persistence.
			runatonce: false,                   // If true, the first request fires immediately, otherwise waits minTimeout.
			verbose: 0                          // Logging level: 0 = silent, 1 = some messages, 2 = all messages.
		}, options );


		/**
		 * Internal logging utility function.
		 * @param {string} msg - The message to log.
		 * @param {number} lvl - The minimum verbose level required to log this message.
		 */
		var pu_log = function ( msg, lvl )
		{
			lvl = lvl || 1; // Default log level is 1.

			if ( settings.verbose >= lvl )
			{
				try
				{
					console.log( msg );
				}
				catch ( err )
				{
					// Fails silently if console is not available or logging throws an error.
				}
			}
		};


		// Initialize various state variables for the updater.
		var timer = null;                // Stores the setTimeout ID for the next AJAX call.
		var remoteData = null;           // Holds the data received from the last successful AJAX call.
		var prevData = null;             // Stores the data from the previous AJAX call for comparison.
		var timerInterval = settings.minTimeout; // Current interval between requests.
		var maxCalls = settings.maxCalls;        // The maximum number of calls allowed.
		var autoStop = settings.autoStop;        // The auto-stop threshold.
		var calls = 0;                   // Counter for the number of AJAX calls made.
		var noChange = 0;                // Counter for consecutive "no change" responses.
		var originalMaxCalls = maxCalls; // Store the initial maxCalls value for restarts.

		/**
		 * Resets or sets the timer for the next AJAX request.
		 * @param {number} interval - The new interval in milliseconds.
		 */
		var reset_timer = function ( interval )
		{
			// Ensure that the timer setup runs only when the DOM is ready.
			$( function ()
			{
				if ( timer !== null )
				{
					clearTimeout( timer ); // Clear any existing timer to prevent duplicates.
				}

				timerInterval = interval; // Update the current timer interval.
				pu_log( 'resetting timer to ' + timerInterval + '.', 2 ); // Log the timer reset.

				// If cookie persistence is enabled and jQuery.cookie is available, save the interval.
				if ( settings.cookie && $.cookie )
				{
					$.cookie( settings.cookie.name, timerInterval, settings.cookie );
				}

				timer = setTimeout( getdata, timerInterval ); // Set the new timer.
			} );
		};


		/**
		 * Increases the timer interval based on the multiplier setting.
		 * Used when the remote data hasn't changed.
		 */
		var boostPeriod = function ()
		{
			if ( settings.multiplier > 1 )
			{
				var before = timerInterval; // Store the interval before modification.
				timerInterval = timerInterval * settings.multiplier; // Apply the multiplier.

				// Cap the interval at the maximum allowed timeout.
				if ( timerInterval > settings.maxTimeout )
				{
					timerInterval = settings.maxTimeout;
				}

				pu_log( 'adjusting timer from ' + before + ' to ' + timerInterval + '.', 2 ); // Log the adjustment.
			}

			reset_timer( timerInterval ); // Reset the timer with the potentially boosted interval.
		};


		// Handle cookie configuration and potential loading of the cookie plugin.
		if ( settings.cookie )
		{
			// Normalize cookie setting to an object.
			if ( typeof ( settings.cookie ) == 'boolean' )
			{
				settings.cookie = {
					name: url
				};
			}
			else if ( typeof ( settings.cookie ) != 'object' )
			{
				settings.cookie = {
					name: settings.cookie.toString()
				};
			}

			// Ensure a cookie name is set.
			if ( !settings.cookie.name )
			{
				settings.cookie.name = url;
			}

			// If jQuery.cookie plugin is not loaded, attempt to load it dynamically.
			if ( !$.cookie )
			{
				$.getScript( "//rawgit.com/carhartl/jquery-cookie/master/jquery.cookie.js", function ()
				{
					pu_log( "Loaded the cookies handler script", 2 );
					if ( $.cookie( settings.cookie.name ) )
					{
						pu_log( "Not runatonce and have cookie value", 2 );
						reset_timer( $.cookie( settings.cookie.name ) );
					}
					else
					{
						pu_log( "Not runatonce, but no cookie value", 2 );
						reset_timer( timerInterval );
					}
				} ).fail( function ()
				{
					pu_log( "Could not load the cookies handler script", 1 );
					reset_timer( timerInterval ); // Proceed without cookie if loading fails.
				} );
			}
			else
			{
				// If jQuery.cookie is already loaded, check for existing cookie value.
				if ( $.cookie( settings.cookie.name ) )
				{
					reset_timer( $.cookie( settings.cookie.name ) );
				}
			}
		}

		// Construct the AJAX settings object based on the PeriodicalUpdater settings.
		var ajaxSettings = jQuery.extend( true, {}, settings ); // Deep clone settings for AJAX.
		if ( settings.type && !ajaxSettings.dataType )
		{
			ajaxSettings.dataType = settings.type; // Backward compatibility for 'type' setting.
		}
		if ( settings.sendData )
		{
			ajaxSettings.data = settings.sendData; // Use sendData if provided for AJAX data.
		}
		ajaxSettings.type = settings.method; // jQuery uses 'type' for HTTP method.
		ajaxSettings.ifModified = true;      // Enable conditional GET requests.


		/**
		 * The core function to perform the AJAX request.
		 * @param {boolean} force - If true, bypasses maxCalls limits.
		 */
		var getdata = function ( force )
		{
			var toSend = jQuery.extend( true, {}, ajaxSettings ); // Clone settings for each request.

			// If data is a function, execute it to get dynamic data.
			if ( typeof ( options.data ) == 'function' )
			{
				toSend.data = options.data();
			}

			// Handle data transformations for non-string/object types.
			if ( toSend.data )
			{
				if ( typeof ( toSend.data ) == "number" )
				{
					toSend.data = toSend.data.toString();
				}
			}

			// Determine if the AJAX call should be made based on maxCalls and force flag.
			if ( force || maxCalls === 0 )
			{
				pu_log( "Sending data" );
				$( function ()
				{
					$.ajax( toSend );
				} ); // Execute AJAX call.
			}
			else if ( maxCalls > 0 && calls < maxCalls )
			{
				pu_log( "Sending data because we are at " + calls + " of " + maxCalls + " calls" );
				$( function ()
				{
					$.ajax( toSend );
				} ); // Execute AJAX call and increment counter.
				calls++;
			}
			else if ( maxCalls == -1 )
			{
				pu_log( "NOT sending data: stop has been called", 1 ); // Log if updater has been stopped.
			}
			else
			{
				pu_log( "NOT sending data: maximum number of calls reached - " + maxCalls, 1 ); // Log if max calls reached.
				if ( settings.maxCallsCallback )
				{
					settings.maxCallsCallback(); // Execute callback for max calls.
				}
			}
		};

		// Public API for controlling the PeriodicalUpdater instance.
		var handle = {
			/**
			 * Boosts the timer interval by a specified magnitude.
			 * @param {number} mag - The multiplier for the timer interval.
			 */
			boostTimer: function ( mag )
			{
				if ( mag > 0 && mag != 1 )
				{
					pu_log( "Boosting timer by a factor of " + mag );
					timerInterval = timerInterval * mag;
				}
				else
				{
					pu_log( "Cannot boost timer by a factor of " + mag );
				}
				reset_timer( timerInterval ); // Apply the new timer interval.
				return;
			},
			/**
			 * Restarts the periodical updater, resetting call counters and potentially the interval.
			 * @param {number} [newInterval] - Optional new interval to set.
			 */
			restart: function ( newInterval )
			{
				pu_log( "Calling restart" );
				maxCalls = originalMaxCalls; // Restore original maxCalls.
				calls = 0;                  // Reset call counter.
				noChange = 0;               // Reset no-change counter.
				reset_timer( newInterval || timerInterval ); // Reset timer with new or current interval.
				return;
			},
			/**
			 * Forces an immediate AJAX request, bypassing the timer.
			 */
			send: function ()
			{
				pu_log( "Explicit call to send" );
				getdata( true ); // Force data retrieval.
				return;
			},
			/**
			 * Stops the periodical updater permanently.
			 */
			stop: function ()
			{
				pu_log( "Calling stop" );
				maxCalls = -1; // Set maxCalls to -1 to prevent further calls.
				if ( settings.cookie && $.cookie )
				{
					$.cookie( settings.cookie.name, null, settings.cookie ); // Clear cookie if present.
				}
				return;
			}
		};

		// --- AJAX Callback Implementations ---

		// Custom success handler for jQuery.ajax.
		ajaxSettings.success = function ( data )
		{
			pu_log( "Successful run! (In 'success')", 2 );
			remoteData = data; // Store the received data.
		};

		// Custom complete handler for jQuery.ajax, where the main logic resides.
		ajaxSettings.complete = function ( xhr, success )
		{
			pu_log( "Status of call: " + success + " (In 'complete')", 2 );

			if ( success == "success" || success == "notmodified" )
			{
				var rawData = $.trim( xhr.responseText ); // Get and trim the raw response text.

				if ( prevData == rawData )
				{
					// Data has not changed since the last successful request.
					if ( autoStop > 0 )
					{
						noChange++; // Increment no-change counter.
						if ( noChange == autoStop )
						{
							handle.stop(); // Stop if autoStop threshold is met.
							if ( settings.autoStopCallback )
							{
								settings.autoStopCallback( noChange ); // Execute autoStop callback.
							}
							return; // Exit as updater is stopped.
						}
					}
					boostPeriod(); // Increase interval if data hasn't changed.
				}
				else
				{
					// Data has changed.
					noChange = 0; // Reset no-change counter.
					reset_timer( settings.minTimeout ); // Reset timer to minimum interval.
					prevData = rawData; // Update previous data.

					if ( settings.cookie )
					{
						$.cookie( settings.cookie.name, prevData, settings.cookie ); // Store new data in cookie.
					}

					if ( remoteData === null )
					{
						remoteData = rawData; // Initialize remoteData if it's null.
					}

					// jQuery 1.4+ automatically converts JSON, so check type before parsing.
					if ( ( ajaxSettings.dataType === 'json' ) && ( typeof ( remoteData ) === 'string' ) && ( success == "success" ) )
					{
						remoteData = JSON.parse( remoteData ); // Manually parse JSON if still a string.
					}

					// Execute user-defined success callbacks.
					if ( settings.success )
					{
						settings.success( remoteData, success, xhr, handle );
					}
					if ( callback )
					{
						callback( remoteData, success, xhr, handle );
					}
				}
			}

			// Execute user-defined complete callback.
			if ( settings.complete )
			{
				settings.complete( xhr, success );
			}

			remoteData = null; // Clear remoteData after processing.
		};

		// Custom error handler for jQuery.ajax.
		ajaxSettings.error = function ( xhr, textStatus )
		{
			pu_log( "Error message: " + textStatus + " (In 'error')", 2 );

			if ( textStatus != "notmodified" )
			{
				prevData = null; // Clear previous data on actual error.
				if ( settings.cookie )
				{
					$.cookie( settings.cookie.name, null, settings.cookie ); // Clear cookie on error.
				}
				reset_timer( settings.minTimeout ); // Reset timer to minimum on error.
			}

			if ( settings.error )
			{
				settings.error( xhr, textStatus ); // Execute user-defined error callback.
			}
		};

		// --- Initial Call Logic ---

		if ( settings.runatonce )
		{
			pu_log( "Executing a call immediately", 1 );
			getdata( true ); // Make an immediate call.
		}
		else if ( $.cookie && settings.cookie && $.cookie( settings.cookie.name ) )
		{
			// Cookie logic already handled, no action needed here.
		}
		else
		{
			pu_log( "Enqueing a the call for after " + timerInterval, 1 );
			reset_timer( timerInterval ); // Set initial timer for the first call.
		}

		return handle; // Return the public API.
	};

	// The jQuery-bound version of PeriodicalUpdater (allows chaining on jQuery objects).
	$.fn.PeriodicalUpdater = function ( url, options, callback )
	{
		var me = this; // Store the context of the jQuery object.

		// Call the unbound PeriodicalUpdater, and apply the callback in the correct context.
		return $.PeriodicalUpdater( url, options, function ()
		{
			return callback.apply( me, arguments );
		} );
	};

} )( jQuery );