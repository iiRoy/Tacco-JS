// This file contains a JavaScript plugin for formatting dates and numbers.
// It was originally developed by Rostislav Hristov and includes code by Matt Kruse.
// This version is a Type I clone, meaning its functionality is identical,
// but its whitespace and comments have been extensively altered.

( function ( $ )
{

  // Define the 'format' object as a property of the jQuery object.
  $.format = ( function ()
  {
    // Internal constants for type checking and boolean values.
    var UNDEFINED = 'undefined',
        TRUE      = true,
        FALSE     = false,
        // Default locale settings for date and number formatting.
        _locale   = {
          date:   {
            format:        'dddd, MMMM dd, yyyy h:mm:ss tt',
            monthsFull:    [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
            monthsShort:   [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
            daysFull:      [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
            daysShort:     [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
            timeFormat:    'h:mm tt',
            shortDateFormat: 'M/d/yyyy',
            longDateFormat: 'dddd, MMMM dd, yyyy'
          },
          number: {
            format:          '#,##0.0#',
            groupingSeparator: ',',
            decimalSeparator:  '.'
          }
        };

    // Return the public API of the format plugin.
    return {

      // Method to set or get the current locale settings.
      locale: function ( value )
      {
        // This 'a' variable assignment seems like a leftover or example,
        // as it's not used elsewhere in the plugin.
        a = { a: 6 };

        // If a value is provided, update the locale settings.
        if ( value )
        {
          for ( var p in value )
          { // Iterate through top-level properties (e.g., 'date', 'number').
            for ( var v in value[ p ] )
            { // Iterate through sub-properties (e.g., 'format', 'monthsFull').
              _locale[ p ][ v ] = value[ p ][ v ];
            }
          }
        }
        // Always return the current locale settings.
        return _locale;
      },

      // Method for date parsing and formatting.
      date:   function ( value, format )
      {
        // Check if the input value is a string (for parsing).
        if ( typeof value == 'string' )
        {
          // Helper function to extract a number from a string.
          var getNumber = function ( str, p, minlength, maxlength )
          {
            // Try to match numbers of decreasing length.
            for ( var x = maxlength; x >= minlength; x-- )
            {
              var token = str.substring( p, p + x );
              // Validate if the token is a number and meets minimum length.
              if ( token.length >= minlength && ( new RegExp( /^\d+$/ ) ).test( token ) )
              {
                return token;
              }
            }
            return null; // Return null if no valid number is found.
          };

          // Use default date format if not specified.
          if ( typeof format == UNDEFINED )
          {
            format = _locale.date.format;
          }

          // Initialize parsing variables.
          var _strict = false,
              i       = 0,
              pos     = 0,
              c       = '',
              token   = '',
              x, y,
              now     = new Date(), // Current date, used as defaults.
              year    = now.getYear(),
              month   = now.getMonth() + 1,
              date    = 1,
              hh      = now.getHours(),
              mm      = now.getMinutes(),
              ss      = now.getSeconds(),
              SSS     = now.getMilliseconds(),
              ampm    = '';

          // Loop through the format string to parse the date value.
          while ( i < format.length )
          {
            token = '';
            c     = format.charAt( i );
            // Collect consecutive identical characters to form a token (e.g., 'yyyy', 'MM').
            while ( ( format.charAt( i ) == c ) && ( i < format.length ) )
            {
              token += format.charAt( i++ );
            }

            // Handle special cases for 'MMMM' and 'EEEE' tokens.
            if ( token.indexOf( 'MMMM' ) > -1 && token.length > 4 )
            {
              token = 'MMMM';
            }
            if ( token.indexOf( 'EEEE' ) > -1 && token.length > 4 )
            {
              token = 'EEEE';
            }

            // Parse year.
            if ( token == 'yyyy' || token == 'yy' || token == 'y' )
            {
              if ( token == 'yyyy' )
              {
                x = 4;
                y = 4;
              }
              if ( token == 'yy' )
              {
                x = 2;
                y = 2;
              }
              if ( token == 'y' )
              {
                x = 2;
                y = 4;
              }
              year = getNumber( value, pos, x, y );
              if ( year == null )
              {
                return 0;
              }
              pos += year.length;
              if ( year.length == 2 )
              {
                year = parseInt( year );
                if ( year > 70 )
                {
                  year = 1900 + year;
                }
                else
                {
                  year = 2000 + year;
                }
              }
            }
            // Parse full month name.
            else if ( token == 'MMMM' )
            {
              month = 0;
              for ( var j = 0, monthName; monthName = _locale.date.monthsFull[ j ]; j++ )
              {
                if ( value.substring( pos, pos + monthName.length ).toLowerCase() == monthName.toLowerCase() )
                {
                  month = j + 1;
                  pos += monthName.length;
                  break;
                }
              }
              if ( ( month < 1 ) || ( month > 12 ) )
              {
                return 0;
              }
            }
            // Parse short month name.
            else if ( token == 'MMM' )
            {
              month = 0;
              for ( var j = 0, monthName; monthName = _locale.date.monthsShort[ j ]; j++ )
              {
                if ( value.substring( pos, pos + monthName.length ).toLowerCase() == monthName.toLowerCase() )
                {
                  month = j + 1;
                  pos += monthName.length;
                  break;
                }
              }
              if ( ( month < 1 ) || ( month > 12 ) )
              {
                return 0;
              }
            }
            // Parse full day name (and skip it, not used in Date object).
            else if ( token == 'EEEE' )
            {
              for ( var j = 0, dayName; dayName = _locale.date.daysFull[ j ]; j++ )
              {
                if ( value.substring( pos, pos + dayName.length ).toLowerCase() == dayName.toLowerCase() )
                {
                  pos += dayName.length;
                  break;
                }
              }
            }
            // Parse short day name (and skip it).
            else if ( token == 'EEE' )
            {
              for ( var j = 0, dayName; dayName = _locale.date.daysShort[ j ]; j++ )
              {
                if ( value.substring( pos, pos + dayName.length ).toLowerCase() == dayName.toLowerCase() )
                {
                  pos += dayName.length;
                  break;
                }
              }
            }
            // Parse month number.
            else if ( token == 'MM' || token == 'M' )
            {
              month = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( month == null || ( month < 1 ) || ( month > 12 ) )
              {
                return 0;
              }
              pos += month.length;
            }
            // Parse day of month.
            else if ( token == 'dd' || token == 'd' )
            {
              date = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( date == null || ( date < 1 ) || ( date > 31 ) )
              {
                return 0;
              }
              pos += date.length;
            }
            // Parse hour (1-12).
            else if ( token == 'hh' || token == 'h' )
            {
              hh = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( hh == null || ( hh < 1 ) || ( hh > 12 ) )
              {
                return 0;
              }
              pos += hh.length;
            }
            // Parse hour (0-23).
            else if ( token == 'HH' || token == 'H' )
            {
              hh = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( hh == null || ( hh < 0 ) || ( hh > 23 ) )
              {
                return 0;
              }
              pos += hh.length;
            }
            // Parse hour (0-11).
            else if ( token == 'KK' || token == 'K' )
            {
              hh = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( hh == null || ( hh < 0 ) || ( hh > 11 ) )
              {
                return 0;
              }
              pos += hh.length;
            }
            // Parse hour (1-24).
            else if ( token == 'kk' || token == 'k' )
            {
              hh = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( hh == null || ( hh < 1 ) || ( hh > 24 ) )
              {
                return 0;
              }
              pos += hh.length;
              hh--; // Adjust to 0-23.
            }
            // Parse minutes.
            else if ( token == 'mm' || token == 'm' )
            {
              mm = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( mm == null || ( mm < 0 ) || ( mm > 59 ) )
              {
                return 0;
              }
              pos += mm.length;
            }
            // Parse seconds.
            else if ( token == 'ss' || token == 's' )
            {
              ss = getNumber( value, pos, _strict ? token.length : 1, 2 );
              if ( ss == null || ( ss < 0 ) || ( ss > 59 ) )
              {
                return 0;
              }
              pos += ss.length;
            }
            // Parse milliseconds.
            else if ( token == 'SSS' || token == 'SS' || token == 'S' )
            {
              SSS = getNumber( value, pos, _strict ? token.length : 1, 3 );
              if ( SSS == null || ( SSS < 0 ) || ( SSS > 999 ) )
              {
                return 0;
              }
              pos += SSS.length;
            }
            // Parse AM/PM indicator.
            else if ( token == 'a' )
            {
              var ap = value.substring( pos, pos + 2 ).toLowerCase();
              if ( ap == 'am' )
              {
                ampm = 'AM';
              }
              else if ( ap == 'pm' )
              {
                ampm = 'PM';
              }
              else
              {
                return 0;
              }
              pos += 2;
            }
            // Handle literal characters in the format string.
            else
            {
              if ( token != value.substring( pos, pos + token.length ) )
              {
                return 0;
              }
              else
              {
                pos += token.length;
              }
            }
          }

          // Ensure entire value string was consumed.
          if ( pos != value.length )
          {
            return 0;
          }

          // Validate day of month based on month and leap year rules.
          if ( month == 2 )
          {
            // Check for leap year.
            if ( ( ( year % 4 == 0 ) && ( year % 100 != 0 ) ) || ( year % 400 == 0 ) )
            {
              if ( date > 29 )
              {
                return 0;
              }
            }
            else
            {
              if ( date > 28 )
              {
                return 0;
              }
            }
          }
          if ( ( month == 4 ) || ( month == 6 ) || ( month == 9 ) || ( month == 11 ) )
          {
            if ( date > 30 )
            {
              return 0;
            }
          }

          // Adjust hours based on AM/PM.
          if ( hh < 12 && ampm == 'PM' )
          {
            hh = hh - 0 + 12;
          }
          else if ( hh > 11 && ampm == 'AM' )
          {
            hh -= 12;
          }

          // Return a new Date object.
          return ( new Date( year, month - 1, date, hh, mm, ss, SSS ) );
        }
        else // Input value is a Date object (for formatting).
        {
          // Helper function to format numbers with leading zeros.
          var formatNumber = function ( n, s )
          {
            if ( typeof s == 'undefined' || s == 2 )
            {
              return ( n >= 0 && n < 10 ? '0' : '' ) + n;
            }
            else
            {
              if ( n >= 0 && n < 10 )
              {
                return '00' + n;
              }
              if ( n >= 10 && n < 100 )
              {
                return '0' + n;
              }
              return n;
            }
          }

          // Use default date format if not provided.
          if ( typeof format == UNDEFINED )
          {
            format = _locale.date.format;
          }

          // Extract date components.
          var y = value.getYear();
          if ( y < 1000 )
          {
            y = String( y + 1900 );
          }

          var M = value.getMonth() + 1;
          var d = value.getDate();
          var E = value.getDay();
          var H = value.getHours();
          var m = value.getMinutes();
          var s = value.getSeconds();
          var S = value.getMilliseconds();

          // Create an object to hold all formatted date parts.
          var value = new Object();
          value[ 'y' ]    = y;
          value[ 'yyyy' ] = y;
          value[ 'yy' ]   = String( y ).substring( 2, 4 );
          value[ 'M' ]    = M;
          value[ 'MM' ]   = formatNumber( M );
          value[ 'MMM' ]  = _locale.date.monthsShort[ M - 1 ];
          value[ 'MMMM' ] = _locale.date.monthsFull[ M - 1 ];
          value[ 'd' ]    = d;
          value[ 'dd' ]   = formatNumber( d );
          value[ 'EEE' ]  = _locale.date.daysShort[ E ];
          value[ 'EEEE' ] = _locale.date.daysFull[ E ];
          value[ 'H' ]    = H;
          value[ 'HH' ]   = formatNumber( H );

          // Calculate 12-hour format 'h'.
          if ( H == 0 )
          {
            value[ 'h' ] = 12;
          }
          else if ( H > 12 )
          {
            value[ 'h' ] = H - 12;
          }
          else
          {
            value[ 'h' ] = H;
          }

          value[ 'hh' ] = formatNumber( value[ 'h' ] ); // Formatted 12-hour.
          value[ 'k' ]  = H + 1; // Hour (1-24).
          value[ 'kk' ] = formatNumber( value[ 'k' ] ); // Formatted hour (1-24).

          // Calculate hour (0-11) for 'K'.
          if ( H > 11 )
          {
            value[ 'K' ] = H - 12;
          }
          else
          {
            value[ 'K' ] = H;
          }

          value[ 'KK' ] = formatNumber( value[ 'K' ] ); // Formatted hour (0-11).

          // Determine AM/PM.
          if ( H > 11 )
          {
            value[ 'a' ] = 'PM';
          }
          else
          {
            value[ 'a' ] = 'AM';
          }

          value[ 'm' ]   = m;
          value[ 'mm' ]  = formatNumber( m );
          value[ 's' ]   = s;
          value[ 'ss' ]  = formatNumber( s );
          value[ 'S' ]   = S;
          value[ 'SS' ]  = formatNumber( S );
          value[ 'SSS' ] = formatNumber( S, 3 ); // Milliseconds with 3 digits.

          // Build the result string by iterating through the format.
          var i      = 0;
          var c      = '';
          var token  = '';
          var result = '';
          var s      = false; // Flag for literal sections (single quotes).

          while ( i < format.length )
          {
            token = '';
            c     = format.charAt( i );
            // Handle quoted literals.
            if ( c == '\'' )
            {
              i++;
              if ( format.charAt( i ) == c )
              { // Escaped single quote.
                result = result + c;
                i++;
              }
              else
              { // Toggle literal mode.
                s = !s;
              }
            }
            else
            {
              // Collect token characters.
              while ( format.charAt( i ) == c )
              {
                token += format.charAt( i++ );
              }

              // Special handling for 'MMMM' and 'EEEE' tokens (long versions).
              if ( token.indexOf( 'MMMM' ) > -1 && token.length > 4 )
              {
                token = 'MMMM';
              }
              if ( token.indexOf( 'EEEE' ) > -1 && token.length > 4 )
              {
                token = 'EEEE';
              }

              // Append formatted value or literal token to result.
              if ( value[ token ] != null && !s )
              {
                result = result + value[ token ];
              }
              else
              {
                result = result + token;
              }
            }
          }
          return result; // Return the formatted date string.
        }
      },

      // Method for number parsing and formatting.
      number: function ( value, format )
      {
        // Check if the input value is a string (for parsing).
        if ( typeof value == 'string' )
        {
          // Get locale-specific separators.
          var groupingSeparator = _locale.number.groupingSeparator,
              decimalSeparator  = _locale.number.decimalSeparator,
              decimalIndex      = value.indexOf( decimalSeparator ),
              roundFactor       = 1;

          // Calculate a rounding factor if a decimal separator is present.
          if ( decimalIndex != -1 )
          {
            roundFactor = Math.pow( 10, value.length - decimalIndex - 1 );
          }

          // Remove grouping separators and replace decimal separator with a period.
          value = value.replace( new RegExp( '[' + groupingSeparator + ']', 'g' ), '' );
          value = value.replace( new RegExp( '[' + decimalSeparator + ']' ), '.' );

          // Convert to number, then round to correct precision using the factor.
          return ( parseInt( value * roundFactor ) ) / roundFactor;
        }
        else // Input value is a number (for formatting).
        {
          // Use default number format if not provided.
          if ( typeof format == UNDEFINED || format.length < 1 )
          {
            format = _locale.number.format;
          }

          // Initialize variables for integer and fraction parts.
          var integer           = '',
              fraction          = '',
              groupingSeparator = ',', // Default, will be overridden by locale.
              groupingIndex     = format.lastIndexOf( groupingSeparator ),
              decimalSeparator  = '.', // Default, will be overridden by locale.
              decimalIndex      = format.indexOf( decimalSeparator );

          // Process the fractional part if a decimal separator is in the format.
          if ( decimalIndex != -1 )
          {
            fraction          = _locale.number.decimalSeparator; // Start with locale decimal separator.
            var minFraction   = format.substr( decimalIndex + 1 ).replace( /#/g, '' ).length,
                maxFraction   = format.substr( decimalIndex + 1 ).length;

            if ( maxFraction > 0 )
            {
              var powFraction     = Math.pow( 10, maxFraction ),
                  roundFactor     = 1000,
                  // Calculate the fractional part with rounding.
                  tempFraction    = String( Math.round( parseInt( value * powFraction * roundFactor -
                                                                  parseInt( value ) * powFraction * roundFactor ) / roundFactor ) ),
                  parts           = value.toString().split( '.' );

              // Add leading zeros to the fractional part if needed.
              if ( typeof parts[ 1 ] != UNDEFINED )
              {
                for ( var i = 0; i < parts[ 1 ].length; i++ )
                {
                  if ( parts[ 1 ].substr( i, 1 ) == '0' )
                  {
                    tempFraction = '0' + tempFraction;
                  }
                  else
                  {
                    break;
                  }
                }
              }
              // Pad with trailing zeros to reach maxFraction length.
              for ( var i = 0; i < ( maxFraction - tempFraction.length ); i++ )
              {
                tempFraction += '0';
              }

              var symbol,
                  formattedFraction = '';
              // Construct the formatted fraction, respecting minFraction.
              for ( var i = 0; i < tempFraction.length; i++ )
              {
                symbol = tempFraction.substr( i, 1 );
                if ( i >= minFraction && symbol == '0' )
                {
                  break; // Stop if past minFraction and digit is zero.
                }
                formattedFraction += symbol;
              }
              fraction += formattedFraction;
            }
            // If only decimal separator was added, clear it.
            if ( fraction == _locale.number.decimalSeparator )
            {
              fraction = '';
            }
          }

          // Process the integer part.
          if ( decimalIndex != 0 )
          {
            if ( fraction != '' )
            {
              integer = String( Math.floor( value ) ); // Use floor if there's a fraction.
            }
            else
            {
              integer = String( Math.round( value ) ); // Use round if no fraction.
            }

            var grouping     = _locale.number.groupingSeparator,
                groupingSize = 0;

            // Determine grouping size from the format string.
            if ( groupingIndex != -1 )
            {
              if ( decimalIndex != -1 )
              {
                groupingSize = decimalIndex - groupingIndex;
              }
              else
              {
                groupingSize = format.length - groupingIndex;
              }
              groupingSize--; // Account for the separator itself.
            }

            // Apply grouping if groupingSize is positive.
            if ( groupingSize > 0 )
            {
              var count           = 0,
                  formattedInteger = '',
                  i               = integer.length;
              while ( i-- )
              {
                if ( count != 0 && count % groupingSize == 0 )
                {
                  formattedInteger = grouping + formattedInteger;
                }
                formattedInteger = integer.substr( i, 1 ) + formattedInteger;
                count++;
              }
              integer = formattedInteger;
            }

            // Pad integer with leading zeros if required by format (e.g., '000').
            var maxInteger;
            if ( decimalIndex != -1 )
            {
              maxInteger = format.substr( 0, decimalIndex ).replace( new RegExp( '#|' + grouping, 'g' ), '' ).length;
            }
            else
            {
              maxInteger = format.replace( new RegExp( '#|' + grouping, 'g' ), '' ).length;
            }
            var tempInteger = integer.length;
            for ( var i = tempInteger; i < maxInteger; i++ )
            {
              integer = '0' + integer;
            }
          }

          // Combine integer and fraction parts to form the final result.
          result = integer + fraction;
          return result; // Return the formatted number string.
        }
      }
    };
    // The IIFE is immediately invoked.
  } )();

// Pass jQuery object to the IIFE.
}( jQuery ) );