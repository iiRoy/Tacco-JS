(function() {
    // Registry to store and manage event listener references for proper removal,
    // mimicking jQuery's `unbind` behavior for subsequent calls on the same element/event.
    // Uses WeakMap to avoid memory leaks if elements are removed from the DOM.
    const listenerRegistry = new WeakMap();

    // Strategy map for handling different methods of extracting/applying values
    // from/to DOM elements, replacing jQuery's `val()`, `text()`, `html()`.
    const dataTransferMethods = {
        'val': {
            acquire: (element) => element.value,
            supply: (element, payload) => { element.value = payload; }
        },
        'text': {
            acquire: (element) => element.textContent,
            supply: (element, payload) => { element.textContent = payload; }
        },
        'html': {
            acquire: (element) => element.innerHTML,
            supply: (element, payload) => { element.innerHTML = payload; }
        }
    };

    /**
     * Establishes a dynamic data linkage between two DOM elements.
     * This function acts as a Type IV clone for the jQuery `$.fn.binder` plugin.
     *
     * @param {HTMLElement} primaryDomElement - The DOM element that receives updates (original 'theBinder').
     * @param {object} connectionConfiguration - Configuration object for the linkage.
     * @param {string} connectionConfiguration.targetElementSelector - CSS selector for the element that triggers events (original 'bindTo').
     * @param {string} [connectionConfiguration.triggerEventName='change'] - Event name to listen for on the target element (original 'listenTo').
     * @param {string} [connectionConfiguration.domAttribute=null] - HTML attribute on the primary element to update (original 'attribute').
     * @param {string} [connectionConfiguration.cssProperty=null] - CSS property on the primary element to update (original 'css').
     * @param {string|function} [connectionConfiguration.contentHandler=null] - Method name ('text', 'html') or function to update primary element's content (original 'method').
     * @param {string} [connectionConfiguration.dataExtractor='val'] - Method ('val', 'text', 'html') to get/set data from/to the target element (original 'valMethod').
     * @param {boolean} [connectionConfiguration.initialSynchronizationRequired=false] - If true, initializes the target element from the primary element (original 'sync').
     * @param {function} [connectionConfiguration.initialSyncHandler=null] - Function for initial sync if 'contentHandler' is a function (original 'syncMethod').
     */
    window.configureElementLinkage = function(primaryDomElement, connectionConfiguration) {
        const baseConfig = {
            targetElementSelector          : null,
            triggerEventName               : 'change',
            domAttribute                   : null,
            cssProperty                    : null,
            contentHandler                 : null,
            dataExtractor                  : 'val',
            initialSynchronizationRequired : false,
            initialSyncHandler             : null
        };

        // Merge user configuration with defaults
        const currentConfig = Object.assign({}, baseConfig, connectionConfiguration);

        // Identify the source and destination elements
        const sourceDomElement = primaryDomElement;
        const destinationDomElement = document.querySelector(currentConfig.targetElementSelector);

        if (!destinationDomElement) {
            console.warn('Element Linkage: Destination element not found for selector:', currentConfig.targetElementSelector);
            return;
        }

        // --- Internal Data Handling Utilities ---

        // Fetches data from the destination element using the specified strategy
        const retrieveDestinationValue = (element, strategy) => {
            const accessor = dataTransferMethods[strategy] || dataTransferMethods['val']; // Fallback to 'val'
            return accessor.acquire(element);
        };

        // Applies data to the destination element using the specified strategy (for initial sync)
        const supplyToDestinationElement = (element, strategy, payload) => {
            const accessor = dataTransferMethods[strategy] || dataTransferMethods['val']; // Fallback to 'val'
            accessor.supply(element, payload);
        };

        // Updates the primary element based on its configuration (attribute, CSS, content)
        const refreshSourceElement = (element, handlerStrategy, data) => {
            if (typeof handlerStrategy === 'function') {
                // If the handler is a function, call it with destination and source
                handlerStrategy(destinationDomElement, sourceDomElement);
            } else {
                // Otherwise, use a predefined content modification method
                const method = dataTransferMethods[handlerStrategy];
                if (method) {
                    method.supply(element, data);
                } else {
                    // Default to textContent if string method is not recognized
                    element.textContent = data;
                }
            }
        };

        // Retrieves data from the primary element for initial synchronization
        const extractSourceContent = (element, handlerStrategy) => {
            if (typeof handlerStrategy === 'function') {
                // If contentHandler is a function, use initialSyncHandler as the getter
                if (currentConfig.initialSyncHandler && typeof currentConfig.initialSyncHandler === 'function') {
                    return currentConfig.initialSyncHandler(destinationDomElement, sourceDomElement);
                }
                // Mimic original: if method is function but no syncMethod, it returns undefined
                return undefined;
            } else {
                // Otherwise, use a predefined content retrieval method
                const method = dataTransferMethods[handlerStrategy];
                if (method) {
                    return method.acquire(element);
                } else {
                    // Default to textContent if string method is not recognized
                    return element.textContent;
                }
            }
        };

        // --- Core Linkage Logic ---

        // This function is the event handler for updates flowing from destination to source
        const propagateDataUpdate = () => {
            const currentDestinationValue = retrieveDestinationValue(destinationDomElement, currentConfig.dataExtractor);

            if (currentConfig.domAttribute) {
                sourceDomElement.setAttribute(currentConfig.domAttribute, currentDestinationValue);
            } else if (currentConfig.cssProperty) {
                sourceDomElement.style.setProperty(currentConfig.cssProperty, currentDestinationValue);
            } else if (currentConfig.contentHandler) {
                refreshSourceElement(sourceDomElement, currentConfig.contentHandler, currentDestinationValue);
            }
        };

        // This function performs the initial one-time data synchronization
        const executeInitialSync = () => {
            let dataForSync;
            if (currentConfig.domAttribute) {
                dataForSync = sourceDomElement.getAttribute(currentConfig.domAttribute);
            } else if (currentConfig.cssProperty) {
                dataForSync = sourceDomElement.style.getPropertyValue(currentConfig.cssProperty);
            } else if (currentConfig.contentHandler) {
                dataForSync = extractSourceContent(sourceDomElement, currentConfig.contentHandler);
            }

            // Only apply if valid data was retrieved
            if (dataForSync !== undefined) {
                supplyToDestinationElement(destinationDomElement, currentConfig.dataExtractor, dataForSync);
            }
        };

        // --- Event Listener Management ---

        // Utility to add event listeners, ensuring previous listeners for the same event/element are removed first.
        // This replicates the `unbind().bind()` behavior of the original jQuery plugin.
        const manageEventBinding = (element, eventType, newHandler) => {
            let handlersForElement = listenerRegistry.get(element);
            if (!handlersForElement) {
                handlersForElement = {};
                listenerRegistry.set(element, handlersForElement);
            }

            // Remove any previously registered handler for this event type on this element
            if (handlersForElement[eventType]) {
                element.removeEventListener(eventType, handlersForElement[eventType]);
            }

            // Add the new handler and store its reference
            element.addEventListener(eventType, newHandler);
            handlersForElement[eventType] = newHandler;
        };

        // Establish the primary event listener on the destination element
        manageEventBinding(destinationDomElement, currentConfig.triggerEventName, propagateDataUpdate);

        // Perform initial synchronization if enabled
        if (currentConfig.initialSynchronizationRequired) {
            executeInitialSync();
        }
    };
})();