(function(jQ) {

  // Regular expression to identify and capture trailing non-whitespace segments or just whitespace.
  // This pattern is used to find natural word breaks when truncation at word boundaries is enabled.
  var trailingNonWhitespacePattern = /(\s*\S+|\s)$/;

  // Provides a convenient global utility to truncate an HTML string.
  // It returns the processed HTML content without modifying the DOM directly.
  // Internally, it leverages the jQuery plugin method for element-based truncation.
  jQ.snipHTML = function(markupContent, trimConfiguration) {
    // A temporary, unattached DOM element (e.g., a <span>) is created to host the HTML.
    // The content is appended, then the truncation plugin is applied to this temporary element.
    // Finally, the resulting HTML from the temporary element is extracted and returned.
    return jQ('<span></span>').append(markupContent).snipContent(trimConfiguration).html();
  };

  // jQuery plugin method to truncate the textual content of selected elements in place.
  // This function iterates over each element in the current jQuery selection and modifies its content.
  jQ.fn.snipContent = function(userConfiguration) {
    // --- Guard Clause: Exit if no elements are selected ---
    // If the current jQuery selection is empty, there are no elements to process.
    if (this.length === 0) {
      return this; // Return the original jQuery object for chaining.
    }

    // --- Configuration Normalization ---
    // Allow a simple numeric value to be passed directly as the maximum length.
    // This provides a shorthand for common truncation scenarios.
    if (typeof userConfiguration === 'number') {
      userConfiguration = {
        maxLength: userConfiguration
      };
    }

    // Merge the user-provided options with the globally defined default settings.
    // This ensures that all necessary configuration parameters are present and
    // user preferences override defaults.
    var finalSettings = jQ.extend({}, jQ.snipHTML.defaultOptions, userConfiguration);

    // --- Configuration Validation ---
    // Validate the 'maxLength' setting to ensure it's a non-negative number.
    // If invalid, a warning is logged, and it defaults to Infinity to prevent errors.
    if (typeof finalSettings.maxLength !== 'number' || finalSettings.maxLength < 0) {
      console.warn("jQuery.fn.snipContent: 'maxLength' must be a non-negative number. Defaulting to Infinity.");
      finalSettings.maxLength = Infinity;
    }

    // --- Element Iteration ---
    // Process each element within the current jQuery selection.
    return this.each(function() {
      var currentElement = jQ(this); // Cache the current DOM element as a jQuery object for efficiency.

      // --- Pre-processing: Handle Line Breaks ---
      // If the 'removeLineBreaks' option is true, find all <br> tags within the element
      // and replace them with a single space. This normalizes line breaks, which can
      // affect text length calculations and visual appearance.
      if (finalSettings.removeLineBreaks) {
        currentElement.find('br').replaceWith(' ');
      }

      // --- Text Extraction and Overflow Calculation ---
      // Extract the full plain text content of the element (stripping all HTML).
      var fullTextContent = currentElement.text();
      // Calculate the initial amount of characters that exceed the allowed maximum length.
      var characterOverflowAmount = fullTextContent.length - finalSettings.maxLength;

      // --- Pre-processing: Strip HTML Tags ---
      // If the 'stripHTML' option is true, re-set the element's text content
      // to its plain text version. This effectively removes all HTML markup,
      // leaving only the text. This operation occurs before detailed truncation.
      if (finalSettings.stripHTML) {
        currentElement.text(fullTextContent);
      }

      // --- Word Boundary Adjustment ---
      // If 'wordBoundary' is enabled and there is an initial overflow,
      // recalculate `characterOverflowAmount` to ensure truncation occurs at whole words.
      if (finalSettings.wordBoundary && characterOverflowAmount > 0) {
        // Get the prefix of the text up to the desired `maxLength`.
        var desiredPrefix = fullTextContent.substring(0, finalSettings.maxLength);
        // Remove the last potential partial word or trailing whitespace from this prefix.
        var wordAlignedPrefix = desiredPrefix.replace(trailingNonWhitespacePattern, '');
        // Recalculate the `characterOverflowAmount` based on the new, word-aligned length.
        // The `-1` is crucial for aligning with `splitText`'s behavior later.
        characterOverflowAmount = fullTextContent.length - wordAlignedPrefix.length - 1;
      }

      // --- Early Exit Conditions ---
      // 1. If there's no character overflow (content is within or exactly at the limit).
      // 2. If no trimming has occurred in prior recursive calls and there's no overflow.
      // In these cases, no further truncation is needed.
      if (characterOverflowAmount <= 0 && !finalSettings.wasTrimmed) {
        // Special handling for maxLength set to 0. If content should be empty but show ellipsis.
        if (finalSettings.maxLength === 0 && finalSettings.suffixIndicator) {
             currentElement.empty().append(finalSettings.suffixIndicator);
        }
        return; // Exit the current element's processing.
      }
      // If maxLength is 0 and we reached here, it means characterOverflowAmount > 0.
      // So, the content should be replaced entirely by the ellipsis.
      if (finalSettings.maxLength === 0 && characterOverflowAmount > 0) {
          currentElement.empty().append(finalSettings.suffixIndicator);
          return; // Exit the current element's processing.
      }


      // Reset the internal flag for the current element's processing.
      // This flag tracks if any content within this element's subtree has been trimmed.
      finalSettings.wasTrimmed = false;

      // --- Node-by-Node Truncation (Reverse Iteration) ---
      // Iterate over each child node (including text nodes) in reverse order.
      // Processing in reverse simplifies node removal, as it doesn't affect indices
      // of nodes yet to be processed.
      jQ.each(currentElement.contents().get().reverse(), function(nodeIndex, domNode) {
        var currentNode = jQ(domNode); // Wrap the current DOM node for jQuery operations.
        var currentNodeText = currentNode.text(); // Get the plain text content of this child node.
        var currentNodeLength = currentNodeText.length; // Determine the length of the node's text.

        // --- Case 1: Node is entirely within the overflow ---
        // If the current node's entire text content is less than or equal to the
        // remaining `characterOverflowAmount`, the node can be completely removed.
        if (currentNodeLength <= characterOverflowAmount) {
          finalSettings.wasTrimmed = true; // Mark that truncation has occurred.
          characterOverflowAmount -= currentNodeLength; // Reduce the remaining overflow.
          currentNode.remove(); // Remove the node from the DOM.
          return true; // Continue to the next node in the reverse iteration.
        }

        // --- Case 2: Node is a Text Node (Node.TEXT_NODE) ---
        // If the current node is a text node (nodeType 3), this is where the
        // final textual truncation and ellipsis insertion will happen.
        if (domNode.nodeType === Node.TEXT_NODE) {
          // Calculate the exact point to split the text node.
          // `currentNodeLength - characterOverflowAmount - 1` ensures the correct number of
          // characters are kept before the ellipsis, accounting for the ellipsis itself.
          var splitIndex = currentNodeLength - characterOverflowAmount - 1;
          // Ensure the split index is not negative (e.g., if overflow is nearly the whole node).
          if (splitIndex < 0) splitIndex = 0;

          // Prepare the ellipsis content, potentially adding a space before it.
          var finalEllipsisContent = finalSettings.suffixIndicator;
          if (finalSettings.appendSpaceBeforeEllipsis && splitIndex > 0 && currentNodeText.charAt(splitIndex - 1) !== ' ') {
              finalEllipsisContent = ' ' + finalEllipsisContent;
          }

          // Split the text node at the calculated `splitIndex`.
          // The part of the text node that is being removed is then replaced with the ellipsis.
          jQ(domNode.splitText(splitIndex)).replaceWith(finalEllipsisContent);
          finalSettings.wasTrimmed = true; // Mark as trimmed.
          return false; // Stop iteration; truncation is complete for this element.
        }

        // --- Case 3: Node is an Element Node (Recursive Truncation) ---
        // If it's an element node (and not a text node), recursively call `snipContent` on it.
        // A new `maxLength` is calculated for the child: its current length minus the overflow.
        // The `wasTrimmed` state is also passed down.
        currentNode.snipContent(jQ.extend({}, finalSettings, {
          maxLength: currentNodeLength - characterOverflowAmount,
          wasTrimmed: finalSettings.wasTrimmed // Propagate the trimmed state
        }));
        finalSettings.wasTrimmed = true; // Mark as trimmed if the recursive call executed.
        return false; // Stop iteration; truncation is complete for this element.
      });
    });
  };

  // --- Default Configuration Options ---
  // These are the default settings for `jQ.snipHTML` and `jQ.fn.snipContent`.
  // Users can override these by passing an options object to the truncation functions.
  jQ.snipHTML.defaultOptions = {
    // `stripHTML`: When true, all HTML tags are removed, leaving only plain text.
    // The content is converted to plain text before any length-based truncation.
    stripHTML: false,

    // `wordBoundary`: If true, truncation will only occur at complete word boundaries.
    // This prevents words from being cut in the middle, improving readability.
    wordBoundary: false,

    // `removeLineBreaks`: If true, <br> (line break) tags within the content
    // will be replaced by single spaces. Useful for normalizing text layout.
    removeLineBreaks: false,

    // `maxLength`: The maximum allowed length (in characters) for the truncated content.
    // Defaults to Infinity, meaning content is not truncated unless a specific length is set.
    maxLength: Infinity,

    // `suffixIndicator`: The character sequence to append to the content when it has been truncated.
    // The Unicode ellipsis character (U+2026) is a common and visually appropriate choice.
    suffixIndicator: '\u2026', // Unicode ellipsis character ( … )

    // `appendSpaceBeforeEllipsis`: A new option. If true, a space will be inserted
    // before the `suffixIndicator` if the character immediately preceding it is not already a space.
    // This can improve spacing between the truncated text and the ellipsis.
    appendSpaceBeforeEllipsis: false,

    // `wasTrimmed`: An internal flag used during recursive processing to track if
    // any content within the current element's subtree has been modified or truncated.
    // Not intended for direct user configuration.
    wasTrimmed: false
  };

})(jQuery);