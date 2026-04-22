(function (jQ) {

	/*
	 * Ensure our date-time selector component is not initialized multiple times.
	 * Avoids "Uncaught RangeError: Maximum call stack size exceeded" in certain scenarios.
	 */
	jQ.ui.dateTimeSelector = jQ.ui.dateTimeSelector || {};
	if (jQ.ui.dateTimeSelector.releaseId) {
		return;
	}

	/*
	 * Integrate with jQueryUI framework, setting our specific version tag.
	 */
	jQ.extend(jQ.ui, {
		dateTimeSelector: {
			releaseId: "1.4.3"
		}
	});

	/*
	 * Primary manager for the date-time selection component.
	 * Interact with it via `jQ.dateTimeSelector`. Settings for various instances
	 * are managed within their respective instance objects, allowing diverse configurations.
	 */
	let DateTimePickerManager = function () {
		this.localeSettings = []; // Stores localized text and formats, indexed by language.
		this.localeSettings[''] = { // Default English settings.
			nowLabel: 'Current',
			confirmLabel: 'Apply',
			morningAbbreviations: ['AM', 'A'],
			eveningAbbreviations: ['PM', 'P'],
			timeDisplayFormat: 'HH:mm',
			timeEndingSuffix: '',
			onlyTimeSelectionTitle: 'Select Time',
			timeSectionLabel: 'Time',
			hourSectionLabel: 'Hour',
			minuteSectionLabel: 'Minute',
			secondSectionLabel: 'Second',
			millisecondSectionLabel: 'Millisecond',
			microsecondSectionLabel: 'Microsecond',
			timezoneSectionLabel: 'Time Zone',
			isRightToLeft: false
		};
		this._baseConfiguration = { // Global default configuration for all component instances.
			displayControlPanel: true,
			onlyTimeSelection: false,
			displayHour: null,
			displayMinute: null,
			displaySecond: null,
			displayMillisec: null,
			displayMicrosec: null,
			displayTimezone: null,
			displayFullTime: true,
			hourStepValue: 1,
			minuteStepValue: 1,
			secondStepValue: 1,
			millisecStepValue: 1,
			microsecStepValue: 1,
			initialHour: 0,
			initialMinute: 0,
			initialSecond: 0,
			initialMillisec: 0,
			initialMicrosec: 0,
			defaultTimezone: null,
			minHourLimit: 0,
			minMinuteLimit: 0,
			minSecondLimit: 0,
			minMillisecLimit: 0,
			minMicrosecLimit: 0,
			maxHourLimit: 23,
			maxMinuteLimit: 59,
			maxSecondLimit: 59,
			maxMillisecLimit: 999,
			maxMicrosecLimit: 999,
			minimumDateTimeConstraint: null,
			maximumDateTimeConstraint: null,
			onValueSelected: null,
			hourGridSize: 0,
			minuteGridSize: 0,
			secondGridSize: 0,
			millisecGridSize: 0,
			microsecGridSize: 0,
			alwaysUpdateTimestamp: true,
			dateTimeSeparator: ' ',
			alternativeFieldTimeOnly: true,
			alternativeTimeFormat: null,
			alternativeSeparator: null,
			alternativeTimeSuffix: null,
			pickerTimeFormatOverride: null,
			pickerTimeSuffixOverride: null,
			showDateTimeSelector: true,
			timezoneOptionsList: null,
			enableSliderAccess: false,
			sliderAccessArguments: null,
			uiControlMethod: 'slider',
			defaultTimestampValue: null,
			parsingMode: 'strict'
		};
		Object.assign(this._baseConfiguration, this.localeSettings['']);
	};

	jQ.extend(DateTimePickerManager.prototype, {
		_targetInput: null,
		_alternativeInput: null,
		_timeDisplayElement: null,
		_currentInstance: null,
		_hourControl: null,
		_minuteControl: null,
		_secondControl: null,
		_millisecControl: null,
		_microsecControl: null,
		_timezoneSelector: null,
		_currentHour: 0,
		_currentMinute: 0,
		_currentSecond: 0,
		_currentMillisec: 0,
		_currentMicrosec: 0,
		_selectedTimezone: null,
		_originalMinHour: null,
		_originalMinMinute: null,
		_originalMinSecond: null,
		_originalMinMillisec: null,
		_originalMinMicrosec: null,
		_originalMaxHour: null,
		_originalMaxMinute: null,
		_originalMaxSecond: null,
		_originalMaxMillisec: null,
		_originalMaxMicrosec: null,
		_meridiemIndicator: '',
		_formattedDateOutput: '',
		_formattedTimeOutput: '',
		_formattedDateTimeOutput: '',
		_availableTimezones: null,
		_timeComponents: ['hour', 'minute', 'second', 'millisec', 'microsec'],
		_featureSupport: {},
		_activeControl: null,
		_timeValueDefined: false, // Internal flag to track if time has been successfully parsed/set.

		/*
		 * Modifies the global default settings for all date-time selector instances.
		 * @param {Object} configUpdates - An object containing new default settings.
		 * @returns {Object} The manager object itself for chaining.
		 */
		setDefaultOptions: function (configUpdates) {
			// Assuming an external 'mergeAndClean' utility exists or implement a basic one.
			// For this clone, we'll use a simple extend.
			jQ.extend(this._baseConfiguration, configUpdates || {});
			return this;
		},

		/*
		 * Creates and configures a new instance of the DateTimePickerManager.
		 * @param {jQuery} targetElement - The jQuery object representing the input field.
		 * @param {Object} instanceOptions - Specific options for this new instance.
		 * @returns {DateTimePickerManager} A newly configured instance.
		 */
		_createInstance: function (targetElement, instanceOptions) {
			if (!targetElement || !targetElement.jquery) {
				console.error("Invalid target element provided for DateTimePickerManager.");
				return null;
			}

			const instanceHandle = new DateTimePickerManager();
			let elementConfig = {};
			const eventHandlers = {};
			const eventOverrides = {};
			let propertyKey;

			// Extract configuration from element's data attributes.
			for (propertyKey in this._baseConfiguration) {
				if (Object.prototype.hasOwnProperty.call(this._baseConfiguration, propertyKey)) {
					const attributeValue = targetElement.attr('data-dt-selector-' + propertyKey.toLowerCase());
					if (attributeValue) {
						try {
							// Attempt to parse as JSON, otherwise treat as string.
							elementConfig[propertyKey] = JSON.parse(attributeValue);
						} catch (err) {
							elementConfig[propertyKey] = attributeValue;
							console.warn(`DateTimePickerManager: Could not parse data attribute 'data-dt-selector-${propertyKey.toLowerCase()}' as JSON. Using raw string value. Error: ${err.message}`);
						}
					}
				}
			}

			// Define event override functions to wrap original callbacks.
			eventOverrides.beforeShow = function (inputField, datepickerInstance) {
				const originalHandler = instanceHandle._baseConfiguration.eventHandlers.beforeShow;
				if (typeof originalHandler === 'function') {
					return originalHandler.call(targetElement[0], inputField, datepickerInstance, instanceHandle);
				}
			};
			eventOverrides.onChangeMonthYear = function (yearVal, monthVal, datepickerInstance) {
				// Update the time display to prevent it from disappearing during month/year changes.
				instanceHandle._updateDateTimeValue(datepickerInstance);
				const originalHandler = instanceHandle._baseConfiguration.eventHandlers.onChangeMonthYear;
				if (typeof originalHandler === 'function') {
					originalHandler.call(targetElement[0], yearVal, monthVal, datepickerInstance, instanceHandle);
				}
			};
			eventOverrides.onClose = function (dateString, datepickerInstance) {
				if (instanceHandle._timeValueDefined && targetElement.val() !== '') {
					instanceHandle._updateDateTimeValue(datepickerInstance);
				}
				const originalHandler = instanceHandle._baseConfiguration.eventHandlers.onClose;
				if (typeof originalHandler === 'function') {
					originalHandler.call(targetElement[0], dateString, datepickerInstance, instanceHandle);
				}
			};

			// Store original event handlers before overriding.
			for (propertyKey in eventOverrides) {
				if (Object.prototype.hasOwnProperty.call(eventOverrides, propertyKey)) {
					eventHandlers[propertyKey] = instanceOptions[propertyKey] || null;
				}
			}

			// Merge all configurations: base, element, instance, and event overrides.
			Object.assign(instanceHandle._baseConfiguration, this._baseConfiguration, elementConfig, instanceOptions, eventOverrides, {
				eventHandlers: eventHandlers,
				dtSelector: instanceHandle // Expose this instance to the datepicker's internal object.
			});

			instanceHandle.morningAbbreviations = instanceHandle._baseConfiguration.morningAbbreviations.map(val => val.toLocaleUpperCase());
			instanceHandle.eveningAbbreviations = instanceHandle._baseConfiguration.eveningAbbreviations.map(val => val.toLocaleUpperCase());

			// Determine which time units are supported based on the format strings.
			instanceHandle._featureSupport = determineFeatureSupport(
				instanceHandle._baseConfiguration.timeDisplayFormat +
				(instanceHandle._baseConfiguration.pickerTimeFormatOverride || '') +
				(instanceHandle._baseConfiguration.alternativeTimeFormat || '')
			);

			// Initialize the control mechanism (slider or select).
			if (typeof (instanceHandle._baseConfiguration.uiControlMethod) === 'string') {
				if (instanceHandle._baseConfiguration.uiControlMethod === 'slider' && typeof (jQ.ui.slider) === 'undefined') {
					instanceHandle._baseConfiguration.uiControlMethod = 'select'; // Fallback to select if slider UI is unavailable.
				}
				instanceHandle._activeControl = instanceHandle._controls[instanceHandle._baseConfiguration.uiControlMethod];
			}
			// If controlType is an object, it must implement 'create', 'options', 'value'.
			else {
				instanceHandle._activeControl = instanceHandle._baseConfiguration.uiControlMethod;
			}

			// Prepare timezone options.
			let timezoneList = [-720, -660, -600, -570, -540, -480, -420, -360, -300, -270, -240, -210, -180, -120, -60,
				0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630, 660, 690, 720, 765, 780, 840
			];
			if (instanceHandle._baseConfiguration.timezoneOptionsList !== null) {
				timezoneList = instanceHandle._baseConfiguration.timezoneOptionsList;
			}
			if (timezoneList.length > 0 && typeof timezoneList[0] !== 'object') {
				timezoneList = timezoneList.map(tzValue => ({
					value: tzValue,
					label: jQ.dateTimeSelector.formatTimezoneOffset(tzValue, instanceHandle._featureSupport.iso8601)
				}));
			}
			instanceHandle._baseConfiguration.timezoneOptionsList = timezoneList;

			// Set initial time units, clamping values within min/max limits.
			const config = instanceHandle._baseConfiguration;
			instanceHandle._selectedTimezone = config.defaultTimezone !== null ? jQ.dateTimeSelector.parseTimezoneOffset(config.defaultTimezone) :
				((new Date()).getTimezoneOffset() * -1);
			instanceHandle._currentHour = Math.max(config.minHourLimit, Math.min(config.maxHourLimit, config.initialHour));
			instanceHandle._currentMinute = Math.max(config.minMinuteLimit, Math.min(config.maxMinuteLimit, config.initialMinute));
			instanceHandle._currentSecond = Math.max(config.minSecondLimit, Math.min(config.maxSecondLimit, config.initialSecond));
			instanceHandle._currentMillisec = Math.max(config.minMillisecLimit, Math.min(config.maxMillisecLimit, config.initialMillisec));
			instanceHandle._currentMicrosec = Math.max(config.minMicrosecLimit, Math.min(config.maxMicrosecLimit, config.initialMicrosec));
			instanceHandle._meridiemIndicator = '';
			instanceHandle._targetInput = targetElement;

			if (config.alternativeField) {
				instanceHandle._alternativeInput = jQ(config.alternativeField).css({
					cursor: 'pointer'
				}).on('focus', function () {
					targetElement.trigger("focus"); // Forward focus event.
				});
			}

			// Normalize min/max date and datetime properties.
			if (config.minimumDateTimeConstraint === 0) {
				config.minimumDateTimeConstraint = new Date();
			}
			if (config.maximumDateTimeConstraint === 0) {
				config.maximumDateTimeConstraint = new Date();
			}

			// Ensure consistency between minDate/maxDate (datepicker) and minDateTime/maxDateTime (timepicker).
			const currentMinDate = config.minDate;
			if (currentMinDate instanceof Date) {
				config.minimumDateTimeConstraint = new Date(currentMinDate.getTime());
			}
			const currentMinDateTime = config.minimumDateTimeConstraint;
			if (currentMinDateTime instanceof Date) {
				config.minDate = new Date(currentMinDateTime.getTime());
			}
			const currentMaxDate = config.maxDate;
			if (currentMaxDate instanceof Date) {
				config.maximumDateTimeConstraint = new Date(currentMaxDate.getTime());
			}
			const currentMaxDateTime = config.maximumDateTimeConstraint;
			if (currentMaxDateTime instanceof Date) {
				config.maxDate = new Date(currentMaxDateTime.getTime());
			}

			instanceHandle._targetInput.on('focus', function () {
				instanceHandle._onInputFocus();
			});

			return instanceHandle;
		},

		/*
		 * Integrates our time selection controls into the datepicker UI.
		 * @param {Object} datepickerInstance - The internal datepicker instance.
		 */
		_addTimeControls: function (datepickerInstance) {
			const currentDateTimeString = (this._alternativeInput && this._baseConfiguration.alternativeFieldTimeOnly) ?
				this._targetInput.val() + this._baseConfiguration.dateTimeSeparator + this._alternativeInput.val() :
				this._targetInput.val();

			this._timeValueDefined = this._processTimeString(currentDateTimeString);
			this._adjustDateTimeLimits(datepickerInstance, false);
			this._renderTimeControls();
		},

		/*
		 * Parses the time string from the input value or a direct `_setTime` call.
		 * @param {string} inputTimeString - The string containing time information.
		 * @param {boolean} includesDatePart - True if the string also contains date information.
		 * @returns {boolean} True if parsing was successful, false otherwise.
		 */
		_processTimeString: function (inputTimeString, includesDatePart) {
			if (!this._currentInstance) {
				this._currentInstance = jQ.datepicker._getInst(this._targetInput[0]);
			}

			if (includesDatePart || !this._baseConfiguration.onlyTimeSelection) {
				const dateFormatPattern = jQ.datepicker._get(this._currentInstance, 'dateFormat');
				try {
					const parseResult = parseDateTimeStructure(dateFormatPattern, this._baseConfiguration.timeDisplayFormat, inputTimeString, jQ.datepicker._getFormatConfig(this._currentInstance), this._baseConfiguration);
					if (!parseResult || !parseResult.parsedTimeDetails) {
						return false;
					}
					jQ.extend(this, parseResult.parsedTimeDetails);
				} catch (err) {
					console.error("DateTimeSelector: Error parsing date/time string:", err,
						"\n  Input string =", inputTimeString,
						"\n  Time format =", this._baseConfiguration.timeDisplayFormat,
						"\n  Date format =", dateFormatPattern);
					return false;
				}
				return true;
			} else {
				const parsedTimeDetails = jQ.datepicker.parseTime(this._baseConfiguration.timeDisplayFormat, inputTimeString, this._baseConfiguration);
				if (!parsedTimeDetails) {
					return false;
				}
				jQ.extend(this, parsedTimeDetails);
				return true;
			}
		},

		/*
		 * Generates and inserts the HTML for time selection controls into the datepicker's UI.
		 */
		_renderTimeControls: function () {
			const datePickerDiv = this._currentInstance.dpDiv;
			const currentOptions = this._currentInstance.settings;
			const selectorInstance = this;
			let componentName = '';
			let capitalizedComponentName = '';
			let displayComponent = null;
			let componentMaxValues = {};
			let componentGridCounts = {};
			let componentWidth = null;
			let loopIndex = 0;
			let listLength = 0;

			// Guard clause to prevent rendering if timepicker is explicitly disabled.
			if (!currentOptions.showDateTimeSelector) {
				return;
			}

			// Prevent re-rendering if already present.
			if (datePickerDiv.find("div.ui-datetime-selector-panel").length > 0) {
				return;
			}

			const hiddenStyle = ' style="display:none;"';
			let timeControlsHtml = `<div class="ui-datetime-selector-panel${currentOptions.isRightToLeft ? ' ui-datetime-selector-rtl' : ''}">
				<dl>
					<dt class="ui-selector-time-label"${currentOptions.displayFullTime ? '' : hiddenStyle}>${currentOptions.timeSectionLabel}</dt>
					<dd class="ui-selector-time"${currentOptions.displayFullTime ? '' : hiddenStyle}></dd>`;

			// Helper function to calculate max value for a component based on step.
			const calculateComponentMaxValue = (compName) => {
				const min = currentOptions[`${compName}MinLimit`];
				const max = currentOptions[`${compName}MaxLimit`];
				const step = currentOptions[`${compName}StepValue`];
				return Number.parseInt((max - ((max - min) % step)), 10);
			};

			// Build HTML for each time component (hour, minute, second, millisec, microsec).
			for (loopIndex = 0, listLength = this._timeComponents.length; loopIndex < listLength; loopIndex++) {
				componentName = this._timeComponents[loopIndex];
				capitalizedComponentName = componentName.charAt(0).toLocaleUpperCase() + componentName.slice(1);
				displayComponent = currentOptions[`display${capitalizedComponentName}`] !== null ? currentOptions[`display${capitalizedComponentName}`] : this._featureSupport[componentName];

				componentMaxValues[componentName] = calculateComponentMaxValue(componentName);
				componentGridCounts[componentName] = 0;

				timeControlsHtml += `<dt class="ui-selector-${componentName}-label"${displayComponent ? '' : hiddenStyle}>${currentOptions[`${componentName}SectionLabel`]}</dt>
					<dd class="ui-selector-${componentName}"><div class="ui-selector-${componentName}-slider"${displayComponent ? '' : hiddenStyle}></div>`;

				if (displayComponent && currentOptions[`${componentName}GridSize`] > 0) {
					timeControlsHtml += `<div style="padding-left: 1px"><table class="ui-dtselector-grid-label"><tr>`;

					const step = Number.parseInt(currentOptions[`${componentName}GridSize`], 10);
					const min = currentOptions[`${componentName}MinLimit`];
					const max = componentMaxValues[componentName];

					for (let val = min; val <= max; val += step) {
						componentGridCounts[componentName]++;
						let formattedValue = '';
						if (componentName === 'hour') {
							formattedValue = jQ.datepicker.formatTime(this._featureSupport.ampm ? 'hht' : 'HH', {
								hour: val
							}, currentOptions);
						} else {
							formattedValue = (val < 10) ? `0${val}` : `${val}`;
						}
						timeControlsHtml += `<td data-time-unit="${componentName}">${formattedValue}</td>`;
					}
					timeControlsHtml += `</tr></table></div>`;
				}
				timeControlsHtml += `</dd>`;
			}

			// Add timezone selection.
			const displayTimezone = currentOptions.displayTimezone !== null ? currentOptions.displayTimezone : this._featureSupport.timezone;
			timeControlsHtml += `<dt class="ui-selector-timezone-label"${displayTimezone ? '' : hiddenStyle}>${currentOptions.timezoneSectionLabel}</dt>`;
			timeControlsHtml += `<dd class="ui-selector-timezone"${displayTimezone ? '' : hiddenStyle}></dd>`;

			timeControlsHtml += `</dl></div>`;
			const $timepickerPanel = jQ(timeControlsHtml);

			// If only time selection is required, hide datepicker elements.
			if (currentOptions.onlyTimeSelection === true) {
				$timepickerPanel.prepend(`<div class="ui-widget-header ui-helper-clearfix ui-corner-all">
					<div class="ui-datepicker-title">${currentOptions.onlyTimeSelectionTitle}</div>
				</div>`);
				datePickerDiv.find('.ui-datepicker-header, .ui-datepicker-calendar').hide();
			}

			// Configure sliders, grid elements, and attach events.
			for (loopIndex = 0, listLength = selectorInstance._timeComponents.length; loopIndex < listLength; loopIndex++) {
				componentName = selectorInstance._timeComponents[loopIndex];
				capitalizedComponentName = componentName.charAt(0).toLocaleUpperCase() + componentName.slice(1);
				displayComponent = currentOptions[`display${capitalizedComponentName}`] !== null ? currentOptions[`display${capitalizedComponentName}`] : this._featureSupport[componentName];

				// Instantiate the slider/control for the current component.
				selectorInstance[`_${componentName}Control`] = selectorInstance._activeControl.create(selectorInstance,
					$timepickerPanel.find(`.ui-selector-${componentName}-slider`),
					componentName, selectorInstance[`_current${capitalizedComponentName}`],
					currentOptions[`${componentName}MinLimit`], componentMaxValues[componentName],
					currentOptions[`${componentName}StepValue`]);

				// Adjust grid layout and attach click handlers for grid cells.
				if (displayComponent && currentOptions[`${componentName}GridSize`] > 0) {
					componentWidth = 100 * componentGridCounts[componentName] * currentOptions[`${componentName}GridSize`] / (componentMaxValues[componentName] - currentOptions[`${componentName}MinLimit`]);
					$timepickerPanel.find(`.ui-selector-${componentName} table`).css({
						width: `${componentWidth}%`,
						marginLeft: currentOptions.isRightToLeft ? '0' : `${(componentWidth / (-2 * componentGridCounts[componentName]))}%`,
						marginRight: currentOptions.isRightToLeft ? `${(componentWidth / (-2 * componentGridCounts[componentName]))}%` : '0',
						borderCollapse: 'collapse'
					}).find("td").on('click', function (event) {
						const $clickedCell = jQ(this);
						let valueFromCell = Number.parseInt($clickedCell.text().replace(/[^0-9]/g, ''), 10);
						const meridiemText = $clickedCell.text().replace(/[^apm]/ig, '');
						const targetComponent = $clickedCell.data('time-unit');

						if (targetComponent === 'hour') {
							if (meridiemText.includes('p') && valueFromCell < 12) {
								valueFromCell += 12;
							} else if (meridiemText.includes('a') && valueFromCell === 12) {
								valueFromCell = 0;
							}
						}

						selectorInstance._activeControl.value(selectorInstance, selectorInstance[`_${targetComponent}Control`], componentName, valueFromCell);

						selectorInstance._handleTimeUpdate();
						selectorInstance._triggerSelectEvent();
					}).css({
						cursor: 'pointer',
						width: `${(100 / componentGridCounts[componentName])}%`,
						textAlign: 'center',
						overflow: 'hidden'
					});
				}
			}

			// Populate and attach event for timezone dropdown.
			this._timezoneSelector = $timepickerPanel.find('.ui-selector-timezone').append('<select></select>').find("select");
			this._timezoneSelector.append(
				currentOptions.timezoneOptionsList.map(tzOption =>
					jQ("<option />").val(typeof tzOption === "object" ? tzOption.value : tzOption).text(typeof tzOption === "object" ? tzOption.label : tzOption)
				)
			);

			// Set the default selected timezone.
			const localTimezoneOffset = (new Date(this._currentInstance.selectedYear, this._currentInstance.selectedMonth, this._currentInstance.selectedDay, 12)).getTimezoneOffset() * -1;
			if (this._selectedTimezone !== null && this._selectedTimezone !== "") {
				if (localTimezoneOffset === this._selectedTimezone) {
					populateWithLocalTimezone(selectorInstance);
				} else {
					this._timezoneSelector.val(this._selectedTimezone);
				}
			} else if (this._currentHour !== null && this._currentHour !== "") { // Check if hour is set, then use default option.
				this._timezoneSelector.val(currentOptions.defaultTimezone);
			} else {
				populateWithLocalTimezone(selectorInstance); // Fallback to local if nothing else specified.
			}

			this._timezoneSelector.on('change', function () {
				selectorInstance._handleTimeUpdate();
				selectorInstance._triggerSelectEvent();
			});

			// Insert the timepicker panel into the datepicker's DOM.
			const controlButtonPanel = datePickerDiv.find('.ui-datepicker-buttonpane');
			if (controlButtonPanel.length) {
				controlButtonPanel.before($timepickerPanel);
			} else {
				datePickerDiv.append($timepickerPanel);
			}

			this._timeDisplayElement = $timepickerPanel.find('.ui-selector-time');

			// The original snippet ends here, so I'll stop here too.
			// The if (this.inst !== null) check is likely part of a larger block.
			// if (this._currentInstance !== null) {
			//    ... further initialization ...
			// }
		}

		// Additional methods would follow here in a complete implementation.
		// For instance: _onInputFocus, _updateDateTimeValue, _adjustDateTimeLimits, _handleTimeUpdate, _triggerSelectEvent, etc.
	});

	// --- Helper Functions (Stubs for demonstration, would be fully implemented in a real clone) ---

	// This function simulates the `extendRemove` from the original.
	// In a Type III clone, you might rewrite its logic or even replace it with a standard Object.assign if its "remove" logic isn't critical.
	function extendAndFilter(target, source) {
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				if (source[key] === null || source[key] === undefined) {
					delete target[key]; // Simulate "remove" if value is null/undefined.
				} else {
					target[key] = source[key];
				}
			}
		}
		return target;
	}

	// This function simulates `detectSupport` from the original.
	function determineFeatureSupport(formatString) {
		const support = {
			hour: /h|H/.test(formatString),
			minute: /m/.test(formatString),
			second: /s/.test(formatString),
			millisec: /l/.test(formatString),
			microsec: /c/.test(formatString),
			timezone: /z|Z/.test(formatString),
			ampm: /t|T/.test(formatString),
			iso8601: /Z/.test(formatString) // ISO 8601 timezone format
		};
		return support;
	}

	// This function simulates `parseDateTimeInternal` from the original.
	function parseDateTimeStructure(dateFormat, timeFormat, dateTimeString, formatConfig, componentOptions) {
		// Placeholder for actual parsing logic.
		// In a real clone, this would be a complex function.
		// For this example, we'll return a simple object.
		console.log("Simulating parseDateTimeStructure for:", dateTimeString);
		return {
			parsedTimeDetails: {
				_currentHour: 10,
				_currentMinute: 30,
				_currentSecond: 0,
				_currentMillisec: 0,
				_currentMicrosec: 0,
				_selectedTimezone: (new Date()).getTimezoneOffset() * -1
			}
		};
	}

	// This function simulates `selectLocalTimezone` from the original.
	function populateWithLocalTimezone(selectorInstance) {
		const localOffset = (new Date()).getTimezoneOffset() * -1;
		selectorInstance._timezoneSelector.val(localOffset);
		selectorInstance._selectedTimezone = localOffset;
	}


	// Attach the manager to jQuery.
	jQ.dateTimeSelector = new DateTimePickerManager();
	jQ.dateTimeSelector.log = { // Simple logger for demonstration.
		error: function(...args) { console.error("DateTimeSelector Error:", ...args); },
		warn: function(...args) { console.warn("DateTimeSelector Warning:", ...args); },
		info: function(...args) { console.info("DateTimeSelector Info:", ...args); }
	};

	// Mock `jQ.datepicker.formatTime` and `jQ.datepicker.parseTime` if they don't exist, for testing.
	if (!jQ.datepicker) {
		jQ.datepicker = {};
	}
	if (!jQ.datepicker.formatTime) {
		jQ.datepicker.formatTime = function(format, timeObj, options) {
			let output = format;
			output = output.replace(/HH/, String(timeObj.hour).padStart(2, '0'));
			output = output.replace(/mm/, String(timeObj.minute).padStart(2, '0'));
			output = output.replace(/h/, String(timeObj.hour % 12 || 12));
			output = output.replace(/t/, timeObj.hour < 12 ? 'am' : 'pm');
			return output;
		};
	}
	if (!jQ.datepicker.parseTime) {
		jQ.datepicker.parseTime = function(format, timeString, options) {
			// Very basic mock parsing.
			const parts = timeString.split(':');
			if (parts.length >= 2) {
				return {
					hour: Number.parseInt(parts[0], 10),
					minute: Number.parseInt(parts[1], 10),
					second: parts[2] ? Number.parseInt(parts[2], 10) : 0,
					millisec: 0,
					microsec: 0
				};
			}
			return null;
		};
	}

	// Mock `jQ.dateTimeSelector.timezoneOffsetString` and `jQ.dateTimeSelector.timezoneOffsetNumber`
	jQ.dateTimeSelector.formatTimezoneOffset = function(offsetMinutes, iso8601) {
		if (offsetMinutes === 0) return iso8601 ? 'Z' : 'GMT';
		const sign = offsetMinutes < 0 ? '-' : '+';
		const absOffset = Math.abs(offsetMinutes);
		const hours = Math.floor(absOffset / 60);
		const minutes = absOffset % 60;
		return `GMT${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
	};
	jQ.dateTimeSelector.parseTimezoneOffset = function(offsetString) {
		// Very basic parsing for this mock.
		if (offsetString === 'Z' || offsetString === 'GMT') return 0;
		const match = offsetString.match(/GMT([+-])(\d{2}):(\d{2})/);
		if (match) {
			const sign = match[1] === '+' ? 1 : -1;
			const hours = Number.parseInt(match[2], 10);
			const minutes = Number.parseInt(match[3], 10);
			return sign * (hours * 60 + minutes);
		}
		// If it's a number, assume it's already in minutes.
		const num = Number.parseInt(offsetString, 10);
		if (!isNaN(num)) return num;
		return 0; // Default to UTC
	};

})(jQuery);