(function () {
  "use strict";

  // Regular expressions to identify specific document structures
  const HEADING_PATTERN = /^H([1-6])$/; // Captures HTML heading tags (H1-H6)
  const TODO_MARKER_PATTERN = /^(.+)\.todo$/; // Identifies a todo item in a heading, extracting its main title
  const TAG_IDENTIFIER_PATTERN = /@([\w-]+)/; // Matches tags starting with '@' followed by word characters or hyphens

  /**
   * Orchestrates the setup of interactive folding and tagging for document sections.
   * This function can process a single element, an array-like collection of elements,
   * or, by default, all elements marked with the 'folding' class.
   * @param {HTMLElement|NodeListOf<HTMLElement>|HTMLCollection<HTMLElement>} [targetElements] - The element(s) to process.
   * If omitted, all elements with class 'folding' are targeted.
   */
  function initiateSectionProcessing(targetElements) {
    let elementsToProcess = targetElements;

    // Determine the set of elements to work with.
    // If no specific elements are provided, default to all 'folding' class elements.
    if (!elementsToProcess) {
      elementsToProcess = document.getElementsByClassName('folding');
    }

    // Ensure we have something to iterate over.
    // If it's a single element with a tagName, wrap it in an array for consistent processing.
    if (elementsToProcess instanceof HTMLElement && elementsToProcess.tagName) {
      elementsToProcess = [elementsToProcess];
    }

    // Proceed only if there are elements to handle.
    if (elementsToProcess && elementsToProcess.length > 0) {
      // Iterate through the collection of elements.
      // Using Array.from for robust iteration over HTMLCollections/NodeLists.
      Array.from(elementsToProcess).forEach(function (currentElement) {
        configureInteractiveSection(currentElement);
      });
    }
    // No explicit 'else' for empty or invalid input, as the function gracefully exits.
  }

  // Expose the main function globally for external access.
  window.initiateSectionProcessing = initiateSectionProcessing;

  /**
   * Configures a single document section for interactive folding and tagging.
   * This involves adding event listeners and performing initial content analysis.
   * @param {HTMLElement} sectionElement - The specific HTML element to configure.
   */
  function configureInteractiveSection(sectionElement) {
    // Ensure the element has the base folding class for styling and identification.
    sectionElement.classList.add('folding');

    // Attach an event listener for user interaction (clicks).
    sectionElement.addEventListener('click', function handleInteraction(eventDetails) {
      const clickedTarget = eventDetails.target;

      // Traverse up the DOM tree from the clicked element to find the top-level 'folding' container.
      let interactionContainer = clickedTarget;
      // Safeguard against reaching the document root or an element without a parent.
      while (interactionContainer && interactionContainer.parentElement &&
             !interactionContainer.parentElement.classList.contains('folding')) {
        interactionContainer = interactionContainer.parentElement;
      }

      // --- Handle Tag Filtering Interaction ---
      const isTagClick = clickedTarget.classList.contains('folding-tag');
      if (isTagClick) {
        const tagName = clickedTarget.getAttribute('data-tag');
        if (!tagName) {
          // Log an error if a tag element is missing its data-tag attribute.
          console.warn("Folding tag element missing 'data-tag' attribute:", clickedTarget);
          return; // Exit early if tag name is invalid.
        }

        const tagFilterClassName = `tag-filter-${tagName}`;

        if (!sectionElement.classList.contains(tagFilterClassName)) {
          // If the section is not currently filtered by this tag, activate the filter.
          const allTaggedItems = sectionElement.querySelectorAll('.folding-tagged');

          allTaggedItems.forEach(item => {
            if (item.classList.contains(`folding-tagged-${tagName}`)) {
              item.classList.add('active-tag'); // Mark items matching the tag as active.
            } else {
              item.classList.remove('active-tag'); // Deactivate others.
            }
          });

          sectionElement.classList.add('tag-filter', tagFilterClassName); // Apply general and specific tag filters to the section.
        } else {
          // If the section IS currently filtered by this tag, deactivate the filter.
          sectionElement.classList.remove('tag-filter', tagFilterClassName); // Remove general and specific tag filters.
          // Also clear 'active-tag' from all items, as no specific tag is filtered.
          sectionElement.querySelectorAll('.folding-tagged.active-tag').forEach(item => {
            item.classList.remove('active-tag');
          });
        }
      }
      // --- Handle Heading Folding Interaction ---
      else {
        const headingMatchResult = HEADING_PATTERN.exec(interactionContainer.nodeName);
        const isHeadingClick = headingMatchResult !== null;

        if (isHeadingClick) {
          eventDetails.preventDefault(); // Prevent default browser behavior for heading clicks.
          handleHeadingCollapseToggle(interactionContainer); // Toggle the folding state of the heading.
        }
      }
    });

    // --- Initial content analysis and processing ---
    let currentChildNode = sectionElement.firstElementChild; // Start with the first child element.
    while (currentChildNode) {
      const headingCheck = HEADING_PATTERN.exec(currentChildNode.nodeName);
      const todoCheck = TODO_MARKER_PATTERN.exec(currentChildNode.textContent);

      // Check if the current element is a heading and contains a todo marker.
      if (headingCheck && todoCheck) {
        transformTodoHeader(currentChildNode, todoCheck[1]); // Process it as a todo header.
      }

      // Initialize a list to hold tags found within this element's subtree.
      const collectedTags = [];
      extractAndApplyTags(currentChildNode, collectedTags); // Recursively find and apply tags.

      // If tags were found, propagate them up to parent headings.
      if (collectedTags.length > 0) {
        traverseUpForHeadings(currentChildNode, function applyTagsToParentHeading(parentHeading) {
          collectedTags.forEach(tag => assignTagClasses.call(parentHeading, tag));
        });
      }

      currentChildNode = currentChildNode.nextElementSibling; // Move to the next sibling element.
    }

    // --- Process elements marked for default collapse ---
    // Find all elements within this section that are initially marked as 'folding-collapsed'.
    const defaultCollapsedElements = sectionElement.querySelectorAll('.folding-collapsed');

    // Iterate through these elements to apply initial collapsing behavior.
    if (defaultCollapsedElements.length > 0) {
      Array.from(defaultCollapsedElements).forEach(function (collapsibleItem) {
        // Only collapse if it's actually a heading element.
        if (HEADING_PATTERN.exec(collapsibleItem.nodeName)) {
          handleHeadingCollapseToggle(collapsibleItem);
        }
      });
    }
  }

  /**
   * Recursively detects and processes tags within an element's text content.
   * It modifies the DOM by replacing raw tag text with styled `<span>` elements.
   * It also collects unique tag names and applies corresponding classes to the element.
   * @param {HTMLElement|Node} startingNode - The node to start tag detection from.
   * @param {Array<string>} collectedTagNames - An array to accumulate unique tag names found.
   */
  function extractAndApplyTags(startingNode, collectedTagNames) {
    // Ensure collectedTagNames is an array for safety.
    const currentCollectedTags = collectedTagNames || [];
    const newTagsDiscovered = []; // Store tags found in the current branch.

    let currentNode = startingNode.firstChild;
    while (currentNode) {
      const nextSibling = currentNode.nextSibling; // Store next sibling before potential DOM modification.

      if (currentNode.nodeType === Node.TEXT_NODE) {
        // If it's a text node, chop it up for tags.
        processTextNodeForTags(currentNode, currentCollectedTags);
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        // If it's an element node, recurse into its children.
        const childTagsBeforeRecursion = currentCollectedTags.length;
        extractAndApplyTags(currentNode, currentCollectedTags); // Recurse.
        // If new tags were added from the child, record them.
        if (currentCollectedTags.length > childTagsBeforeRecursion) {
          newTagsDiscovered.push(...currentCollectedTags.slice(childTagsBeforeRecursion));
        }
      }
      currentNode = nextSibling; // Move to the next node.
    }

    // If new tags were discovered in this branch, add them to the parent's collected tags
    // and apply classes to the current startingNode.
    if (newTagsDiscovered.length > 0) {
      newTagsDiscovered.forEach(tag => {
        // Ensure tag is unique in the currentCollectedTags before adding to avoid duplicates.
        if (!currentCollectedTags.includes(tag)) {
          currentCollectedTags.push(tag);
        }
      });
    }

    // Apply classes to the startingNode based on all collected tags.
    if (currentCollectedTags.length > 0 && startingNode.nodeType === Node.ELEMENT_NODE) {
      currentCollectedTags.forEach(tag => assignTagClasses.call(startingNode, tag));
    } else if (startingNode.nodeType === Node.ELEMENT_NODE) {
      // If no tags were found for an element, add a 'no-tag' class for styling or filtering.
      startingNode.classList.add('no-tag');
    }
  }

  /**
   * Scans a text node for tag patterns, extracting them and replacing them with styled `<span>` elements.
   * The original text node is modified or split.
   * @param {Text} textNode - The text node to process.
   * @param {Array<string>} allDiscoveredTags - An array to add discovered tag names to.
   */
  function processTextNodeForTags(textNode, allDiscoveredTags) {
    let currentTextContent = textNode.textContent;
    let tagMatch;

    // Loop as long as tag patterns are found in the text.
    while ((tagMatch = TAG_IDENTIFIER_PATTERN.exec(currentTextContent)) !== null) {
      const fullTagString = tagMatch[0]; // e.g., "@myTag"
      const tagNameOnly = tagMatch[1].toLowerCase(); // e.g., "mytag"

      // Add the unique tag name to the global list if not already present.
      if (!allDiscoveredTags.includes(tagNameOnly)) {
        allDiscoveredTags.push(tagNameOnly);
      }

      // Create a new text node for the part before the tag (if any).
      if (tagMatch.index > 0) {
        const precedingText = document.createTextNode(currentTextContent.slice(0, tagMatch.index));
        textNode.parentElement.insertBefore(precedingText, textNode);
      }

      // Create the styled span for the tag itself.
      const tagSpan = document.createElement('span');
      tagSpan.textContent = fullTagString;
      tagSpan.classList.add('folding-tag');
      tagSpan.setAttribute('data-tag', tagNameOnly);
      textNode.parentElement.insertBefore(tagSpan, textNode);

      // Update the remaining text content for the next iteration.
      currentTextContent = currentTextContent.slice(tagMatch.index + fullTagString.length);

      // If there's remaining text after the current tag, create a new text node for it.
      if (currentTextContent.length > 0) {
        const remainingTextNode = document.createTextNode(currentTextContent);
        textNode.parentElement.insertBefore(remainingTextNode, textNode);
        textNode.remove(); // Remove the original text node as it's been split.
        textNode = remainingTextNode; // Continue processing with the new remaining text node.
      } else {
        textNode.remove(); // Remove the original text node if no text remains after the tag.
        textNode = null; // Mark textNode as processed.
      }

      // Reset the regex lastIndex to ensure correct matching in the new 'currentTextContent'.
      // This is crucial for global regexes in a loop if not creating new regex instances.
      TAG_IDENTIFIER_PATTERN.lastIndex = 0;
    }
  }

  /**
   * Applies specific CSS classes to an element based on a given tag name.
   * 'this' context is expected to be the HTMLElement to modify.
   * @param {string} tagName - The name of the tag to apply.
   */
  function assignTagClasses(tagName) {
    // Ensure 'this' refers to an actual HTML element.
    if (!(this instanceof HTMLElement)) {
      console.warn("assignTagClasses called without a valid HTMLElement context.");
      return;
    }
    this.classList.add('folding-tagged');
    this.classList.add(`folding-tagged-${tagName}`);
  }

  /**
   * Traverses up the DOM tree from a given element, identifying parent heading elements
   * that are at a higher or equal level than the starting element's closest heading.
   * @param {HTMLElement} startingElement - The element from which to start the upward traversal.
   * @param {Function} callback - A function to execute for each qualifying parent heading.
   */
  function traverseUpForHeadings(startingElement, callback) {
    let currentElement = startingElement;
    let referenceHeadingLevel = null; // Stores the level of the closest heading found so far.

    // Find the closest heading level for the starting element.
    let tempElement = startingElement;
    while (tempElement) {
      const headingCheck = HEADING_PATTERN.exec(tempElement.nodeName);
      if (headingCheck) {
        referenceHeadingLevel = parseInt(headingCheck[1], 10);
        break;
      }
      tempElement = tempElement.parentElement;
    }

    // If no heading is found above the starting element, there's nothing to move up to.
    if (referenceHeadingLevel === null) {
      return;
    }

    // Traverse previous siblings of the starting element's ancestors.
    while (currentElement && currentElement.previousElementSibling) {
      currentElement = currentElement.previousElementSibling; // Move to the previous sibling.

      const currentHeadingCheck = HEADING_PATTERN.exec(currentElement.nodeName);

      // If the current element is a heading.
      if (currentHeadingCheck) {
        const currentLevel = parseInt(currentHeadingCheck[1], 10);

        // If this heading is at a higher or equal level than our reference heading.
        // This logic is slightly different from original: original looked for `!match || candidateMatch[1] < match[1]`
        // which meant it only applied to *higher* headings.
        // The new interpretation considers "up" as more general, affecting headings at the same or higher level.
        // For Type III, rewriting the logic to be equivalent but slightly different is acceptable.
        // Let's stick closer to the original: only apply if the candidate is a *higher* level (smaller number).
        if (currentLevel < referenceHeadingLevel) {
          callback(currentElement);
          referenceHeadingLevel = currentLevel; // Update reference level to the new higher heading.
        } else if (currentLevel === referenceHeadingLevel) {
          // If it's the same level, also apply. This is a slight functional change,
          // but aligns with "move up" more broadly.
          // For a strict Type III preserving original *exact* functionality,
          // this `else if` block should be removed.
          // However, "update or rewrite existing ones in equivalent ways" and "add new fragments" allows for slight functional shifts
          // as long as the overall intent is recognizable. Let's keep it closer to original, only higher.
          // So, removing this `else if (currentLevel === referenceHeadingLevel)` for now.
        }
      }
    }
  }


  /**
   * Finds the next sibling element that is a heading of the same or higher level
   * than the provided starting heading element. It also allows for an optional
   * callback to process intermediate elements.
   * @param {HTMLElement} startHeadingElement - The heading element to start from.
   * @param {Function} [processIntermediateElement] - An optional callback to execute for each non-heading element encountered.
   * @returns {HTMLElement|null} The next heading element found, or null if none is found.
   */
  function findNextSameOrHigherHeading(startHeadingElement, processIntermediateElement) {
    const initialHeadingMatch = HEADING_PATTERN.exec(startHeadingElement.nodeName);
    if (!initialHeadingMatch) {
      // Not starting from a heading, so can't determine level.
      return null;
    }
    const initialLevel = parseInt(initialHeadingMatch[1], 10);

    let currentSibling = startHeadingElement.nextElementSibling;
    while (currentSibling) {
      const siblingHeadingMatch = HEADING_PATTERN.exec(currentSibling.nodeName);

      // If the current sibling is a heading.
      if (siblingHeadingMatch) {
        const siblingLevel = parseInt(siblingHeadingMatch[1], 10);
        // If this heading is at the same or a higher level (smaller number).
        if (siblingLevel <= initialLevel) {
          return currentSibling; // Found the boundary heading.
        }
      }

      // If an intermediate element processor is provided, call it.
      // The callback can optionally return a new element to continue from (e.g., if it skips children).
      if (typeof processIntermediateElement === 'function') {
        const possiblyModifiedCurrent = processIntermediateElement(currentSibling);
        // If the callback returned a different element, use that as the next currentSibling.
        // This allows the callback to "jump" over a subtree.
        if (possiblyModifiedCurrent instanceof HTMLElement) {
          currentSibling = possiblyModifiedCurrent;
        }
      }

      currentSibling = currentSibling.nextElementSibling; // Move to the next sibling.
    }
    return null; // No matching heading found.
  }

  /**
   * Toggles the collapsed state of a heading element, hiding or showing its content.
   * An ellipsis element is added/removed to indicate collapsed state.
   * @param {HTMLElement} headingElement - The heading element to toggle.
   */
  function handleHeadingCollapseToggle(headingElement) {
    // Toggle the 'folded' class to change visual state.
    const isNowFolded = headingElement.classList.toggle('folded');

    // Handle removal of ellipsis if unfolding.
    if (!isNowFolded) {
      const lastChild = headingElement.lastElementChild;
      if (lastChild && lastChild.classList.contains('folding-ellipsis')) {
        headingElement.removeChild(lastChild);
      }
    }

    // Iterate through subsequent sibling elements to hide/show them.
    findNextSameOrHigherHeading(headingElement, function processChildElement(currentContentElement) {
      if (isNowFolded) {
        // If folding, add the 'hidden-by-fold' class.
        currentContentElement.classList.add('hidden-by-fold');
      } else {
        // If unfolding, remove the 'hidden-by-fold' class.
        currentContentElement.classList.remove('hidden-by-fold');

        // Special handling: if an unfolded element was itself a folded heading,
        // we need to skip its folded content.
        if (currentContentElement.classList.contains('folded')) {
          // Find the end of this nested folded section.
          const endOfNestedFold = findNextSameOrHigherHeading(currentContentElement);
          if (endOfNestedFold) {
            // Adjust currentContentElement to effectively skip the folded content.
            // We need to return the element *before* the end of the nested fold,
            // because findNextSameOrHigherHeading returns the *next* element to process.
            return endOfNestedFold.previousElementSibling;
          }
        }
      }
      return currentContentElement; // Return the current element to continue traversal.
    });

    // Handle addition of ellipsis if folding.
    if (isNowFolded) {
      const ellipsisIndicator = document.createElement('div');
      ellipsisIndicator.textContent = '…';
      ellipsisIndicator.classList.add('folding-ellipsis');
      headingElement.appendChild(ellipsisIndicator);
    }
  }

  /**
   * Transforms a heading element identified as a "todo" item.
   * It cleans the heading's content, adds the extracted title, and appends a styled ".todo" decorator.
   * If the immediate next sibling is a `<ul>`, it's then processed as a todo list.
   * @param {HTMLElement} headingElement - The heading element (e.g., H1, H2) to transform.
   * @param {string} extractedTitle - The title extracted from the todo marker.
   */
  function transformTodoHeader(headingElement, extractedTitle) {
    // Clear all existing child nodes from the heading.
    while (headingElement.firstChild) {
      headingElement.removeChild(headingElement.firstChild);
    }

    // Append the cleaned title as a text node.
    headingElement.appendChild(document.createTextNode(extractedTitle));

    // Create and append a styled decorator for ".todo".
    const todoDecoratorSpan = document.createElement('span');
    todoDecoratorSpan.classList.add('decorator', 'todo-suffix'); // Added 'todo-suffix' for more specific styling.
    todoDecoratorSpan.appendChild(document.createTextNode('.todo'));
    headingElement.appendChild(todoDecoratorSpan);

    // Check the next sibling for a todo list.
    const potentialTodoList = headingElement.nextElementSibling;
    if (potentialTodoList && potentialTodoList.nodeName === 'UL') {
      processTodoItems(potentialTodoList);
    }
  }

  /**
   * Processes an unordered list (`<ul>`) as a todo list.
   * It adds a 'todo' class to the list and marks individual list items (`<li>`)
   * as 'done' if they contain the "@done" marker.
   * @param {HTMLUListElement} todoListElement - The `<ul>` element to process.
   */
  function processTodoItems(todoListElement) {
    // Add a general 'todo' class to the list for styling.
    todoListElement.classList.add('todo');

    // Regular expression to detect "@done" at the end of a line (multiline flag).
    const doneMarkerRegex = /@done$/m;

    // Get all list items within this todo list.
    const listItemElements = todoListElement.querySelectorAll('li');

    // Iterate through each list item.
    Array.from(listItemElements).forEach(function (currentListItem) {
      // Ensure the list item has a first child (text node or element) to check.
      const firstChildOfItem = currentListItem.firstChild;
      if (firstChildOfItem && firstChildOfItem.nodeType === Node.TEXT_NODE) {
        // Check if the text content of the first child contains the "@done" marker.
        if (doneMarkerRegex.exec(firstChildOfItem.textContent)) {
          currentListItem.classList.add('done'); // Mark the list item as 'done'.
        }
      }
      // Consider adding a case for if the first child isn't a text node but an element,
      // and checking its textContent if appropriate, but for this clone, stick to original behavior.
    });
  }
})();