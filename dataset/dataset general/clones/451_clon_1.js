/*
 * This JavaScript file contains functionality to enhance table presentation
 * on responsive layouts, specifically targeting smaller screen sizes.
 * Its primary purpose is to generate and display table headers
 * dynamically alongside table data cells when the layout requires it.
 *
 * Author: Original logic by Angelo Compagnucci <angelo.compagnucci@gmail.com>
 * This version includes extensive whitespace and comment modifications
 * for Type I clone demonstration.
 */

// This block ensures that the primary setup function is invoked
// once the entire Document Object Model (DOM) is fully loaded and parsed.
// It's a standard practice to prevent issues with elements not yet existing.
jQuery ( document ) . ready ( function ( ) {
    // Call the designated function to initialize or refresh table headers.
    // This initial call sets up headers based on the initial window size.
    set_table_headers ( ) ;
} ) ;


// This event listener is attached to the browser's window object.
// It triggers a function whenever the window is resized by the user.
jQuery ( window ) . resize ( function ( ) {
    // Before re-evaluating headers, remove any previously generated
    // responsive headers to avoid visual clutter and duplication.
    // Elements with the class 'resp-header' are targeted for removal.
    jQuery ( ".resp-header" ) . remove ( ) ;

    // After clearing old headers, re-run the setup function.
    // This ensures that the table headers adapt correctly to the new
    // dimensions of the browser window or viewport.
    set_table_headers ( ) ;
} ) ;


/*
 * Main function responsible for the logic of populating responsive table headers.
 * It checks the current document width and, if below a certain threshold,
 * iterates through tables to insert header information next to data cells.
 */
function set_table_headers ( ) {
    // Check if the current width of the document is less than 700 pixels.
    // This threshold typically defines when the responsive layout should activate.
    if ( jQuery ( document ) . width ( ) < 700 ) {
        // Select all 'div' elements that are NOT 'form' elements,
        // then find their direct 'table' children.
        // The '.each()' method then iterates over each found table.
        jQuery ( "div" ) . not ( "form" ) . children ( "table" ) . each ( function ( ) {
            // 'curtable' holds a jQuery object reference to the current table
            // being processed within this iteration.
            curtable = jQuery ( this ) ;

            // Find all empty table data cells ('<td>') within 'curtable'
            // and insert a non-breaking space (&nbsp;) into them.
            // This can help with layout consistency for empty cells.
            curtable . find ( "td:empty" ) . html ( "&nbsp;" ) ;

            // Locate all table header cells ('<th>') that are direct children
            // of a '<tr>' within a '<thead>' of the current table.
            curhead = curtable . find ( "thead > tr > th" ) ;

            // Conditional block: execute only if header cells were found in the table.
            if ( curhead . length > 0 ) {
                // Determine the number of data cells in the first row of the table's body.
                // This count indicates the number of columns in the table.
                tdcount = curtable . find ( "tbody > tr:eq(0) > td" ) . length ;

                // Loop from 1 up to the total number of data columns.
                // Each iteration corresponds to processing a single column.
                for ( index = 1 ; index <= tdcount ; index ++ ) {
                    // Retrieve the HTML content of the corresponding table header cell.
                    // 'index - 1' is used because 'eq()' is zero-indexed.
                    curth = curhead . eq ( index - 1 ) . html ( ) ;

                    // Ternary operator to ensure 'curth' is not null.
                    // If 'curth' is null, it defaults to a non-breaking space.
                    curth = ( curth != null ) ? curth : '&nbsp;' ;

                    // Find all data cells ('<td>') within the table body ('tbody')
                    // that belong to the current column ('nth-of-type(index)').
                    // Then, prepend a 'span' element containing the header text ('curth')
                    // before each of these data cells.
                    // The 'resp-header' class allows for specific styling of these new spans.
                    curtable . find ( "tbody > tr > td:nth-of-type(" + index + ")" )
                        . before ( '<span class="resp-header">' + curth + '</span>' ) ;
                } // End of the for loop iterating through columns.
            } // End of the if block for tables with headers.
            else {
                // This 'else' block executes if no 'thead' or 'th' elements were found.
                // It applies specific CSS styles directly to all 'td' elements.
                // This might be for tables designed without explicit headers or for fallback styling.
                curtable . find ( "td" ) . css ( {
                    'padding-left' : '0' ,  // Removes left padding.
                    'width'        : 'auto' , // Sets width to automatic.
                    'left'         : '3px'   // Positions the element 3px from the left.
                } ) ;
            } // End of the else block for tables without headers.
        } ) ; // End of the .each() function iterating through tables.
    } // End of the if (document width < 700) condition.
} // End of the set_table_headers function definition.