/*
File: layout-flexer.js

Overview: Release
	1.1.0

Module: BoxLayoutEngine

Purpose:
	Provides compatibility for the CSS3 Flexible Box Layout Module in older browsers.

License Information:
	The MIT License
	
	Copyright (c) 2010 Richard Herrera (original author)
	Copyright (c) 2024 Clone Generator (modifications)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/*
Class: BoxLayoutEngine
	Encapsulated within its global namespace.
*/

/*jslint evil: true, regexp: false, plusplus: false */
/*global window, document */

var BoxLayoutEngine = (function (globalWindow, documentRef) {
	"use strict"; // Enforce stricter parsing and error handling.

	// Ensure basic DOM elements are present before proceeding.
	if (!documentRef || !documentRef.body) {
		return {};
	}
	
	// Internal scope for public properties
	var BX_NS = {};
	
	// A numerical counter for unique DOM element identification
	var currentUniqueId = 0;
	// Attribute name for storing unique IDs on DOM elements
	var BX_UID_PROP = "data-bx-unique-id";
	// Custom property name for associating a unique ID with a DOM element
	var BX_UID_PROP_KEY = "bxUniqueNodeId";
	// Attribute name for parent relationships (not used in this snippet, but kept for consistency)
	var BX_PARENT_REL = "data-bx-parent-ref";
	
	// Flag to indicate flexbox support in the browser
	var BOX_SUPPORT_FLAG;
	
	// Name of the detected selector engine (e.g., "jQuery", "MooTools")
	var SELECTOR_LIB_NAME;
	
	// Configuration for various compatible selector libraries
	var COMPAT_SELECTORS = {
		"NW" : {
			queryMethod : "*.Dom.select"
		},
		"DOMAssistant" : {
			queryMethod : "*.$",
			readyMethod : "*.DOMReady"
		},
		"Prototype" : {
			queryMethod : "$$",
			readyMethod : "document.observe",
			readyEventParam : "dom:loaded",
			readyContext : "document"
		},
		"YAHOO" : {
			queryMethod : "*.util.Selector.query",
			readyMethod : "*.util.Event.onDOMReady",
			readyContext : "*.util.Event"
		},
		"MooTools" : {
			queryMethod : "$$",
			readyMethod : "window.addEvent",
			readyEventParam : "domready"
		},
		"Sizzle" : {
			queryMethod : "*"
		},
		"jQuery" : {
			queryMethod : "*",
			readyMethod : "*(document).ready"
		},
		"dojo" : {
			queryMethod : "*.query",
			readyMethod : "*.addOnLoad"
		}
	};
	
	// Reference to the active selector function (e.g., jQuery's `$` or `$$`)
	var ACTIVE_SELECTOR_FN;
	
	// Regular expressions for parsing and validation
	var PX_UNIT_RE = /^-?\d+(?:px)?$/i;
	var NUMERIC_VAL_RE = /^-?\d/;
	var DIMENSION_PROPS_RE = /width|height|margin|padding|border/;
	var MS_BROWSER_RE = /(msie) ([\w.]+)/;
	var WHITESPACE_COMPACT_RE = /\s*(\{|\:|\})\s*/g; // For compacting CSS rules
	var RESTRICTIVE_CSS_RE = /^max\-([a-z]+)/;
	var PROTOCOL_RE = /^https?:\/\//i;
	var START_TRIM_RE = /^\s\s*/;
	var END_TRIM_RE = /\s\s*$/;
	var ONLY_WHITESPACE_RE = /^\s*$/;
	var COMPLEX_SELECTOR_CHECK_RE = /\s?(\#|\.|\[|\:(\:)?[^first\-(line|letter)|before|after]+)/g; // Simplified
		
	// String constants for efficiency and readability
	var EMPTY_STR = "";
	var SINGLE_SPACE_STR = " ";
	var PLACEHHOLDER_STR_1 = "$1";
	var PADDING_R_KEY = "paddingRight";
	var PADDING_B_KEY = "paddingBottom";
	var PADDING_L_KEY = "paddingLeft";
	var PADDING_T_KEY = "paddingTop";
	var BORDER_R_KEY = "borderRightWidth";
	var BORDER_B_KEY = "borderBottomWidth";
	var BORDER_L_KEY = "borderLeftWidth";
	var BORDER_T_KEY = "borderTopWidth";
	var ORIENT_HORIZ = "horizontal";
	var ORIENT_VERT = "vertical";
	var INLINE_AXIS_VAL = "inline-axis";
	var BLOCK_AXIS_VAL = "block-axis";
	var INHERIT_VAL = "inherit";
	var ALIGN_LEFT_VAL = "left";
	
	var CSS_RULE_END = "}";
		
	var VENDOR_PREFIXES = " -o- -moz- -ms- -webkit- -khtml- ".split(SINGLE_SPACE_STR);
		
	var FLEX_DEFAULTS = {
		orient : ORIENT_HORIZ,
		align : "stretch",
		direction : INHERIT_VAL,
		pack : "start"
	};
	
	// Global reference collections
	var MANAGED_FLEX_CONTAINERS = [];
	var POTENTIAL_FLEX_ITEMS = [];
	var ORDERED_NODES_CACHE; // Not used in this snippet, but declared
	
	var WINDOW_RESIZE_HANDLER; // Not used in this snippet, but declared
	
	// Minification friendly boolean and null values
	var IS_TRUE = !0;
	var IS_FALSE = !1;
	var NO_VALUE = null; // Using null explicitly
	var NOT_DEFINED_YET; // `undefined` is a global property, not a keyword
	
	// Browser detection utility
	var CLIENT_ENV = {
		IE_VERSION : (function () {
			var ieVersion, userAgent = globalWindow.navigator.userAgent,
			    match = (MS_BROWSER_RE).exec(userAgent.toLowerCase());
		
			if (match && match.length > 2) {
				ieVersion = parseInt(match[2], 10);
			} else if (documentRef.documentMode) { // IE 8, 9, 10, 11+ compatibility modes
				ieVersion = documentRef.documentMode;
			}
			return ieVersion;
		}())
	};
	
	/*
	selectivizr v1.0.0 - (c) Keith Clark, freely distributable under the terms 
	of the MIT license.
	
	selectivizr.com
	*/
	var CSS3_POLYFILL_UTIL; // External utility, not defined here.
	
	/**
	 * Cleans leading and trailing whitespace from a string.
	 * @param {string} inputString - The string to trim.
	 * @returns {string} The trimmed string.
	 */
	function normalizeWhitespace(inputString) {
		if (typeof inputString === 'string' && inputString.length > 0) {
			// Leverage native trim if available, otherwise use regex.
			return inputString.trim ? inputString.trim() : inputString.replace(START_TRIM_RE, EMPTY_STR).replace(END_TRIM_RE, EMPTY_STR);
		}
		return inputString || EMPTY_STR; // Handle null/undefined input gracefully.
	}
	
	/**
	 * Iterates over an object or array, executing a callback for each item.
	 * @param {object|Array} collection - The collection to iterate.
	 * @param {Function} actionFn - The callback function. Signature: `function(keyOrIndex, value)`
	 * @returns {void}
	 */
	function processItems(collection, actionFn) {
		var currentItem,
			idx = 0,
			totalLength = collection ? collection.length : NOT_DEFINED_YET,
			isObject = (totalLength === NOT_DEFINED_YET || typeof collection === 'function'); // Check for function as well as object
	
		if (isObject) {
			for (var propName in collection) {
				// Ensure it's an own property to avoid iterating prototype chain.
				if (Object.prototype.hasOwnProperty.call(collection, propName)) {
					// If callback returns IS_FALSE, stop iteration.
					if (actionFn.call(collection[propName], propName, collection[propName]) === IS_FALSE) {
						break;
					}
				}
			}
		} else {
			// Iterate arrays or array-like objects.
			while (idx < totalLength) {
				currentItem = collection[idx];
				// If callback returns IS_FALSE, stop iteration.
				if (actionFn.call(currentItem, idx, currentItem) === IS_FALSE) {
					break;
				}
				idx++;
			}
		}
	}
	
	// --[ identifySelectorEngine() ]--------------------------------------
	// Iterates through known selector libraries to find a compatible one.
	// This function is moved outside the selectivizr scope for earlier detection.
	function identifySelectorEngine() {
		var enginesList = COMPAT_SELECTORS,
			detectedMethod;
		
		processItems(enginesList, function (engineKey, engineConfig) {
			// Check if the global window object has the library.
			if (globalWindow[engineKey] && !detectedMethod) {
				// Dynamically evaluate the selector method string.
				try {
					detectedMethod = eval(engineConfig.queryMethod.replace("*", engineKey));
				} catch (e) {
					// Evaluation failed, method not found or invalid.
					detectedMethod = NOT_DEFINED_YET;
				}
				
				if (detectedMethod) {
					SELECTOR_LIB_NAME = engineKey; // Store the name of the found engine.
					return IS_FALSE; // Stop iteration.
				}
			}
		});
		
		return detectedMethod;
	}
	
	/**
	 * Attaches an event handler to the window object using legacy `on` properties.
	 * @param {string} eventType - The event type (e.g., "load", "resize").
	 * @param {Function} handlerFn - The function to execute.
	 * @returns {void}
	 */
	function attachLegacyEvent(eventType, handlerFn) {
		var prefixedType = "on" + eventType;
		var existingHandler = globalWindow[prefixedType];
	
		if (typeof globalWindow[prefixedType] !== "function") {
			globalWindow[prefixedType] = handlerFn;
		} else {
			// Chain multiple handlers for the same event.
			globalWindow[prefixedType] = function () {
				if (typeof existingHandler === "function") {
					existingHandler.call(globalWindow);
				}
				handlerFn.call(globalWindow);
			};
		}
	}
	
	/**
	 * Registers a handler to be executed when the DOM is ready or on window load.
	 * Attempts to use known selector library DOM ready methods first.
	 * @param {Function} readyHandler - The function to call when the DOM is ready.
	 * @returns {void}
	 */
	function registerDomReadyHandler(readyHandler) {
		// If no selector engine has been identified yet, attempt to find one.
		if (!SELECTOR_LIB_NAME) {
			ACTIVE_SELECTOR_FN = identifySelectorEngine();
		}
		
		var enginesList = COMPAT_SELECTORS,
		    methodToCall,
		    methodContext,
		    methodArguments;
		
		var handlerRegistered = IS_FALSE;

		processItems(enginesList, function (engineKey, engineConfig) {
			// Only proceed if an engine's ready method is defined and not already handled.
			if (globalWindow[engineKey] && engineConfig.readyMethod && !handlerRegistered) {
				try {
					methodToCall = eval(engineConfig.readyMethod.replace("*", engineKey));
					methodContext = engineConfig.readyContext ? eval(engineConfig.readyContext.replace("*", engineKey)) : globalWindow;
				} catch (e) {
					methodToCall = NOT_DEFINED_YET;
					methodContext = NOT_DEFINED_YET;
				}
				
				if (methodToCall && methodContext) {
					methodArguments = [];
					if (engineConfig.readyEventParam) {
						methodArguments.push(engineConfig.readyEventParam);
					}
					methodArguments.push(readyHandler);
					
					methodToCall.apply(methodContext, methodArguments);
					handlerRegistered = IS_TRUE; // Mark as handled.
					return IS_FALSE; // Stop iteration.
				}
			}
		});
		
		// If no specific DOM ready method was found, fallback to window.onload.
		if (!handlerRegistered) {
			attachLegacyEvent("load", readyHandler);
		}
	}
	
	/**
	 * Generates a unique CSS selector for a given DOM node.
	 * Prioritizes ID, then a custom unique ID attribute.
	 * @param {HTMLElement} nodeElement - The DOM element.
	 * @returns {string} The CSS selector string.
	 */
	function generateNodeSelector(nodeElement) {
		var selectorParts = [nodeElement.nodeName.toLowerCase()];
		
		if (nodeElement.id && nodeElement.id.length > 0) {
			selectorParts.push("#" + nodeElement.id);
		} else if (nodeElement[BX_UID_PROP_KEY]) {
			// Use the custom unique ID if no native ID is present.
			selectorParts.push("[" + BX_UID_PROP + "='" + nodeElement[BX_UID_PROP_KEY] + "']");
		}
		
		return selectorParts.join(EMPTY_STR);
	}
	
	/**
	 * Assigns a unique internal ID to a DOM node if it doesn't already have one.
	 * Also sets a `data-` attribute for external identification.
	 * @param {HTMLElement} targetNode - The DOM element to assign an ID to.
	 * @returns {void}
	 */
	function assignUniqueNodeId(targetNode) {
		if (targetNode && targetNode.nodeType === 1 && !targetNode[BX_UID_PROP_KEY]) {
			currentUniqueId = (currentUniqueId + 1); // Increment the global counter.
			
			targetNode[BX_UID_PROP_KEY] = currentUniqueId;
			targetNode.setAttribute(BX_UID_PROP, targetNode[BX_UID_PROP_KEY]);
		}
	}
	
	/**
	 * Parses a string of CSS rules into a structured array of objects.
	 * @param {string} cssTextContent - The raw CSS string.
	 * @returns {Array<object>} An array of rule objects, each with 'selector' and 'properties'.
	 */
	function parseCssRuleset(cssTextContent) {
		var parsedRules = [],
		    currentRuleBlock,
		    matchResult,
		    selectorPart,
		    propertiesRaw,
		    splitProperties;
		
		// 1. Remove all significant whitespace (tabs, newlines, carriage returns).
		var cleanedCss = cssTextContent.replace(/[\t\n\r]/g, EMPTY_STR);
		
		// 2. Compact whitespace around structural CSS characters for easier parsing.
		cleanedCss = cleanedCss.replace(WHITESPACE_COMPACT_RE, PLACEHHOLDER_STR_1);
		
		// 3. Split the entire CSS string into individual rule blocks based on the closing brace.
		var ruleBlocks = cleanedCss.split(CSS_RULE_END);
		
		processItems(ruleBlocks, function (index, blockText) {
			if (!blockText || ONLY_WHITESPACE_RE.test(blockText)) {
				return; // Skip empty or whitespace-only blocks.
			}
			
			currentRuleBlock = [blockText, CSS_RULE_END].join(EMPTY_STR); // Re-add the brace for regex matching.
			
			// Use regex to extract selector and declarations.
			matchResult = (/(.*)\{(.*)\}/).exec(currentRuleBlock);
			
			if (matchResult && matchResult.length >= 3 && matchResult[2].length > 0) {
				selectorPart = normalizeWhitespace(matchResult[1]);
				propertiesRaw = matchResult[2].split(";");
				splitProperties = [];
				
				processItems(propertiesRaw, function (propIndex, propString) {
					var colonIndex = propString.indexOf(":");
					if (colonIndex > 0) { // Ensure a colon exists and is not at the very beginning.
						splitProperties.push({
							property : normalizeWhitespace(propString.substring(0, colonIndex)),
							value : normalizeWhitespace(propString.substring(colonIndex + 1))
						});
					}
				});
				
				if (selectorPart.length > 0 && splitProperties.length > 0) {
					parsedRules.push({
						selector : selectorPart,
						properties : splitProperties
					});
				}
			}
		});
		
		return parsedRules;
	}
	
	/**
	 * Identifies flexbox containers and their potential children from parsed CSS rules.
	 * Populates global lists `MANAGED_FLEX_CONTAINERS` and `POTENTIAL_FLEX_ITEMS`.
	 * @param {Array<object>} cssRules - An array of CSS rule objects.
	 * @returns {object} An object containing the populated `boxes` and `children` arrays.
	 */
	function extractFlexDeclarations(cssRules) {
		var currentSelectors,
		    currentProperties,
		    propName,
		    propValue,
		    shortenedPropName,
		    selectorSplitter = /\s?,\s?/, // Regex to split multiple selectors
		    uniqueChildrenMap = {}, // Use maps to prevent duplicate entries
		    uniqueBoxesMap = {};
		
		// Helper to create a standardized rule object.
		var createRuleObject = function (nodeSelector, originalRules, specificProp, specificValue) {
			var newRule = {
				selector : normalizeWhitespace(nodeSelector),
				properties : []
			};
			// Deep copy properties from original rules.
			processItems(originalRules.properties, function (idx, propEntry) {
				newRule.properties.push({
					property : normalizeWhitespace(propEntry.property),
					value : normalizeWhitespace(propEntry.value)
				});
			});
			
			// Add any specific flex property that triggered this rule extraction.
			if (specificProp && specificValue) {
				newRule[specificProp] = specificValue;
			}
			
			return newRule;
		};
		
		// Helper to add or update rules in the maps.
		var updateRuleMap = function (selectorKey, ruleData, triggerProp, triggerValue) {
			var targetMap = (triggerProp && triggerValue) ? uniqueChildrenMap : uniqueBoxesMap;
			var existingEntry = targetMap[selectorKey];
			
			if (existingEntry) {
				// Merge new properties into existing entry.
				processItems(ruleData.properties, function (idx, newProp) {
					var propExists = IS_FALSE;
					processItems(existingEntry.properties, function (jdx, existingProp) {
						if (newProp.property === existingProp.property) {
							existingEntry.properties[jdx] = newProp; // Update existing property.
							propExists = IS_TRUE;
							return IS_FALSE; // Stop inner loop.
						}
					});
					if (!propExists) {
						existingEntry.properties.push(newProp); // Add new property.
					}
				});
				// Update specific trigger property if present.
				if (triggerProp && triggerValue) {
					existingEntry[triggerProp] = triggerValue;
				}
			} else {
				// Create a new entry if none exists.
				targetMap[selectorKey] = createRuleObject(selectorKey, ruleData, triggerProp, triggerValue);
			}
		};
		
		processItems(cssRules, function (idx, ruleEntry) {
			// Split selectors like "div, span" into individual parts.
			currentSelectors = normalizeWhitespace(ruleEntry.selector).split(selectorSplitter);
			currentProperties = ruleEntry.properties;

			processItems(currentSelectors, function (selIdx, currentSelector) {
				currentSelector = normalizeWhitespace(currentSelector);
				if (currentSelector.length === 0) {
					return; // Skip empty selectors.
				}

				processItems(currentProperties, function (propIdx, propEntry) {
					propName = normalizeWhitespace(propEntry.property);
					propValue = normalizeWhitespace(propEntry.value);

					if (propName.length > 0 && propValue.length > 0) {
						// Remove vendor prefixes and "box-" prefix for comparison.
						shortenedPropName = propName.replace(/^(?:-webkit-|-moz-|-ms-|-o-|-khtml-)?box-/, EMPTY_STR);

						// Check for flexbox related properties.
						if (propName === "display" && propValue === "box") {
							updateRuleMap(currentSelector, ruleEntry, NO_VALUE, NO_VALUE);
						} else if (shortenedPropName === "orient" ||
						           shortenedPropName === "align" ||
						           shortenedPropName === "direction" ||
						           shortenedPropName === "pack") {
							updateRuleMap(currentSelector, ruleEntry, NO_VALUE, NO_VALUE);
						} else if (shortenedPropName === "flex" ||
						           shortenedPropName === "flex-group" ||
						           shortenedPropName === "ordinal-group") {
							updateRuleMap(currentSelector, ruleEntry, shortenedPropName, propValue);
						}
					}
				});
			});
		});
		
		// Convert maps to arrays for the global storage.
		processItems(uniqueBoxesMap, function (key, boxRule) {
			MANAGED_FLEX_CONTAINERS.push(boxRule);
		});
		
		processItems(uniqueChildrenMap, function (key, childRule) {
			POTENTIAL_FLEX_ITEMS.push(childRule);
		});
		
		return {
			boxes : MANAGED_FLEX_CONTAINERS,
			children : POTENTIAL_FLEX_ITEMS
		};
	}
	
	/**
	 * Discovers and associates flex children with their parent flex containers.
	 * @param {HTMLElement} parentContainer - The parent DOM element (flex container).
	 * @param {Function} selectorFunction - The selector engine's query function.
	 * @param {Array<object>} potentialChildrenRules - Rules extracted for potential flex items.
	 * @returns {Array<object>} An array of matched child objects, each containing its rule and the DOM node.
	 */
	function discoverFlexChildren(parentContainer, selectorFunction, potentialChildrenRules) {
		var queryResults,
		    matchingChildren = [];
		
		if (!parentContainer || !selectorFunction || !potentialChildrenRules) {
			return matchingChildren; // Return empty if inputs are invalid.
		}

		processItems(potentialChildrenRules, function (idx, childRule) {
			if (childRule.selector && childRule.selector.length > 0) {
				queryResults = selectorFunction(childRule.selector);
				// Ensure queryResults is an array, even if only one element is returned.
				if (!Array.isArray(queryResults) && queryResults) {
					queryResults = [queryResults];
				} else if (!queryResults) {
					queryResults = [];
				}

				processItems(queryResults, function (nodeIdx, foundNode) {
					// Ensure we're dealing with an actual element node.
					if (foundNode && foundNode.nodeType === 1) {
						switch (foundNode.nodeName.toLowerCase()) {
						case "script" :
						case "style" :
						case "link" :
							return; // Skip non-visual or non-structural elements.

						default :
							// Check if the found node is a direct child of the parentContainer.
							if (foundNode.parentNode === parentContainer) {
								assignUniqueNodeId(foundNode); // Assign a unique ID if needed.

								var matchedChildObj = {};
								// Copy all properties from the childRule to the new object.
								processItems(childRule, function (key, value) {
									matchedChildObj[key] = value;
								});
								matchedChildObj.matchedNode = foundNode; // Add reference to the actual DOM node.
								matchingChildren.push(matchedChildObj);
							}
							break;
						}
					}
				});
			} else if (childRule.matchedNode) {
				// Case where the child itself is passed as a rule with a pre-matched node.
				assignUniqueNodeId(childRule.matchedNode);
				matchingChildren.push(childRule);
			}
		});
		
		return matchingChildren;
	}
	
	// Expose public API (currently empty as the original snippet ends here)
	BX_NS.init = function() {
		// Placeholder for actual initialization logic
	};
	
	return BX_NS;
	
}(window, document));