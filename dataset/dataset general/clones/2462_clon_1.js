/*
 *  jquery.simulate - A jQuery plugin to simulate browser mouse and keyboard events
 *
 *  Original Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 *  This code is dual licensed under the MIT or GPL Version 2 licenses.
 *  You can find the licenses here: http://jquery.org/license
 *
 *  This is a Type I clone: only whitespace and comments have been altered.
 *  The logical structure and all identifiers remain precisely as they were.
 *
 */


; (  function($  )    {


	// Extending jQuery's prototype to add the simulate method
	$.fn.extend(   {

		simulate: function( type,  options )   {
			// Iterate over each matched element
			return this.each( function() {
				// Merge default options with user-provided options
				var opt = $.extend(  {}, $.simulate.defaults, options || {}  );
				// Create a new simulation instance for the current element
				new $.simulate(  this, type, opt  );
			} );
		}
	}   );



	// The main $.simulate constructor function
	$.simulate = function(el, type, options) {
		// Store the target element and options
		this.target = el;
		this.options = options;

		// Check if the simulation type is 'drag'
		if (  /^drag$/.test(type)  ) {
			// If it's a drag event, call the corresponding method using apply
			this[type].apply(  this, [this.target, options]  );
		} else {
			// For other event types, use the generic simulateEvent method
			this.simulateEvent(  el, type, options  );
		}
	};


	// Extending the prototype of $.simulate for its methods
	$.extend(   $.simulate.prototype, {

		// Method to simulate a generic event
		simulateEvent: function(el, type, options) {
			var evt = this.createEvent(  type, options  ); // Create the actual event object
			this.dispatchEvent(  el, type, evt, options  ); // Dispatch the event on the element
			return evt; // Return the created event object
		},


		// Method to create an event object based on its type
		createEvent: function(type, options) {
			// Check if it's a mouse event
			if (  /^mouse(over|out|down|up|move)|(dbl)?click$/.test(type)  ) {
				return this.mouseEvent(  type, options  );
			}
			// Check if it's a keyboard event
			else if (  /^key(up|down|press)$/.test(type)  ) {
				return this.keyboardEvent(  type, options  );
			}
			// No other event types are currently handled by this method
		},


		// Method to create a mouse event
		mouseEvent: function(type, options) {
			var evt; // Event object holder

			// Default properties for mouse events, merged with provided options
			var e = $.extend(  {
				bubbles: true, cancelable: (type != "mousemove"), view: window, detail: 0,
				screenX: 0, screenY: 0, clientX: 0, clientY: 0,
				ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
				button: 0, relatedTarget: undefined
			}, options  );

			// Get the related target element, if any
			var relatedTarget = $(e.relatedTarget)[0];

			// Feature detection for event creation
			if (  $.isFunction(document.createEvent)  ) {
				evt = document.createEvent("MouseEvents"); // Standard way
				evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail,
					e.screenX, e.screenY, e.clientX, e.clientY,
					e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
					e.button, e.relatedTarget || document.body.parentNode);
			} else if (  document.createEventObject  ) {
				evt = document.createEventObject(); // IE specific way
				$.extend(evt, e);
				// Map button values for IE compatibility
				evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
			}
			return evt; // Return the constructed mouse event
		},


		// Method to create a keyboard event
		keyboardEvent: function(type, options) {
			var evt; // Event object holder

			// Default properties for keyboard events
			var e = $.extend(  { bubbles: true, cancelable: true, view: window,
				ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
				keyCode: 0, charCode: 0
			}, options  );

			// Standard way to create keyboard events
			if (  $.isFunction(document.createEvent)  ) {
				try {
					evt = document.createEvent("KeyEvents");
					evt.initKeyEvent(type, e.bubbles, e.cancelable, e.view,
						e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
						e.keyCode, e.charCode);
				} catch(err) {
					// Fallback for browsers that don't support KeyEvents directly
					evt = document.createEvent("Events");
					evt.initEvent(type, e.bubbles, e.cancelable);
					$.extend(evt, { view: e.view,
						ctrlKey: e.ctrlKey, altKey: e.altKey, shiftKey: e.shiftKey, metaKey: e.metaKey,
						keyCode: e.keyCode, charCode: e.charCode
					});
				}
			}
			// IE specific way
			else if (  document.createEventObject  ) {
				evt = document.createEventObject();
				$.extend(evt, e);
			}

			// Adjust keyCode/charCode for IE/Opera compatibility
			if (  $.browser.msie || $.browser.opera  ) {
				evt.keyCode = (e.charCode > 0) ? e.charCode : e.keyCode;
				evt.charCode = undefined;
			}
			return evt; // Return the constructed keyboard event
		},


		// Method to dispatch an event on a given element
		dispatchEvent: function(el, type, evt) {
			if (  el.dispatchEvent  ) {
				el.dispatchEvent(evt); // Standard DOM event dispatch
			} else if (  el.fireEvent  ) {
				el.fireEvent('on' + type, evt); // IE specific event dispatch
			}
			return evt; // Return the dispatched event
		},


		// Method to simulate a drag operation
		drag: function(el) {
			var self = this,
				center = this.findCenter(this.target), // Find the center coordinates of the target
				options = this.options,
				x = Math.floor(center.x),
				y = Math.floor(center.y),
				dx = options.dx || 0, // Horizontal displacement
				dy = options.dy || 0, // Vertical displacement
				target = this.target; // The element being dragged

			var coord = { clientX: x, clientY: y };
			this.simulateEvent(target, "mousedown", coord); // Simulate mousedown at the center

			coord = { clientX: x + 1, clientY: y + 1 };
			this.simulateEvent(document, "mousemove", coord); // Simulate first mousemove (start of drag)

			coord = { clientX: x + dx, clientY: y + dy };
			this.simulateEvent(document, "mousemove", coord); // Simulate mousemove to the final position
			this.simulateEvent(document, "mousemove", coord); // Another mousemove to ensure events are fired

			this.simulateEvent(target, "mouseup", coord); // Simulate mouseup at the final position
		},


		// Helper method to find the center coordinates of an element
		findCenter: function(el) {
			var el = $(this.target), // Ensure it's a jQuery object
				o = el.offset();     // Get its offset

			return {
				x: o.left + el.outerWidth() / 2,  // X coordinate of the center
				y: o.top + el.outerHeight() / 2   // Y coordinate of the center
			};
		}
	}   );


	// Extending the $.simulate object itself with defaults and constants
	$.extend(  $.simulate, {
		defaults: {
			speed: 'sync' // Default speed for simulations
		},
		// Keyboard key codes
		VK_TAB: 9,
		VK_ENTER: 13,
		VK_ESC: 27,
		VK_PGUP: 33,
		VK_PGDN: 34,
		VK_END: 35,
		VK_HOME: 36,
		VK_LEFT: 37,
		VK_UP: 38,
		VK_RIGHT: 39,
		VK_DOWN: 40
	}   );


} )(  jQuery  ); // End of the immediately invoked function expression