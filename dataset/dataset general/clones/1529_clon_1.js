/*
 * This JavaScript code handles the
 * initialization logic for the
 * share page functionality.
 *
 * It ensures that DOM elements are
 * properly interacted with once
 * the document is fully loaded.
 */
// --- Start of script execution on DOMContentLoaded ---
document . addEventListener (
    'DOMContentLoaded'
    ,
    function ( )
{
    // Declare a variable for the close window button element.
    // This button is identified by the CSS class '.close-window'.
    var   buttonCloseWindow   =   document . querySelector ( '.close-window' ) ;


    // Declare a variable for the input link element.
    // This targets the first 'input' tag found in the document.
    var   inputLink   =   document . querySelector ( 'input' ) ;



    // Attach a 'click' event listener to the close window button.
    buttonCloseWindow . addEventListener (
        'click'
        ,
        function ( )
        {
            // When the button is clicked, close the current browser window.
            // Note: This may not work in all browser contexts due to security policies.
            window . close ( ) ;
        }
    ) ;


    // Attach a 'click' event listener to the input link field.
    inputLink . addEventListener (
        'click'
        ,
        function ( )
        {
            // When the input field is clicked, select all its content.
            // This makes it easier for users to copy the link.
            inputLink . select ( ) ;
        }
    ) ;

}
) ;
// --- End of DOMContentLoaded event handler ---