var n3 = window.n3 || { };
window.n3 = n3;
n3 . __namespace = true ;

( function ( $self , undefined ) {

  $self . version = "0.1.1" ; // Library version string.
  $self.debug = false; // Flag to enable or disable debugging features.
  $self . dispatch = d3 . dispatch ( 'render_start' , 'render_end' , 'update_graphs' ) ; // D3 event dispatcher instance.

  // This object stores various log variables and performance statistics collected during execution.
  $self.logs = { };

  // An array to hold references to all currently rendered graph objects.
  $self.graphs = [ ] ;

  // The primary logging function for the library. It outputs messages to the console if debugging is active.
  $self . log = function ( ) {

    // Check for debug mode and console.log availability with apply method.
    if ( $self . debug && console . log && console . log . apply ) {
      console . log . apply ( console , arguments ) ; // Use apply to pass all arguments to console.log.
    }
    // Alternative logging method using Function.prototype.bind for broader compatibility.
    else if ( $self . debug && console . log && Function . prototype . bind ) {
      var log = Function . prototype . bind . call ( console . log , console ) ; // Create a bound version of console.log.
      log . apply ( console , arguments ) ; // Call the bound function.
    }
    // Returns the last argument passed to the log function.
    return arguments [ arguments . length - 1 ] ;
  } ;

  // Initiates the rendering process, managing callbacks and dispatching events.
  // @param {Number} step: Determines how many items are processed in each iteration of the rendering loop.
  $self . render = function render ( step ) {

    step = step || 1 ; // Default to processing 1 item per step if not specified.

    render . active = true ; // Mark the renderer as active.
    $self . dispatch . render_start ( ) ; // Dispatch an event indicating the start of rendering.

    setTimeout ( function ( ) {

      var chart , graph ; // Declare local variables for chart and graph.

      for ( var i = 0 ; i < step && ( graph = render . queue [ i ] ) ; i ++ ) {
        chart = graph . generate ( ) ; // Generate the chart from the graph object.
        $self . graphs . push ( chart ) ; // Add the generated chart to the list of active graphs.
      }

      render . queue . splice ( 0 , i ) ; // Remove processed items from the render queue.

      if ( render . queue . length ) {
        setTimeout ( arguments . callee , 0 ) ; // If more items are in the queue, schedule the next iteration.
      }
      else {
        $self . render . active = false ; // If the queue is empty, mark renderer as inactive.
        $self . dispatch . render_end ( ) ; // Dispatch an event indicating the end of rendering.
      }
    } , 0 ) ; // Schedule the rendering loop to run asynchronously.
  } ;

  $self . render . active = false ; // Initialize render activity status.
  $self . render . queue = [ ] ; // Initialize the queue for render tasks.

  // Adds a graph object or function to the rendering queue.
  // This function ensures that objects are properly formatted for the renderer.
  // @param {Object} obj: The object or function to be added to the queue.
  $self . addGraph = function ( obj ) {

    // If the first argument is a function, wrap it in an object with a 'generate' method.
    if ( typeof arguments [ 0 ] == typeof ( Function ) ) {
      obj = { generate : arguments [ 0 ] } ;
    }

    $self . render . queue . push ( obj ) ; // Add the object to the render queue.

    if ( ! $self . render . active ) {
      $self . render ( ) ; // If the renderer is not active, start it.
    }
  } ;

  // Customizes the window's onresize event to allow multiple callback functions.
  // @param {Function} fun: The function to execute when the window is resized.
  $self . windowResize = function ( fun ) {

    var _onresize = window . onresize ; // Store the original window.onresize handler.

    window . onresize = function ( e ) { // Override the window.onresize event.
      if ( typeof _onresize == 'function' ) {
        _onresize ( e ) ; // Execute the original handler if it was a function.
      }
      fun ( e ) ; // Execute the provided custom function.
    } ;
  } ;

  // Internal initialization function for setting up event listeners, primarily for debugging.
  function init ( ) {

    // These event listeners are only enabled when debug mode is active.
    if ( $self . debug ) {

      $self . dispatch . on ( 'render_start' , function ( e ) {
        $self . logs . startTime = + new Date ( ) ; // Record the start time of rendering.
      } ) ;

      $self . dispatch . on ( 'render_end' , function ( e ) {
        $self . logs . endTime = + new Date ( ) ; // Record the end time of rendering.
        $self . logs . totalTime = $self . logs . endTime - $self . logs . startTime ; // Calculate total rendering time.
        $self . log ( 'total' , $self . logs . totalTime , 'ms' ) ; // Log the total rendering time.
      } ) ;
    }

    // Listener for 'update_graphs' event, which triggers a redraw of all active graphs.
    $self . dispatch . on ( 'update_graphs' , function ( e ) {
      for ( var i = 0 ; i < $self . graphs . length ; i ++ ) {
        $self . graphs [ i ] . container . call ( $self . graphs [ i ] ) ; // Redraw each graph by calling its container.
      } ;
    } ) ;

    // Register a resize handler that dispatches an 'update_graphs' event.
    $self . windowResize ( function ( ) {
      $self . dispatch . update_graphs ( ) ; // Trigger graph updates on window resize.
    } ) ;
  }

  init ( ) ; // Execute the initialization function when the script loads.

} ( n3 ) ) ;