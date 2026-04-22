(function(jq, win, undef) {

	// A simple counter for generating distinct element identifiers across multiple instances.
	var counterID = 0;

	jq.widget('mycorp.datetimeselector', {
		version: '1.0.0', // Updated version number

		// Configuration options for the date range selector.
		config: {
			// predefinedPeriods: an array of objects; each object defines an entry for the quick-select menu
			// and must contain: text (display string), startPoint (function returning a moment obj), endPoint (function returning a moment obj).
			predefinedPeriods: [
						{ text: 'Today', startPoint: function() { return moment() }, endPoint: function() { return moment() } },
						{ text: 'Yesterday', startPoint: function() { return moment().subtract('days', 1) }, endPoint: function() { return moment().subtract('days', 1) } },
						{ text: 'Past 7 Days', startPoint: function() { return moment().subtract('days', 6) }, endPoint: function() { return moment() } },
						{ text: 'Last Week (Mon-Sun)', startPoint: function() { return moment().subtract('days', 7).isoWeekday(1) }, endPoint: function() { return moment().subtract('days', 7).isoWeekday(7) } },
						{ text: 'Current Month', startPoint: function() { return moment().startOf('month') }, endPoint: function() { return moment() } },
						{ text: 'Prior Month', startPoint: function() { return moment().subtract('month', 1).startOf('month') }, endPoint: function() { return moment().subtract('month', 1).endOf('month') } },
						{ text: 'Current Year', startPoint: function() { return moment().startOf('year') }, endPoint: function() { return moment() } }
						],
			yAxisOffset: 0, // Vertical adjustment for the dropdown panel.
			defaultPrompt: 'Pick a time period...', // Placeholder displayed when no range is chosen.
			indicatorGlyph: 'ui-icon-triangle-1-s', // Icon for the trigger button.
			confirmBtnText: 'Accept', // Text for the apply button.
			resetBtnText: 'Clear', // Text for the clear button.
			abortBtnText: 'Dismiss', // Text for the cancel button.
			periodDelimiter: ' - ', // String used to separate start and end dates in display.
			displayFormat: 'M d, yy', // Format for visible dates. See http://api.jqueryui.com/datepicker/#utility-formatDate
			storageFormat: 'yy-mm-dd', // Format for dates stored internally (e.g., in JSON).
			reflectOnOverlap: true, // If true, flips the dropdown's position if it goes off-screen.
			autoConfirmSelection: true, // Automatically applies a range when selected from the presets menu.
			dynamicCalendarSizing: true, // Overrides numberOfMonths in calendarSettings to fit available width.
			onPanelShow: null, // Callback executed when the selection panel is displayed.
			onPanelHide: null, // Callback executed when the selection panel is hidden.
			onValueChange: null, // Callback executed when the selected date range changes.
			calendarSettings: { // Object containing options for the underlying jQuery UI Datepicker. See http://api.jqueryui.com/datepicker/#options
				numberOfMonths: 3,
//				showCurrentAtPos: 1 // Known issue; use maxDate instead for current month positioning.
				maxDate: 0 // Sets the latest selectable date to today.
			}
		},

		// Widget initialization method.
		_initWidget: function() {
			this._dateSelectorInstance = createDateTimeSelector(this.element, this.config);
		},

		// Widget destruction method.
		_disposeWidget: function() {
			this._dateSelectorInstance.removeComponent();
		},

		// Public method to show the date range selection panel.
		showPanel: function() {
			this._dateSelectorInstance.togglePanelVisibility();
		},

		// Public method to hide the date range selection panel.
		hidePanel: function() {
			this._dateSelectorInstance.hidePanel();
		},

		// Public method to programmatically set the current date range.
		assignPeriod: function(interval) {
			this._dateSelectorInstance.assignPeriod(interval);
		},

		// Public method to retrieve the currently selected date range.
		retrievePeriod: function() {
			return this._dateSelectorInstance.retrievePeriod();
		},

		// Public method to clear the current date range selection.
		erasePeriod: function() {
			this._dateSelectorInstance.erasePeriod();
		},

		// Public method to get the root DOM element of the widget.
		getComponent: function() {
			return this._dateSelectorInstance.getDropdownContainer();
		}
	});

	/**
	 * Factory function for the main trigger button (which takes the place of the original input field).
	 *
	 * @param {jq} $sourceInput - jQuery object for the initial input element.
	 * @param {String} componentBaseClass - Base CSS class for the parent container.
	 * @param {Object} config - Configuration options for this widget instance.
	 * @returns {Object} An object providing access to the button's elements and methods.
	 */
	function createActivationButton($sourceInput, componentBaseClass, config) {
		var $thisElement, elementID;

		// Ensures labels correctly point to the new button's ID.
		function updateLabelLinks() {
			elementID = 'drpsel_auto_' + counterID++;
			jq('label[for="' + $sourceInput.attr('id') + '"]')
				.attr('for', elementID);
		}

		// Sets up the button element and its initial state.
		function setupComponent() {
			updateLabelLinks();
			$thisElement = jq('<button type="button"></button>')
				.addClass(componentBaseClass + '-activationbutton')
				.attr({ 'title': $sourceInput.attr('title'), 'tabindex': $sourceInput.attr('tabindex'), id: elementID })
				.button({
					icons: {
						secondary: config.indicatorGlyph
					},
					label: config.defaultPrompt
				});
		}

		// Retrieves the current label text of the button.
		function fetchLabelTxt() {
			return $thisElement.button('option', 'label');
		}

		// Updates the label text of the button.
		function updateLabelTxt(val) {
			$thisElement.button('option', 'label', val);
		}

		// Resets the button's label and clears the associated input.
		function revertToDefault() {
			$sourceInput.val('').change();
			updateLabelTxt(config.defaultPrompt);
		}

		setupComponent(); // Initialize the button.

		return {
			getButtonElement: function() { return $thisElement; },
			fetchLabelTxt: fetchLabelTxt,
			updateLabelTxt: updateLabelTxt,
			revertToDefault: revertToDefault
		};
	}

	/**
	 * Factory function for the menu of predefined date ranges.
	 *
	 * @param {String} componentBaseClass - Base CSS class for the parent container.
	 * @param {Object} config - Configuration options, specifically for predefinedPeriods.
	 * @param {Function} onMenuItemClick - Callback function to execute when a preset is selected.
	 * @returns {Object} An object providing access to the menu's DOM element.
	 */
	function createPredefinedMenu(componentBaseClass, config, onMenuItemClick) {
		var $thisElement,
			$optionList;

		// Initializes the menu structure and populates it with preset ranges.
		function setupComponent() {
			$thisElement = jq('<div></div>')
				.addClass(componentBaseClass + '-presetsmenu');

			$optionList = jq('<ul></ul>');

			jq.each(config.predefinedPeriods, function() {
				jq('<li><a href="#">' + this.text + '</a></li>')
				.data('startMoment', this.startPoint)
				.data('endMoment', this.endPoint)
				.click(onMenuItemClick)
				.appendTo($optionList);
			});

			$thisElement.append($optionList);

			$optionList.menu()
				.data('ui-menu').delay = 0; // Disables the delay before submenus appear.
		}

		setupComponent(); // Initialize the menu.

		return {
			getMenuElement: function() { return $thisElement; }
		};
	}

	/**
	 * Factory function for the multi-month date picker component.
	 *
	 * @param {String} componentBaseClass - Base CSS class for the parent container.
	 * @param {Object} config - Configuration options, particularly calendarSettings.
	 * @returns {Object} An object with methods to interact with the calendar.
	 */
	function createCalendarPanel(componentBaseClass, config) {
		var $thisElement,
			selectedInterval = { start: null, end: null }; // Stores the currently selected start and end dates.

		// Initializes the datepicker with custom options and event handlers.
		function setupComponent() {
			$thisElement = jq('<div></div>', { 'class': componentBaseClass + '-calendar ui-widget-content' });

			$thisElement.datepicker(jq.extend({}, config.calendarSettings, { preDisplayDay: preDisplayDay, onDayChosen: onDayChosen }));
			refreshAtMidnight(); // Schedule a refresh to handle day transitions.
		}

		// Callback executed when a day is selected in the datepicker.
		function onDayChosen(dateTxt, instance) {
			var formatForDates = config.calendarSettings.dateFormat || jq.datepicker._defaults.dateFormat,
				chosenDate = jq.datepicker.parseDate(formatForDates, dateTxt);

			if (!selectedInterval.start || selectedInterval.end) { // If no start is set, or both are already set (implies new selection).
				selectedInterval.start = chosenDate;
				selectedInterval.end = null;
			} else if (chosenDate < selectedInterval.start) { // If a start is set, but the new selection is earlier.
				selectedInterval.end = selectedInterval.start;
				selectedInterval.start = chosenDate;
			} else { // Start is set, and new selection is later or same.
				selectedInterval.end = chosenDate;
			}

			// Execute any original onSelect handler if provided in calendarSettings.
			if (config.calendarSettings.hasOwnProperty('onSelect')) {
				config.calendarSettings.onSelect(dateTxt, instance);
			}
		}

		// Callback executed for each day before it's rendered in the datepicker.
		function preDisplayDay(date) {
			var outcome = [
					true, // Indicates if the day is selectable.
					selectedInterval.start && ((+date === +selectedInterval.start) || (selectedInterval.end && selectedInterval.start <= date && date <= selectedInterval.end)) ? 'ui-state-highlight' : '' // CSS class to apply for selected range.
				],
				userOutcome = [true, ''];

			// Merge with any custom beforeShowDay handler from calendarSettings.
			if (config.calendarSettings.hasOwnProperty('beforeShowDay')) {
				userOutcome = config.calendarSettings.beforeShowDay(date);
			}
			return [
					outcome[0] && userOutcome[0],
					outcome[1] + ' ' + userOutcome[1]
					];
		}

		// Schedules a refresh for the calendar at the end of the current day.
		function refreshAtMidnight() {
			setTimeout(function() {
				updateView();
				refreshAtMidnight();
			}, moment().endOf('day') - moment());
		}

		// Scrolls the calendar view to the start of the currently selected range.
		function jumpToStart() {
			if (selectedInterval.start) {
				$thisElement.datepicker('setDate', selectedInterval.start);
			}
		}

		// Refreshes the datepicker view and clears any temporary selections.
		function updateView() {
			$thisElement.datepicker('refresh');
			$thisElement.datepicker('setDate', null); // Clears the visual selected date.
		}

		// Resets the selected date range and refreshes the calendar.
		function revertToDefault() {
			selectedInterval = { start: null, end: null };
			updateView();
		}

		setupComponent(); // Initialize the calendar.

		return {
			getCalendarElement: function() { return $thisElement; },
			jumpToStart: function() { return jumpToStart(); },
			getInterval: function() { return selectedInterval; },
			setInterval: function(value) { selectedInterval = value; updateView(); },
			updateView: updateView,
			revertToDefault: revertToDefault
		};
	}

	/**
	 * Factory function for the action buttons panel (Apply, Clear, Cancel).
	 *
	 * @param {String} componentBaseClass - Base CSS class for the parent container.
	 * @param {Object} config - Configuration options for button text.
	 * @param {Object} actionCallbacks - Object containing callback functions for each button click.
	 * @returns {Object} An object providing access to the panel's DOM element.
	 */
	function createActionButtons(componentBaseClass, config, actionCallbacks) {
		var $thisElement,
			confirmButton,
			resetButton,
			abortButton;

		// Initializes and styles the individual buttons.
		function setupComponent() {
			confirmButton = jq('<button type="button" class="ui-priority-primary"></button>')
				.text(config.confirmBtnText)
				.button();
			resetButton = jq('<button type="button" class="ui-priority-secondary"></button>')
				.text(config.resetBtnText)
				.button();
			abortButton = jq('<button type="button" class="ui-priority-secondary"></button>')
				.text(config.abortBtnText)
				.button();

			$thisElement = jq('<div></div>')
				.addClass(componentBaseClass + '-buttonpanel')
				.append(confirmButton)
				.append(resetButton)
				.append(abortButton);

			attachEventListeners(); // Binds click handlers to the buttons.
		}

		// Binds the provided callback functions to the button click events.
		function attachEventListeners() {
			if (actionCallbacks) {
				confirmButton.click(actionCallbacks.onApply);
				resetButton.click(actionCallbacks.onClear);
				abortButton.click(actionCallbacks.onCancel);
			}
		}

		setupComponent(); // Initialize the button panel.

		return {
			getPanelElement: function() { return $thisElement; }
		};
	}

	/**
	 * Main factory function for the date range selector widget.
	 * Orchestrates the creation and interaction of all sub-components.
	 *
	 * @param {jq} $sourceInput - jQuery object for the original input field.
	 * @param {Object} config - The complete configuration options for the widget.
	 * @returns {Object} An object providing public methods for the date range picker.
	 */
	function createDateTimeSelector($sourceInput, config) {
		var baseClsName = 'mycorp-datetimeselector',
			$dropdownContainer, // The main dropdown panel containing all components.
			$overlayScreen, // A transparent overlay for modal-like behavior.
			activatorBtn,
			predefinedChoices,
			dateGrid,
			controlStrip,
			isPanelVisible = false,
			resizeRequired = false,
			DIRECTION_LEFT = 0,
			DIRECTION_RIGHT = 1,
			DIRECTION_TOP = 2,
			DIRECTION_BOTTOM = 3,
			directionNames = ['left', 'right', 'top', 'bottom'],
			horizontalDir = DIRECTION_RIGHT, // Initial layout style (right-aligned).
			verticalDir = null;

		// Core initialization logic for the date range selector.
		function setupComponent() {
			activatorBtn = createActivationButton($sourceInput, baseClsName, config);
			predefinedChoices = createPredefinedMenu(baseClsName, config, applyPresetSelection);
			dateGrid = createCalendarPanel(baseClsName, config);
			adjustDimensions.numMonths = config.calendarSettings.numberOfMonths; // Store original month count.
			if (adjustDimensions.numMonths instanceof Array) { // If numberOfMonths is an array, dynamic sizing is not supported.
				config.dynamicCalendarSizing = false;
			}
			controlStrip = createActionButtons(baseClsName, config, {
				onApply: function() {
						hidePanel();
						assignPeriod();
				},
				onClear: function() {
						hidePanel();
						erasePeriod();
				},
				onCancel: function() {
					hidePanel();
					revertToDefault();
				}
			});
			drawInterface(); // Assemble and display the DOM elements.
			adjustDimensions(); // Perform initial size adjustment.
			revertToDefault(); // Set initial range based on input value.
			attachEventListeners(); // Bind global event handlers.
		}

		// Renders the main dropdown container and its sub-elements.
		function drawInterface() {
			$dropdownContainer = jq('<div></div>', { 'class': baseClsName + ' ' + baseClsName + '-' + directionNames[horizontalDir] + ' ui-widget ui-widget-content ui-corner-all ui-front' })
				.append(jq('<div></div>', { 'class': baseClsName + '-main ui-widget-content' })
					.append(predefinedChoices.getMenuElement())
					.append(dateGrid.getCalendarElement()))
				.append(jq('<div class="ui-helper-clearfix"></div>')
					.append(controlStrip.getPanelElement()))
				.hide(); // Initially hidden.
			$sourceInput.hide().after(activatorBtn.getButtonElement()); // Replace original input with trigger button.
			$overlayScreen = jq('<div></div>', { 'class': 'ui-front ' + baseClsName + '-mask' }).hide(); // Create and hide the overlay.
			jq('body').append($overlayScreen).append($dropdownContainer); // Add overlay and dropdown to body.
		}

		// Dynamically adjusts the number of months displayed in the calendar to fit the window width.
		function adjustDimensions() {
			if (config.dynamicCalendarSizing) {
				var availWidth = jq(win).width(),
					currentWidth = $dropdownContainer.outerWidth(true),
					$calendarPanel = dateGrid.getCalendarElement(),
					currentNumMonths = $calendarPanel.datepicker('option', 'numberOfMonths'),
					originalNumMonths = currentNumMonths;

				if (currentWidth > availWidth) { // If current width exceeds available, reduce months.
					while (currentNumMonths > 1 && $dropdownContainer.outerWidth(true) > availWidth) {
						$calendarPanel.datepicker('option', 'numberOfMonths', --currentNumMonths);
					}
					if (currentNumMonths !== originalNumMonths) {
						// Calculate average month width for future adjustments.
						adjustDimensions.monthWidth = (currentWidth - $dropdownContainer.outerWidth(true)) / (originalNumMonths - currentNumMonths);
					}
				} else { // If space is available, try to increase months up to the original config.
					while (currentNumMonths < adjustDimensions.numMonths && (availWidth - $dropdownContainer.outerWidth(true)) >= adjustDimensions.monthWidth) {
						$calendarPanel.datepicker('option', 'numberOfMonths', ++currentNumMonths);
					}
				}
				adjustPanelPosition(); // Recalculate position after resizing.
				resizeRequired = false;
			}
		}

		// Removes all widget-related DOM elements and restores the original input.
		function removeComponent() {
			$dropdownContainer.remove();
			activatorBtn.getButtonElement().remove();
			$sourceInput.show();
		}

		// Binds various event listeners for interaction and responsiveness.
		function attachEventListeners() {
			activatorBtn.getButtonElement().click(togglePanelVisibility);
			activatorBtn.getButtonElement().keydown(handleKeyToggle);
			$overlayScreen.click(hidePanel);
			jq(win).resize(function() { isPanelVisible ? adjustDimensions() : resizeRequired = true; });
		}

		// Formats a date range object into a display string.
		function formatPeriodForDisplay(interval) {
			var formatString = config.displayFormat;
			return jq.datepicker.formatDate(formatString, interval.start) + (+interval.end !== +interval.start ? config.periodDelimiter + jq.datepicker.formatDate(formatString, interval.end) : '');
		}

		// Formats a date range object into a JSON string.
		function formatPeriodAsJSON(interval) {
			var formatString = config.storageFormat,
				jsonInterval = {};
			jsonInterval.start = jq.datepicker.formatDate(formatString, interval.start);
			jsonInterval.end = jq.datepicker.formatDate(formatString, interval.end);
			return JSON.stringify(jsonInterval);
		}

		// Parses a JSON string into a date range object.
		function parsePeriodFromJSON(jsonText) {
			var formatString = config.storageFormat,
				intervalObj = null;
			if (jsonText) {
				try {
					intervalObj = JSON.parse(jsonText, function(key, val) {
						return key ? jq.datepicker.parseDate(formatString, val) : val;
					});
				} catch (e) {
					// Handle parsing errors gracefully.
				}
			}
			return intervalObj;
		}

		// Resets the widget's displayed range based on the original input's value.
		function revertToDefault() {
			var interval = parsePeriodFromJSON($sourceInput.val());
			if (interval) {
				activatorBtn.updateLabelTxt(formatPeriodForDisplay(interval));
				dateGrid.setInterval(interval);
			} else {
				dateGrid.revertToDefault();
			}
		}

		// Sets the current date range, updates display, and triggers change events.
		function assignPeriod(val) {
			var interval = val || dateGrid.getInterval();
			if (!interval.start) {
				return;
			}
			if (!interval.end) {
				interval.end = interval.start; // If only start is selected, make end same as start.
			}
			val && dateGrid.setInterval(interval); // Update calendar if a new value was passed.
			activatorBtn.updateLabelTxt(formatPeriodForDisplay(interval));
			$sourceInput.val(formatPeriodAsJSON(interval)).change(); // Update hidden input and trigger change.
			if (config.onValueChange) {
				config.onValueChange();
			}
		}

		// Retrieves the current date range from the hidden input.
		function retrievePeriod() {
			return parsePeriodFromJSON($sourceInput.val());
		}

		// Clears the selected date range from display, calendar, and hidden input.
		function erasePeriod() {
			activatorBtn.revertToDefault();
			dateGrid.revertToDefault();
			$sourceInput.val('');
		}

		// Callback for when a preset range is clicked.
		function applyPresetSelection() {
			var $clickedItem = jq(this),
				startDt = $clickedItem.data('startMoment')().startOf('day').toDate(),
				endDt = $clickedItem.data('endMoment')().startOf('day').toDate();
			dateGrid.setInterval({ start: startDt, end: endDt });
			if (config.autoConfirmSelection) {
				hidePanel();
				assignPeriod();
			}
			return false; // Prevent default link behavior.
		}

		// Adjusts the dropdown panel's position to ensure it stays within the viewport.
		function adjustPanelPosition() {
			$dropdownContainer.position({
				my: 'left top',
				at: 'left bottom' + (config.yAxisOffset < 0 ? config.yAxisOffset : '+' + config.yAxisOffset),
				of: activatorBtn.getButtonElement(),
				collision : 'flipfit flipfit', // Flips horizontally and vertically if needed.
				using: function(coords, feedback) {
					var containerCenterX = feedback.element.left + feedback.element.width / 2,
						triggerButtonCenterX = feedback.target.left + feedback.target.width / 2;

					// Determine horizontal flip direction.
					horizontalDir = (containerCenterX > triggerButtonCenterX) ? DIRECTION_RIGHT : DIRECTION_LEFT;

					// Update container classes based on new horizontal direction.
					jq(this).removeClass(baseClsName + '-' + directionNames[DIRECTION_LEFT] + ' ' + baseClsName + '-' + directionNames[DIRECTION_RIGHT])
						.addClass(baseClsName + '-' + directionNames[horizontalDir]);

					// Apply calculated coordinates.
					jq(this).css({
						left: coords.left,
						top: coords.top
					});
				}
			});
		}

		// Toggles the visibility of the date range selection panel.
		function togglePanelVisibility() {
			if (isPanelVisible) {
				hidePanel();
			} else {
				showPanel();
			}
		}

		// Displays the date range selection panel.
		function showPanel() {
			if (isPanelVisible) {
				return;
			}
			isPanelVisible = true;
			if (resizeRequired) { // Re-evaluate sizing if window was resized while panel was closed.
				adjustDimensions();
			}
			revertToDefault(); // Ensure panel reflects current hidden input value.
			dateGrid.jumpToStart(); // Scroll calendar to start of selected range.
			adjustPanelPosition(); // Position the panel correctly.
			$dropdownContainer.show();
			$overlayScreen.show();
			activatorBtn.getButtonElement().attr('aria-expanded', 'true');
			if (config.onPanelShow) {
				config.onPanelShow();
			}
		}

		// Hides the date range selection panel.
		function hidePanel() {
			if (!isPanelVisible) {
				return;
			}
			isPanelVisible = false;
			$dropdownContainer.hide();
			$overlayScreen.hide();
			activatorBtn.getButtonElement().attr('aria-expanded', 'false');
			if (config.onPanelHide) {
				config.onPanelHide();
			}
		}

		// Handles keyboard events for opening/closing the panel (Enter/Escape).
		function handleKeyToggle(evt) {
			switch (evt.keyCode) {
				case jq.ui.keyCode.ENTER:
					togglePanelVisibility();
					break;
				case jq.ui.keyCode.ESCAPE:
					hidePanel();
					break;
			}
		}

		setupComponent(); // Initial setup.

		return {
			getDropdownContainer: function() { return $dropdownContainer; },
			togglePanelVisibility: togglePanelVisibility,
			hidePanel: hidePanel,
			assignPeriod: assignPeriod,
			retrievePeriod: retrievePeriod,
			erasePeriod: erasePeriod,
			removeComponent: removeComponent
		};
	}

})(jQuery, window);