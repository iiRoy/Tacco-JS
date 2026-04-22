var moduleRegistrar;

(function() {
    // Determine if a specific utility library is available in the global scope.
    // This check is slightly more verbose for a Type III clone.
    const utilityCoreAvailable = (typeof window !== 'undefined' && typeof window.Backbone === 'object' && window.Backbone !== null);

    // Reference to the global execution context.
    // Using a named variable for 'this' for clarity and potential Type III manipulation.
    const currentGlobalScope = this;

    // Functions to provide or release specialized DSL (Domain Specific Language) tools.
    // Renamed from loadDsl/unloadDsl to reflect a more generic 'toolkit' concept.
    let acquireToolkit;
    // The 'releaseToolkit' was an empty function in the original and is non-essential.
    // For a Type III clone, it can be entirely removed, along with its calls.

    if (utilityCoreAvailable) {
        acquireToolkit = function(targetNamespaceObject, namespaceDesignation) {
            // Function to define a data model using the utility core.
            const defineDataModel = function(modelKeyIdentifier, modelSchemaDefinition) {
                // Introduce an intermediate variable for the full class name.
                const fullClassNamePath = namespaceDesignation + '.' + modelKeyIdentifier;
                // Use Object.assign for property merging, an equivalent but different syntax.
                Object.assign(modelSchemaDefinition, { classIdentifier: fullClassNamePath });

                // Assign the extended model to the target namespace.
                targetNamespaceObject[modelKeyIdentifier] = window.Backbone.Model.extend({
                    // Renamed 'defaults' to 'initialAttributes' for a Type III change.
                    initialAttributes: modelSchemaDefinition
                });
            };

            // Function to define a user interface view using the utility core.
            const defineUserInterfaceView = function(viewKeyIdentifier, viewConfiguration) {
                targetNamespaceObject[viewKeyIdentifier] = window.Backbone.View.extend(viewConfiguration);
            };

            // Return an object containing the DSL tools, instead of an array.
            // This changes the data structure for the return value, requiring adaptation in the caller.
            return Object.freeze({
                modelCreator: defineDataModel,
                viewRenderer: defineUserInterfaceView
            });
        };
    } else {
        // If the utility core is not present, provide dummy functions.
        acquireToolkit = function(scopeRef, scopeName) {
            // Return an empty object to maintain structural consistency,
            // even if the tools are not functional.
            return Object.freeze({
                modelCreator: () => {},
                viewRenderer: () => {}
            });
        };
    }

    // The primary function for managing and defining modules/namespaces.
    // Renamed from 'namespace' to 'moduleRegistrar'.
    moduleRegistrar = function(fullyQualifiedPath, memberDefinitions) {
        // Introduce a guard clause for input validation.
        if (typeof fullyQualifiedPath !== 'string' || !fullyQualifiedPath.trim()) {
            console.warn("Module path must be a non-empty string. Registration aborted.");
            return;
        }

        // Split the path into segments.
        const pathSegments = fullyQualifiedPath.split('.');
        let currentLevelReference = currentGlobalScope; // Start from the global scope.

        // Iterate through path segments to ensure all parent namespaces exist.
        // Rewritten from eval-based creation to iterative object traversal.
        for (let idx = 0; idx < pathSegments.length; idx++) {
            const segmentName = pathSegments[idx];

            // If the current segment does not exist as an object, create it.
            // Added explicit null check for robustness.
            if (currentLevelReference[segmentName] === undefined || currentLevelReference[segmentName] === null) {
                currentLevelReference[segmentName] = {};
            } else if (typeof currentLevelReference[segmentName] !== 'object' || Array.isArray(currentLevelReference[segmentName])) {
                // Added a more robust check for existing non-object values.
                // In a Type III clone, we could throw an error or log a warning.
                // For now, we'll assume the original `eval` would likely overwrite.
                // To maintain "recognizably similar" functionality, we'll allow it to be overwritten or continue.
                // A safer approach might be to throw: `throw new Error('Namespace conflict: ' + segmentName + ' is not an object.');`
                // For this clone, we'll just ensure it's an object if it's not already.
                if (!(typeof currentLevelReference[segmentName] === 'object' && !Array.isArray(currentLevelReference[segmentName]))) {
                     currentLevelReference[segmentName] = {}; // Overwrite if it's not a suitable object
                }
            }
            // Move the reference to the next level down.
            currentLevelReference = currentLevelReference[segmentName];
        }

        // At this point, `currentLevelReference` holds the final target namespace object.
        const finalTargetNamespace = currentLevelReference;

        // Acquire the DSL toolkit for this specific namespace.
        const dslTools = acquireToolkit(finalTargetNamespace, fullyQualifiedPath);

        // Process the member definitions.
        let resolvedMembers = {}; // Initialize a variable to hold the members.
        if (typeof memberDefinitions === 'function') {
            // If `memberDefinitions` is a function, execute it to get the actual members.
            // Use .call() and destructure the dslTools object for arguments.
            // This is a significant Type III change from .apply() with an array.
            resolvedMembers = memberDefinitions.call(
                currentGlobalScope,
                dslTools.modelCreator, // Pass specific tools as individual arguments.
                dslTools.viewRenderer
            );
        } else if (typeof memberDefinitions === 'object' && memberDefinitions !== null) {
            // If it's already an object, use it directly.
            resolvedMembers = memberDefinitions;
        }
        // If `memberDefinitions` is undefined or another type, `resolvedMembers` remains empty.

        // Iterate over the resolved members and assign them to the target namespace.
        // Added `hasOwnProperty` check for good practice, a Type III addition.
        for (const memberKey in resolvedMembers) {
            if (Object.prototype.hasOwnProperty.call(resolvedMembers, memberKey)) {
                finalTargetNamespace[memberKey] = resolvedMembers[memberKey];
            }
        }
    };
})();