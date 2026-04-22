(function($) {
    "use strict";

    // Establish a unique namespace within jQuery for our UI components.
    // This helps prevent conflicts with other libraries or plugins.
    $.utilityKit = $.utilityKit || {};

    // Define the core typeahead component within our utility namespace.
    // This object will house specific configurations and helper methods for typeahead functionality.
    $.utilityKit.typeahead = $.utilityKit.typeahead || {};

    // A global reference to the currently active (highlighted) suggestion element.
    // This is crucial for managing keyboard navigation within the suggestion list.
    let highlightedItem = null;

    // Define a map of key codes for common navigation and control keys.
    // Using constants enhances readability and maintainability.
    const NAVIGATION_KEYS = {
        ESCAPE_KEY: 27,
        ENTER_KEY: 13,
        TAB_KEY: 9,
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ARROW_UP_KEY: 38,
        ARROW_DOWN_KEY: 40
    };

    // The main jQuery plugin definition. This extends jQuery's prototype,
    // allowing developers to call `$(selector).typeahead(settings)` on elements.
    $.fn.typeahead = function(userSettings) {

        // Establish the default configuration for the typeahead component.
        // These settings can be completely overridden by the `userSettings` object.
        const defaultSettings = {
            // The debounce delay in milliseconds. Suggestions are updated only after
            // this period of inactivity following the last keystroke.
            queryDelay: 400,
            // If the number of matching suggestions exceeds this threshold, the list
            // will not be displayed to prevent overwhelming the user.
            maxSuggestionsThreshold: 90,
            // A boolean flag to control whether the suggestion box automatically
            // adjusts its width to match the input field's width.
            adaptWidthToInput: true,
            // An optional limit on the maximum number of suggestions to display.
            // If `null`, all matching suggestions will be shown (up to `maxSuggestionsThreshold`).
            resultLimit: null,
            // The minimum number of characters required in the input field before
            // suggestions start appearing. A value of 0 allows suggestions for an empty input.
            minimumInputLength: 1,
            // A function responsible for fetching the complete dataset of potential matches.
            // By default, it triggers an `updateSuggestionList` event with the `sourceList`
            // provided during initialization.
            retrieveSourceData: function(inputElement) {
                inputElement.triggerHandler("updateSuggestionList", [this.sourceList]);
            },
            // A predicate function used to determine if a specific data item matches
            // the user's current search pattern (regex).
            itemMatchPredicate: function(dataItem, searchPattern) {
                return searchPattern.test(dataItem);
            },
            // A factory function that generates the regular expression used for filtering.
            // It typically creates a case-insensitive regex from the `typedValue`.
            buildSearchRegex: function(typedValue) {
                return new RegExp(typedValue, "i");
            },
            // The core filtering function. It takes the full list and the input value,
            // then returns a subset of items that match the current search criteria.
            filterCandidateList: function(fullList, inputValue) {
                const searchRegex = this.buildSearchRegex(inputValue);
                let countOfItems = 0;

                // Utilizes `Array.prototype.filter` for efficient list filtering.
                const filteredItems = fullList.filter(item => {
                    // Enforce `resultLimit` if it's set.
                    if (this.resultLimit !== null && countOfItems >= this.resultLimit) {
                        return false;
                    }
                    if (this.itemMatchPredicate(item, searchRegex)) {
                        countOfItems++;
                        return true;
                    }
                    return false;
                });
                return filteredItems;
            },
            // Orchestrates the preparation and display of the suggestion list.
            // Returns the jQuery object of the suggestion container or `false` if no list should be shown.
            prepareDisplayList: function(rawSourceList, currentInputValue) {
                // Do not display if input length is below the minimum threshold.
                if (this.minimumInputLength > 0 && currentInputValue.length < this.minimumInputLength) {
                    return false;
                }

                const filteredResults = this.filterCandidateList(rawSourceList, currentInputValue);

                // Hide the list if there are no results or too many results.
                if (filteredResults.length === 0 || filteredResults.length > this.maxSuggestionsThreshold) {
                    return false;
                }
                // Proceed to construct the HTML markup for the filtered list.
                return this.constructListMarkup(filteredResults);
            },
            // Generates the HTML structure (e.g., `<ul><li>...</li></ul>`) for the list of suggestions.
            // Stores the original data object for each `<li>` using jQuery's `data()`.
            constructListMarkup: function(itemsToDisplay) {
                const listItemElements = itemsToDisplay.map(itemData => {
                    const listItem = $(this.itemTemplate(itemData));
                    listItem.data("originalData", itemData); // Store original data for later retrieval.
                    return listItem;
                });

                const suggestionContainer = $(this.containerWrapper).append(listItemElements);

                // Ensure the returned element is the actual wrapper, not a deeply nested child,
                // in case `containerWrapper` defines a complex structure.
                let finalContainer = suggestionContainer;
                const wrapperRootTag = $(this.containerWrapper)[0].tagName;
                while (finalContainer[0].tagName !== wrapperRootTag) {
                    finalContainer = finalContainer.children(':first');
                }
                return finalContainer;
            },
            // The HTML string used to wrap the suggestion list items (e.g., `<ul>`).
            containerWrapper: "<ul class='typeahead-suggestions'></ul>",
            // Positions the suggestion box relative to the input field and appends it to the document body.
            // Also handles setting the width and z-index.
            positionAndShowList: function(inputReference, suggestionBox) {
                const inputPosition = inputReference.offset();
                const containerWidth = this.adaptWidthToInput ? inputReference.outerWidth() : void 0;

                suggestionBox
                    .css({
                        position: "absolute",
                        top: inputPosition.top + inputReference.outerHeight(),
                        left: inputPosition.left,
                        width: containerWidth,
                        zIndex: 9999
                    })
                    .appendTo("body")
                    .show();
                return suggestionBox;
            },
            // The default method for removing the suggestion list from the DOM.
            hideAndRemoveList: function(suggestionBox) {
                suggestionBox.remove();
            },
            // A function that creates the HTML for a single list item (`<li>`).
            // It uses the `displayValueFormatter` to get the text content.
            itemTemplate: function(dataItem) { return `<li>${this.displayValueFormatter(dataItem)}</li>`; },
            // Extracts the text that should be displayed in the suggestion list and
            // inserted into the input field upon selection, from a given data item.
            displayValueFormatter: function(dataItem) { return dataItem; },
            // An optional callback function that is executed once for each input
            // field after the typeahead is initialized.
            onInitialize: null
        };

        // Merge the default settings with the user-provided settings.
        // `true` ensures a deep merge for nested objects.
        let settings = $.extend(true, {}, defaultSettings, userSettings);

        // Process any defined extensions for the typeahead component.
        // Extensions allow adding modular features like AJAX data loading.
        if ($.utilityKit.typeahead.extensions) {
            for (const extName in $.utilityKit.typeahead.extensions) {
                if (Object.prototype.hasOwnProperty.call($.utilityKit.typeahead.extensions, extName) && settings[extName] !== void 0) {
                    // Apply the extension, potentially modifying the `settings` object.
                    settings = $.extend(true, settings, $.utilityKit.typeahead.extensions[extName](settings));
                    delete settings[extName]; // Remove the extension flag from the final settings.
                }
            }
        }

        // Prevents the default tab key behavior when the typeahead suggestion list is active.
        function suppressTabKey(eventObject) {
            if ($.data(document.body, "typeaheadActive") && eventObject.which === NAVIGATION_KEYS.TAB_KEY) {
                eventObject.preventDefault();
            }
        }

        // Initiates a debounced timer for triggering the typeahead suggestion process.
        // Clears any previous timers to ensure suggestions are not updated too frequently.
        function startSuggestionTimer(eventObject, inputElement) {
            clearTimeout($.data(inputElement, "currentTimerId"));
            $.data(inputElement, "currentTimerId", window.setTimeout(function() {
                $(eventObject.target || eventObject.srcElement).triggerHandler("processTypeaheadInput");
            }, settings.queryDelay));
        }

        // A unified handler for keydown and keyup events on the input field.
        // Manages starting the suggestion timer based on key presses.
        function handleKeyActivity(eventObject) {
            const keyCode = eventObject.which || eventObject.keyCode;

            // If arrow keys are pressed and no timer is active, start one to refresh suggestions.
            if ((keyCode === NAVIGATION_KEYS.ARROW_UP_KEY || keyCode === NAVIGATION_KEYS.ARROW_DOWN_KEY) && !$.data(this, "currentTimerId")) {
                startSuggestionTimer(eventObject, this);
            }
            // If backspace or delete is pressed, reset the timer to immediately update suggestions.
            else if (keyCode === NAVIGATION_KEYS.BACKSPACE_KEY || keyCode === NAVIGATION_KEYS.DELETE_KEY) {
                clearTimeout($.data(this, "currentTimerId"));
                startSuggestionTimer(eventObject, this);
            }
            // For other keys, check if tab key behavior needs to be suppressed.
            else {
                suppressTabKey(eventObject);
            }
        }

        // Iterate over each selected input element to apply the typeahead functionality.
        return this.each(function() {
            const currentInputField = $(this);

            currentInputField
                .attr("autocomplete", "off") // Disable browser's native autocomplete.
                .on("keydown", handleKeyActivity)
                .on("keyup", handleKeyActivity)
                .on("keypress", function(eventObject) {
                    const keyCode = eventObject.keyCode || eventObject.which;
                    clearTimeout($.data(this, "currentTimerId")); // Clear any pending timer.

                    // If a key's default action was suppressed (e.g., by typeahead navigation),
                    // prevent its default behavior here too.
                    if ($.data(document.body, "keySuppressed")) {
                        $.data(document.body, "keySuppressed", false); // Reset the flag.
                        return false;
                    }
                    // If typeahead is active and a non-printable control key (excluding BS/DEL) is pressed.
                    else if ($.data(document.body, "typeaheadActive") && keyCode < 32 && keyCode !== NAVIGATION_KEYS.BACKSPACE_KEY && keyCode !== NAVIGATION_KEYS.DELETE_KEY) {
                        return false;
                    }
                    // For printable characters or backspace/delete, initiate the suggestion timer.
                    else if (keyCode === NAVIGATION_KEYS.BACKSPACE_KEY || keyCode === NAVIGATION_KEYS.DELETE_KEY || keyCode > 32) {
                        startSuggestionTimer(eventObject, this);
                    }
                })
                .on("processTypeaheadInput", function() {
                    const inputElementRef = $(this);

                    // Bind a one-time event handler for when the source data is retrieved and ready.
                    inputElementRef.one("updateSuggestionList", function(_event, sourceDataSet, inputQuery) {
                        // Attempt to generate the HTML for the suggestion display.
                        const suggestionDisplayContainer = settings.prepareDisplayList(sourceDataSet, inputQuery || inputElementRef.val());

                        // If `suggestionDisplayContainer` is `false`, it means no suggestions should be shown.
                        if (suggestionDisplayContainer === false) {
                            $("body").triggerHandler("deactivate.typeahead");
                            return; // Exit early if nothing to display.
                        }

                        // Display the generated list and activate the interactive navigation mode.
                        settings.currentSuggestionContainer = settings.positionAndShowList(inputElementRef, suggestionDisplayContainer);
                        $("body").activateTypeaheadNavigation(settings.currentSuggestionContainer, inputElementRef, settings.currentSuggestionContainer.find("li").length, settings);
                    });

                    // Trigger the data retrieval process.
                    settings.retrieveSourceData(inputElementRef);
                });

            // Execute the optional `onInitialize` callback if it's defined in the settings.
            if (typeof settings.onInitialize === "function") {
                settings.onInitialize(currentInputField);
            }
        });
    };

    // This function initializes and manages the interactive navigation mode for the suggestion list.
    // It handles keyboard events (arrows, enter, escape) and mouse interactions within the list.
    $.fn.activateTypeaheadNavigation = function(suggestionBox, originInput, numberOfSuggestions, currentConfig) {
        const originalInputValue = originInput.val(); // Store the input's value before interaction.
        let currentIndex = -1; // Tracks the index of the currently highlighted suggestion.
        let isMouseDown = false; // Flag to detect mouse button press for click vs. drag scenarios.

        // Set a global flag to indicate that typeahead navigation is currently active.
        $.data(document.body, "typeaheadActive", true);

        // Bind a one-time event handler for when the typeahead interaction is cancelled (e.g., Escape key).
        // It restores the input value and deactivates the navigation mode.
        $("body").one("cancel.typeahead", function() {
            originInput.triggerHandler("cancelled.typeahead");
            $("body").triggerHandler("deactivate.typeahead");
            originInput.val(originalInputValue); // Revert input field to its original content.
        });

        // Bind a one-time event handler for when a selection is confirmed (e.g., Enter key or click).
        // It triggers a custom event with the selected item's data.
        $("body").one("confirmSelection.typeahead", function() {
            if (highlightedItem && highlightedItem.length) {
                originInput.triggerHandler("itemConfirmed.typeahead", [highlightedItem.data("originalData"), highlightedItem]);
            }
            // If no item is highlighted but a mousedown occurred, it implies a click outside or drag.
            else if (isMouseDown) {
                isMouseDown = false;
                if (document.activeElement && document.activeElement !== originInput[0]) {
                    originInput.trigger("focus"); // Ensure focus returns to the input.
                }
                return false; // Suppress further actions.
            }
            $("body").triggerHandler("deactivate.typeahead"); // Deactivate navigation mode after selection.
        });

        // Bind a one-time event handler for deactivating the typeahead navigation mode.
        // This performs cleanup: hides the suggestion box and unbinds all related events.
        $("body").one("deactivate.typeahead", function() {
            currentConfig.hideAndRemoveList(suggestionBox); // Remove the suggestion box.
            $.data(document.body, "typeaheadActive", false); // Reset the global active flag.
            originInput.off("keydown.typeaheadNavigation"); // Unbind specific keydown handler.
            // Unbind all typeahead-related events from the body and window.
            $("body").add(window)
                .off("click.typeaheadNavigation")
                .off("cancel.typeahead")
                .off("confirmSelection.typeahead");
            highlightedItem = null; // Clear the reference to the highlighted item.
        });

        // Bind a click handler to the window. If a click bubbles up to the window,
        // it means the user clicked outside the typeahead, so cancel the interaction.
        $(window).on("click.typeaheadNavigation", function() {
            $("body").triggerHandler("cancel.typeahead");
        });

        // Function to visually update the highlighted suggestion in the list.
        const updateHighlight = function() {
            highlightedItem = suggestionBox.find("li")
                .removeClass("active-suggestion")
                .filter(":visible")
                .slice(currentIndex, currentIndex + 1)
                .addClass("active-suggestion");

            // If an item is highlighted, update the input field with its display value.
            if (highlightedItem.length) {
                originInput.triggerHandler("suggestionHighlighted.typeahead", [highlightedItem.data("originalData"), highlightedItem]);
                originInput.val(currentConfig.displayValueFormatter(highlightedItem.data("originalData")));
            }
            // If no item is highlighted (currentIndex is -1), restore the original input value.
            else {
                originInput.triggerHandler("noSuggestionHighlighted.typeahead");
                originInput.val(originalInputValue);
            }
        };

        // Event handlers for mouse interactions within the suggestion box.
        suggestionBox
            .on("mouseover", function(eventObject) {
                // Ignore mouseover events on the container itself, only process list item hovers.
                if (eventObject.target === this) { return; }
                const hoveredListItem = $(eventObject.target).closest('li');
                if (hoveredListItem.length) {
                    currentIndex = suggestionBox.find("li").index(hoveredListItem[0]);
                    updateHighlight(); // Apply visual highlight.
                }
            })
            // When the mouse leaves the suggestion box, clear any active highlighting.
            .on("mouseout", function() {
                currentIndex = -1; // Reset index.
                updateHighlight(); // Clear highlight.
            })
            // Set a flag on mousedown to distinguish between a click and a drag operation.
            .on("mousedown", function() { isMouseDown = true; })
            // On click, confirm the selection.
            .on("click.typeaheadNavigation", function() {
                $("body").triggerHandler("confirmSelection.typeahead");
                $.data(document.body, "keySuppressed", false); // Reset key suppression flag.
            });

        // Keydown handler specifically for navigating the suggestion list.
        originInput.on("keydown.typeaheadNavigation", function(eventObject) {
            const keyCode = eventObject.which || eventObject.keyCode;

            switch (keyCode) {
                case NAVIGATION_KEYS.ESCAPE_KEY:
                    $("body").triggerHandler("cancel.typeahead");
                    break;
                case NAVIGATION_KEYS.TAB_KEY:
                case NAVIGATION_KEYS.ENTER_KEY:
                    // If no item is explicitly highlighted, select the first one before confirming.
                    if (currentIndex === -1) {
                        currentIndex = currentIndex >= numberOfSuggestions - 1 ? 0 : currentIndex + 1;
                        updateHighlight();
                    }
                    $("body").triggerHandler("confirmSelection.typeahead");
                    break;
                case NAVIGATION_KEYS.ARROW_DOWN_KEY:
                    // Move highlight down, wrapping around to the top if at the end.
                    currentIndex = currentIndex >= numberOfSuggestions - 1 ? 0 : currentIndex + 1;
                    updateHighlight();
                    break;
                case NAVIGATION_KEYS.ARROW_UP_KEY:
                    // Move highlight up, wrapping around to the bottom if at the start.
                    currentIndex = currentIndex <= 0 ? numberOfSuggestions - 1 : currentIndex - 1;
                    updateHighlight();
                    break;
                default:
                    // For any other keys, allow the default input handling to proceed.
                    return true;
            }

            // Prevent the default action of the handled key (e.g., scrolling for arrow keys).
            eventObject.preventDefault();
            $.data(document.body, "keySuppressed", true); // Set flag to suppress subsequent keypress events.
        });
    };

})(jQuery);