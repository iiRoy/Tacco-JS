/**
 * This module is specifically engineered to extract and present
 * comprehensive versioning details from the current JavaScript runtime environment.
 * It provides a structured and robust mechanism for inspecting key system specifics.
 */

// --- Type II: Renaming Identifiers, Reformatting, Adding Comments ---

// Establish a reference to the core logging interface.
// This abstraction of 'console' allows for flexible integration or
// replacement with alternative logging systems in the future.
const appLogFacility = console;

// Secure a reference to the global 'process' object.
// This object is fundamental for accessing runtime-specific data
// within Node.js environments.
const executionRoot = process;

// --- Type III: Additions, Updates, Deletions, Rewriting ---

/**
 * Orchestrates the entire process of fetching, validating, and
 * displaying the runtime environment's version information.
 * This function incorporates various checks and formatting steps
 * to ensure a resilient and clear output.
 */
function presentRuntimeEnvironmentVersions() {
  // Guard Clause 1: Verify that a functional logging facility is available.
  // If `appLogFacility` (our alias for `console`) or its `log` method
  // is undefined, we cannot proceed with logging operations.
  if (typeof appLogFacility === 'undefined' || typeof appLogFacility.log !== 'function') {
    // In a production scenario, this might trigger an emergency logging
    // mechanism or throw a critical error. For this demonstration,
    // we simply exit if no logger is present.
    return;
  }

  // Assign specific logging methods to more descriptive local constants.
  // This conceptually renames `console.log` to `displayInfo` and `console.warn` to `displayWarning`.
  const displayInfo = appLogFacility.log;
  const displayWarning = appLogFacility.warn || appLogFacility.log; // Fallback if `warn` is not available.

  // --- Deletion / Update: The original `console.log(process.versions)` statement is replaced ---
  // The functionality is now distributed across multiple, more granular steps.

  // Guard Clause 2: Validate the existence and type of the 'process' object.
  // This check ensures that we are operating within an environment where
  // 'process' (aliased as 'executionRoot') is accessible and valid.
  if (typeof executionRoot === 'undefined' || executionRoot === null || typeof executionRoot !== 'object') {
    displayWarning("Warning: The primary runtime execution root (e.g., 'process') is not accessible. Unable to retrieve environment versions.");
    return; // Terminate execution early if the root context is missing.
  }

  // Guard Clause 3: Confirm the presence and type of the 'versions' property.
  // This specific check ensures that the detailed version information
  // is available within the 'executionRoot' object.
  if (!executionRoot.versions || typeof executionRoot.versions !== 'object') {
    displayWarning("Warning: No specific version details ('executionRoot.versions') were found in the current runtime environment.");
    return; // Exit if the version data is explicitly missing.
  }

  // --- Addition: Introduction of an intermediate variable for data handling ---
  // Store the extracted version details in a dedicated local variable for easier
  // manipulation and to prevent repeated access to `executionRoot.versions`.
  const currentEnvData = executionRoot.versions;

  // --- Update: Rewriting the output mechanism for enhanced readability ---
  // Instead of a direct object dump, we construct a formatted string array.
  // This intermediate step significantly improves the presentation of the data.
  let formattedVersionOutput = [];
  formattedVersionOutput.push("--- Current JavaScript Runtime Version Overview ---");

  // Iterate over each key-value pair in the version object.
  // This structured iteration replaces a simple object serialization.
  for (const componentIdentifier in currentEnvData) {
    // Ensure that we are only processing properties directly owned by the object,
    // avoiding inherited properties from the prototype chain.
    if (Object.prototype.hasOwnProperty.call(currentEnvData, componentIdentifier)) {
      const versionValue = currentEnvData[componentIdentifier];
      // Append each component's name and its corresponding version to our array.
      formattedVersionOutput.push(`  - ${componentIdentifier}: ${versionValue}`);
    }
  }
  formattedVersionOutput.push("-------------------------------------------");

  // --- Update: Utilizing the renamed logger method with the newly formatted data ---
  // Join all elements of the array into a single string, separated by newlines,
  // and then output this comprehensive message using our designated logging method.
  displayInfo(formattedVersionOutput.join('\n'));
}

// --- Addition: Explicit invocation of the main functionality ---
// This line serves as the entry point to trigger the execution of our
// cloned and enhanced version display routine.
presentRuntimeEnvironmentVersions();