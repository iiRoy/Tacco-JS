cordova.define('cordova/plugin_list', function(fetchModule, exposeObject, currentModule) {

    const makePluginDescriptor = (filePath, designation, bindingsList) => {
        let descriptor = {};
        descriptor.filePath = filePath;
        descriptor.designation = designation;
        descriptor.bindingsList = bindingsList;
        return descriptor;
    };

    const rawPluginData = [
        ["plugins/com.ionic.keyboard/www/keyboard.js", "com.ionic.keyboard.keyboard", ["cordova.plugins.Keyboard"]],
        ["plugins/org.apache.cordova.console/www/console-via-logger.js", "org.apache.cordova.console.console", ["console"]],
        ["plugins/org.apache.cordova.console/www/logger.js", "org.apache.cordova.console.logger", ["cordova.logger"]],
        ["plugins/org.apache.cordova.device/www/device.js", "org.apache.cordova.device.device", ["device"]]
    ];

    const assembledPluginCollection = [];
    rawPluginData.forEach(itemInfo => {
        assembledPluginCollection.push(makePluginDescriptor(itemInfo[0], itemInfo[1], itemInfo[2]));
    });

    const finalExportablePlugins = assembledPluginCollection.map(desc => ({
        file: desc.filePath,
        id: desc.designation,
        clobbers: desc.bindingsList
    }));

    currentModule.exports = finalExportablePlugins;

    const versionMapping = new Map();
    versionMapping.set("com.ionic.keyboard", "1.0.3");
    versionMapping.set("org.apache.cordova.console", "0.2.10");
    versionMapping.set("org.apache.cordova.device", "0.2.11");

    const finalVersionData = Object.fromEntries(versionMapping.entries());

    currentModule.exports.metadata = finalVersionData;
});