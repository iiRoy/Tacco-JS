jQuery(function($) {

  // Determines if the current browser environment supports the hashchange event natively.
  // This check helps in handling URL fragment updates gracefully across different browsers.
  const browserSupportsHashUpdates = 'onhashchange' in window;

  // Centralized configuration for CSS class names used throughout the application.
  // This enhances maintainability and simplifies renaming UI-related classes.
  const uiClassNames = {
    glossaryList: 'glossary-navigation',
    contentPane: 'code-display-area',
    sidebarContainer: 'sidebar-panel',
    focusState: 'has-focus',
    selectedItem: 'is-active-selection',
    highlightedItem: 'is-highlighted-syntax',
    sidebarHidden: 'panel-collapsed',
    hideButton: 'sidebar-collapse-btn',
    showButton: 'sidebar-expand-btn',
  };

  // Dataset containing definitions for various syntax categories.
  // Each object maps an internal identifier to a human-readable display string.
  // The 'url' property from the original has been removed as it was unused.
  const syntaxDefinitionsMap = [
    { categoryId: 'comment', labelText: 'Comment Block' },
    { categoryId: 'statement', labelText: 'Code Statement' },
    { categoryId: 'rule-set', labelText: 'CSS Rule Set' },
    { categoryId: 'at-rule', labelText: 'At-Rule Directive' },
    { categoryId: 'media-query', labelText: 'Media Query Rule' },
    { categoryId: 'media-query-list', labelText: 'Media Query List' },
    { categoryId: 'media-type', labelText: 'Media Type' },
    { categoryId: 'expression', labelText: 'Expression' },
    { categoryId: 'media-feature', labelText: 'Media Feature' },
    { categoryId: 'block', labelText: 'Code Block' },
    { categoryId: 'declaration-block', labelText: 'Declaration Block' },
    { categoryId: 'selector', labelText: 'CSS Selector' },
    { categoryId: 'simple-selector', labelText: 'Simple Selector' },
    { categoryId: 'type-selector', labelText: 'Type Selector' },
    { categoryId: 'universal-selector', labelText: 'Universal Selector' },
    { categoryId: 'id-selector', labelText: 'ID Selector' },
    { categoryId: 'class-selector', labelText: 'Class Selector' },
    { categoryId: 'attribute-selector', labelText: 'Attribute Selector' },
    { categoryId: 'pseudo-class', labelText: 'Pseudo-Class' },
    { categoryId: 'pseudo-element', labelText: 'Pseudo-Element' },
    { categoryId: 'combinator', labelText: 'Combinator' },
    { categoryId: 'descendant-combinator', labelText: 'Descendant Combinator' },
    { categoryId: 'child-combinator', labelText: 'Child Combinator' },
    { categoryId: 'adjacent-sibling-combinator', labelText: 'Adjacent Sibling' },
    { categoryId: 'general-sibling-combinator', labelText: 'General Sibling' },
    { categoryId: 'declaration', labelText: 'CSS Declaration' },
    { categoryId: 'property', labelText: 'CSS Property' },
    { categoryId: 'value', labelText: 'CSS Value' },
    { categoryId: 'function', labelText: 'Function Call' },
    { categoryId: 'keyword', labelText: 'Keyword' },
    { categoryId: 'string', labelText: 'String Literal' },
    { categoryId: 'url', labelText: 'URL Value' },
    { categoryId: 'number', labelText: 'Numeric Value' },
    { categoryId: 'percentage', labelText: 'Percentage Value' },
    { categoryId: 'length', labelText: 'Length Unit' },
    { categoryId: 'unit', labelText: 'Unit Identifier' },
    { categoryId: 'color', labelText: 'Color Value' },
    { categoryId: 'vendor-prefix', labelText: 'Vendor Prefix' },
  ];

  /**
   * Dynamically constructs and appends list items to the sidebar's glossary navigation.
   * Each item represents a syntax category and links to its corresponding hash.
   * @param {Array<Object>} definitions - An array of category objects, each needing 'categoryId' and 'labelText'.
   */
  function buildGlossaryNavigation(definitions) {
    // A guard clause to ensure valid input for processing.
    if (!Array.isArray(definitions) || definitions.length === 0) {
      console.warn('Skipping glossary build: No valid definitions provided.');
      return;
    }

    // Use Array.prototype.map for a functional approach to create HTML fragments.
    const navItemFragments = definitions.map(defEntry => {
      const categoryId = defEntry.categoryId;
      const displayLabel = defEntry.labelText;
      // Template literals provide a clean way to generate HTML strings.
      return `<li class="${categoryId}"><a href="#${categoryId}">${displayLabel}</a></li>`;
    });

    // Append all generated list items to the designated glossary container.
    $(`.${uiClassNames.glossaryList}`).append(navItemFragments.join(''));
    console.info(`Sidebar glossary populated with ${navItemFragments.length} entries.`);
  }

  /**
   * Generates a combined CSS selector string that targets all elements corresponding
   * to the defined syntax categories for interaction and highlighting.
   * @param {Array<Object>} categoryData - The array of syntax category definitions.
   * @returns {string} A composite CSS selector (e.g., ".comment, .statement, ...").
   */
  function compileInteractiveElementSelector(categoryData) {
    if (!Array.isArray(categoryData) || categoryData.length === 0) {
      console.error('Failed to compile interactive selector: Category data is empty.');
      return '';
    }

    // Extract all category IDs and prepend a dot to each to form a class selector.
    const individualSelectors = categoryData.map(item => `.${item.categoryId}`);
    // Join them with a comma to create a single, efficient selector string.
    return individualSelectors.join(', ');
  }

  /**
   * Extracts a list of significant CSS classes (representing syntax categories) from a given DOM element,
   * filtering out any classes related to UI state (like focus, highlight, selection).
   * @param {HTMLElement} domElement - The HTML element to inspect.
   * @returns {Array<string>} An array of cleaned-up class names.
   */
  function extractSyntaxClasses(domElement) {
    // Basic validation for the input element.
    if (!domElement || !domElement.className) {
      return [];
    }

    // Use a regular expression to remove multiple state-related classes in one go.
    // The `\b` word boundary ensures that only full class names are matched.
    const classAttrCleaned = domElement.className
      .replace(new RegExp(`\\b(${Object.values(uiClassNames).join('|')}|hover|hilite|selected)\\b`, 'g'), '')
      .trim();

    // Split the remaining string by spaces and filter out any empty strings.
    return classAttrCleaned.split(' ').filter(Boolean);
  }

  /**
   * Applies a visual highlight class to all elements in both the code display and the
   * sidebar navigation that match the provided syntax category class names.
   * @param {Array<string>} classIdentifiers - An array of class names (syntax category IDs) to highlight.
   */
  function applyHighlighting(classIdentifiers) {
    // First, remove all existing highlights to ensure only the new selection is visible.
    $(`.${uiClassNames.highlightedItem}`).removeClass(uiClassNames.highlightedItem);

    if (!Array.isArray(classIdentifiers) || classIdentifiers.length === 0) {
      console.debug('Highlighting cleared: No specific classes provided for highlighting.');
      return;
    }

    // Construct specific selectors for elements within the code display area.
    // This ensures highlights are scoped correctly.
    const codeAreaTargets = classIdentifiers.map(id => `.${uiClassNames.contentPane} .${id}`).join(', ');

    // Construct specific selectors for elements within the glossary navigation.
    const glossaryNavTargets = classIdentifiers.map(id => `.${uiClassNames.glossaryList} .${id}`).join(', ');

    // Apply the highlight class to all matched elements.
    $(codeAreaTargets).addClass(uiClassNames.highlightedItem);
    $(glossaryNavTargets).addClass(uiClassNames.highlightedItem);

    console.debug(`Elements highlighted for: ${classIdentifiers.join(', ')}`);
  }

  /**
   * Synchronizes the page's visual highlighting with the current URL hash fragment.
   * This function is crucial for initial page load and handling browser navigation.
   */
  function updateHighlightsFromUrlHash() {
    const currentUrlHash = window.location.hash;
    let hashCategories = [];

    if (currentUrlHash) {
      // Remove the leading '#' and split the hash by '+' to get individual category IDs.
      // A guard ensures we only process non-empty hash fragments.
      const cleanedHash = currentUrlHash.substring(1);
      if (cleanedHash) {
        hashCategories = cleanedHash.split('+');
      }
    }

    // Apply highlighting based on the extracted categories, or clear all if none are found.
    applyHighlighting(hashCategories);
  }

  // --- Initial Application Setup ---

  // 1. Populate the sidebar navigation using our defined syntax categories.
  buildGlossaryNavigation(syntaxDefinitionsMap);

  // 2. Generate a comprehensive selector string for all elements that can be interacted with.
  const interactiveElementsSelector = compileInteractiveElementSelector(syntaxDefinitionsMap);

  // 3. Make all interactive elements keyboard-focusable for improved accessibility.
  $(interactiveElementsSelector).attr('tabindex', '0');

  // 4. Perform an initial synchronization of highlights based on the URL fragment on page load.
  updateHighlightsFromUrlHash();

  // --- Event Handling ---

  // Attach a listener for the 'hashchange' event on the window.
  // This ensures that changes to the URL hash (e.g., via back/forward buttons or direct hash modification)
  // are reflected in the UI's highlighting.
  $(window).on('hashchange', function() {
    updateHighlightsFromUrlHash();
    // A legacy check (originally for non-supporting browsers) is kept for illustrative purposes
    // but relies on modern browser behavior where 'onhashchange' is universally supported.
    if (!browserSupportsHashUpdates) {
      console.warn('Hashchange event detected; browser might not natively support it (legacy path).');
    }
  });

  // Delegate 'focus' and 'click' events for all interactive syntax elements.
  // Event delegation is more efficient as it attaches one listener to the document
  // instead of many to individual elements.
  $(document).on('focus click', interactiveElementsSelector, function(interactionEvent) {
    const currentTargetElement = $(this);
    const identifiedSyntaxClasses = extractSyntaxClasses(this); // 'this' refers to the DOM element that triggered the event.

    // Prevent default actions for clicks on non-anchor elements and stop event propagation
    // to avoid bubbling up to parent elements which might have their own handlers.
    if (interactionEvent.type === 'click' && !currentTargetElement.is('a')) {
      interactionEvent.preventDefault();
      interactionEvent.stopPropagation();
    } else if (interactionEvent.type === 'focus') {
      interactionEvent.stopPropagation();
    }


    // Manage focus state for parent containers (code area or sidebar).
    currentTargetElement.closest(`.${uiClassNames.contentPane}, .${uiClassNames.sidebarContainer}`)
      .addClass(uiClassNames.focusState)
      .siblings()
      .removeClass(uiClassNames.focusState);

    // Update selection: clear previous selections and mark the current element.
    $(`.${uiClassNames.selectedItem}`).removeClass(uiClassNames.selectedItem);
    currentTargetElement.addClass(uiClassNames.selectedItem);

    // Update the URL hash with the identified syntax classes.
    // If no classes are found, the hash is cleared.
    if (identifiedSyntaxClasses.length > 0) {
      window.location.hash = '#' + identifiedSyntaxClasses.join('+');
    } else {
      window.location.hash = ''; // Ensure hash is cleared if no relevant classes.
      console.warn('Selected element has no identifiable syntax classes to form a hash.');
    }

    // Manually trigger the hashchange event to immediately update highlights based on the new hash.
    // This ensures visual consistency even if the hash didn't technically "change" in some edge cases.
    $(window).trigger('hashchange');
  });


  // --- Custom Keyboard Navigation for Sidebar Glossary ---
  // This replaces the external 'keymaster.js' dependency with native jQuery event handling for Type III changes.
  $(document).on('keydown', function(keyboardEvent) {
    const activeDomElement = $(document.activeElement);
    const isInGlossaryNav = activeDomElement.closest(`.${uiClassNames.glossaryList}`).length > 0;

    // Only proceed if the currently focused element is within our glossary navigation.
    if (isInGlossaryNav) {
      let targetElementForFocus;

      if (keyboardEvent.key === 'ArrowUp') {
        keyboardEvent.preventDefault(); // Prevent default browser scrolling behavior.
        // Attempt to find the previous anchor element directly.
        targetElementForFocus = activeDomElement.closest('li').prev('li').find('a');
      } else if (keyboardEvent.key === 'ArrowDown') {
        keyboardEvent.preventDefault(); // Prevent default browser scrolling behavior.
        // Attempt to find the next anchor element directly.
        targetElementForFocus = activeDomElement.closest('li').next('li').find('a');
      }

      // If a valid next/previous element is found, focus it and trigger its click/focus handler.
      if (targetElementForFocus && targetElementForFocus.length > 0) {
        targetElementForFocus.focus();
        targetElementForFocus.trigger('focus'); // Manually trigger focus event for consistent behavior.
      }
    }
  });


  // --- Sidebar Visibility Control ---

  /**
   * Toggles the visibility state of the sidebar panel.
   * @param {boolean} shouldHide - True to hide the sidebar, false to show it.
   */
  function updateSidebarVisibility(shouldHide) {
    if (shouldHide) {
      $('body').addClass(uiClassNames.sidebarHidden);
      console.log('Sidebar state: Hidden.');
    } else {
      $('body').removeClass(uiClassNames.sidebarHidden);
      console.log('Sidebar state: Visible.');
    }
  }

  // Event listener for the "hide sidebar" button.
  $(`.${uiClassNames.hideButton}`).on('click touchstart', function(interactionEvent) {
    interactionEvent.preventDefault(); // Prevent default button behavior.
    updateSidebarVisibility(true);
  });

  // Event listener for the "show sidebar" button.
  $(`.${uiClassNames.showButton}`).on('click touchstart', function(interactionEvent) {
    interactionEvent.preventDefault(); // Prevent default button behavior.
    updateSidebarVisibility(false);
  });

});