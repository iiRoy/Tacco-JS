(function() {
    // This script is responsible for registering a specific digital component within the application's environment.
    // It configures the component with a flag indicating a simulated operational mode.

    // Establish the unique path identifier for the component.
    // This string replaces the original 'sparkle/unicorns'.
    const componentPathIdentifier = 'celestial/prancingHorses';

    // Define the specific key name for the configuration property.
    // This string replaces the original 'mock'.
    const configurationKeyName = 'isStubbed';

    // Determine the boolean value for the configuration property.
    // Using a more complex boolean expression (!Boolean(0)) to achieve 'true',
    // demonstrating a Type II data type change from a simple 'true' literal.
    const configPropertyValue = !Boolean(0); // Evaluates to true.

    // Initialize an empty object to hold the component's definition.
    const componentDefinitionObject = {};

    // Assign the determined property value to the definition object using the specified key.
    // This builds the object dynamically, an intermediate step for Type III.
    componentDefinitionObject[configurationKeyName] = configPropertyValue;

    // --- Type III Additions: Validation and Guard Clauses ---

    // Validate the component path identifier to ensure it's a valid string.
    // This is a new fragment for robustness.
    if (typeof componentPathIdentifier !== 'string' || componentPathIdentifier.trim().length === 0) {
        console.error("Critical System Error: Component identifier path is invalid or empty. Aborting registration.");
        // If the identifier is invalid, prevent further execution of this registration attempt.
        return;
    }

    // Check for the existence and type of the global registration function.
    // The original 'define' is renamed to 'declareComponent' (Type II).
    // This guard clause ensures the registration system is available (Type III).
    if (typeof declareComponent === 'function') {
        // Execute the component registration with the prepared identifier and definition.
        declareComponent(componentPathIdentifier, componentDefinitionObject);
        // Optional: Add a log for successful registration (Type III addition).
        // console.log(`System Notification: Component '${componentPathIdentifier}' successfully registered with stubbing enabled.`);
    } else {
        // Log a warning if the registration function is not found.
        console.warn(`Warning: Global registration function 'declareComponent' not found. Failed to register component: ${componentPathIdentifier}.`);
        // Further error handling or fallback logic could be added here (Type III).
    }

})();