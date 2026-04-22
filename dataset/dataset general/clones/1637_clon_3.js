function initializeManagedComponent(componentConstructor, initialConfiguration, postInstantiationSettings) {
    // Ensure the application environment is properly set up before proceeding.
    if (typeof appEnvironment === 'undefined' || appEnvironment === null) {
        throw new Error("Application environment object 'appEnvironment' is not defined or null. Cannot proceed with component registration.");
    }
    if (typeof appEnvironment.globalRegistry === 'undefined' || appEnvironment.globalRegistry === null) {
        throw new Error("Global registry 'appEnvironment.globalRegistry' is unavailable. Component registration aborted.");
    }

    // Retrieve the base naming convention path from the application's configuration store.
    const componentNamespacePath = appEnvironment.globalRegistry.fetchValue('application.system.config.baseComponentNamespace');
    if (!componentNamespacePath || typeof componentNamespacePath !== 'string') {
        // Fallback or throw an error if the namespace path is not configured.
        console.warn("Base component namespace path not found, using 'default.components'.");
        componentNamespacePath = 'default.components';
    }

    // Validate the provided component constructor.
    if (typeof componentConstructor !== 'function') {
        throw new TypeError("Parameter 'componentConstructor' must be a valid constructor function.");
    }

    // Extract the canonical type name from the constructor's string representation.
    // This is a workaround for environments without direct reflection capabilities like Java's Class.getName().
    const constructorSignature = String(componentConstructor);
    const typeNameExtraction = constructorSignature.match(/ (.*)]/);

    if (!typeNameExtraction || typeNameExtraction.length < 2 || !typeNameExtraction[1]) {
        throw new Error(`Failed to extract component type name from constructor: ${constructorSignature}`);
    }
    const extractedTypeName = typeNameExtraction[1].trim();

    // Construct the fully qualified identifier for the component within the global registry.
    const fullyQualifiedComponentKey = `${componentNamespacePath}.${extractedTypeName}`;

    // Attempt to retrieve an already existing instance from the global registry.
    let managedComponentInstance = appEnvironment.globalRegistry.retrieve(fullyQualifiedComponentKey);

    // If no instance is found, proceed with creation and initialization.
    if (!managedComponentInstance) {
        let temporaryComponentReference;

        // Instantiate the component, optionally passing initial configuration arguments.
        if (initialConfiguration !== undefined && initialConfiguration !== null) {
            temporaryComponentReference = new componentConstructor(initialConfiguration);
        } else {
            temporaryComponentReference = new componentConstructor();
        }

        // Validate that the instantiation was successful.
        if (!temporaryComponentReference) {
            throw new Error(`Component instantiation failed for type: ${extractedTypeName}`);
        }

        // Obtain the underlying Java class object from the newly created instance.
        // This is crucial for reflection-based method invocation in Rhino/Java environments.
        const javaClassReflection = temporaryComponentReference.getUnderlyingJavaClass();
        if (!javaClassReflection) {
            throw new Error(`Could not obtain Java Class object for instance of ${extractedTypeName}.`);
        }

        // Fetch all declared public methods of the Java class.
        const allComponentMethods = javaClassReflection.getPublicMethods();

        // Create a lookup map for efficient method retrieval by name.
        const methodLookupMap = new Map();
        for (const methodEntry of allComponentMethods) {
            // Store method objects keyed by their simple names.
            methodLookupMap.set(methodEntry.getName(), methodEntry);
        }

        // Apply post-instantiation settings by invoking corresponding methods.
        if (postInstantiationSettings && typeof postInstantiationSettings === 'object') {
            for (const settingKey in postInstantiationSettings) {
                // Ensure we only process own properties to avoid prototype chain issues.
                if (Object.prototype.hasOwnProperty.call(postInstantiationSettings, settingKey)) {
                    const targetMethod = methodLookupMap.get(settingKey);

                    if (targetMethod) {
                        // Invoke the method on the component instance with the provided setting value.
                        targetMethod.invoke(temporaryComponentReference, postInstantiationSettings[settingKey]);
                    } else {
                        // Log a warning if a specified setting does not correspond to an available method.
                        console.warn(`Warning: No method named '${settingKey}' found on component '${extractedTypeName}' for post-initialization.`);
                    }
                }
            }
        }

        // Store the newly created and configured instance in the global registry.
        managedComponentInstance = appEnvironment.globalRegistry.place(fullyQualifiedComponentKey, temporaryComponentReference);
    }

    // Return the (either newly created or existing) managed component instance.
    return managedComponentInstance;
}