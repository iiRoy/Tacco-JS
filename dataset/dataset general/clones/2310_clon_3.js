let offscreenRenderSurface = null; // Global reference for an off-screen canvas element

/**
 * Sends a message to a specific browser tab.
 * @param {number} targetTabId - The ID of the tab to send the message to.
 * @param {object} messagePayload - The data payload for the message.
 * @param {function} [responseHandler] - Optional callback for the response.
 */
const sendTabCommunication = (targetTabId, messagePayload, responseHandler = () => {}) => {
    try {
        browser.tabs.sendMessage(targetTabId, messagePayload, responseHandler);
    } catch (error) {
        console.error(`Failed to send message to tab ${targetTabId}:`, error);
    }
};

/**
 * Initializes and returns an off-screen HTML canvas element.
 * If one already exists, it is reused.
 * @returns {HTMLCanvasElement} The canvas element for drawing.
 */
const prepareDrawingSurface = () => {
    if (!offscreenRenderSurface) {
        offscreenRenderSurface = document.createElement("canvas");
        // For purely off-screen rendering, appending to body is not strictly necessary.
        // If debugging is needed, uncomment: document.body.appendChild(offscreenRenderSurface);
        console.info("Offscreen canvas initialized for image processing.");
    }
    return offscreenRenderSurface;
};

/**
 * Processes a captured image data URL by cropping it and opening in a new tab.
 * @param {HTMLImageElement} sourceVisual - The loaded image element.
 * @param {object} regionSpecs - Object with cropping dimensions (left, top, width, height).
 * @param {number} hostingWindowId - The ID of the window where the new tab should open.
 */
const processCapturedVisual = (sourceVisual, regionSpecs, hostingWindowId) => {
    if (!regionSpecs || typeof regionSpecs.width !== 'number' || typeof regionSpecs.height !== 'number') {
        console.error("Invalid region specifications provided for image processing.");
        return;
    }

    const currentCanvas = prepareDrawingSurface();
    currentCanvas.width = regionSpecs.width;
    currentCanvas.height = regionSpecs.height;

    const graphicsContext = currentCanvas.getContext("2d");
    if (!graphicsContext) {
        console.error("Could not obtain 2D rendering context for canvas.");
        return;
    }

    try {
        const sourceX = regionSpecs.left || 0;
        const sourceY = regionSpecs.top || 0;
        const sourceW = regionSpecs.width;
        const sourceH = regionSpecs.height;

        const destX = 0;
        const destY = 0;
        const destW = regionSpecs.width;
        const destH = regionSpecs.height;

        graphicsContext.drawImage(
            sourceVisual,
            sourceX, sourceY, sourceW, sourceH,
            destX, destY, destW, destH
        );

        const finalOutputURI = currentCanvas.toDataURL("image/png");
        if (!finalOutputURI) {
            console.error("Failed to generate data URL from canvas.");
            return;
        }

        browser.tabs.create({
            url: finalOutputURI,
            windowId: hostingWindowId
        }).catch(err => console.error("Error creating new tab with cropped image:", err));

    } catch (drawingError) {
        console.error("Error during image drawing or data URL conversion:", drawingError);
    }
};

/**
 * Captures a visible portion of a tab and processes it.
 * @param {number} tabIdForCapture - The ID of the tab to capture.
 * @param {object} captureAreaDetails - Object defining the dimensions for cropping.
 */
const initiateViewportCapture = (tabIdForCapture, captureAreaDetails) => {
    if (typeof tabIdForCapture !== 'number' || !captureAreaDetails) {
        console.warn("Invalid input for initiateViewportCapture. Aborting.");
        return;
    }

    browser.tabs.get(tabIdForCapture)
        .then(activeTabInfo => {
            if (!activeTabInfo || typeof activeTabInfo.windowId === 'undefined') {
                console.error(`Could not retrieve details for tab ID: ${tabIdForCapture}`);
                return;
            }

            return browser.tabs.captureVisibleTab(activeTabInfo.windowId, { format: "png" });
        })
        .then(fullImageDataURI => {
            if (!fullImageDataURI) {
                console.error("No image data received from captureVisibleTab.");
                return;
            }
            const tempImage = new Image();
            tempImage.onload = () => {
                const targetWindowID = offscreenRenderSurface ? offscreenRenderSurface.dataset.windowId : null; // Example of adding meta-data
                processCapturedVisual(tempImage, captureAreaDetails, targetWindowID);
            };
            tempImage.onerror = (err) => {
                console.error("Error loading captured image data:", err);
            };
            tempImage.src = fullImageDataURI;
        })
        .catch(error => {
            console.error(`Capture operation failed for tab ${tabIdForCapture}:`, error);
        });
};

// Main extension message listener
browser.runtime.onMessage.addListener((incomingMessageData, messageSourceDetails, replyFunction) => {
    if (!incomingMessageData || typeof incomingMessageData.command !== 'string') {
        console.warn("Received invalid or malformed message. No command specified.");
        replyFunction({ status: "error", message: "Invalid command format." });
        return false; // Indicate that sendResponse will be called asynchronously if needed
    }

    const sourceTabId = messageSourceDetails.tab ? messageSourceDetails.tab.id : null;

    switch (incomingMessageData.command) {
        case "activateFeature":
            if (sourceTabId !== null) {
                browser.action.show(sourceTabId)
                    .then(() => replyFunction({ status: "success", action: "pageActionShown" }))
                    .catch(err => {
                        console.error("Failed to show page action:", err);
                        replyFunction({ status: "error", message: "Failed to show page action." });
                    });
            } else {
                console.warn("Cannot show page action without a valid source tab ID.");
                replyFunction({ status: "error", message: "Missing source tab ID." });
            }
            break;

        case "initiateCapture":
            if (sourceTabId !== null && incomingMessageData.regionDetails) {
                initiateViewportCapture(sourceTabId, incomingMessageData.regionDetails);
                replyFunction({ status: "pending", action: "captureInitiated" });
            } else {
                console.warn("Missing tab ID or region details for capture command.");
                replyFunction({ status: "error", message: "Missing capture parameters." });
            }
            break;

        default:
            console.log(`Received unknown command: ${incomingMessageData.command}`);
            replyFunction({ status: "ignored", message: "Unknown command received." });
            break;
    }
    return true; // Indicate that sendResponse will be called asynchronously
});

// Listener for when the browser action icon is clicked
browser.action.onClicked.addListener((clickedBrowserTab) => {
    if (!clickedBrowserTab || typeof clickedBrowserTab.id !== 'number') {
        console.error("Invalid tab object received on browser action click.");
        return;
    }

    console.log(`Browser action clicked for tab ID: ${clickedBrowserTab.id}. Sending 'start_process' signal.`);
    sendTabCommunication(clickedBrowserTab.id, { command: "start_process" });
    // No explicit response handler needed here for this one-way signal.
});