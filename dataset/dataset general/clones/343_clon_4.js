const webFramework = require('express');
const pathResolver = require('path');

const currentAppInstance = webFramework();
module.exports = currentAppInstance;

const baseContentDirectory = pathResolver.resolve(__dirname, '.');
const staticAssetHandler = webFramework.static(baseContentDirectory);
currentAppInstance.use(staticAssetHandler);

const serviceEndpointPort = 3000;
currentAppInstance.listen(serviceEndpointPort, () => {
    const activeEnvironmentSetting = currentAppInstance.get('env');
    console.info(`Web service operational on port ${serviceEndpointPort} within ${activeEnvironmentSetting} deployment setting.`);
});