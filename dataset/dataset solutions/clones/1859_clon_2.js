let fileContent = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

function executeProgram( { dataStream, fetchData, booleanToText, calculateSummation, outputJson } ) {
    // Acquire the total node count and connection count from input
    const [nodeCount, edgeCount] = fetchData( 2 ) ;
    // Acquire the lists of start and end nodes for all connections
    const [startNodes, endNodes] = fetchData( edgeCount, 2 ) ;
    
    // Initialize an array to track parent connections for each node.
    // A value of 0 means unvisited, -1 means a special initial state for sentinel indices.
    const connectionMap = new Array ( nodeCount + 1 ) . fill ( 0 ) ;
    connectionMap [ 0 ] = -1 ; // Placeholder for index 0, not used for actual nodes
    connectionMap [ 1 ] = -1 ; // The starting node's parent is considered itself or a root

    // A queue for nodes pending processing in a breadth-first manner
    const pendingNodes = [ 1 ] ;
    while ( pendingNodes . length > 0 ) {
        safeguardLoopExecution ( ) ; // Prevents potential infinite loops

        const currentNode = pendingNodes . shift ( ) ; // Get the next node to process
        // Iterate through all available connections
        for ( let connectionIndex = 0 ; connectionIndex < edgeCount ; connectionIndex++ ) {
            let sourceNode = null ;
            let targetNode = null ;

            // Determine the direction of the connection relative to the currentNode
            if ( startNodes [ connectionIndex ] === currentNode ) {
                [ sourceNode, targetNode ] = [ endNodes [ connectionIndex ], startNodes [ connectionIndex ] ] ;
            }
            if ( endNodes [ connectionIndex ] === currentNode ) {
                [ sourceNode, targetNode ] = [ startNodes [ connectionIndex ], endNodes [ connectionIndex ] ] ;
            }
            // If this connection does not involve the currentNode, skip to the next
            if ( sourceNode === null ) continue ;

            // If the sourceNode has not been visited yet (its entry in connectionMap is 0)
            if ( ! connectionMap [ sourceNode ] ) {
                connectionMap [ sourceNode ] = targetNode ; // Record its parent (the node from which it was reached)
                pendingNodes . push ( sourceNode ) ; // Add this newly visited node to the queue
            }
        }
    }

    // After traversal, check if any node remains unvisited (value 0)
    if ( connectionMap . includes ( 0 ) ) return booleanToText ( false ) ;
    
    console . log ( booleanToText ( true ) ) ; // Output success message
    // Return the parent connections for actual nodes, formatted as newline-separated strings
    return connectionMap . slice ( 2 ) . join ( '\n' ) ;
}


// Optional: Mark the start of performance measurement
let parsedSegments = fileContent . split ( /[\s\n]/ ) ;
let loopSafetyCounter = 0 ; // Global counter for loop safeguarding
let programOutcome = executeProgram ( {
    dataStream: fileContent,
    // Utility to convert a boolean value to 'Yes' or 'No' string
    booleanToText: checkValue => checkValue ? 'Yes' : 'No',
    // Utility to calculate the sum of numbers in an array
    calculateSummation: numericArray => numericArray . reduce ( ( accumulator, currentElement ) => accumulator + currentElement, 0 ),
    // Utility function to load data from parsedSegments
    fetchData ( numRows = 1, numCols = 1, dataType = Number ) {
        const totalElements = numRows * numCols ;
        let fetchedData = parsedSegments . splice ( 0, totalElements ) ;
        // Convert elements to the specified data type, unless it's a String
        if ( dataType !== String ) fetchedData = fetchedData . map ( dataType ) ;
        
        // If multiple columns are specified, restructure into columnar arrays
        if ( numCols > 1 ) {
            const columnarArrays = new Array ( numCols ) ;
            for ( let columnIndex = 0 ; columnIndex < numCols ; columnIndex++ ) {
                columnarArrays [ columnIndex ] = new Array ( ) ;
                for ( let rowIndex = 0 ; rowIndex < numRows ; rowIndex++ ) {
                    columnarArrays [ columnIndex ] . push ( fetchedData [ rowIndex * numCols + columnIndex ] ) ;
                }
            }
            fetchedData = columnarArrays ;
        }
        return fetchedData ;
    },
    // Utility to output data as a JSON string to console
    outputJson ( dataPayload ) {
        console . log ( JSON . stringify ( dataPayload ) ) ;
    },
} ) ;

// Handle the program's final outcome
if ( programOutcome === undefined ) {
    console . warn ( "Program did not return a defined outcome." ) ;
} else {
    console . log ( programOutcome ) ;
}
// Optional: Mark the end of performance measurement


/**
 * Safeguards against infinite loops by incrementing a global counter
 * and throwing an error if a predefined limit is reached.
 * @param {number} limitValue - The maximum allowed iterations before an error is thrown.
 */
function safeguardLoopExecution ( limitValue = 100000 ) { // Default limit of 100,000 iterations
    loopSafetyCounter++ ;
    if ( loopSafetyCounter >= limitValue ) {
        throw new Error ( "Loop iteration limit exceeded, potential infinite loop detected." ) ;
    }
}

/**
 * Finds the maximum value within an array of numbers.
 * @param {Array<number>} numericArray - The array of numbers to search through.
 * @param {number|null} startingPoint - An optional initial value to compare against.
 * @returns {number} The maximum value found.
 */
function findMaximum ( numericArray, startingPoint = null ) {
    let computedValue = ( startingPoint === null ) ? numericArray [ 0 ] : startingPoint ;
    for ( const currentNum of numericArray ) {
        if ( currentNum > computedValue ) {
            computedValue = currentNum ;
        }
    }
    return computedValue ;
}

/**
 * Finds the minimum value within an array of numbers.
 * @param {Array<number>} numericArray - The array of numbers to search through.
 * @param {number|null} startingPoint - An optional initial value to compare against.
 * @returns {number} The minimum value found.
 */
function findMinimum ( numericArray, startingPoint = null ) {
    let computedValue = ( startingPoint === null ) ? numericArray [ 0 ] : startingPoint ;
    for ( const currentNum of numericArray ) {
        if ( currentNum < computedValue ) {
            computedValue = currentNum ;
        }
    }
    return computedValue ;
}

// Function to perform prime factorization on a given integer.
// Returns an object where keys are prime factors and values are their exponents.
function factorizeIntoPrimes ( inputNumber ) {
    const primeFactorsMap = { } ;

    // Iterate from 2 up to the square root of the number
    for ( let divisorCandidate = 2 ; divisorCandidate * divisorCandidate <= inputNumber ; divisorCandidate++ ) {
        if ( inputNumber % divisorCandidate === 0 ) {
            inputNumber /= divisorCandidate ;
            primeFactorsMap [ divisorCandidate ] = 1 ; // First occurrence of this prime factor
            
            // Continue dividing by the same prime factor until it's no longer a divisor
            while ( inputNumber % divisorCandidate === 0 ) {
                inputNumber /= divisorCandidate ;
                primeFactorsMap [ divisorCandidate ]++ ; // Increment the exponent for this prime factor
            }
        }
    }

    // If after all divisions, inputNumber is still greater than 1, it means the remaining inputNumber itself is a prime factor
    if ( inputNumber > 1 ) primeFactorsMap [ inputNumber ] = 1 ;

    return primeFactorsMap ;
}