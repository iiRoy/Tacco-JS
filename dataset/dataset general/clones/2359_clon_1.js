/*
 * Jribbble - A jQuery Plugin for Dribbble API interaction
 *
 * Version: @VERSION
 *
 * This plugin facilitates fetching shot and player data
 * from the Dribbble API. You can find more details at:
 * http://dribbble.com/api
 *
 *
 * Copyright (c) 2011 Tyler Gaw. All rights reserved.
 *
 *
 * License Information (MIT License):
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 * Last Build Date: @DATE
 *
 *
 */

/* Ensure jQuery is loaded and wrap the plugin logic in an IIFE */
; ( function ( $ , window , document , undefined ) {

    // Enforce strict mode for cleaner, safer code.
    'use strict' ;

    // Initialize the main Jribbble object within the jQuery namespace.
    $ . jribbble = { } ;


    // This private helper function handles making JSONP GET requests to the Dribbble API.
    var jsonpGET = function ( path , args ) {

        $ . ajax ( {
            type     : 'GET' , // HTTP method for the request.
            url      : 'http://api.dribbble.com' + path , // Construct the full API endpoint URL.
            data     : args [ 1 ] || { } , // Optional data parameters, defaulting to an empty object.
            dataType : 'jsonp' , // Specify JSONP for cross-domain requests.

            // Callback function executed upon successful API response.
            success  : function ( data ) {
                // Check if the received data is undefined, indicating an error or empty response.
                if ( typeof ( data ) === 'undefined' ) {
                    // Call the provided callback with an error object.
                    args [ 0 ] ( { error : true } ) ;
                }
                else {
                    // Otherwise, pass the received data to the callback.
                    args [ 0 ] ( data ) ;
                }
            }
        } ) ;

    } ; // End of jsonpGET function definition.


    // Define a map of API method names to their corresponding URL patterns.
    // The '$' acts as a placeholder for dynamic IDs.
    var methods = {

        'getShotById'               : '/shots/$/' , // Fetch a single shot by its ID.
        'getReboundsOfShot'         : '/shots/$/rebounds/' , // Get rebounds for a specific shot.
        'getShotsByList'            : '/shots/$/' , // Retrieve shots from a specific list (e.g., 'debuts', 'popular').
        'getShotsByPlayerId'        : '/players/$/shots/' , // Get all shots by a particular player.
        'getShotsThatPlayerFollows' : '/players/$/shots/following/' , // Shots from players the given player follows.
        'getPlayerById'             : '/players/$/' , // Fetch a player's profile by ID or username.
        'getPlayerFollowers'        : '/players/$/followers/' , // Get followers of a specific player.
        'getPlayerFollowing'        : '/players/$/following/' , // Get players a specific player is following.
        'getPlayerDraftees'         : '/players/$/draftees/' , // Get players drafted by a specific player.
        'getCommentsOfShot'         : '/shots/$/comments/' , // Retrieve comments for a specific shot.
        'getShotsThatPlayerLikes'   : '/players/$/shots/likes/' // Get shots liked by a specific player.

    } ; // End of methods object.


    // This factory function creates API methods dynamically based on a URL pattern.
    var createAPIMethod = function ( urlPattern ) {

        return function ( ) {

            // Convert the 'arguments' pseudo-array into a true Array for manipulation.
            var args = [ ] . slice . call ( arguments ) ,

                // The URL pattern contains a '$' placeholder. The first argument
                // (e.g., shot ID, player ID) is used to replace this placeholder.
                // We use shift() which also removes it from 'args', as jsonpGET
                // expects the callback and optional data object, not the ID.
                url = urlPattern . replace ( '$' , args . shift ( ) ) ;

            // Execute the JSONP request with the constructed URL and remaining arguments.
            jsonpGET ( url , args ) ;

        } ; // End of inner function.

    } ; // End of createAPIMethod.


    // Iterate over the 'methods' object to dynamically attach each API method
    // to the $.jribbble namespace.
    for ( var method in methods ) {

        // Assign the newly created API function to $.jribbble[methodName].
        $ . jribbble [ method ] = createAPIMethod ( methods [ method ] ) ;

    } // End of for...in loop.


} ) ( jQuery , window , document ) ; // End of the immediately invoked function expression.