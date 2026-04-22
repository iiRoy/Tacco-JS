'use strict' ; // Enforce strict mode for better error handling.

/*
 * This section defines Angular directives.
 * It's part of the 'myApp' module.
 */
var app = angular .module ( 'myApp' ) ;


// This directive integrates the Bootstrap Colorpicker widget.
// More details can be found at:
// http://www.eyecon.ro/bootstrap-colorpicker/
app . directive ( 'colorpicker' , function ( ) {

  // The directive definition object.
  return {
    require : '?ngModel' , // Optionally require ngModel to interact with the form.

    link : function ( scope , element , attrs , controller ) {
      // This variable will hold a function to update the model.
      var updateModel ;

      // Check if a controller (ngModel) is present.
      if ( controller != null ) {

        // Define the function to update the model value.
        updateModel = function ( value ) {
          return scope . $apply ( function ( ) {
            return controller . $setViewValue ( value ) ;
          } ) ;
        } ;

        // Override the $render function from ngModel.
        // This function is called when the model value changes programmatically.
        controller . $render = function ( ) {
          // Set the color picker's color and bind to its change event.
          return element . colorpicker ( "setColor" , controller . $viewValue ) . on ( 'changeColor' , function ( e ) {
            // If updateModel is defined, call it with the new color.
            if ( updateModel ) updateModel ( e . color . toHex ( ) ) ;
          } ) ;
        } ;
      }

      // Initialize the colorpicker on the element.
      // Also, bind to the 'changeColor' event to update the model directly
      // if ngModel is not present, or as a fallback.
      return element . colorpicker ( ) . on ( 'changeColor' , function ( e ) {
        // If the updateModel function exists, trigger it.
        if ( updateModel ) updateModel ( e . color . toHex ( ) ) ;
      } ) ;

    } // End of link function.
  } ; // End of return object.
} ) ; // End of app.directive definition.