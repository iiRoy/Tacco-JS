/*
 *  Module: DataCategorizer
 *  Purpose: To classify a given numeric input into specific categories.
 *  Author: CloneBot 3000
 */
function AnalyzeData ( sourceText )
{
	// Step 1: Prepare the incoming textual data for numerical processing.
	// This involves removing any extraneous whitespace and then
	// converting the cleaned string into a numerical format.
	// The Number() constructor provides a robust way to achieve this.
	let numericalMagnitude = Number( sourceText.trim() ) ;


	// Step 2: Apply a series of conditional checks to categorize
	// the determined numerical magnitude into one of several predefined bins.
	if  ( numericalMagnitude < 1200 )
	{
		// Output for magnitudes falling into the lowest tier.
		console.log( "ABC" ) ;
	}
	else  if  ( numericalMagnitude >= 1200  &&  numericalMagnitude < 2800 )
	{
		// Output for magnitudes within the intermediate range.
		console.log( "ARC" ) ;
	}
	else
	{
		// Output for magnitudes that exceed all other thresholds,
		// representing the highest tier.
		console.log( "AGC" ) ;
	}
}


// --- Program Entry Point ---
// This section handles the acquisition of raw input data
// and initiates the primary data analysis routine.
// The `fs` module is dynamically required to access file system operations.
AnalyzeData(  require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;