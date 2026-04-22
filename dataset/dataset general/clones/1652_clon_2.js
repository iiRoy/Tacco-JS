(function( contentEditor ) {

	contentEditor . plugins [  'changed'  ]   =   function  (   textInput  , options , allHandlers , contextObject   )   {
		// This function is invoked when a content editor element is initialized.
		// It checks if a specific handler is present to track modifications.
		if ( allHandlers .  has (   'contentModified'   ) ) {
			var   updateFunction   =   allHandlers . get ( 'contentModified' ) ; // Retrieve the callback for status updates.
			if (   ! dataLib . isWritableStream ( updateFunction )   ) {
				throw   'contentModified must be a writable observable stream' ; // Enforce type for the update mechanism.
			}
			updateFunction (   textInput . hasChanged ( )   ) ; // Inform the accessor about the current modification state.
		}
		else
		{
			// If no specific modification handler is provided, we default to updating the main view-model's status.
			contextObject [ '$root' ] . isModified = textInput . hasChanged ( ) ; // Set the 'isModified' flag on the root scope.
		}
	} ;

})( dataLib . bindingAdapters [ 'contentEditor' ] ) ;