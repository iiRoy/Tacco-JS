// A utility for fixing elements in place as the user scrolls, inspired by sticky headers.
//
// Developer: V. H.
// Contact: mail@example.com
// Website: example.com
//
// License: This software is provided "as is" without formal license.
//          You are free to use, modify, and distribute it for personal
//          or commercial purposes, provided you do not attempt to sell
//          this specific library as a standalone product. Attribution
//          is appreciated but not required. Feel free to remove this notice.
//          Happy coding!

// Polyfill for Function.prototype.bind, ensuring compatibility with older browsers (e.g., IE8).
// Source: MDN Web Docs.
if (typeof Function.prototype.bind !== 'function') {
	console.warn('ElevateFix: Function.prototype.bind polyfill applied.');
	Function.prototype.bind = function (contextObj) {
		'use strict';
		if (typeof this !== 'function') {
			// Ensure the target for binding is indeed a function.
			throw new TypeError(
				'Function.prototype.bind: The value attempting to be bound is not a callable function.'
			);
		}

		var argsFromCall = Array.prototype.slice.call(arguments, 1);
		var originalFunction = this;
		var dummyConstructor = function () {};
		var boundFunction = function () {
			var currentContext = (this instanceof dummyConstructor && contextObj) ? this : contextObj;
			var combinedArgs = argsFromCall.concat(Array.prototype.slice.call(arguments));
			return originalFunction.apply(currentContext, combinedArgs);
		};

		if (originalFunction.prototype) {
			dummyConstructor.prototype = originalFunction.prototype;
		}
		boundFunction.prototype = new dummyConstructor();

		return boundFunction;
	};
}

// Polyfill for Array.prototype.indexOf, for older JS environments.
// Source: MDN Web Docs.
if (!Array.prototype.indexOf) {
	console.warn('ElevateFix: Array.prototype.indexOf polyfill applied.');
	Array.prototype.indexOf = function (targetElement /*, startingIndex */ ) {
		'use strict';

		if (this === null || this === undefined) {
			throw new TypeError('Array.prototype.indexOf: "this" is null or undefined.');
		}

		var currentObject = Object(this);
		var arrayLength = currentObject.length >>> 0; // Ensure unsigned 32-bit integer.

		if (arrayLength === 0) {
			return -1; // Empty array, element cannot be found.
		}

		var startIdx = 0;
		if (arguments.length > 1) {
			startIdx = Number(arguments[1]);
			if (isNaN(startIdx)) { // Check for NaN explicitly.
				startIdx = 0;
			} else if (startIdx !== 0 && startIdx !== Infinity && startIdx !== -Infinity) {
				startIdx = (startIdx > 0 || -1) * Math.floor(Math.abs(startIdx));
			}
		}

		if (startIdx >= arrayLength) {
			return -1; // Start index is beyond array bounds.
		}

		var loopCounter = startIdx >= 0 ? startIdx : Math.max(arrayLength - Math.abs(startIdx), 0);
		for (; loopCounter < arrayLength; loopCounter++) {
			if (loopCounter in currentObject && currentObject[loopCounter] === targetElement) {
				return loopCounter; // Element found at this index.
			}
		}
		return -1; // Element not found.
	};
}

// Main module definition, encapsulated in an Immediately Invoked Function Expression (IIFE).
(function (globalWindow, documentObject) {
	'use strict';

	var
		VERSION_ID = '1.0-beta', // Module version identifier.
		ACTIVE_PIN_CLASS = 'elevate-active', // CSS class for an element that is currently "active" (e.g., sticky).
		PASSIVE_PIN_CLASS = 'elevate-inactive', // CSS class for an element that is "inactive" (e.g., not yet sticky).
		globalScope = globalWindow, // Reference to the global window object.

		anchorViewInstance, // Placeholder for the main ElevateFix constructor.
		domToolkit;         // Helper object for DOM manipulation and utility functions.

	// DOM utility and helper functions.
	domToolkit = {
		// Checks if an object is an array or a NodeList.
		isCollection: function (inputObject) {
			var typeString = Object.prototype.toString.call(inputObject);
			return typeString === '[object Array]' || typeString === '[object NodeList]';
		},

		// Iterates over array-like objects or object properties.
		traverseItems: function (itemList, itemProcessor, boundContext) {
			var processorFn = (boundContext !== undefined) ? itemProcessor.bind(boundContext) : itemProcessor;
			var i, propKey;

			if (this.isCollection(itemList)) {
				for (i = 0; i < itemList.length; i += 1) {
					processorFn(itemList[i], i, itemList);
				}
			} else if (typeof itemList === 'object' && itemList !== null) {
				for (propKey in itemList) {
					if (Object.prototype.hasOwnProperty.call(itemList, propKey)) {
						processorFn(itemList[propKey], propKey, itemList);
					}
				}
			}
		},

		// Calculates the total offset (top, left) of a DOM element relative to the document.
		retrievePosition: function (elementNode) {
			var offsetX = 0,
				offsetY = 0;
			var currentElement = elementNode;

			if (!currentElement) {
				return { left: 0, top: 0 }; // Return zero if element is null/undefined.
			}

			// Traverse up the DOM tree, accumulating offsets.
			while (currentElement && currentElement.offsetParent) {
				offsetX += currentElement.offsetLeft - currentElement.scrollLeft;
				offsetY += currentElement.offsetTop - currentElement.scrollTop;
				currentElement = currentElement.offsetParent;
			}
			// Final adjustment for the last element's scroll position if it's the document body.
			if (currentElement === documentObject.body) {
				offsetX += currentElement.offsetLeft - currentElement.scrollLeft;
				offsetY += currentElement.offsetTop - currentElement.scrollTop;
			}


			return {
				left: offsetX,
				top: offsetY
			};
		},

		// Adds or removes a CSS class from a DOM element.
		manageClassToggle: function (elementNode, classNameString) {
			if (!elementNode || !classNameString) {
				return; // Exit if element or class name is invalid.
			}
			var currentClasses = elementNode.className.split(' ').filter(Boolean); // Filter(Boolean) removes empty strings.
			var classIdx = currentClasses.indexOf(classNameString);

			if (classIdx !== -1) {
				// Class exists, remove it.
				currentClasses.splice(classIdx, 1);
			} else {
				// Class does not exist, add it.
				currentClasses.push(classNameString);
			}
			elementNode.className = currentClasses.join(' ');
		},

		// Retrieves the current vertical scroll position of the window.
		fetchScrollYCoord: function () {
			if (globalScope.pageYOffset !== undefined) {
				return globalScope.pageYOffset;
			} else {
				// Fallback for older browsers (IE).
				var docElement = documentObject.documentElement;
				var bodyElement = documentObject.body;
				return (docElement && docElement.scrollTop) || (bodyElement && bodyElement.scrollTop) || 0;
			}
		},

		// Checks if a DOM element has a specific CSS class.
		hasCssClass: function (elementNode, classNameString) {
			if (!elementNode || typeof elementNode.className !== 'string') {
				return false;
			}
			// Use a regex for more robust class checking, accounting for boundaries.
			var classRegex = new RegExp('(^|\\s)' + classNameString + '(\\s|$)');
			return classRegex.test(elementNode.className);
		},

		// Sets an option on an instance, with a fallback default value.
		configureSetting: function (instanceRef, settingsObj, optionName, defaultValue) {
			instanceRef[optionName] = (settingsObj && settingsObj[optionName] !== undefined) ?
				settingsObj[optionName] :
				defaultValue;
		}
	};

	// Function to release previously secured elements from their fixed positions.
	function releaseElements(instanceContext, stopIndex) {
		var limitIndex = stopIndex;
		if (limitIndex === undefined || limitIndex < 0) {
			limitIndex = 0; // Default to releasing all elements from the start.
		}

		var elementsToProcess = instanceContext.pinnedElementRegistry.slice(limitIndex);

		domToolkit.traverseItems(elementsToProcess, function (elementItem, idx) {
			if (domToolkit.hasCssClass(elementItem, ACTIVE_PIN_CLASS)) {
				domToolkit.manageClassToggle(elementItem, ACTIVE_PIN_CLASS);
				// Reset parent's dimensions if they were adjusted.
				if (elementItem.parentNode) {
					elementItem.parentNode.style.height = '';
					elementItem.parentNode.style.width = '';
				}
				// Reset top position if stacking was applied.
				if (instanceContext.enableStacking && idx > 0) { // idx here is relative to elementsToProcess.
					elementItem.style.top = '';
				}
			}

			// Ensure the element is marked as 'inactive' if it's not already.
			if (!domToolkit.hasCssClass(elementItem, PASSIVE_PIN_CLASS)) {
				domToolkit.manageClassToggle(elementItem, PASSIVE_PIN_CLASS);
			}
		});
	}

	// Function to secure elements, making them fixed/sticky.
	function secureElements(instanceContext, countToSecure) {
		var elementsToSecure = instanceContext.pinnedElementRegistry.slice(0, countToSecure);

		domToolkit.traverseItems(elementsToSecure, function (elementItem, idx) {
			// Apply 'active' class if not present.
			if (!domToolkit.hasCssClass(elementItem, ACTIVE_PIN_CLASS)) {
				domToolkit.manageClassToggle(elementItem, ACTIVE_PIN_CLASS);
				// Adjust parent's dimensions to prevent content reflow.
				if (elementItem.parentNode) {
					elementItem.parentNode.style.height = elementItem.offsetHeight + 'px';
					elementItem.parentNode.style.width = elementItem.offsetWidth + 'px';
				}
			}

			// Handle stacking of elements if enabled.
			if (instanceContext.activePinIndex > 0 && instanceContext.enableStacking) {
				var accumulatedOffset = 0;
				for (var k = 0; k < idx; k += 1) { // Sum heights of preceding secured elements.
					accumulatedOffset += instanceContext.pinnedElementRegistry[k].offsetHeight;
				}
				elementItem.style.top = accumulatedOffset + 'px';
			}

			// Remove 'inactive' class if present.
			if (domToolkit.hasCssClass(elementItem, PASSIVE_PIN_CLASS)) {
				domToolkit.manageClassToggle(elementItem, PASSIVE_PIN_CLASS);
			}
		});
	}

	// Main logic to determine which elements should be pinned based on scroll position.
	function pinActiveHeaders(instanceContext, currentScrollY) {
		releaseElements(instanceContext); // First, release all elements.

		var currentHeaderIdx = -1; // Index of the highest element that should be pinned.
		var effectiveTopPosition = 0;
		var elementCount = instanceContext.pinnedElementRegistry.length;

		// Iterate from the last element backwards to find the highest relevant one.
		for (var i = elementCount - 1; i >= 0; i -= 1) {
			var currentElement = instanceContext.pinnedElementRegistry[i];
			var elementOffsetTop = domToolkit.retrievePosition(currentElement).top;
			effectiveTopPosition = 0; // Reset for each element.

			if (instanceContext.enableStacking) {
				// Calculate cumulative offset for stacking.
				for (var j = 0; j < i; j += 1) {
					effectiveTopPosition += instanceContext.pinnedElementRegistry[j].offsetHeight;
				}
			}

			// Check if the current scroll position is past this element's effective top.
			if ((currentScrollY + effectiveTopPosition) >= elementOffsetTop) {
				currentHeaderIdx = i;
				break; // Found the highest element to pin.
			}
		}

		// Update instance state and apply pinning.
		if (currentHeaderIdx !== -1) {
			instanceContext.activePinIndex = currentHeaderIdx;
			if (instanceContext.enableStacking) {
				// Recalculate total offset for the current active element's bottom.
				var totalOffsetForStack = 0;
				for (var k = 0; k <= currentHeaderIdx; k++) {
					totalOffsetForStack += instanceContext.pinnedElementRegistry[k].offsetHeight;
				}
				instanceContext.cumulativeOffset = totalOffsetForStack;
			}
			secureElements(instanceContext, currentHeaderIdx + 1); // Pin elements up to and including currentHeaderIdx.
			releaseElements(instanceContext, currentHeaderIdx + 1); // Release elements *after* currentHeaderIdx.
		} else {
			instanceContext.activePinIndex = -1; // No elements are currently pinned.
			instanceContext.cumulativeOffset = 0;
		}
	}

	// Core update function triggered by scroll events.
	function updateView(instanceContext, scrollTarget) {
		var scrollYValue;
		if (scrollTarget === globalScope) {
			scrollYValue = domToolkit.fetchScrollYCoord();
		} else if (scrollTarget && scrollTarget.nodeType === 1) { // Check if it's a DOM element.
			scrollYValue = scrollTarget.scrollTop; // For elements with scroll overflow.
		} else {
			console.warn('ElevateFix: Invalid scroll target provided. Defaulting to window scroll.');
			scrollYValue = domToolkit.fetchScrollYCoord();
		}

		pinActiveHeaders(instanceContext, scrollYValue);
	}

	// Sorts the registry of pinned elements by their vertical position.
	function orderElementStack(elementList) {
		elementList.sort(function (elemA, elemB) {
			var posA = domToolkit.retrievePosition(elemA).top;
			var posB = domToolkit.retrievePosition(elemB).top;
			return posA - posB;
		});

		// Initialize all but the first element as 'inactive'.
		if (elementList.length > 1) {
			domToolkit.traverseItems(elementList.slice(1), function (elem) {
				if (!domToolkit.hasCssClass(elem, PASSIVE_PIN_CLASS)) {
					domToolkit.manageClassToggle(elem, PASSIVE_PIN_CLASS);
				}
			});
		}
	}

	// Constructor function for the ElevateFix module.
	anchorViewInstance = function (optionsConfig) {
		this.elementReferences = {}; // Stores references to elements by their original ID/class.
		this.pinnedElementRegistry = []; // Ordered list of all elements managed by this instance.
		this.activePinIndex = -1; // Index of the highest currently pinned element.
		this.cumulativeOffset = 0; // Accumulated height for stacked elements.

		// Apply configuration options.
		domToolkit.configureSetting(this, optionsConfig, 'scrollContainer', globalScope);
		domToolkit.configureSetting(this, optionsConfig, 'enableStacking', false);

		// Store a reference to this instance for event listeners.
		var self = this;
		this._scrollHandler = function() {
			updateView(self, self.scrollContainer);
		};
	};

	// Prototype methods for ElevateFix instances.
	anchorViewInstance.prototype = {

		// Activates elements (identified by ID or class) to become sticky.
		activate: function (selectorInput) {
			var self = this;

			// Helper to add a single element or NodeList to the registry.
			function registerIndividualElement(identifier) {
				if (!identifier || typeof identifier !== 'string') {
					console.warn('ElevateFix: Invalid identifier provided for activation:', identifier);
					return;
				}

				// If already managed, deactivate it first to prevent duplicates.
				if (self.elementReferences[identifier] !== undefined) {
					self.deactivate(identifier);
				}

				if (identifier.startsWith('.')) { // Class selector.
					var classElements = documentObject.getElementsByClassName(identifier.slice(1));
					if (classElements.length === 0) {
						console.warn('ElevateFix: No elements found for class selector:', identifier);
						return;
					}
					self.elementReferences[identifier] = classElements;
					domToolkit.traverseItems(classElements, function (elem) {
						self.pinnedElementRegistry.push(elem);
					});
				} else { // ID selector.
					var foundElement = documentObject.getElementById(identifier);
					if (!foundElement) {
						console.warn('ElevateFix: No element found for ID selector:', identifier);
						return;
					}
					self.elementReferences[identifier] = foundElement;
					self.pinnedElementRegistry.push(foundElement);
				}
			}

			// Handle various input types for selectors.
			if (typeof selectorInput === 'object' && selectorInput !== null) {
				if (domToolkit.isCollection(selectorInput)) {
					domToolkit.traverseItems(selectorInput, function (item) {
						self.activate(item); // Recursive call for array of selectors.
					});
				} else {
					// Assume it's an object where keys are selectors.
					domToolkit.traverseItems(selectorInput, function (value, key) {
						self.activate(key);
					});
				}
			} else {
				registerIndividualElement(selectorInput);
			}

			// After adding elements, re-sort the registry and attach scroll listener.
			orderElementStack(this.pinnedElementRegistry);

			// Attach scroll event listener if not already attached.
			this.scrollContainer.removeEventListener('scroll', this._scrollHandler); // Ensure no duplicate listeners.
			this.scrollContainer.addEventListener('scroll', this._scrollHandler);

			// Immediately update the view after activation.
			updateView(self, self.scrollContainer);
		},

		// Deactivates elements, removing their sticky behavior.
		deactivate: function (selectorInput) {
			var self = this;

			// Helper to remove a single element from the registry and reset its styles.
			function unregisterSingleElement(elementNode) {
				if (!elementNode) {
					return;
				}

				// Remove styling classes.
				if (domToolkit.hasCssClass(elementNode, ACTIVE_PIN_CLASS)) {
					domToolkit.manageClassToggle(elementNode, ACTIVE_PIN_CLASS);
				}
				if (domToolkit.hasCssClass(elementNode, PASSIVE_PIN_CLASS)) {
					domToolkit.manageClassToggle(elementNode, PASSIVE_PIN_CLASS);
				}

				// Reset parent's dimensions.
				if (elementNode.parentNode) {
					elementNode.parentNode.style.height = '';
					elementNode.parentNode.style.width = '';
				}
				elementNode.style.top = ''; // Reset explicit top style.

				var registryIndex = self.pinnedElementRegistry.indexOf(elementNode);
				if (registryIndex !== -1) {
					// Adjust activePinIndex if the removed element was before it.
					if (registryIndex <= self.activePinIndex && self.activePinIndex > 0) {
						self.activePinIndex -= 1;
					}
					self.pinnedElementRegistry.splice(registryIndex, 1);
				}
			}

			// Helper to remove an entry from elementReferences and unregister its associated elements.
			function removeReferenceEntry(identifierKey) {
				if (self.elementReferences[identifierKey] !== undefined) {
					var referencedItem = self.elementReferences[identifierKey];

					if (domToolkit.isCollection(referencedItem)) {
						// It's a NodeList from a class selector.
						domToolkit.traverseItems(Array.prototype.slice.call(referencedItem), function (headerElem) {
							unregisterSingleElement(headerElem);
						});
					} else {
						// It's a single element from an ID selector.
						unregisterSingleElement(referencedItem);
					}

					delete self.elementReferences[identifierKey];
				}
			}

			// Handle various input types for selectors.
			if (typeof selectorInput === 'object' && selectorInput !== null) {
				if (domToolkit.isCollection(selectorInput)) {
					domToolkit.traverseItems(selectorInput, function (item) {
						self.deactivate(item); // Recursive call.
					});
				} else {
					domToolkit.traverseItems(selectorInput, function (value, key) {
						self.deactivate(key);
					});
				}
			} else {
				removeReferenceEntry(selectorInput);
			}

			// If no elements are left, remove the scroll listener.
			if (self.pinnedElementRegistry.length === 0) {
				self.scrollContainer.removeEventListener('scroll', self._scrollHandler);
				self.activePinIndex = -1;
				self.cumulativeOffset = 0;
			} else {
				// Re-evaluate current pinning state after removal.
				updateView(self, self.scrollContainer);
			}
		},

		// Removes all sticky behavior and cleans up the instance.
		resetModule: function () {
			var self = this;
			domToolkit.traverseItems(this.elementReferences, function (elements, id) {
				self.deactivate(id); // Deactivate all elements managed by this instance.
			});
			// Ensure the scroll listener is removed even if elementReferences was empty.
			this.scrollContainer.removeEventListener('scroll', this._scrollHandler);
			this.elementReferences = {};
			this.pinnedElementRegistry = [];
			this.activePinIndex = -1;
			this.cumulativeOffset = 0;
			console.log('ElevateFix instance reset.');
		},

		// Returns the current version of the module.
		getVersion: function () {
			return VERSION_ID;
		}
	};

	// Expose the constructor globally.
	globalScope.ElevateFix = anchorViewInstance;

	// Global static method to remove the entire module from the global scope.
	globalScope.ElevateFix.purge = function () {
		if (globalScope.ElevateFix) {
			delete globalScope.ElevateFix;
			console.log('ElevateFix module purged from global scope.');
		}
	};

}(window, document));