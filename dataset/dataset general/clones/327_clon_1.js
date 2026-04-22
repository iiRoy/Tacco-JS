/*
 *  This file is part of the CodeMirror project.
 *  It contains foundational components and browser sniffing logic.
 *
 *  CodeMirror, copyright (c) by Marijn Haverbeke and others
 *  Distributed under an MIT license: http://codemirror.net/LICENSE
 */

// This is CodeMirror (http://codemirror.net), a code editor.
// It is implemented in JavaScript and interacts with the browser's DOM.
//
// Additional technical background for certain parts of this codebase
// can be found at: http://marijnhaverbeke.nl/blog/#cm-internals .
// This URL provides insights into the internal workings.

( function ( mod ) {
 if ( typeof exports === "object" && typeof module === "object" ) {
  // This branch handles CommonJS environments, such as Node.js.
  module.exports = mod ( ) ;
 } else if ( typeof define === "function" && define.amd ) {
  // This branch handles Asynchronous Module Definition (AMD) environments.
  return define ( [ ] , mod ) ;
 } else {
  // This is the fallback for plain browser environments,
  // where CodeMirror is exposed globally.
  this.CodeMirror = mod ( ) ;
 }
} ) ( function ( ) {
 "use strict" ;
 /*
  *  Strict mode is enabled for the entire module.
  *  This helps catch common coding errors and improves performance.
  */

 /*
  *  BROWSER SNIFFING SECTION:
  *  This part of the code detects various browser engines and specific browser versions.
  *  This is primarily done to work around browser-specific bugs and inconsistencies
  *  that cannot be reliably detected via feature detection alone.
  *  The userAgent string is the primary source of information here.
  */

 var gecko = /gecko\/\d/i.test( navigator.userAgent ) ; /* Checks for Gecko engine. */
 var ie_upto10 = /MSIE \d/.test( navigator.userAgent ) ; // Detects Internet Explorer up to version 10.
 var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec( navigator.userAgent ) ; // Detects IE 11+.
 var ie = ie_upto10 || ie_11up ; // Overall IE detection.
 var ie_version = ie && ( ie_upto10 ? document.documentMode || 6 : ie_11up[1] ) ; // Retrieves IE version number.
 var webkit = /WebKit\//.test( navigator.userAgent ) ; // Checks for WebKit engine.
 var qtwebkit = webkit && /Qt\/\d+\.\d+/.test( navigator.userAgent ) ; // Checks for QtWebkit.
 var chrome = /Chrome\//.test( navigator.userAgent ) ; // Checks for Chrome browser.
 var presto = /Opera\//.test( navigator.userAgent ) ; // Checks for Presto engine (old Opera).
 var safari = /Apple Computer/.test( navigator.vendor ) ; // Checks for Safari (Apple Computer vendor string).
 var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test( navigator.userAgent ) ; // Specific Mac OS X version check.
 var phantom = /PhantomJS/.test( navigator.userAgent ) ; // Detects PhantomJS headless browser.


 var ios = /AppleWebKit/.test( navigator.userAgent ) && /Mobile\/\w+/.test( navigator.userAgent ) ; // Detects iOS devices.
 // Note: This mobile detection logic is acknowledged as incomplete.
 // Further suggestions for robust mobile detection methods are welcome.
 var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test( navigator.userAgent ) ; // General mobile detection.
 var mac = ios || /Mac/.test( navigator.platform ) ; // Detects Mac OS.
 var windows = /win/i.test( navigator.platform ) ; // Detects Windows OS.

 var presto_version = presto && navigator.userAgent.match( /Version\/(\d*\.\d*)/ ) ;
 if ( presto_version )
  presto_version = Number ( presto_version [ 1 ] ) ;

 if ( presto_version && presto_version >= 15 ) {
  // Modern Opera versions (15+) use Blink/WebKit, so adjust flags.
  presto = false ;
  webkit = true ;
 }
 // Some browsers (especially on OS X) may map keyboard events differently
 // regarding the Command (Cmd) and Control (Ctrl) keys. This flag helps to
 // normalize these event properties.
 var flipCtrlCmd = mac && ( qtwebkit || presto && ( presto_version == null || presto_version < 12.11 ) ) ;
 var captureRightClick = gecko || ( ie && ie_version >= 9 ) ; // Determines if right-clicks should be captured.

 // Flags for internal optimization: these variables track the usage of
 // read-only and collapsed spans within the editor.
 var sawReadOnlySpans = false , sawCollapsedSpans = false ;

 /*
  *  EDITOR CONSTRUCTOR FUNCTION: CodeMirror
  *  This function serves as the primary entry point for creating a new
  *  CodeMirror editor instance. It initializes the editor's state,
  *  DOM structure, and event handlers.
  *  User code typically interacts with instances created by this constructor.
  */

 function CodeMirror ( place , options ) {
  // If 'this' is not an instance of CodeMirror, call the constructor with 'new'.
  if ( ! ( this instanceof CodeMirror ) ) {
   return new CodeMirror ( place , options ) ;
  }

  // Initialize options, ensuring a mutable copy.
  this.options = options = options ? copyObj ( options ) : { } ;
  // Apply default options where not explicitly provided.
  copyObj ( defaults , options , false ) ;
  // Ensure line numbers gutter is set up based on options.
  setGuttersForLineNumbers ( options ) ;

  var doc = options.value ;
  if ( typeof doc === "string" ) {
   // If the initial value is a string, create a new Doc instance.
   doc = new Doc ( doc , options.mode ) ;
  }
  this.doc = doc ; // Assign the document to the editor instance.

  // Initialize input handling based on the chosen input style.
  var input = new CodeMirror.inputStyles [ options.inputStyle ] ( this ) ;
  // Initialize the display component, which manages the DOM.
  var display = this.display = new Display ( place , doc , input ) ;
  display.wrapper.CodeMirror = this ; // Link DOM wrapper back to this editor instance.
  updateGutters ( this ) ; // Update gutter display.
  themeChanged ( this ) ; // Apply the editor theme.
  if ( options.lineWrapping ) {
   // Add CSS class for line wrapping if enabled.
   this.display.wrapper.className += " CodeMirror-wrap" ;
  }
  if ( options.autofocus && ! mobile ) {
   // Automatically focus the input element if autofocus is enabled and not on mobile.
   display.input.focus ( ) ;
  }
  initScrollbars ( this ) ; // Initialize scrollbars for the editor.

  this.state = {
   keyMaps : [ ] ,  // Stores key maps dynamically added using addKeyMap.
   overlays : [ ] , // Highlighting overlays, as added by addOverlay.
   modeGen : 0 ,   // Generation counter for mode/overlay changes, used to invalidate highlighting info.
   overwrite : false ,
   focused : false ,
   suppressEdits : false , // Flag to disable editing during key handlers when in readOnly mode is active.
   pasteIncoming : false ,
   cutIncoming : false , // Flags to help recognize paste/cut edits in input.poll mechanism.
   draggingText : false ,
   highlight : new Delayed ( ) , // Stores the timeout ID for the highlight worker.
   keySeq : null  // Stores an unfinished key sequence for multi-key commands.
  } ;

  var cm = this ; // Create a local reference for 'this'.

  // Workaround for an IE bug: textarea content might be magically restored on reload.
  // This proactively resets the hidden textarea content.
  if ( ie && ie_version < 11 ) {
   setTimeout ( function ( ) { cm.display.input.reset ( true ) ; } , 20 ) ;
  }

  registerEventHandlers ( this ) ; // Set up all necessary event listeners.
  ensureGlobalHandlers ( ) ; // Ensure global event handlers are in place.

  startOperation ( this ) ; // Begin an editor operation.
  this.curOp.forceUpdate = true ; // Force a display update after this operation.
  attachDoc ( this , doc ) ; // Attach the document to the editor's display.

  if ( ( options.autofocus && ! mobile ) || cm.hasFocus ( ) ) {
   // If autofocus is on (and not mobile) or the editor already has focus,
   // defer the focus action slightly.
   setTimeout ( bind ( onFocus , this ) , 20 ) ;
  } else {
   // Otherwise, trigger the blur handler.
   onBlur ( this ) ;
  }

  // Apply handlers for initial option values.
  for ( var opt in optionHandlers ) {
   if ( optionHandlers.hasOwnProperty ( opt ) ) {
    optionHandlers [ opt ] ( this , options [ opt ] , Init ) ;
   }
  }
  maybeUpdateLineNumberWidth ( this ) ; // Adjust line number gutter width if needed.
  if ( options.finishInit ) {
   // Execute any custom initialization hook provided in options.
   options.finishInit ( this ) ;
  }
  // Execute all registered initialization hooks.
  for ( var i = 0 ; i < initHooks.length ; ++i ) {
   initHooks [ i ] ( this ) ;
  }
  endOperation ( this ) ; // End the editor operation.

  // Suppress 'optimizelegibility' text rendering in Webkit with line wrapping.
  // This is a workaround for text measurement issues at line wrap boundaries.
  if ( webkit && options.lineWrapping &&
      getComputedStyle ( display.lineDiv ) .textRendering === "optimizelegibility" ) {
   display.lineDiv.style.textRendering = "auto" ;
  }
 }

 /*
  *  DISPLAY CONSTRUCTOR FUNCTION: Display
  *  This constructor handles the editor's DOM integration, managing both
  *  input reading and content rendering. It maintains references to key
  *  DOM nodes and display-related state variables.
  */

 function Display ( place , doc , input ) {
  var d = this ; // Alias 'this' for clarity within the constructor.
  d.input = input ; // Reference to the input handler.

  // The scrollbar filler covers the bottom-right corner when both scrollbars are present.
  d.scrollbarFiller = elt ( "div" , null , "CodeMirror-scrollbar-filler" ) ;
  d.scrollbarFiller.setAttribute ( "cm-not-content" , "true" ) ;
  // The gutter filler covers the bottom of the gutter area when a horizontal
  // scrollbar is present and coverGutterNextToScrollbar is active.
  d.gutterFiller = elt ( "div" , null , "CodeMirror-gutter-filler" ) ;
  d.gutterFiller.setAttribute ( "cm-not-content" , "true" ) ;
  // This div contains the actual code content, positioned to cover the viewport.
  d.lineDiv = elt ( "div" , null , "CodeMirror-code" ) ;
  // These divs are used to render selection highlights and cursor elements.
  d.selectionDiv = elt ( "div" , null , null , "position: relative; z-index: 1" ) ;
  d.cursorDiv = elt ( "div" , null , "CodeMirror-cursors" ) ;
  // A hidden element used for measuring text and element sizes without affecting layout.
  d.measure = elt ( "div" , null , "CodeMirror-measure" ) ;
  // This element is used to draw lines that are being measured but are not
  // currently visible in the main viewport.
  d.lineMeasure = elt ( "div" , null , "CodeMirror-measure" ) ;
  // This wrapper ensures all elements within the editor's coordinate system
  // (measure, selection, cursor, lines) are correctly positioned.
  d.lineSpace = elt ( "div" , [ d.measure , d.lineMeasure , d.selectionDiv , d.cursorDiv , d.lineDiv ] ,
      null , "position: relative; outline: none" ) ;
  // This element is moved around its parent to cover the currently visible view area.
  d.mover = elt ( "div" , [ elt ( "div" , [ d.lineSpace ] , "CodeMirror-lines" ) ] , null , "position: relative" ) ;
  // The sizer's height is adjusted to match the total document height, enabling scrolling.
  d.sizer = elt ( "div" , [ d.mover ] , "CodeMirror-sizer" ) ;
  d.sizerWidth = null ;
  // This element ensures the scrollable area is sufficiently large,
  // compensating for inconsistent browser behavior with `overflow: auto` and padding.
  d.heightForcer = elt ( "div" , null , null , "position: absolute; height: " + scrollerGap + "px; width: 1px;" ) ;
  // This div will contain the gutter elements, if any are configured.
  d.gutters = elt ( "div" , null , "CodeMirror-gutters" ) ;
  d.lineGutter = null ; // Reference to the line number gutter element.
  // The primary scrollable element of the editor.
  d.scroller = elt ( "div" , [ d.sizer , d.heightForcer , d.gutters ] , "CodeMirror-scroll" ) ;
  d.scroller.setAttribute ( "tabIndex" , "-1" ) ; // Make scroller focusable but not part of tab order.
  // The main wrapper element that encapsulates the entire CodeMirror editor.
  d.wrapper = elt ( "div" , [ d.scrollbarFiller , d.gutterFiller , d.scroller ] , "CodeMirror" ) ;

  // Workaround for an IE7 z-index bug. This is a partial fix as IE7 is not fully supported.
  if ( ie && ie_version < 8 ) {
   d.gutters.style.zIndex = -1 ;
   d.scroller.style.paddingRight = 0 ;
  }
  // Enable draggable behavior for the scroller on non-WebKit browsers
  // and non-Gecko mobile browsers.
  if ( ! webkit && ! ( gecko && mobile ) ) {
   d.scroller.draggable = true ;
  }

  if ( place ) {
   if ( place.appendChild ) {
    place.appendChild ( d.wrapper ) ; // Append to a DOM element.
   }
   else {
    place ( d.wrapper ) ; // Call a function to place the wrapper.
   }
  }

  // Current rendered range of lines (may be larger than the visible viewport).
  d.viewFrom = d.viewTo = doc.first ;
  d.reportedViewFrom = d.reportedViewTo = doc.first ;
  // Array holding information about the currently rendered lines.
  d.view = [ ] ;
  d.renderedView = null ;
  // Holds data about a single line rendered for measurement purposes, not in view.
  d.externalMeasured = null ;
  // The amount of empty space (in pixels) above the current view.
  d.viewOffset = 0 ;
  d.lastWrapHeight = d.lastWrapWidth = 0 ; // Last known wrap dimensions.
  d.updateLineNumbers = null ; // Function to update line numbers, if active.

  d.nativeBarWidth = d.barHeight = d.barWidth = 0 ; // Dimensions of native scrollbars.
  d.scrollbarsClipped = false ; // Flag indicating if scrollbars are clipped.

  // These properties are used to only resize the line number gutter when necessary,
  // typically when the number of lines crosses a boundary that changes its width.
  d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null ;
  // Set to true when a line widget that does not scroll horizontally is added.
  // This optimizes widget alignment by skipping it when not needed.
  d.alignWidgets = false ;

  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null ; // Cached display metrics.

  // Tracks the maximum line length to keep the horizontal scrollbar static
  // when possible, preventing unnecessary resizes during scrolling.
  d.maxLine = null ;
  d.maxLineLength = 0 ;
  d.maxLineChanged = false ;

  // Variables used for measuring the granularity of wheel scrolling events.
  d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null ;

  // Boolean flag indicating if the Shift key is currently held down.
  d.shift = false ;

  // Used to track if any changes occurred since the context menu was opened,
  // which can affect context menu behavior.
  d.selForContextMenu = null ;

  d.activeTouch = null ; // Tracks an active touch event.

  input.init ( d ) ; // Initialize the input handler with display reference.
 }

 /*
  *  STATE UPDATES SECTION:
  *  Functions in this section are responsible for updating the editor's
  *  internal state and display in response to option changes, document
  *  modifications, or other events. They ensure the editor remains
  *  in a consistent and correct state.
  */

 function loadMode ( cm ) {
  // Load or reload the editor's mode based on current options.
  cm.doc.mode = CodeMirror.getMode ( cm.options , cm.doc.modeOption ) ;
  resetModeState ( cm ) ; // Reset the mode-related state.
 }

 function resetModeState ( cm ) {
  // Iterate through all lines in the document.
  cm.doc.iter ( function ( line ) {
   if ( line.stateAfter ) {
    // Clear cached mode state for syntax highlighting.
    line.stateAfter = null ;
   }
   if ( line.styles ) {
    // Clear cached style information.
    line.styles = null ;
   }
  } ) ;
  cm.doc.frontier = cm.doc.first ; // Reset the highlighting frontier.
  startWorker ( cm , 100 ) ; // Restart the highlighting worker.
  cm.state.modeGen ++ ; // Increment mode generation to invalidate old highlighting.
  if ( cm.curOp ) {
   regChange ( cm ) ; // Register a change if an operation is ongoing.
  }
 }

 function wrappingChanged ( cm ) {
  if ( cm.options.lineWrapping ) {
   // Enable line wrapping: add CSS class and clear min-width for sizer.
   addClass ( cm.display.wrapper , "CodeMirror-wrap" ) ;
   cm.display.sizer.style.minWidth = "" ;
   cm.display.sizerWidth = null ;
  } else {
   // Disable line wrapping: remove CSS class and re-calculate max line.
   rmClass ( cm.display.wrapper , "CodeMirror-wrap" ) ;
   findMaxLine ( cm ) ;
  }
  estimateLineHeights ( cm ) ; // Re-estimate line heights.
  regChange ( cm ) ; // Register a change.
  clearCaches ( cm ) ; // Clear display caches.
  setTimeout ( function ( ) { updateScrollbars ( cm ) ; } , 100 ) ; // Update scrollbars after a delay.
 }

 /*
  *  Returns a function that estimates the height of a line.
  *  This estimate is used as a first approximation until the line becomes
  *  visible in the viewport and can be accurately measured.
  *  @param {CodeMirror} cm - The CodeMirror instance.
  *  @returns {function(Line): number} A function that takes a line object and returns its estimated height.
  */
 function estimateHeight ( cm ) {
  var th = textHeight ( cm.display ) , // Get base text height.
      wrapping = cm.options.lineWrapping ; // Check if line wrapping is enabled.
  var perLine = wrapping && Math.max ( 5 , cm.display.scroller.clientWidth / charWidth ( cm.display ) - 3 ) ;
  return function ( line ) {
   if ( lineIsHidden ( cm.doc , line ) ) {
    return 0 ; // Hidden lines have zero height.
   }

   var widgetsHeight = 0 ;
   if ( line.widgets ) {
    for ( var i = 0 ; i < line.widgets.length ; i ++ ) {
     if ( line.widgets [ i ] .height ) {
      widgetsHeight += line.widgets [ i ] .height ; // Accumulate widget heights.
     }
    }
   }

   if ( wrapping ) {
    // For wrapped lines, estimate height based on text length and 'perLine' character count.
    return widgetsHeight + ( Math.ceil ( line.text.length / perLine ) || 1 ) * th ;
   }
   else {
    // For non-wrapped lines, height is base text height plus widgets.
    return widgetsHeight + th ;
   }
  } ;
 }

 function estimateLineHeights ( cm ) {
  var doc = cm.doc , // Reference to the document.
      est = estimateHeight ( cm ) ; // Get the height estimation function.
  doc.iter ( function ( line ) {
   var estHeight = est ( line ) ;
   if ( estHeight !== line.height ) { // Use strict comparison.
    updateLineHeight ( line , estHeight ) ; // Update line height if estimate differs.
   }
  } ) ;
 }

 function themeChanged ( cm ) {
  // Update the wrapper's class name to reflect the new theme.
  // This replaces any existing theme class with the new one.
  cm.display.wrapper.className = cm.display.wrapper.className.replace ( /\s*cm-s-\S+/g , "" ) +
  cm.options.theme.replace ( /(^|\s)\s*/g , " cm-s-" ) ;
  clearCaches ( cm ) ; // Clear display caches as theme changes can affect measurements.
 }

 function guttersChanged ( cm ) {
  updateGutters ( cm ) ; // Rebuild and update gutter elements.
  regChange ( cm ) ; // Register a change to trigger a display update.
  setTimeout ( function ( ) { alignHorizontally ( cm ) ; } , 20 ) ; // Re-align horizontally after a short delay.
 }

 /*
  *  Rebuilds the gutter elements in the display.
  *  Also ensures that the left margin of the code area correctly
  *  accommodates the width of the gutters.
  *  @param {CodeMirror} cm - The CodeMirror editor instance.
  */
 function updateGutters ( cm ) {
  var gutters = cm.display.gutters , // The gutter container element.
      specs = cm.options.gutters ; // Gutter specifications from options.
  removeChildren ( gutters ) ; // Clear existing gutter elements.
  for ( var i = 0 ; i < specs.length ; ++i ) {
   var gutterClass = specs [ i ] ; // Current gutter class.
   // Create a new div for the gutter and append it.
   var gElt = gutters.appendChild ( elt ( "div" , null , "CodeMirror-gutter " + gutterClass ) ) ;
   if ( gutterClass === "CodeMirror-linenumbers" ) {
    cm.display.lineGutter = gElt ; // Store reference to line number gutter.
    gElt.style.width = ( cm.display.lineNumWidth || 1 ) + "px" ; // Set its width.
   }
  }
  // Show or hide the gutters container based on whether any gutters are present.
  gutters.style.display = i ? "" : "none" ;
  updateGutterSpace ( cm ) ; // Update the space occupied by gutters.
 }

 function updateGutterSpace ( cm ) {
  var width = cm.display.gutters.offsetWidth ; // Get the total width of all gutters.
  cm.display.sizer.style.marginLeft = width + "px" ; // Adjust the sizer's left margin.
 }

 /*
  *  Computes the effective character length of a line, taking into account
  *  collapsed ranges (defined by markText) that might hide parts of the line
  *  or merge content from other lines.
  *  @param {Line} line - The line object to measure.
  *  @returns {number} The effective character length of the line.
  */
 function lineLength ( line ) {
  if ( line.height === 0 ) {
   return 0 ; // Hidden lines have no length.
  }
  var len = line.text.length , merged , cur = line ;
  while ( merged = collapsedSpanAtStart ( cur ) ) {
   var found = merged.find ( 0 , true ) ;
   cur = found.from.line ;
   len += found.from.ch - found.to.ch ;
  }
  cur = line ;
  while ( merged = collapsedSpanAtEnd ( cur ) ) {
   var found = merged.find ( 0 , true ) ;
   len -= cur.text.length - found.from.ch ;
   cur = found.to.line ;
   len += cur.text.length - found.to.ch ;
  }
  return len ;
 }

 /*
  *  Finds the longest line in the entire document.
  *  This is important for correctly setting up the horizontal scrollbar.
  *  @param {CodeMirror} cm - The CodeMirror editor instance.
  */
 function findMaxLine ( cm ) {
  var d = cm.display , // Reference to the display object.
      doc = cm.doc ; // Reference to the document object.
  d.maxLine = getLine ( doc , doc.first ) ; // Initialize with the first line.
  d.maxLineLength = lineLength ( d.maxLine ) ; // Get its length.
  d.maxLineChanged = true ; // Mark that max line has potentially changed.
  doc.iter ( function ( line ) {
   var len = lineLength ( line ) ;
   if ( len > d.maxLineLength ) {
    d.maxLineLength = len ; // Update if a longer line is found.
    d.maxLine = line ; // Store the longest line.
   }
  } ) ;
 }

 /*
  *  Ensures that the 'CodeMirror-linenumbers' class is included in the
  *  `gutters` option array when the `lineNumbers` option is true,
  *  and removed when `lineNumbers` is false.
  *  @param {object} options - The editor options object.
  */
 function setGuttersForLineNumbers ( options ) {
  var found = indexOf ( options.gutters , "CodeMirror-linenumbers" ) ;
  if ( found === -1 && options.lineNumbers ) {
   // If line numbers are enabled but not in gutters, add it.
   options.gutters = options.gutters.concat ( [ "CodeMirror-linenumbers" ] ) ;
  } else if ( found > -1 && ! options.lineNumbers ) {
   // If line numbers are disabled but present in gutters, remove it.
   options.gutters = options.gutters.slice ( 0 ) ; // Create a shallow copy.
   options.gutters.splice ( found , 1 ) ; // Remove the item.
  }
 }

 /*
  *  SCROLLBARS SECTION:
  *  This part of the code deals with the initialization, measurement,
  *  and updating of the editor's scrollbars. It supports both native
  *  and custom scrollbar implementations.
  */

 /*
  *  Prepares and returns an object containing all necessary DOM measurement
  *  data required to update the scrollbars. This is done in a single pass
  *  to minimize costly DOM read/write cycles.
  *  @param {CodeMirror} cm - The CodeMirror editor instance.
  *  @returns {object} An object with various dimension and scroll properties.
  */
 function measureForScrollbars ( cm ) {
  var d = cm.display , // Display object.
      gutterW = d.gutters.offsetWidth ; // Width of the gutters.
  var docH = Math.round ( cm.doc.height + paddingVert ( cm.display ) ) ; // Total document height.
  return {
   clientHeight : d.scroller.clientHeight , // Visible height of the scroller.
   viewHeight : d.wrapper.clientHeight , // Visible height of the wrapper.
   scrollWidth : d.scroller.scrollWidth , // Total scrollable width.
   clientWidth : d.scroller.clientWidth , // Visible width of the scroller.
   viewWidth : d.wrapper.clientWidth , // Visible width of the wrapper.
   barLeft : cm.options.fixedGutter ? gutterW : 0 , // Left position for horizontal scrollbar.
   docHeight : docH , // Calculated document height.
   scrollHeight : docH + scrollGap ( cm ) + d.barHeight , // Total scrollable height.
   nativeBarWidth : d.nativeBarWidth , // Width of native scrollbars.
   gutterWidth : gutterW // Total gutter width.
  } ;
 }

 /*
  *  Constructor for native browser scrollbars.
  *  It creates and manages the DOM elements for vertical and horizontal scrollbars,
  *  attaching event listeners for scrolling.
  *  @param {HTMLElement} place - The DOM element where scrollbars should be placed.
  *  @param {function} scroll - Callback function to notify CodeMirror of scroll events.
  *  @param {CodeMirror} cm - The CodeMirror instance.
  */
 function NativeScrollbars ( place , scroll , cm ) {
  this.cm = cm ; // Store a reference to the CodeMirror instance.
  var vert = this.vert = elt ( "div" , [ elt ( "div" , null , null , "min-width: 1px" ) ] , "CodeMirror-vscrollbar" ) ;
  var horiz = this.horiz = elt ( "div" , [ elt ( "div" , null , null , "height: 100%; min-height: 1px" ) ] , "CodeMirror-hscrollbar" ) ;
  place ( vert ) ; // Place the vertical scrollbar.
  place ( horiz ) ; // Place the horizontal scrollbar.

  // Attach scroll event listener for the vertical scrollbar.
  on ( vert , "scroll" , function ( ) {
   if ( vert.clientHeight ) {
    scroll ( vert.scrollTop , "vertical" ) ;
   }
  } ) ;
  // Attach scroll event listener for the horizontal scrollbar.
  on ( horiz , "scroll" , function ( ) {
   if ( horiz.clientWidth ) {
    scroll ( horiz.scrollLeft , "horizontal" ) ;
   }
  } ) ;

  this.checkedOverlay = false ;
  // IE7-specific kludge: set minimum height/width for scrollbars to ensure they are visible.
  // This is not needed for IE8 and newer.
  if ( ie && ie_version < 8 ) {
   this.horiz.style.minHeight = this.vert.style.minWidth = "18px" ;
  }
 }

 // Prototype methods for NativeScrollbars.
 NativeScrollbars.prototype = copyObj ( {
  /*
   *  Updates the scrollbar dimensions and visibility based on current measurements.
   *  @param {object} measure - An object containing various display measurements.
   *  @returns {object} An object indicating the space taken by visible scrollbars {right, bottom}.
   */
  update : function ( measure ) {
   var needsH = measure.scrollWidth > measure.clientWidth + 1 ; // Does horizontal scrollbar needed?
   var needsV = measure.scrollHeight > measure.clientHeight + 1 ; // Does vertical scrollbar needed?
   var sWidth = measure.nativeBarWidth ; // Width of the native scrollbars.

   if ( needsV ) {
    this.vert.style.display = "block" ; // Show vertical scrollbar.
    this.vert.style.bottom = needsH ? sWidth + "px" : "0" ; // Adjust bottom if horizontal scrollbar is also present.
    var totalHeight = measure.viewHeight - ( needsH ? sWidth : 0 ) ;
    // Guard against negative values, a bug seen in IE8.
    this.vert.firstChild.style.height =
        Math.max ( 0 , measure.scrollHeight - measure.clientHeight + totalHeight ) + "px" ;
   } else {
    this.vert.style.display = "" ; // Hide vertical scrollbar.
    this.vert.firstChild.style.height = "0" ; // Reset child height.
   }

   if ( needsH ) {
    this.horiz.style.display = "block" ; // Show horizontal scrollbar.
    this.horiz.style.right = needsV ? sWidth + "px" : "0" ; // Adjust right if vertical scrollbar is also present.
    this.horiz.style.left = measure.barLeft + "px" ; // Position relative to gutters.
    var totalWidth = measure.viewWidth - measure.barLeft - ( needsV ? sWidth : 0 ) ;
    this.horiz.firstChild.style.width =
        ( measure.scrollWidth - measure.clientWidth + totalWidth ) + "px" ;
   } else {
    this.horiz.style.display = "" ; // Hide horizontal scrollbar.
    this.horiz.firstChild.style.width = "0" ; // Reset child width.
   }

   if ( ! this.checkedOverlay && measure.clientHeight > 0 ) {
    if ( sWidth === 0 ) {
     this.overlayHack ( ) ; // Apply overlay hack if scrollbars are invisible.
    }
    this.checkedOverlay = true ;
   }

   return { right : needsV ? sWidth : 0 , bottom : needsH ? sWidth : 0 } ;
  } ,
  /*
   *  Sets the horizontal scroll position.
   *  @param {number} pos - The new scrollLeft position.
   */
  setScrollLeft : function ( pos ) {
   if ( this.horiz.scrollLeft !== pos ) { // Only update if necessary.
    this.horiz.scrollLeft = pos ;
   }
  } ,
  /*
   *  Sets the vertical scroll position.
   *  @param {number} pos - The new scrollTop position.
   */
  setScrollTop : function ( pos ) {
   if ( this.vert.scrollTop !== pos ) { // Only update if necessary.
    this.vert.scrollTop = pos ;
   }
  } ,
  /*
   *  Special hack for some browsers (like older Mac Webkit) where scrollbars
   *  are overlaid and do not take up space. This ensures they are clickable.
   */
  overlayHack : function ( ) {
   var w = mac && ! mac_geMountainLion ? "12px" : "18px" ; // Determine appropriate width.
   this.horiz.style.minHeight = this.vert.style.minWidth = w ;
   var self = this ;
   var barMouseDown = function ( e ) {
    // If click is not directly on a scrollbar, pass to editor's onMouseDown.
    if ( e_target ( e ) !== self.vert && e_target ( e ) !== self.horiz )
     operation ( self.cm , onMouseDown ) ( e ) ;
   } ;
   on ( this.vert , "mousedown" , barMouseDown ) ; // Attach mousedown listeners.
   on ( this.horiz , "mousedown" , barMouseDown ) ;
  } ,
  /*
   *  Clears the scrollbar DOM elements from their parent.
   */
  clear : function ( ) {
   var parent = this.horiz.parentNode ;
   parent.removeChild ( this.horiz ) ;
   parent.removeChild ( this.vert ) ;
  }
 } , NativeScrollbars.prototype ) ;

 /*
  *  A "null" scrollbar model that does nothing.
  *  Used when scrollbars are completely disabled (e.g., for embedded scenarios).
  */
 function NullScrollbars ( ) {
  // Constructor does not need to do anything.
 }

 // Prototype methods for NullScrollbars, all are no-ops.
 NullScrollbars.prototype = copyObj ( {
  update : function ( ) { return { bottom : 0 , right : 0 } ; } , // Always report no space taken.
  setScrollLeft : function ( ) { } , // Does nothing.
  setScrollTop : function ( ) { } , // Does nothing.
  clear : function ( ) { } // Does nothing.
 } , NullScrollbars.prototype ) ;

 // Register the scrollbar models with CodeMirror.
 CodeMirror.scrollbarModel = { "native" : NativeScrollbars , "null" : NullScrollbars } ;

 /*
  *  Initializes the scrollbars for a CodeMirror instance.
  *  It clears any existing scrollbars and creates new ones based on the
  *  `scrollbarStyle` option.
  *  @param {CodeMirror} cm - The CodeMirror editor instance.
  */
 function initScrollbars ( cm ) {
  if ( cm.display.scrollbars ) {
   // If scrollbars already exist, clear them first.
   cm.display.scrollbars.clear ( ) ;
   if ( cm.display.scrollbars.addClass )
    rmClass ( cm.display.wrapper , cm.display.scrollbars.addClass ) ;
  }

  // Create new scrollbars using the configured model.
  cm.display.scrollbars = new CodeMirror.scrollbarModel [ cm.options.scrollbarStyle ] ( function ( node ) {
   // Function to place the scrollbar DOM node.
   cm.display.wrapper.insertBefore ( node , cm.display.scrollbarFiller ) ;
   // Prevent clicks on scrollbars from stealing focus from the editor input.
   on ( node , "mousedown" , function ( ) {
    if ( cm.state.focused ) {
     setTimeout ( function ( ) { cm.display.input.focus ( ) ; } , 0 ) ;
    }
   } ) ;
   node.setAttribute ( "cm-not-content" , "true" ) ; // Mark as non-content element.
  } , function ( pos , axis ) {
   // Callback for when scrollbars are scrolled.
   if ( axis === "horizontal" ) { // Use strict comparison.
    setScrollLeft ( cm , pos ) ;
   }
   else {
    setScrollTop ( cm , pos ) ;
   }