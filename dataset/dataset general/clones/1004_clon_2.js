//
// Chronological object extensions. Does not rely on
// any other external modules. Ensures no existing methods
// are overwritten.
//
// Introduces static properties: fullDayNames, shortDayLabels, fullMonthNames,
// and shortMonthLabels. Also adds instance methods: isBissextile, isEndOfWeek,
// isWorkDay, retrieveDaysInCurrentMonth, fetchDayLabel, fetchMonthLabel,
// obtainDayOrdinal, obtainWeekOrdinal, assignDayOrdinal, appendYears, appendMonths,
// appendDays, appendHours, appendMinutes, appendSeconds, resetTimeComponents,
// toFormattedString.
//
// Copyright (c) 2006 Jörn Zaefferer and Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
//
// Further functionalities and attributes contributed by Kelvin Luck:
// startDayIndex, displayPattern, resetTimeComponents, toFormattedString, parseFromPattern.
// (My name is appended to these features so you know who is responsible for any issues!)
//
// Distributed under both MIT and GPL licenses:
//   http://www.opensource.org/licenses/mit-license.php
//   http://www.gnu.org/licenses/gpl.html
//

/**
 * An array holding the complete names of days, beginning with Sunday.
 *
 * @example fullDayNames[0]
 * @returns 'Sunday'
 *
 * @property fullDayNames
 * @type Array<string>
 * @category Utilities/DateTime
 */
Date.fullDayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * An array holding the abbreviated names of days, beginning with Sun.
 *
 * @example shortDayLabels[0]
 * @returns 'Sun'
 *
 * @property shortDayLabels
 * @type Array<string>
 * @category Utilities/DateTime
 */
Date.shortDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * An array holding the complete names of months, beginning with January.
 *
 * @example fullMonthNames[0]
 * @returns 'January'
 *
 * @property fullMonthNames
 * @type Array<string>
 * @category Utilities/DateTime
 */
Date.fullMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * An array holding the abbreviated names of months, beginning with Jan.
 *
 * @example shortMonthLabels[0]
 * @returns 'Jan'
 *
 * @property shortMonthLabels
 * @type Array<string>
 * @category Utilities/DateTime
 */
Date.shortMonthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Specifies the initial day of the week for this cultural setting.
 *
 * @property startDayIndex
 * @type Number
 * @category Utilities/DateTime
 * @author Kelvin Luck
 */
Date.startDayIndex = 1;

/**
 * The default presentation format for string-based chronological objects (e.g., 'dd/mm/yyyy' for UK, 'mm/dd/yyyy' for US, 'yyyy-mm-dd' for ISO).
 *
 * @property displayPattern
 * @type String
 * @category Utilities/DateTime
 * @author Kelvin Luck
 */
Date.displayPattern = 'dd/mm/yyyy';
// Date.displayPattern = 'mm/dd/yyyy';
// Date.displayPattern = 'yyyy-mm-dd';
// Date.displayPattern = 'dd mmm yy';

/**
 * The initial two digits of the century to be employed when interpreting a two-digit year.
 * Since a two-digit year is inherently ambiguous (and Date.setYear only operates with
 * values less than 99, preventing years after 2000), this property helps resolve the ambiguity.
 *
 * @property centuryBasePrefix
 * @type String
 * @category Utilities/DateTime
 * @author Kelvin Luck
 */
Date.centuryBasePrefix = '20';

(function () {
  /**
   * Appends a specified implementation to the Date prototype
   * under a given key, only if that key is not already in use.
   *
   * @private
   */
  function registerPrototypeMethod(methodKey, methodImpl) {
    if (!Date.prototype[methodKey]) {
      Date.prototype[methodKey] = methodImpl;
    }
  }

  /**
   * Determines if the year is a leap year.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.isBissextile();
   * @returns true
   *
   * @method isBissextile
   * @type Boolean
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('isBissextile', function () {
    let currentYear = this.getFullYear();
    return (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
  });

  /**
   * Checks if the current day falls on a weekend (Saturday or Sunday).
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.isEndOfWeek();
   * @returns false
   *
   * @method isEndOfWeek
   * @type Boolean
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('isEndOfWeek', function () {
    return this.getDay() === 0 || this.getDay() === 6;
  });

  /**
   * Checks if the current day falls on a weekday (Monday-Friday).
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.isWorkDay();
   * @returns false
   *
   * @method isWorkDay
   * @type Boolean
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('isWorkDay', function () {
    return !this.isEndOfWeek();
  });

  /**
   * Retrieves the total count of days within the current month.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.retrieveDaysInCurrentMonth();
   * @returns 31
   *
   * @method retrieveDaysInCurrentMonth
   * @type Number
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('retrieveDaysInCurrentMonth', function () {
    return [
      31,
      this.isBissextile() ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ][this.getMonth()];
  });

  /**
   * Obtains the textual representation of the day.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.fetchDayLabel();
   * @returns 'Saturday'
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.fetchDayLabel(true);
   * @returns 'Sat'
   *
   * @param {Boolean} briefVersion If true, returns the abbreviated name.
   * @method fetchDayLabel
   * @type String
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('fetchDayLabel', function (briefVersion) {
    return briefVersion
      ? Date.shortDayLabels[this.getDay()]
      : Date.fullDayNames[this.getDay()];
  });

  /**
   * Obtains the textual representation of the month.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.fetchMonthLabel();
   * @returns 'January'
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.fetchMonthLabel(true);
   * @returns 'Jan'
   *
   * @param {Boolean} briefVersion If true, returns the abbreviated name.
   * @method fetchMonthLabel
   * @type String
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('fetchMonthLabel', function (briefVersion) {
    return briefVersion
      ? Date.shortMonthLabels[this.getMonth()]
      : Date.fullMonthNames[this.getMonth()];
  });

  /**
   * Retrieves the numerical order of the day within the year.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.obtainDayOrdinal();
   * @returns 11
   *
   * @method obtainDayOrdinal
   * @type Number
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('obtainDayOrdinal', function () {
    const yearStartPoint = new Date('1/1/' + this.getFullYear());
    return Math.floor((this.getTime() - yearStartPoint.getTime()) / 86400000);
  });

  /**
   * Retrieves the numerical order of the week within the year.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.obtainWeekOrdinal();
   * @returns 2
   *
   * @method obtainWeekOrdinal
   * @type Number
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('obtainWeekOrdinal', function () {
    return Math.ceil(this.obtainDayOrdinal() / 7);
  });

  /**
   * Sets the day of the year to a specific value.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.assignDayOrdinal(1);
   * dtObj.toString();
   * @returns 'Tue Jan 01 2008 00:00:00'
   *
   * @param {Number} targetDay The desired day number within the year.
   * @method assignDayOrdinal
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('assignDayOrdinal', function (targetDay) {
    this.setMonth(0);
    this.setDate(targetDay);
    return this;
  });

  /**
   * Increments the chronological object by a specified number of years.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.appendYears(1);
   * dtObj.toString();
   * @returns 'Mon Jan 12 2009 00:00:00'
   *
   * @param {Number} quantity The number of years to add.
   * @method appendYears
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('appendYears', function (quantity) {
    this.setFullYear(this.getFullYear() + quantity);
    return this;
  });

  /**
   * Increments the chronological object by a specified number of months.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.appendMonths(1);
   * dtObj.toString();
   * @returns 'Tue Feb 12 2008 00:00:00'
   *
   * @param {Number} quantity The number of months to add.
   * @method appendMonths
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('appendMonths', function (quantity) {
    const originalDayOfMonth = this.getDate();

    this.setMonth(this.getMonth() + quantity);

    if (originalDayOfMonth > this.getDate()) {
      this.appendDays(-this.getDate());
    }

    return this;
  });

  /**
   * Increments the chronological object by a specified number of days.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.appendDays(1);
   * dtObj.toString();
   * @returns 'Sun Jan 13 2008 00:00:00'
   *
   * @param {Number} quantity The number of days to add.
   * @method appendDays
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('appendDays', function (quantity) {
    // this.setDate(this.getDate() + quantity);
    this.setTime(this.getTime() + quantity * 86400000);
    return this;
  });

  /**
   * Increments the chronological object by a specified number of hours.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.appendHours(24);
   * dtObj.toString();
   * @returns 'Sun Jan 13 2008 00:00:00'
   *
   * @param {Number} quantity The number of hours to add.
   * @method appendHours
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('appendHours', function (quantity) {
    this.setHours(this.getHours() + quantity);
    return this;
  });

  /**
   * Increments the chronological object by a specified number of minutes.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.appendMinutes(60);
   * dtObj.toString();
   * @returns 'Sat Jan 12 2008 01:00:00'
   *
   * @param {Number} quantity The number of minutes to add.
   * @method appendMinutes
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('appendMinutes', function (quantity) {
    this.setMinutes(this.getMinutes() + quantity);
    return this;
  });

  /**
   * Increments the chronological object by a specified number of seconds.
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.appendSeconds(60);
   * dtObj.toString();
   * @returns 'Sat Jan 12 2008 00:01:00'
   *
   * @param {Number} quantity The number of seconds to add.
   * @method appendSeconds
   * @type Date
   * @category Utilities/DateTime
   */
  registerPrototypeMethod('appendSeconds', function (quantity) {
    this.setSeconds(this.getSeconds() + quantity);
    return this;
  });

  /**
   * Resets the time portions of this Date object to zero, facilitating cleaner comparisons
   * where the time of day is not relevant.
   *
   * @example var dtObj = new Date();
   * dtObj.resetTimeComponents();
   * dtObj.toString();
   * @returns 'Sat Jan 12 2008 00:01:00'
   *
   * @method resetTimeComponents
   * @type Date
   * @category Utilities/DateTime
   * @author Kelvin Luck
   */
  registerPrototypeMethod('resetTimeComponents', function () {
    this.setMilliseconds(0);
    this.setSeconds(0);
    this.setMinutes(0);
    this.setHours(0);
    return this;
  });

  /**
   * Provides a string representation of the chronological object based on Date.displayPattern.
   * (Date.toString is intentionally not overwritten as it might be used elsewhere.)
   *
   * @example var dtObj = new Date("01/12/2008");
   * dtObj.toFormattedString();
   * @returns '12/01/2008' // (assuming Date.displayPattern == 'dd/mm/yyyy')
   *
   * @param {String} outputPattern Optional custom format pattern.
   * @method toFormattedString
   * @type String
   * @category Utilities/DateTime
   * @author Kelvin Luck
   */
  registerPrototypeMethod('toFormattedString', function (outputPattern) {
    let resultString = outputPattern || Date.displayPattern;
    if (resultString.split('mm').length > 1) {
      // Avoid replacing 'm' in month names like 'noveMber'
      resultString = resultString
        .split('mmmm')
        .join(this.fetchMonthLabel(false))
        .split('mmm')
        .join(this.fetchMonthLabel(true))
        .split('mm')
        .join(_padWithZero(this.getMonth() + 1));
    } else {
      resultString = resultString.split('m').join(this.getMonth() + 1);
    }
    resultString = resultString
      .split('yyyy')
      .join(this.getFullYear())
      .split('yy')
      .join((this.getFullYear() + '').substring(2))
      .split('dd')
      .join(_padWithZero(this.getDate()))
      .split('d')
      .join(this.getDate());
    return resultString;
  });

  /**
   * Creates a new date object from a provided string, adhering to Date.displayPattern,
   * or returns false if parsing fails to produce a valid date.
   * (Date.parse is not used or overwritten due to its locale-agnostic nature and potential existing dependencies.)
   *
   * @example var dtObj = Date.parseFromPattern("12/01/2008");
   * dtObj.toString();
   * @returns 'Sat Jan 12 2008 00:00:00' // (assuming Date.displayPattern == 'dd/mm/yyyy')
   *
   * @param {String} inputString The string to parse into a date.
   * @method parseFromPattern
   * @type Date
   * @category Utilities/DateTime
   * @author Kelvin Luck
   */
  Date.parseFromPattern = function (inputString) {
    let currentPattern = Date.displayPattern;

    let parsedDateObject = new Date('01/01/1970');

    if (inputString === '') return parsedDateObject;

    inputString = inputString.toLowerCase();
    let regexPatternBuilder = '';
    const componentOrder = [];
    const patternSegmentMatcher = /(dd?d?|mm?m?|yy?yy?)+([^(m|d|y)])?/g;
    let matchResults;
    while ((matchResults = patternSegmentMatcher.exec(currentPattern)) !== null) {
      switch (matchResults[1]) {
        case 'd':
        case 'dd':
        case 'm':
        case 'mm':
        case 'yy':
        case 'yyyy':
          regexPatternBuilder += '(\\d+\\d?\\d?\\d?)+';
          componentOrder.push(matchResults[1].substr(0, 1));
          break;
        case 'mmm':
          regexPatternBuilder += '([a-z]{3})';
          componentOrder.push('M');
          break;
      }
      if (matchResults[2]) {
        regexPatternBuilder += matchResults[2];
      }
    }
    const dateMatcherRegex = new RegExp(regexPatternBuilder);
    const stringMatchArray = inputString.match(dateMatcherRegex);
    for (let i = 0; i < componentOrder.length; i++) {
      const componentValue = stringMatchArray[i + 1];
      switch (componentOrder[i]) {
        case 'd':
          parsedDateObject.setDate(componentValue);
          break;
        case 'm':
          parsedDateObject.setMonth(Number(componentValue) - 1);
          break;
        case 'M':
          let monthIndex;
          for (
            monthIndex = 0;
            monthIndex < Date.shortMonthLabels.length;
            monthIndex++
          ) {
            if (Date.shortMonthLabels[monthIndex].toLowerCase() === componentValue)
              break;
          }
          parsedDateObject.setMonth(monthIndex);
          break;
        case 'y':
          parsedDateObject.setYear(componentValue);
          break;
      }
    }

    return parsedDateObject;
  };

  // Helper function for formatting
  function _padWithZero(val) {
    return val < 10 ? '0' + val : val;
  }
})();