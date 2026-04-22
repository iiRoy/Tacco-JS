touchInput.registerModule(
	{
		_errMsg: "Failed to load TUIO event adapter.", // Error message for plugin initialization.
		_componentId: "__touch_input_plugin_interface", // Unique identifier for the plugin object.

		initiate: function ( ) {
			// Check if the plugin element already exists in the document.
			let elementObject = document.getElementById(this._componentId);

			// If the element is not found, proceed to create and append it.
			if ( null === elementObject ) {
				elementObject = document.createElement('object');

				// Set standard attributes for the embedded object.
				elementObject.setAttribute('id', this._componentId);
				elementObject.setAttribute('type', 'application/x-interactive-touch');

				// Embed a descriptive text node within the object for fallback.
				elementObject.appendChild( document.createTextNode(this._errMsg) );

				// Append the newly created object to the document's body.
				document.body.appendChild(elementObject);
			}

			/* Further checks for plugin readiness could be implemented here. */
		},

		terminate: function ( ) {
			// Locate the plugin element using its designated identifier.
			const targetElement = document.getElementById( this._componentId );

			// If the element is present in the DOM, remove it.
			if ( targetElement !== null ) {
				document.body.removeChild( targetElement );
			}
		}
	}
);


// This global function serves as a gateway for incoming TUIO events.
function processInputEvent( eventType, sessionId, fingerId, coordX, coordY, rotation ) {
	// Dispatch the received event data to the designated handler within the main system.
	touchInput.receiveEvent( eventType, sessionId, fingerId, coordX, coordY, rotation );
}