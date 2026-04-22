var    viewportSizeTimeout
   ,    webinspectorOnly = false
   ,    viewportWatching = false
;
/*
 * This function is responsible for displaying and updating
 * the current viewport dimensions on the screen.
 * It creates a temporary DIV element if one doesn't exist,
 * or updates the content of an existing one.
 */
var viewportWatcher = function ()
{

    // Check if the information display division already exists in the document.
    if (document.getElementById('viewportSize'))
    {

        // If it exists, we just need to update its content
        document.getElementById('viewportSize').innerHTML = window.innerWidth + ' x ' + window.innerHeight;

        // Reset the timer for automatic removal of the info div.
        // The div will disappear after a short delay if no further updates occur.
        clearTimeout(viewportSizeTimeout);
        viewportSizeTimeout = setTimeout(  function (  )
        {
            document.getElementById('viewportSize').remove(); // Remove the element
            viewportSizeTimeout = false; // Clear the timeout ID
        }
        , 2000
        )
        ;

    }
    else
    {
        // If the info div does not exist, create a brand new one.
        var infoDiv = document.createElement('div');

        // Set its unique identifier attribute.
        infoDiv.setAttribute('id', 'viewportSize');

        // Apply various CSS styles to position and format the info div.
        infoDiv.style.position = 'fixed';
        infoDiv.style.bottom = '0'; // Position at the bottom edge
        infoDiv.style.right = '0'; // Position at the right edge
        infoDiv.style.zIndex = '99999999'; // Ensure it's on top of other elements
        infoDiv.style.backgroundColor = '#000'; // Black background
        infoDiv.style.color = '#fff'; // White text color
        infoDiv.style.fontFamily = 'Menlo'; // Monospaced font for dimensions
        infoDiv.style.fontSize = '11px';
        infoDiv.style.lineHeight = '20px';
        infoDiv.style.width = '85px';
        infoDiv.style.textAlign = 'center';

        // Finally, append the newly created div to the body of the document.
        document.body.appendChild(infoDiv);
    }
};


// This 'init' function serves as an initial setup routine.
var init = function ()
{

    var enable = true; // By default, enable the viewport watcher.

    // Check if the 'webinspectorOnly' flag is set.
    // If true, the script should only run when a web inspector is likely open.
    if (webinspectorOnly)
    {

        var enable = false; // Temporarily disable, will re-enable if conditions are met.

        // Define minimum dimensions for an embedded Web Inspector.
        var wiWidth = 750; // Minimum width threshold.
        var wiHeight = 312; // Minimum height threshold.

        // Calculate the difference between outer and inner window dimensions.
        // This helps infer if a Web Inspector panel is present.
        var compareWidth = window.outerWidth - window.innerWidth;
        var compareHeight = window.outerHeight - window.innerHeight;

        // If either the width or height difference meets the threshold,
        // it's assumed the Web Inspector is open and the script can be enabled.
        if ( (compareWidth >= wiWidth) || (compareHeight >= wiHeight) )
        {
            enable = true;
        }
    }

    // If the 'enable' flag is true (either by default or after web inspector check),
    // then execute the viewport watcher.
    if (enable)
    {
        viewportWatcher();
    }
};


// Set up an event listener for messages coming from the global script.
safari.self.addEventListener('message', function (e)
{
    // Check if the received message is related to settings.
    if (e.name === 'settings')
    {
        webinspectorOnly = e.message.webinspectorOnly; // Update the 'webinspectorOnly' flag.
        viewportWatching = false; // Reset the watching state.
        // Attach a resize event listener to the window, triggering 'init' on resize.
        viewportWatching = window.addEventListener('resize', init);
    }
}
, false
);

// Request current settings from the global HTML page.
safari.self.tab.dispatchMessage('getSettings');

// Request to be notified about any future settings changes.
safari.self.tab.dispatchMessage('getSettingsChange');