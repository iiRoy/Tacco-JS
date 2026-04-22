(function(scope) {
    const INSTANCE_PROPERTY = '__temporalGaugeData__';

    const defaultRegionalSettings = {
        unitLabels: ['Years', 'Months', 'Weeks', 'Days', 'Hours', 'Minutes', 'Seconds'],
        unitLabelsSingular: ['Year', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'],
        compactUnitLabels: ['y', 'm', 'w', 'd'],
        timeDelimiter: ':',
        displayRightToLeft: false
    };

    const baseConfiguration = {
        targetMoment: null,
        startMoment: null,
        timeZoneOffset: null,
        serverTimeSynchronizer: null,
        outputFormat: 'dHMS',
        customMarkup: '',
        condensedDisplay: false,
        elementDescription: '',
        expirationRedirectUrl: '',
        expirationDisplayMessage: '',
        alwaysFireExpiration: false,
        onExpirationCallback: null,
        onTickCallback: null
    };

    // Merge default regional settings into base configuration
    Object.assign(baseConfiguration, defaultRegionalSettings);

    const periodIndices = {
        YEAR: 0, MONTH: 1, WEEK: 2, DAY: 3, HOUR: 4, MINUTE: 5, SECOND: 6
    };

    // Manages all active ChronoTracker instances for unified animation frame updates
    const globalAnimationManager = (function() {
        const activeTrackingMap = new Map();
        let currentAnimationFrameId = null;

        const executeAllUpdates = () => {
            const currentTime = new Date();
            for (const [domNode, trackerInstance] of activeTrackingMap.entries()) {
                trackerInstance._executeTick(currentTime);
            }
            if (activeTrackingMap.size > 0) {
                currentAnimationFrameId = requestAnimationFrame(executeAllUpdates);
            } else {
                currentAnimationFrameId = null;
            }
        };

        return {
            registerTracker: (domNode, trackerInstance) => {
                if (!activeTrackingMap.has(domNode)) {
                    activeTrackingMap.set(domNode, trackerInstance);
                    if (!currentAnimationFrameId) {
                        currentAnimationFrameId = requestAnimationFrame(executeAllUpdates);
                    }
                }
            },
            deregisterTracker: (domNode) => {
                activeTrackingMap.delete(domNode);
                if (activeTrackingMap.size === 0 && currentAnimationFrameId) {
                    cancelAnimationFrame(currentAnimationFrameId);
                    currentAnimationFrameId = null;
                }
            },
            isTrackerRegistered: (domNode) => activeTrackingMap.has(domNode)
        };
    })();

    // Helper function to update configuration, allowing null to remove properties
    function updateObjectProperties(baseObject, newProperties) {
        for (const prop in newProperties) {
            if (newProperties[prop] === null) {
                delete baseObject[prop];
            } else {
                baseObject[prop] = newProperties[prop];
            }
        }
    }

    // Helper function to format numbers with leading zeros
    function formatNumberWithPadding(value, desiredLength) {
        let text = String(value);
        while (text.length < desiredLength) {
            text = '0' + text;
        }
        return text;
    }

    // Helper function to get the number of days in a given month
    function getDaysInSpecificMonth(year, monthIndex) {
        return new Date(year, monthIndex + 1, 0).getDate();
    }

    // Helper function to parse various time inputs (Date, number, string)
    function parseTimeReference(valueInput, defaultTimeValue) {
        if (valueInput === null) return defaultTimeValue;
        if (valueInput instanceof Date) return valueInput;
        if (typeof valueInput === 'number') {
            const calculatedDate = new Date();
            calculatedDate.setMilliseconds(calculatedDate.getMilliseconds() + valueInput * 1000);
            calculatedDate.setMilliseconds(0); // Clear milliseconds for consistency
            return calculatedDate;
        }
        if (typeof valueInput === 'string') {
            const initialDate = new Date();
            let yearVal = initialDate.getFullYear(), monthVal = initialDate.getMonth(), dayVal = initialDate.getDate(),
                hourVal = initialDate.getHours(), minuteVal = initialDate.getMinutes(), secondVal = initialDate.getSeconds();

            const timeUnitRegex = /([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;
            let currentMatch;
            while ((currentMatch = timeUnitRegex.exec(valueInput)) !== null) {
                const count = parseInt(currentMatch[1], 10);
                const unit = currentMatch[2] || 's';
                switch (unit) {
                    case 's': secondVal += count; break;
                    case 'm': minuteVal += count; break;
                    case 'h': hourVal += count; break;
                    case 'd': dayVal += count; break;
                    case 'w': dayVal += count * 7; break;
                    case 'o': monthVal += count; dayVal = Math.min(dayVal, getDaysInSpecificMonth(yearVal, monthVal)); break;
                    case 'y': yearVal += count; dayVal = Math.min(dayVal, getDaysInSpecificMonth(yearVal, monthVal)); break;
                }
            }
            return new Date(yearVal, monthVal, dayVal, hourVal, minuteVal, secondVal, 0);
        }
        return null;
    }

    // Helper function to convert a date/time to its UTC equivalent based on an offset
    function convertToUtc(timezoneOffset, year, month, day, hours, mins, secs, ms) {
        let workingDate;
        if (typeof year === 'object' && year instanceof Date) {
            workingDate = new Date(year.getTime());
        } else {
            workingDate = new Date(0);
            workingDate.setUTCFullYear(year);
            workingDate.setUTCMonth(month || 0);
            workingDate.setUTCDate(day || 1);
            workingDate.setUTCHours(hours || 0);
            workingDate.setUTCMinutes(mins || 0);
            workingDate.setUTCSeconds(secs || 0);
            workingDate.setUTCMilliseconds(ms || 0);
        }
        const actualOffsetMinutes = (Math.abs(timezoneOffset) < 30 ? timezoneOffset * 60 : timezoneOffset);
        workingDate.setUTCMinutes(workingDate.getUTCMinutes() - actualOffsetMinutes);
        return workingDate;
    }

    // Core function to calculate time differences into periods (Years, Months, Weeks, Days, Hours, Minutes, Seconds)
    function calculateDurationPeriods(beginPoint, endPoint) {
        let totalTimeDifferenceMs = endPoint.getTime() - beginPoint.getTime();
        const isCountingUpwards = totalTimeDifferenceMs < 0;
        totalTimeDifferenceMs = Math.abs(totalTimeDifferenceMs);

        let years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0;

        let currentIterativeDate = new Date(beginPoint.getTime());

        // Calculate Years
        while (true) {
            let nextYearCandidate = new Date(currentIterativeDate.getFullYear() + 1, currentIterativeDate.getMonth(), currentIterativeDate.getDate(), currentIterativeDate.getHours(), currentIterativeDate.getMinutes(), currentIterativeDate.getSeconds(), currentIterativeDate.getMilliseconds());
            if (nextYearCandidate.getDate() !== currentIterativeDate.getDate()) {
                nextYearCandidate = new Date(currentIterativeDate.getFullYear() + 1, currentIterativeDate.getMonth() + 1, 0, currentIterativeDate.getHours(), currentIterativeDate.getMinutes(), currentIterativeDate.getSeconds(), currentIterativeDate.getMilliseconds());
            }
            if (nextYearCandidate.getTime() <= endPoint.getTime()) {
                years++;
                currentIterativeDate = nextYearCandidate;
            } else {
                break;
            }
        }

        // Calculate Months
        while (true) {
            let nextMonthCandidate = new Date(currentIterativeDate.getFullYear(), currentIterativeDate.getMonth() + 1, currentIterativeDate.getDate(), currentIterativeDate.getHours(), currentIterativeDate.getMinutes(), currentIterativeDate.getSeconds(), currentIterativeDate.getMilliseconds());
            if (nextMonthCandidate.getDate() !== currentIterativeDate.getDate()) {
                nextMonthCandidate = new Date(currentIterativeDate.getFullYear(), currentIterativeDate.getMonth() + 1, 0, currentIterativeDate.getHours(), currentIterativeDate.getMinutes(), currentIterativeDate.getSeconds(), currentIterativeDate.getMilliseconds());
            }
            if (nextMonthCandidate.getTime() <= endPoint.getTime()) {
                months++;
                currentIterativeDate = nextMonthCandidate;
            } else {
                break;
            }
        }

        // Remaining milliseconds after precise year and month calculation
        let remainingMillis = endPoint.getTime() - currentIterativeDate.getTime();

        const msInSecond = 1000;
        const msInMinute = 60 * msInSecond;
        const msInHour = 60 * msInMinute;
        const msInDay = 24 * msInHour;
        const msInWeek = 7 * msInDay;

        seconds = Math.floor(remainingMillis / msInSecond);
        remainingMillis %= msInSecond;

        minutes = Math.floor(seconds / 60);
        seconds %= 60;

        hours = Math.floor(minutes / 60);
        minutes %= 60;

        days = Math.floor(hours / 24);
        hours %= 24;

        weeks = Math.floor(days / 7);
        days %= 7;

        const finalPeriods = [years, months, weeks, days, hours, minutes, seconds];
        return isCountingUpwards ? finalPeriods.map(val => -val) : finalPeriods;
    }

    // Main ChronoTracker Class
    class ChronoTracker {
        constructor(domElement, customOptions) {
            if (!(domElement instanceof Element)) {
                throw new Error('ChronoTracker requires a valid DOM element for initialization.');
            }
            if (domElement.classList.contains('active-chrono')) {
                return; // Prevent re-initialization
            }

            this.domNode = domElement;
            this.currentConfig = Object.assign({}, baseConfiguration);
            this.timePeriods = [0, 0, 0, 0, 0, 0, 0];
            this.activityState = null; // 'paused', 'lapped', null (running)
            this.storedPeriods = null; // For 'paused' state
            this.expirationTriggered = false;

            this.domNode.classList.add('active-chrono');
            this.applySettings(customOptions);
            globalAnimationManager.registerTracker(this.domNode, this);
        }

        // Retrieves a setting value, falling back to default if not present
        getSetting(propertyName) {
            return (this.currentConfig[propertyName] !== undefined ?
                this.currentConfig[propertyName] : baseConfiguration[propertyName]);
        }

        // Updates tracker settings
        applySettings(options) {
            options = options || {};
            // Clear custom-numbered labels if base labels are changed
            if (Object.keys(options).some(key => key.match(/UnitLabels/))) {
                for (const key in this.currentConfig) {
                    if (key.match(/UnitLabels[0-9]/)) {
                        delete this.currentConfig[key];
                    }
                }
            }
            updateObjectProperties(this.currentConfig, options);
            this.calibrateTimeReferences();
            this._executeTick(new Date()); // Force an immediate display update
        }

        // Adjusts internal time references based on current settings
        calibrateTimeReferences() {
            const serverSyncHandler = this.getSetting('serverTimeSynchronizer');
            const serverCurrentTime = serverSyncHandler ? serverSyncHandler.apply(this.domNode, []) : null;
            const currentTime = new Date();
            const timezone = this.getSetting('timeZoneOffset');
            const effectiveTZOffset = (timezone === null ? -currentTime.getTimezoneOffset() : timezone);

            this.currentConfig.effectiveStartMoment = parseTimeReference(this.getSetting('startMoment'), null);
            if (this.currentConfig.effectiveStartMoment && serverCurrentTime) {
                this.currentConfig.effectiveStartMoment = convertToUtc(effectiveTZOffset, this.currentConfig.effectiveStartMoment);
                this.currentConfig.effectiveStartMoment.setMilliseconds(this.currentConfig.effectiveStartMoment.getMilliseconds() + currentTime.getTime() - serverCurrentTime.getTime());
            } else if (this.currentConfig.effectiveStartMoment) {
                this.currentConfig.effectiveStartMoment = convertToUtc(effectiveTZOffset, this.currentConfig.effectiveStartMoment);
            }

            this.currentConfig.effectiveTargetMoment = parseTimeReference(this.getSetting('targetMoment'), currentTime);
            if (serverCurrentTime) {
                this.currentConfig.effectiveTargetMoment = convertToUtc(effectiveTZOffset, this.currentConfig.effectiveTargetMoment);
                this.currentConfig.effectiveTargetMoment.setMilliseconds(this.currentConfig.effectiveTargetMoment.getMilliseconds() + currentTime.getTime() - serverCurrentTime.getTime());
            } else {
                 this.currentConfig.effectiveTargetMoment = convertToUtc(effectiveTZOffset, this.currentConfig.effectiveTargetMoment);
            }

            // Determine which units should be displayed based on the output format string
            this.currentConfig.displayUnitVisibility = this.resolveDisplayFlags(this.getSetting('outputFormat'));
        }

        // Resolves display flags for each time unit based on format string
        resolveDisplayFlags(formatString) {
            const flags = [null, null, null, null, null, null, null]; // Y, O, W, D, H, M, S
            const unitChars = ['Y', 'O', 'W', 'D', 'H', 'M', 'S'];
            for (let i = 0; i < unitChars.length; i++) {
                const char = unitChars[i];
                if (formatString.includes(char.toUpperCase())) {
                    flags[i] = true; // Always show
                } else if (formatString.includes(char.toLowerCase())) {
                    flags[i] = '?'; // Show if non-zero
                }
            }
            return flags;
        }

        // Processes a single tick, updates display and checks for expiry
        _executeTick(currentTimestamp) {
            this.currentConfig.lastUpdateTime = currentTimestamp;

            if (this.activityState === 'paused') {
                // Do nothing, periods remain as saved
            } else {
                const start = this.getSetting('effectiveStartMoment');
                const end = this.getSetting('effectiveTargetMoment');

                if (!start && !end) {
                    this.timePeriods = [0, 0, 0, 0, 0, 0, 0];
                } else if (start) {
                    this.timePeriods = calculateDurationPeriods(start, currentTimestamp);
                } else {
                    this.timePeriods = calculateDurationPeriods(currentTimestamp, end);
                }
            }

            this.updateDisplay();

            const onUpdate = this.getSetting('onTickCallback');
            if (onUpdate) {
                const periodsForCallback = this.activityState === 'lapped' ?
                    calculateDurationPeriods(this.getSetting('effectiveStartMoment') || currentTimestamp, currentTimestamp) :
                    this.timePeriods;
                onUpdate.apply(this.domNode, [periodsForCallback]);
            }

            const isExpired = this.activityState !== 'paused' &&
                (this.currentConfig.effectiveStartMoment ? currentTimestamp.getTime() <= this.currentConfig.effectiveStartMoment.getTime() :
                currentTimestamp.getTime() >= this.currentConfig.effectiveTargetMoment.getTime());

            if (isExpired && !this.expirationTriggered) {
                this.expirationTriggered = true;
                globalAnimationManager.deregisterTracker(this.domNode);
                const onExpire = this.getSetting('onExpirationCallback');
                if (onExpire) {
                    onExpire.apply(this.domNode, []);
                }
                const expiryMessage = this.getSetting('expirationDisplayMessage');
                if (expiryMessage) {
                    const originalMarkup = this.getSetting('customMarkup');
                    this.currentConfig.customMarkup = expiryMessage;
                    this.updateDisplay();
                    this.currentConfig.customMarkup = originalMarkup;
                }
                const expiryUrl = this.getSetting('expirationRedirectUrl');
                if (expiryUrl) {
                    window.location.href = expiryUrl;
                }
                this.expirationTriggered = false;
            } else if (this.activityState === 'paused') {
                globalAnimationManager.deregisterTracker(this.domNode);
            } else if (!isExpired && !globalAnimationManager.isTrackerRegistered(this.domNode)) {
                globalAnimationManager.registerTracker(this.domNode, this);
            }
        }

        // Renders the current time periods into the DOM element
        updateDisplay() {
            const generatedHtml = this.generateOutputMarkup();
            this.domNode.innerHTML = generatedHtml;
            this.domNode.classList[(this.getSetting('displayRightToLeft') ? 'add' : 'remove')]('chrono-rtl');
        }

        // Generates the HTML string for the countdown display
        generateOutputMarkup() {
            const currentPeriodValues = this.timePeriods;
            const displayVisibilityFlags = this.currentConfig.displayUnitVisibility;
            const condensedDisplayMode = this.getSetting('condensedDisplay');
            const customMarkupTemplate = this.getSetting('customMarkup');
            const descriptionText = this.getSetting('elementDescription');

            if (customMarkupTemplate) {
                return this.constructCustomLayout(customMarkupTemplate, condensedDisplayMode);
            }

            const unitLabelsArray = condensedDisplayMode ? this.getSetting('compactUnitLabels') : this.getSetting('unitLabels');
            const separatorChar = this.getSetting('timeDelimiter');

            let nonZeroDisplayed = false;
            let unitsToDisplay = [];

            for (let i = 0; i < currentPeriodValues.length; i++) {
                const value = currentPeriodValues[i];
                const flag = displayVisibilityFlags[i];

                if (flag === true || (flag === '?' && (value !== 0 || nonZeroDisplayed))) {
                    unitsToDisplay[i] = value;
                    if (value !== 0) nonZeroDisplayed = true;
                } else {
                    unitsToDisplay[i] = null;
                }
            }

            const renderUnit = (index, fullFormat) => {
                const value = unitsToDisplay[index];
                if (value === null) return '';

                const label = this.getSetting((condensedDisplayMode ? 'compactUnitLabels' : 'unitLabels') + value) || unitLabelsArray[index];

                if (fullFormat) {
                    return `<span class="chrono-section"><span class="chrono-amount">${value}</span><br/>${label}</span>`;
                } else {
                    return `${value}${label} `;
                }
            };

            let outputContent = '';
            if (condensedDisplayMode) {
                outputContent = `<span class="chrono-row chrono-amount${this.activityState ? ' chrono-holding' : ''}">`;
                outputContent += renderUnit(periodIndices.YEAR, false);
                outputContent += renderUnit(periodIndices.MONTH, false);
                outputContent += renderUnit(periodIndices.WEEK, false);
                outputContent += renderUnit(periodIndices.DAY, false);
                
                if (unitsToDisplay[periodIndices.HOUR] !== null) outputContent += formatNumberWithPadding(unitsToDisplay[periodIndices.HOUR], 2);
                if (unitsToDisplay[periodIndices.MINUTE] !== null) outputContent += (unitsToDisplay[periodIndices.HOUR] !== null ? separatorChar : '') + formatNumberWithPadding(unitsToDisplay[periodIndices.MINUTE], 2);
                if (unitsToDisplay[periodIndices.SECOND] !== null) outputContent += ((unitsToDisplay[periodIndices.HOUR] !== null || unitsToDisplay[periodIndices.MINUTE] !== null) ? separatorChar : '') + formatNumberWithPadding(unitsToDisplay[periodIndices.SECOND], 2);
                
                outputContent += '</span>';
            } else {
                const visibleUnitCount = unitsToDisplay.filter(u => u !== null).length;
                outputContent = `<span class="chrono-row chrono-show${visibleUnitCount}${this.activityState ? ' chrono-holding' : ''}">`;
                outputContent += renderUnit(periodIndices.YEAR, true);
                outputContent += renderUnit(periodIndices.MONTH, true);
                outputContent += renderUnit(periodIndices.WEEK, true);
                outputContent += renderUnit(periodIndices.DAY, true);
                outputContent += renderUnit(periodIndices.HOUR, true);
                outputContent += renderUnit(periodIndices.MINUTE, true);
                outputContent += renderUnit(periodIndices.SECOND, true);
                outputContent += '</span>';
            }

            if (descriptionText) {
                outputContent += `<span class="chrono-row chrono-description">${descriptionText}</span>`;
            }
            return outputContent;
        }

        // Constructs custom HTML layout from a template string
        constructCustomLayout(templateString, condensedMode) {
            const labelsSource = this.getSetting(condensedMode ? 'compactUnitLabels' : 'unitLabels');
            const retrieveLabel = (idx) => {
                return this.getSetting((condensedMode ? 'compactUnitLabels' : 'unitLabels') + this.timePeriods[idx]) || labelsSource[idx];
            };
            const getSingleDigit = (value, powerOfTen) => Math.floor(value / powerOfTen) % 10;

            const replacementMap = {
                desc: this.getSetting('elementDescription'),
                sep: this.getSetting('timeDelimiter'),
                yl: retrieveLabel(periodIndices.YEAR), yn: this.timePeriods[periodIndices.YEAR], ynn: formatNumberWithPadding(this.timePeriods[periodIndices.YEAR], 2),
                ynnn: formatNumberWithPadding(this.timePeriods[periodIndices.YEAR], 3), y1: getSingleDigit(this.timePeriods[periodIndices.YEAR], 1),
                y10: getSingleDigit(this.timePeriods[periodIndices.YEAR], 10), y100: getSingleDigit(this.timePeriods[periodIndices.YEAR], 100),
                ol: retrieveLabel(periodIndices.MONTH), on: this.timePeriods[periodIndices.MONTH], onn: formatNumberWithPadding(this.timePeriods[periodIndices.MONTH], 2),
                onnn: formatNumberWithPadding(this.timePeriods[periodIndices.MONTH], 3), o1: getSingleDigit(this.timePeriods[periodIndices.MONTH], 1),
                o10: getSingleDigit(this.timePeriods[periodIndices.MONTH], 10), o100: getSingleDigit(this.timePeriods[periodIndices.MONTH], 100),
                wl: retrieveLabel(periodIndices.WEEK), wn: this.timePeriods[periodIndices.WEEK], wnn: formatNumberWithPadding(this.timePeriods[periodIndices.WEEK], 2),
                wnnn: formatNumberWithPadding(this.timePeriods[periodIndices.WEEK], 3), w1: getSingleDigit(this.timePeriods[periodIndices.WEEK], 1),
                w10: getSingleDigit(this.timePeriods[periodIndices.WEEK], 10), w100: getSingleDigit(this.timePeriods[periodIndices.WEEK], 100),
                dl: retrieveLabel(periodIndices.DAY), dn: this.timePeriods[periodIndices.DAY], dnn: formatNumberWithPadding(this.timePeriods[periodIndices.DAY], 2),
                dnnn: formatNumberWithPadding(this.timePeriods[periodIndices.DAY], 3), d1: getSingleDigit(this.timePeriods[periodIndices.DAY], 1),
                d10: getSingleDigit(this.timePeriods[periodIndices.DAY], 10), d100: getSingleDigit(this.timePeriods[periodIndices.DAY], 100),
                hl: retrieveLabel(periodIndices.HOUR), hn: this.timePeriods[periodIndices.HOUR], hnn: formatNumberWithPadding(this.timePeriods[periodIndices.HOUR], 2),
                hnnn: formatNumberWithPadding(this.timePeriods[periodIndices.HOUR], 3), h1: getSingleDigit(this.timePeriods[periodIndices.HOUR], 1),
                h10: getSingleDigit(this.timePeriods[periodIndices.HOUR], 10), h100: getSingleDigit(this.timePeriods[periodIndices.HOUR], 100),
                ml: retrieveLabel(periodIndices.MINUTE), mn: this.timePeriods[periodIndices.MINUTE], mnn: formatNumberWithPadding(this.timePeriods[periodIndices.MINUTE], 2),
                mnnn: formatNumberWithPadding(this.timePeriods[periodIndices.MINUTE], 3), m1: getSingleDigit(this.timePeriods[periodIndices.MINUTE], 1),
                m10: getSingleDigit(this.timePeriods[periodIndices.MINUTE], 10), m100: getSingleDigit(this.timePeriods[periodIndices.MINUTE], 100),
                sl: retrieveLabel(periodIndices.SECOND), sn: this.timePeriods[periodIndices.SECOND], snn: formatNumberWithPadding(this.timePeriods[periodIndices.SECOND], 2),
                snnn: formatNumberWithPadding(this.timePeriods[periodIndices.SECOND], 3), s1: getSingleDigit(this.timePeriods[periodIndices.SECOND], 1),
                s10: getSingleDigit(this.timePeriods[periodIndices.SECOND], 10), s100: getSingleDigit(this.timePeriods[periodIndices.SECOND], 100)
            };

            let renderedHtml = templateString;
            for (const key in replacementMap) {
                const regex = new RegExp(`\\{${key}\\}`, 'g');
                renderedHtml = renderedHtml.replace(regex, replacementMap[key]);
            }

            // Process conditional period blocks: {p<}...{p>}
            const unitChars = ['y', 'o', 'w', 'd', 'h', 'm', 's'];
            for (let i = 0; i < unitChars.length; i++) {
                const periodChar = unitChars[i];
                const conditionalRegex = new RegExp(`\\{${periodChar}<\\}(.*?)\\{${periodChar}>\\}`, 'g');
                renderedHtml = renderedHtml.replace(conditionalRegex, (this.currentConfig.displayUnitVisibility[i] ? '$1' : ''));
            }
            return renderedHtml;
        }

        // Controls the activity state (pause, lap, resume)
        changeActivityState(newState) {
            if (this.activityState === 'paused' && !newState) { // Resuming from a paused state
                this.timePeriods = this.storedPeriods;
                const sign = (this.getSetting('effectiveStartMoment') ? '-' : '+');
                const periodUnits = ['y', 'o', 'w', 'd', 'h', 'm', 's'];
                const timeString = this.timePeriods.map((val, idx) => sign + val + periodUnits[idx]).join('');
                
                if (this.getSetting('effectiveStartMoment')) {
                    this.currentConfig.startMoment = timeString;
                } else {
                    this.currentConfig.targetMoment = timeString;
                }
                this.calibrateTimeReferences();
                globalAnimationManager.registerTracker(this.domNode, this);
            }
            this.activityState = newState;
            this.storedPeriods = (newState === 'paused' ? this.timePeriods : null);
            this._executeTick(new Date()); // Update display immediately
        }

        // Public methods to control the tracker
        suspendCounting() { this.changeActivityState('paused'); }
        markLapTime() { this.changeActivityState('lapped'); }
        resumeCounting() { this.changeActivityState(null); }

        // Retrieves the current time periods
        fetchCurrentDurations() {
            return this.activityState === 'lapped' ?
                calculateDurationPeriods(this.getSetting('effectiveStartMoment') || new Date(), new Date()) :
                this.timePeriods;
        }

        // Destroys the tracker instance
        releaseTracker() {
            globalAnimationManager.deregisterTracker(this.domNode);
            this.domNode.classList.remove('active-chrono', 'chrono-rtl');
            this.domNode.innerHTML = '';
            delete this.domNode[INSTANCE_PROPERTY];
        }
    }

    // Expose ChronoTracker to the global scope
    scope.ChronoTracker = ChronoTracker;

    // Utility function to initialize ChronoTracker on selected elements
    scope.initializeChronoTracker = function(selector, options) {
        const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
        elements.forEach(element => {
            if (!element[INSTANCE_PROPERTY]) {
                element[INSTANCE_PROPERTY] = new ChronoTracker(element, options);
            } else {
                element[INSTANCE_PROPERTY].applySettings(options);
            }
        });
    };

    // Utility function to call methods on existing ChronoTracker instances
    scope.manageChronoTrackerInstance = function(element, methodName, ...args) {
        if (element && element[INSTANCE_PROPERTY] && typeof element[INSTANCE_PROPERTY][methodName] === 'function') {
            return element[INSTANCE_PROPERTY][methodName](...args);
        }
        console.warn(`ChronoTracker: Method '${methodName}' not found or element not initialized.`);
        return null;
    };

})(window);