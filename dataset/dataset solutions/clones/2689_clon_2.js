function executeProgram( rawData ) {
        /* This function orchestrates the main logic of the application. */
        let parsedInformation = rawData.split( "\n" )
                                       .map( function( textLine ) {
                                           return textLine.split( " " )
                                                          .map( function( numericValue ) {
                                                              return parseInt( numericValue, 10 );
                                                          } );
                                       } );

        const limitValue = parsedInformation[0][1];
        let sourceCollection = parsedInformation[1];

        let overallMaximum = findOverallMax( sourceCollection );
     
        let potentialGreatestCommon = Math.min( overallMaximum + limitValue, overallMaximum + calculateMaxDifference( sourceCollection ) );

        for ( let iteratorVar = potentialGreatestCommon; iteratorVar > 1; iteratorVar-- ) {
        	if ( checkDivisibility( iteratorVar, sourceCollection, limitValue ) ) {
        		return console.log( iteratorVar );
        	}
        }

        return console.log( 1 );
    }



    function calculateMaxDifference( inputCollection ) {
    	/* This routine determines a specific maximum difference based on sorting. */
    	let orderedCollection = [...inputCollection].sort( ( valA, valB ) => valA - valB );
    	let currentSumLeft = 0;
    	let currentSumRight = 0;
    	let rightPointer = orderedCollection.length - 1;

    	currentSumRight = orderedCollection[ rightPointer ];

    	for ( let leftPointer = 0; leftPointer < rightPointer; leftPointer++ ) {
    		currentSumLeft += orderedCollection[leftPointer]; // Sum elements from the left
    		if ( currentSumLeft <= currentSumRight ) {
    			continue;
    		} else {
    			rightPointer--;
    			while ( currentSumRight < currentSumLeft && rightPointer > leftPointer ) {
    				currentSumRight += orderedCollection[ rightPointer ];
    				rightPointer--;
    			}
    		}
    	}

    	return Math.min( currentSumLeft, currentSumRight );
    }



    function findOverallMax( inputArray ) {
    	/* Finds the largest element in an array. */
    	return inputArray.reduce( function( accumulator, currentElement ) {
            return Math.max( accumulator, currentElement );
        } );
    }



    function totalSummation( valueArray ) {
    	/* Computes the total sum of all elements. */
    	return valueArray.reduce( function( runningTotal, itemValue ) {
            return runningTotal + itemValue;
        }, 0 );
    }



    function checkDivisibility( divisorCandidate, originalNumbers, toleranceBudget ) {
    	/* Checks if a number is a potential divisor given a budget. */
    	let remainderPairs = [];
    	let remainingBudget = 2 * toleranceBudget;

    	for ( let indexCounter = 0; indexCounter < originalNumbers.length; indexCounter++ ) {
    		let firstRemainder = originalNumbers[ indexCounter ] % divisorCandidate;
    		if ( firstRemainder === 0 ) continue;
    		let secondRemainder = divisorCandidate - firstRemainder;

    		if ( toleranceBudget < Math.min( firstRemainder, secondRemainder ) ) return false;

    		remainingBudget -= Math.min( firstRemainder, secondRemainder );
    		if ( remainingBudget < 0 ) return false;

    		remainderPairs.push( [ firstRemainder, secondRemainder ] );
    	}

    	return explorePaths( remainderPairs, 0, 0, 0, toleranceBudget );
    }



    function explorePaths( remainderData, currentDepth, accumulatedLeftCost, accumulatedRightCost, allowedBudget ) {
    	/* Recursively explores paths to balance costs within a budget. */
    	if ( accumulatedLeftCost > allowedBudget ) {
            return false;
        }

    	if ( accumulatedRightCost > allowedBudget ) {
            return false;
        }

    	if ( currentDepth === remainderData.length ) {
            return accumulatedLeftCost === accumulatedRightCost;
        }

    	if ( accumulatedLeftCost < accumulatedRightCost ) {
    		return attemptLeftBranch( remainderData, currentDepth, accumulatedLeftCost, accumulatedRightCost, allowedBudget ) ||
                   attemptRightBranch( remainderData, currentDepth, accumulatedLeftCost, accumulatedRightCost, allowedBudget );
    	} else {
    		return attemptRightBranch( remainderData, currentDepth, accumulatedLeftCost, accumulatedRightCost, allowedBudget ) ||
                   attemptLeftBranch( remainderData, currentDepth, accumulatedLeftCost, accumulatedRightCost, allowedBudget );
    	}

    }



    function attemptLeftBranch( pathData, currentLevel, currentLeftSum, currentRightSum, totalBudget ) {
    	/* Attempts to follow the left branch in the recursive path exploration. */
    	return explorePaths( pathData, currentLevel + 1, currentLeftSum + pathData[ currentLevel ][ 0 ], currentRightSum, totalBudget );
    }



    function attemptRightBranch( pathInput, currentPathLevel, pathLeftCost, pathRightCost, pathBudget ) {
    	/* Attempts to follow the right branch in the recursive path exploration. */
    	return explorePaths( pathInput, currentPathLevel + 1, pathLeftCost, pathRightCost + pathInput[ currentPathLevel ][ 1 ], pathBudget );
    }



    executeProgram( require('fs').readFileSync('/dev/stdin', 'utf8') );