((globalContext, documentContext, jQObj) => {

  // Internal flag to track if the last processed text segment ended with a space character.
  // This helps in preventing redundant leading spaces when concatenating truncated text.
  let priorSegmentEndedWithSpace = false;

  // Extends jQuery's prototype with a new method for intelligent content abbreviation.
  // This method processes selected elements to shorten their HTML content based on a character limit,
  // providing "read more" and "show less" toggles.
  jQObj.fn.condenseContent = function(userOptions) {

    // Establish the operational configuration by merging user-provided settings
    // with the predefined default options.
    const runConfig = jQObj.extend({}, jQObj.fn.condenseContent.baseOptions, userOptions);
    
    // Validate the maximum length setting. It must be a positive number.
    if (typeof runConfig.maxLength !== 'number' || runConfig.maxLength <= 0) {
      console.error('Invalid configuration: maxLength must be a positive number.');
      return this; // Return the jQuery object to maintain chainability.
    }

    // Iterate over each DOM element that matches the initial jQuery selector.
    // The 'idx' parameter provides the index, and 'currentElement' is the raw DOM node.
    this.each(function(idx, currentElement) {
      // Perform a preliminary check to ensure the node is a valid HTML element.
      if (!currentElement || currentElement.nodeType !== Node.ELEMENT_NODE) {
        if (runConfig.debugMode) {
          console.warn(`Skipping non-element node at index ${idx}:`, currentElement);
        }
        return; // Move to the next element in the collection.
      }

      const currentElementWrapper = jQObj(currentElement);
      
      // Extract and normalize the textual content for accurate character counting.
      // This involves collapsing multiple whitespaces and trimming leading/trailing spaces.
      const rawTextualContent = currentElementWrapper.text();
      const processedTextContent = normalizeWhitespace(rawTextualContent);
      const effectiveCharCount = jQObj.trim(processedTextContent).length;

      // If the element's content is already within the specified length limit,
      // no abbreviation is necessary. Apply a specific class for styling.
      if (effectiveCharCount <= runConfig.maxLength) {
        currentElementWrapper.addClass(runConfig.cssClassPrefix + '-untouched');
        return; // Proceed to the next element.
      }

      // Calculate the actual character budget available for the content,
      // accounting for the space taken by the "more" indicator and its padding.
      const effectiveTruncationLimit = runConfig.maxLength - runConfig.moreIndicatorText.length - runConfig.indicatorReservedSpace;
      
      // Initiate the recursive DOM traversal and truncation process.
      // This function returns a new jQuery object representing the abbreviated structure.
      const abbreviatedVersion = processNodeForAbbreviation(currentElement, effectiveTruncationLimit);
      
      // Hide the original, complete DOM element and mark it with a CSS class.
      const completeVersion = currentElementWrapper.hide();
      completeVersion.addClass(runConfig.cssClassPrefix + '-full');

      // Insert the newly generated abbreviated DOM structure immediately after the original.
      abbreviatedVersion.insertAfter(completeVersion);
      abbreviatedVersion.addClass(runConfig.cssClassPrefix + '-shortened'); // Mark with CSS class.
      abbreviatedVersion.attr('data-plugin-state', 'condensed'); // Add a descriptive data attribute.

      // --- Link Creation and Event Binding ---

      // Determine the optimal insertion point within the abbreviated version for the "more" link.
      const moreLinkTarget = findSuitableAppendTarget(abbreviatedVersion, 'more');
      const showMoreLink = generateActionLink(runConfig.moreIndicatorText, '#expand-content', runConfig.cssClassPrefix + '-more-link');
      moreLinkTarget.append(showMoreLink);
      
      // Determine the optimal insertion point within the complete version for the "less" link.
      const lessLinkTarget = findSuitableAppendTarget(completeVersion, 'less');
      // Enclose the less indicator text in parentheses for visual distinction.
      const showLessLink = generateActionLink(` (${runConfig.lessIndicatorText})`, '#collapse-content', runConfig.cssClassPrefix + '-less-link');
      lessLinkTarget.append(showLessLink);
      
      // Attach event handlers to the generated links to toggle content visibility.
      // Using 'on' for more robust event handling, though 'click' would also work.
      showMoreLink.on('click', (eventObject) => {
        eventObject.preventDefault(); // Prevent the browser's default link navigation.
        abbreviatedVersion.hide();
        completeVersion.show();
        // Trigger a custom event on the document, allowing other scripts to react.
        jQObj(documentContext).trigger('contentExpanded.condenseContent', [completeVersion, abbreviatedVersion]);
      });

      showLessLink.on('click', (eventObject) => {
        eventObject.preventDefault(); // Prevent default action.
        abbreviatedVersion.show();
        completeVersion.hide();
        // Trigger a custom event for external observers.
        jQObj(documentContext).trigger('contentCollapsed.condenseContent', [completeVersion, abbreviatedVersion]);
      });
    });
  };

  // Default configuration options for the condenseContent plugin.
  // These can be globally modified via `jQObj.fn.condenseContent.baseOptions.prop = value;`
  // or overridden per call via the `options` object passed to `condenseContent()`.
  jQObj.fn.condenseContent.baseOptions = {
    maxLength: 180,               // Max characters before content is truncated.
    moreIndicatorText: '... [More Information]', // Text for the "show more" link.
    lessIndicatorText: 'Collapse View',    // Text for the "show less" link.
    indicatorReservedSpace: 5,    // Characters (e.g., " ()") reserved for indicator context.
    cssClassPrefix: 'jq-dynamic-content', // Base prefix for all CSS classes added by the plugin.
    debugMode: false              // Enable console warnings for non-critical issues.
  };

  /**
   * Recursively processes a given DOM node to generate an abbreviated version.
   * This function distinguishes between text nodes and element nodes for processing.
   * @param {Node} targetNode The DOM node (either text or element) to process.
   * @param {number} remainingCharLimit The character budget available for this node and its children.
   * @returns {Node|string|null} The abbreviated node (jQuery object), a text string, or null if nothing was generated.
   */
  function processNodeForAbbreviation(targetNode, remainingCharLimit) {
    if (targetNode.nodeType === Node.TEXT_NODE) {
      return shortenTextContent(targetNode, remainingCharLimit);
    } else if (targetNode.nodeType === Node.ELEMENT_NODE) {
      return abbreviateStructuralElement(targetNode, remainingCharLimit);
    }
    // Ignore other node types (e.g., comments, processing instructions) in the truncation process.
    return null; 
  }

  /**
   * Truncates an HTML element by recursively processing its child nodes until the
   * character limit is reached. It creates a new, identical element to contain the truncated content.
   * @param {HTMLElement} originalHtmlElement The original HTML element to truncate.
   * @param {number} availableLength The maximum character length remaining for this element's content.
   * @returns {jQuery} A newly created jQuery object representing the abbreviated element.
   */
  function abbreviateStructuralElement(originalHtmlElement, availableLength) {
    const originalJqElement = jQObj(originalHtmlElement);
    // Create a brand new element with the same tag name as the original.
    const newJqElement = jQObj(`<${originalHtmlElement.tagName.toLowerCase()} />`);
    
    // Copy all attributes from the original element to the new one,
    // explicitly excluding the 'id' attribute to prevent DOM ID conflicts.
    jQObj.each(originalHtmlElement.attributes, function() {
      if (this.name.toLowerCase() !== 'id') {
        newJqElement.attr(this.name, this.value);
      }
    });

    let resultFromChildProcessing; // Stores the output from processing a child node.

    // Iterate through all direct children (elements, text nodes, comments) of the original element.
    originalJqElement.contents().each(function() {
      // If the character budget has been exhausted, stop processing further children.
      if (availableLength <= 0) {
        return false; // This breaks the jQObj.each loop.
      }

      // Recursively process the current child node.
      resultFromChildProcessing = processNodeForAbbreviation(this, availableLength);

      // If the child processing yielded some content (not null).
      if (resultFromChildProcessing !== null) {
        let contentLengthContribution;
        // Determine the length of the content contributed by the child.
        // If it's a string (from a text node), use its length directly.
        // If it's a jQuery object (from an element node), get its total text content length.
        if (typeof resultFromChildProcessing === 'string') {
          contentLengthContribution = resultFromChildProcessing.length;
        } else {
          contentLengthContribution = jQObj(resultFromChildProcessing).text().length;
        }
                                   
        newJqElement.append(resultFromChildProcessing); // Append the processed child.
        availableLength -= contentLengthContribution; // Reduce the remaining budget.
      }
    });
    return newJqElement;
  }

  /**
   * Truncates a raw text node to a specified character limit, managing whitespace
   * and ensuring proper HTML entity encoding for display safety.
   * @param {Text} originalTextNode The raw text DOM node.
   * @param {number} charLimit The maximum character length for the output text.
   * @returns {string} The truncated, whitespace-normalized, and HTML-encoded text.
   */
  function shortenTextContent(originalTextNode, charLimit) {
    let sourceText = originalTextNode.data;
    let normalizedSourceText = normalizeWhitespace(sourceText);

    // Conditional removal of a leading space: if the previous text segment ended with a space
    // and this current segment starts with one, remove the current segment's leading space
    // to prevent double spaces in the concatenated output.
    if (priorSegmentEndedWithSpace && normalizedSourceText.startsWith(' ')) {
      normalizedSourceText = normalizedSourceText.substring(1);
    }
    
    // Update the `priorSegmentEndedWithSpace` flag based on the current segment's trailing space.
    priorSegmentEndedWithSpace = normalizedSourceText.endsWith(' ');

    // Extract the final segment of text based on the character limit.
    const finalTruncatedSegment = normalizedSourceText.slice(0, charLimit);

    // To prevent XSS vulnerabilities and ensure correct display, HTML entities
    // within the text must be properly encoded. We use a temporary DOM element
    // to leverage the browser's built-in encoding mechanism.
    const tempElement = documentContext.createElement('span'); // Using span instead of div for inline context.
    tempElement.textContent = finalTruncatedSegment; // This correctly encodes HTML entities.
    return tempElement.innerHTML; // Retrieve the HTML-encoded string.
  }

  /**
   * Collapses sequences of one or more whitespace characters into a single space.
   * This helps in consistent character counting and display.
   * @param {string} rawString The input string potentially containing multiple whitespaces.
   * @returns {string} The string with normalized whitespace.
   */
  function normalizeWhitespace(rawString) {
    return rawString.replace(/\s+/g, ' ');
  }
  
  /**
   * Identifies the most appropriate child element within a container to append
   * either the "more" or "less" action links.
   * @param {jQuery} parentContainer The jQuery object of the container node.
   * @param {string} linkType A string ('more' or 'less') to guide the selection logic.
   * @returns {jQuery} The jQuery object of the identified target element.
   */
  function findSuitableAppendTarget(parentContainer, linkType) {
    const lastDirectChild = parentContainer.children(":last");

    if (linkType === 'more') {
      // For "more" links, we want to append deeply within the last block-level element.
      // If no children, or the last child is inline, or its display cannot be determined,
      // the parent container itself is the target.
      if (lastDirectChild.length === 0 || lastDirectChild.css('display') === 'inline' || !lastDirectChild.css('display')) {
        return parentContainer;
      }
      // Recursively dive into the last child to find the innermost block-level element.
      return findSuitableAppendTarget(lastDirectChild, linkType);
    } else { // linkType === 'less'
      // For "less" links, if the last child is a paragraph, append there; otherwise, to the parent.
      if (lastDirectChild.length > 0 && lastDirectChild.is('p')) {
        return lastDirectChild;
      }
      return parentContainer;
    }
  }

  /**
   * A utility function to create a jQuery anchor (<a>) element with specified properties.
   * @param {string} textContent The visible text for the link.
   * @param {string} destinationHref The `href` attribute value for the link.
   * @param {string} cssClass Optional CSS class name(s) to add to the anchor.
   * @returns {jQuery} A new jQuery object representing the constructed anchor tag.
   */
  function generateActionLink(textContent, destinationHref, cssClass = '') {
    const newAnchorElement = jQObj('<a>', {
      href: destinationHref,
      text: textContent
    });
    if (cssClass) {
      newAnchorElement.addClass(cssClass);
    }
    return newAnchorElement;
  }

})(window, document, jQuery);