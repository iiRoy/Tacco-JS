(function (globalObj, moduleFactory) {
    if ( typeof define === 'function' && define.amd ) {
        define("appLinker", [], function() {
            return moduleFactory(globalObj);
        });
    } else if ( typeof exports === 'object' ) {
        module.exports = moduleFactory(globalObj);
    } else {
        globalObj["appLinker"] = moduleFactory(globalObj);
    }
})(typeof window !== 'undefined' ? window : this, function(contextWindow) {
 
    "use strict";

    // This module requires a DOM and navigator object to function correctly.
    // If not present, we can't proceed.
    if (!contextWindow.document || !contextWindow.navigator) {
        console.warn("AppLinker: Browser environment (document, navigator) not detected. Module will not initialize.");
        return;
    }

    // --- Internal State and Configuration ---
    let pendingTimerId = null; // Stores the ID for our delayed app store redirect
    let activeConfiguration = {}; // Holds the current settings after setup
    const baseConfiguration = { // Default behavior and platform-specific settings
        ios: {
            appId: null, // Apple App Store ID
            appName: null, // App name for the store URL
            customStoreUrl: null // Override for the standard App Store URL
        },
        android: {
            appId: null, // Google Play Store ID (package name)
            customStoreUrl: null // Override for the standard Play Store URL
        },
        shouldFallbackToStore: true, // If true, redirect to app store on deep link failure
        deepLinkDelayMs: 1000, // Time to wait before attempting store redirect
        delayToleranceMs: 500, // Extra buffer for the store redirect check
        currentPlatform: null // Detected platform ('ios', 'android', or null)
    };
    
    const debugOutputEnabled = false; // Set to true for internal console logging

    // Utility function to combine default properties with user-provided options.
    // This is essentially a shallow merge.
    const combineConfigurations = function(baseSettings, userSettings) {
        const combined = {};
        for (const key in baseSettings) {
            if (Object.prototype.hasOwnProperty.call(baseSettings, key)) {
                if (typeof baseSettings[key] === 'object' && baseSettings[key] !== null && !Array.isArray(baseSettings[key]) &&
                    typeof userSettings[key] === 'object' && userSettings[key] !== null && !Array.isArray(userSettings[key])) {
                    // Deep merge for nested objects like 'ios' and 'android'
                    combined[key] = { ...baseSettings[key], ...userSettings[key] };
                } else {
                    combined[key] = userSettings[key] !== undefined ? userSettings[key] : baseSettings[key];
                }
            }
        }
        for (const key in userSettings) {
            if (Object.prototype.hasOwnProperty.call(userSettings, key) && !Object.prototype.hasOwnProperty.call(baseSettings, key)) {
                combined[key] = userSettings[key]; // Add new properties from userSettings
            }
        }
        return combined;
    };

    // --- Platform Detection Utilities ---
    // Checks if the user agent string indicates an Android device.
    const isAndroidDevice = function() {
        return contextWindow.navigator.userAgent.includes('Android');
    };

    // Checks for iOS devices (iPad, iPhone, iPod).
    const isAppleDevice = function() {
        const userAgent = contextWindow.navigator.userAgent;
        return userAgent.includes('iPad') || userAgent.includes('iPhone') || userAgent.includes('iPod');
    };

    // Determines if the current environment is a recognized mobile platform.
    const isMobileEnvironment = function() {
        return isAndroidDevice() || isAppleDevice();
    };

    // --- App Store URL Generation ---
    // Constructs the Apple App Store URL.
    const buildAppleStoreUrl = function() {
        const iosConfig = activeConfiguration.ios;
        if (iosConfig && iosConfig.customStoreUrl) {
            return iosConfig.customStoreUrl;
        }

        const appIdentifier = iosConfig ? iosConfig.appId : null;
        const appDisplayName = iosConfig ? iosConfig.appName : null;

        if (appIdentifier && appDisplayName) {
            return `itms-apps://itunes.apple.com/app/${appDisplayName}/id${appIdentifier}?mt=8`;
        }
        return null;
    };

    // Constructs the Google Play Store URL.
    const buildGooglePlayStoreUrl = function() {
        const androidConfig = activeConfiguration.android;
        if (androidConfig && androidConfig.customStoreUrl) {
            return androidConfig.customStoreUrl;
        }

        const packageId = androidConfig ? androidConfig.appId : null;
        if (packageId) {
            return `market://details?id=${packageId}`;
        }
        return null;
    };

    // Retrieves the appropriate app store link based on the detected platform.
    const getPlatformSpecificStoreLink = function() {
        if (activeConfiguration.currentPlatform === 'ios') {
            return buildAppleStoreUrl();
        } else if (activeConfiguration.currentPlatform === 'android') {
            return buildGooglePlayStoreUrl();
        }
        return null; // No link available for unknown platforms
    };

    // --- Fallback Mechanism ---
    // This function is scheduled to run after a delay if the deep link doesn't open the app.
    // It checks the time elapsed to avoid redirecting the user unexpectedly if they return to the browser later.
    const scheduleStoreRedirect = function(initialInvocationTime) {
        return function() {
            const storeUrl = getPlatformSpecificStoreLink();
            const totalWaitThreshold = activeConfiguration.deepLinkDelayMs + activeConfiguration.delayToleranceMs;
            const timeSinceInvocation = Date.now() - initialInvocationTime;

            if (debugOutputEnabled) {
                console.log(`AppLinker: Checking for store redirect. Time since invocation: ${timeSinceInvocation}ms, Threshold: ${totalWaitThreshold}ms`);
            }

            if (storeUrl && typeof storeUrl === "string" && timeSinceInvocation < totalWaitThreshold) {
                if (debugOutputEnabled) {
                    console.log(`AppLinker: Redirecting to app store: ${storeUrl}`);
                }
                contextWindow.location.href = storeUrl;
            } else if (!storeUrl) {
                if (debugOutputEnabled) {
                    console.warn("AppLinker: No valid app store URL found for fallback.");
                }
            } else if (timeSinceInvocation >= totalWaitThreshold) {
                if (debugOutputEnabled) {
                    console.log("AppLinker: Store redirect cancelled, user likely opened app or returned too late.");
                }
            }
        };
    };

    // --- Public API Functions ---
    // Initializes the deep linker with application-specific settings.
    // This must be called before attempting to open any deep links.
    const initializeLinker = function(userOptions) {
        if (debugOutputEnabled) {
            console.log("AppLinker: Initializing with user options:", userOptions);
        }
        activeConfiguration = combineConfigurations(baseConfiguration, userOptions);

        if (isAndroidDevice()) {
            activeConfiguration.currentPlatform = "android";
        } else if (isAppleDevice()) {
            activeConfiguration.currentPlatform = "ios";
        } else {
            activeConfiguration.currentPlatform = "unknown";
            if (debugOutputEnabled) {
                console.warn("AppLinker: Could not detect a known mobile platform.");
            }
        }
        if (debugOutputEnabled) {
            console.log("AppLinker: Active configuration:", activeConfiguration);
        }
    };

    // Attempts to open a deep link URI.
    // On mobile platforms, it may also schedule a fallback to the app store.
    const attemptDeepLink = function(targetUri) {
        if (!isMobileEnvironment()) {
            if (debugOutputEnabled) {
                console.log("AppLinker: Not a mobile environment, deep linking aborted.");
            }
            return;
        }

        if (!targetUri || typeof targetUri !== 'string') {
            console.error("AppLinker: Invalid or empty deep link URI provided.");
            return;
        }

        let processedUri = targetUri;

        // Special handling for Android Intents (excluding Firefox due to different behavior)
        if (isAndroidDevice() && !contextWindow.navigator.userAgent.includes('Firefox')) {
            const uriPartsMatch = targetUri.match(/([^:]+):\/\/(.+)/i);
            if (uriPartsMatch && uriPartsMatch[1] && uriPartsMatch[2]) {
                const scheme = uriPartsMatch[1];
                const restOfUri = uriPartsMatch[2];
                const androidAppId = activeConfiguration.android.appId;

                if (androidAppId) {
                    processedUri = `intent://${restOfUri}#Intent;scheme=${scheme};package=${androidAppId};end`;
                    if (debugOutputEnabled) {
                        console.log("AppLinker: Transformed URI to Android Intent:", processedUri);
                    }
                } else {
                    console.warn("AppLinker: Android appId not configured for Intent URI. Falling back to original URI.");
                }
            }
        }

        // If fallback is enabled, set a timer to redirect to the app store
        if (activeConfiguration.shouldFallbackToStore) {
            const invocationTime = Date.now();
            pendingTimerId = contextWindow.setTimeout(scheduleStoreRedirect(invocationTime), activeConfiguration.deepLinkDelayMs);
            if (debugOutputEnabled) {
                console.log(`AppLinker: Fallback timer set for ${activeConfiguration.deepLinkDelayMs}ms.`);
            }
        }
        
        // --- Deep Link Activation via Hidden Iframe ---
        // This is a common technique to trigger app launches without leaving the current page.
        const hiddenFrame = contextWindow.document.createElement("iframe");
        hiddenFrame.style.cssText = "display:none; width:1px; height:1px; visibility:hidden;"; // Make it truly invisible
        
        // When the iframe loads, it indicates the deep link attempt has happened.
        // We then clear the fallback timer and remove the iframe.
        hiddenFrame.addEventListener('load', function() {
            if (pendingTimerId) {
                contextWindow.clearTimeout(pendingTimerId);
                pendingTimerId = null;
                if (debugOutputEnabled) {
                    console.log("AppLinker: Fallback timer cleared (iframe loaded).");
                }
            }
            // Ensure the iframe is removed from the DOM
            if (hiddenFrame.parentNode) {
                hiddenFrame.parentNode.removeChild(hiddenFrame);
            }
        });

        // Add a basic error handler for the iframe
        hiddenFrame.addEventListener('error', function(event) {
            console.error("AppLinker: Iframe encountered an error during deep link attempt.", event);
            if (pendingTimerId) { // Clear timer even on error
                contextWindow.clearTimeout(pendingTimerId);
                pendingTimerId = null;
            }
            if (hiddenFrame.parentNode) {
                hiddenFrame.parentNode.removeChild(hiddenFrame);
            }
        });

        // Append the iframe to the document body to trigger navigation.
        // It's important that `document.body` exists at this point.
        if (contextWindow.document.body) {
            contextWindow.document.body.appendChild(hiddenFrame);
            hiddenFrame.src = processedUri; // Setting src triggers the deep link
            if (debugOutputEnabled) {
                console.log("AppLinker: Attempting deep link with URI:", processedUri);
            }
        } else {
            console.error("AppLinker: document.body not available for iframe append. Deep link failed.");
            if (pendingTimerId) { // Clear timer if iframe couldn't be appended
                contextWindow.clearTimeout(pendingTimerId);
                pendingTimerId = null;
            }
        }
        
        // As a final fallback, sometimes directly setting window.location.href works better for certain platforms/browsers
        // This is a non-standard addition to test for better compatibility in some edge cases.
        // However, it will navigate away from the current page immediately, making the iframe approach better for UX.
        // Uncomment with caution and testing:
        // try {
        //     contextWindow.location.href = processedUri;
        //     if (debugOutputEnabled) console.log("AppLinker: Also tried direct window.location.href for deep link.");
        // } catch (e) {
        //     console.error("AppLinker: Direct window.location.href failed for deep link:", e);
        // }
    };

    // Expose the public interface of our module
    return {
        initialize: initializeLinker,
        openLink: attemptDeepLink
    };

});