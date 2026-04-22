/*
 * This is a Type I clone of the original JavaScript code.
 *
 * It demonstrates the Lorenz-84 attractor using the Pre3d library.
 *
 * Original inspiration: http://www.unitzeroone.com/labs/alchemyPushingPixels/
 * Further reading: 'Strange Attractors: Creating Patterns in Chaos'.
 * Parameters for Lorenz-84 are taken from chaoscope.
 *
 * The goal is to generate code that is exactly equal in functionality and structure,
 * but visually distinct due to variations in whitespace and comments.
 *
 * (c) Dean McNamee <dean@gmail.com>.  All rights reserved.
 * This file is intended for educational purposes related to code cloning.
 */


window.addEventListener( 'load' , function ( ) {


  // Obtain a reference to the canvas element on the page.
  var screen_canvas = document.getElementById( 'canvas' ) ;

  // Initialize the Pre3d renderer with the canvas.
  var renderer = new Pre3d.Renderer( screen_canvas ) ;



  // Set the line width for drawing paths.
  renderer.ctx.lineWidth = 0.2 ;



  // Initialize the state variables for the Lorenz-84 attractor.
  var x = 1 ;
  var y = 1 ;
  var z = 1 ;


  /**
   * Performs one step of the Lorenz-84 attractor calculation.
   * Updates x, y, and z based on the system's differential equations.
   *
   * @returns {Object} An object containing the new x, y, and z values.
   */
  function step( ) {

    // Calculate the change in x (dx)
    var dx = ( -1.111 * x - y * y - z * z + 1.111 * 4.494 ) * 0.136 ;

    // Calculate the change in y (dy)
    var dy = ( -y + x * y - 1.479 * x * z + 0.44 ) * 0.136 ;

    // Calculate the change in z (dz)
    var dz = ( -z + 1.479 * x * y + x * z ) * 0.136 ;


    // Apply the calculated changes to update the state variables.
    x += dx ;
    y += dy ;
    z += dz ;


    // Return the updated coordinates.
    return { x : x , y : y , z : z } ;
  }


  // Define the number of steps/segments for the attractor path.
  var N = 7000 ;

  // Create a new Pre3d Path object to store the attractor's trajectory.
  var path = new Pre3d.Path( ) ;

  // Allocate memory for the path's points. Each curve uses 3 points (p0, p1, p2),
  // but due to shared points, N curves need N*2+1 unique points in a quadratic setup.
  path.points = new Array( N * 2 + 1 ) ;

  // Allocate memory for the path's curves. There are N curves.
  path.curves = new Array( N ) ;


  // Warm up the attractor by taking a few steps without recording them.
  // This prevents the initial points from being too close to the origin,
  // which would create an artificial "tail" from (0,0,0) to the attractor.
  for ( var i = 0 ; i < 10 ; ++i )
    step( ) ; // Simply advance the attractor's state.


  // Setup our initial point for path generation.
  // `p0` will hold the previous end point of a curve, which becomes the start of the next.
  var p0 = step( ) ;

  // The very last point in the path.points array is used as the starting point for the first curve.
  path.points[ path.points.length - 1 ] = p0 ;

  // Set the starting point index for the path.
  path.starting_point = path.points.length - 1 ;


  // Generate the attractor path by repeatedly stepping the system.
  for ( var i = 0 ; i < N ; ++i ) {

    // Create a new quadratic curve.
    // The curve uses points at indices i*2 and i*2+1, with a control point (null for quadratic fitting).
    path.curves[ i ] = new Pre3d.Curve( i * 2 , i * 2 + 1 , null ) ; // Quadratic curve.


    // Take two more steps to get the next two points (p1 and p2).
    var p1 = step( ) ;
    var p2 = step( ) ;

    // Fit a quadratic Bezier curve to the three points: p0 (start), p1 (intermediate), p2 (end).
    // The result is the control point for the quadratic curve.
    path.points[ i * 2 + 1 ] = Pre3d.PathUtils.fitQuadraticToPoints( p0 , p1 , p2 ) ;

    // The end point of the current curve (p2) is stored.
    path.points[ i * 2 ] = p2 ;

    // Update p0 to be the end point of the current curve, for the next iteration.
    p0 = p2 ;
  }


  // Define a colormap for selecting different foreground colors.
  var colormap = [
    { n : 'r' , c : new Pre3d.RGBA( 1 , 0 , 0 , 1 ) } , // Red color
    { n : 'g' , c : new Pre3d.RGBA( 0 , 1 , 0 , 1 ) } , // Green color
    { n : 'b' , c : new Pre3d.RGBA( 0 , 0 , 1 , 1 ) } , // Blue color
    { n : 'a' , c : new Pre3d.RGBA( 0 , 1 , 1 , 1 ) } , // Aqua color
    { n : 'y' , c : new Pre3d.RGBA( 1 , 1 , 0 , 1 ) } , // Yellow color
    { n : 'w' , c : new Pre3d.RGBA( 1 , 1 , 1 , 1 ) }   // White color
  ] ;


  // Set the initial foreground color to red.
  var fgcolor = new Pre3d.RGBA( 1 , 0 , 0 , 1 ) ;


  /**
   * Draws the current state of the scene.
   * Clears the background and redraws the attractor path with the current foreground color.
   */
  function draw( ) {

    // Set the background color to black (RGBA: 0,0,0,1).
    renderer.ctx.setFillColor( 0 , 0 , 0 , 1 ) ;

    // Draw the background, filling the canvas.
    renderer.drawBackground( ) ;


    // Set the stroke color for the path using the current foreground color.
    renderer.ctx.setStrokeColor( fgcolor.r , fgcolor.g , fgcolor.b , fgcolor.a ) ;

    // Draw the generated attractor path.
    renderer.drawPath( path ) ;
  }


  // Create a div element to hold the color selection links.
  var colordiv = document.createElement( 'div' ) ;

  // Add text indicating the purpose of the links.
  colordiv.appendChild( document.createTextNode( 'color \u2192 ' ) ) ;

  // Iterate through the colormap to create a link for each color.
  for ( var i = 0 , il = colormap.length ; i < il ; ++i ) {

    var cm = colormap[ i ] ; // Get the current color map entry.

    var a = document.createElement( 'a' ) ; // Create an anchor element.

    a.href = '#' ; // Set href to '#' to make it a clickable link.

    // Attach an onclick event handler using a closure to capture the current color.
    a.onclick = ( function ( c ) {
      return function ( ) {
        fgcolor = c.c ; // Update the global foreground color.
        draw( ) ;       // Redraw the scene with the new color.
        return false ;  // Prevent default link behavior (e.g., scrolling to top).
      }
    } ) ( cm ) ;

    // Add the color's name as the link text.
    a.appendChild( document.createTextNode( cm.n ) ) ;

    // Append the link to the color div.
    colordiv.appendChild( a ) ;
  }

  // Insert the color selection div at the beginning of the document body.
  document.body.insertBefore( colordiv , document.body.firstChild ) ;


  // Configure the camera's focal length for the renderer.
  renderer.camera.focal_length = 2.5 ;

  // Setup automatic camera control using DemoUtils.
  // Parameters: renderer, initial x/y/z rotation, target x/y/z, draw function.
  DemoUtils.autoCamera( renderer , 0 , 0 , -15 , 0 , -1.7 , 0 , draw ) ;


  // Perform an initial draw to render the attractor on load.
  draw( ) ;

} , false ) ; // End of window.addEventListener('load') callback.