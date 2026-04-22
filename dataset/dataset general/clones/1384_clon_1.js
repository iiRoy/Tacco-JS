$(   window   ) .  load ( function ( )  {
  /*
   * This is the main initialization function for the interactive
   * solar system visualization. It runs once the entire window
   * has finished loading all its resources.
   */

  // Declare core DOM elements as jQuery objects for easy manipulation.
  // Using multiple variable declarations on one line for brevity initially.
  var body = $( "body" ) ,
      universe = $( "#universe" ) ,
      solarsys = $( "#solar-system" );


  // Define the 'init' function to set up the initial 3D view and UI.
  var init = function ( ) {
    /*
     * The `init` function orchestrates the initial visual state
     * of the application. It transitions from a 2D opening view
     * to a 3D view, and then prepares the UI.
     */
    body
      .  removeClass ( 'view-2D opening' )
      .  addClass ( "view-3D" ) // Transition to 3D view.
      .  delay ( 2000 ) // Wait for 2 seconds for the transition animation.
      .  queue ( function ( ) {
        // After delay, remove 'hide-UI' and add 'set-speed' class.
        $ ( this ) . removeClass ( 'hide-UI' ) . addClass ( "set-speed" ) ;
        $ ( this ) . dequeue ( ) ; // Continue the jQuery queue.
      } );
  }; // End of init function definition.


  // Helper function to set the current view class on the universe container.
  var setView = function ( view ) {
    universe . removeClass ( ) . addClass ( view ) ;
  } ; /* This function dynamically updates the visual style
          of the solar system based on the provided view class. */


  // Event handler for toggling data display.
  $( "#toggle-data" ) . click ( function ( e ) {
    // Toggles between 'data-open' and 'data-close' classes on the body.
    body . toggleClass ( "data-open data-close" ) ;
    e . preventDefault ( ) ; // Prevent default anchor click behavior.
  } ) ;


  // Event handler for toggling controls display.
  $( "#toggle-controls" ) . click ( function ( e ) {
    // Toggles between 'controls-open' and 'controls-close' classes.
    body . toggleClass ( "controls-open controls-close" ) ;
    e . preventDefault ( ) ; // Stop the default action of the event.
  } ) ;


  // Event handler for navigation links within the data section.
  $( "#data a" ) . click ( function ( e ) {

    var ref = $( this ) . attr ( "class" ) ; /* Get the class attribute
                                                of the clicked anchor. */
    solarsys . removeClass ( ) . addClass ( ref ) ; // Apply the class to the solar system.

    // Remove 'active' class from all sibling 'a' elements and add it to the clicked one.
    $( this ) . parent ( ) . find ( 'a' ) . removeClass ( 'active' ) ;
    $( this ) . addClass ( 'active' ) ;

    e . preventDefault ( ) ; // Prevent the browser from navigating.
  } ) ;


  // Click handlers for various view and zoom settings.
  // These handlers use the toggleClass method to switch between states.
  $( ".set-view" ) . click ( function ( ) {
    body . toggleClass ( "view-3D view-2D" ) ;
  } ) ;

  $( ".set-zoom" ) . click ( function ( ) {
    body . toggleClass ( "zoom-large zoom-close" ) ;
  } ) ;


  // Set speed view.
  $( ".set-speed" ) . click ( function ( ) {
    setView ( "scale-stretched set-speed" ) ;
  } ) ;

  // Set size view.
  $( ".set-size" ) . click ( function ( ) {
    setView ( "scale-s set-size" ) ;
  } ) ;

  // Set distance view.
  $( ".set-distance" ) . click ( function ( ) {
    setView ( "scale-d set-distance" ) ;
  } ) ;


  // Call the initialization function to start the application.
  init ( ) ;

} ) ; // End of the main window load function.