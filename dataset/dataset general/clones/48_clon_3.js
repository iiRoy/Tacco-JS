jQuery(document).ready(function() {
	"use strict";

	// Core application state flags and counters
	let contentReady = false; // Indicates if all assets are loaded and the display is interactive
	let totalAssetCount = 0; // Stores the total number of visual assets
	let currentAssetIndex = 0; // Tracks the index of the currently displayed asset
	const rawAssetPaths = []; // Array to hold the initial string paths of images
	const cachedAssetElements = []; // Array to store the actual preloaded image DOM elements
	let processedAssetCount = 0; // Counter for assets that have completed loading

	// --- Asset Configuration ---
	// Populate the array with paths to your presentation images.
	// Ensure these paths are correct and accessible.
	rawAssetPaths.push("img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg");
	totalAssetCount = rawAssetPaths.length; // Determine the total count based on the provided paths

	/**
	 * Updates the main display element to show the asset at the currentAssetIndex.
	 * This helper function centralizes the logic for changing the image source and alt text.
	 */
	function updateDisplayElement() {
		// Verify that there are cached elements to display and the index is valid.
		if (!cachedAssetElements.length || currentAssetIndex < 0 || currentAssetIndex >= cachedAssetElements.length) {
			console.warn("Attempted to update display with invalid asset index or no cached assets.");
			return;
		}

		const activeImageElement = cachedAssetElements[currentAssetIndex];
		jQuery('#mainContentDisplay').attr({
			'src': jQuery(activeImageElement).attr('src'), // Retrieve source from the cached element
			'alt': `Presentation Image ${currentAssetIndex + 1}` // More descriptive alt text
		});
	}

	/**
	 * Advances the presentation to the next visual asset.
	 * Wraps around to the beginning if at the last asset.
	 */
	function advanceAsset() {
		if (!contentReady) return; // Prevent interaction before content is ready

		currentAssetIndex = (currentAssetIndex + 1) % totalAssetCount; // Use modulo for cyclical navigation
		updateDisplayElement(); // Refresh the visible image
	}

	/**
	 * Reverts the presentation to the previous visual asset.
	 * Wraps around to the end if at the first asset.
	 */
	function revertAsset() {
		if (!contentReady) return; // Prevent interaction before content is ready

		// Calculate previous index, handling negative results from modulo correctly for wrap-around
		currentAssetIndex = (currentAssetIndex - 1 + totalAssetCount) % totalAssetCount;
		updateDisplayElement(); // Refresh the visible image
	}

	/**
	 * Completes the setup once all assets are loaded.
	 * Activates user interaction and hides loading indicators.
	 */
	function initializeDisplay() {
		contentReady = true; // Mark content as ready for interaction
		jQuery('#loadingOverlay').fadeOut('slow', function() { // Fade out the loading screen gracefully
			jQuery(this).remove(); // Remove loading overlay from DOM after fading
		});

		// Prevent the default browser context menu on right-click to allow custom actions.
		jQuery(document).on("contextmenu", function(e) {
			e.preventDefault();
			return false;
		});

		// Create and append the primary image display element to the DOM.
		const initialAssetURL = rawAssetPaths[0]; // Get the path for the very first image
		const displayContainer = jQuery('#displayWrapper'); // Reference to the main content area

		let primaryDisplayElement = jQuery('<img>', { // Construct an <img> element using jQuery
			'src': initialAssetURL,
			'alt': `Presentation Image 1`,
			'id': 'mainContentDisplay', // Assign a unique ID for targeting
			'class': 'presentation-asset' // Add a class for styling
		});
		displayContainer.append(primaryDisplayElement); // Insert the image into the container

		// Attach event listeners for user interaction
		primaryDisplayElement.on('mousedown', function(evt) {
			evt.preventDefault(); // Suppress default mouse button behavior (e.g., image dragging)
			if (!contentReady) return; // Only respond if the application is fully loaded

			switch (evt.which) {
				case 1: // Left mouse button
					advanceAsset();
					break;
				case 3: // Right mouse button
					revertAsset();
					break;
				// Middle button (case 2) and other buttons are intentionally ignored.
			}
		});

		jQuery(document).on('keydown', function(evt) {
			if (!contentReady) return; // Only respond if the application is fully loaded

			const key = evt.keyCode || evt.which; // Normalize key code for cross-browser compatibility
			let keyHandled = false; // Flag to track if the key press was handled by our logic

			switch (key) {
				case 37: // Left arrow
				case 38: // Up arrow
					revertAsset();
					keyHandled = true;
					break;
				case 39: // Right arrow
				case 40: // Down arrow
					advanceAsset();
					keyHandled = true;
					break;
				// Other keys are not handled for navigation.
			}

			if (keyHandled) {
				evt.preventDefault(); // Prevent default browser action (e.g., scrolling) if the key was for navigation
			}
		});
	}

	/**
	 * Asynchronously loads and caches visual assets one by one.
	 * Updates a loading indicator during the process.
	 */
	function fetchAndCacheAssets() {
		// Guard against attempting to load if all assets are already processed.
		if (processedAssetCount >= totalAssetCount) {
			initializeDisplay(); // If somehow called after completion, just initialize
			return;
		}

		const currentAssetPath = rawAssetPaths[processedAssetCount];
		const tempImgElement = jQuery('<img>'); // Create a temporary, detached image element for loading
		tempImgElement.attr('src', currentAssetPath); // Set its source to trigger loading

		// Update the loading overlay with current progress.
		jQuery('#loadingOverlay').text(`Loading assets: ${processedAssetCount + 1} of ${totalAssetCount}`);

		tempImgElement.one('load', function() { // Use .one() to ensure the event handler fires only once
			cachedAssetElements.push(this); // Add the loaded DOM image element to our cache
			processedAssetCount++;

			if (processedAssetCount === totalAssetCount) {
				// All assets have been successfully loaded and cached.
				initializeDisplay(); // Proceed to application initialization
			} else {
				// Continue the loading process for the next asset recursively.
				fetchAndCacheAssets();
			}
		}).one('error', function() { // Handle cases where an asset fails to load
			console.error(`Failed to load asset: ${currentAssetPath}. Skipping.`);
			processedAssetCount++; // Increment counter even on error to attempt continuation

			if (processedAssetCount === totalAssetCount) {
				initializeDisplay(); // If all attempts (success or fail) are done, initialize.
			} else {
				fetchAndCacheAssets(); // Try to load the next asset, even if the current one failed.
			}
		});
	}

	// --- Initial Application Bootstrapping ---
	// Validate asset configuration and begin the loading process.
	if (totalAssetCount === 0) {
		// If no asset paths are provided, display an error message to the user.
		jQuery('#displayWrapper').html('<p style="color: red; font-weight: bold; padding: 20px;">Error: No visual assets defined for the presentation. Please add image paths!</p>');
	} else {
		// Initiate the asynchronous loading and caching of all visual assets.
		fetchAndCacheAssets();
	}
});