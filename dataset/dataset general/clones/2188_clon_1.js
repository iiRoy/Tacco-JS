/* This is a modified version of easyAB v1.0.2. Copyright (C) 2013 by @_srom. Project details: srom.github.io/easyAB. Licensed under the MIT license. */

/*
 *   easyAB is a lightweight jQuery/Zepto plugin,
 *   designed for the rapid and straightforward
 *   implementation of A/B testing scenarios.
 *   For more information, refer to srom.github.io/easyAB.
 *   Authored by Romain Strock (@_srom on Twitter).
 *   Current version: v1.0.2.
 */
( function ( $ ) {

    /* The internal seed value utilized for bucket selection. */
    var _seed; /* Data type: number. Access: private. */

    /* The name assigned to the current A/B test. */
    var _name; /* Data type: string. Access: private. */

    /*
     *   The selected alternative for the A/B test.
     *   This can be a string or a function.
     */
    var _alternative; /* Data type: string|function. Access: private. */

    /* The specific bucket chosen for the current alternative. */
    var _bucket; /* Data type: number. Access: private. */

    /* Flag indicating whether the system is operating in development mode. */
    var _dev; /* Data type: boolean. Access: private. */

    /*
     *   Regular expression used to determine if development
     *   mode should be activated.
     */
    var _DEV_REGEX = /#!dev/; /* Data type: RegExp. Access: private. Constant. */

    /*
     *   The identifier for the cookie that stores the A/B test seed.
     *   This is a constant value.
     */
    var _COOKIE_NAME = '_easyab_seed'; /* Data type: string. Access: private. Constant. */

    /*
     *   Determines the appropriate bucket based on the
     *   provided number of buckets and the internal seed.
     *   @param {number} buckets The total count of available buckets.
     *   @return {number} The index of the selected bucket.
     *   @private
     */
    function _getBucket ( buckets ) {
        var seed; /* Local variable to hold the seed for this operation. */

        if ( ! _dev ) {
            // In production mode: either retrieve an existing seed
            // or generate a new one if none is found.
            if ( ! _seed ) {
                _seed = _makeSeed();
            }
            seed = _seed;
        }
        else {
            // In development mode: a new random seed is always generated
            // to ensure fresh results on page reload.
            seed = Math.random() * 999;
        }

        // Calculate and return the bucket number based on the seed.
        return Math.floor( seed % buckets );
    }

    /*
     *   Checks for the presence of a cookie containing the A/B test seed.
     *   If no seed cookie is found, a new random seed is generated and
     *   then stored in a cookie.
     *   @return {number} The seed value, either retrieved or newly generated.
     *   @private
     */
    function _makeSeed ( ) {
        var seed = _readCookie( _COOKIE_NAME ); // Attempt to read the seed from a cookie.

        if ( ! seed ) {
            seed = Math.random() * 999; // Generate a new random seed if not found.
            _setCookie( _COOKIE_NAME, seed, 30 ); // Store the new seed in a cookie for 30 days.
        }

        return seed; // Return the determined seed.
    }

    /*
     *   Establishes a new cookie with the specified name, value, and expiration.
     *   @param {string} name The identifier for the cookie.
     *   @param {number|string} value The data to be stored in the cookie.
     *   @pram {number} days The number of days until the cookie expires.
     *   @private
     */
    function _setCookie ( name, value, days ) {
        var expires = ''; // Initialize the expiration string.

        if ( days ) {
            var date = new Date( );
            date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
            expires = "; expires=" + date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/"; // Set the cookie.
    }

    /*
     *   Retrieves the value of a specific cookie by its name.
     *   @param {string} name The identifier of the cookie to read.
     *   @return {string|number} The value stored in the cookie, or null if not found.
     *   @private
     */
    function _readCookie ( name ) {
        var nameEQ = name + "="; // Construct the full name-equals string to search for.
        var ca = document.cookie.split( ';' ); // Split the document.cookie string into individual cookies.

        for ( var i = 0; i < ca.length; i++ ) {
            var c = ca[i]; // Get the current cookie string.
            while ( c.charAt( 0 ) == ' ' ) c = c.substring( 1, c.length ); // Trim leading whitespace.
            if ( c.indexOf( nameEQ ) == 0 ) return c.substring( nameEQ.length, c.length ); // If found, return its value.
        }

        return null; // Return null if the cookie is not found.
    }

    /*
     *   Updates the content of a jQuery object based on the selected alternative.
     *   @param {jQuery} $obj The jQuery object whose content needs to be updated.
     *   @private
     */
    function _display ( $obj ) {
        if ( _alternative['alternative'] ) {
            var alternative = _alternative['alternative']; // Extract the alternative content/function.

            if ( typeof alternative === 'string' ) {
                // If the alternative is a string, set it as the text content.
                $obj.text( alternative );
            }
            else if ( typeof alternative === 'function' ) {
                // If it's a function, execute it with the jQuery object as an argument.
                alternative( $obj );
            }
        }
    }

    /*
     *   Sets a custom variable in Google Analytics.
     *   @param {string} slot The slot number for the custom variable.
     *   @param {string} name The name (key) of the custom variable.
     *   @param {string} value The value to assign to the custom variable.
     *   @param {Object} options Additional configuration options for tracking.
     *   @private
     */
    function _trackCustomVar ( slot, name, value, options ) {
        var scope = options['scope'] || 3; // Default scope is 3 (session-level).

        window['_gaq'].push( [ '_setCustomVar',
            slot,
            name,
            value,
            scope
        ] );
    }

    /*
     *   Sends an event to Google Analytics.
     *   Note: The 'non-interaction' parameter defaults to true here,
     *   which is different from GA's default. This prevents A/B tests
     *   from skewing bounce rates.
     *   @param {string} category The event category.
     *   @param {string} action The event action.
     *   @param {Object} options Additional configuration for the event.
     *   @private
     */
    function _trackEvent ( category, action, options ) {
        var label          = options['event-label']          || undefined,
            value          = options['event-value']          || undefined,
            noninteraction = options['event-noninteraction'] || true; // Default to true.

        window['_gaq'].push( [ '_trackEvent',
            category,
            action,
            label,
            value,
            noninteraction
        ] );
    }

    /*
     *   Outputs a message to the browser's console, if available.
     *   @param {string} msg The message string to be logged.
     *   @private
     */
    function _log ( msg ) {
        if ( typeof window['console'] !== 'undefined'
            && typeof msg === 'string' ) {
            return window['console']['log']( msg );
        }
    }

    /*
     *   Integrates the A/B test tracking with Google Analytics.
     *   @param {Object} options The configuration options for tracking.
     *   @private
     */
    function _track ( options ) {
        // Only proceed if the Google Analytics queue has been initialized.
        if ( typeof window['_gaq'] !== 'undefined' ) {
            var value = '', // Initialize tracking value.
                slot  = options['slot']; // Retrieve the custom variable slot from options.

            if ( _bucket !== 0 ) {
                // If an alternative bucket is selected.
                value = _alternative['value'] || 'alternative' + _bucket;
            }
            else {
                // If the default (control) bucket is selected.
                value = options['default-value'] || 'default';
            }

            if ( _dev ) {
                // In development mode, simply log the tracking information.
                if ( slot ) {
                    _log( _name + ' : ' + value + ' (custom var ' + slot + ')' );
                }
                else {
                    _log( _name + ' : ' + value + ' (event)' );
                }
            }
            else if ( slot ) {
                // In production and a slot is specified, track a custom variable.
                _trackCustomVar( slot, _name, value, options );
            }
            else {
                // In production and no slot, track an event.
                _trackEvent( _name, value, options );
            }
        }
    }

    /*
     *   The main easyAB jQuery plugin definition.
     *   Initializes and runs an A/B test on the selected elements.
     *   @param {Object} options Configuration object for the A/B test.
     */
    $.fn.easyab = function ( options ) {
        // Validate options and cookie availability. If invalid, return early.
        if ( ! options
            || typeof options !== 'object'
            || ! navigator.cookieEnabled ) {
            return this;
        }
        else {
            _name = options['name']; // Set the test name.

            if ( _name && options['alternatives'] ) {
                _dev      = _DEV_REGEX.test( window.location ); // Check for dev mode.
                _bucket   = _getBucket( options['alternatives'].length + 1 ); // Determine the bucket.

                if ( _bucket !== 0 ) {
                    _alternative = options['alternatives'][_bucket - 1]; // Select the alternative.
                }

                _track( options ); // Track the A/B test.
            }

            // Iterate over each selected element to apply the A/B test.
            return this.each( function ( ) {
                var $this = $( this ); // Wrap the current element in a jQuery object.

                if ( _bucket !== 0 ) {
                    _display( $this ); // Display the alternative if not in the default bucket.
                }
            } );
        }
    };
// This plugin is designed to work seamlessly with both Zepto.js and jQuery!
} )( window['jQuery'] || window['Zepto'] );