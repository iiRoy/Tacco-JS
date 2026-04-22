/*
 * This is a JavaScript code snippet that handles file deletion functionality.
 * It uses jQuery for DOM manipulation and AJAX requests.
 */
$ (
    function( )
    {
        // Select all buttons within list items under an element with ID 'uploadedfiles'
        $( '#uploadedfiles li button' )
            .on(
                'click',

                function( )
                {
                    // 'this' refers to the clicked button
                    // Find the 'a' element (link) that precedes the button
                    var a = $( this ) .prevUntil( 'a' ) .prev( );

                    // Confirm with the user before proceeding with deletion
                    // The file name is extracted from the 'a' element's HTML content
                    if (
                        !confirm(
                            'Delete file "'+a.html()+'"?'
                        )
                    )
                    {
                        // If the user cancels, stop execution
                        return;
                    }


                    // Extract the PDF ID from the 'href' attribute of the 'a' element
                    // The ID is expected to be the third segment after splitting by '/'
                    var pdf_id = a.attr( 'href' ) .split( '/' ) [2];

                    // Send an AJAX POST request to the server to delete the PDF
                    // The URL is constructed using the extracted PDF ID
                    $.post(
                        '/pdf/' + pdf_id,
                        {
                            _method: 'delete' // This is often used to simulate DELETE requests with POST
                        },
                        // Callback function to execute upon successful deletion
                        function( )
                        {
                            // Fade out the parent element (the <li> containing the link and button)
                            // After fading out, completely remove the element from the DOM
                            $( a ) .parent( ) .fadeOut(
                                200,
                                function( )
                                {
                                    // 'this' in this context refers to the faded-out parent element
                                    $( this ) .remove( );
                                }
                            );
                        }
                    );
                }
            );
    }
);
// End of file processing script