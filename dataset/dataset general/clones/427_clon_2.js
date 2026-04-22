/*
 * Generated on 2023-11-20.
 */

var srcObjName = "DataStreamer",
    srcObjImportID = (window._streamerPrefix || '') + srcObjName,
    isSrcObjApiPresent = (window["DataStreamer"] !== undefined);

describe("Examining DataStreamer shim using SimulatedHTTP", function() {

    var priorAjaxHandler;

    beforeEach(function() { // Setup before each test case

        var simulatedAjax = function(dataFlowObj) { // Constructor for the fake AJAX object

            this.receivedTextBuffer = ''; // Initialize buffer for response text
            this.dataFlowObj = dataFlowObj; // Store reference to the data flow object
        };

        simulatedAjax.prototype = { // Prototype methods for simulated AJAX

            allowCrossOrigin: false, // Flag for cross-origin requests

            _connObject: null, // Internal request object reference

            _operationFailed: false, // Flag indicating if an operation failed

            isConnectionPrepared: function() { // Checks if connection is ready

                return true;
            },

            hasFinished: function() { // Checks if data transfer is complete

                return false;
            },

            encounteredProblem: function() { // Checks for errors

                return (this._operationFailed);
            },

            fetchReceivedData: function() { // Retrieves buffered data

                return this.receivedTextBuffer;
            },

            cancelTransfer: function() { // Aborts the data transfer

                this.receivedTextBuffer = ''; // Clear the buffer on abort
            },

            transmitDataChunk: function(payloadChunk) { // Simulates sending data

                this.receivedTextBuffer += payloadChunk; // Append data to buffer
                this.dataFlowObj.onNewDataReceived(); // Notify the data flow object
            }
        };

        this.streamerClass = window[srcObjImportID]; // Get the streamer class from window
        priorAjaxHandler = this.streamerClass.prototype.HttpRequestModule; // Store original XHR
        this.streamerClass.prototype.HttpRequestModule = simulatedAjax; // Replace XHR with simulated
    });

    afterEach(function () { // Cleanup after each test case
        this.streamerClass.prototype.HttpRequestModule = priorAjaxHandler; // Restore original XHR
    });

    describe("Offer SimulatedHTTP class to facilitate testing the DataStreamer class", function() {
        var dataFlowInst; // Instance of the data streamer

        beforeEach(function (completeTest) { // Setup before each test in this block

            dataFlowInst = new this.streamerClass('http://testLoadSimulatedHTTP.com'); // Create a new streamer instance
            setTimeout(function () { // Allow event loop to process
                completeTest(); // Mark test setup as complete
            }, 0);
        });

        afterEach(function (){ // Cleanup after each test in this block

            dataFlowInst.terminateStream(); // Close the streamer instance
        });

        it("should utilize simulatedAjax instead of native XMLHttpRequest", function() {
            // The prefix for the streamer is configured in the test runner HTML.

            expect(dataFlowInst._httpReq.transmitDataChunk).toBeDefined(); // Verify the simulated method is present
        });
    });

    describe("Configuring the DataStreamer shim to coexist with browser's native DataStreamer API", function() { // Describe block for polyfill setup

        it("If no configuration object is provided to the DataStreamer constructor, all options from DataStreamer.prototype.standardSettings are applied.", function() {
            // The streamer's prefix is defined in the SpecRunner.html file.

            var streamerObj = new this.streamerClass('http://testdomain.org'); // Create streamer instance with default options
            var anticipatedSettings = streamerObj.standardSettings;  // We expect all options to be the predefined defaults

            var currentSettings = { // Collect actual settings from the streamer instance
                logActive: streamerObj.logActive,
                prefixForLogs: streamerObj.prefixForLogs,
                refreshRate: streamerObj.refreshRate,
                dataBufferMax: streamerObj.dataBufferMax, // in octets
                quietPeriod: streamerObj.quietPeriod, // in milliseconds
                fetchParameters: streamerObj.fetchParameters,
                requestHeaders: streamerObj.requestHeaders
            };

            expect(currentSettings).toEqual(anticipatedSettings); // Assert that actual settings match anticipated defaults

            streamerObj.terminateStream(); // Close the streamer connection
        });

        it("If a configuration object is supplied to the constructor, any option not defined in standardSettings will be disregarded.", function() {
            // The streamer's prefix is defined in the test runner HTML.

            var additionalConfigs = { // Define some extra configuration
                unrecognizedSetting: 1000
            };
            var streamerObj = new this.streamerClass('http://testdomain.org', additionalConfigs); // Create streamer with extra configs

            expect(streamerObj.unrecognizedSetting).toBeUndefined(); // Verify the extra setting is not applied

            streamerObj.terminateStream(); // Close the streamer connection
        });

        it("If a configuration object is supplied to the constructor, options defined in standardSettings will be overridden.", function() {
            // The streamer's prefix is defined in the test runner HTML.

            var userDefinedSettings = { // Custom settings for the streamer
                refreshRate: 1000,
                dataBufferMax: 256 * 1024 // in octets
            };

            var streamerObj = new this.streamerClass('http://testdomain.org', userDefinedSettings); // Create streamer with custom settings
            var originalSettings = streamerObj.standardSettings; // Get the default settings

            var expectedOutcome = { // Define the expected state after applying custom settings
                refreshRate: userDefinedSettings.refreshRate,
                dataBufferMax: userDefinedSettings.dataBufferMax,
                quietPeriod: originalSettings.quietPeriod, // in milliseconds
                fetchParameters: originalSettings.fetchParameters,
                requestHeaders: originalSettings.requestHeaders
            };

            var currentOutcome = { // Collect the actual state from the streamer instance
                refreshRate: streamerObj.refreshRate,
                dataBufferMax: streamerObj.dataBufferMax, // in octets
                quietPeriod: streamerObj.quietPeriod, // in milliseconds
                fetchParameters: streamerObj.fetchParameters,
                requestHeaders: streamerObj.requestHeaders
            };

            expect(currentOutcome).toEqual(expectedOutcome); // Assert that actual state matches expected

            streamerObj.terminateStream(); // Close the streamer connection
        });
    });

    describe("tests for buildUrlWithArgs functionality", function() { // Tests for URL parameter appending utility

        it("If the base URL already contains query arguments, additional streamer arguments are appended.", function() { // Test case for appending to existing parameters

            var queryArgs =  { // Define query parameters
                firstParam: 1,
                secondParam: 2
            };
            var streamerObj = new this.streamerClass('http://testdomain.org?greeting=hello'); // Create streamer instance
            var buildUrlWithArgs = streamerObj.buildUrlWithArgs; // Get the URL builder utility
            expect(buildUrlWithArgs('http://testdomain.org?greeting=hello', queryArgs)).toBe('http://testdomain.org?greeting=hello&firstParam=1&secondParam=2'); // Assert correct URL construction
        });

        it("If invoked with null or undefined parameters, the base URL is returned unchanged.", function() { // Test case for null/undefined parameters
            // The streamer's prefix is defined in the test runner HTML.

            var streamerObj = new this.streamerClass('http://testUrlArgs.org'); // Create streamer instance
            var buildUrlWithArgs = streamerObj.buildUrlWithArgs; // Get the URL builder utility
            expect(buildUrlWithArgs('http://testdomain.org')).toBe('http://testdomain.org'); // Assert base URL is returned
        });

        it("If invoked with a parameters object that has no own properties but inherits attributes from its prototype, the base URL is returned.", function() { // Test case for parameters from prototype
            // The streamer's prefix is defined in the test runner HTML.

            var ArgHolder = function () {}; // Define a constructor
            ArgHolder.prototype = { // Add properties to its prototype
                'alpha': 1,
                'beta': 2
            };
            var streamerObj = new this.streamerClass('http://testUrlArgs.org'); // Create streamer instance
            var buildUrlWithArgs = streamerObj.buildUrlWithArgs; // Get the URL builder utility
            expect(buildUrlWithArgs('http://testdomain.org', new ArgHolder())).toBe('http://testdomain.org'); // Assert base URL is returned
        });

        it("If invoked with a parameters object containing defined arguments, these are appended to the URL.", function() { // Test case for valid parameters
            // The streamer's prefix is defined in the test runner HTML.

            var queryArgs =  { // Define query parameters
                firstKey: 1,
                secondKey: 2
            };
            var streamerObj = new this.streamerClass('http://testUrlArgs.org'); // Create streamer instance
            var buildUrlWithArgs = streamerObj.buildUrlWithArgs; // Get the URL builder utility
            expect(buildUrlWithArgs('http://testdomain.org', queryArgs)).toBe('http://testdomain.org?firstKey=1&secondKey=2'); // Assert correct URL construction
        });
    });

    describe("tests for locateMsgBoundary function", function() { // Tests for message boundary detection

        it("provides the correct message boundary index when encountering '\\n\\n'", function() { // Test case for double newline
            // The streamer's prefix is defined in the test runner HTML.

            var streamerObj = new this.streamerClass('http://testMsgIndex.net'); // Create streamer instance
            var locateMsgBoundary = streamerObj.locateMsgBoundary; // Get the boundary detection utility
            expect(locateMsgBoundary("0123\r\r678\n\n9")).toEqual([9, 11]); // Assert correct index for \\n\\n
        });

        it("provides the correct message boundary index when encountering '\\r\\r'", function() { // Test case for double carriage return
            // The streamer's prefix is defined in the test runner HTML.

            var streamerObj = new this.streamerClass('http://testMsgIndex.net'); // Create streamer instance
            var locateMsgBoundary = streamerObj.locateMsgBoundary; // Get the boundary detection utility
            expect(locateMsgBoundary("0123\n\n678\r\r")).toEqual([9, 11]); // Assert correct index for \\r\\r
        });

        it("provides the correct message boundary index when encountering '\\r\\n\\r\\n'", function() { // Test case for double CRLF
            // The streamer's prefix is defined in the test runner HTML.

            var streamerObj = new this.streamerClass('http://testMsgIndex.net'); // Create streamer instance
            var locateMsgBoundary = streamerObj.locateMsgBoundary; // Get the boundary detection utility
            expect(locateMsgBoundary("0123\n\n67\r\n\r\n")).toEqual([8, 12]); // Assert correct index for \\r\\n\\r\\n
        });
    });

    describe("tests for stripOuterSpaces utility", function() { // Tests for whitespace trimming function

        it("should eliminate leading and trailing whitespace from the input string", function () { // Test case for trimming
            // The streamer's prefix is defined in the test runner HTML.

            var streamerObj = new this.streamerClass('http://testTrimFunc.co'); // Create streamer instance
            var stripOuterSpaces = streamerObj.stripOuterSpaces; // Get the trimming utility
            expect(stripOuterSpaces("       content with padding    ")).toBe('content with padding'); // Assert correct trimming
        });
    });

    describe("tests for standardizeNewlines function", function() { // Tests for newline normalization utility

        it("should substitute Carriage Returns (CR) and Carriage Return-Line Feeds (CRLF) with Line Feeds (LF - \\n) within a string", function () { // Test case for newline conversion
            // The streamer's prefix is defined in the test runner HTML.

            var streamerObj = new this.streamerClass('http://testLineEndings.dev'); // Create streamer instance
            var standardizeNewlines = streamerObj.standardizeNewlines; // Get the newline normalization utility

            var inputString = "LF:\n. CR:\r. CRLF:\r\n. and once more LF:\n. CR:\r. CRLF:\r\n. Dual CR:\r\r. Dual CRLF:\r\n\r\n"; // Input string with various line endings
            var anticipatedString = "LF:\n. CR:\n. CRLF:\n. and once more LF:\n. CR:\n. CRLF:\n. Dual CR:\n\n. Dual CRLF:\n\n"; // Expected string with all LFs
            var resultantString = standardizeNewlines(inputString); // Perform normalization

            expect(resultantString).toBe(anticipatedString); // Assert that the result matches the anticipated string

            streamerObj.terminateStream(); // Close the streamer connection
        });
    });

    describe("Emulates DataStreamer flow utilizing SimulatedHTTP", function() { // Describe block for stream simulation tests

        var dataFlowEmitter, capturedMsgEvents, capturedOpenEvents, capturedErrorEvents; // Declare variables for streamer instance and event logs

        beforeEach(function (testCompletion) { // Setup before each test in this block

            dataFlowEmitter = new this.streamerClass('http://testSimulatedStream.io'); // Create a new streamer instance
            capturedMsgEvents = []; // Initialize array for received message events
            capturedOpenEvents = []; // Initialize array for received open events
            capturedErrorEvents = []; // Initialize array for received error events
            dataFlowEmitter.attachListener('data_payload', function(evt) { // Attach listener for 'data_payload' events
                capturedMsgEvents.push(evt.payload); // Log the data payload
            }, false);
            dataFlowEmitter.attachListener('stream_start', function(evt) { // Attach listener for 'stream_start' events
                capturedOpenEvents.push(evt.kind); // Log the event type
            }, false);
            dataFlowEmitter.attachListener('stream_fault', function(evt) { // Attach listener for 'stream_fault' events
                capturedErrorEvents.push(evt.kind); // Log the event type
            }, false);

            setTimeout(function () { // Allow event loop to process
                testCompletion(); // Mark test setup as complete
            }, 0);
        });

        afterEach(function (testCompletion) { // Cleanup after each test in this block
            dataFlowEmitter.terminateStream(); // Close the streamer instance
            testCompletion(); // Mark test cleanup as complete
        });

        it("verifies that Simulated HTTP is employed", function () { // Test case to confirm simulated XHR usage

            expect(dataFlowEmitter._httpReq.transmitDataChunk).toBeDefined(); // Assert that the simulated method exists
        });

        it("BOM (Byte Order Mark) at the start is disregarded", function () { // Test case for BOM handling

            dataFlowEmitter._httpReq.transmitDataChunk('\ufeffcontent: "Initial piece of information."\r\r'); // Send data with BOM
            var anticipatedEvents = ['"Initial piece of information."']; // Define expected events
            expect(capturedMsgEvents).toEqual(anticipatedEvents); // Assert received messages match expected
        });

        it("Messages spanning multiple lines are correctly reassembled", function () { // Test case for multiline message reassembly

            dataFlowEmitter._httpReq.transmitDataChunk('content: "Line one of information."\ncontent: "Line two of information."\r\r'); // Send multiline data
            var anticipatedEvents = ['"Line one of information."\n"Line two of information."']; // Define expected events
            expect(capturedMsgEvents).toEqual(anticipatedEvents); // Assert received messages match expected
        });

        it("Segmented data transmissions are correctly buffered", function () { // Test case for chunky data handling

            dataFlowEmitter._httpReq.transmitDataChunk('content: "First segment of fractured data.'); // Send first data chunk
            dataFlowEmitter._httpReq.transmitDataChunk('Second segment of fractured data."\n\n'); // Send second data chunk
            var anticipatedEvents = ['"Line one of information."\n"Line two of information."', '"First segment of fractured data.Second segment of fractured data."']; // Define expected events
            expect(capturedMsgEvents).toEqual(anticipatedEvents); // Assert received messages match expected
        });

        it("Identifier lines are processed correctly", function () { // Test case for message identifiers

            var anticipatedMsgID = '2023'; // Define anticipated message ID
            dataFlowEmitter._httpReq.transmitDataChunk('content: "First line of information."\ncontent: "Line two of information."\n\ncontent: "First segment of fractured data.'); // Send data
            dataFlowEmitter._httpReq.transmitDataChunk('Second segment of fractured data."\n\nidentifier: '+anticipatedMsgID+'\ncontent: "Message with a new ID"\n\n'); // Send more data with identifier
            expect(dataFlowEmitter.latestMsgIdentifier).toEqual(anticipatedMsgID); // Assert the latest message ID is correct
        });

        it("The dataBufferMax option is respected", function () { // Test case for buffer size limit

            dataFlowEmitter.dataBufferMax = 100; // Set buffer size limit
            dataFlowEmitter._httpReq.transmitDataChunk('content: "First line of information."\ncontent: "Line two of information."\n\ncontent: "First segment of fractured data.'); // Send data
            dataFlowEmitter._httpReq.transmitDataChunk('Second segment of fractured data."\n\nidentifier: 2023\rcontent: "Message with a new ID"\n\n'); // Send more data
            dataFlowEmitter._httpReq.transmitDataChunk('content: "Message to trigger stream_start event dispatch"\n\n'); // Send data to trigger open event
            var anticipatedOpenEvents = ["stream_start", "stream_start"]; // Define expected open events
            expect(capturedOpenEvents).toEqual(anticipatedOpenEvents); // Assert received open events match expected
        });

        describe("Manually advancing the Jasmine Clock to simulate time passing until events are triggered:", function () { // Describe block for clock-controlled tests

            var originalTimeoutSetting = 0; // Variable to store original timeout setting

            beforeEach(function() { // Setup before each test in this clock-controlled block

                originalTimeoutSetting = dataFlowEmitter.quietPeriod; // Store current quiet period
                jasmine.clock().use(); // Install Jasmine's mock clock
            });

            afterEach(function(testCompletion) { // Cleanup after each test in this block

                dataFlowEmitter.quietPeriod = originalTimeoutSetting; // Restore original quiet period
                jasmine.clock().restore(); // Uninstall Jasmine's mock clock

                testCompletion(); // Mark test cleanup as complete
            });

            it("The quietPeriod option is considered", function () { // Test case for silent timeout

                dataFlowEmitter.quietPeriod = 1000; // Set a custom quiet period
                dataFlowEmitter._httpReq.transmitDataChunk('content: "First line of info."\ncontent: "Second line of info."\n\r\ncontent: "Part one of fractured data.'); // Send data
                dataFlowEmitter._httpReq.transmitDataChunk('Part two of fractured data."\n\r\nidentifier: 2023\rcontent: "Info with new identifier"\n\n'); // Send more data

                setTimeout(function() { // Simulate some delay
                }, 1100);
                jasmine.clock().tick(1101); // Advance the mock clock

                dataFlowEmitter._httpReq.transmitDataChunk('content: "Info to compel stream_start event dispatch"\n\n'); // Send data to trigger open event
                var anticipatedOpenEvents = ["stream_start", "stream_start"]; // Define expected open events
                var anticipatedErrorEvents = ["stream_fault"]; // Define expected error events

                expect(capturedOpenEvents).toEqual(anticipatedOpenEvents); // Assert received open events match expected
                expect(capturedErrorEvents).toEqual(anticipatedErrorEvents); // Assert received error events match expected
            });
        });
    });
});

describe("Assessing DataStreamer's 'listener attachment timing' concern", function() { // Describe block for listener timing tests

    var streamerInst, priorHttpRequestModule, // Declare streamer instance and original XHR
        collectedMsgEvents = [], // Array for collected message events
        collectedOpenEvents = [], // Array for collected open events
        collectedErrorEvents = []; // Array for collected error events

    beforeEach(function (testCompleted) { // Setup before each test in this block

        var fakeHttpRequest = function (streamerRef) { // Constructor for the fake HTTP request object

            this.receivedContent = ''; // Initialize buffer for received content
            this.streamerRef = streamerRef; // Store reference to the streamer instance
            streamerRef._ajaxHelper = this; // Assign this fake XHR to the streamer's internal helper

            // Transmit data immediately to challenge event handling
            this.dispatchContent(this.startupContent || '');
        };

        fakeHttpRequest.prototype = { // Prototype methods for fake HTTP request

            startupContent: 'payload: "This will transmit very quickly"\n\n', // Initial data to send

            enableCrossDomain: false, // Flag for cross-domain requests

            _internalConn: null, // Internal connection object reference

            _hasFailed: false, // Flag indicating if the request failed

            isConnectionLive: function () { // Checks if the connection is active

                return true;
            },

            isTransferComplete: function () { // Checks if data transfer is finished

                return false;
            },

            checkFailureStatus: function () { // Checks if an error occurred

                return (this._hasFailed);
            },

            retrieveContent: function () { // Retrieves the buffered content

                return this.receivedContent;
            },

            haltTransfer: function () { // Halts the data transfer

            },

            dispatchContent: function (dataPiece) { // Dispatches a piece of content

                this.receivedContent += dataPiece; // Append data to the buffer
                this.streamerRef.onDataAvailable(); // Notify the streamer of new data
            }
        };

        this.streamerClass = window[srcObjImportID]; // Get the streamer class from window
        priorHttpRequestModule = this.streamerClass.prototype.HttpRequestModule; // Store original XHR
        this.streamerClass.prototype.HttpRequestModule = fakeHttpRequest; // Replace XHR with fake

        streamerInst = new this.streamerClass('http://testListenerTiming.net'); // Create streamer instance

        streamerInst.attachListener('data_payload', function(evt) { // Attach listener for data_payload events
            collectedMsgEvents.push(evt.payload); // Log the data payload
        }, false);
        streamerInst.attachListener('stream_start', function(evt) { // Attach listener for stream_start events
            collectedOpenEvents.push(evt.kind); // Log the event type
        }, false);
        streamerInst.attachListener('stream_fault', function(evt) { // Attach listener for stream_fault events
            collectedErrorEvents.push(evt.payload); // Log the error payload
        }, false);
        setTimeout(function () { // Allow event loop to process
            testCompleted(); // Mark test setup as complete
        }, 0);
    });

    afterEach(function (testCompleted) { // Cleanup after each test
        streamerInst.terminateStream(); // Close the streamer connection
        this.streamerClass.prototype.HttpRequestModule = priorHttpRequestModule; // Restore original XHR
        testCompleted(); // Mark test cleanup as complete
    });

    it("should capture the initially transmitted message", function (testCompleted) { // Test case for initial message capture

        var anticipatedMessageData = ['"This will transmit very quickly"']; // Define expected message
        expect(collectedMsgEvents).toEqual(anticipatedMessageData); // Assert collected messages match anticipated
        testCompleted(); // Mark test as complete
    });
});

describe('A failed HTTP request (e.g., to an invalid URL) should cause DataStreamer to close and dispatch a "stream_fault" event', function() { // Describe block for failed XHR tests

    var streamerObj, // DataStreamer instance
        capturedMsgEvents = [], // Array for captured message events
        capturedOpenEvents = [], // Array for captured open events
        capturedErrorEvents = []; // Array for captured error events

    beforeEach(function (testCompleted) { // Setup before each test in this block

        this.streamerClass = window[srcObjImportID]; // Get the streamer class from window

        // Attempting to send to an erroneous URL
        streamerObj = new this.streamerClass('http://invalidHttpEndpoint'); // Create streamer instance with invalid URL

        streamerObj.attachListener('data_payload', function (evt) { // Attach listener for data_payload events
            capturedMsgEvents.push(evt.payload); // Log the data payload
        }, false);
        streamerObj.attachListener('stream_start', function (evt) { // Attach listener for stream_start events
            capturedOpenEvents.push(evt.kind); // Log the event type
        }, false);
        streamerObj.attachListener('stream_fault', function (evt) { // Attach listener for stream_fault events
            capturedErrorEvents.push(evt.kind); // Log the event type
            testCompleted(); // Mark test setup as complete (error event signals completion)
        }, false);
    });

    afterEach(function (testCompleted) {
        testCompleted();
    });
});