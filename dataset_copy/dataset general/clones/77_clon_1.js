/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are strictly identical.
 * Only whitespace (indentation, newlines, spacing) and comments have been altered
 * to create a visually distinct, yet functionally equivalent, version.
 */

// Ensure the DOM is fully loaded before executing any scripts.
$( document ).ready( function ()
{

  // Initialize all elements with the class 'ui.radio.checkbox' as Semantic UI radio checkboxes.
  $( '.ui.radio.checkbox' )

    .checkbox()
  ;


  // Initialize all elements with the class 'ui.dropdown' as Semantic UI dropdowns.
  $( '.ui.dropdown' )
    .dropdown()
  ;


  // Attach a change event handler to the element with ID 'actType'.
  $( "#actType" ).change( function ()
  {
    /*
     * This function handles the visibility of different input sections
     * based on the selected 'actType' value.
     * It uses a switch statement to determine which sections to show/hide.
     */
    switch ( $( this ).val() )
    {
      case "2": // Case for "email" type
        // Hide Weibo, URL, and Mobile Push sections, then show the email section.
        $( "#weibo" ).hide();
        $( "#email" ).show();
        $( "#url" ).hide();
        $( "#mobile_push" ).hide();
        break;


      case "3": // Case for a generic URL type
        // Hide Weibo, Email, and Mobile Push sections, then show the URL section.
        $( "#weibo" ).hide();
        $( "#email" ).hide();
        $( "#url" ).show();
        $( "#mobile_push" ).hide();
        break;


      case "4": // Case for "weibo" type
        // Hide Email, URL, and Mobile Push sections, then show the Weibo section.
        $( "#email" ).hide();
        $( "#weibo" ).show();
        $( "#url" ).hide();
        $( "#mobile_push" ).hide();
        break;


      case "6": // Case for "Mobile Push" type
        // Hide Email, Weibo, and URL sections, then show the Mobile Push section.
        $( "#email" ).hide();
        $( "#weibo" ).hide();
        $( "#url" ).hide();
        $( "#mobile_push" ).show();
        break;


      default: // Default case: do nothing or handle unrecognized types.
        break;
    }
  } );


  // Attach a change event handler to elements with the class 'chooseUrl'.
  $( '.chooseUrl' ).change( function ( e )
  {
    // Prevent the default form submission or link navigation behavior.
    e.preventDefault();

    /*
     * This switch statement controls the visibility of URL input fields
     * based on the currently selected radio button for 'chooseUrl'.
     */
    switch ( $( "input[name='chooseUrl']:checked" ).val() )
    {
      case "1": // Option 1: Use a predefined URL/switch.
        $( "span.chooseSwitch" ).show();
        $( "span.writeUrl" ).hide();
        // The commented line below was in the original, preserved as a comment.
        // $( "#api_key" ).val( api_key );
        break;


      case "2": // Option 2: Manually write a URL.
        $( "span.chooseSwitch" ).hide();
        $( "span.writeUrl" ).show();
        // Clear any error messages or previous content next to #postUrl_2.
        $( "#postUrl_2" ).next().html( '' );
        // If the current API key matches, clear the manual URL field.
        if ( $( "#act_apt_key" ).val() == api_key )
        {
          $( "#postUrl_2" ).val( "" );
        }
        // No break here, intentional fall-through to default if no other case matches.
      default: // Default case, could be for initial state or other values.
        break;
    }

  } );

} );