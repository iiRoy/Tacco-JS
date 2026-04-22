/*
 *  This JavaScript file implements the 'centering' plugin for the freewall library.
 *  It was originally developed by Minh Nguyen.
 *  The purpose of this plugin is to ensure that the grid layout is
 *  always horizontally centered within its designated container element.
 */

freewall . createPlugin (
	{
		centering : function ( setting , container )
		{
			// Obtain the runtime object from the provided settings.
			var runtime = setting . runtime ;

			// Register a custom event handler that will be triggered when the grid is arranged.
			this . addCustomEvent ( "onGridArrange" , function ( setting )
			{
				// Retrieve the declared width of the grid from the container's data attribute.
				// Multiplying by 1 ensures the value is treated as a number.
				var gridWidth = container . attr ( "data-wall-width" ) * 1 ;

				// Get the actual current width of the container element.
				var realWidth = container . width ( ) ;

				// Calculate the necessary left offset to center the grid.
				var offsetLeft = ( realWidth - gridWidth ) / 2 ;

				// Iterate over each block present in the runtime's collection of blocks.
				for ( var i in runtime . blocks )
				{
					// Access the current block being processed.
					var block = runtime . blocks [ i ] ;

					// If the block has a 'left' position defined (i.e., it's not null),
					// then adjust its horizontal position by adding the calculated offset.
					block . left != null && ( block . left += offsetLeft ) ;
				}
			} ) ; // End of the 'onGridArrange' event handler function.
		}
	}
) ; // End of the freewall plugin definition.