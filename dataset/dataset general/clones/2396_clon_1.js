// Balloon: Sticky Headers powered by pure Javascript
//
// Author: Vinay Hiremath
//         vhiremath4@gmail.com
//         www.vhmath.com
//
// Terms: There is no legitimate license associated with Balloon.
// I do not intend there to be. All I ask is that you do not try to sell
// Balloon to others on its own. If you're simply using it as a tool
// (even for a profitable website), that's cool with me. Other than that,
// feel free to do whatever you want with Balloon. If you wish, you may also
// remove this header. Code on broski.
// This section contains polyfills for older browsers.

// Function.prototype.bind polyfill.
// Source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
// For compatibility with IE versions <= 8
if (!Function.prototype.bind)
{
	Function.prototype.bind = function (oThis)
	{
		'use strict';
		// Check if the target is a function
		if (typeof this !== 'function')
		{
			// Throw an error if not callable
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		// Arguments to prepend
		var aArgs = Array.prototype.slice.call(arguments, 1);
		// The original function to bind
		var fToBind = this;
		// A no-op constructor for inheritance
		var FuncNOP = function () {};
		// The bound function
		var fBound = function ()
		{
				// Apply the original function with the correct context and arguments
				return fToBind.apply(
					(this instanceof FuncNOP && oThis) ?
						this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments))
				);
		};

		// Set up prototype chain for inheritance
		FuncNOP.prototype = this.prototype;
		fBound.prototype = new FuncNOP();

		return fBound; // Return the newly bound function
	};
}


// Array.prototype.indexOf polyfill
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// For compatibility with IE versions <= 8
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ )
	{
		'use strict';

		if (this == null) // Check for null or undefined context
		{
			throw new TypeError();
		}

		var t = Object(this); // Convert to object
		var len = t.length >>> 0; // Get length, ensuring it's an unsigned 32-bit integer
		var n;
		var k;

		if (len === 0) // Empty array case
		{
			return -1;
		}

		n = 0; // Default start index
		if (arguments.length > 1) // If fromIndex is provided
		{
			n = Number(arguments[1]); // Convert to number
			if (n != n) // Check for NaN (n !== n is true only for NaN)
			{
				n = 0; // If NaN, start from 0
			}
			else if (n != 0 && n != Infinity && n != -Infinity) // Handle finite numbers
			{
				n = (n > 0 || -1) * Math.floor(Math.abs(n)); // Clamp to integer
			}
		}

		if (n >= len) // If start index is beyond length
		{
			return -1;
		}

		// Determine actual start index 'k'
		k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

		// Loop through the array
		for (; k < len; k++)
		{
			// Check if property exists and value matches
			if (k in t && t[k] === searchElement)
			{
				return k; // Return index if found
			}
		}
		return -1; // Return -1 if not found
	};
}


// Self-executing anonymous function to encapsulate Balloon's logic
(function (doc) {
	'use strict';

	// Define constants and core variables
	var VER = '0.1'; // Current version of Balloon
	var root = this; // Global object (window in browsers)
	var INFLATION_CLASS_NAME = 'balloon-inflated'; // Class for inflated headers
	var FLOATING_CLASS_NAME  = 'balloon-floating'; // Class for floating headers

	var balloon; // The main Balloon constructor
	var jeeves;  // Helper utility object

	// Personal assistant, providing useful helper functions.
	jeeves = {
		// Checks if an object is an Array or NodeList
		isArray: function (o) {
			var toStrResult = Object.prototype.toString.call(o);
			return toStrResult === '[object Array]' || toStrResult === '[object NodeList]';
		},

		// Iterates over arrays or objects
		each: function (list, iterator, context) {
			var iterFunc = (context !== undefined) ? iterator.bind(context) : iterator;
			var i;
			var prop;

			// Handle arrays and NodeLists
			if (this.isArray(list)) {
				// Use native forEach if available
				if (Array.forEach !== undefined) {
					list.forEach(iterFunc);
				} else {
					// Manual loop for older browsers
					for (i = 0; i < list.length; i += 1) {
						iterFunc(list[i], i, list);
					}
				}
			} else {
				// Handle objects
				for (prop in list) {
					// Ensure it's an own property
					if (list.hasOwnProperty(prop)) {
						iterFunc(list[prop], prop, list);
					}
				}
			}
		},

		// Calculates the absolute offset of an element
		getOffset: function (o) {
			var x = 0;
			var y = 0;
			// Traverse up the DOM tree
			while (o && !isNaN(o.offsetLeft) && !isNaN(o.offsetTop)) {
				x += o.offsetLeft - o.scrollLeft;
				y += o.offsetTop - o.scrollTop;
				o = o.parentNode;
			}

			return {
				left: x,
				top: y
			};
		},

		// Toggles a class name on an element
		toggleClassName: function (o, name) {
			if (this.hasClass(o, name)) {
				var classes = o.className.split(' '); // Split into array
				var classIndex = classes.indexOf(name); // Find index
				classes.splice(classIndex, 1); // Remove class
				o.className = classes.join(' '); // Join back to string
			} else {
				// Add class, handling empty className
				if (o.className.length > 0) {
					o.className += ' ' + name;
				} else {
					o.className += name;
				}
			}
		},

		// Gets the current scroll position of the window
		getWindowScrollPos: function () {
			return (root.pageYOffset !== undefined) ? root.pageYOffset :
						(doc.documentElement || doc.body.parentNode || doc.body).scrollTop;
		},

		// Checks if an element has a specific class
		hasClass: function (o, name) {
			return o.className.indexOf(name) !== -1;
		},

		// Sets an option on a Balloon instance, with a fallback
		setOption: function (balloonInst, options, oName, fallback) {
			if (options[oName] !== undefined) {
				balloonInst[oName] = options[oName];
			} else {
				balloonInst[oName] = fallback;
			}
		}
	};

	// Function to unstick headers from a certain index onwards
	function unstickHeaders(balloonInst, endIndex) {
		var toIndex = endIndex;
		if (endIndex === undefined) {
			toIndex = 0; // Default to unsticking all
		}

		// Iterate over headers to unstick
		jeeves.each(balloonInst.headerStack.slice(toIndex), function (o, index) {
			// Remove inflation class
			if (jeeves.hasClass(o, INFLATION_CLASS_NAME)) {
				jeeves.toggleClassName(o, INFLATION_CLASS_NAME);
				o.parentNode.style.height = ''; // Reset parent height
				o.parentNode.style.width = '';  // Reset parent width
				// Reset top position if stacking
				if (balloonInst.stackHeaders && index > 0) {
					o.style.top = '';
				}
			}

			// Ensure floating class is removed
			if (!jeeves.hasClass(o, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(o, FLOATING_CLASS_NAME);
			}
		});
	}

	// Function to stick headers up to a certain index
	function stickHeaders(balloonInst, endIndex) {
		jeeves.each(balloonInst.headerStack.slice(0, endIndex), function (o, index) {
			// Add inflation class if not present
			if (!jeeves.hasClass(o, INFLATION_CLASS_NAME)) {
				jeeves.toggleClassName(o, INFLATION_CLASS_NAME);
				// Set parent dimensions to prevent collapse
				o.parentNode.style.height = o.offsetHeight + 'px';
				o.parentNode.style.width = o.offsetWidth + 'px';
			}

			// Adjust top position for stacked headers
			if (balloonInst.currentHeader > 0 && balloonInst.stackHeaders) {
				var offsetTop = 0;
				var i;
				for (i = 0; i < index; i += 1) {
					offsetTop += balloonInst.headerStack[i].offsetHeight;
				}
				o.style.top = offsetTop + 'px';
			}

			// Ensure floating class is removed
			if (jeeves.hasClass(o, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(o, FLOATING_CLASS_NAME);
			}
		});
	}

	// Inflates headers up to the current visible header
	function inflateUpToCurrent(balloonInst, yPosScrollView) {
		unstickHeaders(balloonInst); // Unstick all headers first

		var i;
		var j;
		var currentHeader = 0;
		var offsetTop = 0;

		// Loop backwards to find the highest header that should be sticky
		for (i = balloonInst.headerStack.length - 1; i >= 0; i -= 1) {
			offsetTop = 0;
			if (balloonInst.stackHeaders) {
				for (j = 0; j < i; j += 1) {
					offsetTop += balloonInst.headerStack[j].offsetHeight;
				}
			}
			// Check if scroll position has passed the header's original top
			if ((yPosScrollView + offsetTop) >= balloonInst.headerStack[i].offsetTop) {
				currentHeader = i;
				break;
			} else if (i === 0) {
				// If we are above the very first header
				currentHeader = -1;
			}
		}

		// Apply stickiness based on the determined current header
		if (currentHeader !== -1) {
			balloonInst.currentHeader = currentHeader;
			if (balloonInst.stackHeaders) {
				balloonInst.offsetTop = offsetTop + balloonInst.headerStack[currentHeader].offsetHeight;
			}
			stickHeaders(balloonInst, currentHeader + 1);
			unstickHeaders(balloonInst, currentHeader + 1);
		}
	}

	// Main pumping function, triggered on scroll
	function pump(balloonInst, scrollView) {
		// Determine scroll position based on scroll view
		var yPosScrollView = (scrollView === root) ? jeeves.getWindowScrollPos() : jeeves.getOffset(scrollView).top;
		inflateUpToCurrent(balloonInst, yPosScrollView);
	}

	// Sorts the header stack by their vertical position
	function sortStack(stack) {
		stack.sort(function (h1, h2) {
			return jeeves.getOffset(h1).top - jeeves.getOffset(h2).top;
		});

		// Add floating class to headers after the first one
		jeeves.each(stack.slice(1), function (header) {
			if (!jeeves.hasClass(header, FLOATING_CLASS_NAME)) {
				jeeves.toggleClassName(header, FLOATING_CLASS_NAME);
			}
		});
	}

	// Balloon constructor function
	balloon = function (options) {
		this.idMap = {};         // Maps IDs/classes to elements
		this.headerStack = [];   // Ordered list of sticky headers
		this.currentHeader = 0;  // Index of the currently "active" sticky header

		if (options !== undefined) {
			jeeves.setOption(this, options, 'scrollView', root);       // Scroll container
			jeeves.setOption(this, options, 'stackHeaders', false);    // Whether headers stack
		} else {
			this.scrollView = root;
			this.stackHeaders = false;
		}
	};

	// Balloon prototype methods
	balloon.prototype = {

		// Makes the object(s) associated with the id(s) passed in sticky headers.
		inflate: function (o) {
			var that = this;

			// Helper to add a single header or group of headers
			function addIndividual(id) {
				// If already mapped, deflate first to avoid duplicates
				if (that.idMap[id] !== undefined) {
					that.deflate(id);
				}

				// Handle class selectors
				if (id.charAt(0) === '.') {
					that.idMap[id] = doc.getElementsByClassName(id.slice(1));
					jeeves.each(that.idMap[id], function (elem) {
						that.headerStack.push(elem);
					});
				} else {
					// Handle ID selectors
					that.idMap[id] = doc.getElementById(id);
					that.headerStack.push(that.idMap[id]);
				}
			}

			// Handle different input types for 'o'
			if (typeof o === 'object') {
				if (jeeves.isArray(o)) {
					// If 'o' is an array, inflate each item
					jeeves.each(o, function (id) {
						that.inflate(id);
					});
				} else {
					// If 'o' is an object, inflate each property value
					jeeves.each(o, function (value, id) {
						that.inflate(id);
					});
				}
			} else {
				// If 'o' is a string, add the individual element
				addIndividual(o);
			}

			// Sort the header stack and attach scroll listener
			sortStack(this.headerStack);
			this.scrollView.onscroll = function () {
				pump(that, that.scrollView);
			};
		},

		// Unsticks the object(s) associated with the id(s) passed in.
		deflate: function (o) {
			var that = this;

			// Helper to remove a single header element
			function removeIndividualHeader(h) {
				if (h !== undefined) {
					// Remove floating and inflation classes
					if (jeeves.hasClass(h, FLOATING_CLASS_NAME)) {
						jeeves.toggleClassName(h, FLOATING_CLASS_NAME);
					}
					if (jeeves.hasClass(h, INFLATION_CLASS_NAME)) {
						jeeves.toggleClassName(h, INFLATION_CLASS_NAME);
					}

					// Adjust currentHeader if the removed header was before it
					if (that.headerStack.indexOf(h) <= that.currentHeader && that.currentHeader > 0) {
						that.currentHeader -= 1;
					}

					// Remove from headerStack
					that.headerStack.splice(
						that.headerStack.indexOf(h),
						1
					);
					// If no headers left, remove scroll listener
					if (that.headerStack.length === 0 && that.scrollView.onScroll !== null) {
						that.scrollView.onscroll = null;
					}
				}
			}

			// Helper to remove an entry from the idMap
			function removeEntry(id) {
				if (that.idMap[id] !== undefined) {
					if (jeeves.isArray(that.idMap[id])) {
						// If it was a class, remove all elements
						jeeves.each(that.idMap[id], function (header) {
							removeIndividualHeader(header);
						});
					} else {
						// If it was an ID, remove the single element
						removeIndividualHeader(that.idMap[id]);
					}

					// Delete entry from map
					delete that.idMap[id];
				}
			}

			// Handle different input types for 'o'
			if (typeof o === 'object') {
				if (jeeves.isArray(o)) {
					// If 'o' is an array, deflate each item
					jeeves.each(o, function (id) {
						that.deflate(id);
					});
				} else {
					// If 'o' is an object, deflate each property value
					jeeves.each(o, function (value, id) {
						that.deflate(id);
					});
				}
			} else {
				// If 'o' is a string, remove the individual entry
				removeEntry(o);
			}
		},

		// Removes the stickiness to all headers in this Balloon instance.
		destroy: function () {
			var that = this;
			jeeves.each(this.idMap, function (header, id) {
				that.deflate(id); // Deflate each mapped header
			});
		},

		// Returns the current version of Balloon
		version: function () {
			return VER;
		}
	};

	// Expose Balloon to the global scope
	root.Balloon = balloon;

	// Add a static destroy method to clean up the global reference
	root.Balloon.destroy = function () {
		delete root.Balloon;
	};

// Bind to the global object and pass the document object
}.bind(this)(this.document));