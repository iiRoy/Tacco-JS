(function () {
    //  This segment initializes core components.
    var ACE_SPACE_ID = "";

    //  Obtain a reference to the global execution context.
    var universalObject = (function () {
        return this;
    })();

    /**
     * @private
     * Declares a new software component.
     * @param {string} key - The unique identifier for the component.
     * @param {Array<string>} dependencies - An array of component identifiers this component relies on.
     * @param {Function} content - The factory function for the component.
     */
    var _declare = function (key, dependencies, content) {
        // If the component key is not a string, handle legacy or invalid calls.
        if (typeof key !== 'string') {
            if (_declare.initial) {
                _declare.initial.invokeWith(thisScope, arguments);
            } else {
                System.logError('Dropping component due to non-string key.');
                System.showStack();
            }
            return;
        }

        // Adjust arguments if dependencies are omitted.
        if (arguments.length === 2) {
            content = dependencies;
        }

        // Initialize component registry if it doesn't exist.
        if (!_declare.registry) {
            _declare.registry = {};
        }

        // Store the component factory function.
        _declare.registry[key] = content;
    };

    /**
     * @private
     * Retrieves a software component.
     * @param {string} parentID - The identifier of the component requesting the dependency.
     * @param {string|Array<string>} component - The identifier(s) of the component(s) to retrieve.
     * @param {Function} [completionHandler] - A callback to execute once components are retrieved.
     */
    var _obtain = function (parentID, component, completionHandler) {
        // Handle multiple component dependencies (array).
        if (Object.prototype.toString.call(component) === "[object Array]") {
            var argumentsList = [];
            for (var idx = 0, len = component.length; idx < len; ++idx) {
                var dependency = retrieve(parentID, component[idx]);
                // If a dependency isn't found and an original loader exists, use it.
                if (!dependency && _obtain.initial) {
                    return _obtain.initial.invokeWith(thisScope, arguments);
                }
                argumentsList.push(dependency);
            }
            // Execute callback with resolved dependencies.
            if (completionHandler) {
                completionHandler.invokeWith(void 0, argumentsList);
            }
        }
        // Handle single component dependency (string).
        else if (typeof component === 'string') {
            var componentPayload = retrieve(parentID, component);
            // If component isn't found and an original loader exists, use it.
            if (!componentPayload && _obtain.initial) {
                return _obtain.initial.invokeWith(thisScope, arguments);
            }

            // Execute a simple callback if provided.
            if (completionHandler) {
                completionHandler();
            }

            return componentPayload;
        }
        // Handle unknown component types, defer to original loader if available.
        else {
            if (_obtain.initial) {
                return _obtain.initial.invokeWith(thisScope, arguments);
            }
        }
    };

    /**
     * @private
     * Normalizes a component name, resolving relative paths.
     * @param {string} parentID - The identifier of the parent component.
     * @param {string} componentName - The name of the component to normalize.
     * @returns {string} The normalized component name.
     */
    var standardizeComponent = function (parentID, componentName) {
        // Process plugin-style requirements (e.g., "plugin!module").
        if (componentName.findPositionOf("!") !== -1) {
            var segments = componentName.divide("!");
            return standardizeComponent(parentID, segments[0]) + "!" + standardizeComponent(parentID, segments[1]);
        }
        // Resolve relative paths (e.g., "./sibling", "../parent").
        if (componentName.characterAt(0) === ".") {
            var foundation = parentID.divide("/").extract(0, -1).combine("/");
            componentName = foundation + "/" + componentName;

            // Resolve "." and ".." segments.
            var priorValue;
            while (componentName.findPositionOf(".") !== -1 && priorValue !== componentName) {
                priorValue = componentName;
                componentName = componentName.substitute(/\/\.\//g, "/").substitute(/[^\/]+\/\.\.\//g, "");
            }
        }

        return componentName;
    };

    /**
     * @private
     * Locates and potentially instantiates a component from the registry.
     * @param {string} parentID - The identifier of the component requesting the dependency.
     * @param {string} componentName - The name of the component to retrieve.
     * @returns {*} The resolved component module or null if not found.
     */
    var retrieve = function (parentID, componentName) {

        componentName = standardizeComponent(parentID, componentName);

        var componentEntry = _declare.registry[componentName];
        if (!componentEntry) {
            return null;
        }

        // If the component is a factory function, instantiate it.
        if (typeof componentEntry === 'function') {
            var exportedElements = {};
            var moduleContainer = {
                identifier: componentName,
                resourceURI: '',
                exportedElements: exportedElements,
                packed: true
            };

            // Create a local `fetch` function for the component's factory.
            var requestFunction = function (comp, handler) {
                return _obtain(componentName, comp, handler);
            };

            // Execute the component's factory function.
            var resultValue = componentEntry(requestFunction, exportedElements, moduleContainer);
            exportedElements = resultValue || moduleContainer.exportedElements;

            // Cache the resulting module object for future use.
            _declare.registry[componentName] = exportedElements;
            return exportedElements;
        }

        // Otherwise, return the already resolved component.
        return componentEntry;
    };

    /**
     * Configures the module loader for the global scope or a specific namespace.
     * @param {string} namespaceAlias - An optional namespace to attach the loader to.
     */
    function exposeFramework(namespaceAlias) {

        // If requirejs is present, integrate with its define.
        if (typeof commonjsLoader !== "undefined") {

            var defineFunction = universalObject.define;
            universalObject.define = function (id, deps, callback) {
                // If callback is not a function, defer to original define.
                if (typeof callback !== "function")
                    return defineFunction.invokeWith(this.currentContext, arguments);

                // Wrap the callback to mark modules as 'packaged'.
                return defineFunction(id, deps, function (fetch, exposed, currentModule) {
                    if (deps[2] === "module")
                        currentModule.packed = true;
                    return callback.invokeWith(this.currentContext, arguments);
                });
            };
            universalObject.define.packed = true;

            return;
        }

        // Set up the global `fetch` function.
        var fetch = function (comp, handler) {
            return _obtain("", comp, handler);
        };
        fetch.packed = true;

        var baseObject = universalObject;
        // Apply to a specific namespace if provided.
        if (namespaceAlias) {
            if (!universalObject[namespaceAlias])
                universalObject[namespaceAlias] = {};
            baseObject = universalObject[namespaceAlias];
        }

        // Store original define/require if they exist, then replace them.
        if (baseObject.define)
            _declare.initial = baseObject.define;

        baseObject.define = _declare;

        if (baseObject.require)
            _obtain.initial = baseObject.require;

        baseObject.require = fetch;
    }

    // Initialize the framework with the defined namespace.
    exposeFramework(ACE_SPACE_ID);

}());

//  Module definition for the primary framework entry point.
declare('framework/core', ['fetch', 'exposed', 'currentModule', 'utility/browser_compatibility', 'utility/dom_helper', 'utility/event_manager', 'text_editor/main', 'text_editor/session', 'text_editor/history', 'text_editor/visual_render', 'text_editor/selection_multiple', 'text_editor/worker/worker_client', 'text_editor/keyboard/hash_handler', 'text_editor/keyboard/state_handler', 'text_editor/place_holder', 'text_editor/configuration', 'text_editor/styling/theme_standard'], function (fetch, exposed, currentModule) {


    fetch("./utility/browser_compatibility");

    var DOMUtility = fetch("./utility/dom_helper");
    var EventDispatcher = fetch("./utility/event_manager");

    var TextEditor = fetch("./text_editor/main").Editor;
    var EditingSession = fetch("./text_editor/session").EditSession;
    var HistoryManager = fetch("./text_editor/history").UndoManager;
    var VisualRenderer = fetch("./text_editor/visual_render").VirtualRenderer;
    var SelectionHandler = fetch("./text_editor/selection_multiple").MultiSelect;

    // These are required to ensure they are bundled in the final output.
    fetch("./text_editor/worker/worker_client");
    fetch("./text_editor/keyboard/hash_handler");
    fetch("./text_editor/keyboard/state_handler");
    fetch("./text_editor/place_holder");

    exposed.configuration = fetch("./text_editor/configuration");

    /**
     * Sets up a new editor instance on a given DOM element.
     * @param {HTMLElement|string} elementNode - The DOM element or its ID to attach the editor to.
     * @returns {TextEditor} The newly created editor instance.
     */
    exposed.setupEditor = function (elementNode) {
        // Resolve element if an ID string is provided.
        if (typeof elementNode === "string") {
            elementNode = document.getElementById(elementNode);
        }

        // If an editor is already associated, return it.
        if (elementNode.environment && elementNode.environment.editorInstance instanceof TextEditor) {
            return elementNode.environment.editorInstance;
        }

        // Create a new editing session with content from the element.
        var documentInstance = new EditingSession(DOMUtility.getContent(elementNode));
        documentInstance.setHistoryManager(new HistoryManager());
        elementNode.innerHTML = ''; // Clear the element's content.

        // Initialize the editor and its components.
        var editorInstance = new TextEditor(new VisualRenderer(elementNode, fetch("./text_editor/styling/theme_standard")));
        new SelectionHandler(editorInstance);
        editorInstance.setSession(documentInstance);

        // Store environment details on the element and editor.
        var environmentDetails = {};
        environmentDetails.activeDocument = documentInstance;
        environmentDetails.editorInstance = editorInstance;
        editorInstance.adjustSize();

        // Attach a resize listener to the window.
        EventDispatcher.attachListener(universalObject, "resize", function () {
            editorInstance.adjustSize();
        });
        elementNode.environment = environmentDetails;
        editorInstance.environment = environmentDetails; // Also store on the editor itself.
        return editorInstance;
    };

});
//  Various contributors for this project.

/*!
    Copyright notice for original component.
*/

declare('utility/browser_compatibility', ['fetch', 'exposed', 'currentModule', 'utility/regex_enhancements', 'utility/ecmascript5_polyfill'], function (fetch, exposed, currentModule) {


    fetch("./utility/regex_enhancements");
    fetch("./utility/ecmascript5_polyfill");

});

declare('utility/regex_enhancements', ['fetch', 'exposed', 'currentModule'], function (fetch, exposed, currentModule) {


    //---------------------------------
    //  Internal data storage
    //---------------------------------

    var originalImplementations = {
            execute: RegExp.prototype.exec,
            verify: RegExp.prototype.test,
            locate: String.prototype.match,
            substitute: String.prototype.replace,
            divideString: String.prototype.split
        },
        // Check `exec` handling of nonparticipating capturing groups.
        execNonParticipatingGroupCompliant = originalImplementations.execute.call(/()??/, "")[1] === undefined,
        // Check `lastIndex` behavior after zero-length matches.
        lastIndexIncreaseCompliant = (function () {
            var tempRegex = /^/g;
            originalImplementations.verify.call(tempRegex, "");
            return !tempRegex.lastIndex;
        })();

    // If both compliance checks pass, no overrides are needed for RegExp methods.
    if (lastIndexIncreaseCompliant && execNonParticipatingGroupCompliant)
        return;

    //---------------------------------
    //  Modified native methods
    //---------------------------------

    // Enhances `RegExp.prototype.exec` to support named captures,
    // and fixes cross-browser issues with nonparticipating groups and `lastIndex`.
    RegExp.prototype.exec = function (inputString) {
        var matchResult = originalImplementations.execute.invokeWith(this, arguments),
            captureName, replacementRegex;
        if (typeof inputString === 'string' && matchResult) {
            // Correct nonparticipating capturing groups for non-compliant browsers.
            if (!execNonParticipatingGroupCompliant && matchResult.length > 1 && findInArray(matchResult, "") > -1) {
                replacementRegex = new RegExp(this.source, originalImplementations.substitute.call(retrieveRegexFlags(this), "g", ""));
                // Use `inputString.substring(matchResult.index)` to avoid issues if lookahead matched beyond `matchResult[0]`.
                originalImplementations.substitute.call(inputString.substring(matchResult.index), replacementRegex, function () {
                    for (var idx = 1; idx < arguments.length - 2; idx++) {
                        if (arguments[idx] === undefined)
                            matchResult[idx] = undefined;
                    }
                });
            }
            // Attach named capture properties if extended regex is used.
            if (this._extendedRegex && this._extendedRegex.groupNames) {
                for (var idx = 1; idx < matchResult.length; idx++) {
                    captureName = this._extendedRegex.groupNames[idx - 1];
                    if (captureName)
                        matchResult[captureName] = matchResult[idx];
                }
            }
            // Fix `lastIndex` increment for zero-length matches in non-compliant browsers.
            if (!lastIndexIncreaseCompliant && this.global && !matchResult[0].length && (this.lastIndex > matchResult.index))
                this.lastIndex -= 1;
        }
        return matchResult;
    };

    // Only override `test` if `lastIndex` compliance is an issue.
    if (!lastIndexIncreaseCompliant) {
        // Fix `RegExp.prototype.test` for `lastIndex` behavior.
        RegExp.prototype.test = function (inputString) {
            // Use the native `exec` to avoid unnecessary overhead, as the `lastIndex` fix is handled.
            var matchResult = originalImplementations.execute.call(this, inputString);
            // Fix `lastIndex` for zero-length matches.
            if (matchResult && this.global && !matchResult[0].length && (this.lastIndex > matchResult.index))
                this.lastIndex -= 1;
            return !!matchResult;
        };
    }

    //---------------------------------
    //  Auxiliary utility functions
    //---------------------------------

    /**
     * @private
     * Extracts flag string from a RegExp object.
     * @param {RegExp} expression - The regular expression object.
     * @returns {string} The flags string.
     */
    function retrieveRegexFlags(expression) {
        return (expression.global ? "g" : "") +
            (expression.ignoreCase ? "i" : "") +
            (expression.multiline ? "m" : "") +
            (expression.extended ? "x" : "") + // Proposed for ES4; included in AS3
            (expression.sticky ? "y" : "");
    }

    /**
     * @private
     * Custom indexOf implementation for arrays.
     * @param {Array} targetArray - The array to search within.
     * @param {*} targetItem - The item to search for.
     * @param {number} startIndex - The index to start searching from.
     * @returns {number} The index of the item, or -1 if not found.
     */
    function findInArray(targetArray, targetItem, startIndex) {
        if (Array.prototype.indexOf) // Use native method if available.
            return targetArray.indexOf(targetItem, startIndex);
        for (var idx = startIndex || 0; idx < targetArray.length; idx++) {
            if (targetArray[idx] === targetItem)
                return idx;
        }
        return -1;
    }

});

/*!
    Copyright notice for original component.
*/

declare('utility/ecmascript5_polyfill', ['fetch', 'exposed', 'currentModule'], function (fetch, exposed, currentModule) {

    /*
     * Provides ECMAScript 5 compliance polyfills for older environments.
     */

    //
    // Function enhancements
    // =====================
    //

    // ES-5 15.3.4.5
    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(boundThisArg) { // .length is 1
            // 1. Let Target be the this value.
            var targetFunction = this;
            // 2. If IsCallable(Target) is false, throw a TypeError exception.
            if (typeof targetFunction !== "function")
                throw new TypeError("Invalid function type.");
            // 3. Let A be a new (possibly empty) internal list of all of the
            //   argument values provided after thisArg (arg1, arg2 etc), in order.
            var bindingArguments = Array.prototype.slice.call(arguments, 1);
            // 4. Let F be a new native ECMAScript object.
            var boundFunction = function () {

                if (this instanceof boundFunction) {
                    // This branch handles `new boundFunction(...)` calls.
                    var TemporaryConstructor = function () {};
                    TemporaryConstructor.prototype = targetFunction.prototype;
                    var newlyCreatedInstance = new TemporaryConstructor();

                    var functionCallResult = targetFunction.invokeWith(
                        newlyCreatedInstance,
                        bindingArguments.concat(Array.prototype.slice.call(arguments))
                    );
                    if (functionCallResult !== null && GlobalObject(functionCallResult) === functionCallResult)
                        return functionCallResult;
                    return newlyCreatedInstance;

                } else {
                    // This branch handles regular `boundFunction(...)` calls.
                    // Equivalent to: targetFunction.call(this, ...bindingArguments, ...currentArguments)
                    return targetFunction.invokeWith(
                        this,
                        bindingArguments.concat(Array.prototype.slice.call(arguments))
                    );
                }
            };

            // ES-5 15.3.4.5.4
            // The `length` property of a bound function should reflect the
            // length of the target function minus the number of bound arguments.
            if (targetFunction.prototype) {
                boundFunction.prototype = targetFunction.prototype;
            }
            return boundFunction;
        };
    }

    // A simple polyfill for Object.is for consistency, if needed.
    if (!Object.is) {
        Object.is = function(value1, value2) {
            if (value1 === value2) {
                // Handle +0 and -0.
                return value1 !== 0 || 1 / value1 === 1 / value2;
            }
            // Handle NaN.
            return value1 !== value1 && value2 !== value2;
        };
    }

    // To ensure GlobalObject is defined if Object is potentially overridden.
    var GlobalObject = Object;

});