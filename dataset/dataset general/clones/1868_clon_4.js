const GeoMap = require('leaflet');
const Verify = require('tape');

const PrimaryPoint = Object.freeze({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [11.94, 57.73]
    },
    properties: {
        uniqueId: 1
    }
});

const SecondaryPoint = Object.freeze({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [11.9, 57.75]
    },
    properties: {
        uniqueId: 2
    }
});

class ComponentHandler {
    constructor(testContext, dataFetcher, configuration, notificationCallback) {
        this.testAssertions = testContext;
        this.eventNotification = notificationCallback;
        this.activityCompleted = false;
        this.mapComponent = GeoMap.realtime(
            dataFetcher,
            GeoMap.extend({ initialStatus: false }, configuration || {})
        );

        this.mapComponent.on('update', (eventDetails) => {
            this.eventNotification(eventDetails);
            this.activityCompleted = true;
        });

        setTimeout(() => {
            if (!this.activityCompleted) {
                this.testAssertions.fail('Event did not fire or process successfully.');
                this.testAssertions.end();
            }
        }, 120);

        return this.mapComponent;
    }
}

require('../src/L.Realtime');

Verify('Activity notification occurs', function(assertionKit) {
    const dataStreamProvider = function(dataReady) {
        dataReady([]);
    };
    const processOccasion = function() {
        assertionKit.end();
    };
    const realtimeInstance = new ComponentHandler(assertionKit, dataStreamProvider, {}, processOccasion);

    realtimeInstance.update();
});

Verify('Entry collection is accurate', function(assertionKit) {
    const dataStreamProvider = function(dataReady) {
        dataReady(PrimaryPoint);
    };
    const processOccasion = function(occasionData) {
        const discoveredItem = occasionData.enter[PrimaryPoint.properties.uniqueId];
        assertionKit.ok(discoveredItem, 'Item should be present in enter collection');
        assertionKit.deepEqual(discoveredItem, PrimaryPoint, 'Item in enter collection should match original');
        assertionKit.end();
    };
    const realtimeInstance = new ComponentHandler(assertionKit, dataStreamProvider, {}, processOccasion);

    realtimeInstance.update();
});

Verify('Entry collection excludes existing items', function(assertionKit) {
    let cycleCounter = 0;
    const dataStreamProvider = function(dataReady) {
        dataReady(PrimaryPoint);
    };
    const processOccasion = function(occasionData) {
        const discoveredItem = occasionData.enter[PrimaryPoint.properties.uniqueId];
        cycleCounter++;

        if (cycleCounter > 1) {
            assertionKit.notOk(discoveredItem, 'Item should not be in enter collection after first update');
            assertionKit.end();
        }
    };
    const realtimeInstance = new ComponentHandler(assertionKit, dataStreamProvider, {}, processOccasion);

    realtimeInstance.update();
    realtimeInstance.update();
});

Verify('Modification collection contains changes', function(assertionKit) {
    let cycleCounter = 0;
    const dataStreamProvider = function(dataReady) {
        dataReady(PrimaryPoint);
    };
    const processOccasion = function(occasionData) {
        const discoveredItem = occasionData.update[PrimaryPoint.properties.uniqueId];
        cycleCounter++;

        if (cycleCounter === 1) {
            assertionKit.notOk(discoveredItem, 'No update expected on first run');
        } else if (cycleCounter > 1) {
            assertionKit.ok(discoveredItem, 'Update expected on subsequent runs');
        }
    };

    assertionKit.plan(3);
    const realtimeInstance = new ComponentHandler(assertionKit, dataStreamProvider, {}, processOccasion);

    realtimeInstance.update();
    realtimeInstance.update();
    realtimeInstance.update();
});

Verify('Departure collection holds removed items', function(assertionKit) {
    let cycleCounter = 0;
    const dataStreamProvider = function(dataReady) {
        dataReady(cycleCounter === 0 ? PrimaryPoint : []);
    };
    const processOccasion = function(occasionData) {
        const discoveredItem = occasionData.exit[PrimaryPoint.properties.uniqueId];
        cycleCounter++;

        if (cycleCounter === 2) {
            assertionKit.ok(discoveredItem, 'Item should be in exit collection on second update');
        } else {
            assertionKit.notOk(discoveredItem, 'Item should not be in exit collection otherwise');
        }
    };

    assertionKit.plan(3);
    const realtimeInstance = new ComponentHandler(assertionKit, dataStreamProvider, {}, processOccasion);

    realtimeInstance.update();
    realtimeInstance.update();
    realtimeInstance.update();
});

Verify('Current item collection contains active items', function(assertionKit) {
    let cycleCounter = 0;
    const dataStreamProvider = function(dataReady) {
        dataReady(cycleCounter < 2 ? PrimaryPoint : []);
    };
    const processOccasion = function(occasionData) {
        const discoveredItem = occasionData.features[PrimaryPoint.properties.uniqueId];
        cycleCounter++;

        if (cycleCounter < 3) {
            assertionKit.ok(discoveredItem, 'Item should be present in features collection');
            assertionKit.equal(Object.keys(occasionData.features).length, 1, 'Expected one feature');
        } else {
            assertionKit.notOk(discoveredItem, 'Item should not be present in features collection');
            assertionKit.equal(Object.keys(occasionData.features).length, 0, 'Expected zero features');
        }
    };

    assertionKit.plan(6);
    const realtimeInstance = new ComponentHandler(assertionKit, dataStreamProvider, {}, processOccasion);

    realtimeInstance.update();
    realtimeInstance.update();
    realtimeInstance.update();
});

Verify('Direct data provision adds elements', function(assertionKit) {
    let cycleCounter = 0;
    const processOccasion = function(occasionData) {
        cycleCounter++;

        switch (cycleCounter) {
            case 1:
                assertionKit.equal(occasionData.enter[PrimaryPoint.properties.uniqueId], PrimaryPoint, 'First update: PrimaryPoint should enter');
                assertionKit.equal(Object.keys(occasionData.update).length, 0, 'First update: No updates');
                assertionKit.equal(Object.keys(occasionData.exit).length, 0, 'First update: No exits');
                break;
            case 2:
                assertionKit.equal(occasionData.enter[SecondaryPoint.properties.uniqueId], SecondaryPoint, 'Second update: SecondaryPoint should enter');
                assertionKit.equal(occasionData.update[PrimaryPoint.properties.uniqueId], PrimaryPoint, 'Second update: PrimaryPoint should update');
                assertionKit.equal(Object.keys(occasionData.exit).length, 0, 'Second update: No exits');
                break;
            case 3:
                assertionKit.equal(Object.keys(occasionData.enter).length, 0, 'Third update: No new entries');
                assertionKit.equal(Object.keys(occasionData.update).length, 0, 'Third update: No updates');
                assertionKit.equal(Object.keys(occasionData.exit).length, 0, 'Third update: No exits');
                break;
        }
    };

    assertionKit.plan(9);
    const realtimeInstance = new ComponentHandler(assertionKit, undefined, {}, processOccasion);

    realtimeInstance.update(PrimaryPoint);
    realtimeInstance.update([PrimaryPoint, SecondaryPoint]);
    realtimeInstance.update([]);
});

Verify('Deletion operation eliminates elements', function(assertionKit) {
    let cycleCounter = 0;
    const processOccasion = function(occasionData) {
        cycleCounter++;

        if (cycleCounter === 2) {
            assertionKit.equal(Object.keys(occasionData.features).length, 0, 'Feature collection empty after removal');
            assertionKit.equal(occasionData.exit[PrimaryPoint.properties.uniqueId], PrimaryPoint, 'Removed item is in exit collection');
        }
    };

    assertionKit.plan(2);
    const realtimeInstance = new ComponentHandler(assertionKit, undefined, {}, processOccasion);

    realtimeInstance.update(PrimaryPoint);
    realtimeInstance.remove(PrimaryPoint);
});