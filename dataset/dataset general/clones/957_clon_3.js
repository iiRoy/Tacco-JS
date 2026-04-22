DataTreeRenderer = (function() {

  let renderConfig = {}; // Configuration object for the rendering process
  let elementIdSequencer = 0; // Global counter to ensure unique IDs for nested elements

  /**
   * Recursively processes and renders a JSON node into an HTML list structure.
   * This function handles objects, arrays, and primitive values.
   * @param {string} currentKey - The key/property name for the current value.
   * @param {*} currentNodeValue - The actual value of the current JSON node.
   * @param {string} parentContainerId - The ID of the parent `<ul>` element to append to.
   * @returns {void}
   */
  const renderNodeRecursive = function(currentKey, currentNodeValue, parentContainerId) {
    // Increment the global ID sequencer for unique element identifiers
    elementIdSequencer++;
    // Sanitize the key to be safe for use in HTML IDs, replacing non-alphanumeric with underscores
    const safeNodeIdentifier = `${String(currentKey).replace(/[^a-zA-Z0-9_-]/g, '_')}_${elementIdSequencer}`;

    // Select the parent list element where the current node will be appended
    const $targetParentList = $(`#${renderConfig.rootListId} #${parentContainerId}`);

    // --- Guard Clause: Check if the parent element exists ---
    if ($targetParentList.length === 0) {
      // If the parent list doesn't exist, log a warning and stop processing this branch
      console.warn(`DataTreeRenderer: Parent list with ID '${parentContainerId}' not found. Skipping rendering for key '${currentKey}'.`);
      return;
    }

    // --- Handle different data types ---

    if (currentNodeValue === null) {
      // Render null values with a specific class
      $targetParentList.append(`<li><i>${currentKey}:</i> <span class="data-null">null</span></li>`);
    } else if (typeof currentNodeValue !== 'object') {
      // Handle primitive values (string, number, boolean)
      let valueDisplayClass = 'data-primitive';
      switch (typeof currentNodeValue) {
        case 'string':
          valueDisplayClass = 'data-string';
          break;
        case 'number':
          valueDisplayClass = 'data-number';
          break;
        case 'boolean':
          valueDisplayClass = 'data-boolean';
          break;
      }
      $targetParentList.append(`<li><i>${currentKey}:</i> <span class="${valueDisplayClass}">${String(currentNodeValue)}</span></li>`);

    } else if (Array.isArray(currentNodeValue)) {
      // Handle array values
      if (currentNodeValue.length === 0) {
        // Render empty arrays concisely
        $targetParentList.append(`<li><i>${currentKey}:</i> <span class="data-empty-array">[]</span></li>`);
      } else {
        // For non-empty arrays, create a new sub-list
        const sublistHtml = `<ul id="${safeNodeIdentifier}" class="data-array-list"></ul>`;
        $targetParentList.append(`<li><b>${currentKey}:</b> <span class="data-array-opener">[</span> ${sublistHtml}</li>`);
        // Recursively render each item in the array
        currentNodeValue.forEach((arrayItem, index) => {
          renderNodeRecursive(String(index), arrayItem, safeNodeIdentifier);
        });
      }

    } else { // It must be a plain object
      // Handle object values
      if (Object.keys(currentNodeValue).length === 0) {
        // Render empty objects concisely
        $targetParentList.append(`<li><i>${currentKey}:</i> <span class="data-empty-object">{}</span></li>`);
      } else {
        // For non-empty objects, create a new sub-list
        const sublistHtml = `<ul id="${safeNodeIdentifier}" class="data-object-list"></ul>`;
        $targetParentList.append(`<li><b>${currentKey}:</b> <span class="data-object-opener">{</span> ${sublistHtml}</li>`);
        // Recursively render each key-value pair in the object
        for (const [objKey, objValue] of Object.entries(currentNodeValue)) {
          renderNodeRecursive(objKey, objValue, safeNodeIdentifier);
        }
      }
    }
  };

  /**
   * Inserts closing braces/brackets for objects and arrays after their respective child lists.
   * @returns {void}
   */
  const insertStructuralClosures = function() {
    // Find all opening structural elements (spans with '{' or '[')
    $(`#${renderConfig.rootListId} span.data-object-opener, #${renderConfig.rootListId} span.data-array-opener`).each(function() {
      const $currentSpan = $(this);
      let closingMarkup = '';
      if ($currentSpan.hasClass('data-object-opener')) {
        closingMarkup = '<span class="data-object-closer">}</span>';
      } else if ($currentSpan.hasClass('data-array-opener')) {
        closingMarkup = '<span class="data-array-closer">]</span>';
      }
      // Insert the closing brace/bracket right after the immediate child <ul>
      $currentSpan.parent().find('ul:first').after(closingMarkup);
    });
  };

  /**
   * Sets up interactive collapse/expand toggles for nested lists.
   * Uses event delegation for efficiency.
   * @param {string} containerElementId - The ID of the main container element (rootListId).
   * @returns {void}
   */
  const setupInteractiveToggles = function(containerElementId) {
    const $container = $(`#${containerElementId}`);

    // Add toggle buttons to parent `<li>` elements that contain `<ul>` children
    $container.find('li').has('ul').each(function() {
      // Find the opening brace/bracket span and insert the toggle after it
      $(this).find('span.data-object-opener, span.data-array-opener').eq(0).after('<span class="data-toggle data-fake-link"> - </span>');
    });

    // Initialize all nested lists to be collapsed by default, and set toggle text to '+'
    // Select only direct child <ul>s of <li>s that have a toggle
    $container.find('li:has(span.data-toggle) > ul').slideUp(0); // Start collapsed
    $container.find('span.data-toggle').text(' + '); // Update toggle text

    // Attach click event listener using event delegation to the main container
    $container.on('click', '.data-toggle', function() {
      const $toggleButton = $(this);
      const $targetList = $toggleButton.parent().find('ul:first'); // The <ul> immediately following the toggle's parent li

      if ($targetList.is(":visible")) {
        // If visible, hide it and change toggle text to '+'
        $targetList.slideUp(150, function() {
          $toggleButton.text(' + ');
        });
      } else {
        // If hidden, show it and change toggle text to '-'
        $targetList.slideDown(150, function() {
          $toggleButton.text(' - ');
        });
      }
    });
  };

  /**
   * Main entry point for rendering the JSON data as an HTML tree.
   * @param {object|Array} inputData - The JSON object or array to be rendered.
   * @param {object} customOptions - Optional configuration settings.
   * @returns {void}
   */
  const beginRendering = function(inputData, customOptions) {
    // Reset element ID sequencer for each new rendering operation
    elementIdSequencer = 0;

    // Define default settings for the renderer
    const defaultSettings = {
      'targetContainer': 'body', // Selector for the DOM element where the tree will be appended
      'rootListId': `json-tree-root-${Date.now()}`, // Unique ID for the main unordered list
      'enableCollapsible': false // Whether to add collapse/expand functionality
    };

    // Merge default settings with any custom options provided
    renderConfig = $.extend(true, {}, defaultSettings, customOptions); // Deep merge

    // --- Input Validation / Guard Clauses ---
    if (!inputData || typeof inputData !== 'object' || Object.keys(inputData).length === 0 && !Array.isArray(inputData)) {
      console.error('DataTreeRenderer: Invalid or empty input data provided. Must be a non-empty object or array.');
      return;
    }

    const $targetDomElement = $(renderConfig.targetContainer);
    if ($targetDomElement.length === 0) {
      console.error(`DataTreeRenderer: Target container "${renderConfig.targetContainer}" not found in the DOM.`);
      return;
    }
    // --- End Input Validation ---

    // Create the main unordered list element for the JSON tree
    const $mainOutputList = $(`<ul id="${renderConfig.rootListId}" class="json-data-tree"></ul>`);

    // Append the main list to the specified target container
    $targetDomElement.empty().append($mainOutputList); // Clear existing content and append

    // Process the top-level input data
    if (Array.isArray(inputData)) {
      // If the root is an array, iterate its elements
      if (inputData.length === 0) {
        $mainOutputList.append(`<li><span class="data-empty-array">[]</span></li>`);
      } else {
        $mainOutputList.append(`<li><span class="data-array-opener">[</span><ul id="root-array-wrapper-${elementIdSequencer}" class="data-array-list"></ul></li>`);
        inputData.forEach((item, index) => {
          renderNodeRecursive(String(index), item, `root-array-wrapper-${elementIdSequencer}`);
        });
      }
    } else { // Assume it's an object
      // If the root is an object, iterate its key-value pairs
      if (Object.keys(inputData).length === 0) {
        $mainOutputList.append(`<li><span class="data-empty-object">{}</span></li>`);
      } else {
        // For the root object, we don't put a key, just the opening brace and its contents
        $mainOutputList.append(`<li><span class="data-object-opener">{</span><ul id="root-object-wrapper-${elementIdSequencer}" class="data-object-list"></ul></li>`);
        for (const [rootPropKey, rootPropValue] of Object.entries(inputData)) {
          renderNodeRecursive(rootPropKey, rootPropValue, `root-object-wrapper-${elementIdSequencer}`);
        }
      }
    }

    // After all nodes are rendered, add the closing braces/brackets
    insertStructuralClosures();

    // If collapsible functionality is enabled, set up the toggles
    if (renderConfig.enableCollapsible) {
      setupInteractiveToggles(renderConfig.rootListId);
    }
  };

  // Public API for the module
  return {
    /**
     * Renders a given JSON object or array as an interactive HTML tree.
     * @param {object|Array} jsonData - The data to format.
     * @param {object} renderingOptions - Configuration options.
     */
    renderDataTree: function(jsonData, renderingOptions) {
      beginRendering(jsonData, renderingOptions);
    }
  };

})();