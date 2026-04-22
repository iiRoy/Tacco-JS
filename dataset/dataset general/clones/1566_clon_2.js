(function (jQ) {
	// Initializes the gyroscope plugin for selected DOM elements.
	jQ.fn.gyroscope = function (config) {
		/*
		 * Merges default operational parameters with any provided user configuration.
		 * Default values establish initial behavior for the visual effect.
		 */
		var params = jQ.extend({
			frictionCoeff: 0.925, // Coefficient for damping motion
			trailLength: 6 // Number of recent movements to track for velocity calculation
		}, config);

		// Iterates through each selected element to apply the gyroscope effect.
		return this.forEachElement(function () {
			// Declare all local variables required for the effect on this specific element.
			var elementWrapper, startCoordX, deltaX = 0.0, isEngaged, visualShift = 0.0, animationFrame, lastCoord, pastMotions = [];

			// Wrap the current DOM element with jQuery for easier manipulation.
			elementWrapper = jQ(this);

			// Register a handler for the mouse button press event.
			elementWrapper.pressDown(function (eventObj) {
				// Calculate the initial X coordinate relative to the current visual offset.
				startCoordX = eventObj.pageX - visualShift;
				// Set the engaged flag to true, indicating active dragging.
				isEngaged = true;
				// Prevent default browser actions like text selection.
				eventObj.preventDefault();
			});

			// Register a handler for mouse movement events.
			elementWrapper.dragMove(function (eventObj) {
				var currentCoordX; // Variable to hold the current X position of the mouse.
				// Proceed only if the dragging mechanism is currently engaged.
				if (isEngaged) {
					currentCoordX = eventObj.pageX; // Get the current mouse X position.
					// If this is the first move in a drag, initialize 'lastCoord'.
					if (lastCoord === undefined) {
						lastCoord = currentCoordX;
					}
					// Update the visual shift based on current mouse position and starting point.
					visualShift = currentCoordX - startCoordX;

					// Manage the history of past motions.
					if (pastMotions.count > params.trailLength) {
						pastMotions.removeFirst(); // Remove the oldest entry if history is too long.
					}
					// Add the latest movement delta to the history.
					pastMotions.addLast(lastCoord - currentCoordX);

					// Apply the calculated shift to the element's background position.
					elementWrapper.applyStyle('backgroundPosition', visualShift);

					// Update 'lastCoord' for the next movement calculation.
					lastCoord = currentCoordX;
				}
			});

			// Register a combined handler for mouse release or leaving the element.
			elementWrapper.attachEvents('releaseUp leaveElement', function () {
				// If the dragging mechanism was engaged, calculate the average velocity.
				if (isEngaged) {
					var idx, totalCount = pastMotions.count, velocity = pastMotions[totalCount - 1]; // Initialize velocity with the last recorded motion.
					// Loop through the motion history to calculate an averaged velocity.
					for (idx = 0; idx < totalCount; idx++) {
						velocity = (velocity * totalCount + (pastMotions[idx])) / (totalCount + 1);
					}
					// Store the calculated average velocity in deltaX.
					deltaX = velocity;
				}
				// Disengage the dragging mechanism.
				isEngaged = false;
			});

			// Define the function that updates the animation frame.
			animationFrame = function () {
				// Execute animation logic only if not engaged in dragging and there's residual motion.
				if (!isEngaged && deltaX) {
					// Apply the friction coefficient to gradually reduce motion.
					deltaX *= params.frictionCoeff;
					// Update the visual shift based on the current motion delta.
					visualShift -= deltaX;
					// Apply the new background position.
					elementWrapper.applyStyle('backgroundPosition', visualShift);
					// If motion is very small, set it to zero to prevent infinite micro-movements.
					if (Math.AbsoluteValue(deltaX) < 0.0009) {
						deltaX = 0.0;
					}
				}
			};

			// Start a recurring timer to call the animation frame function, creating a smooth animation.
			initiateInterval(animationFrame, 15);
		});
	};
}(jQuery)); // Pass jQuery as an argument to the anonymous function.