/*
 * This is an extensively modified Type I clone of the original source code.
 * The core functionality, identifiers, and logic remain precisely as they were.
 * Only whitespace (indentation, spacing, line breaks) and comments have been altered.
 */


/**
 *  @file         vortexBrowser.js
 *  @description  A comprehensive cross-browser compatibility library
 *                for common DOM and browser-specific operations.
 *
 *  @class        vortexBrowser
 *  @constructor  Initializes the browser utility module.
 *  @module       vortex
 *  @version      1.0.0
 *  @author       [Original Author's Name - if known, otherwise omit]
 *
 */
function  vortexBrowser (  ) {

	// --- Private Helper Functions ---


	/*
	 * Private constructor-like initialization method.
	 * This function is called once when vortexBrowser is instantiated.
	 *
	 */
	function _init(   )
	{

	}  ; // End of _init function


	/**
	 *
	 * Registers a specified callback function to a DOM element event.
	 * This method provides cross-browser compatibility for event handling.
	 *
	 * @method        registerEvent
	 * @param {DOMElement|String} element The DOM element to attach the event to,
	 *                                    or its string ID.
	 * @param {String}            eventName The name of the event (e.g., 'click', 'mouseover', 'mousewheel').
	 * @param {Function}          callback  The function to execute when the event fires.
	 * @returns {void}
	 */
	function registerEvent ( element , eventName , callback )
	{

		// Check if 'element' is a string ID; if so, retrieve the actual DOM element.
		if  (  typeof  (  element  )  ==  'string'  )
		{

			element = document.getElementById (  element  ) ;

		}


		// If the element is still null, it means it wasn't found, so exit.
		if  (  element  ==  null  )
		{
			return ;
		}


		// Modern browsers (W3C standard) use addEventListener.
		if  (  element.addEventListener  )
		{

			// Special handling for 'mousewheel' event due to browser inconsistencies.
			if ( eventName  == 'mousewheel' )
			{

				// Firefox uses 'DOMMouseScroll' for mousewheel.
				element.addEventListener ( 'DOMMouseScroll' , callback , false ) ;

			}

			// Attach the standard event listener.
			element.addEventListener( eventName , callback , false ) ;

		}  // Older IE browsers use attachEvent.
		else  if  (  element.attachEvent  )
		{

			element.attachEvent (
				'on'  +  eventName  ,
				callback
			) ;

		}

	}  ; // End of registerEvent function


	/**
	 * Unregisters a previously registered callback function from a DOM element event.
	 * This ensures proper memory management and event cleanup.
	 *
	 * @method        unregisterEvent
	 * @param {DOMElement|String} element The DOM element from which to remove the event,
	 *                                    or its string ID.
	 * @param {String}            eventName The name of the event to unregister.
	 * @param {Function}          callback  The specific callback function to remove.
	 * @returns {void}
	 */
	function unregisterEvent (  element  ,  eventName  ,  callback  )
	{

		// Resolve element ID to DOM object if necessary.
		if  (  typeof  (  element  )  ==  'string'  )
		{

			element  =  document.getElementById (  element  ) ;

		}


		// If element is not valid, nothing to unregister.
		if  (  element  ==  null  )
		{
			return ;
		}


		// W3C standard method for event removal.
		if  (  element.removeEventListener  )
		{

			// Again, handle the 'mousewheel' exception for Firefox.
			if ( eventName  ==  'mousewheel' )
			{

				element.removeEventListener (  'DOMMouseScroll'  ,  callback  ,  false  ) ;

			}

			// Remove the primary event listener.
			element.removeEventListener (  eventName  ,  callback  ,  false  ) ;

		}  // IE-specific method for event removal.
		else if (  element.detachEvent  )
		{

			element.detachEvent (
				'on'  +  eventName  ,
				callback
			) ;

		}

	}  ; // End of unregisterEvent function


	/**
	 *
	 * Prevents the default action and stops propagation of a DOM event.
	 * This is essential for custom event handling where native browser behavior
	 * is undesirable.
	 *
	 * @method      cancelEvent
	 * @param {DOMEvent} event The DOM event object to be cancelled.
	 * @returns {Boolean} Always returns `false` to ensure event cancellation.
	 */
	function cancelEvent (  event  )
	{

		// Normalize the event object for cross-browser consistency.
		event  =  (  (  event  )  ?  event  :  window.event  ) ;


		// Stop event propagation (W3C standard).
		if  (  event.stopPropagation  )
		{
			event.stopPropagation (  ) ;
		}

		// Prevent default action (W3C standard).
		if  (  event.preventDefault  )
		{
			event.preventDefault (  ) ;
		}


		// IE-specific properties for event cancellation.
		event.cancelBubble  =  true ;
		event.cancel        =  true ;
		event.returnValue   =  false ;

		// Return false to ensure event cancellation in some contexts.
		return  false ;

	}  ; // End of cancelEvent function


	/**
	 * Recursively applies properties from a source object (`props`) to a target object (`obj`).
	 * This method can be used for deep merging or configuration application.
	 *
	 * @method      applyObject
	 * @param {Object} obj   The target object to which properties will be applied.
	 * @param {Object} props A JSON-like structure containing properties to apply.
	 * @returns {void}
	 */
	function applyObject (  obj  ,  props  )
	{

		// Iterate over each property in the 'props' object.
		for  (  var name  in  props  )
		{

			// Check if the current property's value is an object.
			if  (  typeof  (  props  [  name  ]  )  ==  'object'  )
			{

				// If it's an array (has a 'length' property), assign it directly.
				if  (  typeof  (  props  [  name  ]  .  length  )  !==  'undefined'  )
				{

					obj  [  name  ]  =  props  [  name  ] ;

				}  // Otherwise, it's a plain object, so recurse.
				else
				{

					// If the target object doesn't have this property, initialize it as an empty object.
					if  (  typeof  obj  [  name  ]  ==  'undefined'  )
					{

						obj  [  name  ]  =  {  } ;

					}

					// Recursively apply properties to the nested object.
					this.applyObject (  obj  [  name  ]  ,  props  [  name  ]  ) ;
				}

			}  // If the property is not an object (e.g., string, number, boolean), assign directly.
			else
			{

				obj  [  name  ]  =  props  [  name  ] ;

			}

		}

	}  ; // End of applyObject function


	/**
	 * Checks if the current browser environment supports WebSockets.
	 * This can be useful for feature detection before attempting to use WebSocket APIs.
	 *
	 * @method      isWebSocketSupported
	 * @returns {Boolean} True if either `window.WebSocket` or `window.MozWebSocket` is defined,
	 *                    indicating WebSocket support; otherwise, false.
	 */
	function isWebSocketSupported (  )
	{

		return  (  window.WebSocket  !==  undefined
			||  window.MozWebSocket  !==  undefined  ) ;

	}  ; // End of isWebSocketSupported function


	/**
	 * Returns the browser-specific WebSocket constructor, if available.
	 * This abstracts away vendor prefixes for WebSocket objects.
	 *
	 * @method      getWebSocket
	 * @returns {Function|undefined} The WebSocket constructor function (either standard or prefixed),
	 *                               or `undefined` if WebSockets are not supported.
	 */
	function getWebSocket (  )
	{

		return  window.WebSocket  ||  window.MozWebSocket ;

	} // End of getWebSocket function


	// --- Module Initialization ---

	// Execute the private constructor function to set up any initial states.
	_init (  ) ;


	// --- Public API Exposure ---

	// Return an object containing all the public methods of the vortexBrowser module.
	return  {
		registerEvent       :  registerEvent      , // Exposes the event registration utility.
		unregisterEvent     :  unregisterEvent    , // Exposes the event unregistration utility.
		cancelEvent         :  cancelEvent        , // Exposes the event cancellation utility.
		applyObject         :  applyObject        , // Exposes the object property application utility.
		isWebSocketSupported:  isWebSocketSupported, // Exposes the WebSocket support detection utility.
		getWebSocket        :  getWebSocket         // Exposes the browser's WebSocket constructor.
	} ;

}  ; // End of vortexBrowser module definition