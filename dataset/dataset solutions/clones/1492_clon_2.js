function  ProcessInputData (  sourceTextContent  )
{
    // First, divide the entire input string into an array of lines.
    sourceTextContent = sourceTextContent.split( "\n" ) ;

    // Extract initial configuration values from the very first line.
    const [  totalElementsCount,  opQueryCount  ] = sourceTextContent[0].split( " " ) ;

    // Display the initially parsed values. Note: 'unassignedVar' is not defined here.
    console.log( totalElementsCount,  unassignedVar  ) ;


    // Immediate termination of execution. Any code below this 'return' is unreachable.
    return  ;


    // This section of code is unreachable due to the 'return' statement above.
    // It would have processed the input lines further, splitting each line.
    sourceTextContent = sourceTextContent.split( "\n" ) .map(  lineItem  =>  lineItem.split( " " )  ) ;


    // Convert the extracted numerical parameters into actual integers.
    const  numItemsParsed  =  ParseNumericString(  sourceTextContent[0][0]  ) ;
    const  numOperationsParsed  =  ParseNumericString(  sourceTextContent[0][1]  ) ;

    // Initialize a mutable character sequence.
    let  currentSequence  =  "" ;
    // Build the initial sequence by concatenating '1's.
    for  (  let  loopIterator  =  0  ;  loopIterator  <  numItemsParsed  ;  loopIterator++  )
    {
        currentSequence  +=  "1" ;
    }


    // Transform the sequence string into an array of individual characters.
    currentSequence  =  currentSequence.split( "" ) ;


    // Process each subsequent operation line from the input.
    for  (  let  operationIndex  =  1  ;  operationIndex  <  sourceTextContent.length  ;  operationIndex++  )
    {
        // Parse the specific parameters for the current operation.
        const  startIndex  =  ParseNumericString(  sourceTextContent[operationIndex][0]  )  -  1 ;
        const  endIndex  =  ParseNumericString(  sourceTextContent[operationIndex][1]  )  -  1 ;
        const  fillCharacter  =  sourceTextContent[operationIndex][2] ;

        // Generate a new sequence by applying the current operation's modification.
        let  processedArray  =  currentSequence.map(  (  elementValue,  positionIdx  )  =>  {
            // If the current element's position falls within the defined range...
            if  (  startIndex  <=  positionIdx  &&  positionIdx  <=  endIndex  )  {
                return  fillCharacter ; // ...replace it with the specified character.
            }
            return  elementValue ; // Otherwise, retain its original value.
        }  ) ;

        // Reconstruct the array of characters into a single string, then parse as an integer.
        processedArray  =  ParseNumericString(  processedArray.join( '' )  ) ;
        // Output the final result after applying a modulo operation.
        console.log(  processedArray  %  998244353  ) ;
    }
}


// Auxiliary function to convert a given string representation into an integer number.
function  ParseNumericString (  stringToConvert  )
{
    // The commented line below illustrates an alternative conversion method (BigInt).
    // return BigInt(stringToConvert);
    // Perform base-10 integer parsing.
    return  parseInt(  stringToConvert,  10  ) ;
}

// Initiate the entire process by reading data from the standard input stream.
ProcessInputData(  require( "fs" ).readFileSync( "/dev/stdin",  "utf8" )  ) ;