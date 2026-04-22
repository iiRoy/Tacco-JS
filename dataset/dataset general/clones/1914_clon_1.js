/*
 *  Module: Main.Loader.Script.js
 *  Authored: Timothy "Popisfizzy" Reilly
 *  Date of Creation: March 2, 2011
 *  Last Modified: March 3, 2011
 *  Dependencies: Main.js
 *  Integrations: Main.Loader.Script.QueueObject.js (defines QueueObject class)
 */


/*
 *  This particular module provides functionality for dynamically loading
 *  external JavaScript files at runtime. It manages a queue of scripts
 *  to be loaded and provides mechanisms for tracking their status.
 */


Main.Loader.Script = {

    /*
     *  Core configuration variables and internal data structures for the loader.
     */

    QueueList : [],        // This array will hold the collection of scripts that are
                           // currently awaiting processing or have been processed.
                           // Each entry is typically a QueueObject instance.

    timeout   : 7500,      // The maximum duration, in milliseconds, to wait for a script
                           // to load before considering it timed out. Set to 7.5 seconds.


    /*
     *  Callback functions that are invoked at different stages of the script loading process.
     *  These can be set by the consumer of this module to react to events.
     */

    onload     : null,     // Callback invoked when a single script has successfully loaded.
    ontimeout  : null,     // Callback invoked if a script fails to load within the specified timeout.
    oncomplete : null,     // Callback invoked when all scripts in the queue have been processed
                           // (either loaded or timed out).


    /*
     *  Reference to the QueueObject class constructor.
     *  This class encapsulates the state and behavior of an individual script in the queue.
     *  It is expected to be defined externally, typically in 'Main.Loader.Script.QueueObject.js'.
     */

    QueueObject : null,


    /*
     *  Public methods for managing and initiating the script loading queue.
     */

    /**
     *  Adds a new URL to the script loading queue.
     *  If the URL is new, a new QueueObject is created and returned.
     *  If the URL is already queued, the existing QueueObject is returned.
     *  @param {string} src - The URL of the script to be queued.
     *  @returns {object|null} The QueueObject instance if successfully queued or found, otherwise null.
     */
    Queue : function ( src )
    {
        // Ensure that a source URL has been provided.
        if ( src )
        {
            // Attempt to locate the script in the existing queue.
            var Queued = this.Find( src );

            if ( ! Queued )
            {
                // If the script is not already queued, create a new QueueObject.
                var Q = new this.QueueObject( src );

                // Add the newly created QueueObject to the internal list, using its source URL as the key.
                this.QueueList[ src ] = Q;

                // Return the newly created QueueObject.
                return Q;
            }

            // If the script was already queued, return the existing QueueObject.
            return Queued;
        }

        // If no source URL was provided, return null to indicate failure.
        return null;
    },


    /**
     *  Searches the queue for a script with a matching URL.
     *  @param {string} src - The URL to search for.
     *  @returns {object|null} The associated QueueObject if found, otherwise null.
     */
    Find : function ( src )
    {
        // Create a regular expression to match the source URL (case-insensitive, at the end of the string).
        var regex = new RegExp( "(" + src + "$)", "i" );

        // Iterate through the keys (source URLs) in the QueueList.
        for ( var i in this.QueueList )
        {
            // Test if the current key matches the provided source URL.
            if ( regex.test( i ) )
            {
                // If a match is found, return the corresponding QueueObject.
                return this.QueueList[ i ];
            }
        }

        // If no matching QueueObject is found after iterating through the entire list, return null.
        return null;
    },


    /**
     *  Initiates the loading process for scripts in the queue.
     *  Can process a specific script (by URL or QueueObject) or all scripts in the queue.
     *  @param {string|object} [Q] - Optional. A URL string or a QueueObject instance to process.
     *                                If omitted, all queued scripts will be processed.
     *  @returns {boolean} True if processing was initiated (for all or a specific one), false otherwise.
     */
    Process : function ( Q )
    {
        // Check if a specific QueueObject or URL has been provided for processing.
        if ( Q )
        {
            // If Q is a string and exists as a key in QueueList, retrieve the corresponding QueueObject.
            if ( ( ( typeof Q ) == "string" ) && ( Q in this.QueueList ) )
            {
                Q = this.QueueList[ Q ];
            }

            // If Q is now an instance of QueueObject, initiate its loading process.
            if ( Q instanceof this.QueueObject )
            {
                return Q.Load();
            }
        }
        else
        {
            // If no specific Q was provided, process ALL scripts currently in the QueueList.
            for ( var src in this.QueueList )
            {
                this.QueueList[ src ].Load(); // Call the Load method on each queued script.
            }

            // Indicate that all scripts have been queued for loading.
            return true;
        }

        // If processing failed (e.g., invalid Q provided), return false.
        return false;
    },


    /**
     *  Checks if all scripts in the queue have finished processing (loaded or timed out).
     *  If so, it triggers the 'oncomplete' callback and clears the queue.
     *  @returns {boolean} True if the entire queue has been processed and cleared, false otherwise.
     */
    Processed : function ()
    {
        // Iterate through the queue to check the processing status of each script.
        for ( var i in this.QueueList )
        {
            // If any script is found that has not yet been processed, the queue is not complete.
            if ( ! this.QueueList[ i ].processed )
            {
                return false;
            }
        }

        // If all scripts have been marked as processed, proceed with completion actions.
        if ( this.oncomplete )
        {
            this.oncomplete(); // Invoke the 'oncomplete' callback if it is defined.
        }

        // Clean up the QueueList by deleting individual entries.
        for ( var i in this.QueueList )
        {
            delete this.QueueList[ i ];
        }

        // Delete the QueueList property itself and then re-initialize it as an empty array.
        delete this.QueueList;
        this.QueueList = [];

        // Indicate that the entire queue has been successfully processed and cleared.
        return true;
    }

}; // End of Main.Loader.Script object definition.