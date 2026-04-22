// Dynamic Grid Layout Plugin for jQuery - Version 0.1.11
//
// Usage terms - Flexible Grid for jQuery
// Distributed under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
//
// Copyright 2009-2013 xlune.com All rights reserved.
// (http://blog.xlune.com/2009/09/jqueryvgrid.html)
//
(function(jQueryAlias) {
	// Calculates the positions for all elements within the grid container.
	function calculateLayoutPositions(hostElement) {
		// Retrieve the collection of child elements managed by the grid.
		var _gridItems = hostElement.data("_gridChildren");
		// Get the current width of the container.
		var _containerWidth = hostElement.width();
		// Initialize the layout map with the full container width at depth 0.
		var _layoutMap = [[0, _containerWidth, 0]];
		// Variables to track maximum height, current item, its dimensions, and placement point.
		var _maxHeight = 0, _currentItem, _itemDimensions, _placementPoint;

		// Iterate over each child element to determine its position.
		_gridItems.each(function(index) {
			_currentItem = jQueryAlias(this);
			// Skip elements that are not displayed.
			if (_currentItem.css("display") === "none") {
				return true;
			}

			// Determine the size of the current item, including margins and padding.
			_itemDimensions = getItemSizeWithMargins(_currentItem);
			// Find the optimal point to place the current item in the layout.
			_placementPoint = findPlacementPoint(_layoutMap, _itemDimensions[0]);
			// Update the layout map to reflect the space taken by the new item.
			_layoutMap = adjustPlacementAreas(_layoutMap, _placementPoint, _itemDimensions);
			// Update the maximum height reached by any item.
			_maxHeight = Math.max(_maxHeight, _placementPoint[1] + _itemDimensions[1]);
			// Store the calculated left and top positions directly on the item's data.
			_currentItem.data("_itemLeftPosition", _placementPoint[0]);
			_currentItem.data("_itemTopPosition", _placementPoint[1]);
		});
		// Store the total calculated height of the grid.
		hostElement.data("_totalGridHeight", _maxHeight);
		// Apply the calculated height to the container.
		updateContainerHeight(hostElement);
	}

	// Determines the most suitable point within the layout matrix to place a new item.
	function findPlacementPoint(layoutMatrix, itemWidth) {
		// Create a copy and sort the matrix by depth to find the shallowest available space.
		var _sortedMatrix = layoutMatrix.concat().sort(sortMapByDepth);
		// Get the maximum depth encountered in the matrix.
		var _currentMaxDepth = _sortedMatrix[_sortedMatrix.length - 1][2];

		// Iterate through the sorted matrix to find an opening.
		for (var i = 0, maxIndex = _sortedMatrix.length; i < maxIndex; i++) {
			// If we've reached or exceeded the maximum depth, no shallower spot is found.
			if (_sortedMatrix[i][2] >= _currentMaxDepth) break;
			// Check if the current segment has enough width for the item.
			if (_sortedMatrix[i][1] - _sortedMatrix[i][0] >= itemWidth) {
				return [_sortedMatrix[i][0], _sortedMatrix[i][2]];
			}
		}
		// If no suitable spot is found, place it at the beginning of the next row.
		return [0, _currentMaxDepth];
	}

	// Modifies the layout matrix to account for a newly placed item.
	function adjustPlacementAreas(layoutMatrix, placementPoint, itemDimensions) {
		// Clone and sort the matrix to work with.
		var _sortedMatrix = layoutMatrix.concat().sort(sortMapByDepth);
		// Define the area taken by the new item: [x_start, x_end, y_bottom].
		var _itemCell = [placementPoint[0], placementPoint[0] + itemDimensions[0], placementPoint[1] + itemDimensions[1]];

		// Process each segment in the matrix.
		for (var i = 0, maxIndex = _sortedMatrix.length; i < maxIndex; i++) {
			// If a matrix segment is completely covered by the new item, remove it.
			if (_itemCell[0] <= _sortedMatrix[i][0] && _sortedMatrix[i][1] <= _itemCell[1]) {
				delete _sortedMatrix[i];
			}
			// Otherwise, trim the segment if it overlaps.
			else {
				_sortedMatrix[i] = trimMapSegmentWidth(_sortedMatrix[i], _itemCell);
			}
		}
		// Combine the modified matrix with the new item's cell, then normalize.
		return combineMapSegments(_sortedMatrix, _itemCell);
	}

	// Comparison function for sorting matrix segments by depth (Y-coordinate), then by X.
	function sortMapByDepth(segmentA, segmentB) {
		// Handle null or undefined segments gracefully.
		if (!segmentA || !segmentB) return 0;
		// Sort primarily by depth, then by X-coordinate if depths are equal.
		return ((segmentA[2] === segmentB[2] && segmentA[0] > segmentB[0]) || segmentA[2] > segmentB[2]) ? 1 : -1;
	}

	// Comparison function for sorting matrix segments by X-coordinate.
	function sortMapByXCoordinate(segmentA, segmentB) {
		// Handle null or undefined segments gracefully.
		if (!segmentA || !segmentB) return 0;
		// Sort solely by X-coordinate.
		return (segmentA[0] > segmentB[0]) ? 1 : -1;
	}

	// Merges adjacent or overlapping segments in the layout matrix.
	function combineMapSegments(layoutMatrix, newCell) {
		// Add the new cell and sort by X-coordinate.
		var _combinedMatrix = layoutMatrix.concat([newCell]).sort(sortMapByXCoordinate);
		var _mergedSegments = [];

		// Iterate through the sorted segments to merge them.
		for (var i = 0, maxIndex = _combinedMatrix.length; i < maxIndex; i++) {
			// Skip null or deleted segments.
			if (!_combinedMatrix[i]) continue;

			// If the current segment can be merged with the last merged segment.
			if (_mergedSegments.length > 0 &&
				_mergedSegments[_mergedSegments.length - 1][1] === _combinedMatrix[i][0] &&
				_mergedSegments[_mergedSegments.length - 1][2] === _combinedMatrix[i][2]) {
				// Extend the last merged segment's width.
				_mergedSegments[_mergedSegments.length - 1][1] = _combinedMatrix[i][1];
			} else {
				// Otherwise, add the current segment as a new merged segment.
				_mergedSegments.push(_combinedMatrix[i]);
			}
		}
		return _mergedSegments;
	}

	// Trims a segment's width if it overlaps with another cell's bounds.
	function trimMapSegmentWidth(segmentA, segmentB) {
		// Check for overlap in the X-dimension.
		if ((segmentA[0] >= segmentB[0] && segmentA[0] < segmentB[1]) || (segmentA[1] >= segmentB[0] && segmentA[1] < segmentB[1])) {
			// If segmentA's start is within segmentB.
			if (segmentA[0] >= segmentB[0] && segmentA[0] < segmentB[1]) {
				segmentA[0] = segmentB[1]; // Shift segmentA's start to segmentB's end.
			}
			// If segmentA's end is within segmentB.
			else {
				segmentA[1] = segmentB[0]; // Shift segmentA's end to segmentB's start.
			}
		}
		return segmentA;
	}

	// Calculates the full outer dimensions (width and height) of a child element, including margins, padding, and borders.
	function getItemSizeWithMargins(gridChild) {
		var _calculatedWidth = gridChild.width();
		var _calculatedHeight = gridChild.height();

		// Add horizontal box model properties.
		_calculatedWidth += parseNumericValue(gridChild.css("margin-left")) +
							parseNumericValue(gridChild.css("padding-left")) +
							parseNumericValue(gridChild.css("border-left-width")) +
							parseNumericValue(gridChild.css("margin-right")) +
							parseNumericValue(gridChild.css("padding-right")) +
							parseNumericValue(gridChild.css("border-right-width"));

		// Add vertical box model properties.
		_calculatedHeight += parseNumericValue(gridChild.css("margin-top")) +
							 parseNumericValue(gridChild.css("padding-top")) +
							 parseNumericValue(gridChild.css("border-top-width")) +
							 parseNumericValue(gridChild.css("margin-bottom")) +
							 parseNumericValue(gridChild.css("padding-bottom")) +
							 parseNumericValue(gridChild.css("border-bottom-width"));

		return [_calculatedWidth, _calculatedHeight];
	}

	// Converts a string to an integer, returning 0 if parsing fails.
	function parseNumericValue(inputString) {
		var parsedNumber = parseInt(inputString, 10);
		// Check if the result is a valid number.
		if (isNaN(parsedNumber)) {
			return 0; // Default to zero if not a number.
		}
		return parsedNumber;
	}

	// Retrieves a numeric value, falling back to a default if the value is not a finite number.
	function retrieveNumericOption(valueToCheck, defaultValue) {
		// Ensure defaultValue is a finite number, otherwise use 0.
		defaultValue = typeof(defaultValue) === "number" && isFinite(defaultValue) ? defaultValue : 0;
		// Ensure valueToCheck is a finite number, otherwise use the (validated) defaultValue.
		valueToCheck = typeof(valueToCheck) === "number" && isFinite(valueToCheck) ? valueToCheck : defaultValue;
		return valueToCheck;
	}

	// Adjusts the main container's height, potentially with animation.
	function updateContainerHeight(hostElement) {
		var _currentGrid = hostElement;
		// Get animation duration from options, defaulting to 500ms.
		var _animationDuration = retrieveNumericOption(_currentGrid.data("_gridOptions").time, 500);
		// Calculate total delay for height adjustment, based on child count and item delay.
		var _totalDelay = _currentGrid.data("_gridChildren").length *
						  (_currentGrid.data("_gridOptions").delay || 0) +
						  _animationDuration;

		// Stop any ongoing animations on the container.
		_currentGrid.stop(false, true);

		// If current height is less than the calculated required height, expand it.
		if (_currentGrid.height() < _currentGrid.data("_totalGridHeight")) {
			// If the browser doesn't support advanced cloning (older jQuery compatibility).
			if (!jQueryAlias.support.noCloneEvent) {
				_currentGrid.height(_currentGrid.data("_totalGridHeight"));
			} else {
				// Animate the height to the new calculated value.
				_currentGrid.animate(
					{
						height: _currentGrid.data("_totalGridHeight") + "px"
					},
					_animationDuration,
					"easeOutQuart"
				);
			}
		}
		// If current height is greater or equal, potentially shrink it after a delay.
		else {
			// Clear any pending height adjustment timeouts.
			clearTimeout(_currentGrid.data("_gridResizeTimeout"));
			_currentGrid.data("_gridResizeTimeout", setTimeout(function() {
				// Apply height change, possibly animated.
				if (!jQueryAlias.support.noCloneEvent) {
					_currentGrid.height(_currentGrid.data("_totalGridHeight"));
				} else {
					_currentGrid.animate(
						{
							height: _currentGrid.data("_totalGridHeight") + "px"
						},
						_animationDuration,
						"easeOutQuart"
					);
				}
			}, _totalDelay));
		}
	}

	// Immediately applies calculated left/top positions to grid children without animation.
	function applyDirectPositions(gridChildren) {
		var _currentItem;
		// Iterate through each child and set its CSS position.
		gridChildren.each(function(index) {
			_currentItem = jQueryAlias(this);
			_currentItem.css("left", _currentItem.data("_itemLeftPosition") + "px");
			_currentItem.css("top", _currentItem.data("_itemTopPosition") + "px");
		});
	}

	// Animates grid children to their calculated left/top positions.
	function applyAnimatedPositions(gridChildren, transitionStyle, animationTime, animationDelay) {
		var _parentContainer = jQueryAlias(gridChildren).parent();
		var _movementDetected = false;
		var totalItems = gridChildren.length;
		var i, _currentItem, _currentPos;

		// Check if any item needs to move.
		for (i = 0; i < totalItems; i++) {
			_currentItem = jQueryAlias(gridChildren[i]);
			_currentPos = _currentItem.position();
			// If current position differs from target position, movement is needed.
			if (_currentPos.left != _currentItem.data("_itemLeftPosition") || _currentPos.top != _currentItem.data("_itemTopPosition")) {
				_movementDetected = true;
			}
		}

		// Only proceed with animation if movement is detected.
		if (_movementDetected) {
			// Trigger onStart callback if defined in options.
			if (typeof(_parentContainer.data("_gridOptions").onStart) === "function") {
				_parentContainer.data("_gridOptions").onStart();
			}

			// Animate each child with a staggered delay.
			gridChildren.each(function(index) {
				var _currentItem = jQueryAlias(this);
				var _animationSettings = {
					duration: animationTime,
					easing: transitionStyle
				};

				// If this is the last item, attach the onFinish callback.
				if (totalItems - 1 === index) {
					_animationSettings.complete = _parentContainer.data("_gridOptions").onFinish || null;
				}

				// Clear any previous animation timeout for this item.
				clearTimeout(_currentItem.data("_itemAnimationTimeout"));
				_currentItem.data("_itemAnimationTimeout", setTimeout(function() {
					_currentItem.animate(
						{
							left: _currentItem.data("_itemLeftPosition") + "px",
							top: _currentItem.data("_itemTopPosition") + "px"
						},
						_animationSettings
					);
				}, index * animationDelay)); // Staggered delay for each item.
			});
		}
	}

	// Handles the full process of refreshing the grid layout.
	function handleLayoutUpdate(targetElements) {
		targetElements.each(function(itemNum) {
			var _currentGrid = jQueryAlias(this);
			// Clear any pending layout update timeouts.
			clearTimeout(_currentGrid.data("_itemAnimationTimeout"));
			_currentGrid.data("_itemAnimationTimeout", setTimeout(function() {
				// Recalculate positions.
				calculateLayoutPositions(_currentGrid);
				// Animate items to their new positions.
				applyAnimatedPositions(
					_currentGrid.data("_gridChildren"),
					_currentGrid.data("_gridOptions").easing || "linear",
					retrieveNumericOption(_currentGrid.data("_gridOptions").time, 500),
					retrieveNumericOption(_currentGrid.data("_gridOptions").delay, 0)
				);
			}, retrieveNumericOption(_currentGrid.data("_gridOptions").wait, 500))); // Delay before starting refresh.
		});
	}

	// Sets up a listener to detect changes in font size, triggering a grid refresh.
	function setupFontSizeObserver(hostElement, callbackFunction) {
		// Create a hidden span to monitor font size changes.
		var fontWatcher = jQueryAlias("<span />")
			.text(" ")
			.attr("id", "dynamicGridFontSizeMonitor")
			.hide()
			.appendTo("body");

		// Store initial font size and set up a polling timer.
		fontWatcher.data("currentFontSize", fontWatcher.css("font-size"));
		fontWatcher.data("monitorTimer", setInterval(function() {
			// If font size has changed, update stored size and trigger callback.
			if (fontWatcher.css("font-size") != fontWatcher.data("currentFontSize")) {
				fontWatcher.data("currentFontSize", fontWatcher.css("font-size"));
				callbackFunction(hostElement);
			}
		}, 1000)); // Check every second.
	}

	// Attaches load event handlers to images within the grid to trigger layout updates.
	function setupImageLoadHandler(hostElement, callbackFunction) {
		// Prevent attaching event multiple times.
		if (!hostElement.data("grid-image-events-attached")) {
			hostElement.data("grid-image-events-attached", 1);
			// Custom event triggered when new content is added.
			hostElement.on("grid-content-added", function() {
				// Find all images and attach load handlers if not already done.
				hostElement.find("img").each(function() {
					var imgElement = jQueryAlias(this);
					if (!imgElement.data("grid-image-load-handled")) {
						imgElement.data("grid-image-load-handled", 1);
						imgElement.on("load", function() {
							callbackFunction(hostElement); // Refresh grid on image load.
						});
					}
				});
			});
		}
		// Trigger the custom event immediately for existing images.
		hostElement.trigger("grid-content-added");

		// Override default append/prepend methods to trigger the custom event.
		var originalAppend = hostElement.append;
		var originalPrepend = hostElement.prepend;

		hostElement.append = function() {
			originalAppend.apply(hostElement, arguments);
			hostElement.trigger("grid-content-added");
		};
		hostElement.prepend = function() {
			originalPrepend.apply(hostElement, arguments);
			hostElement.trigger("grid-content-added");
		};
	}

	// Extend jQuery's prototype with our grid functions.
	jQueryAlias.fn.extend({
		// Initializes the flexible grid layout on selected elements.
		flexibleGrid: function(gridOptions) {
			var _gridTarget = jQueryAlias(this);
			var _currentOptions = gridOptions || {};

			// Handle legacy 'easeing' option if present.
			if (_currentOptions.easeing) {
				_currentOptions.easing = _currentOptions.easeing;
			}

			_gridTarget.each(function() {
				var _currentGrid = jQueryAlias(this);
				_currentGrid.data("_gridOptions", _currentOptions);
				// Store all direct children as grid items.
				_currentGrid.data("_gridChildren", _currentGrid.find("> *"));
				_currentGrid.data("_defaultChildren", _currentGrid.data("_gridChildren")); // Keep a reference to initial children.

				// Apply necessary CSS for positioning.
				_currentGrid.css({
					"position": "relative",
					"width": "auto"
				});
				_currentGrid.data("_gridChildren").css("position", "absolute");

				// Calculate and apply initial positions.
				calculateLayoutPositions(_currentGrid);
				applyDirectPositions(_currentGrid.data("_gridChildren"));

				// Handle fade-in effect if enabled.
				if (_currentGrid.data("_gridOptions").fadeIn) {
					var _fadeInProps = (typeof(_currentGrid.data("_gridOptions").fadeIn) === "object") ?
						_currentGrid.data("_gridOptions").fadeIn :
						{time: _currentGrid.data("_gridOptions").fadeIn};

					_currentGrid.data("_gridChildren").each(function(index) {
						var _currentItem = jQueryAlias(this);
						// Skip hidden items.
						if (_currentItem.css("display") === "none") {
							return true;
						}
						// Set initial opacity to 0 and then fade in with a delay.
						_currentItem.stop(false, true).css({opacity: 0});
						setTimeout(function() {
							_currentItem.stop(false, true).fadeTo(_fadeInProps.time || 250, 1);
						}, index * (_fadeInProps.delay || 0));
					});
				}

				// Attach resize event handler to the window.
				jQueryAlias(window).resize(function(event) {
					handleLayoutUpdate(_currentGrid);
				});

				// Set up image load event listener if enabled.
				if (_currentOptions.useLoadImageEvent) setupImageLoadHandler(_currentGrid, handleLayoutUpdate);
				// Set up font size change listener if enabled.
				if (_currentOptions.useFontSizeListener) setupFontSizeObserver(_currentGrid, handleLayoutUpdate);
			});
			return _gridTarget; // Allow chaining.
		},

		// Refreshes the layout of the grid, recalculating positions and animating items.
		rearrangeGrid: function(transitionStyle, animationTime, animationDelay, completionCallback) {
			var _gridTarget = jQueryAlias(this);
			_gridTarget.each(function() {
				var _gridInstance = jQueryAlias(this);
				var _instanceOptions = _gridInstance.data("_gridOptions") || {};

				// Ensure grid children data is up to date.
				if (_gridInstance.data("_gridChildren")) {
					_gridInstance.data("_gridChildren", _gridInstance.find("> *"));
					_gridInstance.data("_gridChildren").css("position", "absolute");

					calculateLayoutPositions(_gridInstance); // Recalculate all item positions.

					// Determine animation parameters, using defaults if not provided.
					animationTime = retrieveNumericOption(animationTime, retrieveNumericOption(_gridInstance.data("_gridOptions").time, 500));
					animationDelay = retrieveNumericOption(animationDelay, retrieveNumericOption(_gridInstance.data("_gridOptions").delay, 0));

					// Animate items to their new positions.
					applyAnimatedPositions(
						_gridInstance.data("_gridChildren"),
						transitionStyle || _gridInstance.data("_gridOptions").easing || "linear",
						animationTime,
						animationDelay
					);

					// Execute a callback function after all animations complete.
					if (typeof(completionCallback) === 'function') {
						setTimeout(
							completionCallback,
							_gridInstance.data("_gridChildren").length * animationDelay + animationTime
						);
					}
				}
				// Re-attach image load handler if enabled.
				if (_instanceOptions.useLoadImageEvent) setupImageLoadHandler(_gridInstance, handleLayoutUpdate);
			});
			return _gridTarget; // Allow chaining.
		},

		// Sorts the grid items based on a provided comparison function.
		sortGridItems: function(sortFunction, transitionStyle, animationTime, animationDelay) {
			var _gridTarget = jQueryAlias(this);
			_gridTarget.each(function() {
				var _gridInstance = jQueryAlias(this);
				if (_gridInstance.data("_gridChildren")) {
					// Sort the internal collection of grid children.
					_gridInstance.data("_gridChildren", _gridInstance.data("_gridChildren").sort(sortFunction));
					// Re-append children to the DOM in the new sorted order.
					_gridInstance.data("_gridChildren").each(function(itemNum) {
						jQueryAlias(this).appendTo(_gridInstance);
					});

					calculateLayoutPositions(_gridInstance); // Recalculate positions for the new order.
					// Animate items to their new positions.
					applyAnimatedPositions(
						_gridInstance.data("_gridChildren"),
						transitionStyle || _gridInstance.data("_gridOptions").easing || "linear",
						retrieveNumericOption(animationTime, retrieveNumericOption(_gridInstance.data("_gridOptions").time, 500)),
						retrieveNumericOption(animationDelay, retrieveNumericOption(_gridInstance.data("_gridOptions").delay, 0))
					);
				}
			});
			return _gridTarget; // Allow chaining.
		}
	});
})(jQuery);