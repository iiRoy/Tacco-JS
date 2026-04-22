(function($) {
    // This module orchestrates a dynamic, responsive grid layout powered by Isotope.
    // It automatically adjusts grid item sizes based on the viewport, and provides interactive filtering capabilities.

    /**
     * Utility function to debounce calls to a function.
     * Prevents a function from executing too frequently, especially useful for resize events.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    const createDebounceHandler = (func, delay) => {
        let executionTimerId;
        return function(...args) {
            clearTimeout(executionTimerId);
            executionTimerId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /**
     * Core logic for initializing and managing the responsive grid system.
     * This function is triggered on page load and window resize events.
     * @param {Event} [domEvent] - The DOM event object (optional).
     */
    const setupResponsiveGridDisplay = (domEvent) => {
        const primaryLayoutContainer = $('.dynamic-grid-layout'); // Renamed main container selector
        const minimumColumnFallback = 1; // Ensures at least one column is always rendered.

        // Abort if the primary layout container is not present in the DOM.
        if (!primaryLayoutContainer.length) {
            console.warn('Grid initialization skipped: main layout container (.dynamic-grid-layout) not found.');
            return;
        }

        // Define responsive breakpoints for column distribution.
        // Ordered from largest width to smallest to ensure correct matching.
        const layoutBreakpoints = [
            { screenWidth: 1040, columnsCount: 6 },
            { screenWidth: 850, columnsCount: 5 },
            { screenWidth: 768, columnsCount: 4 },
            { screenWidth: 480, columnsCount: 3 },
            { screenWidth: 300, columnsCount: 2 }
        ];

        /**
         * Calculates the fundamental unit dimension for grid cells and applies it to items.
         * @returns {number} The calculated base dimension (in pixels) for a single grid unit.
         */
        const calculateBaseGridDimension = () => {
            const currentContainerPixelWidth = primaryLayoutContainer.width();
            let determinedColumnCount = minimumColumnFallback;

            // Iterate through breakpoints to find the appropriate column count.
            for (const breakpoint of layoutBreakpoints) {
                if (currentContainerPixelWidth > breakpoint.screenWidth) {
                    determinedColumnCount = breakpoint.columnsCount;
                    break; // Found the matching breakpoint, exit loop.
                }
            }

            // Calculate the base width for a single grid cell.
            // Using bitwise OR `| 0` for floor operation, which is often slightly faster.
            const baseCellSize = (currentContainerPixelWidth / determinedColumnCount) | 0;

            /**
             * Applies calculated width and height to a given grid item element.
             * @param {jQuery} elementRef - The jQuery object of the grid item.
             * @param {number} widthUnits - Multiplier for the base width.
             * @param {number} heightUnits - Multiplier for the base height.
             */
            const applyItemSizing = (elementRef, widthUnits, heightUnits) => {
                const finalItemWidth = baseCellSize * widthUnits;
                const finalItemHeight = baseCellSize * heightUnits;
                elementRef.css({ width: finalItemWidth, height: finalItemHeight });
            };

            // Process different types of grid items based on their size classes.
            primaryLayoutContainer.find('.grid-element-unit').each(function() { // Renamed from .item
                applyItemSizing($(this), 1, 1); // Standard 1x1 grid element
            });

            primaryLayoutContainer.find('.grid-element-double-width').each(function() { // Renamed from .width2
                applyItemSizing($(this), 2, 1); // Double width element
            });

            primaryLayoutContainer.find('.grid-element-double-height').each(function() { // Renamed from .height2
                applyItemSizing($(this), 1, 2); // Double height element
            });

            primaryLayoutContainer.find('.grid-element-double-width.grid-element-double-height').each(function() { // Renamed from .width2.height2
                applyItemSizing($(this), 2, 2); // Double width and height element
            });

            return baseCellSize; // Expose the calculated unit size for Isotope configuration.
        };

        /**
         * Initializes or updates the Isotope layout for the grid.
         */
        const initializeGridFramework = () => {
            const currentGridUnit = calculateBaseGridDimension();
            const gridInstance = primaryLayoutContainer.data('isotope'); // Check for existing Isotope instance.

            const isotopeOptions = {
                itemSelector: '.grid-element-unit', // Updated item selector
                layoutMode: 'masonry', // Explicitly define masonry layout
                masonry: {
                    columnWidth: currentGridUnit,
                    gutter: 15 // Spacing between grid items, changed from 10
                }
            };

            if (gridInstance) {
                // If Isotope is already active, just update its options and re-layout.
                primaryLayoutContainer.isotope('option', isotopeOptions);
                primaryLayoutContainer.isotope('layout');
            } else {
                // Otherwise, initialize a new Isotope instance.
                primaryLayoutContainer.isotope(isotopeOptions);
            }
        };

        // --- Execute initial grid setup ---
        initializeGridFramework();

        // --- Setup filtering controls ---
        const filterControlPanel = $('.grid-control-panel'); // Renamed from .isotope-filters
        if (!filterControlPanel.length) {
            console.info('No grid control panel (.grid-control-panel) found for filtering functionality.');
            return; // Exit if no filter panel is present.
        }

        /**
         * Handles the click event for filter buttons.
         * Applies the selected filter to the Isotope grid.
         */
        const handleFilterButtonClick = function() {
            const chosenFilterCriteria = $(this).attr('data-category-key'); // Renamed data attribute
            primaryLayoutContainer.isotope({ filter: chosenFilterCriteria });
        };

        /**
         * Manages the active state of filter buttons within a group.
         * @param {jQuery} clickedButton - The button that was just clicked.
         * @param {jQuery} buttonGroupElement - The container of the button group.
         */
        const updateFilterButtonActiveState = (clickedButton, buttonGroupElement) => {
            buttonGroupElement.find('.active-category').removeClass('active-category'); // Renamed active class
            clickedButton.addClass('active-category');
        };

        // Attach click listeners to all filter button groups.
        filterControlPanel.each(function() {
            const currentFilterGroup = $(this);
            currentFilterGroup.on('click', 'button', function() {
                handleFilterButtonClick.call(this); // Trigger filter application
                updateFilterButtonActiveState($(this), currentFilterGroup); // Update UI state
            });
        });

    }; // End of setupResponsiveGridDisplay function

    // Bind the main setup function to window events.
    // - On 'load' for initial setup.
    // - On 'resize' with a debounce to optimize performance during rapid resizing.
    $(window).on('load', setupResponsiveGridDisplay);
    $(window).on('resize', createDebounceHandler(setupResponsiveGridDisplay, 200)); // 200ms debounce delay

})(jQuery); // Pass the jQuery object into the IIFE for $ alias.