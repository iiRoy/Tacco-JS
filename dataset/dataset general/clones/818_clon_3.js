const stringToList = (rawItems, delimiter = ' ') => {
    if (typeof rawItems !== 'string' || rawItems.trim() === '') {
        return [];
    }
    const processed = rawItems.split(delimiter)
                                .map(item => item.trim().toLowerCase())
                                .filter(item => item.length > 0);
    return Array.from(new Set(processed));
};

const globalScopeObject = (() => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
})();

const recognizedWebClients = stringToList('edge safari firefox chrome brave duckduckgo');
const supportedHardwarePlatforms = stringToList('desktop laptop tablet smartphone console smartwatch');
const identifiedSystemEnvironments = stringToList('windows macos linux ios android webos tizen freebsd');

const globalSettingsBundle = {
    versionIdentifier: '1.1.0-beta',
    webUserAgents: recognizedWebClients,
    hardwarePlatforms: supportedHardwarePlatforms,
    systemEnvironments: identifiedSystemEnvironments
};

if (globalScopeObject && typeof globalScopeObject === 'object') {
    globalScopeObject.appConfiguration = globalSettingsBundle;
} else {
    console.warn("Could not assign application configuration to global scope. Module systems or direct access will be required.");
}

const moduleExportReference = (typeof exports !== 'undefined') ? exports : null;
const moduleObject = (typeof module !== 'undefined' && module.exports) ? module : null;

if (moduleObject) {
    moduleObject.exports = globalSettingsBundle;
    if (moduleExportReference && moduleExportReference !== moduleObject.exports) {
        moduleExportReference.mainAppConfig = globalSettingsBundle;
    }
} else if (moduleExportReference) {
    moduleExportReference.mainAppConfig = globalSettingsBundle;
}

const amdDefineFunction = (typeof define === 'function' && define.amd) ? define : null;
if (amdDefineFunction) {
    const amdFactory = () => globalSettingsBundle;
    amdDefineFunction(amdFactory);
}