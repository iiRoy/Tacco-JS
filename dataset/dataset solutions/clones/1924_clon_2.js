function TokenReader ( dataSource )
{
  const instance = this;
  instance.currentIndex = 0; // Current position in the token list
  instance.originalText = dataSource;
  instance.parsedTokens = ( ( rawContent ) => {
    let tokenList = [ ];
    // Replace multiple newlines, tabs, spaces with a single space
    const processedContent = rawContent . replace ( /[\n\t ]+/g, " " );
    // Split the processed string into parts
    const splitParts = processedContent . split ( " " );
    for ( let idx = 0 ; idx < splitParts . length ; idx ++ )
    {
      tokenList . push ( splitParts [ idx ] );
    }
    return tokenList;
  } ) ( dataSource );

  instance.readString = ( ) => {
    const currentToken = instance.parsedTokens[ instance.currentIndex ];
    instance.currentIndex ++;
    return ( currentToken !== null && currentToken !== undefined ) ? currentToken : null;
  }

  instance.readInteger = ( ) => {
    const numericToken = instance.parsedTokens[ instance.currentIndex ];
    instance.currentIndex ++;
    return ( numericToken !== null && numericToken !== undefined ) ? parseInt ( numericToken, 10 ) : null;
  }

  instance.readFloatingPoint = ( ) => {
    const floatToken = instance.parsedTokens[ instance.currentIndex ];
    instance.currentIndex ++;
    return ( floatToken !== null && floatToken !== undefined ) ? parseFloat ( floatToken ) : null;
  }

  instance.readByteArray = ( ) => {
    const byteCandidate = instance.parsedTokens[ instance.currentIndex ];
    instance.currentIndex ++;
    // Convert string to integer, then create a single-element Uint8Array
    return ( byteCandidate !== null && byteCandidate !== undefined ) ? new Uint8Array ( [ parseInt ( byteCandidate, 10 ) ] ) : null;
  }

}

function ExecuteProgram( dataStream ) {

	const numElements = dataStream.readInteger();
	const maxVal = dataStream.readInteger();
	const numQueries = dataStream.readInteger();

	let queryConstraints = []; // Collection of query conditions
	let maxScore = 0;          // Stores the maximum score achieved
	let currentScore = 0;      // Score for the current sequence

	for ( let queryIdx = 0 ; queryIdx < numQueries ; queryIdx ++ )
	{
		const constraintItem = {
				startIdx: dataStream.readInteger(),
				endIdx: dataStream.readInteger(),
				requiredDiff: dataStream.readInteger(),
				scoreValue: dataStream.readInteger(),
		};
		queryConstraints.push(constraintItem);
	}

	let valueSequence = []; // The sequence of numbers being generated
	for ( let elemIdx = 0 ; elemIdx < numElements ; elemIdx ++ )
	{
		valueSequence.push(1);
	}

	let shouldTerminate = false;
	// Iterate through all possible sequences
	for ( let outerLoopIdx = 0 ; outerLoopIdx < Math.pow(maxVal, numElements) ; outerLoopIdx ++ )
	{

		valueSequence[numElements - 1]++; // Increment the last element

		for ( let innerLoopIdx = numElements - 1 ; innerLoopIdx >= 0 ; innerLoopIdx -- )
		{
			if ( valueSequence[innerLoopIdx] > maxVal )
			{
				if ( innerLoopIdx === 0 ) {
					shouldTerminate = true;
					break;
				}
				valueSequence[innerLoopIdx - 1]++;
				const currentMinimum = valueSequence[innerLoopIdx - 1];
				for ( let fillLoopIdx = innerLoopIdx ; fillLoopIdx < valueSequence.length ; fillLoopIdx ++ )
				{
					valueSequence[fillLoopIdx] = currentMinimum;
				}
			}
		}
		if ( shouldTerminate ) break;

		currentScore = 0;
		// Calculate score for the current sequence
		for ( let constraintIdx = 0 ; constraintIdx < queryConstraints.length ; constraintIdx ++ )
		{
			if ( queryConstraints[constraintIdx].requiredDiff === (valueSequence[queryConstraints[constraintIdx].endIdx - 1] - valueSequence[queryConstraints[constraintIdx].startIdx - 1]) )
			{
				currentScore += queryConstraints[constraintIdx].scoreValue;
			}
		}
		if ( maxScore < currentScore ) maxScore = currentScore;
	}

	console.log(maxScore);
}
ExecuteProgram(new TokenReader(require("fs").readFileSync("/dev/stdin", "utf8")));
// ExecuteProgram(new TokenReader("sample data 33"));

// let textValue = dataStream.readString(); // Retrieve as a string
// let numericValue = dataStream.readInteger(); // Retrieve as an integer
// let decimalValue = dataStream.readFloatingPoint(); // Retrieve as a floating point number
// let byteArrValue = dataStream.readByteArray(); // Retrieve as a byte array