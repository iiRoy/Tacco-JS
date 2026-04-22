var DataPresenter = (function() {
  // Establish a local reference to jQuery to avoid conflicts and enable renaming.
  var jQueryObj = $;

  // The primary function responsible for initiating the data formatting process.
  var beginProcessing = function( inputData, configSettings ) {

    // Define and merge default configuration options with user-provided settings.
    var currentConfig = jQueryObj.extend( {
      'targetElement' : 'body',         // Specifies the DOM element where output will be appended.
      'rootListIdentifier' : 'json_view', // The ID attribute for the main unordered list.
      'enableFolding' : false           // Boolean flag to determine if collapsible sections should be enabled.
    }, configSettings);

    // A counter used to generate unique IDs for dynamically created elements during recursive operations.
    var iterationCounter = 0;

    // This helper function recursively processes objects that contain other objects or arrays.
    processNestedObjects = function(subData, parentListId) {
      // Iterate over each key-value pair within the provided sub-data structure.
      jQueryObj.each(subData, function(itemKeyA, itemValueA) {
        // Determine if the current value is an object type (and not null).
        if (typeof itemValueA === 'object' && itemValueA !== null) {
          // If it's an object, append a list item with an opening brace and a new nested unordered list.
          jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + parentListId).append('<li><span>{</span> <ul id="' + parentListId + '-' + itemKeyA + '"></ul></li>');
          // Now, iterate through the content of this newly found object.
          jQueryObj.each(itemValueA, function(itemKeyB, itemValueB) {
            // Check if this inner value is also an object.
            if (typeof itemValueB === 'object' && itemValueB !== null) {
              // If it is, create a list item for it with an opening brace and another nested list.
              jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + parentListId + '-' + itemKeyA).append('<li>' + itemKeyB + ' <span>{</span> <ul id="'+ itemKeyB + '-' + iterationCounter + '"></ul></li>');
              // Recursively call the traverse function to handle the contents of this deeper object.
              traverseRecursive(itemValueB, itemKeyB, itemKeyB + '-' + iterationCounter);
            }
            else {
              // If the inner value is a simple type (e.g., string, number), append it directly as a list item.
              jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + parentListId + '-' + itemKeyA).append('<li>' + itemKeyB + ': ' + itemValueB + '</li>');
            }

          });
        }
        else {
          // If the current value is a simple type (e.g., in an array of primitives), just append its value.
          jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + parentListId).append('<li>' + itemValueA + '</li>');
        }
      });
    }, // End of processNestedObjects

    // This function provides a general recursive traversal for any object or array.
    traverseRecursive = function(currentValue, currentKey, currentContainerId) {
      // Increment the global counter to ensure unique IDs for generated elements.
      iterationCounter++;
      // Iterate through the properties or elements of the current data structure.
      jQueryObj.each(currentValue, function(childKey, childValue) {
        var childListId = childKey + '-' + iterationCounter; // Construct a unique ID for the potential child list.
        var newContainerMarkup = '<ul id="' + childListId + '"></ul>'; // Prepare the HTML for a new nested list.

        // Check if the child's value is an object type and not null.
        if (childValue !== null && typeof childValue === 'object') {
          if (childValue.length === 0) {
            // If it's an empty array, represent it as '[]'.
            jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + currentContainerId).append('<li><i>' + childKey + ':</i> []</li>');
          }
          else if (childValue.length > 0) {
            // If it's a non-empty array, display an opening bracket and then process its elements recursively.
            jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + currentContainerId).append('<li><b>' + childKey + ':</b> <span>[</span> ' + newContainerMarkup + '</li>');
            processNestedObjects(childValue, childListId);
          }
          else if (childValue.length === undefined) {
            // If it's a plain object (not an array), display an opening brace and recurse.
            jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + currentContainerId).append('<li><b>' + childKey + ':</b> <span>{</span> ' + newContainerMarkup + '</li>');
            traverseRecursive(childValue, childKey, childListId);
          }
        }
        else {
          // If the child's value is a primitive data type, append it as a simple key-value pair.
          jQueryObj('#' + currentConfig.rootListIdentifier + ' #' + currentContainerId).append('<li><i>' + childKey + ':</i> ' + childValue + '</li>');
        }
      });
    }, // End of traverseRecursive

    // This function is responsible for adding the correct closing braces or brackets to the output HTML.
    finalizeStructuralElements = function() {
      // Iterate through all 'span' elements within the main root list.
      jQueryObj('#' + currentConfig.rootListIdentifier + ' span').each(function() {
        var closingDelimiter = '<span>}</span>'; // Default closing delimiter is a brace for objects.
        // If the current span contains an opening bracket, change the delimiter to a closing bracket.
        if (jQueryObj(this).text() === "[") {
          closingDelimiter = '<span>]</span>';
        }
        // Append the determined closing delimiter immediately after the first 'ul' element that is a sibling.
        jQueryObj(this).parent().find('ul').eq(0).after(closingDelimiter);
      });
    }; // End of finalizeStructuralElements

    // Create the initial unordered list element that will serve as the root for the formatted data.
    var mainDataList = jQueryObj('<ul id="' + currentConfig.rootListIdentifier + '" />');

    // Append this main list to the designated target element in the DOM.
    jQueryObj(currentConfig.targetElement).append(mainDataList);

    // Begin the primary iteration through the top-level input data.
    jQueryObj.each(inputData, function(topKey, topValue) {

      // Check if the current top-level value is an object (and not null).
      if (topValue !== null && typeof topValue === 'object') {
        var isComplexObject = false;    // Flag to detect if 'topValue' contains nested plain objects.
        var isArrayStructure = false;   // Flag to detect if 'topValue' contains direct primitive values (like an array).
        var nextIdentifier = '';        // Stores an identifier for the next level of data processing.

        // Perform an initial scan of 'topValue's children to infer its structure.
        jQueryObj.each(topValue, function(innerKey, innerValue) {

          if (innerValue !== null && typeof innerValue === 'object') {
            if (innerValue.length === undefined) {
              // If a child is a plain object, mark 'topValue' as a complex object.
              isComplexObject = true;
              nextIdentifier = innerKey; // Capture a key for potential use in ID generation.
            }
            // If innerValue has a 'length' property, it's an array, so 'isComplexObject' remains false.
          }
          else {
            // If a child is a primitive, mark 'topValue' as having an array-like structure.
            isArrayStructure = true;
          }
        });

        // Based on the structural analysis, decide how to render the current 'topValue'.
        if (isComplexObject) {
          // If 'topValue' contains nested plain objects, append with an opening bracket (as per original logic).
          jQueryObj('#' + currentConfig.rootListIdentifier).append('<li><b>' + topKey + ':</b> <span>[</span><ul id="' + nextIdentifier + '-' + iterationCounter + '"></ul></li>');
          processNestedObjects(topValue, nextIdentifier + '-' + iterationCounter);
        }
        else if (isArrayStructure) {
          // If 'topValue' contains primitive values (like a simple array), append with an opening bracket.
          jQueryObj('#' + currentConfig.rootListIdentifier).append('<li><b>' + topKey + ':</b> <span>[</span><ul id="' + nextIdentifier + '-' + iterationCounter + '"></ul></li>');
          traverseRecursive(topValue, nextIdentifier, nextIdentifier + '-' + iterationCounter);
        }
        else {
          // Default case: 'topValue' is an object whose children are also objects (not arrays or primitives).
          jQueryObj('#' + currentConfig.rootListIdentifier).append('<li><b>' + topKey + ':</b> <span>{</span><ul id="' + topKey + '-' + iterationCounter + '"></ul></li>');
          traverseRecursive(topValue, topKey, topKey + '-' + iterationCounter);
        }

      }
      else {
        // If 'topValue' is a primitive (e.g., string, number, boolean, null), append it as a simple list item.
        jQueryObj('#' + currentConfig.rootListIdentifier).append('<li><i>' + topKey + ':</i> ' + topValue + '</li>');
      }
    });

    // After all data has been structured, add the necessary closing delimiters.
    finalizeStructuralElements();

    // If the 'enableFolding' configuration option is true, set up the collapsible sections.
    if (currentConfig.enableFolding) {
      setupCollapsibleSections(currentConfig.rootListIdentifier);
    }

  }, // End of beginProcessing function definition.

  // This function adds interactive toggles to allow users to collapse and expand sections of the formatted data.
  setupCollapsibleSections = function(containerId) {
    // Find all 'ul' elements that are immediate children of 'li' within the specified container.
    jQueryObj('#' + containerId + " > li").find('ul').each(function() {
      // Insert a toggle button (' - ') after the first 'span' element within the parent 'li'.
      jQueryObj(this).parent().find('span').eq(0).after('<span class="toggle_button interactive_link"> - </span>');
    });

    // Initialize the behavior for all newly created toggle buttons.
    // Initially, hide the content and set the button text to ' + '.
    jQueryObj('.toggle_button').next().slideUp().end().text(' + ').on('click', function() {
      // When a toggle button is clicked:
      if (jQueryObj(this).next().is(":visible")) {
        // If the associated content list is currently visible, hide it.
        jQueryObj(this).next().slideUp().end().text(' + '); // Change the button's text to ' + ' for expansion.
      }
      else {
        // If the content list is hidden, show it.
        jQueryObj(this).next().slideDown().end().text(' - '); // Change the button's text to ' - ' for collapse.
      }
    });
  }; // End of setupCollapsibleSections function definition.

  // Return an object that exposes a public API for the module.
  return {
    // Public method to render data, acting as the entry point for external usage.
    renderData: function(inputData, configSettings) {
      beginProcessing(inputData, configSettings); // Delegate to the internal processing function.
    }

  }; // End of the public API object.

})(); // End of the Immediately Invoked Function Expression (IIFE).