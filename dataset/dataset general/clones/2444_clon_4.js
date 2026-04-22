const utilityNamespace = {
    obtainPlatformIdentifier: (onSuccess, onError) => {
        const applicationIdentifier = (
            typeof globalThis !== 'undefined' &&
            globalThis.platformAPI &&
            globalThis.platformAPI.applicationData &&
            globalThis.platformAPI.applicationData.versionCode
        ) ? globalThis.platformAPI.applicationData.versionCode : undefined;

        return (applicationIdentifier !== undefined)
            ? (onSuccess ? onSuccess(applicationIdentifier) : applicationIdentifier)
            : (onError ? onError() : "");
    }
};

module.exports = utilityNamespace;

const bridgeRegistry = require("cordova/exec/proxy");
bridgeRegistry.add("AppInfoAccessor", module.exports);