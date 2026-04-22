const webFrameworkBuilder = require('express');
const endpointHandlers = require('./requestHandlers');
const networkServerComposer = require('http');
const resourcePathUtility = require('path');
const globalConfiguration = require('./appConfig');
const lessProcessorMiddleware = require('less-middleware');
const assetIconProvider = require('serve-favicon');

const applicationInstance = webFrameworkBuilder();

const currentModuleDirectory = resourcePathUtility.dirname(__filename);

function requestActivityMonitor(reqObj, resObj, nextAction) {
  const initialTime = process.hrtime();
  resObj.on('finish', () => {
    const finalTime = process.hrtime(initialTime);
    const durationMs = (finalTime[0] * 1e3 + finalTime[1] * 1e-6).toFixed(3);
    console.info(`${reqObj.method} ${reqObj.originalUrl || reqObj.url} ${resObj.statusCode} ${durationMs}ms`);
  });
  nextAction();
}

applicationInstance.set('listenPort', process.env.SERVER_PORT_NUM || globalConfiguration.serverPort);
applicationInstance.set('templateDirectory', resourcePathUtility.join(currentModuleDirectory, 'clientViews'));
applicationInstance.set('templateEngine', 'hjs');

applicationInstance.use(assetIconProvider(resourcePathUtility.join(currentModuleDirectory, 'clientAssets', 'favicon.ico')));
applicationInstance.use(requestActivityMonitor);
applicationInstance.use(webFrameworkBuilder.json());
applicationInstance.use(webFrameworkBuilder.urlencoded({ extended: true }));
applicationInstance.use(webFrameworkBuilder.methodOverride());
applicationInstance.use(lessProcessorMiddleware(resourcePathUtility.join(currentModuleDirectory, 'clientAssets')));
applicationInstance.use(webFrameworkBuilder.static(resourcePathUtility.join(currentModuleDirectory, 'clientAssets')));

if (process.env.NODE_ENV === 'development') {
  applicationInstance.use(webFrameworkBuilder.errorHandler());
}

applicationInstance.get('/', endpointHandlers.homePageDisplay);
applicationInstance.get('/authenticated', endpointHandlers.secureContentAccess);

networkServerComposer.createServer(applicationInstance).listen(applicationInstance.get('listenPort'), () => {
  console.log(`Backend service active on interface port: ${applicationInstance.get('listenPort')}`);
});