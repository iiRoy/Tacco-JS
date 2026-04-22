/*
 This module provides a compact jQuery utility for dynamic table content reordering.
 For more details: https://github.com/kylefox/jquery-tablesort
 Current revision: 0.0.2 - Modified for Type II clone generation.
 */

(function () {

    // Ensure jQuery is available, storing a local reference.
    var jq = window.jQuery;

    // Define the main constructor for the table ordering mechanism.
    jq.dataGridSorter = function ( targetGridElement,  optionsConfiguration ) {
        // Keep a reference to the current object instance.
        var instanceRef = this;
        this.targetGrid = targetGridElement;
        // Identify the header section of the table.
        this.headerSection = this.targetGrid.find('thead');
        // Merge user-provided options with default settings.
        this.options = jq.extend({}, jq.dataGridSorter.defaultOptions, optionsConfiguration);

        // Attach an event listener to all header cells for initiating sorting.
        this.targetGrid.find('th').bind('click.gridArranger', function () {
            instanceRef.arrange(jq(this));
        });

        // Initialize properties to hold the state of the sorting operation.
        this.currentColumnIdx = null;
        this.activatedHeader = null;
        this.sortOrder = null;
    };

    // Extend the prototype of the dataGridSorter with core functionalities.
    jq.dataGridSorter.prototype = {

        // Function to perform the actual sorting of table rows.
        arrange: function ( colHeader,  specifiedOrder ) {
            // Record the start time for performance measurement.
            var startTime = new Date();
            // Reference to the current plugin instance.
            var instanceRef = this;
            // The table element being sorted.
            var workingGrid = this.targetGrid;

            // Determine if the table has a separate <thead> for row selection.
            var dataRows = this.headerSection.length > 0
                ? workingGrid.find('tbody tr')
                : workingGrid.find('tr').has('td');

            // Select all cells within the target column.
            var columnCells = workingGrid.find('tr td:nth-of-type(' + (colHeader.index() + 1) + ')');

            // Retrieve any custom sort key function or value from the header's data attributes.
            var sortValueProvider = colHeader.data().sortBy;

            // An array to store objects containing row, cell, and extracted value for sorting.
            var preparedList = [];

            // Extract values from each cell in the column for sorting.
            var extractedValues = columnCells.map(function ( itemIndex,  currentCell ) {
                // If a custom sort key is defined, use it.
                if (sortValueProvider)
                    return (typeof sortValueProvider === 'function')
                        ? sortValueProvider(jq(colHeader), jq(currentCell), instanceRef)
                        : sortValueProvider;

                // Otherwise, use the data-sort-value attribute or the cell's text content.
                return (jq(this).data().sortValue != null ? jq(this).data().sortValue : jq(this).text());
            });

            // If no values were found, exit the sorting process.
            if (extractedValues.length === 0) return;

            // Remove any existing sort indicator classes from all headers.
            instanceRef.targetGrid.find('th').removeClass(instanceRef.options.ascendingClass + ' ' + instanceRef.options.descendingClass);

            // Determine the sorting direction (ascending or descending).
            if (specifiedOrder !== 'asc' && specifiedOrder !== 'desc')
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            else
                this.sortOrder = specifiedOrder;

            // Convert the string direction into a numerical multiplier for comparison.
            var comparisonMultiplier = this.sortOrder == 'asc' ? 1 : -1;

            // Trigger an event indicating the start of the sorting operation.
            instanceRef.targetGrid.trigger('gridArranger:beginSort', [instanceRef]);
            // Log the sorting action to the console.
            instanceRef.outputMessage("Arranging by column " + this.currentColumnIdx + ' in ' + this.sortOrder + ' order.');

            // Populate the preparedList with necessary data for sorting.
            for (var i = 0, totalItems = extractedValues.length; i < totalItems; i++) {
                preparedList.push({
                    originalIndex: i,
                    associatedCell: columnCells[i],
                    associatedRow: dataRows[i],
                    extractedValue: extractedValues[i]
                });
            }

            // Perform the actual sorting of the mapped items.
            preparedList.sort(function ( itemA,  itemB ) {
                if (itemA.extractedValue > itemB.extractedValue) {
                    return 1 * comparisonMultiplier;
                } else if (itemA.extractedValue < itemB.extractedValue) {
                    return -1 * comparisonMultiplier;
                } else {
                    return 0; // Values are equal.
                }
            });

            // Re-append the rows to the table in their new, sorted order.
            jq.each(preparedList, function ( iterationIndex,  itemEntry ) {
                workingGrid.append(itemEntry.associatedRow);
            });

            // Add the appropriate class to the sorted header cell to indicate its state.
            colHeader.addClass(instanceRef.options[instanceRef.sortOrder]);

            // Log the duration of the sorting operation.
            instanceRef.outputMessage('Arrangement completed in ' + ((new Date()).getTime() - startTime.getTime()) + ' milliseconds.');
            // Trigger an event indicating the completion of the sorting operation.
            this.targetGrid.trigger('gridArranger:endSort', [instanceRef]);
        },

        // Utility function for logging messages to the console.
        outputMessage: function ( messageText ) {
            // Check if debugging is enabled and console is available.
            if ((jq.dataGridSorter.DEVELOPMENT_MODE || this.options.debug) && console && console.log) {
                console.log('[gridArranger] ' + messageText);
            }
        },

        // Method to clean up and remove the plugin instance.
        removePlugin: function () {
            // Unbind the click event listener from the header cells.
            this.targetGrid.find('th').unbind('click.gridArranger');
            // Remove the plugin data associated with the table element.
            this.targetGrid.data('gridArranger', null);
            return null;
        }

    };

    // Global debug flag for the plugin.
    jq.dataGridSorter.DEVELOPMENT_MODE = false;

    // Default configuration options for the dataGridSorter.
    jq.dataGridSorter.defaultOptions = {
        debug: jq.dataGridSorter.DEVELOPMENT_MODE, // Inherits from global debug flag.
        ascendingClass: 'ordered_up',             // Class for ascending order.
        descendingClass: 'ordered_down'           // Class for descending order.
    };

    // Integrate the plugin with jQuery's fn object.
    jq.fn.arrangeGrids = function ( configObj ) {
        var targetElement, handlerInstance, existingInstance;
        // Iterate over each selected element.
        return this.each(function () {
            targetElement = jq(this);
            // Check if an instance of the plugin already exists for this element.
            existingInstance = targetElement.data('gridArranger');
            if (existingInstance) {
                existingInstance.removePlugin(); // Destroy the old instance.
            }
            // Create a new instance of the dataGridSorter and store it.
            targetElement.data('gridArranger', new jq.dataGridSorter(targetElement, configObj));
        });
    };

})();