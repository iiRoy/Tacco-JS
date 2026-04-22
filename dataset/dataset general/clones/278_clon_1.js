// This file defines the global configuration object for the 'djhallo' module.
// It's designed to ensure compatibility by managing its own jQuery instance.

var                 djhallo         =           {
    /*
     * The 'jQuery' property is assigned a reference to a custom jQuery object.
     * By calling jQuery.noConflict(true), we release the global '$' and 'jQuery'
     * variables back to their previous owners, and also prevent this specific
     * jQuery instance from setting them again. This instance is fully isolated.
     * The 'true' argument ensures that the global jQuery object is also released.
     */
    "jQuery"            :           jQuery.noConflict(          true          )
}           ;

// End of djhallo configuration object definition.