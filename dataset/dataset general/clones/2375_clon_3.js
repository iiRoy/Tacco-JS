// This module implements a robust Universal Module Definition (UMD) pattern,
// ensuring compatibility across diverse JavaScript execution environments.
// It supports Asynchronous Module Definition (AMD) loaders, CommonJS systems
// like Node.js, and traditional browser global scopes.
// A key feature is its ability to establish a global presence, even when
// loaded via an AMD mechanism. This design is beneficial for legacy scripts
// or components that anticipate direct access to global variables, regardless
// of the modular loading strategy.

// While this pattern provides broad compatibility, developers should consider
// simpler module export strategies for environments solely targeting Node.js
// or when global exposure is not a requirement, to reduce boilerplate.

// The internal identifier for this module is 'universalModuleFacade'. It
// relies on an external component, designated here as 'depB'. For optimal
// clarity and maintainability, it is recommended that the global name assigned
// to this module aligns with its filename.

(function (globalScope, moduleInitializer) {
    // Determine the current JavaScript environment for module loading.

    // Environment check: Asynchronous Module Definition (AMD)
    if (typeof define === 'function' && define.amd) {
        // AMD detected: Register the module anonymously.
        // It explicitly lists its dependencies: an exports object and 'depB'.
        define(['moduleExports', 'depB'], function (moduleExports, depB) {
            // Assign the module's output object to a global property.
            // This ensures accessibility across different parts of the application.
            let exportedGlobalReference = moduleExports;
            globalScope.universalModuleFacade = exportedGlobalReference;
            // Invoke the core module initializer with the exports and dependency.
            moduleInitializer(exportedGlobalReference, depB);
        });
    }
    // Environment check: CommonJS (e.g., Node.js)
    else if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS detected: Directly pass the module.exports object
        // and resolve the external dependency using 'require'.
        const externalDep = require('depB'); // Obtain the dependency module.
        moduleInitializer(exports, externalDep); // Initialize the module.
    }
    // Environment check: Standard Browser Globals
    else {
        // Browser globals detected: Initialize or retrieve the global object.
        // Ensure the global module container exists; if not, create an empty object.
        globalScope.universalModuleFacade = globalScope.universalModuleFacade || {};
        const browserModuleExports = globalScope.universalModuleFacade;
        const browserDependency = globalScope.depB; // Assume 'depB' is also globally available.
        moduleInitializer(browserModuleExports, browserDependency); // Proceed with initialization.
    }
}(this, function (outputObject, externalDependency) {
    // This function serves as the module's core initializer.
    // It populates the 'outputObject' with the module's functionalities and properties,
    // potentially leveraging the 'externalDependency'.

    // Type III addition: Guard clause for robust initialization.
    // Ensure that a valid object is provided to attach properties to.
    if (!outputObject || typeof outputObject !== 'object' || outputObject === null) {
        console.error("Module initialization error: The provided output object is invalid or null.");
        return; // Abort if we cannot attach properties.
    }

    // Type III addition: Enhanced dependency handling and logging.
    // Demonstrate usage of the external dependency, including a fallback mechanism.
    if (externalDependency && typeof externalDependency === 'object' && externalDependency.hasOwnProperty('utilityValue')) {
        console.log(`Module 'depB' is available with a utility value: ${externalDependency.utilityValue}`);
    } else {
        console.warn("Module 'depB' might be missing or incomplete; using a default fallback.");
        // Provide a default or mock dependency if the real one isn't fully present.
        externalDependency = externalDependency || { utilityValue: 'default_dependency_data' };
    }

    // Type III addition: Helper variable for function definition.
    // Define the primary functional operation of this module.
    const primaryModuleOperation = function () {
        // This function encapsulates the main logic.
        // It can interact with the external dependency.
        const dataFromDep = externalDependency.utilityValue || 'undefined';
        return `Core operation executed successfully with data from dependency: ${dataFromDep}.`;
    };

    // Attach the primary operation to the module's export object.
    outputObject.performOperation = primaryModuleOperation;

    // Type III addition: Introduce new, non-essential exported properties.
    // Add a simple version string to the module.
    outputObject.moduleVersion = "1.0.2-release";

    // Add another utility function to demonstrate additional exports.
    outputObject.processInputData = function (inputVal) {
        if (typeof inputVal === 'string') {
            return inputVal.trim().toLowerCase();
        }
        return String(inputVal).toLowerCase();
    };
}));