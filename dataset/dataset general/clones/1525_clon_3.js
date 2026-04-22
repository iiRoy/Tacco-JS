(function(jq) { // Enclose within a private scope, avoiding global '$' clashes

/*
 * Dynamic Time Display Module (DTD)
 * Version 1.0.0
 * Authored by Dr. Chronos (chronos.dev@example.com) in 2023.
 * Licensed under a dual license: MIT (https://opensource.org/licenses/MIT) and GPLv3 (https://www.gnu.org/licenses/gpl-3.0).
 * Please acknowledge the creator if this code is utilized.
 */

/*
 * Provides a flexible countdown/countup timer.
 * Integrate into a DOM element like so:
 * jq('div.my-timer').timeDisplay({
 *   targetMoment: new Date(2025, 11, 25, 10, 30, 0),
 *   onCompletion: onHolidayArrived
 * });
 */

/* Manages multiple time display instances. */
function TimeKeeper() {
	this.localeSettings = []; // Collection of available localization configurations, keyed by language code
	this.localeSettings[''] = { // Default localization configuration
		// Text labels for various time units
		unitNames: ['Years', 'Months', 'Weeks', 'Days', 'Hours', 'Minutes', 'Seconds'],
		// Singular text labels for time units
		unitNamesSingular: ['Year', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'],
		briefUnitLabels: ['Y', 'M', 'W', 'D'], // Abbreviated labels for compact display
		timeDivider: ':', // Delimiter used between time components (e.g., HH:MM:SS)
		isRightToLeft: false // Layout direction: true for RTL, false for LTR
	};
	this.defaultOptions = {
		targetMoment: null, // Date/time to count towards (new Date(yr, mnth - 1, dy, hr, min, sec))
			// Can also be a numeric offset in seconds, or a string for unit-based offsets:
			// 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds
		startMoment: null, // Date/time to count from (new Date(yr, mnth - 1, dy, hr, min, sec))
			// Similar numeric or string offset options as targetMoment
		timeZoneOffset: null, // Timezone (hours or minutes from GMT) for the reference times,
			// or null to use the client's local timezone
		serverTimeSync: null, // Function to fetch current server time for synchronization
		displayFormat: 'dHMS', // Output format: uppercase for always show, lowercase for show only if non-zero
			// 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds
		customLayout: '', // Custom HTML template for the display
		compactView: false, // If true, use compact labels; otherwise, use expanded ones
		displayDescription: '', // A short description text shown with the timer
		completionRedirectURL: '', // URL to navigate to once the timer finishes
		completionMessage: '', // Text to show when the timer completes, replacing the countdown display
		alwaysTriggerCompletion: false, // True to always fire onCompletion, even if not counting down
		onCompletion: null, // Callback fired when the timer reaches its target/start time
			// Receives no arguments; 'this' refers to the containing DOM element
		onTimeUpdate: null // Callback fired on each timer tick
			// Receives an array of 7 integers representing time periods (years, months, etc.)
			// 'this' refers to the containing DOM element
	};
	jq.extend(this.defaultOptions, this.localeSettings['']);
}

const INSTANCE_KEY = 'timeDisplayInstance'; // Key for storing instance data on a DOM element

const UNIT_YEARS = 0;
const UNIT_MONTHS = 1;
const UNIT_WEEKS = 2;
const UNIT_DAYS = 3;
const UNIT_HOURS = 4;
const UNIT_MINUTES = 5;
const UNIT_SECONDS = 6;

jq.extend(TimeKeeper.prototype, {
	/* CSS class applied to elements already configured with the timer. */
	initializedClass: 'hasTimeDisplay',
	
	/* Global timer that updates all active instances. */
	_globalTicker: setInterval(() => { TimeDisplay._refreshAllInstances(); }, 990),
	/* Collection of DOM elements currently running a timer. */
	_activeElements: [],
	
	/* Modifies the global default settings for all future timer instances.
	   @param  newDefaults  (object) Object containing new default settings */
	configureDefaults: function(newDefaults) {
		this._adjustUnitLabels(this.defaultOptions, newDefaults);
		deepMergeAndRemove(this.defaultOptions, newDefaults || {});
	},

	/* Converts a given date/time to Universal Coordinated Time (UTC).
	   @param  offsetVal  (number) Timezone offset in hours or minutes (e.g., +9, -360)
	   @param  inputDate  (Date) The date/time object in the specified timezone OR
	                      (number) The year component
	   @param  mth        (number, optional) Month (0-11) (omit if inputDate is a Date object)
	   @param  dy         (number, optional) Day (omit if inputDate is a Date object)
	   @param  hr         (number, optional) Hour (omit if inputDate is a Date object)
	   @param  min        (number, optional) Minute (omit if inputDate is a Date object)
	   @param  sec        (number, optional) Second (omit if inputDate is a Date object)
	   @param  ms         (number, optional) Millisecond (omit if inputDate is a Date object)
	   @returns (Date) The equivalent UTC date/time object */
	convertToUTC: function(offsetVal, inputDate, mth, dy, hr, min, sec, ms) {
		if (inputDate instanceof Date) {
			[ms, sec, min, hr, dy, mth, inputDate] = [
				inputDate.getMilliseconds(), inputDate.getSeconds(), inputDate.getMinutes(),
				inputDate.getHours(), inputDate.getDate(), inputDate.getMonth(), inputDate.getFullYear()
			];
		}
		const utcDate = new Date();
		utcDate.setUTCFullYear(inputDate);
		utcDate.setUTCDate(1); // Reset day to prevent month overflow issues
		utcDate.setUTCMonth(mth || 0);
		utcDate.setUTCDate(dy || 1);
		utcDate.setUTCHours(hr || 0);
		// Apply timezone offset: if abs offset < 30, assume hours; otherwise, minutes.
		utcDate.setUTCMinutes((min || 0) - (Math.abs(offsetVal) < 30 ? offsetVal * 60 : offsetVal));
		utcDate.setUTCSeconds(sec || 0);
		utcDate.setUTCMilliseconds(ms || 0);
		return utcDate;
	},

	/* Attaches the time display widget to a specific DOM element.
	   @param  targetElement  (element) The container DOM element
	   @param  configOptions  (object) Initial settings for this timer instance */
	_initDisplay: function(targetElement, configOptions) {
		const $element = jq(targetElement);
		if ($element.hasClass(this.initializedClass)) {
			return; // Already initialized, exit early
		}
		$element.addClass(this.initializedClass);

		const instanceData = {
			config: jq.extend({}, configOptions),
			_currentPeriods: [0, 0, 0, 0, 0, 0, 0] // Stores calculated time periods
		};
		jq.data(targetElement, INSTANCE_KEY, instanceData);
		this._reconfigureDisplay(targetElement);
	},

	/* Adds a DOM element to the list of elements requiring timer updates.
	   @param  elementToAdd  (element) The DOM element to track */
	_trackElement: function(elementToAdd) {
		if (!this._isElementTracked(elementToAdd)) {
			this._activeElements.push(elementToAdd);
		}
	},

	/* Checks if a DOM element is currently being tracked for timer updates.
	   @param  elementToCheck  (element) The DOM element to verify
	   @returns (boolean) True if tracked, false otherwise */
	_isElementTracked: function(elementToCheck) {
		return this._activeElements.includes(elementToCheck);
	},

	/* Removes a DOM element from the list of tracked timer elements.
	   @param  elementToRemove  (element) The DOM element to stop tracking */
	_untrackElement: function(elementToRemove) {
		this._activeElements = this._activeElements.filter(el => el !== elementToRemove);
	},

	/* Iterates through and refreshes all active timer instances. */
	_refreshAllInstances: function() {
		this._activeElements.forEach(element => this._updateSingleDisplay(element));
	},

	/* Updates and redraws a single time display instance.
	   @param  targetElement  (jQuery) The container DOM element
	   @param  instanceData   (object, optional) The instance's current settings (if available) */
	_updateSingleDisplay: function(targetElement, instanceData) {
		const $element = jq(targetElement);
		const currentInstance = instanceData || jq.data(targetElement, INSTANCE_KEY);

		if (!currentInstance) {
			return; // No instance data found
		}

		$element.html(this._generateVisualOutput(currentInstance));
		const isRTL = this._retrieveSetting(currentInstance, 'isRightToLeft');
		$element[isRTL ? 'addClass' : 'removeClass']('timedisplay_rtl');

		const onTickCallback = this._retrieveSetting(currentInstance, 'onTimeUpdate');
		if (onTickCallback) {
			const periodsToPass = currentInstance._isHeld !== 'lap' ? currentInstance._currentPeriods :
				this._calculateTimePeriods(currentInstance, currentInstance._displayUnits, new Date());
			onTickCallback.apply(targetElement, [periodsToPass]);
		}

		const isTimerComplete = currentInstance._isHeld !== 'pause' &&
			(currentInstance._startRef ? currentInstance._currentMoment.getTime() <= currentInstance._startRef.getTime() :
			currentInstance._currentMoment.getTime() >= currentInstance._targetRef.getTime());

		if (isTimerComplete && !currentInstance._isCompleting) {
			currentInstance._isCompleting = true;
			if (this._isElementTracked(targetElement) || this._retrieveSetting(currentInstance, 'alwaysTriggerCompletion')) {
				this._untrackElement(targetElement);
				const completionCallback = this._retrieveSetting(currentInstance, 'onCompletion');
				if (completionCallback) {
					completionCallback.apply(targetElement, []);
				}

				const completionText = this._retrieveSetting(currentInstance, 'completionMessage');
				if (completionText) {
					const originalLayout = this._retrieveSetting(currentInstance, 'customLayout');
					currentInstance.config.customLayout = completionText;
					this._updateSingleDisplay(targetElement, currentInstance); // Re-render with completion message
					currentInstance.config.customLayout = originalLayout; // Restore original layout for future updates if any
				}

				const redirectUrl = this._retrieveSetting(currentInstance, 'completionRedirectURL');
				if (redirectUrl) {
					window.location.href = redirectUrl;
				}
			}
			currentInstance._isCompleting = false;
		} else if (currentInstance._isHeld === 'pause') {
			this._untrackElement(targetElement); // Stop tracking if paused
		}
		jq.data(targetElement, INSTANCE_KEY, currentInstance); // Ensure data is saved
	},

	/* Reconfigures an existing timer instance with new settings.
	   @param  targetElement  (element) The container DOM element
	   @param  newOptions     (object) New settings or
	                          (string) Name of a single property to change
	   @param  newValue       (any) Value for the single property (omit if newOptions is an object) */
	_reconfigureDisplay: function(targetElement, newOptions, newValue) {
		const optionsToApply = newOptions || {};
		if (typeof newOptions === 'string') {
			const propName = newOptions;
			optionsToApply[propName] = newValue;
		}

		const currentInstance = jq.data(targetElement, INSTANCE_KEY);
		if (!currentInstance) {
			console.warn('TimeDisplay: Attempted to reconfigure uninitialized element.', targetElement);
			return; // Instance not found, cannot reconfigure
		}

		this._adjustUnitLabels(currentInstance.config, optionsToApply);
		deepMergeAndRemove(currentInstance.config, optionsToApply); // Apply new options
		this._recalculateInternalState(targetElement, currentInstance);
		jq.data(targetElement, INSTANCE_KEY, currentInstance);

		const currentTime = new Date();
		// Start tracking if target/start date is in the future/past respectively
		if ((currentInstance._startRef && currentInstance._startRef < currentTime) ||
				(currentInstance._targetRef && currentInstance._targetRef > currentTime)) {
			this._trackElement(targetElement);
		}
		this._updateSingleDisplay(targetElement, currentInstance);
	},

	/* Resets any custom numbered labels if the main labels are being changed.
	   @param  baseConfig    (object) The configuration object to update
	   @param  incomingOpts  (object) The new option values */
	_adjustUnitLabels: function(baseConfig, incomingOpts) {
		const labelChanged = Object.keys(incomingOpts).some(key => key.match(/[Ll]abels/));
		if (labelChanged) {
			Object.keys(baseConfig).forEach(key => {
				if (key.match(/[Ll]abels[0-9]/)) {
					delete baseConfig[key]; // Remove custom numbered labels
				}
			});
		}
	},
	
	/* Calculates and updates internal date/time references for an instance.
	   @param  elementRef  (element) The container DOM element
	   @param  instData    (object) The current settings for this instance */
	_recalculateInternalState: function(elementRef, instData) {
		const serverTimeFn = this._retrieveSetting(instData, 'serverTimeSync');
		const syncTime = serverTimeFn ? serverTimeFn.apply(elementRef, []) : null;
		const now = new Date();
		const tz = this._retrieveSetting(instData, 'timeZoneOffset');
		const effectiveTz = tz === null ? -now.getTimezoneOffset() : tz;

		instData._startRef = this._resolveTimeInput(this._retrieveSetting(instData, 'startMoment'), null);
		if (instData._startRef) {
			instData._startRef = this.convertToUTC(effectiveTz, instData._startRef);
			if (syncTime) {
				instData._startRef.setMilliseconds(instData._startRef.getMilliseconds() + now.getTime() - syncTime.getTime());
			}
		}

		instData._targetRef = this.convertToUTC(effectiveTz, this._resolveTimeInput(this._retrieveSetting(instData, 'targetMoment'), now));
		if (syncTime) {
			instData._targetRef.setMilliseconds(instData._targetRef.getMilliseconds() + now.getTime() - syncTime.getTime());
		}
		instData._displayUnits = this._determineDisplayUnits(instData);
	},

	/* Removes the time display widget from a DOM element.
	   @param  targetElement  (element) The container DOM element */
	_destroyDisplay: function(targetElement) {
		const $element = jq(targetElement);
		if (!$element.hasClass(this.initializedClass)) {
			return; // Not initialized, nothing to destroy
		}
		this._untrackElement(targetElement);
		$element.removeClass(this.initializedClass).empty();
		jq.removeData(targetElement, INSTANCE_KEY);
	},

	/* Pauses a timer instance, freezing its display at the current time.
	   @param  targetElement  (element) The container DOM element */
	_pauseDisplay: function(targetElement) {
		this._changeHoldState(targetElement, 'pause');
	},

	/* Temporarily holds the display of a timer instance, but allows the timer to continue running internally.
	   @param  targetElement  (element) The container DOM element */
	_holdDisplay: function(targetElement) {
		this._changeHoldState(targetElement, 'lap');
	},

	/* Resumes a previously paused timer instance.
	   @param  targetElement  (element) The container DOM element */
	_resumeDisplay: function(targetElement) {
		this._changeHoldState(targetElement, null);
	},

	/* Manages the hold state (pause/lap/none) of a timer instance.
	   @param  elementRef  (element) The container DOM element
	   @param  newState    (string) The new hold state ('pause', 'lap', or null) */
	_changeHoldState: function(elementRef, newState) {
		const inst = jq.data(elementRef, INSTANCE_KEY);
		if (!inst) {
			console.warn('TimeDisplay: Attempted to change hold state on uninitialized element.', elementRef);
			return;
		}

		if (inst._isHeld === 'pause' && !newState) {
			// Resuming from a full pause
			inst._currentPeriods = inst._savedPeriods;
			const signPrefix = inst._startRef ? '-' : '+';
			const dateString = `${signPrefix}${inst._currentPeriods[0]}Y` +
				`${signPrefix}${inst._currentPeriods[1]}O` + `${signPrefix}${inst._currentPeriods[2]}W` +
				`${signPrefix}${inst._currentPeriods[3]}D` + `${signPrefix}${inst._currentPeriods[4]}H` +
				`${signPrefix}${inst._currentPeriods[5]}M` + `${signPrefix}${inst._currentPeriods[6]}S`;
			
			const newRefTime = this._resolveTimeInput(dateString);
			if (inst._startRef) {
				inst._startRef = newRefTime;
			} else {
				inst._targetRef = newRefTime;
			}
			this._trackElement(elementRef); // Restart tracking
		}
		inst._isHeld = newState;
		inst._savedPeriods = (newState === 'pause' ? inst._currentPeriods : null);
		jq.data(elementRef, INSTANCE_KEY, inst);
		this._updateSingleDisplay(elementRef, inst);
	},

	/* Retrieves the current time periods for a given timer instance.
	   @param  elementRef  (element) The container DOM element
	   @returns (number[7]) An array of current periods (Y, M, W, D, H, M, S) or null */
	_getPeriods: function(elementRef) {
		const inst = jq.data(elementRef, INSTANCE_KEY);
		if (!inst) {
			return null;
		}
		return inst._isHeld ? inst._currentPeriods :
			this._calculateTimePeriods(inst, inst._displayUnits, new Date());
	},

	/* Fetches a specific setting value for an instance, falling back to defaults if not found.
	   @param  instanceObj  (object) The current instance's configuration
	   @param  settingName  (string) The name of the desired setting
	   @returns (any) The setting's value or its default */
	_retrieveSetting: function(instanceObj, settingName) {
		return instanceObj.config[settingName] !== undefined ?
			instanceObj.config[settingName] : TimeDisplay.defaultOptions[settingName];
	},

	/* Parses a time input (string, number, or Date object) into a Date object.
	   @param  inputVal     (string|number|Date) The time value
	   @param  fallbackTime (Date, optional) Default Date if inputVal is null
	   @returns (Date) The resolved Date object */
	_resolveTimeInput: function(inputVal, fallbackTime) {
		const parseNumericOffset = (offsetSec) => { // e.g., +300, -2
			const calcTime = new Date();
			calcTime.setTime(calcTime.getTime() + offsetSec * 1000);
			return calcTime;
		};

		const parseStringOffset = (offsetStr) => { // e.g., '+2d', '-4w', '+3h +30m'
			const normalizedOffset = offsetStr.toLowerCase();
			const now = new Date();
			let [yr, mth, dy, hr, min, sec] = [
				now.getFullYear(), now.getMonth(), now.getDate(),
				now.getHours(), now.getMinutes(), now.getSeconds()
			];

			const offsetPattern = /([+-]?\d+)\s*(s|m|h|d|w|o|y)?/g;
			let match;
			while ((match = offsetPattern.exec(normalizedOffset)) !== null) {
				const value = parseInt(match[1], 10);
				switch (match[2] || 's') { // Default to seconds if unit is missing
					case 's': sec += value; break;
					case 'm': min += value; break;
					case 'h': hr += value; break;
					case 'd': dy += value; break;
					case 'w': dy += value * 7; break;
					case 'o':
						mth += value;
						dy = Math.min(dy, TimeDisplay._getDaysInMonth(yr, mth));
						break;
					case 'y':
						yr += value;
						dy = Math.min(dy, TimeDisplay._getDaysInMonth(yr, mth));
						break;
				}
			}
			return new Date(yr, mth, dy, hr, min, sec, 0);
		};

		let resolvedTime;
		if (inputVal === null) {
			resolvedTime = fallbackTime;
		} else if (typeof inputVal === 'string') {
			resolvedTime = parseStringOffset(inputVal);
		} else if (typeof inputVal === 'number') {
			resolvedTime = parseNumericOffset(inputVal);
		} else if (inputVal instanceof Date) {
			resolvedTime = inputVal;
		} else {
			resolvedTime = null; // Unrecognized type
		}

		if (resolvedTime) {
			resolvedTime.setMilliseconds(0); // Ensure consistent precision
		}
		return resolvedTime;
	},

	/* Determines the number of days within a given month and year.
	   @param  targetYear   (number) The year
	   @param  targetMonth  (number) The month (0-11)
	   @returns (number) The count of days in that month */
	_getDaysInMonth: function(targetYear, targetMonth) {
		// Setting day to 32 and getting the date effectively rolls over to the next month's 1st or 2nd,
		// then subtracting 1 gives the last day of the target month.
		return new Date(targetYear, targetMonth + 1, 0).getDate();
	},

	/* Generates the HTML string for displaying the timer widget.
	   @param  inst  (object) The current instance's configuration and state
	   @returns (string) The HTML output for the display */
	_generateVisualOutput: function(inst) {
		// Calculate time periods based on current state (held or active)
		const currentPeriods = inst._isHeld ? inst._currentPeriods :
			this._calculateTimePeriods(inst, inst._displayUnits, new Date());
		inst._currentPeriods = currentPeriods; // Store for potential hold state

		// Determine which units to show based on '?' (show if non-zero) logic
		let nonZeroEncountered = false;
		let visibleUnitCount = 0;
		for (let i = 0; i < inst._displayUnits.length; i++) {
			nonZeroEncountered = nonZeroEncountered || (inst._displayUnits[i] === '?' && currentPeriods[i] > 0);
			if (inst._displayUnits[i] === '?' && !nonZeroEncountered) {
				inst._displayUnits[i] = null; // Hide if '?' and no preceding non-zero unit
			}
			if (inst._displayUnits[i]) {
				visibleUnitCount++;
			}
		}

		const isCompact = this._retrieveSetting(inst, 'compactView');
		const customLayout = this._retrieveSetting(inst, 'customLayout');
		const unitLabels = isCompact ? this._retrieveSetting(inst, 'briefUnitLabels') : this._retrieveSetting(inst, 'unitNames');
		const separator = this._retrieveSetting(inst, 'timeDivider');
		const descriptionText = this._retrieveSetting(inst, 'displayDescription') || '';

		const getCompactUnit = (unitIndex) => {
			if (!inst._displayUnits[unitIndex]) return '';
			const specificLabel = TimeDisplay._retrieveSetting(inst, `briefUnitLabels${currentPeriods[unitIndex]}`);
			return `${currentPeriods[unitIndex]}${(specificLabel && specificLabel[unitIndex]) || unitLabels[unitIndex]} `;
		};

		const getFullUnit = (unitIndex) => {
			if (!inst._displayUnits[unitIndex]) return '';
			const specificLabel = TimeDisplay._retrieveSetting(inst, `unitNames${currentPeriods[unitIndex]}`);
			const label = (specificLabel && specificLabel[unitIndex]) || unitLabels[unitIndex];
			return `<span class="display-segment"><span class="display-value">${currentPeriods[unitIndex]}</span><br/>${label}</span>`;
		};

		if (customLayout) {
			return this._buildCustomOutput(inst, customLayout, isCompact);
		} else {
			// Default layout generation
			const baseClass = `display-row ${isCompact ? 'display-compact' : `display-expanded units-${visibleUnitCount}`}`;
			const holdClass = inst._isHeld ? ' display-paused' : '';

			let mainContent = '';
			if (isCompact) {
				mainContent = `${getCompactUnit(UNIT_YEARS)}${getCompactUnit(UNIT_MONTHS)}${getCompactUnit(UNIT_WEEKS)}${getCompactUnit(UNIT_DAYS)}`;
				const showHours = inst._displayUnits[UNIT_HOURS];
				const showMinutes = inst._displayUnits[UNIT_MINUTES];
				const showSeconds = inst._displayUnits[UNIT_SECONDS];

				if (showHours) { mainContent += this._padNumber(currentPeriods[UNIT_HOURS], 2); }
				if (showMinutes) { mainContent += (showHours ? separator : '') + this._padNumber(currentPeriods[UNIT_MINUTES], 2); }
				if (showSeconds) { mainContent += (showHours || showMinutes ? separator : '') + this._padNumber(currentPeriods[UNIT_SECONDS], 2); }
			} else {
				mainContent = `${getFullUnit(UNIT_YEARS)}${getFullUnit(UNIT_MONTHS)}${getFullUnit(UNIT_WEEKS)}${getFullUnit(UNIT_DAYS)}` +
							  `${getFullUnit(UNIT_HOURS)}${getFullUnit(UNIT_MINUTES)}${getFullUnit(UNIT_SECONDS)}`;
			}

			const descriptionHtml = descriptionText ? `<span class="display-row display-description">${descriptionText}</span>` : '';
			return `<span class="${baseClass}${holdClass}">${mainContent}</span>${descriptionHtml}`;
		}
	},

	/* Constructs the HTML based on a custom layout string.
	   @param  inst       (object) The current instance's configuration
	   @param  layoutStr  (string) The custom layout template
	   @param  isCompact  (boolean) True if using compact labels
	   @returns (string) The rendered custom HTML */
	_buildCustomOutput: function(inst, layoutStr, isCompact) {
		const unitLabels = this._retrieveSetting(inst, isCompact ? 'briefUnitLabels' : 'unitNames');
		const getLabelForUnit = (unitIndex) => {
			const specificLabels = TimeDisplay._retrieveSetting(inst,
				(isCompact ? 'briefUnitLabels' : 'unitNames') + inst._currentPeriods[unitIndex]);
			return (specificLabels && specificLabels[unitIndex]) || unitLabels[unitIndex];
		};
		
		// Helper to extract a specific digit from a number (e.g., tens digit)
		const getDigit = (number, position) => Math.floor(number / position) % 10;

		const replacements = {
			desc: this._retrieveSetting(inst, 'displayDescription'),
			sep: this._retrieveSetting(inst, 'timeDivider'),
			// Years
			yl: getLabelForUnit(UNIT_YEARS), yn: inst._currentPeriods[UNIT_YEARS], ynn: this._padNumber(inst._currentPeriods[UNIT_YEARS], 2),
			ynnn: this._padNumber(inst._currentPeriods[UNIT_YEARS], 3), y1: getDigit(inst._currentPeriods[UNIT_YEARS], 1),
			y10: getDigit(inst._currentPeriods[UNIT_YEARS], 10), y100: getDigit(inst._currentPeriods[UNIT_YEARS], 100),
			// Months
			ol: getLabelForUnit(UNIT_MONTHS), on: inst._currentPeriods[UNIT_MONTHS], onn: this._padNumber(inst._currentPeriods[UNIT_MONTHS], 2),
			onnn: this._padNumber(inst._currentPeriods[UNIT_MONTHS], 3), o1: getDigit(inst._currentPeriods[UNIT_MONTHS], 1),
			o10: getDigit(inst._currentPeriods[UNIT_MONTHS], 10), o100: getDigit(inst._currentPeriods[UNIT_MONTHS], 100),
			// Weeks
			wl: getLabelForUnit(UNIT_WEEKS), wn: inst._currentPeriods[UNIT_WEEKS], wnn: this._padNumber(inst._currentPeriods[UNIT_WEEKS], 2),
			wnnn: this._padNumber(inst._currentPeriods[UNIT_WEEKS], 3), w1: getDigit(inst._currentPeriods[UNIT_WEEKS], 1),
			w10: getDigit(inst._currentPeriods[UNIT_WEEKS], 10), w100: getDigit(inst._currentPeriods[UNIT_WEEKS], 100),
			// Days
			dl: getLabelForUnit(UNIT_DAYS), dn: inst._currentPeriods[UNIT_DAYS], dnn: this._padNumber(inst._currentPeriods[UNIT_DAYS], 2),
			dnnn: this._padNumber(inst._currentPeriods[UNIT_DAYS], 3), d1: getDigit(inst._currentPeriods[UNIT_DAYS], 1),
			d10: getDigit(inst._currentPeriods[UNIT_DAYS], 10), d100: getDigit(inst._currentPeriods[UNIT_DAYS], 100),
			// Hours
			hl: getLabelForUnit(UNIT_HOURS), hn: inst._currentPeriods[UNIT_HOURS], hnn: this._padNumber(inst._currentPeriods[UNIT_HOURS], 2),
			hnnn: this._padNumber(inst._currentPeriods[UNIT_HOURS], 3), h1: getDigit(inst._currentPeriods[UNIT_HOURS], 1),
			h10: getDigit(inst._currentPeriods[UNIT_HOURS], 10), h100: getDigit(inst._currentPeriods[UNIT_HOURS], 100),
			// Minutes
			ml: getLabelForUnit(UNIT_MINUTES), mn: inst._currentPeriods[UNIT_MINUTES], mnn: this._padNumber(inst._currentPeriods[UNIT_MINUTES], 2),
			mnnn: this._padNumber(inst._currentPeriods[UNIT_MINUTES], 3), m1: getDigit(inst._currentPeriods[UNIT_MINUTES], 1),
			m10: getDigit(inst._currentPeriods[UNIT_MINUTES], 10), m100: getDigit(inst._currentPeriods[UNIT_MINUTES], 100),
			// Seconds
			sl: getLabelForUnit(UNIT_SECONDS), sn: inst._currentPeriods[UNIT_SECONDS], snn: this._padNumber(inst._currentPeriods[UNIT_SECONDS], 2),
			snnn: this._padNumber(inst._currentPeriods[UNIT_SECONDS], 3), s1: getDigit(inst._currentPeriods[UNIT_SECONDS], 1),
			s10: getDigit(inst._currentPeriods[UNIT_SECONDS], 10), s100: getDigit(inst._currentPeriods[UNIT_SECONDS], 100)
		};

		let finalHtml = layoutStr;
		// Replace individual placeholders like {yn}, {snn}
		for (const key in replacements) {
			if (Object.prototype.hasOwnProperty.call(replacements, key)) {
				finalHtml = finalHtml.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
			}
		}

		// Replace conditional period containers: {p<}...{p>}
		const unitCodes = ['y', 'o', 'w', 'd', 'h', 'm', 's'];
		for (let i = 0; i < unitCodes.length; i++) {
			const unitCode = unitCodes[i];
			const regex = new RegExp(`\\{${unitCode}<\\}(.*?)\\{${unitCode}>\\}`, 'g');
			finalHtml = finalHtml.replace(regex, inst._displayUnits[i] ? '$1' : '');
		}
		return finalHtml;
	},

	/* Pads a number with leading zeros to reach a specified minimum length.
	   @param  num     (number) The number to pad
	   @param  length  (number) The desired minimum length
	   @returns (string) The padded number */
	_padNumber: function(num, length) {
		return String(num).padStart(length, '0');
	},

	/* Determines which time units should be displayed based on the format string.
	   @param  instData  (object) The current instance's configuration
	   @returns (boolean[7]) An array indicating which units to show */
	_determineDisplayUnits: function(instData) {
		const formatString = this._retrieveSetting(instData, 'displayFormat');
		const showUnits = [null, null, null, null, null, null, null]; // Y, O, W, D, H, M, S

		// Iterate through the format string to set display flags
		'YOWDHMS'.split('').forEach((char, index) => {
			const lowerChar = char.toLowerCase();
			if (formatString.includes(char)) {
				showUnits[index] = true; // Always show if uppercase
			} else if (formatString.includes(lowerChar)) {
				showUnits[index] = '?'; // Show if non-zero if lowercase
			}
		});
		return showUnits;
	},

	/* Calculates the breakdown of time into periods (years, months, etc.).
	   @param  instData  (object) The current instance's configuration
	   @param  showFlags (boolean[7]) Flags indicating which units to consider
	   @param  now       (Date) The current moment
	   @returns (number[7]) An array of time periods */
	_calculateTimePeriods: function(instData, showFlags, now) {
		const targetTime = instData._targetRef;
		const startTime = inst._startRef;
		const isCountUp = !!startTime;
		let diff = isCountUp ? now.getTime() - startTime.getTime() : targetTime.getTime() - now.getTime();

		// If difference is negative, timer has passed/expired
		if (diff < 0) {
			diff = 0;
		}

		let current = new Date(now.getTime() + diff); // Intermediate date for calculations
		let prev = now;

		// Calculate periods from largest to smallest, based on Gregorian calendar rules
		const periods = [0, 0, 0, 0, 0, 0, 0]; // Y, O, W, D, H, M, S

		// Years, Months, Days are tricky due to variable lengths.
		// We calculate these by stepping through dates.
		const calcDateDiff = (start, end, unitIndex) => {
			let count = 0;
			const tempDate = new Date(start.getTime());
			while (true) {
				const next = new Date(tempDate.getTime());
				if (unitIndex === UNIT_YEARS) {
					next.setFullYear(tempDate.getFullYear() + 1);
				} else if (unitIndex === UNIT_MONTHS) {
					next.setMonth(tempDate.getMonth() + 1);
				} else if (unitIndex === UNIT_WEEKS) {
					next.setDate(tempDate.getDate() + 7);
				} else if (unitIndex === UNIT_DAYS) {
					next.setDate(tempDate.getDate() + 1);
				}

				if (next > end) {
					break;
				}
				tempDate.setTime(next.getTime());
				count++;
			}
			return count;
		};

		if (showFlags[UNIT_YEARS]) {
			periods[UNIT_YEARS] = calcDateDiff(prev, current, UNIT_YEARS);
			prev.setFullYear(prev.getFullYear() + periods[UNIT_YEARS]);
		}
		if (showFlags[UNIT_MONTHS]) {
			periods[UNIT_MONTHS] = calcDateDiff(prev, current, UNIT_MONTHS);
			prev.setMonth(prev.getMonth() + periods[UNIT_MONTHS]);
		}
		if (showFlags[UNIT_WEEKS]) {
			periods[UNIT_WEEKS] = calcDateDiff(prev, current, UNIT_WEEKS);
			prev.setDate(prev.getDate() + periods[UNIT_WEEKS] * 7);
		}
		if (showFlags[UNIT_DAYS]) {
			periods[UNIT_DAYS] = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
			prev.setDate(prev.getDate() + periods[UNIT_DAYS]);
		}

		// Remaining time in milliseconds after date calculations
		let remainingMs = current.getTime() - prev.getTime();

		if (showFlags[UNIT_HOURS]) {
			periods[UNIT_HOURS] = Math.floor(remainingMs / (1000 * 60 * 60));
			remainingMs %= (1000 * 60 * 60);
		}
		if (showFlags[UNIT_MINUTES]) {
			periods[UNIT_MINUTES] = Math.floor(remainingMs / (1000 * 60));
			remainingMs %= (1000 * 60);
		}
		if (showFlags[UNIT_SECONDS]) {
			periods[UNIT_SECONDS] = Math.floor(remainingMs / 1000);
		}
		
		return periods;
	}
});

// Utility function to deeply merge objects, removing properties set to null/undefined in `options`
const deepMergeAndRemove = (baseObj, options) => {
	for (const key in options) {
		if (Object.prototype.hasOwnProperty.call(options, key)) {
			if (options[key] === null || options[key] === undefined) {
				delete baseObj[key]; // Remove property if null/undefined in options
			} else if (typeof baseObj[key] === 'object' && baseObj[key] !== null &&
					   typeof options[key] === 'object' && options[key] !== null &&
					   !Array.isArray(baseObj[key]) && !Array.isArray(options[key])) {
				// Recursively merge if both are non-null, non-array objects
				deepMergeAndRemove(baseObj[key], options[key]);
			} else {
				baseObj[key] = options[key]; // Otherwise, directly assign
			}
		}
	}
	return baseObj;
};

// Create the singleton instance of the TimeKeeper manager
const TimeDisplay = new TimeKeeper();

// Expose the TimeKeeper methods as a jQuery plugin
jq.fn.timeDisplay = function(methodOrOptions) {
	const args = Array.prototype.slice.call(arguments, 1);
	if (typeof methodOrOptions === 'string') {
		// Call a specific method
		switch (methodOrOptions) {
			case 'destroy':
				return this.each(function() { TimeDisplay._destroyDisplay(this); });
			case 'pause':
				return this.each(function() { TimeDisplay._pauseDisplay(this); });
			case 'lap':
				return this.each(function() { TimeDisplay._holdDisplay(this); });
			case 'resume':
				return this.each(function() { TimeDisplay._resumeDisplay(this); });
			case 'getPeriods':
				return TimeDisplay._getPeriods(this[0]); // Only for the first element
			case 'option':
				if (args.length === 0) { // Get all options if no args
					return TimeDisplay._retrieveSetting(jq.data(this[0], INSTANCE_KEY), null); // Placeholder for all options
				}
				if (args.length === 1) { // Get single option
					return TimeDisplay._retrieveSetting(jq.data(this[0], INSTANCE_KEY), args[0]);
				}
				// Set multiple options or single option
				return this.each(function() { TimeDisplay._reconfigureDisplay(this, args[0], args[1]); });
			default:
				jq.error(`Method ${methodOrOptions} does not exist on jQuery.timeDisplay`);
		}
	} else {
		// Initialize the plugin
		return this.each(function() { TimeDisplay._initDisplay(this, methodOrOptions); });
	}
};

// Make the manager accessible for global configuration
jq.timeDisplay = TimeDisplay;

})(jQuery); // Pass jQuery to the IIFE