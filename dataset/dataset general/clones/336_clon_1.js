/*
 *  OMG.js - A simple localStorage abstraction library.
 *  Version: 0.5.7
 *  (C) 2014 Aaron Gray. All rights reserved.
 *  This software is distributed under the MIT License.
 *  For details, see the accompanying LICENSE file or visit:
 *  http://opensource.org/licenses/MIT
 */

( function ( ns )
{

    //  Private utility function to check for browser's localStorage support.
    //  Returns true if localStorage is available and accessible, false otherwise.
    var _storageSupport = function ( )
    {
        try
        {
            return 'localStorage' in window  &&  window.localStorage !== null;
        }
        catch ( e )
        {
            //  An error occurred, likely due to security restrictions (e.g., private browsing).
            return false;
        }
    };


    //  Internal cache for event handlers.
    //  Stores arrays of functions keyed by event name.
    var handlers = {};



    /*
     *  _executeHandlers: Invokes all registered handlers for a given event.
     *  @param {string} eventName - The name of the event to trigger.
     */
    var _executeHandlers = function ( eventName )
    {
        //  Retrieve all handlers associated with the specified eventName.
        //  Defaults to an empty array if no handlers are registered for this event.
        var handler = handlers[ eventName ] || [];

        //  Cache the length for performance in the loop.
        var len = handler.length;

        var i; // Loop counter.

        //  Iterate through and execute each handler function.
        for ( i = 0 ;  i < len ;  i++ )
        {
            //  Call each handler with 'this' context and no arguments.
            handler[ i ].apply ( this , [ ] );
        }
    }


    /*
     *  _omgError: Displays common error messages to the console.
     *  @param {string} type    - The error code.
     *  @param {string} context - The context or function where the error occurred.
     */
    var _omgError = function ( type , context )
    {
        switch ( type )
        {
          case '100':
            console.log ( 'omg! Error 100: ' , context , ' This collection does not exsist. Check your spelling or use omg.create() to make a new collection.' );
            break;

          case '200':
            console.log ( 'omg! Error 200: ' , context , ' This collection already exsists.' );
            break;

          case '200': // This case is duplicated in the original code, retaining as-is.
            console.log ( 'omg! Error 200: ' , context , ' This collection already exsists.' );
            break;

          default:
            console.log ( 'OH NO YOU BROKE EVERYTHING' );
            break;
        }
    };


    /*
     *  ns.on: Registers a callback function for a specific OMG.js event.
     *  @param {string}   eventName - The name of the event to listen for.
     *  @param {function} handler   - The callback function to execute when the event fires.
     */
    ns.on = function ( eventName , handler )
    {
        //  If no handler array exists for this event, initialize it.
        if ( ! handlers[ eventName ] )
        {
            handlers[ eventName ] = [ ];
        }
        //  Add the new handler to the event's list.
        handlers[ eventName ].push ( handler );
    };


    /**
     *  ns.ID: Generates a unique ID and timestamp for a new object if not already present.
     *  @param {object} objectData - The object for which to generate an ID and timestamp.
     *  @returns {object} The objectData with 'id' and 'ts' properties added if they didn't exist.
     */
    ns.ID = function ( objectData )
    {
        //  Assign a unique ID if the object doesn't already have one.
        if ( ! objectData.id )
        {
            objectData.id = '_' + Math.random().toString(36).substr(2, 9);
        }
        //  Assign a creation timestamp if the object doesn't already have one.
        if ( ! objectData.ts )
        {
            objectData.ts = Date.now();
        }
        return objectData;
    };


    /*
     *  ns.has: Checks if a collection exists in localStorage.
     *  @param {string} collection - The name of the collection to check.
     *  @returns {boolean} True if the collection exists, false otherwise.
     *  TODO: Consider returning the parsed collection directly to avoid blocking UI on subsequent 'get' calls.
     */
    ns.has = function ( collection )
    {
        var collectionString = localStorage.getItem ( collection );

        if ( collectionString )
        {
            return true;
        }
        else
        {
            return false;
        }
    };


    /*
     *  ns.get: Retrieves a collection from localStorage and returns its contents as an array of objects.
     *  @param {string} collection - The name of the collection to retrieve.
     *  @returns {Array|boolean} An array of objects from the collection, or false if the collection doesn't exist.
     */
    ns.get = function ( collection )
    {
        var collectionString = localStorage.getItem ( collection );

        if ( collectionString )
        {
            return JSON.parse ( collectionString );
        }
        else
        {
            _omgError ( '100' , 'get()' );
            return false;
        }
        // This handler will not be executed if the collectionString is found and parsed.
        _executeHandlers ( 'get' );
    };


    /*
     *  ns.getBy: Filters objects within a collection based on a specified property and value.
     *  @param {string} collection - The name of the collection to search.
     *  @param {string} k          - The key (property name) to match.
     *  @param {*}      v          - The value to match against the key.
     *  @returns {Array} An array of objects that match the criteria.
     */
    ns.getBy = function ( collection , k , v )
    {
        var objects = ns.get ( collection ),
            lookup  = [ ];

        if ( objects )
        {
            for ( var i = 0 ,  len = objects.length ;  i < len ;  i++ )
            {
                if ( objects[ i ][ k ] == v )
                {
                    lookup.push ( objects[ i ] );
                }
            }
            return lookup;
        }
        else
        {
            _omgError ( '100' , 'getOne()' ); // Original code uses 'getOne()' context for this error.
        }

        _executeHandlers ( 'getBy' );
    };


    /*
     *  ns.getOne: Retrieves a single object from a collection by its unique ID.
     *  @param {string} collection - The name of the collection.
     *  @param {string} objectID   - The ID of the object to retrieve.
     *  @returns {object|undefined} The object matching the ID, or undefined if not found.
     */
    ns.getOne = function ( collection , objectID )
    {
        var one = ns.getBy ( collection , 'id' , objectID );
        return one[ 0 ];

        // This handler will not be executed due to the preceding return statement.
        _executeHandlers ( 'getOne' );
    };


    /*
     *  ns.add: Adds one or more objects to an existing collection in localStorage.
     *  Objects will receive a unique ID and timestamp if they don't have one.
     *  @param {string} collection - The name of the collection to add to.
     *  @param {object|Array<object>} newData - The object(s) to add.
     *  @returns {Array} The updated collection of objects.
     */
    ns.add = function ( collection , newData )
    {
        var collectionString = localStorage.getItem ( collection );
        var objects          = JSON.parse ( collectionString );

        if ( objects )
        {
            //  Check if newData is an array of objects.
            if ( Array.isArray ( newData ) )
            {
                //  Iterate through the array and add each object individually.
                for ( var i = 0 ;  i < newData.length ;  i++ )
                {
                    var object = ns.ID ( newData[ i ] );
                    objects.push ( object );
                }
            }
            //  Check if newData is a single object (not null and not an array).
            if ( ( typeof newData == "object" )  &&  ( newData !== null )  &&  ( ! Array.isArray ( newData ) ) )
            {
                var objectData = ns.ID ( newData );
                //  Add the single object to the collection.
                objects.push ( objectData );
            }
            //  Save the modified collection back to localStorage.
            localStorage.setItem ( collection , JSON.stringify ( objects ) );
        }
        else
        {
            //  Log an error if the collection does not exist.
            _omgError ( '100' , 'add()' );
        }

        _executeHandlers ( 'add' ); // Trigger 'add' event handlers.
        return objects;             // Return the updated collection.
    };


    /*
     *  ns.addForce: Adds object(s) to a collection, creating the collection if it doesn't exist,
     *  or overwriting existing data if it's not an array.
     *  @param {string} collection - The name of the collection.
     *  @param {object|Array<object>} newData - The object(s) to add/create.
     *  @returns {Array} The newly created or updated collection.
     */
    ns.addForce = function ( collection , newData )
    {
        var objects = [ ]; // Initialize an empty array for the collection.

        //  If the provided data is an array of objects.
        if ( Array.isArray ( newData ) )
        {
            //  Process each object in the array.
            for ( var i = 0 ;  i < newData.length ;  i++ )
            {
                var object = ns.ID ( newData[ i ] ); // Ensure it has an ID/timestamp.
                objects.push ( object );             // Add to the new collection array.
            }
        }
        //  If the provided data is a single object.
        if ( ( typeof newData == "object" )  &&  ( newData !== null )  &&  ( ! Array.isArray ( newData ) ) )
        {
            newData = ns.ID ( newData ); // Ensure it has an ID/timestamp.
            //  Add the single object to the collection array.
            objects.push ( newData );
        }

        //  Save the collection to localStorage, overwriting if necessary.
        localStorage.setItem ( collection , JSON.stringify ( objects ) );

        _executeHandlers ( 'add' ); // Trigger 'add' event, similar to ns.add.
        return objects;             // Return the resulting collection.
    };


    /*
     *  ns.create: Initializes a new collection in localStorage.
     *  If objectData is provided, it's used as the initial content; otherwise, an empty array is created.
     *  @param {string} collection   - The name of the new collection.
     *  @param {Array<object>} [objectData] - Optional initial data for the collection.
     */
    ns.create = function ( collection , objectData )
    {
        if ( objectData )
        {
            localStorage.setItem ( collection , JSON.stringify ( objectData ) );
        }
        else
        {
            localStorage.setItem ( collection , '[]' ); // Create an empty array as default.
        }

        _executeHandlers ( 'create' );
    };


    /*
     *  ns.delete: Removes an entire collection from localStorage.
     *  @param {string} collection - The name of the collection to remove.
     */
    ns.delete = function ( collection )
    {
        localStorage.removeItem ( collection ); // Native localStorage method for removal.

        _executeHandlers ( 'delete' );
    };


    /*
     *  ns.deleteOne: Removes a single object from a collection based on its ID.
     *  @param {string}   collection - The name of the collection.
     *  @param {string}   objectID   - The ID of the object to remove.
     *  @param {function} [callback] - Optional callback function to execute after deletion,
     *                                 receiving the new collection as an argument.
     */
    ns.deleteOne = function ( collection , objectID , callback )
    {
        var objects = ns.get ( collection ); // Retrieve the current collection.

        if ( objects )
        {
            // Iterate backwards to safely remove items during iteration.
            for ( var i = objects.length - 1 ;  i >= 0 ;  i-- )
            {
                if ( objects[ i ].id == objectID )
                {
                    objects.splice ( i , 1 ); // Remove the matching object.
                }
            }; // Semicolon retained as per original code.

            // Re-save the modified collection using addForce, which handles creation/overwrite.
            var newCollection = ns.addForce ( collection , objects );

            if ( callback )
            {
                callback ( newCollection ); // Execute callback with the updated collection.
            }
        }
        else
        {
            _omgError ( '100' , 'delete()' ); // Error if collection doesn't exist.
        }

        _executeHandlers ( 'deleteOne' );
    };


    /*
     *  ns.save: Updates an existing object within a collection.
     *  It first deletes the old version of the object and then adds the new one.
     *  @param {string} collection - The name of the collection.
     *  @param {object} object     - The updated object to save. Must contain an 'id' property.
     */
    ns.save = function ( collection , object )
    {
        // Delete the old object by its ID, then add the new (updated) object.
        ns.deleteOne ( collection , object.id , function ( newCollection )
        {
            ns.add ( collection , object );
        } );

        _executeHandlers ( 'save' );
    };


    /*
     *  ns.link: (Incomplete in original) Assigns a new relationship property to all objects in a collection.
     *  It initializes a new empty array for the specified property on each object.
     *  @param {string} collection    - The main collection.
     *  @param {string} hasCollection - The name of the new relationship property to add.
     */
    ns.link = function ( collection , hasCollection )
    {
        var collectionData = ns.get ( collection ); // Get all objects from the collection.

        // Loop through each object and add an empty array for the new relationship.
        for ( var i = collectionData.length - 1 ;  i >= 0 ;  i-- )
        {
            collectionData[ i ][ hasCollection ] = [ ];
        }; // Semicolon retained as per original code.

        ns.delete ( collection );             // Remove the old collection.
        ns.create ( collection , collectionData ); // Create a new one with updated objects.

        _executeHandlers ( 'link' );
    };


    /*
     *  ns.flush: Clears all data from localStorage.
     *  Use with caution, as this affects all applications using localStorage on the domain.
     */
    ns.flush = function ( )
    {
        localStorage.clear ( ); // Clears ALL key-value pairs stored in localStorage for the current domain.

        _executeHandlers ( 'flush' );
    };


    //  Cache object for potential future caching mechanisms within OMG.js.
    omg.cache =
    {

    };


    /*
     *  ns.fromCache: Retrieves an object from a specified cache based on attribute and value.
     *  Note: This assumes 'omg.cache[collection]' exists and is an array of objects.
     *  @param {string} collection - The name of the cache to search within.
     *  @param {string} attr       - The attribute (property name) to match.
     *  @param {*}      value      - The value to match.
     *  @returns {object|undefined} The first object found that matches the criteria, or undefined.
     */
    ns.fromCache = function ( collection , attr , value )
    {
        var cache = ns.cache[ collection ]; // Get the specific cache array.

        // Iterate through cache entries.
        for ( var i = 0 ;  i < cache.length ;  i += 1 )
        {
            // If the attribute value matches, return the object.
            if ( cache[ i ][ attr ] === value )
            {
                return cache[ i ];
            }
        }
    }


} ( this.omg = this.omg || { } ) );