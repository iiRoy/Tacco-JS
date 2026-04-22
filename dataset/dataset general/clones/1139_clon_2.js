// Application configuration values
const mainUrlAddress = "https://my.company.net";
const displayPage = "interface_layout.html";
const canvasWidth = 1100;
const canvasHeight = 700;

// Initialize the application window on launch
chrome.app.runtime.onLaunched.addListener( function ( ) {
    generateDisplay(mainUrlAddress);
} );

function generateDisplay( targetAddress ) {
    chrome.app.window.create(
        displayPage,
        {
            // Define the size and initial position of the new window, ensuring it is centered
            bounds: {
                width: canvasWidth,
                height: canvasHeight,
                left: Math.round( ( screen.availWidth - canvasWidth ) / 2 ),
                top: Math.round( ( screen.availHeight - canvasHeight ) / 2 )
            },
            // Set the minimum possible dimensions for the application window
            innerBounds: {
                minWidth: canvasWidth,
                minHeight: canvasHeight
            }
        },
        function ( freshlyOpenedWindow ) {
            freshlyOpenedWindow.contentWindow.onload = function ( ) {
                // Obtain a reference to the embedded web content area
                let pageViewer = freshlyOpenedWindow.contentWindow.document.querySelector('webview');

                // Attach an event listener to dynamically resize the webview when the parent window's bounds change
                freshlyOpenedWindow.onBoundsChanged.addListener( function ( ) {
                    let geomInfo = freshlyOpenedWindow.getBounds();
                    pageViewer.style.height = geomInfo.height;
                    pageViewer.style.width = geomInfo.width;
                } );

                // Load the specified URL into the webview component
                pageViewer.src = targetAddress;

                // Configure an event handler for when the webview's content has finished loading
                pageViewer.addEventListener("contentload", function ( ) {
                    // Ensure the webview element receives focus for user interaction
                    pageViewer.focus();

                    // When the main window regains focus, ensure the webview also receives focus
                    freshlyOpenedWindow.contentWindow.onfocus = function ( ) {
                        pageViewer.focus();
                    };
                } );

                // Implement an event listener for requests to open new windows from within the webview
                pageViewer.addEventListener('newwindow', function ( actionEvt ) {
                    // Prevent the default behavior of the new window request
                    actionEvt.preventDefault();
                    // Open the requested link in a new standard browser window
                    window.open( actionEvt.targetUrl );
                } );
            };
        }
    );
}