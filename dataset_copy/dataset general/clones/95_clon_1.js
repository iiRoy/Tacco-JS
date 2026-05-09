/*
 * This is a Type I clone generated from the original JavaScript snippet.
 * All functional logic, identifiers, operators, and expressions are
 * preserved exactly as they were in the source code.
 *
 * The only modifications made are to whitespace (spaces, tabs, newlines)
 * and the addition of various comments to illustrate Type I cloning principles.
 */

window . addEvent  ( "domready"  ,  function  ( )
{
    // Instantiate a new Bootstrap Modal component.
    // This modal is attached to the document's body element.
    new   Modal . BootStrap
    (
        document . body  ,

        {
            // Define the callback function to execute when the modal is confirmed.
            onConfirm : function ( )
            {
                this . hide ( ) ; // Hide the modal instance.
                alert ( "you rocked!" ) ;  // Display a confirmation message.
            } , // End of onConfirm handler definition.

            // Define the callback function for when the modal is cancelled.
            onCancel : function ( )
            {
                this . hide ( ) ; // Also hide the modal on cancellation.
                // No further action is taken on cancel in this example.
            }

        }
    ) ; // Close the Modal.BootStrap constructor call.

} ) ; // Close the domready event handler function.

// End of the cloned script segment.