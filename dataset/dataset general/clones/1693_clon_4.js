(function(masterWindow, currentDocument, notUsed) {
    "use strict";

    // Helper for resolving element references, mimicking original's '$'
    const getDomReference = (selector) => {
        if (typeof selector === "string") {
            return currentDocument.getElementById(selector.startsWith('#') ? selector.substring(1) : selector);
        }
        return selector;
    };

    // Factory function for creating a suggestion mechanism
    function createSuggestionEngine(inputSource, primarySettings) {
        const inputField = getDomReference(inputSource);
        if (!inputField || inputField.tagName.toLowerCase() !== "input") {
            return null; // Ensure it's a valid input element
        }

        // Internal state (private via closure)
        let configuration = {};
        let dataStore = new Map(); // Cache for filtered results
        let availableOptions = []; // The complete list of data items
        let suggestionDisplayArea = null; // The DOM element for custom suggestions
        let activeSelectionIndex = -1;
        let lastKnownInputValue = "";
        let inputDelayIdentifier = null;
        let isInputCurrentlyFocused = false;
        const supportsTouch = ('ontouchstart' in masterWindow || navigator.maxTouchPoints > 0);

        // Default configuration values
        const baseSettings = {
            useBrowserDatalist: true,
            yOffset: 0,
            xOffset: 0,
            maxSuggestionsShown: 6,
            highlightTextColor: "#ffffff",
            highlightBgColor: "#3399ff",
            sourceKind: "", // "list", "domElement", "xmlText"
            sourceContent: null,
            inputChangeHandler: () => {}, // No-op function
            inputDelayMs: 0
        };

        // Method to update configuration
        const updateConfiguration = (newConfigs) => {
            Object.assign(configuration, baseSettings, newConfigs);
        };

        // Helper for creating DOM elements
        const produceElement = (tag, classNames = [], attrs = {}) => {
            const domEl = currentDocument.createElement(tag);
            if (classNames.length) domEl.className = classNames.join(' ');
            for (const key in attrs) {
                domEl.setAttribute(key, attrs[key]);
            }
            return domEl;
        };

        // Data acquisition functions
        const retrieveDomItems = () => {
            const listAttribute = inputField.getAttribute('list');
            if (!listAttribute) return [];
            const containerDom = currentDocument.getElementById(listAttribute);
            if (!containerDom) return [];
            return Array.from(containerDom.querySelectorAll('option')).map(opt => opt.value);
        };

        const retrieveXmlItems = () => {
            const xmlParser = new DOMParser();
            const xmlDoc = xmlParser.parseFromString(configuration.sourceContent, "text/xml");
            const xmlOptions = Array.from(xmlDoc.querySelectorAll('datalist option'));
            return xmlOptions.map(opt => opt.getAttribute('value')).filter(Boolean);
        };

        // Populates the internal 'availableOptions' array
        const compileDataItems = () => {
            switch (configuration.sourceKind) {
                case "list":
                    availableOptions = (configuration.sourceContent || []).slice();
                    break;
                case "domElement":
                    availableOptions = retrieveDomItems();
                    break;
                case "xmlText":
                    availableOptions = retrieveXmlItems();
                    break;
                default:
                    availableOptions = [];
            }
            availableOptions.sort((a, b) => a.localeCompare(b)); // Sort once for efficient matching
        };

        // Manages native datalist integration
        const setupBrowserDatalist = () => {
            // Check for native datalist support
            const hasNativeDatalist = ('HTMLDataListElement' in masterWindow);
            if (!hasNativeDatalist || !configuration.useBrowserDatalist) {
                return false;
            }

            let currentListId = inputField.getAttribute('list');
            let dataListRef = currentListId ? currentDocument.getElementById(currentListId) : null;

            if (!dataListRef) {
                dataListRef = produceElement('datalist', [], { id: 'suggestList' + Math.floor(Math.random() * 100000) });
                inputField.parentNode.insertBefore(dataListRef, inputField.nextSibling);
                inputField.setAttribute('list', dataListRef.id);
            }

            if (configuration.sourceKind !== "domElement") {
                // If data isn't from existing DOM, populate the datalist dynamically
                dataListRef.innerHTML = availableOptions.map(item => `<option value="${item}"></option>`).join('');
            }
            return true;
        };

        // Custom suggestion UI generation
        const generateSuggestionContainer = () => {
            if (suggestionDisplayArea) return; // Already exists

            const outerWrapper = produceElement('div', ['suggestion-wrapper-alt']);
            suggestionDisplayArea = produceElement('div', ['suggestion-box-alt']);

            // Position based on input field
            const fieldRect = inputField.getBoundingClientRect();
            const computedStyle = masterWindow.getComputedStyle(inputField);
            const inputDisplay = computedStyle.getPropertyValue('display');

            suggestionDisplayArea.style.minWidth = `${fieldRect.width}px`;
            suggestionDisplayArea.style.marginLeft = `${configuration.xOffset}px`;
            suggestionDisplayArea.style.marginTop = `${inputField.offsetHeight + configuration.yOffset}px`;

            outerWrapper.style.display = inputDisplay || 'block'; // Match input's display
            outerWrapper.appendChild(suggestionDisplayArea);
            inputField.parentNode.insertBefore(outerWrapper, inputField.nextSibling);
        };

        const removeSuggestionContainer = () => {
            if (suggestionDisplayArea && suggestionDisplayArea.parentNode) {
                suggestionDisplayArea.parentNode.parentNode.removeChild(suggestionDisplayArea.parentNode); // Remove wrapper
                suggestionDisplayArea = null;
            }
        };

        // Renders the list of matching suggestions
        const displayMatches = (matches) => {
            if (!suggestionDisplayArea) {
                // If there are matches, ensure container exists
                if (matches.length > 0) generateSuggestionContainer();
                else return; // No matches, no container
            }

            suggestionDisplayArea.innerHTML = ''; // Clear existing content

            if (matches.length === 0) {
                removeSuggestionContainer();
                return;
            }

            const matchListElement = produceElement('ul', ['suggestion-list-alt']);
            matches.forEach((item, index) => {
                const itemEntry = produceElement('li', ['suggestion-item-alt'], { 'data-alt-index': index });
                itemEntry.textContent = item;
                matchListElement.appendChild(itemEntry);
            });
            suggestionDisplayArea.appendChild(matchListElement);
            activeSelectionIndex = -1; // Reset highlight
        };

        // Updates the visual highlight on a suggestion item
        const adjustHighlight = (newIdx) => {
            if (!suggestionDisplayArea) return;
            const itemNodes = suggestionDisplayArea.querySelectorAll('.suggestion-item-alt');
            if (itemNodes.length === 0) return;

            // Remove previous highlight
            if (activeSelectionIndex > -1 && itemNodes[activeSelectionIndex]) {
                itemNodes[activeSelectionIndex].style.color = '';
                itemNodes[activeSelectionIndex].style.backgroundColor = '';
            }

            // Apply new highlight
            if (newIdx > -1 && newIdx < itemNodes.length) {
                itemNodes[newIdx].style.color = configuration.highlightTextColor;
                itemNodes[newIdx].style.backgroundColor = configuration.highlightBgColor;
                activeSelectionIndex = newIdx;
            } else {
                activeSelectionIndex = -1; // No item highlighted
            }
        };

        // Filters data items based on input value
        const obtainFilteredMatches = (currentValue) => {
            if (!currentValue) return [];
            if (dataStore.has(currentValue)) return dataStore.get(currentValue);

            const matchPattern = new RegExp(`^${currentValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
            const filteredResults = availableOptions.filter(item => matchPattern.test(item))
                                                    .slice(0, configuration.maxSuggestionsShown);
            dataStore.set(currentValue, filteredResults);
            return filteredResults;
        };

        // Event handler for input field focus
        const handleFocusEvent = () => {
            isInputCurrentlyFocused = true;
            if (!setupBrowserDatalist()) { // If native datalist isn't used or supported
                lastKnownInputValue = inputField.value;
                generateSuggestionContainer();
                // Attach custom UI specific listeners
                inputField.addEventListener('input', processInputChanges);
                inputField.addEventListener('keydown', processKeyActions);
                if (suggestionDisplayArea) { // Ensure it's created before attaching listeners
                    suggestionDisplayArea.addEventListener(supportsTouch ? 'touchstart' : 'mousemove', handleHoverInteraction);
                    suggestionDisplayArea.addEventListener(supportsTouch ? 'touchend' : 'mousedown', handleSelectionEvent);
                }
            }
        };

        // Event handler for input field blur
        const handleBlurEvent = () => {
            isInputCurrentlyFocused = false;
            if (!('HTMLDataListElement' in masterWindow) || !configuration.useBrowserDatalist) {
                // Delay clearing to allow click events on suggestions to register
                masterWindow.setTimeout(() => {
                    removeSuggestionContainer();
                    dataStore.clear();
                    lastKnownInputValue = "";
                    activeSelectionIndex = -1;
                    // Detach custom UI specific listeners
                    inputField.removeEventListener('input', processInputChanges);
                    inputField.removeEventListener('keydown', processKeyActions);
                    if (suggestionDisplayArea) { // May have been removed by now
                        suggestionDisplayArea.removeEventListener(supportsTouch ? 'touchstart' : 'mousemove', handleHoverInteraction);
                        suggestionDisplayArea.removeEventListener(supportsTouch ? 'touchend' : 'mousedown', handleSelectionEvent);
                    }
                }, 150); // Small delay, similar to original
            }
        };

        // Processes input value changes
        const processInputChanges = () => {
            const currentVal = inputField.value;
            if (currentVal === lastKnownInputValue) return;

            const executeSearchAndCallback = () => {
                const results = obtainFilteredMatches(currentVal);
                displayMatches(results);
                configuration.inputChangeHandler(currentVal, lastKnownInputValue);
                lastKnownInputValue = currentVal;
                inputDelayIdentifier = null;
            };

            if (configuration.inputDelayMs > 0) {
                masterWindow.clearTimeout(inputDelayIdentifier);
                inputDelayIdentifier = masterWindow.setTimeout(executeSearchAndCallback, configuration.inputDelayMs);
            } else {
                executeSearchAndCallback();
            }
        };

        // Handles keyboard interactions (navigation, selection)
        const processKeyActions = (eventDetail) => {
            const actionsMap = new Map([
                ['ArrowUp', () => {
                    eventDetail.preventDefault();
                    const items = suggestionDisplayArea.querySelectorAll('.suggestion-item-alt');
                    if (items.length === 0) return;
                    const nextIndex = activeSelectionIndex <= 0 ? items.length - 1 : activeSelectionIndex - 1;
                    adjustHighlight(nextIndex);
                }],
                ['ArrowDown', () => {
                    eventDetail.preventDefault();
                    const items = suggestionDisplayArea.querySelectorAll('.suggestion-item-alt');
                    if (items.length === 0) return;
                    const nextIndex = activeSelectionIndex >= items.length - 1 ? 0 : activeSelectionIndex + 1;
                    adjustHighlight(nextIndex);
                }],
                ['Enter', () => {
                    if (activeSelectionIndex > -1) {
                        eventDetail.preventDefault();
                        applySelectedSuggestion();
                    }
                }],
                ['Tab', () => {
                    if (activeSelectionIndex > -1) {
                        applySelectedSuggestion();
                    }
                }],
                ['Escape', () => {
                    removeSuggestionContainer();
                }]
            ]);

            const action = actionsMap.get(eventDetail.key);
            if (action) {
                action();
            }
        };

        // Handles mouse/touch hover events for highlighting
        let lastMoveTimestamp = 0;
        const handleHoverInteraction = (eventDetail) => {
            // Debounce mousemove events
            if (eventDetail.type === 'mousemove' && (eventDetail.timeStamp - lastMoveTimestamp < 50)) {
                return;
            }
            lastMoveTimestamp = eventDetail.timeStamp;

            const targetSuggestion = eventDetail.target.closest('.suggestion-item-alt');
            if (targetSuggestion) {
                const index = parseInt(targetSuggestion.dataset.altIndex, 10);
                if (index !== activeSelectionIndex) {
                    adjustHighlight(index);
                }
            }
        };

        // Handles mouse/touch click events for selection
        const handleSelectionEvent = (eventDetail) => {
            eventDetail.preventDefault(); // Prevent blur
            const targetSuggestion = eventDetail.target.closest('.suggestion-item-alt');
            if (targetSuggestion) {
                const index = parseInt(targetSuggestion.dataset.altIndex, 10);
                if (index > -1) {
                    adjustHighlight(index); // Ensure it's highlighted
                    applySelectedSuggestion();
                }
            }
            inputField.focus(); // Return focus to input field
        };

        // Applies the currently highlighted suggestion to the input field
        const applySelectedSuggestion = () => {
            if (activeSelectionIndex > -1) {
                const itemElements = suggestionDisplayArea.querySelectorAll('.suggestion-item-alt');
                if (itemElements[activeSelectionIndex]) {
                    inputField.value = itemElements[activeSelectionIndex].textContent;
                }
                removeSuggestionContainer();
                dataStore.clear();
                lastKnownInputValue = inputField.value; // Update last value after selection
                activeSelectionIndex = -1;
            }
        };

        // Public API for the suggestion engine instance
        const engineOperations = {
            // Replaces AutocompleteProto.refresh and partly setOptions
            resetEngine: (newEngineConfig) => {
                updateConfiguration(newEngineConfig);
                compileDataItems();
                dataStore.clear();
                if (setupBrowserDatalist()) {
                    // Native datalist, re-populate if source is not DOM
                } else {
                    removeSuggestionContainer(); // Ensure custom UI is reset if switching modes
                }
            },
            // Replaces AutocompleteProto.addValues
            appendItems: (newElements) => {
                const initialCount = availableOptions.length;
                newElements.forEach(item => {
                    if (!availableOptions.includes(item)) {
                        availableOptions.push(item);
                    }
                });
                if (availableOptions.length > initialCount) {
                    availableOptions.sort((a, b) => a.localeCompare(b));
                    dataStore.clear(); // Clear cache as data changed
                    if (setupBrowserDatalist()) {
                        // Update datalist options
                    }
                }
            },
            // Replaces AutocompleteProto.removeValues
            discardItems: (elementsToRemove) => {
                const initialCount = availableOptions.length;
                availableOptions = availableOptions.filter(item => !elementsToRemove.includes(item));
                if (availableOptions.length < initialCount) {
                    dataStore.clear();
                    if (setupBrowserDatalist()) {
                        // Update datalist options
                    }
                }
            }
        };

        // Initial setup sequence
        updateConfiguration(primarySettings);
        compileDataItems(); // Load initial data

        // Attach initial event listeners based on configuration
        if (setupBrowserDatalist()) {
            // If using native datalist, we still need to capture input for the callback
            inputField.addEventListener('input', processInputChanges);
        } else {
            inputField.addEventListener('focus', handleFocusEvent);
            inputField.addEventListener('blur', handleBlurEvent);
        }

        // Handle case where input might already be focused on page load
        if (currentDocument.activeElement === inputField) {
            handleFocusEvent();
        }

        return engineOperations;
    }

    // Expose the factory function globally for external use
    masterWindow.SuggestionEngine = createSuggestionEngine;

})(window, document);