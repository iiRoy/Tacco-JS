( function ( CommChannel ) {

  /*
   * Generates a universally unique identifier string.
   * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   * @returns {string} The generated unique ID.
   */
  CommChannel.prototype.generateUniqueId = function ( ) {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
      .replace( / [xy] /g, function ( charMarker ) {
        var randomDigit, finalDigit;
        randomDigit = Math.random ( ) * 16 | 0;
        finalDigit  = ( charMarker === "x" ? randomDigit : randomDigit & 0x3 | 0x8 );
        return finalDigit.toString( 16 );
      } );
  };


  /*
   * Locates and returns the script element that is currently being executed.
   * This is typically the last script tag in the document.
   * @returns {HTMLScriptElement|undefined} The script element, or undefined if not found.
   */
  CommChannel.prototype.getExecutingScriptElement = function ( ) {
    var activeScriptElement;

    if ( document ) {
      var scriptCollection = document.getElementsByTagName( 'script' );
      activeScriptElement  = scriptCollection[ scriptCollection.length - 1 ];
    }
    return activeScriptElement;
  };


  /*
   * Inserts a new DOM node immediately after a specified reference node.
   * @param {Node} baseElement - The node after which to insert the new node.
   * @param {Node} newContentNode - The node to be inserted.
   * @returns {Node} The newly inserted node.
   */
  CommChannel.prototype.appendNodeAfter = function ( baseElement, newContentNode ) {
    return baseElement.parentNode.insertBefore( newContentNode, baseElement.nextSibling );
  };


  /*
   * Checks if a given DOM element possesses a specific CSS class name.
   * @param {HTMLElement} targetDomElement - The element to check.
   * @param {string} classIdentifier - The CSS class name to look for.
   * @returns {boolean} True if the element has the class, false otherwise.
   */
  CommChannel.prototype.hasClassName = function ( targetDomElement, classIdentifier ) {
    return new RegExp( '( \\s | ^ )' + classIdentifier + '( \\s | $ )' ).test( targetDomElement.className );
  };


  /*
   * Adds a CSS class name to a DOM element if it is not already present.
   * @param {HTMLElement} targetDomElement - The element to modify.
   * @param {string} classIdentifier - The CSS class name to add.
   */
  CommChannel.prototype.addCssClassName = function ( targetDomElement, classIdentifier ) {
    if ( !this.hasClassName( targetDomElement, classIdentifier ) ) {
      targetDomElement.className += ( targetDomElement.className ? ' ' : '' ) + classIdentifier;
    }
  };


  /*
   * Removes a specific CSS class name from a DOM element.
   * @param {HTMLElement} targetDomElement - The element to modify.
   * @param {string} classIdentifier - The CSS class name to remove.
   */
  CommChannel.prototype.removeCssClassName = function ( targetDomElement, classIdentifier ) {
    if ( this.hasClassName( targetDomElement, classIdentifier ) ) {
      targetDomElement.className = targetDomElement.className.replace( new RegExp( '( \\s | ^ )' + classIdentifier + '( \\s | $ )' ), ' ' ).replace( /^\\s+|\\s+$/g, '' );
    }
  };


  /*
   * Dispatches a custom event on a specified target element.
   * @param {string} eventLabel - The name of the event to dispatch.
   * @param {EventTarget} eventReceiver - The element on which to dispatch the event.
   * @param {any} eventPayload - Custom data to attach to the event.
   */
  CommChannel.prototype.dispatchCustomEvent = function ( eventLabel, eventReceiver, eventPayload ) {
    // Configuration for the custom event
    var canBubbleUp   = true;
    var isCancellable = true;
    var generatedEvent = document.createEvent( "Events" );
    // Initialize the event type and properties
    generatedEvent.initEvent( eventLabel, canBubbleUp, isCancellable );
    generatedEvent.data = eventPayload;
    // Trigger the event on the designated target
    eventReceiver.dispatchEvent( generatedEvent );
  };


  /*
   * Performs an asynchronous HTTP POST request.
   * @param {string} endpointUrl - The URL to send the request to.
   * @param {object} requestData - The data payload to send with the request.
   * @param {function(object): void} responseCallback - Callback function to handle the response.
   */
  CommChannel.prototype.sendHttpRequest = function ( endpointUrl, requestData, responseCallback ) {
    var ajaxRequest = new XMLHttpRequest( );
    ajaxRequest.open( "post", endpointUrl, true );
    ajaxRequest.setRequestHeader( "Content-type", "application/json" );
    ajaxRequest.onreadystatechange = function ( ) {
      if ( ajaxRequest.readyState === 4 ) {
        if ( ajaxRequest.status === 200 ) {
          responseCallback( JSON.parse( ajaxRequest.responseText ) );
        } else {
          console.error( "An issue with the asynchronous request was detected. Please report it at http://github.com/scottmotte/handshake." );
        }
      }
    };

    ajaxRequest.send( JSON.stringify( requestData ) );
  };


  /*
   * Dispatches a custom event on a specified target element. (Duplicate definition)
   * @param {string} eventLabel - The name of the event to dispatch.
   * @param {EventTarget} eventReceiver - The element on which to dispatch the event.
   * @param {any} eventPayload - Custom data to attach to the event.
   */
  CommChannel.prototype.dispatchCustomEvent = function ( eventLabel, eventReceiver, eventPayload ) {
    // Event propagation settings
    var canBubbleUp   = true;
    var isCancellable = true;
    var generatedEvent = document.createEvent( "Events" );
    // Prepare the event with its name and behavior
    generatedEvent.initEvent( eventLabel, canBubbleUp, isCancellable );
    generatedEvent.data = eventPayload;
    // Initiate the event on the target
    eventReceiver.dispatchEvent( generatedEvent );
  };

}( CommChannel ) );