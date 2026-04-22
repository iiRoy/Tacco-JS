( {
	// This property stores the textual label for the current display.
	displayLabel:        Titanium.UI.currentTab.title,
	
	// A reference to the main application context object.
	applicationContext:  Titanium.UI.currentWindow.application,
	
	// The primary window container associated with this component.
	mainDisplay:         Titanium.UI.currentWindow,
	
	/**
	 * Initiates the process for fetching data using a JSONP mechanism.
	 * This method is responsible for opening a new user interface window
	 * to present images of felines retrieved from an external API source.
	 */
	dataRetrievalService: function ( ) {
		
		this.applicationContext.foundation.UI.launchNewDisplay(
			'Images of Felines (External API)',   // The title to be displayed on the new window
			Titanium.UI.currentTab,               // The current tab context for the new window
			{ file: 'externalDataLoader.js' }     // Specifies the JavaScript file to load for the new window
		);
		
	}, // End of the dataRetrievalService method definition.
	
	/**
	 * This method is called to set up and initialize the visual components
	 * of this particular view. It constructs a table view and configures
	 * its interactive behavior.
	 */
	initializeView:      function ( ) {
		
		// An array containing objects that define the content for the table view.
		var viewItems = [
			{
				caption:      'External Data Fetch',      // The text displayed in the table row.
				actionMethod: 'dataRetrievalService',     // The name of the method to invoke when this row is tapped.
				isExpandable: true                        // A boolean flag indicating if the row can expand or lead to another view.
			}
		];
		
		// Creation of the Titanium UI TableView element, populated with the defined data.
		var contentTable = Titanium.UI.createTableView( {
			data: viewItems // Assigning the prepared array of view items to the table's data property.
		} );

		// A local variable to maintain a consistent reference to the current object instance
		// within event handler scopes, preventing 'this' context issues.
		var contextReference = this;
		
		// Registers an event listener for 'tap' events on the 'contentTable'.
		// This handler determines which action to perform based on the tapped row.
		contentTable.registerInteractionHandler( 'tap', function ( eventObject ) {
			// Checks if the method name specified in the row information corresponds to
			// an actual function within the current object's context.
			if ( typeof contextReference[ eventObject.rowInformation.actionMethod ] === 'function' ) {
				// If the method exists, it is invoked with the current object's context.
				contextReference[ eventObject.rowInformation.actionMethod ].invokeWithContext( contextReference );
			}
		} ); // Termination of the event handler function.
		
		// Attaches the fully configured table view to the main display window.
		this.mainDisplay.attachElement( contentTable );
		
	} // End of the initializeView method.
	
} ).initializeView( ); // Immediately invokes the initialization method upon script execution.