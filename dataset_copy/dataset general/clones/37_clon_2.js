/*
 * This file implements a sophisticated fault formatting utility.
 * It transforms raw error stack traces into a more readable and configurable format.
 */
var AnalyzedFault, DisplayEngine, FormattedFault, listing, baseStyling, singleton, runtimeLocations, entity, itemKey, _initAccessor, _idx, _length, _tempRef, _tempRefTwo,
    __portion = [].slice, // Used for slicing arguments into arrays
    __locate = [].indexOf || function(searchElement) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (i in this && this[i] === searchElement) return i;
        }
        return -1;
    };

// Acquire necessary utilities and components
_tempRef = require('utila'), entity = _tempRef.object, listing = _tempRef.array;

baseStyling = require('./default-style'); // Default visual configuration
AnalyzedFault = require('./parsed-error'); // Error parsing module
runtimeLocations = require('./node-paths'); // Paths related to Node.js internals
DisplayEngine = require('renderkid'); // Rendering library for structured output

singleton = null; // Holds the single instance of the formatter

// Export the main class as a module
module.exports = FormattedFault = (function() {
    var thisClass;

    thisClass = FormattedFault; // Reference to the class itself

    // Static processors for error elements
    FormattedFault._processors = {
        'module.exports': function(element) {
            if (element.description == null) {
                return;
            }
            element.description = element.description.replace(/\.module\.exports\./g, ' - ');
        }
    };

    // Static method to retrieve the default styling
    FormattedFault._fetchDefaultStyle = function() {
        return baseStyling();
    };

    // Static method to begin the error formatting service
    FormattedFault.begin = function() {
        if (singleton == null) {
            singleton = new thisClass();
            singleton.initialize();
        }
        return singleton;
    };

    // Static method to halt the error formatting service
    FormattedFault.halt = function() {
        return singleton != null ? singleton.terminate() : undefined;
    };

    // Constructor for the FormattedFault class
    function FormattedFault() {
        this._maximumEntries = 50; // Maximum number of stack trace items to display
        this._excludedPackages = []; // List of packages to omit from the trace
        this._excludedLocations = []; // List of file paths to omit from the trace
        this._exclusionCallbacks = []; // Custom functions to decide what to omit
        this._transformationCallbacks = []; // Custom functions to modify trace items
        this._analyzedFaultProcessors = []; // Custom functions to modify the analyzed error object
        this._nameMappings = []; // Aliases for path replacement
        this._displayer = new DisplayEngine(); // Renderer instance
        this._currentStyling = thisClass._fetchDefaultStyle(); // Current styling configuration
        this._displayer.style(this._currentStyling); // Apply initial styling to the renderer
    }

    // Initialize the error preparation hook
    FormattedFault.prototype.initialize = function() {
        var stackPreparer;
        this._originalStackTracePreparer = Error.prepareStackTrace; // Store original handler
        stackPreparer = this._originalStackTracePreparer || function(exceptionObj, frameList) {
            var formatResult;
            formatResult = exceptionObj.toString();
            frameList = frameList.map(function(stackFrame) {
                return "  at " + (stackFrame.toString());
            });
            return formatResult + "\n" + frameList.join("\n");
        };
        Error.prepareStackTrace = (function(_context) {
            return function(exceptionObj, traceData) {
                var formattedStack;
                formattedStack = stackPreparer.apply(null, arguments); // Call the original preparer
                return _context.display({
                    stack: formattedStack,
                    errorMsg: exceptionObj.toString().replace(/^.*: /, '')
                }, false); // Render the formatted error
            };
        })(this);
        return this;
    };

    // Terminate the error preparation hook
    FormattedFault.prototype.terminate = function() {
        Error.prepareStackTrace = this._originalStackTracePreparer; // Restore original handler
        return this._originalStackTracePreparer = null; // Clear reference
    };

    // Configure the formatter with various settings
    FormattedFault.prototype.configure = function(settings) {
        var mappedName, filepath, _tempRefTwo;

        if (settings.omitPackages != null) {
            if (settings.omitPackages === false) {
                this.includeAllPackages();
            } else {
                this.omitPackage.apply(this, settings.omitPackages);
            }
        }

        if (settings.omitPaths != null) {
            if (settings.omitPaths === false) {
                this.includeAllPaths();
            } else {
                this.omitPath.apply(this, settings.omitPaths);
            }
        }

        if (settings.omit != null) {
            if (settings.omit === false) {
                this.includeAll();
            } else {
                this.omit.apply(this, settings.omit);
            }
        }

        if (settings.maximumEntries != null) {
            this.setMaximumEntries(settings.maximumEntries);
        }

        if (settings.omitNodeFiles === true) {
            this.omitNodeFiles();
        } else if (settings.omitNodeFiles === false) {
            this.includeNodeFiles();
        }

        if (settings.transformers != null) {
            if (settings.transformers === false) {
                this.clearAllTransformers();
            } else {
                this.transform.apply(this, settings.transformers);
            }
        }

        if (settings.analyzedFaultProcessors != null) {
            if (settings.analyzedFaultProcessors === false) {
                this.clearAllAnalyzedFaultProcessors();
            } else {
                this.transformAnalyzedFault.apply(this, settings.analyzedFaultProcessors);
            }
        }

        if (settings.nameMappings != null) {
            if (entity.isPlainObject(settings.nameMappings)) {
                _tempRefTwo = settings.nameMappings;
                for (filepath in _tempRefTwo) {
                    mappedName = _tempRefTwo[filepath];
                    this.mapName(filepath, mappedName);
                }
            } else if (settings.nameMappings === false) {
                this.clearAllNameMappings();
            }
        }
        return this;
    };

    // Add packages to the exclusion list
    FormattedFault.prototype.omitPackage = function() {
        var packagesToOmit, packageName, _idx, _length;
        packagesToOmit = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = packagesToOmit.length; _idx < _length; _idx++) {
            packageName = packagesToOmit[_idx];
            this._excludedPackages.push(String(packageName));
        }
        return this;
    };

    // Remove packages from the exclusion list
    FormattedFault.prototype.includePackage = function() {
        var packagesToInclude, packageName, _idx, _length;
        packagesToInclude = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = packagesToInclude.length; _idx < _length; _idx++) {
            packageName = packagesToInclude[_idx];
            listing.removeSingleEntry(this._excludedPackages, packageName);
        }
        return this;
    };

    // Clear all packages from the exclusion list
    FormattedFault.prototype.includeAllPackages = function() {
        this._excludedPackages.length = 0;
        return this;
    };

    // Add paths to the exclusion list
    FormattedFault.prototype.omitPath = function() {
        var pathsToOmit, filepath, _idx, _length;
        pathsToOmit = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = pathsToOmit.length; _idx < _length; _idx++) {
            filepath = pathsToOmit[_idx];
            this._excludedLocations.push(filepath);
        }
        return this;
    };

    // Remove paths from the exclusion list
    FormattedFault.prototype.includePath = function() {
        var pathsToInclude, filepath, _idx, _length;
        pathsToInclude = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = pathsToInclude.length; _idx < _length; _idx++) {
            filepath = pathsToInclude[_idx];
            listing.removeSingleEntry(this._excludedLocations, filepath);
        }
        return this;
    };

    // Clear all paths from the exclusion list
    FormattedFault.prototype.includeAllPaths = function() {
        this._excludedLocations.length = 0;
        return this;
    };

    // Add custom exclusion callbacks
    FormattedFault.prototype.omit = function() {
        var exclusionCallbacks, callbackFn, _idx, _length;
        exclusionCallbacks = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = exclusionCallbacks.length; _idx < _length; _idx++) {
            callbackFn = exclusionCallbacks[_idx];
            this._exclusionCallbacks.push(callbackFn);
        }
        return this;
    };

    // Remove custom exclusion callbacks
    FormattedFault.prototype.include = function() {
        var exclusionCallbacks, callbackFn, _idx, _length;
        exclusionCallbacks = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = exclusionCallbacks.length; _idx < _length; _idx++) {
            callbackFn = exclusionCallbacks[_idx];
            listing.removeSingleEntry(this._exclusionCallbacks, callbackFn);
        }
        return this;
    };

    // Clear all custom exclusion callbacks
    FormattedFault.prototype.includeAll = function() {
        this._exclusionCallbacks.length = 0;
        return this;
    };

    // Omit Node.js internal files
    FormattedFault.prototype.omitNodeFiles = function() {
        return this.omitPath.apply(this, runtimeLocations);
    };

    // Include Node.js internal files (undo omission)
    FormattedFault.prototype.includeNodeFiles = function() {
        return this.includePath.apply(this, runtimeLocations);
    };

    // Add custom transformation callbacks for stack trace items
    FormattedFault.prototype.transform = function() {
        var transformationCallbacks, callbackFn, _idx, _length;
        transformationCallbacks = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = transformationCallbacks.length; _idx < _length; _idx++) {
            callbackFn = transformationCallbacks[_idx];
            this._transformationCallbacks.push(callbackFn);
        }
        return this;
    };

    // Remove custom transformation callbacks
    FormattedFault.prototype.removeTransformer = function() {
        var transformationCallbacks, callbackFn, _idx, _length;
        transformationCallbacks = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = transformationCallbacks.length; _idx < _length; _idx++) {
            callbackFn = transformationCallbacks[_idx];
            listing.removeSingleEntry(this._transformationCallbacks, callbackFn);
        }
        return this;
    };

    // Clear all custom transformation callbacks
    FormattedFault.prototype.clearAllTransformers = function() {
        this._transformationCallbacks.length = 0;
        return this;
    };

    // Add custom processors for the parsed error object
    FormattedFault.prototype.transformAnalyzedFault = function() {
        var faultProcessors, callbackFn, _idx, _length;
        faultProcessors = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = faultProcessors.length; _idx < _length; _idx++) {
            callbackFn = faultProcessors[_idx];
            this._analyzedFaultProcessors.push(callbackFn);
        }
        return this;
    };

    // Remove custom processors for the parsed error object
    FormattedFault.prototype.removeAnalyzedFaultProcessor = function() {
        var faultProcessors, callbackFn, _idx, _length;
        faultProcessors = 1 <= arguments.length ? __portion.call(arguments, 0) : [];
        for (_idx = 0, _length = faultProcessors.length; _idx < _length; _idx++) {
            callbackFn = faultProcessors[_idx];
            listing.removeSingleEntry(this._analyzedFaultProcessors, callbackFn);
        }
        return this;
    };

    // Clear all custom processors for the parsed error object
    FormattedFault.prototype.clearAllAnalyzedFaultProcessors = function() {
        this._analyzedFaultProcessors.length = 0;
        return this;
    };

    // Set the maximum number of stack trace items
    FormattedFault.prototype.setMaximumEntries = function(limitCount) {
        if (limitCount == null) {
            limitCount = 50;
        }
        if (limitCount === 0) {
            limitCount = 50; // Default to 50 if 0 is passed
        }
        this._maximumEntries = limitCount | 0; // Ensure integer
        return this;
    };

    // Add a path alias (replacement rule)
    FormattedFault.prototype.mapName = function(patternOrString, replacementName) {
        this._nameMappings.push({
            patternOrString: patternOrString,
            replacementName: replacementName
        });
        return this;
    };

    // Remove a specific path alias
    FormattedFault.prototype.removeNameMapping = function(patternOrString) {
        listing.removeByPredicate(this._nameMappings, function(mappingPair) {
            return mappingPair.patternOrString === patternOrString;
        });
        return this;
    };

    // Clear all path aliases
    FormattedFault.prototype.clearAllNameMappings = function() {
        this._nameMappings.length = 0;
        return this;
    };

    // Internal method to retrieve current styling
    FormattedFault.prototype._retrieveStyle = function() {
        return this._currentStyling;
    };

    // Add new styling rules to the current configuration
    FormattedFault.prototype.addStyling = function(newStyling) {
        entity.mergeInto(this._currentStyling, newStyling); // Merge new styles
        this._displayer.style(newStyling); // Update renderer with new styles
        return this;
    };

    // Internal method to retrieve the renderer instance
    FormattedFault.prototype._retrieveDisplayer = function() {
        return this._displayer;
    };

    // Render an error object into a formatted string
    FormattedFault.prototype.display = function(errorObject, shouldLog) {
        var outputObject, renderedOutput;
        if (shouldLog == null) {
            shouldLog = false; // Default to not logging
        }
        outputObject = this.getDisplayObject(errorObject); // Get the structured object
        renderedOutput = this._displayer.render(outputObject); // Render to string
        if (shouldLog === true) {
            console.error(renderedOutput); // Log to console if requested
        }
        return renderedOutput;
    };

    // Get a structured object representation of the error for rendering
    FormattedFault.prototype.getDisplayObject = function(errorObject) {
        var entryCounter, displayHeader, index, traceEntry, outputObject, stackEntries, _idx, _length, _tempRefTwo;

        // Ensure the error is an AnalyzedFault instance
        if (!(errorObject instanceof AnalyzedFault)) {
            errorObject = new AnalyzedFault(errorObject);
        }

        // Apply any processors to the analyzed error
        this._applyAnalyzedFaultProcessorsOn(errorObject);

        // Construct the header for the error display
        displayHeader = {
            title: (function() {
                var returnValue;
                returnValue = {};
                if (errorObject.contextWrapper !== '') {
                    returnValue.wrapper = "" + errorObject.contextWrapper;
                }
                returnValue.kind = errorObject.faultType;
                return returnValue;
            })(),
            separatorChar: ':',
            errorMsg: String(errorObject.message).trim()
        };

        stackEntries = []; // Array to hold formatted stack trace entries
        entryCounter = -1; // Counter for visible items

        _tempRefTwo = errorObject.trace;
        for (index = _idx = 0, _length = _tempRefTwo.length; _idx < _length; index = ++_idx) {
            traceEntry = _tempRefTwo[index];

            if (traceEntry == null) {
                continue; // Skip null entries
            }

            // Check if the item should be skipped or filtered
            if (this._evaluateExclusionOrTransformation(traceEntry, index) === true) {
                continue;
            }

            entryCounter++;
            if (entryCounter > this._maximumEntries) {
                break; // Stop if max items reached
            }

            if (typeof traceEntry === 'string') {
                stackEntries.push({
                    item: {
                        custom: traceEntry
                    }
                });
                continue;
            }

            // Format the stack trace entry
            stackEntries.push({
                item: {
                    header: {
                        locationIndicator: (function() {
                            if (traceEntry.sourceFile == null) {
                                return '';
                            }
                            return {
                                file: traceEntry.sourceFile,
                                separatorChar: ':',
                                line: traceEntry.lineNumber
                            };
                        })(),
                        description: traceEntry.description
                    },
                    displayFooter: (function() {
                        var footerDetails;
                        footerDetails = {
                            addressInfo: traceEntry.conciseAddress
                        };
                        if (traceEntry.additionalInfo != null) {
                            footerDetails.extra = traceEntry.additionalInfo;
                        }
                        return footerDetails;
                    })()
                }
            });
        }

        // Assemble the final output object structure
        outputObject = {
            'formatted-fault': {
                header: displayHeader
            }
        };
        if (stackEntries.length > 0) {
            outputObject['formatted-fault'].trace = stackEntries;
        }
        return outputObject;
    };

    // Internal method to check for exclusion or apply transformations to a trace item
    FormattedFault.prototype._evaluateExclusionOrTransformation = function(traceEntry, entryIndex) {
        var callbackFn, moduleName, mappingPair, _idx, _idx2, _idx3, _idx4, _length, _length2, _length3, _length4, _tempRefTwo, _tempRefThree, _tempRefFour, _tempRefFive, _tempRefSix;

        if (typeof traceEntry === 'object') {
            // Check for package exclusions
            if (_tempRefTwo = traceEntry.moduleName, __locate.call(this._excludedPackages, _tempRefTwo) >= 0) {
                return true;
            }
            // Check for path exclusions
            if (_tempRefThree = traceEntry.path, __locate.call(this._excludedLocations, _tempRefThree) >= 0) {
                return true;
            }
            // Check for associated package exclusions
            _tempRefFour = traceEntry.associatedPackages;
            for (_idx = 0, _length = _tempRefFour.length; _idx < _length; _idx++) {
                moduleName = _tempRefFour[_idx];
                if (__locate.call(this._excludedPackages, moduleName) >= 0) {
                    return true;
                }
            }
            // Apply path aliases
            if (typeof traceEntry.conciseAddress === 'string') {
                _tempRefFive = this._nameMappings;
                for (_idx2 = 0, _length2 = _tempRefFive.length; _idx2 < _length2; _idx2++) {
                    mappingPair = _tempRefFive[_idx2];
                    traceEntry.conciseAddress = traceEntry.conciseAddress.replace(mappingPair.patternOrString, mappingPair.replacementName);
                }
            }
        }

        // Apply custom exclusion callbacks
        _tempRefSix = this._exclusionCallbacks;
        for (_idx3 = 0, _length3 = _tempRefSix.length; _idx3 < _length3; _idx3++) {
            callbackFn = _tempRefSix[_idx3];
            if (callbackFn(traceEntry, entryIndex) === true) {
                return true;
            }
        }

        // Apply custom transformation callbacks
        _tempRef = this._transformationCallbacks;
        for (_idx4 = 0, _length4 = _tempRef.length; _idx4 < _length4; _idx4++) {
            callbackFn = _tempRef[_idx4];
            callbackFn(traceEntry, entryIndex);
        }
        return false; // Item should not be skipped
    };

    // Internal method to apply filters to the parsed error object
    FormattedFault.prototype._applyAnalyzedFaultProcessorsOn = function(errorObject) {
        var callbackFn, _idx, _length, _tempRefTwo;
        _tempRefTwo = this._analyzedFaultProcessors;
        for (_idx = 0, _length = _tempRefTwo.length; _idx < _length; _idx++) {
            callbackFn = _tempRefTwo[_idx];
            callbackFn(errorObject);
        }
    };

    return FormattedFault; // Return the class definition

})();

// Dynamically define getters for 'displayer' and 'currentStyling' properties
_tempRefTwo = ['displayer', 'currentStyling'];
_initAccessor = function() {
    var accessorName;
    accessorName = '_retrieve' + itemKey[0].toUpperCase() + itemKey.substr(1, itemKey.length);
    // Using Object.defineProperty for modern and standard getter definition
    // Original used __defineGetter__ which is deprecated
    Object.defineProperty(FormattedFault.prototype, itemKey, {
        get: function() {
            return this[accessorName]();
        },
        configurable: true // Allow redefining if needed
    });
};
for (_idx = 0, _length = _tempRefTwo.length; _idx < _length; _idx++) {
    itemKey = _tempRefTwo[_idx];
    _initAccessor(); // Execute the function to define the getter
}