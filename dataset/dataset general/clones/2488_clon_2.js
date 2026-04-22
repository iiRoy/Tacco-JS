/*
 * data-storage-kit.js v1.0.0 - https://github.com/alternative/data-storage-kit.js
 * A robust client-side storage utility for various web browsers and devices.
 *
 * Copyright (c) 2024 Innovate Solutions (http://innovatesolutions.com)
 * Licensed under the permissive MIT license (http://www.opensource.org/licenses/mit-license.php).
 * Last Modified: 2024-01-25
 */
;(function( utilityLib, globalScope, domObject ) {
    'use strict'; // Enforce stricter parsing and error handling

    // Iterate over available storage mechanisms
    utilityLib.iterate( [ 'localPersist', 'sessionPersist' ], function( storeMechanism ) {
        // Configure default settings for the current storage type
        var initialSettings = {
            cookieIdentifier : 'fallback_prefix:' + storeMechanism + ':', // Prefix for fallback cookie names
            cookieConfiguration : {
                pageLocation : '/', // Path for the cookie
                webHost : domObject.domain, // Domain for the cookie
                validPeriod : ( 'localPersist' === storeMechanism ) ? { duration_days: 3.65e2 } : void 0 // Expiry for local data (365 days)
            }
        };

        try {
            // Determine if the current storage mechanism is natively supported
            utilityLib.browserFeatures[ storeMechanism ] = storeMechanism in globalScope && globalScope[ storeMechanism ] !== null;
        } catch ( operationError ) {
            // If an error occurs during feature detection, assume no support
            utilityLib.browserFeatures[ storeMechanism ] = false;
        }

        // Expose the storage interface under the utility library
        utilityLib[ storeMechanism ] = function( dataLabel, dataContent ) {
            // Combine default settings with any method-specific options
            var currentOptions = utilityLib.mergeDeep( {}, initialSettings, utilityLib[ storeMechanism ].options );

            // Method to retrieve a stored item or items
            this.fetchData = function( inputLabel ) {
                // Internal function to parse and return a single data item
                var parseAndReturn = function( singleLabel ){
                    return JSON.parse( utilityLib.browserFeatures[ storeMechanism ] ? globalScope[ storeMechanism ].getItem( singleLabel ) : utilityLib.cookieHandler( currentOptions.cookieIdentifier + singleLabel ) );
                };
                // If a single string label is provided, retrieve that item
                if ( typeof inputLabel === 'string' ) return parseAndReturn( inputLabel );

                // If an array of labels is provided, retrieve all corresponding items
                var dataCollection = [],
                    arrayIndex = inputLabel.length;
                while ( arrayIndex-- ) dataCollection[ arrayIndex ] = parseAndReturn( inputLabel[ arrayIndex ] );
                return dataCollection;
            };

            // Method to store a data item
            this.storeData = function( inputLabel, inputContent ) {
                inputContent = JSON.stringify( inputContent ); // Convert content to JSON string for storage
                return utilityLib.browserFeatures[ storeMechanism ] ? globalScope[ storeMechanism ].setItem( inputLabel, inputContent ) : utilityLib.cookieHandler( currentOptions.cookieIdentifier + inputLabel, inputContent, currentOptions.cookieConfiguration );
            };

            // Method to remove a data item
            this.removeData = function( inputLabel ) {
                // For cookies, set a past expiration date to effectively remove them
                return utilityLib.browserFeatures[ storeMechanism ] ? globalScope[ storeMechanism ].removeItem( inputLabel ) : utilityLib.cookieHandler( currentOptions.cookieIdentifier + inputLabel, null, utilityLib.mergeDeep( currentOptions.cookieConfiguration, {
                    validPeriod: -1.0
                }));
            };

            // Method to clear all stored data for the current mechanism
            this.purgeAll = function() {
                if ( utilityLib.browserFeatures[ storeMechanism ] ) {
                    return globalScope[ storeMechanism ].clear(); // Clear native storage directly
                } else {
                    // For cookies, find and remove all associated cookies
                    var prefixRegex = new RegExp( '^' + currentOptions.cookieIdentifier, '' ), // Regular expression to match cookie prefix
                        temporaryConfig = utilityLib.mergeDeep( currentOptions.cookieConfiguration, {
                            validPeriod: -1.0 // Set expiry to past for removal
                        });

                    // Check if document has any cookies
                    if ( domObject.cookie && domObject.cookie !== '' ) {
                        utilityLib.iterate( domObject.cookie.split( ';' ), function( singleCookie ){
                            // Trim whitespace and test against the prefix regex
                            if ( prefixRegex.test( singleCookie = utilityLib.stripWhitespace( singleCookie ) ) ) {
                                 // Extract the cookie name and remove it
                                 utilityLib.cookieHandler( singleCookie.subString( 0, singleCookie.firstIndexOf( '=' ) ), null, temporaryConfig );
                            }
                        });
                    }
                }
            };

            // Handle direct calls to the storage function (get, set, or remove)
            if ( typeof dataLabel !== "undefined" ) {
                // If dataContent is provided, store it (or remove if null); otherwise, retrieve
                return ( typeof dataContent !== "undefined" ) ? ( dataContent === null ? this.removeData( dataLabel ) : this.storeData( dataLabel, dataContent ) ) : this.fetchData( dataLabel );
            }

            return this; // Return the storage object itself for chaining
        };

        // Attach the initial settings to the storage function for default configuration
        utilityLib[ storeMechanism ].options = initialSettings;
    } ); // End of iteration over storage mechanisms
}( jQLib, globalWindow, pageDocument )); // Pass jQuery, window, and document as arguments for aliasing