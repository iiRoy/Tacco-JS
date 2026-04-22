// This file provides the `timezoneJS.Date` object, offering complete timezone support independently
// of the end-user's machine settings. It relies on Olson zoneinfo files for its timezone data.
//
// The constructor and setter methods internally utilize proxy JavaScript Date objects, allowing
// for flexible date string inputs like '10/22/2006'. It also replicates the sensible wraparound
// behavior of numeric parameters, where, for instance, a month value of 14 correctly
// wraps around to the following March.
//
// A key distinction from the native JavaScript Date object is that `timezoneJS.Date` includes
// named properties for year, month, date, etc., making it directly serializable to JSON
// for seamless data transfer.

/*
* Copyright 2010 Matthew Eernisse (mde@fleegix.org)
* and Open Source Applications Foundation
*
* Licensed under the Apache License, Version 20 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Credits: Ideas were incorporated from an incomplete JS implementation of the Olson
* parser, specifically "XMLDAte" by Philippe Goetz (philippe.goetz@wanadoo.fr).
*
* Contributions from:
* Jan Niehusmann
* Ricky Romero
* Preston Hunt (prestonhunt@gmail.com)
* Dov. B Katz (dov.katz@morganstanley.com)
* Peter Bergström (pbergstr@mac.com)
* Long Ho
*/
( function() {

  // Standard initialization to ensure the library functions correctly
  // in both client (browser) and server (Node.js) environments.
  var root = this;

  var timezoneJS;

  if ( typeof exports !== 'undefined' ) {
    timezoneJS = exports;
  } else {
    timezoneJS = root.timezoneJS = {};
  }

  timezoneJS.VERSION = '1.0.0';

  // Retrieve the AJAX library from the global context.
  // This could be jQuery, Zepto, or fleegix.
  // Developers can also define a custom transport mechanism by assigning
  // a function to `timezoneJS.timezone.transport`.
  var $ = root.$ || root.jQuery || root.Zepto,
  fleegix = root.fleegix;

  // Define constant arrays for days and months. Note that due to the
  // English-centric nature of Olson data, i18n is not directly supported here.
  var Days = timezoneJS.Days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
  Months = timezoneJS.Months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];


  // Helper function to format a number to a specific digit length.
  // Examples:
  // `_fixWidth(2, 2)` returns '02'
  // `_fixWidth(1998, 2)` returns '98'
  // This is used for padding numbers when converting dates to ISO string format.
  var _fixWidth = function( number, digits ) {
    if ( typeof number !== "number" ) {
      throw "not a number: " + number;
    }

    var s = number.toString();

    if ( number.length > digits ) {
      return number.substr( number.length - digits, number.length );
    }

    while ( s.length < digits ) {
      s = '0' + s;
    }

    return s;
  };

  // This is an abstraction layer for various transport mechanisms,
  // including fleegix, jQuery, and Zepto.
  // The `opts` object may contain:
  // - `url`: The URL for the AJAX request.
  // - `async`: Boolean, true for asynchronous (default), false for synchronous.
  //            If false, the response from the URL is returned directly.
  // - `success`: Callback function for successful requests.
  // - `error`: Callback function for failed requests.
  // Returns the response from the URL if `async` is false, otherwise returns the AJAX request object itself.
  var _transport = function( opts ) {

    if ( ( !fleegix || typeof fleegix.xhr === 'undefined' ) && ( !$ || typeof $.ajax === 'undefined' ) ) {
      throw new Error( 'Please use the Fleegix.js XHR module, jQuery ajax, Zepto ajax, or define your own transport mechanism for downloading zone files.' );
    }

    if ( !opts ) return;

    if ( !opts.url ) throw new Error( 'URL must be specified' );

    if ( !( 'async' in opts ) ) opts.async = true;

    if ( !opts.async ) {
      return fleegix && fleegix.xhr
        ? fleegix.xhr.doReq( { url: opts.url, async: false } )
        : $.ajax( { url : opts.url, async : false } ).responseText;
    }

    return fleegix && fleegix.xhr
      ? fleegix.xhr.send( {
        url : opts.url,
        method : 'get',
        handleSuccess : opts.success,
        handleErr : opts.error
      } )
      : $.ajax( {
        url : opts.url,
        method : 'GET',
        error : opts.error,
        success : opts.success
      } );
  };

  // Constructor for timezoneJS.Date, mimicking the native Date object's constructor.
  timezoneJS.Date = function() {
    var args = Array.prototype.slice.apply( arguments ),
    dt = null,
    tz = null,
    arr = [];

    // Supports various constructors, including all from the native `Date` object,
    // with an optional timezone string at the end.
    //
    // - `[tz]`: Creates an object with time in the specified `tz`.
    // - `utcMillis`, `[tz]`: Creates an object with UTC time = `utcMillis`, in `tz`.
    // - `Date`, `[tz]`: Creates an object with UTC time = `Date.getTime()`, in `tz`.
    // - `year, month, [date,] [hours,] [minutes,] [seconds,] [millis,] [tz]`:
    //   Similar to the `Date` object constructor, with an added timezone.
    // - `Array`: Can be any combination of the above.
    //
    // If the first argument is an array, it can be used directly as the argument list.
    if ( Object.prototype.toString.call( args[0] ) === '[object Array]' ) {
      args = args[0];
    }

    if ( typeof args[ args.length - 1 ] === 'string' && /^[a-zA-Z]+\//gi.test( args[ args.length - 1 ] ) ) {
      tz = args.pop();
    }

    switch ( args.length ) {
      case 0:
        dt = new Date();
        break;
      case 1:
        dt = new Date( args[0] );
        break;
      default:
        for ( var i = 0; i < 7; i++ ) {
          arr[i] = args[i] || 0;
        }
        dt = new Date( arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6] );
        break;
    }

    // Private method to extract time components into an array.
    this._extractTimeArray = function() {
      return [ this.year, this.month, this.date, this.hours, this.minutes, this.seconds, this.milliseconds, this.timezone ];
    };

    this._useCache = false;
    this._tzInfo = {};
    this._day = 0;
    this.year = 0;
    this.month = 0;
    this.date = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.milliseconds = 0;
    this.timezone = tz || null;
    this.utc = tz === 'Etc/UTC' || tz === 'Etc/GMT';

    // A tricky part:
    // For cases with 1 or 2 arguments (`timezoneJS.Date(millis, [tz])` and `timezoneJS.Date(Date, [tz])`),
    // the created `dt` should be in UTC. This is detected if `arr` is empty and `tz` is specified.
    // If `tz` is not specified, `dt` can be in local time.
    this.setFromDateObjProxy( dt, !arr.length && tz );
  };

  // Prototype methods for timezoneJS.Date, largely mirroring the native Date object.
  timezoneJS.Date.prototype = {

    getDate: function() { return this.date; },

    getDay: function() { return this._day; },

    getFullYear: function() { return this.year; },

    getMonth: function() { return this.month; },

    getYear: function() { return this.year; },

    getHours: function() { return this.hours; },

    getMilliseconds: function() { return this.milliseconds; },

    getMinutes: function() { return this.minutes; },

    getSeconds: function() { return this.seconds; },

    // Returns the time adjusted to the user-specified timezone.
    getTime: function() {
      var dt = Date.UTC.apply( root, this._extractTimeArray() );
      return dt + ( this.getTimezoneOffset() * 60 * 1000 );
    },

    getTimezone: function() { return this.timezone; },

    getTimezoneOffset: function() { return this.getTimezoneInfo().tzOffset; },

    getTimezoneAbbreviation: function() { return this.getTimezoneInfo().tzAbbr; },

    getTimezoneInfo: function() {
      // If UTC, it's straightforward!
      if ( this.utc ) return { tzOffset: 0, tzAbbr: 'UTC' };

      if ( this._useCache ) return this._tzInfo;

      var res;

      // If a timezone is specified, retrieve the correct timezone info based on the given Date.
      if ( this.timezone ) {
        var dt = new Date( Date.UTC.apply( root, this._extractTimeArray() ) );
        var tz = this.timezone;
        res = timezoneJS.timezone.getTzInfo( dt, tz );
      }
      // If no timezone is specified, use the local browser offset.
      else {
        res = { tzOffset: this.getLocalOffset(), tzAbbr: null };
      }

      this._tzInfo = res;
      this._useCache = true;
      return res;
    },

    getUTCDate: function() { return this.getUTCDateProxy().getUTCDate(); },

    getUTCDay: function() { return this.getUTCDateProxy().getUTCDay(); },

    getUTCFullYear: function() { return this.getUTCDateProxy().getUTCFullYear(); },

    getUTCHours: function() { return this.getUTCDateProxy().getUTCHours(); },

    getUTCMilliseconds: function() { return this.getUTCDateProxy().getUTCMilliseconds(); },

    getUTCMinutes: function() { return this.getUTCDateProxy().getUTCMinutes(); },

    getUTCMonth: function() { return this.getUTCDateProxy().getUTCMonth(); },

    getUTCSeconds: function() { return this.getUTCDateProxy().getUTCSeconds(); },

    setDate: function( n ) { this.setAttribute( 'date', n ); },

    setFullYear: function( n ) { this.setAttribute( 'year', n ); },

    setMonth: function( n ) { this.setAttribute( 'month', n ); },

    setYear: function( n ) { this.setUTCAttribute( 'year', n ); },

    setHours: function( n ) { this.setAttribute( 'hours', n ); },

    setMilliseconds: function( n ) { this.setAttribute( 'milliseconds', n ); },

    setMinutes: function( n ) { this.setAttribute( 'minutes', n ); },

    setSeconds: function( n ) { this.setAttribute( 'seconds', n ); },

    setTime: function( n ) {
      if ( isNaN( n ) ) { throw new Error( 'Units must be a number.' ); }
      var dt = new Date( 0 );
      dt.setUTCMilliseconds( n - ( this.getTimezoneOffset() * 60 * 1000 ) );
      this.setFromDateObjProxy( dt, true );
    },

    setUTCDate: function( n ) { this.setUTCAttribute( 'date', n ); },

    setUTCFullYear: function( n ) { this.setUTCAttribute( 'year', n ); },

    setUTCHours: function( n ) { this.setUTCAttribute( 'hours', n ); },

    setUTCMilliseconds: function( n ) { this.setUTCAttribute( 'milliseconds', n ); },

    setUTCMinutes: function( n ) { this.setUTCAttribute( 'minutes', n ); },

    setUTCMonth: function( n ) { this.setUTCAttribute( 'month', n ); },

    setUTCSeconds: function( n ) { this.setUTCAttribute( 'seconds', n ); },

    toGMTString: function() { return this.toString( 'EEE, dd MMM yyyy HH:mm:ss Z', 'Etc/GMT' ); },

    toLocaleString: function() {},

    toLocaleDateString: function() {},

    toLocaleTimeString: function() {},

    toSource: function() {},

    toISOString: function() { return this.toString( 'yyyy-MM-ddTHH:mm:ss.SSS', 'Etc/UTC' ) + 'Z'; },

    toJSON: function() { return this.toISOString(); },

    // Allows for different output formats following ISO8601.
    toString: function( format, tz ) {
      // If no format is provided, default to ISO-like format.
      if ( !format ) return this.toString( 'yyyy-MM-dd HH:mm:ss' );

      var result = format;
      var tzInfo = tz ? timezoneJS.timezone.getTzInfo( new Date( this.getTime() ), tz ) : this.getTimezoneInfo();
      var _this = this;

      // If a timezone is specified, create a clone and modify it.
      if ( tz ) {
        _this = this.clone();
        _this.setTimezone( tz );
      }

      var hours = _this.getHours();

      return result
        // Replace 'a+' with 'k' to avoid conflicts with Month names.
        .replace( /a+/g, function() { return 'k'; } )
        // `y`: year
        .replace( /y+/g, function( token ) { return _fixWidth( _this.getFullYear(), token.length ); } )
        // `d`: date
        .replace( /d+/g, function( token ) { return _fixWidth( _this.getDate(), token.length ); } )
        // `m`: minute
        .replace( /m+/g, function( token ) { return _fixWidth( _this.getMinutes(), token.length ); } )
        // `s`: second
        .replace( /s+/g, function( token ) { return _fixWidth( _this.getSeconds(), token.length ); } )
        // `S`: millisecond
        .replace( /S+/g, function( token ) { return _fixWidth( _this.getMilliseconds(), token.length ); } )
        // `M`: month. `MM` for numeric (e.g., 02), `MMM` for text (e.g., Feb).
        .replace( /M+/g, function( token ) {
          var _month = _this.getMonth(),
          _len = token.length;
          if ( _len > 3 ) {
            return timezoneJS.Months[ _month ];
          } else if ( _len > 2 ) {
            return timezoneJS.Months[ _month ].substring( 0, _len );
          }
          return _fixWidth( _month + 1, _len );
        } )
        // `k`: AM/PM indicator.
        .replace( /k+/g, function() {
          if ( hours >= 12 ) {
            if ( hours > 12 ) {
              hours -= 12;
            }
            return 'PM';
          }
          return 'AM';
        } )
        // `H`: hour.
        .replace( /H+/g, function( token ) { return _fixWidth( hours, token.length ); } )
        // `E`: day of the week.
        .replace( /E+/g, function( token ) { return timezoneJS.Days[ _this.getDay() ].substring( 0, token.length ); } )
        // `Z`: timezone abbreviation.
        .replace( /Z+/gi, function() { return tzInfo.tzAbbr; } );
    },

    toUTCString: function() { return this.toGMTString(); },

    valueOf: function() { return this.getTime(); },

    clone: function() {
      return new timezoneJS.Date( this._extractTimeArray() );
    },

    setFromDateObjProxy: function( dt, fromUTC ) {
      this.year = fromUTC ? dt.getUTCFullYear() : dt.getFullYear();
      this.month = fromUTC ? dt.getUTCMonth() : dt.getMonth();
      this.date = fromUTC ? dt.getUTCDate() : dt.getDate();
      this.hours = fromUTC ? dt.getUTCHours() : dt.getHours();
      this.minutes = fromUTC ? dt.getUTCMinutes() : dt.getMinutes();
      this.seconds = fromUTC ? dt.getUTCSeconds() : dt.getSeconds();
      this.milliseconds = fromUTC ? dt.getUTCMilliseconds() : dt.getMilliseconds();
      this._day = fromUTC ? dt.getUTCDay() : dt.getDay();
      this._dateProxy = dt;
      this._useCache = false;
    },

    getUTCDateProxy: function() {
      var dt = new Date( Date.UTC.apply( root, this._extractTimeArray() ) );
      dt.setUTCMinutes( dt.getUTCMinutes() + this.getTimezoneOffset() );
      return dt;
    },

    setAttribute: function( unit, n ) {
      if ( isNaN( n ) ) { throw new Error( 'Units must be a number.' ); }
      var dt = this._dateProxy;
      var meth = unit === 'year' ? 'FullYear' : unit.substr( 0, 1 ).toUpperCase() + unit.substr( 1 );
      dt[ 'set' + meth ]( n );
      this.setFromDateObjProxy( dt );
    },

    setUTCAttribute: function( unit, n ) {
      if ( isNaN( n ) ) { throw new Error( 'Units must be a number.' ); }
      var meth = unit === 'year' ? 'FullYear' : unit.substr( 0, 1 ).toUpperCase() + unit.substr( 1 );
      var dt = this.getUTCDateProxy();
      dt[ 'setUTC' + meth ]( n );
      dt.setUTCMinutes( dt.getUTCMinutes() - this.getTimezoneOffset() );
      this.setFromDateObjProxy( dt, true );
    },

    setTimezone: function( tz ) {
      var previousOffset = this.getTimezoneInfo().tzOffset;

      this.utc = tz === 'Etc/UTC' || tz === 'Etc/GMT';
      this.timezone = tz;
      this._useCache = false;

      // Create a new time that offsets by the delta of the two timezones.
      var _this = this.clone();
      _this.setUTCMinutes( _this.getUTCMinutes() - this.getTimezoneInfo().tzOffset + previousOffset );
      this.setFromDateObjProxy( _this, this.utc );
    },

    removeTimezone: function() {
      this.utc = false;
      this.timezone = null;
      this._useCache = false;
    },

    civilToJulianDayNumber: function( y, m, d ) {
      var a;
      // Adjust for zero-based JS-style array (months are 0-11 in JS Date).
      m++;
      if ( m > 12 ) {
        a = parseInt( m / 12, 10 );
        m = m % 12;
        y += a;
      }
      if ( m <= 2 ) {
        y -= 1;
        m += 12;
      }
      a = Math.floor( y / 100 );
      var b = 2 - a + Math.floor( a / 4 ),
      jDt = Math.floor( 365.25 * ( y + 4716 ) ) + Math.floor( 30.6001 * ( m + 1 ) ) + d + b - 1524;
      return jDt;
    },

    getLocalOffset: function() {
      return this._dateProxy.getTimezoneOffset();
    }
  };


  timezoneJS.timezone = new function() {
    var _this = this,
    monthMap = {},
    dayMap = {},
    regionMap = {
      'EST':'northamerica', 'MST':'northamerica', 'HST':'northamerica', 'EST5EDT':'northamerica',
      'CST6CDT':'northamerica', 'MST7MDT':'northamerica', 'PST8PDT':'northamerica',
      'America':'northamerica', 'Pacific':'australasia', 'Atlantic':'europe', 'Africa':'africa',
      'Indian':'africa', 'Antarctica':'antarctica', 'Asia':'asia', 'Australia':'australasia',
      'Europe':'europe', 'WET':'europe', 'CET':'europe', 'MET':'europe', 'EET':'europe'
    },
    regionExceptions = {
      'Etc/GMT':'etcetera', 'Etc/UTC':'etcetera', 'Pacific/Honolulu':'northamerica',
      'Atlantic/Bermuda':'northamerica', 'Atlantic/Cape_Verde':'africa', 'Atlantic/St_Helena':'africa',
      'Indian/Kerguelen':'antarctica', 'Indian/Chagos':'asia', 'Indian/Maldives':'asia',
      'Indian/Christmas':'australasia', 'Indian/Cocos':'australasia',
      'America/Danmarkshavn':'europe', 'America/Scoresbysund':'europe', 'America/Godthab':'europe',
      'America/Thule':'europe', 'Asia/Yekaterinburg':'europe', 'Asia/Omsk':'europe',
      'Asia/Novosibirsk':'europe', 'Asia/Krasnoyarsk':'europe', 'Asia/Irkutsk':'europe',
      'Asia/Yakutsk':'europe', 'Asia/Vladivostok':'europe', 'Asia/Sakhalin':'europe',
      'Asia/Magadan':'europe', 'Asia/Kamchatka':'europe', 'Asia/Anadyr':'europe',
      'Africa/Ceuta':'europe', 'America/Argentina/Buenos_Aires':'southamerica',
      'America/Argentina/Cordoba':'southamerica', 'America/Argentina/Tucuman':'southamerica',
      'America/Argentina/La_Rioja':'southamerica', 'America/Argentina/San_Juan':'southamerica',
      'America/Argentina/Jujuy':'southamerica', 'America/Argentina/Catamarca':'southamerica',
      'America/Argentina/Mendoza':'southamerica', 'America/Argentina/Rio_Gallegos':'southamerica',
      'America/Argentina/Ushuaia':'southamerica', 'America/Aruba':'southamerica',
      'America/La_Paz':'southamerica', 'America/Noronha':'southamerica', 'America/Belem':'southamerica',
      'America/Fortaleza':'southamerica', 'America/Recife':'southamerica', 'America/Araguaina':'southamerica',
      'America/Maceio':'southamerica', 'America/Bahia':'southamerica', 'America/Sao_Paulo':'southamerica',
      'America/Campo_Grande':'southamerica', 'America/Cuiaba':'southamerica',
      'America/Porto_Velho':'southamerica', 'America/Boa_Vista':'southamerica',
      'America/Manaus':'southamerica', 'America/Eirunepe':'southamerica',
      'America/Rio_Branco':'southamerica', 'America/Santiago':'southamerica',
      'Pacific/Easter':'southamerica', 'America/Bogota':'southamerica',
      'America/Curacao':'southamerica', 'America/Guayaquil':'southamerica',
      'Pacific/Galapagos':'southamerica', 'Atlantic/Stanley':'southamerica',
      'America/Cayenne':'southamerica', 'America/Guyana':'southamerica',
      'America/Asuncion':'southamerica', 'America/Lima':'southamerica',
      'Atlantic/South_Georgia':'southamerica', 'America/Paramaribo':'southamerica',
      'America/Port_of_Spain':'southamerica', 'America/Montevideo':'southamerica',
      'America/Caracas':'southamerica'
    };

    // Populate `monthMap` for quick lookup: `{ 'jan': 0, 'feb': 1, ... }`
    for ( var i = 0; i < Months.length; i++ ) {
      monthMap[ Months[i].substr( 0, 3 ).toLowerCase() ] = i;
    }

    // Populate `dayMap` for quick lookup: `{ 'sun': 0, 'mon': 1, ... }`
    for ( i = 0; i < Days.length; i++ ) {
      dayMap[ Days[i].substr( 0, 3 ).toLowerCase() ] = i;
    }

    // Throws an error for an invalid or unloaded timezone.
    function invalidTZError( t ) {
      throw new Error( 'Timezone "' + t + '" is either incorrect, or not loaded in the timezone registry.' );
    }

    // Handles loading of zone files, either synchronously or asynchronously.
    function builtInLoadZoneFile( fileName, opts ) {
      var url = _this.zoneFileBasePath + '/' + fileName;

      return !opts || !opts.async
        ? _this.transport( { url : url, async : false } )
        : _this.transport( {
          async: true,
          url : url,
          success : function( str ) {
            if ( _this.parseZones( str ) && typeof opts.callback === 'function' ) {
              opts.callback();
            }
            return true;
          },
          error : function() {
            throw new Error( 'Error retrieving "' + url + '" zoneinfo files' );
          }
        } );
    }

    // Determines the region for a given timezone.
    function getRegionForTimezone( tz ) {
      var exc = regionExceptions[ tz ],
      reg,
      ret;

      if ( exc ) return exc;

      reg = tz.split( '/' )[0];
      ret = regionMap[ reg ];

      // If no main region mapping is found, check 'backward' links.
      if ( ret ) return ret;

      var link = _this.zones[ tz ];
      if ( typeof link === 'string' ) {
        return getRegionForTimezone( link );
      }

      // If backward-compat file not loaded, try loading it.
      if ( !_this.loadedZones.backward ) {
        // This handles legacy zones (e.g., Iceland) that lack a standard prefix
        // like "America/", and might otherwise be missed.
        _this.loadZoneFile( 'backward' );
        return getRegionForTimezone( tz );
      }

      invalidTZError( tz );
    }

    // Parses a time string (e.g., "12:30:00" or "3") into an array of [fullMatch, hour, minute, second, suffix].
    function parseTimeString( str ) {
      var pat = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
      var hms = str.match( pat );
      hms[1] = parseInt( hms[1], 10 );
      hms[2] = hms[2] ? parseInt( hms[2], 10 ) : 0;
      hms[3] = hms[3] ? parseInt( hms[3], 10 ) : 0;
      return hms;
    }

    // Retrieves the appropriate zone entry for a given date and timezone string.
    function getZone( dt, tz ) {
      var t = tz;
      var zoneList = _this.zones[ t ];

      // Follow links to arrive at an actual zone definition.
      while ( typeof zoneList === "string" ) {
        t = zoneList;
        zoneList = _this.zones[ t ];
      }

      if ( !zoneList ) {
        // If backward-compat file not loaded, attempt to load it.
        if ( !_this.loadedZones.backward ) {
          // This addresses backward entries like "America/Fort_Wayne" which
          // might mislead `getRegionForTimezone` into thinking a region file
          // exists, but requires the backward file for resolution.
          _this.loadZoneFile( 'backward' );
          return getZone( dt, tz );
        }
        invalidTZError( t );
      }

      for ( var i = 0; i < zoneList.length; i++ ) {
        var z = zoneList[i];
        if ( !z[3] ) { break; } // No until year, so it's the last rule.

        var yea = parseInt( z[3], 10 );
        var mon = 11; // Default to December.
        var dat = 31; // Default to 31st.

        if ( z[4] ) {
          mon = monthMap[ z[4].substr( 0, 3 ).toLowerCase() ];
          dat = parseInt( z[5], 10 );
        }

        t = parseTimeString( z[6] ? z[6] : '23:59:59' );
        var d = Date.UTC( yea, mon, dat, t[1], t[2], t[3] );

        if ( dt.getTime() < d ) { break; }
      }

      if ( i === zoneList.length ) {
        throw new Error( 'No Zone found for "' + tz + '" on ' + dt );
      }

      return zoneList[i];
    }

    // Calculates the basic offset from a zone entry.
    function getBasicOffset( z ) {
      var off = parseTimeString( z[0] ),
      adj = z[0].indexOf( '-' ) === 0 ? -1 : 1;

      off = adj * ( ( ( off[1] * 60 + off[2] ) * 60 + off[3] ) * 1000 );
      return -off / 60 / 1000;
    }

    // Note: if isUTC is true, the date is provided in UTC. Otherwise, it's
    // in local time (meaning date.getUTC*() methods would return local time components).
  };
} )();