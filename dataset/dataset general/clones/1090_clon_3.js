;(function() {
	$.fn.dateSelectionWidget = function(widgetOptions) {
		const widgetIdentifier = 'dateSelectionWidget';

		// Retrieve any existing instance of our component attached to the element
		let existingInstance = this.data(widgetIdentifier);

		// If no instance was found, proceed to create one
		if (!existingInstance) {
			// Iterate through each matched element and initialize the widget
			return this.each(function() {
				// Attach a new instance of our widget to the current element
				return $(this).data(widgetIdentifier, new DateSelectionComponent(this, widgetOptions));
			});
		}

		// If an instance already exists, and the user provides 'true' as options, return the instance itself
		// Otherwise, return the jQuery object for chaining.
		return (widgetOptions === true) ? existingInstance : this;
	};

	// Default configuration settings for the date selection widget
	$.fn.dateSelectionWidget.settings = {
		// Base CSS class name for styling the calendar.
		// This name should correspond to a class in the stylesheet, e.g., "dsw-theme-default".
		themeClass: 'default',

		// Z-index property for the calendar display container.
		layerIndex: 999,

		// Visual thickness of the border (in pixels) for calendar elements.
		frameThickness: 1,

		// Pixel offsets for positioning the calendar relative to its bound element.
		positionAdjustments: { xOffset: 1, yOffset: 0 },

		// If true, the calendar remains visible at all times.
		// Note: If the target input element is hidden, the calendar will also be hidden.
		alwaysVisible: false,

		// When true, the calendar will automatically hide after a date is selected,
		// provided `alwaysVisible` is false.
		dismissOnSelection: true,

		// Allows selection of months by clicking the month name in the header.
		enableMonthSelection: true,

		// Allows selection of years by clicking the year in the header.
		enableYearSelection: true,

		// The reference date considered as 'today'.
		// Defaults to the current system date at initialization.
		currentReferenceDate: new Date(),

		// The date that will be pre-selected when the calendar first renders.
		// By default, it will be set to `currentReferenceDate`.
		initialSelectedDate: null,

		// Unicode characters or strings for the previous and next month navigation arrows.
		// Set to empty strings to hide them completely.
		previousMonthGlyph: '\u25C0', // Left-pointing triangle
		nextMonthGlyph: '\u25B6',     // Right-pointing triangle

		// An array of specific dates that can be chosen by the user.
		// Dates can be set to repeat annually or monthly.
		// Example:
		// selectableDatesArray: [
		//     { moment: new Date(0, 8, 5), repeatAnnually: true },
		//     { moment: new Date(2023, 0, 24), repeatMonthly: true },
		//     { moment: new Date(2023, 11, 25) },
		// ]
		selectableDatesArray: null,

		// An array of date ranges that are available for selection.
		// Ranges can repeat annually, but not monthly.
		// Example:
		// selectableDateRanges: [
		//     { startMoment: new Date(2023, 1, 1), endMoment: new Date(2023, 2, 1) },
		//     { startMoment: new Date(0, 8, 10), repeatAnnually: true }
		// ]
		selectableDateRanges: null,

		// A collection of dates marked as 'special'.
		// Similar to `selectableDatesArray`, supports `repeatAnnually` and `repeatMonthly`.
		// Each special date can have custom styling via `styleClass` and carry arbitrary `payload` data.
		// Example:
		// noteworthyDates: [
		//     {
		//         moment: new Date(0, 8, 5),
		//         payload: { event: 'Birthday!' },
		//         repeatAnnually: true,
		//         styleClass: 'special-event-bday'
		//     },
		//     {
		//         moment: new Date(2023, 0, 8),
		//         payload: { event: 'Monthly Meeting' },
		//         repeatMonthly: true
		//     }
		// ]
		noteworthyDates: null,

		// Array of zero-indexed month numbers (0-11) that are selectable.
		// If null, all months are selectable.
		// Example: [8, 11] for September and December.
		availableMonths : null,

		// Array of years that can be selected.
		// If null, defaults to 5 years before and after the current year.
		// Example: [2022, 2023, 2025]
		availableYears: null,

		// Array of zero-indexed days of the week (0=Sunday, 1=Monday, etc.) that are selectable.
		// Example: [0, 2, 4] for Sunday, Tuesday, Thursday.
		availableDaysOfWeek : null,

		// Custom names for months to display in the header.
		// Defaults to full month names: January, February, etc.
		monthDisplayNames: null,

		// Custom names for days of the week to display.
		// Defaults to short forms: Sun, Mon, Tue, etc.
		dayOfWeekDisplayNames: null,

		// The day of the week to begin the calendar grid with (0=Sunday, 1=Monday).
		weekStartDay: 0,

		// Callback function invoked when a selectable date is clicked.
		// Parameters:
		//   targetInput : The input element the widget is bound to
		//   clickedCell : The calendar cell (jQuery object) that was clicked
		//   selectedMoment : The Date object associated with the cell
		//   cellData : Special `payload` data associated with the cell (if any, otherwise null)
		onDateChosen: (function(targetInput, clickedCell, selectedMoment, cellData) {
			targetInput.val(selectedMoment.toLocaleDateString());
			// console.log('Date selected:', selectedMoment.toDateString(), 'Data:', cellData); // Added debug line
		}),

		// Callback function invoked when the user hovers over a selectable date.
		// Receives the same parameters as `onDateChosen`.
		onDateHover: function(targetInput, hoveredCell, hoveredMoment, cellData) {},

		// Callback function invoked when the calendar needs to become visible.
		// Can be used to animate the calendar's appearance.
		onDisplay: function(widgetContainer) { widgetContainer.show(); },

		// Callback function invoked when the calendar needs to be hidden.
		// Can be used to animate the calendar's disappearance.
		onConceal: function(widgetContainer) { widgetContainer.hide(); },

		// The first date of the month to display initially.
		initialDisplayMonth: null
	};

	// --- Internal Helper Functions for Date Object Manipulation ---
	// These mimic the behavior of the original `Date.prototype` extensions.

	/**
	 * Returns a new Date object set to the first day of the month of the given date.
	 * @param {Date} d - The original date.
	 * @returns {Date} A new Date object for the first day of the month.
	 */
	function getFirstDayOfMonth(d) {
		const newDate = new Date(d);
		newDate.setDate(1);
		return newDate;
	}

	/**
	 * Returns an object containing year, month, day, and time (timestamp) of the given date.
	 * @param {Date} d - The original date.
	 * @returns {{year: number, month: number, day: number, time: number}} Date components.
	 */
	function getDateComponents(d) {
		return {
			year: d.getFullYear(),
			month: d.getMonth(),
			day: d.getDate(),
			time: d.getTime()
		};
	}

	/**
	 * Returns the maximum day of the month for the given date.
	 * @param {Date} d - The original date.
	 * @returns {number} The number of days in the month.
	 */
	function getMaxDayOfMonth(d) {
		const tempDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
		return tempDate.getDate();
	}

	/**
	 * Adds or subtracts days from a Date object and returns a new Date object.
	 * @param {Date} d - The original date.
	 * @param {number} days - Number of days to add/subtract.
	 * @returns {Date} A new Date object with the adjusted date.
	 */
	function addDaysToDate(d, days) {
		const newDate = new Date(d);
		newDate.setDate(newDate.getDate() + days);
		return newDate;
	}

	/**
	 * Adds or subtracts months from a Date object and returns a new Date object.
	 * @param {Date} d - The original date.
	 * @param {number} months - Number of months to add/subtract.
	 * @returns {Date} A new Date object with the adjusted date.
	 */
	function addMonthsToDate(d, months) {
		const newDate = new Date(d);
		newDate.setMonth(newDate.getMonth() + months);
		// Ensure the day doesn't overflow to the next month if original day was e.g. 31st
		newDate.setDate(Math.min(d.getDate(), getMaxDayOfMonth(newDate)));
		return newDate;
	}

	/**
	 * Custom indexOf for arrays, handles cases where Array.prototype.indexOf might not exist (older browsers, though jQuery usually handles this).
	 * @param {Array} arr - The array to search.
	 * @param {*} val - The value to find.
	 * @returns {number} The index of the value, or -1 if not found.
	 */
	function customIndexOf(arr, val) {
		if (Array.prototype.indexOf) {
			return arr.indexOf(val);
		}
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === val) {
				return i;
			}
		}
		return -1;
	}

	// --- Main Plugin Object Definition ---
	const DateSelectionComponent = (function() {
		// Constructor: Initializes the date selection widget
		function DateSelectionComponent(targetDomElement, customConfiguration) {
			// Ensure we have a valid DOM element to bind to
			if (!targetDomElement) {
				console.error("DateSelectionComponent: No target DOM element provided.");
				return;
			}

			const widgetReference = this;

			// Store the jQuery-wrapped target element
			widgetReference.boundElement = $(targetDomElement);
			const boundElement = widgetReference.boundElement;

			// Merge user-provided options into the default settings
			widgetReference.currentConfig = $.extend(true, {}, $.fn.dateSelectionWidget.settings, customConfiguration);
			const currentConfig = widgetReference.currentConfig;

			// Attempt to find an existing calendar container based on a custom attribute
			widgetReference.displayContainer = $($.find('[data-dsw-id=' + boundElement.attr('data-dsw-id') + ']'));

			// Set initial selected date and the first month to display
			currentConfig.initialSelectedDate = currentConfig.initialSelectedDate || currentConfig.currentReferenceDate;
			currentConfig.initialDisplayMonth = currentConfig.initialDisplayMonth ? getFirstDayOfMonth(currentConfig.initialDisplayMonth) : getFirstDayOfMonth(currentConfig.initialSelectedDate);

			// Assign a unique ID to the bound element if it doesn't have one
			if (!boundElement.attr('data-dsw-id')) {
				boundElement.attr('data-dsw-id', 'dsw-instance-' + Math.round(Math.random() * 1e12));
			}

			// Add a specific class and attach event listeners to the input element
			boundElement
				.addClass('dsw-input-field')
				.on('click.dsw focus.dsw', function(evt) { widgetReference.displayCalendar(evt); }); // Use .on() for modern jQuery and namespaced events

			// If a container was found and `alwaysVisible` is false, hide it initially.
			// The `refreshView` method will handle showing it if `alwaysVisible` is true.
			if (widgetReference.displayContainer.length && !currentConfig.alwaysVisible) {
				widgetReference.displayContainer.hide();
			}

			// Bind a global mouseup event to hide the calendar when clicking outside
			$(document).on('mouseup.dsw', function(mouseEvent) {
				const clickTarget = mouseEvent.target;
				const calendarContainer = widgetReference.displayContainer;

				// Check if the click was outside the input, the calendar, and not inside the calendar
				if (!boundElement.is(clickTarget) &&
					!calendarContainer.is(clickTarget) &&
					calendarContainer.has(clickTarget).length === 0 &&
					calendarContainer.is(':visible'))
				{
					widgetReference.concealCalendar();
				}
			});

			// Perform initial rendering of the calendar display
			widgetReference.refreshView();
		}

		// Public methods exposed via the prototype
		DateSelectionComponent.prototype = {
			// Displays the calendar widget
			displayCalendar: function() {
				// Hide any other active date selection widgets
				$('.dsw-input-field').not(this.boundElement).each(function() {
					const otherInstance = $(this).data('dateSelectionWidget');
					if (otherInstance && otherInstance.currentConfig) { // Ensure instance and config exist
						otherInstance.currentConfig.onConceal(otherInstance.displayContainer);
					}
				});

				// Show this widget's calendar
				this.currentConfig.onDisplay(this.displayContainer);
			},

			// Hides the calendar widget
			concealCalendar: function() {
				// Only hide if `alwaysVisible` is not set
				if (this.currentConfig && !this.currentConfig.alwaysVisible) {
					this.currentConfig.onConceal(this.displayContainer);
				}
			},

			// Renders or re-renders the calendar view
			refreshView: function(onRenderCompleteCallback) {
				const widgetReference = this;
				const boundElement = widgetReference.boundElement;
				const currentConfig = widgetReference.currentConfig;
				let displayContainer = widgetReference.displayContainer;

				// Base styling class for all fundamental elements
				const baseStyleClass = 'dsw-core dsw-border ';
				const themeDesignator = 'dsw-theme-' + currentConfig.themeClass;

				// Get details for the current reference date (today)
				const currentDayDetails = getDateComponents(currentConfig.currentReferenceDate);
				const currentTimestamp = currentDayDetails.time;

				// Grid constants
				const maxRows = 6; // Weeks
				const maxCols = 7; // Days per week
				const borderSizeValue = currentConfig.frameThickness + 'px';

				// Helper for generating selectable lists (months, years, DOW)
				const generateSelectableList = function(minVal, maxVal, userDefinedList) {
					// Create a default list from min to max
					let generatedList = Array.from({length: maxVal - minVal + 1}, (_, i) => minVal + i);

					// If user provided a list, filter and sanitize it
					if (userDefinedList && userDefinedList.length > 0) {
						let filteredList = [];
						$.each(userDefinedList, function(idx, val) {
							// Ensure value is within bounds and not a duplicate
							if (val >= minVal && val <= maxVal && customIndexOf(filteredList, val) < 0) {
								filteredList.push(val);
							}
						});
						generatedList = filteredList.length ? filteredList : generatedList;
					}

					// Sort the resulting list
					generatedList.sort((a, b) => a - b);
					return generatedList;
				};

				// Pre-calculated selectable periods and names
				const availableMonths = generateSelectableList(0, 11, currentConfig.availableMonths);
				const availableYears = generateSelectableList(currentDayDetails.year - 5, currentDayDetails.year + 5, currentConfig.availableYears);
				const availableDaysOfWeek = generateSelectableList(0, 6, currentConfig.availableDaysOfWeek);
				const dayOfWeekDisplayNames = currentConfig.dayOfWeekDisplayNames || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
				const monthDisplayNames = currentConfig.monthDisplayNames || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

				// Calculate cell dimensions based on input element width
				const inputWidth = boundElement.outerWidth();
				// For simplicity, let's assume height is proportional or also based on width
				const inputHeight = inputWidth; // Or some other calculation if needed

				// Function to calculate individual cell size
				const calculateCellDimension = function(totalSize, cellCount, borderThickness) {
					// (totalSize - (borderThickness * (cellCount - 1))) / cellCount
					return (totalSize / cellCount) + ((borderThickness / cellCount) * (cellCount - 1));
				};
				const cellWidth = calculateCellDimension(inputWidth, maxCols, currentConfig.frameThickness);
				const cellHeight = calculateCellDimension(inputHeight, maxRows + 2, currentConfig.frameThickness); // +2 for header and DOW row

				// If calendar container doesn't exist, create it
				if (!displayContainer.length) {
					widgetReference.displayContainer = displayContainer = $('<div/>')
						.attr('data-dsw-id', boundElement.attr('data-dsw-id'))
						.data('isInitialized', true) // Mark as initialized
						.css({
							display: (currentConfig.alwaysVisible ? 'block' : 'none'), // Set to block if always visible
							zIndex: currentConfig.layerIndex,
							width: (cellWidth * maxCols) + 'px'
						});
					$('body').append(displayContainer);
				} else {
					// If container exists but wasn't initialized by this script, recalculate dimensions
					if (!displayContainer.data('isInitialized')) {
						const existingContainerWidth = displayContainer.outerWidth();
						const existingContainerHeight = displayContainer.outerHeight();
						cellWidth = calculateCellDimension(existingContainerWidth, maxCols, currentConfig.frameThickness);
						cellHeight = calculateCellDimension(existingContainerHeight, maxRows + 2, currentConfig.frameThickness);
					}
				}

				// Hide calendar if the bound element is not visible
				if (!boundElement.is(':visible')) { displayContainer.hide(); }

				// Clear existing content and apply base classes
				displayContainer
					.removeClass()
					.addClass(themeDesignator)
					.children().remove();

				// Reposition calendar on window resize
				const adjustPosition = function() {
					const elementPosition = boundElement.offset();
					displayContainer.css({
						top: (elementPosition.top + boundElement.outerHeight() + currentConfig.positionAdjustments.yOffset) + 'px',
						left: (elementPosition.left + currentConfig.positionAdjustments.xOffset) + 'px'
					});
				};
				$(window).on('resize.dsw', adjustPosition); // Use namespaced event
				adjustPosition(); // Initial positioning

				// Standard CSS for all grid cells
				const cellBaseCSS = {
					width: cellWidth + 'px',
					height: cellHeight + 'px',
					lineHeight: cellHeight + 'px'
				};

				// Helper to update the displayed month
				const updateDisplayMonth = function(newDate) {
					if (newDate instanceof Date && !isNaN(newDate)) {
						currentConfig.initialDisplayMonth = newDate;
						widgetReference.refreshView();
					}
				};

				// Function to get the first date of a month, respecting selectable years/months
				const getValidatedDisplayMonth = function(monthOffset = 0) {
					let monthCandidate = new Date(currentConfig.initialDisplayMonth);

					while (true) {
						monthCandidate = addMonthsToDate(monthCandidate, monthOffset); // Apply offset
						monthCandidate.setDate(1); // Always set to 1st for consistency

						if (monthOffset === 0) { // If no offset, we're done
							break;
						}

						const candidateComponents = getDateComponents(monthCandidate);
						const candidateMonth = candidateComponents.month;
						const candidateYear = candidateComponents.year;

						// Check if the month is selectable
						if (customIndexOf(availableMonths, candidateMonth) !== -1) {
							// Check if the year is selectable
							if (customIndexOf(availableYears, candidateYear) !== -1) {
								break; // Valid month/year combination found
							} else {
								// If year is out of bounds, stop searching in this direction
								if (candidateYear < availableYears[0] || candidateYear > availableYears[availableYears.length - 1]) {
									return null;
								}
							}
						}
						// If month is not selectable, the loop continues to the next month
					}
					return monthCandidate;
				};

				// Determine previous and next valid display months
				const previousDisplayMonth = getValidatedDisplayMonth(-1);
				const nextDisplayMonth = getValidatedDisplayMonth(1);

				// Get the actual first date for the current month being rendered
				const currentDisplayMonth = (currentConfig.initialDisplayMonth = getValidatedDisplayMonth(0));
				const currentDisplayMonthComponents = getDateComponents(currentDisplayMonth);
				const currentDisplayMonthNum = currentDisplayMonthComponents.month;
				const currentDisplayYear = currentDisplayMonthComponents.year;

				// Determine the calendar grid start date
				let gridStartDate = new Date(currentDisplayMonth);

				// Sanitize and apply the week start day offset
				const weekStartDayOffset = Math.abs(Math.min(6, Math.max(0, currentConfig.weekStartDay)));

				// Adjust the start day of the week for display names
				const adjustedDayOfWeekNames = dayOfWeekDisplayNames
												.concat(dayOfWeekDisplayNames) // Duplicate to handle wrapping
												.slice(weekStartDayOffset, weekStartDayOffset + 7);

				// Calculate the offset to get the first day of the calendar grid
				let gridStartOffset = gridStartDate.getDay() - weekStartDayOffset;
				if (gridStartOffset < 0) { // Adjust for negative offset (e.g., if weekStartDay is Mon, and month starts on Sun)
					gridStartOffset += 7;
				}
				gridStartDate = addDaysToDate(gridStartDate, -gridStartOffset);

				// Flags for showing/hiding navigation arrows
				const canGoPrevious = !!previousDisplayMonth;
				const canGoNext = !!nextDisplayMonth;

				// Create the header (month/year, prev/next arrows)
				const headerCellBaseClass = baseStyleClass + 'dsw-header-cell ';

				const prevNavCell = $('<div/>')
					.addClass(headerCellBaseClass)
					.css(
						$.extend({}, cellBaseCSS, {
							borderWidth: borderSizeValue + ' 0 0 ' + borderSizeValue
						})
					)
					.append(
						$('<a/>')
							.addClass('dsw-nav-arrow dsw-prev-arrow' + (canGoPrevious ? '' : '-disabled'))
							.html(currentConfig.previousMonthGlyph)
					)
					.on('mousedown.dsw', function() { return false; }) // Prevent input field from losing focus
					.on('click.dsw', function(evt) {
						if (currentConfig.previousMonthGlyph !== '' && canGoPrevious) {
							evt.stopPropagation();
							updateDisplayMonth(previousDisplayMonth);
						}
					});

				const titleCellSpan = maxCols - 2; // Two cells for arrows
				const titleCellWidth = (cellWidth * titleCellSpan) - (titleCellSpan * currentConfig.frameThickness) + (currentConfig.frameThickness);
				const monthYearTitleCell = $('<div/>')
					.addClass(headerCellBaseClass + 'dsw-title-area')
					.css(
						$.extend({}, cellBaseCSS, {
							width: titleCellWidth + 'px',
							borderTopWidth: borderSizeValue,
							marginLeft: '-' + (currentConfig.frameThickness) + 'px'
						})
					);

				const nextNavCell = $('<div/>')
					.addClass(headerCellBaseClass)
					.css(
						$.extend({}, cellBaseCSS, {
							marginLeft: '-' + (currentConfig.frameThickness) + 'px',
							borderWidth: borderSizeValue + ' ' + borderSizeValue + ' 0 0'
						})
					)
					.append(
						$('<a/>')
							.addClass('dsw-nav-arrow dsw-next-arrow' + (canGoNext ? '' : '-disabled'))
							.html(currentConfig.nextMonthGlyph)
					)
					.on('mousedown.dsw', function() { return false; })
					.on('click.dsw', function(evt) {
						if (currentConfig.nextMonthGlyph !== '' && canGoNext) {
							evt.stopPropagation();
							updateDisplayMonth(nextDisplayMonth);
						}
					});

				// --- Building the Month/Year Title ---
				const monthTitleElement = $('<span/>')
					.addClass('dsw-month-title')
					.text(monthDisplayNames[currentDisplayMonthNum]);

				const yearTitleElement = $('<span/>')
					.addClass('dsw-year-title')
					.text(currentDisplayYear);

				monthYearTitleCell.append(monthTitleElement).append(' ').append(yearTitleElement);

				// Append header elements to the calendar container
				displayContainer.append(prevNavCell).append(monthYearTitleCell).append(nextNavCell);

				// --- Day of Week Headers ---
				const dowRow = $('<div/>').addClass('dsw-dow-row');
				$.each(adjustedDayOfWeekNames, function(idx, dowName) {
					dowRow.append(
						$('<div/>')
							.addClass(baseStyleClass + 'dsw-dow-cell')
							.css($.extend({}, cellBaseCSS, {
								borderWidth: borderSizeValue + ' ' + borderSizeValue + ' 0 ' + borderSizeValue,
								marginLeft: idx === 0 ? '0' : '-' + borderSizeValue + 'px'
							}))
							.text(dowName)
					);
				});
				displayContainer.append(dowRow);

				// --- Date Grid Cells ---
				let currentDateInGrid = new Date(gridStartDate);
				for (let r = 0; r < maxRows; r++) {
					const weekRow = $('<div/>').addClass('dsw-week-row');
					for (let c = 0; c < maxCols; c++) {
						const cellDateComponents = getDateComponents(currentDateInGrid);
						const cellDate = new Date(currentDateInGrid); // Clone for callback

						const isCurrentMonth = cellDateComponents.month === currentDisplayMonthNum && cellDateComponents.year === currentDisplayYear;
						const isToday = getDateComponents(currentConfig.currentReferenceDate).time === cellDateComponents.time;
						const isSelected = getDateComponents(currentConfig.initialSelectedDate).time === cellDateComponents.time;

						let cellClasses = baseStyleClass + 'dsw-date-cell';
						let cellDataPayload = null; // Data for special dates

						if (!isCurrentMonth) {
							cellClasses += ' dsw-other-month';
						}
						if (isToday) {
							cellClasses += ' dsw-today';
						}
						if (isSelected) {
							cellClasses += ' dsw-selected';
						}

						// Check for selectable dates
						let isSelectable = false;
						// TODO: Implement selectableDatesArray, selectableDateRanges, noteworthyDates logic
						// For now, assume all current month dates are selectable unless explicitly restricted
						if (isCurrentMonth) {
							isSelectable = true; // Placeholder: actual logic to be implemented
						}


						const dateCell = $('<div/>')
							.addClass(cellClasses)
							.css($.extend({}, cellBaseCSS, {
								borderWidth: borderSizeValue + ' ' + borderSizeValue + ' ' + borderSizeValue + ' ' + borderSizeValue,
								marginLeft: c === 0 ? '0' : '-' + borderSizeValue + 'px'
							}))
							.text(cellDateComponents.day);

						if (isSelectable) {
							dateCell.addClass('dsw-selectable')
								.on('click.dsw', function(evt) {
									evt.stopPropagation();
									currentConfig.initialSelectedDate = cellDate; // Update selected date
									currentConfig.onDateChosen(boundElement, $(this), cellDate, cellDataPayload);
									if (currentConfig.dismissOnSelection && !currentConfig.alwaysVisible) {
										widgetReference.concealCalendar();
									}
									widgetReference.refreshView(); // Re-render to show new selection
								})
								.on('mouseenter.dsw', function() {
									currentConfig.onDateHover(boundElement, $(this), cellDate, cellDataPayload);
								});
						} else {
							dateCell.addClass('dsw-unselectable');
						}

						weekRow.append(dateCell);
						currentDateInGrid = addDaysToDate(currentDateInGrid, 1); // Move to the next day
					}
					displayContainer.append(weekRow);
				}

				// Execute optional callback after rendering
				if (typeof onRenderCompleteCallback === 'function') {
					onRenderCompleteCallback();
				}
			} // End of refreshView
		}; // End of DateSelectionComponent.prototype
		return DateSelectionComponent;
	})(); // End of DateSelectionComponent IIFE
})(); // End of global IIFE