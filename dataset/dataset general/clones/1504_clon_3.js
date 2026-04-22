let SystemKit = (function(externalDependency) {
    'use strict'; // Enforce stricter parsing and error handling

    // Private collection for internal use, not directly exposed
    const internalRegistry = {};

    /*
     * Core Logging Utility
     * Ensures a basic console implementation exists across environments.
     */
    if (typeof globalThis.console === 'undefined' || !globalThis.console.log) {
        (function() {
            const loggerMethods = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
                "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
            globalThis.console = {}; // Initialize a bare-bones console object
            for (let methodKey of loggerMethods) {
                globalThis.console[methodKey] = function() { /* no-op function */ };
            }
            // Add a simple fallback for table if not present
            if (!globalThis.console.table) {
                globalThis.console.table = function(data) {
                    globalThis.console.log('Table (fallback):', data);
                };
            }
        }());
        globalThis.console.info("SystemKit: Basic console polyfill activated.");
    }

    /*
     * Device Capability Assessment
     * Determines user agent characteristics for mobile and touch interaction.
     */
    internalRegistry.deviceAssessment = (() => {
        const defaultDeviceProps = {
            isMobile: false,
            supportsTouch: false,
            touchFlavor: null, // Specific identifier for touch device
            systemType: 'desktop' // Default to desktop
        };

        if (typeof navigator === 'undefined' || !navigator.userAgent) {
            globalThis.console.warn("Device detection skipped: Navigator object not available.");
            return defaultDeviceProps;
        }

        const agentString = navigator.userAgent.toLowerCase();
        const mobileIdentifiers = {
            'iphone': 'iOS Phone',
            'ipod': 'iOS iPod',
            'ipad': 'iOS Tablet',
            'android': 'Android Device',
            'blackberry': 'BlackBerry Device',
            'symbian': 'Symbian OS',
            'series60': 'Nokia S60'
        };

        let currentDetection = { ...defaultDeviceProps
        }; // Spread for a mutable copy

        // Check for general mobile keywords first
        const generalMobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|rim)|plucker|pocket|psp|series(40|60)|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
        const tabletRegex = /android|ipad|playbook|silk/i;

        if (generalMobileRegex.test(agentString) || (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))) {
            currentDetection.isMobile = true;
            currentDetection.supportsTouch = true; // Assume touch for general mobile
            currentDetection.systemType = tabletRegex.test(agentString) ? 'tablet' : 'mobile';

            // Refine touchFlavor based on specific identifiers
            for (const [key, description] of Object.entries(mobileIdentifiers)) {
                if (agentString.includes(key)) {
                    currentDetection.touchFlavor = description;
                    break;
                }
            }
        }

        return currentDetection;
    })();

    /*
     * Flash Player Status
     * Checks for Flash plugin availability and version.
     */
    internalRegistry.flashPlugin = (() => {
        const noFlashDetails = {
            isAvailable: false,
            majorVersion: 0,
            minorVersion: 0,
            revisionNumber: 0
        };

        // Check if swfobject, our primary Flash detection library, is present
        if (typeof swfobject === "undefined" || !swfobject.getFlashPlayerVersion) {
            globalThis.console.warn("Flash detection: SWFObject library or its version method is missing. Cannot reliably detect Flash.");
            // Fallback for very old IE, less reliable for modern browsers
            if (window.ActiveXObject) {
                try {
                    new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    globalThis.console.info("Flash detection: ActiveXObject found, Flash might be present.");
                    return { ...noFlashDetails,
                        isAvailable: true
                    };
                } catch (e) {
                    // No Flash ActiveX
                }
            }
            return noFlashDetails;
        }

        try {
            const versionInfo = swfobject.getFlashPlayerVersion();

            if (versionInfo && versionInfo.major > 0) {
                return {
                    isAvailable: true,
                    majorVersion: versionInfo.major,
                    minorVersion: versionInfo.minor,
                    revisionNumber: versionInfo.release
                };
            }
        } catch (error) {
            globalThis.console.error("Flash detection: Error calling swfobject.getFlashPlayerVersion:", error);
        }

        return noFlashDetails;
    })();

    /*
     * General Purpose Utility Functions
     * A collection of helpful methods for common tasks.
     */
    internalRegistry.generalUtilities = (() => {

        /**
         * Inspects an object's enumerable properties and returns a formatted string.
         * @param {object} subject - The object to inspect.
         * @param {string} [label='Object'] - A label for the object in the output.
         * @returns {string} A string representation of the object's properties.
         */
        const enumerateObjectProperties = (subject, label = 'Object') => {
            if (typeof subject !== 'object' || subject === null) {
                return `Cannot enumerate properties for non-object type: ${typeof subject}`;
            }
            let outputLines = [];
            outputLines.push(`--- Properties of ${label} ---`);
            try {
                for (const key in subject) {
                    // Ensure it's an own property to avoid prototype chain issues
                    if (Object.prototype.hasOwnProperty.call(subject, key)) {
                        let value = subject[key];
                        // Truncate long string values for readability
                        if (typeof value === 'string' && value.length > 100) {
                            value = value.substring(0, 97) + '...';
                        }
                        outputLines.push(`${label}.${key} = ${value}`);
                    }
                }
            } catch (e) {
                globalThis.console.error(`Error enumerating properties for ${label}:`, e);
                outputLines.push(`(Error during enumeration: ${e.message})`);
            }
            outputLines.push('--------------------------');
            return outputLines.join('\n');
        };

        /**
         * Opens a new browser window or tab.
         * @param {string} destinationURL - The URL to open.
         * @param {boolean} [bringToFront=false] - Whether to bring the new window to focus.
         * @param {string} [windowName='_blank'] - Name of the window (e.g., '_blank', '_self', or custom).
         * @returns {Window | null} Reference to the new window object, or null if it failed.
         */
        const launchNewWindow = (destinationURL, bringToFront = false, windowName = '_blank') => {
            if (!destinationURL || typeof destinationURL !== 'string') {
                globalThis.console.error("Invalid URL provided to launchNewWindow.");
                return null;
            }
            try {
                // Use a more robust set of window features
                const features = 'width=800,height=600,resizable=yes,scrollbars=yes,status=yes';
                const newWin = window.open(destinationURL, windowName, features);
                if (newWin) {
                    if (bringToFront) {
                        newWin.focus();
                    }
                    // Add security best practices for _blank targets
                    if (windowName === '_blank') {
                        newWin.opener = null;
                        newWin.rel = 'noopener noreferrer';
                    }
                } else {
                    globalThis.console.warn(`Failed to open new window for URL: ${destinationURL}. It might have been blocked by a pop-up blocker.`);
                }
                return newWin;
            } catch (error) {
                globalThis.console.error(`An error occurred while trying to open a new window: ${error}`);
                return null;
            }
        };

        /**
         * Creates an HTML image element.
         * @param {string} imageSource - The URL of the image.
         * @param {string} [altText=''] - Alternative text for the image.
         * @returns {HTMLImageElement} The created image element.
         */
        const createDOMImageElement = (imageSource, altText = '') => {
            const imgElement = document.createElement("img");
            imgElement.setAttribute("src", imageSource);
            imgElement.setAttribute("alt", altText);
            imgElement.setAttribute("loading", "lazy"); // Optimize image loading
            return imgElement;
        };

        /**
         * Preloads an array of image URLs by creating Image objects in memory.
         * Returns a Promise that resolves when all images are loaded or rejects if any fail.
         * @param {string[]} imageUrls - An array of image source strings.
         * @returns {Promise<HTMLImageElement[]>} A promise resolving with an array of loaded image elements.
         */
        const primeImageCache = (imageUrls) => {
            if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
                globalThis.console.warn("No image URLs provided for preloading.");
                return Promise.resolve([]);
            }

            const imageLoadPromises = imageUrls.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image(); // Use native Image object for pure preloading
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        globalThis.console.error(`Failed to preload image: ${src}`);
                        reject(new Error(`Failed to load image: ${src}`));
                    };
                    img.src = src;
                });
            });

            return Promise.all(imageLoadPromises);
        };

        return {
            enumerateObjectProperties: enumerateObjectProperties,
            launchNewWindow: launchNewWindow,
            primeImageCache: primeImageCache,
            // Expose the internal image builder if needed for other DOM operations
            _buildImageElement: createDOMImageElement
        };
    })();

    // The public interface of our SystemKit module
    return {
        deviceInfo: internalRegistry.deviceAssessment,
        flashPlayer: internalRegistry.flashPlugin,
        utilityFunctions: internalRegistry.generalUtilities
    };

}(jQuery)); // Assuming jQuery or a similar library might be passed, though not strictly used in this clone.