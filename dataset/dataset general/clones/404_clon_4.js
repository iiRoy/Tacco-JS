(function () {
    'use strict';

    let _constructorKey_ = 'creationPoint';

    // Utility: Merges properties from a donor object into a recipient object
    // only if the recipient does not already possess that property,
    // excluding a specified key.
    function mergeNonExistent(recipient, donor, omitKey) {
        for (let k in donor) {
            if (Object.prototype.hasOwnProperty.call(donor, k) && k !== omitKey) {
                if (!Object.prototype.hasOwnProperty.call(recipient, k)) {
                    recipient[k] = donor[k];
                }
            }
        }
    }

    let Scheme = function (definition, classAttributeSet) {
        if (classAttributeSet) {
            // First signature: Adding static attributes to an existing type.
            // 'definition' here refers to the existing class constructor.
            mergeNonExistent(definition, classAttributeSet, _constructorKey_);
            return;
        }

        // Second signature: Defining a new type.
        let primaryType = function () {
            // The actual constructor function for instances.
            // Invokes the user-defined constructor method if provided in the definition.
            if (definition[_constructorKey_]) {
                definition[_constructorKey_].apply(this, arguments);
            }
        };

        // Populate the prototype of the new type with instance methods
        // from the provided definition, excluding the constructor key.
        for (let propertyName in definition) {
            if (Object.prototype.hasOwnProperty.call(definition, propertyName) && propertyName !== _constructorKey_) {
                primaryType.prototype[propertyName] = definition[propertyName];
            }
        }

        // Add a static method 'forge' (analogous to 'extend') for type inheritance.
        primaryType.forge = function (childDefinition) {
            // Apply parent's instance methods to the child's definition if not already present.
            // This modifies 'childDefinition' in place, aligning with original behavior.
            mergeNonExistent(childDefinition, definition, _constructorKey_);

            // Recursively create the derived type using the (potentially modified) child definition.
            let derivedType = Scheme(childDefinition);

            // Attach a static 'source' method (analogous to 'base') to the derived type.
            // This allows calling the parent constructor from the child's constructor.
            derivedType.source = function () {
                let invocationArgs = Array.prototype.slice.call(arguments);
                let targetInstance = invocationArgs.shift();
                primaryType.apply(targetInstance, invocationArgs);
            };

            // Link the derived type to its predecessor (parent type).
            derivedType.predecessor = primaryType;

            return derivedType;
        };

        return primaryType;
    };

    // --- Aspect-Oriented Programming (AOP) Implementation ---
    let MethodInterceptor = {};

    // Helper to apply a wrapper function around an existing method on a prototype.
    function applyWrapper(targetProto, methodName, wrapperCreator) {
        const originalRoutine = targetProto[methodName];
        if (typeof originalRoutine !== 'function') {
            throw new Error(`Routine '${methodName}' not found or not a function on prototype.`);
        }
        targetProto[methodName] = wrapperCreator(originalRoutine);
    }

    // Interception logic for 'before' aspect.
    MethodInterceptor.beforeInvocation = function (targetProto, targetMethodName, preAction) {
        applyWrapper(targetProto, targetMethodName, (original) => {
            return function () {
                preAction.apply(this, arguments);
                return original.apply(this, arguments);
            };
        });
    };

    // Interception logic for 'after returning' aspect.
    MethodInterceptor.afterSuccessfulReturn = function (targetProto, targetMethodName, postAction) {
        applyWrapper(targetProto, targetMethodName, (original) => {
            return function () {
                const outcome = original.apply(this, arguments);
                return postAction.call(this, outcome);
            };
        });
    };

    // Interception logic for 'after throwing' aspect.
    MethodInterceptor.afterException = function (targetProto, targetMethodName, errorAction) {
        applyWrapper(targetProto, targetMethodName, (original) => {
            return function () {
                let outcome;
                try {
                    outcome = original.apply(this, arguments);
                } catch (exceptionObject) {
                    outcome = errorAction.call(this, exceptionObject);
                }
                return outcome;
            };
        });
    };

    // Expose the AOP functionality via Scheme.
    // Returns a chainable object to apply multiple aspects to a single method.
    Scheme.Interceptor = function (classReference, routineName) {
        let prototypeRef = classReference.prototype;
        return {
            precede: function (actionFn) {
                MethodInterceptor.beforeInvocation(prototypeRef, routineName, actionFn);
                return this;
            },
            postReturn: function (actionFn) {
                MethodInterceptor.afterSuccessfulReturn(prototypeRef, routineName, actionFn);
                return this;
            },
            postError: function (actionFn) {
                MethodInterceptor.afterException(prototypeRef, routineName, actionFn);
                return this;
            }
        };
    };

    // Export the library for Node.js and Browser environments.
    if ('undefined' !== typeof module && module.exports) {
        module.exports = Scheme;
    } else {
        window.Scheme = Scheme;
    }

}());