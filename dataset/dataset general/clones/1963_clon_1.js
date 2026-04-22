// This file implements the jQueryBinder plugin, providing data binding capabilities.
// Project URL: https://github.com/ramigb/jQueryBinder
// Developed by Rami GB (@ramigb)
// Current version: 0.1 - A foundational release for dynamic UI interactions.
// This code facilitates a form of two-way data binding-like behavior
// between a "binder" element and a "bindee" element.

(  function  (  $  )  {


	// Extend jQuery's prototype with our new 'binder' function.
	// This makes the 'binder' method available on all jQuery objects.
	$  .  fn  .  binder  =  function  (  user_options  )  {


		// Define default configuration options for the binder.
		// These can be overridden by the 'user_options' argument.
		var	defaults	=	{
			bindTo			:	null, 		// The target element (bindee) selector. Must be a valid jQuery selector string.
			listenTo		:	'change', 	// Event to listen for on the bindee (e.g., 'change', 'keyup', 'keypress').
			attribute		:	null, 		// HTML attribute to update on the binder, or a custom function for more complex updates.
			css				:	null, 		// CSS property to update on the binder (e.g., 'color', 'font-size', 'background').
			method			:	null, 		// jQuery method (e.g., 'text', 'html') or a custom function(bindee, binder) for binder updates.
			valMethod		:	'val', 		// Method used to get/set value from/to the bindee (default 'val', can be 'text', 'html', etc.).
			sync			:	null, 		// Flag to enable initial synchronization FROM binder TO bindee (feature still in development).
			syncMethod		:	null 		// Required if 'method' is a function and 'sync' is enabled; defines how to sync back.
		};


		// Merge default options with user-provided options.
		// This creates the final configuration object for this binding instance.
		var	options	=	$	.	extend	(	{	}	,	defaults	,	user_options	)	;


		// 'theBinder' is the jQuery object on which the .binder() method was originally called.
		var	theBinder	=	$	(	this	)	;


		// 'theBindee' is the jQuery object specified by the 'bindTo' option.
		// This is the source of the data for the binder.
		var	theBindee	=	$	(	options	.	bindTo	)	;


		// Ensure any previous bindings for this specific event and handler are removed
		// to prevent multiple handler executions for the same event.
		theBindee	.	unbind	(	options	.	listenTo	,	bindHandler	)	;


		// Establish the new binding: when the 'listenTo' event occurs on 'theBindee',
		// the 'bindHandler' function will be executed.
		theBindee	.	bind	(	options	.	listenTo	,	bindHandler	)	;


		// If initial synchronization is requested via the 'sync' option,
		// execute the sync handler immediately to set initial values.
		if	(	options	.	sync	)	{

			syncHandler	(	)	;
		}


		// The 'bindHandler' function is triggered by events on 'theBindee'.
		// It is responsible for transferring data FROM the bindee TO the binder.
		function	bindHandler	(	)	{

			// Logic for updating the binder based on the current value of the bindee.

			if	(	options	.	attribute	)	{
				// If an HTML attribute is specified in options, update the binder's attribute.
				theBinder	.	attr	(	options	.	attribute	,	theBindee	[	options	.	valMethod	]	(	)	)	;
			}


			if	(	options	.	css	)	{
				// If a CSS property is specified, update the binder's style.
				theBinder	.	css	(	options	.	css	,	theBindee	[	options	.	valMethod	]	(	)	)	;
			}


			if	(	options	.	method	)	{

				// If a method (either a jQuery method name or a custom function) is specified.
				if	(	typeof	options	.	method	!==	'function'	)	{
					// If it's a string, assume it's a jQuery method (e.g., 'text', 'html').
					theBinder	[	options	.	method	]	(	theBindee	[	options	.	valMethod	]	(	)	)	;
				}	else	{
					// If it's a function, execute the custom function with bindee and binder as arguments.
					options	.	method	(	theBindee	,	theBinder	)	;
				}
			}
		}	;


		// The 'syncHandler' function is used for initial synchronization.
		// It is responsible for transferring data FROM the binder TO the bindee.
		function	syncHandler	(	)	{

			// Perform initial data transfer from the binder to the bindee.

			if	(	options	.	attribute	)	{
				// If an attribute is specified, update the bindee's value using the binder's attribute.
				theBindee	[	options	.	valMethod	]	(	theBinder	.	attr	(	options	.	attribute	)	)	;
			}	;


			if	(	options	.	css	)	{
				// If a CSS property is specified, update the bindee's value using the binder's CSS property.
				theBindee	[	options	.	valMethod	]	(	theBinder	.	css	(	options	.	css	)	)	;
			}	;


			if	(	options	.	method	)	{

				// If a method (jQuery or custom function) is specified for synchronization.
				if	(	typeof	options	.	method	!==	'function'	)	{
					// Use the specified jQuery method from the binder to get its value, then set bindee's value.
					theBindee	[	options	.	valMethod	]	(	theBinder	[	options	.	method	]	(	)	)	;
				}	else	{
					// Execute the custom syncMethod with bindee and binder, then set bindee's value with the result.
					theBindee	[	options	.	valMethod	]	(	options	.	syncMethod	(	theBindee	,	theBinder	)	)	;
				}
			}	;
		}


	// Clean up references to local variables. While JavaScript's garbage collection
	// would typically handle these, explicit deletion can sometimes be used for clarity
	// or in specific performance-critical scenarios (though less common in modern JS).
	delete	defaults	;
	delete	user_options	;


}  )  (  jQuery  )  ;