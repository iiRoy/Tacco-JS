if (typeof TextEditorAddons === 'undefined') {
  var TextEditorAddons = {};
}

TextEditorAddons.blockQuoteDivider = (function() {

  /**
   * Generates a basic closing HTML tag for a given DOM node.
   * @private
   * @param {HTMLElement} domElement - The DOM node to process.
   * @returns {string} The closing HTML tag, e.g., "</div>".
   */
  const produceClosingTagMarkup = function(domElement) {
    if (!domElement || !domElement.nodeName) {
      return ''; // Return an empty string for invalid elements.
    }
    return `</${domElement.nodeName.toLowerCase()}>`;
  };

  /**
   * Generates an opening HTML tag, including all its attributes, for a given DOM node.
   * This is achieved by cloning the node and extracting its outerHTML.
   * @private
   * @param {HTMLElement} domElement - The DOM node to process.
   * @returns {string} The opening HTML tag with attributes, e.g., "<div class='container'>".
   */
  const produceOpeningTagWithAllAttributes = function(domElement) {
    if (!domElement || !domElement.nodeName) {
      return ''; // Guard against null or undefined elements.
    }

    // Create a shallow clone to avoid including child nodes in the outerHTML.
    const elementCopy = domElement.cloneNode(false);
    if (!elementCopy) {
      return ''; // If cloning fails for some reason, return empty.
    }
    elementCopy.innerHTML = ''; // Ensure the clone is truly empty of content.

    // Utilize jQuery's outerHTML for reliable attribute extraction.
    const fullOuterHtml = $(elementCopy)[0].outerHTML;
    const tagNameInLower = elementCopy.nodeName.toLowerCase();

    // Regex to meticulously strip the tag name and its closing part from the outerHTML,
    // leaving only the attributes string.
    const attributeString = fullOuterHtml
      .replace(new RegExp(`^<${tagNameInLower}\\s*`, 'i'), '') // Remove leading "<tagname " or "<tagname"
      .replace(new RegExp(`>.*</${tagNameInLower}>$`, 'i'), '>') // Remove content and closing tag, leaving '>' after attributes.
      .slice(0, -1); // Remove the final '>' character.

    // Reconstruct the opening tag with the extracted attributes.
    return `<${tagNameInLower}${attributeString ? ` ${attributeString}` : ''}>`;
  };

  return {
    /**
     * Initializes the blockquote splitting plugin, attaching a handler to the editor's keydown event.
     * This method ensures the plugin is ready to intercept 'Enter' key presses within blockquotes.
     */
    initializePlugin: function() {
      // Validate that editor options are accessible before proceeding.
      if (!this.opts) {
        console.error('Editor options (this.opts) are not available. Blockquote plugin cannot initialize.');
        return;
      }

      // Assign the custom keydown callback.
      this.opts.keydownCallback = (keyboardEvent) => {
        const standardEnterKey = 13; // The keyCode for the Enter key.

        // Only process if the Enter key was pressed.
        if (keyboardEvent.keyCode !== standardEnterKey && keyboardEvent.which !== standardEnterKey) {
          return; // Exit if it's not the Enter key.
        }

        const activeDomElement = this.getBlock(); // Retrieve the currently focused block-level element.
        if (!activeDomElement) {
          return; // No active element means no context for a split.
        }

        // Identify the highest ancestor blockquote element within the editor's content.
        const uppermostBlockquote = this.locateTopmostBlockquote(activeDomElement, this.get());

        // If the active element is not nested within a blockquote, then this plugin's logic doesn't apply.
        if (!uppermostBlockquote) {
          return;
        }

        // Prevent the browser's default 'Enter' key behavior (e.g., inserting a new paragraph).
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation(); // Stop event propagation to prevent other editor behaviors.

        // Collect all closing HTML tags from the active element up to the blockquote.
        const collectedClosingHtml = this.gatherClosingTags(activeDomElement, uppermostBlockquote);

        // Collect all opening HTML tags (with attributes) from the active element up to the blockquote.
        // These are gathered in reverse order to ensure correct nesting when re-inserted.
        const collectedOpeningHtml = this.gatherOpeningTags(activeDomElement, uppermostBlockquote);

        // Create a unique, temporary string marker to precisely identify the split point in the content.
        const contentSplitMarker = `__SPLIT_POINT_${Date.now()}_${Math.random().toString(36).substring(2).toUpperCase()}__`;
        this.insertText(contentSplitMarker); // Insert the marker into the editor's content.

        this.sync(); // Synchronize the editor's internal state with the DOM after insertion.

        const editorContentString = this.get(); // Fetch the entire content as a string.
        const contentSections = editorContentString.split(contentSplitMarker);

        // Crucial validation: ensure the content was successfully split into two parts.
        if (contentSections.length !== 2) {
          console.warn('Blockquote Splitter: Delimiter was not found or caused an unexpected split. Reverting.');
          // Attempt to clean up the marker if the split failed.
          this.set(editorContentString.replace(contentSplitMarker, ''));
          return;
        }

        // Define the HTML fragment to bridge the split blockquotes, including a temporary caret anchor.
        const bridgeHtmlFragment = `</blockquote><span id="tempEditorCaretAnchor" data-redactor-placeholder></span><blockquote>`;

        // Assemble the final, re-arranged content string.
        const finalRestructuredContent =
          `${contentSections[0]}${collectedClosingHtml}${bridgeHtmlFragment}${collectedOpeningHtml}${contentSections[1]}`;

        this.set(finalRestructuredContent); // Update the editor's content with the new structure.

        // Locate the temporary anchor element for precise caret positioning.
        const caretPositionNode = this.$editor.find('#tempEditorCaretAnchor');

        // Attempt to place the caret at the start of the newly created blockquote.
        if (caretPositionNode.length) {
          // Remove the temporary ID and placeholder attribute for clean HTML.
          caretPositionNode.removeAttr('id').removeAttr('data-redactor-placeholder');
          // Move the caret to the beginning of the next blockquote element.
          const newBlockquoteElement = caretPositionNode.next('blockquote');
          if (newBlockquoteElement.length) {
            this.setCaret(newBlockquoteElement[0], 0); // Place caret at the start of the new blockquote.
          } else {
            // Fallback: place caret at the start of the placeholder itself if no next blockquote found.
            this.setCaret(caretPositionNode[0], 0);
          }
        } else {
          console.warn('Blockquote Splitter: Caret anchor element not found. Caret positioning may be imprecise.');
          // As a last resort, place the caret at the end of the entire content.
          this.setCaret(this.get(), 'end');
        }

        this.sync(); // Perform a final synchronization to ensure all changes are reflected in the editor.
      };
    },

    /**
     * Traverses upwards from a starting DOM node to find the highest blockquote ancestor,
     * ensuring it remains within a specified root boundary.
     * @param {HTMLElement} initialNode - The starting point for the upward traversal.
     * @param {HTMLElement} rootBoundary - The upper limit (exclusive) of the search.
     * @returns {HTMLElement|null} The uppermost blockquote element found, or null if none.
     */
    locateTopmostBlockquote: function(initialNode, rootBoundary) {
      let currentParent = initialNode;
      let topBlockquoteCandidate = null;

      // Iterate upwards through parent nodes until the root boundary is reached or no more parents exist.
      while (currentParent && currentParent !== rootBoundary) {
        // If the current node is a blockquote, record it. The loop continues to find a higher one.
        if (currentParent.nodeName.toLowerCase() === 'blockquote') {
          topBlockquoteCandidate = currentParent;
        }
        currentParent = currentParent.parentNode;
      }
      return topBlockquoteCandidate;
    },

    /**
     * Gathers a sequence of closing HTML tags for elements encountered when traversing
     * from a child element up to a specified parent boundary.
     * @param {HTMLElement} childDomElement - The starting child element.
     * @param {HTMLElement} parentLimitElement - The parent element marking the upper bound (exclusive).
     * @returns {string} A concatenated string of closing HTML tags (e.g., "</span></p></div>").
     */
    gatherClosingTags: function(childDomElement, parentLimitElement) {
      let currentElementInPath = childDomElement;
      const closingTagFragments = []; // Using an array for efficient string concatenation.

      // Traverse upwards, collecting closing tags for each element.
      while (currentElementInPath && currentElementInPath !== parentLimitElement) {
        closingTagFragments.push(produceClosingTagMarkup(currentElementInPath));
        currentElementInPath = currentElementInPath.parentNode;
      }
      return closingTagFragments.join(''); // Combine all collected tags into a single string.
    },

    /**
     * Gathers a sequence of opening HTML tags (including their attributes) for elements
     * traversed from a child element up to a specified parent boundary. The tags are
     * ordered correctly for re-insertion (outermost first, innermost last).
     * @param {HTMLElement} childDomElement - The starting child element.
     * @param {HTMLElement} parentLimitElement - The parent element marking the upper bound (exclusive).
     * @returns {string} A concatenated string of opening HTML tags (e.g., "<div><p><span>").
     */
    gatherOpeningTags: function(childDomElement, parentLimitElement) {
      let currentElementInPath = childDomElement;
      const openingTagFragments = []; // Using an array to build the sequence.

      // Traverse upwards, collecting opening tags and unshifting them to maintain correct order.
      while (currentElementInPath && currentElementInPath !== parentLimitElement) {
        // Add the opening tag to the front of the array to ensure proper nesting order.
        openingTagFragments.unshift(produceOpeningTagWithAllAttributes(currentElementInPath));
        currentElementInPath = currentElementInPath.parentNode;
      }
      return openingTagFragments.join(''); // Combine all collected tags into a single string.
    }
  };
})();