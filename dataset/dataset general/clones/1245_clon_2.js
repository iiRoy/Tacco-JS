/**
 * ChronoGrid 1.0.0
 * jQuery date selector component/large view plugin with Bootstrap compatibility
 *
 * Jane Doe 2024
 *
 * https://github.com/janedoe/ChronoGrid
 **/

(function (moduleBuilder) {
	if (typeof declareComponent === 'function' && declareComponent.amd) {
		declareComponent(['domLibrary'], moduleBuilder);
	} else {
		moduleBuilder(DomLib);
	}
}(function (jq) {
	const baseOptions = {
		showCurrentDayBtn: true,			// Should the button to reset to the current day appear?
		displayInputBox: true,			// Display the date input field
		startOfWeekDay: 1,				// First day of the week. 0 for Sunday, 6 for Saturday, 1 for Monday (default)
		isWidgetMode: true,				// Is it primarily a widget?
		cellAspect: 1,					// Ratio for calendar cells (unused in this version)
		dateFormatPattern: 'dd/mm/yy',	// Pattern for date display
		hasFooterSection: true,			// Include a footer area?
		displayDayHeaders: true,		// Show headers for weekdays?
		displayMode: 'embedded',		// 'embedded' (default), 'compact', 'floating', 'fullpage'
		animationSpeed: 250,			// Duration for transitions in milliseconds
		effectType: '',					// Type of visual transition: '', 'fading', 'blendEffect', 'slideHorizontal', 'slideVertical'
		gridStyles: 'table table-bordered table-sm', // CSS classes for the calendar grid
		initiallyConcealed: true,		// Is the popup calendar hidden at first?
		updateOnMonthSwitch: true,		// Update associated input field when month changes
		compactLayout: false			// Use a more compact visual layout
	};

	let currentMoment = new Date();

	const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const abbrMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const fullWeekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const abbrWeekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Obtain the total number of days within the specified month (offset by monthOffset)
	Date.prototype.getDaysInMonthRange = function (monthOffset) {
		monthOffset = monthOffset === undefined ? 0 : monthOffset;

		return new Date(this.getFullYear(), this.getMonth() + 1 + monthOffset, 0).getDate();
	};

	// Checks if this date object represents the same day as another specified date
	Date.prototype.isSameDayAs = function (comparisonDate) {
		if (comparisonDate === undefined) {
			comparisonDate = new Date();
		}

		return this.getFullYear() === comparisonDate.getFullYear()
			&& this.getMonth() === comparisonDate.getMonth()
			&& this.getDate() === comparisonDate.getDate();
	};

	// Determines if the Date object holds a valid date
	Date.prototype.isValidDateObject = function () {
		return Object.prototype.toString.call(this) === "[object Date]" && !isNaN(this.getTime());
	};

	jq.fn.dateNavigator = function (action) {
		// Internal utility functions and handlers
		const internalHelpers = {
			renderMainCalendar: function (chosenDate, clearExisting) {
				const settings = jq(this).data('config');

				chosenDate = chosenDate || currentMoment;

				if (clearExisting !== undefined && clearExisting === true) {
					this.empty();
				}

				internalHelpers.createHeaderSection(chosenDate, settings).appendTo(this);

				const monthView = internalHelpers
					.buildMonthGrid(chosenDate, settings)
					.addClass('active-view');

				jq('<div />')
					.addClass('date-grid-container')
					.html(monthView)
					.appendTo(this);

				internalHelpers.constructFooterArea(chosenDate, settings).appendTo(this);

				jq(this).data('dateNavigator', true);
				jq(this).data('currentDateValue', chosenDate);
				jq(this).data('originalElement', this);

				return this;
			},
			renderFloatingCalendar: function (chosenDate, clearExisting) {
				const settings = jq(this).data('config');

				chosenDate = chosenDate || currentMoment;

				let popupWrapper, floatCalendar;

				if (jq(this).parent('.date-float-wrapper').length) {
					popupWrapper = jq(this).parent();
					floatCalendar = jq(this).parent().find('.date-float-panel');
					floatCalendar.empty();
				} else {
					popupWrapper = jq('<div />').addClass('date-float-wrapper');
					floatCalendar = jq('<div />')
						.addClass('dateNavigator date-float-panel')
						.width(jq(this).outerWidth(true));

					jq(this).wrap(popupWrapper);
				}

				jq(this).after(floatCalendar);

				if (settings.initiallyConcealed) {
					floatCalendar.hide();
				}

				internalHelpers.createHeaderSection(chosenDate, settings).appendTo(floatCalendar);

				const monthView = internalHelpers
					.buildMonthGrid(chosenDate, settings)
					.addClass('active-view');

				jq('<div />')
					.addClass('date-grid-container')
					.html(monthView)
					.appendTo(floatCalendar);

				floatCalendar.data('dateNavigator', true);
				floatCalendar.data('currentDateValue', chosenDate);
				floatCalendar.data('originalElement', this);
				floatCalendar.data('config', settings);

				jq(this).parent().wrap(jq('<div />').addClass('date-anchor'));

				return this;
			},
			createHeaderSection: function (inputDate, configSettings) {
				const headerPanel = jq('<div />').addClass('date-panel-header');
				const displayMonthNames = configSettings.abbrMonthNames ? abbrMonthNames : fullMonthNames;

				jq('<button />')
					.addClass('prev-period-btn nav-btn btn')
					.html('&lsaquo;')
					.appendTo(headerPanel);

				jq('<button />')
					.addClass('next-period-btn nav-btn btn')
					.html('&rsaquo;')
					.appendTo(headerPanel);

				jq('<span />')
					.addClass('month-info')
					.append('<div>' + displayMonthNames[inputDate.getMonth()] + ' ' + inputDate.getFullYear() + '</div>')
					.appendTo(headerPanel);

				return headerPanel;
			},
			buildMonthGrid: function (inputDate, configSettings) {
				inputDate = inputDate || currentMoment;
				const firstDayOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1, 0, 0, 0);
				const allDaysInGrid = [];
				const gridRows = [];
				const calendarGrid = jq('<table />').addClass(configSettings.gridStyles);

				const prevMonthPad = firstDayOfMonth.getDay() - configSettings.startOfWeekDay;
				const currentMonthDays = inputDate.getDaysInMonthRange();
				const nextMonthPad = 42 - prevMonthPad - currentMonthDays;

				const prevMonthTotalDays = inputDate.getDaysInMonthRange(-1);

				// Generate the header row for weekdays
				if (configSettings.displayDayHeaders) {
					const gridHeaderRow = jq('<tr />');

					for (let weekdayIndex = 0; weekdayIndex <= 6; weekdayIndex++) {
						let adjustedDay = weekdayIndex + configSettings.startOfWeekDay;

						if (adjustedDay > 6) {
							adjustedDay = weekdayIndex - 6;
						}

						jq('<th />')
							.text(abbrWeekdayNames[adjustedDay])
							.appendTo(gridHeaderRow);
					}

					calendarGrid.append(gridHeaderRow);
				}

				// Populate days from the previous month
				for (let i = 1; i <= prevMonthPad; i++) {
					const dayNum = (prevMonthTotalDays - prevMonthPad) + i;

					allDaysInGrid.push({
						dayValue: new Date(inputDate.getFullYear(), inputDate.getMonth() - 1, dayNum, 0, 0, 0),
						dayNumberText: dayNum,
						cellClasses: 'previous-month-cell'
					});
				}

				// Populate days for the current month
				for (let i = 1; i <= currentMonthDays; i++) {
					const dayCellData = {
						dayValue: new Date(inputDate.getFullYear(), inputDate.getMonth(), i, 0, 0, 0),
						dayNumberText: i,
						cellClasses: ''
					};

					// Apply 'current-day-marker' class if this is today's date
					dayCellData.cellClasses = dayCellData.dayValue.isSameDayAs() ? 'current-day-marker' : '';

					// Apply 'chosen-day-marker' class if this date is the one selected
					dayCellData.cellClasses += dayCellData.dayValue.isSameDayAs(inputDate) ? ' chosen-day-marker' : '';

					allDaysInGrid.push(dayCellData); // Add day data to the main array
				}

				// Populate days from the next month
				for (let i = 1; i <= nextMonthPad; i++) {
					allDaysInGrid.push({
						dayValue: new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, i, 0, 0, 0),
						dayNumberText: i,
						cellClasses: 'next-month-cell'
					});
				}

				// Divide the array of days into week-long rows
				gridRows.push(allDaysInGrid.slice(0, 7));
				gridRows.push(allDaysInGrid.slice(7, 14));
				gridRows.push(allDaysInGrid.slice(14, 21));
				gridRows.push(allDaysInGrid.slice(21, 28));
				gridRows.push(allDaysInGrid.slice(28, 35));
				gridRows.push(allDaysInGrid.slice(35));

				// Attach rows and cells to the table
				for (let rowIdx = 0; rowIdx < 6; rowIdx++) {
					const tableRow = jq('<tr />');

					for (let colIdx = 0; colIdx < 7; colIdx++) {
						const dayCellData = gridRows[rowIdx][colIdx];

						jq('<td />')
							.data('dayValue', dayCellData.dayValue)
							.text(dayCellData.dayNumberText)
							.addClass(dayCellData.cellClasses)
							.appendTo(tableRow);
					}

					tableRow.appendTo(calendarGrid);
				}

				return calendarGrid;
			},
			constructFooterArea: function (inputDate, configSettings) {
				const footerContainer = jq('<div />').addClass('date-panel-footer input-addon');

				if (configSettings.hasFooterSection === false) {
					footerContainer.hide();
				}

				if (configSettings.showCurrentDayBtn) {
					jq('<button />')
						.text('Today')
						.addClass('btn today-selection-btn')
						.attr('type', 'button')
						.appendTo(footerContainer);
				}

				if (configSettings.displayInputBox) {
					jq('<span />')
						.text(internalHelpers.formatDateString(inputDate, configSettings))
						.addClass('display-input-field read-only-field size-medium')
						.appendTo(footerContainer);
				}

				jq('<input />')
					.prop('type', 'hidden')
					.val(parseInt(inputDate.getTime() / 1000), 10)
					.appendTo(footerContainer);

				return footerContainer;
			},
			// Simple date formatting utility. Does the job.
			formatDateString: function (inputDate, configSettings) {
				return configSettings.dateFormatPattern
					.replace('dd', ('0' + inputDate.getDate()).slice(-2))
					.replace('mm', ('0' + (inputDate.getMonth() + 1)).slice(-2))
					.replace('yy', inputDate.getFullYear().toString().slice(-2))
					.replace('yyyy', inputDate.getFullYear());
			}
		};

		const publicInterface = {
			initialize: function (userSettings) {
				const finalOptions = jq.extend({}, baseOptions, userSettings);

				// Global event listeners (bound once)
				if (!jq(document).data('date-nav-events-bound')) {
					jq(document).on('tap.dateNav', '.dateNavigator .nav-btn', function (evt) {
						evt.preventDefault();
						evt.stopPropagation();

						publicInterface.navigateMonth.apply(jq(this).closest('.dateNavigator'), [jq(this).hasClass('next-period-btn') ? 1 : -1, jq(this).closest('.dateNavigator').data('config')]);
					})
						.on('tap.dateNav', '.today-selection-btn', function () {
							publicInterface.navigateMonth.apply(jq(this).closest('.dateNavigator'), [currentMoment, jq(this).closest('.dateNavigator').data('config')]);
						})
						.on('tap.dateNav', '.dateNavigator table.active-view td', function () {
							const parentContainer = jq(this).closest('.dateNavigator');
							const activeTable = jq(this).closest('table');

							activeTable.find('.chosen-day-marker').removeClass('chosen-day-marker');

							jq(this).addClass('chosen-day-marker');

							parentContainer.find('.date-panel-footer').replaceWith(internalHelpers.constructFooterArea(jq(this).data('dayValue'), jq(this).closest('.dateNavigator').data('config')));
							parentContainer.data('currentDateValue', jq(this).data('dayValue'));
						})
						// Popup specific interactions
						.on('tap.dateNav', '.date-float-trigger', function (evt) {
							jq(this).parent('.date-float-wrapper').addClass('date-float-active').find('.date-float-panel').show();

							// Conceal other open floating calendars
							jq('.date-float-wrapper.date-float-active').not(jq(this).parent()).removeClass('date-float-active').find('.date-float-panel').hide();
						})
						.on('tap.dateNav', function (evt) {
							const eventTarget = jq(evt.target);

							if (!eventTarget.closest('.date-float-wrapper').length) {
								jq('.date-float-wrapper.date-float-active').removeClass('date-float-active').find('.date-float-panel').hide();
							}
						})
						.on('tap.dateNav', '.dateNavigator td', function () {
							const cellDate = jq(this).data('dayValue');
							const sourceElement = jq(this).closest('.dateNavigator').data('originalElement');
							const dateDisplayString = internalHelpers.formatDateString(jq(this).data('dayValue'), jq(this).closest('.dateNavigator').data('config'));

							jq(sourceElement).trigger('dateSelected', [cellDate]);

							// Update value on associated input element if it exists
							jq(sourceElement).children('.date-float-trigger').val(dateDisplayString).trigger('change');
						});

					jq(document).data('date-nav-events-bound', true);
				}

				return this.each(function () {
					let currentElement;
					if (jq(this).is(':input')) {
						currentElement = jq('<div />');
						jq(this).addClass('date-input-target').after(currentElement);
					} else {
						currentElement = this;
					}

					jq(currentElement).addClass('dateNavigator ' + finalOptions.effectType);
					jq(currentElement).data('config', finalOptions);

					if (finalOptions.effectType) {
						jq(currentElement).addClass('animation');
					}

					if (finalOptions.compactLayout) {
						jq(currentElement).addClass('compact');
					}

					switch (finalOptions.displayMode) {
						case 'floating':
							jq(currentElement).addClass('date-float-trigger');
							internalHelpers.renderFloatingCalendar.apply(currentElement, finalOptions.date);
							break;
						case 'embedded':
						default:
							internalHelpers.renderMainCalendar.call(currentElement, finalOptions.date);
					}
				});
			},
			navigateMonth: function (monthChangeVal, currentSettings) {
				let adjustedDay, targetDate, travelDirection, nextCalendarGrid;

				const widgetContainer = jq(this);
				const visibleCalendar = jq(this).find('table');

				const activeDate = widgetContainer.data('currentDateValue');
				const gridWidth = visibleCalendar.outerWidth(true);
				const gridHeight = visibleCalendar.outerHeight(true);

				visibleCalendar.parent().height(gridHeight); // Ensure container height matches table for smooth transitions

				if (typeof monthChangeVal === 'number') {
					travelDirection = monthChangeVal > 0 ? 1 : -1;
					adjustedDay = Math.min(activeDate.getDaysInMonthRange(monthChangeVal), activeDate.getDate()); // e.g., March 31st clamped to Feb 28th
					targetDate = new Date(activeDate.getFullYear(), activeDate.getMonth() + travelDirection, adjustedDay);
				} else if (monthChangeVal instanceof Date) {
					travelDirection = (monthChangeVal > activeDate) ? 1 : -1;
					targetDate = currentMoment;
				}

				visibleCalendar.stop(true, true);
				widgetContainer.data('currentDateValue', targetDate);
				nextCalendarGrid = internalHelpers.buildMonthGrid(targetDate, currentSettings).addClass('active-view');

				switch (currentSettings.effectType) {
					case 'fading':
						visibleCalendar.fadeOut(currentSettings.animationSpeed, function () {
							jq(this).replaceWith(nextCalendarGrid.hide().fadeIn(currentSettings.animationSpeed));
						});
						break;
					case 'blendEffect': // Crossfade
						visibleCalendar.removeClass('active-view').after(nextCalendarGrid);
						visibleCalendar.animate({ opacity: 0 }, currentSettings.animationSpeed);

						nextCalendarGrid.css({ opacity: 0, position: 'absolute', top: 0 }).animate({ opacity: 1 }, currentSettings.animationSpeed);
						break;
					case 'slideHorizontal':
						visibleCalendar.css({ position: 'absolute' }).animate({ left: -(gridWidth * travelDirection) }).after(nextCalendarGrid);

						nextCalendarGrid.css({ left: travelDirection * gridWidth, position: 'absolute' }).animate({ left: 0 });
						break;
					case 'slideVertical': // Vertical slide
						visibleCalendar.css({ position: 'absolute' }).animate({ top: -(gridHeight * travelDirection) }).after(nextCalendarGrid);

						nextCalendarGrid.css({ top: travelDirection * gridHeight, position: 'absolute' }).animate({ top: 0 });
						break;
					default: // No transition - default behavior
						visibleCalendar.replaceWith(nextCalendarGrid);
						break;
				}

				// Remove the old calendar grid once transition completes
				nextCalendarGrid.promise().done(function () {
					widgetContainer.find('table').not(nextCalendarGrid).remove();
				});

				// Refresh header and footer sections
				widgetContainer.find('.date-panel-header').replaceWith(internalHelpers.createHeaderSection(targetDate, currentSettings));
				widgetContainer.find('.date-panel-footer').replaceWith(internalHelpers.constructFooterArea(targetDate, currentSettings));

				// Update the associated input element if option is enabled
				if (currentSettings.updateOnMonthSwitch) {
					widgetContainer.prev('.date-input-target').val(jq(this).data('currentDateValue')).trigger('change');
				}
			},
			getSelectedDate: function () { // Retrieves the currently selected date
				if (jq(this).next('.dateNavigator').length) {
					return jq(this).next('.dateNavigator').data('currentDateValue');
				} else if (jq(this).data('dateNavigator')) {
					return jq(this).data('currentDateValue');
				}

				return false;
			}
		};

		if (publicInterface[action]) {
			return publicInterface[action].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof action === 'object' || !action) {
			return publicInterface.initialize.apply(this, arguments);
		}
	};
}));