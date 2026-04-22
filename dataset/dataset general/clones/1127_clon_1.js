/*
 * Router.js - A simple client-side router for JavaScript applications.
 *
 * This file contains the core routing logic.
 *
 * Original Copyright (C) 2012 haithem bel haj.
 *
 * Permission is granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Self-executing anonymous function to encapsulate the Router implementation
( function ( ) {

    // Attach Router to the global window object
    window . Router = ( function ( ) {

        // Regular expression to match named parameters in routes (e.g., :id)
        Router . namedParam = /:\w+/g ;

        // Regular expression to match splat parameters in routes (e.g., *path)
        Router . splatParam = /\*\w+/g ;

        // Default behavior: trigger route callbacks when navigating
        Router . prototype . trigger = true ;

        /**
         * Router constructor. Initializes the router with a set of routes.
         * @param {Object} routes - An object mapping route patterns to callback functions.
         */
        function Router ( routes ) {

            // Store a reference to 'this' for use in callbacks
            var _this = this ;

            // Initialize routes, defaulting to an empty object if not provided
            this . routes = routes != null ? routes : { } ;

            // Bind to the 'statechange' event from History.js to detect URL changes
            History . Adapter . bind (
                window ,
                'statechange' ,
                function ( ) {
                    // When the state changes, check the routes against the new state
                    return _this . checkRoutes ( History . getState ( ) ) ;
                }
            ) ;

        } // End of Router constructor

        /**
         * Defines a new route and its corresponding callback function.
         * Converts the route pattern into a regular expression.
         * @param {string} route - The route pattern (e.g., '/users/:id').
         * @param {Function} callback - The function to execute when the route matches.
         */
        Router . prototype . route = function ( route , callback ) {

            // Replace named parameters (e.g., :id) with a regex capture group for non-slash characters
            route = route . replace ( Router . namedParam , '([^\/]+)' ) ;

            // Replace splat parameters (e.g., *path) with a regex capture group for any characters
            route = route . replace ( Router . splatParam , '(.*?)' ) ;

            // Store the compiled route regex string and its callback in the routes object
            // The "^" and "$" ensure the regex matches the full URL
            return this . routes [ "^" + route + "$" ] = callback ;

        } ; // End of route method

        /**
         * Checks the current URL against all defined routes and executes the matching callback.
         * @param {Object} state - The History.js state object containing URL information.
         */
        Router . prototype . checkRoutes = function ( state ) {

            var callback , regex , regexText , url , _ref ; // Declare all variables at the top

            // Only proceed if routing is currently enabled (not suppressed by navigate)
            if ( this . trigger ) {

                _ref = this . routes ; // Cache reference to routes object

                // Iterate over each stored route regex string
                for ( regexText in _ref ) {

                    // Get the callback function associated with the current regex
                    callback = _ref [ regexText ] ;

                    // Create a new RegExp object from the stored regex string
                    regex = new RegExp ( regexText ) ;

                    // Determine the URL to check: prefer data.url, fall back to hash
                    url = state . data . url || state . hash ;

                    // If the current URL matches the regex
                    if ( regex . test ( url ) ) {

                        // Execute the callback, passing captured regex groups as arguments
                        // The 'slice(1)' removes the full match (index 0)
                        callback . apply ( window , regex . exec ( url ) . slice ( 1 ) ) ;

                    } // End of if regex.test(url)

                } // End of for...in loop

            } // End of if this.trigger

            // Reset the trigger flag for subsequent navigations
            return this . trigger = true ;

        } ; // End of checkRoutes method

        /**
         * Navigates to a new URL, optionally suppressing route triggering or replacing the current history entry.
         * @param {string} url - The URL to navigate to.
         * @param {boolean} [trigger=true] - Whether to trigger route callbacks for the new URL.
         * @param {boolean} [replace=false] - Whether to replace the current history entry instead of pushing a new one.
         * @param {string} [name=null] - An optional name for the history state (unused by History.js directly here).
         */
        Router . prototype . navigate = function ( url , trigger , replace , name ) {

            // Provide default values for optional parameters
            if ( trigger == null ) {

                trigger = true ;

            }

            if ( replace == null ) {

                replace = false ;

            }

            if ( name == null ) {

                name = null ;

            }

            // Set the internal trigger flag based on the provided argument
            this . trigger = trigger ;

            // Decide whether to replace the current state or push a new one
            if ( replace ) {

                // Replace the current history state
                return History . replaceState (
                    { 'url' : url } , // State data
                    null ,           // Title (unused by History.js in this context)
                    url              // URL
                ) ;

            } else {

                // Push a new history state
                return History . pushState (
                    { 'url' : url } , // State data
                    null ,           // Title (unused by History.js in this context)
                    url              // URL
                ) ;

            } // End of if/else replace

        } ; // End of navigate method

        /**
         * Initializes the router by checking the current URL or a provided URL against defined routes.
         * @param {string} [url] - An optional URL to start routing with. If not provided, uses the current history state.
         */
        Router . prototype . start = function ( url ) {

            var stateObj = { } ; // Initialize an empty state object

            // If a URL is provided, create a state object for it
            if ( url != null ) {

                stateObj = { data : { url : url } } ;

            }
            // Otherwise, get the current state from History.js
            else {

                stateObj = History . getState ( ) ;

            }

            // Check routes with the determined state object
            return this . checkRoutes ( stateObj ) ;

        } ; // End of start method

        /**
         * Navigates forward or backward in the browser history.
         * @param {number} num - The number of steps to go forward (positive) or backward (negative).
         */
        Router . prototype . go = function ( num ) {

            return History . go ( num ) ;

        } ; // End of go method

        /**
         * Navigates back one step in the browser history.
         */
        Router . prototype . back = function ( ) {

            return History . back ( ) ;

        } ; // End of back method

        // Return the Router constructor to be exposed globally
        return Router ;

    } ) ( ) ; // Immediately invoke the Router definition function

} ) . call ( this ) ; // Execute the main IIFE, ensuring 'this' context is window