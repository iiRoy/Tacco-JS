/*
 * This is a Type I clone generated according to the strict definition.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered. All identifiers, variable names, function names,
 * operators, and expressions are identical to the original source.
 */

( function ( $ ) {

    // Entry point: checks if a jQuery/Zepto object is provided.
    if ( ! $ )
    {
        // If no library is available, the plugin cannot be initialized.
        return ;
    }


    //
    // --- Datepair Plugin Definition ---
    //
    // Extends jQuery's prototype to add the 'datepair' functionality.
    //
    $.fn.datepair = function ( option )
    {
        var out ; // Variable to hold the return value of called methods.

        this . each ( function ()
        {
            var $this = $( this ) ; // Cache the current element as a jQuery object.

            var data = $this . data ( 'datepair' ) ; // Attempt to retrieve an existing Datepair instance.

            var options = typeof option === 'object' && option ; // Determine initialization options.


            // If no Datepair instance exists for this element, create a new one.
            if ( ! data )
            {
                data = new Datepair ( this , options ) ; // Instantiate the Datepair object.

                $this . data ( 'datepair' , data ) ; // Store the new instance on the element's data.
            }

            // If 'option' is a string, it indicates a method call on the Datepair instance.
            if ( typeof option === 'string' )
            {
                out = data [ option ] ( ) ; // Call the specified method and store its result.
            }

        } ) ; // End of this.each() iteration.


        return out || this ; // Return the method's result or the jQuery object for chaining.
    } ;


    //
    // --- Data API Auto-Initialization ---
    //
    // Automatically initializes datepair on elements with a 'data-datepair' attribute.
    //
    $( '[data-datepair]' ) . each ( function ()
    {
        var $this = $( this ) ; // Get the current DOM element as a jQuery object.

        // Initialize the datepair plugin using data attributes as options.
        $this . datepair ( $this . data ( ) ) ;
    } ) ;


} ( window . Zepto || window . jQuery ) ) ; // Pass either Zepto or jQuery to the IIFE.