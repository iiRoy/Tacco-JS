/*
 * Core JavaScript bind() polyfill
 *
 * This implementation provides the Function.prototype.bind method
 * for environments that do not natively support it, ensuring
 * consistent behavior across various browsers and JavaScript engines.
 *
 * Based on the MDN documentation for Function.prototype.bind.
 */
if ( ! Function . prototype . bind )
{
  Function.prototype.bind = function ( oThis )
  {
    // Ensure that 'this' is indeed a function, as per ECMAScript 5 spec.
    if ( typeof this !== "function" )
    {
      /*
       * The 'this' value in a bind call must be a callable function.
       * If it's not, a TypeError is thrown.
       */
      throw new TypeError( "Function.prototype.bind - what is trying to be bound is not callable" ) ;
    }

    // Capture arguments for later use.
    var fSlice = Array . prototype . slice ,
        aArgs = fSlice . call( arguments , 1 ) , // Arguments passed to bind, excluding oThis
        fToBind = this ,                       // The original function to be bound
        fNOP = function () { /* No operation constructor */ } ,
        fBound = function ()
        {
          // Determine the 'this' context for the bound function's execution.
          // If called with 'new', 'this' is the new instance. Otherwise, it's oThis (or window).
          return fToBind . apply (
                                   this instanceof fNOP
                                   ? this
                                   : ( oThis || window ) ,
                                   aArgs . concat ( fSlice . call ( arguments ) )
                                 ) ;
        } ;

    // Set up the prototype chain to correctly handle 'new' calls.
    // The bound function's prototype should inherit from the original function's prototype.
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    // Return the newly created bound function.
    return fBound;
  } ; // End of Function.prototype.bind definition
} // End of bind polyfill conditional block


/*
 * Self-executing anonymous function (IIFE)
 * This encapsulates the main application logic,
 * preventing global variable pollution.
 */
( function ( ) {

  /*
   * Alias for the document object to reduce verbosity
   * and potentially improve lookup performance slightly.
   */
  var doc = document ;

  // Configuration flags for presentation features.
  var disableBuilds = false ; // Controls if build steps are active.
  var disableNotes = false ;  // Controls if speaker notes are active.


  // Utility variables for internal use.
  var ctr = 0 ; // A simple counter, used for unique IDs.
  var spaces = /\s+/ , // Regular expression to match one or more whitespace characters.
      a1 = [ '' ] ;    // A single-element array, reused for efficiency in strToArray.


  /**
   * Converts an array-like object (e.g., NodeList) into a true Array.
   * @param {ArrayLike} list - The object to convert.
   * @returns {Array} A new array containing the elements of the list.
   */
  var toArray = function ( list )
  {
    return Array.prototype.slice.call( list || [] , 0 ) ;
  } ;


  /**
   * Retrieves an HTML element by its ID.
   * If the input is already an element, it's returned directly.
   * @param {string|HTMLElement} id - The ID string or the element itself.
   * @returns {HTMLElement|null} The found element or null.
   */
  var byId = function ( id )
  {
    if ( typeof id == 'string' )
    {
      return doc . getElementById ( id ) ;
    }
    return id ;
  } ;


  /**
   * Queries for a single element matching the CSS selector.
   * @param {string} query - The CSS selector string.
   * @param {HTMLElement} [root=document] - The root element to start the query from.
   * @returns {HTMLElement|null} The first matching element or null.
   */
  var query = function ( query , root )
  {
    return queryAll ( query , root ) [ 0 ] ;
  }


  /**
   * Queries for all elements matching the CSS selector.
   * This function enhances `querySelectorAll` with ID-rooting logic
   * and handles various input types.
   * @param {string|ArrayLike} query - The CSS selector string or an array-like object.
   * @param {HTMLElement|string} [root=document] - The root element or its ID.
   * @returns {Array<HTMLElement>} An array of matching elements.
   */
  var queryAll = function ( query , root )
  {
    if ( ! query ) { return [] ; } // Return empty array if query is falsy.

    if ( typeof query != 'string' )
    {
      return toArray ( query ) ; // If already an array-like, convert and return.
    }

    if ( typeof root == 'string' )
    {
      root = byId ( root ) ; // Resolve root if it's an ID string.
      if ( ! root ) { return [] ; } // If root not found, no results.
    }

    root = root || document ; // Default root to document if not provided.

    // Determine if the root itself is the document.
    var rootIsDoc = ( root.nodeType == 9 ) ; // nodeType 9 is Document.
    var doc = rootIsDoc ? root : ( root.ownerDocument || document ) ;

    // Rewrite the query to be ID-rooted if necessary.
    // This handles cases where the root is not the document and the query
    // starts with a combinator (>, ~, +).
    if ( ! rootIsDoc || ( '>~+' . indexOf ( query.charAt(0) ) >= 0 ) )
    {
      root.id = root.id || ( 'qUnique' + ( ctr ++ ) ) ; // Assign unique ID if missing.
      query = '#' + root.id + ' ' + query ;             // Prepend ID to query.
    }

    // Prevent choking on queries ending with combinators (e.g., ".yada >").
    if ( '>~+' . indexOf ( query.slice(-1) ) >= 0 )
    {
      query += ' *' ; // Append universal selector.
    }

    // Execute the query and convert the NodeList to an Array.
    return toArray ( doc.querySelectorAll(query) ) ;
  } ;


  /**
   * Converts a string of space-separated class names into an array.
   * If input is already an array, it's returned as is.
   * @param {string|Array<string>} s - The string or array of class names.
   * @returns {Array<string>} An array of class names.
   */
  var strToArray = function ( s )
  {
    if ( typeof s == 'string' || s instanceof String )
    {
      if ( s.indexOf(' ') < 0 )
      {
        a1[0] = s;
        return a1; // Reuse pre-allocated array for single class.
      }
      else
      {
        return s.split(spaces); // Split by whitespace.
      }
    }
    return s; // Return input if not string-like.
  };


  /**
   * Trims leading and trailing whitespace from a string.
   * Provides polyfill-like functionality for older browsers.
   * @param {string} str - The string to trim.
   * @returns {string} The trimmed string.
   */
  var trim = function ( str )
  {
    return str.replace( /^\s\s*/ , '' ) . replace ( /\s\s*$/ , '' ) ;
  };


  /**
   * Adds one or more class names to an HTML element.
   * @param {HTMLElement} node - The element to modify.
   * @param {string|Array<string>} classStr - The class name(s) to add.
   */
  var addClass = function ( node , classStr )
  {
    classStr = strToArray ( classStr ) ; // Ensure classStr is an array.
    var cls = ' ' + node.className + ' ' ; // Pad existing class names.

    for ( var i = 0 , len = classStr.length , c ; i < len ; ++i )
    {
      c = classStr[i] ;
      // Add class only if it's not already present.
      if ( c && cls.indexOf( ' ' + c + ' ' ) < 0 )
      {
        cls += c + ' ' ;
      }
    }
    node.className = trim ( cls ) ; // Update and trim the class name.
  } ;


  /**
   * Removes one or more class names from an HTML element.
   * If classStr is undefined, all classes are removed.
   * @param {HTMLElement} node - The element to modify.
   * @param {string|Array<string>} [classStr] - The class name(s) to remove.
   */
  var removeClass = function ( node , classStr )
  {
    var cls ; // Variable to hold the new class string.

    if ( classStr !== undefined )
    {
      classStr = strToArray ( classStr ) ; // Convert to array if string.
      cls = ' ' + node.className + ' ' ;   // Pad existing classes.

      for ( var i = 0 , len = classStr.length ; i < len ; ++i )
      {
        // Replace all occurrences of the class name.
        cls = cls.replace ( ' ' + classStr[i] + ' ' , ' ' ) ;
      }
      cls = trim ( cls ) ; // Trim the resulting class string.
    }
    else
    {
      cls = '' ; // If no classStr provided, clear all classes.
    }

    if ( node.className != cls )
    {
      node.className = cls ; // Update only if changed.
    }
  } ;


  /**
   * Toggles a single class name on an HTML element.
   * Adds the class if not present, removes it if present.
   * @param {HTMLElement} node - The element to modify.
   * @param {string} classStr - The class name to toggle.
   */
  var toggleClass = function ( node , classStr )
  {
    var cls = ' ' + node.className + ' ' ; // Padded class string.
    // Check if the class is present.
    if ( cls.indexOf( ' ' + trim ( classStr ) + ' ' ) >= 0 )
    {
      removeClass ( node , classStr ) ; // Remove if found.
    }
    else
    {
      addClass ( node , classStr ) ; // Add if not found.
    }
  } ;


  /*
   * A simplified version of Modernizr's `testStyle` function.
   * Used to detect CSS feature support, specifically for transitions.
   * Source: https://gist.github.com/598008
   */
  var testStyle = function ( style )
  {
    var elem = document.createElement( 'div' ) ; // Create a dummy element for testing.
    var prefixes = [ 'Webkit' , 'Moz' , 'O' , 'ms' , 'Khtml' ] ; // Vendor prefixes.
    var bool ; // Stores the boolean result of the test.

    // Helper function to capitalize the first letter of a word.
    var bump = function ( all , letter )
    {
      return letter.toUpperCase ( ) ;
    } ;
    var prop ; // Stores the camelCased property name.

    // Test for the unprefixed style property.
    bool = style in elem.style ;

    // Convert 'transition' to 'Transition' and 'background-image' to 'backgroundImage'.
    prop = style.replace( /^(.)/ , bump ) . replace ( /-([a-z])/ig , bump ) ;

    // Iterate through vendor prefixes if the unprefixed property isn't supported.
    for ( var len = prefixes.length ; len -- ; )
    {
      if ( bool )
      {
        break ; // If found, no need to check prefixes.
      }
      // Check for prefixed property (e.g., 'WebkitTransition').
      bool = prefixes[len] + prop in elem.style ;
    }

    // Add a class to the documentElement indicating support (or lack thereof).
    document.documentElement.className += ' ' + ( bool ? '' : 'no-' ) + style.replace( /-/g , '' ) ;
    return bool ; // Return the support boolean.
  } ;

  // Detect if CSS transitions are supported by the browser.
  var canTransition = testStyle ( 'transition' ) ;


  /*
   * Slide class definition.
   * Represents an individual presentation slide.
   */
  var Slide = function ( node , idx )
  {
    this._node = node ; // The DOM element for this slide.

    // Extract speaker notes if available.
    var note = query ( '.note > section' , node ) ;
    if ( this._speakerNote )
    {
      this._speakerNote = note ? note.innerHTML : '' ;
    }

    // Set slide count if an index is provided.
    if ( idx >= 0 )
    {
      this._count = idx + 1 ;
    }

    // Initialize slide appearance.
    if ( this._node )
    {
      addClass ( this._node , 'slide distant-slide' ) ;
    }

    this._makeCounter ( ) ;     // Create slide number counter.
    this._makeBuildList ( ) ;   // Identify buildable elements within the slide.
  } ;

  // Slide prototype methods and properties.
  Slide.prototype = {
    _node: null ,           // Reference to the slide's DOM element.
    _count: 0 ,             // The slide number.
    _buildList: [ ] ,       // List of elements that are part of the slide's build sequence.
    _visited: false ,       // Flag indicating if the slide has been visited.
    _currentState: '' ,     // The current visual state of the slide (e.g., 'current', 'past').
    _states: [              // Array of possible slide states, ordered by distance from current.
      'distant-slide' ,
      'far-past' ,
      'past' ,
      'current' ,
      'future' ,
      'far-future' ,
      'distant-slide'
    ] ,

    /**
     * Sets the visual state of the slide.
     * @param {string|number} state - The state name (e.g., 'current') or its index in `_states`.
     */
    setState: function ( state )
    {
      if ( typeof state != 'string' )
      {
        state = this._states[state] ; // Convert index to state name.
      }

      // If slide becomes current for the first time, mark as visited and prepare builds.
      if ( state == 'current' && ! this._visited )
      {
        this._visited = true ;
        this._makeBuildList ( ) ;
      }

      // Remove all existing state classes and add the new one.
      removeClass ( this._node , this._states ) ;
      addClass ( this._node , state ) ;
      this._currentState = state ;

      // Delay the execution of auto-builds slightly to allow CSS transitions to start.
      // This is a workaround as CSS-only solutions for auto-advancing builds are tricky.
      /* this._runAutos(); */
      var _t = this ; // Capture 'this' for the setTimeout callback.
      setTimeout ( function ( ) { _t._runAutos ( ) ; } , 400 ) ;

      // Trigger load/unload events.
      if ( state == 'current' )
      {
        this._onLoad ( ) ;
      }
      else
      {
        this._onUnload ( ) ;
      }
    } ,

    /**
     * Actions to perform when the slide becomes 'current'.
     * Fires an 'onload' event and shows iframes.
     */
    _onLoad: function ( )
    {
      this._fireEvent ( 'onload' ) ;
      this._showFrames ( ) ;
    } ,

    /**
     * Actions to perform when the slide is no longer 'current'.
     * Fires an 'onunload' event and hides iframes.
     */
    _onUnload: function ( )
    {
      this._fireEvent ( 'onunload' ) ;
      this._hideFrames ( ) ;
    } ,

    /**
     * Fires a custom event defined in an attribute on the slide node.
     * @param {string} name - The attribute name (e.g., 'onload', 'onunload').
     */
    _fireEvent: function ( name )
    {
      var eventSrc = this._node.getAttribute(name) ; // Get JS code from attribute.
      if ( eventSrc )
      {
        // Wrap in an anonymous function for safe evaluation.
        eventSrc = '(function() { ' + eventSrc + ' })' ;
        var fn = eval ( eventSrc ) ; // Evaluate the function string.
        fn.call ( this._node ) ;     // Execute the function with slide node as 'this'.
      }
    } ,

    /**
     * Shows iframes within the slide by setting their `src` attribute
     * from a `_src` attribute, usually delayed for performance.
     */
    _showFrames: function ( )
    {
      var frames = queryAll ( 'iframe' , this._node ) ; // Find all iframes in the slide.
      function show ( )
      {
        frames.forEach ( function ( el )
        {
          var _src = el.getAttribute ( '_src' ) ; // Get the deferred source.
          if ( _src && _src.length )
          {
            el.src = _src ; // Set the actual src to load the iframe.
          }
        } ) ;
      }
      setTimeout ( show , 0 ) ; // Schedule immediately after current execution stack.
    } ,

    /**
     * Hides iframes within the slide by clearing their `src` attribute.
     * Delayed slightly to allow content to fade out or for transitions.
     */
    _hideFrames: function ( )
    {
      var frames = queryAll ( 'iframe' , this._node ) ;
      function hide ( )
      {
        frames.forEach ( function ( el )
        {
          var _src = el.getAttribute ( '_src' ) ;
          if ( _src && _src.length )
          {
            el.src = '' ; // Clear src to unload iframe content.
          }
        } ) ;
      }
      setTimeout ( hide , 250 ) ; // Delay hiding for 250ms.
    } ,

    /**
     * Creates and appends a slide counter element.
     */
    _makeCounter: function ( )
    {
      if ( ! this._count || ! this._node ) { return ; } // Only proceed if count and node exist.
      var c = doc.createElement ( 'span' ) ;
      c.className = 'counter' ;
      this._node.appendChild ( c ) ;
    } ,

    /**
     * Identifies elements within the slide that are part of a build sequence
     * (i.e., have `data-build` attribute on a parent) and marks them.
     */
    _makeBuildList: function ( )
    {
      this._buildList = [] ; // Reset build list.
      if ( disableBuilds ) { return ; } // Skip if builds are disabled.

      if ( this._node )
      {
        // Find all children of elements with `data-build`.
        this._buildList = queryAll ( '[data-build] > *' , this._node ) ;
      }

      // Add 'to-build' class to all identified build elements.
      this._buildList.forEach ( function ( el )
      {
        addClass ( el , 'to-build' ) ;
      } ) ;
    } ,

    /**
     * Runs the next available auto-advancing build step.
     * This method is called repeatedly until all auto-builds are processed.
     */
    _runAutos: function ( )
    {
      if ( this._currentState != 'current' )
      {
        return ; // Only run autos if the slide is currently active.
      }

      // Find the index of the next element with `data-auto`.
      var idx = -1 ;
      this._buildList.some ( function ( n , i )
      {
        if ( n.hasAttribute ( 'data-auto' ) )
        {
          idx = i ;
          return true ; // Stop iterating once an auto-build is found.
        }
        return false ;
      } ) ;

      if ( idx >= 0 )
      {
        // Remove the auto-build element from the list.
        var elem = this._buildList.splice ( idx , 1 ) [ 0 ] ;

        var _t = this ; // Capture 'this' for event listeners/callbacks.

        if ( canTransition )
        {
          // If transitions are supported, wait for transition to end before running next auto.
          var l = function ( evt )
          {
            elem.parentNode.removeEventListener ( 'webkitTransitionEnd' , l , false ) ;
            elem.parentNode.removeEventListener ( 'transitionend' , l , false ) ; // Standard
            elem.parentNode.removeEventListener ( 'oTransitionEnd' , l , false ) ;
            _t._runAutos ( ) ; // Recurse to find the next auto-build.
          } ;
          elem.parentNode.addEventListener ( 'webkitTransitionEnd' , l , false ) ;
          elem.parentNode.addEventListener ( 'transitionend' , l , false ) ;
          elem.parentNode.addEventListener ( 'oTransitionEnd' , l , false ) ;
          removeClass ( elem , 'to-build' ) ; // Trigger the transition by removing class.
        }
        else
        {
          // Fallback for browsers without transitions.
          setTimeout ( function ( )
          {
            removeClass ( elem , 'to-build' ) ;
            _t._runAutos ( ) ; // Run next auto-build after a delay.
          } , 400 ) ;
        }
      }
    } ,

    /**
     * Retrieves the speaker notes for this slide.
     * @returns {string} The HTML content of the speaker notes.
     */
    getSpeakerNote: function ( )
    {
      return this._speakerNote ;
    } ,

    /**
     * Advances to the next build step on the current slide.
     * @returns {boolean} True if a build step was processed, false if no more builds.
     */
    buildNext: function ( )
    {
      if ( ! this._buildList.length )
      {
        return false ; // No more builds on this slide.
      }
      removeClass ( this._buildList.shift ( ) , 'to-build' ) ; // Remove class from first build item.
      return true ;
    } ,
  } ; // End of Slide.prototype


  /*
   * SlideShow class definition.
   * Manages the overall presentation, navigation, and state.
   */
  var SlideShow = function ( slides )
  {
    // Map raw slide elements to Slide objects.
    this._slides = ( slides || [ ] ) . map ( function ( el , idx )
    {
      return new Slide ( el , idx ) ;
    } ) ;

    var h = window.location.hash ; // Get current URL hash.
    try
    {
      this.current = h ; // Attempt to set current slide from hash.
    }
    catch ( e ) { /* squeltch any errors during hash assignment */ }

    // Clean up hash and set default if empty.
    this.current = ( ! this.current ) ? "landing-slide" : this.current.replace ( '#' , '' ) ;

    // Handle old permalink formats.
    if ( ! query ( '#' + this.current ) )
    {
      alert ( 'The format of the permalinks have recently changed. If you are coming ' +
             'here from an old external link it\'s very likely you will land to the wrong slide' ) ;
      this.current = "landing-slide" ; // Fallback to landing slide.
    }

    var _t = this ; // Capture 'this' for event listener callbacks.

    // Register global event listeners.
    doc.addEventListener ( 'keydown' ,
        function ( e ) { _t.handleKeys ( e ) ; } , false ) ;
    doc.addEventListener ( 'touchstart' ,
        function ( e ) { _t.handleTouchStart ( e ) ; } , false ) ;
    doc.addEventListener ( 'touchend' ,
        function ( e ) { _t.handleTouchEnd ( e ) ; } , false ) ;
    window.addEventListener ( 'popstate' ,
        function ( e ) { if ( e.state ) { _t.go ( e.state , true ) ; } } , false ) ;

    // Register click handler for initial navigation key.
    query ( '#left-init-key' ) . addEventListener ( 'click' ,
        function ( ) { _t.next ( ) ; } , false ) ;

    this._update ( ) ; // Initial update of the slideshow state.

    // Add click listeners for navigation buttons.
    queryAll ( '#nav-prev, #nav-next' ) . forEach ( function ( el )
    {
      el.addEventListener ( 'click' , _t.onNavClick.bind ( _t ) , false ) ;
    } ) ;

    // Add click listeners for menu command buttons.
    queryAll ( 'menu button' ) . forEach ( function ( el )
    {
      el.addEventListener ( 'click' , _t.onCommandClick.bind ( _t ) , false ) ;
    } ) ;
  } ;

  // SlideShow prototype methods and properties.
  SlideShow.prototype = {
    _presentationCounter: query ( '#presentation-counter' ) , // Element to display current slide number.
    _menuCounter: query ( '#slide-no' ) ,                     // Element for slide number in menu.
    _speakerNote: query ( '#speaker-note' ) ,                 // Element to display speaker notes.
    _help: query ( '#help' ) ,                                // Element for the help overlay.
    _slides: [ ] ,                                            // Array of Slide objects.
    _themes: queryAll ( '.theme' ) ,                          // All theme stylesheet links.

    /**
     * Calculates the 1-based index of the current slide.
     * @returns {number|null} The current slide number or null if not found.
     */
    _getCurrentIndex: function ( )
    {
      var me = this ; // Capture 'this' for use in forEach.
      var slideCount = null ;
      queryAll ( '.slide' ) . forEach ( function ( slide , i )
      {
        if ( slide.id == me.current )
        {
          slideCount = i ; // Store 0-based index.
        }
      } ) ;
      return slideCount + 1 ; // Return 1-based index.
    } ,

    /**
     * Updates the slideshow's state, including current slide, navigation, and visual states of slides.
     * @param {string} [targetId] - The ID of the slide to navigate to.
     * @param {boolean} [dontPush=false] - If true, prevents adding to browser history.
     */
    _update: function ( targetId , dontPush )
    {
      // Get current index before potential navigation.
      var currentIndex = this._getCurrentIndex ( ) ;

      if ( targetId )
      {
        var savedIndex = currentIndex ; // Store previous index.
        this.current = targetId ;       // Update current slide ID.
        currentIndex = this._getCurrentIndex ( ) ; // Get new current index.

        // If the navigation was a jump (not adjacent), clear state of distant slides.
        if ( Math.abs ( savedIndex - currentIndex ) > 1 )
        {
          for ( var x = savedIndex ; x < savedIndex + 7 ; x ++ )
          {
            if ( this._slides[ x - 4 ] )
            {
              this._slides[ x - 4 ] . setState ( 0 ) ; // Reset to 'distant-slide'.
            }
          }
        }
      }

      // Check if the content is visible to avoid updating counter during loading/blank screen.
      var docElem = document.documentElement ;
      var elem = document.elementFromPoint ( docElem.clientWidth / 2 , docElem.clientHeight / 2 ) ;
      if ( elem && elem.className != 'slides' )
      {
        this._presentationCounter.textContent = currentIndex ; // Update main counter.
        if ( this._menuCounter )
        {
          this._menuCounter.textContent = currentIndex ; // Update menu counter.
        }
      }

      if ( this._speakerNote )
      {
        // Update speaker notes for the current slide.
        this._speakerNote.innerHTML = this._slides[ currentIndex - 1 ] . getSpeakerNote ( ) ;
      }

      // Update browser history (or hash for fallback).
      if ( history.pushState )
      {
        if ( ! dontPush )
        {
          history.pushState ( this.current , 'Slide ' + this.current , '#' + this.current ) ;
        }
      }
      else
      {
        window.location.hash = this.current ;
      }

      // Set states for current and surrounding slides for visual effect.
      // (e.g., current, past, future, distant-slide).
      for ( var x = currentIndex ; x < currentIndex + 7 ; x ++ )
      {
        if ( this._slides[ x - 4 ] )
        {
          this._slides[ x - 4 ] . setState ( x - currentIndex ) ;
        }
      }
    } , // End of _update method.

    current: 0 , // Placeholder for the current slide ID, initialized to 0.

    /**
     * Navigates to the next slide or advances the current slide's build.
     */
    next: function ( )
    {
      // Try to advance build steps on the current slide first.
      if ( ! this._slides[ this._getCurrentIndex ( ) - 1 ] . buildNext ( ) )
      {
        // If no more builds, move to the next slide.
        var next = query ( '#' + this.current + ' + .slide' ) ;
        this._update ( ( next ) ? next.id : this.current ) ; // Update to next slide or stay.
      }
    } ,

    /**
     * Navigates to the previous slide.
     */
    prev: function ( )
    {
      // Find the previous slide using CSS nth-child selector.
      var prev = query ( '.slide:nth-child(' + ( this._getCurrentIndex ( ) ) + ')' ) ;
      this._update ( ( prev ) ? prev.id : this.current ) ; // Update to previous slide or stay.
    } ,

    /**
     * Jumps to a specific slide by its ID.
     * @param {string} slideId - The ID of the slide to go to.
     * @param {boolean} [dontPush] - If true, prevents adding to browser history.
     */
    go: function ( slideId , dontPush )
    {
      this._update ( slideId , dontPush ) ;
    } ,

    /**
     * Toggles the visibility of speaker notes.
     */
    showNotes: function ( )
    {
      if ( disableNotes )
      {
        return ; // Do nothing if notes are disabled.
      }
      if ( this._speakerNote )
      {
        this._speakerNote.style.display = 'block' ; // Ensure block display.
        this._speakerNote.classList.toggle ( 'invisible' ) ; // Toggle visibility class.
      }
    } ,

    /**
     * Toggles the 3D view mode of the presentation.
     */
    switch3D: function ( )
    {
      toggleClass ( document.body , 'three-d' ) ;
    } ,

    /**
     * Toggles the syntax highlighting (prettify) stylesheet.
     */
    toggleHightlight: function ( )
    {
      var link = query ( '#prettify-link' ) ;
      link.disabled = ! ( link.disabled ) ; // Toggle the disabled state.
      sessionStorage[ 'highlightOn' ] = ! link.disabled ; // Store state in session storage.
    } ,

    /**
     * Cycles through available themes.
     */
    changeTheme: function ( )
    {
      var sheetIndex = 0 ;
      // Find the currently active theme stylesheet.
      while ( this._themes[ sheetIndex ] . disabled )
      {
        sheetIndex ++ ;
      }
      this._themes[ sheetIndex ] . disabled = true ; // Disable current theme.

      // Activate the next theme in the list (cycles back to first if at end).
      var nextSheet = this._themes[ ( sheetIndex + 1 ) % this._themes.length ] ;
      nextSheet.disabled = false ;
      // Store the new theme's filename in session storage.
      sessionStorage[ 'theme' ] = nextSheet.getAttribute ( 'href' ) . split ( '/' ) . pop ( ) ;
    } ,

    /**
     * Toggles the visibility of the help overlay.
     */
    toggleHelp: function ( )
    {
      this._help.style.display = 'block' ; // Ensure help is visible initially.
      this._help.classList.toggle ( 'invisible' ) ; // Toggle visibility class.
    } ,

    /**
     * Opens a new window/tab to view the source code of the current page.
     */
    viewSource: function ( )
    {
      window.open ( "view-source:" + window.location.href ) ;
    } ,

    /**
     * Handles keyboard events for navigation and commands.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeys: function ( e )
    {
      // Ignore key presses if focus is on an input field or editable area.
      if ( /^(input|textarea)$/i.test ( e.target.nodeName ) || e.target.isContentEditable )
      {
        return ;
      }

      // Perform actions based on key code.
      switch ( e.keyCode )
      {
        case 37:  // Left arrow key
          this.prev ( ) ; break ;
        case 39:  // Right arrow key
        case 32:  // Spacebar
          this.next ( ) ; break ;
        case 48:  // '0' key
          this.toggleHelp ( ) ; break ;
        case 51:  // '3' key
          this.switch3D ( ) ; break ;
        case 72:  // 'H' key
          this.toggleHightlight ( ) ; break ;
        case 78:  // 'N' key
          this.showNotes ( ) ; break ;
        case 83:  // 'S' key
          this.viewSource ( ) ; break ;
        case 84:  // 'T' key
          this.changeTheme ( ) ; break ;
      }
    } ,

    _touchStartX: 0 , // Stores the starting X coordinate of a touch event.

    /**
     * Handles the start of a touch event, recording the initial touch position.
     * @param {TouchEvent} e - The touch event object.
     */
    handleTouchStart: function ( e )
    {
      this._touchStartX = e.touches[0].pageX ;
    } ,

    /**
     * Handles the end of a touch event, determining if a swipe occurred
     * and navigating accordingly.
     * @param {TouchEvent} e - The touch event object.
     */
    handleTouchEnd: function ( e )
    {
      var delta = this._touchStartX - e.changedTouches[0].pageX ; // Calculate horizontal swipe distance.
      var SWIPE_SIZE = 150 ; // Minimum pixels for a swipe to be registered.

      if ( delta > SWIPE_SIZE )
      {
        this.next ( ) ; // Swipe left -> next slide.
      }
      else if ( delta < - SWIPE_SIZE )
      {
        this.prev ( ) ; // Swipe right -> previous slide.
      }
    } ,
  } ; // End of SlideShow.prototype

} ) ( ) ; // Invoke the IIFE.