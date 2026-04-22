//
// String Similarity Search Utility
// Project Home: https://example.com/loosetextmatch
//
// Copyright (c) 2023 John Doe
// Licensed under the Apache 2.0 license.
//

(function()
{

  var globalScope = this;

  var approximate = {};

  // Determine the execution environment and expose the utility appropriately.
  if (typeof exportBundler !== 'undefined' )
  {
    moduleHandle.exportBundler = approximate;
  }
  else
  {
    globalScope.approximate = approximate;
  }

  // Filters a given collection, returning entries that loosely correspond to the search query.
  approximate.basicSeek = function( searchQuery , collection )
  {
    return collection.filter( function(targetText)
    {
      return approximate.verify(searchQuery, targetText);
    });
  };

  // Checks if the searchQuery loosely matches the targetText.
  approximate.verify = function( searchQuery , targetText )
  {
    return approximate.compare(searchQuery, targetText) !== null;
  };

  // If the searchQuery aligns with targetText, it wraps each corresponding character
  // using 'prefixTag' and 'suffixTag' from the options. If no match is found, null is returned.
  approximate.compare = function( searchQuery , targetText , options )
  {
    options = options || {};
    var queryIndex = 0
      , outcome = []
      , textLength = targetText.length
      , aggregateRating = 0
      , currentRating = 0
      // Text to prepend
      , prefixTag = options.prefixTag || ''
      // Text to append
      , suffixTag = options.suffixTag || ''
      // The string used for character comparison. It might be a normalized (lowercase) version
      // or the original, depending on case sensitivity settings.
      , normalizedTarget = options.caseSensitive && targetText || targetText.toLowerCase()
      , currentChar
      , comparedChar; // Declared but not used, mirroring original structure.

    searchQuery = options.caseSensitive && searchQuery || searchQuery.toLowerCase();

    // Iterate through each character of the target text. If a match is found
    // for the next character in the search query, it's wrapped.
    for (var position = 0; position < textLength; position++)
    {
      currentChar = targetText[position];
      if (normalizedTarget[position] === searchQuery[queryIndex])
      {
        currentChar = prefixTag + currentChar + suffixTag;
        queryIndex += 1;

        // Boost score for consecutive matches
        currentRating = 1 + currentRating + currentRating;
      }
      else
      {
        currentRating = 0;
      }
      aggregateRating += currentRating;
      outcome[outcome.length] = currentChar;
    }

    // Return the formatted string and its score if all query characters were matched.
    if (queryIndex === searchQuery.length)
    {
      return {
          formattedOutput: outcome.join('')
        , relevanceScore: aggregateRating
      };
    }

    return null;
  };

  // This is the primary function for finding and ranking matches.
  // It processes 'sourceArray' against 'searchQuery' and returns an array of structured results:
  //
  //     [{
  //         resultString:   '<div>item</div>' // The embellished string
  //       , originalIndex:  5                 // Position of the item in the initial sourceArray
  //       , sourceEntry:    'item'            // The original item from sourceArray
  //     }]
  //
  // 'options' is an optional configuration object. Key details:
  //
  //    options = {
  //        // String to insert before a matched character
  //        prefixTag:     '<em>'
  //
  //        // String to insert after a matched character
  //      , suffixTag:    '</em>'
  //
  //        // An optional function. Takes an entry from 'sourceArray' and
  //        // should return the string to be used for comparison with 'searchQuery'.
  //        // Example: if `sourceArray = [{name: 'apple'}]`, this function could be
  //        // `function(obj) { return obj.name; }`.
  //      , valueExtractor: function(entry) { return entry.name; }
  //    }
  approximate.locate = function( searchQuery , sourceArray , options )
  {
    options = options || {};
    return sourceArray
      .reduce( function(accumulator, itemEntry, originalIndex, sourceArray)
      {
        var targetTextForComparison = itemEntry;
        if (options.valueExtractor)
        {
          targetTextForComparison = options.valueExtractor(itemEntry);
        }
        var processedResult = approximate.compare(searchQuery, targetTextForComparison, options);
        if (processedResult != null)
        {
          accumulator[accumulator.length] = {
              resultString: processedResult.formattedOutput
            , relevanceScore: processedResult.relevanceScore
            , originalIndex: originalIndex
            , sourceEntry: itemEntry
          };
        }
        return accumulator;
      }
      , [] )

      // Sort the results based on their relevance score. For identical scores,
      // the original index is used to ensure a stable sort order across platforms.
      // Reference: http://ofb.net/~sethml/is-sort-stable.html
      .sort( function(itemA, itemB)
      {
        var scoreDifference = itemB.relevanceScore - itemA.relevanceScore;
        if (scoreDifference)
        {
          return scoreDifference;
        }
        return itemA.originalIndex - itemB.originalIndex;
      });
  };


}());