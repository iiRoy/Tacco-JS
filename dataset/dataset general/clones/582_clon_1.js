/*
 * This file implements a polyfill for CSS3 Regions functionality
 * using jQuery. It allows content to flow into designated regions
 * and manages the content distribution across them.
 *
 * Original Author: Emmanuel Garcia
 * Year of Creation: 2012
 *
 * Example Usage Pattern:
 *   To flow content from a main sector into a group of regions:
 *   $( 'main-content-selector' ).region( 'flowTo', $( 'region-elements-selector' ) );
 *
 * This is a self-executing anonymous function (IIFE) to encapsulate the plugin
 * and prevent global namespace pollution, passing jQuery as an argument.
 */
( function ( $ ) {

    // This internal helper function is responsible for initializing region data
    // for a given element or for calling a specified method on its region object.
    function addRegion( method )
    {
        // Get the jQuery-wrapped element and its associated data store.
        var jElement = $( this ),
            data     = jElement.data();

        // Check if the element already has region data initialized, or if the 'flowTo'
        // property is missing, indicating incomplete initialization.
        // If not properly set up, a new Regions instance is created and assigned.
        if ( ! data.region || ! data.region.flowTo )
        {
            data.region = new Regions( this ); // Assumes 'Regions' constructor exists globally.

            // Assign a callback function to the region object for when a new region is requested.
            // This triggers a custom event on the original jQuery element.
            data.region.requestNewRegion = function ()
            {
               jElement.trigger( 'region.requestNewRegion' );
            };

            // Assign a callback function for when a region removal is requested.
            // This also triggers a custom event, passing the removed region as a jQuery object.
            data.region.requestRemoveRegion = function ( region )
            {
                jElement.trigger( 'region.requestRemoveRegion', [ $( region ) ] );
            };

            // Perform the initial content splitting and distribution for the region.
            data.region.split();
        }

        // After ensuring the region object is initialized, check if the requested 'method'
        // exists on the region object and is indeed a callable function.
        if ( typeof ( data.region[ method ] ) == 'function' )
        {
            // Special handling logic for the 'flowTo' method, which can accept
            // either a single region element or a collection of region elements.
            if ( method == 'flowTo' )
            {
                var regions = arguments[ 1 ]; // The second argument passed to addRegion contains the target regions.

                // If the 'regions' variable does not have a 'length' property, it's likely a single DOM element
                // or a simple object, not a collection like a jQuery object or an array.
                if ( regions.length === undefined )
                {
                    data.region.flowTo( regions ); // Flow content to the single region.
                }
                // Otherwise, 'regions' is assumed to be a collection (e.g., a jQuery object or array)
                // containing multiple region elements.
                else
                {
                    // Iterate through each element in the collection and apply the 'flowTo' method individually.
                    for ( var i = 0; i < regions.length; i ++ )
                    {
                        data.region.flowTo( regions[ i ] );
                    }
                }
            }
            // General handling for any other method besides 'flowTo'.
            else
            {
                // Extract all arguments passed to 'addRegion' starting from the second one,
                // as these are the parameters for the actual region method.
                var parameters = Array.prototype.slice.call( arguments, 1 );

                // Loop through the extracted parameters to ensure that if any parameter is
                // a jQuery collection, only its first element (the raw DOM element) is used.
                for ( var j = 0; j < parameters.length; j ++ )
                {
                    if ( parameters[ j ].length )
                    {
                        parameters[ j ] = parameters[ j ][ 0 ];
                    }
                }

                // Call the target method on the region object using 'apply' to pass the parameters
                // as an array, preserving the 'this' context of the region object.
                var result = data.region[ method ].apply( data.region, parameters );

                // If the method call returns a meaningful result (not null/undefined)
                // and it's not the region object itself, then return this result.
                if ( result && result != data.region )
                {
                    return result;
                }
            }
        }
    }

    // Extend jQuery's prototype to add the 'region' method, making it available on jQuery objects.
    $.fn.region = function ()
    {
        // Iterate over each element in the current jQuery collection.
        for ( var i = 0; i < this.length; i ++ )
        {
            // Apply the 'addRegion' helper function to the current DOM element.
            // All arguments passed to $.fn.region are forwarded to addRegion.
            // If 'addRegion' returns a result (e.g., from a method call),
            // this result is immediately returned, breaking the loop.
            if ( ( result = addRegion.apply( this[ i ], arguments ) ) )
            {
                return result;
            }
        }
        // If no method returned a specific result, return the original jQuery object
        // to maintain chainability.
        return this;
    };

} )( jQuery ); // The IIFE is immediately invoked with the 'jQuery' object.