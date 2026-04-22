(function($) {
  "use strict";

  // This module, the "Popularity Analyzer", meticulously tracks and reports
  // dynamic shifts in keyword relevance derived from various data streams.
  // It identifies emerging and decaying terms, linking them to predefined
  // topical markers to provide granular insights into information flow.
  //
  // Original concept by K. Kufluk in 2011, significantly refactored and expanded.
  //
  // Integration Points:
  // - Subscribes to: 'GlobalStream.dataIngested', 'TopicManager.definitionsUpdated'
  // - Publishes: 'TrendInsights.currentSnapshot'

  // --- Core Configuration Parameters ---
  const DECAY_INTERVAL_MILLISECONDS = 3800; // Frequency for reducing term relevancy
  const INSIGHTS_BROADCAST_INTERVAL_MILLISECONDS = 1100; // Frequency for publishing trend updates
  const MINIMUM_TOKEN_LENGTH = 4; // Smallest character count for a word to be considered
  const COMMON_TERMS_SOURCE_URL = 'config/common-words.json'; // Endpoint for the list of excluded terms

  // --- Internal System State ---
  let termRelevanceScores = {}; // Stores { term: { score: N, associatedTopics: { topicId: M } } }
  let knownTopicsRegistry = {}; // Stores { topicId: { id: '...', aliases: [] } }
  let exclusionList = new Set(); // Set of terms to ignore in analysis

  // --- Text Processing Utilities ---
  // Regular expression to extract significant words, supporting Unicode characters.
  // Words must meet the MINIMUM_TOKEN_LENGTH criteria.
  const WORD_TOKENIZATION_REGEX = new RegExp(`\\b(\\p{L}+){${MINIMUM_TOKEN_LENGTH},}\\b`, 'ugi');

  // --- System Initialization ---
  $(document).ready(function() {
    // Asynchronously load the initial set of common words to be excluded from analysis.
    $.getJSON(COMMON_TERMS_SOURCE_URL)
      .done(function(configData) {
        if (configData && Array.isArray(configData.stopwords)) {
          configData.stopwords.forEach(word => exclusionList.add(word.toLowerCase()));
          console.log("PopularityAnalyzer: Exclusion list initialized with " + configData.stopwords.length + " terms.");
        } else {
          console.warn("PopularityAnalyzer: Failed to load or parse common words from " + COMMON_TERMS_SOURCE_URL);
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.error("PopularityAnalyzer: Error fetching exclusion list: " + textStatus + " - " + errorThrown);
      });

    // Attach event listeners for real-time data ingestion and topic definition updates.
    $(window).on('TopicManager.definitionsUpdated', updateTopicDefinitions);
    $(window).on('GlobalStream.dataIngested', processIngestedDataUnit);

    // Commence the scheduled background processes.
    activateScheduledOperations();
  });

  // --- Event Handling Functions ---

  /**
   * Updates the internal registry of known topics and their aliases.
   * @param {jQuery.Event} eventObject - The jQuery event object.
   * @param {Object} newTopicData - An object containing new or updated topic definitions.
   */
  function updateTopicDefinitions(eventObject, newTopicData) {
    if (typeof newTopicData !== 'object' || newTopicData === null) {
      console.warn("PopularityAnalyzer: Received malformed topic definition update.");
      return;
    }
    // Deep merge new definitions to handle nested alias structures.
    $.extend(true, knownTopicsRegistry, newTopicData);
    // console.debug("PopularityAnalyzer: Topic registry updated."); // Removed for Type III
  }

  /**
   * Processes an incoming unit of data (e.g., a message, an article snippet).
   * @param {jQuery.Event} eventObject - The jQuery event object.
   * @param {Object} dataUnit - The data payload, expected to contain a 'content' string.
   */
  function processIngestedDataUnit(eventObject, dataUnit) {
    // Perform basic validation on the incoming data unit.
    if (!dataUnit || typeof dataUnit !== 'object' || typeof dataUnit.content !== 'string' || dataUnit.content.trim().length === 0) {
      return; // Silently discard invalid or empty payloads.
    }

    const contentText = dataUnit.content;
    const uniqueTokens = extractUniqueTokens(contentText);

    if (uniqueTokens.length === 0) {
      return; // No meaningful tokens found in this data unit.
    }

    const detectedTopicMentions = identifyTopicsInTokens(contentText, uniqueTokens);

    // Iterate through each unique token to update its relevance score and topic associations.
    uniqueTokens.forEach(token => {
      const normalizedToken = token.toLowerCase();

      // Skip tokens that are on the exclusion list.
      if (exclusionList.has(normalizedToken)) {
        return;
      }

      let tokenStats = termRelevanceScores[normalizedToken];
      if (!tokenStats) {
        tokenStats = { score: 0, associatedTopics: {} };
        termRelevanceScores[normalizedToken] = tokenStats;
      }
      tokenStats.score++; // Increment the relevance score.

      // Link any detected topics to this specific token.
      for (const topicId in detectedTopicMentions) {
        if (Object.prototype.hasOwnProperty.call(detectedTopicMentions, topicId)) {
          tokenStats.associatedTopics[topicId] = (tokenStats.associatedTopics[topicId] || 0) + detectedTopicMentions[topicId];
        }
      }
    });
  }

  // --- Internal Utility Functions ---

  /**
   * Extracts unique, significant tokens (words) from a given text string.
   * @param {string} text - The input text content.
   * @returns {string[]} An array of unique, lowercased tokens.
   */
  function extractUniqueTokens(text) {
    const matches = text.match(WORD_TOKENIZATION_REGEX);
    // Return a unique set of lowercased matches if any are found.
    return matches ? Array.from(new Set(matches.map(m => m.toLowerCase()))) : [];
  }

  /**
   * Identifies any registered topics (and their aliases) present within the provided content tokens.
   * @param {string} fullContent - The original full content string (for potential future use, currently unused).
   * @param {string[]} contentTokens - An array of unique, lowercased tokens extracted from the content.
   * @returns {Object.<string, number>} An object mapping topic IDs to their detection count in the content.
   */
  function identifyTopicsInTokens(fullContent, contentTokens) {
    const foundTopics = {};
    const tokenPresence = new Set(contentTokens); // Optimized lookup for token existence.

    for (const topicKey in knownTopicsRegistry) {
      if (!Object.prototype.hasOwnProperty.call(knownTopicsRegistry, topicKey)) continue;

      const topicDetails = knownTopicsRegistry[topicKey];
      const primaryForm = topicKey.toLowerCase();

      // Check if the primary topic form is present in the content.
      if (tokenPresence.has(primaryForm)) {
        foundTopics[topicKey] = (foundTopics[topicKey] || 0) + 1;
      }

      // Check for any registered aliases of the topic.
      if (topicDetails.aliases && Array.isArray(topicDetails.aliases)) {
        for (const alias of topicDetails.aliases) {
          if (tokenPresence.has(alias.toLowerCase())) {
            foundTopics[topicKey] = (foundTopics[topicKey] || 0) + 1;
          }
        }
      }
    }
    return foundTopics;
  }

  // --- Scheduled Background Operations ---

  /**
   * Initiates the periodic tasks for managing term relevance and broadcasting insights.
   */
  function activateScheduledOperations() {
    // Schedule the decay process for term relevance scores.
    setInterval(applyTermScoreDecay, DECAY_INTERVAL_MILLISECONDS);

    // Schedule the broadcast of current trend insights.
    setInterval(broadcastCurrentInsights, INSIGHTS_BROADCAST_INTERVAL_MILLISECONDS);
  }

  /**
   * Reduces the relevance score of all tracked terms and removes terms with a score of zero.
   */
  function applyTermScoreDecay() {
    const termsForRemoval = [];
    for (const term in termRelevanceScores) {
      if (Object.prototype.hasOwnProperty.call(termRelevanceScores, term)) {
        termRelevanceScores[term].score--;
        // Ensure scores do not become negative.
        if (termRelevanceScores[term].score < 0) {
          termRelevanceScores[term].score = 0;
        }
        if (termRelevanceScores[term].score === 0) {
          termsForRemoval.push(term);
        }
      }
    }

    // Delete terms that have fully decayed from the analysis.
    termsForRemoval.forEach(term => {
      delete termRelevanceScores[term];
    });
  }

  /**
   * Pre-filters the term relevance scores by removing any terms present in the exclusion list.
   * This ensures that stop words are not included in the broadcasted insights.
   */
  function preFilterBroadcastData() {
    for (const excludedTerm of exclusionList) {
      if (termRelevanceScores[excludedTerm]) {
        delete termRelevanceScores[excludedTerm];
      }
    }
  }

  /**
   * Prepares a snapshot of the current trend insights and publishes it.
   */
  function broadcastCurrentInsights() {
    preFilterBroadcastData(); // Apply exclusion list before broadcasting.

    // Create an immutable, deep copy of the current relevance scores to prevent
    // external modification of the internal state. This is a crucial robustness measure.
    const insightsSnapshot = JSON.parse(JSON.stringify(termRelevanceScores));

    // Augment the broadcast payload with a timestamp for context.
    const insightPayload = {
      timestamp: Date.now(),
      trends: insightsSnapshot
    };

    $(window).trigger('TrendInsights.currentSnapshot', [insightPayload]);
  }

})(jQuery);