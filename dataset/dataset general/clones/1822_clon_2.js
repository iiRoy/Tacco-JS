/*
 * This JavaScript module provides enhanced accessibility and responsiveness
 * for HTML tables, allowing columns to be dynamically hidden based on screen
 * size or user preference via a toggle menu.
 */


(function(_jq) {

  /**
   * Global counter to assign unique identifiers to each responsive table
   * instance on the page. Starts at 1.
   * @type Integer
   */
  var pageTableCounter = 1;

  /**
   * jQuery plugin definition for 'responsiveTableAdaptor'.
   * This function extends jQuery's prototype, making the functionality
   * available on any selected DOM element (typically a <table>).
   *
   * @param {Object} settings - Configuration options for the plugin.
   * @returns {jQuery} - Returns the jQuery object for chaining.
   */
  _jq.fn.responsiveTableAdaptor = function(settings) {

    // Merge user-provided settings with the plugin's default configurations.
    // This creates a final, effective settings object for the current instance.
    var effectiveSettings = _jq.extend({}, _jq.fn.responsiveTableAdaptor.defaultSettings, settings);

    // Iterate over each selected table element.
    return this.each(function() {

      // Store a jQuery wrapped reference to the current table element.
      var targetTable = _jq(this);

      /*
       * Reference to the initial data cell (<td>) within the table.
       * This specific cell (first TD after the first TR) helps in
       * deducing the layout of row and column headers.
       */
      var primaryCellRef = (targetTable.find('tr:gt(0) td:eq(0)'));

      // If no such data cell exists, the table might be empty or malformed;
      // in such cases, this plugin instance has nothing to do.
      if (!primaryCellRef) {
        // The original code has `if (!firstCell)`, which for a jQuery object
        // (even an empty one) is always false. Replicating this behavior.
        return;
      }

      /*
       * Stores the number of <th> elements that precede data cells
       * horizontally (i.e., row headers).
       */
      var leadingColHeaderNum = 0,

        /*
         * Stores the number of <tr> elements that contain headers
         * vertically (i.e., column headers).
         */
        upperRowHeaderNum = 0,

        /*
         * A unique numerical identifier for the toggle menu associated
         * with this specific table instance.
         */
        menuIdentifier = pageTableCounter,

        /*
         * A jQuery object representing the unordered list (UL) that will
         * contain the column visibility checkboxes. Initially set to false.
         */
        checkboxListElement = false;

      // Increment the global counter for the next table instance.
      pageTableCounter++;


      /**
       * Method attached to the table instance to calculate the number
       * of header columns (<th>) that define rows.
       */
      targetTable.determineColumnHeaderCount = function() {
        // Find all <th> elements that are siblings preceding the primary data cell.
        var rowAxisHeaders = primaryCellRef.prevAll('th');

        // Loop through these row headers to count them, considering 'colspan'.
        rowAxisHeaders.each(function() {
          var currentHeader = _jq(this);
          // Check if 'colspan' attribute exists and is a number greater than 0.
          var spanValue = currentHeader.attr('colspan');
          if (spanValue && Number(spanValue) > 0) {
            leadingColHeaderNum += Number(spanValue);
          } else {
            leadingColHeaderNum++; // Default to 1 if no colspan or invalid.
          }
        });
      };

      /**
       * This method is responsible for adjusting column visibility.
       * It's called during initial setup and on window resize events.
       */
      targetTable.adjustVisibility = function() {

        // Retrieve all input (checkbox) elements from the column control menu.
        var inputElements = checkboxListElement.find('input').get();

        // First, ensure all checkboxes are checked to make all columns visible.
        _jq(inputElements).each(function() {
          this.checked = true;
          _jq(this).trigger('change'); // Trigger change to re-display columns.
        });

        // Get the current width of the table's direct parent container.
        var parentWidth = targetTable.parent().width();
        var currentInput = false;

        // While the table's rendered width exceeds its container's width
        // AND there are still columns (checkboxes) to potentially hide:
        while (targetTable.width() > parentWidth && inputElements.length) {
          // Pop the last checkbox (corresponding to the rightmost column)
          // and uncheck it to hide its associated column.
          currentInput = inputElements.pop();
          currentInput.checked = false;

          // Trigger the change event on the checkbox to visually hide the column.
          _jq(currentInput).trigger('change');
        }

        // Update the text of the toggle link to show how many columns are currently hidden.
        checkboxListElement.prev('a').html(effectiveSettings.displayMessage.replace('[NB]', checkboxListElement.find('input:not(:checked)').length));
      };


      /**
       * Method attached to the table instance to calculate the number
       * of header rows (<tr>) that define columns.
       */
      targetTable.determineRowHeaderCount = function() {
        // From the primary data cell, find its containing row, then count
        // all preceding sibling rows (these are the column headers).
        var precedingRowElements = primaryCellRef.closest('tr').prevAll('tr');
        upperRowHeaderNum = precedingRowElements.length;
      };


      /**
       * Event handler for clicking the column visibility menu toggle link.
       * Prevents default link behavior and toggles the menu's visibility.
       *
       * @param {Object} eventObject - The event object from the click.
       */
      targetTable.toggleColumnMenu = function(eventObject) {
        eventObject.preventDefault(); // Stop the default action of the anchor tag.
        checkboxListElement.fadeToggle(); // Smoothly show or hide the menu list.
      };


      /**
       * Main initialization function for the responsive table adaptor.
       * This sets up the menu, calculates header counts, and binds events.
       */
      targetTable.initializeAdaptor = function() {

        // Perform initial calculations for the table's header structure.
        targetTable.determineColumnHeaderCount();
        targetTable.determineRowHeaderCount();

        /*
         * Construct and insert the HTML structure for the column control menu
         * directly before the current table element. The class and ID are
         * derived from plugin settings and a unique identifier.
         */
        targetTable.before('<div class="' + effectiveSettings.wrapperClass + '"><a href="#' + effectiveSettings.menuIdPrefix + menuIdentifier + '"></a><ul id="' + effectiveSettings.menuIdPrefix + menuIdentifier + '"></ul></div>');

        // Assign the newly created UL element (the checkbox list) to its variable.
        checkboxListElement = _jq('#' + effectiveSettings.menuIdPrefix + menuIdentifier);
        // Apply a unique class to the table itself for specific styling or targeting.
        targetTable.addClass(effectiveSettings.tableClassPrefix + menuIdentifier);

        // Initially hide the column control menu.
        checkboxListElement.hide();

        // Attach the toggle function to the menu's preceding anchor link.
        checkboxListElement.prev().click(targetTable.toggleColumnMenu);


        // Select all header cells found within the designated column header rows.
        var columnHeaderCells = targetTable.find('tr:lt(' + upperRowHeaderNum + ') th');

        // Iterate through each column header cell to generate a corresponding checkbox.
        columnHeaderCells.each(function() {
          var currentHeaderCell = _jq(this);

          // Skip any header cells that are empty or contain only whitespace,
          // as they likely don't correspond to a hideable column.
          if (currentHeaderCell.text().trim() === "") {
            return;
          }

          /*
           * Retrieve and parse the 'headers' attribute. This helps in
           * structuring the checkboxes hierarchically if headers are nested.
           */
          var associatedHeaders = currentHeaderCell.attr('headers') ? currentHeaderCell.attr('headers').trim().split(' ') : [];
          associatedHeaders = associatedHeaders.filter(function(item) {
            return item !== '';
          });

          var currentParentList = checkboxListElement; // Default target is the main menu UL.
          if (associatedHeaders.length > 0) {
            /*
             * If the header has associated parent headers, find the LI element
             * corresponding to the first parent header. This is where a sub-list
             * for the current header's checkbox should be placed.
             */
            currentParentList = _jq('#controlItemFor_' + menuIdentifier + '_' + associatedHeaders[0]);
            var nestedList = currentParentList.find('ul');

            // If a sub-list (UL) doesn't exist within the parent LI, create it.
            if (nestedList.length === 0) {
              currentParentList.append('<ul></ul>');
              nestedList = currentParentList.find('ul');
            }
            currentParentList = nestedList; // Now target this nested UL.
          }

          /*
           * Append the HTML for a new list item (LI) containing a label and
           * a checkbox. The checkbox's ID, name, class, and value are dynamically
           * generated using plugin settings and the header's ID and text.
           */
          _jq(currentParentList).append('<li id="controlItemFor_' + menuIdentifier + '_' + currentHeaderCell.attr('id') + '">\
                                <label \
                                    for="visibilityControl_' + menuIdentifier + '_' + currentHeaderCell.attr('id') + '" >\
                                <input \n\
                                id="visibilityControl_' + menuIdentifier + '_' + currentHeaderCell.attr('id') + '"\
                                type="checkbox" class="' + effectiveSettings.checkboxClass + '" \
                                name="' + effectiveSettings.checkboxName + '" \
                                value="' + currentHeaderCell.attr('id') + '" \
                                checked="checked" /> \
                                ' + currentHeaderCell.text() + '</label></li>');
        });

        // Attach the column visibility toggle handler to all checkboxes within the menu.
        _jq('#' + effectiveSettings.menuIdPrefix + menuIdentifier + ' input').change(targetTable.handleInputToggle);

        // Ensure the column visibility is adjusted once the DOM is fully loaded.
        _jq(document).ready(targetTable.adjustVisibility);
        // Re-adjust column visibility whenever the browser window is resized.
        _jq(window).resize(targetTable.adjustVisibility);
      }; // End of initializeAdaptor function


      /**
       * Event handler for the 'change' event of individual column checkboxes.
       * This function shows or hides the corresponding table column(s).
       */
      targetTable.handleInputToggle = function() {
        // The value attribute of the checkbox holds the ID of the related header.
        var columnIdentifier = _jq(this).val();

        /*
         * Find all table cells (<th> or <td>) that either have an ID matching
         * the checkbox's value, or reference that ID in their 'headers' attribute.
         */
        var affectedElements = targetTable.find('#' + columnIdentifier + ', [headers~="' + columnIdentifier + '"]');

        // Based on whether the checkbox is checked, add or remove the 'hidden' class.
        if (_jq(this).is(':checked')) {
          affectedElements.removeClass('hidden'); // Show the column elements.
        } else {
          affectedElements.addClass('hidden'); // Hide the column elements.
        }
      };

      // Initiate the setup process for the current table instance.
      targetTable.initializeAdaptor();

      return this; // Maintain jQuery chainability.
    }); // End of .each() loop
  }; // End of responsiveTableAdaptor plugin definition


  // Default configuration options for the responsiveTableAdaptor plugin.
  _jq.fn.responsiveTableAdaptor.defaultSettings = {
    displayMessage: "[NB] columns concealed...", // Message displayed in the menu toggle link.
    wrapperClass: "columnControlContainer", // CSS class for the menu's wrapping div element.
    menuIdPrefix: "colVisibilityMenu_", // Prefix for the menu UL's ID attribute.
    tableClassPrefix: "adaptableTable_", // Prefix for the unique class applied to the table.
    checkboxClass: "colVisibilityCheckbox", // CSS class for individual column visibility checkboxes.
    checkboxName: "visibleColumns[]" // Name attribute for checkboxes (useful for form submission).
  };

}(jQuery)); // Pass the global jQuery object into the anonymous function as _jq.