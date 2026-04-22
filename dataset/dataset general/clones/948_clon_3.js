let dataVizCore = {};

// Initial core configuration and metadata
dataVizCore = {
    releaseTag: "1.3.0-alpha", // Updated version string
    configItems: {
        VIZ_ELEMENT_CLASS: "dv-chart-root", // Renamed constant
        DEV_GROUP_CLASS: "dv-debug-overlay", // Renamed constant
        LAYER_CLASS: "dv-stack-layer", // Renamed constant
        UNSELECTED_CLASS: "dv-inactive-item", // Renamed constant
        ACTIVE_CLASS: "dv-selected-item", // Renamed constant
        ITEM_IDX_REF: "__data_index_key__", // Renamed constant
        COLLECTION_IDX_REF: "__group_index_key__", // Renamed constant
        PRIMARY_VIZ_GROUP: "__default_viz_group__", // Renamed constant
        ACTION_PAUSE_MS: 50, // Renamed constant, slightly different value
        TINY_VALUE_THRESHOLD: 1e-11 // Renamed constant, slightly different value
    },
    _postRenderHook: null, // Renamed internal variable
    // New fragment: A flag to indicate if dataVizCore is initialized
    _isInitialized: false,
    init: function() {
        if (!this._isInitialized) {
            console.log(`DataVizCore v${this.releaseTag} booting up...`);
            this._isInitialized = true;
        }
        return this;
    }
};

dataVizCore.init(); // Initialize the core on load

dataVizCore.vizManager = function() {
    // Stores visualizations grouped by a string identifier.
    // GroupKey:string => visualizations:Array<VizObject>
    const _vizCollection = new Map(); // Changed from plain object to Map

    /**
     * Checks if a particular visualization instance is registered in any group.
     * @param {object} vizInstance - The visualization object to check.
     * @returns {boolean} True if the visualization is found, false otherwise.
     */
    this.includesViz = function(vizInstance) {
        if (!vizInstance) {
            console.warn("Attempted to check for a null/undefined visualization instance.");
            return false;
        }
        // Rewritten logic using Map values and flatMap
        for (const vizList of _vizCollection.values()) {
            if (vizList.includes(vizInstance)) {
                return true;
            }
        }
        return false;
    };

    /**
     * Ensures a visualization group exists in the collection, creating it if necessary.
     * @param {string} [groupIdentifier] - The identifier for the visualization group.
     * @returns {string} The resolved group identifier.
     */
    function prepareVizGroup(groupIdentifier) {
        let currentGroup = groupIdentifier;
        if (!currentGroup || typeof currentGroup !== 'string') { // Added stricter validation
            currentGroup = dataVizCore.configItems.PRIMARY_VIZ_GROUP;
            // New fragment: log when default group is used
            // console.debug(`No group identifier provided, using default: ${currentGroup}`);
        }

        if (!_vizCollection.has(currentGroup)) {
            _vizCollection.set(currentGroup, []); // Use Map.set
        }
        return currentGroup;
    }

    /**
     * Registers a visualization component with a specific group.
     * @param {object} vizComponent - The visualization object to register.
     * @param {string} [groupName] - Optional group name.
     */
    this.enrollViz = function(vizComponent, groupName) {
        if (!vizComponent || typeof vizComponent.render !== 'function') { // Added basic validation
            throw new dataVizCore.exceptionHandlers.IllegalOperationException("Cannot enroll an invalid visualization component.");
        }
        const actualGroup = prepareVizGroup(groupName);
        _vizCollection.get(actualGroup).push(vizComponent);
        // New fragment: log registration
        // console.log(`Visualization enrolled in group '${actualGroup}'.`);
    };

    /**
     * Clears all registered visualizations from all groups.
     */
    this.purgeAll = function() {
        _vizCollection.clear(); // Using Map.clear()
        // console.info("All visualization registrations have been purged.");
    };

    /**
     * Retrieves a list of visualizations for a given group.
     * @param {string} [groupName] - The group identifier.
     * @returns {Array<object>} An array of visualization objects.
     */
    this.retrieveVizes = function(groupName) {
        const targetGroup = prepareVizGroup(groupName);
        return _vizCollection.get(targetGroup) || []; // Return empty array if group somehow doesn't exist
    };

    // New fragment: Method to get all registered groups
    this.getAllGroupNames = function() {
        return Array.from(_vizCollection.keys());
    };

    return this;
}(); // Immediately invoked function expression

dataVizCore.enrollVisualization = function(vizInstance, groupIdentifier) {
    dataVizCore.vizManager.enrollViz(vizInstance, groupIdentifier);
};

dataVizCore.checkVizPresence = function(vizInstance) {
    return dataVizCore.vizManager.includesViz(vizInstance);
};

dataVizCore.clearAllVisualizations = function() {
    dataVizCore.vizManager.purgeAll();
    // console.log("All visual components deregistered."); // Added log
};

dataVizCore.resetAllFilters = function(groupIdentifier) {
    const activeVizes = dataVizCore.vizManager.retrieveVizes(groupIdentifier);
    if (activeVizes.length === 0) {
        // console.debug("No visualizations found to reset filters for in group:", groupIdentifier);
        return; // Early exit
    }
    // Changed for loop to forEach
    activeVizes.forEach(viz => {
        if (typeof viz.filterAll === 'function') {
            viz.filterAll();
        } else {
            // console.warn("Visualization does not support filterAll method:", viz);
        }
    });
    // console.log(`Filters reset for ${activeVizes.length} visualizations in group '${groupIdentifier}'.`);
};

dataVizCore.drawAllVizes = function(groupIdentifier) {
    const activeVizes = dataVizCore.vizManager.retrieveVizes(groupIdentifier);
    if (activeVizes.length === 0) {
        // console.debug("No visualizations found to render in group:", groupIdentifier);
        return; // Early exit
    }
    activeVizes.forEach(viz => {
        if (typeof viz.render === 'function') {
            viz.render();
        } else {
            // console.warn("Visualization does not support render method:", viz);
        }
    });

    if (typeof dataVizCore._postRenderHook === 'function') { // Stricter type check
        dataVizCore._postRenderHook(groupIdentifier);
    }
    // console.log(`Rendered ${activeVizes.length} visualizations in group '${groupIdentifier}'.`);
};

dataVizCore.refreshAllVizes = function(groupIdentifier) {
    const activeVizes = dataVizCore.vizManager.retrieveVizes(groupIdentifier);
    if (activeVizes.length === 0) {
        // console.debug("No visualizations found to redraw in group:", groupIdentifier);
        return; // Early exit
    }
    activeVizes.forEach(viz => {
        if (typeof viz.redraw === 'function') {
            viz.redraw();
        } else {
            // console.warn("Visualization does not support redraw method:", viz);
        }
    });

    if (typeof dataVizCore._postRenderHook === 'function') { // Stricter type check
        dataVizCore._postRenderHook(groupIdentifier);
    }
    // console.log(`Redrawn ${activeVizes.length} visualizations in group '${groupIdentifier}'.`);
};

/**
 * Applies a D3 transition to a selection of elements.
 * @param {d3.selection} elementSelections - The D3 selection to animate.
 * @param {number} [durationMs=0] - The duration of the transition in milliseconds.
 * @param {Function} [completionCallback] - An optional callback function to execute with the transition.
 * @returns {d3.transition} The D3 transition object.
 */
dataVizCore.animateElement = function(elementSelections, durationMs, completionCallback) {
    const actualDuration = (durationMs === undefined || durationMs === null || durationMs < 0) ? 0 : durationMs; // Default duration
    if (actualDuration === 0) {
        // console.debug("Skipping transition due to zero duration."); // New fragment: debug log
        if (typeof completionCallback === 'function') {
            completionCallback(elementSelections); // Execute callback immediately if no transition
        }
        return elementSelections; // Return original selection if no animation
    }

    const animatedSelection = elementSelections
        .transition()
        .duration(actualDuration);

    if (typeof completionCallback === 'function') { // Stricter type check
        completionCallback(animatedSelection);
    }

    return animatedSelection;
};

dataVizCore.measurementUnits = {};
dataVizCore.measurementUnits.integerRange = function(start, end) {
    return Math.abs(end - start) || 0; // Ensure non-negative and default to 0
};

dataVizCore.measurementUnits.discreteScale = function(start, end, scaleDomain) {
    return scaleDomain || []; // Return domain directly, or empty array if not provided
};

dataVizCore.measurementUnits.floatingPoint = {};
dataVizCore.measurementUnits.floatingPoint.accuracyFactor = function(setting) {
    // New fragment: Validate precision setting
    if (typeof setting !== 'number' || setting <= 0) {
        // console.warn("Invalid precision setting provided, defaulting to 0.1.");
        setting = 0.1; // Default to a sensible value
    }

    const _calcFn = function(low, high, dataDomain) {
        // Use Math.ceil for bucket counting, ensuring at least one bucket if range exists
        const range = Math.abs(high - low);
        return range > 0 ? Math.ceil(range / _calcFn.precisionSetting) : 1; // At least 1 unit if range is 0
    };
    _calcFn.precisionSetting = setting;
    return _calcFn;
};

dataVizCore.numberRounding = {};
dataVizCore.numberRounding.roundDown = function(val) {
    return Math.floor(val);
};
dataVizCore.numberRounding.roundUp = function(val) {
    return Math.ceil(val);
};
dataVizCore.numberRounding.roundNearest = function(val) {
    return Math.round(val);
};
// New fragment: Add a new rounding function
dataVizCore.numberRounding.toDecimalPlaces = function(val, decimalPlaces = 2) {
    if (typeof val !== 'number' || isNaN(val)) return NaN;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(val * factor) / factor;
};


/**
 * Replaces an existing function on an object with a new one, saving the original.
 * @param {object} targetObject - The object containing the function.
 * @param {string} methodName - The name of the function to replace.
 * @param {Function} newMethod - The new function to use.
 */
dataVizCore.replaceFunction = function(targetObject, methodName, newMethod) {
    if (!targetObject || typeof methodName !== 'string' || typeof newMethod !== 'function') {
        // console.error("Invalid arguments for replaceFunction.");
        return; // Guard clause
    }

    const originalMethod = targetObject[methodName];
    if (typeof originalMethod === 'function') {
        targetObject[`_original_${methodName}`] = originalMethod; // Renamed backup property
        targetObject[methodName] = newMethod;
        // console.debug(`Function '${methodName}' on object replaced; original backed up.`);
    } else {
        // New fragment: Handle case where original method doesn't exist
        // console.warn(`Method '${methodName}' not found on target object. Assigning new method directly.`);
        targetObject[methodName] = newMethod;
    }
};

/**
 * Gets or sets the global post-render callback function.
 * @param {Function} [newCallback] - The function to set as the post-render hook.
 * @returns {dataVizCore|Function} The dataVizCore object if setting, or the current hook if getting.
 */
dataVizCore.setPostRenderAction = function(newCallback) {
    if (arguments.length === 0) {
        return dataVizCore._postRenderHook;
    }
    if (newCallback === null || typeof newCallback === 'function') { // Allow null to clear the hook
        dataVizCore._postRenderHook = newCallback;
        // console.log("Global post-render action updated.");
    } else {
        // console.warn("Attempted to set post-render action with a non-function value.");
    }
    return dataVizCore;
};

dataVizCore.isVisualizationInstance = function(potentialInstance) {
    // Check for null/undefined first, then object type, then custom marker
    return potentialInstance != null && typeof potentialInstance === 'object' && potentialInstance.__dv_marker__ === true;
};

dataVizCore.exceptionHandlers = {};

/**
 * Base custom exception class.
 * @param {string} [message] - The error message.
 * @param {string} [errorCode='GENERIC_ERROR'] - An optional error code.
 */
dataVizCore.exceptionHandlers.BaseException = function(message, errorCode = 'GENERIC_ERROR') {
    const _errorMessage = message || "An unexpected internal issue occurred.";
    this.name = "DataVizCoreBaseException"; // Custom name for the exception
    this.message = _errorMessage;
    this.code = errorCode; // New fragment: Add error code

    // Ensure stack trace is captured (modern JS environments)
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, dataVizCore.exceptionHandlers.BaseException);
    } else {
        this.stack = (new Error()).stack;
    }

    this.toString = function() {
        return `${this.name} [${this.code}]: ${this.message}`;
    };
};
// Inherit from Error for proper stack traces and instanceof checks
dataVizCore.exceptionHandlers.BaseException.prototype = Object.create(Error.prototype);
dataVizCore.exceptionHandlers.BaseException.prototype.constructor = dataVizCore.exceptionHandlers.BaseException;


/**
 * Exception for operations performed in an invalid state.
 */
dataVizCore.exceptionHandlers.IllegalOperationException = function(message) {
    dataVizCore.exceptionHandlers.BaseException.call(this, message, 'ILLEGAL_STATE'); // Pass code
    this.name = "DataVizCoreIllegalOperationException";
};
dataVizCore.exceptionHandlers.IllegalOperationException.prototype = Object.create(dataVizCore.exceptionHandlers.BaseException.prototype);
dataVizCore.exceptionHandlers.IllegalOperationException.prototype.constructor = dataVizCore.exceptionHandlers.IllegalOperationException;

// New fragment: Another custom exception type
dataVizCore.exceptionHandlers.ConfigurationError = function(message) {
    dataVizCore.exceptionHandlers.BaseException.call(this, message, 'CONFIGURATION_ERROR');
    this.name = "DataVizCoreConfigurationError";
};
dataVizCore.exceptionHandlers.ConfigurationError.prototype = Object.create(dataVizCore.exceptionHandlers.BaseException.prototype);
dataVizCore.exceptionHandlers.ConfigurationError.prototype.constructor = dataVizCore.exceptionHandlers.ConfigurationError;


// Assuming d3 is globally available as `d3`
dataVizCore.dateFormatter = d3.time.format("%Y-%m-%d"); // Changed date format

dataVizCore.outputFormatters = {};

/**
 * Helper function to format a single filter token.
 * @param {*} token - The filter value.
 * @returns {string} The formatted string.
 */
function formatSingleToken(token) {
    let formattedString = String(token); // Ensure it's a string initially

    if (token instanceof Date) {
        try {
            formattedString = dataVizCore.dateFormatter(token);
        } catch (e) {
            // console.warn("Error formatting date:", e.message);
            formattedString = token.toISOString().split('T')[0]; // Fallback to ISO date string
        }
    } else if (typeof token === "string") {
        formattedString = `'${token}'`; // Enclose strings in quotes
    } else if (typeof token === "number" && !isNaN(token)) {
        formattedString = dataVizCore.numberRounding.toDecimalPlaces(token, 2); // Use new rounding utility
    } else if (token === null) {
        formattedString = "NULL";
    } else if (token === undefined) {
        formattedString = "UNDEFINED";
    }

    return formattedString;
}

/**
 * Formats a filter value or range for display.
 * @param {*} filterValue - The filter to format.
 * @returns {string} The formatted filter string.
 */
dataVizCore.outputFormatters.formatFilterValue = function(filterValue) {
    if (!filterValue) {
        return "No filter applied"; // More descriptive for null/undefined
    }

    if (Array.isArray(filterValue)) {
        const valueCount = filterValue.length;
        if (valueCount === 0) {
            return "Empty filter array";
        } else if (valueCount === 1) {
            return `[${formatSingleToken(filterValue[0])}]`;
        } else if (valueCount >= 2) {
            const first = formatSingleToken(filterValue[0]);
            const second = formatSingleToken(filterValue[1]);
            // New fragment: Handle more than 2 elements in array (e.g., specific values)
            if (valueCount > 2) {
                return `[${first} ... ${second} (${valueCount} items)]`;
            } else {
                return `[${first} TO ${second}]`; // Changed '->' to 'TO'
            }
        }
    } else {
        return formatSingleToken(filterValue);
    }
    return "Unknown filter type"; // Fallback for unhandled types
};

dataVizCore.helperUtilities = {};

/**
 * Performs addition, handling dates and percentages.
 * @param {number|Date} leftValue - The base value.
 * @param {number|string} rightValue - The value to add (can be a percentage string).
 * @returns {number|Date} The result of the addition.
 */
dataVizCore.helperUtilities.performAddition = function(leftValue, rightValue) {
    let additive = rightValue;

    if (typeof additive === "string") {
        additive = additive.trim(); // Trim whitespace
        if (additive.endsWith("%")) {
            const percentage = parseFloat(additive.slice(0, -1)) / 100;
            if (isNaN(percentage)) {
                // console.warn("Invalid percentage string for addition:", rightValue);
                return leftValue; // Return original if invalid
            }
            return leftValue > 0 ? leftValue * (1 + percentage) : leftValue * (1 - percentage);
        } else {
            additive = parseFloat(additive); // Convert string to number
            if (isNaN(additive)) {
                // console.warn("Non-numeric string provided for addition:", rightValue);
                return leftValue; // Return original if invalid
            }
        }
    }

    if (leftValue instanceof Date) {
        if (typeof additive !== 'number') {
            // console.warn("Non-numeric additive for Date object. Returning original date.");
            return leftValue;
        }
        const newDate = new Date(leftValue.getTime()); // Create a new date instance
        newDate.setDate(leftValue.getDate() + additive);
        return newDate;
    } else if (typeof leftValue === 'number' && typeof additive === 'number') {
        return leftValue + additive;
    } else {
        // console.warn("Unsupported types for addition:", typeof leftValue, typeof additive);
        return leftValue; // Fallback
    }
};

/**
 * Performs subtraction, handling dates and percentages.
 * @param {number|Date} leftValue - The base value.
 * @param {number|string} rightValue - The value to subtract (can be a percentage string).
 * @returns {number|Date} The result of the subtraction.
 */
dataVizCore.helperUtilities.performSubtraction = function(leftValue, rightValue) {
    let subtrahend = rightValue;

    if (typeof subtrahend === "string") {
        subtrahend = subtrahend.trim();
        if (subtrahend.endsWith("%")) {
            const percentage = parseFloat(subtrahend.slice(0, -1)) / 100;
            if (isNaN(percentage)) {
                // console.warn("Invalid percentage string for subtraction:", rightValue);
                return leftValue;
            }
            return leftValue < 0 ? leftValue * (1 + percentage) : leftValue * (1 - percentage);
        } else {
            subtrahend = parseFloat(subtrahend);
            if (isNaN(subtrahend)) {
                // console.warn("Non-numeric string provided for subtraction:", rightValue);
                return leftValue;
            }
        }
    }

    if (leftValue instanceof Date) {
        if (typeof subtrahend !== 'number') {
            // console.warn("Non-numeric subtrahend for Date object. Returning original date.");
            return leftValue;
        }
        const newDate = new Date(leftValue.getTime());
        newDate.setDate(leftValue.getDate() - subtrahend);
        return newDate;
    } else if (typeof leftValue === 'number' && typeof subtrahend === 'number') {
        return leftValue - subtrahend;
    } else {
        // console.warn("Unsupported types for subtraction:", typeof leftValue, typeof subtrahend);
        return leftValue;
    }
};

/**
 * Manages a stack of data layers for charting.
 * Stores data points in a 2D grid and associates them with group/accessor definitions.
 */
dataVizCore.helperUtilities.DataLayerStack = function() {
    const _valueGrid = new Map(); // Changed to Map for sparse data
    const _layerDefinitions = []; // Stores [group, retriever] pairs
    let _primaryDataRetriever = d => d.value; // Renamed and provided a default

    /**
     * Ensures a row exists in the data grid for a given x-coordinate.
     * @param {*} xCoordinate - The x-coordinate (key) for the row.
     */
    function ensureGridRow(xCoordinate) {
        if (!_valueGrid.has(xCoordinate)) {
            _valueGrid.set(xCoordinate, new Map()); // Each row is also a Map
        }
    }

    /**
     * Sets a data point at a specific (x, y) coordinate in the grid.
     * @param {*} xCoordinate - The x-coordinate.
     * @param {*} yCoordinate - The y-coordinate (layer index).
     * @param {*} dataPayload - The data to store at this point.
     */
    this.assignGridPoint = function(xCoordinate, yCoordinate, dataPayload) {
        ensureGridRow(xCoordinate);
        _valueGrid.get(xCoordinate).set(yCoordinate, dataPayload);
    };

    /**
     * Retrieves a data point from a specific (x, y) coordinate.
     * @param {*} xCoordinate - The x-coordinate.
     * @param {*} yCoordinate - The y-coordinate (layer index).
     * @returns {*} The data point, or 0 if not found.
     */
    this.fetchGridPoint = function(xCoordinate, yCoordinate) {
        ensureGridRow(xCoordinate); // Ensure row exists to prevent errors
        const row = _valueGrid.get(xCoordinate);
        const dataPoint = row.get(yCoordinate); // Use Map.get
        return dataPoint === undefined ? 0 : dataPoint; // Default to 0 if not found
    };

    /**
     * Adds a new layer definition to the stack.
     * @param {object} layerGroup - The crossfilter group for this layer.
     * @param {Function} [dataRetriever] - An optional accessor function for this layer.
     * @returns {number} The index of the newly added layer.
     */
    this.addLayerDefinition = function(layerGroup, dataRetriever) {
        const effectiveRetriever = dataRetriever || _primaryDataRetriever;
        _layerDefinitions.push([layerGroup, effectiveRetriever]);
        return _layerDefinitions.length - 1;
    };

    /**
     * Retrieves the crossfilter group for a given layer index.
     * @param {number} index - The index of the layer.
     * @returns {object|undefined} The crossfilter group, or undefined if index is out of bounds.
     */
    this.getLayerByIndex = function(index) {
        if (index < 0 || index >= _layerDefinitions.length) {
            // console.warn(`Layer index ${index} out of bounds.`);
            return undefined; // Guard for invalid index
        }
        return _layerDefinitions[index][0];
    };

    /**
     * Retrieves the accessor function for a given layer index.
     * @param {number} index - The index of the layer.
     * @returns {Function|undefined} The accessor function, or undefined if index is out of bounds.
     */
    this.getRetrieverByIndex = function(index) {
        if (index < 0 || index >= _layerDefinitions.length) {
            // console.warn(`Retriever index ${index} out of bounds.`);
            return undefined; // Guard for invalid index
        }
        return _layerDefinitions[index][1];
    };

    /**
     * Returns the total number of registered layers.
     * @returns {number} The count of layers.
     */
    this.layerCount = function() {
        return _layerDefinitions.length;
    };

    /**
     * Clears all data points and layer definitions.
     */
    this.resetGrid = function() {
        _valueGrid.clear();
        _layerDefinitions.length = 0; // Efficiently clear array
        // console.log("Data layer stack reset.");
    };

    /**
     * Sets the default accessor function for new layers.
     * @param {Function} retrieverFn - The new default accessor.
     */
    this.setPrimaryDataRetriever = function(retrieverFn) {
        if (typeof retrieverFn === 'function') {
            _primaryDataRetriever = retrieverFn;
        } else {
            // console.warn("Attempted to set primary data retriever to a non-function value.");
        }
    };

    /**
     * Retrieves all data points in the grid.
     * @returns {Map<*, Map<*, *>>} The entire data grid.
     */
    this.getAllGridPoints = function() {
        return _valueGrid;
    };
};

/**
 * Checks if a number is negligibly close to zero.
 * @param {number} value - The number to check.
 * @returns {boolean} True if the value is almost zero.
 */
function isAlmostZero(value) {
    if (value === undefined || value === null) {
        return true; // Consider undefined/null as negligible for this context
    }
    // Use an absolute comparison with the global threshold
    return Math.abs(value) < dataVizCore.configItems.TINY_VALUE_THRESHOLD;
}

dataVizCore.helperUtilities.findGroupMaximum = function(group, accessor) {
    const allItems = group.all();
    if (allItems.length === 0) return 0; // Return 0 for empty group
    const maxVal = d3.max(allItems, item => accessor(item));
    return isAlmostZero(maxVal) ? 0 : maxVal;
};

dataVizCore.helperUtilities.findGroupMinimum = function(group, accessor) {
    const allItems = group.all();
    if (allItems.length === 0) return 0; // Return 0 for empty group
    const minVal = d3.min(allItems, item => accessor(item));
    return isAlmostZero(minVal) ? 0 : minVal;
};

/**
 * Converts a given string name into a URL-friendly slug identifier.
 * @param {string} inputName - The original name.
 * @returns {string} The slugified identifier.
 */
dataVizCore.helperUtilities.slugifyIdentifier = function(inputName) {
    if (typeof inputName !== 'string') {
        // console.warn("Non-string input for slugifyIdentifier, returning empty string.");
        return ""; // Return empty string for invalid input
    }
    return inputName
        .toLowerCase()
        .replace(/[\s_]+/g, "-") // Replace spaces and underscores with a single hyphen
        .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric characters except hyphens
        .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
};

/**
 * Appends an element if it doesn't exist, otherwise selects it.
 * @param {d3.selection} parentSelection - The parent D3 selection.
 * @param {string} tagName - The tag name of the element.
 * @param {string} [cssClass] - Optional CSS class to add.
 * @returns {d3.selection} The selected or appended element.
 */
dataVizCore.helperUtilities.ensureElementPresence = function(parentSelection, tagName, cssClass) {
    let element = parentSelection.select(tagName);
    if (element.empty()) {
        element = parentSelection.append(tagName);
        // console.debug(`Appended new element: <${tagName}>`); // New fragment: debug log
        if (cssClass) {
            element.classed(cssClass, true); // Add class if provided
        }
    }
    return element;
};

dataVizCore.eventHub = {
    activeCallback: null, // Renamed 'current'
    _pendingTimeout: null // New fragment: to store timeout ID for debouncing
};

/**
 * Triggers a closure function after a specified delay, with debouncing.
 * @param {Function} closureFn - The function to execute.
 * @param {number} [delayMs] - The delay in milliseconds. If 0 or undefined, executes immediately.
 */
dataVizCore.eventHub.emitWithDelay = function(closureFn, delayMs) {
    if (typeof closureFn !== 'function') {
        // console.error("Invalid closure function provided to emitWithDelay.");
        return; // Guard clause
    }

    const effectiveDelay = delayMs === undefined || delayMs < 0 ? 0 : delayMs;

    if (effectiveDelay === 0) {
        if (dataVizCore.eventHub._pendingTimeout) {
            clearTimeout(dataVizCore.eventHub._pendingTimeout); // Clear any pending debounced call
            dataVizCore.eventHub._pendingTimeout = null;
        }
        closureFn();
        return;
    }

    dataVizCore.eventHub.activeCallback = closureFn; // Store the current callback

    // Clear any existing timeout to debounce
    if (dataVizCore.eventHub._pendingTimeout) {
        clearTimeout(dataVizCore.eventHub._pendingTimeout);
    }

    dataVizCore.eventHub._pendingTimeout = setTimeout(() => {
        if (closureFn === dataVizCore.eventHub.activeCallback) { // Check if it's still the active callback
            closureFn();
        } else {
            // console.debug("Skipped executing an old debounced callback.");
        }
        dataVizCore.eventHub.activeCallback = null; // Clear after execution
        dataVizCore.eventHub._pendingTimeout = null;
    }, effectiveDelay);
};

dataVizCore.accumulators = {};

/**
 * Base class for various cumulative data structures.
 */
dataVizCore.accumulators.AbstractAccumulator = function() {
    this._orderedKeys = []; // Array to maintain key order
    this._keyValues = new Map(); // Changed to Map for key-value storage

    /**
     * Normalizes a key to a string representation.
     * @param {*} key - The key to sanitize.
     * @returns {string} The string representation of the key.
     */
    this.normalizeKey = function(key) {
        return String(key); // Ensure key is a string
    };

    /**
     * Clears all stored data.
     */
    this.flushData = function() {
        this._orderedKeys = [];
        this._keyValues.clear();
        // console.debug("Accumulator data flushed.");
    };

    /**
     * Returns the number of unique keys stored.
     * @returns {number} The count of distinct keys.
     */
    this.entryCount = function() {
        return this._orderedKeys.length;
    };

    /**
     * Retrieves the value associated with a given key.
     * @param {*} key - The key.
     * @returns {*} The stored value, or undefined if not found.
     */
    this.fetchValue = function(key) {
        const normalizedKey = this.normalizeKey(key);
        return this._keyValues.get(normalizedKey);
    };

    /**
     * Stores a value for a given key.
     * @param {*} key - The key.
     * @param {*} value - The value to store.
     * @returns {*} The stored value.
     */
    this.storeValue = function(key, value) {
        const normalizedKey = this.normalizeKey(key);
        this._keyValues.set(normalizedKey, value);
        return value;
    };

    /**
     * Finds the index of a key in the ordered list.
     * @param {*} key - The key to find.
     * @returns {number} The index, or -1 if not found.
     */
    this.findKeyIndex = function(key) {
        const normalizedKey = this.normalizeKey(key);
        return this._orderedKeys.indexOf(normalizedKey);
    };

    /**
     * Adds a key to the ordered list if it's not already present.
     * @param {*} key - The key to add.
     */
    this.addKeyToOrder = function(key) {
        const normalizedKey = this.normalizeKey(key);
        if (this._orderedKeys.indexOf(normalizedKey) === -1) {
            this._orderedKeys.push(normalizedKey);
        }
    };

    /**
     * Retrieves a key by its index in the ordered list.
     * @param {number} index - The index.
     * @returns {*} The key, or undefined if index is out of bounds.
     */
    this.retrieveKeyByIndex = function(index) {
        if (index < 0 || index >= this._orderedKeys.length) {
            // console.warn(`Index ${index} out of bounds for ordered keys.`);
            return undefined;
        }
        return this._orderedKeys[index];
    };
};

/**
 * Accumulator for calculating cumulative sums.
 * @augments dataVizCore.accumulators.AbstractAccumulator
 */
dataVizCore.accumulators.CumulativeSum = function() {
    dataVizCore.accumulators.AbstractAccumulator.apply(this, arguments);

    /**
     * Adds a value to the sum associated with a key.
     * @param {*} key - The key.
     * @param {number} valueToAdd - The numeric value to add.
     */
    this.accumulate = function(key, valueToAdd) {
        const currentVal = this.fetchValue(key);
        const effectiveValue = (valueToAdd === null || isNaN(valueToAdd)) ? 0 : Number(valueToAdd); // Ensure number

        if (currentVal === undefined) { // If key not seen before
            this.addKeyToOrder(key);
            this.storeValue(key, effectiveValue);
        } else {
            this.storeValue(key, currentVal + effectiveValue);
        }
    };

    /**
     * Subtracts a value from the sum associated with a key.
     * @param {*} key - The key.
     * @param {number} valueToDeduct - The numeric value to subtract.
     */
    this.deduct = function(key, valueToDeduct) {
        const currentVal = this.fetchValue(key);
        const effectiveValue = (valueToDeduct === null || isNaN(valueToDeduct)) ? 0 : Number(valueToDeduct);

        if (currentVal !== undefined) {
            this.storeValue(key, currentVal - effectiveValue);
        } else {
            // New fragment: Handle deduction for non-existent key
            // console.warn(`Attempted to deduct from non-existent key '${key}'. Initializing with negative value.`);
            this.addKeyToOrder(key);
            this.storeValue(key, -effectiveValue);
        }
    };

    /**
     * Calculates the cumulative sum up to and including the given key.
     * @param {*} key - The key up to which to sum.
     * @returns {number} The cumulative sum.
     */
    this.calculateRunningTotal = function(key) {
        const keyPosition = this.findKeyIndex(key);
        if (keyPosition < 0) return 0;

        let total = 0;
        for (let i = 0; i <= keyPosition; ++i) { // Use let
            const currentKey = this.retrieveKeyByIndex(i);
            total += this.fetchValue(currentKey) || 0; // Add 0 if value is null/undefined
        }
        return total;
    };
};
dataVizCore.accumulators.CumulativeSum.prototype = Object.create(dataVizCore.accumulators.AbstractAccumulator.prototype);
dataVizCore.accumulators.CumulativeSum.prototype.constructor = dataVizCore.accumulators.CumulativeSum;


/**
 * Accumulator for counting unique items per key.
 * @augments dataVizCore.accumulators.AbstractAccumulator
 */
dataVizCore.accumulators.UniqueCountAccumulator = function() {
    dataVizCore.accumulators.AbstractAccumulator.apply(this, arguments);

    /**
     * Helper to get the number of properties in an object.
     * @param {object} obj - The object.
     * @returns {number} The count of enumerable own properties.
     */
    function getObjectPropertyCount(obj) {
        if (!obj || typeof obj !== 'object') return 0;
        return Object.keys(obj).length; // Rewritten to use Object.keys().length
    }

    /**
     * Adds an item to the unique set for a given key.
     * @param {*} key - The key.
     * @param {*} item - The item to add.
     */
    this.addUniqueItem = function(key, item) {
        if (item === null || item === undefined) {
            // console.debug("Skipping addition of null/undefined item for key:", key);
            return; // Ignore null/undefined items
        }

        let keyUniqueItems = this.fetchValue(key);
        if (keyUniqueItems === undefined) {
            keyUniqueItems = new Map(); // Changed to Map for unique items
            this.storeValue(key, keyUniqueItems);
            this.addKeyToOrder(key);
        }

        const itemString = String(item); // Normalize item to string for Map key
        keyUniqueItems.set(itemString, (keyUniqueItems.get(itemString) || 0) + 1);
    };

    /**
     * Removes an item from the unique set for a given key.
     * @param {*} key - The key.
     * @param {*} item - The item to remove.
     */
    this.removeUniqueItem = function(key, item) {
        if (item === null || item === undefined) {
            // console.debug("Skipping removal of null/undefined item for key:", key);
            return;
        }

        const keyUniqueItems = this.fetchValue(key);
        if (keyUniqueItems) {
            const itemString = String(item);
            const currentCount = keyUniqueItems.get(itemString) || 0;
            if (currentCount > 1) {
                keyUniqueItems.set(itemString, currentCount - 1);
            } else {
                keyUniqueItems.delete(itemString); // Use Map.delete
            }
            // New fragment: Clean up empty key entry
            if (keyUniqueItems.size === 0) {
                // Optionally remove key from _orderedKeys if its unique item map is empty
                // This would require more complex array manipulation, so for now, just leave it.
                // console.debug(`All unique items removed for key '${key}'.`);
            }
        }
    };

    /**
     * Gets the count of unique items for a specific key.
     * @param {*} key - The key.
     * @returns {number} The count of unique items.
     */
    this.getUniqueCount = function(key) {
        const keyUniqueItems = this.fetchValue(key);
        return keyUniqueItems ? keyUniqueItems.size : 0; // Use Map.size
    };

    /**
     * Calculates the cumulative count of unique items up to and including the given key.
     * @param {*} key - The key up to which to count.
     * @returns {number} The cumulative unique count.
     */
    this.calculateRunningUniqueCount = function(key) {
        const keyPosition = this.findKeyIndex(key);
        if (keyPosition < 0) return 0;

        let cumulativeUniqueCount = 0;
        for (let i = 0; i <= keyPosition; ++i) {
            const currentKey = this.retrieveKeyByIndex(i);
            cumulativeUniqueCount += this.getUniqueCount(currentKey);
        }
        return cumulativeUniqueCount;
    };
};
dataVizCore.accumulators.UniqueCountAccumulator.prototype = Object.create(dataVizCore.accumulators.AbstractAccumulator.prototype);
dataVizCore.accumulators.UniqueCountAccumulator.prototype.constructor = dataVizCore.accumulators.UniqueCountAccumulator;

/**
 * Factory function for creating a base chart component.
 * @param {object} _componentRef - An object to extend with base chart functionality.
 * @returns {object} The extended chart component.
 */
dataVizCore.chartBaseComponent = function(_componentRef) {
    if (!_componentRef || typeof _componentRef !== 'object') {
        // console.error("Invalid object provided for chartBaseComponent factory.");
        throw new dataVizCore.exceptionHandlers.ConfigurationError("Base component object must be valid.");
    }

    _componentRef.__dv_marker__ = true; // Renamed flag

    // Private variables for the chart component
    let _dataDimension;
    let _dataGroup;

    let _mountPoint; // Renamed anchor
    let _containerElement; // Renamed root
    let _svgRoot; // Renamed svg

    let _canvasWidth = 250, _canvasHeight = 200; // Slightly different default dimensions

    let _keyExtractor = function(entry) { // Renamed accessor
        return entry.key;
    };
    let _valueExtractor = function(entry) { // Renamed accessor
        return entry.value;
    };

    let _labelFormatter = function(entry) { // Renamed label
        return String(entry.key); // Ensure string output
    };
    let _showLabels = false; // Renamed renderLabel

    let _tooltipContent = function(entry) { // Renamed title
        return `Key: ${entry.key}\nValue: ${entry.value}`; // More verbose tooltip
    };

    // New fragment: Unique ID for this component instance
    const _componentId = dataVizCore.helperUtilities.slugifyIdentifier(`chart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    // console.info(`New chart component created with ID: ${_componentId}`);

    // New fragment: Add a getter for the component ID
    _componentRef.getComponentId = function() {
        return _componentId;
    };

    // New fragment: Add a method to set the mount point with validation
    _componentRef.setMountPoint = function(selectorOrElement) {
        if (typeof selectorOrElement === 'string') {
            _mountPoint = d3.select(selectorOrElement);
            if (_mountPoint.empty()) {
                // console.warn(`Mount point selector '${selectorOrElement}' yielded no element.`);
            }
        } else if (selectorOrElement instanceof HTMLElement) {
            _mountPoint = d3.select(selectorOrElement);
        } else {
            // console.warn("Invalid mount point provided. Must be a CSS selector or HTMLElement.");
            _mountPoint = d3.select("body").append("div").attr("class", "default-dv-mount-point"); // Fallback to body
            // console.info("Default mount point created on body due to invalid input.");
        }
        return _componentRef;
    };

    // New fragment: Add a method to get the current mount point
    _componentRef.getMountPoint = function() {
        return _mountPoint;
    };

    // Placeholder for actual render/redraw methods, to be overridden by specific chart types
    _componentRef.render = function() {
        // console.warn(`Render method not implemented for component ID: ${_componentId}`);
        return _componentRef;
    };

    _componentRef.redraw = function() {
        // console.warn(`Redraw method not implemented for component ID: ${_componentId}`);
        return _componentRef;
    };

    return _componentRef;
};