/*global module:true*/
/*jslint nomen:true*/

/**
 * @module Utility
 *
 * This module provides a utility function for truncating HTML strings
 * while attempting to preserve the structural integrity of the HTML tags.
 */
( function ( context, undefined ) {

  'use strict';

  /**
   * Truncates an HTML string to a specified maximum length,
   * attempting to keep HTML tags balanced and safe.
   *
   * @method truncate
   * @param {String} string        - The input string that needs to be truncated.
   * @param {Number} maxLength     - The desired maximum length for the truncated string.
   * @param {Object} [options={}]  - An optional object containing configuration parameters.
   * @param {Boolean} [options.keepImageTag=false]     - If true, `<img>` tags will be preserved; otherwise, they will be removed.
   * @param {Boolean} [options.truncateLastWord=true]  - If true, truncation can occur mid-word; if false, it will try to break on word boundaries.
   * @param {Number} [options.slop=10]                  - When `truncateLastWord` is false, this defines the tolerance (in characters)
   *                                                       to look for a natural word break before resorting to a hard break at `maxLength`.
   *                                                       (Note: `slop` will not exceed `maxLength`).
   * @param {Boolean|String} [options.ellipsis='...']  - The symbol or string to append to the truncated content, typically '...'.
   * @returns {String} The resulting truncated HTML string.
   */
  function truncate ( string, maxLength, options ) {
    // --- Constant Definitions ---
    var EMPTY_OBJECT            = {},
        EMPTY_STRING            = '',
        DEFAULT_TRUNCATE_SYMBOL = '...',
        // Determine the default slop, ensuring it doesn't exceed maxLength.
        DEFAULT_SLOP            = ( 10 > maxLength ) ? maxLength : 10,
        EXCLUDE_TAGS            = [ 'img' ], // Tags that are typically self-closing or handled specially (e.g., img)
        items                   = [],        // A stack to keep track of open HTML tags for proper closing.
        total                   = 0,         // Accumulates the count of non-HTML characters processed.
        content                 = EMPTY_STRING, // Stores the gradually built truncated HTML output.

        // --- Regular Expression Definitions ---
        // Regex for key-value attribute pairs within HTML tags.
        KEY_VALUE_REGEX         = '([\\w|-]+\\s*=\\s*"[^"]*"\\s*)*',
        // Regex for optional closing slash and whitespace within a tag.
        IS_CLOSE_REGEX          = '\\s*\\/?\\s*',
        // Regex for explicit closing slash within a self-closing tag.
        CLOSE_REGEX             = '\\s*\\/\\s*',

        // Comprehensive regex for self-closing tags (e.g., <br />).
        SELF_CLOSE_REGEX        = new RegExp( '<\\/?\\w+\\s*' + KEY_VALUE_REGEX + CLOSE_REGEX + '>' ),
        // General HTML tag regex, capturing both opening, closing, and self-closing.
        HTML_TAG_REGEX          = new RegExp( '<\\/?\\w+\\s*' + KEY_VALUE_REGEX + IS_CLOSE_REGEX + '>' ),
        // Simple regex to identify URLs, to avoid breaking them.
        URL_REGEX               = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g,
        // Regex specifically for image tags.
        IMAGE_TAG_REGEX         = new RegExp( '<img\\s*' + KEY_VALUE_REGEX + IS_CLOSE_REGEX + '>' ),
        // Regex to find word breaks (non-word characters).
        WORD_BREAK_REGEX        = new RegExp( '\\W+', 'g' ),

        // --- Loop Control Variables ---
        matches                 = true, // Flag to control the main processing loop.
        result,                         // Stores the result of regex matches.
        index,                          // Index of a regex match.
        tail,                           // Temporary variable, often for string indices.
        tag,                            // Stores a parsed tag name.
        selfClose;                      // Stores the result of a self-closing tag check.

    /**
     * Internal helper function to remove all image tags from a given string.
     * This is useful if the `keepImageTag` option is set to false.
     *
     * @private
     * @method _removeImageTag
     * @param {String} string - The input string, potentially containing image tags.
     * @returns {String} The modified string with all image tags removed.
     */
    function _removeImageTag ( string ) {
      var match = IMAGE_TAG_REGEX.exec( string ),
          index,
          len;

      // If no image tags are found, return the original string.
      if ( !match ) {
        return string;
      }

      index = match.index;
      len   = match[0].length;

      // Reconstruct the string, excluding the matched image tag.
      return string.substring( 0, index ) + string.substring( index + len );
    }

    /**
     * Internal helper function to generate closing HTML tags for any
     * currently open tags that were encountered before truncation.
     * This ensures the resulting HTML is well-formed.
     *
     * @private
     * @method _dumpCloseTag
     * @param {String[]} tags - An array of tag names that need to be closed.
     * @returns {String} A string containing the correctly ordered closing HTML tags.
     */
    function _dumpCloseTag ( tags ) {
      var html = '';

      // Reverse the array to close tags in the correct (LIFO) order.
      tags.reverse().forEach( function ( tag, index ) {
        // Only append closing tags for non-excluded elements.
        if ( -1 === EXCLUDE_TAGS.indexOf( tag ) ) {
          html += '</' + tag + '>';
        }
      } );

      return html;
    }

    /**
     * Extracts the pure tag name from an HTML tag string (e.g., 'div' from '<div>').
     * Handles cases where attributes might be present.
     *
     * @private
     * @method _getTag
     * @param {String} string - The full HTML tag string (e.g., '<div id="myId">').
     * @returns {String} The extracted tag name.
     * @throws {Error} If the HTML tag is not well-formed (missing closing '>').
     */
    function _getTag ( string ) {
      var tail = string.indexOf( ' ' );

      // If no space is found, the tag might be simple or malformed.
      if ( -1 === tail ) {
        tail = string.indexOf( '>' );
        if ( -1 === tail ) {
          // This indicates a malformed HTML tag.
          throw new Error( 'HTML tag is not well-formed : ' + string );
        }
      }

      // Extract the tag name, skipping the leading '<'.
      return string.substring( 1, tail );
    }

    /**
     * Determines the optimal end position for `String#substring()` based on truncation
     * rules, particularly considering word boundaries if `truncateLastWord` is false.
     *
     * @private
     * @method _getEndPosition
     * @param {String} string  - The remaining string segment to be considered for truncation.
     * @param {Number} [tailPos] - Optional: A boundary (e.g., an HTML tag's start) to prevent the slop from extending too far.
     * @returns {Number} The calculated end position for substring, relative to the `string` parameter.
     */
    function _getEndPosition ( string, tailPos ) {
      var defaultPos = maxLength - total, // The hard-limit position based on overall maxLength.
          position   = defaultPos,        // The final calculated truncation position.
          isShort    = defaultPos < options.slop, // Is the remaining segment shorter than the slop?
          slopPos    = isShort ? defaultPos : options.slop - 1, // Effective slop position within the segment.
          substr,                         // Substring to search for word breaks.
          startSlice = isShort ? 0 : defaultPos - options.slop, // Start of the slop-aware search window.
          endSlice   = tailPos || ( defaultPos + options.slop ), // End of the slop-aware search window.
          result;                         // Result of regex matching.

      // If we are not allowed to truncate in the middle of a word.
      if ( !options.truncateLastWord ) {

        substr = string.slice( startSlice, endSlice );

        // If a `tailPos` is provided and the substring is within it, use that length.
        if ( tailPos && substr.length <= tailPos ) {
          position = substr.length;
        } else {
          // Iterate through word breaks within the slop window.
          while ( ( result = WORD_BREAK_REGEX.exec( substr ) ) !== null ) {
            // Found a natural break before the hard limit.
            if ( result.index < slopPos ) {
              position = defaultPos - ( slopPos - result.index );
              // Special case: if break is at start and defaultPos is small, don't over-reduce.
              if ( result.index === 0 && defaultPos <= 1 ) {
                break;
              }
            }
            // Natural break exactly at the hard limit.
            else if ( result.index === slopPos ) {
              position = defaultPos;
              break; // Found the ideal break, stop searching.
            }
            // Natural break after the hard limit.
            else {
              position = defaultPos + ( result.index - slopPos );
              break; // Found a suitable break, stop searching.
            }
          }
        }
        // If the character *before* the chosen position is a space, adjust back one.
        if ( string.charAt( position - 1 ).match( /\s$/ ) ) {
          position--;
        }
      }
      return position; // Return the calculated safe truncation point.
    }

    // --- Options Initialization and Defaults ---
    options = options || EMPTY_OBJECT;
    // Set ellipsis, defaulting to '...' if not explicitly provided.
    options.ellipsis       = ( undefined !== options.ellipsis ) ? options.ellipsis : DEFAULT_TRUNCATE_SYMBOL;
    // Set truncateLastWord, defaulting to true.
    options.truncateLastWord = ( undefined !== options.truncateLastWord ) ? options.truncateLastWord : true;
    // Set slop, defaulting to DEFAULT_SLOP.
    options.slop           = ( undefined !== options.slop ) ? options.slop : DEFAULT_SLOP;

    // --- Main Truncation Logic Loop ---
    // Continue processing as long as HTML tags are being matched.
    while ( matches ) {
      matches = HTML_TAG_REGEX.exec( string );

      // If no more HTML tags are found in the remaining string.
      if ( !matches ) {
        // If we've already met or exceeded the maxLength, stop.
        if ( total >= maxLength ) {
          break;
        }

        // Check for URLs in the remaining plain text.
        matches = URL_REGEX.exec( string );
        // If no URLs or the first URL starts beyond maxLength, truncate the plain text.
        if ( !matches || matches.index >= maxLength ) {
          content += string.substring( 0, _getEndPosition( string ) );
          break;
        }

        // Process URLs to avoid breaking them.
        while ( matches ) {
          result = matches[0]; // The matched URL string.
          index  = matches.index; // The start index of the URL.

          // Add the text before the URL, up to the remaining length allowance.
          content += string.substring( 0, ( index + result.length ) - total );
          // Advance the string past the processed URL.
          string  = string.substring( index + result.length );
          // Look for the next URL.
          matches = URL_REGEX.exec( string );
        }
        break; // All content processed or truncated.
      }

      // An HTML tag was found.
      result = matches[0]; // The full matched HTML tag string.
      index  = matches.index; // The index where the tag starts.

      // If adding the text before this tag would exceed maxLength.
      if ( total + index > maxLength ) {
        // Truncate the text *before* the tag, respecting word breaks and slop.
        content += string.substring( 0, _getEndPosition( string, index ) );
        break; // Stop processing, we've reached the limit.
      } else {
        // Add the text before the tag to the content.
        total   += index;
        content += string.substring( 0, index );
      }

      // Check if it's a closing tag (e.g., '</div>').
      if ( '/' === result[1] ) {
        // Pop the corresponding opening tag from the stack.
        items.pop();
        selfClose = null; // Ensure selfClose is reset for closing tags.
      } else {
        // It's an opening or self-closing tag.
        selfClose = SELF_CLOSE_REGEX.exec( result );
        if ( !selfClose ) {
          // If not self-closing, extract tag name and push to stack.
          tag = _getTag( result );
          items.push( tag );
        }
      }

      // Append the HTML tag itself to the content.
      if ( selfClose ) {
        content += selfClose[0];
      } else {
        content += result;
      }
      // Advance the string past the processed tag.
      string = string.substring( index + result.length );
    }

    // After the loop, if there's remaining string and an ellipsis is defined, append it.
    if ( string.length > maxLength - total && options.ellipsis ) {
      content += options.ellipsis;
    }
    // Finally, dump any remaining open tags to ensure valid HTML.
    content += _dumpCloseTag( items );

    // If image tags are not to be kept, remove them from the final content.
    if ( !options.keepImageTag ) {
      content = _removeImageTag( content );
    }

    return content; // Return the final truncated HTML string.
  }

  // --- Module Export / Global Context Assignment ---
  // Check if running in a Node.js-like environment.
  if ( 'undefined' !== typeof module && module.exports ) {
    module.exports = truncate; // Export for CommonJS.
  } else {
    context.truncate = truncate; // Assign to global context (e.g., window in browser).
  }

}( this ) );