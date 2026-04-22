class ModuleProcessorRegistry {
    #moduleCache = new Map();
    #objectiveJDependency = null;
    #dependencyResolverAccessor;

    constructor(dependencyResolverSupplier) {
        this.#dependencyResolverAccessor = dependencyResolverSupplier;
    }

    #retrieveObjectiveJCore() {
        if (!this.#objectiveJDependency) {
            const currentResolver = this.#dependencyResolverAccessor();
            if (typeof currentResolver !== 'function') {
                throw new Error("Dependency supplier did not provide a valid resolver function.");
            }
            this.#objectiveJDependency = currentResolver("objective-j");
        }
        return this.#objectiveJDependency;
    }

    refreshModuleSource(sourceIdentifier, resourceLocation) {
        const coreTool = this.#retrieveObjectiveJCore();
        const moduleProducer = coreTool.make_narwhal_factory(resourceLocation);

        Object.defineProperty(moduleProducer, 'resourcePath', {
            value: resourceLocation,
            writable: false,
            enumerable: true,
            configurable: false
        });

        this.#moduleCache.set(sourceIdentifier, moduleProducer);
    }

    obtainModuleProducer(sourceIdentifier, resourceLocation) {
        if (!this.#moduleCache.has(sourceIdentifier)) {
            this.refreshModuleSource(sourceIdentifier, resourceLocation);
        }
        return this.#moduleCache.get(sourceIdentifier);
    }
}

function obtainModuleHandler() {
    const getRequireFunction = () => typeof require !== 'undefined' ? require : undefined;
    return new ModuleProcessorRegistry(getRequireFunction);
}

require.loader.loaders.unshift([".j", obtainModuleHandler()]);