(function() {
const currentGlobalScope = (typeof window !== 'undefined' ? window : globalThis);
const APP_MOD_SCOPE_KEY = "";

const moduleRepository = new Map();
const moduleExportsCache = new Map();

const pathNormalizer = {
    _standardizePath: function(basePath, resourcePath) {
        if (resourcePath.includes("!")) {
            const parts = resourcePath.split("!");
            return this._standardizePath(basePath, parts[0]) + "!" + this._standardizePath(basePath, parts[1]);
        }

        if (resourcePath.startsWith(".")) {
            let pathSegments = basePath.split("/");
            pathSegments.pop();

            let relativeParts = resourcePath.split("/");
            for (const part of relativeParts) {
                if (part === ".") {
                } else if (part === "..") {
                    pathSegments.pop();
                } else {
                    pathSegments.push(part);
                }
            }
            resourcePath = pathSegments.join("/");
        }
        return resourcePath;
    }
};

class ModuleContextHolder {
    constructor(identifier, resolverInstance) {
        this.identifier = identifier;
        this.uri = '';
        this.exports = {};
        this.isPackaged = true;
        this.requestDependency = (depId, completionCallback) => {
            return resolverInstance.obtain(this.identifier, depId, completionCallback);
        };
    }
}

const moduleResolver = {
    obtain: function(originIdentifier, targetIdentifier, completionHandler) {
        if (Array.isArray(targetIdentifier)) {
            const resolvedDependencies = targetIdentifier.map(dependencyId => {
                const acquiredDep = this.obtain(originIdentifier, dependencyId);
                if (!acquiredDep && this.preExistingLoader) {
                    throw new Error(`Dependency '${dependencyId}' not found and no original loader to fall back on.`);
                }
                return acquiredDep;
            });
            if (completionHandler) {
                completionHandler(...resolvedDependencies);
            }
            return;
        }

        if (typeof targetIdentifier === 'string') {
            const fullyQualifiedId = pathNormalizer._standardizePath(originIdentifier, targetIdentifier);

            if (moduleExportsCache.has(fullyQualifiedId)) {
                if (completionHandler) {
                    completionHandler();
                }
                return moduleExportsCache.get(fullyQualifiedId);
            }

            let moduleContent = moduleRepository.get(fullyQualifiedId);

            if (!moduleContent) {
                if (this.preExistingLoader) {
                    return this.preExistingLoader.apply(currentGlobalScope, arguments);
                }
                console.error('Module not registered:', fullyQualifiedId);
                return null;
            }

            if (typeof moduleContent === 'function') {
                const currentModuleHolder = new ModuleContextHolder(fullyQualifiedId, this);
                const resultFromExecution = moduleContent(
                    currentModuleHolder.requestDependency,
                    currentModuleHolder.exports,
                    currentModuleHolder
                );
                const finalExportedValue = resultFromExecution || currentModuleHolder.exports;
                moduleExportsCache.set(fullyQualifiedId, finalExportedValue);
                if (completionHandler) {
                    completionHandler();
                }
                return finalExportedValue;
            } else {
                moduleExportsCache.set(fullyQualifiedId, moduleContent);
                if (completionHandler) {
                    completionHandler();
                }
                return moduleContent;
            }
        } else {
            if (this.preExistingLoader) {
                return this.preExistingLoader.apply(currentGlobalScope, arguments);
            }
            console.error('Invalid module identifier type provided:', typeof targetIdentifier);
            return null;
        }
    },
    preExistingLoader: null
};

const moduleRegistrar = {
    place: function(identifier, dependencies, contentSupplier) {
        if (typeof identifier !== 'string') {
            if (this.preExistingDefiner) {
                this.preExistingDefiner.apply(currentGlobalScope, arguments);
            } else {
                console.error('Dropping module due to non-string identifier.');
                console.trace();
            }
            return;
        }

        let actualContentSupplier = contentSupplier;
        if (arguments.length === 2) {
            actualContentSupplier = dependencies;
        }

        moduleRepository.set(identifier, actualContentSupplier);
    },
    preExistingDefiner: null
};

function establishModuleAPI(targetNamespace) {
    if (typeof currentGlobalScope.requirejs !== "undefined") {
        const originalGlobalDefine = currentGlobalScope.define;
        currentGlobalScope.define = function(id, deps, callback) {
            if (typeof callback !== "function") {
                return originalGlobalDefine.apply(this, arguments);
            }
            return originalGlobalDefine(id, deps, function(requestFunc, exportsObj, moduleObj) {
                if (Array.isArray(deps) && deps[2] === "module") {
                    moduleObj.packaged = true;
                }
                return callback.apply(this, arguments);
            });
        };
        currentGlobalScope.define.packaged = true;
        return;
    }

    let apiTarget = currentGlobalScope;
    if (targetNamespace) {
        if (!currentGlobalScope[targetNamespace]) {
            currentGlobalScope[targetNamespace] = {};
        }
        apiTarget = currentGlobalScope[targetNamespace];
    }

    if (apiTarget.define) {
        moduleRegistrar.preExistingDefiner = apiTarget.define;
    }
    apiTarget.define = moduleRegistrar.place;

    if (apiTarget.require) {
        moduleResolver.preExistingLoader = apiTarget.require;
    }
    const globalRequestFunc = (modulePath, completionCallback) => {
        return moduleResolver.obtain("", modulePath, completionCallback);
    };
    globalRequestFunc.packaged = true;
    apiTarget.require = globalRequestFunc;
}

establishModuleAPI(APP_MOD_SCOPE_KEY);
})();