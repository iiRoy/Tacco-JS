jQuery(function() { // Initialize document on ready event


    // Determine starting count for dynamic input elements
    var entryIndex = jQuery('.entryFields input').length + 1;


    // Routine to display a user notification
    function displayNotification(infoString) {
        jQuery('#statusFeedback').remove(); // Clear any existing notifications
        jQuery('#resultContainer').append("<div id='statusFeedback'>" + infoString + "</div>"); // Add new notification
    }


    // Function to sum up all values from data entry fields
    function sumAllEntries() {
        var runningTotal = 0; // Accumulator for field values
        jQuery(".dataEntry").each(function() {
            runningTotal += Number(jQuery(this).val()); // Convert value to number and add
        });
        return runningTotal; // Return the aggregated sum
    }


    // Handle real-time updates for pixel remaining calculation based on input changes
    jQuery('.entryFields').on('input', 'input', function() {
        var primaryDimension = Number(jQuery('#layoutSetting').val()); // Retrieve main layout width
        var combinedSize = 0; // Initialize sum of current item widths
        jQuery('.entryFields input').each(function() {
            // Only include fields that have a value entered
            if (this.value !== '') {
                combinedSize = combinedSize + Number(jQuery(this).val()); // Add current input's numeric value
            }
        });

        if (combinedSize > primaryDimension) { // Check if the combined width exceeds the limit
            window.alert("Your total item width exceeds the defined layout dimension!"); // Notify user of overflow
            jQuery('.layout-element:last .dataEntry').val(""); // Clear the value of the last added input
        } else {
            combinedSize = primaryDimension - combinedSize; // Calculate the remaining width
            jQuery('#remainingPixels span').text(combinedSize); // Update display with remaining pixels
        }
    });

    // Update remaining pixels display when the main layout width is modified
    jQuery('.single-entry').on('input', 'input', function() {
        var currentLayoutVal = Number(jQuery(this).val()); // Get the new layout width
        jQuery('#remainingPixels span').text(currentLayoutVal); // Show this value as remaining
    });


    // Event handler for adding a new item
    jQuery('#addItemBtn').on('click', function() {
        // Validate if adding a new item would exceed the total available width
        var currentSum = sumAllEntries(); // Get the current total of all existing items
        var mainLayoutWidth = Number(jQuery('#layoutSetting').val()); // Fetch the maximum allowed width
        var calculatedTotal = 0; // Placeholder for sum (re-initialized, could be removed or reused from currentSum)


        if (currentSum > mainLayoutWidth) { // If current sum is already too large
            displayNotification('The current sum is already greater than your main layout dimension. Please adjust values before adding more items.'); // Warn the user
            jQuery('.layout-element:last .dataEntry').val(""); // Clear the last input's value
        } else {
            jQuery('#statusFeedback').remove(); // Clear previous messages
            // Construct and append a new input field for a layout item
            jQuery('<div class="layout-element"><label for="item-' + entryIndex + '">' + entryIndex + '</label><input type="text" class="dataEntry" name="dynamic_items[]" placeholder="Layout item dimension" value="" pattern="[0-9]*"><span class="units">px</span></div>').slideDown('fast').appendTo('.entryFields');
            entryIndex++; // Increment the counter for the next item
        }
        jQuery('.layout-element:last .dataEntry').focus(); // Set focus to the newly added input
        return false; // Prevent default button action
    });


    // Event handler for removing the last item
    jQuery('#removeItemBtn').on('click', function() {
        if (entryIndex > 1) { // Ensure there's at least one item to remove
            jQuery('.layout-element:last').remove(); // Remove the last dynamically added item
            entryIndex--; // Decrement the item counter
        }
        jQuery('#statusFeedback').remove(); // Clear any active notifications
        jQuery('#computedResults').remove(); // Remove any displayed computation results
        return false; // Stop default action
    });


    // Event handler for resetting all dynamic items
    jQuery('#clearAllBtn').on('click', function() {
        while (entryIndex > 2) { // Keep at least one initial item (assuming 1 is static)
            jQuery('.layout-element:last').remove(); // Remove items one by one from the end
            entryIndex--; // Decrease the item count
        }
        jQuery('#statusFeedback').remove(); // Clear all messages
        jQuery('#computedResults').remove(); // Clear all results
        return false; // Prevent form submission
    });


    // Event handler for processing and submitting values
    jQuery('button.process-action').on('click', function() {
        // Initialize an array to store calculated percentage values
        var calculatedPercentages = [];
        // Retrieve the master layout width from its input field
        var masterDimension = Number(jQuery('#layoutSetting').val());
        // Initialize a variable to accumulate total percentage
        var percentageTotal = 0;

        jQuery.each(jQuery('.dataEntry'), function() {
            let baseValue = masterDimension; // The denominator for percentage calculation
            let itemValue = Number(jQuery(this).val()); // The individual item's value
            let ratioValue = itemValue / baseValue; // Calculate the ratio
            let percentageValue = Number((ratioValue * 100).toFixed(2)); // Convert to percentage, round to 2 decimal places
            percentageTotal += percentageValue; // Add to overall percentage sum
            calculatedPercentages.push(percentageValue); // Store individual percentage
        });

        // Display the total calculated percentage width
        jQuery('#totalPercentage span').text(percentageTotal.toFixed(2));

        // Re-check if the total of all item values exceeds the master layout width
        var currentSumVerification = sumAllEntries();

        if (currentSumVerification > masterDimension) { // If values exceed the limit
            displayNotification('The combined item dimensions exceed the main layout width. Please correct inputs.'); // Show an error
            jQuery('.layout-element:last .dataEntry').val(""); // Clear last input
        } else {
            jQuery('#statusFeedback').remove(); // Clear notifications
            jQuery('#computedResults').remove(); // Clear previous results
            // Check for valid input before displaying results
            if (calculatedPercentages.length === 0 || masterDimension === 0) { // If no values or master dimension is zero
                displayNotification('Please provide valid numerical values for calculation.'); // Prompt user for input
            } else {
                // Render the calculated percentages
                jQuery('#resultContainer').append("<div id='computedResults'>" + calculatedPercentages.join("<br />") + "</div>");
            }
        }

        return false; // Prevent browser default action
    });
});