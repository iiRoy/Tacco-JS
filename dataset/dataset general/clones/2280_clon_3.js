jQuery(document).ready(function() {

    // --- Configuration Constants and Global State ---
    // Define the total percentage width that the grid container should occupy.
    // This is often 100% for full width, but can be adjusted.
    const TOTAL_CONTAINER_WIDTH_PERCENT = 100;

    // Set the standard percentage width for the spacing between grid columns (gutters).
    const DEFAULT_GUTTER_PERCENT_WIDTH = 1;

    // Declare a global variable to keep track of the current number of primary columns.
    // This value is manipulated by the UI buttons to add or remove columns.
    let currentActiveColumns = 12; // Initial number of columns displayed when the page loads.

    // --- Core Function: Dynamically Builds and Renders the Grid Layout ---
    /**
     * Reconstructs the entire flexible grid layout based on the specified column count.
     * This function clears any existing grid and draws a new one.
     * @param {number} requestedColumnCount The desired number of main content columns for the grid.
     */
    const renderResponsiveLayout = function(requestedColumnCount) {
        // --- Input Validation and Early Exit ---
        // Ensure the provided column count is a valid positive integer.
        if (typeof requestedColumnCount !== 'number' || requestedColumnCount < 1 || !Number.isInteger(requestedColumnCount)) {
            console.error('Layout generation failed: Invalid column count provided. Must be a positive integer.');
            return; // Abort function execution if input is invalid.
        }

        // --- Local Variable Declarations for Grid Calculation ---
        let iterationIndex = 0; // Loop counter for generating grid elements.
        // This variable tracks the cumulative width of elements to correctly position
        // the `margin-left` of subsequent elements.
        let accumulatedOffset = 0;

        // Use a more descriptive name for the column count within this function's scope.
        const actualColumnCount = requestedColumnCount;

        // Retrieve the gutter width from our constant.
        const gutterUnitWidth = DEFAULT_GUTTER_PERCENT_WIDTH;

        // Calculate the number of gutters needed. For N columns, there are N-1 gutters.
        // If there's only one column, there are no gutters.
        const numberOfGutters = actualColumnCount > 0 ? actualColumnCount - 1 : 0;

        // Calculate the total space consumed by all gutters.
        const totalGutterSpace = numberOfGutters * gutterUnitWidth;

        // Determine the width of each individual content column.
        // This is the total available width minus all gutter space, divided by the number of columns.
        const calculatedColumnSegmentWidth = (TOTAL_CONTAINER_WIDTH_PERCENT - totalGutterSpace) / actualColumnCount;

        // Calculate the total number of HTML elements that will be rendered (columns + gutters).
        const totalRenderElements = actualColumnCount + numberOfGutters;

        // --- DOM Manipulation and Element Creation ---
        const layoutContainerId = 'main-layout-wrapper';
        const layoutContainerSelector = `#${layoutContainerId}`;

        // Before rendering a new grid, remove any existing grid container to prevent duplicates.
        jQuery(layoutContainerSelector).remove();

        // Create the primary container `div` that will hold all grid elements.
        // Using `document.createElement` then wrapping with jQuery for a slightly different approach.
        const newLayoutContainer = jQuery(document.createElement('div'))
            .attr('id', layoutContainerId) // Assign a unique ID.
            .addClass('responsive-grid-base-style') // Apply base styling class.
            .appendTo('body'); // Attach the container to the document body.

        // Retrieve the slider element to get its current value for the container's width.
        const sliderElement = jQuery("#layout-size-adjuster");
        if (sliderElement.length) { // Check if the slider element actually exists in the DOM.
             // Set the width of the main layout container based on the slider's current setting.
             newLayoutContainer.css('width', sliderElement.slider('value') + '%');
        } else {
             // Fallback: If slider is not found, default to the total container width.
             console.warn("Slider element not found. Layout container width defaulting to 100%.");
             newLayoutContainer.css('width', TOTAL_CONTAINER_WIDTH_PERCENT + '%');
        }

        // Loop through and create each individual grid piece (either a column or a gutter).
        for (; iterationIndex < totalRenderElements; iterationIndex++) {
            // Determine if the current element should be a gutter (odd index) or a column (even index).
            const isGutterElement = (iterationIndex % 2 !== 0);

            // Assign width and class based on whether it's a gutter or a column.
            const elementWidth = isGutterElement ? gutterUnitWidth : calculatedColumnSegmentWidth;
            const elementClass = isGutterElement ? 'layout-gap-style' : 'layout-segment-style';
            const elementId = `layout-element-${iterationIndex}`; // Unique ID for each grid piece.

            // Construct and style the grid element.
            jQuery('<div></div>')
                .attr('id', elementId)
                .addClass(elementClass)
                .css({ // Apply multiple CSS properties using an object for conciseness.
                    'width': elementWidth + '%',
                    'margin-left': accumulatedOffset + '%', // Position element using cumulative offset.
                    'height': '100%' // Ensure all elements stretch vertically.
                })
                .appendTo(newLayoutContainer); // Add the element to the main layout container.

            // Update the accumulated offset for the next grid element.
            accumulatedOffset += elementWidth;
        }
    }; // End of renderResponsiveLayout function.

    // --- UI Element Initialization and Event Handling ---

    // Initialize the jQuery UI slider component.
    // This slider controls the overall width of the entire grid layout.
    jQuery("#layout-size-adjuster").slider({
        min: 10,  // Minimum allowed width for the grid (10%).
        max: 100, // Maximum allowed width for the grid (100%).
        value: 75 // Set an initial slider value (75% for variation).
    }).on('slide', function(evt, sliderData) {
        // Event handler for when the slider's value changes.
        // Update the width of the main grid container using the slider's current value.
        jQuery('#main-layout-wrapper').css('width', sliderData.value + '%');
    });

    // Initialize the jQuery UI button for decreasing the number of columns.
    // Attach a click event handler to it.
    jQuery('button[data-action="decrease-columns"]').button().on('click', function(evt) {
        // Prevent decreasing columns below one, as a single column is the minimum valid state.
        if (currentActiveColumns > 1) {
            currentActiveColumns--; // Decrement the global column counter.
            renderResponsiveLayout(currentActiveColumns); // Re-render the grid with fewer columns.
        } else {
            console.info("Column count cannot be reduced below 1.");
            // Optionally, provide visual feedback to the user (e.g., disable button, show message).
        }
    });

    // Initialize the jQuery UI button for increasing the number of columns.
    // Attach a click event handler to it.
    jQuery('button[data-action="increase-columns"]').button().on('click', function(evt) {
        // Define a reasonable upper limit for the number of columns to prevent layout issues
        // or performance degradation with too many elements.
        const MAX_COLUMNS_ALLOWED = 24;
        if (currentActiveColumns < MAX_COLUMNS_ALLOWED) {
            currentActiveColumns++; // Increment the global column counter.
            renderResponsiveLayout(currentActiveColumns); // Re-render the grid with more columns.
        } else {
            console.info(`Column count cannot exceed ${MAX_COLUMNS_ALLOWED}.`);
            // Optionally, provide visual feedback to the user.
        }
    });

    // --- Initial Grid Render on Page Load ---
    // Call the grid rendering function once the document is ready to display the initial layout.
    renderResponsiveLayout(currentActiveColumns);

}); // End of jQuery(document).ready() block.