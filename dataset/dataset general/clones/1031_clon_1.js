/*
 *   !
 *   nib - A Stylus plugin for CSS3 goodness.
 *   Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 *   MIT Licensed.
 *   !
 */

/**
 *   Module dependencies for the nib plugin.
 *   These are external libraries or internal modules
 *   that the plugin relies upon.
 */

var stylus = require( 'stylus' );
var nodes  = stylus.nodes;
var utils  = stylus.utils;

// Declare Canvas variable, will be assigned later if available.
var Canvas;


// The main plugin export.
exports = module.exports = plugin;


/*
 *   Conditionally expose canvas-based APIs.
 *   These features are only enabled if the 'canvas'
 *   library can be successfully loaded.
 */

try
{
  // Attempt to load the 'canvas' module.
  Canvas = require( 'canvas' );

  // If canvas is available, load related modules for gradients and color images.
  var gradient   = require( './nodes/gradient' );
  var colorImage = require( './nodes/color-image' );
}
catch ( err )
{
  // If 'canvas' cannot be loaded (e.g., not installed),
  // silently ignore the error. Canvas-dependent features will be disabled.
}


/**
 *   Library version string.
 *   This indicates the current version of the nib plugin.
 */

exports.version = '0.3.2';


/**
 *   Stylus path for the plugin.
 *   This points to the directory where the nib plugin resides.
 */

exports.path = __dirname;


/**
 *   Return the plugin callback function for Stylus.
 *   This function is what Stylus will invoke to register
 *   nib's functionalities.
 *
 *   @return { Function } The callback function that Stylus executes.
 *   @api public
 */

function plugin( )
{
  return function ( style )
  {
    // Include the current directory in Stylus's lookup paths.
    // This allows Stylus to find nib's internal .styl files.
    style.include( __dirname );

    // Check if the Canvas library was successfully loaded.
    if ( Canvas )
    {
      // If Canvas is available, define a Stylus variable 'has-canvas' as true.
      style.define( 'has-canvas', nodes.true );

      // --- Canvas-based Gradient Functions ---
      // Define Stylus functions for creating and manipulating gradients.
      style.define( 'create-gradient-image', gradient.create );
      style.define( 'gradient-data-uri', gradient.dataURL );
      style.define( 'add-color-stop', gradient.addColorStop );

      // --- Canvas-based Color Image Functions ---
      // Define Stylus functions for creating and manipulating color images.
      style.define( 'create-color-image', colorImage.create );
      style.define( 'color-data-uri', colorImage.dataURL );
    }
    else
    {
      // If Canvas is NOT available, define 'has-canvas' as false.
      // This allows Stylus stylesheets to conditionally use Canvas features.
      style.define( 'has-canvas', nodes.false );
    }
  }
}