class MockXHRInstance {
    constructor() {
        this.open = jest.fn();
        this.send = jest.fn();
        this.setRequestHeader = jest.fn();
        this.onload = null;
        this.onerror = null;
        this.onreadystatechange = null;
        this.readyState = 0;
        this.status = 0;
        this.responseText = '';
    }

    _simulateResponse(statusCode, responseContent) {
        this.status = statusCode;
        this.responseText = responseContent;
        this.readyState = 4; // DONE
        if (this.onload) {
            this.onload();
        }
        if (this.onreadystatechange) {
            this.onreadystatechange();
        }
    }
}

const xhrInteractionRegistry = {
    expectedTransactions: [],
    activeInstances: [],
    reset() {
        this.expectedTransactions = [];
        this.activeInstances = [];
    }
};

const MockGlobalXMLHttpRequest = jest.fn(() => {
    const instance = new MockXHRInstance();
    xhrInteractionRegistry.activeInstances.push(instance);
    return instance;
});

expect.extend({
    toBeGreaterOrEqual(receivedValue, minimumExpected) {
        const outcome = receivedValue >= minimumExpected;
        if (outcome) {
            return {
                message: () => `expected ${receivedValue} not to be greater than or equal to ${minimumExpected}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${receivedValue} to be greater than or equal to ${minimumExpected}`,
                pass: false,
            };
        }
    },
});

const createAngularEnvironmentSimulation = () => {
    const mockBrowserNetworkManager = {
        expectPostRequest: (targetUrl, requestPayload) => {
            const transactionExpectation = {
                url: targetUrl,
                data: requestPayload,
                setResponse: jest.fn((dataToRespond) => {})
            };
            xhrInteractionRegistry.expectedTransactions.push(transactionExpectation);

            return {
                replyWith: transactionExpectation.setResponse
            };
        },
        processPendingRequests: () => {
            xhrInteractionRegistry.activeInstances.forEach(instance => {
                const actualUrl = instance.open.mock.calls[0] ? instance.open.mock.calls[0][1] : null;
                const actualBody = instance.send.mock.calls[0] ? JSON.parse(instance.send.mock.calls[0][0]) : null;

                const matchedTransaction = xhrInteractionRegistry.expectedTransactions.find(exp =>
                    actualUrl === exp.url &&
                    JSON.stringify(actualBody) === JSON.stringify(exp.data)
                );

                if (matchedTransaction) {
                    const responseContent = matchedTransaction.setResponse.mock.calls[0] ? matchedTransaction.setResponse.mock.calls[0][0] : null;
                    instance._simulateResponse(200, JSON.stringify(responseContent || {}));
                }
            });
            xhrInteractionRegistry.reset();
        }
    };

    const mockApplicationScope = {
        retrieveService: (serviceIdentifier) => {
            if (serviceIdentifier === '$browser') {
                return { xhr: mockBrowserNetworkManager };
            }
            return null;
        },
        instantiateComponent: (ComponentPrototype) => {
            return new ComponentPrototype();
        }
    };

    const mockFrameworkAPI = {
        generateApplicationScope: () => mockApplicationScope
    };

    return {
        framework: mockFrameworkAPI,
        networkAgent: mockBrowserNetworkManager
    };
};

class MidiEventProcessor {
    constructor() {
        this.operationDelayMeasurement = -1;
        this.NOTE_ACTIVATION_SIGNAL = 144;
    }

    triggerMidiCommand(commandCode, toneValue) {
        const eventDataPayload = { channel: 0, command: commandCode, note: toneValue, velocity: 60 };
        const requestInitiator = new global.XMLHttpRequest();
        requestInitiator.open('POST', '/data/midi/send');
        requestInitiator.setRequestHeader('Content-Type', 'application/json');

        requestInitiator.onload = () => {
            this.operationDelayMeasurement = Date.now();
        };
        requestInitiator.onerror = () => {
            this.operationDelayMeasurement = -999;
        };
        requestInitiator.send(JSON.stringify(eventDataPayload));
    }
}

describe('MidiEventProcessorBehavior', () => {
    let contextContainer;
    let componentScope;
    let midiProcessorInstance;
    let originalXMLHttpRequestReference;

    beforeAll(() => {
        originalXMLHttpRequestReference = global.XMLHttpRequest;
        global.XMLHttpRequest = MockGlobalXMLHttpRequest;
    });

    afterAll(() => {
        global.XMLHttpRequest = originalXMLHttpRequestReference;
    });

    beforeEach(() => {
        xhrInteractionRegistry.reset();
        MockGlobalXMLHttpRequest.mockClear();
        contextContainer = createAngularEnvironmentSimulation();
        componentScope = contextContainer.framework.generateApplicationScope();
        midiProcessorInstance = componentScope.instantiateComponent(MidiEventProcessor);
    });

    test('should verify delay is recorded after command dispatch', () => {
        const networkController = componentScope.retrieveService('$browser').xhr;
        const outboundData = { channel: 0, command: 144, note: 77, velocity: 60 };

        networkController.expectPostRequest('/data/midi/send', outboundData).replyWith(outboundData);

        midiProcessorInstance.operationDelayMeasurement = -1;
        midiProcessorInstance.triggerMidiCommand(midiProcessorInstance.NOTE_ACTIVATION_SIGNAL, 77);

        networkController.processPendingRequests();

        expect(midiProcessorInstance.operationDelayMeasurement).toBeGreaterOrEqual(0);
    });
});