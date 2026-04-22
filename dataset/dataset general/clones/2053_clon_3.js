globalThis.viewObserver = scrollMonitor;
globalThis.assertionLib = chai;
globalThis.assertExpect = assertionLib.expect;
globalThis.strictAssert = assertionLib.assert;
globalThis.fluentAssert = assertionLib.should();

// Configure the test framework for BDD style with an extended timeout.
testRunner.configure({
    ui: 'bdd',
    timeout: 5000 // Added a timeout to accommodate slower environments.
});

// Define a set of event identifiers used by the view observer.
const ITEM_VISIBILITY_CHANGE_EVT = 'elementVisibilityChange';
const ENTER_VIEW_ZONE_EVT = 'enterViewZone';
const FULLY_ENTER_VIEW_ZONE_EVT = 'fullyEnterViewZone';
const EXIT_VIEW_ZONE_EVT = 'exitViewZone';
const PARTIALLY_EXIT_VIEW_ZONE_EVT = 'partiallyExitViewZone';
const VIEW_LOCATION_UPDATE_EVT = 'viewLocationUpdate';
const TRACKER_STATE_UPDATE_EVT = 'trackerStateUpdate';

// Consolidate all recognized event names into an iterable array.
const knownEventNames = [
    ITEM_VISIBILITY_CHANGE_EVT,
    ENTER_VIEW_ZONE_EVT,
    FULLY_ENTER_VIEW_ZONE_EVT,
    EXIT_VIEW_ZONE_EVT,
    PARTIALLY_EXIT_VIEW_ZONE_EVT,
    VIEW_LOCATION_UPDATE_EVT,
    TRACKER_STATE_UPDATE_EVT
];

// Determine the most appropriate requestAnimationFrame implementation for smooth updates.
const animationFrameScheduler = globalThis.requestAnimationFrame ||
    globalThis.mozRequestAnimationFrame ||
    globalThis.webkitRequestAnimationFrame ||
    globalThis.msRequestAnimationFrame ||
    function (actionCallback) {
        // Fallback for environments without rAF, aiming for ~60fps (1000ms / 60 frames = ~16.6ms).
        setTimeout(actionCallback, 16);
    };

// Utility function to get the current height of the visible browser viewport.
const retrieveViewportHeight = () => {
    // Check various properties for maximum compatibility.
    return globalThis.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

// A wrapped requestAnimationFrame call that introduces a minor delay.
// This can help in debouncing or ensuring operations occur on the next logical tick.
const scheduleNextFrame = (operationCallback) => {
    // A small buffer before scheduling the actual animation frame.
    setTimeout(() => {
        animationFrameScheduler(operationCallback);
    }, 8); // Slightly increased delay from original 4ms.
};

// Locate or create a dedicated DOM element for test fixtures.
let testBedElement = document.getElementById('test-fixture-container');
if (!testBedElement) {
    testBedElement = document.createElement('div');
    testBedElement.id = 'test-fixture-container';
    document.body.appendChild(testBedElement);
    // Add some debugging styles for clarity during test execution.
    testBedElement.style.cssText = 'border: 1px dashed #cccccc; min-height: 15px; padding: 5px;';
}

let testElementDiv; // Variable to hold the dynamically created test element.

// Standard setup routine to prepare the DOM for each test.
const initializeTestEnvironment = (completionHandler) => {
    testElementDiv = document.createElement('div');
    testElementDiv.style.cssText = `
        position: absolute;
        top: 0px;
        left: 0px;
        width: 12px; /* Slightly different width */
        background-color: #696969; /* Changed color to dim gray */
        height: ${ (retrieveViewportHeight() * 2) }px;
        z-index: 1000; /* Ensure visibility over other elements */
    `;
    testBedElement.appendChild(testElementDiv);

    // Reset the document scroll position to the very top.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // More robust cross-browser scroll reset.

    // Allow the browser to process DOM changes and scroll events before proceeding.
    scheduleNextFrame(() => { completionHandler(); });
};

// Standard teardown routine to clean up the DOM after each test.
const cleanUpTestEnvironment = (completionHandler) => {
    testBedElement.innerHTML = ''; // Clear all child elements from the fixture.
    testBedElement.removeAttribute('style'); // Remove any inline styles applied to the fixture.

    // Reset the document scroll position again.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    scheduleNextFrame(() => { completionHandler(); });
};

// --- Test Suites for View Observer Functionality ---

describe('Core View Observer Module API', () => {

    it('the primary module object should expose its public interface.', () => {
        // Verify that the main viewObserver object provides expected methods.
        assertExpect(viewObserver).to.respondTo('createWatcher');
        assertExpect(viewObserver).to.respondTo('refreshAllWatchers');
        assertExpect(viewObserver).to.respondTo('recalculateTrackerPositions');

        // Verify that global viewport metrics are available and are numbers.
        assertExpect(viewObserver.currentViewportTop).to.be.a('number');
        assertExpect(viewObserver.currentViewportBottom).to.be.a('number');
        assertExpect(viewObserver.currentViewportHeight).to.be.a('number');
        assertExpect(viewObserver.totalDocumentHeight).to.be.a('number');
        // Added a new assertion for current scroll position.
        assertExpect(viewObserver.currentScrollPosition).to.be.a('number');
    });

    it('each watcher instance should provide a comprehensive API for interaction.', () => {
        // Create a sample watcher for API introspection.
        const activeWatcher = viewObserver.createWatcher(20); // Changed initial value from 10 to 20.

        // Check for event management methods.
        assertExpect(activeWatcher).to.respondTo('onEvent');
        assertExpect(activeWatcher).to.respondTo('offEvent');
        assertExpect(activeWatcher).to.respondTo('onceEvent');
        assertExpect(activeWatcher).to.respondTo('freezeTracking');
        assertExpect(activeWatcher).to.respondTo('resumeTracking');
        assertExpect(activeWatcher).to.respondTo('dispose');
        assertExpect(activeWatcher).to.respondTo('syncState');
        assertExpect(activeWatcher).to.respondTo('fireCallbacks');

        // Ensure convenience methods exist for all defined event types.
        for (const eventKind of knownEventNames) { // Changed from forEach to for...of loop.
            assertExpect(activeWatcher).to.respondTo(eventKind);
        }

        // Verify boolean flags indicating visibility status.
        assertExpect(activeWatcher.isCurrentlyVisible).to.be.a('boolean');
        assertExpect(activeWatcher.isFullyWithinView).to.be.a('boolean');
        assertExpect(activeWatcher.isAboveViewBoundary).to.be.a('boolean');
        assertExpect(activeWatcher.isBelowViewBoundary).to.be.a('boolean');

        // Verify numerical properties related to position and dimensions.
        assertExpect(activeWatcher.itemTopEdge).to.be.a('number');
        assertExpect(activeWatcher.itemBottomEdge).to.be.a('number');
        assertExpect(activeWatcher.itemHeight).to.be.a('number');
        assertExpect(activeWatcher.trackedElementRef).to.be.a('number'); // Renamed property.
        assertExpect(activeWatcher.boundaryOffsets).to.be.an('object'); // Renamed property.

        // Clean up the watcher after the test.
        activeWatcher.dispose();
    });
});

describe('Element Boundary Calculation', () => {

    it('should correctly calculate boundaries when initialized with numeric values.', () => {
        const firstSegment = viewObserver.createWatcher(30); // Changed value from 10 to 30.
        const secondSegment = viewObserver.createWatcher(45); // Changed value from 15 to 45.

        assertExpect(firstSegment.itemTopEdge).to.equal(30);
        assertExpect(secondSegment.itemTopEdge).to.equal(45);

        assertExpect(firstSegment.itemBottomEdge).to.equal(30);
        assertExpect(secondSegment.itemBottomEdge).to.equal(45);

        assertExpect(firstSegment.itemHeight).to.equal(0);
        assertExpect(secondSegment.itemHeight).to.equal(0);

        // Using fluent assertion style for variety.
        fluentAssert(firstSegment.boundaryOffsets).to.deep.equal({ top: 0, bottom: 0 });
        fluentAssert(secondSegment.boundaryOffsets).to.deep.equal({ top: 0, bottom: 0 });

        firstSegment.dispose();
        secondSegment.dispose();
    });

    it('should accurately determine boundaries from object literal definitions.', () => {
        const objectBasedWatcher = viewObserver.createWatcher({ top: 110, bottom: 115 }); // Changed values.
        // Added a guard clause to demonstrate Type III changes.
        if (!objectBasedWatcher) {
            strictAssert.fail("Watcher instance was not created successfully.");
            return;
        }

        assertExpect(objectBasedWatcher.itemTopEdge).to.equal(110);
        assertExpect(objectBasedWatcher.itemBottomEdge).to.equal(115);
        assertExpect(objectBasedWatcher.itemHeight).to.equal(5); // Adjusted based on new values.

        objectBasedWatcher.dispose();
    });

    it('should correctly interpret array-like structures (with index 0 as top/bottom).', () => {
        const arrayInputWatcher = viewObserver.createWatcher([25]); // Changed value from 10 to 25.

        assertExpect(arrayInputWatcher.itemTopEdge).to.equal(25);
        assertExpect(arrayInputWatcher.itemBottomEdge).to.equal(25);
        assertExpect(arrayInputWatcher.itemHeight).to.equal(0);

        arrayInputWatcher.dispose();
    });

    it('should correctly calculate dimensions and position for actual DOM elements.', () => {
        const dynamicSection = document.createElement('section'); // Changed element type from 'div' to 'section'.

        dynamicSection.style.cssText = `
            position: relative;
            top: 25px; /* Changed from 10px to 25px */
            width: 110px; /* Changed from 100px to 110px */
            height: 20px; /* Changed from 15px to 20px */
            background-color: #778899; /* Changed color to light slate gray hex */
            margin-left: 5px; /* Added margin for visual distinction. */
        `;

        testBedElement.appendChild(dynamicSection);
        const domElementWatcher = viewObserver.createWatcher(dynamicSection);

        const parentOffsetTop = testBedElement.offsetTop; // Renamed variable.
        assertExpect(domElementWatcher.itemTopEdge).to.equal(parentOffsetTop + 25);
        assertExpect(domElementWatcher.itemBottomEdge).to.equal(parentOffsetTop + 25 + 20);
        assertExpect(domElementWatcher.itemHeight).to.equal(20);

        domElementWatcher.dispose();
        testBedElement.innerHTML = ''; // Ensure fixture is clear.
    });
});

describe('Viewport Relative Boolean States', () => {
    beforeEach(initializeTestEnvironment);
    afterEach(cleanUpTestEnvironment);

    it('should correctly report if an element is fully contained within the viewport.', () => {
        const watcher = viewObserver.createWatcher(10);

        assertExpect(watcher.isCurrentlyVisible).to.equal(true);
        assertExpect(watcher.isFullyWithinView).to.equal(true);
        assertExpect(watcher.isAboveViewBoundary).to.equal(false);
        assertExpect(watcher.isBelowViewBoundary).to.equal(false);

        watcher.dispose();
    });

    it('should accurately identify an element partially below the viewport.', () => {
        const currentViewHeight = retrieveViewportHeight();
        const watcher = viewObserver.createWatcher({ top: currentViewHeight - 15, bottom: currentViewHeight + 15 }); // Changed offsets.
        // console.log(`Debug: Viewport Height: ${currentViewHeight}, Watcher: ${watcher.itemTopEdge}-${watcher.itemBottomEdge}`); // Example of Type III debug addition.

        assertExpect(watcher.isCurrentlyVisible).to.equal(true);
        assertExpect(watcher.isFullyWithinView).to.equal(false);
        assertExpect(watcher.isAboveViewBoundary).to.equal(false);
        assertExpect(watcher.isBelowViewBoundary).to.equal(true);

        watcher.dispose();
    });

    it('should accurately identify an element partially above the viewport after scrolling.', (completionFn) => {
        globalThis.scrollTo(0, 130); // Changed scroll amount.
        scheduleNextFrame(() => {
            const watcher = viewObserver.createWatcher({ top: 0, bottom: 230 }); // Changed bottom value.

            assertExpect(watcher.isCurrentlyVisible).to.equal(true);
            assertExpect(watcher.isFullyWithinView).to.equal(false);
            assertExpect(watcher.isAboveViewBoundary).to.equal(true);
            assertExpect(watcher.isBelowViewBoundary).to.equal(false);

            watcher.dispose();
            completionFn();
        });
    });

    it('should correctly report an element entirely positioned below the viewport.', () => {
        const currentViewHeight = retrieveViewportHeight();
        const watcher = viewObserver.createWatcher({ top: currentViewHeight + 25, bottom: currentViewHeight + 35 }); // Changed offsets.

        assertExpect(watcher.isCurrentlyVisible).to.equal(false);
        assertExpect(watcher.isFullyWithinView).to.equal(false);
        assertExpect(watcher.isAboveViewBoundary).to.equal(false);
        assertExpect(watcher.isBelowViewBoundary).to.equal(true);

        watcher.dispose();
    });

    it('should correctly report an element entirely positioned above the viewport after scrolling.', (completionFn) => {
        globalThis.scrollTo(0, 160); // Changed scroll amount.
        scheduleNextFrame(() => {
            const watcher = viewObserver.createWatcher({ top: 0, bottom: 25 }); // Changed bottom value.

            assertExpect(watcher.isCurrentlyVisible).to.equal(false);
            assertExpect(watcher.isFullyWithinView).to.equal(false);
            assertExpect(watcher.isAboveViewBoundary).to.equal(true);
            assertExpect(watcher.isBelowViewBoundary).to.equal(false);

            watcher.dispose();
            completionFn();
        });
    });

    it('should correctly identify a large element spanning the viewport and fully in view.', (completionFn) => {
        globalThis.scrollTo(0, 100);
        scheduleNextFrame(() => {
            const currentViewHeight = retrieveViewportHeight();
            const watcher = viewObserver.createWatcher({ top: 0, bottom: currentViewHeight + 250 }); // Changed bottom value.

            assertExpect(watcher.isCurrentlyVisible).to.equal(true);
            assertExpect(watcher.isFullyWithinView).to.equal(true);
            assertExpect(watcher.isAboveViewBoundary).to.equal(true);
            assertExpect(watcher.isBelowViewBoundary).to.equal(true);

            watcher.dispose();
            completionFn();
        });
    });
});

describe('Watcher Offset Configuration', () => {
    it('should default to zero offsets if none are explicitly provided.', () => {
        const watcher = viewObserver.createWatcher(10);
        fluentAssert(watcher.boundaryOffsets).to.deep.equal({ top: 0, bottom: 0 });
        watcher.dispose();
    });
    it('should apply a single numeric offset value to both top and bottom boundaries.', () => {
        const watcher = viewObserver.createWatcher(10, 22); // Changed offset value.
        fluentAssert(watcher.boundaryOffsets).to.deep.equal({ top: 22, bottom: 22 });
        watcher.dispose();
    });
    it('should apply only the top offset when specified as an object property.', () => {
        const watcher = viewObserver.createWatcher(10, { top: 18 }); // Changed offset value.
        fluentAssert(watcher.boundaryOffsets).to.deep.equal({ top: 18, bottom: 0 });
        watcher.dispose();
    });
    it('should apply only the bottom offset when specified as an object property.', () => {
        const watcher = viewObserver.createWatcher(10, { bottom: 28 }); // Changed offset value.
        fluentAssert(watcher.boundaryOffsets).to.deep.equal({ top: 0, bottom: 28 });
        watcher.dispose();
    });
    it('should apply distinct top and bottom offsets when provided in an object.', () => {
        const watcher = viewObserver.createWatcher(10, { top: 6, bottom: 11 }); // Changed offset values.
        fluentAssert(watcher.boundaryOffsets).to.deep.equal({ top: 6, bottom: 11 });
        watcher.dispose();
    });
});

describe('Event Callback Registration and Invocation', () => {
    const placeholderCallback = () => { /* A no-op function for testing callbacks. */ };

    it('should prepare empty callback storage arrays for all event types upon creation.', () => {
        const watcher = viewObserver.createWatcher(10);
        for (const eventKind of knownEventNames) {
            assertExpect(watcher.callbackStore[eventKind]).to.be.an('array'); // Renamed property.
            assertExpect(watcher.callbackStore[eventKind].length).to.equal(0);
        }
        watcher.dispose();
    });

    it('should successfully add event listeners to the callback store.', () => {
        const watcher = viewObserver.createWatcher(10);
        for (const eventKind of knownEventNames) {
            watcher.onEvent(eventKind, placeholderCallback); // Renamed method.
            assertExpect(watcher.callbackStore[eventKind].length).to.equal(1);
            assertExpect(watcher.callbackStore[eventKind][0].handler).to.equal(placeholderCallback); // Renamed property.
            assertExpect(watcher.callbackStore[eventKind][0].isSingleUse).to.equal(false); // Renamed property.
        }
        watcher.dispose();
    });

    it('should correctly remove previously added event listeners.', () => {
        const watcher = viewObserver.createWatcher(10);
        for (const eventKind of knownEventNames) {
            watcher.onEvent(eventKind, placeholderCallback);
            watcher.offEvent(eventKind, placeholderCallback); // Renamed method.
            assertExpect(watcher.callbackStore[eventKind].length).to.equal(0);
        }
        watcher.dispose();
    });

    it('should register "once" event listeners for single invocation and self-removal.', () => {
        const watcher = viewObserver.createWatcher(10);
        for (const eventKind of knownEventNames) {
            const testSpy = sinon.spy();
            watcher.onceEvent(eventKind, testSpy); // Renamed method.

            // Events like 'enterViewport' and 'fullyEnterViewport' trigger immediately if condition is met.
            if (eventKind === ENTER_VIEW_ZONE_EVT || eventKind === FULLY_ENTER_VIEW_ZONE_EVT) {
                assertExpect(watcher.callbackStore[eventKind].length).to.equal(0); // Should be removed.
                assertExpect(testSpy.called).to.equal(true);
            } else {
                assertExpect(watcher.callbackStore[eventKind].length).to.equal(1);
                assertExpect(testSpy.called).to.equal(false);
                assertExpect(watcher.callbackStore[eventKind][0].handler).to.equal(testSpy);
                assertExpect(watcher.callbackStore[eventKind][0].isSingleUse).to.equal(true);
            }
        }
        watcher.dispose();
    });

    it('should automatically trigger relevant listeners if conditions are met at creation time.', () => {
        const watcher = viewObserver.createWatcher(10);
        for (const eventKind of knownEventNames) {
            const testSpy = sinon.spy();
            watcher.onEvent(eventKind, testSpy);
            if (eventKind === ENTER_VIEW_ZONE_EVT || eventKind === FULLY_ENTER_VIEW_ZONE_EVT) {
                assertExpect(testSpy.calledOnce).to.equal(true); // Changed to 'calledOnce' for more specific assertion.
            } else {
                assertExpect(testSpy.called).to.equal(false);
            }
        }
        watcher.dispose();
    });
});

describe('Dynamic Event Triggers During Scroll Actions', () => {
    beforeEach(initializeTestEnvironment);
    afterEach(cleanUpTestEnvironment);

    it('should immediately invoke enterViewZone if the element is already visible.', () => {
        const watcher = viewObserver.createWatcher(testElementDiv);
        const eventSpy = sinon.spy();

        watcher.enterViewZone(eventSpy);
        assertExpect(eventSpy.called).to.equal(true);
        watcher.dispose();
    });

    it('should immediately trigger both enterViewZone and fullyEnterViewZone if element is entirely in view.', () => {
        testElementDiv.style.top = '0px'; // Ensure element is at the top.

        const watcher = viewObserver.createWatcher(10);
        const spyOne = sinon.spy();
        const spyTwo = sinon.spy();

        watcher.enterViewZone(spyOne);
        watcher.fullyEnterViewZone(spyTwo);
        assertExpect(spyOne.called).to.equal(true);
        assertExpect(spyTwo.called).to.equal(true);

        watcher.dispose();
    });

    it('should invoke exitViewZone immediately if the element is already scrolled above the viewport.', (completion) => {
        globalThis.scrollTo(0, 140); // Increased scroll amount.
        scheduleNextFrame(() => {
            const watcher = viewObserver.createWatcher(10);
            const eventSpy = sinon.spy();

            watcher.exitViewZone(eventSpy);
            assertExpect(eventSpy.called).to.equal(true);
            watcher.dispose(); // Added for consistent cleanup.
            completion();
        });
    });

    it('should invoke partiallyExitViewZone immediately if element is already scrolled above viewport.', (completion) => {
        globalThis.scrollTo(0, 150); // Increased scroll amount.
        scheduleNextFrame(() => {
            const watcher = viewObserver.createWatcher(10);
            const eventSpy = sinon.spy();

            watcher.partiallyExitViewZone(eventSpy);
            assertExpect(eventSpy.called).to.equal(true);
            watcher.dispose();
            completion();
        });
    });

    it('should trigger exitViewZone and partiallyExitViewZone when the element scrolls out of view.', (completion) => {
        const watcher = viewObserver.createWatcher(10);
        const spyOne = sinon.spy();
        const spyTwo = sinon.spy();

        watcher.exitViewZone(spyOne);
        watcher.partiallyExitViewZone(spyTwo);
        assertExpect(spyOne.called).to.equal(false);
        assertExpect(spyTwo.called).to.equal(false);

        globalThis.scrollTo(0, 220); // Increased scroll amount.
        scheduleNextFrame(() => {
            assertExpect(spyOne.called).to.equal(true);
            assertExpect(spyTwo.called).to.equal(true);
            watcher.dispose();
            completion();
        });
    });

    it('should trigger enterViewZone and fullyEnterViewZone when the element scrolls into view.', (completion) => {
        const initialPosition = retrieveViewportHeight() + 60; // Changed offset.
        const watcher = viewObserver.createWatcher(initialPosition);
        const spyOne = sinon.spy();
        const spyTwo = sinon.spy();

        watcher.enterViewZone(spyOne);
        watcher.fullyEnterViewZone(spyTwo);
        assertExpect(spyOne.called).to.equal(false);
        assertExpect(spyTwo.called).to.equal(false);

        globalThis.scrollTo(0, 70); // Changed scroll amount.
        scheduleNextFrame(() => {
            assertExpect(spyOne.called).to.equal(true);
            assertExpect(spyTwo.called).to.equal(true);
            watcher.dispose();
            completion();
        });
    });

    it('should only trigger partiallyExitViewZone when the element partially exits the viewport.', (completion) => {
        const watcher = viewObserver.createWatcher({ top: 25, bottom: 230 }); // Changed values.
        const spyOne = sinon.spy();
        const spyTwo = sinon.spy();

        watcher.exitViewZone(spyOne);
        watcher.partiallyExitViewZone(spyTwo);
        assertExpect(spyOne.called).to.equal(false);
        assertExpect(spyTwo.called).to.equal(false);

        globalThis.scrollTo(0, 120); // Changed scroll amount.
        scheduleNextFrame(() => {
            assertExpect(spyOne.called).to.equal(false);
            assertExpect(spyTwo.called).to.equal(true);
            watcher.dispose();
            completion();
        });
    });

    it('should only trigger enterViewZone when the element partially enters the viewport.', (completion) => {
        const initialTop = retrieveViewportHeight() + 70; // Changed offset.
        const initialBottom = (retrieveViewportHeight() * 2) + 130; // Changed offset.
        const watcher = viewObserver.createWatcher({ top: initialTop, bottom: initialBottom });
        const spyOne = sinon.spy();
        const spyTwo = sinon.spy();

        watcher.enterViewZone(spyOne);
        watcher.fullyEnterViewZone(spyTwo);
        assertExpect(spyOne.called).to.equal(false);
        assertExpect(spyTwo.called).to.equal(false);

        globalThis.scrollTo(0, retrieveViewportHeight() + 40); // Changed scroll amount.
        scheduleNextFrame(() => {
            assertExpect(spyOne.called).to.equal(true);
            assertExpect(spyTwo.called).to.equal(false);
            watcher.dispose();
            completion();
        });
    });
});