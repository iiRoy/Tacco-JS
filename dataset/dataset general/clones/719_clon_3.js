(function () {
  // Establish the global context, allowing usage in browser or Node.js environments.
  var globalScope = this;

  var zoneKit;
  // Check if we are in a CommonJS-like environment (Node.js)
  if (typeof exports !== 'undefined') {
    zoneKit = exports;
  } else {
    // Otherwise, attach to the global object (window in browsers)
    zoneKit = globalScope.zoneKit = {};
  }

  // Library version identifier
  zoneKit.LIB_VER = '1.0.0-revised';

  // Access the available AJAX utility from the global scope.
  // This could be jQuery, Zepto, or a custom `zoneKit.timezone.asyncDataHandler` function.
  var jqObj = globalScope.$ || globalScope.jQuery || globalScope.Zepto
    , flxUtil = globalScope.fleegix;

  // Define constant arrays for days of the week and months of the year.
  // Note: Olson data is English-centric, so i18n is not a primary concern here.
  var WEEK_DAYS = zoneKit.WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    , CAL_MONTHS = zoneKit.CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Helper function to format a numeric value by padding it with leading zeros
  // or truncating it to a specified number of digits.
  var padNumberToLength = function (numericValue, requiredDigits) {
    if (typeof numericValue !== "number" || !Number.isFinite(numericValue)) {
      throw new Error("Invalid numeric value provided: " + numericValue);
    }
    if (requiredDigits <= 0) {
      return '';
    }

    var stringRep = numericValue.toString();

    // If the string representation is longer than the required digits,
    // take the last `requiredDigits` characters.
    if (stringRep.length > requiredDigits) {
      return stringRep.substring(stringRep.length - requiredDigits);
    }

    // Pad with leading zeros until the required length is met.
    while (stringRep.length < requiredDigits) {
      stringRep = '0' + stringRep;
    }
    return stringRep;
  };

  // Abstracted data fetching layer for various transport mechanisms.
  // Options object `fetchOptions` includes:
  // - `resourceURL`: the target URL for the AJAX request.
  // - `asyncMode`: boolean, true for async (default), false for synchronous.
  // - `onSuccess`: callback function for successful requests.
  // - `onError`: callback function for request errors.
  // Returns: response data if `asyncMode` is false, otherwise the AJAX request object.
  var dataFetcher = function (fetchOptions) {
    // Ensure at least one supported transport mechanism is available.
    if ((!flxUtil || typeof flxUtil.xhr === 'undefined') && (!jqObj || typeof jqObj.ajax === 'undefined')) {
      throw new Error('No AJAX library found (Fleegix.js XHR, jQuery, or Zepto) or custom transport not defined. Please configure `zoneKit.timezone.asyncDataHandler`.');
    }

    if (!fetchOptions || !fetchOptions.resourceURL) {
      throw new Error ('Resource URL must be specified for data fetching.');
    }

    // Default to asynchronous mode if not explicitly set.
    var isAsync = 'asyncMode' in fetchOptions ? fetchOptions.asyncMode : true;

    if (!isAsync) {
      // Synchronous request: return the response directly.
      if (flxUtil && flxUtil.xhr) {
        return flxUtil.xhr.doReq({ url: fetchOptions.resourceURL, async: false });
      } else { // Assume jQuery/Zepto
        var syncResponse = jqObj.ajax({ url : fetchOptions.resourceURL, async : false });
        return syncResponse.responseText;
      }
    }

    // Asynchronous request: return the request object.
    if (flxUtil && flxUtil.xhr) {
      return flxUtil.xhr.send({
        url : fetchOptions.resourceURL,
        method : 'get', // Fleegix default method
        handleSuccess : fetchOptions.onSuccess,
        handleErr : fetchOptions.onError
      });
    } else { // Assume jQuery/Zepto
      return jqObj.ajax({
        url : fetchOptions.resourceURL,
        method : 'GET', // jQuery/Zepto default method
        error : fetchOptions.onError,
        success : fetchOptions.onSuccess
      });
    }
  };

  // The primary DateTime constructor, providing timezone-aware date/time handling.
  // Mimics the native JavaScript Date object's constructor signatures, with an optional timezone string.
  zoneKit.DateTime = function () {
    var inputArgs = Array.from(arguments);
    var dateObj = null;
    var timeZoneId = null;
    var dateComponents = [];

    // Handle the case where the first argument is an array (e.g., `new DateTime([2023, 10, 26, 'America/New_York'])`)
    if (Object.prototype.toString.call(inputArgs[0]) === '[object Array]') {
      inputArgs = inputArgs[0];
    }

    // Extract timezone string if it's the last argument and matches a common timezone pattern (e.g., "America/New_York")
    var lastArg = inputArgs[inputArgs.length - 1];
    if (typeof lastArg === 'string' && /^[a-zA-Z]+\//gi.test(lastArg)) {
      timeZoneId = inputArgs.pop();
    }

    // Determine the initial Date object based on argument count.
    var argCount = inputArgs.length;
    if (argCount === 0) {
      dateObj = new Date(); // Current date and time
    } else if (argCount === 1) {
      dateObj = new Date(inputArgs[0]); // Single argument: timestamp, date string, or another Date object
    } else {
      // Multiple arguments: year, month, day, hours, minutes, seconds, milliseconds
      // Fill missing components with 0.
      for (var k = 0; k < 7; k++) {
        dateComponents[k] = inputArgs[k] || 0;
      }
      dateObj = new Date(dateComponents[0], dateComponents[1], dateComponents[2], dateComponents[3], dateComponents[4], dateComponents[5], dateComponents[6]);
    }

    // Internal helper to get an array of date/time parts for UTC calculations.
    this.fetchDateTimeParts = function () {
      return [this.fullYear, this.calMonth, this.dayOfMonth, this.clockHours, this.clockMinutes, this.clockSeconds, this.clockMilliseconds, this.currentZone];
    };

    // Initialize internal state variables.
    this.isCacheValid = false;
    this.zoneInfoData = {};
    this.weekDayIndex = 0; // 0 for Sunday, 6 for Saturday
    this.fullYear = 0;
    this.calMonth = 0; // 0 for January, 11 for December
    this.dayOfMonth = 0;
    this.clockHours = 0;
    this.clockMinutes = 0;
    this.clockSeconds = 0;
    this.clockMilliseconds = 0;
    this.currentZone = timeZoneId || null;
    this.isUTCMode = (timeZoneId === 'Etc/UTC' || timeZoneId === 'Etc/GMT');

    // Populate this DateTime object from the proxy Date object.
    // The `useUTC` flag determines if UTC getters should be used on the proxy.
    // This is crucial for single-argument constructors (millis, Date object)
    // when a timezone is specified, as the `dateObj` is treated as UTC.
    var useUTC = (!dateComponents.length && !!timeZoneId);
    this.updateInternalDateTime(dateObj, useUTC);
  };

  // Prototype methods for zoneKit.DateTime, largely mirroring native Date methods.
  zoneKit.DateTime.prototype = {
    obtainDate: function () { return this.dayOfMonth; },
    retrieveDay: function () { return this.weekDayIndex; },
    getTheFullYear: function () { return this.fullYear; },
    getTheMonth: function () { return this.calMonth; },
    getTheYear: function () { return this.fullYear; }, // Alias for getTheFullYear
    getClockHours: function () { return this.clockHours; },
    getClockMilliseconds: function () { return this.clockMilliseconds; },
    getClockMinutes: function () { return this.clockMinutes; },
    getClockSeconds: function () { return this.clockSeconds; },

    // Calculate the time in milliseconds since epoch, adjusted for the specified timezone.
    calcTime: function () {
      // Use Date.UTC to get UTC milliseconds from components
      var utcMillis = Date.UTC(this.fullYear, this.calMonth, this.dayOfMonth,
                               this.clockHours, this.clockMinutes, this.clockSeconds,
                               this.clockMilliseconds);
      // Adjust by the timezone offset to get the time in the specified zone.
      return utcMillis + (this.fetchTimezoneOffset() * 60 * 1000);
    },

    retrieveTimezone: function () { return this.currentZone; },
    fetchTimezoneOffset: function () { return this.fetchTimezoneDetails().tzOffset; },
    retrieveTimezoneAbbr: function () { return this.fetchTimezoneDetails().tzAbbr; },

    // Retrieves detailed timezone information (offset and abbreviation).
    fetchTimezoneDetails: function () {
      // If in UTC mode, the offset is 0 and abbreviation is 'UTC'.
      if (this.isUTCMode) {
        return { tzOffset: 0, tzAbbr: 'UTC' };
      }
      // If cached data is valid, return it.
      if (this.isCacheValid) {
        return this.zoneInfoData;
      }

      var zoneDetails;
      // If a timezone is explicitly set, use it to get info.
      if (this.currentZone) {
        var tempDateForTzLookup = new Date(this.calcTime()); // Use the adjusted time for lookup
        zoneDetails = zoneKit.timezone.getTzInfo(tempDateForTzLookup, this.currentZone);
      } else {
        // If no specific timezone, use the local browser's offset.
        zoneDetails = { tzOffset: this.getBrowserOffset(), tzAbbr: null };
      }

      // Cache the results and mark cache as valid.
      this.zoneInfoData = zoneDetails;
      this.isCacheValid = true;
      return zoneDetails;
    },

    // UTC-based getters, delegating to a proxy Date object.
    obtainUTCDate: function () { return this.getUTCProxyDate().getUTCDate(); },
    obtainUTCDay: function () { return this.getUTCProxyDate().getUTCDay(); },
    obtainUTCFullYear: function () { return this.getUTCProxyDate().getUTCFullYear(); },
    obtainUTCHours: function () { return this.getUTCProxyDate().getUTCHours(); },
    obtainUTCMilliseconds: function () { return this.getUTCProxyDate().getUTCMilliseconds(); },
    obtainUTCMinutes: function () { return this.getUTCProxyDate().getUTCMinutes(); },
    obtainUTCMonth: function () { return this.getUTCProxyDate().getUTCMonth(); },
    obtainUTCSeconds: function () { return this.getUTCProxyDate().getUTCSeconds(); },

    // Setter methods
    adjustDate: function (val) { this.modifyAttribute('dayOfMonth', val); },
    setFullYearValue: function (val) { this.modifyAttribute('fullYear', val); },
    alterMonth: function (val) { this.modifyAttribute('calMonth', val); },
    setYearValue: function (val) { this.modifyAttribute('fullYear', val); }, // Alias for setFullYearValue
    adjustHours: function (val) { this.modifyAttribute('clockHours', val); },
    adjustMilliseconds: function (val) { this.modifyAttribute('clockMilliseconds', val); },
    adjustMinutes: function (val) { this.modifyAttribute('clockMinutes', val); },
    adjustSeconds: function (val) { this.modifyAttribute('clockSeconds', val); },

    // Set the internal time based on milliseconds since epoch.
    adjustTime: function (msValue) {
      if (typeof msValue !== 'number' || isNaN(msValue)) {
        throw new Error('Milliseconds value must be a valid number.');
      }
      var tempDate = new Date(0);
      // Calculate UTC milliseconds needed for the proxy Date object,
      // accounting for the current timezone offset.
      var adjustedUTCMs = msValue - (this.fetchTimezoneOffset() * 60 * 1000);
      tempDate.setUTCMilliseconds(adjustedUTCMs);
      this.updateInternalDateTime(tempDate, true); // Update using UTC components of the proxy.
    },

    // UTC-based setters.
    updateUTCDate: function (val) { this.modifyUTCAttribute('dayOfMonth', val); },
    updateUTCFullYear: function (val) { this.modifyUTCAttribute('fullYear', val); },
    updateUTCHours: function (val) { this.modifyUTCAttribute('clockHours', val); },
    updateUTCMilliseconds: function (val) { this.modifyUTCAttribute('clockMilliseconds', val); },
    updateUTCMinutes: function (val) { this.modifyUTCAttribute('clockMinutes', val); },
    updateUTCMonth: function (val) { this.modifyUTCAttribute('calMonth', val); },
    updateUTCSeconds: function (val) { this.modifyUTCAttribute('clockSeconds', val); },

    // Standard Date object string representations.
    formatAsGMT: function () { return this.convertToString('EEE, dd MMM yyyy HH:mm:ss Z', 'Etc/GMT'); },
    toLocaleDateString: function () { return new Date(this.calcTime()).toLocaleDateString(); },
    toLocaleString: function () { return new Date(this.calcTime()).toLocaleString(); },
    toLocaleTimeString: function () { return new Date(this.calcTime()).toLocaleTimeString(); },
    toSource: function () { return 'new zoneKit.DateTime(' + JSON.stringify(this.fetchDateTimeParts()) + ')'; }, // Custom toSource
    toISODateString: function () { return this.convertToString('yyyy-MM-ddTHH:mm:ss.SSS', 'Etc/UTC') + 'Z'; },
    toJSON: function () { return this.toISODateString(); },

    // Flexible method to format the DateTime object into a string based on a provided format pattern.
    convertToString: function (formatPattern, targetTimeZone) {
      // Default format if none provided.
      if (!formatPattern) {
        return this.convertToString('yyyy-MM-dd HH:mm:ss');
      }

      var formattedResult = formatPattern;
      var currentInstance = this;

      // If a targetTimeZone is specified, create a temporary clone and set its timezone for formatting.
      if (targetTimeZone) {
        currentInstance = this.duplicateInstance();
        currentInstance.assignTimezone(targetTimeZone);
      }

      var zoneData = targetTimeZone ? zoneKit.timezone.getTzInfo(new Date(this.calcTime()), targetTimeZone) : this.fetchTimezoneDetails();
      var currentHours = currentInstance.getClockHours();

      // Replace format tokens with actual date/time components.
      formattedResult = formattedResult
      // Mask 'a' to avoid conflict with 'AM/PM' replacement if 'a' is intended for month abbreviation.
      .replace(/a+/g, function () { return 'K'; })
      // Year (`y`)
      .replace(/y+/g, function (token) { return padNumberToLength(currentInstance.getTheFullYear(), token.length); })
      // Day of month (`d`)
      .replace(/d+/g, function (token) { return padNumberToLength(currentInstance.obtainDate(), token.length); })
      // Minutes (`m`)
      .replace(/m+/g, function (token) { return padNumberToLength(currentInstance.getClockMinutes(), token.length); })
      // Seconds (`s`)
      .replace(/s+/g, function (token) { return padNumberToLength(currentInstance.getClockSeconds(), token.length); })
      // Milliseconds (`S`)
      .replace(/S+/g, function (token) { return padNumberToLength(currentInstance.getClockMilliseconds(), token.length); })
      // Month (`M`) - handles numeric (MM) and text (MMM, MMMM) representations.
      .replace(/M+/g, function (token) {
        var monthIndex = currentInstance.getTheMonth();
        var tokenLength = token.length;
        if (tokenLength > 3) {
          return CAL_MONTHS[monthIndex]; // Full month name
        } else if (tokenLength > 2) {
          return CAL_MONTHS[monthIndex].substring(0, tokenLength); // Abbreviated month name
        }
        return padNumberToLength(monthIndex + 1, tokenLength); // Numeric month (1-12)
      })
      // AM/PM marker (`k` or `K`)
      .replace(/K+/g, function () {
        if (currentHours >= 12) {
          return 'PM';
        }
        return 'AM';
      })
      // Hours (`H`) - 12-hour format, adjusted for AM/PM logic.
      .replace(/H+/g, function (token) {
        var displayHours = currentHours;
        if (displayHours === 0) displayHours = 12; // 12 AM
        else if (displayHours > 12) displayHours -= 12; // PM hours
        return padNumberToLength(displayHours, token.length);
      })
      // Day of week (`E`) - abbreviated.
      .replace(/E+/g, function (token) { return WEEK_DAYS[currentInstance.retrieveDay()].substring(0, token.length); })
      // Timezone abbreviation (`Z`)
      .replace(/Z+/gi, function () { return zoneData.tzAbbr || ''; });
    },

    toUTCString: function () { return this.formatAsGMT(); },
    getNumericalValue: function () { return this.calcTime(); },

    // Creates a new DateTime instance with the same date/time components.
    duplicateInstance: function () {
      return new zoneKit.DateTime(this.fetchDateTimeParts());
    },

    // Updates the internal date/time properties from a native Date object.
    updateInternalDateTime: function (sourceDate, useUTCGetters) {
      if (!sourceDate instanceof Date) {
        throw new Error("Source must be a Date object.");
      }
      this.fullYear = useUTCGetters ? sourceDate.getUTCFullYear() : sourceDate.getFullYear();
      this.calMonth = useUTCGetters ? sourceDate.getUTCMonth() : sourceDate.getMonth();
      this.dayOfMonth = useUTCGetters ? sourceDate.getUTCDate() : sourceDate.getDate();
      this.clockHours = useUTCGetters ? sourceDate.getUTCHours() : sourceDate.getHours();
      this.clockMinutes = useUTCGetters ? sourceDate.getUTCMinutes() : sourceDate.getMinutes();
      this.clockSeconds = useUTCGetters ? sourceDate.getUTCSeconds() : sourceDate.getSeconds();
      this.clockMilliseconds = useUTCGetters ? sourceDate.getUTCMilliseconds() : sourceDate.getMilliseconds();
      this.weekDayIndex = useUTCGetters ? sourceDate.getUTCDay() : sourceDate.getDay();
      this.dateProxyObject = sourceDate; // Store the proxy for some operations
      this.isCacheValid = false; // Invalidate timezone info cache
    },

    // Returns a native Date object representing the current DateTime in UTC.
    getUTCProxyDate: function () {
      var utcTime = Date.UTC(this.fullYear, this.calMonth, this.dayOfMonth,
                             this.clockHours, this.clockMinutes, this.clockSeconds,
                             this.clockMilliseconds);
      var utcDate = new Date(utcTime);
      // Adjust the UTC date by adding the timezone offset to make it truly UTC-equivalent
      // (as if the current timezone's local time was UTC).
      utcDate.setUTCMinutes(utcDate.getUTCMinutes() + this.fetchTimezoneOffset());
      return utcDate;
    },

    // Generic setter for local date/time attributes.
    modifyAttribute: function (attributeName, value) {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Attribute value for "' + attributeName + '" must be a number.');
      }
      var proxyDate = this.dateProxyObject;
      var methodNameSuffix = '';
      switch (attributeName) {
        case 'fullYear': methodNameSuffix = 'FullYear'; break;
        case 'calMonth': methodNameSuffix = 'Month'; break;
        case 'dayOfMonth': methodNameSuffix = 'Date'; break;
        case 'clockHours': methodNameSuffix = 'Hours'; break;
        case 'clockMinutes': methodNameSuffix = 'Minutes'; break;
        case 'clockSeconds': methodNameSuffix = 'Seconds'; break;
        case 'clockMilliseconds': methodNameSuffix = 'Milliseconds'; break;
        default: throw new Error('Unsupported attribute: ' + attributeName);
      }
      proxyDate['set' + methodNameSuffix](value);
      this.updateInternalDateTime(proxyDate, false); // Update from local components
    },

    // Generic setter for UTC date/time attributes.
    modifyUTCAttribute: function (attributeName, value) {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('UTC attribute value for "' + attributeName + '" must be a number.');
      }
      var utcProxy = this.getUTCProxyDate();
      var methodNameSuffix = '';
      switch (attributeName) {
        case 'fullYear': methodNameSuffix = 'FullYear'; break;
        case 'calMonth': methodNameSuffix = 'Month'; break;
        case 'dayOfMonth': methodNameSuffix = 'Date'; break;
        case 'clockHours': methodNameSuffix = 'Hours'; break;
        case 'clockMinutes': methodNameSuffix = 'Minutes'; break;
        case 'clockSeconds': methodNameSuffix = 'Seconds'; break;
        case 'clockMilliseconds': methodNameSuffix = 'Milliseconds'; break;
        default: throw new Error('Unsupported UTC attribute: ' + attributeName);
      }
      utcProxy['setUTC' + methodNameSuffix](value);
      // Adjust back the minutes that were added in getUTCProxyDate.
      utcProxy.setUTCMinutes(utcProxy.getUTCMinutes() - this.fetchTimezoneOffset());
      this.updateInternalDateTime(utcProxy, true); // Update from UTC components
    },

    // Assigns a new timezone to the DateTime object.
    assignTimezone: function (newTimeZone) {
      if (this.currentZone === newTimeZone) {
        // No change needed if the timezone is already the same.
        return;
      }

      var oldOffset = this.fetchTimezoneDetails().tzOffset;

      this.isUTCMode = (newTimeZone === 'Etc/UTC' || newTimeZone === 'Etc/GMT');
      this.currentZone = newTimeZone;
      this.isCacheValid = false; // Invalidate cache for new timezone

      // Create a temporary clone to calculate the new date/time based on the offset change.
      var temporaryClone = this.duplicateInstance();
      var newOffset = temporaryClone.fetchTimezoneDetails().tzOffset; // Get offset for the new timezone.

      // Adjust the UTC minutes of the clone by the delta between old and new timezone offsets.
      temporaryClone.updateUTCMinutes(temporaryClone.obtainUTCMinutes() - newOffset + oldOffset);

      // Update the current instance from the adjusted clone.
      this.updateInternalDateTime(temporaryClone, this.isUTCMode);
    },

    // Removes any specified timezone, reverting to local system time (without altering time value).
    clearTimezone: function () {
      this.isUTCMode = false;
      this.currentZone = null;
      this.isCacheValid = false;
      // No need to adjust date/time values, just clear the timezone context.
    },

    // Converts a Gregorian calendar date to a Julian Day Number.
    computeJulianDay: function (yearVal, monthVal, dayVal) {
      var adjustFactor;
      // Adjust month to be 1-based, then handle year wraparound for Jan/Feb.
      monthVal++;
      if (monthVal > 12) {
        adjustFactor = Math.floor(monthVal / 12);
        monthVal %= 12;
        yearVal += adjustFactor;
      }
      if (monthVal <= 2) {
        yearVal -= 1;
        monthVal += 12;
      }

      var alpha = Math.floor(yearVal / 100);
      var beta = 2 - alpha + Math.floor(alpha / 4);
      var julianDayNum = Math.floor(365.25 * (yearVal + 4716)) + Math.floor(30.6001 * (monthVal + 1)) + dayVal + beta - 1524;
      return julianDayNum;
    },

    // Retrieves the browser's local timezone offset in minutes.
    getBrowserOffset: function () {
      // Delegates to the proxy Date object's method.
      return this.dateProxyObject.getTimezoneOffset();
    }
  };


  zoneKit.timezone = new function () {
    var selfRef = this; // Reference to 'this' (the timezone object)

    // Maps for converting month/day names to numeric indices.
    var monthToNumMap = {};
    var dayToNumMap = {};

    // Initial region mappings for common timezone prefixes.
    var tzRegionMap = {
      'EST':'northamerica','MST':'northamerica','HST':'northamerica',
      'EST5EDT':'northamerica','CST6CDT':'northamerica','MST7MDT':'northamerica',
      'PST8PDT':'northamerica','America':'northamerica','Pacific':'australasia',
      'Atlantic':'europe','Africa':'africa','Indian':'africa','Antarctica':'antarctica',
      'Asia':'asia','Australia':'australasia','Europe':'europe','WET':'europe',
      'CET':'europe','MET':'europe','EET':'europe'
    };

    // Specific exceptions where the region cannot be determined from the prefix alone.
    var specialRegionZones = {
      'Etc/GMT':'etcetera','Etc/UTC':'etcetera','Pacific/Honolulu':'northamerica',
      'Atlantic/Bermuda':'northamerica','Atlantic/Cape_Verde':'africa',
      'Atlantic/St_Helena':'africa','Indian/Kerguelen':'antarctica',
      'Indian/Chagos':'asia','Indian/Maldives':'asia','Indian/Christmas':'australasia',
      'Indian/Cocos':'australasia','America/Danmarkshavn':'europe',
      'America/Scoresbysund':'europe','America/Godthab':'europe',
      'America/Thule':'europe','Asia/Yekaterinburg':'europe',
      'Asia/Omsk':'europe','Asia/Novosibirsk':'europe','Asia/Krasnoyarsk':'europe',
      'Asia/Irkutsk':'europe','Asia/Yakutsk':'europe','Asia/Vladivostok':'europe',
      'Asia/Sakhalin':'europe','Asia/Magadan':'europe','Asia/Kamchatka':'europe',
      'Asia/Anadyr':'europe','Africa/Ceuta':'europe',
      'America/Argentina/Buenos_Aires':'southamerica',
      'America/Argentina/Cordoba':'southamerica',
      'America/Argentina/Tucuman':'southamerica',
      'America/Argentina/La_Rioja':'southamerica',
      'America/Argentina/San_Juan':'southamerica',
      'America/Argentina/Jujuy':'southamerica',
      'America/Argentina/Catamarca':'southamerica',
      'America/Argentina/Mendoza':'southamerica',
      'America/Argentina/Rio_Gallegos':'southamerica',
      'America/Argentina/Ushuaia':'southamerica',
      'America/Aruba':'southamerica','America/La_Paz':'southamerica',
      'America/Noronha':'southamerica','America/Belem':'southamerica',
      'America/Fortaleza':'southamerica','America/Recife':'southamerica',
      'America/Araguaina':'southamerica','America/Maceio':'southamerica',
      'America/Bahia':'southamerica','America/Sao_Paulo':'southamerica',
      'America/Campo_Grande':'southamerica','America/Cuiaba':'southamerica',
      'America/Porto_Velho':'southamerica','America/Boa_Vista':'southamerica',
      'America/Manaus':'southamerica','America/Eirunepe':'southamerica',
      'America/Rio_Branco':'southamerica','America/Santiago':'southamerica',
      'Pacific/Easter':'southamerica','America/Bogota':'southamerica',
      'America/Curacao':'southamerica','America/Guayaquil':'southamerica',
      'Pacific/Galapagos':'southamerica','Atlantic/Stanley':'southamerica',
      'America/Cayenne':'southamerica','America/Guyana':'southamerica',
      'America/Asuncion':'southamerica','America/Lima':'southamerica',
      'Atlantic/South_Georgia':'southamerica','America/Paramaribo':'southamerica',
      'America/Port_of_Spain':'southamerica','America/Montevideo':'southamerica',
      'America/Caracas':'southamerica'
    };

    // Populate monthToNumMap (e.g., 'jan': 0)
    var monthIter = 0;
    while (monthIter < CAL_MONTHS.length) {
      monthToNumMap[CAL_MONTHS[monthIter].substring(0,3).toLowerCase()] = monthIter;
      monthIter++;
    }

    // Populate dayToNumMap (e.g., 'sun': 0)
    var dayIter = 0;
    while (dayIter < WEEK_DAYS.length) {
      dayToNumMap[WEEK_DAYS[dayIter].substring(0,3).toLowerCase()] = dayIter;
      dayIter++;
    }

    // Throws an error for an unrecognized or uninitialized timezone.
    function throwInvalidZoneError(zoneId) {
      throw new Error('Timezone "' + zoneId + '" is either invalid, malformed, or its data has not been loaded into the registry.');
    }

    // Internal function to load a timezone data file using the configured transport.
    // `fileIdentifier`: Name of the zone file (e.g., 'northamerica').
    // `loadOptions`: Options including `asyncMode` and `callback`.
    function loadZoneFileInternal(fileIdentifier, loadOptions) {
      var fullURL = selfRef.zoneDataPath + '/' + fileIdentifier;
      var opts = loadOptions || {};

      if (!opts.asyncMode) {
        // Synchronous load: fetch and parse immediately.
        var fileContent = selfRef.asyncDataHandler({ resourceURL : fullURL, asyncMode : false });
        return selfRef.processZoneData(fileContent);
      } else {
        // Asynchronous load: use callbacks.
        return selfRef.asyncDataHandler({
          asyncMode: true,
          resourceURL : fullURL,
          onSuccess : function (responseContent) {
            if (selfRef.processZoneData(responseContent) && typeof opts.callback === 'function') {
              opts.callback(); // Execute user callback on successful load and parse.
            }
            return true;
          },
          onError : function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching timezone file:', fullURL, textStatus, errorThrown);
            throw new Error('Failed to retrieve timezone data file: "' + fullURL + '"');
          }
        });
      }
    }

    // Determines the region for a given timezone identifier.
    function determineZoneRegion(zoneIdentifier) {
      var specialCase = specialRegionZones[zoneIdentifier];
      if (specialCase) return specialCase;

      var firstPart = zoneIdentifier.split('/')[0];
      var identifiedRegion = tzRegionMap[firstPart];

      // If a region is found by prefix, return it.
      if (identifiedRegion) return identifiedRegion;

      // If not, check if it's a link to another zone (e.g., 'Cuba' -> 'America/Havana').
      var linkedZone = selfRef.zoneRegistry[zoneIdentifier];
      if (typeof linkedZone === 'string') {
        return determineZoneRegion(linkedZone); // Recursively find region for the linked zone.
      }

      // If still not found and 'backward' compatibility file isn't loaded, try loading it.
      if (!selfRef.loadedZoneFiles.backward) {
        selfRef.requestZoneFile('backward'); // Request the backward-compat file.
        // After loading, retry finding the region. This might involve a synchronous re-call
        // if the initial call was synchronous, or a deferred check if async.
        // For synchronous, this recursive call will now succeed if the zone is in 'backward'.
        return determineZoneRegion(zoneIdentifier);
      }

      throwInvalidZoneError(zoneIdentifier); // If all attempts fail, throw an error.
    }

    // Parses a time string (e.g., "1:00", "2:00:00", "0:00s") into hour, minute, second components.
    function decodeTimeString(timeString) {
      // Regex to capture hours, optional minutes, optional seconds, and an optional suffix.
      var timePattern = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
      var matches = timeString.match(timePattern);

      if (!matches) {
        throw new Error('Invalid time string format: ' + timeString);
      }

      var hourVal = parseInt(matches[1], 10);
      var minuteVal = matches[2] ? parseInt(matches[2], 10) : 0;
      var secondVal = matches[3] ? parseInt(matches[3], 10) : 0;

      // Return as an array: [full_match, hours, minutes, seconds, suffix]
      return [matches[0], hourVal, minuteVal, secondVal, matches[4]];
    }

    // Finds the appropriate timezone rule entry for a given date and timezone identifier.
    function findRelevantZoneEntry(targetDate, zoneIdentifier) {
      var currentZoneId = zoneIdentifier;
      var zoneDefinitionList = selfRef.zoneRegistry[currentZoneId];

      // Follow any links to the actual zone definition.
      while (typeof zoneDefinitionList === "string") {
        currentZoneId = zoneDefinitionList;
        zoneDefinitionList = selfRef.zoneRegistry[currentZoneId];
      }

      if (!zoneDefinitionList) {
        // If the zone definition is not found, attempt to load backward compatibility data.
        if (!selfRef.loadedZoneFiles.backward) {
          selfRef.requestZoneFile('backward');
          // Retry after loading backward file.
          return findRelevantZoneEntry(targetDate, zoneIdentifier);
        }
        throwInvalidZoneError(currentZoneId);
      }

      var foundEntry = null;
      // Iterate through zone entries to find the one effective for the target date.
      for (var i = 0; i < zoneDefinitionList.length; i++) {
        var zoneRecord = zoneDefinitionList[i];
        // The last entry in a zone list has no 'until' field, so it applies indefinitely.
        if (!zoneRecord[3]) {
          foundEntry = zoneRecord;
          break;
        }

        // Parse the 'until' date for the current zone record.
        var recordYear = parseInt(zoneRecord[3], 10);
        var recordMonth = 11; // Default to December
        var recordDay = 31; // Default to 31st

        if (zoneRecord[4]) {
          recordMonth = monthToNumMap[zoneRecord[4].substring(0, 3).toLowerCase()];
          recordDay = parseInt(zoneRecord[5], 10);
        }

        var timeParts = decodeTimeString(zoneRecord[6] || '23:59:59');
        // Create a UTC date for the 'until' boundary.
        var utcBoundaryDate = Date.UTC(recordYear, recordMonth, recordDay, timeParts[1], timeParts[2], timeParts[3]);

        // If the target date is before this boundary, this is the correct zone entry.
        if (targetDate.valueOf() < utcBoundaryDate) {
          foundEntry = zoneRecord;
          break;
        }
      }

      if (!foundEntry) {
        throw new Error('No valid zone rule found for timezone "' + zoneIdentifier + '" on ' + targetDate.toISOString());
      }
      return foundEntry;
    }

    // Calculates the base offset (in minutes) from a zone record's offset string.
    function calculateBaseOffset(zoneRecord) {
      var offsetComponents = decodeTimeString(zoneRecord[0]);
      var isNegative = zoneRecord[0].indexOf('-') === 0;
      var signMultiplier = isNegative ? -1 : 1;

      var totalSeconds = (offsetComponents[1] * 3600) + (offsetComponents[2] * 60) + offsetComponents[3];
      var offsetMillis = signMultiplier * totalSeconds * 1000;

      // Convert milliseconds to minutes and negate (Olson offsets are positive for West of GMT, JS Date.getTimezoneOffset is positive for East of GMT).
      return -offsetMillis / 60 / 1000;
    }

    // The rest of the timezone object's properties and methods will be defined here.
    // selfRef.getTzInfo = ...
    // selfRef.zoneRegistry = ...
    // selfRef.zoneDataPath = ...
    // selfRef.loadedZoneFiles = ...
    // selfRef.requestZoneFile = ...
    // selfRef.processZoneData = ...
  };
})();