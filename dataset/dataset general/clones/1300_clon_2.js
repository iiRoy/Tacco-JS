/* This script processes the current browser's URL to determine if it points to a
 * GitHub Gist, GitHub repository, or a direct .ipynb file link,
 * and then constructs a new URL to open it in a notebook viewer.
 */

// Initialize a timestamp for unique window naming
let currentMoment = new Date ( ) ;

// Define the base URL for the notebook display service
const baseViewerAddress = 'http://nbviewer.ipython.org/';

// Variable to hold the constructed target resource location, initially null
let targetResourceLocation = null;

// Regular expression to identify GitHub Gist URLs
// It captures the unique Gist ID.
const gistPattern = /^https?:\/\/gist\.github\.com\/(?:\w+\/)?([a-f0-9]+)$/;

// Regular expression to identify GitHub repository .ipynb file URLs
// It captures the repository path and the file path.
const gitHubPattern = /^https:\/\/(github\.com\/.*\/)blob\/(.*\.ipynb)$/;

// Regular expression for direct HTTPS links to .ipynb files
// It captures the entire path after https://
const secureHttpPattern = /^https:\/\/(.*\.ipynb)$/;

// Regular expression for direct HTTP links to .ipynb files
// It captures the entire path after http://
const insecureHttpPattern = /^http:\/\/(.*\.ipynb)$/;

// Retrieve the current page's full URL
const currentPageAddress = location.href;

// Evaluate the current page address against known patterns
if ( gistPattern . test ( currentPageAddress ) ) {
    // If it's a Gist URL, extract the Gist identifier
    const gistMatch = gistPattern . exec ( currentPageAddress );
    // Construct the viewer URL for the Gist
    targetResourceLocation = baseViewerAddress + gistMatch [ 1 ];
} else if ( gitHubPattern . test ( currentPageAddress ) ) {
    // If it's a GitHub repository blob URL, extract path components
    const addressComponents = gitHubPattern . exec ( currentPageAddress );
    // Construct the viewer URL using raw GitHub content
    targetResourceLocation = baseViewerAddress + 'urls/raw.' + addressComponents [ 1 ] + addressComponents [ 2 ];
} else if ( secureHttpPattern . test ( currentPageAddress ) ) {
    // If it's a direct HTTPS link to an .ipynb file
    const addressComponents = secureHttpPattern . exec ( currentPageAddress );
    // Construct the viewer URL for the HTTPS resource
    targetResourceLocation = baseViewerAddress + 'urls/' + addressComponents [ 1 ];
} else if ( insecureHttpPattern . test ( currentPageAddress ) ) {
    // If it's a direct HTTP link to an .ipynb file
    const addressComponents = insecureHttpPattern . exec ( currentPageAddress );
    // Construct the viewer URL for the HTTP resource
    targetResourceLocation = baseViewerAddress + 'url/' + addressComponents [ 1 ];
}

// If a target resource location was successfully determined, open it in a new window
if ( targetResourceLocation ) {
    // Use void operator to suppress return value, open a new browser tab/window
    void ( window . open ( targetResourceLocation , 'notebookDisplay' + currentMoment . getTime ( ) ) );
}