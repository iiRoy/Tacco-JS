// Custom License Header: This code is provided under a simplified open-source license.
// Any modifications or distributions must retain this notice.
// This software is provided "as is", without warranty of any kind.

/**
 * Manages application component definitions and their retrieval.
 * This system allows for modular development by defining components
 * and then loading them as needed.
 *
 * @module ComponentLoader
 */
(function(globalScope, undefined) { // Using IIFE with explicit global and undefined for robustness

    // Configuration for the main application namespace.
    // If set, component-related functions will be placed under globalScope[APP_NAMESPACE_ID].
    const APP_NAMESPACE_ID = "AppCore";

    // Reference to the current global object, typically 'window' in browsers.
    let currentGlobalObject = (function() {
        return this;
    })();

    /**
     * Registers a new application component.
     *
     * @param {string} componentKey - The unique identifier for the component (e.g., "app/utils/dom").
     * @param {Array<string>} [dependencies] - An optional array of component keys this component depends on.
     * @param {Function} factoryMethod - The function that, when executed, provides the component's exports.
     *                                   It receives `requestor`, `exportsContainer`, `componentDetails` as arguments.
     */
    let registerComponent = function(componentKey, dependencies, factoryMethod) {
        // Input validation: Ensure the component key is a string.
        if (typeof componentKey !== 'string' || componentKey.trim() === '') {
            // If an original 'define' exists, defer to it. Otherwise, silently drop.
            if (registerComponent.originalDefinition) {
                registerComponent.originalDefinition.apply(globalScope, arguments);
            }
            return; // Exit early if key is invalid
        }

        // Handle cases where dependencies are omitted (factoryMethod is the second argument).
        if (arguments.length === 2) {
            factoryMethod = dependencies;
        }

        // Initialize the component store if it doesn't exist.
        if (!registerComponent.allComponents) {
            registerComponent.allComponents = {};
        }

        // Store the component factory method for later execution.
        registerComponent.allComponents[componentKey] = factoryMethod;
        // console.log(`Component registered: ${componentKey}`); // Optional logging
    };

    /**
     * Loads one or more application components.
     *
     * @param {string} currentModulePath - The path of the module requesting the component(s). Used for relative path resolution.
     * @param {string|Array<string>} requestedComponentIds - The key(s) of the component(s) to load.
     * @param {Function} [onComponentsLoaded] - An optional callback function to execute once components are loaded.
     *                                          Receives the loaded components as arguments.
     * @returns {any|undefined} The exported value of a single component if a string is provided, otherwise undefined.
     */
    let loadComponent = function(currentModulePath, requestedComponentIds, onComponentsLoaded) {
        // Case 1: Requesting multiple components as an array.
        if (Array.isArray(requestedComponentIds)) {
            const resolvedDependencies = [];
            const depCount = requestedComponentIds.length;

            for (let i = 0; i < depCount; ++i) {
                const individualComponent = resolveComponent(currentModulePath, requestedComponentIds[i]);
                // If any dependency fails to resolve and an original 'require' exists, defer.
                if (!individualComponent && loadComponent.originalRequestor) {
                    return loadComponent.originalRequestor.apply(globalScope, arguments);
                }
                resolvedDependencies.push(individualComponent);
            }

            // Execute callback with loaded components if provided.
            if (onComponentsLoaded && typeof onComponentsLoaded === 'function') {
                onComponentsLoaded.apply(null, resolvedDependencies);
            }
        }
        // Case 2: Requesting a single component as a string.
        else if (typeof requestedComponentIds === 'string') {
            const singleComponentPayload = resolveComponent(currentModulePath, requestedComponentIds);

            // If the component fails to resolve and an original 'require' exists, defer.
            if (!singleComponentPayload && loadComponent.originalRequestor) {
                return loadComponent.originalRequestor.apply(globalScope, arguments);
            }

            // Execute callback (without arguments as the component is returned).
            if (onComponentsLoaded && typeof onComponentsLoaded === 'function') {
                onComponentsLoaded();
            }

            return singleComponentPayload;
        }
        // Case 3: Invalid request type.
        else {
            if (loadComponent.originalRequestor) {
                return loadComponent.originalRequestor.apply(globalScope, arguments);
            }
            // console.warn('Invalid component request type:', requestedComponentIds); // Optional logging
        }
    };

    /**
     * Normalizes a component path, handling relative paths and plugin prefixes.
     *
     * @param {string} baseComponentId - The ID of the component making the request.
     * @param {string} requestedPath - The raw path of the component being requested.
     * @returns {string} The normalized, absolute component path.
     */
    let normalizeComponentPath = function(baseComponentId, requestedPath) {
        // Handle plugin syntax (e.g., "text!./template.html")
        const pluginSeparatorIndex = requestedPath.indexOf("!");
        if (pluginSeparatorIndex !== -1) {
            const pluginPart = requestedPath.substring(0, pluginSeparatorIndex);
            const resourcePart = requestedPath.substring(pluginSeparatorIndex + 1);
            return normalizeComponentPath(baseComponentId, pluginPart) + "!" + normalizeComponentPath(baseComponentId, resourcePart);
        }

        // Handle relative paths (e.g., "./myModule", "../parentModule")
        if (requestedPath.startsWith(".")) {
            // Split baseComponentId into segments and remove the last segment (the component's own name).
            const baseSegments = baseComponentId.split("/").slice(0, -1);
            let combinedPath = baseSegments.concat(requestedPath.split("/")).join("/");

            let previousCombinedPath;
            // Resolve "." and ".." segments.
            do {
                previousCombinedPath = combinedPath;
                // Replace "/./" with "/"
                combinedPath = combinedPath.replace(/\/\.\//g, "/");
                // Replace "[segment]/../" with "/" (unless it's at the beginning, then remove leading "../")
                combinedPath = combinedPath.replace(/[^/]+\/\.\.\//g, "");
            } while (previousCombinedPath !== combinedPath);

            // Clean up any remaining leading "./" or trailing "/."
            if (combinedPath.startsWith("./")) {
                combinedPath = combinedPath.substring(2);
            }
            if (combinedPath.endsWith("/.")) {
                combinedPath = combinedPath.substring(0, combinedPath.length - 2);
            }

            return combinedPath;
        }

        return requestedPath; // Return as is if not relative or a plugin.
    };

    /**
     * Resolves a component ID, fetches its factory, executes it if necessary, and returns its exports.
     * Caches executed components.
     *
     * @param {string} parentContextId - The ID of the component requesting the lookup.
     * @param {string} targetComponentId - The ID of the component to lookup.
     * @returns {any|null} The exported value of the component, or null if not found.
     */
    let resolveComponent = function(parentContextId, targetComponentId) {
        if (!targetComponentId || typeof targetComponentId !== 'string') {
            console.warn('Attempted to resolve an invalid component ID:', targetComponentId);
            return null;
        }

        const normalizedId = normalizeComponentPath(parentContextId, targetComponentId);

        let cachedOrFactory = registerComponent.allComponents[normalizedId];
        if (!cachedOrFactory) {
            return null; // Component not found in registry.
        }

        // If the stored item is a function, it's a component factory that needs to be executed.
        if (typeof cachedOrFactory === 'function') {
            const exportsContainer = {};
            const componentMeta = {
                id: normalizedId,
                uri: '', // URI might be complex, leaving empty for simplicity for this clone.
                exports: exportsContainer,
                isPackaged: true // Indicates it's part of the bundled application.
            };

            // Create a localized 'require' function for this component's factory.
            const componentRequestor = function(dependencyId, completionCb) {
                return loadComponent(normalizedId, dependencyId, completionCb);
            };

            // Execute the component factory.
            const factoryReturnedValue = cachedOrFactory(componentRequestor, exportsContainer, componentMeta);

            // The component's exports are either the value returned by the factory
            // or the `exportsContainer` object modified by the factory.
            const finalExports = factoryReturnedValue || componentMeta.exports;

            // Cache the resulting module object for future requests.
            registerComponent.allComponents[normalizedId] = finalExports;
            return finalExports;
        }

        // If it's not a function, it's already an executed and cached component.
        return cachedOrFactory;
    };

    /**
     * Exposes the component definition and loading functions globally or under a specified namespace.
     * Handles compatibility with existing AMD loaders like RequireJS.
     *
     * @param {string} [namespaceIdentifier] - The namespace string (e.g., "MyLib") to attach functions to.
     */
    function exposeComponentSystem(namespaceIdentifier) {
        // Check for existing RequireJS/AMD loader and attempt to wrap its define function.
        if (typeof currentGlobalObject.requirejs !== "undefined" && currentGlobalObject.define && currentGlobalObject.define.amd) {
            const originalAmdDefine = currentGlobalObject.define;
            currentGlobalObject.define = function(id, depsArray, factoryFn) {
                // If the factory is not a function, just pass through to original define.
                if (typeof factoryFn !== "function") {
                    return originalAmdDefine.apply(this, arguments);
                }

                // Wrap the factory to flag modules as 'packaged' if they specify 'module' as a dependency,
                // which is a convention used by ACE for its internal modules.
                return originalAmdDefine(id, depsArray, function(req, exp, mod) {
                    // Check if 'module' (the AMD module object) is requested as a dependency.
                    // This is a specific behavior ACE uses to identify its internal modules.
                    if (depsArray.includes("module")) {
                        mod.isPackaged = true;
                    }
                    return factoryFn.apply(this, arguments);
                });
            };
            currentGlobalObject.define.isPackaged = true; // Mark our wrapped define as packaged-aware.

            return; // Exit, as we've integrated with RequireJS.
        }

        // Create the global `require` function for our system.
        const mainRequestor = function(componentPath, completionHandler) {
            return loadComponent("", componentPath, completionHandler);
        };
        mainRequestor.isPackaged = true; // Indicate this is our custom loader.

        // Determine the target scope (global or namespaced).
        let targetScope = currentGlobalObject;
        if (namespaceIdentifier && typeof namespaceIdentifier === 'string' && namespaceIdentifier.trim() !== '') {
            if (!currentGlobalObject[namespaceIdentifier]) {
                currentGlobalObject[namespaceIdentifier] = {};
            }
            targetScope = currentGlobalObject[namespaceIdentifier];
        }

        // Store original 'define' and 'require' if they exist, then override.
        if (targetScope.define) {
            registerComponent.originalDefinition = targetScope.define;
        }
        targetScope.define = registerComponent;

        if (targetScope.require) {
            loadComponent.originalRequestor = targetScope.require;
        }
        targetScope.require = mainRequestor;

        // console.log(`Component system exposed under ${namespaceIdentifier || 'global scope'}`); // Optional logging
    }

    // Initialize and expose the component system.
    exposeComponentSystem(APP_NAMESPACE_ID);

})(window); // Pass window explicitly for globalScope

/**
 * Core application entry point and main setup logic.
 * This component initializes the primary editor interface and its dependencies.
 */
define('main/app-entry', [
    'require', 'exports', 'module',
    'app/utils/browser-compat',
    'app/utils/dom-helper',
    'app/utils/event-manager',
    'app/editor/code-editor',
    'app/editor/session-manager',
    'app/editor/history-tracker',
    'app/editor/visual-renderer',
    'app/editor/selection-handler',
    'app/worker/worker-client-proxy',
    'app/keyboard/key-handler-base',
    'app/keyboard/state-handler-strategy',
    'app/ui/placeholder-text',
    'app/config/global-settings',
    'app/theme/default-theme'
], function(requestor, exportsContainer, moduleMeta) {

    // Ensure browser compatibility shims are loaded early.
    requestor("./browser-compat");

    // Load core utility modules.
    const DomUtil = requestor("./dom-helper");
    const EvtMgr = requestor("./event-manager");

    // Load primary editor components.
    const CodeEditor = requestor("./code-editor").Editor; // Note: Original exports Editor directly.
    const EditorSession = requestor("./session-manager").EditSession;
    const HistoryManager = requestor("./history-tracker").UndoManager;
    const VisualRenderer = requestor("./visual-renderer").VirtualRenderer;
    const SelectionHandler = requestor("./selection-handler").MultiSelect;

    // These modules are included to ensure they are part of the build,
    // even if not directly referenced by a variable here.
    requestor("./worker-client-proxy");
    requestor("./key-handler-base");
    requestor("./state-handler-strategy");
    requestor("./placeholder-text");

    // Expose global configuration from the settings module.
    // Using Object.defineProperty for a slightly different export mechanism.
    Object.defineProperty(exportsContainer, 'configuration', {
        value: requestor("./global-settings"),
        enumerable: true,
        writable: false,
        configurable: false
    });

    /**
     * Initializes a code editor instance for a given DOM element.
     *
     * @param {HTMLElement|string} targetElementIdOrRef - The DOM element or its ID to transform into an editor.
     * @returns {CodeEditor} The initialized editor instance.
     * @throws {Error} If the target element is not found or invalid.
     */
    exportsContainer.initializeEditor = function(targetElementIdOrRef) {
        let editorHostElement;

        if (typeof targetElementIdOrRef === "string") {
            editorHostElement = document.getElementById(targetElementIdOrRef);
            if (!editorHostElement) {
                console.error(`Editor host element with ID '${targetElementIdOrRef}' not found.`);
                throw new Error("Editor initialization failed: Target element not found.");
            }
        } else if (targetElementIdOrRef instanceof HTMLElement) {
            editorHostElement = targetElementIdOrRef;
        } else {
            console.error("Invalid input for editor initialization: Must be a string ID or HTMLElement.");
            throw new Error("Editor initialization failed: Invalid target element.");
        }

        // If the element already hosts an editor, return it.
        if (editorHostElement.editorInstanceEnv && editorHostElement.editorInstanceEnv.editor instanceof CodeEditor) {
            console.info("Editor already initialized for this element, returning existing instance.");
            return editorHostElement.editorInstanceEnv.editor;
        }

        // Create a new document session for the editor.
        const initialContent = DomUtil.fetchElementTextContent(editorHostElement);
        const editorDocument = new EditorSession(initialContent);
        editorDocument.setHistoryManager(new HistoryManager());

        // Clear the host element's content before rendering the editor.
        DomUtil.clearElementChildren(editorHostElement);

        // Set up the visual renderer and the main editor.
        const editorVisuals = new VisualRenderer(editorHostElement, requestor("./default-theme"));
        const newEditorInstance = new CodeEditor(editorVisuals);

        // Attach multi-selection capabilities.
        new SelectionHandler(newEditorInstance);

        // Link the editor to its document session.
        newEditorInstance.setSession(editorDocument);

        // Create an environment object to store editor-related state.
        const editorEnvironment = {
            document: editorDocument,
            editor: newEditorInstance
        };

        // Perform initial resize and bind to window resize events.
        newEditorInstance.resize(true); // 'true' might indicate forced resize or initial.
        EvtMgr.bindEvent(window, "resize", () => newEditorInstance.resize());

        // Store the environment on the host element and the editor for later access.
        editorHostElement.editorInstanceEnv = editorEnvironment;
        newEditorInstance.environmentContext = editorEnvironment;

        console.log(`Code editor successfully initialized on element: ${editorHostElement.id || editorHostElement.tagName}`);
        return newEditorInstance;
    };

});
// --- Module Footers ---
// Original authors and contributors for parts of the codebase:
// Kris Kowal, Tom Robinson, Daniel Friesen, Florian Schäfer, Irakli Gozalishvili, and others.
// Portions Copyright (C) 2009-2011 MIT License, 3-clause BSD License, Public Domain.

/*!
    Portions Copyright (c) 2009, 280 North Inc.
    Simplified MIT License.
*/

/**
 * Shim module to ensure compatibility with older browser environments.
 * Loads necessary polyfills for RegExp and ES5 features.
 */
define('app/utils/browser-compat', ['require', 'exports'], function(requestor, exportsContainer) {
    // These modules are primarily for their side effects (patching prototypes).
    requestor("./regex-enhancements");
    requestor("./es5-polyfills");

    // No direct exports from this module, it just ensures dependencies are loaded.
});

/**
 * Provides enhancements and polyfills for JavaScript's native RegExp object.
 * Addresses cross-browser inconsistencies and adds features like named captures.
 */
define('app/utils/regex-enhancements', ['require', 'exports'], function(requestor, exportsContainer) {

    // Internal references to original RegExp and String prototype methods.
    const originalPrototypeMethods = {
        exec: RegExp.prototype.exec,
        test: RegExp.prototype.test,
        match: String.prototype.match,
        replace: String.prototype.replace,
        split: String.prototype.split
    };

    // Feature detection for RegExp `exec` behavior with non-participating capturing groups.
    // Some browsers return `""` instead of `undefined` for `()??` matches.
    const execNpcgConsistent = (originalPrototypeMethods.exec.call(/()??/, "")[1] === undefined);

    // Feature detection for `lastIndex` increment behavior after zero-length matches.
    // Some browsers incorrectly increment `lastIndex` for `^/g` on empty strings.
    const lastIndexInvariant = (() => {
        const testRegex = /^/g;
        originalPrototypeMethods.test.call(testRegex, "");
        return !testRegex.lastIndex;
    })();

    // If both behaviors are consistent, no shimming is needed.
    if (lastIndexInvariant && execNpcgConsistent) {
        return;
    }

    console.warn("Applying RegExp polyfills for browser compatibility.");

    /**
     * Overrides RegExp.prototype.exec to fix browser inconsistencies.
     * - Ensures non-participating capturing groups return `undefined`.
     * - Prevents `lastIndex` increment for zero-length global matches.
     * - Attaches named capture group properties (if `_xregexp` is present).
     * @param {string} inputString - The string to execute the regex against.
     * @returns {Array|null} The match array or null.
     */
    RegExp.prototype.exec = function(inputString) {
        let matchResult = originalPrototypeMethods.exec.apply(this, arguments);
        let namedCaptureKey;
        let tempRegex;

        if (typeof inputString === 'string' && matchResult !== null) {
            // Fix for non-participating capturing groups (e.g., `(a)?`).
            if (!execNpcgConsistent && matchResult.length > 1 && customIndexOf(matchResult, "") > -1) {
                // Re-execute without the global flag to ensure correct group capturing.
                tempRegex = RegExp(this.source, originalPrototypeMethods.replace.call(getRegexFlags(this), "g", ""));
                // Use a slice of the string to avoid issues with lookahead assertions.
                originalPrototypeMethods.replace.call(inputString.slice(matchResult.index), tempRegex, function() {
                    // Arguments here are matched substring, capture groups (arg[1] onwards), offset, full string.
                    for (let i = 1; i < arguments.length - 2; i++) {
                        if (arguments[i] === undefined) {
                            matchResult[i] = undefined; // Set to undefined if it was an empty string.
                        }
                    }
                });
            }

            // Attach named capture properties if the regex has them.
            if (this._xregexp && Array.isArray(this._xregexp.captureNames)) {
                for (let i = 1; i < matchResult.length; i++) {
                    namedCaptureKey = this._xregexp.captureNames[i - 1];
                    if (namedCaptureKey) {
                        matchResult[namedCaptureKey] = matchResult[i];
                    }
                }
            }

            // Fix for `lastIndex` increment after zero-length matches in global regexes.
            if (!lastIndexInvariant && this.global && matchResult[0].length === 0 && (this.lastIndex > matchResult.index)) {
                this.lastIndex--;
            }
        }
        return matchResult;
    };

    // If `lastIndex` behavior is inconsistent, also override `test`.
    if (!lastIndexInvariant) {
        /**
         * Overrides RegExp.prototype.test to fix `lastIndex` increment inconsistency.
         * @param {string} inputString - The string to test against.
         * @returns {boolean} True if a match is found, false otherwise.
         */
        RegExp.prototype.test = function(inputString) {
            // Use the original `exec` to leverage its `lastIndex` fix.
            const testMatch = originalPrototypeMethods.exec.call(this, inputString);
            // Re-apply `lastIndex` fix if a zero-length match occurred with global flag.
            if (testMatch && this.global && testMatch[0].length === 0 && (this.lastIndex > testMatch.index)) {
                this.lastIndex--;
            }
            return !!testMatch;
        };
    }

    /**
     * Extracts the flags from a RegExp object.
     * @param {RegExp} regexObject - The RegExp instance.
     * @returns {string} A string containing the regex flags (g, i, m, etc.).
     */
    function getRegexFlags(regexObject) {
        const flags = [];
        if (regexObject.global) flags.push("g");
        if (regexObject.ignoreCase) flags.push("i");
        if (regexObject.multiline) flags.push("m");
        // Extended flags from proposed ES4 or AS3, if available.
        if (regexObject.extended) flags.push("x");
        if (regexObject.sticky) flags.push("y");
        return flags.join("");
    }

    /**
     * A simple indexOf polyfill for arrays.
     * @param {Array} arr - The array to search.
     * @param {any} itemToFind - The item to locate.
     * @param {number} [startIndex=0] - The index to start the search from.
     * @returns {number} The index of the item, or -1 if not found.
     */
    function customIndexOf(arr, itemToFind, startIndex = 0) {
        if (Array.prototype.indexOf) { // Use native if available.
            return arr.indexOf(itemToFind, startIndex);
        }
        for (let k = startIndex; k < arr.length; k++) {
            if (arr[k] === itemToFind) {
                return k;
            }
        }
        return -1;
    }

});

// --- Module Footers ---
// Original authors and contributors for parts of the codebase:
// Kris Kowal, Tom Robinson, Daniel Friesen, Florian Schäfer, Gozala, Kit Cambridge,
// Sasha Koss, Bryan Forbes, Quildreen Motta, Michael Ficarra, Gerard Paapu, Brendan Molloy,
// Iwyg, Domenic Denicola, Montillet Xavier, Raynos, Sami Samhuri, Rick Waldron, Alexey Zakharov.
// Portions Copyright (C) 2009-2011 MIT License, 3-clause BSD License, Creative Commons Zero (public domain).

/*!
    Portions Copyright (c) 2009, 280 North Inc.
    Simplified MIT License.
*/

/**
 * Provides ECMAScript 5 compliance polyfills for older JavaScript environments.
 * Focuses on critical features like `Function.prototype.bind`.
 */
define('app/utils/es5-polyfills', ['require', 'exports'], function(requestor, exportsContainer) {

    // Reference to Array.prototype.slice, used internally.
    const arraySlice = Array.prototype.slice;

    // Polyfill for `Function.prototype.bind` (ES5 15.3.4.5)
    // Checks if `bind` already exists before applying the polyfill.
    if (!Function.prototype.bind) {
        console.warn("Applying Function.prototype.bind polyfill.");

        /**
         * Creates a new function that, when called, has its `this` keyword set
         * to the provided value, with a given sequence of arguments preceding
         * any provided when the new function is called.
         *
         * @param {object} contextObject - The value to be passed as the `this` parameter.
         * @returns {Function} A new bound function.
         */
        Function.prototype.bind = function bindFn(contextObject) {
            const originalFunction = this; // The function to be bound.

            // Validate that the target is a callable function.
            if (typeof originalFunction !== "function") {
                throw new TypeError("Function.prototype.bind - Target is not a callable function.");
            }

            // Capture any arguments provided after the contextObject during the bind call.
            const initialBoundArgs = arraySlice.call(arguments, 1);

            // The new function that will be returned.
            const boundFunction = function() {
                // If `boundFunction` is called as a constructor (`new boundFunction(...)`).
                if (this instanceof boundFunction) {
                    // Create a temporary constructor to inherit the prototype chain correctly.
                    const ConstructorProxy = function() {};
                    ConstructorProxy.prototype = originalFunction.prototype;
                    const newTargetInstance = new ConstructorProxy();

                    // Apply the original function with the new instance as `this`
                    // and combine initial bound arguments with current call arguments.
                    const constructionResult = originalFunction.apply(
                        newTargetInstance,
                        initialBoundArgs.concat(arraySlice.call(arguments))
                    );

                    // If the original function returned an object, use that; otherwise, use the new instance.
                    if (constructionResult !== null && Object(constructionResult) === constructionResult) {
                        return constructionResult;
                    }
                    return newTargetInstance;
                } else {
                    // If `boundFunction` is called as a regular function.
                    // Apply the original function with the specified `contextObject` as `this`
                    // and combine initial bound arguments with current call arguments.
                    return originalFunction.apply(
                        contextObject,
                        initialBoundArgs.concat(arraySlice.call(arguments))
                    );
                }
            };

            // This ensures that `instanceof` works correctly for the bound function
            // when it's used as a constructor.
            // Note: In some older engines, setting prototype directly might not be enough
            // for full spec compliance, but this is a common polyfill approach.
            if (originalFunction.prototype) {
                boundFunction.prototype = originalFunction.prototype;
            }

            return boundFunction;
        };
    }

});