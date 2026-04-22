let dataSource = require('fs').readFileSync('/dev/stdin', 'utf8') ;

let lineBuffer = dataSource.trim().split("\n") ;

while ( true )
{
	let currentLine = lineBuffer.shift() ; // Retrieve the next line of data

	if ( currentLine === "-1 -1 -1" )  // Check for the termination sequence
	{
		break ;
	}

	let scoreValues = currentLine.split(" ").map( Number ) ; // Parse scores from the line

	let midtermScore = scoreValues[0] ; // First score represents midterm points
	let finalScore   = scoreValues[1] ; // Second score represents final points
	let retakeScore  = scoreValues[2] ; // Third score represents retake points (if available)

	let finalGrade = "F" ; // Initialize the student's grade to 'F' by default

	// Evaluate the student's performance based on various criteria
	if ( ( midtermScore === -1 ) || ( finalScore === -1 ) )
	{
		finalGrade = "F" ; // If any primary score is missing, it's an automatic 'F'
	}
	else if ( ( midtermScore + finalScore ) >= 80 )
	{
		finalGrade = "A" ; // Excellent performance merits an 'A'
	}
	else if ( ( midtermScore + finalScore ) >= 65 )
	{
		finalGrade = "B" ; // Good performance merits a 'B'
	}
	else if ( ( midtermScore + finalScore ) >= 50 )
	{
		finalGrade = "C" ; // Average performance merits a 'C'
	}
	else if ( ( ( midtermScore + finalScore ) >= 30 ) && ( retakeScore >= 50 ) )
	{
		finalGrade = "C" ; // Borderline pass with a sufficient retake score
	}
	else if ( ( midtermScore + finalScore ) >= 30 )
	{
		finalGrade = "D" ; // Minimal pass merits a 'D'
	}

	console.log( finalGrade ) ; // Display the computed grade for the current student
}