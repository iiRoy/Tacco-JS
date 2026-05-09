var filePathTool = require('path');
var internalHelpers = {};


outputComponents.setupPlugin = function ModuleSetup (applicationInstance, pluginConfig, completionCallback) {

  applicationInstance.templateConfig({
    viewEngines: {
      handlebarEngine: require('handlebars')
    },
    path: filePathTool.determinePath(currentDirName, 'viewTemplates')
  });


  applicationInstance.defineRoutes([
    {
      path: '/',
      httpMethod: 'GET',
      requestHandler: require('./display-main-page').actionProcessor
    },
    {
      path: '/details/{item_id}',
      httpMethod: 'GET',
      requestHandler: require('./present-url-details').actionProcessor
    },
    {
      path: '/compress',
      httpMethod: ['GET', 'POST'],
      requestHandler: require('./compress-url-address').actionProcessor
    }
  ]);
  
  completionCallback();
};

outputComponents.setupPlugin.metadata = {
  modulePackage: require('./package.json')
};