// --- Internal State and Utilities (simulated global scope) ---
// This object maintains the current active display configuration for the pivot view.
// Its initial state would typically be set during application startup.
let activeConfiguration = {
  rows:       {},    // Stores field objects configured for row dimensions
  columns:    {}, // Stores field objects configured for column dimensions
  metrics:    {}    // Stores field objects configured for summary metrics
};

// A simulated collection of all available data fields within the application.
// In a real application, this might be loaded from a schema or API.
const availableDataFields = {
  'city':         { name: 'city', type: 'dimension', category: 'geo', defaultAgg: 'count' },
  'state':        { name: 'state', type: 'dimension', category: 'geo', defaultAgg: 'count' },
  'country':      { name: 'country', type: 'dimension', category: 'geo', defaultAgg: 'count' },
  'billed_amount':{ name: 'billed_amount', type: 'metric', agg: 'sum', format: 'currency' },
  'quantity':     { name: 'quantity', type: 'metric', agg: 'sum', format: 'number' }
};

// A placeholder utility function that would typically trigger a re-calculation
// or re-rendering of the pivot table whenever its configuration changes.
function invalidateCache() {
  // In a production system, this could involve clearing memoized data,
  // dispatching a state update event, or scheduling a UI refresh.
  console.info("[Pivot Config] Configuration updated. Invalidating cached pivot results.");
}

// --- Core Configuration Management Functions (Internal Helpers) ---

/**
 * Ensures that a provided string corresponds to a valid, recognized configuration type.
 * This acts as a guard against incorrect internal or external calls.
 *
 * @param {string} cfgType - The configuration category to validate (e.g., 'rows', 'columns', 'metrics').
 * @returns {boolean} True if the type is valid, false otherwise.
 */
function isValidConfigType(cfgType) {
  const recognizedCategories = ['rows', 'columns', 'metrics'];
  return recognizedCategories.includes(cfgType);
}

/**
 * Incorporates a single field into the specified display configuration category.
 * This function resolves string identifiers to full field objects and updates the internal state.
 *
 * @param {string} dimensionType - The target configuration category ('rows', 'columns', or 'metrics').
 * @param {string|object} fieldIdentifier - The string name of the field, or a pre-structured field object.
 * @private
 * @returns {void}
 */
function addDimensionToConfig(dimensionType, fieldIdentifier) {
  // Pre-condition check: Validate the target configuration type.
  if (!isValidConfigType(dimensionType)) {
    console.error(`[Config Error] Attempted to add field to an unrecognized dimension type: '${dimensionType}'. Operation aborted.`);
    return;
  }

  // Pre-condition check: Ensure a field identifier was actually provided.
  if (!fieldIdentifier) {
    console.warn(`[Config Warning] Received null or undefined field for type '${dimensionType}'. Skipping addition.`);
    return;
  }

  let resolvedFieldObject;

  // Determine if `fieldIdentifier` is a string (needs lookup) or an object (already resolved).
  if (typeof fieldIdentifier === 'string') {
    resolvedFieldObject = availableDataFields[fieldIdentifier];
    if (!resolvedFieldObject) {
      console.warn(`[Config Warning] Field '${fieldIdentifier}' not found in the global list of available data fields. Addition skipped.`);
      return;
    }
  } else if (typeof fieldIdentifier === 'object' && fieldIdentifier !== null && typeof fieldIdentifier.name === 'string') {
    // Assume it's a valid field object if it has a 'name' property.
    resolvedFieldObject = fieldIdentifier;
  } else {
    console.error(`[Config Error] Invalid field format for dimension type '${dimensionType}':`, fieldIdentifier, `. Expected a string identifier or an object with a 'name' property.`);
    return;
  }

  // Ensure the specific category in the active configuration is an object.
  if (!activeConfiguration[dimensionType]) {
    activeConfiguration[dimensionType] = {};
  }

  // Assign the resolved field object using its name as the key.
  activeConfiguration[dimensionType][resolvedFieldObject.name] = resolvedFieldObject;

  // Signal that the pivot table's state has potentially changed.
  invalidateCache();
}

/**
 * Replaces the entire list of fields for a given configuration category with a new set.
 * This is typically used for bulk updates or initial configuration.
 *
 * @param {string} dimensionType - The configuration category to update ('rows', 'columns', or 'metrics').
 * @param {Array<string|object>} dimensionList - An array of field identifiers or field objects.
 * @private
 * @returns {void}
 */
function setDimensionListForType(dimensionType, dimensionList) {
  // Pre-condition check: Validate the target configuration type.
  if (!isValidConfigType(dimensionType)) {
    console.error(`[Config Error] Cannot set list for unrecognized dimension type: '${dimensionType}'.`);
    return;
  }

  // Pre-condition check: Ensure the provided list is an array.
  if (!Array.isArray(dimensionList)) {
    console.error(`[Config Error] The dimension list for type '${dimensionType}' must be an array. Received:`, dimensionList);
    return;
  }

  // Clear all existing fields for this specific dimension type.
  activeConfiguration[dimensionType] = {};

  // Iterate over the new list and add each field individually.
  dimensionList.forEach(item => {
    addDimensionToConfig(dimensionType, item);
  });

  // A final cache invalidation after the batch update is complete.
  // (Note: `addDimensionToConfig` also invalidates per item, this is a redundant but safe call.)
  invalidateCache();
}


// --- Public Interface Functions for Specific Configuration Types ---

/**
 * Sets the collection of fields that define the row dimensions of the pivot table.
 * This will overwrite any previously set row dimensions.
 *
 * @param {Array<string|object>} rowFields - An array of field identifiers or objects for rows.
 * @returns {void}
 */
function applyRowDimensionList(rowFields) {
  setDimensionListForType('rows', rowFields);
}

/**
 * Sets the collection of fields that define the column dimensions of the pivot table.
 * This will overwrite any previously set column dimensions.
 *
 * @param {Array<string|object>} columnFields - An array of field identifiers or objects for columns.
 * @returns {void}
 */
function applyColumnDimensionList(columnFields) {
  setDimensionListForType('columns', columnFields);
}

/**
 * Sets the collection of fields that define the summary metrics (values) of the pivot table.
 * This will overwrite any previously set summary metrics.
 *
 * @param {Array<string|object>} metricFields - An array of field identifiers or objects for metrics.
 * @returns {void}
 */
function applySummaryMetricList(metricFields) {
  setDimensionListForType('metrics', metricFields);
}

/**
 * Retrieves the currently configured fields for a specified dimension type.
 *
 * @param {string} dimensionType - The type of dimension to query ('rows', 'columns', or 'metrics').
 * @returns {object} An object where keys are field names and values are the corresponding field objects.
 */
function getCurrentDimensionFields(dimensionType) {
  // Guard against requests for invalid dimension types.
  if (!isValidConfigType(dimensionType)) {
    console.error(`[Config Error] Request for invalid dimension type '${dimensionType}'. Returning an empty object.`);
    return {};
  }
  // Return a shallow copy of the object to prevent direct external modification of the internal state.
  return { ...activeConfiguration[dimensionType] };
}

/**
 * A factory function that provides an interface to manage a specific pivot dimension type.
 * This centralizes the logic for setting and getting configurations for rows, columns, or metrics.
 *
 * @param {string} typeOfDimension - The specific dimension type to manage ('rows', 'columns', 'metrics').
 * @returns {object} An object with `set` and `get` methods tailored for the specified dimension type.
 */
function getDimensionConfigurer(typeOfDimension) {
  // Guard clause: Return a safe, non-functional interface if the type is invalid.
  if (!isValidConfigType(typeOfDimension)) {
    console.error(`[Config Error] Attempted to create a configurer for an invalid dimension type: '${typeOfDimension}'.`);
    return {
      set: (list) => { console.warn(`[Config Warning] Cannot set list for invalid type '${typeOfDimension}'. List received:`, list); },
      get: () => { console.warn(`[Config Warning] Cannot retrieve fields for invalid type '${typeOfDimension}'.`); return {}; }
    };
  }

  return {
    /**
     * Replaces the current set of fields for this dimension type with a new list.
     * @param {Array<string|object>} fieldList - The new list of fields to apply.
     * @returns {void}
     */
    set: (fieldList) => {
      // Delegates the actual setting operation to the appropriate specific function.
      switch (typeOfDimension) {
        case 'rows':
          applyRowDimensionList(fieldList);
          break;
        case 'columns':
          applyColumnDimensionList(fieldList);
          break;
        case 'metrics':
          applySummaryMetricList(fieldList);
          break;
        default:
          // This case should ideally not be reached due to the isValidConfigType check.
          console.error(`[Config Error] Internal logic error: Unhandled dimension type '${typeOfDimension}' in configurer setter.`);
      }
    },
    /**
     * Retrieves the current fields configured for this dimension type.
     * @returns {object} An object mapping field names to their full field definitions.
     */
    get: () => getCurrentDimensionFields(typeOfDimension)
  };
}


/**
 * Provides a complete, deep snapshot of the current pivot display configuration across all categories.
 * This is useful for inspection or persistence.
 *
 * @returns {object} A deep copy of the entire active pivot configuration.
 */
function retrieveAllConfig() {
  // Guard clause: Ensure the configuration object exists before attempting to copy.
  if (!activeConfiguration) {
    console.warn("[Config Warning] Active configuration object is not initialized. Returning an empty object.");
    return {};
  }
  // Return a deep copy to ensure the internal state cannot be modified externally.
  // JSON serialization/deserialization is a simple way to achieve a deep copy for plain objects.
  return JSON.parse(JSON.stringify(activeConfiguration));
}


/**
 * The primary interface for accessing and modifying pivot table display settings.
 * This function acts as a central factory, returning an object that exposes various
 * configuration management capabilities.
 *
 * @returns {object} An immutable object containing methods to interact with the pivot's display configuration.
 */
function configureViewOptions() {
  // Optional: Add a pre-check here for a global pivot initialization status if applicable.
  // if (!globalPivotInitialized) {
  //   console.error("The pivot engine has not been initialized. Configuration options are unavailable.");
  //   return Object.freeze({}); // Return an empty, frozen object to prevent errors.
  // }

  // Return a new, frozen object each time to ensure consistency and prevent external modification
  // of the returned interface itself.
  return Object.freeze({
    /**
     * Provides an interface to manage the configuration of row dimensions.
     * @returns {object} An object with `set` and `get` methods for row dimensions.
     */
    rows: () => getDimensionConfigurer('rows'),

    /**
     * Provides an interface to manage the configuration of column dimensions.
     * @returns {object} An object with `set` and `get` methods for column dimensions.
     */
    columns: () => getDimensionConfigurer('columns'),

    /**
     * Provides an interface to manage the configuration of summary metrics (values).
     * @returns {object} An object with `set` and `get` methods for summary metrics.
     */
    metrics: () => getDimensionConfigurer('metrics'),

    /**
     * Retrieves a complete, immutable snapshot of all current display settings.
     * This method is a direct accessor for the entire configuration state.
     * @returns {object} A deep copy of the entire pivot configuration.
     */
    entire: retrieveAllConfig
  });
}