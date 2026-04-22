( function ( )
{
    /* This function is responsible for storing data and adjusting
     * the height of a UI element based on its content.
     */
    function   storeData ( )
    {
        // Store the current value of 'data' element in local storage.
        localStorage . setItem ( 'data' , data . value ) ;

        // Calculate a new height based on the current height, subtracting 100 pixels.
        var   height   =   parseInt ( data . style . height )   -   100 ;

        // Ensure the height does not fall below a minimum of 100 pixels.
        if   ( height   <   100 )
        {
            height   =   100 ;
        }

        // Apply the calculated height.
        data . style . height   =   height   +   'px' ;

        /* This next line seems to override the previous height calculation,
         * setting the height based on the scrollable content.
         */
        data . style . height   =   parseInt ( data . scrollHeight )   +   'px' ;
    } // End of storeData function

    /**
     * The initialization function.
     * This sets up the UI element and attaches event handlers.
     */
    function   init ( )
    {
        // Get the DOM element with the ID 'data'.
        var   data   =   document . getElementById ( 'data' ) ;

        // Restore the value from local storage, if available.
        data . value   =   localStorage . getItem ( 'data' ) ;

        // Attach the storeData function to the 'keyup' event of the data element.
        data . onkeyup   =   storeData ;

        // Immediately call storeData once to apply initial styling/storage.
        storeData ( ) ;
    } // End of init function

    // Execute the initialization function when the script loads.
    init ( ) ;
} ( ) ) ; // End of IIFE