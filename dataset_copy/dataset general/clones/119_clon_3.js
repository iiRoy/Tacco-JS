var appCore = angular.module('appCore', []);

appCore.directive('dynamicHeaderFixation', function () {
    // This directive creates a fixed, "sticky" clone of an element
    // when the original element scrolls out of view.
    return {
        restrict: 'EA', // Can be used as an element or attribute
        replace: false, // Do not replace the original element
        scope: {
            targetContent: '=', // Selector for the main content area
            verticalOffset: '=', // Pixels from the top to "stick"
            scrollHost: '=' // Container that dictates scrolling (defaults to window)
        },
        link: function (scope, hostElement, attributes) {
            const FIXED_Z_INDEX = 10000;
            const ACTIVE_FIXED_CLASS = 'fixed-header-active';
            const HIDDEN_VISIBILITY_CLASS = 'fixed-header-hidden';

            let originalHeaderElement = angular.element(hostElement);
            let phantomFixedHeader = null; // The cloned element that becomes fixed
            let mainContentArea = angular.element(scope.targetContent);
            let scrollSource = angular.element(scope.scrollHost);
            let isFixedHeaderActive = false; // Flag to track if the clone is currently shown

            // If no specific scrollable container is provided, default to the window.
            if (!scrollSource || scrollSource.length === 0) {
                scrollSource = angular.element(window);
            }

            // Ensure the main content area exists before proceeding.
            if (!mainContentArea || mainContentArea.length === 0) {
                console.warn('DynamicHeaderFixation: Target content area not found.', scope.targetContent);
                return;
            }

            /**
             * Creates and initializes the fixed header clone.
             * This function is invoked when the original header scrolls out of view.
             */
            function initializeFixedHeader() {
                // Prevent re-creation if already active.
                if (isFixedHeaderActive && phantomFixedHeader) {
                    return;
                }

                // Create a deep clone of the original header.
                phantomFixedHeader = originalHeaderElement.clone();
                // Insert the clone right after the original element in the DOM.
                originalHeaderElement.after(phantomFixedHeader);

                // Add a class to the original header to indicate it's been replaced visually.
                // This original element will remain in the DOM but become invisible.
                originalHeaderElement.addClass(HIDDEN_VISIBILITY_CLASS);

                // Apply initial styling to the phantom fixed header.
                phantomFixedHeader.css({
                    position: 'fixed',
                    'z-index': FIXED_Z_INDEX,
                    visibility: 'hidden' // Start hidden, will be made visible later
                });

                isFixedHeaderActive = true;
                updateHeaderDimensions(); // Set initial size and position for the clone.
            }

            /**
             * Recalculates and applies the size and position of the fixed header clone.
             */
            function updateHeaderDimensions() {
                if (!phantomFixedHeader) {
                    return;
                }

                // Get the current width and left offset from the original header.
                const originalWidth = originalHeaderElement.outerWidth();
                const originalLeft = originalHeaderElement.offset().left;

                // Apply these dimensions to the phantom fixed header.
                phantomFixedHeader.css({
                    top: scope.verticalOffset + 'px', // Use the configured offset
                    width: originalWidth + 'px',
                    left: originalLeft + 'px'
                });

                synchronizeColumnWidths(); // Adjust column widths if it's a table row.
            }

            /**
             * Synchronizes the column widths of the fixed header with the original header
             * if the header is a table row (<tr>).
             */
            function synchronizeColumnWidths() {
                if (!phantomFixedHeader || !phantomFixedHeader.is('tr')) {
                    return;
                }

                const clonedColumns = phantomFixedHeader.find('th');
                originalHeaderElement.find('th').each(function (idx, originalColumn) {
                    const clonedColumn = angular.element(clonedColumns[idx]);
                    if (clonedColumn.length) {
                        // Set the width of the cloned column to match the original.
                        clonedColumn.css('width', originalColumn.offsetWidth + 'px');
                    }
                });
            }

            /**
             * Resets the original header element to its initial state, removing the fixed clone.
             */
            function resetOriginalHeader() {
                if (!isFixedHeaderActive || !phantomFixedHeader) {
                    return;
                }

                phantomFixedHeader.remove(); // Remove the clone from the DOM.
                phantomFixedHeader = null; // Clear the reference.

                // Restore the original header's visibility and styling.
                originalHeaderElement.removeClass(HIDDEN_VISIBILITY_CLASS);
                originalHeaderElement.css({
                    position: '', // Remove fixed position
                    left: '',
                    top: '',
                    width: '',
                    'z-index': '',
                    visibility: ''
                });

                isFixedHeaderActive = false;
            }

            /**
             * Determines whether the fixed header should be visible and its position.
             * This function is triggered on scroll and resize events.
             */
            function evaluateHeaderState() {
                // Current scroll position adjusted by the vertical offset.
                const currentScrollPosition = scrollSource.scrollTop() + (scope.verticalOffset || 0);

                // Position of the content area.
                const contentTopPosition = mainContentArea.offset().top;
                const contentBottomPosition = contentTopPosition + mainContentArea.outerHeight(false);

                // Check if the scroll position is within the content area's vertical bounds.
                const isWithinContentBounds = (currentScrollPosition > contentTopPosition) && (currentScrollPosition < contentBottomPosition);

                if (isWithinContentBounds) {
                    if (!isFixedHeaderActive) {
                        initializeFixedHeader(); // Create the fixed header if not already active.
                        phantomFixedHeader.css({ "visibility": "visible" });
                    }

                    // Check if the fixed header is about to scroll out of the bottom of the content area.
                    const fixedHeaderHeight = phantomFixedHeader.outerHeight(false);
                    const isNearContentBottom = currentScrollPosition > (contentBottomPosition - fixedHeaderHeight);

                    if (isNearContentBottom) {
                        // Adjust the 'top' property to make it scroll with the content bottom.
                        const dynamicTop = contentBottomPosition - currentScrollPosition + (scope.verticalOffset || 0) - fixedHeaderHeight;
                        phantomFixedHeader.css('top', dynamicTop + 'px');
                    } else {
                        // Otherwise, it's fully sticky at the top offset.
                        updateHeaderDimensions();
                    }
                } else {
                    // If outside content bounds, deactivate and remove the fixed header.
                    resetOriginalHeader();
                }
            }

            // Bind event listeners for scroll and resize.
            scrollSource.on('scroll', evaluateHeaderState);
            scrollSource.on('resize', evaluateHeaderState);

            // Trigger once initially to set the correct state.
            // Using a timeout to ensure all elements are rendered and sized correctly.
            setTimeout(evaluateHeaderState, 0);

            // Clean up event listeners when the directive's scope is destroyed.
            scope.$on('$destroy', function () {
                scrollSource.off('scroll', evaluateHeaderState);
                scrollSource.off('resize', evaluateHeaderState);
                resetOriginalHeader(); // Ensure the clone is removed on destroy.
            });
        }
    };
});

appCore.directive('toggleNavButton', function () {
    // This directive manages a navigation toggle button's appearance and behavior.
    return {
        restrict: 'EA', // Element or attribute
        replace: false, // Default: do not replace
        scope: {}, // Isolated scope for the button
        link: function (scope, buttonElement) {
            const NAV_ACTIVE_CLASS = 'app-nav-is-open';
            const ICON_OPEN_CLASS = 'nav-icon-open';
            const ICON_CLOSED_CLASS = 'nav-icon-closed';
            const SPIN_FORWARD_CLASS = 'spin-clockwise';
            const SPIN_BACKWARD_CLASS = 'spin-counter-clockwise';

            let isNavigationPanelOpen = false; // Internal state tracker

            // Add a base class for styling.
            buttonElement.addClass('app-toggle-button');

            /**
             * Handles the click event on the button.
             * Toggles the navigation panel and updates button icons.
             */
            function onButtonInteraction() {
                const bodyElem = angular.element('body');
                if (bodyElem.length === 0) {
                    console.error('ToggleNavButton: Body element not found for navigation toggle.');
                    return;
                }

                isNavigationPanelOpen = !isNavigationPanelOpen; // Toggle state

                // Toggle a class on the body to control overall navigation visibility.
                if (isNavigationPanelOpen) {
                    bodyElem.addClass(NAV_ACTIVE_CLASS);
                } else {
                    bodyElem.removeClass(NAV_ACTIVE_CLASS);
                }

                updateButtonIconRotation(); // Animate the button icons.

                // A slight delay to allow CSS transitions to register before re-applying.
                scope.$applyAsync(updateButtonIconRotation);
            }

            /**
             * Updates the rotation classes for the button's internal icons.
             */
            function updateButtonIconRotation() {
                const openIcon = buttonElement.find(`.${ICON_OPEN_CLASS}`);
                const closedIcon = buttonElement.find(`.${ICON_CLOSED_CLASS}`);

                if (openIcon.length) {
                    openIcon.toggleClass(SPIN_FORWARD_CLASS, isNavigationPanelOpen);
                }
                if (closedIcon.length) {
                    closedIcon.toggleClass(SPIN_BACKWARD_CLASS, isNavigationPanelOpen);
                }
            }

            // Bind the click event to the button element.
            buttonElement.on('click', onButtonInteraction);

            // Initialize button icon state on load (optional, but good practice).
            updateButtonIconRotation();

            // Clean up event listener when directive scope is destroyed.
            scope.$on('$destroy', function () {
                buttonElement.off('click', onButtonInteraction);
            });
        }
    };
});

appCore.directive('infiniteScrollList', function ($filter, $timeout) {
    // This directive enables infinite scrolling for large datasets.
    // It loads data in pages/segments as the user scrolls down.
    return {
        restrict: 'AE', // Element or Attribute
        scope: {}, // Isolated scope
        replace: false,
        transclude: true, // Allow content inside the directive
        link: function (scope, element, attrs, ctrl, transcludeFn) {
            const sorterFilter = $filter('orderBy');
            const SCROLL_THRESHOLD_PERCENT = 0.98; // Trigger loading when scroll is near bottom
            const EXPR_OF_DELIM = ' of ';
            const EXPR_TAKE_DELIM = ' take ';

            let currentSegmentIdx = 0;
            let displayCollectionName; // e.g., 'displayItems' from 'displayItems of...'
            let sourceDataPath; // e.g., 'vm.allData' from '...of vm.allData take...'
            let segmentSize; // e.g., 20 from '...take 20'

            let masterData = []; // The full dataset from the parent scope
            let orderedData = []; // masterData after sorting
            let renderedSegments = []; // Data currently displayed in the UI

            const scrollObserver = angular.element(window); // Observes window scroll
            let activeSortKeys = []; // Array of sort criteria, e.g., ['+name', '-age']
            const sortOptionNames = ['None', 'Ascending', 'Descending']; // For `fsmSort` directive

            let isLoadingNextSegment = false; // Flag to prevent multiple concurrent loads
            let scrollThrottleTimeout; // For throttling scroll events

            // Parse the directive's attribute value, e.g., "displayItems of vm.allData take 20"
            function parseDirectiveExpression() {
                const expressionString = attrs.infiniteScrollList;
                if (!expressionString || typeof expressionString !== 'string') {
                    console.error('InfiniteScrollList: Invalid expression format.', expressionString);
                    return;
                }

                const partsOf = expressionString.split(EXPR_OF_DELIM);
                if (partsOf.length < 2) {
                    console.error(`InfiniteScrollList: Expression must contain "${EXPR_OF_DELIM}".`);
                    return;
                }
                displayCollectionName = partsOf[0].trim();

                const partsTake = partsOf[1].split(EXPR_TAKE_DELIM);
                if (partsTake.length < 2) {
                    console.error(`InfiniteScrollList: Expression must contain "${EXPR_TAKE_DELIM}".`);
                    return;
                }
                sourceDataPath = partsTake[0].trim();
                segmentSize = Number(partsTake[1].trim());

                if (!Number.isInteger(segmentSize) || segmentSize <= 0) {
                    console.error('InfiniteScrollList: Invalid segment size, must be a positive integer.', segmentSize);
                    segmentSize = 10; // Default to a safe value
                }
            }

            parseDirectiveExpression();
            scope.availableSortMethods = sortOptionNames; // Expose sort options to child directives

            transcludeFn(scope, function (clonedContent, transcludedScope) {
                element.append(clonedContent);
                // Expose the paginated data to the transcluded scope.
                transcludedScope[displayCollectionName] = renderedSegments;

                /**
                 * Loads the next segment of data into the `renderedSegments` array.
                 */
                function fetchNextSegment() {
                    if (isLoadingNextSegment || currentSegmentIdx * segmentSize >= orderedData.length) {
                        return; // Already loading or no more data to load
                    }
                    isLoadingNextSegment = true;

                    const startIndex = currentSegmentIdx * segmentSize;
                    const endIndex = startIndex + segmentSize;
                    const dataSlice = orderedData.slice(startIndex, endIndex);

                    if (dataSlice.length > 0) {
                        // Append new data to the displayed collection.
                        Array.prototype.push.apply(renderedSegments, dataSlice);
                        currentSegmentIdx++;
                    }
                    isLoadingNextSegment = false;
                }

                /**
                 * Updates the active sorting criteria and re-renders the data.
                 * @param {string} columnKey - The property name to sort by.
                 * @param {number} sortMethodIdx - Index from `sortOptionNames` (0: None, 1: Asc, 2: Desc).
                 */
                function updateSortConfiguration(columnKey, sortMethodIdx) {
                    // Remove any existing sort for this columnKey to ensure it's at the top of the stack.
                    activeSortKeys = activeSortKeys.filter(key => {
                        const cleanKey = key.startsWith('-') ? key.substring(1) : key;
                        return cleanKey !== columnKey;
                    });

                    // Add the new sort criterion if it's not 'None'.
                    if (sortMethodIdx > 0) {
                        let sortDirectionPrefix = '';
                        if (sortOptionNames[sortMethodIdx] === 'Descending') {
                            sortDirectionPrefix = '-';
                        }
                        activeSortKeys.unshift(sortDirectionPrefix + columnKey); // Add to the beginning
                    }

                    rebuildDisplayData(); // Re-sort and re-render everything.
                }

                /**
                 * Rebuilds the entire dataset, applying sorting and resetting pagination.
                 */
                function rebuildDisplayData() {
                    if (activeSortKeys.length > 0) {
                        orderedData = sorterFilter(masterData, activeSortKeys);
                    } else {
                        orderedData = masterData; // No sorting applied
                    }

                    // Clear existing displayed data and reset pagination.
                    renderedSegments.length = 0; // Efficiently clear array
                    currentSegmentIdx = 0;

                    fetchNextSegment(); // Load the first page.
                }

                /**
                 * Handles the window scroll event to trigger loading more data.
                 */
                function handleWindowScroll() {
                    // Throttle scroll events to prevent excessive function calls.
                    if (scrollThrottleTimeout) {
                        $timeout.cancel(scrollThrottleTimeout);
                    }

                    scrollThrottleTimeout = $timeout(function () {
                        const scrollPosition = scrollObserver.scrollTop();
                        const documentHeight = angular.element(document).height();
                        const windowHeight = scrollObserver.height();

                        // Calculate how far down the page the user has scrolled as a percentage.
                        const scrollProgress = (scrollPosition / (documentHeight - windowHeight));

                        if (scrollProgress > SCROLL_THRESHOLD_PERCENT) {
                            // Use $apply to inform Angular about changes happening outside its digest cycle.
                            transcludedScope.$apply(fetchNextSegment);
                        }
                        scrollThrottleTimeout = null;
                    }, 100); // Throttle to 100ms
                }

                // Attach scroll event listener to the window.
                scrollObserver.on('scroll', handleWindowScroll);
                // Trigger an initial scroll check to load the first segment if content is short.
                setTimeout(handleWindowScroll, 0);

                // Watch the source collection from the parent scope for changes.
                scope.$parent.$watchCollection(sourceDataPath, function (newSourceCollection) {
                    if (Array.isArray(newSourceCollection)) {
                        masterData = newSourceCollection;
                        rebuildDisplayData(); // Re-sort and re-render when source data changes.
                    } else if (newSourceCollection === null || newSourceCollection === undefined) {
                        masterData = []; // Clear data if source becomes null/undefined
                        rebuildDisplayData();
                    }
                });

                scope.updateSortConfiguration = updateSortConfiguration; // Expose to child directives

                // Clean up on scope destruction.
                scope.$on('$destroy', function () {
                    scrollObserver.off('scroll', handleWindowScroll);
                    if (scrollThrottleTimeout) {
                        $timeout.cancel(scrollThrottleTimeout);
                    }
                });
            });
        }
    };
});

appCore.directive('sortableHeader', function () {
    // This directive adds sorting functionality and an icon to a table header.
    return {
        restrict: 'AE', // Element or Attribute
        replace: false,
        scope: {}, // Isolated scope
        link: function (scope, hostElement, attrs) {
            const ICON_DEFAULT = 'fa-sort';
            const ICON_ASCENDING = 'fa-sort-asc';
            const ICON_DESCENDING = 'fa-sort-desc';

            let sortProperty = attrs.sortableHeader; // The data property this column sorts by
            let sortGlyph = angular.element('<i class="fa"></i>'); // The icon element
            let activeSortStateIdx = 0; // 0: None, 1: Asc, 2: Desc (matches parent's `availableSortMethods`)

            // Guard clause: ensure a sort property is defined.
            if (!sortProperty) {
                console.warn('SortableHeader: `sortable-header` attribute is missing a value.', hostElement[0]);
                return;
            }

            // Append a non-breaking space and the icon to the header.
            hostElement.append(angular.element('&nbsp;'));
            hostElement.append(sortGlyph);

            // Add pointer cursor to indicate interactivity.
            hostElement.css({ cursor: 'pointer' });

            /**
             * Updates the visual appearance of the sort icon based on the current sort state.
             */
            function updateIconAppearance() {
                sortGlyph.removeClass(`${ICON_DEFAULT} ${ICON_ASCENDING} ${ICON_DESCENDING}`);

                const sortMethod = scope.$parent.availableSortMethods[activeSortStateIdx];
                let classToAdd = ICON_DEFAULT;

                switch (sortMethod) {
                    case 'Ascending':
                        classToAdd = ICON_ASCENDING;
                        break;
                    case 'Descending':
                        classToAdd = ICON_DESCENDING;
                        break;
                    case 'None':
                    default:
                        classToAdd = ICON_DEFAULT;
                        break;
                }
                sortGlyph.addClass(classToAdd);
            }

            /**
             * Handles the click event on the header, cycling through sort states.
             */
            function handleHeaderClick() {
                // Cycle through sort states: None -> Ascending -> Descending -> None
                activeSortStateIdx = (activeSortStateIdx + 1) % scope.$parent.availableSortMethods.length;

                // Call the parent directive's function to update the global sort configuration.
                scope.$apply(function () {
                    scope.$parent.updateSortConfiguration(sortProperty, activeSortStateIdx);
                });

                updateIconAppearance(); // Refresh the icon.
            }

            // Bind the click event.
            hostElement.on('click', handleHeaderClick);

            // Initial icon setup.
            updateIconAppearance();

            // Clean up on scope destruction.
            scope.$on('$destroy', function () {
                hostElement.off('click', handleHeaderClick);
            });
        }
    };
});