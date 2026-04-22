/*
  This is a Mailcheck utility script.
  Find more info at: https://github.com/mailcheck/mailcheck

  Original Author: Derrick Ko (@derrickko)

  License: MIT License.

  Version: 1.1.0 (Current build)
*/

var  Mailcheck  =  { // Main Mailcheck object definition begins here
  domainThreshold     : 2, /* Threshold for domain matching */
  secondLevelThreshold: 2, // Threshold for second-level domain matching
  topLevelThreshold   : 2, /* Threshold for top-level domain matching */

  defaultDomains: [  // Predefined list of common email domains
    'msn.com', 'bellsouth.net', 'telus.net',
    'comcast.net', 'optusnet.com.au', 'earthlink.net',
    'qq.com', 'sky.com', 'icloud.com', 'mac.com',
    'sympatico.ca', 'googlemail.com', 'att.net',
    'xtra.co.nz', 'web.de', 'cox.net', 'gmail.com',
    'ymail.com', 'aim.com', 'rogers.com', 'verizon.net',
    'rocketmail.com', 'google.com', 'optonline.net',
    'sbcglobal.net', 'aol.com', 'me.com', 'btinternet.com',
    'charter.net', 'shaw.ca' ], // End of default domains list

  defaultSecondLevelDomains : [
    "yahoo", "hotmail", "mail", "live", "outlook", "gmx"
  ],

  defaultTopLevelDomains: [ // A comprehensive list of default TLDs
    "com", "com.au", "com.tw", "ca",
    "co.nz", "co.uk", "de", "fr", "it",
    "ru", "net", "org", "edu", "gov",
    "jp", "nl", "kr", "se", "eu", "ie",
    "co.il", "us", "at", "be", "dk",
    "hk", "es", "gr", "ch", "no", "cz",
    "in", "net", "net.au", "info", "biz",
    "mil", "co.jp", "sg", "hu"
  ],

  run : function ( opts ) {
    // Initialize options with defaults if not provided
    opts.domains          = opts.domains          || Mailcheck.defaultDomains;
    opts.secondLevelDomains = opts.secondLevelDomains || Mailcheck.defaultSecondLevelDomains;
    opts.topLevelDomains  = opts.topLevelDomains  || Mailcheck.defaultTopLevelDomains;
    opts.distanceFunction = opts.distanceFunction || Mailcheck.sift3Distance;

    // Define a default callback function
    var defaultCallback = function ( result ) { return result; };

    // Assign user-defined callbacks or default ones
    var suggestedCallback = opts.suggested || defaultCallback;
    var emptyCallback     = opts.empty     || defaultCallback;

    // Perform the email suggestion logic
    var result = Mailcheck.suggest(
      Mailcheck.encodeEmail(opts.email),
      opts.domains,
      opts.secondLevelDomains,
      opts.topLevelDomains,
      opts.distanceFunction
    );

    // Return the result using the appropriate callback
    return result ? suggestedCallback( result ) : emptyCallback();
  }, // End of run method

  suggest: function( email, domains, secondLevelDomains, topLevelDomains, distanceFunction ) {
    email = email.toLowerCase(); // Standardize email to lowercase

    var emailParts = this.splitEmail( email ); // Split email into its components

    // Find the closest overall domain
    var closestDomain = this.findClosestDomain(
      emailParts.domain,
      domains,
      distanceFunction,
      this.domainThreshold
    );

    if ( closestDomain ) {
      if ( closestDomain == emailParts.domain ) {
        // Case 1: Exact match with a supplied domain, no suggestion needed.
        return false;
      } else {
        // Case 2: Close match found for the entire domain, return the suggestion.
        return {
          address: emailParts.address,
          domain : closestDomain,
          full   : emailParts.address + "@" + closestDomain
        };
      }
    }

    // No close match for the full domain, now check second-level and top-level domains.
    var closestSecondLevelDomain = this.findClosestDomain(
      emailParts.secondLevelDomain,
      secondLevelDomains,
      distanceFunction,
      this.secondLevelThreshold
    );
    var closestTopLevelDomain = this.findClosestDomain(
      emailParts.topLevelDomain,
      topLevelDomains,
      distanceFunction,
      this.topLevelThreshold
    );

    if ( emailParts.domain ) { // Ensure a domain part exists
      var closestDomain = emailParts.domain; // Start with the original domain
      var rtrn = false; // Flag to indicate if a suggestion was made

      // Check for a misspelled second-level domain
      if ( closestSecondLevelDomain && closestSecondLevelDomain != emailParts.secondLevelDomain ) {
        // A potential second-level domain correction was found.
        closestDomain = closestDomain.replace( emailParts.secondLevelDomain, closestSecondLevelDomain );
        rtrn = true;
      }

      // Check for a misspelled top-level domain
      if ( closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain ) {
        // A potential top-level domain correction was found.
        closestDomain = closestDomain.replace( emailParts.topLevelDomain, closestTopLevelDomain );
        rtrn = true;
      }

      if ( rtrn == true ) {
        // If any part of the domain was corrected, return the combined suggestion.
        return {
          address: emailParts.address,
          domain : closestDomain,
          full   : emailParts.address + "@" + closestDomain
        };
      }
    }

    /*
     * If we reach this point, no suitable suggestion was found.
     * This could be because:
     * - The email exactly matched a domain (handled earlier).
     * - No close matches for domain, SLD, or TLD were found within thresholds.
     * - The email address format was invalid (e.g., splitEmail returned false).
     */
    return false;
  }, // End of suggest method

  findClosestDomain: function ( domain, domains, distanceFunction, threshold ) {
    // Use provided threshold or fallback to topLevelThreshold if not specified
    threshold = threshold || this.topLevelThreshold;

    var dist;         // Variable to store current distance
    var minDist = 99; // Initialize minimum distance to a high value
    var closestDomain = null; // Initialize closest domain to null

    // Pre-check for invalid inputs
    if ( !domain || !domains ) {
      return false; // Cannot find closest domain without a domain or list of domains
    }

    // Ensure a distance function is available, default to sift3Distance if none provided
    if ( !distanceFunction ) {
      distanceFunction = this.sift3Distance;
    }

    // Iterate through the list of domains to find the closest match
    for ( var i = 0; i < domains.length; i++ ) {
      if ( domain === domains[ i ] ) {
        return domain; // Exact match found, return immediately
      }

      dist = distanceFunction( domain, domains[ i ] ); // Calculate distance

      if ( dist < minDist ) {
        minDist = dist;         // Update minimum distance
        closestDomain = domains[ i ]; // Update closest domain found so far
      }
    }

    // After checking all domains, determine if the closest one is within the threshold
    if ( minDist <= threshold && closestDomain !== null ) {
      return closestDomain; // Return the closest domain if it's close enough
    } else {
      return false; // No sufficiently close domain found
    }
  }, // End of findClosestDomain method

  sift3Distance: function ( s1, s2 ) {
    // This implementation uses the Sift3 string distance algorithm.
    // Reference: http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html

    // Handle edge cases where one or both strings are null or empty.
    if ( s1 == null || s1.length === 0 ) {
      if ( s2 == null || s2.length === 0 ) {
        return 0; // Both empty, distance is 0.
      } else {
        return s2.length; // s1 empty, distance is length of s2.
      }
    }

    if ( s2 == null || s2.length === 0 ) {
      return s1.length; // s2 empty, distance is length of s1.
    }

    var c       = 0; // Current character index
    var offset1 = 0; // Offset for string 1
    var offset2 = 0; // Offset for string 2
    var lcs     = 0; // Longest Common Subsequence length
    var maxOffset = 5; // Maximum offset to check for character alignment

    // Iterate through the strings, comparing characters
    while ( ( c + offset1 < s1.length ) && ( c + offset2 < s2.length ) ) {
      if ( s1.charAt( c + offset1 ) == s2.charAt( c + offset2 ) ) {
        lcs++; // Characters match, increment LCS count
      } else {
        // Characters don't match, try to find an alignment within maxOffset
        offset1 = 0;
        offset2 = 0;

        for ( var i = 0; i < maxOffset; i++ ) {
          if ( ( c + i < s1.length ) && ( s1.charAt( c + i ) == s2.charAt( c ) ) ) {
            offset1 = i;
            break;
          }
          if ( ( c + i < s2.length ) && ( s1.charAt( c ) == s2.charAt( c + i ) ) ) {
            offset2 = i;
            break;
          }
        }
      }
      c++; // Move to the next character
    }

    // Calculate the Sift3 distance.
    return ( s1.length + s2.length ) / 2 - lcs;
  }, // End of sift3Distance method

  splitEmail: function ( email ) {
    var parts = email.trim().split( '@' ); // Split email by '@' symbol

    // Validate email structure: must have at least an address and a domain part
    if ( parts.length < 2 ) {
      return false; // Invalid format if no '@' or no domain part
    }

    // Check for empty parts, e.g., "user@.com" or "@domain.com"
    for ( var i = 0; i < parts.length; i++ ) {
      if ( parts[ i ] === '' ) {
        return false; // Invalid if any part is empty
      }
    }

    var domain      = parts.pop();    // The last part is the domain
    var domainParts = domain.split( '.' ); // Split the domain by '.'
    var sld         = '';             // Second-level domain
    var tld         = '';             // Top-level domain

    if ( domainParts.length === 0 ) {
      // An address like "user@" would result in domainParts.length = 0, which is invalid.
      return false;
    } else if ( domainParts.length === 1 ) {
      // If only one part, it's considered the TLD (e.g., "localhost")
      tld = domainParts[ 0 ];
    } else {
      // Standard case: multiple parts, e.g., "mail.example.com"
      sld = domainParts[ 0 ]; // First part is SLD (or part of it)

      // Reconstruct TLD from remaining parts
      for ( var i = 1; i < domainParts.length; i++ ) {
        tld += domainParts[ i ] + '.';
      }
      tld = tld.substring( 0, tld.length - 1 ); // Remove trailing dot
    }

    // Return an object containing the parsed email components
    return {
      topLevelDomain   : tld,
      secondLevelDomain: sld,
      domain           : domain,
      address          : parts.join( '@' ) // Rejoin address parts
    };
  }, // End of splitEmail method

  // Encodes the email address for safe use, particularly to prevent XSS.
  // It adheres to standard email address syntax specifications.
  // See: http://en.wikipedia.org/wiki/Email_address#Syntax
  encodeEmail: function ( email ) {
    var result = encodeURI( email ); // First, encode the entire URI component

    // Then, replace specific encoded characters with their original forms
    // as they are valid within an email address and often cause issues if encoded.
    result = result.replace( '%20', ' ' )
                   .replace( '%25', '%' )
                   .replace( '%5E', '^' )
                   .replace( '%60', '`' )
                   .replace( '%7B', '{' )
                   .replace( '%7C', '|' )
                   .replace( '%7D', '}' );
    return result; // Return the processed string
  }
}; // End of Mailcheck object definition

// --- Module Export and AMD Support ---

// Check if running in a CommonJS environment (like Node.js)
// If so, export the Mailcheck object. This pattern is inspired by libraries like Underscore.js.
if ( typeof module !== 'undefined' && module.exports ) {
  module.exports = Mailcheck;
}


// Provide support for Asynchronous Module Definition (AMD) loaders.
// This allows Mailcheck to be loaded as a module using 'define'.
// The approach is similar to how jQuery handles AMD.
// See: http://stackoverflow.com/a/17954882/1322410 for more context.
if ( typeof define === "function" && define.amd ) {
  define( "mailcheck", [ ], function ( ) {
    return Mailcheck;
  } );
}


// --- jQuery Plugin Integration ---

// Integrate Mailcheck as a jQuery plugin, if jQuery is available in the browser window.
if ( typeof window !== 'undefined' && window.jQuery ) {
  ( function ( $ ) {
    // Define the .mailcheck() method on jQuery objects.
    $.fn.mailcheck = function ( opts ) {
      var self = this; // Store reference to the jQuery element

      // Wrap the 'suggested' callback to pass the jQuery element
      if ( opts.suggested ) {
        var oldSuggested = opts.suggested;
        opts.suggested = function ( result ) {
          oldSuggested( self, result );
        };
      }

      // Wrap the 'empty' callback to pass the jQuery element
      if ( opts.empty ) {
        var oldEmpty = opts.empty;
        opts.empty = function ( ) {
          oldEmpty.call( null, self );
        };
      }

      opts.email = this.val( ); // Get the email from the input element
      Mailcheck.run( opts );     // Run Mailcheck with the prepared options
    };
  } )( jQuery ); // Immediately invoke the function with jQuery as argument
}