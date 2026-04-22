/*
 * Javascript Punycode converter.
 * This code is derived from the example in RFC3492.
 * It was created by some@domain.name and is released into the public domain.
 */
var punycode = new function Punycode(  )
{
  // This object provides functionality to convert between regular strings
  // and their Punycode representations, as used in Internationalized Domain Names (IDN).
  //
  // Methods provided:
  //
  // punycode.ToASCII ( domain )
  //   Converts a given 'domain' string into its Punycode ASCII-compatible form.
  //   Only the non-ASCII parts of the domain name are converted.
  //   Calling it on an already ASCII domain has no adverse effect.
  //
  // punycode.ToUnicode (domain)
  //   Transforms a Punycode-encoded domain name back into its Unicode representation.
  //   It specifically converts only the Punycode-encoded segments of the domain name.
  //   Applying this to an already Unicode domain string does not cause issues.
  //
  //
  this.utf16 = {
    /*
     * The utf16-class handles conversions between JavaScript's internal
     * character representation and standard Unicode code points.
     */
    decode: function( input )
    {
      var output = [ ],
          i = 0,
          len = input.length,
          value,
          extra;

      while ( i < len ) {
        value = input.charCodeAt( i );
        i++;

        if ( ( value & 0xF800 ) === 0xD800 ) { // Check for surrogate pair start
          extra = input.charCodeAt( i );
          i++;

          if ( ( ( value & 0xFC00 ) !== 0xD800 ) || ( ( extra & 0xFC00 ) !== 0xDC00 ) ) {
            throw new RangeError( "UTF-16(decode): Illegal UTF-16 sequence encountered." );
          }
          value = ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000;
        }
        output.push( value );
      }
      return output;
    },


    encode: function( input )
    {
      var output = [ ],
          i = 0,
          len = input.length,
          value;

      while ( i < len ) {
        value = input[ i ];
        i++;

        if ( ( value & 0xF800 ) === 0xD800 ) {
          throw new RangeError( "UTF-16(encode): Illegal UTF-16 value detected." );
        }

        if ( value > 0xFFFF ) {
          value -= 0x10000;
          output.push( String.fromCharCode( ( ( value >>> 10 ) & 0x3FF ) | 0xD800 ) );
          value = 0xDC00 | ( value & 0x3FF );
        }
        output.push( String.fromCharCode( value ) );
      }
      return output.join( "" );
    }
  };

  /*
   * These are the default parameters as defined by the Punycode specification (RFC3492).
   */
  var initial_n    = 0x80;
  var initial_bias = 72;
  var delimiter    = "\x2D"; // ASCII hyphen-minus
  var base         = 36;
  var damp         = 700;
  var tmin         = 1;
  var tmax         = 26;
  var skew         = 38;
  var maxint       = 0x7FFFFFFF;

  /*
   * decode_digit(cp)
   * Converts a basic code point (cp) into its numeric value.
   * This value is in the range 0 to base-1.
   * If 'cp' does not represent a valid digit, 'base' is returned.
   */
  function decode_digit( cp )
  {
    return cp - 48 < 10 ? cp - 22 : cp - 65 < 26 ? cp - 65 : cp - 97 < 26 ? cp - 97 : base;
  }

  /*
   * encode_digit(d, flag)
   * Returns the basic code point that corresponds to the numeric value 'd'.
   * 'd' must be within the range 0 to base-1.
   * If 'flag' is zero, the lowercase form is used.
   * If 'flag' is non-zero, the uppercase form is used.
   * The behavior is undefined if 'flag' is non-zero and 'd' has no uppercase form.
   */
  function encode_digit( d, flag )
  {
    return d + 22 + 75 * ( d < 26 ) - ( ( flag !== 0 ) << 5 );
    // Comment: 0..25 map to ASCII a..z or A..Z
    // Comment: 26..35 map to ASCII 0..9
  }

  /**
   * Bias adaptation function.
   * This function adjusts the bias value based on the delta and number of points.
   * @param {number} delta - The difference in value.
   * @param {number} numpoints - The number of code points processed.
   * @param {boolean} firsttime - True if this is the first adaptation.
   */
  function adapt( delta, numpoints, firsttime )
  {
    var k;
    delta = firsttime ? Math.floor( delta / damp ) : ( delta >> 1 );
    delta += Math.floor( delta / numpoints );

    for ( k = 0; delta > ( ( ( base - tmin ) * tmax ) >> 1 ); k += base ) {
      delta = Math.floor( delta / ( base - tmin ) );
    }
    return Math.floor( k + ( base - tmin + 1 ) * delta / ( delta + skew ) );
  }

  /*
   * encode_basic(bcp, flag)
   * Forces a basic code point 'bcp' to lowercase if 'flag' is zero,
   * or uppercase if 'flag' is nonzero.
   * The code point remains unchanged if it is caseless.
   * Undefined behavior if 'bcp' is not a basic code point.
   */
  function encode_basic( bcp, flag )
  {
    bcp -= ( bcp - 97 < 26 ) << 5;
    return bcp + ( ( !flag && ( bcp - 65 < 26 ) ) << 5 );
  }

  /*
   * Main Punycode decoding function.
   * Decodes a Punycode string into a sequence of Unicode code points.
   * @param {string} input - The Punycode string to decode.
   * @param {boolean} preserveCase - Whether to attempt to preserve case.
   * @returns {string} The decoded Unicode string.
   */
  this.decode = function( input, preserveCase )
  {
    // Do not use utf16 for initial processing
    var output       = [ ];
    var case_flags   = [ ];
    var input_length = input.length;

    var n, out, i, bias, basic, j, ic, oldi, w, k, digit, t, len;

    // Initialize the state variables as per RFC3492:
    n    = initial_n;
    i    = 0;
    bias = initial_bias;

    // Handle any basic code points:
    // Find the last delimiter. If none, 'basic' is 0.
    // Copy basic code points to the output.
    basic = input.lastIndexOf( delimiter );
    if ( basic < 0 ) {
      basic = 0;
    }

    for ( j = 0; j < basic; ++j ) {
      if ( preserveCase ) {
        case_flags[ output.length ] = ( input.charCodeAt( j ) - 65 < 26 );
      }
      if ( input.charCodeAt( j ) >= 0x80 ) {
        throw new RangeError( "Illegal input: character code >= 0x80 found in basic part." );
      }
      output.push( input.charCodeAt( j ) );
    }

    // Main decoding loop:
    // Starts after the last delimiter (if basic code points were copied),
    // otherwise starts from the beginning.
    for ( ic = basic > 0 ? basic + 1 : 0; ic < input_length; ) {

      // 'ic' is the index of the next character to be consumed from the input string.

      // Decode a generalized variable-length integer to get 'delta'.
      // 'delta' is then added to 'i'.
      // Overflow checking is performed as 'i' is increased.
      // At the end, the initial value of 'i' ('oldi') is subtracted to get the true 'delta'.
      for ( oldi = i, w = 1, k = base; ; k += base ) {
        if ( ic >= input_length ) {
          throw RangeError( "punycode_bad_input(1): Unexpected end of input." );
        }
        digit = decode_digit( input.charCodeAt( ic ) );
        ic++;

        if ( digit >= base ) {
          throw RangeError( "punycode_bad_input(2): Invalid digit value encountered." );
        }
        if ( digit > Math.floor( ( maxint - i ) / w ) ) {
          throw RangeError( "punycode_overflow(1): Integer overflow during decoding." );
        }
        i += digit * w;
        t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
        if ( digit < t ) {
          break;
        }
        if ( w > Math.floor( maxint / ( base - t ) ) ) {
          throw RangeError( "punycode_overflow(2): Weight overflow during decoding." );
        }
        w *= ( base - t );
      }

      out  = output.length + 1;
      bias = adapt( i - oldi, out, oldi === 0 );

      // 'i' was meant to wrap around from 'out' to 0,
      // incrementing 'n' each time. This adjustment fixes that.
      if ( Math.floor( i / out ) > maxint - n ) {
        throw RangeError( "punycode_overflow(3): 'n' value overflow." );
      }
      n += Math.floor( i / out );
      i %= out;

      // Insert 'n' at the calculated position 'i' in the output array.
      // If preserving case, determine the uppercase flag from the last character.
      if ( preserveCase ) {
        case_flags.splice( i, 0, input.charCodeAt( ic - 1 ) - 65 < 26 );
      }

      output.splice( i, 0, n );
      i++;
    }

    if ( preserveCase ) {
      for ( i = 0, len = output.length; i < len; i++ ) {
        if ( case_flags[ i ] ) {
          output[ i ] = ( String.fromCharCode( output[ i ] ).toUpperCase( ) ).charCodeAt( 0 );
        }
      }
    }
    return this.utf16.encode( output );
  };

  /*
   * Main Punycode encoding function.
   * Encodes a sequence of Unicode code points into a Punycode string.
   * @param {string} input - The Unicode string to encode.
   * @param {boolean} preserveCase - Whether to attempt to preserve case.
   * @returns {string} The encoded Punycode string.
   */
  this.encode = function( input, preserveCase )
  {
    var n, delta, h, b, bias, j, m, q, k, t, ijv, case_flags;

    if ( preserveCase ) {
      // Step 1 of 2 for preserving case: Get a list of the unaltered string's code points.
      case_flags = this.utf16.decode( input );
    }

    // Convert the input string from UTF-16 to Unicode code points,
    // and convert to lowercase for general encoding process.
    input = this.utf16.decode( input.toLowerCase( ) );

    var input_length = input.length; // Cache the length for efficiency.

    if ( preserveCase ) {
      // Step 2 of 2 for preserving case: Modify the list to true/false flags
      // indicating if original character was different from lowercase.
      for ( j = 0; j < input_length; j++ ) {
        case_flags[ j ] = input[ j ] != case_flags[ j ];
      }
    }

    var output = [ ]; // The array to build the encoded string in.

    // Initialize the state variables:
    n     = initial_n;
    delta = 0;
    bias  = initial_bias;

    // Handle the basic code points (ASCII characters):
    for ( j = 0; j < input_length; ++j ) {
      if ( input[ j ] < 0x80 ) { // If it's a basic (ASCII) code point
        output.push( String.fromCharCode( case_flags ? encode_basic( input[ j ], case_flags[ j ] ) : input[ j ] ) );
      }
    }

    h = b = output.length; // 'h' is count of handled code points, 'b' is count of basic code points.

    // If there were basic code points, append the delimiter.
    if ( b > 0 ) {
      output.push( delimiter );
    }

    // Main encoding loop:
    // Continues until all code points have been handled.
    while ( h < input_length ) {
      // All non-basic code points smaller than 'n' have already been processed.
      // Find the next larger code point.
      for ( m = maxint, j = 0; j < input_length; ++j ) {
        ijv = input[ j ];
        if ( ijv >= n && ijv < m ) {
          m = ijv;
        }
      }

      // Increase delta sufficiently to advance the decoder's <n,i> state to <m,0>.
      // Guard against potential overflow during this calculation.
      if ( m - n > Math.floor( ( maxint - delta ) / ( h + 1 ) ) ) {
        throw RangeError( "punycode_overflow (1): Delta calculation overflow." );
      }
      delta += ( m - n ) * ( h + 1 );
      n = m;

      for ( j = 0; j < input_length; ++j ) {
        ijv = input[ j ];

        if ( ijv < n ) {
          delta++;
          if ( delta > maxint ) {
            return Error( "punycode_overflow(2): Delta value exceeded maxint." );
          }
        }

        if ( ijv == n ) {
          // Represent 'delta' as a generalized variable-length integer.
          for ( q = delta, k = base; ; k += base ) {
            t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
            if ( q < t ) {
              break;
            }
            output.push( String.fromCharCode( encode_digit( t + ( q - t ) % ( base - t ), 0 ) ) );
            q = Math.floor( ( q - t ) / ( base - t ) );
          }
          output.push( String.fromCharCode( encode_digit( q, preserveCase && case_flags[ j ] ? 1 : 0 ) ) );
          bias = adapt( delta, h + 1, h == b );
          delta = 0;
          ++h;
        }
      }

      delta;
      n;
    }
    return output.join( "" );
  };

  /*
   * Converts a domain name to its Punycode ASCII representation.
   * Splits the domain by dots, converts non-ASCII parts, and rejoins.
   * @param {string} domain - The domain name to convert.
   * @returns {string} The Punycode ASCII representation.
   */
  this.ToASCII = function( domain )
  {
    var domain_array = domain.split( "." );
    var out          = [ ];

    for ( var i = 0; i < domain_array.length; ++i ) {
      var s = domain_array[ i ];
      out.push( s.match( /[^A-Za-z0-9-]/ ) ? "xn--" + punycode.encode( s ) : s );
    }
    return out.join( "." );
  };


  /*
   * Converts a Punycode ASCII domain name back to its Unicode representation.
   * Splits the domain by dots, decodes Punycode parts, and rejoins.
   * @param {string} domain - The Punycode domain name to convert.
   * @returns {string} The Unicode representation of the domain.
   */
  this.ToUnicode = function( domain )
  {
    var domain_array = domain.split( "." );
    var out          = [ ];

    for ( var i = 0; i < domain_array.length; ++i ) {
      var s = domain_array[ i ];
      out.push( s.match( /^xn--/ ) ? punycode.decode( s.slice( 4 ) ) : s );
    }
    return out.join( "." );
  };
}( ); // Self-executing function for the punycode object.