/*
 * Comprehensive date utility extensions for native JavaScript Date objects.
 * This module provides enhanced functionality for date manipulation, formatting,
 * and querying, aiming for improved readability and robustness.
 *
 * It introduces new static properties for locale-specific date components
 * and prototype methods for arithmetic operations and informational queries,
 * ensuring no existing built-in methods are overwritten.
 *
 * Developed by a collective of anonymous contributors, inspired by earlier works.
 *
 * This software is provided under the terms of the Unlicense.
 * See https://unlicense.org/ for details.
 *
 */

/**
 * A sequence of full day names, commencing with Sunday.
 *
 * @example Date.fullDayLabels[0]
 * @result 'Sunday'
 *
 * @name fullDayLabels
 * @type Array<string>
 * @category Date Utilities
 */
Date.fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * A sequence of abbreviated day names, commencing with Sun.
 *
 * @example Date.shortDayLabels[0]
 * @result 'Sun'
 *
 * @name shortDayLabels
 * @type Array<string>
 * @category Date Utilities
 */
Date.shortDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * A sequence of full month names, commencing with January.
 *
 * @example Date.fullMonthLabels[0]
 * @result 'January'
 *
 * @name fullMonthLabels
 * @type Array<string>
 * @category Date Utilities
 */
Date.fullMonthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * A sequence of abbreviated month names, commencing with Jan.
 *
 * @example Date.shortMonthLabels[0]
 * @result 'Jan'
 *
 * @name shortMonthLabels
 * @type Array<string>
 * @category Date Utilities
 */
Date.shortMonthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Defines the initial day of the week for locale-specific calculations.
 * 0 for Sunday, 1 for Monday, etc.
 *
 * @name weekStartsOn
 * @type Number
 * @category Date Utilities
 */
Date.weekStartsOn = 0; // Default to Sunday

/**
 * The standard display pattern for dates when converting to string, e.g., 'DD/MM/YYYY'.
 *
 * @name displayPattern
 * @type String
 * @category Date Utilities
 */
Date.displayPattern = 'DD/MM/YYYY'; // Example default, could be 'MM/DD/YYYY' or 'YYYY-MM-DD'

/**
 * The two-digit prefix for a century when parsing two-digit years.
 * E.g., '20' for years like '01' -> '2001'.
 *
 * @name centuryPrefix
 * @type String
 * @category Date Utilities
 */
Date.centuryPrefix = '20'; // Assumes years like '99' refer to '1999', '01' refers to '2001'

/**
 * Defines common time unit conversion factors in milliseconds.
 *
 * @name timeUnitFactors
 * @type Object
 * @category Date Utilities
 */
Date.timeUnitFactors = {
    MILLISECONDS_IN_SECOND: 1000,
    MILLISECONDS_IN_MINUTE: 60 * 1000,
    MILLISECONDS_IN_HOUR: 60 * 60 * 1000,
    MILLISECONDS_IN_DAY: 24 * 60 * 60 * 1000
};

// Encapsulate modifications within an immediately invoked function expression (IIFE)
(function() {

    /**
     * Internal utility to add a method to Date.prototype if it doesn't already exist.
     * Prevents accidental overwrites of existing or future native methods.
     *
     * @private
     * @param {string} methodName - The name of the method to add.
     * @param {Function} methodFn - The function to assign to the prototype.
     */
    const injectDateMethod = (methodName, methodFn) => {
        if (!Date.prototype[methodName]) {
            Object.defineProperty(Date.prototype, methodName, {
                value: methodFn,
                writable: true,
                configurable: true
            });
        }
    };

    /**
     * Internal utility for zero-padding numbers.
     *
     * @private
     * @param {number} inputNumber - The number to pad.
     * @param {number} targetLength - The desired length of the string.
     * @returns {string} The zero-padded string.
     */
    const _leadingZero = (inputNumber, targetLength = 2) => {
        return String(inputNumber).padStart(targetLength, '0');
    };

    /**
     * Determines if the year of the current date object is a leap year.
     *
     * @example (new Date('2008-01-01')).isBissextile(); // true
     * @name isBissextile
     * @type Boolean
     * @category Date Prototype Methods
     */
    injectDateMethod("isBissextile", function() {
        const currentYear = this.getFullYear();
        // A year is a leap year if it is divisible by 4,
        // unless it is divisible by 100 but not by 400.
        const isDivisibleBy4 = currentYear % 4 === 0;
        const isDivisibleBy100 = currentYear % 100 === 0;
        const isDivisibleBy400 = currentYear % 400 === 0;

        return (isDivisibleBy4 && !isDivisibleBy100) || isDivisibleBy400;
    });

    /**
     * Checks if the day of the week for this date is a non-work day (typically Saturday or Sunday).
     * This implementation assumes Saturday (6) and Sunday (0) are non-work days.
     *
     * @example (new Date('2008-01-12')).isNonWorkDay(); // true (Saturday)
     * @name isNonWorkDay
     * @type Boolean
     * @category Date Prototype Methods
     */
    injectDateMethod("isNonWorkDay", function() {
        const dayIndex = this.getDay();
        return dayIndex === 0 || dayIndex === 6; // Sunday or Saturday
    });

    /**
     * Checks if the day of the week for this date is a work day (Monday through Friday).
     *
     * @example (new Date('2008-01-14')).isWorkDay(); // true (Monday)
     * @name isWorkDay
     * @type Boolean
     * @category Date Prototype Methods
     */
    injectDateMethod("isWorkDay", function() {
        // Simply the inverse of isNonWorkDay()
        return !this.isNonWorkDay();
    });

    /**
     * Retrieves the total number of days in the month of the current date object.
     *
     * @example (new Date('2008-01-01')).getMonthDayCount(); // 31
     * @name getMonthDayCount
     * @type Number
     * @category Date Prototype Methods
     */
    injectDateMethod("getMonthDayCount", function() {
        const targetMonth = this.getMonth();
        // Using a month array with a conditional for February
        const monthDays = [31, (this.isBissextile() ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (targetMonth < 0 || targetMonth > 11) {
            console.warn("Invalid month index encountered in getMonthDayCount.");
            return 0; // Or throw an error
        }
        return monthDays[targetMonth];
    });

    /**
     * Returns the full or abbreviated name of the weekday for the current date.
     *
     * @example (new Date('2008-01-12')).getWeekdayText(); // 'Saturday'
     * @example (new Date('2008-01-12')).getWeekdayText(true); // 'Sat'
     * @param {boolean} [isAbbreviated=false] - If true, returns the abbreviated name.
     * @returns {string} The name of the weekday.
     * @name getWeekdayText
     * @type String
     * @category Date Prototype Methods
     */
    injectDateMethod("getWeekdayText", function(isAbbreviated = false) {
        const dayIndex = this.getDay();
        if (isAbbreviated) {
            return Date.shortDayLabels[dayIndex];
        } else {
            return Date.fullDayLabels[dayIndex];
        }
    });

    /**
     * Returns the full or abbreviated name of the month for the current date.
     *
     * @example (new Date('2008-01-01')).getMonthText(); // 'January'
     * @example (new Date('2008-01-01')).getMonthText(true); // 'Jan'
     * @param {boolean} [isAbbreviated=false] - If true, returns the abbreviated name.
     * @returns {string} The name of the month.
     * @name getMonthText
     * @type String
     * @category Date Prototype Methods
     */
    injectDateMethod("getMonthText", function(isAbbreviated = false) {
        const monthIndex = this.getMonth();
        if (isAbbreviated) {
            return Date.shortMonthLabels[monthIndex];
        } else {
            return Date.fullMonthLabels[monthIndex];
        }
    });

    /**
     * Calculates the ordinal day number of the year (1-366) for the current date.
     *
     * @example (new Date('2008-01-12')).getOrdinalDay(); // 12
     * @name getOrdinalDay
     * @type Number
     * @category Date Prototype Methods
     */
    injectDateMethod("getOrdinalDay", function() {
        const yearStart = new Date(this.getFullYear(), 0, 1); // January 1st of the current year
        const diffMilliseconds = this.getTime() - yearStart.getTime();
        const dayNumber = Math.floor(diffMilliseconds / Date.timeUnitFactors.MILLISECONDS_IN_DAY) + 1;
        return dayNumber;
    });

    /**
     * Calculates the calendar week number of the year for the current date.
     * This method provides a simple week number calculation (division by 7).
     *
     * @example (new Date('2008-01-12')).getCalendarWeek(); // 2
     * @name getCalendarWeek
     * @type Number
     * @category Date Prototype Methods
     */
    injectDateMethod("getCalendarWeek", function() {
        const dayOfYear = this.getOrdinalDay();
        // Add 1 to dayOfYear to make it 1-based, then divide by 7 and ceil.
        // Or, more simply, use the 0-based dayOfYear and add 1 to the result.
        return Math.ceil(dayOfYear / 7);
    });

    /**
     * Sets the date object to a specific ordinal day of the year.
     * The month and day of the month will be adjusted accordingly.
     *
     * @example (new Date('2008-01-12')).setOrdinalDay(1); // new Date('2008-01-01')
     * @param {number} dayNumber - The desired day of the year (1-366).
     * @returns {Date} The modified Date object.
     * @name setOrdinalDay
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("setOrdinalDay", function(dayNumber) {
        if (typeof dayNumber !== 'number' || dayNumber < 1) {
            console.warn("Invalid day number provided to setOrdinalDay. Must be a positive number.");
            return this;
        }
        this.setMonth(0); // Set to January
        this.setDate(dayNumber); // Set the day of the month
        return this;
    });

    /**
     * Advances the date object by a specified number of years.
     *
     * @example (new Date('2008-01-12')).advanceYears(1); // new Date('2009-01-12')
     * @param {number} numYears - The number of years to add (can be negative).
     * @returns {Date} The modified Date object.
     * @name advanceYears
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("advanceYears", function(numYears) {
        if (typeof numYears !== 'number') return this;
        const currentYear = this.getFullYear();
        this.setFullYear(currentYear + numYears);
        return this;
    });

    /**
     * Advances the date object by a specified number of months.
     * Handles month overflows and ensures the day of the month doesn't exceed
     * the new month's maximum days.
     *
     * @example (new Date('2008-01-12')).advanceMonths(1); // new Date('2008-02-12')
     * @param {number} numMonths - The number of months to add (can be negative).
     * @returns {Date} The modified Date object.
     * @name advanceMonths
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("advanceMonths", function(numMonths) {
        if (typeof numMonths !== 'number') return this;

        const originalDay = this.getDate();
        this.setMonth(this.getMonth() + numMonths);

        // If setting the month caused the day to overflow (e.g., Jan 31 + 1 month = Mar 2),
        // set the day to the last day of the target month.
        if (this.getDate() < originalDay) {
            this.setDate(0); // Set to the last day of the *previous* month (which is correct for overflow)
        }
        return this;
    });

    /**
     * Advances the date object by a specified number of days.
     *
     * @example (new Date('2008-01-12')).advanceDays(1); // new Date('2008-01-13')
     * @param {number} numDays - The number of days to add (can be negative).
     * @returns {Date} The modified Date object.
     * @name advanceDays
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("advanceDays", function(numDays) {
        if (typeof numDays !== 'number') return this;
        const currentMillis = this.getTime();
        const newMillis = currentMillis + (numDays * Date.timeUnitFactors.MILLISECONDS_IN_DAY);
        this.setTime(newMillis);
        return this;
    });

    /**
     * Advances the date object by a specified number of hours.
     *
     * @example (new Date('2008-01-12')).advanceHours(24); // new Date('2008-01-13')
     * @param {number} numHours - The number of hours to add (can be negative).
     * @returns {Date} The modified Date object.
     * @name advanceHours
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("advanceHours", function(numHours) {
        if (typeof numHours !== 'number') return this;
        this.setHours(this.getHours() + numHours);
        return this;
    });

    /**
     * Advances the date object by a specified number of minutes.
     *
     * @example (new Date('2008-01-12')).advanceMinutes(60); // new Date('2008-01-12 01:00:00')
     * @param {number} numMinutes - The number of minutes to add (can be negative).
     * @returns {Date} The modified Date object.
     * @name advanceMinutes
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("advanceMinutes", function(numMinutes) {
        if (typeof numMinutes !== 'number') return this;
        this.setMinutes(this.getMinutes() + numMinutes);
        return this;
    });

    /**
     * Advances the date object by a specified number of seconds.
     *
     * @example (new Date('2008-01-12')).advanceSeconds(60); // new Date('2008-01-12 00:01:00')
     * @param {number} numSeconds - The number of seconds to add (can be negative).
     * @returns {Date} The modified Date object.
     * @name advanceSeconds
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("advanceSeconds", function(numSeconds) {
        if (typeof numSeconds !== 'number') return this;
        this.setSeconds(this.getSeconds() + numSeconds);
        return this;
    });

    /**
     * Resets the time components (hours, minutes, seconds, milliseconds) of the date object to zero.
     * Useful for date-only comparisons.
     *
     * @example (new Date()).resetTimeComponents(); // Sets time to 00:00:00.000
     * @returns {Date} The modified Date object.
     * @name resetTimeComponents
     * @type Date
     * @category Date Prototype Methods
     */
    injectDateMethod("resetTimeComponents", function() {
        this.setHours(0, 0, 0, 0); // Efficiently sets all time components to zero
        return this;
    });

    /**
     * Converts the date object to a formatted string based on a specified pattern or Date.displayPattern.
     *
     * Supported tokens:
     * YYYY: Full year (e.g., 2023)
     * YY: Two-digit year (e.g., 23)
     * MMMM: Full month name (e.g., January)
     * MMM: Abbreviated month name (e.g., Jan)
     * MM: Two-digit month (e.g., 01)
     * M: Single-digit month (e.g., 1)
     * DD: Two-digit day of month (e.g., 05)
     * D: Single-digit day of month (e.g., 5)
     * HH: Two-digit hour (24-hour format)
     * H: Single-digit hour (24-hour format)
     * hh: Two-digit hour (12-hour format)
     * h: Single-digit hour (12-hour format)
     * mm: Two-digit minute
     * m: Single-digit minute
     * ss: Two-digit second
     * s: Single-digit second
     * SSS: Three-digit millisecond
     * S: Single-digit millisecond
     * A: AM/PM
     * a: am/pm
     *
     * @example (new Date('2023-01-05 14:30:00')).formatDateToString('YYYY-MM-DD hh:mm A'); // '2023-01-05 02:30 PM'
     * @param {string} [formatString] - The format pattern. Defaults to Date.displayPattern.
     * @returns {string} The formatted date string.
     * @name formatDateToString
     * @type String
     * @category Date Prototype Methods
     */
    injectDateMethod("formatDateToString", function(formatString) {
        const pattern = formatString || Date.displayPattern;

        const year = this.getFullYear();
        const month = this.getMonth(); // 0-11
        const day = this.getDate(); // 1-31
        const hours = this.getHours(); // 0-23
        const minutes = this.getMinutes(); // 0-59
        const seconds = this.getSeconds(); // 0-59
        const milliseconds = this.getMilliseconds(); // 0-999

        const monthNum = month + 1;
        const hour12 = hours % 12 || 12; // 12-hour format
        const ampm = hours < 12 ? 'AM' : 'PM';
        const ampmLower = ampm.toLowerCase();

        const replacements = {
            'YYYY': year,
            'YY': String(year).slice(-2),
            'MMMM': Date.fullMonthLabels[month],
            'MMM': Date.shortMonthLabels[month],
            'MM': _leadingZero(monthNum),
            'M': monthNum,
            'DD': _leadingZero(day),
            'D': day,
            'HH': _leadingZero(hours),
            'H': hours,
            'hh': _leadingZero(hour12),
            'h': hour12,
            'mm': _leadingZero(minutes),
            'm': minutes,
            'ss': _leadingZero(seconds),
            's': seconds,
            'SSS': _leadingZero(milliseconds, 3),
            'S': milliseconds,
            'A': ampm,
            'a': ampmLower
        };

        // Replace longest tokens first to avoid partial replacements (e.g., 'MM' before 'M')
        const sortedTokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

        let formattedResult = pattern;
        for (const token of sortedTokens) {
            // Use a regex with global flag to replace all occurrences
            formattedResult = formattedResult.replace(new RegExp(token, 'g'), replacements[token]);
        }

        return formattedResult;
    });

    /**
     * Attempts to parse a date string into a Date object based on Date.displayPattern.
     * Returns null if parsing fails.
     *
     * This parser is opinionated and expects the input string to strictly match
     * the structure implied by Date.displayPattern.
     *
     * @example Date.parseDateFromString("05/01/2023"); // new Date('2023-01-05T00:00:00.000Z') (if pattern is DD/MM/YYYY)
     * @param {string} dateString - The string representation of the date.
     * @returns {Date|null} A new Date object or null if parsing fails.
     * @name parseDateFromString
     * @type Function
     * @category Date Static Methods
     */
    Date.parseDateFromString = function(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            return null;
        }

        const pattern = Date.displayPattern.toUpperCase(); // Ensure pattern is uppercase for consistent token matching
        const parts = {};
        let cursor = 0;

        // Helper to extract a numerical part based on token length
        const extractPart = (token, length) => {
            const val = parseInt(dateString.substring(cursor, cursor + length), 10);
            if (isNaN(val)) return null;
            cursor += length;
            return val;
        };

        // Helper to skip non-token characters
        const skipCharacters = (expectedChar) => {
            if (dateString[cursor] === expectedChar) {
                cursor++;
                return true;
            }
            return false;
        };

        // Iterate through the pattern to extract components
        for (let i = 0; i < pattern.length; ) {
            const char = pattern[i];
            let token = char;
            while (i + 1 < pattern.length && pattern[i + 1] === char) {
                token += char;
                i++;
            }
            i++;

            switch (token) {
                case 'YYYY':
                    parts.year = extractPart(token, 4);
                    break;
                case 'YY':
                    parts.year = extractPart(token, 2);
                    if (parts.year !== null) {
                        // Disambiguate 2-digit years: assume 20xx for <= current_year_last_two_digits + 10, else 19xx
                        const currentYear = new Date().getFullYear();
                        const currentCentury = Math.floor(currentYear / 100);
                        const currentTwoDigitYear = currentYear % 100;
                        if (parts.year <= currentTwoDigitYear + 10) { // arbitrary threshold
                             parts.year = currentCentury * 100 + parts.year;
                        } else {
                            parts.year = (currentCentury - 1) * 100 + parts.year;
                        }
                    }
                    break;
                case 'MMMM':
                case 'MMM':
                    const monthNameLength = token === 'MMMM' ? 9 : 3; // Max length for full month, 3 for abbr
                    const monthStr = dateString.substring(cursor, cursor + monthNameLength).toLowerCase();
                    const monthNames = token === 'MMMM' ? Date.fullMonthLabels : Date.shortMonthLabels;
                    let monthIndex = -1;
                    for (let m = 0; m < monthNames.length; m++) {
                        if (monthNames[m].toLowerCase().startsWith(monthStr)) { // Use startsWith for flexibility
                            monthIndex = m;
                            break;
                        }
                    }
                    if (monthIndex === -1) return null;
                    parts.month = monthIndex;
                    cursor += monthStr.length; // Adjust cursor based on actual matched length
                    break;
                case 'MM':
                case 'M':
                    parts.month = extractPart(token, token.length === 2 ? 2 : 1);
                    if (parts.month !== null) parts.month--; // Adjust to 0-indexed month
                    break;
                case 'DD':
                case 'D':
                    parts.day = extractPart(token, token.length === 2 ? 2 : 1);
                    break;
                case 'HH':
                case 'H':
                    parts.hours = extractPart(token, token.length === 2 ? 2 : 1);
                    break;
                case 'hh':
                case 'h':
                    parts.hours12 = extractPart(token, token.length === 2 ? 2 : 1);
                    break;
                case 'mm':
                case 'm':
                    parts.minutes = extractPart(token, token.length === 2 ? 2 : 1);
                    break;
                case 'ss':
                case 's':
                    parts.seconds = extractPart(token, token.length === 2 ? 2 : 1);
                    break;
                case 'SSS':
                case 'S':
                    parts.milliseconds = extractPart(token, token.length === 3 ? 3 : 1);
                    break;
                case 'A':
                case 'a':
                    const ampmStr = dateString.substring(cursor, cursor + 2).toUpperCase();
                    if (ampmStr === 'AM' || ampmStr === 'PM') {
                        parts.ampm = ampmStr;
                        cursor += 2;
                    } else {
                        return null; // Invalid AM/PM
                    }
                    break;
                default:
                    // Assume it's a literal separator character
                    if (!skipCharacters(char)) {
                        return null; // Mismatch in separator
                    }
                    break;
            }

            // If any part failed to parse, return null
            if (Object.values(parts).some(val => val === null)) {
                return null;
            }
        }

        // Apply default values if components are missing
        const finalYear = parts.year !== undefined ? parts.year : 1970;
        const finalMonth = parts.month !== undefined ? parts.month : 0; // January
        const finalDay = parts.day !== undefined ? parts.day : 1; // 1st
        let finalHours = parts.hours !== undefined ? parts.hours : 0;
        const finalMinutes = parts.minutes !== undefined ? parts.minutes : 0;
        const finalSeconds = parts.seconds !== undefined ? parts.seconds : 0;
        const finalMilliseconds = parts.milliseconds !== undefined ? parts.milliseconds : 0;

        // Adjust 12-hour format to 24-hour
        if (parts.hours12 !== undefined) {
            finalHours = parts.hours12;
            if (parts.ampm === 'PM' && finalHours < 12) {
                finalHours += 12;
            } else if (parts.ampm === 'AM' && finalHours === 12) {
                finalHours = 0; // Midnight 12 AM is 00 hours
            }
        }

        const parsedDate = new Date(finalYear, finalMonth, finalDay, finalHours, finalMinutes, finalSeconds, finalMilliseconds);

        // Basic validation: Check if the parsed date components match the input (e.g., no date overflow like Feb 30)
        // This is a simple check, more robust validation might compare `parsedDate.formatDateToString(pattern)`
        // with the original `dateString`, but that's more complex.
        if (parsedDate.getFullYear() !== finalYear ||
            parsedDate.getMonth() !== finalMonth ||
            parsedDate.getDate() !== finalDay) {
            // This indicates an invalid date (e.g., Feb 30)
            return null;
        }

        return parsedDate;
    };

})(); // End of IIFE