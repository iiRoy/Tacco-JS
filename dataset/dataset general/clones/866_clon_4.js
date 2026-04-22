const configurationBlueprint = {
    'primaryApplicationModule': {
        'dataAccessor': (targetStore) => {
            targetStore.keyResources = [
                'Fundamental Web Structure',
                'Dynamic Interface Framework',
                'Code Verification Utility',
                'Styling Component Set'
            ];
        }
    }
};

function processApplicationBlueprint(blueprint) {
    const processedConfiguration = {};
    for (const moduleName in blueprint) {
        if (Object.prototype.hasOwnProperty.call(blueprint, moduleName)) {
            const moduleDefinition = blueprint[moduleName];
            const moduleContext = {};
            if (typeof moduleDefinition.dataAccessor === 'function') {
                moduleDefinition.dataAccessor(moduleContext);
            }
            processedConfiguration[moduleName] = moduleContext;
        }
    }
    return processedConfiguration;
}

const applicationRegistry = processApplicationBlueprint(configurationBlueprint);