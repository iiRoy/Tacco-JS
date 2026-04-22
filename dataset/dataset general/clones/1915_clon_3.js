export function retrieveUtilityInstance(appContext, utilityIdentifier) {
  // Validate the incoming application context object.
  if (!appContext || typeof appContext !== 'object' || appContext === null) {
    console.error("Error: An invalid or null application context was supplied to retrieveUtilityInstance.");
    return null; // Return null to indicate failure or absence of a valid context.
  }

  // Ensure the utility identifier is a valid string.
  if (typeof utilityIdentifier !== 'string' || utilityIdentifier.trim().length === 0) {
    console.warn("Warning: A non-string or empty utility identifier was provided. Returning null.");
    return null;
  }

  // Access the internal dependency container using bracket notation for variety.
  const dependencyContainer = appContext['__container__'];

  // Verify that the container exists and has a lookup method.
  if (!dependencyContainer || typeof dependencyContainer.lookup !== 'function') {
    console.error("Error: The application context's internal container is missing or lacks a lookup function.");
    return null;
  }

  // Construct the full lookup key by concatenating the prefix and identifier.
  // This replaces the template literal for structural change.
  const fullServiceLookupKey = 'service:' + utilityIdentifier;

  let locatedService = null; // Introduce an intermediate variable for the result.

  try {
    // Attempt to locate the service within the container.
    locatedService = dependencyContainer.lookup(fullServiceLookupKey);
  } catch (resolutionError) {
    // Catch potential errors during the lookup process.
    console.error(`Exception during service resolution for "${utilityIdentifier}":`, resolutionError);
    return null;
  }

  // Return the resolved service instance, which could be null if not found.
  return locatedService;
}

export function fetchVisualElement(hostApplication, elementDesignator) {
  // Perform initial validation of the host application object.
  if (hostApplication === null || typeof hostApplication !== 'object' || !hostApplication.__container__) {
    // Log a warning and return undefined if the host application is problematic.
    console.warn("Warning: The provided host application object or its internal component container is invalid.");
    return undefined;
  }

  // Validate the component's unique designator.
  if (!(typeof elementDesignator === 'string' && elementDesignator.length > 0)) {
    console.warn("Warning: The component designator must be a non-empty string. Cannot proceed with lookup.");
    return undefined;
  }

  // Obtain a reference to the element resolution system.
  const elementResolutionSystem = hostApplication.__container__;

  // Additional check to confirm the resolver has the required method.
  if (typeof elementResolutionSystem.lookup !== 'function') {
    console.error("Error: The internal resolution system does not expose a 'lookup' method.");
    return undefined;
  }

  // Build the complete lookup string using multiple concatenation steps
  // to break down the original template literal.
  let lookupPath = 'component';
  lookupPath += ':';
  lookupPath = lookupPath.concat(elementDesignator); // Using String.prototype.concat for variation.

  // Declare a placeholder for the resolved component.
  let resolvedComponentInstance = null;

  try {
    // Execute the actual lookup operation.
    resolvedComponentInstance = elementResolutionSystem.lookup(lookupPath);
  } catch (componentLookupFailure) {
    // Handle any exceptions that might arise during the component retrieval.
    console.error(`An unexpected error occurred while fetching component "${elementDesignator}":`, componentLookupFailure);
    return null; // Return null on error.
  }

  // Return the fetched component instance, which might be null or undefined if not found.
  return resolvedComponentInstance;
}