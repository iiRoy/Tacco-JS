const sourceContent = require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ;


let lineSegments = ( sourceContent .trim() ) .split( "\n" ) ;

while ( true )
{
	let gameMetrics = lineSegments.shift() .split( " " ) .map( Number ) ;

	if ( gameMetrics[0] === 0 && gameMetrics[1] === 0 )
	{
		break ;
	}

	let contestantsList = [ ] ;
	for ( let idx = 0 ; idx < gameMetrics[0] ; idx++ )
		contestantsList[idx] = idx + 1 ;

	let expectedSequence = [ ] ;
	for ( let loopCount = 0 ; loopCount < gameMetrics[1] ; loopCount++ )
	{
		let currentLine = lineSegments.shift( ) ;
		expectedSequence.push( currentLine ) ;
	}

	let roundNumber = 1 ;
	let activeContestantIndex = 0 ;

	expectedSequence.forEach( function ( expectedOutcome )
	{
		let calculatedOutcome = "" ;
		if ( roundNumber % 3 === 0 )
			calculatedOutcome += "Fizz" ;
		if ( roundNumber % 5 === 0 )
			calculatedOutcome += "Buzz" ;
		if ( calculatedOutcome === "" )
			calculatedOutcome = roundNumber ;

		if ( expectedOutcome != calculatedOutcome )
		{
			contestantsList.splice( activeContestantIndex , 1 ) ;
		}
		roundNumber++ ;
		activeContestantIndex++ ;
		if ( activeContestantIndex >= contestantsList.length )
			activeContestantIndex = 0 ;
	} ) ;

	console.log( contestantsList.join( " " ) ) ;
}