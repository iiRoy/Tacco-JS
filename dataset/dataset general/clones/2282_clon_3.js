(function(jQ) {

    // Activate strict mode for the JavaScript module, promoting cleaner code and catching common errors.
    "use strict";

    /**
     * @function debounce
     * @description Creates a debounced function that delays invoking `func` until after `delay`
     *              milliseconds have passed since the last time the debounced function was invoked.
     *              Useful for performance optimization on frequently triggered events like window resizing.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The number of milliseconds to delay.
     * @returns {Function} - The debounced version of the function.
     */
    const debounce = (func, delay) => {
        let timeoutIdentifier; // Holds the ID of the timeout to allow clearing.
        return function(...args) {
            const executionContext = this; // Preserve the 'this' context of the original call.
            clearTimeout(timeoutIdentifier); // Clear any previous pending timeout.
            // Set a new timeout to execute the function after the delay.
            timeoutIdentifier = setTimeout(() => func.apply(executionContext, args), delay);
        };
    };

    // Augment jQuery's prototype with a new method, making it available on jQuery objects.
    // This plugin enables responsive behavior for HTML tables, splitting them into fixed and scrollable parts.
    jQ.fn.enhanceWith({

        /**
         * @function responsiveGrid
         * @description Initializes the responsive grid functionality on selected table elements.
         *              Transforms tables into a responsive layout with a fixed segment and a scrollable body
         *              when the viewport width falls below a specified threshold.
         * @param {object} [userProvidedSettings] - Optional configuration object to override defaults.
         * @param {number} [userProvidedSettings.responsiveThresholdWidth=900] - Window width (in pixels)
         *        below which the responsive layout is activated.
         * @param {string} [userProvidedSettings.baseElementClass='dynamic-grid'] - CSS class applied to the
         *        original table element.
         * @param {string} [userProvidedSettings.outerContainerClass='dynamic-grid-wrapper'] - CSS class for
         *        the main wrapping container around the table(s).
         * @param {string} [userProvidedSettings.scrollEnablingClass='dynamic-grid-scroll-area'] - CSS class
         *        for the container that makes the main table body scrollable.
         * @param {string} [userProvidedSettings.fixedElementClass='dynamic-grid-fixed-segment'] - CSS class
         *        for the container holding the cloned, fixed segment of the table.
         * @param {number} [userProvidedSettings.resizeDebounceDelay=150] - Delay in milliseconds for
         *        debouncing the window resize event handler.
         * @returns {jQuery} - The original jQuery object, allowing for method chaining.
         */
        responsiveGrid: function(userProvidedSettings) {
            // Define the default configuration values for the plugin.
            const defaultConfiguration = {
                responsiveThresholdWidth: 900,
                baseElementClass: 'dynamic-grid',
                outerContainerClass: 'dynamic-grid-wrapper',
                scrollEnablingClass: 'dynamic-grid-scroll-area',
                fixedElementClass: 'dynamic-grid-fixed-segment',
                resizeDebounceDelay: 150
            };

            // Merge the default settings with any settings provided by the user.
            // A deep merge (true) is used to ensure all levels of nested objects are combined correctly,
            // and an empty object `{}` is used as the target to avoid modifying `defaultConfiguration`.
            let activePluginSettings = jQ.extend(true, {}, defaultConfiguration, userProvidedSettings);

            // Input validation: Ensure the responsive threshold is a valid positive number.
            if (typeof activePluginSettings.responsiveThresholdWidth !== 'number' || activePluginSettings.responsiveThresholdWidth <= 0) {
                console.warn("responsiveGrid: Invalid 'responsiveThresholdWidth' setting detected. Reverting to default value.");
                activePluginSettings.responsiveThresholdWidth = defaultConfiguration.responsiveThresholdWidth;
            }

            // Iterate over each jQuery element in the current selection.
            // This ensures the plugin can be applied to multiple tables simultaneously.
            return this.each(function() {
                const currentGridElement = jQ(this); // Wrap the current DOM element in a jQuery object.

                // Guard clause: Skip processing if the element is not a table or has already been initialized by this plugin.
                if (!currentGridElement.is('table') || currentGridElement.data('responsiveGridInitialized')) {
                    // console.log(`responsiveGrid: Skipping element as it's not a table or already initialized:`, currentGridElement[0]);
                    return;
                }

                // Mark the current element as initialized to prevent re-initialization.
                currentGridElement.data('responsiveGridInitialized', true);

                // Add the base CSS class to the table for general styling.
                currentGridElement.addClass(activePluginSettings.baseElementClass);

                // Initialize a data attribute to track the current responsive state of this specific grid.
                // This helps in avoiding unnecessary DOM manipulations.
                currentGridElement.data('isResponsiveLayoutActive', false);

                // Perform an initial layout adjustment based on the current window dimensions.
                updateGridLayoutState(currentGridElement, activePluginSettings);

                // Attach a debounced resize event handler to the window.
                // The '.responsiveGrid' namespace allows for easier unbinding of this specific handler later.
                jQ(window).on("resize.responsiveGrid", debounce(() => {
                    updateGridLayoutState(currentGridElement, activePluginSettings);
                }, activePluginSettings.resizeDebounceDelay));

                // Add a custom event listener for when the grid element is removed from the DOM.
                // This ensures proper cleanup, such as unbinding the resize handler.
                currentGridElement.on('remove.responsiveGrid', () => {
                    jQ(window).off("resize.responsiveGrid"); // Unbind the specific resize handler.
                    // Additional cleanup could go here if the plugin creates elements that are not children
                    // of currentGridElement and need explicit removal.
                });
            });

            // --- Internal Helper Functions ---

            /**
             * @function updateGridLayoutState
             * @description Evaluates the current window width against the responsive threshold
             *              and triggers the appropriate layout transformation (activate or deactivate).
             * @param {jQuery} targetGridElement - The specific grid element (table) to manage.
             * @param {object} settings - The active plugin settings for this instance.
             */
            function updateGridLayoutState(targetGridElement, settings) {
                const currentWindowWidth = jQ(window).width();
                const thresholdWidth = settings.responsiveThresholdWidth;
                const wasResponsive = targetGridElement.data('isResponsiveLayoutActive');

                // Check if the current window width is below the defined responsive threshold.
                if (currentWindowWidth < thresholdWidth) {
                    // If the layout is not currently responsive, activate the responsive transformations.
                    if (!wasResponsive) {
                        applyResponsiveTransforms(targetGridElement, settings);
                        targetGridElement.data('isResponsiveLayoutActive', true); // Update state.
                    }
                } else {
                    // If the layout is currently responsive, deactivate the responsive transformations.
                    if (wasResponsive) {
                        removeResponsiveTransforms(targetGridElement, settings);
                        targetGridElement.data('isResponsiveLayoutActive', false); // Update state.
                    }
                }
            }

            /**
             * @function applyResponsiveTransforms
             * @description Modifies the DOM structure of the grid element to enable the responsive layout.
             *              This involves wrapping the main table, cloning a fixed segment, and wrapping it separately.
             * @param {jQuery} mainGrid - The primary grid (table) element to transform.
             * @param {object} settings - The active plugin settings.
             */
            function applyResponsiveTransforms(mainGrid, settings) {
                // Step 1: Create the outermost wrapper container for the entire responsive grid structure.
                const outerWrapperElement = jQ(`<div class="${settings.outerContainerClass}"></div>`);
                mainGrid.wrap(outerWrapperElement); // Wrap the main grid with this new container.

                // Step 2: Clone the main grid to create a fixed segment (e.g., for headers or a sticky first column).
                // This clone will typically be styled to only show a specific part (e.g., first column, or header row).
                const fixedHeaderClone = mainGrid.clone()
                                             .addClass('cloned-fixed-grid-part') // Add a specific class for styling the clone.
                                             .removeAttr('id'); // Remove ID from clone to avoid duplicates.

                // Step 3: Insert the cloned fixed segment into the outer wrapper, before the original grid.
                // This positioning is crucial for CSS-based fixed/scrollable layouts.
                mainGrid.closest(`.${settings.outerContainerClass}`).prepend(fixedHeaderClone);

                // Step 4: Create the scrollable area container and wrap the original main grid with it.
                const scrollableWrapperElement = jQ(`<div class="${settings.scrollEnablingClass}"></div>`);
                mainGrid.wrap(scrollableWrapperElement);

                // Step 5: Create a dedicated wrapper for the cloned fixed segment.
                const fixedSegmentWrapperElement = jQ(`<div class="${settings.fixedElementClass}"></div>`);
                fixedHeaderClone.wrap(fixedSegmentWrapperElement);

                // Store references to the newly created wrapper elements and the clone
                // in the main grid's data for easy access during cleanup.
                mainGrid.data('responsiveGridWrappers', {
                    outer: outerWrapperElement,
                    scroll: scrollableWrapperElement,
                    fixed: fixedSegmentWrapperElement,
                    fixedClone: fixedHeaderClone
                });
            }

            /**
             * @function removeResponsiveTransforms
             * @description Reverts the DOM transformations, restoring the grid to its original,
             *              non-responsive layout. This involves removing wrappers and the cloned segment.
             * @param {jQuery} processedGrid - The grid element (table) that was previously transformed.
             * @param {object} settings - The active plugin settings.
             */
            function removeResponsiveTransforms(processedGrid, settings) {
                const storedWrappers = processedGrid.data('responsiveGridWrappers');

                // Ensure wrappers exist before attempting to remove them.
                if (storedWrappers) {
                    // Remove the fixed segment clone and its dedicated wrapper.
                    if (storedWrappers.fixed && storedWrappers.fixedClone) {
                        storedWrappers.fixed.remove();
                    }

                    // Unwrap the main grid from its scrollable area wrapper.
                    // We check if the parent has the expected class to ensure we're unwrapping the correct element.
                    if (processedGrid.parent().hasClass(settings.scrollEnablingClass)) {
                        processedGrid.unwrap();
                    }

                    // Unwrap the main grid (which is now directly within the outer container)
                    // from the outermost container, restoring it to its original parent.
                    if (processedGrid.parent().hasClass(settings.outerContainerClass)) {
                        processedGrid.unwrap();
                    }

                    // Clean up the stored wrapper references from the grid's data.
                    processedGrid.removeData('responsiveGridWrappers');
                }
            }
        }
    });

})(window.jQuery); // Pass the global jQuery object to the IIFE to prevent conflicts.