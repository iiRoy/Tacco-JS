function DataProcessor( sourceText ){
	this.allLines = sourceText.split( "\n" );
	this.currentLinePointer = 0;
}
DataProcessor.prototype = {
	pullToken: function( returnAsStr ) {
		let lineSet = this.allLines,
			pointer = this.currentLinePointer,
			itemResult;

		if ( typeof lineSet[ pointer ] === "string" ) {
			lineSet[ pointer ] = lineSet[ pointer ].split( " " ).reverse();
		}
		itemResult = lineSet[ pointer ].pop();

		if ( !lineSet[ pointer ].length ) {
			this.currentLinePointer++;
		}

		return returnAsStr ? itemResult : +itemResult;
	},

	fetchLine: function( asStrings ) {
		let parts = this.allLines[ this.currentLinePointer++ ].split( " " );

		return asStrings ? parts : parts.map( val => +val );
	},

	retrieveMultipleLines: function( quantity, keepStrings ) {
		let inputLines = this.allLines,
			startIdx = this.currentLinePointer,
			collectedItems = [],
			lineCounter = 0;

		if ( keepStrings ) {
			for ( ; lineCounter < quantity; lineCounter++ ) {
				collectedItems[ lineCounter ] = inputLines[ startIdx + lineCounter ].split( " " );
			}
		} else {
			for ( ; lineCounter < quantity; lineCounter++ ) {
				collectedItems[ lineCounter ] = inputLines[ startIdx + lineCounter ].split( " " ).map( item => +item );
			}
		}

		this.currentLinePointer += quantity;
		return collectedItems;
	},
};

var dataInput = new DataProcessor( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

console.log( computeOutcome() );
function computeOutcome() {
	var upperLimit = dataInput.pullToken();
	var targetValue = dataInput.pullToken();
	var factorPairs = {};

	for ( var potentialFactor = 1; potentialFactor * potentialFactor <= targetValue; potentialFactor++ ) {
		if ( targetValue % potentialFactor === 0 ) {
			factorPairs[ potentialFactor ] = targetValue / potentialFactor;
		}
	}

	var bestDivisor = 1;
	for ( var currentDivisor in factorPairs ) {
		if ( factorPairs[ currentDivisor ] >= upperLimit ) {
			if ( bestDivisor < +currentDivisor ) {
				bestDivisor = +currentDivisor;
			}
		}
	}
	return bestDivisor;
}