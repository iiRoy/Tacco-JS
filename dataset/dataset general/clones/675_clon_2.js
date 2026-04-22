var currentFocusIndex = -1;
var activeEntryIdentifier = -1;
var matchingResults = [];
var previousInputString = "";
var MAX_VISIBLE_ROWS = 20;
var isComponentReady = false;
var DEFAULT_PROMPT_MESSAGE = "find developer documentation";
var SUPPORTS_DEDICATED_SEARCH_PAGE = false;

function applyRowHighlighting(targetRow, shouldHighlight) {
    // Access the first cell of the provided table row
    var firstCell = targetRow.cells[0];
    // Based on the highlight flag, set the appropriate CSS class
    if (shouldHighlight) {
        firstCell.className = "auto-complete-item auto-complete-selected";
    } else {
        firstCell.className = "auto-complete-item";
    }
}

function populateRowContent(basePath, displayRow, resultItem) {
    // Get the hyperlink element within the first cell of the row
    var anchorElement = displayRow.cells[0].childNodes[0];
    // Set the inner HTML of the link, prioritizing the highlighted label
    anchorElement.innerHTML = resultItem.highlightedLabel || resultItem.descriptor;
    // Set the destination URL for the hyperlink
    anchorElement.href = basePath + resultItem.targetLink;
}

function synchronizeDisplayTable(basePath) {
    // Obtain reference to the search results container
    var resultContainer = document.getElementById("search_results_display_area");
    var tableRow; // Represents a single row in the search results table
    var loopCounter; // Iterator for table rows
    activeEntryIdentifier = -1; // Reset the ID of the currently active item

    // Set up a mouseover event handler for the entire results container
    resultContainer.onmouseover = function() {
        // If an item was previously selected by keyboard, deselect it upon mouse interaction
        if(currentFocusIndex >= 0) {
            applyRowHighlighting(this.rows[currentFocusIndex], false);
            currentFocusIndex = -1; // Clear the keyboard selection
        }
    }

    // Perform initial setup for the table if it hasn't been done yet
    if (!isComponentReady) {
        // Create and append rows up to the maximum display limit
        for (loopCounter = 0; loopCounter < MAX_VISIBLE_ROWS; loopCounter++) {
            var newRow = resultContainer.insertRow(-1); // Insert a new row at the end
            var newCell = newRow.insertCell(-1); // Insert a cell into the new row
            newCell.className = "auto-complete-item"; // Assign base CSS class for styling

            var newLink = document.createElement("a"); // Create a new anchor element
            // Attach event listener for mouse clicks on the cell to navigate
            newCell.onmousedown = function() {
                window.location = this.firstChild.getAttribute("href");
            }
            // Attach event listener for mouse entering the cell to add temporary highlight
            newCell.onmouseover = function() {
                this.className = this.className + " auto-complete-selected";
            }
            // Attach event listener for mouse leaving the cell to remove temporary highlight
            newCell.onmouseout = function() {
                this.className = "auto-complete-item";
            }
            newCell.appendChild(newLink); // Add the link to the cell
        }
        isComponentReady = true; // Mark the component as initialized
    }

    // Check if there are any search results to display
    if (matchingResults.length > 0) {
        // Make the results display area visible
        document.getElementById("search_results_display_area").className = "visible-results";
        // Determine the number of items to show, capped by the max visible rows
        var itemsToProcess = matchingResults.length < MAX_VISIBLE_ROWS ? matchingResults.length : MAX_VISIBLE_ROWS;
        // Iterate through the visible results and populate the table
        for (loopCounter = 0; loopCounter < itemsToProcess; loopCounter++) {
            tableRow = resultContainer.rows[loopCounter];
            tableRow.className = "display-item"; // Ensure row is visible
            populateRowContent(basePath, tableRow, matchingResults[loopCounter]); // Fill row with data
            applyRowHighlighting(tableRow, loopCounter === currentFocusIndex); // Apply selection highlight
            // If this row is the currently selected one, store its ID
            if (loopCounter === currentFocusIndex) {
                activeEntryIdentifier = matchingResults[loopCounter].uniqueID;
            }
        }
        // Hide any remaining rows that are beyond the current number of matches
        for (; loopCounter < MAX_VISIBLE_ROWS; loopCounter++) {
            tableRow = resultContainer.rows[loopCounter];
            tableRow.className = "hidden-item"; // Hide the row
        }
    } else {
        // If no results, hide the entire display area
        document.getElementById("search_results_display_area").className = "hidden-item";
    }
}

function handleSearchInput(eventObject, isKeyDown, basePath) {
    var searchBox = document.getElementById("search_input_field");
    // Get the current input value and remove leading/trailing whitespace
    var currentSearchText = searchBox.value.replace(/(^ +)|( +$)/g, '');

    // Handle 'Enter' key press
    if (eventObject.keyCode === 13) {
        document.getElementById("search_results_display_area").className = "hidden-item"; // Hide results
        if (isKeyDown && currentFocusIndex >= 0) {
            // If an item is selected, navigate to its link
            window.location = basePath + matchingResults[currentFocusIndex].targetLink;
            return false; // Prevent default form submission
        } else if (currentFocusIndex < 0) {
            // If no item is selected
            if (SUPPORTS_DEDICATED_SEARCH_PAGE) {
                return true; // Allow default form submission to a search page
            } else {
                synchronizeDisplayTable(basePath); // Just update the table
                return false; // Prevent default form submission
            }
        }
    }
    // Handle 'Arrow Up' key press (keyboard navigation)
    else if (isKeyDown && (eventObject.keyCode === 38)) {
        if (currentFocusIndex >= 0) {
            currentFocusIndex--; // Move selection up
        }
        synchronizeDisplayTable(basePath); // Update display to reflect new selection
        return false; // Prevent default scrolling
    }
    // Handle 'Arrow Down' key press (keyboard navigation)
    else if (isKeyDown && (eventObject.keyCode === 40)) {
        if (currentFocusIndex < matchingResults.length - 1 &&
            currentFocusIndex < MAX_VISIBLE_ROWS - 1) {
            currentFocusIndex++; // Move selection down
        }
        synchronizeDisplayTable(basePath); // Update display to reflect new selection
        return false; // Prevent default scrolling
    }
    // Handle text input changes (not key down events for navigation)
    else if (!isKeyDown) {
        matchingResults = []; // Clear previous results
        var foundItemCount = 0;
        currentFocusIndex = -1; // Reset selection

        // Iterate through all available data to find matches
        for (var dataIterator = 0; dataIterator < ALL_DATA_ITEMS.length; dataIterator++) {
            var dataEntry = ALL_DATA_ITEMS[dataIterator];
            // Check if the input text matches any part of the item's label (case-insensitive)
            if (currentSearchText.length !== 0 &&
                dataEntry.descriptor.toLowerCase().indexOf(currentSearchText.toLowerCase()) !== -1) {
                matchingResults[foundItemCount] = dataEntry; // Add to results
                foundItemCount++; // Increment count
            }
        }
        assignResultScores(currentSearchText); // Apply ranking to the results
        // Restore selection if the previously selected item is still in the results
        for (var dataIterator = 0; dataIterator < matchingResults.length; dataIterator++) {
            var currentItem = matchingResults[dataIterator];
            if (activeEntryIdentifier === currentItem.uniqueID) {
                currentFocusIndex = dataIterator;
            }
        }
        applyLabelHighlights(currentSearchText); // Apply bold formatting to matching parts
        synchronizeDisplayTable(basePath); // Update the visual display of results
        return true; // Allow the event to propagate for other search logic
    }
}

function assignResultScores(searchQuery) {
    searchQuery = searchQuery || ''; // Ensure query is a string, default to empty
    // Exit if there are no results to score
    if (!matchingResults || !matchingResults.length)
      return;

    // Helper function to find the last occurrence index of a regex in a string
    // Returns -1 if not found.
    var _findLastOccurrence = function(textString, regexPattern) {
        if (textString === '')
            return -1;
        var lastIndex = -1;
        var tempIndex;
        // Loop to find all occurrences and keep track of the last one
        while ((tempIndex = textString.search(regexPattern)) >= 0) {
            if (lastIndex < 0) lastIndex = 0; // Initialize if first match
            lastIndex += tempIndex; // Add current match index to total offset
            textString = textString.substr(tempIndex + 1); // Slice string to search after match
        }
        return lastIndex;
    };

    // Helper function to count character occurrences in a string
    var _characterCounter = function(targetString, charToCount) {
        var countResult = 0;
        for (var idx = 0; idx < targetString.length; idx++)
            if (targetString.charAt(idx) === charToCount) countResult++;
        return countResult;
    };

    var lowercaseQuery = searchQuery.toLowerCase();
    // Extract alphanumeric part of the query for regex matching
    var alphanumericQueryPart = (lowercaseQuery.match(/\w+/) || [''])[0];
    // Regex for prefix match at word boundaries
    var prefixAlphaNumRegex = new RegExp('\\b' + alphanumericQueryPart);
    // Regex for exact word match at word boundaries
    var exactAlphaNumRegex = new RegExp('\\b' + alphanumericQueryPart + '\\b');

    // Function to calculate a relevance score for a single search result
    var _calculateItemScore = function(searchResult) {
        // Scores are based on exact/prefix matches and depth (dots in path)
        var computedScore = 1.0;
        var lowercaseLabel = searchResult.descriptor.toLowerCase();
        var matchPosition;

        // Check for exact word matches
        matchPosition = _findLastOccurrence(lowercaseLabel, exactAlphaNumRegex);
        if (matchPosition >= 0) {
            // Stronger score for exact matches, penalized by "depth" (number of dots after match)
            var subPartsAfterMatch = _characterCounter(lowercaseLabel.substr(matchPosition + 1), '.');
            computedScore *= 200 / (subPartsAfterMatch + 1);
        } else {
            // Check for prefix matches at word boundaries
            matchPosition = _findLastOccurrence(lowercaseLabel, prefixAlphaNumRegex);
            if (matchPosition >= 0) {
                // Weaker score for prefix matches, also penalized by depth
                var subPartsAfterMatch = _characterCounter(lowercaseLabel.substr(matchPosition + 1), '.');
                computedScore *= 20 / (subPartsAfterMatch + 1);
            }
        }
        return computedScore;
    };

    // Calculate score for each matching result
    for (var loopCounter = 0; loopCounter < matchingResults.length; loopCounter++) {
        matchingResults[loopCounter].computedScoreValue = _calculateItemScore(matchingResults[loopCounter]);
    }

    // Sort the results based on computed score (descending), then lexicographically by label
    matchingResults.sort(function(itemA, itemB){
        var comparisonResult = itemB.computedScoreValue - itemA.computedScoreValue;
        if (comparisonResult === 0) { // If scores are equal, sort by label alphabetically
            comparisonResult = (itemA.descriptor < itemB.descriptor) ? -1 : 1;
        }
        return comparisonResult;
    });
}

function applyLabelHighlights(searchQuery) {
    searchQuery = searchQuery || ''; // Default to empty string if no query
    // Do nothing if no results are present
    if (!matchingResults || !matchingResults.length)
      return;

    var lowercaseQuery = searchQuery.toLowerCase();
    // Extract alphanumeric and dot characters for regex, escaping dots
    var alphanumericDotQuery = (lowercaseQuery.match(/[\w\.]+/) || [''])[0];
    var highlightRegex = new RegExp(
        '(' + alphanumericDotQuery.replace(/\./g, '\\.') + ')', 'ig'); // Case-insensitive, global regex

    // Iterate through results and create a highlighted label
    for (var loopCounter = 0; loopCounter < matchingResults.length; loopCounter++) {
        // Replace matching parts of the label with bold tags
        matchingResults[loopCounter].highlightedLabel = matchingResults[loopCounter].descriptor.replace(
            highlightRegex, '<b>$1</b>');
    }
}

function handleInputFocusChange(inputObject, isFocused) {
    if (isFocused) {
        // When input field gains focus
        if(inputObject.value === DEFAULT_PROMPT_MESSAGE){
            inputObject.value = ""; // Clear default text
            inputObject.style.color = "#000000"; // Set text color to black
        }
    } else {
        // When input field loses focus
        if(inputObject.value === ""){
          inputObject.value = DEFAULT_PROMPT_MESSAGE; // Restore default text if empty
          inputObject.style.color = "#aaaaaa"; // Set text color to grey
        }
        // Hide the search results display
        document.getElementById("search_results_display_area").className = "hidden-item";
    }
}

function initiateSearchSubmission() {
  // Check if a dedicated search page is supported
  if (SUPPORTS_DEDICATED_SEARCH_PAGE) {
    var searchQuery = document.getElementById('search_input_field').value;
    // Construct the URL for the search page and navigate
    document.location = globalRootPath + 'search_page.html#term=' + searchQuery + '&type=0';
  }
  return false; // Prevent default form submission
}