// This script serves as the background service worker for the browser extension.
// It orchestrates various functionalities, including message handling and image processing.

// --- Section 1: Message Listener for Inter-Component Communication ---
/*
 * Attaches a listener to the extension's message channel.
 * This function processes messages sent from content scripts or other extension parts.
 *
 * @param {object} incomingMsg          The data payload received in the message.
 * @param {object} sourceInfo           Details about the message's origin, including the sender's tab.
 * @param {function} postReply          A callback function to send a response back to the message sender.
 */
chrome.extension.onMessage.addListener(function(incomingMsg, sourceInfo, postReply)
{
    // Evaluate the type of action requested in the incoming message.
    if (incomingMsg.actionType === "activate_ui")
    {
        // If the message requests UI activation, show the page action icon for the originating tab.
        chrome.pageAction.show(sourceInfo.tab.id);
    }
    else if (incomingMsg.actionType === "perform_capture")
    {
        // If a capture operation is requested, initiate the screenshot process.
        // It uses the tab ID and the specified boundary coordinates.
        executeCapture(sourceInfo.tab.id, incomingMsg.captureArea);
    }

    // Acknowledge the message by sending an empty response.
    postReply({});

    /**
     * Helper function to dispatch a message to a specific tab.
     * This is used for sending commands or data back to content scripts.
     *
     * @param {object} messagePayload     The data object to be transmitted.
     */
    function transmitMessage(messagePayload)
    {
        // Send the payload to the tab from which the original message was received.
        chrome.tabs.sendMessage(sourceInfo.tab.id, messagePayload, function(callbackResponse) {
            // The callback response from the content script is currently ignored.
        });
    }
});


// --- Section 2: Page Action Button Click Handler ---
/*
 * Sets up a listener for clicks on the extension's page action icon in the browser toolbar.
 *
 * @param {object} activeTab         The tab object where the page action was clicked.
 */
chrome.pageAction.onClicked.addListener(function handlePageActionButtonClick(activeTab)
{
    // When the page action button is clicked, send a message to the content script
    // in the active tab to initiate a specific workflow (e.g., start selection).
    chrome.tabs.sendMessage(activeTab.id, { command: "initiate_workflow" }, function(callbackResponse) {
        // No specific handling for the response from the content script is implemented here.
    });
});


// --- Section 3: Image Capture and Processing Logic ---
// Declares a global variable to store a reference to the offscreen canvas element.
// This canvas is reused for image manipulation to optimize performance.
var offscreenCanvas = null;

/*
 * Initiates and executes the process of capturing a visible portion of a browser tab.
 * It crops the captured image and opens it in a new tab.
 *
 * @param {number} targetTabID       The unique identifier of the browser tab to be captured.
 * @param {object} captureBounds     An object specifying the rectangular region to capture,
 *                                   including left, top, width, and height values.
 */
function executeCapture(targetTabID, captureBounds)
{
    // First, retrieve detailed information about the target tab.
    chrome.tabs.get(targetTabID, function(retrievedTabInfo)
    {
        // Capture the currently visible area of the tab as a PNG image Data URL.
        chrome.tabs.captureVisibleTab(retrievedTabInfo.windowId, { format: "png" }, function(base64ImageData)
        {
            // If the offscreen canvas has not been created yet, create it and append it to the document body.
            if (!offscreenCanvas)
            {
                offscreenCanvas = document.createElement("canvas");
                document.body.appendChild(offscreenCanvas); // Important for some environments, though often off-DOM for efficiency.
            }

            // Create a new HTML Image element to load the captured base64 data.
            var tempImageElement = new Image();

            // Define the callback function to execute once the image has successfully loaded.
            tempImageElement.onload = function()
            {
                // Set the dimensions of the offscreen canvas to match the desired cropped area.
                offscreenCanvas.width = captureBounds.widthVal;
                offscreenCanvas.height = captureBounds.heightVal;

                // Obtain the 2D rendering context for drawing on the canvas.
                var canvasContext = offscreenCanvas.getContext("2d");

                // Draw the loaded image onto the canvas, applying the specified crop.
                canvasContext.drawImage(tempImageElement,
                    captureBounds.leftCoord, captureBounds.topCoord,   // Source X, Y (top-left corner of the crop region)
                    captureBounds.widthVal, captureBounds.heightVal,   // Source Width, Height (dimensions of the crop region)
                    0, 0,                                            // Destination X, Y (top-left corner on the canvas)
                    captureBounds.widthVal, captureBounds.heightVal    // Destination Width, Height (how much of the canvas to fill)
                );

                // Convert the content of the cropped canvas back into a new PNG Data URL.
                var finalCroppedImageURL = offscreenCanvas.toDataURL("image/png");

                // Open a new browser tab, displaying the generated cropped image.
                chrome.tabs.create({
                    url: finalCroppedImageURL,
                    windowId: retrievedTabInfo.windowId // Open in the same window as the source tab.
                });
            };

            // Assign the captured base64 image data to the source of the Image element,
            // which triggers the 'onload' event once the image data is parsed.
            tempImageElement.src = base64ImageData;
        });
    });
}