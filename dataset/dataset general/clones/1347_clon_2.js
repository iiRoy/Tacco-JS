( function( jqLib ) {

    // Verify if the core utility library is available.
    if ( !jqLib ) {
        return; // Exit if no library is found.
    }

    /*
     *  Plugin Definition
     *  Establishes the 'timePeriod' functionality on jQuery/Zepto objects.
     */
    jqLib.fn.timePeriod = function( configuration ) {
        var returnValueHolder; // Stores the output from plugin method calls.

        this.each( function() { // Iterate over each matched DOM element.
            var wrappedElement = jqLib( this ); // Wrap the current element using the library.
            var instanceObject = wrappedElement.data( 'timePeriod' ); // Attempt to retrieve an existing plugin instance.
            var initialSettings = ( typeof configuration === 'object' && configuration ); // Determine initialization settings.

            // If no plugin instance is attached to this element, create a new one.
            if ( !instanceObject ) {
                instanceObject = new TimePeriodManager( this, initialSettings ); // Construct a new manager.
                wrappedElement.data( 'timePeriod', instanceObject ); // Store the new instance on the element.
            }

            // If the configuration is a string, it's assumed to be a method call.
            if ( typeof configuration === 'string' ) {
                returnValueHolder = instanceObject[ configuration ](); // Execute the specified method.
            }
        } );

        // Return the method's result or the original wrapped set for chaining.
        return returnValueHolder || this;
    };

    /*
     *  Automated Initialization via Data Attributes
     *  Scans the DOM for elements with 'data-timePeriod' and initializes the plugin.
     */
    jqLib( '[data-timePeriod]' ).each( function() {
        var wrappedElement = jqLib( this ); // Obtain the current element.
        wrappedElement.timePeriod( wrappedElement.data() ); // Initialize the plugin, passing data attributes as configuration.
    } );

// Pass either Zepto or jQuery (or similar) into the IIFE as 'jqLib'.
}( window.MiniLib || window.FullLib ) );