(function () {
    'use strict';

    // --- Key Parsing and Alias Management (Replaces 'keyAlias' and 'ParseKey' services) ---
    // Encapsulates key code mappings, platform-specific adjustments, and expression normalization.
    const keyInterpreter = (function () {
        const keyNameMappings = new Map([
            ['backspace', 8], ['return', 8], // Keeping original's 'return': 8 (Backspace) for clone fidelity
            ['tab', 9], ['tabulator', 9],
            ['enter', 13],
            ['shift', 16],
            ['ctrl', 17], ['control', 17],
            ['alt', 18],
            ['esc', 27], ['escape', 27],
            ['left', 37],
            ['up', 38],
            ['right', 39],
            ['down', 40],
            ['insert', 45],
            ['del', 46], ['delete', 46]
        ]);

        // Determine platform-specific command key code
        const currentBrowserAgent = navigator.userAgent.toLowerCase();
        const isFirefoxBrowser = currentBrowserAgent.includes('firefox');
        const isOperaBrowser = currentBrowserAgent.includes('opera');
        const systemCommandCode = isFirefoxBrowser ? 224 : (isOperaBrowser ? 17 : 91); // 91 for WebKit/Chrome/Safari (left command), 224 for Firefox, 17 for Opera
        keyNameMappings.set('command', systemCommandCode);
        keyNameMappings.set('cmd', systemCommandCode);

        // Key code remapping (e.g., right command key to left command key)
        const codeRemap = {
            93: 91 // Original maps right command (93) to left command (91)
        };

        // Standardizes a raw event key code, applying any necessary remapping.
        function obtainProcessedKeyCode(keyboardEvent) {
            const rawCode = keyboardEvent.keyCode;
            return typeof codeRemap[rawCode] !== 'undefined' ? codeRemap[rawCode] : rawCode;
        }

        // Converts a string key expression (e.g., "ctrl+alt+s") or an array of codes
        // into a sorted, unique string, used as a canonical identifier for hotkey combinations.
        function createCanonicalKeyString(inputDefinition) {
            let codesProcessed;
            if (typeof inputDefinition === 'string') {
                const parts = inputDefinition.split('+');
                codesProcessed = parts.map(part => {
                    const cleanPart = part.trim().toLowerCase();
                    if (keyNameMappings.has(cleanPart)) {
                        return keyNameMappings.get(cleanPart);
                    } else if (cleanPart.length === 1) {
                        return cleanPart.toUpperCase().charCodeAt(0);
                    } else {
                        throw new Error('KeyInterpreter: Malformed key part in expression: "' + cleanPart + '"');
                    }
                });
            } else if (Array.isArray(inputDefinition)) {
                codesProcessed = inputDefinition;
            } else {
                throw new Error('KeyInterpreter: Input must be a string expression or an array of key codes, received ' + typeof (inputDefinition) + '.');
            }
            // Sort and remove duplicates to ensure a consistent, canonical representation
            return [...new Set(codesProcessed)].sort((a, b) => a - b).join('+');
        }

        return {
            normalizeExpression: createCanonicalKeyString,
            getStandardKeyCode: obtainProcessedKeyCode
        };
    })();

    // --- Keyboard Event Handler (Replaces 'HotKeysElement' and 'HotKeys' factories) ---
    // Manages active key states and dispatches actions for a specific DOM target (element or window).
    class KeyboardActionDispatcher {
        constructor(observationTarget) {
            this.observationTarget = observationTarget; // The DOM element or the 'window' object
            this.currentlyPressedKeys = new Set(); // Stores key codes of keys currently held down
            this.registeredActionCallbacks = new Map(); // Maps canonical key strings to arrays of handler functions

            // Bind event handlers to the instance for correct 'this' context
            this.onKeyDownEvent = this.onKeyDownEvent.bind(this);
            this.onKeyUpEvent = this.onKeyUpEvent.bind(this);
            this.onFocusLost = this.onFocusLost.bind(this);

            // Attach event listeners to the target
            this.observationTarget.addEventListener('keydown', this.onKeyDownEvent);
            this.observationTarget.addEventListener('keyup', this.onKeyUpEvent);
            // Use 'blur' for window, 'focusout' for elements for clearing active keys
            if (this.observationTarget === window) {
                window.addEventListener('blur', this.onFocusLost);
            } else {
                this.observationTarget.addEventListener('focusout', this.onFocusLost);
            }
        }

        onKeyDownEvent(eventObj) {
            const currentKey = keyInterpreter.getStandardKeyCode(eventObj);
            if (!this.currentlyPressedKeys.has(currentKey)) {
                this.currentlyPressedKeys.add(currentKey);
            }
            this.dispatchActions(eventObj);
        }

        onKeyUpEvent(eventObj) {
            const currentKey = keyInterpreter.getStandardKeyCode(eventObj);
            this.currentlyPressedKeys.delete(currentKey);
        }

        onFocusLost() {
            this.currentlyPressedKeys.clear(); // Clear all active keys if focus is lost
        }

        // Registers a callback function for a given hotkey expression.
        attachAction(keyExpression, callbackFunction) {
            const canonicalKey = keyInterpreter.normalizeExpression(keyExpression);
            if (!this.registeredActionCallbacks.has(canonicalKey)) {
                this.registeredActionCallbacks.set(canonicalKey, []);
            }
            this.registeredActionCallbacks.get(canonicalKey).push(callbackFunction);
            return this; // Allow chaining
        }

        // Removes all registered callbacks for a specific hotkey expression.
        detachActions(keyExpression) {
            const canonicalKey = keyInterpreter.normalizeExpression(keyExpression);
            this.registeredActionCallbacks.set(canonicalKey, []); // Clear the array of handlers
            return this; // Allow chaining
        }

        // Dispatches all associated actions for the currently active key combination.
        dispatchActions(eventObj) {
            if (this.currentlyPressedKeys.size === 0) return;

            const activeKeyCodes = Array.from(this.currentlyPressedKeys);
            const canonicalActiveCombination = keyInterpreter.normalizeExpression(activeKeyCodes);

            const handlers = this.registeredActionCallbacks.get(canonicalActiveCombination);
            if (handlers) {
                handlers.forEach(handler => {
                    // Original passed event as '$event' to Angular scope. Here, we pass the raw event object.
                    handler(eventObj);
                });
            }
            // No Angular digest cycle needed in vanilla JS, so no '$rootScope.$apply()'.
        }

        // Cleans up event listeners and internal state.
        deactivate() {
            this.observationTarget.removeEventListener('keydown', this.onKeyDownEvent);
            this.observationTarget.removeEventListener('keyup', this.onKeyUpEvent);
            if (this.observationTarget === window) {
                window.removeEventListener('blur', this.onFocusLost);
            } else {
                this.observationTarget.removeEventListener('focusout', this.onFocusLost);
            }
            this.registeredActionCallbacks.clear();
            this.currentlyPressedKeys.clear();
        }
    }

    // --- Global Keyboard Dispatcher Instance (Replaces '$hotkey' service) ---
    const globalKeyboardDispatcher = new KeyboardActionDispatcher(window);

    // --- DOM Scanner for Declarative Key Bindings (Replaces 'hotkey' directive) ---
    // Scans the DOM for specific data attributes to automatically set up hotkey bindings.
    function initializeDeclarativeKeyBindings() {
        const elementsWithBindings = document.querySelectorAll('[data-key-bind], [data-key-action]');

        elementsWithBindings.forEach(domElement => {
            // Determine if the element explicitly requests global binding (like original <hotkey> tag)
            const isGlobalTarget = domElement.nodeName.toLowerCase() === 'global-key-handler';

            let currentElementDispatcher;
            if (isGlobalTarget) {
                currentElementDispatcher = globalKeyboardDispatcher;
            } else {
                // Attach a dispatcher instance directly to the DOM element for local scope.
                // This mimics the 'HotKeysElement' factory creating an instance per element.
                if (!domElement._keyDispatcherInstance) {
                    domElement._keyDispatcherInstance = new KeyboardActionDispatcher(domElement);
                }
                currentElementDispatcher = domElement._keyDispatcherInstance;
            }

            // Process 'data-key-bind' attribute (object of key-expression: handler-string pairs)
            const bindingData = domElement.getAttribute('data-key-bind');
            if (bindingData) {
                let parsedBindings;
                try {
                    // Use new Function for dynamic code execution, mimicking Angular's $parse(string)
                    parsedBindings = (new Function('return ' + bindingData))();
                } catch (e) {
                    console.error('Error parsing data-key-bind JSON for element:', domElement, e);
                    return;
                }

                if (typeof parsedBindings === 'object' && parsedBindings !== null) {
                    Object.keys(parsedBindings).forEach(keyExpression => {
                        const handlerContent = parsedBindings[keyExpression];
                        if (typeof handlerContent === 'function') {
                            currentElementDispatcher.attachAction(keyExpression, handlerContent);
                        } else if (typeof handlerContent === 'string') {
                            try {
                                // Create a function from the string, similar to $parse invoking an expression
                                const dynamicHandlerFn = new Function('eventObject', handlerContent);
                                currentElementDispatcher.attachAction(keyExpression, dynamicHandlerFn);
                            } catch (e) {
                                console.error(`Error creating handler for key "${keyExpression}" from string "${handlerContent}" on element:`, domElement, e);
                            }
                        }
                    });
                }
            }

            // Process 'data-key-action' (single key expression) and 'data-key-handler' (single handler string)
            const singleKeyAction = domElement.getAttribute('data-key-action');
            const singleHandlerSource = domElement.getAttribute('data-key-handler');
            if (singleKeyAction && singleHandlerSource) {
                try {
                    // Create a function from the string, similar to $parse(attrs.invoke)
                    const dynamicHandlerFn = new Function('eventObject', singleHandlerSource);
                    currentElementDispatcher.attachAction(singleKeyAction, dynamicHandlerFn);
                } catch (e) {
                    console.error(`Error creating handler for key "${singleKeyAction}" from string "${singleHandlerSource}" on element:`, domElement, e);
                }
            }
        });
    }

    // --- Bootstrap: Initialize on DOM Ready ---
    // Ensures all HTML elements are loaded before attempting to scan and bind hotkeys.
    document.addEventListener('DOMContentLoaded', initializeDeclarativeKeyBindings);

    // --- Global Exposure (Optional, for programmatic access) ---
    // Provides direct access to the global dispatcher and a re-initialization utility.
    window.mainKeyDispatcher = globalKeyboardDispatcher;
    window.reinitializeKeyBindings = initializeDeclarativeKeyBindings;

})();