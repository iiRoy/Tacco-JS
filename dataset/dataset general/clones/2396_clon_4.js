const ANCHOR_CLASS_MARKER = 'scroll-candidate';
const FIXED_POSITION_CLASS = 'affixed-position';
const PLACEHOLDER_ATTRIBUTE = 'data-scroll-sentinel-placeholder';
const MODULE_VERSION_ID = '2.0';
const GLOBAL_SCOPE = typeof window !== 'undefined' ? window : this;

// Internal utility functions, replacing the 'jeeves' object
const internalTools = {
    // Retrieves current vertical scroll position of the window
    fetchScrollPosition: () => GLOBAL_SCOPE.scrollY || document.documentElement.scrollTop,

    // Calculates an element's top offset relative to the document
    retrieveElementTopOffset: (targetElement) => {
        if (!targetElement || !targetElement.getBoundingClientRect) return 0;
        return targetElement.getBoundingClientRect().top + internalTools.fetchScrollPosition();
    },

    // Checks if an element has a specific CSS class
    hasDesignation: (targetElement, designation) => targetElement.classList.contains(designation),

    // Adds a CSS class to an element
    assignDesignation: (targetElement, designation) => targetElement.classList.add(designation),

    // Removes a CSS class from an element
    revokeDesignation: (targetElement, designation) => targetElement.classList.remove(designation),

    // Creates and inserts a placeholder element to prevent content reflow
    createGapFiller: (originalElement) => {
        const filler = document.createElement('div');
        filler.style.width = `${originalElement.offsetWidth}px`;
        filler.style.height = `${originalElement.offsetHeight}px`;
        filler.style.margin = GLOBAL_SCOPE.getComputedStyle(originalElement).margin;
        filler.setAttribute(PLACEHOLDER_ATTRIBUTE, '');
        originalElement.parentNode.insertBefore(filler, originalElement);
        return filler;
    },

    // Removes a placeholder element
    removeGapFiller: (fillerElement) => {
        if (fillerElement && fillerElement.parentNode) {
            fillerElement.parentNode.removeChild(fillerElement);
        }
    }
};

// Releases elements from their fixed state
function releaseAnchoredElements(sentinelInstance, startingIndex) {
    const elementsToUnfix = sentinelInstance.anchorList.slice(startingIndex);
    elementsToUnfix.forEach(({ element, placeholder }) => {
        if (internalTools.hasDesignation(element, FIXED_POSITION_CLASS)) {
            internalTools.revokeDesignation(element, FIXED_POSITION_CLASS);
            internalTools.removeGapFiller(placeholder);
            element.style.top = ''; // Clear inline top style
        }
        // Ensure the general anchor marker is present if not fixed
        if (!internalTools.hasDesignation(element, ANCHOR_CLASS_MARKER)) {
            internalTools.assignDesignation(element, ANCHOR_CLASS_MARKER);
        }
    });
}

// Secures elements into their fixed state
function secureAnchoredElements(sentinelInstance, endingIndex) {
    const elementsToFix = sentinelInstance.anchorList.slice(0, endingIndex);
    let cumulativeHeightOffset = 0;

    elementsToFix.forEach((anchorData, index) => {
        const { element } = anchorData;
        if (!internalTools.hasDesignation(element, FIXED_POSITION_CLASS)) {
            // Create placeholder when element is about to become fixed
            const newPlaceholder = internalTools.createGapFiller(element);
            anchorData.placeholder = newPlaceholder; // Update reference in anchorList

            internalTools.assignDesignation(element, FIXED_POSITION_CLASS);
        }

        if (sentinelInstance.activeAnchorIndex > 0 && sentinelInstance.allowStacking) {
            element.style.top = `${cumulativeHeightOffset}px`;
            cumulativeHeightOffset += element.offsetHeight;
        } else {
            element.style.top = ''; // Reset top if not stacking or it's the first element
        }
        // Remove the general anchor marker if it's now fixed
        if (internalTools.hasDesignation(element, ANCHOR_CLASS_MARKER)) {
            internalTools.revokeDesignation(element, ANCHOR_CLASS_MARKER);
        }
    });
}

// Core function to evaluate and update anchor positions on scroll
function assessAnchorPositions(sentinelInstance) {
    const currentScrollY = internalTools.fetchScrollPosition();
    let highestRelevantAnchorIndex = -1;

    // Determine the highest anchor that should currently be fixed
    for (let i = sentinelInstance.anchorList.length - 1; i >= 0; i--) {
        const currentAnchor = sentinelInstance.anchorList[i];
        let stackingCompensation = 0;
        if (sentinelInstance.allowStacking) {
            // Sum heights of elements that would be fixed above the current one
            for (let j = 0; j < i; j++) {
                stackingCompensation += sentinelInstance.anchorList[j].element.offsetHeight;
            }
        }

        if ((currentScrollY + stackingCompensation) >= currentAnchor.originalOffset) {
            highestRelevantAnchorIndex = i;
            break;
        }
    }

    // Apply/remove fixed styles if the state of fixed anchors has changed
    if (highestRelevantAnchorIndex !== sentinelInstance.activeAnchorIndex) {
        sentinelInstance.activeAnchorIndex = highestRelevantAnchorIndex;

        // Release elements that are no longer active (from highestRelevantAnchorIndex + 1 onwards)
        if (highestRelevantAnchorIndex < sentinelInstance.anchorList.length - 1) {
            releaseAnchoredElements(sentinelInstance, highestRelevantAnchorIndex + 1);
        }
        
        // Secure elements up to and including the highestRelevantAnchorIndex
        if (highestRelevantAnchorIndex >= 0) {
            secureAnchoredElements(sentinelInstance, highestRelevantAnchorIndex + 1);
        } else { // No anchors should be fixed
            releaseAnchoredElements(sentinelInstance, 0);
        }
    }
}

// Manages all active ScrollSentinel instances for global cleanup
let activeSentinelInstances = new Set();

// Factory function to create ScrollSentinel instances
function createScrollSentinel(configuration = {}) {
    const instanceData = {
        trackedSelectors: new Map(), // Maps selector string to an array of DOM elements
        anchorList: [], // Stores { element, originalOffset, placeholder } objects, sorted by originalOffset
        activeAnchorIndex: -1, // Index of the highest currently fixed element in anchorList
        scrollZone: configuration.scrollContainer || GLOBAL_SCOPE, // Element or window to listen for scroll events
        allowStacking: configuration.enableStacking || false, // Whether fixed elements should stack
        scrollEventHandler: null // Reference to the bound scroll event handler
    };

    // Injects essential CSS rules for affixed elements if not already present
    const injectCoreStyles = () => {
        if (!document.getElementById('scroll-sentinel-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'scroll-sentinel-styles';
            styleElement.textContent = `
                .${FIXED_POSITION_CLASS} {
                    position: fixed;
                    z-index: 1000;
                    width: 100%;
                }
            `;
            document.head.appendChild(styleElement);
        }
    };
    injectCoreStyles();

    // Sets up scroll and resize event listeners
    const activateListeners = () => {
        if (!instanceData.scrollEventHandler) {
            instanceData.scrollEventHandler = () => assessAnchorPositions(instanceData);
            instanceData.scrollZone.addEventListener('scroll', instanceData.scrollEventHandler);
            GLOBAL_SCOPE.addEventListener('resize', instanceData.scrollEventHandler);
        }
    };

    // Removes scroll and resize event listeners
    const deactivateListeners = () => {
        if (instanceData.scrollEventHandler) {
            instanceData.scrollZone.removeEventListener('scroll', instanceData.scrollEventHandler);
            GLOBAL_SCOPE.removeEventListener('resize', instanceData.scrollEventHandler);
            instanceData.scrollEventHandler = null;
        }
    };

    // Public interface for a ScrollSentinel instance
    const exposedAPI = {
        // Registers elements matching a CSS selector to be monitored
        registerElement: (cssSelector) => {
            if (instanceData.trackedSelectors.has(cssSelector)) {
                exposedAPI.deregisterElement(cssSelector); // Deregister first to avoid duplicates
            }

            const foundElements = document.querySelectorAll(cssSelector);
            if (foundElements.length === 0) {
                console.warn(`ScrollSentinel: No elements found for selector "${cssSelector}"`);
                return;
            }

            const newAnchorEntries = [];
            foundElements.forEach(el => {
                const initialOffset = internalTools.retrieveElementTopOffset(el);
                newAnchorEntries.push({
                    element: el,
                    originalOffset: initialOffset,
                    placeholder: null // Placeholder created dynamically when element becomes fixed
                });
                internalTools.assignDesignation(el, ANCHOR_CLASS_MARKER); // Mark as a potential anchor
            });

            instanceData.trackedSelectors.set(cssSelector, Array.from(foundElements)); // Store references
            instanceData.anchorList.push(...newAnchorEntries);

            // Sort the list of anchors by their original document offset
            instanceData.anchorList.sort((a, b) => a.originalOffset - b.originalOffset);

            activateListeners();
            assessAnchorPositions(instanceData); // Initial evaluation
        },

        // Deregisters elements matching a CSS selector
        deregisterElement: (cssSelector) => {
            const elementsToRemove = instanceData.trackedSelectors.get(cssSelector);
            if (!elementsToRemove) return;

            elementsToRemove.forEach(elToRemove => {
                const indexInAnchorList = instanceData.anchorList.findIndex(a => a.element === elToRemove);
                if (indexInAnchorList !== -1) {
                    const { element, placeholder } = instanceData.anchorList[indexInAnchorList];

                    // Clean up classes and styles
                    if (internalTools.hasDesignation(element, FIXED_POSITION_CLASS)) {
                        internalTools.revokeDesignation(element, FIXED_POSITION_CLASS);
                        element.style.top = '';
                    }
                    if (internalTools.hasDesignation(element, ANCHOR_CLASS_MARKER)) {
                        internalTools.revokeDesignation(element, ANCHOR_CLASS_MARKER);
                    }
                    internalTools.removeGapFiller(placeholder);

                    // Remove from the active anchor list
                    instanceData.anchorList.splice(indexInAnchorList, 1);
                }
            });

            instanceData.trackedSelectors.delete(cssSelector);

            if (instanceData.anchorList.length === 0) {
                deactivateListeners();
            } else {
                assessAnchorPositions(instanceData); // Re-evaluate after removal
            }
        },

        // Deactivates all monitored elements for this instance
        deactivateAll: () => {
            Array.from(instanceData.trackedSelectors.keys()).forEach(selector => {
                exposedAPI.deregisterElement(selector);
            });
            deactivateListeners();
            activeSentinelInstances.delete(instanceData); // Remove from global tracking
        },

        // Returns the module version
        getVersion: () => MODULE_VERSION_ID
    };

    activeSentinelInstances.add(instanceData); // Add to global tracking set
    return exposedAPI;
}

// Global function to purge all ScrollSentinel instances
function purgeAllSentinels() {
    Array.from(activeSentinelInstances).forEach(instanceData => {
        // Create a temporary API object to call deactivateAll
        const tempApi = { deactivateAll: () => {
            Array.from(instanceData.trackedSelectors.keys()).forEach(selector => {
                const elementsToRemove = instanceData.trackedSelectors.get(selector);
                if (!elementsToRemove) return;
                elementsToRemove.forEach(elToRemove => {
                    const indexInAnchorList = instanceData.anchorList.findIndex(a => a.element === elToRemove);
                    if (indexInAnchorList !== -1) {
                        const { element, placeholder } = instanceData.anchorList[indexInAnchorList];
                        if (internalTools.hasDesignation(element, FIXED_POSITION_CLASS)) {
                            internalTools.revokeDesignation(element, FIXED_POSITION_CLASS);
                            element.style.top = '';
                        }
                        if (internalTools.hasDesignation(element, ANCHOR_CLASS_MARKER)) {
                             internalTools.revokeDesignation(element, ANCHOR_CLASS_MARKER);
                        }
                        internalTools.removeGapFiller(placeholder);
                    }
                });
            });
            // Ensure listeners are removed for this instance
            if (instanceData.scrollEventHandler) {
                instanceData.scrollZone.removeEventListener('scroll', instanceData.scrollEventHandler);
                GLOBAL_SCOPE.removeEventListener('resize', instanceData.scrollEventHandler);
                instanceData.scrollEventHandler = null;
            }
        }};
        tempApi.deactivateAll();
    });
    activeSentinelInstances.clear();

    // Optionally remove the injected styles if no sentinels are left
    const styleTag = document.getElementById('scroll-sentinel-styles');
    if (styleTag && styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
    }
}

// Expose the factory function and global cleanup function on the global scope
GLOBAL_SCOPE.ScrollSentinelFactory = createScrollSentinel;
GLOBAL_SCOPE.ScrollSentinelFactory.purge = purgeAllSentinels;
GLOBAL_SCOPE.ScrollSentinelFactory.version = MODULE_VERSION_ID;