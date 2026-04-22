// This immediately invoked function expression (IIFE) creates a private scope.
// It helps to prevent global variable pollution.
(function( ) {

  "use strict"; // Enforce strict mode for better code quality and error handling.

  /*
   * The following multi-line comment defines the essential contract for any
   * shape object within the FloorplanShapes system. All shapes must adhere
   * to these specifications to ensure proper integration and rendering.
   *
   * 1. MyShape.name: A mandatory string property that identifies the type
   *                   of the shape. This name will be stored with each shape
   *                   instance.
   *
   * 2. MyShape.draw(ctx, shape, canvas):
   *    This method is responsible for rendering the shape onto the canvas.
   *    It receives the following arguments:
   *        - ctx:    The 2D rendering context of the HTML5 canvas element.
   *        - shape:  The specific shape object instance to be drawn,
   *                  containing its properties (e.g., center, size, rotation).
   *        - canvas: A reference to the FloorplanCanvas instance that
   *                  initiated the drawing operation.
   *    Note: The calling function handles the `ctx.save()` and `ctx.restore()`
   *          operations, so this method should not perform them itself.
   *
   * 3. MyShape.getCenter(shape):
   *    A function that calculates and returns the central point of the given shape.
   *    This is crucial for positioning and interaction logic.
   *
   * 4. MyShape.getSize(shape):
   *    A function that determines and returns the bounding box or dimensions
   *    of the shape. This is often used for collision detection or layout.
   */

  // Initialize a global object to hold all Floorplan shape definitions.
  // This makes them accessible throughout the application.
  window. FloorplanShapes = { };

  // Define default values for drawing styles. These constants ensure
  // consistent visual presentation across different shapes and elements.

  // Default stroke width in pixels.
  FloorplanShapes.DEFAULT_STROKE_WIDTH = 2;

  // Default stroke color and transparency (RGBA format).
  FloorplanShapes.DEFAULT_STROKE_STYLE = "rgba(0, 0, 0, 0.8)";

  // Default fill color for most shapes.
  FloorplanShapes.DEFAULT_FILL_STYLE = "rgba(192, 192, 192, 0.8)";

  // Specific fill style for vaulted ceiling rooms, often lighter.
  FloorplanShapes.VAULTED_FILL_STYLE = "rgba(255, 255, 255, 0.8)";

  // Default font style for labels within shapes.
  FloorplanShapes.DEFAULT_FONT = "12px sans-serif";

  // Default fill color for text labels.
  FloorplanShapes.DEFAULT_FONT_FILL_STYLE = "rgba(0, 0, 0, 0.8)";

  /**
   * GenericRoom constructor function.
   * This serves as a base class for all room-like shapes, providing common
   * properties and methods.
   * @param {string} name - The type name of the generic room.
   */
  FloorplanShapes.GenericRoom = function( name ) {
    this.name = name; // Assign the provided name to the instance.
  };

  /**
   * The core drawing method for any generic room.
   * It sets up the context, applies transformations, calls a specific
   * `drawRoom` method, and then draws the room's label.
   * @param {CanvasRenderingContext2D} ctx    - The canvas 2D rendering context.
   * @param {object}                   shape  - The shape object to draw.
   * @param {object}                   canvas - The FloorplanCanvas instance.
   */
  FloorplanShapes.GenericRoom.prototype.draw = function( ctx, shape, canvas ) {
    // Set up basic stroke properties for the room outline.
    ctx.strokeWidth = FloorplanShapes.DEFAULT_STROKE_WIDTH;
    ctx.strokeStyle = FloorplanShapes.DEFAULT_STROKE_STYLE;

    // Translate the canvas origin to the shape's center for easier drawing.
    ctx.translate( shape.center.x, shape.center.y );

    // Save the current canvas state before applying rotation.
    ctx.save( );

    // Apply rotation if specified in the shape's properties.
    if ( shape.rotation ) {
      // Convert degrees to radians for canvas rotation.
      ctx.rotate( shape.rotation * Math.PI / 180.0 );
    }

    // Call the specific room drawing logic, which will be implemented
    // by derived room types.
    this.drawRoom( ctx, shape, canvas );

    // Restore the canvas state to remove the rotation and translation
    // applied specifically for this shape's drawing.
    ctx.restore( );

    // Set up font properties for the shape's label.
    ctx.font = FloorplanShapes.DEFAULT_FONT;
    ctx.textAlign = "center";      // Center the text horizontally.
    ctx.textBaseline = "middle"; // Center the text vertically.
    ctx.fillStyle = FloorplanShapes.DEFAULT_FONT_FILL_STYLE;

    // Draw the shape's label at the current origin (which is the shape's center).
    ctx.fillText( shape.label, 0, 0 );
  };

  /**
   * Placeholder method for drawing the specific geometry of a room.
   * This method is intended to be overridden by concrete room implementations.
   * It's considered an "abstract" method in this context.
   * @param {CanvasRenderingContext2D} ctx    - The canvas 2D rendering context.
   * @param {object}                   shape  - The shape object.
   * @param {object}                   canvas - The FloorplanCanvas instance.
   */
  FloorplanShapes.GenericRoom.prototype.drawRoom = function( ctx, shape, canvas ) {
    // This method is intentionally empty; it's meant to be implemented by subclasses.
    // It defines the interface for drawing the unique part of each room shape.
  };

  /**
   * Returns the center point of the shape. For GenericRoom, it's just the
   * shape's predefined center property.
   * @param   {object} shape - The shape object.
   * @returns {object} The center point {x, y}.
   */
  FloorplanShapes.GenericRoom.prototype.getCenter = function( shape ) {
    return shape.center;
  };

  /*
   * RectangularRoom: Defines a simple rectangular room.
   * This shape requires the following properties in its data object:
   *
   *   - id:       A unique identifier for the shape (string or number).
   *   - type:     Must be "rect-room" to identify this shape type.
   *   - center:   An object {x: number, y: number} representing the room's central coordinates.
   *   - size:     An object {length: number, width: number} defining the dimensions.
   *   - rotation: The rotation angle in degrees (optional, defaults to 0).
   */
  FloorplanShapes.RectangularRoom = function( ) { };
  // Inherit from GenericRoom, setting its name.
  FloorplanShapes.RectangularRoom.prototype = new FloorplanShapes.GenericRoom( "rect-room" );
  // Correct the constructor reference.
  FloorplanShapes.RectangularRoom.prototype.constructor = FloorplanShapes.RectangularRoom;

  /**
   * Implements the drawRoom method for a rectangular room.
   * @param {CanvasRenderingContext2D} ctx    - The canvas 2D rendering context.
   * @param {object}                   shape  - The shape object containing dimensions.
   * @param {object}                   canvas - The FloorplanCanvas instance (unused here).
   */
  FloorplanShapes.RectangularRoom.prototype.drawRoom = function( ctx, shape, canvas ) {
    // Set the fill style to the default.
    ctx.fillStyle = FloorplanShapes.DEFAULT_FILL_STYLE;

    // Draw a filled rectangle.
    // Coordinates are relative to the shape's center (0,0 after translation).
    ctx.fillRect( -shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width );

    // Draw the outline of the rectangle.
    ctx.strokeRect( -shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width );
  };


  /*
   * VaultedRoom: Represents a room with a vaulted ceiling on one side.
   * When drawn without rotation, the vaulting effect appears on the
   * "south" side (bottom).
   *
   * Required properties for this shape:
   *
   *   - id:          The shape's unique identifier.
   *   - type:        Must be "vaulted-room".
   *   - center:      Object {x, y} for the room's central point.
   *   - size:        Object {length, width} for the room's overall dimensions.
   *   - rotation:    Rotation angle in degrees (optional).
   */
  FloorplanShapes.VaultedRoom = function( ) { };
  // Set up inheritance from GenericRoom.
  FloorplanShapes.VaultedRoom.prototype = new FloorplanShapes.GenericRoom( "vaulted-room" );
  // Ensure the constructor points back to VaultedRoom.
  FloorplanShapes.VaultedRoom.prototype.constructor = FloorplanShapes.VaultedRoom;

  /**
   * Implements the drawRoom method for a vaulted room, using a linear gradient
   * to simulate the vaulted ceiling effect.
   * @param {CanvasRenderingContext2D} ctx    - The canvas 2D rendering context.
   * @param {object}                   shape  - The shape object with size information.
   * @param {object}                   canvas - The FloorplanCanvas instance (unused).
   */
  FloorplanShapes.VaultedRoom.prototype.drawRoom = function( ctx, shape, canvas ) {
    // Create a linear gradient from top to bottom of the room.
    // The gradient will go from the default fill style to the vaulted fill style.
    var gradient = ctx.createLinearGradient( 0, -shape.size.width / 2, 0, shape.size.width / 2 );
    gradient.addColorStop( 0, FloorplanShapes.DEFAULT_FILL_STYLE );      // Top part of the room.
    gradient.addColorStop( 1, FloorplanShapes.VAULTED_FILL_STYLE ); // Bottom part of the room (vaulted).
    ctx.fillStyle = gradient; // Apply the gradient as the fill style.

    // Draw the filled rectangle with the gradient.
    ctx.fillRect( -shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width );
    // Draw the outline of the rectangle.
    ctx.strokeRect( -shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width );
  };


  /*
   * CathedralRoom: Represents a room with a ceiling vaulted in the middle,
   * creating a symmetrical effect.
   * The highest point of the ceiling is horizontal when unrotated.
   *
   * Required properties for this shape:
   *
   *   - id:       The shape's unique identifier.
   *   - type:     Must be "cathedral-room".
   *   - center:   Object {x, y} for the room's central point.
   *   - size:     Object {length, width} for the room's overall dimensions.
   *   - rotation: Rotation angle in degrees (optional).
   */
  FloorplanShapes.CathedralRoom = function( ) { };
  // Inherit from the base GenericRoom class.
  FloorplanShapes.CathedralRoom.prototype = new FloorplanShapes.GenericRoom( "cathedral-room" );
  // Correct the constructor property.
  FloorplanShapes.CathedralRoom.prototype.constructor = FloorplanShapes.CathedralRoom;

  /**
   * Implements the drawRoom method for a cathedral room, using a linear gradient
   * that is lighter in the middle.
   * @param {CanvasRenderingContext2D} ctx    - The canvas 2D rendering context.
   * @param {object}                   shape  - The shape object with size information.
   * @param {object}                   canvas - The FloorplanCanvas instance (unused).
   */
  FloorplanShapes.CathedralRoom.prototype.drawRoom = function( ctx, shape, canvas ) {
    // Create a linear gradient that goes from default, to vaulted, then back to default.
    var gradient = ctx.createLinearGradient( 0, -shape.size.width / 2, 0, shape.size.width / 2 );
    gradient.addColorStop( 0, FloorplanShapes.DEFAULT_FILL_STYLE );        // Top edge.
    gradient.addColorStop( 0.5, FloorplanShapes.VAULTED_FILL_STYLE ); // Middle of the room (highest point).
    gradient.addColorStop( 1, FloorplanShapes.DEFAULT_FILL_STYLE );        // Bottom edge.
    ctx.fillStyle = gradient; // Set the gradient as the fill style.

    // Draw the filled rectangle using the defined gradient.
    ctx.fillRect( -shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width );
    // Draw the outline of the rectangle.
    ctx.strokeRect( -shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width );
  };


  /*
   * LShapedRoom: Defines an L-shaped room by drawing a large rectangle
   * and effectively "cutting out" a corner.
   *
   * Required properties for this shape:
   *
   *   - id:         The shape's unique identifier.
   *   - type:       Must be "l-shaped-room".
   *   - center:     Object {x, y} for the room's central point.
   *   - size:       Object {length, width} for the overall bounding box dimensions.
   *   - cornerSize: Object {length, width} for the dimensions of the missing corner.
   *   - rotation:   Rotation angle in degrees (optional).
   */
  FloorplanShapes.LShapedRoom = function( ) { };
  // Establish inheritance from GenericRoom.
  FloorplanShapes.LShapedRoom.prototype = new FloorplanShapes.GenericRoom( "l-shaped-room" );
  // Correct the constructor property for instances of LShapedRoom.
  FloorplanShapes.LShapedRoom.prototype.constructor = FloorplanShapes.LShapedRoom;

  /**
   * Implements the drawRoom method for an L-shaped room using `beginPath`
   * and `lineTo` to define its complex perimeter.
   * @param {CanvasRenderingContext2D} ctx    - The canvas 2D rendering context.
   * @param {object}                   shape  - The shape object with size and cornerSize.
   * @param {object}                   canvas - The FloorplanCanvas instance (unused).
   */
  FloorplanShapes.LShapedRoom.prototype.drawRoom = function( ctx, shape, canvas ) {
    // Set the fill style to the default for this room.
    ctx.fillStyle = FloorplanShapes.DEFAULT_FILL_STYLE;
    ctx.beginPath( ); // Start a new path for drawing the L-shape.

    // Move to the top-left corner of the bounding box.
    ctx.moveTo( -shape.size.length / 2, -shape.size.width / 2 );
    // Draw to the point just before the cutout begins on the top edge.
    ctx.lineTo( shape.size.length / 2 - shape.cornerSize.length, -shape.size.width / 2 );
    // Draw down into the cutout.
    ctx.lineTo( shape.size.length / 2 - shape.cornerSize.length, -shape.size.width / 2 + shape.cornerSize.width );
    // Draw across the inner edge of the cutout.
    ctx.lineTo( shape.size.length / 2, -shape.size.width / 2 + shape.cornerSize.width );
    // Draw down to the bottom-right corner.
    ctx.lineTo( shape.size.length / 2, shape.size.width / 2 );
    // Draw to the bottom-left corner.
    ctx.lineTo( -shape.size.length / 2, shape.size.width / 2 );
    // Close the path by drawing back to the starting point (top-left).
    ctx.lineTo( -shape.size.length / 2, -shape.size.width / 2 );
    ctx.fill( );   // Fill the defined L-shape.
    ctx.stroke( ); // Stroke the outline of the L-shape.
  };

// End of the immediately invoked function expression.
})( );