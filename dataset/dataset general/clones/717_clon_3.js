(function() {
    "use strict"; // Enforce stricter parsing and error handling for cleaner code.

    // A mutable counter to manage unique IDs and labels for dynamically added input fields.
    // Initialized by counting existing fields, ensuring a unique starting point.
    let dynamicItemCount = $('.dynamic-input-group input.item-value-field').length + 1;

    // A consolidated utility function for displaying user messages (notifications or errors).
    // This centralizes message management and allows for consistent styling.
    const presentUserMessage = (msgContent, isErrorAlert = false) => {
        // First, clear any existing messages to avoid message accumulation.
        $('#application-feedback').remove();

        // Construct the new message element with appropriate styling.
        const msgElement = $('<div>')
            .attr('id', 'application-feedback')
            .addClass(isErrorAlert ? 'error-notice' : 'info-notice')
            .html(msgContent); // Using .html() allows for basic HTML formatting in messages.

        // Insert the message at the top of the designated output area.
        $('#results-display-area').prepend(msgElement);

        // For non-error messages, schedule a fade-out and removal for a cleaner UI.
        if (!isErrorAlert) {
            setTimeout(() => {
                msgElement.fadeOut('slow', () => msgElement.remove());
            }, 6000); // Message disappears after 6 seconds.
        }
    };

    // Helper function to safely extract and parse a numeric value from a jQuery element or selector.
    // Returns 0.0 if the value is empty or not a valid number, preventing NaN issues.
    const extractNumericValue = (targetElement) => {
        const rawValue = $(targetElement).val();
        const parsedValue = parseFloat(rawValue);
        // Return 0.0 for empty, null, undefined, or non-numeric values.
        return (rawValue && !isNaN(parsedValue)) ? parsedValue : 0.0;
    };

    // Computes the grand total of all values entered into the individual item width fields.
    const calculateAllItemValues = () => {
        let cumulativeAmount = 0.0; // Initialize total as a float for precision.
        // Iterate over each field identified by the '.item-value-field' class.
        $(".item-value-field").each(function() {
            cumulativeAmount += extractNumericValue(this); // Add the parsed numeric value.
        });
        return cumulativeAmount;
    };

    // Event handler for real-time validation and display of remaining width as item fields are typed into.
    $('.dynamic-input-group').on('keyup', '.item-value-field', function() {
        const mainLayoutWidth = extractNumericValue('#page-layout-width');

        // Early exit if the main layout width is not set or invalid, prompting the user.
        if (mainLayoutWidth <= 0) {
            presentUserMessage("Kindly specify a valid positive number for the overall layout width first.", true);
            $(this).val(""); // Clear the current problematic input.
            return;
        }

        let currentOccupiedWidth = 0.0;
        // Sum up all currently entered item widths.
        $('.dynamic-input-group input.item-value-field').each(function() {
            const fieldValue = extractNumericValue(this);
            if (fieldValue > 0) { // Only consider positive values.
                currentOccupiedWidth += fieldValue;
            }
        });

        // If the total occupied width exceeds the main layout width, provide an error notification.
        if (currentOccupiedWidth > mainLayoutWidth) {
            presentUserMessage("Constraint Violation: The sum of your item widths now surpasses the main layout width!", true);
            // As a corrective action, if the currently edited field is the last one, clear it.
            // This is a common pattern to prevent overfilling.
            const lastActiveField = $('.item-value-field').last();
            if ($(this).is(lastActiveField)) {
                $(this).val('');
                currentOccupiedWidth = calculateAllItemValues(); // Recalculate after correction.
            }
        }

        // Update the display showing the remaining available width.
        const spaceRemaining = mainLayoutWidth - currentOccupiedWidth;
        $('#width-remaining-label span').text(spaceRemaining.toFixed(2)); // Display with two decimal places.
    });

    // Event handler for keyup on the main page layout width input.
    // This immediately updates the 'remaining width' display based on the main width.
    $('#page-layout-settings').on('keyup', '#page-layout-width', function() {
        const initialLayoutWidth = extractNumericValue(this);
        // Update the display; default to 0.0 if input is invalid.
        $('#width-remaining-label span').text(initialLayoutWidth.toFixed(2));
        // Clear any previous error messages related to width if the user is now adjusting the main width.
        $('#application-feedback').remove();
    });

    // Event listener for the "Append New Item" button.
    $('#append-new-item').on('click', function(event) {
        event.preventDefault(); // Suppress default form submission behavior.

        const currentItemsTotal = calculateAllItemValues();
        const mainContainerMax = extractNumericValue('#page-layout-width');

        // Pre-flight check: Ensure the main container width is properly defined.
        if (mainContainerMax <= 0) {
            presentUserMessage('Prioritize setting a positive numeric value for the main layout width.', true);
            return; // Halt execution.
        }

        // Prevent adding new items if existing items already fill or exceed the container.
        if (currentItemsTotal >= mainContainerMax) {
            presentUserMessage(
                'Current items already utilize or exceed the maximum available width. Adjust existing item widths or increase the main layout width.',
                true
            );
            $('.item-value-field').last().focus(); // Guide user to existing fields.
            return;
        }

        // Clear any general messages before appending a new item.
        $('#application-feedback').remove();

        // Construct the HTML for the new dynamic item input field using a template literal.
        const newEntryMarkup = `
            <div class="dynamic-item-entry">
                <label for="item-input-${dynamicItemCount}">Item ${dynamicItemCount}</label>
                <input type="text" class="item-value-field" id="item-input-${dynamicItemCount}"
                       name="item_dimensions[]" placeholder="Specify item dimension (e.g., 75.5)"
                       value="" pattern="[0-9]*(\.[0-9]+)?" inputmode="decimal" />
                <span class="dimension-unit">px</span>
            </div>
        `;

        // Append the new item with a subtle visual effect.
        $(newEntryMarkup).hide().appendTo('.dynamic-input-group').slideDown(350);

        // Increment the counter for the subsequent item.
        dynamicItemCount++;

        // Shift focus to the newly added input field for immediate data entry.
        $('.item-value-field').last().focus();
    });

    // Event listener for the "Remove Last Item" button.
    $('#remove-last-item').on('click', function(event) {
        event.preventDefault(); // Prevent default action.

        // Only allow removal if there's more than one dynamic item entry.
        // Assuming at least one initial field should always remain or be the starting point.
        if ($('.dynamic-item-entry').length > 1) {
            $('.dynamic-item-entry').last().fadeOut(300, function() {
                $(this).remove(); // Remove the element from the DOM after fading out.
                dynamicItemCount--; // Decrement the global counter.

                // Recalculate and update the remaining width display after an item is removed.
                const currentMainWidth = extractNumericValue('#page-layout-width');
                const totalCurrentItems = calculateAllItemValues();
                const updatedSpaceLeft = currentMainWidth - totalCurrentItems;
                $('#width-remaining-label span').text(updatedSpaceLeft.toFixed(2));
            });
            $('#application-feedback').remove(); // Clear any messages upon successful removal.
        } else {
            presentUserMessage('Minimum one item must remain; cannot remove the last entry.', false);
        }
    });

    // Event listener for the "Reset All Fields" button.
    $('#reset-all-fields').on('click', function(event) {
        event.preventDefault(); // Prevent default form submission.

        const baseItemCount = 1; // Assuming a single initial item is always present.

        // Remove all dynamic item entries except the first one.
        $('.dynamic-item-entry').not(':first').fadeOut(300, function() {
            $(this).remove();
            dynamicItemCount = baseItemCount + 1; // Reset counter for new additions.
        });

        // Clear the main layout width input.
        $('#page-layout-width').val('');
        // Reset the remaining width display to default.
        $('#width-remaining-label span').text('0.00');

        // Clear all feedback messages and previously displayed results.
        $('#application-feedback').remove();
        $('#percentage-breakdown-output').remove();
        $('#cumulative-percentage-display span').text('0.00%');

        presentUserMessage('All input fields and results have been cleared.', false);
    });

    // Event listener for the "Calculate Percentages" (Submit) button.
    $('#calculate-percentages').on('click', function(event) {
        event.preventDefault(); // Prevent default form submission.

        // Array to hold the calculated percentage for each item.
        const individualItemPercentages = [];
        // Retrieve the overall page layout width.
        const mainLayoutWidth = extractNumericValue('#page-layout-width');
        // Accumulator for the sum of all item percentages.
        let totalCalculatedPercentage = 0.0;
        const PERCENTAGE_MULTIPLIER = 100.0; // Constant for percentage conversion.

        // Critical pre-validation: Ensure main layout width is valid and positive.
        if (mainLayoutWidth <= 0) {
            presentUserMessage('A valid, positive number is required for the main layout width before calculation.', true);
            // Clear any prior results or totals as calculation cannot proceed.
            $('#percentage-breakdown-output').remove();
            $('#cumulative-percentage-display span').text('0.00%');
            return;
        }

        // Get all item width input fields.
        const itemDimensionFields = $('.item-value-field');

        // Pre-validation: Check if there are any item fields to process.
        if (itemDimensionFields.length === 0) {
            presentUserMessage('No item width fields found. Please add items to calculate percentages.', true);
            $('#percentage-breakdown-output').remove();
            $('#cumulative-percentage-display span').text('0.00%');
            return;
        }

        // Iterate through each item field to compute its percentage contribution.
        let calculationErrorOccurred = false;
        itemDimensionFields.each(function() {
            const currentItemDimension = extractNumericValue(this);

            // Guard against negative item dimensions.
            if (currentItemDimension < 0) {
                presentUserMessage(`Invalid item dimension '${currentItemDimension}' detected. Dimensions must be non-negative.`, true);
                individualItemPercentages.length = 0; // Clear results on error.
                totalCalculatedPercentage = 0.0;
                calculationErrorOccurred = true;
                return false; // Break out of the jQuery .each loop.
            }

            // Calculate item's percentage relative to the main layout width.
            const dimensionRatio = currentItemDimension / mainLayoutWidth;
            const itemPercentage = dimensionRatio * PERCENTAGE_MULTIPLIER;

            totalCalculatedPercentage += itemPercentage;
            individualItemPercentages.push(itemPercentage.toFixed(2) + '%'); // Store formatted percentage.
        });

        // If an error occurred during the loop, stop further processing.
        if (calculationErrorOccurred) {
            $('#percentage-breakdown-output').remove();
            $('#cumulative-percentage-display span').text('0.00%');
            return;
        }

        // Display the cumulative percentage of all items.
        $('#cumulative-percentage-display span').text(totalCalculatedPercentage.toFixed(2) + '%');

        // Perform a final check: compare the sum of actual pixel widths against the main layout width.
        const actualCombinedWidth = calculateAllItemValues();
        if (actualCombinedWidth > mainLayoutWidth) {
            presentUserMessage(
                `Aggregated item width (${actualCombinedWidth.toFixed(2)}px) surpasses the main layout width (${mainLayoutWidth.toFixed(2)}px).`,
                true
            );
        } else if (actualCombinedWidth < mainLayoutWidth && actualCombinedWidth > 0) {
            presentUserMessage(
                `You have ${ (mainLayoutWidth - actualCombinedWidth).toFixed(2) }px of space remaining in your main layout.`,
                false
            );
        } else {
            // If everything is perfectly aligned or within limits, clear previous alerts.
            $('#application-feedback').remove();
        }

        // Clear any previous percentage breakdown results.
        $('#percentage-breakdown-output').remove();

        // If there are valid percentages to display, construct and append the results.
        if (individualItemPercentages.length > 0) {
            const resultsHtml = $('<div>')
                .attr('id', 'percentage-breakdown-output')
                .append('<h4>Individual Item Percentage Contributions:</h4>')
                // Map each percentage string to a <p> tag for a clear list.
                .append(individualItemPercentages.map(p => `<p>${p}</p>`).join(''));

            $('#results-display-area').append(resultsHtml);
        } else {
            presentUserMessage('No valid item dimensions were provided for percentage calculation.', true);
        }
    });

    // Initial load-time setup: Ensure the 'width remaining' display is populated
    // with the initial value of the main layout width, if present.
    // This enhances UX by showing current state immediately.
    $(document).ready(function() {
        const initialContainerValue = extractNumericValue('#page-layout-width');
        $('#width-remaining-label span').text(initialContainerValue.toFixed(2));
    });

})(); // End of the self-executing anonymous function.