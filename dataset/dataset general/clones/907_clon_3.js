(function(ng) {
	'use strict';

	// The primary module for keyboard shortcut management.
	var keyboardShortcutsModule = ng.module('globalKeyHandler', []);

	/**
	 * @ngdoc directive
	 * @name globalKeyHandler.directive:keyListener
	 * @restrict AE
	 * @description
	 * Binds keyboard shortcuts to actions within the scope of the element or globally.
	 *
	 * Usage:
	 * <div key-listener="{ 'ctrl+s': saveFunction, 'alt+x': exitFunction }">...</div>
	 * <key-listener key-binding="{'enter': submitForm}"></key-listener>
	 * <button ng-click="doSomething()" invoke="doSomething()">
	 */
	keyboardShortcutsModule.directive('keyListener', ['$parse', '$globalKeyHandler', 'KeyBindingManager', function($expressionParser, $globalKeyHandler, KeyBindingManager) {
		return {
			restrict: 'AE',
			link: function(scope, boundElement, attributes) {
				const ELEMENT_NODE_TYPE = boundElement[0].nodeName.toLowerCase();
				let keyActionMap;

				// Determine the source of key-action mappings
				const bindingAttribute = attributes.keyListener || attributes.keyBinding;
				if (ng.isDefined(bindingAttribute)) {
					keyActionMap = scope.$eval(bindingAttribute);
				}

				// If keyActionMap is not an object or explicitly defined,
				// it means the directive is likely used for single action invocation.
				if (!ng.isObject(keyActionMap)) {
					const actionExecutor = $expressionParser(attributes.invoke);
					if (!actionExecutor) {
						// If no action to invoke, then this directive is effectively a no-op.
						return;
					}
					// Create a single entry map for the implied shortcut.
					keyActionMap = {};
					// The key combination is taken from 'keyListener'/'keyBinding' attribute itself.
					// If that's not present, it's an error in usage.
					const assumedKeyCombo = bindingAttribute || ELEMENT_NODE_TYPE; // Fallback to element name if no explicit combo
					if (!assumedKeyCombo) {
						console.warn("keyListener directive used without 'keyListener', 'keyBinding', or 'invoke' attribute.");
						return;
					}
					keyActionMap[assumedKeyCombo] = function(eventObject) {
						actionExecutor(scope, { $event: eventObject });
					};
				}

				// Choose the appropriate key binding context: element-specific or global.
				const isElementSpecific = (ELEMENT_NODE_TYPE !== 'key-listener');
				const bindingContext = isElementSpecific ?
					KeyBindingManager(boundElement) :
					$globalKeyHandler;

				// Register all defined key combinations and their handlers.
				ng.forEach(keyActionMap, function(actionHandler, keyComboString) {
					// Basic validation for handler
					if (ng.isFunction(actionHandler)) {
						bindingContext.register(keyComboString, actionHandler);
					} else {
						console.warn(`keyListener: Handler for '${keyComboString}' is not a function.`, actionHandler);
					}
				});

				// Optional: Clean up bindings when the scope is destroyed.
				scope.$on('$destroy', function() {
					ng.forEach(keyActionMap, function(actionHandler, keyComboString) {
						bindingContext.unregister(keyComboString, actionHandler); // Unregister specific handler
					});
					if (ng.isFunction(bindingContext.dispose)) {
						bindingContext.dispose(); // Dispose element-specific manager if it has a method
					}
				});
			}
		};
	}]);

	/**
	 * @ngdoc factory
	 * @name globalKeyHandler.KeyBindingManager
	 * @description
	 * Manages key events for a specific DOM element, providing a KeyRegistry instance.
	 * It normalizes key codes and tracks currently pressed keys.
	 */
	keyboardShortcutsModule.factory('KeyBindingManager', ['$window', 'KeyRegistry', function($windowService, KeyRegistry) {

		// Map to adjust key codes for cross-browser consistency, especially for meta keys.
		const platformKeyAdjustments = new Map([
			[93, 91] // Windows 'context menu' key (93) -> normalize to left command/meta (91)
			// Add more platform-specific adjustments as needed
		]);

		/**
		 * Standardizes the key code from a keyboard event.
		 * @param {KeyboardEvent} event The keyboard event object.
		 * @returns {number} The standardized key code.
		 */
		const standardizeKeyCode = function(event) {
			const originalCode = event.keyCode || event.which;
			return platformKeyAdjustments.has(originalCode) ? platformKeyAdjustments.get(originalCode) : originalCode;
		};

		/**
		 * Factory function returning a KeyBindingManager instance for a given element.
		 * @param {HTMLElement} targetElement The DOM element to bind key events to.
		 * @returns {KeyRegistry} A KeyRegistry instance specific to the target element.
		 */
		return function(targetElement) {
			let activeKeyPresses = []; // Stores currently pressed key codes.
			let elementKeyRegistry = KeyRegistry(); // The registry for this element's shortcuts.
			const jqElement = ng.element(targetElement);
			const windowElement = ng.element($windowService);
			const elementScope = jqElement.scope();

			// If an Angular scope exists, expose the KeyRegistry instance.
			if (elementScope) {
				elementScope.$elementKeyRegistry = elementKeyRegistry;
			} else {
				console.warn('KeyBindingManager: Element has no associated Angular scope. KeyRegistry will not be exposed via scope.$elementKeyRegistry.', targetElement);
			}

			// Clear active keys when the window loses focus to prevent "stuck" keys.
			const blurHandler = function() {
				activeKeyPresses = [];
			};
			windowElement.on('blur', blurHandler);

			// Handle keydown events: track pressed keys and trigger combinations.
			const keydownHandler = function(e) {
				const pressedCode = standardizeKeyCode(e);
				if (!activeKeyPresses.includes(pressedCode)) {
					activeKeyPresses.push(pressedCode);
				}
				elementKeyRegistry.execute(activeKeyPresses, [e]);

				// Prevent default browser actions for certain key combinations if a handler was found.
				// This is a common requirement for hotkeys.
				if (elementKeyRegistry.has(activeKeyPresses.sort().join('+'))) {
					e.preventDefault();
				}
			};
			jqElement.on('keydown', keydownHandler);

			// Handle keyup events: remove released keys from tracking.
			const keyupHandler = function(e) {
				const releasedCode = standardizeKeyCode(e);
				activeKeyPresses = activeKeyPresses.filter(code => code !== releasedCode);

				// Prevent default browser actions for certain key combinations if a handler was found.
				// This is a common requirement for hotkeys.
				if (elementKeyRegistry.has(activeKeyPresses.sort().join('+'))) {
					e.preventDefault();
				}
			};
			jqElement.on('keyup', keyupHandler);

			// Add a dispose method for cleanup.
			elementKeyRegistry.dispose = function() {
				jqElement.off('keydown', keydownHandler);
				jqElement.off('keyup', keyupHandler);
				windowElement.off('blur', blurHandler);
				elementKeyRegistry.clearAll(); // Clear all registered handlers.
				elementKeyRegistry._isDisposed = true; // Mark as disposed.
			};

			return elementKeyRegistry;
		};
	}]);

	/**
	 * @ngdoc factory
	 * @name globalKeyHandler.KeyRegistry
	 * @description
	 * A service for managing and triggering keyboard shortcut handlers.
	 * Each instance maintains its own set of registered key combinations.
	 */
	keyboardShortcutsModule.factory('KeyRegistry', ['KeyCombinationParser', '$rootScope', function(KeyCombinationParser, $rootAppScope) {

		/**
		 * @class KeyRegistry
		 * @description Constructor for a new KeyRegistry instance.
		 */
		var KeyRegistry = function() {
			this._registeredHandlers = {}; // Stores handlers keyed by normalized key combination strings.
			this._isDisposed = false;
		};

		/**
		 * Generates a consistent identifier string for a given key combination.
		 * @param {string|Array<number>} inputKeyCombo The key combination as a string (e.g., "ctrl+s") or an array of key codes.
		 * @returns {string} The normalized key combination string (e.g., "17+83").
		 * @private
		 * @throws {Error} If the inputKeyCombo is invalid.
		 */
		KeyRegistry.prototype._getNormalizedKeyIndex = function(inputKeyCombo) {
			let parsedKeyCodes;

			if (ng.isString(inputKeyCombo)) {
				if (!inputKeyCombo.trim()) {
					throw new Error('KeyRegistry: Provided key combination string is empty or whitespace only.');
				}
				parsedKeyCodes = KeyCombinationParser(inputKeyCombo);
			} else if (ng.isArray(inputKeyCombo)) {
				if (!inputKeyCombo.every(code => ng.isNumber(code))) {
					throw new Error('KeyRegistry: Key combination array must contain only numbers (key codes).');
				}
				parsedKeyCodes = inputKeyCombo;
			} else {
				throw new Error('KeyRegistry: Expected key combination to be a string expression or an array of key codes, but received ' + typeof(inputKeyCombo) + '.');
			}

			// Ensure consistent order for combination comparison.
			return parsedKeyCodes.sort((a, b) => a - b).join('+');
		};

		/**
		 * Registers a handler function for a specific keyboard shortcut.
		 * @param {string|Array<number>} keyCombination The keyboard shortcut to bind (e.g., "ctrl+s", or [17, 83]).
		 * @param {Function} handlerFn The function to execute when the shortcut is pressed.
		 * @returns {KeyRegistry} This instance, for chaining.
		 * @throws {Error} If the handlerFn is not a function.
		 */
		KeyRegistry.prototype.register = function(keyCombination, handlerFn) {
			if (this._isDisposed) {
				console.warn('KeyRegistry: Attempted to register handler on a disposed instance.');
				return this;
			}
			if (!ng.isFunction(handlerFn)) {
				throw new Error('KeyRegistry.register: A handler function must be provided.');
			}

			const normalizedIndex = this._getNormalizedKeyIndex(keyCombination);
			if (!this._registeredHandlers[normalizedIndex]) {
				this._registeredHandlers[normalizedIndex] = [];
			}
			// Prevent duplicate registration of the same function for the same combination.
			if (!this._registeredHandlers[normalizedIndex].includes(handlerFn)) {
				this._registeredHandlers[normalizedIndex].push(handlerFn);
			}
			return this;
		};

		/**
		 * Unregisters one or all handlers for a given keyboard shortcut.
		 * If `handlerFn` is provided, only that specific handler is removed.
		 * If `handlerFn` is omitted, all handlers for the `keyCombination` are removed.
		 * @param {string|Array<number>} keyCombination The keyboard shortcut to unbind.
		 * @param {Function=} handlerFn Optional. The specific handler function to remove.
		 * @returns {KeyRegistry} This instance, for chaining.
		 */
		KeyRegistry.prototype.unregister = function(keyCombination, handlerFn) {
			if (this._isDisposed) {
				console.warn('KeyRegistry: Attempted to unregister handler on a disposed instance.');
				return this;
			}
			const normalizedIndex = this._getNormalizedKeyIndex(keyCombination);
			const handlers = this._registeredHandlers[normalizedIndex];

			if (handlers) {
				if (ng.isFunction(handlerFn)) {
					// Remove specific handler
					this._registeredHandlers[normalizedIndex] = handlers.filter(h => h !== handlerFn);
				} else {
					// Remove all handlers for this combination
					delete this._registeredHandlers[normalizedIndex];
				}
			}
			return this;
		};

		/**
		 * Checks if any handler is registered for a given key combination.
		 * @param {string|Array<number>} keyCombination The keyboard shortcut to check.
		 * @returns {boolean} True if handlers are registered, false otherwise.
		 */
		KeyRegistry.prototype.has = function(keyCombination) {
			if (this._isDisposed) {
				return false;
			}
			try {
				const normalizedIndex = this._getNormalizedKeyIndex(keyCombination);
				return !!(this._registeredHandlers[normalizedIndex] && this._registeredHandlers[normalizedIndex].length > 0);
			} catch (e) {
				// If parsing fails, it definitely doesn't have a registered handler.
				return false;
			}
		};

		/**
		 * Executes all registered handlers for a given keyboard shortcut.
		 * @param {string|Array<number>} keyCombination The keyboard shortcut to trigger.
		 * @param {Array<any>=} eventArguments Optional. Arguments to pass to the handler functions.
		 */
		KeyRegistry.prototype.execute = function(keyCombination, eventArguments) {
			if (this._isDisposed) {
				console.warn('KeyRegistry: Attempted to execute handlers on a disposed instance.');
				return;
			}
			const argsToPass = eventArguments || [];
			const normalizedIndex = this._getNormalizedKeyIndex(keyCombination);
			const handlersToExecute = this._registeredHandlers[normalizedIndex];

			if (handlersToExecute && handlersToExecute.length > 0) {
				handlersToExecute.forEach(function(handlerCallback) {
					try {
						handlerCallback.apply(null, argsToPass); // Use apply for array of arguments
					} catch (error) {
						console.error(`KeyRegistry: Error executing handler for '${normalizedIndex}':`, error);
					}
				});

				// Ensure Angular's digest cycle runs if not already in progress.
				if (!$rootAppScope.$$phase) {
					$rootAppScope.$apply();
				}
			}
		};

		/**
		 * Clears all registered key combination handlers from this registry.
		 * @returns {KeyRegistry} This instance, for chaining.
		 */
		KeyRegistry.prototype.clearAll = function() {
			this._registeredHandlers = {};
			return this;
		};

		// The factory returns a function that instantiates KeyRegistry.
		return function() {
			return new KeyRegistry();
		};
	}]);

	/**
	 * @ngdoc factory
	 * @name globalKeyHandler.$globalKeyHandler
	 * @description
	 * Provides a global KeyRegistry instance bound to the window object.
	 */
	keyboardShortcutsModule.factory('$globalKeyHandler', ['$window', 'KeyBindingManager', function($windowService, KeyBindingManager) {
		// The global key handler is essentially a KeyBindingManager bound to the window.
		const globalHandler = KeyBindingManager($windowService);

		// Optionally, add a specific dispose method for the global handler if needed.
		// For the global handler, we might not want to dispose it easily.
		// globalHandler.dispose = function() { /* Prevent accidental global unbinding */ };

		return globalHandler;
	}]);

	/**
	 * @ngdoc value
	 * @name globalKeyHandler.standardKeyCodes
	 * @description
	 * A map of common key names to their respective key codes.
	 */
	keyboardShortcutsModule.value('standardKeyCodes', {
		// Navigation & Editing
		'backspace': 8, 'delete': 46,
		'tab': 9, 'enter': 13,
		'escape': 27, 'esc': 27,
		'space': 32,
		'insert': 45,

		// Arrow Keys
		'left': 37, 'up': 38, 'right': 39, 'down': 40,

		// Modifiers
		'shift': 16,
		'ctrl': 17, 'control': 17,
		'alt': 18,
		'meta': 91, // Left Windows key / Left Command key
		'os': 91,    // Alias for meta
	});

	/**
	 * @ngdoc run
	 * @name globalKeyHandler.run
	 * @description
	 * Configures platform-specific key code mappings for meta/command keys.
	 */
	keyboardShortcutsModule.run(['$window', 'standardKeyCodes', function($windowService, standardKeyCodes) {
		const browserIdentifier = $windowService.navigator.userAgent.toLowerCase();
		const isMozillaBrowser = browserIdentifier.includes('firefox');
		const isOperaBrowser = browserIdentifier.includes('opera') || browserIdentifier.includes('opr'); // Opera also uses 'opr'
		const isMac = browserIdentifier.includes('macintosh');

		let systemMetaKey = 91; // Default for WebKit/Blink (left command/windows key)

		if (isMozillaBrowser) {
			systemMetaKey = 224; // Firefox uses 224 for 'meta' key
		} else if (isOperaBrowser) {
			systemMetaKey = 17; // Older Opera might use 17 for 'meta' (Ctrl)
		} else if (isMac && !isMozillaBrowser) {
			systemMetaKey = 91; // Consistent for Safari/Chrome on Mac (left command)
		}

		// Assign platform-specific meta key codes.
		standardKeyCodes.command = systemMetaKey;
		standardKeyCodes.cmd = systemMetaKey; // Common alias
		standardKeyCodes.windows = systemMetaKey; // For Windows users
	}]);

	/**
	 * @ngdoc service
	 * @name globalKeyHandler.KeyCombinationParser
	 * @description
	 * Parses a string representation of a key combination into an array of key codes.
	 */
	keyboardShortcutsModule.service('KeyCombinationParser', ['$window', 'standardKeyCodes', function($windowService, standardKeyCodes) {
		const parsedExpressionCache = new Map(); // Cache for parsed key expressions.

		/**
		 * Parses a key combination string into an array of corresponding key codes.
		 * @param {string} rawKeyExpression The key combination string (e.g., "ctrl+shift+a").
		 * @returns {Array<number>} An array of key codes.
		 * @throws {Error} If the expression is invalid or contains unknown keys.
		 */
		return function(rawKeyExpression) {
			if (!ng.isString(rawKeyExpression) || !rawKeyExpression.trim()) {
				throw new Error('KeyCombinationParser: Invalid or empty key expression provided.');
			}

			// Check cache first
			if (parsedExpressionCache.has(rawKeyExpression)) {
				return parsedExpressionCache.get(rawKeyExpression);
			}

			const parsedKeyCodes = [];
			const comboParts = rawKeyExpression.split('+');

			for (let i = 0; i < comboParts.length; i++) {
				let currentPart = comboParts[i].trim().toLowerCase();

				if (standardKeyCodes.hasOwnProperty(currentPart)) {
					parsedKeyCodes.push(standardKeyCodes[currentPart]);
				} else if (currentPart.length === 1) {
					// Handle single character keys (e.g., 'a', '1')
					parsedKeyCodes.push(currentPart.toUpperCase().charCodeAt(0));
				} else {
					throw new Error(`KeyCombinationParser: Unknown key part "${currentPart}" in expression "${rawKeyExpression}". Expected a single character or a standard alias like "Tab" or "Control".`);
				}
			}

			// Store in cache before returning
			parsedExpressionCache.set(rawKeyExpression, parsedKeyCodes);
			return parsedKeyCodes;
		};
	}]);

})(angular);