var UtilityKit = require('../support/utilities');
var DataStore = require('./persistor');
var appSettings = require('../settings.js');
var _u = require("lodash");

var SemanticAnalyzer = function() {
    this.utilityInstance = UtilityKit;
    this.dataAccess = new DataStore();
};

SemanticAnalyzer.prototype.processTextSegment = function(textualExcerpt, segmentIdentifier, resultHandler) {

    // Verify if the debug flag is enabled in application settings.
    if (appSettings.credentials.debugMode) {
        console.info('Initiating content segment analysis.');
    }

    // Convert the input textual content into an array of distinct tokens.
    const parsedTokens = this.utilityInstance.breakIntoTokens(textualExcerpt);

    // If debugging is active, log the total number of tokens found.
    if (appSettings.credentials.debugMode) {
        console.info('Total tokens in segment (Ref: ' + segmentIdentifier + '): ' + parsedTokens.length);
    }

    // Prepare an empty dictionary to record the frequency of each token.
    let tokenFrequencyMap = {};

    // Enable batch processing mode for the underlying data store for efficiency.
    this.dataAccess.activateBatchMode();

    // Traverse the array of parsed tokens from end to beginning.
    for (let currentIdx = parsedTokens.length - 1; currentIdx >= 0; currentIdx--) {

        // Normalize the current token to lowercase for consistent keying.
        const lowercasedToken = parsedTokens[currentIdx].toLowerCase();

        // Update the occurrence count for this specific token.
        if (typeof tokenFrequencyMap[lowercasedToken] === 'undefined') {
            tokenFrequencyMap[lowercasedToken] = 1; // First detection of this token.
        } else {
            tokenFrequencyMap[lowercasedToken]++; // Increment count for subsequent detections.
        }

        // Add this token to a general queue for potential future processing or indexing.
        this.dataAccess.enqueueItemForProcessing(lowercasedToken);
    }

    // Iterate through each unique token and its recorded frequency in the map.
    _u.forEach(tokenFrequencyMap, (tokenCount, primaryToken) => {

        // Skip any tokens that are undefined or lack string methods, indicating invalidity.
        if (typeof primaryToken === 'undefined' || typeof primaryToken.toLowerCase === 'undefined') {
            return;
        }

        // Ensure the primary token is in lowercase for all subsequent operations.
        const primaryLower = primaryToken.toLowerCase();

        // For each primary token, compare it against all other tokens in the same segment.
        _u.forEach(tokenFrequencyMap, (secondaryTokenCount, secondaryToken) => {
            // Establish a relationship only if the tokens are distinct.
            if (primaryToken !== secondaryToken) {
                // Record the semantic connection between the primary and secondary token,
                // including the frequency of the secondary token within this segment.
                this.dataAccess.establishRelationship(primaryLower, secondaryToken.toLowerCase(), secondaryTokenCount);
            }
        });

        // Update the overall statistical counter for the primary token across all segments.
        this.dataAccess.updateGlobalStatistics(tokenCount, primaryLower);
    });

    // Execute all pending database operations in the batch.
    this.dataAccess.commitChanges((errorObject, dbResponses) => {
        // Call the provided handler function once the commit process is finished.
        resultHandler();
        return true; // Affirmative return to indicate handler execution.
    });
};

module.exports = SemanticAnalyzer;