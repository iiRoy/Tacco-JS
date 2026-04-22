(function ( resrc ) {

  // Enable strict mode for better error handling and cleaner code.
  "use strict";


  // Initialize the 'options' property on the 'resrc' object.
  // If 'resrc.options' already exists, use it; otherwise, create an empty object.
  resrc.options  =  resrc.options || {};


  /*
   * This section defines the default configuration settings for the resrc library.
   * These defaults will be used if no specific options are provided by the user.
   */
  var defaults = {
    server: "app.resrc.it",        // The default server address for image processing.
    resrcClass: "resrc",           // The default CSS class to identify resrc-enabled elements.
    resrcOnResize: true,           // Flag to enable or disable resrc processing on window resize.
    resrcOnResizeDown: false,      // Flag to enable or disable resrc processing only when window shrinks.
    resrcOnPinch: false,           // Flag to enable or disable resrc processing on pinch gestures (mobile).
    imageQuality: 85,              // Default quality setting for processed images (0-100).
    pixelRounding: 10,             // Pixels will be rounded to the nearest multiple of this value.
    ssl: false                     // Use secure (HTTPS) protocol by default?
  };


  // Variables related to window event handling.
  var windowHasResizeEvent = false;     // Indicates if a resize event handler is currently active.
  var windowResizeTimeout  =  200;      // Debounce timeout for window resize events in milliseconds.
  var windowLastWidth      =  0;        // Stores the window's last known width to detect changes.


  /**
   * Polyfill for Array.prototype.indexOf.
   * This ensures compatibility with older browsers that do not natively support
   * the indexOf method on arrays (e.g., Internet Explorer 8 and below).
   * It performs a simple linear search.
   */
  if ( ! Array.prototype.indexOf ) {
    Array.prototype.indexOf = function ( needle ) {
      // Loop through each element of the array.
      for ( var i = 0; i < this.length; i++ ) {
        // If the current element matches the 'needle', return its index.
        if ( this[ i ]  ===  needle ) {
          return i;
        }
      }
      // If the 'needle' is not found, return -1.
      return -1;
    };
  }


  /**
   * Polyfill for String.prototype.trim.
   * Provides a trim functionality for strings in environments where it's not
   * natively available (e.g., Internet Explorer 8 and below).
   * It removes whitespace from both ends of a string.
   */
  if ( ! String.prototype.trim ) {
    String.prototype.trim = function ( ) {
      // Use a regular expression to replace leading and trailing whitespace characters.
      return this.replace( /^\s+|\s+$/g, "" );
    };
  }


  /**
   * Merges properties from a source object into a target object.
   * This function performs a shallow merge, prioritizing properties from the
   * second object ('b') if they exist in both.
   *
   * @param a - The target object to which properties will be merged.
   * @param b - The source object whose properties will be copied.
   * @returns {object} The modified target object 'a'.
   */
  var mergeObject = function ( a, b ) {
    // Proceed with merge only if both objects are valid.
    if ( a && b ) {
      // Iterate over the keys of the source object 'b'.
      for ( var key in b ) {
        // Ensure the property belongs to 'b' directly, not its prototype chain.
        if ( b.hasOwnProperty( key ) ) {
          a[ key ] = b[ key ]; // Copy the property value.
        }
      }
    }
    return a; // Return the merged object.
  };


  /**
   * Initializes the 'options' variable by merging default settings
   * with any user-provided options.
   * This creates the final configuration object for the resrc library.
   * @type {object} The final options object.
   */
  var options = mergeObject( defaults, resrc.options );


  /**
   * Allows external code to extend or modify the current resrc options.
   * New options are merged with existing ones, overriding any duplicates.
   *
   * @param newOptions {object} - An object containing new configuration settings.
   * @returns {object} The 'resrc' object itself, allowing for method chaining.
   */
  var extendResrcOptions = function( newOptions ) {
    mergeObject( options, newOptions ); // Apply the new options to the existing 'options' object.
    return resrc; // Return 'resrc' for chaining.
  };


  /**
   * Provides a cross-browser compatible method for retrieving elements by their class name.
   * Falls back to a manual DOM traversal if 'document.getElementsByClassName' is not available.
   *
   * @param className The CSS class name to search for.
   * @returns {Array|NodeList} A collection of elements that have the specified class.
   */
  var getElementsByClassName = function ( className ) {
    // Check if the native browser method is available.
    if ( typeof document.getElementsByClassName !== "undefined" ) {
      return document.getElementsByClassName( className );
    }
    else {
      var ret = [ ]; // Array to store matching elements.
      // Regular expression to match the class name, ensuring it's a whole word.
      var regex = new RegExp( "(^|\\s)" + className + "(\\s|$)" );
      // Get all elements in the document.
      var elems = document.getElementsByTagName( "*" );
      // Iterate through all elements.
      for ( var i = 0, len = elems.length; i < len; i++ ) {
        // Check if the element's class name matches the regex.
        if ( elems[ i ].className.match( regex ) ) {
          ret.push( elems[ i ] ); // Add the matching element to the result array.
        }
      }
      return ret; // Return the array of matching elements.
    }
  };


  /**
   * Parses a given URI string into its constituent parts.
   * This robust parser can break down complex URLs into components like protocol,
   * host, path, query, and anchor.
   *
   * @param str The URI string to parse.
   * @returns {object} An object containing various properties of the parsed URI.
   */
  var parseUri = function ( str ) {
    var o = {
      key: [ "source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ],
      q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    };
    // Replace '@' characters to prevent issues with the parser, then revert later if needed.
    str = str.replace( /@/g, "%40" );
    // Execute the main URI parsing regex.
    var m = o.parser.exec( str );
    var uri = { };
    var i = 14;
    // Populate the URI object with parsed components.
    while ( i-- ) {
      uri[ o.key[ i ] ] = m[ i ] || "";
    }
    uri[ o.q.name ] = { };
    // Parse the query string into key-value pairs.
    uri[ o.key[ 12 ] ].replace( o.q.parser, function ( $0, $1, $2 ) {
      if ( $1 ) {
        uri[ o.q.name ][ $1 ] = $2;
      }
    } );
    // Extract filename and extension.
    var fileSplt = uri.file.split( "." );
    uri.filename = fileSplt[ 0 ];
    uri.ext = ( fileSplt.length > 1 ? fileSplt[ fileSplt.length - 1 ] : "" );
    return uri;
  };


  /**
   * Determines the appropriate URL protocol (HTTP or HTTPS) based on the 'ssl' option.
   *
   * @param ssl A boolean indicating whether to use SSL (HTTPS).
   * @returns {string} The protocol string, either "https://" or "http://".
   */
  var getProtocol = function ( ssl ) {
    if ( ssl === true ) {
      return "https://"; // Return secure protocol.
    }
    return "http://"; // Return standard protocol.
  };


  /**
   * Extracts and formats the remote image URL, often used as a fallback or base.
   * It handles cases where the URL might be relative or require protocol adjustment.
   *
   * @param url The original image URL string.
   * @returns {string} The formatted remote image URL.
   */
  var getRemoteImageURL = function ( url ) {
    var imgPath;
    var searchVal;
    var index;
    var res;
    var parsedUri = parseUri( url ); // Parse the full URL.
    // Construct the image path including query parameters if present.
    imgPath = parsedUri.query ? parsedUri.path + "?" + parsedUri.query : parsedUri.path;
    // Regex to find protocol or double slashes.
    searchVal = /(https?):|(\/\/)/;
    index = imgPath.search( searchVal ); // Find the first occurrence.
    res = imgPath.substring( index ); // Extract the part after the protocol/double slash.
    // If the result doesn't contain a protocol, prepend one.
    if ( res.indexOf( "://" ) === -1 ) {
      res = res.replace( "//", getProtocol( options.ssl ) );
    }
    // If the result starts with a single slash, prepend the protocol.
    if ( res.charAt( 0 ) === "/" ) {
      res = res.replace( "/", getProtocol( options.ssl ) );
    }
    return res; // Return the cleaned remote image URL.
  };


  /**
   * Calculates the prefix part of a resrc-processed image URL.
   * This prefix typically includes the protocol and the resrc server domain.
   *
   * @param url The full URL of the image, potentially already resrc-processed.
   * @returns {string} The resrc path prefix.
   */
  var getResrcPathPrefix = function ( url ) {
    var imgPath;
    var searchVal;
    var index;
    var regexProtocol;
    var res;
    imgPath = url;
    searchVal = "//";
    regexProtocol = /\/(https?):/; // Regex to find protocol part.
    index = imgPath.lastIndexOf( searchVal ); // Find the last occurrence of "//".
    // Slice the string and remove any protocol part.
    res = imgPath.slice( 0, index ).replace( regexProtocol, "" );
    return res;
  };


  /**
   * Normalizes an image source URL into a consistent format suitable for resrc processing.
   * It handles cases where the URL might already be resrc-processed or needs to be prepended
   * with the resrc server and protocol.
   *
   * @param src The original source URL of the image.
   * @param server The resrc server domain.
   * @returns {string} The uniformly formatted image source URL.
   */
  var parseSrcToUniformFormat = function ( src, server ) {
    // Check if the URL contains more than one instance of "//" (indicating a full URL including protocol and possibly another "//").
    if ( src.match( /\/\//g ).length > 1 ) {
      var parsedUri = parseUri( src ); // Parse the URI to get its components.
      // If the authority (domain) of the parsed URI does not match the resrc server,
      // replace the protocol and authority with the resrc server's protocol and authority.
      return parsedUri.authority !== server ? src.replace( parsedUri.protocol + "://" + parsedUri.authority, getProtocol( options.ssl ) + server ) : src;
    }
    // If it's a relative path or doesn't contain multiple "//", prepend the protocol and server.
    return getProtocol( options.ssl ) + server + "/" + src;
  };


  /**
   * Checks if a given string contains content enclosed within parentheses.
   *
   * @param str The string to evaluate.
   * @returns {boolean} True if parentheses are found with content inside, false otherwise.
   */
  var hasParenthesis = function ( str ) {
    var regExpParenthesis = /\((.*?)\)/g; // Regular expression to find content in parentheses.
    return regExpParenthesis.test( str ); // Test the string against the regex.
  };


  /**
   * Extracts and returns the value enclosed within parentheses from a string.
   * If multiple sets of parentheses are found, it returns their contents concatenated.
   *
   * @param str The input string.
   * @returns {string} The extracted value(s) from within parentheses, or an empty string.
   */
  var getValueInsideParenthesis = function ( str ) {
    var match;
    var arr = [ ]; // Array to store matched values.
    var regexParenthesis = /\((.*?)\)/g; // Regex to capture content inside parentheses.
    // Loop through all matches.
    while ( ( match = regexParenthesis.exec( str ) ) !== null ) {
      arr.push( match[ 1 ].trim( ) ); // Add the captured group (content) to the array, trimming whitespace.
    }
    return arr.toString( ); // Return the array contents as a comma-separated string.
  };


  /**
   * Rounds a pixel size value up to the nearest multiple of a specified pixel rounding value.
   * This is useful for aligning image dimensions to a grid or specific increments.
   *
   * @param pixelSize The original pixel dimension (e.g., width or height).
   * @param pixelRounding The increment to which the pixel size should be rounded.
   * @returns {number} The rounded pixel size.
   */
  var pixelRound = function ( pixelSize, pixelRounding ) {
    return Math.ceil( pixelSize / pixelRounding ) * pixelRounding;
  };


  /**
   * Determines if the current user agent corresponds to a supported device for ResrcOnPinch functionality.
   * Currently checks for iPhone, iPod, or iPad.
   *
   * @returns {boolean} True if the device is supported for pinch-to-zoom resizing, false otherwise.
   */
  var isSupportedResrcOnPinchDevice = function ( ) {
    return ( /iPhone|iPod|iPad/i ).test( navigator.userAgent );
  };


  /**
   * Checks if a given value can be interpreted as a number.
   * It returns true for finite numbers, and false for NaN, Infinity, or non-numeric strings.
   *
   * @param value The value to check.
   * @returns {boolean} True if the value is a finite number, false otherwise.
   */
  var isNumber = function ( value ) {
    return ! isNaN( parseFloat( value ) ) && isFinite( value );
  };


  /**
   * Formats a parameter and its value into a "param=value" string.
   * If the value contains parentheses, it extracts the content within them.
   *
   * @param param The name of the parameter.
   * @param val The value of the parameter.
   * @returns {string} The formatted parameter string.
   */
  var setParameterAndValue = function ( param, val ) {
    // If the value contains parentheses, use the content inside them.
    if ( hasParenthesis( val ) ) {
      return param + "=" + getValueInsideParenthesis( val );
    }
    // Otherwise, use the value directly.
    return param + "=" + val;
  };


  /**
   * Finds the last index of an element in an array that matches a given string or regex.
   * It iterates backwards through the array.
   *
   * @param arr The array to search within.
   * @param str The string or regex pattern to match.
   * @returns {number} The last index of the matching element, or -1 if not found.
   */
  var getFinalIndexPositionFromArray = function ( arr, str ) {
    var i = arr.length;
    while ( i-- ) { // Loop backwards.
      if ( str === "" ) {
        if ( arr[ i ] === "" ) {
          return i; // Return index if both are empty strings.
        }
      } else {
        var p = new RegExp( str ); // Create a regex from the search string.
        var m = p.exec( arr[ i ] ); // Execute regex on array element.
        if ( m !== null ) {
          return i; // Return index if a match is found.
        }
      }
    }
    return -1; // No match found.
  };


  /**
   * Calculates a zoom multiplier based on the device's screen width relative to the window's inner width.
   * This can help in determining effective pixel ratios for responsive images.
   *
   * @returns {number} The calculated zoom multiplier, or 1 if no significant zoom is detected.
   */
  var getDeviceScreenInnerWidth = function ( ) {
    // Calculate the zoom multiplier, rounded to one decimal place.
    var zoomMultiplier = Math.round( ( screen.width / window.innerWidth ) * 10 ) / 10;
    return zoomMultiplier <= 1 ? 1 : zoomMultiplier; // Return 1 if no zoom or zoom out, otherwise the multiplier.
  };


  /**
   * Retrieves the pixel ratio for an element, preferring a 'data-dpi' attribute
   * if present, and falling back to the browser's devicePixelRatio.
   * The value is normalized to one decimal place if it's not an integer.
   *
   * @param elem The DOM element to inspect.
   * @returns {Number} The effective pixel ratio for the element.
   */
  var getPixelRatio = function ( elem ) {
    var dpiOverride = elem.getAttribute( "data-dpi" ); // Get DPI override from data attribute.
    var devicePixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1; // Get native device pixel ratio.
    // Use override if it's a valid number, otherwise use devicePixelRatio.
    var dpi = isNumber( dpiOverride ) === true ? parseFloat( dpiOverride ) : devicePixelRatio;
    // Round to one decimal place if not an integer.
    if ( dpi % 1 !== 0 ) {
      dpi = dpi.toFixed( 1 );
    }
    return dpi;
  };


  /**
   * Determines the server to be used for an element, prioritizing a 'data-server'
   * attribute on the element itself, and falling back to the global options.server.
   *
   * @param elem The DOM element to check.
   * @returns {string} The server URL or identifier.
   */
  var getServer = function ( elem ) {
    return elem.getAttribute( "data-server" ) || options.server; // Return element's server or global default.
  };


  /**
   * Retrieves the tag name of a given DOM element in lowercase.
   *
   * @param elem The DOM element.
   * @returns {string} The lowercase tag name (e.g., "img", "div").
   */
  var getTagName = function ( elem ) {
    return elem.tagName.toLowerCase( );
  };


  /**
   * Gets the current width of the browser window's viewport.
   * It attempts to use 'document.documentElement.clientWidth' first, then
   * 'document.body.clientWidth', and falls back to a default of 1024 if neither are available.
   *
   * @returns {number} The window's viewport width in pixels.
   */
  var getWindowWidth = function ( ) {
    return document.documentElement.clientWidth || document.body && document.body.clientWidth || 1024;
  };


  /**
   * Gets the current height of the browser window's viewport.
   * Similar to getWindowWidth, it uses 'document.documentElement.clientHeight',
   * 'document.body.clientHeight', or a default of 768.
   *
   * @returns {number} The window's viewport height in pixels.
   */
  var getWindowHeight = function ( ) {
    return document.documentElement.clientHeight || document.body && document.body.clientHeight || 768;
  };


  /**
   * Retrieves the image source URL for an element, preferring a 'data-src'
   * attribute over the standard 'src' attribute.
   *
   * @param elem The image element.
   * @returns {string} The image source URL.
   */
  var getImgSrc = function ( elem ) {
    return elem.getAttribute( "data-src" ) || elem.getAttribute( "src" );
  };


  /**
   * Extracts the parameter name from a "param=value" string.
   *
   * @param str The parameter string (e.g., "width=100").
   * @returns {string} The parameter name (e.g., "width").
   */
  var getParameter = function( str ) {
    return str.split( "=" )[ 0 ];
  };


  /**
   * Extracts the parameter value from a "param=value" string.
   *
   * @param str The parameter string (e.g., "width=100").
   * @returns {string} The parameter value (e.g., "100").
   */
  var getParameterValue = function( str ) {
    return str.split( "=" )[ 1 ];
  };


  /**
   * Calculates the computed pixel width and height of a given DOM element.
   * It handles cases where an element might initially report zero dimensions
   * (e.g., hidden elements or images without a 'src' yet) by temporarily making
   * them visible or falling back to parent dimensions.
   *
   * @param elem The DOM element to measure.
   * @returns {object} An object containing 'width' and 'height' properties.
   */
  var getComputedPixelSize = function ( elem ) {
    var val = { };
    val.width = elem.offsetWidth; // Get current offset width.
    val.height = elem.offsetHeight; // Get current offset height.

    // If the element has no parent, it might be detached or the document itself; use window dimensions.
    if ( elem.parentNode === null ) {
      val.width = getWindowWidth( );
      val.height = getWindowHeight( );
      return val;
    }

    // If dimensions are non-zero, we might have valid measurements.
    if ( val.width !== 0 || val.height !== 0 ) {
      /**
       * Special handling for images with 'alt' but no 'src' (or 'data-src' not yet processed).
       * Browsers might report the width of the 'alt' text, which is incorrect for image sizing.
       * We check for 'alt' and a custom 'resrc' flag to avoid an infinite loop and
       * then return the parent's computed size for the first pass.
       */
      if ( elem.alt && ! elem.resrc ) {
        elem.resrc = true; // Mark element as having been processed once for this specific hack.
        return getComputedPixelSize( elem.parentNode ); // Recurse on parent.
      }
      return val; // Return the valid dimensions.
    } else {
      // If dimensions are zero, the element might be hidden or not rendered.
      var ret;
      var name;
      var old = { };
      // Temporarily apply CSS to make the element measurable.
      var cssShow = { position: "absolute", visibility: "hidden", display: "block" };
      for ( name in cssShow ) {
        if ( cssShow.hasOwnProperty( name ) ) {
          old[ name ] = elem.style[ name ]; // Store original style.
          elem.style[ name ] = cssShow[ name ]; // Apply temporary style.
        }
      }
      ret = { width: elem.offsetWidth, height: elem.offsetHeight }; // Get dimensions with temp style.
      // Restore original styles.
      for ( name in cssShow ) {
        if ( cssShow.hasOwnProperty( name ) ) {
          elem.style[ name ] = old[ name ];
        }
      }
      // If still zero after attempting to reveal, fall back to parent.
      if ( ret.width === 0 || ret.height === 0 ) {
        return getComputedPixelSize( elem.parentNode );
      } else {
        return ret; // Return the now-computed dimensions.
      }
    }
  };


  /**
   * Debounces a function call, ensuring it is only executed after a specified
   * 'wait' period has passed since the last invocation.
   * Useful for performance optimization on frequently triggered events like window resize.
   *
   * @param func The function to debounce.
   * @param wait The number of milliseconds to wait before executing 'func'.
   * @returns {function} A new function that wraps and debounces the original.
   */
  var debounce = function ( func, wait ) {
    var timeout; // Stores the timeout ID.
    return function ( ) {
      var context = this; // Capture the current 'this' context.
      var args = arguments; // Capture the arguments passed to the debounced function.
      var later = function ( ) {
        timeout = null; // Clear the timeout ID.
        func.apply( context, args ); // Execute the original function with its context and arguments.
      };
      clearTimeout( timeout ); // Clear any existing timeout.
      timeout = setTimeout( later, wait ); // Set a new timeout.