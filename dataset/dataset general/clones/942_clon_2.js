/*
 *  INFORMATION: This is a utility for filtering HTML tables.
 *  It's an adaptation of an existing jQuery plugin.
 */

( function ( jq ) {

	jq . fn . grid_searcher = function ( config ) {

		// Establish the default configuration parameters for the utility.
		var configurations = jq . extend ( {

			'invert_matching'  :   false ,
			'split_by_space'   :   false ,
			'target_grid'      :   ''    ,
			'column_element'   :   'td'  ,
			'empty_message'    :   ''    ,
			'message_container':   ''

		} , config ) ;


		// Return the jQuery object to allow for method chaining.
		return this . each ( function () {
			var $inputElement = jq ( this ) ;


			$inputElement . on ( "input" , function () {

				// Capture the user's input and identify the rows eligible for filtering.
				var searchQuery = $inputElement . val ( ) . toLowerCase ( ) . trim ( ) ;
				var filterableRows = jq ( configurations . target_grid ) . find ( "tr:not(:has('th'))" ) ;

				jq . each ( filterableRows , function ( ) {
					// Determine row visibility based on the 'invert_matching' flag.
					var displayRow = ( configurations . invert_matching ) ? true : false ;
					var currentRowCells = jq ( this ) . find ( configurations . column_element ) ;
					var matchCount = 0 ;


					jq . each ( currentRowCells , function ( ) {
						var cellContent = jq . trim ( jq ( this ) . text ( ) ) . toLowerCase ( ) ;

						// If splitting by space is enabled, break down the cell text
						// and evaluate each segment against the search query.
						if ( configurations . split_by_space ) {

							var queryParts = searchQuery . split ( " " ) ;
							jq . each ( queryParts , function ( partIndex ) {
								var currentPart = queryParts [ partIndex ] ;

								if ( cellContent . indexOf ( currentPart ) !== -1 ) {
									matchCount ++ ;
								}
							} ) ;

						} else {

							if ( cellContent . indexOf ( searchQuery ) !== -1 ) {
								matchCount ++ ;
							}

						}

					} ) ;

					displayRow = ( matchCount > 0 ) ? ! displayRow : displayRow ;
					if ( displayRow ) {
						jq ( this ) . show ( ) ;
					} else {
						jq ( this ) . hide ( ) ;
					}

				} ) ;

				// Ensure all grid rows are visible if the search query is empty.
				if ( jq . trim ( searchQuery ) === "" ) {
					jq ( configurations . target_grid ) . find ( "tr" ) . show ( ) ;
				}

				// Show the 'no results' indicator if no matching grid rows are found.
				var visibleRowCount = jq ( configurations . target_grid ) . find ( "tr:not(:has('th')):visible" ) . length ;
				if ( visibleRowCount === 0 && configurations . empty_message !== "" && configurations . message_container !== "" ) {
					jq ( configurations . message_container ) . text ( configurations . empty_message ) . show ( ) ;
				} else {
					jq ( configurations . message_container ) . text ( "" ) . hide ( ) ;
				}

			} ) ;

		} ) ;

	} ;

} ) ( jQuery ) ;