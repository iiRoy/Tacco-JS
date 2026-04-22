var WebToolkit = (function() {
    var wt = function(elementSelector) {
        var collectedElements = [];
        if (typeof elementSelector === 'string') {
            if (elementSelector.charAt(0) === '#') {
                var foundElement = document.getElementById(elementSelector.substring(1));
                if (foundElement) collectedElements.push(foundElement);
            } else {
                collectedElements = Array.prototype.slice.call(document.querySelectorAll(elementSelector));
            }
        } else if (elementSelector instanceof HTMLElement) {
            collectedElements.push(elementSelector);
        }

        // This object mimics a basic jQuery-like interface for the operations required.
        return {
            length: collectedElements.length,
            0: collectedElements[0], // Direct access to the first DOM element
            // Provides a method equivalent to jQuery's .size()
            size: function() {
                return this.length;
            },
            // Provides a method equivalent to jQuery's .prepend()
            prepend: function(htmlContent) {
                collectedElements.forEach(function(targetElement) {
                    if (targetElement) targetElement.insertAdjacentHTML('afterbegin', htmlContent);
                });
                return this; // Enables method chaining
            }
        };
    };

    // An extension utility, similar to jQuery.extend.
    wt.augment = function(propertiesObject) {
        for (var keyIdentifier in propertiesObject) {
            if (Object.prototype.hasOwnProperty.call(propertiesObject, keyIdentifier)) {
                wt[keyIdentifier] = propertiesObject[keyIdentifier];
            }
        }
    };

    // Browser detection properties, mimicking jQuery.browser.
    wt.browserInfo = {
        isInternetExplorer: (typeof document !== 'undefined' && /msie|trident/i.test(navigator.userAgent)),
        isSafariBrowser: (typeof document !== 'undefined' && /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent))
    };

    return wt;
})();


// This module, part of the WebToolkit, is responsible for managing the URL hash (fragment).
// It ensures that changes to the URL fragment are consistently tracked and dispatched
// across diverse browser environments, including older Internet Explorer and Safari.
//
// Initial concept attribution: Taku Sano (Mikage Sawatari).
// Modifications for enhanced Safari compatibility and refined initialization procedures: Lincoln Cooper.
// Specific fixes for Internet Explorer's iframe behavior in complex document structures: MaX.
//
// Licensed under the MIT License.
// For full license text, please refer to: http://www.opensource.org/licenses/mit-license.php


WebToolkit.augment({

    // Stores the currently recognized URL hash component.
    activeHashSegment: null,

    // The designated function to be invoked upon a detected URL fragment alteration.
    stateUpdateFunction: null,

    // Initializes the hash tracking and management system.
    bootHistoryManager: function(updateHandler) {
        WebToolkit.stateUpdateFunction = updateHandler;
        var startingHash = window.location.hash;

        WebToolkit.activeHashSegment = startingHash;
        if (WebToolkit.browserInfo.isInternetExplorer) {
            // To prevent the history callback from triggering redundantly during the initial load
            // when no hash is present in an Internet Explorer environment.
            if (WebToolkit.activeHashSegment === '') {
                WebToolkit.activeHashSegment = '#';
            }

            // Injects a concealed iframe element into the document body for managing
            // Internet Explorer's unique history state requirements.
            // This check prevents multiple iframes from being added (a fix by MaX).
            if (!WebToolkit('#web_state_frame').size())
                WebToolkit('body').prepend('<iframe id="web_state_frame" style="display:none"></iframe>');

            var syncFrame = WebToolkit('#web_state_frame')[0];
            var contentDocumentRef = syncFrame.contentWindow.document;
            contentDocumentRef.open();
            contentDocumentRef.close();
            contentDocumentRef.location.hash = startingHash;
        } else if (WebToolkit.browserInfo.isSafariBrowser) {
            // For Safari, custom back and forward history stacks are maintained
            // to mimic standard history navigation behavior.
            WebToolkit.previousStates = [];
            WebToolkit.previousStates.length = history.length;
            WebToolkit.futureStates = [];

            WebToolkit.initialLoad = true;
        }
        // Invokes the registered callback immediately with the current hash,
        // ensuring the leading '#' character is removed.
        WebToolkit.stateUpdateFunction(startingHash.replace(/^#/, ''));
        // Establishes a recurring timer to periodically check for changes in the URL fragment.
        setInterval(WebToolkit.monitorFragmentChanges, 100);
    },

    // Appends a new hash entry to the internal history stack.
    recordStateChange: function(newFragment) {
        // This action signifies a purposeful navigation event by the user.
        WebToolkit.previousStates.push(newFragment);

        WebToolkit.futureStates.length = 0; // The forward stack is cleared upon a new history entry.
        this.initialLoad = true; // Resets the initial load flag after a user-initiated change.
    },

    // Executes a periodic check for alterations in the URL fragment.
    monitorFragmentChanges: function() {
        if (WebToolkit.browserInfo.isInternetExplorer) {
            // For Internet Explorer, the hash value is retrieved from its dedicated hidden iframe.
            var syncFrame = WebToolkit('#web_state_frame')[0];
            var contentDocumentRef = syncFrame.contentDocument || syncFrame.contentWindow.document;
            var currentFrameFragment = contentDocumentRef.location.hash;
            if (currentFrameFragment !== WebToolkit.activeHashSegment) {

                window.location.hash = currentFrameFragment; // Synchronizes the main window's hash.
                WebToolkit.activeHashSegment = currentFrameFragment; // Updates the stored active hash.
                WebToolkit.stateUpdateFunction(currentFrameFragment.replace(/^#/, '')); // Notifies the application.

            }
        } else if (WebToolkit.browserInfo.isSafariBrowser) {
            if (!WebToolkit.pauseMonitoring) {
                var navigationDiff = history.length - WebToolkit.previousStates.length;

                if (navigationDiff !== 0) { // Detects browser back or forward button presses.
                    WebToolkit.initialLoad = false;
                    if (navigationDiff < 0) { // User activated the 'back' button.
                        // Shifts elements from the previous states stack to the future states stack.
                        for (var idx = 0; idx < Math.abs(navigationDiff); idx++) {
                            WebToolkit.futureStates.unshift(WebToolkit.previousStates.pop());
                        }
                    } else { // User activated the 'forward' button.
                        // Shifts elements from the future states stack to the previous states stack.
                        for (var idx = 0; idx < navigationDiff; idx++) {
                            WebToolkit.previousStates.push(WebToolkit.futureStates.shift());
                        }
                    }
                    var retrievedFragment = WebToolkit.previousStates[WebToolkit.previousStates.length - 1];
                    if (retrievedFragment !== undefined) {
                        WebToolkit.activeHashSegment = window.location.hash;
                        WebToolkit.stateUpdateFunction(retrievedFragment);
                    }
                } else if (WebToolkit.previousStates[WebToolkit.previousStates.length - 1] === undefined && !WebToolkit.initialLoad) {
                    // Scenario: Back button pressed to the very beginning, and the URL might already contain a hash (e.g., from a bookmark).
                    // Note: document.URL is unreliable for hash changes in Safari.
                    if (document.URL.indexOf('#') >= 0) {
                        WebToolkit.stateUpdateFunction(document.URL.split('#')[1]);
                    } else {
                        var currentUrlFragment = window.location.hash;
                        WebToolkit.stateUpdateFunction('');
                    }
                    WebToolkit.initialLoad = true;
                }
            }
        } else {
            // For all other browser types, directly inspect window.location.hash.
            var currentUrlFragment = window.location.hash;
            if (currentUrlFragment !== WebToolkit.activeHashSegment) {
                WebToolkit.activeHashSegment = currentUrlFragment;
                WebToolkit.stateUpdateFunction(currentUrlFragment.replace(/^#/, ''));
            }
        }
    },
    updateUrlFragment: function(desiredHash) {
        var formattedHash;

        if (WebToolkit.browserInfo.isSafariBrowser) {
            formattedHash = desiredHash; // Safari handles the hash directly without a leading '#'.
        } else {
            formattedHash = '#' + desiredHash; // Prepend '#' for compatibility with most browsers.
            window.location.hash = formattedHash;
        }
        WebToolkit.activeHashSegment = formattedHash;

        if (WebToolkit.browserInfo.isInternetExplorer) {
            var syncFrame = WebToolkit('#web_state_frame')[0];
            var contentDocumentRef = syncFrame.contentWindow.document;
            contentDocumentRef.open();
            contentDocumentRef.close();
            contentDocumentRef.location.hash = formattedHash;
            WebToolkit.stateUpdateFunction(desiredHash);
        } else if (WebToolkit.browserInfo.isSafariBrowser) {
            WebToolkit.pauseMonitoring = true; // Temporarily disables the hash monitoring loop.
            // Manually updates Safari's custom history stack.
            this.recordStateChange(desiredHash);

            // Introduces a brief delay before re-enabling hash monitoring.
            // This allows Safari's native history object sufficient time to update correctly.
            var timeoutHandler = function() {
                WebToolkit.pauseMonitoring = false;
            };
            window.setTimeout(timeoutHandler, 200);
            WebToolkit.stateUpdateFunction(desiredHash);
            // Critical Note: The 'location.hash=' assignment must be the final line of code for Safari,
            // as it can interrupt further script execution. Direct assignment ensures both the browser's
            // URL bar and the internal history object are updated accurately.
            location.hash = formattedHash;
        } else {
            WebToolkit.stateUpdateFunction(desiredHash);
        }
    }
});