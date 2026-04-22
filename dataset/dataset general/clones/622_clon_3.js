/*
 This code is a customized utility library for enhanced dropdown functionalities.
 It was developed in the early 2010s.

 This software is provided under the Apache License, Version 2.0. You may not use this file
 except in compliance with the License. A copy of the License is available at:

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License
 is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 Refer to the License for specific language governing permissions and limitations.
 */
(function (jq) {
    // Check if the fast iteration utility is already defined on jQuery prototypes
    if (typeof jq.fn.fastIterate === "undefined") {
        jq.fn.extend({
            /**
             * Optimized .each replacement for performance-critical loops.
             * This method can be significantly faster (4-10x) than standard .each.
             * Use with caution as it temporarily modifies the jQuery context for each iteration.
             * @param {Function} iterationCallback The function to execute for each element.
             *        It receives (index, currentJQueryObject) as arguments.
             *        'this' inside the callback refers to the raw DOM element.
             */
            fastIterate: function (iterationCallback) {
                var tempJqObj = jq([0]), // A minimal jQuery object to reuse
                    currentIndex = -1,
                    totalElements = this.length,
                    currentDomElement;

                // Loop through all elements in the collection
                while (
                    ++currentIndex < totalElements &&
                    (currentDomElement = this[currentIndex]) && // Get current DOM element
                    (tempJqObj.context = tempJqObj[0] = currentDomElement) && // Set context for the temp jQuery object
                    iterationCallback.call(currentDomElement, currentIndex, tempJqObj) !== false // Execute callback
                );
                return this; // Return the original jQuery collection for chaining
            }
        });
    }
})(jQuery);

(function (jq, someUndefined) {
    "use strict";
    /*global document, window, jQuery, console */

    // Ensure CustomDropdown is not already loaded
    if (window.CustomDropdown !== someUndefined) {
        return; // Exit if the component is already present
    }

    var KeyboardConstants,
        BaseDropdownComponent, // Placeholder for base dropdown logic
        SingleChoiceDropdown,  // Placeholder for single selection dropdown
        MultipleChoiceDropdown, // Placeholder for multi-selection dropdown
        generateUniqueId, // Function to create unique identifiers
        widthMeasuringElement; // Element used to calculate text width dynamically

    // Define common keyboard interaction codes
    KeyboardConstants = {
        TAB_KEY: 9,
        ENTER_KEY: 13,
        ESCAPE_KEY: 27,
        SPACE_KEY: 32,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        SHIFT_KEY: 16,
        CONTROL_KEY: 17,
        ALT_KEY: 18,
        PAGE_UP_KEY: 33,
        PAGE_DOWN_KEY: 34,
        HOME_KEY: 36,
        END_KEY: 35,
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,

        // Checks if the given key code represents an arrow key
        isNavigationArrow: function (keyCodeInput) {
            var actualKeyCode = keyCodeInput.which ? keyCodeInput.which : keyCodeInput;
            switch (actualKeyCode) {
                case KeyboardConstants.LEFT_ARROW:
                case KeyboardConstants.RIGHT_ARROW:
                case KeyboardConstants.UP_ARROW:
                case KeyboardConstants.DOWN_ARROW:
                    return true;
                default:
                    return false;
            }
        },

        // Determines if a control key was pressed
        isModifierKey: function (eventObject) {
            var pressedKeyCode = eventObject.which;
            switch (pressedKeyCode) {
                case KeyboardConstants.SHIFT_KEY:
                case KeyboardConstants.CONTROL_KEY:
                case KeyboardConstants.ALT_KEY:
                    return true;
                default:
                    if (eventObject.metaKey) { // Check for Command/Windows key
                        return true;
                    }
                    return false;
            }
        },

        // Verifies if the key pressed is a function key (F1-F12)
        isFunctionKey: function (keyCodeInput) {
            var actualKeyCode = keyCodeInput.which ? keyCodeInput.which : keyCodeInput;
            return actualKeyCode >= 112 && actualKeyCode <= 123;
        }
    };

    // Creates a closure to generate sequential unique IDs
    generateUniqueId = (function () {
        var currentIdCounter = 1000; // Starting ID for uniqueness
        return function () {
            return currentIdCounter++;
        };
    }());

    /**
     * Sanitizes an input string by escaping HTML entities.
     * @param {string} rawInput The string to escape.
     * @returns {string} The escaped string, or the original input if not a string.
     */
    function sanitizeHtmlContent(rawInput) {
        if (typeof rawInput === "string" && rawInput.length > 0) {
            return rawInput.replace(/&/g, "&amp;")
                           .replace(/</g, "&lt;")
                           .replace(/>/g, "&gt;")
                           .replace(/"/g, "&quot;")
                           .replace(/'/g, "&#039;"); // Also escape single quotes
        }
        return rawInput; // Return as-is if not a valid string
    }

    /**
     * Custom implementation of indexOf to find an element in an array.
     * Handles string comparisons with localeCompare for consistency.
     * @param {*} searchItem The value to search for.
     * @param {Array} targetArray The array to search within.
     * @returns {number} The index of the item, or -1 if not found.
     */
    function findItemIndex(searchItem, targetArray) {
        var idx = 0,
            arrLength = targetArray.length,
            currentArrayValue;

        if (searchItem === someUndefined || targetArray === someUndefined || !Array.isArray(targetArray)) {
            return -1; // Guard against invalid inputs
        }

        // Use localeCompare for string comparisons, otherwise strict equality
        if (typeof searchItem === "string") {
            for (; idx < arrLength; idx = idx + 1) {
                if (typeof targetArray[idx] === "string" && searchItem.localeCompare(targetArray[idx]) === 0) {
                    return idx;
                }
            }
        } else {
            for (; idx < arrLength; idx = idx + 1) {
                currentArrayValue = targetArray[idx];
                if (typeof currentArrayValue === "string") {
                    if (typeof searchItem === "string" && currentArrayValue.localeCompare(searchItem) === 0) {
                        return idx;
                    }
                } else {
                    if (currentArrayValue === searchItem) {
                        return idx;
                    }
                }
            }
        }
        return -1; // Item not found
    }

    /**
     * Compares two values for equality, specifically handling string comparisons with localeCompare.
     * @param {*} firstVal The first value.
     * @param {*} secondVal The second value.
     * @returns {boolean} True if values are considered equal, false otherwise.
     */
    function areValuesEquivalent(firstVal, secondVal) {
        if (firstVal === secondVal) return true; // Strict equality first
        if (firstVal === someUndefined || secondVal === someUndefined) return false;
        if (firstVal === null || secondVal === null) return false;

        // Use localeCompare for string comparisons
        if (typeof firstVal === "string") return firstVal.localeCompare(secondVal) === 0;
        if (typeof secondVal === "string") return secondVal.localeCompare(firstVal) === 0;

        return false; // Fallback for non-string, non-strictly-equal values
    }

    /**
     * Splits a string by a separator and trims each resulting part.
     * Returns an empty array if the input string is null or empty.
     * @param {string} inputString The string to split.
     * @param {string} delimiter The separator string.
     * @returns {Array<string>} An array of trimmed strings.
     */
    function tokenizeAndTrim(inputString, delimiter) {
        var processedTokens, k, totalParts;
        if (inputString === null || inputString.length < 1) {
            return [];
        }
        processedTokens = inputString.split(delimiter);
        for (k = 0, totalParts = processedTokens.length; k < totalParts; k = k + 1) {
            processedTokens[k] = jq.trim(processedTokens[k]);
        }
        return processedTokens;
    }

    /**
     * Calculates the total width of borders and padding for an element.
     * @param {jQuery} targetJqElement The jQuery object of the element.
     * @returns {number} The combined width of horizontal borders and padding.
     */
    function calculateHorizontalPaddingAndBorder(targetJqElement) {
        if (!targetJqElement || !targetJqElement.outerWidth || !targetJqElement.width) {
            console.warn("Invalid jQuery element provided for width calculation.");
            return 0;
        }
        return targetJqElement.outerWidth() - targetJqElement.width();
    }

    /**
     * Attaches keyup-change event handling to an input element.
     * This custom event fires only when the input's value actually changes on keyup.
     * @param {jQuery} inputJqElement The jQuery object of the input field.
     */
    function setupValueChangeDetection(inputJqElement) {
        var storedValueKey = "input-prev-value"; // Unique data key

        inputJqElement.on("keydown", function () {
            if (jq.data(inputJqElement[0], storedValueKey) === someUndefined) {
                // Store initial value on keydown if not already stored
                jq.data(inputJqElement[0], storedValueKey, inputJqElement.val());
            }
        });

        inputJqElement.on("keyup", function () {
            var previousValue = jq.data(inputJqElement[0], storedValueKey);
            // Compare current value with stored value
            if (previousValue !== someUndefined && inputJqElement.val() !== previousValue) {
                jq.removeData(inputJqElement[0], storedValueKey); // Clear stored value
                inputJqElement.trigger("keyup-change"); // Trigger custom event
            }
        });
    }

    // Global document delegate to track the last mouse position
    jq(document).on("mousemove", "*", function (eventData) {
        jq.data(document, "custom-dropdown-last-mouse-position", {x: eventData.pageX, y: eventData.pageY});
    });

    /**
     * Installs a filtered mousemove event handler.
     * The `mousemove-filtered` event is triggered only if the mouse cursor
     * has actually moved, preventing spurious events from scrolling.
     * @param {jQuery} targetElement The element to attach the handler to.
     */
    function installFilteredMouseMovement(targetElement) {
        targetElement.on("mousemove", function (currentEvent) {
            var lastRecordedPosition = jq.data(document, "custom-dropdown-last-mouse-position");
            // Only trigger if mouse position has changed
            if (lastRecordedPosition === someUndefined || lastRecordedPosition.x !== currentEvent.pageX || lastRecordedPosition.y !== currentEvent.pageY) {
                jq(currentEvent.target).trigger("mousemove-filtered", currentEvent);
            }
        });
    }

    /**
     * Creates a debounced version of a function. The function will only execute
     * if no further calls are made within the specified delay period.
     * @param {number} delayMs The time in milliseconds to wait before invoking the function.
     * @param {Function} originalFunction The function to debounce.
     * @returns {Function} The debounced function.
     */
    function createDebouncedFunction(delayMs, originalFunction) {
        var timerIdentifier;
        return function () {
            var context = this, args = arguments;
            window.clearTimeout(timerIdentifier);
            timerIdentifier = window.setTimeout(function () {
                originalFunction.apply(context, args);
            }, delayMs);
        };
    }

    /**
     * Implements a thunk for lazy evaluation.
     * The provided formula function is executed only once, and its result is cached.
     * @param {Function} initializationFormula The function to execute for initial value.
     * @returns {Function} A function that returns the cached value.
     */
    function createLazyValueThunk(initializationFormula) {
        var hasBeenEvaluated = false,
            cachedResult;
        return function () {
            if (hasBeenEvaluated === false) {
                cachedResult = initializationFormula();
                hasBeenEvaluated = true;
            }
            return cachedResult;
        };
    }

    /**
     * Attaches a debounced scroll event handler to an element.
     * The 'scroll-debounced' event fires only after scrolling has paused for 'debounceTime'.
     * @param {number} debounceTime The delay in milliseconds for debouncing.
     * @param {jQuery} scrollTargetElement The element to monitor for scroll events.
     */
    function setupDebouncedScroll(debounceTime, scrollTargetElement) {
        var debouncedNotification = createDebouncedFunction(debounceTime, function (originalEvent) {
            scrollTargetElement.trigger("scroll-debounced", originalEvent);
        });

        scrollTargetElement.on("scroll", function (scrollEvent) {
            // Ensure the event originated from within the target element or its children
            if (scrollTargetElement.has(scrollEvent.target).length > 0 || scrollTargetElement.is(scrollEvent.target)) {
                debouncedNotification(scrollEvent);
            }
        });
    }

    /**
     * Prevents default behavior and stops propagation of an event.
     * @param {Event} eventToCancel The event object.
     */
    function haltEventPropagation(eventToCancel) {
        if (eventToCancel) {
            eventToCancel.preventDefault();
            eventToCancel.stopPropagation();
        }
    }

    /**
     * Measures the rendered width of text within an input element.
     * A hidden `div` element is used to replicate the input's styling and measure text width.
     * @param {jQuery} inputElementToMeasure The jQuery object of the input field.
     * @returns {number} The width of the text in pixels.
     */
    function calculateTextRenderedWidth(inputElementToMeasure) {
        // Create the measurement div once and reuse it
        if (!widthMeasuringElement) {
            var computedStyles = inputElementToMeasure[0].currentStyle || window.getComputedStyle(inputElementToMeasure[0], null);
            widthMeasuringElement = jq("<div></div>").css({
                position: "absolute",
                left: "-10000px",
                top: "-10000px",
                display: "none", // Hidden by default
                // Copy relevant font styles for accurate measurement
                fontSize: computedStyles.fontSize,
                fontFamily: computedStyles.fontFamily,
                fontStyle: computedStyles.fontStyle,
                fontWeight: computedStyles.fontWeight,
                letterSpacing: computedStyles.letterSpacing,
                textTransform: computedStyles.textTransform,
                whiteSpace: "nowrap" // Prevent wrapping
            });
            jq("body").append(widthMeasuringElement); // Add to DOM
        }
        widthMeasuringElement.text(inputElementToMeasure.val()); // Set text to measure
        widthMeasuringElement.css("display", "block"); // Make visible for measurement
        var measuredWidth = widthMeasuringElement.width();
        widthMeasuringElement.css("display", "none"); // Hide again
        return measuredWidth;
    }

    /**
     * Highlights occurrences of a search term within a given text by wrapping them in a span.
     * @param {string} sourceText The original text.
     * @param {string} searchTerm The term to highlight.
     * @param {Array<string>} outputFragments An array to append the text fragments to.
     */
    function applySearchHighlighting(sourceText, searchTerm, outputFragments) {
        var matchPosition = sourceText.toUpperCase().indexOf(searchTerm.toUpperCase()),
            termLength = searchTerm.length;

        if (matchPosition < 0) {
            outputFragments.push(sourceText); // No match, push original text
            return;
        }

        // Push parts of the string with highlighting
        outputFragments.push(sourceText.substring(0, matchPosition));
        outputFragments.push("<span class='custom-dropdown-highlight'>");
        outputFragments.push(sourceText.substring(matchPosition, matchPosition + termLength));
        outputFragments.push("</span>");
        outputFragments.push(sourceText.substring(matchPosition + termLength, sourceText.length));
    }

    /**
     * Generates an AJAX-based query function for fetching data.
     * @param {object} queryConfig Configuration object for the AJAX request.
     * @param {Function} queryConfig.transport Function for executing the AJAX request (e.g., $.ajax).
     * @param {string} queryConfig.requestUrl URL for the data endpoint.
     * @param {Function} queryConfig.data Function(searchTerm, pageNumber, context) to generate request parameters.
     * @param {string} queryConfig.dataType Data type of the response (e.g., 'json', 'jsonp').
     * @param {boolean} queryConfig.traditional Whether to use traditional parameter serialization.
     * @param {string} queryConfig.method HTTP method ('GET' or 'POST').
     * @param {number} [queryConfig.throttleDelay=100] Milliseconds to wait before making the request.
     * @param {Function} queryConfig.responseHandler Function(remoteData, pageNumber) to process raw response.
     * @returns {Function} The query function that takes {term, page, context, callback} as arguments.
     */
    function createAjaxQueryFunction(queryConfig) {
        var requestDelayTimer,         // Timer for debouncing requests
            sequenceCounter = 0,       // Counter to prevent out-of-order responses
            currentRequestHandler = null, // Holds the current AJAX request object
            waitPeriodMs = queryConfig.throttleDelay || 100;

        return function (queryParameters) {
            window.clearTimeout(requestDelayTimer); // Clear any pending requests

            requestDelayTimer = window.setTimeout(function () {
                sequenceCounter += 1; // Increment sequence for the new request
                var currentRequestNumber = sequenceCounter, // Capture current sequence number
                    dataBuilder = queryConfig.data,
                    ajaxTransport = queryConfig.transport || jq.ajax,
                    useTraditionalSerialization = queryConfig.traditional || false,
                    requestMethod = queryConfig.method || 'GET';

                // Prepare data payload for the request
                var requestPayload = dataBuilder.call(this, queryParameters.term, queryParameters.page, queryParameters.context);

                // Abort any previous active request to prevent race conditions
                if (currentRequestHandler !== null && currentRequestHandler.readyState !== 4) {
                    currentRequestHandler.abort();
                }

                currentRequestHandler = ajaxTransport.call(null, {
                    url: queryConfig.requestUrl,
                    dataType: queryConfig.dataType,
                    data: requestPayload,
                    type: requestMethod,
                    traditional: useTraditionalSerialization,
                    success: function (responseData) {
                        // Ignore responses that are older than the most recent request
                        if (currentRequestNumber < sequenceCounter) {
                            return;
                        }
                        console.log("AJAX request successful for term:", queryParameters.term);
                        var processedResults = queryConfig.responseHandler(responseData, queryParameters.page);
                        queryParameters.callback(processedResults); // Pass results to callback
                    },
                    error: function(xhr, status, error) {
                        if (currentRequestNumber < sequenceCounter) {
                            return; // Ignore if a newer request has been made
                        }
                        console.error("AJAX request failed:", status, error, xhr);
                        queryParameters.callback({ results: [], more: false }); // Provide empty results on error
                    }
                });
            }, waitPeriodMs);
        };
    }

    /**
     * Creates a query function that operates on a local array of data.
     * The input 'configSettings' can be an array of objects ({id, text}) or an object
     * with 'results' (array of data) and 'text' (key name or function for text extraction).
     * @param {Array|object} configSettings The local data source configuration.
     * @returns {Function} A query function accepting {term, callback, matcher} as arguments.
     */
    function createLocalQueryFunction(configSettings) {
        var sourceDataArray = configSettings, // The array of items
            textKeyName,
            textExtractorFn = function (item) { return "" + item.text; }; // Default text extractor

        // If configSettings is an object, extract 'results' and 'text' configuration
        if (!jq.isArray(sourceDataArray)) {
            textExtractorFn = sourceDataArray.text;
            // If 'text' is not a function, assume it's a string key name
            if (!jq.isFunction(textExtractorFn)) {
                textKeyName = sourceDataArray.text;
                textExtractorFn = function (item) { return item[textKeyName]; };
            }
            sourceDataArray = sourceDataArray.results;
        }

        return function (queryDetails) {
            var searchInput = queryDetails.term,
                filteredResultsContainer = { results: [] };

            if (!sourceDataArray || sourceDataArray.length === 0) {
                queryDetails.callback(filteredResultsContainer);
                return;
            }

            if (searchInput === "") {
                // If no search term, return all data
                queryDetails.callback({results: sourceDataArray});
                return;
            }

            // Filter data based on the matcher function
            filteredResultsContainer.results = jq(sourceDataArray)
                .filter(function () { return queryDetails.matcher(searchInput, textExtractorFn(this)); })
                .get(); // Convert jQuery object back to array
            queryDetails.callback(filteredResultsContainer);
        };
    }

    /**
     * Creates a query function for 'tags' mode, allowing dynamic tag creation.
     * @param {Array|Function} tagData The source data for tags (array or function).
     * @returns {Function} A query function that takes {term, callback, matcher} as arguments.
     */
    function createTagQueryFunction(tagData) {
        // If tagData is already a function, return it directly
        if (jq.isFunction(tagData)) {
            return tagData;
        }

        // Otherwise, assume it's an array and create a wrapper function
        return function (queryInfo) {
            var currentSearchTerm = queryInfo.term,
                processedResults = {results: []};

            jq(tagData).each(function () {
                var isComplexObject = (this && typeof this === 'object' && this.text !== someUndefined),
                    itemText = isComplexObject ? this.text : this;

                // Add item if search term is empty or if it matches
                if (currentSearchTerm === "" || queryInfo.matcher(currentSearchTerm, itemText)) {
                    processedResults.results.push(isComplexObject ? this : {id: this, text: this});
                }
            });
            queryInfo.callback(processedResults);
        };
    }

    /**
     * Validates if a given input is a function to be used as a formatter.
     * Throws an error if it's not a function and not falsy.
     * @param {*} formattingFunction The function to check.
     * @param {string} functionIdentifier A descriptive name for the function (for error messages).
     * @returns {boolean} True if it's a function, false if falsy, otherwise throws.
     */
    function validateFormatterFunction(formattingFunction, functionIdentifier) {
        if (jq.isFunction(formattingFunction)) return true;
        if (!formattingFunction) return false; // Falsy values are acceptable (no formatting)
        throw new Error(functionIdentifier + " must be a function or a falsy value.");
    }

    /**
     * Evaluates a value, if it's a function, it's called; otherwise, the value itself is returned.
     * @param {*} inputVal The value or function to evaluate.
     * @returns {*} The result of the function call or the original value.
     */
    function resolveValueOrFunction(inputVal) {
        return jq.isFunction(inputVal) ? inputVal() : inputVal;
    }

    /**
     * Recursively counts the total number of individual items in a hierarchical result set.
     * @param {Array} dataItems An array of items, potentially with 'children' arrays.
     * @returns {number} The total count of leaf items.
     */
    function tallyLeafItems(dataItems) {
        var totalCount = 0;
        if (!Array.isArray(dataItems)) {
            return 0; // Guard against non-array input
        }

        for (var i = 0; i < dataItems.length; i++) {
            var currentItem = dataItems[i];
            if (currentItem && Array.isArray(currentItem.children)) {
                totalCount += tallyLeafItems(currentItem.children); // Recurse for children
            } else {
                totalCount++; // Count leaf item
            }
        }
        return totalCount;
    }

    /**
     * Default tokenizer function for processing user input based on token separators.
     * It extracts tokens, checks for duplicates, and calls a callback to add valid choices.
     * @param {string} currentInput User's typed or pasted text.
     * @param {Array} selectedChoices Currently selected items.
     * @param {Function} addChoiceCallback Function(choice) to add a new choice.
     * @param {object} pluginOptions Configuration options for the tokenizer.
     * @returns {string|undefined} The modified input string, or undefined to keep original.
     */
    function processInputTokens(currentInput, selectedChoices, addChoiceCallback, pluginOptions) {
        var initialInputState = currentInput,
            isDuplicateEntry = false,
            extractedToken,
            separatorPosition,
            loopIndex, listLength,
            matchedSeparator;

        // Exit if tokenizer options are not configured
        if (!pluginOptions.createSearchChoice || !pluginOptions.tokenSeparators || pluginOptions.tokenSeparators.length < 1) {
            return someUndefined;
        }

        // Loop to find and process tokens
        while (true) {
            separatorPosition = -1;

            // Find the first occurrence of any defined separator
            for (loopIndex = 0, listLength = pluginOptions.tokenSeparators.length; loopIndex < listLength; loopIndex++) {
                matchedSeparator = pluginOptions.tokenSeparators[loopIndex];
                separatorPosition = currentInput.indexOf(matchedSeparator);
                if (separatorPosition >= 0) break; // Separator found, break inner loop
            }

            if (separatorPosition < 0) break; // No separator found, exit outer loop

            // Extract the token and remaining input
            extractedToken = currentInput.substring(0, separatorPosition);
            currentInput = currentInput.substring(separatorPosition + matchedSeparator.length);

            if (extractedToken.length > 0) {
                // Create a choice object from the token
                var newChoice = pluginOptions.createSearchChoice(extractedToken, selectedChoices);

                // Validate the new choice and its ID
                if (newChoice !== someUndefined && newChoice !== null &&
                    pluginOptions.id(newChoice) !== someUndefined && pluginOptions.id(newChoice) !== null) {

                    isDuplicateEntry = false;
                    // Check if this choice is already selected
                    for (loopIndex = 0, listLength = selectedChoices.length; loopIndex < listLength; loopIndex++) {
                        if (areValuesEquivalent(pluginOptions.id(newChoice), pluginOptions.id(selectedChoices[loopIndex]))) {
                            isDuplicateEntry = true;
                            break;
                        }
                    }

                    if (!isDuplicateEntry) {
                        addChoiceCallback(newChoice); // Add the new valid choice
                    }
                }
            }
        }

        // If the input string has changed, return the new string; otherwise, return undefined
        if (initialInputState.localeCompare(currentInput) !== 0) {
            return currentInput;
        }
        return someUndefined;
    }

    // Initialize global event handlers on document ready
    jq(document).ready(function () {
        jq(document).on("mousedown touchend", "*", function (eventObj) {
            var eventTargetContainer = jq(eventObj.target).closest("div.custom-dropdown-main-wrapper").get(0),
                labelAttribute;

            // Blur any active dropdown containers if a click occurs outside them
            if (eventTargetContainer) {
                jq(document).find("div.custom-dropdown-active-wrapper").each(function () {
                    if (this !== eventTargetContainer) {
                        var instance = jq(this).data("customDropdownInstance");
                        if (instance && typeof instance.blur === 'function') {
                            instance.blur();
                        }
                    }
                });
            } else {
                // Also handle clicks outside the dropdown panel itself
                eventTargetContainer = jq(eventObj.target).closest("div.custom-dropdown-pane").get(0);
                jq(document).find("div.custom-dropdown-active-pane").each(function () {
                    if (this !== eventTargetContainer) {
                        var instance = jq(this).data("customDropdownInstance");
                        if (instance && typeof instance.blur === 'function') {
                            instance.blur();
                        }
                    }
                });
            }

            // Handle clicks on <label> tags that focus an associated dropdown
            var actualTarget = jq(eventObj.target);
            if (actualTarget.prop("tagName") === "LABEL") {
                labelAttribute = actualTarget.attr("for");
                if (labelAttribute && labelAttribute.length > 0) {
                    var associatedElement = jq("#" + labelAttribute);
                    var dropdownInstance = associatedElement.data("customDropdownInstance");
                    if (dropdownInstance !== someUndefined && typeof dropdownInstance.focus === 'function') {
                        dropdownInstance.focus();
                        eventObj.preventDefault(); // Prevent default label behavior
                        console.log("Label clicked, focusing associated custom dropdown.");
                    }
                }
            }
        });
    });

    // Assign the main utility functions to the global scope for external access
    window.CustomDropdown = {
        KeyboardConstants: KeyboardConstants,
        generateUniqueId: generateUniqueId,
        sanitizeHtmlContent: sanitizeHtmlContent,
        findItemIndex: findItemIndex,
        areValuesEquivalent: areValuesEquivalent,
        tokenizeAndTrim: tokenizeAndTrim,
        calculateHorizontalPaddingAndBorder: calculateHorizontalPaddingAndBorder,
        setupValueChangeDetection: setupValueChangeDetection,
        installFilteredMouseMovement: installFilteredMouseMovement,
        createDebouncedFunction: createDebouncedFunction,
        createLazyValueThunk: createLazyValueThunk,
        setupDebouncedScroll: setupDebouncedScroll,
        haltEventPropagation: haltEventPropagation,
        calculateTextRenderedWidth: calculateTextRenderedWidth,
        applySearchHighlighting: applySearchHighlighting,
        createAjaxQueryFunction: createAjaxQueryFunction,
        createLocalQueryFunction: createLocalQueryFunction,
        createTagQueryFunction: createTagQueryFunction,
        validateFormatterFunction: validateFormatterFunction,
        resolveValueOrFunction: resolveValueOrFunction,
        tallyLeafItems: tallyLeafItems,
        processInputTokens: processInputTokens
        // BaseDropdownComponent, SingleChoiceDropdown, MultipleChoiceDropdown are declared but not defined here in the original,
        // so they would be defined elsewhere or are placeholders.
    };

})(jQuery, undefined);