// Application Configuration Parameters
const APP_MAIN_URL = "https://my.slack.com"; // Primary URL for the application's initial content
const DISPLAY_LAYOUT_FILE = "view.html";    // HTML file defining the structure of the application window
const DEFAULT_WINDOW_WIDTH = 1100;         // Standard width for the application window in pixels
const DEFAULT_WINDOW_HEIGHT = 700;         // Standard height for the application window in pixels

// Utility function to compute the central coordinate for a given dimension
const calculateCenterPosition = (availableSpace, itemDimension) => Math.floor((availableSpace - itemDimension) / 2);

// Chrome App lifecycle hook: executed when the application is launched by the user
chrome.app.runtime.onLaunched.addListener(() => {
    console.log("Application launch event detected. Proceeding to initialize main window...");
    openApplicationShell(APP_MAIN_URL); // Call the function to construct and display the main app window
});

/**
 * Establishes and presents a new Chrome application window with a webview component.
 * @param {string} targetContentUrl The URL that the embedded webview should navigate to.
 */
function openApplicationShell(targetContentUrl) {
    // Implement a basic guard clause for the provided URL
    if (!targetContentUrl || typeof targetContentUrl !== 'string' || !targetContentUrl.startsWith('http')) {
        console.error("Invalid or empty target content URL provided. Window creation aborted.");
        return;
    }

    // Retrieve available screen dimensions for precise window placement
    const screenAvailableWidth = screen.availWidth;
    const screenAvailableHeight = screen.availHeight;

    // Determine the optimal left and top positions to center the window
    const windowLeftPosition = calculateCenterPosition(screenAvailableWidth, DEFAULT_WINDOW_WIDTH);
    const windowTopPosition = calculateCenterPosition(screenAvailableHeight, DEFAULT_WINDOW_HEIGHT);

    // Command Chrome to create a new application window instance
    chrome.app.window.create(
        DISPLAY_LAYOUT_FILE, {
            // Define the initial physical properties and location of the window
            bounds: {
                width: DEFAULT_WINDOW_WIDTH,
                height: DEFAULT_WINDOW_HEIGHT,
                left: windowLeftPosition,
                top: windowTopPosition
            },
            // Specify additional window features
            resizable: true, // Allow the user to resize the window
            frame: 'chrome', // Use the standard Chrome app window frame
            singleton: true // Ensure only one instance of this window exists
        },
        (appWindowInstance) => {
            // Check if the window creation was successful
            if (!appWindowInstance) {
                console.error("Critical: Failed to obtain an application window instance.");
                return;
            }
            console.info("Application window instance successfully created.");

            // Attach an event listener to the window's content document once it has loaded
            appWindowInstance.contentWindow.addEventListener('load', () => {
                // Query the document to find the embedded webview element
                const embeddedContentHost = appWindowInstance.contentWindow.document.querySelector('webview');

                // Validate that the webview element was found
                if (!embeddedContentHost) {
                    console.error("Fatal: The 'webview' element could not be located in the display layout.");
                    return;
                }
                console.info("Embedded webview element identified within the window.");

                // Register a listener for when the parent window's dimensions change
                appWindowInstance.onBoundsChanged.addListener(() => {
                    const currentBounds = appWindowInstance.getBounds();
                    // Dynamically adjust the webview's size to match the new window dimensions
                    Object.assign(embeddedContentHost.style, {
                        height: `${currentBounds.height}px`, // Explicitly add 'px' unit
                        width: `${currentBounds.width}px`   // Explicitly add 'px' unit
                    });
                    console.debug(`Window bounds updated. Webview resized to ${currentBounds.width}x${currentBounds.height}.`);
                });

                // Set the source URL for the webview to load its content
                embeddedContentHost.src = targetContentUrl;

                // Configure event handling for when the webview finishes loading its internal content
                embeddedContentHost.addEventListener("contentload", () => {
                    embeddedContentHost.focus(); // Direct keyboard focus to the webview for interaction
                    console.log("Webview content has finished loading and is now focused.");

                    // Re-focus the webview whenever the application window itself gains focus
                    appWindowInstance.contentWindow.onfocus = () => {
                        embeddedContentHost.focus();
                        console.debug("Application window re-focused; re-applying focus to webview.");
                    };
                });

                // Implement a custom handler for new window requests originating from the webview
                embeddedContentHost.addEventListener('newwindow', (eventData) => {
                    const requestedExternalUrl = eventData.targetUrl;
                    // Prevent the webview from handling the new window event internally
                    eventData.preventDefault();

                    // Perform a basic check before attempting to open the URL
                    if (requestedExternalUrl && requestedExternalUrl.startsWith('http')) {
                        console.warn(`External navigation detected: ${requestedExternalUrl}. Opening in an external browser window.`);
                        // Use the Chrome App API to open the URL in a new system window
                        chrome.app.window.open(requestedExternalUrl);
                    } else {
                        console.warn(`Attempted to open an invalid or non-HTTP external link: ${requestedExternalUrl}. Action blocked.`);
                    }
                });
            }, { once: true }); // Ensure this load listener executes only once
        }
    );
}