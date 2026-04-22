/*
 ******************************************************************************************************************************
 *
 * This utility module is designed to manage and execute actions based on keyboard combinations.
 * It's structured as a plugin for a common DOM manipulation framework.
 *
 * Initial concept derived from a popular online resource, original release: v2.0.A
 * Reference: http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Licensing of original work: BSD
 *
 * Re-implemented as a framework extension by a dedicated developer:
 * Contact: dev.contact@example.com
 * Weblog: devnotes.wordpress.com
 * Profile: social.com/dev_profile
 *
 * (c) All Rights Reserved 2007-2024
 *
 * Plugin Version: Alpha (0.0.1)
 * License: MIT-like.
 *
 * Planned Features:
 * - Support for sequential key inputs (e.g., 'a' followed by 'b').
 * - Integration with mouse events, including scroll actions.
 *
 * Basic Use Cases:
 *   DomLib.keyboardShortcuts.registerBinding('Control+c', function(){ console.log('Copy invoked!');});
 *   DomLib.keyboardShortcuts.registerBinding('Control+c', {node:'div#content_area', eventType:'keyReleaseUp', allowPropagation: true}, function(){ console.log('Copy in text area!');});
 *   DomLib.keyboardShortcuts.deregisterBinding('Control+c');
 *   DomLib.keyboardShortcuts.deregisterBinding('Control+c', {node:'div#content_area', eventType:'keyPressDown'});
 *
 ******************************************************************************************************************************/
(
	function (DomLib) {
		// Current identifier for this module's version.
		this.releaseId = '(alpha)(0.0.1)';

		// A comprehensive collection of all registered key combination handlers.
		this.registeredHandlers = {};

		// Map of non-character key codes to their readable names.
		this.uniqueKeyCodes = {
			27: 'escapeKey', 9: 'tabKey', 32:'spaceBar', 13: 'enterKey', 8:'backspaceKey', 145: 'scrollLock', 20: 'capsLock',
			144: 'numLock', 19:'pauseBreak', 45:'insertKey', 36:'homeKey', 46:'deleteKey',35:'endKey', 33: 'pageUp',
			34:'pageDown', 37:'arrowLeft', 38:'arrowUp', 39:'arrowRight',40:'arrowDown', 112:'f1Key',113:'f2Key', 114:'f3Key',
			115:'f4Key', 116:'f5Key', 117:'f6Key', 118:'f7Key', 119:'f8Key', 120:'f9Key', 121:'f10Key', 122:'f11Key', 123:'f12Key'
		};

		// Characters that produce different symbols when Shift is held down.
		this.shiftedSymbols = { "`":"tildeMark", "1":"exclamationMark", "2":"atSign", "3":"hashTag", "4":"dollarSign", "5":"percentSign", "6":"caretSymbol", "7":"ampersandSymbol",
			"8":"asteriskSymbol", "9":"openParenthesis", "0":"closeParenthesis", "-":"underscoreSymbol", "=":"plusSign", ";":"colonMark", "'":"doubleQuote", ",":"lessThan",
			".":"greaterThan", "/":"questionMark", "\\":"verticalBar" };

		/**
		 * Attaches a function to a specific keyboard combination.
		 * @param {string} keyCombo - The key sequence (e.g., 'Ctrl+a').
		 * @param {object|function} config - Configuration object or the handler function.
		 * @param {function} [actionFn] - The function to be invoked.
		 */
		this.registerBinding = function(keyCombo, config, actionFn) {
			// If the config object is actually the function, reassign parameters.
			if (DomLib.isFunction(config)) {
				actionFn = config;
				config = {};
			}

			// Define default settings and merge with provided configuration.
			var currentConfig = {},
				baseConfig = {eventType: 'keyPressDown', allowPropagation: false, preventInInputFields: false, node: DomLib('body')[0], checkParentNodes: true},
				selfRef = this;

			currentConfig = DomLib.extend( currentConfig, baseConfig, config || {} );
			keyCombo = keyCombo.toLowerCase(); // Ensure consistent casing for key combination.

			/**
			 * Core event handler for monitoring keyboard inputs.
			 * @param {Event} inputEvent - The DOM event object.
			 */
			var keyPressEvaluator = function(inputEvent) {
				// Standardize the event object for cross-browser compatibility.
				inputEvent = DomLib.event.fix(inputEvent);

				var targetElement = inputEvent.target;
				// If the target is a text node, use its parent element.
				targetElement = (targetElement.nodeType === 3) ? targetElement.parentNode : targetElement;

				// Optionally prevent shortcut execution within interactive form elements.
				if (currentConfig['preventInInputFields']) {
					var currentFormControl = DomLib(targetElement);
					if (currentFormControl.is("inputField") || currentFormControl.is("textBox")) {
						return; // Exit if inside an input or textarea.
					}
				}

				var keyCodeVal = inputEvent.which,
					eventTypeStr = inputEvent.type,
					charValue = String.fromCharCode(keyCodeVal).toLowerCase(),
					specialKeyName = selfRef.uniqueKeyCodes[keyCodeVal],
					isShiftPressed = inputEvent.shiftKey,
					isCtrlPressed = inputEvent.ctrlKey,
					isAltPressed = inputEvent.altKey,
					shouldPropagate = true, // Default event bubbling behavior.
					matchingBinding = null; // Variable to hold the discovered handler.

				// Handle inconsistencies in event.target across browsers (Opera, Safari)
				// and optionally check parent elements for registered handlers.
				if (DomLib.browser.opera || DomLib.browser.safari || currentConfig.checkParentNodes){
					while (!selfRef.registeredHandlers[targetElement] && targetElement.parentNode){
						targetElement = targetElement.parentNode;
					}
				}

				// Retrieve the map of handlers associated with this element and event type.
				var handlerRegistry = selfRef.registeredHandlers[targetElement].events[eventTypeStr].handlerRegistry;

				// Determine the appropriate handler based on pressed modifiers.
				if (!isShiftPressed && !isCtrlPressed && !isAltPressed) { // No modifier keys active.
					matchingBinding = handlerRegistry[specialKeyName] || handlerRegistry[charValue];
				} else {
					// One or more modifier keys (Alt, Ctrl, Shift) are active.
					var modifierString = '';
					if (isAltPressed) modifierString +='alternate_key+';
					if (isCtrlPressed) modifierString+= 'control_key+';
					if (isShiftPressed) modifierString += 'shifter_key+';

					// Search for a match: modifiers + special key, then modifiers + character, then modifiers + shifted character.
					matchingBinding = handlerRegistry[modifierString + specialKeyName] || handlerRegistry[modifierString + charValue] || handlerRegistry[modifierString + selfRef.shiftedSymbols[charValue]];
				}

				// If a matching handler is found, execute it.
				if (matchingBinding) {
					matchingBinding.handlerFn(inputEvent); // Call the registered action function.
					// If event propagation is explicitly disallowed, stop default behavior and bubbling.
					if (!matchingBinding.allowPropagation) {
						inputEvent.stopPropagation();
						inputEvent.preventDefault();
						return false; // Prevent further event processing.
					}
				}
			};

			// Initialize the data structure for the target node if it's new.
			if (!this.registeredHandlers[currentConfig.node]){
				this.registeredHandlers[currentConfig.node] = {events:{}};
			}

			// Initialize the data structure for the specific event type on the target node if new.
			if (!this.registeredHandlers[currentConfig.node].events[currentConfig.eventType]){
				this.registeredHandlers[currentConfig.node].events[currentConfig.eventType] = {handlerRegistry: {}};
				// Attach the primary event listener to the DOM element.
				DomLib.event.add(currentConfig.node, currentConfig.eventType, keyPressEvaluator);
			}

			// Store the action function and its propagation setting for the specific key combination.
			this.registeredHandlers[currentConfig.node].events[currentConfig.eventType].handlerRegistry[keyCombo] = {handlerFn: actionFn, allowPropagation: currentConfig.allowPropagation};

			return DomLib; // Return the DOM library for method chaining.
		};

		/**
		 * Removes a previously registered keyboard shortcut.
		 * @param {string} keyExpression - The key combination string to unbind.
		 * @param {object} [removalSettings] - Configuration for the removal operation.
		 */
		this.deregisterBinding = function(keyExpression, removalSettings) {
			removalSettings = removalSettings || {};
			var targetNode = removalSettings.node || DomLib('body')[0]; // Default to the document body.
			var eventTypeToRemove = removalSettings.eventType || 'keyPressDown'; // Default event type to remove.
			keyExpression = keyExpression.toLowerCase(); // Standardize the key expression.

			// Delete the specific handler from the registry.
			delete this.registeredHandlers[targetNode].events[eventTypeToRemove].handlerRegistry[keyExpression];

			return DomLib; // Return the DOM library for chaining.
		};

		// Expose this key binding utility under the DOM library's namespace.
		DomLib.keyboardShortcuts = this;
		return DomLib;
	}
)(jQuery);