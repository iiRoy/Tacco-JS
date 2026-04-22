(function($) {
    // Internal module state: a unique identifier generator for each plugin instance.
    let responsiveTableInstanceIdCounter = 0;

    /**
     * jQuery plugin: responsiveTableHider
     * Dynamically adjusts table column visibility to fit container width,
     * providing a toggle menu for manual control.
     *
     * @param {object} customConfiguration - User-defined settings to override defaults.
     * @returns {jQuery} The jQuery object to maintain chainability.
     */
    $.fn.responsiveTableHider = function(customConfiguration) {
        // Combine default settings with any provided custom configurations.
        // Deep merge is used to ensure nested objects are correctly overridden.
        const effectiveSettings = $.extend(true, {}, $.fn.responsiveTableHider.defaultOptions, customConfiguration);

        // Process each selected table element independently.
        return this.each(function() {
            const $currentTable = $(this);

            // Assign a unique runtime ID to this specific table's plugin instance.
            const instanceIdentifier = ++responsiveTableInstanceIdCounter;
            $currentTable.data('rth-instance-id', instanceIdentifier); // Store ID for easy retrieval.

            /**
             * Attempts to locate the very first data cell (TD) within the table body.
             * This cell is critical for inferring the table's header structure.
             * It's assumed to be in the second row (index 1) and first column (index 0)
             * if header rows exist, or the very first TD otherwise.
             */
            const $initialDataCell = $currentTable.find('tr:nth-child(2) td:first-child');

            // If no suitable data cell is found, this table cannot be processed.
            if ($initialDataCell.length === 0) {
                console.warn(`ResponsiveTableHider: Skipping table (ID: ${$currentTable.attr('id') || 'N/A'}) as its structure prevents proper initialization (missing data cells).`);
                return; // Move to the next table in the selection.
            }

            // Variables to store calculated header dimensions.
            let leadingHeaderColumnCount = 0; // Number of 'TH' cells acting as row headers.
            let topHeaderRowCounter = 0;    // Number of 'TR' elements serving as column headers.

            // Reference to the dynamically generated UI element for column controls.
            let $columnControlPanel = null;
            // State tracker for the visibility of the control panel.
            let isControlPanelVisible = false;

            /**
             * Utility function to debounce calls, useful for events like window resizing.
             * Prevents a function from being called too frequently.
             * @param {Function} func - The function to be debounced.
             * @param {number} delayMs - The delay in milliseconds before the function is executed.
             * @returns {Function} The debounced version of the function.
             */
            const createDebouncedFunction = (func, delayMs) => {
                let timerId;
                return function(...args) {
                    clearTimeout(timerId);
                    timerId = setTimeout(() => func.apply(this, args), delayMs);
                };
            };

            /**
             * Determines the count of header columns positioned before the data cells.
             * This involves inspecting 'TH' elements that are siblings preceding the first data cell.
             */
            const calculateLeadingHeaderCount = function() {
                let currentColumnTally = 0;
                // Find all 'TH' elements that immediately precede the first data cell within its row.
                const preDataHeaders = $initialDataCell.prevAll('th');

                // Iterate through these headers, factoring in any 'colspan' attributes.
                preDataHeaders.each((_index, headerElement) => {
                    const $header = $(headerElement);
                    const cellColspan = parseInt($header.attr('colspan'), 10);
                    currentColumnTally += (isNaN(cellColspan) || cellColspan < 1) ? 1 : cellColspan;
                });
                leadingHeaderColumnCount = currentColumnTally;
            };

            /**
             * Determines the number of header rows located above the primary data rows.
             * This is derived by counting the 'TR' elements that precede the row containing the first data cell.
             */
            const calculateTopHeaderRowCount = function() {
                // Find the parent row of the first data cell, then count all preceding rows.
                topHeaderRowCounter = $initialDataCell.parent('tr').prevAll('tr').length;
            };

            /**
             * Adjusts the visibility of table columns to ensure the table fits within its container.
             * This process iteratively hides columns from right-to-left until the table is no longer overflowing.
             */
            const adaptColumnVisibility = function() {
                // First, reset all columns to visible to get an accurate baseline for width calculation.
                $columnControlPanel.find('input[type="checkbox"]').prop('checked', true).trigger('change.rthPlugin');

                const containerWidth = $currentTable.parent().width();
                // Get all column control checkboxes, reversed, to hide from right-most first.
                const columnCheckboxes = $columnControlPanel.find('input[type="checkbox"]').get().reverse();

                // While the table's current width exceeds its parent's width AND there are columns to hide...
                while ($currentTable.width() > containerWidth && columnCheckboxes.length > 0) {
                    const nextCheckboxToHide = columnCheckboxes.shift(); // Get the next column to hide.
                    if (nextCheckboxToHide) {
                        nextCheckboxToHide.checked = false; // Uncheck it.
                        $(nextCheckboxToHide).trigger('change.rthPlugin'); // Trigger change to apply 'hidden' class.
                    }
                }

                // Update the text on the toggle button to reflect the number of currently hidden columns.
                const currentlyHiddenCount = $columnControlPanel.find('input[type="checkbox"]:not(:checked)').length;
                $columnControlPanel.prev('a.rth-toggle-trigger').html(effectiveSettings.statusMessageTemplate.replace('[NB]', currentlyHiddenCount));
            };

            /**
             * Toggles the display state (show/hide) of the column control panel.
             * @param {Event} event - The DOM event object, typically a click.
             */
            const handlePanelToggle = function(event) {
                event.preventDefault(); // Prevent default link behavior.
                $columnControlPanel.slideToggle(effectiveSettings.animationSpeed, function() {
                    isControlPanelVisible = $columnControlPanel.is(':visible');
                });
                $(this).toggleClass('is-active', !isControlPanelVisible); // Apply an 'active' class to the trigger.
            };

            /**
             * Constructs and appends a single list item containing a checkbox for column control.
             * @param {jQuery} $targetList - The UL element where the list item should be appended.
             * @param {string} headerElementId - The 'id' attribute of the corresponding table header.
             * @param {string} headerDisplayName - The text to display next to the checkbox.
             * @param {number} currentInstanceId - The unique ID of this plugin instance.
             * @returns {jQuery} The newly created LI element.
             */
            const createCheckboxListItem = function($targetList, headerElementId, headerDisplayName, currentInstanceId) {
                const checkboxInputId = `rth_col_ctrl_${currentInstanceId}_${headerElementId}`;
                const listItemHtml = `<li id="rth_list_item_${currentInstanceId}_${headerElementId}">
                    <label for="${checkboxInputId}">
                        <input type="checkbox" id="${checkboxInputId}" class="rth-column-toggle-input"
                               name="rth_cols_${currentInstanceId}[]" value="${headerElementId}" checked="checked" />
                        ${headerDisplayName}
                    </label>
                </li>`;
                const $newItem = $(listItemHtml);
                $targetList.append($newItem);
                return $newItem;
            };

            /**
             * Event handler for changes to individual column visibility checkboxes.
             * Toggles a CSS class on the associated table cells/headers.
             * @param {Event} event - The DOM event object.
             */
            const onCheckboxStateChange = function(event) {
                const $changedInput = $(event.currentTarget);
                const headerValue = $changedInput.val();
                const isChecked = $changedInput.is(':checked');

                // Find all table elements (TH/TD) that are associated with this header ID.
                // This includes the header cell itself and any data cells referencing it via 'headers' attribute.
                const relatedTableElements = $currentTable.find(`#${headerValue}, [headers~="${headerValue}"]`);

                // Add or remove the configured 'hidden' class based on the checkbox state.
                if (isChecked) {
                    relatedTableElements.removeClass(effectiveSettings.hiddenColumnClass);
                } else {
                    relatedTableElements.addClass(effectiveSettings.hiddenColumnClass);
                }
            };

            /**
             * Main initialization routine for the responsive table hider plugin.
             * Sets up the UI, calculates dimensions, and binds all necessary event handlers.
             */
            const initializePlugin = function() {
                // First, determine the table's header layout.
                calculateLeadingHeaderCount();
                calculateTopHeaderRowCount();

                // Construct the HTML structure for the column control interface.
                const $controlWrapper = $('<div>', {
                    class: effectiveSettings.controlWrapperClass
                });
                const $toggleLink = $('<a>', {
                    href: `#rth_panel_${instanceIdentifier}`,
                    class: 'rth-toggle-trigger',
                    text: effectiveSettings.statusMessageTemplate.replace('[NB]', '0') // Initial text, 0 hidden.
                });
                $columnControlPanel = $('<ul>', {
                    id: `rth_panel_${instanceIdentifier}`,
                    class: 'rth-column-panel'
                });

                $controlWrapper.append($toggleLink, $columnControlPanel);
                $currentTable.before($controlWrapper); // Insert control UI before the table.

                // The control panel is hidden by default.
                $columnControlPanel.hide();

                // Attach event listener to the toggle link.
                $toggleLink.on('click.rthPlugin', handlePanelToggle);

                // Select all 'TH' elements from the determined header rows.
                // We use `topHeaderRowCounter` to specify how many rows from the top are headers.
                const allHeaderCells = $currentTable.find(`tr:lt(${topHeaderRowCounter}) th`);

                // Iterate through each identified header cell to create a corresponding checkbox control.
                allHeaderCells.each((_index, headerCell) => {
                    const $header = $(headerCell);
                    const headerDisplayContent = $header.text().trim();
                    const headerUniqueId = $header.attr('id');

                    // Skip headers that lack text content or a valid ID (ID is crucial for linking).
                    if (!headerDisplayContent || !headerUniqueId) {
                        return;
                    }

                    // Parse the 'headers' attribute to identify any parent headers, suggesting nesting.
                    const parentHeaderIds = ($header.attr('headers') || '').split(' ').filter(Boolean);

                    let $targetUlForCheckbox = $columnControlPanel; // Default to the top-level UL.

                    if (parentHeaderIds.length > 0) {
                        // If a parent header is specified, attempt to find its corresponding LI.
                        const primaryParentId = parentHeaderIds[0];
                        let $parentLi = $(`#rth_list_item_${instanceIdentifier}_${primaryParentId}`);

                        if ($parentLi.length > 0) {
                            // If the parent LI exists, look for or create a nested UL inside it.
                            let $nestedUl = $parentLi.children('ul.rth-nested-controls');
                            if ($nestedUl.length === 0) {
                                $nestedUl = $('<ul>', { class: 'rth-nested-controls' });
                                $parentLi.append($nestedUl);
                            }
                            $targetUlForCheckbox = $nestedUl;
                        }
                        // If parent LI doesn't exist (e.g., due to parsing order), it falls back to top-level UL.
                    }
                    createCheckboxListItem($targetUlForCheckbox, headerUniqueId, headerDisplayContent, instanceIdentifier);
                });

                // Attach a single delegated event handler for all checkboxes within the control panel.
                $columnControlPanel.on('change.rthPlugin', 'input.rth-column-toggle-input', onCheckboxStateChange);

                // Perform an initial visibility adjustment immediately after setup.
                // Then, bind the debounced adjustment function to the window's resize event.
                $(function() {
                    adaptColumnVisibility();
                });
                $(window).on('resize.rthPlugin', createDebouncedFunction(adaptColumnVisibility, effectiveSettings.resizeDebounceTime));
            };

            // Kick off the initialization process for the current table.
            initializePlugin();
        });
    };

    /**
     * Default configuration options for the responsiveTableHider plugin.
     * These can be customized by passing an object to the plugin call.
     */
    $.fn.responsiveTableHider.defaultOptions = {
        statusMessageTemplate: "Hidden: [NB] columns", // Text format for the toggle link.
        controlWrapperClass: "rth-table-column-wrapper", // CSS class for the main control container.
        hiddenColumnClass: "rth-column-hidden", // CSS class applied to hidden table cells.
        animationSpeed: 250, // Duration of the toggle menu animation (milliseconds).
        resizeDebounceTime: 120 // Delay for debouncing the window resize event (milliseconds).
    };

}(jQuery));