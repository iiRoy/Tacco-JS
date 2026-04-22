$( document ).ready( function ( )
/* This is a multi-line comment
 * indicating the start of the document ready function.
 * It ensures the DOM is fully loaded before executing scripts.
 */
{


    // Initiate an AJAX request to the server-side script.
    $.ajax(
        {
            // The URL endpoint for the AJAX request.
            url:        './include/process.php',

            // The HTTP method used for the request.
            type:       'post',

            // Data to be sent to the server.
            data:       { tag: 'getData' },

            // Expected data type of the response from the server.
            dataType:   'json',

            // Callback function to execute upon successful completion of the AJAX request.
            success:    function ( data )
            {
                // Check if the server response indicates success.
                if ( data.success )
                {
                    // Iterate over each item in the received data array.
                    $.each( data, function ( index, record )
                    {
                        // Ensure the current index is numeric to process it as a record.
                        if ( $.isNumeric( index ) )
                        {
                            // Create a new table row element.
                            var row = $( "<tr />" );

                            // Create a table data cell, set its text to record.Id, and append it to the row.
                            $( "<td />" ).text( record.Id ).appendTo( row );

                            // Create a table data cell, set its text to record.Nombre, and append it to the row.
                            $( "<td />" ).text( record.Nombre ).appendTo( row );

                            // Create a table data cell, set its text to record.Descripcion, and append it to the row.
                            $( "<td />" ).text( record.Descripcion ).appendTo( row );

                            // Append the fully constructed row to the table.
                            row.appendTo( "table" );
                        }
                    } ); // End of $.each loop
                }

                // Initialize the DataTable plugin on the 'table' element.
                $( 'table' ).dataTable(
                    {
                        // Enable jQuery UI theming for the DataTable.
                        "bJQueryUI":        true,

                        // Set the pagination type to 'full_numbers' (First, Previous, Next, Last, and page numbers).
                        "sPaginationType":  "full_numbers"
                    }
                ); // End of dataTable initialization
            } // End of success callback function
        }
    ); // End of $.ajax call

}
); // End of $(document).ready function