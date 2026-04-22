/*
 * Comprehensive Search Module - Core Logic
 * Copyright (c) 2023 [Your Name/Company - or just a generic statement]
 *
 * This software is provided under the MIT License, which grants
 * permission to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, subject to the
 * inclusion of the original copyright notice and this permission notice
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

// Module-level flag to control concurrent search operations.
let isQueryInProgress = false;

// Stores the final, ordered collection of search results.
let discoveredEntities = [];

// Utility to fetch the search input field.
const getSearchInputElement = () => $("#searchbox");

// Adjusts the interactive state of all search-related UI elements.
const modifySearchControlsState = (enableInteraction) => {
  const controlElements = $(".search");
  if (controlElements.length > 0) {
    controlElements.prop("disabled", !enableInteraction);
    console.log(`Search controls ${enableInteraction ? "enabled" : "disabled"}.`);
  } else {
    console.warn("No elements with class 'search' found for state modification.");
  }
};

// Main function to initiate and manage the search process.
const initiateSearchOperation = (queryCompletionHandler) => {
  const currentSearchTerm = getSearchInputElement().val();
  const trimmedSearchInput = $.trim(currentSearchTerm);

  // Prevent multiple simultaneous searches and ensure a non-empty query.
  if (isQueryInProgress || trimmedSearchInput === "") {
    if (isQueryInProgress) {
      console.warn("Search operation already in progress. Skipping new request.");
    }
    if (trimmedSearchInput === "") {
      console.info("Empty search query. No operation initiated.");
    }
    return; // Exit if conditions not met
  }

  try {
    // Set global flag to indicate an active search.
    isQueryInProgress = true;
    console.log(`Initiating search for: "${trimmedSearchInput}"`);

    // Clear previous results before starting a new search.
    discoveredEntities = [];

    // Disable UI elements to prevent user interaction during the search.
    modifySearchControlsState(false);

    // Normalize search terms for processing.
    const processedSearchTerms = trimmedSearchInput.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (processedSearchTerms.length === 0) {
        console.warn("No valid search terms after processing. Aborting search.");
        finalizeSearchProcess(); // Re-enable controls
        return;
    }

    // Execute the asynchronous data retrieval.
    $.ajax({
      url: '/search.json',
      method: 'GET', // Explicitly specify GET method
      dataType: 'json',
      timeout: 10000, // 10-second timeout for the request
      success: (retrievedData) => {
        console.log("Search data successfully retrieved.");

        if (!retrievedData || !retrievedData.words || !retrievedData.index) {
          console.error("Invalid or incomplete data structure received from search endpoint.");
          finalizeSearchProcess();
          return;
        }

        let preliminaryResults = {};
        let totalDocumentsProcessed = 0;

        // Iterate through all indexed words from the server response.
        Object.keys(retrievedData.words).forEach(indexedWord => {
          // For each indexed word, check against user's search terms.
          processedSearchTerms.forEach(userTerm => {
            let matchingRegex = userTerm; // Default to direct string match
            if (userTerm.length >= 3) { // Apply fuzzy matching for longer terms
              try {
                // Construct a flexible regex for "fuzzy" matching (e.g., 'w*o*r*d')
                matchingRegex = new RegExp(userTerm.split('').join('\\w*').replace(/[^a-zA-Z0-9]/g, ''), 'i');
              } catch (e) {
                console.warn(`Failed to create regex for term "${userTerm}": ${e.message}. Using exact match.`);
                // Fallback to plain string match if regex creation fails (e.g., due to special chars)
              }
            }

            // Check if the indexed word matches the user's term (fuzzy or exact).
            if (indexedWord.match(matchingRegex)) {
              // If a match is found, process all associated documents.
              retrievedData.words[indexedWord].forEach(docEntry => {
                const docId = docEntry.u; // Unique identifier for the document.
                const documentMetadata = retrievedData.index[docId];

                if (documentMetadata) {
                  // Initialize result entry if it's the first time this document is encountered.
                  if (!preliminaryResults[docId]) {
                    preliminaryResults[docId] = {
                      score: 0.0,
                      title: documentMetadata.t || "Untitled Document",
                      url: documentMetadata.u || "#"
                    };
                  }

                  // Accumulate the score for this document.
                  // Ensure score is a number, defaulting to 0 if invalid.
                  const wordScore = parseFloat(docEntry.s) || 0.0;
                  preliminaryResults[docId].score += wordScore;
                  totalDocumentsProcessed++;
                } else {
                  console.warn(`Document metadata not found for ID: ${docId}`);
                }
              });
            }
          });
        });

        // Extract and sort the document identifiers based on accumulated scores.
        const relevantDocIds = Object.keys(preliminaryResults);

        // Custom sort logic: highest score first, then alphabetical by title for ties.
        relevantDocIds.sort((docIdentifierA, docIdentifierB) => {
          const docA = preliminaryResults[docIdentifierA];
          const docB = preliminaryResults[docIdentifierB];

          const scoreComparison = docB.score - docA.score;
          if (scoreComparison === 0) {
            // If scores are equal, sort alphabetically by title.
            return docA.title.localeCompare(docB.title);
          }
          return scoreComparison;
        });

        // Populate the final results array with sorted entities.
        relevantDocIds.forEach(id => {
          discoveredEntities.push(preliminaryResults[id]);
        });

        console.log(`Search completed. Found ${discoveredEntities.length} relevant entities.`);
        console.log(`Total document entries processed: ${totalDocumentsProcessed}`);

        // Invoke the provided callback function upon successful completion.
        if (typeof queryCompletionHandler === 'function') {
          queryCompletionHandler(discoveredEntities); // Pass results to callback
        } else {
          console.warn("No valid query completion handler provided.");
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error(`AJAX request failed: ${textStatus}, ${errorThrown}`);
        console.error("Response Text:", jqXHR.responseText);
        // Optionally, inform the user about the error via UI.
      },
      complete: () => {
        // This block executes regardless of success or failure.
        finalizeSearchProcess();
      }
    });
  } catch (globalError) {
    console.error("An unexpected error occurred during search initiation:", globalError);
    finalizeSearchProcess();
    // Potentially re-throw or handle more gracefully.
  }

  // Helper function to reset search state.
  function finalizeSearchProcess() {
    isQueryInProgress = false;
    modifySearchControlsState(true);
    console.log("Search process finalized. Controls re-enabled.");
  }
};