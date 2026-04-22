const RelayHub = require('../');
const NetHost = require('http').Server;

const ConfigParams = { protocolEngine: 'websockets', dataProcessor: 'JSON' };

class AssertionEngine {
    constructor(scenarioIdentifier) {
        this.scenario = scenarioIdentifier;
    }
    isTruthy(value, failureMessage) {
        if (!value) {
            throw new Error(`[${this.scenario}] Validation Failure: ${failureMessage || 'Expected value to be truthy'}. Actual: ${value}`);
        }
    }
    deepMatch(actualValue, expectedValue, failureMessage) {
        if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
            throw new Error(`[${this.scenario}] Validation Failure: ${failureMessage || 'Expected values to deeply match'}. Actual: ${JSON.stringify(actualValue)}, Expected: ${JSON.stringify(expectedValue)}`);
        }
    }
    strictMatch(actualValue, expectedValue, failureMessage) {
        if (actualValue !== expectedValue) {
            throw new Error(`[${this.scenario}] Validation Failure: ${failureMessage || 'Expected values to strictly match'}. Actual: ${actualValue}, Expected: ${expectedValue}`);
        }
    }
}

class ConnectionInitiator {
    constructor(networkAnchorInstance, communicationCoreInstance, optionalPort) {
        const endpointDetails = networkAnchorInstance.address();
        const connectionPath = `http://${endpointDetails.address}:${(optionalPort || endpointDetails.port)}`;
        return new communicationCoreInstance.AccessPoint(connectionPath);
    }
}

function SystemNexus(networkAnchorInstance, configParameters) {
    return RelayHub(networkAnchorInstance, configParameters);
}

const allVerificationSteps = [];

function registerVerificationStep(stepName, stepExecutor) {
    allVerificationSteps.push({ name: stepName, executor: stepExecutor });
}

async function executeVerificationProcess() {
    console.log('Initiating Comprehensive System Validation Sequence...');
    let successfulValidations = 0;
    let failedValidations = 0;

    for (const verificationStep of allVerificationSteps) {
        const currentAssertion = new AssertionEngine(verificationStep.name);
        try {
            await new Promise((resolve, reject) => {
                const timeoutHandle = setTimeout(() => {
                    reject(new Error('Verification step exceeded time limit (10 seconds)'));
                }, 10000);

                verificationStep.executor(currentAssertion, () => {
                    clearTimeout(timeoutHandle);
                    resolve();
                }).catch(err => {
                    clearTimeout(timeoutHandle);
                    reject(err);
                });
            });
            console.log(`\u2714 ${verificationStep.name} - Concluded Successfully`);
            successfulValidations++;
        } catch (error) {
            console.error(`\u2716 ${verificationStep.name} - Encountered Failure: ${error.message}`);
            failedValidations++;
        }
    }
    console.log(`\nValidation Summary: ${successfulValidations} Successful, ${failedValidations} Failed.`);
    if (failedValidations > 0) {
        process.exit(1);
    }
}

registerVerificationStep('Ensure core middleware component is integrated', async (assert) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    assert.isTruthy(~communicationCoreInstance.findLayerIndex('primus.io.js'), 'Expected "primus.io.js" middleware layer to be discoverable');
    networkAnchorInstance.close();
});

registerVerificationStep('Validate harmonious operation with event emission system', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            networkAnchorInstance.close(() => testCompletionCallback());
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
});

registerVerificationStep('Permit data transmission from communication core to initiator', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.transmitData('data_event', { greeting: 'hello_world' });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    initiatorPrimarySegment.attachListener('data_event', (payloadContent) => {
        assert.deepMatch(payloadContent, { greeting: 'hello_world' }, 'Received payload should match sent data');
        networkAnchorInstance.close(() => testCompletionCallback());
    });
});

registerVerificationStep('Verify segment method availability upon connection point creation', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            networkAnchorInstance.close(() => testCompletionCallback());
        });
    });

    const endpointDetails = networkAnchorInstance.address();
    const ConnectionPoint = RelayHub.establishConnectionPoint(ConfigParams);
    const initiator = new ConnectionPoint(`http://${endpointDetails.address}:${endpointDetails.port}`);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    assert.isTruthy(initiatorPrimarySegment, 'Client segment should be successfully created');
});

registerVerificationStep('Enable data transmission from initiator to communication core', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('data_event', (payloadContent) => {
                assert.deepMatch(payloadContent, { greeting: 'hello_world' }, 'Received payload should match sent data');
                networkAnchorInstance.close(() => testCompletionCallback());
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    initiatorPrimarySegment.transmitData('data_event', { greeting: 'hello_world' });
});

registerVerificationStep('Support acknowledgment mechanism on the initiator side', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('data_event', (payloadContent, respondFunction) => {
                assert.deepMatch(payloadContent, { greeting: 'hello_world' }, 'Received payload should match sent data');
                respondFunction('acknowledgement_received');
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    initiatorPrimarySegment.transmitData('data_event', { greeting: 'hello_world' }, (responsePayload) => {
        assert.strictMatch(responsePayload, 'acknowledgement_received', 'Acknowledgement response should match expected value');
        networkAnchorInstance.close(() => testCompletionCallback());
    });
});

registerVerificationStep('Support acknowledgment mechanism on the communication core side', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.transmitData('data_event', { greeting: 'hello_world' }, (responsePayload) => {
                assert.strictMatch(responsePayload, 'acknowledgement_received', 'Acknowledgement response should match expected value');
                networkAnchorInstance.close(() => testCompletionCallback());
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    initiatorPrimarySegment.attachListener('data_event', (payloadContent, respondFunction) => {
        assert.deepMatch(payloadContent, { greeting: 'hello_world' }, 'Received payload should match sent data');
        respondFunction('acknowledgement_received');
    });
});

registerVerificationStep('Allow participant links to enter a designated group', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.enterGroup('group_alpha', () => {
                assert.isTruthy(true, 'Group entry callback should be invoked');
                networkAnchorInstance.close(() => testCompletionCallback());
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
});

registerVerificationStep('Allow participant links to exit a designated group', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.enterGroup('group_alpha');
            participantLink.exitGroup('group_alpha', () => {
                assert.isTruthy(true, 'Group exit callback should be invoked');
                networkAnchorInstance.close(() => testCompletionCallback());
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
});

registerVerificationStep('Enable broadcast of messages to a single initiator within a group', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('stream_data', (groupName) => {
                if ('self_target' === groupName) {
                    participantLink.groupBroadcast('room_one').emitPayload('greeting_data');
                } else {
                    participantLink.enterGroup(groupName);
                }
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    initiatorPrimarySegment.attachListener('stream_data', (receivedPayload) => {
        assert.strictMatch(receivedPayload, 'greeting_data', 'Broadcast message should be received');
        networkAnchorInstance.close(() => testCompletionCallback());
    });
    initiatorPrimarySegment.emitPayload('room_one');
    setTimeout(() => {
        const selfInitiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const selfInitiatorPrimarySegment = selfInitiator.Segment('primary_channel');
        selfInitiatorPrimarySegment.emitPayload('self_target');
    }, 0);
});

registerVerificationStep('Enable broadcast of messages to multiple initiators across groups', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');
    let completionCounter = 3;

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('stream_data', (groupName) => {
                if ('self_trigger' === groupName) {
                    participantLink.groupBroadcast('room_one room_two room_three').emitPayload('multi_greeting');
                } else {
                    participantLink.enterGroup(groupName);
                }
            });
        });
    });

    const initiatorA = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorASegment = initiatorA.Segment('primary_channel');
    const initiatorB = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorBSegment = initiatorB.Segment('primary_channel');
    const initiatorC = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorCSegment = initiatorC.Segment('primary_channel');

    initiatorASegment.emitPayload('room_one');
    initiatorBSegment.emitPayload('room_two');
    initiatorCSegment.emitPayload('room_three');

    const handleReceivedData = (receivedPayload) => {
        assert.strictMatch(receivedPayload, 'multi_greeting', 'Broadcast message should be received by all');
        if (!--completionCounter) {
            networkAnchorInstance.close(() => testCompletionCallback());
        }
    };

    initiatorASegment.attachListener('stream_data', handleReceivedData);
    initiatorBSegment.attachListener('stream_data', handleReceivedData);
    initiatorCSegment.attachListener('stream_data', handleReceivedData);

    setTimeout(() => {
        const triggerInitiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const triggerInitiatorSegment = triggerInitiator.Segment('primary_channel');
        triggerInitiatorSegment.emitPayload('self_trigger');
    }, 0);
});

registerVerificationStep('Enable broadcast to a single initiator with event emitter from communication core', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('group_join_request', (groupName) => {
                participantLink.enterGroup(groupName);
            });

            participantLink.attachListener('action_message', (actionType) => {
                if ('initiate_broadcast' === actionType) {
                    participantLink.groupBroadcast('room_alpha').transmitData('action_message', 'hello_group');
                }
            });
        });
    });

    const initiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorPrimarySegment = initiator.Segment('primary_channel');
    initiatorPrimarySegment.attachListener('action_message', (receivedPayload) => {
        assert.strictMatch(receivedPayload, 'hello_group', 'Broadcast message should be received by client');
        networkAnchorInstance.close(() => testCompletionCallback());
    });
    initiatorPrimarySegment.transmitData('group_join_request', 'room_alpha');
    setTimeout(() => {
        const triggerInitiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const triggerInitiatorSegment = triggerInitiator.Segment('primary_channel');
        triggerInitiatorSegment.transmitData('action_message', 'initiate_broadcast');
    }, 0);
});

registerVerificationStep('Allow multi-room sending from communication core', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    let totalExpectedReceives = 2;
    let connectionReadyCount = 0;

    networkAnchorInstance.listen(() => {
        const c1 = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const c2 = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const c3 = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const c4 = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);

        communicationCoreInstance.attachListener('connection', (participantLink) => {
            participantLink.attachListener('group_join_request', (groupName) => {
                participantLink.enterGroup(groupName, () => {
                    connectionReadyCount++;
                    if (connectionReadyCount === 4) {
                        communicationCoreInstance.groupBroadcast('room_one room_two room_three').transmitData('news_update');
                    }
                });
            });
        });

        const finalizeTest = (errorData) => {
            networkAnchorInstance.close(() => testCompletionCallback(errorData));
        };

        c1.attachListener('news_update', (data) => {
            totalExpectedReceives--;
            if (totalExpectedReceives === 0) finalizeTest();
        });

        c2.attachListener('news_update', (data) => {
            totalExpectedReceives--;
            if (totalExpectedReceives === 0) finalizeTest();
        });

        c3.attachListener('news_update', (data) => {
            totalExpectedReceives--;
            if (totalExpectedReceives === 0) finalizeTest();
        });

        c4.attachListener('news_update', (data) => {
            finalizeTest(new Error('Unexpected data received by room_four client'));
        });

        c1.transmitData('group_join_request', 'room_one');
        c2.transmitData('group_join_request', 'room_two');
        c3.transmitData('group_join_request', 'room_three');
        c4.transmitData('group_join_request', 'room_four');
    });
});

registerVerificationStep('Broadcast to multiple initiators with event emitter from a specific segment', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');
    let completionCounter = 3;

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('group_join_request', (groupName) => {
                participantLink.enterGroup(groupName);
            });

            participantLink.attachListener('action_message', (actionType) => {
                if ('initiate_broadcast' === actionType) {
                    primarySegment.groupBroadcast('room_alpha room_beta room_gamma').transmitData('action_message', 'hello_everyone');
                }
            });
        });
    });

    const initiatorA = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorASegment = initiatorA.Segment('primary_channel');
    const initiatorB = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorBSegment = initiatorB.Segment('primary_channel');
    const initiatorC = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorCSegment = initiatorC.Segment('primary_channel');

    initiatorASegment.transmitData('group_join_request', 'room_alpha');
    initiatorBSegment.transmitData('group_join_request', 'room_beta');
    initiatorCSegment.transmitData('group_join_request', 'room_gamma');

    const handleReceivedData = (receivedPayload) => {
        assert.strictMatch(receivedPayload, 'hello_everyone', 'Broadcast message should be received by all segments');
        if (!--completionCounter) {
            networkAnchorInstance.close(() => testCompletionCallback());
        }
    };

    initiatorASegment.attachListener('action_message', handleReceivedData);
    initiatorBSegment.attachListener('action_message', handleReceivedData);
    initiatorCSegment.attachListener('action_message', handleReceivedData);

    setTimeout(() => {
        const triggerInitiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const triggerInitiatorSegment = triggerInitiator.Segment('primary_channel');
        triggerInitiatorSegment.transmitData('action_message', 'initiate_broadcast');
    }, 0);
});


registerVerificationStep('Broadcast to multiple initiators with event emitter from participant link', async (assert, testCompletionCallback) => {
    const networkAnchorInstance = NetHost();
    const communicationCoreInstance = SystemNexus(networkAnchorInstance, ConfigParams);
    const primarySegment = communicationCoreInstance.Segment('primary_channel');
    let completionCounter = 3;

    networkAnchorInstance.listen(() => {
        primarySegment.attachListener('connection', (participantLink) => {
            participantLink.attachListener('group_join_request', (groupName) => {
                participantLink.enterGroup(groupName);
            });

            participantLink.attachListener('action_message', (actionType) => {
                if ('initiate_broadcast' === actionType) {
                    participantLink.groupBroadcast('room_alpha room_beta room_gamma').transmitData('action_message', 'hello_everyone');
                }
            });
        });
    });

    const initiatorA = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorASegment = initiatorA.Segment('primary_channel');
    const initiatorB = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorBSegment = initiatorB.Segment('primary_channel');
    const initiatorC = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
    const initiatorCSegment = initiatorC.Segment('primary_channel');

    initiatorASegment.transmitData('group_join_request', 'room_alpha');
    initiatorBSegment.transmitData('group_join_request', 'room_beta');
    initiatorCSegment.transmitData('group_join_request', 'room_gamma');

    const handleReceivedData = (receivedPayload) => {
        assert.strictMatch(receivedPayload, 'hello_everyone', 'Broadcast message should be received by all segments');
        if (!--completionCounter) {
            networkAnchorInstance.close(() => testCompletionCallback());
        }
    };

    initiatorASegment.attachListener('action_message', handleReceivedData);
    initiatorBSegment.attachListener('action_message', handleReceivedData);
    initiatorCSegment.attachListener('action_message', handleReceivedData);

    setTimeout(() => {
        const triggerInitiator = new ConnectionInitiator(networkAnchorInstance, communicationCoreInstance);
        const triggerInitiatorSegment = triggerInitiator.Segment('primary_channel');
        triggerInitiatorSegment.transmitData('action_message', 'initiate_broadcast');
    }, 0);
});

executeVerificationProcess();