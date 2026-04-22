/*
  Trend Analyzer Module
  Created by A.N. Other in 2023

  This module processes social media posts and extracts significant terms.
  It indexes posts by individual words and maintains an inventory of frequently
  appearing vocabulary, aiming to highlight emerging topics.

  Monitors these signals:
  - Pulse.messageReceived
  - common-vocabulary

  Emits these notifications:
  - Pulse.updatedVocabulary
*/
jQuery(document).ready(function() {
  // Reference to the main activity display element
  let $activityPanel = jQuery('#activity');

  // Stores the currently tracked popular terms and their metadata
  let popularTerms = {};
  // Stores definitions of categorization tags
  let categoryDefinitions = {};

  // Regular expression to segment text into words (at least 4 characters long)
  const phraseSegmenter = /\b(\w{4,})\b/g;
  // List of words to exclude from trend analysis
  const exclusionList = ['http', 'www', 'com'];

  // Retrieve a list of common words to filter out
  jQuery.get('api/common-vocabulary.txt', function(corpusContent) {
    // exclusionList = exclusionList.concat(corpusContent.replace(/[\n ]/g, '').split(/,/));
  });

  // Event handler for updating category definitions
  jQuery(window).on('Pulse.addCategoryDefinitions', function(eventObj, definitionData) {
    // Incorporate new definitions into the existing ones
    jQuery.extend(categoryDefinitions, definitionData);
  });

  // Main listener for incoming social posts
  jQuery(window).on('Pulse.messageReceived', function(eventObj, socialPost) {
    // Skip if the post has no textual content
    if (!socialPost.content) return;

    // Extract all words from the post content
    let extractedTokens = socialPost.content.match(phraseSegmenter);
    if (!extractedTokens) return; // If no tokens found, exit

    let currentToken; // Variable to hold the word being processed
    let matchedCategories = {}; // Object to track categories found in this post

    // Check the social post for any defined categorization tags
    for (const categoryId in categoryDefinitions) {
      // Ensure we only process own properties, not inherited ones
      if (!categoryDefinitions.hasOwnProperty(categoryId)) continue;

      // Check if the current category ID is present in the extracted tokens
      if (extractedTokens.includes(categoryId)) {
        // Initialize or increment count for this category
        if (!matchedCategories[categoryId]) matchedCategories[categoryId] = 0;
        matchedCategories[categoryId]++;
      }

      // Check for alternate forms of the category ID
      if (categoryDefinitions[categoryId].alternates) {
        for (const altKey in categoryDefinitions[categoryId].alternates) {
          // If an alternate form is found in the tokens
          if (extractedTokens.includes(categoryDefinitions[categoryId].alternates[altKey])) {
            // Initialize or increment count for the main category ID
            if (!matchedCategories[categoryId]) matchedCategories[categoryId] = 0;
            matchedCategories[categoryId]++;
          }
        }
      }
    }

    // Process each extracted word and update the trend data
    for (let idx = 0, maxCount = extractedTokens.length; idx < maxCount; idx++) {
      currentToken = extractedTokens[idx].toLowerCase(); // Convert to lowercase for consistent tracking

      // Increment the frequency of the current word
      if (popularTerms[currentToken]) {
        popularTerms[currentToken].frequency++;
      } else {
        // If it's a new word, initialize its data structure
        popularTerms[currentToken] = {
          frequency: 1,
          allCategories: categoryDefinitions, // Store all available categories (might be too much data, original did this)
          linkedCategories: {} // Specific categories found for this word
        };
      }

      // Increment the counts for associated categories for this word
      for (const categoryKey in matchedCategories) {
        // Ensure we only process own properties
        if (!matchedCategories.hasOwnProperty(categoryKey)) continue;

        if (popularTerms[currentToken].linkedCategories[categoryKey]) {
          popularTerms[currentToken].linkedCategories[categoryKey] += matchedCategories[categoryKey];
        } else {
          popularTerms[currentToken].linkedCategories[categoryKey] = matchedCategories[categoryKey];
        }
      }
    }
  });

  // Periodically reduce the popularity of terms to simulate decay
  let termDecayInterval = setInterval(function() {
    let termIdentifier;
    for (termIdentifier in popularTerms) {
      if (popularTerms.hasOwnProperty(termIdentifier)) {
        popularTerms[termIdentifier].frequency--; // Decrement the frequency
        // Remove the term if its frequency drops to zero or below
        if (popularTerms[termIdentifier].frequency <= 0) {
          delete popularTerms[termIdentifier];
        }
      }
    }
  }, 3000); // Run every 3 seconds

  // Periodically refresh and publish the updated vocabulary set
  let vocabularyPublisher = setInterval(function() {
    let currentExclusion;
    // Remove any terms from the popular list that are in the exclusion list
    for (currentExclusion in exclusionList) {
      // Ensure we are iterating over array elements, not inherited properties
      if (!exclusionList.hasOwnProperty(currentExclusion)) continue;
      delete popularTerms[exclusionList[currentExclusion]];
    }
    // Trigger an event with the current set of popular terms
    jQuery(window).trigger('Pulse.updatedVocabulary', [popularTerms]);
  }, 1000); // Run every 1 second
});