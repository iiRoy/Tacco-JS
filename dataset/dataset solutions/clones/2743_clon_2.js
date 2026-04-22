function ProcessInputData( rawData )
{

	rawData = rawData .split( "\n" ) ;

	const totalElements = parseInt ( rawData [ 0 ] )
	const valueSequence = rawData .slice( 1 ) .map( ( itemVal ) => parseInt( itemVal ) )

	var categoryMap = new Map() ;
	categoryMap. set( 0 , valueSequence[ 0 ] ) ;

	var currentCategoryIndex = 0 ;

	for ( let outerLoopCounter = 1 ; outerLoopCounter < totalElements ; outerLoopCounter ++ )
	{
		var targetCategoryIndex = null ;
		var categoryEntries = [ ...categoryMap.entries() ] ;

		for ( let innerLoopCounter = 0 ; innerLoopCounter <= currentCategoryIndex ; innerLoopCounter ++ )
		{
			if ( categoryEntries[ innerLoopCounter ] [ 1 ] < valueSequence [ outerLoopCounter ] )
			{
				targetCategoryIndex = categoryEntries [ innerLoopCounter ] [ 0 ] ;
				break ;
			}
		}

		if ( targetCategoryIndex === null )
		{
			currentCategoryIndex ++ ;
			categoryMap .set ( currentCategoryIndex , valueSequence [ outerLoopCounter ] ) ;
		}
		else
		{
			categoryMap .set ( targetCategoryIndex , valueSequence [ outerLoopCounter ] ) ;
		}


		categoryMap = new Map (
			[ ...categoryMap .entries() ]
				.sort( ( entryA , entryB ) => entryB[ 1 ] - entryA[ 1 ] )
		) ;
	}

	console .log( currentCategoryIndex + 1 ) ;
}

ProcessInputData ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;