// This file is part of the Framed project.
// Framed - a Stylus plugin for layout.
// Original author: Darcy Murphy (darcy.murphy@me.com)
// Copyright (c) 2012. All rights reserved.


//
// Required module dependencies for this plugin.
//
var    stylus    =    require('stylus')
    ,    nodes     =    stylus.nodes
    ,    utils     =    stylus.utils
; // End of variable declarations.


// Export the main plugin function.
exports   =   module.exports   =   plugin;


//
// Current version of the Framed plugin.
// This string identifies the library version.
//
exports.version   =   '0.1.0';


//
// Path to the directory where this plugin resides.
// Used for stylus.include(__dirname).
//
exports.path   =   __dirname;


//
// Main plugin function.
// This function returns a callback that Stylus will use.
//
// @returns {Function} A function that takes a Stylus `style` object.
// @api public
//
function   plugin   ( )
{
	return   function   ( style )
	{
		style.include   ( __dirname )   ;
	}
}