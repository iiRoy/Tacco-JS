(function(pluginCore) {
	if(typeof defineModule === 'function' && defineModule.amd) {
		// AMD environment detected, define module with jQuery dependency
		defineModule(['jquery'], pluginCore);
	} else {
		// No AMD, assume jQuery is global
		pluginCore(jQuery);
	}
}(function(jQ) {
	// --- Plugin Configuration and Global Constants ---

	/**
	 * Default configuration options for the date selector plugin.
	 * These can be overridden by user-provided settings.
	 */
	const DEFAULT_CONFIG = {
		showTodayBtn: true,           // Display a button to navigate to today's date
		displayInputField: true,      // Show the formatted date in a non-editable input field within the footer
		startDayOfWeek: 1,            // Start day of the week: 0 for Sunday, 1 for Monday (default), ..., 6 for Saturday
		dateFormatPattern: 'd/m/y',   // Pattern for displaying dates (d, m, y, Y)
		displayFooterSection: true,   // Show the footer containing navigation and date display
		showDayHeaderRow: true,       // Display the row with abbreviated day names (Sun, Mon, etc.)
		displayMode: 'widget',        // 'widget' (default: inline calendar), 'tiny', 'popup', 'page'
		animationSpeedMs: 200,        // Duration of animations in milliseconds
		animationType: '',            // Type of month transition animation: '', 'fade', 'crossfade', 'carousel-horizontal', 'carousel-vertical'
		calendarTableClasses: 'table table-condensed', // CSS classes applied to the calendar table
		startHidden: true,            // For 'popup' mode, whether the calendar is initially hidden
		updateOnMonthChange: true,    // When navigating months, update the linked input element's value
		compactLayout: false,         // Apply a compact styling (e.g., Bootstrap's table-condensed)
		defaultSelectedDate: null     // Initial date to display/select, defaults to current system date if null
	};

	// Constants for calendar grid dimensions
	const DAYS_PER_WEEK = 7;
	const CALENDAR_GRID_WEEKS = 6;
	const TOTAL_CALENDAR_CELLS = DAYS_PER_WEEK * CALENDAR_GRID_WEEKS; // Always 42 cells for consistent layout

	// Current system date, used as a reference point
	const currentSystemDate = new Date();

	// Full and abbreviated month names for display
	const FULL_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const ABBR_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// Full and abbreviated day names for display
	const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const ABBR_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// --- Date Utility Functions (replacing Date.prototype extensions) ---

	/**
	 * Provides utility methods for date calculations and formatting.
	 */
	const CalendarDateUtils = {
		/**
		 * Calculates the number of days in a given month.
		 * @param {Date} dateObj - The reference date.
		 * @param {number} [monthDelta=0] - Offset from the current month (e.g., 0 for current, 1 for next, -1 for previous).
		 * @returns {number} The number of days in the specified month.
		 */
		getDaysInMonth: function(dateObj, monthDelta = 0) {
			// Get the last day of the month by requesting day 0 of the next month (or next+delta month)
			return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1 + monthDelta, 0).getDate();
		},

		/**
		 * Checks if two Date objects represent the same calendar day (ignoring time).
		 * @param {Date} date1 - The first date.
		 * @param {Date} [date2=new Date()] - The second date (defaults to current system date).
		 * @returns {boolean} True if both dates fall on the same day, false otherwise.
		 */
		isSameDay: function(date1, date2 = new Date()) {
			// Basic validation for date objects
			if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
				return false;
			}
			return date1.getFullYear() === date2.getFullYear() &&
				   date1.getMonth() === date2.getMonth() &&
				   date1.getDate() === date2.getDate();
		},

		/**
		 * Validates if the given object is a valid Date instance.
		 * @param {any} obj - The object to validate.
		 * @returns {boolean} True if the object is a valid Date, false otherwise.
		 */
		isValidDate: function(obj) {
			return Object.prototype.toString.call(obj) === "[object Date]" && !isNaN(obj.getTime());
		},

		/**
		 * Formats a Date object into a string based on a provided pattern.
		 * @param {Date} dateObj - The date object to format.
		 * @param {object} pluginConfig - The plugin's configuration object containing `dateFormatPattern`.
		 * @returns {string} The formatted date string.
		 */
		formatDateToString: function(dateObj, pluginConfig) {
			if (!this.isValidDate(dateObj)) {
				return ''; // Return empty string for invalid dates
			}
			let formattedString = pluginConfig.dateFormatPattern;
			const day = dateObj.getDate();
			const month = dateObj.getMonth() + 1;
			const yearFull = dateObj.getFullYear();
			const yearShort = yearFull.toString().substr(-2);

			formattedString = formattedString.replace(/d/g, ('0' + day).slice(-2));
			formattedString = formattedString.replace(/m/g, ('0' + month).slice(-2));
			formattedString = formattedString.replace(/Y/g, yearFull.toString());
			formattedString = formattedString.replace(/y/g, yearShort);

			return formattedString;
		}
	};

	// --- Internal UI Element Builders (formerly pMethods) ---

	/**
	 * Contains functions responsible for constructing and rendering calendar UI components.
	 */
	const CalendarUIBuilder = {
		/**
		 * Renders the main calendar view into a specified target element.
		 * @param {jQ} targetElement - The jQuery object of the element to render into.
		 * @param {Date} activeDate - The date representing the month to display.
		 * @param {object} pluginConfig - The current plugin configuration.
		 * @param {boolean} [clearExistingContent=false] - If true, clears the target element before rendering.
		 * @returns {jQ} The target element with the rendered calendar.
		 */
		renderMainCalendar: function(targetElement, activeDate, pluginConfig, clearExistingContent = false) {
			// Ensure activeDate is a valid Date object, default to current system date
			const dateToRender = CalendarDateUtils.isValidDate(activeDate) ? activeDate : currentSystemDate;

			if (clearExistingContent) {
				targetElement.empty();
			}

			// Build and append header
			this.buildHeaderSection(dateToRender, pluginConfig).appendTo(targetElement);

			// Build and append month grid
			const monthGrid = this.generateMonthTable(dateToRender, pluginConfig).addClass('active-month-grid');
			jQ('<div />')
				.addClass('calendar-month-display')
				.html(monthGrid)
				.appendTo(targetElement);

			// Build and append footer
			this.composeFooterSection(dateToRender, pluginConfig).appendTo(targetElement);

			// Store metadata on the main calendar element
			targetElement.data('isCalendarInitialized', true);
			targetElement.data('currentDate', dateToRender);
			targetElement.data('associatedElement', targetElement); // Self-reference for main widget

			return targetElement;
		},

		/**
		 * Renders a calendar specifically for popup mode, handling wrapper creation.
		 * @param {jQ} targetInput - The jQuery object of the input element triggering the popup.
		 * @param {Date} activeDate - The date representing the month to display.
		 * @param {object} pluginConfig - The current plugin configuration.
		 * @returns {jQ} The target input element.
		 */
		renderPopupCalendar: function(targetInput, activeDate, pluginConfig) {
			const dateToRender = CalendarDateUtils.isValidDate(activeDate) ? activeDate : currentSystemDate;
			let popupWrapper, calendarDisplay;

			// Check if a popup wrapper already exists for this input
			if (targetInput.parent('.calendar-popup-wrapper').length) {
				popupWrapper = targetInput.parent();
				calendarDisplay = popupWrapper.find('.calendar-display');
				calendarDisplay.empty(); // Clear existing content
			} else {
				// Create new wrapper and calendar display elements
				popupWrapper = jQ('<div />').addClass('calendar-popup-wrapper');
				calendarDisplay = jQ('<div />')
					.addClass('calendar-display calendar-popup')
					.width(targetInput.outerWidth(true)); // Match width of the trigger input

				targetInput.wrap(popupWrapper); // Wrap the input with the new wrapper
			}

			targetInput.after(calendarDisplay); // Insert calendar after the input within the wrapper

			// Initially hide the popup if configured
			if (pluginConfig.startHidden) {
				calendarDisplay.hide();
			}

			// Build and append header
			this.buildHeaderSection(dateToRender, pluginConfig).appendTo(calendarDisplay);

			// Build and append month grid
			const monthGrid = this.generateMonthTable(dateToRender, pluginConfig).addClass('active-month-grid');
			jQ('<div />')
				.addClass('calendar-month-display')
				.html(monthGrid)
				.appendTo(calendarDisplay);

			// Build and append footer
			this.composeFooterSection(dateToRender, pluginConfig).appendTo(calendarDisplay);

			// Store metadata on the popup calendar element
			calendarDisplay.data('isCalendarInitialized', true);
			calendarDisplay.data('currentDate', dateToRender);
			calendarDisplay.data('associatedElement', targetInput); // Link back to the original input
			calendarDisplay.data('pluginConfig', pluginConfig); // Store config for this instance

			// Add an affix wrapper to help with positioning (similar to original)
			targetInput.parent().wrap(jQ('<div />').addClass('calendar-affix-container'));

			return targetInput;
		},

		/**
		 * Creates the header section of the calendar, including month/year display and navigation buttons.
		 * @param {Date} displayDate - The date for which to show the month and year.
		 * @param {object} pluginConfig - The current plugin configuration.
		 * @returns {jQ} The jQuery object representing the calendar header.
		 */
		buildHeaderSection: function(displayDate, pluginConfig) {
			const headerContainer = jQ('<div />').addClass('calendar-header');
			const monthNamesArray = pluginConfig.compactLayout ? ABBR_MONTH_NAMES : FULL_MONTH_NAMES;

			jQ('<button />')
				.addClass('prev-month-btn change-month-btn btn')
				.attr('type', 'button')
				.attr('data-month-delta', -1) // Custom data attribute for event delegation
				.html('&laquo;')
				.appendTo(headerContainer);

			jQ('<button />')
				.addClass('next-month-btn change-month-btn btn')
				.attr('type', 'button')
				.attr('data-month-delta', 1) // Custom data attribute for event delegation
				.html('&raquo;')
				.appendTo(headerContainer);

			// Use template literals for cleaner string concatenation
			jQ('<span />')
				.addClass('current-month-display')
				.html(`<div>${monthNamesArray[displayDate.getMonth()]} ${displayDate.getFullYear()}</div>`)
				.appendTo(headerContainer);

			return headerContainer;
		},

		/**
		 * Generates the HTML table for a given month's calendar grid.
		 * @param {Date} monthDate - A date within the month to be displayed.
		 * @param {object} pluginConfig - The current plugin configuration.
		 * @returns {jQ} The jQuery object representing the calendar table.
		 */
		generateMonthTable: function(monthDate, pluginConfig) {
			const calendarTable = jQ('<table />').addClass(pluginConfig.calendarTableClasses);
			const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0);
			const daysInPreviousMonth = CalendarDateUtils.getDaysInMonth(monthDate, -1);
			const startDayOfWeekIndex = pluginConfig.startDayOfWeek % DAYS_PER_WEEK; // Ensure it's 0-6

			// Calculate the offset for the first day of the month
			// day 0 = Sunday, 1 = Monday, ..., 6 = Saturday
			let firstDayOffset = firstDayOfMonth.getDay() - startDayOfWeekIndex;
			if (firstDayOffset < 0) {
				firstDayOffset += DAYS_PER_WEEK; // Adjust for week starting on non-Sunday
			}

			// --- Day Header Row ---
			if (pluginConfig.showDayHeaderRow) {
				const dayHeaderRow = jQ('<tr />').addClass('calendar-day-header');
				for (let i = 0; i < DAYS_PER_WEEK; i++) {
					let dayIndex = (startDayOfWeekIndex + i) % DAYS_PER_WEEK;
					jQ('<th />')
						.text(ABBR_DAY_NAMES[dayIndex])
						.appendTo(dayHeaderRow);
				}
				calendarTable.append(dayHeaderRow);
			}

			// --- Calendar Grid Rows ---
			let currentDayCounter = 0;
			for (let week = 0; week < CALENDAR_GRID_WEEKS; week++) {
				const weekRow = jQ('<tr />');
				for (let day = 0; day < DAYS_PER_WEEK; day++) {
					const dayCell = jQ('<td />');
					let dateToRender, displayDayNumber, cellClasses = [];

					if (currentDayCounter < firstDayOffset) {
						// Days from the previous month
						displayDayNumber = daysInPreviousMonth - firstDayOffset + currentDayCounter + 1;
						dateToRender = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, displayDayNumber);
						cellClasses.push('day-prev-month');
					} else if (currentDayCounter >= firstDayOffset + CalendarDateUtils.getDaysInMonth(monthDate)) {
						// Days from the next month
						displayDayNumber = currentDayCounter - (firstDayOffset + CalendarDateUtils.getDaysInMonth(monthDate)) + 1;
						dateToRender = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, displayDayNumber);
						cellClasses.push('day-next-month');
					} else {
						// Days from the current month
						displayDayNumber = currentDayCounter - firstDayOffset + 1;
						dateToRender = new Date(monthDate.getFullYear(), monthDate.getMonth(), displayDayNumber);
						cellClasses.push('day-current-month');

						// Check if this day is today
						if (CalendarDateUtils.isSameDay(dateToRender, currentSystemDate)) {
							cellClasses.push('day-today');
						}
						// Check if this day is the selected day for this month view
						if (CalendarDateUtils.isSameDay(dateToRender, monthDate)) {
							cellClasses.push('day-selected');
						}
					}

					dayCell.text(displayDayNumber)
						   .addClass(cellClasses.join(' '))
						   .data('fullDateObj', dateToRender) // Store the full Date object
						   .attr('data-day-value', displayDayNumber) // Store the displayed number
						   .attr('data-date-timestamp', dateToRender.getTime()); // Store timestamp for easy retrieval

					weekRow.append(dayCell);
					currentDayCounter++;
				}
				calendarTable.append(weekRow);
			}

			return calendarTable;
		},

		/**
		 * Composes the footer section of the calendar, including today button and formatted date display.
		 * @param {Date} displayDate - The date to display in the footer.
		 * @param {object} pluginConfig - The current plugin configuration.
		 * @returns {jQ} The jQuery object representing the calendar footer.
		 */
		composeFooterSection: function(displayDate, pluginConfig) {
			const footerSection = jQ('<div />').addClass('calendar-footer input-group'); // Using input-group for Bootstrap styling

			if (!pluginConfig.displayFooterSection) {
				footerSection.hide(); // Hide if footer is explicitly disabled
				return footerSection;
			}

			// Add 'Today' button
			if (pluginConfig.showTodayBtn) {
				jQ('<button />')
					.text('Today')
					.addClass('btn btn-primary today-reset-btn') // Use btn-primary for Bootstrap styling
					.attr('type', 'button')
					.attr('data-action', 'today') // Custom data attribute for event delegation
					.appendTo(footerSection);
			}

			// Add formatted date input field
			if (pluginConfig.displayInputField) {
				jQ('<span />')
					.text(CalendarDateUtils.formatDateToString(displayDate, pluginConfig))
					.addClass('form-control uneditable-input date-display-field') // Bootstrap form-control class
					.appendTo(footerSection);
			}

			// Add a hidden input to store the timestamp
			jQ('<input />')
				.prop('type', 'hidden')
				.addClass('selected-date-timestamp')
				.val(displayDate.getTime() / 1000) // Store Unix timestamp
				.appendTo(footerSection);

			return footerSection;
		}
	};

	// --- Plugin Public API (formerly methods) ---

	/**
	 * Defines the public methods available through the jQuery plugin.
	 */
	const CalendarPluginAPI = {
		/**
		 * Initializes the date selector plugin on selected elements.
		 * @param {object} userSettings - User-provided configuration settings.
		 * @returns {jQ} The jQuery object of the elements the plugin was initialized on.
		 */
		initialize: function(userSettings) {
			// Merge user settings with defaults to create the instance's configuration
			const pluginConfig = jQ.extend({}, DEFAULT_CONFIG, userSettings);

			// Setup global event handlers once for all instances
			if (!jQ(document).data('dateSelectorGlobalEventsBound')) {
				CalendarPluginAPI._setupGlobalEvents();
				jQ(document).data('dateSelectorGlobalEventsBound', true);
			}

			return this.each(function() {
				const currentElement = jQ(this);
				let calendarHostElement; // The element where the calendar UI will be rendered

				// Determine if the target element is an input (for popup mode) or a container
				if (currentElement.is(':input')) {
					// If it's an input, create a div next to it to host the calendar
					calendarHostElement = jQ('<div />');
					currentElement.addClass('calendar-target-input').after(calendarHostElement);
				} else {
					// If it's already a div or other container, use it directly
					calendarHostElement = currentElement;
				}

				calendarHostElement.addClass('calendar-container ' + pluginConfig.animationType);
				calendarHostElement.data('pluginConfig', pluginConfig); // Store config on the host element
				calendarHostElement.data('pluginInstance', CalendarPluginAPI); // Store reference to the API

				if (pluginConfig.animationType) {
					calendarHostElement.addClass('has-transition-effects');
				}

				if (pluginConfig.compactLayout) {
					calendarHostElement.addClass('compact-layout');
				}

				// Determine the initial date
				const initialDate = CalendarDateUtils.isValidDate(pluginConfig.defaultSelectedDate) ?
									pluginConfig.defaultSelectedDate :
									currentSystemDate;

				// Render the calendar based on the display mode
				switch (pluginConfig.displayMode) {
					case 'popup':
						currentElement.addClass('popup-trigger-input'); // Mark input as trigger
						CalendarUIBuilder.renderPopupCalendar(currentElement, initialDate, pluginConfig);
						break;
					case 'widget':
					default:
						CalendarUIBuilder.renderMainCalendar(calendarHostElement, initialDate, pluginConfig);
						break;
				}
			});
		},

		/**
		 * Navigates the calendar to a different month.
		 * @param {number|Date} monthChangeDeltaOrDate - Either an integer representing month change (e.g., 1 for next, -1 for previous)
		 *                                               or a specific Date object to jump to.
		 * @param {object} pluginConfig - The configuration object for the current calendar instance.
		 * @param {jQ} calendarContainer - The jQuery object of the calendar's main container.
		 */
		transitionToMonth: function(monthChangeDeltaOrDate, pluginConfig, calendarContainer) {
			const currentDisplayDate = calendarContainer.data('currentDate');
			let newActiveDate;
			let animationDirection = 0; // 1 for forward, -1 for backward

			// Determine the new date based on input
			if (typeof monthChangeDeltaOrDate === 'number') {
				animationDirection = monthChangeDeltaOrDate > 0 ? 1 : -1;
				// Calculate new day, clamping to the max days of the new month (e.g., 31st March to 28th Feb)
				const newDayOfMonth = Math.min(
					CalendarDateUtils.getDaysInMonth(currentDisplayDate, monthChangeDeltaOrDate),
					currentDisplayDate.getDate()
				);
				newActiveDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth() + monthChangeDeltaOrDate, newDayOfMonth);
			} else if (CalendarDateUtils.isValidDate(monthChangeDeltaOrDate)) {
				// If a specific date is provided, use it and determine direction relative to current
				animationDirection = (monthChangeDeltaOrDate.getTime() > currentDisplayDate.getTime()) ? 1 : -1;
				newActiveDate = monthChangeDeltaOrDate;
			} else {
				console.warn("Invalid month change parameter provided to transitionToMonth.");
				return;
			}

			// Update the stored date for the calendar instance
			calendarContainer.data('currentDate', newActiveDate);

			const currentMonthGrid = calendarContainer.find('.active-month-grid');
			const newMonthGrid = CalendarUIBuilder.generateMonthTable(newActiveDate, pluginConfig).addClass('new-month-grid');

			const gridWidth = currentMonthGrid.outerWidth(true);
			const gridHeight = currentMonthGrid.outerHeight(true);

			// Set container height to prevent jumpiness during vertical transitions
			currentMonthGrid.parent().css('height', gridHeight);

			// Apply transition effects based on configuration
			switch (pluginConfig.animationType) {
				case 'fade':
					currentMonthGrid.fadeOut(pluginConfig.animationSpeedMs, function() {
						jQ(this).replaceWith(newMonthGrid.hide().fadeIn(pluginConfig.animationSpeedMs));
					});
					break;
				case 'crossfade':
					currentMonthGrid.removeClass('active-month-grid').stop(true, true).animate({ opacity: 0 }, pluginConfig.animationSpeedMs);
					currentMonthGrid.after(newMonthGrid);
					newMonthGrid.css({ opacity: 0, position: 'absolute', top: 0, left: 0 }).stop(true, true).animate({ opacity: 1 }, pluginConfig.animationSpeedMs);
					break;
				case 'carousel-horizontal':
					currentMonthGrid.css({ position: 'absolute' }).stop(true, true).animate({ left: -(gridWidth * animationDirection) }, pluginConfig.animationSpeedMs);
					currentMonthGrid.after(newMonthGrid);
					newMonthGrid.css({ left: animationDirection * gridWidth, position: 'absolute' }).stop(true, true).animate({ left: 0 }, pluginConfig.animationSpeedMs);
					break;
				case 'carousel-vertical':
					currentMonthGrid.css({ position: 'absolute' }).stop(true, true).animate({ top: -(gridHeight * animationDirection) }, pluginConfig.animationSpeedMs);
					currentMonthGrid.after(newMonthGrid);
					newMonthGrid.css({ top: animationDirection * gridHeight, position: 'absolute' }).stop(true, true).animate({ top: 0 }, pluginConfig.animationSpeedMs);
					break;
				default: // No transition or unknown type
					currentMonthGrid.replaceWith(newMonthGrid);
					break;
			}

			// After animation completes, clean up old grids and update header/footer
			newMonthGrid.promise().done(function() {
				calendarContainer.find('table').not(newMonthGrid).remove(); // Remove any old, non-active tables
				newMonthGrid.removeClass('new-month-grid').addClass('active-month-grid').removeAttr('style'); // Clean up temporary styles
				currentMonthGrid.parent().removeAttr('style'); // Remove fixed height
			});

			// Update header and footer sections
			calendarContainer.find('.calendar-header').replaceWith(CalendarUIBuilder.buildHeaderSection(newActiveDate, pluginConfig));
			calendarContainer.find('.calendar-footer').replaceWith(CalendarUIBuilder.composeFooterSection(newActiveDate, pluginConfig));

			// If configured, update the value of the associated input element
			if (pluginConfig.updateOnMonthChange) {
				const associatedInput = calendarContainer.data('associatedElement');
				if (associatedInput && associatedInput.length && associatedInput.is(':input')) {
					associatedInput.val(CalendarDateUtils.formatDateToString(newActiveDate, pluginConfig)).trigger('change');
				}
			}
		},

		/**
		 * Retrieves the currently selected date from a calendar instance.
		 * @returns {Date|null} The selected Date object, or null if not found.
		 */
		retrieveSelectedDate: function() {
			let calendarRef;
			// If `this` is an input, the calendar is likely its sibling or within its wrapper
			if (jQ(this).is(':input')) {
				calendarRef = jQ(this).next('.calendar-container, .calendar-display');
				if (!calendarRef.length) { // Check parent for popup wrapper structure
					calendarRef = jQ(this).parent('.calendar-popup-wrapper').find('.calendar-display');
				}
			} else {
				// If `this` is the calendar container itself
				calendarRef = jQ(this);
			}

			if (calendarRef.length && calendarRef.data('isCalendarInitialized')) {
				return calendarRef.data('currentDate');
			}
			return null;
		},

		/**
		 * Destroys the calendar instance, removing its DOM elements and unbinding events.
		 * @returns {jQ} The original target element (input or container).
		 */
		destroy: function() {
			return this.each(function() {
				const targetElement = jQ(this);
				let calendarContainer;

				if (targetElement.is(':input')) {
					// For popup mode, remove the created calendar and wrapper
					calendarContainer = targetElement.next('.calendar-display');
					if (!calendarContainer.length) {
						calendarContainer = targetElement.parent('.calendar-popup-wrapper').find('.calendar-display');
					}
					const parentAffix = targetElement.parent('.calendar-popup-wrapper').parent('.calendar-affix-container');
					if (parentAffix.length) {
						parentAffix.after(targetElement); // Move input out of wrappers
						parentAffix.remove(); // Remove wrapper
					}
					targetElement.removeClass('calendar-target-input popup-trigger-input');
				} else {
					// For widget mode, remove the calendar container itself
					calendarContainer = targetElement;
				}

				if (calendarContainer && calendarContainer.length) {
					calendarContainer.remove();
				}

				// Clean up data attributes from the original element
				targetElement.removeData('pluginConfig')
							 .removeData('pluginInstance')
							 .removeData('currentDate')
							 .removeData('associatedElement')
							 .removeData('isCalendarInitialized');
			});
		},

		/**
		 * Refreshes the calendar display, re-rendering the current month.
		 * Useful if external changes affect styling or data.
		 * @returns {jQ} The jQuery object of the elements refreshed.
		 */
		refreshDisplay: function() {
			return this.each(function() {
				const targetElement = jQ(this);
				let calendarInstanceElement; // The actual element holding the calendar UI
				let config;
				let currentDate;

				if (targetElement.is(':input')) {
					// For popup mode, the calendar is a sibling or within a wrapper
					calendarInstanceElement = targetElement.next('.calendar-display');
					if (!calendarInstanceElement.length) {
						calendarInstanceElement = targetElement.parent('.calendar-popup-wrapper').find('.calendar-display');
					}
				} else {
					// For widget mode, the target element IS the calendar container
					calendarInstanceElement = targetElement;
				}

				if (calendarInstanceElement.length && calendarInstanceElement.data('isCalendarInitialized')) {
					config = calendarInstanceElement.data('pluginConfig');
					currentDate = calendarInstanceElement.data('currentDate');

					// Re-render the calendar completely
					calendarInstanceElement.empty();
					CalendarUIBuilder.renderMainCalendar(calendarInstanceElement, currentDate, config); // Re-use main renderer
				}
			});
		},

		/**
		 * Sets up global event handlers using delegation for all calendar instances.
		 * This function is called only once.
		 * @private
		 */
		_setupGlobalEvents: function() {
			jQ(document)
				// Handle month navigation (prev/next buttons)
				.on('click.dateSelector', '.calendar-container .change-month-btn, .calendar-popup .change-month-btn', function(event) {
					event.preventDefault();
					event.stopPropagation(); // Prevent event bubbling up to document click handler

					const clickedButton = jQ(this);
					const monthDelta = parseInt(clickedButton.attr('data-month-delta'), 10);
					const calendarHost = clickedButton.closest('.calendar-container, .calendar-display');
					const pluginConfig = calendarHost.data('pluginConfig');

					if (calendarHost.length && pluginConfig) {
						CalendarPluginAPI.transitionToMonth(monthDelta, pluginConfig, calendarHost);
					}
				})
				// Handle 'Today' button click
				.on('click.dateSelector', '.calendar-container .today-reset-btn, .calendar-popup .today-reset-btn', function(event) {
					event.preventDefault();
					event.stopPropagation();

					const clickedButton = jQ(this);
					const calendarHost = clickedButton.closest('.calendar-container, .calendar-display');
					const pluginConfig = calendarHost.data('pluginConfig');

					if (calendarHost.length && pluginConfig) {
						CalendarPluginAPI.transitionToMonth(currentSystemDate, pluginConfig, calendarHost);
					}
				})
				// Handle individual day cell selection
				.on('click.dateSelector', '.calendar-month-display .day-current-month', function(event) {
					event.preventDefault();
					event.stopPropagation();

					const selectedCell = jQ(this);
					const calendarHost = selectedCell.closest('.calendar-container, .calendar-display');
					const pluginConfig = calendarHost.data('pluginConfig');
					const originalTargetElement = calendarHost.data('associatedElement');

					if (!calendarHost.length || !pluginConfig || !originalTargetElement) {
						return;
					}

					// Remove 'day-selected' from previously selected cell within this grid
					calendarHost.find('.day-selected').removeClass('day-selected');
					selectedCell.addClass('day-selected');

					const newlySelectedDate = selectedCell.data('fullDateObj');
					calendarHost.data('currentDate', newlySelectedDate); // Update the calendar's current date

					// Update footer with new selected date
					calendarHost.find('.calendar-footer').replaceWith(CalendarUIBuilder.composeFooterSection(newlySelectedDate, pluginConfig));

					// Trigger custom event on the original element
					originalTargetElement.trigger('dateSelectedEvt', [newlySelectedDate]);

					// If in popup mode, update the input field and close the popup
					if (pluginConfig.displayMode === 'popup') {
						originalTargetElement.val(CalendarDateUtils.formatDateToString(newlySelectedDate, pluginConfig)).trigger('change');
						calendarHost.hide().closest('.calendar-popup-wrapper').removeClass('is-open');
					}
				})
				// Handle popup trigger input click to show calendar
				.on('click.dateSelector', '.popup-trigger-input', function(event) {
					event.preventDefault();
					event.stopPropagation(); // Stop propagation to prevent document click from immediately closing it

					const triggerInput = jQ(this);
					const popupWrapper = triggerInput.parent('.calendar-popup-wrapper');
					const calendarDisplay = popupWrapper.find('.calendar-display');

					// Close any other open popups
					jQ('.calendar-popup-wrapper.is-open').not(popupWrapper).removeClass('is-open').find('.calendar-display').hide();

					// Toggle visibility of this popup
					popupWrapper.toggleClass('is-open');
					calendarDisplay.toggle();
				})
				// Handle clicks outside of open popup calendars to close them
				.on('click.dateSelector', function(event) {
					const target = jQ(event.target);
					// If the click is not inside any popup wrapper, close all open popups
					if (!target.closest('.calendar-popup-wrapper').length) {
						jQ('.calendar-popup-wrapper.is-open').removeClass('is-open').find('.calendar-display').hide();
					}
				});
		}
	};

	// --- Plugin Entry Point ---

	/**
	 * Main entry point for the jQuery plugin.
	 * Dispatches calls to appropriate public API methods.
	 * @param {string|object} actionName - The name of the method to call, or an options object for initialization.
	 * @returns {jQ} The jQuery object, allowing for method chaining.
	 */
	jQ.fn.dateSelector = function(actionName) {
		// Check if the requested action is a public method
		if (CalendarPluginAPI[actionName] && typeof CalendarPluginAPI[actionName] === 'function' && actionName !== 'initialize' && actionName !== '_setupGlobalEvents') {
			// Call the method, passing additional arguments
			return CalendarPluginAPI[actionName].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof actionName === 'object' || !actionName) {
			// If no method name is provided, or an options object is given, initialize the plugin
			return CalendarPluginAPI.initialize.apply(this, arguments);
		} else {
			// Handle unknown method calls
			jQ.error('Method ' + actionName + ' does not exist on jQ.fn.dateSelector');
			return this; // Return 'this' for chaining, even on error
		}
	};
}));