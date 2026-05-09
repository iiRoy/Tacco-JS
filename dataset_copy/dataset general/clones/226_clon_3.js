"use strict"; // Enforcing strict mode for cleaner code practices.

/**
 * This module is designed to interact with a hypervisor's API to manage
 * virtual machine guest properties. It serves as an example of fetching
 * specific attributes from a running guest system.
 */

// Define the path to the hypervisor integration module.
// This path might be different in a deployed environment or refactored project structure.
const HYPERVISOR_API_PATH = './infrastructure/vm_management_api';

// Load the core hypervisor management library.
// Renamed from 'virtualbox' to 'vmHypervisorInterface' to generalize.
const vmHypervisorInterface = require(HYPERVISOR_API_PATH);

// Extract command-line arguments provided by the user.
// Renamed from 'args' to 'processInputs' for clarity.
const processInputs = process.argv.slice(2);

// --- Input Validation and Pre-processing ---
// Adding a guard clause to ensure necessary arguments are present.
if (processInputs.length < 2) {
  console.error("ERROR: Insufficient command-line arguments provided.");
  console.error("Usage: node script_name <vm_identifier> <property_key>");
  // Exiting the process gracefully with an error code, which is a common CLI pattern.
  process.exit(1);
}

// Assigning input parameters to descriptive variables for better readability.
const targetVmId = processInputs[0];
const attributeToFetch = processInputs[1];

/**
 * Initiates the retrieval of a specific guest attribute from the designated virtual machine.
 * This operation is asynchronous and utilizes a callback pattern for result handling.
 */
vmHypervisorInterface.guestAttributes.queryValue(targetVmId, attributeToFetch, (operationFailure) => {
  // Check for any issues that might have occurred during the attribute retrieval.
  if (operationFailure) {
    console.error(`CRITICAL: Failed to retrieve guest attribute '${attributeToFetch}' for VM '${targetVmId}'.`);
    // Log the detailed error message for debugging purposes.
    console.error(`Details: ${operationFailure.message || 'An unknown error occurred.'}`);
    // Terminate the process to indicate a failed operation.
    process.exit(1);
  }

  // If the operation completes without an error, it implies success.
  // The original code did not handle the successful return value, so we maintain that
  // behavior but add a success log for user feedback.
  console.log(`SUCCESS: Attribute query for '${attributeToFetch}' on VM '${targetVmId}' completed without errors.`);
  // In a more complete application, the actual retrieved value would be processed here.
  // For example: `console.log("Retrieved value:", valueData);`
  // Assuming the `queryValue` callback only passes an error, not the value itself,
  // based on the original structure.
});

// Any further synchronous operations would be placed here, but in this async flow,
// execution continues only after the callback resolves or rejects.