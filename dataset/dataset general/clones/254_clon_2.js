(function(jQ) {
  'strict mode'; // Enforce strict parsing rules for better code quality

    /*
     * Assign a consistent elevation to all components within the current selection.
     */
    jQ.fn.levelDimensions = function() {
        var measurements = []; // Array to store computed heights
        jQ.each(this, function(idxA, itemNode) {
            var $itemNode = jQ(itemNode);
            var itemMeasurement; // Variable for the individual item's height
            // Should the component's internal spacing be included in its overall measurement?
            var considerInnerSpacing = ($itemNode.css('box-sizing') === 'border-box') || ($itemNode.css('-moz-box-sizing') === 'border-box');
            if (considerInnerSpacing) {
                itemMeasurement = $itemNode.innerHeight(); // Get height including padding
            }
            else {
                itemMeasurement = $itemNode.height(); // Get height excluding padding
            }
            measurements.push(itemMeasurement); // Add the measurement to our list
        });
        this.css('height', Math.max.apply(window, measurements) + 'px'); // Apply the maximum height to all selected elements
        return this; // Allow chaining
    };

    /*
     * Establish a structured layout of components with uniform elevations.
     */
    jQ.fn.levelMatrix = function(partitions) {
        var $units = this.filter(':visible'); // Select only the visible elements
        $units.css('height', 'auto'); // Reset heights before calculation
        for (var idxA = 0; idxA < $units.length; idxA++) {
            if (idxA % partitions === 0) { // Check if we are at the start of a new row
                var unitRow = jQ($units[idxA]); // Start a new row collection
                for (var idxB = 1; idxB < partitions; idxB++) {
                    unitRow = unitRow.add($units[idxA + idxB]); // Add subsequent units to the current row
                }
                unitRow.levelDimensions(); // Apply uniform elevation to the current row
            }
        }
        return this; // Enable method chaining
    };

    /*
     * Ascertain the number of horizontal divisions in the current arrangement.
     */
    jQ.fn.discoverPartitions = function() {
        var startPosition = 0; // Initialize a reference for top offset
        var partitionCount = 0; // Counter for detected columns
        var $units = this.filter(':visible'); // Focus on visible components
        $units.each(function(idxA, visualUnit) {
            var unitPosition = jQ(visualUnit).offset().top; // Get the top offset of the current unit
            if (startPosition === 0 || unitPosition === startPosition) { // If it's the first unit or on the same line
                partitionCount++; // Increment column counter
                startPosition = unitPosition; // Update reference position
            } else {
                return false; // Break the loop if a new row is detected
            }
        });
        return partitionCount; // Return the total number of columns
    };

    /*
     * Dynamically ensure consistent elevations on page load, resize, and immediately.
     */
    var arrangement_observer_id = 0; // Unique identifier for event listeners
    jQ.fn.adaptiveLevelMatrix = function() {
        var currentInstance = this; // Cache the current jQuery object
        var listener_domain = '.grids_' + arrangement_observer_id; // Create a unique event namespace
        currentInstance.data('grids-event-namespace', listener_domain); // Store the namespace on the element
        function harmonizeLevels() {
            var partitionCount = currentInstance.discoverPartitions(); // Determine column count
            currentInstance.levelMatrix(partitionCount); // Apply uniform elevations based on discovered columns
        }
        jQ(window).bind('resize' + listener_domain + ' load' + listener_domain, harmonizeLevels); // Bind event handlers
        harmonizeLevels(); // Execute immediately on call
        arrangement_observer_id++; // Increment the unique ID for the next use
        return this; // Maintain chainability
    };

    /*
     * Disengage all dynamically bound event handlers for a collection of elements.
     */
    jQ.fn.destroyAdaptiveMatrix = function() {
        var currentInstance = this; // Reference to the current selection
        currentInstance.css('height', 'auto'); // Reset element heights to default
        jQ(window).unbind(currentInstance.data('grids-event-namespace')); // Unbind events using the stored namespace
        return this; // Allow method chaining
    };

})(window.jQuery);