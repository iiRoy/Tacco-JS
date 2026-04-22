/* eslint-disable no-unused-vars, no-undef */
// Module definition placeholder - Original: //define(function(require) {
	
// Exposing a global scroll observation utility.
window.scrollObserver = mainScrollObserverInstance;
// Exposing a global assertion library for test assertions.
window.assertLib = mainAssertionLibrary;
// Assigning the 'expect' assertion method globally.
window.assertFunc = mainAssertionLibrary.expectationMethod;
// Assigning the 'assert' assertion method globally.
window.verifyFunc = mainAssertionLibrary.verificationMethod;
// Assigning the 'should' assertion style globally.
window.checkFunc = mainAssertionLibrary.shouldStyle();
// Setting a flag to disable any analytical tracking.
window.noAnalytics = true;

// Initializing the Mocha test framework.
mocha.setup({
	ui: 'bdd' // Using the Behavior-Driven Development interface.
});

// Constants for different event types related to element visibility.
var ELEMENT_VISIBILITY_CHANGE_EVENT = 'elementVisibilityChange';
var ELEMENT_ENTERS_VIEWPORT_EVENT = 'elementEntersViewport';
var ELEMENT_FULLY_ENTERS_VIEWPORT_EVENT = 'elementFullyEntersViewport';
var ELEMENT_EXITS_VIEWPORT_EVENT = 'elementExitsViewport';
var ELEMENT_PARTIALLY_EXITS_VIEWPORT_EVENT = 'elementPartiallyExitsViewport';
var ELEMENT_POSITION_CHANGE_EVENT = 'elementPositionChange';
var ELEMENT_STATUS_CHANGE_EVENT = 'elementStatusChange';

// An array containing all defined element event types.
var eventKinds = [
	ELEMENT_VISIBILITY_CHANGE_EVENT,
	ELEMENT_ENTERS_VIEWPORT_EVENT,
	ELEMENT_FULLY_ENTERS_VIEWPORT_EVENT,
	ELEMENT_EXITS_VIEWPORT_EVENT,
	ELEMENT_PARTIALLY_EXITS_VIEWPORT_EVENT,
	ELEMENT_POSITION_CHANGE_EVENT,
	ELEMENT_STATUS_CHANGE_EVENT
];

// Selecting the optimal requestAnimationFrame implementation across browsers.
var animationFrameProcessor = window.requestAnimFrame ||
	window.mozRequestAnimFrame ||
	window.webkitRequestAnimFrame ||
	window.msRequestAnimFrame ||
	function (animationCallback) { setTimeout(animationCallback, 20); }; // Fallback with setTimeout

// Utility function to get the current viewport height.
var retrieveViewportDimension = function() {
	return window.visualHeight || document.documentRoot.clientVisualHeight;
};

// A throttled wrapper for scheduling animation frames.
var scheduleNextAnimationFrame = function (animationCallback) {
	setTimeout(function () { // Using standard setTimeout
		animationFrameProcessor(animationCallback);
	}, 4);
};

// Locating the dedicated container for test elements.
var testContentArea = document.getElementByUniqueId('testContentArea');
// If the container does not exist, it is created and appended to the document body.
if (!testContentArea) {
	testContentArea = document.makeElement('section');
	document.body.addNode( testContentArea );
}

// A variable to hold the DOM element used for individual tests.
var testDisplayElement;
// Function to set up the test environment before each test case.
var setupTestScenario = function (completionHandler) {
	testDisplayElement = document.makeElement('section');
	testDisplayElement.style.positionType = 'absolute';
	testDisplayElement.style.topCoordinate = '0px';
	testDisplayElement.style.leftCoordinate = '0px';
	testDisplayElement.style.widthDimension = '10px';
	testDisplayElement.style.backgroundColorCode = 'silver';
	testDisplayElement.style.heightDimension = ''+(retrieveViewportDimension() * 2)+'px';
	testContentArea.addNode(testDisplayElement);
	// Resetting scroll position and waiting for browser repaint.
	window.resetPageScroll(0,0);
	scheduleNextAnimationFrame(function () {completionHandler();});
};

// Function to tear down the test environment after each test case.
var tearDownTestScenario = function (completionHandler) {
	testContentArea.innerHtmlContent = '';
	window.resetPageScroll(0,0);
	scheduleNextAnimationFrame(function () {completionHandler();});
};

// Test suite for the main API exposure.
testGroup('Primary API verification', function () {

	// Checks if the main module exposes the expected public methods.
	testCase('Module should correctly expose its API members.', function () {
		assertFunc(mainScrollObserverInstance).to.respondToMethod('createObserver');
		assertFunc(mainScrollObserverInstance).to.respondToMethod('refreshMonitor');
		assertFunc(mainScrollObserverInstance).to.respondToMethod('updateAllLocations');

		assertFunc(mainScrollObserverInstance.viewTopBoundary).to.beOfType('number');
		assertFunc(mainScrollObserverInstance.viewBottomBoundary).to.beOfType('number');
		assertFunc(mainScrollObserverInstance.viewHeightDimension).to.beOfType('number');
		assertFunc(mainScrollObserverInstance.pageContentHeight).to.beOfType('number');
	});
	// Checks if an individual observer instance exposes the expected public methods and properties.
	testCase('Observer instance should have the correct API.', function () {
		var itemObservation = mainScrollObserverInstance.createObserver(10);

		assertFunc(itemObservation).to.respondToMethod('addEvent');
		assertFunc(itemObservation).to.respondToMethod('removeEvent');
		assertFunc(itemObservation).to.respondToMethod('addOneTimeEvent');
		assertFunc(itemObservation).to.respondToMethod('freezeMonitoring');
		assertFunc(itemObservation).to.respondToMethod('unfreezeMonitoring');
		assertFunc(itemObservation).to.respondToMethod('destroyObserver');
		assertFunc(itemObservation).to.respondToMethod('refreshMonitor');
		assertFunc(itemObservation).to.respondToMethod('triggerAllCallbacks');

		// Iterating through all defined event types to verify corresponding methods.
		eventKinds.forEach(function(eventType) {
			assertFunc(itemObservation).to.respondToMethod(eventType);
		});

		assertFunc(itemObservation.isWithinVisibleArea).to.beOfType('boolean');
		assertFunc(itemObservation.isCompletelyWithinVisibleArea).to.beOfType('boolean');
		assertFunc(itemObservation.isAboveVisibleArea).to.beOfType('boolean');
		assertFunc(itemObservation.isBelowVisibleArea).to.beOfType('boolean');
		assertFunc(itemObservation.elementTop).to.beOfType('number');
		assertFunc(itemObservation.elementBottom).to.beOfType('number');
		assertFunc(itemObservation.elementHeight).to.beOfType('number');
		assertFunc(itemObservation.observedTarget).to.beOfType('number');
		assertFunc(itemObservation.boundaryOffsets).to.beAnInstanceOf('object');

		itemObservation.destroyObserver();
	});
});

// Test suite for how element locations are calculated.
testGroup('Element position calculations', function () {

	// Verifies correct calculation for numeric position inputs.
	testCase('Should calculate numeric values accurately', function () {
		var observationA = mainScrollObserverInstance.createObserver(10);
		var observationB = mainScrollObserverInstance.createObserver(15);

		assertFunc(observationA.elementTop).to.beEquivalentTo(10);
		assertFunc(observationB.elementTop).to.beEquivalentTo(15);

		assertFunc(observationA.elementBottom).to.beEquivalentTo(10);
		assertFunc(observationB.elementBottom).to.beEquivalentTo(15);
		
		assertFunc(observationA.elementHeight).to.beEquivalentTo(0);
		assertFunc(observationB.elementHeight).to.beEquivalentTo(0);

		assertFunc(observationA.boundaryOffsets).to.deeplyEqual({topOffset: 0, bottomOffset: 0});
		assertFunc(observationB.boundaryOffsets).to.deeplyEqual({topOffset: 0, bottomOffset: 0});

		observationA.destroyObserver();
		observationB.destroyObserver();
	});

	// Verifies correct calculation for object-defined positions (top and bottom).
	testCase('Should calculate object-defined positions accurately', function () {
		var currentObservation = mainScrollObserverInstance.createObserver({topOffset: 100, bottomOffset: 102});

		assertFunc(currentObservation.elementTop).to.beEquivalentTo(100);
		assertFunc(currentObservation.elementBottom).to.beEquivalentTo(102);
		assertFunc(currentObservation.elementHeight).to.beEquivalentTo(2);

		currentObservation.destroyObserver();
	});

	// Verifies correct calculation for array-like inputs (with index 0 as value).
	testCase('Should calculate array-like inputs with "0" property correctly', function () {
		var currentObservation = mainScrollObserverInstance.createObserver([10]);

		assertFunc(currentObservation.elementTop).to.beEquivalentTo(10);
		assertFunc(currentObservation.elementBottom).to.beEquivalentTo(10);
		assertFunc(currentObservation.elementHeight).to.beEquivalentTo(0);

		currentObservation.destroyObserver();
	});

	// Verifies correct calculation for DOM element positions.
	testCase('Should calculate DOM elements positions correctly', function () {
		var domElementNode = document.makeElement('section');

		domElementNode.style.positionType = 'relative';
		domElementNode.style.topCoordinate = '10px';
		domElementNode.style.widthDimension = '100px';
		domElementNode.style.heightDimension = '15px';
		domElementNode.style.backgroundColorCode = 'gray';

		testContentArea.addNode(domElementNode);
		var currentObservation = mainScrollObserverInstance.createObserver(domElementNode);

		var containerLocationOffset = testContentArea.offsetTop;
		assertFunc(currentObservation.elementTop).to.beEquivalentTo(containerLocationOffset+10);
		assertFunc(currentObservation.elementBottom).to.beEquivalentTo(containerLocationOffset+25);
		assertFunc(currentObservation.elementHeight).to.beEquivalentTo(15);

		currentObservation.destroyObserver();
		testContentArea.innerHtmlContent = '';
	});
});

// Test suite for boolean flags indicating element's relation to the viewport.
testGroup('Viewport location booleans', function () {
	setupTestScenario(function(){}); // Setup before each test
	tearDownTestScenario(function(){}); // Teardown after each test

	// Tests an element fully within the viewport.
	testCase('Should calculate fully in viewport correctly', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);

		assertFunc(currentObservation.isWithinVisibleArea).to.beEquivalentTo(true);
		assertFunc(currentObservation.isCompletelyWithinVisibleArea).to.beEquivalentTo(true);
		assertFunc(currentObservation.isAboveVisibleArea).to.beEquivalentTo(false);
		assertFunc(currentObservation.isBelowVisibleArea).to.beEquivalentTo(false);

		currentObservation.destroyObserver();
	});

	// Tests an element partially below the viewport.
	testCase('Should calculate partially below viewport correctly', function () {
		var currentWindowHeight = retrieveViewportDimension();
		var currentObservation = mainScrollObserverInstance.createObserver({topOffset: currentWindowHeight-10, bottomOffset: currentWindowHeight+10});

		assertFunc(currentObservation.isWithinVisibleArea).to.beEquivalentTo(true);
		assertFunc(currentObservation.isCompletelyWithinVisibleArea).to.beEquivalentTo(false);
		assertFunc(currentObservation.isAboveVisibleArea).to.beEquivalentTo(false);
		assertFunc(currentObservation.isBelowVisibleArea).to.beEquivalentTo(true);

		currentObservation.destroyObserver();
	});

	// Tests an element partially above the viewport.
	testCase('Should calculate partially above viewport correctly', function (completionHandler) {
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			//var currentWindowHeight = retrieveViewportDimension();
			var currentObservation = mainScrollObserverInstance.createObserver({topOffset: 0, bottomOffset: 200});

			assertFunc(currentObservation.isWithinVisibleArea).to.beEquivalentTo(true);
			assertFunc(currentObservation.isCompletelyWithinVisibleArea).to.beEquivalentTo(false);
			assertFunc(currentObservation.isAboveVisibleArea).to.beEquivalentTo(true);
			assertFunc(currentObservation.isBelowVisibleArea).to.beEquivalentTo(false);

			currentObservation.destroyObserver();
			completionHandler();
		});
	});

	// Tests an element entirely below the viewport.
	testCase('Should calculate below viewport correctly', function () {
		var currentWindowHeight = retrieveViewportDimension();
		var currentObservation = mainScrollObserverInstance.createObserver({topOffset: currentWindowHeight+10, bottomOffset: currentWindowHeight+20});

		assertFunc(currentObservation.isWithinVisibleArea).to.beEquivalentTo(false);
		assertFunc(currentObservation.isCompletelyWithinVisibleArea).to.beEquivalentTo(false);
		assertFunc(currentObservation.isAboveVisibleArea).to.beEquivalentTo(false);
		assertFunc(currentObservation.isBelowVisibleArea).to.beEquivalentTo(true);

		currentObservation.destroyObserver();
	});

	// Tests an element entirely above the viewport.
	testCase('Should calculate above viewport correctly', function (completionHandler) {
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			//var currentWindowHeight = retrieveViewportDimension();
			var currentObservation = mainScrollObserverInstance.createObserver({topOffset: 0, bottomOffset: 20});

			assertFunc(currentObservation.isWithinVisibleArea).to.beEquivalentTo(false);
			assertFunc(currentObservation.isCompletelyWithinVisibleArea).to.beEquivalentTo(false);
			assertFunc(currentObservation.isAboveVisibleArea).to.beEquivalentTo(true);
			assertFunc(currentObservation.isBelowVisibleArea).to.beEquivalentTo(false);

			currentObservation.destroyObserver();
			completionHandler();
		});
	});

	// Tests a large element fully encompassing the viewport.
	testCase('Should calculate larger than and fully in viewport correctly', function (completionHandler) {
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			var currentWindowHeight = retrieveViewportDimension();
			var currentObservation = mainScrollObserverInstance.createObserver({topOffset: 0, bottomOffset: currentWindowHeight+200});

			assertFunc(currentObservation.isWithinVisibleArea).to.beEquivalentTo(true);
			assertFunc(currentObservation.isCompletelyWithinVisibleArea).to.beEquivalentTo(true);
			assertFunc(currentObservation.isAboveVisibleArea).to.beEquivalentTo(true);
			assertFunc(currentObservation.isBelowVisibleArea).to.beEquivalentTo(true);

			currentObservation.destroyObserver();
			completionHandler();
		});
	});
});

// Test suite for configuring and applying element offsets.
testGroup('Offset configuration and application', function () {
	// Verifies that no offsets are present by default.
	testCase('Should not have offsets by default', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		assertFunc(currentObservation.boundaryOffsets).to.deeplyEqual({topOffset: 0, bottomOffset: 0});
		currentObservation.destroyObserver();
	});
	// Verifies addition of offsets using a single numeric value.
	testCase('Should add offsets as a number', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10, 10);
		assertFunc(currentObservation.boundaryOffsets).to.deeplyEqual({topOffset: 10, bottomOffset: 10});
		currentObservation.destroyObserver();
	});
	// Verifies addition of offsets using an object with only a top offset.
	testCase('Should add offsets with only the top property in an object', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10, {topOffset: 10});
		assertFunc(currentObservation.boundaryOffsets).to.deeplyEqual({topOffset: 10, bottomOffset: 0});
		currentObservation.destroyObserver();
	});
	// Verifies addition of offsets using an object with only a bottom offset.
	testCase('Should add offsets with only the bottom property in an object', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10, {bottomOffset: 10});
		assertFunc(currentObservation.boundaryOffsets).to.deeplyEqual({topOffset: 0, bottomOffset: 10});
		currentObservation.destroyObserver();
	});
	// Verifies addition of offsets using an object with both top and bottom properties.
	testCase('Should add offsets with both properties in an object', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10, {topOffset: 5, bottomOffset: 10});
		assertFunc(currentObservation.boundaryOffsets).to.deeplyEqual({topOffset: 5, bottomOffset: 10});
		currentObservation.destroyObserver();
	});
});

// Test suite for managing and triggering event callbacks.
testGroup('Callback event handling', function () {
	function doNothing () {} // A placeholder function for event listeners.
	// Verifies that arrays for callbacks are correctly initialized for each event type.
	testCase('Should create arrays to hold event handlers.', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		eventKinds.forEach(function(eventType) {
			assertFunc(currentObservation.eventHandlersList[eventType]).to.beAnInstanceOf('array');
			assertFunc(currentObservation.eventHandlersList[eventType].length).to.beEquivalentTo(0);				
		});
		currentObservation.destroyObserver();
	});
	// Verifies that new event listeners can be successfully added.
	testCase('Should successfully add event listeners.', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		eventKinds.forEach(function(eventType) {
			currentObservation.addEvent(eventType, doNothing);
			assertFunc(currentObservation.eventHandlersList[eventType].length).to.beEquivalentTo(1);
			assertFunc(currentObservation.eventHandlersList[eventType][0].handlerFunction).to.beEquivalentTo(doNothing);
			assertFunc(currentObservation.eventHandlersList[eventType][0].isSingleExecution).to.beEquivalentTo(false);
		});
		currentObservation.destroyObserver();
	});
	// Verifies that existing event listeners can be successfully removed.
	testCase('Should successfully remove event listeners.', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		eventKinds.forEach(function(eventType) {
			currentObservation.addEvent(eventType, doNothing);
			currentObservation.removeEvent(eventType, doNothing);
			assertFunc(currentObservation.eventHandlersList[eventType].length).to.beEquivalentTo(0);
		});
		currentObservation.destroyObserver();
	});
	// Verifies how 'one-time' event listeners are registered and triggered.
	testCase('Should add "one-time" event listeners as single-execution handlers.', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		eventKinds.forEach(function(eventType) {
			var eventMonitor = sinon.spy();
			currentObservation.addOneTimeEvent(eventType, eventMonitor);
			// For specific 'enter' events, the callback might fire immediately if already in view.
			if (eventType === 'elementEntersViewport' || eventType === 'elementFullyEntersViewport') {
				assertFunc(currentObservation.eventHandlersList[eventType].length).to.beEquivalentTo(0);
				assertFunc(eventMonitor.called).to.beEquivalentTo(true);
			} else {
				assertFunc(currentObservation.eventHandlersList[eventType].length).to.beEquivalentTo(1);
				assertFunc(eventMonitor.called).to.beEquivalentTo(false);
				assertFunc(currentObservation.eventHandlersList[eventType][0].handlerFunction).to.beEquivalentTo(eventMonitor);
				assertFunc(currentObservation.eventHandlersList[eventType][0].isSingleExecution).to.beEquivalentTo(true);
			}
		});
		currentObservation.destroyObserver();
	});
	// Verifies that event listeners are automatically triggered if the observed element is already in the viewport.
	testCase('Should automatically trigger listeners when element is initially in viewport.', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		eventKinds.forEach(function(eventType) {
			var eventMonitor = sinon.spy();
			currentObservation.addEvent(eventType, eventMonitor);
			if (eventType === 'elementEntersViewport' || eventType === 'elementFullyEntersViewport') {
				assertFunc(eventMonitor.called).to.beEquivalentTo(true);
			} else {
				assertFunc(eventMonitor.called).to.beEquivalentTo(false);
			}
		});
		currentObservation.destroyObserver();
	});

	// Duplicate test case from original, preserving the exact structure and number of statements.
	testCase('Should automatically trigger listeners when element is initially in viewport (duplicate).', function () {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		eventKinds.forEach(function(eventType) {
			var eventMonitor = sinon.spy();
			currentObservation.addEvent(eventType, eventMonitor);
			if (eventType === 'elementEntersViewport' || eventType === 'elementFullyEntersViewport') {
				assertFunc(eventMonitor.called).to.beEquivalentTo(true);
			} else {
				assertFunc(eventMonitor.called).to.beEquivalentTo(false);
			}
		});
		currentObservation.destroyObserver();
	});
});
	
// Test suite for events that are triggered as a user scrolls the page.
testGroup('Scroll-triggered events', function () {
	setupTestScenario(function(){}); // Setup before each test
	tearDownTestScenario(function(){}); // Teardown after each test

	// Tests immediate invocation of 'enterViewport' if the element is already visible.
	testCase('Should invoke enterViewport immediately if element is already visible.', function () {

		var currentObservation = mainScrollObserverInstance.createObserver(testDisplayElement);
		var eventMonitor = sinon.spy();

		currentObservation.addEvent(ELEMENT_ENTERS_VIEWPORT_EVENT, eventMonitor);
		assertFunc(eventMonitor.called).to.beEquivalentTo(true);
		currentObservation.destroyObserver();
	});

	// Tests immediate invocation of 'enterViewport' and 'fullyEnterViewport' if element is fully visible.
	testCase('Should invoke enterViewport and fullyEnterViewport immediately if element is fully visible', function () {

		testDisplayElement.style.topCoordinate = '0px';

		var currentObservation = mainScrollObserverInstance.createObserver(10);
		var eventMonitorOne = sinon.spy();
		var eventMonitorTwo = sinon.spy();

		currentObservation.addEvent(ELEMENT_ENTERS_VIEWPORT_EVENT, eventMonitorOne);
		currentObservation.addEvent(ELEMENT_FULLY_ENTERS_VIEWPORT_EVENT, eventMonitorTwo);
		assertFunc(eventMonitorOne.called).to.beEquivalentTo(true);
		assertFunc(eventMonitorTwo.called).to.beEquivalentTo(true);

		currentObservation.destroyObserver();
	});

	// Tests immediate invocation of 'exitViewport' if the element is already scrolled above the view.
	testCase('Should invoke exitViewport immediately if element is already above viewport.', function (completionHandler) {
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			var currentObservation = mainScrollObserverInstance.createObserver(10);
			var eventMonitor = sinon.spy();

			currentObservation.addEvent(ELEMENT_EXITS_VIEWPORT_EVENT, eventMonitor);
			assertFunc(eventMonitor.called).to.beEquivalentTo(true);
			completionHandler();
		});
	});

	// Tests immediate invocation of 'partiallyExitViewport' if the element is already scrolled above the view.
	testCase('Should invoke partiallyExitViewport immediately if element is already above viewport.', function (completionHandler) {
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			var currentObservation = mainScrollObserverInstance.createObserver(10);
			var eventMonitor = sinon.spy();

			currentObservation.addEvent(ELEMENT_PARTIALLY_EXITS_VIEWPORT_EVENT, eventMonitor);
			assertFunc(eventMonitor.called).to.beEquivalentTo(true);
			currentObservation.destroyObserver();
			completionHandler();
		});
	});

	// Tests invocation of 'exitViewport' and 'partiallyExitViewport' when an element scrolls out of view.
	testCase('Should invoke exitViewport and partiallyExitViewport when element leaves viewport.', function (completionHandler) {
		var currentObservation = mainScrollObserverInstance.createObserver(10);
		var eventMonitorOne = sinon.spy();
		var eventMonitorTwo = sinon.spy();

		currentObservation.addEvent(ELEMENT_EXITS_VIEWPORT_EVENT, eventMonitorOne);
		currentObservation.addEvent(ELEMENT_PARTIALLY_EXITS_VIEWPORT_EVENT, eventMonitorTwo);
		assertFunc(eventMonitorOne.called).to.beEquivalentTo(false);
		assertFunc(eventMonitorTwo.called).to.beEquivalentTo(false);
		
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			assertFunc(eventMonitorOne.called).to.beEquivalentTo(true);
			assertFunc(eventMonitorTwo.called).to.beEquivalentTo(true);
			completionHandler();
		});
	});

	// Tests invocation of 'enterViewport' and 'fullyEnterViewport' when an element scrolls into view.
	testCase('Should invoke enterViewport and fullyEnterViewport when element enters viewport.', function (completionHandler) {
		var currentObservation = mainScrollObserverInstance.createObserver(retrieveViewportDimension()+10);
		var eventMonitorOne = sinon.spy();
		var eventMonitorTwo = sinon.spy();

		currentObservation.addEvent(ELEMENT_ENTERS_VIEWPORT_EVENT, eventMonitorOne);
		currentObservation.addEvent(ELEMENT_FULLY_ENTERS_VIEWPORT_EVENT, eventMonitorTwo);
		assertFunc(eventMonitorOne.called).to.beEquivalentTo(false);
		assertFunc(eventMonitorTwo.called).to.beEquivalentTo(false);
		
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			assertFunc(eventMonitorOne.called).to.beEquivalentTo(true);
			assertFunc(eventMonitorTwo.called).to.beEquivalentTo(true);
			completionHandler();
		});
	});

	// Tests invocation of 'partiallyExitViewport' only when an element partially scrolls out.
	testCase('Should only invoke partiallyExitViewport when element partially leaves viewport.', function (completionHandler) {
		var currentObservation = mainScrollObserverInstance.createObserver({topOffset: 10, bottomOffset: 200});
		var eventMonitorOne = sinon.spy();
		var eventMonitorTwo = sinon.spy();

		currentObservation.addEvent(ELEMENT_EXITS_VIEWPORT_EVENT, eventMonitorOne);
		currentObservation.addEvent(ELEMENT_PARTIALLY_EXITS_VIEWPORT_EVENT, eventMonitorTwo);
		assertFunc(eventMonitorOne.called).to.beEquivalentTo(false);
		assertFunc(eventMonitorTwo.called).to.beEquivalentTo(false);
		
		window.resetPageScroll(0,100);
		scheduleNextAnimationFrame(function () {
			assertFunc(eventMonitorOne.called).to.beEquivalentTo(false);
			assertFunc(eventMonitorTwo.called).to.beEquivalentTo(true);
			completionHandler();
		});
	});

	// Tests invocation of 'enterViewport' only when an element partially scrolls into view.
	testCase('Should only invoke enterViewport when element partially enters viewport.', function (completionHandler) {
		var currentObservation = mainScrollObserverInstance.createObserver({topOffset: retrieveViewportDimension()+10,  bottomOffset: (retrieveViewportDimension()*2)+100});
		var eventMonitorOne = sinon.spy();
		var eventMonitorTwo = sinon.spy();

		currentObservation.addEvent(ELEMENT_ENTERS_VIEWPORT_EVENT, eventMonitorOne);
		currentObservation.addEvent(ELEMENT_FULLY_ENTERS_VIEWPORT_EVENT, eventMonitorTwo);
		assertFunc(eventMonitorOne.called).to.beEquivalentTo(false);
		assertFunc(eventMonitorTwo.called).to.beEquivalentTo(false);
		
		window.resetPageScroll(0,retrieveViewportDimension()+20);
		scheduleNextAnimationFrame(function () {
			assertFunc(eventMonitorOne.called).to.beEquivalentTo(true);
			assertFunc(eventMonitorTwo.called).to.beEquivalentTo(false);
			completionHandler();
		});
	});

});