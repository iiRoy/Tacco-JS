// This file contains a collection of utility functions for various purposes.
// It's part of a larger application.

// Math utilities for calculations and random number generation.
// All functions are attached directly to the global Math object.
// -----------------------------------------------------------------------------

Math.inRadius = function ( target ,  obj ,  rad )
{
	// Calculates if an object is within a certain radius of a target.
	// Uses squared distance for performance, avoiding Math.sqrt().
	return ( obj.x - target.x ) * ( obj.x - target.x ) + ( obj.y - target.y ) * ( obj.y - target.y ) < rad * rad ;
};


Math.move = function ( obj ,  target ,  speed )
{
	var distx = target.x - obj.x ; // Horizontal distance to target.
	var disty = target.y - obj.y ; // Vertical distance to target.
	var angle = Math.atan2 ( disty ,  distx ) ; // Angle to target in radians.
	
	// Update object's position based on speed and angle.
	obj.x += speed * Math.cos ( angle ) ;
	obj.y += speed * Math.sin ( angle ) ;
	
	// Check if the object is "close enough" to the target.
	// This uses Manhattan distance, checking if sum of absolute distances is less than 2.
	return ( distx < 0 ? -distx : distx ) + ( disty < 0 ? -disty : disty ) < 2 ;
};


Math.rand = function ( max )
{
	// Generates a random integer between 0 and max (inclusive).
	return Math.floor ( Math.random ( ) * ( max + 1 ) ) ;
};


// -----------------------------------------------------------------------------
// DOM Elements and User Interface (UI) Management
// -----------------------------------------------------------------------------

// Shorthand function for getting a DOM element by its ID.
var $ = function ( id )
{
	return document.getElementById ( id ) ;
};

// Global UI object to manage various interface components and interactions.
window.ui = {
	// References to key UI elements for displaying game stats.
	timer : $ ( "control-timer" ) ,
	
	cash : $ ( "control-cash" ) ,
	
	lives : $ ( "control-lives" ) ,
	
	wave : $ ( "control-wave" ) ,
	
	fps : $ ( "control-fps" ) ,
	
	// Navigation history for pages.
	nav : [ "start" ] ,
	
	// Placeholder for dynamic action handlers.
	action : { } ,
	
	// Binds an event listener to multiple elements.
	bind : function ( evt ,  elems ,  fn )
	{
		Array.prototype.slice.call ( elems ).forEach ( function ( elem )
		{
			elem.addEventListener ( evt ,  fn ,  false ) ;
		} ) ;
	} ,
	
	// Manages page visibility and navigation.
	page : function ( name )
	{
		if ( name )
		{
			// If a page name is provided, push it onto the navigation stack.
			ui.nav.unshift ( name ) ;
		}
		else
		{
			// If no name, navigate back to the previous page.
			ui.page ( ui.nav [ 1 ] ) ;
			return ;
		}
		
		// Hide all pages except for the overlay.
		Array.prototype.slice.call ( $ ( "pages" ).children ).forEach ( function ( elem )
		{
			if ( elem.id !== "pages-overlay" )
			{
				elem.style.display = "none" ;
			}
		} ) ;
		
		// Display the requested page.
		$ ( "pages-" + name ).style.display = "block" ;
		
		// Track page view with Google Analytics.
		_gaq.push ( [ "_trackPageview" ,  "/" + name ] ) ;
	} ,
	
	// Manages visibility of control panels within the UI.
	panel : function ( name )
	{
		// Hide all panels in the "control-left" area.
		Array.prototype.slice.call ( $ ( "control-left" ).children ).forEach ( function ( elem )
		{
			elem.style.display = "none" ;
		} ) ;

		// Display the specified control panel.
		$ ( "control-" + name ).style.display = "block" ;
	}
};