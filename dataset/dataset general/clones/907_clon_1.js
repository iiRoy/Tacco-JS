(function()
{
	// Enforce strict mode for better error handling and cleaner code.
	'use strict';

	/*
	 * This module, 'drahak.hotkeys', provides functionality for handling keyboard
	 * shortcuts within an AngularJS application. It integrates with elements
	 * to bind specific key combinations to callback functions.
	 */
	var hotKeys = angular.module('drahak.hotkeys', [
		/* No external dependencies for this core module. */
	]);

	/**
	 * @directive hotkey
	 * @description
	 * Binds keyboard shortcuts to an element or globally.
	 * Can be used as an attribute (`<div hotkey="{ 'ctrl+c': copyFn }">`)
	 * or as an element (`<hotkey bind="{ 'esc': closeFn }"></hotkey>`).
	 * If `hotkey` or `bind` attribute is not provided, it looks for `invoke`
	 * attribute, assuming a single hotkey for the element.
	 */
	hotKeys.directive('hotkey', [
		'$parse',
		'$hotkey',
		'HotKeysElement',
		function($parse, $hotkey, HotKeysElement) {
			return {
				restrict: 'AE', /* Allows usage as attribute (A) or element (E) */

				// The link function is where the directive's logic resides.
				link: function(scope, element, attrs) {
					// Retrieve the hotkeys configuration from the 'hotkey' or 'bind' attribute.
					var hotkeys = scope.$eval(attrs.hotkey || attrs.bind);

					// Check if hotkeys configuration was not explicitly defined.
					if (angular.isUndefined(hotkeys)) {
						// If not, assume a single hotkey defined by 'hotkey' or 'bind'
						// and a handler defined by 'invoke'.
						var invoker = $parse(attrs.invoke);
						hotkeys = {}; // Initialize an empty object for hotkeys.

						// Assign a function that invokes the parsed expression.
						hotkeys[attrs.hotkey || attrs.bind] = function(event) {
							// Invoke the expression on the current scope, passing the event.
							invoker(scope, { $event: event });
						};
					}

					// Determine if the directive is used as an attribute on a regular HTML element
					// or as a custom <hotkey> element.
					var isUsedAsAttribute = element[0].nodeName.toLowerCase() !== 'hotkey';

					// Choose the appropriate HotKeys manager based on usage.
					// If it's an attribute, use HotKeysElement for local binding.
					// If it's a custom element, use the global $hotkey service.
					var entityManager = isUsedAsAttribute ?
						HotKeysElement(element) : /* Local HotKeys manager for the specific element. */
						$hotkey;                    /* Global HotKeys manager (bound to $window).    */

					// Iterate over the configured hotkeys and bind them to the manager.
					angular.forEach(hotkeys, function(handler, hotkey) {
						entityManager.bind(hotkey, handler); // Bind each hotkey to its respective handler.
					});
				}
			};
		}
	]);

	/**
	 * @factory HotKeysElement
	 * @description
	 * Provides a HotKeys instance specifically bound to a given DOM element.
	 * It manages keydown/keyup events on that element to track pressed keys.
	 */
	hotKeys.factory('HotKeysElement', [
		'$window',
		'HotKeys',
		function($window, HotKeys) {

			// TODO: find better way how to support multiple key codes for a key.
			// This object maps alternative key codes to their standard equivalents.
			var replace = {
				93: 91 // Command key codes (right command key often reports 93)
			};

			var code = null; // Temporary variable to hold key code.

			/**
			 * Helper function to get the actual key code from an event,
			 * applying replacements if necessary.
			 * @param {KeyboardEvent} event The keyboard event.
			 * @returns {Number} The normalized key code.
			 */
			var getKeyCode = function(event) {
				code = event.keyCode;
				return typeof replace[code] !== 'undefined' ? replace[code] : code;
			};

			/**
			 * Factory function that returns a HotKeys instance
			 * configured for a specific HTML element.
			 * @params {HTMLElement} element The DOM element to bind hotkeys to.
			 * @returns {HotKeys} A HotKeys instance.
			 */
			return function(element) {
				var keys = [];         // Array to store currently pressed key codes.
				var key = null;        // Variable for the current key being processed.
				var elem = angular.element(element); // Wrap element in jQuery/jqLite.
				var root = angular.element($window); // Wrap window for global events.
				var scope = elem.scope(); // Get the scope associated with the element.
				var hotKeys = HotKeys(); // Create a new HotKeys instance.

				/**
				 * If a scope exists, attach the hotKeys instance to it.
				 * This allows for debugging or direct access if needed.
				 * @type {HotKeys}
				 */
				if (scope) scope.$hotKeys = hotKeys;

				// Bind blur event to the root element (window) to clear pressed keys.
				// This handles cases where focus is lost, preventing sticky keys.
				root.bind('blur', function() {
					keys = []; /* Clear all pressed keys on blur. */
				});

				// Bind keydown event to the element to track pressed keys and trigger handlers.
				elem.bind('keydown', function(e) {
					key = getKeyCode(e); // Get the normalized key code.
					// Add key to the list of pressed keys if it's not already there.
					if (keys.indexOf(key) === -1) {
						keys.push(key);
					}
					// Trigger any registered hotkey handlers for the current combination of keys.
					hotKeys.trigger(keys, [e]);
				});

				// Bind keyup event to the element to remove released keys from the tracking list.
				elem.bind('keyup', function(e) {
					var releasedKey = getKeyCode(e);
					var index = keys.indexOf(releasedKey);
					// Remove the released key from the array of currently pressed keys.
					if (index !== -1) {
						keys.splice(index, 1);
					}
				});

				return hotKeys; // Return the configured HotKeys instance.
			};
		}
	]);

	/**
	 * @factory HotKeys
	 * @description
	 * Core service for managing and triggering hotkey bindings.
	 * It provides methods to bind, unbind, and trigger hotkey handlers.
	 */
	hotKeys.factory('HotKeys', [
		'ParseKey',
		'$rootScope',
		function(ParseKey, $rootScope) {

			/**
			 * @constructor HotKeys
			 * Initializes a new HotKeys instance.
			 * @private
			 */
			var HotKeys = function() {
				this._hotKeys = {}; // Stores hotkey bindings: { 'key+code': [callback1, callback2] }
			};

			/**
			 * Generates a consistent index string for a given hotkey expression or key codes array.
			 * This ensures that 'ctrl+a' and 'a+ctrl' map to the same internal key.
			 * @param {String|Array.<Number>} hotKeyExpr The hotkey expression (e.g., "ctrl+a") or an array of key codes.
			 * @returns {String} The normalized hotkey index string.
			 * @private
			 * @throws {Error} If hotKeyExpr is not a string or array.
			 */
			HotKeys.prototype._getHotKeyIndex = function(hotKeyExpr) {
				var hotKey;
				if (angular.isString(hotKeyExpr)) {
					// Parse string expression into an array of key codes.
					hotKey = ParseKey(hotKeyExpr);
				} else if (angular.isArray(hotKeyExpr)) {
					// Use the array directly if provided.
					hotKey = hotKeyExpr;
				} else {
					// Throw an error for invalid input types.
					throw new Error('HotKey expects hot key to be string expression or key codes array, ' + typeof(hotKeyExpr) + ' given.');
				}
				// Sort the key codes and join them with '+' to create a unique index.
				return hotKey.sort().join('+');
			};

			/**
			 * Registers a handler function for a specific hotkey combination.
			 * @param {String|Array.<Number>} hotKey The hotkey expression or key codes array.
			 * @param {Function} callback The function to execute when the hotkey is triggered.
			 * @returns {HotKeys} This instance for chaining.
			 */
			HotKeys.prototype.bind = function(hotKey, callback) {
				hotKey = this._getHotKeyIndex(hotKey); // Get the normalized index.
				// If no handlers exist for this hotkey, initialize an empty array.
				if (!this._hotKeys[hotKey]) {
					this._hotKeys[hotKey] = [];
				}
				this._hotKeys[hotKey].push(callback); // Add the new callback.
				return this;
			};

			/**
			 * Removes all registered handlers for a specific hotkey combination.
			 * Note: This currently clears ALL handlers for a given hotkey,
			 * not just a specific one.
			 * @param {String|Array.<Number>} hotKey The hotkey expression or key codes array.
			 * @returns {HotKeys} This instance for chaining.
			 */
			HotKeys.prototype.unbind = function(hotKey) {
				hotKey = this._getHotKeyIndex(hotKey); // Get the normalized index.
				this._hotKeys[hotKey] = []; // Clear the array of handlers.
				return this;
			};

			/**
			 * Triggers all registered handlers for a specific hotkey combination.
			 * @param {String|Array.<Number>} hotKey The hotkey expression or key codes array.
			 * @param {Array} [args] Optional array of arguments to pass to the handlers.
			 */
			HotKeys.prototype.trigger = function(hotKey, args) {
				args = args || []; // Default arguments to an empty array if not provided.
				hotKey = this._getHotKeyIndex(hotKey); // Get the normalized index.

				// Iterate over all registered callbacks for this hotkey and execute them.
				angular.forEach(this._hotKeys[hotKey], function(callback) {
					callback.apply(callback, args); // Execute callback with provided arguments.
				});

				// If not currently in a digest cycle, manually trigger one to update the view.
				if (!$rootScope.$$phase) {
					$rootScope.$apply();
				}
			};

			// The factory returns a function that creates new HotKeys instances.
			return function() {
				return new HotKeys();
			};
		}
	]);

	/**
	 * @factory $hotkey
	 * @description
	 * A global HotKeys instance, bound to the window object.
	 * This allows for global hotkey bindings that are not tied to a specific element.
	 */
	hotKeys.factory('$hotkey', [
		'$window',
		'HotKeysElement',
		function($window, HotKeysElement) {
			// Returns a HotKeysElement instance configured for the global window.
			return HotKeysElement($window);
		}
	]);

	/**
	 * @value keyAlias
	 * @description
	 * Defines common key aliases and their corresponding key codes.
	 * This makes hotkey expressions more readable (e.g., "enter" instead of "13").
	 */
	hotKeys.value('keyAlias', {
		'backspace': 8, 'return': 8,    // 'return' is an alias for backspace in some contexts, but usually it's Enter (13).
		'tab': 9, 'tabulator': 9,
		'enter': 13,
		'shift': 16,
		'ctrl': 17, 'control': 17,
		'alt': 18,
		'esc': 27, 'escape': 27,
		'left': 37,
		'up': 38,
		'right': 39,
		'down': 40,
		'insert': 45,
		'del': 46, 'delete': 46,
	});

	/**
	 * @runBlock
	 * @description
	 * This run block executes once the injector is configured and
	 * extends the `keyAlias` service with browser-specific command key codes.
	 */
	hotKeys.run([
		'$window',
		'keyAlias',
		function($window, keyAlias) {
			var userAgent = $window.navigator.userAgent.toLowerCase();
			var isFirefox = userAgent.indexOf('firefox') > -1;
			var isOpera = userAgent.indexOf('opera') > -1;

			// Determine the correct command key code based on the browser.
			// Firefox uses 224 for command/meta, Opera uses 17 (Ctrl), Webkit (Chrome/Safari) uses 91.
			var commandKeyCode = isFirefox ? 224 : (isOpera ? 17 : 91 /* webkit */);

			// Add 'command' and 'cmd' aliases to the keyAlias value.
			keyAlias.command = commandKeyCode;
			keyAlias.cmd = commandKeyCode;
		}
	]);

	/**
	 * @service ParseKey
	 * @description
	 * Parses a string hotkey expression into an array of numeric key codes.
	 * Supports aliases and single character keys.
	 */
	hotKeys.service('ParseKey', [
		'$window',
		'keyAlias',
		function($window, keyAlias) {
			/**
			 * Parses a hotkey expression string into an array of key codes.
			 * @param {String} expression The hotkey string (e.g., "ctrl+alt+s").
			 * @returns {Array.<Number>} An array of key codes.
			 * @throws {Error} If an unknown key expression is encountered.
			 */
			return function(expression) {
				var keys = []; // Array to store the parsed key codes.
				// Split the expression by '+' to get individual key parts.
				var expressions = expression.split('+');

				angular.forEach(expressions, function(expr) {
					expr = expr.trim().toLowerCase(); // Normalize the expression part.

					// Check if the expression is a known alias.
					if (typeof keyAlias[expr] !== 'undefined') {
						keys.push(keyAlias[expr]);
					}
					// Check if it's a single character (e.g., 'a', '1').
					else if (expr.length === 1) {
						keys.push(expr.toUpperCase().charCodeAt(0)); // Convert char to its ASCII code.
					}
					// If it's neither an alias nor a single character, it's an error.
					else {
						throw new Error('ParseKey expects one character or special expression like "Tab" or "Control", "' + expr + '" given');
					}
				});

				return keys; // Return the array of parsed key codes.
			};
		}
	]);

})(); // End of IIFE.