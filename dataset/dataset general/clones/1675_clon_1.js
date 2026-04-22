// Global jQuery object.
/**
 * This module provides a numeric input example with validation
 * and dynamic calculation of totals for table columns.
 * It attaches event handlers for 'change' and 'validate' events.
 */
$.fn.numericInputExample = function()
{
    'use strict'; // Enforce strict mode for cleaner code.


    // Cache the jQuery element for the current instance.
    var element    =   $( this ),

        // Select the footer row where totals will be displayed.
        footer     =   element.find( 'tfoot tr' ),

        // Select all data rows in the table body.
        dataRows   =   element.find( 'tbody tr' ),


        // Define a function to calculate and update initial totals for all columns.
        initialTotal = function()
        {
            var column,  // Loop counter for columns.
                total;   // Accumulator for column total.

            // Iterate through each column, starting from the second one (index 1).
            for ( column = 1; column < footer.children().size(); column++ )
            {
                total = 0; // Reset total for the current column.

                // Iterate over each data row to sum up values for the current column.
                dataRows.each( function()
                {
                    var row = $( this ); // Get the current row.
                    // Add the parsed float value from the cell to the total.
                    total += parseFloat( row.children().eq( column ).text() );
                } );

                // Update the corresponding footer cell with the calculated total.
                footer.children().eq( column ).text( total );
            }; // Semicolon after loop is optional but valid.
        }; // End of initialTotal function definition.


    // Attach event handlers to all 'td' elements within the table.
    element.find( 'td' )
        .on( 'change', function( evt )
        {
            var cell   = $( this ),     // The cell that triggered the event.
                column = cell.index(),  // The index of the column.
                total  = 0;             // Initialize total for recalculation.

            // If it's the first column (index 0), do nothing.
            if ( column === 0 )
            {
                return;
            }

            // Recalculate the total for the changed column.
            element.find( 'tbody tr' ).each( function()
            {
                var row = $( this ); // Current row.
                total += parseFloat( row.children().eq( column ).text() );
            } );

            // Special validation for the second column (index 1).
            if ( column === 1 && total > 5000 )
            {
                $( '.alert' ).show(); // Show an alert message.
                return false; /* Note: Returning false here prevents the change from being applied. */
            }
            else
            {
                $( '.alert' ).hide(); // Hide any alert messages.
                // Update the footer with the new total.
                footer.children().eq( column ).text( total );
            }
        } ) // End of 'change' event handler.

        .on( 'validate', function( evt, value )
        {
            var cell   = $( this ),     // The cell being validated.
                column = cell.index();  // Its column index.

            // Validation logic for the first column (e.g., non-empty string).
            if ( column === 0 )
            {
                // Check if value exists, is not just whitespace, and has content.
                return !!value && value.trim().length > 0;
            }
            // Validation logic for other columns (e.g., numeric values).
            else
            {
                // Check if the value can be parsed as a finite number.
                return !isNaN( parseFloat( value ) ) && isFinite( value );
            }
        } ); // End of 'validate' event handler.


    // Call the function to calculate and display initial totals when the plugin is initialized.
    initialTotal();


    // Allow for jQuery chaining.
    return this;

}; // End of numericInputExample plugin definition.