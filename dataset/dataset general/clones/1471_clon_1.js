/**
 * @license
 * /////////////////////////////////////////////////////////////////
 * //  Fuse.js - A lightweight fuzzy-search library for JavaScript
 * //
 * //  Copyright (c) 2012 Kirollos Risk <kirollos@gmail.com>.
 * //  All Rights Reserved.
 * //  Licensed under the Apache Software License 2.0.
 * //
 * //  A copy of the License is available at:
 * //  http://www.apache.org/licenses/LICENSE-2.0
 * //
 * //  Unless required by applicable law or agreed to in writing, software
 * //  distributed under the License is distributed on an "AS IS" BASIS,
 * //  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * //  See the License for the specific language governing permissions and
 * //  limitations under the License.
 * /////////////////////////////////////////////////////////////////
 */
(function( global ) {


    /**
     * This class implements the Bitap algorithm for fuzzy searching.
     * It's adapted from Google's "Diff, Match and Patch" library.
     *
     * Original source: http://code.google.com/p/google-diff-match-patch/
     *
     * Modifications by: Kirollos Risk <kirollos@gmail.com>
     * ----------------------------------------------------
     * The core algorithm and structure were adjusted to enable the creation of
     * `Searcher` instances. Each `Searcher` instance has a `search` method
     * that performs the actual Bitap search. The `pattern` (the string being
     * searched for) is defined only once per instance, which prevents redundant
     * re-creation when searching across a list of multiple strings.
     *
     * This module is also licensed under the Apache License, Version 2.0.
     * You may not use this file except in compliance with the License.
     * A copy of the License is available at: http://www.apache.org/licenses/LICENSE-2.0
     *
     * @param {string} pattern - The string pattern to search for.
     * @param {Object} options - Configuration options for the search.
     * @constructor
     */
    var BitapSearcher = function( pattern, options ) {

        options = options || {}; // Ensure options object exists

        this.options = options;

        // Set search location, defaulting if not provided
        this.options.location = options.location || BitapSearcher.defaultOptions.location;

        // Set distance, defaulting if not provided
        this.options.distance = 'distance' in options ? options.distance : BitapSearcher.defaultOptions.distance;

        // Set threshold, defaulting if not provided
        this.options.threshold = 'threshold' in options ? options.threshold : BitapSearcher.defaultOptions.threshold;

        // Set maximum pattern length, defaulting if not provided
        this.options.maxPatternLength = options.maxPatternLength || BitapSearcher.defaultOptions.maxPatternLength;

        // Store the pattern, converting to lower case if case-insensitive
        this.pattern = options.caseSensitive ? pattern : pattern.toLowerCase();

        // Store the length of the pattern
        this.patternLen = pattern.length;


        // Validate pattern length against maximum allowed
        if ( this.patternLen > this.options.maxPatternLength ) {
            throw new Error( 'Pattern length exceeds maximum allowed length.' );
        }

        // Calculate the match mask for the Bitap algorithm
        this.matchmask = 1 << ( this.patternLen - 1 );

        // Pre-calculate the pattern alphabet for efficiency
        this.patternAlphabet = this._calculatePatternAlphabet();
    };


    /**
     * Default options for the BitapSearcher.
     * These can be overridden during instantiation.
     * @static
     * @property {Object} defaultOptions
     */
    BitapSearcher.defaultOptions = {

        // Specifies the approximate location in the text where the pattern is expected to be found.
        location: 0,

        // Defines how close a match must be to the fuzzy location.
        // A distance of '0' requires the match at the exact specified location.
        // A larger distance allows for matches further away, with a penalty to the score.
        distance: 100,

        // The threshold at which the search algorithm gives up.
        // '0.0' requires a perfect match (both letters and location).
        // '1.0' would match anything, indicating no threshold.
        threshold: 0.6,

        // The maximum length of the pattern that can be searched.
        // This is typically related to the machine word size used in bitwise operations.
        maxPatternLength: 32
    };


    /**
     * Initializes and returns the alphabet map for the Bitap algorithm.
     * This map stores the bitmask for each character present in the pattern.
     *
     * @returns {Object} A hash map where keys are characters and values are their bitmasks.
     * @private
     */
    BitapSearcher.prototype._calculatePatternAlphabet = function() {

        var mask = {}; // Initialize an empty mask object
        var i = 0;     // Loop counter


        // First pass: Initialize all character masks to 0
        for ( i = 0; i < this.patternLen; i++ ) {
            mask[ this.pattern.charAt( i ) ] = 0;
        }

        // Second pass: Set the appropriate bits for each character in the pattern
        // Each bit represents the position of the character in the pattern.
        for ( i = 0; i < this.patternLen; i++ ) {
            mask[ this.pattern.charAt( i ) ] |= 1 << ( this.pattern.length - i - 1 );
        }

        return mask; // Return the populated alphabet mask
    };


    /**
     * Computes and returns the score for a match based on errors and location.
     * A lower score indicates a better match (0.0 is a perfect match).
     *
     * @param {number} errors   - The number of errors (mismatches) found in the match.
     * @param {number} location - The starting index of the match in the text.
     * @returns {number} The calculated overall score for the match.
     * @private
     */
    BitapSearcher.prototype._bitapScore = function( errors, location ) {

        // Calculate the accuracy component of the score
        var accuracy = errors / this.patternLen;

        // Calculate the proximity component of the score
        var proximity = Math.abs( this.options.location - location );

        // If distance is zero, we handle it to avoid division by zero.
        // A non-zero proximity means it's not at the exact location, so score is 1.0 (bad).
        if ( !this.options.distance ) {
            return proximity ? 1.0 : accuracy;
        }

        // Combine accuracy and proximity to get the final score
        return accuracy + ( proximity / this.options.distance );
    };


    /**
     * Performs a fuzzy search for the pattern within the given text.
     * It returns an object indicating whether a match was found and its score.
     *
     * @param {string} text - The text string to search within.
     * @returns {Object} A literal object containing:
     *   - {boolean} isMatch: True if a match was found, false otherwise.
     *   - {number}  score:   The overall score for the best match (0.0 = perfect, 1.0 = worst).
     * @public
     */
    BitapSearcher.prototype.search = function( text ) {

        // Convert text to lower case if case-insensitive search is enabled
        text = this.options.caseSensitive ? text : text.toLowerCase();

        // Check for an exact match as a quick exit
        if ( this.pattern === text ) {
            return {
                isMatch: true,
                score:   0
            };
        }


        // --- Variable Declarations ---
        var i, j;                                     // Loop counters
        var textLen = text.length;                    // Length of the text being searched
        var LOCATION = this.options.location;         // The expected fuzzy location of the pattern
        var THRESHOLD = this.options.threshold;       // The maximum score allowed for a match
        var bestLoc = text.indexOf( this.pattern, LOCATION ); // Initial search for an exact match
        var binMin, binMid;                           // Variables for binary search
        var binMax = this.patternLen + textLen;       // Max value for binary search range
        var start, finish;                            // Start and end indices for text segment to search
        var bitArr, lastBitArr;                       // Bit arrays for tracking match states
        var charMatch;                                // Character match mask from alphabet
        var score = 1;                                // Initial score (worst possible)
        var locations = [];                           // Stores locations of potential matches


        // --- Initial Threshold Optimization ---
        // If an exact match is found, update the THRESHOLD to potentially improve performance
        if ( bestLoc !== -1 ) {
            THRESHOLD = Math.min( this._bitapScore( 0, bestLoc ), THRESHOLD );

            // Check for another exact match in the other direction (speedup)
            bestLoc = text.lastIndexOf( this.pattern, LOCATION + this.patternLen );

            if ( bestLoc !== -1 ) {
                THRESHOLD = Math.min( this._bitapScore( 0, bestLoc ), THRESHOLD );
            }
        }

        bestLoc = -1; // Reset best location after initial checks


        // --- Main Bitap Search Loop ---
        // Iterate, allowing for one more error in each pass
        for ( i = 0; i < this.patternLen; i++ ) {

            // Binary search to determine how far from `LOCATION` we can stray at this error level.
            binMin = 0;
            binMid = binMax;
            while ( binMin < binMid ) {
                if ( this._bitapScore( i, LOCATION + binMid ) <= THRESHOLD ) {
                    binMin = binMid;
                } else {
                    binMax = binMid;
                }
                binMid = Math.floor( ( binMax - binMin ) / 2 + binMin );
            }

            // Use the result of this binary search as the maximum for the next iteration.
            binMax = binMid;

            // Determine the search window (start and finish indices) within the text.
            start = Math.max( 1, LOCATION - binMid + 1 );
            finish = Math.min( LOCATION + binMid, textLen ) + this.patternLen;

            // Initialize the bit array for the current pass.
            bitArr = Array( finish + 2 );

            // Set the sentinel value for the bit array.
            bitArr[ finish + 1 ] = ( 1 << i ) - 1;


            // --- Inner Loop: Scan the text segment ---
            for ( j = finish; j >= start; j-- ) {

                // Get the character match mask from the pre-calculated alphabet.
                // Note: The `patternAlphabet` is a sparse hash, so accessing `text.charAt(j-1)`
                // for characters not in the pattern will result in `undefined`,
                // which behaves as 0 in bitwise operations.
                charMatch = this.patternAlphabet[ text.charAt( j - 1 ) ];

                if ( i === 0 ) {
                    // First pass: exact match.
                    // Shift the previous bit array value and OR with 1, then AND with charMatch.
                    bitArr[ j ] = ( ( bitArr[ j + 1 ] << 1 ) | 1 ) & charMatch;
                } else {
                    // Subsequent passes: fuzzy match.
                    // This involves considering insertions, deletions, and substitutions.
                    bitArr[ j ] = ( ( bitArr[ j + 1 ] << 1 ) | 1 ) & charMatch |
                                  ( ( ( lastBitArr[ j + 1 ] | lastBitArr[ j ] ) << 1 ) | 1 ) |
                                  lastBitArr[ j + 1 ];
                }


                // Check if a match is found at the current position.
                // A match occurs if the `matchmask` bit is set in `bitArr[j]`.
                if ( bitArr[ j ] & this.matchmask ) {

                    // Calculate the score for this potential match.
                    score = this._bitapScore( i, j - 1 );

                    // If this score is better than or equal to the current best THRESHOLD, update.
                    if ( score <= THRESHOLD ) {
                        THRESHOLD = score;     // Update the best threshold found so far
                        bestLoc = j - 1;       // Update the best match location
                        locations.push( bestLoc ); // Store this match location

                        // If the best location is past the target `LOCATION`,
                        // narrow the search window for `start`.
                        if ( bestLoc > LOCATION ) {
                            start = Math.max( 1, 2 * LOCATION - bestLoc );
                        } else {
                            // If the best location is before or at `LOCATION`,
                            // we can break early as further matches in this direction
                            // will likely be worse.
                            break;
                        }
                    }
                }
            }

            // If the potential score for the next error level is already worse than
            // the current best THRESHOLD, there's no hope for a better match.
            if ( this._bitapScore( i + 1, LOCATION ) > THRESHOLD ) {
                break;
            }

            // Store the current bit array for the next iteration (fuzzy match calculations).
            lastBitArr = bitArr;
        }

        // Return the final result: whether a match was found and its score.
        return {
            isMatch: bestLoc >= 0,
            score:   score
        };
    };


    /**
     * Recursively traverses an object to retrieve a value specified by a dot-separated path.
     * If the path leads to an array, all elements of the array are processed.
     * The results are accumulated in a list.
     *
     * @param {Object} obj      - The current object being traversed.
     * @param {string} path     - The remaining path segments (dot-separated).
     * @param {Array}  list     - The list to accumulate the found values.
     * @returns {Array} The list containing all values found at the specified path.
     */
    var deepValueHelper = function( obj, path, list ) {

        var firstSegment; // The first part of the current path
        var remaining;    // The rest of the path after the first segment
        var dotIndex;     // Index of the first dot in the path


        // Base case: If there's no path left, we've reached the target object/value.
        if ( !path ) {
            list.push( obj ); // Add the current object/value to the list
        } else {
            dotIndex = path.indexOf( '.' ); // Find the first dot

            if ( dotIndex !== -1 ) {
                firstSegment = path.slice( 0, dotIndex ); // Extract the first segment
                remaining = path.slice( dotIndex + 1 );   // Extract the rest of the path
            } else {
                firstSegment = path; // If no dot, the whole path is the first segment
            }

            var value = obj[ firstSegment ]; // Get the value for the current segment

            if ( value ) { // If a value exists for the segment
                // If there's no remaining path and the value is a primitive (string/number), add it.
                if ( !remaining && ( typeof value === 'string' || typeof value === 'number' ) ) {
                    list.push( value );
                } else if ( Utils.isArray( value ) ) {
                    // If the value is an array, recursively search each item in the array.
                    for ( var i = 0, len = value.length; i < len; i++ ) {
                        deepValueHelper( value[ i ], remaining, list );
                    }
                } else if ( remaining ) {
                    // If it's an object and there's a remaining path, recurse further.
                    deepValueHelper( value, remaining, list );
                }
            }
        }

        return list; // Return the accumulated list of values
    };


    /**
     * Utility functions for Fuse.js.
     * @namespace Utils
     */
    var Utils = {

        /**
         * Traverses an object using a dot-separated path to extract values.
         * Handles nested objects and arrays within the path.
         *
         * @param {Object} obj  - The object to traverse.
         * @param {string} path - A dot-separated path (e.g., 'Data.Object.SomeValue').
         * @returns {Array} An array of values found at the specified path.
         */
        deepValue: function( obj, path ) {
            // Start the recursive helper with an empty list
            return deepValueHelper( obj, path, [] );
        },

        /**
         * Checks if a given object is an array.
         *
         * @param {*} obj - The object to check.
         * @returns {boolean} True if the object is an array, false otherwise.
         */
        isArray: function( obj ) {
            return Object.prototype.toString.call( obj ) === '[object Array]';
        }
    };


    /**
     * Fuse.js constructor function.
     * Initializes a new fuzzy-search instance with a list and options.
     *
     * @param {Array}  list    - The list of items to search through.
     * @param {Object} options - Configuration options for the Fuse instance.
     * @public
     * @constructor
     */
    function Fuse( list, options ) {

        this.list = list; // The data list to be searched
        this.options = options = options || {}; // Ensure options object exists

        var i, len, key, keys; // Loop variables

        // Process boolean type options (with default values)
        var booleanOptions = [ 'sort', 'includeScore', 'shouldSort' ];
        for ( i = 0, len = booleanOptions.length; i < len; i++ ) {
            key = booleanOptions[ i ];
            this.options[ key ] = key in options ? options[ key ] : Fuse.defaultOptions[ key ];
        }

        // Process other options (with default values)
        var otherOptions = [ 'searchFn', 'sortFn', 'keys', 'getFn' ];
        for ( i = 0, len = otherOptions.length; i < len; i++ ) {
            key = otherOptions[ i ];
            this.options[ key ] = options[ key ] || Fuse.defaultOptions[ key ];
        }
    }


    /**
     * Default options for Fuse.js.
     * These can be overridden during the Fuse instance creation.
     * @static
     * @property {Object} defaultOptions
     */
    Fuse.defaultOptions = {

        id: null, // The key to use as the item's identifier (e.g., 'id' or 'name')

        caseSensitive: false, // Whether the search should be case-sensitive

        // If true, the result list will include the score for each match.
        // Results will be of the form: `{ item: ..., score: ... }`.
        includeScore: false,

        // If true, the results will be sorted by score (lowest score first).
        shouldSort: true,

        // The search function to be used. Defaults to BitapSearcher.
        // This function must conform to a specific API:
        //  - Constructor: `function( pattern, options )`
        //  - Prototype method: `search( text )` returning `{ isMatch: boolean, score: number }`
        searchFn: BitapSearcher,

        // The default sorting function for results, sorts by score ascending.
        sortFn: function( a, b ) {
            return a.score - b.score;
        },

        // The default function to retrieve values from an object using a path.
        getFn: Utils.deepValue,

        keys: [] // An array of keys to search within each item in the list.
    };


    /**
     * Initiates a fuzzy search for the given pattern across the list.
     * It returns a list of items that match the pattern, optionally sorted and with scores.
     *
     * @param {string} pattern - The pattern string to fuzzy search for.
     * @returns {Array} A list of all search matches.
     * @public
     */
    Fuse.prototype.search = function( pattern ) {

        // Create a new searcher instance with the pattern and Fuse options
        var searcher = new ( this.options.searchFn )( pattern, this.options );

        var j, item; // Loop counters and current item reference

        var list = this.list;             // The data list to search
        var dataLen = list.length;        // Length of the data list
        var options = this.options;       // Reference to Fuse's options
        var searchKeys = this.options.keys; // Keys to search within each item
        var searchKeysLen = searchKeys.length; // Number of search keys

        var bitapResult;                  // Result from the Bitap searcher
        var rawResults = [];              // Stores raw results before final processing
        var resultMap = {};               // Maps original item index to its result, for score consolidation
        var existingResult;               // Reference to an existing result in resultMap
        var results = [];                 // The final list of processed results


        /**
         * Helper function to analyze text against the pattern using the Bitap searcher.
         * If a match is found, it adds or updates the item in `rawResults`.
         *
         * @param {string|Array} text   - The text or array of texts to search within.
         * @param {Object|number} entity - The original item object or its index if the list is flat.
         * @param {number} index        - The original index of the item in the `list`.
         * @private
         */
        var analyzeText = function( text, entity, index ) {

            // Skip if the text is undefined or null (cannot be searched)
            if ( text === undefined || text === null ) {
                return;
            }

            // If the text is a string, perform the search
            if ( typeof text === 'string' ) {

                bitapResult = searcher.search( text ); // Get the search result

                // If a match is found, add or update the item in the raw results
                if ( bitapResult.isMatch ) {

                    existingResult = resultMap[ index ]; // Check if this item already has a match

                    if ( existingResult ) {
                        // If it exists, update with the lowest (best) score
                        existingResult.score = Math.min( existingResult.score, bitapResult.score );
                    } else {
                        // Otherwise, add a new entry to the raw results and map
                        resultMap[ index ] = {
                            item:  entity,
                            score: bitapResult.score
                        };
                        rawResults.push( resultMap[ index ] );
                    }
                }
            } else if ( Utils.isArray( text ) ) {
                // If `text` is an array, recursively call analyzeText for each element
                for ( var i = 0; i < text.length; i++ ) {
                    analyzeText( text[ i ], entity, index );
                }
            }
        };


        // Determine search strategy based on the type of the first item in the list.
        // If the first item is a string, assume a flattened array of strings.
        if ( typeof list[ 0 ] === 'string' ) {
            // Iterate over every item in the list
            for ( var i = 0; i < dataLen; i++ ) {
                analyzeText( list[ i ], i, i ); // Search the string directly
            }
        } else {
            // Otherwise, assume the list contains objects and search their key values.

            // Iterate over every item object in the list
            for ( var i = 0; i < dataLen; i++ ) {
                item = list[ i ]; // Current item object

                // Iterate over each specified search key
                for ( j = 0; j < searchKeysLen; j++ ) {
                    // Get the value(s) for the current key and analyze them
                    analyzeText( options.getFn( item, searchKeys[ j ] ), item, i );
                }
            }
        }


        // Sort the raw results if `shouldSort` option is true
        if ( options.shouldSort ) {
            rawResults.sort( options.sortFn );
        }


        // Helper function to get the final item from rawResults.
        // Returns the raw result object (with score) or just the item itself,
        // depending on the `includeScore` option.
        var getItem = options.includeScore ? function( i ) {
            return rawResults[ i ];
        } : function( i ) {
            return rawResults[ i ].item;
        };

        // Helper function to replace the item with its identifier if `options.id` is specified.
        var replaceValue = options.id ? function( i ) {
            // Use getFn to retrieve the ID value from the original item
            rawResults[ i ].item = options.getFn( rawResults[ i ].item, options.id )[ 0 ];
        } : function() {
            // No-operation if no ID is specified
            return;
        };


        // Final processing: push items into the `results` array, applying `replaceValue` and `getItem`.
        for ( var i = 0, len = rawResults.length; i < len; i++ ) {
            // Replace the item with its ID if configured
            replaceValue( i );
            // Add the processed item (or item with score) to the final results
            results.push( getItem( i ) );
        }

        return results; // Return the final search results
    };


    // --- Module Export Logic ---

    // Export to CommonJS Loader (Node.js environment)
    if ( typeof exports === 'object' ) {
        module.exports = Fuse;
    }
    // Export for AMD (Asynchronous Module Definition) loaders like RequireJS
    else if ( typeof define === 'function' && define.amd ) {
        define( function() {
            return Fuse;
        } );
    }
    // Export to browser globals (e.g., window object)
    else {
        global.Fuse = Fuse;
    }

})( this ); // Execute the IIFE with `this` (window in browsers, global in Node.js) as `global`