$.fn.serializeForm = function()
{
    /* This function is designed to extract data from form inputs and compile it into a structured object,
     * mimicking the format typically expected by AJAX post requests.
     * It iterates through various input types to correctly capture their values. */

    var formparams = {}; /* Initialize an empty object to hold the form's key-value pairs. */

    this.each( function() {
        // Process each element in the jQuery selection (typically a form or body).
        // Select all input-like elements, excluding specific types that aren't usually part of data serialization.
        $(":input", this)
            .not('button, input[type=image], input[type=submit], input[type=hidden], input[type=button]')
            .each(function()
            {
                var input = $( this ); /* Cache the current jQuery input element. */

                // Critical check: ensure the input has either an 'id' or 'name' attribute for identification.
                if ( ! input.attr("id") && ! input.attr("name") )
                {
                    console.error( 'Filler error: an input does not have id or name attribute. Skipping' );
                    return true; // Use 'return true' in .each() to continue to the next element.
                }

                var name = input.attr( "id" ); // Attempt to use the 'id' attribute as the primary identifier.
                name = ( name ) ? name : input.attr("name"); // Fallback to 'name' attribute if 'id' is not present or empty.

                var value = input.val(); // Retrieve the current value of the input element.

                if ( ! value )
                {
                    return; // If the input has no value, skip it to avoid adding empty entries.
                }

                var type = input.attr( "type" ); // Get the input's type attribute for conditional processing.

                if ( "checkbox" == type )
                {
                    // For checkboxes, store their checked state as a string "true" or "false".
                    formparams[name] = this.checked ? "true" : "false";
                }
                else if ( "radio" == type )
                {
                    // Radio buttons are only relevant if they are currently checked.
                    if ( this.checked )
                    {
                        formparams[name] = value; // Store the value of the selected radio button.
                    }
                }
                else
                {
                    /* Handle other standard input types (text, number, select, textarea, etc.). */

                    // Ignore elements without a valid name, or those specific to ASP.NET view state.
                    if ( ! name )
                    {
                        return;
                    }

                    if ( name.match( /__.+/ ) ) // Matches names like "__VIEWSTATE", "__EVENTVALIDATION".
                    {
                        return;
                    }

                    // Determine how to store the value:
                    // If this is the first value for this name, assign it directly.
                    if ( formparams[name] === undefined )
                    {
                        formparams[name] = value;
                    }
                    else
                    {
                        // If a value already exists (e.g., for multi-selects), append the new value with a comma.
                        formparams[name] += "," + value;
                    }
                }
            }); // End of inner .each() for inputs.
    }); // End of outer .each() for selected elements.

    return formparams; // Return the final object containing all serialized form data.
};


/* This segment sets up a listener for messages originating from other parts of the Chrome extension,
 * such as background scripts or popups. It dispatches actions based on the 'request.action' field. */
chrome.runtime.onMessage.addListener( function ( request, sender, sendResponse )
{
    // First, check if the browser supports HTML5 localStorage, which is crucial for this extension's functionality.
    if ( typeof( localStorage ) == 'undefined' )
    {
        alert( "WebFormFiller: Your browser does not support HTML5 local storage feature. This extension will not work without this feature." );
        return; // Abort if localStorage is not available.
    }

    // Use a switch statement to handle different message actions efficiently.
    switch ( request.action )
    {
        case 'store':
            // Action to serialize the current form data and store it.
            try
            {
                var inputs = $( 'body' ).serializeForm(); // Call the custom serialization function.
                sendResponse( { content: JSON.stringify( inputs ) } ); // Send the JSON stringified data back.
            }
            catch ( e )
            {
                // Catch any errors during serialization and report them.
                sendResponse( { error: true, message: e.message } );
            }
            break; // Terminate the 'store' case.

        case 'fill':
            // Action to populate the form fields based on provided settings.
            fillForm( request.setSettings ); // Invoke the form filling utility function.
            sendResponse( {} ); // Send an empty response to acknowledge receipt.
            break; // Terminate the 'fill' case.

        case 'rebind':
            // Action to re-establish keyboard shortcuts.
            bindHotkeys(); // Call the hotkey binding function.
            break; // Terminate the 'rebind' case.
    }
} );


// Execute the hotkey binding process immediately when the script loads into the page.
bindHotkeys( );


/* This function is responsible for setting up and binding keyboard shortcuts (hotkeys)
 * using the Mousetrap library. It fetches hotkey configurations from the extension's
 * background script. */
function bindHotkeys()
{
    // Send a message to the Chrome runtime to request the configured hotkeys for the current URL.
    chrome.runtime.sendMessage( { "action": "gethotkeys", url: location.href }, function ( hotkeys )
    {
        console.debug( 'Bind hotkeys ' + hotkeys ); // Log which hotkeys are being bound for debugging purposes.

        Mousetrap.reset( ); // Clear any previously defined Mousetrap bindings to prevent conflicts.
        Mousetrap.bind( hotkeys, function ( e, code )
        {
            // When a bound hotkey is pressed, send a message back to the runtime to trigger its associated action.
            chrome.runtime.sendMessage( { "action": "hotkey", code: code, url: location.href }, function ( setSettings )
            {
                if ( ! setSettings )
                {
                    alert( 'Hotkey not found' ); // Inform the user if no settings are found for the pressed hotkey.
                }

                fillForm( setSettings ); // Proceed to fill the form using the retrieved settings.
            } );

            return false; // Crucially, return false to prevent the browser's default action for the hotkey.
        } );
    } );
}


/* This utility function takes a set of form-filling settings and applies them to the current page's form.
 * It also handles optional automatic form submission. */
function fillForm( setSettings )
{
    // Use the custom 'deserialize' jQuery plugin to populate form fields from the provided content.
    $( 'body' )
        .deserialize( JSON.parse( setSettings.content ) ); // Parse the JSON string content before deserialization.

    // Check if the auto-submit feature is enabled in the settings.
    if ( setSettings.autoSubmit )
    {
        try
        {
            // Attempt to find the submit button using the provided jQuery selector.
            var submitButton = $( setSettings.submitQuery );
            if ( submitButton.length )
            {
                submitButton.click( ); // Programmatically click the submit button if found.
            }
            else
            {
                alert( 'Submit button query returned no results' ); // Notify if the submit button could not be located.
            }
        }
        catch ( e )
        {
            // Catch and report any errors that occur during the submit button query or click.
            alert( 'Error in submit query:' + e.message );
        }
    }
}