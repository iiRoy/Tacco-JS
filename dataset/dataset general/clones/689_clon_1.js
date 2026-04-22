var         currentSiteSettings;    /* This variable will hold our application's site settings globally. */

/**
 *  Retrieves the saved site definitions from the browser's local storage.
 *  If no settings are found, it returns null.
 *  @returns An Array of Objects, where each object defines a site.
 *           Each site object typically contains { URL:String, headers:[ {name:String, value:String} ] }.
 */
function retrieveSiteSettings ( )
{
    var siteSettings = localStorage [ 'corsSites' ];

    // Check if any settings were found in local storage.
    if ( ! siteSettings )
    {
        return null;
    }

    // Parse the JSON string back into a JavaScript object/array.
    return JSON.parse ( siteSettings );
}



/**
 *  Stores the provided settings into the extension's local storage area.
 *  This overwrites any previously saved settings.
 *  @param settings An Array of Objects, each representing a site configuration.
 *                  The expected structure is Array of { URL:String, headers:[ {name:String, value:String} ] }.
 */
function storeSiteSettings( settings )
{
    localStorage[ 'corsSites' ] = JSON.stringify( settings );
}


/**
 *  Displays the headers for a given site item within the settings table.
 *  It dynamically generates table rows for each header and makes them editable.
 *  @param item An Object representing a single site, expected to have { URL:String, headers:[ {name:String, value:String} ] }.
 *  @param tableBody A jQuery reference to the tbody HTML element where the header rows will be inserted.
 */
function populateHeadersTable( item, tableBody )
{
    // Clear any existing content in the table body first.
    tableBody.empty();

    // If no item is provided, there's nothing to display.
    if ( ! item )
        return;

    // If the item has no headers array, also nothing to display for headers.
    if ( ! item.headers )
        return;

    // This function generates a click handler for making table cells editable.
    // It captures the specific 'header' object and 'prop' (property name) to bind to.
    var clickFunctionGenerator = function ( header, prop )
    {
        return function ( event )
        {
            var target = $( event.target ), // The clicked TD element.
                input = $( '<input type="text"/>' ).val( target.text() ), // An input field pre-filled with current text.
                saveBtn = $( '<button class="btn">Save</button>' ), // A save button for the edit.
                saveFunc = function ( ) // Function to handle saving the edited value.
                {
                    // Unbind event listeners to prevent memory leaks or multiple bindings.
                    saveBtn.unbind();
                    input.unbind();

                    // Capture the new value from the input field.
                    header[ prop ] = $( input ).val();

                    // Return the field to its non-editing display state.
                    target.html( header[ prop ] );
                };


            // Bind the save function to the click event of the save button.
            saveBtn.bind( 'click', saveFunc );
            // Also allow saving when the 'Enter' key is pressed in the input field.
            input.bind( 'keydown', function ( e )
            {
                if ( e.which == 13 )
                    saveFunc();
            } );

            // Replace the cell's content with the input field and save button.
            target.html( input ).append( saveBtn );
            // Automatically focus on the input field for immediate typing.
            input.focus();
        }; // End of returned click handler function.
    }; // End of clickFunctionGenerator.

    /**
     *  Creates a <tr> element suitable for injection into the header settings table.
     *  Each row will contain two editable <td> elements for header name and value.
     *  @param header {Object} An object like {name:String, value:String}.
     *  @returns A jQuery reference to the newly created <tr> node.
     */
    var generateHeaderTR = function ( header )
    {
        var tr = $( '<tr></tr>' ),
            name = $( '<td></td>' ).text( header.name ),
            value = $( '<td></td>' ).text( header.value );

        // Bind the click event on each of the fields to enable in-place editing.
        name.bind( 'click', clickFunctionGenerator( header, 'name' ) );
        value.bind( 'click', clickFunctionGenerator( header, 'value' ) );

        tr.append( name );
        tr.append( value );
        return tr;
    };


    // Iterate through the item's headers and append each generated <tr> to the table body.
    for ( var i = 0, l = item.headers.length; i < l; i++ )
    {
        tableBody.append( generateHeaderTR( item.headers[ i ] ) );
    }


    // When the "add header" button is clicked:
    // Add a new empty header setting to the array, and then render this new entry in the table.
    var addHeaderBtn = $( '.addHeader' );
    addHeaderBtn.unbind(); // Remove any previous bindings to prevent multiple executions.
    addHeaderBtn.bind( 'click', function ( )
    {
        item.headers.push( {name:'', value:''} ); // Add a new blank header object.
        var tr = generateHeaderTR( item.headers[ item.headers.length - 1 ] ); // Generate TR for the new header.
        tableBody.append( tr ); // Append the new row to the table.

        tr.find( 'td' ).first().click(); // Immediately trigger edit mode on the first cell of the new row.
    } );

} // End of populateHeadersTable function.


/**
 *  Handles the 'change' event fired from the URL selection dropdown box.
 *  It updates the displayed headers based on the newly selected URL.
 *  @param event The jQuery event object associated with the change.
 */
function urlSelectionChanged( event )
{
    // Determine the selected item's index and retrieve the corresponding site settings.
    var item = currentSiteSettings[ $( event.target ).find( 'option:selected' ).index() ];
    // Populate the headers table using the retrieved item and the target tbody element.
    populateHeadersTable( item, $( '#headersTable' ).find( 'tbody' ) );
}


function renderSelectOptions( )
{
    // Initialize the URL selector element.
    var urlSelect = $( '#activeURL' );
    urlSelect.unbind(); // Remove previous event handlers.
    urlSelect.empty(); // Clear existing options.


    // Populate the select dropdown with all currently tracked URLs from currentSiteSettings.
    for ( var i = 0, l = currentSiteSettings.length; i < l; i++ )
    {
        // Create an <option> element for each URL.
        var item = $( '<option></option>' ).attr( 'value', i ).text( currentSiteSettings[ i ].URL );
        if ( i == 0 )
        {
            item.attr( "selected", "selected" ); // Select the first item by default.
        }

        urlSelect.append( item ); // Add the option to the select box.
    }

    urlSelect.bind( 'change', urlSelectionChanged ); // Bind the change handler.
    urlSelect.change(); // Trigger the change handler immediately to display headers for the first item.
    return urlSelect; // Return the jQuery object for further use.
}


// This block runs once the entire DOM is ready for interaction.
$( document ).ready( function ( )
{
    // Check local storage for any existing URL settings; if none, initialize with an empty array.
    currentSiteSettings = retrieveSiteSettings() || [ ];

    // Render the URL selection dropdown.
    var urlSelect = renderSelectOptions();


    // Allow the user to add new URLs to manage.
    var addURLForm = $( '#addNewURLForm' );
    addURLForm.bind( 'submit', function ( )
    {
        // Create a new, blank rule set based on user input.
        var $input = $( '#newURL' ),
            newRule = {
                URL: $input.val(),
                headers: [ ]
            };
        currentSiteSettings.push( newRule ); // Add the new rule to our settings array.


        // Add a new option to the URL select dropdown for the newly added rule.
        urlSelect.append( $( '<option></option>' ).attr( 'value', currentSiteSettings.length - 1 ).text( newRule.URL ) );

        // Make the newly added option the selected one.
        urlSelect.find( 'option' ).attr( 'selected', false ).last().attr( 'selected', true );

        // Trigger the change handler to update the displayed headers for the new URL.
        urlSelect.change();

        // Clear the input field where the new URL was entered.
       $input.val( '' );

        // Automatically click the 'add header' button to prompt the user to add headers for the new URL.
        $( '.addHeader' ).click();

        return false; // Prevent default form submission.
    } );


    // Initially hide all alert messages (success/error).
    $( '.alert' ).hide();


    // Check to see if the user wants to display the intercept count badge.
    var displayCountCB = $( '#displayCount' ),
        displayCount = localStorage[ 'displayInterceptCount' ];

        // Attempt to parse the stored value, defaulting to true if parsing fails or value is missing.
        try {
         displayCount = JSON.parse( displayCount );
        }catch( e ){
         displayCount = true;
        }

        // Set the checkbox state based on the retrieved/default value.
        displayCountCB.attr( 'checked', displayCount ? 'checked' : null );


    // Enable the "Save All Settings" button.
    var saveBtn = $( '#saveAll' );
    saveBtn.bind( 'click', storeAndAlert );


    // Enable the "Delete All Settings" button.
    var delAll = $( '#deleteAll' );
    delAll.bind( 'click', function ( )
    {
        currentSiteSettings = [ ]; // Clear all settings.
        storeAndAlert(); // Save the empty settings and show alert.
        renderSelectOptions(); // Re-render the select box (now empty).
    } );


    // Enable the "Delete Selected Site" button.
    var delSel = $( '#deleteSelected' );
    delSel.bind( 'click', function ( )
    {
        var index = urlSelect.find( 'option:selected' ).val(); // Get the index of the selected URL.
        currentSiteSettings.splice( index, 1 ); // Remove the site from the array.
        storeAndAlert(); // Save changes and show alert.
        renderSelectOptions(); // Re-render the select box to reflect the deletion.
    } );

    // Import/Export functionality for settings.
    var exportModal = $( '#exportModal' );
    exportModal.on( 'show', function ( )
    {
        var modal = $( this ),
            ta = modal.find( 'textarea' ), // The textarea for JSON.
            cg = modal.find( '.control-group' ), // Used for error styling.
            submit = modal.find( '.btn-primary' ), // The submit button in the modal.
            errMsg = modal.find( '.help-inline' ); // Error message display.

        // Populate the textarea with the current settings in a formatted JSON string.
        ta.text( FormatJSON( currentSiteSettings ) );

        submit.bind( 'click', function ( )
        {
            cg.removeClass( 'error' ); // Clear previous error styling.
            errMsg.hide(); // Hide previous error messages.

            // Asynchronously load validation modules (assuming 'require' is available).
            require( [ 'validate', 'dataSchema' ], function ( validate, schema )
            {
                try
                {
                    var value = JSON.parse( ta.val() ); // Attempt to parse user-entered JSON.
                    var validation = validate( value, schema ); // Validate against a schema.

                    if ( validation.valid )
                    {
                        currentSiteSettings = value; // Update settings if valid.
                        modal.modal( 'hide' ); // Close the modal.
                        storeAndAlert(); // Save and alert.
                    }
                    else
                    {
                        // Construct an error message from validation errors.
                        var msg = "Encountered errors parsing your JSON:<ul>";
                        for ( var i = 0, l = validation.errors.length; i < l; i++ )
                        {
                            msg += "<li>" + validation.errors[ i ].property +" "+ validation.errors[ i ].message +"</li>";
                        }
                        msg += "</ul>";

                        errMsg.html( msg ); // Display error messages.
                        errMsg.show();
                        cg.addClass( 'error' ); // Apply error styling.
                    }
                }
                catch( e )
                {
                    // Handle general JSON parsing errors.
                    errMsg.text( 'Unable to parse the input as JSON: ' + e.toString() );
                    errMsg.show();
                    cg.addClass( 'error' );
                }
            } ); // End of require callback.

        } ); // End of submit button click handler.
    } ).on( 'hide', function ( )
    {
        var modal = $( this ),
            submit = modal.find( '.btn-primary' );
        submit.unbind(); // Unbind click handler when modal hides to prevent re-binding.
    } ); // End of exportModal event handlers.
} ); // End of $(document).ready.


/**
 *  Stores the current application settings and provides user feedback
 *  via success or error alerts in the UI.
 */
function storeAndAlert ( )
{
    var successAlert = $( '.alert-success' ),
        errorAlert = $( '.alert-error' );
    try
    {
        storeSiteSettings( currentSiteSettings ); // Save the main site settings.
        // Also save the state of the 'display intercept count' checkbox.
        localStorage[ 'displayInterceptCount' ] = $( '#displayCount' ).attr( 'checked' ) === 'checked';

        // Send a request to the Chrome extension background page to update.
        chrome.extension.sendRequest( 'update', function ( )
        {
            renderSelectOptions(); // Re-render the URL select box after saving.
            successAlert.show(); // Show success message.
            successAlert.fadeOut( 2500 ); // Fade out after 2.5 seconds.
        } );


    }
    catch ( e )
    {
        errorAlert.text( 'An error occurred: ' + e.toString() ); // Display specific error message.
        errorAlert.show(); // Show error message.
        errorAlert.fadeOut( 5000 ); // Fade out after 5 seconds.
    }
}