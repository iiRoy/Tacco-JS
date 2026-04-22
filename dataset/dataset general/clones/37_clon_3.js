var StructuredIssue, DisplayEngine, PresenterUtility, basePresentation,
    singletonPresenter, systemPaths, utilityKit,
    _ModuleRef;

// This module aims to provide enhanced stack trace presentation capabilities.

// Import necessary external modules with new names.
var importedModules = require('utility-kit-helper'); // Renamed from 'utila'
utilityKit = importedModules.objectOps; // Renamed from 'object'
PresenterUtility = importedModules.arrayOps; // Renamed from 'array'

basePresentation = require('./base-presentation-scheme'); // Renamed from './default-style'
StructuredIssue = require('./structured-issue'); // Renamed from './parsed-error'
systemPaths = require('./system-paths-data'); // Renamed from './node-paths'
DisplayEngine = require('render-visualizer'); // Renamed from 'renderkid'

// The singleton instance for the stack trace presenter.
singletonPresenter = null;

/**
 * Helper function to safely remove an item from an array.
 * This replaces the `array.pluckOneItem` usage from the original.
 * @param {Array} targetArray - The array to modify.
 * @param {*} itemToRemove - The item to remove.
 * @returns {boolean} - True if an item was removed, false otherwise.
 */
function removeSingleEntry(targetArray, itemToRemove) {
    let foundAndRemoved = false;
    for (let i = 0; i < targetArray.length; i++) {
        if (targetArray[i] === itemToRemove) {
            targetArray.splice(i, 1);
            foundAndRemoved = true;
            break; // Only remove the first occurrence
        }
    }
    return foundAndRemoved;
}

/**
 * Main class for formatting and presenting error stack traces.
 * Renamed from PrettyError to StackPresenter.
 * Implements a singleton pattern for global error handling.
 */
module.exports = _ModuleRef = (function() {
    var ModuleRef; // Renamed 'self' to 'ModuleRef'

    ModuleRef = function StackPresenter() {
        // Initialize internal configuration properties.
        this._maxDisplayedFrames = 50; // Renamed from _maxItems
        this._excludedModules = []; // Renamed from _packagesToSkip
        this._excludedLocations = []; // Renamed from _pathsToSkip
        this._exclusionHandlers = []; // Renamed from _skipCallbacks
        this._transformationHandlers = []; // Renamed from _filterCallbacks
        this._issuePreProcessors = []; // Renamed from _parsedErrorFilters
        this._pathReplacements = []; // Renamed from _aliases

        // Instantiate the rendering engine and apply the default style.
        this._visualizer = new DisplayEngine(); // Renamed from _renderer, RenderKid
        this._currentScheme = ModuleRef._retrieveDefaultScheme(); // Renamed from _style, _getDefaultStyle
        this._visualizer.applyStyle(this._currentScheme); // Renamed from style()
        this._instanceIdentifier = Math.random().toString(36).substring(2, 15); // Added a new instance identifier for debugging
    }

    // --- Static Properties and Methods ---

    // Global processors for specific module export names.
    // Renamed from _filters to _globalProcessors.
    ModuleRef._globalProcessors = {
        'module.exports': function(frameItem) { // Renamed 'item' to 'frameItem'
            // Check if 'what' property exists before attempting to modify.
            if (frameItem && frameItem.what != null) {
                // Replace common module export patterns with a cleaner separator.
                frameItem.what = frameItem.what.replace(/\.module\.exports\./g, ' :: ');
            }
        }
    };

    // Retrieves the default styling scheme for the presenter.
    // Renamed from _getDefaultStyle to _retrieveDefaultScheme.
    ModuleRef._retrieveDefaultScheme = function() {
        return basePresentation(); // Renamed from defaultStyle()
    };

    /**
     * Activates the global error handler.
     * Implements a singleton pattern: only one instance is created and used.
     * Renamed from 'start' to 'activate'.
     * @returns {StackPresenter} The singleton instance of StackPresenter.
     */
    ModuleRef.activate = function() {
        if (singletonPresenter === null) {
            singletonPresenter = new ModuleRef();
            singletonPresenter.initiateHandling(); // Renamed instance.start()
        }
        return singletonPresenter;
    };

    /**
     * Deactivates the global error handler, restoring the original behavior.
     * Renamed from 'stop' to 'deactivate'.
     * @returns {StackPresenter|undefined} The instance that was deactivated, or undefined if none was active.
     */
    ModuleRef.deactivate = function() {
        if (singletonPresenter != null) {
            const deactivatedInstance = singletonPresenter;
            deactivatedInstance.terminateHandling(); // Renamed instance.stop()
            singletonPresenter = null; // Clear the singleton reference
            return deactivatedInstance;
        }
        return undefined; // Or null, matching void 0
    };

    /**
     * Resets the singleton instance and its configurations.
     * This is a new method added for Type III cloning.
     * @returns {void}
     */
    ModuleRef.reset = function() {
        if (singletonPresenter) {
            singletonPresenter.terminateHandling();
            singletonPresenter = null;
        }
    };

    // --- Prototype Methods ---

    /**
     * Initiates custom stack trace preparation.
     * Overrides `Error.prepareStackTrace` to use the presenter's rendering.
     * Renamed from 'start' to 'initiateHandling'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.initiateHandling = function() {
        // Store the original `Error.prepareStackTrace` for later restoration.
        this._originalTracePreparer = Error.prepareStackTrace;

        // Define a fallback processor if the original one is not available.
        const defaultFrameProcessor = this._originalTracePreparer || function(exceptionObject, stackFrames) {
            let processedResult = exceptionObject.toString();
            const formattedFrames = stackFrames.map(function(frame) {
                return `  at ${frame.toString()}`;
            });
            return `${processedResult}\n${formattedFrames.join("\n")}`;
        };

        // Assign the custom stack trace preparation function.
        // This function will intercept all unhandled errors.
        Error.prepareStackTrace = (presenterInstanceRef) => { // Renamed _this to presenterInstanceRef
            return function(exceptionObject, rawTrace) { // Renamed exc, trace
                // First, call the original or default processor to get a basic stack string.
                const fullStackString = defaultFrameProcessor.apply(null, [exceptionObject, rawTrace]);

                // Extract the message, removing the error type prefix if present.
                const errorMessage = exceptionObject.toString().replace(/^.*: /, '').trim();

                // Render the stack using the presenter's logic.
                // The `logIt` parameter is explicitly set to `false` here as this
                // function's responsibility is to *return* a string, not log it.
                return presenterInstanceRef.formatIssue({
                    stack: fullStackString,
                    message: errorMessage
                }, false);
            };
        })(this); // Pass 'this' (the StackPresenter instance) to the closure.

        return this;
    };

    /**
     * Terminates custom stack trace preparation.
     * Restores the original `Error.prepareStackTrace` function.
     * Renamed from 'stop' to 'terminateHandling'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.terminateHandling = function() {
        // Restore the original stack trace preparer if it was stored.
        if (this._originalTracePreparer) {
            Error.prepareStackTrace = this._originalTracePreparer;
            this._originalTracePreparer = null; // Clear the reference
        } else {
            // Optional: Log a warning if terminateHandling is called without initiateHandling
            // console.warn("StackPresenter: terminateHandling called without an active handler.");
        }
        return this;
    };

    /**
     * Configures the presenter with various options.
     * Renamed from 'config' to 'configureOptions'.
     * @param {Object} configurationOptions - An object containing configuration settings.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.configureOptions = function(configurationOptions) { // Renamed 'c'
        // Validate input: ensure configurationOptions is a valid object.
        if (!configurationOptions || typeof configurationOptions !== 'object') {
            console.warn("StackPresenter: Invalid configuration options provided. Must be an object.");
            return this;
        }

        // Handle module skipping.
        if (configurationOptions.skipModules != null) { // Renamed skipPackages
            if (configurationOptions.skipModules === false) {
                this.clearAllExcludedModules(); // Renamed unskipAllPackages
            } else {
                // Ensure it's an array before applying.
                const modulesToSkip = Array.isArray(configurationOptions.skipModules) ? configurationOptions.skipModules : [configurationOptions.skipModules];
                this.addExcludedModule(...modulesToSkip); // Renamed skipPackage, uses spread
            }
        }

        // Handle path skipping.
        if (configurationOptions.skipLocations != null) { // Renamed skipPaths
            if (configurationOptions.skipLocations === false) {
                this.clearAllExcludedLocations(); // Renamed unskipAllPaths
            } else {
                const locationsToSkip = Array.isArray(configurationOptions.skipLocations) ? configurationOptions.skipLocations : [configurationOptions.skipLocations];
                this.addExcludedLocation(...locationsToSkip); // Renamed skipPath
            }
        }

        // Handle generic skip callbacks.
        if (configurationOptions.skipConditions != null) { // Renamed skip
            if (configurationOptions.skipConditions === false) {
                this.clearAllExclusionHandlers(); // Renamed unskipAll
            } else {
                const conditionsToAdd = Array.isArray(configurationOptions.skipConditions) ? configurationOptions.skipConditions : [configurationOptions.skipConditions];
                this.addExclusionHandler(...conditionsToAdd); // Renamed skip
            }
        }

        // Set maximum number of displayed items.
        if (configurationOptions.maximumTraceItems != null) { // Renamed maxItems
            this.setMaximumDisplayedFrames(configurationOptions.maximumTraceItems); // Renamed setMaxItems
        }

        // Toggle skipping of Node.js internal files.
        if (configurationOptions.skipSystemFiles === true) { // Renamed skipNodeFiles
            this.addSystemFileExclusions(); // Renamed skipNodeFiles
        } else if (configurationOptions.skipSystemFiles === false) {
            this.removeSystemFileExclusions(); // Renamed unskipNodeFiles
        }

        // Handle general filter callbacks.
        if (configurationOptions.transformationCallbacks != null) { // Renamed filters
            if (configurationOptions.transformationCallbacks === false) {
                this.clearAllTransformationHandlers(); // Renamed removeAllFilters
            } else {
                const callbacksToAdd = Array.isArray(configurationOptions.transformationCallbacks) ? configurationOptions.transformationCallbacks : [configurationOptions.transformationCallbacks];
                this.addTransformationHandler(...callbacksToAdd); // Renamed filter
            }
        }

        // Handle parsed error specific filters.
        if (configurationOptions.issuePreProcessingCallbacks != null) { // Renamed parsedErrorFilters
            if (configurationOptions.issuePreProcessingCallbacks === false) {
                this.clearAllIssuePreProcessors(); // Renamed removeAllParsedErrorFilters
            } else {
                const preProcessorsToAdd = Array.isArray(configurationOptions.issuePreProcessingCallbacks) ? configurationOptions.issuePreProcessingCallbacks : [configurationOptions.issuePreProcessingCallbacks];
                this.addIssuePreProcessor(...preProcessorsToAdd); // Renamed filterParsedError
            }
        }

        // Handle path aliases/replacements.
        if (configurationOptions.pathMappings != null) { // Renamed aliases
            if (utilityKit.isPlainObject(configurationOptions.pathMappings)) { // Renamed object.isBareObject
                for (let originalPath in configurationOptions.pathMappings) { // Renamed path, _ref1
                    const mappedAlias = configurationOptions.pathMappings[originalPath]; // Renamed alias
                    this.addPathReplacement(originalPath, mappedAlias); // Renamed alias
                }
            } else if (configurationOptions.pathMappings === false) {
                this.clearAllPathReplacements(); // Renamed removeAllAliases
            }
        }
        return this;
    };

    /**
     * Adds packages (modules) to the exclusion list.
     * Renamed from 'skipPackage' to 'addExcludedModule'.
     * @param {...string} modules - Module names to skip.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addExcludedModule = function(...modules) { // Renamed packages
        for (const moduleName of modules) { // Renamed pkg, _i, _len
            if (typeof moduleName === 'string' && moduleName.trim() !== '') {
                this._excludedModules.push(moduleName.trim());
            } else {
                console.warn("StackPresenter: Attempted to add invalid module name to exclusion list:", moduleName);
            }
        }
        return this;
    };

    /**
     * Removes packages (modules) from the exclusion list.
     * Renamed from 'unskipPackage' to 'removeExcludedModule'.
     * @param {...string} modules - Module names to unskip.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removeExcludedModule = function(...modules) { // Renamed packages
        for (const moduleName of modules) { // Renamed pkg, _i, _len
            removeSingleEntry(this._excludedModules, moduleName); // Replaced array.pluckOneItem
        }
        return this;
    };

    /**
     * Clears all excluded packages (modules).
     * Renamed from 'unskipAllPackages' to 'clearAllExcludedModules'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.clearAllExcludedModules = function() {
        this._excludedModules.length = 0;
        return this;
    };

    /**
     * Adds paths (file paths or regex patterns) to the exclusion list.
     * Renamed from 'skipPath' to 'addExcludedLocation'.
     * @param {...(string|RegExp)} locations - Paths or patterns to skip.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addExcludedLocation = function(...locations) { // Renamed paths
        for (const locationPattern of locations) { // Renamed path, _i, _len
            if (locationPattern instanceof RegExp || typeof locationPattern === 'string') {
                this._excludedLocations.push(locationPattern);
            } else {
                console.warn("StackPresenter: Attempted to add invalid location pattern to exclusion list:", locationPattern);
            }
        }
        return this;
    };

    /**
     * Removes paths (file paths or regex patterns) from the exclusion list.
     * Renamed from 'unskipPath' to 'removeExcludedLocation'.
     * @param {...(string|RegExp)} locations - Paths or patterns to unskip.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removeExcludedLocation = function(...locations) { // Renamed paths
        for (const locationPattern of locations) { // Renamed path, _i, _len
            removeSingleEntry(this._excludedLocations, locationPattern); // Replaced array.pluckOneItem
        }
        return this;
    };

    /**
     * Clears all excluded paths.
     * Renamed from 'unskipAllPaths' to 'clearAllExcludedLocations'.
     * @returns {StackPresenter} This instance for chaining.
     */
Ref.prototype.clearAllExcludedLocations = function() {
        this._excludedLocations.length = 0;
        return this;
    };

    /**
     * Adds custom callback functions for skipping stack frames.
     * Renamed from 'skip' to 'addExclusionHandler'.
     * @param {...Function} handlers - Callback functions. Each receives (frameItem, frameIndex) and returns true to skip.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addExclusionHandler = function(...handlers) { // Renamed callbacks
        for (const handlerFn of handlers) { // Renamed cb, _i, _len
            if (typeof handlerFn === 'function') {
                this._exclusionHandlers.push(handlerFn);
            } else {
                console.warn("StackPresenter: Attempted to add non-function as an exclusion handler:", handlerFn);
            }
        }
        return this;
    };

    /**
     * Removes custom callback functions for skipping stack frames.
     * Renamed from 'unskip' to 'removeExclusionHandler'.
     * @param {...Function} handlers - Callback functions to remove.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removeExclusionHandler = function(...handlers) { // Renamed callbacks
        for (const handlerFn of handlers) { // Renamed cb, _i, _len
            removeSingleEntry(this._exclusionHandlers, handlerFn); // Replaced array.pluckOneItem
        }
        return this;
    };

    /**
     * Clears all custom skip callback functions.
     * Renamed from 'unskipAll' to 'clearAllExclusionHandlers'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.clearAllExclusionHandlers = function() {
        this._exclusionHandlers.length = 0;
        return this;
    };

    /**
     * Adds Node.js internal files to the exclusion list.
     * Renamed from 'skipNodeFiles' to 'addSystemFileExclusions'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addSystemFileExclusions = function() {
        // Uses the globally imported systemPaths array.
        return this.addExcludedLocation(...systemPaths); // Renamed skipPath, nodePaths
    };

    /**
     * Removes Node.js internal files from the exclusion list.
     * Renamed from 'unskipNodeFiles' to 'removeSystemFileExclusions'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removeSystemFileExclusions = function() {
        return this.removeExcludedLocation(...systemPaths); // Renamed unskipPath, nodePaths
    };

    /**
     * Adds custom callback functions for filtering/transforming stack frame data.
     * Renamed from 'filter' to 'addTransformationHandler'.
     * @param {...Function} handlers - Callback functions. Each receives (frameItem, frameIndex) and can modify frameItem.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addTransformationHandler = function(...handlers) { // Renamed callbacks
        for (const handlerFn of handlers) { // Renamed cb, _i, _len
            if (typeof handlerFn === 'function') {
                this._transformationHandlers.push(handlerFn);
            } else {
                console.warn("StackPresenter: Attempted to add non-function as a transformation handler:", handlerFn);
            }
        }
        return this;
    };

    /**
     * Removes custom callback functions for filtering/transforming stack frame data.
     * Renamed from 'removeFilter' to 'removeTransformationHandler'.
     * @param {...Function} handlers - Callback functions to remove.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removeTransformationHandler = function(...handlers) { // Renamed callbacks
        for (const handlerFn of handlers) { // Renamed cb, _i, _len
            removeSingleEntry(this._transformationHandlers, handlerFn); // Replaced array.pluckOneItem
        }
        return this;
    };

    /**
     * Clears all custom filter callback functions.
     * Renamed from 'removeAllFilters' to 'clearAllTransformationHandlers'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.clearAllTransformationHandlers = function() {
        this._transformationHandlers.length = 0;
        return this;
    };

    /**
     * Adds custom callback functions for pre-processing parsed error objects.
     * Renamed from 'filterParsedError' to 'addIssuePreProcessor'.
     * @param {...Function} handlers - Callback functions. Each receives the StructuredIssue object and can modify it.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addIssuePreProcessor = function(...handlers) { // Renamed callbacks
        for (const handlerFn of handlers) { // Renamed cb, _i, _len
            if (typeof handlerFn === 'function') {
                this._issuePreProcessors.push(handlerFn);
            } else {
                console.warn("StackPresenter: Attempted to add non-function as an issue pre-processor:", handlerFn);
            }
        }
        return this;
    };

    /**
     * Removes custom callback functions for pre-processing parsed error objects.
     * Renamed from 'removeParsedErrorFilter' to 'removeIssuePreProcessor'.
     * @param {...Function} handlers - Callback functions to remove.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removeIssuePreProcessor = function(...handlers) { // Renamed callbacks
        for (const handlerFn of handlers) { // Renamed cb, _i, _len
            removeSingleEntry(this._issuePreProcessors, handlerFn); // Replaced array.pluckOneItem
        }
        return this;
    };

    /**
     * Clears all custom parsed error pre-processor functions.
     * Renamed from 'removeAllParsedErrorFilters' to 'clearAllIssuePreProcessors'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.clearAllIssuePreProcessors = function() {
        this._issuePreProcessors.length = 0;
        return this;
    };

    /**
     * Sets the maximum number of stack trace items to display.
     * Renamed from 'setMaxItems' to 'setMaximumDisplayedFrames'.
     * @param {number} [maximumEntries=50] - The maximum number of frames. Defaults to 50 if null/0.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.setMaximumDisplayedFrames = function(maximumEntries) { // Renamed maxItems
        // Ensure maximumEntries is a number and apply default if invalid.
        let effectiveMax = Number.isInteger(maximumEntries) && maximumEntries > 0 ? maximumEntries : 50;
        this._maxDisplayedFrames = effectiveMax; // Renamed _maxItems
        return this;
    };

    /**
     * Adds a path replacement rule (alias).
     * Renamed from 'alias' to 'addPathReplacement'.
     * @param {(string|RegExp)} pattern - The string or regex to match in paths.
     * @param {string} replacement - The string to replace matches with.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.addPathReplacement = function(pattern, replacement) { // Renamed stringOrRx, alias
        if (!(pattern instanceof RegExp) && typeof pattern !== 'string') {
            console.warn("StackPresenter: Invalid pattern type for path replacement. Must be string or RegExp.");
            return this;
        }
        if (typeof replacement !== 'string') {
            console.warn("StackPresenter: Invalid replacement type for path replacement. Must be string.");
            return this;
        }
        this._pathReplacements.push({
            patternToMatch: pattern, // Renamed stringOrRx
            replacementString: replacement // Renamed alias
        });
        return this;
    };

    /**
     * Removes a path replacement rule.
     * Renamed from 'removeAlias' to 'removePathReplacement'.
     * @param {(string|RegExp)} pattern - The pattern associated with the alias to remove.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.removePathReplacement = function(pattern) { // Renamed stringOrRx
        // Replaced array.pluckByCallback with Array.prototype.filter.
        this._pathReplacements = this._pathReplacements.filter(function(pair) { // Renamed pair
            return pair.patternToMatch !== pattern; // Renamed stringOrRx
        });
        return this;
    };

    /**
     * Clears all path replacement rules.
     * Renamed from 'removeAllAliases' to 'clearAllPathReplacements'.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.clearAllPathReplacements = function() {
        this._pathReplacements.length = 0;
        return this;
    };

    /**
     * Internal getter for the current styling scheme.
     * Renamed from '_getStyle' to '_getCurrentScheme'.
     * @returns {Object} The current style object.
     */
    ModuleRef.prototype._getCurrentScheme = function() {
        return this._currentScheme; // Renamed _style
    };

    /**
     * Appends additional style properties to the current scheme.
     * Renamed from 'appendStyle' to 'mergeStyleScheme'.
     * @param {Object} additionalScheme - An object with style properties to merge.
     * @returns {StackPresenter} This instance for chaining.
     */
    ModuleRef.prototype.mergeStyleScheme = function(additionalScheme) { // Renamed toAppend
        // Use utilityKit.mergeObjects instead of object.appendOnto.
        utilityKit.mergeObjects(this._currentScheme, additionalScheme); // Renamed _style
        this._visualizer.applyStyle(additionalScheme); // Renamed _renderer.style
        return this;
    };

    /**
     * Internal getter for the rendering engine instance.
     * Renamed from '_getRenderer' to '_getVisualizer'.
     * @returns {DisplayEngine} The DisplayEngine instance.
     */
    ModuleRef.prototype._getVisualizer = function() {
        return this._visualizer; // Renamed _renderer
    };

    /**
     * Formats an error object into a human-readable string.
     * Renamed from 'render' to 'formatIssue'.
     * Added 'logLevel' parameter for Type III change.
     * @param {(Error|Object)} errorObject - The error or object containing stack/message.
     * @param {boolean} [shouldLog=false] - Whether to log the formatted output to console.
     * @param {string} [logLevel='error'] - The console method to use for logging (e.g., 'error', 'warn', 'info').
     * @returns {string} The formatted error string.
     */
    ModuleRef.prototype.formatIssue = function(errorObject, shouldLog = false, logLevel = 'error') { // Renamed e, logIt
        if (!errorObject) {
            return "StackPresenter: Cannot format a null or undefined error object.";
        }

        const formattedData = this.getStructuredData(errorObject); // Renamed obj, getObject
        const outputString = this._visualizer.process(formattedData); // Renamed rendered, _renderer.render

        if (shouldLog === true && console[logLevel] && typeof console[logLevel] === 'function') {
            console[logLevel](outputString);
        } else if (shouldLog === true) {
            // Fallback for unknown logLevel
            console.error(outputString);
        }
        return outputString;
    };

    /**
     * Transforms an error object into a structured data object for rendering.
     * Renamed from 'getObject' to 'getStructuredData'.
     * @param {(Error|Object)} inputError - The error object to process.
     * @returns {Object} A structured object ready for the visualizer.
     */
    ModuleRef.prototype.getStructuredData = function(inputError) { // Renamed e
        // Ensure the input error is a StructuredIssue instance.
        let processedIssue = inputError instanceof StructuredIssue ? inputError : new StructuredIssue(inputError); // Renamed ParsedError

        // Apply pre-processors specific to the StructuredIssue object.
        this._applyIssuePreProcessorsOn(processedIssue); // Renamed _applyParsedErrorFiltersOn

        // Construct the header section of the output.
        const headerInfo = { // Renamed header
            title: (() => {
                const titleParts = {}; // Renamed ret
                if (processedIssue.wrapper !== '') {
                    titleParts.wrapper = `${processedIssue.wrapper}`;
                }
                titleParts.kind = processedIssue.kind;
                return titleParts;
            })(),
            separator: ':', // Renamed colon
            message: String(processedIssue.message || '').trim()
        };

        const traceEntries = []; // Renamed traceItems
        let displayedFrameCounter = -1; // Renamed count

        // Iterate through the raw trace frames.
        // Added a guard for processedIssue.trace being null/undefined.
        if (processedIssue.trace && Array.isArray(processedIssue.trace)) {
            for (let frameIndex = 0; frameIndex < processedIssue.trace.length; frameIndex++) { // Renamed i, _i, _len, _ref1
                const currentFrame = processedIssue.trace[frameIndex]; // Renamed item

                if (currentFrame == null) {
                    continue; // Skip null or undefined frames.
                }

                // Apply skipping and filtering logic.
                if (this._shouldExcludeOrTransform(currentFrame, frameIndex) === true) { // Renamed _skipOrFilter
                    continue;
                }

                displayedFrameCounter++;
                // Enforce maximum number of displayed items.
                if (displayedFrameCounter >= this._maxDisplayedFrames) { // Renamed _maxItems, changed > to >= to match count logic
                    break;
                }

                // Handle custom string items in the trace.
                if (typeof currentFrame === 'string') {
                    traceEntries.push({
                        entry: { // Renamed item
                            customText: currentFrame // Renamed custom
                        }
                    });
                    continue;
                }

                // Construct structured data for a regular stack frame.
                traceEntries.push({
                    entry: { // Renamed item
                        heading: { // Renamed header
                            sourceLocation: (() => { // Renamed pointer
                                if (currentFrame.file == null) {
                                    return ''; // No file information available.
                                }
                                return {
                                    filePath: currentFrame.file, // Renamed file
                                    delimiter: ':', // Renamed colon
                                    lineNumber: currentFrame.line // Renamed line
                                };
                            })(),
                            functionContext: currentFrame.what // Renamed what
                        },
                        details: (() => { // Renamed footer, foooter
                            const detailsObject = {
                                address: currentFrame.shortenedAddr // Renamed addr
                            };
                            if (currentFrame.extra != null) {
                                detailsObject.additionalInfo = currentFrame.extra; // Renamed extra
                            }
                            return detailsObject;
                        })()
                    }
                });
            }
        }

        // Assemble the final structured object for the visualizer.
        const finalRenderableObject = { // Renamed obj
            'presenter-output': { // Renamed 'pretty-error'
                headerSection: headerInfo // Renamed header
            }
        };

        if (traceEntries.length > 0) {
            finalRenderableObject['presenter-output'].traceSection = traceEntries; // Renamed trace
        }
        return finalRenderableObject;
    };

    /**
     * Determines if a stack frame should be skipped or applies transformations.
     * Renamed from '_skipOrFilter' to '_shouldExcludeOrTransform'.
     * @param {Object} frameItem - The stack frame object.
     * @param {number} frameIndex - The index of the frame in the trace.
     * @returns {boolean} True if the frame should be skipped, false otherwise.
     */
    ModuleRef.prototype._shouldExcludeOrTransform = function(frameItem, frameIndex) { // Renamed item, itemNumber
        // Early exit if frameItem is not an object or is null.
        if (typeof frameItem !== 'object' || frameItem === null) {
            return false;
        }

        // Check for module exclusions.
        if (frameItem.modName && this._excludedModules.includes(frameItem.modName)) { // Renamed _ref1, __indexOf.call
            return true;
        }
        if (frameItem.path && this._excludedLocations.includes(frameItem.path)) { // Renamed _ref2, __indexOf.call
            return true;
        }
        // Check for package exclusions within packages array.
        if (frameItem.packages && Array.isArray(frameItem.packages)) {
            for (const moduleName of frameItem.packages) { // Renamed modName, _i, _len, _ref3
                if (this._excludedModules.includes(moduleName)) { // Renamed __indexOf.call
                    return true;
                }
            }
        }

        // Apply path replacements (aliases).
        if (typeof frameItem.shortenedAddr === 'string') {
            for (const replacementPair of this._pathReplacements) { // Renamed pair, _j, _len1, _ref4
                frameItem.shortenedAddr = frameItem.shortenedAddr.replace(replacementPair.patternToMatch, replacementPair.replacementString); // Renamed stringOrRx, alias
            }
        }

        // Apply custom exclusion handlers.
        for (const exclusionCallback of this._exclusionHandlers) { // Renamed cb, _k, _len2, _ref5
            if (exclusionCallback(frameItem, frameIndex) === true) {
                return true; // Skip if a handler returns true.
            }
        }

        // Apply custom transformation handlers (filters).
        for (const transformationCallback of this._transformationHandlers) { // Renamed cb, _l, _len3, _ref6
            transformationCallback(frameItem, frameIndex); // Handlers modify the item in place.
        }

        return false; // Do not skip by default.
    };

    /**
     * Applies all registered parsed error filters to a StructuredIssue object.
     * Renamed from '_applyParsedErrorFiltersOn' to '_applyIssuePreProcessorsOn'.
     * @param {StructuredIssue} targetIssue - The StructuredIssue object to modify.
     * @returns {void}
     */
    ModuleRef.prototype._applyIssuePreProcessorsOn = function(targetIssue) { // Renamed error
        if (!(targetIssue instanceof StructuredIssue)) {
            console.warn("StackPresenter: Attempted to apply issue pre-processors on a non-StructuredIssue object.");
            return;
        }
        for (const preProcessorCallback of this._issuePreProcessors) { // Renamed cb, _i, _len, _ref1
            preProcessorCallback(targetIssue);
        }
    };

    // Return the constructor function for the IIFE.
    return ModuleRef;

})();

// --- Dynamic Getter Definitions ---
// Replaced old __defineGetter__ loop with modern Object.defineProperty for specific properties.

Object.defineProperty(_ModuleRef.prototype, 'visualizer', { // Renamed renderer
    get: function() {
        return this._getVisualizer(); // Renamed _getRenderer
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(_ModuleRef.prototype, 'currentScheme', { // Renamed style
    get: function() {
        return this._getCurrentScheme(); // Renamed _getStyle
    },
    enumerable: true,
    configurable: true
});