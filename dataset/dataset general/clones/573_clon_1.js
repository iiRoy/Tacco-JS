/*
 * This JavaScript file handles various client-side functionalities for the application.
 * It includes Cufon text replacement, date picker logic, form submission helpers,
 * bookmarking functionality, and asynchronous subdomain availability checks.
 *
 * All code within this file is executed once the DOM (Document Object Model) is fully loaded.
 */

$( document ).ready( function()
{
  // --- Cufon Font Replacement Section ---
  // Replaces standard HTML elements with Cufon-rendered text for custom fonts.
  // This ensures consistent typography across different browsers.

  Cufon.replace( 'h1' ); /* Apply Cufon to all H1 headings */
  Cufon.replace( 'h2' ); // Apply Cufon to all H2 headings
  Cufon.replace( 'h3' ); /* Apply Cufon to all H3 headings */
  Cufon.replace( 'h4' );  // Apply Cufon to all H4 headings
  Cufon.replace( 'h5' );   /* Apply Cufon to all H5 headings */
  Cufon.replace( 'h6' );    // Apply Cufon to all H6 headings


  // --- Initial Date Field Population ---
  // Sets the initial values of several date input fields based on the currently selected date
  // in the date picker UI component. This ensures form fields reflect the default selection.

  $( "#request_date_dummy" ).val( $( "#date_picker li a.selected" ).text() );

  $( "#appointment_requested_date_chronic" ).val( $( "#date_picker li a.selected" ).text() );

  $( "#appointment_confirmed_date_chronic" ).val( $( "#date_picker li a.selected" ).text() );


  // --- Date Picker Click Handler ---
  // Defines the behavior when a date link within the date picker is clicked.
  // It updates relevant date input fields, manages the 'selected' class, and prevents default link action.

  $( "#date_picker li a" ).click( function()
  {
    /* Update the requested appointment date field */
    $( "#appointment_requested_date_chronic" ).val( $( this ).text() );

    // Update the confirmed appointment date field
    $( "#appointment_confirmed_date_chronic" ).val( $( this ).text() );

    // Update the dummy request date field
    $( "#request_date_dummy" ).val( $( this ).text() );

    // Remove the 'selected' class from any previously selected date
    $( "#date_picker li a.selected" ).removeClass( "selected" );

    // Add the 'selected' class to the newly clicked date
    $( this ).addClass( "selected" );

    // Prevent the default anchor tag behavior (e.g., navigating to href)
    return false;
  } );


  // --- Initial UI State Adjustments ---
  // Hides specific elements and initializes a cycle plugin for image/content rotation.

  $( "em.url" ).hide(); // Hide elements with class 'url' and tag 'em'
  $( '.holder' ).cycle(); // Initialize the jQuery Cycle plugin on elements with class 'holder'


  // --- Admin Appointment Management Actions ---
  // Handles click events for various buttons/links related to managing appointments in an admin interface.

	// Handler for canceling an appointment
	$( ".appointment_cancelled" ).click( function() {
		$( "#appointment_cancelled" ).val( 'true' ); // Set hidden field to 'true'
	} );

	// Handler for rejecting an appointment
	$( ".appointment_rejected" ).click( function() {
		$( "#appointment_rejected" ).val( 'true' ); // Set hidden field to 'true'
	} );

	// Handler for confirming an appointment date
	$( ".appointment_confirmed_date" ).click( function()
	{
		// Set the confirmed date based on the requested date
		$( "#appointment_confirmed_date" ).val( $( "#appointment_requested_date" ).val() );

		// Clear the chronic confirmed date field
		$( "#appointment_confirmed_date_chronic" ).val( '' );

		// Submit the parent form of the clicked element
		$( this ).parents( 'form' ).submit();
	} );


	// --- Generic Link Submission Helper ---
	// Attaches a click handler to elements with the class 'action' (unless they also have 'nosubmit').
	// This handler automatically submits the parent form.

	$( ".action" ).not( '.nosubmit' ).click( function()
	{
		$( this ).parents( 'form' ).submit(); // Submit the form
	} );


	// --- Browser Bookmarking Feature ---
	// Provides functionality to bookmark the current page, with browser-specific implementations.

	if ( window.opera )
	{
	    // For Opera browser, check if 'rel' attribute is already set.
	    // If not, set it to "sidebar" to enable Opera's bookmarking.
	    if ( $( "a.jqbookmark" ).attr( "rel" ) != "" )
	    {
	        $( "a.jqbookmark" ).attr( "rel" , "sidebar" );
	    }
	}

	// Click handler for bookmark links
	$( "a.jqbookmark" ).click( function( event )
	{
	    event.preventDefault(); // Prevent the default link action

	    var url = this.href;    // Get the URL from the link's href attribute
	    var title = this.title; // Get the title from the link's title attribute

	    if ( window.sidebar )
	    {
	        // Mozilla Firefox specific bookmarking
	        window.sidebar.addPanel( title, url, "" );
	    }
	    else if ( window.external )
	    {
	        // Internet Explorer specific bookmarking
	        window.external.AddFavorite( url, title );
	    }
	    else if ( window.opera )
	    {
	        // Opera 7+ handled by 'rel="sidebar"', so do nothing here
	        return false;
	    }
	    else
	    {
	        // Fallback for other browsers (Safari, Konqueror, etc.) that don't support script-based bookmarking
	         alert( 'Unfortunately, this browser does not support the requested action,'
	         + ' please bookmark this page manually.' );
	    }

	} );


	// --- Account Subdomain Availability Check ---
	// Handles the blur event for the subdomain input field, performing an AJAX check
	// to see if the entered subdomain is available or already taken.

	$( "#account_subdomain" ).blur( function()
	{
	  // Hide any previously shown URL messages
	  $( "em.url" ).hide();

	  // If the input field is empty, do nothing
	  if ( $( this ).val() == "" )
	  {
	    return;
	  }

	  // Show a 'checking' indicator
	  $( "em.check" ).show();

	  // Perform an AJAX request to check subdomain availability
	  $.ajax( {
	    url: "/accounts/check", // Endpoint for the check
	    data: { "subdomain": $( this ).val() }, // Data to send: the subdomain value
	    dataType: "json", // Expected response data type
	    success: function( data )
	    {
	      $( "em.check" ).hide(); // Hide the 'checking' indicator

	      // Based on the AJAX response, show 'taken' or 'available' message
	      if ( data.taken )
	      {
	        $( "em.taken" ).show(); // Show 'taken' message
	      }
	      else
	      {
	        $( "em.avail" ).show(); // Show 'available' message
	      }
      }
	  } );
	} );

} ); // End of document.ready function