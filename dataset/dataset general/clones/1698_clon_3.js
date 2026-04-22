const contentEnhancer = { // Core module for document content processing.

  /**
   * Internal utility for safe element retrieval.
   * @param {string} elemId - The ID of the element to find.
   * @returns {HTMLElement|null} The found element or null.
   */
  _getDomElement: function(elemId) {
    const targetElement = document.getElementById(elemId);
    if (!targetElement) {
      console.warn(`ContentEnhancer: Element with ID '${elemId}' not found. Operation skipped.`);
    }
    return targetElement;
  },

  /**
   * Generates and injects a dynamic Table of Contents (TOC) into a designated container.
   * This function scans the document for heading elements and constructs an interactive navigation tree.
   * @param {object} [options] - Configuration options for TOC generation.
   * @param {number} [options.maxHeadingDepth=4] - The maximum heading level (e.g., 1 for H1, 2 for H1, H2) to include in the TOC.
   * @param {string} [options.tocContainerId='toc'] - The ID of the HTML element where the TOC will be rendered.
   * @param {string} [options.contentRootId='content'] - The ID of the HTML element containing the main document content to scan.
   * @param {string} [options.ignoreClass='loose-heading'] - A class name on headings to ignore for TOC generation.
   * @param {string} [options.iconClass='nav-icon-right'] - CSS class for the navigation icon.
   */
  buildNavigationTree: function (options = {}) {
    const config = {
      maxHeadingDepth: options.maxHeadingDepth || 4,
      tocContainerId: options.tocContainerId || 'toc',
      contentRootId: options.contentRootId || 'content',
      ignoreClass: options.ignoreClass || 'loose-heading',
      iconClass: options.iconClass || 'nav-icon-right',
      // Further options could be added here, like custom ID prefix.
    };

    const navigationContainer = this._getDomElement(config.tocContainerId);
    if (!navigationContainer) return;

    const mainContentArea = this._getDomElement(config.contentRootId);
    if (!mainContentArea) {
      console.error(`ContentEnhancer: Main content root '${config.contentRootId}' not found for TOC generation.`);
      return;
    }

    // --- Helper for extracting text from a DOM node, including children ---
    const extractVisibleText = (domNode) => {
      let collectedText = "";
      for (let child of domNode.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) { // Raw text node
          collectedText += child.data;
        } else if (child.nodeType === Node.ELEMENT_NODE && child.firstChild) { // Element with children
          collectedText += extractVisibleText(child); // Recurse
        }
      }
      return collectedText.trim();
    };

    // --- Data structure for a single navigation item ---
    class NavigationItem {
      constructor(targetElement, displayLabel, hierarchyLevel) {
        this.targetElement = targetElement;
        this.displayLabel = displayLabel;
        this.hierarchyLevel = hierarchyLevel;
      }
    }

    // --- Helper to find all relevant headings in the content area ---
    const discoverContentHeadings = (rootNode, maxLevel) => {
      const discoveredItems = [];
      const headingRegex = new RegExp(`h([1-${maxLevel}])`, 'i'); // Case-insensitive heading match

      // Recursive traversal function
      const traverseNodes = (currentNode) => {
        if (!currentNode) return;

        for (let childNode of currentNode.children) { // Use .children for direct element children
          const headingMatch = headingRegex.exec(childNode.tagName);

          // Check if it's a heading and not marked to be ignored
          if (headingMatch && !childNode.classList.contains(config.ignoreClass)) {
            const level = parseInt(headingMatch[1], 10);
            discoveredItems.push(new NavigationItem(childNode, extractVisibleText(childNode), level - 1));
          }
          traverseNodes(childNode); // Continue deeper into the DOM
        }
      };
      traverseNodes(rootNode);
      return discoveredItems;
    };

    // --- Clear existing navigation entries from the container ---
    // Efficiently remove all direct children that are list items
    Array.from(navigationContainer.children)
      .filter(child => child.tagName.toLowerCase() === 'li')
      .forEach(child => child.remove());

    // --- Rebuild the navigation tree ---
    const contentOutline = discoverContentHeadings(mainContentArea, config.maxHeadingDepth);
    let idCounter = 0; // For generating unique IDs if missing

    for (const outlineEntry of contentOutline) {
      const targetElement = outlineEntry.targetElement;

      // Ensure the target heading has a unique ID for linking
      if (!targetElement.id) {
        let parentSection = targetElement.closest('section'); // Find nearest parent section
        if (parentSection && parentSection.id) {
          targetElement.id = parentSection.id; // Use section ID if available
        } else {
          // Generate a fallback unique ID
          targetElement.id = `nav_anchor_${idCounter++}`;
        }
      }

      // Create list item for the TOC
      const listItemElement = document.createElement("li");
      listItemElement.classList.add(`level-${outlineEntry.hierarchyLevel}`); // Add level class for styling

      const linkElement = document.createElement("a");
      linkElement.href = `#${targetElement.id}`;
      linkElement.setAttribute('aria-label', `Navigate to ${outlineEntry.displayLabel}`);

      const iconElement = document.createElement("i");
      iconElement.className = config.iconClass; // Apply configured icon class
      linkElement.appendChild(iconElement);

      linkElement.textContent += outlineEntry.displayLabel; // Append text after icon
      listItemElement.appendChild(linkElement);
      navigationContainer.appendChild(listItemElement);
    }

    // If no entries, hide the navigation container
    if (contentOutline.length === 0) {
      navigationContainer.style.display = 'none';
      // Alternatively: navigationContainer.remove();
    } else {
      navigationContainer.style.display = ''; // Ensure it's visible if there are entries
    }
    console.log(`ContentEnhancer: Table of Contents built with ${contentOutline.length} entries.`);
  },


  /**
   * Processes and renders document footnotes into a dedicated section.
   * This function extracts footnote content from inline spans and creates a list of numbered notes.
   * @param {object} [options] - Configuration options for footnote processing.
   * @param {string} [options.notesContainerId='footnotes'] - The ID of the HTML element where footnotes will be rendered.
   * @param {string} [options.contentRootId='content'] - The ID of the HTML element containing the main document content to scan.
   * @param {string} [options.footnoteClass='footnote-marker'] - Class name for inline footnote references.
   * @param {string} [options.refClass='footnote-reference'] - Class name for inline footnote references that link to existing notes.
   * @param {string} [options.noteWrapperClass='document-note'] - Class name for the generated footnote div.
   */
  processCitations: function (options = {}) {
    const config = {
      notesContainerId: options.notesContainerId || 'footnotes',
      contentRootId: options.contentRootId || 'content',
      footnoteClass: options.footnoteClass || 'footnote-marker',
      refClass: options.refClass || 'footnote-reference',
      noteWrapperClass: options.noteWrapperClass || 'document-note',
      // Add more options for link text, titles, etc.
    };

    const citationContainer = this._getDomElement(config.notesContainerId);
    if (!citationContainer) return;

    const articleBody = this._getDomElement(config.contentRootId);
    if (!articleBody) {
      console.error(`ContentEnhancer: Main content root '${config.contentRootId}' not found for citation processing.`);
      return;
    }

    // --- Clear existing footnote entries from the container ---
    Array.from(citationContainer.children)
      .filter(child => child.classList.contains(config.noteWrapperClass))
      .forEach(child => child.remove());

    // --- Rebuild footnote entries ---
    const referenceSpans = articleBody.getElementsByTagName("span");
    const citationMap = {}; // Maps original element IDs to their footnote number
    let noteCounter = 0;

    // Process new footnotes first
    for (const currentSpan of Array.from(referenceSpans)) { // Convert HTMLCollection to Array for robust iteration
      if (currentSpan.classList.contains(config.footnoteClass)) {
        noteCounter++;
        let rawNoteContent = currentSpan.getAttribute("data-note");

        // If data-note is missing, try to extract from innerHTML
        if (!rawNoteContent) {
          const match = currentSpan.innerHTML.match(/\s*\[([\s\S]*)]\s*/);
          rawNoteContent = match ? match[1] : `[Footnote content missing for note ${noteCounter}]`;
          currentSpan.setAttribute("data-note", rawNoteContent); // Store for future reloads
        }

        // Update the inline reference in the main content
        const inlineRefId = `ref_to_note_${noteCounter}`;
        const targetNoteId = `note_detail_${noteCounter}`;
        currentSpan.innerHTML = `[<a id='${inlineRefId}' href='#${targetNoteId}' title='Jump to note details' class='${config.footnoteClass}-link'>${noteCounter}</a>]`;

        // Append the actual footnote content to the footnotes section
        citationContainer.insertAdjacentHTML('beforeend', `
          <div class='${config.noteWrapperClass}' id='${targetNoteId}' aria-label='Footnote ${noteCounter}'>
            <a href='#${inlineRefId}' title='Back to reference' class='${config.footnoteClass}-back-link'>${noteCounter}</a>. ${rawNoteContent}
          </div>
        `);

        // Map original ID to the new footnote number if an ID exists
        if (currentSpan.id) {
          citationMap[`#${currentSpan.id}`] = noteCounter;
        }
      }
    }

    // If no footnotes were found, hide the container
    if (noteCounter === 0) {
      citationContainer.style.display = 'none';
      // Alternatively: citationContainer.remove();
    } else {
      citationContainer.style.display = ''; // Ensure it's visible
      // Process footnoterefs (links to existing notes)
      for (const currentSpan of Array.from(referenceSpans)) {
        if (currentSpan.classList.contains(config.refClass)) {
          const anchorElement = currentSpan.querySelector("a");
          if (anchorElement) {
            let linkReference = anchorElement.getAttribute("href");
            // Extract hash part, accounting for full URLs in some browsers
            const hashMatch = linkReference.match(/#(.+)$/);
            linkReference = hashMatch ? `#${hashMatch[1]}` : linkReference;

            const associatedNoteNumber = citationMap[linkReference];
            if (associatedNoteNumber) {
              currentSpan.innerHTML = `[<a href='#note_detail_${associatedNoteNumber}' title='View footnote' class='${config.footnoteClass}-link'>${associatedNoteNumber}</a>]`;
            } else {
              console.warn(`ContentEnhancer: Footnote reference '${linkReference}' found but no corresponding footnote entry.`);
            }
          }
        }
      }
    }
    console.log(`ContentEnhancer: Processed ${noteCounter} footnotes.`);
  },

  /**
   * Initializes the content enhancement process, setting up initial runs and a refresh mechanism.
   * @param {object} [config] - Configuration object for both TOC and Footnotes.
   * @param {number} [config.refreshIntervalMs=750] - Interval in milliseconds for periodic content checks/updates.
   * @param {number} [config.maxHeadingDepth] - Passed to buildNavigationTree.
   * @param {string} [config.tocContainerId] - Passed to buildNavigationTree.
   * @param {string} [config.notesContainerId] - Passed to processCitations.
   */
  setupDocumentEnhancements: function(config = {}) {
    const refreshIntervalMs = config.refreshIntervalMs || 750;
    let autoRefreshTimerId;

    // A wrapper to run all content processing functions
    const executeEnhancements = () => {
      this.processCitations(config);
      this.buildNavigationTree(config); // Pass the entire config object
      console.log("ContentEnhancer: Document enhancements refreshed.");
    };

    // Function to run enhancements once and then clear the timer
    const finalExecuteAndDeregister = () => {
      if (autoRefreshTimerId) {
        clearInterval(autoRefreshTimerId);
        autoRefreshTimerId = null; // Clear the ID
      }
      executeEnhancements();
    };

    // Start a polling timer for initial content readiness (useful for SPA or dynamic content)
    autoRefreshTimerId = setInterval(executeEnhancements, refreshIntervalMs);
    console.log(`ContentEnhancer: Started periodic content refresh (every ${refreshIntervalMs}ms).`);

    // Use DOMContentLoaded for the primary, final execution
    if (document.readyState === 'loading') { // Document is still loading
      document.addEventListener("DOMContentLoaded", finalExecuteAndDeregister, { once: true });
      console.log("ContentEnhancer: Registered DOMContentLoaded listener for final refresh.");
    } else { // Document is already loaded
      console.log("ContentEnhancer: Document already loaded, executing enhancements immediately.");
      finalExecuteAndDeregister();
    }

    // Fallback for older browsers or if DOMContentLoaded somehow fails
    window.addEventListener('load', () => {
      if (autoRefreshTimerId) { // Only if DOMContentLoaded didn't already clear it
        console.warn("ContentEnhancer: 'load' event triggered after DOMContentLoaded. Performing final refresh.");
        finalExecuteAndDeregister();
      }
    }, { once: true });
  }

};