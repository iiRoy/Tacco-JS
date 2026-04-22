/* eslint-disable no-useless-escape, no-new-func, no-unused-vars, no-shadow */
// This script manages dynamic event loading and filtering for a display grid.
// It includes a polyfill, interactive filtering, a custom templating engine,
// and AJAX-driven content loading with Masonry grid layout.

// Ensure jQuery is available and ready for DOM manipulation.
jQuery(document).ready(function(jq) { // Renamed jQuery alias to 'jq'

    // --- Polyfill for Array.prototype.indexOf (legacy browser compatibility) ---
    // This section ensures basic functionality for older browsers, specifically IE7/8.
    if (typeof Array.prototype.indexOf !== 'function') {
        /**
         * Provides an `indexOf` method for arrays if not natively available.
         *
         * @param {*} searchVal The element to locate in the array.
         * @param {number} [startIdx=0] The index at which to begin the search. Defaults to 0.
         * @returns {number} The first index at which the given element can be found, or -1 if it is not present.
         */
        Array.prototype.indexOf = function(searchVal /*, startIdx*/) {
            'use strict'; // Enforce strict mode for this polyfill
            if (this === null || this === undefined) {
                throw new TypeError('Array.prototype.indexOf called on null or undefined');
            }

            const currentArray = Object(this);
            const arrayLength = currentArray.length >>> 0; // Ensure it's an unsigned 32-bit integer

            if (arrayLength === 0) {
                return -1;
            }

            let startFrom = Number(arguments[1]) || 0;
            // Handle negative startFrom values
            startFrom = (startFrom < 0) ? Math.ceil(startFrom) : Math.floor(startFrom);

            if (startFrom < 0) {
                startFrom += arrayLength;
            }

            // Iterate through the array from the calculated starting index
            for (let k = startFrom; k < arrayLength; k++) {
                if (k in currentArray && currentArray[k] === searchVal) {
                    return k;
                }
            }
            return -1; // Element not found
        };
    }

    // --- Utility for HTML escaping (minimal Underscore.js-like functionality) ---
    // This is a simplified version of Underscore's escape function for template rendering.
    const _ = {
        entityMap: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        },
        escape: function(str) {
            if (str == null) return '';
            return String(str).replace(/[&<>"'`]/g, function(s) {
                return _.entityMap[s];
            });
        }
    };

    // --- Event Filtering Logic ---
    // Handles user interaction with filter buttons to show/hide event items.
    const $eventFilterButtons = jq('.event-board-filter-btn'); // Renamed class and variable
    const $filterStateContainer = jq('#filter-state-storage'); // Renamed ID and variable
    const $displayGridContainer = jq('#display-items-container'); // Renamed ID and variable

    // Function to apply filters to the displayed items
    const applyVisibilityFilters = (currentActiveFilters) => {
        const allItems = jq('.display-item-card', '#event-display-area'); // Target all potential items
        const hiddenClass = 'display-item-card-hidden';
        const masonryItemClasses = 'display-item-card masonry-grid-item-box'; // Consolidated masonry classes

        // If no filters are active, show all items
        if (!currentActiveFilters || currentActiveFilters.length === 0) {
            allItems
                .css({ 'visibility': '', 'display': '' }) // Reset CSS
                .addClass(masonryItemClasses)
                .removeClass(hiddenClass);
            return;
        }

        // Construct a selector for items that match ANY active filter
        const matchingSelector = currentActiveFilters.map(f => `#event-display-area .${f}`).join(', ');

        // Hide all items initially
        allItems
            .css({ 'visibility': 'hidden', 'display': 'none' })
            .removeClass(masonryItemClasses)
            .addClass(hiddenClass);

        // Show items that match any active filter
        if (matchingSelector) {
            jq(matchingSelector)
                .css({ 'visibility': '', 'display': '' }) // Reset CSS
                .addClass(masonryItemClasses)
                .removeClass(hiddenClass);
        }
    };

    $eventFilterButtons.on('click', function(clickEvt) { // Changed 'click' to 'on('click')', renamed 'e'
        clickEvt.preventDefault(); // Prevent default link behavior

        const $thisButton = jq(this);
        const filterCategoryKey = $thisButton.data('category-type'); // Renamed data attribute
        const filterValueIdentifier = $thisButton.data('value-id'); // Renamed data attribute
        const generatedFilterClass = `eb-cat-${filterCategoryKey}-${filterValueIdentifier}`; // New naming convention for filter class
        let isCurrentlyActive = $thisButton.data('is-active-filter'); // Renamed data attribute

        // Retrieve current active filters from storage, clean up empty strings
        let storedActiveFilters = $filterStateContainer.data('active-filters-list') || '';
        let activeFilterArray = storedActiveFilters.split(',').filter(Boolean); // Filter out empty strings

        if (!isCurrentlyActive) {
            // Filter is being activated
            activeFilterArray.push(generatedFilterClass);
            $thisButton.data('is-active-filter', true);
            $thisButton.addClass('filter-toggle-active'); // Renamed class
        } else {
            // Filter is being deactivated
            const filterIndex = activeFilterArray.indexOf(generatedFilterClass);
            if (filterIndex > -1) {
                activeFilterArray.splice(filterIndex, 1);
            }
            $thisButton.data('is-active-filter', false);
            $thisButton.removeClass('filter-toggle-active');
        }

        // Update the stored filter state
        $filterStateContainer.data('active-filters-list', activeFilterArray.join(','));

        // Apply filters to the visible items
        applyVisibilityFilters(activeFilterArray);

        // Reload Masonry layout to adjust for hidden/shown items
        $displayGridContainer.masonry('layout'); // More specific Masonry method for layout recalculation
    });

    // --- Custom Micro-Templating Engine (inspired by Underscore.js) ---
    // This function compiles a template string into a reusable rendering function.
    function compileContentTemplate(templateString, options = {}) { // Renamed function and parameters
        if (!templateString) {
            console.warn('Template string is empty or null. Returning a no-op function.');
            return () => '';
        }

        const defaultTemplateOptions = {
            evaluate: /<%([\s\S]+?)%>/g, // Code to execute
            interpolate: /<%=([\s\S]+?)%>/g, // Values to interpolate (unescaped)
            escape: /<%-([\s\S]+?)%>/g, // Values to interpolate (escaped)
            variable: 'itemObj' // Name of the variable holding the data within the template scope
        };

        const templateSettings = { ...defaultTemplateOptions, ...options }; // Merge with defaults

        const charEscapeMapping = { // Renamed variable
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };

        // Regex to escape special characters within the template string
        const specialCharRegex = /\\|'|\r|\n|\t|\u2028|\u2029/g;

        // Combine all delimiters into a single regex for efficient parsing
        const combinedDelimiterRegex = new RegExp([
            templateSettings.escape.source,
            templateSettings.interpolate.source,
            templateSettings.evaluate.source
        ].join('|') + '|$', 'g');

        let currentIndex = 0;
        let generatedFunctionBody = "var __t, __output = '', __joiner = Array.prototype.join;\n";
        generatedFunctionBody += "print = function() { __output += __joiner.call(arguments, ''); };\n"; // Renamed __p to __output, __j to __joiner

        templateString.replace(combinedDelimiterRegex, function(
            fullMatch,
            escapeBlock,
            interpolateBlock,
            evaluateBlock,
            matchOffset
        ) {
            generatedFunctionBody += "__output += '" + templateString.slice(currentIndex, matchOffset).replace(specialCharRegex, (char) => '\\' + charEscapeMapping[char]) + "';\n";

            if (escapeBlock) {
                generatedFunctionBody += "__output += ((__t = (" + escapeBlock + ")) == null ? '' : _.escape(__t));\n";
            }
            if (interpolateBlock) {
                generatedFunctionBody += "__output += ((__t = (" + interpolateBlock + ")) == null ? '' : __t);\n";
            }
            if (evaluateBlock) {
                generatedFunctionBody += evaluateBlock + "\n";
            }
            currentIndex = matchOffset + fullMatch.length;
            return fullMatch;
        });

        generatedFunctionBody += "__output += '" + templateString.slice(currentIndex).replace(specialCharRegex, (char) => '\\' + charEscapeMapping[char]) + "';\n";
        generatedFunctionBody += "return __output;\n";

        // Wrap the generated code in a 'with' statement for easier data access, if no specific variable is defined
        if (!templateSettings.variable) {
            generatedFunctionBody = 'with(itemObj || {}) {\n' + generatedFunctionBody + '}\n';
        }

        let compiledFn;
        try {
            // Create a new function from the generated code
            // The `_` parameter is passed for the escape utility.
            compiledFn = new Function(templateSettings.variable || 'itemObj', '_', generatedFunctionBody);
        } catch (e) {
            console.error('Error compiling template:', e);
            e.templateSource = templateString;
            e.generatedCode = generatedFunctionBody;
            throw e;
        }

        // If contextData is provided immediately, render it. Otherwise, return the compiled function.
        const templateExecutor = function(contextData) {
            return compiledFn.call(this, contextData, _); // Pass the '_' utility for escaping
        };

        return templateExecutor;
    }

    // --- Initial Data Loading and Setup ---
    const $itemGridContainer = jq('#display-items-container'); // Renamed variable
    const $loadMoreButton = jq('#load-more-items-btn'); // Renamed ID and variable

    const appConfiguration = window.eventboardSettings || {}; // Renamed global config object
    const {
        apiUrl: dataEndpoint = '',
        initialPageLoadingText: loadingMessage = 'Loading content...',
        queryParameters: initialQueryParams = {},
        templateString: itemTemplateRaw = '',
        itemsPerPage: perPageLimit = 10,
        loadMoreButtonText: moreBtnText = 'Load More'
    } = appConfiguration; // Destructured and provided defaults

    let currentItemPage = 1; // Renamed variable
    let isFetchingData = false; // Guard to prevent multiple simultaneous AJAX requests

    // Set initial text for the load more button
    $loadMoreButton.text(loadingMessage);

    // Compile the event item template
    const itemRendererFunction = compileContentTemplate(itemTemplateRaw); // Renamed variable

    // Function to initialize Masonry grid
    const setupMasonryGrid = () => {
        $itemGridContainer.imagesLoaded(function() {
            $itemGridContainer.masonry({
                itemSelector: '.display-item-card', // Renamed selector
                columnWidth: '.grid-sizer', // Added for better control, assuming a .grid-sizer element
                percentPosition: true, // Use percentages for column widths
                transitionDuration: '0.4s', // Smooth transitions
                stagger: 30, // Stagger item animations
                fitWidth: true // Center the Masonry layout
            });
        });
    };

    // Function to append new items and reload Masonry
    const appendAndLayoutItems = (newHtmlContent, shouldPrepend = false) => {
        const $newItems = jq(newHtmlContent);
        if (shouldPrepend) {
            $itemGridContainer.prepend($newItems);
        } else {
            $itemGridContainer.append($newItems);
        }

        // Ensure images are loaded before layout, then apply filters and layout
        $newItems.imagesLoaded(function() {
            // Apply current filters to newly loaded items
            const storedActiveFilters = $filterStateContainer.data('active-filters-list') || '';
            const activeFilterArray = storedActiveFilters.split(',').filter(Boolean);
            applyVisibilityFilters(activeFilterArray);

            // Add new items to Masonry and relayout
            $itemGridContainer.masonry('appended', $newItems);
            $itemGridContainer.masonry('layout');
        });
    };

    // --- Function to Fetch Additional Events ---
    // This function handles AJAX requests for more event data.
    const fetchEventData = () => { // Renamed function
        if (isFetchingData) {
            console.log('Data fetch already in progress. Skipping.');
            return;
        }

        isFetchingData = true;
        $loadMoreButton.text('Loading...'); // Update button text during fetch
        $loadMoreButton.prop('disabled', true); // Disable button

        jq.ajax({
            url: dataEndpoint,
            dataType: 'json',
            data: {
                action: 'get_posterboard_items', // Renamed action
                page_number: currentItemPage, // Renamed parameter
                query_args: initialQueryParams // Renamed parameter
            }
        })
        .done(function(responseData) { // Renamed parameter
            if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
                $loadMoreButton.hide(); // Hide button if no more items
                console.log('No more items to load.');
                return;
            }

            let renderedItemsBuffer = '';
            for (const item of responseData) { // Using for...of loop
                renderedItemsBuffer += itemRendererFunction(item);
            }

            appendAndLayoutItems(renderedItemsBuffer);

            // Hide the load more button if fewer items than expected are returned
            if (responseData.length < perPageLimit) {
                $loadMoreButton.hide();
            } else {
                $loadMoreButton.text(moreBtnText); // Reset button text
                $loadMoreButton.prop('disabled', false); // Re-enable button
            }
            currentItemPage++; // Increment page for next request
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('AJAX request failed:', textStatus, errorThrown, jqXHR);
            $loadMoreButton.text('Error loading. Try again?'); // Display error message
            $loadMoreButton.prop('disabled', false); // Re-enable button
        })
        .always(function() {
            isFetchingData = false;
        });
    };

    // --- Initial Load on Document Ready ---
    // Perform the first data fetch when the DOM is ready.
    jq.ajax({
        url: dataEndpoint,
        dataType: 'json',
        data: {
            action: 'get_posterboard_items', // Renamed action
            page_number: currentItemPage,
            query_args: initialQueryParams
        }
    })
    .done(function(initialEventData) { // Renamed parameter
        let initialHtml = '';
        if (initialEventData && Array.isArray(initialEventData)) {
            for (const singleItem of initialEventData) {
                initialHtml += itemRendererFunction(singleItem);
            }
        }

        // Prepend a grid sizer for Masonry
        $itemGridContainer.prepend('<div class="grid-sizer"></div>');

        // Append initial items to the container
        $itemGridContainer.append(initialHtml);

        // Hide load more button if initial load is less than expected
        if (!initialEventData || initialEventData.length < perPageLimit) {
            $loadMoreButton.hide();
        } else {
            $loadMoreButton.text(moreBtnText);
            $loadMoreButton.prop('disabled', false);
        }

        // Initialize Masonry grid after content is loaded
        setupMasonryGrid();

        // Attach click handler for loading more items
        $loadMoreButton.on('click', fetchEventData);

        currentItemPage++; // Increment page for next request after initial load
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Initial AJAX load failed:', textStatus, errorThrown, jqXHR);
        $loadMoreButton.text('Failed to load initial content.');
        $loadMoreButton.prop('disabled', true).hide();
    });

}); // End of jQuery ready function