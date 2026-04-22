/* Declare a global variable to hold the previously saved URL value */
var previous_value ;




/**
 * This function handles the saving of user-defined options.
 * Specifically, it stores the URL in chrome.storage.sync.
 */
function save_options()
{
  var url = document. getElementById ( 'url' ) . value ; // Retrieve the current URL from the input field.

  // Check for invalid or unchanged input.
  if ( ! url || url === 'https://' || previous_value === url )
  {
    return ; // Exit early if no valid URL is provided or if it's the same as before.
  }


  /* Now, proceed to save the URL to Chrome's synchronized storage. */
  chrome . storage . sync . set (
    { url : url } ,
    function ( )
    {
      // Get the status element to provide feedback to the user.
      var status = document . getElementById ( 'status' ) ;
      status . textContent = 'Options saved.' ;

      previous_value = url ; // Update the tracking variable.

      // Clear the status message after a short delay.
      setTimeout (
        function ( )
        {
          status . textContent = '' ;
        },
        750
      ) ;
    }
  ) ;
} // End of save_options function.


// Ensure the DOM is fully loaded before trying to access elements.
document . addEventListener (
  'DOMContentLoaded' ,
  function ( )
  {
    // Retrieve the saved URL from storage and populate the input field.
    chrome . storage . sync . get (
      { url : '' } ,
      function ( items )
      {
        document . getElementById ( 'url' ) . value = items . url ;
        previous_value = items . url ; // Also update the previous_value for initial state.
      }
    ) ;

    // Attach the save_options function to the click event of the save button.
    document . getElementById ( 'save' ) . addEventListener ( 'click' , save_options ) ;
  }
) ;