////////////////////////////////////////////////////////////////////////////////
//
// File: Fuzzy Search Library
// Project: https://github.com/myork/fuzzy
//
// Original Author: Matt York
// Copyright (c) 2012 Matt York
// License: MIT (Massachusetts Institute of Technology License)
//
// This library provides fuzzy string matching capabilities.
//
////////////////////////////////////////////////////////////////////////////////

// Anonymous self-executing function to encapsulate the library.
( function () {

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this ;

  // Create the main `fuzzy` object.
  var fuzzy = { } ;


  // Export the `fuzzy` object for use in Node.js or browser environments.
  if ( typeof exports !== 'undefined' ) {

    // Node.js environment: export as a module.
    module.exports = fuzzy ;

  } else {

    // Browser environment: attach to the root object (window).
    root.fuzzy = fuzzy ;

  }


  //
  // `fuzzy.simpleFilter`
  //
  // Filters an array of strings based on a fuzzy match against a given pattern.
  //
  // @param {string} pattern - The pattern to match against.
  // @param {Array<string>} array - The array of strings to filter.
  // @returns {Array<string>} An array containing strings that fuzzy match the pattern.
  //
  fuzzy.simpleFilter = function ( pattern , array ) {

    // Use the native Array.prototype.filter method.
    return array . filter ( function ( string ) {

      // Delegate the actual fuzzy test to `fuzzy.test`.
      return fuzzy . test ( pattern , string ) ;

    } ) ;

  } ;


  //
  // `fuzzy.test`
  //
  // Checks if a given pattern fuzzy matches a string.
  //
  // @param {string} pattern - The pattern to test.
  // @param {string} string - The string to test against the pattern.
  // @returns {boolean} True if the pattern matches the string, false otherwise.
  //
  fuzzy . test = function ( pattern , string ) {

    // A match exists if `fuzzy.match` does not return null.
    return fuzzy . match ( pattern , string ) !== null ;

  } ;


  //
  // `fuzzy.match`
  //
  // Attempts to fuzzy match a pattern against a string. If a match is found,
  // it returns an object containing the 'rendered' string (with matching characters
  // wrapped) and a 'score' indicating the quality of the match.
  // If no match, it returns null.
  //
  // @param {string} pattern - The pattern to match.
  // @param {string} string - The string to search within.
  // @param {object} [opts] - Optional configuration options.
  // @param {string} [opts.pre=''] - Prefix to add before a matching character.
  // @param {string} [opts.post=''] - Suffix to add after a matching character.
  // @param {boolean} [opts.caseSensitive=false] - Whether to perform a case-sensitive match.
  // @returns {object|null} An object `{ rendered: string, score: number }` on match, or `null`.
  //
  fuzzy . match = function ( pattern , string , opts ) {

    // Initialize options if not provided.
    opts = opts || { } ;

    // Current index in the pattern string.
    var patternIdx = 0 ;

    // Array to build the rendered string.
    var result = [ ] ;

    // Length of the input string.
    var len = string . length ;

    // Total score accumulated for the match.
    var totalScore = 0 ;

    // Score for the current consecutive match sequence.
    var currScore = 0 ;

    // Prefix string for wrapping matching characters.
    var pre = opts . pre || '' ;

    // Suffix string for wrapping matching characters.
    var post = opts . post || '' ;

    // The string to compare against, potentially lowercased.
    var compareString = opts . caseSensitive && string || string . toLowerCase ( ) ;

    // Current character from the original string.
    var ch ;

    // Current character from the comparison string (not used, can be removed or kept for clarity).
    var compareChar ;


    // Normalize the pattern for comparison, based on case sensitivity option.
    pattern = opts . caseSensitive && pattern || pattern . toLowerCase ( ) ;


    // Iterate through each character of the input string.
    // We either add the character to the result directly, or wrap it
    // if it matches the next character in the pattern.
    for ( var idx = 0 ; idx < len ; idx ++ ) {

      // Get the character from the original string.
      ch = string [ idx ] ;

      // Check if the current character in the comparison string matches the
      // character at the current pattern index.
      if ( compareString [ idx ] === pattern [ patternIdx ] ) {

        // If it matches, wrap the original character with pre/post.
        ch = pre + ch + post ;

        // Advance the pattern index.
        patternIdx += 1 ;

        // Score calculation: consecutive matches increase the score more significantly.
        // This gives a bonus for matches that are close together.
        currScore += 1 + currScore ;

      } else {

        // If no match, reset the consecutive score.
        currScore = 0 ;

      }

      // Add the current character's score to the total.
      totalScore += currScore ;

      // Append the (possibly wrapped) character to the result array.
      result [ result . length ] = ch ;

    } // End of for loop.


    // Check if all characters in the pattern were matched.
    if ( patternIdx === pattern . length ) {

      // If all pattern characters were found, return the rendered string and total score.
      return { rendered : result . join ( '' ) , score : totalScore } ;

    }


    // If not all pattern characters were matched, no full fuzzy match.
    return null ;

  } ;


  //
  // `fuzzy.filter`
  //
  // The primary entry point for filtering an array of items using fuzzy matching.
  // It returns a sorted array of objects, each representing a match.
  //
  // Each returned object has the following structure:
  //
  //     {
  //         string:   '<b>lah' // The rendered string with matches highlighted
  //       , index:    2        // The original index of the element in the input `arr`
  //       , original: 'blah'   // The original element from the input `arr`
  //       , score:    123      // The fuzzy match score
  //     }
  //
  // @param {string} pattern - The fuzzy pattern to match against.
  // @param {Array<any>} arr - The array of items to filter. Each item can be a string
  //                           or an object (if `opts.extract` is provided).
  // @param {object} [opts] - Optional configuration options.
  // @param {string} [opts.pre=''] - String to prepend to a matching character.
  // @param {string} [opts.post=''] - String to append to a matching character.
  // @param {boolean} [opts.caseSensitive=false] - If true, matching is case-sensitive.
  // @param {function} [opts.extract] - A function that takes an item from `arr` and
  //                                    returns the string to be used for matching.
  //                                    Example: `function(item) { return item.name; }`
  // @returns {Array<object>} An array of match objects, sorted by score (descending).
  //
  fuzzy . filter = function ( pattern , arr , opts ) {

    // Initialize options if they are not provided.
    opts = opts || { } ;

    // Use Array.prototype.reduce to build an array of matches.
    return arr

      . reduce ( function ( prev , element , idx , arr ) {

        // Determine the string to perform fuzzy matching against.
        // This might be the element itself or an extracted property.
        var str = element ;

        if ( opts . extract ) {

          // If an extraction function is provided, use it.
          str = opts . extract ( element ) ;

        }

        // Attempt to perform a fuzzy match.
        var rendered = fuzzy . match ( pattern , str , opts ) ;

        // If a match was found (rendered is not null).
        if ( rendered != null ) {

          // Add the match details to the accumulator array.
          prev [ prev . length ] = {
              string    : rendered . rendered   // The highlighted string.
            , score     : rendered . score      // The match score.
            , index     : idx                   // Original index in the input array.
            , original  : element               // The original element itself.
          } ;

        }

        // Return the updated accumulator.
        return prev ;

      } , [ ] ) // Start with an empty array as the initial accumulator.


      // Sort the results based on the match score.
      // Higher scores come first. For ties, use the original index for stable sorting.
      // See: http://ofb.net/~sethml/is-sort-stable.html for stability considerations.
      . sort ( function ( a , b ) {

        // Compare scores in descending order.
        var compare = b . score - a . score ;

        // If scores are different, return the comparison result.
        if ( compare ) return compare ;

        // If scores are the same (tie), use the original index to maintain stability.
        // Lower index comes first.
        return a . index - b . index ;

      } ) ;

  } ;


} ( ) ) ; // End of the self-executing anonymous function.