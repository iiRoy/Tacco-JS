/*
 * Interpolator Script
 *
 * This script is responsible for handling the visualization of
 * interpolation curves on a canvas element, allowing users to define
 * custom equations and animate a box element based on these equations.
 *
 * Original Author: Juraj Novák, inloop.eu
 *
 */


// --- Core UI Elements ---
// These variables store references to the main HTML elements
// that the script interacts with to display and control the visualization.

var graph          = document.getElementById( "graph" );
var editor         = ace.edit( "editor" );
var editorElement  = document.getElementById( "editor-parent" );
var delay          = document.getElementById( "delay" );
var box            = document.getElementById( "box" );
var removeVis      = document.getElementById( "remove-vis" );
var errorIcon      = document.getElementById( "syntax-error-icon" );
var library        = document.getElementById( "library" );
var help           = document.getElementById( "help" );

// Get the 2D rendering context for the canvas
var ctx            = graph.getContext( "2d" );


// --- Application Constants ---
// Define various constants used throughout the application for
// visualization types, graph dimensions, and styling.

var VISUALIZATION = {
  NONE:       0,
  MOVEMENT:   1,
  SCALING:    2,
  ROTATION:   3,
  ALPHA:      4
};

var GRAPH_PAD              = 40; // Padding around the graph area
var GRAPH_TEXT_PAD         = 5;  // Padding for text labels
var GRAPH_MAX_Y            = 10; // Maximum Y-axis value displayed initially
var GRAPH_MAX_OVERFLOW_TOP = 10; // Max allowed overflow above GRAPH_MAX_Y
var GRAPH_MIN_Y            = 0;  // Minimum Y-axis value displayed initially
var GRAPH_MAX_OVERFLOW_BOTTOM = 10; // Max allowed overflow below GRAPH_MIN_Y
var GRAPH_MAX_TIME         = 10; // Max time value for grid (x-axis)
var GRAPH_MIN_TIME         = 0;  // Min time value for grid (x-axis)
var GRAPH_FONT_SIZE        = 8;  // Font size for graph labels
var GRAPH_WIDTH            = ( graph.width - ( GRAPH_PAD * 2 ) ); // Usable width for the graph
var MATH_PROPS             = Object.getOwnPropertyNames( Math ); // List of Math object properties for proxying


// --- Global State Variables ---
// Variables that track the current state of the application,
// such as the last valid equation, animation status, and overflow.

var lastValidEquation; // Stores the last successfully evaluated equation string
var startAnimTime;     // Timestamp when the current animation cycle began
var lastActiveBtn;     // Reference to the last active visualization button

var movementNextPos   = graph.height / 2 - box.clientHeight / 2; // Target Y position for movement animation
var isAnimating       = false; // Flag indicating if an animation is currently running
var isReverseAnim     = false; // Flag indicating if the animation should play in reverse

var currentTestType   = VISUALIZATION.NONE; // Current type of visualization being performed

var updateDelayId; // Holds the ID for the debounce timeout for editor updates

var graphOverflowTop    = 0; // Current calculated Y-axis overflow at the top
var graphOverflowBottom = 0; // Current calculated Y-axis overflow at the bottom


// --- Predefined Equations Library ---
// A collection of common interpolation equations for quick selection.

var EQUATIONS = {
  list: [
    { name: "[Basic]", value: null },
    { name: "Linear", value: "x" },
    { name: "Smoothstep", value: "x * x * (3 - 2 * x)" },
    { name: "Spring", value: "factor = 0.4\npow(2, -10 * x) * sin((x - factor / 4) * (2 * PI) / factor) + 1" },
    { name: "[Android]", value: null },
    { name: "AccelerateDecelerate", value: "(cos((x + 1) * PI) / 2.0) + 0.5" },
    {
      name: "Bounce",
      value: "//Use javascript syntax to create complex equations\nfunction bounce(t) { return t*t*8; }\n\nif (x < 0.3535)\n bounce(x)\nelse if (x < 0.7408)\n bounce(x - 0.54719) + 0.7\nelse if (x < 0.9644)\n bounce(x - 0.8526) + 0.9\nelse\n bounce(x - 1.0435) + 0.95"
    },
    { name: "Accelerate", value: "factor = 1.0\nif (factor == 1.0)\n x * x\nelse\n pow(x, 2 * factor)" },
    { name: "Anticipate", value: "tension = 2.0\nx * x * ((tension + 1) * x - tension)" },
    {
      name: "AnticipateOvershoot",
      value: "tension = 2.0 * 1.5\nfunction a(t,s) { return t * t * ((s + 1) * t - s); }\nfunction o(t,s) { return t * t * ((s + 1) * t + s); }\n\nif (x < 0.5)\n 0.5 * a(x * 2.0, tension)\nelse\n 0.5 * (o(x * 2.0 - 2.0, tension) + 2.0)"
    },
    { name: "Cycle", value: "cycles = 1.0\nsin(2 * cycles * PI * x)" },
    {
      name: "Decelerate",
      value: "factor = 1.0\nif (factor == 1.0)\n (1.0 - (1.0 - x) * (1.0 - x))\nelse\n (1.0 - pow((1.0 - x), 2 * factor))"
    },
    { name: "Overshoot", value: "tension = 2.0\n\nx -= 1.0\nx * x * ((tension + 1) * x + tension) + 1.0" },
    { name: "[Advanced]", value: null },
    {
      name: "CubicHermite",
      value: "function CubicHermite(t, p0, p1, m0, m1){\n   t2 = t*t;\n   t3 = t2*t;\n   return (2*t3 - 3*t2 + 1)*p0 + (t3-2*t2+t)*m0 + (-2*t3+3*t2)*p1 + (t3-t2)*m1;\n}\n\n//time, start, end, tangent0, tangent1\n//modify tangent0 and tangent1\nCubicHermite(x, 0, 1, 4, 4)"
    }
  ]
};


// --- Utility: String.prototype.replaceAll ---
// Adds a utility method to the String prototype for global replacements.

String.prototype.replaceAll = function( search, replacement ) {
  var target = this;
  return target.replace( new RegExp( search, 'g' ), replacement );
};


// --- Initialization Sequence ---
// This section handles the initial setup of the editor,
// drawing the graph, and populating the equation library.

// Initialize the Ace editor settings
editor.setTheme( "ace/theme/chrome" );
editor.renderer.setShowGutter( false );
editor.renderer.setPadding( 8 );
editor.renderer.setScrollMargin( 4, 0, 0, 0 );
editor.setHighlightActiveLine( false );
editor.getSession().setUseWrapMode( true );
editor.getSession().setMode( "ace/mode/javascript" );

// Perform initial drawing operations
drawAll();
drawBox();

// Update placeholder visibility based on initial state
updateBoxPlaceholders( -1 );

// Populate the equation library dropdown
EQUATIONS.list.forEach( function ( entry ) {
  var section = ( entry.value == null );
  var option = document.createElement( "option" );
  option.innerHTML = ( !section ? "&nbsp;" : "" ) + entry.name;

  library.add( option );

  if ( section ) {
    option.style.color    = "#8bc34a";
    option.disabled       = true;
  }
} );

// Set the initial equation from the library and update data
setEquationFromLib( 1 );
updateData();


// --- Event Listeners ---
// Attach event handlers to UI elements for interactivity.

editor.addEventListener( "input", function () {
  updateDelay();
} );

delay.addEventListener( "input", function () {
  updateDelay();
} );


// --- Function Definitions ---
// Contains all the functions that drive the interpolator application.


/**
 * Debounces updates from editor and delay inputs.
 * Ensures updateData is not called too frequently.
 */
function updateDelay() {
  clearTimeout( updateDelayId );
  updateDelayId = window.setTimeout( function () {
    updateData();
  }, 50 );
}


/**
 * Sets the equation in the editor from the predefined library.
 *
 * @param {number} [index] - The index of the equation in the library list.
 *                           If not provided, uses the currently selected index.
 */
function setEquationFromLib( index ) {
  if ( typeof index === "undefined" ) {
    index = library.selectedIndex;
  } else {
    library.options[ index ].selected = true;
  }

  editor.getSession().setValue( EQUATIONS.list[ index ].value );
}


/**
 * Updates the visibility and position of box placeholders based on the
 * current visualization type.
 *
 * @param {number} type - The current visualization type (e.g., VISUALIZATION.MOVEMENT).
 */
function updateBoxPlaceholders( type ) {
  var container        = document.getElementById( "container" );
  var placeHolderStart = document.getElementById( "box-placeholder-start" );
  var placeHolderEnd   = document.getElementById( "box-placeholder-end" );

  // Calculate the horizontal center position for the box elements
  var boxCenterPos     = ( container.offsetLeft / 2 - ( box.clientWidth / 2 ) ) + "px";
  var elements         = document.getElementsByClassName( "box" );

  // Apply the calculated center position to all elements with class 'box'
  for ( var i = 0; i < elements.length; i++ ) {
    elements[ i ].style.left = boxCenterPos;
  }

  // Handle visibility for the start placeholder (hidden for ALPHA visualization)
  if ( type == VISUALIZATION.ALPHA ) {
    placeHolderStart.style.display = "none";
  } else {
    placeHolderStart.style.display = "block";
  }

  // Handle visibility and position for the end placeholder (only for MOVEMENT visualization)
  if ( type == VISUALIZATION.MOVEMENT ) {
    placeHolderEnd.style.top     = ( movementNextPos + box.clientHeight ) + "px";
    placeHolderEnd.style.display = "block";
  } else {
    placeHolderEnd.style.display = "none";
  }
}


/**
 * Initiates a full update of the graph and animation.
 * Clears and redraws the graph, resets animation timer, and redraws the box.
 */
function updateData() {
  drawAll(); // Redraws the graph grid, axis, and curve
  startAnimTime = Date.now(); // Reset animation start time
  drawBox(); // Redraws the animated box
}


/**
 * Clears the canvas and redraws all graph components:
 * grid, axes, and the interpolation curve.
 */
function drawAll() {
  ctx.clearRect( 0, 0, graph.width, graph.height ); // Clear the entire canvas
  resetFontStyle(); // Reset font to default for consistent drawing

  drawGrid();   // Draw the background grid
  drawAxis();   // Draw the X and Y axes
  drawGraph();  // Draw the interpolation curve itself
}


/**
 * Resets the canvas font style to the default for graph elements.
 */
function resetFontStyle() {
  ctx.fillStyle = "black";
  ctx.font      = GRAPH_FONT_SIZE + "pt verdana";
}


/**
 * Calculates the absolute Y-position on the canvas corresponding to the
 * logical zero point, considering padding and bottom overflow.
 *
 * @returns {number} The Y-coordinate for the zero point.
 */
function getZeroYPos() {
  return graph.height - GRAPH_PAD - ( graphOverflowBottom * getGraphSpaceRow() );
}


/**
 * Calculates the pixel height corresponding to one unit in the graph's Y-axis,
 * taking into account total graph height, padding, and both top/bottom overflows.
 *
 * @returns {number} The pixel height of one Y-axis unit.
 */
function getGraphSpaceRow() {
  return ( graph.height - GRAPH_PAD * 2 ) / ( GRAPH_MAX_Y + graphOverflowTop + graphOverflowBottom );
}


/**
 * Draws the background grid of the graph, including row and column lines
 * and their respective labels. Handles overflow styling.
 */
function drawGrid() {
  ctx.lineWidth   = 1;
  ctx.textAlign   = "left";
  ctx.strokeStyle = "#e0e0e0"; // Light grey for grid lines

  var GRAPH_SPACE_ROW = getGraphSpaceRow(); // Pixel spacing per Y-unit
  var GRAPH_SPACE_COL = ( graph.height - GRAPH_PAD * 2 ) / ( GRAPH_MAX_Y ); // Pixel spacing per X-unit (assuming square grid for columns)

  ctx.beginPath(); // Start a new path for grid lines

  // Loop through Y-axis values to draw rows and labels
  for ( var i = GRAPH_MIN_Y - graphOverflowBottom; i <= GRAPH_MAX_Y + graphOverflowTop; i++ ) {
    var isTimeMax = i < GRAPH_MIN_TIME || i > GRAPH_MAX_TIME; // Check if outside time bounds

    // Draw horizontal grid rows
    var y = getZeroYPos() - ( i * GRAPH_SPACE_ROW );
    ctx.moveTo( GRAPH_PAD, y );
    ctx.lineTo( graph.width - GRAPH_PAD, y );

    // Draw vertical grid columns (based on Y-axis spacing for consistency)
    var x = ( i * GRAPH_SPACE_COL ) - 1 + GRAPH_PAD;
    if ( !isTimeMax ) {
      ctx.moveTo( x, graph.height - GRAPH_PAD );
      ctx.lineTo( x, GRAPH_PAD );
    }

    // Apply red color for overflow labels
    if ( ( graphOverflowTop > 0 && i > GRAPH_MAX_Y ) || ( graphOverflowBottom > 0 && i < GRAPH_MIN_Y ) ) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "black";
    }

    // Apply bold font for specific Y-axis labels (GRAPH_MAX_Y and 0)
    if ( i == GRAPH_MAX_Y || i == 0 ) {
      ctx.font = "bold " + GRAPH_FONT_SIZE + "pt verdana";
    } else {
      ctx.font = GRAPH_FONT_SIZE + "pt verdana";
    }

    // Draw Y-axis legend (values scaled by 1/10)
    var legend        = ( i / 10 ).toFixed( 1 );
    var legendWidth   = ctx.measureText( legend ).width;
    var legendHalfWidth = legendWidth / 2;

    // Only draw Y-axis zero if there's a bottom overflow, otherwise omit to avoid clutter
    if ( !( i == 0 && graphOverflowBottom == 0 ) ) {
      ctx.fillText( legend.toString(), GRAPH_PAD - GRAPH_TEXT_PAD - legendWidth, y + ( GRAPH_FONT_SIZE / 2 ) );
    }

    // Draw X-axis legend (time values)
    if ( !isTimeMax && i != 0 ) {
      ctx.fillStyle = "black";
      ctx.fillText( legend.toString(), x - legendHalfWidth, graph.height - GRAPH_PAD + GRAPH_FONT_SIZE + GRAPH_TEXT_PAD );
    }
  }
  ctx.stroke(); // Render all the grid lines
}


/**
 * Draws the main X and Y axes for the graph.
 */
function drawAxis() {
  resetFontStyle();
  ctx.lineWidth   = 2;
  ctx.strokeStyle = "black";
  ctx.textAlign   = "center";
  ctx.fillStyle   = "silver";

  ctx.beginPath();
  // Draw Y-axis line
  ctx.moveTo( GRAPH_PAD, GRAPH_PAD );
  ctx.lineTo( GRAPH_PAD, graph.height - GRAPH_PAD );
  // Draw X-axis line (at the calculated zero position)
  ctx.moveTo( GRAPH_PAD, getZeroYPos() );
  ctx.lineTo( graph.width - GRAPH_PAD, getZeroYPos() );
  // Label the X-axis as 'time (x)'
  ctx.fillText( "time (x)", GRAPH_PAD + GRAPH_WIDTH / 2, GRAPH_WIDTH + GRAPH_PAD + GRAPH_TEXT_PAD + GRAPH_FONT_SIZE * 3 );

  ctx.stroke(); // Render the axis lines
}


/**
 * Calculates the effective maximum height available for drawing the graph curve,
 * considering the canvas dimensions, padding, and any top/bottom overflows.
 *
 * @returns {number} The maximum pixel height for the graph curve.
 */
function getGraphMaxHeight() {
  var extraTop    = ( getGraphSpaceRow() * graphOverflowTop );
  var extraBottom = ( getGraphSpaceRow() * graphOverflowBottom );

  return GRAPH_WIDTH - extraTop - extraBottom;
}


/**
 * Draws the interpolation curve on the graph canvas based on the
 * user-defined equation. Also handles dynamic resizing of the graph
 * if the curve extends beyond the current visible bounds.
 */
function drawGraph() {
  ctx.lineWidth   = 3;
  ctx.strokeStyle = "#e51c23"; // Red color for the graph line

  ctx.beginPath(); // Start a new path for the graph curve

  // Define overflow thresholds (scaled by 1/10 as per legend scaling)
  var maxOverflowTop    = GRAPH_MAX_OVERFLOW_TOP / 10;
  var maxOverflowBottom = GRAPH_MAX_OVERFLOW_BOTTOM / 10;
  var maxGraphTop       = GRAPH_MAX_Y / 10;

  // Track the highest/lowest point the curve reaches to adjust overflow
  var overflowToSetTop    = 1;
  var overflowToSetBottom = 0;

  // Iterate across the graph width to plot points
  for ( var x = 0; x < GRAPH_WIDTH; x++ ) {
    var t = ( fEval( x / GRAPH_WIDTH ) ); // Evaluate the equation for the current 'x' (normalized time)
    var y = -t * getGraphMaxHeight();     // Scale the evaluated 't' value to canvas coordinates (inverted Y-axis)

    // Draw a line segment to the current point
    ctx.lineTo( x + GRAPH_PAD + 1, getZeroYPos() + y - 2 );

    // Check if the current 'y' value overflows the graph's visible bounds
    if ( t > maxGraphTop && t <= ( maxGraphTop + maxOverflowTop ) && t > overflowToSetTop ) {
      overflowToSetTop = t; // Update highest overflow point
    } else if ( t < GRAPH_MIN_Y && t >= GRAPH_MIN_Y - maxOverflowBottom && t < overflowToSetBottom ) {
      overflowToSetBottom = t; // Update lowest overflow point
    }
  }

  // Calculate the required graph overflow based on the curve's extent
  var overflowRelativeTop    = Math.ceil( Math.abs( ( maxGraphTop - overflowToSetTop ) * 10 ) );
  var overflowRelativeBottom = Math.ceil( Math.abs( ( GRAPH_MIN_Y - overflowToSetBottom ) * 10 ) );

  // If the calculated overflow differs from the current, redraw the entire graph with new bounds
  if ( overflowRelativeTop != graphOverflowTop || overflowRelativeBottom != graphOverflowBottom ) {
    graphOverflowTop    = overflowRelativeTop;
    graphOverflowBottom = overflowRelativeBottom;
    drawAll(); // Recursively call drawAll to update grid/axis with new overflows
    return;    // Exit to prevent drawing the graph with old bounds
  }

  ctx.stroke(); // Render the interpolation curve
}


/**
 * Prefixes Math functions in the given text with "Math." to ensure
 * they are correctly evaluated by `eval()`.
 *
 * @param {string} text - The equation string to process.
 * @returns {string} The processed equation string.
 */
function proxyMathFunctions( text ) {
  if ( text.length == 0 ) return text; // Return empty string if input is empty

  for ( var i in MATH_PROPS ) {
    text = text.replaceAll( MATH_PROPS[ i ], "Math." + MATH_PROPS[ i ] );
  }
  return text;
}


/**
 * Evaluates the user-defined equation for a given 'x' value (time).
 * Handles syntax errors and falls back to the last valid equation.
 *
 * @param {number} x - The input value (typically 0 to 1) for the equation.
 * @returns {number} The result of the equation evaluation.
 */
// noinspection JSUnusedLocalSymbols - 'd' is intentionally unused, for potential future use or debugging
function fEval( x ) {
  var d = delay.value; // 'd' is declared but not used in the final evaluation, possibly for debugging or future features.

  try {
    // Get the equation from the editor, proxy Math functions, and evaluate
    var equationData = proxyMathFunctions( editor.getSession().getValue() );
    var val          = eval( equationData ); // DANGER: eval() can be a security risk with untrusted input.

    lastValidEquation = equationData; // Store the successful equation
    editorElement.classList.remove( "has-error" ); // Remove error styling
    editorElement.classList.add( "has-success" );  // Add success styling
    errorIcon.style.display = "none";             // Hide error icon

    return val;
  } catch ( e ) {
    // Handle evaluation errors
    errorIcon.title         = e.message;           // Set error message as tooltip
    errorIcon.style.display = "inline";            // Show error icon
    editorElement.classList.remove( "has-success" ); // Remove success styling
    editorElement.classList.add( "has-error" );      // Add error styling

    // Fallback: evaluate the last known valid equation to keep the graph visible
    return eval( lastValidEquation );
  }
}


/**
 * Draws a small square on the graph to indicate the current plot point
 * during animation.
 *
 * @param {number} t - The current normalized time (0 to 1) of the animation.
 */
function drawCurrentPlot( t ) {
  ctx.fillStyle = "yellow"; // Color for the animated plot point

  var y    = -( fEval( t ) * getGraphMaxHeight() ); // Calculate Y position based on equation and graph height
  var xPos = ( t * GRAPH_WIDTH ) + GRAPH_PAD + 1; // Calculate X position based on time and graph width
  var yPos = getZeroYPos() + y - 2;              // Calculate Y position on canvas

  ctx.fillRect( xPos - 1, yPos - 1, 2, 2 ); // Draw a small square (2x2 pixels)
}


/**
 * Enables or disables the animation of the box.
 * If enabled, resets the box and starts the animation.
 *
 * @param {boolean} enabled - True to enable animation, false to disable.
 */
function setAnimationEnabled( enabled ) {
  isAnimating = enabled; // Update animation state flag

  if ( enabled ) {
    resetBox(); // Reset box position/style
    drawBox();  // Start animation loop
  }
  drawAll(); // Always redraw the graph, even if just to clear the plot point
}


/**
 * The main animation loop for the box.
 * Calculates the current animation state based on time and applies
 * transformations to the box element.
 */
function drawBox() {
  var delayVal = parseFloat( delay.value ); // Get animation duration from input

  // If delay is zero or animation is disabled, stop
  if ( delayVal <= 0.0 || !isAnimating ) {
    return;
  }

  // Calculate normalized time 't' (0 to 1)
  var t = ( Date.now() - startAnimTime ) / delayVal;
  t = isReverseAnim ? 1.0 - t : t; // Adjust 't' for reverse animation

  // If animation is complete or outside bounds, reset and restart
  if ( t > 1.0 || t < 0 ) {
    updateData(); // Reset animation and redraw graph
  } else {
    // Request next animation frame
    requestAnimFrame( drawBox );
    drawCurrentPlot( t ); // Draw the current position on the graph

    // Apply transformations based on the current visualization type
    switch ( currentTestType ) {
      case VISUALIZATION.MOVEMENT:
        var movement = lerp( 0, movementNextPos, t ); // Linear interpolation for movement
        setBoxTransform( "translate(0, " + movement + "px)" );
        break;
      case VISUALIZATION.SCALING:
        var scale = lerp( 0, 1, t ); // Linear interpolation for scale
        setBoxTransform( "scale(" + scale + ", " + scale + ")" );
        break;
      case VISUALIZATION.ROTATION:
        var deg = lerp( 0, 360, t ); // Linear interpolation for rotation (0 to 360 degrees)
        setBoxTransform( "rotate(" + deg + "deg)" );
        break;
      case VISUALIZATION.ALPHA:
        var opacity = lerp( 0, 1, t ); // Linear interpolation for opacity
        box.style.opacity = opacity;
        break;
      default:
        // No specific action for VISUALIZATION.NONE
        break;
    }
  }
}


/**
 * Performs linear interpolation between two values (p1, p2)
 * using the result of the fEval function for the interpolation factor 't'.
 * This means the interpolation itself follows the defined curve.
 *
 * @param {number} p1 - The starting value.
 * @param {number} p2 - The ending value.
 * @param {number} t  - The interpolation factor (typically 0 to 1), which is fed into fEval.
 * @returns {number} The interpolated value.
 */
function lerp( p1, p2, t ) {
  // The original code was (p1 + (p2 - p1)) * fEval(t);
  // This simplifies to p2 * fEval(t) + p1 * (1 - fEval(t))
  // However, Type I clone means no logical change, so I keep the original expression.
  return ( p1 + ( p2 - p1 ) ) * fEval( t );
}


/**
 * Toggles the direction of the animation (forward/reverse) and
 * triggers an update to restart the animation with the new direction.
 */
function reverseAnim() {
  isReverseAnim = !isReverseAnim; // Flip the reverse animation flag
  updateData();                   // Restart animation from current point with new direction
}


/**
 * Applies CSS transform properties to the animated box element,
 * handling vendor prefixes for broader browser compatibility.
 *
 * @param {string} transform - The CSS transform string (e.g., "translate(Xpx, Ypx)").
 */
function setBoxTransform( transform ) {
  box.style.webkitTransform = transform; // Webkit browsers
  box.style.transform       = transform; // Standard
  box.style.msTransform     = transform; // IE/Edge
}


/**
 * Handles the selection of a visualization type button.
 * Activates the selected button, updates the current visualization type,
 * enables/disables animation, and updates placeholders.
 *
 * @param {HTMLElement} event - The button element that triggered the event.
 */
function setBoxAnim( event ) {
  // Deactivate the previously active button, if any
  if ( lastActiveBtn ) {
    lastActiveBtn.classList.remove( "active" );
    lastActiveBtn.classList.remove( "btn-primary" );
  }

  // If `event.value` is undefined, it indicates a "remove visualization" action
  if ( typeof event.value === "undefined" ) {
    setAnimationEnabled( false );     // Stop all animations
    resetBox();                       // Reset box to default state
    isReverseAnim     = false;        // Ensure animation is not in reverse
    removeVis.style.display = "none"; // Hide the "remove visualization" button
    updateBoxPlaceholders( 0 );       // Reset placeholders (type 0 usually means no special placeholder)
  } else {
    // A specific visualization type button was clicked
    currentTestType = parseInt( event.value ); // Parse the value to get the visualization type
    event.classList.add( "active" );           // Add 'active' class for styling
    event.classList.add( "btn-primary" );      // Add 'btn-primary' for styling
    lastActiveBtn = event;                     // Store reference to the newly active button

    removeVis.style.display = "inline";        // Show the "remove visualization" button
    setAnimationEnabled( true );               // Start animation for the selected type
    updateBoxPlaceholders( currentTestType );  // Update placeholders based on new type
  }
}


/**
 * Resets the animated box to its initial state (full opacity, no transform)
 * and restarts the animation timer.
 */
function resetBox() {
  startAnimTime = Date.now(); // Reset animation start time to now
  box.style.opacity = "1";    // Set box opacity to fully visible
  setBoxTransform( "none" );  // Remove all CSS transforms
}


/**
 * Toggles the visibility of the help box overlay.
 * Positions it over the graph canvas when shown.
 */
function toggleHelpBox() {
  // Check if help box is currently visible (display is not empty string and not "none")
  if ( help.style.display != "" && help.style.display != "none" ) {
    help.style.display = "none"; // Hide the help box
  } else {
    // Show help box over the canvas
    help.style.height = graph.height + "px";                 // Match canvas height
    help.style.left   = graph.getBoundingClientRect().left + "px"; // Position at canvas left edge
    help.style.display = "inline";                         // Make it visible
  }
}


/**
 * Polyfill for `requestAnimationFrame`, providing a cross-browser
 * compatible way to schedule animation updates. Falls back to `setTimeout`
 * if `requestAnimationFrame` is not supported.
 */
window.requestAnimFrame = ( function () {
  return (
    window.requestAnimationFrame       || // Standard
    window.webkitRequestAnimationFrame || // Webkit prefix
    window.mozRequestAnimationFrame    || // Mozilla prefix
    window.oRequestAnimationFrame      || // Opera prefix
    window.msRequestAnimationFrame     || // Microsoft prefix
    function ( /* function */ callback ) {
      // Fallback to setTimeout for browsers that don't support requestAnimationFrame
      window.setTimeout( callback, 1000 / 60 ); // Approximately 60 frames per second
    }
  );
} )(); // Immediately invoke the function to assign the correct implementation