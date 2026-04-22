(function( rawInputData ) {
	var processedLines = rawInputData.replace( /\r/g, '' ).split( "\n" ),
		currentValue,
		remainderAmount,
		iterationCount;

	while (true)
	{
		iterationCount = 0;
		currentValue = parseInt( processedLines.shift() );
		if ( currentValue === 0 ) { break; }

		remainderAmount = 1000 - currentValue;

		while ( remainderAmount != 0 )
		{
			if ( remainderAmount % 500 == 0 ) { remainderAmount -= 500; }
			else if ( remainderAmount % 100 == 0 ) { remainderAmount -= 100; }
			else if ( remainderAmount % 50 == 0 ) { remainderAmount -= 50; }
			else if ( remainderAmount % 10 == 0 ) { remainderAmount -= 10; }
			else if ( remainderAmount % 5 == 0 ) { remainderAmount -= 5; }
			else if ( remainderAmount % 1 == 0 ) { remainderAmount -= 1; }
			iterationCount++;
		}
		console.log( iterationCount );
	}
})( require("fs").readFileSync("/dev/stdin", "utf8") );