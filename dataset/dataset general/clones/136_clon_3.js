var DynamicSpreadsheetView;

(function(global$, undefined) {

  /**
   * Internal utility function to attempt conversion of a value to a number.
   * If conversion fails (results in NaN), the original value is returned.
   * @param {*} value - The value to attempt to convert.
   * @returns {number|*} The numeric representation or the original value.
   */
  const _safelyCoerceToNumber = (value) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? value : numericValue;
  };

  /**
   * Internal utility function to generate an HTML anchor link from a URL string.
   * Adds common attributes for external links.
   * @param {string} urlString - The URL to convert.
   * @returns {string} An HTML string for the anchor tag, or the original string if not a valid URL.
   */
  const _createExternalLinkElement = (urlString) => {
    // A more robust URL regex, including common TLDs and protocols.
    const urlPattern = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
    if (typeof urlString === 'string' && urlPattern.test(urlString)) {
      return `<a target="_blank" rel="noopener noreferrer" class="data-cell-link" href="${urlString}">${urlString}</a>`;
    }
    return urlString; // Return original if it doesn't look like a URL
  };

  /**
   * Initializes a dynamic view component for displaying spreadsheet data
   * as a responsive and sortable HTML table.
   * @class
   * @param {string} dataSheetIdentifier - The unique identifier for the data source (e.g., Google Sheet key).
   * @param {Array<Array<string>>} structureDefinition - An array defining the columns: `[[data_key, display_label], ...]`.
   */
  DynamicSpreadsheetView = function(dataSheetIdentifier, structureDefinition) {
    // Maintain a consistent reference to the current object instance.
    const componentInstance = this;

    // --- Configuration Properties ---
    componentInstance.structureDefinition = Array.isArray(structureDefinition) ? structureDefinition : [];
    if (componentInstance.structureDefinition.length === 0) {
      console.warn("DynamicSpreadsheetView: No valid structure definition provided. Table may appear empty.");
    }

    componentInstance.parentFrameCommunicator = null; // Pym.js instance for cross-frame communication.
    componentInstance.spreadsheetDataLoader = null; // Tabletop.js instance for fetching data.
    componentInstance.mainContainerSelector = '#data'; // Default CSS selector for the parent container.
    componentInstance.generatedTableSelector = null; // Selector for the dynamically created <table> element.

    /**
     * Sets up the view: initializes parent communication and triggers data loading.
     * @param {string} sourceKey - The key required by the data loader.
     * @param {string} [targetDomElementId='#data'] - The ID of the DOM element to render the table into.
     */
    componentInstance.initializeComponent = function(sourceKey, targetDomElementId = '#data') {
      componentInstance.mainContainerSelector = targetDomElementId;

      // Conditional initialization of Pym.js for iframe communication.
      if (typeof pym !== 'undefined' && pym.Child) {
        componentInstance.parentFrameCommunicator = new pym.Child({
          polling: 600 // Slightly adjusted polling frequency.
        });
        console.info("Pym.js Child initialized for parent frame communication.");
      } else {
        console.log("Pym.js library not detected. Cross-frame communication features will be unavailable.");
      }

      // Configuration object for the spreadsheet data loader.
      const loaderConfiguration = {
        key: sourceKey,
        callback: componentInstance.renderDataTable, // Callback after data is fetched.
        simpleSheet: true,
        // debug: false // Removed for Type III, as it's often non-essential config.
      };

      // Conditional initialization of Tabletop.js for data fetching.
      if (typeof Tabletop !== 'undefined' && Tabletop.init) {
        componentInstance.spreadsheetDataLoader = Tabletop.init(loaderConfiguration);
        console.info(`Tabletop.js data loader initialized with key: ${sourceKey}`);
      } else {
        console.error("Tabletop.js library not found. Data cannot be loaded.");
        global$(componentInstance.mainContainerSelector).html('<p class="alert-message">Data loading service is unavailable.</p>');
      }
    };

    /**
     * Sorts an array of data records based on the first defined column in `structureDefinition`.
     * Handles mixed numeric and string values during comparison.
     * @param {Array<Object>} incomingRecords - The array of records to sort.
     * @returns {Array<Object>} A new array containing the sorted records.
     */
    componentInstance.orderDataRecords = function(incomingRecords) {
      if (!Array.isArray(incomingRecords) || incomingRecords.length < 2) {
        return incomingRecords || []; // Return original or empty if not enough to sort.
      }

      const primarySortKey = componentInstance.structureDefinition[0] && componentInstance.structureDefinition[0][0];
      if (!primarySortKey) {
        console.warn("Primary sort key missing from structure definition. Skipping data ordering.");
        return incomingRecords;
      }

      // Create a shallow copy to prevent modifying the original array reference.
      const recordsForSorting = [...incomingRecords];

      recordsForSorting.sort((recordA, recordB) => {
        let valueA = recordA[primarySortKey];
        let valueB = recordB[primarySortKey];

        // Attempt to convert values to numbers for accurate comparison.
        valueA = _safelyCoerceToNumber(valueA);
        valueB = _safelyCoerceToNumber(valueB);

        // Standard comparison logic.
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });

      return recordsForSorting;
    };

    /**
     * Renders the processed data into an HTML table structure within the designated container.
     * @param {Array<Object>} fetchedDataRecords - The data array received from the data loader.
     */
    componentInstance.renderDataTable = function(fetchedDataRecords) {
      if (!Array.isArray(fetchedDataRecords)) {
        console.error("renderDataTable received invalid data: Expected an array.");
        global$(componentInstance.mainContainerSelector).html('<p class="alert-message">Failed to display data: Invalid format.</p>');
        return;
      }

      const orderedRecords = componentInstance.orderDataRecords(fetchedDataRecords);

      const targetContainer = global$(componentInstance.mainContainerSelector);
      const dynamicTableId = `data-display-grid-${Date.now()}`; // Generate a unique ID for the table.
      componentInstance.generatedTableSelector = `#${dynamicTableId}`; // Store the selector for future use.

      // Construct the initial table element with responsive classes.
      const baseTableHtml = `
        <table
          id="${dynamicTableId}"
          class="tablesaw tablesaw-stack data-table-view"
          data-tablesaw-mode="stack"
          data-tablesaw-sortable
          style="display:none;"
        ></table>`; // Added a custom class and tablesaw-stack mode.

      targetContainer.empty().append(baseTableHtml); // Clear container and add new table.

      const tableElementRef = global$(componentInstance.generatedTableSelector);

      // Delegate to helper methods for building table parts.
      componentInstance.buildTableHeaders(tableElementRef);
      componentInstance.populateTableRows(orderedRecords, tableElementRef);

      // Initialize the Tablesaw plugin if available and then show the table.
      if (global$.fn.table) {
        tableElementRef.table().fadeIn(350); // Added a slight fade-in animation.
      } else {
        tableElementRef.show(); // Fallback to direct show if plugin is missing.
        console.warn("Tablesaw plugin not detected. Table may not be responsive or sortable.");
      }

      // Request parent iframe to adjust its height.
      if (componentInstance.parentFrameCommunicator) {
        componentInstance.parentFrameCommunicator.sendHeightToParent();
      }
    };

    /**
     * Generates and appends the table header (<thead>) to the target table element.
     * @param {jQuery} targetTableElement - The jQuery object of the <table> to modify.
     */
    componentInstance.buildTableHeaders = function(targetTableElement) {
      const headerRow = global$('<tr></tr>');

      global$.each(componentInstance.structureDefinition, function(colIndex, colDefinition) {
        const headerLabel = colDefinition[1]; // The human-readable column name.
        let headerCell = global$('<th data-sortable-col></th>').text(headerLabel);

        // Apply specific attributes for the primary column for responsive layout.
        if (colIndex === 0) {
          headerCell.attr('data-tablesaw-priority', 'persist');
          headerCell.attr('data-sortable-default-col', '');
        } else {
          // Assign a lower priority to other columns, making them collapsible.
          headerCell.attr('data-tablesaw-priority', '3');
        }
        headerRow.append(headerCell);
      });

      const tableHeaderSection = global$('<thead></thead>').append(headerRow);
      targetTableElement.append(tableHeaderSection);
    };

    /**
     * Populates the table body (<tbody>) with data from the records.
     * @param {Array<Object>} recordsArray - The array of data objects to render.
     * @param {jQuery} targetTableElement - The jQuery object of the <table> to modify.
     */
    componentInstance.populateTableRows = function(recordsArray, targetTableElement) {
      // Extract only the data keys for efficient lookup during row population.
      const dataFieldKeys = global$.map(componentInstance.structureDefinition, function(def) {
        return def[0];
      });

      const tableBodyElement = global$('<tbody></tbody>'); // Create the tbody once.

      global$.each(recordsArray, function(recordIdx, currentRecord) {
        const tableRow = global$('<tr></tr>');

        global$.each(dataFieldKeys, function(keyIdx, fieldKey) {
          let cellRawValue = currentRecord[fieldKey] || ''; // Retrieve value, default to empty string.
          const tableCell = global$('<td class="grid-data-cell"></td>'); // Add a specific class for cells.

          // Set priority for responsive display based on column index.
          if (keyIdx === 0) {
            tableCell.attr('data-priority', 'persist');
          } else {
            tableCell.attr('data-priority', keyIdx + 1); // 1-based priority for subsequent columns.
          }

          // Check if the cell value is a URL and convert it to a clickable link.
          if (typeof cellRawValue === 'string') {
            cellRawValue = _createExternalLinkElement(cellRawValue);
          }

          tableCell.html(cellRawValue); // Set the cell's inner HTML.
          tableRow.append(tableCell); // Add the cell to the current row.
        });
        tableBodyElement.append(tableRow); // Add the completed row to the table body.
      });
      targetTableElement.append(tableBodyElement); // Append the entire tbody to the table.
    };

    // --- Component Activation ---
    // Ensure the component starts only after the DOM is fully loaded.
    const initiateOnLoad = () => componentInstance.initializeComponent(dataSheetIdentifier);

    // Use a more robust DOMContentLoaded listener for better practice.
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initiateOnLoad);
    } else {
      // DOMContentLoaded has already fired, execute immediately.
      initiateOnLoad();
    }
  };

})(jQuery); // Pass jQuery object into the IIFE to prevent conflicts and ensure availability.