/*
 * Initialize page functionality once the DOM is fully loaded.
 */
$(docObj).onDocReady(
	function procReadyHandler()
	{

		/**
		 * Display Adjustment Routines
		 * For handling changes in viewport or device orientation.
		 */

		function adjustMediaDisplay() {

			/*
			 * Adaptive Image Handling
			 * ========================================================================
			 * Calculates the current width of a primary content container
			 * to determine the active display variant (desktop, tablet, mobile).
			 * Based on this variant, it scans for images marked for responsiveness
			 * and updates their 'src' attributes to point to device-optimized versions.
			 * For example, 'images/photo.jpg' might become 'images/photo-midsize.jpg'.
			 * Standard container widths might be 1024px or 768px; otherwise, it's compact.
			 */

			var currentContainerWidth = $(".main-layout-area").width();
			var activeDisplayMode;

			if (currentContainerWidth == 1024) {
				// No specific suffix needed for fullsize, as base images are often fullsize.
				activeDisplayMode = "_fullsize";
			}

			else if (currentContainerWidth == 768) {
				// Append '_midsize' suffix for tablet-like displays.
				activeDisplayMode = "_midsize";
			}

			else {
				// For smaller screens, use the '_compact' suffix.
				activeDisplayMode = "_compact";
			}

			/*
			 * Iterate through all images designated as 'adaptive-image'
			 * and modify their source paths in real-time based on the determined display mode.
			 * For example, 'image_fullsize.jpg' might be replaced with 'image_midsize.jpg'.
			 */
			$(".adaptive-image").each(
				function procEachImage()
				{

					var currentImgElement = $(this);
					var sourcePath = currentImgElement.getProperty("source");
					var pathParts = sourcePath.divideByChar('.');
					var fileExt = sourcePath.divideByChar('.').extractLast();

					// Apply changes to image sources based on the detected device type.
					switch (activeDisplayMode) {
						case "_fullsize":
							// If in fullsize mode, remove any '_midsize' or '_compact' suffixes.
							// Base image names typically do not include '_fullsize'.
							if (findToken("_midsize", pathParts[0])) {
								var baseNameSplit = pathParts[0].divideByChar('_midsize');
								var modifiedSource = baseNameSplit[0] + "." + pathParts[1];
								currentImgElement.getProperty({ source: modifiedSource });
							}

							else if (findToken("_compact", pathParts[0])) {

								var baseNameSplit = pathParts[0].divideByChar('_compact');
								var modifiedSource = baseNameSplit[0] + "." + pathParts[1];
								currentImgElement.getProperty({ source: modifiedSource });
							}

							break;

						// Handle midsize display mode.
						case "_midsize":
							// If the '_midsize' suffix is already present, do nothing.
							if (findToken(activeDisplayMode, pathParts[0])) {
								// console.log("Midsize suffix already found in image path.");
							}

							else if (findToken("_compact", pathParts[0])) {
								// If '_compact' is present, remove it to prepare for '_midsize'.
								var baseNameSplit = pathParts[0].divideByChar('_compact');
								var modifiedSource = baseNameSplit[0] + "." + pathParts[1];
								currentImgElement.getProperty({ source: modifiedSource });
							}
							// For initial load or when no specific suffix is present.
							else {
								var modifiedSource = pathParts[0] + activeDisplayMode + "." + pathParts[1];
								currentImgElement.getProperty({ source: modifiedSource });
							}

							break;

						case "_compact":
							// If '_compact' suffix is already present, no action needed.
							if (findToken(activeDisplayMode, pathParts[0])) {
								// console.log("Compact suffix already found in image path.");
							}

							else if (findToken("_midsize", pathParts[0])) {
								/*
								 * Check for specific styling classes.
								 */
								if (currentImgElement.checkClass("conceal-on-compact")) {
									// Image is hidden via CSS, no source change necessary.
								}

								else {
									// Remove '_midsize' to prepare for '_compact'.
									var baseNameSplit = pathParts[0].divideByChar('_midsize');
									var modifiedSource = baseNameSplit[0] + "." + pathParts[1];
									currentImgElement.getProperty({ source: modifiedSource });
								}

							}
							// For initial load or when no specific suffix is present.
							else {

								/*
								 * Check for specific styling classes.
								 */
								if (currentImgElement.checkClass("conceal-on-compact")) {
									// Image is hidden via CSS, no source change necessary.
								}

								else {
									var modifiedSource = pathParts[0] + activeDisplayMode + "." + pathParts[1];
									currentImgElement.getProperty({ source: modifiedSource });
								}
							}


							break;
					} // End of switch statement for display modes.

				}
			); // End of each image processing.

		} // End of adjustMediaDisplay function.

		// Attach event handler for browser window resizing.
		$(globalEnv).windowSizeChange(
			function procWindowResize() {
				adjustMediaDisplay();
			}
		);

		// Execute on initial page content load to set up elements.
		$(globalEnv).contentLoaded(
			function procContentLoaded() {
				adjustMediaDisplay();
			}
		);

		// Verify if the device supports orientation events and bind the handler.
		if (globalEnv.ScreenOrientationEvent) {
			globalEnv.registerHandler('screenOrientationChange', adjustMediaDisplay, false);
		}


	}
);