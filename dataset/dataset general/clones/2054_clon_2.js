jQuery(document).ready(function() {
  // Determine if the browser supports the 'onhashchange' event for efficient URL fragment tracking.
  var fragmentChangeSupport = 'onhashchange' in window;

  // Define the core data set for the terminology, including internal keys, display names, and placeholder links.
  var termCollection = [
    {
      'termKey': 'comment-node',
      'displayTitle': 'Comment Node',
      'resourceLink': ''
    },
    {
      'termKey': 'instruction',
      'displayTitle': 'Instruction',
      'resourceLink': ''
    },
    {
      'termKey': 'group-of-rules',
      'displayTitle': 'Group of Rules',
      'resourceLink': ''
    },
    {
      'termKey': 'directive',
      'displayTitle': 'Directive',
      'resourceLink': ''
    },
    {
      'termKey': 'media-condition',
      'displayTitle': 'Media Condition',
      'resourceLink': ''
    },
    {
      'termKey': 'media-condition-list',
      'displayTitle': 'Media Condition List',
      'resourceLink': ''
    },

    {
      'termKey': 'media-device-type',
      'displayTitle': 'Media Device Type',
      'resourceLink': ''
    },
    {
      'termKey': 'expression-syntax',
      'displayTitle': 'Expression Syntax',
      'resourceLink': ''
    },
    {
      'termKey': 'media-characteristic',
      'displayTitle': 'Media Characteristic',
      'resourceLink': ''
    },
    {
      'termKey': 'code-segment',
      'displayTitle': 'Code Segment',
      'resourceLink': ''
    },
    {
      'termKey': 'declaration-segment',
      'displayTitle': 'Declaration Segment',
      'resourceLink': ''
    },
    {
      'termKey': 'selection-pattern',
      'displayTitle': 'Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'simple-selection-pattern',
      'displayTitle': 'Simple Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'type-selection-pattern',
      'displayTitle': 'Type Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'universal-selection-pattern',
      'displayTitle': 'Universal Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'id-selection-pattern',
      'displayTitle': 'ID Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'class-selection-pattern',
      'displayTitle': 'Class Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'attribute-selection-pattern',
      'displayTitle': 'Attribute Selection Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'pseudo-class-pattern',
      'displayTitle': 'Pseudo-Class Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'pseudo-element-pattern',
      'displayTitle': 'Pseudo-Element Pattern',
      'resourceLink': ''
    },
    {
      'termKey': 'pattern-combinator',
      'displayTitle': 'Pattern Combinator',
      'resourceLink': ''
    },
    {
      'termKey': 'descendant-pattern-combinator',
      'displayTitle': 'Descendant Pattern Combinator',
      'resourceLink': ''
    },
    {
      'termKey': 'child-pattern-combinator',
      'displayTitle': 'Child Pattern Combinator',
      'resourceLink': ''
    },
    {
      'termKey': 'adjacent-sibling-pattern-combinator',
      'displayTitle': 'Adjacent Sibling Pattern Combinator',
      'resourceLink': ''
    },
    {
      'termKey': 'general-sibling-pattern-combinator',
      'displayTitle': 'General Sibling Pattern Combinator',
      'resourceLink': ''
    },
    {
      'termKey': 'style-declaration-item',
      'displayTitle': 'Style Declaration Item',
      'resourceLink': ''
    },
    {
      'termKey': 'style-property',
      'displayTitle': 'Style Property',
      'resourceLink': ''
    },
    {
      'termKey': 'property-attribute',
      'displayTitle': 'Property Attribute',
      'resourceLink': ''
    },
    {
      'termKey': 'css-function-call',
      'displayTitle': 'CSS Function Call',
      'resourceLink': ''
    },
    {
      'termKey': 'css-keyword-value',
      'displayTitle': 'CSS Keyword Value',
      'resourceLink': ''
    },
    /*
     * This entry for 'identifier' is commented out from the initial data set.
     * {
     *   'termKey': 'identifier-token',
     *   'displayTitle': 'Identifier Token',
     *   'resourceLink': ''
     * },
     */
    {
      'termKey': 'string-literal',
      'displayTitle': 'String Literal',
      'resourceLink': ''
    },
    {
      'termKey': 'resource-locator',
      'displayTitle': 'Resource Locator',
      'resourceLink': ''
    },
    {
      'termKey': 'numerical-value',
      'displayTitle': 'Numerical Value',
      'resourceLink': ''
    },
    {
      'termKey': 'percentage-amount',
      'displayTitle': 'Percentage Amount',
      'resourceLink': ''
    },
    {
      'termKey': 'length-unit-value',
      'displayTitle': 'Length Unit Value',
      'resourceLink': ''
    },
    {
      'termKey': 'measurement-unit-type',
      'displayTitle': 'Measurement Unit Type',
      'resourceLink': ''
    },
    {
      'termKey': 'color-representation',
      'displayTitle': 'Color Representation',
      'resourceLink': ''
    },
    {
      'termKey': 'vendor-specific-tag',
      'displayTitle': 'Vendor Specific Tag',
      'resourceLink': ''
    },
  ];

  // Function to build and populate the terminology list in the sidebar.
  // @param {Array<Object>} termsData - The array of terminology objects.
  function populateTermPanel (termsData) {
    var panelElements = []; // Array to store generated list item HTML.
    var itemLabel;            // Variable to hold the display title for an item.
    var itemKey;              // Variable to hold the unique key for an item.

    // Iterate over each term entry to create its corresponding list item.
    $.each(termsData, function (idx, termEntry) {
      itemLabel = termEntry.displayTitle;
      itemKey = termEntry.termKey;
      // Construct the HTML for a list item, including a link to its hash.
      panelElements.push('<li class="'+itemKey+'"><a href="#'+itemKey+'">'+itemLabel+'</a></li>')
    });

    // Append all constructed list items to the designated terminology panel.
    $('.termPanel').append(panelElements.join(''));
  }
  // Initial call to populate the terminology panel upon document readiness.
  populateTermPanel(termCollection);

  /*
   * Generates a combined CSS selector string from all term keys in the provided dataset.
   * This selector can target elements across different parts of the application.
   *
   * @param {Array<Object>} dataset - The collection of term objects.
   * @returns {string} A single string containing all class selectors, e.g., ".key1, .key2".
   */
  function generateUnifiedSelectors (dataset) {
    var mappedKeys = $.map(dataset, function (termEntry) {
      return termEntry.termKey;
    }).join(', .'); // Creates a comma-separated list of class selectors.

    return '.' + mappedKeys;
  }
  // Store the generated selectors for global use in event binding and element targeting.
  var combinedTargetSelectors = generateUnifiedSelectors(termCollection);

  /**
   * Extracts unique class keys (identifiers) from a given DOM element's class attribute.
   * It cleans the class string by removing transient state classes like 'hover', 'highlight', 'selected'.
   *
   * @param {HTMLElement} domElement - The DOM element whose class attribute is to be parsed.
   * @returns {Array<string>} An array of cleaned and extracted class keys.
   */
  function extractClassKeys(domElement) {
    var classAttributeValue = domElement.className;
    var extractedKeys = classAttributeValue.replace('active-hover', '') // Remove hover state
                                           .replace('active-highlight', '') // Remove highlight state
                                           .replace('current-selection', '') // Remove selection state
                                           .replace('  ', ' ') // Normalize spaces
                                           .trim(); // Remove leading/trailing whitespace
    return extractedKeys.split(' '); // Split the cleaned string into an array of individual keys.
  }

  /**
   * Applies a specific highlight style to all elements identified by the given keys.
   * This function targets elements in both the main content area ('.code-display') and the sidebar ('.termPanel').
   *
   * @param {Array<string>} keysToHighlight - An array of class keys (identifiers) to highlight.
   */
  function applyHighlighting(keysToHighlight) {
    // Construct a selector for elements within the main code display.
    var stylePaneTargets = '.code-display .' + keysToHighlight.join('.');
    // Construct a selector for elements within the sidebar terminology panel.
    var termPanelTargets = '.termPanel .' + keysToHighlight.join(', .termPanel .');

    // Remove the 'active-highlight' class from all currently highlighted elements.
    $('.active-highlight').removeClass('active-highlight');
    // Apply the 'active-highlight' class to elements in the code display.
    $(stylePaneTargets).addClass('active-highlight');
    // Apply the 'active-highlight' class to elements in the terminology panel.
    $(termPanelTargets).addClass('active-highlight');
  }

  /**
   * Reads the current URL fragment (hash) and triggers the highlighting of corresponding terms.
   * If a fragment exists, it extracts the term keys and calls `applyHighlighting`.
   */
  function processUrlFragment() {
    var urlFragment = location.hash;
    var fragmentKeys; // Will store the keys extracted from the URL fragment.

    // Check if the URL contains a hash fragment.
    if (urlFragment) {
      fragmentKeys = urlFragment.substring(1).split('+'); // Remove '#' and split by '+'.
    }
    // If keys were successfully extracted, apply the highlighting.
    if (fragmentKeys) {
      applyHighlighting(fragmentKeys);
    }
  }
  // Execute the URL fragment processing once the document is ready to set initial highlights.
  processUrlFragment();

  // Attach an event listener to the window for 'hashchange' events.
  $(window).on('hashchange', function () {
    processUrlFragment(); // Re-process and update highlights whenever the URL fragment changes.
  });

  // Bind 'focus' and 'click' events to all elements matching the generated selectors.
  $(combinedTargetSelectors).on('focus click', function(evtObject) {
    var currentElementKeys = extractClassKeys(this); // Get the keys of the element that triggered the event.

    evtObject.stopPropagation(); // Prevent the event from bubbling up to parent elements.

    // Find the nearest parent content or sidebar area, add 'current-focus', and remove it from siblings.
    $(this).closest('.main-content-area, .side-navigation').addClass('current-focus')
      .siblings().removeClass('current-focus');

    // Remove 'current-selection' from any previously selected elements.
    $('.current-selection').removeClass('current-selection');
    // Add 'current-selection' to the currently interacted element.
    $(this).addClass('current-selection');

    // Update the URL fragment with the keys of the currently selected element.
    location.hash = '#' + currentElementKeys.join('+');

    // If the browser does not natively support 'onhashchange', manually trigger the event.
    if (!fragmentChangeSupport) {
      $(window).trigger('hashchange');
    }
  });

  // Set the 'tabindex' attribute to '0' for all targetable elements, making them keyboard-focusable.
  $(combinedTargetSelectors).attr('tabindex', '0');
  // Example: $('.termPanel .style-property').focus(); // A commented-out example of focusing a specific element.

  // Configure keyboard shortcuts for navigation within the terminology panel.
  key('up', function(evtObject){
    var focusedPanelItem = $('.termPanel :focus');
    if (focusedPanelItem.length > 0) { // Check if any item in the panel is currently focused.
      evtObject.preventDefault(); // Prevent default browser actions (e.g., page scrolling).
      focusedPanelItem.prev().focus(); // Shift focus to the previous sibling item.
    }
  });
  key('down', function(evtObject){
    var focusedPanelItem = $('.termPanel :focus');
    if (focusedPanelItem.length > 0) { // Check if any item in the panel is currently focused.
      evtObject.preventDefault(); // Prevent default browser actions.
      focusedPanelItem.next().focus(); // Shift focus to the next sibling item.
    }
  });

  // Event handlers for sidebar visibility control buttons.
  $('.panelCollapseButton').on('click touchstart', function(evtObject) {
    evtObject.preventDefault(); // Prevent default button action.
    $('body').addClass('panel-hidden'); // Add class to hide the sidebar.
  });
  $('.panelExpandButton').on('click touchstart', function(evtObject) {
    evtObject.preventDefault(); // Prevent default button action.
    $('body').removeClass('panel-hidden'); // Remove class to show the sidebar.
  });

});