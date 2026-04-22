/*
 * This file provides extensions to the browser's Storage API
 * and implements a caching mechanism for Last.fm API responses.
 *
 * Original Author: Felix Bruns
 * Copyright (c) 2008-2009, Felix Bruns <felixbruns@web.de>
 * All rights reserved.
 *
 */


/*
 * Extends the Storage prototype. This method allows storing a JavaScript object
 * directly into a Storage instance (like localStorage or sessionStorage)
 * by converting it to a JSON string.
 */
Storage.prototype.setObject = function ( key, value ) {
    // The value is first converted to a JSON string before being stored.
    this.setItem ( key , JSON.stringify ( value ) ) ;
};


/*
 * Extends the Storage prototype. This method retrieves a JSON string from
 * a Storage instance and parses it back into a JavaScript object.
 */
Storage.prototype.getObject = function ( key )
{
    // Retrieve the raw string data associated with the given key.
    var   item   =   this.getItem ( key ) ;

    // Parse the JSON string back into its original JavaScript object form.
    return   JSON.parse ( item ) ;
};


/*
 * LastFMCache Constructor:
 * Initializes a new cache object specifically designed for Last.fm API responses.
 * It manages caching, expiration, and retrieval of data from localStorage.
 */
function LastFMCache ( )
{
    // Define various time constants for cache expiration calculations.
    // All values are in seconds.

    // One minute in seconds.
    var   MINUTE   =   60 ;

    // One hour in seconds.
    var   HOUR     =   MINUTE   *   60 ;

    // One day in seconds.
    var   DAY      =   HOUR     *   24 ;

    // One week in seconds.
    var   WEEK     =   DAY      *   7 ;

    // Approximately one month in seconds (average of 30.436875 days).
    var   MONTH    =   WEEK     *   4.34812141 ;

    // One year in seconds.
    var   YEAR     =   MONTH    *   12 ;


    /*
     * A list of Last.fm API methods that should have a weekly expiration time
     * by default, unless otherwise specified by other parameters.
     */
    var   weeklyMethods   =   [
        'artist.getSimilar',
        'tag.getSimilar',
        'track.getSimilar',
        'artist.getTopAlbums',
        'artist.getTopTracks',
        'geo.getTopArtists',
        'geo.getTopTracks',
        'tag.getTopAlbums',
        'tag.getTopArtists',
        'tag.getTopTags',
        'tag.getTopTracks',
        'user.getTopAlbums',
        'user.getTopArtists',
        'user.getTopTags',
        'user.getTopTracks'
    ] ;


    // The unique name used to identify this cache in localStorage.
    var   name   =   'lastfm' ;


    // Check if the cache object already exists in localStorage.
    // If not, initialize it as an empty array.
    if   (   localStorage.getObject ( name )   ==   null   )
    {
        // If the cache does not exist, create an empty array for it.
        localStorage.setObject ( name ,   [ ] ) ;
    }


    /*
     * Determines the appropriate expiration time for a given set of API parameters.
     *
     * @param {object} params - An object containing Last.fm API method parameters.
     * @returns {number} The expiration time in seconds, or -1 if no specific
     *                   expiration rule applies.
     */
    this.getExpirationTime = function ( params )
    {
        var   method   =   params.method ;

        // Check for methods containing "Weekly" in their name, but not "List".
        if   (   ( /Weekly/ ) . test ( method )   &&   ! ( /List/ ) . test ( method )   )
        {
            // If both 'to' and 'from' parameters are defined, suggesting a specific date range,
            // set a longer expiration time (e.g., a year).
            if   (   typeof ( params.to )   !=   'undefined'   &&   typeof ( params.from )   !=   'undefined'   )
            {
                return   YEAR ;
            }
            // Otherwise, for general weekly methods, use the standard week expiration.
            else
            {
                return   WEEK ;
            }
        }

        // Iterate through the list of methods that have a default weekly expiration.
        for   (   var   key   in   this.weeklyMethods   )
        {
            // If the current method matches one in the weeklyMethods list, return WEEK.
            if   (   method   ==   this.weeklyMethods [ key ]   )
            {
                return   WEEK ;
            }
        }

        // If no specific expiration rule is met, return -1 to indicate no default.
        return   -1 ;
    };


    /*
     * Checks if the cache contains data for a specific hash.
     *
     * @param {string} hash - The unique hash identifying the cached data.
     * @returns {boolean} True if data for the hash exists and has a 'data' property, false otherwise.
     */
    this.contains = function ( hash )
    {
        // Check if the object for the hash exists and if it contains a 'data' property.
        return   typeof ( localStorage.getObject ( name ) [ hash ] ) . data   !=   'undefined'   &&
                 typeof ( localStorage.getObject ( name ) [ hash ] )         !=   'undefined'   ;
    };


    /*
     * Loads cached data associated with a given hash.
     *
     * @param {string} hash - The unique hash of the data to load.
     * @returns {*} The cached data.
     */
    this.load = function ( hash )
    {
        // Retrieve the entire cached object and then access its 'data' property.
        return   localStorage.getObject ( name ) [ hash ] . data ;
    };


    /*
     * Removes cached data for a specific hash from the cache.
     *
     * @param {string} hash - The unique hash of the data to remove.
     */
    this.remove = function ( hash )
    {
        // Get the current cache object from localStorage.
        var   object   =   localStorage.getObject ( name ) ;

        // Set the entry for the given hash to undefined, effectively removing it.
        object [ hash ]   =   undefined ;

        // Store the modified cache object back into localStorage.
        localStorage.setObject ( name ,   object ) ;
    };


    /*
     * Stores data in the cache with a specified expiration time.
     *
     * @param {string} hash       - The unique hash for the data.
     * @param {*}      data       - The data to be cached.
     * @param {number} expiration - The expiration time in seconds from the current time.
     */
    this.store = function ( hash ,   data ,   expiration )
    {
        // Retrieve the current cache object from localStorage.
        var   object   =   localStorage.getObject ( name ) ;

        // Get the current timestamp in seconds.
        var   time     =   Math.round ( new Date ( ) . getTime ( )   /   1000 ) ;

        // Create a new entry for the hash, including the data and its expiration timestamp.
        object [ hash ]   =   {
              data       :   data ,
              expiration :   time   +   expiration
        } ;

        // Save the updated cache object back to localStorage.
        localStorage.setObject ( name ,   object ) ;
    };


    /*
     * Checks if the data associated with a specific hash has expired.
     *
     * @param {string} hash - The unique hash of the data to check.
     * @returns {boolean} True if the data has expired, false otherwise.
     */
    this.isExpired = function ( hash )
    {
        // Retrieve the current cache object.
        var   object   =   localStorage.getObject ( name ) ;

        // Get the current timestamp in seconds.
        var   time     =   Math.round ( new Date ( ) . getTime ( )   /   1000 ) ;

        // Compare the current time with the stored expiration timestamp.
        if   (   time   >   object [ hash ] . expiration   )
        {
            // If current time is past expiration, the data is expired.
            return   true ;
        }

        // Otherwise, the data is still valid.
        return   false ;
    };


    /*
     * Clears the entire cache, removing all stored data.
     */
    this.clear = function ( )
    {
        // Overwrite the existing cache with an empty array.
        localStorage.setObject ( name ,   [ ] ) ;
    };
} ;