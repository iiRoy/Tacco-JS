var UtilityKit = require('../lib/utilities');
var DataVault = require('./vault');
var appSettings = require('../configuration.js');
var lodashUtil = require("lodash");

/**
 * @class ContextProcessor
 * @description Manages the processing of text segments to extract relationships and frequencies.
 */
var ContextProcessor = function() {
    // Initialize utility provider for text operations.
    this.utilityProvider = UtilityKit;
    // Initialize data store for persistence.
    this.dataStore = new DataVault();
};

/**
 * @method processDocumentChunk
 * @description Analyzes a given text segment, tokenizes it, counts word frequencies,
 *              and stores word relationships in the data store.
 * @param {string} textSegment - The block of text to be processed.
 * @param {number} chunkIdentifier - A unique identifier for the current text chunk (for logging/tracking).
 * @param {function} completionHandler - Callback function to execute upon completion.
 */
ContextProcessor.prototype.processDocumentChunk = function(textSegment, chunkIdentifier, completionHandler) {
    // Basic input validation: ensure the text segment is a non-empty string.
    if (!textSegment || typeof textSegment !== 'string' || textSegment.trim().length === 0) {
        console.warn(`ContextProcessor: Skipping processing for invalid or empty text segment in chunk ${chunkIdentifier}.`);
        // Call the handler even if no processing occurred, indicating completion with an error.
        return completionHandler(new Error('Invalid or empty text segment provided.'));
    }

    // Tokenize the input text into individual terms (words).
    // The utilityProvider handles the complexity of splitting and cleaning the text.
    const tokenizedTerms = this.utilityProvider.extractTokens(textSegment);

    // If no meaningful terms are extracted after tokenization, there's nothing to process further.
    if (tokenizedTerms.length === 0) {
        console.log(`ContextProcessor: No processable terms found in chunk ${chunkIdentifier}.`);
        return completionHandler(null, { message: 'No terms to process.' }); // Indicate success with no data processed.
    }

    // Prepare a map to store the frequency of each unique term within this segment.
    const termFrequencyMap = {};
    // Activate batch operations mode for the data store to improve performance
    // by queuing multiple operations before a single flush to the database.
    this.dataStore.initiateBatchOperation();

    // Iterate through all extracted terms to count frequencies and queue them for global indexing.
    for (let idx = 0; idx < tokenizedTerms.length; idx++) {
        const currentRawTerm = tokenizedTerms[idx];
        // Standardize the term to lowercase for consistent indexing and comparison.
        const normalizedTerm = currentRawTerm.toLocaleLowerCase();

        // Increment the frequency count for the normalized term.
        // This concise idiom handles both first occurrences and subsequent increments.
        termFrequencyMap[normalizedTerm] = (termFrequencyMap[normalizedTerm] || 0) + 1;

        // Add the normalized term to a global queue for further scraping or discovery operations.
        this.dataStore.enqueueItemForDiscovery(normalizedTerm);
    }

    // Process the collected term frequencies to establish relationships between terms.
    // This involves iterating over the unique terms found in the segment.
    lodashUtil.forEach(termFrequencyMap, (frequencyCount, currentTermKey) => {
        // Robustness check: ensure the current term key is valid before proceeding.
        // Although keys from `termFrequencyMap` are expected to be strings, this adds a layer of safety.
        if (!currentTermKey || typeof currentTermKey !== 'string') {
            console.warn(`ContextProcessor: Encountered an invalid term key: '${currentTermKey}'. Skipping relationship processing.`);
            return; // Continue to the next item in the map.
        }

        // For each term, establish relationships with all other terms that appeared in the same segment.
        lodashUtil.forEach(termFrequencyMap, (relatedFrequency, relatedTermKey) => {
            // Avoid creating a relationship of a term with itself, as this is typically not useful.
            if (currentTermKey !== relatedTermKey) {
                // Record a directed relationship between two terms, weighted by their co-occurrence frequency.
                this.dataStore.addTermRelationship(currentTermKey, relatedTermKey, relatedFrequency);
            }
        });

        // Update global statistics for the current term, tracking its overall importance or usage across all processed chunks.
        this.dataStore.updateGlobalTermMetric(frequencyCount, currentTermKey);
    });

    // Execute all pending batch operations with the data store.
    // The completionHandler is invoked once all database operations are finalized,
    // passing any errors or results from the batch execution.
    this.dataStore.executeBatchOperation((operationError, operationResults) => {
        if (operationError) {
            console.error(`ContextProcessor: Error during batch data store operation for chunk ${chunkIdentifier}:`, operationError);
            return completionHandler(operationError);
        }
        // Successfully processed the chunk and persisted data.
        completionHandler(null, operationResults);
    });
};

// Export the ContextProcessor class for external modules to utilize.
module.exports = ContextProcessor;