(function(jq){
  // Ensure jQuery (or a compatible library) is available.
  // This is a guard clause for robust plugin initialization.
  if (!jq || !jq.fn) {
    console.warn("TableOfContentsGenerator requires jQuery. Plugin not initialized.");
    return;
  }

  /**
   * jQuery plugin to dynamically create a table of contents from document headings.
   *
   * @param {object} userOptions - Custom settings to override defaults.
   * @returns {jq} The jQuery object for chaining.
   */
  jq.fn.tableOfContentsGenerator = function(userOptions) {
    // Default configuration for the table of contents generation.
    // These base settings define how the TOC behaves and appears.
    const baseSettings = {
      disableBackToTopLinks: false, // Flag to prevent 'back to top' indicators.
      titleMarkup: '<em>Table of Contents</em>', // HTML for the TOC title.
      minimumHeadingCount: 3, // Minimum number of headings required to generate a TOC.
      headingSelector: 'h1, h2, h3, h4, h5, h6', // CSS selector for headings to include.
      listElementType: 'ol', // Type of list to use (ordered 'ol' or unordered 'ul').
      displayAnimation: 'show', // Animation style for showing the TOC (e.g., 'show', 'slideDown', 'fadeIn', 'none').
      animationSpeed: 'slow', // Speed of the display animation (e.g., 'slow', 'fast', 0).
      clickableHeadingClass: 'toc-link-heading', // CSS class for headings that are part of the TOC.
      backToTopIconClass: 'fas fa-arrow-alt-circle-up toc-scroll-up' // Class for the back-to-top icon.
    };

    // Merge default settings with user-provided options.
    // This creates the active configuration for the current TOC instance.
    const effectiveConfiguration = jq.extend(true, {}, baseSettings, userOptions);

    /**
     * Safely encodes a string for use as a URI fragment identifier.
     * This function ensures that special characters are properly escaped
     * to prevent issues with browser navigation and ID matching.
     *
     * @param {string} rawString - The string to encode.
     * @returns {string} The URI-encoded string.
     */
    const safeFragmentIdentifierEncoder = (rawString) => {
      // encodeURIComponent handles most characters.
      // The .replace part specifically targets characters that are valid in URIs
      // but might cause issues or be interpreted differently in fragment identifiers
      // when used directly without percent-encoding (e.g., parentheses, exclamation).
      return encodeURIComponent(rawString).replace(/[!'()*]/g, function(charVal) {
        return '%' + charVal.charCodeAt(0).toString(16);
      });
    };

    /**
     * Generates a URL-friendly slug from a given text string.
     * This is used as a fallback for headings that lack an explicit ID.
     *
     * @param {string} textContent - The text to slugify.
     * @returns {string} The generated slug.
     */
    const generateSlug = (textContent) => {
      return textContent.toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '') // Remove non-word chars
                        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
                        .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
    };

    // Identify all potential heading elements based on the configured selector.
    // Filter them to ensure they have a usable ID, generating one if necessary.
    const candidateHeadings = jq(effectiveConfiguration.headingSelector).filter(function() {
      let currentElement = jq(this);
      // Check if the current heading already has an ID.
      if (this.id) {
        return true; // Already has an ID, good to go.
      }

      // If no ID, check if a previous sibling has a 'name' attribute which can serve as an ID source.
      // This is a common pattern for backward compatibility with older HTML anchors.
      const priorElementIdCandidate = currentElement.prev().attr("name");
      if (priorElementIdCandidate) {
        this.id = priorElementIdCandidate.replace(/\./g, "-"); // Normalize the ID.
        return true;
      }

      // If still no ID, generate one from the heading's text content.
      // This ensures every heading included in the TOC has a unique identifier.
      const generatedId = generateSlug(currentElement.text());
      if (generatedId) {
        // Ensure generated ID is unique to avoid conflicts.
        let uniqueId = generatedId;
        let counter = 1;
        while (jq('#' + uniqueId).length) {
          uniqueId = `${generatedId}-${counter++}`;
        }
        this.id = uniqueId;
        return true;
      }

      // If no ID could be determined or generated, exclude this heading.
      return false;
    });

    // The target element where the TOC will be inserted.
    const outputTargetElement = jq(this);

    // Early exit conditions: If there are no suitable headings,
    // or fewer than the minimum required, or no target container,
    // then there's no TOC to generate.
    if (!candidateHeadings.length ||
        candidateHeadings.length < effectiveConfiguration.minimumHeadingCount ||
        !outputTargetElement.length) {
      console.info("TOC generation skipped: Insufficient headings or no target element.", {
        headingCount: candidateHeadings.length,
        minRequired: effectiveConfiguration.minimumHeadingCount,
        targetExists: outputTargetElement.length > 0
      });
      return this; // Return for chaining.
    }

    // If animation speed is explicitly set to 0, disable the animation effect.
    if (0 === effectiveConfiguration.animationSpeed) {
      effectiveConfiguration.displayAnimation = 'none';
    }

    // Defines different strategies for displaying the generated TOC.
    // Each strategy handles how the content is revealed in the target container.
    const displayStrategies = {
      show: function(contentMarkup) { outputTargetElement.hide().html(contentMarkup).show(effectiveConfiguration.animationSpeed); },
      slideDown: function(contentMarkup) { outputTargetElement.hide().html(contentMarkup).slideDown(effectiveConfiguration.animationSpeed); },
      fadeIn: function(contentMarkup) { outputTargetElement.hide().html(contentMarkup).fadeIn(effectiveConfiguration.animationSpeed); },
      none: function(contentMarkup) { outputTargetElement.html(contentMarkup); }
    };

    /**
     * Determines the numerical depth (level) of a heading element.
     * E.g., H1 -> 1, H2 -> 2, etc.
     *
     * @param {HTMLElement} elementNode - The heading DOM element.
     * @returns {number} The heading's depth level.
     */
    const fetchHeadingDepth = (elementNode) => {
      return parseInt(elementNode.nodeName.replace("H", ""), 10);
    };

    // Calculate the deepest (numerically lowest) heading level present.
    // This helps in determining where 'back to top' links might be relevant.
    const deepestHierarchyLevel = Math.min(...candidateHeadings.map((idx, elementNode) => fetchHeadingDepth(elementNode)).get());

    // Markup for the 'back to top' indicator icon.
    const scrollToTopIndicator = `<span class="${effectiveConfiguration.backToTopIconClass}" title="Scroll to Top"></span>`;

    // Initialize variables for TOC generation.
    // `currentDepth` tracks the current nesting level of the list.
    // `generatedTocContent` accumulates the HTML string for the TOC.
    let currentDepth = fetchHeadingDepth(candidateHeadings[0]);
    let processedDepth;
    let generatedTocContent = effectiveConfiguration.titleMarkup + ` <${effectiveConfiguration.listElementType} class="toc-root-list">`;
    let tocItemCount = 0; // Counter for generated TOC items.

    // Attach a click handler to each heading to enable direct navigation.
    // This uses event delegation on the headings themselves.
    candidateHeadings.on('click', function() {
      if (!effectiveConfiguration.disableBackToTopLinks) {
        // Setting window.location.hash directly can cause a jump.
        // For smoother UX, consider handling this with a scroll animation
        // if not relying on browser's default hash behavior.
        window.location.hash = this.id;
      }
    })
    .addClass(effectiveConfiguration.clickableHeadingClass) // Add a class for styling
    .each(function(idx, currentHeadingNode) {
      processedDepth = fetchHeadingDepth(currentHeadingNode);
      tocItemCount++;

      // Add 'back to top' indicator to top-level headings if enabled.
      if (!effectiveConfiguration.disableBackToTopLinks && processedDepth === deepestHierarchyLevel) {
        jq(currentHeadingNode).addClass('toc-top-level-heading').after(scrollToTopIndicator);
      }

      // Logic to build the nested list structure based on heading levels.
      // This determines when to open or close list elements and sub-lists.
      if (processedDepth === currentDepth) {
        // Same level: just add a new list item.
        generatedTocContent += `<li class="toc-item toc-item-level-${processedDepth}"><a href="#${safeFragmentIdentifierEncoder(currentHeadingNode.id)}">${currentHeadingNode.innerHTML}</a>`;
      } else if (processedDepth < currentDepth) {
        // Higher level (e.g., H3 after H4): close previous sub-lists and then add item.
        for(let k = processedDepth; k < currentDepth; k++) {
          generatedTocContent += `</li></${effectiveConfiguration.listElementType}>`;
        }
        generatedTocContent += `<li class="toc-item toc-item-level-${processedDepth}"><a href="#${safeFragmentIdentifierEncoder(currentHeadingNode.id)}">${currentHeadingNode.innerHTML}</a>`;
      } else if (processedDepth > currentDepth) {
        // Lower level (e.g., H4 after H3): open new sub-lists and then add item.
        for(let k = processedDepth; k > currentDepth; k--) {
          generatedTocContent += `<${effectiveConfiguration.listElementType} class="toc-sub-list toc-sub-list-level-${k}"><li class="toc-item toc-item-level-${k}">`;
        }
        generatedTocContent += `<a href="#${safeFragmentIdentifierEncoder(currentHeadingNode.id)}">${currentHeadingNode.innerHTML}</a>`;
      }
      currentDepth = processedDepth; // Update the current level for the next iteration.
    });

    // Close any remaining open list tags after iterating through all headings.
    // This ensures the HTML structure is valid.
    for(let k = 0; k < currentDepth; k++) {
        generatedTocContent += `</li></${effectiveConfiguration.listElementType}>`;
    }

    // Attach event handler for the 'back to top' links, using event delegation.
    if (!effectiveConfiguration.disableBackToTopLinks) {
      jq(document).on('click', `.${effectiveConfiguration.backToTopIconClass.split(' ')[0]}`, function() {
        // Smoothly scroll the page to the top.
        jq('html, body').animate({ scrollTop: 0 }, effectiveConfiguration.animationSpeed, function() {
          // Clear the hash in the URL after scrolling, if desired.
          window.location.hash = '';
        });
      });
    }

    // Finally, render the generated TOC markup using the selected display strategy.
    displayStrategies[effectiveConfiguration.displayAnimation](generatedTocContent);

    return this; // Allow jQuery method chaining.
  };
})(jQuery); // Pass jQuery object into the closure.