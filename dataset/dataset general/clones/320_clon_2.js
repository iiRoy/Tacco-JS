/*global jQuery */
// Global alias for jQuery functions to avoid conflicts and enable renaming
(function(jQ) {
  'use strict'; // Enforce strict JavaScript mode

  // Label for this content comparison utility
  var diffAppLabel = 'contentComparisonTool',
    // Comprehensive set of standard configuration options
    defaultSettings = {
      sourceA: '', // Input content from the first side
      sourceB: '', // Input content from the second side
      verboseLog: false, // Flag to enable detailed console output
      popFinalResult: false, // Option to display the merged output in a new window
      popInputSources: false, // Option to display original source contents in new windows
      // Callback function to execute upon successful merge completion
      afterMergeAction: function() {} // Default empty function
    },
    // Internal counter to assign unique IDs to tool instances
    objectCount = 0;

  // Primary constructor function for the ContentComparisonTool
  function ContentComparisonTool(hostContainer, configParams) {
    var currentObj = this; // Maintain a consistent reference to the instance

    // Assign a unique identification number to this particular tool instance
    currentObj.objectId = 1 + objectCount++;
    // Store a jQuery-wrapped reference to the main HTML element
    currentObj.containerRef = jQ(hostContainer);

    // Combine default settings with any user-provided configurations
    currentObj.settingsObject = jQ.extend({}, defaultSettings, configParams);

    // Keep references to the initial default settings and the tool's defined name
    currentObj.initialConfig = defaultSettings;
    currentObj.toolIdentifier = diffAppLabel;

    /** * PUBLIC ATTRIBUTES ***/

    // A jQuery collection of all discovered difference segments
    currentObj.diffSegments = jQ();

    // An array containing objects representing individual change units
    currentObj.conflictInstances = [];

    // Operational counters for the merging process
    currentObj.unresolvedCount = 0; // Number of differences still requiring user action
    currentObj.unmergedCount = 0; // Number of differences awaiting final merge integration

    // Indicator for the current display mode (e.g., inline vs. side-by-side)
    currentObj.displayInline = false;

    // The final array of lines representing the merged document
    currentObj.processedOutput = [];

    // Cumulative adjustment for line numbers due to content modifications
    currentObj.lineNumberAdjustment = 0;
    currentObj.temporaryShift = 0; // Temporary adjustment for ongoing operations


    // Call the initialization method to set up the tool
    currentObj.initializeTool();
  }

  // Define prototype methods for the ContentComparisonTool
  ContentComparisonTool.prototype = {

    /** * INITIALIZATION PROCEDURES ***/
    initializeTool: function() {
      var currentObj = this; // Consistent self-reference

      // Output a diagnostic message indicating the start of initialization
      currentObj.outputDiagnostic('ContentComparisonTool is beginning setup with the following options:', currentObj.settingsObject);

      // Identify all HTML elements marked as change/difference types
      currentObj.diffSegments = currentObj.containerRef.find('.ModificationReplace, .ModificationDelete, .ModificationAdd');
      // Initialize the count of unresolved conflicts based on found segments
      currentObj.unresolvedCount = currentObj.diffSegments.length;

      // Check if there are actual conflicts or content sources to work with
      if (currentObj.unresolvedCount <= 0 || (currentObj.settingsObject.sourceA === '' && currentObj.settingsObject.sourceB === '')) {
        currentObj.outputDiagnostic('No content differences located or source content not supplied - ' +
          'Please provide sourceA and sourceB values during tool instantiation!');
        return false; // Abort if no data to process
      }

      // Determine if the diff view is configured for inline display
      this.displayInline = currentObj.containerRef.hasClass('InlineDifferences');

      // Ensure the merge action button is properly set up
      currentObj.prepareActionButton();

      // Iterate through each identified diff segment to create ChangeUnit objects
      jQ.each(currentObj.diffSegments, function() {
        currentObj.conflictInstances.push(new ChangeUnit(this, currentObj));
      });

      // Attach event handlers for when individual conflicts are resolved or merged
      currentObj.diffSegments.on('content_diff_solved', jQ.proxy(currentObj.onSegmentResolved, currentObj));
      currentObj.diffSegments.on('content_diff_merged', jQ.proxy(currentObj.onSegmentProcessed, currentObj));
      currentObj.diffSegments.on('content_diff_merged', jQ.proxy(currentObj.recalculateShift, currentObj));

      // Confirm that the tool has finished its initialization
      currentObj.outputDiagnostic('ContentComparisonTool setup complete', currentObj);
    },


    /** * PUBLIC FACING METHODS ***/

    /**
     * Automatically selects all changes from the right content source.
     */
    chooseRightSide: function() {
      var currentObj = this;

      // Simulate a user click on all right-side data cells
      currentObj.diffSegments.find('td.Right').click();
      // Special logic for inline display mode involving deletion blocks
      if (currentObj.containerRef.hasClass('InlineDifferences')) {
        currentObj.containerRef.find('.ModificationDelete td.Left').click().click();
      }
    },

    /**
     * Automatically selects all changes from the left content source.
     */
    chooseLeftSide: function() {
      var currentObj = this;

      // Simulate a user click on all left-side data cells
      currentObj.diffSegments.find('td.Left').click();
      // Special logic for inline display mode involving insertion blocks
      if (currentObj.containerRef.hasClass('InlineDifferences')) {
        currentObj.containerRef.find('.ModificationAdd td.Right').click().click();
      }
    },

    /**
     * Initiates the final content merging operation.
     *
     * @param {object} actionEvent The event object that triggered this method (optional).
     */
    startProcessing: function(actionEvent) {
      var currentObj = this;

      // Prevent the default action of the event if it exists
      if (typeof actionEvent !== 'undefined' && actionEvent !== null) {
        actionEvent.preventDefault();
      }

      // Do not proceed if there are still unresolved conflicts (button is disabled)
      if (currentObj.settingsObject.actionButton.attr('disabled') === 'disabled') {
        currentObj.outputDiagnostic('Unable to finalize merge: not all content differences have been addressed.');
        return;
      }

      // Begin the merge by creating a copy of the left source content
      currentObj.processedOutput = currentObj.settingsObject.sourceA.slice(0);

      // Reset the line number adjustment for the new merge cycle
      currentObj.lineNumberAdjustment = 0;

      // Set the total number of conflicts that need to be merged
      currentObj.unmergedCount = currentObj.diffSegments.length;

      // Iterate through each change unit and trigger its individual merge action
      for (var idx = 0; idx < currentObj.conflictInstances.length; idx++) {
        currentObj.conflictInstances[idx].performMerge();
      }
    },

    /**
     * Allows modification of tool settings after initial creation.
     *
     * @param {object} newSettings A plain object containing updated configuration values.
     */
    updateSettings: function(newSettings) {
      var currentObj = this;

      // Only extend settings if the input is a valid plain object
      if (jQ.isPlainObject(newSettings)) {
        currentObj.settingsObject = jQ.extend(true, currentObj.settingsObject, newSettings);
      }
    },


    /** * PROTECTED INTERNAL METHODS ***/

    /*
     * Ensures the presence of a merge control button, creating one if necessary.
     */
    prepareActionButton: function() {
      var currentObj = this;

      // Check if a button is defined in settings and exists in the DOM
      if (typeof currentObj.settingsObject.actionButton === 'undefined' || !jQ(currentObj.settingsObject.actionButton).length) {
        // Create a new button element if none is specified or found
        currentObj.settingsObject.actionButton = jQ('<button />')
          .html('Combine Changes') // Set the button's visible text
          .attr('disabled', 'disabled') // Initially disable the button
          .css({ // Apply some basic styling for visual presentation
            display: 'block',
            height: '50px',
            width: '200px',
            margin: '50px auto'
          });
        currentObj.containerRef.after(currentObj.settingsObject.actionButton); // Insert the button after the main container
      } else {
        // If the button already exists, ensure it's disabled initially
        currentObj.settingsObject.actionButton = jQ(currentObj.settingsObject.actionButton).attr('disabled', 'disabled');
      }

      // Attach the startProcessing method to the button's click event
      currentObj.settingsObject.actionButton.click(jQ.proxy(currentObj.startProcessing, currentObj));
    },

    // Outputs diagnostic messages to the console if verbose logging is enabled
    outputDiagnostic: function() {
      if (this.settingsObject.verboseLog && window.console && window.console.log) {
        // Use Array.prototype.slice.call to convert arguments to a real array for logging
        window.console.log(Array.prototype.slice.call(arguments));
      }
    },

    /* Callback function invoked when an individual conflict is marked as resolved */
    onSegmentResolved: function() {
      var currentObj = this;

      currentObj.unresolvedCount--; // Decrement the count of pending resolutions
      // If all conflicts are resolved, enable the merge button
      if (currentObj.unresolvedCount === 0) {
        currentObj.settingsObject.actionButton.removeAttr('disabled');
      }
    },

    /* Callback function invoked when an individual conflict has been merged */
    onSegmentProcessed: function() {
      var currentObj = this;

      currentObj.unmergedCount--; // Decrement the count of pending merges
      if (currentObj.unmergedCount === 0) {
        // If configured, open a popup displaying the final merged content
        if (currentObj.settingsObject.popFinalResult) {
          displayWindow('Final Output', currentObj.processedOutput.join('\n'));
        }
        // If configured, open popups for the original left and right source contents
        if (currentObj.settingsObject.popInputSources) {
          displayWindow('Source A', currentObj.settingsObject.sourceA.join('\n'));
          displayWindow('Source B', currentObj.settingsObject.sourceB.join('\n'));
        }
        // Execute the user-defined callback function if it's callable
        if (typeof currentObj.settingsObject.afterMergeAction === 'function') {
          currentObj.settingsObject.afterMergeAction.call(currentObj, currentObj.processedOutput, currentObj.settingsObject.sourceA, currentObj.settingsObject.sourceB);
        }
      }
    },

    /* Removes a specified number of lines from the processed output array. */
    removeContentRange: function(startIndex, numItems) {
      var currentObj = this;

      // Log the details of the deletion for debugging purposes
      currentObj.outputDiagnostic('Deleting from Left side: ' + startIndex + ' - ' + (startIndex + numItems - 1) + '.');
      // Perform the actual deletion using JavaScript's splice method
      var removedItems = currentObj.processedOutput.splice((startIndex + currentObj.lineNumberAdjustment - 1), numItems);

      if (currentObj.settingsObject.verboseLog) {
        // Format the removed content for clearer logging
        removedItems = removedItems.map(function(val) {
          return jQ.trim(val).substring(0, 10) + '...';
        });
        currentObj.outputDiagnostic('Removed Content: ', removedItems);
      }

      // Update the temporary line offset to reflect the deletion
      currentObj.temporaryShift -= numItems;
    },

    /* Inserts content from the right source into the processed output at a specific point. */
    addContentRange: function(startIndex, numItems, insertionPoint) {
      var currentObj = this;
      var newContent = []; // Array to temporarily hold lines to be inserted

      // Iterate through the specified range of lines from the right source
      for (var idx = 0; idx < numItems; idx++) {
        // Retrieve the line content from the right source
        var textLine = currentObj.settingsObject.sourceB[startIndex - 1 + idx];
        newContent.push(textLine);

        // Insert the line into the processed output at the calculated position
        currentObj.processedOutput.splice((insertionPoint - 1 + currentObj.lineNumberAdjustment + idx), 0, textLine);
      }

      if (currentObj.settingsObject.verboseLog) {
        currentObj.outputDiagnostic('Left line preceding insertion: ' + (insertionPoint - 1));
        currentObj.outputDiagnostic(
          'Content: ', jQ.trim(currentObj.processedOutput[insertionPoint - 2 + currentObj.lineNumberAdjustment]).substring(0, 10)
        );

        currentObj.outputDiagnostic('Inserted from Right: Row ' + startIndex + ' - ' + (startIndex + numItems - 1) + '.');

        // Format the inserted content for clearer logging
        newContent = newContent.map(function(val) {
          return jQ.trim(val).substring(0, 10) + '...';
        });
        currentObj.outputDiagnostic('Inserted Content: (' + newContent.join(', ') + ')');
      }

      // Update the temporary line offset to reflect the insertion
      currentObj.temporaryShift += numItems;
    },

    // Applies the temporary line offset to the cumulative line adjustment
    recalculateShift: function() {
      var currentObj = this;

      currentObj.outputDiagnostic('Adjusting lineNumberAdjustment from: ' + currentObj.lineNumberAdjustment + ' to ' +
        (currentObj.lineNumberAdjustment + currentObj.temporaryShift) + '.');
      currentObj.lineNumberAdjustment += currentObj.temporaryShift;
      currentObj.temporaryShift = 0; // Reset the temporary offset
    }
  };

  /* Constructor for individual change segments (conflicts) */
  function ChangeUnit(hostElement, mainHandler) {
    var currentObj = this; // Self-reference for scope

    currentObj.hostRef = jQ(hostElement); // jQuery reference to the specific HTML element
    currentObj.parentProcessor = mainHandler; // Reference to the main ContentComparisonTool instance

    currentObj.isHandled = false; // Flag indicating if a decision has been made for this unit
    currentObj.modificationKind = ''; // Describes the type of change (e.g., 'Replace', 'Delete', 'Add')
    currentObj.preferLeftSide = false; // Boolean indicating if the left side's content was chosen
    currentObj.startLineLeft = 0; // Starting line number of the left block in this unit
    currentObj.startLineRight = 0; // Starting line number of the right block in this unit
    currentObj.linesLeftBlock = 0; // Total number of lines in the left content block
    currentObj.linesRightBlock = 0; // Total number of lines in the right content block

    currentObj.initializeTool(); // Begin the setup for this change unit
  }

  // Define prototype methods for ChangeUnit objects
  ChangeUnit.prototype = {

    /** * INITIALIZATION ***/
    initializeTool: function() {
      var currentObj = this;

      // Extract the specific modification type from the element's class attribute
      currentObj.modificationKind = currentObj.hostRef.attr('class').match(/Modification([\w]+)/)[1];

      // Attach event handlers for click and hover on the data cells within this unit
      currentObj.hostRef.find('td')
        .click(jQ.proxy(currentObj.onCellClick, currentObj))
        .hover(jQ.proxy(currentObj.handleHoverEnter, currentObj), jQ.proxy(currentObj.handleHoverLeave, currentObj));

      currentObj.establishBlockLines(); // Determine the starting line numbers for both sides
      currentObj.calculateBlockSizes(); // Determine the number of rows for both left and right blocks

      currentObj.parentProcessor.outputDiagnostic('ChangeUnit instance created:', currentObj);
    },


    /** * PUBLIC METHODS ***/

    // Executes the appropriate merge logic for this specific change unit
    performMerge: function() {
      var currentObj = this;

      // If the user chose the left side, the right side's changes are effectively ignored
      if (currentObj.preferLeftSide) {
        currentObj.parentProcessor.outputDiagnostic(
          'Ignoring lines ' + currentObj.startLineLeft + ' - ' + (currentObj.startLineLeft + currentObj.linesLeftBlock - 1) + '.'
        );
        currentObj.hostRef.trigger('content_diff_merged'); // Signal that this unit is "merged" (ignored)
        return;
      }

      currentObj.parentProcessor.outputDiagnostic('Processing ChangeUnit merge:', currentObj);

      // Use a switch statement to apply logic based on the modification type
      switch (currentObj.modificationKind) {
        case 'Replace':
          currentObj.performDeletion(); // Delete the original content
          currentObj.performInsertion(); // Insert the new (chosen) content
          break;
        case 'Add':
          currentObj.performInsertion(); // Only insert new content
          break;
        case 'Delete':
          currentObj.performDeletion(); // Only delete existing content
          break;
        default:
          reportIssue('Undefined merge strategy for modification kind "' + currentObj.modificationKind + '".');
          return;
      }

      currentObj.hostRef.trigger('content_diff_merged'); // Signal that this unit has been merged
    },


    /** * PRIVATE HELPER METHODS ***/

    // Event handler for when the mouse cursor enters a data cell
    handleHoverEnter: function(triggerEvent) {
      var eventSource = jQ(triggerEvent.delegateTarget);

      // Determine if the hovered cell is on the 'Left' or 'Right' side and apply a hover class
      var sideClass = eventSource.hasClass('Left') ? 'Left' : 'Right';
      this.hostRef.find('td.' + sideClass).addClass('hoverStyle');
    },

    // Event handler for when the mouse cursor leaves a data cell
    handleHoverLeave: function() {
      this.hostRef.find('td.hoverStyle').removeClass('hoverStyle');
    },

    // Event handler for when a data cell within a conflict is clicked
    onCellClick: function(triggerEvent) {
      var currentObj = this;
      var eventSource = jQ(triggerEvent.delegateTarget),
        chosenSide, unchosenSide;

      // Determine the user's preference (left or right) based on the click and display mode
      if (!currentObj.parentProcessor.displayInline) {
        currentObj.preferLeftSide = eventSource.hasClass('Left');
      } else {
        currentObj.preferLeftSide = eventSource.hasClass('activeSelection');
        if (eventSource.hasClass('Left')) {
          currentObj.preferLeftSide = !currentObj.preferLeftSide;
        }
      }

      chosenSide = currentObj.preferLeftSide ? 'Left' : 'Right';
      unchosenSide = currentObj.preferLeftSide ? 'Right' : 'Left';

      /* Apply visual highlighting to reflect the user's choice */
      if (currentObj.parentProcessor.displayInline &&
        (currentObj.modificationKind === 'Delete' || currentObj.modificationKind === 'Add')
      ) {
        var cellRef = currentObj.hostRef.find('td');
        cellRef.toggleClass('activeSelection');
        cellRef.toggleClass('inactiveSelection', !cellRef.hasClass('activeSelection'));
      } else {
        currentObj.hostRef.find('td.' + chosenSide).removeClass('inactiveSelection').addClass('activeSelection');
        currentObj.hostRef.find('td.' + unchosenSide).removeClass('activeSelection').addClass('inactiveSelection');
      }

      /* Mark this conflict as resolved if it's the first time a choice is made */
      if (!currentObj.isHandled) {
        currentObj.isHandled = true;
        currentObj.hostRef.trigger('content_diff_solved'); // Trigger the resolved event
      }
    },

    // Determines the starting line numbers for the left and right blocks of content
    establishBlockLines: function() {
      var currentObj = this;

      /*
       * Retrieve the first line number of the conflict from the immediately
       * preceding table row, addressing a known issue with line numbering in the original diff output.
       */
      var previousRow = currentObj.hostRef.prev('tbody').find('tr').last();

      currentObj.startLineLeft = parseInt((previousRow.find('th').first().html() || 0), 10) + 1;
      currentObj.startLineRight = parseInt((previousRow.find('th').last().html() || 0), 10) + 1;
    },

    // Calculates the number of lines (rows) involved in the left and right blocks
    calculateBlockSizes: function() {
      var currentObj = this;

      if (currentObj.parentProcessor.displayInline) {
        currentObj.linesLeftBlock = currentObj.hostRef.find('.Left').length;
        currentObj.linesRightBlock = currentObj.hostRef.find('.Right').length;
      } else {
        currentObj.linesLeftBlock = 0;
        currentObj.hostRef.find('.Left').each(function() {
          if (jQ(this).prev('th').html() !== '&nbsp;') {
            currentObj.linesLeftBlock++;
          }
        });
        currentObj.linesRightBlock = 0;
        currentObj.hostRef.find('.Right').each(function() {
          if (jQ(this).prev('th').html() !== '&nbsp;') {
            currentObj.linesRightBlock++;
          }
        });
      }
    },

    // Delegates the insertion of content to the main comparison tool
    performInsertion: function() {
      var currentObj = this;

      currentObj.parentProcessor.addContentRange(currentObj.startLineRight, currentObj.linesRightBlock, currentObj.startLineLeft);
    },

    // Delegates the deletion of content to the main comparison tool
    performDeletion: function() {
      var currentObj = this;

      currentObj.parentProcessor.removeContentRange(currentObj.startLineLeft, currentObj.linesLeftBlock);
    }
  };

  /**
   * Creates a new browser window (popup) with a given title and content.
   *
   * @param {string} windowTitle The title to display in the new window's title bar.
   * @param {string} windowContent The HTML content to place within the new window.
   */
  function displayWindow(windowTitle, windowContent) {
    var newBrowserWin = window.open('popup.html');
    // Encode HTML entities to prevent rendering issues and potential script injection
    windowContent = windowContent.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    // Write the full HTML structure for the popup window
    newBrowserWin.document.write('<html><head><title>' + windowTitle + '</title></head><body><pre>' +
      windowContent + '</pre></body></html>');
  }

  // Utility function to log errors, designed to be non-disruptive
  var reportIssue = function(msgText) {
    if (window.console) {
      window.console.error(msgText);
    }
  };

  // =======================  jQuery Plugin Integration Bridge  ===============================
  // This section registers the ContentComparisonTool as a jQuery plugin,
  // allowing it to be instantiated and its methods called via jQuery objects.
  // This pattern is common in jQuery plugin development.
  jQ.fn[diffAppLabel] = function(configOrMethod) {
    var currentContext = this; // Reference to the jQuery object

    // If the first argument is a string, it indicates a method call
    if (typeof configOrMethod === 'string') {
      // Extract arguments intended for the method call
      var methodArgs = Array.prototype.slice.call(arguments, 1);

      currentContext.each(function() {
        // Retrieve the plugin instance associated with the current element
        var toolInstance = jQ.data(this, 'tool_' + diffAppLabel);
        if (!toolInstance) {
          reportIssue('Cannot invoke methods on ' + diffAppLabel + ' prior to initialization; ' +
            'Please ensure the plugin is instantiated first on this element.');
          // Further action (e.g., throwing an error) could be added here
        }
        // If the instance exists and the method is callable, execute it
        if (toolInstance && typeof toolInstance[configOrMethod] === 'function') {
          toolInstance[configOrMethod].apply(toolInstance, methodArgs);
        } else {
          reportIssue('Method "' + configOrMethod + '" does not exist or is not callable on ' + diffAppLabel + ' instance.');
        }
      });
    } else {
      // If the first argument is not a string, assume it's configuration for initialization
      currentContext.each(function() {
        // Prevent re-initialization if an instance already exists on this element
        if (!jQ.data(this, 'tool_' + diffAppLabel)) {
          // Create a new instance of the tool and store it in the element's data
          jQ.data(this, 'tool_' + diffAppLabel, new ContentComparisonTool(this, configOrMethod));
        }
      });
    }

    return currentContext; // Maintain jQuery chaining capability
  };

})(jQuery); // Pass the jQuery object into the Immediately Invoked Function Expression (IIFE)