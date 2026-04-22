let sourceClassName = "StreamSource";
const sourceImportKey = (window._streamPolyfillPrefix || '') + sourceClassName;
const isStreamSourceAvailable = (typeof window[sourceClassName] !== 'undefined');

describe("Validating StreamSource polyfill with a SimulatedHTTPClient", () => {

    let oldHttpClient;

    beforeEach(() => {

        const SimulatedHTTPClient = function(streamInstance) {
            this.receivedContent = '';
            this.streamRef = streamInstance;
            if (!this.streamRef || typeof this.streamRef.processIncomingData !== 'function') {
                console.warn("SimulatedHTTPClient initialized without a valid stream handler.");
            }
        };

        SimulatedHTTPClient.prototype = {
            useCrossDomainRequest: false,
            _internalRequestHandle: null,
            _requestFailed: false,

            checkReadyStatus: function() {
                return true;
            },

            isTransmissionFinished: function() {
                return false;
            },

            hasTransmissionError: function() {
                return (this._requestFailed);
            },

            retrieveBufferContent: function() {
                return this.receivedContent;
            },

            cancelTransmission: function() {
                this.receivedContent = '';
            },

            pushDataChunk: function(textChunk) {
                this.receivedContent += textChunk;
                this.streamRef.processIncomingData();
            },
            resetClientState: function() {
                this.receivedContent = '';
                this._requestFailed = false;
            }
        };

        this.streamSource = window[sourceImportKey];
        oldHttpClient = this.streamSource.prototype.HTTPClient;
        this.streamSource.prototype.HTTPClient = SimulatedHTTPClient;
    });

    afterEach(() => {
        this.streamSource.prototype.HTTPClient = oldHttpClient;
    });

    describe("Verifying the SimulatedHTTPClient for StreamSource testing", () => {
        let streamInstance;

        beforeEach((completionCallback) => {
            streamInstance = new this.streamSource('http://test-mock-client.com');
            process.nextTick(completionCallback);
        });

        afterEach(() => {
            streamInstance.terminateConnection();
        });

        it("confirms the simulated HTTP client is utilized over the browser's native one", () => {
            const clientReference = streamInstance._httpClient;
            expect(clientReference.pushDataChunk).toBeDefined();
            expect(clientReference.isTransmissionFinished()).toBeFalse();
        });
    });

    describe("Configuration of the StreamSource polyfill for coexistence with native implementations", () => {

        it("ensures default options are applied when no custom configuration object is provided", () => {
            const currentStream = new this.streamSource('http://config-test-default.com');
            const defaultSettings = currentStream.defaultConfiguration;

            const getStreamSettings = (streamObj) => ({
                enableLogging: streamObj.enableLogging,
                logPrefix: streamObj.logPrefix,
                reconnectionInterval: streamObj.reconnectionInterval,
                maxBufferSize: streamObj.maxBufferSize,
                idleTimeout: streamObj.idleTimeout,
                queryArguments: streamObj.queryArguments,
                requestHeaders: streamObj.requestHeaders
            });

            const currentSettings = getStreamSettings(currentStream);
            expect(currentSettings).toEqual(getStreamSettings(defaultSettings));

            currentStream.terminateConnection();
        });

        it("confirms that unknown properties in the configuration object are disregarded by the constructor", () => {
            const extraneousOptions = {
                extraProperty: 1234,
                customTag: 'test-value'
            };
            const testStream = new this.streamSource('http://config-test-extra.com', extraneousOptions);

            expect(testStream.extraProperty).toBeUndefined();
            expect(testStream.customTag).toBeUndefined();

            testStream.terminateConnection();
        });

        it("validates that provided configuration options override the default settings", () => {
            const customConfiguration = {
                reconnectionInterval: 2000,
                maxBufferSize: 512 * 1024
            };

            const configuredStream = new this.streamSource('http://config-test-override.com', customConfiguration);
            const baseDefaults = configuredStream.defaultConfiguration;

            const expectedConfig = {
                ...baseDefaults,
                reconnectionInterval: customConfiguration.reconnectionInterval,
                maxBufferSize: customConfiguration.maxBufferSize
            };

            const actualConfig = {
                enableLogging: configuredStream.enableLogging,
                logPrefix: configuredStream.logPrefix,
                reconnectionInterval: configuredStream.reconnectionInterval,
                maxBufferSize: configuredStream.maxBufferSize,
                idleTimeout: configuredStream.idleTimeout,
                queryArguments: configuredStream.queryArguments,
                requestHeaders: configuredStream.requestHeaders
            };

            expect(actualConfig).toEqual({
                enableLogging: expectedConfig.enableLogging,
                logPrefix: expectedConfig.logPrefix,
                reconnectionInterval: expectedConfig.reconnectionInterval,
                maxBufferSize: expectedConfig.maxBufferSize,
                idleTimeout: expectedConfig.idleTimeout,
                queryArguments: expectedConfig.queryArguments,
                requestHeaders: expectedConfig.requestHeaders
            });

            configuredStream.terminateConnection();
        });
    });

    describe("URL Parameter Handling Functionality", () => {

        it("appends new query parameters to a base URL that already includes existing arguments", () => {
            const additionalParams = { a: 1, b: 2 };
            const initialUrl = 'http://example.com/path?existing=value';
            const streamProcessor = new this.streamSource(initialUrl);
            const urlFormatter = streamProcessor.buildUrlWithParams;

            const finalUrl = urlFormatter(initialUrl, additionalParams);
            expect(finalUrl).toBe('http://example.com/path?existing=value&a=1&b=2');
        });

        it("returns the base URL unchanged if null or undefined parameters are provided", () => {
            const baseUrl = 'http://example.com/no-params';
            const streamProcessor = new this.streamSource('http://any-url.com');
            const urlFormatter = streamProcessor.buildUrlWithParams;

            expect(urlFormatter(baseUrl, null)).toBe(baseUrl);
            expect(urlFormatter(baseUrl, undefined)).toBe(baseUrl);
        });

        it("ignores parameters inherited from a prototype chain, returning the base URL if direct properties are absent", () => {
            const ParameterPrototype = function () {};
            ParameterPrototype.prototype.inheritedParamA = 10;
            ParameterPrototype.prototype.inheritedParamB = 'test';

            const baseUrl = 'http://example.com/inherited-params';
            const streamProcessor = new this.streamSource(baseUrl);
            const urlFormatter = streamProcessor.buildUrlWithParams;

            const paramsInstance = new ParameterPrototype();
            Object.defineProperty(paramsInstance, 'ownProperty', { value: null, enumerable: false });
            expect(urlFormatter(baseUrl, paramsInstance)).toBe(baseUrl);
        });

        it("successfully appends defined arguments from a parameters object to the URL", () => {
            const specificParams = {
                param1: 'value1',
                param2: 'value2'
            };
            const baseUrl = 'http://example.com/new-params';
            const streamProcessor = new this.streamSource(baseUrl);
            const urlFormatter = streamProcessor.buildUrlWithParams;

            const resultUrl = urlFormatter(baseUrl, specificParams);
            expect(resultUrl).toBe('http://example.com/new-params?param1=value1&param2=value2');
        });
    });

    describe("Stream Data Parsing: Locating Message Boundaries", () => {

        it("identifies the end of a message correctly with double newline (LF LF)", () => {
            const tempStream = new this.streamSource('http://temp-stream.com');
            const findMessageEnd = tempStream.findLastMessageBoundary;

            expect(findMessageEnd("ABC\n\nDEF")).toEqual([4, 6]);
        });

        it("identifies the end of a message correctly with double carriage return (CR CR)", () => {
            const tempStream = new this.streamSource('http://temp-stream.com');
            const findMessageEnd = tempStream.findLastMessageBoundary;

            expect(findMessageEnd("X\r\rYZ")).toEqual([2, 4]);
        });

        it("identifies the end of a message correctly with double CRLF sequence", () => {
            const tempStream = new this.streamSource('http://temp-stream.com');
            const findMessageEnd = tempStream.findLastMessageBoundary;

            expect(findMessageEnd("123\r\n\r\n45")).toEqual([5, 9]);
        });
    });

    describe("String Utility: Whitespace Trimming", () => {

        it("effectively removes leading and trailing whitespace characters from a string", () => {
            const tempStream = new this.streamSource('http://temp-stream.com');
            const trimString = tempStream.stripBoundaryWhitespace;

            const inputString = "   \t  content with spaces \n ";
            const expectedOutput = 'content with spaces';
            expect(trimString(inputString)).toBe(expectedOutput);
        });
    });

    describe("String Utility: Line Feed Normalization", () => {

        it("converts all carriage return (CR) and CRLF sequences to a single line feed (LF)", () => {
            const tempStream = new this.streamSource('http://temp-stream.com');
            const normalizeBreaks = tempStream.standardizeLineEndings;

            const mixedLineEndings = "Line1\nCR\rLine2\r\nCRLF\n\rDoubleCR\r\rDoubleCRLF\r\n\r\nEnd.";
            const expectedNormalized = "Line1\nCR\nLine2\nCRLF\n\nDoubleCR\n\nDoubleCRLF\n\nEnd.";
            const actualNormalized = normalizeBreaks(mixedLineEndings);

            expect(actualNormalized).toBe(expectedNormalized);

            tempStream.terminateConnection();
        });
    });

    describe("End-to-End Simulation of StreamSource using SimulatedHTTPClient", () => {

        let streamHandler, messagesReceived, openEventsLogged, errorEventsLogged;

        beforeEach((completionCallback) => {
            streamHandler = new this.streamSource('http://mock-stream-data.com');
            messagesReceived = [];
            openEventsLogged = [];
            errorEventsLogged = [];

            if (!streamHandler.eventListeners) {
                streamHandler.eventListeners = {};
            }

            streamHandler.addEventHandler('data', (eventData) => {
                messagesReceived.push(eventData.data);
            });
            streamHandler.addEventHandler('connectionOpen', (eventData) => {
                openEventsLogged.push(eventData.type);
            });
            streamHandler.addEventHandler('connectionError', (eventData) => {
                errorEventsLogged.push(eventData.type);
            });

            process.nextTick(completionCallback);
        });

        afterEach((completionCallback) => {
            streamHandler.terminateConnection();
            completionCallback();
        });

        it("verifies that the custom simulated HTTP client is actively engaged", () => {
            expect(streamHandler._httpClient.pushDataChunk).toBeDefined();
        });

        it("confirms that the initial Byte Order Mark (BOM) is correctly ignored", () => {
            const dataWithBOM = '\ufeffdata: "First data entry."\r\r';
            streamHandler._httpClient.pushDataChunk(dataWithBOM);
            const expectedData = ['"First data entry."'];
            expect(messagesReceived).toEqual(expectedData);
        });

        it("ensures multi-line messages are accurately reassembled into a single event payload", () => {
            const multiLineData = 'data: "Line one of message."\ndata: "Line two continues."\r\r';
            streamHandler._httpClient.pushDataChunk(multiLineData);
            const expectedPayloads = ['"Line one of message."\n"Line two continues."'];
            expect(messagesReceived).toEqual(expectedPayloads);
        });

        it("validates that fragmented data transmissions are correctly buffered and processed", () => {
            const firstPart = 'data: "First complete message."\n\ndata: "Start of fragmented data.';
            const secondPart = ' End of fragmented data."\n\n';

            streamHandler._httpClient.pushDataChunk(firstPart);
            streamHandler._httpClient.pushDataChunk(secondPart);

            const expectedPayloads = [
                '"First complete message."',
                '"Start of fragmented data. End of fragmented data."'
            ];
            expect(messagesReceived).toEqual(expectedPayloads);
        });

        it("verifies that 'id' lines are correctly parsed and stored as the last event identifier", () => {
            const newEventId = '2023-01-STREAM-XYZ';
            const dataWithId = `data: "Some initial content."\n\nid: ${newEventId}\ndata: "Message with updated ID."\n\n`;

            streamHandler._httpClient.pushDataChunk(dataWithId);

            expect(streamHandler.lastEventIdentifier).toEqual(newEventId);
        });

        it("confirms that the 'maxBufferSize' option influences event dispatching", () => {
            streamHandler.maxBufferSize = 50;
            const dataChunks = [
                'data: "Small chunk 1."\n\n',
                'data: "Small chunk 2."\n\n',
                'data: "Another small chunk, pushing over limit."\n\n'
            ];

            dataChunks.forEach(chunk => streamHandler._httpClient.pushDataChunk(chunk));

            const expectedOpenEvents = ["connectionOpen", "connectionOpen"];
            expect(openEventsLogged).toEqual(expectedOpenEvents);
        });

        describe("Clock Control: Simulating Time for Timeout-Based Event Dispatch", () => {

            let originalIdleTimeout = 0;

            beforeEach(() => {
                originalIdleTimeout = streamHandler.idleTimeout;
                jasmine.clock().install();
            });

            afterEach((completionCallback) => {
                streamHandler.idleTimeout = originalIdleTimeout;
                jasmine.clock().uninstall();
                completionCallback();
            });

            it("verifies that the 'idleTimeout' option correctly triggers connection error events", () => {
                streamHandler.idleTimeout = 1500;

                streamHandler._httpClient.pushDataChunk('data: "Initial data block."\n\n');

                jasmine.clock().tick(1400);
                expect(errorEventsLogged).toEqual([]);

                jasmine.clock().tick(101);
                const expectedErrorEvents = ["connectionError"];
                expect(errorEventsLogged).toEqual(expectedErrorEvents);

                streamHandler._httpClient.pushDataChunk('data: "Data after timeout, forcing re-connect."\n\n');
                const expectedOpenEvents = ["connectionOpen", "connectionOpen"];
                expect(openEventsLogged).toEqual(expectedOpenEvents);
            });
        });
    });
});

describe("Assessing Event Listener Attachment Timing for StreamSource", () => {

    let streamInstanceUnderTest, originalHttpClientRef;
    let receivedStreamMessages = [];
    let loggedOpenConnections = [];
    let loggedConnectionErrors = [];

    beforeEach((completionCallback) => {

        class InstantDataClient {
            constructor(streamToNotify) {
                this.accumulatedResponse = '';
                this.linkedStream = streamToNotify;
                this.linkedStream._httpClient = this;
                this.initialPayload = InstantDataClient.defaultInitialData;

                this.sendDataChunk(this.initialPayload);
            }

            static defaultInitialData = 'data: "Immediate data transmission!"\n\n';

            useCrossOriginRequests = false;
            _activeRequestObject = null;
            _hasFailed = false;

            isClientReady = () => true;
            isTransmissionComplete = () => false;
            hasClientError = () => this._hasFailed;

            getCurrentBuffer = () => this.accumulatedResponse;
            cancelPendingRequests = () => { /* No-op for mockup */ };

            sendDataChunk = (chunkString) => {
                this.accumulatedResponse += chunkString;
                this.linkedStream.processIncomingData();
            };
        }

        this.streamSource = window[sourceImportKey];
        originalHttpClientRef = this.streamSource.prototype.HTTPClient;
        this.streamSource.prototype.HTTPClient = InstantDataClient;

        streamInstanceUnderTest = new this.streamSource('http://immediate-event-test.com');

        streamInstanceUnderTest.addEventHandler('data', (eventPayload) => {
            receivedStreamMessages.push(eventPayload.data);
        });
        streamInstanceUnderTest.addEventHandler('connectionOpen', (eventPayload) => {
            loggedOpenConnections.push(eventPayload.type);
        });
        streamInstanceUnderTest.addEventHandler('connectionError', (eventPayload) => {
            loggedConnectionErrors.push(eventPayload.data);
        });

        process.nextTick(completionCallback);
    });

    afterEach((completionCallback) => {
        streamInstanceUnderTest.terminateConnection();
        this.streamSource.prototype.HTTPClient = originalHttpClientRef;
        completionCallback();
    });

    it("successfully captures an initial message dispatched immediately upon connection setup", (completionCallback) => {
        const expectedMessages = ['"Immediate data transmission!"'];
        expect(receivedStreamMessages).toEqual(expectedMessages);
        completionCallback();
    });
});

describe('Connection Failure: Invalid Endpoint Triggers Closure and Error Dispatch', () => {

    let streamClientFailed,
        incomingMessages = [],
        connectionStarts = [],
        connectionFailures = [];
    let originalHttpClientPrototype;

    beforeEach((completionCallback) => {
        const FailingConnectionClient = function(streamReference) {
            this.associatedStream = streamReference;
            setTimeout(() => {
                this.associatedStream.handleConnectionError({ type: 'network_error', message: 'Simulated connection refusal.' });
            }, 10);
        };

        FailingConnectionClient.prototype = {
            checkReadyStatus: () => false,
            isTransmissionFinished: () => true,
            hasTransmissionError: () => true,
            retrieveBufferContent: () => '',
            cancelTransmission: () => { /* cleanup logic */ },
            pushDataChunk: () => { /* no data sent on failure */ }
        };

        this.streamSource = window[sourceImportKey];
        originalHttpClientPrototype = this.streamSource.prototype.HTTPClient;
        this.streamSource.prototype.HTTPClient = FailingConnectionClient;

        streamClientFailed = new this.streamSource('http://non-existent-api.invalid');

        streamClientFailed.addEventHandler('data', (eventData) => {
            incomingMessages.push(eventData.data);
        });
        streamClientFailed.addEventHandler('connectionOpen', (eventData) => {
            connectionStarts.push(eventData.type);
        });
        streamClientFailed.addEventHandler('connectionError', (eventData) => {
            connectionFailures.push(eventData.type);
            completionCallback();
        });
    });

    afterEach((completionCallback) => {
        streamClientFailed.terminateConnection();
        if (originalHttpClientPrototype) {
            this.streamSource.prototype.HTTPClient = originalHttpClientPrototype;
        }
        completionCallback();
    });

    it("confirms that a connection to an invalid URL dispatches a 'connectionError' event and closes the stream", (completionCallback) => {
        setTimeout(() => {
            expect(connectionFailures).toEqual(['connectionError']);
            expect(incomingMessages).toEqual([]);
            expect(connectionStarts).toEqual([]);
            expect(streamClientFailed.isConnectionActive()).toBeFalse();
            completionCallback();
        }, 50);
    });
});