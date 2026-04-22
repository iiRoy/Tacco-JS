function _payloadMatcher(candidate, criteria) {
    if (typeof criteria !== 'object' || criteria === null) {
        return candidate === criteria;
    }
    if (typeof candidate !== 'object' || candidate === null) {
        return false;
    }
    for (const key in criteria) {
        if (!Object.prototype.hasOwnProperty.call(criteria, key)) {
            continue;
        }
        if (!Object.prototype.hasOwnProperty.call(candidate, key)) {
            return false;
        }
        if (!_payloadMatcher(candidate[key], criteria[key])) {
            return false;
        }
    }
    return true;
}

class EndpointCommunicator {
    constructor(channelKey, externalServices) {
        this._channelKey = channelKey;
        this._externalServices = externalServices;
    }

    _locateUnit(unitIdentifier) {
        if (this._externalServices.systemHost) {
            return this._externalServices.systemHost.retrieveUnit(unitIdentifier);
        } else {
            this._externalServices.diagnosticLog.recordError("System host unavailable");
            return null;
        }
    }

    _dispatchPayload(targetAddress, transmissionPacket) {
        const targetUnit = this._locateUnit(targetAddress);
        if (!targetUnit || typeof targetUnit.acceptPayload === 'undefined') {
            this._externalServices.diagnosticLog.recordError(`Could not find unit: ${targetAddress}`);
            return false;
        }

        queueMicrotask(() => {
            try {
                targetUnit.acceptPayload(this._channelKey, transmissionPacket);
            } catch (issueDetail) {
                this._externalServices.diagnosticLog.recordError(`Payload dispatch error: ${issueDetail}`);
            }
        });
        return true;
    }

    _registerEventObserver(targetAddress, eventCondition, actionPerformer, singleOccurrence) {
        const targetUnit = this._locateUnit(targetAddress);
        if (!targetUnit || typeof targetUnit.onEvent === 'undefined') {
            this._externalServices.diagnosticLog.recordError(`Could not find unit or unit event system: ${targetAddress}`);
            return;
        }

        const eventProcessor = (originatorIdentifier, receivedPacket) => {
            if (!_payloadMatcher(receivedPacket, eventCondition)) {
                return;
            }

            if (singleOccurrence) {
                targetUnit.removeEventObserver(this._channelKey, eventProcessor);
            }

            queueMicrotask(() => {
                try {
                    actionPerformer(originatorIdentifier, receivedPacket);
                } catch (issueDetail) {
                    this._externalServices.diagnosticLog.recordError(`Event processing error: ${issueDetail}`, (issueDetail && issueDetail.stack) ? issueDetail.stack : '');
                }
            });
        };

        targetUnit.onEvent(this._channelKey, eventProcessor);
    }

    _dispatchAndMonitor(targetAddress, transmissionPacket, eventCondition, actionPerformer, singleOccurrence) {
        this._registerEventObserver(targetAddress, eventCondition, actionPerformer, singleOccurrence);
        this._dispatchPayload(targetAddress, transmissionPacket);
    }

    initiateRequestWithTimeout(targetAddress, transmissionPacket, eventCondition, responseTimeoutDuration) {
        const operationOutcome = new Promise((completeOperation, failOperation) => {
            const timeoutMechanism = setTimeout(() => {
                failOperation("Request response timed out");
            }, responseTimeoutDuration || this._externalServices.configurationStore.requestWaitDuration);

            const responseHandler = (originatorIdentifier, receivedPacket) => {
                clearTimeout(timeoutMechanism);
                completeOperation([originatorIdentifier, receivedPacket]);
            };

            this._dispatchAndMonitor(targetAddress, transmissionPacket, eventCondition, responseHandler, true);
        });
        return operationOutcome;
    }

    establishSubscription(visibilityStatus, streamName, userTag) {
        const finalStreamName = (userTag && userTag !== "") ? `${userTag}/${streamName}` : streamName;
        if (!this._externalServices.messageBroadcaster) {
            this._externalServices.diagnosticLog.recordError("Message broadcaster not operational");
            return false;
        }
        this._externalServices.messageBroadcaster.enroll(finalStreamName, this);
        return false;
    }

    terminateSubscription(visibilityStatus, streamName, userTag) {
        const finalStreamName = (userTag && userTag !== "") ? `${userTag}/${streamName}` : streamName;
        if (!this._externalServices.messageBroadcaster) {
            this._externalServices.diagnosticLog.recordError("Message broadcaster not operational");
            return;
        }
        this._externalServices.messageBroadcaster.cancel(finalStreamName, this);
    }

    broadcastNotification(visibilityStatus, streamName, userTag, eventData, timeToLive, publicationTimestamp, sourceUnitId) {
        if (!this._externalServices.messageBroadcaster) {
            this._externalServices.diagnosticLog.recordError("Message broadcaster not operational");
            return;
        }

        try {
            this._externalServices.messageBroadcaster.transmit(
                visibilityStatus,
                streamName,
                userTag,
                eventData,
                timeToLive,
                publicationTimestamp,
                sourceUnitId
            );
        } catch (issueDetail) {
            this._externalServices.diagnosticLog.recordError(`Notification broadcast error: ${issueDetail}`);
        }

        return true;
    }

    releaseResources() {
        // No specific resources to release in this implementation context.
    }
}

module.exports = (channelKey, systemHost, messageBroadcaster, diagnosticLog, configurationStore) => {
    const externalServices = {
        systemHost: systemHost,
        messageBroadcaster: messageBroadcaster,
        diagnosticLog: diagnosticLog,
        configurationStore: configurationStore
    };
    return new EndpointCommunicator(channelKey, externalServices);
};