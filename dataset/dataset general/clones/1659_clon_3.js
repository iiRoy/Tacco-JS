!function(jQ) {
    /**
     * @class PaginationWidget
     * @description Core constructor for the pagination control.
     * @param {HTMLElement} targetElement - The DOM element to attach the pagination to.
     * @param {object} componentSettings - Configuration options for the pagination.
     */
    const PaginationWidget = function(targetElement, componentSettings) {
        // Store the jQuery wrapped root element
        this._rootElementJq = jQ(targetElement);
        // Store the merged configuration settings
        this._componentConfiguration = componentSettings;
        // Reference to the linked grid component (set during initialization)
        this._linkedGridInstance = null;
    };

    // Define prototype methods for the PaginationWidget
    PaginationWidget.prototype = {
        /**
         * Initializes the DOM structure and binds basic event handlers.
         * This method sets up the visual components of the pager.
         * @private
         */
        _establishDomStructure: function() {
            const selfRef = this;
            const containerJq = this._rootElementJq;
            const currentConfig = this._componentConfiguration;

            // Apply a base class for styling
            containerJq.addClass("pagination-control-container");

            // Define the core HTML components using template literals for clarity
            const componentHtml = `
                <div class="record-count-display" aria-live="polite"></div>
                <ul class="page-link-list" role="navigation" aria-label="Pagination Navigation"></ul>
                <div class="page-size-selection">
                    <label for="page-size-dropdown-${containerJq.attr('id') || Math.random().toString(36).substring(2, 11)}" class="sr-only">${currentConfig.sizeLabelTemplate.replace(/\{0\}/, '')}</label>
                    <select id="page-size-dropdown-${containerJq.attr('id') || Math.random().toString(36).substring(2, 11)}" aria-controls="${selfRef._linkedGridInstance ? selfRef._linkedGridInstance.attr('id') : ''}"></select>
                </div>
            `;
            containerJq.append(jQ(componentHtml));

            // Cache references to key DOM elements
            this._totalRecordDisplay = containerJq.find('.record-count-display');
            this._pageNavigationList = containerJq.find('.page-link-list');
            this._pageSizeDropdown = containerJq.find('.page-size-selection select');

            const pageSizeControl = this._pageSizeDropdown;

            // Populate the page size dropdown with options from settings
            currentConfig.pageSizeOptions.forEach(function(sizeOption) {
                const optionElement = jQ('<option></option>')
                    .prop('value', sizeOption)
                    .text(selfRef.interpolateString(currentConfig.sizeLabelTemplate, [sizeOption]));
                pageSizeControl.append(optionElement);
            });

            // Attach change event handler for page size selection
            pageSizeControl.on('change', function() {
                // When page size changes, reset to the first page
                containerJq.data('current-page-index', 1);
                // Trigger a data refresh on the linked grid
                if (selfRef._linkedGridInstance && typeof selfRef._linkedGridInstance.refreshData === 'function') {
                    selfRef._linkedGridInstance.refreshData();
                } else {
                    console.warn("Linked grid instance or refreshData method not found.");
                }
            });
        },

        /**
         * Generates and renders the sequence of page number links.
         * This is the core logic for displaying page numbers (e.g., 1, 2, ..., 5, 6, 7, ..., 10).
         * @private
         * @param {number} currentPageIndex - The currently active page number.
         * @param {number} totalRecords - The total number of items across all pages.
         * @param {number} recordsPerPage - The number of items to display per page.
         */
        _buildPageLinks: function(currentPageIndex, totalRecords, recordsPerPage) {
            const selfRef = this;
            const containerJq = this._rootElementJq;
            const pageListContainerJq = this._pageNavigationList;

            // Clear previous page links
            pageListContainerJq.empty();

            // Guard against invalid recordsPerPage or zero totalRecords
            if (recordsPerPage <= 0 || totalRecords <= 0) {
                pageListContainerJq.html('<li class="no-pages-info">No pages available</li>');
                return;
            }

            // Calculate total number of pages, ensuring it's at least 1 if totalRecords > 0
            const totalPagesCount = Math.ceil(totalRecords / recordsPerPage) || 1;

            // Adjust currentPageIndex to be within valid bounds
            let validatedPageIndex = Math.max(1, Math.min(currentPageIndex, totalPagesCount));
            containerJq.data('current-page-index', validatedPageIndex); // Update stored page data

            // Helper function to create a page list item
            const createPageListItem = (label, value, isDisabled, isActive, isEllipsis) => {
                const listItem = jQ('<li></li>');
                const link = jQ('<a></a>').attr('href', '#');

                if (isEllipsis) {
                    listItem.addClass('page-ellipsis').text('...');
                } else {
                    link.text(label).attr('aria-label', `Go to page ${label}`);
                    listItem.append(link);

                    if (isDisabled) {
                        listItem.addClass('control-disabled').attr('aria-disabled', 'true');
                        link.attr('tabindex', '-1'); // Make disabled links not focusable
                    } else if (isActive) {
                        listItem.addClass('current-page-marker').attr('aria-current', 'page');
                        link.attr('tabindex', '-1'); // Active link not focusable, handled by aria-current
                    } else {
                        link.prop('title', `Navigate to page ${value}`);
                        link.on('click', (e) => {
                            e.preventDefault();
                            containerJq.data('current-page-index', value);
                            selfRef._linkedGridInstance.refreshData();
                        });
                    }
                }
                return listItem;
            };

            // Add 'First' page button
            pageListContainerJq.append(
                createPageListItem('« First', 1, validatedPageIndex === 1)
            );

            // Add 'Previous' button
            pageListContainerJq.append(
                createPageListItem('‹ Previous', validatedPageIndex - 1, validatedPageIndex === 1)
            );

            // Determine visible page range
            const maxVisiblePages = 5; // e.g., [1] ... [4] [5] [6] ... [10]
            const pageWindowStart = Math.max(2, validatedPageIndex - Math.floor(maxVisiblePages / 2));
            const pageWindowEnd = Math.min(totalPagesCount - 1, validatedPageIndex + Math.floor(maxVisiblePages / 2));

            // Always show page 1
            if (totalPagesCount > 0) {
                pageListContainerJq.append(createPageListItem(1, 1, false, validatedPageIndex === 1));
            }

            // Add ellipsis if needed after page 1
            if (pageWindowStart > 2) {
                pageListContainerJj.append(createPageListItem(null, null, true, false, true));
            }

            // Add pages within the calculated window
            for (let i = pageWindowStart; i <= pageWindowEnd; i++) {
                pageListContainerJq.append(createPageListItem(i, i, false, validatedPageIndex === i));
            }

            // Add ellipsis if needed before the last page
            if (pageWindowEnd < totalPagesCount - 1) {
                pageListContainerJq.append(createPageListItem(null, null, true, false, true));
            }

            // Always show the last page if totalPagesCount > 1 and it's not already shown
            if (totalPagesCount > 1 && validatedPageIndex !== totalPagesCount) {
                pageListContainerJq.append(createPageListItem(totalPagesCount, totalPagesCount, false, validatedPageIndex === totalPagesCount));
            } else if (totalPagesCount > 1 && validatedPageIndex === totalPagesCount) { // Last page is current
                pageListContainerJq.append(createPageListItem(totalPagesCount, totalPagesCount, false, true));
            }


            // Add 'Next' button
            pageListContainerJq.append(
                createPageListItem('Next ›', validatedPageIndex + 1, validatedPageIndex === totalPagesCount)
            );

            // Add 'Last' page button
            pageListContainerJq.append(
                createPageListItem('Last »', totalPagesCount, validatedPageIndex === totalPagesCount)
            );

            // If only one page, hide navigation controls
            if (totalPagesCount <= 1) {
                pageListContainerJq.find('.page-link-list li:not(.current-page-marker)').hide();
            }
        },

        /**
         * Updates the pagination component with new data (e.g., after a grid load).
         * @param {object} [payload] - Object containing page, totalCount, and limit parameters.
         */
        updatePaginationState: function(payload) {
            const containerJq = this._rootElementJq;
            const pageSizeDropdownJq = this._pageSizeDropdown;
            const currentSettings = this._componentConfiguration;

            const dataPayload = payload || {};

            // Determine the active page index
            let activePage = dataPayload[currentSettings.pageKey];
            if (activePage === undefined || activePage === null) {
                activePage = containerJq.data('current-page-index') || currentSettings.initialPage;
            }
            containerJq.data('current-page-index', activePage);

            // Determine the total item count
            let totalItemCount = dataPayload[currentSettings.totalCountKey];
            if (totalItemCount === undefined || totalItemCount === null || isNaN(totalItemCount)) {
                totalItemCount = 0;
            }
            containerJq.data('total-records', totalItemCount);

            // Determine the number of items per page (limit)
            let itemsPerPage = dataPayload[currentSettings.limitKey];
            if (!itemsPerPage) {
                itemsPerPage = pageSizeDropdownJq.val() || currentSettings.initialLimit;
            }
            // Ensure the dropdown reflects the current limit
            pageSizeDropdownJq.val(itemsPerPage);

            // Update the total record count display
            this._totalRecordDisplay.html(this.interpolateString(currentSettings.totalCountTemplate, [totalItemCount]));

            // Rebuild the page links based on the new state
            this._buildPageLinks(activePage, totalItemCount, itemsPerPage);
        },

        /**
         * Replaces placeholders in a string with provided arguments.
         * E.g., "Hello {0}" with ["World"] becomes "Hello World".
         * @param {string} templateString - The string template with {0}, {1} placeholders.
         * @param {Array<any>} replacements - An array of values to substitute.
         * @returns {string} The formatted string.
         */
        interpolateString: function(templateString, replacements) {
            if (!Array.isArray(replacements)) {
                replacements = [replacements]; // Ensure replacements is an array
            }
            return templateString.replace(/{(\d+)}/g, function(match, number) {
                return typeof replacements[number] !== 'undefined' ?
                    replacements[number] :
                    match; // If replacement not found, keep the placeholder
            });
        },

        /**
         * Retrieves the current pagination parameters (page, limit).
         * @returns {object} An object containing the current page and limit.
         */
        retrieveCurrentParameters: function() {
            const currentSettings = this._componentConfiguration;
            const containerJq = this._rootElementJq;
            const pageSizeDropdownJq = this._pageSizeDropdown;

            const currentRequestParameters = {};
            currentRequestParameters[currentSettings.pageKey] = containerJq.data('current-page-index');
            currentRequestParameters[currentSettings.limitKey] = pageSizeDropdownJq.val();
            return currentRequestParameters;
        },

        /**
         * Initializes the pagination widget and links it to a grid component.
         * @param {jQuery} targetGridInstance - The jQuery object representing the linked grid.
         */
        initializeComponent: function(targetGridInstance) {
            const selfRef = this;
            const componentOptions = selfRef._componentConfiguration;

            // Validate the linked grid instance
            if (!targetGridInstance || !(targetGridInstance instanceof jQ)) {
                console.error("Invalid grid instance provided for pagination initialization.");
                return;
            }
            this._linkedGridInstance = targetGridInstance;

            // Set up the DOM and events for pagination
            this._establishDomStructure();

            // Attach event listener for when the linked grid finishes loading data
            this._linkedGridInstance.on('dataLoaded', function(event, loadedData) {
                selfRef.updatePaginationState(loadedData);
            });

            // Initialize pagination state with default values or initial options
            const initialStateParams = {};
            initialStateParams[componentOptions.totalCountKey] = 0; // Start with 0 records
            initialStateParams[componentOptions.pageKey] = componentOptions.initialPage;
            initialStateParams[componentOptions.limitKey] = componentOptions.initialLimit;
            this.updatePaginationState(initialStateParams);

            // Custom logic for grid's row index column (if applicable)
            if (targetGridInstance.opts && targetGridInstance.opts.indexCol) {
                const rowNumberColumn = targetGridInstance.opts.cols[0]; // Assuming index col is first
                if (rowNumberColumn) {
                    rowNumberColumn.renderFunction = function(value, item, rowIndex) {
                        const currentParams = selfRef.retrieveCurrentParameters();
                        const currentPage = parseInt(currentParams[componentOptions.pageKey], 10) || 1;
                        const itemsPerPage = parseInt(currentParams[componentOptions.limitKey], 10) || 1;
                        const calculatedIndex = rowIndex + 1 + ((currentPage - 1) * itemsPerPage);
                        return `<span class="grid-row-index">${calculatedIndex}</span>`;
                    };
                }
            }
        }
    };

    /**
     * jQuery plugin definition for DataGridPager.
     * Allows users to initialize and interact with the pagination widget via jQuery.
     */
    jQ.fn.dataGridPager = function() {
        const methodArgs = [...arguments]; // Convert arguments to a real array

        if (methodArgs.length === 0 || typeof methodArgs[0] === 'object') {
            const pluginOptions = methodArgs[0];
            let instanceData = this.data('gridPagination'); // Check for existing instance

            // Merge user options with defaults
            const mergedOptions = jQ.extend(true, {}, jQ.fn.dataGridPager.defaults, pluginOptions);

            if (!instanceData) {
                // No instance found, create a new one
                instanceData = new PaginationWidget(this[0], mergedOptions);
                this.data('gridPagination', instanceData); // Store instance on the element
            }
            // Return the jQuery object, optionally extended with the instance (for chaining)
            return jQ.extend(true, this, instanceData);
        }

        // If the first argument is a string, it's a method call
        if (typeof methodArgs[0] === 'string') {
            const methodName = methodArgs[0];
            const instanceData = this.data('gridPagination');

            if (!instanceData) {
                console.error(`Pagination widget not initialized on this element. Cannot call method "${methodName}".`);
                return undefined;
            }

            const targetMethod = instanceData[methodName];
            if (typeof targetMethod === 'function') {
                // Call the method with remaining arguments
                return targetMethod.apply(instanceData, methodArgs.slice(1));
            } else {
                console.error(`Method "${methodName}" does not exist on PaginationWidget prototype.`);
                return undefined;
            }
        }
    };

    /**
     * Default configuration options for the PaginationWidget.
     */
    jQ.fn.dataGridPager.defaults = {
        displayMode: 'basic', // Could be 'basic', 'full', 'compact' etc. (not fully implemented in _buildPageLinks, but a good addition)
        totalCountKey: 'totalItems', // Parameter name for total items in data payload
        initialPage: 1, // Default starting page
        pageKey: 'pageNumber', // Parameter name for page number in request
        limitKey: 'itemsPerPage', // Parameter name for items per page in request
        sizeLabelTemplate: 'Show {0} items', // Template for page size dropdown options
        totalCountTemplate: 'Total: <span>{0}</span> records', // Template for total record count display
        initialLimit: 20, // Default items per page if not specified
        pageSizeOptions: [10, 20, 50, 100], // Available options for items per page
        debugMode: false // Enable console logging for debugging
    };

    // Expose the constructor for advanced usage if needed
    jQ.fn.dataGridPager.Constructor = PaginationWidget;

}(window.jQuery);