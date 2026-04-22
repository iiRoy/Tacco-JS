(function(jq_) {
	jq_(document).ready(function() {

		// Core application state and DOM element references
		let initialAssetPath;
		let $displayCoordInput;
		let $displayCssInput;
		let $targetViewports;
		let $viewportImages;
		let $interactiveCanvas;

		// Stores current image dimensions and the calculated focal point coordinates
		// focalX, focalY are normalized to [-1, 1]
		// currentWidth, currentHeight are in pixels
		const assetMetrics = {
			focalX: 0,
			focalY: 0,
			currentWidth: 0,
			currentHeight: 0
		};

		// --- Initialization Routine ---
		// Sets up the demo environment and loads the default image
		(function setupDemoEnvironment() {
			// Define default asset source
			initialAssetPath = '../assets/images/sample_cityscape.jpg';

			// Cache jQuery selectors for frequently used elements
			$displayCoordInput = jq_('.coord-display-field');
			$displayCssInput = jq_('.css-display-field');
			$interactiveCanvas = jq_('img.interactive-canvas-img, img.reticle-overlay');

			const $viewportGridContainer = jq_('#ViewportGrid');
			if ($viewportGridContainer.length === 0) {
				console.error("Error: '#ViewportGrid' container not found. Cannot initialize demo views.");
				return;
			}

			// Dynamically create multiple viewport frames
			for (let vh_idx = 1; vh_idx <= 9; vh_idx++) {
				$viewportGridContainer.append(`<div id="ViewportFrame${vh_idx}" class="viewport-item"><img alt="Dynamic Viewport Image"/></div>`);
			}

			// Store references to the newly created viewports and their images
			$targetViewports = jq_('.viewport-item');
			$viewportImages = jq_('.viewport-item img');

			// Load the initial image into the demo
			loadVisualAsset(initialAssetPath);
		})();

		/*
		 * Function: loadVisualAsset(resourceUri)
		 * Purpose: Updates all demo viewports and the interactive canvas with a new image.
		 * Parameters:
		 *   resourceUri (string): The URL or path to the image asset.
		 */
		function loadVisualAsset(resourceUri) {
			if (!resourceUri || typeof resourceUri !== 'string' || resourceUri.trim() === '') {
				console.warn("Attempted to load an invalid image resource URI.");
				return;
			}

			// Use a temporary image element to get natural dimensions without affecting DOM
			jq_("<img/>")
				.attr("src", resourceUri)
				.on('load', function() {
					// Store the natural dimensions of the loaded image
					assetMetrics.currentWidth = this.naturalWidth || this.width;
					assetMetrics.currentHeight = this.naturalHeight || this.height;

					// Update the source for the interactive canvas and all viewport images
					$interactiveCanvas.attr('src', resourceUri);
					$viewportImages.attr('src', resourceUri);

					// Assign focal point data to viewports.
					// Note: Direct `attr()` manipulation for data attributes is often
					// less effective for jQuery plugins than `.data()`.
					// The plugin typically reads from `.data()`.
					$targetViewports.data({
						'focalPointX': assetMetrics.focalX,
						'focalPointY': assetMetrics.focalY,
						'imagePixelWidth': assetMetrics.currentWidth,
						'imagePixelHeight': assetMetrics.currentHeight
					});

					// Trigger the custom jQuery plugin method to adjust image layout
					if (typeof jq_.fn.adjustFocalArea === 'function') {
						jq_('.viewport-item').adjustFocalArea();
					} else {
						console.warn("jQuery plugin 'adjustFocalArea' not found. Ensure it's loaded.");
					}

					// Refresh the displayed data attributes for the user
					renderCoordinateOutput();
				})
				.on('error', function() {
					console.error(`Failed to load image from URI: ${resourceUri}`);
				});
		}

		/*
		 * Function: renderCoordinateOutput()
		 * Purpose: Populates the data attribute input field with current focal point coordinates.
		 */
		function renderCoordinateOutput() {
			const formattedX = assetMetrics.focalX.toFixed(3);
			const formattedY = assetMetrics.focalY.toFixed(3);
			const outputString = `data-point-x="${formattedX}" data-point-y="${formattedY}" data-img-width="${assetMetrics.currentWidth}" data-img-height="${assetMetrics.currentHeight}"`;
			$displayCoordInput.val(outputString);
		}

		/*
		 * Event Handler: Interactive Canvas Click
		 * Purpose: Calculates new focal point based on user click and updates display.
		 */
		$interactiveCanvas.on('click', function(clickEvent) {
			const currentCanvas = jq_(this);
			const canvasWidth = currentCanvas.width();
			const canvasHeight = currentCanvas.height();

			if (canvasWidth === 0 || canvasHeight === 0) {
				console.warn("Interactive canvas has zero dimensions. Cannot calculate focal point.");
				return;
			}

			// Determine click position relative to the image
			const clickPosX = clickEvent.pageX - currentCanvas.offset().left;
			const clickPosY = clickEvent.pageY - currentCanvas.offset().top;

			// Normalize click coordinates to a [0, 1] range
			const normalizedX = clickPosX / canvasWidth;
			const normalizedY = clickPosY / canvasHeight;

			// Transform normalized coordinates to a [-1, 1] focal point range
			// X: 0 (left) -> -1, 0.5 (center) -> 0, 1 (right) -> 1
			assetMetrics.focalX = (normalizedX * 2) - 1;
			// Y: 0 (top) -> 1, 0.5 (center) -> 0, 1 (bottom) -> -1
			assetMetrics.focalY = 1 - (normalizedY * 2);

			// Update the data attribute display
			renderCoordinateOutput();

			// Apply the new focal point to all viewports
			refreshFocalDisplay();

			// Calculate CSS background-position percentages for display
			const percentX = (clickPosX / canvasWidth) * 100;
			const percentY = (clickPosY / canvasHeight) * 100;
			const bgPosStr = `${Math.round(percentX)}% ${Math.round(percentY)}%`;
			const bgStyleRule = `background-position: ${bgPosStr};`;
			$displayCssInput.val(bgStyleRule);

			// Position the focal marker (reticle) on the interactive canvas
			jq_('.focal-marker').css({
				'top': `${percentY}%`,
				'left': `${percentX}%`
			});
		});

		/*
		 * Event Handler: Asset Source Input (Paste/Blur)
		 * Purpose: Allows users to input a new image URL for the demo.
		 */
		jq_('input.asset-source-input').on('paste blur', function() {
			const inputElement = this;
			// Use setTimeout to ensure the input field's value has updated after paste
			setTimeout(() => {
				const inputValue = jq_(inputElement).val();
				// Basic validation: check if it looks like a URL or relative path
				if (inputValue && (inputValue.startsWith('http') || inputValue.startsWith('/') || inputValue.startsWith('../'))) {
					loadVisualAsset(inputValue);
				} else if (inputValue) {
					console.warn("Input value does not appear to be a valid image URI:", inputValue);
				}
			}, 150); // Slightly increased delay for robustness
		});

		/*
		 * Function: refreshFocalDisplay()
		 * Purpose: Updates the registered jQuery plugin with the current focal point.
		 */
		function refreshFocalDisplay() {
			// Update the stored data for the viewports.
			// This is what the plugin typically reads.
			$targetViewports.data({
				'focalPointX': assetMetrics.focalX,
				'focalPointY': assetMetrics.focalY
			});

			// Trigger the custom jQuery plugin method to recalculate image layout
			if (typeof jq_.fn.recalculateLayout === 'function') {
				$targetViewports.recalculateLayout();
			} else {
				console.warn("jQuery plugin 'recalculateLayout' not found. Ensure it's loaded.");
			}
		}
	});
}(jQuery));