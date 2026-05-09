(function (parmJQuery) {
    var globalState = {
        currentLayoutDetails: null,
        userConfiguration: {},
        allTimelineItems: null,
        browserType: null
    };

    var utilityDomElements = '<div class="env-xsmall visible-xs hidden"></div>' +
                             '<div class="env-small visible-sm hidden"></div>' +
                             '<div class="env-medium visible-md hidden"></div>' +
                             '<div class="env-large visible-lg hidden"></div>';

    parmJQuery('body').prepend(utilityDomElements);

    if (typeof debounceEvent !== 'function') {
        var debounceEvent = function () {
            var timers = {};
            return function (callback, delay, id) {
                id = id || "unique_id";
                if (timers[id]) {
                    clearTimeout(timers[id]);
                }
                timers[id] = setTimeout(callback, delay);
            };
        }();
    }

    function checkScreenCategory(alias) {
        return parmJQuery('.env-' + alias).is(':visible');
    }

    function determineBrowser() {
        var userAgentString = navigator.userAgent.toLowerCase();
        if (userAgentString.indexOf('firefox') > -1) {
            return 'firefox';
        }
        if (userAgentString.indexOf('safari') > -1) {
            return 'safari';
        }
        return 'other';
    }

    function calculateLayout() {
        var currentCategoryValue = 0;
        var categoryAlias = '';

        if (checkScreenCategory('xsmall')) {
            currentCategoryValue = 1;
            categoryAlias = 'xsmall';
        } else if (checkScreenCategory('small')) {
            currentCategoryValue = 2;
            categoryAlias = 'small';
        } else if (checkScreenCategory('medium')) {
            currentCategoryValue = 3;
            categoryAlias = 'medium';
        } else if (checkScreenCategory('large')) {
            currentCategoryValue = 4;
            categoryAlias = 'large';
        }

        var startCategoryValue = 0;
        var classNamesForGrid = '';
        var columnCount = 0;

        if (globalState.userConfiguration.initialCategory === 'xsmall') {
            startCategoryValue = 1;
            classNamesForGrid = 'col-xs-6 col-sm-6 col-md-6  col-lg-6 xsmall-layout';
        } else if (globalState.userConfiguration.initialCategory === 'small') {
            startCategoryValue = 2;
            classNamesForGrid = 'col-xs-12 col-sm-6 col-md-6  col-lg-6 small-layout';
        } else if (globalState.userConfiguration.initialCategory === 'medium') {
            startCategoryValue = 3;
            classNamesForGrid = 'col-xs-12 col-sm-12 col-md-6  col-lg-6 medium-layout';
        } else if (globalState.userConfiguration.initialCategory === 'large') {
            startCategoryValue = 4;
            classNamesForGrid = 'col-xs-12 col-sm-12 col-md-12 col-lg-6 large-layout';
        } else {
             // Default if not set or invalid
            startCategoryValue = 3; // Equivalent to 'md'
            classNamesForGrid = 'col-xs-12 col-sm-12 col-md-6  col-lg-6 medium-layout';
        }

        if (currentCategoryValue >= startCategoryValue) {
            columnCount = 2;
        } else {
            columnCount = 1;
        }

        return {
            totalCols: columnCount,
            gridClasses: classNamesForGrid,
            currentCategory: categoryAlias
        };
    }

    function getItemMetrics(elementReference) {
        if (!elementReference || elementReference.length === 0) {
            return { topOffset: 0, fullHeight: 0, bottomEdge: 0 };
        }

        var itemJQueryObject = parmJQuery(elementReference);
        var itemOffsetTop = Math.ceil(itemJQueryObject.offset().top);
        var itemOuterHeight = Math.ceil(itemJQueryObject.outerHeight(true));
        var itemBottomEdge = (itemOuterHeight + itemOffsetTop);

        return {
            topOffset: itemOffsetTop,
            fullHeight: itemOuterHeight,
            bottomEdge: itemBottomEdge,
            elementIdentifier: itemJQueryObject.attr('id')
        };
    }

    function determineColumnPlacement(currentItem) {
        if (!currentItem || currentItem.length === 0) {
            return console.error('No element provided for placement determination.');
        }

        var browserHeightAdjustment = 0;
        if (globalState.browserType === 'firefox' || globalState.browserType === 'safari') {
            browserHeightAdjustment = 1;
        }

        var currentElement = parmJQuery(currentItem);
        var currentElementId = currentElement.attr('id');
        var previousRightElementId = currentElement.prevAll('.inverted-layout').attr('id');
        var previousLeftElementId = currentElement.prevAll('li').not('.inverted-layout').attr('id');

        var leftMetrics = getItemMetrics(parmJQuery('#' + previousLeftElementId));
        var rightMetrics = getItemMetrics(parmJQuery('#' + previousRightElementId));
        var currentMetrics = getItemMetrics(parmJQuery('#' + currentElementId));

        var relativeTopDifference = currentMetrics.topOffset - leftMetrics.topOffset;
        var relativeBottomDifference = leftMetrics.bottomEdge - currentMetrics.topOffset;
        var leftBottomToRightBottomDiff = leftMetrics.bottomEdge - rightMetrics.bottomEdge;
        var rightBottomToLeftBottomDiff = rightMetrics.bottomEdge - leftMetrics.bottomEdge;

        var preferredColumn = null; // 0 for left, 1 for right
        var requiresOffsetAdjustment = null;

        if (globalState.currentLayoutDetails.totalCols > 1) {
            if (leftMetrics.bottomEdge >= currentMetrics.topOffset + browserHeightAdjustment) {
                preferredColumn = 1; // Right column
            }
            if (rightMetrics.bottomEdge > leftMetrics.bottomEdge) {
                preferredColumn = 0; // Left column
            }
            if (leftMetrics.bottomEdge === rightMetrics.bottomEdge) {
                // If equal, maintain previous assignment or default to left
                // For simplicity, we can let the previous conditions dictate or default to left (0)
                // If preferredColumn is still null, it will default to 0
            }

            if (preferredColumn === 1) { // If placed on right column
                if ((relativeTopDifference < 40 && relativeTopDifference >= 0) ||
                    (leftBottomToRightBottomDiff < 40 && rightBottomToLeftBottomDiff < 40)) {
                    requiresOffsetAdjustment = 1;
                }
            }
        }

        return {
            columnSide: preferredColumn,
            offsetBadge: requiresOffsetAdjustment,
            current: currentMetrics,
            left: leftMetrics,
            right: rightMetrics
        };
    }

    function applyItemPositioning(itemElement) {
        var placementInfo = determineColumnPlacement(itemElement);

        if (placementInfo.columnSide === 1) {
            itemElement.addClass('inverted-layout');
        } else {
            itemElement.removeClass('inverted-layout');
        }
        if (placementInfo.offsetBadge === 1) {
            itemElement.addClass('item-offset');
        } else {
            itemElement.removeClass('item-offset');
        }
    }

    function processTimelineItems(elementsArray, currentIndex) {
        var currentElement = parmJQuery(elementsArray[currentIndex]);
        applyItemPositioning(currentElement);

        if (currentIndex < (globalState.totalItems - 1)) {
            processTimelineItems(elementsArray, currentIndex + 1);
        } else {
            refreshAllItemPositions();
        }
    }

    function refreshAllItemPositions() {
        var timelineContainer = parmJQuery('ul.timeline-component');
        parmJQuery('li', timelineContainer).each(function() {
            applyItemPositioning(parmJQuery(this));
        });
    }

    parmJQuery.fn.timelineComponent = function (options) {
        globalState.allTimelineItems = this;
        var numberOfItems = globalState.allTimelineItems.length;

        if (!globalState.allTimelineItems || numberOfItems === 0) {
            return;
        }

        globalState.userConfiguration = parmJQuery.extend({
            badgeStyle: 'vertical-badge',
            initialCategory: 'medium', // Corresponds to 'md'
            startingIndex: 0
        }, options);

        globalState.totalItems = numberOfItems;

        globalState.currentLayoutDetails = calculateLayout();
        globalState.browserType = determineBrowser();

        parmJQuery('html, body').addClass(globalState.browserType === 'firefox' ? 'browser-gecko' : (globalState.browserType === 'safari' ? 'browser-webkit' : ''));

        parmJQuery(globalState.allTimelineItems).addClass(globalState.currentLayoutDetails.gridClasses);
        parmJQuery('.badge', globalState.allTimelineItems).addClass('visible-lg visible-md ' + globalState.userConfiguration.badgeStyle);

        if (globalState.currentLayoutDetails.totalCols === 1) {
            parmJQuery('.timeline-component').removeClass('two-column-layout');
        } else {
            if (parmJQuery('.timeline-wrapper').find('.two-column-layout').length === 0) {
                parmJQuery('.timeline-component').addClass('two-column-layout');
            }
        }

        globalState.allTimelineItems.attr('id', function (index) {
            var existingId = this.id;
            if (existingId && existingId.length > 0) {
                return existingId;
            } else {
                return 'timelineItem_' + index;
            }
        });

        processTimelineItems(globalState.allTimelineItems, 0);

        if (typeof imagesLoaded !== 'undefined' && parmJQuery.isFunction(imagesLoaded)) {
            parmJQuery('.timeline-component').imagesLoaded(function () {
                refreshAllItemPositions();
            });
        }

        parmJQuery(window).on('resize', function () {
            debounceEvent(function () {
                refreshAllItemPositions();
                globalState.currentLayoutDetails = calculateLayout();
                if (globalState.currentLayoutDetails.totalCols === 1) {
                    parmJQuery('.timeline-component').removeClass('two-column-layout');
                } else {
                    if (parmJQuery('.timeline-wrapper').find('.two-column-layout').length === 0) {
                        parmJQuery('.timeline-component').addClass('two-column-layout');
                    }
                }
            }, 500, 'timeline_resize_debounce');
        });
    };
}(jQuery));