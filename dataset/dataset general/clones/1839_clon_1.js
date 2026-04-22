/*
 * This JavaScript code initializes 3D perspective transformations
 * on a specified HTML element based on user input and mouse/touch interactions.
 */
$ ( function ( ) { // Start of the main document ready function, ensuring DOM is fully loaded.

  // Declare an object to store the current rotation values for X, Y, and Z axes.
  var xyz = { } ;

  /*
   * Initialize the 'xyz' object's properties (x, y, z)
   * by reading values from input fields with specific 'name' attributes.
   * If an input field's value is empty or not found, it defaults to 0.
   */
  xyz . x = $ ( "input[name=x_axis]" ) . val ( ) || 0 ; // X-axis rotation value
  xyz . y = $ ( "input[name=y_axis]" ) . val ( ) || 0 ; // Y-axis rotation value
  xyz . z = $ ( "input[name=z_axis]" ) . val ( ) || 0 ; // Z-axis rotation value


  // Apply the initial perspective transformation using the 'xyz' values.
  // This targets elements with the class 'perspective'.
  $ ( ".perspective" ) . css (
    {
      "-webkit-transform" : "rotateX(" + xyz.x + "deg) rotateY(" + xyz.y + "deg) rotateZ(" + xyz.z + "deg)" ,
      "-moz-transform" : "rotateX(" + xyz.x + "deg) rotateY(" + xyz.y + "deg) rotateZ(" + xyz.z + "deg)" ,
      "transform" : "rotateX(" + xyz.x + "deg) rotateY(" + xyz.y + "deg) rotateZ(" + xyz.z + "deg)"
    }
  ) ;


  // Attach a 'change' event listener to all input elements of type 'range'.
  // This allows users to dynamically adjust the perspective via sliders.
  $ ( "input[type=range]" ) . on ( "change" , function ( ) {

    // Determine which axis input triggered the change event.
    if ( $ ( this ) . attr ( "name" ) == "x_axis" ) {
      xyz . x = $ ( this ) . val ( ) ; // Update the X-axis value
    }
    else if ( $ ( this ) . attr ( "name" ) == "y_axis" ) {
      xyz . y = $ ( this ) . val ( ) ; // Update the Y-axis value
    }
    else if ( $ ( this ) . attr ( "name" ) == "z_axis" ) {
      xyz . z = $ ( this ) . val ( ) ; // Update the Z-axis value
    }

    // After updating the 'xyz' values, reapply the CSS transform to reflect the new state.
    $ ( ".perspective" ) . css (
      {
        "-webkit-transform" : "rotateX(" + xyz.x + "deg) rotateY(" + xyz.y + "deg) rotateZ(" + xyz.z + "deg)" ,
        "-moz-transform" : "rotateX(" + xyz.x + "deg) rotateY(" + xyz.y + "deg) rotateZ(" + xyz.z + "deg)" ,
        "transform" : "rotateX(" + xyz.x + "deg) rotateY(" + xyz.y + "deg) rotateZ(" + xyz.z + "deg)"
      }
    ) ;

  } ) ; // End of the 'change' event handler for range inputs.


  // Declare some additional variables. 'offset' is declared but not used in the provided code.
  var mvar = 0.01 ; // A multiplier variable, also unused in this specific snippet.

  var offset = 10 ; // An offset value, unused.


  /**
   * Bind a 'mousemove' and 'touchstart' event to the document body.
   * This creates an interactive effect where the perspective changes based
   * on the user's mouse or touch position on the screen.
   * @param {Event} e - The event object, containing mouse/touch coordinates.
   */
  $ ( "body" ) . bind ( "mousemove touchstart" , function ( e ) {
    // Calculate the center coordinates of the document viewport.
    var cx = $ ( document ) . width ( ) * 0.5 ;
    var cy = $ ( document ) . height ( ) * 0.5 ;

    // Get the current mouse or touch page coordinates.
    // It prioritizes e.pageX/e.pageY for mouse, then falls back to touch events.
    var ex = e . pageX || e . originalEvent . touches [ 0 ] . pageX ;
    var ey = e . pageY || e . originalEvent . touches [ 0 ] . pageY ;

    // Calculate new rotation values (xx, yy) based on the cursor's deviation
    // from the center of the screen.
    var xx = ( ( cy - ey ) / cy ) * 55 ; // X-axis rotation derived from Y-position
    var yy = ( ( cx - ex ) / cx ) * ( -50 ) ; // Y-axis rotation derived from X-position

    // Apply the new CSS transform. The Z-axis rotation (xyz.z) remains
    // controlled by the range input, not by mouse/touch movement.
    $ ( ".perspective" ) . css (
      {
        "-webkit-transform" : "rotateX(" + xx + "deg) rotateY(" + yy + "deg) rotateZ(" + xyz.z + "deg)" ,
        "-moz-transform" : "rotateX(" + xx + "deg) rotateY(" + yy + "deg) rotateZ(" + xyz.z + "deg)" ,
        "transform" : "rotateX(" + xx + "deg) rotateY(" + yy + "deg) rotateZ(" + xyz.z + "deg)"
      }
    ) ;
  } ) ; // End of mousemove/touchstart event handler.

} ) ; // End of the jQuery document ready function.