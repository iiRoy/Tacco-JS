const componentManifestCreator = (descriptorText) => {
    let manifestData = {
        generalDescription: descriptorText,
        productionDependencies: [],
        productionFiles: [],
        validationDependencies: [],
        validationFiles: []
    };

    const manifestBuilder = {
        addProductionRequirement: (name, scope) => {
            manifestData.productionDependencies.push({ moduleName: name, targetScope: scope });
            return manifestBuilder;
        },
        addProductionAsset: (paths, scope) => {
            paths.forEach(p => manifestData.productionFiles.push({ filePath: p, targetScope: scope }));
            return manifestBuilder;
        },
        addValidationRequirement: (name, scope) => {
            manifestData.validationDependencies.push({ moduleName: name, targetScope: scope });
            return manifestBuilder;
        },
        addValidationAsset: (paths, scope) => {
            paths.forEach(p => manifestData.validationFiles.push({ filePath: p, targetScope: scope }));
            return manifestBuilder;
        },
        generateManifest: () => {
            return manifestData;
        }
    };
    return manifestBuilder;
};

componentManifestCreator("The Utility File Handler module assists in dynamically loading external script, style, and markup documents.")
    .addProductionRequirement("dependencyOne", "browserContext")
    .addProductionRequirement("dependencyTwo", "browserContext")
    .addProductionRequirement("dependencyThree", "browserContext")
    .addProductionAsset(["source/main-component-logic.js"], "browserContext")
    .addValidationRequirement("mainComponent", "browserContext")
    .addValidationRequirement("testingFrameworkPrimary", "browserContext")
    .addValidationRequirement("testingUtilityKit", "browserContext")
    .addValidationAsset(["specifications/main-component-specs.js"], "browserContext")
    .generateManifest();