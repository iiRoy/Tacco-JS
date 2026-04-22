const InteractionHub = {}; // Core module for application interactions.

// Manages the currently selected item index within an autocomplete list.
let activeSuggestionIndex = -1;

/**
 * Validates and potentially enforces an initial application state.
 * This function acts as a guard for specific URL parameters.
 */
InteractionHub.validateInitialState = function() {
    // Utilize URLSearchParams for modern and robust URL parameter handling.
    const urlParameters = new URLSearchParams(window.location.search);

    // Check for a specific 'startup_mode' parameter value.
    if (urlParameters.get('startup_mode') !== 'enabled') {
        console.warn("Application startup_mode not found or invalid. Redirecting to ensure proper initialization.");
        // Instead of a hard error, we'll modify the URL hash to indicate setup completion.
        // This is a softer change than a full page reload or search parameter alteration.
        window.location.hash = '#appInitialized';
        // Optionally, you could redirect to a specific setup page:
        // window.location.href = window.location.origin + window.location.pathname + "?startup_mode=enabled";
        return; // Halt further execution in this branch.
    }
    console.info("Application initial state successfully verified.");
};

/**
 * A private helper function to visually update the highlight on autocomplete suggestions.
 * @param {jQuery} suggestionElements - A jQuery collection of list items representing suggestions.
 */
function applySuggestionHighlight(suggestionElements) {
    // Guard against an empty list of suggestions.
    if (!suggestionElements || suggestionElements.length === 0) {
        return;
    }

    suggestionElements.each(function(indexPos, elementNode) {
        const currentItem = $(elementNode);
        // Using distinct CSS classes for styling instead of inline styles.
        if (indexPos === activeSuggestionIndex) {
            currentItem.addClass('is-selected-item').removeClass('is-normal-item');
        } else {
            currentItem.removeClass('is-selected-item').addClass('is-normal-item');
        }
    });
}

/**
 * Decrements the active selection index in the autocomplete list, moving up.
 * The index is clamped to prevent going below zero.
 */
InteractionHub.navigateSuggestionsUp = function() {
    const availableSuggestions = $('#suggestionOptions li');
    if (availableSuggestions.length === 0) {
        activeSuggestionIndex = -1; // Reset if there are no items.
        return false; // Prevent default browser actions (e.g., page scroll).
    }

    // Clamp the index using Math.max to ensure it doesn't go below 0.
    activeSuggestionIndex = Math.max(0, activeSuggestionIndex - 1);
    applySuggestionHighlight(availableSuggestions);
    return false;
};

/**
 * Increments the active selection index in the autocomplete list, moving down.
 * The index is clamped to prevent exceeding the list bounds.
 */
InteractionHub.navigateSuggestionsDown = function() {
    const availableSuggestions = $('#suggestionOptions li');
    const totalSuggestionCount = availableSuggestions.length;

    if (totalSuggestionCount === 0) {
        activeSuggestionIndex = -1; // Reset if no items are present.
        return false;
    }

    // Clamp the index using Math.min to ensure it doesn't exceed the list length.
    activeSuggestionIndex = Math.min(totalSuggestionCount - 1, activeSuggestionIndex + 1);
    applySuggestionHighlight(availableSuggestions);
    return false;
};

/**
 * Configures global keyboard event listeners to manage search input and autocomplete navigation.
 */
InteractionHub.initializeKeyboardHandlers = function() {
    window.addEventListener("keydown", function(keyEventObject) {
        const searchInputField = $('#searchInputBox'); // Cache the search input element.

        // Early exit: if the search input is not currently focused, ignore global key events.
        if (!searchInputField.is(':focus')) {
            return;
        }

        switch (keyEventObject.key) {
            case 'Enter':
                keyEventObject.preventDefault(); // Prevent the default form submission behavior.
                if (activeSuggestionIndex !== -1) {
                    // If an autocomplete item is selected, use its text as the query.
                    const chosenText = $('#suggestionOptions li').eq(activeSuggestionIndex).text();
                    searchInputField.val(chosenText);
                    InteractionHub.performSearchAction(); // Trigger the search.
                } else {
                    // Otherwise, use the text currently in the input field.
                    InteractionHub.performSearchAction();
                }
                break; // Essential to prevent fall-through.

            case 'ArrowUp':
                keyEventObject.preventDefault(); // Prevent browser scrolling.
                InteractionHub.navigateSuggestionsUp();
                break;

            case 'ArrowDown':
                keyEventObject.preventDefault(); // Prevent browser scrolling.
                InteractionHub.navigateSuggestionsDown();
                break;

            default:
                // For any other key, no specific action is required by this handler.
                // console.debug(`Unhandled key pressed: ${keyEventObject.key}`);
                break;
        }
    }, false); // 'false' indicates event bubbling phase (default behavior).
    console.log("Global keyboard event handlers activated for search features.");
};

// A control flag to prevent multiple search requests from being initiated simultaneously.
let isSearchQueryActive = false;

/**
 * Executes a search query based on the content of the search input field.
 * Includes basic validation and UI state management for loading.
 */
InteractionHub.performSearchAction = function() {
    if (isSearchQueryActive) {
        console.warn("A search operation is already in progress. Please await current results.");
        return false; // Block duplicate submissions.
    }

    const currentQueryText = $('#searchInputBox').val();

    // Implement a simple validation for non-empty search terms.
    if (!currentQueryText || currentQueryText.trim() === '') {
        alert("Please provide a valid query term to initiate a search.");
        $('#searchInputBox').focus(); // Return focus to the input field.
        return false;
    }

    // Update UI elements to reflect the loading state.
    $('#suggestionOptions').hide(); // Hide autocomplete options.
    $('#resultsDisplayArea').empty(); // Clear any previous search results.
    $('#loadingSpinner').show(); // Display a loading indicator.
    isSearchQueryActive = true; // Set the flag to indicate an active search.

    // Using an alternative API endpoint and adding a cache-busting timestamp.
    const searchEndpoint = `https://api.alternate-provider.net/data/lookup?query=${encodeURIComponent(currentQueryText)}&_t=${Date.now()}`;

    $.ajax({
        url: searchEndpoint,
        method: 'POST', // Changed from GET to POST for illustrative purposes.
        dataType: 'json', // Explicitly expect a JSON response.
        timeout: 15000, // Set a higher timeout value.
        success: function(responsePayload) {
            $('#loadingSpinner').hide();
            isSearchQueryActive = false; // Reset the search flag.

            // Assuming the API returns a JSON object where `dataItems` holds the relevant HTML or data.
            // Original code expected `responseText` and parsed it as HTML.
            // For a Type III clone, we adapt to a different API structure.
            const rawDataContent = responsePayload.dataItems || []; // Default to empty array if not found.

            // Re-implementing parsing logic with variations.
            const processedEntries = $.map(rawDataContent, function(itemData) {
                const itemRecord = {};
                const jQueryItem = $(itemData.htmlFragment); // Assuming an HTML fragment within JSON.

                // Extracting structured data using more specific selectors.
                itemRecord.entryName = jQueryItem.find('span.item-title').text().trim();
                itemRecord.downloadLink = jQueryItem.find("a.item-download-link").attr("href");

                // New parsing for metadata: iterating over specific data attributes or elements.
                // Original: regex-based split from a single HTML block.
                // New: Extracting from data attributes for better structure.
                itemRecord.qualityInfo = jQueryItem.data('quality') || null;
                itemRecord.storageSize = jQueryItem.data('size') || null;
                itemRecord.playbackDuration = jQueryItem.data('duration') || null;

                return itemRecord;
            });

            DisplayManager.renderSearchOutput(processedEntries); // Call the updated rendering function.

            // Using event delegation for click handlers on dynamically added results.
            $('#resultsDisplayArea').off('click', '.result-entry-item').on('click', '.result-entry-item', function() {
                const downloadTarget = $(this).find('.download-target-url').val();
                if (downloadTarget) {
                    // Changed from chrome.tabs.create to a generic window.open for wider utility.
                    window.open(downloadTarget, '_blank', 'noopener,noreferrer'); // Enhanced security for new window.
                    console.info("Opened resource in new tab: " + downloadTarget);
                    // Instead of window.close(), which is often blocked, we can offer UI feedback.
                    // alert("File opened for download!");
                } else {
                    console.warn("No valid download link found for selected item.");
                }
            });
        },
        error: function(xhr, status, errorMsg) {
            $('#loadingSpinner').hide();
            isSearchQueryActive = false; // Reset the search flag.
            console.error("Search request encountered an error:", status, errorMsg, xhr);
            $('#resultsDisplayArea').html(`<div class="error-notification">
                                                <p>An issue occurred while fetching results. Please try again later.</p>
                                                <p>Error details: ${errorMsg}</p>
                                            </div>`);
        }
    });

    return false; // Prevent any default form submission.
};

// Debounce timer for autocomplete suggestions to reduce API calls.
let autocompleteDelayTimer;
const AUTOCOMPLETE_FETCH_DELAY_MS = 400; // Delay in milliseconds.

/**
 * Manages key-up events in the search input field to trigger autocomplete suggestions.
 * Incorporates debouncing and minimum query length checks.
 * @param {KeyboardEvent} eventObject - The keyboard event.
 */
InteractionHub.handleSearchInputKeyup = function(eventObject) {
    const currentInputBox = $('#searchInputBox');
    const currentQueryValue = currentInputBox.val();

    // Reset the active selection whenever the user types.
    activeSuggestionIndex = -1;

    // Guard clause: Filter for keys that actually modify text.
    // Original: keyCode range check. New: checks for printable characters, backspace, delete.
    const isTextEditingKey = (eventObject.key.length === 1 && !eventObject.ctrlKey && !eventObject.altKey) ||
                             eventObject.key === 'Backspace' || eventObject.key === 'Delete';

    if (!isTextEditingKey) {
        return false; // Ignore non-text-editing keys for autocomplete.
    }

    // Guard clause: Minimum input length before triggering autocomplete.
    const MIN_AUTOCOMPLETE_CHARS = 3;
    if (currentQueryValue.length < MIN_AUTOCOMPLETE_CHARS) {
        $('#suggestionOptions').empty().hide(); // Clear and hide suggestions immediately.
        clearTimeout(autocompleteDelayTimer);
        return false;
    }

    // Implement debouncing to prevent excessive API requests.
    clearTimeout(autocompleteDelayTimer);
    autocompleteDelayTimer = setTimeout(() => {
        // Using a different autocomplete API endpoint and query parameter format.
        const autoCompleteApiUrl = `https://suggest.another-cdn.com/suggestions?term=${encodeURIComponent(currentQueryValue.replace(/%20/g, '+'))}&client_id=app_client`;

        $.ajax({
            url: autoCompleteApiUrl,
            dataType: 'text', // Expect raw text or a JavaScript snippet.
            complete: function(xhrResponse) {
                // Original: `x = x.responseText.match(/new Array.*?\)/); x = "Events.autoCompleteResults(" + x + ")"; eval(x);`
                // For Type III: Modify the regex pattern and the execution method.
                // Assuming the response is like `processSuggestionsCallback(["item1", "item2"])`.
                let rawResponseString = xhrResponse.responseText;
                const callbackMatch = rawResponseString.match(/processSuggestionsCallback\((.*)\)/);

                if (callbackMatch && callbackMatch[1]) {
                    try {
                        // Attempt to parse as JSON array, which is safer than direct eval.
                        const parsedSuggestions = JSON.parse(callbackMatch[1]);
                        InteractionHub.displayAutocompleteOptions(parsedSuggestions);
                    } catch (e) {
                        console.error("Failed to parse autocomplete response as JSON:", e);
                        // Fallback or display empty suggestions if parsing fails.
                        InteractionHub.displayAutocompleteOptions([]);
                    }
                } else {
                    console.warn("Autocomplete response did not conform to the expected callback pattern.");
                    InteractionHub.displayAutocompleteOptions([]); // Clear suggestions.
                }
            }
        });
    }, AUTOCOMPLETE_FETCH_DELAY_MS);

    return false;
};

/**
 * Populates and displays the autocomplete suggestion list in the UI.
 * @param {Array<string>} suggestionStrings - An array of strings to be used as suggestions.
 */
InteractionHub.displayAutocompleteOptions = function(suggestionStrings) {
    if (!Array.isArray(suggestionStrings) || suggestionStrings.length === 0) {
        $('#suggestionOptions').empty().hide();
        return;
    }

    // Construct HTML using template literals for improved readability and maintainability.
    const htmlSuggestions = suggestionStrings.map(function(suggestionEntry) {
        // Adding a 'data-suggestion-value' attribute for easy retrieval during selection.
        return `<li class="suggestion-entry" data-suggestion-value="${encodeURIComponent(suggestionEntry)}">${suggestionEntry}</li>`;
    }).join('');

    $('#suggestionOptions')
        .html(htmlSuggestions)
        .show();

    // Use event delegation for click handlers on dynamically generated list items.
    $('#suggestionOptions').off('click', '.suggestion-entry').on('click', '.suggestion-entry', InteractionHub.selectSuggestionEntry);
};

/**
 * Handles the event when a user clicks on an autocomplete suggestion.
 * @param {Event} clickEvent - The click event object.
 */
InteractionHub.selectSuggestionEntry = function(clickEvent) {
    const clickedItem = $(clickEvent.currentTarget); // Get the actual list item that was clicked.
    const selectedValue = decodeURIComponent(clickedItem.data('suggestion-value')); // Retrieve value from data attribute.

    $('#searchInputBox').val(selectedValue); // Update the search input field.
    $('#suggestionOptions').hide(); // Hide the autocomplete list.
    InteractionHub.performSearchAction(); // Immediately trigger a search with the selected term.
};

// Module for managing user interface components and rendering.
const DisplayManager = {};

/**
 * Initializes and applies custom styling to various form elements using a third-party library.
 */
DisplayManager.initCustomFormStyles = function() {
    // Check if the 'uniform' jQuery plugin is available before attempting to use it.
    if ($.fn.uniform) {
        // Apply styling to a more comprehensive or different set of form elements.
        // Original: $("input, textarea, select, button").uniform();
        // New: Target specific types within a form and include new elements like radio buttons.
        $("form#mainSearchForm input[type='text'], form#mainSearchForm textarea, select.custom-select, button.action-btn, input[type='checkbox'], input[type='radio']")
            .uniform();
        console.log("Custom form styling successfully applied.");
    } else {
        console.warn("jQuery Uniform plugin not detected. Skipping custom form styling initialization.");
    }
};

/**
 * Renders the processed search results into the designated display area.
 * @param {Array<Object>} resultItems - An array of objects, each representing a search result.
 */
DisplayManager.renderSearchOutput = function(resultItems) {
    const outputContainer = $('#resultsDisplayArea');
    let generatedResultHtml = '';

    if (!Array.isArray(resultItems) || resultItems.length === 0) {
        // Provide a detailed "no results" message, including the user's original query.
        const currentQuery = $('#searchInputBox').val();
        generatedResultHtml = `<div class="no-match-feedback">
                                <p>Regrettably, no results were found for your query: "<strong>${currentQuery}</strong>".</p>
                                <p>Consider refining your search terms or checking for typos.</p>
                               </div>`;
    } else {
        generatedResultHtml = resultItems.map(function(singleResultEntry, rowIndex) {
            // Further clean and normalize the title text.
            let cleanedTitleText = singleResultEntry.entryName
                .replace(/(\.mp3|\.wav|\.flac)/gi, '') // Remove common audio extensions.
                .replace(/\(.*?\)/g, '') // Remove content in parentheses.
                .replace(/\[.*?\]/g, '') // Remove content in square brackets.
                .replace(/feat\..*?(\s|$)/gi, '') // Remove "feat." and subsequent text.
                .replace(/\s*-\s*$/, '') // Remove trailing hyphens and spaces.
                .trim();

            // Assign a specific class based on the source URL (e.g., for specific styling).
            const sourceSpecificClass = singleResultEntry.downloadLink && singleResultEntry.downloadLink.includes("example-cdn") ? 'source-example-cdn' : 'source-generic';

            // Construct the result item HTML using template literals for clarity and structure.
            return `
                <li class="result-entry-item result-row-${rowIndex % 2}">
                    <div class="result-card-content ${sourceSpecificClass}">
                        <h4 class="item-title">${cleanedTitleText}</h4>
                        <div class="item-metadata">
                            ${singleResultEntry.storageSize ? `<span><b>Size:</b> ${singleResultEntry.storageSize}</span>` : ''}
                            ${singleResultEntry.qualityInfo ? `<span><b>Quality:</b> ${singleResultEntry.qualityInfo}</span>` : ''}
                            ${singleResultEntry.playbackDuration ? `<span><b>Duration:</b> ${singleResultEntry.playbackDuration}</span>` : ''}
                        </div>
                        <input type="hidden" class="download-target-url" value="${singleResultEntry.downloadLink || ''}">
                        <a href="${singleResultEntry.downloadLink}" target="_blank" rel="noopener noreferrer" class="action-button download-btn">Download Now</a>
                    </div>
                </li>`;
        }).join('');
    }

    outputContainer.html(generatedResultHtml);
    console.log(`Displayed ${resultItems.length} search result entries.`);
};

// Document ready handler for application initialization.
$(document).ready(function() {
    InteractionHub.validateInitialState(); // Perform initial setup checks.
    InteractionHub.initializeKeyboardHandlers(); // Set up global keyboard listeners.
    DisplayManager.initCustomFormStyles(); // Apply custom styling to form elements.

    // Bind event listeners to new element IDs and classes.
    $('#searchInputBox').on('keyup', InteractionHub.handleSearchInputKeyup);
    // Bind click event to a dedicated search submission button.
    $('#searchSubmitBtn').on('click', function(event) {
        event.preventDefault(); // Prevent default button behavior.
        InteractionHub.performSearchAction(); // Trigger the search.
    });

    console.log("Application initialization complete.");
});