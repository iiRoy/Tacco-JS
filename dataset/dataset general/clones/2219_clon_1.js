/// <reference path="../lib/jquery-1.4.1-vsdoc.js" /> /* This line serves as a reference for IDEs like Visual Studio. */

( function ( $s )
{  /* TODO: The original comment suggests renaming $s to $, but for Type I cloning,
      identifiers must remain unchanged. The code inside the IIFE uses the global `$` symbol. */
	$.fn.pageFlipper = function ( userOptions )
	{
		var defaults =
		{
			className        : 'canvasHolder' , // CSS class for the main container div
			pageWidth        : 500            , // Width of a single page
			pageHeight       : 375            , // Height of a single page
			easing           : 0.5            , // Easing factor for animation (0.0 - 1.0)
			fps              : 20             , // Frames per second for animation updates
			defaultPageColor : 'white'        , // Background color for empty pages
			backgroundColor  : 'white'        , // Background color of the entire flipper area
			cornerSide       : 50               // Initial distance from corner for manual flip start
		}; /* End of default options configuration. */

		var options = $.extend ( defaults, userOptions ); // Merge user options with defaults.
		options.updateDelay      = 1000 / options.fps; /* Calculated delay between animation frames. */
		options.spreadWidth      = options.pageWidth * 2; /* Total width of the open book spread. */
		options.pageDiagonal     = Math.sqrt( options.pageWidth * options.pageWidth + options.pageHeight * options.pageHeight ); // Diagonal length of a page.
		options.pageClipWidth    = options.pageWidth; /* Width for clipping regions. */
		options.pageClipHeight   = options.pageWidth * 10; /* Height for clipping regions (arbitrarily large). */
		options.pageHeightOffset = options.pageDiagonal - options.pageHeight; /* Offset for vertical positioning. */

		var canvas      = null; /* The primary canvas element for static pages. */
		var tempCanvas  = null; // Temporary canvas element for rendering the flipping page animation.
		var holder      = null; // jQuery object representing the main container div.
		var context     = null; /* 2D rendering context for the main canvas. */
		var tempContext = null; // 2D rendering context for the temporary canvas.

		var mousePosition    = null; /* Object storing the current mouse (or touch) coordinates. */
		var followerPosition = null; /* Object storing the animated position that "follows" the mouse, smoothed by easing. */

		var pageAngle = 0; // The current rotational angle of the page being flipped.

		var spineTopX      = options.pageWidth; /* X-coordinate of the top center of the book's spine. */
		var spineTopY      = 0;                 // Y-coordinate of the top of the book's spine (usually 0).
		var spineBottomTop = options.pageHeight; // Y-coordinate of the bottom center of the book's spine.

		var bisectorTangetY = options.pageHeight; // A Y-coordinate used in calculating the bisector tangent.

		var leftIsActive; // Boolean flag: true if the left page is being manipulated, false for the right.


		function createHandles ( )
		{
			// Initialize mouse and follower positions to the far right, simulating a right-to-left flip start.
			mousePosition    = { top: options.pageHeight, left: options.pageWidth * 2 };
			followerPosition = { top: options.pageHeight, left: options.pageWidth * 2 };
			leftIsActive     = false; // By default, assume a right-page flip initially.
		}


		function createCanvas ( element )
		{
			holder = $( "<div id='canvasHolder'></div>" ); // Create the main container div.
			holder
				.insertAfter( element ) /* Insert the new holder div immediately after the provided element. */
				.addClass( options.className ) // Apply the configured class name.
				.attr( 'width', options.pageWidth * 2 ) // Set the holder's width (double page width).
				.attr( 'height', options.pageHeight + options.pageHeightOffset * 2 ) // Set holder's height, including offsets.
			; /* Chaining jQuery methods for setup. */
			
			canvas = $( "<canvas id='mainCanvas'></canvas>" ); // Create the main canvas element.
			holder.append( canvas ); // Append the main canvas to the holder.

			canvas
				.attr( 'width', options.pageWidth * 2 ) // Set the main canvas width.
				.attr( 'height', options.pageHeight + options.pageHeightOffset * 2 ) // Set the main canvas height.
			;

			tempCanvas = $( "<canvas id='tempCanvas'></canvas>" ); // Create the temporary canvas for animations.
			tempCanvas
				.css({
					position : 'absolute' , // Position absolutely over the main canvas.
					top      : canvas.position().top ,
					left     : canvas.position().left
				})
				.attr( 'width', canvas.width() )    // Match width of main canvas.
				.attr( 'height', canvas.height() )  // Match height of main canvas.
				.appendTo( holder )
			; /* Apply styles, attributes, and append to the holder. */
				
			context     = canvas.get(0).getContext( '2d' );     // Get 2D rendering context for main canvas.
			tempContext = tempCanvas.get(0).getContext( '2d' ); // Get 2D rendering context for temporary canvas.

			context.strokeStyle = "#aaaaaa"; // Set the color for the spine line.
			context.beginPath();             // Start a new path.
			context.moveTo( options.pageWidth, options.pageHeightOffset ); // Move to the top of the spine.
			context.lineTo( options.pageWidth, options.pageHeight + options.pageHeightOffset ); // Draw to the bottom of the spine.
			context.stroke(); // Render the spine line.
		}


		function getRealPosition ( element, position )
		{
			element = $( element ); // Ensure we're working with a jQuery object.
			if ( position == null ) // If no position is provided, get the element's current position.
			{
				position = element.position();
			}

			return {
				top  : position.top  + element.height() / 2 - options.pageHeightOffset , // Calculate adjusted top position.
				left : position.left + element.width()  / 2                               // Calculate adjusted left position.
			};
		}


		var dragging       = false;     // A boolean flag indicating if the user is actively dragging a page corner.
		var flipInProgress = false; // A boolean flag indicating if an automatic page flip animation is currently running.


		function activateMouseHandle ( )
		{
			$( tempCanvas ) // Bind events to the temporary canvas (which overlays the main content).
				.bind( 'mousemove', onCanvasHovering )   // Mouse movement event.
				.bind( 'mouseout', onCanvasHoverOut )     // Mouse leaving the canvas event.
				.bind( 'mousedown', onCanvasActionStart ) // Mouse button pressed event.
				.bind( 'touchstart', onCanvasActionStart ) // Touch screen pressed event.
			;

			$( document ) // Bind global events to the document for broader drag/touch tracking.
				.bind( 'mousemove', function( event )
				{
					nextMouseUpIsClick = false; // Any mouse movement means the next mouseup is *not* a click.
					if ( !flipInProgress ) // Only update mouse position if no automatic flip is in progress.
					{
						if ( dragging ) // If a drag operation is active.
						{
							mousePosition = {
								left : event.pageX - $( holder ).position().left , // Calculate X relative to holder.
								top  : event.pageY - options.pageHeightOffset + 70   // Calculate Y relative to holder, with an offset.
							};
						}
					}
				})
				.bind( 'touchmove', function( event )
				{
					nextMouseUpIsClick = false; // Any touch movement means the next touchend is *not* a click.
					if ( !flipInProgress ) // Only update if no automatic flip.
					{
						if ( dragging && event.originalEvent != null && event.originalEvent.touches.length == 1 )
						{
							event.preventDefault(); // Prevent default browser touch behavior (e.g., scrolling).
							var touch = event.originalEvent.touches[0]; // Get the first touch point.
							mousePosition = {
								left : touch.screenX - $( holder ).position().left , // Calculate X relative to holder.
								top  : touch.screenY - options.pageHeightOffset + 70   // Calculate Y relative to holder, with an offset.
							};
						}
					}
				})
				.bind( 'mouseup', onCanvasActionStop )   // Mouse button released event.
				.bind( 'touchend', onCanvasActionStop ) // Touch screen released event.
			;
		}


		var onCornerMoveComplete; // A callback function to be executed when a page flip animation completes.


		function clearTempCanvas ( )
		{
			tempContext.clearRect( 0, 0, tempCanvas.width(), tempCanvas.height() ); // Clears the entire temporary canvas.
		}


		function onCanvasClick ( )
		{
			if ( flipInProgress ) // If a flip is already underway (e.g., auto-flipping).
			{
				completeFlip();    // Force the current flip to finish immediately.
				clearTempCanvas(); // Clear any partial flip drawing.

				invalidate(); // Redraw the main canvas to reflect the completed flip.
			}

			// Check if we are at the very first or very last visible page.
			var lastDirectionPage = leftIsActive ? imageIndex == 0 : imageIndex == sourceImagesLength - 2;
			if ( lastDirectionPage )
			{
				return; // If so, we cannot flip further in this direction.
			}

			// Check if there are more pages to flip to in the current direction.
			var pageIsNotLast = leftIsActive ? imageIndex > 0 : imageIndex < sourceImagesLength - 2;
			if ( pageIsNotLast )
			{
				// Set mouse and follower positions to trigger an automatic full flip.
				mousePosition    = { top: options.pageHeight, left: leftIsActive ? options.pageWidth * 2 : 0 };
				followerPosition = { left: leftIsActive ? 1 : options.pageWidth * 2 - 1, top: options.pageHeight - 1 };
				
				flipInProgress = true; // Mark that an automatic flip animation has started.

				onCornerMoveComplete = getOnCornerMoveComplete( leftIsActive ); // Assign the appropriate completion callback.
			}
		}


		function getOnCornerMoveComplete ( leftPageIsActive )
		{
			return function( )
			{
				imageIndex    += leftPageIsActive ? -2 : 2; // Adjust the image index by two pages (one spread).
				mousePosition    = { left: leftPageIsActive ? 0 : options.pageWidth * 2, top: options.pageHeight }; // Reset mouse position to the edge.
				followerPosition = mousePosition; // Snap the follower to the mouse position.
				drawBackgroundPages(); // Redraw the static background pages with the new content.
				clearTempCanvas(); // Clear the temporary canvas, removing the flipping page.

				dragging = false; // Ensure dragging state is reset.
			}; /* End of the anonymous function returned. */
		}


		function onCanvasActionStop ( event )
		{
			if ( nextMouseUpIsClick ) // If the flag indicates this was a click (not a drag-end).
			{
				onCanvasClick(); // Process it as a click.
				return;
			}

			if ( !flipInProgress ) // Only proceed if no automatic flip is currently in progress.
			{
				dragging = false; // Stop the dragging operation.

				// Check if at the boundary where no more pages can be flipped.
				if ( leftIsActive ? imageIndex == 0 : imageIndex == sourceImagesLength - 2 )
				{
					return; // If at boundary, do nothing further.
				}

				var left = event.pageX - $( holder ).position().left; // Get the X-coordinate relative to the holder.

				// Determine if the drop occurred in the "action drop area" (past the spine).
				var actionDropArea = leftIsActive ? left > options.pageWidth : left < options.pageWidth;

				if ( actionDropArea ) // If the page was dragged sufficiently far to trigger a full flip.
				{
					mousePosition    = { left: leftIsActive ? options.spreadWidth : 0, top: options.pageHeight }; // Set target to the far edge.
					flipInProgress = true; // Start an automatic flip animation to the edge.

					onCornerMoveComplete = getOnCornerMoveComplete( leftIsActive ); // Assign the completion callback.
				}
				else // If the page was not dragged far enough.
				{
					// Snap the page back to its initial "corner-peeled" position.
					mousePosition = { left: leftIsActive ? options.cornerSide : options.spreadWidth - options.cornerSide, top: options.pageHeight - options.cornerSide };
				}
			}
		}


		var nextMouseUpIsClick = false; // Flag to distinguish a simple click from the end of a drag.


		function onCanvasActionStart ( event )
		{
			nextMouseUpIsClick = true; // Optimistically assume this is a click, will be reset on mousemove.
			if ( !flipInProgress ) // Prevent interaction if an automatic flip is already active.
			{
				var zeroPoint = $( holder ).position(); // Get the absolute position of the holder element.
				var relativePosition = {
					top  : event.pageY - zeroPoint.top - options.pageHeightOffset , // Calculate Y relative to the canvas area.
					left : event.pageX - zeroPoint.left                             // Calculate X relative to the canvas area.
				};
			
				if ( relativePosition.top >= 0 && relativePosition.top < options.pageHeight ) // Check if click/touch is within page height.
				{
					if ( relativePosition.left >= 0 && relativePosition.left < options.pageWidth ) // Left half of the spread.
					{
						mousePosition = { left: options.cornerSide, top: options.pageHeight - options.cornerSide }; // Set target for left corner peel.
						if ( !leftIsActive ) // If currently operating on the right page.
						{
							leftIsActive     = true; // Switch to activating the left page.
							followerPosition = { left: 0, top: options.pageHeight }; // Reset follower to left edge.
						}
					}
					else if ( relativePosition.left >= options.pageWidth && relativePosition.left < options.spreadWidth ) // Right half of the spread.
					{
						mousePosition = { left: options.spreadWidth - options.cornerSide, top: options.pageHeight - options.cornerSide }; // Set target for right corner peel.
						if ( leftIsActive ) // If currently operating on the left page.
						{
							leftIsActive     = false; // Switch to activating the right page.
							followerPosition = { left: options.spreadWidth, top: options.pageHeight }; // Reset follower to right edge.
						}
					}
					else // Clicked outside normal page areas, possibly near the spine or beyond spread.
					{
						mousePosition = { left: leftIsActive ? 0 : options.spreadWidth, top: options.pageHeight }; // Snap to the current active side's edge.
					}

					event.preventDefault(); // Prevent default browser actions (e.g., text selection, scrolling).
					dragging = true; // Set dragging flag to true.
				}
			}
		}
		
		function onCanvasHoverOut ( event )
		{
			if ( !dragging && !flipInProgress ) // Only react if not dragging and no auto-flip is active.
			{
				// When mouse leaves the canvas, reset the mouse position to the default corner of the active page.
				mousePosition = { left: leftIsActive ? 0 : options.spreadWidth, top: options.pageHeight };
			}
		}


		function onCanvasHovering ( event )
		{
			nextMouseUpIsClick = false; // Hovering implies it's not a click.
			if ( !dragging && !flipInProgress ) // Only update if not dragging or auto-flipping.
			{
				var zeroPoint = $( holder ).position(); // Get the absolute position of the holder.
				var relativePosition = {
					top  : event.pageY - zeroPoint.top - options.pageHeightOffset , // Calculate Y relative to the canvas area.
					left : event.pageX - zeroPoint.left                             // Calculate X relative to the canvas area.
				};
			
				if ( relativePosition.top >= 0 && relativePosition.top < options.pageHeight ) // Check if hover is within page height.
				{
					if ( relativePosition.left >= 0 && relativePosition.left < options.pageWidth ) // Hovering over left half.
					{
						mousePosition = { left: options.cornerSide, top: options.pageHeight - options.cornerSide }; // Set target for left corner peel.
						if ( !leftIsActive ) // If currently focused on the right page.
						{
							leftIsActive     = true; // Switch focus to the left page.
							followerPosition = { left: 0, top: options.pageHeight }; // Reset follower to left edge.
						}
					}
					else if ( relativePosition.left >= options.pageWidth && relativePosition.left < options.spreadWidth ) // Hovering over right half.
					{
						mousePosition = { left: options.spreadWidth - options.cornerSide, top: options.pageHeight - options.cornerSide }; // Set target for right corner peel.
						if ( leftIsActive ) // If currently focused on the left page.
						{
							leftIsActive     = false; // Switch focus to the right page.
							followerPosition = { left: options.spreadWidth, top: options.pageHeight }; // Reset follower to right edge.
						}
					}
					else // Hovering near the spine or outside active zones.
					{
						mousePosition = { left: leftIsActive ? 0 : options.spreadWidth, top: options.pageHeight }; // Snap to the current active side's edge.
					}
				}
				else // Hovering outside the page height area.
				{
					mousePosition = { left: leftIsActive ? 0 : options.spreadWidth, top: options.pageHeight }; // Snap to the current active side's edge.
				}
			}
		}


		function completeFlip ( )
		{
			if ( onCornerMoveComplete != null ) // If there's a completion callback assigned.
			{
				onCornerMoveComplete(); // Execute the callback.
				onCornerMoveComplete = null; // Clear the callback to prevent double execution.
			}

			flipInProgress = false; // Mark the flip animation as finished.
		}


		function updateHandlePositions ( )
		{
			if ( mousePosition == null ) // If mouse position hasn't been set yet, do nothing.
			{
				return;
			}

			// Calculate the incremental movement for the follower position based on easing.
			var followerDeltaTop  = ( mousePosition.top  - followerPosition.top  ) * options.easing;
			var followerDeltaLeft = ( mousePosition.left - followerPosition.left ) * options.easing;

			// If the delta is very small, snap to zero to prevent tiny, endless movements.
			followerDeltaLeft = Math.abs( followerDeltaLeft ) < 0.5 ? 0 : followerDeltaLeft;
			followerDeltaTop  = Math.abs( followerDeltaTop  ) < 0.5 ? 0 : followerDeltaTop;

			if ( followerDeltaLeft == 0 && followerDeltaTop == 0 ) // If follower has reached the target mouse position.
			{
				completeFlip(); // Trigger the flip completion logic.
				return;
			}

			followerPosition.top  += followerDeltaTop;  // Update follower's Y position.
			followerPosition.left += followerDeltaLeft; // Update follower's X position.

            /*
			// Original debug console outputs, commented out:
			//console.debug('mouse: x - ' + mousePosition.left + ', y - ' + mousePosition.top);
			//console.debug('follower: x - ' + followerPosition.left + ', y - ' + followerPosition.top);
            */

			var deltaX = followerPosition.left - options.pageWidth; // Horizontal distance from the spine center.
			var deltaY = spineBottomTop - followerPosition.top;   // Vertical distance from the bottom of the spine.

			var spineBottomToFollowerAngle = Math.atan2( deltaY, deltaX ); // Angle from spine bottom to follower position.

			var radiusLeft = Math.cos( spineBottomToFollowerAngle ) * options.pageWidth + options.pageWidth; // Calculated X for a point on a circle.
			var radiusTop  = spineBottomTop - Math.sin( spineBottomToFollowerAngle ) * options.pageWidth;    // Calculated Y for a point on a circle.

			var distanceToFollower = Math.sqrt(
				( spineBottomTop - followerPosition.top ) * ( spineBottomTop - followerPosition.top ) +
				( followerPosition.left - options.pageWidth ) * ( followerPosition.left - options.pageWidth )
			); /* Distance from spine bottom to follower. */
			var distanceToRadius = Math.sqrt(
				( spineBottomTop - radiusTop ) * ( spineBottomTop - radiusTop ) +
				( radiusLeft - options.pageWidth ) * ( radiusLeft - options.pageWidth )
			); /* Distance from spine bottom to calculated circle point. */

			var cornerX; /* X-coordinate of the page's actual flipping corner. */
			var cornerY; /* Y-coordinate of the page's actual flipping corner. */
			if ( distanceToRadius < distanceToFollower ) // If follower is inside the radius, use the circle point.
			{
				cornerX = radiusLeft;
				cornerY = radiusTop;
			}
			else // Otherwise, use the follower position directly.
			{
				cornerX = followerPosition.left;
				cornerY = followerPosition.top;
			}
			
			deltaX = spineTopX - cornerX; // Horizontal distance from spine top to corner.
			deltaY = cornerY;             // Vertical distance from spine top to corner.

			distanceToFollower = Math.sqrt( deltaX * deltaX + deltaY * deltaY ); // Recalculate distance from spine top to corner.
			var spineTopToFollowerAngle = Math.atan2( deltaY, deltaX ); // Angle from spine top to corner.

			if ( distanceToFollower > options.pageDiagonal ) // If the corner extends beyond the page's diagonal length.
			{
				// Clamp the corner position to the page diagonal.
				var radius2HandleX = -Math.cos( spineTopToFollowerAngle ) * options.pageDiagonal + options.pageWidth;
				var radius2HandleY = spineTopY + Math.sin( spineTopToFollowerAngle ) * options.pageDiagonal;

				cornerX = radius2HandleX;
				cornerY = radius2HandleY;
			}

			// Calculate the bisector point, which defines the fold line.
			var bisectorX = leftIsActive ? cornerX / 2 : ( ( options.pageWidth * 2 - cornerX ) / 2 + cornerX );
			var bisectorY = ( options.pageHeight - cornerY ) / 2 + cornerY;

			// Calculate the angle of the bisector line for clipping.
			var bisectorAngle = Math.atan2( options.pageHeight - bisectorY, leftIsActive ? bisectorX : options.pageWidth * 2 - bisectorX );
			var bisectorDeltaX = Math.tan( bisectorAngle ) * ( options.pageHeight - bisectorY );
			var bisectorTangetX = bisectorX + bisectorDeltaX * ( leftIsActive ? 1 : -1 );
			if ( bisectorTangetX < 0 ) // Ensure tangent X does not go negative.
			{
				bisectorTangetX = 0;
			}

			// Calculate the rotation angle of the flipping page.
			var pageAngleDeltaY = bisectorTangetY - cornerY;
			var pageAngleDeltaX = bisectorTangetX - cornerX;
			pageAngle = leftIsActive ? Math.atan2( -pageAngleDeltaY, -pageAngleDeltaX ) : Math.atan2( pageAngleDeltaY, pageAngleDeltaX );

			// Calculate the center position of the flipping page.
			var pageX = cornerX + options.pageWidth  / 2 * Math.cos( pageAngle ) * ( leftIsActive ? -1 : 1 )
				+ options.pageHeight / 2 * Math.sin( pageAngle );
			var pageY = cornerY - options.pageHeight / 2 * Math.cos( pageAngle )
				+ options.pageWidth  / 2 * Math.sin( pageAngle ) * ( leftIsActive ? -1 : 1 );
			
			// Calculate mask angle for the clipping path.
			var maskTanAngle = Math.atan2( options.pageHeight - bisectorY,
				bisectorX - bisectorTangetX );
			var maskAngle = 90 * ( maskTanAngle / Math.abs( maskTanAngle ) ) - maskTanAngle * 180 / Math.PI;
			maskAngle = maskAngle / 180 * Math.PI;

			// Calculate coefficients for the line equation (Ax + By + C = 0) of the bisector.
			var xCoefficient    = bisectorTangetY - bisectorY;
			var yCoefficient    = bisectorX - bisectorTangetX;
			var freeCoefficient = bisectorTangetX * bisectorY - bisectorX * bisectorTangetY;

			var halfPageClipX = -( yCoefficient * options.pageHeight / 2 + freeCoefficient ) / xCoefficient;
			var halfPageClipOffset = options.pageClipWidth / 2 / Math.cos( maskAngle );

			var maskLeft = halfPageClipX + halfPageClipOffset * ( leftIsActive ? 1 : -1 );
			var maskTop  = options.pageHeight / 2;

			var anotherMaskLeft = maskLeft +
				( leftIsActive ?
					-halfPageClipOffset * 3 : // Offset for the "appearing" page mask on left side.
					halfPageClipOffset );    // Offset for the "appearing" page mask on right side.

//			anotherMaskLeft -= options.pageWidth * Math.cos( maskAngle ); // This line was commented out in the original source.

			drawPage( pageX, pageY, pageAngle, maskLeft, maskTop, maskAngle, anotherMaskLeft ); // Render the flipping page elements.
		}


		function mirrorX ( value )
		{
			return options.spreadWidth - value; // Returns the X-coordinate mirrored across the center of the spread.
		}


		function drawPage ( pageX, pageY, pageAngle, maskX, maskY, maskAngle, anotherMaskX )
		{
			tempContext.clearRect( 0, 0, tempCanvas.width(), tempCanvas.height() ); // Clear the entire temporary canvas before drawing.

			tempContext.save(); // Save the current state of the temporary canvas.

			tempContext.translate( maskX, maskY + options.pageHeightOffset ); // Translate origin for the clipping mask.
			tempContext.rotate( maskAngle ); // Rotate context for the clipping mask.

			tempContext.beginPath(); // Start a new path for the clipping rectangle.
			tempContext.rect( -options.pageClipWidth / 2, -options.pageClipHeight / 2, options.pageClipWidth, options.pageClipHeight );
			tempContext.clip(); // Apply the clipping path. Only content within this path will be drawn.

			tempContext.rotate( -maskAngle ); // Rotate context back to original orientation.
			tempContext.translate( -maskX, -maskY - options.pageHeightOffset ); // Translate origin back.

			tempContext.translate( pageX, pageY + options.pageHeightOffset ); // Translate origin to the center of the flipping page.
			tempContext.rotate( pageAngle ); // Rotate context to the page's current angle.

			drawSource( tempContext, getFlipperImage(), -options.pageWidth / 2, -options.pageHeight / 2 ); // Draw the image of the page that is flipping.

			tempContext.restore(); // Restore the canvas state (undoes transforms and clipping).
			tempContext.save();    // Save the current canvas state again for the appearing page.

			tempContext.translate( anotherMaskX, maskY + options.pageHeightOffset ); // Translate origin for the second clipping mask.
			tempContext.rotate( maskAngle ); // Rotate context for the second clipping mask.

			tempContext.beginPath();
//			tempContext.fillStyle = 'red'; // Original code had this commented out.
//			tempContext.fillRect(0, -options.pageDiagonal, options.pageClipWidth, options.pageClipHeight); // Original code had this commented out.
			tempContext.rect( 0, -options.pageDiagonal, options.pageClipWidth, options.pageClipHeight ); // Define clipping rectangle.
			tempContext.clip(); // Apply the clipping path for the appearing page.

			tempContext.rotate( -maskAngle ); // Rotate context back.
			tempContext.translate( -anotherMaskX, -maskY - options.pageHeightOffset ); // Translate origin back.

			tempContext.translate( 0, 0 ); // No specific translation needed; draw relative to canvas origin.
			drawSource( tempContext, getAppearingImage(), leftIsActive ? 0 : options.pageWidth, options.pageHeightOffset ); // Draw the image of the page that is appearing.
			
			tempContext.restore(); // Restore the canvas state.
		}


		function positionElement ( element, x, y )
		{
			element = $( element ); // Ensure the element is a jQuery object.
			element.css({
				top  : y - element.height() / 2 + options.pageHeightOffset , // Calculate and set the top CSS property.
				left : x - element.width()  / 2                               // Calculate and set the left CSS property.
			});
		}


		function rotateElement ( element, angle )
		{
			var angleInDegrees = angle / Math.PI * 180; // Convert the angle from radians to degrees.
			$( element )
				.css({
					'-moz-transform'    : 'rotate(' + angleInDegrees + 'deg)' , // Apply rotation for Mozilla browsers.
					'-webkit-transform' : 'rotate(' + angleInDegrees + 'deg)'   // Apply rotation for Webkit browsers.
				});
		}


		function startInvalidationWorker ( )
		{
			var worker = function( )
			{
				invalidate(); // Execute the invalidate function once.
				setTimeout( worker, options.updateDelay ); // Schedule the next execution of the worker.
			};

			worker(); // Immediately start the first worker cycle.
		}


		function invalidate ( )
		{
			updateHandlePositions(); // Trigger the update of handle positions, which also redraws pages.
		}


		function initializeFlipper ( element )
		{
			createCanvas( element ); // Set up the main and temporary canvas elements.

			createHandles(); // Initialize mouse and follower positions.

			activateMouseHandle(); // Bind mouse and touch event handlers.
			startInvalidationWorker(); // Start the animation loop.
			
			initializeDefaultImage(); // Prepare a default image for pages that are not yet loaded or are blank.

			var listImages = $( 'li img', element ); // Select all <img> tags within <li> elements inside the target element.
			sourceImagesLength = listImages.length + 2; // Initialize total page count, adding 2 for virtual blank pages at ends.
			for ( var index = 0; index < listImages.length; index++ )
			{
				sourceImages[ index ] = defaultImage; // Assign a temporary default image.
				loadPageImage( listImages, index ); // Start loading the actual image for this page.
			}

			if ( listImages.length % 2 == 1 ) // If the number of actual images is odd.
			{
				sourceImages.push( defaultImage ); // Add an extra blank page to make the total even.
				sourceImagesLength++; // Increment the total source image count.
			}

			drawBackgroundPages(); // Draw the initial set of background (non-flipping) pages.
		}


		function drawBackgroundPages ( )
		{
			var leftImage  = getLeftImage();  // Retrieve the image data for the current left page.
			var rightImage = getRightImage(); // Retrieve the image data for the current right page.

			if ( leftImage != null ) // If there is an image for the left page.
			{
				drawSource( context, leftImage, 0, options.pageHeightOffset ); // Draw it on the main canvas.
			}
			else // If no image for the left page.
			{
				context.clearRect( 0, options.pageHeightOffset, options.pageWidth, options.pageHeight ); // Clear that area of the main canvas.
			}
			if ( rightImage != null ) // If there is an image for the right page.
			{
				drawSource( context, rightImage, options.pageWidth, options.pageHeightOffset ); // Draw it on the main canvas.
			}
			else // If no image for the right page.
			{
				context.clearRect( options.pageWidth, options.pageHeightOffset, options.pageWidth, options.pageHeight ); // Clear that area.
			}
		}


		function drawSource ( drawingContext, source, x, y )
		{
			// Only proceed if the source object is valid and has a defined type.
			if ( source != null && source.type != null && source.type.length > 0 )
			{
				if ( ( source.type == 'image' ) && source.data != null ) // If the source is an image and its data is available.
				{
					if ( source.isLoaded ) // Check if the image has finished loading.
					{
						// The original code was truncated here.