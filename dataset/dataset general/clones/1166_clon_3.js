/*
 * Application URL State Management Module
 *
 * This module provides cross-browser capabilities for managing URL hash changes,
 * particularly for older browsers like Internet Explorer and Safari that
 * require special handling for client-side history navigation.
 *
 * Original concept derived from a jQuery history plugin.
 *
 * License: MIT - freely usable and modifiable.
 *
 * Modified extensively by an expert clone generator for structural and
 * syntactical divergence while maintaining core functionality.
 */

// Define a global namespace for our history management utilities
window.AppHistory = window.AppHistory || {};

// Internal flags for browser detection - simplified for cloning purposes.
// In a real application, these would be determined via user agent sniffing
// or feature detection at runtime.
const isLegacyIE = (navigator.userAgent.includes("MSIE") || navigator.userAgent.includes("Trident"));
const isSafariBrowser = (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome"));


Object.assign(window.AppHistory, {
    // Stores the last known hash value to detect changes
    currentLocationIdentifier: undefined,

    // The user-provided function to call when the URL hash changes
    urlChangeHandler: undefined,

    // Stacks for Safari's unique history management
    previousStates: [],
    futureStates: [],

    // Flag to indicate if this is the very first load in Safari
    isInitialLoad: true,

    // Flag to temporarily disable hash monitoring in Safari after programmatically changing hash
    suppressMonitoring: false,

    /**
     * Initializes the history tracking mechanism.
     * Sets up the necessary browser-specific listeners and initial state.
     * @param {Function} changeCallback - The function to invoke when the URL hash changes.
     */
    initializeTracker: function(changeCallback) {
        if (typeof changeCallback !== 'function') {
            console.error("AppHistory: Initialization failed. A valid callback function is required.");
            return; // Guard clause
        }

        this.urlChangeHandler = changeCallback;
        let initialHash = window.location.hash;

        // Store the current hash. If empty, normalize it for consistency in IE.
        this.currentLocationIdentifier = initialHash || '#';

        if (isLegacyIE) {
            // For Internet Explorer, a hidden iframe is used to track history changes.
            // This iframe helps in overcoming IE's limitations with location.hash.

            const iframeId = 'app-history-frame';
            let historyIframe = document.getElementById(iframeId);

            // Ensure the iframe exists. Create it if not.
            if (!historyIframe) {
                // Using modern DOM creation instead of jQuery string append
                historyIframe = document.createElement('iframe');
                historyIframe.id = iframeId;
                historyIframe.style.display = 'none';
                document.body.appendChild(historyIframe); // Append instead of prepend
            }

            try {
                // Access the iframe's document to manipulate its hash
                const iframeWindow = historyIframe.contentWindow;
                if (iframeWindow && iframeWindow.document) {
                    const iframeDoc = iframeWindow.document;
                    iframeDoc.open();
                    iframeDoc.close();
                    iframeDoc.location.hash = initialHash;
                } else {
                    console.warn("AppHistory: Could not access iframe document for IE history tracking.");
                }
            } catch (e) {
                console.error("AppHistory: Error accessing IE history iframe:", e);
            }
        } else if (isSafariBrowser) {
            // Safari needs custom stack management for back/forward buttons.
            this.previousStates = [];
            this.previousStates.length = history.length; // Pre-fill length to match native history
            this.futureStates = [];
            this.isInitialLoad = true; // Ensure this flag is reset
        }

        // Trigger the callback for the initial hash, stripping the leading '#' if present.
        // Using a more robust string manipulation method.
        this.urlChangeHandler(this.currentLocationIdentifier.startsWith('#') ? this.currentLocationIdentifier.substring(1) : this.currentLocationIdentifier);

        // Periodically check for hash changes across all browsers.
        // Changed interval slightly for Type III.
        setInterval(this.monitorLocationChanges.bind(this), 125);
    },

    /**
     * Adds an entry to the custom history stack for Safari.
     * This method is called internally when `navigateToIdentifier` is invoked.
     * @param {string} targetIdentifier - The hash value to add to the history.
     */
    pushStateEntry: function(targetIdentifier) {
        if (typeof targetIdentifier !== 'string') {
            console.warn("AppHistory: Invalid identifier provided to pushStateEntry.");
            return;
        }
        // Ensure the identifier is clean (without leading #) before pushing to stack
        const cleanIdentifier = targetIdentifier.startsWith('#') ? targetIdentifier.substring(1) : targetIdentifier;
        this.previousStates.push(cleanIdentifier); // Add to the back stack

        this.futureStates.length = 0; // Clear forward stack as a new history entry was made
        this.isInitialLoad = false; // A programmatic change means it's no longer the initial state
    },

    /**
     * Periodically checks the browser's location hash for changes.
     * This is the core polling mechanism.
     */
    monitorLocationChanges: function() {
        if (isLegacyIE) {
            // For IE, we check the hidden iframe's location hash.
            const historyIframe = document.getElementById('app-history-frame');
            if (!historyIframe) {
                console.warn("AppHistory: IE history iframe not found during monitoring.");
                return;
            }

            let iframeHash = '';
            try {
                const iframeDoc = historyIframe.contentDocument || historyIframe.contentWindow.document;
                iframeHash = iframeDoc.location.hash;
            } catch (e) {
                console.error("AppHistory: Error accessing IE iframe hash:", e);
                return;
            }

            if (iframeHash !== this.currentLocationIdentifier) {
                // If iframe hash changed, update main window's hash and notify callback.
                window.location.hash = iframeHash;
                this.currentLocationIdentifier = iframeHash;
                // Remove leading '#' before passing to handler
                this.urlChangeHandler(iframeHash.startsWith('#') ? iframeHash.substring(1) : iframeHash);
            }
        } else if (isSafariBrowser) {
            // Safari requires custom logic to detect native back/forward button presses.
            if (!this.suppressMonitoring) {
                const currentHistoryLength = history.length;
                const stackDifference = currentHistoryLength - this.previousStates.length;

                if (stackDifference !== 0) { // History length changed, implying back/forward navigation
                    this.isInitialLoad = false; // Not initial anymore
                    if (stackDifference < 0) { // User pressed back button
                        // Move items from previousStates to futureStates
                        for (let i = 0; i < Math.abs(stackDifference); i++) {
                            const poppedState = this.previousStates.pop();
                            if (poppedState !== undefined) { // Guard against undefined
                                this.futureStates.unshift(poppedState);
                            }
                        }
                    } else { // User pressed forward button
                        // Move items from futureStates to previousStates
                        for (let i = 0; i < stackDifference; i++) {
                            const shiftedState = this.futureStates.shift();
                            if (shiftedState !== undefined) { // Guard against undefined
                                this.previousStates.push(shiftedState);
                            }
                        }
                    }

                    const retrievedHash = this.previousStates[this.previousStates.length - 1];
                    if (retrievedHash !== undefined) {
                        this.currentLocationIdentifier = window.location.hash; // Update tracker's hash
                        this.urlChangeHandler(retrievedHash); // Notify with the retrieved state
                    } else {
                        // Edge case: history stack might be empty, e.g., navigating past initial page
                        this.urlChangeHandler(''); // Call with empty hash
                    }
                } else if (this.previousStates[this.previousStates.length - 1] === undefined && !this.isInitialLoad) {
                    // This block handles scenarios where Safari's history.length hasn't changed,
                    // but the URL hash might have, or the user navigated to a bookmarked hash.
                    // Check if current URL contains a hash, if so, extract and notify.
                    const currentDocumentUrl = document.URL;
                    if (currentDocumentUrl.includes('#')) {
                        // Extract the hash part
                        const extractedHash = currentDocumentUrl.split('#')[1];
                        this.urlChangeHandler(extractedHash);
                    } else {
                        // No hash in URL, treat as empty hash
                        this.urlChangeHandler('');
                    }
                    this.isInitialLoad = true; // Reset initial load flag after handling this scenario
                }
            }
        } else {
            // For modern browsers, simply compare location.hash.
            const currentBrowserHash = window.location.hash;
            if (currentBrowserHash !== this.currentLocationIdentifier) {
                this.currentLocationIdentifier = currentBrowserHash;
                // Remove leading '#' before passing to handler
                this.urlChangeHandler(currentBrowserHash.startsWith('#') ? currentBrowserHash.substring(1) : currentBrowserHash);
            }
        }
    },

    /**
     * Navigates the browser to a new URL hash.
     * This method handles browser-specific quirks for setting the hash and updating history.
     * @param {string} targetIdentifier - The desired hash value (without leading '#').
     */
    navigateToIdentifier: function(targetIdentifier) {
        if (typeof targetIdentifier !== 'string' || targetIdentifier.trim() === '') {
            console.warn("AppHistory: Cannot navigate to an empty or invalid identifier.");
            // Optionally call handler with empty string or throw error
            // this.urlChangeHandler('');
            return;
        }

        let formattedIdentifier = '#' + targetIdentifier; // Always prepend '#' for browser hash

        if (isSafariBrowser) {
            // Safari needs special handling to prevent immediate re-checking by the monitor.
            this.suppressMonitoring = true;
            this.pushStateEntry(targetIdentifier); // Manually add to Safari's history stack

            // Set a timeout to re-enable monitoring after Safari updates its internal history object.
            // Increased timeout for Type III.
            window.setTimeout(() => {
                this.suppressMonitoring = false;
            }, 250);

            // Execute the callback *before* setting location.hash for Safari,
            // as setting location.hash can halt execution or cause unexpected behavior.
            this.urlChangeHandler(targetIdentifier);

            // N.B. Setting location.hash must be the very last operation for Safari.
            // Using a direct assignment to ensure correct browser behavior.
            window.location.hash = formattedIdentifier;
        } else {
            // For IE and other browsers, directly set the location hash.
            window.location.hash = formattedIdentifier;
            this.currentLocationIdentifier = formattedIdentifier; // Update our tracker
            if (isLegacyIE) {
                // For IE, also update the hidden iframe's hash to keep it in sync.
                const historyIframe = document.getElementById('app-history-frame');
                if (historyIframe) {
                    try {
                        const iframeWindow = historyIframe.contentWindow;
                        if (iframeWindow && iframeWindow.document) {
                            const iframeDoc = iframeWindow.document;
                            iframeDoc.open();
                            iframeDoc.close();
                            iframeDoc.location.hash = formattedIdentifier;
                        }
                    } catch (e) {
                        console.error("AppHistory: Error updating IE iframe hash:", e);
                    }
                }
            }
            // For non-Safari, callback is typically safe after setting hash.
            this.urlChangeHandler(targetIdentifier);
        }
    }
});