/*
 * This file serves as a comprehensive test suite for the EventSource polyfill,
 * utilizing a custom MockupXHR implementation to simulate various network behaviors.
 * It thoroughly validates the polyfill's functionality across different scenarios,
 * including option configuration, URL parameter handling, message parsing,
 * and event dispatching under simulated network conditions.
 */

// Define the standard name for EventSource
 var    evsName = "EventSource"        ,
    // Construct the import name, potentially with a prefix from the window object
    evsImportName = (  window._eventSourceImportPrefix  || '' ) + evsName,
    // Determine if the browser's native EventSource is available
    isEventSourceSupported = ( window["EventSource"] != undefined ) ;


// Main test suite: "Testing EventSource polyfill with MockupXHR"
describe ( "Testing EventSource polyfill with MockupXHR" , function ( ) {


    // Variable to temporarily store the original XHR implementation
    var previousXHR;

    /*
     * Setup function executed before each individual test within this suite.
     * This block is responsible for injecting our MockupXHR into the EventSource polyfill.
     */
    beforeEach ( function ( ) {

        // --- Definition of MockupXHR ---
        // This is a custom XHR (XMLHttpRequest) implementation designed for testing.
        // It provides direct control over the response data received by EventSource.
        var mockupXHR = function ( evs ) {

            this.responseText = ''; // Initializes the simulated response buffer
            this.evs = evs;         // Stores a reference to the EventSource instance being tested
        };


        mockupXHR.prototype = {

            useXDomaineRequest: false, /* Flag indicating cross-domain requests (not critical for mockup functionality) */

            _request: null,           // Internal request object (remains unused in this mockup)

            _failed: false,           // A boolean flag to simulate a failed request state

            // Method to check if the mockup is ready; always returns true for testing
            isReady: function ( ) {

                return true;
            }        ,

            // Method to check if the request is done; always returns false as data is streamed
            isDone: function ( ) {

                return false;
            }          ,

            // Method to check if a simulated error has occurred
            hasError: function ( ) {

                return ( this._failed ) ;
            }       ,

            // Retrieves the current content of the simulated response buffer
            getBuffer: function ( ) {

                return this.responseText;
            }       ,

            // Simulates aborting the request by clearing the response buffer
            abort: function ( ) {

                this.responseText = '' ;
            }         ,

            // Appends new data to the response buffer and notifies the EventSource
            sendData: function ( str ) {

                this.responseText += str; // Concatenate the incoming string to the buffer
                this.evs.ondata ( ) ;     // Trigger the EventSource's data processing logic
            }
        } ;

        // Retrieve the EventSource constructor from the global window object using its import name
        this.eventSource = window [ evsImportName ] ;
        // Save the original XHR implementation found on the EventSource prototype
        previousXHR = this.eventSource.prototype.XHR ;
        // Replace the EventSource's internal XHR with our custom mockupXHR for the duration of the tests
        this.eventSource.prototype.XHR = mockupXHR ;
    } ) ;


    /*
     * Teardown function executed after each individual test within this suite.
     * Its primary role is to restore the EventSource polyfill to its original state.
     */
    afterEach ( function ( ) {

        this.eventSource.prototype.XHR = previousXHR ; // Revert to the original XHR implementation
    } ) ;


    // --- Nested Test Suite: MockupXHR Integration Verification ---
    describe ( "Provide MockupXHR class to ease testing the EventSource class" , function ( ) {
        var evs; // Declares a variable to hold the EventSource instance for this sub-suite


        beforeEach ( function ( done ) {

            // Instantiate a new EventSource with a dummy URL for testing purposes
            evs = new this.eventSource ( 'http://exampleLoadMockupXHR.com' ) ;
            // Use setTimeout to ensure the EventSource constructor and initial setup are fully asynchronous
            setTimeout ( function ( ) {
                done ( ) ; // Signal that the asynchronous beforeEach is complete
            } , 0 ) ;
        } ) ;


        afterEach ( function ( ) {

            evs.close ( ) ; // Ensure the EventSource connection is closed after each test
        } ) ;

        // Test case: Verify that the EventSource instance is indeed using our MockupXHR
        it ( "should load mockupXHR instead of native XHR" , function ( ) {
            // A comment indicating that the EventSource prefix is typically configured in SpecRunner.html.

            expect ( evs._xhr.sendData ) . toBeDefined ( ) ; // Checks for a method unique to our MockupXHR
        } ) ;
    } ) ;


    // --- Nested Test Suite: EventSource Polyfill Configuration ---
    describe ( "Setting up the polyfill EventSource for it to be available alongside browser native EventSource" , function ( ) {

        // Test case: Confirm that default options are applied when no options object is provided to the constructor.
        it ( "When no options object is passed to the EventSource constructor, all option in EventSource.prototype.defaultOptions are set." , function ( ) {
            // The EventSource prefix is commonly configured within the SpecRunner.html file.

            var evs = new this.eventSource ( 'http://example.com' ) ; // Create EventSource with default settings
            var expected = evs.defaultOptions ;  // The expected values are those defined in EventSource's defaultOptions

            var actual = {
                loggingEnabled: evs.loggingEnabled,     // Retrieve the actual loggingEnabled setting
                loggingPrefix: evs.loggingPrefix,       // Retrieve the actual loggingPrefix setting
                interval: evs.interval,                 // Retrieve the actual interval setting
                bufferSizeLimit: evs.bufferSizeLimit,   /* buffer size in bytes */
                silentTimeout: evs.silentTimeout,       /* silent timeout in milliseconds */
                getArgs: evs.getArgs,                   // Retrieve the actual getArgs function
                xhrHeaders: evs.xhrHeaders              // Retrieve the actual XHR headers
            } ;

            expect ( actual ) . toEqual ( expected ) ; // Assert that the actual options match the expected defaults

            evs.close ( ) ; // Clean up the EventSource instance
        } ) ;

        // Test case: Verify that any extra options not defined in defaultOptions are disregarded by the constructor.
        it ( "When options is passed to constructor, all option not defined in defaultOptions are ignored." , function ( ) {
            // The EventSource import prefix is typically established within the SpecRunner.html file.

            var extraOptions = {
                extraOption: 1000 // An arbitrary option not part of the standard defaultOptions
            } ;
            var evs = new this.eventSource ( 'http://example.com' , extraOptions ) ;

            expect ( evs.extraOption ) . toBeUndefined ( ) ; // Assert that the 'extraOption' was not set on the instance

            evs.close ( ) ; // Close the EventSource instance
        } ) ;

        // Test case: Confirm that options provided to the constructor successfully override the default options.
        it ( "When options is passed to constructor, option defined in defaultOptions are over written." , function ( ) {
            // The EventSource prefix is expected to be configured within the SpecRunner.html file.

            var options = {
                interval: 1000,           // A custom interval value to override the default
                bufferSizeLimit: 256 * 1024 // A custom buffer size limit (in bytes)
            } ;

            var evs = new this.eventSource ( 'http://example.com' , options ) ;
            var defaults = evs.defaultOptions ; // Obtain the original default options for reference

            var expected = {
                interval: options.interval,         // Expected to be the overridden interval value
                bufferSizeLimit: options.bufferSizeLimit, // Expected to be the overridden buffer size
                silentTimeout: defaults.silentTimeout, // Expected to retain its default value
                getArgs: defaults.getArgs,             // Expected to retain its default value
                xhrHeaders: defaults.xhrHeaders        // Expected to retain its default value
            } ;

            var actual = {
                interval: evs.interval,                 /* Actual interval value */
                bufferSizeLimit: evs.bufferSizeLimit,   /* Actual buffer size in bytes */
                silentTimeout: evs.silentTimeout,       /* Actual silent timeout in milliseconds */
                getArgs: evs.getArgs,                   // Actual getArgs function
                xhrHeaders: evs.xhrHeaders              // Actual XHR headers
            } ;

            expect ( actual ) . toEqual ( expected ) ; // Assert that the actual options match the expected overridden values

            evs.close ( ) ; // Clean up the EventSource instance
        } ) ;
    } ) ;


    // --- Nested Test Suite: urlWithParams Utility Function ---
    describe ( "tests for urlWithParams" , function ( ) {

        // Test case: Verify correct appending of arguments when the base URL already contains parameters.
        it ( "When the baseURL already contains arguments, the rest of evs arguments are appended." , function ( ) {

            var params = {
                a: 1, // First parameter
                b: 2  // Second parameter
            } ;
            var evs = new this.eventSource ( 'http://example.com?ciao=ola' ) ; // Base URL with existing query string
            var urlWithParams = evs.urlWithParams ; // Get the urlWithParams function from the instance
            expect ( urlWithParams ( 'http://example.com?ciao=ola' , params ) ) . toBe ( 'http://example.com?ciao=ola&a=1&b=2' ) ;
        } )

        // Test case: Confirm that the base URL is returned unchanged when parameters are null or undefined.
        it ( "When called with a null or undefined params, baseUrl is returned." , function ( ) {
            // The EventSource prefix is typically configured in the SpecRunner.html file.

            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var urlWithParams = evs.urlWithParams ;
            expect ( urlWithParams ( 'http://example.com' ) ) . toBe ( 'http://example.com' ) ;
        } ) ;

        // Test case: Ensure that the base URL is returned when the params object has attributes only in its prototype.
        it ( "When called with a params object that contains no attribute but has a prototype with attributes, baseUrl is returned." , function ( ) {
            // The prefix is usually set within the SpecRunner.html for these tests.

            var Params = function ( ) { } ; // A constructor for an object that will have prototype properties
            Params.prototype = {
                'a': 1, // Property on the prototype
                'b': 2  // Another property on the prototype
            } ;
            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var urlWithParams = evs.urlWithParams ;
            expect ( urlWithParams ( 'http://example.com' , new Params ( ) ) ) . toBe ( 'http://example.com' ) ;
        } ) ;

        // Test case: Verify that arguments defined directly on the params object are correctly appended to the URL.
        it ( "When called with a params that define arguments, those are added to the url" , function ( ) {
            // The prefix for EventSource is set in SpecRunner.html.

            var params = {
                a: 1, // First parameter
                b: 2  // Second parameter
            } ;
            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var urlWithParams = evs.urlWithParams ;
            expect ( urlWithParams ( 'http://example.com' , params ) ) . toBe ( 'http://example.com?a=1&b=2' ) ;
        } ) ;
    } ) ;


    // --- Nested Test Suite: lastLineIndex Utility Function ---
    describe ( "tests for lastLineIndex" , function ( ) {

        // Test case: Correctly identifies the last message index when using double newline ('\n\n') as a separator.
        it ( "returns correct lastMessageIndex in case of \\n\\n" , function ( ) {
            // The EventSource prefix is typically configured in the SpecRunner.html.

            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var lastLineIndex = evs.lastMessageIndex ; // Get the lastMessageIndex function
            expect ( lastLineIndex ( "0123\r\r678\n\n9" ) ) . toEqual ( [ 9 , 11 ] ) ; // Expected indices
        } ) ;

        // Test case: Correctly identifies the last message index when using double carriage return ('\r\r') as a separator.
        it ( "returns correct lastLineIndex in case of \\r\\r" , function ( ) {
            // The prefix is typically set in SpecRunner.html.

            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var lastLineIndex = evs.lastMessageIndex ;
            expect ( lastLineIndex ( "0123\n\n678\r\r" ) ) . toEqual ( [ 9 , 11 ] ) ;
        } ) ;

        // Test case: Correctly identifies the last message index when using double CRLF ('\r\n\r\n') as a separator.
        it ( "returns correct lastLineIndex in case of \\r\\n\\r\\n" , function ( ) {
            // The prefix for EventSource is often set in SpecRunner.html.

            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var lastLineIndex = evs.lastMessageIndex ;
            expect ( lastLineIndex ( "0123\n\n67\r\n\r\n" ) ) . toEqual ( [ 8 , 12 ] ) ;
        } ) ;
    } ) ;


    // --- Nested Test Suite: trimWhiteSpace Utility Function ---
    describe ( "tests for trimWhiteSpace" , function ( ) {

        // Test case: Verifies that leading and trailing whitespace characters are successfully removed from a string.
        it ( "should remove whitespace left and right of the string" , function ( ) {
            // The EventSource prefix is usually expected to be defined in SpecRunner.html.

            var evs = new this.eventSource ( 'http://exampleurlWithParams.com' ) ;
            var trimWhiteSpace = evs.trimWhiteSpace ; // Get the trimWhiteSpace function
            expect ( trimWhiteSpace ( "       text between spaces    " ) ) . toBe ( 'text between spaces' ) ;
        } ) ;
    } ) ;


    // --- Nested Test Suite: normalizeToLF Utility Function ---
    describe ( "tests for normalizeToLF" , function ( ) {

        // Test case: Ensures that all carriage return (CR) and carriage return-line feed (CRLF) sequences are converted to line feed (LF).
        it ( "should replace CR and CRLF with LF(\\n) inside a string" , function ( ) {
            // The prefix is defined within SpecRunner.html for EventSource.

            var evs = new this.eventSource ( 'http://example.com' ) ;
            var normalizeToLF = evs.normalizeToLF ; // Obtain the normalizeToLF function

            // Define a string containing various line ending types
            var str = "LF:\n. CR:\r. CRLF:\r\n. and again LF:\n. CR:\r. CRLF:\r\n. Double CR:\r\r. Double CRLF:\r\n\r\n" ;
            // Define the expected string after normalization
            var expectedStr = "LF:\n. CR:\n. CRLF:\n. and again LF:\n. CR:\n. CRLF:\n. Double CR:\n\n. Double CRLF:\n\n" ;
            // Perform the normalization
            var actualStr = normalizeToLF ( str ) ;

            expect ( actualStr ) . toBe ( expectedStr ) ; // Assert that the normalized string matches the expected result

            evs.close ( ) ; // Close the EventSource instance
        } ) ;
    } ) ;


    // --- Nested Test Suite: EventSource Stream Simulation with MockupXHR ---
    describe ( "Simulates EventSource stream using MockupXHR" , function ( ) {

        var evs,                    // The EventSource instance under test
            recievedMessageEvents,  // Array to collect data from 'message' events
            recievedOpenEvents,     // Array to collect types from 'open' events
            recievedErrorEvents;    // Array to collect types from 'error' events

        beforeEach ( function ( done ) {

            // Instantiate EventSource with a URL specific to this simulation suite
            evs = new this.eventSource ( 'http://exampleSimulatesEventSourceWithMockupXHR.com' ) ;
            recievedMessageEvents = [ ] ; // Initialize message events array
            recievedOpenEvents = [ ] ;    // Initialize open events array
            recievedErrorEvents = [ ] ;   // Initialize error events array
            // Attach an event listener for 'message' events
            evs.addEventListener ( 'message' , function ( e ) {
                recievedMessageEvents.push ( e.data ) ;
            } , false ) ;
            // Attach an event listener for 'open' events
            evs.addEventListener ( 'open' , function ( e ) {
                recievedOpenEvents.push ( e.type ) ;
            } , false ) ;
            // Attach an event listener for 'error' events
            evs.addEventListener ( 'error' , function ( e ) {
                recievedErrorEvents.push ( e.type ) ;
            } , false ) ;

            setTimeout ( function ( ) {
                done ( ) ; // Allow event listeners to be fully registered before proceeding
            } , 0 ) ;
        } ) ;


        afterEach ( function ( done ) {
            evs.close ( ) ; // Ensure the EventSource connection is closed after each test
            done ( ) ;
        } ) ;

        // Test case: Confirm that the Mockup XHR implementation is actively being used by EventSource.
        it ( "check that Mockup XHR is used" , function ( ) {

            expect ( evs._xhr.sendData ) . toBeDefined ( ) ; // Check for a method that exists only on MockupXHR
        } ) ;

        // Test case: Verify that an initial Byte Order Mark (BOM) character is correctly ignored.
        it ( "Initial BOM mark is skipped" , function ( ) {

            evs._xhr.sendData ( '\ufeffdata: "First line of data."\r\r' ) ; // Send data preceded by a BOM
            var expectedEvents = [ '"First line of data."' ] ; // Expected message data
            expect ( recievedMessageEvents ) . toEqual ( expectedEvents ) ;
        } ) ;

        // Test case: Confirm that messages spanning multiple 'data:' lines are properly concatenated.
        it ( "Multiline message are properly reassembled" , function ( ) {

            evs._xhr.sendData ( 'data: "First line of data."\ndata: "Second line of data."\r\r' ) ;
            var expectedEvents = [ '"First line of data."\n"Second line of data."' ] ; // Expected single reassembled message
            expect ( recievedMessageEvents ) . toEqual ( expectedEvents ) ;
        } ) ;

        // Test case: Ensure that data arriving in fragmented (chunky) transmissions is correctly buffered and processed.
        it ( "Chunky transmissions are properly buffered" , function ( ) {

            evs._xhr.sendData ( 'data: "First line of data."\ndata: "Second line of data."\n\ndata: "First part of broken message.' ) ;
            evs._xhr.sendData ( 'Second part of broken message."\n\n' ) ;
            var expectedEvents = [ '"First line of data."\n"Second line of data."' , '"First part of broken message.Second part of broken message."' ] ;
            expect ( recievedMessageEvents ) . toEqual ( expectedEvents ) ;
        } ) ;

        // Test case: Verify that 'id:' lines are correctly parsed and update the lastEventId property.
        it ( "id lines are properly processed" , function ( ) {

            var expectedEventId = '1983' ; // The ID we expect to be set
            evs._xhr.sendData ( 'data: "First line of data."\ndata: "Second line of data."\n\ndata: "First part of broken message.' ) ;
            evs._xhr.sendData ( 'Second part of broken message."\n\nid: ' + expectedEventId + '\ndata: "Message with new id"\n\n' ) ;
            expect ( evs.lastEventId ) . toEqual ( expectedEventId ) ; // Assert that lastEventId matches
        } ) ;

        // Test case: Confirm that the 'bufferSizeLimit' option is respected, potentially triggering 'open' events upon buffer overflow.
        it ( "option bufferSizeLimit is taken into account" , function ( ) {

            evs.bufferSizeLimit = 100 ; // Set a small buffer size limit to easily trigger overflow
            evs._xhr.sendData ( 'data: "First line of data."\ndata: "Second line of data."\n\ndata: "First part of broken message.' ) ;
            evs._xhr.sendData ( 'Second part of broken message."\n\nid: 1983\rdata: "Message with new id"\n\n' ) ;
            evs._xhr.sendData ( 'data: "Message to force dispatching the open event"\n\n' ) ;
            var expectedOpenEvents = [ "open" , "open" ] ; // Expect two 'open' events: initial and after re-connection due to buffer limit
            expect ( recievedOpenEvents ) . toEqual ( expectedOpenEvents ) ;
        } ) ;

        // --- Nested Test Suite: Manual Jasmine Clock Control ---
        describe ( "Manually ticking the Jasmine Clock to produce a sleep until events are fired:" , function ( ) {

            var previous = 0 ; // Variable to store the original silentTimeout value

            beforeEach ( function ( ) {

                previous = evs.silentTimeout ; // Save the current silentTimeout value
                jasmine.clock ( ) . install ( ) ; // Install Jasmine's mock clock to control time manually
            } ) ;

            afterEach ( function ( done ) {

                evs.silentTimeout = previous ; // Restore the original silentTimeout value
                jasmine.clock ( ) . uninstall ( ) ; // Uninstall Jasmine's mock clock

                done ( ) ;
            } ) ;

            // Test case: Verify that the 'silentTimeout' option correctly triggers an 'error' event after a period of inactivity.
            it ( "option silentTimeout is taken into account" , function ( ) {

                evs.silentTimeout = 1000 ; // Set a silent timeout of 1000 milliseconds
                evs._xhr.sendData ( 'data: "First line of data."\ndata: "Second line of data."\n\r\ndata: "First part of broken message.' ) ;
                evs._xhr.sendData ( 'Second part of broken message."\n\r\nid: 1983\rdata: "Message with new id"\n\n' ) ;

                // Simulate a delay that is longer than the configured silentTimeout
                setTimeout ( function ( ) {
                } , 1100 ) ;
                jasmine.clock ( ) . tick ( 1101 ) ; // Advance the Jasmine clock past the timeout duration

                evs._xhr.sendData ( 'data: "Message to force dispatching the open event"\n\n' ) ;
                var expectedOpenEvents = [ "open" , "open" ] ; // Expected 'open' events (initial connection and re-connection after timeout)
                var expectedErrorEvents = [ "error" ] ; // Expected 'error' event due to silent timeout

                expect ( recievedOpenEvents ) . toEqual ( expectedOpenEvents ) ;
                expect ( recievedErrorEvents ) . toEqual ( expectedErrorEvents ) ;
            } ) ;
        } ) ;
    } ) ;
} ) ;


// --- Top-Level Test Suite: Event Listener Attachment Timing ---
describe ( "Evaluating EventSource 'time to attach listener' doubt" , function ( ) {

    var evs,           // The EventSource instance
        previousXHR,   // Variable to store the original XHR for restoration
        recievedMessageEvents = [ ], // Array to collect received message data
        recievedOpenEvents = [ ],    // Array to collect received 'open' event types
        recievedErrorEvents = [ ] ;  // Array to collect received 'error' event data

    beforeEach ( function ( done ) {

        // --- Custom MockupXHR Definition for this specific test ---
        // This mockup is designed to immediately send data upon its instantiation,
        // which helps in testing the timing of event listener attachment.
        var mockupXHR = function ( evs ) {

            this.responseText = ''; // Initialize the simulated response buffer
            this.evs = evs;         // Store a reference to the EventSource instance
            evs._xhr = this;        // Explicitly assign this mockup as the EventSource's internal XHR

            // Immediately send predefined initial data to stress event listeners
            this.sendData ( this.initialData || '' ) ;
        } ;

        mockupXHR.prototype = {

            initialData: 'data: "I will fire very quick"\n\n', // Data string to be sent instantly

            useXDomaineRequest: false, // Flag for cross-domain requests (not relevant for this mockup)

            _request: null,           // Internal request object (unused in this mockup)

            _failed: false,           // Flag to simulate a failed request

            // Method to check readiness; always returns true for testing
            isReady: function ( ) {

                return true ;
            } ,

            // Method to check if the request is done; always returns false
            isDone: function ( ) {

                return false ;
            } ,

            // Checks if a simulated error has occurred
            hasError: function ( ) {

                return ( this._failed ) ;
            } ,

            // Returns the current content of the simulated response buffer
            getBuffer: function ( ) {

                return this.responseText ;
            } ,

            // Simulates aborting the request (no action needed here)
            abort: function ( ) {

            } ,

            // Appends data and triggers the EventSource's data processing
            sendData: function ( str ) {

                evs = this.evs ;
                this.responseText += str ;
                evs.ondata ( ) ;
            }
        } ;

        this.eventSource = window [ evsImportName ] ; // Get the EventSource constructor
        previousXHR = this.eventSource.prototype.XHR ; // Store the original XHR implementation
        this.eventSource.prototype.XHR = mockupXHR ; // Replace with our custom mockup

        evs = new this.eventSource ( 'http://exampleTimeToAttachDoubt.com' ) ; // Instantiate EventSource

        // Attach event listeners *after* EventSource instantiation, but potentially *before*
        // the immediate data send from mockupXHR has been fully processed by the event loop.
        evs.addEventListener ( 'message' , function ( e ) {
            recievedMessageEvents.push ( e.data ) ;
        } , false ) ;
        evs.addEventListener ( 'open' , function ( e ) {
            recievedOpenEvents.push ( e.type ) ;
        } , false ) ;
        evs.addEventListener ( 'error' , function ( e ) {
            recievedErrorEvents.push ( e.data ) ;
        } , false ) ;
        setTimeout ( function ( ) {
            done ( ) ; // Allow the event loop to process any immediate events before test assertion
        } , 0 ) ;
    } ) ;


    afterEach ( function ( done ) {
        evs.close ( ) ; // Close the EventSource connection
        this.eventSource.prototype.XHR = previousXHR ; // Restore the original XHR implementation
        done ( ) ;
    } ) ;

    // Test case: Verify that the EventSource instance successfully captures messages
    // that are sent immediately upon the underlying XHR's creation.
    it ( "should catch initial message sent" , function ( done ) {

        var expectedMessageEvents = [ '"I will fire very quick"' ] ; // The message expected from immediate send
        expect ( recievedMessageEvents ) . toEqual ( expectedMessageEvents ) ; // Assert collected messages match expected
        done ( ) ;
    } )
} ) ;


// --- Top-Level Test Suite: Failed XHR Request Handling ---
describe ( 'Failed XHR request(invalid url) shall trigger EventSource to close and "error" event to be dispatched' , function ( ) {

    var evs,                   // The EventSource instance
        recievedMessageEvents = [ ], // Array for message events (should be empty in this suite)
        recievedOpenEvents = [ ],    // Array for 'open' events
        recievedErrorEvents = [ ] ;  // Array for 'error' events

    beforeEach ( function ( done ) {

        this.eventSource = window [ evsImportName ] ; // Get the EventSource constructor

        // Instantiate EventSource with an intentionally invalid URL to force an XHR failure
        evs = new this.eventSource ( 'http://exampleFailedXHRequest' ) ;

        // Attach event listeners to capture any events dispatched by EventSource
        evs.addEventListener ( 'message' , function ( e ) {
            recievedMessageEvents.push ( e.data ) ;
        } , false ) ;
        evs.addEventListener ( 'open' , function ( e ) {
            recievedOpenEvents.push ( e.type ) ;
        } , false ) ;
        evs.addEventListener ( 'error' , function ( e ) {
            recievedErrorEvents.push ( e.type ) ; // Capture the 'error' event type
            done ( ) ; // Signal that the asynchronous beforeEach is complete upon receiving an error
        } , false ) ;
    } ) ;

    afterEach ( function ( ) {