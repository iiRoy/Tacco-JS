/*
* This code is a modified version of an open-source visualization library.
* Original license and terms apply.
*
* Licensed under the MIT License.
*
* Permission is hereby granted, free of charge, to any individual
* obtaining a copy of this software and its associated documentation
* files (the "Kinetic Visualizer"), to deal in the Kinetic Visualizer without
* restriction, including without limitation the rights to utilize,
* duplicate, modify, integrate, publish, distribute, sublicense, and/or sell
* copies of the Kinetic Visualizer, and to permit persons to whom the
* Kinetic Visualizer is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or significant portions of the Kinetic Visualizer.
*
* THE KINETIC VISUALIZER IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE KINETIC VISUALIZER OR THE USE OR
* OTHER DEALINGS IN THE KINETIC VISUALIZER.
*/

( function () {

  // Extend jQuery's prototype with our new visualization plugin.
  jQuery.fn.kineticViz = function ( settings ) {
    // Initialize the core diagram structure, or use one provided in settings.
    var network = this.diagram = settings.network || new VizEngine.Chart();
    // Define default font styles for graph elements.
    var elementFont = "14pt Arial, Helvetica, sans-serif";
    var connectionFont = "7pt Calibri, sans-serif";
    // Physics simulation parameters.
    var rigidity = settings.rigidity || 400;
    var separationForce = settings.separationForce || 400;
    var attenuation = settings.attenuation || 0.5;
    var energyCutoff = settings.energyCutoff || 0.00001;
    // Callback for when a vertex is interactively chosen.
    var vertexChosenCallback = settings.vertexChosenCallback || null;
    // Cache for loaded images used as vertex graphics.
    var elementPictures = {};
    // Flag to control orientation of connection labels.
    var linkTextVertical = true;

    // Get the HTML5 canvas element and its 2D rendering context.
    var renderArea = this[0];
    var drawCtx = renderArea.getContext("2d");

    // Create the force-directed layout manager for the network.
    var positioning = this.arrangement = new VizEngine.Placement.Dynamic( network, rigidity, separationForce, attenuation, energyCutoff );

    // Calculate the bounding box of the graph layout with an easing effect.
    var presentBox = positioning.getBounds();
    var goalBox = {lowerLeft: new VizEngine.Coord(-2.5, -2.5), upperRight: new VizEngine.Coord(2.5, 2.5)};

    // Continuously adjust the viewport's bounding box for a smooth transition.
    VizEngine.animateFrame( function recalibrate () {
      goalBox = positioning.getBounds();
      // The current bounding box moves 1/12th of the way towards the target each frame.
      presentBox = {
        lowerLeft: presentBox.lowerLeft.combine( goalBox.lowerLeft.deduct( presentBox.lowerLeft )
          .split( 12 ) ),
        upperRight: presentBox.upperRight.combine( goalBox.upperRight.deduct( presentBox.upperRight )
          .split( 12 ) )
      };

      VizEngine.animateFrame( recalibrate );
    } );

    // Function to convert world coordinates to screen (display) coordinates.
    var mapToDisplay = function ( coord ) {
      var dimensions = presentBox.upperRight.deduct( presentBox.lowerLeft );
      var displayX = coord.deduct( presentBox.lowerLeft ).split( dimensions.x ).x * renderArea.width;
      var displayY = coord.deduct( presentBox.lowerLeft ).split( dimensions.y ).y * renderArea.height;
      return new VizEngine.Coord( displayX, displayY );
    };

    // Function to convert screen (display) coordinates back to world coordinates.
    var mapFromDisplay = function ( displayPt ) {
      var dimensions = presentBox.upperRight.deduct( presentBox.lowerLeft );
      var worldX = ( displayPt.x / renderArea.width ) * dimensions.x + presentBox.lowerLeft.x;
      var worldY = ( displayPt.y / renderArea.height ) * dimensions.y + presentBox.lowerLeft.y;
      return new VizEngine.Coord( worldX, worldY );
    };

    // Variables for handling interactive dragging and selection.
    var pickedElement = null;
    var hoveredItem = null;
    var activeDrag = null;

    // Mouse down event handler for the canvas.
    jQuery( renderArea ).mousedown( function ( evt ) {
      var containerOffset = jQuery( this ).offset();
      var worldCoord = mapFromDisplay( {x: evt.pageX - containerOffset.left, y: evt.pageY - containerOffset.top} );
      pickedElement = hoveredItem = activeDrag = positioning.findNearest( worldCoord );

      if ( pickedElement.vertex !== null ) {
        // Apply a high mass factor to the dragged point to make it less responsive to forces.
        activeDrag.location.massFactor = 10000;

        if ( vertexChosenCallback ) {
          vertexChosenCallback( pickedElement.vertex );
        }
      }

      // Start the rendering loop to reflect changes.
      renderEngine.beginRendering();
    } );

    // Double-click event handler for the canvas.
    jQuery( renderArea ).dblclick( function ( evt ) {
      var containerOffset = jQuery( this ).offset();
      var worldCoord = mapFromDisplay( {x: evt.pageX - containerOffset.left, y: evt.pageY - containerOffset.top} );
      pickedElement = positioning.findNearest( worldCoord );
      var targetVertex = pickedElement.vertex;
      // If a vertex has a double-click action defined in its properties, execute it.
      if ( targetVertex && targetVertex.details && targetVertex.details.onDoubleClickAction ) {
        targetVertex.details.onDoubleClickAction();
      }
    } );

    // Mouse move event handler for the canvas.
    jQuery( renderArea ).mousemove( function ( evt ) {
      var containerOffset = jQuery( this ).offset();
      var worldCoord = mapFromDisplay( {x: evt.pageX - containerOffset.left, y: evt.pageY - containerOffset.top} );
      hoveredItem = positioning.findNearest( worldCoord );

      // If an element is being dragged, update its position directly.
      if ( activeDrag !== null && activeDrag.vertex !== null ) {
        activeDrag.location.posData.x = worldCoord.x;
        activeDrag.location.posData.y = worldCoord.y;
      }

      // Request a re-render.
      renderEngine.beginRendering();
    } );

    // Mouse up event handler, bound to the window to catch releases outside the canvas.
    jQuery( window ).bind( 'mouseup', function ( evt ) {
      // Clear the active drag state.
      activeDrag = null;
    } );

    // Helper function to calculate the display width of a vertex's label.
    var measureTextWidth = function ( vertexElem ) {
      var captionText = ( vertexElem.details.displayLabel !== undefined ) ? vertexElem.details.displayLabel : vertexElem.id;
      // Use cached width if available for performance.
      if ( vertexElem._cachedWidth && vertexElem._cachedWidth[captionText] )
        return vertexElem._cachedWidth[captionText];

      drawCtx.pushState(); // Save current drawing state.
      drawCtx.textStyle = ( vertexElem.details.font !== undefined ) ? vertexElem.details.font : elementFont;
      var visualWidth = drawCtx.computeTextMetrics( captionText ).width;
      drawCtx.popState(); // Restore previous drawing state.

      // Cache the calculated width.
      vertexElem._cachedWidth || ( vertexElem._cachedWidth = {} );
      vertexElem._cachedWidth[captionText] = visualWidth;

      return visualWidth;
    };

    // Helper function to determine the display height of a vertex's label.
    var measureTextHeight = function ( vertexElem ) {
      // This is a fixed value, assuming a standard font size.
      // For more accuracy, font metrics would be needed.
      return 14;
    };

    // Helper function to get the display width of a vertex's image.
    var measureImageWidth = function ( vertexElem ) {
      var visualWidth = ( vertexElem.details.picture.visualWidth !== undefined ) ? vertexElem.details.picture.visualWidth : elementPictures[vertexElem.details.picture.sourcePath].imageObject.width;
      return visualWidth;
    }

    // Helper function to get the display height of a vertex's image.
    var measureImageHeight = function ( vertexElem ) {
      var visualHeight = ( vertexElem.details.picture.visualHeight !== undefined ) ? vertexElem.details.picture.visualHeight : elementPictures[vertexElem.details.picture.sourcePath].imageObject.height;
      return visualHeight;
    }

    // Extend the VizEngine.Vertex prototype to include visual size calculation methods.
    VizEngine.Vertex.prototype.getVisualHeight = function () {
      var visualHeight;
      if ( this.details.picture == undefined ) { // If no image is specified.
        visualHeight = measureTextHeight( this );
      } else { // If an image is specified.
        if ( this.details.picture.sourcePath in elementPictures && elementPictures[this.details.picture.sourcePath].isLoaded ) {
          visualHeight = measureImageHeight( this );
        } else {
          visualHeight = 12; // Default height for unloaded images.
        }
      }
      return visualHeight;
    }

    VizEngine.Vertex.prototype.getVisualWidth = function () {
      var visualWidth;
      if ( this.details.picture == undefined ) { // If no image is specified.
        visualWidth = measureTextWidth( this );
      } else { // If an image is specified.
        if ( this.details.picture.sourcePath in elementPictures && elementPictures[this.details.picture.sourcePath].isLoaded ) {
          visualWidth = measureImageWidth( this );
        } else {
          visualWidth = 12; // Default width for unloaded images.
        }
      }
      return visualWidth;
    }

    // Initialize the main rendering engine.
    var renderEngine = this.renderEngine = new VizEngine.Painter( positioning,
      // Clear the canvas before each frame.
      function eraseCanvas () {
        drawCtx.clearRect( 0, 0, renderArea.width, renderArea.height );
      },
      // Function to draw a connection (edge) between two vertices.
      function renderLink ( link, startCoord, endCoord ) {
        var startCoordX = mapToDisplay( startCoord ).x;
        var startCoordY = mapToDisplay( startCoord ).y;
        var endCoordX = mapToDisplay( endCoord ).x;
        var endCoordY = mapToDisplay( endCoord ).y;

        // Calculate the vector representing the link's direction and its normal.
        var pathVector = new VizEngine.Coord( endCoordX - startCoordX, endCoordY - startCoordY );
        var normalVector = pathVector.getNormal().normalize();

        // Get all links between the same pair of source and target vertices.
        var outgoingLinks = network.getLinks( link.source, link.target );
        var incomingLinks = network.getLinks( link.target, link.source );

        var countTotal = outgoingLinks.length + incomingLinks.length;

        // Determine the current link's index among parallel links.
        var linkIndex = 0;
        for ( var i = 0; i < outgoingLinks.length; i++ ) {
          if ( outgoingLinks[i].id === link.id ) {
            linkIndex = i;
          }
        }

        // Define the spacing between parallel links.
        var offsetDistance = 14.0;

        // Calculate the offset for drawing parallel links.
        var separationOffset = normalVector.scale( -( ( countTotal - 1 ) * offsetDistance ) / 2.0 + ( linkIndex * offsetDistance ) );

        var hPadding = 8;
        var vPadding = 8;

        // Apply the offset to the screen coordinates.
        var screenStart = mapToDisplay( startCoord ).combine( separationOffset );
        var screenEnd = mapToDisplay( endCoord ).combine( separationOffset );

        // Calculate the bounding box for the target vertex.
        var elementBoxWidth = link.target.getVisualWidth() + hPadding;
        var elementBoxHeight = link.target.getVisualHeight() + vPadding;

        // Find the intersection point of the link line with the target vertex's bounding box.
        var intersectPoint = findLineBoxIntersection( screenStart, screenEnd, {x: endCoordX - elementBoxWidth / 2.0, y: endCoordY - elementBoxHeight / 2.0}, elementBoxWidth, elementBoxHeight );

        // If no intersection, use the raw screen end point.
        if ( !intersectPoint ) {
          intersectPoint = screenEnd;
        }

        // Determine the color of the link.
        var lineColor = ( link.details.color !== undefined ) ? link.details.color : '#222222';

        var tipWidth;
        var tipLength;

        // Determine the thickness of the link.
        var thickness = ( link.details.thickness !== undefined ) ? link.details.thickness : 1.0;

        drawCtx.pathWidth = Math.max( thickness * 2, 0.05 ); // Set line width.
        tipWidth = 1.5 + drawCtx.pathWidth;
        tipLength = 10;

        // Check if the link should have an arrow (be directional).
        var isDirectional = ( link.details.isDirectional !== undefined ) ? link.details.isDirectional : true;

        // Calculate the actual end point for the line segment, considering the arrow.
        var pathEnd;
        if ( isDirectional ) {
          pathEnd = intersectPoint.deduct( pathVector.normalize().scale( tipLength * 0.6 ) );
        } else {
          pathEnd = screenEnd;
        }

        // Draw the main line segment.
        drawCtx.lineStyle = lineColor;
        drawCtx.startPath();
        drawCtx.moveToPoint( screenStart.x, screenStart.y );
        drawCtx.lineToPoint( pathEnd.x, pathEnd.y );
        drawCtx.drawPath();

        // Draw the arrow head if the link is directional.
        if ( isDirectional ) {
          drawCtx.pushState(); // Save context state.
          drawCtx.fillColor = lineColor;
          drawCtx.shiftOrigin( intersectPoint.x, intersectPoint.y );
          drawCtx.spinContext( Math.atan2( endCoordY - startCoordY, endCoordX - startCoordX ) );
          drawCtx.startPath();
          drawCtx.moveToPoint( -tipLength, tipWidth );
          drawCtx.lineToPoint( 0, 0 );
          drawCtx.lineToPoint( -tipLength, -tipWidth );
          drawCtx.lineToPoint( -tipLength * 0.8, 0 );
          drawCtx.closeShape();
          drawCtx.fillShape();
          drawCtx.popState(); // Restore context state.
        }

        // Draw the link label if defined.
        if ( link.details.caption !== undefined ) {
          var captionText = link.details.caption;
          drawCtx.pushState();
          drawCtx.alignText = "center";
          drawCtx.baselineText = "top";
          drawCtx.textStyle = ( link.details.font !== undefined ) ? link.details.font : connectionFont;
          drawCtx.fillColor = lineColor;
          var rotationAngle = Math.atan2( screenEnd.y - screenStart.y, screenEnd.x - screenStart.x );
          var labelDisplacement = -10;
          // Adjust label orientation for better readability.
          if ( linkTextVertical && ( rotationAngle > Math.PI / 2 || rotationAngle < -Math.PI / 2 ) ) {
            labelDisplacement = 10;
            rotationAngle += Math.PI;
          }
          var labelPosition = screenStart.combine( screenEnd ).split( 2 ).combine( normalVector.scale( labelDisplacement ) );
          drawCtx.shiftOrigin( labelPosition.x, labelPosition.y );
          drawCtx.spinContext( rotationAngle );
          drawCtx.drawText( captionText, 0, -3 ); // Draw the text slightly above the line.
          drawCtx.popState();
        }

      },
      // Function to draw a vertex (node) on the canvas.
      function renderVertex ( vertex, worldCoord ) {
        var screenPt = mapToDisplay( worldCoord );

        drawCtx.pushState();

        // Padding values for the vertex's bounding box.
        var hPadding = 8;
        var vPadding = 8;

        var contentWidth = vertex.getVisualWidth();
        var contentHeight = vertex.getVisualHeight();
        var elementBoxWidth = contentWidth + hPadding;
        var elementBoxHeight = contentHeight + vPadding;

        // Clear the background area where the vertex will be drawn.
        drawCtx.clearRegion( screenPt.x - elementBoxWidth / 2, screenPt.y - elementBoxHeight / 2, elementBoxWidth, elementBoxHeight );

        // Fill the background of the vertex based on its selection state.
        if ( pickedElement !== null && pickedElement.vertex !== null && pickedElement.vertex.id === vertex.id ) {
          drawCtx.fillColor = "#FFFFCC"; // Light yellow for selected.
        } else if ( hoveredItem !== null && hoveredItem.vertex !== null && hoveredItem.vertex.id === vertex.id ) {
          drawCtx.fillColor = "#EEEEEE"; // Light gray for hovered.
        } else {
          drawCtx.fillColor = "#F8F8F8"; // Off-white for default.
        }
        drawCtx.fillRegion( screenPt.x - elementBoxWidth / 2, screenPt.y - elementBoxHeight / 2, elementBoxWidth, elementBoxHeight );

        // Draw either text label or an image for the vertex.
        if ( vertex.details.picture == undefined ) {
          drawCtx.alignText = "left";
          drawCtx.baselineText = "top";
          drawCtx.textStyle = ( vertex.details.font !== undefined ) ? vertex.details.font : elementFont;
          drawCtx.fillColor = ( vertex.details.color !== undefined ) ? vertex.details.color : "#333333";
          var displayString = ( vertex.details.displayLabel !== undefined ) ? vertex.details.displayLabel : vertex.id;
          drawCtx.drawText( displayString, screenPt.x - contentWidth / 2, screenPt.y - contentHeight / 2 );
        } else {
          // If an image is specified, try to draw it.
          var sourcePath = vertex.details.picture.sourcePath;
          if ( sourcePath in elementPictures ) {
            if ( elementPictures[sourcePath].isLoaded ) {
              // Image is loaded, draw it.
              drawCtx.drawImage( elementPictures[sourcePath].imageObject, screenPt.x - contentWidth / 2, screenPt.y - contentHeight / 2, contentWidth, contentHeight );
            }
          } else {
            // First encounter of this image source; create and load the image.
            elementPictures[sourcePath] = {};
            var graphic = new Image();
            elementPictures[sourcePath].imageObject = graphic;
            graphic.addEventListener( "load", function () {
              // Set the loaded flag once the image is ready.
              elementPictures[sourcePath].isLoaded = true;
            } );
            graphic.src = sourcePath;
          }
        }
        drawCtx.popState();
      }
    );

    // Start the rendering loop.
    renderEngine.beginRendering();

    // Helper function to find the intersection point of two line segments.
    function findLineIntersection ( line1p1, line1p2, line2p1, line2p2 ) {
      var denominatorVal = ( ( line2p2.y - line2p1.y ) * ( line1p2.x - line1p1.x ) - ( line2p2.x - line2p1.x ) * ( line1p2.y - line1p1.y ) );

      // Lines are parallel if denominator is zero.
      if ( denominatorVal === 0 ) {
        return false;
      }

      var paramA = ( ( line2p2.x - line2p1.x ) * ( line1p1.y - line2p1.y ) - ( line2p2.y - line2p1.y ) * ( line1p1.x - line2p1.x ) ) / denominatorVal;
      var paramB = ( ( line1p2.x - line1p1.x ) * ( line1p1.y - line2p1.y ) - ( line1p2.y - line1p1.y ) * ( line1p1.x - line2p1.x ) ) / denominatorVal;

      // Check if intersection point lies within both segments.
      if ( paramA < 0 || paramA > 1 || paramB < 0 || paramB > 1 ) {
        return false;
      }

      return new VizEngine.Coord( line1p1.x + paramA * ( line1p2.x - line1p1.x ), line1p1.y + paramA * ( line1p2.y - line1p1.y ) );
    }

    // Helper function to find the intersection point of a line segment with a rectangle.
    function findLineBoxIntersection ( lineP1, lineP2, boxTL, boxW, boxH ) {
      var topLeft = {x: boxTL.x, y: boxTL.y};
      var topRight = {x: boxTL.x + boxW, y: boxTL.y};
      var bottomLeft = {x: boxTL.x, y: boxTL.y + boxH};
      var bottomRight = {x: boxTL.x + boxW, y: boxTL.y + boxH};

      var intersectResult;
      // Check intersection with each side of the box.
      if ( intersectResult = findLineIntersection( lineP1, lineP2, topLeft, topRight ) ) {
        return intersectResult;
      } // Top side
      if ( intersectResult = findLineIntersection( lineP1, lineP2, topRight, bottomRight ) ) {
        return intersectResult;
      } // Right side
      if ( intersectResult = findLineIntersection( lineP1, lineP2, bottomRight, bottomLeft ) ) {
        return intersectResult;
      } // Bottom side
      if ( intersectResult = findLineIntersection( lineP1, lineP2, bottomLeft, topLeft ) ) {
        return intersectResult;
      } // Left side

      return false; // No intersection found.
    }

    // Return the jQuery object for chaining.
    return this;
  }

} )();