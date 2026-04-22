(function(jQuery, window, void 0) {

	let globalWidgetCounter = 0; // Utilized for generating unique identifiers across multiple widget instances

	jQuery.widget('chronos.periodSelector', {
		version: '1.0.0', // Updated version number

		configParams: {
			// predefinedIntervals: array of objects; each object details an entry in the presets list
			// and must contain: labelText, beginMoment, endMoment.
			// beginMoment, endMoment are functions that return a moment.js object
			predefinedIntervals: [
						{labelText: 'Today', beginMoment: () => timeUtility(), endMoment: () => timeUtility()},
						{labelText: 'Yesterday', beginMoment: () => timeUtility().add(-1, 'days'), endMoment: () => timeUtility().add(-1, 'days')},
						{labelText: 'Last 7 Days', beginMoment: () => timeUtility().subtract(6, 'days'), endMoment: () => timeUtility()},
						{labelText: 'Last Week (Mo-Su)', beginMoment: () => timeUtility().subtract(7, 'days').isoWeekday(1), endMoment: () => timeUtility().subtract(7, 'days').isoWeekday(7)},
						{labelText: 'Current Month', beginMoment: () => timeUtility().startOf('month'), endMoment: () => timeUtility()},
						{labelText: 'Previous Month', beginMoment: () => timeUtility().subtract(1, 'month').startOf('month'), endMoment: () => timeUtility().subtract(1, 'month').endOf('month')},
						{labelText: 'Current Year', beginMoment: () => timeUtility().startOf('year'), endMoment: () => timeUtility()}
						],
			verticalOffsetPx: 0,
			defaultPrompt: 'Choose your dates...', // Placeholder text displayed when no range is selected
			indicatorIcon: 'ui-icon-triangle-1-s',
			confirmBtnTxt: 'Apply Selection',
			resetBtnTxt: 'Clear Dates',
			discardBtnTxt: 'Cancel Action',
			intervalSeparator: ' to ', // String to use between the displayed dates
			displayFormat: 'MMM D, YYYY', // Visible date format. Uses moment.js format.
			storageFormat: 'YYYY-MM-DD', // Format for submitted data (e.g., JSON {"start":"...","end":"..."})
			adjustPlacement: true, // Reverse dropdown layout if space is insufficient on the right
			autoConfirmPreset: true, // Automatically apply a range when a preset menu item is selected
			dynamicCalendarFit: true, // Adjust numberOfMonths in datepicker to fit widget width
			onDropdownOpen: null, // Callback executed when the dropdown becomes visible
			onDropdownClose: null, // Callback executed when the dropdown is hidden
			onSelectionUpdate: null, // Callback executed when the date range changes
			calendarSettings: { // Object containing datepicker options. See http://api.jqueryui.com/datepicker/#options
				numberOfMonths: 3,
				maxDate: 0 // Prevents selecting future dates (today is the max)
			}
		},

		_initWidget: function() {
			// Delegate the actual initialization to a factory function
			this._periodSelectorInstance = assemblePeriodSelector(this.element, this.configParams);
		},

		_cleanupWidget: function() {
			this._periodSelectorInstance.dispose();
		},

		display: function() {
			this._periodSelectorInstance.openDropdown();
		},

		hide: function() {
			this._periodSelectorInstance.closeDropdown();
		},

		applyInterval: function(interval) {
			this._periodSelectorInstance.updateInterval(interval);
		},

		retrieveInterval: function() {
			return this._periodSelectorInstance.fetchInterval();
		},

		clearSelection: function() {
			this._periodSelectorInstance.resetInterval();
		},

		getComponentRoot: function() {
			return this._periodSelectorInstance.getDropdownContainer();
		}
	});

	/**
	 * Factory for the activator button (which visually replaces the original input form element).
	 *
	 * @param {jQuery} $inputSource jQuery object of the original input element
	 * @param {String} componentNamespace CSS class prefix for the parent container
	 * @param {Object} configParams Configuration parameters
	 * @returns {Object} Public API for the activator button
	 */
	const createActivatorButton = ($inputSource, componentNamespace, configParams) => {
		let $elementRef;
		let uniqueElementId;

		const establishReferences = () => {
			uniqueElementId = `${componentNamespace}_btn_${globalWidgetCounter++}`;
			// Update label 'for' attribute if the original input had an ID and a corresponding label
			const $associatedLabel = jQuery(`label[for="${$inputSource.attr('id')}"]`);
			if ($associatedLabel.length) {
				$associatedLabel.attr('for', uniqueElementId);
			}
		};

		const setupButton = () => {
			establishReferences();
			$elementRef = jQuery('<button type="button"></button>')
				.addClass(`${componentNamespace}-activator-btn`)
				.attr({
					'title': $inputSource.attr('title') || '',
					'tabindex': $inputSource.attr('tabindex') || '0',
					'id': uniqueElementId,
					'data-drp-role': 'activator' // Custom data attribute
				})
				.button({
					icons: {
						secondary: configParams.indicatorIcon
					},
					label: configParams.defaultPrompt
				});
		};

		const getCurrentLabel = () => $elementRef.button('option', 'label');
		const setDisplayLabel = (value) => $elementRef.button('option', 'label', value);

		const resetToDefault = () => {
			$inputSource.val('').trigger('change');
			setDisplayLabel(configParams.defaultPrompt);
		};

		setupButton(); // Initialize on creation

		return {
			getElement: () => $elementRef,
			getLabel: getCurrentLabel,
			setLabel: setDisplayLabel,
			reset: resetToDefault
		};
	};

	/**
	 * Factory for the preset selection menu (containing built-in date intervals).
	 *
	 * @param {String} componentNamespace CSS class prefix for the parent container
	 * @param {Object} configParams Configuration parameters
	 * @param {Function} onSelectionCallback Callback executed when a preset is clicked
	 * @returns {Object} Public API for the preset menu
	 */
	const createPresetSelectionMenu = (componentNamespace, configParams, onSelectionCallback) => {
		let $elementRef;
		let $menuContainer;

		const initialize = () => {
			$elementRef = jQuery('<div></div>')
				.addClass(`${componentNamespace}-presets-wrapper`);

			$menuContainer = jQuery('<ul></ul>');

			if (configParams.predefinedIntervals && configParams.predefinedIntervals.length > 0) {
				configParams.predefinedIntervals.forEach(preset => {
					jQuery(`<li><a href="#">${preset.labelText}</a></li>`)
						.data('beginMomentFunc', preset.beginMoment)
						.data('endMomentFunc', preset.endMoment)
						.on('click', onSelectionCallback)
						.appendTo($menuContainer);
				});
			} else {
				// Display a message if no presets are configured
				jQuery(`<div>No predefined intervals available.</div>`).appendTo($elementRef);
			}

			$elementRef.append($menuContainer);

			if ($menuContainer.children().length > 0) { // Only initialize menu if it has items
				$menuContainer.menu().data('ui-menu').delay = 0; // Disable submenu delays for faster interaction
			}
		};

		initialize();

		return {
			getElement: () => $elementRef
		};
	};

	/**
	 * Factory for the multiple month date grid.
	 *
	 * @param {String} componentNamespace CSS class prefix for the parent container
	 * @param {Object} configParams Configuration parameters
	 * @returns {Object} Public API for the calendar component
	 */
	const createDateGrid = (componentNamespace, configParams) => {
		let $elementRef;
		let selectionBounds = { start: null, end: null }; // Currently selected interval

		const getCalendarOptions = () => {
			const defaultDatePickerOpts = jQuery.datepicker._defaults;
			const mergedOpts = {
				dateFormat: configParams.displayFormat, // Use moment.js format for consistency
				...configParams.calendarSettings,
				beforeShowDay: preRenderDay,
				onSelect: onDaySelected
			};
			return mergedOpts;
		};

		const initialize = () => {
			$elementRef = jQuery('<div></div>', {'class': `${componentNamespace}-calendar ui-widget-content`});
			$elementRef.datepicker(getCalendarOptions());
			scheduleMidnightRefresh(); // Ensure calendar refreshes at midnight
		};

		// Executed when a day is selected in the datepicker
		const onDaySelected = (selectedDateString, calendarInstance) => {
			const dateFormat = configParams.calendarSettings.dateFormat || jQuery.datepicker._defaults.dateFormat;
			const parsedDate = jQuery.datepicker.parseDate(dateFormat, selectedDateString);

			if (!selectionBounds.start || selectionBounds.end) {
				// No start, or both start/end already set (new selection)
				selectionBounds.start = parsedDate;
				selectionBounds.end = null;
			} else if (parsedDate < selectionBounds.start) {
				// Start is set, but selected date is earlier; swap to make start <= end
				selectionBounds.end = selectionBounds.start;
				selectionBounds.start = parsedDate;
			} else {
				// Start is set, selected date is later or same; set as end
				selectionBounds.end = parsedDate;
			}

			// Call original onSelect if it was provided in datepickerOptions
			if (configParams.calendarSettings && typeof configParams.calendarSettings.onSelect === 'function') {
				configParams.calendarSettings.onSelect(selectedDateString, calendarInstance);
			}
		};

		// Executed for each day in the datepicker before it is displayed
		const preRenderDay = (date) => {
			let resultClasses = [];
			let isSelectable = true;

			// Highlight selected range
			if (selectionBounds.start) {
				const dateTimestamp = +date;
				const startTimestamp = +selectionBounds.start;
				const endTimestamp = selectionBounds.end ? +selectionBounds.end : startTimestamp; // If end is null, consider it a single-day selection
				if ((dateTimestamp === startTimestamp) || (dateTimestamp >= startTimestamp && dateTimestamp <= endTimestamp)) {
					resultClasses.push('ui-state-highlight');
				}
			}

			// Merge with user-defined beforeShowDay if it exists
			if (configParams.calendarSettings && typeof configParams.calendarSettings.beforeShowDay === 'function') {
				const userResult = configParams.calendarSettings.beforeShowDay(date);
				isSelectable = userResult[0] && isSelectable;
				resultClasses.push(userResult[1]);
			}

			return [isSelectable, resultClasses.join(' ')];
		};

		// Schedules a refresh of the calendar at the next midnight
		const scheduleMidnightRefresh = () => {
			const msUntilMidnight = timeUtility().endOf('day').diff(timeUtility());
			setTimeout(() => {
				updateCalendarDisplay();
				scheduleMidnightRefresh(); // Reschedule for the next day
			}, msUntilMidnight + 1000); // Add a small buffer to ensure it's past midnight
		};

		const focusOnSelectionStart = () => {
			if (selectionBounds.start) {
				$elementRef.datepicker('setDate', selectionBounds.start);
			}
		};

		const updateCalendarDisplay = () => {
			$elementRef.datepicker('refresh');
			$elementRef.datepicker('setDate', null); // Clear the visually selected date, but keep internal range
		};

		const resetInternalState = () => {
			selectionBounds = { start: null, end: null };
			updateCalendarDisplay();
		};

		initialize(); // Run initialization

		return {
			getElement: () => $elementRef,
			focusOnSelectionStart: focusOnSelectionStart,
			getCurrentSelection: () => selectionBounds,
			setCurrentSelection: (value) => {
				selectionBounds = value;
				updateCalendarDisplay();
			},
			refreshDisplay: updateCalendarDisplay,
			resetState: resetInternalState
		};
	};

	/**
	 * Factory for the button panel.
	 *
	 * @param {String} componentNamespace CSS class prefix for the parent container
	 * @param {Object} configParams Configuration parameters
	 * @param {Object} actionHandlers Contains callbacks for each button
	 * @returns {Object} Public API for the button panel
	 */
	const createControlPanel = (componentNamespace, configParams, actionHandlers) => {
		let $elementRef;

		const createButton = (text, priorityClass, handler) => {
			const btn = jQuery('<button type="button"></button>')
				.text(text)
				.addClass(priorityClass)
				.button();
			if (typeof handler === 'function') {
				btn.on('click', handler);
			}
			return btn;
		};

		const initialize = () => {
			const confirmButton = createButton(configParams.confirmBtnTxt, 'ui-priority-primary', actionHandlers.onApply);
			const clearButton = createButton(configParams.resetBtnTxt, 'ui-priority-secondary', actionHandlers.onClear);
			const discardButton = createButton(configParams.discardBtnTxt, 'ui-priority-secondary', actionHandlers.onCancel);

			$elementRef = jQuery('<div></div>')
				.addClass(`${componentNamespace}-control-panel`)
				.append(confirmButton, clearButton, discardButton); // Append buttons in one go
		};

		initialize();

		return {
			getElement: () => $elementRef
		};
	};

	/**
	 * Main factory for the entire period selector widget.
	 *
	 * @param {jQuery} $inputSource jQuery object of the original input element
	 * @param {Object} configParams Configuration parameters
	 * @returns {Object} Public API for the widget instance
	 */
	const assemblePeriodSelector = ($inputSource, configParams) => {
		const baseClassName = 'chronos-period-selector';
		let $dropdownContainer; // The main dropdown element
		let $overlayMask; // UI helper for modal-like behavior
		let activatorButton;
		let presetMenuComponent;
		let calendarComponent;
		let controlPanelComponent;
		let isDropdownActive = false;
		let resizePending = false; // Flag to indicate if autofit is needed on next open

		// Constants for positioning
		const POS_LEFT = 0, POS_RIGHT = 1, POS_TOP = 2, POS_BOTTOM = 3;
		const directionNames = ['left', 'right', 'top', 'bottom'];
		let horizontalDirection = POS_RIGHT; // Initialized for CSS styling
		let verticalDirection = null;

		// Helper for moment.js (aliased for potential future changes or easier refactoring)
		const timeUtility = window.moment;

		const initialize = () => {
			activatorButton = createActivatorButton($inputSource, baseClassName, configParams);
			presetMenuComponent = createPresetSelectionMenu(baseClassName, configParams, handlePresetSelection);
			calendarComponent = createDateGrid(baseClassName, configParams);

			// Store initial numberOfMonths for dynamic sizing
			adaptLayout.initialMonthCount = configParams.calendarSettings.numberOfMonths;
			if (Array.isArray(adaptLayout.initialMonthCount)) {
				// Dynamic sizing not implemented for array-based numberOfMonths
				configParams.dynamicCalendarFit = false;
			}

			controlPanelComponent = createControlPanel(baseClassName, configParams, {
				onApply: () => {
					closeDropdown();
					updateInterval();
				},
				onClear: () => {
					closeDropdown();
					resetInterval();
				},
				onCancel: () => {
					closeDropdown();
					revertToStoredState();
				}
			});

			renderStructure();
			adaptLayout(); // Initial layout adjustment
			revertToStoredState(); // Load initial state from input
			attachEventHandlers();
		};

		const renderStructure = () => {
			$dropdownContainer = jQuery('<div></div>', {'class': `${baseClassName} ${baseClassName}-${directionNames[horizontalDirection]} ui-widget ui-widget-content ui-corner-all ui-front`})
				.append(jQuery('<div></div>', {'class': `${baseClassName}-main ui-widget-content`})
					.append(presetMenuComponent.getElement())
					.append(calendarComponent.getElement()))
				.append(jQuery('<div class="ui-helper-clearfix"></div>')
					.append(controlPanelComponent.getElement()))
				.hide();

			$inputSource.hide().after(activatorButton.getElement());
			$overlayMask = jQuery('<div></div>', {'class': `ui-front ${baseClassName}-overlay`}).hide();
			jQuery('body').append($overlayMask, $dropdownContainer); // Append both to body
		};

		// Dynamically adjusts the number of months shown in the date picker
		const adaptLayout = () => {
			if (!configParams.dynamicCalendarFit) {
				return;
			}

			const viewportWidth = jQuery(window).width();
			const currentDropdownWidth = $dropdownContainer.outerWidth(true);
			const $calendarElement = calendarComponent.getElement();
			let currentMonthCount = $calendarElement.datepicker('option', 'numberOfMonths');
			const initialMonthCount = adaptLayout.initialMonthCount;

			// If dropdown is too wide, reduce month count
			if (currentDropdownWidth > viewportWidth && currentMonthCount > 1) {
				while (currentMonthCount > 1 && $dropdownContainer.outerWidth(true) > viewportWidth) {
					$calendarElement.datepicker('option', 'numberOfMonths', --currentMonthCount);
				}
				if (currentMonthCount !== initialMonthCount) {
					// Store the width per month for potential expansion
					adaptLayout.monthWidth = (currentDropdownWidth - $dropdownContainer.outerWidth(true)) / (initialMonthCount - currentMonthCount);
				}
			} else if (currentMonthCount < initialMonthCount && adaptLayout.monthWidth) {
				// If there's extra space and we know the month width, try to expand
				while (currentMonthCount < initialMonthCount && (viewportWidth - $dropdownContainer.outerWidth(true)) >= adaptLayout.monthWidth) {
					$calendarElement.datepicker('option', 'numberOfMonths', ++currentMonthCount);
				}
			}
			adjustPosition(); // Reposition after size change
			resizePending = false;
		};

		const dispose = () => {
			$dropdownContainer.remove();
			activatorButton.getElement().remove();
			$overlayMask.remove();
			$inputSource.show();
			jQuery(window).off(`resize.${baseClassName}`); // Remove resize handler
		};

		const attachEventHandlers = () => {
			activatorButton.getElement().on('click', toggleVisibility);
			activatorButton.getElement().on('keydown', handleKeyToggle);
			$overlayMask.on('click', closeDropdown);
			jQuery(window).on(`resize.${baseClassName}`, () => {
				if (isDropdownActive) {
					adaptLayout();
				} else {
					resizePending = true; // Defer autofit until next open
				}
			});
		};

		const formatIntervalForDisplay = (interval) => {
			if (!interval || !interval.start) {
				return ''; // Return empty if no valid interval
			}
			const momentStart = timeUtility(interval.start);
			const momentEnd = timeUtility(interval.end || interval.start); // If end is null, use start for single day

			const formattedStart = momentStart.format(configParams.displayFormat);
			const formattedEnd = momentEnd.format(configParams.displayFormat);

			return momentStart.isSame(momentEnd, 'day') ? formattedStart : `${formattedStart}${configParams.intervalSeparator}${formattedEnd}`;
		};

		// Serializes a date interval into a JSON string
		const serializeInterval = (interval) => {
			if (!interval || !interval.start) {
				return '';
			}
			const momentStart = timeUtility(interval.start);
			const momentEnd = timeUtility(interval.end || interval.start); // Handle single day selection

			const formattedInterval = {
				start: momentStart.format(configParams.storageFormat),
				end: momentEnd.format(configParams.storageFormat),
				_version: '1.0' // Add a version for future schema changes
			};
			return JSON.stringify(formattedInterval);
		};

		// Parses a JSON string back into a date interval object
		const deserializeInterval = (jsonString) => {
			let interval = null;
			if (!jsonString) {
				return null;
			}
			try {
				const parsed = JSON.parse(jsonString);
				if (parsed && parsed.start && parsed.end) {
					// Use moment.js for parsing and validation
					const startMoment = timeUtility(parsed.start, configParams.storageFormat, true); // Strict parsing
					const endMoment = timeUtility(parsed.end, configParams.storageFormat, true);

					if (startMoment.isValid() && endMoment.isValid()) {
						interval = {
							start: startMoment.toDate(),
							end: endMoment.toDate()
						};
					}
				}
			} catch (e) {
				// Log parsing errors in debug mode or ignore silently
				console.warn('Failed to parse date interval JSON:', e);
			}
			return interval;
		};

		const revertToStoredState = () => {
			const storedValue = $inputSource.val();
			const interval = deserializeInterval(storedValue);
			if (interval) {
				activatorButton.setLabel(formatIntervalForDisplay(interval));
				calendarComponent.setCurrentSelection(interval);
			} else {
				calendarComponent.resetState();
				activatorButton.reset(); // Reset label to default prompt
			}
		};

		const updateInterval = (value) => {
			let intervalToSet = value || calendarComponent.getCurrentSelection();

			if (!intervalToSet || !intervalToSet.start) {
				console.warn("Attempted to set an invalid interval.");
				return;
			}
			// Ensure end is set, even for single-day selections
			if (!intervalToSet.end) {
				intervalToSet.end = intervalToSet.start;
			}

			// If value was explicitly passed, update calendar component's internal state
			if (value) {
				calendarComponent.setCurrentSelection(intervalToSet);
			}

			activatorButton.setLabel(formatIntervalForDisplay(intervalToSet));
			const serialized = serializeInterval(intervalToSet);
			if ($inputSource.val() !== serialized) { // Only trigger change if value actually differs
				$inputSource.val(serialized).trigger('change');
				if (typeof configParams.onSelectionUpdate === 'function') {
					configParams.onSelectionUpdate.call($inputSource[0], intervalToSet);
				}
			}
		};

		const fetchInterval = () => deserializeInterval($inputSource.val());

		const resetInterval = () => {
			activatorButton.reset();
			calendarComponent.resetState();
			if ($inputSource.val() !== '') { // Only trigger change if value actually differs
				$inputSource.val('').trigger('change');
				if (typeof configParams.onSelectionUpdate === 'function') {
					configParams.onSelectionUpdate.call($inputSource[0], null); // Pass null for cleared state
				}
			}
		};

		// Callback for preset menu selections
		const handlePresetSelection = function() {
			const $this = jQuery(this);
			const beginFunc = $this.data('beginMomentFunc');
			const endFunc = $this.data('endMomentFunc');

			if (typeof beginFunc === 'function' && typeof endFunc === 'function') {
				const startMoment = beginFunc().startOf('day');
				const endMoment = endFunc().endOf('day'); // Ensure end of day for presets

				calendarComponent.setCurrentSelection({ start: startMoment.toDate(), end: endMoment.toDate() });
				if (configParams.autoConfirmPreset) {
					closeDropdown();
					updateInterval();
				}
			}
			return false; // Prevent default anchor click
		};

		// Adjusts dropdown's position taking into account available space
		const adjustPosition = () => {
			$dropdownContainer.position({
				my: 'left top',
				at: `left bottom${configParams.verticalOffsetPx < 0 ? configParams.verticalOffsetPx : '+' + configParams.verticalOffsetPx}`,
				of: activatorButton.getElement(),
				collision: 'flipfit flipfit', // Use flipfit for both horizontal and vertical
				using: (coords, feedback) => {
					// Apply positioning
					$dropdownContainer.css({
						left: coords.left,
						top: coords.top
					});

					// Update direction classes based on actual placement
					horizontalDirection = feedback.horizontal === 'left' ? POS_LEFT : POS_RIGHT;
					verticalDirection = feedback.vertical === 'top' ? POS_TOP : POS_BOTTOM;

					// Remove old direction classes and add new ones
					$dropdownContainer.removeClass(directionNames.map(d => `${baseClassName}-${d}`).join(' '))
						.addClass(`${baseClassName}-${directionNames[horizontalDirection]}`)
						.addClass(`${baseClassName}-v-${directionNames[verticalDirection]}`); // Add vertical direction class
				}
			});
		};

		const toggleVisibility = () => {
			if (isDropdownActive) {
				closeDropdown();
			} else {
				openDropdown();
			}
		};

		const openDropdown = () => {
			if (isDropdownActive) {
				return;
			}

			isDropdownActive = true;
			$overlayMask.show();
			$dropdownContainer.show();
			revertToStoredState(); // Load current value from input when opening
			calendarComponent.focusOnSelectionStart(); // Scroll calendar to relevant month

			if (resizePending) {
				adaptLayout(); // Perform deferred autofit
			} else {
				adjustPosition(); // Just reposition if no resize is pending
			}

			if (typeof configParams.onDropdownOpen === 'function') {
				configParams.onDropdownOpen.call($inputSource[0]);
			}
		};

		const closeDropdown = () => {
			if (!isDropdownActive) {
				return;
			}

			isDropdownActive = false;
			$overlayMask.hide();
			$dropdownContainer.hide();

			if (typeof configParams.onDropdownClose === 'function') {
				configParams.onDropdownClose.call($inputSource[0]);
			}
		};

		const handleKeyToggle = (event) => {
			// Spacebar (32) or Enter (13) opens/closes the dropdown
			if (event.which === 32 || event.which === 13) {
				event.preventDefault();
				toggleVisibility();
			}
			// Escape (27) always closes the dropdown
			if (event.which === 27 && isDropdownActive) {
				event.preventDefault();
				closeDropdown();
				revertToStoredState(); // Discard temporary selection
			}
		};

		// Initialize the widget components
		initialize();

		// Public API for the widget instance
		return {
			openDropdown: openDropdown,
			closeDropdown: closeDropdown,
			updateInterval: updateInterval,
			fetchInterval: fetchInterval,
			resetInterval: resetInterval,
			getDropdownContainer: () => $dropdownContainer,
			dispose: dispose
		};
	};

})(jQuery, window);