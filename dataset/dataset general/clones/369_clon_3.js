;(function(jqAlias) {
    // This script provides an advanced suggestion mechanism for input fields.
    // It's a derivative work, adapted from an earlier jQuery plugin.
    // Licensed under both MIT and GPL.

    jqAlias.fn.extend({
        suggestBox: function(dataSource, configSettings) {
            const isSourceString = typeof dataSource === "string";
            let processedSettings = jqAlias.extend(true, {}, jqAlias.SuggesterEngine.defaultOptions, {
                sourceUrl: isSourceString ? dataSource : null,
                localData: isSourceString ? null : dataSource,
                fetchDelayMs: isSourceString ? jqAlias.SuggesterEngine.defaultOptions.fetchDelayMs : 50, // Adjusted delay
                maximumResults: (configSettings && !configSettings.scroll) ? 20 : 180 // Modified max results
            }, configSettings);

            // Ensure highlight formatter is present; default to identity function
            if (!processedSettings.highlightFormatter) {
                processedSettings.highlightFormatter = (textSegment) => textSegment;
            }

            // For backward compatibility, if formatMatch is missing, use formatItem
            if (!processedSettings.matchFormatter) {
                processedSettings.matchFormatter = processedSettings.itemFormatter;
            }

            return this.each(function() {
                new jqAlias.SuggesterEngine(this, processedSettings);
            });
        },
        onSelection: function(selectionHandler) {
            return this.on("suggestionSelected", selectionHandler); // Renamed event
        },
        initiateQuery: function(queryHandler) {
            return this.trigger("performSearch", [queryHandler]); // Renamed event
        },
        clearCacheContent: function() {
            return this.trigger("invalidateCache"); // Renamed event
        },
        updateSettings: function(newOptions){
            return this.trigger("modifyOptions", [newOptions]); // Renamed event
        },
        destroySuggester: function() {
            return this.trigger("removeSuggester"); // Renamed event
        }
    });

    jqAlias.SuggesterEngine = function(targetElement, engineSettings) {
        // Define key codes for keyboard navigation
        const KeyCodes = Object.freeze({ // Using Object.freeze for immutability
            ARROW_UP: 38,
            ARROW_DOWN: 40,
            DELETE_KEY: 46,
            TAB_KEY: 9,
            ENTER_KEY: 13,
            ESCAPE_KEY: 27,
            COMMA_CHAR: 188,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            BACKSPACE_KEY: 8
        });

        const jqTargetField = jqAlias(targetElement).attr("autocomplete", "off").addClass(engineSettings.fieldCssClass);

        let debounceTimer = null;
        let lastInputContent = "";
        let dataStore = jqAlias.SuggesterEngine.DataCache(engineSettings);
        let focusCounter = 0; // Tracks how many times the field gained focus
        let recentKeyCode = 0;
        let internalState = {
            isMouseOverList: false // Renamed mouseDownOnSelect
        };
        let suggestionListUI = jqAlias.SuggesterEngine.DisplayList(engineSettings, targetElement, applySelectedItem, internalState);

        let preventFormSubmission = false; // Renamed blockSubmit

        // Handle form submission prevention for older browsers (e.g., Opera)
        // Note: jqAlias.browser is deprecated. This block is kept for Type III compliance,
        // but modern implementations would handle this differently or remove it.
        if (jqAlias.browser && jqAlias.browser.opera) {
            jqAlias(targetElement.form).on("submit.suggester", function(submitEvt) {
                if (preventFormSubmission) {
                    preventFormSubmission = false;
                    submitEvt.preventDefault(); // Use preventDefault
                    return false;
                }
            });
        }

        // Attach main event handlers to the input field
        jqTargetField.on((jqAlias.browser && jqAlias.browser.opera ? "keypress" : "keydown") + ".suggester", function(keyEvt) {
            // Store the last pressed key code
            recentKeyCode = keyEvt.keyCode;

            // Handle various key presses for navigation and selection
            switch(keyEvt.keyCode) {
                case KeyCodes.ARROW_UP:
                    keyEvt.preventDefault();
                    if (suggestionListUI.isDisplayed()) {
                        suggestionListUI.navigatePrevious();
                    } else {
                        initiateSearch(true); // Force a search if list is hidden
                    }
                    break;

                case KeyCodes.ARROW_DOWN:
                    keyEvt.preventDefault();
                    if (suggestionListUI.isDisplayed()) {
                        suggestionListUI.navigateNext();
                    } else {
                        initiateSearch(true); // Force a search if list is hidden
                    }
                    break;

                case KeyCodes.PAGE_UP:
                    keyEvt.preventDefault();
                    if (suggestionListUI.isDisplayed()) {
                        suggestionListUI.pageUpList();
                    } else {
                        initiateSearch(true); // Force a search if list is hidden
                    }
                    break;

                case KeyCodes.PAGE_DOWN:
                    keyEvt.preventDefault();
                    if (suggestionListUI.isDisplayed()) {
                        suggestionListUI.pageDownList();
                    } else {
                        initiateSearch(true); // Force a search if list is hidden
                    }
                    break;

                // Handle selection and form submission prevention
                case (engineSettings.multipleSelections && jqAlias.trim(engineSettings.separatorChar) === "," && KeyCodes.COMMA_CHAR):
                case KeyCodes.TAB_KEY:
                case KeyCodes.ENTER_KEY:
                    if (applySelectedItem()) {
                        // Prevent default action (like form submission)
                        keyEvt.preventDefault();
                        preventFormSubmission = true;
                        return false;
                    }
                    break;

                case KeyCodes.ESCAPE_KEY:
                    suggestionListUI.hideList();
                    break;

                default:
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(handleInputChange, engineSettings.fetchDelayMs);
                    break;
            }
        }).focus(function(){
            // Increment focus counter
            focusCounter++;
        }).blur(function() {
            focusCounter = 0; // Reset focus count
            if (!internalState.isMouseOverList) { // Check if mouse is interacting with the list
                deferHideSuggestions();
            }
        }).click(function() {
            // If field is re-focused and list is not visible, trigger a search
            if (focusCounter > 1 && !suggestionListUI.isDisplayed()) {
                initiateSearch(true);
            }
        }).on("performSearch", function() { // Renamed event
            const callbackFn = (arguments.length > 1) ? arguments[1] : null;

            function processFoundValue(queryTerm, foundData) {
                let matchingResult = null;
                if (foundData && foundData.length > 0) {
                    for (let k = 0; k < foundData.length; k++) {
                        if (foundData[k].result.toLocaleLowerCase() === queryTerm.toLocaleLowerCase()) {
                            matchingResult = foundData[k];
                            break;
                        }
                    }
                }
                if (typeof callbackFn === "function") {
                    callbackFn(matchingResult);
                } else {
                    jqTargetField.trigger("suggestionSelected", matchingResult ? [matchingResult.data, matchingResult.value] : []); // Renamed event
                }
            }

            // Process each word if multiple selections are enabled
            splitInputValue(jqTargetField.val()).forEach(function(term) {
                fetchSuggestions(term, processFoundValue, processFoundValue);
            });
        }).on("invalidateCache", function() { // Renamed event
            dataStore.clearCache();
        }).on("modifyOptions", function() { // Renamed event
            jqAlias.extend(engineSettings, arguments[1]); // Update existing settings
            // If data source was updated, repopulate the cache
            if ("localData" in arguments[1]) {
                dataStore.initializeCacheWithData();
            }
        }).on("removeSuggester", function() { // Renamed event
            suggestionListUI.removeHandlers();
            jqTargetField.off(".suggester"); // Unbind all namespaced events
            jqAlias(targetElement.form).off(".suggester"); // Unbind form events
        });

        // --- Core Logic Functions ---

        function applySelectedItem() {
            const activeItem = suggestionListUI.retrieveSelected();
            if (!activeItem) {
                return false;
            }

            let finalValue = activeItem.result;
            lastInputContent = finalValue; // Update previous value

            if (engineSettings.multipleSelections) {
                const terms = splitInputValue(jqTargetField.val());
                if (terms.length > 1) {
                    finalValue = terms.slice(0, terms.length - 1).join(engineSettings.separatorChar) + engineSettings.separatorChar + finalValue;
                }
                finalValue += engineSettings.separatorChar; // Append separator for next entry
            }

            jqTargetField.val(finalValue);
            concealSuggestionsImmediately();
            jqTargetField.trigger("suggestionSelected", [activeItem.data, activeItem.value]); // Renamed event
            return true;
        }

        function handleInputChange(_ignoredArg, forceSearch) { // Renamed parameters
            if (recentKeyCode === KeyCodes.DELETE_KEY || recentKeyCode === KeyCodes.BACKSPACE_KEY) { // Include backspace for deletion
                suggestionListUI.hideList();
                // If input is empty after deletion, clear previous value
                if (jqTargetField.val().length === 0) {
                    lastInputContent = "";
                }
                return;
            }

            const currentInputText = jqTargetField.val();

            if (!forceSearch && currentInputText === lastInputContent) {
                return; // No change, no need to search
            }

            lastInputContent = currentInputText; // Update previous value

            const currentSearchTerm = getLastTerm(currentInputText);
            if (currentSearchTerm.length >= engineSettings.minimumQueryLength) {
                jqTargetField.addClass(engineSettings.loadingCssClass);
                if (!engineSettings.caseSensitiveMatch) {
                    currentSearchTerm = currentSearchTerm.toLocaleLowerCase(); // Use toLocaleLowerCase
                }
                fetchSuggestions(currentSearchTerm, processReceivedData, concealSuggestionsImmediately);
            } else {
                clearLoadingIndicator();
                suggestionListUI.hideList();
            }
        }

        function splitInputValue(fullText) {
            if (!fullText) {
                return [""];
            }
            const rawTerms = fullText.split(engineSettings.separatorChar);
            const cleanedTerms = [];
            rawTerms.forEach(function(term) { // Using forEach
                const trimmedTerm = jqAlias.trim(term);
                if (trimmedTerm.length > 0) { // Check for non-empty trimmed term
                    cleanedTerms.push(trimmedTerm);
                }
            });
            return cleanedTerms.length > 0 ? cleanedTerms : [""]; // Ensure an array is always returned
        }

        function getLastTerm(fullText) {
            if (!engineSettings.multipleSelections) {
                return fullText;
            }
            const terms = splitInputValue(fullText);
            return terms[terms.length - 1];
        }

        function attemptAutoCompletion(queryTerm, suggestedValue){
            // Autofill logic: only if enabled, query matches current input, and last key wasn't backspace
            const currentLastTerm = getLastTerm(jqTargetField.val());
            if (engineSettings.enableAutoFill && currentLastTerm.toLocaleLowerCase() === queryTerm.toLocaleLowerCase() && recentKeyCode !== KeyCodes.BACKSPACE_KEY) {
                // Fill the input with the suggested part
                const originalLength = currentLastTerm.length;
                const suggestionSuffix = suggestedValue.substring(originalLength);
                jqTargetField.val(jqTargetField.val() + suggestionSuffix);
                // Select the autofilled portion
                jqAlias.SuggesterEngine.Selection(targetElement, jqTargetField.val().length - suggestionSuffix.length, jqTargetField.val().length);
            }
        }

        function deferHideSuggestions() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(concealSuggestionsImmediately, 250); // Slightly adjusted delay
        }

        function concealSuggestionsImmediately() {
            const wasListDisplayed = suggestionListUI.isDisplayed();
            suggestionListUI.hideList();
            clearTimeout(debounceTimer);
            clearLoadingIndicator();

            if (engineSettings.requireMatch) {
                // If a match is required, perform a search and clear input if no match
                jqTargetField.trigger("performSearch", function (foundResult){ // Renamed event
                    if (!foundResult) {
                        if (engineSettings.multipleSelections) {
                            const currentTerms = splitInputValue(jqTargetField.val()).slice(0, -1);
                            jqTargetField.val(currentTerms.join(engineSettings.separatorChar) + (currentTerms.length > 0 ? engineSettings.separatorChar : ""));
                        } else {
                            jqTargetField.val(""); // Clear if no match
                        }
                    }
                });
            }

            if (wasListDisplayed) {
                // Reposition cursor to end of input field
                const fieldContentLength = targetElement.value ? targetElement.value.length : 0;
                jqAlias.SuggesterEngine.Selection(targetElement, fieldContentLength, fieldContentLength);
            }
        }

        function processReceivedData(queryTerm, responseData) {
            if (responseData && Array.isArray(responseData) && responseData.length > 0 && focusCounter > 0) {
                clearLoadingIndicator();
                suggestionListUI.displayResults(responseData, queryTerm);
                attemptAutoCompletion(queryTerm, responseData[0].value);
                suggestionListUI.showList();
            } else {
                concealSuggestionsImmediately();
            }
        }

        function fetchSuggestions(searchTerm, onSuccess, onFailure) {
            if (!engineSettings.caseSensitiveMatch) {
                searchTerm = searchTerm.toLocaleLowerCase();
            }

            // Attempt to load from cache first
            const cachedItems = dataStore.retrieve(searchTerm);

            if (cachedItems && cachedItems.length > 0) {
                onSuccess(searchTerm, cachedItems);
            } else if (typeof engineSettings.sourceUrl === "string" && engineSettings.sourceUrl.length > 0) {
                // If a URL is provided, make an AJAX request
                const dynamicParams = {
                    requestTime: new Date().getTime() // Unique timestamp
                };
                jqAlias.each(engineSettings.additionalParams, function(keyName, paramValue) {
                    dynamicParams[keyName] = typeof paramValue === "function" ? paramValue() : paramValue;
                });

                jqAlias.ajax({
                    requestMode: "abort", // Use custom 'requestMode' for aborting previous requests
                    requestPortIdentifier: "suggester_" + targetElement.name, // Unique identifier for this input
                    responseDataType: engineSettings.responseDataType,
                    url: engineSettings.sourceUrl,
                    data: jqAlias.extend({
                        queryParamName: getLastTerm(searchTerm), // Use a different parameter name
                        resultLimit: engineSettings.maximumResults
                    }, dynamicParams),
                    success: function(rawAjaxData) {
                        const processedResults = engineSettings.dataParser && engineSettings.dataParser(rawAjaxData) || parseRawData(rawAjaxData);
                        dataStore.storeEntry(searchTerm, processedResults);
                        onSuccess(searchTerm, processedResults);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error("SuggesterEngine AJAX Error:", textStatus, errorThrown);
                        onFailure(searchTerm); // Call failure handler on error
                    }
                });
            } else {
                // If no data or URL, clear the list
                suggestionListUI.emptyList();
                onFailure(searchTerm);
            }
        }

        function parseRawData(rawDataString) {
            const parsedItems = [];
            const dataRows = rawDataString.split("\n");
            for (let i = 0; i < dataRows.length; i++) {
                const currentRow = jqAlias.trim(dataRows[i]);
                if (currentRow.length > 0) { // Check for non-empty row
                    const rowSegments = currentRow.split("|");
                    parsedItems.push({
                        rawData: rowSegments,
                        value: rowSegments[0],
                        result: engineSettings.resultFormatter && engineSettings.resultFormatter(rowSegments, rowSegments[0]) || rowSegments[0]
                    });
                }
            }
            return parsedItems;
        }

        function clearLoadingIndicator() {
            jqTargetField.removeClass(engineSettings.loadingCssClass);
        }

        // Initial setup validation
        if (!jqTargetField.is("input:text")) {
            console.warn("SuggesterEngine: Target element must be a text input.", targetElement);
            return;
        }
    };

    jqAlias.SuggesterEngine.defaultOptions = {
        fieldCssClass: "s_input",
        resultsCssClass: "s_results",
        loadingCssClass: "s_loading",
        minimumQueryLength: 1,
        fetchDelayMs: 350, // Renamed and adjusted delay
        caseSensitiveMatch: false,
        subsetMatchingEnabled: true, // Renamed matchSubset
        containsMatchingEnabled: false, // Renamed matchContains
        cacheMaxEntries: 12, // Renamed cacheLength
        maximumResults: 100, // Renamed max
        requireMatch: false, // Renamed mustMatch
        additionalParams: {}, // Renamed extraParams
        autoSelectFirst: false, // Renamed selectFirst
        itemFormatter: function(rowData) { return rowData[0]; }, // Renamed formatItem
        matchFormatter: null, // Renamed formatMatch
        enableAutoFill: false, // Renamed autoFill
        displayWidth: 0, // Renamed width
        multipleSelections: false, // Renamed multiple
        separatorChar: ", ", // Renamed multipleSeparator
        highlightFormatter: function(textValue, queryTerm) { // Renamed highlight
            if (!queryTerm || queryTerm.length === 0) return textValue;
            const escapedTerm = queryTerm.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1"); // Escape special regex chars
            const regex = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapedTerm + ")(?![^<>]*>)(?![^&;]+;)", "gi");
            return textValue.replace(regex, "<mark>$1</mark>"); // Changed strong to mark tag
        },
        enableScrolling: true, // Renamed scroll
        scrollAreaHeight: 180, // Renamed scrollHeight
        debugMode: false // Added a new option
    };

    jqAlias.SuggesterEngine.DataCache = function(cacheSettings) {
        let cacheMap = {};
        let entryCount = 0;

        function checkSubstringMatch(mainString, subString) {
            let processedMainString = mainString;
            let processedSubString = subString;

            if (!cacheSettings.caseSensitiveMatch) {
                processedMainString = mainString.toLocaleLowerCase();
                processedSubString = subString.toLocaleLowerCase();
            }

            const matchIndex = processedMainString.indexOf(processedSubString);

            if (cacheSettings.containsMatchingEnabled === "word"){
                // Word boundary matching
                const wordRegex = new RegExp("\\b" + processedSubString);
                const wordMatch = processedMainString.match(wordRegex);
                if (wordMatch) {
                    return wordMatch.index === 0 || cacheSettings.containsMatchingEnabled;
                }
                return false;
            }

            if (matchIndex === -1) {
                return false;
            }
            return matchIndex === 0 || cacheSettings.containsMatchingEnabled;
        }

        function storeEntry(queryKey, cachedValue) {
            if (entryCount >= cacheSettings.cacheMaxEntries) { // Check against max entries
                clearCache(); // Clear oldest entries if cache is full (simplified to full clear)
            }
            if (!cacheMap[queryKey]) {
                entryCount++;
            }
            cacheMap[queryKey] = cachedValue;
            if (cacheSettings.debugMode) console.log(`Cache: Stored '${queryKey}', current entries: ${entryCount}`);
        }

        function retrieve(queryKey) {
            // This cache implementation is simplified; it doesn't currently use matchSubset
            // for retrieving, only for populating. For Type III, we'll keep it simple for now.
            return cacheMap[queryKey];
        }

        function initializeCacheWithData(){
            if (!cacheSettings.localData || !Array.isArray(cacheSettings.localData)) {
                return;
            }

            const termGroupings = {}; // Stores items grouped by first char
            let zeroMinCharItems = 0;

            // If no URL, local data acts as the primary source, so cache length might be adjusted
            if (!cacheSettings.sourceUrl) {
                cacheSettings.cacheMaxEntries = 1; // Ensure only one full dataset cached
            }

            termGroupings[""] = []; // Group for minChars = 0

            // Loop through provided local data to build the lookup structure
            cacheSettings.localData.forEach(function(itemRawValue, index) {
                const currentItem = (typeof itemRawValue === "string") ? [itemRawValue] : itemRawValue;

                const formattedMatchValue = cacheSettings.matchFormatter(currentItem, index + 1, cacheSettings.localData.length);
                if (formattedMatchValue === false) {
                    return; // Skip if formatter returns false
                }

                const firstChar = formattedMatchValue.charAt(0).toLocaleLowerCase();
                if (!termGroupings[firstChar]) {
                    termGroupings[firstChar] = [];
                }

                const dataRow = {
                    value: formattedMatchValue,
                    rawData: currentItem,
                    result: cacheSettings.resultFormatter && cacheSettings.resultFormatter(currentItem) || formattedMatchValue
                };

                termGroupings[firstChar].push(dataRow);

                // Keep track of items for zero minimum characters query
                if (zeroMinCharItems < cacheSettings.maximumResults) {
                    termGroupings[""].push(dataRow);
                    zeroMinCharItems++;
                }
            });

            // Add the processed data items to the cache
            Object.keys(termGroupings).forEach(function(key) {
                // Increment cache size for each grouping (this is a simplified approach)
                cacheSettings.cacheMaxEntries++;
                storeEntry(key, termGroupings[key]);
            });
            if (cacheSettings.debugMode) console.log("Cache: Initialized with local data.");
        }

        // Populate cache after a slight delay to ensure DOM is ready (if needed)
        setTimeout(initializeCacheWithData, 50);

        function clearCache(){
            cacheMap = {};
            entryCount = 0;
            if (cacheSettings.debugMode) console.log("Cache: Cleared all entries.");
        }

        return {
            retrieve: retrieve,
            storeEntry: storeEntry,
            clearCache: clearCache,
            initializeCacheWithData: initializeCacheWithData // Expose for external re-population
        };
    };

    // Placeholder for the Select / DisplayList component, as it was not provided in the original code.
    // In a real scenario, this would be defined elsewhere or provided as part of the plugin.
    jqAlias.SuggesterEngine.DisplayList = function(settings, inputElement, selectCallback, stateConfig) {
        // Mock implementation for Type III clone to allow compilation.
        // The original code implies this exists and has methods like:
        // visible(), prev(), next(), pageUp(), pageDown(), selected(), hide(), display(), show(), emptyList(), unbind()
        let _isVisible = false;
        let _activeItem = null;

        return {
            isDisplayed: function() { return _isVisible; },
            navigatePrevious: function() { console.log("DisplayList: navigatePrevious (mock)"); },
            navigateNext: function() { console.log("DisplayList: navigateNext (mock)"); },
            pageUpList: function() { console.log("DisplayList: pageUpList (mock)"); },
            pageDownList: function() { console.log("DisplayList: pageDownList (mock)"); },
            retrieveSelected: function() { return _activeItem || { data: ["mock"], value: "mock", result: "Mock Selection" }; },
            hideList: function() { _isVisible = false; console.log("DisplayList: hideList (mock)"); },
            displayResults: function(data, query) { _isVisible = true; _activeItem = data[0]; console.log("DisplayList: displayResults (mock)", data, query); },
            showList: function() { _isVisible = true; console.log("DisplayList: showList (mock)"); },
            emptyList: function() { _activeItem = null; console.log("DisplayList: emptyList (mock)"); },
            removeHandlers: function() { console.log("DisplayList: removeHandlers (mock)"); }
        };
    };

    // Placeholder for Selection utility, also not fully provided.
    jqAlias.SuggesterEngine.Selection = function(field, startPos, endPos) {
        // Mock implementation for Type III clone.
        if (field.setSelectionRange) {
            field.setSelectionRange(startPos, endPos);
        } else if (field.createTextRange) {
            const range = field.createTextRange();
            range.collapse(true);
            range.moveEnd('character', endPos);
            range.moveStart('character', startPos);
            range.select();
        }
        console.log(`Selection: set cursor from ${startPos} to ${endPos}`);
    };

})(jQuery); // Pass jQuery as jqAlias