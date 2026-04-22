// This module exports a constructor function for a Redis-backed caching mechanism.
// It's designed to manage data storage and retrieval using a Redis client.

/*
 *  The main constructor for the RedisCache class.
 *
 *  @param {object}   redis           An initialized Redis client instance.
 *  @param {function} private_key_fn  A callback function that generates a unique
 *                                    private key based on a given URI. This is
 *                                    often used to compartmentalize data per user
 *                                    or session, e.                                g., by hashing an authentication
 *                                    token with the URI.
 */
module . exports    = function    RedisCache (  redis  , private_key_fn  )
{
    // The 'add' method is responsible for storing a value in the cache.
    this . add    = function ( uri ,  private  ,  value , cb )
    {
        try
        {
            // Determine the key to use: if 'private' flag is true, use the generated private key;
            // otherwise, use the URI itself as the key for public access.
            var   key = private  ?  private_key_fn ( uri )  :  uri ;

            // Serialize the value into a JSON string.
            // A replacer function is provided to handle cases where 'value' might contain functions,
            // which are not JSON-serializable and should be converted to null.
            var val = JSON . stringify ( value , function ( k , v )
            {
                // If the current property 'v' is a function, return null.
                // Otherwise, return the property 'v' as is.
                return ( typeof v == 'function' ) ? null : v ;
            } ) ;

            // Store the serialized value in Redis using the determined key.
            // The callback 'cb' will be invoked upon completion or error.
            redis . set ( key , val , cb ) ;
        }
        catch ( err )
        {
            // If any synchronous error occurs during key generation or stringification,
            // catch it and pass it to the provided callback.
            cb ( err ) ;
        } // End of try-catch block for 'add' operation.
    } ; // End of the 'add' method definition.


    // The 'get' method retrieves a cached value based on the URI.
    // It first checks the private cache, then falls back to the public cache.
    this . get    = function ( uri ,  cb )
    {
        // First, attempt to retrieve data from the private cache using the generated private key.
        // This ensures user-specific data is prioritized.
        redis . get ( private_key_fn ( uri ) , function ( err , value )
        {
            // If an error occurred during the private cache retrieval, immediately return it
            // via the provided callback.
            if ( err )
                return cb ( err ) ;

            // If a value was successfully found in the private cache, parse it from JSON
            // and return it via the callback.
            if ( value )
                return cb ( null , JSON . parse ( value ) ) ;

            // If no value was found in the private cache, proceed to look in the public cache
            // using the raw URI as the key.
            redis . get ( uri , function ( err , value )
            {
                // Handle any potential errors that occur during the public cache lookup.
                if ( err )
                    return cb ( err ) ;

                // If a value is found in the public cache, parse it and return it.
                // If no value is found here either, 'value' will be null, and JSON.parse(null)
                // correctly returns null, indicating cache miss.
                return cb ( null , JSON . parse ( value ) ) ;
            } ) ;
        } ) ;
    } ;


    // The 'flush' method is used to clear all data from the Redis database.
    // This operation should be used with extreme caution as it is destructive.
    this . flush    = function ( cb )
    {
        // Execute the Redis 'flushdb' command, which removes all keys from the currently
        // selected database. The callback 'cb' handles completion or errors.
        redis . flushdb ( cb ) ;
    } ; // End of 'flush' method definition.

} ; // End of the RedisCache constructor function.