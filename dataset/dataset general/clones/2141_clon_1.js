function reloadStyles()
{
    // Clear all previously added content style sheets to ensure a fresh start.
    safari.extension.removeContentStyleSheets();

    // Iterate through each entry stored in the styleStorage object.
    styleStorage.each(function( key, data )
    {
        // Only proceed if the current style entry is explicitly marked as enabled.
        if ( data.enabled )
        {
            // Extract style content and sanitize domain rules.
            var styles = data.styles,
                domains = sanitizeRules( data.domains ),     // Process inclusion domains.
                excludes = sanitizeRules( data.excludes );   // Process exclusion domains.

            // Add the extension's base URI to the exclusion list to prevent self-styling issues.
            excludes.push( safari.extension.baseURI + '*' );

            // Add the content style sheet to Safari with the specified rules.
            safari.extension.addContentStyleSheet( styles, domains, excludes );
        }
    }); // End of styleStorage.each iteration.
}


function sanitizeRules( domains )
{
    /*
     * This utility function standardizes domain strings for use with Safari's
     * content style sheet API, primarily by ensuring correct trailing slashes
     * or wildcards for directory matching.
     * It also addresses a historical Safari 5 URL parsing quirk.
     */
    var result = [];

    // Loop through the input array of domains from the end to the beginning.
    for ( var i = domains.length - 1; i >= 0; i-- )
    {
        var domain = domains[ i ];

        // Only process non-empty domain strings.
        if ( domain !== '' )
        {
            /*
             * Check if the domain string is missing a trailing slash or wildcard
             * after the protocol and host part.
             * This pattern matches 'http://domain/' or 'https://domain/'.
             */
            if ( domain.search( /https?:\/\/(.*)\// ) == -1 )
            {
                if ( domain.substr( -1 ) == '*' )
                {
                    // If the domain ends with a '*', ensure it's formatted as '/*' for directory wildcard.
                    domain = domain.substr( 0, domain.length - 1 ) + '/*';
                }
                else
                {
                    // Otherwise, append a trailing slash to indicate a directory.
                    domain = domain + '/';
                }
            }
            result.push( domain ); // Add the processed domain to the result array.
        }
    }
    return result; // Return the array of sanitized domain rules.
}


function handleCommand( event )
{
    // A switch statement to handle different commands triggered by the user or system.
    switch ( event.command )
    {
    case 'manage-user-css':
        // Define the URL for the user interface to manage custom CSS.
        var manageURL = safari.extension.baseURI + 'manage/manage.html',
            currentWindow = safari.application.activeBrowserWindow, // Get the currently focused browser window.
            currentTab = currentWindow.activeTab;                   // Get the active tab within that window.

        // If the current tab's URL is empty (e.g., a new tab page), navigate it directly.
        if ( currentTab.url === "" )
        {
            currentTab.url = manageURL;
        }
        else
        {
            // Otherwise, open the management page in a new foreground tab.
            currentWindow.openTab( 'foreground' ).url = manageURL;
        }
        break; // End of 'manage-user-css' command handling.

    default:
        // Default case for any commands not explicitly handled.
        break;
    }
}


function handleMessage( event )
{
    // This function acts as a central handler for messages received from content scripts or other parts of the extension.
    switch ( event.name )
    {
    case 'reloadStyles':
        // When a 'reloadStyles' message is received, trigger the style reloading process.
        reloadStyles();
        break;

    case 'getItem':
        // Retrieve a specific item from the styleStorage using the message content as the key.
        var item = styleStorage.getItem( event.message );
        // Dispatch the retrieved item back to the sender page, along with the original key.
        event.target.page.dispatchMessage( 'getItem', [ event.message, item ] );
        break;

    case 'removeItem':
        // Remove an item from styleStorage identified by the message content.
        styleStorage.removeItem( event.message );
        break;

    case 'setItem':
        // Set an item in styleStorage using the key and value provided in the message array.
        styleStorage.setItem( event.message[ 0 ], event.message[ 1 ] );
        break;

    case 'items':
        // Initialize an array to store all items from styleStorage.
        var items = [];
        // Iterate through each item in styleStorage and add its key and data to the 'items' array.
        styleStorage.each( function( key, data )
        {
            items.push( { 'key': key, 'data': data } );
        } );
        // Dispatch the complete list of items back to the sender page.
        event.target.page.dispatchMessage( 'items', items );
        break;

    case 'shouldConvert':
        // Check if the browser's localStorage is currently empty.
        if ( localStorage.length === 0 )
        {
            // If empty, dispatch a message indicating a potential need for data conversion.
            event.target.page.dispatchMessage( 'shouldConvert', true );
            break;
        }
    // Intentionally fall through if localStorage is not empty, or for other unhandled messages.
    default:
        // Default case for any messages that do not match the above cases.
        break;
    }
}


function handleValidate( event )
{
    // This function is responsible for validating and enabling/disabling UI elements.
    switch ( event.target.identifier )
    {
    case 'ManageUserCssItem':
        // Set the disabled state of the 'Manage User CSS' menu item based on user settings.
        event.target.disabled = !safari.extension.settings.enableContextMenu;
        break;
    default:
        // Default case for validation events targeting other identifiers.
        break;
    }
}

// Add event listeners to the Safari application object for various interactions.
// Listener for command events, typically from toolbar buttons or context menus.
safari.application.addEventListener( 'command', handleCommand, false );
// Listener for message events, often used for communication between content scripts and the global page.
safari.application.addEventListener( 'message', handleMessage, false );
// Listener for validate events, used to determine the enabled/disabled state of UI elements.
safari.application.addEventListener( 'validate', handleValidate, false );

// Perform an initial loading of styles when the extension starts up or is reloaded.
reloadStyles();