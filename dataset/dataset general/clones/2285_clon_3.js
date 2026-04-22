(function (jq) {

function SketchPadController (domElementIdentifier, configOptions) {
  // Internal reference to the instance for callback methods.
  var currentInstance = this;

  // Configuration settings, merged from defaults and user input.
  var activeSettings = jq.extend({}, jq.fn.sketchPad.defaults, configOptions);

  // The jQuery object representing the container element.
  var containerEl = jq(domElementIdentifier);

  // The jQuery object for the drawing surface (canvas).
  var drawingSurface = jq(activeSettings.canvasSelector, containerEl);

  // The raw DOM element of the drawing surface.
  var surfaceDomElement = drawingSurface.get(0);

  // The 2D rendering context for the canvas.
  var surfaceRenderingContext = null;

  // Stores the last point drawn to prevent overlapping.
  var lastPoint = { 'coordX': undefined, 'coordY': undefined };

  // Array to store all path segments for signature regeneration.
  var pathSegments = [];

  // Timeout ID for mouse leave event handling.
  var leaveTimerId = 0;

  // Flag indicating if the mouse button is currently held down.
  var isMouseDown = false;

  // Flag indicating if touch events are supported/used.
  var supportsTouch = false;

  // Flag to prevent redundant event binding.
  var areEventsActive = false;

  // Default font size for typed signatures.
  var baseTypeFontSize = 30;

  // Current font size for typed signatures, adjusted dynamically.
  var currentTypeFontSize = baseTypeFontSize;

  // Character count for typed signatures, used for scaling.
  var typedCharCount = 0;

  /**
   * Clears the mouse leave timeout and resets drawing state flags.
   * @private
   */
  function resetLeaveState () {
    clearTimeout(leaveTimerId);
    leaveTimerId = 0;
    isMouseDown = false;
  }

  /**
   * Renders a line segment on the canvas.
   * Prevents drawing over the exact same pixel for smoother lines.
   *
   * @private
   * @param {Object} eventData The event object (mouse or touch).
   * @param {Number} verticalOffset An optional Y-axis offset for drawing single dots.
   */
  function renderLineSegment (eventData, verticalOffset) {
    var elementOffset, currentX, currentY;

    if (!surfaceRenderingContext) {
        console.warn("Canvas context not initialized."); // Added guard
        return;
    }

    eventData.preventDefault(); // Prevent default browser actions like scrolling.

    elementOffset = jq(eventData.target).offset();

    // Clear any pending mouse leave timeout.
    clearTimeout(leaveTimerId);
    leaveTimerId = 0;

    // Determine coordinates based on event type (touch vs. mouse).
    var touchPoints = eventData.targetTouches;
    if (touchPoints && touchPoints.length > 0) {
      currentX = Math.floor(touchPoints[0].pageX - elementOffset.left);
      currentY = Math.floor(touchPoints[0].pageY - elementOffset.top);
    } else {
      currentX = Math.floor(eventData.pageX - elementOffset.left);
      currentY = Math.floor(eventData.pageY - elementOffset.top);
    }

    // Skip if new point is identical to the last one.
    if (lastPoint.coordX === currentX && lastPoint.coordY === currentY) {
      return;
    }

    // Initialize lastPoint if it's the first point in a stroke.
    if (lastPoint.coordX === undefined) {
      lastPoint.coordX = currentX;
    }
    if (lastPoint.coordY === undefined) {
      lastPoint.coordY = currentY;
    }

    // Apply vertical offset if provided (e.g., for initial dot).
    if (verticalOffset) {
      currentY += verticalOffset;
    }

    // Begin drawing the path.
    surfaceRenderingContext.beginPath();
    surfaceRenderingContext.moveTo(lastPoint.coordX, lastPoint.coordY);
    surfaceRenderingContext.lineTo(currentX, currentY);
    surfaceRenderingContext.lineCap = activeSettings.penCapStyle; // Use active setting.
    surfaceRenderingContext.stroke();
    surfaceRenderingContext.closePath();

    // Store the path segment.
    pathSegments.push({
      'endX' : currentX,
      'endY' : currentY,
      'beginX' : lastPoint.coordX,
      'beginY' : lastPoint.coordY
    });

    // Update lastPoint for the next segment.
    lastPoint.coordX = currentX;
    lastPoint.coordY = currentY;

    // Execute custom drawing callback if defined.
    if (activeSettings.onDrawCallback && typeof activeSettings.onDrawCallback === 'function') {
      activeSettings.onDrawCallback.apply(currentInstance);
    }
  }

  /**
   * Wrapper function for stopping drawing without needing an event object.
   * @private
   */
  function stopDrawingWrapper () {
    endDrawingProcess();
  }

  /**
   * Halts the drawing process on the canvas.
   * @private
   * @param {Object} [eventData] The event object, if stopping drawing due to an event.
   */
  function endDrawingProcess (eventData) {
    // If an event is provided, draw a final small segment.
    if (eventData) {
      renderLineSegment(eventData, 1); // Draw a dot to finish the stroke.
    } else {
      // If no event, remove listeners for touch/mouse movement.
      if (supportsTouch) {
        drawingSurface.each(function () {
          this.removeEventListener('touchmove', renderLineSegment);
        });
      } else {
        drawingSurface.off('mousemove.sketchpad');
      }

      // Execute custom drawing end callback if defined and path segments exist.
      if (pathSegments.length > 0 && activeSettings.onStrokeEnd && typeof activeSettings.onStrokeEnd === 'function') {
        activeSettings.onStrokeEnd.apply(currentInstance);
      }
    }

    // Reset last point coordinates.
    lastPoint.coordX = undefined;
    lastPoint.coordY = undefined;

    // Update the hidden output field with the JSON string of path segments.
    if (activeSettings.outputField && pathSegments.length > 0) {
      jq(activeSettings.outputField, containerEl).val(JSON.stringify(pathSegments));
    }
  }

  /**
   * Draws the baseline for the signature.
   * @private
   */
  function renderSignatureBaseline () {
    if (!activeSettings.signatureLineThickness) {
      return; // No line to draw if thickness is zero.
    }

    surfaceRenderingContext.beginPath();
    surfaceRenderingContext.lineWidth = activeSettings.signatureLineThickness;
    surfaceRenderingContext.strokeStyle = activeSettings.signatureLineColor;
    surfaceRenderingContext.moveTo(activeSettings.signatureLineMargin, activeSettings.signatureLinePosition);
    surfaceRenderingContext.lineTo(surfaceDomElement.width - activeSettings.signatureLineMargin, activeSettings.signatureLinePosition);
    surfaceRenderingContext.stroke();
    surfaceRenderingContext.closePath();
  }

  /**
   * Clears the entire canvas and redraws the signature line if needed.
   * @private
   */
  function clearDrawingSurface () {
    var currentCanvasWidth = surfaceDomElement.width;
    var currentCanvasHeight = surfaceDomElement.height;

    surfaceRenderingContext.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);
    surfaceRenderingContext.fillStyle = activeSettings.backgroundColor;
    surfaceRenderingContext.fillRect(0, 0, currentCanvasWidth, currentCanvasHeight);

    // Only draw the baseline if not in display-only mode.
    if (!activeSettings.readOnlyMode) {
      renderSignatureBaseline();
    }

    // Set pen style for subsequent drawing.
    surfaceRenderingContext.lineWidth = activeSettings.penThickness;
    surfaceRenderingContext.strokeStyle = activeSettings.penColor;

    // Clear the output field and path segments.
    jq(activeSettings.outputField, containerEl).val('');
    pathSegments = [];

    endDrawingProcess(); // Ensure drawing process is stopped.
  }

  /**
   * Event handler for mouse/touch movement on the canvas.
   * Delegates to `renderLineSegment` to draw.
   * @private
   * @param {Object} event The event object.
   * @param {Object} contextObject The DOM element context for the event.
   */
  function handleMouseMove(event, contextObject) {
    if (lastPoint.coordX === undefined) {
      renderLineSegment(event, 1); // Start with a dot if it's the first point.
    } else {
      renderLineSegment(event, contextObject);
    }
  }

  /**
   * Initiates the drawing process by binding move events.
   * @private
   * @param {Object} event The event object.
   * @param {Object} touchTarget The DOM element that received the touch event.
   */
  function initiateDrawing (event, touchTarget) {
    if (supportsTouch) {
      touchTarget.addEventListener('touchmove', handleMouseMove, false);
    } else {
      drawingSurface.on('mousemove.sketchpad', handleMouseMove);
    }

    // Draw a single point immediately on mouse down for precise starting.
    renderLineSegment(event, 1);
  }

  /**
   * Disables drawing by removing all associated mouse/touch events from the canvas.
   * @private
   */
  function deactivateDrawingEvents () {
    areEventsActive = false; // Reset the event binding flag.

    drawingSurface.each(function () {
      var currentDomEl = this;
      if (currentDomEl.removeEventListener) {
        currentDomEl.removeEventListener('touchend', stopDrawingWrapper);
        currentDomEl.removeEventListener('touchcancel', stopDrawingWrapper);
        currentDomEl.removeEventListener('touchmove', renderLineSegment);
      }

      // Clear any inline touchstart handlers.
      if (currentDomEl.ontouchstart) {
        currentDomEl.ontouchstart = null;
      }
    });

    jq(document).off('mouseup.sketchpad');
    drawingSurface.off('mousedown.sketchpad');
    drawingSurface.off('mousemove.sketchpad');
    drawingSurface.off('mouseleave.sketchpad');

    jq(activeSettings.clearButton, containerEl).off('click.sketchpad');
  }

  /**
   * Detects touch capability and binds initial drawing events.
   * Ensures events are bound only once.
   * @private
   * @param {Object} initialEvent The event object from the first interaction.
   */
  function setupDrawingEventHandlers (initialEvent) {
    if (areEventsActive) {
      return; // Events already bound.
    }

    areEventsActive = true;

    // Blur any active input fields to hide soft keyboards.
    jq('input').blur();

    // Determine if touch events are being used.
    if (initialEvent.targetTouches && initialEvent.targetTouches.length > 0) {
      supportsTouch = true;
    }

    if (supportsTouch) {
      drawingSurface.each(function () {
        this.addEventListener('touchend', stopDrawingWrapper, false);
        this.addEventListener('touchcancel', stopDrawingWrapper, false);
      });
      // Unbind mousedown if touch is detected, to avoid double handling.
      drawingSurface.off('mousedown.sketchpad');
    } else {
      jq(document).on('mouseup.sketchpad', function () {
        if (isMouseDown) { // Only stop drawing if mouse was down.
          endDrawingProcess();
          resetLeaveState();
        }
      });
      drawingSurface.on('mouseleave.sketchpad', function (e) {
        if (isMouseDown) {
          endDrawingProcess(e); // Stop drawing if mouse leaves while down.
        }

        if (isMouseDown && leaveTimerId === 0) {
          // Set a timeout to stop drawing if mouse leaves for a duration.
          leaveTimerId = setTimeout(function () {
            endDrawingProcess();
            resetLeaveState();
          }, 500); // Half-second timeout.
        }
      });

      // Clear inline touchstart handlers for mouse-only environments.
      drawingSurface.each(function () {
        this.ontouchstart = null;
      });
    }
  }

  /**
   * Activates the drawing mode:
   * Hides typing input, clears canvas, sets up event listeners, updates UI classes.
   * @private
   */
  function activateDrawingMode () {
    jq(activeSettings.typedInput, containerEl).hide();
    clearDrawingSurface();

    drawingSurface.each(function () {
      var currentDomEl = this;
      currentDomEl.ontouchstart = function (e) {
        e.preventDefault();
        isMouseDown = true;
        setupDrawingEventHandlers(e);
        initiateDrawing(e, currentDomEl);
      };
    });

    drawingSurface.on('mousedown.sketchpad', function (e) {
      e.preventDefault();

      // Only respond to left mouse button clicks (button code 1).
      if (e.which !== 1) {
        return false;
      }

      isMouseDown = true;
      setupDrawingEventHandlers(e);
      initiateDrawing(e);
    });

    jq(activeSettings.clearButton, containerEl).on('click.sketchpad', function (e) {
      e.preventDefault();
      clearDrawingSurface();
    });

    // Handle switching between drawing and typing.
    jq(activeSettings.typeOptionButton, containerEl).on('click.sketchpad', function (e) {
      e.preventDefault();
      activateTypingMode();
    });
    // Ensure draw button is unbound from previous states and then bound to do nothing.
    jq(activeSettings.drawOptionButton, containerEl).off('click.sketchpad');
    jq(activeSettings.drawOptionButton, containerEl).on('click.sketchpad', function (e) { e.preventDefault(); });

    // Update UI classes.
    jq(activeSettings.typeOptionButton, containerEl).removeClass(activeSettings.activeClass);
    jq(activeSettings.drawOptionButton, containerEl).addClass(activeSettings.activeClass);
    jq(activeSettings.signatureDisplayElement, containerEl).addClass(activeSettings.activeClass); // Added this to reflect current state.

    // Update description visibility.
    jq(activeSettings.typeDescription, containerEl).hide();
    jq(activeSettings.drawDescription, containerEl).show();
    jq(activeSettings.clearButton, containerEl).show();
  }

  /**
   * Activates the typing mode:
   * Hides canvas, shows typing input, disables drawing events, updates UI classes.
   * @private
   */
  function activateTypingMode () {
    clearDrawingSurface();
    deactivateDrawingEvents(); // Ensure drawing is fully disabled.
    jq(activeSettings.typedInput, containerEl).show();

    // Handle switching between typing and drawing.
    jq(activeSettings.drawOptionButton, containerEl).on('click.sketchpad', function (e) {
      e.preventDefault();
      activateDrawingMode();
    });
    // Ensure type button is unbound from previous states and then bound to do nothing.
    jq(activeSettings.typeOptionButton, containerEl).off('click.sketchpad');
    jq(activeSettings.typeOptionButton, containerEl).on('click.sketchpad', function (e) { e.preventDefault(); });

    jq(activeSettings.outputField, containerEl).val(''); // Clear signature data.

    // Update UI classes.
    jq(activeSettings.drawOptionButton, containerEl).removeClass(activeSettings.activeClass);
    jq(activeSettings.typeOptionButton, containerEl).addClass(activeSettings.activeClass);
    // Optionally update signatureDisplayElement class if it reflects active mode.
    // jq(activeSettings.signatureDisplayElement, containerEl).removeClass(activeSettings.activeClass);
  }

  // Initial setup when the controller is instantiated.
  (function initialize () {
    surfaceRenderingContext = surfaceDomElement.getContext('2d');
    if (!surfaceRenderingContext) {
      console.error("Failed to get 2D rendering context for canvas.");
      return; // Guard against context not being available.
    }

    // Set initial canvas styles.
    surfaceRenderingContext.lineJoin = 'round';
    surfaceRenderingContext.lineCap = activeSettings.penCapStyle;
    surfaceRenderingContext.strokeStyle = activeSettings.penColor;
    surfaceRenderingContext.lineWidth = activeSettings.penThickness;

    // Initial clear and mode activation.
    clearDrawingSurface();

    // If displayOnly, ensure no drawing interaction.
    if (activeSettings.readOnlyMode) {
      deactivateDrawingEvents();
      jq(activeSettings.clearButton, containerEl).hide();
      jq(activeSettings.drawOptionButton, containerEl).hide();
      jq(activeSettings.typeOptionButton, containerEl).hide();
      jq(activeSettings.typeDescription, containerEl).hide();
      jq(activeSettings.drawDescription, containerEl).hide();
      jq(activeSettings.typedInput, containerEl).hide(); // Ensure typed input is hidden.
    } else if (activeSettings.defaultAction === 'type') {
      activateTypingMode();
    } else {
      activateDrawingMode();
    }
  })();

  // Public API methods.
  this.regenerateSignature = function (signatureData) {
    clearDrawingSurface();
    if (!signatureData || signatureData.length === 0) {
      return;
    }

    // Ensure display styles are set for regeneration.
    surfaceRenderingContext.lineWidth = activeSettings.penThickness;
    surfaceRenderingContext.strokeStyle = activeSettings.penColor;
    surfaceRenderingContext.lineCap = activeSettings.penCapStyle;
    surfaceRenderingContext.lineJoin = 'round'; // Ensure consistent line join.

    for (var i = 0; i < signatureData.length; i++) {
      var segment = signatureData[i];
      surfaceRenderingContext.beginPath();
      surfaceRenderingContext.moveTo(segment.beginX, segment.beginY);
      surfaceRenderingContext.lineTo(segment.endX, segment.endY);
      surfaceRenderingContext.closePath();
      surfaceRenderingContext.stroke();
    }

    // Store the regenerated data in the output field.
    if (activeSettings.outputField) {
      jq(activeSettings.outputField, containerEl).val(JSON.stringify(signatureData));
    }
    pathSegments = signatureData; // Update internal pathSegments.
  };

  this.clearPad = function () {
    clearDrawingSurface();
  };

  this.getSignature = function () {
    return pathSegments;
  };

  this.getSignatureImage = function () {
      return surfaceDomElement.toDataURL(activeSettings.imageType);
  };
}

// jQuery plugin definition.
jq.fn.sketchPad = function (opts) {
  var methods = null;
  this.each(function () {
    var $this = jq(this);
    var instance = $this.data('sketchPad');
    if (instance) {
      // If instance exists, and options is a string, it's a method call.
      if (typeof opts === 'string' && typeof instance[opts] === 'function') {
        // Collect method return values, if any.
        var args = Array.prototype.slice.call(arguments, 1);
        methods = instance[opts].apply(instance, args);
      }
    } else {
      // If no instance, create a new one.
      instance = new SketchPadController(this, opts);
      $this.data('sketchPad', instance);
    }
  });
  return methods || this; // Return method results or jQuery object for chaining.
};

// Default settings for the sketch pad.
jq.fn.sketchPad.defaults = {
  canvasSelector: 'canvas',
  outputField: 'input.signatureOutput',
  clearButton: 'a.clearButton',
  typeOptionButton: 'a.typeItButton',
  drawOptionButton: 'a.drawItButton',
  typedInput: 'p.typedInput',
  drawDescription: 'p.drawDescription',
  typeDescription: 'p.typeDescription',
  signatureDisplayElement: 'div.signature', // New setting for the signature display container.
  activeClass: 'current',
  readOnlyMode: false,
  defaultAction: 'draw', // 'draw' or 'type'
  penThickness: 2,
  penColor: '#1a1a1a',
  penCapStyle: 'round',
  backgroundColor: '#ffffff',
  signatureLineThickness: 1,
  signatureLineColor: '#ccc',
  signatureLineMargin: 10,
  signatureLinePosition: 75, // Percentage from top or absolute pixel? Let's assume absolute for now.
  imageType: 'image/png', // Output image type.
  onDrawCallback: null,
  onStrokeEnd: null
};

})(jQuery);