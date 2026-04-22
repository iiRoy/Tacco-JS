const verify = testLib.expect; // Alias 'expect' from a hypothetical test library, renamed from 'chai.expect'

// Renamed 'Object.size' to 'utility.countProperties' and refactored for Type III.
const utility = {
    /**
     * Counts enumerable own properties of an object.
     * @param {object} subjectObject - The object whose properties are to be counted.
     * @returns {number} The number of own properties.
     */
    countProperties: function (subjectObject) {
        // Type III: Added a guard clause for robustness.
        if (subjectObject === null || typeof subjectObject !== 'object') {
            console.warn("Attempted to count properties on a non-object value. Returning 0.");
            return 0;
        }

        let propertyCounter = 0; // Renamed 'size' to 'propertyCounter'.
        // Type III: Refactored loop variables and `hasOwnProperty` call for robustness.
        for (const propertyKeyIdentifier in subjectObject) { // Renamed 'key' to 'propertyKeyIdentifier'.
            // Ensures only direct properties are counted, not inherited ones.
            if (Object.prototype.hasOwnProperty.call(subjectObject, propertyKeyIdentifier)) {
                propertyCounter++;
            }
        }
        return propertyCounter;
    }
};

// Main test suite, renamed from 'DuelJS test case 1' to 'MessageHub Framework Validation'.
testSuite('MessageHub Framework Validation', function () {
    // Nested test suite, renamed from '#initialization testing' to 'Core Component Setup Verification'.
    testSuite('Core Component Setup Verification', function () {

        // Type III: New helper function to reduce repetition in integrity checks.
        const ensureComponentIsDefined = (componentPath, componentName) => {
            verify(componentPath).to.not.be.an('undefined', `CRITICAL: Component '${componentName}' must be defined.`);
        };

        testCase('The primary message bus (commBus) instance should be correctly initialized', function () { // Renamed 'duel' to 'commBus'.
            verify(commBus).to.be.an.instanceof(Object, 'commBus should be an instance of Object');
            // Type III: Added an additional basic type check.
            verify(typeof commBus).to.equal('object', 'commBus variable type must be an object');
        });

        // Type III: Rewritten conditional logic for storage event detection.
        const legacyBrowserPattern = /Trident|MSIE|Edge\/\d+\./i; // Updated regex for broader legacy browser detection.
        const isLegacyEnvironment = legacyBrowserPattern.test(navigator.userAgent);
        const expectedStorageEventSetting = !isLegacyEnvironment; // Simplified logic for expected boolean.

        testCase(`commBus's storage event mechanism should align with browser compatibility (${navigator.userAgent})`, function () {
            // Type III: Introduced intermediate variable for clarity.
            const actualStorageEventUsage = commBus.utilizeStorageEvent; // Renamed 'useStorageEvent'.
            verify(actualStorageEventUsage).to.equal(expectedStorageEventSetting, 'Storage event utilization should match browser capabilities');
            // Type III: Conditional logging for debugging discrepancies.
            if (actualStorageEventUsage !== expectedStorageEventSetting) {
                console.warn(`Browser compatibility mismatch: Expected storage event usage to be ${expectedStorageEventSetting}, but found ${actualStorageEventUsage}.`);
            }
        });

        testCase('commBus.isLocalDataStorageAvailable should be a function and report true', function () { // Renamed 'isLocalStorageAvailable'.
            ensureComponentIsDefined(commBus.isLocalDataStorageAvailable, 'isLocalDataStorageAvailable');
            verify(typeof commBus.isLocalDataStorageAvailable).to.equal('function', 'isLocalDataStorageAvailable must be a function');
            verify(commBus.isLocalDataStorageAvailable()).to.be.true('isLocalDataStorageAvailable should return true when available'); // Changed to .be.true.
        });

        testCase('Comprehensive integrity check: All essential commBus components must be present and functional', function () {
            // Type III: Grouped checks using the helper function and renamed properties.
            ensureComponentIsDefined(commBus.deepCopy, 'deepCopy (formerly clone)'); // Renamed 'clone'.
            ensureComponentIsDefined(commBus.AbstractCommunicationLink, 'AbstractCommunicationLink (formerly DuelAbstractChannel)'); // Renamed 'DuelAbstractChannel'.
            ensureComponentIsDefined(commBus.getUniqueWindowId, 'getUniqueWindowId (formerly getWindowID)'); // Renamed 'getWindowID'.
            ensureComponentIsDefined(commBus.LocalDataChannel, 'LocalDataChannel (formerly DuelLocalStorageChannel)'); // Renamed 'DuelLocalStorageChannel'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.getChannelName, 'LocalDataChannel.getChannelName'); // Renamed 'getName'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.fireEventTrigger, 'LocalDataChannel.fireEventTrigger'); // Renamed 'executeTrigger'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.addEventHandler, 'LocalDataChannel.addEventHandler'); // Renamed 'on'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.addOneTimeEventHandler, 'LocalDataChannel.addOneTimeEventHandler'); // Renamed 'once'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.removeEventHandler, 'LocalDataChannel.removeEventHandler'); // Renamed 'off'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.dispatchMessage, 'LocalDataChannel.dispatchMessage'); // Renamed 'emit'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.setAsPrimaryWindow, 'LocalDataChannel.setAsPrimaryWindow'); // Renamed 'setCurrentWindowAsMaster'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.isThisWindowPrimary, 'LocalDataChannel.isThisWindowPrimary'); // Renamed 'currentWindowIsMaster'.
            ensureComponentIsDefined(commBus.LocalDataChannel.prototype.broadcastMessage, 'LocalDataChannel.broadcastMessage'); // Renamed 'broadcast'.

            ensureComponentIsDefined(commBus.SimulatedChannel, 'SimulatedChannel (formerly DuelFakeChannel)'); // Renamed 'DuelFakeChannel'.
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.getChannelName, 'SimulatedChannel.getChannelName');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.fireEventTrigger, 'SimulatedChannel.fireEventTrigger');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.addEventHandler, 'SimulatedChannel.addEventHandler');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.addOneTimeEventHandler, 'SimulatedChannel.addOneTimeEventHandler');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.removeEventHandler, 'SimulatedChannel.removeEventHandler');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.dispatchMessage, 'SimulatedChannel.dispatchMessage');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.setAsPrimaryWindow, 'SimulatedChannel.setAsPrimaryWindow');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.isThisWindowPrimary, 'SimulatedChannel.isThisWindowPrimary');
            ensureComponentIsDefined(commBus.SimulatedChannel.prototype.broadcastMessage, 'SimulatedChannel.broadcastMessage');

            verify(commBus.activeCommunicationChannels).to.be.an('array', 'activeCommunicationChannels should be an array'); // Renamed 'activeChannels'.
            ensureComponentIsDefined(commBus.retrieveChannel, 'retrieveChannel (formerly channel)'); // Renamed 'channel'.
            ensureComponentIsDefined(commBus.promoteCurrentWindowToPrimary, 'promoteCurrentWindowToPrimary (formerly makeCurrentWindowMaster)'); // Renamed 'makeCurrentWindowMaster'.
            ensureComponentIsDefined(window.isPrimaryWindow, 'window.isPrimaryWindow (formerly window.isMaster)'); // Renamed 'window.isMaster'.
            ensureComponentIsDefined(commBus.attachDomEvent, 'attachDomEvent (formerly addEvent)'); // Renamed 'addEvent'.
            ensureComponentIsDefined(commBus.storageEventProcessor, 'storageEventProcessor (formerly storageEvent)'); // Renamed 'storageEvent'.
        });
    });

    // Nested test suite, renamed from '#window testing' to 'Browser Window Management Tests'.
    testSuite('Browser Window Management Tests', function () {

        // Type III: Using 'let' for reassignability and adding explanatory comment.
        // This array holds references to active communication channels, reset for window-related tests.
        let currentChannelRegister = commBus.activeCommunicationChannels = []; // Renamed 'activeChannels'.

        testCase('commBus.getUniqueWindowId should return a consistent unique numeric identifier', function () { // Renamed 'getWindowID'.
            const windowIdentificationNumber = commBus.getUniqueWindowId(); // Renamed 'windowID'.
            verify(windowIdentificationNumber).to.be.a('number', 'Window ID should be a number');
            verify(commBus.getUniqueWindowId()).to.equal(windowIdentificationNumber, 'Subsequent calls should yield the same ID');
            // Type III: Added a basic validation check.
            verify(windowIdentificationNumber).to.be.above(0, 'Window ID should be a positive integer');
        });

        // The original code nests a 'describe' block inside an 'it' block.
        // This unusual structure is preserved for functional similarity, as requested.
        testCase('window.isPrimaryWindow() should return true when no communication channels are established', function () { // Renamed 'window.isMaster'.
            verify(window.isPrimaryWindow()).to.be.true('Initially, this browser window should be considered primary.'); // Changed to .be.true.

            // Type III: This nested suite structure is retained from the original.
            testSuite('Inter-Window Communication Channel Operations', function () { // Renamed 'DuelJS test case 2' and '#channel testing'.
                let activeCommChannel = commBus.retrieveChannel('primaryTestChannel'); // Renamed 'channel' and '_test'.

                testCase('commBus.retrieveChannel should provide a new channel instance', function () {
                    verify(activeCommChannel).to.be.an.instanceof(Object, 'The retrieved channel should be an object instance');
                    // Type III: Added a specific check for a channel property.
                    verify(activeCommChannel.getChannelName()).to.equal('primaryTestChannel', 'Channel should have the correct name property.');
                });

                testCase('window.isPrimaryWindow() should remain true after a channel is initialized', function () {
                    verify(window.isPrimaryWindow()).to.be.true('Even with an active channel, the window should still be primary.');
                });

                testCase('Channel retrieval should prevent duplication for existing channel names', function () { // Reworded.
                    // Type III: Added a guard to ensure currentChannelRegister is an array.
                    if (!Array.isArray(currentChannelRegister)) {
                        currentChannelRegister = commBus.activeCommunicationChannels = [];
                        console.warn("currentChannelRegister was invalid; re-initializing.");
                    }

                    activeCommChannel = commBus.retrieveChannel('primaryTestChannel'); // Re-retrieve.
                    let secondCommChannelAttempt = commBus.retrieveChannel('primaryTestChannel'); // Duplicate attempt.
                    let distinctCommChannel = commBus.retrieveChannel('secondaryTestChannel'); // Renamed 'channel2' and '_test2'.
                    let thirdCommChannelRef = commBus.retrieveChannel('primaryTestChannel'); // Renamed 'channel3'.

                    // Type III: Introduced intermediate variable for clarity.
                    const currentActiveChannelCount = commBus.activeCommunicationChannels.length;
                    verify(currentActiveChannelCount).to.equal(2, 'Expected exactly two distinct channels to be active.');
                    verify(thirdCommChannelRef).to.equal(activeCommChannel, 'Retrieving the same channel name should return the identical instance.');
                    verify(activeCommChannel.isThisWindowPrimary()).to.be.true('Primary channel instance should report primary window status.');
                    verify(distinctCommChannel.isThisWindowPrimary()).to.be.true('Distinct channel instance should also report primary window status.');
                    verify(thirdCommChannelRef.isThisWindowPrimary()).to.be.true('Referenced primary channel should report primary status.');

                    // Type III: Added verification of channel names in the internal register.
                    const registeredChannelNames = commBus.activeCommunicationChannels.map(ch => ch.getChannelName());
                    verify(registeredChannelNames).to.include('primaryTestChannel', 'Register should contain the primary channel name.');
                    verify(registeredChannelNames).to.include('secondaryTestChannel', 'Register should contain the secondary channel name.');
                });

                testCase('Event handler should be created and successfully triggered', function (testCompletionCallback) { // Renamed 'done'.
                    let eventAccumulator = -12; // Renamed '_check', changed initial value for Type III.
                    const eventSignalName = 'customTriggerSignal'; // Renamed 'test_event'.
                    const triggerArguments = [3, 9, 0]; // Renamed 'args'.

                    // Type III: Added a console log for tracing.
                    console.log(`Setting up event handler for '${eventSignalName}'.`);

                    activeCommChannel.addEventHandler(eventSignalName, function (valueA, valueB, valueC) { // Renamed 'on', 'a', 'b', 'c'.
                        eventAccumulator += valueA + valueB + valueC;
                        verify(eventAccumulator).to.equal(0, 'Accumulator should reach zero after event processing.');
                        console.log(`Event '${eventSignalName}' successfully processed. Accumulator: ${eventAccumulator}`);
                        testCompletionCallback(); // Signal test completion.
                    });

                    // Type III: Verify the internal event handler map is populated.
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.be.above(0, 'Event listeners map should not be empty after subscription.'); // Renamed '_triggers'.

                    activeCommChannel.fireEventTrigger({ name: eventSignalName, args: triggerArguments }, true); // Renamed 'executeTrigger'.
                    // Type III: Changed assertion to check for non-empty map after trigger.
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.not.equal(0, 'Event listeners map should still contain handlers after trigger (for non-once events).');
                });

                testCase('Event handler should be correctly removed after subscription', function (doneWithTest) { // Renamed 'done'.
                    let eventAccumulator = -25; // Renamed '_check', changed initial value.
                    const removalTestEvent = 'removableSignal'; // New event name for clarity.

                    activeCommChannel.addEventHandler(removalTestEvent, function (val1, val2, val3) {
                        eventAccumulator += val1 + val2 + val3;
                        console.log(`This handler for '${removalTestEvent}' should NOT execute.`); // Log for debugging.
                    });
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(1, 'One handler should be registered before removal.');

                    activeCommChannel.removeEventHandler(removalTestEvent); // Renamed 'off'.
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(0, 'Handler map should be empty after removal.');

                    // Attempt to trigger the event post-removal.
                    activeCommChannel.fireEventTrigger({ name: removalTestEvent, args: [5, 10, 10] }, true);
                    verify(eventAccumulator).to.equal(-25, 'Accumulator value must remain unchanged, indicating handler was not invoked.');
                    doneWithTest();
                });

                testCase('An event handler should execute exactly once and then self-remove', function (completeTest) { // Renamed 'done'.
                    let temporaryAccumulator = -18; // Renamed '__check', changed initial value.
                    const singleExecutionEvent = 'oneShotAction';

                    // Type III: Ensure the map is empty before starting, for a clean test.
                    activeCommChannel.eventListenersMap = {}; // Explicitly reset for this test.
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(0, 'Event listeners map should be empty initially.');

                    activeCommChannel.addOneTimeEventHandler(singleExecutionEvent, function (x, y, z) { // Renamed 'once'.
                        temporaryAccumulator += x + y + z;
                        console.log(`One-time event '${singleExecutionEvent}' executed. Current accumulator: ${temporaryAccumulator}`);
                    });
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.be.above(0, 'Map should contain the one-time handler.');

                    activeCommChannel.fireEventTrigger({ name: singleExecutionEvent, args: [4, 8, 6] }, true); // First trigger.
                    verify(temporaryAccumulator).to.equal(0, 'Accumulator should be zero after the first (and only) execution.');
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(0, 'Map should be empty after one-time handler execution.');

                    // Type III: Added a loop for multiple subsequent triggers to ensure no re-execution.
                    for (let i = 0; i < 2; i++) {
                        activeCommChannel.fireEventTrigger({ name: singleExecutionEvent, args: [1, 1, 1] }, true);
                    }
                    verify(temporaryAccumulator).to.equal(0, 'Accumulator must remain zero after subsequent triggers.');
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(0, 'Map must remain empty.');

                    activeCommChannel.removeEventHandler(singleExecutionEvent); // Explicit removal, though it should already be gone.
                    completeTest();
                });

                testCase('Master window-initiated triggers should not activate local handlers by default', function () { // Reworded.
                    let temporaryAccumulator = -30; // Renamed '__check', changed initial value.
                    const masterOriginEvent = 'masterBroadcastEvent';

                    activeCommChannel.addOneTimeEventHandler(masterOriginEvent, function (valA, valB, valC) {
                        temporaryAccumulator += valA + valB + valC;
                        console.log(`This handler for '${masterOriginEvent}' should NOT execute from a master-originated trigger without explicit local flag.`);
                    });

                    // Type III: Added a guard clause to ensure the test context is appropriate.
                    if (activeCommChannel.isThisWindowPrimary()) {
                        activeCommChannel.fireEventTrigger({ name: masterOriginEvent, args: [10, 10, 10] }); // Missing 'true' flag, so no local execution.
                    } else {
                        console.warn("Current window is not primary; skipping master-originated trigger test for this instance.");
                    }

                    verify(temporaryAccumulator).to.equal(-30, 'Accumulator should not change, as master-originated trigger should not execute locally by default.');
                    activeCommChannel.removeEventHandler(masterOriginEvent);
                });

                testCase('Adding multiple handlers to the same event name should not create duplicate event entries', function () { // Reworded.
                    // Type III: Ensure a clean state for the event listeners map.
                    activeCommChannel.eventListenersMap = {};
                    verify(activeCommChannel.eventListenersMap).to.eql({}, 'Event listeners map should be empty before this test.');

                    const uniqueEventIdentifier = 'uniqueAction';

                    activeCommChannel.addEventHandler(uniqueEventIdentifier, function () { return true; }); // First handler.
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(1, 'One event entry expected after first subscription.');

                    // Type III: Added a distinct function for the second handler.
                    activeCommChannel.addEventHandler(uniqueEventIdentifier, function () { return false; }); // Second handler for the same event.
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(1, 'Still one event entry expected after second subscription to the same event.');

                    // Type III: Verify that the internal structure holds multiple functions for the same event.
                    verify(Array.isArray(activeCommChannel.eventListenersMap[uniqueEventIdentifier])).to.be.true('Event handler should store an array of functions.');
                    verify(activeCommChannel.eventListenersMap[uniqueEventIdentifier].length).to.equal(2, 'Two handler functions should be registered under the single event key.');

                    activeCommChannel.removeEventHandler(uniqueEventIdentifier);
                    verify(utility.countProperties(activeCommChannel.eventListenersMap)).to.equal(0, 'Event listeners map should be empty after removal.');
                });
            });
        });
    });
});