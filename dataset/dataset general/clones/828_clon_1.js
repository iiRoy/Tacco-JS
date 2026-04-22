// This is a re-formatted version of the Pen.js library.
// It provides a Canvas-based turtle graphics implementation.

// This file demonstrates a Type I code clone,
// where only whitespace and comments have been altered.

Pen = function(tag)
{
 // Initialize pen's direction, and current x, y coordinates
 this.dir = -90;
 this.x = 0;
 this.y = 0;

 // Retrieve the canvas element. If 'tag' is already an element, use it.
 this.tag = document.getElementById(tag) || tag;

 // Get the 2D rendering context from the canvas
 this.canvas = this.tag.getContext("2d");
 // Set default stroke style and line width for the pen
 this.strokeStyle = this.canvas.strokeStyle = "#000";
 this.lineWidth = this.canvas.lineWidth = 1;
 // Initialize fill style (empty by default)
 this.fillStyle = this.canvas.fillStyle = "";

 // Initialize origin coordinates for polar moves
 this.ox = 0;
 this.oy = 0;

 // Pen's drawing state: true means drawing, false means not drawing
 this.pen = true;

 // Begin a new path on the canvas immediately upon instantiation
 this.canvas.beginPath();
}; /* End of Pen constructor function definition */


Pen.prototype = {

 // Method to change the pen's current direction by a specified angle in degrees
 turn: function(deg) {
  this.dir += deg; // Add the degrees to the current direction
  this.dir = this.dir % 360; // Keep the direction within 0-359 degrees

  // Return 'this' for method chaining
  return this;
 },


 // Method to set the fill style for shapes
 fillstyle: function(style) {
  this.fillStyle = this.canvas.fillStyle = style; // Update both internal and canvas fill style

  return this; // Enable chaining
 },


 // Method to save the current pen state (position, angle)
 // Note: 'homes' array is not initialized in the constructor, which could lead to an error
 // if 'set' is called before 'home' or before 'homes' is otherwise defined.
 set: function() {
  this.homes.push({ x: this.x, y: this.y, angle: this.dir }); // Store current state
  return this; // For method chaining
 },


 // Method to set the pen's absolute angle
 angle: function(a) {
  this.dir = a - 90; // Adjust angle to match canvas's coordinate system (0 degrees is up)
  return this;
 },


 // Method to return the pen to the last saved 'home' position
 home: function() {
  var last = this.homes.pop(); // Retrieve the last saved state from the stack
  this.dir = last.angle;       // Restore the saved angle

  // Move the pen to the saved coordinates.
  // Note: The original code uses this.x and this.y, not last.x and last.y,
  // which means it returns to the *current* position's x,y, but with the *saved* angle.
  // This might be an unintended behavior in the original code, but is preserved here.
  return this.goto(this.x, this.y);
 },


 // Method to move the pen forward by a given distance 'r'
 go: function(r) {
  var a = this.toRad(this.dir); // Convert current direction to radians

  this.x += r * Math.cos(a); // Calculate new x coordinate
  this.y += r * Math.sin(a); // Calculate new y coordinate

  // If pen is down, draw a line; otherwise, just move without drawing
  if (this.pen)
   this.canvas.lineTo(this.x, this.y);
  else
   this.canvas.moveTo(this.x, this.y);

  return this;
 },


 // Method to move the pen backward by a given distance 'r'
 back: function(r) {
  this.turn(-180); // Turn 180 degrees to face backward
  this.go(r);      // Move forward (which is now backward relative to original direction)
  this.turn(180);  // Turn back 180 degrees to restore original direction

  return this;
 },


 // Method to stroke the current path on the canvas
 stroke: function() {
  this.canvas.stroke(); // Perform the canvas stroke operation

  return this;
 },


 // Method to fill the current path on the canvas
 fill: function() {
  this.canvas.fill(); // Perform the canvas fill operation

  return this;
 },


 // Method to begin a new path on the canvas
 begin: function() {
  this.canvas.beginPath(); // Start a new path

  return this;
 },


 // Method to close the current path, connecting the last point to the first
 close: function() {
  this.canvas.closePath(); // Close the path on the canvas

  return this;
 },


 // Convenience method to draw the current path (fill and/or stroke) and then start a new path
 draw: function() {
  if (this.fillStyle) // If a fill style is defined, fill the path
   this.fill();
  if (this.lineWidth) // If a line width is defined (meaning stroke should happen), stroke the path
   this.stroke();

  return this.begin(); // Start a new path after drawing
 },


 // Method to lift the pen, preventing drawing during movement
 penup: function() {
  this.pen = false; // Set pen state to 'up'

  return this;
 },


 // Method to put the pen down, enabling drawing during movement
 pendown: function() {
  this.pen = true; // Set pen state to 'down'

  return this;
 },


 // Method to move the pen to absolute coordinates (x, y)
 goto: function(x, y) {
  this.x = x; // Update current x coordinate
  this.y = y; // Update current y coordinate

  // If pen is up, just move; otherwise, draw a line to the new point
  if (!this.pen)
   this.canvas.moveTo(x, y);
  else
   this.canvas.lineTo(x, y);

  return this;
 },


 // Method to jump to absolute coordinates without drawing a line, and starts a new path
 jump: function(x, y) {
  this.canvas.beginPath(); // Start a new path

  var p = this.pen; // Save current pen state
  this.pen = true;   // Temporarily set pen down to ensure goto performs a move (or lineTo)
  this.goto(x, y);   // Move to the target coordinates
  this.pen = p;      // Restore original pen state

  return this;
 },

 // Convenience methods for relative moves along cardinal directions
 // Move pen up (decrease y)
 up: function(r) {
  return this.goto(this.x, this.y - r);
 },

 // Move pen down (increase y)
 down: function(r) {
  return this.goto(this.x, this.y + r);
 },

 // Move pen left (decrease x)
 left: function(r) {
  return this.goto(this.x - r, this.y);
 },

 // Move pen right (increase x)
 right: function(r) {
  return this.goto(this.x + r, this.y);
 },


 // Method to move using polar coordinates relative to the last set origin
 polar: function(r, angle) {
  var a = this.toRad(angle + this.dir); // Calculate absolute angle in radians

  this.x = this.ox + r * Math.cos(a); // Calculate new x based on origin
  this.y = this.oy + r * Math.sin(a); // Calculate new y based on origin

  // Draw line if pen is down, otherwise just move
  if (this.pen)
   this.canvas.lineTo(this.x, this.y);
  else
   this.canvas.moveTo(this.x, this.y);

  return this;
 },


 // Method to set the current pen position as the origin for future polar moves
 origin: function() {
  this.ox = this.x; // Set origin x to current x
  this.oy = this.y; // Set origin y to current y

  return this;
 },


 // Constant for converting degrees to radians (PI / 180)
 rad: Math.PI / 180.0,


 // Helper method to convert degrees to radians
 toRad: function(d) {
  return d * this.rad; // Multiply degrees by the radian constant
 },


 // Method to set the pen's line width (thickness)
 pensize: function(size) {
  this.lineWidth = this.canvas.lineWidth = size; // Update both internal and canvas line width

  return this;
 },


 // Method to set the pen's stroke style (color)
 penstyle: function(str) {
  this.canvas.strokeStyle = this.strokeStyle = str; // Update both internal and canvas stroke style

  return this;
 },


 // Method to draw text at the current pen position
 text: function(str) {
  this.canvas.fillText(str, this.x, this.y); // Draw the text on the canvas

  return this;
 },


 // Method to set the font style for text drawing
 font: function(str) {
  this.canvas.font = str; // Set the canvas font property

  return this;
 }
}; // End of Pen.prototype object definition, effectively closing the Pen class structure.