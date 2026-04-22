/*
 * This file provides extensions to the native JavaScript Date object.
 * It's designed to be self-contained, meaning it has no external dependencies
 * and carefully avoids overwriting any pre-existing Date methods.
 *
 * It introduces several static properties: dayNames, abbrDayNames, monthNames, and abbrMonthNames.
 * Additionally, it adds a suite of instance methods to the Date prototype, including:
 * isLeapYear, isWeekend, isWeekDay, getDaysInMonth, getDayName, getMonthName,
 * getDayOfYear, getWeekOfYear, setDayOfYear, addYears, addMonths, addDays,
 * addHours, addMinutes, addSeconds.
 *
 * Kelvin Luck contributed additional properties and methods like firstDayOfWeek,
 * dateFormat, zeroTime, asString, and fromString.
 *
 * Original Copyright (c) 2006 Jörn Zaefferer and Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 *
 * This code is distributed under a dual license:
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 * GPL License: http://www.gnu.org/licenses/gpl.html
 *
 */

// --- Static Properties for Date Object ---

/**
 * An array holding the full names of days, beginning with Sunday.
 * For example, dayNames[0] would return 'Sunday'.
 *
 * @name dayNames
 * @type Array<string>
 * @category Date Plugins
 */
Date.dayNames = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

/**
 * An array containing abbreviated day names, starting with 'Sun'.
 * Accessing abbrDayNames[0] yields 'Sun'.
 *
 * @name abbrDayNames
 * @type Array<string>
 * @category Date Plugins
 */
Date.abbrDayNames = [
	'Sun',
	'Mon',
	'Tue',
	'Wed',
	'Thu',
	'Fri',
	'Sat'
];

/**
 * An array that stores the full names of months, starting from January.
 * For instance, monthNames[0] would provide 'January'.
 *
 * @name monthNames
 * @type Array<string>
 * @category Date Plugins
 */
Date.monthNames = [
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
	'December'
];

/**
 * An array of abbreviated month names, starting with 'Jan'.
 * To get 'Jan', one would use abbrMonthNames[0].
 *
 * @name abbrMonthNames
 * @type Array<string>
 * @category Date Plugins
 */
Date.abbrMonthNames = [
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
	'Dec'
];

/**
 * Defines the first day of the week for the current locale.
 * Typically 0 for Sunday, 1 for Monday, etc.
 *
 * @name firstDayOfWeek
 * @type Number
 * @category Date Plugins
 * @author Kelvin Luck
 */
Date.firstDayOfWeek = 1;

/**
 * Specifies the default format string for representing dates.
 * Examples include 'dd/mm/yyyy' (UK), 'mm/dd/yyyy' (US), or 'yyyy-mm-dd' (ISO).
 *
 * @name format
 * @type String
 * @category Date Plugins
 * @author Kelvin Luck
 */
Date.format = 'dd/mm/yyyy';
// Other possible formats, commented out for now:
//Date.format = 'mm/dd/yyyy';
//Date.format = 'yyyy-mm-dd';
//Date.format = 'dd mmm yy';

/**
 * This property holds the first two digits of the century for
 * disambiguating two-digit year inputs. Since `date.setYear` behaves
 * inconsistently for years beyond 1999 (it expects values < 99),
 * this helps correctly interpret '08' as 2008, for example.
 *
 * @name fullYearStart
 * @type String
 * @category Date Plugins
 * @author Kelvin Luck
 */
Date.fullYearStart = '20';

/*
 * Anonymous function to encapsulate private helper methods and
 * add new functionality to the Date prototype.
 */
(function( ) {

	/**
	 * Helper function to add methods to the Date.prototype.
	 * It ensures that existing methods are not overwritten.
	 *
	 * @private
	 * @param {string} name The name of the method to add.
	 * @param {Function} method The function implementation.
	 */
	function add( name, method ) {
		// Only add the method if it doesn't already exist on the prototype.
		if ( ! Date.prototype[name] ) {
			Date.prototype[name] = method;
		}
	}

	/**
	 * Determines if the year of the current Date object is a leap year.
	 * A leap year occurs every 4 years, except for years divisible by 100
	 * but not by 400.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008");
	 * dtm.isLeapYear(); // Returns true
	 *
	 * @name isLeapYear
	 * @type Boolean
	 * @category Date Methods
	 * @returns {boolean} True if it's a leap year, false otherwise.
	 */
	add( "isLeapYear", function( ) {
		const y = this.getFullYear(); // Get the full year
		// Leap year logic: divisible by 4 AND not by 100, OR divisible by 400.
		return ( ( y % 4 === 0 ) && ( y % 100 !== 0 ) ) || ( y % 400 === 0 );
	} );

	/**
	 * Checks if the current date falls on a weekend (Saturday or Sunday).
	 *
	 * @example
	 * var dtm = new Date("01/12/2008"); // January 12, 2008 was a Saturday
	 * dtm.isWeekend(); // Returns true
	 *
	 * @name isWeekend
	 * @type Boolean
	 * @category Date Methods
	 * @returns {boolean} True if the day is Saturday (6) or Sunday (0).
	 */
	add( "isWeekend", function( ) {
		const dayOfWeek = this.getDay(); // 0 for Sunday, 6 for Saturday
		return dayOfWeek === 0 || dayOfWeek === 6;
	} );

	/**
	 * Verifies if the current date is a weekday (Monday through Friday).
	 * This method leverages the `isWeekend` method for its implementation.
	 *
	 * @example
	 * var dtm = new Date("01/14/2008"); // January 14, 2008 was a Monday
	 * dtm.isWeekDay(); // Returns true
	 *
	 * @name isWeekDay
	 * @type Boolean
	 * @category Date Methods
	 * @returns {boolean} True if the day is not a weekend day.
	 */
	add( "isWeekDay", function( ) {
		return ! this.isWeekend(); // A weekday is simply not a weekend
	} );

	/**
	 * Calculates and returns the total number of days within the current month
	 * of the Date object. It accounts for leap years when determining February's length.
	 *
	 * @example
	 * var dtm = new Date("02/01/2008"); // February 2008
	 * dtm.getDaysInMonth(); // Returns 29 (2008 was a leap year)
	 *
	 * @name getDaysInMonth
	 * @type Number
	 * @category Date Methods
	 * @returns {number} The count of days in the month.
	 */
	add( "getDaysInMonth", function( ) {
		// Array of days per month (Jan=31, Feb=28/29, Mar=31, etc.)
		const days = [
			31,
			( this.isLeapYear() ? 29 : 28 ),
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31
		];
		return days[ this.getMonth() ]; // Use the current month index
	} );

	/**
	 * Retrieves the name of the day for the current Date object.
	 * It can return either the full name or an abbreviated version.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008"); // January 12, 2008 was a Saturday
	 * dtm.getDayName(); // Returns 'Saturday'
	 * dtm.getDayName(true); // Returns 'Sat'
	 *
	 * @param {boolean} [abbreviated=false] If true, return the abbreviated name.
	 * @name getDayName
	 * @type String
	 * @category Date Methods
	 * @returns {string} The full or abbreviated day name.
	 */
	add( "getDayName", function( abbreviated ) {
		// Decide between full names or abbreviated names based on the parameter
		return abbreviated ? Date.abbrDayNames[ this.getDay() ] : Date.dayNames[ this.getDay() ];
	} );

	/**
	 * Obtains the name of the month for the current Date object.
	 * The output can be either the full month name or its abbreviation.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008"); // January
	 * dtm.getMonthName(); // Returns 'January'
	 * dtm.getMonthName(true); // Returns 'Jan'
	 *
	 * @param {boolean} [abbreviated=false] If true, return the abbreviated name.
	 * @name getMonthName
	 * @type String
	 * @category Date Methods
	 * @returns {string} The full or abbreviated month name.
	 */
	add( "getMonthName", function( abbreviated ) {
		// Select from full or abbreviated month names based on the argument
		return abbreviated ? Date.abbrMonthNames[ this.getMonth() ] : Date.monthNames[ this.getMonth() ];
	} );

	/**
	 * Calculates the day of the year (1-366) for the current Date object.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008"); // January 12th
	 * dtm.getDayOfYear(); // Returns 11 (0-indexed internally, but 1-indexed for day of year)
	 *
	 * @name getDayOfYear
	 * @type Number
	 * @category Date Methods
	 * @returns {number} The day number within the year.
	 */
	add( "getDayOfYear", function( ) {
		// Create a temporary date for Jan 1st of the same year.
		const tmpdtm = new Date( "1/1/" + this.getFullYear() );
		// Calculate the difference in milliseconds and convert to days.
		return Math.floor( ( this.getTime() - tmpdtm.getTime() ) / 86400000 );
	} );

	/**
	 * Determines the week number of the year for the current Date object.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008"); // January 12th, 2008
	 * dtm.getWeekOfYear(); // Returns 2
	 *
	 * @name getWeekOfYear
	 * @type Number
	 * @category Date Methods
	 * @returns {number} The week number (1-53).
	 */
	add( "getWeekOfYear", function( ) {
		// Divide the day of the year by 7 and round up to get the week number.
		return Math.ceil( this.getDayOfYear() / 7 );
	} );

	/**
	 * Sets the day of the year for the current Date object.
	 * The month will be adjusted accordingly.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008");
	 * dtm.setDayOfYear(1); // Set to January 1st
	 * dtm.toString(); // Result: 'Tue Jan 01 2008 00:00:00 GMT...'
	 *
	 * @param {number} day The desired day number (1-366).
	 * @name setDayOfYear
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "setDayOfYear", function( day ) {
		this.setMonth( 0 );   // Set to January (month 0)
		this.setDate( day );  // Set the day within January (will roll over if day > 31)
		return this;          // Return the modified date object
	} );

	/**
	 * Adds a specified number of years to the current Date object.
	 * The month and day remain the same, but the year is incremented or decremented.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008");
	 * dtm.addYears(1);
	 * dtm.toString(); // Result: 'Mon Jan 12 2009 00:00:00 GMT...'
	 *
	 * @param {number} num The number of years to add (can be negative).
	 * @name addYears
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "addYears", function( num ) {
		this.setFullYear( this.getFullYear() + num ); // Adjust the full year
		return this; // Return 'this' for method chaining
	} );

	/**
	 * Adds a specified number of months to the current Date object.
	 * Handles month rollovers and ensures the day of the month is valid
	 * for the new month (e.g., prevents 31st of February).
	 *
	 * @example
	 * var dtm = new Date("01/31/2008"); // January 31st
	 * dtm.addMonths(1); // Add one month
	 * dtm.toString(); // Result: 'Sat Feb 29 2008 00:00:00 GMT...' (adjusts to end of Feb)
	 *
	 * @param {number} num The number of months to add (can be negative).
	 * @name addMonths
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "addMonths", function( num ) {
		const originalDay = this.getDate(); // Store the original day of the month

		this.setMonth( this.getMonth() + num ); // Set the new month

		// If the day rolled over (e.g., from Jan 31 to Mar 3),
		// it means the original day was too high for the new month.
		// Adjust back to the last day of the new month.
		if ( originalDay > this.getDate() ) {
			this.addDays( -this.getDate() ); // Subtract days to go to the end of the previous month
		}

		return this;
	} );

	/**
	 * Adds a specified number of days to the current Date object.
	 * This method modifies the date directly by adjusting its underlying time value.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008");
	 * dtm.addDays(1);
	 * dtm.toString(); // Result: 'Sun Jan 13 2008 00:00:00 GMT...'
	 *
	 * @param {number} num The number of days to add (can be negative).
	 * @name addDays
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "addDays", function( num ) {
		// 86,400,000 milliseconds in a day (24 * 60 * 60 * 1000)
		this.setTime( this.getTime() + ( num * 86400000 ) );
		return this;
	} );

	/**
	 * Adds a specified number of hours to the current Date object.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008 10:00:00");
	 * dtm.addHours(2);
	 * dtm.toString(); // Result: 'Sat Jan 12 2008 12:00:00 GMT...'
	 *
	 * @param {number} num The number of hours to add (can be negative).
	 * @name addHours
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "addHours", function( num ) {
		this.setHours( this.getHours() + num ); // Increment/decrement hours
		return this;
	} );

	/**
	 * Adds a specified number of minutes to the current Date object.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008 00:00:00");
	 * dtm.addMinutes(60);
	 * dtm.toString(); // Result: 'Sat Jan 12 2008 01:00:00 GMT...'
	 *
	 * @param {number} num The number of minutes to add (can be negative).
	 * @name addMinutes
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "addMinutes", function( num ) {
		this.setMinutes( this.getMinutes() + num ); // Adjust minutes
		return this;
	} );

	/**
	 * Adds a specified number of seconds to the current Date object.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008 00:00:00");
	 * dtm.addSeconds(60);
	 * dtm.toString(); // Result: 'Sat Jan 12 2008 00:01:00 GMT...'
	 *
	 * @param {number} num The number of seconds to add (can be negative).
	 * @name addSeconds
	 * @type Date
	 * @category Date Methods
	 * @returns {Date} The modified Date object.
	 */
	add( "addSeconds", function( num ) {
		this.setSeconds( this.getSeconds() + num ); // Modify seconds
		return this;
	} );

	/**
	 * Resets the time components (hours, minutes, seconds, milliseconds)
	 * of the Date object to zero. This is useful for comparing dates
	 * without considering the time of day.
	 *
	 * @example
	 * var dtm = new Date(); // Current date and time
	 * dtm.zeroTime(); // Sets time to 00:00:00.000
	 * dtm.toString(); // Example: 'Mon Jan 15 2024 00:00:00 GMT...'
	 *
	 * @name zeroTime
	 * @type Date
	 * @category Date Methods
	 * @author Kelvin Luck
	 * @returns {Date} The modified Date object with time set to midnight.
	 */
	add( "zeroTime", function( ) {
		this.setMilliseconds( 0 ); // Clear milliseconds
		this.setSeconds( 0 );     // Clear seconds
		this.setMinutes( 0 );     // Clear minutes
		this.setHours( 0 );       // Clear hours
		return this;
	} );

	/**
	 * Formats the Date object into a string representation based on a
	 * provided format string or the default `Date.format`.
	 * This method avoids overwriting the native `toString` method.
	 *
	 * @example
	 * var dtm = new Date("01/12/2008");
	 * dtm.asString(); // With Date.format = 'dd/mm/yyyy', returns '12/01/2008'
	 * dtm.asString('yyyy-mm-dd'); // Returns '2008-01-12'
	 *
	 * @param {string} [format] The format string to use. If omitted, `Date.format` is used.
	 * @name asString
	 * @type String
	 * @category Date Methods
	 * @author Kelvin Luck
	 * @returns {string} The formatted date string.
	 */
	add( "asString", function( format ) {
		let resultString = format || Date.format; // Use provided format or default

		// Helper for zero-padding single-digit numbers
		function _zeroPad( number ) {
			return number < 10 ? '0' + number : '' + number;
		}

		// Handle month replacements carefully to avoid partial matches
		if ( resultString.split('mm').length > 1 ) {
			resultString = resultString
				.split('mmmm').join( this.getMonthName(false) ) // Full month name
				.split('mmm').join( this.getMonthName(true) )  // Abbreviated month name
				.split('mm').join( _zeroPad( this.getMonth() + 1 ) ); // Zero-padded month number
		} else {
			// Simpler replacement if 'mm' isn't explicitly looked for (e.g., 'm')
			resultString = resultString.split('m').join( this.getMonth() + 1 );
		}

		// Handle year and day replacements
		resultString = resultString
			.split('yyyy').join( this.getFullYear() ) // Full year (e.g., 2024)
			.split('yy').join( ( this.getFullYear() + '' ).substring(2) ) // Two-digit year (e.g., 24)
			.split('dd').join( _zeroPad( this.getDate() ) ) // Zero-padded day (e.g., 01)
			.split('d').join( this.getDate() ); // Non-padded day (e.g., 1)

		return resultString;
	} );

	/**
	 * Attempts to parse a date string into a new Date object, using
	 * `Date.format` to understand the input string's structure.
	 * This static method is necessary because `Date.parse` is locale-agnostic
	 * and doesn't handle custom formats.
	 * Returns false if parsing fails to produce a valid date.
	 *
	 * @example
	 * var dtm = Date.fromString("12/01/2008"); // Assuming Date.format is 'dd/mm/yyyy'
	 * dtm.toString(); // Result: 'Sat Jan 12 2008 00:00:00 GMT...'
	 *
	 * @param {string} s The date string to parse.
	 * @name fromString
	 * @type Date
	 * @category Date Methods
	 * @author Kelvin Luck
	 * @returns {Date|boolean} A new Date object or false if parsing fails.
	 */
	Date.fromString = function( s ) {
		const formatString = Date.format; // Get the expected date format

		let parsedDate = new Date( '01/01/1970' ); // Initialize a base date

		if ( s === '' ) return parsedDate; // Return default date for empty string

		s = s.toLowerCase(); // Convert input string to lowercase for case-insensitive matching
		let regexMatcher = '';
		const orderOfParts = []; // Stores the order of day, month, year parts
		// Regex to find date parts (dd, mm, yyyy, mmm etc.) and separators
		const formatRegex = /(dd?d?|mm?m?|yy?yy?)+([^(m|d|y)])?/g;
		let matchResult;

		// Iterate through the format string to build a regex for parsing the input string
		while ( ( matchResult = formatRegex.exec( formatString ) ) !== null ) {
			switch ( matchResult[1] ) {
				case 'd':
				case 'dd':
				case 'm':
				case 'mm':
				case 'yy':
				case 'yyyy':
					regexMatcher += '(\\d+\\d?\\d?\\d?)+'; // Match one or more digits
					orderOfParts.push( matchResult[1].substr(0, 1) ); // Store 'd', 'm', or 'y'
					break;
				case 'mmm':
					regexMatcher += '([a-z]{3})'; // Match 3 letters for abbreviated month
					orderOfParts.push( 'M' ); // Store 'M' for month name
					break;
			}
			if ( matchResult[2] ) {
				regexMatcher += matchResult[2]; // Add any separator characters
			}
		}

		const dynamicRegex = new RegExp( regexMatcher ); // Create the full parsing regex
		const parsedValues = s.match( dynamicRegex ); // Apply it to the input string

		// If no match, return the default date
		if ( !parsedValues ) return parsedDate;

		// Assign parsed values to the date object based on the determined order
		for ( let i = 0; i < orderOfParts.length; i++ ) {
			const value = parsedValues[ i + 1 ]; // +1 because index 0 is the full match
			switch ( orderOfParts[i] ) {
				case 'd':
					parsedDate.setDate( value );
					break;
				case 'm':
					parsedDate.setMonth( Number(value) - 1 ); // Months are 0-indexed
					break;
				case 'M':
					// Find the month index from abbreviated month names
					for ( let j = 0; j < Date.abbrMonthNames.length; j++ ) {
						if ( Date.abbrMonthNames[j].toLowerCase() === value ) break;
					}
					parsedDate.setMonth( j );
					break;
				case 'y':
					parsedDate.setYear( value ); // Note: setYear is deprecated, but used as per source
					break;
			}
		}

		return parsedDate; // Return the newly created/parsed date object
	};

	// A simple utility method (from the original source, but not implemented here)

})();