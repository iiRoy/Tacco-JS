// --- Application Configuration and State ---
const PLACEHOLDER_TEXT = "explore developer resources"; // Renamed and rephrased
const MAX_VISIBLE_ROWS = 15; // Renamed, slightly reduced count
const HAS_DEDICATED_SEARCH_PAGE = true; // Renamed, value changed for demonstration
const ROOT_APP_PATH = "/devdocs/"; // New global constant for base path
const AUTOCOMPLETE_PANEL_ID = "search_suggestions_panel"; // New constant for search container ID
const AUTOCOMPLETE_INPUT_ID = "main_search_input"; // New constant for search input ID
const RESULTS_TABLE_ID = "suggestion_results_table"; // New constant for results table ID

let currentSelectionIndex = -1; // Renamed gSelectedIndex
let activeEntryIdentifier = null; // Renamed gSelectedID, changed initial value
let filteredResults = []; // Renamed gMatches, changed to array literal
let isPanelUIReady = false; // Renamed gInitialized

// Simulate external DATA source (Type III addition: explicit definition for demonstration)
// In a real application, this data would likely be loaded from a JSON file or an API endpoint.
const appData = [
  { id: 1, label: "android.app.Activity", link: "reference/android/app/Activity.html", type: "class" },
  { id: 2, label: "android.widget.TextView", link: "reference/android/widget/TextView.html", type: "class" },
  { id: 3, label: "android.content.Context", link: "reference/android/content/Context.html", type: "interface" },
  { id: 4, label: "java.lang.String", link: "reference/java/lang/String.html", type: "class" },
  { id: 5, label: "android.os.Bundle", link: "reference/android/os/Bundle.html", type: "class" },
  { id: 6, label: "android.view.View", link: "reference/android/view/View.html", type: "class" },
  { id: 7, label: "android.util.Log", link: "reference/android/util/Log.html", type: "class" },
  { id: 8, label: "android.widget.Button", link: "reference/android/widget/Button.html", type: "class" },
  { id: 9, label: "android.view.LayoutInflater", link: "reference/android/view/LayoutInflater.html", type: "class" },
  { id: 10, label: "android.app.Fragment", link: "reference/android/app/Fragment.html", type: "class" },
  { id: 11, label: "android.widget.ListView", link: "reference/android/widget/ListView.html", type: "class" },
  { id: 12, label: "android.graphics.Canvas", link: "reference/android/graphics/Canvas.html", type: "class" },
  { id: 13, label: "androidx.lifecycle.ViewModel", link: "reference/androidx/lifecycle/ViewModel.html", type: "class" },
  { id: 14, label: "androidx.fragment.app.Fragment", link: "reference/androidx/fragment/app/Fragment.html", type: "class" },
  { id: 15, label: "kotlinx.coroutines.flow.Flow", link: "reference/kotlinx/coroutines/flow/Flow.html", type: "interface" },
  { id: 16, label: "java.util.List", link: "reference/java/util/List.html", type: "interface" },
  { id: 17, label: "android.content.Intent", link: "reference/android/content/Intent.html", type: "class" },
  { id: 18, label: "android.database.sqlite.SQLiteDatabase", link: "reference/android/database/sqlite/SQLiteDatabase.html", type: "class" },
  { id: 19, label: "android.animation.Animator", link: "reference/android/animation/Animator.html", type: "class" },
  { id: 20, label: "android.graphics.Color", link: "reference/android/graphics/Color.html", type: "class" },
  { id: 21, label: "android.content.res.Resources", link: "reference/android/content/res/Resources.html", type: "class" },
  { id: 22, label: "android.provider.Settings", link: "reference/android/provider/Settings.html", type: "class" },
  { id: 23, label: "java.io.File", link: "reference/java/io/File.html", type: "class" },
];


// --- Utility Functions ---

/**
 * Helper function to retrieve a DOM element by its ID.
 * @param {string} id The string ID of the element.
 * @returns {HTMLElement|null} The corresponding DOM element, or null if not found.
 */
const getElement = (id) => document.getElementById(id); // Type III: New helper

/**
 * Toggles the 'selected' visual state for a given table row element.
 * @param {HTMLTableRowElement} targetRowElement The table row to apply the status to.
 * @param {boolean} isHighlighted If true, the row will be highlighted; otherwise, it will be unhighlighted.
 */
function markItemRowStatus(targetRowElement, isHighlighted) { // Renamed from set_row_selected
    // Type III: Added robust validation for the input element.
    if (!targetRowElement || !targetRowElement.cells || targetRowElement.cells.length === 0) {
        console.warn("markItemRowStatus: Invalid row element provided.");
        return;
    }
    const displayCell = targetRowElement.cells[0]; // Renamed c1
    const baseClass = "jd-autocomplete"; // Extracted common class name for clarity
    if (isHighlighted) {
        displayCell.className = `${baseClass} jd-selected`; // Using modern template literals
    } else {
        displayCell.className = baseClass;
    }
}

/**
 * Populates a specific table row with content and a link based on the provided search result data.
 * @param {string} basePath The base URL path to prepend to the result's link.
 * @param {HTMLTableRowElement} displayRow The table row element to be populated.
 * @param {Object} resultData The object containing the search result details (label, link, __hilabel).
 */
function populateRowContent(basePath, displayRow, resultData) { // Renamed from set_row_values
    // Type III: Added robust validation for input parameters.
    if (!displayRow || !displayRow.cells || displayRow.cells.length === 0 || !resultData) {
        console.warn("populateRowContent: Invalid parameters provided.");
        return;
    }
    // Accessing the anchor element more directly and safely.
    const linkElement = displayRow.cells[0].firstElementChild;
    if (linkElement && linkElement.tagName === 'A') { // Type III: Validation for element type
        // Use __hilabel (highlighted label) if available, otherwise fall back to original label.
        linkElement.innerHTML = resultData.__hilabel || resultData.label;
        linkElement.href = `${basePath}${resultData.link}`; // Constructing the full URL
    } else {
        console.error("populateRowContent: Link element not found or not an anchor in the row cell.");
    }
}

/**
 * Calculates a relevance score for a single search result entry based on the current query.
 * This function helps in ranking results by prioritizing exact matches and deeper paths.
 * @param {Object} entry The search result object to score.
 * @param {string} normalizedQuery The lowercase, alphanumeric part of the search query.
 * @param {RegExp} prefixPattern Regular expression for prefix matches.
 * @param {RegExp} exactWordPattern Regular expression for exact word matches.
 * @returns {number} The calculated score for the entry.
 */
const calculateEntryScore = (entry, normalizedQuery, prefixPattern, exactWordPattern) => { // Type III: Extracted into a helper, renamed
    let score = 1.0;
    const normalizedLabel = entry.label.toLowerCase(); // Renamed labelLower

    /**
     * Finds the last occurrence index of a regular expression pattern within a string.
     * @param {string} str The string to search within.
     * @param {RegExp} regex The regular expression to search for.
     * @returns {number} The last index of the match, or -1 if not found.
     */
    const findLastMatchIndex = (str, regex) => { // Type III: Renamed _lastSearch, rewritten for robustness
        if (!str || str === '') return -1;
        let lastIdx = -1;
        let tempStr = str;
        let currentOffset = 0;
        let match;
        // Iteratively find matches to get the last one's position
        while ((match = tempStr.match(regex)) !== null) {
            const matchIndex = tempStr.indexOf(match[0]);
            if (matchIndex === -1) break; // Should theoretically not happen if match exists
            lastIdx = currentOffset + matchIndex;
            currentOffset += matchIndex + match[0].length;
            tempStr = tempStr.substring(matchIndex + match[0].length);
        }
        return lastIdx;
    };

    /**
     * Counts the number of occurrences of a specific character within a string.
     * @param {string} str The string to analyze.
     * @param {string} char The character to count.
     * @returns {number} The count of the character.
     */
    const countCharacterOccurrences = (str, char) => { // Type III: Renamed _countChar, added null check
        if (!str) return 0;
        return (str.split(char).length - 1);
    };

    let matchPosition = findLastMatchIndex(normalizedLabel, exactWordPattern); // Renamed t
    if (matchPosition >= 0) {
        // Higher score for exact word matches.
        const pathSegmentsAfterMatch = countCharacterOccurrences(normalizedLabel.substring(matchPosition + 1), '.'); // Renamed partsAfter
        score *= 200 / (pathSegmentsAfterMatch + 1);
    } else {
        matchPosition = findLastMatchIndex(normalizedLabel, prefixPattern);
        if (matchPosition >= 0) {
            // Moderate score for prefix matches.
            const pathSegmentsAfterMatch = countCharacterOccurrences(normalizedLabel.substring(matchPosition + 1), '.');
            score *= 20 / (pathSegmentsAfterMatch + 1);
        }
    }

    return score;
};

/**
 * Sorts the global `filteredResults` array based on relevance scores.
 * The scores are calculated based on the provided search query, prioritizing exact and prefix matches.
 * @param {string} searchQuery The user's current search input.
 */
function sortAndScoreResults(searchQuery) { // Renamed from rank_autocomplete_results
    searchQuery = searchQuery || '';
    if (!filteredResults || filteredResults.length === 0) {
        return;
    }

    const normalizedQuery = searchQuery.toLowerCase(); // Renamed queryLower
    // Type III: Enhanced regex to include Unicode letters and numbers for broader matching.
    const alphaNumericQueryPart = (normalizedQuery.match(/[\p{L}\p{N}]+/gu) || [''])[0]; // Renamed queryAlnum
    const prefixPattern = new RegExp(`\\b${alphaNumericQueryPart}`, 'u'); // Renamed partPrefixAlnumRE, added Unicode flag
    const exactWordPattern = new RegExp(`\\b${alphaNumericQueryPart}\\b`, 'u'); // Renamed partExactAlnumRE, added Unicode flag

    // Calculate and assign a score to each result object.
    for (let i = 0; i < filteredResults.length; i++) {
        filteredResults[i].__resultScore = calculateEntryScore(
            filteredResults[i],
            normalizedQuery,
            prefixPattern,
            exactWordPattern
        );
    }

    // Sort the results: primary sort by score (descending), secondary by label (ascending).
    filteredResults.sort((a, b) => {
        const scoreDifference = b.__resultScore - a.__resultScore;
        if (scoreDifference === 0) {
            // Type III: Use localeCompare for more accurate string comparison across different languages.
            return a.label.localeCompare(b.label);
        }
        return scoreDifference;
    });
}

/**
 * Formats the labels of the global `filteredResults` by wrapping matching parts of the query in `<b>` tags.
 * This prepares the labels for display with highlighting in the UI.
 * @param {string} highlightQuery The query string used for highlighting.
 */
function formatResultLabels(highlightQuery) { // Renamed from highlight_autocomplete_result_labels
    highlightQuery = highlightQuery || '';
    if (!filteredResults || filteredResults.length === 0) {
        return;
    }

    const normalizedHighlightQuery = highlightQuery.toLowerCase(); // Renamed queryLower
    // Type III: Enhanced regex to include Unicode letters, numbers, and dots for pattern matching.
    const patternSegment = (normalizedHighlightQuery.match(/[\p{L}\p{N}\.]+/gu) || [''])[0]; // Renamed queryAlnumDot
    // Escape dots for regex, then create a global, case-insensitive, Unicode-aware pattern.
    const highlightRegex = new RegExp(`(${patternSegment.replace(/\./g, '\\.')})`, 'igu'); // Renamed queryRE

    for (let i = 0; i < filteredResults.length; i++) {
        // Store the generated HTML with highlighting in a new property '__hilabel'.
        filteredResults[i].__hilabel = filteredResults[i].label.replace(highlightRegex, '<b>$1</b>');
    }
}

/**
 * Updates the visibility and content of the autocomplete suggestion panel based on `filteredResults`.
 * It initializes the table structure if not already done and populates rows with current matches.
 */
function refreshAutocompletePanel() { // Renamed from sync_selection_table
    const suggestionsPanel = getElement(AUTOCOMPLETE_PANEL_ID); // Renamed filtered
    const resultsTable = getElement(RESULTS_TABLE_ID); // Type III: New variable for the table element

    if (!suggestionsPanel || !resultsTable) {
        console.error("refreshAutocompletePanel: Autocomplete panel or results table DOM elements not found."); // Type III: Validation
        return;
    }

    activeEntryIdentifier = null; // Reset the active identifier when refreshing the panel.

    // Initialize the table structure (create rows and attach event listeners) only once.
    if (!isPanelUIReady) {
        // Type III: Using addEventListener for better event management.
        // Event listener on the entire table to clear selection when the mouse leaves the table area.
        resultsTable.addEventListener('mouseleave', () => {
            if (currentSelectionIndex >= 0) {
                markItemRowStatus(resultsTable.rows[currentSelectionIndex], false);
                currentSelectionIndex = -1;
            }
        });

        for (let i = 0; i < MAX_VISIBLE_ROWS; i++) {
            const currentRow = resultsTable.insertRow(-1); // Renamed r
            const displayCell = currentRow.insertCell(-1); // Renamed c1
            displayCell.className = "jd-autocomplete"; // Assigning the base class
            const linkAnchor = document.createElement("a"); // Renamed link
            linkAnchor.setAttribute("role", "option"); // Type III: Added ARIA attribute for accessibility
            linkAnchor.setAttribute("tabindex", "-1"); // Type III: Make link not focusable by tab key directly

            // Type III: Using arrow functions for concise event handlers.
            displayCell.addEventListener('mousedown', (event) => {
                event.preventDefault(); // Type III: Prevent default to avoid input field blurring prematurely.
                const href = event.currentTarget.firstElementChild.getAttribute("href");
                if (href) window.location.href = href; // Using window.location.href for clarity.
            });
            displayCell.addEventListener('mouseover', (event) => {
                const hoveredRow = event.currentTarget.parentNode; // Get the parent <tr> element.
                const rowIndex = Array.from(resultsTable.rows).indexOf(hoveredRow); // Determine the index of the hovered row.
                if (currentSelectionIndex >= 0 && currentSelectionIndex !== rowIndex) {
                    markItemRowStatus(resultsTable.rows[currentSelectionIndex], false); // Deselect the previously highlighted row.
                }
                markItemRowStatus(hoveredRow, true); // Highlight the current row.
                currentSelectionIndex = rowIndex;
            });
            displayCell.addEventListener('mouseout', (event) => {
                // Only deselect if the mouse leaves the currently selected row AND it's not the entire table.
                // The 'mouseleave' listener on `resultsTable` handles the general table exit.
                if (currentSelectionIndex === Array.from(resultsTable.rows).indexOf(event.currentTarget.parentNode)) {
                    markItemRowStatus(event.currentTarget.parentNode, false);
                    currentSelectionIndex = -1;
                }
            });
            displayCell.appendChild(linkAnchor);
        }
        isPanelUIReady = true; // Mark the UI as initialized.
    }

    // Display logic: show the panel if there are results, otherwise hide it.
    if (filteredResults.length > 0) {
        suggestionsPanel.classList.remove("no-display"); // Type III: Using classList for cleaner class manipulation.
        suggestionsPanel.classList.add("showing");

        const itemsToShow = Math.min(filteredResults.length, MAX_VISIBLE_ROWS); // Renamed N

        // Populate and style the visible rows.
        for (let idx = 0; idx < MAX_VISIBLE_ROWS; idx++) { // Iterate up to MAX_VISIBLE_ROWS
            const currentRow = resultsTable.rows[idx];
            if (idx < itemsToShow) {
                currentRow.classList.remove("no-display");
                currentRow.classList.add("show-row");
                populateRowContent(ROOT_APP_PATH, currentRow, filteredResults[idx]); // Pass ROOT_APP_PATH
                markItemRowStatus(currentRow, idx === currentSelectionIndex);
                if (idx === currentSelectionIndex) {
                    activeEntryIdentifier = filteredResults[idx].id;
                }
            } else {
                // Hide rows that are beyond the actual number of results or MAX_VISIBLE_ROWS.
                currentRow.classList.remove("show-row");
                currentRow.classList.add("no-display");
            }
        }
    } else {
        // If no results, hide the entire suggestion panel.
        suggestionsPanel.classList.remove("showing");
        suggestionsPanel.classList.add("no-display");
    }
}

let searchDebounceTimer; // Type III: Introduced a debounce timer for search input.
const DEBOUNCE_DELAY_MS = 250; // Type III: Configurable debounce delay.

/**
 * Handles keyboard input events (keydown, input) for the search box, managing navigation and search logic.
 * @param {KeyboardEvent} eventObject The DOM keyboard event object.
 * @param {boolean} isKeyDownEvent True if the event is a keydown; false for keyup/input events.
 */
function handleQueryInput(eventObject, isKeyDownEvent) { // Renamed from search_changed
    const searchInput = getElement(AUTOCOMPLETE_INPUT_ID); // Renamed search
    const searchContainer = getElement(AUTOCOMPLETE_PANEL_ID); // Type III: New variable for the container element.

    if (!searchInput || !searchContainer) {
        console.error("handleQueryInput: Search input or container element not found."); // Type III: Validation.
        return;
    }

    // Clean and normalize the current query text.
    const currentQueryText = searchInput.value.trim(); // Renamed text, using trim() for robustness.

    // Handle navigation and submission keys on keydown events for immediate response.
    if (isKeyDownEvent) {
        switch (eventObject.key) { // Type III: Using event.key for modern browsers (more semantic than keyCode).
            case "Enter": // Corresponds to keyCode 13
                searchContainer.classList.add("no-display"); // Hide the panel immediately on Enter.
                if (currentSelectionIndex >= 0 && filteredResults[currentSelectionIndex]) {
                    // If an item is selected, navigate to its link.
                    window.location.href = `${ROOT_APP_PATH}${filteredResults[currentSelectionIndex].link}`;
                    eventObject.preventDefault(); // Prevent default form submission.
                } else if (HAS_DEDICATED_SEARCH_PAGE) {
                    // If no item is selected but a dedicated search page exists, allow default form submission.
                    return true;
                } else {
                    // No dedicated page and no selection, simply hide the panel.
                    refreshAutocompletePanel(); // Ensure panel is hidden.
                    eventObject.preventDefault();
                }
                break;

            case "ArrowUp": // Corresponds to keyCode 38
                eventObject.preventDefault(); // Prevent cursor movement in the input field.
                if (currentSelectionIndex > 0) {
                    currentSelectionIndex--;
                } else { // Type III: Implement wrap-around navigation to the last item if at the top.
                    currentSelectionIndex = filteredResults.length > 0 ? Math.min(filteredResults.length, MAX_VISIBLE_ROWS) - 1 : -1;
                }
                refreshAutocompletePanel();
                break;

            case "ArrowDown": // Corresponds to keyCode 40
                eventObject.preventDefault(); // Prevent cursor movement in the input field.
                const maxSelectableIndex = Math.min(filteredResults.length, MAX_VISIBLE_ROWS) - 1;
                if (currentSelectionIndex < maxSelectableIndex) {
                    currentSelectionIndex++;
                } else { // Type III: Implement wrap-around navigation to the first item if at the bottom.
                    currentSelectionIndex = filteredResults.length > 0 ? 0 : -1;
                }
                refreshAutocompletePanel();
                break;

            case "Escape": // Type III: Added support for the Escape key to close the panel.
                searchContainer.classList.add("no-display");
                searchInput.blur(); // Remove focus from the search input.
                currentSelectionIndex = -1;
                filteredResults = []; // Clear results to reset state.
                eventObject.preventDefault();
                break;
        }
    } else { // This block handles non-keydown events like 'input' (for real-time filtering).
        clearTimeout(searchDebounceTimer); // Clear any pending search operations.
        searchDebounceTimer = setTimeout(() => { // Type III: Debounce the search logic to prevent excessive calls.
            filteredResults = []; // Clear previous results before a new search.
            let resultCounter = 0; // Renamed matchedCount
            currentSelectionIndex = -1; // Reset selection index.

            // Perform filtering: only if there's actual query text.
            if (currentQueryText.length > 0) {
                const normalizedQuery = currentQueryText.toLowerCase();
                for (const dataEntry of appData) { // Renamed s, using modern for...of loop.
                    // Type III: Using String.prototype.includes() for a more readable and modern check.
                    if (dataEntry.label.toLowerCase().includes(normalizedQuery)) {
                        filteredResults[resultCounter++] = dataEntry;
                    }
                }
            }

            sortAndScoreResults(currentQueryText); // Rank the filtered results.
            formatResultLabels(currentQueryText); // Add highlighting to result labels.

            // If a previously active item exists, try to re-select it in the new filtered list.
            if (activeEntryIdentifier !== null) {
                for (let i = 0; i < filteredResults.length; i++) {
                    if (activeEntryIdentifier === filteredResults[i].id) {
                        currentSelectionIndex = i;
                        break;
                    }
                }
            }

            refreshAutocompletePanel(); // Update the UI with the new results.
        }, DEBOUNCE_DELAY_MS);
    }
}

/**
 * Manages the search input's placeholder text and visual styling based on its focus state.
 * @param {HTMLInputElement} inputElement The search input DOM element.
 * @param {boolean} hasFocus True if the input field has gained focus, false if it has lost focus.
 */
function handleSearchInputFocus(inputElement, hasFocus) { // Renamed from search_focus_changed
    if (!inputElement) {
        console.error("handleSearchInputFocus: Search input element not found."); // Type III: Validation.
        return;
    }

    if (hasFocus) {
        if (inputElement.value === PLACEHOLDER_TEXT) {
            inputElement.value = "";
            inputElement.style.color = "#000000"; // Change text color to black for user input.
        }
    } else {
        if (inputElement.value === "") {
            inputElement.value = PLACEHOLDER_TEXT;
            inputElement.style.color = "#aaaaaa"; // Revert to grey for placeholder.
        }
        // Type III: Use optional chaining to safely access classList and hide the panel on blur.
        getElement(AUTOCOMPLETE_PANEL_ID)?.classList.add("no-display");
        currentSelectionIndex = -1; // Type III: Reset selection on blur.
        filteredResults = []; // Type III: Clear results on blur for a clean state.
    }
}

/**
 * Initiates a full-page search by redirecting the user to a dedicated search page,
 * if `HAS_DEDICATED_SEARCH_PAGE` is set to true.
 * @returns {boolean} Returns `false` to typically prevent the default form submission behavior.
 */
function triggerGlobalSearch() { // Renamed from submit_search
    if (HAS_DEDICATED_SEARCH_PAGE) {
        const searchInput = getElement(AUTOCOMPLETE_INPUT_ID);
        if (searchInput) {
            const searchString = encodeURIComponent(searchInput.value.trim()); // Renamed query, using encodeURIComponent for URL safety.
            // Type III: Changed URL structure from hash fragment to query parameters for broader compatibility.
            window.location.href = `${ROOT_APP_PATH}search.html?q=${searchString}&t=0`;
        } else {
            console.error("triggerGlobalSearch: Search input element not found for submission.");
        }
    }
    return false; // Prevent default form submission in most scenarios.
}

// Type III: Event listeners setup upon DOM content loaded.
document.addEventListener('DOMContentLoaded', () => {
    const mainSearchInput = getElement(AUTOCOMPLETE_INPUT_ID);
    // Type III: Assuming a form element with a specific action attribute exists.
    const searchForm = document.querySelector(`form[action="${ROOT_APP_PATH}search.html"]`);

    if (mainSearchInput) {
        mainSearchInput.value = PLACEHOLDER_TEXT;
        mainSearchInput.style.color = "#aaaaaa";

        // Attach event listeners using modern methods.
        mainSearchInput.addEventListener('focus', () => handleSearchInputFocus(mainSearchInput, true));
        mainSearchInput.addEventListener('blur', () => handleSearchInputFocus(mainSearchInput, false));
        mainSearchInput.addEventListener('keydown', (e) => handleQueryInput(e, true));
        // Type III: Using 'input' event for real-time filtering as characters are typed or pasted.
        mainSearchInput.addEventListener('input', (e) => handleQueryInput(e, false));
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            // If triggerGlobalSearch handles the redirection or explicitly prevents it, stop default form action.
            if (!triggerGlobalSearch()) {
                e.preventDefault();
            }
        });
    }

    // Type III: Add a global click listener to hide the autocomplete panel if the user clicks outside.
    document.addEventListener('click', (event) => {
        const panel = getElement(AUTOCOMPLETE_PANEL_ID);
        const input = getElement(AUTOCOMPLETE_INPUT_ID);
        // Check if the click target is neither the panel itself nor the input field.
        if (panel && input && !panel.contains(event.target) && !input.contains(event.target)) {
            panel.classList.add('no-display');
            currentSelectionIndex = -1; // Reset selection.
            filteredResults = []; // Clear results.
        }
    });
});