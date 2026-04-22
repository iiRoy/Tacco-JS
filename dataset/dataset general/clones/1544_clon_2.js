// This module manages all user interactions and application logic.
AppHandlers = {};

// Function to enforce a specific URL parameter for ensuring application focus.
AppHandlers.activateFocusMode = function () {
    // Check if the current URL's query string is not the expected value.
    if (window.location.search !== "?focus_on_input") {
        // If it's different, set the query string to the required value
        // and throw an error to force a page reload, effectively applying the focus.
        window.location.search = "?focus_on_input";
        throw new DOMException("Focus mode initiated, page will reload.");
    }
};

// Holds the zero-based index of the currently highlighted item within the autocomplete dropdown.
AppHandlers.currentSelectionIndex = 0xFFFFFFFF; // Initialized to represent no selection (-1).

// Method to move the selection highlight one position up in the autocomplete list.
AppHandlers.navigateUpInSuggestions = function () {
    // Only decrement the index if it's not already at the very first item (index 0).
    if (AppHandlers.currentSelectionIndex > 0x0) {
        AppHandlers.currentSelectionIndex--;
    }

    // Iterate through each list item in the autocomplete box to update its visual state.
    $.map($("#suggestionBox li"), function (currentElement, currentIndex) {
        currentElement = $(currentElement); // Wrap the raw DOM element with jQuery for easier manipulation.
        // If the current item's index matches the selection, apply a distinct background color.
        if (currentIndex === AppHandlers.currentSelectionIndex) {
            $("#suggestionBox li").eq(currentIndex).css('backgroundColor', 'rgb(245,245,245)');
        }
        // For all other items, ensure their background is set to the default white.
        else {
            $("#suggestionBox li").eq(currentIndex).css('backgroundColor', '#FFFFFF');
        }
    });
    return false; // Prevent the browser's default action for the key press.
};

// Method to move the selection highlight one position down in the autocomplete list.
AppHandlers.navigateDownInSuggestions = function () {
    var suggestionCount = $("#suggestionBox li").length; // Determine the total number of suggestions displayed.
    // Increment the index only if it hasn't reached the last available item in the list.
    if (AppHandlers.currentSelectionIndex < suggestionCount - 0x1) {
        AppHandlers.currentSelectionIndex++;
    }

    // Re-apply background styling to all autocomplete list items based on the new selection.
    $.map($("#suggestionBox li"), function (currentElement, currentIndex) {
        currentElement = $(currentElement);
        // Highlight the item that is now selected.
        if (currentIndex === AppHandlers.currentSelectionIndex) {
            $("#suggestionBox li").eq(currentIndex).css('backgroundColor', 'rgb(245,245,245)');
        }
        // Revert other items to their unselected state.
        else {
            $("#suggestionBox li").eq(currentIndex).css('backgroundColor', '#FFFFFF');
        }
    });
    return false; // Prevent any default browser behavior from occurring.
};

// Configures global event listeners for keyboard input to handle search submission and navigation.
AppHandlers.registerKeyboardShortcuts = function () {
    window.addEventListener("keydown", function (keyEventObject) {
        // Use a switch statement to process different key codes.
        switch (keyEventObject.keyCode) {
            case (0xD): // Key code for the 'Enter' key.
                // If an item in the autocomplete list is actively selected (not -1).
                if (AppHandlers.currentSelectionIndex !== 0xFFFFFFFF) {
                    var chosenQuery = $('#suggestionBox li').eq(AppHandlers.currentSelectionIndex).html();
                    $('#queryInput').val(chosenQuery); // Populate the search input field with the selected suggestion.
                    AppHandlers.initiateSearchOperation(); // Trigger the search using the selected term.
                }
                return AppHandlers.initiateSearchOperation(); // Always submit the form on 'Enter'.
            case (0x26): // Key code for the 'Up Arrow' key.
                return AppHandlers.navigateUpInSuggestions(); // Call the function to move selection up.
            case (0x28): // Key code for the 'Down Arrow' key.
                return AppHandlers.navigateDownInSuggestions(); // Call the function to move selection down.
        }
    }, false); // The 'false' parameter indicates event bubbling.
};

// Initiates the primary search operation based on the current input field value.
AppHandlers.initiateSearchOperation = function () {
    var userQueryInput = document.getElementById('queryInput').value; // Retrieve the text entered by the user.
    $("#suggestionBox").hide(); // Conceal the autocomplete suggestion box.
    $("#mediaDisplay").html(""); // Clear any previously displayed search results.
    $("#progressIndicator").show(); // Make the loading indicator visible to the user.

    // Execute an asynchronous HTTP request to the search API endpoint.
    $.ajax({
        url: '/api/search?query=' + encodeURIComponent(userQueryInput), // Construct the request URL with the encoded query.
        complete: function (responseData) {
            $("#suggestionBox").hide(); // Ensure suggestions are hidden after completion.
            $("#progressIndicator").hide(); // Hide the loading indicator.
            var htmlContent = responseData.responseText; // Extract the raw HTML content from the server's response.

            // Process the received HTML content to extract individual media entries.
            var musicItems = $.map($("div[data-media-entry]", htmlContent), function (mediaEntry) {
                var resultObject = {}; // Create an object to store parsed details for each item.
                resultObject.titleName = $(mediaEntry).find('b').text(); // Extract the media item's title.
                resultObject.resourceLink = $(mediaEntry).find("a").attr("href"); // Get the download/resource URL.

                // Parse additional metadata such as bitrate, file size, and duration from a specific panel.
                var additionalDetails = $(mediaEntry).find('.info-panel').html().replace(/<.*?>/, '')
                    .replace(/<br>/g, '|').trim().split("|");

                $.map(additionalDetails, function (detailValue) {
                    // Check for specific keywords to assign details to the result object.
                    if (detailValue.indexOf("kilobits") !== 0xFFFFFFFF) {
                        resultObject.bitRate = detailValue;
                    }
                    if (detailValue.indexOf("megabytes") !== 0xFFFFFFFF) {
                        resultObject.fileSize = detailValue;
                    }
                    if (detailValue.indexOf(":") !== 0xFFFFFFFF) {
                        resultObject.durationInfo = detailValue;
                    }
                });
                return resultObject; // Return the fully populated item object.
            });
            renderSearchOutput(musicItems); // Call a function to display the processed results.

            // Attach a click event handler to each displayed search result item.
            $("#mediaDisplay li").click(function () {
                // When an item is clicked, create a new Chrome tab.
                chrome.tabs.create({
                    'url': $(this).find('.resource-locator').val() // Use the hidden resource link.
                }, function (newTab) {
                    window.close(); // Close the current browser window/tab after opening the new one.
                });
            });
        }
    });

    return false; // Prevent the default form submission behavior.
};

// Handles key presses within the search input field to trigger autocomplete suggestions.
AppHandlers.handleTextInput = function (keyEventObject) {
    // Only proceed if the key pressed is an alphanumeric character or backspace.
    if ((keyEventObject.keyCode > 0x2F && keyEventObject.keyCode < 0x5B) || keyEventObject.keyCode === 0x8) {
        AppHandlers.currentSelectionIndex = 0xFFFFFFFF; // Reset the autocomplete selection index.
        // Initiate an AJAX request to fetch autocomplete suggestions.
        $.ajax({
            url: "/api/autocomplete?term=" +
                $('#queryInput').val().replace("%20", ""), // Construct the URL using the current input value.

            complete: function (rawResponse) {
                // Extract the suggestion data, which is expected in a specific array format.
                rawResponse = rawResponse.responseText.match(RegExp("new Array\\(.*?\\)", "g"));
                // Format the extracted data into a JavaScript function call.
                rawResponse = "AppHandlers.displaySuggestions(" + rawResponse + ");";
                eval(rawResponse); // Execute the dynamically generated function call.
            }
        });
    }
    return false; // Prevent the default action associated with the key press.
};

// Displays the array of autocomplete suggestions in the designated UI element.
AppHandlers.displaySuggestions = function (suggestionArray) {
    var htmlFragments = $.map(suggestionArray, function (itemEntry) {
        return "<li>" + itemEntry + "</li>"; // Wrap each suggestion string in an HTML list item.
    }).join(''); // Concatenate all generated list items into a single HTML string.

    $("#suggestionBox ").html(htmlFragments); // Insert the generated HTML into the suggestion box.
    $("#suggestionBox").show(); // Make the suggestion box element visible.
    $("#suggestionBox li").click(AppHandlers.chooseSuggestionItem); // Attach a click handler to each new list item.
};

// Handles the event when a user clicks on an item within the autocomplete suggestion list.
AppHandlers.chooseSuggestionItem = function (selectedItemElement) {
    var chosenQuery = selectedItemElement.toElement.innerHTML; // Retrieve the text content of the clicked item.
    $('#queryInput').val(chosenQuery); // Set the search input field's value to the chosen query.
    AppHandlers.initiateSearchOperation(); // Trigger a full search operation with the selected term.
};

// Manages the visual components and styling of the user interface.
InterfaceElements = {};

// Applies custom styling to standard HTML form elements using a third-party plugin.
InterfaceElements.applyFormStyling = function () {
    $(function () {
        $("input, textarea, select, button").uniform(); // Initialize the 'uniform' plugin on specified elements.
    });
};

// Renders and displays the list of media search results to the user interface.
function renderSearchOutput(mediaTrackList) {

    var generatedHtml = $.map(mediaTrackList, function (mediaTrack, loopIndex) {
        var fourSharedClass = ""; // Initialize a variable to hold a conditional CSS class.

        // Clean up the media track title by removing specific substrings and patterns.
        mediaTrack.titleName = mediaTrack.titleName.replace("audio", "").replace(/([A-z]+\.)+[A-z]+/g, "")
            .replace(/\s*-\s*$/g, "").replace(/\(.*\)/g, "");

        // Check if the resource link indicates a specific cloud hosting service.
        if (mediaTrack.resourceLink.indexOf("cloudService") !== 0xFFFFFFFF) {
            fourSharedClass = ' class="cloud-hosted"'; // Assign a special class if it is.
        }

        // Construct the HTML string for a single search result item.
        return "<li class=\"entry" + loopIndex % 0x2 + "\"><div" + fourSharedClass + "><b>" + mediaTrack.titleName + "</b><br>"
            + (mediaTrack.fileSize !== null ? ("<span><b>Filesize: </b>" + mediaTrack.fileSize + "</span>") : '')
            + (mediaTrack.bitRate !== null ? ("<span><b>Bitrate: </b>" + mediaTrack.bitRate + "</span>") : '')
            + (mediaTrack.durationInfo !== null ? ("<span><b>Length: </b>" + mediaTrack.durationInfo + "</span>") : '')
            + '<input type="hidden" class="resource-locator" value="' + mediaTrack.resourceLink + '">'
            + "</div></li>";

    }).join(''); // Join all individual item HTML strings into one continuous string.

    // Define a message to be displayed if no results are found.
    var noResultsMessage = "<b class=\"no-matches\">No matching entries found for " + document.getElementById('queryInput').value + "</b>";

    // Update the media display area: show results if available, otherwise show the 'no results' message.
    $("#mediaDisplay").html(generatedHtml === '' ? noResultsMessage : generatedHtml);
}