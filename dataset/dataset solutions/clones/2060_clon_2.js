'use strict';

const executeProgram = ( inputData ) => {

	const producePathEncodings = ( startString, endString ) => {
		const targetOneCount = ( startString.match(/1/g) || [ ] ).length;
		let lowerBound = parseInt( startString, 2 );
		let upperBound = parseInt( endString, 2 );
		const pathEncodings = [ ];

		for ( let currentValue = lowerBound; currentValue <= upperBound; currentValue++ ) {
			let currentBinaryString = ( currentValue ).toString( 2 );
			// Confirm the current binary string has the correct number of '1' bits
			if ( targetOneCount !== ( currentBinaryString.match(/1/g) || [ ] ).length ) {
				continue;
			}
			// Prepend zero padding to match the required string length
			let paddingZeros = [ ...Array( endString.length - currentBinaryString.length ) ].map( item => "0" ).join( "" );
			pathEncodings.push( paddingZeros + currentBinaryString );
		}

		return pathEncodings;
	};


	const processedLines = inputData.trim().split("\n");
	const dimensions = processedLines[0].split(" ").map( cellValue => parseInt( cellValue, 10 ) ); // [mapHeight, mapWidth] starting from 1
	const obstacleMap = processedLines.slice(1).filter( ( lineContent, lineIndex ) => lineIndex < dimensions[0] ).map( ( currentRow, rowIndex ) => {
		// '1' for an open path, '0' for a blocked wall
		return ( currentRow.split("").filter( ( charValue, charIndex ) => charIndex < dimensions[1] ).map( gridChar => gridChar === "." ? 1 : 0 ) );
	} );

	let leastBlockedCells;
	const targetHeightIndex = dimensions[0] - 1;
	const targetWidthIndex = dimensions[1] - 1;

	let shortestPathEncoding = [ ...Array( targetWidthIndex ) ].map( _ => "0" ).join( "" ) + [ ...Array( targetHeightIndex ) ].map( _ => "1" ).join( "" );
	let longestPathEncoding = [ ...Array( targetHeightIndex ) ].map( _ => "1" ).join( "" ) + [ ...Array( targetWidthIndex ) ].map( _ => "0" ).join( "" );

	const possibleRoutes = producePathEncodings( shortestPathEncoding, longestPathEncoding );
	possibleRoutes.forEach( ( pathEncoding, encodingIndex ) => {
		const individualSteps = pathEncoding.split( "" );

		let blockedCells = 0;
		let currentXPosition = 0;
		let currentYPosition = 0;
		// Examine the initial cell for any obstacles
		if ( obstacleMap[ currentYPosition ][ currentXPosition ] === 0 ) {
			blockedCells++;
		}
		individualSteps.forEach( stepDirection => {
			// '1' signifies a downward movement (Y coordinate increases), '0' signifies a rightward movement (X coordinate increases)
			if ( stepDirection === "1" ) {
				currentYPosition++;
			} else {
				currentXPosition++;
			}
			// After each move, check the new cell for obstacles
			if ( obstacleMap[ currentYPosition ][ currentXPosition ] === 0 ) {
				blockedCells++;
			}
		} );
		// Update the minimum obstacle count if the current path is more efficient
		if ( leastBlockedCells !== 0 && ( !leastBlockedCells || leastBlockedCells > blockedCells ) ) {
			leastBlockedCells = blockedCells;
		}
	} );

	console.log( leastBlockedCells );
};
executeProgram( require('fs').readFileSync('/dev/stdin', 'utf8') );