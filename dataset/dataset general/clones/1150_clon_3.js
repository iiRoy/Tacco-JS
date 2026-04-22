/*
 * comboSearch
 *
 * @Version: 1.0.0
 * @Author: CodeCloneBot
 * @License: Apache-2.0 - https://www.apache.org/licenses/LICENSE-2.0
 *
 * This jQuery-based utility enhances input fields, providing dynamic suggestions
 * sourced from both local data collections and external API endpoints.
 * It's designed for responsive user interfaces, offering a dual-layer search experience.
 * Minimum jQuery version requirement: 1.8+
 */

;(function(jQ) {

    // Internal collection of callable operations for the plugin.
    const pluginActions = {

        /**
         * Initializes the comboSearch functionality on selected elements.
         * @param {object} customSettings - User-provided configuration overrides.
         * @returns {jQuery} The jQuery object to allow chaining.
         */
        initialize: function (customSettings) {
            // Process each matched DOM element independently.
            return this.each(function(idx, domElement) {

                // Consolidate user settings with predefined defaults.
                const config = jQ.extend({}, jQ.fn.comboSearch.pluginDefaults, customSettings);

                // Ensure the target input field is valid and has an ID.
                if (!domElement || domElement.nodeName !== 'INPUT' || domElement.type !== 'text') {
                    console.warn('comboSearch: Initialization skipped for non-text input element.', domElement);
                    return;
                }

                const $searchField = jQ(domElement).addClass('cs-input-active');
                const elementId = $searchField.attr('id') || 'cs-gen-id-' + Math.random().toString(36).substr(2, 9);
                $searchField.attr('id', elementId); // Ensure an ID exists

                // Establish a container for the input and its associated suggestion box.
                const $mainContainer = jQ('<div class="cs-wrapper" id="cs-wrapper-' + elementId + '"></div>');
                $searchField.wrap($mainContainer);

                // Create the display panel for search results.
                const $outputPanel = jQ('<div class="cs-suggestions" id="cs-suggestions-' + elementId + '"></div>').hide();
                $searchField.after($outputPanel);

                // The unordered list where all suggestion entries will be rendered.
                const $suggestionList = jQ('<ul class="cs-list"></ul>')
                                          .css('width', $searchField.outerWidth())
                                          .appendTo($outputPanel);

                // Variable to retain the last successfully processed search term.
                let activeSearchTerm = jQ.trim($searchField.val());

                // Timer handle for managing input debouncing.
                let debounceHandle = null;

                // Reference to any ongoing AJAX request.
                let pendingAjax = null;

                // --- Helper Functions for Internal Logic ---

                /**
                 * Aborts any active AJAX call to prevent race conditions.
                 */
                const cancelPendingRequest = function() {
                    if (pendingAjax && pendingAjax.readyState !== 4) { // Check if request is still active
                        pendingAjax.abort();
                        pendingAjax = null;
                        if (config.debugMode) console.log('comboSearch: AJAX request aborted.');
                    }
                };

                /**
                 * Orchestrates a delayed search trigger based on user input.
                 * Clears previous timers to debounce input events.
                 */
                const triggerDelayedSearch = function() {
                    if (debounceHandle) {
                        clearTimeout(debounceHandle);
                        debounceHandle = null; // Clear the handle after clearing the timeout
                    }
                    debounceHandle = setTimeout(processInputChange, config.debounceDelay);
                };

                /**
                 * Determines if a given key code represents a special navigation/action key
                 * that should not trigger a search update on its own.
                 * @param {number} keyCode - The key code of the pressed key.
                 * @returns {boolean} True if it's a special key, false otherwise.
                 */
                const isNavigationOrModifierKey = function(keyCode) {
                    // Shift, Ctrl, Alt, Caps Lock, Home, End, Page Up, Page Down, Function keys, Windows/Command keys
                    return (keyCode >= 16 && keyCode <= 18) || // Shift, Ctrl, Alt
                           keyCode === 20 || // Caps Lock
                           (keyCode >= 33 && keyCode <= 36) || // Page Up, Page Down, End, Home
                           (keyCode >= 112 && keyCode <= 123) || // F1-F12
                           keyCode === 91 || keyCode === 93; // Left/Right Windows/Command key
                };

                /**
                 * Navigates the suggestion list using arrow keys.
                 * @param {string} direction - 'up' or 'down'.
                 */
                const navigateResults = function(direction) {
                    const $visibleItems = jQ('li.cs-result-entry:visible', $outputPanel);

                    if ($visibleItems.length === 0) {
                        return; // No visible items to navigate.
                    }

                    let $currentlyActive = jQ('li.cs-result-entry.active:first', $outputPanel);
                    let $highlightedItem;

                    if ($currentlyActive.length === 0) {
                        // No item is active, select the first or last depending on direction.
                        $highlightedItem = (direction === 'down') ? $visibleItems.eq(0) : $visibleItems.filter(':last');
                    } else {
                        // An item is active, move to the next/previous.
                        $highlightedItem = (direction === 'down') ? $currentlyActive.nextAll('.cs-result-entry:visible').first() : $currentlyActive.prevAll('.cs-result-entry:visible').first();

                        // Loop around if at the end/beginning.
                        if ($highlightedItem.length === 0) {
                             $highlightedItem = (direction === 'down') ? $visibleItems.eq(0) : $visibleItems.filter(':last');
                        }
                    }

                    $currentlyActive.removeClass('active');
                    $highlightedItem.addClass('active');

                    // Scroll the highlighted item into view if necessary.
                    if ($highlightedItem.length > 0) {
                        const itemTop = $highlightedItem.position().top;
                        const itemHeight = $highlightedItem.outerHeight();
                        const panelScrollTop = $outputPanel.scrollTop();
                        const panelHeight = $outputPanel.height();

                        if (itemTop < 0) {
                            $outputPanel.scrollTop(panelScrollTop + itemTop);
                        } else if (itemTop + itemHeight > panelHeight) {
                            $outputPanel.scrollTop(panelScrollTop + itemTop + itemHeight - panelHeight);
                        }
                    }

                    // Invoke custom callback for result focus.
                    if ($highlightedItem.length > 0) {
                        config.onResultHighlight.call($searchField[0], $highlightedItem.data('itemData'));
                    }

                    // Update input field with the selected item's display value.
                    const updatedInputText = $highlightedItem.length > 0
                        ? $highlightedItem.data('itemData')[config.displayProperty]
                        : activeSearchTerm; // Revert to original search if no item is highlighted

                    $searchField.val(updatedInputText);
                };

                /**
                 * Renders the provided data into the suggestion list.
                 * @param {Array|object} sourceData - The raw data to process.
                 * @param {string} searchPattern - The query string used for the search.
                 * @param {boolean} isLocalSource - True if data is from local source, false for remote.
                 */
                const renderSuggestions = function(sourceData, searchPattern, isLocalSource) {
                    const processedData = config.onDataProcessed.call($searchField[0], sourceData, searchPattern, isLocalSource);
                    const searchProperties = config.searchableProperties.split(',').map(prop => prop.trim());
                    let resultCounter = 0;

                    // Clear previous results only if it's local data or if no local source is configured.
                    // This allows remote results to append/replace local ones.
                    if (isLocalSource || !config.localDataSet) {
                        $suggestionList.empty();
                        $outputPanel.hide();
                        $searchField.removeClass('loading-state');
                    }

                    if (!processedData || !Array.isArray(processedData)) {
                        if (config.debugMode) console.warn('comboSearch: Invalid or empty data received for suggestions.', processedData);
                        return;
                    }

                    // Iterate through the data to find matches.
                    for (let i = 0; i < processedData.length; i++) {
                        const currentItem = processedData[i];
                        if (!currentItem || typeof currentItem !== 'object') continue;

                        let combinedSearchString = '';
                        for (let j = 0; j < searchProperties.length; j++) {
                            const propName = searchProperties[j];
                            combinedSearchString += (currentItem[propName] !== undefined ? currentItem[propName] : '') + ' ';
                        }
                        combinedSearchString = jQ.trim(combinedSearchString);

                        let comparisonPattern = searchPattern;
                        let comparisonTarget = combinedSearchString;

                        if (!config.caseSensitiveSearch) {
                            comparisonPattern = comparisonPattern.toLowerCase();
                            comparisonTarget = comparisonTarget.toLowerCase();
                        }

                        // Split query into words and check if all words are present (or any, depending on config)
                        const searchTokens = comparisonPattern.split(' ').filter(token => token.length > 0);
                        let isMatchFound = false;

                        if (searchTokens.length === 0) {
                            isMatchFound = true; // No search terms, consider all as match (or handle as no match)
                        } else {
                            // Check if ANY token matches. For ALL tokens, use `every`.
                            isMatchFound = searchTokens.some(token => comparisonTarget.includes(token));
                        }

                        if (isMatchFound) {
                            currentItem._dataSource = isLocalSource ? 'local' : 'remote';
                            currentItem._resultIndex = resultCounter;

                            let entryDetails = jQ.extend({}, currentItem); // Create a copy for highlighting

                            // Construct the list item.
                            const $resultEntry = jQ('<li class="cs-result-entry" id="cs-result-entry-' + elementId + '-' + i + '"></li>')
                                                    .data('itemData', currentItem); // Store original data

                            // Apply highlighting if enabled.
                            if (config.highlightMatches) {
                                for (const token of searchTokens) {
                                    if (token) {
                                        const regexFlags = config.caseSensitiveSearch ? 'g' : 'gi';
                                        // Regex to highlight without affecting HTML tags or entities.
                                        const matchRegex = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + jQ.escapeSelector(token) + ')(?![^<>]*>)(?![^&;]+;)', regexFlags);
                                        if (entryDetails[config.displayProperty]) {
                                            entryDetails[config.displayProperty] = String(entryDetails[config.displayProperty]).replace(matchRegex, '<em>$1</em>');
                                        }
                                    }
                                }
                            }

                            // Use custom formatter or default HTML.
                            const $renderedItem = config.formatResultItem
                                ? config.formatResultItem.call($searchField[0], entryDetails, $resultEntry)
                                : $resultEntry.html(entryDetails[config.displayProperty] || '[No Display Value]');

                            $suggestionList.append($renderedItem);
                            resultCounter++;

                            // Enforce result limit.
                            if (config.maxResultsLimit && resultCounter >= config.maxResultsLimit) {
                                break;
                            }
                        }
                    }

                    // Remove loading state.
                    $searchField.removeClass('loading-state');

                    // Display empty message if no results were found.
                    if (resultCounter === 0 && config.noResultsMessage) {
                        $suggestionList.html('<li class="cs-message">' + config.noResultsMessage + '</li>');
                    }

                    // Always show the panel if there are items or a message.
                    if (resultCounter > 0 || config.noResultsMessage) {
                        $outputPanel.show();
                    } else {
                        $outputPanel.hide();
                    }

                    // Trigger callback after rendering is complete.
                    config.onSuggestionsRendered.call($searchField[0], resultCounter);
                };

                /**
                 * Main function triggered by input changes, after debounce.
                 */
                const processInputChange = function() {
                    const rawInput = $searchField.val();
                    let processedQuery = jQ.trim(rawInput);

                    // Remove problematic characters and normalize whitespace.
                    processedQuery = processedQuery.replace(/[\\/]+/g, '').replace(/\s+/g, ' ');

                    // Store the current query for future reference.
                    activeSearchTerm = processedQuery;

                    // Validate minimum character length.
                    if (processedQuery.length < config.minimumInputLength) {
                        $outputPanel.hide();
                        $searchField.removeClass('loading-state');
                        cancelPendingRequest(); // Clear any pending requests if input is too short
                        return;
                    }

                    // Apply custom pre-retrieval transformation.
                    processedQuery = config.onBeforeDataFetch.call($searchField[0], processedQuery);

                    // Display loading indicator.
                    $searchField.addClass('loading-state');
                    if (config.loadingIndicatorText) {
                        $suggestionList.html('<li class="cs-message">' + config.loadingIndicatorText + '</li>');
                    }
                    $outputPanel.show(); // Ensure panel is visible for loading message.

                    // Handle local data source.
                    if (config.localDataSet) {
                        if (config.debugMode) console.log('comboSearch: Processing local data for query: ' + processedQuery);
                        // Process local data immediately.
                        renderSuggestions(config.localDataSet, processedQuery, true);
                    }

                    // Handle remote data source.
                    if (config.apiEndpoint) {
                        cancelPendingRequest(); // Abort previous AJAX request before starting a new one.

                        const requestParams = {};
                        requestParams[config.requestParamName] = processedQuery;

                        // Merge additional parameters.
                        jQ.extend(requestParams, config.additionalApiParams);

                        if (config.debugMode) console.log('comboSearch: Fetching remote data from ' + config.apiEndpoint + ' with params:', requestParams);

                        pendingAjax = jQ.getJSON(config.apiEndpoint, requestParams)
                            .done(function(response) {
                                if (config.debugMode) console.log('comboSearch: Remote data received.', response);
                                renderSuggestions(response, processedQuery, false);
                            })
                            .fail(function(xhr, status, error) {
                                if (status !== 'abort') { // Ignore aborted requests as failures
                                    console.error('comboSearch: Remote data fetch failed: ' + status + ' - ' + error, xhr);
                                    $searchField.removeClass('loading-state');
                                    // Optionally display an error message
                                    if (config.noResultsMessage) {
                                        $suggestionList.html('<li class="cs-message">' + config.noResultsMessage + '</li>');
                                        $outputPanel.show();
                                    } else {
                                        $outputPanel.hide();
                                    }
                                }
                            })
                            .always(function() {
                                pendingAjax = null; // Clear reference after completion (success or failure)
                            });
                    }
                    // If no local or remote source, just remove loading state and hide.
                    if (!config.localDataSet && !config.apiEndpoint) {
                        $searchField.removeClass('loading-state');
                        $outputPanel.hide();
                    }
                };

                // --- Event Handlers for User Interaction ---

                $searchField.on({
                    "focus.comboSearch": function() {
                        // Display suggestions if there's text and results might be available.
                        if (jQ.trim($searchField.val()) !== '') {
                            // Re-trigger search on focus if content is present, to refresh results.
                            triggerDelayedSearch();
                        }
                    },
                    "keydown.comboSearch": function(e) {
                        const pressedKey = e.keyCode;

                        switch(pressedKey) {
                            case 38: // Up arrow
                            case 40: // Down arrow
                                e.preventDefault(); // Prevent cursor movement in input
                                navigateResults(pressedKey === 38 ? 'up' : 'down');
                                break;

                            case 8: // Backspace
                                // If input is about to become empty, hide suggestions immediately.
                                if ($searchField.val().length <= 1) {
                                    $outputPanel.hide();
                                    cancelPendingRequest();
                                }
                                // Re-evaluate search after a short delay for debouncing.
                                triggerDelayedSearch();
                                break;

                            case 9:  // Tab
                            case 13: // Enter
                                const currentInputVal = jQ.trim($searchField.val());
                                const $activeResult = jQ('li.cs-result-entry.active:first', $suggestionList);

                                if ($activeResult.length > 0) {
                                    // An item is highlighted, trigger its selection.
                                    $activeResult.trigger('itemSelected');
                                    e.preventDefault(); // Prevent form submission or tab focus change.
                                } else if (currentInputVal.length >= config.minimumInputLength) {
                                    // No result highlighted, but input is long enough.
                                    // If 'allowNewEntry' is true and a custom handler exists, invoke it.
                                    if (config.allowNewEntry && typeof config.onNewEntry === 'function') {
                                        config.onNewEntry.call($searchField[0], currentInputVal);
                                        $outputPanel.hide();
                                        $searchField.val(''); // Clear input after new entry.
                                        e.preventDefault();
                                    }
                                    // Otherwise, allow default behavior (e.g., form submission for Enter).
                                }
                                break;

                            case 27: // Escape
                                cancelPendingRequest();
                                $outputPanel.hide();
                                $searchField.val(activeSearchTerm); // Revert to last searched term
                                break;

                            default:
                                // Ignore common modifier/navigation keys to prevent unnecessary searches.
                                if (isNavigationOrModifierKey(pressedKey) || pressedKey === 46) { // Delete key
                                    // Do nothing, but still allow event propagation for default behavior.
                                } else {
                                    // For other keys, trigger a delayed search.
                                    triggerDelayedSearch();
                                }
                                break;
                        }
                    },
                    "blur.comboSearch": function() {
                        // Hide results if the user is not interacting with the suggestion panel.
                        // Using a small delay to allow click events on suggestions to fire first.
                        setTimeout(function() {
                            if (!$outputPanel.is(':hover') && !$searchField.is(':focus')) {
                                $outputPanel.hide();
                                $searchField.val(activeSearchTerm); // Revert input if no selection was made
                            }
                        }, 150); // Small delay
                    },
                    // Custom event for programmatic search refresh.
                    "refreshSearch.comboSearch": function() {
                        triggerDelayedSearch();
                    },
                    // Custom event to programmatically set the input's value.
                    "updateValue.comboSearch": function(e, newValue) {
                        activeSearchTerm = newValue;
                        $searchField.val(newValue);
                    },
                    // Custom event to update plugin options dynamically.
                    "reconfigure.comboSearch": function(e, newOptions) {
                        jQ.extend(config, newOptions);
                        if (config.debugMode) console.log('comboSearch: Options reconfigured.', config);
                    },
                    // Custom event to clean up and destroy the plugin instance.
                    "destroy.comboSearch": function() {
                        cancelPendingRequest();
                        $outputPanel.remove();
                        $searchField.val('')
                                    .removeClass('cs-input-active loading-state')
                                    .off('.comboSearch') // Unbind all namespaced events
                                    .unwrap(); // Remove the wrapper div
                        if (config.debugMode) console.log('comboSearch: Plugin destroyed for #' + elementId);
                    }
                });

                // --- Event Delegation for Suggestion List Items ---
                $suggestionList.on({
                    "click": function(e) {
                        // Trigger a custom event that can be handled by the 'itemSelected' handler.
                        jQ(this).trigger("itemSelected");
                        e.stopPropagation(); // Prevent event bubbling up.
                    },
                    "mouseover": function() {
                        // Highlight item on mouseover.
                        jQ('li.cs-result-entry', $suggestionList).removeClass('active');
                        jQ(this).addClass('active');
                        // Invoke custom callback.
                        config.onResultHighlight.call($searchField[0], jQ(this).data('itemData'));
                    },
                    "itemSelected": function() { // Custom event handler for selection
                        const $selectedItem = jQ(this);
                        const itemData = $selectedItem.data('itemData');
                        const displayValue = itemData[config.displayProperty];

                        activeSearchTerm = displayValue;
                        $searchField.val(displayValue);

                        config.onItemSelection.call($searchField[0], itemData, $selectedItem);
                        $suggestionList.empty();
                        $outputPanel.hide();
                    }
                }, ".cs-result-entry"); // Delegate events to .cs-result-entry elements
            });
        },

        // --- Public API Methods ---

        /**
         * Triggers a new search operation programmatically.
         */
        refresh: function() {
            return this.each(function() {
                jQ(this).trigger("refreshSearch.comboSearch");
            });
        },

        /**
         * Sets the input field's value and updates the internal state.
         * @param {string} val - The new value to set.
         */
        setValue: function(val) {
            return this.each(function() {
                jQ(this).trigger("updateValue.comboSearch", val);
            });
        },

        /**
         * Updates the configuration options of an existing plugin instance.
         * @param {object} newOpts - New options to merge.
         */
        updateConfig: function(newOpts) {
            return this.each(function() {
                jQ(this).trigger("reconfigure.comboSearch", newOpts);
            });
        },

        /**
         * Removes the plugin functionality and cleans up DOM elements.
         */
        destroy: function() {
            return this.each(function() {
                jQ(this).trigger("destroy.comboSearch");
            });
        }
    };

    /**
     * Main plugin entry point, handles method calls or initialization.
     * @param {string|object} arg - Method name as string, or options object for initialization.
     * @returns {jQuery}
     */
    jQ.fn.comboSearch = function(arg) {
        if (typeof arg === 'string' && pluginActions[arg]) {
            // Call a specific method.
            return pluginActions[arg].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof arg === 'object' || !arg) {
            // Initialize the plugin.
            return pluginActions.initialize.apply(this, arguments);
        } else {
            // Handle invalid method calls.
            jQ.error('comboSearch: Unknown method or invalid arguments provided: ' + arg);
        }
    };

    // --- Default Configuration Options ---
    jQ.fn.comboSearch.pluginDefaults = {
        localDataSet: false,         // An array of objects for local search.
        apiEndpoint: false,          // URL for remote data retrieval (JSON expected).
        noResultsMessage: false,     // Message displayed when no suggestions are found.
        loadingIndicatorText: 'Fetching data...', // Text shown during remote data loading.
        allowNewEntry: false,        // If true, allows users to "add" input not found in suggestions (requires onNewEntry).
        displayProperty: 'name',     // Object property to display in the suggestion list.
        searchableProperties: 'name',// Comma-separated string of object properties to search within.
        requestParamName: 'q',       // Query parameter name for AJAX requests.
        maxResultsLimit: false,      // Maximum number of results to display.
        additionalApiParams: {},     // Key-value pairs to send with AJAX requests.
        caseSensitiveSearch: false,  // If true, search will be case-sensitive.
        minimumInputLength: 1,       // Minimum characters required to start a search.
        debounceDelay: 300,          // Delay in milliseconds after keyup before search triggers.
        highlightMatches: true,      // Enable/disable highlighting of matched text in results.
        debugMode: false,            // Enable console logging for debugging.

        // --- Callback Functions ---
        onItemSelection: function(selectedData, $selectedElement){}, // Fired when a suggestion is selected.
        onResultHighlight: function(highlightedData){},             // Fired when a suggestion is focused (mouseover/arrow keys).
        onNewEntry: false,                                          // Fired when allowNewEntry is true and user "submits" a non-matched term.
        formatResultItem: false,                                    // Custom function to format each list item HTML.
        onBeforeDataFetch: function(currentQuery){ return currentQuery; }, // Pre-process query before data retrieval.
        onDataProcessed: function(rawData, query, isLocal){ return rawData; }, // Post-process raw data before rendering.
        onSuggestionsRendered: function(resultCount){}              // Fired after suggestions are rendered and visible.
    };

})(jQuery);