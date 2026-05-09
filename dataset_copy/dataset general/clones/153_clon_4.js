(function(){

"use strict";

const moduleDefinition = {};
moduleDefinition.label = "platform-interaction-setup-component";
moduleDefinition.postInitDependencies = ["initialization-phase"];
moduleDefinition.isSynchronous = true;

function sanitizeResourceIdentifier(inputIdentifier) {
    const protocolPrefix = "file://";
    if (inputIdentifier.indexOf(protocolPrefix) === 0) {
        return inputIdentifier.slice(protocolPrefix.length);
    }
    return inputIdentifier;
}

moduleDefinition.activate = function() {
    const applicationContext = globalThis.systemRuntimeEnv;

    const commandProcessors = new Map([
        ["system-config-display", (payload) => {
            if (typeof payload.details === "object") {
                applicationContext.windowController.openSettingsInterface(payload.details);
            }
            return false;
        }],
        ["system-admin-panel-show", (payload) => {
            applicationContext.userInterface.showAdminPanel();
            return false;
        }],
        ["resource-add-from-uri", (payload) => {
            applicationContext.windowController.spawnResourceWindowByUri(payload.value);
            return false;
        }],
        ["resource-add-from-filesystem", (payload) => {
            Array.from(payload.fileList).map(entry => {
                applicationContext.windowController.spawnResourceWindowByPath(entry.location);
            });
            return false;
        }],
        ["resource-remove-by-uri", (payload) => {
            applicationContext.windowController.closeResourceWindowByUri(payload.value);
            return false;
        }],
        ["resource-backup-location-reveal", (payload) => {
            const processedPath = sanitizeResourceIdentifier(payload.value);
            const backupStoragePath = applicationContext.fileSystemBridge.determineBackupLocation(processedPath);
            if (!applicationContext.fileSystemBridge.checkPathExistence(backupStoragePath)) {
                applicationContext.fileSystemBridge.createDirectoryStructure(backupStoragePath);
            }
            applicationContext.osIntegration.displayItem(backupStoragePath);
            return false;
        }],
        ["resource-history-back", (payload) => {
            applicationContext.windowController.navigateResourceBack(payload.value);
            return false;
        }],
        ["resource-history-forward", (payload) => {
            applicationContext.windowController.navigateResourceForward(payload.value);
            return false;
        }],
        ["resource-developer-tools-open", (payload) => {
            applicationContext.windowController.launchDeveloperTools(payload.value);
            return false;
        }],
        ["system-configuration-folder-open", (payload) => {
            applicationContext.osIntegration.displayItem(applicationContext.appMetadata.configurationPath);
            return false;
        }],
        ["system-reveal-path", (payload) => {
            if (payload.value) {
                applicationContext.osIntegration.showInContainingFolder(payload.value);
            }
            return false;
        }],
        ["system-reveal-uri", (payload) => {
            if (payload.value) {
                applicationContext.osIntegration.showInContainingFolder(sanitizeResourceIdentifier(payload.value));
            }
            return false;
        }]
    ]);

    commandProcessors.forEach((processorFunc, commandName) => {
        applicationContext.eventBus.registerEventHandler(commandName, processorFunc);
    });
};

globalThis.exportedModule = moduleDefinition;

})();