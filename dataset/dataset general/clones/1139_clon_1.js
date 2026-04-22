/*
 * Application Configuration Variables
 * These constants define the base URL, initial view, and window dimensions.
 */
var baseUrl =   "https://my.slack.com"  ; // The base URL for the Slack application.
var view    = "view.html"   ; // The HTML file to be loaded into the window.
var width   = 1100  ; // Desired width of the application window.
var height  = 700   ; // Desired height of the application window.


// This section initializes the Chrome App when it is launched.
// It sets up the primary window for the Slack application.
chrome.app.runtime.onLaunched.addListener(
    function ( ) {

        createWindow(baseUrl); // Call the function to create and configure the main window.

    }
);


/*
 * Function: createWindow
 * -----------------------------------------------------------------------------
 * Creates and configures a new application window.
 *
 * destUrl: The URL to be loaded into the webview within the new window.
 * -----------------------------------------------------------------------------
 */
function createWindow( destUrl ) {

    chrome.app.window.create(
        view, // The path to the HTML file defining the window's content.
        {
            // Define the initial dimensions and positioning of the window.
            bounds: {
                width: width,
                height: height,
                left: Math.round( ( screen.availWidth - width ) / 2 ), // Center horizontally.
                top: Math.round( ( screen.availHeight - height ) / 2 ) // Center vertically.
            },

            // Specify minimum size constraints for the window.
            innerBounds: {
                minWidth: width,
                minHeight: height
            }
        },
        function ( createdWindow ) {
            // Callback function executed once the window has been successfully created.

            createdWindow.contentWindow.onload = function ( ) {

                // Obtain a reference to the webview element embedded within the window's content.
                var webview = createdWindow.contentWindow.document.querySelector ( 'webview' );

                // Attach an event listener to handle window resizing events.
                // This ensures the webview dynamically adjusts its size to match the parent window.
                createdWindow.onBoundsChanged.addListener( function ( ) {

                    var bounds = createdWindow.getBounds(); // Get the current dimensions of the window.

                    webview.style.height = bounds.height; // Apply the new height to the webview.
                    webview.style.width = bounds.width; // Apply the new width to the webview.

                } );

                // Load the specified destination URL into the webview.
                webview.src = destUrl;

                // Add an event listener that triggers when the webview's content has finished loading.
                webview.addEventListener( "contentload", function ( ) {

                    // After content loads, ensure the webview has focus to allow user interaction.
                    webview.focus();

                    // Set up an event handler for when the main application window gains focus.
                    // This re-focuses the webview to maintain interactivity.
                    createdWindow.contentWindow.onfocus = function ( ) {

                        webview.focus(); // Re-focus the webview.

                    };

                } );

                // Handle 'newwindow' events, typically triggered by clicks on external links.
                // This prevents opening external links within the app and instead opens them in the system browser.
                webview.addEventListener( 'newwindow', function ( event ) {

                    event.preventDefault(); // Prevent the default action (opening in the webview).
                    window.open( event.targetUrl ); // Open the link in a new system browser window.

                } );

            };

        }
    );

}