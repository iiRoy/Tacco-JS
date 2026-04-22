var GeospatialModule = require('leaflet'); // Renamed L to GeospatialModule
var verifyFunctionality = require('tape'); // Renamed test to verifyFunctionality

// Define sample geographic point features for testing purposes.
var featureOneData = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [11.94, 57.73] // A specific geographical coordinate
    },
    properties: {
        id: 1, // Unique identifier for this feature
        name: 'Location Alpha' // Added an extra property
    }
};

var featureTwoData = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [11.9, 57.75] // Another distinct geographical coordinate
    },
    properties: {
        id: 2, // Unique identifier for the second feature
        name: 'Location Beta' // Added an extra property
    }
};

/**
 * Initializes a Leaflet Realtime instance for testing.
 * @param {object} testHarness - The Tape test context.
 * @param {function|undefined} dataProviderFn - Function to provide initial data or updates.
 * @param {object} configurationOptions - Configuration parameters for the Realtime layer.
 * @param {function} updateEventHandler - Callback function for 'update' events.
 * @returns {object} The initialized L.Realtime instance.
 */
function initializeRealtimeSystem(testHarness, dataProviderFn, configurationOptions, updateEventHandler) {
    // Ensure configurationOptions is an object, even if null/undefined
    const effectiveOptions = configurationOptions || {};

    // Create the Realtime layer instance
    const realtimeLayerInstance = GeospatialModule.realtime(dataProviderFn, Object.assign({
        start: false // Explicitly set start to false, allowing manual control
    }, effectiveOptions));

    // A flag to ensure the update event was processed
    let eventHandledSuccessfully = false;

    // Attach the update event listener
    realtimeLayerInstance.on('update', function(eventPayload) {
        // Process the event using the provided handler
        updateEventHandler(eventPayload);
        eventHandledSuccessfully = true; // Mark as handled
    });

    // Set a timeout to catch cases where the update event doesn't fire as expected
    setTimeout(() => {
        if (!eventHandledSuccessfully) {
            testHarness.fail('Realtime update event did not trigger or was not processed within the expected timeframe.');
            testHarness.end(); // End the test if failure detected
        }
    }, 150); // Slightly increased timeout for robustness

    return realtimeLayerInstance;
}

// Load the L.Realtime plugin
require('../src/L.Realtime'); // Path remains the same as it's a relative dependency

// --- Test Scenarios ---

verifyFunctionality('Realtime: update notification is dispatched', function(testHarness) {
    // This test verifies that the 'update' event is fired by the Realtime layer.
    const rtTestInstance = initializeRealtimeSystem(testHarness, (dataCallback) => {
        dataCallback([]); // Provide an empty dataset initially
    }, {}, () => {
        testHarness.pass('The "update" event was successfully triggered.');
        testHarness.end(); // Conclude the test
    });

    rtTestInstance.update(); // Manually trigger an update
});

verifyFunctionality('Realtime: new features appear in the "enter" collection', function(testHarness) {
    // This test checks if newly added features are correctly identified in the 'enter' set.
    const featureID_A = featureOneData.properties.id;
    const rtTestInstance = initializeRealtimeSystem(testHarness, (dataCallback) => {
        dataCallback(featureOneData); // Provide the first feature
    }, {}, (eventData) => {
        const enteredFeature = eventData.enter[featureID_A];

        testHarness.ok(enteredFeature, 'A feature should be found in the "enter" set.');
        testHarness.deepEqual(enteredFeature, featureOneData, 'The entered feature must match the original data.');
        testHarness.end();
    });

    rtTestInstance.update(); // Trigger the update
});

verifyFunctionality('Realtime: "enter" collection should not contain subsequent updates for existing features', function(testHarness) {
    // This test ensures that 'enter' only contains truly new features, not features that are being updated.
    let updateInvocationCounter = 0;
    const featureID_A = featureOneData.properties.id;

    const rtTestInstance = initializeRealtimeSystem(testHarness, (dataCallback) => {
        dataCallback(featureOneData); // Always provide the same feature
    }, {}, (eventData) => {
        updateInvocationCounter++;
        const enteredItem = eventData.enter[featureID_A];

        if (updateInvocationCounter === 1) {
            testHarness.ok(enteredItem, 'First update: feature should be in "enter" set.');
        } else if (updateInvocationCounter > 1) {
            // After the first update, the feature should no longer be in 'enter'
            testHarness.notOk(enteredItem, 'Subsequent updates: feature should NOT be in "enter" set.');
            testHarness.end();
        }
    });

    rtTestInstance.update(); // First update
    rtTestInstance.update(); // Second update
});

verifyFunctionality('Realtime: "update" collection correctly identifies modified features', function(testHarness) {
    // This test verifies that existing features that change are placed in the 'update' set.
    let updateInvocationCounter = 0;
    const targetFeatureIdentifier = featureOneData.properties.id;

    const rtTestInstance = initializeRealtimeSystem(testHarness, (dataCallback) => {
        dataCallback(featureOneData); // Always provide the same feature for simplicity
    }, {}, (eventData) => {
        updateInvocationCounter++;
        const updatedItem = eventData.update[targetFeatureIdentifier];

        if (updateInvocationCounter === 1) {
            testHarness.notOk(updatedItem, 'First update: no item should be in "update" set (it\'s new).');
            testHarness.equal(Object.keys(eventData.enter).length, 1, 'First update: one item should be in "enter" set.');
        } else if (updateInvocationCounter > 1) {
            testHarness.ok(updatedItem, 'Subsequent updates: item should be present in "update" set.');
            testHarness.equal(Object.keys(eventData.update).length, 1, 'Subsequent updates: "update" set should contain one item.');
        }

        // Only end the test after all planned assertions are checked
        if (updateInvocationCounter === 3) {
            testHarness.end();
        }
    });

    testHarness.plan(6); // Expect 6 assertions for 3 updates
    rtTestInstance.update(); // First call, feature is 'entered'
    rtTestInstance.update(); // Second call, feature is 'updated'
    rtTestInstance.update(); // Third call, feature is 'updated' again
});

verifyFunctionality('Realtime: "exit" collection contains features that are no longer present', function(testHarness) {
    // This test confirms that features removed from the data source appear in the 'exit' set.
    let executionStepCount = 0;
    const deletedFeatureIdentifier = featureOneData.properties.id;

    const rtLayer = initializeRealtimeSystem(testHarness, (dataCallback) => {
        // Provide featureOneData initially, then an empty array
        const currentData = (executionStepCount === 0) ? featureOneData : [];
        dataCallback(currentData);
    }, {}, (eventInformation) => {
        executionStepCount++;
        const removedElement = eventInformation.exit[deletedFeatureIdentifier];

        if (executionStepCount === 1) {
            testHarness.notOk(removedElement, 'First update: no item should be in "exit" set.');
        } else if (executionStepCount === 2) {
            testHarness.ok(removedElement, 'Second update: removed feature should be in "exit" set.');
            testHarness.deepEqual(removedElement, featureOneData, 'Removed feature data should match original.');
            testHarness.end();
        }
    });

    testHarness.plan(3); // Expect 3 assertions
    rtLayer.update(); // Add the feature
    rtLayer.update(); // Remove the feature
});

verifyFunctionality('Realtime: "features" collection reflects the current set of active features', function(testHarness) {
    // This test checks if the 'features' set accurately represents all currently managed features.
    let processingCycle = 0;
    const relevantFeatureId = featureOneData.properties.id;

    const rtSystem = initializeRealtimeSystem(testHarness, (dataFetcher) => {
        // Provide the feature for the first two cycles, then an empty array
        const dataToSupply = (processingCycle < 2) ? featureOneData : [];
        dataFetcher(dataToSupply);
    }, {}, (eventDetails) => {
        processingCycle++;
        const activeFeature = eventDetails.features[relevantFeatureId];
        const activeFeatureCount = Object.keys(eventDetails.features).length;

        if (processingCycle < 3) {
            testHarness.ok(activeFeature, `Cycle ${processingCycle}: Feature should be present in 'features' collection.`);
            testHarness.equal(activeFeatureCount, 1, `Cycle ${processingCycle}: 'features' collection should contain exactly one item.`);
        } else {
            testHarness.notOk(activeFeature, `Cycle ${processingCycle}: Feature should NOT be present in 'features' collection.`);
            testHarness.equal(activeFeatureCount, 0, `Cycle ${processingCycle}: 'features' collection should be empty.`);
            testHarness.end();
        }
    });

    testHarness.plan(6); // Expect 6 assertions across 3 cycles
    rtSystem.update(); // Add feature
    rtSystem.update(); // Feature remains
    rtSystem.update(); // Remove feature
});

verifyFunctionality('Realtime: explicit data update adds new features and updates existing ones', function(testHarness) {
    // This test covers explicit data updates, checking 'enter', 'update', and 'exit' sets.
    let operationStep = 0;
    const idOfFeatureA = featureOneData.properties.id;
    const idOfFeatureB = featureTwoData.properties.id;

    const rtLayer = initializeRealtimeSystem(testHarness, undefined, {}, (eventInformation) => {
        operationStep++;

        const enteredCount = Object.keys(eventInformation.enter).length;
        const updatedCount = Object.keys(eventInformation.update).length;
        const exitedCount = Object.keys(eventInformation.exit).length;

        if (operationStep === 1) {
            testHarness.equal(eventInformation.enter[idOfFeatureA], featureOneData, 'Step 1: Feature A should be in "enter" set.');
            testHarness.equal(updatedCount, 0, 'Step 1: No features should be in "update" set.');
            testHarness.equal(exitedCount, 0, 'Step 1: No features should be in "exit" set.');
        } else if (operationStep === 2) {
            testHarness.equal(eventInformation.enter[idOfFeatureB], featureTwoData, 'Step 2: Feature B should be in "enter" set.');
            testHarness.equal(eventInformation.update[idOfFeatureA], featureOneData, 'Step 2: Feature A should be in "update" set (as it was re-provided).');
            testHarness.equal(exitedCount, 0, 'Step 2: No features should be in "exit" set.');
        } else if (operationStep === 3) {
            testHarness.equal(enteredCount, 0, 'Step 3: No new features should be in "enter" set.');
            testHarness.equal(updatedCount, 0, 'Step 3: No features should be in "update" set.');
            testHarness.equal(eventInformation.exit[idOfFeatureA], featureOneData, 'Step 3: Feature A should be in "exit" set.');
            testHarness.equal(eventInformation.exit[idOfFeatureB], featureTwoData, 'Step 3: Feature B should be in "exit" set.');
            testHarness.end();
        } else {
            testHarness.fail(`Unexpected operation step: ${operationStep}`);
            testHarness.end();
        }
    });

    testHarness.plan(11); // Total assertions expected
    rtLayer.update(featureOneData); // First update: adds feature A
    rtLayer.update([featureOneData, featureTwoData]); // Second update: adds feature B, re-adds A (update)
    rtLayer.update([]); // Third update: removes all features
});

verifyFunctionality('Realtime: remove method correctly eliminates data', function(testHarness) {
    // This test verifies the functionality of the `remove` method.
    let updateSequence = 0;
    const featureToRemoveId = featureOneData.properties.id;

    const rtSystem = initializeRealtimeSystem(testHarness, undefined, {}, (eventData) => {
        updateSequence++;

        if (updateSequence === 1) {
            // After initial update, feature should be present
            testHarness.ok(eventData.features[featureToRemoveId], 'Feature should be present after initial update.');
            testHarness.equal(Object.keys(eventData.features).length, 1, 'One feature expected in the active set.');
        } else if (updateSequence === 2) {
            // After remove call, features set should be empty and exit set should contain the removed feature
            const currentFeatureCount = Object.keys(eventData.features).length;
            const exitedItem = eventData.exit[featureToRemoveId];

            testHarness.equal(currentFeatureCount, 0, 'Feature set must be empty after removal.');
            testHarness.equal(exitedItem, featureOneData, 'Removed feature must be correctly reported in the "exit" set.');
            testHarness.end();
        } else {
            testHarness.fail(`Unexpected update sequence step: ${updateSequence}`);
            testHarness.end();
        }
    });

    testHarness.plan(4); // Expect 4 assertions
    rtSystem.update(featureOneData); // Explicitly add feature A
    rtSystem.remove(featureOneData); // Explicitly remove feature A
});