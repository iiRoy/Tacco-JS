var modulicious = angular.module('modulicious', []);

modulicious.directive('moduliciousFixedHeading', function() {
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            contentArea: '=',
            offsetPoint: '=',
            scrollableViewport: '='
        },
        link: function(scopeVar, elemRef, attribs, ctrlObj) {
            // Reference to the main heading element
            var mainHeading = $(elemRef, this);
            // Placeholder for the replicated heading
            var replicatedHeading = null;
            // The content area to track
            var visibleContent = $(scopeVar.contentArea);
            // The container that is scrollable
            var viewportElement = $(scopeVar.scrollableViewport);

            // If no specific scrollable container is provided, use the window
            if (viewportElement.length === 0) {
                viewportElement = $(window);
            }

            // Function to generate a duplicate of the header
            function generateReplication() {
                /*
                 * Swap positions with the original element to maintain bindings.
                 * The original header effectively becomes the "clone" visually.
                 */
                replicatedHeading = mainHeading;
                mainHeading = replicatedHeading.clone();
                replicatedHeading.after(mainHeading);
                replicatedHeading.addClass('modulicious-fixed-heading');
                replicatedHeading.css({
                    position: 'fixed',
                    'z-index': 10000,
                    visibility: 'hidden'
                });
                computeDimensions();
            }

            // Calculates and sets the size and position of the fixed header
            function computeDimensions() {
                replicatedHeading.css({
                    top: scopeVar.offsetPoint,
                    width: mainHeading.outerWidth(),
                    left: mainHeading.offset().left
                });

                adjustColumnHeadingMetrics();
            }

            // Adjusts the width of individual column headers within the fixed header
            function adjustColumnHeadingMetrics() {
                if (replicatedHeading.is('tr')) {
                    var replicatedCells = replicatedHeading.find('th');
                    mainHeading.find('th').each(function(idx, colCell) {
                        var replicatedCell = $(replicatedCells[idx]);
                        replicatedCell.css('width', colCell.offsetWidth + 'px');
                    });
                }
            }

            // Determines whether the fixed header should be visible or hidden
            function assessDisplayStatus() {
                var verticalScrollPos = viewportElement.scrollTop() + scopeVar.offsetPoint;
                var visibleContentTop = visibleContent.position().top;
                var visibleContentBottom = visibleContentTop + visibleContent.outerHeight(false);

                // Check if the scroll position is within the content area
                if ((verticalScrollPos > visibleContentTop) && (verticalScrollPos < visibleContentBottom)) {
                    if (!replicatedHeading) {
                        generateReplication();
                        replicatedHeading.css({
                            "visibility": "visible"
                        });
                    }

                    // Handle scrolling past the bottom of the content
                    if (verticalScrollPos < visibleContentBottom && verticalScrollPos > visibleContentBottom - replicatedHeading.outerHeight(false)) {
                        var positionY = visibleContentBottom - verticalScrollPos + scopeVar.offsetPoint - replicatedHeading.outerHeight(false);
                        replicatedHeading.css('top', positionY + 'px');
                    } else {
                        computeDimensions();
                    }
                } else {
                    // If outside the content area, remove the fixed header
                    if (replicatedHeading) {
                        /*
                         * Remove the duplicated element and restore the original.
                         */
                        mainHeading.remove();
                        mainHeading = replicatedHeading;
                        replicatedHeading = null;

                        mainHeading.removeClass('modulicious-fixed-heading');
                        mainHeading.css({
                            position: 'relative',
                            left: 0,
                            top: 0,
                            width: 'auto',
                            'z-index': 0,
                            visibility: 'visible'
                        });
                    }
                }
            }

            // Attach scroll and resize event listeners
            viewportElement.scroll(assessDisplayStatus).trigger("scroll");
            viewportElement.resize(assessDisplayStatus);
        }
    };
});

modulicious.directive('moduliciousToggleControl', function() {
    return {
        restrict: 'EA',
        replace: false,
        scope: {},
        link: function(scopeVar, elemRef, attribs, ctrlObj) {
            // Get the button element
            var toggleControl = $(elemRef, this);

            // Initialize the button's appearance and behavior
            toggleControl.addClass('modulicious-toggle-control');
            toggleControl.click(onControlClick);

            // Handler for when the toggle button is clicked
            function onControlClick() {
                // Toggle a class on the body to control a side panel or menu
                $('body').toggleClass('modulicious-panel-toggle');
                // Initiate the visual animation of the button
                animateControlRotation();
                // Re-trigger the animation after a short delay for smoother effect
                setTimeout(animateControlRotation, 50);
            }

            // Animates the button's internal icons (e.g., hamburger to X)
            function animateControlRotation() {
                toggleControl.find('.modulicious-toggle-control-open').toggleClass('modulicious-rotate-forward');
                toggleControl.find('.modulicious-toggle-control-closed').toggleClass('modulicious-rotate-backward');
            }
        }
    };
});

modulicious.directive('moduliciousLargeDataset', function($dataProcessor) {

    return {
        restrict: 'AE',
        scope: {},
        replace: false,
        transclude: true,
        link: function(scopeVar, elemRef, attribs, ctrlObj, transclude) {
            var sortCollection = $dataProcessor('orderBy');
            var currentSegment = 0;
            var segmentDataVarName = attribs.moduliciousLargeDataset.split(' of ')[0];
            var rhsExpression = attribs.moduliciousLargeDataset.split(' of ')[1];
            var segmentSize = parseInt(rhsExpression.split(' take ')[1]);
            var inputSourceData = rhsExpression.split(' take ')[0];

            // Internal data stores
            var unprocessedData = [];
            var orderedData = [];
            var segmentedData = [];
            var viewportWindow = $(window);
            var orderMethodologies = ['None', 'Ascending', 'Descending'];
            var orderCriteria = [];

            scopeVar.orderMethodologies = orderMethodologies;

            transclude(scopeVar, function(clonedContent, nestedScope) {
                elemRef.append(clonedContent);
                nestedScope[segmentDataVarName] = segmentedData;

                // Loads the next chunk of data for display
                function loadNextSegment() {
                    var dataChunk = orderedData.slice(segmentSize * currentSegment, (segmentSize * (currentSegment + 1)));
                    if (dataChunk.length > 0) {
                        segmentedData.push.apply(segmentedData, dataChunk);
                        currentSegment++;
                    }
                }

                // Adds a new column to the sorting criteria
                function appendOrderCriterion(criterionName, orderType) {

                    // If this column is already in the sort stack, remove it first.
                    for (var idxLoop = 0; idxLoop < orderCriteria.length; idxLoop++) {
                        if (orderCriteria[idxLoop].indexOf(criterionName) > -1) {
                            orderCriteria.splice(idxLoop, 1);
                        }
                    }

                    // Add this new criterion to the beginning of the stack
                    if (orderType > 0) {
                        var directionFlag = '';
                        if (orderMethodologies[orderType] === 'Descending') {
                            directionFlag = '-';
                        }
                        orderCriteria.unshift(directionFlag + criterionName);
                    }

                    displayData();
                }

                // Re-renders the entire dataset based on current sorting and paging
                function displayData() {
                    if (orderCriteria.length) {
                        orderedData = sortCollection(unprocessedData, orderCriteria);
                    } else {
                        orderedData = unprocessedData;
                    }

                    segmentedData.length = 0; // Clear previous pages
                    currentSegment = 0;
                    loadNextSegment();
                }

                // Handles scroll events on the window to load more data
                function handleViewportScroll() {
                    var scrollAmt = $(window).scrollTop(),
                        docHeight = $(document).height(),
                        viewHeight = $(window).height();
                    var scrollRatio = (scrollAmt / (docHeight - viewHeight));

                    if (scrollRatio > 0.98) {
                        // We use $apply here to inform Angular about changes
                        // that originated from a non-Angular event (jQuery scroll).
                        nestedScope.$apply(loadNextSegment);
                    }
                }

                viewportWindow.scroll(handleViewportScroll).trigger('scroll');

                // Watch for changes in the source data and re-render
                scopeVar.$parent.$observeCollection(inputSourceData, function(incomingData) {
                    if (incomingData) {
                        unprocessedData = incomingData;
                        displayData();
                    }
                });

                scopeVar.appendOrderCriterion = appendOrderCriterion;
            });
        }
    };
});

modulicious.directive('moduliciousOrderControl', function() {
    var orderIndicatorMarkup = '<i class="fa fa-sort"></i>';

    return {
        restrict: 'AE',
        replace: false,
        scope: {},
        link: function(scopeVar, elemRef, attribs) {
            var tableHeaderCell = elemRef;
            var dataColumnIdentifier = attribs.moduliciousOrderControl;
            var orderGraphic = angular.element(orderIndicatorMarkup);
            tableHeaderCell.append('&nbsp;');
            tableHeaderCell.append(orderGraphic);
            var currentOrderMethod = 0; // 0: None, 1: Asc, 2: Desc

            // Updates the visual icon to reflect the current sort state
            function updateIndicatorDisplay() {
                orderGraphic.removeClass('fa-sort-desc fa-sort-asc fa-sort');

                var styleClassToApply = 'fa-sort';

                if (scopeVar.$parent.orderMethodologies[currentOrderMethod] === 'Ascending') {
                    styleClassToApply = 'fa-sort-asc';
                } else if (scopeVar.$parent.orderMethodologies[currentOrderMethod] === 'Descending') {
                    styleClassToApply = 'fa-sort-desc';
                }

                orderGraphic.addClass(styleClassToApply);
            }

            tableHeaderCell.css({
                cursor: 'pointer'
            });

            // Attach click event to change sort order
            tableHeaderCell.on('click', function() {
                // Cycle through sort types: None -> Ascending -> Descending -> None
                currentOrderMethod++;
                if (currentOrderMethod === scopeVar.$parent.orderMethodologies.length) {
                    currentOrderMethod = 0;
                }

                // Apply the new sort state through the parent scope
                scopeVar.$apply(scopeVar.$parent.appendOrderCriterion(dataColumnIdentifier, currentOrderMethod));

                // Update the visual indicator
                updateIndicatorDisplay();
            });
        }
    };
});