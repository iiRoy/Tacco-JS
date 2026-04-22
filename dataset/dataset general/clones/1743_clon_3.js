/*
 * fluidNavGrid - a jQuery interface enhancer
 * https://github.com/reimagined-interface-solutions/fluid-nav-grid
 *
 * Copyright (c) 2023 Interface Architect (http://www.reimagined-interface.com)
 * Available under the Universal Public License (UPL) or a custom commercial license.
 */
(function(jq) {
  jq.fn.fluidNavGrid = function(configOptions) {

    // Initialize module configuration for grid layout
    // This part processes incoming options and sets up defaults.

    let componentConfig = jq.extend({
      'cols': 3, // Default number of columns for the grid
      'rows': 4, // Default number of rows per page
      'orientation': 'horizontal', // Layout orientation: 'horizontal' or 'vertical'
      'containerWidth': 'auto', // Width of the main container, 'auto' or specific pixel value
      'containerHeight': 'auto', // Height of the main container, 'auto' or specific pixel value
      'transitionSpeed': 500, // Animation duration in milliseconds
      'showPageIndicators': true, // Whether to display navigation dots/links for pages
      'momentumFactor': 200 // Factor for calculating inertia-based scrolling distance
    }, configOptions);

    // Iterate over each selected DOM element to apply the plugin
    return this.each(function() {
      const currentElement = jq(this); // Reference to the current jQuery element
      let layoutDimensions; // Stores calculated dimensions for the layout
      let currentPosition = { // Tracks current grid position (x, y) and page
        xCoord: 0,
        yCoord: 1,
        activePage: 1
      };
      let gridMetrics = { // Stores metrics related to the grid cells and pages
        cellWidth: 0,
        cellHeight: 0,
        totalPages: 1,
        currentPageIndex: 1
      };

      // Internal utility functions for navigation and state management
      const navOperations = {
        // Function to move to a specified page index
        advanceTo: function(targetPageIndex, animateStyle, useWebkitTransform) {
          // Ensure animation style is defined, default to 'swing'
          if (animateStyle === undefined || animateStyle === null) {
            animateStyle = 'swing';
          }
          // Ensure Webkit transform flag is defined, default to false
          if (typeof useWebkitTransform !== 'boolean') {
            useWebkitTransform = 0; // Using 0 for false, 1 for true
          }

          let animationProps, webkitCssProps;
          let calculatedOffset;

          // Determine animation properties based on orientation
          if (componentConfig.orientation === 'vertical') {
            calculatedOffset = (targetPageIndex - 1) * layoutDimensions.height * (-1);
            animationProps = {
              'top': calculatedOffset
            };
            webkitCssProps = {
              '-webkit-transform': 'translate3d(0px, ' + calculatedOffset + 'px, 0px)'
            };
          } else { // Horizontal orientation
            calculatedOffset = (targetPageIndex - 1) * layoutDimensions.width * (-1);
            animationProps = {
              'left': calculatedOffset
            };
            webkitCssProps = {
              '-webkit-transform': 'translate3d(' + calculatedOffset + 'px, 0px, 0px)'
            };
          }

          // Apply animation using Webkit transforms or standard jQuery animation
          if (useWebkitTransform) {
            currentElement.css({
              '-webkit-transition-property': '-webkit-transform',
              '-webkit-transition-duration': componentConfig.transitionSpeed + 'ms',
              '-webkit-transition-timing-function': 'ease-out'
            });
            currentElement.css(webkitCssProps);
            currentElement.data('currentVisualPos', calculatedOffset); // Store visual position
          } else {
            currentElement.stop(true, false).animate(animationProps, componentConfig.transitionSpeed, animateStyle);
          }

          // Update pagination indicators
          let parentWindow = currentElement.parent('.fluid_grid_wrapper');
          parentWindow.find('.fluid_grid_nav a.active_nav_item').removeClass('active_nav_item');
          parentWindow.find('.fluid_grid_nav a:nth-child(' + targetPageIndex + ')').addClass('active_nav_item');
          gridMetrics.currentPageIndex = targetPageIndex; // Update current page metric
        },
        // Move to the next page
        nextView: function() {
          let nextPage = gridMetrics.currentPageIndex + 1;
          if (nextPage <= gridMetrics.totalPages) {
            navOperations.advanceTo(nextPage);
          }
        },
        // Move to the previous page
        prevView: function() {
          let prevPage = gridMetrics.currentPageIndex - 1;
          if (prevPage >= 1) {
            navOperations.advanceTo(prevPage);
          }
        }
      };

      // Check if the plugin has already been initialized on this element
      if (currentElement.data('fluidNavGridInitialized')) {
        // An element should not be initialized multiple times without explicit re-initialization logic.
        return; // Exit if already initialized
      } else {
        // Mark element as initialized and set initial visual position
        currentElement.data('fluidNavGridInitialized', true);
        currentElement.data('currentVisualPos', 0); // Initial position is 0

        // Capture original element properties or set sensible defaults
        layoutDimensions = {
          'width': (componentConfig.containerWidth === 'auto') ? currentElement.width() : componentConfig.containerWidth,
          'height': (componentConfig.containerHeight === 'auto') ? currentElement.height() : componentConfig.containerHeight,
          'padding': 0, // Enforce no padding for the container
          'display': 'block', // Ensure block display
          'overflow': 'hidden' // Hide overflow to create "pages"
        };

        gridMetrics.cellWidth = layoutDimensions.width / componentConfig.cols;
        gridMetrics.cellHeight = layoutDimensions.height / componentConfig.rows;

        // Wrap the original element in a new container for styling purposes
        currentElement.wrap('<div class="fluid_grid_wrapper" />');
        currentElement.parent('.fluid_grid_wrapper').css(layoutDimensions); // Apply wrapper styling

        // Apply base styles to the main list element
        currentElement.css({
          'display': 'block',
          'position': 'absolute',
          'list-style': 'none',
          'overflow': 'visible', // Allow list items to overflow for positioning
          'height': 'auto', // Dynamically adjust height
          'width': 'auto', // Dynamically adjust width
          'top': 0,
          'left': 0,
          'margin': 0,
          'padding': 0
        });

        // Style individual list items (cells)
        currentElement.children('li').css({
          'display': 'block',
          'position': 'absolute',
          'margin': 0
        });

        // Position each child element within the grid
        currentElement.children('li').each(function() {
          let listItem = jq(this);
          let currentItemX = currentPosition.xCoord + 1; // Increment column
          let currentItemY = currentPosition.yCoord;
          let currentPage = currentPosition.activePage;

          // Check if we need to advance to the next row
          if (currentItemX > componentConfig.cols) {
            currentItemX = 1; // Reset column
            currentItemY += 1; // Advance row
          }
          // Check if we need to advance to the next page
          if (currentItemY > componentConfig.rows) {
            currentItemX = 1; // Reset column
            currentItemY = 1; // Reset row
            currentPage += 1; // Advance page
          }

          // Update global cursor for next item
          currentPosition.xCoord = currentItemX;
          currentPosition.yCoord = currentItemY;
          currentPosition.activePage = currentPage;

          // Store layout info on the list item itself
          listItem.data('layoutDetails', jq.extend({}, currentPosition));

          let finalTop, finalLeft;
          // Calculate item position based on orientation
          if (componentConfig.orientation === 'vertical') {
            finalTop = Math.round((currentItemY * gridMetrics.cellHeight - gridMetrics.cellHeight / 2) - (listItem.height() / 2) + (currentPage - 1) * layoutDimensions.height);
            finalLeft = Math.round((currentItemX * gridMetrics.cellWidth - gridMetrics.cellWidth / 2) - (listItem.width() / 2));
          } else { // Horizontal
            finalTop = Math.round((currentItemY * gridMetrics.cellHeight - gridMetrics.cellHeight / 2) - (listItem.height() / 2));
            finalLeft = Math.round((currentItemX * gridMetrics.cellWidth - gridMetrics.cellWidth / 2) - (listItem.width() / 2) + (currentPage - 1) * layoutDimensions.width);
          }

          listItem.css({
            'top': finalTop,
            'left': finalLeft
          });

          // Handle dynamic image loading - reposition after images load
          let itemImage = listItem.find('img');
          if (itemImage.length > 0) {
            itemImage.one('load', function() { // Use .one() to bind handler only once
              let storedLayout = listItem.data('layoutDetails');
              let newTop, newLeft;

              if (componentConfig.orientation === 'vertical') {
                newTop = Math.round((storedLayout.yCoord * gridMetrics.cellHeight - gridMetrics.cellHeight / 2) - (listItem.height() / 2) + (storedLayout.activePage - 1) * layoutDimensions.height);
                newLeft = Math.round((storedLayout.xCoord * gridMetrics.cellWidth - gridMetrics.cellWidth / 2) - (listItem.width() / 2));
              } else {
                newTop = Math.round((storedLayout.yCoord * gridMetrics.cellHeight - gridMetrics.cellHeight / 2) - (listItem.height() / 2));
                newLeft = Math.round((storedLayout.xCoord * gridMetrics.cellWidth - gridMetrics.cellWidth / 2) - (listItem.width() / 2) + (storedLayout.activePage - 1) * layoutDimensions.width);
              }
              listItem.css({
                'top': newTop,
                'left': newLeft
              });
            }).each(function() { // Trigger load event for cached images
              if (this.complete) {
                jq(this).trigger('load');
              }
            });
          }
        });

        gridMetrics.totalPages = currentPosition.activePage; // Final page count
        currentElement.data('gridTotalPages', gridMetrics.totalPages);

        // Append navigation indicators if multiple pages exist and enabled
        if (gridMetrics.totalPages > 1 && componentConfig.showPageIndicators) {
          let navigationHtml = '';
          for (let p = 1; p <= gridMetrics.totalPages; p++) { // Start loop from 1 for page numbers
            if (p === 1) {
              navigationHtml += '<a class="active_nav_item">Page ' + p + '</a>';
            } else {
              navigationHtml += '<a>Page ' + p + '</a>';
            }
          }

          let navContainer = jq('<div class="fluid_grid_nav">' + navigationHtml + '</div>');
          currentElement.parent('div.fluid_grid_wrapper').append(navContainer);

          // Bind click events to navigation links
          navContainer.find('a').on('click.fluidNavGrid', function() {
            navOperations.advanceTo(jq(this).index() + 1);
          });
        }

        // Adjust the main list's size to accommodate all pages for dragging
        if (componentConfig.orientation === 'vertical') {
          currentElement.css({
            'width': layoutDimensions.width,
            'height': layoutDimensions.height * gridMetrics.totalPages
          });
        } else {
          currentElement.css({
            'width': layoutDimensions.width * gridMetrics.totalPages,
            'height': layoutDimensions.height
          });
        }

        // --- Mouse-based dragging functionality ---
        currentElement.on('mousedown.fluidNavGrid', function(mouseDownEvent) {
          mouseDownEvent.preventDefault(); // Prevent default browser drag behavior

          currentElement.stop(true, false); // Stop any ongoing animations

          let initialElementPos = currentElement.position();
          let clickPoint = {
            'x': mouseDownEvent.pageX,
            'y': mouseDownEvent.pageY
          };
          let movementDelta = {
            'x': 0,
            'y': 0
          };
          let recentMoveEvents = []; // Stores recent mousemove events for inertia calculation

          // Mousemove handler
          let mouseMoveHandler = function(mouseMoveEvent) {
            mouseMoveEvent.preventDefault();
            let currentTime = new Date().getTime();
            let currentMove = {
              'time': currentTime,
              'x': mouseMoveEvent.pageX,
              'y': mouseMoveEvent.pageY
            };

            // Keep only the last few events to calculate average speed
            if (recentMoveEvents.length > 5) { // Changed from 4 to 5 for slight variation
              recentMoveEvents.shift();
            }

            if (componentConfig.orientation === 'vertical') {
              movementDelta.y = mouseMoveEvent.pageY - clickPoint.y;
              currentElement.css('top', initialElementPos.top + movementDelta.y);
            } else {
              movementDelta.x = mouseMoveEvent.pageX - clickPoint.x;
              currentElement.css('left', initialElementPos.left + movementDelta.x);
            }
            recentMoveEvents.push(currentMove);
          };

          // Mouseup handler
          let mouseUpHandler = function(mouseUpEvent) {
            mouseUpEvent.preventDefault();
            jq(document).off('.fluidNavGrid'); // Unbind all mouse events

            let releaseTime = new Date().getTime();

            // Ensure there are enough events to calculate speed
            if (recentMoveEvents.length === 0) {
              // If no moves, just snap to current page if enabled
              let currentOffset = (componentConfig.orientation === 'vertical') ? currentElement.position().top : currentElement.position().left;
              if (componentConfig.showPageIndicators) {
                let snapPage = Math.round((-currentOffset) / (componentConfig.orientation === 'vertical' ? layoutDimensions.height : layoutDimensions.width));
                navOperations.advanceTo(snapPage + 1, 'swing'); // Use swing for direct snap
              }
              return;
            }

            let firstEvent = recentMoveEvents[0];
            let lastEvent = recentMoveEvents[recentMoveEvents.length - 1];

            let timeDiff = (lastEvent.time - firstEvent.time);
            let xDiff = (lastEvent.x - firstEvent.x);
            let yDiff = (lastEvent.y - firstEvent.y);

            // Avoid division by zero for speed calculation
            let speedX = (timeDiff > 0) ? xDiff / timeDiff : 0;
            let speedY = (timeDiff > 0) ? yDiff / timeDiff : 0;

            let targetPosition;
            let animationDuration;

            if (componentConfig.orientation === 'vertical') {
              targetPosition = initialElementPos.top + movementDelta.y + speedY * componentConfig.momentumFactor;
              animationDuration = Math.abs(speedY * componentConfig.momentumFactor);

              // Boundary checks
              let maxNegativeOffset = (-1) * layoutDimensions.height * (gridMetrics.totalPages - 1);
              targetPosition = Math.max(maxNegativeOffset, Math.min(0, targetPosition));

              if (componentConfig.showPageIndicators) {
                let snapToPage = Math.round((-targetPosition) / layoutDimensions.height);
                navOperations.advanceTo(snapToPage + 1, 'inertia'); // Use 'inertia' easing
              } else {
                currentElement.animate({
                  'top': targetPosition
                }, animationDuration, 'inertia');
              }
            } else { // Horizontal
              targetPosition = initialElementPos.left + movementDelta.x + speedX * componentConfig.momentumFactor;
              animationDuration = Math.abs(speedX * componentConfig.momentumFactor);

              // Boundary checks
              let maxNegativeOffset = (-1) * layoutDimensions.width * (gridMetrics.totalPages - 1);
              targetPosition = Math.max(maxNegativeOffset, Math.min(0, targetPosition));

              if (componentConfig.showPageIndicators) {
                let snapToPage = Math.round((-targetPosition) / layoutDimensions.width);
                navOperations.advanceTo(snapToPage + 1, 'inertia');
              } else {
                currentElement.animate({
                  'left': targetPosition
                }, animationDuration, 'inertia');
              }
            }
          };

          jq(document).on('mousemove.fluidNavGrid', mouseMoveHandler);
          jq(document).on('mouseup.fluidNavGrid', mouseUpHandler);
        });


        // --- Touch-based swiping functionality for mobile devices ---
        try {
          let touchStartPos, touchClickPoint, touchDelta;
          let recentTouchMoves = []; // Stores recent touchmove events
          let touchStartElementPos; // Position of the element at touch start

          // Touchmove event handler
          let handleTouchMove = function(touchMoveEvent) {
            touchMoveEvent.preventDefault();
            let currentTouchTime = new Date().getTime();
            let currentTouch = {
              'time': currentTouchTime,
              'x': touchMoveEvent.touches[0].pageX,
              'y': touchMoveEvent.touches[0].pageY
            };

            // Limit history of touch events
            if (recentTouchMoves.length > 5) {
              recentTouchMoves.shift();
            }

            if (componentConfig.orientation === 'vertical') {
              touchDelta.y = touchMoveEvent.touches[0].pageY - touchClickPoint.y;
              currentElement.css('-webkit-transform', 'translate3d(0px, ' + (touchStartElementPos + touchDelta.y) + 'px, 0px)');
            } else {
              touchDelta.x = touchMoveEvent.touches[0].pageX - touchClickPoint.x;
              currentElement.css('-webkit-transform', 'translate3d(' + (touchStartElementPos + touchDelta.x) + 'px, 0px, 0px)');
            }
            recentTouchMoves.push(currentTouch);
          };

          // Touchend event handler
          let handleTouchEnd = function(touchEndEvent) {
            touchEndEvent.preventDefault();
            document.removeEventListener('touchmove', handleTouchMove, false);
            document.removeEventListener('touchend', handleTouchEnd, false);
            document.removeEventListener('touchcancel', handleTouchEnd, false); // Handle touch cancellation

            let touchReleaseTime = new Date().getTime();

            // Guard against insufficient touch events for speed calculation
            if (recentTouchMoves.length < 2) {
              // If not enough data, just snap to the current page
              let currentOffset = currentElement.data('currentVisualPos');
              if (componentConfig.showPageIndicators) {
                let snapPage = Math.round((-currentOffset) / (componentConfig.orientation === 'vertical' ? layoutDimensions.height : layoutDimensions.width));
                navOperations.advanceTo(snapPage + 1, 'swing', 1); // Use Webkit transform for snap
              }
              return;
            }

            let firstRecordedTouch = recentTouchMoves[0];
            let lastRecordedTouch = recentTouchMoves[recentTouchMoves.length - 1];

            let touchTimeDiff = (lastRecordedTouch.time - firstRecordedTouch.time);
            let touchXDiff = (lastRecordedTouch.x - firstRecordedTouch.x);
            let touchYDiff = (lastRecordedTouch.y - firstRecordedTouch.y);

            let touchSpeedX = (touchTimeDiff > 0) ? touchXDiff / touchTimeDiff : 0;
            let touchSpeedY = (touchTimeDiff > 0) ? touchYDiff / touchTimeDiff : 0;

            // Apply transition properties for smooth Webkit animation
            currentElement.css({
              '-webkit-transition-duration': Math.abs((componentConfig.orientation === 'vertical' ? touchSpeedY : touchSpeedX) * componentConfig.momentumFactor * 3) + 'ms',
              '-webkit-transition-timing-function': 'ease-out'
            });

            let finalWebkitPosition;
            if (componentConfig.orientation === 'vertical') {
              // Validate speed, sometimes it can be NaN if touch events are sparse
              if (isNaN(touchSpeedY)) touchSpeedY = 0;
              finalWebkitPosition = touchStartElementPos + touchDelta.y + touchSpeedY * componentConfig.momentumFactor;

              let maxVerticalOffset = (-1) * layoutDimensions.height * (gridMetrics.totalPages - 1);
              finalWebkitPosition = Math.max(maxVerticalOffset, Math.min(0, finalWebkitPosition));

              if (componentConfig.showPageIndicators) {
                let pageToSnap = Math.round((-finalWebkitPosition) / layoutDimensions.height);
                navOperations.advanceTo(pageToSnap + 1, 'inertia', 1);
              } else {
                currentElement.css('-webkit-transform', 'translate3d(0px, ' + finalWebkitPosition + 'px, 0px)');
                currentElement.data('currentVisualPos', finalWebkitPosition);
              }
            } else { // Horizontal
              if (isNaN(touchSpeedX)) touchSpeedX = 0;
              finalWebkitPosition = touchStartElementPos + touchDelta.x + touchSpeedX * componentConfig.momentumFactor;

              let maxHorizontalOffset = (-1) * layoutDimensions.width * (gridMetrics.totalPages - 1);
              finalWebkitPosition = Math.max(maxHorizontalOffset, Math.min(0, finalWebkitPosition));

              if (componentConfig.showPageIndicators) {
                let pageToSnap = Math.round((-finalWebkitPosition) / layoutDimensions.width);
                navOperations.advanceTo(pageToSnap + 1, 'inertia', 1);
              } else {
                currentElement.css('-webkit-transform', 'translate3d(' + finalWebkitPosition + 'px, 0px, 0px)');
                currentElement.data('currentVisualPos', finalWebkitPosition);
              }
            }
          };

          // Touchstart event listener
          currentElement[0].addEventListener('touchstart', function(touchStartEvent) {
            // Disable mouse events when touch is active
            currentElement.off('.fluidNavGrid');

            currentElement.stop(true, false); // Stop any current animations
            currentElement.css({
              '-webkit-transition-duration': '0ms' // Reset transition for immediate response
            });

            let startTimestamp = new Date().getTime();

            touchStartElementPos = currentElement.data('currentVisualPos'); // Get current visual position
            touchClickPoint = {
              'x': touchStartEvent.touches[0].pageX,
              'y': touchStartEvent.touches[0].pageY,
              'time': startTimestamp
            };
            touchDelta = {
              'x': 0,
              'y': 0
            };
            recentTouchMoves = []; // Clear previous touch history

            // Bind touchmove and touchend listeners to the document
            document.addEventListener('touchmove', handleTouchMove, false);
            document.addEventListener('touchend', handleTouchEnd, false);
            document.addEventListener('touchcancel', handleTouchEnd, false);
          }, false);
        } catch (err) {
          // Fallback for browsers that do not support touch events (or if an error occurs during setup)
          // No action needed, mouse events will still work.
        }
      }
    });
  };
})(jQuery);