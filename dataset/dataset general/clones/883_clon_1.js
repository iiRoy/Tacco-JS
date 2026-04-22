( function ( ) { /* This is an immediately invoked function expression (IIFE)
                                 * It creates a private scope to prevent global variable pollution.
                                 */

  function Tractile( node , options ) { // Constructor function for the Tractile object.

    // Check if the constructor was called with 'new'.
    // If not, re-call it correctly to ensure 'this' refers to a new instance.
    if ( ! ( this instanceof Tractile ) )
    {
      if ( node.length ) { // If 'node' is an array-like collection (e.g., NodeList, jQuery object)
        Array . prototype . forEach . call ( node , function ( n ) { // Iterate over each element.
          new Tractile ( n , options ) ; // Recursively call Tractile for each node.
        } ) ;
      } else { // If 'node' is a single DOM element.
        new Tractile ( n , options ) ; // Call Tractile for the single node.
      }
    }
    else // 'this' is a Tractile instance, proceed with initialization.
    {

      // Define default CSS classes used for state management.
      this.klasses = {
        active  : 'is-active'   , // Class for the currently active element.
        previous: 'is-previous' // Class for the previously active element.
      } ;

      var userOptions = options || { } ; // Get user-provided options, or an empty object if none.

      var defaults = { // Default configuration settings.
        interval : 2000 // Default interval for slide transitions in milliseconds.
      } ;

      this.options = { } ; // Initialize the options object for this instance.

      // Merge default options with user-provided options.
      // User options take precedence if provided.
      for ( var x in defaults )
      {
        this.options [ x ] = userOptions [ x ] || defaults [ x ] ;
      }

      // Normalize the 'node' parameter to a raw DOM element.
      // Handles jQuery objects by extracting the first element.
      node = ( node instanceof jQuery ) ? node [ 0 ] : node ;

      // If the node has no children or fewer than two children,
      // there's nothing to slide, so exit early.
      if ( ! node.children || node.children.length < 2 ) {
        return ;
      }

      this.current = 0 ; // Initialize the index of the currently active element.

      this.elements = node.children ; // Store all child elements as the collection to slide.

      this.total = this.elements.length ; // Store the total number of elements.

      // Set up an interval to call the 'run' method periodically,
      // which handles the slide transitions.
      setInterval ( this.run.bind ( this ) , this.options.interval ) ;
    }

  } ; // End of Tractile constructor.

  // Add the 'run' method to the Tractile prototype.
  // This method contains the core logic for advancing the slider.
  Tractile.prototype.run = function ( ) {

    // Helper function to add a CSS class to an element.
    var addClass = function ( classname , element ) {
      var cn = element.className ; // Get the current class string.
      if ( cn.indexOf ( classname ) != -1 ) { // If the class is already present, do nothing.
        return ;
      }
      if ( cn !== '' ) { // If there are existing classes, prepend a space.
        classname = ' ' + classname ;
      }
      element.className = cn + classname ; // Append the new class.
    } ;

    // Helper function to remove a CSS class from an element.
    var removeClass = function ( classname , element ) {
      var cn = element.className ; // Get the current class string.
      // Use a regex to remove the class, ensuring whole word match and handling leading spaces.
      var rxp = new RegExp ( "\\s?\\b" + classname + "\\b" , "g" ) ;
      cn = cn.replace ( rxp , '' ) ; // Replace all occurrences.
      element.className = cn ; // Update the element's class string.
    } ;

    // Helper function to clear a specific class from all elements in the collection.
    // 'bind(this)' ensures 'this' inside 'clear' refers to the Tractile instance.
    var clear = function ( klass ) {
      if ( ! klass ) { // If no class is specified, do nothing.
        return ;
      }
      var len = this.total ; // Get the total number of elements.
      while ( len-- ) { // Loop backwards through all elements.
        removeClass ( klass , this.elements [ len ] ) ; // Remove the specified class.
      }
    } . bind ( this ) ;

    // Logic to update classes for the previous slide.
    // If there was a previous slide (i.e., not the first slide after a loop).
    if ( ( this.current - 1 ) >= 0 ) {
      removeClass ( this.klasses.previous , this.elements [ this.current - 1 ] ) ;
    }

    // Check if we are not at the last slide.
    if ( ( this.current + 1 ) < this.total ) {
      clear ( this.klasses.previous ) ; // Clear 'previous' class from all elements.
      removeClass ( this.klasses.active , this.elements [ this.current ] ) ; // Deactivate current.
      addClass ( this.klasses.previous , this.elements [ this.current ] ) ; // Make current element 'previous'.
      addClass ( this.klasses.active , this.elements [ this.current + 1 ] ) ; // Activate the next element.
      this.current ++ ; // Increment the current slide index.
    } else { // We are at the last slide, loop back to the beginning.
      this.current = 0 ; // Reset current index to 0 (first slide).
      clear ( this.klasses.active ) ; // Clear 'active' class from all elements.
      addClass ( this.klasses.previous , this.elements [ this.total - 1 ] ) ; // Make last element 'previous'.
      addClass ( this.klasses.active , this.elements [ this.current ] ) ; // Activate the first element.
    }

  } ; // End of Tractile.prototype.run.

  window.Tractile = Tractile ; // Expose Tractile constructor to the global window object.

} ) ( ) ; // Execute the IIFE.