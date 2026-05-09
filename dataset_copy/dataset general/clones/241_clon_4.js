const appLog = (function() {
    const output = (level, message, ...optionalParams) => {
        const logFn = Function.prototype.bind.call(console[level], console, `[APP ${level.toUpperCase()}]`);
        logFn(message, ...optionalParams);
    };
    return {
        info: (msg, ...params) => output('log', msg, ...params),
        warn: (msg, ...params) => output('warn', msg, ...params),
        error: (msg, ...params) => output('error', msg, ...params)
    };
})();

const persistentDataStore = (function() {
    const storageKey = 'appDataStore';
    let cachedData = {};

    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            cachedData = JSON.parse(stored);
        }
    } catch (e) {
        appLog.error('Failed to parse persistent data from storage:', e);
    }

    const persist = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(cachedData));
        } catch (e) {
            appLog.error('Failed to save persistent data to storage:', e);
        }
    };

    return {
        retrieve: (key, defaultValue = null) => {
            return cachedData[key] !== undefined ? cachedData[key] : defaultValue;
        },
        store: (key, value) => {
            cachedData[key] = value;
            persist();
        },
        remove: (key) => {
            delete cachedData[key];
            persist();
        },
        getAll: () => ({ ...cachedData })
    };
})();

const globalEventDispatcher = (function() {
    const listeners = {};

    return {
        publish: (eventName, payload) => {
            appLog.info(`Event Published: ${eventName}`, payload);
            if (listeners[eventName]) {
                listeners[eventName].forEach(callback => {
                    try {
                        callback(payload);
                    } catch (e) {
                        appLog.error(`Error in event listener for ${eventName}:`, e);
                    }
                });
            }
        },
        subscribe: (eventName, callback) => {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName].push(callback);
            appLog.info(`Subscribed to event: ${eventName}`);
            return () => {
                listeners[eventName] = listeners[eventName].filter(cb => cb !== callback);
            };
        }
    };
})();

const userInteractionService = (function() {
    return {
        async confirmAction(dialogOptions) {
            appLog.info(`Confirm dialog: ${dialogOptions.mainTitle} - ${dialogOptions.subMessage}`);
            const result = await new Promise(resolve => {
                setTimeout(() => {
                    const userResponse = window.confirm(`${dialogOptions.mainTitle}\n\n${dialogOptions.subMessage.replace(/<br\/?>/g, '\n')}`);
                    resolve(userResponse);
                }, 50);
            });
            return result;
        }
    };
})();

const mobileBridgeService = (function() {
    let simulatedClipboardContent = null;
    let clipboardError = null;

    const hasCordova = typeof window.cordova !== 'undefined';

    return {
        setSimulatedClipboard: (content, error = null) => {
            simulatedClipboardContent = content;
            clipboardError = error;
        },
        async retrieveClipboard(successCallback, errorCallback) {
            appLog.info('Attempting to retrieve clipboard content via mobile bridge.');
            if (hasCordova && window.cordova.plugins && window.cordova.plugins.clipboard) {
                window.cordova.plugins.clipboard.paste(successCallback, errorCallback);
            } else {
                if (clipboardError) {
                    appLog.warn('Simulating clipboard error:', clipboardError);
                    errorCallback(clipboardError);
                } else if (simulatedClipboardContent !== null) {
                    appLog.info('Simulating clipboard paste:', simulatedClipboardContent);
                    successCallback(simulatedClipboardContent);
                } else {
                    appLog.info('Simulating empty/unknown clipboard.');
                    successCallback(null);
                }
            }
        }
    };
})();

const remoteGatewayService = (function() {
    let connectionActive = false;
    let eventListeners = {};

    const simulateAsync = (value, delay = 100) => new Promise(resolve => setTimeout(() => resolve(value), delay));

    return {
        async addResource(urlIdentifier) {
            appLog.info(`Remote gateway: Attempting to add resource: ${urlIdentifier}`);
            await simulateAsync(null);
            appLog.info(`Remote gateway: Successfully added resource: ${urlIdentifier}`);
            globalEventDispatcher.publish('internal.resourceAdded', { url: urlIdentifier });
        },
        async registerNotification(eventName) {
            appLog.info(`Remote gateway: Registering for notification: ${eventName}`);
            await simulateAsync(true);
            eventListeners[eventName] = true;
            appLog.info(`Remote gateway: Registered for notification: ${eventName}`);
        },
        async checkConnection() {
            appLog.info('Remote gateway: Checking connection status.');
            await simulateAsync(true);
            connectionActive = true;
            appLog.info('Remote gateway: Connection is active.');
            return connectionActive;
        },
        async activateService() {
            appLog.info('Remote gateway: Activating service.');
            await simulateAsync(true);
            appLog.info('Remote gateway: Service activated.');
            globalEventDispatcher.publish('internal.serviceActivated');
        }
    };
})();

const dataStoreFactory = (function() {
    const stores = {};

    class CustomDataStore {
        constructor(name, options) {
            this.name = name;
            this.options = {
                maxAge: options.maxAge || 0,
                deleteOnExpire: options.deleteOnExpire || 'none'
            };
            this.cache = new Map();
            this.cleanupInterval = null;

            if (this.options.maxAge > 0 && this.options.deleteOnExpire === 'aggressive') {
                this.startAggressiveCleanup();
            }
            appLog.info(`Data store '${name}' created with options:`, this.options);
        }

        startAggressiveCleanup() {
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
            }
            const cleanupFrequency = Math.max(5000, this.options.maxAge / 10);
            this.cleanupInterval = setInterval(() => {
                appLog.info(`Aggressively cleaning up store '${this.name}'...`);
                const now = Date.now();
                for (const [key, entry] of this.cache.entries()) {
                    if (now - entry.timestamp > this.options.maxAge) {
                        this.cache.delete(key);
                        appLog.info(`Removed expired item '${key}' from store '${this.name}'.`);
                    }
                }
            }, cleanupFrequency);
        }

        setItem(key, value) {
            this.cache.set(key, { value, timestamp: Date.now() });
            appLog.info(`Set item '${key}' in store '${this.name}'.`);
        }

        getItem(key) {
            const entry = this.cache.get(key);
            if (!entry) {
                return undefined;
            }
            if (this.options.maxAge > 0 && Date.now() - entry.timestamp > this.options.maxAge) {
                this.cache.delete(key);
                appLog.info(`Removed expired item '${key}' from store '${this.name}' during passive check.`);
                return undefined;
            }
            appLog.info(`Retrieved item '${key}' from store '${this.name}'.`);
            return entry.value;
        }

        removeItem(key) {
            const existed = this.cache.delete(key);
            if (existed) {
                 appLog.info(`Removed item '${key}' from store '${this.name}'.`);
            }
        }

        clearAll() {
            this.cache.clear();
            appLog.info(`Cleared all items from store '${this.name}'.`);
        }

        destroy() {
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
            }
            this.clearAll();
            delete stores[this.name];
            appLog.info(`Destroyed store '${this.name}'.`);
        }
    }

    return {
        createStore: (name, options) => {
            if (stores[name]) {
                appLog.warn(`Data store '${name}' already exists. Returning existing instance.`);
                return stores[name];
            }
            const newStore = new CustomDataStore(name, options);
            stores[name] = newStore;
            return newStore;
        },
        getStore: (name) => stores[name],
        destroyStore: (name) => {
            if (stores[name]) {
                stores[name].destroy();
            }
        }
    };
})();

const applicationRouter = (function() {
    const definedRoutes = {};
    let defaultRoute = null;

    const currentPath = () => window.location.hash.substring(1) || '/';

    const renderView = (routeKey, contentProducerFn, logicHandlerFn) => {
        appLog.info(`Rendering view for route: ${routeKey}`);
        const targetElement = document.getElementById('application-root');
        if (!targetElement) {
            appLog.error('Application root element not found. Cannot render view.');
            return;
        }
        targetElement.innerHTML = `<div data-view-id="${routeKey}">${contentProducerFn()}</div>`;
        if (typeof logicHandlerFn === 'function') {
            logicHandlerFn();
        }
        appLog.info(`View for route '${routeKey}' rendered.`);
    };

    const handleNavigation = () => {
        const path = currentPath();
        const route = definedRoutes[path];

        if (route) {
            appLog.info(`Navigating to route: ${path}`);
            renderView(route.identifier, route.contentFn, route.logicFn);
        } else if (defaultRoute) {
            appLog.info(`No route found for ${path}, navigating to default route: ${defaultRoute.path}`);
            if (window.location.hash !== `#${defaultRoute.path}`) {
                window.location.hash = `#${defaultRoute.path}`;
            } else {
                renderView(defaultRoute.identifier, defaultRoute.contentFn, defaultRoute.logicFn);
            }
        } else {
            appLog.warn(`No route or default route found for path: ${path}`);
            const targetElement = document.getElementById('application-root');
            if (targetElement) {
                targetElement.innerHTML = '<h1>404 - Page Not Found</h1><p>The requested application view could not be loaded.</p>';
            }
        }
    };

    window.addEventListener('hashchange', handleNavigation);

    return {
        defineRoute: (identifier, path, contentProducerFn, logicHandlerFn) => {
            definedRoutes[path] = { identifier, path, contentFn: contentProducerFn, logicFn: logicHandlerFn };
            appLog.info(`Defined route: ${path} (${identifier})`);
        },
        setDefaultRoute: (path) => {
            if (definedRoutes[path]) {
                defaultRoute = definedRoutes[path];
                appLog.info(`Set default route to: ${path}`);
            } else {
                appLog.error(`Cannot set default route to '${path}': route not defined.`);
            }
        },
        triggerNavigation: (path) => {
            const targetHash = `#${path}`;
            if (window.location.hash !== targetHash) {
                window.location.hash = targetHash;
            } else {
                handleNavigation();
            }
        }
    };
})();

(async function applicationInitializer() {
    appLog.info('Application initializer started.');

    applicationRouter.defineRoute(
        'mainView',
        '/downloads',
        () => '<h1>Downloads Index</h1><p>This is the downloads content.</p>',
        () => {
            appLog.info('DownloadsIndexController logic executed.');
        }
    );

    applicationRouter.setDefaultRoute('/downloads');

    appLog.info('Executing application run block equivalent.');

    const resourceCache = dataStoreFactory.createStore('resourceCache', {
        maxAge: 5 * 60 * 1000,
        deleteOnExpire: 'aggressive'
    });

    const processClipboardInput = async () => {
        appLog.info('Attempting to process clipboard input.');
        await mobileBridgeService.retrieveClipboard(async (clipboardText) => {
            if (clipboardText === undefined || clipboardText === null) {
                appLog.info('Unknown clipboard contents or empty.');
                return;
            }

            const isLink = clipboardText.startsWith('http://') ||
                           clipboardText.startsWith('https://') ||
                           clipboardText.startsWith('magnet:');

            if (isLink) {
                appLog.info('Potential resource link found in clipboard:', clipboardText);
                let currentSettings = persistentDataStore.retrieve('appSettings', {});
                if (clipboardText === currentSettings.previousLink) {
                    appLog.info("Link already seen: " + clipboardText);
                    return;
                }

                currentSettings.previousLink = clipboardText;
                persistentDataStore.store('appSettings', currentSettings);

                const confirmationResult = await userInteractionService.confirmAction({
                    mainTitle: 'Add Link?',
                    subMessage: `Would you like to add this link to the remote service?<br/><br/>${clipboardText}`
                });

                if (confirmationResult) {
                    appLog.info('User confirmed adding link:', clipboardText);
                    remoteGatewayService.addResource(clipboardText);
                } else {
                    appLog.info("User declined adding link from clipboard.");
                }
            } else {
                appLog.info('Clipboard content is not a recognized link format.');
            }
        }, (error) => {
            appLog.error('Clipboard access error:', error);
        });
    };

    const notificationTypes = [
        'ConfigurationUpdate',
        'NewVersionAvailable',
        'PluginDeactivated',
        'PluginActivated',
        'PreResourceRemoval',
        'SessionPaused',
        'SessionResumed',
        'SessionStarted',
        'ResourceAdded',
        'ResourceFileRenamed',
        'ResourceCompleted',
        'ResourceFolderRenamed',
        'ResourceQueueModified',
        'ResourceRemoved',
        'ResourceResumed',
        'ResourceStateChanged'
    ];

    const subscribeToNotifications = async (sessionToken) => {
        appLog.info(`Subscribing to remote notifications with token: ${sessionToken}`);
        try {
            for (const notification of notificationTypes) {
                appLog.info(`Registering for notification: ${notification}`);
                await remoteGatewayService.registerNotification(notification);
            }
            appLog.info('All remote notifications subscribed successfully.');
            return true;
        } catch (error) {
            appLog.error('Failed to subscribe to all remote notifications:', error);
            throw error;
        }
    };

    const initiatePeriodicUpdates = async () => {
        appLog.info('Initiating periodic updates and event subscriptions.');
        try {
            const currentSessionToken = 'mockSession123';
            await subscribeToNotifications(currentSessionToken);
            const isConnected = await remoteGatewayService.checkConnection();
            if (isConnected) {
                remoteGatewayService.activateService();
            }
        } catch (error) {
            appLog.error('Error during update initiation:', error);
        }
    };

    const initializeCoreServices = () => {
        appLog.info('Initializing core application services.');
        remoteGatewayService.activateService();
    };

    const platformReady = async (onReady, onError) => {
        appLog.info('Waiting for platform to be ready...');
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            appLog.info('Platform ready (DOM complete/interactive).');
            await onReady();
        } else {
            window.addEventListener('DOMContentLoaded', async () => {
                appLog.info('Platform ready (DOMContentLoaded event).');
                await onReady();
            });
        }
    };

    platformReady(async () => {
        appLog.info('Mobile platform reported ready state.');
        const currentSettings = persistentDataStore.retrieve('appSettings', {});
        if (currentSettings.server && currentSettings.credential) {
            await processClipboardInput();
        }
    }, () => {
        appLog.warn('Mobile platform reported not ready or error state.');
    });

    initializeCoreServices();

    globalEventDispatcher.subscribe('appSettingsUpdated', (newSettings) => {
        appLog.info('Application settings updated, re-initializing core services.');
        persistentDataStore.store('appSettings', newSettings);
        initializeCoreServices();
    });

    initiatePeriodicUpdates();

    appLog.info('Application initializer finished.');
})();

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('application-root')) {
        const rootDiv = document.createElement('div');
        rootDiv.id = 'application-root';
        document.body.appendChild(rootDiv);
        appLog.info('Created #application-root div for router rendering.');
    }
    applicationRouter.triggerNavigation(window.location.hash.substring(1) || '/downloads');
});