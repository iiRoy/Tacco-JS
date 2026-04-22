/*
 * This file provides utilities for managing and querying location data
 * stored in a Redis sorted set, leveraging the 'ngeohash' library for
 * geohash-based operations.
 */

var geohash = require('ngeohash'); // Import the geohash library.


/**
 * Retrieves the geohash score (location data) for a single named location.
 *
 * @param  {object}   set           The Redis client set object, containing client and zset name.
 * @param  {string}   location_name The name of the location to retrieve.
 * @param  {function} callBack      Callback function(err, result) to handle the response.
 * @returns {void}
 */
function location( set, location_name, callBack )
{
    // Use zscore to get the score (geohash) associated with the location_name.
    set.client.zscore( set.zset, location_name, function ( err, reply )
    {

        if  ( err )
        {
            // If an error occurred, invoke the callback with the error.
            if ( typeof callBack === "function" )
            {
                callBack( err, null );
            }
        }
        else
        {
            // Successfully retrieved the reply; parse it and return.
            if ( typeof callBack === "function" )
            {
                callBack( null, parseLocation( location_name, reply ) );
            }
        }
    } );
}


/**
 * Retrieves the geohash scores for an array of named locations in a single multi-command.
 *
 * @param  {object}   set               The Redis client set object.
 * @param  {string[]} location_name_array An array of location names to retrieve.
 * @param  {function} callBack          Callback function(err, results).
 * @returns {void}
 */
function locations( set, location_name_array, callBack )
{
    // Initialize a Redis multi transaction.
    var multi = set.client.multi(),
        i; // Loop counter.

    // Queue a zscore command for each location name in the array.
    for  ( i = 0; i < location_name_array.length; i ++ )
    {
        multi.zscore( set.zset, location_name_array[ i ] );
    }

    // Execute all queued commands.
    multi.exec( function ( err, replies )
    {

        if ( err )
        {
            // Handle any errors during multi-execution.
            if ( typeof callBack === "function" )
            {
                callBack( err, null );
            }
        }
        else
        {
            // Process the replies: each reply corresponds to a zscore call.
            var concatedReplies = []; // Array to hold parsed location objects.

            for ( i = 0; i < replies.length; i ++ )
            {
                // Parse each individual location result.
                concatedReplies.push( parseLocation( location_name_array[ i ], replies[ i ] ) );
            }

            // Invoke the callback with the array of parsed locations.
            if ( typeof callBack === 'function' )
            {
                callBack( null, concatedReplies );
            }
        }
    } );
}


/**
 * Helper function to parse a geohash string into a structured location object.
 *
 * @param  {string} location_name The name of the location.
 * @param  {string} hash          The geohash string.
 * @returns {object} An object containing name, latitude, and longitude.
 */
function parseLocation( location_name, hash )
{
    // Decode the geohash integer into latitude and longitude.
    var latlon = geohash.decode_int( hash, 52 );

    // Return a well-structured location object.
    return {
        name: location_name,
        latitude: latlon.latitude,
        longitude: latlon.longitude
    };
}


/**
 * Queries for locations within specified geohash ranges.
 *
 * @param  {object}   set        The Redis client set object.
 * @param  {array}    ranges     An array of [min_geohash, max_geohash] pairs.
 * @param  {boolean}  with_values If true, include scores (geohash) in results.
 * @param  {function} callBack   Callback function(err, results).
 * @returns {void}
 */
function queryByRanges( set, ranges, with_values, callBack )
{
    var multi = set.client.multi(); // Create a Redis multi transaction.

    // Determine whether to fetch scores or just member names.
    if ( with_values === undefined )
    {
        // If 'with_values' is not explicitly set, default to not including scores.
        buildMultiWithoutValues( ranges, set.zset, multi );
    }
    else
    {
        // Otherwise, build the multi command based on the 'with_values' flag.
        buildMultiWithValues( ranges, set.zset, multi );
    }

    // Execute the batched Redis commands.
    multi.exec( function ( err, replies )
    {

        if ( err )
        {
            // Pass any execution error to the callback.
            if ( typeof callBack === 'function' ) callBack( err, null );
        }
        else
        {
            // Process results based on whether values (scores) were requested.
            if ( with_values )
            {
                processResultsWithValues( replies, callBack );
            }
            else
            {
                processResultsWithoutValues( replies, callBack );
            }
        }
    } );
}


/**
 * Helper to build a Redis multi command for ZRANGEBYSCORE including 'WITHSCORES'.
 *
 * @param  {array}  ranges An array of [min_geohash, max_geohash] pairs.
 * @param  {string} zset   The name of the Redis sorted set.
 * @param  {object} multi  The Redis multi transaction object.
 * @returns {void}
 */
function buildMultiWithValues( ranges, zset, multi )
{
    var range = []; // Temporary variable for current range.

    // Iterate through each range and add a ZRANGEBYSCORE WITHSCORES command.
    for ( var i = 0; i < ranges.length; i ++ )
    {
        range = ranges[ i ];
        multi.ZRANGEBYSCORE( zset, range[ 0 ], range[ 1 ], 'WITHSCORES' );
    }
}


/**
 * Helper to build a Redis multi command for ZRANGEBYSCORE without 'WITHSCORES'.
 *
 * @param  {array}  ranges An array of [min_geohash, max_geohash] pairs.
 * @param  {string} zset   The name of the Redis sorted set.
 * @param  {object} multi  The Redis multi transaction object.
 * @returns {void}
 */
function buildMultiWithoutValues( ranges, zset, multi )
{
    var range = []; // Temporary variable for current range.

    // Iterate through each range and add a ZRANGEBYSCORE command.
    for ( var i = 0; i < ranges.length; i ++ )
    {
        range = ranges[ i ];
        multi.ZRANGEBYSCORE( zset, range[ 0 ], range[ 1 ] );
    }
}


/**
 * Processes replies from ZRANGEBYSCORE when only member names (without scores) are returned.
 * Concatenates all results into a single array.
 *
 * @param  {array}    replies  Array of arrays, where each inner array is a range result.
 * @param  {function} callBack Callback function(err, result).
 * @returns {void}
 */
function processResultsWithoutValues( replies, callBack )
{
    var concatedReplies = []; // Array to store all found location names.

    // Iterate through each reply array and concatenate its contents.
    for ( var i = 0; i < replies.length; i ++ )
    {
        concatedReplies = concatedReplies.concat( replies[ i ] );
    }

    // Invoke the callback with the combined list of location names.
    if ( typeof callBack === 'function' ) callBack( null, concatedReplies );
}


/**
 * Processes replies from ZRANGEBYSCORE when 'WITHSCORES' was used.
 * Decodes geohashes into latitude/longitude for each result.
 *
 * @param  {array}    replies  Array of arrays, where each inner array is [member, score, member, score, ...].
 * @param  {function} callBack Callback function(err, result).
 * @returns {void}
 */
function processResultsWithValues( replies, callBack )
{
    var concatedReplies = [], // Final array to hold decoded location data.
        k               = 0,  // Index for concatedReplies.
        decoded;              // Variable to hold decoded geohash.

    // Loop through each range's reply.
    for ( var i = 0; i < replies.length; i ++ )
    {
        // Each reply array contains [member, score, member, score, ...].
        // So, iterate by 2 to get member and its score (geohash).
        for ( var j = 0; j < replies[ i ].length; j += 2 )
        {
            // Decode the geohash (which is the score).
            decoded = geohash.decode_int( replies[ i ][ j + 1 ], 52 );
            // Store the location name, latitude, and longitude.
            concatedReplies[ k ] = [ replies[ i ][ j ], decoded.latitude, decoded.longitude ];
            k ++; // Increment the result array index.
        }
    }

    // Invoke the callback with the array of decoded location details.
    if ( typeof callBack === 'function' ) callBack( null, concatedReplies );
}


// Export the public API functions of this module.
module.exports = exports = {
    queryByRanges: queryByRanges,
    location:      location,
    locations:     locations
};