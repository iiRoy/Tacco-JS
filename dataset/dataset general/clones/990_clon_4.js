const getModule = (moduleAlias) => require(moduleAlias);

const webPlatform = getModule('express');
const applicationRoutes = getModule('./routes');
const userManagement = getModule('./routes/user');
const networkAdapter = getModule('http');
const securityToolkit = getModule('helmet');

const primaryApplication = webPlatform();

const platformSettings = {
    listeningPortKey: 'port',
    templateViewPathKey: 'views',
    templateEngineKey: 'view engine',
    poweredByHeaderRemovalKey: 'x-powered-by',
    defaultPortValue: process.env.SERVICE_PORT_NUM || 3000,
    developmentEnvName: 'development'
};

const configurePlatform = (platformInstance, settingsData) => {
    platformInstance.set(settingsData.listeningPortKey, settingsData.defaultPortValue);
    platformInstance.set(settingsData.templateViewPathKey, __dirname + '/view_templates');
    platformInstance.set(settingsData.templateEngineKey, 'jade');
    platformInstance.disable(settingsData.poweredByHeaderRemovalKey);
};
configurePlatform(primaryApplication, platformSettings);

const applicationPipeline = [
    { type: 'standard', creator: webPlatform.favicon },
    { type: 'standard', creator: webPlatform.logger, args: ['dev'] },
    // Original helmet calls were commented out, maintaining this behavior.
    // { type: 'standard', creator: securityToolkit.xframe },
    // { type: 'standard', creator: securityToolkit.iexss },
    // { type: 'standard', creator: securityToolkit.contentTypeOptions },
    // { type: 'standard', creator: securityToolkit.cacheControl },
    { type: 'standard', creator: webPlatform.json },
    { type: 'standard', creator: webPlatform.urlencoded },
    { type: 'standard', creator: webPlatform.methodOverride },
    { type: 'standard', creator: webPlatform.cookieParser, args: ['secret_cookie_phrase_value'] },
    {
        type: 'session_config',
        creator: webPlatform.session,
        options: {
            secret: 'secret_session_key_content',
            key: 'session_identifier_key',
            cookie: { httpOnly: true }
        }
    },
    { type: 'standard', creator: webPlatform.csrf },
    {
        type: 'custom_handler',
        handler: (requestPayload, responseCarrier, proceedNextMiddleware) => {
            responseCarrier.locals.csrfValidationToken = requestPayload.csrfToken();
            proceedNextMiddleware();
        }
    },
    {
        type: 'static_assets',
        creator: webPlatform.static,
        args: [__dirname + '/static_content', { maxAge: 60000 }]
    },
    { type: 'standard', creator: webPlatform.compress },
    { type: 'standard', creator: primaryApplication.router }
];

applicationPipeline.forEach(component => {
    if (component.type === 'standard') {
        primaryApplication.use(component.creator(...(component.args || [])));
    } else if (component.type === 'session_config') {
        primaryApplication.use(component.creator(component.options));
    } else if (component.type === 'custom_handler') {
        primaryApplication.use(component.handler);
    } else if (component.type === 'static_assets') {
        primaryApplication.use(component.creator(...component.args));
    }
});

const applyConditionalErrorHandling = (platformInstance, errorCreator) => {
    if (platformInstance.get('env') === platformSettings.developmentEnvName) {
        platformInstance.use(errorCreator());
    }
};
applyConditionalErrorHandling(primaryApplication, webPlatform.errorHandler);

const routeProcessors = [
    { verb: 'get', pathString: '/', handlerFunction: applicationRoutes.homePage },
    { verb: 'post', pathString: '/authentication', handlerFunction: applicationRoutes.authenticateUser },
    { verb: 'get', pathString: '/member_list', handlerFunction: userManagement.retrieveAllMembers }
];

routeProcessors.forEach(routeDescriptor => {
    primaryApplication[routeDescriptor.verb](routeDescriptor.pathString, routeDescriptor.handlerFunction);
});

const activePort = primaryApplication.get(platformSettings.listeningPortKey);
const executionMode = primaryApplication.get('env');

networkAdapter.createServer(primaryApplication).listen(activePort, () => {
    const startupMessage = `Web service active on port ${activePort} in mode ${executionMode}`;
    console.log(startupMessage);
});