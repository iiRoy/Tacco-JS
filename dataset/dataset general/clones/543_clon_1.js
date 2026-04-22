/*
 *  Browser Sniffing Section
 *  This part of the code is responsible for detecting the user's browser and its version.
 *  It uses regular expressions on the navigator.userAgent string.
 *  While feature detection is generally preferred, some browser inconsistencies
 *  still necessitate this approach for robust behavior across different environments.
 */

var gecko =/gecko\/\d/i.test( navigator.userAgent ) ; /* Checks for Gecko engine */
var ie    =/MSIE \d/.test( navigator.userAgent )     ; /* Checks for Internet Explorer */

// Determine if IE version is less than 8 or 9, considering document mode.
var ie_lt8 = ie && ( document.documentMode == null || document.documentMode < 8 );
var ie_lt9 = ie && ( document.documentMode == null || document.documentMode < 9 );

var webkit =/WebKit\//.test( navigator.userAgent ) ; /* Checks for WebKit engine */
var qtwebkit = webkit && /Qt\/\d+\.\d+/.test( navigator.userAgent ) ; /* Specifically for QtWebKit */
var chrome =/Chrome\//.test( navigator.userAgent ) ; /* Checks for Google Chrome */
var opera  =/Opera\//.test( navigator.userAgent )  ; /* Checks for Opera browser */
var safari =/Apple Computer/.test( navigator.vendor ) ; /* Checks for Safari based on vendor */
var khtml  =/KHTML\//.test( navigator.userAgent )  ; /* Checks for KHTML engine */

// Mac OS X version detection
var mac_geLion       =/Mac OS X 1\d\D([7-9]|\d\d)\D/.test( navigator.userAgent ) ;
var mac_geMountainLion =/Mac OS X 1\d\D([8-9]|\d\d)\D/.test( navigator.userAgent ) ;

var phantom =/PhantomJS/.test( navigator.userAgent ) ; /* Checks for PhantomJS headless browser */

/* Mobile and OS detection */
var ios =/AppleWebKit/.test( navigator.userAgent ) && /Mobile\/\w+/.test( navigator.userAgent ) ;
// Note: This mobile detection is not exhaustive. Further improvements or alternative methods are welcome.
var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test( navigator.userAgent ) ;
var mac    = ios || /Mac/.test( navigator.platform ) ;
var windows =/windows/i.test( navigator.platform ) ;

var opera_version = opera && navigator.userAgent.match( /Version\/(\d*\.\d*)/ ) ;
if ( opera_version ) {
  opera_version = Number( opera_version[1] ) ;
}

/*
 *  Some browsers running on OS X (specifically QtWebKit and older Opera)
 *  may misinterpret event properties for Cmd/Ctrl keys.
 *  This flag helps in handling those specific cases.
 */
var flipCtrlCmd = mac && ( qtwebkit || opera && ( opera_version == null || opera_version < 12.11 ) ) ;

// Flags for optimization: track usage of certain features
var sawReadOnlySpans  = false ;
var sawCollapsedSpans = false ;

/*
 *  MAIN CONSTRUCTOR: CodeMirror
 *  Initializes a new CodeMirror editor instance.
 */

function CodeMirror ( place, options ) {
  // Ensure 'this' refers to a CodeMirror instance, allowing constructor to be called without 'new'.
  if ( !( this instanceof CodeMirror ) ) {
    return new CodeMirror( place, options ) ;
  }
  
  // Assign options, using defaults if not provided.
  this.options = options = options || {} ;

  // Populate options with default values where not explicitly set.
  for ( var opt in defaults ) {
    if ( !options.hasOwnProperty( opt ) && defaults.hasOwnProperty( opt ) ) {
      options[opt] = defaults[opt] ;
    }
  }

  // Configure gutters based on line numbers option.
  setGuttersForLineNumbers( options ) ;

  // Determine the starting line of the document.
  var docStart = typeof options.value == "string" ? 0 : options.value.first ;

  // Initialize the display components of the editor.
  var display = this.display = makeDisplay( place, docStart ) ;
  display.wrapper.CodeMirror = this ; // Link wrapper to CodeMirror instance.

  updateGutters( this ) ; // Update the visual state of the gutters.

  // If autofocus is enabled and it's not a mobile device, focus the input.
  if ( options.autofocus && !mobile ) {
    focusInput( this ) ;
  }

  // Initialize the internal state object of the editor.
  this.state = {
    keyMaps         : []         ,
    overlays        : []         ,
    modeGen         : 0          ,
    overwrite       : false      ,
    focused         : false      ,
    suppressEdits   : false      ,
    pasteIncoming   : false      ,
    draggingText    : false      ,
    highlight       : new Delayed()
  } ;

  this.nextOpId = 0 ; // Unique ID for operations.

  themeChanged( this ) ; // Apply the initial theme.

  // Add wrapping class if line wrapping is enabled.
  if ( options.lineWrapping ) {
    this.display.wrapper.className += " CodeMirror-wrap" ;
  }

  var doc = options.value ;
  // If the document content is a string, create a new Doc instance.
  if ( typeof doc == "string" ) {
    doc = new Doc( options.value, options.mode ) ;
  }

  // Attach the document to the CodeMirror instance within an operation.
  operation( this, attachDoc )( this, doc ) ;

  /*
   *  Workaround for Internet Explorer:
   *  IE sometimes restores textarea content on reload, which can interfere
   *  with our hidden textarea. A small delay helps override this.
   */
  if ( ie ) {
    setTimeout( bind( resetInput, this, true ), 20 ) ;
  }

  registerEventHandlers( this ) ; // Set up event listeners for the editor.

  // Determine if the editor's input has focus.
  var hasFocus ;
  try {
    hasFocus = ( document.activeElement == display.input ) ;
  }
  catch ( e ) {
    // IE can throw errors accessing activeElement before DOM is fully ready.
  }

  // If already focused or autofocus is on, trigger focus logic. Otherwise, blur.
  if ( hasFocus || ( options.autofocus && !mobile ) ) {
    setTimeout( bind( onFocus, this ), 20 ) ;
  } else {
    onBlur( this ) ;
  }

  // Execute initial option handlers and hooks within an operation.
  operation( this, function () {
    for ( var opt in optionHandlers ) {
      if ( optionHandlers.propertyIsEnumerable( opt ) ) {
        optionHandlers[opt]( this, options[opt], Init ) ;
      }
    }
    for ( var i = 0 ; i < initHooks.length ; ++i ) {
      initHooks[i]( this ) ;
    }
  } ) () ;
}


/*
 *  DISPLAY CONSTRUCTOR: makeDisplay
 *  Creates and initializes all the DOM elements required for the editor's display.
 *  This function returns an object 'd' containing references to these elements
 *  and various state variables related to the display.
 */

function makeDisplay ( place, docStart ) {
  var d = {} ; // The display object to be returned.

  // Create the hidden textarea for input handling.
  var input = d.input = elt( "textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none;" ) ;

  // WebKit specific styling for input width.
  if ( webkit ) {
    input.style.width = "1000px" ;
  }
  else {
    input.setAttribute( "wrap", "off" ) ;
  }

  // Disable autocorrect and autocapitalize for the input field.
  input.setAttribute( "autocorrect", "off" ) ;
  input.setAttribute( "autocapitalize", "off" ) ;

  // Wrapper div for the input textarea, hiding it.
  d.inputDiv = elt( "div", [ input ], null, "overflow: hidden; position: relative; width: 3px; height: 0px;" ) ;

  // Horizontal scrollbar components.
  d.scrollbarH = elt( "div", [ elt( "div", null, null, "height: 1px" ) ], "CodeMirror-hscrollbar" ) ;
  // Vertical scrollbar components.
  d.scrollbarV = elt( "div", [ elt( "div", null, null, "width: 1px" ) ], "CodeMirror-vscrollbar" ) ;
  // Filler element for the corner where scrollbars meet.
  d.scrollbarFiller = elt( "div", null, "CodeMirror-scrollbar-filler" ) ;

  // DIVs for rendering lines and selection.
  d.lineDiv    = elt( "div" ) ;
  d.selectionDiv = elt( "div", null, null, "position: relative; z-index: 1" ) ;

  // Cursor elements.
  d.cursor      = elt( "div", "\u00a0", "CodeMirror-cursor" ) ;
  d.otherCursor = elt( "div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor" ) ;

  // Element for measuring text dimensions.
  d.measure = elt( "div", null, "CodeMirror-measure" ) ;

  // The lineSpace wraps all content that exists within the vertically padded coordinate system.
  d.lineSpace = elt( "div", [ d.measure, d.selectionDiv, d.lineDiv, d.cursor, d.otherCursor ],
                       null, "position: relative; outline: none" ) ;

  // Mover element, positioned to cover the visible view port within the sizer.
  d.mover = elt( "div", [ elt( "div", [ d.lineSpace ], "CodeMirror-lines" ) ], null, "position: relative" ) ;

  // Sizer element, its height is set to the total content height, enabling scrolling.
  d.sizer = elt( "div", [ d.mover ], "CodeMirror-sizer" ) ;

  // Height forcer to ensure minimum height for scroller, especially with overflow:auto.
  d.heightForcer = elt( "div", "\u00a0", null, "position: absolute; height: " + scrollerCutOff + "px" ) ;

  // Gutters container.
  d.gutters = elt( "div", null, "CodeMirror-gutters" ) ;
  d.lineGutter = null ; // Reference to the line number gutter, if present.

  // Inner scroller container, holding sizer, heightForcer, and gutters.
  var scrollerInner = elt( "div", [ d.sizer, d.heightForcer, d.gutters ], null, "position: relative; min-height: 100%" ) ;

  // The main scroller element.
  d.scroller = elt( "div", [ scrollerInner ], "CodeMirror-scroll" ) ;
  d.scroller.setAttribute( "tabIndex", "-1" ) ; // Make scroller focusable, but not part of tab order.

  // The main wrapper element of the editor.
  d.wrapper = elt( "div", [ d.inputDiv, d.scrollbarH, d.scrollbarV,
                          d.scrollbarFiller, d.scroller ], "CodeMirror" ) ;

  // IE7 z-index bug workaround.
  if ( ie_lt8 ) {
    d.gutters.style.zIndex = -1 ;
    d.scroller.style.paddingRight = 0 ;
  }

  // Append the editor wrapper to the specified place in the DOM.
  if ( place.appendChild ) {
    place.appendChild( d.wrapper ) ;
  } else {
    place( d.wrapper ) ;
  }

  // Mobile Safari: hide the big blue blinking cursor.
  if ( ios ) {
    input.style.width = "0px" ;
  }

  // Enable draggable for scroller if not WebKit (to allow drag-and-drop of text).
  if ( !webkit ) {
    d.scroller.draggable = true ;
  }

  // KHTML specific workaround for Tab key handling.
  if ( khtml ) {
    d.inputDiv.style.height   = "1px" ;
    d.inputDiv.style.position = "absolute" ;
  }
  // IE7 specific scrollbar minimum width.
  else if ( ie_lt8 ) {
    d.scrollbarH.style.minWidth = d.scrollbarV.style.minWidth = "18px" ;
  }

  // Initialize view state variables.
  d.viewOffset  = 0 ;
  d.lastSizeC   = 0 ;
  d.showingFrom = docStart ;
  d.showingTo   = docStart ;

  // Variables for line number gutter width calculation.
  d.lineNumWidth     = null ;
  d.lineNumInnerWidth = null ;
  d.lineNumChars     = null ;

  // Input polling state.
  d.prevInput = "" ;
  d.alignWidgets = false ;
  d.pollingFast  = false ;
  d.poll         = new Delayed() ;

  // Dragging state.
  d.draggingText = false ;

  // Caching for character and text height measurements.
  d.cachedCharWidth   = null ;
  d.cachedTextHeight = null ;
  d.measureLineCache  = [] ;
  d.measureLineCachePos = 0 ;

  // Selection accuracy flag.
  d.inaccurateSelection = false ;

  // Variables for tracking maximum line length for horizontal scrollbar.
  d.maxLine        = null ;
  d.maxLineLength  = 0 ;
  d.maxLineChanged = false ;

  // Variables for wheel scrolling granularity measurement.
  d.wheelDX      = null ;
  d.wheelDY      = null ;
  d.wheelStartX  = null ;
  d.wheelStartY  = null ;
  
  return d ;
}


/*
 *  STATE UPDATES SECTION
 *  Functions that manage and apply changes to the editor's state and display
 *  based on configuration options or internal events.
 */

/*
 *  loadMode(cm)
 *  Updates the editor's mode and re-parses the document's styling.
 */
function loadMode ( cm ) {
  cm.doc.mode = CodeMirror.getMode( cm.options, cm.doc.modeOption ) ; // Set the document mode.
  cm.doc.iter( function ( line ) {
    // Clear old state and styles to force re-evaluation.
    if ( line.stateAfter ) {
      line.stateAfter = null ;
    }
    if ( line.styles ) {
      line.styles = null ;
    }
  } ) ;
  cm.doc.frontier = cm.doc.first ; // Reset the parsing frontier.
  startWorker( cm, 100 ) ;         // Restart the background parsing worker.
  cm.state.modeGen++ ;             // Increment mode generation counter.
  if ( cm.curOp ) {
    regChange( cm ) ;              // If an operation is active, register a change.
  }
}

/*
 *  wrappingChanged(cm)
 *  Handles changes to the lineWrapping option.
 */
function wrappingChanged ( cm ) {
  if ( cm.options.lineWrapping ) {
    cm.display.wrapper.className += " CodeMirror-wrap" ; // Add wrapping class.
    cm.display.sizer.style.minWidth = "" ;                 // Clear min-width for sizer.
  } else {
    cm.display.wrapper.className = cm.display.wrapper.className.replace( " CodeMirror-wrap", "" ) ; // Remove wrapping class.
    computeMaxLength( cm ) ;                                                                         // Recompute max line length.
  }
  estimateLineHeights( cm ) ; // Recalculate estimated line heights.
  regChange( cm ) ;           // Register a change to refresh display.
  clearCaches( cm ) ;         // Clear display caches.
  // Update scrollbars after a short delay to allow DOM to settle.
  setTimeout( function () { updateScrollbars( cm.display, cm.doc.height ) ; }, 100 ) ;
}

/*
 *  estimateHeight(cm)
 *  Returns a function that estimates the height of a given line.
 */
function estimateHeight ( cm ) {
  var th = textHeight( cm.display ) ; // Get base text height.
  var wrapping = cm.options.lineWrapping ; // Check if line wrapping is enabled.
  var perLine = wrapping && Math.max( 5, cm.display.scroller.clientWidth / charWidth( cm.display ) - 3 ) ; // Chars per line for wrapping.

  return function ( line ) {
    if ( lineIsHidden( line ) ) {
      return 0 ; // Hidden lines have zero height.
    } else if ( wrapping ) {
      // For wrapped lines, estimate height based on line length and chars per line.
      return ( Math.ceil( line.text.length / perLine ) || 1 ) * th ;
    } else {
      return th ; // For non-wrapped lines, use base text height.
    }
  } ;
}

/*
 *  estimateLineHeights(cm)
 *  Applies the estimated height to all lines in the document.
 */
function estimateLineHeights ( cm ) {
  var doc = cm.doc ;
  var est = estimateHeight( cm ) ; // Get the height estimation function.
  doc.iter( function ( line ) {
    var estHeight = est( line ) ;
    if ( estHeight != line.height ) {
      updateLineHeight( line, estHeight ) ; // Update line height if different.
    }
  } ) ;
}

/*
 *  keyMapChanged(cm)
 *  Updates the editor's wrapper class based on the active keymap style.
 */
function keyMapChanged ( cm ) {
  var style = keyMap[cm.options.keyMap].style ; // Get the style associated with the keymap.
  // Remove existing keymap classes and add the new one.
  cm.display.wrapper.className = cm.display.wrapper.className.replace( /\s*cm-keymap-\S+/g, "" ) +
    ( style ? " cm-keymap-" + style : "" ) ;
}

/*
 *  themeChanged(cm)
 *  Applies a new theme to the editor.
 */
function themeChanged ( cm ) {
  // Remove existing theme classes and add the new one(s).
  cm.display.wrapper.className = cm.display.wrapper.className.replace( /\s*cm-s-\S+/g, "" ) +
    cm.options.theme.replace( /(^|\s)\s*/g, " cm-s-" ) ;
  clearCaches( cm ) ; // Clear display caches as theme change can affect measurements.
}

/*
 *  guttersChanged(cm)
 *  Updates gutters when their configuration changes.
 */
function guttersChanged ( cm ) {
  updateGutters( cm ) ; // Rebuild the gutters.
  regChange( cm ) ;     // Register a change to refresh display.
}

/*
 *  updateGutters(cm)
 *  Rebuilds the gutter DOM elements based on the current options.
 */
function updateGutters ( cm ) {
  var gutters = cm.display.gutters ; // Reference to the gutters container.
  var specs   = cm.options.gutters ; // Gutter specifications from options.
  removeChildren( gutters ) ;        // Clear existing gutter elements.

  for ( var i = 0 ; i < specs.length ; ++i ) {
    var gutterClass = specs[i] ;
    // Create a new gutter element and append it.
    var gElt = gutters.appendChild( elt( "div", null, "CodeMirror-gutter " + gutterClass ) ) ;
    if ( gutterClass == "CodeMirror-linenumbers" ) {
      cm.display.lineGutter = gElt ; // Store reference to line number gutter.
      gElt.style.width = ( cm.display.lineNumWidth || 1 ) + "px" ; // Set its width.
    }
  }
  // Show/hide gutters container based on whether any gutters are present.
  gutters.style.display = i ? "" : "none" ;
}

/*
 *  lineLength(doc, line)
 *  Calculates the effective length of a line, accounting for collapsed spans.
 */
function lineLength ( doc, line ) {
  if ( line.height == 0 ) {
    return 0 ; // Hidden lines have no effective length.
  }
  var len = line.text.length ;
  var merged, cur = line ;

  // Adjust length for collapsed spans starting *before* this line.
  while ( merged = collapsedSpanAtStart( cur ) ) {
    var found = merged.find() ;
    cur = getLine( doc, found.from.line ) ;
    len += found.from.ch - found.to.ch ;
  }
  cur = line ;
  // Adjust length for collapsed spans ending *after* this line.
  while ( merged = collapsedSpanAtEnd( cur ) ) {
    var found = merged.find() ;
    len -= cur.text.length - found.from.ch ;
    cur = getLine( doc, found.to.line ) ;
    len += cur.text.length - found.to.ch ;
  }
  return len ;
}

/*
 *  computeMaxLength(cm)
 *  Determines the maximum line length in the document to correctly size the horizontal scrollbar.
 */
function computeMaxLength ( cm ) {
  var d   = cm.display ;
  var doc = cm.doc ;

  d.maxLine        = getLine( doc, doc.first ) ;        // Start with the first line.
  d.maxLineLength  = lineLength( doc, d.maxLine ) ;     // Get its length.
  d.maxLineChanged = true ;                             // Mark that max line has been (re)computed.

  doc.iter( function ( line ) {
    var len = lineLength( doc, line ) ;
    if ( len > d.maxLineLength ) {
      d.maxLineLength = len ; // Update if a longer line is found.
      d.maxLine       = line ;
    }
  } ) ;
}

/*
 *  setGuttersForLineNumbers(options)
 *  Ensures the "CodeMirror-linenumbers" gutter is present in options.gutters
 *  if options.lineNumbers is true, and removed if false.
 */
function setGuttersForLineNumbers ( options ) {
  var found = false ;
  for ( var i = 0 ; i < options.gutters.length ; ++i ) {
    if ( options.gutters[i] == "CodeMirror-linenumbers" ) {
      if ( options.lineNumbers ) {
        found = true ;
      } else {
        options.gutters.splice( i--, 1 ) ; // Remove if lineNumbers is false.
      }
    }
  }
  if ( !found && options.lineNumbers ) {
    options.gutters.push( "CodeMirror-linenumbers" ) ; // Add if lineNumbers is true and not found.
  }
}


/*
 *  SCROLLBARS SECTION
 *  Functions related to managing and updating the custom scrollbars.
 */

/*
 *  updateScrollbars(d, docHeight)
 *  Synchronizes the fake scrollbars with the actual content size.
 *  @param d: The display object.
 *  @param docHeight: The total height of the document content.
 */
function updateScrollbars ( d /* display */, docHeight ) {
  var totalHeight = docHeight + 2 * paddingTop( d ) ; // Calculate total height including padding.
  d.sizer.style.minHeight = d.heightForcer.style.top = totalHeight + "px" ; // Set sizer height.

  var scrollHeight = Math.max( totalHeight, d.scroller.scrollHeight ) ;
  var needsH = d.scroller.scrollWidth > d.scroller.clientWidth ; // Check if horizontal scrollbar is needed.
  var needsV = scrollHeight > d.scroller.clientHeight ;          // Check if vertical scrollbar is needed.

  // Update vertical scrollbar.
  if ( needsV ) {
    d.scrollbarV.style.display = "block" ;
    d.scrollbarV.style.bottom = needsH ? scrollbarWidth( d.measure ) + "px" : "0" ;
    d.scrollbarV.firstChild.style.height = 
      ( scrollHeight - d.scroller.clientHeight + d.scrollbarV.clientHeight ) + "px" ;
  } else {
    d.scrollbarV.style.display = "" ;
  }

  // Update horizontal scrollbar.
  if ( needsH ) {
    d.scrollbarH.style.display = "block" ;
    d.scrollbarH.style.right = needsV ? scrollbarWidth( d.measure ) + "px" : "0" ;
    d.scrollbarH.firstChild.style.width =
      ( d.scroller.scrollWidth - d.scroller.clientWidth + d.scrollbarH.clientWidth ) + "px" ;
  } else {
    d.scrollbarH.style.display = "" ;
  }

  // Update scrollbar filler corner.
  if ( needsH && needsV ) {
    d.scrollbarFiller.style.display = "block" ;
    d.scrollbarFiller.style.height = d.scrollbarFiller.style.width = scrollbarWidth( d.measure ) + "px" ;
  } else {
    d.scrollbarFiller.style.display = "" ;
  }

  // Mac OS X Lion/Mountain Lion specific scrollbar styling workaround.
  if ( mac_geLion && scrollbarWidth( d.measure ) === 0 ) {
    d.scrollbarV.style.minWidth = d.scrollbarH.style.minHeight = mac_geMountainLion ? "18px" : "12px" ;
  }
}

/*
 *  visibleLines(display, doc, viewPort)
 *  Calculates the range of lines that are currently visible within the editor's viewport.
 *  @param display: The display object.
 *  @param doc: The document object.
 *  @param viewPort: Optional viewport override (top/bottom values).
 *  @returns: An object {from, to} indicating the line numbers.
 */
function visibleLines ( display, doc, viewPort ) {
  var top    = display.scroller.scrollTop ;
  var height = display.wrapper.clientHeight ;

  if ( typeof viewPort == "number" ) {
    top = viewPort ;
  }
  else if ( viewPort ) {
    top    = viewPort.top ;
    height = viewPort.bottom - viewPort.top ;
  }

  top    = Math.floor( top - paddingTop( display ) ) ;
  var bottom = Math.ceil( top + height ) ;

  return { from: lineAtHeight( doc, top ), to: lineAtHeight( doc, bottom ) } ;
}


/*
 *  LINE NUMBERS SECTION
 *  Functions related to handling and displaying line numbers.
 */

/*
 *  alignHorizontally(cm)
 *  Aligns widgets and fixed gutters horizontally with the content when scrolling.
 */
function alignHorizontally ( cm ) {
  var display = cm.display ;
  // Only proceed if widgets need alignment or fixed gutter is enabled.
  if ( !display.alignWidgets && ( !display.gutters.firstChild || !cm.options.fixedGutter ) ) {
    return ;
  }

  // Calculate horizontal compensation for scroll.
  var comp = compensateForHScroll( display ) - display.scroller.scrollLeft + cm.doc.scrollLeft ;
  var gutterW = display.gutters.offsetWidth ;
  var l = comp + "px" ;

  // Align alignable nodes within lineDiv.
  for ( var n = display.lineDiv.firstChild ; n ; n = n.nextSibling ) {
    if ( n.alignable ) {
      for ( var i = 0, a = n.alignable ; i < a.length ; ++i ) {
        a[i].style.left = l ;
      }
    }
  }

  // Align fixed gutter.
  if ( cm.options.fixedGutter ) {
    display.gutters.style.left = ( comp + gutterW ) + "px" ;
  }
}

/*
 *  maybeUpdateLineNumberWidth(cm)
 *  Checks if the line number gutter width needs updating and performs it.
 *  @returns: true if width was updated, false otherwise.
 */
function maybeUpdateLineNumberWidth ( cm ) {
  if ( !cm.options.lineNumbers ) {
    return false ; // No line numbers, no update needed.
  }

  var doc     = cm.doc ;
  var last    = lineNumberFor( cm.options, doc.first + doc.size - 1 ) ; // Get the last line number string.
  var display = cm.display ;

  // Only update if the number of characters in the last line number has changed.
  if ( last.length != display.lineNumChars ) {
    // Create a temporary element to measure the width of the line number.
    var test = display.measure.appendChild( elt( "div", [ elt( "div", last ) ],
                                               "CodeMirror-linenumber CodeMirror-gutter-elt" ) ) ;
    var innerW = test.firstChild.offsetWidth ;
    var padding = test.offsetWidth - innerW ;

    display.lineGutter.style.width = "" ; // Clear width to allow recalculation.
    display.lineNumInnerWidth = Math.max( innerW, display.lineGutter.offsetWidth - padding ) ;
    display.lineNumWidth      = display.lineNumInnerWidth + padding ;
    display.lineNumChars      = display.lineNumInnerWidth ? last.length : -1 ;

    display.lineGutter.style.width = display.lineNumWidth + "px" ; // Set the new width.
    return true ;
  }
  return false ;
}

/*
 *  lineNumberFor(options, i)
 *  Generates the line number string for a given line index.
 */
function lineNumberFor ( options, i ) {
  return String( options.lineNumberFormatter( i + options.firstLineNumber ) ) ;
}

/*
 *  compensateForHScroll(display)
 *  Calculates the horizontal offset due to the scroller's position.
 */
function compensateForHScroll ( display ) {
  return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left ;
}


/*
 *  DISPLAY DRAWING SECTION
 *  Functions responsible for rendering the editor's content and managing its view.
 */

/*
 *  updateDisplay(cm, changes, viewPort)
 *  High-level function to update the editor's visual display.
 *  @returns: true if the display was updated, false otherwise.
 */
function updateDisplay ( cm, changes, viewPort ) {
  var oldFrom = cm.display.showingFrom ;
  var oldTo   = cm.display.showingTo ;

  var updated = updateDisplayInner( cm, changes, viewPort ) ; // Perform the actual display update.

  if ( updated ) {
    signalLater( cm, "update", cm ) ; // Signal a general update event.
    if ( cm.display.showingFrom != oldFrom || cm.display.showingTo != oldTo ) {
      signalLater( cm, "viewportChange", cm, cm.display.showingFrom, cm.display.showingTo ) ; // Signal viewport change.
    }
  }

  updateSelection( cm ) ;                         // Ensure selection is correctly rendered.
  updateScrollbars( cm.display, cm.doc.height ) ; // Update scrollbars based on new content height.

  return updated ;
}

/*
 *  updateDisplayInner(cm, changes, viewPort)
 *  Core function for updating the editor's DOM representation.
 *  It determines which parts of the display need to be redrawn based on changes and scroll position.
 *  @returns: true if the display was updated, false otherwise.
 */
function updateDisplayInner ( cm, changes, viewPort ) {
  var display = cm.display ;
  var doc     = cm.doc ;

  // If wrapper has no clientWidth, it's hidden, so reset showing range and return.
  if ( !display.wrapper.clientWidth ) {
    display.showingFrom = display.showingTo = doc.first ;
    display.viewOffset = 0 ;
    return ;
  }

  /*
   *  Compute the new visible window.
   *  If `viewPort` is provided, it overrides the current scroll position.
   */
  var visible = visibleLines( display, doc, viewPort ) ;

  // Bail out early if no changes and the visible area is already rendered.
  if ( changes.length == 0 &&
      visible.from > display.showingFrom && visible.to < display.showingTo ) {
    return ;
  }

  // Update line number width if necessary; if it changes, force a full redraw.
  if ( maybeUpdateLineNumberWidth( cm ) ) {
    changes = [ { from: doc.first, to: doc.first + doc.size } ] ;
  }

  // Adjust sizer's margin and scrollbar position based on gutter width.
  var gutterW = display.sizer.style.marginLeft = display.gutters.offsetWidth + "px" ;
  display.scrollbarH.style.left = cm.options.fixedGutter ? gutterW : "0" ;

  /*
   *  When collapsed spans are present, a change in one line might affect
   *  the visual representation of a preceding line. This adjusts the
   *  change range to include the start of any collapsed span that ends
   *  within the original change.
   */
  if ( sawCollapsedSpans ) {
    for ( var i = 0 ; i < changes.length ; ++i ) {
      var ch = changes[i] ;
      var merged ;
      while ( merged = collapsedSpanAtStart( getLine( doc, ch.from ) ) ) {
        var from = merged.find().from.line ;
        if ( ch.diff ) {
          ch.diff -= ch.from - from ;
        }
        ch.from = from ;
      }
    }
  }

  /*
   *  Determine the starting line from which line numbers might need updating.
   *  This is relevant if line numbers are enabled and a change affects line positions.
   */
  var positionsChangedFrom = Infinity ;
  if ( cm.options.lineNumbers ) {
    for ( var i = 0 ; i < changes.length ; ++i ) {
      if ( changes[i].diff ) {
        positionsChangedFrom = changes[i].from ;
        break ;
      }
    }
  }

  // Calculate the extended rendering range (viewport + margin).
  var end  = doc.first + doc.size ;
  var from = Math.max( visible.from - cm.options.viewportMargin, doc.first ) ;
  var to   = Math.min( end, visible.to + cm.options.viewportMargin ) ;

  // Expand 'from'/'to' slightly if near the current showing range to reduce flicker.
  if ( display.showingFrom < from && from - display.showingFrom < 20 ) {
    from = Math.max( doc.first, display.showingFrom ) ;
  }
  if ( display.showingTo > to && display.showingTo - to < 20 ) {
    to = Math.min( end, display.showingTo ) ;
  }

  // If collapsed spans are present, adjust 'from' and 'to' to visual line boundaries.
  if ( sawCollapsedSpans ) {
    from = lineNo( visualLine( doc, getLine( doc, from ) ) ) ;
    while ( to < end && lineIsHidden( getLine( doc, to ) ) ) {
      ++to ;
    }
  }

  /*
   *  Compute 'intact' ranges: portions of the display that can be reused.
   *  This involves taking the previously shown range and "punching holes"
   *  in it where changes occurred.
   */
  var intact = computeIntact( [ { from: display.showingFrom, to: display.showingTo } ], changes ) ;

  // Clip intact ranges to the new visible 'from' and 'to'.
  var intactLines = 0 ;
  for ( var i = 0 ; i < intact.length ; ++i ) {
    var range = intact[i] ;
    if ( range.from < from ) {
      range.from = from ;
    }
    if ( range.to > to ) {
      range.to = to ;
    }
    if ( range.from >= range.to ) {
      intact.splice( i--, 1 ) ; // Remove empty or invalid ranges.
    } else {
      intactLines += range.to - range.from ;
    }
  }

  // If the intact lines cover the entire new range, and the range hasn't changed, just update offset.
  if ( intactLines == to - from && from == display.showingFrom && to == display.showingTo ) {
    updateViewOffset( cm ) ;
    return ;
  }

  intact.sort( function ( a, b ) { return a.from - b.from ; } ) ; // Sort intact ranges.

  var focused = document.activeElement ; // Store the currently focused element.

  // If a large portion of the lines are not intact, hide lineDiv to prevent flicker during heavy updates.
  if ( intactLines < ( to - from ) * .7 ) {
    display.lineDiv.style.display = "none" ;
  }

  // Apply the display patch, updating/rendering lines.
  patchDisplay( cm, from, to, intact, positionsChangedFrom ) ;
  display.lineDiv.style.display = "" ; // Show lineDiv again.

  // Restore focus if it was lost during DOM manipulation.
  if ( document.activeElement != focused && focused.offsetHeight ) {
    focused.focus() ;
  }

  // Check if the overall display size has changed (e.g., editor resized).
  var different = from != display.showingFrom || to != display.showingTo ||
    display.lastSizeC != display.wrapper.clientHeight ;

  // Update last recorded client height if different.
  if ( different ) {
    display.lastSizeC = display.wrapper.clientHeight ;
  }

  // Update the currently showing range.
  display.showingFrom = from ;
  display.showingTo   = to ;

  startWorker( cm, 100 ) ; // Restart the background parsing worker.

  // Recalculate and adjust line heights after DOM update.
  var prevBottom = display.lineDiv.offsetTop ;
  for ( var node = display.lineDiv.firstChild, height ; node ; node = node.nextSibling ) {
    if ( node.lineObj ) {
      if ( ie_lt8 ) {
        var bot = node.offsetTop + node.offsetHeight ;
        height = bot - prevBottom ;
        prevBottom = bot ;
      } else {
        var box = node.getBoundingClientRect() ;
        height = box.bottom - box.top ;
      }
      var diff = node.lineObj.height - height ;