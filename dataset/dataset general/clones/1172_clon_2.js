(function () {
  "use strict"; // Enforce stricter parsing and error handling.

  // Regular expressions for identifying structural elements.
  const mainTitlePattern = /^H(\d)$/;
  const actionItemRegex = /^(.+)\.todo$/;
  const labelPattern = /@([\w]+)/;

  /**
   * Initializes content collapsing for a collection of elements.
   * @param {HTMLElement[]|NodeListOf<HTMLElement>} itemsToProcess - Elements to make collapsible, or fetches them if null.
   */
  function collapseContent(itemsToProcess) {
    // If no specific items are provided, find all elements with the 'collapsible' class.
    itemsToProcess = itemsToProcess || document.getElementsByClassName('collapsible');

    if (itemsToProcess.length) {
      // Iterate through a list of elements.
      for (let idx = 0; idx < itemsToProcess.length; idx++) {
        processCollapse(itemsToProcess.item(idx));
      }
    } else if (itemsToProcess.tagName) {
      // Handle a single element if it has a tagName property.
      processCollapse(itemsToProcess);
    }
  }
  window.collapseContent = collapseContent; // Expose the function globally.

  /**
   * Sets up an individual element for collapsing behavior.
   * @param {HTMLElement} currentElement - The element to configure.
   */
  function processCollapse(currentElement) {
    currentElement.classList.add('collapsible'); // Mark element as collapsible.
    currentElement.addEventListener('click', function handleInteraction(eventObj) {
      let result; // For regex match results.

      let ancestorElement = eventObj.target;
      // Traverse up the DOM to find the main collapsible parent.
      while (!ancestorElement.parentElement.classList.contains('collapsible')) {
        ancestorElement = ancestorElement.parentElement;
      }

      // Logic for handling interactive labels.
      if (eventObj.target.classList.contains('collapsible-label')) {
        const labelStr = eventObj.target.getAttribute('data-label');
        if (!currentElement.classList.contains('label-filter-' + labelStr)) {
          // Apply a filter based on the clicked label.
          const labelType = 'collapsible-labeled-' + labelStr;
          const labeledItems = currentElement.getElementsByClassName('collapsible-labeled');
          let potentialItem;
          for (let idx = 0; idx < labeledItems.length; idx++) {
            potentialItem = labeledItems.item(idx);
            if (potentialItem.classList.contains(labelType)) {
              potentialItem.classList.add('active-label');
            } else {
              potentialItem.classList.remove('active-label');
            }
          }
          currentElement.classList.add('label-filter');
          currentElement.classList.add('label-filter-' + labelStr);
        } else {
          // Remove the filter if it's already active.
          currentElement.classList.remove('label-filter');
          currentElement.classList.remove('label-filter-' + labelStr);
        }
      }
      // Logic for handling collapsible sections (e.g., H1, H2).
      else if (result = mainTitlePattern.exec(ancestorElement.nodeName)) {
        eventObj.preventDefault(); // Prevent default link/button behavior.
        toggleSectionVisibility(ancestorElement);
      }
    });

    let nodePtr = currentElement.firstElementChild; // Start with the first child.
    let result = null;
    let labelsFound = null;
    // Iterate through sibling elements to process them.
    while (nodePtr) {
      // Check for headlines that might contain action items.
      if (mainTitlePattern.exec(nodePtr.nodeName) && (result = actionItemRegex.exec(nodePtr.textContent))) {
        manageActionItem(nodePtr, result[1]);
      }

      labelsFound = []; // Initialize a new list for detected labels.
      findLabels(nodePtr, labelsFound); // Populate the list with labels.
      if (labelsFound.length) {
        // Propagate labels up to parent section headers.
        traverseUpwardsForSections(nodePtr, function labelParentSections(sectionHeader) {
          labelsFound.forEach(applyLabelToElement.bind(sectionHeader));
        });
      }

      nodePtr = nodePtr.nextElementSibling; // Move to the next sibling.
    }

    // Find items that should be collapsed by default.
    const hiddenByDefault = currentElement.getElementsByClassName('collapsible-hidden');
    for (let idx = 0; idx < hiddenByDefault.length; idx++) {
      if (mainTitlePattern.exec(hiddenByDefault.item(idx).nodeName)) {
        toggleSectionVisibility(hiddenByDefault.item(idx));
      }
    }
  }

  /**
   * Recursively finds and collects labels within an element's content.
   * @param {HTMLElement} currentElement - The element to search within.
   * @param {string[]} labelsFound - Array to accumulate found labels.
   */
  function findLabels(currentElement, labelsFound) {
    labelsFound = labelsFound || []; // Ensure labelsFound is an array.
    const appendedLabels = []; // Temporary storage for new labels found in children.

    let textNode = currentElement.firstChild, nextNode;
    while (textNode) {
      nextNode = textNode.nextSibling;
      if (textNode.nodeName === '#text') {
        extractLabelsFromText(textNode, labelsFound); // Process text nodes directly.
      } else {
        const childLabels = labelsFound.slice(); // Copy labels for child recursion.
        findLabels(textNode, childLabels);
        // If child processing found new labels, add them to appendedLabels.
        if (childLabels.length > labelsFound.length) {
          appendedLabels.push(...childLabels.slice(labelsFound.length));
        }
      }
      textNode = nextNode; // Move to the next node.
    }

    // Add all newly found labels to the main list.
    appendedLabels.forEach(function appendLabel(label) {
      labelsFound.push(label);
    });

    // Apply collected labels to the current element.
    if (labelsFound.length) {
      labelsFound.forEach(applyLabelToElement.bind(currentElement));
    } else {
      currentElement.classList.add('no-label'); // Mark elements without any labels.
    }
  }

  /**
   * Processes a text node to find and extract labels, converting them into interactive spans.
   * @param {Text} textNode - The text node to parse.
   * @param {string[]} labelsFound - The list to add new labels to.
   */
  function extractLabelsFromText(textNode, labelsFound) {
    let result, labelStr;
    let contentString = textNode.textContent; // Get the full text content.
    while (result = labelPattern.exec(contentString)) {
      const labelName = result[1].toLowerCase();
      // Update the text node's content, truncating before the label.
      textNode.textContent = result.index ? contentString.substring(0, result.index) : '';

      labelsFound.push(labelName); // Add the found label to the list.
      const labelSpan = document.createElement('span');
      labelSpan.textContent = result[0];
      labelSpan.classList.add('collapsible-label');
      labelSpan.setAttribute('data-label', labelName);

      // Insert the new label span into the DOM.
      textNode.parentElement.insertBefore(labelSpan, textNode.nextSibling);
      // Update content string to process text after the current label.
      contentString = contentString.substring(result.index + result[0].length);

      if (contentString.length) {
        // If there's remaining text, insert it after the label span.
        labelSpan.insertAdjacentText('afterend', contentString);
        textNode = labelSpan.nextSibling; // Continue processing from the new text node.
      } else {
        textNode = null; // No more text to process in this node.
      }
    }
  }

  /**
   * Applies specific label classes to an element.
   * @param {string} label - The label string to apply.
   */
  function applyLabelToElement(label) {
    this.classList.add('collapsible-labeled');
    this.classList.add('collapsible-labeled-' + label);
  }

  /**
   * Traverses up the preceding sibling elements to find higher-level section headers.
   * @param {HTMLElement} currentElement - The starting element.
   * @param {function(HTMLElement): void} callbackFn - Function to call for each found section header.
   */
  function traverseUpwardsForSections(currentElement, callbackFn) {
    let result = mainTitlePattern.exec(currentElement.nodeName);
    let potentialMatch;
    while (currentElement && (currentElement = currentElement.previousElementSibling)) {
      if (potentialMatch = mainTitlePattern.exec(currentElement.nodeName)) {
        // Call callback if a higher-level section header is found, or if it's the first one.
        if (!result || potentialMatch[1] < result[1]) {
          callbackFn(currentElement);
          result = potentialMatch; // Update the reference header level.
        }
      }
    }
  }

  /**
   * Traverses sibling elements following a given element, stopping at a higher-level section.
   * @param {HTMLElement} startElement - The element to start traversing from.
   * @param {function(HTMLElement): HTMLElement} [callbackFn] - Optional function to process each sibling.
   * @returns {HTMLElement|null} The element that caused the traversal to stop, or null if end of siblings reached.
   */
  function traverseSiblings(startElement, callbackFn) {
    const result = mainTitlePattern.exec(startElement.nodeName);
    let nodePtr = startElement.nextElementSibling;
    while (nodePtr) {
      const neighborMatch = mainTitlePattern.exec(nodePtr.nodeName);
      // If a section header at the same or higher level is encountered, stop.
      if (neighborMatch && neighborMatch[1] <= result[1]) {
        return nodePtr;
      }
      if (callbackFn) nodePtr = callbackFn(nodePtr); // Process the current sibling.
      if (nodePtr) { // Ensure nodePtr is still valid after callback.
        nodePtr = nodePtr.nextElementSibling;
      } else {
        break; // Callback might have removed or replaced the element, making nextElementSibling invalid.
      }
    }
    return null; // Reached end of siblings without hitting a higher-level header.
  }

  /**
   * Toggles the collapsed state of a section header and its associated content.
   * @param {HTMLElement} sectionHeader - The headline element to toggle.
   */
  function toggleSectionVisibility(sectionHeader) {
    sectionHeader.classList.toggle('collapsed'); // Add or remove 'collapsed' class.
    const isFolded = sectionHeader.classList.contains('collapsed'); // Check new state.
    let neighborMatch;

    if (!isFolded) {
      // If uncollapsed, remove the ellipsis indicator.
      if (sectionHeader.lastElementChild && sectionHeader.lastElementChild.classList.contains('collapsible-indicator')) {
        sectionHeader.removeChild(sectionHeader.lastElementChild);
      }
    }

    // Iterate through siblings to hide/show content.
    traverseSiblings(sectionHeader, function toggleVisibility(nodePtr) {
      if (isFolded) {
        nodePtr.classList.add('concealed-by-collapse'); // Hide element.
      } else {
        nodePtr.classList.remove('concealed-by-collapse'); // Show element.
        // If a nested section was also collapsed, recursively uncollapse its content.
        if (nodePtr.classList.contains('collapsed')) {
          nodePtr = traverseSiblings(nodePtr); // Skip over its hidden content.
          nodePtr = nodePtr ? nodePtr.previousElementSibling : null; // Adjust pointer for next iteration.
        }
      }
      return nodePtr; // Return the (potentially updated) element for the next iteration.
    });

    if (isFolded) {
      // If collapsed, add an ellipsis indicator.
      const dotIndicator = document.createElement('div');
      dotIndicator.textContent = '…';
      dotIndicator.classList.add('collapsible-indicator');
      sectionHeader.appendChild(dotIndicator);
    }
  }

  /**
   * Modifies a section header to reflect it's an action item, and processes an associated list.
   * @param {HTMLElement} sectionHeaderNode - The header element.
   * @param {string} itemTitle - The main title text for the action item.
   */
  function manageActionItem(sectionHeaderNode, itemTitle) {
    // Clear existing child nodes of the header.
    while (sectionHeaderNode.childNodes.length) {
      sectionHeaderNode.removeChild(sectionHeaderNode.childNodes.item(0));
    }
    sectionHeaderNode.appendChild(document.createTextNode(itemTitle)); // Add new title text.
    const suffixSpan = document.createElement('span');
    suffixSpan.classList.add('suffix-text'); // Apply a decorator class.
    suffixSpan.appendChild(document.createTextNode('.todo')); // Add '.todo' text.
    sectionHeaderNode.appendChild(suffixSpan);

    const itemList = sectionHeaderNode.nextElementSibling;
    // If the next sibling is an unordered list, process it as an action item list.
    if (itemList && itemList.nodeName === 'UL') {
      processActionItemList(itemList);
    }
  }

  /**
   * Processes an unordered list as an action item list, marking completed items.
   * @param {HTMLUListElement} itemList - The unordered list element.
   */
  function processActionItemList(itemList) {
    itemList.classList.add('action-item'); // Mark the list as an action item list.
    const donePattern = /@done$/m; // Regex to find completed markers.
    const listItems = itemList.getElementsByTagName('li');
    let idx, listItem;
    for (idx = 0; idx < listItems.length; idx++) {
      listItem = listItems.item(idx);
      // Check if the first child's text content ends with '@done'.
      if (listItem.childNodes.length > 0 && donePattern.exec(listItem.childNodes.item(0).textContent)) {
        listItem.classList.add('completed'); // Mark the list item as completed.
      }
    }
  }

})(); // Immediately-invoked function expression (IIFE) to encapsulate scope.