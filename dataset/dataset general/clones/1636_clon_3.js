// Define a comprehensive utility object for test constants, mock services, and helper functions.
const TestEnvironmentUtils = {
    // Universal endpoint for sending MIDI command data.
    MIDI_COMMAND_DISPATCH_URL: '/api/midi/v1/dispatch',

    // Creates a standardized payload for a MIDI "Note On" event.
    // Includes robust input validation for MIDI parameters.
    createMidiNoteOnPayload: (channelIndex = 0, pitchValue = 60, dynamicIntensity = 64) => {
        // Ensure all parameters fall within valid MIDI ranges.
        if (channelIndex < 0 || channelIndex > 15 || pitchValue < 0 || pitchValue > 127 || dynamicIntensity < 0 || dynamicIntensity > 127) {
            throw new Error('Invalid MIDI parameter supplied: channel (0-15), pitch (0-127), or intensity (0-127) out of bounds.');
        }
        return {
            targetChannel: channelIndex,
            midiEventType: 0x90, // Hexadecimal for 144 (Note On command).
            noteKey: pitchValue,
            velocityMagnitude: dynamicIntensity
        };
    },

    // A sophisticated mock implementation of an Angular application scope for isolated testing.
    MockApplicationRootScope: function() {
        // Internal registry for mock services.
        this._mockServices = {};

        // Simulates the `$new` method to instantiate a controller with this mock scope.
        this.$instantiateController = (ControllerClassReference) => {
            if (typeof ControllerClassReference !== 'function') {
                throw new TypeError('ControllerClassReference must be a constructor function.');
            }
            const constructedController = new ControllerClassReference();
            // Inject the mock scope into the controller for dependencies.
            constructedController._scopeReference = this;
            // Execute any mock-specific initialization logic if present on the controller.
            if (typeof constructedController.onInitMock === 'function') {
                constructedController.onInitMock();
            }
            return constructedController;
        };

        // Simulates the `$service` method to retrieve mock services.
        this.$retrieveService = (serviceIdentifier) => {
            // Special handling for the '$browser' service which contains the XHR mock.
            if (serviceIdentifier === '$browser') {
                return {
                    httpEmulator: { // Renamed from `xhr` to `httpEmulator` for clarity.
                        _queuedExpectations: [], // Stores expected HTTP requests.
                        _activeRequests: [],    // Stores requests awaiting response.

                        // Configures the emulator to expect a POST request.
                        expectPostRequest: function(endpointUrl, requestBody) {
                            if (!endpointUrl || !requestBody) {
                                throw new Error('Expected URL and request body for POST expectation.');
                            }
                            const newExpectation = { method: 'POST', url: endpointUrl, data: requestBody };
                            this._queuedExpectations.push(newExpectation);

                            // Returns an object that allows chaining a response configuration.
                            return {
                                withResponse: (responsePayload) => {
                                    const matchedExpectation = this._queuedExpectations.pop();
                                    if (matchedExpectation) {
                                        this._activeRequests.push({ ...matchedExpectation, response: responsePayload });
                                    } else {
                                        console.warn('Attempted to configure response for an un-expected request.');
                                    }
                                }
                            };
                        },

                        // Processes all currently active (expected and pending) HTTP requests.
                        // Simulates server response and clears the queue.
                        flushAllPending: function() {
                            if (this._activeRequests.length === 0) {
                                // Log a warning if no requests are pending, indicating potential test setup issue.
                                console.info('No active HTTP requests to flush; proceeding without response simulation.');
                                return;
                            }
                            this._activeRequests.forEach(request => {
                                // In a real scenario, this would trigger success/error callbacks in the tested code.
                                // For this test, simply acknowledging completion is sufficient.
                            });
                            this._activeRequests = []; // Clear the processed requests.
                        },

                        // Checks if there are any HTTP requests still awaiting a response.
                        hasUnresolvedRequests: function() {
                            return this._activeRequests.length > 0;
                        }
                    }
                };
            }
            // Return other mock services if registered.
            return this._mockServices[serviceIdentifier];
        };
    }
};

// Main test suite for the `MidiOutputController` component, focusing on its operational behavior.
describe('MidiOutputControllerOperationalTests', function() {
    let mockApplicationScope;           // Represents the simulated Angular application scope.
    let midiOutputComponent;            // The instance of the MIDI output controller under examination.

    // Constants for test-specific MIDI values.
    const ARBITRARY_MIDI_NOTE = 77;
    const DEFAULT_MIDI_VELOCITY = 60;
    const INITIAL_LATENCY_VALUE = -1; // Represents an unmeasured or invalid latency.

    // Setup routine executed before each individual test case.
    beforeEach(function() {
        // Extend Jasmine's built-in matchers with a custom comparison function for numerical checks.
        this.addMatchers({
            // Custom matcher: Verifies if the 'actual' value is numerically greater than or equal to the 'minimumPermittedValue'.
            isAtLeastTheValue: function(minimumPermittedValue) {
                // Perform robust type validation to ensure meaningful comparison.
                if (typeof this.actual !== 'number' || typeof minimumPermittedValue !== 'number') {
                    throw new Error('Custom matcher "isAtLeastTheValue" requires both arguments to be numbers.');
                }
                // Return true if the actual value meets or exceeds the minimum.
                return this.actual >= minimumPermittedValue;
            }
        });

        // Initialize the mock application scope using our enhanced utility.
        mockApplicationScope = new TestEnvironmentUtils.MockApplicationRootScope();
        // Instantiate the MIDI output controller, associating it with the mock scope.
        // `MidiOutputController` is the assumed new name for `PianoCtrl`.
        midiOutputComponent = mockApplicationScope.$instantiateController(MidiOutputController);
    });

    // Test specification: Ensures that the controller accurately measures and records the network latency
    // associated with each MIDI command transmission.
    it('should correctly calculate and store the round-trip network latency for every dispatched MIDI command', function() {
        // Retrieve the mock HTTP request handler from the simulated browser environment.
        const mockHttpService = mockApplicationScope.$retrieveService('$browser').httpEmulator;

        // Construct the specific payload for a MIDI Note ON message using the provided utility.
        const outgoingMidiEventData = TestEnvironmentUtils.createMidiNoteOnPayload(
            0, // MIDI Channel 0.
            ARBITRARY_MIDI_NOTE,
            DEFAULT_MIDI_VELOCITY
        );

        // Configure the mock HTTP service to expect a POST request to the defined endpoint.
        // It should respond with the same data it received to simulate a successful echo.
        mockHttpService.expectPostRequest(TestEnvironmentUtils.MIDI_COMMAND_DISPATCH_URL, outgoingMidiEventData)
                       .withResponse(outgoingMidiEventData);

        // Initialize or reset the latency tracking property on the controller.
        // This ensures a clean state before the command is sent.
        if (typeof midiOutputComponent.resetLatencyMetrics === 'function') {
            midiOutputComponent.resetLatencyMetrics();
        } else {
            // Fallback: direct assignment if a dedicated reset method is not available.
            midiOutputComponent.lastTransmissionLatencyMs = INITIAL_LATENCY_VALUE;
        }

        // Dispatch the MIDI Note ON command through the controller.
        // `MIDI_COMMAND_NOTE_ON` is assumed to be a constant property on the controller.
        midiOutputComponent.sendMidiCommand(midiOutputComponent.MIDI_COMMAND_NOTE_ON, ARBITRARY_MIDI_NOTE);

        // Simulate the completion of all pending HTTP requests and their responses.
        mockHttpService.flushAllPending();

        // Final assertion: The recorded transmission latency must be a valid non-negative value,
        // confirming that the measurement process was successful.
        expect(midiOutputComponent.lastTransmissionLatencyMs).isAtLeastTheValue(0);

        // Additional validation: Ensure no unexpected HTTP requests remain unresolved.
        expect(mockHttpService.hasUnresolvedRequests()).toBeFalsy();
    });

    // An additional test case to demonstrate Type III additions:
    // Verifies the controller's behavior when attempting to send an invalid MIDI command.
    it('should prevent dispatch of invalid MIDI commands and potentially log an error', function() {
        // Spy on console.error to check if error logging occurs.
        spyOn(console, 'error');

        // Attempt to dispatch a MIDI command with an invalid note value (e.g., beyond 127).
        const invalidNotePitch = 200; // An clearly out-of-range MIDI note.
        const validCommandType = midiOutputComponent.MIDI_COMMAND_NOTE_ON;

        // The controller's `sendMidiCommand` method is expected to handle this gracefully.
        // It should not crash, and ideally, it should log an error or return a specific status.
        midiOutputComponent.sendMidiCommand(validCommandType, invalidNotePitch);

        // Assert that an error was logged to the console, indicating the invalid input was caught.
        expect(console.error).toHaveBeenCalledWith(
            jasmine.stringContaining('Invalid MIDI note value') // Check for a specific error message.
        );

        // Further assertions could check that no HTTP request was made for the invalid command.
        const mockHttpService = mockApplicationScope.$retrieveService('$browser').httpEmulator;
        expect(mockHttpService.hasUnresolvedRequests()).toBeFalsy(); // No request should have been queued.
    });
});