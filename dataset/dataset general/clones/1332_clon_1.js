/*
 * This file provides culture-specific formatting for German (Germany).
 * It is part of the Globalize library, a jQuery project.
 *
 * Project Home: http://github.com/jquery/globalize
 *
 * Copyright (c) 2012 Software Freedom Conservancy, Inc.
 * This software is dual-licensed under the MIT or GPL Version 2 licenses.
 * For license details, please see http://jquery.org/license
 *
 * Note: This specific culture file was automatically generated.
 * For any translation errors, please report them to the generator project.
 */


( function ( window , undefined ) { // Self-executing anonymous function to encapsulate the code.


  var Globalize ; // Declare the Globalize variable.


  // Check for CommonJS environment (e.g., Node.js)
  if ( typeof require !== "undefined" &&
       typeof exports !== "undefined" &&
       typeof module !== "undefined" ) {

    // CommonJS environment detected. Load Globalize via 'require'.
    Globalize = require( "globalize" ) ;

  } else {

    // Browser environment or other global context.
    // Assume Globalize is available as a global variable on the window object.
    Globalize = window.Globalize ;

  }


  // Add culture information for "de-DE" (German - Germany)
  Globalize.addCultureInfo( "de-DE" , "default" , {

    name : "de-DE" , // The unique name of this culture.
    englishName : "German (Germany)" , // English name for this culture.
    nativeName : "Deutsch (Deutschland)" , // Native name of the culture.
    language : "de" , // The ISO 639-1 language code.


    numberFormat : { // Defines number formatting properties.

      "," : "." , // Separator for thousands.
      "." : "," , // Decimal separator.
      "NaN" : "n. def." , // Representation for "Not a Number".
      negativeInfinity : "-unendlich" , // String for negative infinity.
      positiveInfinity : "+unendlich" , // String for positive infinity.

      percent : { // Formatting for percentage values.

        pattern : [ "-n%" , "n%" ] , // Patterns for negative and positive percentages.
        "," : "." , // Thousands separator for percentages.
        "." : "," // Decimal separator for percentages.

      } , // End of percent format.

      currency : { // Formatting for currency values.

        pattern : [ "-n $" , "n $" ] , // Patterns for negative and positive currency amounts.
        "," : "." , // Thousands separator for currency.
        "." : "," , // Decimal separator for currency.
        symbol : "€" // Currency symbol.

      } // End of currency format.

    } , // End of numberFormat.


    calendars : { // Defines calendar systems.

      standard : { // The standard calendar system.

        "/" : "." , // Date separator.
        firstDay : 1 , // The first day of the week (0=Sunday, 1=Monday, etc.).

        days : { // Names of days of the week.

          names : [ "Sonntag" , "Montag" , "Dienstag" , "Mittwoch" , "Donnerstag" , "Freitag" , "Samstag" ] , // Full names.
          namesAbbr : [ "So" , "Mo" , "Di" , "Mi" , "Do" , "Fr" , "Sa" ] , // Abbreviated names.
          namesShort : [ "So" , "Mo" , "Di" , "Mi" , "Do" , "Fr" , "Sa" ] // Short names (often same as abbr).

        } , // End of days.

        months : { // Names of months.

          names : [ "Januar" , "Februar" , "März" , "April" , "Mai" , "Juni" , "Juli" , "August" , "September" , "Oktober" , "November" , "Dezember" , "" ] , // Full names, with an empty string for 13th month if not applicable.
          namesAbbr : [ "Jan" , "Feb" , "Mrz" , "Apr" , "Mai" , "Jun" , "Jul" , "Aug" , "Sep" , "Okt" , "Nov" , "Dez" , "" ] // Abbreviated names.

        } , // End of months.

        AM : null , // AM designator (not used in German).
        PM : null , // PM designator (not used in German).

        eras : [ { "name" : "n. Chr." , "start" : null , "offset" : 0 } ] , // Era information (e.g., "n. Chr." for Anno Domini).

        patterns : { // Date and time formatting patterns.

          d : "dd.MM.yyyy" , // Short date pattern.
          D : "dddd, d. MMMM yyyy" , // Long date pattern.
          t : "HH:mm" , // Short time pattern.
          T : "HH:mm:ss" , // Long time pattern.
          f : "dddd, d. MMMM yyyy HH:mm" , // Full date/time (short time).
          F : "dddd, d. MMMM yyyy HH:mm:ss" , // Full date/time (long time).
          M : "dd MMMM" , // Month/day pattern.
          Y : "MMMM yyyy" // Year/month pattern.

        } // End of patterns.

      } // End of standard calendar.

    } // End of calendars.

  } ) ; // End of addCultureInfo call.


} ( this ) ) ; // Pass 'this' (window in browser, global in Node) as 'window'.