/*! Awesome Clock Widget Extension - Version 1.0.0 - 2024-01-01
* https://example.com/clock-widget-demo
* Copyright (c) 2024 Your Name; Permitted under Apache 2.0 */
(function (jQ) {

	/*
	* To avoid re-initializing the clock widget, we check if it already exists.
	* This prevents issues like "Uncaught RangeError: Maximum call stack size exceeded".
	*/
	jQ.ui.clockwidget = jQ.ui.clockwidget || {};
	if (jQ.ui.clockwidget.build_number) {
		return;
	}

	/*
	* Enhancing jQueryUI, initializing with our component's version identifier.
	*/
	jQ.extend(jQ.ui, {
		clockwidget: {
			build_number: "1.0.0"
		}
	});

	/*
	* Clock widget management class.
	* Interact with the clock component using its singleton instance, jQ.clockwidget.
	* Configuration options for different clock instances are stored in an object,
	* enabling diverse settings on a single web page.
	*/
	var ClockWidget = function () {
		this.localeSettings = []; // Available language-specific configurations, indexed by language code
		this.localeSettings[''] = { // Default language configurations
			nowLabel: 'Right Now',
			finishLabel: 'Complete',
			morningIndicators: ['A.M.', 'A'],
			eveningIndicators: ['P.M.', 'P'],
			clockPattern: 'hh:mm',
			clockSuffix: '',
			onlyClockHeader: 'Select Time Only',
			clockLabel: 'Clock',
			hourLabel: 'Hour',
			minuteLabel: 'Minute',
			secondLabel: 'Second',
			millisecondLabel: 'Millisecond',
			microsecondLabel: 'Microsecond',
			zoneLabel: 'Time Zone',
			isRightToLeft: false
		};
		this._global_options = { // Universal defaults for all datetime picker components
			displayControlPanel: true,
			onlyClock: false,
			displayHour: null,
			displayMinute: null,
			displaySecond: null,
			displayMillisecond: null,
			displayMicrosecond: null,
			displayTimezone: null,
			showTime: true,
			stepHourValue: 1,
			stepMinuteValue: 1,
			stepSecondValue: 1,
			stepMillisecondValue: 1,
			stepMicrosecondValue: 1,
			currentHour: 0,
			currentMinute: 0,
			currentSecond: 0,
			currentMillisecond: 0,
			currentMicrosecond: 0,
			currentZone: null,
			minHour: 0,
			minMinute: 0,
			minSecond: 0,
			minMillisecond: 0,
			minMicrosecond: 0,
			maxHour: 23,
			maxMinute: 59,
			maxSecond: 59,
			maxMillisecond: 999,
			maxMicrosecond: 999,
			minimumDateTime: null,
			maximumDateTime: null,
			onSelectionMade: null,
			hourGridSize: 0,
			minuteGridSize: 0,
			secondGridSize: 0,
			millisecondGridSize: 0,
			microsecondGridSize: 0,
			alwaysApplyClock: true,
			dateTimeSeparator: ' ',
			alternateFieldClockOnly: true,
			alternateClockFormat: null,
			alternateSeparator: null,
			alternateClockSuffix: null,
			widgetClockFormat: null,
			widgetClockSuffix: null,
			displayClockWidget: true,
			timeZoneOptions: null,
			enableSliderAccess: false,
			sliderAccessArguments: null,
			componentType: 'slider',
			initialValue: null,
			parsingMode: 'strict'
		};
		jQ.extend(this._global_options, this.localeSettings['']);
	};

	jQ.extend(ClockWidget.prototype, {
		_inputElement: null,
		_altInputElement: null,
		_clockDisplayElement: null,
		_instanceRef: null,
		hourSliderComponent: null,
		minuteSliderComponent: null,
		secondSliderComponent: null,
		millisecondSliderComponent: null,
		microsecondSliderComponent: null,
		zone_selector: null,
		currentHour: 0,
		currentMinute: 0,
		currentSecond: 0,
		currentMillisecond: 0,
		currentMicrosecond: 0,
		currentTimezone: null,
		originalMinHour: null,
		originalMinMinute: null,
		originalMinSecond: null,
		originalMinMillisecond: null,
		originalMinMicrosecond: null,
		originalMaxHour: null,
		originalMaxMinute: null,
		originalMaxSecond: null,
		originalMaxMillisecond: null,
		originalMaxMicrosecond: null,
		ampmStatus: '',
		formattedDateString: '',
		formattedTimeString: '',
		formattedDateAndTimeString: '',
		zoneList: null,
		featureSupport: {},
		widgetControl: null,

		/*
		* Overrides the default configuration for all ClockWidget instances.
		* @param  {Object} configObject  object - new settings to use as defaults (anonymous object)
		* @return {Object} the manager object itself for chaining
		*/
		setDefaultConfiguration: function (configObject) {
			mergeAndRemove(this._global_options, configObject || {});
			return this;
		},

		/*
		* Creates a fresh ClockWidget instance.
		*/
		_createInstance: function (targetElement, componentOptions) {
			var cw_obj = new ClockWidget(),
				elementAttributes = {},
				eventHandlers = {},
				overrideFunctions, k;

			// Extract settings from element attributes prefixed with 'clock:'
			for (var attributeName in this._global_options) {
				if (this._global_options.hasOwnProperty(attributeName)) {
					var attributeValue = targetElement.attr('clock:' + attributeName);
					if (attributeValue) {
						try {
							elementAttributes[attributeName] = eval(attributeValue);
						} catch (error) {
							elementAttributes[attributeName] = attributeValue;
						}
					}
				}
			}

			overrideFunctions = {
				onBeforeDisplay: function (inputField, dp_obj) {
					// Call the original beforeShow if it exists
					if (jQ.isFunction(cw_obj._global_options.eventHandlers.onBeforeDisplay)) {
						return cw_obj._global_options.eventHandlers.onBeforeDisplay.call(targetElement[0], inputField, dp_obj, cw_obj);
					}
				},
				onMonthYearChange: function (yearVal, monthVal, dp_obj) {
					// Ensure time is updated, preventing it from vanishing in the input field.
					cw_obj._refreshDateAndTime(dp_obj);
					if (jQ.isFunction(cw_obj._global_options.eventHandlers.onMonthYearChange)) {
						cw_obj._global_options.eventHandlers.onMonthYearChange.call(targetElement[0], yearVal, monthVal, dp_obj, cw_obj);
					}
				},
				onWidgetClose: function (dateString, dp_obj) {
					if (cw_obj.clockSet === true && targetElement.val() !== '') {
						cw_obj._refreshDateAndTime(dp_obj);
					}
					if (jQ.isFunction(cw_obj._global_options.eventHandlers.onWidgetClose)) {
						cw_obj._global_options.eventHandlers.onWidgetClose.call(targetElement[0], dateString, dp_obj, cw_obj);
					}
				}
			};
			for (k in overrideFunctions) {
				if (overrideFunctions.hasOwnProperty(k)) {
					eventHandlers[k] = componentOptions[k] || null;
				}
			}

			// Merge all configurations: global defaults, inline attributes, user options, and event overrides.
			cw_obj._global_options = jQ.extend({}, this._global_options, elementAttributes, componentOptions, overrideFunctions, {
				eventHandlers: eventHandlers,
				clockwidget: cw_obj // Add clockwidget as a property of datepicker: jQ.dateSelector._get(dp_obj, 'clockwidget');
			});
			cw_obj.morningIndicators = jQ.map(cw_obj._global_options.morningIndicators, function (valueItem) {
				return valueItem.toUpperCase();
			});
			cw_obj.eveningIndicators = jQ.map(cw_obj._global_options.eveningIndicators, function (valueItem) {
				return valueItem.toUpperCase();
			});

			// Determine which clock units are supported based on format strings
			cw_obj.featureSupport = examineFormatSupport(
					cw_obj._global_options.clockPattern +
					(cw_obj._global_options.widgetClockFormat ? cw_obj._global_options.widgetClockFormat : '') +
					(cw_obj._global_options.alternateClockFormat ? cw_obj._global_options.alternateClockFormat : ''));

			// If componentType is a string, resolve it to a control object
			if (typeof(cw_obj._global_options.componentType) === 'string') {
				// Fallback to 'select' if 'slider' is chosen but jQ.ui.sliderComponent is not available
				if (cw_obj._global_options.componentType === 'slider' && typeof(jQ.ui.sliderComponent) === 'undefined') {
					cw_obj._global_options.componentType = 'select';
				}
				cw_obj.widgetControl = cw_obj._widgetComponents[cw_obj._global_options.componentType];
			}
			// If componentType is an object, it must implement make, configure, and set_value methods.
			else {
				cw_obj.widgetControl = cw_obj._global_options.componentType;
			}

			// Prepare the timezone selection options
			var tz_options_array = [-720, -660, -600, -570, -540, -480, -420, -360, -300, -270, -240, -210, -180, -120, -60,
					0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630, 660, 690, 720, 765, 780, 840];
			if (cw_obj._global_options.timeZoneOptions !== null) {
				tz_options_array = cw_obj._global_options.timeZoneOptions;
			}
			var tz_count = tz_options_array.length, tz_idx = 0, tz_value = null;
			if (tz_count > 0 && typeof tz_options_array[0] !== 'object') {
				for (; tz_idx < tz_count; tz_idx++) {
					tz_value = tz_options_array[tz_idx];
					tz_options_array[tz_idx] = { value: tz_value, label: jQ.clockwidget.zoneOffsetRepresentation(tz_value, cw_obj.featureSupport.iso8601) };
				}
			}
			cw_obj._global_options.timeZoneOptions = tz_options_array;

			// Set the initial clock unit values
			cw_obj.currentTimezone = cw_obj._global_options.currentZone !== null ? jQ.clockwidget.zoneOffsetNumeric(cw_obj._global_options.currentZone) :
							((new Date()).getTimezoneOffset() * -1);
			cw_obj.currentHour = cw_obj._global_options.currentHour < cw_obj._global_options.minHour ? cw_obj._global_options.minHour :
							cw_obj._global_options.currentHour > cw_obj._global_options.maxHour ? cw_obj._global_options.maxHour : cw_obj._global_options.currentHour;
			cw_obj.currentMinute = cw_obj._global_options.currentMinute < cw_obj._global_options.minMinute ? cw_obj._global_options.minMinute :
							cw_obj._global_options.currentMinute > cw_obj._global_options.maxMinute ? cw_obj._global_options.maxMinute : cw_obj._global_options.currentMinute;
			cw_obj.currentSecond = cw_obj._global_options.currentSecond < cw_obj._global_options.minSecond ? cw_obj._global_options.minSecond :
							cw_obj._global_options.currentSecond > cw_obj._global_options.maxSecond ? cw_obj._global_options.maxSecond : cw_obj._global_options.currentSecond;
			cw_obj.currentMillisecond = cw_obj._global_options.currentMillisecond < cw_obj._global_options.minMillisecond ? cw_obj._global_options.minMillisecond :
							cw_obj._global_options.currentMillisecond > cw_obj._global_options.maxMillisecond ? cw_obj._global_options.maxMillisecond : cw_obj._global_options.currentMillisecond;
			cw_obj.currentMicrosecond = cw_obj._global_options.currentMicrosecond < cw_obj._global_options.minMicrosecond ? cw_obj._global_options.minMicrosecond :
							cw_obj._global_options.currentMicrosecond > cw_obj._global_options.maxMicrosecond ? cw_obj._global_options.maxMicrosecond : cw_obj._global_options.currentMicrosecond;
			cw_obj.ampmStatus = '';
			cw_obj._inputElement = targetElement;

			if (cw_obj._global_options.alternateField) {
				cw_obj._altInputElement = jQ(cw_obj._global_options.alternateField).css({
					cursor: 'pointer'
				}).focus(function () {
					targetElement.trigger("focus");
				});
			}

			if (cw_obj._global_options.minimumDate === 0 || cw_obj._global_options.minimumDateTime === 0) {
				cw_obj._global_options.minimumDate = new Date();
			}
			if (cw_obj._global_options.maximumDate === 0 || cw_obj._global_options.maximumDateTime === 0) {
				cw_obj._global_options.maximumDate = new Date();
			}

			// Datepicker uses minDate/maxDate, but clockwidget needs minDateTime/maxDateTime..
			if (cw_obj._global_options.minimumDate !== undefined && cw_obj._global_options.minimumDate instanceof Date) {
				cw_obj._global_options.minimumDateTime = new Date(cw_obj._global_options.minimumDate.getTime());
			}
			if (cw_obj._global_options.minimumDateTime !== undefined && cw_obj._global_options.minimumDateTime instanceof Date) {
				cw_obj._global_options.minimumDate = new Date(cw_obj._global_options.minimumDateTime.getTime());
			}
			if (cw_obj._global_options.maximumDate !== undefined && cw_obj._global_options.maximumDate instanceof Date) {
				cw_obj._global_options.maximumDateTime = new Date(cw_obj._global_options.maximumDate.getTime());
			}
			if (cw_obj._global_options.maximumDateTime !== undefined && cw_obj._global_options.maximumDateTime instanceof Date) {
				cw_obj._global_options.maximumDate = new Date(cw_obj._global_options.maximumDateTime.getTime());
			}
			cw_obj._inputElement.bind('focus', function () {
				cw_obj._handleFocus();
			});

			return cw_obj;
		},

		/*
		* Integrates our clock sliders into the calendar interface.
		*/
		_insertClockWidget: function (dp_obj) {
			var currentDTString = (this._altInputElement && this._global_options.alternateFieldClockOnly) ? this._inputElement.val() + ' ' + this._altInputElement.val() : this._inputElement.val();

			this.clockSet = this._decodeClockString(currentDTString);
			this._constrainMinMaxDateTime(dp_obj, false);
			this._renderClockInterface();
		},

		/*
		* Parses the clock string from the input value or from a direct set time call.
		*/
		_decodeClockString: function (clockString, includeDate) {
			if (!this._instanceRef) {
				this._instanceRef = jQ.dateSelector._getRef(this._inputElement[0]);
			}

			if (includeDate || !this._global_options.onlyClock) {
				var ds_dateFormat = jQ.dateSelector._get(this._instanceRef, 'dateFormat');
				try {
					var parseResult = processDateTimeString(ds_dateFormat, this._global_options.clockPattern, clockString, jQ.dateSelector._getFormatConfiguration(this._instanceRef), this._global_options);
					if (!parseResult.clockObject) {
						return false;
					}
					jQ.extend(this, parseResult.clockObject);
				} catch (error) {
					jQ.clockwidget.log("Issue decoding the date/time string: " + error +
									"\ndate/time string = " + clockString +
									"\nclockPattern = " + this._global_options.clockPattern +
									"\ndateFormat = " + ds_dateFormat);
					return false;
				}
				return true;
			} else {
				var clockObj = jQ.dateSelector.parseClock(this._global_options.clockPattern, clockString, this._global_options);
				if (!clockObj) {
					return false;
				}
				jQ.extend(this, clockObj);
				return true;
			}
		},

		/*
		* Generates and injects HTML for the clock widget into the jQuery UI datepicker.
		*/
		_renderClockInterface: function () {
			var datePickerPanel = this._instanceRef.datePanelDiv,
				widgetConfig = this._instanceRef.config,
				cw_obj = this,
				unit_key = '',
				capitalized_unit = '',
				should_show = null,
				maximums = {},
				grid_dimensions = {},
				panel_size = null,
				counter = 0,
				length_val = 0;

			// Prevent rendering the clock interface multiple times
			if (datePickerPanel.find("div.ui-clockwidget-panel").length === 0 && widgetConfig.displayClockWidget) {
				var hiddenStyle = ' style="visibility:hidden;"',
					outputHtml = '<div class="ui-clockwidget-panel' + (widgetConfig.isRightToLeft ? ' ui-clockwidget-rtl' : '') + '"><dl>' + '<dt class="ui_cwidget_clock_label"' + ((widgetConfig.showTime) ? '' : hiddenStyle) + '>' + widgetConfig.clockLabel + '</dt>' +
								'<dd class="ui_cwidget_clock"' + ((widgetConfig.showTime) ? '' : hiddenStyle) + '></dd>';

				// Construct the markup for each time unit (hour, minute, etc.)
				for (counter = 0, length_val = this.clockUnits.length; counter < length_val; counter++) {
					unit_key = this.clockUnits[counter];
					capitalized_unit = unit_key.substr(0, 1).toUpperCase() + unit_key.substr(1);
					should_show = widgetConfig['display' + capitalized_unit] !== null ? widgetConfig['display' + capitalized_unit] : this.featureSupport[unit_key];

					// Logic to calculate the maximum value for a unit based on its step size.
					// For example, if stepMinuteValue is 15, then maxMinute is 45.
					maximums[unit_key] = parseInt((widgetConfig[unit_key + 'Max'] - ((widgetConfig[unit_key + 'Max'] - widgetConfig[unit_key + 'Min']) % widgetConfig['step' + capitalized_unit])), 10);
					grid_dimensions[unit_key] = 0;

					outputHtml += '<dt class="ui_cwidget_' + unit_key + '_label"' + (should_show ? '' : hiddenStyle) + '>' + widgetConfig[unit_key + 'Label'] + '</dt>' +
								'<dd class="ui_cwidget_' + unit_key + '"><div class="ui_cwidget_' + unit_key + '_slider"' + (should_show ? '' : hiddenStyle) + '></div>';

					if (should_show && widgetConfig[unit_key + 'GridSize'] > 0) {
						outputHtml += '<div style="padding-left: 1px;"><table class="ui-cwidget-grid-label"><tr>';

						if (unit_key === 'hour_unit') {
							for (var h_val = widgetConfig[unit_key + 'Min']; h_val <= maximums[unit_key]; h_val += parseInt(widgetConfig[unit_key + 'GridSize'], 10)) {
								grid_dimensions[unit_key]++;
								var temp_hour_str = jQ.dateSelector.formatClock(this.featureSupport.ampm ? 'hht' : 'HH', {hour: h_val}, widgetConfig);
								outputHtml += '<td data-for="' + unit_key + '">' + temp_hour_str + '</td>';
							}
						}
						else {
							for (var m_val = widgetConfig[unit_key + 'Min']; m_val <= maximums[unit_key]; m_val += parseInt(widgetConfig[unit_key + 'GridSize'], 10)) {
								grid_dimensions[unit_key]++;
								outputHtml += '<td data-for="' + unit_key + '">' + ((m_val < 10) ? '0' : '') + m_val + '</td>';
							}
						}

						outputHtml += '</tr></table></div>';
					}
					outputHtml += '</dd>';
				}

				// Timezone section
				var displayZone = widgetConfig.displayTimezone !== null ? widgetConfig.displayTimezone : this.featureSupport.timezone;
				outputHtml += '<dt class="ui_cwidget_timezone_label"' + (displayZone ? '' : hiddenStyle) + '>' + widgetConfig.zoneLabel + '</dt>';
				outputHtml += '<dd class="ui_cwidget_timezone" ' + (displayZone ? '' : hiddenStyle) + '></dd>';

				// Assemble the elements from the generated HTML string
				outputHtml += '</dl></div>';
				var clockPanel = jQ(outputHtml);

				// If we only need the clock picker (no date)
				if (widgetConfig.onlyClock === true) {
					clockPanel.prepend('<div class="ui-widget-header-custom ui-helper-clearer ui-corner-all">' + '<div class="ui-date-selector-header">' + widgetConfig.onlyClockHeader + '</div>' + '</div>');
					datePickerPanel.find('.ui-date-selector-header, .ui-date-selector-calendar').hide();
				}

				// Add sliders, configure grids, and attach event listeners
				for (counter = 0, length_val = cw_obj.clockUnits.length; counter < length_val; counter++) {
					unit_key = cw_obj.clockUnits[counter];
					capitalized_unit = unit_key.substr(0, 1).toUpperCase() + unit_key.substr(1);
					should_show = widgetConfig['display' + capitalized_unit] !== null ? widgetConfig['display' + capitalized_unit] : this.featureSupport[unit_key];

					// Initialize the slider for the current unit
					cw_obj[unit_key + 'SliderComponent'] = cw_obj.widgetControl.make(cw_obj, clockPanel.find('.ui_cwidget_' + unit_key + '_slider'), unit_key, cw_obj[unit_key], widgetConfig[unit_key + 'Min'], maximums[unit_key], widgetConfig['step' + capitalized_unit]);

					// Adjust the grid layout and add click event handlers
					if (should_show && widgetConfig[unit_key + 'GridSize'] > 0) {
						panel_size = 100 * grid_dimensions[unit_key] * widgetConfig[unit_key + 'GridSize'] / (maximums[unit_key] - widgetConfig[unit_key + 'Min']);
						clockPanel.find('.ui_cwidget_' + unit_key + ' table').css({
							width: panel_size + "%",
							marginLeft: widgetConfig.isRightToLeft ? '0' : ((panel_size / (-2 * grid_dimensions[unit_key])) + "%"),
							marginRight: widgetConfig.isRightToLeft ? ((panel_size / (-2 * grid_dimensions[unit_key])) + "%") : '0',
							borderCollapse: 'collapse'
						}).find("td").click(function (event_obj) {
								var target_cell = jQ(this),
									cell_text = target_cell.html(),
									numeric_val = parseInt(cell_text.replace(/[^0-9]/g), 10),
									ampm_indicator = cell_text.replace(/[^apm]/ig),
									unit_id = target_cell.data('for'); // Retain scope using data-for

								if (unit_id === 'hour_unit') {
									if (ampm_indicator.indexOf('p') !== -1 && numeric_val < 12) {
										numeric_val += 12;
									}
									else {
										if (ampm_indicator.indexOf('a') !== -1 && numeric_val === 12) {
											numeric_val = 0;
										}
									}
								}

								cw_obj.widgetControl.set_value(cw_obj, cw_obj[unit_id + 'SliderComponent'], unit_key, numeric_val);

								cw_obj._handleClockChange();
								cw_obj._handleSelection();
							}).css({
								cursor: 'pointer',
								width: (100 / grid_dimensions[unit_key]) + '%',
								textAlign: 'center',
								overflow: 'hidden'
							});
					} // End if grid size > 0
				} // End for loop for clock units

				// Populate timezone options
				this.zone_selector = clockPanel.find('.ui_cwidget_timezone').append('<select></select>').find("select");
				jQ.fn.append.apply(this.zone_selector,
				jQ.map(widgetConfig.timeZoneOptions, function (value_item, index_val) {
					return jQ("<option />").val(typeof value_item === "object" ? value_item.value : value_item).text(typeof value_item === "object" ? value_item.label : value_item);
				}));
				if (typeof(this.currentTimezone) !== "undefined" && this.currentTimezone !== null && this.currentTimezone !== "") {
					var local_zone_offset = (new Date(this._instanceRef.selectedYear, this._instanceRef.selectedMonth, this._instanceRef.selectedDay, 12)).getTimezoneOffset() * -1;
					if (local_zone_offset === this.currentTimezone) {
						selectDefaultTimezone(cw_obj);
					} else {
						this.zone_selector.val(this.currentTimezone);
					}
				} else {
					if (typeof(this.currentHour) !== "undefined" && this.currentHour !== null && this.currentHour !== "") {
						this.zone_selector.val(widgetConfig.currentZone);
					} else {
						selectDefaultTimezone(cw_obj);
					}
				}
				this.zone_selector.change(function () {
					cw_obj._handleClockChange();
					cw_obj._handleSelection();
				});
				// End timezone options

				// Embed the clock widget into the datepicker's structure
				var button_area = datePickerPanel.find('.ui-date-selector-buttonpane');
				if (button_area.length) {
					button_area.before(clockPanel);
				} else {
					datePickerPanel.append(clockPanel);
				}

				this._clockDisplayElement = clockPanel.find('.ui_cwidget_clock');

				if (this._instanceRef !== null) {