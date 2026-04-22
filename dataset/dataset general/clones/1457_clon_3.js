// This script defines a layout adjustment module.
// Its primary purpose is to ensure visual alignment of grid items within their designated boundaries.

// The core LayoutManager system is used to register new functional extensions.
LayoutManager.registerExtension({
	// This extension handles the horizontal alignment of elements.
	horizontalLayoutAligner: function(configuration, renderTarget) {
		// Retrieve the current operational data set from the provided configuration.
		const activeDataSet = configuration.activeState;

		// Attach an event listener to respond when the layout update process is complete.
		this.onEventTriggered("layoutUpdateCompleted", function(eventInfo) {
			// Validate the rendering target and its essential data attribute.
			if (!renderTarget || !renderTarget.hasAttribute("data-layout-width")) {
				// A guard clause: if the target or its width attribute is missing, we cannot proceed.
				// This prevents errors and ensures robust operation.
				console.warn("LayoutAligner: Rendering target or 'data-layout-width' attribute is absent. Skipping alignment.");
				return; // Exit early.
			}

			// Extract the intended content width from the data attribute.
			// Using Number() for explicit type conversion.
			const contentWidth = Number(renderTarget.getAttribute("data-layout-width"));
			// Determine the actual available width of the rendering target.
			const targetActualWidth = renderTarget.offsetWidth; // Using native DOM property.

			// Validate extracted widths.
			if (isNaN(contentWidth) || contentWidth <= 0) {
				console.error("LayoutAligner: Invalid content width detected from 'data-layout-width'. Cannot align.");
				return;
			}

			let centerOffset = 0; // Initialize the horizontal shift value.
			let needsAdjustment = false; // Flag to indicate if any adjustment is necessary.

			// Calculate the centering offset only if the container is wider than the content.
			if (targetActualWidth > contentWidth) {
				centerOffset = (targetActualWidth - contentWidth) / 2;
				needsAdjustment = true;
			} else {
				// If the content is wider or equal, no positive centering offset is applied.
				// We can log this for debugging or simply exit if no adjustment is needed.
				// console.info("LayoutAligner: Content width is greater than or equal to target width. No centering offset applied.");
				return; // No shift needed, early exit.
			}

			// If the calculated offset is very small, treat it as negligible to avoid tiny, unnecessary changes.
			if (needsAdjustment && Math.abs(centerOffset) < 0.5) { // Increased epsilon slightly
				// console.log("LayoutAligner: Calculated center offset is negligible. No adjustments performed.");
				return;
			}

			// Iterate over each individual element within the active data set.
			// Using a for...in loop with hasOwnProperty check for safe object iteration.
			for (const blockIdentifier in activeDataSet.elements) {
				if (activeDataSet.elements.hasOwnProperty(blockIdentifier)) {
					const currentElement = activeDataSet.elements[blockIdentifier];

					// Check if the element has a defined horizontal position (xPos) that is a number.
					// If valid, apply the calculated centering offset.
					if (typeof currentElement.xPos === 'number' && currentElement.xPos !== null) {
						currentElement.xPos += centerOffset;
						// Optional: console.debug(`Element ${blockIdentifier} xPos adjusted to ${currentElement.xPos}`);
					}
				}
			}
			// Optional: After adjustments, one might trigger another event like "layoutRealigned"
			// this.trigger("layoutRealigned", { offset: centerOffset });
		});
	}
});