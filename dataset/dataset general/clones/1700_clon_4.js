const LexicalProcessor = require('./utility/lexical-processor');
const DataPersistor = require('./storage/data-persistor');
const SystemConfig = require('./config/system-settings');

var DocumentInsightEngine = function() {
    this.textSegmenter = LexicalProcessor;
    this.persistentStore = new DataPersistor();
};

DocumentInsightEngine.prototype.analyzeContentBlock = function(contentSegment, analysisIdentifier, completionCallback) {
    if (SystemConfig.application.debugMode) {
        console.log('Commencing content block analysis');
    }

    const rawTokens = this.textSegmenter.segmentIntoTokens(contentSegment);

    if (SystemConfig.application.debugMode) {
        console.log(`Segment ${analysisIdentifier}: Token count = ${rawTokens.length}`);
    }

    this.persistentStore.initiateBatchOperations();

    const termFrequencies = new Map();
    rawTokens.forEach(token => {
        const normalizedTerm = token.toLowerCase();
        termFrequencies.set(normalizedTerm, (termFrequencies.get(normalizedTerm) || 0) + 1);
        this.persistentStore.queueForProcessing(normalizedTerm);
    });

    const uniqueTerms = Array.from(termFrequencies.keys());

    uniqueTerms.forEach(currentTerm => {
        this.persistentStore.updateGlobalMetric(termFrequencies.get(currentTerm), currentTerm);

        uniqueTerms.forEach(comparisonTerm => {
            if (currentTerm !== comparisonTerm) {
                this.persistentStore.recordInterconnection(currentTerm, comparisonTerm, termFrequencies.get(comparisonTerm));
            }
        });
    });

    this.persistentStore.finalizeBatchCommit(function(dbError, dbResponses) {
        completionCallback();
        return true;
    });
};

module.exports = DocumentInsightEngine;