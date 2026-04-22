/*
 * This module implements a caching mechanism.
 * It stores data along with a timestamp,
 * and is designed to efficiently remove the oldest entries
 * when the cache limit is reached.
 */

var typeEnum = { /* Defines the types of caching strategies available. */
    unit : 0, /* Represents a cache limited by the number of units/items. */
    heap : 1  /* Represents a cache limited by its estimated memory footprint. */
};

function Cache ( size , type ) {
    // Ensure that `Cache` is always called with the `new` keyword.
    if ( ! ( this instanceof Cache ) ) {
        return new Cache ( size , type ) ;
    }

    // Default the type if not provided.
    type = type || 'unit' ;

    this.size = size ; // The maximum capacity of the cache.

    // Convert the string type to its corresponding enum value.
    this.type = typeEnum [ type ] ;

    /*
     * The `cache` object stores the actual cached data.
     * Each entry in `cache` is an object with two properties:
     * - `content`: The actual data payload that was cached.
     * - `index`: The current position of this data's key within the `order` array.
     */
    this.cache = Object.create ( null ) ;

    // `order` is an array that maintains the order of cache keys,
    // from the oldest (least recently used) at the beginning
    // to the newest (most recently used) at the end.
    this.order = [ ] ;
}

Cache . prototype = {

    set : function addToCache ( cacheIndex , cached ) {
        // Check if the item already exists in the cache.
        if ( this . cache [ cacheIndex ] !== undefined ) {
            // If it exists, it means it's being "accessed" or "updated".
            // Remove its old position from the `order` array.
            this . order . splice ( this . cache [ cacheIndex ] . index , 1 ) ;

            // Update the index of the existing item to reflect its new position.
            this . cache [ cacheIndex ] . index = this . order . length ;

            // Update the content with the new cached value.
            this . cache [ cacheIndex ] . content = cached ;

            // Place the key at the very end of the `order` array,
            // marking it as the most recently used.
            this . order . push ( cacheIndex ) ;
        } else {
            // This is a new item being added to the cache.
            // First, check if the cache is full and needs items to be removed.
            var numberToRemove = this . limitReached ( ) ;

            // Loop to remove the oldest items if the limit is exceeded.
            for ( var i = 0 ; i < numberToRemove ; i ++ ) {
                // Delete the actual data from the `cache` object.
                delete this . cache [ this . order [ 0 ] ] ;
                // Remove the key from the beginning of the `order` array.
                this . order . shift ( ) ;
            }

            // Add the new item to the `cache` object.
            this . cache [ cacheIndex ] = {
                index : this . order . length , // Its position in `order` will be the last.
                content : cached                  // The data itself.
            } ;

            // Add the new item's key to the end of the `order` array.
            this . order . push ( cacheIndex ) ;
        }
    } ,

    get : function getFromCache ( cacheIndex ) {
        // Check if the requested item exists in the cache.
        if ( this . cache [ cacheIndex ] !== undefined ) {
            // If found, it's now the most recently used item.
            // Remove its current position from the `order` array.
            this . order . splice ( this . cache [ cacheIndex ] . index , 1 ) ;

            // Update its index to the end of the `order` array.
            this . cache [ cacheIndex ] . index = this . order . length ;

            // Move its key to the end of the `order` array.
            this . order . push ( cacheIndex ) ;

            // Return the cached content.
            return this . cache [ cacheIndex ] . content ;
        } else {
            // Item not found in cache.
            return ;
        }
    } ,

    has : function hasInCache ( cacheIndex ) {
        // Simply checks for the presence of a key in the cache.
        return this . cache [ cacheIndex ] !== undefined ;
    } ,

    /*
     * Determines how many items, if any, need to be removed from the cache
     * to comply with its size limit.
     * Returns the count of items to be evicted.
     */
    limitReached : function heuristic ( ) {
        // Handle 'unit' type caching.
        if ( this . type === typeEnum . unit ) {
            // Calculate excess items.
            return Math . max ( 0 , ( this . order . length - this . size ) ) ;
        }
        // Handle 'heap' type caching, based on memory usage.
        else if ( this . type === typeEnum . heap ) {
            if ( getHeapSize ( ) >= this . size ) {
                // Log a message for debugging purposes.
                console . log ( 'LRU HEURISTIC heap:' , getHeapSize ( ) ) ;
                // Remove approximately half of the items to free up space.
                return ( this . order . length >> 1 ) ; // Efficient division by 2.
            } else {
                // Heap size is within limits, no items to remove.
                return 0 ;
            }
        }
        // Handle unknown cache types.
        else {
            console . error ( "Unknown heuristic '" + this . type + "' for LRU cache." ) ;
            return 1 ; // Default to removing one item in case of error.
        }
    }
} ;

/* Variables for tracking and managing heap size. */
var heapSize ;          // Stores the last computed heap size in bytes.
var heapSizeTimeout ;   // Holds the ID of the interval timer for heap size computation.

/**
 * Retrieves the current heap size.
 * It computes the heap size periodically (every 60 seconds)
 * to avoid expensive calls on every access.
 * @returns {number} The total heap size in bytes.
 */
function getHeapSize ( ) {
    if ( heapSizeTimeout == null ) {
        // If the timeout hasn't been set, initialize it.
        // This will trigger `computeHeapSize` every minute.
        heapSizeTimeout = setInterval ( computeHeapSize , 60 * 1000 ) ;
        // Immediately compute and return the heap size for the first call.
        return computeHeapSize ( ) ;
    } else {
        // If the timeout is active, return the last known heap size.
        return heapSize ;
    }
}

/**
 * Computes and updates the global `heapSize` variable.
 * This function is typically called by a timer.
 * @returns {number} The newly computed heap size.
 */
function computeHeapSize ( ) {
    // `process.memoryUsage().heapTotal` gives the total size of the V8 heap.
    return heapSize = process . memoryUsage ( ) . heapTotal ;
}

// Export the Cache constructor for use in other modules.
module . exports = Cache ;