(function () {
    'use strict';

    const createNotifier = () => {
        const registeredCallbacks = new Map(); // Maps event names to Sets of callback functions

        const attachListener = (signalKey, handlerProcedure) => {
            if (!registeredCallbacks.has(signalKey)) {
                registeredCallbacks.set(signalKey, new Set());
            }
            registeredCallbacks.get(signalKey).add(handlerProcedure);
        };

        const broadcastEvent = (signalKey, ...eventDetails) => {
            if (registeredCallbacks.has(signalKey)) {
                registeredCallbacks.get(signalKey).forEach(handlerProcedure => {
                    try {
                        handlerProcedure(...eventDetails);
                    } catch (issue) {
                        console.error(`Error processing notification for ${signalKey}:`, issue);
                    }
                });
            }
        };

        return {
            subscribe: attachListener,
            publish: broadcastEvent
        };
    };

    const applicationNotifier = createNotifier();
    let currentCommunicationSource = null;
    const recordedTransmissions = [];

    const messagingFacade = (() => {
        const recordAndStore = (itemData) => {
            if (itemData !== undefined) {
                recordedTransmissions.push(itemData);
            }
            return recordedTransmissions;
        };

        const retrieveMostRecent = () => {
            const totalItems = recordedTransmissions.length;
            return totalItems > 0 ? recordedTransmissions[totalItems - 1] : undefined;
        };

        const initiateTransmission = (dataPacket, targetZone = "*") => {
            applicationNotifier.publish('outboundSignal', dataPacket, targetZone);
        };

        return {
            logReceived: recordAndStore,
            getLatest: retrieveMostRecent,
            dispatch: initiateTransmission,
        };
    })();

    const configureCommunication = (globalContext) => {
        applicationNotifier.subscribe('outboundSignal', (dataPacket, targetZone) => {
            const recipient = currentCommunicationSource || globalContext.parent;
            recipient.postMessage(dataPacket, targetZone);
        });

        globalContext.addEventListener('message', (incomingTransmission) => {
            const actualTransmission = incomingTransmission.originalEvent || incomingTransmission;
            if (actualTransmission && actualTransmission.data !== undefined) {
                let processedContent = null;
                currentCommunicationSource = actualTransmission.source;

                try {
                    processedContent = JSON.parse(actualTransmission.data);
                } catch (dataProcessError) {
                    console.error('Failed to parse incoming data:', dataProcessError);
                    processedContent = actualTransmission.data;
                }

                applicationNotifier.publish('inboundSignal', processedContent);
                messagingFacade.logReceived(processedContent);
            }
        });
    };

    configureCommunication(this);

    this.CrossFrameMessaging = messagingFacade;

}).call(this);