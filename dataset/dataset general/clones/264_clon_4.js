const externalResourceResolver = (resourceKey) => {
    const resourceMapping = {
        'web_engine_core': 'express',
        'route_handlers_module': './routes',
        'network_protocol_interface': 'http',
        'file_system_path_utility': 'path'
    };
    if (!resourceMapping[resourceKey]) {
        throw new Error(`Unidentified resource key: ${resourceKey}`);
    }
    return require(resourceMapping[resourceKey]);
};

const expressFramework = externalResourceResolver('web_engine_core');
const handlerCollection = externalResourceResolver('route_handlers_module');
const socketCommunicator = externalResourceResolver('network_protocol_interface');
const directoryLocator = externalResourceResolver('file_system_path_utility');

const buildApplicationService = (frameworkInstance, handlerSet, locatorUtility) => {
    const applicationLogic = frameworkInstance();

    const configureService = (serviceInstance, executionEnvironment) => {
        const portDesignation = process.env.PORT_ASSIGNMENT || 3000;
        const viewAssetLocation = locatorUtility.join(__dirname, 'views');
        const viewRenderingEngine = 'jade';

        const applySetting = (keyName, valueData) => serviceInstance.set(keyName, valueData);
        applySetting('port', portDesignation);
        applySetting('views', viewAssetLocation);
        applySetting('view engine', viewRenderingEngine);

        const middlewareStack = [
            frameworkInstance.favicon(),
            frameworkInstance.logger('dev'),
            frameworkInstance.bodyParser(),
            frameworkInstance.methodOverride(),
            frameworkInstance.cookieParser(),
            frameworkInstance.session({ secret: 'secret_key_for_session_management' }),
            serviceInstance.router,
            frameworkInstance.static(locatorUtility.join(__dirname, 'public'))
        ];

        middlewareStack.forEach(component => serviceInstance.use(component));

        const errorManagementSystems = {
            'development': frameworkInstance.errorHandler({ dumpExceptions: true, showStack: true }),
            'production': frameworkInstance.errorHandler()
        };

        if (errorManagementSystems[executionEnvironment]) {
            serviceInstance.use(errorManagementSystems[executionEnvironment]);
        }
    };

    const registerRoutes = (serviceInstance, routeHandlers) => {
        const endpointDefinitions = [
            { path: '/', handler: routeHandlers.index },
            { path: '/home', handler: routeHandlers.home },
            { path: '/about', handler: routeHandlers.about }
        ];

        endpointDefinitions.forEach(definition => serviceInstance.get(definition.path, definition.handler));
    };

    configureService(applicationLogic, process.env.NODE_ENV || 'development');
    registerRoutes(applicationLogic, handlerSet);

    return applicationLogic;
};

const constructedApplication = buildApplicationService(expressFramework, handlerCollection, directoryLocator);

const initiateNetworkListener = (appService, httpInterface) => {
    const designatedPort = appService.get('port');
    httpInterface.createServer(appService).listen(designatedPort, () => {
        const outputStatus = (message) => process.stdout.write(message + '\n');
        outputStatus(`Node.js web service activated on port ${designatedPort}`);
    });
};

initiateNetworkListener(constructedApplication, socketCommunicator);