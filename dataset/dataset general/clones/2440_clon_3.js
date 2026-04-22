;
(function(jq) {
    // This script facilitates dynamic content pagination within DOM elements.
    // Based on an original concept by Wes Nolte.
    // Licensed under the MIT License.

    jq.fn.paginateContent = function(userSettings) {

        // Keys for storing state data on the root element.
        const currentPageIndexKey = 'current_page_idx';
        const entriesPerPageKey = 'entries_per_view';

        // Default configuration for the pagination system.
        const standardSettings = {
            content_selector: '.content', // Selector for the container holding paginated items
            entries_per_view: 10, // Number of items to display per page
            nav_panel_selector: '.page_navigation', // Selector for the navigation control panel
            info_display_selector: '.info_text', // Selector for the text displaying page info
            max_nav_links: 20, // Maximum number of page number links to show
            initial_page: 0, // The page to display on load (0-indexed)
            cycle_navigation: false, // Whether to wrap around from first to last page and vice-versa
            first_label: 'First', // Text for the 'first page' link
            previous_label: 'Prev', // Text for the 'previous page' link
            next_label: 'Next', // Text for the 'next page' link
            last_label: 'Last', // Text for the 'last page' link
            nav_sequence: ["first", "prev", "num", "next", "last"], // Order of navigation elements
            info_template: 'Displaying {0}-{1} of {2} items', // Template for information text
            show_first_last_buttons: true, // Whether to include 'first' and 'last' buttons
            use_jquery_ui: false, // Flag to enable jQuery UI styling classes
            ui_active_class: "ui-state-highlight", // jQuery UI class for active state
            ui_default_class: "ui-state-default", // jQuery UI class for default state
            ui_disabled_class: "ui-state-disabled", // jQuery UI class for disabled state
            onPageViewed: null // Callback function when a new page is displayed
        };

        // Merge default and user-provided settings.
        const configOptions = jq.extend(true, {}, standardSettings, userSettings);

        // Determine UI classes based on configuration.
        const uiBaseClass = configOptions.use_jquery_ui ? configOptions.ui_default_class : '';
        const uiActiveClass = configOptions.use_jquery_ui ? configOptions.ui_active_class : '';
        const uiDisabledClass = configOptions.use_jquery_ui ? configOptions.ui_disabled_class : '';

        // Internal variables, scoped to the plugin instance.
        let rootScope; // The main element calling the plugin
        let contentArea; // The container holding the actual items
        let contentUnits; // All individual items to be paginated
        let navigationZones; // All navigation panels
        let totalNavPages; // Total number of page links generated

        /**
         * Retrieves the current pagination state from a given element.
         * @param {jQuery} element - The jQuery element to retrieve state from.
         * @returns {object} The pagination state object.
         */
        function _getState(element) {
            let state = element.data('pagination_state');
            if (!state) {
                state = {
                    currentPage: configOptions.initial_page,
                    itemsPerPage: configOptions.entries_per_view
                };
                element.data('pagination_state', state);
            }
            return state;
        }

        /**
         * Sets a specific property in the pagination state for a given element.
         * @param {jQuery} element - The jQuery element to update state for.
         * @param {string} key - The key of the state property.
         * @param {*} value - The value to set.
         */
        function _setState(element, key, value) {
            let state = _getState(element);
            state[key] = value;
            element.data('pagination_state', state);
        }

        /**
         * Initializes the pagination for each matched element.
         * This function is called for every element in the jQuery collection.
         */
        function _initializePagination() {
            rootScope = jq(this);
            contentArea = rootScope.find(configOptions.content_selector);
            contentUnits = contentArea.children();

            // Set initial state for the root element.
            _setState(rootScope, 'currentPage', configOptions.initial_page);
            _setState(rootScope, 'itemsPerPage', configOptions.entries_per_view);

            const totalUnitsCount = contentUnits.length;
            const calculatedPageCount = Math.ceil(totalUnitsCount / configOptions.entries_per_view);

            // Construct navigation bar HTML.
            const ellipsisMoreMarker = '<span class="pager-ellipsis pager-more">...</span>';
            const ellipsisLessMarker = '<span class="pager-ellipsis pager-less">...</span>';
            const firstNavBtnHtml = !configOptions.show_first_last_buttons ? '' : `<a class="pager-first ${uiBaseClass}" href="#">${configOptions.first_label}</a>`;
            const lastNavBtnHtml = !configOptions.show_first_last_buttons ? '' : `<a class="pager-last ${uiBaseClass}" href="#">${configOptions.last_label}</a>`;

            let navBarMarkup = "";
            for (let k = 0; k < configOptions.nav_sequence.length; k++) {
                switch (configOptions.nav_sequence[k]) {
                    case "first":
                        navBarMarkup += firstNavBtnHtml;
                        break;
                    case "last":
                        navBarMarkup += lastNavBtnHtml;
                        break;
                    case "next":
                        navBarMarkup += `<a class="pager-next ${uiBaseClass}" href="#">${configOptions.next_label}</a>`;
                        break;
                    case "prev":
                        navBarMarkup += `<a class="pager-prev ${uiBaseClass}" href="#">${configOptions.previous_label}</a>`;
                        break;
                    case "num":
                        navBarMarkup += ellipsisLessMarker;
                        for (let pageIdx = 0; pageIdx < calculatedPageCount; pageIdx++) {
                            navBarMarkup += `<a class="pager-link ${uiBaseClass}" href="#" data-page-index="${pageIdx}">${pageIdx + 1}</a>`;
                        }
                        navBarMarkup += ellipsisMoreMarker;
                        break;
                    default:
                        // Ignore unknown navigation elements.
                        break;
                }
            }

            // Apply the generated navigation HTML to all navigation zones.
            navigationZones = rootScope.find(configOptions.nav_panel_selector);
            navigationZones.html(navBarMarkup).each(function() {
                jq(this).find('.pager-link:first').addClass('first');
                jq(this).find('.pager-link:last').addClass('last');
            });

            // Initially hide ellipsis markers.
            navigationZones.children('.pager-ellipsis').hide();

            // Hide all content units initially.
            contentUnits.hide();

            // Determine the total number of page links created.
            totalNavPages = rootScope.find(configOptions.nav_panel_selector + ':first').children('.pager-link').length;
            configOptions.max_nav_links = Math.min(configOptions.max_nav_links, totalNavPages);

            // Hide all page links and then show only the initial set.
            navigationZones.children('.pager-link').hide();
            navigationZones.each(function() {
                jq(this).children('.pager-link').slice(0, configOptions.max_nav_links).show();
            });

            // Bind event handlers for navigation controls.
            rootScope.on('click', '.pager-first', function(evt) {
                evt.preventDefault();
                _shiftNavRight(jq(this), 0);
                _navigateToPage(0);
            });

            rootScope.on('click', '.pager-last', function(evt) {
                evt.preventDefault();
                const lastPageIndex = totalNavPages - 1;
                _shiftNavLeft(jq(this), lastPageIndex);
                _navigateToPage(lastPageIndex);
            });

            rootScope.on('click', '.pager-prev', function(evt) {
                evt.preventDefault();
                _displayPreviousView(jq(this));
            });

            rootScope.on('click', '.pager-next', function(evt) {
                evt.preventDefault();
                _displayNextView(jq(this));
            });

            rootScope.on('click', '.pager-link', function(evt) {
                evt.preventDefault();
                _navigateToPage(parseInt(jq(this).attr('data-page-index'), 10));
            });

            // Navigate to the initial page.
            _navigateToPage(parseInt(configOptions.initial_page, 10));
            _updateEllipsisVisibility();
            if (!configOptions.cycle_navigation) {
                _markBoundaryNav();
            }
        }

        /**
         * Displays the previous page of content.
         * @param {jQuery} clickedElement - The navigation element that was clicked.
         */
        function _displayPreviousView(clickedElement) {
            const currentState = _getState(rootScope);
            let targetPageIndex = currentState.currentPage - 1;

            if (clickedElement.siblings('.active-page').prev('.pager-link').length > 0) {
                _shiftNavRight(clickedElement, targetPageIndex);
                _navigateToPage(targetPageIndex);
            } else if (configOptions.cycle_navigation) {
                _navigateToPage(totalNavPages - 1);
            }
        }

        /**
         * Displays the next page of content.
         * @param {jQuery} clickedElement - The navigation element that was clicked.
         */
        function _displayNextView(clickedElement) {
            const currentState = _getState(rootScope);
            let targetPageIndex = currentState.currentPage + 1;

            if (clickedElement.siblings('.active-page').next('.pager-link').length > 0) {
                _shiftNavLeft(clickedElement, targetPageIndex);
                _navigateToPage(targetPageIndex);
            } else if (configOptions.cycle_navigation) {
                _navigateToPage(0);
            }
        }

        /**
         * Navigates to a specific page, updating content and navigation.
         * @param {number} targetPageIndex - The 0-indexed page number to navigate to.
         */
        function _navigateToPage(targetPageIndex) {
            targetPageIndex = parseInt(targetPageIndex, 10);
            if (isNaN(targetPageIndex) || targetPageIndex < 0 || targetPageIndex >= totalNavPages) {
                // Invalid page index, do nothing or log an error.
                return;
            }

            const currentState = _getState(rootScope);
            const unitsPerPage = currentState.itemsPerPage;

            // Calculate the start and end indices for the current page's items.
            const sliceStartIdx = targetPageIndex * unitsPerPage;
            const sliceEndIdx = sliceStartIdx + unitsPerPage;

            // Hide all content units, then show only the ones for the target page.
            const visibleItems = contentUnits.hide().slice(sliceStartIdx, sliceEndIdx);
            visibleItems.show();

            // Update active class on page links.
            navigationZones.children(`.pager-link[data-page-index=${targetPageIndex}]`)
                .addClass(`active-page ${uiActiveClass}`)
                .siblings('.active-page')
                .removeClass(`active-page ${uiActiveClass}`);

            // Store the new current page index.
            _setState(rootScope, 'currentPage', targetPageIndex);

            // Update information text.
            const currentDisplayPage = targetPageIndex + 1;
            const totalUnitsCount = contentUnits.length;
            const totalDisplayPages = Math.ceil(totalUnitsCount / configOptions.entries_per_view);

            rootScope.find(configOptions.info_display_selector).html(
                configOptions.info_template
                .replace("{0}", sliceStartIdx + 1)
                .replace("{1}", sliceStartIdx + visibleItems.length)
                .replace("{2}", totalUnitsCount)
                .replace("{3}", currentDisplayPage) // Custom addition: current page number
                .replace("{4}", totalDisplayPages) // Custom addition: total page count
            );

            // Update ellipsis visibility and boundary navigation states.
            _updateEllipsisVisibility();
            _markBoundaryNav();

            // Invoke the onPageViewed callback if provided.
            if (typeof configOptions.onPageViewed === "function") {
                configOptions.onPageViewed.call(rootScope[0], targetPageIndex + 1);
            }
        }

        /**
         * Shifts the visible range of page number links to the left.
         * @param {jQuery} callingElement - The element that triggered the shift.
         * @param {number} newPageIndex - The index of the page being navigated to.
         */
        function _shiftNavLeft(callingElement, newPageIndex) {
            const currentActiveLink = callingElement.siblings('.active-page');
            const targetLink = currentActiveLink.siblings(`.pager-link[data-page-index=${newPageIndex}]`);

            if (targetLink.length > 0 && targetLink.css('display') === 'none') {
                navigationZones.each(function() {
                    jq(this).children('.pager-link').hide()
                        .slice(parseInt(newPageIndex - configOptions.max_nav_links + 1, 10), newPageIndex + 1).show();
                });
            }
        }

        /**
         * Shifts the visible range of page number links to the right.
         * @param {jQuery} callingElement - The element that triggered the shift.
         * @param {number} newPageIndex - The index of the page being navigated to.
         */
        function _shiftNavRight(callingElement, newPageIndex) {
            const currentActiveLink = callingElement.siblings('.active-page');
            const targetLink = currentActiveLink.siblings(`.pager-link[data-page-index=${newPageIndex}]`);

            if (targetLink.length > 0 && targetLink.css('display') === 'none') {
                navigationZones.each(function() {
                    jq(this).children('.pager-link').hide()
                        .slice(newPageIndex, newPageIndex + parseInt(configOptions.max_nav_links, 10)).show();
                });
            }
        }

        /**
         * Shows or hides the ellipsis markers based on visible page links.
         */
        function _updateEllipsisVisibility() {
            const visibleLinks = navigationZones.children('.pager-link:visible');
            const firstVisibleIsFirst = visibleLinks.first().hasClass('first');
            const lastVisibleIsLast = visibleLinks.last().hasClass('last');

            if (!lastVisibleIsLast) {
                navigationZones.children('.pager-more').show();
            } else {
                navigationZones.children('.pager-more').hide();
            }

            if (!firstVisibleIsFirst) {
                navigationZones.children('.pager-less').show();
            } else {
                navigationZones.children('.pager-less').hide();
            }
        }

        /**
         * Adds or removes a 'no-more' class to navigation buttons (first/last, prev/next)
         * to indicate if there are further pages in that direction.
         */
        function _markBoundaryNav() {
            const currentPageLink = navigationZones.children('.active-page');
            const isLastPageActive = currentPageLink.hasClass('last');
            const isFirstPageActive = currentPageLink.hasClass('first');

            if (isLastPageActive) {
                navigationZones.children('.pager-next, .pager-last').addClass(`no-more ${uiDisabledClass}`);
            } else {
                navigationZones.children('.pager-next, .pager-last').removeClass(`no-more ${uiDisabledClass}`);
            }

            if (isFirstPageActive) {
                navigationZones.children('.pager-prev, .pager-first').addClass(`no-more ${uiDisabledClass}`);
            } else {
                navigationZones.children('.pager-prev, .pager-first').removeClass(`no-more ${uiDisabledClass}`);
            }
        }

        // Execute the initialization for each selected element.
        return this.each(_initializePagination);

    };

})(jQuery);