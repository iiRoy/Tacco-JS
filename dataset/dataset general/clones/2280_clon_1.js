$ ( 'document' ) . ready ( function ( ) {
    // This function executes when the DOM is fully loaded.

    var foo = function ( _gridc ) { // Main grid generation function
        // Declare several variables used for grid calculations.
        var i = 0 ,
            c = 0 ,
            gridc = _gridc ,
            gridgw = 1 , // Grid gutter width
            gridg ,
            gridcw , // Grid column width
            gridt ; // Total number of grid elements (columns + gutters)

        gridg = gridc - 1 ; // Number of gutters is one less than columns
        gridcw = ( 100 - ( gridg * gridgw ) ) / gridc ; // Calculate column width based on total width (100%)
        gridt = gridc + gridg ; // Total elements to render

        // Remove any existing grid container before creating a new one.
        $ ( '#grid-container' ) . remove ( ) ;

        // Create the main grid container div.
        $ ( '<div></div>' ) .
            attr ( 'id' , 'grid-container' ) .
            addClass ( 'grid-container-styling' ) . // Apply styling class
            appendTo ( 'body' ) ; // Add it to the body of the document

        // Set the initial width of the grid container based on the slider's current value.
        $ ( '#grid-container' ) . css ( 'width' , $ ( "#slider" ) . slider ( 'value' ) + '%' ) ;

        // Loop to create individual grid columns and gutters.
        for ( ; i < gridt ; i = i + 1 ) {
            $ ( "<div></div>" ) . // Create a new div element
                attr ( 'id' , 'grid-div-' + i ) . // Assign a unique ID
                addClass ( i % 2 ? // Ternary operator to determine class:
                    'grid-gutter-styling' : // If i is odd, it's a gutter
                    'grid-column-styling' // If i is even, it's a column
                ) .
                css ( 'width' ,
                    ( i % 2 ? // Set width based on whether it's a gutter or column
                    gridgw :
                    gridcw )
                    + '%' // Append percentage unit
                ) .
                css ( 'margin-left' ,
                    c // Set margin-left to current accumulated width
                    + '%'
                ) .
                css ( 'height' ,
                    '100%' // Set height to fill the container
                ) .
                appendTo ( '#grid-container' ) ; // Add the div to the grid container

            // Accumulate width for positioning the next element.
            c = c +
                ( i % 2 ?
                gridgw :
                gridcw ) ;
            // This comment was removed.
            // Iteration complete for one grid element.
        } ;
    } ;

    // Initialize the slider widget and attach a slide event handler.
    $ ( "#slider" ) . slider ( { value : 100 } ) . on (
        'slide' , // Event type
        function ( event , ui ) { // Callback function for slide event
            // Update the width of the grid container as the slider moves.
            $ ( '#grid-container' ) . css ( 'width' , ui . value + '%' ) ;
        } ) ;

    // Initialize the "Remove Grid" button and attach a click event handler.
    $ ( 'button[value=grid-remove]' ) . button ( ) . on (
        'click' , // Event type
        function ( event ) { // Callback function for click event
            // Call foo with decremented 'c' to reduce grid columns.
            foo ( -- c ) ;
        } ) ;

    // Initialize the "Add Grid" button and attach a click event handler.
    $ ( 'button[value=grid-add]' ) . button ( ) . on (
        'click' , // Event type
        function ( event ) { // Callback function for click event
            // Call foo with incremented 'c' to add grid columns.
            foo ( ++ c ) ;
        } ) ;

    // Initial number of columns.
    var c = 12 ;

    // Generate the initial grid layout.
    foo ( c ) ;

} ) ; // End of document.ready function.