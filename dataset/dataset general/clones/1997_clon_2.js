/*
File: layout.js

Details: Version
	1.0

Project: LayoutEngine

Overview:
	Provides compatibility for the CSS3 Flexible Box Model

License:
	The MIT License
	
	Copyright (c) 2010 Richard Herrera

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
Module: LayoutEngine
	Encapsulated within its own Global Namespace
*/

/*jslint evil: true, regexp: false, plusplus: false */
/*global window, document */

var LayoutEngine = (function (globalObj, documentObj) {
	
	// Expose public properties
	var LGT = {},
	
	    // Each layout-managed DOM element receives a unique sequential ID
	    LAYOUT_ITEM_COUNTER = 0,
	    LAYOUT_NODE_ID_ATTRIBUTE = "data-layout-node-id",
	    LAYOUT_PARENT_ATTRIBUTE = "data-layout-container",
	    
	    // Cache the detected flexbox feature support
	    FEATURE_SUPPORT,
	    
	    // Reference to the active selector mechanism
	    QUERY_ENGINE_REF,
	
	    SELECTOR_LIBS_DATA = {
			"NW" : {
				query : "*.Dom.select"
			},
			"DOMAssistant" : {
				query : "*.$",
				ready : "*.DOMReady"
			},
			"Prototype" : {
				query : "$$",
				ready : "document.observe",
				param : "dom:loaded",
				context : "document"
			},
			"YAHOO" : {
				query : "*.util.Selector.query",
				ready : "*.util.Event.onDOMReady",
				context : "*.util.Event"
			},
			"MooTools" : {
				query : "$$",
				ready : "window.addEvent",
				param : "domready"
			},
			"Sizzle" : {
				query : "*"
			},
			"jQuery" : {
				query : "*",
				ready : "*(document).ready"
			},
			"dojo" : {
				query : "*.query",
				ready : "*.addOnLoad"
			}
		},
	    
	    // Holds the reference to the chosen JavaScript library
	    ACTIVE_LIB_REF,
	    
	    // Regular Expression definitions
	    PIXEL_UNIT_REGEX = /^-?\d+(?:px)?$/i,
	    NUMERIC_VALUE_REGEX = /^-?\d/,
	    DIMENSION_PROPERTIES_REGEX = /width|height|margin|padding|border/,
	    MICROSOFT_IE_REGEX = /(msie) ([\w.]+)/,
	    BLANK_SPACE_CHARS_REGEX = /\t|\n|\r/g,
	    MAX_CONSTRAINT_PROPS_REGEX = /^max\-([a-z]+)/,
	    WEB_PROTOCOL_REGEX = /^https?:\/\//i,
	    START_TRIM_REGEX = /^\s\s*/,
	    END_TRIM_REGEX = /\s\s*$/,
	    JUST_WHITESPACE_REGEX = /^\s*$/,
	    CSS_QUERY_PATTERN = /\s?(\#|\.|\[|\:(\:)?[^first\-(line|letter)|before|after]+)/g,
		
	    // String literals for common use
	    BLANK_TEXT = "",
	    SINGLE_SPACE_TEXT = " ",
	    CAPTURE_GROUP_ONE = "$1",
	    PAD_RIGHT_KEY = "paddingRight",
	    PAD_BOTTOM_KEY = "paddingBottom",
	    PAD_LEFT_KEY = "paddingLeft",
	    PAD_TOP_KEY = "paddingTop",
	    BORDER_RIGHT_WIDTH_KEY = "borderRightWidth",
	    BORDER_BOTTOM_WIDTH_KEY = "borderBottomWidth",
	    BORDER_LEFT_WIDTH_KEY = "borderLeftWidth",
	    BORDER_TOP_WIDTH_KEY = "borderTopWidth",
	    LAYOUT_DIRECTION_HORIZ = "horizontal",
	    LAYOUT_DIRECTION_VERT = "vertical",
	    INLINE_ORIENTATION = "inline-axis",
	    BLOCK_ORIENTATION = "block-axis",
	    INHERIT_VALUE = "inherit",
	    LEFT_ALIGNMENT = "left",
		
	    CLOSING_BRACE_CHAR = "}",
		
	    VENDOR_PREFIX_ARRAY = " -o- -moz- -ms- -webkit- -khtml- ".split(SINGLE_SPACE_TEXT),
		
	    DEFAULT_LAYOUT_SETTINGS = {
			orient : LAYOUT_DIRECTION_HORIZ,
			align : "stretch",
			direction : INHERIT_VALUE,
			pack : "start"
	    },
	    
	    // Global storage for identified layout elements
	    LAYOUT_CONTAINERS = [],
	    POTENTIAL_LAYOUT_ITEMS = [],
	    DOCUMENT_ORDERED_FLAG,
	    
	    WINDOW_RESIZE_HANDLER,
	    
	    // Constants for minification
	    TRUE = true,
	    FALSE = false,
	    NULL = null,
	    UNDEFINED,
	    
	    // Browser version check for Internet Explorer
	    CLIENT_BROWSER_INFO = {
			IE : (function () {
				var ieVersion, userAgentString = globalObj.navigator.userAgent,
				    matchResult = (MICROSOFT_IE_REGEX).exec(userAgentString.toLowerCase());
			
				if (matchResult) {
					ieVersion = parseInt(matchResult[2], 10);
				}
			
				return ieVersion;
			}())
	    },
	    
	    /*
	    selectivizr v1.0.0 - (c) Keith Clark, freely distributable under the terms 
	    of the MIT license.
        
	    selectivizr.com
	    */
	    CSS_POLYFILL_TOOL;
	
	function removeWhitespace (inputString) {
		if (inputString) {
			inputString = inputString.replace(START_TRIM_REGEX, BLANK_TEXT).replace(END_TRIM_REGEX, BLANK_TEXT);
		}
		
		return inputString;
	}
	
	// Adapted from jQuery 1.4.3
	// http://github.com/jquery/jquery/blob/master/src/core.js#L593
	function iterateOverCollection(targetCollection, iterationCallback) {
		var propName, idx = 0, currentVal,
			collectionLength = targetCollection ? targetCollection.length : UNDEFINED,
			isPlainObject = collectionLength === UNDEFINED;

		if (isPlainObject) {
			for (propName in targetCollection) {
				if (targetCollection.hasOwnProperty(propName)) {
					if (iterationCallback.call(targetCollection[propName], propName, targetCollection[propName]) === FALSE) {
						break;
					}
				}
			}
		} else {
			for (currentVal = targetCollection[0]; idx < collectionLength && iterationCallback.call(currentVal, idx, currentVal) !== FALSE; currentVal = targetCollection[++idx]) {
				continue;
			}
		}
	}
	
	// --[ identifyQueryMethod() ]--------------------------------------
	// Iterates through predefined selector engines to find a suitable one.
	
	// Moved outside CSS_POLYFILL_TOOL scope as detection is required before running CSS_POLYFILL_TOOL
	function identifyQueryMethod() {
		// Compatible selector engines ordered by CSS3 support level
		var availableTools = SELECTOR_LIBS_DATA, foundMethod;
		
		iterateOverCollection(availableTools, function (toolName, toolConfig) {
			if (globalObj[toolName] && !foundMethod) {
				foundMethod = eval(toolConfig.query.replace("*", toolName));
				
				if (foundMethod) {
					QUERY_ENGINE_REF = toolName;
					return false; // Break out of iteration
				}
			}
		});
		
		return foundMethod;
	}
	
	// Event registration for onload/onresize events
	function registerWindowEventHandler(eventType, eventHandler) {
		eventType = "on" + eventType;
		var previousHandler = globalObj[eventType];

		if (typeof globalObj[eventType] !== "function") {
			globalObj[eventType] = eventHandler;
		} else {
			globalObj[eventType] = function () {
				if (previousHandler) {
					previousHandler();
				}
				eventHandler();
			};
		}
	}
	
	function hookDocumentReady(handlerFunction) {
		if (!QUERY_ENGINE_REF) {
			ACTIVE_LIB_REF = identifyQueryMethod();
		}
		
		// Compatible selector engines, ordered by CSS3 support
		var availableTools = SELECTOR_LIBS_DATA,
		    foundMethod, invocationContext, argumentList;
		
		iterateOverCollection(availableTools, function (toolName, toolConfig) {
			if (globalObj[toolName] && !foundMethod && toolConfig.ready) {
				foundMethod = eval(toolConfig.ready.replace("*", toolName));
				invocationContext = toolConfig.context ? eval(toolConfig.context.replace("*", toolName)) : globalObj;
				argumentList = [];
				
				if (foundMethod && invocationContext) {
					if (toolConfig.param) {
						argumentList.push(toolConfig.param);
					}
					argumentList.push(handlerFunction);
					foundMethod.apply(invocationContext, argumentList);
					return false; // Stop iteration
				}
			}
		});
		
		if (!foundMethod) {
			registerWindowEventHandler("load", handlerFunction);
		}
	}
	
	function composeElementSelector(domNode) {
		var elementSelector = domNode.nodeName.toLowerCase();
		
		if (domNode.id) {
			elementSelector += "#" + domNode.id;
		} else if (domNode.LAYOUT_ITEM_COUNTER) {
			elementSelector += "[" + LAYOUT_NODE_ID_ATTRIBUTE + "='" + domNode.LAYOUT_ITEM_COUNTER + "']";
		}
		
		return elementSelector;
	}
	
	function assignLayoutNodeIdentifier(domNode) {
		if (!domNode.LAYOUT_ITEM_COUNTER) {
			LAYOUT_ITEM_COUNTER = (LAYOUT_ITEM_COUNTER + 1);
			
			domNode.LAYOUT_ITEM_COUNTER = LAYOUT_ITEM_COUNTER;
			domNode.setAttribute(LAYOUT_NODE_ID_ATTRIBUTE, domNode.LAYOUT_ITEM_COUNTER);
		}
	}
	
	function parseCssRulesText(cssTextContent) {
		var cssRulesList = [], ruleBlockText, singleRule,
		    regexMatch, ruleSelector, propertyText, propertyParts, ruleProperties;
		
		// Remove tabs and carriage returns
		cssTextContent = cssTextContent.replace(BLANK_SPACE_CHARS_REGEX, BLANK_TEXT);
		
		// Normalize whitespace around structural characters
		cssTextContent = cssTextContent.replace(/\s?(\{|\:|\})\s?/g, CAPTURE_GROUP_ONE);
		
		ruleBlockText = cssTextContent.split(CLOSING_BRACE_CHAR);
		
		iterateOverCollection(ruleBlockText, function (idx, currentText) {
			if (currentText) {
				singleRule = [currentText, CLOSING_BRACE_CHAR].join(BLANK_TEXT);
				
				regexMatch = (/(.*)\{(.*)\}/).exec(singleRule);
				
				if (regexMatch && regexMatch[2]) {
					ruleSelector = regexMatch[1];
					propertyText = regexMatch[2].split(";");
					ruleProperties = [];
					
					iterateOverCollection(propertyText, function (idx, propertyEntry) {
						propertyParts = propertyEntry.split(":");
						
						if (propertyParts.length && propertyParts[1]) {
							ruleProperties.push({
								property : propertyParts[0],
								value : propertyParts[1]
							});
						}
					});
					
					if (ruleSelector && ruleProperties.length) {
						cssRulesList.push({
							selector : ruleSelector,
							properties : ruleProperties
						});
					}
				}
			}
		});
		
		return cssRulesList;
	}
	
	function discoverLayoutElements(cssRulesList) {
		var selectorStrings, ruleProps,
		    currentProp, propValue, shortPropertyName,
		    selectorDelimiter = /\s?,\s?/,
		    createUniqueEntry, addPropertyRules,
		    childPropertyMap = {}, containerPropertyMap = {};
		
		createUniqueEntry = function (entrySelector, entryRules, addedProp, addedValue) {
			var uniqueElement = {
				selector : removeWhitespace(entrySelector),
				properties : []
			};

			iterateOverCollection(entryRules.properties, function (idx, ruleProperty) {
				uniqueElement.properties.push({
					property : removeWhitespace(ruleProperty.property),
					value : removeWhitespace(ruleProperty.value)
				});
			});
			
			if (addedProp && addedValue) {
				uniqueElement[addedProp] = addedValue;
			}
			
			return uniqueElement;
		};
		
		addPropertyRules = function (entrySelector, entryRules, addedProp, addedValue) {
			var boxEntry = (addedProp && addedValue) ? childPropertyMap[entrySelector] : containerPropertyMap[entrySelector],
			    existsInBox;
			
			if (boxEntry) {
				iterateOverCollection(entryRules.properties, function (idx, newRule) {
					iterateOverCollection(boxEntry.properties, function (jdx, existingRule) {
						if (newRule.property === existingRule.property) {
							existsInBox = jdx;
							return false; // Break inner loop
						}
					});
					
					if (existsInBox !== UNDEFINED) { // Check if it was found
						boxEntry.properties[existsInBox] = newRule;
					} else {
						boxEntry.properties.push(newRule);
					}
				});
				
				if (addedProp && addedValue) {
					boxEntry[addedProp] = addedValue;
				}
			} else {
				if (addedProp && addedValue) {
					childPropertyMap[entrySelector] = createUniqueEntry(entrySelector, entryRules, addedProp, addedValue);
				} else {
					containerPropertyMap[entrySelector] = createUniqueEntry(entrySelector, entryRules, NULL, NULL);
				}
			}
		};
		
		iterateOverCollection(cssRulesList, function (idx, ruleItem) {
			selectorStrings = removeWhitespace(ruleItem.selector).replace(selectorDelimiter, ",").split(selectorDelimiter);
			
			iterateOverCollection(selectorStrings, function (idx, currentSelector) {
				currentSelector = removeWhitespace(currentSelector);
				ruleProps = ruleItem.properties;

				iterateOverCollection(ruleProps, function (idx, propObject) {
					currentProp = removeWhitespace(propObject.property);
					propValue = removeWhitespace(propObject.value);

					if (currentProp) {
						shortPropertyName = currentProp.replace("box-", BLANK_TEXT);

						switch (shortPropertyName) {
						case "display" :
							if (propValue === "box") {
								addPropertyRules(currentSelector, ruleItem, NULL, NULL);
							}
							break;

						case "orient" :
						case "align" :
						case "direction" :
						case "pack" :
							addPropertyRules(currentSelector, ruleItem, NULL, NULL);
							break;

						case "flex" :
						case "flex-group" :
						case "ordinal-group" :
							addPropertyRules(currentSelector, ruleItem, shortPropertyName, propValue);
							break;
						}
					}
				});
			});
		});
		
		iterateOverCollection(containerPropertyMap, function (key, boxData) {
			LAYOUT_CONTAINERS.push(boxData);
		});
		
		iterateOverCollection(childPropertyMap, function (key, childData) {
			POTENTIAL_LAYOUT_ITEMS.push(childData);
		});
		
		return {
			boxes : LAYOUT_CONTAINERS,
			children : POTENTIAL_LAYOUT_ITEMS
		};
	}
	
	function locateLayoutChildren(parentNode, selectorLib, potentialChildNodes) {
		var invocationContext, uniqueItem, matchedItems = [];
		
		iterateOverCollection(potentialChildNodes, function (idx, childConfig) {
			if (childConfig.selector) {
				invocationContext = selectorLib(childConfig.selector);
				invocationContext = invocationContext[0] ? invocationContext : [invocationContext]; // Ensure array-like

				if (invocationContext[0]) {
					iterateOverCollection(invocationContext, function (idx, domNode) {
						if (domNode.nodeName !== UNDEFINED) {
							switch (domNode.nodeName.toLowerCase()) {
							case "script" :
							case "style" :
							case "link" :
								break;

							default :
								if (domNode.parentNode === parentNode) {
									// Mark each unique node with LAYOUT_ITEM_COUNTER
									assignLayoutNodeIdentifier(domNode);

									uniqueItem = {};

									iterateOverCollection(childConfig, function (key) {
										uniqueItem[key] = childConfig[key];
									});

									uniqueItem.match = domNode;
									matchedItems.push(uniqueItem);
								}
								break;
							}
						}
					});
				}
			} else {
				// Mark each unique node with LAYOUT_ITEM_COUNTER
				assignLayoutNodeIdentifier(childConfig);
				
				matchedItems.push({
					match : childConfig,