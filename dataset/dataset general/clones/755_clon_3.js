const ProxyHub = {}; // Initialize the core module for interception utilities.

// Guard against namespace collisions in a global context.
// This ensures that our module doesn't overwrite an existing 'ProxyHub' or similar.
if (typeof globalThis.ProxyHub !== 'undefined') {
    throw new Error("ProxyHub namespace is already claimed by another module or script. Please check your dependencies.");
}
globalThis.ProxyHub = ProxyHub; // Expose ProxyHub globally for convenience.

/**
 * Creates a "fake" or "stub" method using the interceptor mechanism.
 * This is a specialized wrapper around `ProxyHub.intercept` that provides
 * a common alias for stubbing functionality.
 *
 * @param {...any} configArgs - Arguments passed directly to `ProxyHub.intercept`.
 *                               Typically: (object, methodName, returnValue) or (methodName, returnValue).
 * @returns {object|null} An interceptor handle with additional `undoFake` alias, or null if no action taken.
 */
ProxyHub.fake = function(...configArgs) {
    // Extensive validation for input arguments to ensure proper usage.
    if (configArgs.length === 0) {
        console.warn("ProxyHub.fake was invoked without any configuration arguments. No stub will be created.");
        return null; // Return null to indicate no operation was performed.
    }

    // Delegate the core logic to `ProxyHub.intercept`.
    // Using `call(null, ...configArgs)` ensures that `this` context is not inadvertently passed
    // from `fake` to `intercept`, and spreads the arguments correctly.
    const proxyInstance = ProxyHub.intercept.call(null, ...configArgs);

    // Provide a convenient alias for releasing the fake.
    proxyInstance.undoFake = proxyInstance.releaseInterceptor;

    // Mark this interceptor as a 'fake' for easier identification.
    proxyInstance.isFake = true;

    return proxyInstance;
};

/**
 * Generates an interceptor (spy) for a specific method, either on an object or as a standalone function.
 * This function allows tracking calls, capturing arguments, and overriding return values.
 *
 * @param {...any} invocationArgs - The arguments vary based on the desired interception:
 *   - (object, methodName, overrideValue): To intercept a method on a specific object.
 *   - (methodName, overrideValue): To create a detached spy function that returns `overrideValue`.
 * @returns {object} A comprehensive handle object for managing and querying the interceptor.
 */
ProxyHub.intercept = function(...invocationArgs) {
    let targetObject = null; // The object whose method is being intercepted.
    let methodKey = null;    // The name of the method to intercept.
    let overrideValue = undefined; // The value to return when the intercepted method is called.

    // --- Argument Parsing and Validation (Enhanced for Type III) ---
    if (invocationArgs.length < 1) {
        throw new Error("ProxyHub.intercept requires at least one argument: either a method key or a target object.");
    }

    if (typeof invocationArgs[0] === 'string') {
        // Scenario 1: Detached spy (e.g., `intercept('myFunc', 'result')`)
        // This creates a spy function that doesn't replace an existing method
        // but can be called directly and tracked.
        methodKey = invocationArgs[0];
        overrideValue = invocationArgs[1];
        // `targetObject` remains `null`, indicating a detached spy.
        console.debug(`[ProxyHub] Preparing a detached interceptor for key: '${methodKey}'.`);
    } else {
        // Scenario 2: Object method spy (e.g., `intercept(myObject, 'methodName', 'result')`)
        targetObject = invocationArgs[0];
        methodKey = invocationArgs[1];
        overrideValue = invocationArgs[2];

        // Ensure the target object is valid for method interception.
        if (targetObject === null || (typeof targetObject !== 'object' && typeof targetObject !== 'function')) {
            throw new TypeError("The first argument, if not a string, must be a valid object or function for method interception.");
        }
        console.debug(`[ProxyHub] Preparing to intercept method '${methodKey}' on target:`, targetObject);
    }

    // Validate the method key for all scenarios.
    if (typeof methodKey !== 'string' || methodKey.trim() === '') {
        throw new Error("The method key must be a non-empty string.");
    }

    // --- Internal State Management (Enhanced for Type III) ---
    let invocationCount = 0; // Tracks how many times the proxy method has been called.
    // Stores detailed records for each invocation, including arguments, context, and timestamp.
    const invocationRecords = [];
    let originalMethodReference = undefined; // Reference to the method before interception.
    let originalMethodDescriptor = undefined; // Store property descriptor for robust restoration.
    let isCurrentlyActive = false; // Flag to indicate if the interceptor is actively replacing a method.

    // --- Helper Functions (Renamed and Enhanced) ---

    /**
     * Resets the internal state of the interceptor, clearing all invocation data.
     * @private
     */
    const resetInterceptorState = () => {
        invocationCount = 0;
        invocationRecords.length = 0; // Efficiently clears the array.
        console.debug(`[ProxyHub] State for interceptor '${methodKey}' has been reset.`);
    };

    /**
     * The actual function that replaces the original method.
     * This function captures invocation details and returns the `overrideValue`.
     * @param {...any} callArgs - Arguments passed to the intercepted method.
     * @returns {any} The predefined `overrideValue`.
     * @private
     */
    const proxyMethod = function(...callArgs) {
        invocationCount++; // Increment the call count.

        // Capture comprehensive details of the current invocation.
        const record = {
            args: Array.from(callArgs), // Convert `arguments` object to a real array.
            context: this,             // Capture the `this` context of the call.
            timestamp: Date.now()      // Record the exact time of the invocation.
        };
        invocationRecords.push(record); // Store the detailed record.

        console.log(`[ProxyHub] Method '${methodKey}' invoked. Call #${invocationCount}.`);

        // Type III: Custom hook for external listeners on each interception.
        if (typeof ProxyHub.onInterceptedCall === 'function') {
            ProxyHub.onInterceptedCall(methodKey, record, interceptorHandle);
        }

        return overrideValue; // Return the configured override value.
    };

    /**
     * Restores the original method or property on the target object.
     * This effectively disables the interception.
     * @private
     */
    const releaseInterceptor = () => {
        if (!isCurrentlyActive) {
            console.warn(`[ProxyHub] Interceptor for '${methodKey}' is not active or already released.`);
            return;
        }

        if (targetObject && methodKey) {
            // Restore using the original property descriptor if available for robustness.
            if (originalMethodDescriptor) {
                Object.defineProperty(targetObject, methodKey, originalMethodDescriptor);
            } else if (originalMethodReference !== undefined) {
                // Fallback to simple assignment if no descriptor was captured (e.g., if it was a plain property).
                targetObject[methodKey] = originalMethodReference;
            } else {
                // If there was no original property/method, delete the one created by the interceptor.
                delete targetObject[methodKey];
            }
            isCurrentlyActive = false;
            console.info(`[ProxyHub] Original method '${methodKey}' restored on target object.`);
        } else {
            // For detached spies, there's no target object to restore to.
            console.warn(`[ProxyHub] Detached interceptor for '${methodKey}' has no target to "release" from.`);
            isCurrentlyActive = false; // Mark as inactive even if no target.
        }
    };

    // --- Method Interception Logic (Type III: More robust and explicit) ---
    if (targetObject && methodKey) {
        // Attempt to get the property descriptor to check configurability and capture full state.
        originalMethodDescriptor = Object.getOwnPropertyDescriptor(targetObject, methodKey);

        if (originalMethodDescriptor && !originalMethodDescriptor.configurable) {
            // Prevent interception if the property is not configurable, as it cannot be redefined.
            throw new Error(`Cannot intercept non-configurable property '${methodKey}' on the target object.`);
        }

        // Store the original method/value if it exists.
        if (targetObject[methodKey] !== undefined) {
            originalMethodReference = targetObject[methodKey];
        }

        // Replace the original method with our `proxyMethod`.
        targetObject[methodKey] = proxyMethod;
        isCurrentlyActive = true;
        console.log(`[ProxyHub] Method '${methodKey}' on target object has been successfully intercepted.`);
    } else {
        // For detached spies, the `proxyMethod` itself is the 'intercepted' entity.
        isCurrentlyActive = true;
        console.log(`[ProxyHub] A detached interceptor for '${methodKey}' has been created.`);
    }

    // --- Returned Interceptor Handle (Extended with Type III features) ---
    const interceptorHandle = {
        // Core functionality accessors
        getInvocationCount: () => invocationCount,
        /**
         * Retrieves arguments from recorded invocations.
         * @param {number} [invocationIndex=-1] - Optional. The 0-based index of the specific invocation.
         * @param {number} [argIndex=-1] - Optional. The 0-based index of a specific argument within an invocation.
         * @returns {Array<Array<any>>|Array<any>|any|undefined} All arguments, arguments for a specific call,
         *                                                     a specific argument, or undefined if indices are invalid.
         */
        getCallArguments: (invocationIndex = -1, argIndex = -1) => {
            if (invocationIndex === -1) {
                // Return arguments from all invocations.
                return invocationRecords.map(rec => rec.args);
            }
            if (invocationIndex >= 0 && invocationIndex < invocationRecords.length) {
                const argsForCall = invocationRecords[invocationIndex].args;
                if (argIndex === -1) {
                    // Return all arguments for a specific invocation.
                    return argsForCall;
                }
                if (argIndex >= 0 && argIndex < argsForCall.length) {
                    // Return a specific argument from a specific invocation.
                    return argsForCall[argIndex];
                }
            }
            console.warn(`[ProxyHub] Invalid invocation or argument index provided for '${methodKey}': invocationIndex=${invocationIndex}, argIndex=${argIndex}`);
            return undefined;
        },
        getCallContexts: () => invocationRecords.map(rec => rec.context), // Retrieve `this` contexts for all calls.
        getCallRecords: () => [...invocationRecords], // Return a defensive copy of all detailed invocation records.

        releaseInterceptor: releaseInterceptor, // Function to restore the original method.
        resetState: resetInterceptorState,     // Function to clear invocation history.

        // New Type III additions for enhanced control and introspection:
        /**
         * Dynamically changes the value that the intercepted method will return.
         * @param {any} newValue - The new value to be returned on subsequent calls.
         */
        setOverrideValue: (newValue) => {
            overrideValue = newValue;
            console.debug(`[ProxyHub] Override value for '${methodKey}' updated to:`, newValue);
        },
        /**
         * Checks if the intercepted method was called with a specific set of arguments.
         * Uses shallow equality for argument comparison.
         * @param {...any} expectedArgs - The arguments to check against.
         * @returns {boolean} True if any invocation matched the `expectedArgs`, false otherwise.
         */
        wasCalledWith: (...expectedArgs) => {
            return invocationRecords.some(rec => {
                if (rec.args.length !== expectedArgs.length) return false;
                return rec.args.every((arg, i) => arg === expectedArgs[i]);
            });
        },
        hasBeenInvoked: () => invocationCount > 0, // Convenience alias for checking if any calls occurred.
        isCurrentlyActive: () => isCurrentlyActive, // Indicates if the interceptor is currently replacing a method.
        getOriginalMethod: () => originalMethodReference, // Provides access to the original method (if it existed).
        getMethodKey: () => methodKey, // Exposes the method key being intercepted.

        // References to related objects/functions
        proxiedTarget: targetObject,       // The object that was targeted for interception (null for detached).
        interceptingFunction: proxyMethod, // The actual function that replaces the original method.

        // A unique identifier for this interceptor instance, useful for debugging.
        _interceptorId: Symbol(`interceptor-${methodKey}-${Date.now()}`).description
    };

    // Initialize the interceptor's state upon creation.
    resetInterceptorState();

    // Type III: Custom hook for external actions upon interceptor creation.
    if (typeof ProxyHub.onInterceptorCreated === 'function') {
        ProxyHub.onInterceptorCreated(interceptorHandle);
    }

    return interceptorHandle;
};