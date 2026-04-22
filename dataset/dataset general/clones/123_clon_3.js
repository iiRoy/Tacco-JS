(function(jq) {
    /**
     * jQuery PairedSelectionBox plugin for enhanced list management.
     * Original concept by Alex van den Hoogen (Geodan B.V.)
     *
     * This plugin transforms a standard <select> element into a two-pane selection interface,
     * allowing users to easily move items between "available" and "selected" lists.
     *
     * Usage:
     *   Simply call the plugin on your target <select> element:
     *   $('my-select-element').PairedSelectionBox();
     *
     * Configuration:
     *   Options can be passed via data-* attributes on the <select> tag or as a JS object.
     *   Initial selections can also be provided. The widget can load data from a JSON endpoint.
     *   Refer to the default configuration for available parameters.
     */

    // Ensure jQuery is available
    if (!jq) {
        console.error("PairedSelectionBox requires jQuery to be loaded.");
        return;
    }

    /** Primary entry point for the PairedSelectionBox plugin. */
    jq.fn.PairedSelectionBox = function(configuration, initialSelections) {
        // Process each matched element to create a distinct widget instance.
        return this.each(function () {
            const defaultSettings = {
                targetElement:   jq(this).get(0), // The original select element
                dataSourceUrl:   'data/items.json', // URL for fetching item data
                valueProperty:   'id',             // Key for item value (e.g., <option value="X">)
                displayProperty: 'name',           // Key for item display text (e.g., <option>Y</option>)
                widgetTitle:     'Items',          // Overall title for the selection box
                loadViaJson:     true,             // Flag to indicate if data should be loaded from JSON
                filterDebounce:  400,              // Milliseconds to wait before filtering starts after keypress
                layoutHorizontal:false,            // Arrange lists side-by-side or stacked
                maxTextLength:   50,               // Max length of text displayed before truncation
                showMoveAllButtons: true,          // Enable/disable buttons to move all items
                allMoveThreshold: 300,             // Number of items above which a warning is displayed for 'move all'
                moveConfirmationMsg: 'Moving a large number of items might temporarily freeze your browser. Proceed?'
            };

            // Harvest options from HTML data attributes.
            const htmlAttributeSettings = {
                targetElement:   jq(this).get(0),
                dataSourceUrl:   jq(this).data('source-url'),
                valueProperty:   jq(this).data('value-key'),
                displayProperty: jq(this).data('display-key'),
                widgetTitle:     jq(this).data('box-title'),
                loadViaJson:     jq(this).data('json-load'),
                filterDebounce:  jq(this).data('filter-delay'),
                layoutHorizontal:jq(this).data('horizontal-layout'),
                maxTextLength:   jq(this).data('text-limit'),
                showMoveAllButtons: jq(this).data('enable-move-all'),
                allMoveThreshold: jq(this).data('move-all-limit')
            };

            // Merge settings: defaults < html attributes < provided configuration.
            const currentOptions = jq.extend({}, defaultSettings, htmlAttributeSettings, configuration);

            // Basic validation for critical options
            for (const key in currentOptions) {
                if (currentOptions.hasOwnProperty(key) && (currentOptions[key] === undefined || currentOptions[key] === null) && defaultSettings.hasOwnProperty(key)) {
                    // Only throw for critical options that have defaults.
                    // Data attributes might be null/undefined if not set.
                    // This check ensures core functionality options are present.
                    if (key === 'targetElement' || key === 'valueProperty' || key === 'displayProperty') {
                        console.warn(`PairedSelectionBox: Critical option '${key}' is undefined or null.`);
                    }
                }
            }

            // Generate a unique ID for the widget container
            const widgetIdentifier = 'paired-selection-box-' + (currentOptions.widgetTitle || 'widget').replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).substr(2, 9);
            currentOptions.containerId = widgetIdentifier;
            currentOptions.containerSelector = '#' + widgetIdentifier;

            // Ensure initial selections are an array, defaulting to empty.
            initialSelections = jq.isArray(initialSelections) ? initialSelections : [];

            // Main logic branch: load from JSON or use existing HTML options.
            if (currentOptions.loadViaJson) {
                fetchAndPopulate(currentOptions, initialSelections);
            } else {
                buildSelectionWidget(currentOptions);
            }
        });
    };

    /**
     * Fetches item data from a JSON endpoint and uses it to populate the select element.
     * @param {object} settings - Configuration settings for the widget.
     * @param {Array} preSelectedItems - Items already selected.
     */
    function fetchAndPopulate(settings, preSelectedItems) {
        let hasMultipleDisplayFields = false;
        let displayFieldKeys = [];

        // Check if the display property requires combining multiple JSON fields.
        if (typeof settings.displayProperty === 'string' && settings.displayProperty.includes(':')) {
            displayFieldKeys = settings.displayProperty.split(':').map(s => s.trim());
            if (displayFieldKeys.length > 1) {
                hasMultipleDisplayFields = true;
            }
        }

        jq.getJSON(settings.dataSourceUrl, function(jsonData) {
            if (!jq.isArray(jsonData)) {
                console.warn("PairedSelectionBox: JSON data is not an array. Cannot populate items.");
                buildSelectionWidget(settings); // Fallback to empty widget if JSON is malformed
                return;
            }

            jq.each(jsonData, function(idx, dataItem) {
                let itemText = '';

                if (hasMultipleDisplayFields) {
                    itemText = displayFieldKeys.map(key => dataItem[key] || '').join(' ');
                } else {
                    itemText = dataItem[settings.displayProperty];
                }

                // Create an option element.
                const newOption = jq('<option>', {
                    value: dataItem[settings.valueProperty],
                    text:  itemText,
                    selected: preSelectedItems.some(elem => elem[settings.valueProperty] === dataItem[settings.valueProperty])
                });
                newOption.appendTo(settings.targetElement);
            });

            buildSelectionWidget(settings);
        }).fail(function(jqxhr, textStatus, error) {
            console.error(`PairedSelectionBox: JSON data retrieval failed: ${textStatus}, ${error}`);
            buildSelectionWidget(settings); // Proceed with an empty widget if JSON fails
        });
    }

    /**
     * Attaches all necessary event handlers to buttons, filters, and form submission.
     * @param {object} settings - Configuration settings for the widget.
     */
    function attachEventHandlers(settings) {
        const availableList = jq(settings.containerSelector + ' .available-items');
        const chosenList = jq(settings.containerSelector + ' .chosen-items');
        const widgetRoot = jq(settings.containerSelector);

        // Map button data-type to action functions
        const actionMap = {
            'move-single-right': () => {
                availableList.find('option:selected').appendTo(chosenList);
                widgetRoot.find('[data-action="move-single-right"]').prop('disabled', true);
            },
            'move-all-right': () => {
                const availableCount = availableList.find('option').length;
                if (settings.showMoveAllButtons && availableCount >= settings.allMoveThreshold && !confirm(settings.moveConfirmationMsg)) {
                    return; // User cancelled
                }
                availableList.find('option').filter(function() { return jq(this).isDisplayed(); }).appendTo(chosenList);
            },
            'move-single-left': () => {
                chosenList.find('option:selected').appendTo(availableList);
                widgetRoot.find('[data-action="move-single-left"]').prop('disabled', true);
            },
            'move-all-left': () => {
                const chosenCount = chosenList.find('option').length;
                if (settings.showMoveAllButtons && chosenCount >= settings.allMoveThreshold && !confirm(settings.moveConfirmationMsg)) {
                    return; // User cancelled
                }
                chosenList.find('option').filter(function() { return jq(this).isDisplayed(); }).appendTo(availableList);
            }
        };

        // Click handlers for all control buttons
        widgetRoot.find('button.list-control-btn').on('click', function() {
            const actionType = jq(this).data('action');
            if (actionMap[actionType]) {
                actionMap[actionType]();
            }
            postTransferOperations(settings);
        });

        // Form submission handler to ensure all selected items are submitted
        widgetRoot.closest('form').on('submit', function() {
            chosenList.find('option').prop('selected', true);
        });

        // Prevent form submission on Enter key in filter fields
        widgetRoot.find('input.search-input').on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
            }
        });

        // Initialize filters and sorting
        chosenList.filterSelectOptions(widgetRoot.find('.filter-chosen'), settings.filterDebounce, settings.containerSelector).scrollTop(0).arrangeItemsAlphabetically();
        availableList.filterSelectOptions(widgetRoot.find('.filter-available'), settings.filterDebounce, settings.containerSelector).scrollTop(0).arrangeItemsAlphabetically();
    }

    /**
     * Orchestrates the construction of the dual list box after data is ready.
     * @param {object} settings - Configuration settings for the widget.
     */
    function buildSelectionWidget(settings) {
        renderMainStructure(settings);
        processInitialHtmlOptions(settings);
        attachEventHandlers(settings);
    }

    /**
     * Updates the displayed counts for available and chosen items.
     * @param {string} containerSelector - Selector for the widget's root container.
     */
    function updateItemCounts(containerSelector) {
        let availableVisibleCount = 0;
        let chosenVisibleCount = 0;

        jq(containerSelector + ' .available-items').find('option').each(function() {
            if (jq(this).isDisplayed()) { availableVisibleCount++; }
        });
        jq(containerSelector + ' .chosen-items').find('option').each(function() {
            if (jq(this).isDisplayed()) { chosenVisibleCount++; }
        });

        jq(containerSelector + ' .available-count').text(availableVisibleCount);
        jq(containerSelector + ' .chosen-count').text(chosenVisibleCount);

        manageButtonStates(containerSelector);
    }

    /**
     * Creates the main HTML structure for the dual list box.
     * @param {object} settings - Configuration settings for the widget.
     */
    function renderMainStructure(settings) {
        const originalParent = jq(settings.targetElement).parent();
        originalParent.attr('id', settings.containerId).addClass('row selection-widget-container');

        const colClass = settings.layoutHorizontal ? 'col-sm-6' : 'col-sm-5';
        const buttonColClass = settings.layoutHorizontal ? '' : 'col-sm-2 text-center'; // For vertical buttons

        const availableListHtml = `
            <div class="${colClass}">
                <h4><span class="available-list-title"></span> <small>- showing <span class="available-count"></span></small></h4>
                <input class="search-input form-control filter-available" type="text" placeholder="Filter available items" style="margin-bottom: 8px;">
                ${settings.layoutHorizontal ? generateControlButtonsHorizontal(1, settings.showMoveAllButtons) : ''}
                <select class="available-items form-control" style="height: 220px; width: 100%;" multiple></select>
            </div>`;

        const verticalButtonsHtml = settings.layoutHorizontal ? '' : `
            <div class="${buttonColClass}" style="margin-top: ${settings.showMoveAllButtons ? '90px' : '140px'};">
                ${settings.showMoveAllButtons ? '<button type="button" class="btn btn-primary btn-block list-control-btn" data-action="move-all-right" style="margin-bottom: 12px;"><i class="fa fa-angle-double-right"></i> All &gt;&gt;</button>' : ''}
                <button type="button" class="btn btn-primary btn-block list-control-btn" data-action="move-single-right" style="margin-bottom: 25px;" disabled><i class="fa fa-angle-right"></i> Selected &gt;</button>
                <button type="button" class="btn btn-primary btn-block list-control-btn" data-action="move-single-left" style="margin-bottom: 12px;" disabled><i class="fa fa-angle-left"></i> &lt; Selected</button>
                ${settings.showMoveAllButtons ? '<button type="button" class="btn btn-primary btn-block list-control-btn" data-action="move-all-left" style="margin-bottom: 12px;"><i class="fa fa-angle-double-left"></i> &lt;&lt; All</button>' : ''}
            </div>`;

        const chosenListHtml = `
            <div class="${colClass}">
                <h4><span class="chosen-list-title"></span> <small>- showing <span class="chosen-count"></span></small></h4>
                <input class="search-input form-control filter-chosen" type="text" placeholder="Filter selected items" style="margin-bottom: 8px;">
                ${settings.layoutHorizontal ? generateControlButtonsHorizontal(2, settings.showMoveAllButtons) : ''}
                <select class="chosen-items form-control" style="height: 220px; width: 100%;" multiple></select>
            </div>`;

        originalParent.append(availableListHtml + verticalButtonsHtml + chosenListHtml);

        // Transfer the original select's name attribute to the 'chosen' list for form submission.
        jq(settings.containerSelector + ' .chosen-items').prop('name', jq(settings.targetElement).prop('name'));
        jq(settings.containerSelector + ' .available-list-title').text('Available ' + settings.widgetTitle);
        jq(settings.containerSelector + ' .chosen-list-title').text('Selected ' + settings.widgetTitle);
    }

    /**
     * Generates HTML for horizontal control buttons.
     * @param {number} position - 1 for left side, 2 for right side.
     * @param {boolean} includeMoveAll - Whether to include 'move all' buttons.
     * @returns {string} HTML string for buttons.
     */
    function generateControlButtonsHorizontal(position, includeMoveAll) {
        const btnClass = includeMoveAll ? 'col-sm-6' : 'col-sm-12';
        const commonStyle = 'margin-bottom: 8px;';

        if (position === 1) { // Buttons for the "available" side
            return `
                ${includeMoveAll ? `<button type="button" class="btn btn-default list-control-btn ${btnClass}" data-action="move-all-right" style="${commonStyle}"><i class="fa fa-angle-double-right"></i></button>` : ''}
                <button type="button" class="btn btn-default list-control-btn ${btnClass} pull-right" data-action="move-single-right" style="${commonStyle}" disabled><i class="fa fa-angle-right"></i></button>
            `;
        } else { // Buttons for the "chosen" side
            return `
                <button type="button" class="btn btn-default list-control-btn ${btnClass}" data-action="move-single-left" style="${commonStyle}" disabled><i class="fa fa-angle-left"></i></button>
                ${includeMoveAll ? `<button type="button" class="btn btn-default list-control-btn ${btnClass} pull-right" data-action="move-all-left" style="${commonStyle}"><i class="fa fa-angle-double-left"></i></button>` : ''}
            `;
        }
    }

    /**
     * Executes actions after items are moved between lists.
     * @param {object} settings - Configuration settings for the widget.
     */
    function postTransferOperations(settings) {
        const widgetRoot = jq(settings.containerSelector);

        // Deselect all options in both lists to ensure a clean state
        widgetRoot.find('.available-items option:selected').prop('selected', false);
        widgetRoot.find('.chosen-items option:selected').prop('selected', false);

        // Clear filter inputs and show all options again
        widgetRoot.find('.search-input').val('');
        widgetRoot.find('select option').show(); // Ensure all items are visible after a move

        // Re-count and update button states
        updateItemCounts(settings.containerSelector);
    }

    /**
     * Processes options from the original HTML select element, moving them to the appropriate new lists.
     * @param {object} settings - Configuration settings for the widget.
     */
    function processInitialHtmlOptions(settings) {
        const originalSelect = jq(settings.targetElement);
        const needsTruncation = settings.maxTextLength > 0;

        originalSelect.find('option').each(function() {
            const currentOption = jq(this);
            const originalText = currentOption.text();

            // Store original text for potential tooltips
            currentOption.data('full-text', originalText);

            // Truncate display text if needed
            if (needsTruncation && originalText.length > settings.maxTextLength) {
                currentOption.text(originalText.substring(0, settings.maxTextLength) + '...');
                currentOption.prop('title', originalText); // Use full text as tooltip
            }

            // Move option to either 'chosen' or 'available' list based on its 'selected' state.
            if (currentOption.is(':selected')) {
                currentOption.appendTo(settings.containerSelector + ' .chosen-items');
            } else {
                currentOption.appendTo(settings.containerSelector + ' .available-items');
            }
        });

        originalSelect.remove(); // Remove the original select element from the DOM.
        postTransferOperations(settings); // Initialize counts and button states.
    }

    /**
     * Manages the disabled/enabled states of the control buttons based on list contents.
     * @param {string} containerSelector - Selector for the widget's root container.
     */
    function manageButtonStates(containerSelector) {
        const availableList = jq(containerSelector + ' .available-items');
        const chosenList = jq(containerSelector + ' .chosen-items');
        const widgetRoot = jq(containerSelector);

        // Enable/disable single move buttons based on selection changes
        availableList.off('change').on('change', function() {
            widgetRoot.find('[data-action="move-single-right"]').prop('disabled', availableList.find('option:selected').length === 0);
        });
        chosenList.off('change').on('change', function() {
            widgetRoot.find('[data-action="move-single-left"]').prop('disabled', chosenList.find('option:selected').length === 0);
        });

        // Enable/disable 'move all' buttons based on list emptiness
        widgetRoot.find('[data-action="move-all-right"]').prop('disabled', availableList.find('option').length === 0);
        widgetRoot.find('[data-action="move-all-left"]').prop('disabled', chosenList.find('option').length === 0);

        // Ensure single move buttons are disabled if no items are selected after a full move
        if (availableList.find('option:selected').length === 0) {
            widgetRoot.find('[data-action="move-single-right"]').prop('disabled', true);
        }
        if (chosenList.find('option:selected').length === 0) {
            widgetRoot.find('[data-action="move-single-left"]').prop('disabled', true);
        }
    }

    /**
     * jQuery plugin method to filter options within a select element.
     * Hides options that do not match the text in the provided search field.
     * @param {jQuery} searchField - The input field used for searching.
     * @param {number} debounceDelay - Delay in milliseconds for debouncing the search.
     * @param {string} widgetContainer - Selector for the parent widget container to update counts.
     * @returns {jQuery} The select element itself for chaining.
     */
    jq.fn.filterSelectOptions = function(searchField, debounceDelay, widgetContainer) {
        return this.each(function() {
            const currentSelect = this;
            let cachedOptions = [];

            // Cache all options and their original text for efficient filtering
            jq(currentSelect).find('option').each(function() {
                cachedOptions.push({ value: jq(this).val(), text: jq(this).data('full-text') || jq(this).text(), element: this });
            });
            jq(currentSelect).data('full-options-cache', cachedOptions);

            searchField.on('input', function() {
                debounce(function() {
                    const filterValue = jq.trim(searchField.val()).toLowerCase();
                    const regex = new RegExp(filterValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // Escape special chars

                    jq(currentSelect).data('full-options-cache').forEach(item => {
                        const optionElement = jq(item.element);
                        if (filterValue === '' || regex.test(item.text)) {
                            optionElement.show();
                        } else {
                            optionElement.hide();
                        }
                    });
                    updateItemCounts(widgetContainer); // Update counts after filtering
                }, debounceDelay);
            });
        });
    };

    /**
     * jQuery plugin method to check if an element is currently displayed (not hidden by CSS).
     * This is a more robust check than :visible for elements potentially hidden by `display: none` or `visibility: hidden`.
     * @returns {boolean} True if the element is displayed, false otherwise.
     */
    jq.fn.isDisplayed = function() {
        // Check for both display:none and visibility:hidden styles.
        // Also check if the element has 0 width or height, which implies it's not truly visible.
        const elem = this[0];
        if (!elem) return false;

        const style = window.getComputedStyle(elem);
        return style.display !== 'none' && style.visibility !== 'hidden' && elem.offsetWidth > 0 && elem.offsetHeight > 0;
    };

    /**
     * jQuery plugin method to sort options within a select element alphabetically by text.
     * @returns {jQuery} The select element itself for chaining.
     */
    jq.fn.arrangeItemsAlphabetically = function() {
        return this.each(function() {
            const selectElement = jq(this);
            const sortedOptions = selectElement.find('option').detach().sort(function(a, b) {
                const textA = jq(a).text().toUpperCase();
                const textB = jq(b).text().toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            selectElement.append(sortedOptions);
        });
    };

    /**
     * A simple debouncing utility function.
     * Delays the execution of a function until after a specified interval has passed
     * without any further invocations of that function.
     * @returns {Function} The debounced function wrapper.
     */
    const debounce = (function() {
        let timerHandle = 0;
        return function (funcToDebounce, delayMs) {
            clearTimeout(timerHandle);
            timerHandle = setTimeout(funcToDebounce, delayMs);
        };
    })();

})(jQuery);