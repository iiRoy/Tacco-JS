/*global jQuery */
(function($) {
  'use strict';

  // --- Core Constants and Utilities ---
  const MERGE_TOOL_ID = 'diffMergeProcessor'; // Renamed pluginName
  const EVENT_NAMESPACE = 'diffmerge_block_'; // New constant for event names

  let instanceCounter = 0; // Renamed count, tracks unique plugin instances

  /**
   * Displays given content in a new browser window.
   * Renamed 'popup' to be more descriptive.
   * @param {string} windowTitle - The title for the new popup window.
   * @param {string} windowContent - The raw text content to display.
   */
  function displayContentInNewWindow(windowTitle, windowContent) {
    // Basic HTML entity escaping to prevent XSS or display issues in <pre>
    const escapedContent = windowContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (!newWindow) {
      reportIssue('Warning: Popup window blocked. Please allow pop-ups for this site to view results.');
      return;
    }
    // Construct minimal HTML for the popup
    newWindow.document.write(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${windowTitle}</title>
        <style>
          body { font-family: 'Roboto Mono', 'Courier New', monospace; font-size: 0.9em; line-height: 1.4; margin: 15px; background-color: #f8f8f8; color: #333; }
          pre { white-space: pre-wrap; word-wrap: break-word; padding: 10px; border: 1px solid #eee; background-color: #fff; border-radius: 4px; }
        </style>
      </head>
      <body>
        <pre>${escapedContent}</pre>
      </body>
      </html>`);
    newWindow.document.close(); // Essential for some browsers to render content immediately
  }

  /**
   * Logs an error message to the console, prefixed with the tool identifier.
   * Renamed 'logError' for clarity.
   * @param {string} issueMessage - The error message to output.
   */
  const reportIssue = (issueMessage) => {
    if (window.console && typeof window.console.error === 'function') {
      window.console.error(`[${MERGE_TOOL_ID}] ${issueMessage}`);
    }
  };

  // --- Default Configuration Settings ---
  const initialSettings = { // Renamed defaults
    sourceLeft: [], // Renamed left, changed default from '' to [] for array type
    sourceRight: [], // Renamed right, changed default from '' to [] for array type
    enableDebug: false, // Renamed debug to be more explicit
    showResultPopup: false, // Renamed pupupResult
    showSourcesPopup: false, // Renamed pupupSources
    onMergeComplete: $.noop // Renamed merged callback
  };

  /**
   * The primary class responsible for orchestrating the diff-merge process.
   * Renamed PHPDiffMerge to DiffProcessor.
   */
  function DiffProcessor(targetElement, configOptions) { // Renamed element, options
    const _this = this; // Consistent internal reference, renamed self

    _this.processorId = 1 + instanceCounter++; // Renamed _id
    _this.hostElement = $(targetElement); // Renamed $el, represents the main container

    // Deep merge provided options with the initial defaults
    _this.settings = $.extend(true, {}, initialSettings, configOptions); // Renamed options, defaults

    _this.processorName = MERGE_TOOL_ID; // Renamed _name

    // --- Public State Variables for the Processor ---
    _this.conflictZones = $(); // Renamed $conflicts, stores jQuery objects of conflict elements
    _this.changeObjects = []; // Renamed conflicts, holds instances of ChangeBlock

    _this.pendingResolutions = 0; // Renamed toResolve, count of unresolved conflicts
    _this.pendingMerges = 0; // Renamed toMerge, count of merge steps to perform

    _this.isInlineMode = false; // Renamed inline, indicates diff display style

    _this.finalOutput = []; // Renamed result, array of lines representing the merged content

    _this.lineAdjustment = 0; // Renamed lineOffset, cumulative adjustment to line numbers
    _this.tempLineAdjustment = 0; // Renamed _tmpLineOffset, temporary adjustment for current merge block

    _this.isInitialized = false; // New: Internal flag to track initialization status

    _this._initializeProcessor(); // Renamed _init, starts the setup process
  }

  // --- Prototype Methods for DiffProcessor ---
  DiffProcessor.prototype = {
    /**
     * Performs initial setup of the diff processor.
     * Renamed _init.
     */
    _initializeProcessor: function() {
      const _this = this;

      // Guard clause: Prevent re-initialization if already done
      if (_this.isInitialized) {
        _this._logMessage('Processor already initialized. Skipping redundant initialization.');
        return;
      }

      _this._logMessage('DiffProcessor starting initialization with settings:', _this.settings);

      // Early exit if essential prerequisites are not met
      if (!_this._checkPrerequisites()) { // New validation method
        reportIssue('Initialization failed due to unmet prerequisites.');
        return;
      }

      // Find all elements representing conflict zones within the host element
      _this.conflictZones = _this.hostElement.find('.ChangeReplace, .ChangeDelete, .ChangeInsert');
      _this.pendingResolutions = _this.conflictZones.length;

      // Determine if the diff view is in inline mode by checking for a specific class
      _this.isInlineMode = _this.hostElement.hasClass('DifferencesInline');

      _this._setupMergeControl(); // Renamed _ensurePresenceOfMergeButton

      // Instantiate ChangeBlock objects for each identified conflict zone
      // Using Array.prototype.map for a cleaner transformation of jQuery set to array of objects
      _this.changeObjects = _this.conflictZones.get().map(element => {
        return new ChangeBlock(element, _this);
      });

      // Register custom event listeners for conflict resolution and merge steps
      // Using .bind(this) for correct context, replacing $.proxy
      _this.conflictZones.on(EVENT_NAMESPACE + 'resolved', _this._handleResolutionComplete.bind(_this));
      _this.conflictZones.on(EVENT_NAMESPACE + 'merged', _this._handleMergeStepComplete.bind(_this));
      // This listener ensures line offsets are updated after each block merge
      _this.conflictZones.on(EVENT_NAMESPACE + 'merged', _this._adjustLineOffsets.bind(_this));

      _this.isInitialized = true; // Mark processor as fully initialized
      _this._logMessage('DiffProcessor initialization complete:', _this);
    },

    /**
     * Internal method to perform basic validation before full initialization.
     * New method to encapsulate initial checks.
     * @returns {boolean} True if all necessary conditions are met, false otherwise.
     */
    _checkPrerequisites: function() {
      const _this = this;
      if (_this.hostElement.length === 0) {
        reportIssue('Host element not found for DiffProcessor. Ensure target selector is valid.');
        return false;
      }
      if (_this.settings.sourceLeft.length === 0 && _this.settings.sourceRight.length === 0) {
        _this._logMessage('Warning: No merge sources (sourceLeft or sourceRight) provided. The merge might not function as expected.');
        // This is a warning, not a hard stop, as an empty diff might still be displayed.
      }
      return true;
    },

    /**
     * Programmatically selects all changes to prefer the right side's version.
     * Renamed useRight.
     */
    applyRightChanges: function() {
      const _this = this;
      _this.conflictZones.find('td.Right').trigger('click'); // Simulate user clicks
      if (_this.isInlineMode) {
        // Special handling for inline 'Delete' type conflicts where 'Left' cell needs double click
        _this.hostElement.find('.ChangeDelete td.Left').trigger('click').trigger('click');
      }
      _this._logMessage('Programmatically selected all right-side changes.');
    },

    /**
     * Programmatically selects all changes to prefer the left side's version.
     * Renamed useLeft.
     */
    applyLeftChanges: function() {
      const _this = this;
      _this.conflictZones.find('td.Left').trigger('click'); // Simulate user clicks
      if (_this.isInlineMode) {
        // Special handling for inline 'Insert' type conflicts where 'Right' cell needs double click
        _this.hostElement.find('.ChangeInsert td.Right').trigger('click').trigger('click');
      }
      _this._logMessage('Programmatically selected all left-side changes.');
    },

    /**
     * Initiates the final merge process once all conflicts are resolved.
     * Renamed merge.
     * @param {Event} [domEvent] - The DOM event that triggered this method (e.g., button click).
     */
    executeMerge: function(domEvent) {
      const _this = this;

      // Prevent default event behavior if an event object is provided
      if (domEvent && typeof domEvent.preventDefault === 'function') {
        domEvent.preventDefault();
      }

      // Guard clause: Do not proceed if the merge button is still disabled (implies unresolved conflicts)
      if (_this.settings.button && _this.settings.button.is(':disabled')) {
        _this._logMessage('Cannot execute merge: Not all conflicts have been resolved yet.');
        return;
      }

      _this._logMessage('Initiating the final merge operation...');

      // Start the final output with a shallow copy of the left source content
      _this.finalOutput = [..._this.settings.sourceLeft]; // Using spread syntax for array cloning
      _this.lineAdjustment = 0; // Reset cumulative line offset for a new merge run
      _this.pendingMerges = _this.changeObjects.length; // Set counter for individual merge steps

      // Iterate through each ChangeBlock and instruct it to perform its merge action
      _this.changeObjects.forEach(changeBlock => changeBlock.merge());

      _this._logMessage('Merge operations for all blocks have been queued.');
    },

    /**
     * Allows updating processor configuration settings after initialization.
     * Renamed option.
     * @param {object} newOptions - A plain JavaScript object with new settings to apply.
     */
    updateSettings: function(newOptions) {
      const _this = this;
      if ($.isPlainObject(newOptions)) {
        // Deep merge new options into existing settings
        $.extend(true, _this.settings, newOptions);
        _this._logMessage('Processor settings successfully updated:', newOptions);
      } else {
        reportIssue('Attempted to update settings with an invalid (non-plain) object.');
      }
    },

    /**
     * Retrieves the current state of the merged output.
     * New public method.
     * @returns {Array<string>} An array of strings, each representing a line in the merged content.
     */
    getCurrentOutput: function() {
      return this.finalOutput;
    },

    /**
     * Ensures a merge button exists and is properly configured. Creates one if none is provided.
     * Renamed _ensurePresenceOfMergeButton.
     */
    _setupMergeControl: function() {
      const _this = this;
      let mergeButton = $(_this.settings.button); // Attempt to find a user-provided button

      if (!mergeButton.length) {
        // If no button element is found, create a default one
        mergeButton = $('<button />')
          .html('Finalize Merge &raquo;') // Custom button text
          .attr('disabled', true) // Initially disabled
          .css({ // Custom inline styles for the generated button
            'display': 'block',
            'padding': '12px 25px',
            'font-size': '1.05em',
            'margin': '25px auto',
            'border-radius': '6px',
            'background-color': '#007bff', // Bootstrap-like primary blue
            'color': 'white',
            'border': '1px solid #007bff',
            'cursor': 'pointer',
            'box-shadow': '0 2px 5px rgba(0,0,0,0.2)'
          })
          .hover(
            function() { $(this).css({'background-color': '#0056b3', 'border-color': '#0056b3'}); },
            function() { $(this).css({'background-color': '#007bff', 'border-color': '#007bff'}); }
          );
        _this.hostElement.after(mergeButton); // Insert the new button after the main diff element
        _this._logMessage('Generated a default merge button due to no existing button provided.');
      } else {
        // If a button was provided, ensure it starts disabled
        mergeButton.attr('disabled', true);
        _this._logMessage('Using the pre-existing merge button provided in settings.');
      }

      // Store the (potentially newly created) button reference in settings
      _this.settings.button = mergeButton;

      // Attach the click handler, ensuring it's only bound once to prevent multiple triggers
      if (!mergeButton.data('hasMergeHandler')) { // New: Custom data attribute to track handler
        mergeButton.on('click', _this.executeMerge.bind(_this));
        mergeButton.data('hasMergeHandler', true); // Mark as having the handler
      }
    },

    /**
     * Logs messages to the console if debugging is enabled in settings.
     * Renamed _debug, now uses rest parameters for flexible logging.
     * @param {...any} messages - Any number of arguments to be logged.
     */
    _logMessage: function(...messages) {
      if (this.settings.enableDebug && window.console && typeof window.console.log === 'function') {
        window.console.log(`[${this.processorName} Debug]`, ...messages);
      }
    },

    /**
     * Callback invoked when a single conflict block is marked as resolved by the user.
     * Renamed _conflictResolved.
     */
    _handleResolutionComplete: function() {
      const _this = this;
      _this.pendingResolutions--; // Decrement the count of conflicts awaiting resolution
      _this._logMessage('Conflict block resolved. Remaining resolutions:', _this.pendingResolutions);

      // If all conflicts are resolved, enable the merge button
      if (_this.pendingResolutions <= 0) { // Changed condition for robustness (can't go below 0)
        _this.settings.button.removeAttr('disabled');
        _this._logMessage('All conflicts resolved. Merge button has been enabled.');
      }
    },

    /**
     * Callback invoked after a single conflict block's merge operation is completed.
     * Renamed _conflictMerged.
     */
    _handleMergeStepComplete: function() {
      const _this = this;
      _this.pendingMerges--; // Decrement the count of merge steps remaining
      _this._logMessage('Individual merge step completed. Remaining merge operations:', _this.pendingMerges);

      // If all merge steps are complete, proceed with post-merge actions
      if (_this.pendingMerges <= 0) { // Changed condition for robustness
        _this._logMessage('All merge steps finalized. Executing post-merge actions.');

        // Display the final merged output in a new window if configured
        if (_this.settings.showResultPopup) {
          displayContentInNewWindow('Merged Output', _this.finalOutput.join('\n'));
        }

        // Display original source files in new windows if configured
        if (_this.settings.showSourcesPopup) {
          displayContentInNewWindow('Left Source', _this.settings.sourceLeft.join('\n'));
          displayContentInNewWindow('Right Source', _this.settings.sourceRight.join('\n'));
        }

        // Execute the user-defined callback function, if provided and callable
        if (typeof _this.settings.onMergeComplete === 'function') {
          _this.settings.onMergeComplete.call(_this, _this.finalOutput, _this.settings.sourceLeft, _this.settings.sourceRight);
        } else {
          _this._logMessage('No `onMergeComplete` callback function was provided in settings.');
        }
      }
    },

    /**
     * Deletes a specified number of lines from the current final output array.
     * Renamed _deleteResult.
     * @param {number} startIndex - The 1-based line number in the original left source to start deletion.
     * @param {number} numLinesToDelete - The count of lines to remove.
     */
    _removeOutputLines: function(startIndex, numLinesToDelete) {
      const _this = this;
      // Convert to 0-based index and apply current cumulative line adjustment
      const actualOutputIndex = startIndex + _this.lineAdjustment - 1;

      // Guard clause: Validate parameters and index bounds
      if (numLinesToDelete <= 0 || actualOutputIndex < 0 || actualOutputIndex >= _this.finalOutput.length) {
        _this._logMessage('Skipping deletion: Invalid parameters or target index out of bounds.', { startIndex, numLinesToDelete, actualOutputIndex });
        return;
      }

      _this._logMessage(`Deleting ${numLinesToDelete} lines from output at index ${actualOutputIndex}.`);
      const removedContent = _this.finalOutput.splice(actualOutputIndex, numLinesToDelete);

      if (_this.settings.enableDebug) {
        const preview = removedContent.map(line => `"${String(line).trim().substring(0, 25)}..."`).join(', ');
        _this._logMessage('Removed content preview:', preview);
      }

      _this.tempLineAdjustment -= numLinesToDelete; // Update temporary offset reflecting the change
    },

    /**
     * Inserts a specified number of lines from the right source into the final output.
     * Renamed _insertResult.
     * @param {number} sourceRightIndex - The 1-based index in the right source to begin reading lines.
     * @param {number} numLinesToInsert - The count of lines to insert.
     * @param {number} targetOutputIndex - The 1-based line number in the original left source where insertion should occur.
     */
    _insertOutputLines: function(sourceRightIndex, numLinesToInsert, targetOutputIndex) {
      const _this = this;
      // Convert to 0-based index and apply current cumulative line adjustment
      const actualTargetOutputIndex = targetOutputIndex + _this.lineAdjustment - 1;

      // Guard clause: Validate parameters and source bounds
      if (numLinesToInsert <= 0 || sourceRightIndex <= 0 || actualTargetOutputIndex < 0 || sourceRightIndex > _this.settings.sourceRight.length) {
        _this._logMessage('Skipping insertion: Invalid parameters or source index out of bounds.', { sourceRightIndex, numLinesToInsert, targetOutputIndex, actualTargetOutputIndex });
        return;
      }

      const linesToInject = [];
      for (let i = 0; i < numLinesToInsert; i++) {
        const lineContent = _this.settings.sourceRight[sourceRightIndex - 1 + i];
        if (lineContent !== undefined) { // New: Explicitly check for undefined lines
          linesToInject.push(lineContent);
        } else {
          _this._logMessage(`Warning: Attempted to insert an undefined line from right source at index ${sourceRightIndex - 1 + i}. Skipping this line.`);
        }
      }

      // Perform the insertion into the final output array
      _this.finalOutput.splice(actualTargetOutputIndex, 0, ...linesToInject); // Using spread operator for cleaner insertion

      if (_this.settings.enableDebug) {
        const prevLine = _this.finalOutput[actualTargetOutputIndex - 1];
        const previousLinePreview = prevLine ? String(prevLine).trim().substring(0, 25) : 'N/A';
        _this._logMessage(`Line prior to insertion at output index ${actualTargetOutputIndex}: "${previousLinePreview}..."`);

        const insertedPreview = linesToInject.map(line => `"${String(line).trim().substring(0, 25)}..."`).join(', ');
        _this._logMessage(`Inserted ${linesToInject.length} lines from Right (source index ${sourceRightIndex}): [${insertedPreview}]`);
      }

      _this.tempLineAdjustment += linesToInject.length; // Update temporary offset
    },

    /**
     * Applies the temporary line adjustment accumulated during a merge step to the permanent line offset.
     * Renamed _updateLineOffset.
     */
    _adjustLineOffsets: function() {
      const _this = this;
      // Only update if there's an actual change in the temporary offset
      if (_this.tempLineAdjustment !== 0) {
        _this._logMessage(`Applying line offset change: ${_this.lineAdjustment} + ${_this.tempLineAdjustment} = ${_this.lineAdjustment + _this.tempLineAdjustment}.`);
        _this.lineAdjustment += _this.tempLineAdjustment;
        _this.tempLineAdjustment = 0; // Reset temporary offset for the next merge block
      }
    }
  };

  /**
   * Represents an individual conflict block within the diff display.
   * Renamed Conflict to ChangeBlock.
   */
  function ChangeBlock(domElement, parentProcessor) { // Renamed element, master
    const _this = this;

    _this.blockElement = $(domElement); // Renamed $el, the jQuery object for this conflict block
    _this.parentProcessor = parentProcessor; // Renamed master, reference to the main DiffProcessor

    _this.isBlockResolved = false; // Renamed _resolved, flag indicating if user has made a choice
    _this.blockType = ''; // Renamed type (e.g., 'Replace', 'Insert', 'Delete')
    _this.preferLeft = false; // Renamed useLeft, indicates user's preference
    _this.startLineLeft = 0; // Renamed leftLine, 1-based start line in the left source
    _this.startLineRight = 0; // Renamed rightLine, 1-based start line in the right source
    _this.linesInLeftBlock = 0; // Renamed rowsLeft, number of lines in the left part of this conflict
    _this.linesInRightBlock = 0; // Renamed rowsRight, number of lines in the right part of this conflict

    _this._initializeBlock(); // Renamed _init
  }

  // --- Prototype Methods for ChangeBlock ---
  ChangeBlock.prototype = {
    /**
     * Sets up the ChangeBlock instance, including parsing its type and attaching event handlers.
     * Renamed _init.
     */
    _initializeBlock: function() {
      const _this = this;

      // Extract the conflict type (e.g., 'Replace') from the block's class name
      const classMatch = _this.blockElement.attr('class').match(/Change([\w]+)/);
      _this.blockType = classMatch ? classMatch[1] : 'UnknownType'; // Handle cases where regex might not match

      // Attach event handlers to all table data cells within this block
      // Using .bind(this) for correct context
      _this.blockElement.find('td')
        .on('click', _this._onBlockClicked.bind(_this))
        .on('mouseenter', _this._onBlockHoverIn.bind(_this)) // Changed from 'hover' to explicit mouse events
        .on('mouseleave', _this._onBlockHoverOut.bind(_this));

      _this._determineStartLines(); // Renamed _setLine
      _this._calculateBlockDimensions(); // Renamed _setRows

      _this.parentProcessor._logMessage('ChangeBlock initialized:', _this);
    },

    /**
     * Executes the specific merge logic for this conflict block based on its type and user preference.
     * Renamed merge.
     */
    merge: function() {
      const _this = this;

      // If the user preferred the left side, we effectively skip changes from the right
      if (_this.preferLeft) {
        _this.parentProcessor._logMessage(
          `Action: Skipping changes for block (preferring left). Type: ${_this.blockType}. ` +
          `Original Left Lines: ${_this.startLineLeft} - (${_this.startLineLeft + _this.linesInLeftBlock - 1}).`
        );
        _this.blockElement.trigger(EVENT_NAMESPACE + 'merged'); // Still trigger merged event to update counters
        return;
      }

      _this.parentProcessor._logMessage('Action: Merging ChangeBlock:', _this.blockType, _this);

      // Perform actions based on the conflict type
      switch (_this.blockType) {
        case 'Replace':
          _this._performDeletion(); // Remove the original left lines
          _this._performInsertion(); // Insert the right lines
          break;
        case 'Insert':
          _this._performInsertion(); // Only insert lines (from right)
          break;
        case 'Delete':
          _this._performDeletion(); // Only delete lines (from left)
          break;
        default:
          reportIssue(`Undefined merge strategy encountered for block type: "${_this.blockType}".`);
          return;
      }

      _this.blockElement.trigger(EVENT_NAMESPACE + 'merged'); // Signal that this block's merge is complete
    },

    /**
     * Handles the 'mouseenter' event on conflict cells, applying a hover style.
     * Renamed _hoverIn.
     * @param {Event} event - The DOM event object.
     */
    _onBlockHoverIn: function(event) {
      const $targetCell = $(event.currentTarget); // The specific cell being hovered over
      const sideClass = $targetCell.hasClass('Left') ? 'Left' : 'Right';
      this.blockElement.find(`td.${sideClass}`).addClass('hover-active'); // New class for hover state
    },

    /**
     * Handles the 'mouseleave' event on conflict cells, removing the hover style.
     * Renamed _hoverOut.
     */
    _onBlockHoverOut: function() {
      this.blockElement.find('td.hover-active').removeClass('hover-active'); // Remove the hover class
    },

    /**
     * Handles click events on conflict cells to register the user's preference.
     * Renamed _clicked.
     * @param {Event} event - The DOM event object.
     */
    _onBlockClicked: function(event) {
      const _this = this;
      const $clickedCell = $(event.currentTarget); // The specific cell that was clicked

      // Determine user preference based on diff mode and clicked cell
      if (!_this.parentProcessor.isInlineMode) {
        _this.preferLeft = $clickedCell.hasClass('Left');
      } else {
        // Inline mode logic is slightly different for determining preference
        _this.preferLeft = $clickedCell.hasClass('use-choice'); // New class for inline selection
        if ($clickedCell.hasClass('Left')) {
          _this.preferLeft = !_this.preferLeft; // Toggle logic for left cell in inline mode
        }
      }

      const preferredSideClass = _this.preferLeft ? 'Left' : 'Right';
      const rejectedSideClass = _this.preferLeft ? 'Right' : 'Left';

      // Apply visual feedback to the cells based on selection
      if (_this.parentProcessor.isInlineMode &&
        (_this.blockType === 'Delete' || _this.blockType === 'Insert')
      ) {
        // Special styling for inline delete/insert conflicts
        const allCells = _this.blockElement.find('td');
        allCells.toggleClass('selected-choice'); // New class for selected
        allCells.toggleClass('rejected-choice', !allCells.hasClass('selected-choice')); // New class for rejected
      } else {
        // Standard side-by-side styling
        _this.blockElement.find(`td.${preferredSideClass}`).removeClass('rejected-choice').addClass('selected-choice');
        _this.blockElement.find(`td.${rejectedSideClass}`).removeClass('selected-choice').addClass('rejected-choice');
      }

      // If this is the first time this block is being resolved, trigger the event
      if (!_this.isBlockResolved) {
        _this.isBlockResolved = true;
        _this.blockElement.trigger(EVENT_NAMESPACE + 'resolved'); // Trigger custom resolution event
      }
    },

    /**
     * Determines the starting line numbers for this conflict block by inspecting surrounding table rows.
     * Renamed _setLine.
     */
    _determineStartLines: function() {
      const _this = this;

      // Find the last row within the <tbody> immediately preceding this conflict block's <tbody>
      const previousRow = _this.blockElement.prev('tbody').find('tr').last();

      if (previousRow.length === 0) {
        _this.parentProcessor._logMessage('Warning: Could not locate previous row to determine start lines for a block. Defaulting to line 1.');
        _this.startLineLeft = 1;
        _this.startLineRight = 1;
        return;
      }

      // Extract text content from the first and last 'th' elements, parse as integer, default to 0 if empty/null, then add 1 for 1-based indexing
      const leftLineHtml = previousRow.find('th').first().html();
      const rightLineHtml = previousRow.find('th').last().html();

      _this.startLineLeft = parseInt(leftLineHtml || '0', 10) + 1;
      _this.startLineRight = parseInt(rightLineHtml || '0', 10) + 1;
    },

    /**
     * Calculates the number of lines affected by this conflict on both the left and right sides.
     * Renamed _setRows.
     */
    _calculateBlockDimensions: function() {
      const _this = this;

      if (_this.parentProcessor.isInlineMode) {
        _this.linesInLeftBlock = _this.blockElement.find('.Left').length;
        _this.linesInRightBlock = _this.blockElement.find('.Right').length;
      } else {
        // In side-by-side mode, we count 'td.Left'/'td.Right' that have a non-empty line number in the preceding 'th'
        let currentLeftCount = 0;
        _this.blockElement.find('.Left').each(function() {
          if ($(this).prev('th').html() !== '&nbsp;') { // Check if the line number cell is not empty
            currentLeftCount++;
          }
        });
        _this.linesInLeftBlock = currentLeftCount;

        let currentRightCount = 0;
        _this.blockElement.find('.Right').each(function() {
          if ($(this).prev('th').html() !== '&nbsp;') {
            currentRightCount++;
          }
        });
        _this.linesInRightBlock = currentRightCount;
      }
    },

    /**
     * Initiates the deletion of lines from the main processor's final output.
     * Renamed _delete.
     */
    _performDeletion: function() {
      this.parentProcessor._removeOutputLines(this.startLineLeft, this.linesInLeftBlock);
    },

    /**
     * Initiates the insertion of lines into the main processor's final output.
     * Renamed _insert.
     */
    _performInsertion: function() {
      this.parentProcessor._insertOutputLines(this.startLineRight, this.linesInRightBlock, this.startLineLeft);
    }
  };

  // =======================  jQuery Plugin Bridge  ===============================
  // Standard jQuery plugin pattern for instantiation and method calling.
  // This allows the DiffProcessor to be used as a jQuery plugin.
  $.fn[MERGE_TOOL_ID] = function(actionOrOptions) {
    // Capture additional arguments for method calls (e.g., $(el).plugin('method', arg1, arg2))
    const methodArgs = Array.prototype.slice.call(arguments, 1);

    return this.each(function() {
      let instance = $.data(this, 'plugin_' + MERGE_TOOL_ID);

      if (typeof actionOrOptions === 'string') {
        // If the first argument is a string, it's a method call
        if (!instance) {
          reportIssue(`Attempted to call method "${actionOrOptions}" on ${MERGE_TOOL_ID} before initialization.`);
          return;
        }
        // Ensure the method exists and is not a private method (starts with '_')
        if (typeof instance[actionOrOptions] === 'function' && actionOrOptions.charAt(0) !== '_') {
          instance[actionOrOptions].apply(instance, methodArgs);
        } else {
          reportIssue(`Method "${actionOrOptions}" does not exist or is not a public method on ${MERGE_TOOL_ID}.`);
        }
      } else {
        // If it's not a string, it's an initialization call or an options update
        if (!instance) {
          // If no instance exists, create a new one
          instance = new DiffProcessor(this, actionOrOptions);
          $.data(this, 'plugin_' + MERGE_TOOL_ID, instance);
        } else {
          // If an instance already exists, and options are provided, update its settings
          if ($.isPlainObject(actionOrOptions)) {
            instance.updateSettings(actionOrOptions);
          }
        }
      }
    });
  };

})(jQuery);