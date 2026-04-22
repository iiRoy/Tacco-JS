/*
 * crop.js v1.0.0-alpha
 * A modern image selection utility, inspired by legacy tools.
 * @author Altered Labs <info@alteredlabs.com>
 * Copyright (c) 2023 Altered Labs - released under AL-GPL-2.0 License
 *
 * This software is provided "as is", without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a particular
 * purpose and non-infringement. In no event shall the authors or copyright holders be liable
 * for any claim, damages or other liability, whether in an action of contract, tort or otherwise,
 * arising from, out of or in connection with the software or the use or other dealings in the software.
 */

(function ($) {

  // Main entry point for the image selection plugin
  $.ImageRegionSelector = function (targetElement, configuration) {
    // --- Initial Setup and Configuration ---

    // Ensure jQuery is available
    if (typeof $ === 'undefined') {
      console.error('ImageRegionSelector requires jQuery to be loaded.');
      return;
    }

    let primaryTarget = targetElement;
    let pluginOptions = configuration;
    const instanceReference = this; // Store reference to the plugin instance

    // Input validation and normalization
    if (typeof primaryTarget === 'string') {
      primaryTarget = $(primaryTarget)[0];
    }
    if (typeof primaryTarget !== 'object' || primaryTarget === null) {
      console.error('ImageRegionSelector: Invalid target element provided.');
      return;
    }
    if (typeof pluginOptions !== 'object' || pluginOptions === null) {
      pluginOptions = {}; // Default to empty object if not provided
    }

    // Modern browser detection for compatibility features
    const isLegacyBrowser = (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0);
    const hasModernPointerEvents = !isLegacyBrowser; // Simplified for clone purpose

    // Adjust specific settings for older browsers if necessary
    if (!('trackDocumentEvents' in pluginOptions)) {
      pluginOptions.trackDocumentEvents = hasModernPointerEvents;
    }
    if (!('keyboardInputEnabled' in pluginOptions)) {
      pluginOptions.keyboardInputEnabled = hasModernPointerEvents;
    }

    // --- Define Default and Merge Settings ---
    const initialSettings = {
      // Core Behavior
      trackDocumentEvents: false,
      baseComponentClass: 'img-crop-component',
      additionalCssClass: null,
      debugMode: false, // New option for logging

      // Visual Styling
      backgroundColorOverlay: 'black',
      backgroundTransparency: 0.5, // Changed from .6
      borderColorTransparency: 0.4,
      handleTransparency: 0.6, // Changed from .5

      handlePixelSize: 8, // Changed from 9
      handlePixelOffset: 4, // Changed from 5

      fixedAspectRatio: 0,
      keyboardInputEnabled: true,
      showCornerGrabbers: true,
      showSideGrabbers: true,
      renderSelectionBorders: true,
      enableEdgeDragging: true,

      maxContainerWidth: 0,
      maxContainerHeight: 0,
      boundaryPadding: 5, // Changed from 3
      animationFrameDelay: 25, // Changed from 20
      animationSpringiness: 4, // Changed from 3

      allowNewSelection: true,
      allowSelectionMovement: true,
      allowSelectionResizing: true,
      fadeDuration: 450, // Changed from 400

      minimumSelectionDimensions: [10, 10], // Changed from [0, 0]
      maximumSelectionDimensions: [0, 0],
      initialSelectionBounds: [0, 0, 0, 0], // New: for initial selection

      // Event Callbacks
      onSelectionChange: function (coords) {
        if (this.debugMode) console.log('Selection changed:', coords);
      },
      onSelectionComplete: function (coords) {
        if (this.debugMode) console.log('Selection finalized:', coords);
      },
      onPluginReady: function () {
        if (this.debugMode) console.log('ImageRegionSelector is ready.');
      }
    };

    // Helper to merge options, allowing deep merge if needed
    const mergeConfiguration = (target, source) => {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
            target[key] = mergeConfiguration(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    const currentConfig = mergeConfiguration(initialSettings, pluginOptions);
    if (currentConfig.debugMode) console.log('Current plugin configuration:', currentConfig);

    // --- DOM Element Preparation ---

    const imageBaseStyles = {
      border: 'none',
      margin: 0,
      padding: 0,
      position: 'absolute'
    };

    const $sourceImage = $(primaryTarget);
    if (!$sourceImage.length) {
      console.error('ImageRegionSelector: Target image element not found.');
      return;
    }

    // Clone the original image and prepare it for display
    const $clonedImage = $sourceImage.clone()
      .removeAttr('id') // Remove ID to prevent conflicts
      .attr('data-image-crop-clone', 'true') // Add a data attribute for identification
      .css(imageBaseStyles);

    // Explicitly set width/height from original to avoid issues with hidden images
    $clonedImage.css({
      width: $sourceImage.width(),
      height: $sourceImage.height()
    });

    // Insert cloned image and hide original
    $sourceImage.after($clonedImage).hide();

    // Ensure the container respects max dimensions
    const resizeContainer = ($imgElem, maxWidth, maxHeight) => {
      let currentWidth = $imgElem.width();
      let currentHeight = $imgElem.height();

      if (maxWidth > 0 && currentWidth > maxWidth) {
        currentHeight = (currentHeight * maxWidth) / currentWidth;
        currentWidth = maxWidth;
      }
      if (maxHeight > 0 && currentHeight > maxHeight) {
        currentWidth = (currentWidth * maxHeight) / currentHeight;
        currentHeight = maxHeight;
      }

      $imgElem.width(currentWidth).height(currentHeight);
    };
    resizeContainer($clonedImage, currentConfig.maxContainerWidth, currentConfig.maxContainerHeight);

    let containerWidth = $clonedImage.width();
    let containerHeight = $clonedImage.height();

    // Create the main wrapper for the cropping interface
    const $mainWrapper = $('<div />')
      .width(containerWidth)
      .height(containerHeight)
      .addClass(currentConfig.baseComponentClass + '-holder')
      .css({
        position: 'relative',
        backgroundColor: currentConfig.backgroundColorOverlay,
        overflow: 'hidden' // Ensure contents don't spill
      })
      .insertAfter($sourceImage)
      .append($clonedImage);

    // Remove the background color from options after use, to prevent accidental re-application
    delete currentConfig.backgroundColorOverlay;
    if (currentConfig.additionalCssClass) {
      $mainWrapper.addClass(currentConfig.additionalCssClass);
    }

    // Create the overlay image for the "selected" area
    const $overlayImage = $('<img />')
      .prop('src', $clonedImage.prop('src')) // Use .prop for image src
      .css(imageBaseStyles)
      .width(containerWidth)
      .height(containerHeight);

    // Wrapper for the overlay image, creating the visible selection
    const $overlayContentWrapper = $('<div />')
      .css({
        zIndex: 310, // Higher than main image
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      })
      .append($overlayImage);

    // Container for resize handles and borders
    const $handleContainer = $('<div />')
      .css('zIndex', 320) // Highest Z-index for interaction elements
      .width('100%')
      .height('100%');

    // The actual selection box element
    const $selectionArea = $('<div />')
      .css({
        position: 'absolute',
        zIndex: 300 // Between main image and handles
      })
      .insertBefore($clonedImage)
      .append($overlayContentWrapper, $handleContainer);

    // Create a transparent layer for tracking mouse events over the entire image area
    const interactionPadding = Math.max(0, currentConfig.boundaryPadding); // Ensure non-negative
    const $interactionLayer = $('<div />')
      .width(containerWidth + (interactionPadding * 2))
      .height(containerHeight + (interactionPadding * 2))
      .css({
        position: 'absolute',
        top: `${-interactionPadding}px`,
        left: `${-interactionPadding}px`,
        zIndex: 290, // Below selection area
        cursor: 'crosshair' // Indicating a new selection can be made
      })
      .mousedown(startNewSelection); // Event handler for starting a new selection

    $mainWrapper.append($interactionLayer); // Add interaction layer to the wrapper

    // --- Internal State Variables ---
    let backgroundTransparency = currentConfig.backgroundTransparency;
    let maxSelectionWidth = currentConfig.maximumSelectionDimensions[0] / 1; // Ensure number type
    let maxSelectionHeight = currentConfig.maximumSelectionDimensions[1] / 1;
    let minSelectionWidth = currentConfig.minimumSelectionDimensions[0] / 1;
    let minSelectionHeight = currentConfig.minimumSelectionDimensions[1] / 1;

    // Scale factors for coordinate transformations (if image is scaled, not used here directly)
    let horizontalScaleFactor = 1;
    let verticalScaleFactor = 1;
    let isInteractionEnabled = true;

    // Document offsets for mouse positions
    const documentScrollOffset = getElementPosition($clonedImage);

    // Flags for interaction state
    let isMouseDown = false;
    let lastCursorStyle = '';
    let isDimmed = false;
    let isAnimating = false;
    let isShiftKeyPressed = false; // For aspect ratio locking

    // --- Utility Functions ---

    // Converts a value to 'px' unit string
    const toPixelString = (val) => `${Math.round(val)}px`;

    // Converts a value to '%' unit string
    const toPercentString = (val) => `${Math.round(val)}%`;

    // Returns a CSS class name with the base prefix
    const getPrefixedClass = (suffix) => `${currentConfig.baseComponentClass}-${suffix}`;

    // Helper to get element position relative to document
    function getElementPosition(element) {
      const offset = element.offset();
      return [offset.left, offset.top];
    }

    // --- Coordinate Management Module ---
    const CoordinateManager = (function () {
      let selectionStartX = 0,
        selectionStartY = 0,
        selectionEndX = 0,
        selectionEndY = 0,
        lastOffsetX = 0,
        lastOffsetY = 0;

      // Sets the initial pressed coordinates
      function setInitialSelectionPoint(position) {
        const validatedPos = enforceBounds(position);
        selectionEndX = selectionStartX = validatedPos[0];
        selectionEndY = selectionStartY = validatedPos[1];
        if (currentConfig.debugMode) console.log('Initial selection point:', selectionStartX, selectionStartY);
      }

      // Updates the current end coordinates during a drag
      function updateCurrentSelectionPoint(position) {
        const validatedPos = enforceBounds(position);
        lastOffsetX = validatedPos[0] - selectionEndX;
        lastOffsetY = validatedPos[1] - selectionEndY;
        selectionEndX = validatedPos[0];
        selectionEndY = validatedPos[1];
        if (currentConfig.debugMode) console.log('Current selection point:', selectionEndX, selectionEndY);
      }

      // Returns the last calculated offset from previous to current point
      function getLastMovementOffset() {
        return [lastOffsetX, lastOffsetY];
      }

      // Moves the entire selection by a given offset
      function applyMovementOffset(offset) {
        let moveX = offset[0],
          moveY = offset[1];

        // Prevent moving past left/top boundaries
        if (selectionStartX + moveX < 0) moveX = -selectionStartX;
        if (selectionStartY + moveY < 0) moveY = -selectionStartY;

        // Prevent moving past right/bottom boundaries
        if (selectionEndY + moveY > containerHeight) moveY = containerHeight - selectionEndY;
        if (selectionEndX + moveX > containerWidth) moveX = containerWidth - selectionEndX;

        selectionStartX += moveX;
        selectionEndX += moveX;
        selectionStartY += moveY;
        selectionEndY += moveY;
        if (currentConfig.debugMode) console.log('Selection moved by:', moveX, moveY);
      }

      // Gets coordinates of a specific corner ('ne', 'nw', 'se', 'sw')
      function getCornerCoordinates(cornerIdentifier) {
        const currentRect = getAdjustedSelection();
        switch (cornerIdentifier) {
          case 'ne':
            return [currentRect.x2, currentRect.y];
          case 'nw':
            return [currentRect.x, currentRect.y];
          case 'se':
            return [currentRect.x2, currentRect.y2];
          case 'sw':
            return [currentRect.x, currentRect.y2];
          default:
            return [0, 0]; // Should not happen
        }
      }

      // Calculates and returns the selection rectangle, respecting aspect ratio and min/max sizes
      function getAdjustedSelection() {
        if (!currentConfig.fixedAspectRatio) {
          return getRawSelectionObject();
        }

        const aspectRatio = currentConfig.fixedAspectRatio;
        const effectiveMinX = minSelectionWidth / horizontalScaleFactor;
        const effectiveMinY = minSelectionHeight / verticalScaleFactor;
        const effectiveMaxX = maxSelectionWidth / horizontalScaleFactor;
        const effectiveMaxY = maxSelectionHeight / verticalScaleFactor;

        let currentWidth = selectionEndX - selectionStartX;
        let currentHeight = selectionEndY - selectionStartY;
        const absWidth = Math.abs(currentWidth);
        const absHeight = Math.abs(currentHeight);
        const currentRatio = absWidth / absHeight;

        let finalEndX = selectionEndX;
        let finalEndY = selectionEndY;

        const maxBoundedWidth = (effectiveMaxX === 0) ? containerWidth * 10 : effectiveMaxX;
        const maxBoundedHeight = (effectiveMaxY === 0) ? containerHeight * 10 : effectiveMaxY;

        // Adjust for aspect ratio
        if (currentRatio < aspectRatio) {
          // Height is the limiting factor, adjust width
          const newWidth = absHeight * aspectRatio;
          finalEndX = (currentWidth < 0) ? selectionStartX - newWidth : selectionStartX + newWidth;
          if (finalEndX < 0) {
            finalEndX = 0;
            const tempHeight = Math.abs((finalEndX - selectionStartX) / aspectRatio);
            finalEndY = (currentHeight < 0) ? selectionStartY - tempHeight : selectionStartY + tempHeight;
          } else if (finalEndX > containerWidth) {
            finalEndX = containerWidth;
            const tempHeight = Math.abs((finalEndX - selectionStartX) / aspectRatio);
            finalEndY = (currentHeight < 0) ? selectionStartY - tempHeight : selectionStartY + tempHeight;
          }
        } else {
          // Width is the limiting factor, adjust height
          const newHeight = absWidth / aspectRatio;
          finalEndY = (currentHeight < 0) ? selectionStartY - newHeight : selectionStartY + newHeight;
          if (finalEndY < 0) {
            finalEndY = 0;
            const tempWidth = Math.abs((finalEndY - selectionStartY) * aspectRatio);
            finalEndX = (currentWidth < 0) ? selectionStartX - tempWidth : selectionStartX + tempWidth;
          } else if (finalEndY > containerHeight) {
            finalEndY = containerHeight;
            const tempWidth = Math.abs((finalEndY - selectionStartY) * aspectRatio);
            finalEndX = (currentWidth < 0) ? selectionStartX - tempWidth : selectionStartX + tempWidth;
          }
        }

        // Apply min/max dimensions after aspect ratio adjustment
        currentWidth = finalEndX - selectionStartX;
        currentHeight = finalEndY - selectionStartY;

        if (currentWidth > 0) { // Right side
          if (currentWidth < effectiveMinX) {
            finalEndX = selectionStartX + effectiveMinX;
          } else if (currentWidth > maxBoundedWidth) {
            finalEndX = selectionStartX + maxBoundedWidth;
          }
          if (currentHeight > 0) {
            finalEndY = selectionStartY + (finalEndX - selectionStartX) / aspectRatio;
          } else {
            finalEndY = selectionStartY - (finalEndX - selectionStartX) / aspectRatio;
          }
        } else if (currentWidth < 0) { // Left side
          if (Math.abs(currentWidth) < effectiveMinX) {
            finalEndX = selectionStartX - effectiveMinX;
          } else if (Math.abs(currentWidth) > maxBoundedWidth) {
            finalEndX = selectionStartX - maxBoundedWidth;
          }
          if (currentHeight > 0) {
            finalEndY = selectionStartY + (selectionStartX - finalEndX) / aspectRatio;
          } else {
            finalEndY = selectionStartY - (selectionStartX - finalEndX) / aspectRatio;
          }
        }

        // Final boundary checks
        if (finalEndX < 0) {
          selectionStartX -= finalEndX;
          finalEndX = 0;
        } else if (finalEndX > containerWidth) {
          selectionStartX -= (finalEndX - containerWidth);
          finalEndX = containerWidth;
        }

        if (finalEndY < 0) {
          selectionStartY -= finalEndY;
          finalEndY = 0;
        } else if (finalEndY > containerHeight) {
          selectionStartY -= (finalEndY - containerHeight);
          finalEndY = containerHeight;
        }

        return createCoordinateObject(normalizeCoordinates(selectionStartX, selectionStartY, finalEndX, finalEndY));
      }

      // Ensures coordinates stay within the image boundaries
      function enforceBounds(point) {
        const boundedX = Math.max(0, Math.min(point[0], containerWidth));
        const boundedY = Math.max(0, Math.min(point[1], containerHeight));
        return [boundedX, boundedY];
      }

      // Normalizes coordinates (ensures x1 <= x2 and y1 <= y2)
      function normalizeCoordinates(x1, y1, x2, y2) {
        const normX1 = Math.min(x1, x2);
        const normX2 = Math.max(x1, x2);
        const normY1 = Math.min(y1, y2);
        const normY2 = Math.max(y1, y2);
        return [Math.round(normX1), Math.round(normY1), Math.round(normX2), Math.round(normY2)];
      }

      // Gets the raw selection rectangle, applying min/max dimensions
      function getRawSelectionObject() {
        let currentW = selectionEndX - selectionStartX;
        let currentH = selectionEndY - selectionStartY;

        // Apply max limits
        if (maxSelectionWidth && (Math.abs(currentW) > maxSelectionWidth)) {
          selectionEndX = (currentW > 0) ? (selectionStartX + maxSelectionWidth) : (selectionStartX - maxSelectionWidth);
        }
        if (maxSelectionHeight && (Math.abs(currentH) > maxSelectionHeight)) {
          selectionEndY = (currentH > 0) ? (selectionStartY + maxSelectionHeight) : (selectionStartY - maxSelectionHeight);
        }

        currentW = selectionEndX - selectionStartX; // Recalculate after max limits
        currentH = selectionEndY - selectionStartY;

        // Apply min limits
        if (minSelectionHeight && (Math.abs(currentH) < minSelectionHeight)) {
          selectionEndY = (currentH > 0) ? (selectionStartY + minSelectionHeight) : (selectionStartY - minSelectionHeight);
        }
        if (minSelectionWidth && (Math.abs(currentW) < minSelectionWidth)) {
          selectionEndX = (currentW > 0) ? (selectionStartX + minSelectionWidth) : (selectionStartX - minSelectionWidth);
        }

        // Ensure selection stays within bounds after adjustments
        let finalX1 = selectionStartX,
          finalY1 = selectionStartY,
          finalX2 = selectionEndX,
          finalY2 = selectionEndY;

        // Correct for negative coordinates or exceeding bounds
        if (finalX1 < 0) {
          finalX2 -= finalX1;
          finalX1 = 0;
        }
        if (finalY1 < 0) {
          finalY2 -= finalY1;
          finalY1 = 0;
        }
        if (finalX2 < 0) { // Should not happen if X1 is 0 but good for robustness
          finalX1 -= finalX2;
          finalX2 = 0;
        }
        if (finalY2 < 0) {
          finalY1 -= finalY2;
          finalY2 = 0;
        }

        if (finalX2 > containerWidth) {
          const delta = finalX2 - containerWidth;
          finalX1 -= delta;
          finalX2 -= delta;
        }
        if (finalY2 > containerHeight) {
          const delta = finalY2 - containerHeight;
          finalY1 -= delta;
          finalY2 -= delta;
        }

        // One last check to ensure no coordinate is out of bounds after complex adjustments
        finalX1 = Math.max(0, Math.min(finalX1, containerWidth));
        finalY1 = Math.max(0, Math.min(finalY1, containerHeight));
        finalX2 = Math.max(0, Math.min(finalX2, containerWidth));
        finalY2 = Math.max(0, Math.min(finalY2, containerHeight));


        return createCoordinateObject(normalizeCoordinates(finalX1, finalY1, finalX2, finalY2));
      }

      // Creates a standardized object from an array of coordinates
      function createCoordinateObject(coordinateArray) {
        const [x, y, x2, y2] = coordinateArray;
        return {
          x: x,
          y: y,
          x2: x2,
          y2: y2,
          width: x2 - x,
          height: y2 - y
        };
      }

      return {
        normalizeCoordinates: normalizeCoordinates,
        setInitialSelectionPoint: setInitialSelectionPoint,
        updateCurrentSelectionPoint: updateCurrentSelectionPoint,
        getLastMovementOffset: getLastMovementOffset,
        applyMovementOffset: applyMovementOffset,
        getCornerCoordinates: getCornerCoordinates,
        getAdjustedSelection: getAdjustedSelection
      };
    })();

    // --- Selection Visualizer Module ---
    const SelectionVisualizer = (function () {
      let currentSelectionStart, currentSelectionEnd, activeDragMode;
      let isSelectionVisible = false;
      let nextHandleZIndex = 370; // Starting Z-index for handles
      const borderElements = {};
      const handleElements = {};
      let areHandlesVisible = false;
      const handleVisualOffset = currentConfig.handlePixelOffset; // Offset for positioning handles

      // --- Private Element Creation Helpers ---

      // Creates and inserts a border element for the selection box
      function createBorderElement(typeClass) {
        const borderDiv = $('<div />')
          .css({
            position: 'absolute',
            opacity: currentConfig.borderColorTransparency
          })
          .addClass(getPrefixedClass(typeClass));
        $overlayContentWrapper.append(borderDiv);
        return borderDiv;
      }

      // Creates a generic draggable div element
      function createDraggableHandleDiv(direction, zIndex) {
        const draggableDiv = $('<div />')
          .mousedown(createInteractionHandler(direction))
          .css({
            cursor: `${direction}-resize`,
            position: 'absolute',
            zIndex: zIndex,
            userSelect: 'none' // Prevent text selection during drag
          });
        $handleContainer.append(draggableDiv);
        return draggableDiv;
      }

      // Creates and inserts a corner handle
      function createCornerHandle(direction) {
        const handleDiv = createDraggableHandleDiv(direction, nextHandleZIndex++)
          .css({
            top: toPixelString(-handleVisualOffset + 1),
            left: toPixelString(-handleVisualOffset + 1),
            opacity: currentConfig.handleTransparency
          })
          .addClass(getPrefixedClass('handle'));
        return handleDiv;
      }

      // Creates and inserts an edge drag bar
      function createEdgeHandle(direction) {
        const handleSize = currentConfig.handlePixelSize;
        let handleWidth = handleSize,
          handleHeight = handleSize;
        const topOffset = handleVisualOffset,
          leftOffset = handleVisualOffset;

        switch (direction) {
          case 'n':
          case 's':
            handleWidth = toPercentString(100);
            break;
          case 'e':
          case 'w':
            handleHeight = toPercentString(100);
            break;
        }

        const edgeBar = createDraggableHandleDiv(direction, nextHandleZIndex++)
          .width(handleWidth)
          .height(handleHeight)
          .css({
            top: toPixelString(-topOffset + 1),
            left: toPixelString(-leftOffset + 1)
          });
        return edgeBar;
      }

      // Populates the handleElements object with created handles
      function initializeHandles(handleList) {
        for (let i = 0; i < handleList.length; i++) {
          handleElements[handleList[i]] = createCornerHandle(handleList[i]);
        }
      }

      // --- Initialization of UI Elements ---

      // Insert border divs for selection outline
      if (currentConfig.renderSelectionBorders) {
        borderElements.top = createBorderElement('horizontal-border');
        borderElements.bottom = createBorderElement('horizontal-border');
        borderElements.left = createBorderElement('vertical-border');
        borderElements.right = createBorderElement('vertical-border');
      }

      // Insert draggable elements for edges
      if (currentConfig.enableEdgeDragging) {
        handleElements.t = createEdgeHandle('n');
        handleElements.b = createEdgeHandle('s');
        handleElements.r = createEdgeHandle('e');
        handleElements.l = createEdgeHandle('w');
      }

      // Insert corner resize handles
      if (currentConfig.showCornerGrabbers) {
        initializeHandles(['sw', 'nw', 'ne', 'se']);
      }

      // Insert side resize handles
      if (currentConfig.showSideGrabbers) {
        initializeHandles(['n', 's', 'e', 'w']);
      }

      // --- Public Methods for Selection Visualizer ---

      // Positions all border and handle elements based on current selection coordinates
      function positionAllElements(coords) {
        const halfHandleOffset = Math.round((coords.height / 2) - handleVisualOffset);
        const midHorizontalOffset = Math.round((coords.width / 2) - handleVisualOffset);
        const topEdge = -handleVisualOffset + 1;
        const leftEdge = -handleVisualOffset + 1;
        const rightEdge = coords.width - handleVisualOffset;
        const bottomEdge = coords.height - handleVisualOffset;

        // Position Borders
        if (currentConfig.renderSelectionBorders) {
          borderElements.top.css({
            left: toPixelString(coords.x),
            top: toPixelString(coords.y),
            width: toPixelString(coords.width)
          });
          borderElements.bottom.css({
            left: toPixelString(coords.x),
            top: toPixelString(coords.y2),
            width: toPixelString(coords.width)
          });
          borderElements.left.css({
            left: toPixelString(coords.x),
            top: toPixelString(coords.y),
            height: toPixelString(coords.height)
          });
          borderElements.right.css({
            left: toPixelString(coords.x2),
            top: toPixelString(coords.y),
            height: toPixelString(coords.height)
          });
        }

        // Position Handles
        $handleContainer.css({
          top: toPixelString(coords.y),
          left: toPixelString(coords.x),
          width: toPixelString(coords.width),
          height: toPixelString(coords.height)
        });

        if (handleElements.t) handleElements.t.css({
          left: midHorizontalOffset,
          top: topEdge
        });
        if (handleElements.b) handleElements.b.css({
          left: midHorizontalOffset,
          top: bottomEdge
        });
        if (handleElements.r) handleElements.r.css({
          left: rightEdge,
          top: halfHandleOffset
        });
        if (handleElements.l) handleElements.l.css({
          left: leftEdge,
          top: halfHandleOffset
        });

        if (handleElements.nw) handleElements.nw.css({
          left: leftEdge,
          top: topEdge
        });
        if (handleElements.ne) handleElements.ne.css({
          left: rightEdge,
          top: topEdge
        });
        if (handleElements.se) handleElements.se.css({
          left: rightEdge,
          top: bottomEdge
        });
        if (handleElements.sw) handleElements.sw.css({
          left: leftEdge,
          top: bottomEdge
        });

        // Position the overlay image (the selected part)
        $overlayContentWrapper.css({
          left: toPixelString(coords.x),
          top: toPixelString(coords.y),
          width: toPixelString(coords.width),
          height: toPixelString(coords.height)
        });
        $overlayImage.css({
          left: toPixelString(-coords.x),
          top: toPixelString(-coords.y)
        });

        if (currentConfig.debugMode) console.log('Elements positioned:', coords);
      }

      // Sets the visibility of the selection area and its components
      function setSelectionVisibility(visible) {
        if (visible) {
          $selectionArea.show();
          $clonedImage.css('opacity', 1 - backgroundTransparency); // Dim the background image
        } else {
          $selectionArea.hide();
          $clonedImage.css('opacity', 1); // Restore full opacity
        }
        isSelectionVisible = visible;
        if (currentConfig.debugMode) console.log('Selection visibility set to:', visible);
      }

      // Toggles the visibility of all handles and borders
      function toggleHandlesVisibility(visible) {
        for (const key in handleElements) {
          if (Object.prototype.hasOwnProperty.call(handleElements, key)) {
            handleElements[key][visible ? 'show' : 'hide']();
          }
        }
        for (const key in borderElements) {
          if (Object.prototype.hasOwnProperty.call(borderElements, key)) {
            borderElements[key][visible ? 'show' : 'hide']();
          }
        }
        areHandlesVisible = visible;
        if (currentConfig.debugMode) console.log('Handles visibility set to:', visible);
      }

      return {
        positionAllElements: positionAllElements,
        setSelectionVisibility: setSelectionVisibility,
        toggleHandlesVisibility: toggleHandlesVisibility
      };
    })();

    // --- Event Handlers and Main Logic ---

    // Generic handler for starting drag operations (new selection, move, resize)
    function createInteractionHandler(mode) {
      return function (e) {
        if (!isInteractionEnabled) return false;
        if (e.type === 'mousedown') {
          e.stopPropagation(); // Stop propagation for nested elements
          e.preventDefault(); // Prevent default browser drag behavior
        }

        isMouseDown = true;
        activeDragMode = mode;
        lastCursorStyle = $(this).css('cursor'); // Store cursor for restoration

        const mouseX = e.pageX - documentScrollOffset[0];
        const mouseY = e.pageY - documentScrollOffset[1];

        if (mode === 'move') {
          // If moving, we need the initial offset from the mouse to the selection corner
          const currentSelection = CoordinateManager.getAdjustedSelection();
          CoordinateManager.setInitialSelectionPoint([mouseX - currentSelection.x, mouseY - currentSelection.y]);
        } else {
          CoordinateManager.setInitialSelectionPoint([mouseX, mouseY]);
        }

        // Attach global event listeners for mousemove and mouseup
        $(document).on('mousemove', handleGlobalMouseMove);
        $(document).on('mouseup', handleGlobalMouseUp);

        return false; // Prevent default drag behavior
      };
    }

    // Handles starting a new selection when clicking on the interaction layer
    function startNewSelection(e) {
      if (!currentConfig.allowNewSelection || !isInteractionEnabled) return false;
      SelectionVisualizer.setSelectionVisibility(true);
      return createInteractionHandler('se')(e); // Default to 'se' resize for new selection
    }

    // Handles mouse move events globally
    function handleGlobalMouseMove(e) {
      if (!isMouseDown) return;

      const mouseX = e.pageX - documentScrollOffset[0];
      const mouseY = e.pageY - documentScrollOffset[1];

      CoordinateManager.updateCurrentSelectionPoint([mouseX, mouseY]);

      const currentSelection = CoordinateManager.getAdjustedSelection();
      SelectionVisualizer.positionAllElements(currentSelection);
      currentConfig.onSelectionChange.call(instanceReference, currentSelection);
    }

    // Handles mouse up events globally, ending the drag operation
    function handleGlobalMouseUp(e) {
      isMouseDown = false;
      $(document).off('mousemove', handleGlobalMouseMove);
      $(document).off('mouseup', handleGlobalMouseUp);

      const finalSelection = CoordinateManager.getAdjustedSelection();
      currentConfig.onSelectionComplete.call(instanceReference, finalSelection);
      if (currentConfig.debugMode) console.log('Selection finished:', finalSelection);

      // Restore cursor
      $interactionLayer.css('cursor', 'crosshair');
    }

    // Initialize with an initial selection if provided
    const initialCoords = currentConfig.initialSelectionBounds;
    if (initialCoords[0] !== 0 || initialCoords[1] !== 0 || initialCoords[2] !== 0 || initialCoords[3] !== 0) {
      // Set initial selection
      CoordinateManager.setInitialSelectionPoint([initialCoords[0], initialCoords[1]]);
      CoordinateManager.updateCurrentSelectionPoint([initialCoords[2], initialCoords[3]]);
      const initialRect = CoordinateManager.getAdjustedSelection();
      SelectionVisualizer.setSelectionVisibility(true);
      SelectionVisualizer.positionAllElements(initialRect);
      currentConfig.onSelectionChange.call(instanceReference, initialRect);
      currentConfig.onSelectionComplete.call(instanceReference, initialRect);
    } else {
      SelectionVisualizer.setSelectionVisibility(false); // Hide selection initially
    }

    // Call the ready callback
    currentConfig.onPluginReady.call(instanceReference);

    // Public API methods (example, can be expanded)
    this.getCurrentSelection = function () {
      return CoordinateManager.getAdjustedSelection();
    };

    this.destroy = function () {
      $mainWrapper.remove();
      $sourceImage.show();
      $(document).off('mousemove', handleGlobalMouseMove);
      $(document).off('mouseup', handleGlobalMouseUp);
      // More cleanup if needed
    };
  };

})(jQuery);