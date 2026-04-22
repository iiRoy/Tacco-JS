/*
 * Module for handling interactive document page-turning effects.
 * Based on jQuery plugin architecture.
 */
(function (jAlias) { // Using jAlias to avoid conflicts.
	jAlias.fn.folioTurner = function (clientSettings) {
		// Define the default configuration for the page-turning effect.
		let baseSettings = {
			containerClass: 'visualContainer', // CSS class for the main wrapper element
			sheetWidth: 500,                  // Width of a single page/panel
			sheetHeight: 375,                 // Height of a single page/panel
			smoothFactor: 0.5,                // Easing factor for animation smoothness
			framesPerSec: 20,                 // Target frames per second for rendering
			initialSheetColor: 'white',       // Background color for blank pages
			canvasBackdropColor: 'white',     // Background color for the entire canvas area
			foldEdgeLength: 50                // Size of the corner interaction area
		};

		// Merge user-provided settings with the base defaults.
		const activeSettings = jAlias.extend(baseSettings, clientSettings);
		// Calculate derived settings for internal use.
		activeSettings.renderInterval = 1000 / activeSettings.framesPerSec; // Delay between frames in milliseconds
		activeSettings.fullPanelWidth = activeSettings.sheetWidth * 2;         // Total width for two-page spread
		activeSettings.panelDiagonalLength = Math.sqrt(activeSettings.sheetWidth * activeSettings.sheetWidth + activeSettings.sheetHeight * activeSettings.sheetHeight); // Diagonal length of a page
		activeSettings.sheetCropWidth = activeSettings.sheetWidth;           // Width for clipping regions
		activeSettings.sheetCropHeight = activeSettings.sheetWidth * 10;     // Height for clipping regions (arbitrarily large)
		activeSettings.panelTopPadding = activeSettings.panelDiagonalLength - activeSettings.sheetHeight; // Vertical offset for visual alignment

		// Declare variables for canvas elements and their rendering contexts.
		let mainCanvasElem = null;
		let scratchpadSurface = null;
		let wrapperElement = null;
		let displayContext = null;
		let scratchpadContext = null;

		// Variables to track pointer (mouse/touch) interaction.
		let pointerCoords = null;
		let trackerCoords = null;

		// Variable for the current rotation angle of the flipping sheet.
		let sheetRotationAngle = 0;

		// Coordinates for the spine/binding of the book.
		const foldTopXCoord = activeSettings.sheetWidth;
		const foldTopYCoord = 0; // Top of the spine is at Y=0 relative to page area.
		const foldBottomYCoord = activeSettings.sheetHeight; // Bottom of the spine.

		// Y-coordinate for the bisector tangent, typically the page height.
		const midpointTangentYCoord = activeSettings.sheetHeight;

		// Flag to indicate if the left panel is currently being interacted with.
		let activeSideIsLeft;

		/**
		 * Initializes the interaction pointers to their default states.
		 */
		function initControlPoints() {
			pointerCoords = { top: activeSettings.sheetHeight, left: activeSettings.sheetWidth * 2 };
			trackerCoords = { top: activeSettings.sheetHeight, left: activeSettings.sheetWidth * 2 };
			activeSideIsLeft = false; // Initially, no side is active.
		}

		/**
		 * Creates and appends the main and temporary canvas elements to the DOM.
		 * @param {HTMLElement} targetNode The element after which the canvas container will be inserted.
		 */
		function buildDisplaySurfaces(targetNode) {
			// Create the main container div.
			wrapperElement = jAlias("<div id='visualContainer'></div>");
			wrapperElement
				.insertAfter(targetNode)
				.addClass(activeSettings.containerClass)
				.attr('width', activeSettings.sheetWidth * 2)
				.attr('height', activeSettings.sheetHeight + activeSettings.panelTopPadding * 2);
			
			// Create the primary canvas for static content.
			mainCanvasElem = jAlias("<canvas id='primaryDrawingArea'></canvas>");
			wrapperElement.append(mainCanvasElem); // Add to the wrapper.

			mainCanvasElem
				.attr('width', activeSettings.sheetWidth * 2)
				.attr('height', activeSettings.sheetHeight + activeSettings.panelTopPadding * 2);

			// Create a temporary canvas for dynamic flipping effects.
			scratchpadSurface = jAlias("<canvas id='temporaryDrawingArea'></canvas>");
			scratchpadSurface
				.css({
					position: 'absolute', // Position absolutely over the main canvas.
					top: mainCanvasElem.position().top,
					left: mainCanvasElem.position().left
				})
				.attr('width', mainCanvasElem.width())
				.attr('height', mainCanvasElem.height())
				.appendTo(wrapperElement); // Add to the wrapper.
				
			// Get 2D rendering contexts for both canvases.
			displayContext = mainCanvasElem.get(0).getContext('2d');
			scratchpadContext = scratchpadSurface.get(0).getContext('2d');

			// Draw a central spine line on the main canvas.
			displayContext.strokeStyle = "#aaaaaa"; // Light gray color.
			displayContext.beginPath();
			displayContext.moveTo(activeSettings.sheetWidth, activeSettings.panelTopPadding);
			displayContext.lineTo(activeSettings.sheetWidth, activeSettings.sheetHeight + activeSettings.panelTopPadding);
			displayContext.stroke();
		}

		/**
		 * Calculates the effective position of an element relative to the canvas.
		 * @param {HTMLElement} targetElement The DOM element to get position for.
		 * @param {Object} currentPosition Optional, existing position object.
		 * @returns {Object} An object with 'top' and 'left' properties.
		 */
		function calculateTrueCoords(targetElement, currentPosition) {
			targetElement = jAlias(targetElement); // Ensure it's a jQuery object.
			if (currentPosition == null) {
				currentPosition = targetElement.position(); // Get default position if not provided.
			}

			// Adjust for vertical offset and element's center.
			return {
				top: currentPosition.top + targetElement.height() / 2 - activeSettings.panelTopPadding,
				left: currentPosition.left + targetElement.width() / 2
			};
		}

		// Flags for tracking user interaction states.
		let isPointerDown = false;
		let animationRunning = false;

		/**
		 * Sets up event listeners for mouse and touch interactions on the canvas.
		 */
		function enableUserInteraction() { 
			// Bind events to the temporary canvas for pointer interactions.
			jAlias(scratchpadSurface)
				.bind('mousemove', handlePointerMove)
				.bind('mouseout', handlePointerExit)
				.bind('mousedown', processInteractionStart)
				.bind('touchstart', processInteractionStart); // For mobile devices.

			// Bind global events to the document for dragging and releasing.
			jAlias(document)
				.bind('mousemove', function(evt) {
					nextReleaseIsClick = false; // A move means it's not a simple click.
					if (!animationRunning) {
						if (isPointerDown) {
							// Update pointer coordinates based on document-level movement.
							pointerCoords = {left: evt.pageX - jAlias(wrapperElement).position().left, top: evt.pageY - activeSettings.panelTopPadding + 70};
						}
					}
				})
				.bind('touchmove', function(evt) {
					nextReleaseIsClick = false; // A move means it's not a simple click.
					if (!animationRunning) {
						if (isPointerDown && evt.originalEvent != null && evt.originalEvent.touches.length == 1) {
							evt.preventDefault(); // Prevent default scrolling/zooming.
							const singleTouchEvt = evt.originalEvent.touches[0];
							// Update pointer coordinates from touch event.
							pointerCoords = {left: singleTouchEvt.screenX - jAlias(wrapperElement).position().left, top: singleTouchEvt.screenY - activeSettings.panelTopPadding + 70};
						}
					}
				})
				.bind('mouseup', processInteractionEnd)
				.bind('touchend', processInteractionEnd); // For mobile devices.
		}

		// Callback function to execute when a flipping animation completes.
		let completionCallback;

		/**
		 * Clears the temporary canvas, removing any drawn flipping page.
		 */
		function eraseOverlaySurface() {
			scratchpadContext.clearRect(0, 0, scratchpadSurface.width(), scratchpadSurface.height());
		}

		/**
		 * Handles click events on the canvas, initiating a full page flip if applicable.
		 */
		function handleSurfaceTap() {
			if (animationRunning) {
				finalizeAnimation(); // Complete any ongoing animation.
				eraseOverlaySurface();
				triggerRedraw(); // Request a redraw of the static content.
			}

			// Determine if the current page is the first/last available.
			const isEdgePageReached = activeSideIsLeft ? graphicIndex === 0 : graphicIndex === totalGraphicsCount - 2;
			if (isEdgePageReached) {
				return; // Cannot flip further.
			}

			// Check if there are pages to flip to.
			const isMiddlePagePresent = activeSideIsLeft ? graphicIndex > 0 : graphicIndex < totalGraphicsCount - 2;
			if (isMiddlePagePresent) {
				// Set target positions for the animation to complete a full flip.
				pointerCoords = {top: activeSettings.sheetHeight, left: activeSideIsLeft ? activeSettings.sheetWidth * 2 : 0};
				trackerCoords = {left: activeSideIsLeft ? 1 : activeSettings.sheetWidth * 2 - 1, top: activeSettings.sheetHeight - 1};
				
				animationRunning = true; // Start the animation.

				// Get the appropriate completion handler for the flip direction.
				completionCallback = retrieveCompletionHandler(activeSideIsLeft);
			}
		}

		/**
		 * Returns a function that handles the completion of a page-flipping animation.
		 * @param {boolean} isLeftPanelEngagedForCompletion True if the left page was active during the flip.
		 * @returns {Function} A callback function for animation completion.
		 */
		function retrieveCompletionHandler(isLeftPanelEngagedForCompletion) {
			return function() {
				// Adjust the current graphic index based on flip direction.
				graphicIndex += isLeftPanelEngagedForCompletion ? -2 : 2;
				// Reset pointer and tracker positions.
				pointerCoords = {left: isLeftPanelEngagedForCompletion ? 0 : activeSettings.sheetWidth * 2, top: activeSettings.sheetHeight};
				trackerCoords = pointerCoords; // Tracker snaps to pointer.
				renderStaticBackground(); // Redraw the static background pages.
				eraseOverlaySurface(); // Clear the temporary canvas.

				isPointerDown = false; // No longer dragging.
			};
		}

		/**
		 * Handles the event when the user releases the mouse button or lifts a finger.
		 * @param {Event} evt The event object.
		 */
		function processInteractionEnd(evt) {
			if (nextReleaseIsClick) {
				handleSurfaceTap(); // If it was a quick press/release, treat as click.
				return;
			}

			if (!animationRunning) { // Only process if no animation is currently running.
				// If at the edge of the book, prevent further action.
				if (activeSideIsLeft ? graphicIndex === 0 : graphicIndex === totalGraphicsCount - 2) {
					return;
				}

				const releaseXCoord = evt.pageX - jAlias(wrapperElement).position().left;

				// Determine if the release happened in a "drop zone" that triggers a full flip.
				const isDropZoneValid = activeSideIsLeft ? releaseXCoord > activeSettings.sheetWidth : releaseXCoord < activeSettings.sheetWidth;

				if (isDropZoneValid) {
					// Set pointer to the opposite edge to trigger a full flip animation.
					pointerCoords = {left: activeSideIsLeft ? activeSettings.fullPanelWidth : 0, top: activeSettings.sheetHeight};
					animationRunning = true; // Start the animation.

					// Get the completion handler for this flip.
					completionCallback = retrieveCompletionHandler(activeSideIsLeft);
				} else {
					// If not in a drop zone, snap the corner back to its initial position.
					pointerCoords = {left: activeSideIsLeft ? activeSettings.foldEdgeLength : activeSettings.fullPanelWidth - activeSettings.foldEdgeLength, top: activeSettings.sheetHeight - activeSettings.foldEdgeLength};
				}
			}
		}

		// Flag to determine if the next mouse up event should be treated as a click.
		let nextReleaseIsClick = false;

		/**
		 * Handles the event when the user presses the mouse button or touches the screen.
		 * @param {Event} evt The event object.
		 */
		function processInteractionStart(evt) {
			nextReleaseIsClick = true; // Assume it's a click until a move event occurs.
			if (!animationRunning) {
				const originOffset = jAlias(wrapperElement).position(); // Get position of the container.
				// Calculate coordinates relative to the canvas.
				const localCoords = {top: evt.pageY - originOffset.top - activeSettings.panelTopPadding, left: evt.pageX - originOffset.left};
			
				// Check if the interaction is within the valid page height.
				if (localCoords.top >= 0 && localCoords.top < activeSettings.sheetHeight) {
					// Determine if interaction is on the left or right half of the spread.
					if (localCoords.left >= 0 && localCoords.left < activeSettings.sheetWidth) {
						// Interaction on the left page.
						pointerCoords = {left: activeSettings.foldEdgeLength, top: activeSettings.sheetHeight - activeSettings.foldEdgeLength};
						if (!activeSideIsLeft) {
							activeSideIsLeft = true; // Set left side as active.
							trackerCoords = {left: 0, top: activeSettings.sheetHeight}; // Initialize tracker.
						}
					} else if (localCoords.left >= activeSettings.sheetWidth && localCoords.left < activeSettings.fullPanelWidth) {
						// Interaction on the right page.
						pointerCoords = {left: activeSettings.fullPanelWidth - activeSettings.foldEdgeLength, top: activeSettings.sheetHeight - activeSettings.foldEdgeLength};
						if (activeSideIsLeft) {
							activeSideIsLeft = false; // Set right side as active.
							trackerCoords = {left: activeSettings.fullPanelWidth, top: activeSettings.sheetHeight}; // Initialize tracker.
						}
					} else {
						// Interaction outside a page (e.g., in the gap), snap to edge.
						pointerCoords = {left: activeSideIsLeft ? 0 : activeSettings.fullPanelWidth, top: activeSettings.sheetHeight};
					}

					evt.preventDefault(); // Prevent default browser actions (e.g., text selection).
					isPointerDown = true; // Set dragging flag.
				}
			}
		}
		
		/**
		 * Handles the event when the pointer leaves the canvas area.
		 * @param {Event} evt The event object.
		 */
		function handlePointerExit(evt) {
			// If not dragging and no animation, snap pointer to the nearest edge.
			if (!isPointerDown && !animationRunning) {
				pointerCoords = {left: activeSideIsLeft ? 0 : activeSettings.fullPanelWidth, top: activeSettings.sheetHeight};
			}
		}

		/**
		 * Handles the event when the pointer moves over the canvas area.
		 * @param {Event} evt The event object.
		 */
		function handlePointerMove(evt) {
			nextReleaseIsClick = false; // A move indicates it's not a simple click.
			// Only update if not dragging and no animation is running.
			if (!isPointerDown && !animationRunning) {
				const originOffset = jAlias(wrapperElement).position();
				// Calculate coordinates relative to the canvas.
				const localCoords = {top: evt.pageY - originOffset.top - activeSettings.panelTopPadding, left: evt.pageX - originOffset.left};
			
				// Check if pointer is within the valid page height.
				if (localCoords.top >= 0 && localCoords.top < activeSettings.sheetHeight) {
					// Determine if pointer is on the left or right half of the spread.
					if (localCoords.left >= 0 && localCoords.left < activeSettings.sheetWidth) {
						// Pointer on the left page.
						pointerCoords = {left: activeSettings.foldEdgeLength, top: activeSettings.sheetHeight - activeSettings.foldEdgeLength};
						if (!activeSideIsLeft) {
							activeSideIsLeft = true; // Set left side as active.
							trackerCoords = {left: 0, top: activeSettings.sheetHeight}; // Initialize tracker.
						}
					} else if (localCoords.left >= activeSettings.sheetWidth && localCoords.left < activeSettings.fullPanelWidth) {
						// Pointer on the right page.
						pointerCoords = {left: activeSettings.fullPanelWidth - activeSettings.foldEdgeLength, top: activeSettings.sheetHeight - activeSettings.foldEdgeLength};
						if (activeSideIsLeft) {
							activeSideIsLeft = false; // Set right side as active.
							trackerCoords = {left: activeSettings.fullPanelWidth, top: activeSettings.sheetHeight}; // Initialize tracker.
						}
					} else {
						// Pointer outside a page, snap to edge.
						pointerCoords = {left: activeSideIsLeft ? 0 : activeSettings.fullPanelWidth, top: activeSettings.sheetHeight};
					}
				} else {
					// Pointer outside page height, snap to edge.
					pointerCoords = {left: activeSideIsLeft ? 0 : activeSettings.fullPanelWidth, top: activeSettings.sheetHeight};
				}
			}
		}

		/**
		 * Finalizes any ongoing animation, snapping the page to its final position
		 * and executing the completion callback.
		 */
		function finalizeAnimation() {
			if (completionCallback != null) {
				completionCallback(); // Execute the stored callback.
				completionCallback = null; // Clear the callback.
			}

			animationRunning = false; // Mark animation as complete.
		}

		/**
		 * Updates the positions of the dynamic tracker point based on the pointer.
		 * This function performs the core physics and geometry calculations for the page flip.
		 */
		function recalculateControlPoints() {
			if (pointerCoords == null) {
				return; // No pointer, nothing to update.
			}

			// Calculate the delta for the tracker to smoothly follow the pointer.
			let trackerChangeY = (pointerCoords.top - trackerCoords.top) * activeSettings.smoothFactor;
			let trackerChangeX = (pointerCoords.left - trackerCoords.left) * activeSettings.smoothFactor;

			// Snap to zero if changes are very small to prevent jitter.
			trackerChangeX = Math.abs(trackerChangeX) < 0.5 ? 0 : trackerChangeX;
			trackerChangeY = Math.abs(trackerChangeY) < 0.5 ? 0 : trackerChangeY;

			// If both changes are zero, the tracker has caught up; finalize the animation.
			if (trackerChangeX === 0 && trackerChangeY === 0) {
				finalizeAnimation();
				return;
			}

			// Apply the changes to the tracker's position.
			trackerCoords.top += trackerChangeY;
			trackerCoords.left += trackerChangeX;

//			console.debug('pointer: x - ' + pointerCoords.left + ', y - ' + pointerCoords.top);
//			console.debug('tracker: x - ' + trackerCoords.left + ', y - ' + trackerCoords.top);

			// --- Geometric calculations for page curling effect ---

			// Delta from the bottom spine point to the tracker.
			let diffX = trackerCoords.left - activeSettings.sheetWidth;
			let diffY = foldBottomYCoord - trackerCoords.top;

			// Angle from bottom spine to tracker.
			const bindingToTrackerAngle = Math.atan2(diffY, diffX);

			// Calculate a potential corner point based on the page width radius.
			let cornerRadiusX = Math.cos(bindingToTrackerAngle) * activeSettings.sheetWidth + activeSettings.sheetWidth;
			let cornerRadiusY = foldBottomYCoord - Math.sin(bindingToTrackerAngle) * activeSettings.sheetWidth;

			// Distance from bottom spine to tracker.
			let distToTracker = Math.sqrt(
				(foldBottomYCoord - trackerCoords.top) * (foldBottomYCoord - trackerCoords.top) +
				(trackerCoords.left - activeSettings.sheetWidth) * (trackerCoords.left - activeSettings.sheetWidth)
			);
			// Distance from bottom spine to the calculated radius point.
			const distToCornerRadius = Math.sqrt(
				(foldBottomYCoord - cornerRadiusY) * (foldBottomYCoord - cornerRadiusY) +
				(cornerRadiusX - activeSettings.sheetWidth) * (cornerRadiusX - activeSettings.sheetWidth)
			);

			let pivotX;
			let pivotY;
			// If tracker is further than the radius point, use the radius point as the pivot.
			if (distToCornerRadius < distToTracker) {
				pivotX = cornerRadiusX;
				pivotY = cornerRadiusY;
			} else {
				// Otherwise, the tracker itself is the pivot point.
				pivotX = trackerCoords.left;
				pivotY = trackerCoords.top;
			}
			
			// Delta from the top spine point to the current pivot.
			diffX = foldTopXCoord - pivotX;
			diffY = pivotY; // Y is relative to top of canvas.

			// Distance from top spine to pivot.
			distToTracker = Math.sqrt(diffX * diffX + diffY * diffY);
			const bindingTopToTrackerAngle = Math.atan2(diffY, diffX);

			// If the distance to the pivot exceeds the page diagonal, constrain it.
			if (distToTracker > activeSettings.panelDiagonalLength) {
				// Recalculate pivot based on page diagonal radius from top spine.
				let radius2HandleX = -Math.cos(bindingTopToTrackerAngle) * activeSettings.panelDiagonalLength + activeSettings.sheetWidth;
				let radius2HandleY = foldTopYCoord + Math.sin(bindingTopToTrackerAngle) * activeSettings.panelDiagonalLength;

				pivotX = radius2HandleX;
				pivotY = radius2HandleY;
			}

			// Calculate the bisector point between the pivot and the bottom spine.
			let midpointX = activeSideIsLeft ? pivotX / 2 : ((activeSettings.sheetWidth * 2 - pivotX) / 2 + pivotX);
			let midpointY = (activeSettings.sheetHeight - pivotY) / 2 + pivotY;

			// Calculate the angle of the bisector line.
			const midpointAngle = Math.atan2(activeSettings.sheetHeight - midpointY, activeSideIsLeft ? midpointX : activeSettings.sheetWidth * 2 - midpointX);
			// Calculate the X-component of the tangent line from the bisector.
			let midpointDeltaX = Math.tan(midpointAngle) * (activeSettings.sheetHeight - midpointY);
			let midpointTangentX = midpointX + midpointDeltaX * (activeSideIsLeft ? 1 : -1);
			if (midpointTangentX < 0) { // Ensure tangent doesn't go off-screen to the left.
				midpointTangentX = 0;
			}

			// Calculate the page rotation angle.
			const panelAngleDiffY = midpointTangentYCoord - pivotY;
			const panelAngleDiffX = midpointTangentX - pivotX;
			sheetRotationAngle = activeSideIsLeft ? Math.atan2(-panelAngleDiffY, -panelAngleDiffX) : Math.atan2(panelAngleDiffY, panelAngleDiffX);

			// Calculate the center point of the flipping page after rotation.
			const panelAnchorX = pivotX + activeSettings.sheetWidth / 2 * Math.cos(sheetRotationAngle) * (activeSideIsLeft ? -1 : 1)
				+ activeSettings.sheetHeight / 2 * Math.sin(sheetRotationAngle);
			const panelAnchorY = pivotY - activeSettings.sheetHeight / 2 * Math.cos(sheetRotationAngle)
				+ activeSettings.sheetWidth / 2 * Math.sin(sheetRotationAngle) * (activeSideIsLeft ? -1 : 1);
			
			// --- Calculations for clipping mask ---

			// Angle for the clipping mask.
			const clipTangentAngle = Math.atan2(activeSettings.sheetHeight - midpointY,
				midpointX - midpointTangentX);
			let clipRotationAngle = 90 * (clipTangentAngle / Math.abs(clipTangentAngle)) - clipTangentAngle * 180 / Math.PI;
			clipRotationAngle = clipRotationAngle / 180 * Math.PI;

			// Coefficients for the line equation of the bisector.
			const coeffA = midpointTangentYCoord - midpointY;
			const coeffB = midpointX - midpointTangentX;
			const coeffC = midpointTangentX * midpointY - midpointX * midpointTangentYCoord;

			// Calculate the x-intercept for the clipping mask.
			const halfClipX = -(coeffB * activeSettings.sheetHeight / 2 + coeffC) / coeffA;
			const halfClipOffset = activeSettings.sheetCropWidth / 2 / Math.cos(clipRotationAngle);

			// Position of the clipping mask.
			const clipLeft = halfClipX + halfClipOffset * (activeSideIsLeft ? 1 : -1);
			const clipTop = activeSettings.sheetHeight / 2;

			// Position for the second clipping mask (for the incoming page).
			const secondaryClipLeft = clipLeft +
				(activeSideIsLeft ?
					-halfClipOffset * 3 : // Offset for left side flip.
					halfClipOffset);     // Offset for right side flip.

//			secondaryClipLeft -= activeSettings.sheetWidth * Math.cos(clipRotationAngle); // (Original commented line)

			// Draw the dynamic flipping page and the incoming page.
			renderSheet(panelAnchorX, panelAnchorY, sheetRotationAngle, clipLeft, clipTop, clipRotationAngle, secondaryClipLeft);
		}

		/**
		 * Mirrors an X coordinate across the center of the spread.
		 * @param {number} inputVal The X coordinate to mirror.
		 * @returns {number} The mirrored X coordinate.
		 */
		function reflectHorizontal(inputVal) {
			return activeSettings.fullPanelWidth - inputVal;
		}

		/**
		 * Draws the flipping page and the incoming page on the temporary canvas with clipping and rotation.
		 * @param {number} panelAnchorX X-coordinate for the center of the flipping page.
		 * @param {number} panelAnchorY Y-coordinate for the center of the flipping page.
		 * @param {number} sheetRotationAngle Rotation angle for the flipping page.
		 * @param {number} clipX X-coordinate for the clipping mask.
		 * @param {number} clipY Y-coordinate for the clipping mask.
		 * @param {number} clipRotationAngle Rotation angle for the clipping mask.
		 * @param {number} secondaryClipX X-coordinate for the secondary clipping mask (for incoming page).
		 */
		function renderSheet(panelAnchorX, panelAnchorY, sheetRotationAngle, clipX, clipY, clipRotationAngle, secondaryClipX) {
			scratchpadContext.clearRect(0, 0, scratchpadSurface.width(), scratchpadSurface.height()); // Clear previous frame.

			// --- Draw the flipping page ---
			scratchpadContext.save(); // Save the current canvas state.

			// Apply transformations for clipping mask 1.
			scratchpadContext.translate(clipX, clipY + activeSettings.panelTopPadding);
			scratchpadContext.rotate(clipRotationAngle);

			// Define and apply the clipping path.
			scratchpadContext.beginPath();
			scratchpadContext.rect(-activeSettings.sheetCropWidth / 2, -activeSettings.sheetCropHeight / 2, activeSettings.sheetCropWidth, activeSettings.sheetCropHeight);
			scratchpadContext.clip(); // Apply the clip.

			// Undo clipping transformations before drawing the page itself.
			scratchpadContext.rotate(-clipRotationAngle);
			scratchpadContext.translate(-clipX, -clipY - activeSettings.panelTopPadding);

			// Apply transformations for the flipping page.
			scratchpadContext.translate(panelAnchorX, panelAnchorY + activeSettings.panelTopPadding);
			scratchpadContext.rotate(sheetRotationAngle);

			// Draw the image that is currently flipping.
			renderGraphic(scratchpadContext, retrieveFlippingGraphic(), -activeSettings.sheetWidth / 2, -activeSettings.sheetHeight / 2);

			scratchpadContext.restore(); // Restore canvas state (removes clip and transforms).
			scratchpadContext.save(); // Save again for the second part.

			// --- Draw the incoming page ---
			// Apply transformations for clipping mask 2.
			scratchpadContext.translate(secondaryClipX, clipY + activeSettings.panelTopPadding);
			scratchpadContext.rotate(clipRotationAngle);

			scratchpadContext.beginPath();
//			scratchpadContext.fillStyle = 'red'; // (Original commented line)
//			scratchpadContext.fillRect(0, -activeSettings.panelDiagonalLength, activeSettings.sheetCropWidth, activeSettings.sheetCropHeight); // (Original commented line)
			scratchpadContext.rect(0, -activeSettings.panelDiagonalLength, activeSettings.sheetCropWidth, activeSettings.sheetCropHeight);
			scratchpadContext.clip(); // Apply the clip.

			// Undo clipping transformations.
			scratchpadContext.rotate(-clipRotationAngle);
			scratchpadContext.translate(-secondaryClipX, -clipY - activeSettings.panelTopPadding);

			// Draw the incoming image (not rotated, positioned statically).
			scratchpadContext.translate(0, 0); // No translation needed here, already handled by drawSource.
			renderGraphic(scratchpadContext, retrieveIncomingGraphic(), activeSideIsLeft ? 0 : activeSettings.sheetWidth, activeSettings.panelTopPadding);
			
			scratchpadContext.restore(); // Restore canvas state.
		}

		/**
		 * Positions a DOM element using CSS top and left properties.
		 * @param {HTMLElement} htmlElement The element to position.
		 * @param {number} posX The target X coordinate.
		 * @param {number} posY The target Y coordinate.
		 */
		function placeDomNode(htmlElement, posX, posY) {
			htmlElement = jAlias(htmlElement); // Ensure it's a jQuery object.
			htmlElement.css({
				top: posY - htmlElement.height() / 2 + activeSettings.panelTopPadding,
				left: posX - htmlElement.width() / 2
			});
		}

		/**
		 * Rotates a DOM element using CSS transforms.
		 * @param {HTMLElement} htmlElement The element to rotate.
		 * @param {number} rotationAngle The rotation angle in radians.
		 */
		function applyRotationTransform(htmlElement, rotationAngle) {
			const angleInDegrees = rotationAngle / Math.PI * 180; // Convert radians to degrees.
			jAlias(htmlElement)
				.css({
					'-moz-transform': 'rotate(' + angleInDegrees + 'deg)',    // Firefox
					'-webkit-transform': 'rotate(' + angleInDegrees + 'deg)' // Webkit browsers
					// Add other prefixes or standard 'transform' for broader support if needed.
				});
		}

		/**
		 * Starts the animation loop that continuously invalidates and redraws the canvas.
		 */
		function beginRenderLoop() {
			const animationTask = function() {
				triggerRedraw(); // Request a redraw.
				setTimeout(animationTask, activeSettings.renderInterval); // Schedule next redraw.
			};

			animationTask(); // Start the first task.
		}

		/**
		 * Triggers a redraw of the canvas by updating handle positions.
		 */
		function triggerRedraw() {
			recalculateControlPoints(); // Perform all necessary calculations and drawing.
		}

		/**
		 * Initializes the page flipper plugin on the given element.
		 * @param {HTMLElement} targetElement The element to initialize the flipper for.
		 */
		function initSheetTurner(targetElement) {
			buildDisplaySurfaces(targetElement); // Create canvases.

			initControlPoints(); // Set up initial pointer positions.

			enableUserInteraction(); // Bind event handlers.
			beginRenderLoop(); // Start the animation loop.
			
			prepareBlankGraphic(); // Initialize default blank image.

			// Load images from the list items within the target element.
			const imageNodeList = jAlias('li img', targetElement);
			totalGraphicsCount = imageNodeList.length + 2; // +2 for potential blank pages at ends.
			for (let idx = 0; idx < imageNodeList.length; idx++) {
				graphicSources[idx] = blankGraphic; // Placeholder for now.
				fetchSheetGraphic(imageNodeList, idx); // Start loading each image.
			}

			// If an odd number of images, add an extra blank page to make a spread.
			if (imageNodeList.length % 2 === 1) {
				graphicSources.push(blankGraphic);
				totalGraphicsCount++;
			}

			renderStaticBackground(); // Draw the initial background pages.
		}

		/**
		 * Draws the static background pages (left and right) on the main canvas.
		 */
		function renderStaticBackground() {
			const leftPanelGraphic = retrieveLeftGraphic(); // Get the image for the left page.
			const rightPanelGraphic = retrieveRightGraphic(); // Get the image for the right page.

			// Draw the left page image or clear the area if no image.
			if (leftPanelGraphic != null) {
				renderGraphic(displayContext, leftPanelGraphic, 0, activeSettings.panelTopPadding);
			} else {
				displayContext.clearRect(0, activeSettings.panelTopPadding, activeSettings.sheetWidth, activeSettings.sheetHeight);
			}
			// Draw the right page image or clear the area if no image.
			if (rightPanelGraphic != null) {
				renderGraphic(displayContext, rightPanelGraphic, activeSettings.sheetWidth, activeSettings.panelTopPadding);
			} else {
				displayContext.clearRect(activeSettings.sheetWidth, activeSettings.panelTopPadding, activeSettings.sheetWidth, activeSettings.sheetHeight);
			}
		}

		/**
		 * Draws a graphic source onto a given rendering context.
		 * @param {CanvasRenderingContext2D} renderCtx The 2D rendering context.
		 * @param {Object} graphicSource The source object containing type, data, and loaded status.
		 * @param {number} drawX The X coordinate to draw at.
		 * @param {number} drawY The Y coordinate to draw at.
		 */
		function renderGraphic(renderCtx, graphicSource, drawX, drawY) {
			if (graphicSource != null && graphicSource.kind != null && graphicSource.kind.length > 0) {
				if ((graphicSource.kind === 'image') && graphicSource.content != null) {
					if (graphicSource.isReady) {
						// Ensure image fits within page dimensions.
						renderCtx.drawImage(graphicSource.content, drawX, drawY, activeSettings.sheetWidth, activeSettings.sheetHeight);
					}
				} else if (graphicSource.kind === 'color') {
					renderCtx.fillStyle = graphicSource.content;
					renderCtx.fillRect(drawX, drawY, activeSettings.sheetWidth, activeSettings.sheetHeight);
				}
			} else {
				// Default behavior if source is null or invalid: draw blank page.
				renderCtx.fillStyle = activeSettings.initialSheetColor;
				renderCtx.fillRect(drawX, drawY, activeSettings.sheetWidth, activeSettings.sheetHeight);
			}
		}

		// Array to store all graphic sources (images, colors, etc.).
		let graphicSources = [];
		// The current index of the leftmost visible page.
		let graphicIndex = 0;
		// Total number of graphics, including potential blank pages.
		let totalGraphicsCount = 0;
		// Default blank graphic object.
		let blankGraphic = null;

		/**
		 * Initializes the default blank graphic object.
		 */
		function prepareBlankGraphic() {
			blankGraphic = {
				kind: 'color',
				content: activeSettings.initialSheetColor,
				isReady: true
			};
		}

		/**
		 * Loads an image for a specific page and updates the graphicSources array.
		 * @param {jQuery} imageNodeList A jQuery object containing all image elements.
		 * @param {number} idx The index of the image to load.
		 */
		function fetchSheetGraphic(imageNodeList, idx) {
			const imgElem = imageNodeList.get(idx);
			const imgObj = new Image();
			imgObj.src = jAlias(imgElem).attr('src');
			imgObj.onload = function() {
				// Once loaded, update the graphic source and redraw.
				graphicSources[idx] = {
					kind: 'image',
					content: imgObj,
					isReady: true
				};
				renderStaticBackground(); // Redraw static pages with the new image.
			};
			imgObj.onerror = function() {
				// Fallback to blank if image fails to load.
				graphicSources[idx] = blankGraphic;
				renderStaticBackground();
			};
		}

		/**
		 * Retrieves the graphic source for the left static page.
		 * @returns {Object|null} The graphic source object, or null if out of bounds.
		 */
		function retrieveLeftGraphic() {
			if (graphicIndex >= 0 && graphicIndex < totalGraphicsCount) {
				return graphicSources[graphicIndex];
			}
			return null;
		}

		/**
		 * Retrieves the graphic source for the right static page.
		 * @returns {Object|null} The graphic source object, or null if out of bounds.
		 */
		function retrieveRightGraphic() {
			if (graphicIndex + 1 >= 0 && graphicIndex + 1 < totalGraphicsCount) {
				return graphicSources[graphicIndex + 1];
			}
			return null;
		}

		/**
		 * Retrieves the graphic source for the page currently being flipped.
		 * @returns {Object|null} The graphic source object, or null if out of bounds.
		 */
		function retrieveFlippingGraphic() {
			const flipIdx = activeSideIsLeft ? graphicIndex : graphicIndex + 1;
			if (flipIdx >= 0 && flipIdx < totalGraphicsCount) {
				return graphicSources[flipIdx];
			}
			return null;
		}

		/**
		 * Retrieves the graphic source for the page that is appearing during a flip.
		 * @returns {Object|null} The graphic source object, or null if out of bounds.
		 */
		function retrieveIncomingGraphic() {
			const incomingIdx = activeSideIsLeft ? graphicIndex - 1 : graphicIndex + 2;
			if (incomingIdx >= 0 && incomingIdx < totalGraphicsCount) {
				return graphicSources[incomingIdx];
			}
			return null;
		}

		// Initialize the flipper for each selected element.
		return this.each(function () {
			initSheetTurner(this);
		});
	};
})(jQuery); // Pass jQuery as jAlias to the self-executing function.