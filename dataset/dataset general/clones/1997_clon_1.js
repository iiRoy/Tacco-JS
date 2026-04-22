/*
 * flexie.js - A JavaScript library for CSS3 Flexible Box Model legacy support.
 *
 * Version: 1.0
 * Project: Flexie
 *
 * Description:
 * This script provides polyfill capabilities for older browsers
 * that do not natively support the CSS3 Flexible Box Layout Module.
 * It aims to mimic the behavior of flexbox for a consistent layout.
 *
 * License: The MIT License (MIT)
 *
 * Copyright (c) 2010 Richard Herrera
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

// Flexie Class Definition - Scoped to the Flexie Global Namespace
/*jslint evil: true, regexp: false, plusplus: false */
/*global window, document */

var Flexie = (function (win, doc) {

	// Public properties for the Flexie object, exposed later.
	var FLX = {},

	// Each DOM node processed by Flexie gets a unique ID.
	FLX_DOM_ID = 0, // Counter for unique DOM IDs.
	FLX_DOM_ATTR = "data-flexie-id", // Attribute name for the unique ID.
	FLX_PARENT_ATTR = "data-flexie-parent", // Attribute to mark flex parents.

	// Variable to store whether flexbox is natively supported or not.
	SUPPORT,

	// Variable to hold the detected JavaScript library/engine for DOM selection.
	ENGINE,

	// Configuration object for various JavaScript selector engines.
	// 's': selector method, 'm': DOM ready method, 'p': parameter for ready method, 'c': context for ready method.
	ENGINES = {
		"NW" : {
			s : "*.Dom.select" // Example: NW.Dom.select
		},
		"DOMAssistant" : {
			s : "*.$", // Example: DOMAssistant.$
			m : "*.DOMReady" // Example: DOMAssistant.DOMReady
		},
		"Prototype" : {
			s : "$$", // Global $$
			m : "document.observe", // document.observe
			p : "dom:loaded", // Event name
			c : "document" // Context is document
		},
		"YAHOO" : {
			s : "*.util.Selector.query", // YAHOO.util.Selector.query
			m : "*.util.Event.onDOMReady", // YAHOO.util.Event.onDOMReady
			c : "*.util.Event" // Context is YAHOO.util.Event
		},
		"MooTools" : {
			s : "$$", // Global $$
			m : "window.addEvent", // window.addEvent
			p : "domready" // Event name
		},
		"Sizzle" : {
			s : "*" // Sizzle, expects global Sizzle function
		},
		"jQuery" : {
			s : "*", // jQuery, expects global jQuery or $
			m : "*(document).ready" // $(document).ready
		},
		"dojo" : {
			s : "*.query", // dojo.query
			m : "*.addOnLoad" // dojo.addOnLoad
		}
	},

	// Variable to store the detected DOM manipulation library instance.
	LIBRARY,

	// Regular expressions used throughout the Flexie library for parsing and validation.
	PIXEL = /^-?\d+(?:px)?$/i, // Matches pixel values (e.g., "10px", "-5").
	NUMBER = /^-?\d/, // Matches any number.
	SIZES = /width|height|margin|padding|border/, // Matches common sizing properties.
	MSIE = /(msie) ([\w.]+)/, // Detects Internet Explorer and its version.
	WHITESPACE_CHARACTERS = /\t|\n|\r/g, // Matches tab, newline, carriage return characters.
	RESTRICTIVE_PROPERTIES = /^max\-([a-z]+)/, // Matches properties like max-width, max-height.
	PROTOCOL = /^https?:\/\//i, // Matches HTTP or HTTPS protocols.
	LEADINGTRIM = /^\s\s*/, // Matches leading whitespace.
	TRAILINGTRIM = /\s\s*$/, // Matches trailing whitespace.
	ONLY_WHITESPACE = /^\s*$/, // Matches strings containing only whitespace.
	CSS_SELECTOR = /\s?(\#|\.|\[|\:(\:)?[^first\-(line|letter)|before|after]+)/g, // Basic CSS selector detection (excluding some pseudo-elements).

	// String constants for improved readability and minification potential.
	EMPTY_STRING = "",
	SPACE_STRING = " ",
	PLACEHOLDER_STRING = "$1", // Used in string replacements.
	PADDING_RIGHT = "paddingRight",
	PADDING_BOTTOM = "paddingBottom",
	PADDING_LEFT = "paddingLeft",
	PADDING_TOP = "paddingTop",
	BORDER_RIGHT = "borderRightWidth",
	BORDER_BOTTOM = "borderBottomWidth",
	BORDER_LEFT = "borderLeftWidth",
	BORDER_TOP = "borderTopWidth",
	HORIZONTAL = "horizontal",
	VERTICAL = "vertical",
	INLINE_AXIS = "inline-axis",
	BLOCK_AXIS = "block-axis",
	INHERIT = "inherit",
	LEFT = "left",

	END_MUSTACHE = "}", // Closing curly brace character.

	// Array of CSS vendor prefixes.
	PREFIXES = " -o- -moz- -ms- -webkit- -khtml- ".split(SPACE_STRING),

	// Default values for flexbox properties.
	DEFAULTS = {
		orient : HORIZONTAL,
		align : "stretch",
		direction : INHERIT,
		pack : "start"
	},

	// Global reference arrays/objects to store flexbox related elements.
	FLEX_BOXES = [], // Stores detected flex container elements.
	POSSIBLE_FLEX_CHILDREN = [], // Stores rules for potential flex children.
	DOM_ORDERED, // Placeholder for future DOM ordering logic.

	RESIZE_LISTENER, // Placeholder for the resize event listener.

	// Minification optimizations: Using boolean and null constants.
	TRUE = true,
	FALSE = false,
	NULL = null,
	UNDEFINED, // Explicitly undefined.

	// Browser detection for Internet Explorer.
	BROWSER = {
		IE : (function () {
			var ie,
			ua = win.navigator.userAgent,
			match = (MSIE).exec(ua.toLowerCase());

			if (match) {
				ie = parseInt(match[2], 10); // Parse IE version.
			}

			return ie; // Returns IE version or undefined.
		}())
	},

	// Placeholder for the selectivizr engine, if used.
	/*
	 * selectivizr v1.0.0 - (c) Keith Clark, freely distributable under the terms
	 * of the MIT license.
	 *
	 * selectivizr.com
	 */
	selectivizrEngine;

	/**
	 * trim - Removes leading and trailing whitespace from a string.
	 * @param {string} string The input string to trim.
	 * @returns {string} The trimmed string.
	 */
	function trim (string) {
		if (string) {
			string = string.replace(LEADINGTRIM, EMPTY_STRING).replace(TRAILINGTRIM, EMPTY_STRING);
		}

		return string;
	}

	/**
	 * forEach - Iterates over an object or array. (Adapted from jQuery 1.4.3)
	 * @param {object|Array} object The object or array to iterate over.
	 * @param {function} callback The function to execute for each item.
	 * @returns {void}
	 * @see http://github.com/jquery/jquery/blob/master/src/core.js#L593
	 */
	function forEach(object, callback) {
		var name,
		i = 0,
		value,
		length = object ? object.length : UNDEFINED,
		isObj = length === UNDEFINED; // Check if it's an object or array-like.

		if (isObj) {
			// Iterate over object properties.
			for (name in object) {
				if (object.hasOwnProperty(name)) { // Ensure it's not a prototype property.
					if (callback.call(object[name], name, object[name]) === FALSE) {
						break; // Break if callback explicitly returns false.
					}
				}
			}
		} else {
			// Iterate over array-like items.
			for (value = object[0];
				i < length && callback.call(value, i, value) !== FALSE;
				value = object[++i]) {
				// No operation needed inside the loop, logic is in callback and condition.
			}
		}
	}

	/**
	 * determineSelectorMethod - Scans available JavaScript libraries to find a suitable
	 *                           selector engine for DOM element selection.
	 *                           This is done before selectivizr runs.
	 * @returns {function|undefined} The detected selector method, or undefined if none found.
	 */
	function determineSelectorMethod() {
		// Compatible selector engines are checked in order of their CSS3 support.
		var engines = ENGINES,
		method;

		forEach(engines, function (engine, obj) {
			// Check if the global engine object exists in the window scope.
			if (win[engine] && !method) {
				// Attempt to evaluate the selector method string (e.g., "jQuery" or "Prototype").
				method = eval(obj.s.replace("*", engine));

				if (method) {
					ENGINE = engine; // Store the name of the detected engine.
					return false; // Stop iteration once a method is found.
				}
			}
		});

		return method; // Return the found method.
	}

	/**
	 * addEvent - Cross-browser event attachment for load/resize events.
	 *            This is a simple polyfill for older browsers.
	 * @param {string} type The event type (e.g., "load", "resize").
	 * @param {function} func The event handler function.
	 * @returns {void}
	 */
	function addEvent(type, func) {
		type = "on" + type; // Prepend "on" for DOM event property.
		var oldevent = win[type]; // Store any existing event handler.

		if (typeof win[type] !== "function") {
			win[type] = func; // If no handler, assign directly.
		} else {
			// If a handler exists, chain the new one.
			win[type] = function () {
				if (oldevent) {
					oldevent(); // Call the old handler first.
				}
				func(); // Then call the new handler.
			};
		}
	}

	/**
	 * attachLoadMethod - Attaches a handler to the DOM ready/load event using
	 *                    the detected JavaScript library or a fallback.
	 * @param {function} handler The function to execute when the DOM is ready.
	 * @returns {void}
	 */
	function attachLoadMethod(handler) {
		// If an engine hasn't been determined yet, try to find one.
		if (!ENGINE) {
			LIBRARY = determineSelectorMethod();
		}

		var engines = ENGINES,
		method, // The DOM ready method from the library.
		caller, // The context for calling the method (e.g., 'document', 'window').
		args; // Arguments for the method.

		forEach(engines, function (engine, obj) {
			// Check if the engine exists globally and has a 'm' (method) property.
			if (win[engine] && !method && obj.m) {
				// Evaluate the method string (e.g., "jQuery(document).ready").
				method = eval(obj.m.replace("*", engine));
				// Determine the context for the method call.
				caller = obj.c ? eval(obj.c.replace("*", engine)) : win;
				args = []; // Initialize arguments array.

				if (method && caller) {
					if (obj.p) {
						args.push(obj.p); // Add event parameter if specified.
					}
					args.push(handler); // Add the actual handler function.
					method.apply(caller, args); // Call the method with context and arguments.
					return false; // Stop iterating once a method is attached.
				}
			}
		});

		// Fallback to standard window.onload if no library method was found.
		if (!method) {
			addEvent("load", handler);
		}
	}

	/**
	 * buildSelector - Constructs a CSS selector for a given DOM node.
	 *                 Prioritizes ID, then a custom Flexie ID.
	 * @param {HTMLElement} node The DOM node to build a selector for.
	 * @returns {string} The CSS selector string.
	 */
	function buildSelector (node) {
		var selector = node.nodeName.toLowerCase(); // Start with the tag name.

		if (node.id) {
			selector += "#" + node.id; // Append ID if available.
		} else if (node.FLX_DOM_ID) {
			// If no ID, use the Flexie custom attribute.
			selector += "[" + FLX_DOM_ATTR + "='" + node.FLX_DOM_ID + "']";
		}

		return selector;
	}

	/**
	 * setFlexieId - Assigns a unique Flexie ID to a DOM node if it doesn't already have one.
	 *               Also sets a data attribute on the node.
	 * @param {HTMLElement} node The DOM node to assign an ID to.
	 * @returns {void}
	 */
	function setFlexieId (node) {
		if (!node.FLX_DOM_ID) {
			FLX_DOM_ID = (FLX_DOM_ID + 1); // Increment the global ID counter.

			node.FLX_DOM_ID = FLX_DOM_ID; // Assign to the node's property.
			node.setAttribute(FLX_DOM_ATTR, node.FLX_DOM_ID); // Set the data attribute.
		}
	}

	/**
	 * buildSelectorTree - Parses a CSS string into an array of rule objects.
	 *                     Each rule object contains a selector and its properties.
	 * @param {string} text The CSS string to parse.
	 * @returns {Array<object>} An array of rule objects.
	 */
	function buildSelectorTree(text) {
		var rules = [], // Array to store parsed rules.
		ruletext,
		rule,
		match, // Regex match result.
		selector, // CSS selector string.
		proptext, // Raw properties string.
		splitprop, // Split property:value pair.
		properties; // Array of property objects.

		// Remove tabs and newlines for easier parsing.
		text = text.replace(WHITESPACE_CHARACTERS, EMPTY_STRING);

		// Normalize whitespace around curly braces and colons.
		text = text.replace(/\s?(\{|\:|\})\s?/g, PLACEHOLDER_STRING);

		// Split CSS into individual rules based on closing curly brace.
		ruletext = text.split(END_MUSTACHE);

		forEach(ruletext, function (i, text) {
			if (text) {
				rule = [text, END_MUSTACHE].join(EMPTY_STRING); // Reconstruct the full rule.

				// Use regex to extract selector and properties.
				match = (/(.*)\{(.*)\}/).exec(rule);

				if (match && match[2]) {
					selector = match[1]; // The selector part.
					proptext = match[2].split(";"); // Split properties by semicolon.
					properties = []; // Initialize properties array.

					forEach(proptext, function (i, x) {
						splitprop = x.split(":"); // Split each property:value.

						if (splitprop.length && splitprop[1]) {
							properties.push({
								property : splitprop[0], // Property name.
								value : splitprop[1] // Property value.
							});
						}
					});

					// Only push rule if both selector and properties are valid.
					if (selector && properties.length) {
						rules.push({
							selector : selector,
							properties : properties
						});
					}
				}
			}
		});

		return rules;
	}

	/**
	 * findFlexboxElements - Identifies CSS rules related to flexbox properties
	 *                       and categorizes them into flex containers and flex children.
	 * @param {Array<object>} rules An array of parsed CSS rule objects.
	 * @returns {object} An object containing arrays of identified flex boxes and possible flex children.
	 */
	function findFlexboxElements(rules) {
		var selectors, // Array of selectors if multiple are present.
		properties, // Array of properties for a given rule.
		property, // Individual property name.
		value, // Individual property value.
		shortProp, // Property name without "box-" prefix.
		selectorSplit = /\s?,\s?/, // Regex for splitting multiple selectors.
		createUniqueObject, // Helper function to create unique rule objects.
		addRules, // Helper function to add or merge rules.
		uniqueChildren = {}, // Object to store unique flex children rules.
		uniqueBoxes = {}; // Object to store unique flex container rules.

		/**
		 * createUniqueObject - Creates a structured object for a flex rule.
		 * @param {string} selector The CSS selector.
		 * @param {object} rules The original rule object.
		 * @param {string} prop Optional, specific flex property (e.g., "flex").
		 * @param {string} value Optional, value of the specific flex property.
		 * @returns {object} A new rule object.
		 */
		createUniqueObject = function (selector, rules, prop, value) {
			var unique = {
				selector : trim(selector),
				properties : []
			};

			forEach(rules.properties, function (i, prop) {
				unique.properties.push({
					property : trim(prop.property),
					value : trim(prop.value)
				});
			});

			if (prop && value) {
				unique[prop] = value; // Add the specific flex property.
			}

			return unique;
		};

		/**
		 * addRules - Adds or merges a flex rule into the uniqueBoxes or uniqueChildren objects.
		 * @param {string} selector The CSS selector.
		 * @param {object} rules The original rule object.
		 * @param {string} prop Optional, specific flex property (e.g., "flex").
		 * @param {string} value Optional, value of the specific flex property.
		 * @returns {void}
		 */
		addRules = function (selector, rules, prop, value) {
			var box = (prop && value) ? uniqueChildren[selector] : uniqueBoxes[selector],
			exists; // Flag to check if property already exists.

			if (box) {
				// If rule for this selector already exists, merge properties.
				forEach(rules.properties, function (i, rule) {
					exists = FALSE; // Reset exists flag for each new rule property.
					forEach(box.properties, function (j, x) {
						if (rule.property === x.property) {
							exists = j; // Found existing property, store its index.
							return false; // Break inner loop.
						}
					});

					if (exists !== FALSE) {
						box.properties[exists] = rule; // Update existing property.
					} else {
						box.properties.push(rule); // Add new property.
					}
				});

				if (prop && value) {
					box[prop] = value; // Add or update specific flex property.
				}
			} else {
				// If rule for this selector does not exist, create a new one.
				if (prop && value) {
					uniqueChildren[selector] = createUniqueObject(selector, rules, prop, value);
				} else {
					uniqueBoxes[selector] = createUniqueObject(selector, rules, NULL, NULL);
				}
			}
		};

		forEach(rules, function (i, rule) {
			// Handle multiple selectors separated by commas.
			selectors = trim(rule.selector).replace(selectorSplit, ",").split(selectorSplit);

			forEach(selectors, function (i, selector) {
				selector = trim(selector); // Trim each individual selector.
				properties = rule.properties; // Get properties for this rule.

				forEach(properties, function (i, prop) {
					property = trim(prop.property); // Trim property name.
					value = trim(prop.value); // Trim property value.

					if (property) {
						// Remove "box-" prefix to simplify switch statement.
						shortProp = property.replace("box-", EMPTY_STRING);

						switch (shortProp) {
						case "display" :
							if (value === "box") {
								// Found a flex container declaration.
								addRules(selector, rule, NULL, NULL);
							}
							break;

						case "orient" :
						case "align" :
						case "direction" :
						case "pack" :
							// Flex container properties.
							addRules(selector, rule, NULL, NULL);
							break;

						case "flex" :
						case "flex-group" :
						case "ordinal-group" :
							// Flex child properties.
							addRules(selector, rule, shortProp, value);
							break;
						}
					}
				});
			});
		});

		// Populate global FLEX_BOXES array from uniqueBoxes object.
		forEach(uniqueBoxes, function (key, box) {
			FLEX_BOXES.push(box);
		});

		// Populate global POSSIBLE_FLEX_CHILDREN array from uniqueChildren object.
		forEach(uniqueChildren, function (key, child) {
			POSSIBLE_FLEX_CHILDREN.push(child);
		});

		return {
			boxes : FLEX_BOXES,
			children : POSSIBLE_FLEX_CHILDREN
		};
	}

	/**
	 * matchFlexChildren - Finds actual DOM nodes that match the identified flex child rules
	 *                     and are direct children of a given parent flexbox.
	 * @param {HTMLElement} parent The parent flex container.
	 * @param {function} lib The DOM selection library function.
	 * @param {Array<object>} possibleChildren An array of possible flex child rule objects.
	 * @returns {Array<object>} An array of matched flex child objects with their corresponding DOM nodes.
	 */
	function matchFlexChildren(parent, lib, possibleChildren) {
		var caller, // Result of the selector library call.
		unique, // A copy of the child rule object for modification.
		matches = []; // Array to store matched flex children.

		forEach(possibleChildren, function (i, child) {
			if (child.selector) {
				// Use the provided library to select elements based on the child's selector.
				caller = lib(child.selector);
				// Ensure caller is an array (some libraries return single element directly).
				caller = caller[0] ? caller : [caller];

				if (caller[0]) {
					forEach(caller, function (i, node) {
						// Check if it's a valid DOM node.
						if (node.nodeName !== UNDEFINED) {
							switch (node.nodeName.toLowerCase()) {
							// Ignore script, style, and link elements.
							case "script" :
							case "style" :
							case "link" :
								break;

							default :
								// Only consider direct children of the specified parent.
								if (node.parentNode === parent) {
									// Assign a unique Flexie ID to the matched child node.
									setFlexieId(node);

									unique = {}; // Create a new object for this specific match.

									// Copy all properties from the original child rule.
									forEach(child, function (key) {
										unique[key] = child[key];
									});

									unique.match = node; // Add a reference to the actual DOM node.
									matches.push(unique); // Add to the list of matches.
								}
								break;
							}
						}
					});
				}
			} else {
				// This branch seems to handle cases where 'child' itself is a DOM node,
				// rather than a rule object with a selector. This might be for dynamically
				// added elements or specific internal use cases not fully shown here.
				setFlexieId(child); // Assign ID if it's a direct node.

				matches.push({
					match : child, // The node itself is the match.