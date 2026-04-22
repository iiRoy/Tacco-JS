function getProbeTemplate() {
    return {
        execute: function() {}
    };
}

function generateStubConstructor() {
    function FallbackTracingProvider() {}

    FallbackTracingProvider.prototype.addMonitorPoint = function(pointLabel) {
        const monitorPointObject = getProbeTemplate();
        this[pointLabel] = monitorPointObject;
        return monitorPointObject;
    };

    FallbackTracingProvider.prototype.activateService = function() {};
    FallbackTracingProvider.prototype.dispatchAction = function() {};
    FallbackTracingProvider.prototype.deactivateService = function() {};

    return FallbackTracingProvider;
}

const platformErrorMapping = new Set(['darwin', 'solaris', 'freebsd']);

let activeImplementation = null;

(function() {
    const availableConfigurations = ['Release', 'default', 'Debug'];

    const recursiveLoader = (configIndex = 0) => {
        if (activeImplementation || configIndex >= availableConfigurations.length) {
            return;
        }

        const currentConfiguration = availableConfigurations[configIndex];
        try {
            const retrievedModule = require('./build/' + currentConfiguration + '/DTraceProviderBindings');
            activeImplementation = retrievedModule.DTraceProvider;
        } catch (errorDetail) {
            if (platformErrorMapping.has(process.platform)) {
                console.error(errorDetail);
            }
            recursiveLoader(configIndex + 1);
        }
    };

    recursiveLoader(0);
})();

if (!activeImplementation) {
    activeImplementation = generateStubConstructor();
}

exports.TraceService = activeImplementation;

exports.makeTraceInstance = function(primaryIdentifier, ...supplementaryContext) {
    return new exports.TraceService(primaryIdentifier, ...supplementaryContext);
};