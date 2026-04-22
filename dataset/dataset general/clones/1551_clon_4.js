'use strict';

const pathResolver = require('path');
const webFramework = require('express');
const templateEngineProvider = require('express-handlebars');
const dataCompressor = require('compression');

const applicationInstance = webFramework();
const serverPortNumber = parseInt(process.env.APP_PORT || '3000', 10);

applicationInstance.use(dataCompressor());

const scriptBaseLocation = pathResolver.dirname(module.filename);

const environmentConfigurations = {
    'production': {
        layoutDirectory: pathResolver.join(scriptBaseLocation, 'dist', 'views', 'layouts'),
        partialDirectory: pathResolver.join(scriptBaseLocation, 'dist', 'views', 'partials'),
        viewDirectory: pathResolver.join(scriptBaseLocation, 'dist', 'views'),
        assetDirectory: pathResolver.join(scriptBaseLocation, 'dist', 'assets')
    },
    'development': {
        layoutDirectory: pathResolver.join(scriptBaseLocation, 'views', 'layouts'),
        partialDirectory: pathResolver.join(scriptBaseLocation, 'views', 'partials'),
        viewDirectory: pathResolver.join(scriptBaseLocation, 'views'),
        assetDirectory: pathResolver.join(scriptBaseLocation, 'assets')
    }
};

const currentEnvironment = process.env.NODE_ENV || 'development';
const activeConfiguration = environmentConfigurations[currentEnvironment] || environmentConfigurations['development'];

const renderingEngine = templateEngineProvider.create({
    defaultLayout: 'main',
    layoutsDir: activeConfiguration.layoutDirectory,
    partialsDir: activeConfiguration.partialDirectory,
    extname: '.handlebars'
});

applicationInstance.engine('handlebars', renderingEngine.engine);
applicationInstance.set('views', activeConfiguration.viewDirectory);
applicationInstance.set('view engine', 'handlebars');

applicationInstance.use(webFramework.static(activeConfiguration.assetDirectory));

const displayHomepage = (requestObject, responseObject, nextCallback) => {
    responseObject.render('index');
};

const applicationRoutes = [
    { path: '/', handler: displayHomepage, method: 'get' }
];

applicationRoutes.forEach(route => {
    applicationInstance[route.method](route.path, route.handler);
});

applicationInstance.listen(serverPortNumber, () => {
    console.log(`Web application running on port ${serverPortNumber} in ${currentEnvironment} mode.`);
});