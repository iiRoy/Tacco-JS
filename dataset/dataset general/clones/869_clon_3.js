/*
 * Copyright (c) 2010 Dennis Hotson.
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function() {

  // Extend jQuery's prototype with a graph visualization utility.
  jQuery.fn.graphViz = function(userOptions)
  {
    // Default configuration for the visualizer.
    const defaultSettings = {
      underlyingGraph: null,
      nodeLabelStyle: "14px Arial, sans-serif",
      edgeLabelStyle: "7px Arial, sans-serif",
      springConstant: 450.0, // Slightly modified physics constant
      repelStrength: 450.0, // Slightly modified physics constant
      dampingFactor: 0.6,   // Slightly modified physics constant
      minLayoutEnergy: 0.00002, // Slightly modified energy threshold
      onNodeClickCallback: null,
      edgeDisplayUpright: true,
      visualPaddingX: 8, // Horizontal padding for node content
      visualPaddingY: 8, // Vertical padding for node content
      selectionHighlightColor: "#FFFFDD",
      hoverHighlightColor: "#EEEEFF",
      defaultNodeColor: "#FFFFFF",
      defaultEdgeColor: "#000000",
      arrowheadLength: 9, // Arrowhead length adjusted
      arrowheadWidth: 1.5, // Arrowhead width multiplier
      edgeSpacingMultiplier: 1.3, // Multiplier for distance between parallel edges
      viewBoundsTransitionFactor: 0.12 // How fast the view bounds adjust
    };

    // Merge user options with default settings.
    const currentSettings = { ...defaultSettings, ...userOptions };

    // Validate and initialize graph.
    const internalGraph = currentSettings.underlyingGraph instanceof Springy.Graph
      ? currentSettings.underlyingGraph
      : new Springy.Graph();

    // Store the graph on the jQuery object for external access.
    this.internalGraph = internalGraph;

    // Canvas setup.
    const renderCanvas = this[0];
    if (!(renderCanvas instanceof HTMLCanvasElement)) {
        console.error("The jQuery selector did not return a valid canvas element.");
        return this; // Return chainable jQuery object
    }
    const drawingContext = renderCanvas.getContext("2d");

    // Cache image assets for nodes.
    const imageResourceCache = {};

    // Initialize the force-directed layout algorithm.
    const spatialArrangement = new Springy.Layout.ForceDirected(
      internalGraph,
      currentSettings.springConstant,
      currentSettings.repelStrength,
      currentSettings.dampingFactor,
      currentSettings.minLayoutEnergy
    );
    this.spatialArrangement = spatialArrangement; // Expose layout for external manipulation

    // Dynamic bounding box for the view.
    let currentViewBounds = spatialArrangement.getBoundingBox();
    let desiredViewBounds = {
      bottomleft: new Springy.Vector(-3, -3), // Slightly different initial bounds
      topright: new Springy.Vector(3, 3)
    };

    // Function to smoothly adjust the visible area.
    const updateViewBounds = () => {
      desiredViewBounds = spatialArrangement.getBoundingBox();

      // Linearly interpolate current view towards desired view.
      currentViewBounds.bottomleft = currentViewBounds.bottomleft.add(
        desiredViewBounds.bottomleft.subtract(currentViewBounds.bottomleft).multiply(currentSettings.viewBoundsTransitionFactor)
      );
      currentViewBounds.topright = currentViewBounds.topright.add(
        desiredViewBounds.topright.subtract(currentViewBounds.topright).multiply(currentSettings.viewBoundsTransitionFactor)
      );

      Springy.requestAnimationFrame(updateViewBounds);
    };
    Springy.requestAnimationFrame(updateViewBounds);

    // Coordinate transformation functions.
    const mapWorldToCanvas = (worldPoint) => {
      const viewSize = currentViewBounds.topright.subtract(currentViewBounds.bottomleft);
      const relativePoint = worldPoint.subtract(currentViewBounds.bottomleft);
      const canvasX = (relativePoint.x / viewSize.x) * renderCanvas.width;
      const canvasY = (relativePoint.y / viewSize.y) * renderCanvas.height;
      return new Springy.Vector(canvasX, canvasY);
    };

    const mapCanvasToWorld = (canvasPoint) => {
      const viewSize = currentViewBounds.topright.subtract(currentViewBounds.bottomleft);
      const worldX = (canvasPoint.x / renderCanvas.width) * viewSize.x + currentViewBounds.bottomleft.x;
      const worldY = (canvasPoint.y / renderCanvas.height) * viewSize.y + currentViewBounds.bottomleft.y;
      return new Springy.Vector(worldX, worldY);
    };

    // Interaction state variables.
    let currentlySelectedNode = null;
    let currentlyHoveredNode = null;
    let nodeBeingDragged = null;
    let isDragging = false; // Added state variable for clearer drag management

    // --- Event Handlers ---
    jQuery(renderCanvas).on('mousedown', function(evt) {
      isDragging = true;
      const canvasOffset = jQuery(this).offset();
      const clickPosition = mapCanvasToWorld({
        x: evt.pageX - canvasOffset.left,
        y: evt.pageY - canvasOffset.top
      });
      currentlySelectedNode = currentlyHoveredNode = nodeBeingDragged = spatialArrangement.nearest(clickPosition);

      if (nodeBeingDragged && nodeBeingDragged.node) {
        nodeBeingDragged.point.m = 10000.0; // Increase mass for dragging
        if (typeof currentSettings.onNodeClickCallback === 'function') { // Guard clause for callback
          currentSettings.onNodeClickCallback(nodeBeingDragged.node);
        }
      }
      graphicRenderer.start();
    });

    jQuery(renderCanvas).on('dblclick', function(evt) {
      const canvasOffset = jQuery(this).offset();
      const doubleClickPos = mapCanvasToWorld({
        x: evt.pageX - canvasOffset.left,
        y: evt.pageY - canvasOffset.top
      });
      const hitElement = spatialArrangement.nearest(doubleClickPos);
      const targetNode = hitElement ? hitElement.node : null;

      if (targetNode && targetNode.data && typeof targetNode.data.onDoubleClick === 'function') {
        targetNode.data.onDoubleClick();
      }
    });

    jQuery(renderCanvas).on('mousemove', function(evt) {
      const canvasOffset = jQuery(this).offset();
      const mousePosition = mapCanvasToWorld({
        x: evt.pageX - canvasOffset.left,
        y: evt.pageY - canvasOffset.top
      });
      currentlyHoveredNode = spatialArrangement.nearest(mousePosition);

      if (nodeBeingDragged && nodeBeingDragged.node && isDragging) {
        nodeBeingDragged.point.p.x = mousePosition.x;
        nodeBeingDragged.point.p.y = mousePosition.y;
      }
      graphicRenderer.start();
    });

    jQuery(window).on('mouseup', function() {
      nodeBeingDragged = null;
      isDragging = false; // Reset dragging state
      graphicRenderer.start(); // Ensure one last render to clear hover/selection if needed
    });

    // --- Node/Edge Dimension Calculation Helpers ---
    const getNodeTextDimensions = (nodeObj) => {
      const textContent = (nodeObj.data && nodeObj.data.label !== undefined) ? nodeObj.data.label : nodeObj.id;

      // Cache text dimensions for performance
      nodeObj._textDimCache = nodeObj._textDimCache || {};
      if (nodeObj._textDimCache[textContent]) {
        return nodeObj._textDimCache[textContent];
      }

      drawingContext.save();
      drawingContext.font = (nodeObj.data && nodeObj.data.font !== undefined) ? nodeObj.data.font : currentSettings.nodeLabelStyle;
      const metrics = drawingContext.measureText(textContent);
      const textWidth = metrics.width;
      // Approximate height; a more precise method would involve font metrics.
      const textHeight = parseInt(drawingContext.font, 10) || 14; // Extract font size from string, default 14
      drawingContext.restore();

      nodeObj._textDimCache[textContent] = { width: textWidth, height: textHeight };
      return { width: textWidth, height: textHeight };
    };

    const getNodeImageDimensions = (nodeObj) => {
      const imageData = nodeObj.data.image;
      if (!imageData || !imageData.src) {
          // Fallback if image data is incomplete
          return { width: 10, height: 10 };
      }

      if (imageData.width !== undefined && imageData.height !== undefined) {
          return { width: imageData.width, height: imageData.height };
      }

      const imgAsset = imageResourceCache[imageData.src];
      if (imgAsset && imgAsset.loaded && imgAsset.object) {
          return { width: imgAsset.object.width, height: imgAsset.object.height };
      }
      return { width: 10, height: 10 }; // Default size for unloaded images
    };

    // Extend Springy.Node prototype for dimension access.
    Springy.Node.prototype.getVisualHeight = function() {
      if (this.data && this.data.image) {
        return getNodeImageDimensions(this).height;
      }
      return getNodeTextDimensions(this).height;
    };

    Springy.Node.prototype.getVisualWidth = function() {
      if (this.data && this.data.image) {
        return getNodeImageDimensions(this).width;
      }
      return getNodeTextDimensions(this).width;
    };

    // --- Graphical Renderer ---
    const graphicRenderer = this.graphicRenderer = new Springy.Renderer(spatialArrangement,
      function clearCanvas() {
        // Clear the entire canvas for a fresh render.
        drawingContext.clearRect(0, 0, renderCanvas.width, renderCanvas.height);
      },
      function renderConnection(edgeToDraw, startPoint, endPoint)
      {
        const screenStart = mapWorldToCanvas(startPoint);
        const screenEnd = mapWorldToCanvas(endPoint);

        const linkVector = screenEnd.subtract(screenStart);
        const linkNormal = linkVector.normal().normalise();

        const outgoingLinks = internalGraph.getEdges(edgeToDraw.source, edgeToDraw.target);
        const incomingLinks = internalGraph.getEdges(edgeToDraw.target, edgeToDraw.source);

        const totalParallelLinks = outgoingLinks.length + incomingLinks.length;

        // Determine edge's specific position among parallel links.
        let edgeIndex = 0;
        for (let i = 0; i < outgoingLinks.length; i++) {
          if (outgoingLinks[i].id === edgeToDraw.id) {
            edgeIndex = i;
            break;
          }
        }

        const effectiveSpacing = currentSettings.edgeSpacingMultiplier * 10.0; // Base spacing for parallel lines
        const offsetMagnitude = -((totalParallelLinks - 1) * effectiveSpacing) / 2.0 + (edgeIndex * effectiveSpacing);
        const displacementVector = linkNormal.multiply(offsetMagnitude);

        const paddedStart = screenStart.add(displacementVector);
        const paddedEnd = screenEnd.add(displacementVector);

        const targetNodeWidth = edgeToDraw.target.getVisualWidth() + currentSettings.visualPaddingX;
        const targetNodeHeight = edgeToDraw.target.getVisualHeight() + currentSettings.visualPaddingY;

        // Find intersection point with target node's bounding box.
        const intersectionPoint = findLineBoxIntersection(
          paddedStart, paddedEnd,
          { x: screenEnd.x - targetNodeWidth / 2.0, y: screenEnd.y - targetNodeHeight / 2.0 },
          targetNodeWidth, targetNodeHeight
        );

        // If no intersection found (e.g., line starts inside box), use the raw padded end.
        const effectiveLineEnd = intersectionPoint || paddedEnd;

        const connectionStrokeColor = (edgeToDraw.data && edgeToDraw.data.color !== undefined)
          ? edgeToDraw.data.color
          : currentSettings.defaultEdgeColor;

        const connectionWeight = (edgeToDraw.data && edgeToDraw.data.weight !== undefined)
          ? edgeToDraw.data.weight
          : 1.0;

        drawingContext.lineWidth = Math.max(connectionWeight * 2, 0.1); // Ensure line is visible
        const currentArrowWidth = currentSettings.arrowheadWidth * drawingContext.lineWidth;
        const currentArrowLength = currentSettings.arrowheadLength;

        const isDirectional = (edgeToDraw.data && edgeToDraw.data.directional !== undefined)
          ? edgeToDraw.data.directional
          : true; // Edges are directional by default

        let finalLineDestination = effectiveLineEnd;
        if (isDirectional) {
          // Adjust line end to not overlap with arrowhead base.
          finalLineDestination = effectiveLineEnd.subtract(linkVector.normalise().multiply(currentArrowLength * 0.5));
        }

        drawingContext.strokeStyle = connectionStrokeColor;
        drawingContext.beginPath();
        drawingContext.moveTo(paddedStart.x, paddedStart.y);
        drawingContext.lineTo(finalLineDestination.x, finalLineDestination.y);
        drawingContext.stroke();

        // Draw arrowhead if directional.
        if (isDirectional) {
          drawingContext.save();
          drawingContext.fillStyle = connectionStrokeColor;
          drawingContext.translate(effectiveLineEnd.x, effectiveLineEnd.y);
          drawingContext.rotate(Math.atan2(screenEnd.y - screenStart.y, screenEnd.x - screenStart.x));
          drawingContext.beginPath();
          drawingContext.moveTo(-currentArrowLength, currentArrowWidth);
          drawingContext.lineTo(0, 0);
          drawingContext.lineTo(-currentArrowLength, -currentArrowWidth);
          drawingContext.closePath();
          drawingContext.fill();
          drawingContext.restore();
        }

        // Render edge label if present.
        if (edgeToDraw.data && edgeToDraw.data.label !== undefined) {
          const labelText = edgeToDraw.data.label;
          drawingContext.save();
          drawingContext.textAlign = "center";
          drawingContext.textBaseline = "top";
          drawingContext.font = (edgeToDraw.data.font !== undefined)
            ? edgeToDraw.data.font
            : currentSettings.edgeLabelStyle;
          drawingContext.fillStyle = connectionStrokeColor;

          let labelAngle = Math.atan2(paddedEnd.y - paddedStart.y, paddedEnd.x - paddedStart.x);
          let labelDisplacement = -8; // Offset label from the line

          if (currentSettings.edgeDisplayUpright && (labelAngle > Math.PI / 2 || labelAngle < -Math.PI / 2)) {
            labelDisplacement = 8;
            labelAngle += Math.PI; // Flip text orientation
          }
          const labelCenter = paddedStart.add(paddedEnd).divide(2).add(linkNormal.multiply(labelDisplacement));
          drawingContext.translate(labelCenter.x, labelCenter.y);
          drawingContext.rotate(labelAngle);
          drawingContext.fillText(labelText, 0, -2); // Adjust Y for baseline
          drawingContext.restore();
        }
      },
      function renderVisualNode(nodeToDraw, nodePosition)
      {
        const canvasCenter = mapWorldToCanvas(nodePosition);

        drawingContext.save();

        const nodeContentWidth = nodeToDraw.getVisualWidth();
        const nodeContentHeight = nodeToDraw.getVisualHeight();
        const nodeBoxWidth = nodeContentWidth + currentSettings.visualPaddingX;
        const nodeBoxHeight = nodeContentHeight + currentSettings.visualPaddingY;

        const halfBoxWidth = nodeBoxWidth / 2;
        const halfBoxHeight = nodeBoxHeight / 2;

        const nodeRectX = canvasCenter.x - halfBoxWidth;
        const nodeRectY = canvasCenter.y - halfBoxHeight;

        // Determine background color based on interaction state.
        let backgroundColor = currentSettings.defaultNodeColor;
        if (currentlySelectedNode && currentlySelectedNode.node && currentlySelectedNode.node.id === nodeToDraw.id) {
          backgroundColor = currentSettings.selectionHighlightColor;
        } else if (currentlyHoveredNode && currentlyHoveredNode.node && currentlyHoveredNode.node.id === nodeToDraw.id) {
          backgroundColor = currentSettings.hoverHighlightColor;
        }

        // Clear and fill background.
        drawingContext.clearRect(nodeRectX, nodeRectY, nodeBoxWidth, nodeBoxHeight);
        drawingContext.fillStyle = backgroundColor;
        drawingContext.fillRect(nodeRectX, nodeRectY, nodeBoxWidth, nodeBoxHeight);

        // Draw node content (image or text).
        if (nodeToDraw.data && nodeToDraw.data.image) {
          const imageInfo = nodeToDraw.data.image;
          const imageSource = imageInfo.src;

          if (imageSource in imageResourceCache) {
            const cachedImage = imageResourceCache[imageSource];
            if (cachedImage.loaded) {
              drawingContext.drawImage(cachedImage.object, nodeRectX, nodeRectY, nodeContentWidth, nodeContentHeight);
            }
          } else {
            // Load image if not in cache.
            imageResourceCache[imageSource] = { loaded: false, object: null };
            const imgElement = new Image();
            imageResourceCache[imageSource].object = imgElement;

            imgElement.onload = () => {
              imageResourceCache[imageSource].loaded = true;
              graphicRenderer.start(); // Rerender once image is loaded
            };
            imgElement.onerror = () => {
                console.warn(`Failed to load image for node ${nodeToDraw.id}: ${imageSource}`);
                // Optionally render a placeholder or text here.
            };
            imgElement.src = imageSource;
          }
        } else {
          // Render text label.
          drawingContext.textAlign = "center"; // Changed from "left" to "center"
          drawingContext.textBaseline = "middle"; // Changed from "top" to "middle"
          drawingContext.font = (nodeToDraw.data && nodeToDraw.data.font !== undefined)
            ? nodeToDraw.data.font
            : currentSettings.nodeLabelStyle;
          drawingContext.fillStyle = (nodeToDraw.data && nodeToDraw.data.color !== undefined)
            ? nodeToDraw.data.color
            : "#000000"; // Default text color

          const displayText = (nodeToDraw.data && nodeToDraw.data.label !== undefined)
            ? nodeToDraw.data.label
            : nodeToDraw.id;

          drawingContext.fillText(displayText, canvasCenter.x, canvasCenter.y);
        }

        // Draw an optional border if specified in node data.
        if (nodeToDraw.data && nodeToDraw.data.borderWidth > 0) {
            drawingContext.strokeStyle = nodeToDraw.data.borderColor || "#666666";
            drawingContext.lineWidth = nodeToDraw.data.borderWidth;
            drawingContext.strokeRect(nodeRectX, nodeRectY, nodeBoxWidth, nodeBoxHeight);
        }

        drawingContext.restore();
      }
    );

    // Initial render start.
    graphicRenderer.start();

    // --- Geometric Helper Functions ---
    function findLineIntersection(line1P1, line1P2, line2P1, line2P2) {
      const denominator = (line2P2.y - line2P1.y) * (line1P2.x - line1P1.x) -
                          (line2P2.x - line2P1.x) * (line1P2.y - line1P1.y);

      // Lines are parallel or collinear.
      if (denominator === 0) {
        return null; // Changed from 'false' to 'null' for consistency with no intersection
      }

      const ua = ((line2P2.x - line2P1.x) * (line1P1.y - line2P1.y) -
                  (line2P2.y - line2P1.y) * (line1P1.x - line2P1.x)) / denominator;
      const ub = ((line1P2.x - line1P1.x) * (line1P1.y - line2P1.y) -
                  (line1P2.y - line1P1.y) * (line1P1.x - line2P1.x)) / denominator;

      // Check if intersection point lies within both line segments.
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return new Springy.Vector(line1P1.x + ua * (line1P2.x - line1P1.x),
                                  line1P1.y + ua * (line1P2.y - line1P1.y));
      }

      return null;
    }

    function findLineBoxIntersection(lineStart, lineEnd, boxTopLeft, boxWidth, boxHeight) {
      const boxBottomRight = { x: boxTopLeft.x + boxWidth, y: boxTopLeft.y + boxHeight };

      const boxSegments = [
        { p1: boxTopLeft, p2: { x: boxBottomRight.x, y: boxTopLeft.y } }, // Top edge
        { p1: { x: boxBottomRight.x, y: boxTopLeft.y }, p2: boxBottomRight }, // Right edge
        { p1: boxBottomRight, p2: { x: boxTopLeft.x, y: boxBottomRight.y } }, // Bottom edge
        { p1: { x: boxTopLeft.x, y: boxBottomRight.y }, p2: boxTopLeft }  // Left edge
      ];

      for (const segment of boxSegments) {
        const intersection = findLineIntersection(lineStart, lineEnd, segment.p1, segment.p2);
        if (intersection) {
          return intersection;
        }
      }

      return null;
    }

    // Return the jQuery object for chaining.
    return this;
  };

})();