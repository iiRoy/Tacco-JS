/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact functionality and identifier names,
 * differing only in whitespace and comments.
 *
 * File: CloneOfMatchesPlugin.js
 * Purpose: Handles CSS :matches() pseudo-class expansion in PostCSS.
 * Version: 1.0.0 (Cloned from original source)
 */

var COMMA_PLACEHOLDER =  '&'; // Defines a placeholder character for commas within :matches() arguments.

var MATCH_REGEX = /:matches\(([^\(\)]+)\)/g; // Regular expression to identify and capture content of :matches() selectors.

// The module exports a factory function that returns the actual PostCSS plugin function.
module.exports = function()
{ // Start of the outer factory function.

  /**
   * Generates all possible combinations (Cartesian product) of selectors
   * when multiple :matches() pseudo-classes are present within a single selector string.
   *
   * @param {string} selector       The base selector string that contains one or more :matches().
   * @param {Array<string>} matchesParts Array containing the full matched :matches(...) strings (e.g., [':matches(a)', ':matches(b,c)']).
   * @param {Array<Array<string>>} values Array of arrays, where each inner array contains
   *                                      the comma-separated individual selector parts from inside a :matches() (e.g., [['a'], ['b', 'c']]).
   * @param {Array<string>} arr      The array to which the newly generated selector combinations will be appended.
   * @returns {Array<string>} The updated array now containing all generated Cartesian selector combinations.
   */
  function addCartesianSelectors( selector, matchesParts, values, arr )
  {
    var max = matchesParts.length - 1; // Determines the index of the last :matches() part to know when recursion ends.

    /**
     * Recursive helper function to build the Cartesian product of selectors.
     * @param {string} str The current selector string being built.
     * @param {number} i   The current index of the :matches() part being processed.
     */
    function helper( str, i )
    {
      // Iterate through each individual value for the current :matches() part.
      for ( var j = 0, l = values[i].length; j < l; j += 1 )
      {
        var newstr = str.replace( matchesParts[i], values[i][j] ); // Replaces the current :matches() pseudo-class with one of its expanded values.

        if ( i === max )
        { // If this is the last :matches() part, we have a complete, expanded selector.
          arr.push( newstr ); // Add the fully expanded selector to the result array.
        }
        else
        { // Otherwise, there are more :matches() parts to process, so recurse.
          helper( newstr, i + 1 ); // Call helper for the next :matches() part with the updated selector string.
        }
      }
    }

    helper( selector, 0 ); // Initiates the recursive process starting from the first :matches() part.
    return arr;            // Returns the array populated with all generated selector combinations.
  }

  /**
   * A utility function to check if a given selector string does NOT contain a ':matches(' substring.
   * This is used later to filter out original :matches() selectors after they have been expanded.
   *
   * @param {string} selector The selector string to be examined.
   * @returns {boolean} True if ':matches(' is not found in the selector, false otherwise.
   */
  function isNotMatchesSelector( selector )
  {
    return selector.indexOf( ':matches(' ) === -1;
  }


  // This is the main PostCSS plugin function that processes the style object.
  return function( style )
  {
    /*
     * The plugin iterates over each rule within the provided PostCSS style object.
     * The `replaceMatches` function is designed to be called recursively for nested rules,
     * such as those found within `@media` queries or `@supports` rules.
     */
    style.rules.forEach( function replaceMatches( rule )
    {
      // If the current rule itself contains an array of sub-rules (e.g., a media query block),
      // recursively process those nested rules first.
      if ( rule.rules )
      {
        rule.rules.forEach( replaceMatches );
      }

      // If a rule does not have any selectors (e.g., an `@import` statement or a comment node),
      // there's nothing to process, so we skip it.
      if ( !rule.selectors )
      {
        return;
      }

      /*
       * PostCSS (or rather, the underlying CSS parser like ReworkCSS)
       * typically splits selector strings by commas unconditionally.
       * This behavior creates a problem for `:matches(selectorA, selectorB)`
       * because the comma inside the parentheses would be misinterpreted
       * as a separator for distinct selectors.
       *
       * To circumvent this, we temporarily replace commas located *within*
       * any `:matches()` pseudo-class with a unique placeholder character (`COMMA_PLACEHOLDER`, which is '&').
       * After this replacement, the selector string can be safely split by external commas.
       */
      var actualSelectors = rule.selectors.join( ',' ) // First, join all selectors in the rule into a single comma-separated string.
                                .replace( /:matches\(.*?\)/g, function( substr )
                                { // For every instance of ':matches(...)' found:
                                  return substr.replace( /,/g, COMMA_PLACEHOLDER ); // Replace commas *inside* it with our placeholder.
                                } )
                                .split( ',' ); // Now, split the string by the *external* commas to get distinct selectors.

      rule.selectors = actualSelectors; // Update the rule's `selectors` array with these temporarily processed selectors.

      /*
       * Now, iterate through each selector (which might still contain `:matches()` with placeholders)
       * to perform the actual expansion of the `:matches()` pseudo-classes.
       */
      rule.selectors.forEach( function findMatchesSelector( selector, i )
      {
        var options, match, values, matches, lastIndex; // Declare variables used within this loop iteration.

        // Check if the current selector string actually contains a ':matches(' pseudo-class.
        if ( selector.indexOf( ':matches(' ) !== -1 )
        {
          values = [];  // Initialize an array to hold the split values from each :matches() (e.g., [['a'], ['b', 'c']]).
          matches = []; // Initialize an array to hold the full :matches() strings found (e.g., [':matches(a)', ':matches(b,c)']).


          // Loop through the selector string to find all occurrences of `:matches()`.
          // `MATCH_REGEX.exec(selector)` will return `null` when no more matches are found.
          while ( ( match = MATCH_REGEX.exec( selector ) ) )
          {
            // Error handling: Prevent invalid nesting.
            // According to CSS spec, :matches() or :not() cannot be nested directly inside another :matches().
            if ( match[1].indexOf( ':matches(' ) !== -1 || match[1].indexOf( ':not(' ) !== -1 )
            {
              throw new Error(
                'Cannot nest :matches(...) or :not(...) in :matches(...) selector: ' +
                selector.replace( /&/g, ',' ) // Restore original commas for a clearer error message.
              );
            }
            // Error handling: Detect sequential :matches() pseudo-classes without any intervening characters.
            // This is typically an invalid or ambiguous selector pattern.
            else if ( lastIndex === match.index )
            {
              throw new Error(
                'Cannot have sequential :matches in selector: ' +
                selector.replace( /&/g, ',' ) // Restore original commas for a clearer error message.
              );
            }

            matches.push( match[0] );                                      // Store the full matched string (e.g., ':matches(foo,bar)').
            values.push( match[1].split( COMMA_PLACEHOLDER ) );            // Split the captured content (e.g., 'foo,bar') by placeholder to get individual selectors.
            lastIndex = MATCH_REGEX.lastIndex;                             // Update `lastIndex` for the regex, used to detect sequential matches.
          }

          // Once all :matches() parts are identified, generate all Cartesian product combinations.
          // These new, expanded selectors are appended directly to `rule.selectors`.
          addCartesianSelectors( selector, matches, values, rule.selectors );
        }
      } );

      // After all :matches() have been expanded and new selectors added,
      // filter out any remaining selectors that still contain `:matches()`.
      // These are the original, unexpanded selectors which are no longer needed.
      rule.selectors = rule.selectors.filter( isNotMatchesSelector );
    } );
  }; // End of the inner plugin function returned by the factory.
}; // End of module.exports factory function.