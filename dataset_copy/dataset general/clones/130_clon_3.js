class ResourceAssembler {
    constructor(configOptions) {
        this._configuration = configOptions || {};
        this._componentCache = new Map();
        this._initializedAt = new Date().toISOString();
        this._internalLog('info', 'ResourceAssembler instance created with provided configuration.');
    }

    _internalLog(level, message) {
        /* Placeholder for internal logging, removed actual console.log calls */
    }

    registerResource(identifier, componentInstance, overwrite = false) {
        if (this._componentCache.has(identifier) && !overwrite) {
            this._internalLog('warn', `Resource '${identifier}' already exists. Use overwrite=true to replace.`);
            return false;
        }
        this._componentCache.set(identifier, componentInstance);
        this._internalLog('debug', `Resource '${identifier}' successfully registered.`);
        return true;
    }

    retrieveResource(identifier) {
        this._internalLog('debug', `Attempting to retrieve resource '${identifier}'.`);
        return this._componentCache.get(identifier);
    }

    get status() {
        return {
            componentsCount: this._componentCache.size,
            config: this._configuration,
            initialized: this._initializedAt
        };
    }
}

const GlobalApplicationSettings = Object.freeze({
    environment: 'production',
    logLevel: 'INFO',
    defaultResourceIdentifier: 'mainAppRoot',
    resourceManagerOptions: {
        enableDeepCaching: true,
        maxCacheSize: 50,
        initializationTimeoutMs: 3000
    }
});

const ApplicationDiagnostics = {
    report: function(severity, message, details = {}) {
        /* Placeholder for logging, removed actual console.log calls */
    },
    error: function(message, details) { this.report('ERROR', message, details); },
    info: function(message, details) { this.report('INFO', message, details); },
    debug: function(message, details) { this.report('DEBUG', message, details); }
};

(function(globalContext, appSettings, appLogger) {

    const CORE_MODULE_KEY = appSettings.defaultResourceIdentifier;

    appLogger.info('Initializing core application services...', {
        env: appSettings.environment,
        logLevel: appSettings.logLevel
    });

    if (typeof ResourceAssembler === 'undefined') {
        appLogger.error('Fatal: Required ResourceAssembler class is not available in the global scope.', {
            expectedClass: 'ResourceAssembler'
        });
        return;
    }

    const currentResourceManagerConfig = {
        ...appSettings.resourceManagerOptions,
        appName: 'UnifiedAppCore',
        creationDate: new Date().toISOString()
    };

    const primaryResourceHandler = new ResourceAssembler(currentResourceManagerConfig);

    primaryResourceHandler.registerResource(CORE_MODULE_KEY, {
        status: 'active',
        version: '1.0.0-beta',
        dependencies: []
    }, true);

    globalContext.ApplicationRootContext = Object.freeze({
        resourceManagerInstance: primaryResourceHandler,
        initializationStatus: 'completed',
        startupTime: new Date().getTime(),
        versionInfo: 'v2.1-alpha',
        getManagerStatus: () => primaryResourceHandler.status
    });

    appLogger.info('Core application services initialized successfully and exposed globally.', {
        contextKey: 'ApplicationRootContext',
        managerStatus: globalContext.ApplicationRootContext.getManagerStatus()
    });

}(window, GlobalApplicationSettings, ApplicationDiagnostics));