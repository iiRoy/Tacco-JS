( function ( Handshake ) {
  // This immediately invoked function expression (IIFE) encapsulates the Handshake prototype methods.
  // It ensures that Handshake is passed as an argument, making it available within this scope.

  /**
   * Generates a universally unique identifier (UUID) string.
   * This implementation creates a UUID in the format "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
   * where 'x' is a random hexadecimal digit and 'y' is a random hexadecimal digit
   * from 8, 9, A, or B.
   */
  Handshake . prototype . Uuid = function ( ) {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" . replace ( / [xy] / g , function ( c ) {
                                      // Declare variables for random number and value
      var r , v ;

      r = Math . random ( ) * 16 | 0 ; // Generate a random number between 0 and 15 (inclusive)
      v = ( c === "x" ? r : ( r & 0x3 | 0x8 ) ) ; // Determine the value based on 'x' or 'y'

      // Convert the value to a hexadecimal string
      return v . toString ( 16 ) ;
    } ) ;
  } ;


  /**
   * Attempts to identify the currently executing script element.
   * This is typically the last script tag in the document at the time of execution.
   * @returns {HTMLScriptElement|undefined} The script element, or undefined if not found.
   */
  Handshake . prototype . CurrentlyExecutedScript = function ( ) {
    var script ; // Initialize a variable to hold the script element.

    // Check if the document object is available (e.g., not in a Node.js environment).
    if ( document )
    {
      // Get all script tags in the document.
      var scripts = document . getElementsByTagName ( 'script' ) ;

      // The last script tag is usually the one currently being executed.
      script = scripts [ scripts . length - 1 ] ;
    }

    return script ; // Return the identified script element.
  } ;


  /**
   * Inserts a new DOM node immediately after a reference node.
   *
   * @param {Node} reference_node - The node after which to insert the new node.
   * @param {Node} new_node       - The node to be inserted.
   * @returns {Node} The inserted node.
   */
  Handshake . prototype . InsertAfter = function ( reference_node , new_node ) {
    // Utilize the parentNode's insertBefore method, passing the nextSibling as the second argument.
    return reference_node . parentNode . insertBefore ( new_node , reference_node . nextSibling ) ;
  } ;


  /**
   * Checks if a DOM element has a specific CSS class.
   *
   * @param {HTMLElement} el   - The DOM element to check.
   * @param {string}      name - The class name to look for.
   * @returns {boolean} True if the element has the class, false otherwise.
   */
  Handshake . prototype . hasClass = function ( el , name ) {
    // Use a regular expression to match the class name, ensuring it's a whole word.
    return new RegExp ( '(\\s|^)' + name + '(\\s|$)' ) . test ( el . className ) ;
  } ;


  /**
   * Adds a CSS class to a DOM element if it doesn't already have it.
   *
   * @param {HTMLElement} el   - The DOM element to modify.
   * @param {string}      name - The class name to add.
   */
  Handshake . prototype . addClass = function ( el , name ) {
    // Only add the class if it's not already present.
    if ( ! this . hasClass ( el , name ) )
    {
      // Append the new class name, prepending a space if other classes exist.
      el . className += ( el . className ? ' ' : '' ) + name ;
    }
  } ;


  /**
   * Removes a specific CSS class from a DOM element.
   *
   * @param {HTMLElement} el   - The DOM element to modify.
   * @param {string}      name - The class name to remove.
   */
  Handshake . prototype . removeClass = function ( el , name ) {
    // Proceed only if the element actually has the class.
    if ( this . hasClass ( el , name ) )
    {
      // Replace the class name (with surrounding spaces) with a single space,
      // then trim leading/trailing spaces from the result.
      el . className = el . className . replace ( new RegExp ( '(\\s|^)' + name + '(\\s|$)' ) , ' ' ) . replace ( / ^\s+ | \s+$ / g , '' ) ;
    }
  } ;


  /**
   * Dispatches a custom event on a target element.
   *
   * @param {string}      name   - The name of the event.
   * @param {HTMLElement} target - The DOM element on which to dispatch the event.
   * @param {any}         data   - Custom data to attach to the event object.
   */
  Handshake . prototype . FireEvent = function ( name , target , data ) {
    // Create a new generic event object
    var bubbles = true ; // Event can bubble up the DOM tree
    var cancelable = true ; // Event can be cancelled
    var event = document . createEvent ( "Events" ) ;

    // Initialize the event with its type, bubbling, and cancelable properties
    event . initEvent ( name , bubbles , cancelable ) ;

    // Attach custom data to the event object
    event . data = data ;

    // Dispatch the event on the specified target
    target . dispatchEvent ( event ) ;
  } ;


  /**
   * Performs an asynchronous HTTP POST request.
   *
   * @param {string}   url      - The URL to send the request to.
   * @param {Object}   data     - The data object to send as JSON in the request body.
   * @param {Function} callback - A callback function to execute on successful response,
   *                              receiving the parsed JSON response.
   */
  Handshake . prototype . Post = function ( url , data , callback ) {
    var xmlhttp = new XMLHttpRequest ( ) ; // Create a new XMLHttpRequest object.

    xmlhttp . open ( "post" , url , true ) ; // Configure the request: POST method, URL, asynchronous.
    xmlhttp . setRequestHeader ( "Content-type" , "application/json" ) ; // Set content type header.

    // Define the event handler for state changes of the request.
    xmlhttp . onreadystatechange = function ( ) {
      // Check if the request is complete (readyState 4).
      if ( xmlhttp . readyState == 4 ) {
        // Check if the HTTP status is OK (200).
        if ( xmlhttp . status == 200 ) {
          // Parse the JSON response text and pass it to the callback.
          callback ( JSON . parse ( xmlhttp . responseText ) ) ;
        } else {
          // Log an error if the AJAX request failed.
          console . error ( "You found an ajax error. Please create an issue at http://github.com/scottmotte/handshake." ) ;
        }
      }
    } ;

    // Send the request with the data stringified as JSON.
    xmlhttp . send ( JSON . stringify ( data ) ) ;
  } ;


  /**
   * This is a duplicate definition of the FireEvent method.
   * It dispatches a custom event on a target element.
   *
   * @param {string}      name   - The name of the event to fire.
   * @param {HTMLElement} target - The DOM element that will be the target of the event.
   * @param {any}         data   - Any custom data to be included with the event.
   */
  Handshake . prototype . FireEvent = function ( name , target , data ) {
    // Create a basic generic event instance
    var bubbles = true ; // Should the event bubble up the DOM? Yes.
    var cancelable = true ; // Can the default action of the event be prevented? Yes.
    var event = document . createEvent ( "Events" ) ; // Create a new DOM event of type "Events"

    // Initialize the event with the given name, bubbling, and cancelable properties
    event . initEvent ( name , bubbles , cancelable ) ;

    // Assign custom data to a property of the event object
    event . data = data ;

    // Now, let's trigger the event on the specified target element!
    target . dispatchEvent ( event ) ;
  } ;

} ( Handshake ) ) ; // End of the immediately invoked function expression.