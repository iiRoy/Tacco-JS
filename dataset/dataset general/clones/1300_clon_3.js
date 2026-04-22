// This script dynamically generates a URL for an IPython/Jupyter notebook viewer
// based on the current browser's location, then opens it in a new tab.

(function executeNotebookViewerRedirection() {
    // Acquire the current moment for unique window naming.
    const operationTimestamp = new Date().getTime();

    // Define the base components for the viewer's URL.
    const viewerProtocol = 'http://';
    const viewerDomain = 'nbviewer.ipython.org/';
    const baseViewerAddress = `${viewerProtocol}${viewerDomain}`;

    // Initialize the destination link.
    let finalViewerLink = null;

    // Retrieve the full URL from the browser's address bar.
    const currentBrowserLocation = window.location.href;

    // Early exit if the location is not available or empty.
    if (!currentBrowserLocation || currentBrowserLocation.length === 0) {
        console.warn("Current browser location is unavailable or empty. Cannot proceed with redirection.");
        return;
    }

    // Define regular expressions for different source URL patterns.
    // Each pattern has a 'type' for later processing and the regex itself.
    const urlPatterns = [
        {
            type: 'gist',
            regex: /^https?:\/\/gist\.github\.com\/(?:\w+\/)?([a-f0-9]+)$/,
            pathPrefix: '' // Gist IDs are directly appended
        },
        {
            type: 'githubBlob',
            regex: /^https:\/\/(github\.com\/.*\/)blob\/(.*\.ipynb)$/,
            pathPrefix: 'urls/raw.' // GitHub blobs need 'urls/raw.'
        },
        {
            type: 'secureNotebook',
            regex: /^https:\/\/(.*\.ipynb)$/,
            pathPrefix: 'urls/' // Generic HTTPS notebooks need 'urls/'
        },
        {
            type: 'insecureNotebook',
            regex: /^http:\/\/(.*\.ipynb)$/,
            pathPrefix: 'url/' // Generic HTTP notebooks need 'url/' (note the singular 'url')
        }
    ];

    // Iterate through the defined patterns to find a match.
    for (const patternDef of urlPatterns) {
        const matchResult = patternDef.regex.exec(currentBrowserLocation);

        if (matchResult) {
            console.log(`Matched URL pattern: ${patternDef.type}`);
            switch (patternDef.type) {
                case 'gist':
                    // For Gist, the ID is the first captured group.
                    finalViewerLink = `${baseViewerAddress}${matchResult[1]}`;
                    break;
                case 'githubBlob':
                    // For GitHub, concatenate base path with two captured groups.
                    finalViewerLink = `${baseViewerAddress}${patternDef.pathPrefix}${matchResult[1]}${matchResult[2]}`;
                    break;
                case 'secureNotebook':
                case 'insecureNotebook':
                    // For generic notebooks, append the captured path directly.
                    finalViewerLink = `${baseViewerAddress}${patternDef.pathPrefix}${matchResult[1]}`;
                    break;
                default:
                    console.error(`Unknown pattern type encountered: ${patternDef.type}`);
                    break;
            }
            // Once a match is found and processed, exit the loop.
            break;
        }
    }

    // If a valid viewer link was constructed, open it in a new window.
    if (finalViewerLink) {
        // Prepare window name for uniqueness and debugging.
        const newWindowName = `nbviewer_session_${operationTimestamp}`;
        window.open(finalViewerLink, newWindowName, 'noopener,noreferrer');
        console.info(`Opened new viewer window: ${finalViewerLink}`);
    } else {
        console.info("No matching URL pattern found for the current location. No viewer window opened.");
    }

})(); // End of IIFE