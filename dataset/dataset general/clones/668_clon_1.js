(  function ( root,  factory ) {
  // Check for AMD loader and define the module if available
  if ( typeof define === 'function' && define.amd ) {
    define( [], factory(root) );
  } else if ( typeof exports === 'object' ) {
    // CommonJS compatibility for Node.js environments
    module.exports = factory( root );
  } else {
    // Global object for browser environments
    root.smoothScroll = factory( root );
  }
} ) ( this,  function ( root ) {

  'use strict'; /* Enforce strict mode for cleaner code and error handling */

  /*
   *  SECTION: Internal Variables
   *  ----------------------------------------------------------------------
   */

  var smoothScroll = {}; /* Object to expose public APIs */

  // Feature detection: Check for necessary DOM APIs for smooth scrolling functionality
  var supports = !!document.querySelector && !!root.addEventListener;

  // Variables to hold configuration and state during execution
  var settings,
      eventTimeout,
      fixedHeader,
      headerHeight;

  /**
   *  Default configuration options for the smooth scroll behavior.
   *  These can be overridden by user-provided settings during initialization.
   */
  var defaults = {
    speed: 500, /* Animation duration in milliseconds */
    easing: 'easeInOutCubic', /* Easing function to use for scroll animation */
    offset: 0, /* Additional offset in pixels from the target element */
    updateURL: true, /* Whether to update the browser's URL hash */
    callbackBefore: function () {}, /* Callback function to run before animation starts */
    callbackAfter: function () {} /* Callback function to run after animation completes */
  };


  /*
   *  SECTION: Helper Methods
   *  ----------------------------------------------------------------------
   */

  /**
   *  A lightweight and versatile forEach() implementation for various collection types.
   *  Supports Arrays, Objects, and NodeLists.
   *
   *  @private
   *  @param {Array|Object|NodeList} collection - The collection of items to iterate over.
   *  @param {Function} callback - The function to execute for each item.
   *  @param {Array|Object|NodeList} scope - The 'this' context for the callback function.
   */
  var forEach = function ( collection,  callback,  scope ) {

    // Handle plain JavaScript objects
    if ( Object.prototype.toString.call( collection ) === '[object Object]' ) {

      for ( var prop in collection ) {

        if ( Object.prototype.hasOwnProperty.call( collection,  prop ) ) {
          callback.call( scope,  collection[prop],  prop,  collection );
        }
      }

    } else {
      // Handle Arrays and NodeLists (which have a length property)
      for ( var i = 0,  len = collection.length;  i < len;  i++ ) {
        callback.call( scope,  collection[i],  i,  collection );
      }
    }
  };

  /**
   *  Merges default settings with user-provided options.
   *  Creates a new object containing the merged values.
   *
   *  @private
   *  @param {Object} defaults - The base default settings object.
   *  @param {Object} options - User-defined options to override defaults.
   *  @returns {Object} A new object with merged configuration.
   */
  var extend = function ( defaults,  options ) {

    var extended = {};

    forEach( defaults,  function ( value,  prop ) {
      extended[prop] = defaults[prop];
    } );

    forEach( options,  function ( value,  prop ) {
      extended[prop] = options[prop];
    } );

    return extended;
  };

  /**
   *  Traverses up the DOM tree to find the closest matching element.
   *
   *  @param {Element} elem - The starting element for the search.
   *  @param {String} selector - The CSS selector to match against (e.g., class, ID, data attribute).
   *  @return {Boolean|Element} Returns the matching element or `false` if no match is found.
   */
  var getClosest = function ( elem,  selector ) {

    var firstChar = selector.charAt(0);

    // Loop through parent nodes until document root is reached
    for ( ;  elem && elem !== document;  elem = elem.parentNode ) {

      if ( firstChar === '.' ) {
        // Match by class name
        if ( elem.classList.contains( selector.substr(1) ) ) {
          return elem;
        }
      } else if ( firstChar === '#' ) {
        // Match by ID
        if ( elem.id === selector.substr(1) ) {
          return elem;
        }
      } else if ( firstChar === '[' ) {
        // Match by data attribute
        if ( elem.hasAttribute( selector.substr(1,  selector.length - 2) ) ) {
          return elem;
        }
      }
    }

    return false; /* No matching element found */
  };

  /**
   *  Retrieves the calculated height of a given DOM element.
   *  Considers various properties to ensure accurate measurement.
   *
   *  @private
   *  @param  {Node} elem - The element whose height is to be determined.
   *  @return {Number} The height of the element in pixels.
   */
  var getHeight = function ( elem ) {
    return Math.max( elem.scrollHeight,  elem.offsetHeight,  elem.clientHeight );
  };

  /**
   *  Escapes special characters within a string to make it safe for use in CSS selectors.
   *  This is crucial for handling IDs that might contain characters like periods or hashes.
   *
   *  @private
   *  @param {String} id - The anchor ID string to escape.
   *  @author Mathias Bynens
   *  @link https://github.com/mathiasbynens/CSS.escape
   */
  var escapeCharacters = function ( id ) {

    var string = String(id);
    var length = string.length;
    var index = -1;
    var codeUnit;
    var result = '';
    var firstCodeUnit = string.charCodeAt(0);

    while ( ++index < length ) {

      codeUnit = string.charCodeAt( index );

      // Note: there’s no need to special-case astral symbols, surrogate
      // pairs, or lone surrogates.

      // If the character is NULL (U+0000), then throw an
      // `InvalidCharacterError` exception and terminate these steps.
      if ( codeUnit === 0x0000 ) {
        throw new InvalidCharacterError(
          'Invalid character: the input contains U+0000.'
        );
      }

      if (
        // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
        // U+007F, […]
        ( codeUnit >= 0x0001 && codeUnit <= 0x001F ) || codeUnit == 0x007F ||
        // If the character is the first character and is in the range [0-9]
        // (U+0030 to U+0039), […]
        ( index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039 ) ||
        // If the character is the second character and is in the range [0-9]
        // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
        (
          index === 1 &&
          codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
          firstCodeUnit === 0x002D
        )
      ) {
        // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
        result += '\\' + codeUnit.toString(16) + ' ';
        continue;
      }

      // If the character is not handled by one of the above rules and is
      // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
      // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
      // U+005A), or [a-z] (U+0061 to U+007A), […]
      if (
        codeUnit >= 0x0080 ||
        codeUnit === 0x002D ||
        codeUnit === 0x005F ||
        ( codeUnit >= 0x0030 && codeUnit <= 0x0039 ) ||
        ( codeUnit >= 0x0041 && codeUnit <= 0x005A ) ||
        ( codeUnit >= 0x0061 && codeUnit <= 0x007A )
      ) {
        // Append the character itself if it doesn't need escaping
        result += string.charAt( index );
        continue;
      }

      // Otherwise, escape the character with a backslash.
      // http://dev.w3.org/csswg/cssom/#escape-a-character
      result += '\\' + string.charAt( index );

    }
    return result;
  };

  /**
   *  Calculates the easing value based on the specified easing type and time progress.
   *  Implements various common easing functions.
   *
   *  @private
   *  @link https://gist.github.com/gre/1650294
   *  @param {String} type - The name of the easing pattern (e.g., 'easeInOutCubic').
   *  @param {Number} time - The current progress of the animation, typically between 0 and 1.
   *  @returns {Number} The eased value.
   */
  var easingPattern = function ( type,  time ) {

    var pattern;

    if ( type === 'easeInQuad' ) pattern = time * time; // accelerating from zero velocity
    if ( type === 'easeOutQuad' ) pattern = time * (2 - time); // decelerating to zero velocity
    if ( type === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
    if ( type === 'easeInCubic' ) pattern = time * time * time; // accelerating from zero velocity
    if ( type === 'easeOutCubic' ) pattern = (--time) * time * time + 1; // decelerating to zero velocity
    if ( type === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
    if ( type === 'easeInQuart' ) pattern = time * time * time * time; // accelerating from zero velocity
    if ( type === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
    if ( type === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
    if ( type === 'easeInQuint' ) pattern = time * time * time * time * time; // accelerating from zero velocity
    if ( type === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
    if ( type === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration

    return pattern || time; /* If no easing type matches, use linear (no easing) */
  };

  /**
   *  Determines the final scroll position for a given anchor element,
   *  taking into account fixed headers and user-defined offsets.
   *
   *  @private
   *  @param {Element} anchor - The target element to scroll to.
   *  @param {Number} headerHeight - The height of any fixed header element.
   *  @param {Number} offset - An additional pixel offset to apply.
   *  @returns {Number} The calculated pixel location to scroll to.
   */
  var getEndLocation = function ( anchor,  headerHeight,  offset ) {

    var location = 0;

    // Calculate cumulative offsetTop for nested elements
    if ( anchor.offsetParent ) {
      do {
        location += anchor.offsetTop;
        anchor = anchor.offsetParent;
      } while ( anchor );
    }

    // Adjust for fixed header and custom offset
    location = location - headerHeight - offset;

    // Ensure location is not negative
    return location >= 0 ? location : 0;
  };

  /**
   *  Calculates the total height of the document.
   *  Accounts for various browser compatibility differences.
   *
   *  @private
   *  @returns {Number} The total scrollable height of the document.
   */
  var getDocumentHeight = function () {
    return Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
  };

  /**
   *  Parses a JSON string from a data-options attribute into a JavaScript object.
   *
   *  @private
   *  @param {String} options - The string containing JSON-formatted options.
   *  @returns {Object} An object containing the parsed options, or an empty object if parsing fails.
   */
  var getDataOptions = function ( options ) {
    return !options || !( typeof JSON === 'object' && typeof JSON.parse === 'function' ) ? {} : JSON.parse( options );
  };

  /**
   *  Updates the browser's URL hash to reflect the scrolled-to anchor.
   *  Uses `history.pushState` for a smoother experience without page reloads.
   *
   *  @private
   *  @param {String} anchor - The hash string of the anchor (e.g., '#section').
   *  @param {Boolean} url - Whether or not to perform the URL update.
   */
  var updateUrl = function ( anchor,  url ) {
    if ( history.pushState && ( url || url === 'true' ) ) {
      history.pushState( null,  null,  [
        root.location.protocol,
        '//',
        root.location.host,
        root.location.pathname,
        root.location.search,
        anchor
      ].join('') );
    }
  };

  /**
   *  Determines the effective height of a fixed header.
   *
   *  @param {Element|null} header - The fixed header element, or null if none exists.
   *  @returns {Number} The height of the fixed header, or 0 if no header is provided.
   */
  var getHeaderHeight = function ( header ) {
    return header === null ? 0 : ( getHeight( header ) + header.offsetTop );
  };

  /**
   *  Initiates and manages the smooth scrolling animation.
   *  This is a public API method.
   *
   *  @public
   *  @param {Element} toggle - The element that triggered the scroll event (e.g., a link).
   *  @param {String} anchor - The hash string of the target element (e.g., '#my-section').
   *  @param {Object} options - Optional settings to override defaults for this specific scroll.
   */
  smoothScroll.animateScroll = function ( toggle,  anchor,  options ) {

    // ----------------------------------------------------------------------
    //  1. Process Settings and Overrides
    // ----------------------------------------------------------------------

    // Merge global settings with any provided options.
    var currentSettings = extend( settings || defaults,  options || {} );

    // Retrieve and parse link-specific options from a data attribute.
    var overrides = getDataOptions( toggle ? toggle.getAttribute('data-options') : null );

    // Apply link-specific overrides on top of current settings.
    currentSettings = extend( currentSettings,  overrides );

    // Escape special characters in the anchor ID for safe DOM querying.
    anchor = '#' + escapeCharacters( anchor.substr(1) );

    // ----------------------------------------------------------------------
    //  2. Initialize Variables for Animation
    // ----------------------------------------------------------------------

    // Determine the actual target element; handle '#' for document root.
    var anchorElem = anchor === '#' ? document.documentElement : document.querySelector( anchor );

    // Get the current scroll position on the page.
    var startLocation = root.pageYOffset;

    // Identify the fixed header if it hasn't been set yet.
    if ( !fixedHeader ) { fixedHeader = document.querySelector('[data-scroll-header]'); }

    // Calculate the fixed header's height if not already determined.
    if ( !headerHeight ) { headerHeight = getHeaderHeight( fixedHeader ); }

    // Calculate the final scroll destination, considering header and offset.
    var endLocation = getEndLocation( anchorElem,  headerHeight,  parseInt(currentSettings.offset,  10) );

    var animationInterval; /* Holds the interval timer ID for animation loop */
    var distance = endLocation - startLocation; /* Total distance to scroll */
    var documentHeight = getDocumentHeight(); /* Full height of the document */
    var timeLapsed = 0; /* Time elapsed since animation started */
    var percentage,
        position;

    // ----------------------------------------------------------------------
    //  3. Update URL Hash (if enabled)
    // ----------------------------------------------------------------------
    updateUrl( anchor,  currentSettings.updateURL );

    // ----------------------------------------------------------------------
    //  4. Define Nested Animation Helper Functions
    // ----------------------------------------------------------------------

    /**
     *  Checks if the scrolling animation should stop.
     *  Conditions include reaching the target, or hitting document boundaries.
     *
     *  @private
     *  @param {Number} position - The current scroll position.
     *  @param {Number} endLocation - The target scroll position.
     *  @param {Number} animationInterval - The ID of the animation interval.
     */
    var stopAnimateScroll = function ( position,  endLocation,  animationInterval ) {
      var currentLocation = root.pageYOffset;

      // Stop if target reached, or if at top/bottom of the page.
      if ( position == endLocation || currentLocation == endLocation || ( ( root.innerHeight + currentLocation ) >= documentHeight ) ) {
        clearInterval( animationInterval ); // Clear the animation loop
        anchorElem.focus(); // Set focus to the target element for accessibility
        currentSettings.callbackAfter( toggle,  anchor ); /* Execute post-animation callback */
      }
    };

    /**
     *  The main animation loop, executed repeatedly by `setInterval`.
     *  Calculates the next scroll position using easing.
     *
     *  @private
     */
    var loopAnimateScroll = function () {
      timeLapsed += 16; // Increment elapsed time (assuming ~60fps, 1000ms/60 = ~16.67ms)

      percentage = ( timeLapsed / parseInt(currentSettings.speed,  10) );
      percentage = ( percentage > 1 ) ? 1 : percentage; // Clamp percentage between 0 and 1

      // Calculate new position with easing function
      position = startLocation + ( distance * easingPattern(currentSettings.easing,  percentage) );

      root.scrollTo( 0,  Math.floor(position) ); // Apply the new scroll position

      stopAnimateScroll( position,  endLocation,  animationInterval ); // Check for stop condition
    };

    /**
     *  Initializes the animation by setting up the interval timer.
     *
     *  @private
     */
    var startAnimateScroll = function () {
      currentSettings.callbackBefore( toggle,  anchor ); /* Execute pre-animation callback */
      animationInterval = setInterval( loopAnimateScroll,  16 ); // Start the animation loop
    };

    // ----------------------------------------------------------------------
    //  5. iOS Bug Fix (Reset position if at top)
    // ----------------------------------------------------------------------
    /**
     *  Workaround for a specific iOS bug where `pageYOffset` might be 0 but scroll position is not.
     *  @link https://github.com/cferdinandi/smooth-scroll/issues/45
     */
    if ( root.pageYOffset === 0 ) {
      root.scrollTo( 0,  0 );
    }

    // ----------------------------------------------------------------------
    //  6. Begin Animation
    // ----------------------------------------------------------------------
    startAnimateScroll();

  };

  /**
   *  Handles click events on elements that trigger smooth scrolling.
   *  Prevents default link behavior and initiates the scroll animation.
   *
   *  @private
   *  @param {Event} event - The DOM click event object.
   */
  var eventHandler = function ( event ) {

    // Find the closest ancestor with a `data-scroll` attribute
    var toggle = getClosest( event.target,  '[data-scroll]' );

    // If a valid toggle link is found
    if ( toggle && toggle.tagName.toLowerCase() === 'a' ) {
      event.preventDefault(); // Prevent the browser's default jump behavior
      // Animate the scroll to the link's hash target
      smoothScroll.animateScroll( toggle,  toggle.hash,  settings );
    }
  };

  /**
   *  Throttles expensive resize and scroll events to improve performance.
   *  Ensures that the header height calculation runs at a controlled rate (e.g., 15fps).
   *
   *  @private
   *  @param  {Event} event - The DOM event object (resize or scroll).
   */
  var eventThrottler = function ( event ) {

    if ( !eventTimeout ) {
      eventTimeout = setTimeout( function() {
        eventTimeout = null; // Reset the timeout flag
        // Recalculate fixed header height after resize/scroll
        headerHeight = getHeaderHeight( fixedHeader );
      },  66 ); /* Approximately 15 frames per second (1000ms / 15fps = ~66.67ms) */
    }
  };

  /**
   *  Destroys the current initialization of Smooth Scroll.
   *  Removes event listeners and resets internal state variables.
   *
   *  @public
   */
  smoothScroll.destroy = function () {

    // Exit early if the plugin is not currently initialized
    if ( !settings ) return;

    // Remove previously attached event listeners
    document.removeEventListener( 'click',  eventHandler,  false );
    root.removeEventListener( 'resize',  eventThrottler,  false );

    // Reset all internal state variables to their initial null values
    settings = null;
    eventTimeout = null;
    fixedHeader = null;
    headerHeight = null;
  };

  /**
   *  Initializes the Smooth Scroll functionality.
   *  Sets up event listeners and configures the plugin.
   *
   *  @public
   *  @param {Object} options - User-defined settings to configure the plugin.
   */
  smoothScroll.init = function ( options ) {

    // Perform a feature test; if unsupported, exit early.
    if ( !supports ) return;

    // Destroy any existing instances to prevent duplicate event listeners or conflicting settings.
    smoothScroll.destroy();

    // Merge default settings with user-provided options.
    settings = extend( defaults,  options || {} );

    // Identify and store the fixed header element if it exists.
    fixedHeader = document.querySelector('[data-scroll-header]');

    // Calculate and store the height of the fixed header.
    headerHeight = getHeaderHeight( fixedHeader );

    // Attach the main click event listener to the document.
    document.addEventListener( 'click',  eventHandler,  false );

    // If a fixed header is present, attach a throttled resize event listener.
    if ( fixedHeader ) {
      root.addEventListener( 'resize',  eventThrottler,  false );
    }

  };


  /*
   *  SECTION: Public API Exposure
   *  ----------------------------------------------------------------------
   */

  // Return the `smoothScroll` object, exposing its public methods (`animateScroll`, `init`, `destroy`).
  return smoothScroll;

} );