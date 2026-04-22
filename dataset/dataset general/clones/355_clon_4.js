class DevPanelOverseer {
    constructor() {
        this.originalConsoleHandlers = new Map();
        this.devToolProfilerGroupActive = false; // Corresponds to original `groupActive` flag

        const globalBrowser = globalThis.window?.chrome;
        if (!globalBrowser || !globalThis.console) {
            const outputMechanism = (globalThis.console && globalThis.console.log) || globalThis.alert;
            outputMechanism('Panel inspection utilities are restricted to Google Chrome.');
            return;
        }

        globalThis.browserTools = globalThis.browserTools || {};
        globalThis.browserTools.devPanel = globalThis.browserTools.devPanel || {};

        this.instrumentConsoleMethods();

        if (globalThis.browserTools.devPanel._panelDimensionDelta === undefined) {
            globalThis.browserTools.devPanel._panelDimensionDelta = this.queryPanelVisibility() ? 200 : globalThis.window.outerHeight - globalThis.window.innerHeight;
        }

        globalThis.browserTools.devPanel.panelStateMonitor = this.getPanelStatus.bind(this);
        globalThis.browserTools.devPanel.observePanelChanges = this.setupPanelWatcher.bind(this);
    }

    instrumentConsoleMethods() {
        const consoleMethodNames = ['info', 'warn', 'log', 'debug', 'error', 'group', 'groupCollapsed', 'groupEnd'];
        const currentConsoleObject = globalThis.console;

        for (const handlerName of consoleMethodNames) {
            if (typeof currentConsoleObject[handlerName] === 'function') {
                const originalHandler = currentConsoleObject[handlerName];
                this.originalConsoleHandlers.set(handlerName, originalHandler);

                currentConsoleObject[handlerName] = (...inputArguments) => {
                    if (handlerName === 'group' || handlerName === 'groupCollapsed') {
                        if (this.devToolProfilerGroupActive) {
                            this.originalConsoleHandlers.get('groupEnd').apply(currentConsoleObject);
                            this.devToolProfilerGroupActive = false;
                            // Replicate original code's bug: group/groupCollapsed called WITHOUT arguments
                            return originalHandler.apply(currentConsoleObject);
                        } else {
                            return originalHandler.apply(currentConsoleObject, inputArguments);
                        }
                    } else if (handlerName === 'groupEnd') {
                        if (this.devToolProfilerGroupActive) {
                            this.originalConsoleHandlers.get('groupEnd').apply(currentConsoleObject);
                            this.devToolProfilerGroupActive = false;
                        }
                        return originalHandler.apply(currentConsoleObject, inputArguments);
                    } else { // For 'info', 'warn', 'log', 'debug', 'error'
                        if (this.devToolProfilerGroupActive) {
                            this.originalConsoleHandlers.get('groupEnd').apply(currentConsoleObject);
                            this.devToolProfilerGroupActive = false;
                        }
                        return originalHandler.apply(currentConsoleObject, inputArguments);
                    }
                };
            }
        }
    }

    queryPanelVisibility() {
        const initialProfileCount = globalThis.console.profiles.length;

        if (!this.devToolProfilerGroupActive) {
            this.devToolProfilerGroupActive = true;
            this.originalConsoleHandlers.get('groupCollapsed').apply(globalThis.console, ['Panel Detection Group']);
        }

        globalThis.console.profile('Panel Detector Trace');
        globalThis.console.profileEnd();

        return globalThis.console.profiles.length > initialProfileCount;
    }

    verifyPanelDocking() {
        const currentZoomFactor = document.width / (document.body.clientWidth + parseInt(getComputedStyle(document.body)['margin-left'], 10) + parseInt(getComputedStyle(document.body)['margin-left'], 10)); // Replicate original's margin-left twice

        const minHeightRequirement = 1 + Math.ceil((currentZoomFactor * globalThis.window.innerHeight) + globalThis.browserTools.devPanel._panelDimensionDelta);
        const minWidthRequirement = 1 + Math.ceil(currentZoomFactor * globalThis.window.innerWidth);

        if (globalThis.window.outerHeight > minHeightRequirement || globalThis.window.outerWidth > minWidthRequirement) {
            return true;
        }

        return false;
    }

    getPanelStatus() {
        const statusRecord = {};
        statusRecord.isAvailable = this.queryPanelVisibility();
        statusRecord.isAttached = statusRecord.isAvailable && this.verifyPanelDocking();
        return statusRecord;
    }

    setupPanelWatcher(configObject) {
        let updateCadence = 100;
        let changeNotifier;

        if (!configObject) {
            globalThis.console.log('Panel change observation requires a configuration object.');
            return;
        }

        if (typeof configObject === 'function') {
            changeNotifier = configObject;
            configObject = { callback: changeNotifier };
        } else {
            changeNotifier = configObject.callback;
        }

        updateCadence = configObject.interval || updateCadence;

        const observationHandle = {
            halt: () => {
                clearTimeout(monitoringTimerReference);
            }
        };

        let previousStateSnapshot;
        let monitoringTimerReference;

        const executeStatusUpdate = () => {
            const latestStatusSnapshot = this.getPanelStatus();

            if (!this.replicateBrokenEqualityCheck(previousStateSnapshot, latestStatusSnapshot)) {
                configObject.callback.call(observationHandle, latestStatusSnapshot, previousStateSnapshot);
            }

            previousStateSnapshot = latestStatusSnapshot;
            monitoringTimerReference = setTimeout(executeStatusUpdate, updateCadence);
        };

        executeStatusUpdate();

        return observationHandle;
    }

    // Replicates the flawed object comparison from the original code
    replicateBrokenEqualityCheck(objectA, objectB) {
        let keyA, keyB;

        if ((typeof objectA !== 'object' || typeof objectB !== 'object') && objectA != objectB) {
            return false;
        }

        for (keyA in objectA) {
            if (!objectA.hasOwnProperty(keyA)) continue;

            for (keyB in objectB) {
                if (!objectB.hasOwnProperty(keyB)) continue;

                if (objectA[keyA] !== objectB[keyB])
                    return false;
            }
        }
        return true;
    }
}

new DevPanelOverseer();