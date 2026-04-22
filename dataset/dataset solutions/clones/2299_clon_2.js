// Immediately Invoked Function Expression for managing code units
!function(allCodeUnits) {
    // A cache for already loaded and initialized code units
    let unitStore = {};

    // The central function for loading and importing code units
    function importModule(moduleId) {
        // If the code unit is already in our cache, return its exports directly
        if (unitStore[moduleId]) {
            return unitStore[moduleId].exports;
        }

        // Otherwise, create a new entry in the cache for this unit
        // 'ident' stores its unique ID, 'isLoaded' tracks execution status,
        // and 'exports' is the object that will hold the unit's public interface.
        let moduleEntry = unitStore[moduleId] = {
            ident: moduleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the code unit's function, providing it with its own context,
        // its exports object, and a reference to this `importModule` function
        // so it can import other units.
        allCodeUnits[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, importModule);

        // Mark this code unit as loaded after its execution.
        moduleEntry.isLoaded = true;

        // Return the exports of the newly loaded code unit.
        return moduleEntry.exports;
    }

    // Attach the collection of all code unit functions to the `importModule` function itself.
    importModule.allUnits = allCodeUnits;

    // Attach the module cache to the `importModule` function for external access (if needed).
    importModule.unitStore = unitStore;

    // A utility method to define a property on a target object, ensuring it's enumerable
    // and uses a getter function.
    importModule.defineExport = function(targetObject, propertyName, propertyGetter) {
        // Only define the property if it doesn't already exist on the target object.
        if (!importModule.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration
                get: propertyGetter // Use the provided function as a getter
            });
        }
    };

    // A utility method to mark a module's exports as an ES Module, enhancing interoperability.
    importModule.registerAsModule = function(moduleExports) {
        // If Symbol and Symbol.toStringTag are supported, set the toStringTag for better debugging.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Explicitly set __esModule to true to indicate it's an ES Module.
        Object.defineProperty(moduleExports, "__esModule", {
            value: true
        });
    };

    // A utility method to create a synthetic namespace object for a module,
    // especially for compatibility between CommonJS and ES Modules.
    importModule.createModuleNamespace = function(sourceModule, flags) {
        // If flag 1 is set, it means the sourceModule itself is a module ID that needs to be imported.
        if (flags & 1) {
            sourceModule = importModule(sourceModule);
        }
        // If flag 8 is set, return the module as-is.
        if (flags & 8) {
            return sourceModule;
        }
        // If flag 4 is set and it's an object already marked as an ES Module, return it as-is.
        if (flags & 4 && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
            return sourceModule;
        }

        // Create a new plain object to serve as the namespace.
        let namespaceObj = Object.create(null);

        // Mark this new object as an ES Module.
        importModule.registerAsModule(namespaceObj);

        // Define a 'default' export pointing to the original source module.
        Object.defineProperty(namespaceObj, "default", {
            enumerable: true,
            value: sourceModule
        });

        // If flag 2 is set and the source module is not a string,
        // copy its properties as getters to the namespace object.
        if (flags & 2 && typeof sourceModule !== "string") {
            for (let propKey in sourceModule) {
                importModule.defineExport(namespaceObj, propKey, (function(key) {
                    return sourceModule[key];
                }).bind(null, propKey));
            }
        }
        return namespaceObj;
    };

    // A utility method to get the default export from a module, handling different module types.
    importModule.retrieveDefaultExport = function(moduleContent) {
        // If the module is already an ES Module with a 'default' export, use that.
        // Otherwise, the moduleContent itself is considered the default export.
        let defaultGetter = moduleContent && moduleContent.__esModule ?
            function() {
                return moduleContent.default;
            } :
            function() {
                return moduleContent;
            };
        // Define a special 'a' property as a getter for the default export (common webpack convention).
        importModule.defineExport(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    // A utility method to check if an object has its own property (not inherited).
    importModule.checkOwnProperty = function(objToCheck, keyToCheck) {
        return Object.prototype.hasOwnProperty.call(objToCheck, keyToCheck);
    };

    // The public path for loading additional assets (e.g., dynamic imports).
    importModule.assetPath = "";

    // Kick off the application by loading the entry point module (ID 347).
    // The assignment `importModule.entryPoint = 347` is evaluated as part of the argument.
    importModule(importModule.entryPoint = 347);
})([ // Array containing all module definitions starts here
    /* Module 0 */
    function(currentModule, moduleOutput, moduleLoader) {
        // Import various helper utilities from other modules
        let globalRef = moduleLoader(5);
        let propDescGetter = moduleLoader(19).f;
        let defineNonEnum = moduleLoader(18);
        let updateObjProp = moduleLoader(20);
        let createGlobalObj = moduleLoader(79);
        let transferPropAttrs = moduleLoader(104);
        let checkPolyfill = moduleLoader(63);

        // This module exports a function for defining properties on a target object.
        currentModule.exports = function(exportConfig, exportMembers) {
            let targetObj, memberName, existingPropDesc, newPropVal, propDescriptorResult, configTarget = exportConfig.target,
                configGlobal = exportConfig.global,
                configStat = exportConfig.stat;

            // Determine the actual target object based on configuration: global, static, or prototype.
            if (configGlobal) {
                targetObj = globalRef;
            } else if (configStat) {
                targetObj = globalRef[configTarget] || createGlobalObj(configTarget, {});
            } else {
                targetObj = (globalRef[configTarget] || {}).prototype;
            }

            // If a valid target object is found, iterate through the members to be exported.
            if (targetObj) {
                for (memberName in exportMembers) {
                    newPropVal = exportMembers[memberName];

                    // Get the existing property descriptor, considering 'noTargetGet' flag.
                    existingPropDesc = exportConfig.noTargetGet ?
                        ((propDescriptorResult = propDescGetter(targetObj, memberName)) && propDescriptorResult.value) :
                        targetObj[memberName];

                    // Check if a polyfill is needed or if the existing property is different.
                    if (!checkPolyfill(configGlobal ? memberName : configTarget + (configStat ? "." : "#") + memberName, exportConfig.forced) &&
                        void 0 !== existingPropDesc) {
                        // If types are compatible, skip unless explicitly forced.
                        if (typeof newPropVal === typeof existingPropDesc) {
                            continue;
                        }
                        // If types differ, attempt to transfer property attributes.
                        transferPropAttrs(newPropVal, existingPropDesc);
                    }

                    // Apply the 'sham' flag if specified or inherited.
                    (exportConfig.sham || (existingPropDesc && existingPropDesc.sham)) && defineNonEnum(newPropVal, "sham", true);

                    // Update the property on the target object.
                    updateObjProp(targetObj, memberName, newPropVal, exportConfig);
                }
            }
        };
    },
    /* Module 1 */
    function(currentModule, moduleOutput, moduleLoader) {
        let isObjectUtil = moduleLoader(9);
        currentModule.exports = function(inputVal) {
            if (!isObjectUtil(inputVal)) {
                throw TypeError(String(inputVal) + " is not an object");
            }
            return inputVal;
        };
    },
    /* Module 2 */
    function(currentModule, moduleOutput) {
        currentModule.exports = false; // Indicates non-pure mode or similar flag
    },
    /* Module 3 */
    function(currentModule, moduleOutput, moduleLoader) {
        let requireObj = moduleLoader(1);
        let isIterableObj = moduleLoader(87);
        let toLengthUtil = moduleLoader(11);
        let bindContext = moduleLoader(13);
        let getIteratorMethod = moduleLoader(51);
        let iterateWithReturn = moduleLoader(113);

        // Internal class to represent an iteration stop state
        let IterationResult = function(stoppedFlag, finalResult) {
            this.stopped = stoppedFlag;
            this.result = finalResult;
        };

        // Exported function for iterating over a collection
        (currentModule.exports = function(collection, callbackFn, context, passArguments, allowStop) {
            let internalIterator, iteratorMethod, nextMethod, nextItem, itemValue, transformedValue,
                collectionLength, currentIdx = 0;
            let boundCallback = bindContext(callbackFn, context, passArguments ? 2 : 1);

            if (allowStop) {
                internalIterator = collection;
            } else {
                iteratorMethod = getIteratorMethod(collection);
                if (typeof iteratorMethod !== "function") {
                    throw TypeError("Target is not iterable");
                }
                if (isIterableObj(iteratorMethod)) { // If it's an Array-like iterable
                    for (collectionLength = toLengthUtil(collection.length); collectionLength > currentIdx; currentIdx++) {
                        itemValue = collection[currentIdx];
                        transformedValue = passArguments ? boundCallback(requireObj(itemValue)[0], itemValue[1]) : boundCallback(itemValue);
                        if (transformedValue && transformedValue instanceof IterationResult) {
                            return transformedValue;
                        }
                    }
                    return new IterationResult(false);
                }
                internalIterator = iteratorMethod.call(collection);
            }

            nextMethod = internalIterator.next;
            while (!(nextItem = nextMethod.call(internalIterator)).done) {
                transformedValue = iterateWithReturn(internalIterator, boundCallback, nextItem.value, passArguments);
                if (typeof transformedValue === "object