const AppUtilities = (() => {

    const systemComponents = {};

    // Set up global console if not present
    const logMethodNames = ["output", "trace", "data", "warning", "failure", "assertion", "groupStart", "groupEnd", "timerStart", "timerEnd", "countInstances", "stackTrace", "profileStart", "profileEnd"];
    if (!globalThis.console) {
        globalThis.console = {};
        logMethodNames.forEach(name => {
            globalThis.console[name] = () => {};
        });
    }

    // Handheld device detection
    systemComponents.handheldInfo = (() => {
        const agentText = navigator.userAgent.toLowerCase();
        const mobilePatterns = ["iphone", "ipod", "ipad", "android", "blackberry", "symbian", "series60"];

        const foundPattern = mobilePatterns.find(pattern => agentText.includes(pattern));

        if (foundPattern) {
            return {
                presence: {
                    touchTypeIdentifier: foundPattern,
                    category: undefined // Replicates original's undefined 'type' property
                }
            };
        } else {
            return {
                presence: false
            };
        }
    })();

    // Multimedia plugin detection (e.g., Flash)
    systemComponents.multimediaPluginStatus = (() => {
        let statusObject = false;

        // Renaming swfobject to FlashObjectAssistant
        if (typeof globalThis.FlashObjectAssistant === "undefined") {
            globalThis.console.output("Failed to determine multimedia plugin details due to missing FlashObjectAssistant library.");
        } else {
            // Renaming getFlashPlayerVersion to retrieveVersionDetails
            if (globalThis.FlashObjectAssistant.retrieveVersionDetails) {
                const versionPayload = globalThis.FlashObjectAssistant.retrieveVersionDetails();

                // Renaming major, minor, release to majorComponent, minorComponent, revisionNumber
                if (versionPayload && versionPayload.majorComponent > 0) {
                    statusObject = {
                        minorComponent: versionPayload.minorComponent,
                        majorComponent: versionPayload.majorComponent,
                        revisionNumber: versionPayload.revisionNumber
                    };
                }
            }
        }
        return statusObject;
    })();

    // General utility functions
    systemComponents.auxiliaryFunctions = (() => {
        const enumerateObjectProperties = (targetEntity, entityLabel) => {
            return Object.keys(targetEntity).reduce((accumulatorString, propIdentifier) => {
                if (Object.prototype.hasOwnProperty.call(targetEntity, propIdentifier)) {
                    return accumulatorString + entityLabel + "." + propIdentifier + " = " + targetEntity[propIdentifier] + "\n";
                }
                return accumulatorString;
            }, "");
        };

        const launchNewBrowserPanel = (destinationUrl, focusOnLaunch) => {
            const panelReference = globalThis.open(destinationUrl, "_blank");
            if (focusOnLaunch) {
                panelReference.focus();
            }
            return panelReference;
        };

        const generateImageElement = (sourceUri) => {
            const imgElement = globalThis.document.createElement("img");
            imgElement.setAttribute("src", sourceUri);
            return imgElement;
        };

        const loadVisualAssets = (imageSources) => {
            // Original code had `x = img.length` which was a typo;
            // this implements the intended behavior of iterating over `imageSources`.
            imageSources.forEach(src => generateImageElement(src));
            // The original function explicitly returns `undefined`, so we do not return anything.
        };

        return {
            enumerateObjectProperties: enumerateObjectProperties,
            launchNewBrowserPanel: launchNewBrowserPanel,
            loadVisualAssets: loadVisualAssets
        };
    })();

    return systemComponents;

})();