var systemData = window.systemData || {};
window.systemData = systemData;
systemData.isNamespace = true;

(function (mainObject, undefined) {
    let systemIdentifier = "2.0.0";
    let diagnosticMode = false;
    let eventBroker = d3.dispatch('process_begin', 'process_end', 'refresh_visuals');

    let performanceMetrics = {};
    let visualCollection = [];

    const emitLog = function (...messages) {
        if (diagnosticMode && console.log) {
            console.log(...messages);
        }
        return messages[messages.length - 1];
    };

    const initiateProcessing = async function (batchAmount = 1) {
        batchAmount = batchAmount || 1;

        if (initiateProcessing.active) {
            return;
        }

        initiateProcessing.active = true;
        eventBroker.process_begin();

        const processBatch = async () => {
            if (initiateProcessing.queue.length === 0) {
                initiateProcessing.active = false;
                eventBroker.process_end();
                return;
            }

            const batch = initiateProcessing.queue.splice(0, batchAmount);
            for (const workItem of batch) {
                if (workItem && typeof workItem.visualize === 'function') {
                    const renderedVisual = workItem.visualize();
                    visualCollection.push(renderedVisual);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 0));
            processBatch();
        };

        processBatch();
    };

    initiateProcessing.active = false;
    initiateProcessing.queue = [];

    const addVisualTask = function (taskObject) {
        let normalizedTask = taskObject;
        if (typeof arguments[0] === 'function') {
            normalizedTask = { visualize: arguments[0] };
        }
        initiateProcessing.queue.push(normalizedTask);

        if (!initiateProcessing.active) {
            initiateProcessing();
        }
    };

    const setupWindowResizer = function (handlerCallback) {
        window.addEventListener('resize', (event) => {
            handlerCallback(event);
        });
    };

    const coreInitialization = function () {
        if (diagnosticMode) {
            eventBroker.on('process_begin', () => {
                performanceMetrics.startMark = performance.now();
            });
            eventBroker.on('process_end', () => {
                performanceMetrics.endMark = performance.now();
                performanceMetrics.totalElapsed = performanceMetrics.endMark - performanceMetrics.startMark;
                emitLog('Execution completed in', performanceMetrics.totalElapsed.toFixed(2), 'ms');
            });
        }

        eventBroker.on('refresh_visuals', () => {
            for (const visualComponent of visualCollection) {
                if (visualComponent && visualComponent.drawingContext && typeof visualComponent.drawingContext.call === 'function') {
                    visualComponent.drawingContext.call(visualComponent);
                }
            }
        });

        setupWindowResizer(() => {
            eventBroker.refresh_visuals();
        });
    };

    Object.defineProperties(mainObject, {
        systemIdentifier: {
            get: () => systemIdentifier,
            set: (val) => { systemIdentifier = val; },
            enumerable: true
        },
        diagnosticMode: {
            get: () => diagnosticMode,
            set: (val) => { diagnosticMode = val; },
            enumerable: true
        },
        eventBroker: { value: eventBroker, enumerable: true },
        performanceMetrics: { value: performanceMetrics, enumerable: true },
        visualCollection: { value: visualCollection, enumerable: true },
        logOutput: { value: emitLog, enumerable: true },
        queueVisualTask: { value: addVisualTask, enumerable: true },
        configureResizeHandler: { value: setupWindowResizer, enumerable: true },
        startVisualProcessing: { value: initiateProcessing, enumerable: true }
    });

    coreInitialization();

}(systemData));