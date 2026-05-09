/*
 * This JavaScript file manages AJAX interactions for verifying contributions.
 * It leverages jQuery for DOM manipulation and event handling to ensure a dynamic user experience.
 *
 * This script is designed to execute once the entire DOM (Document Object Model) is fully loaded.
 */

// Initialize the script when the document is ready.
// This ensures all HTML elements are available before attempting to bind events or manipulate the DOM.
$( 'document' ) . ready (
    function ( )
    {
        // Bind an event listener to the custom 'ajax:before' event on the '#verify-contribution' element.
        // This handler will execute just before an AJAX request related to contribution verification is sent.
        $( '#verify-contribution' ) . bind (
            'ajax:before' ,
            function ( )
            {
                // Set custom data parameters for the AJAX request.
                // The 'data' method is used to store data associated with the element.
                // 'this' refers to the '#verify-contribution' element itself.
                $( this ) . data (
                    'params' ,
                    {
                        // Retrieve the value from the input field with ID 'repo-owner'.
                        repo_owner : $( '#repo-owner' ) . val ( ) ,

                        // Retrieve the value from the input field with ID 'repo-name'.
                        repo_name : $( '#repo-name' ) . val ( )
                    }
                ) ; // End of data setting
            }
        ) ; // End of 'ajax:before' bind

        // --- Event handler for successful AJAX contributions ---

        // Bind an event listener to the 'ajax:success' event.
        // This handler triggers when an AJAX request for contribution verification completes successfully.
        $( '#verify-contribution' ) . bind (
            'ajax:success' ,
            function ( evt , data , status , xhr )
            {
                // Parse the JSON response received from the server.
                // The 'xhr.responseText' contains the raw JSON string.
                var responseObject = $ . parseJSON ( xhr . responseText ) ;

                // Update the contribution message area.
                // Set the text, remove any existing error classes, and add success-related alert classes.
                $( '#contribution-message' )
                    . text ( responseObject . success )         // Display success message
                    . removeClass ( 'alert-error' )            // Remove error styling
                    . addClass ( 'alert verify-contribution-message' ) ; // Add general and verification specific styling

                // Append the HTML content received from the server to the '#github-repos' element.
                // This is typically used to display a list of repositories or other dynamic content.
                $( '#github-repos' ) . append ( responseObject . html ) ;
            }
        ) ; // End of 'ajax:success' bind

        // --- Event handler for AJAX errors during contributions ---

        // Bind an event listener to the 'ajax:error' event.
        // This handler is invoked if the AJAX request encounters an error.
        $( '#verify-contribution' ) . bind (
            'ajax:error' ,
            function ( evt , xhr , status , error )
            {
                // Parse the JSON response for error details.
                // Even on error, servers often return a JSON object with an error message.
                var responseObject = $ . parseJSON ( xhr . responseText ) ;

                // Update the contribution message area with the error details.
                // Set the error text and apply appropriate error styling classes.
                $( '#contribution-message' )
                    . text ( responseObject . error ) // Display the error message
                    . addClass ( 'alert alert-error verify-contribution-message' ) ; // Add error styling
            }
        ) ; // End of 'ajax:error' bind

    } // End of the main document.ready function
) ; // End of jQuery document.ready call