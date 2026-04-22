(function (rootContext) {

    rootContext.TimeComponentManager = rootContext.TimeComponentManager || {};
    if (rootContext.TimeComponentManager.releaseIdentifier) {
        return;
    }
    rootContext.TimeComponentManager.releaseIdentifier = "1.4.3";

    const DomQuery = function (selector, context = document) {
        let elements = typeof selector === 'string' ? Array.from(context.querySelectorAll(selector)) : (selector instanceof HTMLElement ? [selector] : (Array.isArray(selector) ? selector : []));
        
        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        const domObject = {
            elements: elements,
            length: elements.length,
            
            attr: function (name, value) {
                if (value === undefined) {
                    return this.elements.length > 0 ? this.elements[0].getAttribute(name) : undefined;
                }
                this.elements.forEach(el => el.setAttribute(name, value));
                return this;
            },
            bind: function (eventName, handler) {
                this.elements.forEach(el => el.addEventListener(eventName, handler));
                return this;
            },
            val: function (value) {
                if (value === undefined) {
                    return this.elements.length > 0 ? this.elements[0].value : undefined;
                }
                this.elements.forEach(el => el.value = value);
                return this;
            },
            css: function (styles) {
                this.elements.forEach(el => Object.assign(el.style, styles));
                return this;
            },
            focus: function (handler) {
                if (handler) {
                    this.bind('focus', handler);
                } else {
                    this.elements.length > 0 && this.elements[0].focus();
                }
                return this;
            },
            find: function (innerSelector) {
                const foundElements = [];
                this.elements.forEach(el => foundElements.push(...Array.from(el.querySelectorAll(innerSelector))));
                return DomQuery(foundElements);
            },
            append: function (content) {
                this.elements.forEach(el => {
                    if (typeof content === 'string') {
                        el.insertAdjacentHTML('beforeend', content);
                    } else if (content instanceof HTMLElement) {
                        el.appendChild(content);
                    } else if (content && content.elements) {
                         content.elements.forEach(child => el.appendChild(child));
                    }
                });
                return this;
            },
            prepend: function (content) {
                this.elements.forEach(el => {
                    if (typeof content === 'string') {
                        el.insertAdjacentHTML('afterbegin', content);
                    } else if (content instanceof HTMLElement) {
                        el.prepend(content);
                    } else if (content && content.elements) {
                         content.elements.forEach(child => el.prepend(child));
                    }
                });
                return this;
            },
            html: function(content) {
                if (content === undefined) {
                    return this.elements.length > 0 ? this.elements[0].innerHTML : '';
                }
                this.elements.forEach(el => el.innerHTML = content);
                return this;
            },
            data: function(key, value) {
                if (value === undefined) {
                    return this.elements.length > 0 ? this.elements[0].dataset[key] : undefined;
                }
                this.elements.forEach(el => el.dataset[key] = value);
                return this;
            },
            on: function(eventName, handler) {
                return this.bind(eventName, handler);
            },
            change: function(handler) {
                return this.bind('change', handler);
            },
            click: function(handler) {
                return this.bind('click', handler);
            },
            hide: function() {
                this.elements.forEach(el => el.style.display = 'none');
                return this;
            }
        };

        domObject[Symbol.iterator] = function* () {
            for (const el of this.elements) {
                yield el;
            }
        };

        return domObject;
    };

    DomQuery.isFunction = (func) => typeof func === 'function';
    DomQuery.map = (array, callback) => array.map(callback);
    DomQuery.extend = Object.assign;

    const MockCalendar = {
        _instances: new Map(),
        _getInst: function (element) {
            if (!this._instances.has(element)) {
                this._instances.set(element, {
                    settings: {},
                    dpDiv: document.createElement('div'),
                    id: 'mock-dp-' + Math.random().toString(36).substr(2, 9),
                    selectedYear: new Date().getFullYear(),
                    selectedMonth: new Date().getMonth(),
                    selectedDay: new Date().getDate(),
                    input: element
                });
            }
            return this._instances.get(element);
        },
        _get: function (instance, property) {
            return instance.settings[property];
        },
        _getFormatConfig: function (instance) {
            return {
                shortYearCutoff: '+10',
                dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                isRTL: false
            };
        },
        parseTime: function (timeFormat, timeString, options) {
            options = DomQuery.extend({}, TimeComponentManager.instance.standardOptions, options);
            const timeObj = { hour: 0, minute: 0, second: 0, millisec: 0, microsec: 0, timezone: null };
            let tempString = timeString.toLowerCase();
            
            let isPM = false;
            if (timeFormat.includes('t') || timeFormat.includes('T')) {
                const ampmRegex = /(am|pm|a|p)/i;
                const match = tempString.match(ampmRegex);
                if (match) {
                    const ampm = match[1].toLowerCase();
                    if (ampm === 'pm' || ampm === 'p') {
                        isPM = true;
                    }
                    tempString = tempString.replace(ampmRegex, '').trim();
                }
            }

            const formatSpecifiers = timeFormat.match(/[HhmslczZT]+/g) || [];
            let currentStringIndex = 0;

            for (const spec of formatSpecifiers) {
                let valMatch;
                if (spec.includes('H') || spec.includes('h')) { // Hour
                    valMatch = tempString.substring(currentStringIndex).match(/^\d{1,2}/);
                    if (valMatch) {
                        timeObj.hour = parseInt(valMatch[0], 10);
                        if (spec.includes('h')) { // 12-hour format
                            if (isPM && timeObj.hour < 12) timeObj.hour += 12;
                            if (!isPM && timeObj.hour === 12) timeObj.hour = 0;
                        }
                        currentStringIndex += valMatch[0].length;
                    }
                } else if (spec.includes('m')) { // Minute
                    valMatch = tempString.substring(currentStringIndex).match(/^\d{1,2}/);
                    if (valMatch) {
                        timeObj.minute = parseInt(valMatch[0], 10);
                        currentStringIndex += valMatch[0].length;
                    }
                } else if (spec.includes('s')) { // Second
                    valMatch = tempString.substring(currentStringIndex).match(/^\d{1,2}/);
                    if (valMatch) {
                        timeObj.second = parseInt(valMatch[0], 10);
                        currentStringIndex += valMatch[0].length;
                    }
                } else if (spec.includes('l')) { // Millisecond
                    valMatch = tempString.substring(currentStringIndex).match(/^\d{1,3}/);
                    if (valMatch) {
                        timeObj.millisec = parseInt(valMatch[0], 10);
                        currentStringIndex += valMatch[0].length;
                    }
                } else if (spec.includes('c')) { // Microsecond
                    valMatch = tempString.substring(currentStringIndex).match(/^\d{1,3}/);
                    if (valMatch) {
                        timeObj.microsec = parseInt(valMatch[0], 10);
                        currentStringIndex += valMatch[0].length;
                    }
                } else if (spec.includes('z') || spec.includes('Z')) { // Timezone
                    valMatch = tempString.substring(currentStringIndex).match(/^[+-]\d{2,4}|[A-Z]{3}/);
                    if (valMatch) {
                        timeObj.timezone = TimeComponentManager.parseTimezoneOffset(valMatch[0]);
                        currentStringIndex += valMatch[0].length;
                    }
                }
                
                // Skip non-format characters
                while (currentStringIndex < tempString.length && !/[HhmslczZT]/.test(tempString[currentStringIndex])) {
                    currentStringIndex++;
                }
            }
            
            return timeObj;
        },
        formatTime: function (timeFormat, timeObj, options) {
            options = DomQuery.extend({}, TimeComponentManager.instance.standardOptions, options);
            let output = timeFormat;
            const hour = timeObj.hour;
            const minute = timeObj.minute;
            const second = timeObj.second;
            const millisec = timeObj.millisec;
            const microsec = timeObj.microsec;
            const ampm = hour < 12 ? (options.morningNames[0] || 'AM') : (options.eveningNames[0] || 'PM');
            const hour12 = hour % 12 === 0 ? 12 : hour % 12;

            output = output.replace(/HH/g, String(hour).padStart(2, '0'));
            output = output.replace(/H/g, String(hour));
            output = output.replace(/hh/g, String(hour12).padStart(2, '0'));
            output = output.replace(/h/g, String(hour12));
            output = output.replace(/mm/g, String(minute).padStart(2, '0'));
            output = output.replace(/m/g, String(minute));
            output = output.replace(/ss/g, String(second).padStart(2, '0'));
            output = output.replace(/s/g, String(second));
            output = output.replace(/l/g, String(millisec).padStart(3, '0'));
            output = output.replace(/c/g, String(microsec).padStart(3, '0'));
            output = output.replace(/TT/g, ampm.toUpperCase());
            output = output.replace(/T/g, ampm.charAt(0).toUpperCase());
            output = output.replace(/tt/g, ampm.toLowerCase());
            output = output.replace(/t/g, ampm.charAt(0).toLowerCase());
            output = output.replace(/z/g, TimeComponentManager.formatTimezoneOffset(timeObj.timezone || (new Date()).getTimezoneOffset() * -1, false));
            output = output.replace(/Z/g, TimeComponentManager.formatTimezoneOffset(timeObj.timezone || (new Date()).getTimezoneOffset() * -1, true));

            return output;
        }
    };

    function deepMerge(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Object && !Array.isArray(source[key]) && source[key] !== null && typeof source[key] !== 'function') {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    function analyzeFormatString(formatString) {
        const support = {
            hour: formatString.includes('h') || formatString.includes('H'),
            minute: formatString.includes('m'),
            second: formatString.includes('s'),
            millisec: formatString.includes('l'),
            microsec: formatString.includes('c'),
            timezone: formatString.includes('z') || formatString.includes('Z'),
            ampm: formatString.includes('t') || formatString.includes('T'),
            iso8601: formatString.includes('Z')
        };
        return support;
    }

    TimeComponentManager.formatTimezoneOffset = function (offsetMinutes, iso8601) {
        if (offsetMinutes === null || offsetMinutes === undefined) {
            return '';
        }
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const absOffset = Math.abs(offsetMinutes);
        const hours = Math.floor(absOffset / 60);
        const minutes = absOffset % 60;

        if (iso8601) {
            return sign + String(hours).padStart(2, '0') + String(minutes).padStart(2, '0');
        } else {
            return sign + String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
        }
    };

    TimeComponentManager.parseTimezoneOffset = function (offsetString) {
        if (!offsetString) {
            return null;
        }
        const match = offsetString.match(/([+-])(\d{2}):?(\d{2})/);
        if (match) {
            const sign = match[1] === '+' ? 1 : -1;
            const hours = parseInt(match[2], 10);
            const minutes = parseInt(match[3], 10);
            return sign * (hours * 60 + minutes);
        }
        return null;
    };

    function decomposeDateTimeString(dateFormat, timeFormat, dateTimeString, formatConfig, componentOptions) {
        let dateObj = null;
        let timeObj = null;

        const separatorIndex = dateTimeString.indexOf(componentOptions.fieldSeparator);
        let datePart = dateTimeString;
        let timePart = '';

        if (separatorIndex !== -1) {
            datePart = dateTimeString.substring(0, separatorIndex);
            timePart = dateTimeString.substring(separatorIndex + componentOptions.fieldSeparator.length);
        } else if (componentOptions.timeOnlyMode) {
            timePart = dateTimeString;
            datePart = '';
        }

        if (datePart) {
            try {
                const dateMatch = datePart.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (dateMatch) {
                    dateObj = new Date(parseInt(dateMatch[1], 10), parseInt(dateMatch[2], 10) - 1, parseInt(dateMatch[3], 10));
                } else {
                    dateObj = new Date(datePart);
                }
            } catch (e) {
                TimeComponentManager.log("Warning: Could not parse date part: " + datePart);
            }
        }

        if (timePart) {
            timeObj = MockCalendar.parseTime(timeFormat, timePart, componentOptions);
        }

        return { dateObj: dateObj, timeObj: timeObj };
    }

    function setLocalTimezoneSelection(componentInstance) {
        const localTzOffset = (new Date()).getTimezoneOffset() * -1;
        componentInstance.timezoneDropdown.val(localTzOffset.toString());
        componentInstance.currentTimezone = localTzOffset;
    }

    class TemporalPanel {
        constructor() {
            this.localeSettings = [];
            this.localeSettings[''] = {
                currentText: 'Now',
                completionText: 'Done',
                morningNames: ['AM', 'A'],
                eveningNames: ['PM', 'P'],
                timeDisplayFormat: 'HH:mm',
                timePostfix: '',
                timeOnlyHeader: 'Select Time',
                timeLabel: 'Time',
                hourLabel: 'Hour',
                minuteLabel: 'Minute',
                secondLabel: 'Second',
                millisecondLabel: 'Millisecond',
                microsecondLabel: 'Microsecond',
                zoneLabel: 'Time Zone',
                isRightToLeft: false
            };

            this.standardOptions = {
                displayButtonPanel: true,
                timeOnlyMode: false,
                displayHour: null,
                displayMinute: null,
                displaySecond: null,
                displayMillisecond: null,
                displayMicrosecond: null,
                displayTimezone: null,
                displayTime: true,
                stepHour: 1,
                stepMinute: 1,
                stepSecond: 1,
                stepMillisecond: 1,
                stepMicrosecond: 1,
                currentHour: 0,
                currentMinute: 0,
                currentSecond: 0,
                currentMillisecond: 0,
                currentMicrosecond: 0,
                currentTimezone: null,
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
                onValueSelect: null,
                hourGridDivisions: 0,
                minuteGridDivisions: 0,
                secondGridDivisions: 0,
                millisecondGridDivisions: 0,
                microsecondGridDivisions: 0,
                alwaysUpdateTime: true,
                fieldSeparator: ' ',
                altFieldTimeOnly: true,
                altTimeDisplayFormat: null,
                altFieldSeparator: null,
                altTimePostfix: null,
                pickerTimeDisplayFormat: null,
                pickerTimePostfix: null,
                showComponent: true,
                timezoneOptionsList: null,
                enableSliderAccess: false,
                sliderAccessArguments: null,
                interactionMechanism: 'slider',
                initialValue: null,
                parsingMode: 'strict'
            };
            deepMerge(this.standardOptions, this.localeSettings['']);
        }

        associatedInput = null;
        alternativeInput = null;
        timeElementContainer = null;
        hostInstance = null;
        hourControl = null;
        minuteControl = null;
        secondControl = null;
        millisecondControl = null;
        microsecondControl = null;
        timezoneDropdown = null;
        currentHour = 0;
        currentMinute = 0;
        currentSecond = 0;
        currentMillisecond = 0;
        currentMicrosecond = 0;
        currentTimezone = null;
        originalMinHour = null;
        originalMinMinute = null;
        originalMinSecond = null;
        originalMinMillisecond = null;
        originalMinMicrosecond = null;
        originalMaxHour = null;
        originalMaxMinute = null;
        originalMaxSecond = null;
        originalMaxMillisecond = null;
        originalMaxMicrosecond = null;
        meridiemIndicator = '';
        formattedDateString = '';
        formattedTimeString = '';
        formattedDateTimeString = '';
        timezoneOptionsList = null;
        timeUnits = ['currentHour', 'currentMinute', 'currentSecond', 'currentMillisecond', 'currentMicrosecond'];
        featureSupport = {};
        interactionHandler = null;

        componentHandlers = {
            slider: {
                create: (instance, element, unitName, currentValue, min, max, step) => {
                    const sliderElement = DomQuery(document.createElement('input'));
                    sliderElement.attr('type', 'range');
                    sliderElement.attr('min', min);
                    sliderElement.attr('max', max);
                    sliderElement.attr('step', step);
                    sliderElement.val(currentValue);
                    element.append(sliderElement.elements[0]);
                    sliderElement.on('input', (e) => {
                        const newValue = parseInt(e.target.value, 10);
                        instance.interactionHandler.value(instance, sliderElement, unitName, newValue);
                        instance._onTimeChange();
                        instance._onSelectHandler();
                    });
                    return sliderElement;
                },
                value: (instance, sliderElement, unitName, newValue) => {
                    sliderElement.val(newValue);
                    instance[unitName] = newValue;
                }
            },
            select: {
                create: (instance, element, unitName, currentValue, min, max, step) => {
                    const selectElement = DomQuery(document.createElement('select'));
                    for (let i = min; i <= max; i += step) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = String(i).padStart(2, '0');
                        selectElement.elements[0].appendChild(option);
                    }
                    selectElement.val(currentValue);
                    element.append(selectElement.elements[0]);
                    selectElement.on('change', (e) => {
                        const newValue = parseInt(e.target.value, 10);
                        instance.interactionHandler.value(instance, selectElement, unitName, newValue);
                        instance._onTimeChange();
                        instance._onSelectHandler();
                    });
                    return selectElement;
                },
                value: (instance, selectElement, unitName, newValue) => {
                    selectElement.val(newValue);
                    instance[unitName] = newValue;
                }
            }
        };

        setConfiguration(newSettings) {
            deepMerge(this.standardOptions, newSettings || {});
            return this;
        }

        createInstance(inputElement, options) {
            const componentInstance = new TemporalPanel();
            const dataAttributes = {};
            const eventHandlers = {};
            const lifecycleHooks = {
                beforeShow: (input, parentCalendar) => {
                    if (DomQuery.isFunction(componentInstance.standardOptions.eventListeners.beforeShow)) {
                        return componentInstance.standardOptions.eventListeners.beforeShow.call(inputElement.elements[0], input, parentCalendar, componentInstance);
                    }
                },
                onMonthYearChange: (year, month, parentCalendar) => {
                    componentInstance._updateDateTime(parentCalendar);
                    if (DomQuery.isFunction(componentInstance.standardOptions.eventListeners.onMonthYearChange)) {
                        componentInstance.standardOptions.eventListeners.onMonthYearChange.call(inputElement.elements[0], year, month, parentCalendar, componentInstance);
                    }
                },
                onCloseHandler: (dateText, parentCalendar) => {
                    if (componentInstance.timeDefined === true && inputElement.val() !== '') {
                        componentInstance._updateDateTime(parentCalendar);
                    }
                    if (DomQuery.isFunction(componentInstance.standardOptions.eventListeners.onCloseHandler)) {
                        componentInstance.standardOptions.eventListeners.onCloseHandler.call(inputElement.elements[0], dateText, parentCalendar, componentInstance);
                    }
                }
            };

            if (inputElement.elements.length > 0) {
                const el = inputElement.elements[0];
                for (const attrName in componentInstance.standardOptions) {
                    if (componentInstance.standardOptions.hasOwnProperty(attrName)) {
                        const attrValue = el.getAttribute('time:' + attrName);
                        if (attrValue) {
                            try {
                                dataAttributes[attrName] = JSON.parse(attrValue);
                            } catch (err) {
                                dataAttributes[attrName] = attrValue;
                            }
                        }
                    }
                }
            }
            
            for (const key in lifecycleHooks) {
                if (lifecycleHooks.hasOwnProperty(key)) {
                    eventHandlers[key] = options[key] || null;
                }
            }

            componentInstance.standardOptions = deepMerge({}, this.standardOptions);
            deepMerge(componentInstance.standardOptions, dataAttributes);
            deepMerge(componentInstance.standardOptions, options);
            deepMerge(componentInstance.standardOptions, { eventListeners: eventHandlers });
            deepMerge(componentInstance.standardOptions, lifecycleHooks);
            componentInstance.standardOptions.timeComponentInstance = componentInstance;

            componentInstance.morningNames = DomQuery.map(componentInstance.standardOptions.morningNames, val => val.toUpperCase());
            componentInstance.eveningNames = DomQuery.map(componentInstance.standardOptions.eveningNames, val => val.toUpperCase());

            componentInstance.featureSupport = analyzeFormatString(
                componentInstance.standardOptions.timeDisplayFormat +
                (componentInstance.standardOptions.pickerTimeDisplayFormat ? componentInstance.standardOptions.pickerTimeDisplayFormat : '') +
                (componentInstance.standardOptions.altTimeDisplayFormat ? componentInstance.standardOptions.altTimeDisplayFormat : '')
            );

            if (typeof (componentInstance.standardOptions.interactionMechanism) === 'string') {
                if (componentInstance.standardOptions.interactionMechanism === 'slider' && typeof (DomQuery(document.createElement('input')).attr('type','range').elements[0].oninput) === 'undefined') {
                    componentInstance.standardOptions.interactionMechanism = 'select';
                }
                componentInstance.interactionHandler = componentInstance.componentHandlers[componentInstance.standardOptions.interactionMechanism];
            } else {
                componentInstance.interactionHandler = componentInstance.standardOptions.interactionMechanism;
            }

            let tzList = componentInstance.standardOptions.timezoneOptionsList !== null ? componentInstance.standardOptions.timezoneOptionsList : [
                -720, -660, -600, -570, -540, -480, -420, -360, -300, -270, -240, -210, -180, -120, -60,
                0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630, 660, 690, 720, 765, 780, 840
            ];
            if (tzList.length > 0 && typeof tzList[0] !== 'object') {
                tzList = DomQuery.map(tzList, val => ({
                    value: val,
                    label: TimeComponentManager.formatTimezoneOffset(val, componentInstance.featureSupport.iso8601)
                }));
            }
            componentInstance.standardOptions.timezoneOptionsList = tzList;

            componentInstance.currentTimezone = componentInstance.standardOptions.currentTimezone !== null ?
                TimeComponentManager.parseTimezoneOffset(componentInstance.standardOptions.currentTimezone) :
                ((new Date()).getTimezoneOffset() * -1);

            componentInstance.currentHour = Math.max(componentInstance.standardOptions.minHour, Math.min(componentInstance.standardOptions.maxHour, componentInstance.standardOptions.currentHour));
            componentInstance.currentMinute = Math.max(componentInstance.standardOptions.minMinute, Math.min(componentInstance.standardOptions.maxMinute, componentInstance.standardOptions.currentMinute));
            componentInstance.currentSecond = Math.max(componentInstance.standardOptions.minSecond, Math.min(componentInstance.standardOptions.maxSecond, componentInstance.standardOptions.currentSecond));
            componentInstance.currentMillisecond = Math.max(componentInstance.standardOptions.minMillisecond, Math.min(componentInstance.standardOptions.maxMillisecond, componentInstance.standardOptions.currentMillisecond));
            componentInstance.currentMicrosecond = Math.max(componentInstance.standardOptions.minMicrosecond, Math.min(componentInstance.standardOptions.maxMicrosecond, componentInstance.standardOptions.currentMicrosecond));
            componentInstance.meridiemIndicator = '';
            componentInstance.associatedInput = inputElement;

            if (componentInstance.standardOptions.altField) {
                componentInstance.alternativeInput = DomQuery(componentInstance.standardOptions.altField).css({
                    cursor: 'pointer'
                }).focus(() => {
                    inputElement.focus();
                });
            }

            if (componentInstance.standardOptions.minimumDateTime === 0) {
                componentInstance.standardOptions.minimumDateTime = new Date();
            }
            if (componentInstance.standardOptions.maximumDateTime === 0) {
                componentInstance.standardOptions.maximumDateTime = new Date();
            }
            
            inputElement.bind('focus', () => {
                componentInstance._onFocus();
            });

            return componentInstance;
        }

        attachTimeControls(parentCalendar) {
            const currentDateTimeString = (this.alternativeInput && this.standardOptions.altFieldTimeOnly) ?
                this.associatedInput.val() + this.standardOptions.fieldSeparator + this.alternativeInput.val() :
                this.associatedInput.val();

            this.timeDefined = this.interpretTimeInput(currentDateTimeString);
            this._limitMinMaxDateTime(parentCalendar, false);
            this.renderTimeControls();
        }

        interpretTimeInput(timeString, withDate) {
            if (!this.hostInstance) {
                this.hostInstance = MockCalendar._getInst(this.associatedInput.elements[0]);
            }

            if (withDate || !this.standardOptions.timeOnlyMode) {
                const calendarDateFormat = MockCalendar._get(this.hostInstance, 'dateFormat');
                try {
                    const parseResult = decomposeDateTimeString(calendarDateFormat, this.standardOptions.timeDisplayFormat, timeString, MockCalendar._getFormatConfig(this.hostInstance), this.standardOptions);
                    if (!parseResult.timeObj) {
                        return false;
                    }
                    DomQuery.extend(this, {
                        currentHour: parseResult.timeObj.hour,
                        currentMinute: parseResult.timeObj.minute,
                        currentSecond: parseResult.timeObj.second,
                        currentMillisecond: parseResult.timeObj.millisec,
                        currentMicrosecond: parseResult.timeObj.microsec,
                        currentTimezone: parseResult.timeObj.timezone
                    });
                } catch (err) {
                    TimeComponentManager.log("Error parsing date/time string: " + err +
                        "\nDate/time string = " + timeString +
                        "\nTime format = " + this.standardOptions.timeDisplayFormat +
                        "\nDate format = " + calendarDateFormat);
                    return false;
                }
                return true;
            } else {
                const timeObject = MockCalendar.parseTime(this.standardOptions.timeDisplayFormat, timeString, this.standardOptions);
                if (!timeObject) {
                    return false;
                }
                DomQuery.extend(this, {
                    currentHour: timeObject.hour,
                    currentMinute: timeObject.minute,
                    currentSecond: timeObject.second,
                    currentMillisecond: timeObject.millisec,
                    currentMicrosecond: timeObject.microsec,
                    currentTimezone: timeObject.timezone
                });
                return true;
            }
        }

        renderTimeControls() {
            const calendarContainer = DomQuery(this.hostInstance.dpDiv);
            const currentOptions = this.standardOptions;
            const selfComponent = this;

            if (calendarContainer.find("div.ui-temporal-panel").length === 0 && currentOptions.showComponent) {
                const noDisplay = ' style="display:none;"';
                let htmlContent = `<div class="ui-temporal-panel${(currentOptions.isRightToLeft ? ' ui-temporal-panel-rtl' : '')}"><dl>` +
                    `<dt class="ui_temporal_time_label"${((currentOptions.displayTime) ? '' : noDisplay)}>${currentOptions.timeLabel}</dt>` +
                    `<dd class="ui_temporal_time"${((currentOptions.displayTime) ? '' : noDisplay)}></dd>`;

                this.timeUnits.forEach(unitProperty => {
                    const baseUnitName = unitProperty.replace('current', '').toLowerCase();
                    const capitalizedUnitName = baseUnitName.charAt(0).toUpperCase() + baseUnitName.slice(1);
                    const shouldDisplayUnit = currentOptions['display' + capitalizedUnitName] !== null ? currentOptions['display' + capitalizedUnitName] : this.featureSupport[baseUnitName];

                    const maxUnitValue = parseInt((currentOptions['max' + capitalizedUnitName] - ((currentOptions['max' + capitalizedUnitName] - currentOptions['min' + capitalizedUnitName]) % currentOptions['step' + capitalizedUnitName])), 10);
                    
                    htmlContent += `<dt class="ui_temporal_${baseUnitName}_label"${(shouldDisplayUnit ? '' : noDisplay)}>${currentOptions[baseUnitName + 'Label']}</dt>` +
                        `<dd class="ui_temporal_${baseUnitName}"><div class="ui_temporal_${baseUnitName}_control"${(shouldDisplayUnit ? '' : noDisplay)}></div>`;

                    if (shouldDisplayUnit && currentOptions[baseUnitName + 'GridDivisions'] > 0) {
                        htmlContent += '<div style="padding-left: 1px"><table class="ui-temporal-grid-label"><tr>';
                        const calculatedGridCount = (maxUnitValue - currentOptions['min' + capitalizedUnitName]) / currentOptions[baseUnitName + 'GridDivisions'] + 1;

                        for (let val = currentOptions['min' + capitalizedUnitName]; val <= maxUnitValue; val += parseInt(currentOptions[baseUnitName + 'GridDivisions'], 10)) {
                            let displayValue = String(val);
                            if (baseUnitName === 'hour') {
                                displayValue = MockCalendar.formatTime(this.featureSupport.ampm ? 'hht' : 'HH', { hour: val }, currentOptions);
                            } else {
                                displayValue = String(val).padStart(2, '0');
                            }
                            htmlContent += `<td data-for="${baseUnitName}">${displayValue}</td>`;
                        }
                        htmlContent += '</tr></table></div>';
                    }
                    htmlContent += '</dd>';
                });

                const shouldDisplayTimezone = currentOptions.displayTimezone !== null ? currentOptions.displayTimezone : this.featureSupport.timezone;
                htmlContent += `<dt class="ui_temporal_zone_label"${(shouldDisplayTimezone ? '' : noDisplay)}>${currentOptions.zoneLabel}</dt>`;
                htmlContent += `<dd class="ui_temporal_zone"${(shouldDisplayTimezone ? '' : noDisplay)}></dd>`;

                htmlContent += '</dl></div>';
                const temporalPanelElement = DomQuery(document.createElement('div'));
                temporalPanelElement.html(htmlContent);

                if (currentOptions.timeOnlyMode === true) {
                    const headerHtml = `<div class="ui-widget-header ui-helper-clearfix ui-corner-all">` +
                        `<div class="ui-calendar-title">${currentOptions.timeOnlyHeader}</div>` +
                        `</div>`;
                    temporalPanelElement.prepend(headerHtml);
                    calendarContainer.find('.ui-datepicker-header, .ui-datepicker-calendar').hide();
                }

                this.timeUnits.forEach(unitProperty => {
                    const baseUnitName = unitProperty.replace('current', '').toLowerCase();
                    const capitalizedUnitName = baseUnitName.charAt(0).toUpperCase() + baseUnitName.slice(1);
                    const shouldDisplayUnit = currentOptions['display' + capitalizedUnitName] !== null ? currentOptions['display' + capitalizedUnitName] : this.featureSupport[baseUnitName];

                    const maxUnitValue = parseInt((currentOptions['max' + capitalizedUnitName] - ((currentOptions['max' + capitalizedUnitName] - currentOptions['min' + capitalizedUnitName]) % currentOptions['step' + capitalizedUnitName])), 10);
                    
                    selfComponent[baseUnitName + 'Control'] = selfComponent.interactionHandler.create(
                        selfComponent,
                        temporalPanelElement.find(`.ui_temporal_${baseUnitName}_control`),
                        unitProperty,
                        selfComponent[unitProperty],
                        currentOptions['min' + capitalizedUnitName],
                        maxUnitValue,
                        currentOptions['step' + capitalizedUnitName]
                    );

                    if (shouldDisplayUnit && currentOptions[baseUnitName + 'GridDivisions'] > 0) {
                        const gridTable = temporalPanelElement.find(`.ui_temporal_${baseUnitName} table`);
                        const calculatedGridCount = (maxUnitValue - currentOptions['min' + capitalizedUnitName]) / currentOptions[baseUnitName + 'GridDivisions'] + 1;
                        const size = 100 * calculatedGridCount * currentOptions[baseUnitName + 'GridDivisions'] / (maxUnitValue - currentOptions['min' + capitalizedUnitName] + (currentOptions[baseUnitName + 'GridDivisions'] || 1));
                        
                        gridTable.css({
                            width: size + "%",
                            marginLeft: currentOptions.isRightToLeft ? '0' : ((size / (-2 * calculatedGridCount)) + "%"),
                            marginRight: currentOptions.isRightToLeft ? ((size / (-2 * calculatedGridCount)) + "%") : '0',
                            borderCollapse: 'collapse'
                        }).find("td").click(function (e) {
                            const targetCell = DomQuery(e.target);
                            let cellValue = targetCell.html();
                            let numericValue = parseInt(cellValue.replace(/[^0-9]/g, ''), 10);
                            const ampmPart = cellValue.replace(/[^apm]/ig, '');
                            const unitIdentifier = targetCell.data('for');

                            if (unitIdentifier === 'hour') {
                                if (ampmPart.toLowerCase().includes('p') && numericValue < 12) {
                                    numericValue += 12;
                                } else if (ampmPart.toLowerCase().includes('a') && numericValue === 12) {
                                    numericValue = 0;
                                }
                            }
                            
                            const instanceProperty = 'current' + unitIdentifier.charAt(0).toUpperCase() + unitIdentifier.slice(1);
                            selfComponent.interactionHandler.value(selfComponent, selfComponent[unitIdentifier + 'Control'], instanceProperty, numericValue);

                            selfComponent._onTimeChange();
                            selfComponent._onSelectHandler();
                        }).css({
                            cursor: 'pointer',
                            width: (100 / calculatedGridCount) + '%',
                            textAlign: 'center',
                            overflow: 'hidden'
                        });
                    }
                });

                this.timezoneDropdown = temporalPanelElement.find('.ui_temporal_zone').append(document.createElement('select')).find("select");
                this.standardOptions.timezoneOptionsList.forEach(tz => {
                    const option = document.createElement('option');
                    option.value = typeof tz === "object" ? tz.value : tz;
                    option.textContent = typeof tz === "object" ? tz.label : tz;
                    this.timezoneDropdown.elements[0].appendChild(option);
                });

                if (typeof (this.currentTimezone) !== "undefined" && this.currentTimezone !== null && this.currentTimezone !== "") {
                    const localTzOffset = (new Date(this.hostInstance.selectedYear, this.hostInstance.selectedMonth, this.hostInstance.selectedDay, 12)).getTimezoneOffset() * -1;
                    if (localTzOffset === this.currentTimezone) {
                        setLocalTimezoneSelection(selfComponent);
                    } else {
                        this.timezoneDropdown.val(this.currentTimezone.toString());
                    }
                } else {
                    if (typeof (this.currentHour) !== "undefined" && this.currentHour !== null && this.currentHour !== "") {
                        this.timezoneDropdown.val(currentOptions.currentTimezone);
                    } else {
                        setLocalTimezoneSelection(selfComponent);
                    }
                }
                this.timezoneDropdown.change(() => {
                    selfComponent._onTimeChange();
                    selfComponent._onSelectHandler();
                });

                const buttonPanel = calendarContainer.find('.ui-datepicker-buttonpane');
                if (buttonPanel.length) {
                    buttonPanel.elements[0].before(temporalPanelElement.elements[0]);
                } else {
                    calendarContainer.elements[0].appendChild(temporalPanelElement.elements[0]);
                }

                this.timeElementContainer = temporalPanelElement.find('.ui_temporal_time');

                if (this.hostInstance !== null) {

                }
            }
        }

        _onFocus() {
            if (!this.hostInstance) {
                this.hostInstance = MockCalendar._getInst(this.associatedInput.elements[0]);
            }
            this.attachTimeControls(this.hostInstance);
        }

        _onTimeChange() {
            if (this.hourControl) this.currentHour = parseInt(this.hourControl.val(), 10);
            if (this.minuteControl) this.currentMinute = parseInt(this.minuteControl.val(), 10);
            if (this.secondControl) this.currentSecond = parseInt(this.secondControl.val(), 10);
            if (this.millisecondControl) this.currentMillisecond = parseInt(this.millisecondControl.val(), 10);
            if (this.microsecondControl) this.currentMicrosecond = parseInt(this.microsecondControl.val(), 10);
            if (this.timezoneDropdown) this.currentTimezone = parseInt(this.timezoneDropdown.val(), 10);
            
            this._updateDateTime(this.hostInstance);
        }

        _onSelectHandler() {
            if (DomQuery.isFunction(this.standardOptions.onValueSelect)) {
                const selectedDate = new Date(this.hostInstance.selectedYear, this.hostInstance.selectedMonth, this.hostInstance.selectedDay,
                    this.currentHour, this.currentMinute, this.currentSecond, this.currentMillisecond);
                this.standardOptions.onValueSelect.call(this.associatedInput.elements[0], this.formattedDateTimeString, this.hostInstance, this);
            }
        }

        _updateDateTime(parentCalendar) {
            const date = new Date(parentCalendar.selectedYear, parentCalendar.selectedMonth, parentCalendar.selectedDay,
                this.currentHour, this.currentMinute, this.currentSecond, this.currentMillisecond);
            
            this.formattedTimeString = MockCalendar.formatTime(this.standardOptions.timeDisplayFormat, {
                hour: this.currentHour,
                minute: this.currentMinute,
                second: this.currentSecond,
                millisec: this.currentMillisecond,
                microsec: this.currentMicrosecond,
                timezone: this.currentTimezone
            }, this.standardOptions);

            this.formattedDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            this.formattedDateTimeString = this.formattedDateString + this.standardOptions.fieldSeparator + this.formattedTimeString;

            if (!this.standardOptions.timeOnlyMode) {
                this.associatedInput.val(this.formattedDateTimeString);
            } else {
                this.associatedInput.val(this.formattedTimeString);
            }

            if (this.alternativeInput) {
                const altTimeFormat = this.standardOptions.altTimeDisplayFormat || this.standardOptions.timeDisplayFormat;
                const altTimeString = MockCalendar.formatTime(altTimeFormat, {
                    hour: this.currentHour,
                    minute: this.currentMinute,
                    second: this.currentSecond,
                    millisec: this.currentMillisecond,
                    microsec: this.currentMicrosecond,
                    timezone: this.currentTimezone
                }, this.standardOptions);

                if (this.standardOptions.altFieldTimeOnly) {
                    this.alternativeInput.val(altTimeString);
                } else {
                    this.alternativeInput.val(this.formattedDateString + (this.standardOptions.altFieldSeparator || this.standardOptions.fieldSeparator) + altTimeString);
                }
            }
        }

        _limitMinMaxDateTime(parentCalendar, adjustControls) {
            this.currentHour = Math.max(this.standardOptions.minHour, Math.min(this.standardOptions.maxHour, this.currentHour));
            this.currentMinute = Math.max(this.standardOptions.minMinute, Math.min(this.standardOptions.maxMinute, this.currentMinute));
            this.currentSecond = Math.max(this.standardOptions.minSecond, Math.min(this.standardOptions.maxSecond, this.currentSecond));
            this.currentMillisecond = Math.max(this.standardOptions.minMillisecond, Math.min(this.standardOptions.maxMillisecond, this.currentMillisecond));
            this.currentMicrosecond = Math.max(this.standardOptions.minMicrosecond, Math.min(this.standardOptions.maxMicrosecond, this.currentMicrosecond));

            if (this.standardOptions.minimumDateTime instanceof Date && parentCalendar) {
                const currentDate = new Date(parentCalendar.selectedYear, parentCalendar.selectedMonth, parentCalendar.selectedDay);
                if (currentDate.toDateString() === this.standardOptions.minimumDateTime.toDateString()) {
                    this.currentHour = Math.max(this.currentHour, this.standardOptions.minimumDateTime.getHours());
                    if (this.currentHour === this.standardOptions.minimumDateTime.getHours()) {
                        this.currentMinute = Math.max(this.currentMinute, this.standardOptions.minimumDateTime.getMinutes());
                    }
                }
            }
            if (this.standardOptions.maximumDateTime instanceof Date && parentCalendar) {
                const currentDate = new Date(parentCalendar.selectedYear, parentCalendar.selectedMonth, parentCalendar.selectedDay);
                if (currentDate.toDateString() === this.standardOptions.maximumDateTime.toDateString()) {
                    this.currentHour = Math.min(this.currentHour, this.standardOptions.maximumDateTime.getHours());
                    if (this.currentHour === this.standardOptions.maximumDateTime.getHours()) {
                        this.currentMinute = Math.min(this.currentMinute, this.standardOptions.maximumDateTime.getMinutes());
                    }
                }
            }

            if (adjustControls) {
                this.hourControl && this.hourControl.val(this.currentHour);
                this.minuteControl && this.minuteControl.val(this.currentMinute);
                this.secondControl && this.secondControl.val(this.currentSecond);
                this.millisecondControl && this.millisecondControl.val(this.currentMillisecond);
                this.microsecondControl && this.microsecondControl.val(this.currentMicrosecond);
            }
        }
    }

    rootContext.TimeComponentManager.log = (msg) => console.log(msg);
    rootContext.TimeComponentManager.instance = new TemporalPanel();

})(window);