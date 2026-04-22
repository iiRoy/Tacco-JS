;(function(currentWindow, currentDocument, undefined) {

    const TRAIL_LOG_STORE = 'PathPilot.trail';
    const DESTINATION_STORE = 'PathPilot.destination';
    const MAX_TRAIL_ENTRIES = 5;

    // --- Internal Utility Functions ---

    // Abstraction for localStorage interactions
    const storageController = (identifier) => ({
        fetch: () => {
            try {
                const storedData = currentWindow.localStorage.getItem(identifier);
                return storedData ? JSON.parse(storedData) : null;
            } catch (e) {
                // Handle potential localStorage errors (e.g., security, quota)
                console.error(`PathPilot: Error fetching from storage (${identifier}):`, e);
                return null;
            }
        },
        store: (value) => {
            try {
                currentWindow.localStorage.setItem(identifier, JSON.stringify(value));
            } catch (e) {
                console.error(`PathPilot: Error storing to storage (${identifier}):`, e);
            }
        },
        discard: () => currentWindow.localStorage.removeItem(identifier)
    });

    // Converts a URL to its absolute form
    const absoluteUrlResolver = (inputUrl) => {
        const tempAnchorElement = currentDocument.createElement('a');
        tempAnchorElement.href = inputUrl;
        return tempAnchorElement.href;
    };

    // Compares the base paths of two URLs (ignoring hash fragments)
    const pathBaseComparator = (urlOne, urlTwo) => {
        const baseOne = urlOne.split('#')[0];
        const baseTwo = urlTwo.split('#')[0];
        return baseOne === baseTwo;
    };

    // Custom queue with a fixed maximum length, enforcing FIFO
    function createLimitedQueue(maxLength, initialData = []) {
        let internalQueue = Array.isArray(initialData) ? initialData.slice() : [];
        if (internalQueue.length > maxLength) {
            internalQueue = internalQueue.slice(internalQueue.length - maxLength);
        }

        return {
            add: (item) => {
                internalQueue.push(item);
                if (internalQueue.length > maxLength) {
                    internalQueue.shift();
                }
            },
            get: () => internalQueue.slice(), // Return a copy to prevent external modification
            peekLast: () => internalQueue.length > 0 ? internalQueue[internalQueue.length - 1] : undefined,
            removeLast: () => {
                if (internalQueue.length > 0) {
                    internalQueue.pop();
                }
            },
            clear: () => { internalQueue = []; },
            getLength: () => internalQueue.length,
            setAll: (newQueueData) => { // Allows direct replacement of the queue
                internalQueue = Array.isArray(newQueueData) ? newQueueData.slice() : [];
                if (internalQueue.length > maxLength) {
                    internalQueue = internalQueue.slice(internalQueue.length - maxLength);
                }
            }
        };
    }

    // --- Core PathPilot Logic (Factory Function) ---

    const createPathPilot = () => {
        let _ignoreSelectorConfig = null;
        let _isDebuggingEnabled = false;

        const _trailStorage = storageController(TRAIL_LOG_STORE);
        const _destinationStorage = storageController(DESTINATION_STORE);

        // Initialize the trail queue from stored data, or an empty array
        const _currentTrail = createLimitedQueue(MAX_TRAIL_ENTRIES, _trailStorage.fetch() || []);

        // Internal helper to get the current browser URL
        const getBrowserCurrentUrl = () => currentWindow.location.href;

        // Internal helper for conditional logging
        const outputDebugMessage = (msg, ...args) => {
            if (_isDebuggingEnabled) {
                console.log(`[PathPilot Debug] ${msg}`, ...args);
            }
        };

        // Internal helper to persist the trail queue to storage
        const persistTrail = () => {
            _trailStorage.store(_currentTrail.get());
        };

        // The public interface of the PathPilot
        const pilot = {

            // Session Initialization & Reconciliation
            reconcilePath: function(completionCallback) {
                const currentBrowserPath = getBrowserCurrentUrl();
                const currentDesignatedTarget = this.getDesignatedTarget();
                const lastKnownInTrail = this.getLastKnownLocation();

                // Scenario 1: A specific navigation target was set
                if (currentDesignatedTarget) {
                    this.getDesignatedTarget(undefined); // Clear the target immediately

                    // If current location doesn't match the target, redirect
                    if (currentDesignatedTarget !== currentBrowserPath) {
                        outputDebugMessage(`Mismatch: Designated target (${currentDesignatedTarget}) does not match current path (${currentBrowserPath}). Initiating reroute.`);
                        this.rerouteToLastKnown();
                        return this;
                    }

                    // Target reached successfully, bookmark it
                    outputDebugMessage(`Success: Arrived at designated target (${currentDesignatedTarget}). Recording location.`);
                    this.markCurrentLocation();
                }
                // Scenario 2: Unintentional navigation (current path doesn't match last known in history)
                else if (lastKnownInTrail && currentBrowserPath !== lastKnownInTrail) {
                    outputDebugMessage(`Discrepancy: Current path (${currentBrowserPath}) differs from last known (${lastKnownInTrail}). Initiating reroute.`);
                    this.rerouteToLastKnown();
                    // If base paths match, execute callback
                    if (pathBaseComparator(lastKnownInTrail, currentBrowserPath) && completionCallback) {
                        completionCallback();
                    }
                    return this;
                }

                // Scenario 3: All good, or no special conditions. Execute callback if provided.
                outputDebugMessage(`Consistent: Arrived at path (${currentBrowserPath}). Triggering completion callback.`);
                if (completionCallback) {
                    completionCallback();
                }
                return this;
            },

            // Configuration Methods
            enableDebugging: function(setting) {
                if (arguments.length === 0) return _isDebuggingEnabled;
                _isDebuggingEnabled = !!setting;
                return this;
            },

            configureBypass: function(selectorString) {
                if (arguments.length === 0) return _ignoreSelectorConfig;
                _ignoreSelectorConfig = selectorString;
                return this;
            },

            // State Manipulation Methods
            clearAllRecords: function() {
                _trailStorage.discard();
                _destinationStorage.discard();
                _currentTrail.clear(); // Clear in-memory queue as well
                return this;
            },

            markCurrentLocation: function() {
                const current = this.retrieveCurrentLocation();
                outputDebugMessage('Recording current location:', current);
                _currentTrail.add(current);
                persistTrail();
                return this;
            },

            addLocationToTrail: function(specificPath) {
                _currentTrail.add(specificPath);
                persistTrail();
                return this;
            },

            retrieveTrail: function(value) {
                if (arguments.length === 0) {
                    return _currentTrail.get();
                }
                if (value === undefined || value === null) {
                    _currentTrail.clear();
                    _trailStorage.discard();
                } else {
                    _currentTrail.setAll(value);
                    _trailStorage.store(_currentTrail.get());
                }
                return this;
            },

            getDesignatedTarget: function(value) {
                if (arguments.length === 0) {
                    return _destinationStorage.fetch();
                }
                if (value === undefined || value === null) {
                    _destinationStorage.discard();
                } else {
                    _destinationStorage.store(value);
                }
                return this;
            },

            // URL Navigation Methods
            retrieveCurrentLocation: function() {
                return getBrowserCurrentUrl();
            },

            updateCurrentLocation: function(newPath) {
                if (arguments.length === 0) return getBrowserCurrentUrl(); // Getter functionality
                
                const lastKnown = this.getLastKnownLocation(); // From internal history queue
                const currentBrowserUrl = getBrowserCurrentUrl(); // Actual URL in browser

                // Only manipulate history/target if the new path is different from the last known in history
                if (lastKnown !== newPath) {
                    // If newPath shares the base with the current browser URL, add to history
                    if (pathBaseComparator(newPath, currentBrowserUrl)) {
                        this.addLocationToTrail(newPath);
                    } else {
                        // Otherwise, set it as a temporary destination target
                        this.setDesignatedTarget(newPath);
                    }
                }
                currentWindow.location = newPath; // Perform the navigation
                return this;
            },

            rerouteToLastKnown: function() {
                const last = this.getLastKnownLocation();
                if (last) this.updateCurrentLocation(last);
                return this;
            },

            retreatOneStep: function() {
                if (_currentTrail.getLength() > 1) { // Ensure there's more than one entry to pop
                    _currentTrail.removeLast();
                    persistTrail();
                    this.rerouteToLastKnown();
                }
                return this;
            },

            navigateToTarget: function(url) {
                const resolvedUrl = absoluteUrlResolver(url);
                outputDebugMessage('Initiating navigation to:', resolvedUrl);
                this.updateCurrentLocation(resolvedUrl);
                return this;
            },

            openExternalLink: function(url) {
                outputDebugMessage('Opening external link in new tab:', url);
                const tempAnchor = currentDocument.createElement('a');
                tempAnchor.setAttribute('href', url);
                tempAnchor.setAttribute('target', '_blank');
                tempAnchor.rel = 'noopener noreferrer'; // Security best practice for target=_blank
                tempAnchor.click(); // Simulate a click to open the link
            },

            // Getters
            getLastKnownLocation: function() {
                return _currentTrail.peekLast();
            },

            // Event Handling
            activateLinkInterceptor: function(selectorString) {
                const self = this;
                currentDocument.addEventListener('click', function(event) {
                    // Traverse up the DOM to find if the clicked element or its ancestor matches the selector
                    let clickedElement = event.target.closest(selectorString);

                    // Ensure the matched element is an anchor tag
                    if (clickedElement && clickedElement.tagName.toLowerCase() === 'a') {
                        return self._processInterceptedClick(clickedElement, event);
                    }
                    return true; // Allow other clicks to proceed normally
                });
                return this;
            },

            _processInterceptedClick: function(anchorElement, clickEvent) {
                // Check if this element should be bypassed based on configuration
                if (_ignoreSelectorConfig && anchorElement.matches(_ignoreSelectorConfig)) {
                    outputDebugMessage('Ignoring click on element matching bypass selector.');
                    return true; // Let the browser handle the default action
                }

                const linkHref = anchorElement.getAttribute('href');
                outputDebugMessage('Intercepting click for href:', linkHref);

                // Replicate UI update from original (e.g., spinner)
                const spinnerContainer = currentDocument.getElementById('swipy-refresh');
                if (spinnerContainer) {
                    const iconElement = spinnerContainer.querySelector('i');
                    if (iconElement) {
                        iconElement.classList.add('icon-spin', 'animate-spin');
                    }
                }

                this.navigateToTarget(linkHref); // Use the internal navigation mechanism

                clickEvent.preventDefault(); // Prevent the browser's default link navigation
                return false;
            }
        };

        return pilot;
    };

    // Expose the PathPilot instance globally
    currentWindow.PathPilot = createPathPilot();

})(window, document);