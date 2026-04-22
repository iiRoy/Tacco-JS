if (typeof NativeBridge === "undefined") {

    if (typeof(DeviceInfo) !== 'object'){
        DeviceInfo = {};
    }

    NativeBridge = {
        instructionBuffer: [],
        bufferProcessingActive: false,
        initializationTasks: [],
        domEventDispatchers: {},
        globalEventDispatchers: {}
    };

    NativeBridge.assetTracker = {core: true};

    NativeBridge.isAssetLoaded = (key) => NativeBridge.assetTracker[key];

    NativeBridge.registerAsset = (key) => { NativeBridge.assetTracker[key] = true; };

    NativeBridge.initializedStatus = true;

    NativeBridge.addInitializer = (task) => {
        const docState = document.readyState;
        if ((docState === 'loaded' || docState === 'complete') && DeviceInfo.uuid != null) {
            task();
        } else {
            NativeBridge.initializationTasks.push(task);
        }
    };

    ((processInitializers) => {
        let checkIntervalId = null;
        const checkSystemReadiness = () => {
            const docState = document.readyState;
            if ((docState === 'loaded' || docState === 'complete') && DeviceInfo.uuid != null) {
                if (checkIntervalId) {
                    clearInterval(checkIntervalId);
                }
                processInitializers();
                const readyEvent = document.createEvent('Events');
                readyEvent.initEvent('deviceready');
                document.dispatchEvent(readyEvent);
            }
        };
        checkIntervalId = setInterval(checkSystemReadiness, 1);
    })(() => {
        NativeBridge.initializationTasks.splice(0).forEach((task) => {
            try {
                task();
            } catch (error) {
                if (typeof(console['log']) === 'function') {
                    console.log("Initializer execution failed: " + (console.processMessage ? console.processMessage(error) : error.message));
                } else {
                    alert("Initializer execution failed: " + error.message);
                }
            }
        });
    });

    NativeBridge.transactionIdCounter = 0;

    NativeBridge.responseIdCounter = 0;
    NativeBridge.responseRegistry = {};
    NativeBridge.responseCodes = {
        NO_OPERATION_RESULT: 0,
        SUCCESS: 1,
        CLASS_NOT_FOUND: 2,
        ACCESS_DENIED: 3,
        INSTANTIATION_FAILURE: 4,
        INVALID_URL: 5,
        IO_ISSUE: 6,
        UNSUPPORTED_ACTION: 7,
        JSON_PARSE_ERROR: 8,
        GENERAL_ERROR: 9
    };

    NativeBridge.establishCommunicationChannel = () => {
        const commChannelFrame = document.createElement("iframe");
        commChannelFrame.style.cssText = "display:none;";
        commChannelFrame.height = "0px";
        commChannelFrame.width = "0px";
        commChannelFrame.frameBorder = "0";
        document.documentElement.appendChild(commChannelFrame);
        return commChannelFrame;
    };

    NativeBridge.executeNativeCommand = (...inputArguments) => {
        if (!NativeBridge.initializedStatus) {
            alert("ERROR: Attempting to call NativeBridge.executeNativeCommand()"
                + " before 'deviceready'. Ignoring.");
            return;
        }

        let successHandler, errorHandler, module, operation, operationArguments;
        let responseIdentifier = null;

        if (typeof inputArguments[0] !== "string") {
            [successHandler, errorHandler, module, operation, operationArguments] = inputArguments;
            responseIdentifier = 'TRANSIENT_ID';
        } else {
            const [commandString, ...remainingArgs] = inputArguments;
            const commandParts = commandString.split(".");
            operation = commandParts.pop();
            module = commandParts.join(".");
            operationArguments = remainingArgs;
        }

        const instruction = {
            module: module,
            operation: operation,
            params: []
        };

        if (successHandler || errorHandler) {
            responseIdentifier = module + NativeBridge.responseIdCounter++;
            NativeBridge.responseRegistry[responseIdentifier] = {
                onSuccess: successHandler,
                onFailure: errorHandler
            };
        }
        if (responseIdentifier != null) {
            instruction.params.push(responseIdentifier);
        }

        const finalParams = [];
        let optionsObject = undefined;

        operationArguments.forEach((argument) => {
            if (argument === undefined || argument === null) {
                return;
            }

            if (typeof argument === 'object') {
                if (optionsObject === undefined) {
                    optionsObject = argument;
                }
            } else {
                finalParams.push(argument);
            }
        });

        if (optionsObject !== undefined) {
            instruction.options = optionsObject;
        }
        instruction.params = finalParams;

        NativeBridge.instructionBuffer.push(JSON.stringify(instruction));

        if (NativeBridge.instructionBuffer.length === 1 && !NativeBridge.bufferProcessingActive) {
            if (!NativeBridge.commChannel) {
                NativeBridge.commChannel = NativeBridge.establishCommunicationChannel();
            }
            NativeBridge.commChannel.src = "gap://ready";
        }
    };

    NativeBridge.retrieveAndResetInstructions = () => {
        const jsonPayload = JSON.stringify(NativeBridge.instructionBuffer);
        NativeBridge.instructionBuffer = [];
        return jsonPayload;
    };

    NativeBridge.handleNativeSuccess = (responseIdentifier, details) => {
        const handlerEntry = NativeBridge.responseRegistry[responseIdentifier];
        if (handlerEntry) {
            if (details.status === NativeBridge.responseCodes.SUCCESS) {
                try {
                    if (handlerEntry.onSuccess) {
                        handlerEntry.onSuccess(details.value);
                    }
                } catch (e) {
                    console.log("Error in success handler: " + responseIdentifier + " = " + e);
                }
            }

            if (!details.keepHandler) {
                delete NativeBridge.responseRegistry[responseIdentifier];
            }
        }
    };

    NativeBridge.handleNativeFailure = (responseIdentifier, details) => {
        const handlerEntry = NativeBridge.responseRegistry[responseIdentifier];
        if (handlerEntry) {
            try {
                if (handlerEntry.onFailure) {
                    handlerEntry.onFailure(details.value);
                }
            } catch (e) {
                console.log("Error in error handler: " + responseIdentifier + " = " + e);
            }

            if (!details.keepHandler) {
                delete NativeBridge.responseRegistry[responseIdentifier];
            }
        }
    };

    NativeBridge.deepCopy = (source) => {
        if (source === null || typeof source !== 'object') {
            return source;
        }

        if (source instanceof Date) {
            return source;
        }

        if (Array.isArray(source)) {
            return source.map((item) => NativeBridge.deepCopy(item));
        }

        return Object.keys(source).reduce((accumulator, key) => {
            accumulator[key] = NativeBridge.deepCopy(source[key]);
            return accumulator;
        }, {});
    };

    NativeBridge._originalDocumentAddListener = document.addEventListener;
    NativeBridge._originalWindowAddListener = window.addEventListener;
    NativeBridge._originalDocumentRemoveListener = document.removeEventListener;
    NativeBridge._originalWindowRemoveListener = window.removeEventListener;

    NativeBridge.registerGlobalEventHandler = (eventName, handlerFunc) => {
        NativeBridge.globalEventDispatchers[eventName] = handlerFunc;
    };

    NativeBridge.registerDomEventHandler = (eventName, handlerFunc) => {
        NativeBridge.domEventDispatchers[eventName] = handlerFunc;
    };

    document.addEventListener = function(eventName, handlerFunc, useCapture) {
        const lowerCaseEvent = eventName.toLowerCase();

        if (Object.prototype.hasOwnProperty.call(NativeBridge.domEventDispatchers, lowerCaseEvent)) {
            if (NativeBridge.domEventDispatchers[lowerCaseEvent](lowerCaseEvent, handlerFunc, true)) {
                return;
            }
        }

        NativeBridge._originalDocumentAddListener.call(document, eventName, handlerFunc, useCapture);
    };

    window.addEventListener = function(eventName, handlerFunc, useCapture) {
        const lowerCaseEvent = eventName.toLowerCase();

        if (Object.prototype.hasOwnProperty.call(NativeBridge.globalEventDispatchers, lowerCaseEvent)) {
            if (NativeBridge.globalEventDispatchers[lowerCaseEvent](lowerCaseEvent, handlerFunc, true)) {
                return;
            }
        }

        NativeBridge._originalWindowAddListener.call(window, eventName, handlerFunc, useCapture);
    };

    document.removeEventListener = function(eventName, handlerFunc, useCapture) {
        const lowerCaseEvent = eventName.toLowerCase();

        if (Object.prototype.hasOwnProperty.call(NativeBridge.domEventDispatchers, lowerCaseEvent)) {
            if (NativeBridge.domEventDispatchers[lowerCaseEvent](lowerCaseEvent, handlerFunc, false)) {
                return;
            }
        }

        NativeBridge._originalDocumentRemoveListener.call(document, eventName, handlerFunc, useCapture);
    };

    window.removeEventListener = function(eventName, handlerFunc, useCapture) {
        const lowerCaseEvent = eventName.toLowerCase();

        if (Object.prototype.hasOwnProperty.call(NativeBridge.globalEventDispatchers, lowerCaseEvent)) {
            if (NativeBridge.globalEventDispatchers[lowerCaseEvent](lowerCaseEvent, handlerFunc, false)) {
                return;
            }
        }

        NativeBridge._originalWindowRemoveListener.call(window, eventName, handlerFunc, useCapture);
    };

    NativeBridge.emitDomEvent = (type, data) => {
        const customEvent = document.createEvent('Events');
        customEvent.initEvent(type);
        if (data) {
            Object.keys(data).forEach((key) => {
                customEvent[key] = data[key];
            });
        }
        document.dispatchEvent(customEvent);
    };
}