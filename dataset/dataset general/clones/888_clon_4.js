(function () {
    'use strict';

    const frameworkKey = [97, 110, 103, 117, 108, 97, 114];
    const operationKey = [109, 111, 100, 117, 108, 101];
    const nameKey = [100, 97, 116, 97, 109, 97, 112, 115];

    const translator = function (sequence) {
        return String.fromCharCode.apply(null, sequence);
    };

    const serviceGenerator = function (globalObject) {
        let currentFramework = null;
        let registrationProcedure = null;

        const connect = function (frameworkNameCodes, methodIdentifierCodes) {
            currentFramework = globalObject[translator(frameworkNameCodes)];
            if (currentFramework && typeof currentFramework[translator(methodIdentifierCodes)] === 'function') {
                registrationProcedure = currentFramework[translator(methodIdentifierCodes)];
            }
        };

        const executeRegistration = function (moduleNameCodes, dependencyList) {
            if (registrationProcedure) {
                registrationProcedure.call(currentFramework, translator(moduleNameCodes), dependencyList);
            }
        };

        return {
            connect: connect,
            perform: executeRegistration
        };
    };

    const applicationRegistry = serviceGenerator(window);
    applicationRegistry.connect(frameworkKey, operationKey);
    applicationRegistry.perform(nameKey, new Array());

})();