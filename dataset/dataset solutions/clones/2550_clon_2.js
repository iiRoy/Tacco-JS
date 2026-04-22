// The entire incoming dataset is stored in the entry_data for processing.
function primary_processor( entry_data )
{
	switch ( entry_data[0] )
	{
		case 'Clear':
			process.stdout.write( 'Overcast' );
			break ;

		case 'Overcast':
			process.stdout.write( 'Wet' );
			break  ;

		case 'Wet':
			process.stdout.write( 'Clear' );
			break;
	}
}

// *Do not alter anything below this line (reads from standard input/output and invokes the primary_processor).
primary_processor( require("fs").readFileSync("/dev/stdin", "utf8") );