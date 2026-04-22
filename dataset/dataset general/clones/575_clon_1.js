/*
 * This file contains the Envelope.js plugin source code.
 *
 * Copyright (c) 2012 Ryan Ankam.
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/* This comment indicates that the 'console' global variable is available and should not be linted as undefined. */
/*global console:false*/

(function($, window, document, undefined) {

	// Enforce strict mode for cleaner code and fewer errors.
	'use strict';

	// Define additional methods that can be called on the plugin instance.
	var _methods = {

		add: function(options) {

			var newElement, // This will hold the newly created alert element.
				self = this, // Cache 'this' for use in nested functions.
				framework = null; // Initialize framework variable.

			// Extend default event options with user-provided options.
			options = $.extend({}, _eventDefaults, options);

			// Determine the UI framework based on the configuration.
			if (_options.uiFramework.search(new RegExp('jqueryui', 'i')) === 0) {
				framework = 'jqueryui'; // jQuery UI framework detected.
			} else if (_options.uiFramework.search(new RegExp('bootstrap', 'i')) === 0) {
				framework = 'bootstrap'; // Bootstrap framework detected.
			} else if (_options.uiFramework.search(new RegExp('foundation', 'i')) === 0) {
				framework = 'foundation'; // Foundation framework detected.
			} else {
				framework = 'envelope'; // Default to 'envelope' if no known framework is matched.
			}

			// Create the new alert element using the determined framework and options.
			newElement = addAlert(framework, options.type, options.message, options.addCloseButton);

			newElement.hide(); // Hide the element initially before appending and fading in.

			// Attach an event handler to the document for the specified event name.
			$(document).on(options.name, function(e, messageToAppend) {

				// If an additional message is provided, append it to the existing message.
				if (messageToAppend) {
					var $msg = newElement.find(".message"); // Find the message span within the new element.

					// Update the message HTML.
					$msg.html(
						$msg.html() + ' ' + messageToAppend
					);
				}

				self.append(newElement); // Append the new alert element to the target container.

				newElement.fadeIn('slow'); // Fade in the new element slowly.

				// If auto-close is enabled, set a timeout to fade out and remove the alert.
				if (options.autoClose) {

					var t = window.setTimeout(function() {
						newElement.fadeOut('slow', function() {
							$(this).remove(); // Remove the element from the DOM after fading out.
						});

						window.clearTimeout(t); // Clear the timeout to prevent potential issues.
					}, _options.autoCloseTimeout); // Use the configured auto-close timeout.
				}

				// If a callback function is provided and is a function, execute it.
				if (options.callback && typeof options.callback === 'function') {
					options.callback();
				}
			});

			return this; // Return 'this' for method chaining.
		},

		remove: function(method) {
			// Detach the specified event handler from the document.
			return $(document).off(method);
		}
	};

	// Objects to hold events and references to the plugin element and options.
	var _events = {},
		_element, // Reference to the element on which the plugin was initialized.
		_options; // Stores the merged plugin options.

	// Plugin default options.
	var _defaults = {
		uiFramework: 'none', // Default UI framework is 'none'.
		autoCloseTimeout: 5000 // Default auto-close timeout of 5 seconds (5000 milliseconds).
	};

	// Default options for each individual event/alert.
	var _eventDefaults = {
		type: 'info', // Default alert type is 'info'.
		autoClose: false, // Alerts do not auto-close by default.
		addCloseButton: false, // No close button by default.
		callback: undefined // No callback function by default.
	};

	// Configuration for creating UI elements based on different frameworks.
	var elems = {
		jqueryui: {
			ele: '<p><span class="ui-icon" style="float: left; margin-right: .3em;"></span>' + '<span class="message"></span></p>',
			successClass: 'ui-icon-info', // Class for success messages.
			errorClass: 'ui-icon-error', // Class for error messages.
			infoClass: 'ui-icon-info', // Class for info messages.
			closeButton: '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick" style="float: right">close</span></a>',
			addToSelector: 'span:first', // Selector to add class to.
			addCloseEvent: function() {
				// Event handler for the close button.
				$(this).on('click', function() {
					$(this).parent().parent().fadeOut('slow'); // Fade out the alert.
				});
			}
		},
		bootstrap: {
			ele: '<div class="alert"><span class="message"></span></div>',
			successClass: 'alert-success', // Class for success messages.
			errorClass: 'alert-error', // Class for error messages.
			infoClass: 'alert-info', // Class for info messages.
			closeButton: '<button class="close" data-dismiss="alert">x</button>',
			addToSelector: null, // No specific selector, add to the main element.
			addCloseEvent: function() {
				// Event handler for the close button.
				$(this).on('click', function() {
					$(this).parent().fadeOut('slow'); // Fade out the alert.
				});
			}
		},
		foundation: {
			ele: '<div class="alert-box"><span class="message"></span></div>',
			successClass: 'success', // Class for success messages.
			errorClass: 'alert', // Class for error messages.
			infoClass: null, // No specific info class for Foundation.
			closeButton: '<a class="close">x</a>',
			addToSelector: null, // No specific selector.
			addCloseEvent: function() {
				// Event handler for the close button.
				$(this).on('click', function() {
					$(this).parent().fadeOut('slow'); // Fade out the alert.
				});
			}
		},
		envelope: {
			ele: '<div class="env_container"><span class="message">Hello World</span></div>',
			successClass: 'success', // Class for success messages.
			errorClass: 'error', // Class for error messages.
			infoClass: null, // No specific info class for Envelope default.
			closeButton: $('<div class="close">&times;</div>'), // HTML for the close button.
			addToSelector: null, // No specific selector.
			addCloseEvent: function() {
				// Event handler for the close button.
				$(this).on('click', function() {
					$(this).parent().fadeOut('slow'); // Fade out the alert.
				});
			}
		}
	};


	// Helper function to create and configure an alert element.
	var addAlert = function(framework, type, message, addCloseButton) {

		var newElement = $(elems[framework].ele), // Create the base element for the alert.
			addToSelector = elems[framework].addToSelector, // Get the selector for where to add classes.
			addTo = null; // Initialize the target for class addition.

		// Determine the element to which classes should be added.
		if (addToSelector !== null) {
			addTo = newElement.find(addToSelector); // Find the specific element.
		} else {
			addTo = newElement; // Add to the main element itself.
		}

		// Apply the appropriate class based on the alert type.
		if (type === 'error') {

			addTo.addClass(elems[framework].errorClass); // Add error class.
		} else if (type === 'info') {

			if (elems[framework].infoClass) {
				addTo.addClass(elems[framework].infoClass); // Add info class if defined.
			}
		} else {

			addTo.addClass(elems[framework].successClass); // Default to success class.
		}

		// If a close button is required, create and append it.
		if (addCloseButton) {
			var closeButton = $(elems[framework].closeButton).clone(); // Clone the close button HTML.

			if (elems[framework].addCloseEvent) {
				elems[framework].addCloseEvent.call(closeButton); // Attach the close event handler.
			}

			newElement.append(closeButton); // Append the close button to the alert element.
		}

		newElement.find('span.message').html(message); // Set the message text.

		return newElement; // Return the fully constructed alert element.
	};

	// Main plugin method - extends jQuery's prototype.
	$.fn.envelope = function(options, events) {
		var $this = $(this), // Cache the jQuery object for the current element.
			method; // Variable to store method name if a string is passed.

		// Check if the first argument is a string and corresponds to a defined method.
		if (typeof options === 'string' && _methods[options]) {
			method = options; // Assign the method name.

			// Call the method with the current context and remaining arguments.
			return _methods[method].apply($this, Array.prototype.slice.call(arguments, 1));
		}
		// If options is an array, it means the user supplied events directly without initial options.
		else if ($.isArray(options)) {
			events = options; // Treat the array as events.
		}

		_events = $.extend({}, _events, events); // Merge provided events with existing ones.

		// If options is an object, merge it with the default plugin options.
		if (typeof options === 'object') {
			_options = $.extend({}, _defaults, options);
		}

		// Ensure that events is an array before processing.
		if ($.isArray(events)) {
			// Loop through each event definition.
			$.each(_events, function(index, value) {

				// Check if the event value is an object and has a 'name' property.
				if (typeof value === 'object' && value.hasOwnProperty('name')) {
					_methods.add.call($this, value); // Call the 'add' method for each event.
				}
			});
		}

		return this; // Return 'this' for method chaining.
	};

}(jQuery, window, window.document)); // Pass jQuery, window, and document as arguments.