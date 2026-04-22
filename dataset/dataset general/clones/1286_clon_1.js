/*
 * This JavaScript file contains client-side logic for an HTTP request builder interface.
 * It manages parameter inputs, AJAX submissions, and displays responses.
 *
 * All identifiers, operators, and expressions are preserved exactly as in the original source.
 * Only whitespace (spacing, indentation, blank lines) and comments have been altered
 * to create a visually distinct, yet functionally identical, clone.
 */

// Function: showParamHeaders - Controls the visibility of parameter headers.
// This function checks if there are any active input elements for parameters.
function showParamHeaders (  )
{
	// Check if the container for all parameters has any children with the class 'realinputvalue'.
	if  (  $ ( "#allparameters" ) . find ( ".realinputvalue" ) . length > 0  )
	{
		// If there are parameters, ensure the container is visible.
		$ ( "#allparameters" ) . show (  ) ;
	}
	else
	{
		// If no parameters are found, hide the container.
		$ ( "#allparameters" ) . hide (  ) ;
	}
} // End of showParamHeaders function definition.


/*
 * Event Listener: .fakeinputname blur event.
 * This handler updates the 'name' attribute of the actual hidden input field
 * when the user changes the visible 'fake' parameter name.
 *
 * This section ensures that user-defined parameter names are correctly
 * propagated to the underlying form elements for submission.
 */
$ ( ".fakeinputname" ) . blur ( function ( )
{
  // Retrieve the new parameter name from the input field that triggered the event.
  var newparamname = $ ( this ) . val ( ) ;
  // Traverse up the DOM tree from the current input to its containing parameter block,
  // then find the corresponding 'realinputvalue' and set its 'name' attribute.
  $ ( this ) . parent ( ) . parent ( ) . parent ( ) . parent ( ) . find ( ".realinputvalue" ) . attr ( "name" , newparamname ) ;
} ) ; // End of .fakeinputname blur event handler.


/*
 * Event Listener: .close click event.
 * Handles the removal of individual parameter or file input rows.
 */
$ ( ".close" ) . click ( function ( e )
{
  // Prevent the default action associated with the click event (e.g., following a link).
  e . preventDefault ( ) ;
  // Remove the parent element of the clicked 'close' button, effectively deleting the row.
  $ ( this ) . parent ( ) . remove ( ) ;
  // After a row is removed, re-evaluate and update the visibility of parameter headers.
  showParamHeaders ( ) ;
} ) ; // End of .close click event handler.


/*
 * Event Listener: #addprambutton click event.
 * Adds a new HTTP parameter input row to the form.
 */
$ ( "#addprambutton" ) . click ( function ( e )
{
  e . preventDefault ( ) ; // Stop the browser's default action.
  // Clone the first existing HTTP parameter element, including its event handlers,
  // and append it to the '#allparameters' container.
  $ ( '.httpparameter:first' ) . clone ( true ) . appendTo ( "#allparameters" ) ;
  // Update the display of parameter headers to reflect the new addition.
  showParamHeaders ( ) ;
} ) ; // End of #addprambutton click event handler.


/*
 * Event Listener: #addfilebutton click event.
 * Adds a new HTTP file input row to the form.
 */
$ ( "#addfilebutton" ) . click ( function ( e )
{
  e . preventDefault ( ) ; // Prevent any default browser behavior.
  // Clone the first existing HTTP file input element, ensuring events are copied,
  // and append it to the '#allparameters' container.
  $ ( '.httpfile:first' ) . clone ( true ) . appendTo ( "#allparameters" ) ;
  // Refresh the visibility of parameter headers.
  showParamHeaders ( ) ;
} ) ; // End of #addfilebutton click event handler.


/*
 * Function: postWithAjax - Initiates an AJAX request.
 * This is the core function for sending HTTP requests configured by the user interface.
 * It takes an optional 'myajax' object to customize the request.
 */
function postWithAjax ( myajax )
{
  // Ensure 'myajax' is an object; if not, initialize it as an empty object.
  myajax = myajax || { } ;

  // Set the request URL from the value of the '#urlvalue' input field.
  myajax . url = $ ( "#urlvalue" ) . val ( ) ;
  // Set the HTTP method (e.g., GET, POST) from the value of the '#httpmethod' select element.
  myajax . type = $ ( "#httpmethod" ) . val ( ) ;

  // Define the 'complete' callback function for the AJAX request.
  // This function will execute once the request has finished, regardless of success or failure.
  myajax . complete = function ( jqXHR )
  {
		// Update the status display with the HTTP status code and text.
		$ ( "#statuspre" ) . text (
				"HTTP " + jqXHR . status + " " + jqXHR . statusText
      ) ;

		// Apply appropriate CSS classes based on the HTTP status code for visual feedback.
		if ( jqXHR . status == 0 )
		{
			// Call a specific handler for HTTP 0 errors (often network or CORS issues).
			httpZeroError ( ) ;
		}
		else if ( jqXHR . status >= 200 && jqXHR . status < 300 )
		{
			// For successful responses (2xx series).
			$ ( "#statuspre" ) . addClass ( "alert-success" ) ;
		}
		else if ( jqXHR . status >= 400 )
		{
			// For client or server error responses (4xx or 5xx series).
			$ ( "#statuspre" ) . addClass ( "alert-error" ) ;
		}
		else
		{
			// For other informational or redirection responses.
			$ ( "#statuspre" ) . addClass ( "alert-warning" ) ;
		}
		// Display the response body in the '#outputpre' element.
		$ ( "#outputpre" ) . text ( jqXHR . responseText ) ;
		// Display all response headers in the '#headerpre' element.
		$ ( "#headerpre" ) . text ( jqXHR . getAllResponseHeaders ( ) ) ;
	} // End of the 'complete' callback function.


  // If the 'data' property of the 'myajax' object is empty, set the default content type.
  // This typically happens for non-multipart form submissions.
	if ( jQuery . isEmptyObject ( myajax . data ) )
	{
		myajax . contentType = 'application/x-www-form-urlencoded' ;
	}

  // Prepare the output display areas before making the request.
  $ ( "#outputframe" ) . hide ( ) ; // Hide any iframe output.
  $ ( "#outputpre" ) . empty ( ) ; // Clear previous response body.
  $ ( "#headerpre" ) . empty ( ) ; // Clear previous response headers.
  $ ( "#outputframe" ) . attr ( "src" , "" ) ; // Clear the iframe's source.
  $ ( "#ajaxoutput" ) . show ( ) ; // Show the AJAX output display area.

  // Reset the status display and remove any previous status-related styling.
  $ ( "#statuspre" ) . text ( "0" ) ;
  $ ( "#statuspre" ) . removeClass ( "alert-success" ) ;
  $ ( "#statuspre" ) . removeClass ( "alert-error" ) ;
  $ ( "#statuspre" ) . removeClass ( "alert-warning" ) ;

  // Show a loading spinner to indicate that an AJAX request is in progress.
  $ ( '#ajaxspinner' ) . show ( ) ;
  // Execute the AJAX request using jQuery's $.ajax method.
  // The .always() method ensures the spinner is hidden once the request completes, regardless of outcome.
	var req = $ . ajax ( myajax ) . always ( function ( )
  {
    $ ( '#ajaxspinner' ) . hide ( ) ; // Hide the spinner after the request.
	} ) ;
} // End of postWithAjax function definition.


/*
 * Event Listener: #submitajax click event.
 * This handler orchestrates the AJAX submission based on whether files are included.
 */
$ ( "#submitajax" ) . click ( function ( e )
{
  e . preventDefault ( ) ; // Prevent the default form submission.

  // Determine if the form contains any file input fields.
  if ( checkForFiles ( ) )
  {
    // If files are present, construct a multipart form data request.
    postWithAjax ( {
      data : createMultipart ( ) ,   // Use FormData object for data.
      cache : false ,                 // Disable caching for file uploads.
      contentType : false ,           // Let jQuery determine content type for FormData.
      processData : false             // Prevent jQuery from processing FormData.
    } ) ;
  }
  else
  {
    // If no files are present, construct a standard URL-encoded form data request.
    postWithAjax ( {
      data : createUrlData ( )        // Use a plain object for data.
    } ) ;
  }
} ) ; // End of #submitajax click event handler.


/*
 * Function: checkForFiles - Utility to detect file input fields.
 * Returns true if any '.input-file' elements are found within '#paramform'.
 */
function checkForFiles ( )
{
	return $ ( "#paramform" ) . find ( ".input-file" ) . length > 0 ;
} // End of checkForFiles function definition.


/*
 * Function: createUrlData - Gathers form parameters into a plain JavaScript object.
 * This is suitable for 'application/x-www-form-urlencoded' content types.
 */
function createUrlData ( )
{
  var mydata = { } ; // Initialize an empty object to hold the parameter key-value pairs.

	var parameters = $ ( "#allparameters" ) . find ( ".realinputvalue" ) ; // Find all parameter input elements.

	for ( i = 0 ; i < parameters . length ; i ++ ) // Iterate through each found parameter.
	{
		name = $ ( parameters ) . eq ( i ) . attr ( "name" ) ; // Get the 'name' attribute of the current parameter.
		if ( name == undefined || name == "undefined" ) // Skip if the name is not properly defined.
		{
			continue ;
		}
		value = $ ( parameters ) . eq ( i ) . val ( ) ; // Get the 'value' attribute of the current parameter.
		mydata [ name ] = value ; // Add the parameter name and value to the data object.
	}
  return ( mydata ) ; // Return the populated data object.
} // End of createUrlData function definition.


/*
 * Function: createMultipart - Constructs a FormData object for multipart submissions.
 * Essential for sending files along with other form data.
 */
function createMultipart ( )
{
  // Create a new FormData object, which can handle file uploads.
  var data = new FormData ( ) ;

  // Find all input elements that represent actual parameter values.
  var parameters = $ ( "#allparameters" ) . find ( ".realinputvalue" ) ;

  // Loop through each identified parameter input.
	for ( i = 0 ; i < parameters . length ; i ++ )
	{
		name = $ ( parameters ) . eq ( i ) . attr ( "name" ) ; // Extract the 'name' attribute.
		if ( name == undefined || name == "undefined" ) // Ignore parameters without a valid name.
		{
			continue ;
		}
    // Check if the current HTML element is a file input and has files selected.
    if ( parameters [ i ] . files )
    {
      // If it's a file input, append the first selected file to the FormData object.
  	  data . append ( name , parameters [ i ] . files [ 0 ] ) ;
    }
    else
    {
      // Otherwise, append the regular value of the input field.
		  data . append ( name , $ ( parameters ) . eq ( i ) . val ( ) ) ;
    }
	}
  return ( data ) ; // Return the constructed FormData object.
} // End of createMultipart function definition.


/*
 * Function: httpZeroError - Displays a specific error message for HTTP 0 status.
 * This status often indicates network connectivity problems or Cross-Origin Resource Sharing (CORS) issues.
 */
function httpZeroError ( )
{
	$ ( "#errordiv" ) . append ( '<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Oh no!</strong> Javascript returned an HTTP 0 error. One common reason this might happen is that you requested a cross-domain resource from a server that did not include the appropriate CORS headers in the response. Better open up your Firebug...</div>' ) ;
} // End of httpZeroError function definition.