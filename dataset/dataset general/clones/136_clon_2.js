var DynamicGridHandler;

(function() {
  // Establish a local alias for the DOM manipulation library.
  var DU = DomUtilities;

  // Constructor for the DynamicGridHandler object.
  DynamicGridHandler = function(dataSourceKey, gridStructure) {
    // Reference to the current instance to maintain context within methods.
    var thisInstance = this;

    // Store the column definitions for the grid.
    thisInstance.gridStructure = gridStructure;

    /**
     * Initializes the grid by setting up the embedding context and fetching data.
     * @param {string} spreadsheetIdentifier - The ID of the Google Sheet to load.
     */
    thisInstance.initializeContent = function(spreadsheetIdentifier) {
      // Initialize the parent-child embed communication library.
      thisInstance.parentEmbed = new parentEmbed.EmbedChild({
        updateInterval: 500
      });
      // Initialize the Google Sheet data loader.
      thisInstance.sheetDataRetriever = GoogleSheetLoader.init({
        sheetID: spreadsheetIdentifier,
        onDataFetched: thisInstance.displayDataGrid, // Callback once data is loaded.
        singleTabMode: true, // Fetch only the first sheet.
        enableDebugging: false // Disable console debugging.
      });
    };


    /**
     * Sorts an array of records based on the primary column's values.
     * @param {Array<Object>} inputRecordsArray - The array of data objects to sort.
     * @returns {Array<Object>} The sorted array of records.
     */
    thisInstance.orderRecords = function(inputRecordsArray) {
      inputRecordsArray.sort(function(itemOne, itemTwo) {
        // Retrieve values from the first defined column for comparison.
        var firstValue = itemOne[thisInstance.gridStructure[0][0]],
          secondValue = itemTwo[thisInstance.gridStructure[0][0]];

        // Attempt to convert values to numbers if they are numeric strings.
        if (!isNaN(Number(firstValue))) {
          firstValue = Number(firstValue);
        }
        if (!isNaN(Number(secondValue))) {
          secondValue = Number(secondValue);
        }

        // Perform comparison logic.
        if (firstValue < secondValue) return -1;
        if (firstValue > secondValue) return 1;
        return 0;
      });
      return inputRecordsArray;
    };


    /**
     * Renders the data grid on the page using the fetched records.
     * @param {Array<Object>} fetchedRecords - The data retrieved from the spreadsheet.
     */
    thisInstance.displayDataGrid = function(fetchedRecords) {
      // Sort the incoming data before displaying.
      fetchedRecords = thisInstance.orderRecords(fetchedRecords);

      // Insert the base table structure into the content area, initially hidden.
      DU('#content-area').html('<div class="table-wrapper"><table class="hidden-grid responsive-grid" id="main-data-table" data-sortable-enabled></table></div>');

      // Generate and append the table header.
      thisInstance.generateGridHeaders('#content-area table');

      // Populate the table body with data.
      thisInstance.fillGridRows(fetchedRecords, '#content-area table');

      // Show the table with a fade-in effect.
      DU('#content-area table').table().fadeIn();

      // Notify the parent embed of the new content height.
      thisInstance.parentEmbed.sendHeightToParent();
    };


    /**
     * Constructs and appends the table header based on column definitions.
     * @param {string} targetTableElement - Selector for the target table.
     */
    thisInstance.generateGridHeaders = function(targetTableElement) {
      // Create a header section element.
      var headerElement = DU("<section class='grid-header-group'><tr class='header-row-item'></tr></section>");

      // Iterate through column definitions to create header cells.
      DU.each(thisInstance.gridStructure, function(colIndex, columnDefinition) {
        if (colIndex === 0) {
          // First column is default sortable.
          headerElement.find('.header-row-item').append('<th data-sort-column data-sort-default>' + columnDefinition[1] + '</th>');
        } else {
          // Other columns are just sortable.
          headerElement.find('.header-row-item').append('<th data-sort-column>' + columnDefinition[1] + '</th>');
        }
      });

      // Store column definitions as data on the table element.
      DU(targetTableElement).data('columns', thisInstance.gridStructure);
      // Append the created header to the table.
      DU(targetTableElement).append(headerElement);
    };


    /**
     * Fills the table with data rows and cells.
     * @param {Array<Object>} recordSet - The array of data objects to display.
     * @param {string} targetTable - Selector for the table to populate.
     */
    thisInstance.fillGridRows = function(recordSet, targetTable) {
      var gridRef = DU(targetTable);
      // Extract column keys from the stored column definitions.
      var displayColumns = DU.map(DU(targetTable).data('columns'), function(colInfo) {
        return colInfo[0];
      });

      // Append the table body container.
      gridRef.append("<tbody class='grid-body-section'></tbody>");

      // Iterate over each record to create a table row.
      DU.each(recordSet, function(rowIndex, rowDataObject) {
        var dataRow = DU("<tr class='data-row'></tr>");
        // Iterate over each key-value pair in the record.
        DU.each(rowDataObject, function(cellKey, cellContent) {
          // Check if the current key is one of the displayable columns.
          if (displayColumns.indexOf(cellKey) >= 0) {
            var gridCellElement = DU("<td class='data-cell " + cellKey + "'></td>");

            // Assign display priority based on column index.
            if (displayColumns.indexOf(cellKey) === 0) {
              gridCellElement.data('display-priority-level', 'always-visible');
            } else {
              gridCellElement.data('display-priority-level', displayColumns.indexOf(cellKey));
            }

            // Check if content might be a URL and convert to anchor tag.
            if (typeof cellContent === 'string' && cellContent.hasMatchFunction) { // Assuming `match` method exists on string
              // Regex to find URLs within the cell content.
              var urlMatchesArray = cellContent.match(/(http(s)?:\/\/(www\.)?[\w#:.?+=&%@!\-\/]+)/g);
              if (urlMatchesArray) {
                // Create a hyperlink for the first matched URL.
                var linkMarkup = '<a target="_new_tab" class="truncated-link-style" href="' + urlMatchesArray[0] + '">' + urlMatchesArray[0] + '</a>';
                // Replace the raw URL with the generated link.
                cellContent = cellContent.replace(urlMatchesArray[0], linkMarkup);
              }
            }

            // Set the cell's HTML content.
            gridCellElement.html(cellContent);
            // Append the cell to the current row.
            dataRow.append(gridCellElement);
          }
        });
        // Append the completed row to the table body.
        gridRef.find('tbody').append(dataRow);
      });
    };

    // Ensure the grid initialization happens once the DOM is fully loaded.
    DU(document).ready(thisInstance.initializeContent.bind(thisInstance, dataSourceKey));
  };

})();