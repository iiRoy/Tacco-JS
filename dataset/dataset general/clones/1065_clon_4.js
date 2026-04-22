(function() {

  const standardOptions = {
    limitCharacters: 100,
    continueText: '…',
    collapseText: 'less'
  };

  // Utility to replace sequences of whitespace with a single space.
  function cleanupSpaces(inputString) {
    return inputString.replace(/\s+/g, ' ');
  }

  // Utility to escape HTML entities for text content.
  function escapeHtml(unsafeString) {
    const replacements = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return unsafeString.replace(/[&<>"']/g, (match) => replacements[match]);
  }

  // Locates the deepest block-level element at the end of the content to insert "more" link.
  function locateInsertionPointForMore(currentContainer) {
    let finalChild = currentContainer.lastElementChild;
    if (!finalChild) return currentContainer;

    let styles = window.getComputedStyle(finalChild);
    if (!styles.display || styles.display === 'inline') {
      return currentContainer;
    }
    return locateInsertionPointForMore(finalChild);
  }

  // Locates the last paragraph child or the container itself to insert "less" link.
  function locateInsertionPointForLess(currentContainer) {
    let finalChild = currentContainer.lastElementChild;
    if (finalChild && finalChild.tagName.toLowerCase() === 'p') {
      return finalChild;
    }
    return currentContainer;
  }

  // Recursively processes a DOM node to truncate its textual content.
  // Returns an object containing the processed fragment, actual character count consumed,
  // and whether the last processed segment ended with a space.
  function processNodeHierarchy(originalNode, remainingCount, prevNodeEndedWithSpace = false) {
    if (remainingCount <= 0) {
      return { processedFragment: null, actualCount: 0, endsWithSpace: prevNodeEndedWithSpace };
    }

    if (originalNode.nodeType === Node.TEXT_NODE) {
      let currentString = originalNode.data;
      let cleanedString = cleanupSpaces(currentString);

      // Mimic the original's `trailing_whitespace` logic: if a previous node ended with a space
      // and this node starts with one, remove the leading space of this node.
      if (prevNodeEndedWithSpace && cleanedString.startsWith(' ')) {
        cleanedString = cleanedString.substring(1);
      }

      let segment = cleanedString.substring(0, remainingCount);
      let currentEndsWithSpace = segment.endsWith(' ');
      let encodedSegment = escapeHtml(segment);
      let newTextFragment = document.createTextNode(encodedSegment);
      return { processedFragment: newTextFragment, actualCount: segment.length, endsWithSpace: currentEndsWithSpace };
    }

    if (originalNode.nodeType === Node.ELEMENT_NODE) {
      const copiedElement = originalNode.cloneNode(false); // Clone only the element tag, not its children
      let accumulatedCount = 0;
      let currentEndsWithSpace = prevNodeEndedWithSpace;

      for (const childSource of Array.from(originalNode.childNodes)) {
        if (remainingCount - accumulatedCount <= 0) break; // Stop if character limit reached

        const childResult = processNodeHierarchy(childSource, remainingCount - accumulatedCount, currentEndsWithSpace);
        if (childResult.processedFragment) {
          copiedElement.appendChild(childResult.processedFragment);
        }
        accumulatedCount += childResult.actualCount;
        currentEndsWithSpace = childResult.endsWithSpace;
      }
      return { processedFragment: copiedElement, actualCount: accumulatedCount, endsWithSpace: currentEndsWithSpace };
    }

    // For other node types (e.g., comments, processing instructions), they don't consume characters.
    return { processedFragment: null, actualCount: 0, endsWithSpace: prevNodeEndedWithSpace };
  }

  // Exposes the main truncation function to the global scope.
  // It accepts a CSS selector string, a single DOM Element, or a NodeList/Array of Elements.
  // customSettings can override default 'limitCharacters', 'continueText', 'collapseText'.
  window.performHtmlTruncation = function(inputIdentifier, customSettings) {
    const currentSettings = { ...standardOptions, ...customSettings };

    let targetElements;
    if (typeof inputIdentifier === 'string') {
      targetElements = document.querySelectorAll(inputIdentifier);
    } else if (inputIdentifier instanceof Element) {
      targetElements = [inputIdentifier];
    } else if (inputIdentifier instanceof NodeList || Array.isArray(inputIdentifier)) {
      targetElements = inputIdentifier;
    } else {
      console.error("Invalid input for performHtmlTruncation. Expected CSS selector, Element, or NodeList.");
      return;
    }

    targetElements.forEach(originalContainer => {
      // Calculate total content length, trimmed and squeezed, for initial check.
      const fullTextLength = cleanupSpaces(originalContainer.textContent).trim().length;
      if (fullTextLength <= currentSettings.limitCharacters) return; // Skip if no truncation needed

      // Calculate the actual limit for the content, accounting for the " (…)" part.
      // The "3" accounts for " ()".
      const effectiveCharacterLimit = currentSettings.limitCharacters - (currentSettings.continueText.length + 3);

      const processedContentResult = processNodeHierarchy(originalContainer, effectiveCharacterLimit);
      const truncatedClone = processedContentResult.processedFragment;

      if (!truncatedClone) return; // No content after processing, or error

      originalContainer.style.display = 'none'; // Hide the original content
      originalContainer.parentNode.insertBefore(truncatedClone, originalContainer.nextSibling); // Insert truncated content after original

      // Append 'more' link
      const moreAnchorTarget = locateInsertionPointForMore(truncatedClone);
      const actualMoreLink = document.createElement('a');
      actualMoreLink.href = "#show-more-content";
      actualMoreLink.textContent = ` (${currentSettings.continueText})`; // E.g., "(…)"
      moreAnchorTarget.appendChild(actualMoreLink);
      
      // Append 'less' link
      const lessAnchorTarget = locateInsertionPointForLess(originalContainer);
      const actualLessLink = document.createElement('a');
      actualLessLink.href = "#show less content"; // Match original href
      actualLessLink.textContent = ` (${currentSettings.collapseText})`; // E.g., "(less)"
      lessAnchorTarget.appendChild(actualLessLink);

      // Attach event listeners to toggle visibility
      actualMoreLink.addEventListener('click', (event) => {
        event.preventDefault();
        truncatedClone.style.display = 'none';
        originalContainer.style.display = ''; // Show full content
      });

      actualLessLink.addEventListener('click', (event) => {
        event.preventDefault();
        truncatedClone.style.display = ''; // Show truncated content
        originalContainer.style.display = 'none'; // Hide full content
      });
    });
  };

})();