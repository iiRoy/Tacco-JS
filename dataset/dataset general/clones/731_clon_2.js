// This file contains components for client-side content querying.
//
// All rights reserved.
// This software is provided "as is", without any express or implied warranty.
// The author shall not be held liable for any damages arising from the use of this software.

// A boolean indicator for query activity, preventing parallel operations.
let isProcessingQuery = false;

// An array to hold the aggregated query outcomes globally.
const accumulatedOutcomes = [];

// Utility procedure to activate or deactivate user interface elements
// associated with the query functionality.
function toggleQueryUI(activeState) {
    // Target elements with the class "query-controls" and adjust their disabled property.
    $(".query-controls").prop("disabled", !activeState);
}

// Support function to retrieve all enumerable property names from an object
// and return them as an array of strings.
function extractObjectKeys(inputObject) {
    const extractedKeys = []; // Initialize an empty array for collected property names.
    // Iterate over all properties of the provided object.
    for (const propName in inputObject) {
        // Ensure the property belongs directly to the object, not its prototype chain.
        if (inputObject.hasOwnProperty(propName)) {
            extractedKeys.push(propName); // Add the property name to the list.
        }
    }
    return extractedKeys; // Return the array of property names.
}

// Initiates a content query operation based on user input.
// Takes a callback function to execute upon query completion.
function executeQueryOperation(completionHandler) {
    // Proceed only if no query is currently running and the input field is not empty.
    if (!isProcessingQuery && $.trim($("#query-input").val()) !== "") {
        // Mark the system as busy to prevent concurrent queries.
        isProcessingQuery = true;
        // Clear any previous query results.
        accumulatedOutcomes.length = 0; // Efficiently clear array.
        // Disable relevant UI components while the query is in progress.
        toggleQueryUI(false);

        // Fetch the query data from the server.
        $.getJSON('/query-data.json', function(receivedData, requestStatus) {

            // Process the user's input: trim, convert to lowercase, and split into individual terms.
            const queryTerms = $.trim($("#query-input").val()).toLowerCase().split(" ");
            const temporaryFindings = {}; // Object to store intermediate search results.

            // Iterate through each indexed term from the fetched data.
            $.each(extractObjectKeys(receivedData["terms"]), function(termIndex, dataKey) {
                // For each term provided by the user in their query.
                $.each(queryTerms, function(wordIndex, currentTerm) {
                    // Prepare a regular expression for "fuzzy" matching.
                    // This is applied only if the term has more than two characters.
                    let searchPattern = currentTerm;
                    if (currentTerm.length > 2) {
                        try {
                            // Construct a regex for flexible matching (e.g., 'w*o*r*d').
                            searchPattern = new RegExp(currentTerm.split('').join('\\w*').replace(/\W/, ""), 'i');
                        } catch (exception) {
                            // If regex creation fails (e.g., due to special characters in query),
                            // fall back to simple string matching.
                        }
                    }

                    // Check if the indexed data key matches the constructed search pattern.
                    if (dataKey.match(searchPattern)) {
                        // If a match is found, retrieve all associated documents for this term.
                        $.each(receivedData["terms"][dataKey], function(itemIndex, resultObject) {
                            // The 'identifier' field points to an entry in the 'lookup' table.
                            const documentIdentifier = resultObject["identifier"];
                            // Ensure the document exists in the main lookup table.
                            if (receivedData["lookup"][documentIdentifier]) {
                                // Initialize result entry if it's the first time this document is found.
                                if (!temporaryFindings[documentIdentifier]) {
                                    temporaryFindings[documentIdentifier] = {};
                                    temporaryFindings[documentIdentifier]["score"] = 0.0; // Initial score.
                                    temporaryFindings[documentIdentifier]["title"] = receivedData["lookup"][documentIdentifier]["title"]; // Document title.
                                    temporaryFindings[documentIdentifier]["url"] = receivedData["lookup"][documentIdentifier]["url"]; // Document URL.
                                }

                                // Accumulate the score from this specific term's match.
                                // Future enhancement: adjust score based on match precision.
                                temporaryFindings[documentIdentifier]["score"] += parseFloat(resultObject["score"]);
                            }
                        });
                    }
                });
            });

            // Collect all unique identifiers from the temporary findings.
            const resultKeys = [];
            $.each(temporaryFindings, function(findingKey, findingValue) {
                resultKeys.push(findingKey);
            });

            // Sort the identifiers based on accumulated score (descending),
            // then by title alphabetically (ascending) for tie-breaking.
            resultKeys.sort(function(itemA, itemB) {
                const comparisonResult = temporaryFindings[itemB]["score"] - temporaryFindings[itemA]["score"];
                if (comparisonResult === 0.0) {
                    // If scores are identical, sort by title.
                    return (temporaryFindings[itemA]["title"] > temporaryFindings[itemB]["title"]) ? 1 : ((temporaryFindings[itemB]["title"] > temporaryFindings[itemA]["title"]) ? -1 : 0);
                } else {
                    return comparisonResult; // Sort by score if different.
                }
            });

            // Populate the global results array with sorted findings.
            $.each(resultKeys, function(idx, findingKey) {
                accumulatedOutcomes.push(temporaryFindings[findingKey]);
            });

            // Invoke the provided completion callback.
            completionHandler();
        })
        .done(function() {
            // Actions to take upon successful data retrieval (optional).
        })
        .fail(function() {
            // Actions to take if the data request fails (optional).
        })
        .always(function() {
            // This block executes regardless of success or failure.
            // Reset the query processing flag.
            isProcessingQuery = false;
            // Re-enable the query user interface.
            toggleQueryUI(true);
        });
    }
}