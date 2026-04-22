// This module provides geographical indexing capabilities for LevelDB-like databases.
// It leverages the S2 Geometry Library for efficient spatial queries.

// Module dependencies and constants are declared here.

// 'xtend' is a utility for extending objects, used for merging options.
var    xtend    = require( 'xtend' ) ;

// 's2' is the S2 Geometry Library for geographical calculations and indexing.
var    s2       = require( 's2' ) ;

// 'merge-stream' helps combine multiple readable streams into a single one.
var    merge    = require( 'merge-stream' ) ;

// 'map-stream' allows transforming data as it flows through a stream.
var    map      = require( 'map-stream' ) ;

// 'gps-distance' calculates the distance between two geographical coordinates.
var    distance = require( 'gps-distance' ) ;

// EARTH_RADIUS is a constant representing the Earth's average radius in kilometers.
// It's crucial for converting between geographical distances and S2-specific "height" values.
var    EARTH_RADIUS = 6371 ;

/*
 * This function converts a given radius (in meters) into an S2 "height" value.
 * The "height" is a normalized value used by the S2 library to define a spherical cap.
 *
 * @param {number} radius - The radius in meters.
 * @returns {number} The calculated S2 height.
 */
function radius2height( radius )
{
    // The formula is derived from spherical geometry:
    // h = 1 - sqrt(1 - (r/R)^2), where r is the search radius and R is EARTH_RADIUS.
    return 1  -  Math.sqrt( 1  -  Math.pow( ( radius  /  EARTH_RADIUS ), 2 ) ) ;
}


/*
 * This function performs the inverse operation of `radius2height`.
 * It converts an S2 "height" value back into a geographical radius (in meters).
 *
 * @param {number} height - The S2 height value.
 * @returns {number} The calculated radius in meters.
 */
function height2radius( height )
{
    // Inverse formula: r = R * sqrt(1 - (1 - h)^2)
    return Math.sqrt( 1  -  Math.pow( ( 1  -  height ), 2 ) )  *  EARTH_RADIUS ;
}


/*
 * Stores a value in the database, associating it with a geographical key for nearby queries.
 * This function handles two types of keys: direct string keys or object keys with lat/lng.
 *
 * @param {object} db    - The database instance.
 * @param {string|object} key - The key for the data. Can be a string or an object with lat/lng.
 * @param {*} value     - The data to be stored.
 * @param {object} os    - Optional options object or callback.
 * @param {function} cb  - Optional callback function.
 */
function put( db, key, value, os, cb )
{
    // If the provided key is a string, it's treated as a direct database key.
    // In this case, no geographical indexing is applied, and the original `db.put` is called.
    if  ( typeof key  ==  'string' )
    {
        // Call the underlying `db.put` method.
        // Options and callback are bound to ensure proper context and arguments.
        db._nearby.put.call(
            db,
            key,
            value,
            typeof os  ==  'function'  ?  os.bind( null, null, key )  :  os,
            typeof cb  ==  'function'  ?  cb.bind( null, null, key )  :  cb
        ) ;

        // Exit the function as the operation is complete.
        return ;
    }

    // If the key is not a string, it must be an object containing geographical coordinates.
    // An error is thrown if it's neither.
    if  ( typeof key  !=  'object' )
    {
        throw  new Error( 'Key is not an Object!' ) ;
    }


    // Extend the `key` object with default latitude, longitude, and a custom unique identifier.
    // This ensures that all necessary properties are present for geographical indexing.
    key  =  xtend(
        {
            lat: 0,                   // Default latitude.
            lng: 0,                   // Default longitude.
            customKey: '' + Date.now() // A unique string, typically a timestamp, to prevent key collisions.
        },
        key
    ) ;


    // Wrap the original `value` with geographical metadata.
    // This metadata includes the latitude and longitude, allowing for distance calculations later.
    value  =  {
        value: value,       // The actual data payload.
        _nearby: {          // Internal metadata for geographical queries.
            lat: key.lat,
            lng: key.lng
        }
    } ;


    // Convert the geographical coordinates into an S2 LatLng object.
    var    ll  =  new s2.S2LatLng( key.lat, key.lng ) ;

    // Normalize the LatLng to get an S2CellId.
    // This S2CellId represents a unique cell on the Earth's surface corresponding to the location.
    var    id  =  new s2.S2CellId( ll.normalized() ) ;

    // Construct the new database key. It combines the S2CellId string and the custom key.
    // The '!' separator ensures uniqueness and allows for parsing.
    var    newKey  =  ''  +  id.toString()  +  '!'  +  key.customKey ;


    // Finally, store the stringified value using the newly generated S2-based key.
    // JSON.stringify is used because LevelDB typically stores string/buffer values.
    // Options and callbacks are handled similarly to the string key case, but with the newKey.
    db._nearby.put.call(
        db,
        newKey,
        JSON.stringify( value ),
        typeof os  ==  'function'  ?  os.bind( null, null, newKey )  :  os,
        typeof cb  ==  'function'  ?  cb.bind( null, null, newKey )  :  cb
    ) ;
}


/*
 * Creates a readable stream of objects found within a specified radius around a given point.
 * This function performs a geographical search by querying S2 cells.
 *
 * @param {object} db - The database instance to query.
 * @param {object} os - Options for the stream, including 'lat', 'lng', and 'radius'.
 * @returns {ReadableStream} A stream that emits objects within the specified radius.
 */
function createNearStream( db, os )
{
    // Extend the provided options with defaults.
    // Default search center is (0,0) and default radius is 100 meters.
    os  =  xtend(
        {
            lat:    0,     // Default latitude for the search center.
            lng:    0,     // Default longitude for the search center.
            radius: 100    // Default search radius in meters.
        },
        os
    ) ;


    // Create an S2 LatLng object from the search center coordinates.
    var    ll    =  new s2.S2LatLng( os.lat, os.lng ) ;

    // Define an S2Cap (spherical cap) that represents the circular search area.
    // The radius (in meters) is converted to an S2 "height" value for this purpose.
    var    cap   =  new s2.S2Cap(
        ll.normalized().toPoint(),
        radius2height( os.radius  /  1000 ) // Convert radius from meters to kilometers for `radius2height`.
    ) ;


    // Initialize a merge-stream instance. This will combine data from multiple database read streams.
    var    ss    =  merge() ;

    // Get the set of S2 Cell IDs that completely cover the defined spherical cap.
    // For each covering cell, a database read stream is created.
    s2.getCover( cap ).map(
        function ( id )
        {
            // Extract the raw ID from the S2CellId object.
            var    cell  =  id.id() ;

            // Add a read stream to the merge-stream for the current S2 cell.
            // The stream reads keys within the range of the current cell.
            ss.add(
                db.createReadStream(
                    {
                        gte: cell.toString(),         // Greater than or equal to the current cell's string representation.
                        lt:  cell.next().toString()   // Less than the next cell's string representation (exclusive upper bound).
                    }
                )
            ) ;
        }
    ) ;


    // Pipe the merged stream through a map-stream to process each data entry.
    return ss.pipe(
        map(
            function ( data, cb )
            {
                // Parse the JSON string stored in `data.value` back into an object.
                var    msg   =  JSON.parse( data.value ) ;

                // Calculate the precise geographical distance between the query center and the object's location.
                // The result is converted from kilometers back to meters.
                var    dist  =  distance(
                    os.lat,
                    os.lng,
                    msg._nearby.lat,
                    msg._nearby.lng
                )  *  1000 ;

                // Retrieve the `_nearby` metadata object and add the calculated distance to it.
                var    _nearby  =  msg._nearby ;
                _nearby.distance  =  dist ;

                // Extract the original value from the wrapped message.
                msg  =  msg.value ;

                // If the object's calculated distance is within the specified search radius,
                // emit an object containing its key, value, and updated _nearby metadata.
                // Otherwise, emit `undefined` to effectively filter out objects outside the radius.
                cb(
                    null,
                    dist  <  os.radius  ?  { key: data.key, value: msg, _nearby: _nearby }  :  undefined
                ) ;
            }
        )
    ) ;
}


/*
 * The main module export function. It initializes geographical indexing on a database instance.
 * This function adds `put` and `createNearStream` methods to the provided `db` object.
 *
 * @param {object} db - The database instance (e.g., a LevelDB instance).
 * @param {object} os - Optional configuration options, such as a prefix for the new methods.
 * @returns {object} The modified database instance with geographical capabilities.
 */
module.exports  =  function ( db, os )
{
    // Extend the provided options with defaults.
    // An empty string is the default prefix for the new methods.
    os  =  xtend(
        {
            prefix: ''   // Default prefix, e.g., 'geo' for 'geoPut', 'geoCreateNearStream'.
        },
        os
    ) ;

    // Store a reference to the original `db.put` method under `_nearby.put`.
    // This allows the `put` function to use the original put mechanism.
    db._nearby  =  { put: db.put } ;

    // Attach the `put` function to the database object, using the configured prefix.
    // It's bound to `null` context and passed `db` as the first argument.
    db[ os.prefix  +  'put' ]              =  put.bind( null, db ) ;

    // Attach the `createNearStream` function to the database object, using the configured prefix.
    // It's also bound to `null` context and passed `db` as the first argument.
    db[ os.prefix  +  'createNearStream' ] =  createNearStream.bind( null, db ) ;

    // Return the database object, now augmented with geographical indexing methods.
    return db ;
} ;