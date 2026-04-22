"use strict";

// Assume external dependencies are available under new names.
// These are conceptual replacements for cFuncs, Runtime, Module.
// Their internal implementation is not part of this clone,
// but their interface is completely new.
// For the purpose of this clone, we just declare them as if they exist globally.
var externalOTLib;
var externalWasmRuntime;

var dataFlow = {};

/**
 * Initiates an operational transformation coordination layer using a given I/O provider.
 * @param {Object} ioProvider - The communication channel to manage connections.
 * @returns {Object} An object providing control over the coordination layer.
 */
dataFlow.createCoordinator = function(ioProvider) {
    const activeIoChannel = ioProvider;

    // Callback to be registered with the OT engine for broadcasting messages.
    const messageBroadcaster = externalWasmRuntime.registerJSFunction(function(dataPtr) {
        const payloadStr = externalWasmRuntime.stringDecoder(dataPtr);
        activeIoChannel.publish(payloadStr);
    });

    // Initialize the core OT engine and document.
    const otEngineInstance = externalOTLib.initEngine(messageBroadcaster, null);
    const otDocumentRef = externalOTLib.createDocument();
    externalOTLib.connectEngineToDocument(otEngineInstance, otDocumentRef);

    let clientSequenceId = 0;

    activeIoChannel.onClientConnected = function(clientEndpoint) {
        clientEndpoint.onDataReceived = function(incomingPayload) {
            externalOTLib.processInput(otEngineInstance, incomingPayload);
        };

        clientSequenceId++;
        const initialPayload = {
            participantId: clientSequenceId
        };

        const documentHandle = externalOTLib.retrieveDocumentHandle(otEngineInstance);
        if (documentHandle !== 0) {
            const composedOpHandle = externalOTLib.getComposedOperation(documentHandle);
            if (composedOpHandle !== 0) {
                const serializedOpData = externalOTLib.serializeOperation(composedOpHandle);

                if (serializedOpData) {
                    initialPayload.initialOperation = serializedOpData;
                }
            }
        }

        console.debug("INFO: Acknowledging new participant. Packet:", initialPayload);
        clientEndpoint.transmit(JSON.stringify(initialPayload));
    };

    // Return an object with public methods, using a factory pattern
    // instead of a constructor with a prototype chain.
    return {
        adjustContentBoundary: function(maximumSize) {
            const docHandleForSize = externalOTLib.retrieveDocumentHandle(otEngineInstance);
            externalOTLib.setDocumentCapacity(docHandleForSize, maximumSize);
        },
        shutDown: function() {
            activeIoChannel.terminate();
        }
    };
};