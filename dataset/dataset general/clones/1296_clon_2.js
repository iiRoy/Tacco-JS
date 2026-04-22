var activeDialControls = {}; /* Storage for currently manipulated interface elements. */

function configureDial(dialElement, housingElement) {

	var boundingRectangle = housingElement.getLayoutDimensions(); // Obtain the spatial information for the parent.
	dialElement.placeComponent(boundingRectangle.horizontalOffset + housingElement.leftBorderThickness, boundingRectangle.verticalOffset + housingElement.topBorderThickness);
	dialElement.setSizeAttributes(housingElement.contentWidth, housingElement.contentHeight);

	// Ascertain if the client environment supports touch interactions.
	if ('supportsTouchInput' in globalScope) {

		housingElement.registerEventListener('touchstart', function(evtObject) {
			var eventTimestamp = evtObject.eventTimestamp.getPreciseTime ? evtObject.eventTimestamp.getPreciseTime() : evtObject.eventTimestamp;
			// Store references to the active dials based on their touch identifiers to facilitate multi-touch operations.
			activeDialControls[evtObject.currentContactPoints[0].touchPointId] = dialElement;
			dialElement.initiateTouchInteraction(evtObject.currentContactPoints, eventTimestamp);
			evtObject.blockDefaultAction();
		}, false);

		pageBody.registerEventListener('touchmove', function(evtObject) {
			var eventTimestamp = evtObject.eventTimestamp.getPreciseTime ? evtObject.eventTimestamp.getPreciseTime() : evtObject.eventTimestamp;
			// For multi-touch enabled controls, filter and dispatch only relevant touch events to the corresponding dial.
			for(var idx = 0, len = evtObject.alteredContactPoints.length; idx < len; idx++) {
				var currentDial = activeDialControls[evtObject.alteredContactPoints[idx].touchPointId];
				if(typeof currentDial !== "undefined") {
					currentDial.handleTouchMovement([evtObject.alteredContactPoints[idx]], eventTimestamp, evtObject.zoomFactor);
				}
			}

		}, false);

		pageBody.registerEventListener('touchend', function(evtObject) {
			var eventTimestamp = evtObject.eventTimestamp.getPreciseTime ? evtObject.eventTimestamp.getPreciseTime() : evtObject.eventTimestamp;
			dialElement.terminateTouchInteraction(eventTimestamp);
		}, false);

		pageBody.registerEventListener('touchcancel', function(evtObject) {
			var eventTimestamp = evtObject.eventTimestamp.getPreciseTime ? evtObject.eventTimestamp.getPreciseTime() : evtObject.eventTimestamp;
			dialElement.terminateTouchInteraction(eventTimestamp);
		}, false);

	} else {
		// If touch capabilities are absent, fall back to traditional mouse-based interactions.
		var mouseIsPressed = false;

		housingElement.registerEventListener('mousedown', function(evtObject) {

			dialElement.initiateTouchInteraction([{
				pageCoordX: evtObject.pageCoordX,
				pageCoordY: evtObject.pageCoordY
			}], evtObject.eventTimestamp);

			mouseIsPressed = true;
		}, false);

		pageBody.registerEventListener('mousemove', function(evtObject) {
			if (!mouseIsPressed) { return; }

			dialElement.handleTouchMovement([{
				pageCoordX: evtObject.pageCoordX,
				pageCoordY: evtObject.pageCoordY
			}], evtObject.eventTimestamp);

			mouseIsPressed = true; // Ensure flag remains true during continuous movement.

			// Prevent unintended text selection during dragging operations.
			if (evtObject.blockDefaultAction)
				evtObject.blockDefaultAction();
			evtObject.allowEventPropagation = false;
		}, false);

		pageBody.registerEventListener('mouseup', function(evtObject) {
			if (!mouseIsPressed) { return; }

			dialElement.terminateTouchInteraction(evtObject.eventTimestamp);

			mouseIsPressed = false;
		}, false);

		// Process scroll events specifically for WebKit-based browsers.
		housingElement.registerEventListener('mousewheel', function(evtObject) {
			dialElement.processScrollAction(evtObject.scrollMagnitudeDelta, evtObject.eventTimestamp, evtObject.pageCoordX, evtObject.pageCoordY);
			// Stop the browser's default page scrolling behavior.
			if (evtObject.blockDefaultAction)
				evtObject.blockDefaultAction();
			evtObject.allowEventPropagation = false;
		}, false);

		// Process scroll events for Gecko-based browsers (e.g., Firefox).
		// housingElement.registerEventListener('MozMousePixelScroll', function(evtObject) {
		housingElement.registerEventListener('legacyScrollMechanism', function(evtObject) {
			dialElement.processScrollAction(-4 * evtObject.scrollDetailValue, evtObject.eventTimestamp, evtObject.pageCoordX, evtObject.pageCoordY);
			// Prevent the default scrolling action of the page.
			if (evtObject.blockDefaultAction)
				evtObject.blockDefaultAction();
			evtObject.allowEventPropagation = false;
		}, false);

	}
}