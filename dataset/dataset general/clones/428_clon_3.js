'use strict';

// This module provides a robust dependency injection container for JavaScript applications.
// It supports registration and resolution of various types of components, including
// plain objects, utility functions, and constructor functions.

// Mock testing framework functions for demonstration purposes.
// In a real application, these would be provided by a testing library like Jest or Mocha.
function scenario(descriptionKey, executionCallback) {
    console.log(`\n--- Test Case: ${descriptionKey} ---`);
    try {
        executionCallback();
        console.log(`Test Case "${descriptionKey}" COMPLETED SUCCESSFULLY.`);
    } catch (incident) {
        console.error(`Test Case "${descriptionKey}" FAILED: ${incident.message}`);
        if (incident.stack) {
            console.error(incident.stack);
        }
    }
}

function verifyEquality(actualValue, expectedValue, failureMessage = 'Values are not strictly identical') {
    if (actualValue !== expectedValue) {
        throw new Error(`Assertion Error: ${failureMessage}\nExpected: '${expectedValue}' (Type: ${typeof expectedValue})\nActual: '${actualValue}' (Type: ${typeof actualValue})`);
    }
}

function verifyCondition(booleanExpression, failureMessage = 'Condition evaluated to false') {
    if (!booleanExpression) {
        throw new Error(`Assertion Error: ${failureMessage}`);
    }
}

function verifyExceptionThrown(operationToAttempt, expectedErrorFragment = '', customDescription = 'Expected an exception to be raised') {
    let exceptionEncountered = false;
    try {
        operationToAttempt();
    } catch (e) {
        exceptionEncountered = true;
        if (expectedErrorFragment && !e.message.includes(expectedErrorFragment)) {
            throw new Error(`Assertion Error: ${customDescription}\nExpected error message fragment: "${expectedErrorFragment}"\nActual error message: "${e.message}"`);
        }
    }
    if (!exceptionEncountered) {
        throw new Error(`Assertion Error: ${customDescription}\nNo exception was thrown as expected.`);
    }
}

// The core dependency injection container, renamed from 'infect' to 'depContainer'.
const depContainer = (function () {
    // Internal registry for all components.
    const _componentRegistry = new Map();

    // Set of primitive types that are disallowed for registration.
    const _DISALLOWED_TYPES = new Set(['string', 'number', 'boolean', 'symbol', 'bigint', 'undefined']);

    // Utility to check if a value is a plain object.
    const isStandardObject = (val) => Object.prototype.toString.call(val) === '[object Object]';

    // Utility to check if a value is a function.
    const isExecutableFunction = (val) => typeof val === 'function';

    return {
        /**
         * Registers a component with a unique identifier.
         * Components can be objects, functions, or constructors.
         * Primitive values or null are explicitly disallowed.
         * @param {string} componentKey A unique string identifier for the component.
         * @param {any} componentInstance The actual component (object, function, etc.).
         * @returns {any} The registered component instance.
         * @throws {Error} If the componentKey is invalid or the componentInstance is a disallowed type.
         */
        registerComponent: function (componentKey, componentInstance) {
            if (typeof componentKey !== 'string' || componentKey.trim().length === 0) {
                throw new Error('Component key must be a non-empty string for registration.');
            }

            const instanceType = typeof componentInstance;
            if (_DISALLOWED_TYPES.has(instanceType) || componentInstance === null) {
                // Type III change: Added `null` to disallowed list for registration.
                throw new Error(`Registration rejected: Cannot register primitive values or null. Key: '${componentKey}', Type: '${instanceType}'.`);
            }

            if (_componentRegistry.has(componentKey)) {
                console.warn(`Warning: Component with key '${componentKey}' is being re-registered, overwriting previous value.`);
            }

            _componentRegistry.set(componentKey, componentInstance);
            return componentInstance;
        },

        /**
         * Retrieves a component by its identifier.
         * @param {string} componentKey The identifier of the component to retrieve.
         * @returns {any} The resolved component instance.
         * @throws {Error} If no component is found for the given key.
         */
        retrieveComponent: function (componentKey) {
            if (!_componentRegistry.has(componentKey)) {
                throw new Error(`Component with key '${componentKey}' not found in the registry.`);
            }
            return _componentRegistry.get(componentKey);
        },

        /**
         * Creates an augmented object where properties starting with '_' are dynamically resolved dependencies.
         * @param {object} baseStructure The initial object to be augmented.
         * @param {string[]} dependencyKeys List of dependency identifiers to inject.
         * @returns {object} The augmented object with injected dependencies.
         * @throws {Error} If baseStructure is not a plain object or dependencyKeys is not an array.
         */
        createAugmentedObject: function (baseStructure, dependencyKeys) {
            if (!isStandardObject(baseStructure)) {
                throw new Error('Base structure for augmentation must be a plain object.');
            }
            if (!Array.isArray(dependencyKeys)) {
                throw new Error('Dependency keys list must be an array.');
            }

            // Type III change: Use Object.assign for a clear shallow copy, then define properties.
            const augmentedInstance = Object.assign({}, baseStructure);

            for (const depKey of dependencyKeys) {
                const injectedPropertyName = `_${depKey}`; // Type III: Changed prefix from '$' to '_'
                Object.defineProperty(augmentedInstance, injectedPropertyName, {
                    get: () => this.retrieveComponent(depKey),
                    enumerable: true, // Make it iterable
                    configurable: false // Prevent redefinition
                });
            }
            return augmentedInstance;
        },

        /**
         * Wraps a function or constructor, enabling automatic dependency injection.
         * Dependencies are identified either by a '_depMap' property on the function or
         * by parameters starting with '$' in its signature.
         * @param {Function|Array} targetEntity The function/constructor or an array where the last element is the function and preceding elements are dependency keys.
         * @returns {Function} The wrapped function/constructor.
         * @throws {Error} If the targetEntity is not a valid function or array.
         */
        wrapWithDependencies: function (targetEntity) {
            let actualFunction;
            let injectionHints = [];

            if (Array.isArray(targetEntity)) {
                if (targetEntity.length === 0 || !isExecutableFunction(targetEntity[targetEntity.length - 1])) {
                    throw new Error('For array-based injection, the last element must be the function to wrap.');
                }
                actualFunction = targetEntity[targetEntity.length - 1];
                injectionHints = targetEntity.slice(0, -1);
            } else if (isExecutableFunction(targetEntity)) {
                actualFunction = targetEntity;
                if (Array.isArray(actualFunction._depMap)) { // Type III: Renamed from $infect to _depMap
                    injectionHints = actualFunction._depMap;
                } else {
                    // Attempt to infer dependencies from function parameter names.
                    const PARAM_PARSER = /^[^(]*\(\s*([^)]*)\)/m;
                    const ARG_SEPARATOR = /,/;
                    const COMMENT_STRIPPER = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
                    const paramNames = actualFunction.toString().replace(COMMENT_STRIPPER, '')
                        .match(PARAM_PARSER)[1].split(ARG_SEPARATOR)
                        .map(arg => arg.trim())
                        .filter(arg => arg.length > 0);

                    injectionHints = paramNames.filter(name => name.startsWith('$')).map(name => name.substring(1));
                }
            } else {
                throw new Error('Target for dependency wrapping must be a function or an array with a function as its last element.');
            }

            // Return a new function that first resolves dependencies, then calls the original.
            return function () {
                const resolvedDependencies = injectionHints.map(depKey => this.retrieveComponent(depKey));
                // Type III change: Include original arguments *after* injected ones.
                return actualFunction.apply(this, resolvedDependencies.concat(Array.from(arguments)));
            }.bind(this); // Ensure 'this' context refers to depContainer for 'retrieveComponent'
        },

        /**
         * Clears all registered components from the container.
         * Type III: Added a utility method to clean the state.
         */
        resetContainer: function () {
            _componentRegistry.clear();
            // console.log('Dependency container has been reset.');
        }
    };
})();

// Type III: Make the depContainer object itself immutable after definition.
Object.freeze(depContainer);


scenario('Component registration and subsequent retrieval of objects', function () {
    depContainer.resetContainer(); // Ensure a clean state.

    const sampleConfigurationData = Object.freeze({ 'id': 'config-001', 'name': 'System Settings', 'isActive': true }); // Type III: Freeze the object.
    const registrationOutcome = depContainer.registerComponent('globalConfig', sampleConfigurationData);

    const retrievedConfiguration = depContainer.retrieveComponent('globalConfig');

    verifyEquality(sampleConfigurationData, retrievedConfiguration, 'The registered object should be identical to the retrieved object.');
    verifyEquality(sampleConfigurationData.id, retrievedConfiguration.id, 'Specific properties of the retrieved object should match.');
    verifyEquality(sampleConfigurationData, registrationOutcome, 'The result of registration should be the registered object itself.');
    verifyCondition(sampleConfigurationData === retrievedConfiguration, 'The retrieved object must be the exact same instance as the registered one.');
});

scenario('Component registration and subsequent retrieval of functions', function () {
    depContainer.resetContainer();

    const processingFunction = function () { return 'processed_output_string'; };
    depContainer.registerComponent('dataProcessorFunc', processingFunction);

    const resolvedProcessor = depContainer.retrieveComponent('dataProcessorFunc');

    verifyEquality(processingFunction, resolvedProcessor, 'The registered function should be identical to the retrieved function.');
    verifyCondition(isExecutableFunction(resolvedProcessor), 'The retrieved component must indeed be a function.');
    verifyEquality('processed_output_string', resolvedProcessor(), 'Invoking the retrieved function should yield the correct result.');

    // Type III: Add a test with a slightly modified function using the registered one.
    const enhancedProcessor = () => `Enhanced: ${resolvedProcessor()}`;
    depContainer.registerComponent('enhancedDataProcessor', enhancedProcessor);
    verifyEquality('Enhanced: processed_output_string', depContainer.retrieveComponent('enhancedDataProcessor')(), 'A newly registered function using a prior one should execute correctly.');
});

scenario('Object augmentation through dependency injection', function () {
    depContainer.resetContainer();

    const primaryDataSource = () => 'Primary data stream';
    const auditService = { log: (msg) => `Audit: ${msg}` }; // Type III: Added an audit service.

    depContainer.registerComponent('mainDataService', primaryDataSource);
    depContainer.registerComponent('auditLogService', auditService);

    const baseModuleSettings = { 'moduleId': 'mod-a', 'version': '1.2.0', 'active': true };
    const augmentedModule = depContainer.createAugmentedObject(baseModuleSettings, ['mainDataService', 'auditLogService']);

    // Type III: Verify original properties are untouched.
    verifyEquality(augmentedModule.active, true, 'Original properties of the base object must be preserved.');

    verifyEquality(primaryDataSource, augmentedModule._mainDataService, 'Injected primary data service should be available via its prefixed property.');
    verifyEquality(primaryDataSource(), augmentedModule._mainDataService(), 'Invoking the injected service should return its expected value.');
    verifyEquality(auditService, augmentedModule._auditLogService, 'The injected audit log service object should be correctly referenced.');
    verifyEquality('Audit: Test message', augmentedModule._auditLogService.log('Test message'), 'Methods on injected service objects should be callable.');
});

scenario('Attempting to register disallowed primitive values should throw an exception', function () {
    depContainer.resetContainer();

    // Type III: Consolidate repetitive checks into a loop for efficiency and clarity.
    const testCasesForDisallowed = [
        { key: 'strVal', value: 'hello world', typeMsg: 'string' },
        { key: 'numVal', value: 42.1, typeMsg: 'number' },
        { key: 'nullVal', value: null, typeMsg: 'null' },
        { key: 'undefinedVal', value: undefined, typeMsg: 'undefined' },
        { key: 'boolTrue', value: true, typeMsg: 'boolean true' },
        { key: 'boolFalse', value: false, typeMsg: 'boolean false' },
        { key: 'emptyStr', value: '', typeMsg: 'empty string' }, // Type III: Added empty string check.
        { key: 'zeroNum', value: 0, typeMsg: 'zero number' } // Type III: Added zero number check.
    ];

    for (const testCase of testCasesForDisallowed) {
        verifyExceptionThrown(() => {
            depContainer.registerComponent(testCase.key, testCase.value);
        }, `Cannot register primitive values or null. Key: '${testCase.key}', Type: '${typeof testCase.value}'`, `Registering a ${testCase.typeMsg} should cause an error.`);
    }

    // Type III: Add a check for an invalid component key.
    verifyExceptionThrown(() => {
        depContainer.registerComponent('   ', {});
    }, 'Component key must be a non-empty string for registration.', 'Using an empty or whitespace-only key should throw an error.');
});

scenario('Wrapped constructors should correctly instantiate with dependencies', function () {
    depContainer.resetContainer();

    depContainer.registerComponent('appSettings', { 'apiEndpoint': '/api/v3', 'defaultLocale': 'en-US' }); // Renamed 'a' to 'appSettings'.
    depContainer.registerComponent('analyticsService', { track: (event) => console.log(`Analytics: ${event}`) }); // Type III: Added a new dependency.

    // Type III: Modified constructor logic, added parameters, and used new dependency.
    function DataServiceModule(moduleIdentifier, settingsPayload, analyticsClient, initTimestamp = Date.now()) { // Renamed Apple to DataServiceModule, $a to settingsPayload.
        this.moduleIdentifier = moduleIdentifier;
        this.endpoint = settingsPayload.apiEndpoint;
        this.locale = settingsPayload.defaultLocale;
        this.lastInitTime = initTimestamp; // New property.
        this.analytics = analyticsClient; // New property.
        this.analytics.track(`Module ${moduleIdentifier} initialized.`); // Type III: Use new dependency.
    }

    const currentModuleId = 'UserManagement';
    const WrappedDataServiceModule = depContainer.wrapWithDependencies(DataServiceModule);

    // Manual instantiation for comparison.
    const manualInstance = new DataServiceModule(
        currentModuleId,
        depContainer.retrieveComponent('appSettings'),
        depContainer.retrieveComponent('analyticsService')
    );

    // Injected instantiation. Pass an additional argument for `initTimestamp`.
    const injectedInstance = new WrappedDataServiceModule(currentModuleId, 1678886400000); // Type III: Pass a specific timestamp.

    verifyEquality(injectedInstance.endpoint, manualInstance.endpoint, 'Injected constructor should resolve dependency properties correctly.');
    verifyEquality(injectedInstance.moduleIdentifier, currentModuleId, 'Parameters passed to the wrapped constructor should be correctly assigned.');
    verifyCondition(injectedInstance instanceof DataServiceModule, 'Injected instance must still be an instance of the original constructor.');
    verifyEquality(injectedInstance.lastInitTime, 1678886400000, 'Additional parameters should pass through as expected.'); // Type III: New assertion.
    verifyEquality(injectedInstance.analytics, depContainer.retrieveComponent('analyticsService'), 'The new analytics service dependency should be correctly injected.'); // Type III: New assertion.
});

scenario('Minified constructor definition with explicit dependency map', function () {
    depContainer.resetContainer();

    depContainer.registerComponent('loggingFacility', { loggerName: 'SystemLog', log: (m) => `[${this.loggerName}] ${m}` }); // New dependency.
    depContainer.registerComponent('configBundle', { 'welcomeMessage': 'Welcome, user!', 'maxRetries': 3 }); // Renamed 'a' to 'configBundle'.

    // Type III: Minified constructor with added parameters and modified internal logic.
    function UserSession(uId, cnf, lgr) { // Renamed n to uId, a to cnf.
        this.userId = uId;
        this.greeting = cnf.welcomeMessage;
        this.remainingAttempts = cnf.maxRetries; // New property from config.
        this.logging = lgr; // New property.
        this.logging.log(`Session for ${uId} started.`); // Type III: Use the new logging dependency.
    }
    // Explicit dependency map (renamed from $infect to _depMap).
    UserSession._depMap = ['configBundle', 'loggingFacility'];

    const userIdentifier = 'john.doe';
    const WrappedUserSession = depContainer.wrapWithDependencies(UserSession);

    // Manual instantiation.
    const manualSession = new UserSession(
        userIdentifier,
        depContainer.retrieveComponent('configBundle'),
        depContainer.retrieveComponent('loggingFacility')
    );

    // Injected instantiation.
    const injectedSession = new WrappedUserSession(userIdentifier);

    verifyEquality(injectedSession.greeting, manualSession.greeting, 'Wrapped constructor should correctly inject mapped dependencies.');
    verifyEquality(injectedSession.userId, userIdentifier, 'Parameters passed to wrapped constructor should be correctly assigned.');
    verifyCondition(injectedSession instanceof UserSession, 'Wrapped instance should maintain its original type.');
    verifyEquality(injectedSession.remainingAttempts, 3, 'New property from config bundle should be correctly assigned.'); // Type III: New assertion.
    verifyEquality(injectedSession.logging, depContainer.retrieveComponent('loggingFacility'), 'The new logging dependency should be correctly injected and assigned.'); // Type III: New assertion.
});

scenario('Function augmentation with automated dependency injection', function () {
    depContainer.resetContainer();

    const dataSupplierA = () => 'Raw Data Alpha';
    const transformServiceB = (inputStr) => `Transformed: ${inputStr.toUpperCase()}`; // Type III: Modified transformation.
    const validationServiceC = (processedStr) => processedStr.includes('DATA') && processedStr.length > 10; // Type III: Added a third function.

    depContainer.registerComponent('primaryDataSource', dataSupplierA);
    depContainer.registerComponent('dataTransformer', transformServiceB);
    depContainer.registerComponent('dataValidator', validationServiceC); // Registering the third function.

    // Regular function injection (dependencies inferred from parameter names).
    function processInput($primaryDataSource) { // Renamed infected to processInput.
        return $primaryDataSource() + ' - Processed'; // Type III: Added extra string.
    }
    const processedInputFunction = depContainer.wrapWithDependencies(processInput);

    // Minified function injection with explicit dependency map.
    function executePipeline(tx, vl) { // Renamed minInfected to executePipeline.
        const initialData = dataSupplierA(); // Type III: Call dataSupplierA directly here.
        const transformedData = tx(initialData);
        return vl(transformedData) ? `Pipeline OK: ${transformedData}` : `Pipeline FAILED: ${transformedData}`;
    }
    executePipeline._depMap = ['dataTransformer', 'dataValidator']; // Renamed k to tx, v to vl.
    const pipelineExecutionFunction = depContainer.wrapWithDependencies(executePipeline);

    // Another minified function test, assigned to a variable with an explicit map.
    const dynamicProcessingFunction = depContainer.wrapWithDependencies(function (tx) { // Renamed varMinInfected to dynamicProcessingFunction.
        const base = dataSupplierA();
        return tx(base.split(' ').reverse().join(' ')); // Type III: Modified processing logic.
    });
    dynamicProcessingFunction._depMap = ['dataTransformer']; // Renamed k to tx.

    // Array-syntax injection for multiple dependencies and custom arguments.
    const complexOperationFunction = depContainer.wrapWithDependencies(['primaryDataSource', 'dataTransformer', 'dataValidator', function (ds, dt, dv, label = 'Status:') { // Renamed minInfected2.
        const raw = ds();
        const transformed = dt(raw);
        const isValid = dv(transformed);
        return `${label} ${isValid ? 'SUCCESS' : 'FAILURE'} -> ${transformed}`;
    }]);

    verifyEquality('Raw Data Alpha - Processed', processedInputFunction(), 'Inferred injection should correctly resolve and execute.');
    verifyEquality('Pipeline OK: Transformed: RAW DATA ALPHA', pipelineExecutionFunction(), 'Minified function with explicit map should work as expected.');
    verifyEquality('Transformed: ALPHA DATA RAW', dynamicProcessingFunction(), 'Variable-assigned minified function should apply its custom logic.');
    verifyEquality('Final Status: SUCCESS -> Transformed: RAW DATA ALPHA', complexOperationFunction('Final Status:'), 'Array-syntax injection should handle multiple dependencies and custom arguments.');

    // Type III: Add a test for a function that takes no dependencies.
    const simpleWrappedFunction = depContainer.wrapWithDependencies(() => 'Simple result');
    verifyEquality('Simple result', simpleWrappedFunction(), 'A function without dependencies should still execute when wrapped.');
});