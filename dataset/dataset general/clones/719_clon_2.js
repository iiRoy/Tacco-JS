// This is a comprehensive date/time utility.
// The `timeFlow.Chronos` object provides robust timezone handling,
// independent of the user's local machine settings. It leverages
// the well-known Olson zoneinfo data.
//
// Its constructor and mutator methods internally utilize proxy JavaScript
// `Date` objects, allowing direct use of date strings like '12/25/2023'.
// It also inherits the intuitive rollover behavior for numeric parameters
// (e.g., setting a month value of 14 will correctly advance to the
// subsequent February).
//
// A key distinction from the built-in JavaScript `Date` object is that
// `timeFlow.Chronos` includes named properties for its year, month, day, etc.,
// components. This design facilitates direct JSON serialization, making it
// ideal for data exchange.

/*
 * Copyright 2010 Matthew Eernisse (mde@fleegix.org)
 * and Open Source Applications Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Acknowledgements: Concepts borrowed from an incomplete JS implementation
 * of Olson parser, "XMLDAte" by Philippe Goetz (philippe.goetz@wanadoo.fr)
 *
 * Collaborators:
 * Jan Niehusmann
 * Ricky Romero
 * Preston Hunt (prestonhunt@gmail.com)
 * Dov. B Katz (dov.katz@morganstanley.com)
 * Peter Bergström (pbergstr@mac.com)
 * Long Ho
 */
(function() {

    // Initial setup to ensure the library functions in both
    // browser and Node.js environments.
    var globalScope = this;

    var timeFlow;
    if (typeof exportModule !== 'undefined') {
        timeFlow = exportModule;
    } else {
        timeFlow = globalScope.timeFlow = {};
    }

    timeFlow.APP_VERSION = '1.0.0';

    // Retrieve an AJAX utility library from the global context.
    // This could be jQuery, Zepto, or fleegix.
    // Alternatively, you can define your own data fetching method
    // by assigning it to `timeFlow.timer.dataFetcher`.
    var jqUtil = globalScope.$ || globalScope.jqLib || globalScope.ztLib,
        flexiLib = globalScope.flexiLib;

    // Define constant arrays for days of the week and calendar months.
    // Note: Olson data is English-centric, limiting i18n for these.
    var WeekDays = timeFlow.WeekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        CalendarMonths = timeFlow.CalendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Helper function to format a numeric value with leading zeros
    // to achieve a specific `targetLength`.
    // Example: `padNumber(2, 2)` results in '02'.
    // Example: `padNumber(1998, 2)` results in '98'.
    var padNumber = function(numVal, targetLength) {
        if (typeof numVal !== "number") {
            throw "Input is not a number: " + numVal;
        }
        var strVal = numVal.toString();
        if (strVal.length > targetLength) {
            return strVal.substring(strVal.length - targetLength, strVal.length);
        }
        while (strVal.length < targetLength) {
            strVal = '0' + strVal;
        }
        return strVal;
    };

    // An abstraction layer for various data fetching mechanisms,
    // including fleegix, jQuery, and Zepto.
    //
    // The `requestOptions` object may include:
    // - `resourceURL`: The URL for the AJAX request.
    // - `isAsync`: `true` for asynchronous, `false` for synchronous.
    //   If `false`, the return value will be the response from the URL.
    //   Defaults to `true`.
    // - `onSuccess`: Callback function for successful requests.
    // - `onError`: Callback function for error conditions.
    //
    // Returns the response data if `isAsync` is `false`, otherwise returns
    // the AJAX request object itself.
    var dataFetcher = function(requestOptions) {
        if ((!flexiLib || typeof flexiLib.xhr === 'undefined') && (!jqUtil || typeof jqUtil.ajax === 'undefined')) {
            throw new Error('Please integrate the Flexi.js XHR module, jQuery AJAX, Zepto AJAX, or define a custom transport for acquiring zone data files.');
        }
        if (!requestOptions) return;
        if (!requestOptions.resourceURL) throw new Error('A resource URL must be provided.');
        if (!('isAsync' in requestOptions)) requestOptions.isAsync = true;
        if (!requestOptions.isAsync) {
            return flexiLib && flexiLib.xhr ?
                flexiLib.xhr.doReq({
                    url: requestOptions.resourceURL,
                    async: false
                }) :
                jqUtil.ajax({
                    url: requestOptions.resourceURL,
                    async: false
                }).responseText;
        }
        return flexiLib && flexiLib.xhr ?
            flexiLib.xhr.send({
                url: requestOptions.resourceURL,
                method: 'get',
                handleSuccess: requestOptions.onSuccess,
                handleErr: requestOptions.onError
            }) :
            jqUtil.ajax({
                url: requestOptions.resourceURL,
                method: 'GET',
                error: requestOptions.onError,
                success: requestOptions.onSuccess
            });
    };

    // The primary constructor for `timeFlow.Chronos`, mimicking the native
    // `Date` object's constructor patterns.
    timeFlow.Chronos = function() {
        var inputArguments = Array.prototype.slice.apply(arguments),
            dateTimeObj = null,
            timeZoneId = null,
            componentArray = [];

        // This constructor supports several patterns, including all native `Date`
        // object forms, with an optional timezone string appended.
        //
        // - `[timeZoneId]`: Creates an object representing the current time in the specified `timeZoneId`.
        // - `utcMillis`, `[timeZoneId]`: Creates an object with a UTC time equal to `utcMillis`, in `timeZoneId`.
        // - `Date`, `[timeZoneId]`: Creates an object with a UTC time equal to `Date.getTime()`, in `timeZoneId`.
        // - `year, month, [dayOfMonth,] [clockHours,] [clockMinutes,] [clockSeconds,] [clockMilliseconds,] [timeZoneId]`:
        //   Similar to the `Date` object constructor, but with a `timeZoneId`.
        // - `Array`: Can be any combination of the above patterns.
        //
        // If the first argument is an array, it's treated as the full list of arguments.
        if (Object.prototype.toString.call(inputArguments[0]) === '[object Array]') {
            inputArguments = inputArguments[0];
        }
        // Check for a timezone identifier string at the end of the arguments.
        if (typeof inputArguments[inputArguments.length - 1] === 'string' && /^[a-zA-Z]+\//gi.test(inputArguments[inputArguments.length - 1])) {
            timeZoneId = inputArguments.pop();
        }

        switch (inputArguments.length) {
            case 0:
                // No arguments, create a date for the current moment.
                dateTimeObj = new Date();
                break;
            case 1:
                // Single argument: milliseconds or a date string.
                dateTimeObj = new Date(inputArguments[0]);
                break;
            default:
                // Multiple arguments: year, month, etc.
                for (var i = 0; i < 7; i++) {
                    componentArray[i] = inputArguments[i] || 0;
                }
                dateTimeObj = new Date(componentArray[0], componentArray[1], componentArray[2], componentArray[3], componentArray[4], componentArray[5], componentArray[6]);
                break;
        }

        this._fetchTimeComponents = function() {
            return [this.fullYear, this.calendarMonth, this.dayOfMonth, this.clockHours, this.clockMinutes, this.clockSeconds, this.clockMilliseconds, this.zoneIdentifier];
        };

        this._cacheActive = false;
        this._zoneDetails = {};
        this._dayOfWeek = 0;
        this.fullYear = 0;
        this.calendarMonth = 0;
        this.dayOfMonth = 0;
        this.clockHours = 0;
        this.clockMinutes = 0;
        this.clockSeconds = 0;
        this.clockMilliseconds = 0;
        this.zoneIdentifier = timeZoneId || null;
        this.isUTCMode = timeZoneId === 'Etc/UTC' || timeZoneId === 'Etc/GMT';

        // Important: For cases with 1 or 2 arguments like `timeFlow.Chronos(millis, [tz])`
        // or `timeFlow.Chronos(Date, [tz])`, the `dateTimeObj` should initially be in UTC.
        // This is detected by checking if `componentArray` is empty and `timeZoneId` is present.
        // If `timeZoneId` is absent, `dateTimeObj` might be in local time.
        this.initFromNativeDate(dateTimeObj, !componentArray.length && timeZoneId);
    };

    // Implements a majority of the native Date object's functionality.
    timeFlow.Chronos.prototype = {

        getDayOfMonth: function() {
            return this.dayOfMonth;
        },
        getDayOfWeek: function() {
            return this._dayOfWeek;
        },
        getYearValue: function() {
            return this.fullYear;
        },
        getMonthValue: function() {
            return this.calendarMonth;
        },
        getYearValueLegacy: function() {
            return this.fullYear;
        }, // This seems like a bug in original, setYear is UTC, setFullYear is local
        getHourValue: function() {
            return this.clockHours;
        },
        getMillisecondValue: function() {
            return this.clockMilliseconds;
        },
        getMinuteValue: function() {
            return this.clockMinutes;
        },
        getSecondValue: function() {
            return this.clockSeconds;
        },

        // Retrieves the total milliseconds, adjusted for the user-specified timezone.
        getTotalMilliseconds: function() {
            var nativeTime = Date.UTC.apply(globalScope, this._fetchTimeComponents());
            return nativeTime + (this.getZoneOffsetMinutes() * 60 * 1000);
        },
        getZoneIdentifier: function() {
            return this.zoneIdentifier;
        },
        getZoneOffsetMinutes: function() {
            return this.getZoneInformation().tzOffset;
        },
        getZoneAbbreviation: function() {
            return this.getZoneInformation().tzAbbr;
        },
        getZoneInformation: function() {
            // If in UTC mode, the information is straightforward.
            if (this.isUTCMode) return {
                tzOffset: 0,
                tzAbbr: 'UTC'
            };
            if (this._cacheActive) return this._zoneDetails;

            var zoneResult;
            // If a specific timezone is set, retrieve the appropriate info
            // based on the current date/time.
            if (this.zoneIdentifier) {
                var tempDate = new Date(Date.UTC.apply(globalScope, this._fetchTimeComponents()));
                var currentZone = this.zoneIdentifier;
                zoneResult = timeFlow.timer.getTzInfo(tempDate, currentZone);
            }
            // If no timezone is specified, use the local browser's offset.
            else {
                zoneResult = {
                    tzOffset: this.getSystemLocalOffset(),
                    tzAbbr: null
                };
            }
            this._zoneDetails = zoneResult;
            this._cacheActive = true;
            return zoneResult;
        },

        getUTCDateValue: function() {
            return this.getUTCNativeDateProxy().getUTCDate();
        },
        getUTCDayOfWeek: function() {
            return this.getUTCNativeDateProxy().getUTCDay();
        },
        getUTCYearValue: function() {
            return this.getUTCNativeDateProxy().getUTCFullYear();
        },
        getUTCHourValue: function() {
            return this.getUTCNativeDateProxy().getUTCHours();
        },
        getUTCMillisecondValue: function() {
            return this.getUTCNativeDateProxy().getUTCMilliseconds();
        },
        getUTCMinuteValue: function() {
            return this.getUTCNativeDateProxy().getUTCMinutes();
        },
        getUTCMonthValue: function() {
            return this.getUTCNativeDateProxy().getUTCMonth();
        },
        getUTCSecondValue: function() {
            return this.getUTCNativeDateProxy().getUTCSeconds();
        },

        setDayOfMonth: function(newValue) {
            this.setLocalAttribute('dayOfMonth', newValue);
        },
        setYearValue: function(newValue) {
            this.setLocalAttribute('fullYear', newValue);
        },
        setMonthValue: function(newValue) {
            this.setLocalAttribute('calendarMonth', newValue);
        },
        setYearValueLegacy: function(newValue) {
            this.setUTCAttribute('fullYear', newValue);
        }, // This seems like a bug in original, setYear is UTC, setFullYear is local
        setHourValue: function(newValue) {
            this.setLocalAttribute('clockHours', newValue);
        },
        setMillisecondValue: function(newValue) {
            this.setLocalAttribute('clockMilliseconds', newValue);
        },
        setMinuteValue: function(newValue) {
            this.setLocalAttribute('clockMinutes', newValue);
        },
        setSecondValue: function(newValue) {
            this.setLocalAttribute('clockSeconds', newValue);
        },
        setTotalMilliseconds: function(newValue) {
            if (isNaN(newValue)) {
                throw new Error('Input value must be a numeric type.');
            }
            var tempDate = new Date(0);
            tempDate.setUTCMilliseconds(newValue - (this.getZoneOffsetMinutes() * 60 * 1000));
            this.initFromNativeDate(tempDate, !0);
        },

        setUTCDayOfMonth: function(newValue) {
            this.setUTCAttribute('dayOfMonth', newValue);
        },
        setUTCYearValue: function(newValue) {
            this.setUTCAttribute('fullYear', newValue);
        },
        setUTCHourValue: function(newValue) {
            this.setUTCAttribute('clockHours', newValue);
        },
        setUTCMillisecondValue: function(newValue) {
            this.setUTCAttribute('clockMilliseconds', newValue);
        },
        setUTCMinuteValue: function(newValue) {
            this.setUTCAttribute('clockMinutes', newValue);
        },
        setUTCMonthValue: function(newValue) {
            this.setUTCAttribute('calendarMonth', newValue);
        },
        setUTCSecondValue: function(newValue) {
            this.setUTCAttribute('clockSeconds', newValue);
        },

        toGlobalTimeString: function() {
            return this.toFormattedString('EEE, dd MMM yyyy HH:mm:ss Z', 'Etc/GMT');
        },
        toLocalFormattedString: function() {},
        toLocalFormattedDate: function() {},
        toLocalFormattedTime: function() {},
        toSourceCode: function() {},

        toISODateString: function() {
            return this.toFormattedString('yyyy-MM-ddTHH:mm:ss.SSS', 'Etc/UTC') + 'Z';
        },
        toSerializedJSON: function() {
            return this.toISODateString();
        },

        // Generates a formatted date string based on the provided `outputFormat`.
        // If no `outputFormat` is given, it defaults to an ISO-like string.
        // An optional `targetZone` can be provided to format the date in a different timezone.
        toFormattedString: function(outputFormat, targetZone) {
            // Default format mimics ISO string.
            if (!outputFormat) return this.toFormattedString('yyyy-MM-dd HH:mm:ss');
            var formattedResult = outputFormat;
            var zoneInfoData = targetZone ? timeFlow.timer.getTzInfo(new Date(this.getTotalMilliseconds()), targetZone) : this.getZoneInformation();
            var currentInstance = this;

            // If a `targetZone` is specified, create a temporary clone
            // and adjust its timezone for formatting.
            if (targetZone) {
                currentInstance = this.createCopy();
                currentInstance.setTimezone(targetZone);
            }

            var currentHours = currentInstance.getHourValue();

            return formattedResult
                // Replace "a" tokens (used as a temporary placeholder to avoid conflict with "M" for month)
                .replace(/a+/g, function() {
                    return 'k';
                })
                // `y`: Full year
                .replace(/y+/g, function(token) {
                    return padNumber(currentInstance.getYearValue(), token.length);
                })
                // `d`: Day of the month
                .replace(/d+/g, function(token) {
                    return padNumber(currentInstance.getDayOfMonth(), token.length);
                })
                // `m`: Minute of the hour
                .replace(/m+/g, function(token) {
                    return padNumber(currentInstance.getMinuteValue(), token.length);
                })
                // `s`: Second of the minute
                .replace(/s+/g, function(token) {
                    return padNumber(currentInstance.getSecondValue(), token.length);
                })
                // `S`: Millisecond
                .replace(/S+/g, function(token) {
                    return padNumber(currentInstance.getMillisecondValue(), token.length);
                })
                // `M`: Calendar month. `MM` is numeric (e.g., '02' for February),
                // `MMM` is abbreviated text (e.g., 'Feb'), `MMMM` is full text (e.g., 'February').
                .replace(/M+/g, function(token) {
                    var currentMonth = currentInstance.getMonthValue(),
                        tokenLength = token.length;
                    if (tokenLength > 3) {
                        return timeFlow.CalendarMonths[currentMonth];
                    } else if (tokenLength > 2) {
                        return timeFlow.CalendarMonths[currentMonth].substring(0, tokenLength);
                    }
                    return padNumber(currentMonth + 1, tokenLength);
                })
                // `k`: AM/PM indicator
                .replace(/k+/g, function() {
                    if (currentHours >= 12) {
                        if (currentHours > 12) {
                            currentHours -= 12;
                        }
                        return 'PM';
                    }
                    return 'AM';
                })
                // `H`: Hour of the day (0-23)
                .replace(/H+/g, function(token) {
                    return padNumber(currentHours, token.length);
                })
                // `E`: Day of the week
                .replace(/E+/g, function(token) {
                    return timeFlow.WeekDays[currentInstance.getDayOfWeek()].substring(0, token.length);
                })
                // `Z`: Timezone abbreviation
                .replace(/Z+/gi, function() {
                    return zoneInfoData.tzAbbr;
                });
        },

        toUTCTimeString: function() {
            return this.toGlobalTimeString();
        },
        getValueOf: function() {
            return this.getTotalMilliseconds();
        },

        // Creates a deep copy of the current Chronos object.
        createCopy: function() {
            return new timeFlow.Chronos(this._fetchTimeComponents());
        },

        // Initializes the Chronos object's internal components from a native Date object.
        // If `isUTCSource` is true, the native Date object's UTC getters are used.
        initFromNativeDate: function(nativeDateObj, isUTCSource) {
            this.fullYear = isUTCSource ? nativeDateObj.getUTCFullYear() : nativeDateObj.getFullYear();
            this.calendarMonth = isUTCSource ? nativeDateObj.getUTCMonth() : nativeDateObj.getMonth();
            this.dayOfMonth = isUTCSource ? nativeDateObj.getUTCDate() : nativeDateObj.getDate();
            this.clockHours = isUTCSource ? nativeDateObj.getUTCHours() : nativeDateObj.getHours();
            this.clockMinutes = isUTCSource ? nativeDateObj.getUTCMinutes() : nativeDateObj.getMinutes();
            this.clockSeconds = isUTCSource ? nativeDateObj.getUTCSeconds() : nativeDateObj.getSeconds();
            this.clockMilliseconds = isUTCSource ? nativeDateObj.getUTCMilliseconds() : nativeDateObj.getMilliseconds();
            this._dayOfWeek = isUTCSource ? nativeDateObj.getUTCDay() : nativeDateObj.getDay();
            this._nativeDateProxy = nativeDateObj;
            this._cacheActive = false;
        },

        // Returns a native Date object representing the current Chronos object's
        // UTC time, with the timezone offset applied.
        getUTCNativeDateProxy: function() {
            var tempDate = new Date(Date.UTC.apply(globalScope, this._fetchTimeComponents()));
            tempDate.setUTCMinutes(tempDate.getUTCMinutes() + this.getZoneOffsetMinutes());
            return tempDate;
        },

        // Sets a specific local time unit (e.g., 'fullYear', 'calendarMonth').
        setLocalAttribute: function(timeUnit, newValue) {
            if (isNaN(newValue)) {
                throw new Error('Input value for unit must be a number.');
            }
            var proxyDate = this._nativeDateProxy;
            var methodSuffix = timeUnit === 'fullYear' ? 'FullYear' : timeUnit.substring(0, 1).toUpperCase() + timeUnit.substring(1);
            proxyDate['set' + methodSuffix](newValue);
            this.initFromNativeDate(proxyDate);
        },

        // Sets a specific UTC time unit (e.g., 'fullYear', 'calendarMonth').
        setUTCAttribute: function(timeUnit, newValue) {
            if (isNaN(newValue)) {
                throw new Error('Input value for unit must be a number.');
            }
            var methodSuffix = timeUnit === 'fullYear' ? 'FullYear' : timeUnit.substring(0, 1).toUpperCase() + timeUnit.substring(1);
            var tempDate = this.getUTCNativeDateProxy();
            tempDate['setUTC' + methodSuffix](newValue);
            tempDate.setUTCMinutes(tempDate.getUTCMinutes() - this.getZoneOffsetMinutes());
            this.initFromNativeDate(tempDate, true);
        },

        // Changes the timezone of the Chronos object.
        setTimezone: function(newZoneId) {
            var priorOffset = this.getZoneInformation().tzOffset;

            this.isUTCMode = newZoneId === 'Etc/UTC' || newZoneId === 'Etc/GMT';
            this.zoneIdentifier = newZoneId;
            this._cacheActive = false;

            // Create a temporary copy and adjust its UTC minutes
            // by the delta between the old and new timezone offsets.
            var currentInstance = this.createCopy();
            currentInstance.setUTCMinuteValue(currentInstance.getUTCMinuteValue() - this.getZoneInformation().tzOffset + priorOffset);
            this.initFromNativeDate(currentInstance, this.isUTCMode);
        },

        // Removes any specified timezone, reverting to local time behavior.
        removeTimezone: function() {
            this.isUTCMode = false;
            this.zoneIdentifier = null;
            this._cacheActive = false;
        },

        // Calculates the Julian Day Number for a given civil date.
        calculateJulianDay: function(inputYear, inputMonth, inputDay) {
            var tempValA;
            // Adjust month for 1-based astronomical calculation.
            inputMonth++;
            if (inputMonth > 12) {
                tempValA = parseInt(inputMonth / 12, 10);
                inputMonth = inputMonth % 12;
                inputYear += tempValA;
            }
            if (inputMonth <= 2) {
                inputYear -= 1;
                inputMonth += 12;
            }
            tempValA = Math.floor(inputYear / 100);
            var tempValB = 2 - tempValA + Math.floor(tempValA / 4),
                julianDayNum = Math.floor(365.25 * (inputYear + 4716)) + Math.floor(30.6001 * (inputMonth + 1)) + inputDay + tempValB - 1524;
            return julianDayNum;
        },

        // Retrieves the local timezone offset from the underlying native Date proxy.
        getSystemLocalOffset: function() {
            return this._nativeDateProxy.getTimezoneOffset();
        }
    };


    timeFlow.timer = new function() {
        var zoneManager = this,
            monthIndexMap = {},
            dayIndexMap = {},
            geoAreaMap = {
                'EST': 'northamerica',
                'MST': 'northamerica',
                'HST': 'northamerica',
                'EST5EDT': 'northamerica',
                'CST6CDT': 'northamerica',
                'MST7MDT': 'northamerica',
                'PST8PDT': 'northamerica',
                'America': 'northamerica',
                'Pacific': 'australasia',
                'Atlantic': 'europe',
                'Africa': 'africa',
                'Indian': 'africa',
                'Antarctica': 'antarctica',
                'Asia': 'asia',
                'Australia': 'australasia',
                'Europe': 'europe',
                'WET': 'europe',
                'CET': 'europe',
                'MET': 'europe',
                'EET': 'europe'
            },
            geoAreaExceptions = {
                'Etc/GMT': 'etcetera',
                'Etc/UTC': 'etcetera',
                'Pacific/Honolulu': 'northamerica',
                'Atlantic/Bermuda': 'northamerica',
                'Atlantic/Cape_Verde': 'africa',
                'Atlantic/St_Helena': 'africa',
                'Indian/Kerguelen': 'antarctica',
                'Indian/Chagos': 'asia',
                'Indian/Maldives': 'asia',
                'Indian/Christmas': 'australasia',
                'Indian/Cocos': 'australasia',
                'America/Danmarkshavn': 'europe',
                'America/Scoresbysund': 'europe',
                'America/Godthab': 'europe',
                'America/Thule': 'europe',
                'Asia/Yekaterinburg': 'europe',
                'Asia/Omsk': 'europe',
                'Asia/Novosibirsk': 'europe',
                'Asia/Krasnoyarsk': 'europe',
                'Asia/Irkutsk': 'europe',
                'Asia/Yakutsk': 'europe',
                'Asia/Vladivostok': 'europe',
                'Asia/Sakhalin': 'europe',
                'Asia/Magadan': 'europe',
                'Asia/Kamchatka': 'europe',
                'Asia/Anadyr': 'europe',
                'Africa/Ceuta': 'europe',
                'America/Argentina/Buenos_Aires': 'southamerica',
                'America/Argentina/Cordoba': 'southamerica',
                'America/Argentina/Tucuman': 'southamerica',
                'America/Argentina/La_Rioja': 'southamerica',
                'America/Argentina/San_Juan': 'southamerica',
                'America/Argentina/Jujuy': 'southamerica',
                'America/Argentina/Catamarca': 'southamerica',
                'America/Argentina/Mendoza': 'southamerica',
                'America/Argentina/Rio_Gallegos': 'southamerica',
                'America/Argentina/Ushuaia': 'southamerica',
                'America/Aruba': 'southamerica',
                'America/La_Paz': 'southamerica',
                'America/Noronha': 'southamerica',
                'America/Belem': 'southamerica',
                'America/Fortaleza': 'southamerica',
                'America/Recife': 'southamerica',
                'America/Araguaina': 'southamerica',
                'America/Maceio': 'southamerica',
                'America/Bahia': 'southamerica',
                'America/Sao_Paulo': 'southamerica',
                'America/Campo_Grande': 'southamerica',
                'America/Cuiaba': 'southamerica',
                'America/Porto_Velho': 'southamerica',
                'America/Boa_Vista': 'southamerica',
                'America/Manaus': 'southamerica',
                'America/Eirunepe': 'southamerica',
                'America/Rio_Branco': 'southamerica',
                'America/Santiago': 'southamerica',
                'Pacific/Easter': 'southamerica',
                'America/Bogota': 'southamerica',
                'America/Curacao': 'southamerica',
                'America/Guayaquil': 'southamerica',
                'Pacific/Galapagos': 'southamerica',
                'Atlantic/Stanley': 'southamerica',
                'America/Cayenne': 'southamerica',
                'America/Guyana': 'southamerica',
                'America/Asuncion': 'southamerica',
                'America/Lima': 'southamerica',
                'Atlantic/South_Georgia': 'southamerica',
                'America/Paramaribo': 'southamerica',
                'America/Port_of_Spain': 'southamerica',
                'America/Montevideo': 'southamerica',
                'America/Caracas': 'southamerica'
            };

        // Populate `monthIndexMap`: `{ 'jan': 0, 'feb': 1, ... }`
        for (var i = 0; i < CalendarMonths.length; i++) {
            monthIndexMap[CalendarMonths[i].substring(0, 3).toLowerCase()] = i;
        }

        // Populate `dayIndexMap`: `{ 'sun': 0, 'mon': 1, ... }`
        for (i = 0; i < WeekDays.length; i++) {
            dayIndexMap[WeekDays[i].substring(0, 3).toLowerCase()] = i;
        }

        function throwInvalidZoneError(zoneKey) {
            throw new Error('Timezone "' + zoneKey + '" is either unrecognized or not registered in the system.');
        }

        function loadInternalZoneFile(fileIdentity, requestOptions) {
            var fullURL = zoneManager.zoneDataLocation + '/' + fileIdentity;
            return !requestOptions || !requestOptions.isAsync ?
                zoneManager.interpretZoneData(zoneManager.dataFetcher({
                    resourceURL: fullURL,
                    isAsync: false
                })) :
                zoneManager.dataFetcher({
                    isAsync: true,
                    resourceURL: fullURL,
                    onSuccess: function(fileContent) {
                        if (zoneManager.interpretZoneData(fileContent) && typeof requestOptions.callback === 'function') {
                            requestOptions.callback();
                        }
                        return true;
                    },
                    onError: function() {
                        throw new Error('Failed to retrieve zone information file: "' + fullURL + '"');
                    }
                });
        }

        function determineZoneRegion(zoneKey) {
            var exceptionEntry = geoAreaExceptions[zoneKey],
                regionPart,
                resultRegion;
            if (exceptionEntry) return exceptionEntry;

            regionPart = zoneKey.split('/')[0];
            resultRegion = geoAreaMap[regionPart];

            // If no region found for the main part, check for 'backward' links.
            if (resultRegion) return resultRegion;

            var zoneLink = zoneManager.zones[zoneKey];
            if (typeof zoneLink === 'string') {
                return determineZoneRegion(zoneLink);
            }

            // If 'backward' compatibility file hasn't loaded, try loading it.
            if (!zoneManager.cachedZones.backward) {
                zoneManager.loadZoneFile('backward');
                return determineZoneRegion(zoneKey);
            }
            throwInvalidZoneError(zoneKey);
        }

        function parseTimeStr(timeString) {
            var timePattern = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
            var hmsComponents = timeString.match(timePattern);
            hmsComponents[1] = parseInt(hmsComponents[1], 10);
            hmsComponents[2] = hmsComponents[2] ? parseInt(hmsComponents[2], 10) : 0;
            hmsComponents[3] = hmsComponents[3] ? parseInt(hmsComponents[3], 10) : 0;
            return hmsComponents;
        }

        function retrieveZoneEntry(dateTimeObj, zoneKey) {
            var currentZoneId = zoneKey;
            var zoneRecords = zoneManager.zones[currentZoneId];

            // Follow any links to reach the actual zone definition.
            while (typeof zoneRecords === "string") {
                currentZoneId = zoneRecords;
                zoneRecords = zoneManager.zones[currentZoneId];
            }

            if (!zoneRecords) {
                // If 'backward' compatibility file isn't loaded, try to load it.
                if (!zoneManager.cachedZones.backward) {
                    // This handles legacy zone entries (e.g., "America/Fort_Wayne")
                    // that `determineZoneRegion` might incorrectly assume have a region
                    // file (e.g., "America/" -> 'northamerica'), but actually require
                    // the 'backward' file for their definition.
                    zoneManager.loadZoneFile('backward');
                    return retrieveZoneEntry(dateTimeObj, zoneKey);
                }
                throwInvalidZoneError(currentZoneId);
            }

            for (var i = 0; i < zoneRecords.length; i++) {
                var currentZoneRecord = zoneRecords[i];
                if (!currentZoneRecord[3]) {
                    break;
                } // No until year, so this is the last applicable rule.

                var recordYear = parseInt(currentZoneRecord[3], 10);
                var recordMonth = 11; // Default to December
                var recordDay = 31; // Default to 31st

                if (currentZoneRecord[4]) {
                    recordMonth = monthIndexMap[currentZoneRecord[4].substring(0, 3).toLowerCase()];
                    recordDay = parseInt(currentZoneRecord[5], 10);
                }

                var timeComponents = parseTimeStr(currentZoneRecord[6] ? currentZoneRecord[6] : '23:59:59');
                var comparisonDate = Date.UTC(recordYear, recordMonth, recordDay, timeComponents[1], timeComponents[2], timeComponents[3]);

                if (dateTimeObj.getTime() < comparisonDate) {
                    break;
                }
            }

            if (i === zoneRecords.length) {
                throw new Error('No valid zone definition found for "' + zoneKey + '" at ' + dateTimeObj);
            }
            return zoneRecords[i];

        }

        function computeBaseOffset(currentZoneRecord) {
            var offsetComponents = parseTimeStr(currentZoneRecord[0]),
                signAdjust = currentZoneRecord[0].indexOf('-') === 0 ? -1 : 1;
            offsetComponents = signAdjust * (((offsetComponents[1] * 60 + offsetComponents[2]) * 60 + offsetComponents[3]) * 1000);
            return -offsetComponents / 60 / 1000;
        }

        // If `isUTC` is true, the `dateTimeObj` is assumed to be in UTC.
        // Otherwise, `dateTimeObj.getUTC*()` methods will return local time components.
    };

}) ();