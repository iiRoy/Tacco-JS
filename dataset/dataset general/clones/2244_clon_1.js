( function ( $ ) {
  'use strict' ; // Ensure strict mode for better code quality and error handling

  /**
   * Recursively finds the optimal truncation point within a string to fit a given dimension.
   * This function is a helper for the main truncation logic.
   *
   * @param {string} dim - The dimension to measure ('width' or 'height').
   * @param {number} max - The maximum allowed dimension value.
   * @param {string} txt - The text to be truncated.
   * @param {number} start - The starting index for the binary search.
   * @param {number} end - The ending index for the binary search.
   * @param {jQuery} $worker - A hidden jQuery element used for measuring text dimensions.
   * @param {string} token - The truncation token (e.g., '&hellip;').
   * @param {boolean} reverse - If true, truncation is done from the end of the string.
   * @returns {number} The optimal truncation index.
   */
  function findTruncPoint(dim, max, txt, start, end, $worker, token, reverse) {

    /**
     * Helper function to set content on the worker element and append/prepend the token.
     * @param {string} content - The text content to set.
     */
    var makeContent = function(content) {
      $worker.text(content); // Set the text content for measurement
      $worker[reverse ? 'prepend' : 'append'](token); // Add the truncation token
    };

    var opt1, opt2, mid, opt1dim, opt2dim; // Declare variables used in the binary search

    // Determine the text slices based on the 'reverse' flag
    if ( reverse ) {
      // If reversing, slice from the end of the string
      opt1 = start === 0 ? '' : txt.slice( -start );
      opt2 = txt.slice( -end );
    } else {
      // Otherwise, slice from the beginning
      opt1 = txt.slice( 0, start );
      opt2 = txt.slice( 0, end );
    }

    // Early exit if the token itself exceeds the maximum dimension
    if (max < $worker.html(token)[dim]()) {
      return 0; // No space even for the token, return 0 length
    }

    // Measure dimensions for opt2 and opt1
    makeContent(opt2); // Measure text with 'end' length
    opt1dim = $worker[dim](); // Store dimension for 'end' length (misnamed 'opt1dim' here)

    makeContent(opt1); // Measure text with 'start' length
    opt2dim = $worker[dim](); // Store dimension for 'start' length (misnamed 'opt2dim' here)

    // If 'end' length is shorter than 'start' length, 'end' is the current best fit
    if ( opt1dim < opt2dim ) {
      return end;
    }

    // Calculate the midpoint for binary search
    mid = parseInt((start + end) / 2, 10); // Use parseInt with radix 10 for safety
    opt1 = reverse ? txt.slice( -mid ) : txt.slice( 0, mid ); // Get text slice for midpoint

    makeContent(opt1); // Measure text with 'mid' length

    // Check if the current midpoint exactly matches the maximum dimension
    if ( $worker[dim]() === max ) {
      return mid; // Found the perfect fit
    }

    // Adjust the search range based on whether the current text exceeds or fits within the max dimension
    if ( $worker[dim]() > max ) {
      end = mid - 1; // Text is too long, search in the lower half
    } else {
      start = mid + 1; // Text is too short, search in the upper half
    }

    // Recursively call the function with the updated search range
    return findTruncPoint(dim, max, txt, start, end, $worker, token, reverse);
  }


  // jQuery plugin definition for truncation
  $.fn.truncate = function(options) {
    // Handle backward compatibility for 'center' option
    if (options && !!options.center && !options.side) {
      options.side = 'center'; // Map old 'center' to new 'side: "center"'
      delete options.center; // Remove the deprecated option
    }

    // Validate the 'side' option, delete if invalid
    if (options && !(/^(left|right|center)$/).test(options.side)) {
      delete options.side; // Remove invalid side option
    }

    // Define default options for the plugin
    var defaults = {
      width: 'auto', // Default width for truncation
      token: '&hellip;', // Default truncation token
      side: 'right', // Default truncation side
      addclass: false, // Whether to add a class to truncated elements
      addtitle: false, // Whether to add a title attribute with original text
      multiline: false, // Whether to truncate multiline text based on height
      assumeSameStyle: false // Optimization: assume all elements share the same style
    };
    // Extend defaults with user-provided options
    options = $.extend(defaults, options);

    // Declare variables that will be used across the `each` loop or conditionally
    var fontCSS;
    var $element;
    var $truncateWorker;
    var elementText;

    // If assumeSameStyle is true, initialize the worker element once outside the loop
    if ( options.assumeSameStyle ) {
      $element = $( this[0] ); // Get the first element to derive style
      fontCSS = {
        'fontFamily': $element.css('fontFamily'),
        'fontSize': $element.css('fontSize'),
        'fontStyle': $element.css('fontStyle'),
        'fontWeight': $element.css('fontWeight'),
        'font-variant': $element.css('font-variant'),
        'text-indent': $element.css('text-indent'),
        'line-height': $element.css('line-height'),
        'text-transform': $element.css('text-transform'),
        'letter-spacing': $element.css('letter-spacing'),
        'word-spacing': $element.css('word-spacing'),
        'display': 'none' // Keep the worker element hidden
      };
      // Create and append the worker element to the body
      $truncateWorker = $('<span/>')
                         .css(fontCSS)
                         .appendTo('body');
    }

    // Iterate over each selected element
    return this.each(function() {
      $element = $(this); // Current element being processed
      elementText = $element.text(); // Get the original text of the element

      // If not assuming same style, create/recreate the worker for each element
      if ( !options.assumeSameStyle ) {
        fontCSS = {
          'fontFamily': $element.css('fontFamily'),
          'fontSize': $element.css('fontSize'),
          'fontStyle': $element.css('fontStyle'),
          'fontWeight': $element.css('fontWeight'),
          'font-variant': $element.css('font-variant'),
          'text-indent': $element.css('text-indent'),
          'line-height': $element.css('line-height'),
          'text-transform': $element.css('text-transform'),
          'letter-spacing': $element.css('letter-spacing'),
          'word-spacing': $element.css('word-spacing'),
          'display': 'none'
        };
        $truncateWorker = $('<span/>')
                           .css(fontCSS)
                           .text(elementText) // Set initial text for measurement
                           .appendTo('body');
      } else {
        // If assuming same style, just update the text of the existing worker
        $truncateWorker.text(elementText);
      }

      var originalWidth = $truncateWorker.width(); // Get original width of the text
      var truncateWidth = parseInt(options.width, 10) || $element.width(); // Desired width, fallback to element's current width
      var dimension = 'width'; // Default dimension to measure
      var truncatedText, originalDim, truncateDim; // Variables for truncation results and dimensions

      // Handle multiline truncation (based on height)
      if ( options.multiline ) {
        $truncateWorker.width( $element.width() ); // Set worker width to element width for height calculation
        dimension = 'height'; // Change dimension to height
        originalDim = $truncateWorker.height(); // Get original height
        truncateDim = $element.height() + 1; // Target height (add 1px tolerance)
      }
      else {
        // For single-line truncation (based on width)
        originalDim = originalWidth; // Original dimension is width
        truncateDim = truncateWidth; // Target dimension is width
      }

      truncatedText = { before: '', after: '' }; // Initialize parts of the truncated text

      // Only truncate if the original dimension exceeds the target dimension
      if ( originalDim > truncateDim ) {
        var truncPoint, truncPoint2; // Variables to store truncation points
        $truncateWorker.text(''); // Clear worker text before finding trunc points

        // Truncation logic based on the 'side' option
        if ( options.side === 'left' ) {
          // Truncate from the left (text on the right)
          truncPoint = findTruncPoint(
            dimension, truncateDim, elementText, 0, elementText.length,
            $truncateWorker, options.token, true // Reverse search
          );
          truncatedText.after = elementText.slice( -1 * truncPoint ); // Get the right part of the text

        } else if ( options.side === 'center' ) {
          // Truncate from the center (text on both sides)
          truncateDim = parseInt( truncateDim / 2, 10 ) - 1; // Divide target dimension for two sides, subtract 1 for token
          truncPoint = findTruncPoint(
            dimension, truncateDim, elementText, 0, elementText.length,
            $truncateWorker, options.token, false // Search from left
          );
          truncPoint2 = findTruncPoint(
            dimension, truncateDim, elementText, 0, elementText.length,
            $truncateWorker, '', true // Search from right, no token for second part measurement
          );
          truncatedText.before = elementText.slice( 0, truncPoint ); // Get the left part
          truncatedText.after = elementText.slice( -1 * truncPoint2 ); // Get the right part

        } else if ( options.side === 'right' ) {
          // Truncate from the right (text on the left)
          truncPoint = findTruncPoint(
            dimension, truncateDim, elementText, 0, elementText.length,
            $truncateWorker, options.token, false // Forward search
          );
          truncatedText.before = elementText.slice( 0, truncPoint ); // Get the left part of the text
        }

        // Apply additional class if specified
        if ( options.addclass ) {
          $element.addClass( options.addclass );
        }

        // Add title attribute with original text if specified
        if ( options.addtitle ) {
          $element.attr( 'title', elementText );
        }

        // HTML-encode the truncated parts to prevent XSS and display entities correctly
        truncatedText.before = $truncateWorker
                               .text( truncatedText.before )
                               .html();
        truncatedText.after = $truncateWorker
                               .text( truncatedText.after )
                               .html();

        // Update the element's content with the truncated text and token
        $element.empty().html(
          truncatedText.before + options.token + truncatedText.after
        );

      } // End of truncation conditional block

      // Remove the worker element if it was created for this specific element
      if ( !options.assumeSameStyle ) {
        $truncateWorker.remove();
      }
    }); // End of .each loop

    // If assumeSameStyle was true, remove the single worker element after all processing
    if ( options.assumeSameStyle ) {
      $truncateWorker.remove();
    }
  }; // End of $.fn.truncate plugin

})( jQuery ); // Pass jQuery object to the immediately invoked function expression