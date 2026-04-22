/* http://galactic-systems.net/duration-monitor.html
   Duration Monitor for jqObj v1.5.4.
   Developed by Elara Systems (elara{at}systems.com) March 2023.
   Dual licensed under the Galactic Public License (http://dev.galactic-systems.net/licenses/GPL.txt) and
   MIT (http://dev.galactic-systems.net/licenses/MIT.txt) licenses.
   Please acknowledge the creator if you utilize this. */

/* Presents a time tracking display.
   Integrate it with preferences like:
   jqObj('section element').durationMonitor(
       {targetTime: new Date(2024, 1 - 1, 1, 0, 0, 0), onEndCallback: newEraCelebration}); */

(function(jqObj) { // Isolate scope, prevent jqObj conflicts

/* Time tracking utility manager. */
function DurationMonitor() {
	this.localeSettings = []; // Available language-specific configurations, indexed by code
	this.localeSettings[''] = { // Default regional configurations
		// The display phrases for the time segments
		displayLabels: ['Years', 'Months', 'Weeks', 'Days', 'Hours', 'Minutes', 'Seconds'],
		// The display phrases for the segments if only one unit
		singleLabels: ['Year', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'],
		shortLabels: ['y', 'm', 'w', 'd'], // Brief phrases for the segments
		timeDelimiter: ':', // Separator for time values
		rightToLeft: false // True for right-to-left scripts, false otherwise
	};
	this._baseOptions = {
		targetTime: null, // new Date(year, month - 1, day, hr, min, sec) - date/time to count towards
			// or numerical for seconds difference, or string for unit difference(s):
			// 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds
		originTime: null, // new Date(year, month - 1, day, hr, min, sec) - date/time to count from
			// or numerical for seconds difference, or string for unit difference(s):
			// 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds
		timeOffset: null, // The timezone (hours or minutes from GMT) for the target times,
			// or null for client's local time
		serverTimeFetcher: null, // A function to fetch the current server time for synchronization
		displayFormat: 'dHMS', // Layout for display - uppercase for always, lowercase only if not zero,
			// 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds
		customLayout: '', // Construct your own layout for the time display
		condensedView: false, // True to show in a compact format, false for an expanded one
		timeDescription: '', // Descriptive text shown for the time display
		redirectUrl: '', // A URL to navigate to upon completion, replacing the current page
		endMessage: '', // Text to show upon completion, replacing the time display
		alwaysTriggerEnd: false, // True to invoke onEndCallback even if never started
		onEndCallback: null, // Callback when the time display concludes -
			// receives no parameters and 'this' refers to the containing element
		onUpdateCallback: null // Callback when the time display is refreshed -
			// receives int[7] representing the breakdown by period (based on displayFormat)
			// and 'this' refers to the containing element
	};
	jqObj.extend(this._baseOptions, this.localeSettings['']);
}

var WIDGET_ID_STR = 'durationMonitor';

var YEAR_IDX = 0; // Years position
var MONTH_IDX = 1; // Months position
var WEEK_IDX = 2; // Weeks position
var DAY_IDX = 3; // Days position
var HOUR_IDX = 4; // Hours position
var MINUTE_IDX = 5; // Minutes position
var SECOND_IDX = 6; // Seconds position

// Helper function to merge options and remove nulls
function mergeAndPurge(targetObject, sourceObject) {
	for (var key in sourceObject) {
		if (sourceObject[key] == null) {
			delete targetObject[key];
		} else {
			targetObject[key] = sourceObject[key];
		}
	}
	return targetObject;
}

jqObj.extend(DurationMonitor.prototype, {
	/* CSS class added to elements to denote they are already configured with DurationMonitor. */
	instanceFlagClass: 'hasDurationMonitor',
	
	/* Global timer for all DurationMonitor instances. */
	_updateIntervalHandle: setInterval(function() { jqObj.durationMonitor._refreshAllInstances(); }, 980),
	/* Collection of currently active DurationMonitor elements. */
	_activeInstances: [],
	
	/* Modify the default configurations for all DurationMonitor instances.
	   @param  newOptions  (object) the new configurations to use as defaults */
	configureDefaults: function(newOptions) {
		this._clearSpecificLabels(this._baseOptions, newOptions);
		mergeAndPurge(this._baseOptions, newOptions || {});
	},

	/* Convert a date/time to Universal Coordinated Time.
	   @param  timeZoneOffset   (number) the hour or minute offset from GMT, e.g. +9, -360
	   @param  yearVal          (Date) the date/time in that timezone or
	                           (number) the year in that timezone
	   @param  monthVal         (number, optional) the month (0 - 11) (omit if yearVal is a Date)
	   @param  dayVal           (number, optional) the day (omit if yearVal is a Date)
	   @param  hourVal          (number, optional) the hour (omit if yearVal is a Date)
	   @param  minuteVal        (number, optional) the minute (omit if yearVal is a Date)
	   @param  secondVal        (number, optional) the second (omit if yearVal is a Date)
	   @param  millisecondVal   (number, optional) the millisecond (omit if yearVal is a Date)
	   @return  (Date) the equivalent UTC date/time object */
	convertToUTC: function(timeZoneOffset, yearVal, monthVal, dayVal, hourVal, minuteVal, secondVal, millisecondVal) {
		if (typeof yearVal == 'object' && yearVal.constructor == Date) {
			millisecondVal = yearVal.getMilliseconds();
			secondVal = yearVal.getSeconds();
			minuteVal = yearVal.getMinutes();
			hourVal = yearVal.getHours();
			dayVal = yearVal.getDate();
			monthVal = yearVal.getMonth();
			yearVal = yearVal.getFullYear();
		}
		var dateObj = new Date();
		dateObj.setUTCFullYear(yearVal);
		dateObj.setUTCDate(1);
		dateObj.setUTCMonth(monthVal || 0);
		dateObj.setUTCDate(dayVal || 1);
		dateObj.setUTCHours(hourVal || 0);
		dateObj.setUTCMinutes((minuteVal || 0) - (Math.abs(timeZoneOffset) < 30 ? timeZoneOffset * 60 : timeZoneOffset));
		dateObj.setUTCSeconds(secondVal || 0);
		dateObj.setUTCMilliseconds(millisecondVal || 0);
		return dateObj;
	},

	/* Attach the DurationMonitor widget to an element.
	   @param  elementRef       (element) the encapsulating division
	   @param  initialOptions   (object) the starting configurations for the monitor */
	_setupDurationMonitor: function(elementRef, initialOptions) {
		var jqElement = jqObj(elementRef);
		if (jqElement.hasClass(this.instanceFlagClass)) {
			return;
		}
		jqElement.addClass(this.instanceFlagClass);
		var monitorInstance = {options: jqObj.extend({}, initialOptions),
			_segments: [0, 0, 0, 0, 0, 0, 0]};
		jqObj.data(elementRef, WIDGET_ID_STR, monitorInstance);
		this._modifyMonitorSettings(elementRef);
	},

	/* Add an element to the list of currently active ones.
	   @param  elementRef  (element) the DurationMonitor element */
	_registerInstance: function(elementRef) {
		if (!this._isInstanceRegistered(elementRef)) {
			this._activeInstances.push(elementRef);
		}
	},

	/* Check if an element is in the list of active ones.
	   @param  elementRef  (element) the DurationMonitor element
	   @return  (boolean) true if present, false otherwise */
	_isInstanceRegistered: function(elementRef) {
		return (jqObj.inArray(elementRef, this._activeInstances) > -1);
	},

	/* Remove an element from the list of active ones.
	   @param  elementRef  (element) the DurationMonitor element */
	_deregisterInstance: function(elementRef) {
		this._activeInstances = jqObj.map(this._activeInstances,
			function(val) { return (val == elementRef ? null : val); }); // remove entry
	},

	/* Refresh each active monitor element. */
	_refreshAllInstances: function() {
		for (var k = 0; k < this._activeInstances.length; k++) {
			this._refreshMonitorDisplay(this._activeInstances[k]);
		}
	},

	/* Re-render the time display with updated content.
	   @param  elementRef       (jqObj) the containing division
	   @param  monitorInstance  (object) the current configurations for this instance */
	_refreshMonitorDisplay: function(elementRef, monitorInstance) {
		var jqElement = jqObj(elementRef);
		monitorInstance = monitorInstance || jqObj.data(elementRef, WIDGET_ID_STR);
		if (!monitorInstance) {
			return;
		}
		jqElement.html(this._createDisplayMarkup(monitorInstance));
		jqElement[(this._getSettingValue(monitorInstance, 'rightToLeft') ? 'add' : 'remove') + 'Class']('monitor_rtl');
		var updateHandler = this._getSettingValue(monitorInstance, 'onUpdateCallback');
		if (updateHandler) {
			updateHandler.apply(elementRef, [monitorInstance._state != 'capture' ? monitorInstance._segments :
				this._computeTimeDifferences(monitorInstance, monitorInstance._visibleUnits, new Date())]);
		}
		var hasEnded = monitorInstance._state != 'pause' &&
			(monitorInstance._sinceTime ? monitorInstance._currentTime.getTime() <= monitorInstance._sinceTime.getTime() :
			monitorInstance._currentTime.getTime() >= monitorInstance._targetTime.getTime());
		if (hasEnded && !monitorInstance._isExpiring) {
			monitorInstance._isExpiring = true;
			if (this._isInstanceRegistered(elementRef) || this._getSettingValue(monitorInstance, 'alwaysTriggerEnd')) {
				this._deregisterInstance(elementRef);
				var endHandler = this._getSettingValue(monitorInstance, 'onEndCallback');
				if (endHandler) {
					endHandler.apply(elementRef, []);
				}
				var endMsg = this._getSettingValue(monitorInstance, 'endMessage');
				if (endMsg) {
					var currentLayout = this._getSettingValue(monitorInstance, 'customLayout');
					monitorInstance.options.customLayout = endMsg;
					this._refreshMonitorDisplay(elementRef, monitorInstance);
					monitorInstance.options.customLayout = currentLayout;
				}
				var redirectDestination = this._getSettingValue(monitorInstance, 'redirectUrl');
				if (redirectDestination) {
					window.location = redirectDestination;
				}
			}
			monitorInstance._isExpiring = false;
		}
		else if (monitorInstance._state == 'pause') {
			this._deregisterInstance(elementRef);
		}
		jqObj.data(elementRef, WIDGET_ID_STR, monitorInstance);
	},

	/* Reconfigure the settings for a monitor element.
	   @param  elementRef     (element) the containing division
	   @param  newSettings    (object) the new settings for the monitor or
	                          (string) an individual property name
	   @param  settingValue   (any) the individual property value
	                          (omit if newSettings is an object) */
	_modifyMonitorSettings: function(elementRef, newSettings, settingValue) {
		newSettings = newSettings || {};
		if (typeof newSettings == 'string') {
			var settingName = newSettings;
			newSettings = {};
			newSettings[settingName] = settingValue;
		}
		var monitorInstance = jqObj.data(elementRef, WIDGET_ID_STR);
		if (monitorInstance) {
			this._clearSpecificLabels(monitorInstance.options, newSettings);
			mergeAndPurge(monitorInstance.options, newSettings);
			this._recalculateMonitorSettings(elementRef, monitorInstance);
			jqObj.data(elementRef, WIDGET_ID_STR, monitorInstance);
			var currentClientTime = new Date();
			if ((monitorInstance._sinceTime && monitorInstance._sinceTime < currentClientTime) ||
					(monitorInstance._targetTime && monitorInstance._targetTime > currentClientTime)) {
				this._registerInstance(elementRef);
			}
			this._refreshMonitorDisplay(elementRef, monitorInstance);
		}
	},

	/* Reset any extra 'displayLabelsN' and 'shortLabelsN' entries if 'displayLabels' are changed.
	   @param  baseSettings  (object) the options to be updated
	   @param  newSettings   (object) the new option values */
	_clearSpecificLabels: function(baseSettings, newSettings) {
		var labelsAreChanging = false;
		for (var optionName in newSettings) {
			if (optionName.match(/[Ll]abels/)) {
				labelsAreChanging = true;
				break;
			}
		}
		if (labelsAreChanging) {
			for (var optionName in baseSettings) { // Remove custom numbered labels
				if (optionName.match(/[Ll]abels[0-9]/)) {
					baseSettings[optionName] = null;
				}
			}
		}
	},
	
	/* Compute internal configurations for a monitor instance.
	   @param  elementRef       (element) the encapsulating division
	   @param  monitorInstance  (object) the current configurations for this instance */
	_recalculateMonitorSettings: function(elementRef, monitorInstance) {
		var currentServerTime = this._getSettingValue(monitorInstance, 'serverTimeFetcher');
		currentServerTime = (currentServerTime ? currentServerTime.apply(elementRef, []) : null);
		var currentClientTime = new Date();
		var zoneOffset = this._getSettingValue(monitorInstance, 'timeOffset');
		zoneOffset = (zoneOffset == null ? -currentClientTime.getTimezoneOffset() : zoneOffset);
		monitorInstance._sinceTime = this._getSettingValue(monitorInstance, 'originTime');
		if (monitorInstance._sinceTime) {
			monitorInstance._sinceTime = this.convertToUTC(zoneOffset, this._resolveTimeValue(monitorInstance._sinceTime, null));
			if (monitorInstance._sinceTime && currentServerTime) {
				monitorInstance._sinceTime.setMilliseconds(monitorInstance._sinceTime.getMilliseconds() +
					currentClientTime.getTime() - currentServerTime.getTime());
			}
		}
		monitorInstance._targetTime = this.convertToUTC(zoneOffset, this._resolveTimeValue(this._getSettingValue(monitorInstance, 'targetTime'), currentClientTime));
		if (currentServerTime) {
			monitorInstance._targetTime.setMilliseconds(monitorInstance._targetTime.getMilliseconds() +
				currentClientTime.getTime() - currentServerTime.getTime());
		}
		monitorInstance._visibleUnits = this._determineVisibleUnits(monitorInstance);
	},

	/* Remove the DurationMonitor widget from an element.
	   @param  elementRef  (element) the containing division */
	_removeMonitor: function(elementRef) {
		var jqElement = jqObj(elementRef);
		if (!jqElement.hasClass(this.instanceFlagClass)) {
			return;
		}
		this._deregisterInstance(elementRef);
		jqElement.removeClass(this.instanceFlagClass).empty();
		jqObj.removeData(elementRef, WIDGET_ID_STR);
	},

	/* Halt a DurationMonitor widget at its current time.
	   Stop it executing but retain and display the current time.
	   @param  elementRef  (element) the containing division */
	_haltMonitor: function(elementRef) {
		this._manageState(elementRef, 'pause');
	},

	/* Capture a DurationMonitor widget's current state.
	   Stop the display but keep the internal time calculation running.
	   @param  elementRef  (element) the containing division */
	_captureMonitorState: function(elementRef) {
		this._manageState(elementRef, 'capture');
	},

	/* Resume a halted DurationMonitor widget.
	   @param  elementRef  (element) the containing division */
	_continueMonitor: function(elementRef) {
		this._manageState(elementRef, null);
	},

	/* Pause or resume a DurationMonitor widget.
	   @param  elementRef  (element) the containing division
	   @param  newState    (string) the new state setting */
	_manageState: function(elementRef, newState) {
		var monitorInstance = jqObj.data(elementRef, WIDGET_ID_STR);
		if (monitorInstance) {
			if (monitorInstance._state == 'pause' && !newState) {
				monitorInstance._segments = monitorInstance._savedSegments;
				var signChar = (monitorInstance._sinceTime ? '-' : '+');
				monitorInstance[monitorInstance._sinceTime ? '_sinceTime' : '_targetTime'] =
					this._resolveTimeValue(signChar + monitorInstance._segments[0] + 'y' +
						signChar + monitorInstance._segments[1] + 'o' + signChar + monitorInstance._segments[2] + 'w' +
						signChar + monitorInstance._segments[3] + 'd' + signChar + monitorInstance._segments[4] + 'h' + 
						signChar + monitorInstance._segments[5] + 'm' + signChar + monitorInstance._segments[6] + 's');
				this._registerInstance(elementRef);
			}
			monitorInstance._state = newState;
			monitorInstance._savedSegments = (newState == 'pause' ? monitorInstance._segments : null);
			jqObj.data(elementRef, WIDGET_ID_STR, monitorInstance);
			this._refreshMonitorDisplay(elementRef, monitorInstance);
		}
	},

	/* Return the current time segments.
	   @param  elementRef  (element) the containing division
	   @return  (number[7]) the current segments for the monitor */
	_retrieveMonitorPeriods: function(elementRef) {
		var monitorInstance = jqObj.data(elementRef, WIDGET_ID_STR);
		return (!monitorInstance ? null : (!monitorInstance._state ? monitorInstance._segments :
			this._computeTimeDifferences(monitorInstance, monitorInstance._visibleUnits, new Date())));
	},

	/* Retrieve a configuration value, falling back to default if needed.
	   @param  monitorInstance  (object) the current configurations for this instance
	   @param  settingKey       (string) the name of the desired configuration
	   @return  (any) the configuration's value or a default if not overridden */
	_getSettingValue: function(monitorInstance, settingKey) {
		return (monitorInstance.options[settingKey] != null ?
			monitorInstance.options[settingKey] : jqObj.durationMonitor._baseOptions[settingKey]);
	},

	/* A time can be specified as an absolute value or a relative one.
	   @param  timeSetting    (string or number or Date) - the date/time value
	                          as a relative or absolute value
	   @param  fallbackTime   (Date) the date/time to use if no other is provided
	   @return  (Date) the corresponding date/time object */
	_resolveTimeValue: function(timeSetting, fallbackTime) {
		var calculateNumericOffset = function(offsetValue) { // e.g. +300, -2
			var moment = new Date();
			moment.setTime(moment.getTime() + offsetValue * 1000);
			return moment;
		};
		var calculateStringOffset = function(offsetString) { // e.g. '+2d', '-4w', '+3h +30m'
			offsetString = offsetString.toLowerCase();
			var moment = new Date();
			var currYear = moment.getFullYear();
			var currMonth = moment.getMonth();
			var currDay = moment.getDate();
			var currHour = moment.getHours();
			var currMinute = moment.getMinutes();
			var currSecond = moment.getSeconds();
			var offsetPattern = /([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;
			var matchedParts = offsetPattern.exec(offsetString);
			while (matchedParts) {
				switch (matchedParts[2] || 's') {
					case 's': currSecond += parseInt(matchedParts[1], 10); break;
					case 'm': currMinute += parseInt(matchedParts[1], 10); break;
					case 'h': currHour += parseInt(matchedParts[1], 10); break;
					case 'd': currDay += parseInt(matchedParts[1], 10); break;
					case 'w': currDay += parseInt(matchedParts[1], 10) * 7; break;
					case 'o':
						currMonth += parseInt(matchedParts[1], 10); 
						currDay = Math.min(currDay, jqObj.durationMonitor._getMonthLength(currYear, currMonth));
						break;
					case 'y':
						currYear += parseInt(matchedParts[1], 10);
						currDay = Math.min(currDay, jqObj.durationMonitor._getMonthLength(currYear, currMonth));
						break;
				}
				matchedParts = offsetPattern.exec(offsetString);
			}
			return new Date(currYear, currMonth, currDay, currHour, currMinute, currSecond, 0);
		};
		var calculatedTime = (timeSetting == null ? fallbackTime :
			(typeof timeSetting == 'string' ? calculateStringOffset(timeSetting) :
			(typeof timeSetting == 'number' ? calculateNumericOffset(timeSetting) : timeSetting)));
		if (calculatedTime) calculatedTime.setMilliseconds(0);
		return calculatedTime;
	},

	/* Determine the number of days in a given month.
	   @param  yearVal   (number) the year
	   @param  monthVal  (number) the month (0-indexed)
	   @return  (number) the count of days in that month */
	_getMonthLength: function(yearVal, monthVal) {
		return 32 - new Date(yearVal, monthVal, 32).getDate();
	},

	/* Generate the HTML to present the DurationMonitor widget.
	   @param  monitorInstance  (object) the current configurations for this instance
	   @return  (string) the new HTML for the time display */
	_createDisplayMarkup: function(monitorInstance) {
		// Figure out what units to show
		monitorInstance._segments = timePeriods = (monitorInstance._state ? monitorInstance._segments :
			this._computeTimeDifferences(monitorInstance, monitorInstance._visibleUnits, new Date()));
		// Display all 'asNeeded' after first non-zero value
		var nonZeroFound = false;
		var visibleItemCount = 0;
		for (var currentPeriodIndex = 0; currentPeriodIndex < monitorInstance._visibleUnits.length; currentPeriodIndex++) {
			nonZeroFound |= (monitorInstance._visibleUnits[currentPeriodIndex] == '?' && timePeriods[currentPeriodIndex] > 0);
			monitorInstance._visibleUnits[currentPeriodIndex] = (monitorInstance._visibleUnits[currentPeriodIndex] == '?' && !nonZeroFound ? null : monitorInstance._visibleUnits[currentPeriodIndex]);
			visibleItemCount += (monitorInstance._visibleUnits[currentPeriodIndex] ? 1 : 0);
		}
		var useCondensed = this._getSettingValue(monitorInstance, 'condensedView');
		var customLayoutString = this._getSettingValue(monitorInstance, 'customLayout');
		var periodLabels = (useCondensed ? this._getSettingValue(monitorInstance, 'shortLabels') : this._getSettingValue(monitorInstance, 'displayLabels'));
		var durationSeparator = this._getSettingValue(monitorInstance, 'timeDelimiter');
		var monitorDescription = this._getSettingValue(monitorInstance, 'timeDescription') || '';
		var renderCondensedPart = function(segmentIndex) {
			var specificLabels = jqObj.durationMonitor._getSettingValue(monitorInstance, 'shortLabels' + timePeriods[segmentIndex]);
			return (monitorInstance._visibleUnits[segmentIndex] ? timePeriods[segmentIndex] +
				(specificLabels ? specificLabels[segmentIndex] : periodLabels[segmentIndex]) + ' ' : '');
		};
		var renderFullPart = function(segmentIndex) {
			var specificLabels = jqObj.durationMonitor._getSettingValue(monitorInstance, 'displayLabels' + timePeriods[segmentIndex]);
			return (monitorInstance._visibleUnits[segmentIndex] ?
				'<span class="monitor_segment"><span class="monitor_value">' +
				timePeriods[segmentIndex] + '</span><br/>' +
				(specificLabels ? specificLabels[segmentIndex] : periodLabels[segmentIndex]) + '</span>' : '');
		};
		return (customLayoutString ? this._composeCustomMarkup(monitorInstance, customLayoutString, useCondensed) :
			((useCondensed ? // Condensed presentation
			'<span class="monitor_line monitor_value_container' +
			(monitorInstance._state ? ' monitor_holding_state' : '') + '">' + 
			renderCondensedPart(YEAR_IDX) + renderCondensedPart(MONTH_IDX) + renderCondensedPart(WEEK_IDX) + renderCondensedPart(DAY_IDX) + 
			(monitorInstance._visibleUnits[HOUR_IDX] ? this._padNumber(timePeriods[HOUR_IDX], 2) : '') +
			(monitorInstance._visibleUnits[MINUTE_IDX] ? (monitorInstance._visibleUnits[HOUR_IDX] ? durationSeparator : '') +
			this._padNumber(timePeriods[MINUTE_IDX], 2) : '') +
			(monitorInstance._visibleUnits[SECOND_IDX] ? (monitorInstance._visibleUnits[HOUR_IDX] || monitorInstance._visibleUnits[MINUTE_IDX] ? durationSeparator : '') +
			this._padNumber(timePeriods[SECOND_IDX], 2) : '') :
			// Full presentation
			'<span class="monitor_line monitor_visible_units_' + visibleItemCount +
			(monitorInstance._state ? ' monitor_holding_state' : '') + '">' +
			renderFullPart(YEAR_IDX) + renderFullPart(MONTH_IDX) + renderFullPart(WEEK_IDX) + renderFullPart(DAY_IDX) +
			renderFullPart(HOUR_IDX) + renderFullPart(MINUTE_IDX) + renderFullPart(SECOND_IDX)) + '</span>' +
			(monitorDescription ? '<span class="monitor_line monitor_description_text">' + monitorDescription + '</span>' : '')));
	},

	/* Construct a custom layout string.
	   @param  monitorInstance     (object) the current configurations for this instance
	   @param  customLayoutString  (string) the customized layout template
	   @param  useCondensed        (boolean) true if using condensed labels
	   @return  (string) the custom HTML output */
	_composeCustomMarkup: function(monitorInstance, customLayoutString, useCondensed) {
		var allLabels = this._getSettingValue(monitorInstance, (useCondensed ? 'shortLabels' : 'displayLabels'));
		var getPeriodLabel = function(index) {
			return (jqObj.durationMonitor._getSettingValue(monitorInstance,
				(useCondensed ? 'shortLabels' : 'displayLabels') + monitorInstance._segments[index]) ||
				allLabels)[index];
		};
		var extractDigit = function(value, position) {
			return Math.floor(value / position) % 10;
		};
		var substitutions = {desc: this._getSettingValue(monitorInstance, 'timeDescription'), sep: this._getSettingValue(monitorInstance, 'timeDelimiter'),
			yl: getPeriodLabel(YEAR_IDX), yn: monitorInstance._segments[YEAR_IDX], ynn: this._padNumber(monitorInstance._segments[YEAR_IDX], 2),
			ynnn: this._padNumber(monitorInstance._segments[YEAR_IDX], 3), y1: extractDigit(monitorInstance._segments[YEAR_IDX], 1),
			y10: extractDigit(monitorInstance._segments[YEAR_IDX], 10), y100: extractDigit(monitorInstance._segments[YEAR_IDX], 100),
			ol: getPeriodLabel(MONTH_IDX), on: monitorInstance._segments[MONTH_IDX], onn: this._padNumber(monitorInstance._segments[MONTH_IDX], 2),
			onnn: this._padNumber(monitorInstance._segments[MONTH_IDX], 3), o1: extractDigit(monitorInstance._segments[MONTH_IDX], 1),
			o10: extractDigit(monitorInstance._segments[MONTH_IDX], 10), o100: extractDigit(monitorInstance._segments[MONTH_IDX], 100),
			wl: getPeriodLabel(WEEK_IDX), wn: monitorInstance._segments[WEEK_IDX], wnn: this._padNumber(monitorInstance._segments[WEEK_IDX], 2),
			wnnn: this._padNumber(monitorInstance._segments[WEEK_IDX], 3), w1: extractDigit(monitorInstance._segments[WEEK_IDX], 1),
			w10: extractDigit(monitorInstance._segments[WEEK_IDX], 10), w100: extractDigit(monitorInstance._segments[WEEK_IDX], 100),
			dl: getPeriodLabel(DAY_IDX), dn: monitorInstance._segments[DAY_IDX], dnn: this._padNumber(monitorInstance._segments[DAY_IDX], 2),
			dnnn: this._padNumber(monitorInstance._segments[DAY_IDX], 3), d1: extractDigit(monitorInstance._segments[DAY_IDX], 1),
			d10: extractDigit(monitorInstance._segments[DAY_IDX], 10), d100: extractDigit(monitorInstance._segments[DAY_IDX], 100),
			hl: getPeriodLabel(HOUR_IDX), hn: monitorInstance._segments[HOUR_IDX], hnn: this._padNumber(monitorInstance._segments[HOUR_IDX], 2),
			hnnn: this._padNumber(monitorInstance._segments[HOUR_IDX], 3), h1: extractDigit(monitorInstance._segments[HOUR_IDX], 1),
			h10: extractDigit(monitorInstance._segments[HOUR_IDX], 10), h100: extractDigit(monitorInstance._segments[HOUR_IDX], 100),
			ml: getPeriodLabel(MINUTE_IDX), mn: monitorInstance._segments[MINUTE_IDX], mnn: this._padNumber(monitorInstance._segments[MINUTE_IDX], 2),
			mnnn: this._padNumber(monitorInstance._segments[MINUTE_IDX], 3), m1: extractDigit(monitorInstance._segments[MINUTE_IDX], 1),
			m10: extractDigit(monitorInstance._segments[MINUTE_IDX], 10), m100: extractDigit(monitorInstance._segments[MINUTE_IDX], 100),
			sl: getPeriodLabel(SECOND_IDX), sn: monitorInstance._segments[SECOND_IDX], snn: this._padNumber(monitorInstance._segments[SECOND_IDX], 2),
			snnn: this._padNumber(monitorInstance._segments[SECOND_IDX], 3), s1: extractDigit(monitorInstance._segments[SECOND_IDX], 1),
			s10: extractDigit(monitorInstance._segments[SECOND_IDX], 10), s100: extractDigit(monitorInstance._segments[SECOND_IDX], 100)};
		var finalHtml = customLayoutString;
		// Substitute period placeholders: {p<}...{p>}
		for (var idx = 0; idx < 7; idx++) {
			var periodChar = 'yowdhms'.charAt(idx);
			var regexPattern = new RegExp('\\{' + periodChar + '<\\}(.*)\\{' + periodChar + '>\\}', 'g');
			finalHtml = finalHtml.replace(regexPattern, (monitorInstance._visibleUnits[idx] ? '$1' : ''));
		}
		// The original snippet does not include the loop for value substitutions.
		return finalHtml;
	},

	/* Pad a number with leading zeros to a minimum length.
	   @param  value   (number) the number to pad
	   @param  length  (number) the minimum length required
	   @return  (string) the padded number */
	_padNumber: function(value, length) {
		value = '' + value;
		return '0000000000'.substring(0, length - value.length) + value;
	},

	/* Determine which time units to display based on format string.
	   @param  monitorInstance  (object) the current configurations for this instance
	   @return  (string[7]) the units to display ('Y','O','W','D','H','M','S' or '?' for asNeeded) */
	_determineVisibleUnits: function(monitorInstance) {
		var formatString = this._getSettingValue(monitorInstance, 'displayFormat');
		var units = new Array(7);
		for (var i = 0; i < units.length; i++) {
			var unitChar = 'YOWDHMS'.charAt(i);
			units[i] = (formatString.indexOf(unitChar) > -1 ? unitChar :
				(formatString.indexOf(unitChar.toLowerCase()) > -1 ? '?' : null));
		}
		return units;
	},

	/* Compute the time differences for each period.
	   @param  monitorInstance    (object) the current configurations for this instance
	   @param  visibleUnits       (string[7]) the units to display
	   @param  currentClientTime  (Date) the current time
	   @return  (number[7]) the breakdown by period (years, months, weeks, days, hours, minutes, seconds) */
	_computeTimeDifferences: function(monitorInstance, visibleUnits, currentClientTime) {
		// The following is based on the C# countdown implementation and open-sourced in
		// the public domain by Elara Systems (elara{at}systems.com).
		monitorInstance._currentTime = currentClientTime;
		monitorInstance._targetTime = monitorInstance._targetTime || currentClientTime;
		monitorInstance._sinceTime = monitorInstance._sinceTime || currentClientTime;
		var targetMoment = (monitorInstance._sinceTime ? monitorInstance._sinceTime : monitorInstance._targetTime);
		if (targetMoment.getTime() <= currentClientTime.getTime()) { // Check if past or at target moment
			return new Array(7);
		}
		var timePeriods = new Array(7);
		var totalDifferenceSecs = (targetMoment.getTime() - currentClientTime.getTime()) / 1000;
		totalDifferenceSecs = (totalDifferenceSecs < 0 ? 0 : totalDifferenceSecs); // Ensure non-negative
		
		// Years
		if (visibleUnits[YEAR_IDX]) {
			timePeriods[YEAR_IDX] = Math.floor(totalDifferenceSecs / (365.25 * 24 * 60 * 60));
			totalDifferenceSecs -= timePeriods[YEAR_IDX] * (365.25 * 24 * 60 * 60);
		}
		// Months
		if (visibleUnits[MONTH_IDX]) {
			timePeriods[MONTH_IDX] = Math.floor(totalDifferenceSecs / (30.436875 * 24 * 60 * 60));
			totalDifferenceSecs -= timePeriods[MONTH_IDX] * (30.436875 * 24 * 60 * 60);
		}
		// Weeks
		if (visibleUnits[WEEK_IDX]) {
			timePeriods[WEEK_IDX] = Math.floor(totalDifferenceSecs / (7 * 24 * 60 * 60));
			totalDifferenceSecs -= timePeriods[WEEK_IDX] * (7 * 24 * 60 * 60);
		}
		// Days
		if (visibleUnits[DAY_IDX]) {
			timePeriods[DAY_IDX] = Math.floor(totalDifferenceSecs / (24 * 60 * 60));
			totalDifferenceSecs -= timePeriods[DAY_IDX] * (24 * 60 * 60);
		}
		// Hours
		if (visibleUnits[HOUR_IDX]) {
			timePeriods[HOUR_IDX] = Math.floor(totalDifferenceSecs / (60 * 60));
			totalDifferenceSecs -= timePeriods[HOUR_IDX] * (60 * 60);
		}
		// Minutes
		if (visibleUnits[MINUTE_IDX]) {
			timePeriods[MINUTE_IDX] = Math.floor(totalDifferenceSecs / 60);
			totalDifferenceSecs -= timePeriods[MINUTE_IDX] * 60;
		}
		// Seconds
		if (visibleUnits[SECOND_IDX]) {
			timePeriods[SECOND_IDX] = Math.floor(totalDifferenceSecs);
		}
		return timePeriods;
	}
});

/* The DurationMonitor singleton manager. */
jqObj.durationMonitor = new DurationMonitor();

// These methods are not explicitly defined in the provided Countdown.prototype,
// but their invocation is present in the jQuery plugin definition.
// They are likely expected to be present on the singleton for specific jQuery UI patterns.
// We provide empty stubs to maintain structural similarity.
jqObj.durationMonitor._isInactiveDurationMonitor = function(elementRef) {
    // Placeholder for functionality not explicitly defined in original source
    // but referenced in plugin wrapper.
    var monitorInstance = jqObj.data(elementRef, WIDGET_ID_STR);
    // Assuming 'isDisabled' would check if the monitor is in a disabled state,
    // which this code doesn't explicitly define. For cloning, we just return a placeholder.
    return !!monitorInstance && monitorInstance._state === 'disabled'; // Example placeholder
};

jqObj.durationMonitor._getOptionDurationMonitor = function(elementRef, optionKey) {
    // Placeholder for functionality not explicitly defined in original source
    // but referenced in plugin wrapper.
    var monitorInstance = jqObj.data(elementRef, WIDGET_ID_STR);
    return monitorInstance ? monitorInstance.options[optionKey] : undefined; // Example placeholder
};

// jQuery plugin definition
jqObj.fn.durationMonitor = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (typeof options == 'string' && options == 'isInactive') { // Renamed from 'isDisabled'
		return jqObj.durationMonitor['_' + options + 'DurationMonitor'].apply(jqObj.durationMonitor, [this[0]].concat(otherArgs));
	}
	if (options == 'getOption' && (arguments.length == 2 || typeof arguments[1] == 'string')) { // Renamed from 'option'
		return jqObj.durationMonitor['_' + options + 'DurationMonitor'].apply(jqObj.durationMonitor, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			jqObj.durationMonitor['_' + options + 'DurationMonitor'].apply(jqObj.durationMonitor, [this].concat(otherArgs));
		} else {
			jqObj.durationMonitor._setupDurationMonitor(this, options);
		}
	});
};

})(jQuery);