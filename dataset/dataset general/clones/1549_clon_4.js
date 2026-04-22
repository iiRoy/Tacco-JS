(function(globalScope, moduleInitializer) {
    const environmentResolvers = [
        {
            checkCondition: () => typeof define === 'function' && define.amd,
            loadDependencies: () => {
                define(['underscore', 'backbone'], (utilSet, coreFramework) => {
                    moduleInitializer(utilSet, coreFramework);
                });
            }
        },
        {
            checkCondition: () => typeof exports !== 'undefined' && typeof require === 'function',
            loadDependencies: () => {
                const utilSet = require('underscore');
                const coreFramework = require('backbone');
                moduleInitializer(utilSet, coreFramework);
            }
        },
        {
            checkCondition: () => true, // Default to browser global
            loadDependencies: () => {
                moduleInitializer(globalScope._, globalScope.Backbone);
            }
        }
    ];

    for (const resolver of environmentResolvers) {
        if (resolver.checkCondition()) {
            resolver.loadDependencies();
            break;
        }
    }
}(this, function moduleInitializer(utilSet, coreFramework) {
    const missingAncestorMethod = (methodName) => {
        throw new Error("Ancestor method not implemented: " + methodName);
    };

    const ancestorCallPattern = /\b_ancestor\b/; // Pattern to detect calls to ancestor methods

    const createMethodInterceptor = function(ancestorPrototype, memberKey, targetMethod) {
        const interceptorFunc = function() {
            const prevAncestorRef = this._ancestor;

            // Temporarily set _ancestor to the parent's method, or a placeholder if missing
            this._ancestor = ancestorPrototype[memberKey] || missingAncestorMethod(memberKey);

            let resultValue;
            try {
                resultValue = targetMethod.apply(this, arguments);
            } finally {
                this._ancestor = prevAncestorRef; // Restore original _ancestor reference
            }
            return resultValue;
        };

        // Transfer properties from original function to wrapper and remove from original
        for (const funcProperty in targetMethod) {
            if (Object.prototype.hasOwnProperty.call(targetMethod, funcProperty)) {
                interceptorFunc[funcProperty] = targetMethod[funcProperty];
                delete targetMethod[funcProperty];
            }
        }

        return interceptorFunc;
    };

    const composeProgeny = function(ancestorClass, instanceMembers, staticElements) {
        let heirClass;
        const ancestorPrototype = ancestorClass.prototype;

        // Determine the constructor for the new subclass
        if (instanceMembers && Object.prototype.hasOwnProperty.call(instanceMembers, 'constructor')) {
            heirClass = instanceMembers.constructor;
        } else {
            heirClass = function() {
                return ancestorClass.apply(this, arguments);
            };
        }

        // Copy static properties from ancestor to heir, then apply new static elements.
        // This replicates the behavior of `_.extend(child, parent, staticProps);`
        Object.assign(heirClass, ancestorClass, staticElements);

        // Set up the prototype chain using Object.create for clean inheritance
        heirClass.prototype = Object.create(ancestorPrototype);

        // Add instance properties to the subclass
        if (instanceMembers) {
            // Apply all instance properties initially
            Object.assign(heirClass.prototype, instanceMembers);

            // Wrap methods that contain calls to `_ancestor`
            Object.keys(instanceMembers).forEach(memberKey => {
                const targetMethod = instanceMembers[memberKey];
                if (typeof targetMethod === "function" && ancestorCallPattern.test(targetMethod.toString())) {
                    heirClass.prototype[memberKey] = createMethodInterceptor(ancestorPrototype, memberKey, targetMethod);
                }
            });
        }

        // Redundantly apply static properties again if provided, matching original behavior
        if (staticElements) {
            Object.assign(heirClass, staticElements);
        }

        // Correctly set heir's `prototype.constructor`.
        heirClass.prototype.constructor = heirClass;

        // Set a convenience property for ancestor's prototype.
        heirClass.__ancestor__ = ancestorPrototype;

        return heirClass;
    };

    const frameworkComponents = [
        coreFramework.Model,
        coreFramework.Collection,
        coreFramework.Router,
        coreFramework.View
    ];

    const extensionAdapter = function(instanceMembers, staticElements) {
        const heirClass = composeProgeny(this, instanceMembers, staticElements);
        heirClass.extend = this.extend; // Maintain the extend method
        return heirClass;
    };

    frameworkComponents.forEach(component => {
        if (component && typeof component.extend === 'function') {
            component.extend = extensionAdapter;
        }
    });

    return composeProgeny;
}));