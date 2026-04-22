const svgImageExporter = (() => {
    "use strict";

    // --- Internal Configuration and Utility Constants ---
    const IMAGE_FORMAT_PNG = "image/png";
    const SVG_IDENTIFIER_PREFIX = "#";
    const DEFAULT_DOWNLOAD_FILE_NAME = "exported_svg_image.png";

    /**
     * Retrieves an SVG HTMLElement from a given reference, which can be an ID string or the element itself.
     * Includes validation and error logging for robustness.
     * @param {string|HTMLElement} sourceReference - The ID string (with or without '#') or the direct SVG element.
     * @returns {HTMLElement|null} The located SVG element, or null if not found or invalid.
     */
    const _obtainSvgElement = (sourceReference) => {
        if (!sourceReference) {
            console.error("SVG source reference is undefined or null. Cannot proceed.");
            return null;
        }

        if (typeof sourceReference === "string") {
            const cleanId = sourceReference.startsWith(SVG_IDENTIFIER_PREFIX)
                ? sourceReference.substring(1)
                : sourceReference;
            const targetElement = document.getElementById(cleanId);
            if (!targetElement) {
                console.error(`SVG element with ID '${cleanId}' was not found in the document.`);
            }
            return targetElement;
        } else if (sourceReference instanceof HTMLElement) {
            return sourceReference;
        } else {
            console.error("Invalid SVG source reference type. Expected string (ID) or HTMLElement.");
            return null;
        }
    };

    /**
     * Transforms an XML DOM node into its equivalent string representation.
     * Leverages standard browser XML serialization capabilities.
     * @param {Node} xmlDomNode - The XML DOM node to be converted to a string.
     * @returns {string} The serialized XML string, or an empty string if serialization fails.
     */
    const _serializeNodeToText = (xmlDomNode) => {
        if (!xmlDomNode) {
            console.warn("Attempted to serialize a non-existent XML DOM node.");
            return "";
        }
        try {
            if (typeof window.XMLSerializer !== "undefined") {
                const domSerializer = new window.XMLSerializer();
                return domSerializer.serializeToString(xmlDomNode);
            }
            // The original code included xmlNode.xml which is an extremely outdated IE-specific property.
            // For a Type III clone, this legacy path is removed as modern browsers universally support XMLSerializer.
            console.warn("XMLSerializer API is unavailable. XML node serialization cannot be performed.");
            return "";
        } catch (serializationError) {
            console.error("An error occurred during XML node serialization:", serializationError);
            return "";
        }
    };

    /**
     * Renders an SVG source (element or ID) onto a dynamically created HTML canvas element.
     * @param {string|HTMLElement} svgInput - The SVG element ID or the SVG element itself.
     * @param {object} [renderingOptions={}] - Configuration parameters for the `canvg` rendering process.
     * @param {function(HTMLCanvasElement|null): void} onRenderComplete - Callback function invoked upon rendering completion.
     */
    const _renderSvgToCanvasElement = (svgInput, renderingOptions = {}, onRenderComplete) => {
        if (typeof window.canvg === "undefined") {
            console.error("The 'canvg' library is not loaded. SVG to canvas rendering is impossible.");
            return onRenderComplete(null);
        }
        if (typeof onRenderComplete !== "function") {
            console.error("A valid callback function is mandatory for SVG canvas rendering completion.");
            return;
        }

        const resolvedSvgElement = _obtainSvgElement(svgInput);
        if (!resolvedSvgElement) {
            return onRenderComplete(null); // SVG element not found or invalid.
        }

        // Dynamically create an off-screen canvas for rendering.
        const targetCanvas = document.createElement("canvas");
        const elementDimensions = resolvedSvgElement.getBoundingClientRect(); // More accurate dimensions.
        targetCanvas.setAttribute("height", elementDimensions.height);
        targetCanvas.setAttribute("width", elementDimensions.width);

        const svgMarkupText = _serializeNodeToText(resolvedSvgElement);
        if (!svgMarkupText) {
            console.error("Failed to convert the SVG element into an XML string for rendering.");
            return onRenderComplete(null);
        }

        // Define default rendering options for canvg, then merge with user-provided.
        const baseCanvgSettings = {
            ignoreMouse: true,      // Suppress mouse events during rendering.
            ignoreAnimation: true,  // Halt any SVG animations.
            scaleHeight: 1,         // Default scaling factors.
            scaleWidth: 1,
            // Additional canvg options could be added here for future flexibility.
        };

        const mergedCanvgSettings = {
            ...baseCanvgSettings,
            ...renderingOptions,
            renderCallback: () => {
                onRenderComplete(targetCanvas); // Invoke callback once rendering is done.
            }
        };

        try {
            window.canvg(targetCanvas, svgMarkupText, mergedCanvgSettings);
        } catch (renderingError) {
            console.error("An error occurred during SVG rendering with canvg:", renderingError);
            onRenderComplete(null);
        }
    };

    /**
     * Converts a rendered SVG canvas into a PNG data URL.
     * @param {string|HTMLElement} svgSourceIdOrElem - The SVG element ID or the SVG element itself.
     * @param {object} [conversionConfig={}] - Options passed to the canvas rendering function.
     * @param {function(string|null, HTMLCanvasElement|null): void} dataUrlCallback - Callback receiving the data URL and the canvas element.
     */
    const _generatePngDataUrl = (svgSourceIdOrElem, conversionConfig = {}, dataUrlCallback) => {
        if (typeof dataUrlCallback !== "function") {
            console.error("A valid data URL callback function is required for PNG data URL generation.");
            return;
        }

        _renderSvgToCanvasElement(svgSourceIdOrElem, conversionConfig, (generatedCanvas) => {
            if (generatedCanvas) {
                try {
                    const pngDataUri = generatedCanvas.toDataURL(IMAGE_FORMAT_PNG);
                    dataUrlCallback(pngDataUri, generatedCanvas);
                } catch (dataUrlConversionError) {
                    console.error("Failed to convert canvas to PNG data URL:", dataUrlConversionError);
                    dataUrlCallback(null, generatedCanvas); // Still pass canvas even on data URL error.
                }
            } else {
                dataUrlCallback(null, null); // Canvas generation failed.
            }
        });
    };

    /**
     * Initiates a programmatic file download in the browser.
     * Handles modern 'download' attribute, IE's 'msSaveBlob', and provides a fallback.
     * @param {object} downloadPayload - Object containing necessary data for download.
     * @param {string} downloadPayload.dataUri - The data URI of the file to be downloaded.
     * @param {HTMLCanvasElement} [downloadPayload.canvasElement] - The canvas element, required for IE's msSaveBlob.
     * @param {string} [downloadPayload.outputFileName=DEFAULT_DOWNLOAD_FILE_NAME] - The desired name for the downloaded file.
     */
    const _performFileDownload = (downloadPayload) => {
        if (!downloadPayload || !downloadPayload.dataUri) {
            console.error("Download payload or data URI is missing. Cannot initiate download.");
            return;
        }

        const downloadAnchor = document.createElement("a");
        const finalFileName = downloadPayload.outputFileName || DEFAULT_DOWNLOAD_FILE_NAME;

        // Preferred method: Using the 'download' attribute (supported by Chrome, Firefox, Edge, etc.)
        if (downloadAnchor.download !== undefined) {
            downloadAnchor.href = downloadPayload.dataUri;
            downloadAnchor.download = finalFileName;
            document.body.appendChild(downloadAnchor); // Temporarily append to DOM for click dispatch.
            _dispatchSimulatedClick(downloadAnchor);
            document.body.removeChild(downloadAnchor); // Clean up the temporary anchor.
            return;
        }

        // Fallback for Internet Explorer 10+ using msSaveBlob.
        if (window.navigator && window.navigator.msSaveBlob && downloadPayload.canvasElement) {
            downloadPayload.canvasElement.toBlob((imageBlob) => {
                if (imageBlob) {
                    window.navigator.msSaveBlob(imageBlob, finalFileName);
                } else {
                    console.error("Failed to generate blob from canvas for IE download.");
                }
            }, IMAGE_FORMAT_PNG);
            return;
        }

        // General fallback: Open data URI in a new browser tab.
        // This might not prompt a download but will display the image.
        console.warn("No direct download mechanism found. Opening image in a new tab as a fallback.");
        window.open(downloadPayload.dataUri, '_blank');
    };

    /**
     * Dispatches a synthetic click event on a target HTML element.
     * Useful for programmatically triggering actions like file downloads.
     * @param {HTMLElement} targetHtmlElement - The element on which to simulate a click.
     * @returns {boolean} True if the event was dispatched, false otherwise or on error.
     */
    const _dispatchSimulatedClick = (targetHtmlElement) => {
        if (!targetHtmlElement || !(targetHtmlElement instanceof HTMLElement)) {
            console.error("Cannot dispatch click event on an invalid HTML element.");
            return false;
        }

        let dispatchSuccessful = false;
        try {
            // Modern, standard way to create and dispatch events.
            const syntheticMouseEvent = new MouseEvent("click", {
                bubbles: true,      // Event bubbles up through the DOM tree.
                cancelable: true,   // Event can be cancelled.
                view: window,       // The window object.
                // clientX, clientY, screenX, screenY, etc. can be omitted for simple programmatic clicks.
            });
            dispatchSuccessful = targetHtmlElement.dispatchEvent(syntheticMouseEvent);
        } catch (modernEventError) {
            console.warn("Modern MouseEvent creation failed, attempting legacy method:", modernEventError);
            // Fallback for older browsers that might not support `new MouseEvent()`.
            try {
                const legacyMouseEvent = document.createEvent("MouseEvents");
                // initMouseEvent is deprecated, but included for extreme compatibility.
                legacyMouseEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                dispatchSuccessful = targetHtmlElement.dispatchEvent(legacyMouseEvent);
            } catch (legacyEventError) {
                console.error("Both modern and legacy click event dispatch methods failed:", legacyEventError);
            }
        }
        return dispatchSuccessful;
    };

    /**
     * Public entry point to save an SVG element as a PNG image file.
     * @param {string|HTMLElement} svgReference - The ID of the SVG element or the SVG element itself.
     * @param {object} [exportConfiguration={}] - Options for the export, including `fileName` (or `name` for compatibility).
     */
    const _initiateSvgPngDownload = (svgReference, exportConfiguration = {}) => {
        const finalExportConfig = {
            outputFileName: exportConfiguration.fileName || exportConfiguration.name || DEFAULT_DOWNLOAD_FILE_NAME,
            ...exportConfiguration // Merge any other rendering options.
        };

        _generatePngDataUrl(svgReference, finalExportConfig, (imageDataUrl, generatedCanvas) => {
            if (imageDataUrl) {
                _performFileDownload({
                    dataUri: imageDataUrl,
                    canvasElement: generatedCanvas,
                    outputFileName: finalExportConfig.outputFileName
                });
            } else {
                console.error("Image data could not be generated for download.");
            }
        });
    };

    // --- Public API Exposure ---
    return {
        saveSvgAsPng: _initiateSvgPngDownload,
        svgToCanvasElement: _renderSvgToCanvasElement,
        svgToPngDataURL: _generatePngDataUrl
    };
})();