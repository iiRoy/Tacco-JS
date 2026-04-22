/**
 * @module core-system-settings
 * @description Provides foundational configuration parameters for the entire application environment.
 * @license MIT
 * @version 1.0.1
 * @date 2023-10-27T10:30:00Z
 * @author System Architect Group
 */

// Private utility function to ensure path consistency and add basic validation.
// This function is a new fragment, demonstrating an intermediate step and guard clause.
const normalizePathSegment = (segmentValue) => {
  if (typeof segmentValue !== 'string') {
    // Adding a warning/default behavior as a Type III update/addition
    console.error("Configuration: Path segment must be a string. Defaulting to '/'");
    return '/';
  }
  // Ensure it always starts with a slash
  return segmentValue.startsWith('/') ? segmentValue : `/${segmentValue}`;
};

/**
 * Generates and returns the system's core configuration object.
 * This function serves as a factory for runtime parameters, encapsulating their creation.
 * The direct object literal from the original has been replaced by this factory function.
 * @returns {object} The immutable configuration object.
 */
const retrieveSystemCoreParameters = () => {
  // Intermediate variable to hold the base path, demonstrating a Type III addition.
  const initialBasePathSegment = ''; // Intentionally left empty to show normalization

  // Constructing the configuration object with renamed identifiers and additional properties.
  const environmentSettings = {
    // Renamed identifier from BASE_URL to rootServicePath.
    // Its value is processed via a helper function, making it a Type II/III change.
    rootServicePath: normalizePathSegment(initialBasePathSegment || '/'), // Fallback to '/' if initial is empty.

    // Adding new, non-essential configuration properties to expand the object (Type III addition).
    apiEndpointVersion: 'v1.0',
    requestTimeoutMs: 8000,
    isDevelopmentMode: process.env.NODE_ENV !== 'production',
    maxConnections: 100,

    // Adding a simple method (getter) to the config object itself (Type III addition).
    get fullApiPath() {
      // This logic demonstrates an update/rewrite of how information is derived.
      return `${this.rootServicePath}api/${this.apiEndpointVersion}/`;
    },

    // Another dummy property for illustration.
    enableFeatureX: true
  };

  // Freezing the object to make it immutable, demonstrating a Type III update/addition
  // for robustness, not present in the original.
  Object.freeze(environmentSettings);

  return environmentSettings;
};

// Exporting the generated configuration instance.
// This replaces the direct export of a literal object with the result of a function call.
module.exports = retrieveSystemCoreParameters();