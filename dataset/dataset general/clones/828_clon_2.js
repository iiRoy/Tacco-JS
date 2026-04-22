// DrawingEngine: A JavaScript-based graphics utility
// Implements a turtle-like drawing system on a HTML Canvas.

// Core Concepts:
// - All distances and positions are measured in pixels.
// - All rotational values are specified in degrees (easier for humans).

// Public Interface Methods:
//
// - `startPath()`
//   Initializes a new drawing path on the canvas, akin to lifting the tool and starting fresh.
//
// - `moveForward(distanceToAdvance)`
//   Advances the drawing tool in its current orientation by the specified pixel distance.
//
// - `moveBackward(distanceToRetreat)`
//   Performs the inverse operation of `moveForward`.
//
// - `rotate(degreesToTurn)`
//   Adjusts the drawing tool's current heading. Negative values turn counter-clockwise (left),
//   positive values turn clockwise (right).
//
// - `liftTool()` and `placeTool()`
//   Controls whether the tool draws (down) or simply moves without drawing (up).
//
// - `moveUpward(distance)`, `moveDownward(distance)`, `moveLeftward(distance)`, `moveRightward(distance)`
//   Convenience methods for relative movement along the canvas's coordinate axes.
//
// - `moveToCoordinates(targetX, targetY)`
//   Relocates the drawing tool to an absolute position, respecting the current drawing state (up/down).
//
// - `teleportTo(destinationX, destinationY)`
//   Similar to `moveToCoordinates`, but always moves without drawing a line, and implicitly calls `startPath()`.
//
// - `finalizeDrawing()`
//   A helper method that calls `renderFill()` and `renderOutline()`. It only executes
//   these if corresponding styles are defined.
//
// - `closePathSegment()`
//   Connects the current point to the starting point of the current subpath, useful for closed shapes.
//
// - `renderOutline()` and `renderFill()`
//   Wrappers for canvas stroke and fill operations, allowing explicit control over path rendering.
//
// - `setLineThickness(widthValue)`
//   Adjusts the width of the lines drawn by the tool.
//
// - `setLineColor(colorString)`
//   Directly sets the canvas stroke style, e.g., `setLineColor("#f00")` for red lines.
//
// - `setColorForFill(colorString)`
//   Directly sets the canvas fill style, typically a solid color like `setColorForFill("blue")`.
//
// - `setFontStyle(fontSpecification)`
//   Applies a CSS-like font specification, e.g., `setFontStyle("italic 18px Arial")`.
//   Text color is determined by the last `setColorForFill` setting.
//
// - `displayText(textContent)`
//   Renders text at the tool's current position. Angle support might be added later.
//
// - `establishOrigin()`
//   Designates the current tool position as the reference point for `moveToPolar()` operations.
//
// - `moveToPolar(radialDistance, angularPosition)`
//   Moves the tool using polar coordinates relative to the last established origin.
//   This is a powerful addition for complex geometric patterns.
//
// - `markPosition()` and `returnToMarked()`
//   `markPosition()` saves the current position and direction. `returnToMarked()` restores to the last saved state.
//   This feature is experimental and might be refined or removed.
//
// - `setDirection(absoluteAngle)`
//   Resets the tool's absolute direction (0 degrees typically points upwards).

Painter = function(targetElement) {
  this.currentAngle = -90; // Default direction: pointing upwards (North)
  this.posX = 0; // Initial X coordinate
  this.posY = 0; // Initial Y coordinate

  this.targetElement = document.getElementById(targetElement) || targetElement; // Get canvas element or use provided reference

  this.drawingContext = this.targetElement.getContext("2d"); // Obtain 2D rendering context
  this.lineColor = this.drawingContext.strokeStyle = "#000"; // Default stroke color (black)
  this.lineThickness = this.drawingContext.lineWidth = 1; // Default line thickness (1 pixel)
  this.fillColor = this.drawingContext.fillStyle = ""; // Default fill color (none)

  this.originX = 0; // Reference X for polar coordinates
  this.originY = 0; // Reference Y for polar coordinates

  this.isDrawing = true; // Is the tool currently drawing? (true = pen down)

  this.drawingContext.beginPath(); // Start an initial path segment
};

Painter.prototype = {
  rotate: function(degreesToRotate) {
    this.currentAngle += degreesToRotate; // Adjust current angle
    this.currentAngle %= 360; // Normalize angle to 0-359 range

    return this; // Enable method chaining
  },

  setColorForFill: function(fillStyleValue) {
    this.fillColor = this.drawingContext.fillStyle = fillStyleValue; // Set internal and canvas fill style

    return this;
  },

  markPosition: function() {
    if (!this.savedLocations) this.savedLocations = []; // Initialize array if not present
    this.savedLocations.push({
      xPos: this.posX,
      yPos: this.posY,
      heading: this.currentAngle
    }); // Store current state
    return this;
  },

  setDirection: function(newAngleDegrees) {
    this.currentAngle = newAngleDegrees - 90; // Adjust for canvas's 0-degree being right, ours is up
    return this;
  },

  returnToMarked: function() {
    if (!this.savedLocations || this.savedLocations.length === 0) return this; // No saved locations
    var lastSaved = this.savedLocations.pop(); // Retrieve the last saved state
    this.currentAngle = lastSaved.heading; // Restore direction

    return this.moveToCoordinates(lastSaved.xPos, lastSaved.yPos); // Move to saved position
  },

  moveForward: function(distanceToMove) {
    var radiansAngle = this.degreesToRadians(this.currentAngle); // Convert degrees to radians for Math functions

    this.posX += distanceToMove * Math.cos(radiansAngle); // Update X position
    this.posY += distanceToMove * Math.sin(radiansAngle); // Update Y position

    if (this.isDrawing)
      this.drawingContext.lineTo(this.posX, this.posY); // Draw a line if tool is down
    else
      this.drawingContext.moveTo(this.posX, this.posY); // Just move if tool is up

    return this;
  },

  moveBackward: function(distanceToRetreat) {
    this.rotate(-180); // Turn around
    this.moveForward(distanceToRetreat); // Move forward by distance
    this.rotate(180); // Turn back to original orientation

    return this;
  },

  renderOutline: function() {
    this.drawingContext.stroke(); // Apply stroke to current path

    return this;
  },

  renderFill: function() {
    this.drawingContext.fill(); // Apply fill to current path

    return this;
  },

  startPath: function() {
    this.drawingContext.beginPath(); // Begin a new path

    return this;
  },

  closePathSegment: function() {
    this.drawingContext.closePath(); // Close the current subpath

    return this;
  },

  finalizeDrawing: function() {
    if (this.fillColor) // Check if a fill style is defined
      this.renderFill(); // Perform fill operation
    if (this.lineThickness) // Check if a line thickness is defined (implies stroke)
      this.renderOutline(); // Perform stroke operation

    return this.startPath(); // Start a new path for subsequent drawings
  },

  liftTool: function() {
    this.isDrawing = false; // Disable drawing mode

    return this;
  },

  placeTool: function() {
    this.isDrawing = true; // Enable drawing mode

    return this;
  },

  moveToCoordinates: function(targetX, targetY) {
    this.posX = targetX; // Set new X position
    this.posY = targetY; // Set new Y position

    if (!this.isDrawing) // If tool is lifted
      this.drawingContext.moveTo(targetX, targetY); // Move without drawing
    else
      this.drawingContext.lineTo(targetX, targetY); // Draw a line to the new position

    return this;
  },

  teleportTo: function(destinationX, destinationY) {
    this.drawingContext.beginPath(); // Start a new path (ensures no line is drawn from previous location)

    var previousDrawingState = this.isDrawing; // Store current drawing state
    this.isDrawing = true; // Temporarily set to drawing for moveToCoordinates to use lineTo for internal logic consistency
    this.moveToCoordinates(destinationX, destinationY); // Move to the destination
    this.isDrawing = previousDrawingState; // Restore original drawing state

    return this;
  },

  moveUpward: function(distance) {
    return this.moveToCoordinates(this.posX, this.posY - distance); // Move along Y-axis negatively
  },

  moveDownward: function(distance) {
    return this.moveToCoordinates(this.posX, this.posY + distance); // Move along Y-axis positively
  },

  moveLeftward: function(distance) {
    return this.moveToCoordinates(this.posX - distance, this.posY); // Move along X-axis negatively
  },

  moveRightward: function(distance) {
    return this.moveToCoordinates(this.posX + distance, this.posY); // Move along X-axis positively
  },

  moveToPolar: function(radialDistance, polarAngleDegrees) {
    var angleInRadians = this.degreesToRadians(polarAngleDegrees + this.currentAngle); // Convert relative angle to radians

    this.posX = this.originX + radialDistance * Math.cos(angleInRadians); // Calculate new X from origin
    this.posY = this.originY + radialDistance * Math.sin(angleInRadians); // Calculate new Y from origin

    if (this.isDrawing)
      this.drawingContext.lineTo(this.posX, this.posY); // Draw if active
    else
      this.drawingContext.moveTo(this.posX, this.posY); // Move if inactive

    return this;
  },

  establishOrigin: function() {
    this.originX = this.posX; // Set current X as origin X
    this.originY = this.posY; // Set current Y as origin Y

    return this;
  },

  degreesToRadsFactor: Math.PI / 180.0, // Constant for degree-to-radian conversion

  degreesToRadians: function(degreesValue) {
    return degreesValue * this.degreesToRadsFactor; // Convert degrees to radians
  },

  setLineThickness: function(thicknessValue) {
    this.lineThickness = this.drawingContext.lineWidth = thicknessValue; // Set internal and canvas line width

    return this;
  },

  setLineColor: function(colorString) {
    this.drawingContext.strokeStyle = this.lineColor = colorString; // Set internal and canvas stroke style

    return this;
  },

  displayText: function(textToDisplay) {
    this.drawingContext.fillText(textToDisplay, this.posX, this.posY); // Render text at current position

    return this;
  },

  setFontStyle: function(fontSpec) {
    this.drawingContext.font = fontSpec; // Apply font style to canvas context

    return this;
  }
};