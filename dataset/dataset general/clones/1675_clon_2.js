/* Global jQuery access */
/* This module handles table input validation and sum updates */
$.fn.dataEntryHandler = function () {
  'use strict';

  // Obtain references to the primary DOM elements
  var containerElement = $(this),
    summaryRow = containerElement.find('tfoot tr'),
    detailRows = containerElement.find('tbody tr'),

    // Helper function to compute and display initial column totals
    calculateInitialSums = function () {
      var colIndex, currentSum;
      // Loop through each relevant column, skipping the first (index 0)
      for (colIndex = 1; colIndex < summaryRow.children().length; colIndex = colIndex + 1) {
        currentSum = 0.0; // Initialize sum for the current column
        detailRows.each(function () {
          var currentRow = $(this);
          currentSum += parseFloat(currentRow.children().eq(colIndex).text());
        });
        // Update the footer cell with the calculated total
        summaryRow.children().eq(colIndex).text(currentSum);
      }
    };

  // Set up event listeners for changes and validation on table data cells
  containerElement.find('td').on('change', function (eventObject) {
    var activeCell = $(this),
      colIndex = activeCell.index(),
      currentSum = 0;

    // Ignore changes in the first column, as it's typically for labels
    if (colIndex === 0) {
      return;
    }

    // Recalculate the total for the column that was modified
    containerElement.find('tbody tr').each(function () {
      var currentRow = $(this);
      currentSum += parseFloat(currentRow.children().eq(colIndex).text());
    });

    // Apply a specific business rule: if column 1 total exceeds 5000, show an alert
    if (colIndex === 1 && currentSum > 5000) {
      $('.alert').show(); // Display an alert message
      return false; // Reject the change, preventing the UI from updating
    }
    // Otherwise, hide any alerts and update the column's footer total
    else {
      $('.alert').hide(); // Ensure alert is hidden
      summaryRow.children().eq(colIndex).text(currentSum);
    }
  }).on('validate', function (eventObject, inputVal) {
    var activeCell = $(this),
      colIndex = activeCell.index();

    // Validation rule for the first column: must be a non-empty string
    if (colIndex === 0) {
      return !!inputVal && inputVal.trim().length > 0;
    }
    // Validation rule for other columns: must be a finite number
    else {
      return !isNaN(parseFloat(inputVal)) && isFinite(inputVal);
    }
  });

  // Execute the initial sum calculation when the component is loaded
  calculateInitialSums();

  // Enable jQuery method chaining
  return this;
};