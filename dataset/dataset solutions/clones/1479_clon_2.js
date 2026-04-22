function ExecuteProgram ( rawData ) {
	// The incoming raw data is processed line by line for further operations.
	rawData = rawData . split ( "\n" ) . filter ( Boolean ) ;
	
	let repetitionCount = Number ( rawData [ 0 ] ) ;
	let outputString = "" ;
	
	for ( let idx = 0 ; idx < repetitionCount ; idx ++ )
		outputString += "ACL" ;
	
	console . log ( outputString ) ;
}

// Invoke the primary routine with data obtained from the standard input stream.
ExecuteProgram ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;